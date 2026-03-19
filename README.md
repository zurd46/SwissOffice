<div align="center">

<h1>SwissOffice</h1>

<p><strong>Open-Source Office-Suite — modern, schnell, plattformübergreifend.</strong></p>

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

## Übersicht

SwissOffice ist eine modulare Office-Suite mit dem Ziel, eine moderne, performante und erweiterbare Alternative zu klassischen Office-Anwendungen bereitzustellen. Das Projekt ist als Monorepo organisiert — jedes Modul lebt in einem eigenen Verzeichnis.

---

## Module

| Modul | Verzeichnis | Status | Beschreibung |
|-------|-------------|--------|--------------|
| **Writer** | `writer/` + `client/` | Aktiv | Professionelle Textverarbeitung mit Ribbon-UI |
| **Tabulator** | `tabulator/` | Aktiv | Tabellenkalkulation mit Formel-Engine |
| **Meet** | `meet/` | UI-Prototyp | Kommunikation — Chat, Kalender, Anrufe, Teams (noch ohne Backend) |
| **Cloud** | `cloud/` | Aktiv | Backend-API — Auth, Dokumente, Kalender, Kontakte, Versionierung |
| **Email** | `email/` | Geplant | E-Mail-Client |
| **Data** | `data/` | Geplant | Zentrale Datenschicht |

---

### Writer — Textverarbeitung

Desktop-Textverarbeitung (Word-Alternative) mit Office-ähnlicher Ribbon-UI, gebaut mit Next.js und Tiptap.

- 23 Custom Extensions + 15+ Built-in Extensions (Tiptap 3)
- Ribbon-Toolbar mit 7 Tabs (Start, Einfügen, Seitenlayout, Überprüfen, Sendungen, Ansicht, KI)
- Schriftart, -größe, -farbe, Hervorhebung, Hoch-/Tiefgestellt
- Überschriften H1–H6, Absatzausrichtung, Zeilenabstand, Einzüge
- Tabellen, Bilder, Links, Seitenumbrüche, Listen, Checklisten
- A4-WYSIWYG-Ansicht mit Zoom (25–200 %)
- `.impuls`-Format (JSON), Export als **PDF**, **DOCX**, **HTML**
- Suchen & Ersetzen, Undo/Redo, Wörter-/Seitenzählung
- Formatvorlagen (6 Themes) und Dokumentvorlagen
- Kopf-/Fußzeilen mit Seitenzahlen
- Kommentar-System und Änderungsverfolgung
- Rechtschreibprüfung (Browser-basiert, mehrsprachig)

### Tabulator — Tabellenkalkulation

Tabellenkalkulation (Excel-Alternative) mit Grid-basiertem Editor und vollständiger Formel-Engine, gebaut mit Next.js.

- Grid-Editor mit Zellenbearbeitung, Tastaturnavigation und Kontextmenü
- Formel-Engine mit 40+ Funktionen (Mathe, Logik, Text, Statistik)
- Abhängigkeitsgraph für effiziente Neuberechnung
- Formelleiste (FormulaBar) mit Funktionseinfügung
- Mehrere Arbeitsblätter (SheetTabs) mit Umbenennen/Duplizieren
- Ribbon-Toolbar mit 5 Tabs (Start, Formeln, Daten, Einfügen, Seitenlayout)
- Bedingte Formatierung (13+ Regeltypen)
- Datenvalidierung und Auto-Fill
- CSV Import/Export (RFC 4180), natives `.impuls-tabelle`-Format
- Zellformatierung (Schrift, Farben, Rahmen, Zahlenformate, Zusammenführen)
- Suchen & Ersetzen, Undo/Redo, Sortierung, Filter
- Statusleiste mit Summe/Durchschnitt/Anzahl und Zoom

### Meet — Kommunikation

Kommunikationsplattform (Teams-Alternative), gebaut mit Next.js. Aktuell als UI-Prototyp mit lokaler Datenhaltung — noch ohne Backend-Anbindung.

