'use client'

// =============================================
// ImpulsTabulator — Spalten-Header (A, B, C...)
// =============================================

import { memo, useCallback } from 'react'
import { columnIndexToLetter } from '@/lib/engine/cellAddressUtils'
import type { VirtualItem } from '@/lib/hooks/useVirtualGrid'
import { HEADER_HEIGHT } from '@/lib/types/spreadsheet'

interface ColumnHeaderProps {
  visibleCols: VirtualItem[]
  frozenColItems: VirtualItem[]
  scrollLeft: number
  frozenColsWidth: number
  selectedCols: Set<number>
  onColumnClick: (col: number, shiftKey: boolean) => void
  onResizeStart: (col: number, startX: number) => void
}

export const ColumnHeader = memo(function ColumnHeader({
  visibleCols,
  frozenColItems,
  scrollLeft,
  frozenColsWidth,
  selectedCols,
  onColumnClick,
  onResizeStart,
}: ColumnHeaderProps) {
  const renderHeader = useCallback((item: VirtualItem, left: number) => {
    const isSelected = selectedCols.has(item.index)
    return (
      <div
        key={item.index}
        className={`header-cell ${isSelected ? 'selected' : ''}`}
        style={{
          position: 'absolute',
          left,
          top: 0,
          width: item.size,
          height: HEADER_HEIGHT,
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          onColumnClick(item.index, e.shiftKey)
        }}
      >
        {columnIndexToLetter(item.index)}
        <div
          className="resize-handle-col"
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onResizeStart(item.index, e.clientX)
          }}
        />
      </div>
    )
  }, [selectedCols, onColumnClick, onResizeStart])

  return (
    <div style={{ position: 'relative', height: HEADER_HEIGHT, overflow: 'hidden' }}>
      {/* Fixierte Spalten-Header */}
      {frozenColItems.map(item => renderHeader(item, item.offset))}

      {/* Scrollbare Spalten-Header */}
      {visibleCols.map(item => renderHeader(item, item.offset - scrollLeft + frozenColsWidth))}
    </div>
  )
})
