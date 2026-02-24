'use client'

// =============================================
// ImpulsTabulator — Haupt-Grid-Komponente
// =============================================

import { useCallback, useRef, useState, useEffect, useMemo } from 'react'
import { useSpreadsheet, useActiveSheet } from '@/lib/spreadsheetContext'
import { useVirtualGrid } from '@/lib/hooks/useVirtualGrid'
import { Cell } from './Cell'
import { ColumnHeader } from './ColumnHeader'
import { RowHeader } from './RowHeader'
import { SelectionOverlay } from './SelectionOverlay'
import { CellEditor } from './CellEditor'
import { ContextMenu } from './ContextMenu'
import { cellAddressToString } from '@/lib/engine/cellAddressUtils'
import { isCellSelected, selectCell, extendSelection } from '@/lib/state/selectionManager'
import {
  HEADER_WIDTH, HEADER_HEIGHT, MAX_COLUMNS, MAX_ROWS,
} from '@/lib/types/spreadsheet'

interface GridProps {
  onFormatCells?: () => void
}

export function Grid({ onFormatCells }: GridProps = {}) {
  const { state, dispatch } = useSpreadsheet()
  const sheet = useActiveSheet()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
  const [scrollPos, setScrollPos] = useState({ top: 0, left: 0 })
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  // Container-Größe beobachten
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width - HEADER_WIDTH,
          height: entry.contentRect.height - HEADER_HEIGHT,
        })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Spaltenbreite/Zeilenhöhe-Getter
  const getColumnWidth = useCallback((col: number) => {
    return sheet.columnWidths[col] || state.workbook.defaultColumnWidth
  }, [sheet.columnWidths, state.workbook.defaultColumnWidth])

  const getRowHeight = useCallback((row: number) => {
    return sheet.rowHeights[row] || state.workbook.defaultRowHeight
  }, [sheet.rowHeights, state.workbook.defaultRowHeight])

  // Virtual Grid berechnen
  const virtualGrid = useVirtualGrid({
    containerWidth: containerSize.width,
    containerHeight: containerSize.height,
    totalColumns: MAX_COLUMNS,
    totalRows: MAX_ROWS,
    getColumnWidth,
    getRowHeight,
    frozenRows: sheet.frozenRows,
    frozenCols: sheet.frozenCols,
    scrollTop: scrollPos.top,
    scrollLeft: scrollPos.left,
  })

  // Kumulative Offset-Berechnung (für SelectionOverlay)
  const getColumnOffset = useCallback((col: number) => {
    let offset = 0
    for (let i = 0; i < col; i++) offset += getColumnWidth(i)
    return offset
  }, [getColumnWidth])

  const getRowOffset = useCallback((row: number) => {
    let offset = 0
    for (let i = 0; i < row; i++) offset += getRowHeight(i)
    return offset
  }, [getRowHeight])

  // Scroll-Handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    setScrollPos({ top: target.scrollTop, left: target.scrollLeft })
  }, [])

  // Zell-Klick → Auswahl
  const handleCellMouseDown = useCallback((col: number, row: number, e: React.MouseEvent) => {
    e.preventDefault()

    if (state.editingCell) {
      dispatch({ type: 'COMMIT_EDIT' })
    }

    if (e.shiftKey) {
      dispatch({
        type: 'SET_SELECTION',
        selection: extendSelection(state.selection, { col, row }),
      })
    } else {
      dispatch({
        type: 'SET_SELECTION',
        selection: { ...selectCell({ col, row }), isSelecting: true },
      })
    }
  }, [dispatch, state.editingCell, state.selection])

  // Maus-Bewegung für Drag-Auswahl
  useEffect(() => {
    if (!state.selection.isSelecting) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left - HEADER_WIDTH + scrollPos.left - virtualGrid.frozenColsWidth
      const y = e.clientY - rect.top - HEADER_HEIGHT + scrollPos.top - virtualGrid.frozenRowsHeight

      // Finde Spalte/Zeile unter dem Cursor
      let col = 0
      let accX = 0
      while (col < MAX_COLUMNS - 1 && accX + getColumnWidth(col) < x) {
        accX += getColumnWidth(col)
        col++
      }

      let row = 0
      let accY = 0
      while (row < MAX_ROWS - 1 && accY + getRowHeight(row) < y) {
        accY += getRowHeight(row)
        row++
      }

      dispatch({
        type: 'SET_SELECTION',
        selection: extendSelection(state.selection, { col, row }),
      })
    }

    const handleMouseUp = () => {
      dispatch({
        type: 'SET_SELECTION',
        selection: { ...state.selection, isSelecting: false },
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [state.selection, scrollPos, virtualGrid, getColumnWidth, getRowHeight, dispatch])

  // Doppelklick → Bearbeitung starten
  const handleCellDoubleClick = useCallback((col: number, row: number) => {
    dispatch({ type: 'START_EDITING', address: { col, row } })
  }, [dispatch])

  // Helper: Alle ausgewählten Adressen als Strings
  const getSelectedAddresses = useCallback((): string[] => {
    const addresses: string[] = []
    for (const range of state.selection.ranges) {
      const minCol = Math.min(range.start.col, range.end.col)
      const maxCol = Math.max(range.start.col, range.end.col)
      const minRow = Math.min(range.start.row, range.end.row)
      const maxRow = Math.max(range.start.row, range.end.row)
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          addresses.push(cellAddressToString({ col: c, row: r }))
        }
      }
    }
    return addresses
  }, [state.selection.ranges])

  // Tastatur-Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Wenn wir gerade bearbeiten, nicht hier handeln
      if (state.editingCell) return

      const { activeCell } = state.selection
      const { col, row } = activeCell

      // Navigation
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const newCol = e.ctrlKey || e.metaKey ? Math.min(col + 10, MAX_COLUMNS - 1) : Math.min(col + 1, MAX_COLUMNS - 1)
        const newAddr = { col: newCol, row }
        dispatch({ type: 'SET_SELECTION', selection: e.shiftKey ? extendSelection(state.selection, newAddr) : selectCell(newAddr) })
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const newCol = e.ctrlKey || e.metaKey ? Math.max(col - 10, 0) : Math.max(col - 1, 0)
        const newAddr = { col: newCol, row }
        dispatch({ type: 'SET_SELECTION', selection: e.shiftKey ? extendSelection(state.selection, newAddr) : selectCell(newAddr) })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const newRow = e.ctrlKey || e.metaKey ? Math.min(row + 10, MAX_ROWS - 1) : Math.min(row + 1, MAX_ROWS - 1)
        const newAddr = { col, row: newRow }
        dispatch({ type: 'SET_SELECTION', selection: e.shiftKey ? extendSelection(state.selection, newAddr) : selectCell(newAddr) })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const newRow = e.ctrlKey || e.metaKey ? Math.max(row - 10, 0) : Math.max(row - 1, 0)
        const newAddr = { col, row: newRow }
        dispatch({ type: 'SET_SELECTION', selection: e.shiftKey ? extendSelection(state.selection, newAddr) : selectCell(newAddr) })
      } else if (e.key === 'Tab') {
        e.preventDefault()
        const newCol = e.shiftKey ? Math.max(col - 1, 0) : Math.min(col + 1, MAX_COLUMNS - 1)
        dispatch({ type: 'SET_SELECTION', selection: selectCell({ col: newCol, row }) })
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (e.shiftKey) {
          dispatch({ type: 'SET_SELECTION', selection: selectCell({ col, row: Math.max(row - 1, 0) }) })
        } else {
          dispatch({ type: 'START_EDITING' })
        }
      } else if (e.key === 'Home') {
        e.preventDefault()
        if (e.ctrlKey || e.metaKey) {
          dispatch({ type: 'SET_SELECTION', selection: selectCell({ col: 0, row: 0 }) })
        } else {
          dispatch({ type: 'SET_SELECTION', selection: selectCell({ col: 0, row }) })
        }
      } else if (e.key === 'End') {
        e.preventDefault()
        dispatch({ type: 'SET_SELECTION', selection: selectCell({ col: 0, row: 0 }) })
      } else if (e.key === 'F2') {
        e.preventDefault()
        dispatch({ type: 'START_EDITING' })
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        // Lösche alle ausgewählten Zellen
        const addresses: string[] = []
        for (const range of state.selection.ranges) {
          const minCol = Math.min(range.start.col, range.end.col)
          const maxCol = Math.max(range.start.col, range.end.col)
          const minRow = Math.min(range.start.row, range.end.row)
          const maxRow = Math.max(range.start.row, range.end.row)
          for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
              addresses.push(cellAddressToString({ col: c, row: r }))
            }
          }
        }
        dispatch({ type: 'DELETE_CELL_VALUES', addresses })
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        dispatch({ type: e.shiftKey ? 'REDO' : 'UNDO' })
      } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        dispatch({ type: 'REDO' })
      } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        // Kopieren — vereinfachte Implementierung
        const range = state.selection.ranges[state.selection.ranges.length - 1]
        if (range) {
          dispatch({
            type: 'SET_CLIPBOARD',
            clipboard: {
              cells: (() => {
                const cells: Record<string, import('@/lib/types/spreadsheet').CellData> = {}
                const minCol = Math.min(range.start.col, range.end.col)
                const maxCol = Math.max(range.start.col, range.end.col)
                const minRow = Math.min(range.start.row, range.end.row)
                const maxRow = Math.max(range.start.row, range.end.row)
                for (let r = minRow; r <= maxRow; r++) {
                  for (let c = minCol; c <= maxCol; c++) {
                    const key = cellAddressToString({ col: c, row: r })
                    const relKey = `${c - minCol},${r - minRow}`
                    if (sheet.cells[key]) cells[relKey] = { ...sheet.cells[key] }
                  }
                }
                return cells
              })(),
              range: {
                start: { col: Math.min(range.start.col, range.end.col), row: Math.min(range.start.row, range.end.row) },
                end: { col: Math.max(range.start.col, range.end.col), row: Math.max(range.start.row, range.end.row) },
              },
              isCut: false,
            },
          })
        }
      } else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        if (state.clipboard) {
          const target = state.selection.activeCell
          const width = state.clipboard.range.end.col - state.clipboard.range.start.col + 1
          const height = state.clipboard.range.end.row - state.clipboard.range.start.row + 1
          const pasteCells: Record<string, import('@/lib/types/spreadsheet').CellData> = {}
          for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
              const relKey = `${c},${r}`
              if (state.clipboard.cells[relKey]) {
                const addr = cellAddressToString({ col: target.col + c, row: target.row + r })
                pasteCells[addr] = { ...state.clipboard.cells[relKey] }
              }
            }
          }
          dispatch({ type: 'PASTE_CELLS', cells: pasteCells, targetStart: target })
        }
      } else if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        const addresses = getSelectedAddresses()
        const firstAddr = addresses[0]
        const currentBold = firstAddr ? sheet.cells[firstAddr]?.style?.bold : false
        dispatch({ type: 'SET_CELL_STYLE', addresses, style: { bold: !currentBold } })
      } else if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        const addresses = getSelectedAddresses()
        const firstAddr = addresses[0]
        const currentItalic = firstAddr ? sheet.cells[firstAddr]?.style?.italic : false
        dispatch({ type: 'SET_CELL_STYLE', addresses, style: { italic: !currentItalic } })
      } else if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        const addresses = getSelectedAddresses()
        const firstAddr = addresses[0]
        const currentUnderline = firstAddr ? sheet.cells[firstAddr]?.style?.underline : false
        dispatch({ type: 'SET_CELL_STYLE', addresses, style: { underline: !currentUnderline } })
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Tippen startet Bearbeitung
        dispatch({ type: 'START_EDITING', initialValue: e.key })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.editingCell, state.selection, state.clipboard, sheet.cells, dispatch, getSelectedAddresses])

  // Spalten-Header-Klick
  const handleColumnClick = useCallback((col: number, shiftKey: boolean) => {
    if (state.editingCell) dispatch({ type: 'COMMIT_EDIT' })
    if (shiftKey) {
      dispatch({
        type: 'SET_SELECTION',
        selection: extendSelection(state.selection, { col, row: MAX_ROWS - 1 }),
      })
    } else {
      dispatch({
        type: 'SET_SELECTION',
        selection: {
          activeCell: { col, row: 0 },
          ranges: [{ start: { col, row: 0 }, end: { col, row: MAX_ROWS - 1 } }],
          isSelecting: false,
        },
      })
    }
  }, [dispatch, state.editingCell, state.selection])

  // Zeilen-Header-Klick
  const handleRowClick = useCallback((row: number, shiftKey: boolean) => {
    if (state.editingCell) dispatch({ type: 'COMMIT_EDIT' })
    if (shiftKey) {
      dispatch({
        type: 'SET_SELECTION',
        selection: extendSelection(state.selection, { col: MAX_COLUMNS - 1, row }),
      })
    } else {
      dispatch({
        type: 'SET_SELECTION',
        selection: {
          activeCell: { col: 0, row },
          ranges: [{ start: { col: 0, row }, end: { col: MAX_COLUMNS - 1, row } }],
          isSelecting: false,
        },
      })
    }
  }, [dispatch, state.editingCell, state.selection])

  // Resize Handler
  const handleColResizeStart = useCallback((col: number, startX: number) => {
    const startWidth = getColumnWidth(col)

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(20, startWidth + (e.clientX - startX))
      dispatch({ type: 'SET_COLUMN_WIDTH', col, width: newWidth })
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [dispatch, getColumnWidth])

  const handleRowResizeStart = useCallback((row: number, startY: number) => {
    const startHeight = getRowHeight(row)

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = Math.max(16, startHeight + (e.clientY - startY))
      dispatch({ type: 'SET_ROW_HEIGHT', row, height: newHeight })
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [dispatch, getRowHeight])

  // Editor-Commit-Handler
  const handleEditorCommit = useCallback(() => {
    dispatch({ type: 'COMMIT_EDIT' })
    // Gehe eine Zeile nach unten
    const { col, row } = state.editingCell || state.selection.activeCell
    dispatch({ type: 'SET_SELECTION', selection: selectCell({ col, row: Math.min(row + 1, MAX_ROWS - 1) }) })
  }, [dispatch, state.editingCell, state.selection.activeCell])

  const handleEditorTab = useCallback((shiftKey: boolean) => {
    dispatch({ type: 'COMMIT_EDIT' })
    const { col, row } = state.editingCell || state.selection.activeCell
    const newCol = shiftKey ? Math.max(col - 1, 0) : Math.min(col + 1, MAX_COLUMNS - 1)
    dispatch({ type: 'SET_SELECTION', selection: selectCell({ col: newCol, row }) })
  }, [dispatch, state.editingCell, state.selection.activeCell])

  // Ausgewählte Spalten/Zeilen für Header-Highlighting
  const selectedCols = useMemo(() => {
    const cols = new Set<number>()
    for (const range of state.selection.ranges) {
      const min = Math.min(range.start.col, range.end.col)
      const max = Math.max(range.start.col, range.end.col)
      for (let c = min; c <= max; c++) cols.add(c)
    }
    return cols
  }, [state.selection.ranges])

  const selectedRows = useMemo(() => {
    const rows = new Set<number>()
    for (const range of state.selection.ranges) {
      const min = Math.min(range.start.row, range.end.row)
      const max = Math.max(range.start.row, range.end.row)
      for (let r = min; r <= max; r++) rows.add(r)
    }
    return rows
  }, [state.selection.ranges])

  // Kontextmenü
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const contextMenuHandlers = useMemo(() => ({
    onCut: () => {
      const range = state.selection.ranges[state.selection.ranges.length - 1]
      if (!range) return
      const cells: Record<string, import('@/lib/types/spreadsheet').CellData> = {}
      const minCol = Math.min(range.start.col, range.end.col)
      const maxCol = Math.max(range.start.col, range.end.col)
      const minRow = Math.min(range.start.row, range.end.row)
      const maxRow = Math.max(range.start.row, range.end.row)
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const key = cellAddressToString({ col: c, row: r })
          const relKey = `${c - minCol},${r - minRow}`
          if (sheet.cells[key]) cells[relKey] = { ...sheet.cells[key] }
        }
      }
      dispatch({
        type: 'SET_CLIPBOARD',
        clipboard: {
          cells,
          range: { start: { col: minCol, row: minRow }, end: { col: maxCol, row: maxRow } },
          isCut: true,
        },
      })
      dispatch({ type: 'DELETE_CELL_VALUES', addresses: getSelectedAddresses() })
    },
    onCopy: () => {
      const range = state.selection.ranges[state.selection.ranges.length - 1]
      if (!range) return
      const cells: Record<string, import('@/lib/types/spreadsheet').CellData> = {}
      const minCol = Math.min(range.start.col, range.end.col)
      const maxCol = Math.max(range.start.col, range.end.col)
      const minRow = Math.min(range.start.row, range.end.row)
      const maxRow = Math.max(range.start.row, range.end.row)
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const key = cellAddressToString({ col: c, row: r })
          const relKey = `${c - minCol},${r - minRow}`
          if (sheet.cells[key]) cells[relKey] = { ...sheet.cells[key] }
        }
      }
      dispatch({
        type: 'SET_CLIPBOARD',
        clipboard: {
          cells,
          range: { start: { col: minCol, row: minRow }, end: { col: maxCol, row: maxRow } },
          isCut: false,
        },
      })
    },
    onPaste: () => {
      if (!state.clipboard) return
      const target = state.selection.activeCell
      const width = state.clipboard.range.end.col - state.clipboard.range.start.col + 1
      const height = state.clipboard.range.end.row - state.clipboard.range.start.row + 1
      const pasteCells: Record<string, import('@/lib/types/spreadsheet').CellData> = {}
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          const relKey = `${c},${r}`
          if (state.clipboard.cells[relKey]) {
            const addr = cellAddressToString({ col: target.col + c, row: target.row + r })
            pasteCells[addr] = { ...state.clipboard.cells[relKey] }
          }
        }
      }
      dispatch({ type: 'PASTE_CELLS', cells: pasteCells, targetStart: target })
    },
    onInsertRow: () => dispatch({ type: 'INSERT_ROWS', at: state.selection.activeCell.row, count: 1 }),
    onInsertColumn: () => dispatch({ type: 'INSERT_COLUMNS', at: state.selection.activeCell.col, count: 1 }),
    onDeleteRow: () => dispatch({ type: 'DELETE_ROWS', at: state.selection.activeCell.row, count: 1 }),
    onDeleteColumn: () => dispatch({ type: 'DELETE_COLUMNS', at: state.selection.activeCell.col, count: 1 }),
    onSortAsc: () => {
      const range = state.selection.ranges[0]
      if (range) dispatch({ type: 'SORT_RANGE', range, column: state.selection.activeCell.col, ascending: true })
    },
    onSortDesc: () => {
      const range = state.selection.ranges[0]
      if (range) dispatch({ type: 'SORT_RANGE', range, column: state.selection.activeCell.col, ascending: false })
    },
    onClearContents: () => dispatch({ type: 'DELETE_CELL_VALUES', addresses: getSelectedAddresses() }),
  }), [state.selection, state.clipboard, sheet.cells, dispatch, getSelectedAddresses])

  // Merge-Lookup: Für jede Zelle prüfen ob sie Teil eines Merges ist
  const mergeMap = useMemo(() => {
    const map = new Map<string, { isTopLeft: boolean; spanCols: number; spanRows: number; mergeKey: string }>()
    const mergedCells = sheet.mergedCells || []
    for (const merge of mergedCells) {
      const tlKey = cellAddressToString(merge.start)
      const spanCols = merge.end.col - merge.start.col + 1
      const spanRows = merge.end.row - merge.start.row + 1
      map.set(tlKey, { isTopLeft: true, spanCols, spanRows, mergeKey: tlKey })
      for (let r = merge.start.row; r <= merge.end.row; r++) {
        for (let c = merge.start.col; c <= merge.end.col; c++) {
          const key = cellAddressToString({ col: c, row: r })
          if (key !== tlKey) {
            map.set(key, { isTopLeft: false, spanCols: 0, spanRows: 0, mergeKey: tlKey })
          }
        }
      }
    }
    return map
  }, [sheet.mergedCells])

  // Alle sichtbaren Zellen rendern
  const allVisibleCols = [...virtualGrid.frozenColItems, ...virtualGrid.visibleCols]
  const allVisibleRows = [...virtualGrid.frozenRowItems, ...virtualGrid.visibleRows]

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        background: '#fff',
      }}
    >
      {/* Spalten-Header */}
      <div style={{ display: 'flex', flexShrink: 0 }}>
        {/* Ecke oben-links */}
        <div
          className="header-cell"
          style={{
            width: HEADER_WIDTH,
            height: HEADER_HEIGHT,
            flexShrink: 0,
            borderRight: '1px solid #bbb',
            borderBottom: '1px solid #bbb',
          }}
          onClick={() => {
            // Alles auswählen
            dispatch({
              type: 'SET_SELECTION',
              selection: {
                activeCell: { col: 0, row: 0 },
                ranges: [{ start: { col: 0, row: 0 }, end: { col: MAX_COLUMNS - 1, row: MAX_ROWS - 1 } }],
                isSelecting: false,
              },
            })
          }}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ColumnHeader
            visibleCols={virtualGrid.visibleCols}
            frozenColItems={virtualGrid.frozenColItems}
            scrollLeft={scrollPos.left}
            frozenColsWidth={virtualGrid.frozenColsWidth}
            selectedCols={selectedCols}
            onColumnClick={handleColumnClick}
            onResizeStart={handleColResizeStart}
          />
        </div>
      </div>

      {/* Hauptbereich: Zeilen-Header + Grid */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Zeilen-Header */}
        <div style={{ flexShrink: 0, overflow: 'hidden', borderRight: '1px solid #bbb' }}>
          <div style={{ position: 'relative', height: virtualGrid.totalContentHeight }}>
            <RowHeader
              visibleRows={virtualGrid.visibleRows}
              frozenRowItems={virtualGrid.frozenRowItems}
              scrollTop={scrollPos.top}
              frozenRowsHeight={virtualGrid.frozenRowsHeight}
              selectedRows={selectedRows}
              onRowClick={handleRowClick}
              onResizeStart={handleRowResizeStart}
            />
          </div>
        </div>

        {/* Scrollbarer Grid-Bereich */}
        <div
          style={{ flex: 1, overflow: 'auto', position: 'relative' }}
          onScroll={handleScroll}
          onContextMenu={handleContextMenu}
        >
          {/* Spacer für Scrollbar */}
          <div
            style={{
              width: virtualGrid.totalContentWidth,
              height: virtualGrid.totalContentHeight,
              position: 'relative',
            }}
          >
            {/* Zellen rendern */}
            {allVisibleRows.map(rowItem => (
              allVisibleCols.map(colItem => {
                const key = cellAddressToString({ col: colItem.index, row: rowItem.index })
                const mergeInfo = mergeMap.get(key)

                // Zelle ist Teil eines Merges, aber nicht die obere linke → überspringen
                if (mergeInfo && !mergeInfo.isTopLeft) return null

                const cellData = sheet.cells[key]
                const isActive = state.selection.activeCell.col === colItem.index &&
                                 state.selection.activeCell.row === rowItem.index
                const isSelected = isCellSelected(state.selection, { col: colItem.index, row: rowItem.index })

                // Merged cell: Breite/Höhe über mehrere Spalten/Zeilen berechnen
                let cellWidth = colItem.size
                let cellHeight = rowItem.size
                if (mergeInfo && mergeInfo.isTopLeft) {
                  cellWidth = 0
                  for (let c = 0; c < mergeInfo.spanCols; c++) {
                    cellWidth += getColumnWidth(colItem.index + c)
                  }
                  cellHeight = 0
                  for (let r = 0; r < mergeInfo.spanRows; r++) {
                    cellHeight += getRowHeight(rowItem.index + r)
                  }
                }

                return (
                  <div
                    key={key}
                    style={{
                      position: 'absolute',
                      left: colItem.offset,
                      top: rowItem.offset,
                      width: cellWidth,
                      height: cellHeight,
                      zIndex: mergeInfo ? 1 : 0,
                    }}
                    onMouseDown={(e) => handleCellMouseDown(colItem.index, rowItem.index, e)}
                    onDoubleClick={() => handleCellDoubleClick(colItem.index, rowItem.index)}
                  >
                    <Cell
                      data={cellData}
                      width={cellWidth}
                      height={cellHeight}
                      isActive={isActive}
                      isSelected={isSelected}
                    />
                  </div>
                )
              })
            ))}
          </div>

          {/* Auswahl-Overlay */}
          <SelectionOverlay
            selection={state.selection}
            getColumnOffset={getColumnOffset}
            getRowOffset={getRowOffset}
            getColumnWidth={getColumnWidth}
            getRowHeight={getRowHeight}
            scrollLeft={scrollPos.left}
            scrollTop={scrollPos.top}
            frozenColsWidth={virtualGrid.frozenColsWidth}
            frozenRowsHeight={virtualGrid.frozenRowsHeight}
            headerWidth={0}
            headerHeight={0}
          />

          {/* Zell-Editor */}
          {state.editingCell && (() => {
            const editLeft = getColumnOffset(state.editingCell.col)
            const editTop = getRowOffset(state.editingCell.row)
            return (
              <CellEditor
                value={state.editValue}
                onChange={(v) => dispatch({ type: 'UPDATE_EDIT_VALUE', value: v })}
                onCommit={handleEditorCommit}
                onCancel={() => dispatch({ type: 'CANCEL_EDIT' })}
                onTab={handleEditorTab}
                left={editLeft}
                top={editTop}
                width={getColumnWidth(state.editingCell.col)}
                height={getRowHeight(state.editingCell.row)}
              />
            )
          })()}
        </div>
      </div>

      {/* Kontextmenü */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          {...contextMenuHandlers}
          onFormatCells={onFormatCells}
          onAddComment={() => {
            const addr = cellAddressToString(state.selection.activeCell)
            const text = prompt('Kommentar eingeben:')
            if (text) dispatch({ type: 'SET_COMMENT', address: addr, comment: { text } })
          }}
        />
      )}
    </div>
  )
}
