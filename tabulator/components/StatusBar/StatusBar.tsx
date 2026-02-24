'use client'

// =============================================
// ImpulsTabulator — Statusleiste
// =============================================

import { useMemo } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useSpreadsheet, useActiveSheet } from '@/lib/spreadsheetContext'
import { cellAddressToString, normalizeRange, iterateRange } from '@/lib/engine/cellAddressUtils'
import { OnlineIndicator } from '@shared/components/OnlineIndicator'

interface StatusBarProps {
  zoom: number
  setZoom: (zoom: number) => void
}

export function StatusBar({ zoom, setZoom }: StatusBarProps) {
  const { state } = useSpreadsheet()
  const sheet = useActiveSheet()

  // Berechne Statistiken für die Auswahl
  const stats = useMemo(() => {
    const values: number[] = []
    let count = 0

    for (const range of state.selection.ranges) {
      for (const addr of iterateRange(normalizeRange(range))) {
        const key = cellAddressToString(addr)
        const cell = sheet.cells[key]
        if (cell && cell.value !== null && cell.value !== undefined && cell.value !== '') {
          count++
          if (typeof cell.value === 'number') {
            values.push(cell.value)
          }
        }
      }
    }

    if (values.length === 0) return { sum: null, avg: null, count }

    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length

    return { sum, avg, count }
  }, [state.selection.ranges, sheet.cells])

  return (
    <div
      style={{
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        color: '#5f6368',
        borderTop: '1px solid #dadce0',
        fontSize: 11,
        padding: '0 12px',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Linker Bereich */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span>Bereit</span>
        {stats.count > 0 && (
          <>
            <span style={{ color: '#dadce0' }}>|</span>
            <span>Anzahl: {stats.count}</span>
          </>
        )}
        {stats.sum !== null && (
          <>
            <span style={{ color: '#dadce0' }}>|</span>
            <span>Summe: {stats.sum.toLocaleString('de-CH', { maximumFractionDigits: 2 })}</span>
          </>
        )}
        {stats.avg !== null && (
          <>
            <span style={{ color: '#dadce0' }}>|</span>
            <span>Durchschnitt: {stats.avg.toLocaleString('de-CH', { maximumFractionDigits: 2 })}</span>
          </>
        )}
      </div>

      {/* Rechter Bereich: Online-Status + Zoom */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <OnlineIndicator />
        <button
          onClick={() => setZoom(Math.max(25, zoom - 10))}
          style={{ background: 'none', border: 'none', color: '#5f6368', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Minus size={12} />
        </button>
        <input
          type="range"
          min={25}
          max={200}
          value={zoom}
          onChange={(e) => setZoom(parseInt(e.target.value))}
          className="ribbon-zoom-slider"
          style={{ width: 100 }}
        />
        <button
          onClick={() => setZoom(Math.min(200, zoom + 10))}
          style={{ background: 'none', border: 'none', color: '#5f6368', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Plus size={12} />
        </button>
        <span style={{ minWidth: 32, textAlign: 'right' }}>{zoom}%</span>
      </div>
    </div>
  )
}
