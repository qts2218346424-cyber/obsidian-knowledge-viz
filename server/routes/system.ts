import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import {
  config,
  loadedConfigPath,
  anthropic,
  reinitAnthropic,
  invalidateCache,
  startWatcher,
  saveConfig,
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

// Settings
systemRouter.get('/settings', (_req, res) => {
  try {
    const masked = { ...config }
    if (masked.ai) {
      masked.ai = {
        ...masked.ai,
        apiKey: masked.ai.apiKey
          ? masked.ai.apiKey.substring(0, 8) + '...' + masked.ai.apiKey.substring(masked.ai.apiKey.length - 4)
          : '',
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
      config.ai = ai
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
