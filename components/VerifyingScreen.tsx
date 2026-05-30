'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Upload, Database, Search, Link2, CheckCircle, Loader2 } from 'lucide-react'

type StepState = 'waiting' | 'running' | 'done' | 'error'

interface Step {
  id: string
  icon: React.ElementType
  label: string
  detail: string
  color: string
}

const STEPS: Step[] = [
  { id: 'upload',   icon: Upload,   label: 'Uploading to Walrus',       detail: 'Storing invoice on decentralised storage',          color: '#00d4ff' },
  { id: 'hash',     icon: Database, label: 'Blob stored',               detail: 'Walrus blob ID confirmed — file is permanent',       color: '#00ff88' },
  { id: 'extract',  icon: Search,   label: 'Extracting invoice fields', detail: 'AI parsing supplier, IBAN, amount, date',            color: '#a78bfa' },
  { id: 'verify',   icon: Shield,   label: 'Running verification',      detail: '6 deterministic checks against trusted registry',   color: '#fb923c' },
  { id: 'receipt',  icon: Link2,    label: 'Writing Sui receipt',       detail: 'Signing immutable audit record via Tatum mainnet',   color: '#a78bfa' },
]

// Messages drive which step is "running" —
// matched by substring against the status messages from the pipeline.
const MESSAGE_TO_STEP: Array<[string, string]> = [
  ['Uploading',       'upload'],
  ['Walrus blob',     'hash'],
  ['verification engine', 'extract'],
  ['Trust Score',     'verify'],
  ['Sui receipt',     'receipt'],
  ['complete',        'receipt'],
]

interface Props {
  messages: string[]
}

export default function VerifyingScreen({ messages }: Props) {
  const [stepStates, setStepStates] = useState<Record<string, StepState>>(
    Object.fromEntries(STEPS.map(s => [s.id, 'waiting']))
  )

  useEffect(() => {
    const latest = messages[messages.length - 1] || ''

    let activeIndex = -1
    for (const [keyword, stepId] of MESSAGE_TO_STEP) {
      if (latest.toLowerCase().includes(keyword.toLowerCase())) {
        activeIndex = STEPS.findIndex(s => s.id === stepId)
        break
      }
    }

    if (activeIndex === -1) return

    setStepStates(prev => {
      const next = { ...prev }
      STEPS.forEach((step, i) => {
        if (i < activeIndex)  next[step.id] = 'done'
        if (i === activeIndex) next[step.id] = 'running'
        // leave later steps as 'waiting'
      })
      return next
    })
  }, [messages])

  // Mark all done on "complete"
  useEffect(() => {
    const last = messages[messages.length - 1] || ''
    if (last.toLowerCase().includes('complete')) {
      setStepStates(Object.fromEntries(STEPS.map(s => [s.id, 'done'])))
    }
  }, [messages])

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] gap-10 max-w-lg mx-auto">

      {/* Central pulsing shield */}
      <div className="relative">
        <motion.div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(0,255,136,0.06)',
            border: '1px solid rgba(0,255,136,0.15)',
            boxShadow: '0 0 40px rgba(0,255,136,0.1)',
          }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(0,255,136,0.08)',
              '0 0 50px rgba(0,255,136,0.18)',
              '0 0 20px rgba(0,255,136,0.08)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Shield className="w-9 h-9 text-[#00ff88]" />
        </motion.div>

        {/* Orbit ring */}
        <motion.div
          className="absolute inset-[-12px] rounded-[28px] border border-[#00ff88]/10"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.04, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-1">Verifying Invoice</h2>
        <p className="text-sm text-white/30">Running deterministic trust pipeline…</p>
      </div>

      {/* Step list */}
      <div className="w-full space-y-2">
        {STEPS.map((step, i) => {
          const state = stepStates[step.id]
          const Icon  = step.icon

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                state === 'done'    ? 'border-white/8  bg-white/[0.02]' :
                state === 'running' ? 'border-[#00ff88]/20 bg-[#00ff88]/5' :
                                     'border-white/5  bg-transparent'
              }`}
            >
              {/* Status indicator */}
              <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {state === 'done' ? (
                    <motion.div
                      key="done"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                    </motion.div>
                  ) : state === 'running' ? (
                    <motion.div key="running">
                      <Loader2 className="w-4 h-4 text-[#00ff88] animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting"
                      className="w-2 h-2 rounded-full bg-white/15"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Icon */}
              <div
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500"
                style={{
                  background: state !== 'waiting' ? `${step.color}12` : 'transparent',
                  border: state !== 'waiting' ? `1px solid ${step.color}20` : '1px solid transparent',
                }}
              >
                <Icon
                  className="w-3.5 h-3.5 transition-all duration-500"
                  style={{ color: state !== 'waiting' ? step.color : 'rgba(255,255,255,0.2)' }}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  state === 'running' ? 'text-white' :
                  state === 'done'    ? 'text-white/60' :
                                       'text-white/25'
                }`}>
                  {step.label}
                </p>
                {state !== 'waiting' && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-xs text-white/25 leading-relaxed truncate"
                  >
                    {step.detail}
                  </motion.p>
                )}
              </div>

              {/* Running bar */}
              {state === 'running' && (
                <motion.div
                  className="absolute bottom-0 left-0 h-[1px] rounded-full"
                  style={{ background: step.color }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 8, ease: 'linear' }}
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Live log — last message */}
      {messages.length > 0 && (
        <motion.div
          key={messages[messages.length - 1]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-white/20 font-mono"
        >
          <span className="text-[#00ff88]/40">›</span>
          {messages[messages.length - 1]}
          <span className="blink text-[#00ff88]/40">_</span>
        </motion.div>
      )}
    </div>
  )
}
