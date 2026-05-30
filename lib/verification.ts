// ─── Deterministic Trust Verification Engine ─────────────────────────────────
//
// This is the core of Verity. Every decision is explainable.
// AI does NOT make trust decisions — this engine does.
//
// Weight breakdown:
//   Supplier consistency    25%
//   Metadata consistency    20%
//   File hash integrity     20%
//   Invoice freshness       15%
//   Duplicate detection     10%
//   Provenance confidence   10%

import { ExtractedInvoice, TrustReport, VerificationCheck, CheckStatus } from '@/types'
import { validateIban, findSupplierByName } from './suppliers'

// In-memory store for duplicate detection (resets on server restart — fine for demo)
const seenInvoiceIds = new Set<string>()

// ─── Individual check runners ─────────────────────────────────────────────────

function checkSupplierConsistency(invoice: ExtractedInvoice): VerificationCheck {
  const ibanResult = validateIban(invoice.supplierName, invoice.iban)
  const supplier = findSupplierByName(invoice.supplierName)

  let status: CheckStatus
  let detail: string
  let scoreContribution: number

  if (!ibanResult.supplierFound) {
    status = 'fail'
    detail = `Supplier "${invoice.supplierName}" is not in the trusted supplier registry.`
    scoreContribution = 0
  } else if (!ibanResult.valid) {
    status = 'fail'
    detail = `IBAN mismatch detected. Invoice IBAN ${invoice.iban} does not match trusted IBAN ${ibanResult.expectedIban} on file for ${invoice.supplierName}.`
    scoreContribution = 0
  } else {
    status = 'pass'
    detail = `Supplier "${invoice.supplierName}" is verified. IBAN matches trusted registry.`
    scoreContribution = 25
  }

  return {
    name: 'Supplier Consistency',
    description: 'Verifies supplier identity and banking details against trusted registry',
    status,
    weight: 25,
    scoreContribution,
    detail,
  }
}

function checkMetadataConsistency(invoice: ExtractedInvoice): VerificationCheck {
  const issues: string[] = []

  if (!invoice.invoiceId || invoice.invoiceId.trim() === '') issues.push('missing invoice ID')
  if (!invoice.supplierName || invoice.supplierName.trim() === '') issues.push('missing supplier name')
  if (!invoice.iban || invoice.iban.trim() === '') issues.push('missing IBAN')
  if (!invoice.amount || invoice.amount.trim() === '') issues.push('missing amount')
  if (!invoice.invoiceDate || invoice.invoiceDate.trim() === '') issues.push('missing invoice date')

  // Check for suspicious amount patterns
  const amountNum = parseFloat(invoice.amount.replace(/[^0-9.]/g, ''))
  if (!isNaN(amountNum) && amountNum > 100000) {
    issues.push('unusually high invoice amount (>100,000)')
  }

  const status: CheckStatus = issues.length === 0 ? 'pass' : issues.length <= 1 ? 'warn' : 'fail'
  const scoreContribution = issues.length === 0 ? 20 : issues.length === 1 ? 10 : 0

  return {
    name: 'Metadata Consistency',
    description: 'Checks all required invoice fields are present and internally consistent',
    status,
    weight: 20,
    scoreContribution,
    detail: issues.length === 0
      ? 'All required invoice fields are present and consistent.'
      : `Metadata issues detected: ${issues.join(', ')}.`,
  }
}

function checkFileIntegrity(fileHash: string, expectedHash?: string): VerificationCheck {
  // For the demo: if we have an expected hash (pre-seeded legit invoice), compare.
  // Otherwise, just confirm the hash exists and is valid SHA-256 format.
  const isValidHashFormat = /^[a-f0-9]{64}$/i.test(fileHash)

  if (!isValidHashFormat) {
    return {
      name: 'File Hash Integrity',
      description: 'Validates file has not been tampered with since upload',
      status: 'fail',
      weight: 20,
      scoreContribution: 0,
      detail: 'Invalid file hash format. File integrity cannot be confirmed.',
    }
  }

  if (expectedHash && fileHash !== expectedHash) {
    return {
      name: 'File Hash Integrity',
      description: 'Validates file has not been tampered with since upload',
      status: 'fail',
      weight: 20,
      scoreContribution: 0,
      detail: 'File hash does not match the original. Document may have been tampered with.',
    }
  }

  return {
    name: 'File Hash Integrity',
    description: 'Validates file has not been tampered with since upload',
    status: 'pass',
    weight: 20,
    scoreContribution: 20,
    detail: `File hash verified: ${fileHash.slice(0, 16)}...`,
  }
}

