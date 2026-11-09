import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { config, loadedConfigPath, runtimeDataDir } from '../context.js'

export const mediaRouter = Router()

const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma'])

// 获取当前生效的音乐目录（若未配置或不存在，默认自动定位至 uploads/music 并自动创建）
export function getEffectiveMusicDir(): string {
  const customPath = (config as any).musicPath
  if (customPath && typeof customPath === 'string' && customPath.trim()) {
    try {
      if (!fs.existsSync(customPath)) {
        fs.mkdirSync(customPath, { recursive: true })
      }
      return path.resolve(customPath)
    } catch {
      // 容错降级
    }
  }

  // 默认云端音乐存储目录：位于 runtimeDataDir/uploads/music
  const defaultDir = path.resolve(runtimeDataDir, 'uploads', 'music')
  if (!fs.existsSync(defaultDir)) {
    try {
      fs.mkdirSync(defaultDir, { recursive: true })
    } catch (err) {
      console.error('[Music] 创建默认音乐存储目录失败:', err)
    }
  }
  return defaultDir
}

// 扫描指定目录下的音频文件
function scanAudioDir(targetDir: string) {
  const files: { name: string; path: string; size: number; ext: string; updatedAt: number }[] = []
  if (!fs.existsSync(targetDir)) return files

  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        scan(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (AUDIO_EXTS.has(ext)) {
          const stat = fs.statSync(fullPath)
          files.push({
            name: path.basename(entry.name, ext),
            path: fullPath,
            size: stat.size,
            ext: ext.slice(1),
            updatedAt: stat.mtimeMs,
          })
        }
      }
    }
  }

  scan(targetDir)
  // 按最近修改时间倒序排列，最新上传的排在最上方
  files.sort((a, b) => b.updatedAt - a.updatedAt)
  return files
}

// 配置 Multer 用于音乐上传
const musicStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = getEffectiveMusicDir()
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    let originalName = file.originalname
    try {
      // 解决不同客户端字符集编码（避免中文文件名乱码）
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    } catch {
      originalName = file.originalname
    }

    const cleanName = path.basename(originalName).replace(/[\\/:*?"<>|]/g, '_')
    const ext = path.extname(cleanName).toLowerCase()
    const nameWithoutExt = path.basename(cleanName, ext) || 'music'

    const dir = getEffectiveMusicDir()
    let finalPath = path.join(dir, `${nameWithoutExt}${ext}`)
    let counter = 1

    // 同名文件自动增加序号，避免覆盖
    while (fs.existsSync(finalPath)) {
      finalPath = path.join(dir, `${nameWithoutExt}_${counter}${ext}`)
      counter++
    }

    cb(null, path.basename(finalPath))
  },
})

const musicUpload = multer({
  storage: musicStorage,
  limits: { fileSize: 300 * 1024 * 1024 }, // 支持单文件最大 300MB（针对无损 FLAC、长音频）
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (AUDIO_EXTS.has(ext)) {
      cb(null, true)
    } else {
      cb(new Error(`不支持的文件格式 ${ext}，仅支持音频文件 (MP3, WAV, OGG, FLAC, M4A, AAC, WMA)`))
    }
  },
})

// 1. 扫描音乐接口：如果不传 path，自动使用并扫描云端生效音乐目录
mediaRouter.get('/music/scan', (req, res) => {
  const reqPath = (req.query.path as string) || ''
  const folderPath = reqPath.trim() ? reqPath.trim() : getEffectiveMusicDir()

  if (!fs.existsSync(folderPath)) {
    try {
      fs.mkdirSync(folderPath, { recursive: true })
    } catch {
      return res.status(404).json({ error: '目录不存在且无法自动创建' })
    }
  }

  try {
    const files = scanAudioDir(folderPath)
    res.json({
      path: folderPath,
      effectivePath: getEffectiveMusicDir(),
      isDefault: folderPath === getEffectiveMusicDir(),
      files,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// 2. 上传音乐接口：支持单文件或多文件上传
mediaRouter.post('/music/upload', (req, res) => {
  musicUpload.array('files', 50)(req, res, (err: any) => {
    if (err) {
      console.error('[Music Upload Error]:', err)
      return res.status(400).json({ error: err.message || '音乐上传失败' })
    }

    const uploadedFiles = (req.files as Express.Multer.File[]) || []
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ error: '未接收到有效音频文件' })
    }

    // 重新扫描并返回最新曲库
    const effectiveDir = getEffectiveMusicDir()
    const allFiles = scanAudioDir(effectiveDir)

    res.json({
      ok: true,
      uploadedCount: uploadedFiles.length,
      path: effectiveDir,
      files: allFiles,
      message: `成功上传 ${uploadedFiles.length} 首音乐`,
    })
  })
})

// 3. 删除音乐文件接口
mediaRouter.post('/music/delete', (req, res) => {
  const filePath = req.body?.path as string
  if (!filePath) {
    return res.status(400).json({ error: '缺少文件路径' })
  }

  const effectiveDir = getEffectiveMusicDir()
  const resolved = path.resolve(filePath)

  // 安全检查：防止跨目录任意删除，只允许删除生效音乐目录或配置音乐目录中的音频文件
  const isInsideEffective = resolved.startsWith(effectiveDir)
  const isAudio = AUDIO_EXTS.has(path.extname(resolved).toLowerCase())

  if (!isInsideEffective && !(config as any).musicPath) {
    return res.status(403).json({ error: '无权删除该路径文件' })
  }

  if (!isAudio) {
    return res.status(400).json({ error: '目标不是有效的音频文件' })
  }

  if (!fs.existsSync(resolved)) {
    return res.status(404).json({ error: '文件不存在' })
  }

  try {
    fs.unlinkSync(resolved)
    const allFiles = scanAudioDir(path.dirname(resolved))
    res.json({ ok: true, files: allFiles })
  } catch (err: any) {
    res.status(500).json({ error: `删除失败: ${err.message}` })
  }
})

// 4. 音频流媒体播放接口（支持 Range 断点续传和精确拖动进度条）
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

// 5. 获取音乐库路径接口
mediaRouter.get('/music/path', (_req, res) => {
  const custom = (config as any).musicPath || ''
  const effective = getEffectiveMusicDir()
  res.json({
    musicPath: custom,
    effectivePath: effective,
    isDefault: !custom || custom === effective,
  })
})

// 6. 设置音乐库路径接口
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
  res.json({ ok: true, musicPath, effectivePath: getEffectiveMusicDir() })
})
