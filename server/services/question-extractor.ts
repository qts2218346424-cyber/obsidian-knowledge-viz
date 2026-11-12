/**
 * 题目全量提取流水线
 *
 * 旧逻辑把整份资料截成前 5000～10000 字一次性交给 AI，且 max_tokens 偏小，
 * 题一多就被截断丢弃。这里改为四步：
 *   1. 规则切题：不调 AI，按题号/大题标题切出候选题，得到「应有题数」作为对账基准；
 *      同时识别「参考答案」区块，按题号回填答案。
 *   2. 分块提取：按题目边界打包成小块，并发交给 AI，输出 JSONL（一行一题），
 *      截断时只丢最后一行；若 stop_reason 为 max_tokens 则对半拆块重试。
 *   3. 对账补漏：AI 漏掉的题号单独再提一次；仍失败的用规则解析兜底并标记「待校对」，
 *      保证不丢题。
 *   4. 去重并给出覆盖率报告。
 */
import { config, anthropic, getAiClientForModel } from '../context.js'

export type QuestionDomain = 'cs_408' | 'math' | 'politics' | 'english' | 'general'

export interface ExtractedQuestion {
  id: string
  domain: string
  subject: string
  chapter?: string
  /** 题库前端只支持这三种；多选题记为 choice 并打「多选题」标签 */
  type: 'choice' | 'blank' | 'analysis'
  difficulty: '简单' | '中等' | '困难'
  question: string
  options?: Record<string, string>
  answer: string
  explanation: string
  tags: string[]
  /** 原文题号（含大题前缀），用于对账 */
  sourceNo?: string
  /** 规则兜底或答案缺失时为 true，前端提示人工校对 */
  needsReview?: boolean
}

export interface QuestionBlock {
  ref: string
  no: number
  section: string
  text: string
}

export interface SegmentResult {
  blocks: QuestionBlock[]
  /** ref → 答案原文 */
  answerKey: Map<string, string>
  /** 题干区域（不含答案区） */
  body: string
  style: string | null
}

export interface ExtractProgress {
  stage: 'segment' | 'extract' | 'repair' | 'done'
  done: number
  total: number
  message: string
}

export interface ExtractReport {
  questions: ExtractedQuestion[]
  expected: number
  extracted: number
  repairedByRule: number
  missing: string[]
  coverage: number
  segmented: boolean
}

export interface ExtractOptions {
  domain?: string
  subject?: string
  chapter?: string
  sourceName?: string
  /** 已有题目，用于去重 */
  existing?: Array<{ question: string }>
  onProgress?: (p: ExtractProgress) => void
  /** 并发数，默认 3 */
  concurrency?: number
  /** 单块字符上限，默认 3500 */
  chunkChars?: number
  /** 允许使用规则兜底，默认 true */
  ruleFallback?: boolean
  signal?: { aborted: boolean }
  /** 注入 AI 调用（脚本测试用），默认使用项目配置的模型 */
  complete?: (system: string, prompt: string, maxTokens: number) => Promise<AiReply>
}

/* ------------------------------------------------------------------ */
/* 1. 规则切题                                                          */
/* ------------------------------------------------------------------ */

