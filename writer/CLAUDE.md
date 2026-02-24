# Writer — Next.js App

Rich-Text-Editor basierend auf Tiptap 3 mit Next.js 16 App Router.

## Stack

- Next.js 16.1.6 (App Router, React 19)
- Tiptap 3.20 (20+ Extensions)
- Tailwind CSS 4
- TypeScript 5 (strict)

## Struktur

```
app/              → Next.js App Router (layout, page, globals.css)
components/
  Editor/         → Tiptap Editor + Custom Extensions
  Toolbar/        → Toolbar, MenuBar, Ribbon-UI
  Sidebar/        → Inhaltsverzeichnis-Navigation
  StatusBar/      → Wort-/Seitenzähler, Zoom
  Dialogs/        → Suchen & Ersetzen
  Export/          → PDF- und DOCX-Export
lib/              → Hilfsfunktionen (Dateioperationen, Default Content)
```

## Konventionen

- Jede Komponente ist ein Named Export: `export function Name() {}`
- Client Components beginnen mit `'use client'`
- Custom Tiptap Extensions: eine Datei pro Extension in `components/Editor/extensions/`
- Export-Module: eine Datei pro Format in `components/Export/`
- Imports nutzen relative Pfade innerhalb von `writer/`, oder `@/*` Alias
- Styling ausschliesslich mit Tailwind CSS Utility-Klassen
- Globale Editor-Stile (ProseMirror) in `app/globals.css`
- Icons immer von `lucide-react` importieren

## Editor-Patterns

```tsx
// Tiptap Command ausführen
editor.chain().focus().toggleBold().run()

// Attribut setzen
editor.chain().focus().setFontSize('16pt').run()

// Aktiven Status prüfen
editor.isActive('bold')
editor.isActive('textAlign', { textAlign: 'center' })
```

## Electron-Integration

Der Editor kommuniziert mit Electron über `window.electronAPI`:
```tsx
// Type-Check
const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron

// Menü-Aktionen empfangen
window.electronAPI.onMenuAction((action: string) => { /* ... */ })
```

Nie direkt auf Node.js APIs zugreifen — immer über das Preload-Script.
