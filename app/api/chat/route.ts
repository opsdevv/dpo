import { NextRequest } from 'next/server'
import { generateResponse, generateResponseStream, ChatMessage } from '@/lib/deepseek'
import { searchPinecone } from '@/lib/pinecone'
import { supabase, initializeDatabase } from '@/lib/supabase'

// Auto-initialize database on first request
let dbInitialized = false

async function ensureDb() {
  if (dbInitialized) return
  try {
    // Test if tables exist
    await supabase.from('chat_sessions').select('id').limit(1)
    dbInitialized = true
  } catch {
    console.log('⚙️ Initializing database tables...')
    await initializeDatabase()
    dbInitialized = true
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, stream: wantsStream } = await request.json()

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const userMessage = messages[messages.length - 1]?.content
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'Invalid message format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Search Pinecone for relevant context
    let context = ''
    try {
      const searchResults = await searchPinecone(userMessage, 5)
      if (searchResults && Array.isArray(searchResults)) {
        context = searchResults
          .map((result: any) => result.payload?.text || '')
          .filter(Boolean)
          .join('\n\n')
      }
    } catch (error) {
      console.error('Pinecone search failed:', error)
    }

    // Store user message immediately
    if (sessionId) {
      try {
        await ensureDb()
        // Ensure session exists before inserting message
        await supabase.from('chat_sessions').upsert({
          session_id: sessionId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'session_id' }).select().single()
        
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'user',
          content: userMessage
        })
      } catch (error) {
        console.error('Failed to store user message:', error)
      }
    }

    // === STREAMING RESPONSE ===
    if (wantsStream) {
      const deepseekStream = await generateResponseStream(
        messages as ChatMessage[],
        context
      )

      const encoder = new TextEncoder()
      let fullResponse = ''

      // Create a ReadableStream that pipes DeepSeek's SSE into our SSE format
      const stream = new ReadableStream({
        async start(controller) {
          const reader = deepseekStream.getReader()
          const decoder = new TextDecoder()

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') {
                    // Save full response to Supabase
                    if (sessionId && fullResponse) {
                      try {
                        await ensureDb()
                        await supabase.from('chat_messages').insert({
                          session_id: sessionId,
                          role: 'assistant',
                          content: fullResponse
                        })
                      } catch (error) {
                        console.error('Failed to store assistant response:', error)
                      }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    continue
                  }

                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices?.[0]?.delta?.content || ''
                    if (content) {
                      fullResponse += content
                      // Forward to client as simple { content } SSE
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                      )
                    }
                  } catch {
                    // Skip malformed JSON lines from DeepSeek
                  }
                }
              }
            }
          } catch (err) {
            console.error('Stream reading error:', err)
          } finally {
            reader.releaseLock()
            controller.close()
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // === NON-STREAMING FALLBACK ===
    const response = await generateResponse(messages as ChatMessage[], context)

    // Store assistant response
    if (sessionId) {
      try {
        await ensureDb()
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: response
        })
      } catch (error) {
        console.error('Failed to store assistant response:', error)
      }
    }

    return new Response(JSON.stringify({ response, context: context ? context.substring(0, 500) : null }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
