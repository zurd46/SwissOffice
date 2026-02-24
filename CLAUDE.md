# ImpulsOffice

Modulare Open-Source Office-Suite als Electron-Desktop-App mit Next.js-Frontend und Hono-Backend.

## Architektur

Monorepo mit 6 aktiven Modulen + Shared Library:

```
ImpulsOffice/
├── writer/       Next.js 16 — Textverarbeitung (Tiptap 3, Port 3000)
├── client/       Electron 33 — Desktop-Shell für Writer
├── tabulator/    Next.js 16 — Tabellenkalkulation (Port 3001)
├── meet/         Next.js 16 — Kommunikation: Chat, Kalender, Calls (Port 3002, UI-Prototyp)
├── cloud/        Hono 4 + Bun — Backend-API (Port 4000)
├── shared/       Gemeinsamer Code (Auth, API-Client, WebSocket, Contexts)
├── email/        (Geplant) E-Mail-Client
├── data/         (Geplant) Zentrale Datenschicht
└── docs/         Projektdokumentation
```

### Modulbeziehungen

- `writer/`, `tabulator/`, `meet/` importieren aus `shared/` via `@shared/*` Path-Alias
- `client/` lädt `writer/` als Renderer via Electron BrowserWindow
- Alle Frontends kommunizieren mit `cloud/` via REST-API (Port 4000)
- IPC zwischen Electron und Writer: `client/preload.js` → `window.electronAPI`

## Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Frontend-Framework | Next.js 16 (App Router, React 19, TypeScript 5 strict) |
| Editor-Engine | Tiptap 3.20 (23 Custom + 15 Built-in Extensions) |
| Desktop-Shell | Electron 33 + electron-builder (CommonJS) |
| Styling | Tailwind CSS 4 + Lucide Icons |
| Backend | Hono 4 + Bun Runtime |
| Datenbank | SQLite + Drizzle ORM |
| Auth | JWT (jose 5), Argon2id |
| Validierung | Zod 3.23 |

## Entwicklung

```bash
# Frontend-Module (jeweils im Modulverzeichnis)
cd writer && npm run dev          # http://localhost:3000
cd tabulator && npm run dev       # http://localhost:3001
cd meet && npm run dev            # http://localhost:3002

# Electron Desktop-App (Writer)
cd client && npm run dev          # Startet Next.js + Electron

# Cloud Backend
cd cloud && bun run dev           # http://localhost:4000

# Lint (pro Modul)
cd writer && npm run lint
cd tabulator && npm run lint
cd cloud && bun run lint

# Build
cd writer && npm run build        # Next.js Production
cd client && npm run build        # Electron-Packaging
cd client && npm run dist         # Installer (macOS + Windows + Linux)
cd cloud && bun run start         # Production Server

# Datenbank (Cloud)
cd cloud && bun run db:generate   # Drizzle Migrations generieren
cd cloud && bun run db:migrate    # Migrations ausführen
cd cloud && bun run db:push       # Schema direkt pushen
cd cloud && bun run db:studio     # Drizzle Studio
```

## Code-Konventionen

### TypeScript / React (writer/, tabulator/, meet/)

- **Strict TypeScript** — `strict: true` in allen tsconfig.json
- **Named Exports** — `export function Name() {}`, niemals `export default`
- **`'use client'`** — Pflicht für alle interaktiven Komponenten
- **Path-Alias** — `@/*` (modulintern), `@shared/*` (shared/ Modul)
- **Styling** — Tailwind CSS Utility-Klassen, globale Stile in `app/globals.css`
- **Icons** — Ausschliesslich `lucide-react`
- **Funktionale Komponenten** — Keine Klassen-Komponenten

### Electron (client/)

- **CommonJS** — `require()` / `module.exports`, kein TypeScript
- **Context Isolation** — `contextIsolation: true`, `nodeIntegration: false`
- **IPC** — Immer via `preload.js`, nie direkt Node.js im Renderer

### Cloud Backend (cloud/)

- **Hono 4** mit Bun Runtime
- **Drizzle ORM** für SQLite — Schema in `src/db/tables/`
- **Zod** für Request-Validierung auf allen Endpoints
- **JWT** via jose — Access + Refresh Tokens
- **ES Modules** — `import`/`export`

### Allgemein

- **UI-Sprache:** Deutsch — alle Labels, Menüs, Platzhalter, Fehlermeldungen
- **Dateiformate:** `.impuls` (Writer, JSON), `.impuls-tabelle` (Tabulator, JSON)
- **Seitenlayout (Writer):** A4 (210mm x 297mm), 25mm Margins
- **Commit-Style:** Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)

## Datei-Übersicht

### Writer — Schlüsseldateien

