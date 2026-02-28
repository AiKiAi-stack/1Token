'use client'

import { Badge } from './badge'

interface StatusBadgeProps {
  status: 'expired' | 'critical' | 'warning' | 'safe' | 'no-expiry'
  daysLeft?: number
}

export function StatusBadge({ status, daysLeft }: StatusBadgeProps) {
  const config = {
    expired: {
      label: 'Expired',
      variant: 'destructive' as const,
    },
    critical: {
      label: daysLeft !== undefined && daysLeft < 1 ? 'Today' : `< 7 days`,
      variant: 'destructive' as const,
    },
    warning: {
      label: '< 30 days',
      variant: 'secondary' as const,
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    },
    safe: {
      label: 'Valid',
      variant: 'secondary' as const,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    'no-expiry': {
      label: 'Permanent',
      variant: 'secondary' as const,
    },
  }

  const { label, variant, className } = config[status]

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
