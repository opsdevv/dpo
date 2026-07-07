import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'
import { generateSimpleEmbedding } from '@/lib/embeddings'
import { upsertToPinecone } from '@/lib/pinecone'

const require = createRequire(import.meta.url)

/**
 * Extract text from a PDF buffer using pdf-parse
 */
async function extractPDFText(buffer: Buffer): Promise<string> {
  console.log(`extractPDFText: starting extraction for buffer of size ${buffer.length}`)
  try {
    // Attempt to load pdf-parse.
    // We try multiple common entry points to handle different environment/bundler behaviors.
    let pdf;
    const searchPaths = [
      'pdf-parse',
      'pdf-parse/lib/pdf-parse.js',
      'pdf-parse/dist/pdf-parse/cjs/index.cjs'
    ];

    for (const path of searchPaths) {
      try {
        console.log(`extractPDFText: trying require('${path}')`)
        pdf = require(path)
        if (pdf) {
          console.log(`extractPDFText: successfully loaded from ${path}`)
          break
        }
      } catch (e) {
        console.log(`extractPDFText: require('${path}') failed`)
      }
    }

    if (!pdf) {
      throw new Error('Could not load pdf-parse from any known path.')
    }

    console.log('extractPDFText: pdf-parse loaded. Type:', typeof pdf)

    let text = ''

    // The mehmet-kozan/pdf-parse fork (v2.4.5+) uses a PDFParse class
    // but also tries to maintain some compatibility with the original function API.
    if (typeof pdf === 'function') {
      console.log('extractPDFText: using function API')
      const data = await pdf(buffer)
      text = data.text || ''
    } else if (pdf && pdf.PDFParse) {
      console.log('extractPDFText: using PDFParse class API')
      const parser = new pdf.PDFParse({ data: new Uint8Array(buffer), verbosity: 0 })
      const data = await parser.getText()
      text = data.text || ''
      console.log('extractPDFText: destroying parser')
      await parser.destroy().catch(() => {})
    } else if (pdf && typeof pdf.default === 'function') {
      console.log('extractPDFText: using .default function API')
      const data = await pdf.default(buffer)
      text = data.text || ''
    } else {
      const keys = pdf ? Object.keys(pdf) : []
      console.error('extractPDFText: unsupported API. Keys:', keys)
      throw new Error(`Unsupported pdf-parse API. Available keys: ${keys.join(', ')}`)
    }

    console.log(`extractPDFText: finished. Extracted ${text.length} chars.`)
    return text
  } catch (err) {
    console.error('extractPDFText error details:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed to extract text from PDF: ${message}`)
  }
}

/**
 * Process uploaded file content based on its type
 */
async function processFile(file: File): Promise<{
  content: string
  fileType: string
  fileSize: number
  extractionMethod: string
  extractedTextLength: number
  wordCount: number
  lineCount: number
}> {
  const fileName = file.name.toLowerCase()
  const fileSize = file.size
  const ext = fileName.split('.').pop() || 'unknown'
  const buffer = Buffer.from(await file.arrayBuffer())

  let content = ''
  let extractionMethod = ''

  if (ext === 'pdf') {
    // Extract text from PDF
    extractionMethod = 'pdf-parse (text extraction)'
    content = await extractPDFText(buffer)
    
    // If PDF text extraction yields very little, note it
    if (content.trim().length < 50) {
      extractionMethod += ' - ⚠️ Minimal text extracted (PDF may be scan/image-based)'
    }
  } else if (['txt', 'md', 'csv', 'json', 'html', 'xml', 'yaml', 'yml', 'log'].includes(ext)) {
    // Read as UTF-8 text
    extractionMethod = 'direct UTF-8 read'
    content = buffer.toString('utf-8')
  } else {
    // Fallback: try text
    extractionMethod = 'fallback UTF-8 read'
    content = buffer.toString('utf-8')
  }

  const extractedTextLength = content.length
  const words = content.trim() ? content.trim().split(/\s+/).length : 0
  const lines = content ? content.split('\n').length : 0

  return {
    content,
    fileType: ext,
    fileSize,
    extractionMethod,
    extractedTextLength,
    wordCount: words,
    lineCount: lines
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    env: {
      hasPineconeKey: !!process.env.PINECONE_API_KEY,
      pineconeIndex: process.env.PINECONE_INDEX,
      nodeVersion: process.version
    }
  })
}

