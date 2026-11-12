import { getRequestVaultPath, getUserVaultDir } from '../services/user-sandbox.js'
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
import { database } from '../db/database.js'
import { calculateSM2, estimateRetentionRate } from '../algorithms/sm2.js'
import { MasteryEngine } from '../algorithms/mastery.js'
import { matchSyllabusNode } from '../data/syllabus.js'
import { VOCAB_POOL as SHARED_VOCAB_POOL } from '../../shared/data/vocabulary/index.js'


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

// ===== 真·SuperMemo-2 (SM-2) 艾宾浩斯复习引擎 =====

studyRouter.post('/study/sm2/grade', (req, res) => {
  try {
    const { cardId, grade, subject, title, syllabusId } = req.body as {
      cardId: string
      grade: number // 0 ~ 5
      subject?: string
      title?: string
      syllabusId?: string
    }

    if (!cardId || typeof grade !== 'number') {
      res.status(400).json({ error: 'Missing cardId or valid grade (0-5)' })
      return
    }

    const existing = database.getSM2Flashcard(cardId, req.user?.id)
    const updatedState = calculateSM2(
      existing || { cardId },
      grade
    )

    // 解析历史打分记录
    let history: Array<{ date: string; grade: number }> = []
    try {
      if (existing?.historyJson) {
        history = JSON.parse(existing.historyJson)
      }
    } catch {
      history = []
    }
    history.push({ date: updatedState.lastReviewAt, grade: Math.round(grade) })

    const finalSyllabusId = syllabusId || existing?.syllabusId || ''
    database.upsertSM2Flashcard({
      cardId,
      userId: req.user?.id || 'default',
      title: title || existing?.title || '知识卡片',
      subject: subject || existing?.subject || '综合',
      syllabusId: finalSyllabusId,
      repetition: updatedState.repetition,
      intervalDays: updatedState.intervalDays,
      easinessFactor: updatedState.easinessFactor,
      reviewCount: updatedState.reviewCount,
      lastReviewAt: updatedState.lastReviewAt,
      nextReviewAt: updatedState.nextReviewAt,
      lastGrade: Math.round(grade),
      historyJson: JSON.stringify(history.slice(-20)), // 保留最近20次
    })

    // 同步更新对应考点掌握度 (grade >= 3 判定为回忆成功)
    if (finalSyllabusId) {
      MasteryEngine.recordAttempt(finalSyllabusId, grade >= 3)
    }

    const retention = estimateRetentionRate(updatedState.lastReviewAt, updatedState.intervalDays)

    res.json({
      success: true,
      cardId,
      state: updatedState,
      retentionRate: retention,
    })
  } catch (err: any) {
    console.error('SM2 grade error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

studyRouter.get('/study/sm2/due', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const subject = req.query.subject ? String(req.query.subject) : undefined
    const dueCards = database.getDueSM2Flashcards(today, subject, req.user?.id)

    const mapped = dueCards.map(c => {
      const retention = estimateRetentionRate(c.lastReviewAt, c.intervalDays)
      return {
        ...c,
        retentionRate: retention,
        urgency: retention < 0.5 ? 'high' : retention < 0.75 ? 'medium' : 'normal',
      }
    })

    res.json({
      today,
      totalDue: mapped.length,
      cards: mapped,
    })
  } catch (err: any) {
    console.error('SM2 due fetch error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== 考点掌握度热力分布 (408 & 考研数学) =====

studyRouter.get('/study/mastery-heatmap', (req, res) => {
  try {
    const domain = req.query.domain as 'cs_408' | 'math' | undefined
    const heatmap = MasteryEngine.getHierarchyHeatmap(domain)
    res.json({
      timestamp: new Date().toISOString(),
      summaries: heatmap,
    })
  } catch (err: any) {
    console.error('Mastery heatmap error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

studyRouter.post('/study/mastery-update', (req, res) => {
  try {
    const { syllabusId, status, score } = req.body as {
      syllabusId: string
      status: 'red' | 'yellow' | 'green'
      score?: number
    }
    if (!syllabusId || !status) {
      res.status(400).json({ error: '缺少必填字段: syllabusId 与 status' })
      return
    }
    const record = MasteryEngine.updateManualStatus(syllabusId, status, score)
    res.json({
      success: true,
      record,
    })
  } catch (err: any) {
    console.error('Mastery update error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

studyRouter.get('/study/mastery-node-detail', (req, res) => {
  try {
    const syllabusId = req.query.syllabusId as string
    if (!syllabusId) {
      res.status(400).json({ error: '缺少 syllabusId 参数' })
      return
    }
    const detail = MasteryEngine.getNodeDetail(syllabusId)
    if (!detail) {
      res.status(404).json({ error: '未找到对应考点' })
      return
    }
    res.json({
      success: true,
      detail,
    })
  } catch (err: any) {
    console.error('Mastery node detail error:', err.message)
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
      '科目': 'subject',
      '错因类型': 'errorType',
      '错因反思': 'notes',
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

function parseSingleErrorNote(content: string, fileName: string): any | null {
  try {
    const { data: meta, content: body } = matter(content)
    if (meta?.type !== 'error_log' && !body.includes('错题复盘')) {
      return null
    }

    const questionMatch = body.match(/### 题面：\s*([\s\S]*?)(?:### 选项：|## 2\.|$)/)
    const question = questionMatch ? questionMatch[1].trim() : ''
    if (!question) return null

    const userAnsMatch = body.match(/当时作答[：:*]*\s*`?([^`\r\n]+)`?/)
    const correctAnsMatch = body.match(/标准答案[：:*]*\s*`?([^`\r\n]+)`?/)
    const explMatch = body.match(/## 3\. 标准分步严谨推导\s*([\s\S]*?)(?:## 4\.|$)/)
    const subjectMatch = body.match(/科目[：:*]*\s*([^\r\n*]+)/)
    const errorTypeMatch = body.match(/诊断类型[：:*]*\s*`?([^`\r\n]+)`?/)
    const notesMatch = body.match(/思维障碍\/误区复现[：:*]*\s*([\s\S]*?)(?:## 3\.|$)/)
    const optionsBlockMatch = body.match(/### 选项：\s*([\s\S]*?)(?:## 2\.|$)/)
    let parsedOptions: Record<string, string> | undefined
    if (optionsBlockMatch) {
      const opts: Record<string, string> = {}
      for (const line of optionsBlockMatch[1].split('\n')) {
        const m = line.match(/^-\s*\*\*([A-Da-d])\*\*\s*[:：]\s*(.+)$/)
        if (m) opts[m[1].toUpperCase()] = m[2].trim()
      }
      if (Object.keys(opts).length > 0) parsedOptions = opts
    }

    return {
      source: fileName,
      question,
      options: parsedOptions,
      userAnswer: userAnsMatch ? userAnsMatch[1].trim() : '',
      correctAnswer: correctAnsMatch ? correctAnsMatch[1].trim() : '',
      explanation: explMatch ? explMatch[1].trim() : '',
      errorType: meta?.error_type || (errorTypeMatch ? errorTypeMatch[1].trim() : ''),
      notes: notesMatch ? notesMatch[1].trim() : '',
      reviewCount: '0',
      nextReview: meta?.created || new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date()),
      _sourceFile: fileName,
      subject: meta?.subject || (subjectMatch ? subjectMatch[1].trim() : '')
    }
  } catch {
    return null
  }
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

    // 修复：vaultPath 此前声明在 try 块内，后续写文件时引用会抛 ReferenceError，导致错题无法保存
    const vaultPath = getRequestVaultPath(req)
    let questions: any[] = []
    try {
      const existing = getFile(vaultPath, logPath)
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
      updateFile(vaultPath, logPath, content, fm)
    } catch {
      createFile(vaultPath, logPath, content, fm)
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
    const date = String(req.query.date || new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date()))
    const logPath = `${getErrorLogDir()}/${date}.md`
    try {
      const vaultPath = getRequestVaultPath(req)
    const file = getFile(vaultPath, logPath)
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

studyRouter.get('/study/daily-review', (req, res) => {
  try {
    const todayStr = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date())
    const vaultPath = getRequestVaultPath(req)
    const allQuestions: any[] = []
    const seenQuestionKeys = new Set<string>()

    // 1. 聚合多目录错题日志与单题复盘笔记 (全量覆盖 03-真题错题归因 及其子目录)
    const candidateDirs = [
      path.resolve(vaultPath, getErrorLogDir()),
      path.resolve(vaultPath, '03-真题错题归因/408错题本'),
      path.resolve(vaultPath, '03-真题错题归因/数学错题本'),
      path.resolve(vaultPath, '03-真题错题归因/每日错题集'),
      path.resolve(vaultPath, '03-真题错题归因'),
      path.resolve(vaultPath, '03-刷题与复盘/408错题本'),
      path.resolve(vaultPath, '03-刷题与复盘/数学错题本'),
      path.resolve(vaultPath, '03-刷题与复盘/错题集'),
      path.resolve(vaultPath, '03-真题与错题/408错题本'),
      path.resolve(vaultPath, '03-真题与错题/数学错题本'),
    ]
    if (vaultPath === config.vaultPath) {
      candidateDirs.push(path.resolve(config.vaultPath, getErrorLogDir()))
    }

    for (const errorDir of candidateDirs) {
      if (fs.existsSync(errorDir)) {
        const files = fs.readdirSync(errorDir).filter(f => f.endsWith('.md'))
        for (const file of files) {
          try {
            const fullPath = path.join(errorDir, file)
            const raw = fs.readFileSync(fullPath, 'utf-8')
            const parsed = parseErrorLog(raw)
            if (parsed.questions && parsed.questions.length > 0) {
              for (const q of parsed.questions) {
                const dedupeKey = (q.question || '').slice(0, 40)
                if (dedupeKey && !seenQuestionKeys.has(dedupeKey)) {
                  seenQuestionKeys.add(dedupeKey)
                  q._sourceFile = file
                  allQuestions.push(q)
                }
              }
            } else {
              // 尝试作为单题复盘笔记解析
              const singleQ = parseSingleErrorNote(raw, file)
              if (singleQ) {
                const dedupeKey = (singleQ.question || '').slice(0, 40)
                if (dedupeKey && !seenQuestionKeys.has(dedupeKey)) {
                  seenQuestionKeys.add(dedupeKey)
                  allQuestions.push(singleQ)
                }
              }
            }
          } catch {
            // skip bad files
          }
        }
      }
    }

    // 2. 深度融合 SQLite 数据库持久化错题，确保做题保存后 100% 毫秒级可见
    try {
      const isUserAdmin = req.user?.role === 'admin'
      const filter = isUserAdmin ? undefined : (req.user?.id ? { userId: req.user.id } : undefined)
      const dbErrors = database.getErrorQuestions(filter)
      for (const errItem of dbErrors) {
        const dedupeKey = (errItem.question || '').slice(0, 40)
        if (dedupeKey && !seenQuestionKeys.has(dedupeKey)) {
          seenQuestionKeys.add(dedupeKey)
          allQuestions.push({
            source: errItem.sourceNote || errItem.subject,
            subject: errItem.subject,
            question: errItem.question,
            options: errItem.options,
            userAnswer: errItem.userAnswer || '',
            correctAnswer: errItem.correctAnswer,
            explanation: errItem.explanation || '详尽分步解析已同步至错题本',
            errorType: errItem.errorType,
            notes: errItem.notes,
            reviewCount: String(errItem.reviewCount || 0),
            nextReview: errItem.nextReviewAt || todayStr,
            _sourceFile: errItem.sourceNote || '数据库错题库',
            _id: errItem.id,
          })
        }
      }
    } catch (dbErr: any) {
      console.warn('[DailyReview DB Fetch]:', dbErr.message)
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
      const vaultPath = getRequestVaultPath(req)
    const file = getFile(vaultPath, logPath)
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
  if (SHARED_VOCAB_POOL && SHARED_VOCAB_POOL.length > 0) {
    return SHARED_VOCAB_POOL
  }
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
  // 单词本进度只属于用户个人复盘数据，不污染全库图谱索引，避免触发全库 rebuild 导致 8 秒假死
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
        roots: (entry as any)?.roots || '',
        synonyms: (entry as any)?.synonyms || '',
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
        exampleCn: (w as any).exampleCn || '',
        frequency: w.frequency,
        unit: w.unit,
        roots: (w as any).roots || '',
        synonyms: (w as any).synonyms || '',
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

// ===== 研学进度全景聚合与备考目标 (Progress Overview & Goals) =====

type ProgressDomainKey = 'cs_408' | 'math' | 'english' | 'politics' | 'general'

function toChinaDateStr(input?: string | Date): string {
  const ts = input ? new Date(input).getTime() : Date.now()
  const safeTs = Number.isNaN(ts) ? Date.now() : ts
  return new Date(safeTs + 8 * 3600 * 1000).toISOString().slice(0, 10)
}

function classifyProgressDomain(domain?: string, subject?: string, textHint?: string): ProgressDomainKey {
  const d = (domain || '').toLowerCase()
  const s = ((subject || '') + ' ' + (textHint || '')).toLowerCase()

  if (d === 'cs_408' || /408|数据结构|计算机组成|计组|操作系统|计算机网络|缓存|流水线|tcp|进程|二叉树/.test(s)) {
    return 'cs_408'
  }
  if (d === 'math' || /数学|高数|高等数学|线代|线性代数|概率|微积分|矩阵|极限|级数|微分/.test(s)) {
    return 'math'
  }
  if (d === 'english' || /英语|阅读理解|完形|长难句|作文|翻译|词汇|单词|英一|英二/.test(s)) {
    return 'english'
  }
  if (d === 'politics' || /政治|马原|马克思|毛中特|史纲|思修|新思想|时政|肖秀荣|肖四|肖八/.test(s)) {
    return 'politics'
  }
  return 'general'
}

function inferBookDomainAndExtracted(vaultRoot: string, user?: any): {
  totalBooks: number
  extractedBooks: number
  byDomain: Record<ProgressDomainKey, { total: number; extracted: number }>
  unextractedSamples: Array<{ name: string; domain: ProgressDomainKey; relativePath: string }>
} {
  const byDomain: Record<ProgressDomainKey, { total: number; extracted: number }> = {
    cs_408: { total: 0, extracted: 0 },
    math: { total: 0, extracted: 0 },
    english: { total: 0, extracted: 0 },
    politics: { total: 0, extracted: 0 },
    general: { total: 0, extracted: 0 },
  }
  const unextractedSamples: Array<{ name: string; domain: ProgressDomainKey; relativePath: string }> = []
  let totalBooks = 0
  let extractedBooks = 0

  try {
    const isAdmin = user?.role === 'admin'
    const isLoggedInRegular = Boolean(user && !isAdmin)
    const recordVaultRoot = isLoggedInRegular ? getUserVaultDir(user.id) : config.vaultPath
    const extPath = path.join(recordVaultRoot, 'raw-sources', '.extractions.json')
    let extractions: Record<string, any> = {}
    if (fs.existsSync(extPath)) {
      try {
        extractions = JSON.parse(fs.readFileSync(extPath, 'utf8'))
      } catch {}
    }

    const seen = new Set<string>()
    const scanDirs: Array<{ root: string; dir: string; scope: string }> = []
    if (isLoggedInRegular && user) {
      const uv = getUserVaultDir(user.id)
      scanDirs.push({ root: uv, dir: path.join(uv, 'raw-sources'), scope: 'personal' })
    }
    scanDirs.push(
      { root: config.vaultPath, dir: path.join(config.vaultPath, 'raw-sources'), scope: 'shared' },
      { root: config.vaultPath, dir: path.join(config.vaultPath, '06-原始资料库'), scope: 'shared' }
    )

    const walk = (root: string, dir: string, scope: string) => {
      if (!fs.existsSync(dir)) return
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(root, full, scope)
        } else if (entry.isFile()) {
          if (entry.name.startsWith('.')) continue
          if (seen.has(entry.name)) continue
          seen.add(entry.name)

          const relPath = path.relative(root, full).replace(/\\/g, '/')
          const domain = classifyProgressDomain(undefined, undefined, relPath)
          const alt1 = relPath.replace('06-原始资料库', 'raw-sources')
          const alt2 = relPath.replace('raw-sources', '06-原始资料库')
          const isExtracted = Boolean(
            extractions[`${scope}:${relPath}`] ||
            extractions[`${scope}:${alt1}`] ||
            extractions[`${scope}:${alt2}`] ||
            extractions[relPath]
          )

          totalBooks++
          byDomain[domain].total++
          if (isExtracted) {
            extractedBooks++
            byDomain[domain].extracted++
          } else if (unextractedSamples.length < 5) {
            unextractedSamples.push({ name: entry.name, domain, relativePath: relPath })
          }
        }
      }
    }

    for (const item of scanDirs) {
      walk(item.root, item.dir, item.scope)
    }
  } catch (err: any) {
    console.warn('[ProgressOverview] scan books warning:', err.message)
  }

  return { totalBooks, extractedBooks, byDomain, unextractedSamples }
}

studyRouter.get('/study/progress-overview', (req, res) => {
  try {
    const userId = req.user?.id || 'default'
    const vaultPath = getRequestVaultPath(req)
    const todayStr = toChinaDateStr()

    // 1. 获取做题记录 (最近 200 场)
    const quizRecords = database.getQuizRecords(200, undefined, req.user?.id ? req.user.id : undefined)

    let totalQuestionsAttempted = 0
    let totalCorrect = 0
    let totalTimeSpentSec = 0
    let weeklyQuestionsDone = 0

    // 近 7 天每日统计
    const dayKeys: string[] = []
    const nowMs = Date.now()
    for (let i = 6; i >= 0; i--) {
      dayKeys.push(toChinaDateStr(new Date(nowMs - i * 86400000)))
    }
    const dailyStatsMap: Record<string, { date: string; label: string; attempted: number; correct: number; sessions: number }> = {}
    for (const dk of dayKeys) {
      const [, m, d] = dk.split('-')
      dailyStatsMap[dk] = { date: dk, label: `${Number(m)}/${Number(d)}`, attempted: 0, correct: 0, sessions: 0 }
    }

    const domainQuizStats: Record<ProgressDomainKey, {
      sessions: number
      attempted: number
      correct: number
      timeSec: number
      lastPracticedAt: string | null
    }> = {
      cs_408: { sessions: 0, attempted: 0, correct: 0, timeSec: 0, lastPracticedAt: null },
      math: { sessions: 0, attempted: 0, correct: 0, timeSec: 0, lastPracticedAt: null },
      english: { sessions: 0, attempted: 0, correct: 0, timeSec: 0, lastPracticedAt: null },
      politics: { sessions: 0, attempted: 0, correct: 0, timeSec: 0, lastPracticedAt: null },
      general: { sessions: 0, attempted: 0, correct: 0, timeSec: 0, lastPracticedAt: null },
    }

    const activeDateSet = new Set<string>()
    const weekStartStr = dayKeys[0]

    for (const rec of quizRecords) {
      const qTotal = Number(rec.totalQuestions) || 0
      const qCorrect = Number(rec.correctCount) || 0
      const qTime = Number(rec.timeTaken) || 0
      totalQuestionsAttempted += qTotal
      totalCorrect += qCorrect
      totalTimeSpentSec += qTime

      const recDay = toChinaDateStr(rec.createdAt)
      activeDateSet.add(recDay)
      if (recDay >= weekStartStr) {
        weeklyQuestionsDone += qTotal
      }
      if (dailyStatsMap[recDay]) {
        dailyStatsMap[recDay].attempted += qTotal
        dailyStatsMap[recDay].correct += qCorrect
        dailyStatsMap[recDay].sessions += 1
      }

      const dom = classifyProgressDomain(rec.domain)
      domainQuizStats[dom].sessions += 1
      domainQuizStats[dom].attempted += qTotal
      domainQuizStats[dom].correct += qCorrect
      domainQuizStats[dom].timeSec += qTime
      if (!domainQuizStats[dom].lastPracticedAt || rec.createdAt > domainQuizStats[dom].lastPracticedAt!) {
        domainQuizStats[dom].lastPracticedAt = rec.createdAt
      }
    }

    const overallAccuracy = totalQuestionsAttempted > 0
      ? Math.round((totalCorrect / totalQuestionsAttempted) * 100)
      : 0

    // 计算连续学习天数（基于做题活跃日或今日签到）
    const userPoints = req.user?.id ? database.getUserPoints(req.user.id) : null
    if (userPoints?.lastCheckinAt) {
      activeDateSet.add(userPoints.lastCheckinAt)
    }
    let streakDays = 0
    for (let i = 0; i < 60; i++) {
      const checkDay = toChinaDateStr(new Date(nowMs - i * 86400000))
      if (activeDateSet.has(checkDay)) {
        streakDays++
      } else if (i > 0) {
        break
      }
    }

    // 2. 错题本真实状态与错因诊断
    const dbErrors = database.getErrorQuestions(req.user?.id ? { userId: req.user.id } : undefined)
    let errorPendingCount = 0
    let errorMasteredCount = 0
    const errorTypeCounts: Record<string, number> = {
      '概念不清': 0,
      '公式记错': 0,
      '计算失误': 0,
      '审题疏忽': 0,
    }
    const domainErrorStats: Record<ProgressDomainKey, { total: number; pending: number; mastered: number }> = {
      cs_408: { total: 0, pending: 0, mastered: 0 },
      math: { total: 0, pending: 0, mastered: 0 },
      english: { total: 0, pending: 0, mastered: 0 },
      politics: { total: 0, pending: 0, mastered: 0 },
      general: { total: 0, pending: 0, mastered: 0 },
    }

    for (const err of dbErrors) {
      const isMastered = err.status === 'mastered'
      if (isMastered) errorMasteredCount++
      else errorPendingCount++

      const et = err.errorType || '概念不清'
      errorTypeCounts[et] = (errorTypeCounts[et] || 0) + 1

      const dom = classifyProgressDomain(err.domain, err.subject, err.question)
      domainErrorStats[dom].total++
      if (isMastered) domainErrorStats[dom].mastered++
      else domainErrorStats[dom].pending++
    }

    const recentErrors = dbErrors
      .filter(e => e.status !== 'mastered')
      .slice(0, 6)
      .map(e => ({
        id: e.id,
        domain: classifyProgressDomain(e.domain, e.subject, e.question),
        subject: e.subject || '综合',
        chapter: e.chapter || '',
        question: (e.question || '').replace(/\s+/g, ' ').slice(0, 90),
        errorType: e.errorType || '概念不清',
        updatedAt: e.updatedAt,
      }))

    // 3. 易忘闪卡真实状态 (flashcards.json)
    let flashcardsTotal = 0
    let flashcardsDue = 0
    let flashcardsForgotten = 0
    let flashcardsMastered = 0
    const domainFlashStats: Record<ProgressDomainKey, { total: number; due: number; forgotten: number }> = {
      cs_408: { total: 0, due: 0, forgotten: 0 },
      math: { total: 0, due: 0, forgotten: 0 },
      english: { total: 0, due: 0, forgotten: 0 },
      politics: { total: 0, due: 0, forgotten: 0 },
      general: { total: 0, due: 0, forgotten: 0 },
    }

    try {
      const fcPath = path.resolve(config.vaultPath, '做题记录', 'flashcards.json')
      if (fs.existsSync(fcPath)) {
        const cards = JSON.parse(fs.readFileSync(fcPath, 'utf8'))
        if (Array.isArray(cards)) {
          const nowDate = new Date()
          for (const c of cards) {
            flashcardsTotal++
            const isDue = !c.nextReviewAt || new Date(c.nextReviewAt) <= nowDate
            if (isDue) flashcardsDue++
            if (c.isForgotten) flashcardsForgotten++
            if ((Number(c.masteryLevel) || 0) >= 80 || (Number(c.repetition) || 0) >= 3) {
              flashcardsMastered++
            }
            const dom = classifyProgressDomain(c.domain, c.subject)
            domainFlashStats[dom].total++
            if (isDue) domainFlashStats[dom].due++
            if (c.isForgotten) domainFlashStats[dom].forgotten++
          }
        }
      }
    } catch {}

    // 4. 考点大纲掌握度与最薄弱 Top 考点
    const masterySummaries = MasteryEngine.getHierarchyHeatmap()
    const allDbMastery = database.getAllMasteryRecords()
    let totalSyllabusPoints = 0
    let masteredPoints = 0
    let inProgressPoints = 0
    let weakPoints = 0

    const domainMasteryStats: Record<'cs_408' | 'math', { total: number; green: number; yellow: number; red: number; avgScore: number }> = {
      cs_408: { total: 0, green: 0, yellow: 0, red: 0, avgScore: 0 },
      math: { total: 0, green: 0, yellow: 0, red: 0, avgScore: 0 },
    }

    for (const s of masterySummaries) {
      totalSyllabusPoints += s.totalPoints
      masteredPoints += s.masteredCount
      inProgressPoints += s.inProgressCount
      weakPoints += s.weakCount
      if (s.domain === 'cs_408' || s.domain === 'math') {
        domainMasteryStats[s.domain] = {
          total: s.totalPoints,
          green: s.masteredCount,
          yellow: s.inProgressCount,
          red: s.weakCount,
          avgScore: s.averageScore,
        }
      }
    }

    const weakestNodes = allDbMastery
      .filter(m => m.totalAttempted > 0 && m.status !== 'green')
      .sort((a, b) => a.masteryScore - b.masteryScore)
      .slice(0, 6)
      .map(m => ({
        syllabusId: m.syllabusId,
        domain: m.domain,
        subject: m.subject,
        topic: `${m.level1} · ${m.level3}`,
        score: m.masteryScore,
        status: m.status,
        attempted: m.totalAttempted,
        wrongCount: m.wrongCount,
      }))

    // 5. 考研英语词汇背诵进度
    const vocabProgress = readVocabProgress()
    const vocabKeys = Object.keys(vocabProgress)
    let vocabDueToday = 0
    let vocabMastered = 0
    let vocabLearning = 0
    for (const k of vocabKeys) {
      const p = vocabProgress[k]
      if (!p.nextReview || p.nextReview <= todayStr) vocabDueToday++
      if (p.reviews >= 5) vocabMastered++
      else if (p.reviews > 0) vocabLearning++
    }

    // 6. 资料解析与自定义导题数
    const booksSummary = inferBookDomainAndExtracted(vaultPath, req.user)
    let customQuestionsTotal = 0
    const customQuestionsByDomain: Record<ProgressDomainKey, number> = {
      cs_408: 0,
      math: 0,
      english: 0,
      politics: 0,
      general: 0,
    }
    try {
      const cqPath = path.resolve(vaultPath, '做题记录', 'custom-questions.json')
      if (fs.existsSync(cqPath)) {
        const arr = JSON.parse(fs.readFileSync(cqPath, 'utf8'))
        if (Array.isArray(arr)) {
          customQuestionsTotal = arr.length
          for (const q of arr) {
            const dom = classifyProgressDomain(q.domain, q.subject)
            customQuestionsByDomain[dom]++
          }
        }
      }
    } catch {}

    // 7. 个人研学目标与今日待办清单
    const goals = database.getStudyGoal(userId)

    // 8. 构建四大学科结构化面板数据
    const subjectDefinitions: Array<{ key: 'cs_408' | 'math' | 'english' | 'politics'; name: string; subtitle: string; maxScore: number }> = [
      { key: 'cs_408', name: '408 计算机综合', subtitle: '数据结构 · 计组 · 操作系统 · 计网', maxScore: 150 },
      { key: 'math', name: '考研数学', subtitle: '高等数学 · 线性代数 · 概率统计', maxScore: 150 },
      { key: 'english', name: '考研英语', subtitle: '核心词库 · 阅读长难句 · 大小作文批改', maxScore: 100 },
      { key: 'politics', name: '考研政治', subtitle: '马原 · 史纲时空轴 · 肖1000题', maxScore: 100 },
    ]

    const subjects = subjectDefinitions.map(def => {
      const qStat = domainQuizStats[def.key]
      const eStat = domainErrorStats[def.key]
      const fStat = domainFlashStats[def.key]
      const bStat = booksSummary.byDomain[def.key]
      const goalCfg = goals.subjectGoals[def.key]
      const accuracy = qStat.attempted > 0 ? Math.round((qStat.correct / qStat.attempted) * 100) : null
      const masteryInfo = (def.key === 'cs_408' || def.key === 'math') ? domainMasteryStats[def.key] : null

      return {
        key: def.key,
        name: def.name,
        subtitle: def.subtitle,
        maxScore: def.maxScore,
        stage: goalCfg.stage,
        targetScore: goalCfg.targetScore,
        manualProgress: goalCfg.manualProgress || 0,
        quizSessions: qStat.sessions,
        attemptedQuestions: qStat.attempted,
        correctQuestions: qStat.correct,
        accuracy,
        lastPracticedAt: qStat.lastPracticedAt,
        errorsTotal: eStat.total,
        errorsPending: eStat.pending,
        errorsMastered: eStat.mastered,
        flashcardsTotal: fStat.total,
        flashcardsDue: fStat.due,
        booksTotal: bStat.total,
        booksExtracted: bStat.extracted,
        customQuestionsCount: customQuestionsByDomain[def.key],
        mastery: masteryInfo,
      }
    })

    // 9. 智能今日行动建议队列
    const todayActions: Array<{
      id: string
      priority: 'urgent' | 'recommended' | 'advance'
      title: string
      description: string
      actionLabel: string
      targetType: 'tab' | 'route'
      target: string
    }> = []

    if (errorPendingCount > 0) {
      todayActions.push({
        id: 'act-errors',
        priority: 'urgent',
        title: `消灭 ${errorPendingCount} 道待复盘错题`,
        description: `当前错题消灭率 ${dbErrors.length > 0 ? Math.round((errorMasteredCount / dbErrors.length) * 100) : 0}%，趁记忆未退化及时重做复盘`,
        actionLabel: '进入每日错题',
        targetType: 'tab',
        target: 'errors',
      })
    }

    if (flashcardsDue > 0) {
      todayActions.push({
        id: 'act-flashcards',
        priority: flashcardsForgotten > 0 ? 'urgent' : 'recommended',
        title: `复习 ${flashcardsDue} 张到期记忆闪卡`,
        description: flashcardsForgotten > 0 ? `其中包含 ${flashcardsForgotten} 张你重点标注为“容易遗忘”的核心卡片` : '遵循 SM-2 记忆曲线及时巩固防遗忘',
        actionLabel: '开启闪卡速记',
        targetType: 'tab',
        target: 'flashcards',
      })
    }

    if (weakestNodes.length > 0) {
      const topWeak = weakestNodes[0]
      todayActions.push({
        id: 'act-weakest',
        priority: 'urgent',
        title: `攻坚薄弱考点：${topWeak.topic}`,
        description: `${topWeak.subject}当前掌握度仅 ${topWeak.score} 分（错 ${topWeak.wrongCount} 次），建议先让 AI 串讲再刷变式题`,
        actionLabel: 'AI 靶向精讲',
        targetType: 'route',
        target: `/chat?prompt=${encodeURIComponent(`我在「${topWeak.topic}」（${topWeak.subject}）总是容易丢分，请帮我系统梳理核心原理、常见命题陷阱，并出 2 道针对性训练题。`)}`,
      })
    }

    if (vocabDueToday > 0) {
      todayActions.push({
        id: 'act-vocab',
        priority: 'recommended',
        title: `背诵今日 ${vocabDueToday} 个到期考研词汇`,
        description: `词库总池 ${VOCAB_POOL.length} 词，当前已彻底掌握 ${vocabMastered} 词，每日坚持保持语感`,
        actionLabel: '去背单词',
        targetType: 'route',
        target: '/vocabulary',
      })
    }

    if (booksSummary.unextractedSamples.length > 0) {
      todayActions.push({
        id: 'act-extract',
        priority: 'advance',
        title: `还有 ${booksSummary.totalBooks - booksSummary.extractedBooks} 份资料未 AI 提取归档`,
        description: `例如《${booksSummary.unextractedSamples[0].name}》，一键解析可将真题注入个人题库`,
        actionLabel: '去教材专架解析',
        targetType: 'tab',
        target: 'pdfs',
      })
    }

    if (weeklyQuestionsDone < goals.weeklyQuestionGoal) {
      const remain = goals.weeklyQuestionGoal - weeklyQuestionsDone
      todayActions.push({
        id: 'act-quiz',
        priority: totalQuestionsAttempted === 0 ? 'urgent' : 'recommended',
        title: totalQuestionsAttempted === 0 ? '开启第一组摸底刷题诊断' : `本周刷题目标还差 ${remain} 题`,
        description: totalQuestionsAttempted === 0
          ? '完成一组 10 道真题测试后，系统将为你点亮考纲热力图与薄弱点雷达'
          : `本周已完成 ${weeklyQuestionsDone} / ${goals.weeklyQuestionGoal} 题，继续保持节奏`,
        actionLabel: '前往做题中心',
        targetType: 'route',
        target: '/quiz',
      })
    }

    res.json({
      generatedAt: new Date().toISOString(),
      today: todayStr,
      summary: {
        totalQuizSessions: quizRecords.length,
        totalQuestionsAttempted,
        totalCorrect,
        overallAccuracy,
        totalTimeMinutes: Math.round(totalTimeSpentSec / 60),
        weeklyQuestionsDone,
        streakDays,
        checkedInToday: userPoints?.lastCheckinAt === todayStr,
        errorTotal: dbErrors.length,
        errorPending: errorPendingCount,
        errorMastered: errorMasteredCount,
        flashcardsTotal,
        flashcardsDue,
        flashcardsForgotten,
        flashcardsMastered,
        syllabusTotal: totalSyllabusPoints,
        syllabusMastered: masteredPoints,
        syllabusInProgress: inProgressPoints,
        syllabusWeak: weakPoints,
        vocabPoolTotal: VOCAB_POOL.length,
        vocabLearned: vocabKeys.length,
        vocabMastered,
        vocabLearning,
        vocabDueToday,
        booksTotal: booksSummary.totalBooks,
        booksExtracted: booksSummary.extractedBooks,
        customQuestionsTotal,
      },
      weeklyTrend: dayKeys.map(dk => {
        const d = dailyStatsMap[dk]
        return {
          date: d.date,
          label: d.label,
          attempted: d.attempted,
          correct: d.correct,
          accuracy: d.attempted > 0 ? Math.round((d.correct / d.attempted) * 100) : 0,
          sessions: d.sessions,
        }
      }),
      errorTypeDistribution: Object.entries(errorTypeCounts).map(([name, count]) => ({ name, count })),
      subjects,
      weakestNodes,
      recentErrors,
      todayActions: todayActions.slice(0, 6),
      goals,
    })
  } catch (err: any) {
    console.error('[ProgressOverview Error]:', err)
    res.status(500).json({ error: err.message || '获取研学进度失败' })
  }
})

studyRouter.put('/study/progress-goals', (req, res) => {
  try {
    const userId = req.user?.id || 'default'
    const updated = database.upsertStudyGoal(userId, req.body || {})
    res.json({ success: true, goals: updated })
  } catch (err: any) {
    console.error('[ProgressGoals Update Error]:', err)
    res.status(500).json({ error: err.message || '保存研学目标失败' })
  }
})
