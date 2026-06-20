import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'
import multer from 'multer'
import matter from 'gray-matter'
import { scanVault, getFile, getTree, createFile, updateFile, deleteFile, renameFile, type VaultNote } from './vault-parser.js'
import { buildGraph } from './graph-builder.js'
import { checkHealth } from './health-checker.js'
import { runAgentLoop, type AgentEvent } from './agent.js'
import chokidar from 'chokidar'
import { generateQuizSummary } from './quiz-summary.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load config - support both development and Electron packaged paths
const configPaths = [
  path.join(__dirname, 'config.json'),                              // dev: next to server
  path.join(__dirname, '..', 'server', 'config.json'),              // bundled: dist-server/../server/
  typeof process !== 'undefined' && (process as any).resourcesPath
    ? path.join((process as any).resourcesPath, 'config.json')       // Electron packaged
    : '',
].filter(Boolean)

let config: { vaultPath: string; port: number; ai?: { apiKey: string; baseURL: string; model?: string } } = {
  vaultPath: '',
  port: 3001,
}
let loadedConfigPath = ''
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

// Anthropic client (mutable — can be re-initialized via settings)
let anthropic: Anthropic | null = config.ai
  ? new Anthropic({ apiKey: config.ai.apiKey, baseURL: config.ai.baseURL })
  : null

function reinitAnthropic() {
  anthropic = config.ai
    ? new Anthropic({ apiKey: config.ai.apiKey, baseURL: config.ai.baseURL })
    : null
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// File upload directory for ingest
const uploadDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
const upload = multer({ dest: uploadDir, limits: { fileSize: 100 * 1024 * 1024 } })

// Serve static frontend in production (Electron or standalone)
// In Electron packaged app, __dirname is dist-server/, so dist/ is at ../dist/
const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
}

// In-memory cache
let cachedNotes: VaultNote[] | null = null
let cacheTime = 0
const CACHE_TTL = 10_000

function getNotes(): VaultNote[] {
  const now = Date.now()
  if (cachedNotes && now - cacheTime < CACHE_TTL) {
    return cachedNotes
  }
  cachedNotes = scanVault(config.vaultPath)
  cacheTime = now
  return cachedNotes
}

function invalidateCache() {
  cachedNotes = null
  cacheTime = 0
}

// ===== API Routes =====

