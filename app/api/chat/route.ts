import { NextRequest, NextResponse } from 'next/server'
import { generateResponse, ChatMessage } from '@/lib/deepseek'
import { searchQdrant } from '@/lib/qdrant'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId } = await request.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      )
    }

    const userMessage = messages[messages.length - 1]?.content
    if (!userMessage) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      )
    }

    // Search Qdrant for relevant context
    let context = ''
    try {
      const searchResults = await searchQdrant(userMessage, 5)
      if (searchResults && Array.isArray(searchResults)) {
        context = searchResults
          .map((result: any) => result.payload?.text || '')
          .filter(Boolean)
          .join('\n\n')
      }
    } catch (error) {
      console.error('Qdrant search failed:', error)
    }

    // Generate response using DeepSeek with context
    const response = await generateResponse(
      messages as ChatMessage[],
      context
    )

    // Store messages in Supabase
    if (sessionId) {
      try {
        // Store user message
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'user',
          content: userMessage
        })

        // Store assistant response
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: response
        })
      } catch (error) {
        console.error('Failed to store messages in Supabase:', error)
      }
    }

    return NextResponse.json({
      response,
      context: context ? context.substring(0, 500) : null
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
