export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'safe' | 'no-expiry'

export interface ExpiryInfo {
  status: ExpiryStatus
  label: string
  colorClass: string
  daysLeft?: number
}

/**
 * Calculate expiry status based on expiresAt date
 */
export function getExpiryStatus(expiresAt?: string | null): ExpiryInfo {
  if (!expiresAt) {
    return {
      status: 'no-expiry',
      label: 'No expiry',
      colorClass: 'text-gray-500',
    }
  }

  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const timeDiff = expiryDate.getTime() - now.getTime()
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return {
      status: 'expired',
      label: 'Expired',
      colorClass: 'text-red-600 font-semibold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded',
      daysLeft,
    }
  }

  if (daysLeft === 0) {
    return {
      status: 'critical',
      label: 'Expires today',
      colorClass: 'text-red-600 font-semibold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded',
      daysLeft,
    }
  }

  if (daysLeft < 7) {
    return {
      status: 'critical',
      label: `${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
      colorClass: 'text-red-600 font-semibold bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded',
      daysLeft,
    }
  }

  if (daysLeft < 30) {
    return {
      status: 'warning',
      label: `${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
      colorClass: 'text-orange-500 font-medium bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded',
      daysLeft,
    }
  }

  return {
    status: 'safe',
    label: `${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
    colorClass: 'text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded',
    daysLeft,
  }
}

/**
 * Format date to readable string
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get expiry progress percentage (for progress bar)
 * Assumes 90 days as typical token lifetime
 */
export function getExpiryProgress(expiresAt?: string | null): number | null {
  if (!expiresAt) return null

  const now = new Date()
  const expiryDate = new Date(expiresAt)
  const createdAt = new Date(expiryDate.getTime() - 90 * 24 * 60 * 60 * 1000) // Assume 90 days lifetime

  const totalDuration = expiryDate.getTime() - createdAt.getTime()
  const elapsedDuration = now.getTime() - createdAt.getTime()

  const percentage = (elapsedDuration / totalDuration) * 100
  return Math.min(100, Math.max(0, percentage))
}
