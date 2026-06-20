/**
 * Quiz Summary Generator
 *
 * Generates a Markdown quiz summary note for saving to the Obsidian vault.
 */

interface QuizSummaryParams {
  mode: 'practice' | 'exam'
  questions: Array<{
    id: string
    subject: string
    question: string
    answer: string
    explanation: string
    tags: string[]
  }>
  answers: Record<string, string> // questionId -> user's answer
  timeTaken: number // seconds
}

interface QuizSummaryResult {
  content: string
  wrongCount: number
  correctCount: number
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m} 分 ${s} 秒`
  return `${s} 秒`
}

export function generateQuizSummary(params: QuizSummaryParams): QuizSummaryResult {
  const { mode, questions, answers, timeTaken } = params

  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const timeStr = now.toTimeString().split(' ')[0].substring(0, 5)

  // Grade questions
  const wrongItems: Array<{
    question: QuizSummaryParams['questions'][0]
    userAnswer: string
    isCorrect: boolean
  }> = []
  let correctCount = 0

  for (const q of questions) {
    const userAns = answers[q.id] || '未作答'
    const isCorrect = userAns === q.answer
    if (isCorrect) {
      correctCount++
    } else {
      wrongItems.push({ question: q, userAnswer: userAns, isCorrect })
    }
  }

  const wrongCount = wrongItems.length
  const total = questions.length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0

  // Group wrong answers by subject
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

  // Group wrong answers by tags (weak topic analysis)
  const tagErrors: Record<string, number> = {}
  for (const item of wrongItems) {
    for (const tag of item.question.tags) {
      tagErrors[tag] = (tagErrors[tag] || 0) + 1
    }
  }
  const sortedTags = Object.entries(tagErrors).sort((a, b) => b[1] - a[1])

  // Build markdown
  let md = ''

  // YAML frontmatter
  md += `---\n`
  md += `type: quiz-result\n`
  md += `date: ${dateStr}\n`
  md += `time: '${timeStr}'\n`
  md += `mode: ${mode}\n`
  md += `score: ${score}\n`
  md += `total: ${total}\n`
  md += `correct: ${correctCount}\n`
  md += `wrong: ${wrongCount}\n`
  md += `timeTaken: ${timeTaken}\n`
  md += `tags:\n  - quiz\n  - 做题记录\n`
  md += `---\n\n`

  // Title
  md += `# 做题记录 ${dateStr} ${timeStr}\n\n`

  // Score overview
  md += `## 📊 成绩概览\n\n`
  md += `| 指标 | 数值 |\n`
  md += `| --- | --- |\n`
  md += `| 模式 | ${mode === 'practice' ? '练习模式' : '考试模式'} |\n`
  md += `| 总题数 | ${total} |\n`
  md += `| 正确 | ${correctCount} |\n`
  md += `| 错误 | ${wrongCount} |\n`
  md += `| 正确率 | ${score}% |\n`
  md += `| 用时 | ${formatTime(timeTaken)} |\n`
  md += `\n`

  // Subject breakdown
  md += `## 📚 科目分析\n\n`
  md += `| 科目 | 正确/总数 | 正确率 |\n`
  md += `| --- | --- | --- |\n`
  for (const [subject, data] of Object.entries(subjectBreakdown)) {
    const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    md += `| ${subject} | ${data.correct}/${data.total} | ${pct}% |\n`
  }
  md += `\n`

  // Wrong questions detail
  if (wrongItems.length > 0) {
    md += `## ❌ 错题详情\n\n`
    wrongItems.forEach((item, i) => {
      const q = item.question
      md += `### 错题 ${i + 1}: ${q.subject}\n\n`
      md += `**题目**: ${q.question}\n\n`
      md += `- 你的答案: ${item.userAnswer}\n`
      md += `- 正确答案: **${q.answer}**\n`
      md += `- 难度: ${q.difficulty || '未知'}\n\n`
      md += `**解析**: ${q.explanation}\n\n`
      if (q.tags.length > 0) {
        md += `标签: ${q.tags.map(t => `\`${t}\``).join(', ')}\n\n`
      }
      md += `---\n\n`
    })
  }

  // Weak topic analysis
  if (sortedTags.length > 0) {
    md += `## 🔍 薄弱知识点\n\n`
    md += `以下知识点在错题中出现频率较高，建议重点复习：\n\n`
    for (const [tag, count] of sortedTags.slice(0, 10)) {
      md += `- **${tag}** — 错误 ${count} 题\n`
    }
    md += `\n`
  }

  // Suggested review topics with wiki-links
  if (sortedTags.length > 0) {
    md += `## 📖 建议复习\n\n`
    md += `建议回顾以下相关笔记：\n\n`
    for (const [tag] of sortedTags.slice(0, 8)) {
      md += `- [[${tag}]]\n`
    }
    md += `\n`
  }

  // Footer
  md += `---\n`
  md += `*由在线做题系统自动生成于 ${dateStr} ${timeStr}*\n`

  return {
    content: md,
    wrongCount,
    correctCount,
  }
}
