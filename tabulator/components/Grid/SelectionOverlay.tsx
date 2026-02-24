'use client'

// =============================================
// ImpulsTabulator — Auswahl-Overlay
// =============================================

import { memo } from 'react'
import type { SelectionState, CellAddress } from '@/lib/types/spreadsheet'
import { normalizeRange } from '@/lib/engine/cellAddressUtils'

interface SelectionOverlayProps {
  selection: SelectionState
  getColumnOffset: (col: number) => number
  getRowOffset: (row: number) => number
  getColumnWidth: (col: number) => number
  getRowHeight: (row: number) => number
  scrollLeft: number
  scrollTop: number
  frozenColsWidth: number
  frozenRowsHeight: number
  headerWidth: number
  headerHeight: number
}

export const SelectionOverlay = memo(function SelectionOverlay({
  selection,
  getColumnOffset,
  getRowOffset,
  getColumnWidth,
  getRowHeight,
  scrollLeft,
  scrollTop,
  frozenColsWidth,
  frozenRowsHeight,
  headerWidth,
  headerHeight,
}: SelectionOverlayProps) {
  const cellToPixel = (addr: CellAddress) => ({
    x: getColumnOffset(addr.col) - scrollLeft + frozenColsWidth + headerWidth,
    y: getRowOffset(addr.row) - scrollTop + frozenRowsHeight + headerHeight,
  })

  return (
    <>
      {/* Bereichs-Highlighting */}
      {selection.ranges.map((range, i) => {
        const norm = normalizeRange(range)
        const topLeft = cellToPixel(norm.start)
        let width = 0
        let height = 0
        for (let c = norm.start.col; c <= norm.end.col; c++) width += getColumnWidth(c)
        for (let r = norm.start.row; r <= norm.end.row; r++) height += getRowHeight(r)

        return (
          <div
            key={i}
            className="selection-overlay"
            style={{
              position: 'absolute',
              left: topLeft.x,
              top: topLeft.y,
              width,
              height,
              pointerEvents: 'none',
            }}
          />
        )
      })}

      {/* Aktive Zelle (dicker Rahmen, kein Hintergrund) */}
      {(() => {
        const pos = cellToPixel(selection.activeCell)
        const w = getColumnWidth(selection.activeCell.col)
        const h = getRowHeight(selection.activeCell.row)
        return (
          <div
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: w,
              height: h,
              border: '2px solid #0078d4',
              pointerEvents: 'none',
              zIndex: 6,
            }}
          >
            {/* Fill Handle */}
            <div
              className="fill-handle"
              style={{
                position: 'absolute',
                right: -4,
                bottom: -4,
                pointerEvents: 'auto',
              }}
            />
          </div>
        )
      })()}
    </>
  )
})
