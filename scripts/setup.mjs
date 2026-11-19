#!/usr/bin/env node
/**
 * CoreForge 研核 · 开源用户一键初始化脚本 (npm run setup)
 * 安全无侵入：绝不覆盖已存在的 server/config.json，仅在首次复刻时生成初始模板
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const configTarget = path.join(rootDir, 'server', 'config.json')
const configExample = path.join(rootDir, 'server', 'config.example.json')

console.log('\n🚀 正在初始化 CoreForge 研核开源运行环境...')

if (!fs.existsSync(configTarget)) {
  if (fs.existsSync(configExample)) {
    fs.copyFileSync(configExample, configTarget)
    console.log('✅ 已根据 server/config.example.json 生成初始配置文件：server/config.json')
  }
} else {
  console.log('ℹ️ 检测到已存在 server/config.json，保留您当前的生产/本地配置不做覆盖。')
}

// 运行一次完整的环境健康体检
execFileSync(process.execPath, [path.join(__dirname, 'doctor.mjs')], {
  stdio: 'inherit',
})
