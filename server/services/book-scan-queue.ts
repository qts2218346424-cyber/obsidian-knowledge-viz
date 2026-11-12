import fs from 'fs'
import path from 'path'
import { config, anthropic, markSelfWrite, invalidateCache } from '../context.js'
import { createFile } from '../vault-parser.js'
import {
  extractFullMaterialContent,
  buildTextChunksForScan,
  extractAnswerKeySnippet,
  normalizeAndDeduplicateQuestions,
  type ResourceDomain,
  type TextScanChunk
} from './pdf-extractor.js'

export type ScanBookScope = 'shared' | 'personal'
export type ScanExtractMode = 'question' | 'concept' | 'dual'

export interface ScanTaskInput {
  userId: string
  vaultRoot: string
  scope: ScanBookScope
  relativePath: string
  fullPath: string
  bookName: string
  domain: ResourceDomain
  subject: string
  mode: ScanExtractMode
  startPage?: number
  endPage?: number
  maxChunks?: number
}

export interface ScanTaskState {
  taskId: string
  userId: string
  scope: ScanBookScope
  relativePath: string
  bookName: string
  domain: ResourceDomain
  subject: string
  mode: ScanExtractMode
  status: 'queued' | 'extracting' | 'scanning' | 'saving' | 'completed' | 'error'
  progress: number
  totalPages: number
  scannedPageRange: string
  currentChunk: number
  totalChunks: number
  currentPageRange: string
  stepMessage: string
  extractedQuestionsCount: number
  previewQuestions: any[]
  savedNotePath?: string
  note?: any
  isScannedImageOnly: boolean
  warningMessage?: string
  error?: string
  createdAt: string
  updatedAt: string
}

function getWikiDomainDir(domain: ResourceDomain): string {
  switch (domain) {
    case 'cs_408': return '02-408计算机'
    case 'english': return '03-考研英语'
    case 'politics': return '04-考研政治'
    case 'general': return '05-其他考研资料'
    default: return '01-考研数学'
  }
}

function getDomainDisplayName(domain: ResourceDomain): string {
  switch (domain) {
    case 'cs_408': return '408 计算机综合'
    case 'english': return '考研英语 (英一/英二)'
    case 'politics': return '考研政治 (马原/史纲/思修/新思想)'
    case 'general': return '其他专业课 / 复试综合'
    default: return '考研数学'
  }
}

function getCustomQuestionsPath(vaultRoot: string): string {
  const quizDir = path.resolve(vaultRoot, '做题记录')
  if (!fs.existsSync(quizDir)) {
    fs.mkdirSync(quizDir, { recursive: true })
  }
  return path.join(quizDir, 'custom-questions.json')
}

function normalizeFp(qText: string): string {
  return String(qText || '')
    .replace(/^(?:第?\s*\d+\s*[.、题\s\)]+|【(?:真题|单选|多选|填空|解答|例题|习题)?\s*\d*\s*】)/, '')
    .replace(/\s+/g, '')
    .replace(/[，。！？：；、“”‘’（）()【】\[\]]/g, '')
    .toLowerCase()
    .slice(0, 80)
}

export function appendUniqueCustomQuestions(vaultRoot: string, newQuestions: any[]): number {
  if (!Array.isArray(newQuestions) || newQuestions.length === 0) return 0
  try {
    const p = getCustomQuestionsPath(vaultRoot)
    let list: any[] = []
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (Array.isArray(parsed)) list = parsed
    }

    const existingIds = new Set(list.map((q: any) => String(q?.id || '')))
    const existingFps = new Set(list.map((q: any) => normalizeFp(String(q?.question || ''))).filter(Boolean))

    let added = 0
    for (const q of newQuestions) {
      if (!q || !q.question) continue
      const qId = String(q.id || '')
      const fp = normalizeFp(String(q.question || ''))
      if ((qId && existingIds.has(qId)) || (fp && existingFps.has(fp))) {
        continue
      }
      list.push(q)
      if (qId) existingIds.add(qId)
      if (fp) existingFps.add(fp)
      added++
    }

    if (added > 0) {
      fs.writeFileSync(p, JSON.stringify(list, null, 2), 'utf8')
    }
    return added
  } catch (err: any) {
    console.error('Failed to append custom questions:', err.message)
    return 0
  }
}

