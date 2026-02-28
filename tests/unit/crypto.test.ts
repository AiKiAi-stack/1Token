import { describe, it, expect, beforeEach } from 'vitest'
import { encrypt, decrypt, deriveKey, generateSalt } from '../../src/lib/crypto'

describe('Crypto Module', () => {
  const testPassword = 'test-password-123'
  const testPlaintext = 'sk-test-abc123xyz789'

  describe('deriveKey', () => {
    it('should derive a key from password and salt', async () => {
      const salt = Buffer.from(generateSalt(), 'base64')
      const key = await deriveKey(testPassword, salt)
      
      expect(key).toBeDefined()
      expect(key.length).toBe(32) // 256 bits
      expect(Buffer.isBuffer(key)).toBe(true)
    })

    it('should derive same key with same password and salt', async () => {
      const salt = Buffer.from(generateSalt(), 'base64')
      const key1 = await deriveKey(testPassword, salt)
      const key2 = await deriveKey(testPassword, salt)
      
      expect(key1.toString('hex')).toBe(key2.toString('hex'))
    })

    it('should derive different keys with different salts', async () => {
      const salt1 = Buffer.from(generateSalt(), 'base64')
      const salt2 = Buffer.from(generateSalt(), 'base64')
      const key1 = await deriveKey(testPassword, salt1)
      const key2 = await deriveKey(testPassword, salt2)
      
      expect(key1.toString('hex')).not.toBe(key2.toString('hex'))
    })
  })

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt successfully', async () => {
      const { encryptedData, iv, authTag, salt } = await encrypt(testPlaintext, testPassword)
      
      expect(encryptedData).toBeDefined()
      expect(iv).toBeDefined()
      expect(authTag).toBeDefined()
      expect(salt).toBeDefined()
      
      const decrypted = await decrypt(encryptedData, iv, authTag, salt, testPassword)
      expect(decrypted).toBe(testPlaintext)
    })

    it('should produce different ciphertext for same plaintext', async () => {
      const result1 = await encrypt(testPlaintext, testPassword)
      const result2 = await encrypt(testPlaintext, testPassword)
      
      expect(result1.encryptedData).not.toBe(result2.encryptedData)
    })

    it('should fail to decrypt with wrong password', async () => {
      const { encryptedData, iv, authTag, salt } = await encrypt(testPlaintext, testPassword)
      
      await expect(async () => {
        await decrypt(encryptedData, iv, authTag, salt, 'wrong-password')
      }).rejects.toThrow()
    })

    it('should handle empty string', async () => {
      const { encryptedData, iv, authTag, salt } = await encrypt('', testPassword)
      const decrypted = await decrypt(encryptedData, iv, authTag, salt, testPassword)
      expect(decrypted).toBe('')
    })

    it('should handle long strings', async () => {
      const longText = 'a'.repeat(1000)
      const { encryptedData, iv, authTag, salt } = await encrypt(longText, testPassword)
      const decrypted = await decrypt(encryptedData, iv, authTag, salt, testPassword)
      expect(decrypted).toBe(longText)
    })

    it('should handle special characters', async () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~\\🚀'
      const { encryptedData, iv, authTag, salt } = await encrypt(specialText, testPassword)
      const decrypted = await decrypt(encryptedData, iv, authTag, salt, testPassword)
      expect(decrypted).toBe(specialText)
    })
  })

  describe('generateSalt', () => {
    it('should generate a valid base64 salt', () => {
      const salt = generateSalt()
      expect(salt).toBeDefined()
      expect(typeof salt).toBe('string')
      expect(() => Buffer.from(salt, 'base64')).not.toThrow()
    })

    it('should generate different salts each time', () => {
      const salt1 = generateSalt()
      const salt2 = generateSalt()
      expect(salt1).not.toBe(salt2)
    })
  })
})
