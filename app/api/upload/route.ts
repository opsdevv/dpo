import { NextRequest, NextResponse } from 'next/server'

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333'
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || ''

/**
 * Generate a simple embedding vector using a hash-based approach
 * Note: In production, use a proper embedding service (OpenAI, DeepSeek, etc.)
 */
function generateSimpleEmbedding(text: string, dimensions: number = 384): number[] {
  // Create a deterministic embedding from the text
  const embedding: number[] = []
  const words = text.toLowerCase().split(/\s+/)
  
  if (words.length === 0 || (words.length === 1 && words[0] === '')) {
    return new Array(dimensions).fill(0)
  }

  for (let i = 0; i < dimensions; i++) {
    let sum = 0
    for (let j = 0; j < words.length; j++) {
      const charCode = words[j].split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      sum += Math.sin(charCode * (i + 1) + j) * 100
    }
    embedding.push(sum / words.length)
  }
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  if (magnitude === 0) return new Array(dimensions).fill(0)
  return embedding.map(val => val / magnitude)
}

/**
 * Ensure the knowledge_base collection exists in Qdrant
 */
async function ensureCollection() {
  try {
    console.log(`Checking Qdrant collection at ${QDRANT_URL}...`)
    // Check if collection exists
    const checkResponse = await fetch(`${QDRANT_URL}/collections/knowledge_base`, {
      headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json'
      },
      // Add a timeout to avoid hanging
      signal: AbortSignal.timeout(5000)
    }).catch(err => {
      throw new Error(`Could not connect to Qdrant at ${QDRANT_URL}: ${err.message}`)
    })

    if (checkResponse.ok) {
      return // Collection exists
    }

    if (checkResponse.status === 404) {
      console.log('Collection not found, creating knowledge_base...')
      // Create collection with 384-dimensional vectors
      const createResponse = await fetch(`${QDRANT_URL}/collections/knowledge_base`, {
        method: 'PUT',
        headers: {
          'api-key': QDRANT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vectors: {
            size: 384,
            distance: 'Cosine'
          }
        })
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.text()
        console.error('Failed to create collection:', errorData)
        throw new Error(`Failed to create Qdrant collection: ${createResponse.statusText} - ${errorData}`)
      }

      console.log('Created knowledge_base collection in Qdrant')
    } else {
      const errorData = await checkResponse.text()
      throw new Error(`Unexpected Qdrant response (${checkResponse.status}): ${errorData}`)
    }
  } catch (error) {
    console.error('Error ensuring collection:', error)
    throw error
  }
}

/**
 * Upload a document to Qdrant
 */
async function uploadToQdrant(doc: { id: string; title: string; text: string; source?: string; category?: string }) {
  const embedding = generateSimpleEmbedding(doc.text)

  const point = {
    id: doc.id,
    vector: embedding,
    payload: {
      title: doc.title,
      text: doc.text,
      source: doc.source || 'manual-upload',
      category: doc.category || 'general',
      timestamp: new Date().toISOString()
    }
  }

  const response = await fetch(`${QDRANT_URL}/collections/knowledge_base/points`, {
    method: 'PUT',
    headers: {
      'api-key': QDRANT_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ points: [point] })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Qdrant upload failed: ${errorText}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    let title = formData.get('title') as string || ''
    const source = formData.get('source') as string || 'manual-upload'
    const category = formData.get('category') as string || 'general'
    const text = formData.get('text') as string | null

    // Process file upload
    let content = text || ''

    if (file) {
      const fileContent = await file.text()
      content = fileContent
      if (!title || title === 'Untitled Document') {
        title = file.name.replace(/\.[^/.]+$/, '') // Remove extension
      }
    }

    if (!title) {
      title = 'Untitled Document'
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'No content provided. Upload a file or paste text.' },
        { status: 400 }
      )
    }

    // Ensure Qdrant collection exists
    try {
      await ensureCollection()
    } catch (err) {
      return NextResponse.json(
        { error: `Database Connection Error: ${err instanceof Error ? err.message : 'Unknown error'}. Please ensure Qdrant is running.` },
        { status: 500 }
      )
    }

    // Generate a unique ID (UUID format is required by Qdrant Cloud)
    const id = crypto.randomUUID()

    // Upload to Qdrant
    await uploadToQdrant({
      id,
      title,
      text: content,
      source,
      category
    })

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      id,
      title,
      size: content.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
