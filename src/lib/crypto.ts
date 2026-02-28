import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32
const ITERATIONS = 100000

/**
 * Derive a 256-bit key from a password using PBKDF2
 */
export async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, {
      N: ITERATIONS,
      r: 8,
      p: 1,
      maxmem: 128 * 1024 * 1024,
    }, (err, derivedKey) => {
      if (err) reject(err)
      else resolve(derivedKey)
    })
  })
}

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns object with encrypted data, iv, authTag, and salt (all base64 encoded)
 */
export async function encrypt(plaintext: string, password: string): Promise<{
  encryptedData: string
  iv: string
  authTag: string
  salt: string
}> {
  const salt = randomBytes(SALT_LENGTH)
  const key = await deriveKey(password, salt)
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag().toString('base64')

  return {
    encryptedData: encrypted,
    iv: iv.toString('base64'),
    authTag: authTag,
    salt: salt.toString('base64'),
  }
}

/**
 * Decrypt ciphertext using AES-256-GCM
 */
export async function decrypt(
  encryptedData: string,
  iv: string,
  authTag: string,
  salt: string,
  password: string
): Promise<string> {
  const key = await deriveKey(password, Buffer.from(salt, 'base64'))
  const ivBuffer = Buffer.from(iv, 'base64')
  const authTagBuffer = Buffer.from(authTag, 'base64')

  const decipher = createDecipheriv(ALGORITHM, key, ivBuffer, {
    authTagLength: AUTH_TAG_LENGTH,
  })

  decipher.setAuthTag(authTagBuffer)

  let decrypted = decipher.update(encryptedData, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): string {
  return randomBytes(SALT_LENGTH).toString('base64')
}
