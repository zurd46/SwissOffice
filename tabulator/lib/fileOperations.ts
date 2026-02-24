// =============================================
// ImpulsTabulator — Datei-Operationen
// =============================================

import { saveAs } from 'file-saver'
import type { WorkbookData } from '@/lib/types/spreadsheet'
import type { ImpulsTabelleDocument, TabulatorSettings } from '@/lib/types/document'
import { defaultTabulatorSettings } from '@/lib/types/document'
import { cellAddressToString } from '@/lib/engine/cellAddressUtils'

const CURRENT_VERSION = 1

/** Dokument als .impuls-tabelle speichern */
export function saveDocument(
  workbook: WorkbookData,
  filename: string = 'tabelle',
  settings?: TabulatorSettings,
): void {
  const doc: ImpulsTabelleDocument = {
    version: CURRENT_VERSION,
    workbook,
    settings: settings ?? defaultTabulatorSettings,
  }
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
  saveAs(blob, `${filename}.impuls-tabelle`)
}

/** Dokument laden */
export function loadDocument(
  onLoaded: (result: { workbook: WorkbookData; settings: TabulatorSettings; documentName: string }) => void,
): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.impuls-tabelle,.json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const json = JSON.parse(text) as ImpulsTabelleDocument
      const docName = file.name.replace(/\.(impuls-tabelle|json)$/, '')
      onLoaded({
        workbook: json.workbook,
        settings: json.settings || defaultTabulatorSettings,
        documentName: docName,
      })
    } catch {
      alert('Ungültiges Dateiformat. Bitte eine .impuls-tabelle Datei wählen.')
    }
  }
  input.click()
}

/** CSV-Export */
export function exportCSV(
  workbook: WorkbookData,
  sheetIndex: number,
  filename: string = 'tabelle',
): void {
  const sheet = workbook.sheets[sheetIndex]
  if (!sheet) return

  // Finde den genutzten Bereich
  let maxRow = 0
  let maxCol = 0
  for (const key of Object.keys(sheet.cells)) {
    const match = key.match(/^([A-Z]+)(\d+)$/)
    if (match) {
      const row = parseInt(match[2], 10) - 1
      // Spaltenindex berechnen
      let col = 0
      const letters = match[1]
      for (let i = 0; i < letters.length; i++) {
        col = col * 26 + (letters.charCodeAt(i) - 64)
      }
      col -= 1
      maxRow = Math.max(maxRow, row)
      maxCol = Math.max(maxCol, col)
    }
  }

  const rows: string[] = []
  for (let r = 0; r <= maxRow; r++) {
    const cols: string[] = []
    for (let c = 0; c <= maxCol; c++) {
      const key = cellAddressToString({ col: c, row: r })
      const cell = sheet.cells[key]
      let value = ''
      if (cell && cell.value !== null && cell.value !== undefined) {
        value = String(cell.value)
      }
      // CSV-Escape: Anführungszeichen verdoppeln, Werte mit Komma/Zeilenumbruch einschliessen
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`
      }
      cols.push(value)
    }
    rows.push(cols.join(','))
  }

  const csv = rows.join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }) // BOM für Excel
  saveAs(blob, `${filename}.csv`)
}

/** Drucken */
export function printDocument(workbook: WorkbookData, sheetIndex: number): void {
  const sheet = workbook.sheets[sheetIndex]
  if (!sheet) return

  // Finde den genutzten Bereich
  let maxRow = 0
  let maxCol = 0
  for (const key of Object.keys(sheet.cells)) {
    const match = key.match(/^([A-Z]+)(\d+)$/)
    if (match) {
      const row = parseInt(match[2], 10) - 1
      let col = 0
      const letters = match[1]
      for (let i = 0; i < letters.length; i++) {
        col = col * 26 + (letters.charCodeAt(i) - 64)
      }
      col -= 1
      maxRow = Math.max(maxRow, row)
      maxCol = Math.max(maxCol, col)
    }
  }

  // HTML-Tabelle generieren
  let html = '<table style="border-collapse:collapse;font-family:Calibri,sans-serif;font-size:11pt;">'
  for (let r = 0; r <= maxRow; r++) {
    html += '<tr>'
    for (let c = 0; c <= maxCol; c++) {
      const key = cellAddressToString({ col: c, row: r })
      const cell = sheet.cells[key]
      let value = ''
      let style = 'border:1px solid #ccc;padding:4px 8px;'

      if (cell) {
        if (cell.value !== null && cell.value !== undefined) {
          value = String(cell.value)
        }
        if (cell.style) {
          if (cell.style.bold) style += 'font-weight:bold;'
          if (cell.style.italic) style += 'font-style:italic;'
          if (cell.style.textColor) style += `color:${cell.style.textColor};`
          if (cell.style.backgroundColor) style += `background:${cell.style.backgroundColor};`
          if (cell.style.horizontalAlign && cell.style.horizontalAlign !== 'general') {
            style += `text-align:${cell.style.horizontalAlign};`
          }
        }
      }

      html += `<td style="${style}">${value}</td>`
    }
    html += '</tr>'
  }
  html += '</table>'

  // Iframe für Druck
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.left = '-9999px'
  iframe.style.top = '-9999px'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  if (doc) {
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Drucken</title>
      <style>@page { size: A4 landscape; margin: 15mm; } body { margin: 0; }</style>
      </head>
      <body>${html}</body>
      </html>
    `)
    doc.close()

    iframe.onload = () => {
      iframe.contentWindow?.print()
      setTimeout(() => document.body.removeChild(iframe), 1000)
    }
  }
}
