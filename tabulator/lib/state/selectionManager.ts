// =============================================
// ImpulsTabulator — Auswahl-Management
// =============================================

import type { CellAddress, CellRange, SelectionState } from '@/lib/types/spreadsheet'
import { normalizeRange } from '@/lib/engine/cellAddressUtils'

/** Erstellt eine Standard-Auswahl (A1) */
export function createDefaultSelection(): SelectionState {
  return {
    activeCell: { col: 0, row: 0 },
    ranges: [{ start: { col: 0, row: 0 }, end: { col: 0, row: 0 } }],
    isSelecting: false,
  }
}

/** Erstellt Auswahl für eine einzelne Zelle */
export function selectCell(addr: CellAddress): SelectionState {
  return {
    activeCell: addr,
    ranges: [{ start: addr, end: addr }],
    isSelecting: false,
  }
}

/** Erweitert die Auswahl bis zu einer Zelle (Shift-Klick) */
export function extendSelection(current: SelectionState, to: CellAddress): SelectionState {
  return {
    ...current,
    ranges: [normalizeRange({ start: current.activeCell, end: to })],
  }
}

/** Fügt einen neuen Bereich hinzu (Ctrl-Klick) */
export function addRange(current: SelectionState, addr: CellAddress): SelectionState {
  return {
    activeCell: addr,
    ranges: [...current.ranges, { start: addr, end: addr }],
    isSelecting: false,
  }
}

/** Prüft ob eine Zelle in der aktuellen Auswahl liegt */
export function isCellSelected(selection: SelectionState, addr: CellAddress): boolean {
  return selection.ranges.some(range => {
    const norm = normalizeRange(range)
    return (
      addr.col >= norm.start.col &&
      addr.col <= norm.end.col &&
      addr.row >= norm.start.row &&
      addr.row <= norm.end.row
    )
  })
}

/** Prüft ob eine Spalte in der Auswahl liegt */
export function isColumnSelected(selection: SelectionState, col: number): boolean {
  return selection.ranges.some(range => {
    const norm = normalizeRange(range)
    return col >= norm.start.col && col <= norm.end.col
  })
}

/** Prüft ob eine Zeile in der Auswahl liegt */
export function isRowSelected(selection: SelectionState, row: number): boolean {
  return selection.ranges.some(range => {
    const norm = normalizeRange(range)
    return row >= norm.start.row && row <= norm.end.row
  })
}

/** Gibt den primären Bereich zurück (letzter) */
export function getPrimaryRange(selection: SelectionState): CellRange {
  return normalizeRange(selection.ranges[selection.ranges.length - 1])
}
