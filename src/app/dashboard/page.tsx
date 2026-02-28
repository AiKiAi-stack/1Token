'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const sessionToken = localStorage.getItem('sessionToken')
    if (!sessionToken) {
      router.push('/login')
      return
    }

    // TODO: Verify session with backend
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('sessionToken')
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
          <Button variant="outline" onClick={handleLogout}>
            Lock Vault
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your Token Vault</CardTitle>
            <CardDescription>
              Your API tokens are securely encrypted and stored locally
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Token management features coming soon...
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
