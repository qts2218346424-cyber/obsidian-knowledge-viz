import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { readTextFileAutoEncoding, extractDocxTextNative } from '../utils/text-encoding.js'

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

export interface AnswerKeyIndex {
  byQuestionNum: Map<number, string>
  rawAnswerPagesText: string
}

let cachedPDFParseClass: any = null
let cachedPdfjsLib: any = null

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

async function getPdfjsLib(): Promise<any | null> {
  if (cachedPdfjsLib) return cachedPdfjsLib
  try {
    const mod: any = await import('pdfjs-dist/legacy/build/pdf.mjs')
    cachedPdfjsLib = mod
    return mod
  } catch {
    try {
      const mod2: any = await import('pdfjs-dist')
      cachedPdfjsLib = mod2
      return mod2
    } catch {
      return null
    }
  }
}

/**
 * 常见 PDF 内嵌数学符号私有区 (PUA: U+E000~U+F8FF / Symbol Font) 乱码字符还原映射表
 */
const PUA_MATH_MAP: Record<string, string> = {
  '\uf0b1': '±',
  '\uf0a3': '≤',
  '\uf0b3': '≥',
  '\uf0b9': '≠',
  '\uf0bb': '≈',
  '\uf0a5': '∞',
  '\uf0ce': '∈',
  '\uf0cf': '∉',
  '\uf0cc': '⊂',
  '\uf0cd': '⊆',
  '\uf0c7': '∩',
  '\uf0c8': '∪',
  '\uf0c6': '∅',
  '\uf0d6': '√',
  '\uf0b4': '×',
  '\uf0b8': '÷',
  '\uf0ae': '→',
  '\uf0ac': '←',
  '\uf0de': '⇒',
  '\uf0db': '⇔',
  '\uf022': '∀',
  '\uf024': '∃',
  '\uf0b6': '∂',
  '\uf0d1': '∇',
  '\uf0e5': '∑',
  '\uf0f2': '∫',
  '\uf0ec': '{',
  '\uf0ed': '{',
  '\uf0ee': '{',
  '\uf0ef': '|',
  '\uf0fc': '}',
  '\uf0fd': '}',
  '\uf0fe': '}',
  '\uf0e6': '(',
  '\uf0e7': '(',
  '\uf0e8': '(',
  '\uf0f6': ')',
  '\uf0f7': ')',
  '\uf0f8': ')',
}

function normalizeMathPuaChars(input: string): string {
  if (!input) return ''
  let out = input.replace(/[\uf000-\uf0ff]/g, ch => PUA_MATH_MAP[ch] ?? '')
  // 清理剩余无法识别的私有区孤立乱码块，保留常规中英文与标点
  out = out.replace(/[\ue000-\uf8ff]/g, '')
  return out
}

export function cleanPageLines(rawText: string): string {
  if (!rawText) return ''
  const normalized = normalizeMathPuaChars(rawText)
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
  const lines = normalized.split('\n').map(l => l.trimEnd())
  const filtered: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // 过滤纯水印、页脚与广告干扰行，保留题号和短选项如 "A." 或 "1."
    if (
      (/^(公众号|微信公众号|QQ群|微信群|扫码关注|淘宝店铺|闲鱼|拼多多|免费分享|仅供个人学习|严禁商用|盗版必究|版权所有)/i.test(trimmed) &&
        trimmed.length < 55) ||
      /^[-—·~\s]*第\s*\d+\s*页(?:[，,\s/]*共\s*\d+\s*页)?[-—·~\s]*$/.test(trimmed) ||
      /^[-—]\s*\d{1,4}\s*[-—]$/.test(trimmed) ||
      /^Page\s+\d+\s*(?:of\s+\d+)?$/i.test(trimmed) ||
      (/^b\s*站[：:]/i.test(trimmed) && /公[众粽]号/.test(trimmed))
    ) {
      continue
    }
    filtered.push(trimmed)
  }
  return filtered.join('\n')
}

interface PositionedGlyph {
  str: string
  x: number
  y: number
  w: number
  h: number
  fontSize: number
}

interface ReconstructedLine {
  y: number
  xStart: number
  xEnd: number
  fontSize: number
  text: string
}

function clusterGlyphsIntoLines(glyphs: PositionedGlyph[], yTolerance = 3.6): ReconstructedLine[] {
  if (glyphs.length === 0) return []
  // PDF 坐标系原点在左下角：y 越大越靠上
  const sorted = [...glyphs].sort((a, b) => (Math.abs(b.y - a.y) > yTolerance ? b.y - a.y : a.x - b.x))
  const buckets: PositionedGlyph[][] = []

  for (const g of sorted) {
    const last = buckets[buckets.length - 1]
    if (!last) {
      buckets.push([g])
      continue
    }
    const avgY = last.reduce((s, it) => s + it.y, 0) / last.length
    const tol = Math.max(yTolerance, Math.min(g.fontSize, last[0].fontSize) * 0.42)
    if (Math.abs(g.y - avgY) <= tol) {
      last.push(g)
    } else {
      buckets.push([g])
    }
  }

  const lines: ReconstructedLine[] = []
  for (const bucket of buckets) {
    bucket.sort((a, b) => a.x - b.x)
    let text = ''
    let prevEnd = -1
    let maxFont = 0
    for (const item of bucket) {
      maxFont = Math.max(maxFont, item.fontSize)
      if (prevEnd >= 0) {
        const gap = item.x - prevEnd
        const spaceThreshold = Math.max(2.2, item.fontSize * 0.26)
        if (gap > spaceThreshold * 3.2) {
          text += '   '
        } else if (gap > spaceThreshold) {
          // 中文字间微距不强插空格，英文单词或选项间补空格
          const prevChar = text[text.length - 1] || ''
          const nextChar = item.str[0] || ''
          const bothCjk = /[\u4e00-\u9fa5]/.test(prevChar) && /[\u4e00-\u9fa5]/.test(nextChar)
          if (!bothCjk || gap > item.fontSize * 0.85) {
            text += ' '
          }
        }
      }
      text += item.str
      prevEnd = Math.max(prevEnd, item.x + item.w)
    }

    const trimmed = normalizeMathPuaChars(text).replace(/[ \t]{4,}/g, '   ').trim()
    if (!trimmed) continue
    lines.push({
      y: bucket.reduce((s, it) => s + it.y, 0) / bucket.length,
      xStart: bucket[0].x,
      xEnd: prevEnd,
      fontSize: maxFont || 10.5,
      text: trimmed,
    })
  }

  return lines
}

