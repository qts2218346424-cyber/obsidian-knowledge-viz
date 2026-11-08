import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { ProxyAgent, fetch as undiciFetch } from 'undici'
import {
  config,
  loadedConfigPath,
  anthropic,
  reinitAnthropic,
  invalidateCache,
  startWatcher,
  saveConfig,
  __dirname,
} from '../context.js'
import { getAiProvider, type AiConfig } from '../ai-client.js'

export const systemRouter = Router()

// Health check
systemRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    vaultConfigured: Boolean(config.vaultPath),
    vaultAvailable: Boolean(config.vaultPath && fs.existsSync(config.vaultPath)),
    aiConfigured: Boolean(anthropic),
    aiProvider: getAiProvider(config.ai),
  })
})

// System Network Interfaces for Mobile & Cloud connection
const getNetworkHandler = (req: any, res: any) => {
  try {
    const interfaces = os.networkInterfaces()
    const addresses: Array<{ iface: string; address: string; family: string; mac: string }> = []

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue
      for (const info of addrs) {
        if (info.family === 'IPv4' && !info.internal) {
          addresses.push({
            iface: name,
            address: info.address,
            family: info.family,
            mac: info.mac,
          })
        }
      }
    }

    const port = config.port || 3001
    // Prioritize Wi-Fi, WLAN or common physical Ethernet over virtual NICs (WSL/Hyper-V/VMware/vEthernet/docker)
    const isVirtual = (name: string) =>
      /vEthernet|VirtualBox|VMware|WSL|Loopback|docker|br-|veth/i.test(name)
    const sorted = [...addresses].sort((a, b) => {
      const aVirt = isVirtual(a.iface) ? 1 : 0
      const bVirt = isVirtual(b.iface) ? 1 : 0
      if (aVirt !== bVirt) return aVirt - bVirt
      const aWifi = /wlan|wi-?fi|无线/i.test(a.iface) ? 0 : 1
      const bWifi = /wlan|wi-?fi|无线/i.test(b.iface) ? 0 : 1
      return aWifi - bWifi
    })

    // Detect if accessed via public cloud domain / public IP / reverse proxy
    const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim()
    const rawProto = String(
      req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http')
    )
      .split(',')[0]
      .trim()
    const hostOnly = rawHost.replace(/:\d+$/, '')
    const isPrivateOrLocal =
      !hostOnly ||
      hostOnly === 'localhost' ||
      hostOnly === '127.0.0.1' ||
      /^192\.168\./.test(hostOnly) ||
      /^10\./.test(hostOnly) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostOnly)

    const deploymentMode: 'cloud' | 'local' = isPrivateOrLocal ? 'local' : 'cloud'
    const publicOrigin = !isPrivateOrLocal && rawHost ? `${rawProto}://${rawHost}` : null

    const preferred = sorted[0]
    const lanPreferredUrl = preferred
      ? `http://${preferred.address}:${port}`
      : `http://localhost:${port}`
    const preferredUrl = publicOrigin || lanPreferredUrl

    res.json({
      port,
      deploymentMode,
      publicOrigin,
      addresses: sorted,
      preferredUrl,
      lanUrls: sorted.map(a => ({
        iface: a.iface,
        address: a.address,
        url: `http://${a.address}:${port}`,
      })),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

systemRouter.get('/network', getNetworkHandler)
systemRouter.get('/system/network', getNetworkHandler)

// Settings
systemRouter.get('/settings', (_req, res) => {
  try {
    const masked = JSON.parse(JSON.stringify(config))
    if (masked.ai) {
      if (masked.ai.apiKey) {
        masked.ai.apiKey = masked.ai.apiKey.substring(0, 8) + '...' + masked.ai.apiKey.substring(masked.ai.apiKey.length - 4)
      }
      if (Array.isArray(masked.ai.endpoints)) {
        masked.ai.endpoints = masked.ai.endpoints.map((ep: any) => ({
          ...ep,
          apiKey: ep.apiKey
            ? ep.apiKey.substring(0, Math.min(8, ep.apiKey.length)) + '...' + ep.apiKey.substring(Math.max(0, ep.apiKey.length - 4))
            : '',
        }))
      }
    }
    res.json({ ...masked, configPath: loadedConfigPath })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

systemRouter.put('/settings', (req, res) => {
  try {
    const { vaultPath, port, proxy, ai, localAgents } = req.body as {
      vaultPath?: string
      port?: number
      proxy?: string
      ai?: AiConfig
      localAgents?: any
    }
    const oldVault = config.vaultPath

    if (vaultPath !== undefined) config.vaultPath = vaultPath
    if (port !== undefined) config.port = port
    if (proxy !== undefined) config.proxy = proxy
    if (localAgents !== undefined) config.localAgents = localAgents
    if (ai !== undefined) {
      // 恢复顶级 API Key（若未修改）
      let resolvedApiKey = ai.apiKey
      if (resolvedApiKey && resolvedApiKey.includes('...') && config.ai?.apiKey) {
        resolvedApiKey = config.ai.apiKey
      }

      // 恢复各 endpoint 的 API Key（若未修改）
      let resolvedEndpoints = ai.endpoints
      if (Array.isArray(resolvedEndpoints)) {
        resolvedEndpoints = resolvedEndpoints.map(ep => {
          if (ep.apiKey && ep.apiKey.includes('...')) {
            // 优先从已有的 endpoints 中按 id 恢复
            const oldEp = config.ai?.endpoints?.find(o => o.id === ep.id)
            if (oldEp?.apiKey && !oldEp.apiKey.includes('...')) {
              return { ...ep, apiKey: oldEp.apiKey }
            }
            // 若为首次从老配置迁移或匹配到老顶级配置，尝试从原有顶级 apiKey 恢复
            if (config.ai?.apiKey && !config.ai.apiKey.includes('...')) {
              return { ...ep, apiKey: config.ai.apiKey }
            }
          }
          return ep
        })
      }

      config.ai = {
        ...ai,
        apiKey: resolvedApiKey || '',
        endpoints: resolvedEndpoints,
      }
      reinitAnthropic()
    }

    saveConfig()
    invalidateCache()

    if (vaultPath !== undefined && vaultPath !== oldVault) {
      startWatcher()
    }

    res.json({ ok: true, vaultPath: config.vaultPath, aiConfigured: !!config.ai })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Test Network Proxy
systemRouter.post('/test-proxy', async (req, res) => {
  const proxyUrl = req.body?.proxy || config.proxy
  if (!proxyUrl) {
    res.status(400).json({ error: '未配置代理地址，请先输入网络代理 URL' })
    return
  }
  const startTime = Date.now()
  try {
    const dispatcher = new ProxyAgent(proxyUrl)
    const resp = await undiciFetch('https://www.google.com/generate_204', {
      dispatcher,
      signal: AbortSignal.timeout(5000),
    })
    const duration = Date.now() - startTime
    if (resp.status === 204 || resp.ok) {
      res.json({ ok: true, latency: duration, message: `代理连接成功 (延迟 ${duration}ms)` })
    } else {
      res.status(resp.status).json({ error: `代理响应异常: HTTP ${resp.status}` })
    }
  } catch (err: any) {
    const duration = Date.now() - startTime
    res.status(502).json({
      error: `代理连接失败: ${err.message || '网络连接超时'} (已尝试 ${duration}ms)`
    })
  }
})

// Filesystem browse (folder picker)
systemRouter.get('/fs/browse', async (req, res) => {
  try {
    const targetPath = req.query.path as string | undefined
    const isWin = process.platform === 'win32'

    if (!targetPath) {
      if (isWin) {
        const drives: string[] = []
        for (let code = 65; code <= 90; code++) {
          const letter = String.fromCharCode(code)
          const drive = `${letter}:\\`
          try {
            fs.accessSync(drive)
            drives.push(drive)
          } catch { /* drive not available */ }
        }
        res.json({ entries: drives.map(d => ({ name: d, path: d })) })
      } else {
        res.json({ entries: [{ name: '/', path: '/' }] })
      }
      return
    }

    const entries = fs.readdirSync(targetPath, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'))
      .map(d => {
        const fullPath = path.join(targetPath, d.name)
        return { name: d.name, path: fullPath }
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))

    const parent = path.dirname(targetPath)
    const canGoUp = parent !== targetPath

    res.json({ current: targetPath, parent: canGoUp ? parent : null, entries })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

systemRouter.get('/fs/exists', async (req, res) => {
  const targetPath = req.query.path as string
  if (!targetPath) {
    res.json({ exists: false })
    return
  }
  try {
    const stat = fs.statSync(targetPath)
    res.json({ exists: true, isDirectory: stat.isDirectory() })
  } catch {
    res.json({ exists: false })
  }
})

// Obsidian AI Plugin Detection
const KNOWN_AI_PLUGINS: Record<string, {
  displayName: string
  extractConfig: (data: any) => { apiKey?: string; baseURL?: string; model?: string } | null
}> = {
  'copilot': {
    displayName: 'Copilot',
    extractConfig: (data: any) => {
      if (data.anthropcApiKey || data.anthropicApiKey) {
        return {
          apiKey: data.anthropicApiKey || data.anthropcApiKey,
          baseURL: data.anthropicBaseUrl || '',
          model: data.anthropicModel || '',
        }
      }
      if (data.openAIApiKey) {
        return {
          apiKey: data.openAIApiKey,
          baseURL: data.openAIProxyBaseUrl || '',
          model: data.defaultModel || data.openAIModel || '',
        }
      }
      if (data.googleApiKey) {
        return {
          apiKey: data.googleApiKey,
          baseURL: data.googleBaseUrl || '',
          model: data.googleModel || '',
        }
      }
      return null
    },
  },
  'smart-connections': {
    displayName: 'Smart Connections',
    extractConfig: (data: any) => {
      const key = data.api_key || data.apiKey
      return key ? { apiKey: key, baseURL: '', model: '' } : null
    },
  },
  'obsidian-textgenerator-plugin': {
    displayName: 'Text Generator',
    extractConfig: (data: any) => {
      const key = data.api_key || data.apiKey || data.openaiApiKey
      return key ? { apiKey: key, baseURL: data.baseURL || data.customBaseUrl || '', model: data.model || '' } : null
    },
  },
  'obsidian-copilot': {
    displayName: 'Copilot (Alternative)',
    extractConfig: (data: any) => {
      const key = data.apiKey || data.openai_api_key
      return key ? { apiKey: key, baseURL: data.baseURL || '', model: data.model || '' } : null
    },
  },
  'companion': {
    displayName: 'Companion',
    extractConfig: (data: any) => {
      const key = data.apiKey || data.openaiKey
      return key ? { apiKey: key, baseURL: data.baseUrl || '', model: data.model || '' } : null
    },
  },
}

systemRouter.get('/obsidian/plugins/ai-config', (_req, res) => {
  try {
    if (!config.vaultPath) {
      res.status(400).json({ error: 'Vault 路径未配置' })
      return
    }

    const pluginsDir = path.join(config.vaultPath, '.obsidian', 'plugins')
    if (!fs.existsSync(pluginsDir)) {
      res.json({ plugins: [] })
      return
    }

    const found: Array<{
      pluginId: string
      displayName: string
      apiKey: string
      baseURL: string
      model: string
      hasConfig: boolean
    }> = []

    for (const [pluginId, pluginDef] of Object.entries(KNOWN_AI_PLUGINS)) {
      const dataPath = path.join(pluginsDir, pluginId, 'data.json')
      if (!fs.existsSync(dataPath)) continue

      try {
        const raw = fs.readFileSync(dataPath, 'utf-8')
        const data = JSON.parse(raw)
        const extracted = pluginDef.extractConfig(data)
        if (extracted && extracted.apiKey) {
          const key = extracted.apiKey
          found.push({
            pluginId,
            displayName: pluginDef.displayName,
            apiKey: key.length > 12 ? key.substring(0, 8) + '...' + key.substring(key.length - 4) : '***',
            baseURL: extracted.baseURL || '',
            model: extracted.model || '',
            hasConfig: true,
          })
        }
      } catch {
        // skip parse error
      }
    }

    res.json({ plugins: found })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

systemRouter.post('/obsidian/plugins/import-ai-config', (req, res) => {
  try {
    const { pluginId } = req.body as { pluginId: string }
    if (!pluginId) {
      res.status(400).json({ error: '缺少 pluginId 参数' })
      return
    }
    if (!config.vaultPath) {
      res.status(400).json({ error: 'Vault 路径未配置' })
      return
    }

    const pluginDef = KNOWN_AI_PLUGINS[pluginId]
    if (!pluginDef) {
      res.status(400).json({ error: '不支持的插件: ' + pluginId })
      return
    }

    const dataPath = path.join(config.vaultPath, '.obsidian', 'plugins', pluginId, 'data.json')
    if (!fs.existsSync(dataPath)) {
      res.status(404).json({ error: '未找到插件配置' })
      return
    }

    const raw = fs.readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(raw)
    const extracted = pluginDef.extractConfig(data)
    if (!extracted || !extracted.apiKey) {
      res.status(400).json({ error: '该插件未配置 AI 密钥' })
      return
    }

    config.ai = {
      apiKey: extracted.apiKey,
      baseURL: extracted.baseURL || config.ai?.baseURL || 'https://api.anthropic.com',
      model: extracted.model || config.ai?.model || '',
    }
    reinitAnthropic()
    saveConfig()

    res.json({
      ok: true,
      imported: {
        pluginId,
        displayName: pluginDef.displayName,
        baseURL: config.ai.baseURL,
        model: config.ai.model,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ==================== 全平台客户端下载服务 ====================

function getReleaseFiles() {
  const releaseDir = path.resolve(__dirname, '..', 'release')
  if (!fs.existsSync(releaseDir)) {
    return { desktop: null, android: null }
  }

  const files = fs.readdirSync(releaseDir)

  // 匹配 Windows 安装包，如 Knowledge-Viz-Setup-1.2.0.exe 或 CoreForge-Setup-*.exe
  const exeFiles = files.filter(f => f.endsWith('.exe'))
  let latestExe: { filename: string; path: string; size: number; sizeFormatted: string; version: string; mtime: Date } | null = null

  if (exeFiles.length > 0) {
    // 按修改时间倒序排列，取最新的安装包
    const sortedExes = exeFiles.map(filename => {
      const filePath = path.join(releaseDir, filename)
      const stat = fs.statSync(filePath)
      const match = filename.match(/(\d+\.\d+\.\d+)/)
      const version = match ? match[1] : '1.4.0'
      const sizeMb = (stat.size / (1024 * 1024)).toFixed(1)
      return {
        filename,
        path: filePath,
        size: stat.size,
        sizeFormatted: `${sizeMb} MB`,
        version,
        mtime: stat.mtime,
      }
    }).sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

    latestExe = sortedExes[0]
  }

  // 匹配 Android APK 文件
  const apkFiles = files.filter(f => f.endsWith('.apk'))
  let latestApk: { filename: string; path: string; size: number; sizeFormatted: string; version: string; mtime: Date } | null = null

  if (apkFiles.length > 0) {
    const sortedApks = apkFiles.map(filename => {
      const filePath = path.join(releaseDir, filename)
      const stat = fs.statSync(filePath)
      const match = filename.match(/(\d+\.\d+\.\d+)/)
      const version = match ? match[1] : '1.4.0'
      const sizeMb = (stat.size / (1024 * 1024)).toFixed(1)
      return {
        filename,
        path: filePath,
        size: stat.size,
        sizeFormatted: `${sizeMb} MB`,
        version,
        mtime: stat.mtime,
      }
    }).sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

    latestApk = sortedApks[0]
  }

  return { desktop: latestExe, android: latestApk }
}

// 获取各端下载元数据 (版本号、体积、发布时间等)
systemRouter.get('/downloads/info', (_req, res) => {
  try {
    const { desktop, android } = getReleaseFiles()

    res.json({
      status: 'ok',
      desktop: desktop ? {
        available: true,
        filename: desktop.filename,
        version: desktop.version,
        size: desktop.sizeFormatted,
        releaseDate: desktop.mtime.toISOString().split('T')[0],
        downloadUrl: '/api/downloads/desktop',
        platform: 'Windows 64位',
        recommended: true,
      } : {
        available: false,
        message: '暂无编译安装包',
      },
      android: android ? {
        available: true,
        filename: android.filename,
        version: android.version,
        size: android.sizeFormatted,
        releaseDate: android.mtime.toISOString().split('T')[0],
        downloadUrl: '/api/downloads/android',
        platform: 'Android 8.0+',
      } : {
        available: false,
        pwaSupported: true,
        message: '支持扫码即用免安装 PWA 应用',
      },
      web: {
        available: true,
        version: '1.4.0',
        pwaSupported: true,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: '获取下载信息失败: ' + err.message })
  }
})

// 下载 Windows 桌面端安装包
systemRouter.get('/downloads/desktop', (_req, res) => {
  try {
    const { desktop } = getReleaseFiles()
    if (!desktop || !fs.existsSync(desktop.path)) {
      res.status(404).json({ error: '未找到 Windows 安装包，请稍后再试或联系管理员。' })
      return
    }

    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${desktop.filename}"`)
    res.download(desktop.path, desktop.filename)
  } catch (err: any) {
    res.status(500).json({ error: '下载失败: ' + err.message })
  }
})

// 下载 Android 原生 APK 安装包
systemRouter.get('/downloads/android', (_req, res) => {
  try {
    const { android } = getReleaseFiles()
    if (!android || !fs.existsSync(android.path)) {
      res.status(404).json({ error: 'Android 原生 APK 正在编译就绪中，您可使用手机浏览器扫码体验 PWA 桌面快捷方式，体验丝滑一致。' })
      return
    }

    res.setHeader('Content-Type', 'application/vnd.android.package-archive')
    res.setHeader('Content-Disposition', `attachment; filename="${android.filename}"`)
    res.download(android.path, android.filename)
  } catch (err: any) {
    res.status(500).json({ error: '下载失败: ' + err.message })
  }
})
