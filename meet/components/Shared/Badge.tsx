'use client'

import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  count: number
  maxCount?: number
  className?: string
}

export function Badge({ count, maxCount = 99, className }: BadgeProps) {
  if (count <= 0) return null

  const display = count > maxCount ? `${maxCount}+` : String(count)

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full',
        'bg-[#c4314b] text-white text-[11px] font-semibold leading-none',
        className
      )}
    >
      {display}
    </span>
  )
}
