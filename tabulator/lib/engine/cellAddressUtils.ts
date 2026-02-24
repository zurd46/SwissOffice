// =============================================
// ImpulsTabulator — Zell-Adress-Utilities
// =============================================

import type { CellAddress, CellRange } from '@/lib/types/spreadsheet'

/** Spaltenindex (0-basiert) → Buchstabe(n): 0→"A", 25→"Z", 26→"AA" */
export function columnIndexToLetter(index: number): string {
  let result = ''
  let n = index
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result
    n = Math.floor(n / 26) - 1
  }
  return result
}

/** Buchstabe(n) → Spaltenindex (0-basiert): "A"→0, "Z"→25, "AA"→26 */
export function letterToColumnIndex(letter: string): number {
  let result = 0
  const upper = letter.toUpperCase()
  for (let i = 0; i < upper.length; i++) {
    result = result * 26 + (upper.charCodeAt(i) - 64)
  }
  return result - 1
}

/** Zell-Referenz parsen: "B3" → { col: 1, row: 2 } */
export function parseCellRef(ref: string): CellAddress | null {
  const match = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/)
  if (!match) return null
  const col = letterToColumnIndex(match[1])
  const row = parseInt(match[2], 10) - 1
  if (row < 0) return null
  return { col, row }
}

/** Bereich parsen: "A1:C5" → { start, end } */
export function parseRangeRef(ref: string): CellRange | null {
  const parts = ref.split(':')
  if (parts.length !== 2) return null
  const start = parseCellRef(parts[0])
  const end = parseCellRef(parts[1])
  if (!start || !end) return null
  return {
    start: {
      col: Math.min(start.col, end.col),
      row: Math.min(start.row, end.row),
    },
    end: {
      col: Math.max(start.col, end.col),
      row: Math.max(start.row, end.row),
    },
  }
}

/** CellAddress → String: { col: 0, row: 0 } → "A1" */
export function cellAddressToString(addr: CellAddress): string {
  return `${columnIndexToLetter(addr.col)}${addr.row + 1}`
}

/** CellRange → String: { start: {0,0}, end: {2,4} } → "A1:C5" */
export function cellRangeToString(range: CellRange): string {
  return `${cellAddressToString(range.start)}:${cellAddressToString(range.end)}`
}

/** Prüft ob eine Zell-Referenz gültig ist */
export function isValidCellRef(ref: string): boolean {
  return parseCellRef(ref) !== null
}

/** Prüft ob eine Adresse in einem Bereich liegt */
export function isAddressInRange(addr: CellAddress, range: CellRange): boolean {
  return (
    addr.col >= range.start.col &&
    addr.col <= range.end.col &&
    addr.row >= range.start.row &&
    addr.row <= range.end.row
  )
}

/** Normalisiert einen Bereich (start immer oben-links, end immer unten-rechts) */
export function normalizeRange(range: CellRange): CellRange {
  return {
    start: {
      col: Math.min(range.start.col, range.end.col),
      row: Math.min(range.start.row, range.end.row),
    },
    end: {
      col: Math.max(range.start.col, range.end.col),
      row: Math.max(range.start.row, range.end.row),
    },
  }
}

/** Alle Zell-Adressen in einem Bereich iterieren */
export function* iterateRange(range: CellRange): Generator<CellAddress> {
  const normalized = normalizeRange(range)
  for (let row = normalized.start.row; row <= normalized.end.row; row++) {
    for (let col = normalized.start.col; col <= normalized.end.col; col++) {
      yield { col, row }
    }
  }
}
