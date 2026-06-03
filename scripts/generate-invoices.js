// ─── Demo Invoice PDF Generator ───────────────────────────────────────────────
// Run with: node scripts/generate-invoices.js
// Outputs two PDFs to public/invoices/

const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const OUT_DIR = path.join(__dirname, '../public/invoices')
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

function drawInvoice(doc, data) {
  const { company, address, iban, invoiceId, amount, date, dueDate, items, isFraud } = data

  // ── Page background ──────────────────────────────────────────────────────────
  doc.rect(0, 0, 595, 842).fill('#ffffff')

  // ── Header bar ───────────────────────────────────────────────────────────────
  doc.rect(0, 0, 595, 90).fill('#0a0a0a')
  doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold')
    .text('INVOICE', 40, 30)
  doc.fontSize(10).fillColor('#888888').font('Helvetica')
    .text('ACME LOGISTICS LTD', 40, 58)

  // Invoice number top right
  doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold')
    .text(invoiceId, 400, 30, { align: 'right', width: 155 })
  doc.fontSize(9).fillColor('#888888').font('Helvetica')
    .text('Invoice Number', 400, 48, { align: 'right', width: 155 })

  // ── Supplier block ────────────────────────────────────────────────────────────
  doc.fontSize(9).fillColor('#999999').font('Helvetica')
    .text('FROM', 40, 110)
  doc.fontSize(11).fillColor('#111111').font('Helvetica-Bold')
    .text(company, 40, 124)
  doc.fontSize(9).fillColor('#555555').font('Helvetica')
    .text(address, 40, 140, { width: 200 })

  // ── Bill to block ─────────────────────────────────────────────────────────────
  doc.fontSize(9).fillColor('#999999').font('Helvetica')
    .text('BILL TO', 320, 110)
  doc.fontSize(11).fillColor('#111111').font('Helvetica-Bold')
    .text('Verity Technologies BV', 320, 124)
  doc.fontSize(9).fillColor('#555555').font('Helvetica')
    .text('Herengracht 420\nAmsterdam, 1017 BZ\nNetherlands', 320, 140)

  // ── Meta row ─────────────────────────────────────────────────────────────────
  doc.rect(40, 200, 515, 1).fill('#eeeeee')

  const metaY = 215
  doc.fontSize(8).fillColor('#999999').font('Helvetica')
  doc.text('ISSUE DATE', 40, metaY)
    .text('DUE DATE', 185, metaY)
    .text('PAYMENT TERMS', 330, metaY)
    .text('CURRENCY', 470, metaY)

  doc.fontSize(10).fillColor('#111111').font('Helvetica-Bold')
  doc.text(date, 40, metaY + 14)
    .text(dueDate, 185, metaY + 14)
    .text('Net 30', 330, metaY + 14)
    .text('EUR', 470, metaY + 14)

  doc.rect(40, metaY + 32, 515, 1).fill('#eeeeee')

  // ── Line items table ──────────────────────────────────────────────────────────
  const tableY = 268
  doc.rect(40, tableY, 515, 24).fill('#0a0a0a')
  doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold')
    .text('DESCRIPTION', 50, tableY + 8)
    .text('QTY', 340, tableY + 8)
    .text('UNIT PRICE', 390, tableY + 8)
    .text('AMOUNT', 475, tableY + 8)

  let rowY = tableY + 30
  items.forEach((item, i) => {
    if (i % 2 === 1) doc.rect(40, rowY - 4, 515, 22).fill('#f9f9f9')
    doc.fontSize(9).fillColor('#333333').font('Helvetica')
      .text(item.desc, 50, rowY, { width: 280 })
      .text(item.qty.toString(), 340, rowY)
      .text(`€${item.price.toFixed(2)}`, 390, rowY)
      .text(`€${(item.qty * item.price).toFixed(2)}`, 475, rowY)
    rowY += 26
  })

  doc.rect(40, rowY + 5, 515, 1).fill('#eeeeee')

  // ── Totals ────────────────────────────────────────────────────────────────────
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0)
  const vat = subtotal * 0.21
  const total = subtotal + vat

  const totY = rowY + 15
  doc.fontSize(9).fillColor('#555555').font('Helvetica')
    .text('Subtotal', 390, totY)
    .text(`€${subtotal.toFixed(2)}`, 475, totY)
  doc.fontSize(9).fillColor('#555555').font('Helvetica')
    .text('VAT (21%)', 390, totY + 18)
    .text(`€${vat.toFixed(2)}`, 475, totY + 18)

  doc.rect(390, totY + 38, 165, 28).fill('#0a0a0a')
  doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold')
    .text('TOTAL', 400, totY + 47)
    .text(`€${total.toFixed(2)}`, 470, totY + 47)

  // ── Banking details ───────────────────────────────────────────────────────────
  const bankY = totY + 90
  doc.rect(40, bankY, 515, 1).fill('#eeeeee')

  doc.fontSize(9).fillColor('#999999').font('Helvetica')
    .text('PAYMENT DETAILS', 40, bankY + 10)

  doc.fontSize(9).fillColor('#333333').font('Helvetica')
  doc.text('Bank:', 40, bankY + 26).text('ABN AMRO Bank N.V.', 130, bankY + 26)
  doc.text('Account Holder:', 40, bankY + 42).text(company, 130, bankY + 42)
  doc.text('IBAN:', 40, bankY + 58)

  // IBAN — highlight in red if fraud to make it visible during demo recording
  if (isFraud) {
    doc.rect(125, bankY + 55, 200, 16).fill('#fff0f0')
    doc.fontSize(9).fillColor('#cc0000').font('Helvetica-Bold')
      .text(iban, 130, bankY + 58)
    doc.fontSize(8).fillColor('#cc0000').font('Helvetica')
      .text('  ← MODIFIED', 310, bankY + 59)
  } else {
    doc.fontSize(9).fillColor('#333333').font('Helvetica-Bold')
      .text(iban, 130, bankY + 58)
  }

  doc.fontSize(9).fillColor('#333333').font('Helvetica')
  doc.text('BIC/SWIFT:', 40, bankY + 74).text('ABNANL2A', 130, bankY + 74)
  doc.text('Reference:', 40, bankY + 90).text(invoiceId, 130, bankY + 90)

  // ── Footer ────────────────────────────────────────────────────────────────────
  doc.rect(0, 790, 595, 52).fill('#0a0a0a')
  doc.fontSize(8).fillColor('#666666').font('Helvetica')
    .text('Acme Logistics Ltd  ·  Keizersgracht 241, Amsterdam  ·  KVK: 12345678  ·  VAT: NL123456789B01', 40, 806, { align: 'center', width: 515 })
  doc.fontSize(7).fillColor('#444444')
    .text('Thank you for your business. Payment due within 30 days of invoice date.', 40, 820, { align: 'center', width: 515 })
}

