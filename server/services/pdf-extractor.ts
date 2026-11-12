import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export type ResourceDomain = 'cs_408' | 'math' | 'english' | 'politics' | 'general'

export interface ExtractedPdfPage {
  pageNum: number
  text: string
}

export interface PdfInspectResult {
  success: boolean
  fileSizeBytes: number
  totalPages: number
  outlineTitles: string[]
  isScannedImageOnly: boolean
  avgCharsPerPage: number
  sampleTextLength: number
  error?: string
}

export interface MaterialExtractionResult {
  success: boolean
  isPdf: boolean
  totalPages: number
  extractedStartPage: number
  extractedEndPage: number
  pages: ExtractedPdfPage[]
  fullText: string
  outlineText: string
  outlineTitles: string[]
  isScannedImageOnly: boolean
  avgCharsPerPage: number
  method: string
  domain?: ResourceDomain
  subject?: string
  inferredTitle?: string
  error?: string
}

export interface TextScanChunk {
  chunkIndex: number
  startPage: number
  endPage: number
  text: string
}

let cachedPDFParseClass: any = null

async function getPDFParseClass(): Promise<any> {
  if (cachedPDFParseClass) return cachedPDFParseClass
  const mod: any = await import('pdf-parse')
  const Cls = mod.PDFParse || mod.default?.PDFParse || mod.default
  if (typeof Cls !== 'function') {
    throw new Error('pdf-parse 模块未导出可用的 PDFParse 解析器')
  }
  cachedPDFParseClass = Cls
  return Cls
}

function cleanPageLines(rawText: string): string {
  if (!rawText) return ''
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .split('\n')
    .map(l => l.trimEnd())
  const filtered: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // 过滤纯水印、页脚与广告干扰行，保留页码、题号和短选项如 "A." 或 "1"
    if (
      (/^(公众号|QQ群|微信群|扫码关注|淘宝店铺|免费分享|仅供个人学习)/i.test(trimmed) && trimmed.length < 45) ||
      /^·?\s*第\s*\d+\s*页[，,\s]*共\s*\d+\s*页\s*·?$/.test(trimmed) ||
      (/^b\s*站[：:]/i.test(trimmed) && /公[众粽]号/.test(trimmed))
    ) {
      continue
    }
    filtered.push(trimmed)
  }
  return filtered.join('\n')
}

function flattenOutlineTitles(outline: any, depth = 0, out: string[] = []): string[] {
  if (!Array.isArray(outline) || out.length >= 250) return out
  for (const item of outline) {
    if (!item) continue
    if (Array.isArray(item)) {
      flattenOutlineTitles(item, depth + 1, out)
      continue
    }
    const title = typeof item.title === 'string' ? item.title.trim() : ''
    if (title && title.length >= 2) {
      const prefix = depth === 0 ? '## ' : depth === 1 ? '### ' : '- '
      out.push(`${prefix}${title}`)
    }
    if (Array.isArray(item.items) && item.items.length > 0) {
      flattenOutlineTitles(item.items, depth + 1, out)
    }
  }
  return out
}

async function tryPythonPdfFallback(
  fullPath: string,
  scriptName: string,
  args: string[]
): Promise<any | null> {
  const candidates = [
    path.resolve(process.cwd(), 'server', 'scripts', scriptName),
    path.resolve(process.cwd(), 'scripts', scriptName)
  ]
  const scriptPath = candidates.find(p => fs.existsSync(p))
  if (!scriptPath) return null

  const bins = process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python']
  for (const bin of bins) {
    try {
      const { stdout } = await execFileAsync(bin, [scriptPath, fullPath, ...args], {
        timeout: 45000,
        maxBuffer: 20 * 1024 * 1024
      })
      const parsed = JSON.parse(stdout)
      if (parsed) return parsed
    } catch {
      // try next python binary
    }
  }
  return null
}

/**
 * 快速探测 PDF 页数、书签及是否为纯图片扫描版（低内存采样前 6 页）
 */
