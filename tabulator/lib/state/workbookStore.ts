// =============================================
// ImpulsTabulator — Workbook State Store
// =============================================

import type {
  WorkbookData, SheetData, CellData, CellStyle,
  CellRange, SelectionState, CellAddress,
} from '@/lib/types/spreadsheet'
import { cellAddressToString, columnIndexToLetter, letterToColumnIndex, normalizeRange, iterateRange } from '@/lib/engine/cellAddressUtils'
import { createEmptySheet, createDefaultWorkbook } from '@/lib/defaultContent'
import { createDefaultSelection } from './selectionManager'
import type { HistoryState, CellPatch } from './historyManager'
import { createHistory, pushHistory, undo as undoHistory, redo as redoHistory } from './historyManager'
import { recalculate, recalcAll, clearDependencyGraph } from '@/lib/engine/recalcEngine'

// ---- State ----

export interface WorkbookState {
  workbook: WorkbookData
  selection: SelectionState
  editingCell: CellAddress | null
  editValue: string
  isModified: boolean
  documentName: string
  history: HistoryState
  clipboard: { cells: Record<string, CellData>; range: CellRange; isCut: boolean } | null
}

export function createInitialState(): WorkbookState {
  return {
    workbook: createDefaultWorkbook(),
    selection: createDefaultSelection(),
    editingCell: null,
    editValue: '',
    isModified: false,
    documentName: 'Unbenannt',
    history: createHistory(),
    clipboard: null,
  }
}

// ---- Actions ----

export type WorkbookAction =
  | { type: 'SET_CELL_VALUE'; address: string; rawValue: string }
  | { type: 'SET_CELL_DATA'; address: string; data: CellData }
  | { type: 'DELETE_CELL_VALUES'; addresses: string[] }
  | { type: 'SET_CELL_STYLE'; addresses: string[]; style: Partial<CellStyle> }
  | { type: 'SET_COLUMN_WIDTH'; col: number; width: number }
  | { type: 'SET_ROW_HEIGHT'; row: number; height: number }
  | { type: 'INSERT_ROWS'; at: number; count: number }
  | { type: 'DELETE_ROWS'; at: number; count: number }
  | { type: 'INSERT_COLUMNS'; at: number; count: number }
  | { type: 'DELETE_COLUMNS'; at: number; count: number }
  | { type: 'ADD_SHEET'; name?: string }
  | { type: 'DELETE_SHEET'; index: number }
  | { type: 'RENAME_SHEET'; index: number; name: string }
  | { type: 'SET_ACTIVE_SHEET'; index: number }
  | { type: 'DUPLICATE_SHEET'; index: number }
  | { type: 'SET_FROZEN_PANES'; rows: number; cols: number }
  | { type: 'SORT_RANGE'; range: CellRange; column: number; ascending: boolean }
  | { type: 'SET_SELECTION'; selection: SelectionState }
  | { type: 'START_EDITING'; address?: CellAddress; initialValue?: string }
  | { type: 'UPDATE_EDIT_VALUE'; value: string }
  | { type: 'COMMIT_EDIT' }
  | { type: 'CANCEL_EDIT' }
  | { type: 'LOAD_WORKBOOK'; workbook: WorkbookData; name: string }
  | { type: 'NEW_WORKBOOK' }
  | { type: 'SET_DOCUMENT_NAME'; name: string }
  | { type: 'SET_MODIFIED'; modified: boolean }
  | { type: 'PASTE_CELLS'; cells: Record<string, CellData>; targetStart: CellAddress }
  | { type: 'SET_CLIPBOARD'; clipboard: WorkbookState['clipboard'] }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'MERGE_CELLS'; range: CellRange }
  | { type: 'UNMERGE_CELLS'; range: CellRange }
  | { type: 'SET_COMMENT'; address: string; comment: { text: string; author?: string } }
  | { type: 'DELETE_COMMENT'; address: string }
  | { type: 'TOGGLE_FILTER'; range: CellRange }
  | { type: 'SET_FILTER'; column: number; selectedValues: Set<string> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'AUTO_FILL'; cells: Record<string, import('@/lib/types/spreadsheet').CellData> }

// ---- Helpers ----

function getActiveSheet(state: WorkbookState): SheetData {
  return state.workbook.sheets[state.workbook.activeSheetIndex]
}

function updateActiveSheet(state: WorkbookState, updater: (sheet: SheetData) => SheetData): WorkbookState {
  const sheets = [...state.workbook.sheets]
  sheets[state.workbook.activeSheetIndex] = updater(sheets[state.workbook.activeSheetIndex])
  return {
    ...state,
    workbook: { ...state.workbook, sheets },
    isModified: true,
  }
}

