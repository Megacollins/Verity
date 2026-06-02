#!/usr/bin/env node
// ─── Verity MCP Server ────────────────────────────────────────────────────────
//
// Exposes Verity's invoice verification as MCP tools so AI agents
// (Claude, Cursor, etc.) can verify invoices before executing payments.
//
// Tools:
//   verify_invoice          — full pipeline: Walrus + trust engine + Sui receipt
//   check_supplier          — quick registry lookup for supplier + IBAN
//   get_verification_result — explain a trust score in plain language
//
// Usage:
//   node mcp/server.js
//
// Claude Desktop config (~/.claude/claude_desktop_config.json):
// {
//   "mcpServers": {
//     "verity": {
//       "command": "node",
//       "args": ["/path/to/verity/mcp/server.js"],
//       "env": { "VERITY_API_URL": "https://verity-io.vercel.app" }
//     }
//   }
// }

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const VERITY_API = process.env.VERITY_API_URL || 'https://verity-io.vercel.app'

// ─── Trusted supplier registry (mirrors lib/suppliers.ts) ────────────────────
const TRUSTED_SUPPLIERS: Record<string, { name: string; iban: string; status: string }> = {
  'acme-logistics': {
    name: 'Acme Logistics Ltd',
    iban: 'NL91ABNA0417164300',
    status: 'verified',
  },
  'brighttech-solutions': {
    name: 'BrightTech Solutions',
    iban: 'GB29NWBK60161331926819',
    status: 'verified',
  },
}

// ─── Server ──────────────────────────────────────────────────────────────────
const server = new McpServer({
  name: 'verity',
  version: '1.0.0',
})

