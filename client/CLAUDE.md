# Client — Electron Shell

Electron-Wrapper der die Next.js Writer-App als Desktop-Anwendung bereitstellt.

## Stack

- Electron 33.3.1
- electron-builder 25.1.8
- electron-serve 2.1.1
- CommonJS (kein TypeScript)

## Dateien

| Datei | Beschreibung |
|---|---|
| `main.js` | Main Process — Fenster erstellen, Next.js laden, IPC Handler |
| `preload.js` | Context Bridge — Stellt `window.electronAPI` bereit |
| `menu.js` | Native Menü-Definition (Datei, Bearbeiten, Format, etc.) |
| `dev.js` | Dev-Script — Startet Next.js + Electron parallel |

## Sicherheitsmodell

- `contextIsolation: true` — Renderer hat keinen Zugriff auf Node.js
- `nodeIntegration: false` — Kein `require()` im Renderer
- `sandbox: false` — Für Preload-Script Zugriff nötig
- Alle IPC-Kanäle über `contextBridge.exposeInMainWorld()`

## IPC-Pattern

```javascript
// preload.js — API exponieren
contextBridge.exposeInMainWorld('electronAPI', {
  onMenuAction: (callback) => { /* ... */ },
  setTitle: (title) => ipcRenderer.send('set-title', title),
  isElectron: true
})

// main.js — Nachricht an Renderer senden
mainWindow.webContents.send('menu-action', action)
```

## Build-Konfiguration

- **macOS:** DMG + ZIP (hardened runtime, dark mode support)
- **Windows:** NSIS Installer + Portable
- **Linux:** AppImage + DEB
- App-ID: `com.impulsoffice.writer`
- Next.js standalone Output wird als `extraResources` eingebettet

## Konventionen

- Alle Dateien in CommonJS (`require` / `module.exports`)
- Neue IPC-Kanäle immer in `preload.js` registrieren
- Menü-Einträge in `menu.js` pflegen — Labels auf Deutsch
- Keine externen URLs öffnen ohne `shell.openExternal()`
