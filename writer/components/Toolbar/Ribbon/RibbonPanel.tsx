'use client'

import { ReactNode } from 'react'

interface RibbonPanelProps {
  children: ReactNode
}

export function RibbonPanel({ children }: RibbonPanelProps) {
  return (
    <div style={{ backgroundColor: 'white', borderTop: '1px solid #d2d0ce', padding: '0 16px', display: 'flex', alignItems: 'flex-start', height: 86, gap: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  )
}
