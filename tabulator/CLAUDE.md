# Tabulator — Next.js Tabellenkalkulation

Excel-Alternative mit custom Spreadsheet-Engine, Formel-Parser und Dependency Graph.

## Stack

- Next.js 16 (App Router, React 19)
- TypeScript 5 (strict)
- Tailwind CSS 4
- Lucide React Icons
- Port 3001

## Struktur

```
app/
  layout.tsx              Root-Layout
  page.tsx                Hauptseite (Spreadsheet)
  globals.css             Globale Stile
  login/                  Login-Seite
  register/               Registrierungs-Seite

components/
  Grid/                   Spreadsheet-Grid
    SpreadsheetGrid.tsx     Haupt-Grid (Virtual Scrolling, Zellenauswahl)
    Cell.tsx                Zellen-Komponente
    ColumnHeader.tsx        Spaltenköpfe (A, B, C, ...)
    RowHeader.tsx           Zeilenköpfe (1, 2, 3, ...)
    SelectionOverlay.tsx    Auswahl-Hervorhebung
    CellEditor.tsx          Inline-Zellen-Editor
    ContextMenu.tsx         Rechtsklick-Menü
  FormulaBar/
    FormulaBar.tsx          Formelleiste mit Namensfeld und Eingabe
    FunctionInsert.tsx      Funktions-Einfüge-Dialog
  SheetTabs/
    SheetTabs.tsx           Arbeitsblatt-Tabs (Umbenennen, Duplizieren, Löschen)
  Toolbar/
    Ribbon/                 Office-Ribbon-UI
      tabs/
        TabStart.tsx        Schrift, Ausrichtung, Zahlenformat
        TabFormeln.tsx      Formel-Funktionen
        TabDaten.tsx        Sortierung, Filter, Validierung
        TabEinfuegen.tsx    Diagramme, Bilder (geplant)
        TabSeitenlayout.tsx Druckbereich, Seitenformat
  StatusBar/
    StatusBar.tsx           Summe/Durchschnitt/Anzahl, Zoom
  Dialogs/
    FormatCellsDialog.tsx   Zellformatierung
    ConditionalFormatDialog.tsx  Bedingte Formatierung
    SortDialog.tsx          Sortier-Dialog
    DataValidationDialog.tsx  Datenvalidierung
    FindReplaceDialog.tsx   Suchen & Ersetzen
  Export/
    exportCSV.ts            CSV Export/Import (RFC 4180)

lib/
  engine/
    FormulaParser.ts        Formel-Parser (Tokenizer + AST)
    FormulaEvaluator.ts     Formel-Auswertung
    DependencyGraph.ts      Abhängigkeitsgraph für Neuberechnung
    functions/              40+ eingebaute Funktionen
      math.ts               SUMME, MIN, MAX, DURCHSCHNITT, RUNDEN, ...
      logic.ts              WENN, UND, ODER, NICHT, ...
      text.ts               VERKETTEN, LINKS, RECHTS, LÄNGE, ...
      statistics.ts         ANZAHL, MITTELWERT, STABW, ...
      lookup.ts             SVERWEIS, WVERWEIS, INDEX, VERGLEICH
  state/
    workbookState.ts        Workbook State Management
    historyState.ts         Undo/Redo History
    selectionState.ts       Zellauswahl-State
  types/
    cell.ts                 Zell-Typen (Wert, Formel, Format)
    workbook.ts             Workbook/Sheet-Typen
    format.ts               Formatierungs-Typen
  hooks/
    useVirtualGrid.ts       Virtual Scrolling Hook
    useKeyboardNavigation.ts  Tastatur-Navigation
    useSelection.ts         Auswahl-Hook
```

## Formel-Engine

```ts
// Formel-Syntax
=SUMME(A1:A10)
=WENN(A1>100; "Hoch"; "Niedrig")
=SVERWEIS(A1; B1:C10; 2; FALSCH)

// Abhängigkeitsgraph berechnet nur betroffene Zellen neu
// Zirkuläre Referenzen werden erkannt und als #ZIRKULAR! angezeigt
```

## Dateiformat

`.impuls-tabelle` (JSON):
```json
{
  "sheets": [{
    "name": "Tabelle1",
    "cells": { "A1": { "value": "Hallo", "formula": null, "format": {} } },
    "columnWidths": {},
    "rowHeights": {}
  }],
  "activeSheet": 0
}
```

## Konventionen

- Named Export: `export function Name() {}`
- `'use client'` für alle interaktiven Komponenten
- Path-Alias: `@/*` mappt auf `tabulator/*`
- Styling: Tailwind CSS
- Icons: `lucide-react`
- Labels: Deutsch
- Grid-Komponenten unter `components/Grid/`
- Export-Module unter `components/Export/`
- Engine-Logik unter `lib/engine/`
