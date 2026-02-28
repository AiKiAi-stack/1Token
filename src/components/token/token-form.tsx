'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TokenFormProps {
  onSubmit: (data: {
    platform: string
    tokenValue: string
    purpose: string
    scopes?: string
    expiresAt?: string
    tags?: string
  }) => Promise<void>
  initialData?: {
    id?: string
    platform: string
    purpose: string
    scopes?: string | null
    tags: string
    expiresAt?: string | null
  } | null
  onCancel: () => void
}

export function TokenForm({ onSubmit, initialData, onCancel }: TokenFormProps) {
  const [platform, setPlatform] = useState(initialData?.platform || '')
  const [tokenValue, setTokenValue] = useState('')
  const [purpose, setPurpose] = useState(initialData?.purpose || '')
  const [scopes, setScopes] = useState(initialData?.scopes || '')
  const [expiresAt, setExpiresAt] = useState(
    initialData?.expiresAt ? initialData.expiresAt.split('T')[0] : ''
  )
  const [tags, setTags] = useState(initialData?.tags || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await onSubmit({
        platform,
        tokenValue,
        purpose,
        scopes: scopes || undefined,
        expiresAt: expiresAt || undefined,
        tags: tags || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save token')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Token' : 'Add New Token'}</CardTitle>
        <CardDescription>
          {initialData ? 'Update your token information' : 'Store a new API token securely'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="platform">
              Platform *
            </label>
            <Input
              id="platform"
              placeholder="e.g., GitHub, PyPI, AWS"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {!initialData && (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="tokenValue">
                Token Value *
              </label>
              <Input
                id="tokenValue"
                type="password"
                placeholder="Your API token"
                value={tokenValue}
                onChange={(e) => setTokenValue(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="purpose">
              Purpose *
            </label>
            <Input
              id="purpose"
              placeholder="What is this token used for?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="scopes">
              Scopes / Permissions
            </label>
            <Input
              id="scopes"
              placeholder="e.g., repo, user:email, read:org"
              value={scopes}
              onChange={(e) => setScopes(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="expiresAt">
              Expiry Date
            </label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="tags">
              Tags (comma-separated)
            </label>
            <Input
              id="tags"
              placeholder="e.g., Prod, Test, CI/CD"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
