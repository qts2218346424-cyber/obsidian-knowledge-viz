const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')
app.setPath('userData', path.join(os.tmpdir(), 'knowledge-viz-radio-ui-smoke-profile'))

const outputPath = process.argv[2] || path.join(os.tmpdir(), 'knowledge-viz-radio-ui-smoke.json')
const appUrl = process.argv[3] || 'http://127.0.0.1:3001/music'

function writeResult(value) {
  fs.writeFileSync(outputPath, JSON.stringify(value, null, 2))
}

function waitForPlayback(win, timeoutMs = 15000) {
  return new Promise(resolve => {
    let settled = false
    const finish = result => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      win.webContents.removeListener('media-started-playing', onPlaying)
      resolve(result)
    }
    const onPlaying = () => finish({ ok: true, event: 'media-started-playing' })
    const timer = setTimeout(() => finish({ ok: false, event: 'timeout' }), timeoutMs)
    win.webContents.once('media-started-playing', onPlaying)
  })
}

async function clickStation(win, stationName) {
  const playback = waitForPlayback(win)
  const clickResult = await win.webContents.executeJavaScript(`
    (() => {
      const button = [...document.querySelectorAll('button')]
        .find(element => element.textContent?.includes(${JSON.stringify(stationName)}))
      if (!button) return { clicked: false, reason: 'station-button-not-found' }
      button.click()
      return { clicked: true }
    })()
  `, true)

  if (!clickResult.clicked) return clickResult
  const playbackResult = await playback
  await new Promise(resolve => setTimeout(resolve, 500))
  const ui = await win.webContents.executeJavaScript(`
    (() => {
      const text = document.body.innerText
      return {
        hasStationName: text.includes(${JSON.stringify(stationName)}),
        hasLiveLabel: text.includes('直播'),
        hasLoadingLabel: text.includes('正在连接'),
        hasFailureAlert: text.includes(${JSON.stringify(`${stationName} 播放失败`)}),
      }
    })()
  `, true)
  return { ...clickResult, ...playbackResult, ui }
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      sandbox: false,
    },
  })
  win.webContents.setAudioMuted(true)
  await win.loadURL(appUrl)
  await new Promise(resolve => setTimeout(resolve, 1200))

  const results = []
  for (const stationName of ['Groove Salad', 'KEXP 90.3 FM']) {
    results.push({
      stationName,
      ...await clickStation(win, stationName),
    })
  }

  writeResult({
    appUrl,
    pageTitle: await win.webContents.getTitle(),
    results,
  })
  win.destroy()
  app.quit()
}).catch(error => {
  writeResult({ fatal: error?.stack || error?.message || String(error) })
  app.quit()
})
