'use client'

import { useState, useRef, useEffect } from 'react'

interface TableGridPickerProps {
  onInsert: (rows: number, cols: number) => void
  onClose: () => void
}

const MAX_ROWS = 8
const MAX_COLS = 8

export function TableGridPicker({ onInsert, onClose }: TableGridPickerProps) {
  const [hoveredRow, setHoveredRow] = useState(0)
  const [hoveredCol, setHoveredCol] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50"
    >
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}>
        {Array.from({ length: MAX_ROWS }).map((_, row) =>
          Array.from({ length: MAX_COLS }).map((_, col) => (
            <div
              key={`${row}-${col}`}
              onMouseEnter={() => { setHoveredRow(row + 1); setHoveredCol(col + 1) }}
              onClick={() => { onInsert(row + 1, col + 1); onClose() }}
              className={`
                w-5 h-5 border cursor-pointer transition-colors duration-75
                ${row < hoveredRow && col < hoveredCol
                  ? 'bg-blue-200 border-blue-400'
                  : 'bg-white border-gray-300 hover:border-gray-400'
                }
              `}
            />
          ))
        )}
      </div>
      <div className="text-center text-xs text-gray-600 mt-2">
        {hoveredRow > 0 && hoveredCol > 0
          ? `${hoveredCol} × ${hoveredRow} Tabelle`
          : 'Tabelle einfügen'
        }
      </div>
    </div>
  )
}