export async function inspectPdfFile(fullPath: string): Promise<PdfInspectResult> {
  if (!fs.existsSync(fullPath)) {
    return {
      success: false,
      fileSizeBytes: 0,
      totalPages: 0,
      outlineTitles: [],
      isScannedImageOnly: false,
      avgCharsPerPage: 0,
      sampleTextLength: 0,
      error: '文件不存在'
    }
  }

  const stat = fs.statSync(fullPath)
  let parser: any = null
  try {
    const PDFParse = await getPDFParseClass()
    const dataBuffer = fs.readFileSync(fullPath)
    const zeroCopyView = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength)
    parser = new PDFParse({ data: zeroCopyView })
    const info = await parser.getInfo().catch(() => null)
    const totalPages = Number(info?.total || 0)
    const outlineTitles = flattenOutlineTitles(info?.outline || [])

    // 采样若干分散页面检测是否存在可提取文字层（避免封面是纯图片造成误判）
    const samplePageNums: number[] = []
    if (totalPages > 0) {
      const candidates = [1, 2, 3, Math.min(5, totalPages), Math.min(10, totalPages), Math.ceil(totalPages / 2)]
      for (const p of candidates) {
        if (p >= 1 && p <= totalPages && !samplePageNums.includes(p)) {
          samplePageNums.push(p)
        }
      }
    }

    let sampleTextLength = 0
    if (samplePageNums.length > 0) {
      const sampleRes = await parser.getText({ partial: samplePageNums, pageJoiner: '' })
      for (const pg of sampleRes?.pages || []) {
        const cleaned = cleanPageLines(pg?.text || '').replace(/\s+/g, '')
        sampleTextLength += cleaned.length
      }
    }

    const avgCharsPerPage = samplePageNums.length > 0 ? Math.round(sampleTextLength / samplePageNums.length) : 0
    const isScannedImageOnly = totalPages > 0 && avgCharsPerPage < 20

    return {
      success: true,
      fileSizeBytes: stat.size,
      totalPages,
      outlineTitles,
      isScannedImageOnly,
      avgCharsPerPage,
      sampleTextLength
    }
  } catch (err: any) {
    return {
      success: false,
      fileSizeBytes: stat.size,
      totalPages: 0,
      outlineTitles: [],
      isScannedImageOnly: false,
      avgCharsPerPage: 0,
      sampleTextLength: 0,
      error: err?.message || 'PDF 探测失败'
    }
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy().catch(() => {})
    }
  }
}

/**
 * 完整提取 PDF / 文本资料的全部或指定页码内容（批处理提取并及时释放内存）
 */
