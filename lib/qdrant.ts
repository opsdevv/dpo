const QDRANT_URL = process.env.QDRANT_URL
const QDRANT_API_KEY = process.env.QDRANT_API_KEY

if (!QDRANT_URL || !QDRANT_API_KEY) {
  throw new Error('Missing Qdrant environment variables')
}

export async function searchQdrant(query: string, limit: number = 5) {
  try {
    // For now, we'll return a placeholder response
    // In production, you would embed the query and search the collection
    const response = await fetch(`${QDRANT_URL}/collections`, {
      headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.warn('Qdrant connection failed, returning default context')
      return []
    }

    // This is a placeholder - in production you'd perform actual semantic search
    return [
      { payload: { text: 'Knowledge base information not available yet. Please add documents to your Qdrant collection.' } }
    ]
  } catch (error) {
    console.error('Qdrant search error:', error)
    return []
  }
}

export async function getQdrantCollections() {
  try {
    const response = await fetch(`${QDRANT_URL}/collections`, {
      headers: {
        'api-key': QDRANT_API_KEY,
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