const CN_NUM = '一二三四五六七八九十'
const SECTION_RE = new RegExp(
  `^\\s*(?:#{1,6}\\s*)?(?:\\*\\*)?\\s*(?:第?[${CN_NUM}]+\\s*[、.．:：部]|Part\\s*[IVX\\d]+|Section\\s*[A-Z\\d]+)\\s*.{0,30}?(?:选择|填空|解答|计算|综合|应用|判断|简答|分析|证明|论述|阅读|翻译|写作|完形|题)`,
  'i'
)
const ANSWER_SECTION_RE =
  /^\s*(?:#{1,6}\s*)?(?:\*\*)?\s*(?:[【\[]?\s*)(?:参考答案|答案(?:与|及|和)?(?:解析|详解)|试题(?:解析|答案)|答案速查|标准答案|习题答案|Answer\s*Key|Answers)\s*(?:[】\]])?/i

/** 不同题号书写风格，按优先级尝试；每种返回题号 */
const NUMBER_STYLES: Array<{ name: string; re: RegExp }> = [
  // 1. / 1、 / 1． / 1) / 1） / 第1题 / **1.**
  { name: 'dot', re: /^\s*(?:#{1,6}\s*)?(?:\*\*)?\s*(?:第\s*)?(\d{1,3})\s*(?:题)?\s*(?:\*\*)?\s*[.．、:：)）](?!\d)/ },
  // 【例1】 【1】 例1. 例题1
  { name: 'example', re: /^\s*(?:#{1,6}\s*)?[【\[]?\s*(?:例题?|习题|练习|真题)\s*(\d{1,3})\s*[】\]]?/ },
  // (1) （1）
  { name: 'paren', re: /^\s*(?:#{1,6}\s*)?[（(]\s*(\d{1,3})\s*[）)]/ },
]

const OPTION_LINE_RE = /^\s*[（(]?\s*([A-H])\s*[)）.．、:：]\s*/

function normalizeLines(md: string): string[] {
  return md
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/\u3000/g, ' ')
    .split('\n')
}

interface Hit {
  line: number
  no: number
}

/** 为一种题号风格找出最长「基本递增」序列，作为可信题目起点 */
function collectHits(lines: string[], re: RegExp, stopAt: number): Hit[] {
  const hits: Hit[] = []
  for (let i = 0; i < stopAt; i++) {
    const m = lines[i].match(re)
    if (!m) continue
    // 排除像「1.5 秒」这种小数或「2023年」这种数字串
    const no = Number(m[1])
    if (!Number.isFinite(no) || no <= 0 || no > 300) continue
    // 选项行常以 A. 开头，不会命中数字；但目录行「1. 函数 …… 12」需要排除
    if (/[.…·]{4,}\s*\d+\s*$/.test(lines[i])) continue
    hits.push({ line: i, no })
  }
  return hits
}

/** 保留与前一个题号衔接（+1，或在新大题里从 1 重新开始）的命中 */
function filterSequential(hits: Hit[], sectionStarts: Set<number>): Hit[] {
  const kept: Hit[] = []
  let last = 0
  let sectionCursor = -1
  const sortedSections = [...sectionStarts].sort((a, b) => a - b)
  for (const h of hits) {
    // 是否跨过了一个大题标题
    let crossed = false
    while (sectionCursor + 1 < sortedSections.length && sortedSections[sectionCursor + 1] < h.line) {
      sectionCursor++
      crossed = true
    }
    if (h.no === last + 1 || (h.no === 1 && (crossed || last === 0)) || (crossed && h.no > last)) {
      kept.push(h)
      last = h.no
    } else if (last > 0 && h.no > last + 1 && h.no <= last + 3) {
      // 允许偶尔漏识别一两个题号（OCR 丢行），仍然继续
      kept.push(h)
      last = h.no
    }
  }
  return kept
}

function parseAnswerArea(area: string, sections: string[]): Map<string, string> {
  const key = new Map<string, string>()
  if (!area.trim()) return key

  // 紧凑格式：1-5 ACBDA / 1～5：A C B D A
  const rangeRe = /(\d{1,3})\s*[-~～—–]\s*(\d{1,3})\s*[:：.．]?\s*([A-H](?:\s*[A-H]){1,19})/g
  let m: RegExpExecArray | null
  while ((m = rangeRe.exec(area))) {
    const from = Number(m[1])
    const letters = m[3].replace(/\s+/g, '').split('')
    letters.forEach((l, i) => key.set(String(from + i), l))
  }
  // 紧凑格式：1.A 2.B 3.C（同一行多个）
  const inlineRe = /(?:^|\s)(\d{1,3})\s*[.．、:：]\s*([A-H]{1,4})(?=\s|$|[,，;；])/g
  while ((m = inlineRe.exec(area))) {
    if (!key.has(m[1])) key.set(m[1], m[2])
  }
  // 详解格式：按题号切段
  const lines = normalizeLines(area)
  let cur: string | null = null
  let buf: string[] = []
  const flush = () => {
    if (cur && buf.join('').trim()) {
      const text = buf.join('\n').trim()
      const prev = key.get(cur)
      // 详解比单字母更有信息量
      if (!prev || prev.length < text.length) key.set(cur, text)
    }
  }
  for (const line of lines) {
    // 「1.A 2.B 3.C」这类速查行已在上面解析，不当作详解
    if ((line.match(/(?:^|\s)\d{1,3}\s*[.．、:：]\s*[A-H]{1,4}(?=\s|$|[,，;；])/g) || []).length >= 2) {
      flush()
      cur = null
      buf = []
      continue
    }
    const hm = line.match(NUMBER_STYLES[0].re) || line.match(NUMBER_STYLES[1].re)
    if (hm) {
      flush()
      cur = hm[1]
      buf = [line.replace(NUMBER_STYLES[0].re, '').replace(NUMBER_STYLES[1].re, '')]
    } else if (cur) {
      buf.push(line)
    }
  }
  flush()
  void sections
  return key
}

/**
 * 规则切题。返回题块（带 ref，形如 "s2-7" 或 "7"）、答案表与题干区。
 * 切不出任何题时 blocks 为空，由调用方退回到按长度分块。
 */
export function segmentQuestions(markdown: string): SegmentResult {
  const lines = normalizeLines(markdown)

  // 答案区：取最后一个出现在文档后 30% 之后的「参考答案」标题，避免误伤题干里的「答案」字样
  let answerStart = lines.length
  for (let i = Math.floor(lines.length * 0.3); i < lines.length; i++) {
    if (ANSWER_SECTION_RE.test(lines[i]) && lines[i].length < 40) {
      answerStart = i
      break
    }
  }

  const sectionLines = new Map<number, string>()
  for (let i = 0; i < answerStart; i++) {
    if (SECTION_RE.test(lines[i]) && lines[i].length < 80) {
      sectionLines.set(i, lines[i].replace(/^[#*\s]+|\*+$/g, '').trim())
    }
  }
  const sectionStarts = new Set(sectionLines.keys())

  // 选出命中最多且递增的题号风格
  let best: { name: string; hits: Hit[] } | null = null
  for (const style of NUMBER_STYLES) {
    const hits = filterSequential(collectHits(lines, style.re, answerStart), sectionStarts)
    if (hits.length >= 2 && (!best || hits.length > best.hits.length)) {
      best = { name: style.name, hits }
    }
  }

  const body = lines.slice(0, answerStart).join('\n')
  const answerArea = lines.slice(answerStart).join('\n')

  if (!best) {
    return { blocks: [], answerKey: parseAnswerArea(answerArea, []), body, style: null }
  }

  // 每题所属大题：取其之前最近的大题标题
  const sortedSections = [...sectionLines.entries()].sort((a, b) => a[0] - b[0])
  const sectionOf = (line: number) => {
    let title = ''
    let idx = 0
    sortedSections.forEach(([l, t], i) => {
      if (l < line) {
        title = t
        idx = i + 1
      }
    })
    return { title, idx }
  }

  // 题号在全文是否唯一；不唯一（每个大题从 1 开始）时 ref 带大题序号
  const counts = new Map<number, number>()
  best.hits.forEach(h => counts.set(h.no, (counts.get(h.no) || 0) + 1))
  const restarts = [...counts.values()].some(c => c > 1)

  const blocks: QuestionBlock[] = best.hits.map((h, i) => {
    const end = i + 1 < best!.hits.length ? best!.hits[i + 1].line : answerStart
    // 题块末尾若是下一大题标题，去掉它
    let stop = end
    for (let l = h.line + 1; l < end; l++) {
      if (sectionStarts.has(l)) {
        stop = l
        break
      }
    }
    const sec = sectionOf(h.line)
    const ref = restarts ? `s${sec.idx}-${h.no}` : String(h.no)
    return {
      ref,
      no: h.no,
      section: sec.title,
      text: lines.slice(h.line, stop).join('\n').trim(),
    }
  })

  const rawKey = parseAnswerArea(answerArea, sortedSections.map(s => s[1]))
  // 答案区通常不分大题，题号全局唯一时直接对应；否则只在题号唯一的情况下回填
  const answerKey = new Map<string, string>()
  for (const b of blocks) {
    const k = rawKey.get(String(b.no))
    if (k && (!restarts || (counts.get(b.no) || 0) === 1)) answerKey.set(b.ref, k)
  }

  return { blocks, answerKey, body, style: best.name }
}

/* ------------------------------------------------------------------ */
/* 2. 分块                                                              */
/* ------------------------------------------------------------------ */

export function packBlocks(blocks: QuestionBlock[], maxChars: number): QuestionBlock[][] {
  const chunks: QuestionBlock[][] = []
  let cur: QuestionBlock[] = []
  let size = 0
  for (const b of blocks) {
    if (cur.length > 0 && size + b.text.length > maxChars) {
      chunks.push(cur)
      cur = []
      size = 0
    }
    cur.push(b)
    size += b.text.length
  }
  if (cur.length) chunks.push(cur)
  return chunks
}

/** 没有题号可切时，按段落切块并保留重叠，避免题目被拦腰截断 */
export function splitByLength(text: string, maxChars: number, overlap = 400): string[] {
  const paras = text.split(/\n{2,}/)
  const chunks: string[] = []
  let cur = ''
  for (const p of paras) {
    if (cur && cur.length + p.length + 2 > maxChars) {
      chunks.push(cur)
      cur = cur.slice(Math.max(0, cur.length - overlap)) + '\n\n' + p
    } else {
      cur = cur ? `${cur}\n\n${p}` : p
    }
    // 单段过长时硬切
    while (cur.length > maxChars * 1.5) {
      chunks.push(cur.slice(0, maxChars))
      cur = cur.slice(maxChars - overlap)
    }
  }
  if (cur.trim()) chunks.push(cur)
  return chunks
}

/* ------------------------------------------------------------------ */
/* 3. AI 调用                                                           */
/* ------------------------------------------------------------------ */

export interface AiReply {
  text: string
  stopReason: string
}

const AI_TIMEOUT_MS = 90_000

async function callAi(system: string, prompt: string, maxTokens: number): Promise<AiReply> {
  const target = getAiClientForModel()
  const client: any = target?.client || anthropic
  if (!client) throw new Error('AI 服务未配置')
  const model = target?.model || config.ai?.model || 'deepseek-v4-pro'
  const params = { model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: prompt }] }

  const run = async () => {
    try {
      return await client.messages.create({ ...params, thinking: { type: 'disabled' } })
    } catch {
      return await client.messages.create(params)
    }
  }
  let timer: NodeJS.Timeout | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI 提取超时')), AI_TIMEOUT_MS)
  })
  try {
    const res: any = await Promise.race([run(), timeout])
    let text = ''
    if (Array.isArray(res?.content)) {
      text = res.content
        .filter((c: any) => c && c.type === 'text' && typeof c.text === 'string')
        .map((c: any) => c.text)
        .join('')
    } else if (typeof res?.content === 'string') {
      text = res.content
    }
    return { text, stopReason: res?.stop_reason || '' }
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** 解析 JSONL；也兼容模型偶尔输出的 JSON 数组。单行坏了只丢这一行。 */
export function parseJsonLines(raw: string): any[] {
  if (!raw) return []
  const cleaned = raw.replace(/```(?:json|jsonl)?/gi, '').trim()
  if (cleaned.startsWith('[')) {
    try {
      const arr = JSON.parse(cleaned)
      if (Array.isArray(arr)) return arr
    } catch {
      /* 数组被截断，退回逐行 */
    }
  }
  const out: any[] = []
  for (const line of cleaned.split('\n')) {
    const t = line.trim().replace(/^[\[,]+|[\],]+$/g, '')
    if (!t.startsWith('{')) continue
    try {
      out.push(JSON.parse(t))
    } catch {
      /* 截断的最后一行 */
    }
  }
  return out
}

const SYSTEM_PROMPT =
  '你是考研试卷录入员。你的任务是把给定原文中的题目逐题原样录入为 JSONL，不得新增、删除、合并或改写题目。只输出 JSONL，每行一个 JSON 对象，不要任何其他文字。'

function domainLabel(domain?: string) {
  switch (domain) {
    case 'cs_408':
      return '408 计算机专业基础综合'
    case 'math':
      return '考研数学'
    case 'politics':
      return '考研政治'
    case 'english':
      return '考研英语'
    default:
      return '考研'
  }
}

function buildPrompt(body: string, opts: ExtractOptions, refs: string[] | null, answerHints: string): string {
  const refRule = refs
    ? `原文已按题目用 <<<Q ref=…>>> 标好，共 ${refs.length} 题：${refs.join(', ')}。每题必须输出一行，ref 字段原样填写，不得遗漏。`
    : '原文未标注题目边界。请找出其中每一道完整题目逐题输出，ref 填原文题号（如 "12"）；不完整的残题（被截断的开头或结尾）跳过。'
  return `学科：${domainLabel(opts.domain)}${opts.subject ? `（${opts.subject}）` : ''}

${refRule}

每行字段：
{"ref":"题号","type":"choice|multi|blank|analysis","difficulty":"简单|中等|困难","question":"完整题干，含小问","options":{"A":"…","B":"…"},"answer":"答案","explanation":"解析","tags":["考点"]}

规则：
1. 题干、选项按原文录入，可修正明显的 OCR 断行，不得改写含义。数学公式转为 KaTeX（行内 $…$）。
2. 无选项的题不要输出 options 字段。多选题 type 用 multi。
3. answer、explanation 优先使用原文给出的内容；原文没有时，你给出正确答案和简明解析。
4. 一题含多个小问时作为一题输出，不要拆开。
${answerHints ? `\n原文答案区中与这些题对应的内容（用于填写 answer / explanation）：\n${answerHints}\n` : ''}
原文：
${body}`
}

function toQuestion(raw: any, opts: ExtractOptions, block?: QuestionBlock): ExtractedQuestion | null {
  const question = typeof raw?.question === 'string' ? raw.question.trim() : ''
  if (question.length < 4) return null
  const options =
    raw.options && typeof raw.options === 'object' && Object.keys(raw.options).length >= 2
      ? Object.fromEntries(
          Object.entries(raw.options)
            .filter(([k, v]) => /^[A-H]$/.test(k) && typeof v === 'string')
            .map(([k, v]) => [k, (v as string).trim()])
        )
      : undefined
  const typeIn = String(raw.type || '')
  const isMulti = typeIn === 'multi'
  const type: ExtractedQuestion['type'] = isMulti
    ? 'choice'
    : ['choice', 'blank', 'analysis'].includes(typeIn)
      ? (typeIn as ExtractedQuestion['type'])
      : options
        ? 'choice'
        : 'analysis'
  const diffIn = String(raw.difficulty || '')
  const difficulty: ExtractedQuestion['difficulty'] = ['简单', '中等', '困难'].includes(diffIn)
    ? (diffIn as ExtractedQuestion['difficulty'])
    : '中等'
  const answer = typeof raw.answer === 'string' ? raw.answer.trim() : raw.answer != null ? String(raw.answer) : ''
  return {
    id: `quiz-imp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    domain: opts.domain || 'general',
    subject: opts.subject || '',
    chapter: block?.section || opts.chapter || opts.sourceName,
    type,
    difficulty,
    question,
    ...(options ? { options } : {}),
    answer,
    explanation: typeof raw.explanation === 'string' ? raw.explanation.trim() : '',
    tags: [
      ...(Array.isArray(raw.tags) ? raw.tags.filter((t: any) => typeof t === 'string').slice(0, 6) : []),
      ...(isMulti ? ['多选题'] : []),
    ],
    sourceNo: block?.ref ?? (raw.ref != null ? String(raw.ref) : undefined),
    needsReview: !answer,
  }
}

/** 把答案区的一段内容拆成 answer / explanation：选择题取开头的选项字母，其他题整段作为答案 */
function splitKey(key: string, isChoice: boolean): { answer: string; explanation: string } {
  const k = key.trim()
  if (k.length <= 8) return { answer: k, explanation: '' }
  const lead = k.match(/^(?:【?答案】?|正确答案|选)?\s*[:：]?\s*([A-H]{1,4})(?![A-Za-z])/)
  if (isChoice) return { answer: lead ? lead[1] : '', explanation: k }
  return { answer: k, explanation: k }
}

/** 规则兜底：AI 两次都没提出来的题，按文本切出题干和选项，保证不丢 */
export function ruleParseBlock(block: QuestionBlock, opts: ExtractOptions, answer?: string): ExtractedQuestion {
  const lines = block.text.split('\n')
  const stem: string[] = []
  const options: Record<string, string> = {}
  let curOpt: string | null = null
  for (const line of lines) {
    // 同一行内的多个选项：A. xx  B. yy  C. zz
    const inline = [...line.matchAll(/(?:^|\s)[（(]?([A-H])\s*[.．、:：)）]\s*(.+?)(?=\s*[（(][A-H]\s*[)）]|\s+[A-H]\s*[.．、:：)）]|$)/g)]
    if (inline.length >= 2 && OPTION_LINE_RE.test(line)) {
      inline.forEach(m => (options[m[1]] = m[2].trim()))
      curOpt = inline[inline.length - 1][1]
      continue
    }
    const om = line.match(OPTION_LINE_RE)
    if (om) {
      curOpt = om[1]
      options[curOpt] = line.replace(OPTION_LINE_RE, '').trim()
    } else if (curOpt) {
      options[curOpt] += ` ${line.trim()}`
    } else {
      stem.push(line)
    }
  }
  const hasOptions = Object.keys(options).length >= 2
  const firstLine = (stem[0] || '').replace(NUMBER_STYLES[0].re, '').replace(NUMBER_STYLES[1].re, '').replace(NUMBER_STYLES[2].re, '')
  const question = [firstLine, ...stem.slice(1)].join('\n').trim() || block.text
  const { answer: ans, explanation } = answer ? splitKey(answer, hasOptions) : { answer: '', explanation: '' }
  return {
    id: `quiz-imp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    domain: opts.domain || 'general',
    subject: opts.subject || '',
    chapter: block.section || opts.chapter || opts.sourceName,
    type: hasOptions ? 'choice' : 'analysis',
    difficulty: '中等',
    question,
    ...(hasOptions ? { options } : {}),
    answer: ans,
    explanation,
    tags: ['待校对'],
    sourceNo: block.ref,
    needsReview: true,
  }
}

/* ------------------------------------------------------------------ */
/* 4. 去重与并发                                                         */
/* ------------------------------------------------------------------ */

export function stemKey(q: string): string {
  return q
    .replace(/\$[^$]*\$/g, m => m.replace(/\s+/g, ''))
    .replace(/[\s\p{P}\p{S}]/gu, '')
    .slice(0, 80)
    .toLowerCase()
}

async function runPool<T>(items: T[], limit: number, worker: (item: T, index: number) => Promise<void>) {
  let next = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      await worker(items[i], i)
    }
  })
  await Promise.all(runners)
}

/* ------------------------------------------------------------------ */
/* 5. 主流程                                                            */
/* ------------------------------------------------------------------ */

export function aiAvailable(): boolean {
  return Boolean(getAiClientForModel()?.client || anthropic)
}

export async function extractQuestions(markdown: string, opts: ExtractOptions = {}): Promise<ExtractReport> {
  const progress = (p: ExtractProgress) => opts.onProgress?.(p)
  const chunkChars = opts.chunkChars ?? 3500
  const concurrency = opts.concurrency ?? 3
  const ruleFallback = opts.ruleFallback ?? true

  progress({ stage: 'segment', done: 0, total: 1, message: '正在切分题目' })
  const seg = segmentQuestions(markdown)
  const segmented = seg.blocks.length > 0
  const byRef = new Map(seg.blocks.map(b => [b.ref, b]))
  const got = new Map<string, ExtractedQuestion>()
  const unref: ExtractedQuestion[] = []
  const hasAi = Boolean(opts.complete) || aiAvailable()
  const ai = opts.complete || callAi

  const answerHintsFor = (blocks: QuestionBlock[]) =>
    blocks
      .map(b => (seg.answerKey.has(b.ref) ? `${b.ref}: ${seg.answerKey.get(b.ref)!.slice(0, 600)}` : ''))
      .filter(Boolean)
      .join('\n')

  const accept = (rows: any[], blocks: QuestionBlock[] | null) => {
    for (const row of rows) {
      const ref = row?.ref != null ? String(row.ref).trim() : ''
      const block = blocks ? byRef.get(ref) : undefined
      const q = toQuestion(row, opts, block)
      if (!q) continue
      if (block) {
        if (!q.answer && seg.answerKey.has(block.ref)) {
          const split = splitKey(seg.answerKey.get(block.ref)!, Boolean(q.options))
          q.answer = split.answer
          if (!q.explanation) q.explanation = split.explanation
          q.needsReview = !q.answer
        }
        if (!got.has(block.ref)) got.set(block.ref, q)
      } else {
        unref.push(q)
      }
    }
  }

  const extractBlocks = async (blocks: QuestionBlock[], depth = 0): Promise<void> => {
    if (opts.signal?.aborted) return
    const body = blocks.map(b => `<<<Q ref=${b.ref}>>>\n${b.text}`).join('\n\n')
    const maxTokens = Math.min(8192, 600 + blocks.length * 700)
    try {
      const reply = await ai(SYSTEM_PROMPT, buildPrompt(body, opts, blocks.map(b => b.ref), answerHintsFor(blocks)), maxTokens)
      accept(parseJsonLines(reply.text), blocks)
      // 被截断：把还没拿到的题对半拆开重试
      const pending = blocks.filter(b => !got.has(b.ref))
      if (reply.stopReason === 'max_tokens' && pending.length > 1 && depth < 3) {
        const mid = Math.ceil(pending.length / 2)
        await extractBlocks(pending.slice(0, mid), depth + 1)
        await extractBlocks(pending.slice(mid), depth + 1)
      }
    } catch (err: any) {
      console.warn('[question-extractor] chunk failed:', err?.message)
    }
  }

  if (segmented && hasAi) {
    const chunks = packBlocks(seg.blocks, chunkChars)
    let done = 0
    progress({ stage: 'extract', done, total: seg.blocks.length, message: `识别到 ${seg.blocks.length} 道题，正在提取` })
    await runPool(chunks, concurrency, async chunk => {
      await extractBlocks(chunk)
      done += chunk.length
      progress({ stage: 'extract', done: Math.min(done, seg.blocks.length), total: seg.blocks.length, message: `已提取 ${got.size}/${seg.blocks.length}` })
    })

    // 对账补漏：缺失的题每 3 道一组再提一次
    const missingBlocks = seg.blocks.filter(b => !got.has(b.ref))
    if (missingBlocks.length > 0 && !opts.signal?.aborted) {
      progress({ stage: 'repair', done: 0, total: missingBlocks.length, message: `补提 ${missingBlocks.length} 道遗漏的题` })
      const groups = packBlocks(missingBlocks, 1500).flatMap(g => (g.length > 3 ? [g.slice(0, 3), g.slice(3)] : [g]))
      let fixed = 0
      await runPool(groups, concurrency, async g => {
        await extractBlocks(g, 3)
        fixed += g.length
        progress({ stage: 'repair', done: fixed, total: missingBlocks.length, message: `补提中 ${fixed}/${missingBlocks.length}` })
      })
    }
  } else if (hasAi) {
    // 切不出题号：按长度分块，交给 AI 自行识别
    const chunks = splitByLength(seg.body || markdown, chunkChars)
    let done = 0
    progress({ stage: 'extract', done, total: chunks.length, message: '未识别到题号，按段落提取' })
    await runPool(chunks, concurrency, async chunk => {
      if (opts.signal?.aborted) return
      try {
        const reply = await ai(SYSTEM_PROMPT, buildPrompt(chunk, opts, null, ''), 8192)
        accept(parseJsonLines(reply.text), null)
      } catch (err: any) {
        console.warn('[question-extractor] chunk failed:', err?.message)
      }
      done++
      progress({ stage: 'extract', done, total: chunks.length, message: `已处理 ${done}/${chunks.length} 段` })
    })
  }

  // 规则兜底
  let repairedByRule = 0
  if (segmented && ruleFallback) {
    for (const b of seg.blocks) {
      if (!got.has(b.ref)) {
        got.set(b.ref, ruleParseBlock(b, opts, seg.answerKey.get(b.ref)))
        repairedByRule++
      }
    }
  }

  // 按原文顺序输出并去重（含重叠分块和已有题库）
  const seen = new Set((opts.existing || []).map(q => stemKey(q.question || '')))
  const ordered = segmented ? seg.blocks.map(b => got.get(b.ref)).filter(Boolean) as ExtractedQuestion[] : []
  const questions: ExtractedQuestion[] = []
  for (const q of [...ordered, ...unref]) {
    const k = stemKey(q.question)
    if (!k || seen.has(k)) continue
    seen.add(k)
    questions.push(q)
  }

  const missing = segmented ? seg.blocks.filter(b => !got.has(b.ref)).map(b => b.ref) : []
  const expected = segmented ? seg.blocks.length : questions.length
  const extracted = segmented ? seg.blocks.length - missing.length : questions.length
  const report: ExtractReport = {
    questions,
    expected,
    extracted,
    repairedByRule,
    missing,
    coverage: expected ? Math.round((extracted / expected) * 1000) / 10 : 0,
    segmented,
  }
  progress({ stage: 'done', done: expected, total: expected, message: `完成：${extracted}/${expected} 题` })
  return report
}

/** 粗判一份资料是否像试卷/题集，用于决定导入时要不要跑提题 */
export function looksLikeQuestionSet(markdown: string): boolean {
  const seg = segmentQuestions(markdown)
  if (seg.blocks.length >= 3) {
    const withOptions = seg.blocks.filter(b => /(^|\n)\s*[（(]?[A-D]\s*[.．、)）]/.test(b.text)).length
    const withQuestionWords = seg.blocks.filter(b => /[?？]|求|证明|计算|设|下列|若|已知|判断|简述|分析/.test(b.text)).length
    return withOptions + withQuestionWords >= Math.ceil(seg.blocks.length * 0.5)
  }
  return false
}
