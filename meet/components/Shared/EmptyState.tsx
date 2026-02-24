'use client'

import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="text-[#a19f9d] mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-[#323130] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#605e5c] max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}
