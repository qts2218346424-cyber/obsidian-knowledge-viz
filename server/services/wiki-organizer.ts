import fs from 'fs'
import path from 'path'
import { config, anthropic, getNotes, invalidateCache, getAiClientForModel } from '../context.js'
import { createFile } from '../vault-parser.js'
import { safeJsonParseWithLatex } from '../utils/json-rescue.js'

export type WikiDomain = 'cs_408' | 'math' | 'politics' | 'english' | 'general'

export interface OrganizedWikiResult {
  title: string
  originalName: string
  savedPath: string
  wordCount: number
  domain: WikiDomain
  subject: string
  tags: string[]
  entities: string[]
  wikilinksCount: number
  wikilinks: string[]
  mocPath?: string
  questionsCount: number
  preview: string
  method: string
}

export interface QuizQuestionItem {
  id: string
  domain: WikiDomain
  subject: string
  chapter?: string
  type: 'choice' | 'multiple' | 'blank' | 'analysis'
  difficulty: '简单' | '中等' | '困难'
  passage?: string
  question: string
  options?: Record<string, string>
  answer: string
  explanation: string
  tags: string[]
}

/**
 * 稳健解析 AI 返回的 JSON 字符串（容错思考链、LaTeX 反斜杠碰撞、截断、代码块包裹）
 */