export function countQuestionsForBookInVault(vaultRoot: string, bookName: string): number {
  try {
    const p = getCustomQuestionsPath(vaultRoot)
    if (!fs.existsSync(p)) return 0
    const parsed = JSON.parse(fs.readFileSync(p, 'utf8'))
    if (!Array.isArray(parsed)) return 0
    const target = String(bookName || '').trim()
    return parsed.filter((q: any) => q?.sourceBook === target || (Array.isArray(q?.tags) && q.tags.includes(target.replace(/\.[^.]+$/, '')))).length
  } catch {
    return 0
  }
}

function saveExtractionRecordToVault(vaultRoot: string, scope: ScanBookScope, relPath: string, info: any): void {
  try {
    const dir = path.join(vaultRoot, 'raw-sources')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const p = path.join(dir, '.extractions.json')
    let record: Record<string, any> = {}
    if (fs.existsSync(p)) {
      try {
        record = JSON.parse(fs.readFileSync(p, 'utf8')) || {}
      } catch {}
    }
    record[`${scope}:${relPath}`] = {
      ...info,
      scope,
      updatedAt: new Date().toISOString()
    }
    fs.writeFileSync(p, JSON.stringify(record, null, 2), 'utf8')
  } catch (err: any) {
    console.warn('Failed to save extraction record:', err.message)
  }
}

function extractTextFromAiResponse(aiRes: any): string {
  if (!aiRes) return ''
  if (typeof aiRes.text === 'string') return aiRes.text
  if (Array.isArray(aiRes.content)) {
    const textBlocks = aiRes.content
      .filter((c: any) => c && c.type === 'text' && typeof c.text === 'string')
      .map((c: any) => c.text)
    if (textBlocks.length > 0) return textBlocks.join('\n')
    if (typeof aiRes.content[0]?.text === 'string') return aiRes.content[0].text
  }
  return ''
}

