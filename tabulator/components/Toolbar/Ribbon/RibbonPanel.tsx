'use client'

import { type ReactNode } from 'react'

interface RibbonPanelProps {
  children: ReactNode
}

export function RibbonPanel({ children }: RibbonPanelProps) {
  return (
    <div style={{ backgroundColor: 'white', borderTop: '1px solid #dadce0', padding: '0 16px', display: 'flex', alignItems: 'flex-start', height: 80, gap: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      {children}
    </div>
  )
}
