'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ArrowUpRight, CheckCircle, Clock,
  Database, Shield, FileText, ExternalLink,
} from 'lucide-react'

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 h-14"
      style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 shrink-0">
          <Image
            src="/hero.jpg"
            alt="Verity"
            width={28}
            height={28}
            className="object-cover"
            style={{ objectPosition: '62% 18%', filter: 'brightness(1.3) contrast(1.1)' }}
          />
        </div>
        <span className="text-white font-semibold text-sm tracking-[0.15em] uppercase">Verity</span>
      </div>

      {/* Links — smooth scroll to sections */}
      <div className="hidden md:flex items-center gap-7">
        {[
          { label: 'Product',      href: '#product'     },
          { label: 'How it Works', href: '#how-it-works'},
          { label: 'Security',     href: '#security'    },
          { label: 'Developers',   href: '#developers'  },
          { label: 'Docs',         href: '#docs'        },
          { label: 'Pricing',      href: '#pricing'     },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="text-white/40 text-[13px] hover:text-white/75 transition-colors duration-200"
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-white/90 transition-colors"
      >
        Launch Dashboard
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
    </motion.nav>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY    = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const fadeOut = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col overflow-hidden pt-14">

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      {/* Two-column grid: text left, image right */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0">

        {/* LEFT — copy */}
        <motion.div
          style={{ opacity: fadeOut }}
          className="flex flex-col justify-center px-8 md:px-14 lg:px-20 py-20 lg:py-0"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/12 bg-white/5 text-[11px] text-white/50 uppercase tracking-[0.15em] mb-8 self-start"
          >
            <Shield className="w-3 h-3 text-[#4ade80]" />
            AI Trust Infrastructure
          </motion.div>

          {/* Headline — sized to always fit two lines */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-[clamp(36px,3.8vw,64px)] font-semibold leading-[1.08] tracking-[-0.025em] text-white mb-6"
          >
            Trust Infrastructure<br />
            for Autonomous AI
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-white/45 text-base md:text-[17px] leading-relaxed mb-10 max-w-[400px]"
          >
            Verity verifies invoices before AI systems
            execute financial transactions.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.58 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all shadow-[0_0_24px_rgba(255,255,255,0.12)]"
            >
              Run Verification
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/audit"
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-white/15 text-white/60 text-sm font-medium hover:border-white/30 hover:text-white/80 transition-all"
            >
              View Audit Trail
            </Link>
          </motion.div>

          {/* Powered by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="flex flex-wrap items-center gap-5 mt-14 pt-8 border-t border-white/8"
          >
            <span className="text-white/20 text-[11px] uppercase tracking-[0.2em] font-light">Powered by</span>
            {[
              { name: 'WALRUS', icon: '◈' },
              { name: 'Sui',    icon: '◎' },
              { name: 'TATUM',  icon: '✦' },
            ].map(({ name, icon }) => (
              <div key={name} className="flex items-center gap-1.5">
                <span className="text-white/35 text-sm">{icon}</span>
                <span className="text-white/35 text-[12px] font-medium tracking-wider">{name}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — hero image, fills column fully */}
        <motion.div
          style={{ y: imgY }}
          className="hidden lg:block relative overflow-hidden"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src="/hero.jpg"
              alt="Humanity in careful control of autonomous systems"
              fill
              className="object-contain object-center select-none"
              style={{ filter: 'brightness(0.9) contrast(1.05)' }}
              priority
            />
            {/* Fade left edge into background — wider, softer */}
            <div
              className="absolute inset-y-0 left-0 w-48 pointer-events-none"
              style={{ background: 'linear-gradient(90deg, #0a0a0a 0%, #0a0a0a 15%, transparent 100%)' }}
            />
            {/* Fade bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{ background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)' }}
            />
            {/* Fade top */}
            <div
              className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, transparent 100%)' }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── DASHBOARD PREVIEW (static, always shows APPROVED) ───────────────────────
function DashboardPreview() {
  return (
    <section className="px-6 md:px-12 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl overflow-hidden border border-white/8"
        style={{ background: '#111111' }}
      >
        {/* Inner padding */}
        <div className="p-6 space-y-4">

          {/* ── Row 1: Trust Score | Timeline | Verdict ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Trust Score */}
            <PreviewCard>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-4">Trust Score</p>
              <div className="flex items-end gap-4 mb-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#4ade80" strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 26 * 0.92} ${2 * Math.PI * 26}`}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">92</span>
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-light text-white leading-none">92
                    <span className="text-white/25 text-lg font-light"> /100</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                    <span className="text-[#4ade80] text-xs">Approved</span>
                  </div>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/8 mb-3">
                <div className="h-full rounded-full bg-[#4ade80]" style={{ width: '92%' }} />
              </div>
              <p className="text-white/30 text-xs">This invoice is trustworthy.</p>
            </PreviewCard>

            {/* Verification Timeline */}
            <PreviewCard>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-4">Verification Timeline</p>
              <div className="space-y-3">
                {[
                  { label: 'Invoice Uploaded',       sub: 'May 21, 2026 · 10:42:11' },
                  { label: 'Stored on Walrus',        sub: 'Blob ID: 8QmX…7kL2' },
                  { label: 'AI Extraction Completed', sub: 'Fields extracted successfully' },
                  { label: 'Verification Checks',     sub: '6/6 checks passed' },
                  { label: 'Sui Receipt Generated',   sub: 'Txn: 0x1ab2…9f7d', last: true },
                ].map(({ label, sub, last }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-[#4ade80]/15 border border-[#4ade80]/40 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3 h-3 text-[#4ade80]" />
                      </div>
                      {!last && <div className="w-px h-4 bg-white/8 mt-0.5" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-white/60 text-xs font-medium leading-none mb-0.5">{label}</p>
                      <p className="text-white/25 text-[11px]">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PreviewCard>

            {/* Verdict */}
            <PreviewCard className="flex flex-col items-center justify-center text-center">
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-6 self-start">Verdict</p>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.2) 0%, rgba(74,222,128,0.05) 100%)', border: '1px solid rgba(74,222,128,0.3)', boxShadow: '0 0 40px rgba(74,222,128,0.15)' }}>
                <Shield className="w-10 h-10 text-[#4ade80]" />
              </div>
              <p className="text-[#4ade80] text-xl font-bold tracking-wide mb-2">PAYMENT APPROVED</p>
              <p className="text-white/30 text-xs leading-relaxed">All verification checks passed.<br/>This invoice is safe to process.</p>
            </PreviewCard>
          </div>

          {/* ── Row 2: Invoice | Walrus | Sui | Risk ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Invoice Preview */}
            <PreviewCard>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">Invoice Preview</p>
              <p className="text-white/70 text-sm font-semibold">ACME LOGISTICS</p>
              <p className="text-white/25 text-xs mb-3">Invoice #INV-29384</p>
              {[
                { l: 'Date',   v: 'May 21, 2026' },
                { l: 'Amount', v: '$12,450.00' },
                { l: 'IBAN',   v: 'NL91ABNA0417164300' },
              ].map(({ l, v }) => (
                <div key={l} className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/25 text-[11px]">{l}</span>
                  <span className="text-white/50 text-[11px] font-mono">{v}</span>
                </div>
              ))}
              <button className="mt-3 flex items-center gap-1.5 text-white/30 text-[11px] hover:text-white/60 transition-colors">
                <span>View Full Invoice</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </PreviewCard>

            {/* Walrus Storage */}
            <PreviewCard>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">Walrus Storage</p>
              {[
                { l: 'Blob ID',     v: '8QmXJ7…kL2p9' },
                { l: 'Status',      v: 'Stored',    green: true },
                { l: 'Hash (SHA256)', v: '4f2c…9a7e' },
                { l: 'Size',        v: '248.3 KB' },
                { l: 'Stored At',   v: 'May 21, 2026 · 10:42:11' },
              ].map(({ l, v, green }) => (
                <div key={l} className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/25 text-[11px]">{l}</span>
                  <span className={`text-[11px] font-mono ${green ? 'text-[#4ade80]' : 'text-white/50'}`}>{v}</span>
                </div>
              ))}
              <button className="mt-3 flex items-center gap-1.5 text-white/30 text-[11px] hover:text-white/60 transition-colors">
                View on Walrus Explorer <ExternalLink className="w-3 h-3" />
              </button>
            </PreviewCard>

            {/* Sui Receipt */}
            <PreviewCard>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">Sui Receipt</p>
              {[
                { l: 'Transaction Hash', v: '0x1ab2…9f7d' },
                { l: 'Status',           v: 'Confirmed',  green: true },
                { l: 'Block',            v: '123,456,789' },
                { l: 'Network',          v: 'Sui Mainnet' },
                { l: 'Gas Used',         v: '0.01234 SUI' },
              ].map(({ l, v, green }) => (
                <div key={l} className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-white/25 text-[11px]">{l}</span>
                  <span className={`text-[11px] font-mono ${green ? 'text-[#4ade80]' : 'text-white/50'}`}>{v}</span>
                </div>
              ))}
              <button className="mt-3 flex items-center gap-1.5 text-white/30 text-[11px] hover:text-white/60 transition-colors">
                View on Sui Explorer <ExternalLink className="w-3 h-3" />
              </button>
            </PreviewCard>

            {/* Risk Indicators */}
            <PreviewCard>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">Risk Indicators</p>
              <div className="space-y-2.5">
                {[
                  { label: 'IBAN Match',           val: 'Match',      pass: true },
                  { label: 'Supplier Verified',    val: 'Verified',   pass: true },
                  { label: 'Duplicate Check',      val: 'Clear',      pass: true },
                  { label: 'Metadata Consistent',  val: 'Consistent', pass: true },
                  { label: 'Invoice Freshness',    val: 'Valid',      pass: true },
                  { label: 'Provenance',           val: 'High',       pass: true },
                ].map(({ label, val, pass }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-[#4ade80]" />
                      <span className="text-white/40 text-[11px]">{label}</span>
                    </div>
                    <span className={`text-[11px] ${pass ? 'text-[#4ade80]/70' : 'text-red-400/70'}`}>{val}</span>
                  </div>
                ))}
              </div>
            </PreviewCard>
          </div>

          {/* ── Row 3: Verification checks breakdown ── */}
          <PreviewCard>
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-4">Verification Checks</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Supplier Consistency', score: 25, max: 25 },
                { name: 'Metadata Consistency', score: 18, max: 20 },
                { name: 'Invoice Hash Integrity', score: 20, max: 20 },
                { name: 'Invoice Freshness',     score: 15, max: 15 },
                { name: 'Duplicate Detection',   score: 10, max: 10 },
                { name: 'Provenance Confidence', score: 9,  max: 10 },
              ].map(({ name, score, max }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                  <span className="text-white/45 text-xs flex-1">{name}</span>
                  <span className="text-white/30 text-xs font-mono shrink-0">{score} / {max}</span>
                </div>
              ))}
            </div>
          </PreviewCard>

          {/* Bottom bar */}
          <div className="flex items-center justify-center gap-6 pt-2 pb-1">
            {['End-to-end encrypted', 'Immutable on Sui', 'Stored on Walrus'].map((t, i) => (
              <div key={t} className="flex items-center gap-2 text-white/20 text-[11px]">
                {i > 0 && <span className="text-white/10">•</span>}
                {i === 0 && <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5"><path d="M6 1L2 3v3c0 2.2 1.7 4.2 4 4.8C9.3 10.2 11 8.2 11 6V3L6 1Z"/></svg>}
                {t}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function PreviewCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-4 border border-white/6 ${className}`}
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      {children}
    </div>
  )
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────
function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-6 md:px-12 py-10 md:py-14 scroll-mt-14">
      {children}
    </section>
  )
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="text-white/25 text-[11px] uppercase tracking-[0.3em] font-light mb-4"
    >
      {children}
    </motion.p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: 0.05 }}
      className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-white mb-4"
    >
      {children}
    </motion.h2>
  )
}

