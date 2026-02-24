'use client'

import React from 'react'

const RIBBON_TABS = [
  { id: 'start', label: 'Start' },
  { id: 'einfuegen', label: 'Einfügen' },
  { id: 'seitenlayout', label: 'Seitenlayout' },
  { id: 'ansicht', label: 'Ansicht' },
  { id: 'ki', label: 'KI' },
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
        backgroundColor: '#f3f3f3',
        // Make the tab strip area draggable on macOS Electron (window drag)
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
            // Buttons must be no-drag so they remain clickable
            ...(isElectron ? { WebkitAppRegion: 'no-drag' } as React.CSSProperties : {}),
            ...(activeTab === tab.id
              ? {
                  backgroundColor: 'white',
                  color: '#0078d4',
                  fontWeight: 600,
                  borderTop: '2px solid #0078d4',
                  borderLeft: '1px solid #d2d0ce',
                  borderRight: '1px solid #d2d0ce',
                  borderBottom: 'none',
                  marginBottom: -1,
                  zIndex: 10,
                }
              : {
                  backgroundColor: 'transparent',
                  color: '#616161',
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
