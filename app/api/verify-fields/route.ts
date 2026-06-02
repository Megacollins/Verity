// ─── POST /api/verify-fields ──────────────────────────────────────────────────
//
// MCP-facing endpoint — accepts pre-extracted invoice fields (no PDF required).
// Called by the Verity MCP server when an AI agent passes structured data.
//
// This allows AI agents to verify invoices programmatically without
// needing to upload a PDF file.

import { NextRequest, NextResponse } from 'next/server'
import { runVerification } from '@/lib/verification'
import { ExtractedInvoice } from '@/types'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      supplierName,
      iban,
      invoiceId,
      amount,
      currency = 'EUR',
      invoiceDate,
      supplierEmail = '',
      description = '',
    } = body

    if (!supplierName || !iban || !invoiceId || !amount || !invoiceDate) {
      return NextResponse.json(
        { error: 'Missing required fields: supplierName, iban, invoiceId, amount, invoiceDate' },
        { status: 400 }
      )
    }

    const extracted: ExtractedInvoice = {
      invoiceId,
      supplierName,
      supplierEmail,
      iban,
      amount: String(amount),
      currency,
      invoiceDate,
      description,
    }

    // Generate a deterministic hash from the invoice fields
    const fileHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(extracted))
      .digest('hex')

    const trustReport = runVerification(extracted, fileHash)

    return NextResponse.json({
      success: true,
      extracted,
      trustReport,
      source: 'mcp-fields',
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Verification failed', detail: (err as Error).message },
      { status: 500 }
    )
  }
}
