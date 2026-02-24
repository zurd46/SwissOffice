// =============================================
// ImpulsTabulator — Clipboard-Management
// =============================================

import type { CellData, CellRange, SheetData } from '@/lib/types/spreadsheet'
import { cellAddressToString, iterateRange, normalizeRange } from '@/lib/engine/cellAddressUtils'

/** Clipboard-Inhalt */
export interface ClipboardContent {
  cells: Record<string, CellData>
  range: CellRange
  isCut: boolean
}

/** Kopiert Zellen aus einem Sheet */
export function copyCells(sheet: SheetData, range: CellRange): ClipboardContent {
  const normalized = normalizeRange(range)
  const cells: Record<string, CellData> = {}

  for (const addr of iterateRange(normalized)) {
    const key = cellAddressToString(addr)
    if (sheet.cells[key]) {
      // Relativer Key zum Bereich
      const relKey = `${addr.col - normalized.start.col},${addr.row - normalized.start.row}`
      cells[relKey] = { ...sheet.cells[key] }
    }
  }

  return { cells, range: normalized, isCut: false }
}

/** Erstellt Paste-Daten für ein Ziel */
export function createPasteData(
  clipboard: ClipboardContent,
  targetStart: { col: number; row: number }
): Record<string, CellData> {
  const result: Record<string, CellData> = {}
  const width = clipboard.range.end.col - clipboard.range.start.col + 1
  const height = clipboard.range.end.row - clipboard.range.start.row + 1

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const relKey = `${col},${row}`
      if (clipboard.cells[relKey]) {
        const targetAddr = cellAddressToString({
          col: targetStart.col + col,
          row: targetStart.row + row,
        })
        result[targetAddr] = { ...clipboard.cells[relKey] }
      }
    }
  }

  return result
}

/** Parst TSV-Text (z.B. aus Excel kopiert) in Zell-Daten */
export function parseTSV(text: string): Record<string, CellData> {
  const result: Record<string, CellData> = {}
  const rows = text.split('\n')

  for (let row = 0; row < rows.length; row++) {
    if (!rows[row].trim()) continue
    const cols = rows[row].split('\t')
    for (let col = 0; col < cols.length; col++) {
      const value = cols[col].trim()
      if (value) {
        const addr = cellAddressToString({ col, row })
        const numValue = Number(value)
        result[addr] = {
          value: isNaN(numValue) || value === '' ? value : numValue,
        }
      }
    }
  }

  return result
}
