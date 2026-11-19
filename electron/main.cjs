const { app, BrowserWindow, shell, ipcMain, dialog, powerSaveBlocker } = require('electron')
const path = require('path')
const http = require('http')
const fs = require('fs')
const { pathToFileURL } = require('url')

let mainWindow = null
let startupFailureReason = null
let powerSaveBlockerId = null

function preventSleepForRemoteAccess() {
  try {
    if (powerSaveBlockerId === null || !powerSaveBlocker.isStarted(powerSaveBlockerId)) {
      powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension')
      writeStartupLog(`Enabled system keep-awake (id: ${powerSaveBlockerId}) to prevent laptop sleep during mobile access`)
    }
  } catch (err) {
    writeStartupLog('Keep-awake error: ' + err)
  }
}

function getLogPath() {
  return path.join(app.getPath('userData'), 'startup.log')
}

function writeStartupLog(message) {
  try {
    const logPath = getLogPath()
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`)
  } catch {
    // Startup logging must never block the app.
  }
}

function preparePackagedRuntime() {
  if (!app.isPackaged) return

  const userDataDir = app.getPath('userData')
  const userConfigPath = path.join(userDataDir, 'config.json')
  const bundledConfigPath = path.join(process.resourcesPath, 'config.json')

  fs.mkdirSync(userDataDir, { recursive: true })
  if (!fs.existsSync(userConfigPath) && fs.existsSync(bundledConfigPath)) {
    fs.copyFileSync(bundledConfigPath, userConfigPath)
  }

  process.env.KNOWLEDGE_VIZ_DATA_DIR = userDataDir
  process.env.KNOWLEDGE_VIZ_CONFIG_PATH = userConfigPath
  process.env.COREFORGE_STANDALONE = '1'
  process.env.COREFORGE_DESKTOP_APP = '1'
  writeStartupLog('Prepared writable runtime directory')
}

function getDiagnosticPageHtml(errorMessage) {
  const logDir = app.getPath('userData')
  const cleanError = (errorMessage || '本地研学服务端未能在预期时间内就绪。').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CoreForge 研核 · 启动诊断中心</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: radial-gradient(circle at 50% 20%, #151520 0%, #0a0a0f 100%);
      color: #F5F5F7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      user-select: none;
    }
    .card {
      width: 100%;
      max-width: 680px;
      background: rgba(26, 26, 36, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      padding: 40px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(20px);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background: rgba(239, 68, 68, 0.15);
      color: #F87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
      color: #FFFFFF;
    }
    p.desc {
      font-size: 14px;
      line-height: 1.6;
      color: #A1A1AA;
      margin-bottom: 24px;
    }
    .error-box {
      background: #0D0D12;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 16px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      line-height: 1.5;
      color: #FCA5A5;
      max-height: 160px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
      margin-bottom: 28px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    button, a.btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border: none;
    }
    .btn-primary {
      background: #0071E3;
      color: #FFFFFF;
    }
    .btn-primary:hover {
      background: #0077ED;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #E4E4E7;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }
    .footer-note {
      margin-top: 24px;
      font-size: 12px;
      color: #71717A;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#EF4444;"></span>
      本地研学底座未能就绪
    </div>
    <h1>CoreForge 研核 桌面客户端未能启动</h1>
    <p class="desc">
      桌面客户端内置的本地微服务未能按预期正常监听端口。这通常是由于依赖文件打包异常、端口被占用或安全策略拦截所致。
    </p>
    <div class="error-box">${cleanError}</div>
    <div class="actions">
      <button class="btn btn-primary" onclick="retry()">🔄 重新检测并重试</button>
      <button class="btn btn-secondary" onclick="openLogs()">📂 打开诊断日志目录</button>
      <button class="btn btn-secondary" onclick="openOnline()">🌐 切换至在线云端版</button>
    </div>
    <div class="footer-note">
      <span>日志路径: ${logDir.replace(/\\/g, '/')}</span>
      <span>v1.5.0</span>
    </div>
  </div>
  <script>
    function retry() {
      window.location.href = 'http://localhost:3001'
    }
    function openLogs() {
      if (window.electronAPI && window.electronAPI.openLogs) {
        window.electronAPI.openLogs()
      } else {
        alert('请在文件资源管理器中打开: ' + ${JSON.stringify(logDir)})
      }
    }
    function openOnline() {
      if (window.electronAPI && window.electronAPI.openExternal) {
        window.electronAPI.openExternal('https://claudexxb.online')
      } else {
        window.open('https://claudexxb.online', '_blank')
      }
    }
  </script>
</body>
</html>`
}

function showDiagnosticPage(errorMessage) {
  if (!mainWindow) return
  const html = getDiagnosticPageHtml(errorMessage)
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
}

function createWindow(loadError = null) {
  const appIcon = process.platform === 'win32' && fs.existsSync(path.join(__dirname, 'icon.ico'))
    ? path.join(__dirname, 'icon.ico')
    : path.join(__dirname, 'icon.png')

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'CoreForge 研核 · 408 & 考研数学智能研学工作台',
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      plugins: true,
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

  // 监听网页加载异常，防止渲染死黑
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    if (validatedURL && validatedURL.startsWith('http://localhost:3001')) {
      writeStartupLog(`WebContents failed to load ${validatedURL} (code: ${errorCode}, ${errorDescription})`)
      showDiagnosticPage(`无法连接到本地研学服务 (localhost:3001)\n错误代码: ${errorCode} (${errorDescription})\n原因诊断: ${startupFailureReason || '后台服务端未成功运行'}`)
    }
  })

  if (loadError) {
    showDiagnosticPage(loadError)
  } else {
    mainWindow.loadURL('http://localhost:3001')
  }
}

