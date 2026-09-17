import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { config, anthropic, markSelfWrite, invalidateCache } from '../context.js'
import { createFile, updateFile } from '../vault-parser.js'
import { generateQuizSummary } from '../quiz-summary.js'

export const quizRouter = Router()

function getCustomQuestionsPath(): string {
  const quizDir = path.resolve(config.vaultPath, '做题记录')
  if (!fs.existsSync(quizDir)) {
    fs.mkdirSync(quizDir, { recursive: true })
  }
  return path.join(quizDir, 'custom-questions.json')
}

function loadCustomQuestions(): any[] {
  try {
    const p = getCustomQuestionsPath()
    if (!fs.existsSync(p)) return []
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveCustomQuestions(questions: any[]): void {
  const p = getCustomQuestionsPath()
  fs.writeFileSync(p, JSON.stringify(questions, null, 2), 'utf8')
}

// ===== 1. Custom Questions Management =====

quizRouter.get('/quiz/custom', (_req, res) => {
  try {
    const questions = loadCustomQuestions()
    res.json({ questions })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

quizRouter.post('/quiz/custom', (req, res) => {
  try {
    const { questions } = req.body as { questions: any | any[] }
    if (!questions) {
      res.status(400).json({ error: 'Missing questions in body' })
      return
    }

    const current = loadCustomQuestions()
    const toAdd = Array.isArray(questions) ? questions : [questions]

    // Assign IDs if missing
    const formatted = toAdd.map((q, idx) => ({
      ...q,
      id: q.id || `custom-${Date.now()}-${idx + 1}`,
      isCustom: true,
      importedAt: new Date().toISOString()
    }))

    const combined = [...current, ...formatted]
    saveCustomQuestions(combined)

    res.json({ success: true, count: formatted.length, total: combined.length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

quizRouter.delete('/quiz/custom/:id', (req, res) => {
  try {
    const { id } = req.params
    const current = loadCustomQuestions()
    const filtered = current.filter(q => q.id !== id)
    saveCustomQuestions(filtered)
    res.json({ success: true, remaining: filtered.length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== 2. AI Parse Raw Text into Structured Questions =====

quizRouter.post('/quiz/parse-text', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const { text, domain, subject } = req.body as {
      text: string
      domain?: 'cs_408' | 'math'
      subject?: string
    }

    if (!text || text.trim().length < 5) {
      res.status(400).json({ error: '文本内容过短' })
      return
    }

    const prompt = `请将以下考研学生粘贴的文本或题目，解析提炼为标准化的考研题库 JSON 数组。
学科领域：${domain === 'cs_408' ? '408 计算机综合' : '考研数学'}（${subject || '综合'}）

【原始输入文本】：
"""
${text.slice(0, 5000)}
"""

【输出规则】：
1. 识别并提取题目、选项（如果是单选题）、正确答案和详细解析。
2. 数学公式必须规范格式化为 KaTeX LaTeX（如 $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$）。
3. 如果原文没有解析，请根据题干和答案补充严密规范的分步考研解析。
4. 如果有多道题目，解析为多个数组元素。
5. 必须只输出纯 JSON 数组，严禁任何额外解释或 Markdown 格式以外的文本：
[
  {
    "id": "parsed-${Date.now()}-1",
    "domain": "${domain || 'math'}",
    "subject": "${subject || (domain === 'cs_408' ? '数据结构' : '高等数学')}",
    "chapter": "对应章节",
    "type": "choice",
    "difficulty": "中等",
    "question": "题干内容（支持LaTeX）",
    "options": {
      "A": "选项A",
      "B": "选项B",
      "C": "选项C",
      "D": "选项D"
    },
    "answer": "A",
    "explanation": "详细解析与考研解题通法",
    "tags": ["自定义导入", "${subject || '核心题型'}"]
  }
]`

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: '你是一个严格输出纯 JSON 格式题库的考研命题与解析专家。只输出纯 JSON 数组，严禁任何前后缀闲聊。',
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '[]'
    let parsed = []
    try {
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) {
        parsed = JSON.parse(match[0])
      } else {
        parsed = JSON.parse(raw)
      }
    } catch {
      res.status(500).json({ error: 'AI 输出未能成功解析为合法题目数组', raw })
      return
    }

    res.json({ questions: parsed })
  } catch (err: any) {
    console.error('Quiz parse-text error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== 3. Save Error Question to Obsidian Vault =====

quizRouter.post('/quiz/save-error', (req, res) => {
  try {
    const { question, userAnswer, errorType, notes } = req.body as {
      question: any
      userAnswer: string
      errorType: '概念不清' | '公式记错' | '计算失误' | '审题疏忽'
      notes?: string
    }

    if (!question) {
      res.status(400).json({ error: 'Missing question' })
      return
    }

    const domain = question.domain || (question.subject?.includes('数学') || question.scope ? 'math' : 'cs_408')
    const subFolder = domain === 'math' ? '数学错题本' : '408错题本'
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const timestamp = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`
    const safeTitle = (question.chapter || question.subject || '错题')
      .replace(/[\\/:*?"<>|]/g, '_')
    const fileName = `${dateStr}-${safeTitle}-${timestamp}.md`
    const targetPath = `wiki/03-真题与错题/${subFolder}/${fileName}`

    const optionsText = question.options
      ? Object.entries(question.options).map(([k, v]) => `- **${k}**: ${v}`).join('\n')
      : ''

    const content = `
# ❌ 错题复盘：${question.chapter || question.subject} · ${question.id}

## 1. 题目与当时作答
* **科目**：${question.subject}
* **题型**：${question.type === 'choice' ? '选择题' : '填空题'}
* **难度**：${question.difficulty || '中等'}
* **当时作答**：\`${userAnswer || '未作答'}\`
* **标准答案**：\`${question.answer || question.correctAnswer}\`

### 题面：
${question.question}

${optionsText ? `### 选项：\n${optionsText}\n` : ''}

## 2. 错因深度诊断
> [!CAUTION]
> **诊断类型**：\`${errorType || '概念不清'}\`

* **思维障碍/误区复现**：
${notes || '做题时未准确识别考点或计算存在疏漏。'}

## 3. 标准分步严谨推导
${question.explanation || '暂无详细解析'}

${question.steps ? `### 详细步骤：\n${question.steps.join('\n\n')}` : ''}

## 4. 关联知识点与防重犯锚点
- [ ] 对应知识点：[[${question.subject}]]
- [ ] 防重犯准则：审清题设限制条件，严格按照通法分步书写。
`

    const fm = {
      type: 'error_log',
      domain,
      subject: question.subject,
      chapter: question.chapter || '',
      error_type: errorType || '概念不清',
      status: 'active',
      tags: ['错题', domain, question.subject, errorType || '概念不清'],
      created: dateStr,
      updated: dateStr
    }

    createFile(config.vaultPath, targetPath, content, fm)
    markSelfWrite(targetPath)
    invalidateCache()

    res.json({
      success: true,
      savedPath: targetPath,
      fileName
    })
  } catch (err: any) {
    console.error('Save error note failed:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== 4. AI Generate Variant Questions (举一反三) =====

quizRouter.post('/quiz/variant', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const { question } = req.body as { question: any }
    if (!question) {
      res.status(400).json({ error: 'Missing question' })
      return
    }

    const prompt = `你是一个深谙全国硕士研究生考试（408计算机综合与考研数学）的专家。
学生在做以下题目时出现了错误或需要巩固。请针对该题目考察的核心概念与定理，命制 2 道考察相同核心考点、但改变题设参数、条件或考查角度的“举一反三变式训练题”。

【原题信息】：
科目：${question.subject} (${question.domain})
考点章节：${question.chapter || '核心考点'}
原题干：${question.question}
原答案与解析：${question.explanation}

【变式题要求】：
1. 考察相同的定理或算法底层逻辑，但变换参数、反向考查或增加一个易错干扰项。
2. 公式必须规范使用 KaTeX LaTeX 语法（$...$ 或 $$...$$）。
3. 每题必须包含：question, options (A, B, C, D), answer, explanation (详尽分步推导)。
4. 严格只输出纯 JSON 数组：
[
  {
    "id": "var-${Date.now()}-1",
    "domain": "${question.domain}",
    "subject": "${question.subject}",
    "chapter": "${question.chapter || ''}",
    "type": "choice",
    "difficulty": "中等",
    "question": "变式题干（含LaTeX）",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "answer": "B",
    "explanation": "分步解析与破题切入点",
    "tags": ["变式强化", "${question.subject}"]
  }
]`

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: '严格只输出纯 JSON 数组，严禁任何额外文本。',
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '[]'
    let variants = []
    try {
      const match = raw.match(/\[[\s\S]*\]/)
      variants = match ? JSON.parse(match[0]) : JSON.parse(raw)
    } catch {
      res.status(500).json({ error: '变式题生成解析失败', raw })
      return
    }

    res.json({ variants })
  } catch (err: any) {
    console.error('Generate variants error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== 5. Standard Quiz Submit & History =====

quizRouter.post('/quiz/submit', (req, res) => {
  try {
    const { mode, answers, questions, timeTaken } = req.body as {
      mode: 'practice' | 'exam'
      answers: Record<string, string>
      questions: Array<{ id: string; subject: string; question: string; answer: string; explanation: string; tags: string[] }>
      timeTaken: number
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: 'Missing or empty questions' })
      return
    }
    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ error: 'Missing answers' })
      return
    }

    const summary = generateQuizSummary({
      mode: mode || 'practice',
      questions,
      answers,
      timeTaken: timeTaken || 0,
    })

    const subjectBreakdown: Record<string, { total: number; correct: number }> = {}
    for (const q of questions) {
      if (!subjectBreakdown[q.subject]) {
        subjectBreakdown[q.subject] = { total: 0, correct: 0 }
      }
      subjectBreakdown[q.subject].total++
      if (answers[q.id] === q.answer) {
        subjectBreakdown[q.subject].correct++
      }
    }

    let summaryPath = ''
    try {
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const hmStr = now.toTimeString().split(' ')[0].substring(0, 5).replace(':', '')
      const fileName = `${dateStr}-${hmStr}.md`
      const targetPath = `做题记录/${fileName}`

      const fm = {
        type: 'quiz-result',
        date: dateStr,
        mode: mode || 'practice',
        score: questions.length > 0 ? Math.round((summary.correctCount / questions.length) * 100) : 0,
        total: questions.length,
        correct: summary.correctCount,
        wrong: summary.wrongCount,
        tags: ['quiz', '做题记录'],
      }

      try {
        createFile(config.vaultPath, targetPath, summary.content, fm)
      } catch {
        updateFile(config.vaultPath, targetPath, summary.content, fm)
      }
      markSelfWrite(targetPath)
      invalidateCache()
      summaryPath = targetPath
    } catch (saveErr: any) {
      console.error('Quiz summary save error:', saveErr.message)
    }

    res.json({
      result: {
        total: questions.length,
        correct: summary.correctCount,
        wrong: summary.wrongCount,
        timeTaken: timeTaken || 0,
        subjectBreakdown,
      },
      summaryPath,
    })
  } catch (err: any) {
    console.error('Quiz submit error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

quizRouter.get('/quiz/history', (_req, res) => {
  try {
    const quizDir = path.resolve(config.vaultPath, '做题记录')
    if (!fs.existsSync(quizDir)) {
      res.json({ files: [] })
      return
    }

    const files = fs.readdirSync(quizDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .map(f => {
        try {
          const fullPath = path.join(quizDir, f)
          const raw = fs.readFileSync(fullPath, 'utf-8')
          const { data: fm } = matter(raw)
          return {
            fileName: f,
            path: `做题记录/${f}`,
            date: fm.date || '',
            mode: fm.mode || '',
            score: fm.score ?? null,
            total: fm.total ?? null,
            correct: fm.correct ?? null,
            wrong: fm.wrong ?? null,
          }
        } catch {
          return { fileName: f, path: `做题记录/${f}`, date: '', mode: '', score: null, total: null, correct: null, wrong: null }
        }
      })

    res.json({ files })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
