'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

export function TokenList({ tokens, onEdit, onDelete, onViewToken }: TokenListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTokens = tokens.filter(
    (token) =>
      token.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.tags.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getExpiryStatus = (expiresAt?: string | null) => {
    if (!expiresAt) return { label: 'No expiry', color: 'text-gray-500' }
    
    const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft < 0) return { label: 'Expired', color: 'text-red-600 font-semibold' }
    if (daysLeft < 1) return { label: '< 1 day', color: 'text-red-600 font-semibold' }
    if (daysLeft < 7) return { label: `${daysLeft} days`, color: 'text-orange-500 font-medium' }
    if (daysLeft < 30) return { label: `${daysLeft} days`, color: 'text-yellow-600' }
    return { label: `${daysLeft} days`, color: 'text-green-600' }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search tokens by platform, purpose, or tags..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      {filteredTokens.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No tokens found. Create your first token!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTokens.map((token) => {
            const expiryStatus = getExpiryStatus(token.expiresAt)
            
            return (
              <Card key={token.id} className="relative">
                <CardHeader>
                  <CardTitle className="text-lg">{token.platform}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {token.purpose}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className={expiryStatus.color}>{expiryStatus.label}</span>
                    </div>
                    
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

                    <div className="flex gap-2 pt-2">
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
