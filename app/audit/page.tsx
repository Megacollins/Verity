'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Shield, CheckCircle, XCircle, AlertTriangle,
  ExternalLink, Database, Link2, Trash2, ArrowLeft,
  Clock, FileText, RefreshCw
} from 'lucide-react'
import { VerificationResult } from '@/types'
import { getAuditTrail, clearAuditTrail } from '@/lib/auditStore'
import Image from 'next/image'

// ─── Verdict helpers ──────────────────────────────────────────────────────────
function verdictColor(v: string) {
  return v === 'APPROVED' ? '#4ade80' : v === 'BLOCKED' ? '#f87171' : '#fbbf24'
}
function verdictBg(v: string) {
  return v === 'APPROVED' ? 'rgba(74,222,128,0.1)' : v === 'BLOCKED' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)'
}
function verdictBorder(v: string) {
  return v === 'APPROVED' ? 'rgba(74,222,128,0.25)' : v === 'BLOCKED' ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.25)'
}
function VerdictIcon({ verdict, size = 14 }: { verdict: string; size?: number }) {
  const color = verdictColor(verdict)
  const props = { style: { color }, width: size, height: size }
  return verdict === 'APPROVED'
    ? <CheckCircle {...props} />
    : verdict === 'BLOCKED'
    ? <XCircle {...props} />
    : <AlertTriangle {...props} />
}

