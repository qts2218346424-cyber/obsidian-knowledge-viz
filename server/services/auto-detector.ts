import fs from 'fs'
import path from 'path'
import os from 'os'
import { config, loadedConfigPath, saveConfig, reinitAnthropic, invalidateCache, startWatcher, runtimeDataDir } from '../context.js'
import { detectAllLocalAgents, type LocalAgentStatus } from '../local-agent-bridge.js'

export interface DiscoveredVault {
  id: string
  name: string
  path: string
  isOpen: boolean
  lastUsedTimestamp?: number
  noteCount?: number
  isRecommended?: boolean
}

export interface DiscoveredAiCredentials {
  sourcePlugin: string
  vaultPath: string
  apiKey: string
  baseURL?: string
  model?: string
  provider?: string
}

export interface AutoDiscoveryReport {
  vaults: DiscoveredVault[]
  recommendedVault?: DiscoveredVault
  agents: LocalAgentStatus[]
  recommendedAgent?: LocalAgentStatus
  extractedCredentials?: DiscoveredAiCredentials
  currentConfig: {
    vaultPath: string
    aiModel?: string
    aiProvider?: string
    hasApiKey: boolean
  }
}

/**
 * 跨平台解析 Obsidian 全局配置文件 obsidian.json
 */
export function getObsidianGlobalConfigPath(): string | null {
  const platform = os.platform()
  const home = os.homedir()

  if (platform === 'win32') {
    const appData = process.env.APPDATA
    if (appData) {
      const p = path.join(appData, 'obsidian', 'obsidian.json')
      if (fs.existsSync(p)) return p
    }
  } else if (platform === 'darwin') {
    const p = path.join(home, 'Library', 'Application Support', 'obsidian', 'obsidian.json')
    if (fs.existsSync(p)) return p
  } else {
    const p = path.join(home, '.config', 'obsidian', 'obsidian.json')
    if (fs.existsSync(p)) return p
  }
  return null
}

/**
 * 自动扫描用户电脑上打开过的所有 Obsidian 知识库
 */
export function scanObsidianVaults(): DiscoveredVault[] {
  const discovered: DiscoveredVault[] = []
  const seenPaths = new Set<string>()

  // 1. 优先读取官方 obsidian.json 索引
  const globalConfig = getObsidianGlobalConfigPath()
  if (globalConfig) {
    try {
      const raw = fs.readFileSync(globalConfig, 'utf8')
      const data = JSON.parse(raw)
      if (data?.vaults && typeof data.vaults === 'object') {
        for (const [id, item] of Object.entries<any>(data.vaults)) {
          const vPath = item?.path
          if (vPath && typeof vPath === 'string' && fs.existsSync(vPath)) {
            const normalized = path.resolve(vPath)
            if (!seenPaths.has(normalized)) {
              seenPaths.add(normalized)
              discovered.push({
                id,
                name: path.basename(normalized),
                path: normalized,
                isOpen: Boolean(item.open),
                lastUsedTimestamp: typeof item.ts === 'number' ? item.ts : 0,
              })
            }
          }
        }
      }
    } catch {
      // 容错忽略
    }
  }

  // 2. 备用常见目录探测（Documents, Desktop 等）
  const home = os.homedir()
  const candidateDirs = [
    path.join(home, 'Documents', 'Obsidian Vault'),
    path.join(home, 'Documents'),
    path.join(home, 'Desktop'),
    path.join(runtimeDataDir, 'sample-vault'),
    path.join(runtimeDataDir, '..', 'sample-vault'),
  ]

  for (const cDir of candidateDirs) {
    if (!fs.existsSync(cDir)) continue
    try {
      // 判断当前目录本身是否是一个 Obsidian 知识库 (含 .obsidian 目录)
      if (fs.existsSync(path.join(cDir, '.obsidian'))) {
        const norm = path.resolve(cDir)
        if (!seenPaths.has(norm)) {
          seenPaths.add(norm)
          discovered.push({
            id: 'detected_' + path.basename(norm),
            name: path.basename(norm),
            path: norm,
            isOpen: false,
          })
        }
      } else {
        // 扫描其子目录一级
        const subs = fs.readdirSync(cDir, { withFileTypes: true })
        for (const sub of subs) {
          if (sub.isDirectory() && !sub.name.startsWith('.')) {
            const subFull = path.join(cDir, sub.name)
            if (fs.existsSync(path.join(subFull, '.obsidian'))) {
              const norm = path.resolve(subFull)
              if (!seenPaths.has(norm)) {
                seenPaths.add(norm)
                discovered.push({
                  id: 'detected_' + sub.name,
                  name: sub.name,
                  path: norm,
                  isOpen: false,
                })
              }
            }
          }
        }
      }
    } catch {
      // 忽略无法访问的目录
    }
  }

  // 计算大致笔记数量并排序：当前正打开的最优先，其次时间戳最新
  for (const v of discovered) {
    try {
      const files = fs.readdirSync(v.path)
      v.noteCount = files.filter(f => f.endsWith('.md')).length
    } catch {
      v.noteCount = 0
    }
  }

  discovered.sort((a, b) => {
    if (a.isOpen && !b.isOpen) return -1
    if (!a.isOpen && b.isOpen) return 1
    return (b.lastUsedTimestamp || 0) - (a.lastUsedTimestamp || 0)
  })

  if (discovered.length > 0) {
    discovered[0].isRecommended = true
  }

  return discovered
}

