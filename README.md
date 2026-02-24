<div align="center">

<h1>ImpulsOffice</h1>

<p><strong>Open-Source Office-Suite — modern, schnell, plattformuebergreifend.</strong></p>

<p>
Eine professionelle Desktop-Office-Suite als leichtgewichtige Alternative zu Microsoft Office.<br/>
Textverarbeitung, Tabellenkalkulation, Kommunikation und Cloud-Backend — alles aus einem Monorepo.
</p>

<p>
<a href="#schnellstart">Schnellstart</a> &nbsp;&bull;&nbsp;
<a href="#module">Module</a> &nbsp;&bull;&nbsp;
<a href="#tech-stack">Tech-Stack</a> &nbsp;&bull;&nbsp;
<a href="#projektstruktur">Struktur</a> &nbsp;&bull;&nbsp;
<a href="#roadmap">Roadmap</a> &nbsp;&bull;&nbsp;
<a href="#mitwirken">Mitwirken</a>
</p>

<p>
<img src="https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white" alt="Electron" />
<img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" alt="Next.js" />
<img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/Hono-4-E36002?logo=hono&logoColor=white" alt="Hono" />
<img src="https://img.shields.io/badge/Bun-Runtime-f9f1e1?logo=bun&logoColor=black" alt="Bun" />
<img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
<img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Platform" />
</p>

</div>

---

## Uebersicht

ImpulsOffice ist eine modulare Office-Suite mit dem Ziel, eine moderne, performante und erweiterbare Alternative zu klassischen Office-Anwendungen bereitzustellen. Das Projekt ist als Monorepo organisiert — jedes Modul lebt in einem eigenen Verzeichnis.

---

## Module

| Modul | Verzeichnis | Status | Beschreibung |
|-------|-------------|--------|--------------|
| **Writer** | `writer/` + `client/` | Aktiv | Professionelle Textverarbeitung mit Ribbon-UI |
| **Tabulator** | `tabulator/` | Aktiv | Tabellenkalkulation mit Grid-Editor |
| **Meet** | `meet/` | Aktiv | Kommunikation — Chat, Kalender, Kontakte, Videoanrufe, Dateien, Teams |
| **Cloud** | `cloud/` | Aktiv | Backend-API — Auth, Dokumente, Kalender, Kontakte, Versionierung |
| **Email** | `email/` | Geplant | E-Mail-Client |
| **Data** | `data/` | Geplant | Zentrale Datenschicht |

---

### Writer — Textverarbeitung

Desktop-Textverarbeitung (Word-Alternative) mit Office-aehnlicher Ribbon-UI, gebaut mit Next.js und Tiptap.

- Schriftart, -groesse, -farbe, Hervorhebung, Hoch-/Tiefgestellt
- Ueberschriften H1–H6, Absatzausrichtung, Zeilenabstand, Einzuege
- Tabellen, Bilder, Links, Seitenumbrueche, Listen, Checklisten
- A4-WYSIWYG-Ansicht mit Zoom (25–200 %)
- `.impuls`-Format (JSON), Export als **PDF**, **DOCX**, **HTML**
- Suchen & Ersetzen, Undo/Redo, Woerter-/Seitenzaehlung
- Ribbon-Toolbar (Start, Einfuegen, Seitenlayout, Ansicht)
- Dark-Mode-Unterstuetzung

### Tabulator — Tabellenkalkulation

Tabellenkalkulation (Excel-Alternative) mit Grid-basiertem Editor, gebaut mit Next.js.

- Grid-Editor mit Zellenbearbeitung
- Formelleiste (FormulaBar)
- Mehrere Arbeitsblaetter (SheetTabs)
- Toolbar fuer Formatierung
- Statusleiste
- Export-Funktionen

### Meet — Kommunikation

Kommunikationsplattform (Teams-Alternative), gebaut mit Next.js.

- **Chat** — Einzel- und Gruppenchats mit Emoji-Support
- **Kalender** — Terminplanung und -verwaltung
- **Kontakte** — Kontaktverwaltung
- **Anrufe** — Video- und Audioanrufe
- **Dateien** — Dateiaustausch mit Drag & Drop
- **Teams** — Teamverwaltung und -organisation
- **Benachrichtigungen** — Echtzeit-Benachrichtigungen
- **Einstellungen** — Benutzerkonfiguration

### Cloud — Backend-API

Zentrales Backend fuer die gesamte Suite, gebaut mit Hono und Bun.

- **Auth** — JWT-basierte Authentifizierung (Access + Refresh Tokens)
- **Dokumente** — Dokumentenspeicherung und -verwaltung
- **Versionierung** — Dokumentversionen
- **Kalender** — Kalender-API mit iCal-Support und Wiederholungsregeln
- **Kontakte** — Kontakte-API
- **Shares** — Freigaben und Berechtigungen
- **Datenbank** — SQLite via Drizzle ORM
- **Microsoft Graph** — OAuth2-Integration fuer E-Mail

---