export async function POST(request: NextRequest) {
  console.log('--- Incoming Upload Request ---')
  if (!process.env.PINECONE_API_KEY) {
    console.error('CRITICAL: PINECONE_API_KEY is missing from environment variables!')
  }

  try {
    const contentType = request.headers.get('content-type') || ''
    console.log(`Content-Type: ${contentType}`)

    if (!contentType.includes('multipart/form-data') && !contentType.includes('application/json')) {
      console.warn(`Unexpected content type: ${contentType}`)
    }

    const formData = await request.formData()
    console.log('FormData parsed successfully.')
    const file = formData.get('file') as File | null
    let title = formData.get('title') as string || ''
    const source = formData.get('source') as string || 'manual-upload'
    const category = formData.get('category') as string || 'general'
    const text = formData.get('text') as string | null

    console.log(`Request type: ${file ? 'File (' + file.name + ')' : 'Text'}`)

    // Process file upload or pasted text
    let content = text || ''
    let fileType = 'text'
    let fileSize = 0
    let extractionMethod = 'direct-input'
    let wordCount = 0
    let lineCount = 0

    if (file) {
      console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`)
      try {
        const processed = await processFile(file)
        content = processed.content
        fileType = processed.fileType
        fileSize = processed.fileSize
        extractionMethod = processed.extractionMethod
        wordCount = processed.wordCount
        lineCount = processed.lineCount
        console.log(`File processed successfully. Extracted ${content.length} chars.`)
      } catch (procErr) {
        console.error('Error during processFile:', procErr)
        throw procErr
      }

      if (!title || title === 'Untitled Document') {
        title = file.name.replace(/\.[^/.]+$/, '') // Remove extension
      }
    } else if (text) {
      // Pasted text processing
      wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
      lineCount = text ? text.split('\n').length : 0
      fileSize = text.length
      extractionMethod = 'pasted-text'
    }

    if (!title) {
      title = 'Untitled Document'
    }

    if (!content || content.trim().length === 0) {
      console.warn('No content provided in request.')
      return NextResponse.json(
        { error: 'No content provided. Upload a file or paste text.' },
        { status: 400 }
      )
    }

    // Generate a unique ID
    let id: string;
    try {
      id = crypto.randomUUID()
    } catch (e) {
      console.warn('crypto.randomUUID failed, falling back to manual UUID generation')
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    console.log(`Generated ID: ${id}`)

    // Upload to Pinecone
    console.log('Upserting to Pinecone...')
    try {
      await upsertToPinecone({
        id,
        title,
        text: content,
        source,
        category,
        fileType,
        wordCount,
        extractionMethod
      })
      console.log('Pinecone upsert complete.')
    } catch (pineconeErr) {
      console.error('Pinecone Error:', pineconeErr)
      throw pineconeErr
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      id,
      title,
      fileType,
      size: content.length,
      fileSize,
      wordCount,
      lineCount,
      extractionMethod,
      timestamp: new Date().toISOString(),
      details: {
        rawFileSize: fileSize > 0 ? `${(fileSize / 1024).toFixed(1)} KB` : 'N/A',
        extractedTextLength: `${content.length} characters`,
        wordCount: `${wordCount} words`,
        lineCount: `${lineCount} lines`,
        extractionMethod,
        storage: 'Pinecone Index (384-dim vector)'
      }
    })
  } catch (error) {
    console.error('CRITICAL UPLOAD ERROR:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
        stack: error instanceof Error ? error.stack : undefined,
        cause: error instanceof Error ? (error as any).cause : undefined
      },
      { status: 500 }
    )
  }
}
