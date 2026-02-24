# Client — Electron Desktop-Shell

Electron-Wrapper der die Next.js Writer-App als Desktop-Anwendung bereitstellt.

## Stack

- Electron 33.3.1
- electron-builder 25.1.8
- electron-serve 2.1.1
- CommonJS (kein TypeScript)

## Dateien

| Datei | Zweck |
|---|---|
| `main.js` | Main Process — BrowserWindow erstellen, Next.js laden, IPC Handler, Datei-Dialoge |
| `preload.js` | Context Bridge — Stellt `window.electronAPI` im Renderer bereit |
| `menu.js` | Native Menü-Definition (Datei, Bearbeiten, Format, Ansicht, Hilfe) |
| `dev.js` | Dev-Script — Startet Next.js Dev-Server + Electron parallel |
| `resources/` | App-Icons: `icon.icns` (macOS), `icon.ico` (Windows), `icon.png` (Linux) |

## Sicherheitsmodell

- `contextIsolation: true` — Renderer hat keinen Zugriff auf Node.js
- `nodeIntegration: false` — Kein `require()` im Renderer
- `sandbox: false` — Nötig für Preload-Script
- Alle IPC-Kanäle über `contextBridge.exposeInMainWorld()`

## IPC-Pattern

```javascript
// preload.js — API exponieren
contextBridge.exposeInMainWorld('electronAPI', {
  onMenuAction: (callback) => ipcRenderer.on('menu-action', (_, action) => callback(action)),
  setTitle: (title) => ipcRenderer.send('set-title', title),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  openFile: () => ipcRenderer.invoke('open-file'),
  isElectron: true
})

// main.js — Handler registrieren
ipcMain.handle('save-file', async (event, data) => { /* ... */ })

// main.js — Nachricht an Renderer
mainWindow.webContents.send('menu-action', 'save')
```

### Neuen IPC-Kanal hinzufügen

1. Handler in `main.js`: `ipcMain.handle('mein-kanal', handler)` oder `ipcMain.on('mein-kanal', handler)`
2. In `preload.js` exponieren: `meinKanal: (...args) => ipcRenderer.invoke('mein-kanal', ...args)`
3. In Writer aufrufen: `window.electronAPI.meinKanal(...)`

## Build-Konfiguration

| Plattform | Formate | Details |
|---|---|---|
| macOS | DMG + ZIP | Hardened Runtime, Dark Mode, `com.impulsoffice.writer` |
| Windows | NSIS + Portable | One-Click Install |
| Linux | AppImage + DEB | — |

- App-ID: `com.impulsoffice.writer`
- Next.js standalone Output wird als `extraResources` eingebettet
- Icons unter `resources/`

## Konventionen

- Alle Dateien in **CommonJS** (`require` / `module.exports`)
- Neue IPC-Kanäle **immer** in `preload.js` registrieren
- Menü-Einträge in `menu.js` pflegen — Labels auf **Deutsch**
- Keine externen URLs ohne `shell.openExternal()`
- Kein direkter Node.js-Zugriff aus dem Renderer
