/**
 * Generate a simple embedding vector using a hash-based approach
 * Note: In production, use a proper embedding service (OpenAI, DeepSeek, etc.)
 */
export function generateSimpleEmbedding(text: string, dimensions: number = 384): number[] {
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