| Datei | Zweck |
|---|---|
| `writer/components/Editor/Editor.tsx` | Haupt-Editor (Tiptap Setup, Electron IPC, State) |
| `writer/components/Toolbar/MenuBar.tsx` | Menüleiste (Datei, Bearbeiten, Format, etc.) |
| `writer/components/Toolbar/Ribbon/RibbonToolbar.tsx` | Ribbon-UI Container mit 7 Tabs |
| `writer/components/Toolbar/Ribbon/tabs/` | 7 Ribbon-Tabs (Start, Einfuegen, Seitenlayout, ...) |
| `writer/components/Editor/extensions/` | 23 Custom Tiptap Extensions |
| `writer/components/Export/exportPDF.ts` | PDF-Export (jsPDF + html2canvas) |
| `writer/components/Export/exportDOCX.ts` | DOCX-Export (docx.js) |
| `writer/components/AI/` | KI-Integration (Chat-Sidebar, Settings, Provider) |
| `writer/components/Dialogs/` | Modale Dialoge (CloudSave, FindReplace, PageSetup, ...) |
| `writer/lib/fileOperations.ts` | Datei I/O (Speichern, Laden, Drucken) |
| `writer/lib/ai/` | AI-Service, Prompts, Provider, OCR Import |
| `writer/lib/cloud/cloudDocumentService.ts` | Cloud-Dokumentenverwaltung |
| `writer/lib/documentContext.tsx` | Dokument-Context Provider |
| `writer/lib/types/` | TypeScript-Typen (document, styles, comments, ...) |

### Client — Alle Dateien

| Datei | Zweck |
|---|---|
| `client/main.js` | Electron Main Process — BrowserWindow, IPC Handler |
| `client/preload.js` | Context Bridge — `window.electronAPI` |
| `client/menu.js` | Native Menü (Datei, Bearbeiten, Format, Ansicht, Hilfe) |
| `client/dev.js` | Dev-Script — Startet Next.js + Electron parallel |

### Cloud — Struktur

| Verzeichnis | Zweck |
|---|---|
| `cloud/src/routes/` | API-Routen: auth, documents, calendar, contacts, chat, teams, files, calls, email |
| `cloud/src/middleware/` | Auth (JWT), CORS, Error Handler |
| `cloud/src/db/tables/` | 25+ Drizzle-Tabellen (users, documents, events, messages, ...) |
| `cloud/src/services/` | Business-Logik |
| `cloud/src/validators/` | Zod-Schemas |
| `cloud/src/types/` | TypeScript-Typen |

### Shared

| Datei | Zweck |
|---|---|
| `shared/api/client.ts` | HTTP-Client für Cloud-API |
| `shared/api/tokenManager.ts` | JWT Token-Verwaltung (Storage + Auto-Refresh) |
| `shared/contexts/AuthContext.tsx` | Auth-State Provider |
| `shared/contexts/CloudContext.tsx` | Cloud-Integration Provider |
| `shared/components/AuthGuard.tsx` | Route-Schutz |
| `shared/ws/wsClient.ts` | WebSocket-Client |

## Regeln

1. Alle neuen UI-Texte auf **Deutsch**
2. **Keine neuen Dependencies** ohne Begründung
3. **Named Exports** — niemals `export default`
4. **Tiptap Extensions** als separate Dateien unter `components/Editor/extensions/`
5. **Export-Formate** als separate Dateien unter `components/Export/`
6. **Electron IPC** immer über `preload.js`, nie direkter Node.js-Zugriff
7. Neue Komponenten folgen der **Ordnerstruktur:** `components/{Kategorie}/{Name}.tsx`
8. **Shared Code** gehört nach `shared/`, nicht in einzelne Module duplizieren
9. **Cloud-Routen** validieren alle Inputs mit Zod
10. **Datenbank-Schema-Änderungen** erfordern eine Drizzle-Migration

## Häufige Patterns

### Neue Tiptap Extension erstellen

```tsx
// writer/components/Editor/extensions/MeineExtension.ts
import { Extension } from '@tiptap/core'

export const MeineExtension = Extension.create({
  name: 'meineExtension',
  // ...
})
```

Dann in `Editor.tsx` im `extensions`-Array registrieren.

### Neue Cloud-Route hinzufügen

```ts
// cloud/src/routes/meine-route.ts
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

const app = new Hono()
app.use('*', authMiddleware)
// Routes hier...
export default app
```

In `cloud/src/app.ts` einbinden.

### Neuer Dialog

```tsx
// writer/components/Dialogs/MeinDialog.tsx
'use client'
export function MeinDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Dialog-Logik
}
```

### Electron IPC erweitern

1. Handler in `client/main.js` registrieren: `ipcMain.handle('kanal', ...)`
2. In `client/preload.js` exponieren: `contextBridge.exposeInMainWorld(...)`
3. In Writer via `window.electronAPI.kanal()` aufrufen
