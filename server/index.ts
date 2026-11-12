import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import {
  config,
  anthropic,
  startWatcher,
  initScheduler,
  __dirname,
} from './context.js'
import { systemRouter } from './routes/system.js'
import { localAgentsRouter } from './routes/local-agents.js'
import { mediaRouter } from './routes/media.js'
import { quizRouter } from './routes/quiz.js'
import { studyRouter } from './routes/study.js'
import { workflowRouter } from './routes/workflow.js'
import { vaultRouter } from './routes/vault.js'
import { aiRouter } from './routes/ai.js'
import { booksRouter } from './routes/books.js'
import { memoryRouter } from './routes/memory.js'
import { flashcardsRouter } from './routes/flashcards.js'
import { authRouter } from './routes/auth.js'
import { authenticate, readOnlyGuard } from './middleware/auth.js'

const app = express()
app.disable('x-powered-by')

// CORS configuration
const developmentOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']
const allowedOrigins = new Set([...(config.allowedOrigins || []), ...developmentOrigins])

app.use(cors({
  origin(origin, callback) {
    const isLocalOrigin = Boolean(
      origin &&
      /^https?:\/\/(?:localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|100\.\d+\.\d+\.\d+|[a-zA-Z0-9-]+\.ts\.net|(?:[a-zA-Z0-9-]+\.)*trycloudflare\.com)(?::\d+)?$/.test(origin)
    )
    if (!origin || isLocalOrigin || allowedOrigins.has(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Origin is not allowed'))
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.use(express.json({ limit: '50mb' }))

// 对所有页面路由注入边缘 CDN 与浏览器无缓存头，杜绝 Cloudflare 及移动端强缓存旧版本（排除 /api/ 接口以保障大文件 Range 分片缓存）
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/') && (!req.path.includes('.') || req.path.endsWith('.html'))) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.setHeader('Surrogate-Control', 'no-store')
    res.setHeader('CDN-Cache-Control', 'no-store')
    res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store')
  }
  next()
})
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof Error && err.message === 'Origin is not allowed') {
    res.status(403).json({ error: err.message })
    return
  }
  next(err)
})

// Static frontend for production (Electron or standalone)
function getDistPath(): string {
  const candidates = [
    path.join(__dirname, '..', 'dist'),
    path.join(__dirname, '..', '..', 'app.asar.unpacked', 'dist'),
    path.join(__dirname, '..', '..', 'app.asar', 'dist'),
    path.join(process.resourcesPath || '', 'app.asar.unpacked', 'dist'),
    path.join(process.resourcesPath || '', 'app.asar', 'dist'),
    path.join(process.cwd(), 'dist'),
  ]
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate
    }
  }
  return path.join(__dirname, '..', 'dist')
}

const distPath = getDistPath()
if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        // index.html 必须协商缓存，确保版本发布后用户第一时间拉取最新入口
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate')
        } else {
          // 带有 content-hash 的 JS/CSS/图片/字体设置 1 年强缓存，二次进入 0 延迟秒开
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        }
      },
    })
  )
}

// ===== Mount Modular Routers =====
app.use('/api', authenticate)
app.use('/api', authRouter)

// 针对学生只读用户，拦截对 Vault 笔记写操作和 Workflow 批量治理
app.use('/api/vault', readOnlyGuard)
app.use('/api/workflow', readOnlyGuard)

app.use('/api', systemRouter)
app.use('/api', localAgentsRouter)
app.use('/api', mediaRouter)
app.use('/api', quizRouter)
app.use('/api', studyRouter)
app.use('/api', workflowRouter)
app.use('/api', vaultRouter)
app.use('/api', aiRouter)
app.use('/api', booksRouter)
app.use('/api', memoryRouter)
app.use('/api', flashcardsRouter)

// ===== Background Services =====
startWatcher()
initScheduler()

// ===== API 404 & Error Handlers (Never leak HTML to API clients) =====
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` })
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]', req.method, req.originalUrl, err)
  if (req.originalUrl?.startsWith('/api') || req.path?.startsWith('/api')) {
    res.status(err.status || err.statusCode || 500).json({
      error: err.message || '内部服务异常',
      code: err.code,
    })
    return
  }
  next(err)
})

// SPA fallback — serve index.html for client-side routes (never for /api)
app.use((req, res) => {
  if (req.originalUrl?.startsWith('/api') || req.path?.startsWith('/api')) {
    res.status(404).json({ error: `API route not found: ${req.path}` })
    return
  }
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.sendFile(indexPath)
  } else {
    res.status(404).send('Frontend not built. Run: npm run build')
  }
})

// Export for Electron or standalone
export function startServer(port?: number) {
  const p = port || config.port || 3001
  const host = config.host || '0.0.0.0'
  return new Promise<void>((resolve) => {
    app.listen(p, host, () => {
      console.log(`\n  Knowledge Viz API running on http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${p} (LAN accessible)`)
      console.log(`  Vault path: ${config.vaultPath}`)

      console.log(`  AI: ${anthropic ? 'Connected' : 'Not configured'}`)
      console.log(`  Status: ${fs.existsSync(config.vaultPath) ? 'Connected' : 'Vault not found'}\n`)
      resolve()
    })
  })
}

export { app }

// Standalone mode entry (supports direct node and PM2)
const isMain = Boolean(
  (process.argv[1] && (
    process.argv[1].endsWith('index.ts') ||
    process.argv[1].endsWith('index.js') ||
    process.argv[1].endsWith('server.mjs') ||
    process.argv[1].endsWith('server.js')
  )) ||
  process.env.pm_id !== undefined ||
  process.env.PM2_HOME
)
if (isMain) {
  startServer()
}
