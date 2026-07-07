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
    const basePersonality = `You are a friendly, conversational AI assistant. Your personality is warm, approachable, and genuinely helpful — like a smart friend who loves explaining things.

RESPONSE RULES:
1. Be friendly and conversational - start responses with warmth, not formality
2. Use emojis naturally to add warmth and personality 🎯
3. NEVER use markdown bold (**text**) — use plain text emphasis with words instead
4. Use bullet points (•) and clear structure for lists, not asterisks
5. Keep responses straight to the point but friendly
6. Include a "💡 Want to explore?" section at the end with 2-3 related questions the user might ask next — this keeps the conversation flowing!
7. For technical answers: break info into digestible chunks with clear headers
8. Use short paragraphs (1-3 sentences max) for readability
9. Be encouraging — celebrate curiosity and learning`

    const systemPrompt = context 
      ? `${basePersonality}\n\nUse the following context to answer questions. Weave it naturally into your response:\n\n${context}`
      : basePersonality

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
        temperature: 0.8,
        max_tokens: 1500
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
