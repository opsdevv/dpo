/**
 * Script to populate Pinecone with sample documents
 * Usage: npx tsx scripts/populate-pinecone.ts
 */
import { config } from 'dotenv'
import { resolve } from 'path'
import { generateSimpleEmbedding } from '../lib/embeddings'

config({ path: resolve(__dirname, '../.env.local') })

const PINECONE_API_KEY = process.env.PINECONE_API_KEY
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'knowledge-base'

interface Document {
  id: string
  title: string
  content: string
}

const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: '1',
    title: 'Machine Learning Basics',
    content: `Machine learning is a subset of artificial intelligence that focuses on
    building systems that can learn from data. It enables computers to identify patterns
    in data and make decisions with minimal human intervention.`
  },
  {
    id: '2',
    title: 'Deep Learning',
    content: `Deep learning is a specialized subset of machine learning using neural
    networks with multiple layers. These networks can learn complex patterns in large
    amounts of unstructured data like images, text, and sound.`
  },
  {
    id: '3',
    title: 'Natural Language Processing',
    content: `NLP is a field of artificial intelligence focused on enabling computers
    to understand, interpret, and generate human language in a meaningful way. It powers
    chatbots, translation tools, and sentiment analysis systems.`
  }
]

async function getIndexHost() {
  const response = await fetch(`https://api.pinecone.io/indexes/${PINECONE_INDEX}`, {
    headers: { 'Api-Key': PINECONE_API_KEY!, 'Accept': 'application/json' }
  })
  if (!response.ok) throw new Error(`Failed to get index: ${await response.text()}`)
  const data = await response.json()
  return data.host
}

async function main() {
  try {
    console.log('🚀 Populating Pinecone Knowledge Base\n')
    const host = await getIndexHost()
    const vectors = []

    for (const doc of SAMPLE_DOCUMENTS) {
      const embedding = generateSimpleEmbedding(doc.content)
      vectors.push({
        id: doc.id,
        values: embedding,
        metadata: {
          title: doc.title,
          text: doc.content,
          timestamp: new Date().toISOString()
        }
      })
      console.log(`  ✓ Generated embedding for: ${doc.title}`)
    }

    const response = await fetch(`https://${host}/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': PINECONE_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ vectors })
    })

    if (!response.ok) throw new Error(`Upsert failed: ${await response.text()}`)
    console.log('\n✅ Successfully populated Pinecone with sample documents!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
