import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { config, anthropic, markSelfWrite, invalidateCache } from '../context.js'
import { createFile, updateFile } from '../vault-parser.js'
import { generateQuizSummary } from '../quiz-summary.js'

export const quizRouter = Router()

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

quizRouter.post('/quiz/generate', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }
    const { prompt } = req.body as { prompt: string }
    if (!prompt) {
      res.status(400).json({ error: '缺少 prompt 参数' })
      return
    }

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: '你是一个专业的出题专家。请严格按照用户要求的JSON格式输出题目，不要添加任何额外文字、解释或markdown标记。只输出纯JSON数组。',
      messages: [{ role: 'user', content: prompt }],
    })

    const text = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '[]'
    res.json({ questions: text })
  } catch (err: any) {
    console.error('Quiz generate error:', err.message)
    res.status(500).json({ error: 'AI 生成失败: ' + err.message })
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
