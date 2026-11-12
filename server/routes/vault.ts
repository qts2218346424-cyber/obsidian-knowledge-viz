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
  runtimeDataDir,
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
import { createIngestJob, getIngestJob, publicJob, waitForJob } from '../services/ingest-jobs.js'
import { getRequestVaultPath, resolveSafeUserVaultPath, virtualizeVaultPath, createSandboxExportZip } from '../services/user-sandbox.js'
import { getUserNotes } from '../context.js'

export const vaultRouter = Router()

// ===== Vault Stats & Health =====

vaultRouter.get('/vault/stats', (req, res) => {
  try {
    const vaultPath = getRequestVaultPath(req)
    const notes = getUserNotes(req.user?.id, vaultPath)
    const health = checkHealth(notes, vaultPath)
    const clientVaultPath = virtualizeVaultPath(vaultPath, req.user?.role)
    res.json({ vaultPath: clientVaultPath, connected: notes.length > 0, ...health.stats })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== 一键打包导出用户个人沙箱笔记为 ZIP 压缩包 (可直接导入本地 Obsidian) =====
vaultRouter.get('/vault/export-zip', async (req, res) => {
  try {
    const userOrId = req.user || 'guest'
    const zipPath = await createSandboxExportZip(userOrId)
    const safeUsername = (req.user?.username || 'Guest').replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_')
    const filename = `CoreForge_Notes_${safeUsername}_${new Date().toISOString().split('T')[0]}.zip`
    res.download(zipPath, filename, (err) => {
      try { fs.unlinkSync(zipPath) } catch {}
      if (err && !res.headersSent) {
        res.status(500).json({ error: '导出压缩包传输中断' })
      }
    })
  } catch (err: any) {
    console.error('Export sandbox zip error:', err)
    res.status(500).json({ error: err.message || '导出沙盒笔记失败' })
  }
})

vaultRouter.get('/vault/graph', (req, res) => {
  try {
    const vaultPath = getRequestVaultPath(req)
    const notes = getUserNotes(req.user?.id, vaultPath)
    res.json(buildGraph(notes))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

vaultRouter.get('/vault/health', (req, res) => {
  try {
    const vaultPath = getRequestVaultPath(req)
    const notes = getUserNotes(req.user?.id, vaultPath)
    res.json(checkHealth(notes, vaultPath))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Vault Search & Files =====

vaultRouter.get('/vault/files', (req, res) => {
  try {
    const vaultPath = getRequestVaultPath(req)
    const notes = getUserNotes(req.user?.id, vaultPath)
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
    const vaultPath = getRequestVaultPath(req)
    if (req.user?.id) {
      resolveSafeUserVaultPath(req.user, filePath)
    }
    const note = getFile(vaultPath, filePath)
    if (!note) {
      res.status(404).json({ error: 'File not found' })
      return
    }
    res.json(note)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

vaultRouter.get('/vault/tree', (req, res) => {
  try {
    const vaultPath = getRequestVaultPath(req)
    res.json(getTree(vaultPath))
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
    const vaultPath = getRequestVaultPath(req)
    if (req.user?.id) {
      resolveSafeUserVaultPath(req.user, filePath)
    }
    const note = createFile(vaultPath, filePath, content, frontmatter)
    markSelfWrite(filePath)
    invalidateCache(req.user?.id)
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
    const vaultPath = getRequestVaultPath(req)
    if (req.user?.id) {
      resolveSafeUserVaultPath(req.user, filePath)
    }
    const targetFullPath = path.resolve(vaultPath, filePath)
    let note
    if (fs.existsSync(targetFullPath)) {
      note = updateFile(vaultPath, filePath, content, frontmatter)
    } else {
      note = createFile(vaultPath, filePath, content, frontmatter)
    }
    markSelfWrite(filePath)
    invalidateCache(req.user?.id)
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
    const vaultPath = getRequestVaultPath(req)
    if (req.user?.id) {
      resolveSafeUserVaultPath(req.user, filePath)
    }
    const result = await deleteFile(vaultPath, filePath)
    invalidateCache(req.user?.id)
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
    const vaultPath = getRequestVaultPath(req)
    if (req.user?.id) {
      resolveSafeUserVaultPath(req.user, oldPath)
      resolveSafeUserVaultPath(req.user, newPath)
    }
    const result = renameFile(vaultPath, oldPath, newPath)
    invalidateCache(req.user?.id)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ===== Vault Attachments (Images, Handwriting & Media) =====

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.pdf': 'application/pdf',
}

vaultRouter.get('/vault/attachment', (req, res) => {
  try {
    const rawPath = String(req.query.path || req.query.name || '')
    if (!rawPath) {
      res.status(400).json({ error: 'Missing path or name' })
      return
    }

    const basePath = config.vaultPath && fs.existsSync(config.vaultPath)
      ? config.vaultPath
      : path.join(runtimeDataDir, 'attachments')

    let fullPath = path.resolve(basePath, rawPath)
    if (!fs.existsSync(fullPath)) {
      const altPath = path.resolve(basePath, 'attachments', rawPath)
      if (fs.existsSync(altPath)) {
        fullPath = altPath
      }
    }

    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      res.status(404).json({ error: 'Attachment not found' })
      return
    }

    const ext = path.extname(fullPath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    const stream = fs.createReadStream(fullPath)
    stream.pipe(res)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

vaultRouter.post('/vault/attachment', upload.single('file'), (req, res) => {
  try {
    const vaultDir = config.vaultPath && fs.existsSync(config.vaultPath)
      ? config.vaultPath
      : path.join(runtimeDataDir)
    const attachmentsDir = path.join(vaultDir, 'attachments')
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir, { recursive: true })
    }

    const now = new Date()
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
    const randomSuffix = Math.random().toString(36).substring(2, 6)

    // A: JSON base64
    if (req.body && req.body.base64) {
      const { base64, prefix = 'drawing', filename: customName } = req.body
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
      let ext = '.png'
      let buffer: Buffer

      if (matches && matches.length === 3) {
        const mime = matches[1]
        if (mime === 'image/jpeg') ext = '.jpg'
        else if (mime === 'image/webp') ext = '.webp'
        else if (mime === 'image/svg+xml') ext = '.svg'
        buffer = Buffer.from(matches[2], 'base64')
      } else {
        buffer = Buffer.from(base64, 'base64')
      }

      const filename = customName || `${prefix}-${timestamp}-${randomSuffix}${ext}`
      const targetPath = path.join(attachmentsDir, filename)
      fs.writeFileSync(targetPath, buffer)

      const relativePath = `attachments/${filename}`
      const url = `/api/vault/attachment?path=${encodeURIComponent(relativePath)}`
      res.json({
        success: true,
        filename,
        relativePath,
        url,
        markdown: `![[${filename}]]`,
        standardMarkdown: `![${prefix}](/api/vault/attachment?path=${encodeURIComponent(relativePath)})`,
      })
      return
    }

    // B: File upload
    if (req.file) {
      const originalExt = path.extname(req.file.originalname).toLowerCase() || '.png'
      const prefix = req.body?.prefix || 'paste'
      const customName = req.body?.filename
      const filename = customName || `${prefix}-${timestamp}-${randomSuffix}${originalExt}`
      const targetPath = path.join(attachmentsDir, filename)

      fs.copyFileSync(req.file.path, targetPath)
      try { fs.unlinkSync(req.file.path) } catch { /* ignore */ }

      const relativePath = `attachments/${filename}`
      const url = `/api/vault/attachment?path=${encodeURIComponent(relativePath)}`
      res.json({
        success: true,
        filename,
        relativePath,
        url,
        markdown: `![[${filename}]]`,
        standardMarkdown: `![${prefix}](/api/vault/attachment?path=${encodeURIComponent(relativePath)})`,
      })
      return
    }

    res.status(400).json({ error: 'No file or base64 data provided' })
  } catch (err: any) {
    console.error('Attachment upload error:', err)
    res.status(500).json({ error: err.message || '上传附件失败' })
  }
})

// ===== Handwriting Strokes Persistence (随页手写矢量图层) =====

function getStrokesFilePath(notePath: string): string {
  const vaultDir = config.vaultPath && fs.existsSync(config.vaultPath)
    ? config.vaultPath
    : runtimeDataDir
  const strokesDir = path.join(vaultDir, '.strokes')
  if (!fs.existsSync(strokesDir)) {
    fs.mkdirSync(strokesDir, { recursive: true })
  }
  const safeName = Buffer.from(notePath).toString('base64url') + '.json'
  return path.join(strokesDir, safeName)
}

vaultRouter.get('/vault/strokes', (req, res) => {
  try {
    const notePath = String(req.query.path || '')
    if (!notePath) {
      res.json({ strokes: [] })
      return
    }
    const fp = getStrokesFilePath(notePath)
    if (fs.existsSync(fp)) {
      const data = fs.readFileSync(fp, 'utf-8')
      const parsed = JSON.parse(data)
      res.json({ strokes: Array.isArray(parsed) ? parsed : (parsed.strokes || []) })
      return
    }
    res.json({ strokes: [] })
  } catch (err: any) {
    res.json({ strokes: [], error: err.message })
  }
})

vaultRouter.post('/vault/strokes', (req, res) => {
  try {
    const { path: notePath, strokes } = req.body as { path: string; strokes: any[] }
    if (!notePath) {
      res.status(400).json({ error: 'Missing note path' })
      return
    }
    const fp = getStrokesFilePath(notePath)
    fs.writeFileSync(fp, JSON.stringify({ path: notePath, updatedAt: new Date().toISOString(), strokes: strokes || [] }, null, 2), 'utf-8')
    res.json({ success: true, count: (strokes || []).length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

vaultRouter.post('/vault/refresh', (_req, res) => {
  invalidateCache()
  startWatcher()
  const notes = getNotes()
  res.json({ ok: true, noteCount: notes.length })
})

vaultRouter.post('/vault/open-folder', (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'
    if (!isAdmin) {
      res.status(403).json({ error: '权限不足：仅管理员可在本地主机打开文件夹' })
      return
    }

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
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  sseClients.add(res)
  res.write(': keepalive\n\n')

  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n')
    } catch {
      clearInterval(heartbeat)
    }
  }, 15000)

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

    // 写入当前用户自己的知识库（旧实现写入全局库，普通用户看不到自己导入的内容）
    const vaultPath = getRequestVaultPath(req)
    const job = createIngestJob({
      ownerId: req.user?.id ? String(req.user.id) : 'guest',
      filePath: req.file.path,
      originalName,
      sizeBytes: req.file.size,
      vaultPath,
    })

    // ?async=1：立即返回任务 id，前端轮询 /ingest/jobs/:id 显示进度
    if (req.query.async === '1') {
      res.status(202).json({ jobId: job.id, status: job.status })
      return
    }

    // 兼容旧调用方：等待完成后返回结果（转换已改为异步，不再阻塞事件循环）
    const finished = await waitForJob(job)
    if (finished.status === 'error' || !finished.result) {
      res.status(500).json({ error: finished.error || '文档摄取处理失败' })
      return
    }
    res.json(finished.result)
  } catch (err: any) {
    console.error('Ingest upload error:', err.message)
    res.status(500).json({ error: err.message || '文档摄取处理失败' })
  }
})

vaultRouter.get('/ingest/jobs/:id', (req, res) => {
  const job = getIngestJob(req.params.id)
  const owner = req.user?.id ? String(req.user.id) : 'guest'
  if (!job || job.ownerId !== owner) {
    res.status(404).json({ error: '导入任务不存在或已过期' })
    return
  }
  res.json(publicJob(job))
})