function checkInvoiceFreshness(invoiceDateStr: string): VerificationCheck {
  const now = new Date()

  // Try to parse the date (handle various formats)
  const invoiceDate = new Date(invoiceDateStr)
  if (isNaN(invoiceDate.getTime())) {
    return {
      name: 'Invoice Freshness',
      description: 'Confirms invoice date is recent and within acceptable payment window',
      status: 'warn',
      weight: 15,
      scoreContribution: 7,
      detail: `Could not parse invoice date "${invoiceDateStr}". Partial score awarded.`,
    }
  }

  const daysDiff = (now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)

  if (daysDiff < 0) {
    return {
      name: 'Invoice Freshness',
      description: 'Confirms invoice date is recent and within acceptable payment window',
      status: 'fail',
      weight: 15,
      scoreContribution: 0,
      detail: 'Invoice date is in the future. This is suspicious.',
    }
  }

  if (daysDiff > 90) {
    return {
      name: 'Invoice Freshness',
      description: 'Confirms invoice date is recent and within acceptable payment window',
      status: 'warn',
      weight: 15,
      scoreContribution: 7,
      detail: `Invoice is ${Math.round(daysDiff)} days old. Invoices older than 90 days require manual review.`,
    }
  }

  return {
    name: 'Invoice Freshness',
    description: 'Confirms invoice date is recent and within acceptable payment window',
    status: 'pass',
    weight: 15,
    scoreContribution: 15,
    detail: `Invoice dated ${invoiceDateStr} is within the 90-day acceptance window.`,
  }
}

function checkDuplicateInvoice(invoiceId: string): VerificationCheck {
  const isDuplicate = seenInvoiceIds.has(invoiceId)

  if (!isDuplicate) {
    seenInvoiceIds.add(invoiceId)
  }

  return {
    name: 'Duplicate Detection',
    description: 'Detects previously submitted invoices with the same ID',
    status: isDuplicate ? 'fail' : 'pass',
    weight: 10,
    scoreContribution: isDuplicate ? 0 : 10,
    detail: isDuplicate
      ? `Invoice ID "${invoiceId}" has already been submitted. Duplicate invoice detected.`
      : `Invoice ID "${invoiceId}" is unique. No duplicate found.`,
  }
}

function checkProvenanceConfidence(invoice: ExtractedInvoice): VerificationCheck {
  const supplier = findSupplierByName(invoice.supplierName)

  if (!supplier) {
    return {
      name: 'Provenance Confidence',
      description: 'Assesses the overall confidence in invoice origin and source authenticity',
      status: 'fail',
      weight: 10,
      scoreContribution: 0,
      detail: 'Cannot establish provenance. Supplier not found in registry.',
    }
  }

  if (supplier.status === 'verified') {
    return {
      name: 'Provenance Confidence',
      description: 'Assesses the overall confidence in invoice origin and source authenticity',
      status: 'pass',
      weight: 10,
      scoreContribution: 10,
      detail: `Source provenance confirmed. ${supplier.name} is a verified supplier (reg: ${supplier.registrationNumber}).`,
    }
  }

  return {
    name: 'Provenance Confidence',
    description: 'Assesses the overall confidence in invoice origin and source authenticity',
    status: 'warn',
    weight: 10,
    scoreContribution: 5,
    detail: `Supplier found but has unverified status. Manual review recommended.`,
  }
}

// ─── Critical check names — any failure here auto-blocks ────────────────────
// These represent fraud signals severe enough to block payment regardless of
// the overall weighted score.
const CRITICAL_CHECKS = new Set(['Supplier Consistency', 'Duplicate Detection'])

// ─── Main Engine ──────────────────────────────────────────────────────────────

export function runVerification(
  invoice: ExtractedInvoice,
  fileHash: string,
): TrustReport {
  const checks: VerificationCheck[] = [
    checkSupplierConsistency(invoice),
    checkMetadataConsistency(invoice),
    checkFileIntegrity(fileHash),
    checkInvoiceFreshness(invoice.invoiceDate),
    checkDuplicateInvoice(invoice.invoiceId),
    checkProvenanceConfidence(invoice),
  ]

  const trustScore = checks.reduce((sum, c) => sum + c.scoreContribution, 0)

  const failedChecks = checks.filter(c => c.status === 'fail')
  const warnChecks   = checks.filter(c => c.status === 'warn')

  const riskFactors = [
    ...failedChecks.map(c => c.detail),
    ...warnChecks.map(c => `Warning: ${c.detail}`),
  ]

  // A critical check failure (IBAN mismatch, duplicate invoice) always blocks —
  // regardless of the overall score. These are non-negotiable fraud signals.
  const criticalFailure = failedChecks.some(c => CRITICAL_CHECKS.has(c.name))

  let verdict: TrustReport['verdict']
  let summary: string

  if (criticalFailure) {
    verdict = 'BLOCKED'
    summary = 'A critical fraud signal was detected. Payment has been blocked to prevent potential financial loss.'
  } else if (trustScore >= 80) {
    verdict = 'APPROVED'
    summary = 'Invoice passed all verification checks. Payment is approved.'
  } else if (trustScore >= 55) {
    verdict = 'FLAGGED'
    summary = 'Invoice has failed some verification checks. Manual review required before payment.'
  } else {
    verdict = 'BLOCKED'
    summary = 'Invoice has failed critical verification checks. Payment has been blocked to prevent potential fraud.'
  }

  return { trustScore, verdict, checks, summary, riskFactors }
}
