'use client'

import React from 'react'

const RIBBON_TABS = [
  { id: 'start', label: 'Start' },
  { id: 'einfuegen', label: 'Einfügen' },
  { id: 'seitenlayout', label: 'Seitenlayout' },
  { id: 'daten', label: 'Daten' },
  { id: 'formeln', label: 'Formeln' },
]

interface RibbonTabStripProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isElectron?: boolean
}

export function RibbonTabStrip({ activeTab, onTabChange, isElectron }: RibbonTabStripProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        paddingLeft: isElectron ? 80 : 16,
        gap: 2,
        backgroundColor: '#f9fbfd',
        ...(isElectron ? { WebkitAppRegion: 'drag' } as React.CSSProperties : {}),
      }}
    >
      {RIBBON_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '7px 20px',
            fontSize: 13,
            letterSpacing: '0.01em',
            borderRadius: '4px 4px 0 0',
            transition: 'all 0.1s',
            position: 'relative',
            userSelect: 'none',
            cursor: 'pointer',
            ...(isElectron ? { WebkitAppRegion: 'no-drag' } as React.CSSProperties : {}),
            ...(activeTab === tab.id
              ? {
                  backgroundColor: 'white',
                  color: '#1a73e8',
                  fontWeight: 600,
                  borderTop: 'none',
                  borderLeft: '1px solid #dadce0',
                  borderRight: '1px solid #dadce0',
                  borderBottom: '3px solid #1a73e8',
                  marginBottom: -1,
                  zIndex: 10,
                }
              : {
                  backgroundColor: 'transparent',
                  color: '#5f6368',
                  fontWeight: 400,
                  border: '1px solid transparent',
                }
            ),
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