## Tech-Stack

| Bereich | Technologie | Version |
|---------|-------------|---------|
| **Frontend-Framework** | Next.js (App Router) | 16 |
| **UI** | React + TypeScript | 19 / 5 |
| **Editor-Engine** | Tiptap (25+ Extensions) | 3 |
| **Desktop-Shell** | Electron + electron-builder | 33 |
| **Styling** | Tailwind CSS + Lucide Icons | 4 |
| **Backend-Framework** | Hono | 4 |
| **Runtime (Backend)** | Bun | latest |
| **Datenbank** | SQLite + Drizzle ORM | — |
| **Auth** | JWT via jose | 5 |
| **PDF-Export** | jsPDF + html2canvas | 4 / 1.4 |
| **DOCX-Export** | docx.js | 9 |

---

## Projektstruktur

```
ImpulsOffice/
│
├── writer/                  # Next.js — Textverarbeitung (Frontend)
│   ├── app/                 #   Pages & Layout (App Router)
│   ├── components/
│   │   ├── Editor/          #   Tiptap-Editor + Custom Extensions
│   │   ├── Toolbar/         #   Ribbon-Toolbar mit Tab-Komponenten
│   │   ├── Sidebar/         #   Inhaltsverzeichnis
│   │   ├── StatusBar/       #   Dokumentinfos & Zoom
│   │   ├── Dialogs/         #   Suchen & Ersetzen
│   │   └── Export/          #   PDF- & DOCX-Export-Logik
│   └── lib/                 #   Dateioperationen & Default-Content
│
├── client/                  # Electron Desktop-Wrapper
│   ├── main.js              #   Main Process (BrowserWindow, IPC)
│   ├── preload.js           #   Secure IPC Bridge (Context Isolation)
│   ├── menu.js              #   Native Menues
│   └── resources/           #   App-Icons (icns, ico, png)
│
├── tabulator/               # Next.js — Tabellenkalkulation
│   ├── app/                 #   Pages & Layout
│   └── components/
│       ├── Grid/            #   Grid-Editor
│       ├── FormulaBar/      #   Formelleiste
│       ├── Toolbar/         #   Formatierungs-Toolbar
│       ├── SheetTabs/       #   Arbeitsblaetter
│       ├── StatusBar/       #   Statusleiste
│       └── Dialogs/         #   Dialoge
│
├── meet/                    # Next.js — Kommunikation
│   ├── app/                 #   Pages & Layout
│   ├── components/
│   │   ├── Chat/            #   Chat-Funktionalitaet
│   │   ├── Calendar/        #   Kalender
│   │   ├── Call/            #   Video-/Audioanrufe
│   │   ├── Contacts/        #   Kontaktverwaltung
│   │   ├── Files/           #   Dateiaustausch
│   │   ├── Teams/           #   Teamverwaltung
│   │   ├── Notifications/   #   Benachrichtigungen
│   │   ├── Settings/        #   Einstellungen
│   │   ├── Layout/          #   Layout-Komponenten
│   │   └── Shared/          #   Gemeinsame Komponenten
│   └── lib/                 #   Hilfsfunktionen
│
├── cloud/                   # Hono + Bun — Backend-API
│   └── src/
│       ├── routes/          #   API-Routen (Auth, Docs, Calendar, …)
│       ├── services/        #   Business-Logik
│       ├── db/              #   Drizzle Schema & Migrations
│       ├── middleware/       #   Auth-Middleware
│       ├── validators/      #   Zod-Validierung
│       ├── config/          #   Umgebungsvariablen
│       └── types/           #   TypeScript-Typen
│
├── email/                   # (Geplant) E-Mail-Client
├── data/                    # (Geplant) Zentrale Datenschicht
│
└── docs/                    # Projektdokumentation
```

---

## Schnellstart

### Voraussetzungen