- **Chat** — Einzel-/Gruppenchats, Dateianhänge, Reaktionen, Antworten, Emoji-Picker
- **Kalender** — Tag/Woche/Monat-Ansichten, Terminplanung, wiederkehrende Termine
- **Anrufe** — Anrufverlauf, Grid-/Speaker-Ansicht, Mediensteuerung (UI-Mockup, kein WebRTC)
- **Teams** — Teamstruktur mit Kanälen (öffentlich, privat, Ankündigungen)
- **Dateien** — Dateiliste mit Filter, Grid-/Listenansicht, Drag & Drop
- **Benachrichtigungen** — 9 Benachrichtigungstypen, Gelesen-Markierung
- **Einstellungen** — Profil, Audio/Video, Benachrichtigungen, Darstellung, Datenschutz

### Cloud — Backend-API

Zentrales Backend für die gesamte Suite, gebaut mit Hono und Bun.

- **Auth** — JWT-basierte Authentifizierung (Access + Refresh Tokens, Argon2id)
- **Dokumente** — CRUD mit Zugriffskontrolle (Owner/Read/Write)
- **Versionierung** — Dokumentversionen mit Snapshots und Wiederherstellung
- **Kalender** — Kalender-/Event-API mit iCal-Export/Import und Wiederholungsregeln
- **Kontakte** — Kontakte und Kontaktgruppen mit Volltextsuche
- **Shares** — Freigaben und Berechtigungen pro Dokument
- **Microsoft Graph** — OAuth2-Flow, Kontakt- und Kalender-Import
- **Datenbank** — SQLite via Drizzle ORM, Zod-Validierung auf allen Endpoints

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
SwissOffice/
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
│   ├── menu.js              #   Native Menüs
│   └── resources/           #   App-Icons (icns, ico, png)
│
├── tabulator/               # Next.js — Tabellenkalkulation
│   ├── app/                 #   Pages & Layout
│   └── components/
│       ├── Grid/            #   Grid-Editor
│       ├── FormulaBar/      #   Formelleiste
│       ├── Toolbar/         #   Formatierungs-Toolbar
│       ├── SheetTabs/       #   Arbeitsblätter
│       ├── StatusBar/       #   Statusleiste
│       └── Dialogs/         #   Dialoge
│
├── meet/                    # Next.js — Kommunikation
│   ├── app/                 #   Pages & Layout
│   ├── components/
│   │   ├── Chat/            #   Chat-Funktionalität
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
- [Bun](https://bun.sh/) (für Cloud-Backend)
- Git

### Installation

```bash
git clone https://github.com/<dein-username>/SwissOffice.git
cd SwissOffice

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
npm run build       # Build für aktuelle Plattform
npm run dist        # Installer für macOS + Windows

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
| `bun run db:migrate` | Migrations ausführen |
| `bun run db:push` | Schema direkt pushen |
| `bun run db:studio` | Drizzle Studio öffnen |

---

## Tastaturkürzel (Writer)

| Aktion | Shortcut |
|--------|----------|
| Neues Dokument | `Ctrl/Cmd + N` |
| Öffnen | `Ctrl/Cmd + O` |
| Speichern | `Ctrl/Cmd + S` |
| Drucken | `Ctrl/Cmd + P` |
| Rückgängig | `Ctrl/Cmd + Z` |
| Wiederherstellen | `Ctrl/Cmd + Y` |
| Suchen & Ersetzen | `Ctrl/Cmd + H` |

---

## Unterstützte Dateiformate (Writer)

| Format | Lesen | Schreiben | Beschreibung |
|--------|:-----:|:---------:|--------------|
| `.impuls` | Ja | Ja | Natives JSON-Format (verlustfrei) |
| `.html` | — | Ja | HTML-Export |
| `.pdf` | — | Ja | PDF-Export via html2canvas + jsPDF |
| `.docx` | — | Ja | Word-Export via docx.js |

---

## Roadmap

### Writer
- [x] Tiptap-Editor mit 38+ Extensions (23 Custom + 15+ Built-in)
- [x] Ribbon-Toolbar mit 7 Tabs (Start, Einfügen, Seitenlayout, Überprüfen, Sendungen, Ansicht, KI)
- [x] PDF-, DOCX- & HTML-Export
- [x] Electron Desktop-App mit nativen Menüs
- [x] Suchen & Ersetzen
- [x] Inhaltsverzeichnis-Sidebar
- [x] Formatvorlagen (6 Themes) & Dokumentvorlagen
- [x] Kopf- & Fußzeilen mit Seitenzahlen
- [x] Rechtschreibprüfung (Browser-basiert, mehrsprachig)
- [x] Kommentar-System & Änderungsverfolgung
- [ ] Dark Mode
- [ ] IMPULS-Datei Import (Lesen)
- [ ] Erweiterte Rechtschreibprüfung (eigenes Wörterbuch)

### Tabulator
- [x] Grid-Editor mit Zellenbearbeitung & Tastaturnavigation
- [x] Formelleiste mit Funktionseinfügung
- [x] Mehrere Arbeitsblätter (Umbenennen, Duplizieren, Löschen)
- [x] Formel-Engine mit 40+ Funktionen (Mathe, Logik, Text, Statistik)
- [x] Abhängigkeitsgraph & intelligente Neuberechnung
- [x] Ribbon-Toolbar mit 5 Tabs
- [x] Bedingte Formatierung (13+ Regeltypen)
- [x] Datenvalidierung & Auto-Fill
- [x] CSV Import/Export (RFC 4180)
- [x] Zellformatierung (Schrift, Farben, Rahmen, Zahlenformate, Zusammenführen)
- [x] Suchen & Ersetzen, Sortierung, Filter
- [x] Undo/Redo
- [ ] Diagramme
- [ ] XLSX Import/Export
- [ ] PDF-Export

### Meet (UI-Prototyp — noch ohne Backend-Anbindung)
- [x] Chat UI (Einzel-/Gruppenchats, Reaktionen, Antworten, Emoji-Picker)
- [x] Kalender UI (Tag/Woche/Monat, Terminplanung)
- [x] Anruf UI (Verlauf, Grid-/Speaker-Ansicht, Mediensteuerung)
- [x] Teams UI (Kanäle, Teamstruktur)
- [x] Dateien UI (Dateiliste, Filter, Drag & Drop)
- [x] Benachrichtigungen UI (9 Typen)
- [x] Einstellungen (Profil, Darstellung, Datenschutz)
- [ ] Backend-Anbindung (Cloud-API)
- [ ] Echtzeit-Messaging (WebSocket)
- [ ] Video-/Audioanrufe (WebRTC)
- [ ] Kontaktverwaltung (Seite fehlt noch)

### Cloud
- [x] JWT-Authentifizierung (Access + Refresh Tokens, Argon2id)
- [x] Dokumente-API mit Zugriffskontrolle
- [x] Versionierung mit Snapshots & Wiederherstellung
- [x] Kalender-API mit iCal-Export/Import & Wiederholungsregeln
- [x] Kontakte-API mit Gruppen & Volltextsuche
- [x] Freigaben-System (Read/Write pro Dokument)
- [x] Microsoft Graph OAuth2-Flow & Kontakt-/Kalender-Import
- [x] Zod-Validierung auf allen Endpoints
- [ ] Echtzeit-Collaboration (CRDT/OT)
- [ ] E-Mail-Versand via Microsoft Graph
- [ ] Bidirektionale Microsoft-Synchronisation
- [ ] Datei-Synchronisation

### Suite-übergreifend
- [ ] E-Mail-Client
- [ ] Meet-Backend-Integration
- [ ] Auto-Save & Dokumentversionierung im Client
- [ ] Gemeinsame Benutzerverwaltung
- [ ] Einheitliches Design-System

---

## Mitwirken

Beiträge sind willkommen!

1. Repository **forken**
2. Feature-Branch erstellen: `git checkout -b feature/mein-feature`
3. Änderungen committen: `git commit -m 'feat: mein neues Feature'`
4. Branch pushen: `git push origin feature/mein-feature`
5. **Pull Request** erstellen

---

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

---

<div align="center">
<sub>Gebaut mit Next.js, Electron, Tiptap, Hono & Bun</sub>
</div>