export async function extractFullMaterialContent(
  fullPath: string,
  options?: {
    startPage?: number
    endPage?: number
    maxPagesDefault?: number
  }
): Promise<MaterialExtractionResult> {
  const ext = path.extname(fullPath).toLowerCase()
  if (!fs.existsSync(fullPath)) {
    return {
      success: false,
      isPdf: ext === '.pdf',
      totalPages: 0,
      extractedStartPage: 0,
      extractedEndPage: 0,
      pages: [],
      fullText: '',
      outlineText: '',
      outlineTitles: [],
      isScannedImageOnly: false,
      avgCharsPerPage: 0,
      method: 'none',
      error: '指定文件不存在'
    }
  }

  if (ext !== '.pdf') {
    const stat = fs.statSync(fullPath)
    if (stat.size > 15 * 1024 * 1024) {
      return {
        success: false,
        isPdf: false,
        totalPages: 1,
        extractedStartPage: 1,
        extractedEndPage: 1,
        pages: [],
        fullText: '',
        outlineText: '',
        outlineTitles: [],
        isScannedImageOnly: false,
        avgCharsPerPage: 0,
        method: 'too_large',
        error: '文本文件超过 15MB，建议拆分后导入'
      }
    }

    let raw = fs.readFileSync(fullPath, 'utf8')
    if (ext === '.html' || ext === '.htm') {
      raw = raw
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    }
    const clean = raw.trim()
    return {
      success: true,
      isPdf: false,
      totalPages: 1,
      extractedStartPage: 1,
      extractedEndPage: 1,
      pages: [{ pageNum: 1, text: clean }],
      fullText: clean,
      outlineText: '',
      outlineTitles: [],
      isScannedImageOnly: false,
      avgCharsPerPage: clean.length,
      method: 'text_direct'
    }
  }

  let parser: any = null
  try {
    const PDFParse = await getPDFParseClass()
    const dataBuffer = fs.readFileSync(fullPath)
    const zeroCopyView = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength)
    parser = new PDFParse({ data: zeroCopyView })
    const info = await parser.getInfo().catch(() => null)
    const totalPages = Math.max(Number(info?.total || 0), 1)
    const outlineTitles = flattenOutlineTitles(info?.outline || [])
    const outlineText = outlineTitles.join('\n')

    const hasExplicitRange = Boolean(options?.startPage && options?.endPage && options.endPage >= options.startPage)
    const maxPagesAllowed = hasExplicitRange
      ? Math.max(options?.maxPagesDefault ?? 120, 240)
      : (options?.maxPagesDefault ?? 120)
    const reqStart = options?.startPage && options.startPage >= 1 ? Math.min(options.startPage, totalPages) : 1
    let reqEnd =
      options?.endPage && options.endPage >= reqStart
        ? Math.min(options.endPage, totalPages)
        : Math.min(totalPages, reqStart + maxPagesAllowed - 1)
    if (reqEnd - reqStart + 1 > maxPagesAllowed) {
      reqEnd = reqStart + maxPagesAllowed - 1
    }

    const pages: ExtractedPdfPage[] = []
    const batchSize = 20
    let totalEffectiveChars = 0

    for (let pStart = reqStart; pStart <= reqEnd; pStart += batchSize) {
      const pEnd = Math.min(reqEnd, pStart + batchSize - 1)
      const txtRes = await parser.getText({
        first: pStart,
        last: pEnd,
        lineEnforce: true,
        pageJoiner: ''
      })
      for (const pg of txtRes?.pages || []) {
        const cleaned = cleanPageLines(pg?.text || '')
        const effectiveLen = cleaned.replace(/\s+/g, '').length
        totalEffectiveChars += effectiveLen
        pages.push({
          pageNum: Number(pg?.num || pStart),
          text: cleaned
        })
      }
    }

    const avgCharsPerPage = pages.length > 0 ? Math.round(totalEffectiveChars / pages.length) : 0
    const isScannedImageOnly = pages.length > 0 && avgCharsPerPage < 20 && totalEffectiveChars < 300

    const fullText = pages
      .filter(p => p.text.trim().length > 0)
      .map(p => `【第 ${p.pageNum} 页】\n${p.text}`)
      .join('\n\n')

    return {
      success: true,
      isPdf: true,
      totalPages,
      extractedStartPage: reqStart,
      extractedEndPage: reqEnd,
      pages,
      fullText,
      outlineText,
      outlineTitles,
      isScannedImageOnly,
      avgCharsPerPage,
      method: 'pdf_parse_v2_full'
    }
  } catch (err: any) {
    // 尝试 Python 备用提取
    const pyRes = await tryPythonPdfFallback(fullPath, 'extract_pdf_summary.py', [])
    if (pyRes?.success && pyRes?.content) {
      return {
        success: true,
        isPdf: true,
        totalPages: Number(pyRes.pages || 1),
        extractedStartPage: 1,
        extractedEndPage: Number(pyRes.pages || 1),
        pages: [{ pageNum: 1, text: String(pyRes.content) }],
        fullText: String(pyRes.content),
        outlineText: '',
        outlineTitles: [],
        isScannedImageOnly: Boolean(pyRes.isScan),
        avgCharsPerPage: String(pyRes.content).length,
        method: pyRes.method || 'python_fallback',
        domain: pyRes.domain,
        subject: pyRes.subject,
        inferredTitle: pyRes.inferredTitle
      }
    }
    return {
      success: false,
      isPdf: true,
      totalPages: 0,
      extractedStartPage: 0,
      extractedEndPage: 0,
      pages: [],
      fullText: '',
      outlineText: '',
      outlineTitles: [],
      isScannedImageOnly: false,
      avgCharsPerPage: 0,
      method: 'failed',
      error: err?.message || 'PDF 文本解析失败'
    }
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy().catch(() => {})
    }
  }
}

/**
 * 将提取的逐页正文切分为连续、保留上下文重叠的 AI 扫描分片（Chunk）
 */
