import { generateSimpleEmbedding } from './embeddings'

const PINECONE_API_KEY = process.env.PINECONE_API_KEY
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'knowledge-base'

/**
 * Get the host URL for the Pinecone index
 */
async function getIndexHost() {
  const response = await fetch(`https://api.pinecone.io/indexes/${PINECONE_INDEX}`, {
    headers: {
      'Api-Key': PINECONE_API_KEY!,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    if (response.status === 404) {
      // Index doesn't exist, we might need to create it
      // For now, throw error so the user knows to create it in the dashboard
      // or we can try to create it here.
      throw new Error(`Pinecone index "${PINECONE_INDEX}" not found. Please create it in your Pinecone dashboard with 384 dimensions.`)
    }
    const error = await response.text()
    throw new Error(`Failed to get Pinecone index info: ${error}`)
  }

  const data = await response.json()
  return data.host
}

export async function upsertToPinecone(doc: {
  id: string
  title: string
  text: string
  source?: string
  category?: string
  fileType?: string
  wordCount?: number
  extractionMethod?: string
}) {
  const host = await getIndexHost()
  const embedding = generateSimpleEmbedding(doc.text)

  const response = await fetch(`https://${host}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Api-Key': PINECONE_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vectors: [
        {
          id: doc.id,
          values: embedding,
          metadata: {
            title: doc.title,
            text: doc.text,
            source: doc.source || 'manual-upload',
            category: doc.category || 'general',
            fileType: doc.fileType || 'text',
            wordCount: doc.wordCount || 0,
            extractionMethod: doc.extractionMethod || 'direct-input',
            timestamp: new Date().toISOString()
          }
        }
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Pinecone upsert failed: ${error}`)
  }

  return response.json()
}

export async function searchPinecone(query: string, limit: number = 5) {
  try {
    const host = await getIndexHost()
    const vector = generateSimpleEmbedding(query)

    const response = await fetch(`https://${host}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vector: vector,
        topK: limit,
        includeMetadata: true
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Pinecone search failed: ${error}`)
      return []
    }

    const data = await response.json()
    // Map Pinecone response format to match what the chat API expects
    return (data.matches || []).map((match: any) => ({
      id: match.id,
      score: match.score,
      payload: match.metadata // Pinecone uses 'metadata' instead of 'payload'
    }))
  } catch (error) {
    console.error('Pinecone search error:', error)
    return []
  }
}
