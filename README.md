<div align="center">

<h1>ImpulsWriter</h1>

<p><strong>Open-Source Office-Suite — modern, schnell, plattformuebergreifend.</strong></p>

<p>
Eine professionelle Desktop-Office-Suite als leichtgewichtige Alternative zu Microsoft Office.<br/>
Gebaut mit Next.js, Electron und Tiptap. Verfuegbar fuer macOS, Windows und Linux.
</p>

<p>
<a href="#schnellstart">Schnellstart</a> &nbsp;&bull;&nbsp;
<a href="#features">Features</a> &nbsp;&bull;&nbsp;
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
<img src="https://img.shields.io/badge/Tiptap-3-1a1a2e?logo=data:image/svg+xml;base64,&logoColor=white" alt="Tiptap" />
<img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
<img src="https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Platform" />
</p>

</div>

---

## Uebersicht

ImpulsWriter ist eine modulare Office-Suite mit dem Ziel, eine moderne, performante und erweiterbare Alternative zu klassischen Office-Anwendungen bereitzustellen. Das Projekt ist als Monorepo organisiert — jedes Modul lebt in einem eigenen Verzeichnis.

| Modul | Verzeichnis | Status | Beschreibung |
|-------|-------------|--------|--------------|
| **Writer** | `writer/` + `client/` | Aktiv in Entwicklung | Professionelle Textverarbeitung mit Ribbon-UI |
| **Tabulator** | `tabulator/` | Geplant | Tabellenkalkulation |
| **Email** | `email/` | Geplant | E-Mail-Client |
| **Cloud** | `cloud/` | Geplant | Cloud-Sync & Echtzeit-Collaboration |
| **Data** | `data/` | Geplant | Zentrale Datenschicht |

---

## Features

### Writer — Textverarbeitung

**Formatierung**
- Schriftart (20+ Schriften), Schriftgroesse (8–72 pt), Textfarbe, Hervorhebung
- Fett, Kursiv, Unterstrichen, Durchgestrichen, Hoch-/Tiefgestellt
- Ueberschriften H1–H6, Absatzausrichtung (Links, Zentriert, Rechts, Blocksatz)
- Zeilenabstand, Einzuege, Blockzitate

**Inhalte einfuegen**
- Tabellen mit Zeilen-/Spaltenbearbeitung
- Bilder (Upload & URL)
- Links, Horizontale Linien, Seitenumbrueche
- Aufzaehlungen, nummerierte Listen, Checklisten

**Seitenlayout**
- A4-WYSIWYG-Ansicht mit konfigurierbaren Seitenraendern
- Zoom (25–200 %)
- Druckfunktion

**Dateioperationen**
- Eigenes `.impuls`-Format (JSON-basiert)
- Export als **PDF**, **DOCX** und **HTML**
- Oeffnen, Speichern, Neues Dokument — native Systemdialoge via Electron

**Bearbeitungsfunktionen**
- Undo / Redo
- Suchen & Ersetzen
- Woerter-, Zeichen- und Seitenzaehlung (Statusleiste)

**Benutzeroberflaeche**
- Office-aehnliche Ribbon-Toolbar mit Tabs (Start, Einfuegen, Seitenlayout, Ansicht)
- Klassische Menuleiste (Datei, Bearbeiten, Einfuegen, Format, Ansicht)
- Seitenleiste mit Inhaltsverzeichnis
- Statusleiste mit Dokumentinfos & Zoom
- Dark-Mode-Unterstuetzung (macOS-Integration)

---

## Tech-Stack

| Bereich | Technologie | Version |
|---------|-------------|---------|
| Framework | Next.js (App Router) | 16 |
| UI | React + TypeScript | 19 / 5 |
| Editor-Engine | Tiptap (25+ Extensions) | 3 |
| Desktop-Shell | Electron + electron-builder | 33 |
| Styling | Tailwind CSS + Lucide Icons | 4 |
| PDF-Export | jsPDF + html2canvas | 4 / 1.4 |
| DOCX-Export | docx.js | 9 |

---

## Projektstruktur

