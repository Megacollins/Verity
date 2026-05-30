'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ArrowUpRight, Clock } from 'lucide-react'
import Link from 'next/link'
import UploadPanel from '@/components/UploadPanel'
import VerifyingScreen from '@/components/VerifyingScreen'
import VerificationCenter from '@/components/VerificationCenter'
import { VerificationResult } from '@/types'
import { saveToAuditTrail } from '@/lib/auditStore'

type Step = 'upload' | 'verifying' | 'result'

export default function DashboardPage() {
  const [step, setStep]                   = useState<Step>('upload')
  const [result, setResult]               = useState<VerificationResult | null>(null)
  const [statusMessages, setStatusMessages] = useState<string[]>([])
  const [showBlockedFlash, setShowBlockedFlash] = useState(false)

  const addStatus = (msg: string) => setStatusMessages(prev => [...prev, msg])

  const handleVerificationComplete = (data: VerificationResult) => {
    // Persist to audit trail immediately
    saveToAuditTrail(data)

    if (data.trustReport.verdict === 'BLOCKED') {
      // Cinematic blocked flash before showing results
      setResult(data)
      setShowBlockedFlash(true)
      setTimeout(() => {
        setShowBlockedFlash(false)
        setStep('result')
      }, 1800)
    } else {
      setResult(data)
      setStep('result')
    }
  }

  const handleReset = () => {
    setStep('upload')
    setResult(null)
    setStatusMessages([])
  }

  const pipelineSteps = [
    { key: 'upload',    label: '01  Upload'  },
    { key: 'verifying', label: '02  Verify'  },
    { key: 'result',    label: '03  Report'  },
  ]

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0a0a' }}>

      {/* Subtle background grid */}
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* ── BLOCKED flash overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {showBlockedFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.97)' }}
          >
            {/* Red glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: [
                  'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,51,102,0.0), transparent)',
                  'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,51,102,0.2), transparent)',
                  'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,51,102,0.08), transparent)',
                ]
              }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />

            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
              className="flex flex-col items-center gap-5"
            >
              {/* Icon */}
              <motion.div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(255,51,102,0.12)',
                  border: '1px solid rgba(255,51,102,0.3)',
                  boxShadow: '0 0 60px rgba(255,51,102,0.3)',
                }}
                animate={{ boxShadow: ['0 0 30px rgba(255,51,102,0.2)', '0 0 80px rgba(255,51,102,0.5)', '0 0 30px rgba(255,51,102,0.2)'] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <svg className="w-9 h-9 text-[#ff3366]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-6xl font-bold tracking-wide text-[#ff3366]"
                style={{ textShadow: '0 0 40px rgba(255,51,102,0.5)' }}
              >
                PAYMENT BLOCKED
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/30 text-sm font-mono"
              >
                Critical fraud signal detected · Generating audit receipt…
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 h-14 border-b border-white/5"
        style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)' }}>

        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-md overflow-hidden border border-white/10 shrink-0">
            <img
              src="/hero.jpg"
              alt="Verity"
              className="w-full h-full object-cover"
              style={{ objectPosition: '62% 18%', filter: 'brightness(1.3) contrast(1.1)' }}
            />
          </div>
          <span className="text-white/60 font-semibold tracking-[0.15em] text-xs uppercase group-hover:text-white transition-colors">Verity</span>
        </Link>

        {/* Pipeline steps */}
        <div className="hidden sm:flex items-center gap-1">
          {pipelineSteps.map(({ key, label }, i) => {
            const isActive = step === key
            const isDone   = (key === 'upload' && step !== 'upload') ||
                             (key === 'verifying' && step === 'result')
            return (
              <div key={key} className="flex items-center gap-1">
                {i > 0 && <div className={`w-5 h-px mx-0.5 transition-colors duration-500 ${isDone ? 'bg-[#4ade80]/30' : 'bg-white/8'}`} />}
                <span className={`text-[11px] px-2.5 py-1 rounded-full border transition-all duration-300 ${
                  isActive ? 'border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80] font-medium'
                  : isDone ? 'border-[#4ade80]/15 text-[#4ade80]/40'
                  : 'border-white/8 text-white/20'
                }`}>{label}</span>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 text-[11px] text-white/25">
          <Link href="/audit"
            className="hidden md:flex items-center gap-1.5 hover:text-white/50 transition-colors">
            <Clock className="w-3 h-3" />Audit Trail
          </Link>
          <span className="hidden md:flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#4ade80] animate-pulse" />Tatum
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-white/40" />Walrus
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-white/40" />Sui
          </span>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <AnimatePresence mode="wait">

          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <UploadPanel
                onVerificationStart={() => setStep('verifying')}
                onVerificationComplete={handleVerificationComplete}
                onStatus={addStatus}
              />
            </motion.div>
          )}

          {step === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <VerifyingScreen messages={statusMessages} />
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <VerificationCenter result={result} onReset={handleReset} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 text-center py-6 mt-8 border-t border-white/5">
        <p className="text-white/15 text-xs">
          Powered by Tatum Infrastructure · Walrus Decentralized Storage · Sui Mainnet
        </p>
      </footer>
    </div>
  )
}
