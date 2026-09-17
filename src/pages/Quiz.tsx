import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Upload,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Star,
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Flame,
  BookOpen,
  BarChart3,
  Database,
  Save,
} from 'lucide-react'
import WarmButton from '../components/ui/WarmButton'
import MarkdownRenderer from '../components/MarkdownRenderer'
import ImportResourceModal from '../components/ImportResourceModal'
import { QUESTION_BANK, type QuizQuestion } from '../data/questions'
import { MATH_QUESTION_BANK } from '../data/questions/math'
import type { MathCategory, MathSubject, CsSubject, UnifiedQuestion } from '../types/subject'

// ── Types ──────────────────────────────────────────────────────────────────────

export type AllSubject = CsSubject | MathSubject
type ViewMode = 'start' | 'quiz' | 'results'
type QuizMode = 'practice' | 'exam'
type QuestionType = 'choice' | 'blank' | 'analysis'

export interface ActiveQuizQuestion {
  id: string
  domain: 'cs_408' | 'math'
  subject: AllSubject
  scope?: MathCategory[]
  chapter?: string
  type: QuestionType
  difficulty: '简单' | '中等' | '困难'
  question: string
  options?: { A: string; B: string; C: string; D: string }
  answer: string
  explanation: string
  steps?: string[]
  keyPoints?: string[]
  tags: string[]
}

interface SubjectInfo {
  key: AllSubject
  domain: 'cs_408' | 'math'
  emoji: string
  color: string
  bgColor: string
  categories?: MathCategory[]
}