export function buildTextChunksForScan(
  pages: ExtractedPdfPage[],
  maxCharsPerChunk = 4200,
  maxChunks = 24,
  maxPagesPerChunk = 10
): TextScanChunk[] {
  const nonEmptyPages = pages.filter(p => p.text && p.text.trim().length > 0)
  if (nonEmptyPages.length === 0) return []

  const chunks: TextScanChunk[] = []
  let bufPages: ExtractedPdfPage[] = []
  let bufLen = 0

  const flushBuffer = (tailOverlapText = '') => {
    if (bufPages.length === 0) return
    const body = bufPages.map(p => `--- 第 ${p.pageNum} 页 ---\n${p.text}`).join('\n\n')
    const combined = tailOverlapText
      ? `[上片衔接上下文（供跨页题干参考，勿重复提取已完整题目）]\n${tailOverlapText}\n\n[本片待提取正文]\n${body}`
      : body

    chunks.push({
      chunkIndex: chunks.length,
      startPage: bufPages[0].pageNum,
      endPage: bufPages[bufPages.length - 1].pageNum,
      text: combined
    })
  }

  let prevTail = ''
  for (const pg of nonEmptyPages) {
    // 单个超级密页超过阈值时，按段落继续细切
    if (pg.text.length > maxCharsPerChunk) {
      if (bufPages.length > 0) {
        const rawBody = bufPages.map(p => p.text).join('\n')
        flushBuffer(prevTail)
        prevTail = rawBody.slice(-350)
        bufPages = []
        bufLen = 0
        if (chunks.length >= maxChunks) break
      }

      const lines = pg.text.split('\n')
      let subBuf: string[] = []
      let subLen = 0
      for (const line of lines) {
        if (subLen + line.length + 1 > maxCharsPerChunk && subBuf.length > 0) {
          const piece = subBuf.join('\n')
          chunks.push({
            chunkIndex: chunks.length,
            startPage: pg.pageNum,
            endPage: pg.pageNum,
            text: prevTail
              ? `[上片衔接上下文（供跨页题干参考，勿重复提取）]\n${prevTail}\n\n[第 ${pg.pageNum} 页分段]\n${piece}`
              : `--- 第 ${pg.pageNum} 页 ---\n${piece}`
          })
          prevTail = piece.slice(-350)
          subBuf = []
          subLen = 0
          if (chunks.length >= maxChunks) break
        }
        subBuf.push(line)
        subLen += line.length + 1
      }
      if (chunks.length < maxChunks && subBuf.length > 0) {
        const piece = subBuf.join('\n')
        chunks.push({
          chunkIndex: chunks.length,
          startPage: pg.pageNum,
          endPage: pg.pageNum,
          text: prevTail
            ? `[上片衔接上下文（供跨页题干参考，勿重复提取）]\n${prevTail}\n\n[第 ${pg.pageNum} 页分段]\n${piece}`
            : `--- 第 ${pg.pageNum} 页 ---\n${piece}`
        })
        prevTail = piece.slice(-350)
      }
      if (chunks.length >= maxChunks) break
      continue
    }

    if ((bufLen + pg.text.length > maxCharsPerChunk || bufPages.length >= maxPagesPerChunk) && bufPages.length > 0) {
      const rawBody = bufPages.map(p => p.text).join('\n')
      flushBuffer(prevTail)
      prevTail = rawBody.slice(-350)
      bufPages = []
      bufLen = 0
      if (chunks.length >= maxChunks) break
    }

    bufPages.push(pg)
    bufLen += pg.text.length + 24
  }

  if (chunks.length < maxChunks && bufPages.length > 0) {
    flushBuffer(prevTail)
  }

  return chunks
}

/**
 * 探测试卷末尾是否有独立“参考答案/答案速查”区块，供跨页题目参考匹配
 */
