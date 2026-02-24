'use client'

// =============================================
// ImpulsTabulator — Sortieren-Dialog (Mehrstufig)
// =============================================

import { useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { useSpreadsheet, useActiveSheet } from '@/lib/spreadsheetContext'
import { columnIndexToLetter, letterToColumnIndex } from '@/lib/engine/cellAddressUtils'
import type { CellRange } from '@/lib/types/spreadsheet'
import { MAX_COLUMNS } from '@/lib/types/spreadsheet'

interface SortLevel {
  column: string
  ascending: boolean
}

interface SortDialogProps {
  onClose: () => void
}

/** Maximale Anzahl Sortier-Ebenen */
const MAX_LEVELS = 3

/** Generiert Spalten-Optionen A bis ZZ (bis MAX_COLUMNS) */
function generateColumnOptions(): string[] {
  const options: string[] = []
  for (let i = 0; i < Math.min(MAX_COLUMNS, 702); i++) {
    options.push(columnIndexToLetter(i))
  }
  return options
}

export function SortDialog({ onClose }: SortDialogProps) {
  const { dispatch } = useSpreadsheet()
  const sheet = useActiveSheet()
  const [levels, setLevels] = useState<SortLevel[]>([
    { column: 'A', ascending: true },
  ])

  // Escape schliesst den Dialog
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Erkennung des belegten Bereichs im aktiven Sheet
  const getDataRange = useCallback((): CellRange => {
    let minRow = Infinity
    let maxRow = -Infinity
    let minCol = Infinity
    let maxCol = -Infinity

    for (const key of Object.keys(sheet.cells)) {
      const match = key.match(/^([A-Z]+)(\d+)$/)
      if (!match) continue
      const col = letterToColumnIndex(match[1])
      const row = parseInt(match[2], 10) - 1
      if (col < minCol) minCol = col
      if (col > maxCol) maxCol = col
      if (row < minRow) minRow = row
      if (row > maxRow) maxRow = row
    }

    // Fallback: wenn keine Daten vorhanden
    if (minRow === Infinity) {
      return { start: { col: 0, row: 0 }, end: { col: 0, row: 0 } }
    }

    return {
      start: { col: minCol, row: minRow },
      end: { col: maxCol, row: maxRow },
    }
  }, [sheet.cells])

  const handleAddLevel = useCallback(() => {
    if (levels.length >= MAX_LEVELS) return
    setLevels((prev) => [...prev, { column: 'A', ascending: true }])
  }, [levels.length])

  const handleRemoveLevel = useCallback((index: number) => {
    if (levels.length <= 1) return
    setLevels((prev) => prev.filter((_, i) => i !== index))
  }, [levels.length])

  const handleChangeColumn = useCallback((index: number, column: string) => {
    setLevels((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], column }
      return next
    })
  }, [])

  const handleChangeDirection = useCallback((index: number, ascending: boolean) => {
    setLevels((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ascending }
      return next
    })
  }, [])

  const handleSort = useCallback(() => {
    const range = getDataRange()

    // Stabile Sortierung: letzte Ebene zuerst, dann vorherige
    // So bleibt bei Gleichheit die Reihenfolge der vorherigen Sortierung erhalten
    const reversedLevels = [...levels].reverse()

    for (const level of reversedLevels) {
      const colIndex = letterToColumnIndex(level.column)
      dispatch({
        type: 'SORT_RANGE',
        range,
        column: colIndex,
        ascending: level.ascending,
      })
    }

    onClose()
  }, [levels, getDataRange, dispatch, onClose])

  const columnOptions = generateColumnOptions()

  return (
    <>
      {/* Hintergrund-Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 99,
        }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          background: 'white',
          borderRadius: 8,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 12px rgba(0,0,0,0.1)',
          width: 420,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid #dadce0',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 15, color: '#202124' }}>
            Sortieren
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#5f6368',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 4,
              padding: 2,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Sortier-Ebenen */}
        <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
          {levels.map((level, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: index < levels.length - 1 ? 12 : 0,
              }}
            >
              {/* Label */}
              <span
                style={{
                  fontSize: 13,
                  color: '#5f6368',
                  minWidth: 80,
                  flexShrink: 0,
                }}
              >
                {index === 0 ? 'Sortieren nach' : 'Dann nach'}
              </span>

              {/* Spalten-Auswahl */}
              <select
                value={level.column}
                onChange={(e) => handleChangeColumn(index, e.target.value)}
                style={{
                  height: 32,
                  border: '1px solid #dadce0',
                  borderRadius: 4,
                  padding: '0 8px',
                  fontSize: 13,
                  color: '#202124',
                  background: 'white',
                  flex: 1,
                  minWidth: 70,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {columnOptions.map((col) => (
                  <option key={col} value={col}>
                    Spalte {col}
                  </option>
                ))}
              </select>

              {/* Sortierrichtung */}
              <select
                value={level.ascending ? 'asc' : 'desc'}
                onChange={(e) =>
                  handleChangeDirection(index, e.target.value === 'asc')
                }
                style={{
                  height: 32,
                  border: '1px solid #dadce0',
                  borderRadius: 4,
                  padding: '0 8px',
                  fontSize: 13,
                  color: '#202124',
                  background: 'white',
                  minWidth: 100,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="asc">Aufsteigend</option>
                <option value="desc">Absteigend</option>
              </select>

              {/* Ebene entfernen */}
              <button
                onClick={() => handleRemoveLevel(index)}
                disabled={levels.length <= 1}
                title="Ebene entfernen"
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #dadce0',
                  borderRadius: 4,
                  background: 'white',
                  color: levels.length <= 1 ? '#c0c0c0' : '#5f6368',
                  cursor: levels.length <= 1 ? 'default' : 'pointer',
                  flexShrink: 0,
                  fontSize: 16,
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Ebene hinzufügen */}
          {levels.length < MAX_LEVELS && (
            <button
              onClick={handleAddLevel}
              style={{
                marginTop: 12,
                height: 30,
                padding: '0 12px',
                fontSize: 12,
                borderRadius: 4,
                border: '1px solid #dadce0',
                background: 'white',
                color: '#1a73e8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              + Ebene hinzufügen
            </button>
          )}
        </div>

        {/* Footer-Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            padding: '12px 16px',
            borderTop: '1px solid #dadce0',
          }}
        >
          <button
            onClick={onClose}
            style={{
              height: 32,
              padding: '0 16px',
              fontSize: 13,
              borderRadius: 4,
              border: '1px solid #dadce0',
              background: 'white',
              color: '#202124',
              cursor: 'pointer',
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSort}
            style={{
              height: 32,
              padding: '0 16px',
              fontSize: 13,
              borderRadius: 4,
              border: 'none',
              background: '#1a73e8',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Sortieren
          </button>
        </div>
      </div>
    </>
  )
}
