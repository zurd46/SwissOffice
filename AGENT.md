# Agent-Anweisungen für Claude Code

## Arbeitsweise

### Vor dem Coden

1. **Lies immer die relevante CLAUDE.md** des Moduls, in dem du arbeitest
2. **Lies bestehende Dateien** bevor du sie änderst — verstehe den Kontext
3. **Prüfe die Modulzugehörigkeit:** Writer (`writer/`), Tabulator (`tabulator/`), Meet (`meet/`), Cloud (`cloud/`), Shared (`shared/`), Electron (`client/`)
4. **Nutze die richtige Sprache:** UI-Texte Deutsch, Code/Variablen Englisch, Commits Englisch

### Während des Codens

- **Bestehende Patterns übernehmen** — schaue in benachbarte Dateien wie etwas gelöst wurde
- **Minimale Änderungen** — ändere nur was nötig ist, keine Refactorings nebenbei
- **Named Exports** — niemals `export default`
- **`'use client'`** nicht vergessen bei interaktiven Komponenten
- **Typen definieren** — kein `any`, nutze bestehende Types aus `lib/types/`

### Nach dem Coden

- **Lint laufen lassen** wenn du Dateien in writer/, tabulator/ oder meet/ geändert hast
- **TypeScript-Check** für cloud/: `cd cloud && bun run lint`
- **Nicht automatisch committen** — warte auf User-Anweisung

## Modul-spezifische Hinweise

### Writer (writer/)

- Editor-State wird über Tiptap verwaltet — keine eigenen State-Variablen für Editor-Inhalte
- Neue Extensions: eigene Datei unter `components/Editor/extensions/`, dann in `Editor.tsx` registrieren
- Electron-Features: immer `isElectron`-Check, da Writer auch im Browser läuft
- PageView.tsx verwaltet die A4-Darstellung — Seitengrösse nicht hardcoden
- Ribbon-Tabs: jeder Tab ist eine separate Datei unter `Ribbon/tabs/`
- Export-Module: `exportPDF.ts` und `exportDOCX.ts` sind unabhängig voneinander

### Tabulator (tabulator/)

- Formel-Engine: Parser → AST → Evaluator → Dependency Graph
- Grid nutzt Virtual Scrolling — nur sichtbare Zellen werden gerendert
- State liegt in `lib/state/` — kein externer State-Manager
- Neue Formeln: in der passenden Kategorie unter `lib/engine/functions/` hinzufügen

### Meet (meet/)

- Aktuell UI-Prototyp mit lokalen Mock-Daten
- 5 Contexts für State (Auth, Chat, Call, WebSocket, Notification)
- Shared Components in `components/Shared/` sind wiederverwendbar
- Backend-Anbindung läuft über `lib/api/meetApi.ts` → Cloud-API

### Cloud (cloud/)

- **Bun Runtime** — nicht Node.js-spezifische APIs verwenden
- Jede Route bekommt eine eigene Datei: `*.routes.ts`
- Jede Route braucht einen Zod-Validator: `*.validators.ts`
- Services enthalten die Business-Logik, Routes nur Routing + Validierung
- Neue Tabellen: eigene Datei unter `src/db/tables/`, re-export in `schema.ts`
- Nach Schema-Änderungen: `bun run db:generate && bun run db:migrate`
- Auth-Middleware setzt `c.get('user')` mit dem authentifizierten User

### Client (client/)

- **CommonJS** — kein `import`/`export`, nur `require`/`module.exports`
- Neue IPC-Kanäle: 1) `main.js` Handler → 2) `preload.js` exponieren → 3) Writer aufrufen
- Menü-Einträge in `menu.js` — Labels auf Deutsch
- Kein direkter Node.js-Zugriff im Renderer

### Shared (shared/)

- Nur Code der von mehreren Modulen gebraucht wird
- Öffentliche API in `index.ts` re-exportieren
- Keine modul-spezifische Logik

## Häufige Aufgaben

### Feature in Writer hinzufügen

1. Falls nötig: Extension unter `components/Editor/extensions/` erstellen
2. Extension in `Editor.tsx` registrieren
3. UI-Element in passendem Ribbon-Tab hinzufügen (`Ribbon/tabs/Tab*.tsx`)
4. Falls Dialog nötig: unter `components/Dialogs/` erstellen
5. `cd writer && npm run lint` prüfen

### Cloud-Endpoint hinzufügen

1. Validator in `src/validators/` erstellen
2. Service-Logik in `src/services/` implementieren
3. Route in `src/routes/` erstellen mit Auth-Middleware + Zod-Validierung
4. Route in `src/routes/index.ts` einbinden
5. Falls nötig: Tabelle unter `src/db/tables/` + Migration

### Shared Code hinzufügen

1. Datei im passenden Unterverzeichnis erstellen
2. In `shared/index.ts` re-exportieren
3. In den Modulen via `@shared/*` importieren

### Neuen Dialog erstellen

```tsx
// writer/components/Dialogs/MeinDialog.tsx
'use client'

import { X } from 'lucide-react'

interface MeinDialogProps {
  open: boolean
  onClose: () => void
}

export function MeinDialog({ open, onClose }: MeinDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[480px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Dialog-Titel</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Inhalt */}
      </div>
    </div>
  )
}
```

## Nicht machen

- Keine `default exports`
- Keine neuen Dependencies ohne Begründung
- Keine Node.js-APIs im Electron Renderer
- Keine hardcodierten Seitengrössen (nutze `lib/constants/pageSizes.ts`)
- Keine `any` Typen
- Keine automatischen Commits oder Pushes
- Keine unnötigen Refactorings oder Code-Cleanups
- Keine englischen UI-Texte
