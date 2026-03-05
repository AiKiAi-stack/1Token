'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TokenList } from '@/components/token/token-list'
import { TokenForm } from '@/components/token/token-form'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { ExportDialog } from '@/components/layout/export-dialog'

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [tokens, setTokens] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showExport, setShowExport] = useState(false)

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

  const handleCreateToken = async (data: any) => {
    const password = prompt('Enter master password to encrypt token:')
    if (!password) throw new Error('Password required')

    const response = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create token')
    }

    setShowForm(false)
    loadTokens()
  }

  const handleDeleteToken = async (id: string) => {
    if (!confirm('Are you sure?')) return
    await fetch(`/api/tokens/${id}`, { method: 'DELETE' })
    loadTokens()
  }

  const handleLogout = () => {
    localStorage.removeItem('sessionToken')
    router.push('/login')
  }

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">1Token</h1>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => setShowExport(true)}>Export</Button>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Your Tokens</h2>
            <p className="text-muted-foreground">Manage your API tokens securely</p>
          </div>
          {!showForm && <Button onClick={() => setShowForm(true)}>Add Token</Button>}
        </div>

        {showForm && (
          <div className="max-w-2xl">
            <TokenForm onSubmit={handleCreateToken} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {!showForm && (
          <TokenList
            tokens={tokens}
            onEdit={() => {}}
            onDelete={handleDeleteToken}
            onViewToken={() => {}}
          />
        )}

        {showExport && (
          <ExportDialog
            tags={[...new Set(tokens.flatMap((t: any) => t.tags.split(',').map((t: string) => t.trim()).filter(Boolean)))].sort()}
            onClose={() => setShowExport(false)}
          />
        )}
      </main>
    </div>
  )
}