function Divider() {
  return (
    <motion.div
      initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
      viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      style={{ originX: 0 }}
      className="w-full h-px bg-white/6 mb-7"
    />
  )
}

// ─── PRODUCT ─────────────────────────────────────────────────────────────────
function ProductSection() {
  const features = [
    { icon: '◈', title: 'Walrus Storage', desc: 'Every invoice is stored permanently on Walrus decentralised storage before analysis begins. Blob IDs are immutable references — anyone can verify the original file was not tampered with.' },
    { icon: '⛓', title: 'Sui Audit Receipts', desc: 'After every verification, a receipt containing the trust score, verdict, and Walrus blob reference is written to Sui mainnet. It cannot be deleted or modified.' },
    { icon: '✦', title: 'Tatum Infrastructure', desc: 'All blockchain interactions route through Tatum\'s RPC infrastructure — providing reliability, speed, and enterprise-grade uptime for every verification request.' },
    { icon: '⊞', title: 'Deterministic Scoring', desc: 'Trust scores are computed by a six-check deterministic engine, not a black-box AI model. Every deduction is logged with a reason. Fully auditable.' },
    { icon: '◉', title: 'AI-Assisted Extraction', desc: 'OpenAI extracts structured fields from invoice PDFs — supplier name, IBAN, amount, dates — feeding them into the verification engine for analysis.' },
    { icon: '⊘', title: 'Fraud Prevention', desc: 'IBAN mismatches, duplicate submissions, stale invoices, and unverifiable suppliers are all caught before an AI agent can execute an irreversible payment.' },
  ]
  return (
    <Section id="product">
      <Divider />
      <SectionTag>Product</SectionTag>
      <SectionHeading>Everything you need to trust AI-driven payments.</SectionHeading>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="text-white/35 text-sm leading-relaxed mb-6 max-w-xl">
        Verity sits between your AI agent and your payment system — verifying every invoice before it approves a transaction.
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(({ icon, title, desc }, i) => (
          <motion.div key={title}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            className="p-5 rounded-xl border border-white/6 bg-white/[0.02] hover:bg-white/[0.035] hover:border-white/10 transition-all duration-300 group">
            <span className="text-white/30 text-lg mb-3 block">{icon}</span>
            <h3 className="text-white/80 text-sm font-semibold mb-2">{title}</h3>
            <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'Upload Invoice',       desc: 'User or AI agent uploads the invoice PDF via the Verity API or dashboard.' },
    { num: '02', title: 'Hash & Store on Walrus', desc: 'The file is SHA-256 hashed and uploaded to Walrus decentralised storage. A blob ID is returned as a permanent reference.' },
    { num: '03', title: 'AI Field Extraction',  desc: 'OpenAI extracts structured fields: supplier name, IBAN, amount, invoice date, and description.' },
    { num: '04', title: 'Trust Verification',   desc: 'Six deterministic checks run against the trusted supplier registry. Each check contributes a weighted score.' },
    { num: '05', title: 'Verdict',               desc: 'A trust score is computed. Any critical failure (IBAN mismatch, duplicate) automatically blocks the payment regardless of overall score.' },
    { num: '06', title: 'Sui Audit Receipt',    desc: 'The verdict, score, and Walrus blob ID are written to Sui mainnet via Tatum. The record is permanent and tamper-proof.' },
  ]
  return (
    <Section id="how-it-works">
      <Divider />
      <SectionTag>How it Works</SectionTag>
      <SectionHeading>Six steps. Nine seconds. Zero trust gaps.</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 mt-6">
        {steps.map(({ num, title, desc }, i) => (
          <motion.div key={num}
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            className="p-6 border border-white/5 hover:border-white/10 transition-colors duration-500 group relative">
            <div className="absolute top-0 left-0 w-0 group-hover:w-full h-px bg-gradient-to-r from-[#4ade80]/30 to-transparent transition-all duration-700" />
            <p className="text-white/15 text-xs font-mono mb-4">{num}</p>
            <h3 className="text-white/75 text-sm font-semibold mb-2">{title}</h3>
            <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

// ─── SECURITY ─────────────────────────────────────────────────────────────────
function SecuritySection() {
  return (
    <Section id="security">
      <Divider />
      <SectionTag>Security</SectionTag>
      <SectionHeading>Immutable by design. Tamper-proof by default.</SectionHeading>
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="space-y-5">
          {[
            { title: 'Decentralised Storage', body: 'Invoices stored on Walrus cannot be deleted or altered. The blob ID is a permanent, content-addressed reference. Anyone can verify the original file at any time.' },
            { title: 'On-Chain Audit Trail',  body: 'Every verification result is written to Sui mainnet. The receipt includes the file hash, Walrus blob ID, trust score, and verdict — immutably recorded forever.' },
            { title: 'Deterministic Engine',  body: 'The trust score is not probabilistic. It is computed by a fixed-weight engine with explicit rules. There is no hidden model, no randomness, and no way to game it.' },
          ].map(({ title, body }) => (
            <div key={title} className="p-5 rounded-xl border border-white/6 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-3.5 h-3.5 text-[#4ade80]" />
                <h3 className="text-white/70 text-sm font-semibold">{title}</h3>
              </div>
              <p className="text-white/30 text-xs leading-relaxed">{body}</p>
            </div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="p-6 rounded-xl border border-white/6 bg-white/[0.02]">
          <p className="text-white/25 text-[10px] uppercase tracking-widest mb-5">Verification Weights</p>
          {[
            { label: 'Supplier Consistency',  pct: 25, desc: 'IBAN + supplier registry match' },
            { label: 'Metadata Integrity',    pct: 20, desc: 'All required fields present' },
            { label: 'File Hash Validation',  pct: 20, desc: 'SHA-256 tamper check' },
            { label: 'Invoice Freshness',     pct: 15, desc: 'Within 90-day window' },
            { label: 'Duplicate Detection',   pct: 10, desc: 'Invoice ID uniqueness' },
            { label: 'Provenance Confidence', pct: 10, desc: 'Source authenticity' },
          ].map(({ label, pct, desc }) => (
            <div key={label} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <span className="text-white/40 text-[11px] font-mono">{pct}%</span>
              </div>
              <div className="flex-1">
                <p className="text-white/55 text-xs font-medium">{label}</p>
                <p className="text-white/20 text-[11px]">{desc}</p>
              </div>
              <div className="w-20 h-1 rounded-full bg-white/8 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} whileInView={{ width: `${pct * 4}%` }}
                  viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-[#4ade80] rounded-full"
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}

// ─── DEVELOPERS ───────────────────────────────────────────────────────────────
function DevelopersSection() {
  return (
    <Section id="developers">
      <Divider />
      <SectionTag>Developers</SectionTag>
      <SectionHeading>Three endpoints. Full pipeline.</SectionHeading>
      <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="text-white/35 text-sm mb-6 max-w-lg leading-relaxed">
        The Verity API is a simple REST interface. Upload an invoice, run verification, get a receipt. Everything returns JSON.
      </motion.p>
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { method: 'POST', path: '/api/upload',  desc: 'Upload invoice PDF → returns Walrus blob ID and SHA-256 hash' },
          { method: 'POST', path: '/api/verify',  desc: 'Run 6-check verification → returns trust score, verdict, check details' },
          { method: 'POST', path: '/api/receipt', desc: 'Write audit receipt to Sui mainnet → returns transaction hash' },
        ].map(({ method, path, desc }) => (
          <motion.div key={path} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="p-4 rounded-xl border border-white/6 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded font-mono">{method}</span>
              <code className="text-white/60 text-xs font-mono">{path}</code>
            </div>
            <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="rounded-xl border border-white/8 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/6 bg-white/[0.02]">
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-white/10"/><div className="w-2.5 h-2.5 rounded-full bg-white/10"/><div className="w-2.5 h-2.5 rounded-full bg-white/10"/></div>
          <span className="text-white/20 text-xs ml-2 font-mono">verify-invoice.sh</span>
        </div>
        <div className="p-5 font-mono text-xs leading-relaxed" style={{ background: 'rgba(255,255,255,0.015)' }}>
          <p className="text-white/20"># 1. Upload invoice to Walrus</p>
          <p className="text-white/60">curl -X POST /api/upload \</p>
          <p className="text-white/60 pl-4">-F <span className="text-[#4ade80]/80">"invoice=@invoice.pdf"</span></p>
          <p className="text-white/20 mt-3"># Returns: {'{'} blobId, fileHash, status {'}'}</p>
          <br/>
          <p className="text-white/20"># 2. Run verification</p>
          <p className="text-white/60">curl -X POST /api/verify \</p>
          <p className="text-white/60 pl-4">-F <span className="text-[#4ade80]/80">"invoice=@invoice.pdf"</span> \</p>
          <p className="text-white/60 pl-4">-F <span className="text-[#4ade80]/80">"fileHash=4d4ab13c..."</span></p>
          <p className="text-white/20 mt-3"># Returns: {'{'} trustScore: 92, verdict: "APPROVED", checks: [...] {'}'}</p>
          <br/>
          <p className="text-white/20"># 3. Write Sui receipt via Tatum</p>
          <p className="text-white/60">curl -X POST /api/receipt \</p>
          <p className="text-white/60 pl-4">-d <span className="text-[#4ade80]/80">'{"{"}"invoiceHash":"...","verdict":"APPROVED","trustScore":92{"}"}'</span></p>
          <p className="text-white/20 mt-3"># Returns: {'{'} txHash: "2tHUW1bm...", status: "confirmed" {'}'}</p>
        </div>
      </motion.div>
    </Section>
  )
}

// ─── DOCS ─────────────────────────────────────────────────────────────────────
function DocsSection() {
  return (
    <Section id="docs">
      <Divider />
      <SectionTag>Docs</SectionTag>
      <SectionHeading>Get running in minutes.</SectionHeading>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {[
          { title: 'Quick Start', items: ['Clone the repository from GitHub', 'Add Tatum API key to .env.local', 'Add OpenAI API key to .env.local', 'Run npm run dev', 'Upload invoice_fraud.pdf to see BLOCKED flow', 'Upload invoice_legit.pdf to see APPROVED flow'] },
          { title: 'Supported Formats', items: ['PDF invoices (max 10 MB)', 'Suppliers in the trusted registry', 'IBAN format: IBAN international standard', 'Date formats: ISO 8601 or common regional', 'Currencies: EUR, USD, GBP, and more', 'Invoice IDs: any alphanumeric format'] },
        ].map(({ title, items }) => (
          <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="p-6 rounded-xl border border-white/6 bg-white/[0.02]">
            <h3 className="text-white/70 text-sm font-semibold mb-4">{title}</h3>
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-[#4ade80]/50 text-xs mt-0.5 font-mono shrink-0">{String(i+1).padStart(2,'0')}</span>
                  <span className="text-white/35 text-xs leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="mt-6 p-4 rounded-xl border border-white/6 bg-white/[0.015] flex items-center justify-between gap-4">
        <div>
          <p className="text-white/50 text-sm font-medium">Full source code on GitHub</p>
          <p className="text-white/25 text-xs mt-0.5">MIT licensed · Next.js · TypeScript · Walrus · Sui · Tatum</p>
        </div>
        <Link href="/dashboard"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/12 text-white/50 text-xs hover:text-white/80 hover:border-white/25 transition-all shrink-0">
          View Dashboard <ArrowUpRight className="w-3 h-3" />
        </Link>
      </motion.div>
    </Section>
  )
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'For developers and small teams evaluating Verity.',
      features: ['10 verifications / month', 'Walrus storage included', 'Sui audit receipts', 'API access', 'Dashboard access'],
      cta: 'Get Started', primary: false,
    },
    {
      name: 'Pro',
      price: '$1',
      period: 'per month',
      desc: 'For teams running automated invoice workflows.',
      features: ['1,000 verifications / month', 'Walrus storage included', 'Sui audit receipts', 'Priority API access', 'Custom supplier registry', 'Webhook notifications'],
      cta: 'Start Free Trial', primary: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      desc: 'For organisations with high-volume payment automation.',
      features: ['Unlimited verifications', 'Dedicated infrastructure', 'Custom verification rules', 'SLA guarantee', 'On-premise deployment option', 'Dedicated support'],
      cta: 'Contact Sales', primary: false,
    },
  ]
  return (
    <Section id="pricing">
      <Divider />
      <SectionTag>Pricing</SectionTag>
      <SectionHeading>Simple, transparent pricing.</SectionHeading>
      <p className="text-white/30 text-sm mb-12 max-w-md leading-relaxed">
        Start free. Scale as your AI workflows grow. Every plan includes Walrus storage and Sui audit receipts.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(({ name, price, period, desc, features, cta, primary }, i) => (
          <motion.div key={name}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className={`p-6 rounded-2xl border ${primary ? 'border-white/15 bg-white/[0.06]' : 'border-white/6 bg-white/[0.02]'} relative`}>
            {primary && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#4ade80] text-black text-[10px] font-bold tracking-wide">
                POPULAR
              </div>
            )}
            <p className="text-white/50 text-sm font-semibold mb-1">{name}</p>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-3xl font-light text-white">{price}</span>
              <span className="text-white/25 text-xs">{period}</span>
            </div>
            <p className="text-white/25 text-xs mb-5 leading-relaxed">{desc}</p>
            <div className="space-y-2 mb-6">
              {features.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-[#4ade80]/60 shrink-0" />
                  <span className="text-white/40 text-xs">{f}</span>
                </div>
              ))}
            </div>
            <Link href="/dashboard"
              className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-all ${
                primary
                  ? 'bg-white text-black hover:bg-white/90'
                  : 'border border-white/12 text-white/50 hover:border-white/25 hover:text-white/75'
              }`}>
              {cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

export default function LandingPage() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">
      <Nav />
      <Hero />
      <DashboardPreview />
      <ProductSection />
      <HowItWorksSection />
      <SecuritySection />
      <DevelopersSection />
      <DocsSection />
      <PricingSection />

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 md:px-16 py-7">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded overflow-hidden border border-white/10 shrink-0">
              <Image src="/hero.jpg" alt="Verity" width={20} height={20}
                className="object-cover"
            style={{ objectPosition: '62% 18%', filter: 'brightness(1.3) contrast(1.1)' }} />
            </div>
            <span className="text-white/30 text-xs font-semibold tracking-[0.2em] uppercase">Verity</span>
          </div>
          <p className="text-white/15 text-xs text-center">
            Built for the Tatum × Walrus Hackathon 2025 · Walrus Storage · Sui Mainnet · Tatum RPC
          </p>
          <p className="text-white/20 text-xs">
            Built by <span className="text-white/40 font-medium">Megacollins</span>
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-white/20 text-xs">Live on mainnet</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
