import { useState, useEffect, useRef, useCallback } from 'react'
import WarmCard from '../components/ui/WarmCard'
import WarmButton from '../components/ui/WarmButton'
import { QUESTION_BANK, type QuizQuestion } from '../data/questions'

// ── Types ──────────────────────────────────────────────────────────────────────

type Subject = QuizQuestion['subject']
type ViewMode = 'start' | 'quiz' | 'results'
type QuizMode = 'practice' | 'exam'

interface SubjectInfo {
  key: Subject
  emoji: string
  color: string
  bgColor: string
}

interface QuizResult {
  total: number
  correct: number
  wrong: number
  timeTaken: number
  subjectBreakdown: Record<string, { total: number; correct: number }>
  wrongQuestions: Array<{
    question: QuizQuestion
    userAnswer: string
  }>
  summaryPath: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const SUBJECTS: SubjectInfo[] = [
  { key: '数据结构', emoji: '🧮', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  { key: '计算机组成原理', emoji: '🖥️', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  { key: '操作系统', emoji: '⚙️', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  { key: '计算机网络', emoji: '🌐', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
]

function getSubjectCount(subject: Subject): number {
  return QUESTION_BANK.filter((q) => q.subject === subject).length
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function Quiz() {
  const [view, setView] = useState<ViewMode>('start')

  // Start view state
  const [selectedSubjects, setSelectedSubjects] = useState<Set<Subject>>(new Set(SUBJECTS.map(s => s.key)))
  const [mode, setMode] = useState<QuizMode>('practice')
  const [questionCount, setQuestionCount] = useState(20)

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [examNavGrid, setExamNavGrid] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Results state
  const [result, setResult] = useState<QuizResult | null>(null)

  // ── Timer ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (view === 'quiz') {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [view])

  // ── Quiz lifecycle ─────────────────────────────────────────────────────────

  const startQuiz = useCallback(() => {
    const pool = QUESTION_BANK.filter((q) => selectedSubjects.has(q.subject))
    const shuffled = shuffleArray(pool)
    const selected = shuffled.slice(0, questionCount)
    setQuestions(selected)
    setCurrentIndex(0)
    setAnswers({})
    setSelectedOption(null)
    setShowFeedback(false)
    setTimeElapsed(0)
    setExamNavGrid(false)
    setView('quiz')
  }, [selectedSubjects, questionCount])

  const handleOptionSelect = useCallback((option: string) => {
    if (view !== 'quiz' || questions.length === 0) return
    const q = questions[currentIndex]

    if (mode === 'practice') {
      if (showFeedback) return
      setSelectedOption(option)
      setShowFeedback(true)
      const newAnswers = { ...answers, [q.id]: option }
      setAnswers(newAnswers)
    } else {
      // exam mode — allow changing answers
      setSelectedOption(option)
      const newAnswers = { ...answers, [q.id]: option }
      setAnswers(newAnswers)
    }
  }, [view, questions, currentIndex, mode, showFeedback, answers])

  const advanceQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      const nextQ = questions[currentIndex + 1]
      setSelectedOption(answers[nextQ.id] || null)
      setShowFeedback(false)
    } else {
      // Last question in practice mode — auto-submit
      finishQuiz()
    }
  }, [currentIndex, questions, answers])

  const finishQuiz = useCallback(async (overrideAnswers?: Record<string, string>) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const finalAnswers = overrideAnswers || answers
    setView('results')

    // Grade locally first
    let correctCount = 0
    const wrongQuestions: QuizResult['wrongQuestions'] = []
    const subjectBreakdown: Record<string, { total: number; correct: number }> = {}

    for (const q of questions) {
      if (!subjectBreakdown[q.subject]) {
        subjectBreakdown[q.subject] = { total: 0, correct: 0 }
      }
      subjectBreakdown[q.subject].total++

      const userAns = finalAnswers[q.id]
      if (userAns === q.answer) {
        correctCount++
        subjectBreakdown[q.subject].correct++
      } else {
        wrongQuestions.push({ question: q, userAnswer: userAns || '未作答' })
      }
    }

    const localResult: QuizResult = {
      total: questions.length,
      correct: correctCount,
      wrong: questions.length - correctCount,
      timeTaken: timeElapsed,
      subjectBreakdown,
      wrongQuestions,
      summaryPath: '',
    }
    setResult(localResult)

    // Submit to server
    try {
      const resp = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          answers: finalAnswers,
          questions: questions.map(q => ({
            id: q.id,
            subject: q.subject,
            question: q.question,
            answer: q.answer,
            explanation: q.explanation,
            tags: q.tags,
          })),
          timeTaken: timeElapsed,
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        setResult((prev) => prev ? { ...prev, summaryPath: data.summaryPath || '' } : prev)
      }
    } catch {
      // Server may be unavailable, local result is still shown
    }
  }, [answers, questions, timeElapsed, mode])

  const toggleSubject = (subject: Subject) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(subject)) {
        if (next.size > 1) next.delete(subject)
      } else {
        next.add(subject)
      }
      return next
    })
  }

  // ── Start View ─────────────────────────────────────────────────────────────

  if (view === 'start') {
    const availableCount = QUESTION_BANK.filter((q) => selectedSubjects.has(q.subject)).length
    const maxQuestions = Math.min(40, availableCount)
    const effectiveCount = Math.min(questionCount, maxQuestions)

    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">📝 在线做题</h1>
          <p className="text-sm text-warm-500 mt-1">408 考研专业课选择题练习</p>
        </div>

        {/* Subject Selection */}
        <div className="grid grid-cols-2 gap-3 max-w-lg">
          {SUBJECTS.map((s) => {
            const count = getSubjectCount(s.key)
            const isSelected = selectedSubjects.has(s.key)
            return (
              <WarmCard
                key={s.key}
                hover
                className={`cursor-pointer border-2 transition-all ${
                  isSelected
                    ? `${s.bgColor} border-current shadow-sm`
                    : 'bg-cream-50 border-cream-200 opacity-60'
                }`}
                onClick={() => toggleSubject(s.key)}
              >
                <div className="flex items-center gap-3 py-1">
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold truncate ${isSelected ? s.color : 'text-warm-500'}`}>
                      {s.key}
                    </div>
                    <div className="text-xs text-warm-400">{count} 题</div>
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-sm">✓</span>
                  )}
                </div>
              </WarmCard>
            )
          })}
        </div>

        {/* Mode Toggle */}
        <WarmCard className="max-w-lg">
          <div className="space-y-3">
            <div className="text-sm font-medium text-warm-700">练习模式</div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('practice')}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  mode === 'practice'
                    ? 'bg-accent-orange text-white shadow-sm'
                    : 'bg-cream-100 text-warm-500 hover:bg-cream-200'
                }`}
              >
                📖 练习模式
                <div className="text-xs mt-0.5 opacity-80">即时反馈 + 解析</div>
              </button>
              <button
                onClick={() => setMode('exam')}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  mode === 'exam'
                    ? 'bg-accent-orange text-white shadow-sm'
                    : 'bg-cream-100 text-warm-500 hover:bg-cream-200'
                }`}
              >
                📋 考试模式
                <div className="text-xs mt-0.5 opacity-80">批量提交 + 评分</div>
              </button>
            </div>
          </div>
        </WarmCard>

        {/* Question Count Slider */}
        <WarmCard className="max-w-lg">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-warm-700">题目数量</span>
              <span className="font-bold text-accent-orange">{effectiveCount} 题</span>
            </div>
            <input
              type="range"
              min={5}
              max={maxQuestions}
              value={effectiveCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-orange-500"
              style={{ background: `linear-gradient(to right, #f97316 0%, #f97316 ${((effectiveCount - 5) / Math.max(1, maxQuestions - 5)) * 100}%, #e7e5e4 ${((effectiveCount - 5) / Math.max(1, maxQuestions - 5)) * 100}%, #e7e5e4 100%)` }}
            />
            <div className="flex justify-between text-xs text-warm-400">
              <span>5</span>
              <span>可用 {availableCount} 题 · 最多 40</span>
              <span>{maxQuestions}</span>
            </div>
          </div>
        </WarmCard>

        {/* Start Button */}
        <WarmButton size="lg" onClick={startQuiz} className="w-full max-w-lg">
          开始做题
        </WarmButton>
      </div>
    )
  }

  // ── Active Quiz View ───────────────────────────────────────────────────────

  if (view === 'quiz' && questions.length > 0) {
    const currentQ = questions[currentIndex]
    const optionKeys = ['A', 'B', 'C', 'D'] as const
    const answeredCount = Object.keys(answers).length
    const progress = ((currentIndex + 1) / questions.length) * 100

    return (
      <div className="space-y-4 animate-fade-in-up">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedSubjects.size < 4 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-warm-600">
                {[...selectedSubjects].join(' · ')}
              </span>
            )}
            <span className="text-sm font-semibold text-warm-700">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-warm-500 tabular-nums">
              {formatTime(timeElapsed)}
            </span>
            {mode === 'exam' && (
              <WarmButton
                variant="ghost"
                size="sm"
                onClick={() => setExamNavGrid(!examNavGrid)}
              >
                {examNavGrid ? '关闭导航' : '题目导航'}
              </WarmButton>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-orange rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Exam Mode Navigation Grid */}
        {mode === 'exam' && examNavGrid && (
          <WarmCard className="mb-2">
            <div className="text-xs text-warm-500 mb-2">点击题号跳转</div>
            <div className="grid grid-cols-10 gap-1.5">
              {questions.map((q, i) => {
                const isAnswered = !!answers[q.id]
                const isCurrent = i === currentIndex
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(i)
                      setSelectedOption(answers[q.id] || null)
                      setExamNavGrid(false)
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-accent-orange text-white'
                        : isAnswered
                          ? 'bg-accent-sage/30 text-accent-sage border border-accent-sage/40'
                          : 'bg-cream-100 text-warm-400 border border-cream-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </WarmCard>
        )}

        {/* Question Card */}
        <WarmCard className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              currentQ.difficulty === '简单' ? 'bg-green-100 text-green-700' :
              currentQ.difficulty === '中等' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {currentQ.difficulty}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-warm-500">
              {currentQ.subject}
            </span>
          </div>
          <p className="text-sm font-medium text-warm-800 leading-relaxed mb-4">
            {currentQ.question}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {optionKeys.map((key) => {
              const optionText = currentQ.options[key]
              const isSelected = selectedOption === key
              const isCorrectAnswer = key === currentQ.answer
              const showResult = mode === 'practice' && showFeedback

              let optionStyle = 'bg-cream-50 border-cream-200 hover:bg-cream-100 hover:border-cream-300'
              if (isSelected && !showResult) {
                optionStyle = 'bg-orange-50 border-accent-orange ring-1 ring-accent-orange/30'
              }
              if (showResult && isCorrectAnswer) {
                optionStyle = 'bg-green-50 border-green-500 ring-1 ring-green-200'
              }
              if (showResult && isSelected && !isCorrectAnswer) {
                optionStyle = 'bg-red-50 border-red-400 ring-1 ring-red-200'
              }

              return (
                <button
                  key={key}
                  onClick={() => handleOptionSelect(key)}
                  disabled={mode === 'practice' && showFeedback}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-all duration-200 ${optionStyle} ${
                    mode === 'practice' && showFeedback ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isSelected && !showResult ? 'bg-accent-orange text-white' :
                      showResult && isCorrectAnswer ? 'bg-green-500 text-white' :
                      showResult && isSelected && !isCorrectAnswer ? 'bg-red-400 text-white' :
                      'bg-cream-200 text-warm-600'
                    }`}>
                      {key}
                    </span>
                    <span className="text-sm text-warm-700 pt-0.5">{optionText}</span>
                    {showResult && isCorrectAnswer && (
                      <span className="ml-auto text-green-600 text-sm pt-0.5">✓ 正确</span>
                    )}
                    {showResult && isSelected && !isCorrectAnswer && (
                      <span className="ml-auto text-red-500 text-sm pt-0.5">✗ 错误</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </WarmCard>

        {/* Explanation Panel (practice mode) */}
        {mode === 'practice' && showFeedback && (
          <WarmCard className="border-l-4 border-l-accent-sage bg-accent-sage/5">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div>
                <div className="text-sm font-semibold text-warm-700 mb-1">解析</div>
                <p className="text-sm text-warm-600 leading-relaxed">{currentQ.explanation}</p>
                {currentQ.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentQ.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-warm-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </WarmCard>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {mode === 'practice' ? (
            <WarmButton
              onClick={advanceQuestion}
              disabled={!showFeedback}
              className="flex-1"
            >
              {currentIndex < questions.length - 1 ? '下一题 →' : '查看结果'}
            </WarmButton>
          ) : (
            <>
              {currentIndex > 0 && (
                <WarmButton variant="secondary" onClick={() => {
                  setCurrentIndex((i) => i - 1)
                  const prevQ = questions[currentIndex - 1]
                  setSelectedOption(answers[prevQ.id] || null)
                  setShowFeedback(false)
                }}>
                  ← 上一题
                </WarmButton>
              )}
              {currentIndex < questions.length - 1 ? (
                <WarmButton
                  variant="secondary"
                  onClick={() => {
                    setCurrentIndex((i) => i + 1)
                    const nextQ = questions[currentIndex + 1]
                    setSelectedOption(answers[nextQ.id] || null)
                    setShowFeedback(false)
                  }}
                  className="flex-1"
                >
                  下一题 →
                </WarmButton>
              ) : null}
              <WarmButton
                onClick={() => finishQuiz()}
                className={currentIndex === questions.length - 1 ? 'flex-1' : ''}
              >
                交卷 ({answeredCount}/{questions.length})
              </WarmButton>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Results View ───────────────────────────────────────────────────────────

  if (view === 'results' && result) {
    const percentage = Math.round((result.correct / result.total) * 100)
    const gradeColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-500'
    const gradeEmoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '💪' : '📚'

    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">📊 做题结果</h1>
          <p className="text-sm text-warm-500 mt-1">
            {mode === 'practice' ? '练习模式' : '考试模式'} · 用时 {formatTime(result.timeTaken)}
          </p>
        </div>

        {/* Score Card */}
        <WarmCard className="max-w-lg text-center py-6">
          <div className="text-4xl mb-2">{gradeEmoji}</div>
          <div className={`text-5xl font-bold ${gradeColor}`}>{percentage}%</div>
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <span className="text-green-600">✓ 正确 {result.correct}</span>
            <span className="text-red-500">✗ 错误 {result.wrong}</span>
            <span className="text-warm-400">共 {result.total} 题</span>
          </div>
        </WarmCard>

        {/* Subject Breakdown */}
        <WarmCard className="max-w-lg">
          <div className="text-sm font-semibold text-warm-700 mb-3">科目正确率</div>
          <div className="space-y-2.5">
            {Object.entries(result.subjectBreakdown).map(([subject, data]) => {
              const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
              const subjectInfo = SUBJECTS.find(s => s.key === subject)
              return (
                <div key={subject}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-warm-600">
                      {subjectInfo?.emoji} {subject}
                    </span>
                    <span className="font-medium text-warm-700">{data.correct}/{data.total} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80 ? 'bg-green-400' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </WarmCard>

        {/* Saved notice */}
        {result.summaryPath && (
          <WarmCard className="max-w-lg border-l-4 border-l-accent-sage bg-accent-sage/5">
            <div className="flex items-center gap-2 text-sm text-warm-700">
              <span>📁</span>
              <span>已归纳到知识库：<code className="text-xs bg-cream-200 px-1.5 py-0.5 rounded">{result.summaryPath}</code></span>
            </div>
          </WarmCard>
        )}

        {/* Wrong Questions List */}
        {result.wrongQuestions.length > 0 && (
          <div className="space-y-2 max-w-lg">
            <div className="text-sm font-semibold text-warm-700">错题详情 ({result.wrongQuestions.length})</div>
            {result.wrongQuestions.map(({ question: q, userAnswer }) => (
              <WarmCard key={q.id} className="border-l-4 border-l-red-300">
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-warm-700">
                    {q.question.substring(0, 60)}{q.question.length > 60 ? '...' : ''}
                  </summary>
                  <div className="mt-2 space-y-1.5 text-sm">
                    <div className="flex gap-4">
                      <span className="text-red-500">你的答案: {userAnswer}</span>
                      <span className="text-green-600">正确答案: {q.answer}</span>
                    </div>
                    <div className="bg-cream-50 rounded-lg p-2.5 mt-1">
                      <span className="text-xs font-medium text-warm-500">解析: </span>
                      <span className="text-xs text-warm-600">{q.explanation}</span>
                    </div>
                    {q.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {q.tags.map(tag => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-cream-200 text-warm-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              </WarmCard>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 max-w-lg">
          <WarmButton onClick={() => setView('start')}>
            再做一轮
          </WarmButton>
          {result.wrongQuestions.length > 0 && (
            <WarmButton variant="secondary" onClick={() => {
              // Scroll to wrong questions section
              const el = document.querySelector('details')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}>
              查看错题
            </WarmButton>
          )}
        </div>
      </div>
    )
  }

  // Fallback (should not reach)
  return null
}
