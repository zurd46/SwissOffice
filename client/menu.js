const electron = require('electron')

function createMenu(mainWindow) {
  const { Menu, app } = electron
  const isMac = process.platform === 'darwin'

  const sendAction = (action) => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('menu-action', action)
    }
  }

  const template = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about', label: 'Über ImpulsWriter' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide', label: 'ImpulsWriter ausblenden' },
        { role: 'hideOthers', label: 'Andere ausblenden' },
        { role: 'unhide', label: 'Alle einblenden' },
        { type: 'separator' },
        { role: 'quit', label: 'ImpulsWriter beenden' },
      ],
    }] : []),

    // Datei
    {
      label: 'Datei',
      submenu: [
        {
          label: 'Neu',
          accelerator: 'CmdOrCtrl+N',
          click: () => sendAction('new'),
        },
        {
          label: 'Öffnen...',
          accelerator: 'CmdOrCtrl+O',
          click: () => sendAction('open'),
        },
        { type: 'separator' },
        {
          label: 'Speichern',
          accelerator: 'CmdOrCtrl+S',
          click: () => sendAction('save'),
        },
        {
          label: 'Speichern unter...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => sendAction('save-as'),
        },
        { type: 'separator' },
        {
          label: 'Als PDF exportieren',
          click: () => sendAction('export-pdf'),
        },
        {
          label: 'Als DOCX exportieren',
          click: () => sendAction('export-docx'),
        },
        {
          label: 'Als HTML exportieren',
          click: () => sendAction('export-html'),
        },
        { type: 'separator' },
        {
          label: 'Drucken',
          accelerator: 'CmdOrCtrl+P',
          click: () => sendAction('print'),
        },
        { type: 'separator' },
        ...(isMac ? [{ role: 'close', label: 'Fenster schliessen' }] : [{ role: 'quit', label: 'Beenden' }]),
      ],
    },

    // Bearbeiten
    {
      label: 'Bearbeiten',
      submenu: [
        {
          label: 'Rückgängig',
          accelerator: 'CmdOrCtrl+Z',
          click: () => sendAction('undo'),
        },
        {
          label: 'Wiederholen',
          accelerator: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Y',
          click: () => sendAction('redo'),
        },
        { type: 'separator' },
        { role: 'cut', label: 'Ausschneiden' },
        { role: 'copy', label: 'Kopieren' },
        { role: 'paste', label: 'Einfügen' },
        { role: 'selectAll', label: 'Alles markieren' },
        { type: 'separator' },
        {
          label: 'Suchen & Ersetzen',
          accelerator: 'CmdOrCtrl+H',
          click: () => sendAction('find-replace'),
        },
      ],
    },

    // Format
    {
      label: 'Format',
      submenu: [
        {
          label: 'Fett',
          accelerator: 'CmdOrCtrl+B',
          click: () => sendAction('bold'),
        },
        {
          label: 'Kursiv',
          accelerator: 'CmdOrCtrl+I',
          click: () => sendAction('italic'),
        },
        {
          label: 'Unterstrichen',
          accelerator: 'CmdOrCtrl+U',
          click: () => sendAction('underline'),
        },
        { type: 'separator' },
        {
          label: 'Formatierung entfernen',
          click: () => sendAction('clear-format'),
        },
      ],
    },

    // Einfügen
    {
      label: 'Einfügen',
      submenu: [
        {
          label: 'Bild...',
          click: () => sendAction('insert-image'),
        },
        {
          label: 'Tabelle',
          click: () => sendAction('insert-table'),
        },
        {
          label: 'Link...',
          click: () => sendAction('insert-link'),
        },
        { type: 'separator' },
        {
          label: 'Horizontale Linie',
          click: () => sendAction('insert-hr'),
        },
        {
          label: 'Seitenumbruch',
          click: () => sendAction('insert-page-break'),
        },
      ],
    },

    // Ansicht
    {
      label: 'Ansicht',
      submenu: [
        {
          label: 'Seitenleiste ein/aus',
          accelerator: 'CmdOrCtrl+\\',
          click: () => sendAction('toggle-sidebar'),
        },
        { type: 'separator' },
        {
          label: 'Vergrössern',
          accelerator: 'CmdOrCtrl+=',
          click: () => sendAction('zoom-in'),
        },
        {
          label: 'Verkleinern',
          accelerator: 'CmdOrCtrl+-',
          click: () => sendAction('zoom-out'),
        },
        {
          label: 'Originalgrösse',
          accelerator: 'CmdOrCtrl+0',
          click: () => sendAction('zoom-reset'),
        },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Vollbild' },
        ...(process.env.NODE_ENV === 'development' ? [
          { type: 'separator' },
          { role: 'toggleDevTools', label: 'Entwicklertools' },
          { role: 'reload', label: 'Neu laden' },
        ] : []),
      ],
    },

    // Fenster
    {
      label: 'Fenster',
      submenu: [
        { role: 'minimize', label: 'Minimieren' },
        { role: 'zoom', label: 'Zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front', label: 'Alle nach vorne' },
        ] : [
          { role: 'close', label: 'Schliessen' },
        ]),
      ],
    },

    // Hilfe
    {
      label: 'Hilfe',
      submenu: [
        {
          label: 'Über ImpulsWriter',
          click: () => sendAction('about'),
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

module.exports = { createMenu }
