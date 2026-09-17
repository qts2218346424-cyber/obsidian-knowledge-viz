import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import {
  config,
  anthropic,
  getNotes,
  invalidateCache,
  markSelfWrite,
  sseClients,
  startWatcher,
  upload,
} from '../context.js'
import {
  createFile,
  updateFile,
  deleteFile,
  renameFile,
  getFile,
  getTree,
} from '../vault-parser.js'
import { buildGraph } from '../graph-builder.js'
import { checkHealth } from '../health-checker.js'

export const vaultRouter = Router()

// ===== Vault Stats & Health =====

vaultRouter.get('/vault/stats', (_req, res) => {
  try {
    const notes = getNotes()
    const health = checkHealth(notes, config.vaultPath)
    res.json({ vaultPath: config.vaultPath, connected: notes.length > 0, ...health.stats })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

vaultRouter.get('/vault/graph', (_req, res) => {
  try {
    const notes = getNotes()
    res.json(buildGraph(notes))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

vaultRouter.get('/vault/health', (_req, res) => {
  try {
    const notes = getNotes()
    res.json(checkHealth(notes, config.vaultPath))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Vault Search & Files =====

vaultRouter.get('/vault/files', (req, res) => {
  try {
    const notes = getNotes()
    const query = String(req.query.q || '').toLowerCase().trim()
    if (!query) {
      res.json(notes.map(n => ({ path: n.path, title: n.title, tags: n.tags, modified: n.modified, wordCount: n.wordCount })))
      return
    }

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
          if (tag.toLowerCase().includes(token)) {
            score += 3
            break
          }
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

vaultRouter.get('/vault/file', (req, res) => {
  try {
    const filePath = String(req.query.path || '')
    if (!filePath) {
      res.status(400).json({ error: 'Missing path parameter' })
      return
    }
    const note = getFile(config.vaultPath, filePath)
    if (!note) {
      res.status(404).json({ error: 'File not found' })
      return
    }
    res.json(note)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

vaultRouter.get('/vault/tree', (_req, res) => {
  try {
    res.json(getTree(config.vaultPath))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== File CRUD =====

vaultRouter.post('/vault/file', (req, res) => {
  try {
    const { path: filePath, content, frontmatter } = req.body as {
      path: string
      content: string
      frontmatter?: Record<string, any>
    }
    if (!filePath || content === undefined) {
      res.status(400).json({ error: 'Missing path or content' })
      return
    }
    const note = createFile(config.vaultPath, filePath, content, frontmatter)
    markSelfWrite(filePath)
    invalidateCache()
    res.json(note)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

vaultRouter.put('/vault/file', (req, res) => {
  try {
    const { path: filePath, content, frontmatter } = req.body as {
      path: string
      content: string
      frontmatter?: Record<string, any>
    }
    if (!filePath || content === undefined) {
      res.status(400).json({ error: 'Missing path or content' })
      return
    }
    const note = updateFile(config.vaultPath, filePath, content, frontmatter)
    markSelfWrite(filePath)
    invalidateCache()
    res.json(note)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

vaultRouter.delete('/vault/file', async (req, res) => {
  try {
    const { path: filePath } = req.body as { path: string }
    if (!filePath) {
      res.status(400).json({ error: 'Missing path' })
      return
    }
    const result = await deleteFile(config.vaultPath, filePath)
    invalidateCache()
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

vaultRouter.patch('/vault/file/rename', (req, res) => {
  try {
    const { oldPath, newPath } = req.body as { oldPath: string; newPath: string }
    if (!oldPath || !newPath) {
      res.status(400).json({ error: 'Missing oldPath or newPath' })
      return
    }
    const result = renameFile(config.vaultPath, oldPath, newPath)
    invalidateCache()
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

vaultRouter.post('/vault/refresh', (_req, res) => {
  invalidateCache()
  startWatcher()
  const notes = getNotes()
  res.json({ ok: true, noteCount: notes.length })
})

// ===== Vault Watcher SSE =====

vaultRouter.get('/vault/events', (_req, res) => {
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

// ===== Document Ingest =====

const SUPPORTED_FORMATS = [
  '.pdf', '.docx', '.xlsx', '.pptx', '.html', '.htm',
  '.csv', '.epub', '.odt', '.rtf', '.json', '.xml',
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff',
  '.mp3', '.wav', '.m4a', '.flac',
]

vaultRouter.get('/ingest/status', async (_req, res) => {
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

vaultRouter.post('/ingest/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const originalName = req.file.originalname
    const ext = path.extname(originalName).toLowerCase()

    if (!SUPPORTED_FORMATS.includes(ext)) {
      fs.unlinkSync(req.file.path)
      res.status(400).json({ error: `Unsupported format: ${ext}. Supported: ${SUPPORTED_FORMATS.join(', ')}` })
      return
    }

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

    try { fs.unlinkSync(req.file.path) } catch { /* ok */ }

    if (!markdown.trim()) {
      res.status(500).json({ error: 'markitdown produced empty output' })
      return
    }

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
          model: config.ai?.model || 'deepseek-v4-pro',
          max_tokens: 512,
          system: '你是一个知识管理助手，只返回 JSON 格式的结果。',
          messages: [{ role: 'user', content: extractPrompt }],
        })
        if (aiRes.content[0].type === 'text') {
          const text = aiRes.content[0].text.trim()
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

    const notes = getNotes()
    const titleMap = new Map(notes.map(n => [n.title.toLowerCase(), n.title]))
    const wikilinks: string[] = []
    for (const entity of entities) {
      const match = titleMap.get(entity.toLowerCase())
      if (match) wikilinks.push(`[[${match}]]`)
    }

    const baseName = path.basename(originalName, ext)
    const frontmatter: Record<string, any> = {
      title: baseName,
      tags: extractedTags.length > 0 ? extractedTags : ['imported'],
      created: new Date().toISOString().split('T')[0],
      source: originalName,
    }

    let finalContent = markdown
    if (wikilinks.length > 0) {
      finalContent += `\n\n---\n## 相关笔记\n${wikilinks.join('\n')}\n`
    }

    const ingestDir = 'Ingested'
    const targetPath = `${ingestDir}/${baseName}.md`
    let finalPath = targetPath
    let counter = 1
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
    console.error('Ingest upload error:', err.message)
    res.status(500).json({ error: err.message })
  }
})
