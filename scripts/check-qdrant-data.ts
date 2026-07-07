/**
 * Script to check what data exists in Qdrant
 * 
 * Usage: npx tsx -r dotenv/config scripts/check-qdrant-data.ts
 */

// Load .env.local
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

const QDRANT_URL = process.env.QDRANT_URL || ''
const QDRANT_API_KEY = process.env.QDRANT_API_KEY || ''

async function checkQdrantData() {
  try {
    console.log('🔍 Checking Qdrant data...\n')
    console.log(`Qdrant URL: ${QDRANT_URL}`)

    // 1. List all collections
    console.log('\n📁 Listing collections...')
    const collectionsResponse = await fetch(`${QDRANT_URL}/collections`, {
      headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json'
      }
    })
    const collections = await collectionsResponse.json()
    console.log('Collections:', JSON.stringify(collections, null, 2))

    // 2. Get info on knowledge_base collection
    const collectionName = 'knowledge_base'
    console.log(`\n📊 Checking collection: ${collectionName}...`)
    const infoResponse = await fetch(`${QDRANT_URL}/collections/${collectionName}`, {
      headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json'
      }
    })
    
    if (!infoResponse.ok) {
      console.log(`Collection '${collectionName}' does not exist or error: ${infoResponse.statusText}`)
      
      // Try to list all collections
      const allCols = collections.result?.collections || []
      if (allCols.length > 0) {
        console.log('\nAvailable collections:')
        allCols.forEach((c: any) => console.log(`  - ${c.name}`))
      }
      return
    }

    const info = await infoResponse.json()
    const pointsCount = info.result?.points_count || 0
    console.log('Collection info:', JSON.stringify(info, null, 2))

    // 3. If there are points, scroll through them
    if (pointsCount > 0) {
      console.log(`\n📄 Found ${pointsCount} points. Retrieving sample...`)
      
      const scrollResponse = await fetch(`${QDRANT_URL}/collections/${collectionName}/points/scroll`, {
        method: 'POST',
        headers: {
          'api-key': QDRANT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          limit: 10,
          with_payload: true,
          with_vector: false
        })
      })

      if (scrollResponse.ok) {
        const scrollData = await scrollResponse.json()
        console.log('\nSample points:')
        if (scrollData.result?.points) {
          scrollData.result.points.forEach((point: any) => {
            console.log(`\n--- Point ID: ${point.id} ---`)
            console.log('Payload:', JSON.stringify(point.payload, null, 2))
          })
        }
      }

      // 4. Count exact number
      const countResponse = await fetch(`${QDRANT_URL}/collections/${collectionName}/points/count`, {
        method: 'POST',
        headers: {
          'api-key': QDRANT_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ exact: true })
      })

      if (countResponse.ok) {
        const countData = await countResponse.json()
        console.log(`\n📊 Exact point count: ${countData.result?.count || 0}`)
      }
    } else {
      console.log('\n⚠️  No points found in the collection.')
    }

  } catch (error) {
    console.error('❌ Error checking Qdrant:', error instanceof Error ? error.message : error)
  }
}

checkQdrantData()
