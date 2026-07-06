# 🤖 Qdrant + DeepSeek + Supabase Conversational Chatbot

A production-ready conversational AI chatbot built with Next.js that combines semantic search (Qdrant), large language models (DeepSeek), and persistent storage (Supabase).

## ✨ Features

- **Semantic Search**: Uses Qdrant vector database to find relevant knowledge base documents
- **LLM Integration**: Powered by DeepSeek for natural language understanding and response generation
- **Persistent History**: All conversations automatically saved to Supabase
- **Multi-turn Conversations**: Remembers context across multiple exchanges
- **Session Management**: Unique sessions per user with conversation resumption
- **Modern UI**: Inspired by Perplexity with responsive design
- **Real-time Feedback**: Copy, like, and dislike response options
- **Source Attribution**: Shows which documents were used for answers

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Accounts created for:
  - Qdrant Cloud (https://qdrant.tech)
  - DeepSeek Platform (https://platform.deepseek.com)
  - Supabase (https://supabase.com)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Environment Variables
All variables are pre-configured in your Vercel project. For local development, create `.env.local`:

```env
QDRANT_URL=https://your-cluster.sa-east-1-0.aws.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key
DEEPSEEK_API_KEY=sk_your_deepseek_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Create Supabase Tables
Run these SQL commands in your Supabase dashboard:

```sql
-- Chat Sessions Table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES chat_sessions(session_id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_id ON chat_messages(session_id);
```

### 4. Populate Knowledge Base (Optional)
Add documents to your Qdrant collection:

```bash
npx ts-node scripts/populate-qdrant.ts
```

### 5. Run the App
```bash
pnpm dev
```

Visit `http://localhost:3000` and start chatting!

## 📁 Project Structure

```
app/
  ├── api/
  │   ├── chat/        # Main chat endpoint with RAG
  │   └── history/     # Session and history management
  ├── components/
  │   ├── chat-interface.tsx    # Main UI component
  │   ├── sidebar.tsx           # Navigation
  │   └── ...
  ├── page.tsx         # Home page
  └── layout.tsx       # Root layout

lib/
  ├── deepseek.ts      # DeepSeek API client
  ├── qdrant.ts        # Vector search utilities
  └── supabase.ts      # Database client

scripts/
  └── populate-qdrant.ts  # Document upload script
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide
- **[CHATBOT_SETUP.md](./CHATBOT_SETUP.md)** - Detailed setup instructions
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical overview
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Production deployment guide

## 🔄 How It Works

```
User Input
    ↓
Session Management (Supabase)
    ↓
Vector Search (Qdrant)
    ↓
Context Retrieval
    ↓
LLM Processing (DeepSeek)
    ↓
Response Generation
    ↓
Store in Database (Supabase)
    ↓
Display to User
```

## 📊 API Reference

### POST /api/chat
Send a message and get an AI response.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "What is machine learning?"}
  ],
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "response": "Machine learning is...",
  "context": "Relevant source information..."
}
```

### GET /api/history?sessionId=uuid
Retrieve conversation history.

**Response:**
```json
{
  "messages": [
    {
      "id": "...",
      "session_id": "...",
      "role": "user",
      "content": "...",
      "created_at": "2026-07-06T..."
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| QDRANT_URL | Yes | Your Qdrant cluster endpoint |
| QDRANT_API_KEY | Yes | Qdrant authentication token |
| DEEPSEEK_API_KEY | Yes | DeepSeek API key |
| NEXT_PUBLIC_SUPABASE_URL | Yes | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Supabase public key |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Supabase service role key |

## 🎯 Common Tasks

### Add Custom Knowledge Base
1. Prepare your documents (markdown, text, or PDF)
2. Generate embeddings (1536-dimensional vectors)
3. Upload to Qdrant using the population script
4. Test with queries about your documents

### Customize the UI
- Edit components in `app/components/`
- Modify colors in `app/globals.css`
- Update layout in `app/layout.tsx`
- Use Tailwind CSS for styling

### Add Authentication
1. Install Auth.js or similar
2. Implement user login/signup
3. Scope messages by user ID
4. Add RLS policies in Supabase

### Deploy to Production
```bash
# Push to GitHub (if connected)
git push

# Or deploy to Vercel
vercel deploy

# Environment variables are automatically synced
```

## 🐛 Troubleshooting

### Chatbot not responding
- Verify all API keys in environment variables
- Check browser console for error messages
- Ensure Qdrant cluster is running
- Test DeepSeek API directly

### No context being retrieved
- Verify documents are in Qdrant collection
- Check vector dimensions (should be 1536)
- Use the population script to add sample data
- Query Qdrant API directly to verify data

### Chat history not saving
- Confirm Supabase tables exist
- Check service role key has write permissions
- Verify session ID is being passed correctly
- Review Supabase logs for errors

See [NEXT_STEPS.md](./NEXT_STEPS.md#troubleshooting-guide) for more solutions.

## 📈 Performance

Typical response times:
- Qdrant search: ~100-200ms
- DeepSeek API: ~2-3 seconds
- Database operations: <100ms
- Total response: ~3-4 seconds

## 💰 Cost Estimates (Monthly)

| Service | Free | Growth | Enterprise |
|---------|------|--------|-----------|
| DeepSeek | $5-20 | $50+ | Custom |
| Qdrant | 1GB free | $20+ | Custom |
| Supabase | 500MB free | $25+ | Custom |
| Vercel | 100GB free | $20+ | Custom |

## 🔒 Security Features

- ✅ API key management through environment variables
- ✅ Server-side DeepSeek calls (no client-side exposure)
- ✅ Supabase Row Level Security ready
- ✅ Input validation and sanitization
- ✅ CORS configuration for specific domains
- ✅ Rate limiting ready (can be implemented)

## 📦 Dependencies

**Core:**
- next@16.0.10
- react@19.2.0
- typescript@5.x

**UI:**
- tailwindcss@3.x
- shadcn/ui components
- lucide-react icons

**Services:**
- @supabase/supabase-js
- uuid

**Development:**
- eslint
- prettier
- tailwind config utilities

## 🤝 Contributing

We welcome contributions! Areas for improvement:
- Enhanced error handling
- Advanced caching strategies
- Additional LLM model support
- Improved prompt engineering
- Performance optimizations

## 📝 License

This project is open source and available under the MIT License.

## 🙋 Support

For issues and questions:
- Check [TROUBLESHOOTING](./NEXT_STEPS.md#troubleshooting-guide)
- Review documentation files
- Check service status pages
- Contact service providers

## 🎉 Getting Started

1. Ensure all environment variables are set
2. Create Supabase tables using the SQL provided
3. Optionally populate Qdrant with your knowledge base
4. Run `pnpm dev`
5. Visit http://localhost:3000
6. Start chatting!

---

**Built with ❤️ using Next.js, Qdrant, DeepSeek, and Supabase**

Ready to deploy? Check out [NEXT_STEPS.md](./NEXT_STEPS.md) for production guidance.
