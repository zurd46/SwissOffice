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
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white border border-[#d2d0ce] rounded shadow-[0_4px_16px_rgba(0,0,0,0.12)] p-3 z-50"
    >
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}
        onMouseLeave={() => { setHoveredRow(0); setHoveredCol(0) }}
      >
        {Array.from({ length: MAX_ROWS }).map((_, row) =>
          Array.from({ length: MAX_COLS }).map((_, col) => (
            <div
              key={`${row}-${col}`}
              onMouseEnter={() => { setHoveredRow(row + 1); setHoveredCol(col + 1) }}
              onClick={() => { onInsert(row + 1, col + 1); onClose() }}
              className={`
                w-[18px] h-[18px] border rounded-[2px] cursor-pointer transition-all duration-75
                ${row < hoveredRow && col < hoveredCol
                  ? 'bg-[#c7e0f4] border-[#0078d4]'
                  : 'bg-[#fafafa] border-[#d2d0ce] hover:border-[#a19f9d]'
                }
              `}
            />
          ))
        )}
      </div>
      <div className="text-center text-[11px] text-[#605e5c] mt-2 font-medium">
        {hoveredRow > 0 && hoveredCol > 0
          ? `${hoveredCol} x ${hoveredRow} Tabelle`
          : 'Tabelle einfügen'
        }
      </div>
    </div>
  )
}
