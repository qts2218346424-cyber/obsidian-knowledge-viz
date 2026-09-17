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

const app = express()
app.disable('x-powered-by')

// CORS configuration
const developmentOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']
const allowedOrigins = new Set([...(config.allowedOrigins || []), ...developmentOrigins])

app.use(cors({
  origin(origin, callback) {
    const isLocalOrigin = Boolean(origin && /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin))
    if (!origin || isLocalOrigin || allowedOrigins.has(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Origin is not allowed'))
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

app.use(express.json({ limit: '50mb' }))
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof Error && err.message === 'Origin is not allowed') {
    res.status(403).json({ error: err.message })
    return
  }
  next(err)
})

// Static frontend for production (Electron or standalone)
const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
}

// ===== Mount Modular Routers =====
app.use('/api', systemRouter)
app.use('/api', localAgentsRouter)
app.use('/api', mediaRouter)
app.use('/api', quizRouter)
app.use('/api', studyRouter)
app.use('/api', workflowRouter)
app.use('/api', vaultRouter)
app.use('/api', aiRouter)
app.use('/api', booksRouter)

// ===== Background Services =====
startWatcher()
initScheduler()

// SPA fallback — serve index.html for client-side routes
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
  const host = config.host || '127.0.0.1'
  return new Promise<void>((resolve) => {
    app.listen(p, host, () => {
      console.log(`\n  Knowledge Viz API running on http://${host}:${p}`)
      console.log(`  Vault path: ${config.vaultPath}`)
      console.log(`  AI: ${anthropic ? 'Connected' : 'Not configured'}`)
      console.log(`  Status: ${fs.existsSync(config.vaultPath) ? 'Connected' : 'Vault not found'}\n`)
      resolve()
    })
  })
}

export { app }

// Standalone mode entry
const isMain = process.argv[1] && (
  process.argv[1].endsWith('index.ts') ||
  process.argv[1].endsWith('index.js') ||
  process.argv[1].endsWith('server.mjs') ||
  process.argv[1].endsWith('server.js')
)
if (isMain) {
  startServer()
}
