// =============================================
// ImpulsTabulator — Spreadsheet-Datenmodell
// =============================================

/** Zell-Adresse (0-basiert) */
export interface CellAddress {
  col: number
  row: number
}

/** Zell-Bereich */
export interface CellRange {
  start: CellAddress
  end: CellAddress
}

/** Zell-Fehler-Typen */
export type CellErrorType = '#VALUE!' | '#REF!' | '#NAME?' | '#DIV/0!' | '#NULL!' | '#N/A' | '#NUM!' | '#CIRC!'

export interface CellError {
  type: CellErrorType
  message: string
}

/** Mögliche Zellwerte */
export type CellValue = string | number | boolean | CellError | null

/** Rahmen-Stil einer Zelle */
export interface CellBorder {
  style: 'none' | 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted'
  color: string
}

export interface CellBorders {
  top?: CellBorder
  right?: CellBorder
  bottom?: CellBorder
  left?: CellBorder
}

/** Horizontale Ausrichtung */
export type HorizontalAlign = 'left' | 'center' | 'right' | 'general'

/** Vertikale Ausrichtung */
export type VerticalAlign = 'top' | 'middle' | 'bottom'

/** Zahlenformat */
export type NumberFormat = 'general' | 'number' | 'currency' | 'percentage' | 'date' | 'text'

/** Zell-Formatierung */
export interface CellStyle {
  fontFamily?: string
  fontSize?: number
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  textColor?: string
  backgroundColor?: string
  horizontalAlign?: HorizontalAlign
  verticalAlign?: VerticalAlign
  numberFormat?: NumberFormat
  numberFormatPattern?: string
  borders?: CellBorders
  wrapText?: boolean
}

/** Zell-Daten */
export interface CellData {
  value: CellValue
  formula?: string
  style?: CellStyle
}

/** Tabellenblatt */
export interface SheetData {
  name: string
  cells: Record<string, CellData>
  columnWidths: Record<number, number>
  rowHeights: Record<number, number>
  frozenRows: number
  frozenCols: number
  filterColumn?: number
  filterValues?: string[]
}

/** Workbook (gesamtes Dokument) */
export interface WorkbookData {
  sheets: SheetData[]
  activeSheetIndex: number
  defaultColumnWidth: number
  defaultRowHeight: number
}

/** Auswahl-State */
export interface SelectionState {
  activeCell: CellAddress
  ranges: CellRange[]
  isSelecting: boolean
}

// Konstanten
export const DEFAULT_COLUMN_WIDTH = 100
export const DEFAULT_ROW_HEIGHT = 24
export const MAX_COLUMNS = 702    // A-ZZ
export const MAX_ROWS = 10000
export const HEADER_WIDTH = 45
export const HEADER_HEIGHT = 22

/** Prüft ob ein Wert ein CellError ist */
export function isCellError(value: CellValue): value is CellError {
  return value !== null && typeof value === 'object' && 'type' in value && 'message' in value
}