interface QuizResult {
  total: number
  correct: number
  wrong: number
  timeTaken: number
  subjectBreakdown: Record<string, { total: number; correct: number }>
  wrongQuestions: Array<{
    question: ActiveQuizQuestion
    userAnswer: string
    errorReason?: string
  }>
  summaryPath: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const ALL_SUBJECTS: SubjectInfo[] = [
  // 408 科目
  { key: '数据结构', domain: 'cs_408', emoji: '🧮', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  { key: '计算机组成原理', domain: 'cs_408', emoji: '🖥️', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  { key: '操作系统', domain: 'cs_408', emoji: '⚙️', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  { key: '计算机网络', domain: 'cs_408', emoji: '🌐', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
  // 考研数学科目
  { key: '高等数学', domain: 'math', emoji: '📐', color: 'text-pink-600', bgColor: 'bg-pink-50 border-pink-200', categories: ['数一', '数二', '数三'] },
  { key: '线性代数', domain: 'math', emoji: '🔢', color: 'text-indigo-600', bgColor: 'bg-indigo-50 border-indigo-200', categories: ['数一', '数二', '数三'] },
  { key: '概率论与数理统计', domain: 'math', emoji: '🎲', color: 'text-teal-600', bgColor: 'bg-teal-50 border-teal-200', categories: ['数一', '数三'] },
]

const ERROR_REASONS = ['概念不清', '公式记错', '计算失误', '忽略定理前提', '思路阻塞', '审题遗漏']

const SCRATCHPAD_MATH_SYMBOLS = [
  { label: '∫ dx', code: '\\int_{a}^{b} f(x)\\,dx' },
  { label: 'lim', code: '\\lim_{x \\to 0}' },
  { label: '∑', code: '\\sum_{i=1}^{n}' },
  { label: '√x', code: '\\sqrt{x}' },
  { label: 'a/b', code: '\\frac{a}{b}' },
  { label: '∂f/∂x', code: '\\frac{\\partial f}{\\partial x}' },
  { label: 'A⁻¹', code: 'A^{-1}' },
  { label: 'λ', code: '\\lambda' },
  { label: '±', code: '\\pm' },
  { label: '∞', code: '\\infty' },
]

function convertCsQuestion(q: QuizQuestion): ActiveQuizQuestion {
  return {
    id: q.id,
    domain: 'cs_408',
    subject: q.subject,
    type: 'choice',
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    tags: q.tags,
  }
}

function convertMathQuestion(q: UnifiedQuestion): ActiveQuizQuestion {
  const optArr = q.options || []
  const cleanOption = (text?: string) => text ? text.replace(/^[A-D][.、\s]+/, '').trim() : ''

  let optionsObj: { A: string; B: string; C: string; D: string } | undefined = undefined
  if (optArr.length >= 2) {
    optionsObj = {
      A: cleanOption(optArr[0]),
      B: cleanOption(optArr[1]),
      C: cleanOption(optArr[2] || ''),
      D: cleanOption(optArr[3] || ''),
    }
  }

  return {
    id: q.id,
    domain: 'math',
    subject: q.subject as MathSubject,
    scope: q.scope,
    chapter: q.chapter,
    type: q.type || (optionsObj ? 'choice' : 'blank'),
    difficulty: q.difficulty,
    question: q.question,
    options: optionsObj,
    answer: q.correctAnswer || 'A',
    explanation: q.explanation,
    steps: q.steps,
    keyPoints: q.keyPoints,
    tags: q.tags,
  }
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

// ── Main Component ──────────────────────────────────────────────────────────

export default function Quiz() {
  const [view, setView] = useState<ViewMode>('start')

  // Subject and category filters
  const [domainFilter, setDomainFilter] = useState<'all' | 'cs_408' | 'math'>('all')
  const [mathCategory, setMathCategory] = useState<MathCategory | 'all'>('all')
  const [selectedSubjects, setSelectedSubjects] = useState<Set<AllSubject>>(new Set(ALL_SUBJECTS.map(s => s.key)))

  // Practice mode & question count
  const [mode, setMode] = useState<QuizMode>('practice')
  const [questionCount, setQuestionCount] = useState(20)

  // Quiz active state
  const [questions, setQuestions] = useState<ActiveQuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [blankInput, setBlankInput] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [errorReasons, setErrorReasons] = useState<Record<string, string>>({})
  const [scratchpads, setScratchpads] = useState<Record<string, string>>({})
  const [activeSideTab, setActiveSideTab] = useState<'palette' | 'scratchpad' | 'hints'>('palette')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scratchpadRef = useRef<HTMLTextAreaElement>(null)

  // Results state
  const [result, setResult] = useState<QuizResult | null>(null)

  // Custom import state & Modal
  const [customQuestions, setCustomQuestions] = useState<ActiveQuizQuestion[]>([])
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [defaultModalTab, setDefaultModalTab] = useState<'books' | 'import_quiz' | 'analytics'>('books')
  const [savingError, setSavingError] = useState(false)
  const [savedErrorMsg, setSavedErrorMsg] = useState<string | null>(null)
  const [generatingVariants, setGeneratingVariants] = useState(false)

  const fetchCustomQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/quiz/custom')
      const data = await res.json()
      if (data.questions && Array.isArray(data.questions)) {
        setCustomQuestions(data.questions.map((q: any) => ({
          id: q.id,
          domain: q.domain || 'math',
          subject: q.subject,
          chapter: q.chapter,
          type: q.type || 'choice',
          difficulty: q.difficulty || '中等',
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          tags: q.tags || ['用户导入'],
        })))
      }
    } catch (err) {
      console.error('Failed to load custom questions:', err)
    }
  }, [])

  useEffect(() => {
    fetchCustomQuestions()
  }, [fetchCustomQuestions])

  const handleSaveToErrorBook = async (currentQ: ActiveQuizQuestion) => {
    setSavingError(true)
    setSavedErrorMsg(null)
    try {
      const res = await fetch('/api/quiz/save-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ,
          userAnswer: answers[currentQ.id] || selectedOption || blankInput,
          errorType: errorReasons[currentQ.id] || '概念不清',
          notes: scratchpads[currentQ.id] || '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSavedErrorMsg(`已自动生成知识库错题笔记: ${data.fileName}`)
        setTimeout(() => setSavedErrorMsg(null), 4000)
      } else {
        alert(data.error || '保存失败')
      }
    } catch (err: any) {
      alert('保存失败: ' + err.message)
    } finally {
      setSavingError(false)
    }
  }

  const handleGenerateVariants = async (currentQ: ActiveQuizQuestion) => {
    setGeneratingVariants(true)
    try {
      const res = await fetch('/api/quiz/variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQ }),
      })
      const data = await res.json()
      if (data.variants && data.variants.length > 0) {
        const formatted: ActiveQuizQuestion[] = data.variants.map((v: any) => ({
          id: v.id,
          domain: v.domain || currentQ.domain,
          subject: v.subject || currentQ.subject,
          chapter: v.chapter || currentQ.chapter,
          type: v.type || 'choice',
          difficulty: v.difficulty || '中等',
          question: v.question,
          options: v.options,
          answer: v.answer,
          explanation: v.explanation,
          tags: v.tags || ['变式强化'],
        }))
        setQuestions(prev => [...prev, ...formatted])
        alert(`已成功生成 ${formatted.length} 道针对考点「${currentQ.chapter || currentQ.subject}」的举一反三变式题，已加入当前答题卡！`)
      } else {
        alert(data.error || '未生成有效变式题')
      }
    } catch (err: any) {
      alert('生成变式题失败: ' + err.message)
    } finally {
      setGeneratingVariants(false)
    }
  }

  // ── Unified Question Pool ───────────────────────────────────────────────────

  const builtInQuestions = useMemo(() => [
    ...QUESTION_BANK.map(convertCsQuestion),
    ...MATH_QUESTION_BANK.map(convertMathQuestion),
  ], [])

  const allAvailableQuestions = useMemo(() => {
    const combined = [...builtInQuestions, ...customQuestions]
    return combined.filter(q => {
      if (!selectedSubjects.has(q.subject)) return false
      if (domainFilter === 'cs_408' && q.domain !== 'cs_408') return false
      if (domainFilter === 'math' && q.domain !== 'math') return false
      if (q.domain === 'math' && mathCategory !== 'all') {
        if (q.scope && !q.scope.includes(mathCategory)) return false
      }
      return true
    })
  }, [builtInQuestions, customQuestions, selectedSubjects, domainFilter, mathCategory])

  const displayedSubjects = useMemo(() => {
    if (domainFilter === 'all') return ALL_SUBJECTS
    return ALL_SUBJECTS.filter(s => s.domain === domainFilter)
  }, [domainFilter])

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

  // ── Keyboard Shortcuts (Linear-style) ──────────────────────────────────────

  useEffect(() => {
    if (view !== 'quiz' || questions.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs or textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      const key = e.key.toUpperCase()
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleOptionSelect(key)
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const map: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' }
        handleOptionSelect(map[e.key])
      } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        if (mode === 'practice' && showFeedback) {
          advanceQuestion()
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) goToQuestion(currentIndex - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, questions, currentIndex, mode, showFeedback, answers])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleDomainFilterChange = (domain: 'all' | 'cs_408' | 'math') => {
    setDomainFilter(domain)
    if (domain === 'cs_408') {
      setSelectedSubjects(new Set(ALL_SUBJECTS.filter(s => s.domain === 'cs_408').map(s => s.key)))
    } else if (domain === 'math') {
      setSelectedSubjects(new Set(ALL_SUBJECTS.filter(s => s.domain === 'math').map(s => s.key)))
    } else {
      setSelectedSubjects(new Set(ALL_SUBJECTS.map(s => s.key)))
    }
  }

  const startQuiz = useCallback(() => {
    if (allAvailableQuestions.length === 0) return
    const shuffled = shuffleArray(allAvailableQuestions)
    const selected = shuffled.slice(0, questionCount)
    setQuestions(selected)
    setCurrentIndex(0)
    setAnswers({})
    setSelectedOption(null)
    setBlankInput('')
    setShowFeedback(false)
    setShowSteps(false)
    setTimeElapsed(0)
    setBookmarkedIds(new Set())
    setErrorReasons({})
    setScratchpads({})
    setActiveSideTab('palette')
    setView('quiz')
  }, [allAvailableQuestions, questionCount])

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return
    setCurrentIndex(index)
    const q = questions[index]
    setSelectedOption(answers[q.id] || null)
    setBlankInput(answers[q.id] || '')
    setShowFeedback(mode === 'practice' && Boolean(answers[q.id]))
    setShowSteps(false)
  }

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
      setSelectedOption(option)
      const newAnswers = { ...answers, [q.id]: option }
      setAnswers(newAnswers)
    }
  }, [view, questions, currentIndex, mode, showFeedback, answers])

  const handleBlankSubmit = () => {
    if (!blankInput.trim()) return
    const q = questions[currentIndex]
    setSelectedOption(blankInput.trim())
    setShowFeedback(true)
    setAnswers({ ...answers, [q.id]: blankInput.trim() })
  }

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const recordErrorReason = (reason: string) => {
    const q = questions[currentIndex]
    setErrorReasons(prev => ({ ...prev, [q.id]: reason }))
  }

  const insertScratchpadSymbol = (symbolCode: string) => {
    const el = scratchpadRef.current
    if (!el) return
    const q = questions[currentIndex]
    const currentText = scratchpads[q.id] || ''
    const start = el.selectionStart
    const end = el.selectionEnd
    const nextText = currentText.substring(0, start) + ` ${symbolCode} ` + currentText.substring(end)
    setScratchpads(prev => ({ ...prev, [q.id]: nextText }))
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + symbolCode.length + 2, start + symbolCode.length + 2)
    }, 0)
  }

  const advanceQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1)
    } else {
      finishQuiz()
    }
  }, [currentIndex, questions, answers, mode])

  const finishQuiz = useCallback(async (overrideAnswers?: Record<string, string>) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const finalAnswers = overrideAnswers || answers
    setView('results')

    let correctCount = 0
    const wrongQuestions: QuizResult['wrongQuestions'] = []
    const subjectBreakdown: Record<string, { total: number; correct: number }> = {}

    for (const q of questions) {
      if (!subjectBreakdown[q.subject]) {
        subjectBreakdown[q.subject] = { total: 0, correct: 0 }
      }
      subjectBreakdown[q.subject].total++

      const userAns = finalAnswers[q.id]
      const isCorrect = userAns && (
        userAns.trim().toUpperCase() === q.answer.trim().toUpperCase() ||
        userAns.trim() === q.answer.replace(/[\$\\s]/g, '')
      )

      if (isCorrect) {
        correctCount++
        subjectBreakdown[q.subject].correct++
      } else {
        wrongQuestions.push({
          question: q,
          userAnswer: userAns || '未作答',
          errorReason: errorReasons[q.id],
        })
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
      // Local result shown
    }
  }, [answers, questions, timeElapsed, mode, errorReasons])



  const toggleSubject = (subject: AllSubject) => {
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

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 1: START SELECTION ARENA
  // ─────────────────────────────────────────────────────────────────────────────

  if (view === 'start') {
    const availableCount = allAvailableQuestions.length
    const maxQuestions = Math.min(50, availableCount)
    const effectiveCount = Math.min(questionCount, Math.max(1, maxQuestions))

    return (
      <div className="mx-auto max-w-[1520px] space-y-7 animate-fade-in-up">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-white/90 via-white/80 to-accent-peach/20 p-7 sm:p-9 shadow-[0_20px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-orange/20 bg-accent-orange/10 px-3 py-1 text-xs font-semibold text-accent-orange">
                <Flame className="h-3.5 w-3.5" />
                <span>全真题库 · 分步推导 · 错因闭环</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <span>研考做题中心 (408 专业课 + 考研数学)</span>
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                支持数一、数二、数三卷种针对性专项练习，LaTeX 严谨推导与分步解析，做题记录与错题自动归档至本地 Obsidian 知识库。
              </p>
            </div>

            <div className="flex items-center gap-3">
              <WarmButton
                size="lg"
                onClick={startQuiz}
                disabled={availableCount === 0}
                className="bg-gradient-to-r from-accent-orange via-blue-600 to-indigo-600 text-white shadow-lg shadow-accent-orange/25 px-8 py-3.5 text-sm font-semibold hover:scale-105 transition-transform"
              >
                {availableCount > 0 ? `开始做题 (${effectiveCount} 题) →` : '暂无匹配试题'}
              </WarmButton>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-1">学科领域:</span>
            <div className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-1">
              <button
                onClick={() => handleDomainFilterChange('all')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  domainFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部学科
              </button>
              <button
                onClick={() => handleDomainFilterChange('math')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  domainFilter === 'math' ? 'bg-white text-pink-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📐 考研数学
              </button>
              <button
                onClick={() => handleDomainFilterChange('cs_408')}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  domainFilter === 'cs_408' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🖥️ 408 计算机
              </button>
            </div>

            {(domainFilter === 'math' || domainFilter === 'all') && (
              <div className="flex items-center gap-1 ml-2 rounded-xl border border-slate-200 bg-slate-100/80 p-1 text-xs">
                <span className="text-slate-400 pl-2 pr-1 text-[11px]">数学卷种:</span>
                {(['all', '数一', '数二', '数三'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMathCategory(cat)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                      mathCategory === cat ? 'bg-white text-accent-orange shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'all' ? '全部卷' : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setSelectedSubjects(new Set(displayedSubjects.map(s => s.key)))}
            className="text-xs font-medium text-accent-orange hover:underline"
          >
            全选当前组学科
          </button>
        </div>

        {/* Subjects Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {displayedSubjects.map((s) => {
            const count = [...builtInQuestions, ...customQuestions].filter(q => {
              if (q.subject !== s.key) return false
              if (q.domain === 'math' && mathCategory !== 'all') {
                if (q.scope && !q.scope.includes(mathCategory)) return false
              }
              return true
            }).length
            const isSelected = selectedSubjects.has(s.key)
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleSubject(s.key)}
                className={`glass-panel rounded-2xl p-4 text-left transition-all relative border-2 ${
                  isSelected
                    ? `${s.bgColor} border-current shadow-md`
                    : 'bg-white/60 border-slate-200/60 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.emoji}</span>
                  {isSelected && (
                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className={`text-xs font-bold truncate ${isSelected ? s.color : 'text-slate-700'}`}>
                  {s.key}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-medium">{count} 题储备</div>
              </button>
            )
          })}
        </div>

        {/* Mode & Settings Config Cards */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Mode Selector */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">演练模式选择</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('practice')}
                className={`rounded-2xl p-4 text-left border-2 transition-all ${
                  mode === 'practice'
                    ? 'border-accent-orange bg-accent-orange/8 shadow-sm'
                    : 'border-slate-200 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📖</span>
                  <span className="text-sm font-bold text-slate-900">练习模式 (推荐)</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  做完即刻展示 KaTeX 详细推导与定理引用，支持针对错题进行错因标注。
                </p>
              </button>

              <button
                onClick={() => setMode('exam')}
                className={`rounded-2xl p-4 text-left border-2 transition-all ${
                  mode === 'exam'
                    ? 'border-accent-orange bg-accent-orange/8 shadow-sm'
                    : 'border-slate-200 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <span className="text-sm font-bold text-slate-900">全真考试模式</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  全真计时模考，统一通过答题卡交卷并生成各学科正确率深度成绩单。
                </p>
              </button>
            </div>
          </div>

          {/* Question Count Slider */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900">单次抽题数量</span>
              <span className="text-base font-bold text-accent-orange">{effectiveCount} 题</span>
            </div>
            <input
              type="range"
              min={1}
              max={Math.max(1, maxQuestions)}
              value={effectiveCount}
              disabled={availableCount === 0}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2.5 rounded-full appearance-none cursor-pointer accent-orange-500 bg-slate-200"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>1 题（快速演练）</span>
              <span>可用题量 {availableCount} 题</span>
              <span>{maxQuestions} 题（完整套卷）</span>
            </div>
          </div>
        </div>

        {/* Resource Ingestion & Student Analytics Banner Card */}
        <div className="glass-panel rounded-3xl p-5 border border-indigo-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/60">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">智能资料与题库导入中心</span>
                {customQuestions.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    已入库 {customQuestions.length} 道自定义真题
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                支持导入手头教材参考书（PDF/MD）、智能文本识别题库、学情画像诊断
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setDefaultModalTab('analytics')
                setImportModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <span>学情画像</span>
            </button>

            <button
              onClick={() => {
                setDefaultModalTab('books')
                setImportModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>导入参考书 / 题库</span>
            </button>
          </div>
        </div>

        <ImportResourceModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onQuestionsUpdated={fetchCustomQuestions}
          defaultTab={defaultModalTab}
        />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 2: DUAL-PANEL PRO EXAM & LEARNING WORKBENCH (双栏专业做题工作台)
  // ─────────────────────────────────────────────────────────────────────────────

  if (view === 'quiz' && questions.length > 0) {
    const currentQ = questions[currentIndex]
    const optionKeys = ['A', 'B', 'C', 'D'] as const
    const hasOptions = Boolean(currentQ.options && currentQ.options.A)
    const isBookmarked = bookmarkedIds.has(currentQ.id)
    const answeredCount = Object.keys(answers).length
    const progressPct = ((currentIndex + 1) / questions.length) * 100
    const currentScratchpad = scratchpads[currentQ.id] || ''

    return (
      <div className="mx-auto max-w-[1560px] space-y-4 animate-fade-in-up">
        {/* Top Slim Progress Header */}
        <div className="glass-panel rounded-2xl px-5 py-2.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('确定要退出当前做题吗？已做答案仍会被统计。')) {
                  finishQuiz()
                }
              }}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <ArrowLeft size={14} />
              <span>交卷退出</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-800">
              {currentQ.subject}
            </span>
            {currentQ.chapter && (
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                · {currentQ.chapter}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setDefaultModalTab('books')
                setImportModalOpen(true)
              }}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Database size={13} className="text-indigo-600" />
              <span>题库与书架</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5 tabular-nums">
              <span>⏱</span>
              <span className="font-semibold text-slate-800">{formatTime(timeElapsed)}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-700">
              {currentIndex + 1} / {questions.length} 题
            </span>
          </div>
        </div>

        {/* Dual-Panel Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.22fr_0.78fr] gap-5 items-start">
          {/* ───────────────── LEFT PANEL: Question & Solution ───────────────── */}
          <div className="space-y-4">
            <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5 relative shadow-md">
              {/* Question Meta Badges */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentQ.difficulty === '简单' ? 'bg-emerald-100 text-emerald-700' :
                    currentQ.difficulty === '中等' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {currentQ.difficulty}
                  </span>

                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {currentQ.type === 'blank' ? '填空题' : currentQ.type === 'analysis' ? '解答题' : '单选题'}
                  </span>

                  {currentQ.scope && (
                    <span className="text-[11px] text-slate-500 font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      适用：{currentQ.scope.join(' / ')}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleBookmark(currentQ.id)}
                  title={isBookmarked ? '取消标星' : '标星关注此题'}
                  className={`p-1.5 rounded-xl transition-colors ${
                    isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Star size={17} className={isBookmarked ? 'fill-amber-500' : ''} />
                </button>
              </div>

              {/* Question Text (KaTeX Rendered) */}
              <div className="text-[15px] font-medium text-slate-900 leading-relaxed min-h-[4rem]">
                <MarkdownRenderer content={currentQ.question} />
              </div>

              {/* Answering Area */}
              {hasOptions ? (
                /* Choice Options (选择题选项) */
                <div className="space-y-3 pt-2">
                  {optionKeys.map((key) => {
                    const optionText = currentQ.options![key]
                    if (!optionText) return null
                    const isSelected = selectedOption === key
                    const isCorrectAnswer = key.toUpperCase() === currentQ.answer.toUpperCase()
                    const showResult = mode === 'practice' && showFeedback

                    let btnStyle = 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                    if (isSelected && !showResult) {
                      btnStyle = 'border-accent-orange bg-accent-orange/8 ring-2 ring-accent-orange/30 text-slate-900 font-medium shadow-sm'
                    }
                    if (showResult && isCorrectAnswer) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-300 shadow-sm'
                    }
                    if (showResult && isSelected && !isCorrectAnswer) {
                      btnStyle = 'border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-300 shadow-sm'
                    }

                    return (
                      <button
                        key={key}
                        onClick={() => handleOptionSelect(key)}
                        disabled={mode === 'practice' && showFeedback}
                        className={`w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-all duration-200 group flex items-start gap-3.5 ${btnStyle} ${
                          mode === 'practice' && showFeedback ? 'cursor-default' : 'cursor-pointer hover:scale-[1.005]'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected && !showResult ? 'bg-accent-orange text-white' :
                          showResult && isCorrectAnswer ? 'bg-emerald-500 text-white' :
                          showResult && isSelected && !isCorrectAnswer ? 'bg-rose-500 text-white' :
                          'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}>
                          {key}
                        </span>

                        <div className="flex-1 text-sm pt-0.5">
                          <MarkdownRenderer content={optionText} inline />
                        </div>

                        {showResult && isCorrectAnswer && (
                          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                        )}
                        {showResult && isSelected && !isCorrectAnswer && (
                          <XCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                /* Blank / Fill-in Answer Area (填空题输入区) */
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <span>✍️ 填空题作答</span>
                    <span className="text-[10px] text-slate-400 font-normal">（支持直接输入数值或数学表达式）</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={blankInput}
                      onChange={(e) => setBlankInput(e.target.value)}
                      placeholder="在此键入你的计算结果..."
                      disabled={mode === 'practice' && showFeedback}
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-accent-orange font-mono"
                    />
                    <button
                      onClick={handleBlankSubmit}
                      disabled={(mode === 'practice' && showFeedback) || !blankInput.trim()}
                      className="rounded-xl bg-accent-orange text-white px-5 py-2.5 text-xs font-semibold hover:bg-accent-orange/90 disabled:opacity-40 transition-all"
                    >
                      提交验证
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>上一题</span>
                </button>

                <div className="text-xs text-slate-400">
                  键盘快捷键：<kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">A/B/C/D</kbd> 作答 · <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">Enter</kbd> 下一题
                </div>

                <WarmButton
                  onClick={advanceQuestion}
                  disabled={mode === 'practice' && !showFeedback}
                  className="bg-accent-orange text-white px-6"
                >
                  <span>{currentIndex < questions.length - 1 ? '下一题 →' : '交卷结算'}</span>
                </WarmButton>
              </div>
            </div>

            {/* Explanation & Step-by-Step Derivation (Notion / Brilliant Style) */}
            {mode === 'practice' && showFeedback && (
              <div className="glass-panel rounded-3xl p-6 border-l-4 border-l-emerald-500 space-y-4 animate-fade-in-up">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <span className="text-base">💡</span>
                    <span>真题全解与定理依据</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    正确答案: {currentQ.answer}
                  </span>
                </div>

                {/* Main Explanation */}
                <div className="text-sm text-slate-700 leading-relaxed pl-1">
                  <MarkdownRenderer content={currentQ.explanation} />
                </div>

                {/* Brilliant-style Collapsible Step-by-Step Derivation */}
                {currentQ.steps && currentQ.steps.length > 0 && (
                  <div className="pt-3 border-t border-slate-200/80">
                    <button
                      onClick={() => setShowSteps(!showSteps)}
                      className="flex items-center gap-1.5 text-xs font-bold text-accent-orange hover:opacity-85 transition-opacity"
                    >
                      {showSteps ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      <span>展开分步严谨推导与定理引用 ({currentQ.steps.length} 步)</span>
                    </button>

                    {showSteps && (
                      <div className="mt-3 space-y-2 pl-2 border-l-2 border-accent-orange/40">
                        {currentQ.steps.map((step, idx) => (
                          <div key={idx} className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 text-xs text-slate-800">
                            <span className="font-bold text-accent-orange mr-1.5">步骤 {idx + 1}.</span>
                            <MarkdownRenderer content={step} inline />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Anki-style Error Reason Tagging (错因反思闭环) */}
                <div className="pt-3 border-t border-slate-200/80">
                  <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                    <span>📌 本题复盘归因（记录后存入错题本）：</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ERROR_REASONS.map(reason => {
                      const active = errorReasons[currentQ.id] === reason
                      return (
                        <button
                          key={reason}
                          onClick={() => recordErrorReason(reason)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            active
                              ? 'bg-accent-orange text-white border-accent-orange font-semibold shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {reason}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Actions: Save to Vault Error Notebook & AI Variant Generator */}
                <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveToErrorBook(currentQ)}
                      disabled={savingError}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save size={13} />
                      <span>{savingError ? '正在写入知识库...' : '💾 沉淀到错题本 (生成Markdown)'}</span>
                    </button>

                    <button
                      onClick={() => handleGenerateVariants(currentQ)}
                      disabled={generatingVariants}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles size={13} className="text-indigo-600" />
                      <span>{generatingVariants ? 'AI 正在命题...' : '🔄 举一反三：AI 变式题强化'}</span>
                    </button>
                  </div>

                  {savedErrorMsg && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
                      <CheckCircle2 size={13} />
                      {savedErrorMsg}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ───────────────── RIGHT PANEL: Strategic Workbench ───────────────── */}
          <div className="glass-panel rounded-3xl p-5 space-y-4 sticky top-20 shadow-md">
            {/* Tab Header */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setActiveSideTab('palette')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeSideTab === 'palette' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🧮 答题卡大纲
              </button>
              <button
                onClick={() => setActiveSideTab('scratchpad')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeSideTab === 'scratchpad' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📝 研考草稿纸
              </button>
              <button
                onClick={() => setActiveSideTab('hints')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeSideTab === 'hints' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                💡 定理速查
              </button>
            </div>

            {/* TAB 1: Answer Palette (答题卡矩阵 - 粉笔/LeetCode 风格) */}
            {activeSideTab === 'palette' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>已完成 {answeredCount} / {questions.length} 题</span>
                  <span>标星关注 {bookmarkedIds.size} 题</span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-orange rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Question Chips Grid */}
                <div className="grid grid-cols-7 sm:grid-cols-8 md:grid-cols-10 gap-1.5 pt-1">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex
                    const isAnswered = Boolean(answers[q.id])
                    const isCorrect = isAnswered && (
                      answers[q.id].trim().toUpperCase() === q.answer.trim().toUpperCase() ||
                      answers[q.id].trim() === q.answer.replace(/[\$\\s]/g, '')
                    )
                    const isStarred = bookmarkedIds.has(q.id)

                    let chipStyle = 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    if (isCurrent) {
                      chipStyle = 'border-accent-orange bg-accent-orange text-white font-bold ring-2 ring-accent-orange/40 shadow-sm'
                    } else if (mode === 'practice' && isAnswered) {
                      chipStyle = isCorrect
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-800 font-semibold'
                        : 'border-rose-300 bg-rose-100 text-rose-800 font-semibold'
                    } else if (isAnswered) {
                      chipStyle = 'border-slate-700 bg-slate-800 text-white font-semibold'
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => goToQuestion(idx)}
                        className={`h-8 rounded-xl text-xs flex items-center justify-center transition-all relative border ${chipStyle}`}
                      >
                        <span>{idx + 1}</span>
                        {isStarred && (
                          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 ring-1 ring-white" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-orange" /> 当前题
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 已正确
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> 需复盘
                  </span>
                </div>

                <WarmButton
                  onClick={() => finishQuiz()}
                  className="w-full mt-2 bg-slate-900 text-white py-2.5 text-xs font-semibold"
                >
                  完成全卷并交卷 ({answeredCount}/{questions.length})
                </WarmButton>
              </div>
            )}

            {/* TAB 2: Scratchpad & Math Virtual Keyboard (Symbolab 风格) */}
            {activeSideTab === 'scratchpad' && (
              <div className="space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">当前试题专用草稿</span>
                  <span className="text-[11px] text-slate-400">自动绑定第 {currentIndex + 1} 题</span>
                </div>

                {/* Math Symbol Quick Insert Bar */}
                <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-slate-100 border border-slate-200">
                  {SCRATCHPAD_MATH_SYMBOLS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => insertScratchpadSymbol(s.code)}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-accent-orange/10 hover:text-accent-orange border border-slate-200 text-xs font-mono font-medium transition-colors shadow-2xs"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Scratchpad Textarea */}
                <textarea
                  ref={scratchpadRef}
                  value={currentScratchpad}
                  onChange={(e) => setScratchpads({ ...scratchpads, [currentQ.id]: e.target.value })}
                  placeholder="在此随手推演公式、草拟计算步骤，无需切换草稿本..."
                  rows={9}
                  className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-accent-orange leading-relaxed"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>草稿在本次练习中自动保存</span>
                  <button
                    onClick={() => setScratchpads({ ...scratchpads, [currentQ.id]: '' })}
                    className="text-rose-500 hover:underline"
                  >
                    清空本题草稿
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Theorem Hints & AI Assistant */}
            {activeSideTab === 'hints' && (
              <div className="space-y-3 animate-fade-in-up">
                <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-amber-500" />
                  <span>本题核心定理与公式提示</span>
                </div>

                {currentQ.keyPoints && currentQ.keyPoints.length > 0 ? (
                  <div className="space-y-2">
                    {currentQ.keyPoints.map((kp, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold text-accent-orange mr-1">✦</span>
                        {kp}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3">本题考查基础定义与综合逻辑。</p>
                )}

                {currentQ.tags && currentQ.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {currentQ.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <ImportResourceModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onQuestionsUpdated={fetchCustomQuestions}
          defaultTab={defaultModalTab}
        />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW 3: COMPREHENSIVE PERFORMANCE RESULTS (成绩单与错题精析)
  // ─────────────────────────────────────────────────────────────────────────────

  if (view === 'results' && result) {
    const percentage = Math.round((result.correct / result.total) * 100)
    const gradeColor = percentage >= 80 ? 'text-emerald-600' : percentage >= 60 ? 'text-amber-500' : 'text-rose-500'
    const gradeEmoji = percentage >= 80 ? '🎉' : percentage >= 60 ? '💪' : '📚'

    return (
      <div className="mx-auto max-w-[1280px] space-y-6 animate-fade-in-up">
        {/* Results Hero Header */}
        <div className="glass-panel rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">做题测评结算</div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>{gradeEmoji} 测评报告生成完毕</span>
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {mode === 'practice' ? '练习模式' : '考试模式'} · 答题用时 {formatTime(result.timeTaken)} · 成绩已沉淀至本地 Vault
            </p>
          </div>

          <div className="flex items-center gap-8 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200">
            <div className="text-center">
              <div className="text-xs text-slate-400">总得分率</div>
              <div className={`text-4xl font-extrabold ${gradeColor}`}>{percentage}%</div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="space-y-1 text-xs font-medium">
              <div className="text-emerald-600 flex items-center gap-1.5">
                <span>✓ 正确</span> <span>{result.correct} 题</span>
              </div>
              <div className="text-rose-500 flex items-center gap-1.5">
                <span>✗ 错题</span> <span>{result.wrong} 题</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Breakdown Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(result.subjectBreakdown).map(([subject, data]) => {
            const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
            const info = ALL_SUBJECTS.find(s => s.key === subject)
            return (
              <div key={subject} className="glass-panel rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{info?.emoji || '📖'}</span>
                    <span>{subject}</span>
                  </span>
                  <span className="font-semibold text-slate-700">{data.correct} / {data.total} ({pct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Wrong Questions Breakdown */}
        {result.wrongQuestions.length > 0 && (
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-rose-500">✗</span>
              <span>错题精析与复盘 ({result.wrongQuestions.length} 题)</span>
            </h2>

            <div className="space-y-3">
              {result.wrongQuestions.map(({ question: q, userAnswer, errorReason }) => (
                <div key={q.id} className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {q.subject}
                      </span>
                      {errorReason && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                          错因: {errorReason}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono flex items-center gap-3">
                      <span className="text-rose-600 font-semibold">你的回答: {userAnswer}</span>
                      <span className="text-emerald-700 font-bold">标准答案: {q.answer}</span>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-slate-900">
                    <MarkdownRenderer content={q.question} />
                  </div>

                  <div className="bg-white/80 rounded-xl p-3 border border-slate-200 text-xs text-slate-700">
                    <div className="font-bold text-slate-800 mb-1">解析：</div>
                    <MarkdownRenderer content={q.explanation} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <WarmButton onClick={() => setView('start')} className="bg-accent-orange text-white px-8">
            再练一轮
          </WarmButton>
          <WarmButton variant="secondary" onClick={() => window.location.href = '/dashboard'}>
            返回首页工作台
          </WarmButton>
        </div>

        <ImportResourceModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onQuestionsUpdated={fetchCustomQuestions}
          defaultTab={defaultModalTab}
        />
      </div>
    )
  }

  return null
}
