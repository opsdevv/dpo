"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, ArrowLeft, Database, FileType, Hash, BookText, TextSelect, Info, Cpu } from "lucide-react"
import Link from "next/link"

interface UploadDetails {
  rawFileSize?: string
  extractedTextLength?: string
  wordCount?: string
  lineCount?: string
  extractionMethod?: string
  storage?: string
}

interface UploadResult {
  success: boolean
  message: string
  id?: string
  title?: string
  fileType?: string
  size?: number
  wordCount?: number
  lineCount?: number
  extractionMethod?: string
  details?: UploadDetails
}

export default function DocumentUploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("general")
  const [source, setSource] = useState("manual-upload")
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const clearFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleUpload = async () => {
    const content = textInput.trim()
    if (!content && !file) {
      setResult({ success: false, message: "Please provide a file or paste text content." })
      return
    }

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      if (file) formData.append("file", file)
      if (content) formData.append("text", content)
      if (title) formData.append("title", title)
      formData.append("category", category)
      formData.append("source", source)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setResult({
          success: true,
          message: `Document "${data.title}" uploaded successfully!`,
          id: data.id,
          title: data.title,
          fileType: data.fileType,
          size: data.size,
          wordCount: data.wordCount,
          lineCount: data.lineCount,
          extractionMethod: data.extractionMethod,
          details: data.details,
        })
        setTextInput("")
        setTitle("")
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
      } else {
        const errorMsg = data.error || "Upload failed"
        const details = data.stack ? `\n\nDetails: ${data.stack.split('\n')[0]}` : ""
        setResult({ success: false, message: errorMsg + details })
      }
    } catch (error) {
      setResult({ success: false, message: "Network error. Is the server running?" })
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = () => {
    if (!file) return null
    const ext = file.name.split(".").pop()?.toLowerCase()
    return <FileText className="w-8 h-8 text-blue-400" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">Document Upload</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <Upload className="w-4 h-4" />
            <span>Upload to Qdrant Knowledge Base</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-8">
          {/* Instructions */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-medium mb-2">Upload Documents to Your Knowledge Base</h2>
            <p className="text-white/60 text-sm">
              Upload text files (.txt, .md, .csv, .json) or paste content directly. 
              Documents will be converted to vector embeddings and stored in Qdrant 
              for semantic search in the chatbot.
            </p>
          </div>

          {/* File Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? "border-blue-400 bg-blue-400/10"
                : file
                ? "border-green-400/50 bg-green-400/5"
                : "border-white/20 hover:border-white/40 bg-white/5"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="w-12 h-12 text-white/30" />
                </div>
                <div>
                  <p className="text-lg font-medium">Drop a file here</p>
                  <p className="text-sm text-white/40 mt-1">or click to browse</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Select File
                </button>
                <p className="text-xs text-white/30">Supports: .txt, .md, .csv, .json, .pdf (text extraction may vary)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.json,.pdf,.html,.xml,.yaml,.yml,.log"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getFileIcon()}
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearFile}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/40" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-white/30">or paste content</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Text Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/60">Paste Text Content</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your document content here..."
              className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
              disabled={!!file}
            />
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={file ? file.name.replace(/\.[^/.]+$/, "") : "Document title"}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="business">Business</option>
                <option value="research">Research</option>
                <option value="documentation">Documentation</option>
                <option value="faq">FAQ</option>
                <option value="product">Product</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">Source Label</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., user-manual, knowledge-base"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
              />
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || (!file && !textInput.trim())}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/30 disabled:cursor-not-allowed rounded-xl font-medium transition-all"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading to Qdrant...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload to Knowledge Base
              </>
            )}
          </button>

          {/* Result Message */}
          {result && (
            result.success ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl overflow-hidden">
                {/* Success Header */}
                <div className="flex items-start gap-3 p-4 text-green-400 border-b border-green-500/20">
                  <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-green-300">Upload Successful ✅</p>
                    <p className="text-sm mt-1 opacity-80">{result.message}</p>
                  </div>
                </div>
                
                {/* Details Section */}
                <div className="p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white/60 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Stored Document Details
                  </h3>
                  
                  {result.details && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Title</span>
                        </div>
                        <p className="text-sm font-medium text-white truncate">{result.title || 'Untitled'}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                          <FileType className="w-3.5 h-3.5" />
                          <span>File Type</span>
                        </div>
                        <p className="text-sm font-medium text-white uppercase">{result.fileType || 'text'}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                          <Database className="w-3.5 h-3.5" />
                          <span>Raw File Size</span>
                        </div>
                        <p className="text-sm font-medium text-white">{result.details.rawFileSize}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                          <TextSelect className="w-3.5 h-3.5" />
                          <span>Extracted Text</span>
                        </div>
                        <p className="text-sm font-medium text-white">{result.details.extractedTextLength}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                          <Hash className="w-3.5 h-3.5" />
                          <span>Word Count</span>
                        </div>
                        <p className="text-sm font-medium text-white">{result.details.wordCount}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                          <BookText className="w-3.5 h-3.5" />
                          <span>Line Count</span>
                        </div>
                        <p className="text-sm font-medium text-white">{result.details.lineCount}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Extraction Method & Storage */}
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Extraction Method:</span>
                      <span className="text-blue-400 font-medium">{result.extractionMethod || result.details?.extractionMethod}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Database className="w-3.5 h-3.5" />
                      <span>Storage:</span>
                      <span className="text-blue-400 font-medium">{result.details?.storage}</span>
                    </div>
                  </div>
                  
                  {result.id && (
                    <div className="mt-2 pt-3 border-t border-white/10">
                      <p className="text-xs text-white/30 font-mono">
                        Document ID: <span className="text-white/50">{result.id}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-red-500/10 border-red-500/30 text-red-400">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm mt-1 opacity-80">{result.message}</p>
                </div>
              </div>
            )
          )}

          {/* Back to Chat */}
          <div className="text-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Chat Interface
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
