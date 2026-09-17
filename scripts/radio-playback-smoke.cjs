const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')
app.setPath('userData', path.join(os.tmpdir(), 'knowledge-viz-radio-smoke-profile'))

const outputPath = process.argv[2] || path.join(os.tmpdir(), 'knowledge-viz-radio-smoke.json')
const stations = [
  ['Groove Salad', 'https://ice2.somafm.com/groovesalad-128-mp3'],
  ['Radio Paradise', 'https://stream.radioparadise.com/global-128'],
  ['Nightwave Plaza', 'https://radio.plaza.one/mp3'],
  ['Radio Rivendell', 'https://play.radiorivendell.com/radio/8000/radio.mp3'],
  ['KEXP', 'https://kexp.streamguys1.com/kexp160.aac'],
  ['Lofi Radio', 'https://stream.laut.fm/lofi'],
]

function writeResult(value) {
  fs.writeFileSync(outputPath, JSON.stringify(value, null, 2))
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      sandbox: false,
    },
  })
  win.webContents.setAudioMuted(true)
  await win.loadURL('data:text/html,<html><body>radio smoke</body></html>')

  const results = []
  for (const [name, url] of stations) {
    const result = await win.webContents.executeJavaScript(`
      new Promise(resolve => {
        const audio = new Audio(${JSON.stringify(url)})
        const started = performance.now()
        let done = false
        const finish = payload => {
          if (done) return
          done = true
          clearTimeout(timer)
          audio.pause()
          audio.src = ''
          resolve(payload)
        }
        const timer = setTimeout(() => finish({
          ok: false,
          event: 'timeout',
          readyState: audio.readyState,
          networkState: audio.networkState,
          error: audio.error && { code: audio.error.code, message: audio.error.message },
        }), 12000)
        audio.addEventListener('playing', () => setTimeout(() => finish({
          ok: true,
          event: 'playing',
          elapsedMs: Math.round(performance.now() - started),
          readyState: audio.readyState,
          networkState: audio.networkState,
        }), 1200), { once: true })
        audio.addEventListener('error', () => finish({
          ok: false,
          event: 'error',
          elapsedMs: Math.round(performance.now() - started),
          readyState: audio.readyState,
          networkState: audio.networkState,
          error: audio.error && { code: audio.error.code, message: audio.error.message },
        }), { once: true })
        audio.play().catch(error => finish({
          ok: false,
          event: 'play-reject',
          name: error.name,
          message: error.message,
          readyState: audio.readyState,
          networkState: audio.networkState,
        }))
      })
    `, true)
    results.push({ name, url, ...result })
  }

  writeResult(results)
  win.destroy()
  app.quit()
}).catch(error => {
  writeResult({ fatal: error?.stack || error?.message || String(error) })
  app.quit()
})
