'use client'

import { type ReactNode } from 'react'

interface RibbonGroupProps {
  label: string
  children: ReactNode
  className?: string
}

export function RibbonGroup({ label, children }: RibbonGroupProps) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '0 14px', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 3, paddingTop: 6, paddingBottom: 2 }}>
          {children}
        </div>
        <span style={{ fontSize: 9, color: '#a19f9d', lineHeight: 1, paddingBottom: 5, marginTop: 'auto', textAlign: 'center', userSelect: 'none', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </span>
      </div>
      <div style={{ width: 1, backgroundColor: '#d2d0ce', alignSelf: 'stretch', margin: '8px 0' }} />
    </>
  )
}

export function RibbonGroupLast({ label, children }: RibbonGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 14px', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 3, paddingTop: 6, paddingBottom: 2 }}>
        {children}
      </div>
      <span style={{ fontSize: 9, color: '#a19f9d', lineHeight: 1, paddingBottom: 5, marginTop: 'auto', textAlign: 'center', userSelect: 'none', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
  )
}
