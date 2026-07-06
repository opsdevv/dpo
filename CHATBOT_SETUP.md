# Qdrant + DeepSeek + Supabase Chatbot Setup Guide

This is a fully functional conversational chatbot that integrates three key services:

- **Qdrant**: Vector database for semantic search and knowledge retrieval
- **DeepSeek**: LLM for natural language understanding and response generation
- **Supabase**: Database for storing chat history and sessions

## Architecture Overview

```
User Query
    ↓
ChatInterface (React Client)
    ↓
/api/chat Endpoint
    ├→ Search Qdrant (vector semantic search)
    ├→ Call DeepSeek API (generate response with context)
    └→ Store in Supabase (chat history)
    ↓
Response with Sources
```

## Setup Instructions

### 1. Environment Variables

The following environment variables have been added to your Vercel project:

```env
QDRANT_CLUSTER_ID=your_cluster_id
QDRANT_API_KEY=your_api_key
QDRANT_URL=https://your_cluster_id.region.aws.cloud.qdrant.io
DEEPSEEK_API_KEY=your_deepseek_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Supabase Database Setup

The chatbot requires two tables in Supabase:

#### `chat_sessions` table
```sql
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `chat_messages` table
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES chat_sessions(session_id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_id ON chat_messages(session_id);
CREATE INDEX idx_created_at ON chat_messages(created_at);
```

### 3. Qdrant Collection Setup

To enable semantic search, you need to populate your Qdrant collection with documents:

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(
    url="https://your-cluster-id.region.aws.cloud.qdrant.io",
    api_key="your-api-key"
)

# Create collection if it doesn't exist
client.recreate_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)

# Add your documents (vectorized with OpenAI, DeepSeek, or another embeddings service)
points = [
    PointStruct(
        id=1,
        vector=[...],  # 1536-dimensional embedding
        payload={"text": "Your knowledge base content here"}
    ),
    # Add more documents...
]

client.upsert(collection_name="knowledge_base", points=points)
```

## Key Features

### 1. Conversational Context
- The chatbot maintains full conversation history per session
- Each message is stored with timestamp and role (user/assistant)
- Multi-turn conversations remember previous exchanges

### 2. Knowledge Retrieval
- Queries are searched against your Qdrant vector database
- Top 5 most relevant documents are retrieved
- Retrieved context is passed to DeepSeek for grounded responses

### 3. Session Management
- Each user gets a unique session ID
- Chat history is persisted in Supabase
- Sessions can be loaded and resumed

### 4. Responsive UI
- Built with Perplexity-inspired design
- Sidebar navigation with collapsible panels
- Real-time message streaming
- Copy, thumbs up/down feedback buttons
- Mobile-friendly interface

## API Endpoints

### POST `/api/chat`
Send a message and get a response.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What is machine learning?" },
    { "role": "assistant", "content": "..." }
  ],
  "sessionId": "uuid-string"
}
```

**Response:**
```json
{
  "response": "Machine learning is...",
  "context": "Relevant source material..."
}
```

### GET `/api/history?sessionId=uuid`
Retrieve chat history for a session.

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "session_id": "uuid",
      "role": "user",
      "content": "...",
      "created_at": "2026-07-06T..."
    }
  ]
}
```

### POST `/api/history`
Create a new chat session.

**Request:**
```json
{
  "sessionId": "uuid-string"
}
```

## Development

### Running Locally
```bash
pnpm install
pnpm dev
```

The app will be available at `http://localhost:3000`

### Project Structure
```
app/
├── api/
│   ├── chat/route.ts        # Chat endpoint with Qdrant + DeepSeek
│   └── history/route.ts     # Session management
├── components/
│   ├── chat-interface.tsx   # Main chat UI
│   ├── sidebar.tsx          # Navigation sidebar
│   └── ...                  # Other components
├── page.tsx                 # Home page
└── layout.tsx               # Root layout
lib/
├── supabase.ts              # Supabase client
├── qdrant.ts                # Qdrant search utilities
└── deepseek.ts              # DeepSeek API client
```

## Important Notes

1. **Qdrant Documents**: Before the chatbot can provide context-specific answers, you must add documents to your Qdrant collection. See the setup section above.

2. **DeepSeek API**: Ensure your DEEPSEEK_API_KEY is set correctly. The API uses the `deepseek-chat` model.

3. **Supabase RLS**: If you enable Row Level Security, ensure the policies allow the service role to read/write to both tables.

4. **Rate Limiting**: Consider implementing rate limiting for the /api/chat endpoint in production.

## Customization

### Change LLM Model
Edit `lib/deepseek.ts` and change the `model` parameter:
```typescript
model: 'deepseek-chat'  // or another available model
```

### Adjust Context Size
Modify the limit in `lib/qdrant.ts`:
```typescript
const limit = 10  // Increase from 5 to 10
```

### Styling
The chatbot uses Tailwind CSS. Edit component classes to customize colors, spacing, and layout.

## Troubleshooting

### "Qdrant connection failed"
- Verify QDRANT_URL and QDRANT_API_KEY in environment variables
- Ensure your Qdrant cluster is running and accessible

### "Failed to generate response"
- Check DEEPSEEK_API_KEY is valid
- Verify DeepSeek API is not rate-limited
- Check logs for API errors

### "Failed to store messages"
- Verify Supabase tables exist (chat_sessions, chat_messages)
- Check SUPABASE_SERVICE_ROLE_KEY has write permissions
- Ensure database connection is working

## Production Deployment

1. **Add your documents to Qdrant** before deploying
2. **Set up Supabase RLS policies** for security
3. **Enable CORS** if the API will be called from different origins
4. **Implement rate limiting** on API endpoints
5. **Monitor API costs** for DeepSeek and Qdrant usage
6. **Set up error tracking** (Sentry, LogRocket, etc.)

## Support

For issues with:
- **Qdrant**: https://qdrant.tech/documentation
- **DeepSeek**: https://platform.deepseek.com/docs
- **Supabase**: https://supabase.com/docs
