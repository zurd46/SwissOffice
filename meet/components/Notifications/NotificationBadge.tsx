'use client'

import { Badge } from '@/components/Shared/Badge'

interface NotificationBadgeProps {
  count: number
}

export function NotificationBadge({ count }: NotificationBadgeProps) {
  return <Badge count={count} />
}
