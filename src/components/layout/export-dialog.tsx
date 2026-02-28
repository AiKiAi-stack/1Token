'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ExportDialogProps {
  tags: string[]
  onClose: () => void
}

export function ExportDialog({ tags, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<'env' | 'shell' | 'json'>('env')
  const [selectedTag, setSelectedTag] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({ format })
      if (selectedTag) params.set('tag', selectedTag)

      const response = await fetch(`/api/tokens/export?${params}`)
      const blob = await response.blob()
      
      const filenames = {
        env: '.env',
        shell: 'tokens.sh',
        json: 'tokens.json',
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filenames[format]
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onClose()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Export Tokens</CardTitle>
          <CardDescription>
            Export token metadata (decryption requires master password)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <div className="flex gap-2">
              <Button
                variant={format === 'env' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('env')}
              >
                .env
              </Button>
              <Button
                variant={format === 'shell' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('shell')}
              >
                Shell
              </Button>
              <Button
                variant={format === 'json' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormat('json')}
              >
                JSON
              </Button>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Tag</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">All Tags</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
