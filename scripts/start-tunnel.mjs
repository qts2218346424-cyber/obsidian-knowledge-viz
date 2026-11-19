#!/usr/bin/env node
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import QRCode from 'qrcode'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const dataDir = path.join(rootDir, 'data')
const tunnelStatusPath = path.join(dataDir, 'tunnel_status.json')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

function updateTunnelStatus(url, active = true) {
  try {
    fs.writeFileSync(
      tunnelStatusPath,
      JSON.stringify(
        {
          active,
          url,
          startedAt: new Date().toISOString(),
        },
        null,
        2
      ),
      'utf-8'
    )
  } catch (err) {
    console.error('更新隧道状态失败:', err)
  }
}

function clearTunnelStatus() {
  try {
    if (fs.existsSync(tunnelStatusPath)) {
      fs.unlinkSync(tunnelStatusPath)
    }
  } catch {
    // ignore
  }
}

// 检查是否存在 cloudflared 可执行文件
function findCloudflared() {
  const isWin = process.platform === 'win32'
  const binaryName = isWin ? 'cloudflared.exe' : 'cloudflared'

  const candidates = [
    path.join(rootDir, binaryName),
    path.join(__dirname, binaryName),
    path.join(rootDir, 'node_modules', '.bin', binaryName),
  ]

  for (const c of candidates) {
    if (fs.existsSync(c)) return c
  }

  // 尝试全局命令
  return 'cloudflared'
}

async function printBanner(publicUrl) {
  console.clear()
  console.log('\x1b[36m%s\x1b[0m', '==========================================================')
  console.log('\x1b[36m%s\x1b[0m', '   CoreForge 研核 · 异地全网公网远程访问通道已就绪')
  console.log('\x1b[36m%s\x1b[0m', '==========================================================')
  console.log('')
  console.log('\x1b[32m%s\x1b[0m', '🎉 临时安全公网隧道 (Cloudflare Tunnel) 已成功建立！')
  console.log('')
  console.log('  🌐 手机访问地址: \x1b[1m\x1b[34m' + publicUrl + '\x1b[0m')
  console.log('')
  console.log('  💡 提示：电脑放在家里/寝室，人在图书馆/自习室用手机 4G/5G 扫码即用！')
  console.log('  🔒 提示：自带免费合法 HTTPS 证书，支持手机浏览器「添加到主屏幕」全屏体验。')
  console.log('')

  try {
    const qrTerminal = await QRCode.toString(publicUrl, {
      type: 'terminal',
      small: true,
    })
    console.log(qrTerminal)
  } catch {
    // ignore
  }

  console.log('')
  console.log('按 Ctrl+C 可随时安全关闭远程访问通道。')
}

async function main() {
  clearTunnelStatus()
  const port = process.env.PORT || 3001
  const targetUrl = `http://127.0.0.1:${port}`

  console.log(`正在检查并启动本地 ${targetUrl} 的 Cloudflare 公网隧道...`)

  const cmd = findCloudflared()
  const args = ['tunnel', '--url', targetUrl]

  const proc = spawn(cmd, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })

  let urlDetected = false

  const handleOutput = async (data) => {
    const text = data.toString()
    // 匹配类似 https://xxx-xxx.trycloudflare.com
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/)
    if (match && !urlDetected) {
      urlDetected = true
      const publicUrl = match[0]
      updateTunnelStatus(publicUrl, true)
      await printBanner(publicUrl)
    }
  }

  proc.stdout.on('data', handleOutput)
  proc.stderr.on('data', handleOutput)

  proc.on('error', (err) => {
    clearTunnelStatus()
    console.error('\n\x1b[31m%s\x1b[0m', '❌ 未能启动 cloudflared 工具。')
    console.log('请根据提示安装 cloudflared（官方免费开源隧道客户端）：')
    if (process.platform === 'win32') {
      console.log('  Windows 一键安装命令（PowerShell 执行）：')
      console.log('  winget install --id Cloudflare.cloudflared -e')
      console.log('  或者从官网下载 cloudflared.exe 放置于项目根目录下：')
      console.log('  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe')
    } else if (process.platform === 'darwin') {
      console.log('  macOS 执行: brew install cloudflared')
    } else {
      console.log('  Linux 执行: sudo apt install cloudflared 或参照官方指引')
    }
    process.exit(1)
  })

  proc.on('close', (code) => {
    clearTunnelStatus()
    console.log(`公网隧道已断开 (退出码: ${code})`)
  })

  const cleanup = () => {
    clearTunnelStatus()
    proc.kill()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

main()
