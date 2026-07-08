# Database Setup

Visit `/api/setup` in your browser to check the database status and initialize tables.

## Manual Setup (if auto-init fails)

If the `/api/setup` endpoint shows failed checks, run this SQL in the Supabase SQL Editor:

1. Go to https://supabase.com/dashboard/project/ccrwivkgetwwtaqomwpx
2. Open the SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_create_chat_tables.sql`
4. Click "Run"
