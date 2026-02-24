'use client'

import { ReactNode } from 'react'

interface RibbonPanelProps {
  children: ReactNode
}

export function RibbonPanel({ children }: RibbonPanelProps) {
  return (
    <div className="bg-white border-t border-gray-300 px-1 py-1 flex items-stretch min-h-[90px]">
      {children}
    </div>
  )
}
