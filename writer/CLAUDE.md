# Writer — Next.js Textverarbeitung

Rich-Text-Editor basierend auf Tiptap 3 mit Next.js 16 App Router. Word-Alternative mit Office-Ribbon-UI.

## Stack

- Next.js 16.1.6 (App Router, React 19.2.3)
- Tiptap 3.20 (23 Custom + 15 Built-in Extensions)
- Tailwind CSS 4
- TypeScript 5 (strict)
- Lucide React Icons

## Struktur

```
app/
  layout.tsx              Root-Layout mit Providers
  page.tsx                Hauptseite (Editor)
  providers.tsx           Context-Provider (Auth, Cloud, Document)
  globals.css             Globale Stile + ProseMirror CSS
  login/                  Login-Seite
  register/               Registrierungs-Seite

components/
  Editor/
    Editor.tsx            Haupt-Editor (Tiptap Setup, State, Electron IPC)
    PageView.tsx          A4-Seitenansicht mit Zoom
    HeaderFooterEditor.tsx  Kopf-/Fusszeilen-Editor
    RulerBar.tsx          Lineal
    WatermarkOverlay.tsx  Wasserzeichen
    PageOverlay.tsx       Seiten-Overlay
    extensions/           23 Custom Tiptap Extensions
    nodeviews/            Custom Node Views (ResizableImage, Shape)
  Toolbar/
    MenuBar.tsx           Menüleiste (Datei, Bearbeiten, Einfügen, Format, Ansicht)
    ToolbarButton.tsx     Wiederverwendbarer Toolbar-Button
    Ribbon/
      RibbonToolbar.tsx   Ribbon-Container
      RibbonTabStrip.tsx  Tab-Leiste
      RibbonPanel.tsx     Panel-Container
      RibbonGroup.tsx     Gruppierung
      StyleGallery.tsx    Formatvorlagen-Auswahl
      TableGridPicker.tsx Tabellen-Grössen-Picker
      constants.ts        Schriftarten, Grössen, etc.
      tabs/
        TabStart.tsx          Schrift, Absatz, Formatvorlagen
        TabEinfuegen.tsx      Tabellen, Bilder, Links, Seitenumbruch
        TabSeitenlayout.tsx   Seite, Abstände, Spalten, Wasserzeichen
        TabUeberpruefen.tsx   Rechtschreibung, Kommentare, Änderungen
        TabSendungen.tsx      Serienbriefe, Merge-Felder
        TabAnsicht.tsx        Zoom, Lineal, Ansichtsoptionen
        TabKI.tsx             KI-Assistent, OCR-Import
  AI/
    AIChatSidebar.tsx     KI-Chat-Seitenleiste
    AISettingsDialog.tsx  KI-Einstellungen (API-Keys, Modell)
    ChatMessage.tsx       Chat-Nachricht-Darstellung
  Dialogs/
    CloudSaveDialog.tsx   Cloud-Speichern
    CloudOpenDialog.tsx   Cloud-Dokument öffnen
    FindReplace.tsx       Suchen & Ersetzen
    InputDialog.tsx       Generischer Input-Dialog
    PageSetupDialog.tsx   Seiteneinrichtung (Grösse, Margins, Ausrichtung)
    SettingsDialog.tsx    App-Einstellungen
    TemplateChooserDialog.tsx  Dokumentvorlagen-Auswahl
    VersionHistoryDialog.tsx   Versionsverlauf
  Sidebar/
    Sidebar.tsx           Inhaltsverzeichnis-Navigation
    CommentsSidebar.tsx   Kommentar-Seitenleiste
  StatusBar/
    StatusBar.tsx         Wörter-/Seitenzähler, Zoom-Slider
  Export/
    exportPDF.ts          PDF via jsPDF + html2canvas
    exportDOCX.ts         DOCX via docx.js

lib/
  ai/
    AIService.ts          KI-Service-Interface
    aiContext.tsx          KI-Context Provider
    ocrImport.ts          OCR-Bild-zu-Text Import
    prompts.ts            System-Prompts für KI
    types.ts              KI-Typen
    providers/
      OpenAIProvider.ts   OpenAI-API Provider
  cloud/
    cloudDocumentService.ts  Cloud-Dokument CRUD
  hooks/
    useAutoSave.ts        Auto-Save Hook
  mailMerge/
    types.ts              Serienbrief-Typen
  templates/
    defaultTemplates.ts   Standard-Dokumentvorlagen
  types/
    document.ts           Dokumentstruktur
    styles.ts             Formatvorlagen
    comments.ts           Kommentar-Typen
    footnotes.ts          Fussnoten-Typen
    bibliography.ts       Bibliographie-Typen
    version.ts            Versionierungs-Typen
  constants/
    pageSizes.ts          Papierformate (A4, A5, Letter, etc.)
  appSettings.ts          Benutzereinstellungen
  defaultContent.ts       Standard-Dokumentinhalt
  defaultStyles.ts        Standard-Formatvorlagen
  defaultThemes.ts        6 Farbthemen
  documentContext.tsx      Dokument-Context Provider
  fileOperations.ts       Datei I/O (Öffnen, Speichern, Drucken)
  versionHistory.ts       Versionsverlauf-Logik
```

