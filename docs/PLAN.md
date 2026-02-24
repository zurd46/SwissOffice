# ImpulsWriter - Implementierungsplan

## Technologie-Stack
- **Framework:** Next.js 14 (App Router)
- **Editor:** Tiptap (Open Source) mit Extensions
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **PDF Export:** jspdf + html2canvas
- **DOCX Export:** docx (npm)
- **Dateiformat:** JSON (nativ), HTML

## Architektur

```
writer/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Editor/
│   │   ├── Editor.tsx              # Haupteditor-Komponente
│   │   ├── EditorContent.tsx       # Tiptap EditorContent wrapper
│   │   ├── PageView.tsx            # A4-Seitenansicht mit Seiten
│   │   └── extensions/
│   │       ├── PageBreak.ts        # Seitenumbruch-Extension
│   │       ├── FontSize.ts         # Schriftgrössen-Extension
│   │       └── LineHeight.ts       # Zeilenabstand-Extension
│   ├── Toolbar/
│   │   ├── Toolbar.tsx             # Haupt-Toolbar (Ribbon-Style)
│   │   ├── MenuBar.tsx             # Datei/Bearbeiten/Ansicht Menü
│   │   ├── FormatToolbar.tsx       # Schrift, Grösse, Farbe
│   │   ├── ParagraphToolbar.tsx    # Absatz, Listen, Ausrichtung
│   │   ├── InsertToolbar.tsx       # Tabelle, Bild, Seitenumbruch
│   │   └── ToolbarButton.tsx       # Wiederverwendbarer Button
│   ├── Sidebar/
│   │   ├── Sidebar.tsx             # Seitenleiste
│   │   ├── TableOfContents.tsx     # Inhaltsverzeichnis
│   │   └── StylesSidebar.tsx       # Formatvorlagen
│   ├── StatusBar/
│   │   └── StatusBar.tsx           # Wörter, Seiten, Zoom
│   ├── Dialogs/
│   │   ├── FindReplace.tsx         # Suchen & Ersetzen
│   │   ├── ImageDialog.tsx         # Bild einfügen
│   │   └── TableDialog.tsx         # Tabelle einfügen
│   └── Export/
│       ├── exportPDF.ts            # PDF-Export
│       └── exportDOCX.ts           # DOCX-Export
├── hooks/
│   ├── useEditor.ts                # Editor-Hook
│   └── useDocument.ts              # Dokument-Verwaltung
├── lib/
│   ├── defaultContent.ts           # Standard-Dokument
│   └── fileOperations.ts           # Öffnen/Speichern
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Features (Vollständig)

### 1. Textformatierung
- Fett, Kursiv, Unterstrichen, Durchgestrichen
- Hochgestellt, Tiefgestellt
- Schriftart-Auswahl (20+ Schriften)
- Schriftgrösse (8-72pt)
- Textfarbe & Hervorhebungsfarbe
- Überschriften H1-H6
- Zeilenabstand

### 2. Absatzformatierung
- Links, Zentriert, Rechts, Blocksatz
- Aufzählung (Punkte, Nummern)
- Aufgabenlisten
- Einzug vergrössern/verkleinern
- Blockzitat

### 3. Einfügen
- Tabellen (mit Zeilen/Spalten hinzufügen/löschen)
- Bilder (Upload & URL)
- Horizontale Linie
- Seitenumbruch
- Links

### 4. Seitenlayout
- A4-Seitenansicht (WYSIWYG)
- Seitenränder
- Kopf- und Fusszeile
- Seitenzahlen
- Automatisches Inhaltsverzeichnis

### 5. Datei-Operationen
- Neues Dokument
- Speichern/Laden (JSON)
- PDF-Export
- DOCX-Export
- HTML-Export
- Drucken

### 6. Bearbeitung
- Rückgängig/Wiederholen
- Suchen & Ersetzen
- Alles markieren

### 7. UI
- Word-ähnliches Ribbon-Toolbar
- Menüleiste (Datei, Bearbeiten, Einfügen, Format, Ansicht)
- Statusleiste (Wortanzahl, Seitenzahl, Zoom)
- Seitenleiste mit Inhaltsverzeichnis
- Zoom-Kontrolle
- Dunkelmodus

## Implementierungs-Reihenfolge

1. **Projekt-Setup** - Next.js, Tailwind, Dependencies
2. **Basis-Editor** - Tiptap mit allen Text-Extensions
3. **Toolbar** - Ribbon-Style Toolbar mit allen Formatierungen
4. **Seitenansicht** - A4-Pages mit CSS
5. **Tabellen** - Tiptap Table Extension
6. **Bilder** - Upload & Einfügen
7. **Kopf-/Fusszeile & Seitenzahlen**
8. **Inhaltsverzeichnis**
9. **Datei-Operationen** - Speichern, Laden
10. **Export** - PDF & DOCX
11. **Suchen & Ersetzen**
12. **StatusBar & Zoom**
13. **Feinschliff & Polish**
