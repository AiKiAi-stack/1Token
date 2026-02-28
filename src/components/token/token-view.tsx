'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Token {
  id: string
  platform: string
  purpose: string
  scopes?: string | null
  tags: string
  expiresAt?: string | null
  encryptedVal?: string
  iv?: string
  authTag?: string
}

interface TokenViewProps {
  token: Token
  onClose: () => void
  onDecrypt: (token: Token, password: string) => Promise<string>
}

export function TokenView({ token, onClose, onDecrypt }: TokenViewProps) {
  const [isDecrypted, setIsDecrypted] = useState(false)
  const [decryptedValue, setDecryptedValue] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDecrypt = async () => {
    if (!password) {
      setError('Please enter your master password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const value = await onDecrypt(token, password)
      setDecryptedValue(value)
      setIsDecrypted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decrypt')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(decryptedValue)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{token.platform}</CardTitle>
        <CardDescription>{token.purpose}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Platform:</span>
            <span className="font-medium">{token.platform}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Purpose:</span>
            <span className="font-medium">{token.purpose}</span>
          </div>
          {token.scopes && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Scopes:</span>
              <span className="font-medium">{token.scopes}</span>
            </div>
          )}
          {token.tags && (
            <div className="flex flex-wrap gap-1">
              {token.tags.split(',').map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
          {token.expiresAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Expires:</span>
              <span className={new Date(token.expiresAt) < new Date() ? 'text-red-600 font-semibold' : 'text-green-600'}>
                {new Date(token.expiresAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {!isDecrypted ? (
          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium" htmlFor="password">
              Enter Master Password to View Token
            </label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="password"
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleDecrypt} disabled={isLoading}>
                {isLoading ? 'Decrypting...' : 'Decrypt'}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        ) : (
          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium">Token Value</label>
            <div className="flex gap-2">
              <Input
                value={decryptedValue}
                readOnly
                className="font-mono"
              />
              <Button onClick={copyToClipboard}>Copy</Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
