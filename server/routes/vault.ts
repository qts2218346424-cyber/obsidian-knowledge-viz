import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import {
  config,
  anthropic,
  getNotes,
  invalidateCache,
  markSelfWrite,
  sseClients,
  startWatcher,
  upload,
  __dirname,
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
import { organizeDocumentIntoWiki } from '../services/wiki-organizer.js'

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

vaultRouter.post('/vault/open-folder', (_req, res) => {
  try {
    if (!config.vaultPath || !fs.existsSync(config.vaultPath)) {
      res.status(404).json({ error: '本地 Obsidian 知识库路径不存在或尚未配置' })
      return
    }
    const target = config.vaultPath.replace(/\//g, '\\')
    if (process.platform === 'win32') {
      exec(`explorer.exe "${target}"`)
    } else if (process.platform === 'darwin') {
      exec(`open "${config.vaultPath}"`)
    } else {
      exec(`xdg-open "${config.vaultPath}"`)
    }
    res.json({ ok: true, vaultPath: config.vaultPath })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
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
  '.txt', '.md', '.markdown',
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
      installed = true
    } catch {
      try {
        pythonVersion = execSync('python3 --version 2>&1', { encoding: 'utf-8' }).trim()
        installed = true
      } catch {
        installed = false
      }
    }
    res.json({
      installed,
      pythonVersion,
      engine: 'Microsoft MarkItDown + Claude-Obsidian Self-Organizing Brain',
      supportedFormats: SUPPORTED_FORMATS
    })
  } catch (err: any) {
    res.json({ installed: false, error: err.message, supportedFormats: SUPPORTED_FORMATS })
  }
})

vaultRouter.post('/ingest/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未接收到上传的文件内容' })
      return
    }

    let originalName = req.file.originalname
    try {
      const decoded = Buffer.from(originalName, 'latin1').toString('utf8')
      if (/[\u4e00-\u9fa5]/.test(decoded)) {
        originalName = decoded
      }
    } catch {}
    const ext = path.extname(originalName).toLowerCase()

    if (!SUPPORTED_FORMATS.includes(ext)) {
      try { fs.unlinkSync(req.file.path) } catch {}
      res.status(400).json({ error: `不支持的文件格式: ${ext}。支持列表: ${SUPPORTED_FORMATS.join(', ')}` })
      return
    }

    // 1. 调用基于 Microsoft MarkItDown 的多格式转换引擎（包含多级 OCR / 办公文档保底）
    const { execSync } = await import('child_process')
    const possibleScriptPaths = [
      path.resolve(__dirname, 'scripts', 'convert_markitdown.py'),
      path.resolve(__dirname, '..', 'server', 'scripts', 'convert_markitdown.py'),
      path.resolve(process.cwd(), 'server', 'scripts', 'convert_markitdown.py')
    ]
    const scriptPath = possibleScriptPaths.find(p => fs.existsSync(p)) || possibleScriptPaths[0]

    let markdown = ''
    let conversionMethod = 'microsoft_markitdown'

    try {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3'
      const cmd = `"${pythonCmd}" "${scriptPath}" --file "${req.file.path}" --original-name "${originalName.replace(/"/g, '\\"')}" --json`
      const stdout = execSync(cmd, { encoding: 'utf-8', timeout: 120000, maxBuffer: 50 * 1024 * 1024 })
      const parsed = JSON.parse(stdout.trim())
      if (parsed.success && parsed.markdown) {
        markdown = parsed.markdown
        conversionMethod = parsed.method || 'microsoft_markitdown'
      }
    } catch (convErr: any) {
      console.warn('[MarkItDown script execution error]:', convErr.message)
      // 若执行异常，进行就地纯文本保底读取
      try {
        markdown = fs.readFileSync(req.file.path, 'utf-8')
        conversionMethod = 'raw_fallback'
      } catch {
        markdown = `# ${path.basename(originalName, ext)}\n\n> 资料已安全接收并导入系统，格式: ${ext}`
        conversionMethod = 'stub_fallback'
      }
    } finally {
      try { fs.unlinkSync(req.file.path) } catch { /* ok */ }
    }

    if (!markdown || !markdown.trim()) {
      markdown = `# ${path.basename(originalName, ext)}\n\n> 资料导入完成，原文件名: ${originalName}`
    }

    // 2. 调用参考 AgriciDaniel/claude-obsidian 的自组织第二大脑整理引擎
    const organized = await organizeDocumentIntoWiki(markdown, originalName)

    res.json({
      originalName,
      markdownPath: organized.savedPath,
      wordCount: organized.wordCount,
      domain: organized.domain,
      subject: organized.subject,
      tags: organized.tags,
      entities: organized.entities,
      wikilinks: organized.wikilinksCount,
      mocPath: organized.mocPath,
      questionsCount: organized.questionsCount,
      preview: organized.preview,
      method: conversionMethod
    })
  } catch (err: any) {
    console.error('Ingest upload error:', err.message)
    res.status(500).json({ error: err.message || '文档摄取处理失败' })
  }
})