function parseInputValue(raw: string): { value: string | number | boolean | null; formula?: string } {
  const trimmed = raw.trim()

  // Formel — Wert wird durch Recalc-Engine berechnet
  if (trimmed.startsWith('=')) {
    return { value: null, formula: trimmed }
  }

  // Boolean
  if (trimmed.toUpperCase() === 'WAHR' || trimmed.toUpperCase() === 'TRUE') {
    return { value: true }
  }
  if (trimmed.toUpperCase() === 'FALSCH' || trimmed.toUpperCase() === 'FALSE') {
    return { value: false }
  }

  // Zahl
  const num = Number(trimmed)
  if (trimmed !== '' && !isNaN(num)) {
    return { value: num }
  }

  // Text
  return { value: trimmed }
}

/** Wendet Recalc-Ergebnisse auf den State an */
function applyRecalcResults(state: WorkbookState, changedAddresses: string[]): WorkbookState {
  const sheet = getActiveSheet(state)
  const results = recalculate(sheet, changedAddresses)
  if (Object.keys(results).length === 0) return state

  return updateActiveSheet(state, (s) => {
    const newCells = { ...s.cells }
    for (const [addr, value] of Object.entries(results)) {
      if (newCells[addr]) {
        newCells[addr] = { ...newCells[addr], value }
      }
    }
    return { ...s, cells: newCells }
  })
}

/** Vollständige Neuberechnung aller Formeln */
function applyRecalcAll(state: WorkbookState): WorkbookState {
  const sheet = getActiveSheet(state)
  const results = recalcAll(sheet)
  if (Object.keys(results).length === 0) return state

  return updateActiveSheet(state, (s) => {
    const newCells = { ...s.cells }
    for (const [addr, value] of Object.entries(results)) {
      if (newCells[addr]) {
        newCells[addr] = { ...newCells[addr], value }
      }
    }
    return { ...s, cells: newCells }
  })
}

// ---- Reducer ----

