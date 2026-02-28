'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TokenList } from '@/components/token/token-list'
import { TokenForm } from '@/components/token/token-form'
import { TokenView } from '@/components/token/token-view'
import { decrypt } from '@/lib/crypto'

interface Token {
  id: string
  platform: string
  purpose: string
  scopes?: string | null
  tags: string
  createdAt: string
  expiresAt?: string | null
  hasValue?: boolean
  encryptedVal?: string
  iv?: string
  authTag?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [tokens, setTokens] = useState<Token[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingToken, setEditingToken] = useState<Token | null>(null)
  const [viewingToken, setViewingToken] = useState<Token | null>(null)
  const [masterPassword, setMasterPassword] = useState<string | null>(null)

  useEffect(() => {
    const sessionToken = localStorage.getItem('sessionToken')
    if (!sessionToken) {
      router.push('/login')
      return
    }
    setIsLoading(false)
  }, [router])

  const loadTokens = async () => {
    try {
      const response = await fetch('/api/tokens')
      const data = await response.json()
      setTokens(data.tokens || [])
    } catch (error) {
      console.error('Failed to load tokens:', error)
    }
  }

  useEffect(() => {
    if (!isLoading) {
      loadTokens()
    }
  }, [isLoading])

  const handleCreateToken = async (data: {
    platform: string
    tokenValue: string
    purpose: string
    scopes?: string
    expiresAt?: string
    tags?: string
  }) => {
    const password = prompt('Enter master password to encrypt token:')
    if (!password) throw new Error('Password required')
    setMasterPassword(password)

    const { encryptedData, iv, authTag } = await decrypt.encrypt(data.tokenValue, password)

    const response = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: data.platform,
        encryptedVal: encryptedData,
        iv,
        authTag,
        purpose: data.purpose,
        scopes: data.scopes,
        expiresAt: data.expiresAt,
        tags: data.tags,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create token')
    }

    setShowForm(false)
    loadTokens()
  }

  const handleUpdateToken = async (data: {
    platform: string
    tokenValue: string
    purpose: string
    scopes?: string
    expiresAt?: string
    tags?: string
  }) => {
    if (!editingToken) return

    const response = await fetch(`/api/tokens/${editingToken.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: data.platform,
        purpose: data.purpose,
        scopes: data.scopes,
        expiresAt: data.expiresAt,
        tags: data.tags,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update token')
    }

    setEditingToken(null)
    loadTokens()
  }

  const handleDeleteToken = async (id: string) => {
    if (!confirm('Are you sure you want to delete this token?')) return

    const response = await fetch(`/api/tokens/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      alert(error.error || 'Failed to delete token')
      return
    }

    loadTokens()
  }

  const handleViewToken = async (token: Token) => {
    const response = await fetch(`/api/tokens/${token.id}`)
    const data = await response.json()
    setViewingToken(data.token)
  }

  const handleDecryptToken = async (token: Token, password: string): Promise<string> => {
    if (!token.encryptedVal || !token.iv || !token.authTag) {
      throw new Error('Token data incomplete')
    }

    const decrypted = await decrypt(
      token.encryptedVal,
      token.iv,
      token.authTag,
      '',
      password
    )

    return decrypted
  }

  const handleLogout = () => {
    localStorage.removeItem('sessionToken')
    setMasterPassword(null)
    router.push('/login')
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
          <h1 className="text-2xl font-bold">1Token</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/audit')}>
              Audit Log
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Lock Vault
            </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Your Tokens</h2>
            <p className="text-muted-foreground">
              Manage your API tokens securely
            </p>
          </div>
          {!showForm && !editingToken && !viewingToken && (
            <Button onClick={() => setShowForm(true)}>
              Add Token
            </Button>
          )}
        </div>

        {showForm && (
          <div className="max-w-2xl">
            <TokenForm
              onSubmit={handleCreateToken}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {editingToken && (
          <div className="max-w-2xl">
            <TokenForm
              onSubmit={handleUpdateToken}
              initialData={editingToken}
              onCancel={() => setEditingToken(null)}
            />
          </div>
        )}

        {viewingToken && (
          <div className="max-w-2xl">
            <TokenView
              token={viewingToken}
              onClose={() => setViewingToken(null)}
              onDecrypt={handleDecryptToken}
            />
          </div>
        )}

        {!showForm && !editingToken && !viewingToken && (
          <TokenList
            tokens={tokens}
            onEdit={setEditingToken}
            onDelete={handleDeleteToken}
            onViewToken={handleViewToken}
          />
        )}
      </main>
    </div>
  )
}
