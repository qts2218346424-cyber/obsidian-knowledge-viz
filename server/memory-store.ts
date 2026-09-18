import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { config, runtimeDataDir } from './context.js'

export interface AgentPersona {
  name: string
  role: string
  tone: string
  avatarEmoji: string
  summary: string
}

export interface AgentDirective {
  id: string
  title: string
  content: string
  category: 'behavior' | 'knowledge' | 'preference' | 'habit'
  enabled: boolean
  lastUpdated: string
}

export interface UserProfileContext {
  targetExam: string
  targetSchool: string
  userBackground: string
  currentStage: string
  weakPoints: string[]
  customPreferences: string[]
}

export interface AgentMemoryConfig {
  persona: AgentPersona
  rules: string[]
  userProfile: UserProfileContext
  directives: AgentDirective[]
  lastUpdated: string
}

const DEFAULT_PERSONA: AgentPersona = {
  name: '研小核 (CoreForge AI)',
  role: '408计算机与考研数学全科专属金牌导师兼知识库管家',
  tone: '严谨犀利、亲和鼓舞、启发式推演、直击考纲考点',
  avatarEmoji: '🤖',
  summary: '清北复交级计算机408与考研数学教研伴学导师，具备全自主 Obsidian 知识库管理与双链治理能力。',
}

const DEFAULT_RULES: string[] = [
  '公式规范：所有数学与算法推导必须采用标准 LaTeX / KaTeX 格式（行内 $...$，独立行间公式 $$...$$）。',
  '代码规范：数据结构与操作系统算法默认采用标准 C/C++ 语法，关键代码段落必须附带【时间复杂度】与【空间复杂度】分析。',
  '双链联动：提及知识库既有内容或核心考点时，主动使用 [[笔记名称]] 双向链接语法。',
  '错题归档：发现用户答错高频真题时，主动提醒是否一键归档到知识库错题本 (wiki/03-真题与错题/) 并给出四维归因诊断。',
  '修改慎重：修改或补充既有笔记前，先调用 read_file 读取原文并向用户明确告知改动原因。',
  '大纲聚焦：严格遵循教育部 408 统考与全国研究生招生数学考试大纲命题规律，严禁超纲拓展偏怪离谱内容。',
]

const DEFAULT_USER_PROFILE: UserProfileContext = {
  targetExam: '全国统考 408 计算机学科综合 + 考研数学 (数学一/二/三)',
  targetSchool: '目标双一流 / 顶级计算机院所',
  userBackground: '计算机跨考 / 科班攻坚生，追求高效率框架学习与实战刷题',
  currentStage: '强化冲刺与真题攻坚阶段',
  weakPoints: [
    '计组：CPU五级流水线冒险冲突与 Forwarding',
    '高数：泰勒展开截断阶数与极限未定式',
    '数据结构：AVL树旋转平衡化与外部排序',
    '网络：TCP拥塞控制状态机与快重传',
  ],
  customPreferences: [
    '偏好“直观几何/物理图景先于纯数学证明”',
    '偏好“一题多解对比分析与错因归因（概念/公式/计算/审题）”',
    '每道大题解答完毕后附带 1 道高频同类变式题供即时巩固',
  ],
}

const DEFAULT_DIRECTIVES: AgentDirective[] = [
  {
    id: 'dir-01',
    title: '算法大题图解优先',
    content: '遇到二叉树、图遍历或算法设计题时，先给出 ASCII 时序或拓扑图示，再写出规范伪代码与时空复杂度分析。',
    category: 'behavior',
    enabled: true,
    lastUpdated: '2026-09-18',
  },
  {
    id: 'dir-02',
    title: '极限展开截断对齐',
    content: '泰勒展开求未定式极限时，反复核验分母与分子展开截断阶数是否一致，严禁在加减项中违规部分等价代换。',
    category: 'knowledge',
    enabled: true,
    lastUpdated: '2026-09-18',
  },
  {
    id: 'dir-03',
    title: '知识库格式对齐',
    content: '整理或新建笔记时，严格生成符合 Obsidian 标准的 Frontmatter 元数据标签与相关考点双向链接。',
    category: 'habit',
    enabled: true,
    lastUpdated: '2026-09-18',
  },
  {
    id: 'dir-04',
    title: '启发式思考梯级引导',
    content: '当用户询问解题思路卡壳时，不要直接扔出最终答案，先给出 1~2 个关键跳板启发用户自主推演。',
    category: 'behavior',
    enabled: true,
    lastUpdated: '2026-09-18',
  },
  {
    id: 'dir-05',
    title: '举一反三变式训练',
    content: '每次解题或剖析难点完成后，根据所涉考点自动附带 1 道真题同类变式题供即时自测巩固。',
    category: 'preference',
    enabled: true,
    lastUpdated: '2026-09-18',
  },
]

