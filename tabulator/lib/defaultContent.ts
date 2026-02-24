// =============================================
// ImpulsTabulator — Standard-Dokumentinhalt
// =============================================

import type { WorkbookData, SheetData } from '@/lib/types/spreadsheet'
import { DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT } from '@/lib/types/spreadsheet'

/** Erstellt ein leeres Tabellenblatt */
export function createEmptySheet(name: string): SheetData {
  return {
    name,
    cells: {},
    columnWidths: {},
    rowHeights: {},
    frozenRows: 0,
    frozenCols: 0,
    mergedCells: [],
  }
}

/** Erstellt ein leeres Workbook mit einem Tabellenblatt */
export function createDefaultWorkbook(): WorkbookData {
  return {
    sheets: [createEmptySheet('Tabelle 1')],
    activeSheetIndex: 0,
    defaultColumnWidth: DEFAULT_COLUMN_WIDTH,
    defaultRowHeight: DEFAULT_ROW_HEIGHT,
  }
}
