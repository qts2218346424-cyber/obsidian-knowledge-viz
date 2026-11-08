import fs from 'fs'
import path from 'path'
import type { Request } from 'express'
import { config, runtimeDataDir } from '../context.js'

/**
 * CoreForge 多租户用户沙箱隔离引擎
 * 确保每个用户独享独立的笔记空间 (Vault) 与独享的 AI 长期记忆空间 (Memory)
 */

export const USERS_ROOT_DIR = process.env.KNOWLEDGE_VIZ_USERS_DIR || path.join(runtimeDataDir, 'data', 'users')

// 确保用户沙箱根存储目录存在
if (!fs.existsSync(USERS_ROOT_DIR)) {
  fs.mkdirSync(USERS_ROOT_DIR, { recursive: true })
}

/**
 * 获取指定用户的专属根沙箱目录
 */
export function getUserSpaceDir(userId: string): string {
  const safeId = sanitizeId(userId)
  return path.join(USERS_ROOT_DIR, safeId)
}

/**
 * 获取指定用户的独享笔记空间 (Vault) 目录
 */
export function getUserVaultDir(userId: string): string {
  return path.join(getUserSpaceDir(userId), 'vault')
}

/**
 * 获取指定用户的独享 AI 记忆空间 (Memory) 目录
 */
export function getUserMemoryDir(userId: string): string {
  return path.join(getUserSpaceDir(userId), 'memory')
}

/**
 * 获取指定用户的独享 agent.md 记忆文件绝对路径
 */
export function getUserAgentMemoryPath(userId: string): string {
  return path.join(getUserMemoryDir(userId), 'agent.md')
}

/**
 * 从当前 Express 请求中解析当前用户的独立 Vault 目录
 * 若当前已登录，返回其私有专属沙箱；若未登录，回退到全局公共路径 (向后兼容)
 */
export function getRequestVaultPath(req: Request): string {
  if (req.user?.id) {
    const userVault = getUserVaultDir(req.user.id)
    if (!fs.existsSync(userVault)) {
      ensureUserSandboxSync(req.user.id, req.user.username)
    }
    return userVault
  }
  return config.vaultPath
}

/**
 * 从当前 Express 请求中解析当前用户的独立 AI 记忆文件路径
 */
export function getRequestAgentMemoryPath(req: Request): string {
  if (req.user?.id) {
    const memPath = getUserAgentMemoryPath(req.user.id)
    if (!fs.existsSync(memPath)) {
      ensureUserSandboxSync(req.user.id, req.user.username)
    }
    return memPath
  }
  // 未登录时回退到全局 agent.md
  return path.join(config.vaultPath, 'agent.md')
}

/**
 * 高安全级别沙箱路径解析与防穿透防御 (Path Traversal Protection)
 * 严格确保目标路径必须落在指定用户的 vault 目录内，任何尝试以 `../` 越权的操作直接拦截并抛出异常
 */
export function resolveSafeUserVaultPath(
  userId: string,
  relativePath: string
): { safeVaultDir: string; safeFullPath: string; safeRelative: string } {
  const safeVaultDir = path.resolve(getUserVaultDir(userId))
  
  // 规范化相对路径
  const normalizedRelative = relativePath.replace(/^[/\\]+/, '')
  const safeFullPath = path.resolve(safeVaultDir, normalizedRelative)

  // 严格安全守卫：完整路径必须以安全沙箱目录开头
  if (!safeFullPath.startsWith(safeVaultDir)) {
    throw new Error(`安全违规拦截：检测到非法路径穿越攻击 [${relativePath}]`)
  }

  const finalRelative = path.relative(safeVaultDir, safeFullPath).replace(/\\/g, '/')
  return {
    safeVaultDir,
    safeFullPath,
    safeRelative: finalRelative,
  }
}

/**
 * 初始化用户专属沙箱（创建私有 Vault 目录、私有 Memory 目录与官方初始研学种子）
 */
export function ensureUserSandboxSync(userId: string, username: string): void {
  const userVault = getUserVaultDir(userId)
  const userMemory = getUserMemoryDir(userId)

  if (!fs.existsSync(userVault)) {
    fs.mkdirSync(userVault, { recursive: true })
  }
  if (!fs.existsSync(userMemory)) {
    fs.mkdirSync(userMemory, { recursive: true })
  }

  // 1. 注入初始研学文件夹骨架
  const subDirs = ['01-408核心考点', '02-考研数学公式推导', '03-真题错题归因']
  for (const sub of subDirs) {
    const dir = path.join(userVault, sub)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  }

  // 2. 注入专属官方指引手册
  const guideFilePath = path.join(userVault, '💡 新手指引 · CoreForge 研核完全使用手册.md')
  if (!fs.existsSync(guideFilePath)) {
    const initialGuideContent = `---
title: 💡 新手指引 · CoreForge 研核完全使用手册
date: ${new Date().toISOString().split('T')[0]}
author: ${username}
tags:
  - 研学空间
  - 408考研
  - 考研数学
---

# 💡 ${username} 的专属研学工作台

欢迎来到属于您个人的 **CoreForge 研核** 独享空间！
本目录内的所有笔记与错题均完全归您一人独享，受系统级物理沙箱安全保护。

## 🎯 专属三大空间
1. **独享笔记空间**：支持双链写作与 LaTeX 实时公式推导。
2. **独享 AI 记忆空间**：记录您的目标院校、薄弱考点与提问偏好。
3. **独享做题档案**：真题训练得分与 SM-2 艾宾浩斯复习流自动沉淀。
`
    fs.writeFileSync(guideFilePath, initialGuideContent, 'utf-8')
  }

  // 3. 注入专属初始 agent.md 记忆文件
  const agentMemoryPath = getUserAgentMemoryPath(userId)
  if (!fs.existsSync(agentMemoryPath)) {
    const defaultAgentMarkdown = `---
name: "研小核 (CoreForge AI)"
role: "408计算机与考研数学专属伴学导师"
tone: "严谨犀利、亲和鼓舞、启发式推演"
avatarEmoji: "🤖"
version: "1.5.0"
lastUpdated: "${new Date().toISOString().split('T')[0]}"
---

# 🤖 伴学导师系统画像
- **定位**：专注考研 408 与考研数学的高阶私教导师。
- **对话准则**：公式严谨采用标准 LaTeX，分步推导，不直接透露终解。

# 🎯 考生专属个性化档案 (UserProfile)
- **考生用户名**：${username}
- **目标考试**：全国统考 408 计算机综合 + 考研数学 (数一/二/三)
- **当前备考阶段**：基础夯实与真题专项攻坚
- **专属薄弱考点清单**：
  - 计组：CPU流水线冒险冲突与 Forwarding
  - 操作系统：虚拟内存分页置换与TLB命中率
  - 高数：泰勒公式未定式极限展开
  - 数据结构：图的拓扑排序与关键路径

# 🧭 考生专属指导指令集 (Directives)
- [dir-01] 遇到算法题时优先给出示意图与复杂度分析。
- [dir-02] 针对错题主动提醒进行四维归因诊断。
`
    fs.writeFileSync(agentMemoryPath, defaultAgentMarkdown, 'utf-8')
  }
}

/**
 * 过滤文件名安全字符
 */
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_')
}
