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

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseAvailable()) {
      return NextResponse.json({ messages: [] }, { status: 200 })
    }

    const sessionId = request.nextUrl.searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await getSupabase()
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { messages: [] }, // Return empty messages instead of error
        { status: 200 }
      )
    }

    return NextResponse.json({ messages: data || [] })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json({ messages: [] }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseAvailable()) {
      return NextResponse.json({ success: true, message: 'Session deletion skipped (Supabase not available)' })
    }

    const sessionId = request.nextUrl.searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Delete messages for this session
    const { error: messagesError } = await getSupabase()
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId)

    if (messagesError) {
      console.error('Supabase delete messages error:', messagesError)
    }

    // Delete the session itself
    const { error: sessionError } = await getSupabase()
      .from('chat_sessions')
      .delete()
      .eq('session_id', sessionId)

    if (sessionError) {
      console.error('Supabase delete session error:', sessionError)
    }

    return NextResponse.json({ success: true, message: 'Session deleted successfully' })
  } catch (error) {
    console.error('Delete session error:', error)
    return NextResponse.json({ success: true, message: 'Session deleted (skipped due to error)' })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseAvailable()) {
      return NextResponse.json({ session: null, message: 'Session creation skipped (Supabase not available)' })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    await ensureDb()

    // Create a new session (upsert to handle duplicates)
    const { data, error } = await getSupabase()
      .from('chat_sessions')
      .upsert({ 
        session_id: sessionId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'session_id' })
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ session: null })
    }

    return NextResponse.json({ session: data?.[0] })
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json({ session: null })
  }
}
