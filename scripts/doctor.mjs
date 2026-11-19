#!/usr/bin/env node
/**
 * CoreForge 研核 · 跨平台本地智能体环境自检工具 (npm run doctor)
 * 帮助所有开源用户快速诊断本机 Claude Code / Antigravity / Ollama / 知识库配置状态
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const DIM = '\x1b[2m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

function checkCommand(cmd) {
  try {
    const tool = process.platform === 'win32' ? 'where.exe' : 'which'
    const out = execFileSync(tool, [cmd], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    return out.split(/\r?\n/)[0] || null
  } catch {
    return null
  }
}

async function checkHttp(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1200) })
    return res.ok
  } catch {
    return false
  }
}

function printRow(ok, label, detail, fixHint) {
  const icon = ok ? `${GREEN}[✓]${RESET}` : `${YELLOW}[!]${RESET}`
  console.log(`${icon} ${BOLD}${label.padEnd(22)}${RESET} ${detail}`)
  if (!ok && fixHint) {
    console.log(`    ${DIM}└─► 指引：${fixHint}${RESET}`)
  }
}

async function main() {
  console.log(`\n${CYAN}${BOLD}⚡ CoreForge 研核 · 本地研学与智能体环境体检 (System Doctor)${RESET}`)
  console.log(`${DIM}${'─'.repeat(68)}${RESET}`)

  // 1. Node.js
  const nodeMajor = Number(process.version.replace(/^v/, '').split('.')[0]) || 0
  printRow(
    nodeMajor >= 20,
    'Node.js 运行时',
    `${process.version} (${os.platform()} ${os.arch()})`,
    '推荐升级至 Node.js 20 LTS 及以上版本'
  )

  // 2. 配置文件
  const configPath = path.join(rootDir, 'server', 'config.json')
  const hasConfig = fs.existsSync(configPath)
  let parsedConfig = null
  if (hasConfig) {
    try {
      parsedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    } catch {}
  }
  printRow(
    hasConfig,
    '核心配置文件',
    hasConfig ? '已就绪 (server/config.json)' : '尚未生成 server/config.json（将自动使用兜底配置）',
    '运行 npm run setup 一键生成初始配置模板'
  )

  // 3. 知识库路径
  const vaultPath = parsedConfig?.vaultPath || process.env.COREFORGE_VAULT_PATH || ''
  const vaultOk = Boolean(vaultPath && fs.existsSync(vaultPath))
  printRow(
    vaultOk,
    'Obsidian 知识库',
    vaultOk ? `已挂载：${vaultPath}` : '未绑定自定义目录（启动后可在【设置】页随时指定）',
    '在设置页选择你的 Obsidian Vault 文件夹，或体验内置 sample-vault'
  )

  // 4. 本地超级智能体探测
  const claudePath = checkCommand('claude')
  printRow(
    Boolean(claudePath),
    'Claude Code CLI',
    claudePath ? `已检测：${claudePath}` : '未安装（可选，高阶宿主全权伴读引擎）',
    'npm install -g @anthropic-ai/claude-code && claude login'
  )

  const agyPath = checkCommand('agy') || checkCommand('antigravity')
  const agyDataDir = path.join(os.homedir(), '.gemini', 'antigravity')
  const agyReady = Boolean(agyPath || fs.existsSync(agyDataDir))
  printRow(
    agyReady,
    'Google Antigravity',
    agyReady ? `已检测：${agyPath || agyDataDir}` : '未安装（可选，双核自主智能体引擎）',
    '安装 Google Antigravity 桌面端或全局 agy CLI'
  )

  const codexPath = checkCommand('codex')
  printRow(
    Boolean(codexPath),
    'OpenAI Codex CLI',
    codexPath ? `已检测：${codexPath}` : '未安装（可选，终端代码诊断引擎）',
    'npm install -g @openai/codex'
  )

  // 5. 本地离线模型服务
  const ollamaOk = await checkHttp('http://127.0.0.1:11434/api/tags')
  printRow(
    ollamaOk,
    'Ollama 本地推理',
    ollamaOk ? '服务运行中 (http://127.0.0.1:11434)' : '未运行（可选，0 Token 本地离线推理）',
    '安装并启动 Ollama (https://ollama.com)'
  )

  // 6. 云端兜底 API
  const hasCloudKey = Boolean(parsedConfig?.ai?.apiKey || process.env.COREFORGE_AI_API_KEY)
  printRow(
    hasCloudKey,
    '云端大模型 API',
    hasCloudKey ? `已配置 (${parsedConfig?.ai?.model || process.env.COREFORGE_AI_MODEL || '自定义模型'})` : '未配置（可在 Web 设置页一键填入 DeepSeek / OpenAI 兼容密钥）',
    '无需本地显卡，1 元 DeepSeek API 即可获得极速云端伴学体验'
  )

  console.log(`${DIM}${'─'.repeat(68)}${RESET}`)
  console.log(`${GREEN}提示：即使暂不配置任何 AI，真题刷题、算法实验室、SM-2 闪卡与图谱也可 100% 离线运行！${RESET}`)
  console.log(`${CYAN}▶ 立即启动研发体验：npm run dev:all${RESET}\n`)
}

main()
