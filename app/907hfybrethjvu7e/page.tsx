
"use client"

import { useState, useEffect } from "react"
import { Loader2, MessageSquare, User, Bot, Hash, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface ChatMessage {
  id: string
  session_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

interface ChatSession {
  id: string
  session_id: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}

// Helper function to count words
function countWords(text: string): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export default function AllChatHistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/all-history")
        const data = await res.json()
        setSessions(data.sessions || [])
      } catch (error) {
        console.error("Failed to fetch chat history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading chat history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">All Chat History</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <MessageSquare className="w-4 h-4" />
            <span>{sessions.length} sessions</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No chat history found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                {/* Session Header */}
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Session {session.session_id.slice(0, 8)}...</p>
                      <div className="flex items-center gap-4 text-xs text-white/40 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(session.updated_at), "MMM d, yyyy h:mm a")}
                        </span>
                        <span>{session.messages.length} messages</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="divide-y divide-white/5">
                  {session.messages.map((message) => (
                    <div key={message.id} className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          message.role === "user" 
                            ? "bg-purple-500/20" 
                            : "bg-green-500/20"
                        }`}>
                          {message.role === "user" ? (
                            <User className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Bot className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-sm">
                              {message.role === "user" ? "User" : "Assistant"}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                              <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {countWords(message.content)} words
                              </span>
                              <span>{format(new Date(message.created_at), "h:mm a")}</span>
                            </div>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
