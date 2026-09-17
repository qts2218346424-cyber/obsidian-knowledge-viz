import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { ProxyAgent, fetch as undiciFetch } from 'undici'
import multer from 'multer'
import chokidar from 'chokidar'
import type express from 'express'
import { scanVault, type VaultNote } from './vault-parser.js'
import { createAiClient, getAiProvider, type AiClient, type AiConfig } from './ai-client.js'
import type { LocalAgentConfig } from './local-agent-bridge.js'
import { VaultScheduler } from './scheduler.js'
import { loadScheduleConfig } from './schedule-store.js'

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)
export const runtimeDataDir = process.env.KNOWLEDGE_VIZ_DATA_DIR || path.join(__dirname, '..')

// Configuration paths
export const configPaths = [
  process.env.KNOWLEDGE_VIZ_CONFIG_PATH || '',
  path.join(__dirname, 'config.json'),                              // dev: next to server
  path.join(__dirname, '..', 'server', 'config.json'),              // bundled: dist-server/../server/
  typeof process !== 'undefined' && (process as any).resourcesPath
    ? path.join((process as any).resourcesPath, 'config.json')       // Electron packaged
    : '',
].filter(Boolean)

export interface ServerConfig {
  vaultPath: string
  port: number
  host?: string
  allowedOrigins?: string[]
  proxy?: string
  ai?: AiConfig
  localAgents?: LocalAgentConfig
}

export let config: ServerConfig = {
  vaultPath: '',
  port: 3001,
}

export let loadedConfigPath = ''

// Load config from disk
for (const cp of configPaths) {
  try {
    if (fs.existsSync(cp)) {
      const raw = fs.readFileSync(cp, 'utf-8')
      config = { ...config, ...JSON.parse(raw) }
      loadedConfigPath = cp
      console.log(`Config loaded from: ${cp}`)
      break
    }
  } catch {
    // try next
  }
}

// AI client instance
export let anthropic: AiClient | null = config.ai
  ? createAiClient(config.ai)
  : null

export function reinitAnthropic() {
  anthropic = config.ai
    ? createAiClient(config.ai)
    : null
}

export function summarizeAiError(err: any) {
  const status = Number(err?.status || err?.statusCode || 0) || undefined
  let message = String(err?.message || 'AI 请求失败')
  if (message.includes('<!DOCTYPE') || message.includes('Just a moment') || message.includes('Cloudflare')) {
    message = '上游网关返回了网页防护页面，请检查 Base URL、代理或服务商访问限制'
  }
  if (message.length > 240) message = `${message.slice(0, 240)}…`
  return { status, message }
}

// Proxy-aware fetch helper
export function proxyFetch(
  url: string,
  options?: { signal?: AbortSignal; headers?: Record<string, string>; method?: string; body?: any }
): Promise<Response> {
  const proxyUrl = config.proxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || ''
  if (proxyUrl) {
    const dispatcher = new ProxyAgent(proxyUrl)
    return undiciFetch(url, { ...options, dispatcher } as any) as unknown as Promise<Response>
  }
  return fetch(url, options)
}

// Ingest uploads directory
export const uploadDir = path.join(runtimeDataDir, 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
export const upload = multer({ dest: uploadDir, limits: { fileSize: 100 * 1024 * 1024 } })

// Vault notes cache
let cachedNotes: VaultNote[] | null = null
let cacheTime = 0
const CACHE_TTL = 10_000

export function getNotes(): VaultNote[] {
  const now = Date.now()
  if (cachedNotes && now - cacheTime < CACHE_TTL) {
    return cachedNotes
  }
  cachedNotes = scanVault(config.vaultPath)
  cacheTime = now
  return cachedNotes
}

export function invalidateCache() {
  cachedNotes = null
  cacheTime = 0
}

// Track files written by our app to avoid echo loops
export const selfWriteTracker = new Set<string>()

export function markSelfWrite(relativePath: string) {
  selfWriteTracker.add(relativePath)
  setTimeout(() => selfWriteTracker.delete(relativePath), 5000)
}

export function isSelfWrite(relativePath: string): boolean {
  return selfWriteTracker.has(relativePath)
}

// SSE Clients for vault events
export const sseClients: Set<express.Response> = new Set()

export function broadcastVaultEvent(type: string, filePath: string) {
  const relative = path.relative(config.vaultPath, filePath).replace(/\\/g, '/')
  if (selfWriteTracker.has(relative)) return
  const payload = JSON.stringify({ type, path: relative, timestamp: new Date().toISOString() })
  for (const client of sseClients) {
    client.write(`data: ${payload}\n\n`)
  }
  invalidateCache()
}

// Vault watcher
let watcher: chokidar.FSWatcher | null = null

export function startWatcher() {
  if (watcher) {
    watcher.close()
    watcher = null
  }
  if (!config.vaultPath || !fs.existsSync(config.vaultPath)) return

  watcher = chokidar.watch(config.vaultPath, {
    ignored: [
      /(^|[/\\])\./,  // hidden files/dirs (.obsidian, .git, etc.)
      /node_modules/,
      /dist/,
      /release/,
    ],
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  })

  watcher
    .on('add', (fp) => broadcastVaultEvent('file-added', fp))
    .on('change', (fp) => broadcastVaultEvent('file-changed', fp))
    .on('unlink', (fp) => broadcastVaultEvent('file-deleted', fp))

  console.log(`Vault watcher started: ${config.vaultPath}`)
}

export function stopWatcher() {
  if (watcher) {
    watcher.close()
    watcher = null
  }
}

// Scheduler instance
export const scheduler = new VaultScheduler(
  getNotes,
  () => config.vaultPath,
  invalidateCache
)

export function initScheduler() {
  if (loadScheduleConfig().enabled) {
    scheduler.start()
  }
}

// Save config helper
export function saveConfig(): string | null {
  const savePath = loadedConfigPath || configPaths[0]
  if (savePath) {
    fs.writeFileSync(savePath, JSON.stringify(config, null, 2), 'utf-8')
    console.log(`Settings saved to: ${savePath}`)
    return savePath
  }
  return null
}
