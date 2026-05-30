'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, AlertCircle, ArrowRight, Shield, Database, Link2 } from 'lucide-react'
import { VerificationResult } from '@/types'

interface Props {
  onVerificationStart: () => void
  onVerificationComplete: (result: VerificationResult) => void
  onStatus: (msg: string) => void
}

export default function UploadPanel({ onVerificationStart, onVerificationComplete, onStatus }: Props) {
  const [dragOver, setDragOver]     = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFile = (file: File) => {
    setError(null)
    if (!file.name.endsWith('.pdf')) { setError('Only PDF files are accepted.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return }
    setSelectedFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const runVerification = async () => {
    if (!selectedFile || isProcessing) return
    setIsProcessing(true)
    setError(null)
    onVerificationStart()

    try {
      // Step 1 — Upload to Walrus
      onStatus(`Uploading "${selectedFile.name}" to Walrus…`)
      const uploadForm = new FormData()
      uploadForm.append('invoice', selectedFile)
      const uploadRes  = await fetch('/api/upload', { method: 'POST', body: uploadForm })
      if (!uploadRes.ok) throw new Error((await uploadRes.json()).error || 'Upload failed')
      const uploadData = await uploadRes.json()
      onStatus(`Walrus blob stored: ${uploadData.walrus.blobId.slice(0, 24)}…`)

      // Step 2 — Verify
      onStatus('Running verification engine…')
      const verifyForm = new FormData()
      verifyForm.append('invoice', selectedFile)
      verifyForm.append('fileHash', uploadData.walrus.fileHash)
      const verifyRes  = await fetch('/api/verify', { method: 'POST', body: verifyForm })
      if (!verifyRes.ok) throw new Error((await verifyRes.json()).error || 'Verification failed')
      const verifyData = await verifyRes.json()
      onStatus(`Trust Score computed: ${verifyData.trustReport.trustScore}/100`)
      onStatus(`Verdict: ${verifyData.trustReport.verdict}`)

      // Step 3 — Sui receipt
      onStatus('Writing Sui receipt via Tatum mainnet…')
      const receiptRes = await fetch('/api/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceHash:  uploadData.walrus.fileHash,
          walrusBlobId: uploadData.walrus.blobId,
          trustScore:   verifyData.trustReport.trustScore,
          verdict:      verifyData.trustReport.verdict,
          supplierName: verifyData.extracted.supplierName,
        }),
      })
      if (!receiptRes.ok) throw new Error((await receiptRes.json()).error || 'Receipt failed')
      const receiptData = await receiptRes.json()
      onStatus(`Sui receipt: ${receiptData.receipt.txHash.slice(0, 24)}…`)
      onStatus('Verification complete.')

      setTimeout(() => onVerificationComplete({
        invoiceFile: { originalName: selectedFile.name, fileHash: uploadData.walrus.fileHash, size: selectedFile.size },
        walrus:      uploadData.walrus,
        extracted:   verifyData.extracted,
        trustReport: verifyData.trustReport,
        suiReceipt:  receiptData.receipt,
        completedAt: new Date().toISOString(),
      }), 500)

    } catch (err) {
      setError((err as Error).message)
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-3"
        >
          Invoice Verification
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-white/35 text-sm leading-relaxed max-w-md mx-auto"
        >
          Upload an invoice PDF. Verity stores it on Walrus, runs six trust checks,
          then writes an immutable receipt to Sui mainnet via Tatum.
        </motion.p>
      </div>

      {/* Demo hint */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-5 flex items-start gap-3 p-3.5 rounded-xl border border-[#00d4ff]/12 bg-[#00d4ff]/4"
      >
        <div className="w-5 h-5 rounded-md bg-[#00d4ff]/15 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[#00d4ff] text-xs">i</span>
        </div>
        <div>
          <p className="text-xs text-[#00d4ff]/70 leading-relaxed">
            <span className="font-semibold text-[#00d4ff]">Demo invoices are ready.</span>{' '}
            Find them in <code className="bg-white/8 px-1 rounded text-[11px]">public/invoices/</code> — upload{' '}
            <code className="bg-white/8 px-1 rounded text-[11px]">invoice_fraud.pdf</code> for a BLOCKED result
            or <code className="bg-white/8 px-1 rounded text-[11px]">invoice_legit.pdf</code> for APPROVED.
          </p>
        </div>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && document.getElementById('file-input')?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          dragOver
            ? 'border-[#00ff88]/40 bg-[#00ff88]/5 scale-[1.01]'
            : selectedFile
            ? 'border-[#00ff88]/25 bg-[#00ff88]/3'
            : 'border-white/10 bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.025]'
        }`}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          disabled={isProcessing}
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center">
                <FileText className="w-7 h-7 text-[#00ff88]" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                <p className="text-white/25 text-xs mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB · PDF</p>
              </div>
              <p className="text-[#00ff88]/40 text-xs">Click to replace</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                dragOver ? 'border-[#00ff88]/30 bg-[#00ff88]/10' : 'border-white/10 bg-white/5'
              }`}>
                <Upload className={`w-7 h-7 transition-colors duration-300 ${dragOver ? 'text-[#00ff88]' : 'text-white/25'}`} />
              </div>
              <div>
                <p className="text-white/50 font-medium text-sm">Drop invoice PDF here</p>
                <p className="text-white/20 text-xs mt-0.5">or click to browse · max 10 MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-2 p-3 rounded-xl border border-[#ff3366]/20 bg-[#ff3366]/5 text-[#ff3366]/80 text-xs"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        onClick={runVerification}
        disabled={!selectedFile || isProcessing}
        whileHover={selectedFile && !isProcessing ? { scale: 1.01 } : {}}
        whileTap={selectedFile && !isProcessing ? { scale: 0.99 } : {}}
        className={`mt-5 w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
          selectedFile && !isProcessing
            ? 'bg-[#00ff88] text-black shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:shadow-[0_0_40px_rgba(0,255,136,0.3)] cursor-pointer'
            : 'bg-white/5 text-white/20 cursor-not-allowed'
        }`}
      >
        {isProcessing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
            />
            Processing…
          </>
        ) : (
          <>
            Run Verification
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>

      {/* Trust chain */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-8 flex items-center justify-center gap-0"
      >
        {[
          { icon: Upload,   label: 'Upload',  color: '#00d4ff' },
          { icon: Database, label: 'Walrus',  color: '#00ff88' },
          { icon: Shield,   label: 'Verify',  color: '#fb923c' },
          { icon: Link2,    label: 'Sui + Tatum', color: '#a78bfa' },
        ].map(({ icon: Icon, label, color }, i) => (
          <div key={label} className="flex items-center">
            {i > 0 && <div className="w-6 h-px bg-white/8 mx-1" />}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${color}10`, border: `1px solid ${color}15` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <span className="text-[10px] text-white/20">{label}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