function parseQuestionsAndNotesFromRaw(rawText: string): {
  questions: any[]
  summaryMarkdown: string
  chapterHints: string[]
} {
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim()
  const emptyResult = { questions: [] as any[], summaryMarkdown: '', chapterHints: [] as string[] }

  const extractFromObj = (obj: any) => {
    if (!obj) return emptyResult
    if (Array.isArray(obj)) {
      return { questions: obj, summaryMarkdown: '', chapterHints: [] }
    }
    return {
      questions: Array.isArray(obj.questions) ? obj.questions : [],
      summaryMarkdown: typeof obj.summaryMarkdown === 'string'
        ? obj.summaryMarkdown
        : (typeof obj.note?.content === 'string' ? obj.note.content : ''),
      chapterHints: Array.isArray(obj.keyPoints)
        ? obj.keyPoints.map((x: any) => String(x)).filter(Boolean)
        : []
    }
  }

  const tryParseJson = (src: string) => {
    try {
      return JSON.parse(src)
    } catch {
      // 容错处理 LaTeX 公式未双写反斜杠导致的语法失败
      const repaired = src.replace(/\\(?![\\"\/bfnrtu])/g, '\\\\')
      return JSON.parse(repaired)
    }
  }

  try {
    const objMatch = cleaned.match(/\{[\s\S]*\}/)
    if (objMatch) {
      return extractFromObj(tryParseJson(objMatch[0]))
    }
    const arrMatch = cleaned.match(/\[[\s\S]*\]/)
    if (arrMatch) {
      return extractFromObj(tryParseJson(arrMatch[0]))
    }
  } catch {
    // 容错逐个挽救 JSON 内的独立题目对象
    const rescued: any[] = []
    const qMatches = cleaned.match(/\{[^{}]*"question"\s*:\s*"[\s\S]*?\}(?=\s*,|\s*\]|$)/gi) || []
    for (const qm of qMatches) {
      try {
        rescued.push(JSON.parse(qm))
      } catch {
        try {
          rescued.push(JSON.parse(qm.replace(/\r?\n/g, '\\n')))
        } catch {}
      }
    }
    if (rescued.length > 0) {
      return { questions: rescued, summaryMarkdown: '', chapterHints: [] }
    }
  }

  return emptyResult
}

async function callAiForChunkExtraction(params: {
  chunk: TextScanChunk
  totalChunks: number
  bookName: string
  domain: ResourceDomain
  subject: string
  mode: ScanExtractMode
  answerKeySnippet: string
}): Promise<{ questions: any[]; summaryMarkdown: string; keyPoints: string[] }> {
  if (!anthropic) {
    throw new Error('AI 接口未配置，无法执行智能扫描提取')
  }

  const model = config.ai?.model || 'deepseek-flash'
  const domainLabel = getDomainDisplayName(params.domain)

  const modePrompt =
    params.mode === 'question'
      ? `【核心提取规则 — 全量真实题目提取（不限数量）】
1. 请仔细通读本分片文本（第 ${params.chunk.startPage}~${params.chunk.endPage} 页），**完整、逐题提取本分片中出现的所有真实题目**（包括单选题、多选题、填空题、计算题、解答大题、证明题）。
2. **本分片出现几道完整或可识别的题目，就全部提取几道（哪怕有 8~20 道也必须全部列出），严禁只抽 4~5 道敷衍了事！**
3. **绝对禁止编造或臆测文本里没有出现过的题目**；如果本分片纯属目录、前言或纯知识点讲解而没有具体题目，questions 应返回空数组 []。
4. 保留原题题号信息在 chapter 或题干前，所有数学公式/代码/符号必须使用标准 KaTeX LaTeX（行内 $...$，独立公式 $$...$$）。若原文因 PDF 字体映射混入残缺符号（例如 \`f x  \`、\` \`、\`\`、\`\`），请结合数学上下文精准还原为标准 LaTeX（如 \`$f(x)$\`、\`$|\\dots|$\` 等）。
5. 选择题放 options: {"A":"...","B":"...","C":"...","D":"..."}，type="choice"；填空或大题不强制 options，type="blank" 或 "analysis"。
6. 若本分片本身带有答案与解析，请原样高保真整理进 answer 与 explanation；若仅在下方“卷尾答案摘要”能匹配到答案，请匹配填入；若文本确实未附带答案，请根据专业知识精准作答并给出详尽分步推导解析（并在解析开头标注“【参考解析】”）。`
      : params.mode === 'concept'
        ? `【核心提取规则 — 知识点考点梳理 + 真实练习题】
1. 提炼本分片（第 ${params.chunk.startPage}~${params.chunk.endPage} 页）的核心知识框架、定理公式（用 LaTeX）和易错考点，写入 summaryMarkdown。
2. 若本分片包含例题或课后题，请完整提取真实题目放入 questions（有多少提取多少，无题目则返回 [] 或针对关键公式提炼 1~2 道辨析题）。`
        : `【核心提取规则 — 双轨全量提取（真实题目全收 + 核心考点总结）】
1. **题目全量提取（最高优先级）**：扫描本分片（第 ${params.chunk.startPage}~${params.chunk.endPage} 页）中出现的所有真实题目（单选/填空/计算/解答/例题），**有多少提多少，不设 4~5 道数量上限**；跨页衔接片段中已属于上一片的残缺尾部无需重复。
2. 若文本仅为纯知识点无题目，请归纳核心知识点写入 keyPoints 与 summaryMarkdown，questions 可仅在确有例题或明确考点时输出，绝不滥造假题。
3. 所有数学和专业课公式必须用标准 $...$ LaTeX 规范排版。`

  const answerContextBlock = params.answerKeySnippet
    ? `\n【附：资料后部提取到的参考答案/解析区摘录（供对应题号核对答案）】\n"""\n${params.answerKeySnippet.slice(0, 2600)}\n"""\n`
    : ''

  const prompt = `你是精通全国硕士研究生考试（${domainLabel} - ${params.subject}）的真题与教材结构化解析引擎。
正在扫描资料《${params.bookName}》的第 ${params.chunk.chunkIndex + 1}/${params.totalChunks} 分片（对应第 ${params.chunk.startPage}~${params.chunk.endPage} 页）。

${modePrompt}
${answerContextBlock}
【当前分片原书文本】：
"""
${params.chunk.text}
"""

请严格只输出合法的 JSON 对象（不要输出 JSON 以外的任何前后解释文字）：
{
  "questions": [
    {
      "domain": "${params.domain}",
      "subject": "${params.subject}",
      "chapter": "对应章节或年份/题型（如 2024超越卷一·第1~2页）",
      "type": "choice",
      "difficulty": "中等",
      "sourcePage": ${params.chunk.startPage},
      "question": "完整题干（公式用 $...$）",
      "options": {
        "A": "选项A",
        "B": "选项B",
        "C": "选项C",
        "D": "选项D"
      },
      "answer": "正确答案（如 A 或完整答案文本）",
      "explanation": "清晰详实的分步解析",
      "tags": ["${params.subject}", "PDF扫描"]
    }
  ],
  "keyPoints": ["本页段核心考点1", "本页段核心考点2"],
  "summaryMarkdown": "本分片核心知识点/解题方法简明总结（Markdown，150~500字即可）"
}`

  let lastErr: any = null
  let disableThinking = true
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const reqPayload: any = {
        model,
        max_tokens: 8192,
        system: '你是高精度考研题库与知识抽取引擎。必须只输出严格合法的 JSON（字符串内的 LaTeX 反斜杠请双写为 \\\\），绝不遗漏片段中的任何真实题目。',
        messages: [{ role: 'user', content: prompt }]
      }
      if (disableThinking) {
        reqPayload.thinking = { type: 'disabled' }
      }
      const aiRes: any = await anthropic.messages.create(reqPayload)
      const raw = extractTextFromAiResponse(aiRes)
      const parsed = parseQuestionsAndNotesFromRaw(raw)
      return {
        questions: parsed.questions,
        summaryMarkdown: parsed.summaryMarkdown,
        keyPoints: parsed.chapterHints
      }
    } catch (err: any) {
      lastErr = err
      if (/thinking/i.test(String(err?.message || ''))) {
        disableThinking = false
      }
      await new Promise(r => setTimeout(r, 600))
    }
  }
  throw lastErr || new Error('分片 AI 调用失败')
}

function buildFinalWikiNoteContent(params: {
  bookName: string
  domain: ResourceDomain
  subject: string
  totalPages: number
  scannedPageRange: string
  outlineText: string
  chunkSummaries: string[]
  keyPoints: string[]
  questions: any[]
}): { title: string; suggestedPath: string; content: string } {
  const baseBook = params.bookName.replace(/\.[^.]+$/, '')
  const title = `${baseBook}_全卷解析与题库精粹`
  const domainDir = getWikiDomainDir(params.domain)
  const suggestedPath = `wiki/${domainDir}/${params.subject}/${title.replace(/[\\/:*?"<>|]/g, '_')}.md`

  const uniquePoints = Array.from(new Set(params.keyPoints.map(p => p.trim()).filter(Boolean))).slice(0, 40)
  const pointsSection = uniquePoints.length > 0
    ? `## 核心高频考点清单\n\n${uniquePoints.map(p => `- ${p}`).join('\n')}\n`
    : ''

  const outlineSection = params.outlineText
    ? `## 原书目录架构\n\n${params.outlineText}\n`
    : ''

  const summariesSection = params.chunkSummaries.length > 0
    ? `## 分页精研提炼摘要\n\n${params.chunkSummaries.join('\n\n---\n\n')}\n`
    : ''

  const sampleQs = params.questions.slice(0, 12).map((q, idx) => {
    const opts = q.options
      ? Object.entries(q.options).map(([k, v]) => `  - **${k}**. ${v}`).join('\n')
      : ''
    return `### 题目 ${idx + 1}（${q.type === 'choice' ? '选择题' : '综合/填空题'} · ${q.chapter || params.subject}）\n${q.question}\n\n${opts ? opts + '\n\n' : ''}> **答案**：${q.answer}  \n> **解析**：${q.explanation}\n`
  }).join('\n')

  const questionsSection = params.questions.length > 0
    ? `## 本次扫描导入题目精选（共完整导入 ${params.questions.length} 题至题库）\n\n${sampleQs}`
    : ''

  const content = `---
title: ${title}
type: concept
domain: ${params.domain}
subject: ${params.subject}
tags: [考研资料解析, ${params.subject}, 全卷扫描入库]
updated: ${new Date().toISOString().split('T')[0]}
---

# ${title}

> **原资料**：《${params.bookName}》（共 ${params.totalPages} 页 · 本次扫描区间：第 ${params.scannedPageRange} 页）  
> **学科归属**：${getDomainDisplayName(params.domain)} · ${params.subject}  
> **提取结果**：共成功结构化提取并入库 **${params.questions.length} 道真实题目**（原 PDF 完整保留于书架支持随时预览）

---

${pointsSection}
${outlineSection}
${summariesSection}
${questionsSection}
`
  return { title, suggestedPath, content }
}

/**
 * 同步或异步共用的核心全卷分片扫描执行器
 */
export async function executeBookScanJob(
  input: ScanTaskInput,
  onProgress?: (patch: Partial<ScanTaskState>) => void
): Promise<{
  success: boolean
  isScannedImageOnly: boolean
  totalPages: number
  scannedPageRange: string
  questions: any[]
  questionsCount: number
  newlyAddedCount: number
  note?: { title: string; suggestedPath: string; content: string }
  savedNotePath?: string
  warningMessage?: string
  error?: string
}> {
  onProgress?.({
    status: 'extracting',
    progress: 8,
    stepMessage: '正在流式读取原 PDF 页码与内嵌文字层...'
  })

  const extracted = await extractFullMaterialContent(input.fullPath, {
    startPage: input.startPage,
    endPage: input.endPage,
    maxPagesDefault: 120
  })

  if (!extracted.success) {
    throw new Error(extracted.error || '未能读取到资料文件内容')
  }

  const totalPages = extracted.totalPages || 1
  const scannedPageRange = `${extracted.extractedStartPage}-${extracted.extractedEndPage}`

  if (extracted.isScannedImageOnly) {
    const warn =
      `检测到《${input.bookName}》为纯图片扫描版 PDF（共 ${totalPages} 页，平均每页可提取文本不足 20 字）。` +
      `系统已完整保留您的原 PDF 用于随时在线预览与下载；若需批量拆题入库，建议使用带 OCR 文字层的 PDF 版本，或使用「智能导入题库 → 拍照/截图识题」功能逐页识别。`

    saveExtractionRecordToVault(input.vaultRoot, input.scope, input.relativePath, {
      isExtracted: false,
      isScannedImageOnly: true,
      totalPages,
      domain: input.domain,
      subject: input.subject,
      warningMessage: warn
    })

    onProgress?.({
      status: 'completed',
      progress: 100,
      totalPages,
      scannedPageRange,
      isScannedImageOnly: true,
      warningMessage: warn,
      stepMessage: '已保留原 PDF（检测到该文件为纯图片扫描版，暂无法直接抽取文字题目）'
    })

    return {
      success: true,
      isScannedImageOnly: true,
      totalPages,
      scannedPageRange,
      questions: [],
      questionsCount: 0,
      newlyAddedCount: 0,
      warningMessage: warn
    }
  }

  const maxChunks = Math.max(1, Math.min(input.maxChunks || 24, 80))
  const chunks = buildTextChunksForScan(extracted.pages, 4200, maxChunks, 10)

  if (chunks.length === 0) {
    throw new Error('该资料有效文字内容为空，无法进行扫描提取')
  }

  // 根据首片真实文本与书名/路径智能校准二级学科（防止未传 subject 时 cs_408 默认退化为“数据结构”）
  const refineSubjectFromText = (sampleText: string, bookName: string, relPath: string, domain: ResourceDomain, curSubject: string): string => {
    const combined = `${relPath} ${bookName} ${sampleText}`.toLowerCase()
    if (domain === 'cs_408') {
      const scores: Array<[string, number]> = [
        ['操作系统', ['操作系统', '进程', '线程', '死锁', '信号量', 'pv操作', '虚拟内存', '分页', '分段', '页面置换', 'tlb', '快表', '文件系统', 'inode', 'spooling', '调度算法'].filter(k => combined.includes(k)).length],
        ['计算机组成原理', ['计算机组成', '计组', '组原', '指令系统', '微程序', '流水线', '补码', 'ieee754', 'cache', '组相联', '主存', 'dram', '总线'].filter(k => combined.includes(k)).length],
        ['计算机网络', ['计算机网络', '计网', 'tcp', 'udp', 'ip地址', '子网掩码', 'cidr', '三次握手', '滑动窗口', '拥塞控制', 'csma/cd', '路由器', 'rip', 'ospf', 'dns', 'http'].filter(k => combined.includes(k)).length],
        ['数据结构', ['数据结构', '二叉树', 'avl', '红黑树', 'b+树', '哈夫曼', '拓扑排序', '关键路径', 'dijkstra', '快速排序', '堆排序', '链表'].filter(k => combined.includes(k)).length],
      ]
      scores.sort((a, b) => b[1] - a[1])
      if (scores[0][1] > 0 && (!curSubject || curSubject === '数据结构' || scores[0][1] >= 2)) {
        return scores[0][0]
      }
    } else if (domain === 'math') {
      const scores: Array<[string, number]> = [
        ['线性代数', ['线性代数', '行列式', '矩阵的秩', '线性相关', '线性无关', '基础解系', '特征值', '特征向量', '相似对角化', '二次型', '正定'].filter(k => combined.includes(k)).length],
        ['概率论与数理统计', ['概率论', '数理统计', '随机变量', '概率密度', '分布函数', '数学期望', '方差', '协方差', '大数定律', '中心极限定理', '卡方分布'].filter(k => combined.includes(k)).length],
        ['高等数学', ['微积分', '高等数学', '极限', '泰勒公式', '洛必达', '中值定理', '拉格朗日', '不定积分', '定积分', '二重积分', '微分方程', '级数'].filter(k => combined.includes(k)).length],
      ]
      scores.sort((a, b) => b[1] - a[1])
      if (scores[0][1] > 0 && (!curSubject || curSubject === '高等数学' || scores[0][1] >= 2)) {
        return scores[0][0]
      }
    }
    return curSubject
  }

  const sampleTextForSubject = chunks.slice(0, 2).map(c => c.text).join('\n')
  const effectiveSubject = refineSubjectFromText(sampleTextForSubject, input.bookName, input.relativePath, input.domain, input.subject)

  const answerKeySnippet = extractAnswerKeySnippet(extracted.pages)

  onProgress?.({
    status: 'scanning',
    progress: 14,
    totalPages,
    scannedPageRange,
    currentChunk: 0,
    totalChunks: chunks.length,
    stepMessage: `已读取第 ${scannedPageRange} 页文本，共切分为 ${chunks.length} 个高精度扫描分片，准备排队提炼...`
  })

  const rawQuestionsPool: any[] = []
  const chunkSummaries: string[] = []
  const allKeyPoints: string[] = []
  let totalNewlyAdded = 0
  let failedChunks = 0

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const pageTag = chunk.startPage === chunk.endPage
      ? `第 ${chunk.startPage} 页`
      : `第 ${chunk.startPage}~${chunk.endPage} 页`

    onProgress?.({
      status: 'scanning',
      progress: Math.min(90, 15 + Math.round((i / chunks.length) * 75)),
      currentChunk: i + 1,
      totalChunks: chunks.length,
      currentPageRange: pageTag,
      stepMessage: `正在全量扫描第 ${i + 1}/${chunks.length} 片（${pageTag}）... 已累计提取 ${rawQuestionsPool.length} 道题`
    })

    try {
      const chunkRes = await callAiForChunkExtraction({
        chunk,
        totalChunks: chunks.length,
        bookName: input.bookName,
        domain: input.domain,
        subject: effectiveSubject,
        mode: input.mode,
        answerKeySnippet
      })

      if (chunkRes.summaryMarkdown) {
        chunkSummaries.push(`### ${pageTag} 考点总结\n${chunkRes.summaryMarkdown}`)
      }
      if (chunkRes.keyPoints.length > 0) {
        allKeyPoints.push(...chunkRes.keyPoints)
      }

      if (chunkRes.questions.length > 0) {
        const normalizedBatch = normalizeAndDeduplicateQuestions(chunkRes.questions, {
          domain: input.domain,
          subject: effectiveSubject,
          bookName: input.bookName,
          defaultChapter: `${input.bookName.replace(/\.[^.]+$/, '')} · ${pageTag}`
        })

        // 实时增量追加至对应空间的题库中，中途切后台也不丢失已扫题目
        const addedNow = appendUniqueCustomQuestions(input.vaultRoot, normalizedBatch)
        totalNewlyAdded += addedNow
        rawQuestionsPool.push(...normalizedBatch)
      }

      onProgress?.({
        extractedQuestionsCount: rawQuestionsPool.length,
        previewQuestions: rawQuestionsPool.slice(0, 30),
        stepMessage: `完成第 ${i + 1}/${chunks.length} 片（${pageTag}），累计提取 ${rawQuestionsPool.length} 道题（新增入库 ${totalNewlyAdded} 题）`
      })
    } catch (chunkErr: any) {
      failedChunks++
      console.warn(`[BookScanQueue] Chunk ${i + 1}/${chunks.length} (${pageTag}) failed:`, chunkErr?.message)
    }
  }

  onProgress?.({
    status: 'saving',
    progress: 94,
    stepMessage: '正在生成体系化知识库笔记与沉淀索引...'
  })

  const finalQuestions = normalizeAndDeduplicateQuestions(rawQuestionsPool, {
    domain: input.domain,
    subject: effectiveSubject,
    bookName: input.bookName
  })

  const wikiNote = buildFinalWikiNoteContent({
    bookName: input.bookName,
    domain: input.domain,
    subject: effectiveSubject,
    totalPages,
    scannedPageRange,
    outlineText: extracted.outlineText,
    chunkSummaries,
    keyPoints: allKeyPoints,
    questions: finalQuestions
  })

  let savedNotePath = wikiNote.suggestedPath
  try {
    const absNotePath = path.resolve(input.vaultRoot, wikiNote.suggestedPath)
    markSelfWrite(wikiNote.suggestedPath)
    if (fs.existsSync(absNotePath)) {
      fs.mkdirSync(path.dirname(absNotePath), { recursive: true })
      fs.writeFileSync(absNotePath, wikiNote.content, 'utf8')
      savedNotePath = wikiNote.suggestedPath
    } else {
      const created = createFile(input.vaultRoot, wikiNote.suggestedPath, wikiNote.content)
      savedNotePath = created.path || wikiNote.suggestedPath
    }
    invalidateCache(input.userId !== 'anonymous' ? input.userId : undefined)
  } catch (noteErr: any) {
    console.warn('Save scan wiki note warning:', noteErr?.message)
  }

  const warningMessage =
    failedChunks > 0
      ? `共有 ${failedChunks}/${chunks.length} 个分片在 AI 响应时超时跳过，其余分片已全部成功提取。`
      : extracted.totalPages > extracted.extractedEndPage
        ? `本书共 ${extracted.totalPages} 页，本次默认扫描了第 ${scannedPageRange} 页；如需后续章节题目，可在页码框指定例如 "${extracted.extractedEndPage + 1}-${Math.min(extracted.totalPages, extracted.extractedEndPage + 60)}" 继续扫描。`
        : undefined

  const totalVaultBookCount = countQuestionsForBookInVault(input.vaultRoot, input.bookName)
  const effectiveBookCount = Math.max(finalQuestions.length, totalVaultBookCount)

  saveExtractionRecordToVault(input.vaultRoot, input.scope, input.relativePath, {
    isExtracted: true,
    isScannedImageOnly: false,
    noteTitle: wikiNote.title,
    notePath: savedNotePath,
    savedNotePath,
    questionCount: effectiveBookCount,
    questionsCount: effectiveBookCount,
    lastBatchQuestionsCount: finalQuestions.length,
    newlyAddedCount: totalNewlyAdded,
    totalPages,
    scannedPageRange,
    domain: input.domain,
    subject: effectiveSubject
  })

  onProgress?.({
    status: 'completed',
    progress: 100,
    extractedQuestionsCount: finalQuestions.length,
    previewQuestions: finalQuestions.slice(0, 50),
    savedNotePath,
    note: wikiNote,
    warningMessage,
    stepMessage: `全卷扫描完成！共提取 ${finalQuestions.length} 道题目（新增入库 ${totalNewlyAdded} 题）并沉淀笔记。`
  })

  return {
    success: true,
    isScannedImageOnly: false,
    totalPages,
    scannedPageRange,
    questions: finalQuestions,
    questionsCount: finalQuestions.length,
    newlyAddedCount: totalNewlyAdded,
    note: wikiNote,
    savedNotePath,
    warningMessage
  }
}

// ===== 全局串行后台任务队列（并发度=1，严防小内存服务器 OOM） =====

const tasksMap = new Map<string, ScanTaskState>()
const pendingQueue: Array<{ input: ScanTaskInput; taskId: string }> = []
let isWorkerRunning = false

function pruneOldTasks() {
  if (tasksMap.size <= 80) return
  const entries = Array.from(tasksMap.values()).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
  for (let i = 0; i < entries.length - 60; i++) {
    tasksMap.delete(entries[i].taskId)
  }
}

async function processNextInQueue() {
  if (isWorkerRunning) return
  const nextItem = pendingQueue.shift()
  if (!nextItem) return

  isWorkerRunning = true
  const { taskId, input } = nextItem

  const updateTask = (patch: Partial<ScanTaskState>) => {
    const prev = tasksMap.get(taskId)
    if (!prev) return
    tasksMap.set(taskId, {
      ...prev,
      ...patch,
      updatedAt: new Date().toISOString()
    })
  }

  try {
    await executeBookScanJob(input, updateTask)
  } catch (err: any) {
    console.error(`[BookScanQueue] Task ${taskId} failed:`, err?.message)
    updateTask({
      status: 'error',
      error: err?.message || '扫描解析失败，请稍后重试',
      stepMessage: `扫描失败: ${err?.message || '未知错误'}`
    })
  } finally {
    isWorkerRunning = false
    if (pendingQueue.length > 0) {
      setImmediate(() => {
        void processNextInQueue()
      })
    }
  }
}

export function enqueueBookScanTask(input: ScanTaskInput): ScanTaskState {
  pruneOldTasks()
  const taskId = `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const now = new Date().toISOString()
  const queuePos = pendingQueue.length + (isWorkerRunning ? 1 : 0)

  const initialState: ScanTaskState = {
    taskId,
    userId: input.userId,
    scope: input.scope,
    relativePath: input.relativePath,
    bookName: input.bookName,
    domain: input.domain,
    subject: input.subject,
    mode: input.mode,
    status: 'queued',
    progress: 2,
    totalPages: 0,
    scannedPageRange: input.startPage || input.endPage
      ? `${input.startPage || 1}-${input.endPage || '?'}`
      : '全部/自动',
    currentChunk: 0,
    totalChunks: 0,
    currentPageRange: '',
    stepMessage: queuePos > 0 ? `已加入扫描队列（前方还有 ${queuePos} 个任务），即将开始...` : '正在初始化全卷扫描任务...',
    extractedQuestionsCount: 0,
    previewQuestions: [],
    isScannedImageOnly: false,
    createdAt: now,
    updatedAt: now
  }

  tasksMap.set(taskId, initialState)
  pendingQueue.push({ taskId, input })
  setImmediate(() => {
    void processNextInQueue()
  })

  return initialState
}

export function getBookScanTask(taskId: string, userId?: string): ScanTaskState | null {
  const task = tasksMap.get(taskId)
  if (!task) return null
  if (userId && task.userId !== userId && task.userId !== 'anonymous') {
    return null
  }
  return task
}

export function listBookScanTasksForUser(userId: string): ScanTaskState[] {
  return Array.from(tasksMap.values())
    .filter(t => t.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 15)
}
