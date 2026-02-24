'use client'

import { ReactNode } from 'react'

interface RibbonPanelProps {
  children: ReactNode
}

export function RibbonPanel({ children }: RibbonPanelProps) {
  return (
    <div className="bg-white border-t border-[#d2d0ce] px-2 flex items-start h-[82px] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
      {children}
    </div>
  )
}
