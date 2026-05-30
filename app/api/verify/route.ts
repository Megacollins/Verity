// ─── POST /api/verify ─────────────────────────────────────────────────────────
//
// Step 2 of the pipeline:
//   1. Receive the file + metadata from the upload step
//   2. Extract invoice fields (AI-assisted)
//   3. Run deterministic verification engine
//   4. Return full trust report

import { NextRequest, NextResponse } from 'next/server'
import { extractInvoiceFields } from '@/lib/extraction'
import { runVerification } from '@/lib/verification'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('invoice') as File | null
    const fileHash = formData.get('fileHash') as string | null

    if (!file || !fileHash) {
      return NextResponse.json(
        { error: 'Missing invoice file or fileHash' },
        { status: 400 }
      )
    }

    // For the demo, filename-based detection is used in extractInvoiceFields.
    // Full OCR extraction can be added post-hackathon with a proper PDF parser.
    const pdfText = ''

    // AI field extraction
    const extracted = await extractInvoiceFields(pdfText, file.name)
    console.log('🔍 Extracted invoice fields:', extracted)

    // Deterministic trust verification
    const trustReport = runVerification(extracted, fileHash)
    console.log(`📊 Trust Score: ${trustReport.trustScore} — ${trustReport.verdict}`)

    return NextResponse.json({
      success: true,
      extracted,
      trustReport,
    })
  } catch (err) {
    console.error('Verification error:', err)
    return NextResponse.json(
      { error: 'Verification failed', detail: (err as Error).message },
      { status: 500 }
    )
  }
}
