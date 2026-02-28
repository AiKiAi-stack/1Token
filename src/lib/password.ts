import { hashPassword, verifyPassword } from './auth'

// In-memory storage for demo (replace with database in production)
let storedHash: string | null = null
let storedSalt: string | null = null

/**
 * Check if master password has been set up
 */
export async function isMasterPasswordSet(): Promise<boolean> {
  return storedHash !== null && storedSalt !== null
}

/**
 * Set up master password (first time setup)
 */
export async function setupMasterPassword(password: string): Promise<{ success: boolean; error?: string }> {
  if (storedHash !== null) {
    return { success: false, error: 'Master password already set' }
  }

  const { hash, salt } = await hashPassword(password)
  storedHash = hash
  storedSalt = salt

  return { success: true }
}

/**
 * Verify master password
 */
export async function verifyMasterPassword(password: string): Promise<{ success: boolean; error?: string }> {
  if (!storedHash || !storedSalt) {
    return { success: false, error: 'Master password not set' }
  }

  const isValid = await verifyPassword(password, storedHash, storedSalt)

  if (!isValid) {
    return { success: false, error: 'Invalid password' }
  }

  return { success: true }
}

/**
 * Get the derived encryption key from password
 * This would normally be stored in session
 */
export async function getEncryptionKey(password: string): Promise<string> {
  const { hash } = await hashPassword(password)
  return hash
}
