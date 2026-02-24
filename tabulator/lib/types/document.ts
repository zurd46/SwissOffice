// =============================================
// ImpulsTabulator — Dokument-Format
// =============================================

import type { WorkbookData } from './spreadsheet'

/** Tabulator-Einstellungen */
export interface TabulatorSettings {
  showGridlines: boolean
  showFormulaBar: boolean
  showSheetTabs: boolean
  printArea?: {
    sheetIndex: number
    range: string
  }
}

/** .impuls-tabelle Dateiformat */
export interface ImpulsTabelleDocument {
  version: number
  workbook: WorkbookData
  settings: TabulatorSettings
}

/** Standard-Einstellungen */
export const defaultTabulatorSettings: TabulatorSettings = {
  showGridlines: true,
  showFormulaBar: true,
  showSheetTabs: true,
}
