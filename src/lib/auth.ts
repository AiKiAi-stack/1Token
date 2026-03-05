import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)
const KEY_LENGTH = 64 // 512 bits for password hash
const SALT_LENGTH = 32
const N = 16384 // CPU/memory cost parameter (2^14)
const r = 8 // Block size
const p = 1 // Parallelization parameter

/**
 * Hash a password using scrypt
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(SALT_LENGTH).toString('hex')
  const key = (await scryptAsync(password, salt, KEY_LENGTH, {
    N,
    r,
    p,
  })) as Buffer

  return {
    hash: key.toString('hex'),
    salt,
  }
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const key = (await scryptAsync(password, storedSalt, KEY_LENGTH, {
    N,
    r,
    p,
  })) as Buffer

  const storedHashBuffer = Buffer.from(storedHash, 'hex')

  try {
    return timingSafeEqual(key, storedHashBuffer)
  } catch {
    return false
  }
}

/**
 * Generate a session ID for authenticated users
 */
export function generateSessionId(): string {
  return randomBytes(32).toString('hex')
}
