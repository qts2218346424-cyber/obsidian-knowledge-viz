const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron')
const path = require('path')
const http = require('http')
const { pathToFileURL } = require('url')

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Knowledge Viz',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0a0a0f',
    show: false,
  })

  mainWindow.setMenuBarVisibility(false)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.loadURL('http://localhost:3001')
}

// IPC: folder picker dialog
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择 Obsidian 知识库文件夹',
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

function waitForServer(maxRetries = 60) {
  return new Promise((resolve) => {
    let retries = 0
    const check = () => {
      const req = http.get('http://localhost:3001/api/vault/stats', (res) => {
        if (res.statusCode === 200) {
          res.resume() // consume response
          resolve(true)
        } else {
          retry()
        }
      })
      req.on('error', retry)
      req.setTimeout(2000, () => { req.destroy(); retry() })
    }
    const retry = () => {
      retries++
      if (retries >= maxRetries) {
        resolve(false)
      } else {
        setTimeout(check, 500)
      }
    }
    // Initial delay to let server start listening
    setTimeout(check, 1500)
  })
}

async function startEmbeddedServer() {
  // Dynamic import ESM server module
  const serverPath = path.join(__dirname, '..', 'dist-server', 'server.mjs')
  const serverURL = pathToFileURL(serverPath).href
  const { startServer } = await import(serverURL)
  await startServer(3001)
}

app.whenReady().then(async () => {
  try {
    await startEmbeddedServer()
    console.log('Server started via embedded import')
  } catch (err) {
    console.error('Failed to start embedded server:', err)
  }

  const ready = await waitForServer()
  if (ready) {
    console.log('Server ready, creating window...')
    createWindow()
  } else {
    console.error('Server did not start')
    createWindow() // Still create window to show error state
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
