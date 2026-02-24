'use client'

// =============================================
// ImpulsTabulator — Zeilen-Header (1, 2, 3...)
// =============================================

import { memo, useCallback } from 'react'
import type { VirtualItem } from '@/lib/hooks/useVirtualGrid'
import { HEADER_WIDTH } from '@/lib/types/spreadsheet'

interface RowHeaderProps {
  visibleRows: VirtualItem[]
  frozenRowItems: VirtualItem[]
  scrollTop: number
  frozenRowsHeight: number
  selectedRows: Set<number>
  onRowClick: (row: number, shiftKey: boolean) => void
  onResizeStart: (row: number, startY: number) => void
}

export const RowHeader = memo(function RowHeader({
  visibleRows,
  frozenRowItems,
  scrollTop,
  frozenRowsHeight,
  selectedRows,
  onRowClick,
  onResizeStart,
}: RowHeaderProps) {
  const renderHeader = useCallback((item: VirtualItem, top: number) => {
    const isSelected = selectedRows.has(item.index)
    return (
      <div
        key={item.index}
        className={`header-cell ${isSelected ? 'selected' : ''}`}
        style={{
          position: 'absolute',
          left: 0,
          top,
          width: HEADER_WIDTH,
          height: item.size,
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          onRowClick(item.index, e.shiftKey)
        }}
      >
        {item.index + 1}
        <div
          className="resize-handle-row"
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onResizeStart(item.index, e.clientY)
          }}
        />
      </div>
    )
  }, [selectedRows, onRowClick, onResizeStart])

  return (
    <div style={{ position: 'relative', width: HEADER_WIDTH, overflow: 'hidden' }}>
      {/* Fixierte Zeilen-Header */}
      {frozenRowItems.map(item => renderHeader(item, item.offset))}

      {/* Scrollbare Zeilen-Header */}
      {visibleRows.map(item => renderHeader(item, item.offset - scrollTop + frozenRowsHeight))}
    </div>
  )
})
