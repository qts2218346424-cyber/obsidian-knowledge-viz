/**
 * 资料导入后台任务
 *
 * 旧实现在请求里用 execSync 调 Python 转换，最长阻塞 Node 事件循环 120 秒，
 * 期间整个服务（包括其他用户）都无法响应；超时后还会把二进制文件当文本读入。
 * 这里改为 spawn 异步转换 + 内存任务表，前端轮询进度。
 */
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { organizeDocumentIntoWiki, type OrganizedWikiResult } from './wiki-organizer.js'

/** 与前端 IngestResult 对齐的结果结构 */
export interface IngestApiResult {
  originalName: string
  markdownPath: string
  wordCount: number
  domain: string
  subject: string
  tags: string[]
  entities: string[]
  wikilinks: number
  mocPath?: string
  questionsCount: number
  questionReport?: OrganizedWikiResult['questionReport']
  analyzedRatio?: number
  preview: string
  method: string
}

export type IngestJobStatus = 'queued' | 'converting' | 'analyzing' | 'extracting' | 'done' | 'error'

export interface IngestJob {
  id: string
  ownerId: string
  fileName: string
  status: IngestJobStatus
  message: string
  progress: { done: number; total: number }
  createdAt: number
  updatedAt: number
  method?: string
  result?: IngestApiResult
  error?: string
  abort: { aborted: boolean }
}

const jobs = new Map<string, IngestJob>()
const JOB_TTL_MS = 60 * 60 * 1000
const MAX_RUNNING = 2
let running = 0
const queue: Array<() => void> = []

function cleanup() {
  const now = Date.now()
  for (const [id, job] of jobs) {
    if (now - job.updatedAt > JOB_TTL_MS && (job.status === 'done' || job.status === 'error')) jobs.delete(id)
  }
}

function update(job: IngestJob, patch: Partial<IngestJob>) {
  Object.assign(job, patch, { updatedAt: Date.now() })
}

const here = path.dirname(fileURLToPath(import.meta.url))

function findScript(): string {
  const candidates = [
    path.resolve(here, 'scripts', 'convert_markitdown.py'),
    path.resolve(here, '..', 'scripts', 'convert_markitdown.py'),
    path.resolve(here, '..', 'server', 'scripts', 'convert_markitdown.py'),
    path.resolve(here, '..', '..', 'server', 'scripts', 'convert_markitdown.py'),
    path.resolve(process.cwd(), 'server', 'scripts', 'convert_markitdown.py'),
  ]
  return candidates.find(p => fs.existsSync(p)) || candidates[candidates.length - 1]
}

/** 异步调用 Python 转换脚本；大文件给更长的超时 */
export function convertDocument(
  filePath: string,
  originalName: string,
  sizeBytes: number,
  onLine?: (line: string) => void
): Promise<{ markdown: string; method: string }> {
  const python = process.platform === 'win32' ? 'python' : 'python3'
  const timeoutMs = Math.min(15 * 60_000, 120_000 + Math.ceil(sizeBytes / (1024 * 1024)) * 20_000)
  return new Promise(resolve => {
    const child = spawn(python, [findScript(), '--file', filePath, '--original-name', originalName, '--json'], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    })
    const out: Buffer[] = []
    let errBuf = ''
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs)
    child.stdout.on('data', d => out.push(d))
    child.stderr.on('data', d => {
      errBuf += d.toString()
      const lines = errBuf.split('\n')
      errBuf = lines.pop() || ''
      for (const l of lines) {
        // 脚本用 [progress] 前缀上报页数进度
        if (l.startsWith('[progress]')) onLine?.(l.slice(10).trim())
      }
    })
    const fallback = (reason: string) => {
      const ext = path.extname(originalName).toLowerCase()
      const textLike = ['.txt', '.md', '.markdown', '.csv', '.json', '.html', '.htm', '.xml'].includes(ext)
      let markdown = ''
      if (textLike) {
        try {
          markdown = fs.readFileSync(filePath, 'utf-8')
        } catch {
          markdown = ''
        }
      }
      console.warn('[ingest] conversion fallback:', reason)
      resolve({ markdown, method: textLike ? 'raw_text_fallback' : 'conversion_failed' })
    }
    child.on('error', err => {
      clearTimeout(timer)
      fallback(err.message)
    })
    child.on('close', code => {
      clearTimeout(timer)
      try {
        const parsed = JSON.parse(Buffer.concat(out).toString('utf-8').trim())
        if (parsed.success && parsed.markdown) {
          resolve({ markdown: parsed.markdown, method: parsed.method || 'microsoft_markitdown' })
          return
        }
        fallback(parsed.error || `exit ${code}`)
      } catch {
        fallback(`exit ${code}`)
      }
    })
  })
}

export function createIngestJob(params: {
  ownerId: string
  filePath: string
  originalName: string
  sizeBytes: number
  vaultPath: string
}): IngestJob {
  cleanup()
  const job: IngestJob = {
    id: `ing_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    ownerId: params.ownerId,
    fileName: params.originalName,
    status: 'queued',
    message: '排队中',
    progress: { done: 0, total: 0 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    abort: { aborted: false },
  }
  jobs.set(job.id, job)

  const run = async () => {
    running++
    try {
      update(job, { status: 'converting', message: '正在转换文档' })
      const { markdown, method } = await convertDocument(params.filePath, params.originalName, params.sizeBytes, line =>
        update(job, { message: `正在转换文档 · ${line}` })
      )
      try {
        fs.unlinkSync(params.filePath)
      } catch {
        /* ok */
      }
      if (!markdown.trim()) {
        update(job, { status: 'error', message: '未能从文件中读出文字', error: '文档转换失败或没有可识别的文字，扫描件请确认服务器已安装 OCR 依赖' })
        return
      }
      update(job, { method })

      const result = await organizeDocumentIntoWiki(markdown, params.originalName, {
        vaultPath: params.vaultPath,
        signal: job.abort,
        onProgress: p =>
          update(job, {
            status: p.stage.startsWith('questions') ? 'extracting' : 'analyzing',
            message: p.message,
            progress: { done: p.done, total: p.total },
          }),
      })
      update(job, {
        status: 'done',
        message: result.questionReport
          ? `完成，提取 ${result.questionReport.saved} 道题`
          : '完成',
        result: {
          originalName: params.originalName,
          markdownPath: result.savedPath,
          wordCount: result.wordCount,
          domain: result.domain,
          subject: result.subject,
          tags: result.tags,
          entities: result.entities,
          wikilinks: result.wikilinksCount,
          mocPath: result.mocPath,
          questionsCount: result.questionsCount,
          questionReport: result.questionReport,
          analyzedRatio: result.analyzedRatio,
          preview: result.preview,
          method,
        },
      })
    } catch (err: any) {
      update(job, { status: 'error', message: '导入失败', error: err?.message || '导入失败' })
    } finally {
      running--
      queue.shift()?.()
    }
  }

  if (running < MAX_RUNNING) void run()
  else queue.push(() => void run())
  return job
}

export function getIngestJob(id: string): IngestJob | undefined {
  return jobs.get(id)
}

export function publicJob(job: IngestJob) {
  const { abort: _abort, ownerId: _owner, ...rest } = job
  return rest
}

export function waitForJob(job: IngestJob): Promise<IngestJob> {
  return new Promise(resolve => {
    const tick = () => {
      if (job.status === 'done' || job.status === 'error') resolve(job)
      else setTimeout(tick, 500)
    }
    tick()
  })
}
