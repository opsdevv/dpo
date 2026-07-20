import { generateSimpleEmbedding } from './embeddings'

const QDRANT_URL = process.env.QDRANT_URL
const QDRANT_API_KEY = process.env.QDRANT_API_KEY

function getQdrantConfig(): { url: string; apiKey: string } | null {
  if (!QDRANT_URL || !QDRANT_API_KEY) {
    console.warn('Qdrant environment variables not set, skipping Qdrant operations')
    return null
  }
  return { url: QDRANT_URL, apiKey: QDRANT_API_KEY }
}

export async function searchQdrant(query: string, limit: number = 5) {
  try {
    const config = getQdrantConfig()
    if (!config) return []

    // Generate embedding for the search query
    const vector = generateSimpleEmbedding(query)

    // Perform search in Qdrant
    const response = await fetch(`${config.url}/collections/knowledge_base/points/search`, {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vector: vector,
        limit: limit,
        with_payload: true
      })
    })

    if (!response.ok) {
      console.warn('Qdrant search failed, returning default context')
      return []
    }

    const data = await response.json()
    return data.result || []
  } catch (error) {
    console.error('Qdrant search error:', error)
    return []
  }
}

export async function getQdrantCollections() {
  try {
    const config = getQdrantConfig()
    if (!config) return []

    const response = await fetch(`${config.url}/collections`, {
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return []
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get Qdrant collections:', error)
    return []
  }
}
