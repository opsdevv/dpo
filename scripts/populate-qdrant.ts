/**
 * Script to populate Qdrant with sample documents
 * 
 * This is a template script showing how to add documents to your Qdrant collection.
 * In production, you'll want to:
 * 1. Load documents from your knowledge base
 * 2. Generate embeddings (using OpenAI, DeepSeek, or another service)
 * 3. Upsert to Qdrant with proper payload structure
 * 
 * Usage:
 * npx ts-node scripts/populate-qdrant.ts
 */

// @ts-ignore
import fetch from 'node-fetch'

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333'
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || ''

interface Document {
  id: number
  title: string
  content: string
  embedding?: number[]
}

// Sample documents to add to your knowledge base
const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: 1,
    title: 'Machine Learning Basics',
    content: `Machine learning is a subset of artificial intelligence that focuses on 
    building systems that can learn from data. It enables computers to identify patterns 
    in data and make decisions with minimal human intervention.`
  },
  {
    id: 2,
    title: 'Deep Learning',
    content: `Deep learning is a specialized subset of machine learning using neural 
    networks with multiple layers. These networks can learn complex patterns in large 
    amounts of unstructured data like images, text, and sound.`
  },
  {
    id: 3,
    title: 'Natural Language Processing',
    content: `NLP is a field of artificial intelligence focused on enabling computers 
    to understand, interpret, and generate human language in a meaningful way. It powers 
    chatbots, translation tools, and sentiment analysis systems.`
  },
  {
    id: 4,
    title: 'Computer Vision',
    content: `Computer vision enables machines to interpret and understand the visual 
    world using cameras and images. Applications include object detection, facial recognition, 
    medical imaging, and autonomous vehicles.`
  },
  {
    id: 5,
    title: 'Reinforcement Learning',
    content: `Reinforcement learning is a machine learning technique where an agent 
    learns through interaction with its environment, receiving rewards or penalties for 
    its actions. It powers game-playing AIs and robotics.`
  }
]

async function generateEmbedding(text: string): Promise<number[]> {
  /**
   * Replace this with your actual embedding service
   * Options:
   * 1. OpenAI Embeddings API
   * 2. DeepSeek Embeddings API
   * 3. Hugging Face Inference API
   * 4. Local embedding model (sentence-transformers)
   */
  
  // PLACEHOLDER: This returns a random embedding for demonstration
  // In production, use a real embedding service
  return Array(1536).fill(0).map(() => Math.random())
}

async function createQdrantCollection() {
  const response = await fetch(`${QDRANT_URL}/collections/knowledge_base`, {
    method: 'DELETE',
    headers: {
      'api-key': QDRANT_API_KEY,
      'Content-Type': 'application/json'
    }
  }).catch(() => null) // Ignore if collection doesn't exist

  const createResponse = await fetch(`${QDRANT_URL}/collections/knowledge_base`, {
    method: 'PUT',
    headers: {
      'api-key': QDRANT_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vectors: {
        size: 1536,
        distance: 'Cosine'
      }
    })
  })

  if (!createResponse.ok) {
    throw new Error(`Failed to create collection: ${createResponse.statusText}`)
  }

  console.log('✓ Created Qdrant collection: knowledge_base')
}

async function uploadDocuments() {
  console.log(`Generating embeddings for ${SAMPLE_DOCUMENTS.length} documents...`)

  const points = []

  for (const doc of SAMPLE_DOCUMENTS) {
    const embedding = await generateEmbedding(doc.content)
    
    points.push({
      id: doc.id,
      vector: embedding,
      payload: {
        title: doc.title,
        text: doc.content,
        timestamp: new Date().toISOString()
      }
    })

    console.log(`  ✓ Generated embedding for: ${doc.title}`)
  }

  console.log('\nUploading documents to Qdrant...')

  const uploadResponse = await fetch(`${QDRANT_URL}/collections/knowledge_base/points`, {
    method: 'PUT',
    headers: {
      'api-key': QDRANT_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      points: points
    })
  })

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload documents: ${uploadResponse.statusText}`)
  }

  console.log(`✓ Successfully uploaded ${points.length} documents to Qdrant`)
}

async function verifyDocuments() {
  const response = await fetch(`${QDRANT_URL}/collections/knowledge_base`, {
    headers: {
      'api-key': QDRANT_API_KEY,
      'Content-Type': 'application/json'
    }
  })

  const data = await response.json() as any

  console.log('\nQdrant Collection Info:')
  console.log(`  Points count: ${data.result?.points_count || 0}`)
  console.log(`  Vectors size: ${data.result?.config?.params?.vectors?.size || 0}`)
}

async function main() {
  try {
    console.log('🚀 Populating Qdrant Knowledge Base\n')

    if (!QDRANT_API_KEY) {
      console.warn('⚠️  WARNING: QDRANT_API_KEY not set. Using unauthenticated access.')
    }

    await createQdrantCollection()
    await uploadDocuments()
    await verifyDocuments()

    console.log('\n✅ Successfully populated Qdrant with sample documents!')
    console.log('\nNext steps:')
    console.log('1. Replace SAMPLE_DOCUMENTS with your actual knowledge base')
    console.log('2. Implement real embedding generation using OpenAI, DeepSeek, or another service')
    console.log('3. Test the chatbot with queries about the uploaded documents')
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
