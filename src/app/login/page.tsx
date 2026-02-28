'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSetupMode, setIsSetupMode] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password, 
          action: isSetupMode ? 'setup' : 'verify' 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Store session token
      if (data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken)
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>1Token</CardTitle>
          <CardDescription>
            {isSetupMode 
              ? 'Set up your master password' 
              : 'Enter your master password to unlock'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || password.length === 0}
            >
              {isLoading ? 'Please wait...' : (isSetupMode ? 'Set Password' : 'Unlock')}
            </Button>

            {!isSetupMode && (
              <p className="text-xs text-center text-muted-foreground">
                First time?{' '}
                <button
                  type="button"
                  onClick={() => setIsSetupMode(true)}
                  className="text-primary hover:underline"
                >
                  Set up master password
                </button>
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
