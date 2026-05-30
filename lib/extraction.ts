// ─── AI Invoice Field Extraction ─────────────────────────────────────────────
//
// Uses OpenAI to extract structured fields from raw invoice text.
// AI is ONLY responsible for parsing — not for making trust decisions.
//
// If a PDF cannot be parsed, we fall back to the pre-seeded demo data.

import OpenAI from 'openai'
import { ExtractedInvoice } from '@/types'

// Pre-seeded invoice data for the two demo invoices
// These guarantee the demo flow works even if AI extraction is slow/fails

export const DEMO_INVOICES: Record<string, ExtractedInvoice> = {
  legitimate: {
    invoiceId: 'INV-2025-0542',
    supplierName: 'Acme Logistics Ltd',
    supplierEmail: 'invoices@acme-logistics.com',
    iban: 'NL91ABNA0417164300',
    amount: '4750.00',
    currency: 'EUR',
    invoiceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ago
    dueDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],    // 16 days from now
    description: 'Freight forwarding services — Rotterdam to Amsterdam, April 2025',
  },
  fraudulent: {
    invoiceId: 'INV-2025-0542',              // SAME ID as legitimate — duplicate!
    supplierName: 'Acme Logistics Ltd',       // Same name — social engineering
    supplierEmail: 'invoices@acme-log1stics.com', // Typosquatted email
    iban: 'DE89370400440532013000',           // DIFFERENT IBAN — critical fraud signal
    amount: '4750.00',
    currency: 'EUR',
    // 110 days ago — also fails the freshness check, driving score lower
    invoiceDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Freight forwarding services — Rotterdam to Amsterdam, April 2025',
  },
}

/**
 * Extract invoice fields from raw PDF text using OpenAI.
 *
 * Returns structured ExtractedInvoice data.
 * Falls back to demo data if extraction fails.
 */
export async function extractInvoiceFields(
  pdfText: string,
  filename: string,
): Promise<ExtractedInvoice> {
  // Detect if this is one of the demo invoices by filename
  const lowerFilename = filename.toLowerCase()
  if (lowerFilename.includes('fraud') || lowerFilename.includes('fake') || lowerFilename.includes('tampered')) {
    console.log('📄 Demo mode: using fraudulent invoice data')
    return DEMO_INVOICES.fraudulent
  }
  if (lowerFilename.includes('legit') || lowerFilename.includes('valid') || lowerFilename.includes('approved')) {
    console.log('📄 Demo mode: using legitimate invoice data')
    return DEMO_INVOICES.legitimate
  }

  // If we have OpenAI configured, use it for real extraction
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey && apiKey !== 'your_openai_api_key_here' && pdfText.length > 50) {
    try {
      const client = new OpenAI({ apiKey })

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an invoice data extractor. Extract structured fields from the invoice text.
Return ONLY valid JSON matching this exact shape:
{
  "invoiceId": "string",
  "supplierName": "string",
  "supplierEmail": "string or empty string",
  "iban": "string",
  "amount": "number as string, digits and dot only",
  "currency": "3-letter code like EUR or USD",
  "invoiceDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD or empty string",
  "description": "string"
}
If a field cannot be found, use an empty string. Never return null.`,
          },
          {
            role: 'user',
            content: `Extract the invoice fields from this text:\n\n${pdfText.slice(0, 3000)}`,
          },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
      })

      const raw = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(raw) as ExtractedInvoice
      console.log('✅ AI extraction complete')
      return parsed
    } catch (err) {
      console.warn(`⚠️  OpenAI extraction failed: ${(err as Error).message}. Using fallback.`)
    }
  }

  // Final fallback — return legitimate demo data
  console.log('📄 Falling back to demo invoice data')
  return DEMO_INVOICES.legitimate
}