/**
 * Determine the primary agent.md location
 */
export function getAgentMemoryPath(vaultPath?: string): string {
  const vPath = vaultPath || config.vaultPath
  if (vPath && fs.existsSync(vPath)) {
    // If wiki exists, prefer wiki/agent.md or vault root agent.md
    const wikiAgent = path.join(vPath, 'wiki', 'agent.md')
    if (fs.existsSync(wikiAgent)) return wikiAgent

    const rootAgent = path.join(vPath, 'agent.md')
    return rootAgent
  }

  // Fallback to local server data dir
  const serverDataDir = path.join(runtimeDataDir, 'server', 'data')
  if (!fs.existsSync(serverDataDir)) {
    fs.mkdirSync(serverDataDir, { recursive: true })
  }
  return path.join(serverDataDir, 'agent.md')
}

/**
 * Serialize AgentMemoryConfig into standard human-readable agent.md markdown
 */
export function formatAgentMarkdown(cfg: AgentMemoryConfig): string {
  const frontmatter = {
    name: cfg.persona.name,
    role: cfg.persona.role,
    tone: cfg.persona.tone,
    avatarEmoji: cfg.persona.avatarEmoji || '🤖',
    version: '1.5.0',
    lastUpdated: cfg.lastUpdated || new Date().toISOString().split('T')[0],
  }

  const lines: string[] = []
  lines.push('---')
  lines.push(`name: "${frontmatter.name.replace(/"/g, '\\"')}"`)
  lines.push(`role: "${frontmatter.role.replace(/"/g, '\\"')}"`)
  lines.push(`tone: "${frontmatter.tone.replace(/"/g, '\\"')}"`)
  lines.push(`avatarEmoji: "${frontmatter.avatarEmoji}"`)
  lines.push(`version: "${frontmatter.version}"`)
  lines.push(`lastUpdated: "${frontmatter.lastUpdated}"`)
  lines.push('---')
  lines.push('')
  lines.push('# 🤖 CoreForge 智能体设定与记忆仓库 (agent.md)')
  lines.push('')
  lines.push('> 这是我对 AI 伴学助手的核心人设、行为准则与长期记忆设定。AI 在所有对话、解题与笔记管理中严格遵循本设定。')
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 🎭 一、角色定位与人设 (Identity & Persona)')
  lines.push(`- **助手名称**：${cfg.persona.name}`)
  lines.push(`- **角色定位**：${cfg.persona.role}`)
  lines.push(`- **语气风格**：${cfg.persona.tone}`)
  lines.push(`- **专长概述**：${cfg.persona.summary}`)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 📜 二、全局行为准则与响应规则 (Behavioral Directives)')
  for (const rule of cfg.rules) {
    lines.push(`- ${rule}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 👤 三、考生档案与备考画像 (User Profile & Context)')
  lines.push(`- **目标考向**：${cfg.userProfile.targetExam}`)
  lines.push(`- **目标院校**：${cfg.userProfile.targetSchool}`)
  lines.push(`- **考生背景**：${cfg.userProfile.userBackground}`)
  lines.push(`- **当前阶段**：${cfg.userProfile.currentStage}`)
  lines.push('- **薄弱考点预警**：')
  for (const wp of cfg.userProfile.weakPoints) {
    lines.push(`  - ${wp}`)
  }
  lines.push('- **学习偏好**：')
  for (const cp of cfg.userProfile.customPreferences) {
    lines.push(`  - ${cp}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## 🧠 四、活跃长效记忆片段 (Active Long-Term Directives)')
  lines.push('<!-- DIRECTIVES_START -->')
  for (const dir of cfg.directives) {
    const check = dir.enabled ? '[x]' : '[ ]'
    lines.push(`- ${check} <!-- id:${dir.id} cat:${dir.category} --> **[${dir.title}]** ${dir.content}`)
  }
  lines.push('<!-- DIRECTIVES_END -->')
  lines.push('')

  return lines.join('\n')
}

/**
 * Parse agent.md markdown into structured AgentMemoryConfig
 */
export function parseAgentMarkdown(raw: string): AgentMemoryConfig {
  try {
    const { data: fm, content } = matter(raw)

    const persona: AgentPersona = {
      name: (fm.name as string) || DEFAULT_PERSONA.name,
      role: (fm.role as string) || DEFAULT_PERSONA.role,
      tone: (fm.tone as string) || DEFAULT_PERSONA.tone,
      avatarEmoji: (fm.avatarEmoji as string) || DEFAULT_PERSONA.avatarEmoji,
      summary: DEFAULT_PERSONA.summary,
    }

    const rules: string[] = []
    const weakPoints: string[] = []
    const customPreferences: string[] = []
    const directives: AgentDirective[] = []

    // Section parser
    const lines = content.split('\n')
    let currentSection = ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('## 🎭') || trimmed.includes('角色定位')) {
        currentSection = 'persona'
        continue
      }
      if (trimmed.startsWith('## 📜') || trimmed.includes('行为准则')) {
        currentSection = 'rules'
        continue
      }
      if (trimmed.startsWith('## 👤') || trimmed.includes('考生档案')) {
        currentSection = 'userProfile'
        continue
      }
      if (trimmed.startsWith('## 🧠') || trimmed.includes('长效记忆')) {
        currentSection = 'directives'
        continue
      }

      if (currentSection === 'persona') {
        if (trimmed.startsWith('- **专长概述**：')) {
          persona.summary = trimmed.replace('- **专长概述**：', '').trim()
        }
      } else if (currentSection === 'rules') {
        if (trimmed.startsWith('- ')) {
          rules.push(trimmed.slice(2).trim())
        }
      } else if (currentSection === 'userProfile') {
        if (trimmed.startsWith('- **薄弱考点预警**：') || trimmed.startsWith('- **学习偏好**：')) {
          continue
        }
        if (line.startsWith('  - ')) {
          const val = line.slice(4).trim()
          if (val) weakPoints.push(val)
        }
      } else if (currentSection === 'directives') {
        // match checkbox directives: - [x] <!-- id:dir-01 cat:behavior --> **[title]** content
        const match = trimmed.match(/^-\s*\[([ xX])\]\s*(?:<!--\s*id:([^\s]+)\s*cat:([^\s]+)\s*-->)?\s*\*\*\[(.*?)\]\*\*\s*(.*)$/)
        if (match) {
          const enabled = match[1].toLowerCase() === 'x'
          const id = match[2] || `dir-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
          const category = (match[3] as any) || 'behavior'
          const title = match[4].trim()
          const content = match[5].trim()
          directives.push({
            id,
            title,
            content,
            category,
            enabled,
            lastUpdated: new Date().toISOString().split('T')[0],
          })
        }
      }
    }

    return {
      persona,
      rules: rules.length > 0 ? rules : DEFAULT_RULES,
      userProfile: {
        ...DEFAULT_USER_PROFILE,
        weakPoints: weakPoints.length > 0 ? weakPoints : DEFAULT_USER_PROFILE.weakPoints,
        customPreferences: customPreferences.length > 0 ? customPreferences : DEFAULT_USER_PROFILE.customPreferences,
      },
      directives: directives.length > 0 ? directives : DEFAULT_DIRECTIVES,
      lastUpdated: (fm.lastUpdated as string) || new Date().toISOString().split('T')[0],
    }
  } catch (err) {
    console.error('Failed to parse agent.md, using default config:', err)
    return {
      persona: DEFAULT_PERSONA,
      rules: DEFAULT_RULES,
      userProfile: DEFAULT_USER_PROFILE,
      directives: DEFAULT_DIRECTIVES,
      lastUpdated: new Date().toISOString().split('T')[0],
    }
  }
}

/**
 * Load full Agent Memory Config
 */
export function loadAgentMemoryConfig(vaultPath?: string): {
  config: AgentMemoryConfig
  rawMarkdown: string
  filePath: string
} {
  const filePath = getAgentMemoryPath(vaultPath)
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8')
      const parsed = parseAgentMarkdown(raw)
      return { config: parsed, rawMarkdown: raw, filePath }
    } catch (err) {
      console.error('Error reading agent.md from disk:', err)
    }
  }

  // Initialize with default
  const defConfig: AgentMemoryConfig = {
    persona: DEFAULT_PERSONA,
    rules: DEFAULT_RULES,
    userProfile: DEFAULT_USER_PROFILE,
    directives: DEFAULT_DIRECTIVES,
    lastUpdated: new Date().toISOString().split('T')[0],
  }
  const rawMarkdown = formatAgentMarkdown(defConfig)

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, rawMarkdown, 'utf8')
  } catch (e) {
    console.error('Could not write default agent.md to disk:', e)
  }

  return { config: defConfig, rawMarkdown, filePath }
}

/**
 * Save structured Agent Memory Config back to agent.md
 */
export function saveAgentMemoryConfig(cfg: AgentMemoryConfig, vaultPath?: string): {
  success: boolean
  filePath: string
  rawMarkdown: string
} {
  const filePath = getAgentMemoryPath(vaultPath)
  cfg.lastUpdated = new Date().toISOString().split('T')[0]
  const rawMarkdown = formatAgentMarkdown(cfg)

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, rawMarkdown, 'utf8')

  // Also save a mirror copy into server/data for resilience
  try {
    const backupPath = path.join(runtimeDataDir, 'server', 'data', 'agent.md')
    if (filePath !== backupPath) {
      fs.mkdirSync(path.dirname(backupPath), { recursive: true })
      fs.writeFileSync(backupPath, rawMarkdown, 'utf8')
    }
  } catch {}

  return { success: true, filePath, rawMarkdown }
}

/**
 * Save raw markdown directly to agent.md
 */
export function saveRawAgentMarkdown(rawMarkdown: string, vaultPath?: string): {
  success: boolean
  config: AgentMemoryConfig
  filePath: string
} {
  const filePath = getAgentMemoryPath(vaultPath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, rawMarkdown, 'utf8')

  const parsed = parseAgentMarkdown(rawMarkdown)
  return { success: true, config: parsed, filePath }
}

/**
 * Add a new directive item to agent.md
 */
export function addAgentDirective(
  item: Omit<AgentDirective, 'id' | 'lastUpdated'>,
  vaultPath?: string
): { success: boolean; directive: AgentDirective } {
  const { config: current } = loadAgentMemoryConfig(vaultPath)
  const newDirective: AgentDirective = {
    id: `dir-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: item.title,
    content: item.content,
    category: item.category || 'behavior',
    enabled: item.enabled ?? true,
    lastUpdated: new Date().toISOString().split('T')[0],
  }

  current.directives.unshift(newDirective)
  saveAgentMemoryConfig(current, vaultPath)
  return { success: true, directive: newDirective }
}

/**
 * Update an existing directive
 */
export function updateAgentDirective(
  id: string,
  patch: Partial<AgentDirective>,
  vaultPath?: string
): { success: boolean; directive?: AgentDirective } {
  const { config: current } = loadAgentMemoryConfig(vaultPath)
  const index = current.directives.findIndex(d => d.id === id)
  if (index === -1) return { success: false }

  current.directives[index] = {
    ...current.directives[index],
    ...patch,
    lastUpdated: new Date().toISOString().split('T')[0],
  }

  saveAgentMemoryConfig(current, vaultPath)
  return { success: true, directive: current.directives[index] }
}

/**
 * Delete a directive
 */
export function deleteAgentDirective(id: string, vaultPath?: string): boolean {
  const { config: current } = loadAgentMemoryConfig(vaultPath)
  const initialLen = current.directives.length
  current.directives = current.directives.filter(d => d.id !== id)
  if (current.directives.length === initialLen) return false

  saveAgentMemoryConfig(current, vaultPath)
  return true
}

/**
 * Build dynamic, effective System Prompt from agent.md
 * Injected into AI chat loop so user settings take live effect!
 */
export function getEffectiveSystemPrompt(vaultPath?: string): string {
  const { config: cfg } = loadAgentMemoryConfig(vaultPath)

  const activeDirectives = cfg.directives.filter(d => d.enabled)

  return `你是 CoreForge 研核「${cfg.persona.name}」—— ${cfg.persona.role}。
人设与语气风格：${cfg.persona.tone}。
专长概述：${cfg.persona.summary}

【用户档案与备考画像】
- 目标考向：${cfg.userProfile.targetExam}
- 目标院校：${cfg.userProfile.targetSchool}
- 考生背景：${cfg.userProfile.userBackground}
- 当前阶段：${cfg.userProfile.currentStage}
- 重点薄弱板块：${cfg.userProfile.weakPoints.join('；')}
- 学习偏好约定：${cfg.userProfile.customPreferences.join('；')}

【全局行为准则与响应规范】
${cfg.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

【已启用的长效记忆与个性化指令】
${activeDirectives.length > 0
  ? activeDirectives.map(d => `- [${d.title}]：${d.content}`).join('\n')
  : '- 暂无额外个性化指令，遵循标准大纲规则。'}

【知识库管理能力工具箱】
1. read_file — 查看指定笔记的完整 Markdown 内容
2. write_file — 创建新笔记或更新已有笔记（严格采用标准 Markdown 格式与 KaTeX 公式）
3. search_notes — 在知识库中根据考点或关键词精准检索
4. list_files — 浏览整个知识库的文件与目录结构
5. get_stats — 获取知识库全局统计信息
6. create_error_note — 一键将错题、解析与四维错因诊断归档至 wiki/03-真题与错题/
7. organize_vault — 诊断知识库健康度并给出分类与重构建议

请在每一次交流中严格履行上述 agent.md 中的设定与长效记忆！`
}

// ===== Backward compatibility helpers for legacy queries =====
export interface MemoryItem {
  id: string
  type: string
  title: string
  content: string
  subject: string
  domain: string
  mastery?: string
  tags: string[]
  reviewCount: number
  lastReviewed: string
  examFrequency?: string
  createdAt: string
  updatedAt: string
}

export function loadAllMemories(vaultPath?: string): MemoryItem[] {
  const { config: cfg } = loadAgentMemoryConfig(vaultPath)
  return cfg.directives.map(d => ({
    id: d.id,
    type: d.category,
    title: d.title,
    content: d.content,
    subject: '考研全科',
    domain: 'general',
    mastery: d.enabled ? 'mastered' : 'learning',
    tags: [d.category, 'agent-memory'],
    reviewCount: 1,
    lastReviewed: d.lastUpdated,
    examFrequency: '高频核心',
    createdAt: d.lastUpdated,
    updatedAt: d.lastUpdated,
  }))
}

export function getMemoryStats(vaultPath?: string) {
  const { config: cfg } = loadAgentMemoryConfig(vaultPath)
  const total = cfg.directives.length
  const active = cfg.directives.filter(d => d.enabled).length
  return {
    total,
    mastered: active,
    learning: total - active,
    weak: 0,
    traps: cfg.rules.length,
    chunks: cfg.userProfile.weakPoints.length,
  }
}

export function addMemory(item: any, vaultPath?: string) {
  const res = addAgentDirective({
    title: item.title,
    content: item.content,
    category: item.type || 'behavior',
    enabled: true,
  }, vaultPath)
  return res.directive
}

export function updateMemory(id: string, patch: any, vaultPath?: string) {
  const res = updateAgentDirective(id, patch, vaultPath)
  return res.directive
}

export function deleteMemory(id: string, vaultPath?: string) {
  return deleteAgentDirective(id, vaultPath)
}
