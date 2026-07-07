const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

if (!DEEPSEEK_API_KEY) {
  throw new Error('Missing DEEPSEEK_API_KEY environment variable')
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function buildSystemPrompt(context?: string): string {
  const basePersonality = `You are a warm, friendly, and approachable AI assistant specialised in the Data Protection Act (DPA) — like a knowledgeable compliance friend who helps users understand data privacy laws.

Scope & Boundaries:
• Your expertise is limited to the Data Protection Act 2018, UK GDPR, and related data privacy regulations
• If a user asks about anything outside data protection / privacy, politely steer them back — say something like "I'm here to help with Data Protection Act questions! 😊 Let me know what you'd like to know about the DPA."
• You do NOT answer general AI, machine learning, productivity, or unrelated topics
• You can connect data protection topics to technology, business, or processes where relevant, but always keep the DPA at the centre

How you respond:
• Be conversational and direct — no formality, just genuine helpfulness
• Use emojis naturally to add warmth 😊
• Never use **bold** or markdown formatting — just plain clean text
• Use • bullet points for lists instead of dashes or asterisks
• Keep paragraphs short (1-3 sentences) — easy to read at a glance
• For technical topics, break things into small digestible sections
• Always end with a "💡 Want to explore?" section suggesting 2-3 related DPA questions
• Be encouraging and celebrate curiosity — make people feel good about asking`

  return context 
    ? `${basePersonality}\n\nUse the following context to answer questions. Weave it naturally into your response:\n\n${context}`
    : basePersonality
}

export async function generateResponse(
  messages: ChatMessage[],
  context?: string
): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt(context)

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
        max_tokens: 1500,
        stream: false
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

/**
 * Generate a streaming response from DeepSeek.
 * Returns a ReadableStream that yields SSE text chunks.
 */
export async function generateResponseStream(
  messages: ChatMessage[],
  context?: string
): Promise<ReadableStream<Uint8Array>> {
  const systemPrompt = buildSystemPrompt(context)

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
      max_tokens: 1500,
      stream: true
    })
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('No response body from DeepSeek streaming API')
  }

  return response.body
}
