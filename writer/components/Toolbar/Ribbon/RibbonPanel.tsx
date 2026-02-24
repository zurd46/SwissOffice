'use client'

import { ReactNode } from 'react'

interface RibbonPanelProps {
  children: ReactNode
}

export function RibbonPanel({ children }: RibbonPanelProps) {
  return (
    <div className="ribbon-panel bg-white border-t border-[#d2d0ce] px-2 py-[6px] flex items-stretch min-h-[94px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      {children}
    </div>
  )
}