app.get('/api/vault/stats', (_req, res) => {
  try {
    const notes = getNotes()
    const health = checkHealth(notes, config.vaultPath)
    res.json({ vaultPath: config.vaultPath, connected: notes.length > 0, ...health.stats })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/vault/graph', (_req, res) => {
  try {
    const notes = getNotes()
    res.json(buildGraph(notes))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/vault/health', (_req, res) => {
  try {
    const notes = getNotes()
    res.json(checkHealth(notes, config.vaultPath))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/vault/files', (req, res) => {
  try {
    const notes = getNotes()
    const query = String(req.query.q || '').toLowerCase().trim()
    if (!query) {
      res.json(notes.map(n => ({ path: n.path, title: n.title, tags: n.tags, modified: n.modified, wordCount: n.wordCount })))
      return
    }

    // Weighted multi-token search
    const tokens = query.split(/\s+/).filter(t => t.length > 0)
    const scored = notes.map(note => {
      let score = 0
      let snippet = ''
      const titleLower = note.title.toLowerCase()
      const pathLower = note.path.toLowerCase()
      const contentLower = note.content.toLowerCase()

      for (const token of tokens) {
        if (titleLower.includes(token)) score += 5
        for (const tag of note.tags) {
          if (tag.toLowerCase().includes(token)) { score += 3; break }
        }
        if (pathLower.includes(token)) score += 2
        const contentIdx = contentLower.indexOf(token)
        if (contentIdx !== -1) {
          score += 1
          if (!snippet) {
            const start = Math.max(0, contentIdx - 40)
            const end = Math.min(note.content.length, contentIdx + token.length + 80)
            snippet = (start > 0 ? '...' : '') + note.content.slice(start, end) + (end < note.content.length ? '...' : '')
          }
        }
      }

      return { note, score, snippet }
    }).filter(r => r.score > 0)

    scored.sort((a, b) => b.score - a.score)

    res.json(scored.slice(0, 20).map(r => ({
      path: r.note.path,
      title: r.note.title,
      tags: r.note.tags,
      modified: r.note.modified,
      wordCount: r.note.wordCount,
      score: r.score,
      snippet: r.snippet || undefined,
    })))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/vault/file', (req, res) => {
  try {
    const filePath = String(req.query.path || '')
    if (!filePath) { res.status(400).json({ error: 'Missing path parameter' }); return }
    const note = getFile(config.vaultPath, filePath)
    if (!note) { res.status(404).json({ error: 'File not found' }); return }
    res.json(note)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/vault/tree', (_req, res) => {
  try {
    res.json(getTree(config.vaultPath))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== AI Chat — real Anthropic API =====

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function findRelevantNotes(message: string, notes: VaultNote[]): VaultNote[] {
  const msgLower = message.toLowerCase()
  return notes
    .map(note => {
      let score = 0
      const titleLower = note.title.toLowerCase()
      const tagsLower = note.tags.map(t => t.toLowerCase())
      if (msgLower.includes(titleLower) || titleLower.includes(msgLower)) score += 5
      for (const tag of tagsLower) {
        if (msgLower.includes(tag)) score += 2
      }
      const segments = msgLower.split(/[\s?？!！。，,.]+/).filter((s: string) => s.length > 1)
      const text = `${note.title} ${note.tags.join(' ')} ${note.content.substring(0, 500)}`.toLowerCase()
      for (const seg of segments) {
        if (text.includes(seg)) score += 1
      }
      const titleWords = titleLower.split(/[\s-]+/).filter((w: string) => w.length > 1)
      for (const tw of titleWords) {
        if (msgLower.includes(tw)) score += 2
      }
      return { note, score }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => r.note)
}

function buildSystemPrompt(relevantNotes: VaultNote[], totalNotes: number): string {
  let prompt = `你是一个知识库 AI 助手，帮助用户查询和理解 Obsidian 知识库中的内容。
知识库共有 ${totalNotes} 篇笔记。

请遵守以下规则：
1. 回答时引用相关笔记，使用格式 **[笔记标题](笔记路径)**
2. 如果知识库中有相关内容，优先基于知识库回答
3. 如果知识库中没有相关内容，诚实告知用户
4. 回答要简洁、准确，使用中文
5. 适当总结多篇笔记的关联信息`

  if (relevantNotes.length > 0) {
    prompt += '\n\n以下是与用户问题最相关的笔记内容，请基于这些内容回答：\n'
    for (const note of relevantNotes) {
      prompt += `\n--- 笔记: ${note.title} (路径: ${note.path}) ---\n`
      prompt += `标签: ${note.tags.join(', ')}\n`
      prompt += note.content.substring(0, 1500) + '\n'
    }
  }

  return prompt
}

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body as { message: string; history?: ChatMessage[] }
  if (!message) {
    res.status(400).json({ error: 'Missing message' })
    return
  }

  const notes = getNotes()
  const relevantNotes = findRelevantNotes(message, notes)

  const citedNotes = relevantNotes.slice(0, 3).map(note => ({
    title: note.title,
    path: note.path,
    excerpt: note.content.substring(0, 200),
    tags: note.tags.slice(0, 3),
  }))

  // If no AI configured, return keyword-based stub
  if (!anthropic) {
    let reply: string
    if (citedNotes.length > 0) {
      reply = `根据你的问题，我在知识库中找到了 ${citedNotes.length} 篇相关笔记：\n\n`
      for (const cn of citedNotes) {
        reply += `**${cn.title}** — ${cn.excerpt.substring(0, 100)}...\n\n`
      }
      reply += '这些笔记可能包含你需要的信息。你可以点击上方的笔记卡片查看详情。'
    } else {
      reply = '我在知识库中没有找到与你的问题直接相关的笔记。试试换一些关键词。'
    }
    res.json({ reply, citedNotes, timestamp: new Date().toISOString() })
    return
  }

  // Real AI chat
  try {
    const systemPrompt = buildSystemPrompt(relevantNotes, notes.length)

    const messages: { role: 'user' | 'assistant'; content: string }[] = []
    if (history) {
      for (const h of history.slice(-10)) {
        if (h.role === 'user' || h.role === 'assistant') {
          messages.push({ role: h.role, content: h.content })
        }
      }
    }
    messages.push({ role: 'user', content: message })

    const response = await anthropic.messages.create({
      model: config.ai?.model || 'mimo-v2.5-pro',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const reply =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '抱歉，无法生成回复。'

    res.json({ reply, citedNotes, timestamp: new Date().toISOString() })
  } catch (err: any) {
    console.error('AI API error:', err.message)
    // Fallback to keyword-based response
    let reply = '抱歉，AI 服务暂时不可用。'
    if (citedNotes.length > 0) {
      reply += `\n\n不过我在知识库中找到了 ${citedNotes.length} 篇可能相关的笔记：\n\n`
      for (const cn of citedNotes) {
        reply += `**${cn.title}** — ${cn.excerpt.substring(0, 100)}...\n\n`
      }
    }
    res.json({ reply, citedNotes, timestamp: new Date().toISOString() })
  }
})

// ===== Agent Chat (SSE streaming with tool use) =====

app.post('/api/agent/chat', async (req, res) => {
  const { message, history } = req.body as {
    message: string
    history?: { role: 'user' | 'assistant'; content: string }[]
  }
  if (!message) {
    res.status(400).json({ error: 'Missing message' })
    return
  }

  if (!anthropic) {
    // Fallback: keyword-based response (same as old chat)
    const notes = getNotes()
    const relevant = findRelevantNotes(message, notes)
    let reply: string
    if (relevant.length > 0) {
      reply = `根据你的问题，找到 ${relevant.length} 篇相关笔记：\n\n`
      for (const n of relevant.slice(0, 3)) {
        reply += `**${n.title}** (${n.path}) — ${n.content.substring(0, 100)}...\n\n`
      }
    } else {
      reply = '未找到相关笔记。请尝试更具体的关键词。'
    }
    res.json({ reply, citedNotes: relevant.slice(0, 3).map(n => ({ title: n.title, path: n.path })), timestamp: new Date().toISOString() })
    return
  }

  // SSE streaming mode
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const sendEvent = (event: AgentEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  try {
    // Build message history
    const messages: { role: 'user' | 'assistant'; content: string }[] = []
    if (history) {
      for (const h of history.slice(-10)) {
        if (h.role === 'user' || h.role === 'assistant') {
          messages.push({ role: h.role, content: h.content })
        }
      }
    }
    messages.push({ role: 'user', content: message })

    // Run agent loop
    for await (const event of runAgentLoop(
      anthropic,
      config.ai?.model || 'mimo-v2.5-pro',
      messages,
      config.vaultPath,
    )) {
      sendEvent(event)
      if (event.type === 'error') break
    }
  } catch (err: any) {
    sendEvent({ type: 'error', content: err.message })
  }

  res.end()
})

// ===== File CRUD =====

app.post('/api/vault/file', (req, res) => {
  try {
    const { path: filePath, content, frontmatter } = req.body as {
      path: string; content: string; frontmatter?: Record<string, any>
    }
    if (!filePath || content === undefined) {
      res.status(400).json({ error: 'Missing path or content' }); return
    }
    const note = createFile(config.vaultPath, filePath, content, frontmatter)
    markSelfWrite(filePath)
    invalidateCache()
    res.json(note)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/vault/file', (req, res) => {
  try {
    const { path: filePath, content, frontmatter } = req.body as {
      path: string; content: string; frontmatter?: Record<string, any>
    }
    if (!filePath || content === undefined) {
      res.status(400).json({ error: 'Missing path or content' }); return
    }
    const note = updateFile(config.vaultPath, filePath, content, frontmatter)
    markSelfWrite(filePath)
    invalidateCache()
    res.json(note)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/vault/file', async (req, res) => {
  try {
    const { path: filePath } = req.body as { path: string }
    if (!filePath) {
      res.status(400).json({ error: 'Missing path' }); return
    }
    const result = await deleteFile(config.vaultPath, filePath)
    invalidateCache()
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

app.patch('/api/vault/file/rename', (req, res) => {
  try {
    const { oldPath, newPath } = req.body as { oldPath: string; newPath: string }
    if (!oldPath || !newPath) {
      res.status(400).json({ error: 'Missing oldPath or newPath' }); return
    }
    const result = renameFile(config.vaultPath, oldPath, newPath)
    invalidateCache()
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ===== Document Ingest (markitdown) =====

const SUPPORTED_FORMATS = [
  '.pdf', '.docx', '.xlsx', '.pptx', '.html', '.htm',
  '.csv', '.epub', '.odt', '.rtf', '.json', '.xml',
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff',
  '.mp3', '.wav', '.m4a', '.flac',
]

app.get('/api/ingest/status', async (_req, res) => {
  try {
    const { execSync } = await import('child_process')
    let installed = false
    let pythonVersion = ''
    try {
      pythonVersion = execSync('python --version 2>&1', { encoding: 'utf-8' }).trim()
      execSync('python -m markitdown --help 2>&1', { encoding: 'utf-8' })
      installed = true
    } catch {
      try {
        pythonVersion = execSync('python3 --version 2>&1', { encoding: 'utf-8' }).trim()
        execSync('python3 -m markitdown --help 2>&1', { encoding: 'utf-8' })
        installed = true
      } catch {
        installed = false
      }
    }
    res.json({ installed, pythonVersion, supportedFormats: SUPPORTED_FORMATS })
  } catch (err: any) {
    res.json({ installed: false, error: err.message, supportedFormats: SUPPORTED_FORMATS })
  }
})

app.post('/api/ingest/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' }); return
    }

    const originalName = req.file.originalname
    const ext = path.extname(originalName).toLowerCase()

    if (!SUPPORTED_FORMATS.includes(ext)) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path)
      res.status(400).json({ error: `Unsupported format: ${ext}. Supported: ${SUPPORTED_FORMATS.join(', ')}` })
      return
    }

    // Convert with markitdown
    const { execSync } = await import('child_process')
    let markdown = ''
    try {
      const cmd = `python -m markitdown "${req.file.path}"`
      markdown = execSync(cmd, { encoding: 'utf-8', timeout: 120000, maxBuffer: 50 * 1024 * 1024 })
    } catch {
      try {
        const cmd = `python3 -m markitdown "${req.file.path}"`
        markdown = execSync(cmd, { encoding: 'utf-8', timeout: 120000, maxBuffer: 50 * 1024 * 1024 })
      } catch (e2: any) {
        fs.unlinkSync(req.file.path)
        res.status(500).json({ error: `markitdown conversion failed: ${e2.message}` })
        return
      }
    }

    // Clean up uploaded temp file
    try { fs.unlinkSync(req.file.path) } catch { /* ok */ }

    if (!markdown.trim()) {
      res.status(500).json({ error: 'markitdown produced empty output' })
      return
    }

    // AI entity extraction + tag generation (if AI available)
    let extractedTags: string[] = []
    let entities: string[] = []
    if (anthropic) {
      try {
        const extractPrompt = `分析以下从文档转换来的 Markdown 内容，完成两个任务：
1. 提取关键实体（人物、概念、技术术语、重要主题），最多 10 个
2. 生成 3-5 个分类标签

请严格返回 JSON 格式（不要 markdown 代码块包裹）：
{"entities": ["实体1", "实体2"], "tags": ["标签1", "标签2"]}

文档内容：
${markdown.substring(0, 6000)}`

        const aiRes = await anthropic.messages.create({
          model: config.ai?.model || 'mimo-v2.5-pro',
          max_tokens: 512,
          system: '你是一个知识管理助手，只返回 JSON 格式的结果。',
          messages: [{ role: 'user', content: extractPrompt }],
        })
        if (aiRes.content[0].type === 'text') {
          const text = aiRes.content[0].text.trim()
          // Try to parse JSON from the response
          const jsonMatch = text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            entities = parsed.entities || []
            extractedTags = parsed.tags || []
          }
        }
      } catch (aiErr: any) {
        console.error('AI extraction error:', aiErr.message)
      }
    }

    // Build wikilinks from entities that match existing notes
    const notes = getNotes()
    const titleMap = new Map(notes.map(n => [n.title.toLowerCase(), n.title]))
    const wikilinks: string[] = []
    for (const entity of entities) {
      const match = titleMap.get(entity.toLowerCase())
      if (match) wikilinks.push(`[[${match}]]`)
    }

    // Build final markdown with frontmatter
    const baseName = path.basename(originalName, ext)
    const frontmatter: Record<string, any> = {
      title: baseName,
      tags: extractedTags.length > 0 ? extractedTags : ['imported'],
      created: new Date().toISOString().split('T')[0],
      source: originalName,
    }

    // Append wikilinks section if any
    let finalContent = markdown
    if (wikilinks.length > 0) {
      finalContent += `\n\n---\n## 相关笔记\n${wikilinks.join('\n')}\n`
    }

    // Write to vault under Ingested/ directory
    const ingestDir = 'Ingested'
    const targetPath = `${ingestDir}/${baseName}.md`
    let finalPath = targetPath
    let counter = 1
    // Handle name collision
    while (fs.existsSync(path.resolve(config.vaultPath, finalPath))) {
      finalPath = `${ingestDir}/${baseName}-${counter}.md`
      counter++
    }

    const note = createFile(config.vaultPath, finalPath, finalContent, frontmatter)
    invalidateCache()

    res.json({
      originalName,
      markdownPath: note.path,
      wordCount: note.wordCount,
      tags: extractedTags,
      entities,
      wikilinks: wikilinks.length,
      preview: markdown.substring(0, 500),
    })
  } catch (err: any) {
    console.error('Ingest error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== Auto-Research =====

app.post('/api/research', async (req, res) => {
  try {
    const { topic, auto } = req.body as { topic?: string; auto?: boolean }

    let researchTopic = topic
    if (!researchTopic && auto) {
      // Find knowledge gaps
      const notes = getNotes()
      const health = checkHealth(notes, config.vaultPath)
      const gapCategory = health.categories.find(c => c.name === 'knowledge_gaps')
      if (gapCategory && gapCategory.issues.length > 0) {
        // Pick the most referenced gap
        const gapMsg = gapCategory.issues[0].message
        const match = gapMsg.match(/"([^"]+)"/)
        if (match) researchTopic = match[1]
      }
    }

    if (!researchTopic) {
      res.status(400).json({ error: 'No topic provided and no knowledge gaps found' })
      return
    }

    if (!anthropic) {
      res.status(500).json({ error: 'AI not configured, cannot generate research note' })
      return
    }

    // Get vault context for better generation
    const notes = getNotes()
    const existingTags = [...new Set(notes.flatMap(n => n.tags))].slice(0, 20)
    const existingTitles = notes.map(n => n.title).slice(0, 30)

    const prompt = `请为知识库生成一篇关于"${researchTopic}"的结构化笔记。

知识库现有标签参考：${existingTags.join(', ')}
知识库现有笔记参考：${existingTitles.join(', ')}

要求：
1. 内容全面、结构清晰，使用 Markdown 格式
2. 包含概念定义、核心要点、应用场景
3. 适当使用 [[wikilinks]] 引用知识库中已有的相关笔记
4. 使用中文撰写

请直接返回 Markdown 内容，不需要 frontmatter（我会自动生成）。`

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'mimo-v2.5-pro',
      max_tokens: 2048,
      system: '你是一个知识管理助手，负责为 Obsidian 知识库生成高质量的结构化笔记。只返回 Markdown 内容。',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = aiRes.content[0].type === 'text' ? aiRes.content[0].text : ''
    if (!content.trim()) {
      res.status(500).json({ error: 'AI generated empty content' })
      return
    }

    const frontmatter: Record<string, any> = {
      title: researchTopic,
      tags: ['research', 'auto-generated'],
      created: new Date().toISOString().split('T')[0],
      source: 'auto-research',
    }

    const safeName = researchTopic.replace(/[<>:"/\\|?*]/g, '_')
    const targetPath = `Research/${safeName}.md`
    let finalPath = targetPath
    let counter = 1
    while (fs.existsSync(path.resolve(config.vaultPath, finalPath))) {
      finalPath = `Research/${safeName}-${counter}.md`
      counter++
    }

    const note = createFile(config.vaultPath, finalPath, content, frontmatter)
    invalidateCache()

    res.json({
      topic: researchTopic,
      path: note.path,
      wordCount: note.wordCount,
      preview: content.substring(0, 500),
    })
  } catch (err: any) {
    console.error('Research error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Get knowledge gaps for research UI
app.get('/api/research/gaps', (_req, res) => {
  try {
    const notes = getNotes()
    const health = checkHealth(notes, config.vaultPath)
    const gapCategory = health.categories.find(c => c.name === 'knowledge_gaps')
    const gaps = gapCategory?.issues.map(i => {
      const match = i.message.match(/"([^"]+)" 被 (\d+) 篇/)
      return match ? { topic: match[1], references: parseInt(match[2]) } : null
    }).filter(Boolean) || []
    res.json({ gaps })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Lint Auto-Fix =====

app.post('/api/vault/lint/fix', async (req, res) => {
  try {
    const { category, issueIndex } = req.body as { category: string; issueIndex?: number }
    const notes = getNotes()
    const health = checkHealth(notes, config.vaultPath)
    const cat = health.categories.find(c => c.name === category)
    if (!cat) {
      res.status(400).json({ error: `Unknown category: ${category}` }); return
    }

    const results: { fixed: string[]; skipped: string[] } = { fixed: [], skipped: [] }

    if (category === 'link_integrity') {
      // Fix dangling links: create stub notes for missing targets
      const titleSet = new Set(notes.map(n => n.title.toLowerCase()))
      const fileNameSet = new Set(notes.map(n => n.path.split('/').pop()?.replace('.md', '').toLowerCase() || ''))
      const missing = new Set<string>()
      for (const note of notes) {
        for (const link of note.links) {
          const lower = link.toLowerCase()
          if (!titleSet.has(lower) && !fileNameSet.has(lower)) {
            missing.add(link)
          }
        }
      }
      for (const name of missing) {
        try {
          const safeName = name.replace(/[<>:"/\\|?*]/g, '_')
          const fm = { title: name, tags: ['stub'], created: new Date().toISOString().split('T')[0] }
          const stubContent = `# ${name}\n\n> 此笔记由自动修复创建，内容待补充。\n\n## 待补充\n\n请在此添加关于 ${name} 的内容。\n`
          createFile(config.vaultPath, `${safeName}.md`, stubContent, fm)
          results.fixed.push(name)
        } catch {
          results.skipped.push(name)
        }
      }
    } else if (category === 'metadata_coverage') {
      // Fix missing frontmatter: add title + tags
      const lowMeta = notes.filter(n =>
        ['title', 'tags', 'created', 'updated'].filter(f => n.frontmatter[f] !== undefined).length < 2
      )
      const target = issueIndex !== undefined ? [lowMeta[issueIndex]] : lowMeta
      for (const note of target.filter(Boolean)) {
        try {
          const newFm = { ...note.frontmatter }
          if (!newFm.title) newFm.title = note.title
          if (!newFm.tags) newFm.tags = note.tags.length > 0 ? note.tags : ['untagged']
          if (!newFm.created) newFm.created = new Date().toISOString().split('T')[0]
          updateFile(config.vaultPath, note.path, note.content, newFm)
          results.fixed.push(note.path)
        } catch {
          results.skipped.push(note.path)
        }
      }
    } else if (category === 'tag_consistency') {
      // Fix similar tags: merge "tag" and "tags" by updating all affected files
      const allTags = notes.flatMap(n => n.tags)
      const tagCounts = new Map<string, number>()
      for (const tag of allTags) {
        tagCounts.set(tag.toLowerCase(), (tagCounts.get(tag.toLowerCase()) || 0) + 1)
      }
      const tagList = [...tagCounts.keys()]
      const merges: [string, string][] = []
      for (let i = 0; i < tagList.length; i++) {
        for (let j = i + 1; j < tagList.length; j++) {
          if (tagList[i] + 's' === tagList[j] || tagList[j] + 's' === tagList[i]) {
            merges.push([tagList[i], tagList[j]])
          }
        }
      }
      for (const [a, b] of merges) {
        // Keep the shorter tag, replace the longer one
        const [keep, remove] = a.length <= b.length ? [a, b] : [b, a]
        for (const note of notes) {
          const hasRemove = note.tags.some(t => t.toLowerCase() === remove)
          if (hasRemove) {
            try {
              const raw = fs.readFileSync(path.resolve(config.vaultPath, note.path), 'utf-8')
              const { data: fm, content } = matter(raw)
              if (fm.tags && Array.isArray(fm.tags)) {
                fm.tags = fm.tags.map((t: string) => t.toLowerCase() === remove ? keep : t)
              }
              updateFile(config.vaultPath, note.path, content, fm)
              results.fixed.push(`${note.path}: ${remove} → ${keep}`)
            } catch {
              results.skipped.push(note.path)
            }
          }
        }
      }
    } else if (category === 'orphan_notes') {
      // Fix orphan notes: add basic frontmatter if missing
      const linkedTitles = new Set(notes.flatMap(n => n.links.map(l => l.toLowerCase())))
      const orphans = notes.filter(n => {
        const title = n.title.toLowerCase()
        const fileName = n.path.split('/').pop()?.replace('.md', '').toLowerCase() || ''
        return !linkedTitles.has(title) && !linkedTitles.has(fileName)
      })
      const target = issueIndex !== undefined ? [orphans[issueIndex]] : orphans.slice(0, 5)
      for (const note of target.filter(Boolean)) {
        if (Object.keys(note.frontmatter).length < 2) {
          try {
            const newFm = { ...note.frontmatter, title: note.title, tags: note.tags.length > 0 ? note.tags : ['orphan'] }
            updateFile(config.vaultPath, note.path, note.content, newFm)
            results.fixed.push(note.path)
          } catch {
            results.skipped.push(note.path)
          }
        } else {
          results.skipped.push(note.path)
        }
      }
    } else {
      res.status(400).json({ error: `Auto-fix not supported for category: ${category}` })
      return
    }

    invalidateCache()
    res.json({ category, fixed: results.fixed.length, skipped: results.skipped.length, details: results })
  } catch (err: any) {
    console.error('Lint fix error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== Study (408 Exam Prep) =====

app.post('/api/study/flashcards', async (req, res) => {
  try {
    const { notePath } = req.body as { notePath: string }
    if (!notePath) { res.status(400).json({ error: 'Missing notePath' }); return }

    const note = getFile(config.vaultPath, notePath)
    if (!note) { res.status(404).json({ error: 'Note not found' }); return }

    if (!anthropic) {
      // Fallback: generate basic flashcards from content structure
      const lines = note.content.split('\n')
      const cards: { q: string; a: string }[] = []
      for (const line of lines) {
        const hMatch = line.match(/^#{1,3}\s+(.+)$/)
        if (hMatch && cards.length < 8) {
          const idx = lines.indexOf(line)
          const answerLines: string[] = []
          for (let j = idx + 1; j < lines.length && !lines[j].match(/^#{1,3}\s/) && answerLines.length < 4; j++) {
            if (lines[j].trim()) answerLines.push(lines[j].trim())
          }
          if (answerLines.length > 0) {
            cards.push({ q: `${hMatch[1]}是什么？`, a: answerLines.join('\n') })
          }
        }
      }
      res.json({ flashcards: cards.length > 0 ? cards : [{ q: `关于${note.title}的核心要点`, a: note.content.substring(0, 200) }], notePath, noteTitle: note.title })
      return
    }

    const prompt = `请根据以下笔记内容生成 8 张复习卡片（问答对）。
要求：
1. 问题要覆盖核心概念和关键细节
2. 答案要简洁准确，适合快速复习
3. 问题类型包括：概念解释、对比分析、应用场景
4. 使用中文

严格返回 JSON 数组格式（不要代码块包裹）：
[{"q": "问题1", "a": "答案1"}, {"q": "问题2", "a": "答案2"}]

笔记标题: ${note.title}
笔记内容:
${note.content.substring(0, 4000)}`

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'mimo-v2.5-pro',
      max_tokens: 2048,
      system: '你是一个考研复习助手，只返回 JSON 格式的问答对数组。',
      messages: [{ role: 'user', content: prompt }],
    })

    let flashcards: { q: string; a: string }[] = []
    if (aiRes.content[0].type === 'text') {
      const text = aiRes.content[0].text.trim()
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0])
      }
    }

    res.json({ flashcards, notePath, noteTitle: note.title })
  } catch (err: any) {
    console.error('Flashcard error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/study/review-due', (_req, res) => {
  try {
    const notes = getNotes()
    const now = Date.now()
    const intervals = [
      { days: 3, label: '3天未复习', priority: 'high' as const },
      { days: 7, label: '7天未复习', priority: 'medium' as const },
      { days: 14, label: '14天未复习', priority: 'low' as const },
    ]

    const subjectMap: Record<string, string[]> = {
      '数据结构': ['数据结构', 'data-structure', 'ds', 'data_structure', '算法', '链表', '树', '图', '排序'],
      '计算机组成': ['计算机组成', '计组', 'computer-organization', 'co', 'cpu', '存储器', '总线'],
      '计算机网络': ['计算机网络', '网络', 'network', 'tcp', 'ip', 'http', '路由', '协议'],
      '操作系统': ['操作系统', 'os', 'operating-system', '进程', '线程', '内存', '文件系统'],
    }

    const subjectNotes: Record<string, { due: any[]; total: number; totalWords: number; lastModified: string }> = {}
    for (const subject of Object.keys(subjectMap)) {
      subjectNotes[subject] = { due: [], total: 0, totalWords: 0, lastModified: '' }
    }
    subjectNotes['其他'] = { due: [], total: 0, totalWords: 0, lastModified: '' }

    for (const note of notes) {
      const modTime = new Date(note.modified).getTime()
      const daysSince = Math.floor((now - modTime) / (1000 * 60 * 60 * 24))
      const pathLower = note.path.toLowerCase()
      const tagsLower = note.tags.map(t => t.toLowerCase())
      const combined = `${pathLower} ${tagsLower.join(' ')}`

      let subject = '其他'
      for (const [subj, keywords] of Object.entries(subjectMap)) {
        if (keywords.some(k => combined.includes(k))) { subject = subj; break }
      }

      subjectNotes[subject].total++
      subjectNotes[subject].totalWords += note.wordCount
      if (!subjectNotes[subject].lastModified || note.modified > subjectNotes[subject].lastModified) {
        subjectNotes[subject].lastModified = note.modified
      }

      for (const interval of intervals) {
        if (daysSince >= interval.days) {
          subjectNotes[subject].due.push({
            path: note.path, title: note.title, tags: note.tags,
            daysSinceModified: daysSince, priority: interval.priority,
            interval: interval.label, wordCount: note.wordCount,
          })
          break
        }
      }
    }

    const reviewQueue = Object.entries(subjectNotes).map(([subject, data]) => ({
      subject,
      totalNotes: data.total,
      totalWords: data.totalWords,
      lastModified: data.lastModified,
      dueCount: data.due.length,
      dueNotes: data.due.sort((a: any, b: any) => b.daysSinceModified - a.daysSinceModified).slice(0, 10),
    })).filter(s => s.totalNotes > 0)

    const stats = Object.entries(subjectNotes).map(([subject, data]) => ({
      subject, totalNotes: data.total, totalWords: data.totalWords, lastModified: data.lastModified,
    })).filter(s => s.totalNotes > 0)

    res.json({ reviewQueue, stats })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Settings =====

app.get('/api/settings', (_req, res) => {
  try {
    const masked = { ...config }
    if (masked.ai) {
      masked.ai = {
        ...masked.ai,
        apiKey: masked.ai.apiKey
          ? masked.ai.apiKey.substring(0, 8) + '...' + masked.ai.apiKey.substring(masked.ai.apiKey.length - 4)
          : '',
      }
    }
    res.json({ ...masked, configPath: loadedConfigPath })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/api/settings', (req, res) => {
  try {
    const { vaultPath, port, ai } = req.body as {
      vaultPath?: string; port?: number; ai?: { apiKey: string; baseURL: string; model?: string }
    }
    if (vaultPath !== undefined) config.vaultPath = vaultPath
    if (port !== undefined) config.port = port
    if (ai !== undefined) {
      config.ai = ai
      reinitAnthropic()
    }
    // Persist to config file
    const savePath = loadedConfigPath || configPaths[0]
    if (savePath) {
      fs.writeFileSync(savePath, JSON.stringify(config, null, 2), 'utf-8')
      console.log(`Settings saved to: ${savePath}`)
    }
    invalidateCache()
    res.json({ ok: true, vaultPath: config.vaultPath, aiConfigured: !!config.ai })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Vault Watcher & SSE (Bidirectional Sync) =====

const sseClients: Set<express.Response> = new Set()
const selfWriteTracker = new Set<string>()

// Track files written by our app to avoid echo loops
function markSelfWrite(relativePath: string) {
  selfWriteTracker.add(relativePath)
  setTimeout(() => selfWriteTracker.delete(relativePath), 5000)
}

// Initialize chokidar watcher
let watcher: chokidar.FSWatcher | null = null

function startWatcher() {
  if (watcher) { watcher.close() }
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

  const emitEvent = (type: string, filePath: string) => {
    const relative = path.relative(config.vaultPath, filePath).replace(/\\/g, '/')
    if (selfWriteTracker.has(relative)) return
    const payload = JSON.stringify({ type, path: relative, timestamp: new Date().toISOString() })
    for (const client of sseClients) {
      client.write(`data: ${payload}\n\n`)
    }
    invalidateCache()
  }

  watcher
    .on('add', (fp) => emitEvent('file-added', fp))
    .on('change', (fp) => emitEvent('file-changed', fp))
    .on('unlink', (fp) => emitEvent('file-deleted', fp))

  console.log(`Vault watcher started: ${config.vaultPath}`)
}

// Start watcher on boot
startWatcher()

app.get('/api/vault/events', (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  sseClients.add(res)
  res.write(':keepalive\n\n')

  const heartbeat = setInterval(() => {
    res.write(':keepalive\n\n')
  }, 30000)

  _req.on('close', () => {
    sseClients.delete(res)
    clearInterval(heartbeat)
  })
})

// ===== Daily Error Log (错题本) =====

function getErrorLogDir() { return '错题本' }

function parseErrorLog(content: string): { questions: any[]; meta: Record<string, any> } {
  const { data: meta, content: body } = matter(content)
  const questions: any[] = []
  const blocks = body.split(/^## 错题 \d+/m).filter(Boolean)
  for (const block of blocks) {
    const q: Record<string, string> = {}
    const fieldMap: Record<string, string> = {
      '来源笔记': 'source', '题目': 'question', '你的回答': 'userAnswer',
      '正确答案': 'correctAnswer', '解析': 'explanation',
      '复习次数': 'reviewCount', '下次复习': 'nextReview',
    }
    for (const line of block.split('\n')) {
      for (const [cn, en] of Object.entries(fieldMap)) {
        const match = line.match(new RegExp(`\\*\\*${cn}\\*\\*[:：]\\s*(.+)`))
        if (match) q[en] = match[1].trim()
      }
    }
    if (q.question) questions.push(q)
  }
  return { questions, meta }
}

function buildErrorLog(date: string, questions: any[]): string {
  let content = `---\ndate: ${date}\ntype: error-log\n---\n\n`
  questions.forEach((q, i) => {
    content += `## 错题 ${i + 1}\n`
    content += `- **来源笔记**: ${q.source || ''}\n`
    content += `- **题目**: ${q.question}\n`
    content += `- **你的回答**: ${q.userAnswer || ''}\n`
    content += `- **正确答案**: ${q.correctAnswer}\n`
    content += `- **解析**: ${q.explanation || ''}\n`
    content += `- **复习次数**: ${q.reviewCount || '0'}\n`
    content += `- **下次复习**: ${q.nextReview || ''}\n\n`
  })
  return content
}

app.post('/api/study/error-log', async (req, res) => {
  try {
    const { notePath, question, userAnswer, correctAnswer, explanation } = req.body as {
      notePath: string; question: string; userAnswer?: string; correctAnswer: string; explanation?: string
    }
    if (!question || !correctAnswer) {
      res.status(400).json({ error: 'Missing question or correctAnswer' }); return
    }

    const today = new Date().toISOString().split('T')[0]
    const logPath = `${getErrorLogDir()}/${today}.md`
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    const newQ = {
      source: notePath || '', question, userAnswer: userAnswer || '',
      correctAnswer, explanation: explanation || '', reviewCount: '0', nextReview: tomorrow,
    }

    let questions: any[] = []
    try {
      const existing = getFile(config.vaultPath, logPath)
      if (existing) {
        const parsed = parseErrorLog(existing.content)
        questions = parsed.questions
      }
    } catch { /* no existing file */ }

    questions.push(newQ)
    const content = buildErrorLog(today, questions)
    const fm = { date: today, type: 'error-log' }

    try {
      updateFile(config.vaultPath, logPath, content, fm)
    } catch {
      createFile(config.vaultPath, logPath, content, fm)
    }
    markSelfWrite(logPath)
    invalidateCache()

    res.json({ ok: true, path: logPath, totalQuestions: questions.length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/study/error-log', (req, res) => {
  try {
    const date = String(req.query.date || new Date().toISOString().split('T')[0])
    const logPath = `${getErrorLogDir()}/${date}.md`
    try {
      const file = getFile(config.vaultPath, logPath)
      if (file) {
        const parsed = parseErrorLog(file.content)
        res.json({ date, questions: parsed.questions, path: logPath })
        return
      }
    } catch { /* file not found */ }
    res.json({ date, questions: [], path: logPath })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/study/daily-review', (_req, res) => {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const errorDir = path.resolve(config.vaultPath, getErrorLogDir())
    const allQuestions: any[] = []

    if (fs.existsSync(errorDir)) {
      const files = fs.readdirSync(errorDir).filter(f => f.endsWith('.md'))
      for (const file of files) {
        try {
          const fullPath = path.join(errorDir, file)
          const raw = fs.readFileSync(fullPath, 'utf-8')
          const parsed = parseErrorLog(raw)
          for (const q of parsed.questions) {
            q._sourceFile = file
            allQuestions.push(q)
          }
        } catch { /* skip bad files */ }
      }
    }

    // Filter questions due for review
    const dueQuestions = allQuestions.filter(q => {
      if (!q.nextReview) return true
      return q.nextReview <= todayStr
    })

    // Stats
    const totalQuestions = allQuestions.length
    const masteredCount = allQuestions.filter(q => parseInt(q.reviewCount || '0') >= 3).length
    const dueCount = dueQuestions.length

    // Subject distribution
    const subjectMap: Record<string, string[]> = {
      '数据结构': ['数据结构', 'data-structure', 'ds', '算法', '链表', '树', '图', '排序'],
      '计算机组成': ['计算机组成', '计组', 'computer-organization', 'co', 'cpu', '存储器'],
      '计算机网络': ['计算机网络', '网络', 'network', 'tcp', 'ip', 'http', '路由'],
      '操作系统': ['操作系统', 'os', 'operating-system', '进程', '线程', '内存'],
    }
    const subjectCounts: Record<string, number> = { '数据结构': 0, '计算机组成': 0, '计算机网络': 0, '操作系统': 0, '其他': 0 }
    for (const q of allQuestions) {
      const src = (q.source || '').toLowerCase()
      let found = false
      for (const [subj, keywords] of Object.entries(subjectMap)) {
        if (keywords.some(k => src.includes(k))) { subjectCounts[subj]++; found = true; break }
      }
      if (!found) subjectCounts['其他']++
    }

    // Generate AI practice questions if available
    let generatedQuestions: any[] = []

    res.json({
      date: todayStr,
      dueQuestions: dueQuestions.slice(0, 30),
      generatedQuestions,
      stats: {
        totalQuestions, masteredCount, dueCount,
        subjectCounts,
        streakDays: 0, // TODO: calculate streak
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/study/review-complete', (req, res) => {
  try {
    const { date, questionIndex, result } = req.body as {
      date: string; questionIndex: number; result: 'mastered' | 'hard' | 'easy'
    }
    if (!date) { res.status(400).json({ error: 'Missing date' }); return }

    const logPath = `${getErrorLogDir()}/${date}.md`
    try {
      const file = getFile(config.vaultPath, logPath)
      if (!file) { res.status(404).json({ error: 'Log not found' }); return }

      const parsed = parseErrorLog(file.content)
      if (questionIndex >= 0 && questionIndex < parsed.questions.length) {
        const q = parsed.questions[questionIndex]
        const count = parseInt(q.reviewCount || '0') + 1
        q.reviewCount = String(count)

        // Spaced repetition: mastered=14d, easy=7d, hard=1d
        const days = result === 'mastered' ? 14 : result === 'easy' ? 7 : 1
        const next = new Date(Date.now() + days * 86400000).toISOString().split('T')[0]
        q.nextReview = next

        const content = buildErrorLog(date, parsed.questions)
        updateFile(config.vaultPath, logPath, content, { date, type: 'error-log' })
        markSelfWrite(logPath)
        invalidateCache()
      }

      res.json({ ok: true })
    } catch {
      res.status(404).json({ error: 'Log not found' })
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== 考研英语词汇 (Graduate Exam English Vocabulary) =====

interface VocabProgress {
  status: 'known' | 'fuzzy' | 'unknown' | 'new'
  nextReview: string
  reviews: number
  addedDate: string
}

// Load vocabulary pool from the data file
function loadVocabPool(): Array<{ word: string; phonetic: string; definition: string; example: string; exampleCn: string; frequency: string; unit: number }> {
  try {
    // Try reading from src/data/vocabulary.ts (development)
    const vocabFilePath = path.join(__dirname, '..', 'src', 'data', 'vocabulary.ts')
    if (fs.existsSync(vocabFilePath)) {
      const content = fs.readFileSync(vocabFilePath, 'utf-8')
      // Extract the array from VOCAB_POOL export
      const arrayMatch = content.match(/VOCAB_POOL.*?=\s*\[([\s\S]*)\]/)
      if (arrayMatch) {
        // Parse objects from the array content
        const items: any[] = []
        const objRegex = /\{[\s\S]*?word:\s*'([^']*)'[\s\S]*?phonetic:\s*'([^']*)'[\s\S]*?definition:\s*'([^']*)'[\s\S]*?example:\s*'([^']*)'[\s\S]*?exampleCn:\s*'([^']*)'[\s\S]*?frequency:\s*'([^']*)'[\s\S]*?unit:\s*(\d+)[\s\S]*?\}/g
        let match
        while ((match = objRegex.exec(arrayMatch[1])) !== null) {
          items.push({
            word: match[1], phonetic: match[2], definition: match[3],
            example: match[4], exampleCn: match[5], frequency: match[6],
            unit: parseInt(match[7]),
          })
        }
        if (items.length > 0) return items
      }
    }
  } catch { /* ignore */ }
  // Fallback: small built-in pool
  return [
    { word: 'analyze', phonetic: '/ˈænəlaɪz/', definition: '分析', example: 'We need to analyze the data.', exampleCn: '我们需要分析数据。', frequency: '高频', unit: 1 },
    { word: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', definition: '重要的；显著的', example: 'A significant difference.', exampleCn: '一个显著的差异。', frequency: '高频', unit: 1 },
    { word: 'hypothesis', phonetic: '/haɪˈpɒθəsɪs/', definition: '假设', example: 'Test the hypothesis.', exampleCn: '验证假设。', frequency: '高频', unit: 1 },
  ]
}

const VOCAB_POOL = loadVocabPool()

// Read/write progress from vault
function getVocabProgressPath() { return '单词本/progress.md' }

function readVocabProgress(): Record<string, VocabProgress> {
  try {
    const file = getFile(config.vaultPath, getVocabProgressPath())
    if (!file) return {}
    const { content: body } = matter(file.content)
    // Extract JSON from code block
    const jsonMatch = body.match(/```json\s*([\s\S]*?)```/)
    if (jsonMatch) return JSON.parse(jsonMatch[1])
    // Try parsing the whole body as JSON
    return JSON.parse(body.trim())
  } catch { return {} }
}

function writeVocabProgress(progress: Record<string, VocabProgress>) {
  const todayStr = new Date().toISOString().split('T')[0]
  const content = `---\ntype: vocab-progress\nupdated: '${todayStr}'\n---\n\n\`\`\`json\n${JSON.stringify(progress, null, 2)}\n\`\`\`\n`
  const vocabPath = getVocabProgressPath()
  try { updateFile(config.vaultPath, vocabPath, content, { type: 'vocab-progress', updated: todayStr }) }
  catch { createFile(config.vaultPath, vocabPath, content, { type: 'vocab-progress', updated: todayStr }) }
  markSelfWrite(vocabPath)
  invalidateCache()
}

app.get('/api/study/vocabulary', (_req, res) => {
  try {
    const progress = readVocabProgress()
    const todayStr = new Date().toISOString().split('T')[0]
    const learnedWords = Object.keys(progress)
    const existingSet = new Set(learnedWords.map(w => w.toLowerCase()))

    // Find words due for review
    const dueWords = learnedWords.filter(w => {
      const p = progress[w]
      return !p.nextReview || p.nextReview <= todayStr
    })

    // Get due word details from pool
    const dueRecords = dueWords.slice(0, 30).map(w => {
      const entry = VOCAB_POOL.find(e => e.word.toLowerCase() === w.toLowerCase())
      const p = progress[w]
      return {
        word: entry?.word || w,
        phonetic: entry?.phonetic || '',
        definition: entry?.definition || '',
        example: entry?.example || '',
        exampleCn: entry?.exampleCn || '',
        frequency: entry?.frequency || '中频',
        unit: entry?.unit || 0,
        reviews: p.reviews,
        nextReview: p.nextReview,
      }
    })

    // Suggest new words not yet learned
    const suggested = VOCAB_POOL
      .filter(w => !existingSet.has(w.word.toLowerCase()))
      .slice(0, 15)
      .map(w => ({
        word: w.word, definition: w.definition, phonetic: w.phonetic,
        example: w.example, frequency: w.frequency, unit: w.unit,
      }))

    // Stats
    const mastered = learnedWords.filter(w => progress[w].reviews >= 5).length
    const learning = learnedWords.filter(w => progress[w].reviews > 0 && progress[w].reviews < 5).length
    const newWords = learnedWords.filter(w => progress[w].reviews === 0).length

    res.json({
      totalWords: learnedWords.length,
      dueWords: dueWords.length,
      dueRecords,
      suggested,
      stats: { mastered, learning, newWords },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/study/vocabulary/add', (req, res) => {
  try {
    const { words } = req.body as { words: Array<{ word: string; definition: string; phonetic?: string }> }
    if (!words || !words.length) { res.status(400).json({ error: 'No words provided' }); return }

    const progress = readVocabProgress()
    const todayStr = new Date().toISOString().split('T')[0]
    let addedCount = 0

    for (const w of words) {
      const key = w.word.toLowerCase()
      if (!progress[key]) {
        progress[w.word] = { status: 'new', nextReview: todayStr, reviews: 0, addedDate: todayStr }
        addedCount++
      }
    }

    writeVocabProgress(progress)
    res.json({ ok: true, added: addedCount, total: Object.keys(progress).length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/study/vocabulary/review', (req, res) => {
  try {
    const { word, result } = req.body as { word: string; result: 'known' | 'fuzzy' | 'unknown' }
    if (!word) { res.status(400).json({ error: 'Missing word' }); return }

    const progress = readVocabProgress()
    const key = Object.keys(progress).find(k => k.toLowerCase() === word.toLowerCase())
    if (!key) { res.status(404).json({ error: 'Word not found in progress' }); return }

    progress[key].reviews++
    progress[key].status = result
    const days = result === 'known' ? 7 : result === 'fuzzy' ? 3 : 1
    progress[key].nextReview = new Date(Date.now() + days * 86400000).toISOString().split('T')[0]

    writeVocabProgress(progress)
    res.json({ ok: true, word, reviewCount: progress[key].reviews, nextReview: progress[key].nextReview })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// Generate vocabulary: return suggested words from pool (AI could be integrated later)
app.post('/api/study/vocabulary/generate', (req, res) => {
  try {
    const { unit, frequency } = req.body as { unit?: number; frequency?: string }
    const progress = readVocabProgress()
    const existingSet = new Set(Object.keys(progress).map(w => w.toLowerCase()))

    let filtered = VOCAB_POOL.filter(w => !existingSet.has(w.word.toLowerCase()))
    if (unit) filtered = filtered.filter(w => w.unit === unit)
    if (frequency) filtered = filtered.filter(w => w.frequency === frequency)

    const words = filtered.slice(0, 20).map(w => ({
      word: w.word, definition: w.definition, phonetic: w.phonetic,
      example: w.example, exampleCn: w.exampleCn, frequency: w.frequency, unit: w.unit,
    }))

    res.json({ words })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/vault/refresh', (_req, res) => {
  invalidateCache()
  startWatcher() // Restart watcher in case vault path changed
  const notes = getNotes()
  res.json({ ok: true, noteCount: notes.length })
})

// ===== Music =====

const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma'])

app.get('/api/music/scan', (req, res) => {
  const folderPath = (req.query.path as string) || ''
  if (!folderPath) {
    return res.status(400).json({ error: 'Missing path parameter' })
  }

  // Security: only allow scanning paths that exist
  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ error: 'Directory not found' })
  }

  try {
    const files: { name: string; path: string; size: number; ext: string }[] = []

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scanDir(fullPath)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (AUDIO_EXTS.has(ext)) {
            const stat = fs.statSync(fullPath)
            files.push({
              name: path.basename(entry.name, ext),
              path: fullPath,
              size: stat.size,
              ext: ext.slice(1),
            })
          }
        }
      }
    }

    scanDir(folderPath)
    res.json({ path: folderPath, files })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/music/stream', (req, res) => {
  const filePath = req.query.path as string
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' })
  }

  const stat = fs.statSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.wma': 'audio/x-ms-wma',
  }
  const contentType = mimeTypes[ext] || 'audio/mpeg'
  const fileSize = stat.size

  const range = req.headers.range
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunkSize = end - start + 1

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    })
    fs.createReadStream(filePath, { start, end }).pipe(res)
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    })
    fs.createReadStream(filePath).pipe(res)
  }
})

// ===== Default / Music paths saved in settings =====
app.get('/api/music/path', (_req, res) => {
  res.json({ musicPath: (config as any).musicPath || '' })
})

app.put('/api/music/path', (req, res) => {
  const { musicPath } = req.body
  if (musicPath !== undefined) {
    (config as any).musicPath = musicPath
    // Persist to config file
    if (loadedConfigPath) {
      try {
        const raw = fs.readFileSync(loadedConfigPath, 'utf-8')
        const cfg = JSON.parse(raw)
        cfg.musicPath = musicPath
        fs.writeFileSync(loadedConfigPath, JSON.stringify(cfg, null, 2))
      } catch { /* ignore */ }
    }
  }
  res.json({ ok: true, musicPath })
})

// ===== Quiz (在线做题) =====

app.post('/api/quiz/submit', (req, res) => {
  try {
    const { mode, answers, questions, timeTaken } = req.body as {
      mode: 'practice' | 'exam'
      answers: Record<string, string>
      questions: Array<{ id: string; subject: string; question: string; answer: string; explanation: string; tags: string[] }>
      timeTaken: number
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: 'Missing or empty questions' }); return
    }
    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ error: 'Missing answers' }); return
    }

    // Generate summary markdown
    const summary = generateQuizSummary({
      mode: mode || 'practice',
      questions,
      answers,
      timeTaken: timeTaken || 0,
    })

    // Build per-subject breakdown
    const subjectBreakdown: Record<string, { total: number; correct: number }> = {}
    for (const q of questions) {
      if (!subjectBreakdown[q.subject]) {
        subjectBreakdown[q.subject] = { total: 0, correct: 0 }
      }
      subjectBreakdown[q.subject].total++
      if (answers[q.id] === q.answer) {
        subjectBreakdown[q.subject].correct++
      }
    }

    // Save summary to vault at 做题记录/YYYY-MM-DD-HHmm.md
    let summaryPath = ''
    try {
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const hmStr = now.toTimeString().split(' ')[0].substring(0, 5).replace(':', '')
      const fileName = `${dateStr}-${hmStr}.md`
      const targetPath = `做题记录/${fileName}`

      const fm = {
        type: 'quiz-result',
        date: dateStr,
        mode: mode || 'practice',
        score: questions.length > 0 ? Math.round((summary.correctCount / questions.length) * 100) : 0,
        total: questions.length,
        correct: summary.correctCount,
        wrong: summary.wrongCount,
        tags: ['quiz', '做题记录'],
      }

      try {
        createFile(config.vaultPath, targetPath, summary.content, fm)
      } catch {
        // File may exist, try update
        updateFile(config.vaultPath, targetPath, summary.content, fm)
      }
      markSelfWrite(targetPath)
      invalidateCache()
      summaryPath = targetPath
    } catch (saveErr: any) {
      console.error('Quiz summary save error:', saveErr.message)
      // Continue — return results even if save fails
    }

    res.json({
      result: {
        total: questions.length,
        correct: summary.correctCount,
        wrong: summary.wrongCount,
        timeTaken: timeTaken || 0,
        subjectBreakdown,
      },
      summaryPath,
    })
  } catch (err: any) {
    console.error('Quiz submit error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== Quiz AI Generate (AI 生成题目) =====

app.post('/api/quiz/generate', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }
    const { prompt } = req.body as { prompt: string }
    if (!prompt) {
      res.status(400).json({ error: '缺少 prompt 参数' })
      return
    }

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'mimo-v2.5-pro',
      max_tokens: 4096,
      system: '你是一个408考研出题专家。请严格按照用户要求的JSON格式输出题目，不要添加任何额外文字、解释或markdown标记。只输出纯JSON数组。',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '[]'
    res.json({ questions: text })
  } catch (err: any) {
    console.error('Quiz generate error:', err.message)
    res.status(500).json({ error: 'AI 生成失败: ' + err.message })
  }
})

app.get('/api/quiz/history', (_req, res) => {
  try {
    const quizDir = path.resolve(config.vaultPath, '做题记录')
    if (!fs.existsSync(quizDir)) {
      res.json({ files: [] })
      return
    }

    const files = fs.readdirSync(quizDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .map(f => {
        try {
          const fullPath = path.join(quizDir, f)
          const raw = fs.readFileSync(fullPath, 'utf-8')
          const { data: fm } = matter(raw)
          return {
            fileName: f,
            path: `做题记录/${f}`,
            date: fm.date || '',
            mode: fm.mode || '',
            score: fm.score ?? null,
            total: fm.total ?? null,
            correct: fm.correct ?? null,
            wrong: fm.wrong ?? null,
          }
        } catch {
          return { fileName: f, path: `做题记录/${f}`, date: '', mode: '', score: null, total: null, correct: null, wrong: null }
        }
      })

    res.json({ files })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// SPA fallback — serve index.html for client-side routes (non-API paths)
app.use((_req, res) => {
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Frontend not built. Run: npm run build')
  }
})

// Export for Electron or standalone
export function startServer(port?: number) {
  const p = port || config.port || 3001
  return new Promise<void>((resolve) => {
    app.listen(p, () => {
      console.log(`\n  Obsidian Viz API running on http://localhost:${p}`)
      console.log(`  Vault path: ${config.vaultPath}`)
      console.log(`  AI: ${anthropic ? 'Connected' : 'Not configured'}`)
      console.log(`  Status: ${fs.existsSync(config.vaultPath) ? 'Connected' : 'Vault not found'}\n`)
      resolve()
    })
  })
}

export { app }

// Standalone mode
const isMain = process.argv[1] && (
  process.argv[1].endsWith('index.ts') ||
  process.argv[1].endsWith('index.js') ||
  process.argv[1].endsWith('server.mjs') ||
  process.argv[1].endsWith('server.js')
)
if (isMain) {
  startServer()
}