function robustParseAiJson(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') return null
  const parsed = safeJsonParseWithLatex(rawText)
  if (parsed) return parsed

  let clean = rawText.trim()
  if (clean.startsWith('```json')) clean = clean.slice(7)
  else if (clean.startsWith('```')) clean = clean.slice(3)
  if (clean.endsWith('```')) clean = clean.slice(0, -3)
  clean = clean.trim()

  const firstBrace = clean.indexOf('{')
  if (firstBrace !== -1) {
    let truncated = clean.substring(firstBrace)
    const quoteCount = (truncated.match(/(?<!\\)"/g) || []).length
    if (quoteCount % 2 !== 0) truncated += '"'

    const openCurlies = (truncated.match(/\{/g) || []).length
    const closeCurlies = (truncated.match(/\}/g) || []).length
    const openBrackets = (truncated.match(/\[/g) || []).length
    const closeBrackets = (truncated.match(/\]/g) || []).length

    for (let i = 0; i < openBrackets - closeBrackets; i++) truncated += ']'
    for (let i = 0; i < openCurlies - closeCurlies; i++) truncated += '}'

    try {
      return JSON.parse(truncated)
    } catch {}
  }

  return null
}

/**
 * 核心整理器：结合 Karpathy LLM-Wiki 与 AgriciDaniel/claude-obsidian 范式
 * 自动完成：知识提炼、双链图谱织网、MOC 自动挂载与做题库联动
 */
export async function organizeDocumentIntoWiki(
  markdownContent: string,
  originalFilename: string,
  preferredDomain?: WikiDomain,
  targetVaultPath?: string
): Promise<OrganizedWikiResult> {
  const vaultPath = targetVaultPath || config.vaultPath
  const notes = getNotes(vaultPath)
  const baseName = path.basename(originalFilename, path.extname(originalFilename))

  // 1. 整理现有笔记标题用于双向链接匹配
  const existingTitles = notes.map(n => n.title.trim()).filter(Boolean)
  const titleSet = new Set(existingTitles.map(t => t.toLowerCase()))

  // 2. 调用大模型进行深度自组织分析
  let aiData: any = null
  const aiTarget = getAiClientForModel()
  const client: any = aiTarget?.client || anthropic
  const modelName = aiTarget?.model || config.ai?.model || 'deepseek-v4-pro'

  if (client) {
    try {
      const excerpt = markdownContent.slice(0, 10000)
      const prompt = `你是一个顶级知识库架构师与全国考研全科（408计算机/考研数学/考研政治/考研英语）教研专家。
请研读以下从资料转换得到的 Markdown 内容，完成高质量的知识自组织提炼与题库沉淀。

【任务要求】：
1. 分析归类：
   - domain: "cs_408" | "math" | "politics" | "english" | "general"
   - subject: 具体学科名称（如 "操作系统", "数据结构", "计算机组成原理", "计算机网络", "高等数学", "线性代数", "概率论与数理统计", "马克思主义基本原理", "中国近现代史纲要", "毛泽东思想和中国特色社会主义理论体系概论", "习近平新时代中国特色社会主义思想概论", "思想道德与法治", "阅读理解", "完形填空", "英语写作" 等）
   - title: 规范且富有概括性的笔记名称（不用加扩展名）
   - tags: 3-5 个层次化标签（如 ["408/操作系统", "核心考点", "第二大脑整理"]）
   - entities: 提炼 5-10 个关键技术实体/定理/概念（用于 Obsidian [[双链]] 织网）
2. 深度重构规范笔记正文 (structuredNote)：
   - 必须是一篇条理清晰的高质量 Markdown 笔记
   - 包含：考点综述、核心原理与定理机制、图表/公式推导、典型考法避坑指南
3. 命制 2-3 道配套考研真题或自测题 (questions 数组)：
   - 每题包含: type ("choice" | "blank"), difficulty ("简单"|"中等"|"困难"), question (题干), options (选择题有 A,B,C,D), answer, explanation (解析), tags

【必须严格返回合法 JSON，格式如下】：
{
  "domain": "cs_408",
  "subject": "操作系统",
  "title": "...",
  "summary": "...",
  "tags": ["..."],
  "entities": ["..."],
  "questions": [
    {
      "type": "choice",
      "difficulty": "中等",
      "question": "...",
      "options": {"A":"...", "B":"...", "C":"...", "D":"..."},
      "answer": "A",
      "explanation": "...",
      "tags": ["..."]
    }
  ],
  "structuredNote": "..."
}

【原始文档内容】：
${excerpt}`

      const aiRes: any = await client.messages.create({
        model: modelName,
        max_tokens: 3000,
        system: '你是一个专业的知识库自组织管理系统，只输出纯 JSON，不要包含额外的闲聊或说明。',
        messages: [{ role: 'user', content: prompt }],
      })

      // 提取纯文本内容（兼容 DeepSeek Thinking 块）
      let rawText = ''
      if (Array.isArray(aiRes.content)) {
        const textBlock = aiRes.content.find((c: any) => c.type === 'text')
        if (textBlock && textBlock.text) rawText = textBlock.text
        else if (aiRes.content[0]?.text) rawText = aiRes.content[0].text
      } else if (typeof aiRes.content === 'string') {
        rawText = aiRes.content
      }

      aiData = robustParseAiJson(rawText)
    } catch (err: any) {
      console.warn('[Wiki Organizer AI Error]:', err.message)
    }
  }

  // 3. 智能领域/学科识别与保底数据填充（严格尊重用户指定学科，完整覆盖政治与英语）
  const validDomains = new Set(['cs_408', 'math', 'politics', 'english', 'general'])
  let detectedDomain: WikiDomain =
    preferredDomain && preferredDomain !== 'general'
      ? preferredDomain
      : validDomains.has(aiData?.domain)
        ? aiData.domain
        : 'general'
  let detectedSubject: string = aiData?.subject || ''

  const textToAnalyze = (baseName + ' ' + markdownContent.slice(0, 1800)).toLowerCase()

  if (!detectedDomain || detectedDomain === 'general') {
    if (
      /政治|马原|辩证法|唯物|剩余价值|毛中特|习思想|新思想|中国式现代化|史纲|鸦片战争|辛亥革命|思修|肖秀荣|肖四|肖八|腿姐|徐涛/.test(
        textToAnalyze
      )
    ) {
      detectedDomain = 'politics'
    } else if (
      /考研英语|英语一|英语二|reading comprehension|cloze|完形填空|阅读理解|长难句|新题型|英译汉|图画作文|图表作文|黄皮书/.test(
        textToAnalyze
      )
    ) {
      detectedDomain = 'english'
    } else if (
      /408|计算机|数据结构|操作系统|组成原理|计网|计组/.test(textToAnalyze)
    ) {
      detectedDomain = 'cs_408'
    } else if (
      /数学|高数|线代|概率|微积分|方浩|张宇|李林/.test(textToAnalyze)
    ) {
      detectedDomain = 'math'
    } else {
      detectedDomain = 'general'
    }
  }

  if (!detectedSubject || detectedSubject === '通用知识') {
    if (detectedDomain === 'politics') {
      if (/史纲|鸦片战争|辛亥革命|五四|抗日|遵义/.test(textToAnalyze)) detectedSubject = '中国近现代史纲要'
      else if (/马原|唯物|辩证法|剩余价值|认识论/.test(textToAnalyze)) detectedSubject = '马克思主义基本原理'
      else if (/习思想|新思想|中国式现代化|新质生产力/.test(textToAnalyze)) detectedSubject = '习近平新时代中国特色社会主义思想概论'
      else if (/毛中特|毛泽东思想|三大改造|邓小平/.test(textToAnalyze)) detectedSubject = '毛泽东思想和中国特色社会主义理论体系概论'
      else if (/思修|法治|道德|宪法/.test(textToAnalyze)) detectedSubject = '思想道德与法治'
      else detectedSubject = '考研政治综合'
    } else if (detectedDomain === 'english') {
      if (/作文|writing|essay/.test(textToAnalyze)) detectedSubject = '英语写作'
      else if (/完形|cloze/.test(textToAnalyze)) detectedSubject = '完形填空'
      else if (/翻译|translation/.test(textToAnalyze)) detectedSubject = '英译汉翻译'
      else if (/新题型|七选五/.test(textToAnalyze)) detectedSubject = '新题型'
      else detectedSubject = '阅读理解'
    } else if (detectedDomain === 'math') {
      if (textToAnalyze.includes('概率') || textToAnalyze.includes('数理统计') || textToAnalyze.includes('随机变量')) {
        detectedSubject = '概率论与数理统计'
      } else if (textToAnalyze.includes('线代') || textToAnalyze.includes('线性代数') || textToAnalyze.includes('矩阵') || textToAnalyze.includes('特征值')) {
        detectedSubject = '线性代数'
      } else {
        detectedSubject = '高等数学'
      }
    } else if (detectedDomain === 'cs_408') {
      if (textToAnalyze.includes('数据结构') || textToAnalyze.includes('二叉树') || textToAnalyze.includes('排序') || textToAnalyze.includes('散列')) {
        detectedSubject = '数据结构'
      } else if (textToAnalyze.includes('计网') || textToAnalyze.includes('网络') || textToAnalyze.includes('tcp') || textToAnalyze.includes('ip')) {
        detectedSubject = '计算机网络'
      } else if (textToAnalyze.includes('计组') || textToAnalyze.includes('组成原理') || textToAnalyze.includes('cpu') || textToAnalyze.includes('指令流水线') || textToAnalyze.includes('cache')) {
        detectedSubject = '计算机组成原理'
      } else {
        detectedSubject = '操作系统'
      }
    } else {
      detectedSubject = '通用知识'
    }
  }

  let finalTitle = (aiData?.title || baseName).replace(/_\d+_\d+$/, '').replace(/[\\/:*?"<>|]/g, '_').trim()
  if (!finalTitle) finalTitle = baseName
  const domainTagLabel =
    detectedDomain === 'cs_408'
      ? '408'
      : detectedDomain === 'math'
        ? '考研数学'
        : detectedDomain === 'politics'
          ? '考研政治'
          : detectedDomain === 'english'
            ? '考研英语'
            : '知识库'
  const tags: string[] = Array.isArray(aiData?.tags) && aiData.tags.length > 0
    ? aiData.tags
    : [domainTagLabel, detectedSubject, '自动整理']
  const entities: string[] = Array.isArray(aiData?.entities) ? aiData.entities : []

  // 4. Wikilinks 双向链接自动匹配与织网
  const matchedWikilinks: string[] = []
  for (const ent of entities) {
    if (titleSet.has(ent.toLowerCase())) {
      matchedWikilinks.push(`[[${ent}]]`)
    }
  }
  const extraConceptLinks = entities
    .slice(0, 5)
    .filter(e => !matchedWikilinks.includes(`[[${e}]]`))
    .map(e => `[[${e}]]`)

  const allWikilinks = [...new Set([...matchedWikilinks, ...extraConceptLinks])]

  // 5. 确定存放目录（优先根据学科放入专业知识库，避免孤立）
  let targetDir = 'Ingested'
  if (detectedDomain === 'cs_408') {
    targetDir = path.join('wiki', '02-408计算机', detectedSubject)
  } else if (detectedDomain === 'math') {
    targetDir = path.join('wiki', '01-考研数学', detectedSubject)
  } else if (detectedDomain === 'english') {
    targetDir = path.join('wiki', '03-考研英语', detectedSubject)
  } else if (detectedDomain === 'politics') {
    targetDir = path.join('wiki', '04-考研政治', detectedSubject)
  }

  const fullTargetDir = path.resolve(vaultPath, targetDir)
  if (!fs.existsSync(fullTargetDir)) {
    fs.mkdirSync(fullTargetDir, { recursive: true })
  }

  // 6. 组装规范 Frontmatter 与笔记内容
  const frontmatter: Record<string, any> = {
    title: finalTitle,
    aliases: [baseName],
    domain: detectedDomain,
    subject: detectedSubject,
    tags,
    created: new Date().toISOString().split('T')[0],
    source_file: originalFilename,
    status: 'auto_organized',
    organizer: 'claude_obsidian_engine',
  }

  let noteBody = aiData?.structuredNote || markdownContent
  if (allWikilinks.length > 0) {
    noteBody += `\n\n---\n## 🔗 知识图谱关联网络 (Self-Organizing Links)\n`
    noteBody += `*本笔记已由自动化整理引擎自动建立双向链接*\n\n`
    noteBody += allWikilinks.map(link => `- ${link}`).join('\n') + '\n'
  }

  // 7. 保存笔记到 Vault
  let finalRelPath = path.join(targetDir, `${finalTitle}.md`).replace(/\\/g, '/')
  let counter = 1
  while (fs.existsSync(path.resolve(vaultPath, finalRelPath))) {
    finalRelPath = path.join(targetDir, `${finalTitle}_${counter}.md`).replace(/\\/g, '/')
    counter++
  }

  const note = createFile(vaultPath, finalRelPath, noteBody, frontmatter)

  // 8. MOC (Map of Content 内容地图) 自动挂载更新
  let matchedMocPath = ''
  try {
    const possibleMocs = [
      path.join(fullTargetDir, '_index.md'),
      path.join(fullTargetDir, '00-目录_MOC.md'),
      path.join(path.dirname(fullTargetDir), '_index.md'),
    ]
    for (const moc of possibleMocs) {
      if (fs.existsSync(moc)) {
        const mocContent = fs.readFileSync(moc, 'utf-8')
        const noteWikilink = `[[${path.basename(finalRelPath, '.md')}]]`
        if (!mocContent.includes(noteWikilink)) {
          const appendLine = `\n- ${noteWikilink} · *${(aiData?.summary || '自动摄取精讲').slice(0, 40)}* (${new Date().toISOString().split('T')[0]})\n`
          fs.appendFileSync(moc, appendLine, 'utf-8')
          matchedMocPath = path.relative(vaultPath, moc).replace(/\\/g, '/')
        }
        break
      }
    }
  } catch (mocErr: any) {
    console.warn('[MOC hook error]:', mocErr.message)
  }

  // 9. 做题题库联动沉淀（写入 custom-questions.json）
  let questionsCount = 0
  if (Array.isArray(aiData?.questions) && aiData.questions.length > 0) {
    try {
      const questionsFile = path.resolve(vaultPath, '做题记录', 'custom-questions.json')
      let customQuestions: QuizQuestionItem[] = []
      if (fs.existsSync(questionsFile)) {
        try {
          const raw = fs.readFileSync(questionsFile, 'utf-8')
          customQuestions = JSON.parse(raw)
        } catch {
          customQuestions = []
        }
      }

      for (const q of aiData.questions) {
        if (!q.question) continue
        const rawAns = String(q.answer || '待核对').trim()
        const isMulti = q.type === 'multiple' || /^[A-F]{2,6}$/i.test(rawAns)
        const item: QuizQuestionItem = {
          id: `quiz-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          domain: detectedDomain,
          subject: detectedSubject,
          chapter: finalTitle,
          type: isMulti ? 'multiple' : (q.type || (q.options ? 'choice' : 'analysis')),
          difficulty: q.difficulty || '中等',
          ...(q.passage ? { passage: String(q.passage) } : {}),
          question: q.question,
          ...(q.options ? { options: q.options } : {}),
          answer: rawAns,
          explanation: q.explanation || '自动提炼题目精析',
          tags: Array.isArray(q.tags) ? q.tags : [detectedSubject, '资料提炼']
        }
        customQuestions.push(item)
        questionsCount++
      }

      const qDir = path.dirname(questionsFile)
      if (!fs.existsSync(qDir)) fs.mkdirSync(qDir, { recursive: true })
      fs.writeFileSync(questionsFile, JSON.stringify(customQuestions, null, 2), 'utf-8')
    } catch (qErr: any) {
      console.warn('[Save custom questions error]:', qErr.message)
    }
  }

  // 10. 缓存失效，实时通知整个系统
  invalidateCache()

  return {
    title: finalTitle,
    originalName: originalFilename,
    savedPath: note.path,
    wordCount: note.wordCount,
    domain: detectedDomain,
    subject: detectedSubject,
    tags,
    entities,
    wikilinksCount: allWikilinks.length,
    wikilinks: allWikilinks,
    mocPath: matchedMocPath || undefined,
    questionsCount,
    preview: noteBody.slice(0, 500),
    method: 'microsoft_markitdown + claude_obsidian_engine'
  }
}