- [Node.js](https://nodejs.org/) >= 18 (inkl. npm)
- [Bun](https://bun.sh/) (fuer Cloud-Backend)
- Git

### Installation

```bash
git clone https://github.com/<dein-username>/ImpulsOffice.git
cd ImpulsOffice

# Writer
cd writer && npm install && cd ..

# Electron Client
cd client && npm install && cd ..

# Tabulator
cd tabulator && npm install && cd ..

# Meet
cd meet && npm install && cd ..

# Cloud Backend
cd cloud && bun install && cd ..
```

### Entwicklung starten

```bash
# Writer Desktop-App (Electron + Next.js)
cd client && npm run dev          # → Electron mit DevTools

# Writer nur Web
cd writer && npm run dev          # → http://localhost:3000

# Tabulator
cd tabulator && npm run dev       # → http://localhost:3001

# Meet
cd meet && npm run dev            # → http://localhost:3002

# Cloud Backend
cd cloud && bun run dev           # → http://localhost:4000
```

### Production Build

```bash
# Writer Desktop-App
cd client
npm run build       # Build fuer aktuelle Plattform
npm run dist        # Installer fuer macOS + Windows

# Tabulator
cd tabulator && npm run build

# Meet
cd meet && npm run build

# Cloud
cd cloud && bun run start
```

---

## Scripts

### `writer/` (Next.js)

| Script | Beschreibung |
|--------|-------------|
| `npm run dev` | Startet Next.js Dev-Server (Port 3000) |
| `npm run build` | Production Build |
| `npm run lint` | Linting mit ESLint |

### `client/` (Electron)

| Script | Beschreibung |
|--------|-------------|
| `npm run dev` | Startet Electron + Next.js (Development) |
| `npm run build` | Next.js Build + Electron-Packaging |
| `npm run dist` | Erstellt Installer (macOS + Windows) |

### `tabulator/` (Next.js)

| Script | Beschreibung |
|--------|-------------|
| `npm run dev` | Startet Dev-Server (Port 3001) |
| `npm run build` | Production Build |
| `npm run lint` | Linting mit ESLint |

### `meet/` (Next.js)

| Script | Beschreibung |
|--------|-------------|
| `npm run dev` | Startet Dev-Server (Port 3002) |
| `npm run build` | Production Build |
| `npm run lint` | Linting mit ESLint |

### `cloud/` (Hono + Bun)

| Script | Beschreibung |
|--------|-------------|
| `bun run dev` | Startet Dev-Server mit Hot-Reload (Port 4000) |
| `bun run start` | Startet Production Server |
| `bun run lint` | TypeScript Type-Check |
| `bun run db:generate` | Drizzle Migrations generieren |
| `bun run db:migrate` | Migrations ausfuehren |
| `bun run db:push` | Schema direkt pushen |
| `bun run db:studio` | Drizzle Studio oeffnen |

---

## Tastaturkuerzel (Writer)

| Aktion | Shortcut |
|--------|----------|
| Neues Dokument | `Ctrl/Cmd + N` |
| Oeffnen | `Ctrl/Cmd + O` |
| Speichern | `Ctrl/Cmd + S` |
| Drucken | `Ctrl/Cmd + P` |
| Rueckgaengig | `Ctrl/Cmd + Z` |
| Wiederherstellen | `Ctrl/Cmd + Y` |
| Suchen & Ersetzen | `Ctrl/Cmd + H` |

---

## Unterstuetzte Dateiformate (Writer)

| Format | Lesen | Schreiben | Beschreibung |
|--------|:-----:|:---------:|--------------|
| `.impuls` | Ja | Ja | Natives JSON-Format (verlustfrei) |
| `.html` | — | Ja | HTML-Export |
| `.pdf` | — | Ja | PDF-Export via html2canvas + jsPDF |
| `.docx` | — | Ja | Word-Export via docx.js |

---

## Roadmap

### Writer
- [x] Tiptap-Editor mit 25+ Extensions
- [x] Ribbon-Toolbar (Office-Style mit Tabs)
- [x] PDF-, DOCX- & HTML-Export
- [x] Electron Desktop-App mit nativen Menues
- [x] Suchen & Ersetzen
- [x] Inhaltsverzeichnis-Sidebar
- [x] Dark-Mode-Unterstuetzung
- [ ] Formatvorlagen / Style Templates
- [ ] Kopf- & Fusszeilen mit Seitenzahlen
- [ ] Rechtschreibpruefung

### Tabulator
- [x] Grid-Editor mit Zellenbearbeitung
- [x] Formelleiste
- [x] Mehrere Arbeitsblaetter
- [ ] Formelberechnung
- [ ] Diagramme
- [ ] Import/Export (CSV, XLSX)

### Meet
- [x] Chat mit Emoji-Support
- [x] Kalender
- [x] Kontaktverwaltung
- [x] Dateiaustausch
- [x] Teamverwaltung
- [ ] Video-/Audioanrufe (WebRTC)
- [ ] Echtzeit-Messaging (WebSocket)

### Cloud
- [x] JWT-Authentifizierung
- [x] Dokumente-API mit Versionierung
- [x] Kalender-API mit iCal & Wiederholungsregeln
- [x] Kontakte-API
- [x] Freigaben-System
- [ ] Echtzeit-Collaboration (CRDT/OT)
- [ ] Microsoft Graph E-Mail-Integration
- [ ] Datei-Synchronisation

### Suite-uebergreifend
- [ ] E-Mail-Client
- [ ] Auto-Save & Dokumentversionierung
- [ ] Gemeinsame Benutzerverwaltung
- [ ] Einheitliches Design-System

---

## Mitwirken

Beitraege sind willkommen!

1. Repository **forken**
2. Feature-Branch erstellen: `git checkout -b feature/mein-feature`
3. Aenderungen committen: `git commit -m 'feat: mein neues Feature'`
4. Branch pushen: `git push origin feature/mein-feature`
5. **Pull Request** erstellen

---

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

---

<div align="center">
<sub>Gebaut mit Next.js, Electron, Tiptap, Hono & Bun</sub>
</div>
