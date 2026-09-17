import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

export type LocalAgentProvider = 'claude-code' | 'codex' | 'ollama' | 'lm-studio' | 'web'

export interface LocalAgentConfig {
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
  if (provider === 'claude-code') return config?.claudeCommand || 'claude'
  return config?.codexCommand || 'codex'
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
  return (['claude-code', 'codex'] as LocalAgentProvider[]).map(provider => {
    const command = commandFromConfig(config, provider)
    const version = readVersion(command)
    return {
      provider,
      available: Boolean(version.version),
      command,
      resolvedPath: version.resolvedPath,
      version: version.version,
      detail: version.detail,
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

function buildClaudeArgs(options: LocalAgentRunOptions, sessionId: string) {
  const command = options.config?.claudeCommand || 'claude'
  const args = [
    '--print',
    '--output-format', 'stream-json',
    '--include-partial-messages',
    '--verbose',
    '--permission-mode', 'acceptEdits',
    '--add-dir', options.cwd,
    '--model', options.model || 'sonnet',
  ]
  if (options.sessionId) args.push('--resume', options.sessionId)
  else args.push('--session-id', sessionId)
  args.push(options.prompt)
  return commandArgs(resolveCommand(command), args)
}

function buildCodexArgs(options: LocalAgentRunOptions) {
  const command = options.config?.codexCommand || 'codex'
  const args = [
    'exec',
    '--json',
    '--sandbox', 'workspace-write',
    '--skip-git-repo-check',
    '-C', options.cwd,
  ]
  if (options.sessionId) args.splice(1, 0, 'resume', options.sessionId)
  if (options.model) args.push('--model', options.model)
  args.push(options.prompt)
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
  const sessionId = options.sessionId || randomUUID()
  const built = options.provider === 'claude-code'
    ? buildClaudeArgs(options, sessionId)
    : buildCodexArgs(options)

  yield {
    type: 'status',
    provider: options.provider,
    content: `${options.provider === 'claude-code' ? 'Claude Code' : 'Codex'} 正在运行…`,
  }

  let child: ChildProcessWithoutNullStreams
  try {
    child = spawn(built.executable, built.args, {
      cwd: options.cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
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
    yield {
      type: 'error',
      provider: options.provider,
      content: spawnError.message || 'Local agent start failed',
    }
    return
  }
  if (exitCode !== 0 && !options.signal?.aborted) {
    yield {
      type: 'error',
      provider: options.provider,
      content: stderr.trim() || `${options.provider} 退出码：${exitCode}`,
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
