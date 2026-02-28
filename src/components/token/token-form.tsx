'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SCOPE_PRESETS, getScopePresets, getDefaultExpiryDays } from '@/lib/scope-presets'

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
  const [showPresets, setShowPresets] = useState(false)

  useEffect(() => {
    if (platform && !initialData && !expiresAt) {
      const defaultDays = getDefaultExpiryDays(platform)
      if (defaultDays) {
        const date = new Date()
        date.setDate(date.getDate() + defaultDays)
        setExpiresAt(date.toISOString().split('T')[0])
      }
    }
  }, [platform, initialData, expiresAt])

  const handleSelectPreset = (presetScopes: string[]) => {
    setScopes(presetScopes.join(', '))
    setShowPresets(false)
  }

  const presets = platform ? getScopePresets(platform) : []

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
              list="platform-suggestions"
            />
            <datalist id="platform-suggestions">
              {SCOPE_PRESETS.map(preset => (
                <option key={preset.platform} value={preset.platform} />
              ))}
            </datalist>
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="scopes">
                Scopes / Permissions
              </label>
              {presets.length > 0 && !initialData && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPresets(!showPresets)}
                >
                  Use Preset
                </Button>
              )}
            </div>
            <Input
              id="scopes"
              placeholder="e.g., repo, user:email, read:org"
              value={scopes}
              onChange={(e) => setScopes(e.target.value)}
              disabled={isLoading}
            />
            
            {showPresets && presets.length > 0 && (
              <div className="space-y-2 border rounded-md p-3 mt-2">
                <p className="text-xs text-muted-foreground">Select a preset:</p>
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPreset(preset.scopes)}
                    className="w-full text-left p-2 hover:bg-secondary rounded text-sm"
                  >
                    <p className="font-medium">{preset.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {preset.scopes.join(', ')}
                    </p>
                  </button>
                ))}
              </div>
            )}
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
            {platform && !initialData && (
              <p className="text-xs text-muted-foreground">
                {getDefaultExpiryDays(platform) 
                  ? `Suggested: ${getDefaultExpiryDays(platform)} days for ${platform}`
                  : `${platform} tokens typically don't expire`}
              </p>
            )}
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
