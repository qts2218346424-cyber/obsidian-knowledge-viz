#!/usr/bin/env tsx
/**
 * CoreForge 研核 · 电脑环境全自动智能探测与一键装配工具 (npm run autoconfig)
 * 专为小白用户设计：全盘扫描本机 Obsidian 知识库、本地 Agents 与 AI 配置，0 门槛自动装配！
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanObsidianVaults, extractVaultAiCredentials } from '../server/services/auto-detector.js'
import { detectAllLocalAgents } from '../server/local-agent-bridge.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const configPath = path.join(rootDir, 'server', 'config.json')
const configExample = path.join(rootDir, 'server', 'config.example.json')

const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const MAGENTA = '\x1b[35m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const RESET = '\x1b[0m'

async function main() {
  console.log(`\n${CYAN}${BOLD}⚡ CoreForge 研核 · 电脑环境全自动智能探测与一键装配${RESET}`)
  console.log(`${DIM}${'─'.repeat(70)}${RESET}`)
  console.log(`${DIM}正在深度扫描您的电脑配置，无需手动查找文件夹或端口...${RESET}\n`)

  // 1. 扫描 Obsidian 知识库
  console.log(`${BOLD}1. 正在寻找电脑上的 Obsidian 知识库...${RESET}`)
  const vaults = scanObsidianVaults()
  let selectedVault = vaults[0]

  if (vaults.length > 0) {
    console.log(`${GREEN}[✓] 成功检测到 ${vaults.length} 个本地 Obsidian 知识库：${RESET}`)
    vaults.forEach((v, idx) => {
      const activeMark = v.isOpen ? ` ${MAGENTA}(Obsidian 当前正在使用)${RESET}` : ''
      const recMark = idx === 0 ? ` ${GREEN}★ 智能推荐绑定${RESET}` : ''
      console.log(`    ${idx + 1}. [${BOLD}${v.name}${RESET}] ${v.path}${activeMark}${recMark}`)
    })
  } else {
    console.log(`${YELLOW}[!] 未在常见位置检测到已打开的 Obsidian 知识库。${RESET}`)
    const samplePath = path.join(rootDir, 'sample-vault')
    if (fs.existsSync(samplePath)) {
      selectedVault = { id: 'sample', name: 'sample-vault', path: samplePath, isOpen: false }
      console.log(`    ${DIM}自动选用系统自带的高质量考研体验知识库：${samplePath}${RESET}`)
    }
  }

  // 2. 扫描本地智能体
  console.log(`\n${BOLD}2. 正在探测本机超级智能体与本地离线推理引擎...${RESET}`)
  let currentCfg: any = {}
  try {
    if (fs.existsSync(configPath)) {
      currentCfg = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    } else if (fs.existsSync(configExample)) {
      currentCfg = JSON.parse(fs.readFileSync(configExample, 'utf8'))
    }
  } catch {}

  const agents = await detectAllLocalAgents(currentCfg.localAgents)
  const availableAgents = agents.filter(a => a.available)

  if (availableAgents.length > 0) {
    console.log(`${GREEN}[✓] 成功识别到 ${availableAgents.length} 个已就绪的本机智能体：${RESET}`)
    availableAgents.forEach(a => {
      console.log(`    • ${BOLD}${a.provider.padEnd(14)}${RESET} ${a.version || '已就绪'} ${DIM}(${a.detail || a.command})${RESET}`)
    })
  } else {
    console.log(`${YELLOW}[!] 未检测到已安装的本地 CLI 智能体（可通过云端 API 极速伴学，或纯离线使用）${RESET}`)
  }

  // 3. 扫描插件已保存的 AI 密钥
  console.log(`\n${BOLD}3. 正在检索知识库中已配置的 AI 密钥与插件...${RESET}`)
  let discoveredAi: any = null
  if (selectedVault) {
    discoveredAi = extractVaultAiCredentials(selectedVault.path)
  }
  if (!discoveredAi) {
    for (const v of vaults) {
      discoveredAi = extractVaultAiCredentials(v.path)
      if (discoveredAi) break
    }
  }

  if (discoveredAi) {
    console.log(`${GREEN}[✓] 在 Obsidian 插件 [${discoveredAi.sourcePlugin}] 中找到已配置的 AI 凭证！${RESET}`)
    console.log(`    • 接口服务商: ${discoveredAi.provider}`)
    console.log(`    • Base URL  : ${discoveredAi.baseURL}`)
    console.log(`    • 绑定模型  : ${discoveredAi.model}`)
    console.log(`    • 密钥掩码  : ${discoveredAi.apiKey.slice(0, 6)}...${discoveredAi.apiKey.slice(-4)}`)
  } else {
    console.log(`${DIM}    未检测到第三方插件 AI 密钥，将保留当前配置。${RESET}`)
  }

  // 4. 一键自动写盘
  console.log(`\n${BOLD}4. 正在为您自动合成最优配置...${RESET}`)
  const newConfig = { ...currentCfg }

  if (selectedVault) {
    newConfig.vaultPath = selectedVault.path
  }
  if (!newConfig.port) newConfig.port = 3001
  if (!newConfig.host) newConfig.host = '127.0.0.1'

  if (discoveredAi && !newConfig.ai?.apiKey) {
    newConfig.ai = {
      ...newConfig.ai,
      apiKey: discoveredAi.apiKey,
      baseURL: discoveredAi.baseURL || 'https://api.openai.com/v1',
      model: discoveredAi.model || 'gpt-4o',
      provider: discoveredAi.provider,
      apiFormat: 'openai',
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8')

  console.log(`${DIM}${'─'.repeat(70)}${RESET}`)
  console.log(`${GREEN}${BOLD}🎉 全自动电脑适配完成！配置已安全写入 server/config.json${RESET}`)
  console.log(`    • 挂载知识库: ${BOLD}${newConfig.vaultPath}${RESET}`)
  console.log(`    • 智能体状态: ${availableAgents.length > 0 ? `${availableAgents.map(a => a.provider).join(', ')} (全权管理生效)` : '云端/离线自适应'}`)
  console.log(`\n${CYAN}▶ 立即启动享受本地全权研学：npm run dev:all${RESET}\n`)
}

main().catch(err => {
  console.error(`${YELLOW}[!] 自动探测过程中出现提示: ${err.message}${RESET}`)
})