export function workbookReducer(state: WorkbookState, action: WorkbookAction): WorkbookState {
  switch (action.type) {
    case 'SET_CELL_VALUE': {
      const sheet = getActiveSheet(state)
      const parsed = parseInputValue(action.rawValue)
      const oldData = sheet.cells[action.address]
      const newData: CellData = {
        value: parsed.value,
        formula: parsed.formula,
        style: oldData?.style,
      }

      const patches: CellPatch[] = [{
        sheetIndex: state.workbook.activeSheetIndex,
        address: action.address,
        oldValue: oldData,
        newValue: newData,
      }]
      const inversePatches: CellPatch[] = [{
        sheetIndex: state.workbook.activeSheetIndex,
        address: action.address,
        oldValue: newData,
        newValue: oldData,
      }]

      let newState = updateActiveSheet(state, (s) => ({
        ...s,
        cells: { ...s.cells, [action.address]: newData },
      }))

      // Formel-Neuberechnung
      newState = applyRecalcResults(newState, [action.address])

      return {
        ...newState,
        history: pushHistory(state.history, {
          description: `Zelle ${action.address} geändert`,
          patches,
          inversePatches,
        }),
      }
    }

    case 'SET_CELL_DATA': {
      return updateActiveSheet(state, (s) => ({
        ...s,
        cells: { ...s.cells, [action.address]: action.data },
      }))
    }

    case 'DELETE_CELL_VALUES': {
      const sheet = getActiveSheet(state)
      const patches: CellPatch[] = []
      const inversePatches: CellPatch[] = []
      const newCells = { ...sheet.cells }

      for (const addr of action.addresses) {
        if (newCells[addr]) {
          patches.push({
            sheetIndex: state.workbook.activeSheetIndex,
            address: addr,
            oldValue: newCells[addr],
            newValue: undefined,
          })
          inversePatches.push({
            sheetIndex: state.workbook.activeSheetIndex,
            address: addr,
            oldValue: undefined,
            newValue: newCells[addr],
          })
          // Behalte Style, lösche nur Wert/Formel
          if (newCells[addr].style) {
            newCells[addr] = { value: null, style: newCells[addr].style }
          } else {
            delete newCells[addr]
          }
        }
      }

      let newState = updateActiveSheet(state, (s) => ({ ...s, cells: newCells }))
      // Neuberechnung der abhängigen Zellen
      newState = applyRecalcResults(newState, action.addresses)
      return {
        ...newState,
        history: pushHistory(state.history, {
          description: `${action.addresses.length} Zelle(n) gelöscht`,
          patches,
          inversePatches,
        }),
      }
    }

    case 'SET_CELL_STYLE': {
      return updateActiveSheet(state, (s) => {
        const newCells = { ...s.cells }
        for (const addr of action.addresses) {
          const existing = newCells[addr] || { value: null }
          newCells[addr] = {
            ...existing,
            style: { ...existing.style, ...action.style },
          }
        }
        return { ...s, cells: newCells }
      })
    }

    case 'SET_COLUMN_WIDTH': {
      return updateActiveSheet(state, (s) => ({
        ...s,
        columnWidths: { ...s.columnWidths, [action.col]: action.width },
      }))
    }

    case 'SET_ROW_HEIGHT': {
      return updateActiveSheet(state, (s) => ({
        ...s,
        rowHeights: { ...s.rowHeights, [action.row]: action.height },
      }))
    }

    case 'INSERT_ROWS': {
      return updateActiveSheet(state, (s) => {
        const newCells: Record<string, CellData> = {}
        const newRowHeights: Record<number, number> = {}

        // Verschiebe Zellen nach unten
        for (const [key, cell] of Object.entries(s.cells)) {
          const match = key.match(/^([A-Z]+)(\d+)$/)
          if (!match) continue
          const row = parseInt(match[2], 10) - 1
          if (row >= action.at) {
            const newKey = `${match[1]}${row + action.count + 1}`
            newCells[newKey] = cell
          } else {
            newCells[key] = cell
          }
        }

        // Verschiebe Zeilenhöhen
        for (const [rowStr, height] of Object.entries(s.rowHeights)) {
          const row = parseInt(rowStr, 10)
          if (row >= action.at) {
            newRowHeights[row + action.count] = height
          } else {
            newRowHeights[row] = height
          }
        }

        return { ...s, cells: newCells, rowHeights: newRowHeights }
      })
    }

    case 'DELETE_ROWS': {
      return updateActiveSheet(state, (s) => {
        const newCells: Record<string, CellData> = {}
        const newRowHeights: Record<number, number> = {}

        for (const [key, cell] of Object.entries(s.cells)) {
          const match = key.match(/^([A-Z]+)(\d+)$/)
          if (!match) continue
          const row = parseInt(match[2], 10) - 1
          if (row >= action.at && row < action.at + action.count) {
            continue // löschen
          } else if (row >= action.at + action.count) {
            const newKey = `${match[1]}${row - action.count + 1}`
            newCells[newKey] = cell
          } else {
            newCells[key] = cell
          }
        }

        for (const [rowStr, height] of Object.entries(s.rowHeights)) {
          const row = parseInt(rowStr, 10)
          if (row >= action.at && row < action.at + action.count) {
            continue
          } else if (row >= action.at + action.count) {
            newRowHeights[row - action.count] = height
          } else {
            newRowHeights[row] = height
          }
        }

        return { ...s, cells: newCells, rowHeights: newRowHeights }
      })
    }

    case 'INSERT_COLUMNS': {
      return updateActiveSheet(state, (s) => {
        const newCells: Record<string, CellData> = {}
        const newColWidths: Record<number, number> = {}
        // columnIndexToLetter, letterToColumnIndex imported at top level

        for (const [key, cell] of Object.entries(s.cells)) {
          const match = key.match(/^([A-Z]+)(\d+)$/)
          if (!match) continue
          const col = letterToColumnIndex(match[1])
          if (col >= action.at) {
            const newKey = `${columnIndexToLetter(col + action.count)}${match[2]}`
            newCells[newKey] = cell
          } else {
            newCells[key] = cell
          }
        }

        for (const [colStr, width] of Object.entries(s.columnWidths)) {
          const col = parseInt(colStr, 10)
          if (col >= action.at) {
            newColWidths[col + action.count] = width
          } else {
            newColWidths[col] = width
          }
        }

        return { ...s, cells: newCells, columnWidths: newColWidths }
      })
    }

    case 'DELETE_COLUMNS': {
      return updateActiveSheet(state, (s) => {
        const newCells: Record<string, CellData> = {}
        const newColWidths: Record<number, number> = {}
        // columnIndexToLetter, letterToColumnIndex imported at top level

        for (const [key, cell] of Object.entries(s.cells)) {
          const match = key.match(/^([A-Z]+)(\d+)$/)
          if (!match) continue
          const col = letterToColumnIndex(match[1])
          if (col >= action.at && col < action.at + action.count) {
            continue
          } else if (col >= action.at + action.count) {
            const newKey = `${columnIndexToLetter(col - action.count)}${match[2]}`
            newCells[newKey] = cell
          } else {
            newCells[key] = cell
          }
        }

        for (const [colStr, width] of Object.entries(s.columnWidths)) {
          const col = parseInt(colStr, 10)
          if (col >= action.at && col < action.at + action.count) {
            continue
          } else if (col >= action.at + action.count) {
            newColWidths[col - action.count] = width
          } else {
            newColWidths[col] = width
          }
        }

        return { ...s, cells: newCells, columnWidths: newColWidths }
      })
    }

    case 'ADD_SHEET': {
      const name = action.name || `Tabelle ${state.workbook.sheets.length + 1}`
      return {
        ...state,
        workbook: {
          ...state.workbook,
          sheets: [...state.workbook.sheets, createEmptySheet(name)],
          activeSheetIndex: state.workbook.sheets.length,
        },
        selection: createDefaultSelection(),
        isModified: true,
      }
    }

    case 'DELETE_SHEET': {
      if (state.workbook.sheets.length <= 1) return state
      const sheets = state.workbook.sheets.filter((_, i) => i !== action.index)
      const newIndex = Math.min(state.workbook.activeSheetIndex, sheets.length - 1)
      return {
        ...state,
        workbook: { ...state.workbook, sheets, activeSheetIndex: newIndex },
        selection: createDefaultSelection(),
        isModified: true,
      }
    }

    case 'RENAME_SHEET': {
      const sheets = [...state.workbook.sheets]
      sheets[action.index] = { ...sheets[action.index], name: action.name }
      return {
        ...state,
        workbook: { ...state.workbook, sheets },
        isModified: true,
      }
    }

    case 'SET_ACTIVE_SHEET': {
      if (action.index < 0 || action.index >= state.workbook.sheets.length) return state
      return {
        ...state,
        workbook: { ...state.workbook, activeSheetIndex: action.index },
        selection: createDefaultSelection(),
        editingCell: null,
        editValue: '',
      }
    }

    case 'DUPLICATE_SHEET': {
      const source = state.workbook.sheets[action.index]
      const newSheet: SheetData = {
        ...source,
        name: `${source.name} (Kopie)`,
        cells: { ...source.cells },
        columnWidths: { ...source.columnWidths },
        rowHeights: { ...source.rowHeights },
      }
      const sheets = [...state.workbook.sheets]
      sheets.splice(action.index + 1, 0, newSheet)
      return {
        ...state,
        workbook: { ...state.workbook, sheets, activeSheetIndex: action.index + 1 },
        selection: createDefaultSelection(),
        isModified: true,
      }
    }

    case 'SET_FROZEN_PANES': {
      return updateActiveSheet(state, (s) => ({
        ...s,
        frozenRows: action.rows,
        frozenCols: action.cols,
      }))
    }

    case 'SORT_RANGE': {
      return updateActiveSheet(state, (s) => {
        const range = normalizeRange(action.range)
        const rows: { row: number; cells: Record<string, CellData> }[] = []

        // Sammle Zeilen im Bereich
        for (let row = range.start.row; row <= range.end.row; row++) {
          const rowCells: Record<string, CellData> = {}
          for (let col = range.start.col; col <= range.end.col; col++) {
            const key = cellAddressToString({ col, row })
            if (s.cells[key]) {
              rowCells[key] = s.cells[key]
            }
          }
          rows.push({ row, cells: rowCells })
        }

        // Sortiere nach Spalte
        rows.sort((a, b) => {
          const keyA = cellAddressToString({ col: action.column, row: a.row })
          const keyB = cellAddressToString({ col: action.column, row: b.row })
          const valA = a.cells[keyA]?.value ?? ''
          const valB = b.cells[keyB]?.value ?? ''

          let cmp = 0
          if (typeof valA === 'number' && typeof valB === 'number') {
            cmp = valA - valB
          } else {
            cmp = String(valA).localeCompare(String(valB), 'de')
          }

          return action.ascending ? cmp : -cmp
        })

        // Schreibe sortierte Zellen zurück
        const newCells = { ...s.cells }

        // Lösche alte Zellen im Bereich
        for (const addr of iterateRange(range)) {
          delete newCells[cellAddressToString(addr)]
        }

        // Schreibe neue Zellen
        rows.forEach((sortedRow, newRowIdx) => {
          const targetRow = range.start.row + newRowIdx
          for (let col = range.start.col; col <= range.end.col; col++) {
            const oldKey = cellAddressToString({ col, row: sortedRow.row })
            const newKey = cellAddressToString({ col, row: targetRow })
            if (sortedRow.cells[oldKey]) {
              newCells[newKey] = sortedRow.cells[oldKey]
            }
          }
        })

        return { ...s, cells: newCells }
      })
    }

    case 'SET_SELECTION': {
      return { ...state, selection: action.selection }
    }

    case 'START_EDITING': {
      const addr = action.address || state.selection.activeCell
      const sheet = getActiveSheet(state)
      const key = cellAddressToString(addr)
      const cell = sheet.cells[key]
      const initialValue = action.initialValue ?? (cell?.formula || (cell?.value != null ? String(cell.value) : ''))
      return {
        ...state,
        editingCell: addr,
        editValue: initialValue,
      }
    }

    case 'UPDATE_EDIT_VALUE': {
      return { ...state, editValue: action.value }
    }

    case 'COMMIT_EDIT': {
      if (!state.editingCell) return state
      const address = cellAddressToString(state.editingCell)
      const newState = workbookReducer(state, {
        type: 'SET_CELL_VALUE',
        address,
        rawValue: state.editValue,
      })
      return {
        ...newState,
        editingCell: null,
        editValue: '',
      }
    }

    case 'CANCEL_EDIT': {
      return {
        ...state,
        editingCell: null,
        editValue: '',
      }
    }

    case 'LOAD_WORKBOOK': {
      clearDependencyGraph()
      let newState: WorkbookState = {
        ...state,
        workbook: action.workbook,
        documentName: action.name,
        selection: createDefaultSelection(),
        editingCell: null,
        editValue: '',
        isModified: false,
        history: createHistory(),
      }
      // Alle Formeln im aktiven Sheet berechnen
      newState = applyRecalcAll(newState)
      return newState
    }

    case 'NEW_WORKBOOK': {
      clearDependencyGraph()
      return {
        ...createInitialState(),
        documentName: 'Unbenannt',
      }
    }

    case 'SET_DOCUMENT_NAME': {
      return { ...state, documentName: action.name }
    }

    case 'SET_MODIFIED': {
      return { ...state, isModified: action.modified }
    }

    case 'PASTE_CELLS': {
      let newState = updateActiveSheet(state, (s) => {
        const newCells = { ...s.cells }
        for (const [addr, data] of Object.entries(action.cells)) {
          newCells[addr] = data
        }
        return { ...s, cells: newCells }
      })
      // Neuberechnung der eingefügten und abhängigen Zellen
      newState = applyRecalcResults(newState, Object.keys(action.cells))
      return newState
    }

    case 'SET_CLIPBOARD': {
      return { ...state, clipboard: action.clipboard }
    }

    case 'UNDO': {
      const { history: newHistory, entry } = undoHistory(state.history)
      if (!entry) return state
      let newState = { ...state, history: newHistory }
      const changedAddresses: string[] = []
      for (const patch of entry.inversePatches) {
        const sheets = [...newState.workbook.sheets]
        const sheet = { ...sheets[patch.sheetIndex] }
        const cells = { ...sheet.cells }
        if (patch.newValue) {
          cells[patch.address] = patch.newValue
        } else {
          delete cells[patch.address]
        }
        sheet.cells = cells
        sheets[patch.sheetIndex] = sheet
        newState = { ...newState, workbook: { ...newState.workbook, sheets } }
        changedAddresses.push(patch.address)
      }
      // Neuberechnung
      newState = applyRecalcResults(newState, changedAddresses)
      return newState
    }

    case 'REDO': {
      const { history: newHistory, entry } = redoHistory(state.history)
      if (!entry) return state
      let newState = { ...state, history: newHistory }
      const changedAddresses: string[] = []
      for (const patch of entry.patches) {
        const sheets = [...newState.workbook.sheets]
        const sheet = { ...sheets[patch.sheetIndex] }
        const cells = { ...sheet.cells }
        if (patch.newValue) {
          cells[patch.address] = patch.newValue
        } else {
          delete cells[patch.address]
        }
        sheet.cells = cells
        sheets[patch.sheetIndex] = sheet
        newState = { ...newState, workbook: { ...newState.workbook, sheets } }
        changedAddresses.push(patch.address)
      }
      // Neuberechnung
      newState = applyRecalcResults(newState, changedAddresses)
      return newState
    }

    case 'MERGE_CELLS': {
      const range = normalizeRange(action.range)
      return updateActiveSheet(state, (s) => {
        const newCells = { ...s.cells }
        const topLeftKey = cellAddressToString(range.start)

        // Sammle Inhalte aller Zellen im Bereich
        const parts: string[] = []
        for (const addr of iterateRange(range)) {
          const key = cellAddressToString(addr)
          const cell = newCells[key]
          if (cell && cell.value != null && String(cell.value) !== '') {
            parts.push(String(cell.value))
          }
        }

        // Setze kombinierten Inhalt in die obere linke Zelle
        const topLeftCell = newCells[topLeftKey] || { value: null }
        newCells[topLeftKey] = {
          ...topLeftCell,
          value: parts.length > 0 ? parts.join(' ') : null,
          formula: topLeftCell.formula,
        }

        // Leere alle anderen Zellen im Bereich (behalte Styles)
        for (const addr of iterateRange(range)) {
          const key = cellAddressToString(addr)
          if (key === topLeftKey) continue
          const cell = newCells[key]
          if (cell) {
            newCells[key] = { value: null, style: cell.style }
          }
        }

        const mergedCells = [...(s.mergedCells || [])]
        mergedCells.push({ start: range.start, end: range.end })

        return { ...s, cells: newCells, mergedCells }
      })
    }

    case 'UNMERGE_CELLS': {
      const range = normalizeRange(action.range)
      return updateActiveSheet(state, (s) => {
        const mergedCells = (s.mergedCells || []).filter(
          (m) =>
            m.start.col !== range.start.col ||
            m.start.row !== range.start.row ||
            m.end.col !== range.end.col ||
            m.end.row !== range.end.row
        )
        return { ...s, mergedCells }
      })
    }

    case 'SET_COMMENT': {
      return updateActiveSheet(state, (s) => {
        const newCells = { ...s.cells }
        const existing = newCells[action.address] || { value: null }
        newCells[action.address] = {
          ...existing,
          comment: {
            text: action.comment.text,
            author: action.comment.author,
            date: new Date().toISOString(),
          },
        }
        return { ...s, cells: newCells }
      })
    }

    case 'DELETE_COMMENT': {
      return updateActiveSheet(state, (s) => {
        const newCells = { ...s.cells }
        if (newCells[action.address]) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { comment: _, ...rest } = newCells[action.address]
          newCells[action.address] = rest as import('@/lib/types/spreadsheet').CellData
        }
        return { ...s, cells: newCells }
      })
    }

    case 'TOGGLE_FILTER': {
      return updateActiveSheet(state, (s) => {
        if (s.filterState) {
          // Filter entfernen
          return { ...s, filterState: undefined, hiddenRows: undefined }
        }
        // Filter aktivieren
        const range = normalizeRange(action.range)
        return {
          ...s,
          filterState: { range, columns: {} },
          hiddenRows: new Set<number>(),
        }
      })
    }

    case 'SET_FILTER': {
      return updateActiveSheet(state, (s) => {
        if (!s.filterState) return s
        const newFilterState = {
          ...s.filterState,
          columns: {
            ...s.filterState.columns,
            [action.column]: { selectedValues: action.selectedValues },
          },
        }
        // Berechne versteckte Zeilen
        const hiddenRows = new Set<number>()
        const range = s.filterState.range
        for (let row = range.start.row + 1; row <= range.end.row; row++) {
          for (const [colStr, filter] of Object.entries(newFilterState.columns)) {
            const col = parseInt(colStr, 10)
            const key = cellAddressToString({ col, row })
            const val = s.cells[key]?.value
            const strVal = val != null ? String(val) : ''
            if (!filter.selectedValues.has(strVal)) {
              hiddenRows.add(row)
              break
            }
          }
        }
        return { ...s, filterState: newFilterState, hiddenRows }
      })
    }

    case 'CLEAR_FILTERS': {
      return updateActiveSheet(state, (s) => ({
        ...s,
        filterState: undefined,
        hiddenRows: undefined,
      }))
    }

    case 'AUTO_FILL': {
      let newState = updateActiveSheet(state, (s) => {
        const newCells = { ...s.cells }
        for (const [addr, data] of Object.entries(action.cells)) {
          newCells[addr] = data
        }
        return { ...s, cells: newCells }
      })
      newState = applyRecalcResults(newState, Object.keys(action.cells))
      return newState
    }

    default:
      return state
  }
}
