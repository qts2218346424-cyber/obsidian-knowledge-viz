import fs from 'fs'
import path from 'path'
import os from 'os'

export interface LocalSkill {
  id: string
  name: string
  displayName: string
  description: string
  source: 'claude' | 'agents' | 'codex' | 'antigravity' | 'plugin' | 'builtin'
  category: '研学与考研' | '文档与办公' | '开发与架构' | '安全与审计' | '浏览器与自动化' | '通用技能'
  path: string
  instructions: string
  allowedTools?: string[]
}

function categorizeSkill(name: string, description: string): LocalSkill['category'] {
  const lower = `${name} ${description}`.toLowerCase()
  if (/exam|study|outline|math|408|quiz|knowledge|考点|考研|大纲|公式|真题|挖空|错题|命题/.test(lower)) {
    return '研学与考研'
  }
  if (/pdf|docx|pptx|document|excel|sheet|doc-|writing-plans|power-design/.test(lower)) {
    return '文档与办公'
  }
  if (/playwright|tabbit|browser|devtools|chrome|web-design|a11y|accessibility/.test(lower)) {
    return '浏览器与自动化'
  }
  if (/redteam|cve|inject|exploit|code-audit|security-audit|xss|sqli|csrf|jailbreak|penetration|auth|command-doctrine|recon/.test(lower)) {
    return '安全与审计'
  }
  if (/react|vercel|debug|git|test|dev|code|deploy|subagent|worktree|composition|native/.test(lower)) {
    return '开发与架构'
  }
  return '通用技能'
}

