import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { scanHostLocalModels } from './local-model-scanner.js'

export type LocalAgentProvider = 'antigravity' | 'claude-code' | 'codex' | 'ollama' | 'lm-studio' | 'web'

export interface LocalAgentConfig {
  antigravityCommand?: string
  claudeCommand?: string
  codexCommand?: string
  defaultCwd?: string
  ollamaBaseURL?: string
  lmStudioBaseURL?: string
}

export interface LocalAgentStatus {
  provider: LocalAgentProvider
  available: boolean
  command: string
  resolvedPath?: string
  version?: string
  detail?: string
  models?: string[]
  defaultModel?: string
}


export interface LocalAgentRunOptions {
  provider: LocalAgentProvider
  prompt: string
  cwd: string
  sessionId?: string
  model?: string
  config?: LocalAgentConfig
  signal?: AbortSignal
}

export interface LocalAgentEvent {
  type: 'text' | 'status' | 'session' | 'error' | 'done'
  content?: string
  sessionId?: string
  provider?: LocalAgentProvider
}

function commandFromConfig(config: LocalAgentConfig | undefined, provider: LocalAgentProvider) {
  const appData = process.env.APPDATA || ''
  const localAppData = process.env.LOCALAPPDATA || ''

  if (provider === 'antigravity') {
    if (config?.antigravityCommand && fs.existsSync(config.antigravityCommand)) {
      return config.antigravityCommand
    }
    // 1. 扫描 Programs 安装目录的 Antigravity.exe
    const defaultAntigravityExe = path.join(localAppData, 'Programs', 'antigravity', 'Antigravity.exe')
    if (fs.existsSync(defaultAntigravityExe)) return defaultAntigravityExe

    // 2. 扫描全局 agy / antigravity 命令
    const npmAgyCmd = path.join(appData, 'npm', 'agy.cmd')
    if (fs.existsSync(npmAgyCmd)) return npmAgyCmd

    return config?.antigravityCommand || 'antigravity'
  }

  if (provider === 'claude-code') {
    if (config?.claudeCommand && fs.existsSync(config.claudeCommand)) {
      return config.claudeCommand
    }
    // 1. 优先扫描 npm 全局安装的原生二进制
    const npmClaudeExe = path.join(appData, 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe')
    if (fs.existsSync(npmClaudeExe)) return npmClaudeExe

    // 2. 备用扫描 VS Code 官方插件中的原生 claude.exe
    if (process.platform === 'win32') {
      const userHome = process.env.USERPROFILE || process.env.HOME || ''
      const extDir = path.join(userHome, '.vscode', 'extensions')
      if (fs.existsSync(extDir)) {
        try {
          const matched = fs.readdirSync(extDir).filter(d => d.startsWith('anthropic.claude-code-')).sort().reverse()
          for (const m of matched) {
            const candidate = path.join(extDir, m, 'resources', 'native-binary', 'claude.exe')
            if (fs.existsSync(candidate)) return candidate
          }
        } catch {}
      }
    }
    return config?.claudeCommand || 'claude'
  }

  if (provider === 'codex') {
    if (config?.codexCommand && fs.existsSync(config.codexCommand)) {
      return config.codexCommand
    }
    // 优先扫描 npm 全局安装的原生 codex.exe
    const npmCodexExe = path.join(appData, 'npm', 'node_modules', '@openai', 'codex', 'node_modules', '@openai', 'codex-win32-x64', 'vendor', 'x86_64-pc-windows-msvc', 'bin', 'codex.exe')
    if (fs.existsSync(npmCodexExe)) return npmCodexExe

    return config?.codexCommand || 'codex'
  }

  return 'claude'
}



function resolveCommand(command: string) {
  if (path.isAbsolute(command)) return command
  if (process.platform === 'win32' && !command.includes('\\') && !command.includes('/')) {
    const pathEntries = (process.env.PATH || '').split(';').map(item => item.trim()).filter(Boolean)
    const extensions = ['.ps1', '.cmd', '.exe', '.bat', '']
    for (const entry of pathEntries) {
      for (const extension of extensions) {
        const candidate = path.join(entry, `${command}${extension}`)
        if (fs.existsSync(candidate)) return candidate
      }
    }
  }
  try {
    const output = execFileSync(process.platform === 'win32' ? 'where.exe' : 'which', [command], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const candidates = output.split(/\r?\n/).map(item => item.trim()).filter(Boolean)
    if (process.platform === 'win32') {
      for (const candidate of candidates) {
        const powershellScript = `${candidate}.ps1`
        if (fs.existsSync(powershellScript)) return powershellScript
      }
      const preferred = candidates.find(candidate => /\.(cmd|bat|exe)$/i.test(candidate))
      return preferred || candidates[0] || command
    }
    return candidates[0] || command
  } catch {
    return command
  }
}

function commandArgs(command: string, args: string[]) {
  if (process.platform === 'win32' && command.toLowerCase().endsWith('.ps1')) {
    return {
      executable: 'powershell.exe',
      args: ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', command, ...args],
    }
  }
  if (command.toLowerCase().endsWith('.js')) {
    return { executable: process.execPath, args: [command, ...args] }
  }
  return { executable: command, args }
}

function readVersion(command: string) {
  try {
    const resolved = resolveCommand(command)
    const { executable, args } = commandArgs(resolved, ['--version'])
    return {
      resolvedPath: resolved,
      version: execFileSync(executable, args, {
        encoding: 'utf8',
        timeout: 8_000,
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim().split(/\r?\n/)[0],
    }
  } catch (error: any) {
    return { detail: error?.message || '命令不可执行' }
  }
}

export function detectLocalAgents(config?: LocalAgentConfig): LocalAgentStatus[] {
  let scannedModels: Record<string, string[]> = {}
  try {
    scannedModels = scanHostLocalModels()
  } catch {
    // ignore
  }

  return (['antigravity', 'claude-code', 'codex'] as LocalAgentProvider[]).map(provider => {
    const command = commandFromConfig(config, provider)

    if (provider === 'antigravity') {
      const userHome = process.env.USERPROFILE || process.env.HOME || ''
      const geminiDir = path.join(userHome, '.gemini', 'antigravity')
      const exeExists = fs.existsSync(command)
      const dataDirExists = fs.existsSync(geminiDir)
      const isAvailable = exeExists || dataDirExists

      const models = ['gemini-3.8-flash', 'gemini-2.5-pro', 'gemini-2.5-flash']
      return {
        provider,
        available: isAvailable,
        command,
        resolvedPath: exeExists ? command : geminiDir,
        version: isAvailable ? 'Antigravity 2.0' : undefined,
        detail: isAvailable ? 'Google 智能体开发工作台已就绪' : '未检测到 Antigravity 安装',
        models,
        defaultModel: models[0],
      }
    }

    const version = readVersion(command)
    const models = (scannedModels[provider] && scannedModels[provider].length > 0)
      ? scannedModels[provider]
      : (provider === 'claude-code'
          ? ['deepseek-flash', 'deepseek-reasoner', 'claude-3-7-sonnet', 'claude-3-5-sonnet']
          : ['gpt-6-luna', 'gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.5', 'o3-mini'])

    return {
      provider,
      available: Boolean(version.version),
      command,
      resolvedPath: version.resolvedPath,
      version: version.version,
      detail: version.detail,
      models,
      defaultModel: models[0],
    }
  })
}

export async function detectAllLocalAgents(config?: LocalAgentConfig): Promise<LocalAgentStatus[]> {
  const cliAgents = detectLocalAgents(config)

  const ollamaURL = config?.ollamaBaseURL || 'http://127.0.0.1:11434'
  let ollamaStatus: LocalAgentStatus = {
    provider: 'ollama',
    available: false,
    command: ollamaURL,
    detail: '未检测到 Ollama 服务运行 (端口 11434)',
    models: [],
  }
  try {
    const res = await fetch(`${ollamaURL}/api/tags`, { signal: AbortSignal.timeout(1500) })
    if (res.ok) {
      const data: any = await res.json()
      const models = (data.models || []).map((m: any) => m.name)
      ollamaStatus = {
        provider: 'ollama',
        available: true,
        command: ollamaURL,
        version: models.length > 0 ? `Ollama (${models.length} 个本地模型)` : 'Ollama 已连接 (暂无模型)',
        detail: '本地离线运行 · 0 Token 费用',
        models,
        defaultModel: models[0] || 'deepseek-r1:latest',
      }
    }
  } catch {
    // offline
  }

  const lmStudioURL = config?.lmStudioBaseURL || 'http://127.0.0.1:1234'
  let lmStudioStatus: LocalAgentStatus = {
    provider: 'lm-studio',
    available: false,
    command: lmStudioURL,
    detail: '未检测到 LM Studio 服务运行 (端口 1234)',
    models: [],
  }
  try {
    const res = await fetch(`${lmStudioURL}/v1/models`, { signal: AbortSignal.timeout(1500) })
    if (res.ok) {
      const data: any = await res.json()
      const models = (data.data || []).map((m: any) => m.id)
      lmStudioStatus = {
        provider: 'lm-studio',
        available: true,
        command: lmStudioURL,
        version: models.length > 0 ? `LM Studio (${models.length} 个模型)` : 'LM Studio 已连接',
        detail: '本地推理服务器 · 0 费用',
        models,
        defaultModel: models[0] || 'local-model',
      }
    }
  } catch {
    // offline
  }

  return [ollamaStatus, lmStudioStatus, ...cliAgents]
}


function extractTextFromJson(value: any): string {
  if (!value || typeof value !== 'object') return ''
  if (typeof value.delta?.text === 'string') return value.delta.text
  if (typeof value.event?.delta?.text === 'string') return value.event.delta.text
  if (typeof value.item?.text === 'string' && (
    value.item.type === 'agent_message' ||
    value.item.type === 'message'
  )) return value.item.text
  if (typeof value.result === 'string') return value.result
  if (typeof value.text === 'string') return value.text
  if (typeof value.content === 'string') return value.content
  if (Array.isArray(value.content)) {
    return value.content
      .map((item: any) => typeof item === 'string' ? item : item?.text || '')
      .join('')
  }
  if (typeof value.message?.content === 'string') return value.message.content
  if (Array.isArray(value.message?.content)) {
    return value.message.content.map((item: any) => item?.text || '').join('')
  }
  return ''
}

function isFinalJsonEvent(value: any) {
  return value?.type === 'result' || value?.type === 'final' || value?.type === 'response.completed'
}

function isTextJsonEvent(value: any) {
  return value?.type === 'content_block_delta' ||
    (value?.type === 'stream_event' && value.event?.type === 'content_block_delta') ||
    value?.type === 'item.completed' ||
    value?.type === 'response.output_text.delta'
}

function isValidUuid(id?: string): boolean {
  return Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
}

function buildClaudeArgs(options: LocalAgentRunOptions, safeSessionId: string) {
  const command = commandFromConfig(options.config, 'claude-code')
  const args = [
    '--print',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    '--permission-mode', 'acceptEdits',
    '--add-dir', options.cwd,
  ]
  if (options.model) args.push('--model', options.model)
  if (isValidUuid(options.sessionId)) {
    args.push('--resume', options.sessionId!)
  } else {
    args.push('--session-id', safeSessionId)
  }
  args.push(options.prompt)
  return commandArgs(resolveCommand(command), args)
}

function buildCodexArgs(options: LocalAgentRunOptions) {
  const command = commandFromConfig(options.config, 'codex')
  const args = [
    'exec',
    '--json',
    '--sandbox', 'workspace-write',
    '--skip-git-repo-check',
    '-C', options.cwd,
  ]
  if (options.model) args.push('--model', options.model)
  args.push(options.prompt)
  return commandArgs(resolveCommand(command), args)
}

function buildAntigravityArgs(options: LocalAgentRunOptions, sessionId: string) {
  const command = commandFromConfig(options.config, 'antigravity')
  const args = [
    '--prompt', options.prompt,
    '--cwd', options.cwd,
  ]
  if (options.model) args.push('--model', options.model)
  return commandArgs(resolveCommand(command), args)
}

function terminateProcess(child: ChildProcessWithoutNullStreams) {
  if (child.killed) return
  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], {
        stdio: 'ignore',
        timeout: 5_000,
      })
    } catch {
      try { child.kill() } catch { /* already exited */ }
    }
  } else {
    child.kill('SIGTERM')
  }
}