## Custom Tiptap Extensions

| Extension | Datei | Funktion |
|---|---|---|
| FontSize | `FontSize.ts` | Schriftgrösse (`pt`) |
| LineHeight | `LineHeight.ts` | Zeilenabstand |
| ParagraphSpacing | `ParagraphSpacing.ts` | Absatzabstand (vor/nach) |
| Indent | `Indent.ts` | Einzug (links/rechts) |
| PageBreak | `PageBreak.ts` | Seitenumbruch |
| SectionBreak | `SectionBreak.ts` | Abschnittsumbruch |
| ColumnLayout | `ColumnLayout.ts` | Mehrspalten-Layout |
| ColumnBreak | `ColumnBreak.ts` | Spaltenumbruch |
| ResizableImage | `ResizableImage.ts` | Bilder mit Grössenänderung |
| Shape | `Shape.ts` | Formen (Rechteck, Kreis, etc.) |
| TextBox | `TextBox.ts` | Textfelder |
| TabStop | `TabStop.ts` | Tabulatoren |
| Comment | `Comment.ts` | Kommentare |
| TrackInsert | `TrackInsert.ts` | Änderungsverfolgung (Einfügungen) |
| TrackDelete | `TrackDelete.ts` | Änderungsverfolgung (Löschungen) |
| FootnoteRef | `FootnoteRef.ts` | Fussnoten-Referenz |
| Citation | `Citation.ts` | Zitate |
| Bibliography | `Bibliography.ts` | Literaturverzeichnis |
| MergeField | `MergeField.ts` | Serienbrief-Felder |
| ParagraphBorder | `ParagraphBorder.ts` | Absatzrahmen |
| TableCellBackground | `TableCellBackground.ts` | Tabellenzellen-Hintergrund |
| AdvancedList | `AdvancedList.ts` | Erweiterte Listen |
| PasteHandler | `PasteHandler.ts` | Intelligentes Einfügen |

## Editor-Patterns

```tsx
// Tiptap Command-Chain
editor.chain().focus().toggleBold().run()

// Attribut setzen
editor.chain().focus().setFontSize('16pt').run()

// Status prüfen
editor.isActive('bold')
editor.isActive('textAlign', { textAlign: 'center' })

// Extension-Attribut prüfen
editor.getAttributes('textStyle').fontSize
```

## Electron-Integration

```tsx
// Type-Check
const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron

// Menü-Aktionen empfangen
window.electronAPI.onMenuAction((action: string) => { /* ... */ })
```

Nie direkt auf Node.js APIs zugreifen — immer über `window.electronAPI`.

## Konventionen

- Named Export: `export function Name() {}`
- Client Components: `'use client'` am Dateianfang
- Extensions: eine Datei pro Extension in `components/Editor/extensions/`
- Export-Module: eine Datei pro Format in `components/Export/`
- Imports: `@/*` (writer-intern) oder `@shared/*` (shared Modul)
- Styling: Tailwind CSS, ProseMirror-Stile in `globals.css`
- Icons: immer `lucide-react`
- Labels: Deutsch