/**
 * 判断单个页面是否属于双栏排版（例如考研英语阅读双栏真题、政治双栏冲刺背诵讲义）
 * 若页面中部 [44%W, 56%W] 走廊几乎不被短行跨越，且左右两侧各有 >= 6 行独立文本，则按先左栏后右栏重排
 */
function reconstructColumnAwarePageText(
  glyphs: PositionedGlyph[],
  pageWidth: number,
  pageHeight: number,
  repeatedMarginTexts: Set<string>
): string {
  if (glyphs.length === 0) return ''

  // 1. 过滤页眉/页脚区域（页面顶部 5.5% 与底部 5.5%）内跨页高频重复文本以及纯孤立页码
  const topY = pageHeight * 0.942
  const bottomY = pageHeight * 0.058
  const bodyGlyphs = glyphs.filter(g => {
    if (g.y > topY || g.y < bottomY) {
      const cleanStr = g.str.trim()
      if (!cleanStr) return false
      if (/^\d{1,4}$/.test(cleanStr)) return false
      if (repeatedMarginTexts.has(cleanStr)) return false
    }
    return true
  })

  if (bodyGlyphs.length === 0) return ''

  // 2. 检测双栏走廊（排除顶部横跨全页的大标题 y > pageHeight * 0.84）
  const midX = pageWidth * 0.5
  const corridorLeft = pageWidth * 0.455
  const corridorRight = pageWidth * 0.545

  const fullLines = clusterGlyphsIntoLines(bodyGlyphs)
  if (fullLines.length === 0) return ''

  const bodyFontSizes = fullLines.map(l => l.fontSize).sort((a, b) => a - b)
  const medianFont = bodyFontSizes[Math.floor(bodyFontSizes.length / 2)] || 10.5

  const candidateGlyphs = bodyGlyphs.filter(g => g.y < pageHeight * 0.84)
  let leftOnlyCount = 0
  let rightOnlyCount = 0
  let crossingCorridorCount = 0

  for (const g of candidateGlyphs) {
    const gStart = g.x
    const gEnd = g.x + Math.max(g.w, g.str.length * g.fontSize * 0.48)
    if (gEnd <= corridorRight && gStart < corridorLeft) {
      leftOnlyCount++
    } else if (gStart >= corridorLeft && gEnd > corridorRight) {
      rightOnlyCount++
    } else if (gStart < corridorLeft && gEnd > corridorRight) {
      crossingCorridorCount++
    }
  }

  const totalSide = leftOnlyCount + rightOnlyCount
  const isTwoColumn =
    pageWidth >= 420 &&
    leftOnlyCount >= 12 &&
    rightOnlyCount >= 12 &&
    totalSide >= 30 &&
    crossingCorridorCount <= totalSide * 0.08

  let orderedLines: ReconstructedLine[] = []
  if (!isTwoColumn) {
    orderedLines = fullLines
  } else {
    const headerGlyphs = bodyGlyphs.filter(g => g.y >= pageHeight * 0.84)
    const mainGlyphs = bodyGlyphs.filter(g => g.y < pageHeight * 0.84)
    const leftCol = mainGlyphs.filter(g => g.x + g.w * 0.35 <= midX)
    const rightCol = mainGlyphs.filter(g => g.x + g.w * 0.35 > midX)
    orderedLines = [
      ...clusterGlyphsIntoLines(headerGlyphs),
      ...clusterGlyphsIntoLines(leftCol),
      ...clusterGlyphsIntoLines(rightCol),
    ]
  }

  // 3. 智能段落重组与字号层级标题恢复
  const paragraphs: string[] = []
  let currentPara = ''

  const isStructuralStart = (txt: string, fontSize: number): boolean => {
    if (fontSize >= medianFont * 1.22 && txt.length <= 65) return true
    return /^(?:第\s*[一二三四五六七八九十百0-9]+\s*[章节讲篇部分单元]|(?:\d{1,3}|[一二三四五六七八九十]+)[.、．)\s]|[\(（](?:\d{1,3}|[一二三四五六七八九十A-F])[\)）]|[A-F][.、．\):：\s]|【[^】]{1,18}】|[-•▪●*]\s+|Section\s+[IVX\d]+|Part\s+[A-D\d]+|Text\s+[1-5]|Passage\s+[1-5]|Directions[:：])/i.test(
      txt
    )
  }

  for (let i = 0; i < orderedLines.length; i++) {
    const line = orderedLines[i]
    const txt = line.text
    if (!txt || repeatedMarginTexts.has(txt)) continue

    // 显著放大的短行自动提升为 Markdown 章节标题，提升讲义阅读层次感
    const isMajorHeading =
      line.fontSize >= medianFont * 1.38 &&
      txt.length <= 52 &&
      !/^[A-F][.、\s]/.test(txt) &&
      !/[。；？！]$/.test(txt)
    const isSubHeading =
      !isMajorHeading &&
      line.fontSize >= medianFont * 1.18 &&
      txt.length <= 56 &&
      /^(?:第\s*[一二三四五六七八九十0-9]+\s*[章节讲点]|[一二三四五六七八九十]+[、.．]|\d+\.\d+\s+|Section\s+|Part\s+|Text\s+\d)/i.test(
        txt
      )

    if (isMajorHeading || isSubHeading) {
      if (currentPara) {
        paragraphs.push(currentPara)
        currentPara = ''
      }
      const prefix = isMajorHeading ? '## ' : '### '
      paragraphs.push(txt.startsWith('#') ? txt : `${prefix}${txt}`)
      continue
    }

    if (isStructuralStart(txt, line.fontSize)) {
      if (currentPara) {
        paragraphs.push(currentPara)
      }
      currentPara = txt
      continue
    }

    if (!currentPara) {
      currentPara = txt
      continue
    }

    // 判断上一行是否已自然结句，若是则另起一段，否则粘合 PDF 物理硬断行
    const prevEndsSentence = /[。！？；：.!?;:”"』】）\)]$/.test(currentPara)
    const prevLine = orderedLines[i - 1]
    const largeVerticalGap = prevLine ? Math.abs(prevLine.y - line.y) > medianFont * 1.95 : false

    if (prevEndsSentence && largeVerticalGap) {
      paragraphs.push(currentPara)
      currentPara = txt
    } else if (prevEndsSentence && txt.length < 28) {
      paragraphs.push(currentPara)
      currentPara = txt
    } else {
      // 英文连字符断词修复（如 "inter-\nnational" -> "international"）
      if (/[a-zA-Z]-$/.test(currentPara) && /^[a-z]/.test(txt)) {
        currentPara = currentPara.slice(0, -1) + txt
      } else {
        const prevLast = currentPara[currentPara.length - 1] || ''
        const nextFirst = txt[0] || ''
        const needSpace = /[a-zA-Z0-9,;:]/.test(prevLast) && /[a-zA-Z0-9(]/.test(nextFirst)
        currentPara += (needSpace ? ' ' : '') + txt
      }
    }
  }

  if (currentPara) {
    paragraphs.push(currentPara)
  }

  return cleanPageLines(paragraphs.join('\n'))
}

/**
 * 基于 pdfjs-dist 几何坐标矩阵的高精度逐页版面提取器（支持双栏识别、页眉页脚剔除、段落粘合）
 */
async function extractPdfPagesLayoutAware(
  dataView: Uint8Array,
  reqStart: number,
  reqEnd: number
): Promise<{
  totalPages: number
  outlineTitles: string[]
  pages: ExtractedPdfPage[]
  totalEffectiveChars: number
} | null> {
  const pdfjs = await getPdfjsLib()
  if (!pdfjs || typeof pdfjs.getDocument !== 'function') return null

  let doc: any = null
  try {
    const loadingTask = pdfjs.getDocument({
      data: dataView,
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
      verbosity: 0,
    })
    doc = await loadingTask.promise
    const totalPages = Math.max(Number(doc.numPages || 1), 1)
    const rawOutline = await doc.getOutline().catch(() => [])
    const outlineTitles = flattenOutlineTitles(rawOutline || [])

    const actualStart = Math.max(1, Math.min(reqStart, totalPages))
    const actualEnd = Math.max(actualStart, Math.min(reqEnd, totalPages))

    const rawPageGlyphs: Array<{
      pageNum: number
      width: number
      height: number
      glyphs: PositionedGlyph[]
    }> = []

    const marginFreq = new Map<string, number>()

    for (let pNum = actualStart; pNum <= actualEnd; pNum++) {
      const page = await doc.getPage(pNum)
      const viewport = page.getViewport({ scale: 1.0 })
      const width = viewport.width || 595
      const height = viewport.height || 842
      const textContent = await page.getTextContent()
      const glyphs: PositionedGlyph[] = []
      const seenMarginOnPage = new Set<string>()

      for (const item of textContent?.items || []) {
        if (!item || typeof item.str !== 'string') continue
        const rawStr = item.str
        if (!rawStr.trim()) continue
        const tr = Array.isArray(item.transform) ? item.transform : [10, 0, 0, 10, 0, 0]
        // 剔除斜向旋转角度明显的打散水印字符 (tr[1] 或 tr[2] 显著非零且文本短)
        const rotSkew = Math.abs(Number(tr[1] || 0)) + Math.abs(Number(tr[2] || 0))
        const scaleMag = Math.hypot(Number(tr[0] || 10), Number(tr[1] || 0))
        if (rotSkew > scaleMag * 0.28 && rawStr.trim().length <= 24) {
          continue
        }

        const x = Number(tr[4] || 0)
        const y = Number(tr[5] || 0)
        const fontSize = Math.max(6, scaleMag || Number(item.height || 10))
        const w = Number(item.width || rawStr.length * fontSize * 0.5)
        const h = Number(item.height || fontSize)

        if (y > height * 0.942 || y < height * 0.058) {
          const mTxt = rawStr.trim()
          if (mTxt.length >= 2 && mTxt.length <= 60) {
            seenMarginOnPage.add(mTxt)
          }
        }

        glyphs.push({ str: rawStr, x, y, w, h, fontSize })
      }

      for (const mTxt of seenMarginOnPage) {
        marginFreq.set(mTxt, (marginFreq.get(mTxt) || 0) + 1)
      }

      rawPageGlyphs.push({ pageNum: pNum, width, height, glyphs })
      if (typeof page.cleanup === 'function') page.cleanup()
    }

    const pageSpan = actualEnd - actualStart + 1
    const repeatedMarginTexts = new Set<string>()
    if (pageSpan >= 3) {
      const minRepeat = Math.max(2, Math.floor(pageSpan * 0.35))
      for (const [txt, cnt] of marginFreq.entries()) {
        if (cnt >= minRepeat) repeatedMarginTexts.add(txt)
      }
    }

    const pages: ExtractedPdfPage[] = []
    let totalEffectiveChars = 0

    for (const pg of rawPageGlyphs) {
      const pageText = reconstructColumnAwarePageText(pg.glyphs, pg.width, pg.height, repeatedMarginTexts)
      const effectiveLen = pageText.replace(/\s+/g, '').length
      totalEffectiveChars += effectiveLen
      pages.push({ pageNum: pg.pageNum, text: pageText })
    }

    return {
      totalPages,
      outlineTitles,
      pages,
      totalEffectiveChars,
    }
  } catch {
    return null
  } finally {
    if (doc && typeof doc.destroy === 'function') {
      await doc.destroy().catch(() => {})
    }
  }
}

/**
 * 当 PDF 缺少内嵌书签时，从提取的各页正文中启发式抽取章节结构生成虚拟大纲
 */
function inferOutlineFromPages(pages: ExtractedPdfPage[]): string[] {
  const headings: string[] = []
  const seen = new Set<string>()
  const headingRe =
    /^(?:#{2,3}\s*)?(第\s*[一二三四五六七八九十百0-9]+\s*[章节讲篇单元部分][^\n]{0,36}|[一二三四五六七八九十]+[、.．]\s*[^\n]{2,34}|(?:Part|Section|Chapter|Text|Passage)\s+[IVX0-9A-D]+[^\n]{0,36})/i

  for (const pg of pages) {
    const lines = pg.text.split('\n').slice(0, 18)
    for (const rawLine of lines) {
      const clean = rawLine.replace(/^#{1,4}\s*/, '').trim()
      if (clean.length < 3 || clean.length > 48) continue
      if (headingRe.test(rawLine.trim())) {
        const key = clean.replace(/\s+/g, '')
        if (seen.has(key)) continue
        seen.add(key)
        const isSub = /^[一二三四五六七八九十]+[、.．]|第\s*[一二三四五六七八九十0-9]+\s*节|Text\s+\d|Passage\s+\d/i.test(
          clean
        )
        headings.push(`${isSub ? '### ' : '## '}${clean} (P.${pg.pageNum})`)
        if (headings.length >= 120) return headings
      }
    }
  }
  return headings
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

async function tryPythonScriptJson(
  fullPath: string,
  scriptName: string,
  args: string[] = [],
  timeoutMs = 55000
): Promise<any | null> {
  const candidates = [
    path.resolve(process.cwd(), 'server', 'scripts', scriptName),
    path.resolve(process.cwd(), 'scripts', scriptName),
  ]
  const scriptPath = candidates.find(p => fs.existsSync(p))
  if (!scriptPath) return null

  const bins = process.platform === 'win32' ? ['python', 'python3'] : ['python3', 'python']
  for (const bin of bins) {
    try {
      const { stdout } = await execFileAsync(bin, [scriptPath, fullPath, ...args], {
        timeout: timeoutMs,
        maxBuffer: 25 * 1024 * 1024,
      })
      const parsed = JSON.parse(stdout)
      if (parsed) return parsed
    } catch {
      // 尝试下一个 python 可执行名
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
      error: '文件不存在',
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
    let outlineTitles = flattenOutlineTitles(info?.outline || [])

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
    const samplePages: ExtractedPdfPage[] = []
    if (samplePageNums.length > 0) {
      const sampleRes = await parser.getText({ partial: samplePageNums, pageJoiner: '' })
      for (const pg of sampleRes?.pages || []) {
        const cleaned = cleanPageLines(pg?.text || '')
        samplePages.push({ pageNum: Number(pg?.num || 1), text: cleaned })
        sampleTextLength += cleaned.replace(/\s+/g, '').length
      }
    }

    if (outlineTitles.length === 0 && samplePages.length > 0) {
      outlineTitles = inferOutlineFromPages(samplePages)
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
      sampleTextLength,
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
      error: err?.message || 'PDF 探测失败',
    }
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy().catch(() => {})
    }
  }
}

/**
 * 完整提取 PDF / Word / PPT / Excel / Markdown / HTML / TXT 资料内容
 * - 非 PDF Office 文档：优先走 markitdown Python 转换，.docx 内置零依赖原生 XML 解压双保险兜底；
 * - 文本文件：自动探测 UTF-8 / GB18030 / GBK / UTF-16，杜绝中文乱码；
 * - PDF 文件：优先走 pdfjs-dist 几何坐标双栏重排引擎，扫描版自动尝试 Python RapidOCR 兜底。
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
      error: '指定文件不存在',
    }
  }

  // 1. Office / 富格式文档 (.docx, .doc, .pptx, .xlsx, .epub) 走结构化转换，绝不当纯 UTF-8 乱码直读
  if (['.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.epub', '.rtf'].includes(ext)) {
    let mdText = ''
    let methodUsed = 'markitdown'
    const mkRes = await tryPythonScriptJson(fullPath, 'convert_markitdown.py', [], 45000)
    if (mkRes?.success && typeof mkRes.markdown === 'string' && mkRes.markdown.trim().length > 0) {
      mdText = mkRes.markdown.trim()
      methodUsed = mkRes.method || 'markitdown'
    } else if (ext === '.docx') {
      try {
        mdText = extractDocxTextNative(fullPath)
        methodUsed = 'docx_native_xml'
      } catch {}
    }

    if (!mdText) {
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
        method: 'office_failed',
        error:
          ext === '.doc'
            ? '旧版二进制 .doc 格式无法直接读取，请另存为 .docx 或 .pdf 后重新上传'
            : `未能从 ${ext} 文档中解析出有效文本`,
      }
    }

    const headings = inferOutlineFromPages([{ pageNum: 1, text: mdText }])
    return {
      success: true,
      isPdf: false,
      totalPages: 1,
      extractedStartPage: 1,
      extractedEndPage: 1,
      pages: [{ pageNum: 1, text: mdText }],
      fullText: mdText,
      outlineText: headings.join('\n'),
      outlineTitles: headings,
      isScannedImageOnly: false,
      avgCharsPerPage: mdText.length,
      method: methodUsed,
    }
  }

  // 2. 纯文本 / Markdown / HTML 文件：自适应编码解码（彻底消除 GBK 乱码）
  if (ext !== '.pdf') {
    const stat = fs.statSync(fullPath)
    if (stat.size > 25 * 1024 * 1024) {
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
        error: '文本文件超过 25MB，建议拆分后导入',
      }
    }

    let raw = readTextFileAutoEncoding(fullPath)
    if (ext === '.html' || ext === '.htm') {
      raw = raw
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<\/?(?:p|div|h[1-6]|li|tr|br|section|article)[^>]*>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    }
    const clean = raw.trim()
    const headings = inferOutlineFromPages([{ pageNum: 1, text: clean }])
    return {
      success: true,
      isPdf: false,
      totalPages: 1,
      extractedStartPage: 1,
      extractedEndPage: 1,
      pages: [{ pageNum: 1, text: clean }],
      fullText: clean,
      outlineText: headings.join('\n'),
      outlineTitles: headings,
      isScannedImageOnly: false,
      avgCharsPerPage: clean.length,
      method: 'text_auto_encoding',
    }
  }

  // 3. PDF 高精度提取流水线（几何坐标双栏重排 -> pdf-parse 回退 -> 扫描版 RapidOCR 兜底）
  let parser: any = null
  try {
    const dataBuffer = fs.readFileSync(fullPath)
    const zeroCopyView = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength)

    const hasExplicitRange = Boolean(
      options?.startPage && options?.endPage && options.endPage >= options.startPage
    )
    const maxPagesAllowed = hasExplicitRange
      ? Math.max(options?.maxPagesDefault ?? 180, 320)
      : (options?.maxPagesDefault ?? 180)
    const requestedStart = options?.startPage && options.startPage >= 1 ? options.startPage : 1
    const tentativeEnd =
      options?.endPage && options.endPage >= requestedStart
        ? Math.min(options.endPage, requestedStart + maxPagesAllowed - 1)
        : requestedStart + maxPagesAllowed - 1

    // 3.1 优先尝试 pdfjs-dist 几何坐标双栏感知提取
    const layoutAware = await extractPdfPagesLayoutAware(zeroCopyView, requestedStart, tentativeEnd)

    let totalPages = layoutAware?.totalPages || 0
    let outlineTitles = layoutAware?.outlineTitles || []
    let pages: ExtractedPdfPage[] = layoutAware?.pages || []
    let totalEffectiveChars = layoutAware?.totalEffectiveChars || 0
    let method = layoutAware ? 'pdfjs_layout_two_column_v3' : 'pdf_parse_v2_full'

    // 3.2 若 pdfjs-dist 异常未提取成功，回退到 pdf-parse 批处理
    if (!layoutAware) {
      const PDFParse = await getPDFParseClass()
      parser = new PDFParse({ data: zeroCopyView })
      const info = await parser.getInfo().catch(() => null)
      totalPages = Math.max(Number(info?.total || 0), 1)
      outlineTitles = flattenOutlineTitles(info?.outline || [])

      const reqStart = Math.min(requestedStart, totalPages)
      const reqEnd = Math.min(tentativeEnd, totalPages)
      const batchSize = 20

      for (let pStart = reqStart; pStart <= reqEnd; pStart += batchSize) {
        const pEnd = Math.min(reqEnd, pStart + batchSize - 1)
        const txtRes = await parser.getText({
          first: pStart,
          last: pEnd,
          lineEnforce: true,
          pageJoiner: '',
        })
        for (const pg of txtRes?.pages || []) {
          const cleaned = cleanPageLines(pg?.text || '')
          const effectiveLen = cleaned.replace(/\s+/g, '').length
          totalEffectiveChars += effectiveLen
          pages.push({
            pageNum: Number(pg?.num || pStart),
            text: cleaned,
          })
        }
      }
    }

    const reqStartFinal = pages[0]?.pageNum || Math.min(requestedStart, Math.max(totalPages, 1))
    const reqEndFinal = pages[pages.length - 1]?.pageNum || Math.min(tentativeEnd, Math.max(totalPages, 1))

    let avgCharsPerPage = pages.length > 0 ? Math.round(totalEffectiveChars / pages.length) : 0
    let isScannedImageOnly = pages.length > 0 && avgCharsPerPage < 20 && totalEffectiveChars < 300

    // 3.3 扫描件自动激活 Python RapidOCR 兜底（不再因为未抛错而静默放弃！）
    if (isScannedImageOnly) {
      const pyOcr = await tryPythonScriptJson(fullPath, 'extract_pdf_summary.py', [], 65000)
      if (pyOcr?.success && typeof pyOcr.content === 'string') {
        const ocrClean = cleanPageLines(pyOcr.content)
        const ocrEffective = ocrClean.replace(/\s+/g, '').length
        if (ocrEffective >= 80) {
          pages = [{ pageNum: reqStartFinal, text: ocrClean }]
          totalEffectiveChars = ocrEffective
          avgCharsPerPage = ocrEffective
          isScannedImageOnly = false
          method = pyOcr.method || 'python_rapidocr_rescued'
        }
      }
    }

    if (outlineTitles.length === 0 && pages.length > 0) {
      outlineTitles = inferOutlineFromPages(pages)
    }
    const outlineText = outlineTitles.join('\n')

    const fullText = pages
      .filter(p => p.text.trim().length > 0)
      .map(p => `【第 ${p.pageNum} 页】\n${p.text}`)
      .join('\n\n')

    return {
      success: true,
      isPdf: true,
      totalPages: Math.max(totalPages, pages.length, 1),
      extractedStartPage: reqStartFinal,
      extractedEndPage: reqEndFinal,
      pages,
      fullText,
      outlineText,
      outlineTitles,
      isScannedImageOnly,
      avgCharsPerPage,
      method,
    }
  } catch (err: any) {
    const pyRes = await tryPythonScriptJson(fullPath, 'extract_pdf_summary.py', [], 60000)
    if (pyRes?.success && pyRes?.content) {
      const ocrText = cleanPageLines(String(pyRes.content))
      return {
        success: true,
        isPdf: true,
        totalPages: Number(pyRes.pages || 1),
        extractedStartPage: 1,
        extractedEndPage: Number(pyRes.pages || 1),
        pages: [{ pageNum: 1, text: ocrText }],
        fullText: ocrText,
        outlineText: '',
        outlineTitles: inferOutlineFromPages([{ pageNum: 1, text: ocrText }]),
        isScannedImageOnly: Boolean(pyRes.isScan) && ocrText.length < 80,
        avgCharsPerPage: ocrText.length,
        method: pyRes.method || 'python_fallback',
        domain: pyRes.domain,
        subject: pyRes.subject,
        inferredTitle: pyRes.inferredTitle,
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
      error: err?.message || 'PDF 文本解析失败',
    }
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy().catch(() => {})
    }
  }
}

/**
 * 将提取的逐页正文切分为连续、语义边界对齐（保护英语阅读原文与跨页题干）的扫描分片
 */
export function buildTextChunksForScan(
  pages: ExtractedPdfPage[],
  maxCharsPerChunk = 4600,
  maxChunks = 36,
  maxPagesPerChunk = 10
): TextScanChunk[] {
  const nonEmptyPages = pages.filter(p => p.text && p.text.trim().length > 0)
  if (nonEmptyPages.length === 0) return []

  const chunks: TextScanChunk[] = []
  let bufPages: ExtractedPdfPage[] = []
  let bufLen = 0
  let activeEnglishPassageContext = ''

  // 提取当前页是否开启了新的考研英语阅读/完形篇章，供后续跨片小题携带原文
  const updatePassageTracker = (pageText: string) => {
    const passageMatch = pageText.match(
      /(?:Section\s+[I1V]+|Part\s+[ABC]|Text\s+[1-4]|Passage\s+[1-4]|Directions\s*[:：][\s\S]{10,200})[\s\S]{180,3200}/i
    )
    if (passageMatch) {
      activeEnglishPassageContext = passageMatch[0].slice(0, 2200)
    }
  }

  const flushBuffer = (tailOverlapText = '') => {
    if (bufPages.length === 0) return
    const body = bufPages.map(p => `--- 第 ${p.pageNum} 页 ---\n${p.text}`).join('\n\n')
    const needsPassageCarry =
      activeEnglishPassageContext &&
      !body.includes(activeEnglishPassageContext.slice(0, 80)) &&
      /\b(?:2[1-9]|3\d|4[0-5])\s*[.、\)]/.test(body)

    let prefix = ''
    if (needsPassageCarry) {
      prefix += `[本组英语题目关联的上一页共享篇章原文（仅供提取题目 passage 字段与作答参考，请勿重复提取上一片已提取的小题）]\n${activeEnglishPassageContext}\n\n`
    }
    if (tailOverlapText) {
      prefix += `[上片衔接上下文（供跨页题干参考，勿重复提取已完整题目）]\n${tailOverlapText}\n\n`
    }

    const combined = prefix ? `${prefix}[本片待提取正文]\n${body}` : body

    chunks.push({
      chunkIndex: chunks.length,
      startPage: bufPages[0].pageNum,
      endPage: bufPages[bufPages.length - 1].pageNum,
      text: combined,
    })
  }

  let prevTail = ''
  const questionBoundaryRe = /^(?:第?\s*\d{1,3}\s*[.、．题\)]|【(?:真题|例题|单选|多选|习题|解答)[^】]*】|Text\s+[1-4]|Passage\s+[1-4]|Section\s+[IVX]+)/i

  for (const pg of nonEmptyPages) {
    if (pg.text.length > maxCharsPerChunk) {
      if (bufPages.length > 0) {
        const rawBody = bufPages.map(p => p.text).join('\n')
        flushBuffer(prevTail)
        prevTail = rawBody.slice(-550)
        for (const bp of bufPages) updatePassageTracker(bp.text)
        bufPages = []
        bufLen = 0
        if (chunks.length >= maxChunks) break
      }

      const lines = pg.text.split('\n')
      let subBuf: string[] = []
      let subLen = 0
      for (const line of lines) {
        // 接近阈值且恰逢新题目/新篇章起点时提前优雅断片，避免把一道题腰斩两半
        const nearLimit = subLen > maxCharsPerChunk * 0.72 && questionBoundaryRe.test(line.trim())
        const hardLimit = subLen + line.length + 1 > maxCharsPerChunk
        if ((nearLimit || hardLimit) && subBuf.length > 0) {
          const piece = subBuf.join('\n')
          chunks.push({
            chunkIndex: chunks.length,
            startPage: pg.pageNum,
            endPage: pg.pageNum,
            text: prevTail
              ? `[上片衔接上下文（供跨页题干参考，勿重复提取）]\n${prevTail}\n\n[第 ${pg.pageNum} 页分段]\n${piece}`
              : `--- 第 ${pg.pageNum} 页 ---\n${piece}`,
          })
          prevTail = piece.slice(-550)
          updatePassageTracker(piece)
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
            : `--- 第 ${pg.pageNum} 页 ---\n${piece}`,
        })
        prevTail = piece.slice(-550)
        updatePassageTracker(piece)
      }
      if (chunks.length >= maxChunks) break
      continue
    }

    if ((bufLen + pg.text.length > maxCharsPerChunk || bufPages.length >= maxPagesPerChunk) && bufPages.length > 0) {
      const rawBody = bufPages.map(p => p.text).join('\n')
      flushBuffer(prevTail)
      prevTail = rawBody.slice(-550)
      for (const bp of bufPages) updatePassageTracker(bp.text)
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
 * 构建全书“参考答案与解析”按题号精确映射索引（扫描全书答案区，不再局限于后 40% 与 3500 字截断）
 */
export function buildAnswerKeyIndex(pages: ExtractedPdfPage[]): AnswerKeyIndex {
  const byQuestionNum = new Map<number, string>()
  const answerPageBlocks: string[] = []
  if (pages.length === 0) {
    return { byQuestionNum, rawAnswerPagesText: '' }
  }

  const answerHeadingRe =
    /(?:参考答案|答案速查|标准答案|答案与解析|答案详解|试题解析|参考解析|选[择项]题答案|Answer\s*Key)/i

  let inAnswerZone = false
  for (let i = 0; i < pages.length; i++) {
    const txt = pages[i].text || ''
    if (!txt.trim()) continue

    const hasExplicitHeader = answerHeadingRe.test(txt)
    // 密集答案速查特征：例如 "1. A  2. C  3. ABD  4. B" 或 "1~5 ACDBD"
    const quickKeyMatches = txt.match(/\b\d{1,3}\s*[.、:：\)]\s*[A-F]{1,5}\b/gi) || []
    const isDenseKeyPage = quickKeyMatches.length >= 5

    if (hasExplicitHeader || isDenseKeyPage || (inAnswerZone && i >= Math.floor(pages.length * 0.55))) {
      if (hasExplicitHeader || isDenseKeyPage) inAnswerZone = true
      answerPageBlocks.push(`【第 ${pages[i].pageNum} 页】\n${txt}`)

      // 1) 解析速查表格式：1. A / 16. ACD / (21) B
      const inlinePairRe = /(?:^|\s|[\(（【])(\d{1,4})\s*[\)）】.、:：]\s*([A-F]{1,6})(?=\s|$|[，,；;。\(\d])/g
      let m: RegExpExecArray | null
      while ((m = inlinePairRe.exec(txt)) !== null) {
        const qNum = Number(m[1])
        const ans = m[2].toUpperCase()
        if (qNum >= 1 && qNum <= 1500 && !byQuestionNum.has(qNum)) {
          byQuestionNum.set(qNum, `答案：${ans}`)
        }
      }

      // 2) 解析详尽分题解析块：例如 "12.【答案】ACD 【解析】..."
      const lines = txt.split('\n')
      let curNum: number | null = null
      let curBuf = ''
      const flushItem = () => {
        if (curNum !== null && curBuf.trim().length > 0) {
          const prev = byQuestionNum.get(curNum)
          // 详尽解析覆盖纯单字母速查
          if (!prev || curBuf.length > prev.length) {
            byQuestionNum.set(curNum, curBuf.trim().slice(0, 650))
          }
        }
      }

      for (const line of lines) {
        const itemStart = line.match(
          /^(?:第?\s*(\d{1,4})\s*(?:题|[.、．\)])|【\s*(\d{1,4})\s*】)\s*(.*)/
        )
        if (itemStart) {
          const numCandidate = Number(itemStart[1] || itemStart[2])
          const rest = itemStart[3] || ''
          // 只有包含答案/解析字样或处在明确答案区才认定为答案条目（防止把前面正文题干误当成答案）
          if (
            numCandidate >= 1 &&
            numCandidate <= 1500 &&
            (/(?:答案|解析|选\s*[A-F]|^[A-F]{1,5}\b)/i.test(rest) || hasExplicitHeader)
          ) {
            flushItem()
            curNum = numCandidate
            curBuf = line.trim()
            continue
          }
        }
        if (curNum !== null && curBuf.length < 650) {
          curBuf += '\n' + line.trim()
        }
      }
      flushItem()
    } else {
      inAnswerZone = false
    }
  }

  return {
    byQuestionNum,
    rawAnswerPagesText: answerPageBlocks.join('\n\n'),
  }
}

/**
 * 为指定扫描分片按其中出现的题号精准检索书末标准答案与解析摘录
 */
export function getAnswerSnippetForChunk(chunkText: string, index: AnswerKeyIndex): string {
  if (index.byQuestionNum.size === 0 && !index.rawAnswerPagesText) return ''

  const matchedEntries: string[] = []
  const seenNums = new Set<number>()
  const numRe = /(?:^|\n)\s*(?:第?\s*(\d{1,4})\s*[.、．题\)]|【(?:真题|单选|多选|例题)?\s*(\d{1,4})\s*】)/g
  let m: RegExpExecArray | null
  while ((m = numRe.exec(chunkText)) !== null) {
    const n = Number(m[1] || m[2])
    if (n >= 1 && n <= 1500 && !seenNums.has(n)) {
      seenNums.add(n)
      const hit = index.byQuestionNum.get(n)
      if (hit) {
        matchedEntries.push(`第 ${n} 题 -> ${hit}`)
      }
    }
  }

  if (matchedEntries.length > 0) {
    return matchedEntries.join('\n').slice(0, 3600)
  }

  return index.rawAnswerPagesText.slice(0, 2800)
}

/**
 * 保留旧签名兼容：返回通用参考答案摘要
 */
export function extractAnswerKeySnippet(pages: ExtractedPdfPage[]): string {
  const idx = buildAnswerKeyIndex(pages)
  if (idx.byQuestionNum.size > 0) {
    const items: string[] = []
    for (const [num, val] of idx.byQuestionNum.entries()) {
      items.push(`第 ${num} 题: ${val}`)
      if (items.length >= 80) break
    }
    return items.join('\n').slice(0, 3800)
  }
  return idx.rawAnswerPagesText.slice(0, 3500)
}

/**
 * 高分辨题干指纹：结合题干首部 + 题干尾部 + 选项首字符摘要
 * 彻底修复同一大题材料下第 (1) 问与第 (2) 问因前 80 字相同被误判去重的 Bug
 */
function normalizeQuestionFingerprint(
  qText: string,
  options?: Record<string, any>,
  passage?: string
): string {
  const cleanBody = String(qText || '')
    .replace(/^(?:第?\s*\d+\s*[.、题\s\)]+|【(?:真题|单选|多选|填空|解答|例题|习题)?\s*\d*\s*】)/, '')
    .replace(/\s+/g, '')
    .replace(/[，。！？：；、“”‘’（）()【】\[\]]/g, '')
    .toLowerCase()

  if (!cleanBody) return ''
  const head = cleanBody.slice(0, 56)
  const tail = cleanBody.length > 56 ? cleanBody.slice(-56) : ''
  const optSig =
    options && typeof options === 'object'
      ? Object.entries(options)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${String(v || '').trim().slice(0, 14)}`)
          .join('|')
          .toLowerCase()
      : ''
  const passageSig = passage ? String(passage).replace(/\s+/g, '').slice(0, 24).toLowerCase() : ''

  return `${passageSig}#${head}#${tail}#${optSig}`
}

/**
 * 规范化单选/多选答案字符串（如 "C、A、D" -> "ACD"）
 */
export function normalizeChoiceAnswer(rawAns: any, isMultipleHint = false): {
  answer: string
  isMultiple: boolean
} {
  if (Array.isArray(rawAns)) {
    const letters = Array.from(
      new Set(
        rawAns
          .map(x => String(x).trim().toUpperCase())
          .filter(x => /^[A-F]$/.test(x))
      )
    ).sort()
    if (letters.length > 0) {
      return { answer: letters.join(''), isMultiple: letters.length >= 2 || isMultipleHint }
    }
  }

  const str = String(rawAns ?? '').trim()
  if (!str) return { answer: '待核对', isMultiple: isMultipleHint }

  // 匹配纯选项字母组合，如 "A", "ACD", "A, C, D", "A、B、D"
  const pureChoiceMatch = str.match(/^[A-Fa-f](?:[\s,，、/;-]*[A-Fa-f]){0,5}$/)
  if (pureChoiceMatch) {
    const letters = Array.from(new Set((str.toUpperCase().match(/[A-F]/g) || []))).sort()
    if (letters.length > 0) {
      return { answer: letters.join(''), isMultiple: letters.length >= 2 || isMultipleHint }
    }
  }

  return { answer: str, isMultiple: isMultipleHint }
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
    if (qText.length < 5) continue

    const passageText =
      typeof item.passage === 'string' && item.passage.trim().length > 20
        ? item.passage.trim()
        : undefined

    const fp = normalizeQuestionFingerprint(qText, item.options, passageText)
    if (!fp || seenFingerprints.has(fp)) continue
    seenFingerprints.add(fp)

    const cleanOptions: Record<string, string> | undefined =
      item.options && typeof item.options === 'object'
        ? Object.fromEntries(
            Object.entries(item.options)
              .filter(
                ([k, v]) =>
                  ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(String(k).trim().toUpperCase()) &&
                  v != null &&
                  String(v).trim().length > 0
              )
              .map(([k, v]) => [String(k).trim().toUpperCase(), String(v).trim()])
          )
        : undefined

    const hasOptionsObj = Boolean(cleanOptions && Object.keys(cleanOptions).length >= 2)

    let qType = String(item.type || (hasOptionsObj ? 'choice' : 'analysis')).toLowerCase()
    if (qType === 'single') qType = 'choice'
    if (qType === 'multi' || qType === 'multiple_choice') qType = 'multiple'
    if (!['choice', 'multiple', 'blank', 'analysis'].includes(qType)) {
      qType = hasOptionsObj ? 'choice' : 'analysis'
    }

    let finalAnswer = String(item.answer ?? '待核对').trim() || '待核对'
    if (hasOptionsObj) {
      const norm = normalizeChoiceAnswer(item.answer, qType === 'multiple')
      finalAnswer = norm.answer
      if (norm.isMultiple) {
        qType = 'multiple'
      }
    }

    const tags =
      Array.isArray(item.tags) && item.tags.length > 0
        ? item.tags.map((t: any) => String(t).trim()).filter(Boolean)
        : ['资料导入', defaults.subject]

    const idx = result.length + 1
    result.push({
      id:
        item.id && typeof item.id === 'string' && !item.id.startsWith('gen-')
          ? item.id
          : `pdf-${baseStamp}-${idx}`,
      domain: item.domain || defaults.domain,
      subject: item.subject || defaults.subject,
      chapter: String(item.chapter || defaults.defaultChapter || `${defaults.subject}资料提炼`).trim(),
      type: qType,
      difficulty: ['简单', '中等', '困难'].includes(item.difficulty) ? item.difficulty : '中等',
      ...(passageText ? { passage: passageText } : {}),
      ...(item.groupId ? { groupId: String(item.groupId) } : {}),
      question: qText,
      ...(hasOptionsObj ? { options: cleanOptions } : {}),
      answer: finalAnswer,
      explanation: String(
        item.explanation || '已从原资料中提取题目，详见原 PDF 对应页码或参考解析。'
      ).trim(),
      tags: Array.from(new Set([...tags, defaults.bookName.replace(/\.[^.]+$/, '')])).slice(0, 6),
      sourceBook: defaults.bookName,
      ...(item.sourcePage ? { sourcePage: Number(item.sourcePage) } : {}),
    })
  }

  return result
}

/**
 * 递归统计目录磁盘占用字节数（用于普通用户沙箱存储配额核算）
 */
export function getDirectorySizeBytes(dirPath: string): number {
  if (!dirPath || !fs.existsSync(dirPath)) return 0
  let total = 0
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        total += getDirectorySizeBytes(full)
      } else if (entry.isFile()) {
        try {
          total += fs.statSync(full).size
        } catch {}
      }
    }
  } catch {}
  return total
}

