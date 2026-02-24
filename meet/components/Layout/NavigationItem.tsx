'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/Shared/Badge'
import { Tooltip } from '@/components/Shared/Tooltip'

interface NavigationItemProps {
  icon: ReactNode
  label: string
  isActive: boolean
  badge?: number
  onClick: () => void
}

export function NavigationItem({ icon, label, isActive, badge, onClick }: NavigationItemProps) {
  return (
    <Tooltip content={label} position="right">
      <button
        onClick={onClick}
        className={cn(
          'relative w-12 h-12 flex items-center justify-center rounded-md transition-colors',
          isActive
            ? 'bg-[#e8e6e4] text-[#242424]'
            : 'text-[#605e5c] hover:bg-[#f3f2f1] hover:text-[#242424]'
        )}
      >
        {icon}
        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#0078d4] rounded-r" />
        )}
        {badge !== undefined && badge > 0 && (
          <Badge count={badge} className="absolute -top-0.5 -right-0.5" />
        )}
      </button>
    </Tooltip>
  )
}
