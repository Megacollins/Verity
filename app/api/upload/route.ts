// ─── POST /api/upload ─────────────────────────────────────────────────────────
//
// Step 1 of the pipeline:
//   1. Receive invoice PDF via multipart form
//   2. Hash the file
//   3. Upload to Walrus
//   4. Return blob ID, hash, timestamp

import { NextRequest, NextResponse } from 'next/server'
import { uploadToWalrus } from '@/lib/walrus'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('invoice') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No invoice file provided' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    console.log(`📤 Uploading "${file.name}" (${file.size} bytes) to Walrus...`)

    // Upload to Walrus — this returns real blob ID or graceful fallback
    const walrusResult = await uploadToWalrus(fileBuffer, file.name)

    return NextResponse.json({
      success: true,
      filename: file.name,
      size: file.size,
      walrus: walrusResult,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { error: 'Upload failed', detail: (err as Error).message },
      { status: 500 }
    )
  }
}
