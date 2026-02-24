# ImpulsWriter

Professionelle Desktop-Textverarbeitung (Word-Alternative) als Electron-App mit Next.js-Frontend und Tiptap-Editor.

## Architektur

Monorepo mit zwei Hauptmodulen:

- **`writer/`** — Next.js 16 App (React 19, TypeScript, Tiptap 3, Tailwind CSS 4)
- **`client/`** — Electron 33 Shell (CommonJS, lädt writer als Renderer)
- **`docs/`** — Projektdokumentation und Pläne
- **`data/`, `cloud/`, `email/`, `tabulator/`** — Geplante Module (noch leer)

Die Kommunikation zwischen Electron und Next.js läuft über IPC via `client/preload.js` → `window.electronAPI`.

## Entwicklung

```bash
# Writer (Next.js) starten
cd writer && npm run dev        # http://localhost:3000

# Electron + Writer gemeinsam starten
cd client && npm run dev        # Startet Next.js dev server + Electron

# Lint
cd writer && npm run lint       # ESLint (Next.js core-web-vitals + TypeScript)

# Build
cd writer && npm run build      # Next.js Production Build
cd client && npm run build      # Next.js Build + Electron Builder
cd client && npm run dist       # Vollständige Distribution (Mac + Win)
```

## Code-Konventionen

### TypeScript / React (writer/)
- **Strict TypeScript** (`strict: true` in tsconfig)
- **Funktionale Komponenten** mit Named Exports: `export function ComponentName()`
- **`'use client'`** Directive für alle interaktiven Komponenten
- **Path-Alias:** `@/*` mappt auf `writer/*` (z.B. `@/components/Editor/Editor`)
- **Styling:** Tailwind CSS Utility-Klassen, globale Stile in `app/globals.css`
- **Icons:** Lucide React (`lucide-react`)
- **Editor:** Tiptap 3 mit Custom Extensions in `components/Editor/extensions/`

### Electron (client/)
- **CommonJS** (`require()`) — kein TypeScript
- **Context Isolation:** `contextIsolation: true`, `nodeIntegration: false`
- IPC über Preload-Script, nie direkt Node.js im Renderer

### Allgemein
- **UI-Sprache:** Deutsch (alle Labels, Menüs, Platzhalter)
- **Dateiformat:** `.impuls` (JSON-Serialisierung des Editor-Contents)
- **Export:** PDF (jspdf + html2canvas), DOCX (docx), HTML
- **Seitenlayout:** A4 (210mm × 297mm), 25mm Margins

## Wichtige Dateien

| Datei | Beschreibung |
|---|---|
| `writer/components/Editor/Editor.tsx` | Haupt-Editor-Komponente (Tiptap Setup, Electron IPC) |
| `writer/components/Toolbar/Toolbar.tsx` | Formatting-Toolbar |
| `writer/components/Toolbar/Ribbon/` | Office-Ribbon-UI Komponenten |
| `writer/components/Toolbar/MenuBar.tsx` | Menüleiste (Datei, Bearbeiten, etc.) |
| `writer/components/Export/exportPDF.ts` | PDF-Export Logik |
| `writer/components/Export/exportDOCX.ts` | DOCX-Export Logik |
| `writer/lib/fileOperations.ts` | Datei-Operationen (Speichern, Laden, Drucken) |
| `writer/lib/defaultContent.ts` | Standard-Dokumentvorlage |
| `writer/components/Editor/extensions/` | Custom Tiptap Extensions (FontSize, LineHeight, PageBreak) |
| `client/main.js` | Electron Main Process |
| `client/preload.js` | IPC Bridge (electronAPI) |
| `client/menu.js` | Native Menü-Definition |

## Regeln

- Alle neuen UI-Texte auf Deutsch
- Keine neuen Dependencies ohne Begründung
- Tiptap Extensions als separate Dateien unter `components/Editor/extensions/`
- Export-Formate als separate Dateien unter `components/Export/`
- Electron IPC-Kommunikation immer über das Preload-Script, nie über direkten Node.js-Zugriff
- Neue Komponenten folgen der bestehenden Ordnerstruktur: `components/{Kategorie}/{Name}.tsx`
- Keine `default exports` — immer Named Exports verwenden
