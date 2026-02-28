'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpiryBadge } from '@/components/ui/expiry-badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { getExpiryStatus } from '@/lib/expiry'

interface Token {
  id: string
  platform: string
  purpose: string
  scopes?: string | null
  tags: string
  createdAt: string
  expiresAt?: string | null
  hasValue: boolean
}

interface TokenListProps {
  tokens: Token[]
  onEdit: (token: Token) => void
  onDelete: (id: string) => void
  onViewToken: (token: Token) => void
}

type FilterStatus = 'all' | 'valid' | 'warning' | 'critical' | 'expired'

export function TokenList({ tokens, onEdit, onDelete, onViewToken }: TokenListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterTag, setFilterTag] = useState('')

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    tokens.forEach(token => {
      token.tags.split(',').forEach(tag => {
        const trimmed = tag.trim()
        if (trimmed) tags.add(trimmed)
      })
    })
    return Array.from(tags)
  }, [tokens])

  // Filter tokens
  const filteredTokens = useMemo(() => {
    return tokens.filter(token => {
      // Search filter
      const matchesSearch = 
        token.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.tags.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      // Status filter
      if (filterStatus !== 'all') {
        const expiryInfo = getExpiryStatus(token.expiresAt)
        const statusMap: Record<FilterStatus, string[]> = {
          all: [],
          valid: ['safe', 'no-expiry'],
          warning: ['warning'],
          critical: ['critical'],
          expired: ['expired'],
        }
        if (!statusMap[filterStatus].includes(expiryInfo.status)) {
          return false
        }
      }

      // Tag filter
      if (filterTag && !token.tags.includes(filterTag)) {
        return false
      }

      return true
    })
  }, [tokens, searchTerm, filterStatus, filterTag])

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="valid">Valid</option>
            <option value="warning">&lt; 30 days</option>
            <option value="critical">&lt; 7 days</option>
            <option value="expired">Expired</option>
          </select>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredTokens.length} of {tokens.length} tokens
      </p>

      {/* Token Grid */}
      {filteredTokens.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No tokens found. Create your first token!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTokens.map((token) => {
            const expiryInfo = getExpiryStatus(token.expiresAt)
            
            return (
              <Card key={token.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{token.platform}</CardTitle>
                      <StatusBadge status={expiryInfo.status} daysLeft={expiryInfo.daysLeft} />
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {token.purpose}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Expiry with progress bar */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Expires:</span>
                      <ExpiryBadge expiresAt={token.expiresAt} showProgress />
                    </div>
                    
                    {/* Tags */}
                    {token.tags && (
                      <div className="flex flex-wrap gap-1 pt-2">
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

                    {/* Scopes */}
                    {token.scopes && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-1">Scopes:</p>
                        <div className="flex flex-wrap gap-1">
                          {token.scopes.split(',').map((scope, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 px-2 py-1 text-xs"
                            >
                              {scope.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onViewToken(token)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onEdit(token)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(token.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