```
ImpulsWriter/
│
├── writer/                  # Next.js App — Textverarbeitung (Frontend)
│   ├── app/                 #   Pages & Layout (App Router)
│   ├── components/
│   │   ├── Editor/          #   Tiptap-Editor + Custom Extensions
│   │   │   └── extensions/  #     FontSize, LineHeight, PageBreak
│   │   ├── Toolbar/         #   Ribbon-Toolbar mit Tab-Komponenten
│   │   │   └── Ribbon/      #     RibbonToolbar, Tabs (Start, Einfuegen, …)
│   │   ├── Sidebar/         #   Inhaltsverzeichnis
│   │   ├── StatusBar/       #   Dokumentinfos & Zoom
│   │   ├── Dialogs/         #   Suchen & Ersetzen
│   │   └── Export/          #   PDF- & DOCX-Export-Logik
│   └── lib/                 #   Dateioperationen & Default-Content
│
├── client/                  # Electron Desktop-Wrapper
│   ├── main.js              #   Main Process (BrowserWindow, IPC)
│   ├── preload.js           #   Secure IPC Bridge (Context Isolation)
│   ├── menu.js              #   Native Menues (Datei, Bearbeiten, …)
│   ├── dev.js               #   Dev-Script (Next.js + Electron orchestriert)
│   └── resources/           #   App-Icons (icns, ico, png)
│
├── tabulator/               # (Geplant) Tabellenkalkulation
├── email/                   # (Geplant) E-Mail-Client
├── cloud/                   # (Geplant) Cloud-Sync & Collaboration
├── data/                    # (Geplant) Zentrale Datenschicht
│
└── docs/
    └── PLAN.md              # Implementierungsplan & Feature-Roadmap
```

---

## Schnellstart

### Voraussetzungen

- [Node.js](https://nodejs.org/) >= 18 (inkl. npm)
- Git

### Installation

```bash
git clone https://github.com/<dein-username>/ImpulsWriter.git
cd ImpulsWriter

# Writer-Dependencies
cd writer && npm install

# Electron-Dependencies
cd ../client && npm install
```

### Entwicklung starten

```bash
# Desktop-App (Electron + Next.js dev-server)
cd client
npm run dev
# Startet Next.js auf localhost:3000 und oeffnet Electron mit DevTools

# Alternativ: Nur Web-Version im Browser
cd writer
npm run dev
# → http://localhost:3000
```

### Production Build

```bash
cd client

npm run build       # Build fuer aktuelle Plattform
npm run dist        # Installer fuer macOS + Windows erstellen
npm run pack        # Package ohne Installer
```

### Build-Targets

| Plattform | Formate |
|-----------|---------|
| macOS | `.dmg`, `.zip` |
| Windows | `.exe` (NSIS), Portable |
| Linux | `.AppImage`, `.deb` |

---

## Scripts

### `writer/` (Next.js)

| Script | Beschreibung |
|--------|-------------|
| `npm run dev` | Startet Next.js Dev-Server |
| `npm run build` | Production Build |
| `npm run start` | Startet Production Server |
| `npm run lint` | Linting mit ESLint |

### `client/` (Electron)

| Script | Beschreibung |
|--------|-------------|
| `npm run dev` | Startet Electron + Next.js (Development) |
| `npm run build` | Next.js Build + Electron-Packaging |
| `npm run dist` | Erstellt Installer (macOS dmg + Windows NSIS) |
| `npm run pack` | Package ohne Installer |
| `npm run start` | Startet Electron direkt |

---

## Tastaturkuerzel

| Aktion | Shortcut |
|--------|----------|
| Neues Dokument | `Ctrl/Cmd + N` |
| Oeffnen | `Ctrl/Cmd + O` |
| Speichern | `Ctrl/Cmd + S` |
| Drucken | `Ctrl/Cmd + P` |
| Rueckgaengig | `Ctrl/Cmd + Z` |
| Wiederherstellen | `Ctrl/Cmd + Y` |
| Suchen & Ersetzen | `Ctrl/Cmd + H` |
| Alles auswaehlen | `Ctrl/Cmd + A` |

---

## Unterstuetzte Dateiformate

| Format | Lesen | Schreiben | Beschreibung |
|--------|:-----:|:---------:|--------------|
| `.impuls` | Ja | Ja | Natives JSON-Format (verlustfrei) |
| `.html` | — | Ja | HTML-Export |
| `.pdf` | — | Ja | PDF-Export via html2canvas + jsPDF |
| `.docx` | — | Ja | Word-Export via docx.js |

---

## Roadmap

- [x] Tiptap-Editor mit 25+ Extensions
- [x] Ribbon-Toolbar (Office-Style mit Tabs)
- [x] PDF-, DOCX- & HTML-Export
- [x] Electron Desktop-App mit nativen Menues
- [x] Suchen & Ersetzen
- [x] Inhaltsverzeichnis-Sidebar
- [x] Statusleiste (Woerter, Seiten, Zoom)
- [x] Dark-Mode-Unterstuetzung
- [ ] Formatvorlagen / Style Templates
- [ ] Kopf- & Fusszeilen mit Seitenzahlen
- [ ] Rechtschreibpruefung
- [ ] `.impuls`-Format Lesen (Import)
- [ ] Tabulator — Tabellenkalkulation
- [ ] Email — E-Mail-Client
- [ ] Cloud — Sync & Echtzeit-Collaboration
- [ ] Auto-Save & Dokumentversionierung

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
<sub>Gebaut mit Next.js, Electron & Tiptap</sub>
</div>
