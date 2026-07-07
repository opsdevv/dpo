# Qdrant + DeepSeek + Supabase Chatbot Setup Guide

## Botswana Data Protection Act AI Assistant

**Created by [Obokeng Makwati](https://obokengmakwati.com)**

This is a fully functional conversational chatbot that integrates three powerful services:

1. **Qdrant** - Vector database for semantic search (Botswana DPA knowledge base)
2. **DeepSeek** - Large Language Model for natural conversation about the Data Protection Act
3. **Supabase** - PostgreSQL database for chat history persistence

## Prerequisites

- Node.js 18+ installed
- A code editor (VS Code recommended)
- Accounts created for:
  - [Qdrant Cloud](https://qdrant.tech)
  - [DeepSeek Platform](https://platform.deepseek.com)
  - [Supabase](https://supabase.com)

## Step 1: Environment Setup

### Clone and Install
```bash
# Navigate to the project directory
cd dpo

# Install dependencies
pnpm install
```

### Environment Variables
Create a `.env.local` file in the project root:

```env
QDRANT_URL=https://your-cluster.sa-east-1-0.aws.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here
DEEPSEEK_API_KEY=sk_your_deepseek_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 2: Database Setup (Supabase)

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Run the following SQL to create tables:

```sql
-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES chat_sessions(session_id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_session_id ON chat_messages(session_id);
```

## Step 3: Vector Database Setup (Qdrant)

### Option A: Using Pre-configured Cloud Cluster
Your Qdrant cluster is already configured. Verify connection:

```bash
# Test the connection with the check script
npx ts-node scripts/check-qdrant-data.ts
```

### Option B: Local Qdrant (Development)
For local development with Qdrant:

```bash
# Download and extract Qdrant
# (qdrant.zip is included in the project)

# Start Qdrant server
./qdrant

# Update .env.local with:
QDRANT_URL=http://localhost:6333
# Remove QDRANT_API_KEY for local
```

## Step 4: Populate Knowledge Base

Upload Botswana Data Protection Act documents:

```bash
npx ts-node scripts/populate-qdrant.ts
```

This creates a `knowledge_base` collection and uploads sample documents. You can modify the script to add your own Botswana DPA documents.

## Step 5: Run the Application

```bash
pnpm dev
```

Visit `http://localhost:3000` — you should see the Agentic DPO chatbot interface.

## Testing Your Setup

### Quick Test
1. Open the chatbot in your browser
2. Type: "What is the Data Protection Act in Botswana?"
3. You should receive a helpful response about the DPA

### Verify Database Storage
Check Supabase to confirm messages are being stored:
```sql
SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5;
```

### Check Qdrant Data
```bash
npx ts-node scripts/check-qdrant-data.ts
```

## Common Issues

### "Missing DEEPSEEK_API_KEY environment variable"
- Verify `.env.local` exists and contains `DEEPSEEK_API_KEY=sk-...`
- Restart the dev server after saving

### Chatbot responds with "No relevant information found"
- Run the population script to add documents
- Verify Qdrant credentials are correct
- Check Qdrant collection exists

### Messages not saving
- Verify Supabase tables exist
- Check service role key permissions
- Review browser console for errors

## Architecture Overview

```
User Browser
    ↕
Next.js (App Router)
    ↕
API Routes:
  ├── /api/chat     → Qdrant search + DeepSeek LLM + Supabase store
  └── /api/history  → Supabase read/write
```

## Need Help?

- **Created by:** [Obokeng Makwati](https://obokengmakwati.com)
- **Focus:** Botswana Data Protection Act (DPA)
- **Deployment:** See [NEXT_STEPS.md](./NEXT_STEPS.md)
