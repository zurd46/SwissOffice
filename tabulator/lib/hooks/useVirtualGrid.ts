'use client'

// =============================================
// ImpulsTabulator — Virtual Scrolling Hook
// =============================================

import { useMemo } from 'react'

export interface VirtualGridConfig {
  containerWidth: number
  containerHeight: number
  totalColumns: number
  totalRows: number
  getColumnWidth: (col: number) => number
  getRowHeight: (row: number) => number
  frozenRows: number
  frozenCols: number
  scrollTop: number
  scrollLeft: number
  overscan?: number
}

export interface VirtualItem {
  index: number
  offset: number
  size: number
}

export interface VirtualGridResult {
  visibleRows: VirtualItem[]
  visibleCols: VirtualItem[]
  frozenRowItems: VirtualItem[]
  frozenColItems: VirtualItem[]
  totalContentWidth: number
  totalContentHeight: number
  frozenRowsHeight: number
  frozenColsWidth: number
}

/** Berechnet kumulative Positionen */
function computePositions(count: number, getSize: (i: number) => number): { offsets: number[]; total: number } {
  const offsets = new Array(count)
  let total = 0
  for (let i = 0; i < count; i++) {
    offsets[i] = total
    total += getSize(i)
  }
  return { offsets, total }
}

/** Findet den ersten sichtbaren Index per Binary Search */
function findStartIndex(offsets: number[], scrollPos: number): number {
  let lo = 0
  let hi = offsets.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    if (offsets[mid] < scrollPos) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return Math.max(0, lo - 1)
}

export function useVirtualGrid(config: VirtualGridConfig): VirtualGridResult {
  const {
    containerWidth, containerHeight,
    totalColumns, totalRows,
    getColumnWidth, getRowHeight,
    frozenRows, frozenCols,
    scrollTop, scrollLeft,
    overscan = 5,
  } = config

  return useMemo(() => {
    // Kumulative Positionen berechnen
    const colPos = computePositions(totalColumns, getColumnWidth)
    const rowPos = computePositions(totalRows, getRowHeight)

    // Fixierte Bereiche
    let frozenRowsHeight = 0
    const frozenRowItems: VirtualItem[] = []
    for (let i = 0; i < frozenRows && i < totalRows; i++) {
      frozenRowItems.push({ index: i, offset: frozenRowsHeight, size: getRowHeight(i) })
      frozenRowsHeight += getRowHeight(i)
    }

    let frozenColsWidth = 0
    const frozenColItems: VirtualItem[] = []
    for (let i = 0; i < frozenCols && i < totalColumns; i++) {
      frozenColItems.push({ index: i, offset: frozenColsWidth, size: getColumnWidth(i) })
      frozenColsWidth += getColumnWidth(i)
    }

    // Sichtbare Zeilen (nicht-fixiert)
    const visibleRows: VirtualItem[] = []
    const adjustedScrollTop = scrollTop
    const viewportHeight = containerHeight - frozenRowsHeight

    if (viewportHeight > 0 && totalRows > frozenRows) {
      const startRow = findStartIndex(
        rowPos.offsets.slice(frozenRows),
        adjustedScrollTop
      ) + frozenRows

      const overscanStart = Math.max(frozenRows, startRow - overscan)

      for (let i = overscanStart; i < totalRows; i++) {
        const offset = rowPos.offsets[i] - adjustedScrollTop + frozenRowsHeight
        if (offset > containerHeight + getRowHeight(i) * overscan) break
        visibleRows.push({
          index: i,
          offset: rowPos.offsets[i],
          size: getRowHeight(i),
        })
      }
    }

    // Sichtbare Spalten (nicht-fixiert)
    const visibleCols: VirtualItem[] = []
    const adjustedScrollLeft = scrollLeft
    const viewportWidth = containerWidth - frozenColsWidth

    if (viewportWidth > 0 && totalColumns > frozenCols) {
      const startCol = findStartIndex(
        colPos.offsets.slice(frozenCols),
        adjustedScrollLeft
      ) + frozenCols

      const overscanStart = Math.max(frozenCols, startCol - overscan)

      for (let i = overscanStart; i < totalColumns; i++) {
        const offset = colPos.offsets[i] - adjustedScrollLeft + frozenColsWidth
        if (offset > containerWidth + getColumnWidth(i) * overscan) break
        visibleCols.push({
          index: i,
          offset: colPos.offsets[i],
          size: getColumnWidth(i),
        })
      }
    }

    return {
      visibleRows,
      visibleCols,
      frozenRowItems,
      frozenColItems,
      totalContentWidth: colPos.total,
      totalContentHeight: rowPos.total,
      frozenRowsHeight,
      frozenColsWidth,
    }
  }, [
    containerWidth, containerHeight,
    totalColumns, totalRows,
    getColumnWidth, getRowHeight,
    frozenRows, frozenCols,
    scrollTop, scrollLeft,
    overscan,
  ])
}
