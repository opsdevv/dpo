
import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, initializeDatabase } from '@/lib/supabase'

let dbInitialized = false

async function ensureDb() {
  if (dbInitialized) return
  try {
    await getSupabase().from('chat_sessions').select('id').limit(1)
    dbInitialized = true
  } catch {
    console.log('⚙️ Initializing database tables...')
    await initializeDatabase()
    dbInitialized = true
  }
}

function isSupabaseAvailable(): boolean {
  try {
    getSupabase()
    return true
  } catch {
    return false
  }
}

export async function GET() {
  try {
    console.log('=== /api/all-history called ===')
    console.log('Checking Supabase availability...')
    if (!isSupabaseAvailable()) {
      console.log('Supabase NOT available!')
      return NextResponse.json({ sessions: [], debug: 'Supabase not available' }, { status: 200 })
    }
    console.log('Supabase available!')

    await ensureDb()
    console.log('Database initialized!')

    // First get all sessions ordered by updated_at
    console.log('Fetching sessions...')
    const { data: sessions, error: sessionsError } = await getSupabase()
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false })

    if (sessionsError) {
      console.error('Supabase sessions query error:', sessionsError)
      return NextResponse.json({ sessions: [], debug: 'Sessions error', error: sessionsError }, { status: 200 })
    }
    console.log('Fetched sessions:', sessions)

    // Get all messages
    console.log('Fetching messages...')
    const { data: messages, error: messagesError } = await getSupabase()
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Supabase messages query error:', messagesError)
      return NextResponse.json({ sessions: [], debug: 'Messages error', error: messagesError }, { status: 200 })
    }
    console.log('Fetched messages:', messages)

    // Group messages by session_id
    const messagesBySession: Record<string, any[]> = {}
    if (messages) {
      for (const msg of messages) {
        if (!messagesBySession[msg.session_id]) {
          messagesBySession[msg.session_id] = []
        }
        messagesBySession[msg.session_id].push(msg)
      }
    }

    // Combine sessions with their messages
    const sessionsWithMessages = (sessions || []).map(session => ({
      ...session,
      messages: messagesBySession[session.session_id] || []
    }))

    console.log('Returning sessions with messages:', sessionsWithMessages)
    return NextResponse.json({ sessions: sessionsWithMessages })
  } catch (error) {
    console.error('All history API error:', error)
    return NextResponse.json({ sessions: [], debug: 'Caught error', error }, { status: 200 })
  }
}

