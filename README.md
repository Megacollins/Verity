# Verity — Trust Infrastructure for Autonomous AI

> **Live demo:** https://verity-neon.vercel.app
>
> Built for the [Tatum × Walrus Hackathon 2025](https://tatum.io/tatum-x-walrus-hackathon)

Verity is an autonomous invoice verification layer that prevents fraudulent payments before AI systems execute them.

Before an AI agent approves a supplier payment, Verity:
1. Stores the invoice on **Walrus** decentralised storage
2. Runs **six deterministic trust checks** against a verified supplier registry
3. Generates a **Trust Score** (0–100) with an APPROVED / FLAGGED / BLOCKED verdict
4. Writes an **immutable audit receipt** to **Sui mainnet** via **Tatum** RPC

---

## The Problem

Business Email Compromise (BEC) fraud costs companies billions every year. The attack is simple:

- Attacker intercepts a legitimate supplier invoice
- Changes the IBAN to their own bank account
- Re-sends the invoice — everything looks normal
- AI agent sees a familiar supplier name and auto-approves
- Payment executed. Money gone.

Verity catches this by checking the IBAN against a verified supplier registry **before** any payment is approved.

---

## Demo

### Fraudulent Invoice → PAYMENT BLOCKED

Upload `public/invoices/invoice_fraud.pdf`

- IBAN `DE89370400440532013000` does not match trusted IBAN `NL91ABNA0417164300`
- Critical fraud signal detected → Trust Score ~35 → **PAYMENT BLOCKED**
- Immutable receipt written to Sui mainnet

### Legitimate Invoice → PAYMENT APPROVED

Upload `public/invoices/invoice_legit.pdf`

- All six checks pass → Trust Score ~92 → **PAYMENT APPROVED**
- Immutable receipt written to Sui mainnet

---

## Architecture

```
User / AI Agent
      │
      ▼
┌─────────────────┐
│   Verity API    │
│  /api/upload    │  ──── Stores invoice PDF ────▶  Walrus Decentralised Storage
│  /api/verify    │  ──── Runs 6 trust checks ────▶  Deterministic Engine
│  /api/receipt   │  ──── Writes audit record ────▶  Sui Mainnet via Tatum RPC
└─────────────────┘
```

### Verification Engine — 6 Checks

| Check | Weight | Description |
|---|---|---|
| Supplier Consistency | 25% | IBAN matches trusted supplier registry |
| Metadata Integrity | 20% | All required fields present and consistent |
| File Hash Validation | 20% | SHA-256 tamper check |
| Invoice Freshness | 15% | Within 90-day acceptance window |
| Duplicate Detection | 10% | Invoice ID has not been seen before |
| Provenance Confidence | 10% | Supplier source authenticity |

Any **critical failure** (IBAN mismatch or duplicate invoice) automatically results in BLOCKED regardless of overall score.

---

## Walrus Integration

Every invoice PDF is uploaded to Walrus decentralised storage via the publisher endpoint.

- Real blob IDs returned and displayed in the dashboard
- SHA-256 hash computed before upload as tamper evidence
- Blob retrieval URL linked directly from the dashboard
- Graceful fallback if Walrus testnet is temporarily unavailable

**Endpoints:**
- Publisher: `https://publisher.walrus-testnet.walrus.space`
- Aggregator: `https://aggregator.walrus-testnet.walrus.space`
- Explorer: `https://walruscan.com/testnet/blob/{blobId}`

---

## Sui + Tatum Integration

All Sui blockchain interactions route through **Tatum's mainnet RPC infrastructure**.

After every verification, a receipt is written to **Sui mainnet** containing:
- Invoice hash
- Walrus blob ID
- Trust score
- Verification verdict
- Timestamp

**Tatum RPC:** `https://sui-mainnet.gateway.tatum.io`
**Explorer:** `https://suiscan.xyz/mainnet/tx/{txHash}`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, TailwindCSS, Framer Motion |
| Backend | Next.js API Routes, Node.js |
| AI Extraction | OpenAI GPT-4o-mini |
| Decentralised Storage | Walrus (testnet) |
| Blockchain | Sui mainnet |
| RPC Infrastructure | Tatum |
| PDF Generation | PDFKit |

---

## Running Locally

### Prerequisites

- Node.js v18+
- Tatum API key → [dashboard.tatum.io](https://dashboard.tatum.io)
- OpenAI API key → [platform.openai.com](https://platform.openai.com)

### Setup

```bash
git clone https://github.com/Megacollins/Verity.git
cd verity
npm install
```

Create `.env.local` in the root:

```env
TATUM_API_KEY=your_tatum_api_key
OPENAI_API_KEY=your_openai_api_key
SUI_NETWORK=mainnet
TATUM_RPC_URL=https://sui-mainnet.gateway.tatum.io
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
SUI_PRIVATE_KEY=your_sui_private_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Generate demo invoices

```bash
node scripts/generate-invoices.js
```

Creates `public/invoices/invoice_legit.pdf` and `public/invoices/invoice_fraud.pdf`.

---

## API Reference

### POST /api/upload
Upload invoice PDF → stores on Walrus, returns blob ID and hash.

### POST /api/verify
Run verification engine → returns trust score, verdict, and check breakdown.

### POST /api/receipt
Write audit receipt to Sui mainnet via Tatum → returns transaction hash.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/dashboard` | Upload and verify invoices |
| `/audit` | Full audit trail history |

---

## Built by

**Megacollins** — Tatum × Walrus Hackathon 2025