export function extractAnswerKeySnippet(pages: ExtractedPdfPage[]): string {
  if (pages.length < 3) return ''
  const tailStartIdx = Math.floor(pages.length * 0.6)
  const answerPages: string[] = []
  let collected = 0

  for (let i = tailStartIdx; i < pages.length; i++) {
    const txt = pages[i].text || ''
    if (/(参考答案|答案速查|标准答案|答案与解析|试题解析|选[择项]题答案)/i.test(txt) || answerPages.length > 0) {
      const snip = `【第 ${pages[i].pageNum} 页】\n${txt}`
      if (collected + snip.length > 3500) break
      answerPages.push(snip)
      collected += snip.length
    }
  }
  return answerPages.join('\n\n')
}

/**
 * 题干去噪指纹，用于跨分片合并时高精度去重
 */
function normalizeQuestionFingerprint(qText: string): string {
  return String(qText || '')
    .replace(/^(?:第?\s*\d+\s*[.、题\s\)]+|【(?:真题|单选|多选|填空|解答|例题|习题)?\s*\d*\s*】)/, '')
    .replace(/\s+/g, '')
    .replace(/[，。！？：；、“”‘’（）()【】\[\]]/g, '')
    .toLowerCase()
    .slice(0, 80)
}

export function normalizeAndDeduplicateQuestions(
  rawQuestions: any[],
  defaults: {
    domain: ResourceDomain
    subject: string
    bookName: string
    defaultChapter?: string
  }
): any[] {
  const result: any[] = []
  const seenFingerprints = new Set<string>()
  const baseStamp = Date.now()

  for (const item of rawQuestions) {
    if (!item || typeof item !== 'object') continue
    const qText = String(item.question || '').trim()
    if (qText.length < 6) continue

    const fp = normalizeQuestionFingerprint(qText)
    if (!fp || seenFingerprints.has(fp)) continue
    seenFingerprints.add(fp)

    const hasOptionsObj =
      item.options && typeof item.options === 'object' && Object.keys(item.options).length >= 2

    let qType = String(item.type || (hasOptionsObj ? 'choice' : 'analysis')).toLowerCase()
    if (!['choice', 'multiple', 'blank', 'analysis'].includes(qType)) {
      qType = hasOptionsObj ? 'choice' : 'analysis'
    }

    const cleanOptions: Record<string, string> | undefined = hasOptionsObj
      ? Object.fromEntries(
          Object.entries(item.options)
            .filter(([k, v]) => ['A', 'B', 'C', 'D', 'E', 'F'].includes(String(k).trim().toUpperCase()) && v != null && String(v).trim().length > 0)
            .map(([k, v]) => [String(k).trim().toUpperCase(), String(v).trim()])
        )
      : undefined

    const tags = Array.isArray(item.tags) && item.tags.length > 0
      ? item.tags.map((t: any) => String(t).trim()).filter(Boolean)
      : ['资料导入', defaults.subject]

    const idx = result.length + 1
    result.push({
      id: item.id && typeof item.id === 'string' && !item.id.startsWith('gen-')
        ? item.id
        : `pdf-${baseStamp}-${idx}`,
      domain: item.domain || defaults.domain,
      subject: item.subject || defaults.subject,
      chapter: String(item.chapter || defaults.defaultChapter || `${defaults.subject}资料提炼`).trim(),
      type: qType,
      difficulty: ['简单', '中等', '困难'].includes(item.difficulty) ? item.difficulty : '中等',
      question: qText,
      ...(cleanOptions && Object.keys(cleanOptions).length >= 2 ? { options: cleanOptions } : {}),
      answer: String(item.answer ?? '待核对').trim() || '待核对',
      explanation: String(item.explanation || '已从原资料中提取题目，详见原 PDF 对应页码或参考解析。').trim(),
      tags: Array.from(new Set([...tags, defaults.bookName.replace(/\.[^.]+$/, '')])).slice(0, 6),
      sourceBook: defaults.bookName,
      ...(item.sourcePage ? { sourcePage: Number(item.sourcePage) } : {})
    })
  }

  return result
}

export function getDirectorySizeBytes(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0
  let total = 0
  const walk = (curr: string) => {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(curr, { withFileTypes: true })
    } catch {
      return
    }
    for (const ent of entries) {
      const full = path.join(curr, ent.name)
      if (ent.isDirectory()) {
        walk(full)
      } else if (ent.isFile()) {
        try {
          total += fs.statSync(full).size
        } catch {}
      }
    }
  }
  walk(dirPath)
  return total
}
