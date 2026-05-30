// ─── Trusted Supplier Registry ───────────────────────────────────────────────
//
// This is our seeded "ground truth" database.
// In a real system this would be backed by a database.
// For the demo, we hardcode two known suppliers.
//
// The verification engine compares extracted invoice data against this registry.

export interface SupplierRecord {
  id: string
  name: string
  trustedIban: string
  email: string
  registrationNumber: string
  status: 'verified' | 'unverified' | 'flagged'
  addedAt: string
}

export const TRUSTED_SUPPLIERS: Record<string, SupplierRecord> = {
  'acme-logistics': {
    id: 'acme-logistics',
    name: 'Acme Logistics Ltd',
    trustedIban: 'NL91ABNA0417164300',
    email: 'invoices@acme-logistics.com',
    registrationNumber: 'KVK-12345678',
    status: 'verified',
    addedAt: '2024-01-15T10:00:00Z',
  },
  'brighttech-solutions': {
    id: 'brighttech-solutions',
    name: 'BrightTech Solutions',
    trustedIban: 'GB29NWBK60161331926819',
    email: 'billing@brighttech.io',
    registrationNumber: 'CH-12345',
    status: 'verified',
    addedAt: '2024-03-22T09:30:00Z',
  },
}

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/**
 * Find a supplier by name (case-insensitive fuzzy match).
 * Returns null if not found.
 */
export function findSupplierByName(name: string): SupplierRecord | null {
  const normalised = name.toLowerCase().trim()
  for (const supplier of Object.values(TRUSTED_SUPPLIERS)) {
    if (supplier.name.toLowerCase().includes(normalised) || normalised.includes(supplier.name.toLowerCase())) {
      return supplier
    }
  }
  return null
}

/**
 * Check whether an IBAN matches the trusted IBAN for a supplier.
 */
export function validateIban(supplierName: string, iban: string): {
  valid: boolean
  expectedIban: string | null
  supplierFound: boolean
} {
  const supplier = findSupplierByName(supplierName)
  if (!supplier) {
    return { valid: false, expectedIban: null, supplierFound: false }
  }

  const normalisedInput = iban.replace(/\s/g, '').toUpperCase()
  const normalisedExpected = supplier.trustedIban.replace(/\s/g, '').toUpperCase()

  return {
    valid: normalisedInput === normalisedExpected,
    expectedIban: supplier.trustedIban,
    supplierFound: true,
  }
}
