import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

/**
 * Execute a SQL statement via the exec_sql RPC function.
 * Uses try/catch instead of .catch() for PostgrestFilterBuilder compatibility.
 */
async function execSql(sql: string): Promise<boolean> {
  try {
    await supabase.rpc('exec_sql', { sql })
    return true
  } catch {
    return false
  }
}

/**
 * Initialize database tables for chat persistence.
 * 
 * If this fails, run the SQL in `supabase/migrations/001_create_chat_tables.sql`
 * directly in the Supabase SQL Editor to set up tables manually.
 */
export async function initializeDatabase() {
  try {
    // Step 1: Test if exec_sql function exists
    const { error: funcTest } = await supabase.rpc('exec_sql', {
      sql: 'SELECT 1'
    })

    if (funcTest) {
      // exec_sql function doesn't exist - try creating it via raw REST endpoint
      const createFuncSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
        RETURNS VOID AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `

      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceRoleKey!,
          'Authorization': `Bearer ${supabaseServiceRoleKey!}`,
        },
        body: JSON.stringify({ sql: createFuncSQL })
      })

      if (!response.ok) {
        console.warn('⚠️ Cannot auto-create tables. Run the SQL migration manually.')
        console.warn('📋 File: supabase/migrations/001_create_chat_tables.sql')
        return
      }
    }

    // Step 2: Create chat_sessions table
    await execSql(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Step 3: Create chat_messages table
    await execSql(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Step 4: Create indexes
    await execSql(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
    `)

    console.log('✅ Database tables verified/created successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    console.warn('📋 Run supabase/migrations/001_create_chat_tables.sql manually in the Supabase SQL Editor.')
  }
}
