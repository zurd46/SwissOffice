const electron = require('electron')
console.log('electron type:', typeof electron)
console.log('electron keys:', Object.keys(electron).slice(0, 20))
console.log('electron.app:', typeof electron.app)
console.log('electron.BrowserWindow:', typeof electron.BrowserWindow)

if (electron.app) {
  electron.app.whenReady().then(() => {
    console.log('App is ready!')
    electron.app.quit()
  })
} else {
  console.log('No app found - electron =', String(electron).substring(0, 200))
  process.exit(1)
}
