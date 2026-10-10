#!/usr/bin/env node
/**
 * Knowledge Viz / Obsidian Vault MCP Server (Stdio Transport)
 * 
 * Exposes Obsidian Vault reading, writing, searching, graph traversal,
 * and exam error archiving as MCP tools for Antigravity & LLM Agents.
 */

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

// Safe load gray-matter from project node_modules
let matter = null
try {
  matter = require('gray-matter')
} catch {
  try {
    matter = require(path.join(__dirname, '..', 'node_modules', 'gray-matter'))
  } catch (err) {
    console.error('Failed to load gray-matter:', err.message)
  }
}

// Locate config and default vault path
function resolveVaultPath() {
  if (process.env.VAULT_PATH && fs.existsSync(process.env.VAULT_PATH)) {
    return path.resolve(process.env.VAULT_PATH)
  }

  const configPath = path.join(__dirname, '..', 'server', 'config.json')
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      if (cfg.vaultPath && fs.existsSync(cfg.vaultPath)) {
        return path.resolve(cfg.vaultPath)
      }
    } catch {}
  }

  const sampleVault = path.join(__dirname, '..', '..', 'sample-vault')
  if (fs.existsSync(sampleVault)) {
    return path.resolve(sampleVault)
  }

  return process.cwd()
}

const VAULT_ROOT = resolveVaultPath()

// ===== Core Vault Operations =====

function extractLinks(content) {
  const linkRegex = /\[\[([^\]|#]+?)(?:#[^\]|]*)?(?:\|[^\]]+?)?\]\]/g
  const links = []
  let match
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1].trim())
  }
  return [...new Set(links)]
}

function extractTags(content, frontmatter) {
  const tagRegex = /(?:^|\s)#([a-zA-Z\u4e00-\u9fff][\w\u4e00-\u9fff/-]*)/g
  const tags = []
  let match
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1].trim())
  }

  if (frontmatter?.tags) {
    const rawTags = Array.isArray(frontmatter.tags)
      ? frontmatter.tags
      : String(frontmatter.tags).split(',').map((t) => t.trim())
    for (const t of rawTags) {
      const str = String(t).trim()
      if (str) tags.push(str)
    }
  }

  return [...new Set(tags)]
}

function parseNoteFile(filePath, vaultPath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    let frontmatter = {}
    let content = raw

    if (matter) {
      const parsed = matter(raw)
      frontmatter = parsed.data || {}
      content = parsed.content || raw
    }

    const relativePath = path.relative(vaultPath, filePath).replace(/\\/g, '/')
    const title = frontmatter.title || path.basename(filePath, '.md')
    const stat = fs.statSync(filePath)

    return {
      path: relativePath,
      title,
      frontmatter,
      content,
      links: extractLinks(content),
      tags: extractTags(content, frontmatter),
      modified: stat.mtime.toISOString(),
      wordCount: content.split(/\s+/).filter(Boolean).length,
    }
  } catch {
    return null
  }
}

function walkDir(dir) {
  const results = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.')) {
          results.push(...walkDir(fullPath))
        }
      } else if (entry.name.endsWith('.md')) {
        results.push(fullPath)
      }
    }
  } catch {}
  return results
}

let cachedNotes = null
let lastCacheTime = 0

function getAllNotes(vaultPath = VAULT_ROOT) {
  const now = Date.now()
  if (cachedNotes && now - lastCacheTime < 5000) {
    return cachedNotes
  }
  const files = walkDir(vaultPath)
  const notes = []
  for (const f of files) {
    const note = parseNoteFile(f, vaultPath)
    if (note) notes.push(note)
  }
  cachedNotes = notes
  lastCacheTime = now
  return notes
}

function ensureInsideVault(vaultPath, relativePath) {
  const fullPath = path.resolve(vaultPath, relativePath)
  if (!fullPath.startsWith(path.resolve(vaultPath))) {
    throw new Error('Path traversal detected: target path must be inside vault')
  }
  return fullPath
}

// ===== MCP Tool Definitions =====

