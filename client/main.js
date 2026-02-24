const electron = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV === 'development'
const DEV_URL = 'http://localhost:3000'

let mainWindow = null
let nextServer = null

function createWindow() {
  const { BrowserWindow, shell } = electron

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'ImpulsOffice Writer',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 8 },
    backgroundColor: '#f3f4f6',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: true,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  // Native menu
  const { createMenu } = require('./menu')
  createMenu(mainWindow)

  if (isDev) {
    mainWindow.loadURL(DEV_URL)
    // mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    startNextServer()
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function startNextServer() {
  const { dialog } = electron
  try {
    const appPath = path.join(process.resourcesPath, 'app')
    const serverPath = path.join(appPath, 'server.js')

    process.env.PORT = '0'
    process.env.HOSTNAME = 'localhost'

    const { createServer } = require('http')
    const next = require(serverPath)
    const handler = next.default || next
    const server = createServer(handler)

    await new Promise((resolve) => {
      server.listen(0, 'localhost', () => {
        const port = server.address().port
        mainWindow.loadURL(`http://localhost:${port}`)
        resolve()
      })
    })

    nextServer = server
  } catch (err) {
    console.error('Failed to start Next.js server:', err)
    const indexPath = path.join(process.resourcesPath, 'app', '.next', 'server', 'app', 'index.html')
    mainWindow.loadFile(indexPath).catch(() => {
      dialog.showErrorBox(
        'Startfehler',
        'Die Anwendung konnte nicht gestartet werden.\n\n' + err.message
      )
    })
  }
}

function registerIpcHandlers() {
  const { ipcMain, dialog, nativeTheme } = electron

  ipcMain.handle('get-app-version', () => electron.app.getVersion())

  ipcMain.handle('show-save-dialog', async (_, options) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Dokument speichern',
      defaultPath: options?.filename || 'dokument',
      filters: [
        { name: 'ImpulsOffice Writer', extensions: ['impuls'] },
        { name: 'HTML', extensions: ['html'] },
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'Word', extensions: ['docx'] },
        { name: 'Alle Dateien', extensions: ['*'] },
      ],
      ...options,
    })
    return result
  })

  ipcMain.handle('show-open-dialog', async (_, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Dokument öffnen',
      filters: [
        { name: 'ImpulsOffice Writer', extensions: ['impuls', 'json'] },
        { name: 'Alle Dateien', extensions: ['*'] },
      ],
      properties: ['openFile'],
      ...options,
    })
    return result
  })

  ipcMain.handle('get-dark-mode', () => nativeTheme.shouldUseDarkColors)

  ipcMain.on('set-title', (_, title) => {
    if (mainWindow) {
      mainWindow.setTitle(title ? `${title} - ImpulsOffice Writer` : 'ImpulsOffice Writer')
    }
  })

  ipcMain.on('set-document-edited', (_, edited) => {
    if (mainWindow && process.platform === 'darwin') {
      mainWindow.setDocumentEdited(edited)
    }
  })
}

// App lifecycle
const { app } = electron

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()
})

app.on('window-all-closed', () => {
  if (nextServer) {
    nextServer.close()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  const { BrowserWindow } = electron
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (!url.startsWith(DEV_URL) && !url.startsWith('http://localhost:')) {
      event.preventDefault()
      electron.shell.openExternal(url)
    }
  })
})
