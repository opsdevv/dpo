const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

if (!DEEPSEEK_API_KEY) {
  throw new Error('Missing DEEPSEEK_API_KEY environment variable')
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function generateResponse(
  messages: ChatMessage[],
  context?: string
): Promise<string> {
  try {
    const systemPrompt = context 
      ? `You are a helpful assistant. Use the following context to answer questions:\n\n${context}`
      : 'You are a helpful assistant.'

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('DeepSeek API error:', error)
    throw new Error('Failed to generate response')
  }
}
