'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Copy, ThumbsUp, ThumbsDown, Search, Focus, Grid3x3, Globe, Cpu, Paperclip, Mic } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  context?: string
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize session
  useEffect(() => {
    const newSessionId = uuidv4()
    setSessionId(newSessionId)

    // Create session in database
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: newSessionId })
    }).catch(error => console.error('Failed to create session:', error))

    // Load previous messages if session exists
    fetch(`/api/history?sessionId=${newSessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages) {
          const loadedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }))
          setMessages(loadedMessages)
        }
      })
      .catch(error => console.error('Failed to load history:', error))
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsFocused(false)
    setShowSuggestions(false)
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          sessionId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response,
        context: data.context,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Banner Advertising Space */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="max-w-4xl mx-auto w-full px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-center min-h-[60px] md:min-h-[80px] rounded-lg border-2 border-dashed border-white/10 bg-white/[0.02]">
            <div className="text-center">
              <p className="text-xs md:text-sm font-medium text-white/40">Advertisement Space</p>
              <p className="text-[10px] text-white/30">728x90 or 300x250 recommended</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-3xl space-y-6 md:space-y-8 px-4 md:px-6">
              <header className="flex items-center justify-center">
                <div className="flex items-center gap-0">
                  <span className="text-2xl md:text-3xl font-bold tracking-tight text-white">Agentic DPO</span>
                  <span className="ml-1 rounded-full bg-teal-600 px-2 md:px-2.5 py-0.5 text-[10px] md:text-xs font-semibold text-white">
                    pro
                  </span>
                </div>
              </header>
              
              <div className="text-center space-y-2">
                <p className="text-sm md:text-base text-white/60">
                  Powered by Qdrant, DeepSeek & Supabase
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full py-8 px-4 md:px-6 space-y-6">
            {messages.map(message => (
              <div
                key={message.id}
                className={`animate-in fade-in slide-in-from-bottom-2 duration-300 flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">p</span>
                  </div>
                )}
                
                <div className={`flex flex-col gap-2 max-w-2xl ${message.role === 'user' ? '' : 'flex-1'}`}>
                  <div
                    className={`px-4 md:px-5 py-3 md:py-3.5 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                      message.role === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-sm'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <p className="text-[14px] md:text-[15px] leading-relaxed whitespace-pre-wrap text-white">
                      {message.content}
                    </p>
                  </div>

                  {message.context && message.role === 'assistant' && (
                    <div className="px-1 py-1 flex flex-wrap gap-2">
                      <span className="text-[11px] text-white/40">Sources:</span>
                      <p className="text-[11px] text-white/40 line-clamp-1">{message.context}</p>
                    </div>
                  )}

                  {message.role === 'assistant' && (
                    <div className="flex gap-0.5 opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/10"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/10"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/10"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">p</span>
                </div>
                <div className="max-w-2xl">
                  <div className="px-4 md:px-5 py-3 md:py-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <Spinner className="h-4 w-4 text-teal-500" />
                      <p className="text-[14px] md:text-[15px] text-white/60">Thinking...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-center px-4 md:px-6 py-4 md:py-6">
          <div className="w-full max-w-3xl">
            <div className="relative">
              <div
                className={`animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 bg-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:shadow-[0_4px_30px_rgba(0,0,0,0.5)] ${
                  isFocused ? 'border-teal-500/50 ring-1 ring-teal-500/20' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Input */}
                <div className="px-4 md:px-5 py-3 md:py-3.5">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      setShowSuggestions(e.target.value.length > 0)
                    }}
                    onFocus={() => {
                      setIsFocused(true)
                      if (input.length > 0) setShowSuggestions(true)
                    }}
                    onBlur={() => {
                      setIsFocused(false)
                      setTimeout(() => setShowSuggestions(false), 150)
                    }}
                    placeholder="Ask anything..."
                    disabled={loading}
                    className="w-full border-0 bg-transparent text-[14px] md:text-[15px] text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                        handleSubmit(e)
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between px-2 md:px-2.5 py-2 gap-2">
                  <div className="relative flex items-center gap-0.5 rounded-lg bg-white/5 p-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 md:h-9 md:w-9 rounded-md transition-all duration-300 border-2 border-teal-500/60 bg-slate-800 text-teal-500 shadow-sm hover:border-teal-500/70 hover:text-teal-400`}
                    >
                      <Search className="h-4 w-4 md:h-[17px] md:w-[17px]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 md:h-9 md:w-9 rounded-md transition-all duration-300 border-2 border-transparent text-white/40 hover:bg-white/10 hover:text-white`}
                    >
                      <Focus className="h-4 w-4 md:h-[17px] md:w-[17px]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 md:h-9 md:w-9 rounded-md transition-all duration-300 border-2 border-transparent text-white/40 hover:bg-white/10 hover:text-white`}
                    >
                      <Grid3x3 className="h-4 w-4 md:h-[17px] md:w-[17px]" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loading}
                      className="hidden sm:flex h-9 w-9 rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <Globe className="h-[17px] w-[17px]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loading}
                      className="hidden sm:flex h-9 w-9 rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <Cpu className="h-[17px] w-[17px]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loading}
                      className="h-8 w-8 md:h-9 md:w-9 rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <Paperclip className="h-4 w-4 md:h-[17px] md:w-[17px]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loading}
                      className="h-8 w-8 md:h-9 md:w-9 rounded-lg text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <Mic className="h-4 w-4 md:h-[17px] md:w-[17px]" />
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !input.trim()}
                      className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-teal-600 text-white transition-all hover:bg-teal-700 active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      size="icon"
                    >
                      <svg className="h-3.5 w-3.5 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="8" width="2" height="8" rx="1" fill="currentColor" />
                        <rect x="8" y="4" width="2" height="16" rx="1" fill="currentColor" />
                        <rect x="12" y="6" width="2" height="12" rx="1" fill="currentColor" />
                        <rect x="16" y="10" width="2" height="4" rx="1" fill="currentColor" />
                        <rect x="20" y="7" width="2" height="10" rx="1" fill="currentColor" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <footer className="flex items-center justify-center gap-1 pt-4">
              <p className="flex flex-wrap items-center justify-center gap-1 text-[11px] md:text-xs text-white/40 text-center">
                <span>Developed by</span>
                <a
                  href="https://obokengmakwati.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:text-teal-400 transition-colors underline"
                >
                  OBK
                </a>
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