const TOOLS = [
  {
    name: 'search_notes',
    description: '【搜索知识库笔记】通过关键词在 Obsidian Vault 笔记标题、标签及正文中检索，返回按相关度打分排序的笔记列表和内容摘要。',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词，支持多词空格分隔',
        },
        limit: {
          type: 'number',
          description: '返回结果数量上限，默认 10',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'read_note',
    description: '【读取笔记全文与元数据】通过相对路径获取单篇笔记的完整正文、Frontmatter、出链 Wikilinks、标签与字数统计。',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '笔记相对路径，例如：wiki/01-数据结构/二叉树.md',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_note',
    description: '【创建或更新笔记】向 Obsidian Vault 中写入 Markdown 文件。如果文件或父级目录不存在会自动创建；如果存在则原子覆盖。',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '笔记相对路径，例如：wiki/02-计算机网络/TCP三次握手.md',
        },
        content: {
          type: 'string',
          description: 'Markdown 正文内容',
        },
        frontmatter: {
          type: 'object',
          description: '可选的 YAML Frontmatter 对象（如 title, tags, status 等）',
        },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'get_note_graph',
    description: '【分析知识图谱与双链】获取整个知识库的网状拓扑关系。返回节点列表、链接关系边、中心枢纽节点、孤立笔记（Orphan Notes）及悬空断链（Dangling Links）。',
    inputSchema: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          description: '分析范围：留空或 "all" 为全库分析；填入具体笔记路径则聚焦该笔记的一阶与二阶邻居子图',
        },
      },
    },
  },
  {
    name: 'get_vault_stats',
    description: '【获取知识库健康度与概况】快速统计知识库的总笔记数、总字数、平均字数、高频标签分布以及当前 Vault 路径。',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_notes_tree',
    description: '【浏览知识库目录树】以清晰的树状层级查看知识库的所有目录和 Markdown 文件分布。',
    inputSchema: {
      type: 'object',
      properties: {
        subFolder: {
          type: 'string',
          description: '可选子目录路径，若为空则从知识库根目录展开',
        },
      },
    },
  },
  {
    name: 'create_error_note',
    description: '【考研/学科错题本快捷归档】在知识库的错题目录中自动生成排版工整的错题复盘笔记（含题干、错因诊断、严谨推导与防错提醒）。',
    inputSchema: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: '科目分类，如：高等数学、线性代数、概率论、数据结构、计算机网络、操作系统、计算机组成原理',
        },
        title: {
          type: 'string',
          description: '错题简短标题或考察的核心知识点',
        },
        question: {
          type: 'string',
          description: '题目完整题干、图表描述或选项',
        },
        errorReason: {
          type: 'string',
          description: '错因根源诊断（如概念混淆、公式记偏、计算粗心、审题遗漏等）',
        },
        solution: {
          type: 'string',
          description: '规范解题步骤、推导过程与举一反三的避坑结论',
        },
      },
      required: ['subject', 'title', 'question', 'solution'],
    },
  },
]

// ===== Tool Implementations =====