// ─── Single entry card ────────────────────────────────────────────────────────
function AuditEntry({
  result, index, isExpanded, onToggle
}: {
  result: VerificationResult
  index: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const { trustReport, walrus, suiReceipt, extracted, invoiceFile, completedAt } = result
  const color  = verdictColor(trustReport.verdict)
  const failedChecks = trustReport.checks.filter(c => c.status === 'fail')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-white/[0.07] overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.025)' }}
    >
      {/* ── Header row — always visible ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        {/* Verdict badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0"
          style={{ color, background: verdictBg(trustReport.verdict), borderColor: verdictBorder(trustReport.verdict) }}
        >
          <VerdictIcon verdict={trustReport.verdict} size={11} />
          {trustReport.verdict}
        </div>

        {/* Score ring */}
        <div className="shrink-0 relative w-8 h-8">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3"/>
            <circle cx="16" cy="16" r="12" fill="none" stroke={color} strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 12 * (trustReport.trustScore / 100)} ${2 * Math.PI * 12}`}/>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color }}>
            {trustReport.trustScore}
          </span>
        </div>

        {/* Invoice info */}
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-sm font-medium truncate">{extracted.supplierName}</p>
          <p className="text-white/25 text-xs font-mono">{extracted.invoiceId} · {extracted.currency} {extracted.amount}</p>
        </div>

        {/* Failed checks count */}
        {failedChecks.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {failedChecks.slice(0, 2).map((c, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded border border-red-400/20 text-red-400/70 bg-red-400/8">
                {c.name.split(' ')[0]}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="shrink-0 text-right hidden md:block">
          <p className="text-white/30 text-xs">{new Date(completedAt).toLocaleDateString()}</p>
          <p className="text-white/20 text-[11px]">{new Date(completedAt).toLocaleTimeString()}</p>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-white/20"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5l4 4 4-4"/>
          </svg>
        </motion.div>
      </button>

      {/* ── Expanded detail ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Verification checks */}
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-widest mb-3">Checks</p>
                <div className="space-y-2">
                  {trustReport.checks.map((check, i) => {
                    const c = verdictColor(check.status === 'pass' ? 'APPROVED' : check.status === 'fail' ? 'BLOCKED' : 'FLAGGED')
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <VerdictIcon verdict={check.status === 'pass' ? 'APPROVED' : check.status === 'fail' ? 'BLOCKED' : 'FLAGGED'} size={11} />
                          <span className="text-white/40 text-xs">{check.name}</span>
                        </div>
                        <span className="text-white/25 text-[11px] font-mono">{check.scoreContribution}/{check.weight}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Walrus */}
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-widest mb-3">Walrus Storage</p>
                <div className="space-y-2">
                  {[
                    { l: 'Blob ID', v: walrus.blobId.slice(0, 20) + '…' },
                    { l: 'Hash',    v: walrus.fileHash.slice(0, 16) + '…' },
                    { l: 'Size',    v: `${(walrus.size / 1024).toFixed(1)} KB` },
                    { l: 'Status',  v: walrus.status === 'stored' ? '● Live' : '◌ Fallback', green: walrus.status === 'stored' },
                  ].map(({ l, v, green }) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-white/20 text-xs">{l}</span>
                      <span className={`text-xs font-mono ${green ? 'text-[#4ade80]' : 'text-white/40'}`}>{v}</span>
                    </div>
                  ))}
                  {walrus.status === 'stored' && (
                    <a
                      href={`https://walruscan.com/testnet/blob/${walrus.blobId}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-white/25 text-[11px] hover:text-white/50 transition-colors mt-1"
                    >
                      Walrus Explorer <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Sui */}
              <div>
                <p className="text-white/20 text-[10px] uppercase tracking-widest mb-3">Sui Receipt</p>
                <div className="space-y-2">
                  {[
                    { l: 'Tx Hash',  v: suiReceipt.txHash.slice(0, 16) + '…' },
                    { l: 'Network',  v: suiReceipt.network },
                    { l: 'Status',   v: suiReceipt.status === 'confirmed' ? '● Confirmed' : '◌ Pending', green: suiReceipt.status === 'confirmed' },
                    { l: 'Time',     v: new Date(suiReceipt.timestamp).toLocaleTimeString() },
                  ].map(({ l, v, green }) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-white/20 text-xs">{l}</span>
                      <span className={`text-xs font-mono ${green ? 'text-[#4ade80]' : 'text-white/40'}`}>{v}</span>
                    </div>
                  ))}
                  {suiReceipt.status === 'confirmed' && (
                    <a
                      href={suiReceipt.explorerUrl}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-white/25 text-[11px] hover:text-white/50 transition-colors mt-1"
                    >
                      Sui Explorer <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl border border-white/8 bg-white/[0.02] flex items-center justify-center mb-5">
        <Clock className="w-7 h-7 text-white/15" />
      </div>
      <p className="text-white/40 text-sm font-medium mb-2">No verifications yet</p>
      <p className="text-white/20 text-xs mb-8 max-w-xs leading-relaxed">
        Every invoice you verify will appear here with its full audit record.
      </p>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
      >
        Run First Verification
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AuditTrailPage() {
  const [entries, setEntries]     = useState<VerificationResult[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter]       = useState<'all' | 'APPROVED' | 'BLOCKED' | 'FLAGGED'>('all')
  const [mounted, setMounted]     = useState(false)

  useEffect(() => {
    setEntries(getAuditTrail())
    setMounted(true)
  }, [])

  const handleClear = () => {
    if (confirm('Clear all audit history? This cannot be undone.')) {
      clearAuditTrail()
      setEntries([])
    }
  }

  const filtered = filter === 'all'
    ? entries
    : entries.filter(e => e.trustReport.verdict === filter)

  const counts = {
    all:      entries.length,
    APPROVED: entries.filter(e => e.trustReport.verdict === 'APPROVED').length,
    BLOCKED:  entries.filter(e => e.trustReport.verdict === 'BLOCKED').length,
    FLAGGED:  entries.filter(e => e.trustReport.verdict === 'FLAGGED').length,
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0a0a' }}>

      {/* Grid bg */}
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 h-14 border-b border-white/5"
        style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)' }}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-md overflow-hidden border border-white/10 shrink-0">
            <img src="/hero.jpg" alt="Verity"
              className="w-full h-full object-cover"
              style={{ objectPosition: '62% 18%', filter: 'brightness(1.3) contrast(1.1)' }} />
          </div>
          <span className="text-white/60 font-semibold tracking-[0.15em] text-xs uppercase group-hover:text-white transition-colors">Verity</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/dashboard"
            className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Dashboard
          </Link>
          {entries.length > 0 && (
            <button onClick={handleClear}
              className="flex items-center gap-1.5 text-[11px] text-white/20 hover:text-red-400/60 transition-colors">
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Audit Trail</h1>
            <p className="text-white/30 text-sm">
              {entries.length === 0
                ? 'No verifications recorded yet'
                : `${entries.length} verification${entries.length !== 1 ? 's' : ''} recorded`}
            </p>
          </div>
          {entries.length > 0 && (
            <Link href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/40 text-xs hover:border-white/20 hover:text-white/70 transition-all">
              <RefreshCw className="w-3 h-3" />
              New Verification
            </Link>
          )}
        </div>

        {/* Filter tabs */}
        {entries.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            {(['all', 'APPROVED', 'BLOCKED', 'FLAGGED'] as const).map(f => {
              const isActive = filter === f
              const c = f === 'all' ? 'white' : verdictColor(f)
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] border transition-all ${
                    isActive ? 'border-white/15 bg-white/8 text-white/70' : 'border-white/6 text-white/25 hover:text-white/50'
                  }`}
                >
                  {f !== 'all' && <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />}
                  {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                  <span className="text-white/20">{counts[f]}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Stats row */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Approved',  count: counts.APPROVED, color: '#4ade80' },
              { label: 'Blocked',   count: counts.BLOCKED,  color: '#f87171' },
              { label: 'Flagged',   count: counts.FLAGGED,  color: '#fbbf24' },
            ].map(({ label, count, color }) => (
              <div key={label} className="rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-center">
                <p className="text-2xl font-light mb-0.5" style={{ color }}>{count}</p>
                <p className="text-white/25 text-xs">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Entries */}
        {!mounted ? null : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {filtered.map((entry, i) => {
              const id = entry.completedAt + entry.walrus.blobId
              return (
                <AuditEntry
                  key={id}
                  result={entry}
                  index={i}
                  isExpanded={expandedId === id}
                  onToggle={() => setExpandedId(expandedId === id ? null : id)}
                />
              )
            })}
          </div>
        )}
      </main>

      <footer className="relative z-10 text-center py-6 mt-8 border-t border-white/5">
        <p className="text-white/12 text-xs">
          Audit records stored locally · Immutable receipts on Sui · Files stored on Walrus
        </p>
      </footer>
    </div>
  )
}