export async function* runLocalAgent(options: LocalAgentRunOptions): AsyncGenerator<LocalAgentEvent> {
  const safeSessionId = isValidUuid(options.sessionId) ? options.sessionId! : randomUUID()
  const built = options.provider === 'antigravity'
    ? buildAntigravityArgs(options, safeSessionId)
    : options.provider === 'claude-code'
      ? buildClaudeArgs(options, safeSessionId)
      : buildCodexArgs(options)

  const providerLabel = options.provider === 'antigravity' ? 'Antigravity' : options.provider === 'claude-code' ? 'Claude Code' : 'Codex'
  yield {
    type: 'status',
    provider: options.provider,
    content: `${providerLabel} 正在运行…`,
  }

  let child: ChildProcessWithoutNullStreams
  try {
    child = spawn(built.executable, built.args, {
      cwd: options.cwd,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    try { child.stdin.end() } catch {}
  } catch (error: any) {
    yield { type: 'error', provider: options.provider, content: error?.message || '本地 Agent 启动失败' }
    return
  }


  let emittedText = ''
  let stderr = ''
  let emittedSessionId = ''
  let spawnError: Error | null = null
  child.once('error', error => {
    spawnError = error
  })
  const closePromise = new Promise<number | null>(resolve => {
    child.once('close', resolve)
  })
  const abortHandler = () => terminateProcess(child)
  options.signal?.addEventListener('abort', abortHandler, { once: true })

  const emitJsonEvent = async function* (value: any): AsyncGenerator<LocalAgentEvent> {
    const eventSessionId = value?.session_id || value?.sessionId || value?.thread_id || value?.threadId
    if (eventSessionId) {
      emittedSessionId = String(eventSessionId)
      yield { type: 'session', provider: options.provider, sessionId: emittedSessionId }
    }

    const text = isTextJsonEvent(value)
      ? extractTextFromJson(value)
      : isFinalJsonEvent(value) && !emittedText ? extractTextFromJson(value) : ''
    if (text) {
      emittedText += text
      yield { type: 'text', provider: options.provider, content: text }
    }
  }

  const stdoutLines = readline.createInterface({ input: child.stdout })
  for await (const line of stdoutLines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      for await (const event of emitJsonEvent(JSON.parse(trimmed))) yield event
    } catch {
      emittedText += `${line}\n`
      yield { type: 'text', provider: options.provider, content: `${line}\n` }
    }
  }

  const stderrPromise = (async () => {
    for await (const line of readline.createInterface({ input: child.stderr })) {
      stderr += `${line}\n`
    }
  })()

  await stderrPromise

  const exitCode = await closePromise
  options.signal?.removeEventListener('abort', abortHandler)

  if (spawnError) {
    let friendlyMessage = spawnError.message || '本地 Agent 启动失败'
    if (friendlyMessage.includes('ENOENT')) {
      if (options.provider === 'claude-code') {
        friendlyMessage = `未在系统环境变量 PATH 中检测到 Claude Code 命令行程序 (claude)。\n\n💡 **快速解决指引**：\n1. **直接聊天（推荐）**：请点击页面顶部的【☁️ 云端双核】标签，即可直接使用配置的 DeepSeek / Claude 云端大模型进行伴学问答；\n2. **如需本地 Agent**：请在电脑终端中执行 \`npm install -g @anthropic-ai/claude-code\` 完成全局安装。`
      } else if (options.provider === 'codex') {
        friendlyMessage = `未在系统环境变量 PATH 中检测到 Codex 命令行程序 (codex)。\n\n💡 **快速解决指引**：\n1. **直接聊天（推荐）**：请点击页面顶部的【☁️ 云端双核】标签；\n2. **如需使用 Codex**：请检查本地 Codex 安装与系统 PATH 环境变量配置。`
      }
    }
    yield {
      type: 'error',
      provider: options.provider,
      content: friendlyMessage,
    }
    return
  }

  if (exitCode !== 0 && !options.signal?.aborted) {
    let errText = stderr.trim()
    if (errText.includes('models_cache.json') || errText.includes('model_catalog_json')) {
      errText = `Codex 运行时缓存文件损坏 (缺少新版字段)。\n\n💡 **解决指引**：\n1. **直接聊天**：请点击页面顶部的【☁️ 云端双核】标签；\n2. **修复 Codex**：请删除或重命名 \`C:\\Users\\QTS的天选\\.codex\\models_cache.json\` 缓存文件，让 Codex 自动重新同步。`
    }
    yield {
      type: 'error',
      provider: options.provider,
      content: errText || `${options.provider} 进程异常退出 (退出码：${exitCode})`,
    }
    return
  }

  if (!emittedText && stderr.trim()) {
    yield { type: 'text', provider: options.provider, content: stderr.trim() }
  }
  if (!emittedSessionId) {
    yield { type: 'session', provider: options.provider, sessionId }
  }
  yield { type: 'done', provider: options.provider }
}