// ── Generate legitimate invoice ────────────────────────────────────────────────
function generateLegitimate() {
  const doc = new PDFDocument({ size: 'A4', margin: 0 })
  const out = fs.createWriteStream(path.join(OUT_DIR, 'invoice_legit.pdf'))
  doc.pipe(out)

  drawInvoice(doc, {
    company: 'Acme Logistics Ltd',
    address: 'Keizersgracht 241\nAmsterdam, 1016 DX\nNetherlands',
    iban: 'NL91ABNA0417164300',
    invoiceId: 'INV-2025-0543',
    amount: 4750,
    date: '2026-05-12',
    dueDate: '2026-06-12',
    isFraud: false,
    items: [
      { desc: 'Freight forwarding — Rotterdam to Amsterdam (LTL)', qty: 1, price: 1850.00 },
      { desc: 'Customs clearance & documentation', qty: 1, price: 450.00 },
      { desc: 'Warehouse handling & storage (14 days)', qty: 1, price: 620.00 },
      { desc: 'Last-mile delivery (Amsterdam metro)', qty: 3, price: 180.00 },
      { desc: 'Fuel surcharge (5.2%)', qty: 1, price: 197.00 },
    ],
  })

  doc.end()
  out.on('finish', () => console.log('✅ Generated: invoice_legit.pdf'))
}

// ── Generate fraudulent invoice ────────────────────────────────────────────────
function generateFraudulent() {
  const doc = new PDFDocument({ size: 'A4', margin: 0 })
  const out = fs.createWriteStream(path.join(OUT_DIR, 'invoice_fraud.pdf'))
  doc.pipe(out)

  drawInvoice(doc, {
    company: 'Acme Logistics Ltd',          // Same supplier name — social engineering
    address: 'Keizersgracht 241\nAmsterdam, 1016 DX\nNetherlands',
    iban: 'DE89370400440532013000',          // ← DIFFERENT IBAN (attacker's account)
    invoiceId: 'INV-2025-0542',             // Same invoice ID — duplicate detection
    amount: 4750,
    date: '2026-05-12',
    dueDate: '2026-06-12',
    isFraud: true,
    items: [
      { desc: 'Freight forwarding — Rotterdam to Amsterdam (LTL)', qty: 1, price: 1850.00 },
      { desc: 'Customs clearance & documentation', qty: 1, price: 450.00 },
      { desc: 'Warehouse handling & storage (14 days)', qty: 1, price: 620.00 },
      { desc: 'Last-mile delivery (Amsterdam metro)', qty: 3, price: 180.00 },
      { desc: 'Fuel surcharge (5.2%)', qty: 1, price: 197.00 },
    ],
  })

  doc.end()
  out.on('finish', () => console.log('✅ Generated: invoice_fraud.pdf'))
}

generateLegitimate()
generateFraudulent()
console.log('📄 Generating demo invoices...')