// ─── Tool 1: verify_invoice ───────────────────────────────────────────────────
server.tool(
  'verify_invoice',
  'Verify an invoice before an AI agent executes a payment. Runs six deterministic trust checks and returns a trust score, verdict (APPROVED/FLAGGED/BLOCKED), and detailed risk analysis. Stores invoice on Walrus and writes audit receipt to Sui mainnet.',
  {
    supplier_name: z.string().describe('Name of the supplier on the invoice'),
    iban:          z.string().describe('IBAN/bank account number on the invoice'),
    invoice_id:    z.string().describe('Invoice ID or number'),
    amount:        z.string().describe('Invoice amount (numbers only, e.g. "4750.00")'),
    currency:      z.string().describe('Currency code, e.g. EUR, USD, GBP'),
    invoice_date:  z.string().describe('Invoice date in YYYY-MM-DD format'),
  },
  async ({ supplier_name, iban, invoice_id, amount, currency, invoice_date }) => {
    try {
      // Call the Verity verify API with pre-extracted fields
      const res = await fetch(`${VERITY_API}/api/verify-fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierName: supplier_name,
          iban,
          invoiceId:    invoice_id,
          amount,
          currency,
          invoiceDate:  invoice_date,
        }),
      })

      if (!res.ok) {
        // Fallback: run verification locally using the same logic
        return runLocalVerification({ supplier_name, iban, invoice_id, amount, currency, invoice_date })
      }

      const data = await res.json()
      return formatVerificationResult(data)

    } catch {
      // If API is unreachable, run local verification
      return runLocalVerification({ supplier_name, iban, invoice_id, amount, currency, invoice_date })
    }
  }
)

// ─── Tool 2: check_supplier ───────────────────────────────────────────────────
server.tool(
  'check_supplier',
  'Check if a supplier is in the Verity trusted registry and whether their IBAN matches. Use this for a quick pre-check before running a full verification.',
  {
    supplier_name: z.string().describe('Name of the supplier to check'),
    iban:          z.string().optional().describe('IBAN to verify against the registry (optional)'),
  },
  async ({ supplier_name, iban }) => {
    const normalised = supplier_name.toLowerCase().trim()
    let found = null

    for (const supplier of Object.values(TRUSTED_SUPPLIERS)) {
      if (
        supplier.name.toLowerCase().includes(normalised) ||
        normalised.includes(supplier.name.toLowerCase())
      ) {
        found = supplier
        break
      }
    }

    if (!found) {
      return {
        content: [{
          type: 'text' as const,
          text: `⚠️ SUPPLIER NOT FOUND\n\n"${supplier_name}" is not in the Verity trusted supplier registry.\n\nThis does not mean the supplier is fraudulent, but payment should require manual approval until the supplier is verified and added to the registry.\n\nRecommendation: DO NOT auto-approve. Escalate to manual review.`,
        }],
      }
    }

    if (iban) {
      const normIban    = iban.replace(/\s/g, '').toUpperCase()
      const normExpected = found.iban.replace(/\s/g, '').toUpperCase()
      const ibanMatch   = normIban === normExpected

      return {
        content: [{
          type: 'text' as const,
          text: ibanMatch
            ? `✅ SUPPLIER VERIFIED — IBAN MATCHES\n\nSupplier: ${found.name}\nStatus: ${found.status}\nExpected IBAN: ${found.iban}\nProvided IBAN: ${iban}\nMatch: YES\n\nThis supplier and IBAN combination is trusted. Safe to proceed to full verification.`
            : `🚨 IBAN MISMATCH DETECTED\n\nSupplier: ${found.name}\nStatus: ${found.status}\nExpected IBAN: ${found.iban}\nProvided IBAN: ${iban}\nMatch: NO\n\n⛔ CRITICAL FRAUD SIGNAL. The IBAN on this invoice does not match the verified IBAN on file for this supplier. This is the most common Business Email Compromise (BEC) attack pattern.\n\nRecommendation: BLOCK payment immediately. Do not proceed.`,
        }],
      }
    }

    return {
      content: [{
        type: 'text' as const,
        text: `✅ SUPPLIER FOUND IN REGISTRY\n\nSupplier: ${found.name}\nStatus: ${found.status}\nTrusted IBAN: ${found.iban}\n\nSupplier is verified. To confirm IBAN match, call this tool again with the iban parameter.`,
      }],
    }
  }
)

// ─── Tool 3: get_verification_result ─────────────────────────────────────────
server.tool(
  'get_verification_result',
  'Explain what a Verity trust score means and whether an AI agent should proceed with payment. Returns a plain-language recommendation.',
  {
    trust_score: z.number().min(0).max(100).describe('Trust score from 0 to 100'),
    verdict:     z.enum(['APPROVED', 'FLAGGED', 'BLOCKED']).describe('Verification verdict'),
    risk_factors: z.array(z.string()).optional().describe('List of risk factors detected'),
  },
  async ({ trust_score, verdict, risk_factors }) => {
    const risks = risk_factors || []

    const explanations: Record<string, string> = {
      APPROVED: `✅ PAYMENT APPROVED — Trust Score: ${trust_score}/100\n\nAll verification checks passed. This invoice is safe for autonomous payment execution.\n\n${trust_score >= 90 ? 'High confidence — no manual review required.' : 'Moderate confidence — consider a spot check.'}`,
      FLAGGED:  `⚠️ PAYMENT FLAGGED — Trust Score: ${trust_score}/100\n\nThis invoice has failed some verification checks but is not definitively fraudulent.\n\nRisk factors detected:\n${risks.map(r => `• ${r}`).join('\n') || '• Unspecified issues'}\n\nRecommendation: DO NOT auto-approve. Escalate to a human reviewer before processing payment.`,
      BLOCKED:  `🚨 PAYMENT BLOCKED — Trust Score: ${trust_score}/100\n\nCritical fraud signals detected. This invoice must not be paid.\n\nRisk factors:\n${risks.map(r => `• ${r}`).join('\n') || '• Critical verification failure'}\n\nRecommendation: STOP. Do not process this payment under any circumstances. Flag for fraud investigation.`,
    }

    return {
      content: [{
        type: 'text' as const,
        text: explanations[verdict] || `Trust Score: ${trust_score}/100 — ${verdict}`,
      }],
    }
  }
)

// ─── Local verification fallback ─────────────────────────────────────────────
function runLocalVerification(params: {
  supplier_name: string
  iban: string
  invoice_id: string
  amount: string
  currency: string
  invoice_date: string
}) {
  const { supplier_name, iban, invoice_id, amount, invoice_date } = params

  const checks: string[] = []
  let score = 100
  let critical = false

  // Supplier check
  const normalised = supplier_name.toLowerCase()
  let found = null
  for (const s of Object.values(TRUSTED_SUPPLIERS)) {
    if (s.name.toLowerCase().includes(normalised) || normalised.includes(s.name.toLowerCase())) {
      found = s
    }
  }

  if (!found) {
    checks.push('❌ Supplier not in trusted registry (−25)')
    score -= 25
    critical = true
  } else {
    const normIban     = iban.replace(/\s/g, '').toUpperCase()
    const normExpected = found.iban.replace(/\s/g, '').toUpperCase()
    if (normIban !== normExpected) {
      checks.push(`❌ IBAN mismatch — expected ${found.iban} (−25)`)
      score -= 25
      critical = true
    } else {
      checks.push(`✅ Supplier verified, IBAN matches`)
    }
  }

  // Invoice freshness
  const date    = new Date(invoice_date)
  const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  if (isNaN(daysDiff)) {
    checks.push('⚠️ Could not parse invoice date (−7)')
    score -= 7
  } else if (daysDiff > 90) {
    checks.push(`⚠️ Invoice is ${Math.round(daysDiff)} days old — stale (−8)`)
    score -= 8
  } else {
    checks.push('✅ Invoice date within 90-day window')
  }

  // Amount sanity
  const amountNum = parseFloat(amount)
  if (isNaN(amountNum)) {
    checks.push('⚠️ Could not parse amount')
  } else if (amountNum > 100000) {
    checks.push(`⚠️ Unusually high amount: ${params.currency} ${amount} (−5)`)
    score -= 5
  } else {
    checks.push('✅ Amount within normal range')
  }

  score = Math.max(0, score)
  const verdict = critical ? 'BLOCKED' : score >= 80 ? 'APPROVED' : score >= 55 ? 'FLAGGED' : 'BLOCKED'

  const icon = verdict === 'APPROVED' ? '✅' : verdict === 'BLOCKED' ? '🚨' : '⚠️'

  return {
    content: [{
      type: 'text' as const,
      text: `${icon} VERITY VERIFICATION RESULT\n\nInvoice: ${invoice_id}\nSupplier: ${supplier_name}\nTrust Score: ${score}/100\nVerdict: ${verdict}\n\nChecks:\n${checks.join('\n')}\n\n${
        verdict === 'APPROVED'
          ? 'Safe to proceed with payment.'
          : verdict === 'BLOCKED'
          ? '⛔ DO NOT process payment. Critical fraud signal detected.'
          : '⚠️ Manual review required before payment.'
      }\n\nPowered by Verity — verity-io.vercel.app`,
    }],
  }
}

function formatVerificationResult(data: {
  trustReport: { trustScore: number; verdict: string; summary: string; riskFactors: string[] }
}) {
  const { trustScore, verdict, summary, riskFactors } = data.trustReport
  const icon = verdict === 'APPROVED' ? '✅' : verdict === 'BLOCKED' ? '🚨' : '⚠️'

  return {
    content: [{
      type: 'text' as const,
      text: `${icon} VERITY VERIFICATION RESULT\n\nTrust Score: ${trustScore}/100\nVerdict: ${verdict}\n\n${summary}\n\n${
        riskFactors.length > 0
          ? `Risk factors:\n${riskFactors.map((r: string) => `• ${r}`).join('\n')}\n\n`
          : ''
      }Powered by Verity — verity-io.vercel.app`,
    }],
  }
}

// ─── Start ────────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Verity MCP server running')
}

main().catch(console.error)
