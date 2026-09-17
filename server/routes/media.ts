import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { config, loadedConfigPath } from '../context.js'

export const mediaRouter = Router()

const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma'])

mediaRouter.get('/music/scan', (req, res) => {
  const folderPath = (req.query.path as string) || ''
  if (!folderPath) {
    return res.status(400).json({ error: 'Missing path parameter' })
  }

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

mediaRouter.get('/music/stream', (req, res) => {
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

mediaRouter.get('/music/path', (_req, res) => {
  res.json({ musicPath: (config as any).musicPath || '' })
})

mediaRouter.put('/music/path', (req, res) => {
  const { musicPath } = req.body
  if (musicPath !== undefined) {
    ;(config as any).musicPath = musicPath
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
