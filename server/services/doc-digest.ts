/**
 * 长文档分析（map-reduce）
 *
 * 旧逻辑只把文档前 1 万字交给 AI，并用 AI 改写的「结构化笔记」替换原文保存，
 * 导致后半部分内容既没被分析、也没被保存。这里：
 *   - 按标题层级切块，逐块提炼要点与实体（map，可并发）；
 *   - 再把各块要点合并为整篇的分类、标题、标签、导读（reduce）；
 *   - 原文完整保留，导读只作为笔记开头的补充。
 */
import { config, anthropic, getAiClientForModel } from '../context.js'

export interface SectionDigest {
  heading: string
  points: string[]
  entities: string[]
}

export interface DocDigest {
  domain?: 'cs_408' | 'math' | 'general'
  subject?: string
  title?: string
  summary?: string
  tags: string[]
  entities: string[]
  sections: SectionDigest[]
  /** 实际参与分析的字符数 / 全文字符数 */
  analyzedChars: number
  totalChars: number
}

export interface DigestOptions {
  onProgress?: (done: number, total: number) => void
  concurrency?: number
  /** map 阶段最多调用次数，超出则加大块尺寸，保证全文覆盖 */
  maxChunks?: number
}

const AI_TIMEOUT_MS = 90_000

async function ask(system: string, prompt: string, maxTokens: number): Promise<string> {
  const target = getAiClientForModel()
  const client: any = target?.client || anthropic
  if (!client) throw new Error('AI 服务未配置')
  const model = target?.model || config.ai?.model || 'deepseek-v4-pro'
  const params = { model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: prompt }] }
  let timer: NodeJS.Timeout | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI 分析超时')), AI_TIMEOUT_MS)
  })
  const run = async () => {
    try {
      return await client.messages.create({ ...params, thinking: { type: 'disabled' } })
    } catch {
      return await client.messages.create(params)
    }
  }
  try {
    const res: any = await Promise.race([run(), timeout])
    if (Array.isArray(res?.content)) {
      return res.content
        .filter((c: any) => c?.type === 'text' && typeof c.text === 'string')
        .map((c: any) => c.text)
        .join('')
    }
    return typeof res?.content === 'string' ? res.content : ''
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function parseObject(raw: string): any {
  if (!raw) return null
  const s = raw.replace(/```(?:json)?/gi, '').trim()
  try {
    return JSON.parse(s)
  } catch {
    const a = s.indexOf('{')
    const b = s.lastIndexOf('}')
    if (a !== -1 && b > a) {
      try {
        return JSON.parse(s.slice(a, b + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

/** 按 Markdown 标题切块；单块超长时再按段落细分；相邻小块合并 */
export function chunkByHeadings(md: string, target: number): Array<{ heading: string; text: string }> {
  const lines = md.replace(/\r\n?/g, '\n').split('\n')
  const sections: Array<{ heading: string; text: string }> = []
  let heading = ''
  let buf: string[] = []
  const push = () => {
    const text = buf.join('\n').trim()
    if (text) sections.push({ heading, text })
  }
  for (const line of lines) {
    const m = line.match(/^#{1,3}\s+(.+)/)
    if (m) {
      push()
      heading = m[1].trim()
      buf = [line]
    } else {
      buf.push(line)
    }
  }
  push()

  const out: Array<{ heading: string; text: string }> = []
  for (const s of sections) {
    if (s.text.length <= target) {
      const last = out[out.length - 1]
      if (last && last.text.length + s.text.length <= target) {
        last.text += `\n\n${s.text}`
        if (!last.heading) last.heading = s.heading
      } else {
        out.push({ ...s })
      }
      continue
    }
    // 超长：按段落切
    let cur = ''
    for (const p of s.text.split(/\n{2,}/)) {
      if (cur && cur.length + p.length > target) {
        out.push({ heading: s.heading, text: cur })
        cur = ''
      }
      cur = cur ? `${cur}\n\n${p}` : p
      while (cur.length > target * 1.5) {
        out.push({ heading: s.heading, text: cur.slice(0, target) })
        cur = cur.slice(target)
      }
    }
    if (cur.trim()) out.push({ heading: s.heading, text: cur })
  }
  return out
}

async function pool<T>(items: T[], limit: number, fn: (x: T, i: number) => Promise<void>) {
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const k = i++
        await fn(items[k], k)
      }
    })
  )
}

export async function digestDocument(markdown: string, fileName: string, opts: DigestOptions = {}): Promise<DocDigest | null> {
  if (!getAiClientForModel()?.client && !anthropic) return null
  const total = markdown.length
  const maxChunks = opts.maxChunks ?? 24
  // 块尺寸随文档变大，保证 map 次数有上限且覆盖全文
  const target = Math.min(24000, Math.max(6000, Math.ceil(total / maxChunks)))
  const chunks = chunkByHeadings(markdown, target)

  const sections: SectionDigest[] = new Array(chunks.length)
  let analyzed = 0
  let done = 0
  opts.onProgress?.(0, chunks.length)

  await pool(chunks, opts.concurrency ?? 3, async (c, idx) => {
    const prompt = `下面是《${fileName}》的第 ${idx + 1}/${chunks.length} 部分${c.heading ? `（${c.heading}）` : ''}。
请提炼这一部分，返回 JSON：{"heading":"本部分标题","points":["要点，最多 8 条，每条不超过 60 字"],"entities":["关键概念/定理/算法，最多 8 个"]}
只输出 JSON。

${c.text}`
    try {
      const raw = await ask('你是考研资料整理助手，只输出 JSON。', prompt, 1200)
      const obj = parseObject(raw)
      if (obj) {
        sections[idx] = {
          heading: String(obj.heading || c.heading || `第 ${idx + 1} 部分`).slice(0, 60),
          points: Array.isArray(obj.points) ? obj.points.map(String).slice(0, 8) : [],
          entities: Array.isArray(obj.entities) ? obj.entities.map(String).slice(0, 8) : [],
        }
        analyzed += c.text.length
      }
    } catch (err: any) {
      console.warn('[doc-digest] map failed:', err?.message)
    }
    done++
    opts.onProgress?.(done, chunks.length)
  })

  const ok = sections.filter(Boolean)
  if (ok.length === 0) return null

  const outline = ok
    .map((s, i) => `${i + 1}. ${s.heading}\n${s.points.map(p => `  - ${p}`).join('\n')}`)
    .join('\n')
    .slice(0, 16000)
  const allEntities = [...new Set(ok.flatMap(s => s.entities))]

  let meta: any = null
  try {
    const raw = await ask(
      '你是考研知识库架构师，只输出 JSON。',
      `根据《${fileName}》各部分要点，给出整篇的归类信息。返回 JSON：
{"domain":"cs_408|math|general","subject":"具体学科，如 操作系统、高等数学","title":"规范的笔记标题","summary":"120 字以内的整篇导读","tags":["3-5 个层次标签，如 408/操作系统"],"entities":["整篇最核心的 5-10 个概念"]}

各部分要点：
${outline}

候选概念：${allEntities.slice(0, 60).join('、')}`,
      1200
    )
    meta = parseObject(raw)
  } catch (err: any) {
    console.warn('[doc-digest] reduce failed:', err?.message)
  }

  const domain = ['cs_408', 'math', 'general'].includes(meta?.domain) ? meta.domain : undefined
  return {
    domain,
    subject: typeof meta?.subject === 'string' ? meta.subject : undefined,
    title: typeof meta?.title === 'string' ? meta.title : undefined,
    summary: typeof meta?.summary === 'string' ? meta.summary : undefined,
    tags: Array.isArray(meta?.tags) ? meta.tags.map(String).slice(0, 6) : [],
    entities: Array.isArray(meta?.entities) && meta.entities.length ? meta.entities.map(String).slice(0, 10) : allEntities.slice(0, 10),
    sections: ok,
    analyzedChars: analyzed,
    totalChars: total,
  }
}

/** 生成放在原文前面的导读 Markdown */
export function renderDigest(d: DocDigest): string {
  const parts: string[] = ['> [!abstract] 整理导读']
  if (d.summary) parts.push(`> ${d.summary}`)
  if (d.sections.length > 1) {
    parts.push('>')
    for (const s of d.sections) {
      parts.push(`> **${s.heading}**`)
      for (const p of s.points.slice(0, 5)) parts.push(`> - ${p}`)
    }
  }
  if (d.analyzedChars < d.totalChars) {
    parts.push('>', `> 已分析 ${Math.round((d.analyzedChars / Math.max(1, d.totalChars)) * 100)}% 的内容，部分段落分析失败，原文已完整保留。`)
  }
  return parts.join('\n')
}
