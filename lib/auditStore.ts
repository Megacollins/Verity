// ─── Audit Trail Store ────────────────────────────────────────────────────────
// Persists verification results to localStorage.
// No database needed — works for demo + hackathon judges.

import { VerificationResult } from '@/types'

const KEY = 'verity_audit_trail'
const MAX_ENTRIES = 50  // keep last 50 verifications

export function saveToAuditTrail(result: VerificationResult): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getAuditTrail()
    const updated = [result, ...existing].slice(0, MAX_ENTRIES)
    localStorage.setItem(KEY, JSON.stringify(updated))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function getAuditTrail(): VerificationResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as VerificationResult[]) : []
  } catch {
    return []
  }
}

export function clearAuditTrail(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}
