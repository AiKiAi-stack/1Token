'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Token {
  id: string
  platform: string
  purpose: string
  lastUsed?: string | null
  createdAt: string
  reminded: boolean
  expiresAt?: string | null
}

interface AuditStats {
  totalTokens: number
  unusedTokens: number
  remindedTokens: number
  expiringTokens: number
}

export default function AuditPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [tokens, setTokens] = useState<Token[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)

  useEffect(() => {
    const sessionToken = localStorage.getItem('sessionToken')
    if (!sessionToken) {
      router.push('/login')
      return
    }
    loadAuditData()
  }, [router])

  const loadAuditData = async () => {
    try {
      const response = await fetch('/api/tokens')
      const data = await response.json()
      const allTokens: Token[] = data.tokens || []
      setTokens(allTokens)

      // Calculate stats
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      const stats: AuditStats = {
        totalTokens: allTokens.length,
        unusedTokens: allTokens.filter(t => !t.lastUsed || new Date(t.lastUsed) < thirtyDaysAgo).length,
        remindedTokens: allTokens.filter(t => t.reminded).length,
        expiringTokens: allTokens.filter(t => t.expiresAt && new Date(t.expiresAt) < sevenDaysFromNow).length,
      }
      setStats(stats)
    } catch (error) {
      console.error('Failed to load audit data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUnusedReason = (token: Token): string => {
    if (!token.lastUsed) return 'Never used'
    const daysSinceUse = Math.floor((Date.now() - new Date(token.lastUsed).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceUse > 90) return `Unused for ${daysSinceUse} days`
    if (daysSinceUse > 30) return `Unused for ${daysSinceUse} days`
    return ''
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">1Token Audit</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Security Audit</h2>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{stats.totalTokens}</CardTitle>
                <CardDescription>Total Tokens</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-orange-600">{stats.unusedTokens}</CardTitle>
                <CardDescription>Unused (30+ days)</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">{stats.remindedTokens}</CardTitle>
                <CardDescription>Reminded</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-red-600">{stats.expiringTokens}</CardTitle>
                <CardDescription>Expiring Soon</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Unused Tokens */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🧹 Cleanup Recommendations</CardTitle>
            <CardDescription>
              Tokens that haven't been used recently and may be safe to delete
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tokens.filter(t => getUnusedReason(t)).length === 0 ? (
              <p className="text-muted-foreground">All tokens are actively used!</p>
            ) : (
              <div className="space-y-2">
                {tokens
                  .filter(t => getUnusedReason(t))
                  .map(token => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{token.platform}</p>
                        <p className="text-sm text-muted-foreground">{token.purpose}</p>
                      </div>
                      <span className="text-sm text-orange-600">
                        {getUnusedReason(token)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Usage History */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Token Usage History</CardTitle>
            <CardDescription>Last access time for each token</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tokens.map(token => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{token.platform}</p>
                    <p className="text-sm text-muted-foreground">{token.purpose}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {token.lastUsed
                        ? new Date(token.lastUsed).toLocaleDateString()
                        : 'Never'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last used
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
