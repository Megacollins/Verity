'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface Props {
  score: number
  verdict: 'APPROVED' | 'FLAGGED' | 'BLOCKED'
  size?: 'sm' | 'lg'
  hideLabel?: boolean
}

export default function TrustScore({ score, verdict, size = 'lg', hideLabel = false }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)

  const isApproved = verdict === 'APPROVED'
  const isBlocked  = verdict === 'BLOCKED'

  const color  = isApproved ? '#00ff88' : isBlocked ? '#ff3366' : '#ffcc00'
  const glow   = isApproved
    ? '0 0 40px rgba(0,255,136,0.35), 0 0 80px rgba(0,255,136,0.15)'
    : isBlocked
    ? '0 0 40px rgba(255,51,102,0.35), 0 0 80px rgba(255,51,102,0.15)'
    : '0 0 40px rgba(255,204,0,0.35)'

  const dim  = size === 'lg' ? 160 : 100
  const r    = size === 'lg' ? 68  : 42
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 100)

  // Count-up animation
  useEffect(() => {
    const duration = 1400  // ms
    const start    = performance.now()

    function tick(now: number) {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * score))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [score])

  const cx = dim / 2
  const cy = dim / 2

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: dim, height: dim }}>
        {/* Outer glow pulse */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: glow }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* SVG ring */}
        <svg width={dim} height={dim} className="absolute inset-0 -rotate-90">
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={size === 'lg' ? 8 : 6}
          />
          {/* Progress */}
          <motion.circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={size === 'lg' ? 8 : 6}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </svg>

        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold leading-none tabular-nums"
            style={{
              fontSize: size === 'lg' ? 36 : 24,
              color,
              textShadow: `0 0 20px ${color}80`,
            }}
          >
            {displayed}
          </span>
          <span className="text-white/30 text-xs mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Label */}
      {!hideLabel && (
        <div
          className="px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase"
          style={{ borderColor: `${color}30`, background: `${color}10`, color }}
        >
          {verdict}
        </div>
      )}
    </div>
  )
}
