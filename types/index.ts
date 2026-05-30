// ─── Invoice Types ───────────────────────────────────────────────────────────

export interface ExtractedInvoice {
  invoiceId: string
  supplierName: string
  supplierEmail?: string
  iban: string
  amount: string
  currency: string
  invoiceDate: string
  dueDate?: string
  description?: string
}

// ─── Verification Types ───────────────────────────────────────────────────────

export type CheckStatus = 'pass' | 'fail' | 'warn'

export interface VerificationCheck {
  name: string
  description: string
  status: CheckStatus
  weight: number        // percentage weight in trust score (e.g. 25)
  scoreContribution: number  // actual points this check contributed
  detail: string        // human-readable explanation
}

export interface TrustReport {
  trustScore: number                  // 0–100
  verdict: 'APPROVED' | 'FLAGGED' | 'BLOCKED'
  checks: VerificationCheck[]
  summary: string
  riskFactors: string[]
}

// ─── Walrus Types ─────────────────────────────────────────────────────────────

export interface WalrusUploadResult {
  blobId: string
  fileHash: string
  uploadedAt: string    // ISO timestamp
  size: number
  status: 'stored' | 'fallback'  // fallback = Walrus was down, used local cache
}

// ─── Sui Types ────────────────────────────────────────────────────────────────

export interface SuiReceiptResult {
  txHash: string
  explorerUrl: string
  timestamp: string
  network: string
  status: 'confirmed' | 'pending' | 'failed'
}

// ─── Full Verification Result ────────────────────────────────────────────────

export interface VerificationResult {
  invoiceFile: {
    originalName: string
    fileHash: string
    size: number
  }
  walrus: WalrusUploadResult
  extracted: ExtractedInvoice
  trustReport: TrustReport
  suiReceipt: SuiReceiptResult
  completedAt: string
}