function parseSkillFile(filePath: string, source: LocalSkill['source']): LocalSkill | null {
  try {
    if (!fs.existsSync(filePath)) return null
    const text = fs.readFileSync(filePath, 'utf8')
    const filename = path.basename(filePath)
    const dirName = path.basename(path.dirname(filePath))
    let name = filename.endsWith('.md') && filename !== 'SKILL.md' ? filename.replace(/\.md$/, '') : dirName
    let description = ''
    let instructions = text
    let allowedTools: string[] | undefined

    const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (fmMatch) {
      const frontmatter = fmMatch[1]
      instructions = (fmMatch[2] || '').trim()

      const nameMatch = frontmatter.match(/^name:\s*["']?([^"'\r\n]+)["']?/m)
      if (nameMatch) name = nameMatch[1].trim()

      const descMatch = frontmatter.match(/^description:\s*([^\r\n]+)/m)
      if (descMatch) {
        description = descMatch[1].trim().replace(/^["']|["']$/g, '')
      }

      const toolsMatch = frontmatter.match(/^allowed-tools:\s*([^\r\n]+)/m)
      if (toolsMatch) {
        allowedTools = toolsMatch[1].split(/\s+/).filter(Boolean)
      }
    } else {
      const lines = text.split('\n')
      const firstH1 = lines.find(l => l.startsWith('# '))
      if (firstH1) {
        description = firstH1.replace(/^#\s*/, '').trim()
      } else {
        description = lines.find(l => l.trim().length > 0)?.substring(0, 100) || name
      }
    }

    if (!description) {
      description = `来自本地 ${source} 的自动化技能组件 (${name})`
    }

    // Clean up formatted displayName
    const displayName = name
      .split(/[-_]/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')

    return {
      id: `${source}-${name}`,
      name,
      displayName,
      description,
      source,
      category: categorizeSkill(name, description),
      path: filePath,
      instructions: instructions.slice(0, 15000), // Cap reasonable prompt size
      allowedTools,
    }
  } catch (err) {
    return null
  }
}

/**
 * Scan all local skill paths across user machine
 */
export function scanLocalSkills(): LocalSkill[] {
  const home = os.homedir()
  const results: LocalSkill[] = []
  const seenNames = new Set<string>()

  const addSkill = (skill: LocalSkill | null) => {
    if (!skill) return
    const key = `${skill.source}:${skill.name}`
    if (seenNames.has(key)) return
    seenNames.add(key)
    results.push(skill)
  }

  // 1. ~/.claude/skills/*/SKILL.md
  const claudeSkillsDir = path.join(home, '.claude', 'skills')
  if (fs.existsSync(claudeSkillsDir)) {
    try {
      const items = fs.readdirSync(claudeSkillsDir)
      for (const item of items) {
        const itemPath = path.join(claudeSkillsDir, item)
        if (fs.statSync(itemPath).isDirectory()) {
          const skillFile = path.join(itemPath, 'SKILL.md')
          if (fs.existsSync(skillFile)) {
            addSkill(parseSkillFile(skillFile, 'claude'))
          }
        }
      }
    } catch {}
  }

  // 2. ~/.claude/commands/*.md
  const claudeCmdsDir = path.join(home, '.claude', 'commands')
  if (fs.existsSync(claudeCmdsDir)) {
    try {
      const items = fs.readdirSync(claudeCmdsDir)
      for (const item of items) {
        if (item.endsWith('.md')) {
          addSkill(parseSkillFile(path.join(claudeCmdsDir, item), 'claude'))
        }
      }
    } catch {}
  }

  // 3. ~/.agents/skills/*/SKILL.md
  const agentsSkillsDir = path.join(home, '.agents', 'skills')
  if (fs.existsSync(agentsSkillsDir)) {
    try {
      const items = fs.readdirSync(agentsSkillsDir)
      for (const item of items) {
        const itemPath = path.join(agentsSkillsDir, item)
        if (fs.statSync(itemPath).isDirectory()) {
          const skillFile = path.join(itemPath, 'SKILL.md')
          if (fs.existsSync(skillFile)) {
            addSkill(parseSkillFile(skillFile, 'agents'))
          }
        }
      }
    } catch {}
  }

  // 4. ~/.codex/skills/*/SKILL.md & ~/.codex/prompts/*.md
  const codexSkillsDir = path.join(home, '.codex', 'skills')
  if (fs.existsSync(codexSkillsDir)) {
    try {
      const items = fs.readdirSync(codexSkillsDir)
      for (const item of items) {
        const itemPath = path.join(codexSkillsDir, item)
        if (fs.statSync(itemPath).isDirectory()) {
          const skillFile = path.join(itemPath, 'SKILL.md')
          if (fs.existsSync(skillFile)) {
            addSkill(parseSkillFile(skillFile, 'codex'))
          }
        }
      }
    } catch {}
  }
  const codexPromptsDir = path.join(home, '.codex', 'prompts')
  if (fs.existsSync(codexPromptsDir)) {
    try {
      const items = fs.readdirSync(codexPromptsDir)
      for (const item of items) {
        if (item.endsWith('.md')) {
          addSkill(parseSkillFile(path.join(codexPromptsDir, item), 'codex'))
        }
      }
    } catch {}
  }

  // 5. ~/.gemini/antigravity/builtin/skills/*/SKILL.md
  const antigravityDir = path.join(home, '.gemini', 'antigravity', 'builtin', 'skills')
  if (fs.existsSync(antigravityDir)) {
    try {
      const items = fs.readdirSync(antigravityDir)
      for (const item of items) {
        const itemPath = path.join(antigravityDir, item)
        if (fs.statSync(itemPath).isDirectory()) {
          const skillFile = path.join(itemPath, 'SKILL.md')
          if (fs.existsSync(skillFile)) {
            addSkill(parseSkillFile(skillFile, 'antigravity'))
          }
        }
      }
    } catch {}
  }

  // 6. ~/.gemini/config/plugins/*/skills/*/SKILL.md
  const pluginsDir = path.join(home, '.gemini', 'config', 'plugins')
  if (fs.existsSync(pluginsDir)) {
    try {
      const plugins = fs.readdirSync(pluginsDir)
      for (const plugin of plugins) {
        const pSkills = path.join(pluginsDir, plugin, 'skills')
        if (fs.existsSync(pSkills) && fs.statSync(pSkills).isDirectory()) {
          const sDirs = fs.readdirSync(pSkills)
          for (const s of sDirs) {
            const skillFile = path.join(pSkills, s, 'SKILL.md')
            if (fs.existsSync(skillFile)) {
              addSkill(parseSkillFile(skillFile, 'plugin'))
            }
          }
        }
      }
    } catch {}
  }

  // 7. Built-in CoreForge Exam Study Skills
  for (const s of BUILTIN_STUDY_SKILLS) {
    addSkill(s)
  }

  // Sort by category then name
  return results.sort((a, b) => {
    // Put 研学与考研 first
    if (a.category === '研学与考研' && b.category !== '研学与考研') return -1
    if (b.category === '研学与考研' && a.category !== '研学与考研') return 1
    if (a.category !== b.category) return a.category.localeCompare(b.category, 'zh-CN')
    return a.displayName.localeCompare(b.displayName)
  })
}

export const BUILTIN_STUDY_SKILLS: LocalSkill[] = [
  {
    id: 'builtin-exam-outline',
    name: 'exam-outline',
    displayName: '📚 考点大纲结构化重构',
    description: '将散乱手写或网课笔记重构为考研标准大纲结构（概念定义、定理推导、高频考法、避坑陷阱、双链网络）',
    source: 'builtin',
    category: '研学与考研',
    path: 'builtin://exam-outline',
    instructions: `你现在扮演「考研 408 & 考研数学 顶尖教研组长」。请执行【考点大纲结构化重构 Skill】：\n1. 目标：对指定笔记或考点内容进行结构化重构，生成符合 Obsidian 双链规范的高质量 Markdown。\n2. 必备标准模块：\n   - 📌 【考点地位与考纲要求】（考察频次、分值占比、常见选择/大题考法）；\n   - 🔍 【核心概念与底层机理】（严谨定义、软硬件/数学本质，拒绝死记硬背）；\n   - 📐 【核心公式与推导步骤】（数学公式统一规范为 KaTeX LaTeX 语法，标明关键推导依据）；\n   - ⚠️ 【历年易错陷阱与避坑点】（历届考生丢分的题眼与计算失误）；\n   - 🔗 【知识图谱前置与后置关联】（使用 [[考点名]] 建立前驱与后继双链）；\n3. 如果指定了现有文件，使用 read_file 读取原文并使用 write_file 写回；如果未指定文件则创建新笔记。`,
  },
  {
    id: 'builtin-graph-link',
    name: 'graph-link',
    displayName: '🕸️ 自动打通知识图谱双链',
    description: '深度扫描笔记内容，自动将涉及的 408 与数学考点打上 [[考点名]] 双向链接，消除孤立笔记',
    source: 'builtin',
    category: '研学与考研',
    path: 'builtin://graph-link',
    instructions: `你现在扮演「Obsidian 知识图谱架构师」。请执行【自动打通知识图谱双链 Skill】：\n1. 目标：扫描指定笔记的内容，找出文中所涉及的所有 408（数据结构、计算机组成、操作系统、网络）或考研数学（高数、线代、概率论）专业术语与定理。\n2. 执行规范：\n   - 将文中的考研专业术语精准替换为 Obsidian 双链格式 [[考点名称]]；\n   - 优先匹配知识库中现有的笔记文件，若未创建则规范命名；\n   - 在文末追加「🕸️ 知识图谱关联网络」小节，列出【上游基础概念】与【下游应用考点】；\n3. 使用 read_file 读取原文，并在处理后使用 write_file 写回。`,
  },
  {
    id: 'builtin-theorem-fill',
    name: 'theorem-fill',
    displayName: '🎯 定理推导与艾宾浩斯挖空卡',
    description: '提炼关键推导步骤，在笔记末尾生成 {{c1::...}} 艾宾浩斯自测挖空卡与记忆口诀，方便手机端随时背诵',
    source: 'builtin',
    category: '研学与考研',
    path: 'builtin://theorem-fill',
    instructions: `你现在扮演「记忆工程与考研速记专家」。请执行【定理推导与艾宾浩斯挖空卡 Skill】：\n1. 目标：提炼笔记中最重要的核心推导步骤与公式，生成艾宾浩斯 Spaced Repetition 记忆卡片。\n2. 规范：\n   - 提取定理推导的 3~5 个关键思维步，挖空使用标准格式 {{c1::挖空关键内容::提示信息}}；\n   - 提炼 1~2 句生动形象的【考研速记口诀】；\n   - 在笔记末尾增加「📇 艾宾浩斯自测挖空卡」板块，方便在手机端随时遮挡自测；\n3. 使用 write_file 将卡片追加到对应笔记末尾。`,
  },
  {
    id: 'builtin-trap-diagnostic',
    name: 'trap-diagnostic',
    displayName: '💡 错因溯源与避坑集归档',
    description: '从概念模糊/公式记混/计算粗心/审题漏设四维诊断错题，并在对应考点笔记中沉淀「⚠️ 避坑错题集」',
    source: 'builtin',
    category: '研学与考研',
    path: 'builtin://trap-diagnostic',
    instructions: `你现在扮演「考研错题诊断与归因名师」。请执行【错因溯源与避坑集归档 Skill】：\n1. 目标：分析学生做错的原因，并在对应考点笔记中沉淀「⚠️ 历年避坑错题集」。\n2. 四维诊断：\n   - 【错因定性】：判断属于 1. 概念不清 2. 公式记错 3. 计算失误 4. 审题疏忽；\n   - 【思维卡点】：指明考生是在哪一步推导或哪一句题设产生了思维偏差；\n   - 【正确破题眼】：一句话点出这道题的破题核心与最优秒杀路径；\n   - 【举一反三变式】：给出 1 道考察相同底层逻辑但变换题设的强化变式题；\n3. 使用 create_error_note 工具在知识库错题本中沉淀，并更新知识点笔记。`,
  },
  {
    id: 'builtin-predict',
    name: 'predict',
    displayName: '✨ 命题组出题预测与采分点',
    description: '模拟统考命题组视角，命制 1 道统考风格单选题 + 1 道综合分析大题并给出详细评分标准（采分点）',
    source: 'builtin',
    category: '研学与考研',
    path: 'builtin://predict',
    instructions: `你现在扮演「教育部考研统考命题组资深命题专家」。请执行【命题组出题预测与采分点 Skill】：\n1. 目标：针对用户输入的考点，预测今年统考可能出现的考察题型与命题手法。\n2. 命制标准：\n   - 【单项选择题（2分）】：设计 1 道具有较强区分度的陷阱选择题，提供 ABCD 选项与深度解析；\n   - 【综合应用大题（8~10分）】：设计 1 道跨考点综合分析题，列出详细的分步推导过程与【严格采分点】；\n   - 【答题避坑指南】：指出阅卷现场最容易被扣分的格式或思维错误。`,
  },
  {
    id: 'builtin-roadmap-drill',
    name: 'roadmap-drill',
    displayName: '🗺️ 跨章节综合命题推演',
    description: '打通 408 软硬件跨学科或高等数学与线性代数交叉推导，建立宏观全景解题直觉',
    source: 'builtin',
    category: '研学与考研',
    path: 'builtin://roadmap-drill',
    instructions: `你现在扮演「跨学科系统架构与考研全局导师」。请执行【跨章节综合命题推演 Skill】：\n1. 目标：将看似割裂的考点进行跨章节、跨科目串联（如将计组的虚拟存储与操作系统的段页式管理串联，或将高数的泰勒级数与线代的矩阵幂次串联）。\n2. 输出要求：\n   - 梳理两大考点之间的底层数据流或数学同构关系；\n   - 提供 1 道典型的跨学科大题原型与破题思路；\n   - 给出「一图胜千言」的 Mermaid 时序图或架构流程图。`,
  },
]