// IPC 通道
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择 Obsidian 知识库文件夹',
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

ipcMain.handle('open-logs', async () => {
  const logDir = app.getPath('userData')
  const logFile = path.join(logDir, 'startup.log')
  if (fs.existsSync(logFile)) {
    shell.showItemInFolder(logFile)
  } else {
    shell.openPath(logDir)
  }
  return true
})

ipcMain.handle('open-external', async (_event, url) => {
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url)
    return true
  }
  return false
})

function waitForServer(maxRetries = 40) {
  return new Promise((resolve) => {
    let retries = 0
    const check = () => {
      // 若已记录到严重启动报错，无需盲等
      if (startupFailureReason) {
        resolve(false)
        return
      }

      const req = http.get('http://127.0.0.1:3001/api/health', (res) => {
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
    // 初始延迟给服务端足够的初始化时间
    setTimeout(check, 1000)
  })
}

async function startEmbeddedServer() {
  const unpackedServerPath = path.join(process.resourcesPath || '', 'app.asar.unpacked', 'dist-server', 'server.mjs')
  const devServerPath = path.join(__dirname, '..', 'dist-server', 'server.mjs')
  const serverPath = (app.isPackaged && fs.existsSync(unpackedServerPath))
    ? unpackedServerPath
    : devServerPath

  writeStartupLog('Loading server from: ' + serverPath)
  const serverURL = pathToFileURL(serverPath).href
  const { startServer } = await import(serverURL)
  await startServer(3001)
}

app.whenReady().then(async () => {
  writeStartupLog(`Application ready (packaged=${app.isPackaged})`)
  preparePackagedRuntime()
  preventSleepForRemoteAccess()

  try {
    writeStartupLog('Starting embedded server')
    await startEmbeddedServer()
    console.log('Server started via embedded import')
    writeStartupLog('Embedded server started')
  } catch (err) {
    startupFailureReason = err instanceof Error ? err.message : String(err)
    console.error('Failed to start embedded server:', err)
    writeStartupLog(`Embedded server failed: ${startupFailureReason}`)
  }

  const ready = await waitForServer()
  if (ready) {
    console.log('Server ready, creating window...')
    writeStartupLog('Server health check passed')
    createWindow()
  } else {
    console.error('Server did not start')
    const finalErr = startupFailureReason || '后台服务初始化超时（3001 端口未能正常响应）'
    writeStartupLog(`Server health check timed out: ${finalErr}`)
    createWindow(finalErr)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
