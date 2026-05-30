// ─── POST /api/receipt ────────────────────────────────────────────────────────
//
// Step 3 of the pipeline:
//   1. Receive verification results
//   2. Write immutable receipt to Sui via Tatum RPC
//   3. Return transaction hash and explorer URL

import { NextRequest, NextResponse } from 'next/server'
import { writeVerificationReceipt } from '@/lib/sui'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceHash, walrusBlobId, trustScore, verdict, supplierName } = body

    if (!invoiceHash || !walrusBlobId || trustScore === undefined || !verdict) {
      return NextResponse.json(
        { error: 'Missing required fields: invoiceHash, walrusBlobId, trustScore, verdict' },
        { status: 400 }
      )
    }

    console.log(`🔗 Writing Sui receipt for invoice ${invoiceHash.slice(0, 16)}...`)

    const receipt = await writeVerificationReceipt({
      invoiceHash,
      walrusBlobId,
      trustScore,
      verdict,
      supplierName: supplierName || 'Unknown',
    })

    return NextResponse.json({
      success: true,
      receipt,
    })
  } catch (err) {
    console.error('Receipt error:', err)
    return NextResponse.json(
      { error: 'Receipt generation failed', detail: (err as Error).message },
      { status: 500 }
    )
  }
}
