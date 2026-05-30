'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle, XCircle, AlertTriangle, RefreshCw,
  ExternalLink, Shield, Database, Link2, FileText,
} from 'lucide-react'
import { VerificationResult, VerificationCheck } from '@/types'
import TrustScore from './TrustScore'

interface Props {
  result: VerificationResult
  onReset: () => void
}

export default function VerificationCenter({ result, onReset }: Props) {
  const { trustReport, walrus, suiReceipt, extracted, invoiceFile } = result

  const isApproved = trustReport.verdict === 'APPROVED'
  const isBlocked  = trustReport.verdict === 'BLOCKED'
  const isFlagged  = trustReport.verdict === 'FLAGGED'

  const verdictColor  = isApproved ? '#4ade80' : isBlocked ? '#f87171' : '#fbbf24'
  const verdictBg     = isApproved
    ? 'radial-gradient(circle, rgba(74,222,128,0.18) 0%, rgba(74,222,128,0.04) 100%)'
    : isBlocked
    ? 'radial-gradient(circle, rgba(248,113,113,0.18) 0%, rgba(248,113,113,0.04) 100%)'
    : 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(251,191,36,0.04) 100%)'

  const timelineItems = [
    { label: 'Invoice Uploaded',        sub: `${invoiceFile.originalName}` },
    { label: 'Stored on Walrus',         sub: `Blob ID: ${walrus.blobId.slice(0, 12)}…` },
    { label: 'AI Extraction Completed',  sub: `Fields extracted from document` },
    { label: 'Verification Checks',      sub: `${trustReport.checks.filter(c => c.status === 'pass').length}/${trustReport.checks.length} checks passed` },
    { label: 'Sui Receipt Generated',    sub: `Txn: ${suiReceipt.txHash.slice(0, 10)}…`, last: true },
  ]

  const riskIndicators = [
    { label: 'IBAN Match',          val: isBlocked ? 'Mismatch' : 'Match',      pass: !isBlocked },
    { label: 'Supplier Verified',   val: isBlocked ? 'Unknown'  : 'Verified',   pass: !isBlocked },
    { label: 'Duplicate Check',     val: isFlagged || isBlocked ? 'Duplicate' : 'Clear', pass: !isFlagged && !isBlocked },
    { label: 'Metadata Consistent', val: isFlagged ? 'Issues'   : 'Consistent', pass: !isFlagged },
    { label: 'Invoice Freshness',   val: isBlocked ? 'Stale'    : 'Valid',      pass: !isBlocked },
    { label: 'Provenance',          val: isBlocked ? 'Low'      : 'High',       pass: !isBlocked },
  ]

  return (
    <div className="space-y-4">

      {/* ── ROW 1: Trust Score | Timeline | Verdict ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Trust Score */}
        <Card>
          <CardLabel>Trust Score</CardLabel>
          <div className="flex items-end gap-5 mb-4">
            <TrustScore score={trustReport.trustScore} verdict={trustReport.verdict} size="sm" hideLabel />
            <div className="pb-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-light text-white leading-none">{trustReport.trustScore}</span>
                <span className="text-white/25 text-base">/100</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: verdictColor }} />
                <span className="text-xs capitalize" style={{ color: verdictColor }}>
                  {trustReport.verdict.charAt(0) + trustReport.verdict.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-white/8 mb-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trustReport.trustScore}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-full rounded-full"
              style={{ background: verdictColor }}
            />
          </div>

          <p className="text-white/30 text-xs leading-relaxed">{trustReport.summary}</p>
        </Card>

        {/* Verification Timeline */}
        <Card>
          <CardLabel>Verification Timeline</CardLabel>
          <div className="space-y-3 mt-1">
            {timelineItems.map(({ label, sub, last }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="flex items-start gap-3"
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-5 h-5 rounded-full border flex items-center justify-center"
                    style={{ background: `${verdictColor}18`, borderColor: `${verdictColor}40` }}>
                    <CheckCircle className="w-3 h-3" style={{ color: verdictColor }} />
                  </div>
                  {!last && <div className="w-px h-3 bg-white/8 mt-0.5" />}
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium leading-tight">{label}</p>
                  <p className="text-white/25 text-[11px] mt-0.5 font-mono">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Verdict */}
        <Card className="flex flex-col items-center justify-center text-center py-6">
          <CardLabel className="self-start mb-4">Verdict</CardLabel>
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: verdictBg,
              border: `1px solid ${verdictColor}35`,
              boxShadow: `0 0 40px ${verdictColor}20`,
            }}
          >
            {isApproved
              ? <Shield className="w-10 h-10" style={{ color: verdictColor }} />
              : isBlocked
              ? <XCircle className="w-10 h-10" style={{ color: verdictColor }} />
              : <AlertTriangle className="w-10 h-10" style={{ color: verdictColor }} />
            }
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg font-bold tracking-wide mb-2"
            style={{ color: verdictColor }}
          >
            PAYMENT {trustReport.verdict}
          </motion.p>
          <p className="text-white/30 text-xs leading-relaxed max-w-[200px]">
            {isApproved
              ? 'All verification checks passed. This invoice is safe to process.'
              : isBlocked
              ? 'Critical fraud signal detected. Payment has been blocked.'
              : 'Manual review required before payment can proceed.'
            }
          </p>
        </Card>
      </motion.div>

      {/* ── ROW 2: Invoice | Walrus | Sui | Risk ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Invoice Preview */}
        <Card>
          <CardLabel>Invoice Preview</CardLabel>
          <p className="text-white/70 text-sm font-semibold mt-2">
            {extracted.supplierName.toUpperCase()}
          </p>
          <p className="text-white/25 text-xs mb-3">Invoice {extracted.invoiceId}</p>
          {[
            { l: 'Date',     v: extracted.invoiceDate },
            { l: 'Amount',   v: `${extracted.currency} ${extracted.amount}` },
            { l: 'IBAN',     v: extracted.iban, flag: isBlocked },
          ].map(({ l, v, flag }) => (
            <div key={l} className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-white/25 text-[11px]">{l}</span>
              <div className="flex items-center gap-1.5">
                {flag && <span className="text-[9px] text-red-400/70 border border-red-400/20 px-1 rounded">mismatch</span>}
                <span className={`text-[11px] font-mono ${flag ? 'text-red-400/80' : 'text-white/50'}`}>{v}</span>
              </div>
            </div>
          ))}
          {walrus.status === 'stored' ? (
            <a
              href={`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${walrus.blobId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 text-white/30 text-[11px] hover:text-white/60 transition-colors"
            >
              View Full Invoice <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="mt-3 flex items-center gap-1.5 text-white/15 text-[11px] cursor-not-allowed">
              View Full Invoice <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </Card>

        {/* Walrus Storage */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <CardLabel>Walrus Storage</CardLabel>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
              walrus.status === 'stored'
                ? 'border-[#4ade80]/25 text-[#4ade80]/70 bg-[#4ade80]/8'
                : 'border-yellow-400/25 text-yellow-400/70 bg-yellow-400/8'
            }`}>
              {walrus.status === 'stored' ? '● Stored' : '◌ Fallback'}
            </span>
          </div>
          {[
            { l: 'Blob ID',      v: `${walrus.blobId.slice(0, 12)}…` },
            { l: 'Status',       v: walrus.status === 'stored' ? 'Stored' : 'Cached', green: walrus.status === 'stored' },
            { l: 'Hash (SHA256)', v: `${walrus.fileHash.slice(0, 8)}…` },
            { l: 'Size',         v: `${(walrus.size / 1024).toFixed(1)} KB` },
            { l: 'Stored At',    v: new Date(walrus.uploadedAt).toLocaleTimeString() },
          ].map(({ l, v, green }) => (
            <div key={l} className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-white/25 text-[11px]">{l}</span>
              <span className={`text-[11px] font-mono ${green ? 'text-[#4ade80]' : 'text-white/50'}`}>{v}</span>
            </div>
          ))}
          {walrus.status === 'stored' ? (
            <a
              href={`https://walruscan.com/testnet/blob/${walrus.blobId}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 text-white/30 text-[11px] hover:text-white/60 transition-colors"
            >
              View on Walrus Explorer <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="mt-3 flex items-center gap-1.5 text-white/15 text-[11px] cursor-not-allowed">
              Walrus unavailable — fallback mode <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </Card>

        {/* Sui Receipt */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <CardLabel>Sui Receipt</CardLabel>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
              suiReceipt.status === 'confirmed'
                ? 'border-[#4ade80]/25 text-[#4ade80]/70 bg-[#4ade80]/8'
                : 'border-yellow-400/25 text-yellow-400/70 bg-yellow-400/8'
            }`}>
              {suiReceipt.status === 'confirmed' ? '● Confirmed' : '◌ Pending'}
            </span>
          </div>
          {[
            { l: 'Transaction Hash', v: `${suiReceipt.txHash.slice(0, 12)}…` },
            { l: 'Status',           v: suiReceipt.status,          green: suiReceipt.status === 'confirmed' },
            { l: 'Network',          v: suiReceipt.network },
            { l: 'Timestamp',        v: new Date(suiReceipt.timestamp).toLocaleTimeString() },
            { l: 'Infrastructure',   v: 'Tatum RPC' },
          ].map(({ l, v, green }) => (
            <div key={l} className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-white/25 text-[11px]">{l}</span>
              <span className={`text-[11px] font-mono ${green ? 'text-[#4ade80]' : 'text-white/50'}`}>{v}</span>
            </div>
          ))}
          {suiReceipt.status === 'confirmed' ? (
            <a
              href={suiReceipt.explorerUrl}
              target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center gap-1.5 text-white/30 text-[11px] hover:text-white/60 transition-colors"
            >
              View on Sui Explorer <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="mt-3 flex items-center gap-1.5 text-white/15 text-[11px] cursor-not-allowed">
              Receipt pending — not yet on-chain <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </Card>

        {/* Risk Indicators */}
        <Card>
          <CardLabel>Risk Indicators</CardLabel>
          <div className="mt-2 space-y-2">
            {riskIndicators.map(({ label, val, pass }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {pass
                    ? <CheckCircle className="w-3 h-3 text-[#4ade80] shrink-0" />
                    : <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                  }
                  <span className="text-white/40 text-[11px]">{label}</span>
                </div>
                <span className={`text-[11px] font-medium ${pass ? 'text-[#4ade80]/70' : 'text-red-400/80'}`}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── ROW 3: Verification checks breakdown ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardLabel className="mb-4">Verification Checks</CardLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
            {trustReport.checks.map((check, i) => (
              <CheckScoreRow key={i} check={check} index={i} />
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Bottom trust bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-6 py-3 border-t border-white/5">
        {[
          { icon: '🔒', text: 'End-to-end encrypted' },
          { icon: '⛓', text: 'Immutable on Sui' },
          { icon: '◈', text: 'Stored on Walrus' },
        ].map(({ icon, text }, i) => (
          <div key={text} className="flex items-center gap-1.5 text-white/20 text-xs">
            {i > 0 && <span className="text-white/10 hidden md:block">•</span>}
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* Reset */}
      <motion.button
        onClick={onReset}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl border border-white/8 text-white/25 text-sm flex items-center justify-center gap-2 hover:border-white/15 hover:text-white/50 transition-all"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Verify Another Invoice
      </motion.button>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-4 border border-white/[0.07] ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {children}
    </div>
  )
}

function CardLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-white/30 text-[10px] uppercase tracking-widest font-light ${className}`}>
      {children}
    </p>
  )
}

function CheckScoreRow({ check, index }: { check: VerificationCheck; index: number }) {
  const isPass = check.status === 'pass'
  const isFail = check.status === 'fail'
  const Icon   = isPass ? CheckCircle : isFail ? XCircle : AlertTriangle
  const color  = isPass ? '#4ade80' : isFail ? '#f87171' : '#fbbf24'

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + index * 0.05 }}
      className="flex items-center gap-2.5"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      <span className="text-white/45 text-xs flex-1 truncate">{check.name}</span>
      <span className="text-white/30 text-xs font-mono shrink-0 tabular-nums">
        {check.scoreContribution} / {check.weight}
      </span>
    </motion.div>
  )
}
