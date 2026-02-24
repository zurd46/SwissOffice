# ImpulsTabulator

Professionelle Tabellenkalkulation (Excel-Alternative) als Next.js-Modul im ImpulsOffice-Monorepo.

## Architektur

- **Next.js 16** App (React 19, TypeScript strict, Tailwind CSS 4)
- Eigenständiges Modul unter `tabulator/`, läuft auf Port 3001
- Komplett custom gebaute Spreadsheet-Engine (kein externes Spreadsheet-Framework)
- Eigene Formel-Engine mit Parser, Evaluator und Dependency Graph

## Entwicklung

```bash
cd tabulator && npm run dev    # http://localhost:3001
cd tabulator && npm run lint   # ESLint
cd tabulator && npm run build  # Production Build
```

## Code-Konventionen

- **Strict TypeScript** (`strict: true`)
- **Funktionale Komponenten** mit Named Exports: `export function ComponentName()`
- **`'use client'`** Directive für alle interaktiven Komponenten
- **Path-Alias:** `@/*` mappt auf `tabulator/*`
- **Styling:** Tailwind CSS Utility-Klassen, globale Stile in `app/globals.css`
- **Icons:** Lucide React (`lucide-react`)
- **UI-Sprache:** Deutsch (alle Labels, Menüs, Platzhalter)
- **Dateiformat:** `.impuls-tabelle` (JSON-Serialisierung des Workbook-State)

## Wichtige Verzeichnisse

| Verzeichnis | Beschreibung |
|---|---|
| `components/Grid/` | Spreadsheet-Grid (Virtual Scrolling, Zellen, Auswahl) |
| `components/FormulaBar/` | Formelleiste |
| `components/SheetTabs/` | Tabellenblatt-Tabs |
| `components/Toolbar/Ribbon/` | Office-Ribbon-UI |
| `components/StatusBar/` | Statusleiste |
| `components/Dialogs/` | Dialoge (Formatierung, Sortieren, etc.) |
| `components/Export/` | Export-Module (CSV, PDF) |
| `lib/engine/` | Formel-Engine (Parser, Evaluator, Functions) |
| `lib/state/` | State Management (Workbook, History, Selection) |
| `lib/types/` | TypeScript-Typen |
| `lib/hooks/` | Custom Hooks (Virtual Grid, Keyboard, Selection) |

## Regeln

- Alle neuen UI-Texte auf Deutsch
- Keine neuen Dependencies ohne Begründung
- Grid-Komponenten unter `components/Grid/`
- Export-Formate als separate Dateien unter `components/Export/`
- Neue Komponenten folgen der bestehenden Ordnerstruktur
- Keine `default exports` — immer Named Exports verwenden
