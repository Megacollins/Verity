// ─── Walrus Decentralized Storage Integration ─────────────────────────────────
//
// Walrus stores our invoice blobs and returns a permanent blob ID.
// If Walrus testnet is down, we gracefully fall back to a local simulation
// so the rest of the demo flow still works.

import { WalrusUploadResult } from '@/types'
import crypto from 'crypto'

const PUBLISHER_URL = process.env.WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space'

/**
 * Compute SHA-256 hash of a buffer.
 */
export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

/**
 * Upload a file buffer to Walrus.
 * Returns a WalrusUploadResult with the blob ID, hash, and timestamp.
 *
 * If Walrus is unreachable, falls back to a deterministic local simulation
 * so the demo never breaks.
 */
export async function uploadToWalrus(
  fileBuffer: Buffer,
  filename: string,
): Promise<WalrusUploadResult> {
  const fileHash = hashBuffer(fileBuffer)
  const uploadedAt = new Date().toISOString()
  const size = fileBuffer.length

  try {
    const response = await fetch(`${PUBLISHER_URL}/v1/blobs?epochs=5`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: new Uint8Array(fileBuffer),
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    if (!response.ok) {
      throw new Error(`Walrus responded with ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Walrus returns either { newlyCreated: { blobObject: { blobId } } }
    // or { alreadyCertified: { blobId } }
    const blobId =
      data?.newlyCreated?.blobObject?.blobId ||
      data?.alreadyCertified?.blobId ||
      data?.blobId

    if (!blobId) {
      throw new Error('Walrus response did not contain a blobId')
    }

    console.log(`✅ Walrus upload success: ${blobId}`)

    return { blobId, fileHash, uploadedAt, size, status: 'stored' }
  } catch (err) {
    // Graceful fallback — generate a deterministic fake blob ID from the hash
    // so the rest of the verification flow continues uninterrupted.
    console.warn(`⚠️  Walrus upload failed (${(err as Error).message}). Using fallback.`)

    const fallbackBlobId = `fallback-${fileHash.slice(0, 32)}`

    return {
      blobId: fallbackBlobId,
      fileHash,
      uploadedAt,
      size,
      status: 'fallback',
    }
  }
}

/**
 * Get the retrieval URL for a Walrus blob.
 */
export function getWalrusRetrievalUrl(blobId: string): string {
  const AGGREGATOR_URL = process.env.WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space'
  return `${AGGREGATOR_URL}/v1/blobs/${blobId}`
}
