import fs from 'fs'
import path from 'path'
import { config, anthropic, getNotes, invalidateCache, getAiClientForModel } from '../context.js'
import { createFile } from '../vault-parser.js'

export interface OrganizedWikiResult {
  title: string
  originalName: string
  savedPath: string
  wordCount: number
  domain: 'cs_408' | 'math' | 'general'
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
  domain: 'cs_408' | 'math'
  subject: string
  chapter?: string
  type: 'choice' | 'blank'
  difficulty: '简单' | '中等' | '困难'
  question: string
  options?: { A: string; B: string; C: string; D: string }
  answer: string
  explanation: string
  tags: string[]
}

/**
 * 稳健解析 AI 返回的 JSON 字符串（容错思考链、截断、代码块包裹）
 */
function robustParseAiJson(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') return null

  // 1. 去除首尾空白与 markdown 代码块标记
  let clean = rawText.trim()
  if (clean.startsWith('```json')) clean = clean.slice(7)
  else if (clean.startsWith('```')) clean = clean.slice(3)
  if (clean.endsWith('```')) clean = clean.slice(0, -3)
  clean = clean.trim()

  // 2. 尝试直接解析
  try {
    return JSON.parse(clean)
  } catch {}

  // 3. 正则查找第一个 { 到最后一个 }
  const firstBrace = clean.indexOf('{')
  const lastBrace = clean.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(clean.substring(firstBrace, lastBrace + 1))
    } catch {}
  }

  // 4. 尝试智能修复被截断的 JSON
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
  preferredDomain?: 'cs_408' | 'math' | 'general'
): Promise<OrganizedWikiResult> {
  const vaultPath = config.vaultPath
  const notes = getNotes()
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
      const prompt = `你是一个顶级知识库架构师与考研计算机408/考研数学教研专家（参考 AgriciDaniel/claude-obsidian 的自组织第二大脑架构）。
请研读以下从资料转换得到的 Markdown 内容，完成高质量的知识自组织提炼与题库沉淀。

【任务要求】：
1. 分析归类：
   - domain: "cs_408" | "math" | "general"
   - subject: 具体学科名称（如 "操作系统", "数据结构", "计算机组成原理", "计算机网络", "高等数学", "线性代数", "概率论与数理统计" 等）
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

  // 3. 智能领域/学科识别与保底数据填充
  let detectedDomain: 'cs_408' | 'math' | 'general' = aiData?.domain || preferredDomain
  let detectedSubject: string = aiData?.subject || ''

  const textToAnalyze = (baseName + ' ' + markdownContent.slice(0, 1500)).toLowerCase()

  if (!detectedDomain || detectedDomain === 'general') {
    if (
      textToAnalyze.includes('408') ||
      textToAnalyze.includes('计算机') ||
      textToAnalyze.includes('数据结构') ||
      textToAnalyze.includes('操作系统') ||
      textToAnalyze.includes('组成原理') ||
      textToAnalyze.includes('计网') ||
      textToAnalyze.includes('计组')
    ) {
      detectedDomain = 'cs_408'
    } else if (
      textToAnalyze.includes('数学') ||
      textToAnalyze.includes('高数') ||
      textToAnalyze.includes('线代') ||
      textToAnalyze.includes('概率') ||
      textToAnalyze.includes('微积分') ||
      textToAnalyze.includes('方浩')
    ) {
      detectedDomain = 'math'
    } else {
      detectedDomain = 'general'
    }
  }

  if (!detectedSubject || detectedSubject === '通用知识') {
    if (detectedDomain === 'math') {
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
  const tags: string[] = Array.isArray(aiData?.tags) && aiData.tags.length > 0
    ? aiData.tags
    : [detectedDomain === 'cs_408' ? '408' : detectedDomain === 'math' ? '考研数学' : '知识库', detectedSubject, '自动整理']
  const entities: string[] = Array.isArray(aiData?.entities) ? aiData.entities : []

  // 4. Wikilinks 双向链接自动匹配与织网
  const matchedWikilinks: string[] = []
  for (const ent of entities) {
    if (titleSet.has(ent.toLowerCase())) {
      matchedWikilinks.push(`[[${ent}]]`)
    }
  }
  // 也支持将文档中自然提及的前 5 个核心实体作为延伸链接
  const extraConceptLinks = entities
    .slice(0, 5)
    .filter(e => !matchedWikilinks.includes(`[[${e}]]`))
    .map(e => `[[${e}]]`)

  const allWikilinks = [...new Set([...matchedWikilinks, ...extraConceptLinks])]

  // 5. 确定存放目录（优先根据学科放入专业知识库，避免孤立）
  let targetDir = 'Ingested'
  if (detectedDomain === 'cs_408') {
    const candidates = [
      path.join('wiki', '02-408计算机', detectedSubject),
      path.join('wiki', detectedSubject),
      path.join('wiki', '02-408计算机'),
    ]
    for (const c of candidates) {
      if (fs.existsSync(path.resolve(vaultPath, c))) {
        targetDir = c
        break
      }
    }
  } else if (detectedDomain === 'math') {
    const candidates = [
      path.join('wiki', '01-考研数学', detectedSubject),
      path.join('wiki', detectedSubject),
      path.join('wiki', '01-考研数学'),
    ]
    for (const c of candidates) {
      if (fs.existsSync(path.resolve(vaultPath, c))) {
        targetDir = c
        break
      }
    }
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
        const item: QuizQuestionItem = {
          id: `quiz-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          domain: detectedDomain === 'math' ? 'math' : 'cs_408',
          subject: detectedSubject,
          chapter: finalTitle,
          type: q.type || 'choice',
          difficulty: q.difficulty || '中等',
          question: q.question,
          options: q.options || { A: '选项 A', B: '选项 B', C: '选项 C', D: '选项 D' },
          answer: q.answer || 'A',
          explanation: q.explanation || '自动命制题目精析',
          tags: Array.isArray(q.tags) ? q.tags : [detectedSubject, 'AI命题']
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
