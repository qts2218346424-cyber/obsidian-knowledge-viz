import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {
  config,
  anthropic,
  getNotes,
  invalidateCache,
  markSelfWrite,
  __dirname,
} from '../context.js'
import { getFile, createFile, updateFile, type VaultNote } from '../vault-parser.js'

export const studyRouter = Router()

// ===== Flashcards =====

studyRouter.post('/study/flashcards', async (req, res) => {
  try {
    const { notePath } = req.body as { notePath: string }
    if (!notePath) {
      res.status(400).json({ error: 'Missing notePath' })
      return
    }

    const note = getFile(config.vaultPath, notePath)
    if (!note) {
      res.status(404).json({ error: 'Note not found' })
      return
    }

    if (!anthropic) {
      const lines = note.content.split('\n')
      const cards: { q: string; a: string }[] = []
      for (const line of lines) {
        const hMatch = line.match(/^#{1,3}\s+(.+)$/)
        if (hMatch && cards.length < 8) {
          const idx = lines.indexOf(line)
          const answerLines: string[] = []
          for (let j = idx + 1; j < lines.length && !lines[j].match(/^#{1,3}\s/) && answerLines.length < 4; j++) {
            if (lines[j].trim()) answerLines.push(lines[j].trim())
          }
          if (answerLines.length > 0) {
            cards.push({ q: `${hMatch[1]}是什么？`, a: answerLines.join('\n') })
          }
        }
      }
      res.json({
        flashcards: cards.length > 0 ? cards : [{ q: `关于${note.title}的核心要点`, a: note.content.substring(0, 200) }],
        notePath,
        noteTitle: note.title,
      })
      return
    }

    const prompt = `请根据以下笔记内容生成 8 张复习卡片（问答对）。
要求：
1. 问题要覆盖核心概念和关键细节
2. 答案要简洁准确，适合快速复习
3. 问题类型包括：概念解释、对比分析、应用场景、公式推导
4. 使用中文，数学公式请使用 LaTeX（如 $...$ 或 $$...$$）

严格返回 JSON 数组格式（不要代码块包裹）：
[{"q": "问题1", "a": "答案1"}, {"q": "问题2", "a": "答案2"}]

笔记标题: ${note.title}
笔记内容:
${note.content.substring(0, 4000)}`

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 2048,
      system: '你是一个知识库复习助手，只返回 JSON 格式的问答对数组。',
      messages: [{ role: 'user', content: prompt }],
    })

    let flashcards: { q: string; a: string }[] = []
    if (aiRes.content[0].type === 'text') {
      const text = aiRes.content[0].text.trim()
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0])
      }
    }

    res.json({ flashcards, notePath, noteTitle: note.title })
  } catch (err: any) {
    console.error('Flashcard error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== Review Due =====

studyRouter.get('/study/review-due', (_req, res) => {
  try {
    const notes = getNotes()
    const now = Date.now()
    const intervals = [
      { days: 14, label: '14天未复习', priority: 'low' as const },
      { days: 7, label: '7天未复习', priority: 'medium' as const },
      { days: 3, label: '3天未复习', priority: 'high' as const },
    ]

    const skipCategories = new Set(['wiki', '元数据', '模板', 'template', 'meta', 'config', '.obsidian', '.obsidian-viz', '做题记录', '单词本'])

    const getCategory = (notePath: string): string => {
      const parts = notePath.replace(/\\/g, '/').split('/')
      if (parts.length === 1) return '其他'
      const first = parts[0].toLowerCase()
      if (skipCategories.has(first) && parts.length > 2) return parts[1]
      if (skipCategories.has(first)) return '其他'
      return parts[0]
    }

    const shouldSkip = (note: VaultNote) => {
      const pathLower = note.path.toLowerCase()
      const fileName = pathLower.split('/').pop() || ''

      if (fileName.includes('_index')) return true

      const skipDirs = ['元数据', '模板', 'template', 'meta', 'config', '.obsidian']
      if (skipDirs.some(d => pathLower.includes(`/${d}/`))) return true

      const skipFiles = ['claude.md', 'hot.md', 'overview.md', 'log.md', 'readme.md', 'todo.md']
      if (skipFiles.some(f => fileName === f)) return true

      if (note.wordCount < 80) return true

      const tagsLower = note.tags.map(t => t.toLowerCase())
      if (tagsLower.some(t => t.includes('template') || t.includes('模板') || t === 'meta' || t === '元数据')) return true

      return false
    }

    const categoryNotes: Record<string, { due: any[]; total: number; totalWords: number; lastModified: string }> = {}

    for (const note of notes) {
      if (shouldSkip(note)) continue

      const modTime = new Date(note.modified).getTime()
      const daysSince = Math.floor((now - modTime) / (1000 * 60 * 60 * 24))
      const category = getCategory(note.path)

      if (!categoryNotes[category]) {
        categoryNotes[category] = { due: [], total: 0, totalWords: 0, lastModified: '' }
      }

      categoryNotes[category].total++
      categoryNotes[category].totalWords += note.wordCount
      if (!categoryNotes[category].lastModified || note.modified > categoryNotes[category].lastModified) {
        categoryNotes[category].lastModified = note.modified
      }

      for (const interval of intervals) {
        if (daysSince >= interval.days) {
          categoryNotes[category].due.push({
            path: note.path,
            title: note.title,
            tags: note.tags,
            daysSinceModified: daysSince,
            priority: interval.priority,
            interval: interval.label,
            wordCount: note.wordCount,
          })
          break
        }
      }
    }

    const reviewQueue = Object.entries(categoryNotes).map(([category, data]) => ({
      subject: category,
      totalNotes: data.total,
      totalWords: data.totalWords,
      lastModified: data.lastModified,
      dueCount: data.due.length,
      dueNotes: data.due.sort((a: any, b: any) => b.daysSinceModified - a.daysSinceModified).slice(0, 10),
    })).filter(s => s.totalNotes > 0).sort((a, b) => b.totalNotes - a.totalNotes)

    const stats = Object.entries(categoryNotes).map(([category, data]) => ({
      subject: category,
      totalNotes: data.total,
      totalWords: data.totalWords,
      lastModified: data.lastModified,
    })).filter(s => s.totalNotes > 0).sort((a, b) => b.totalNotes - a.totalNotes)

    res.json({ reviewQueue, stats })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Daily Error Log (错题本) =====

function getErrorLogDir() {
  return '错题本'
}

function parseErrorLog(content: string): { questions: any[]; meta: Record<string, any> } {
  const { data: meta, content: body } = matter(content)
  const questions: any[] = []
  const blocks = body.split(/^## 错题 \d+/m).filter(Boolean)
  for (const block of blocks) {
    const q: Record<string, string> = {}
    const fieldMap: Record<string, string> = {
      '来源笔记': 'source',
      '题目': 'question',
      '你的回答': 'userAnswer',
      '正确答案': 'correctAnswer',
      '解析': 'explanation',
      '复习次数': 'reviewCount',
      '下次复习': 'nextReview',
    }
    for (const line of block.split('\n')) {
      for (const [cn, en] of Object.entries(fieldMap)) {
        const match = line.match(new RegExp(`\\*\\*${cn}\\*\\*[:：]\\s*(.+)`))
        if (match) q[en] = match[1].trim()
      }
    }
    if (q.question) questions.push(q)
  }
  return { questions, meta }
}

function buildErrorLog(date: string, questions: any[]): string {
  let content = `---\ndate: ${date}\ntype: error-log\n---\n\n`
  questions.forEach((q, i) => {
    content += `## 错题 ${i + 1}\n`
    content += `- **来源笔记**: ${q.source || ''}\n`
    content += `- **题目**: ${q.question}\n`
    content += `- **你的回答**: ${q.userAnswer || ''}\n`
    content += `- **正确答案**: ${q.correctAnswer}\n`
    content += `- **解析**: ${q.explanation || ''}\n`
    content += `- **复习次数**: ${q.reviewCount || '0'}\n`
    content += `- **下次复习**: ${q.nextReview || ''}\n\n`
  })
  return content
}

studyRouter.post('/study/error-log', async (req, res) => {
  try {
    const { notePath, question, userAnswer, correctAnswer, explanation } = req.body as {
      notePath: string
      question: string
      userAnswer?: string
      correctAnswer: string
      explanation?: string
    }
    if (!question || !correctAnswer) {
      res.status(400).json({ error: 'Missing question or correctAnswer' })
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const logPath = `${getErrorLogDir()}/${today}.md`
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    const newQ = {
      source: notePath || '',
      question,
      userAnswer: userAnswer || '',
      correctAnswer,
      explanation: explanation || '',
      reviewCount: '0',
      nextReview: tomorrow,
    }

    let questions: any[] = []
    try {
      const existing = getFile(config.vaultPath, logPath)
      if (existing) {
        const parsed = parseErrorLog(existing.content)
        questions = parsed.questions
      }
    } catch {
      // no existing file
    }

    questions.push(newQ)
    const content = buildErrorLog(today, questions)
    const fm = { date: today, type: 'error-log' }

    try {
      updateFile(config.vaultPath, logPath, content, fm)
    } catch {
      createFile(config.vaultPath, logPath, content, fm)
    }
    markSelfWrite(logPath)
    invalidateCache()

    res.json({ ok: true, path: logPath, totalQuestions: questions.length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

studyRouter.get('/study/error-log', (req, res) => {
  try {
    const date = String(req.query.date || new Date().toISOString().split('T')[0])
    const logPath = `${getErrorLogDir()}/${date}.md`
    try {
      const file = getFile(config.vaultPath, logPath)
      if (file) {
        const parsed = parseErrorLog(file.content)
        res.json({ date, questions: parsed.questions, path: logPath })
        return
      }
    } catch {
      // file not found
    }
    res.json({ date, questions: [], path: logPath })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

studyRouter.get('/study/daily-review', (_req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0]
    const errorDir = path.resolve(config.vaultPath, getErrorLogDir())
    const allQuestions: any[] = []

    if (fs.existsSync(errorDir)) {
      const files = fs.readdirSync(errorDir).filter(f => f.endsWith('.md'))
      for (const file of files) {
        try {
          const fullPath = path.join(errorDir, file)
          const raw = fs.readFileSync(fullPath, 'utf-8')
          const parsed = parseErrorLog(raw)
          for (const q of parsed.questions) {
            q._sourceFile = file
            allQuestions.push(q)
          }
        } catch {
          // skip bad files
        }
      }
    }

    const dueQuestions = allQuestions.filter(q => {
      if (!q.nextReview) return true
      return q.nextReview <= todayStr
    })

    const totalQuestions = allQuestions.length
    const masteredCount = allQuestions.filter(q => parseInt(q.reviewCount || '0') >= 3).length
    const dueCount = dueQuestions.length

    // Subject distribution (supporting 408 and Math)
    const subjectMap: Record<string, string[]> = {
      '数据结构': ['数据结构', 'data-structure', 'ds', '算法', '链表', '树', '图', '排序'],
      '计算机组成': ['计算机组成', '计组', 'computer-organization', 'co', 'cpu', '存储器'],
      '计算机网络': ['计算机网络', '网络', 'network', 'tcp', 'ip', 'http', '路由'],
      '操作系统': ['操作系统', 'os', 'operating-system', '进程', '线程', '内存'],
      '高等数学': ['高等数学', '高数', '极限', '微积分', '导数', '积分', '微分方程', '级数'],
      '线性代数': ['线性代数', '线代', '矩阵', '行列式', '向量', '特征值', '二次型'],
      '概率统计': ['概率论', '概率统计', '随机变量', '期望', '方差', '参数估计', '正态分布'],
    }
    const subjectCounts: Record<string, number> = {
      '数据结构': 0,
      '计算机组成': 0,
      '计算机网络': 0,
      '操作系统': 0,
      '高等数学': 0,
      '线性代数': 0,
      '概率统计': 0,
      '其他': 0,
    }
    for (const q of allQuestions) {
      const src = (q.source || '').toLowerCase()
      let found = false
      for (const [subj, keywords] of Object.entries(subjectMap)) {
        if (keywords.some(k => src.includes(k))) {
          subjectCounts[subj]++
          found = true
          break
        }
      }
      if (!found) subjectCounts['其他']++
    }

    res.json({
      date: todayStr,
      dueQuestions: dueQuestions.slice(0, 30),
      generatedQuestions: [],
      stats: {
        totalQuestions,
        masteredCount,
        dueCount,
        subjectCounts,
        streakDays: 0,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

studyRouter.post('/study/review-complete', (req, res) => {
  try {
    const { date, questionIndex, result } = req.body as {
      date: string
      questionIndex: number
      result: 'mastered' | 'hard' | 'easy'
    }
    if (!date) {
      res.status(400).json({ error: 'Missing date' })
      return
    }

    const logPath = `${getErrorLogDir()}/${date}.md`
    try {
      const file = getFile(config.vaultPath, logPath)
      if (!file) {
        res.status(404).json({ error: 'Log not found' })
        return
      }

      const parsed = parseErrorLog(file.content)
      if (questionIndex >= 0 && questionIndex < parsed.questions.length) {
        const q = parsed.questions[questionIndex]
        const count = parseInt(q.reviewCount || '0') + 1
        q.reviewCount = String(count)

        const days = result === 'mastered' ? 14 : result === 'easy' ? 7 : 1
        const next = new Date(Date.now() + days * 86400000).toISOString().split('T')[0]
        q.nextReview = next

        const content = buildErrorLog(date, parsed.questions)
        updateFile(config.vaultPath, logPath, content, { date, type: 'error-log' })
        markSelfWrite(logPath)
        invalidateCache()
      }

      res.json({ ok: true })
    } catch {
      res.status(404).json({ error: 'Log not found' })
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Vocabulary =====

interface VocabProgress {
  status: 'known' | 'fuzzy' | 'unknown' | 'new'
  nextReview: string
  reviews: number
  addedDate: string
}

function loadVocabPool(): Array<{
  word: string
  phonetic: string
  definition: string
  example: string
  exampleCn: string
  frequency: string
  unit: number
  roots?: string
  synonyms?: string
}> {
  const items: any[] = []
  const objRegex = /\{\s*word:\s*'([^']*)'[\s,]*phonetic:\s*'([^']*)'[\s,]*definition:\s*'([^']*)'[\s,]*example:\s*'([^']*)'[\s,]*exampleCn:\s*'([^']*)'[\s,]*frequency:\s*'([^']*)'[\s,]*unit:\s*(\d+)(?:[\s,]*roots?:\s*'([^']*)')?(?:[\s,]*synonyms?:\s*'([^']*)')?[\s,]*\}/g
  for (let i = 1; i <= 4; i++) {
    try {
      const fp = path.join(__dirname, '..', 'src', 'data', `vocab-part${i}.ts`)
      if (!fs.existsSync(fp)) continue
      const content = fs.readFileSync(fp, 'utf-8')
      const arrayMatch = content.match(/VOCAB_PART\d.*?=\s*\[([\s\S]*)\]/)
      if (!arrayMatch) continue
      let match
      while ((match = objRegex.exec(arrayMatch[1])) !== null) {
        items.push({
          word: match[1],
          phonetic: match[2],
          definition: match[3],
          example: match[4],
          exampleCn: match[5],
          frequency: match[6],
          unit: parseInt(match[7]),
          roots: match[8] || undefined,
          synonyms: match[9] || undefined,
        })
      }
      objRegex.lastIndex = 0
    } catch {
      // skip failed part
    }
  }
  if (items.length > 0) return items
  return [
    { word: 'analyze', phonetic: '/ˈænəlaɪz/', definition: '分析', example: 'We need to analyze the data.', exampleCn: '我们需要分析数据。', frequency: '高频', unit: 1 },
    { word: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', definition: '重要的；显著的', example: 'A significant difference.', exampleCn: '一个显著的差异。', frequency: '高频', unit: 1 },
  ]
}

const VOCAB_POOL = loadVocabPool()

function getVocabProgressPath() {
  return '单词本/progress.md'
}

function readVocabProgress(): Record<string, VocabProgress> {
  try {
    const file = getFile(config.vaultPath, getVocabProgressPath())
    if (!file) return {}
    const { content: body } = matter(file.content)
    const jsonMatch = body.match(/```json\s*([\s\S]*?)```/)
    if (jsonMatch) return JSON.parse(jsonMatch[1])
    return JSON.parse(body.trim())
  } catch {
    return {}
  }
}

function writeVocabProgress(progress: Record<string, VocabProgress>) {
  const todayStr = new Date().toISOString().split('T')[0]
  const content = `---\ntype: vocab-progress\nupdated: '${todayStr}'\n---\n\n\`\`\`json\n${JSON.stringify(progress, null, 2)}\n\`\`\`\n`
  const vocabPath = getVocabProgressPath()
  try {
    updateFile(config.vaultPath, vocabPath, content, { type: 'vocab-progress', updated: todayStr })
  } catch {
    createFile(config.vaultPath, vocabPath, content, { type: 'vocab-progress', updated: todayStr })
  }
  markSelfWrite(vocabPath)
  invalidateCache()
}

studyRouter.get('/study/vocabulary', (_req, res) => {
  try {
    let progress = readVocabProgress()
    const todayStr = new Date().toISOString().split('T')[0]
    let learnedWords = Object.keys(progress)
    let existingSet = new Set(learnedWords.map(w => w.toLowerCase()))

    let dueWords = learnedWords.filter(w => {
      const p = progress[w]
      return !p.nextReview || p.nextReview <= todayStr
    })

    const DAILY_TARGET = 20
    let autoAdded = 0
    if (dueWords.length < DAILY_TARGET) {
      const needed = DAILY_TARGET - dueWords.length
      const newWords = VOCAB_POOL
        .filter(w => !existingSet.has(w.word.toLowerCase()))
        .slice(0, needed)

      if (newWords.length > 0) {
        for (const entry of newWords) {
          progress[entry.word] = {
            status: 'new',
            nextReview: todayStr,
            reviews: 0,
            addedDate: todayStr,
          }
          existingSet.add(entry.word.toLowerCase())
          autoAdded++
        }
        writeVocabProgress(progress)

        learnedWords = Object.keys(progress)
        dueWords = learnedWords.filter(w => {
          const p = progress[w]
          return !p.nextReview || p.nextReview <= todayStr
        })
      }
    }

    const dueRecords = dueWords.slice(0, 30).map(w => {
      const entry = VOCAB_POOL.find(e => e.word.toLowerCase() === w.toLowerCase())
      const p = progress[w]
      return {
        word: entry?.word || w,
        phonetic: entry?.phonetic || '',
        definition: entry?.definition || '',
        example: entry?.example || '',
        exampleCn: entry?.exampleCn || '',
        frequency: entry?.frequency || '中频',
        unit: entry?.unit || 0,
        reviews: p.reviews,
        nextReview: p.nextReview,
      }
    })

    const suggested = VOCAB_POOL
      .filter(w => !existingSet.has(w.word.toLowerCase()))
      .slice(0, 15)
      .map(w => ({
        word: w.word,
        definition: w.definition,
        phonetic: w.phonetic,
        example: w.example,
        frequency: w.frequency,
        unit: w.unit,
      }))

    const mastered = learnedWords.filter(w => progress[w].reviews >= 5).length
    const learning = learnedWords.filter(w => progress[w].reviews > 0 && progress[w].reviews < 5).length
    const newWords = learnedWords.filter(w => progress[w].reviews === 0).length

    res.json({
      totalWords: learnedWords.length,
      dueWords: dueWords.length,
      dueRecords,
      suggested,
      autoAdded,
      stats: { mastered, learning, newWords },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

studyRouter.post('/study/vocabulary/add', (req, res) => {
  try {
    const { words } = req.body as { words: Array<{ word: string; definition: string; phonetic?: string }> }
    if (!words || !words.length) {
      res.status(400).json({ error: 'No words provided' })
      return
    }

    const progress = readVocabProgress()
    const todayStr = new Date().toISOString().split('T')[0]
    let addedCount = 0

    for (const w of words) {
      const key = w.word.toLowerCase()
      if (!progress[key]) {
        progress[w.word] = { status: 'new', nextReview: todayStr, reviews: 0, addedDate: todayStr }
        addedCount++
      }
    }

    writeVocabProgress(progress)
    res.json({ ok: true, added: addedCount, total: Object.keys(progress).length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

studyRouter.post('/study/vocabulary/review', (req, res) => {
  try {
    const { word, result } = req.body as { word: string; result: 'known' | 'fuzzy' | 'unknown' }
    if (!word) {
      res.status(400).json({ error: 'Missing word' })
      return
    }

    const progress = readVocabProgress()
    const key = Object.keys(progress).find(k => k.toLowerCase() === word.toLowerCase())
    if (!key) {
      res.status(404).json({ error: 'Word not found in progress' })
      return
    }

    progress[key].reviews++
    progress[key].status = result
    const days = result === 'known' ? 7 : result === 'fuzzy' ? 3 : 1
    progress[key].nextReview = new Date(Date.now() + days * 86400000).toISOString().split('T')[0]

    writeVocabProgress(progress)
    res.json({ ok: true, word, reviewCount: progress[key].reviews, nextReview: progress[key].nextReview })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

studyRouter.post('/study/vocabulary/generate', (req, res) => {
  try {
    const { unit, frequency } = req.body as { unit?: number; frequency?: string }
    const progress = readVocabProgress()
    const existingSet = new Set(Object.keys(progress).map(w => w.toLowerCase()))

    let filtered = VOCAB_POOL.filter(w => !existingSet.has(w.word.toLowerCase()))
    if (unit) filtered = filtered.filter(w => w.unit === unit)
    if (frequency) filtered = filtered.filter(w => w.frequency === frequency)

    const words = filtered.slice(0, 20).map(w => ({
      word: w.word,
      definition: w.definition,
      phonetic: w.phonetic,
      example: w.example,
      exampleCn: w.exampleCn,
      frequency: w.frequency,
      unit: w.unit,
    }))

    res.json({ words })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Vocab Extended APIs =====

studyRouter.get('/vocab/all', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const size = Math.min(parseInt(req.query.size as string) || 50, 200)
    const unitFilter = req.query.unit ? parseInt(req.query.unit as string) : null
    const freqFilter = (req.query.frequency as string) || null
    const statusFilter = (req.query.status as string) || null
    const search = ((req.query.search as string) || '').toLowerCase().trim()

    const progress = readVocabProgress()

    let pool = [...VOCAB_POOL]

    if (unitFilter) pool = pool.filter(w => w.unit === unitFilter)
    if (freqFilter) pool = pool.filter(w => w.frequency === freqFilter)
    if (search) {
      pool = pool.filter(w =>
        w.word.toLowerCase().includes(search) || w.definition.toLowerCase().includes(search)
      )
    }
    if (statusFilter) {
      pool = pool.filter(w => {
        const key = w.word.toLowerCase()
        const hasProgress = progress[w.word] || progress[key]
        if (statusFilter === 'notAdded') return !hasProgress
        if (!hasProgress) return false
        if (statusFilter === 'mastered') return hasProgress.reviews >= 5
        if (statusFilter === 'learning') return hasProgress.reviews > 0 && hasProgress.reviews < 5
        if (statusFilter === 'newWords') return hasProgress.reviews === 0
        return true
      })
    }

    const total = pool.length
    const start = (page - 1) * size
    const pagePool = pool.slice(start, start + size)

    const words = pagePool.map(w => {
      const p = progress[w.word] || progress[w.word.toLowerCase()]
      return {
        word: w.word,
        phonetic: w.phonetic,
        definition: w.definition,
        example: w.example,
        exampleCn: w.exampleCn,
        frequency: w.frequency,
        unit: w.unit,
        roots: (w as any).roots,
        synonyms: (w as any).synonyms,
        progress: p ? { status: p.status, reviews: p.reviews, nextReview: p.nextReview } : null,
      }
    })

    const units = [...new Set(VOCAB_POOL.map(w => w.unit))].sort((a, b) => a - b)
    const allLearned = Object.keys(progress)
    const mastered = allLearned.filter(w => progress[w].reviews >= 5).length
    const learning = allLearned.filter(w => progress[w].reviews > 0 && progress[w].reviews < 5).length
    const newWords = allLearned.filter(w => progress[w].reviews === 0).length

    res.json({
      words,
      total,
      page,
      size,
      units,
      stats: { total: VOCAB_POOL.length, mastered, learning, newWords, notAdded: VOCAB_POOL.length - allLearned.length },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

studyRouter.get('/vocab/stats', (_req, res) => {
  try {
    const progress = readVocabProgress()
    const units = [...new Set(VOCAB_POOL.map(w => w.unit))].sort((a, b) => a - b)

    const unitProgress = units.map(unit => {
      const unitWords = VOCAB_POOL.filter(w => w.unit === unit)
      let mastered = 0, learning = 0, newWords = 0, notAdded = 0
      for (const w of unitWords) {
        const p = progress[w.word] || progress[w.word.toLowerCase()]
        if (!p) { notAdded++; continue }
        if (p.reviews >= 5) mastered++
        else if (p.reviews > 0) learning++
        else newWords++
      }
      return { unit, total: unitWords.length, mastered, learning, newWords, notAdded }
    })

    const freqDist: Record<string, { total: number; mastered: number; learning: number; newWords: number; notAdded: number }> = {}
    for (const freq of ['高频', '中频', '低频']) {
      const words = VOCAB_POOL.filter(w => w.frequency === freq)
      let mastered = 0, learning = 0, newWords = 0, notAdded = 0
      for (const w of words) {
        const p = progress[w.word] || progress[w.word.toLowerCase()]
        if (!p) { notAdded++; continue }
        if (p.reviews >= 5) mastered++
        else if (p.reviews > 0) learning++
        else newWords++
      }
      freqDist[freq] = { total: words.length, mastered, learning, newWords, notAdded }
    }

    const allLearned = Object.keys(progress)
    const mastered = allLearned.filter(w => progress[w].reviews >= 5).length
    const learning = allLearned.filter(w => progress[w].reviews > 0 && progress[w].reviews < 5).length
    const newWordsCount = allLearned.filter(w => progress[w].reviews === 0).length

    res.json({
      unitProgress,
      frequencyDistribution: freqDist,
      overall: {
        total: VOCAB_POOL.length,
        mastered,
        learning,
        newWords: newWordsCount,
        notAdded: VOCAB_POOL.length - allLearned.length,
        masteredPct: VOCAB_POOL.length > 0 ? Math.round((mastered / VOCAB_POOL.length) * 100) : 0,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

studyRouter.get('/vocab/relations', (req, res) => {
  try {
    const searchRoot = ((req.query.root as string) || '').toLowerCase()

    const rootMap = new Map<string, { meaning: string; words: Array<{ word: string; definition: string; unit: number; frequency: string }> }>()

    for (const entry of VOCAB_POOL) {
      const roots = (entry as any).roots
      if (!roots) continue
      const matches = roots.match(/([a-zA-Z-]+)\(([^)]+)\)/g)
      if (!matches) continue
      for (const m of matches) {
        const rm = m.match(/([a-zA-Z-]+)\(([^)]+)\)/)
        if (!rm) continue
        const rootKey = rm[1].replace(/-$/, '').toLowerCase()
        const meaning = rm[2]
        if (!rootMap.has(rootKey)) rootMap.set(rootKey, { meaning, words: [] })
        rootMap.get(rootKey)!.words.push({
          word: entry.word,
          definition: entry.definition,
          unit: entry.unit,
          frequency: entry.frequency,
        })
      }
    }

    let roots = Array.from(rootMap.entries())
      .filter(([, v]) => v.words.length >= 2)
      .map(([root, v]) => ({ root, meaning: v.meaning, words: v.words }))
      .sort((a, b) => b.words.length - a.words.length)

    if (searchRoot) {
      roots = roots.filter(r =>
        r.root.includes(searchRoot) || r.words.some(w => w.word.toLowerCase().includes(searchRoot))
      )
    }

    const connections: Array<{ from: string; to: string; type: string }> = []
    for (const rootEntry of roots.slice(0, 30)) {
      const ws = rootEntry.words
      for (let i = 0; i < Math.min(ws.length, 8); i++) {
        for (let j = i + 1; j < Math.min(ws.length, 8); j++) {
          connections.push({ from: ws[i].word, to: ws[j].word, type: rootEntry.root })
        }
      }
    }

    res.json({ roots: roots.slice(0, 60), connections })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

studyRouter.post('/vocab/import', (req, res) => {
  try {
    const { format, data } = req.body as { format: 'csv' | 'json'; data: string }
    if (!data) {
      res.status(400).json({ error: 'No data provided' })
      return
    }

    let imported = 0, skipped = 0
    const errors: string[] = []
    const newWords: typeof VOCAB_POOL = []
    const existingWords = new Set(VOCAB_POOL.map(w => w.word.toLowerCase()))

    if (format === 'json') {
      let parsed: any[]
      try { parsed = JSON.parse(data) } catch { res.status(400).json({ error: 'Invalid JSON format' }); return }
      if (!Array.isArray(parsed)) { res.status(400).json({ error: 'JSON must be an array' }); return }

      for (const item of parsed) {
        if (!item.word) { errors.push(`Missing word field: ${JSON.stringify(item).slice(0, 50)}`); continue }
        if (existingWords.has(item.word.toLowerCase())) { skipped++; continue }
        newWords.push({
          word: item.word,
          phonetic: item.phonetic || '',
          definition: item.definition || '',
          example: item.example || '',
          exampleCn: item.exampleCn || '',
          frequency: item.frequency || '中频',
          unit: item.unit || 99,
          roots: item.roots,
          synonyms: item.synonyms,
        })
        existingWords.add(item.word.toLowerCase())
        imported++
      }
    } else if (format === 'csv') {
      const lines = data.split('\n').filter(l => l.trim())
      const hasHeader = lines[0]?.toLowerCase().includes('word')
      const startIdx = hasHeader ? 1 : 0

      for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
        if (cols.length < 3) { errors.push(`Line ${i + 1}: insufficient columns`); continue }
        const [word, phonetic, definition, example, exampleCn, frequency] = cols
        if (!word) continue
        if (existingWords.has(word.toLowerCase())) { skipped++; continue }
        newWords.push({
          word,
          phonetic: phonetic || '',
          definition: definition || '',
          example: example || '',
          exampleCn: exampleCn || '',
          frequency: frequency || '中频',
          unit: 99,
        })
        existingWords.add(word.toLowerCase())
        imported++
      }
    } else {
      res.status(400).json({ error: 'Unsupported format. Use csv or json.' })
      return
    }

    if (newWords.length > 0) {
      const customPath = '单词本/custom-words.json'
      let existing: any[] = []
      try {
        const file = getFile(config.vaultPath, customPath)
        if (file) {
          const { content: body } = matter(file.content)
          const jsonMatch = body.match(/```json\s*([\s\S]*?)```/)
          if (jsonMatch) existing = JSON.parse(jsonMatch[1])
        }
      } catch {
        // ignore
      }
      existing = existing.concat(newWords)
      const todayStr = new Date().toISOString().split('T')[0]
      const content = `---\ntype: custom-vocab\nupdated: '${todayStr}'\n---\n\n\`\`\`json\n${JSON.stringify(existing, null, 2)}\n\`\`\`\n`
      try {
        updateFile(config.vaultPath, customPath, content, { type: 'custom-vocab', updated: todayStr })
      } catch {
        createFile(config.vaultPath, customPath, content, { type: 'custom-vocab', updated: todayStr })
      }
      markSelfWrite(customPath)

      VOCAB_POOL.push(...newWords)
    }

    res.json({ imported, skipped, errors: errors.slice(0, 10), total: VOCAB_POOL.length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
