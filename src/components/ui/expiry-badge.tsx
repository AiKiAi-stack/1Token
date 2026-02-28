'use client'

import { useEffect, useState } from 'react'
import { getExpiryStatus, type ExpiryInfo } from '@/lib/expiry'

interface ExpiryBadgeProps {
  expiresAt?: string | null
  showProgress?: boolean
}

export function ExpiryBadge({ expiresAt, showProgress = false }: ExpiryBadgeProps) {
  const expiryInfo = getExpiryStatus(expiresAt)
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    if (showProgress && expiresAt) {
      // Update progress every minute
      const updateProgress = () => {
        const now = new Date()
        const expiryDate = new Date(expiresAt)
        const createdAt = new Date(expiryDate.getTime() - 90 * 24 * 60 * 60 * 1000)
        const totalDuration = expiryDate.getTime() - createdAt.getTime()
        const elapsedDuration = now.getTime() - createdAt.getTime()
        const percentage = (elapsedDuration / totalDuration) * 100
        setProgress(Math.min(100, Math.max(0, percentage)))
      }

      updateProgress()
      const interval = setInterval(updateProgress, 60000)
      return () => clearInterval(interval)
    }
  }, [expiresAt, showProgress])

  return (
    <div className="inline-flex flex-col gap-1">
      <span className={expiryInfo.colorClass}>
        {expiryInfo.label}
      </span>
      {showProgress && progress !== null && (
        <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              progress > 80
                ? 'bg-red-500'
                : progress > 50
                ? 'bg-orange-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
