
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
    if (!isSupabaseAvailable()) {
      return NextResponse.json({ sessions: [] }, { status: 200 })
    }

    await ensureDb()

    // First get all sessions ordered by updated_at
    const { data: sessions, error: sessionsError } = await getSupabase()
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false })

    if (sessionsError) {
      console.error('Supabase sessions query error:', sessionsError)
      return NextResponse.json({ sessions: [] }, { status: 200 })
    }

    // Get all messages
    const { data: messages, error: messagesError } = await getSupabase()
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Supabase messages query error:', messagesError)
      return NextResponse.json({ sessions: [] }, { status: 200 })
    }

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

    return NextResponse.json({ sessions: sessionsWithMessages })
  } catch (error) {
    console.error('All history API error:', error)
    return NextResponse.json({ sessions: [] }, { status: 200 })
  }
}