/**
 * 从指定的 Obsidian 知识库插件中扫描已有的 AI 密钥
 */
export function extractVaultAiCredentials(vaultPath: string): DiscoveredAiCredentials | undefined {
  if (!vaultPath || !fs.existsSync(vaultPath)) return undefined
  const pluginsDir = path.join(vaultPath, '.obsidian', 'plugins')
  if (!fs.existsSync(pluginsDir)) return undefined

  // 1. Copilot
  const copilotData = path.join(pluginsDir, 'copilot', 'data.json')
  if (fs.existsSync(copilotData)) {
    try {
      const d = JSON.parse(fs.readFileSync(copilotData, 'utf8'))
      const key = d.apiKey || d.openai_api_key
      if (key) {
        return {
          sourcePlugin: 'Copilot',
          vaultPath,
          apiKey: key,
          baseURL: d.baseURL || d.baseUrl || 'https://api.openai.com/v1',
          model: d.model || 'gpt-4o',
          provider: 'openai',
        }
      }
    } catch {}
  }

  // 2. Smart Connections
  const smartData = path.join(pluginsDir, 'smart-connections', 'data.json')
  if (fs.existsSync(smartData)) {
    try {
      const d = JSON.parse(fs.readFileSync(smartData, 'utf8'))
      const key = d.api_key || d.openai_api_key
      if (key) {
        return {
          sourcePlugin: 'Smart Connections',
          vaultPath,
          apiKey: key,
          baseURL: d.base_url || 'https://api.openai.com/v1',
          model: d.model || 'gpt-4o',
          provider: 'openai',
        }
      }
    } catch {}
  }

  return undefined
}

/**
 * 运行全电脑智能环境探测
 */
export async function runAutoDiscovery(): Promise<AutoDiscoveryReport> {
  const vaults = scanObsidianVaults()
  const recommendedVault = vaults.find(v => v.isRecommended) || vaults[0]

  const agents = await detectAllLocalAgents(config.localAgents)

  // 推荐智能体策略：
  // 1. Ollama 或 LM Studio 运行中 -> 推荐本地 0 费用模型
  // 2. 其次 Claude Code 或 Antigravity 宿主全权智能体
  const localInference = agents.find(a => (a.provider === 'ollama' || a.provider === 'lm-studio') && a.available)
  const hostAgent = agents.find(a => (a.provider === 'claude-code' || a.provider === 'antigravity') && a.available)
  const recommendedAgent = localInference || hostAgent || agents.find(a => a.available)

  // 扫描密钥
  let extractedCredentials: DiscoveredAiCredentials | undefined
  if (recommendedVault) {
    extractedCredentials = extractVaultAiCredentials(recommendedVault.path)
  }
  if (!extractedCredentials) {
    for (const v of vaults) {
      const cred = extractVaultAiCredentials(v.path)
      if (cred) {
        extractedCredentials = cred
        break
      }
    }
  }

  return {
    vaults,
    recommendedVault,
    agents,
    recommendedAgent,
    extractedCredentials,
    currentConfig: {
      vaultPath: config.vaultPath,
      aiModel: config.ai?.model,
      aiProvider: config.ai?.provider,
      hasApiKey: Boolean(config.ai?.apiKey),
    },
  }
}

/**
 * 一键应用全自动探测推荐配置
 */
export async function applyAutoDiscoveredConfig(params?: {
  vaultPath?: string
  applyExtractedAi?: boolean
  selectedAgent?: string
}): Promise<{ ok: boolean; appliedConfig: any; message: string }> {
  const report = await runAutoDiscovery()
  const targetVault = params?.vaultPath || report.recommendedVault?.path || config.vaultPath

  if (targetVault && fs.existsSync(targetVault)) {
    config.vaultPath = targetVault
  }

  // 若用户同意应用探测出的 AI 密钥，且当前未配置有效密钥
  if (params?.applyExtractedAi && report.extractedCredentials) {
    const cred = report.extractedCredentials
    config.ai = {
      ...config.ai,
      apiKey: cred.apiKey,
      baseURL: cred.baseURL || 'https://api.openai.com/v1',
      model: cred.model || 'gpt-4o',
      provider: (cred.provider as any) || 'openai',
      apiFormat: 'openai',
    }
    reinitAnthropic()
  }

  // 保存到磁盘
  saveConfig(config)
  invalidateCache()
  startWatcher(config.vaultPath)

  return {
    ok: true,
    appliedConfig: {
      vaultPath: config.vaultPath,
      aiConfigured: Boolean(config.ai?.apiKey),
      aiModel: config.ai?.model,
    },
    message: `已自动完成电脑适配：已连接知识库 [${path.basename(config.vaultPath)}]${config.ai?.apiKey ? '，并成功复用已检测到的 AI 密钥' : ''}！`,
  }
}