function handleSearchNotes(args) {
  const query = String(args.query || '').trim().toLowerCase()
  const limit = Math.max(1, Math.min(50, Number(args.limit) || 10))
  if (!query) return '请输入搜索关键词'

  const notes = getAllNotes()
  const tokens = query.split(/\s+/).filter(Boolean)

  const scored = notes.map((note) => {
    let score = 0
    let snippet = ''
    const titleLower = note.title.toLowerCase()
    const pathLower = note.path.toLowerCase()
    const contentLower = note.content.toLowerCase()

    for (const t of tokens) {
      if (titleLower.includes(t)) score += 6
      if (pathLower.includes(t)) score += 3
      for (const tag of note.tags) {
        if (tag.toLowerCase().includes(t)) {
          score += 4
          break
        }
      }
      const idx = contentLower.indexOf(t)
      if (idx !== -1) {
        score += 1
        if (!snippet) {
          const start = Math.max(0, idx - 50)
          const end = Math.min(note.content.length, idx + t.length + 80)
          snippet = (start > 0 ? '...' : '') + note.content.slice(start, end).replace(/\n+/g, ' ') + (end < note.content.length ? '...' : '')
        }
      }
    }

    return { note, score, snippet }
  }).filter((r) => r.score > 0)

  scored.sort((a, b) => b.score - a.score)
  const results = scored.slice(0, limit)

  if (results.length === 0) {
    return `在知识库 (${VAULT_ROOT}) 中未找到与 "${args.query}" 匹配的笔记。`
  }

  const lines = [
    `🔍 检索到 ${results.length} 篇相关笔记 (共匹配 ${scored.length} 篇)：\n`,
  ]

  for (const { note, score, snippet } of results) {
    lines.push(`### 📄 [${note.title}](file:///${path.join(VAULT_ROOT, note.path).replace(/\\/g, '/')})`)
    lines.push(`- **路径**: \`${note.path}\` | **字数**: ${note.wordCount} | **匹配分**: ${score}`)
    if (note.tags.length > 0) {
      lines.push(`- **标签**: ${note.tags.map(t => `#${t}`).join(' ')}`)
    }
    if (snippet) {
      lines.push(`- **摘要**: \`${snippet}\``)
    }
    lines.push('')
  }

  return lines.join('\n')
}

function handleReadNote(args) {
  const relPath = String(args.path || '').trim()
  if (!relPath) return '请提供笔记路径'

  const fullPath = ensureInsideVault(VAULT_ROOT, relPath)
  if (!fs.existsSync(fullPath)) {
    return `❌ 找不到文件: ${relPath}`
  }

  const note = parseNoteFile(fullPath, VAULT_ROOT)
  if (!note) {
    return `❌ 解析笔记失败: ${relPath}`
  }

  const lines = [
    `# 📖 笔记详情: ${note.title}`,
    `- **路径**: \`${note.path}\``,
    `- **字数**: ${note.wordCount} 字`,
    `- **最后修改**: ${note.modified}`,
  ]

  if (Object.keys(note.frontmatter).length > 0) {
    lines.push(`- **Frontmatter 元数据**: \`\`\`json\n${JSON.stringify(note.frontmatter, null, 2)}\n\`\`\``)
  }
  if (note.tags.length > 0) {
    lines.push(`- **标签**: ${note.tags.map(t => `#${t}`).join(', ')}`)
  }
  if (note.links.length > 0) {
    lines.push(`- **双向引用 ([[wikilinks]])**: ${note.links.map(l => `[[${l}]]`).join(', ')}`)
  }

  lines.push('\n---\n')
  lines.push(note.content)

  return lines.join('\n')
}

function handleWriteNote(args) {
  const relPath = String(args.path || '').trim()
  const content = String(args.content || '')
  if (!relPath) return '请提供笔记路径'

  const fullPath = ensureInsideVault(VAULT_ROOT, relPath)
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  let finalContent = content
  if (args.frontmatter && Object.keys(args.frontmatter).length > 0 && matter) {
    finalContent = matter.stringify(content, args.frontmatter)
  }

  fs.writeFileSync(fullPath, finalContent, 'utf-8')
  cachedNotes = null // Invalidate cache

  return `✅ 笔记已成功写入: \`${relPath}\`\n完整磁盘路径: ${fullPath}\n字数: ${content.split(/\s+/).filter(Boolean).length}`
}

function handleGetNoteGraph(args) {
  const notes = getAllNotes()
  const scope = String(args?.scope || '').trim()

  const titleToPath = new Map()
  const pathToNote = new Map()

  for (const n of notes) {
    titleToPath.set(n.title.toLowerCase(), n.path)
    titleToPath.set(path.basename(n.path, '.md').toLowerCase(), n.path)
    pathToNote.set(n.path, n)
  }

  const nodes = []
  const edges = []
  const inDegree = new Map()
  const outDegree = new Map()
  const danglingLinks = new Set()

  for (const n of notes) {
    nodes.push({ id: n.path, label: n.title, tags: n.tags, wordCount: n.wordCount })
    outDegree.set(n.path, n.links.length)

    for (const linkTarget of n.links) {
      const cleanTarget = linkTarget.toLowerCase()
      const targetPath = titleToPath.get(cleanTarget)
      if (targetPath) {
        edges.push({ from: n.path, to: targetPath })
        inDegree.set(targetPath, (inDegree.get(targetPath) || 0) + 1)
      } else {
        danglingLinks.add(linkTarget)
      }
    }
  }

  // Find top hubs and orphan notes
  const hubs = notes.map((n) => ({
    path: n.path,
    title: n.title,
    in: inDegree.get(n.path) || 0,
    out: outDegree.get(n.path) || 0,
    total: (inDegree.get(n.path) || 0) + (outDegree.get(n.path) || 0),
  })).sort((a, b) => b.total - a.total).slice(0, 8)

  const orphans = notes.filter((n) => {
    const inCount = inDegree.get(n.path) || 0
    const outCount = outDegree.get(n.path) || 0
    return inCount === 0 && outCount === 0
  })

  const lines = [
    `🕸️ **Obsidian 知识图谱拓扑简报**`,
    `- **总节点数 (笔记)**: ${nodes.length}`,
    `- **双链连接数 (边)**: ${edges.length}`,
    `- **孤立笔记数 (无任何连接)**: ${orphans.length}`,
    `- **悬空断链数 (引用了尚未创建的笔记)**: ${danglingLinks.size}`,
    '',
    `### 🌟 核心枢纽节点 (Top Hubs)`,
  ]

  for (const h of hubs) {
    lines.push(`- **${h.title}** (\`${h.path}\`): 被引 ${h.in} 次 / 引用 ${h.out} 次`)
  }

  if (danglingLinks.size > 0) {
    lines.push('\n### ⚠️ 悬空断链 (引用了但未建笔记的前 10 个)')
    Array.from(danglingLinks).slice(0, 10).forEach(l => lines.push(`- \`[[${l}]]\``))
  }

  if (orphans.length > 0) {
    lines.push(`\n### 🏝️ 孤立笔记 (前 8 个示例)`)
    orphans.slice(0, 8).forEach(o => lines.push(`- \`${o.path}\` (${o.title})`))
  }

  return lines.join('\n')
}

function handleGetVaultStats() {
  const notes = getAllNotes()
  const totalWords = notes.reduce((sum, n) => sum + n.wordCount, 0)
  const tagMap = new Map()

  for (const n of notes) {
    for (const t of n.tags) {
      tagMap.set(t, (tagMap.get(t) || 0) + 1)
    }
  }

  const sortedTags = [...tagMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)

  const lines = [
    `📊 **知识库整体健康与统计**`,
    `- **Vault 根目录**: \`${VAULT_ROOT}\``,
    `- **笔记总篇数**: ${notes.length} 篇`,
    `- **知识库总字数**: ${totalWords.toLocaleString()} 字`,
    `- **篇均字数**: ${notes.length ? Math.round(totalWords / notes.length) : 0} 字/篇`,
    `- **标签种类总数**: ${tagMap.size} 个`,
    '',
    `### 🏷️ Top 10 高频主题标签`,
  ]

  for (const [tag, count] of sortedTags) {
    lines.push(`- **#${tag}**: ${count} 篇笔记`)
  }

  return lines.join('\n')
}

function handleListNotesTree(args) {
  const subFolder = String(args?.subFolder || '').trim()
  const targetDir = subFolder ? path.join(VAULT_ROOT, subFolder) : VAULT_ROOT

  if (!fs.existsSync(targetDir)) {
    return `❌ 目标目录不存在: ${subFolder || '根目录'}`
  }

  function renderTree(dir, depth = 0, maxDepth = 4) {
    if (depth > maxDepth) return ['  '.repeat(depth) + '... (层级过深略)']
    const lines = []
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      entries.sort((a, b) => {
        if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1
        return a.name.localeCompare(b.name)
      })

      for (const e of entries) {
        if (e.name.startsWith('.')) continue
        const indent = '  '.repeat(depth)
        if (e.isDirectory()) {
          lines.push(`${indent}📁 **${e.name}/**`)
          lines.push(...renderTree(path.join(dir, e.name), depth + 1, maxDepth))
        } else if (e.name.endsWith('.md')) {
          lines.push(`${indent}📄 ${e.name}`)
        }
      }
    } catch {}
    return lines
  }

  const treeLines = renderTree(targetDir)
  return `🗂️ **知识库目录树 (${subFolder || '根目录'}):**\n\n${treeLines.slice(0, 150).join('\n')}`
}

function handleCreateErrorNote(args) {
  const { subject, title, question, errorReason, solution } = args
  const isMath = subject?.includes('数学') || subject?.includes('数') || subject?.includes('代') || subject?.includes('率')
  const subFolder = isMath ? '数学错题本' : '408错题本'

  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const safeTitle = (title || '错题').replace(/[\\/:*?"<>|]/g, '_').slice(0, 30)
  const relativePath = `wiki/03-真题与错题/${subFolder}/${dateStr}-${safeTitle}-${Date.now().toString().slice(-4)}.md`

  const content = `# ❌ 错题复盘：${title}

> [!NOTE] 错题档案信息
> - **科目**：${subject}
> - **记录日期**：${dateStr}
> - **标签**：#错题本 #${subject.replace(/\s+/g, '')} #复习冲刺

---

## 1. 原题呈现
${question}

---

## 2. 错因深度诊断
> [!CAUTION] 核心失分点
> ${errorReason || '概念不清 / 推导偏差'}

---

## 3. 标准解法与推导链条
${solution}

---

## 4. 防错警示与举一反三
- **避坑口诀**：仔细审清题设边界条件，严防计算与概念混淆。
- **关联考点索引**：[[${subject}]]、[[真题考点汇总]]
`

  const fullPath = ensureInsideVault(VAULT_ROOT, relativePath)
  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(fullPath, content, 'utf-8')
  cachedNotes = null

  return `🎯 错题已成功归档到知识库！\n- **保存路径**: \`${relativePath}\`\n- **科目**: ${subject}\n- **标题**: ${title}\n可在 Knowledge Viz 或 Obsidian 中直接查看与进行间隔复习。`
}

// ===== MCP JSON-RPC Server Event Loop =====

function sendResponse(resp) {
  const str = JSON.stringify(resp)
  process.stdout.write(str + '\n')
}

function handleRequest(req) {
  const reqId = req.id
  const method = req.method
  const params = req.params || {}

  if (method === 'initialize') {
    sendResponse({
      jsonrpc: '2.0',
      id: reqId,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'obsidian-vault-mcp',
          version: '1.0.0',
        },
      },
    })
  } else if (method === 'notifications/initialized') {
    // Client notification, no reply needed
  } else if (method === 'tools/list') {
    sendResponse({
      jsonrpc: '2.0',
      id: reqId,
      result: { tools: TOOLS },
    })
  } else if (method === 'tools/call') {
    const toolName = params.name
    const args = params.arguments || {}

    try {
      let outputText = ''
      switch (toolName) {
        case 'search_notes':
          outputText = handleSearchNotes(args)
          break
        case 'read_note':
          outputText = handleReadNote(args)
          break
        case 'write_note':
          outputText = handleWriteNote(args)
          break
        case 'get_note_graph':
          outputText = handleGetNoteGraph(args)
          break
        case 'get_vault_stats':
          outputText = handleGetVaultStats()
          break
        case 'list_notes_tree':
          outputText = handleListNotesTree(args)
          break
        case 'create_error_note':
          outputText = handleCreateErrorNote(args)
          break
        default:
          outputText = `未知的工具名称: ${toolName}`
      }

      sendResponse({
        jsonrpc: '2.0',
        id: reqId,
        result: {
          content: [{ type: 'text', text: outputText }],
        },
      })
    } catch (err) {
      sendResponse({
        jsonrpc: '2.0',
        id: reqId,
        error: { code: -32603, message: err.message || '内部工具执行异常' },
      })
    }
  } else {
    if (reqId !== undefined && reqId !== null) {
      sendResponse({
        jsonrpc: '2.0',
        id: reqId,
        error: { code: -32601, message: `Method ${method} not found` },
      })
    }
  }
}

function main() {
  process.stdin.setEncoding('utf-8')
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  })

  rl.on('line', (line) => {
    const trimmed = line.trim()
    if (!trimmed) return
    try {
      const req = JSON.parse(trimmed)
      handleRequest(req)
    } catch (e) {
      process.stderr.write(`MCP parse error: ${e.message}\n`)
    }
  })
}

main()
