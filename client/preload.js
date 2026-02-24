const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getDarkMode: () => ipcRenderer.invoke('get-dark-mode'),

  // Window controls
  setTitle: (title) => ipcRenderer.send('set-title', title),
  setDocumentEdited: (edited) => ipcRenderer.send('set-document-edited', edited),

  // File dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // Menu events from native menu -> renderer
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (_, action) => callback(action))
    return () => ipcRenderer.removeAllListeners('menu-action')
  },

  // Platform info
  platform: process.platform,
  isElectron: true,
})
