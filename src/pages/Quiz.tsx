import { getAuthHeaders } from '../services/auth'
import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import {
  Upload,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Star,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  XCircle,
  X,
  Flame,
  BookOpen,
  BarChart3,
  Database,
  Save,
  MessageCircle,
  Camera,
  Code2,
} from 'lucide-react'
import WarmButton from '../components/ui/WarmButton'
import MarkdownRenderer from '../components/MarkdownRenderer'
import DoodleScratchpadCanvas from '../features/quiz/components/DoodleScratchpadCanvas'
import { api } from '../services/api'
import { QUESTION_BANK, type QuizQuestion } from '../data/questions'
import { MATH_QUESTION_BANK } from '../data/questions/math'
import { updateMasteryFromQuizResult } from '../data/masteryData'
import type { MathCategory, MathSubject, CsSubject, UnifiedQuestion } from '../types/subject'
import {
  ALL_EXAM_PAPERS,
  filterPaperQuestions,
  getPaperStats,
  getAvailablePaperYears,
  type ExamPaper,
  type ExamPaperQuestion,
  type PaperCategory,
  type PaperFilterSection,
} from '../data/examPapers'


const ImportResourceModal = lazy(() => import('../components/ImportResourceModal'))
const AlgorithmSandboxModal = lazy(() => import('../features/quiz/components/AlgorithmSandboxModal'))
const ExamPaperHubView = lazy(() => import('../features/quiz/components/ExamPaperHubView'))

// 内存级题库缓存，切页秒开不闪烁
let cachedCustomQuestionsList: ActiveQuizQuestion[] | null = null

import type {
  AllSubject,
  ViewMode,
  QuizMode,
  QuestionType,
  ActiveQuizQuestion,
  SubjectInfo,
  QuizResult,
} from '../features/quiz/types'
import { ALL_SUBJECTS, ERROR_REASONS, SCRATCHPAD_MATH_SYMBOLS } from '../features/quiz/constants'
import { convertCsQuestion, convertMathQuestion, shuffleArray, formatTime } from '../features/quiz/utils'

// 向后兼容：保留原有的类型导出入口
export type { AllSubject, ActiveQuizQuestion } from '../features/quiz/types'

// ── Main Component ──────────────────────────────────────────────────────────

export default function Quiz() {
  const [searchParams] = useSearchParams()
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
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scratchpadRef = useRef<HTMLTextAreaElement>(null)

  // Results state
  const [result, setResult] = useState<QuizResult | null>(null)

  // Custom import state & Modal (优先从内存缓存中直出)
  const [customQuestions, setCustomQuestions] = useState<ActiveQuizQuestion[]>(() => cachedCustomQuestionsList || [])
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [defaultModalTab, setDefaultModalTab] = useState<'books' | 'import_quiz' | 'analytics'>('books')
  const [algoModalOpen, setAlgoModalOpen] = useState(false)
  const [selectedAlgoId, setSelectedAlgoId] = useState<string | undefined>(undefined)
  const [savingError, setSavingError] = useState(false)
  const [savedErrorMsg, setSavedErrorMsg] = useState<string | null>(null)
  const [generatingVariants, setGeneratingVariants] = useState(false)
  const [variantModalOpen, setVariantModalOpen] = useState(false)
  const [variantSourceQ, setVariantSourceQ] = useState<ActiveQuizQuestion | null>(null)
  const [variantQuestions, setVariantQuestions] = useState<ActiveQuizQuestion[]>([])
  const [variantAnswers, setVariantAnswers] = useState<Record<string, string>>({})
  const [variantShowExplanation, setVariantShowExplanation] = useState<Record<string, boolean>>({})
  const [savingAllErrors, setSavingAllErrors] = useState(false)
  const [saveAllMsg, setSaveAllMsg] = useState<string | null>(null)
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set())

  // ── 历年真题整卷库状态 ────────────────────────────────────────────────────────
  const [hubTab, setHubTab] = useState<'papers' | 'topics'>('papers')
  const [selectedPaperCategory, setSelectedPaperCategory] = useState<'all' | PaperCategory>('all')
  const [selectedPaperYear, setSelectedPaperYear] = useState<'all' | number>('all')
  const [activePaperContext, setActivePaperContext] = useState<{
    paperId: string
    title: string
    year: number
    category: PaperCategory
    section: PaperFilterSection
    totalScore: number
    durationMinutes: number
  } | null>(null)


  const fetchCustomQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/quiz/custom', { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.questions && Array.isArray(data.questions)) {
        const mapped: ActiveQuizQuestion[] = data.questions.map((q: any) => ({
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
        }))
        setCustomQuestions(mapped)
        cachedCustomQuestionsList = mapped
      }
    } catch (err) {
      console.error('Failed to load custom questions:', err)
    }
  }, [])

  useEffect(() => {
    fetchCustomQuestions()
    const onCustomUpdated = () => {
      fetchCustomQuestions()
    }
    window.addEventListener('custom-questions-updated', onCustomUpdated)
    return () => {
      window.removeEventListener('custom-questions-updated', onCustomUpdated)
    }
  }, [fetchCustomQuestions])

  useEffect(() => {
    const domainParam = searchParams.get('domain')
    if (domainParam === 'cs_408' || domainParam === 'math') {
      setDomainFilter(domainParam)
      setSelectedSubjects(new Set(ALL_SUBJECTS.filter(s => s.domain === domainParam).map(s => s.key)))
    }
  }, [searchParams])

  const handleSaveToErrorBook = async (currentQ: ActiveQuizQuestion) => {
    setSavingError(true)
    setSavedErrorMsg(null)
    try {
      const res = await fetch('/api/quiz/save-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          question: currentQ,
          userAnswer: answers[currentQ.id] || selectedOption || blankInput,
          errorType: errorReasons[currentQ.id] || '概念不清',
          notes: scratchpads[currentQ.id] || '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSavedItemIds(prev => new Set(prev).add(currentQ.id))
        setSavedErrorMsg(`已自动生成知识库错题笔记: ${data.fileName}`)
        window.dispatchEvent(new CustomEvent('vault-updated'))
        window.dispatchEvent(new CustomEvent('daily-errors-updated'))
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

  const handleSaveAllWrongQuestions = async () => {
    if (!result?.wrongQuestions || result.wrongQuestions.length === 0) return
    setSavingAllErrors(true)
    setSaveAllMsg(null)
    try {
      let successCount = 0
      for (const item of result.wrongQuestions) {
        const res = await fetch('/api/quiz/save-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            question: item.question,
            userAnswer: item.userAnswer,
            errorType: errorReasons[item.question.id] || item.errorReason || '概念模糊',
            notes: scratchpads[item.question.id] || '',
          }),
        })
        const data = await res.json()
        if (data.success) {
          successCount++
          setSavedItemIds(prev => new Set(prev).add(item.question.id))
        }
      }
      setSaveAllMsg(`🎉 成功将 ${successCount} 道错题批量沉淀至 Obsidian 错题集！`)
      window.dispatchEvent(new CustomEvent('vault-updated'))
      window.dispatchEvent(new CustomEvent('daily-errors-updated'))
      setTimeout(() => setSaveAllMsg(null), 5000)
    } catch (err: any) {
      alert('批量归档失败: ' + err.message)
    } finally {
      setSavingAllErrors(false)
    }
  }

  const handleGenerateVariants = async (currentQ: ActiveQuizQuestion) => {
    setGeneratingVariants(true)
    setVariantSourceQ(currentQ)
    setVariantAnswers({})
    setVariantShowExplanation({})
    try {
      const res = await fetch('/api/quiz/variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
        setVariantQuestions(formatted)
        setVariantModalOpen(true)
      } else {
        alert(data.error || '未生成有效变式题，请重试')
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

  // (键盘快捷键流已统一定义在下方，包含 A/B/C/D、1/2/3/4、方向键翻题与 Enter 展开解析)

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

  const startPaperQuiz = useCallback((paper: ExamPaper, section: PaperFilterSection = 'all') => {
    const paperQs = filterPaperQuestions(paper, section)
    if (paperQs.length === 0) return

    const mapped: ActiveQuizQuestion[] = paperQs.map((q) => {
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
        domain: q.domain,
        subject: q.subject as any,
        scope: q.scope,
        chapter: q.chapter,
        type: q.type || (optionsObj ? 'choice' : 'analysis'),
        difficulty: q.difficulty,
        question: q.question,
        options: optionsObj,
        answer: q.correctAnswer || '见标准分步推导',
        explanation: q.explanation,
        steps: q.steps,
        keyPoints: q.keyPoints,
        tags: q.tags,
        paperTitle: paper.title,
        paperQuestionNumber: q.paperQuestionNumber,
        score: q.score,
        sectionName: q.sectionName,
      }
    })

    const sectionTotalScore = section === 'all'
      ? paper.totalScore
      : mapped.reduce((acc, cur) => acc + (cur.score || 0), 0)

    setActivePaperContext({
      paperId: paper.id,
      title: paper.title,
      year: paper.year,
      category: paper.category,
      section,
      totalScore: sectionTotalScore,
      durationMinutes: section === 'all' ? paper.durationMinutes : Math.max(30, mapped.length * 4),
    })

    setQuestions(mapped)
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
  }, [])

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
    setMobileDrawerOpen(false)
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

  // 原地闭环唤起双核 AI 伴学舱追问当前题目
  const handleAskAI = useCallback((q: ActiveQuizQuestion) => {
    const userAns = answers[q.id]
    const subjectInfo = ALL_SUBJECTS.find(s => s.key === q.subject)?.key || q.subject || '考研真题'
    
    let optionsText = ''
    if (q.options) {
      optionsText = Object.entries(q.options)
        .filter(([_, text]) => Boolean(text))
        .map(([key, text]) => `   ${key}. ${text}`)
        .join('\n')
    }
    
    const contextPrompt = [
      `【当前考研科目与考点】：${subjectInfo} · ${q.chapter || '考点演练'}`,
      `【题型与题号】：${q.type === 'blank' ? '填空/计算题' : '单项选择题'} (题号 #${q.id})`,
      `【完整题干】：\n${q.question}`,
      optionsText ? `【题目选项】：\n${optionsText}` : null,
      `【我的作答】：${userAns ? userAns : '（尚未作答 / 存在疑惑）'}`,
      q.answer ? `【标准答案】：${q.answer}` : null,
      q.explanation ? `【参考解析与定理】：\n${q.explanation}` : null
    ].filter(Boolean).join('\n\n')

    const defaultInput = userAns && q.answer && userAns.toUpperCase() !== q.answer.toUpperCase()
      ? `为什么我的选项 ${userAns} 不对？请结合考研定理与本题陷阱详细剖析：`
      : `请针对这道题的核心考点与解题突破口，为我详细拆解思维推导过程：`

    window.dispatchEvent(new CustomEvent('open-ai-assistant', {
      detail: {
        contextPrompt,
        defaultInput
      }
    }))
  }, [answers])

  // UI/UX Pro Max · 全面补齐键盘快捷键流 (Keyboard-First 体验)
  // 支持 A/B/C/D 或 1/2/3/4 直接选答案；←/→ 翻题；Enter 展开/收起解析
  useEffect(() => {
    if (view !== 'quiz' || questions.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 遇到系统级修饰键 (Ctrl/Cmd/Alt) 时不拦截，方便用户触发 ⌘J / Ctrl+J
      if (e.ctrlKey || e.metaKey || e.altKey) return

      // 如果焦点在输入框、文本域或可编辑区域，不劫持
      const activeEl = document.activeElement as HTMLElement | null
      const isInput = activeEl instanceof HTMLInputElement || 
                      activeEl instanceof HTMLTextAreaElement || 
                      (activeEl && activeEl.isContentEditable)
      if (isInput) return

      const curQ = questions[currentIndex]
      if (!curQ) return

      const upperKey = e.key.toUpperCase()
      // 1. A / B / C / D 直接选答案
      if (['A', 'B', 'C', 'D'].includes(upperKey)) {
        if (curQ.options && (curQ.options as any)[upperKey]) {
          e.preventDefault()
          handleOptionSelect(upperKey)
        }
      }
      // 2. 1 / 2 / 3 / 4 选答案
      else if (['1', '2', '3', '4'].includes(e.key)) {
        const numToOpt: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' }
        const targetOpt = numToOpt[e.key]
        if (curQ.options && (curQ.options as any)[targetOpt]) {
          e.preventDefault()
          handleOptionSelect(targetOpt)
        }
      }
      // 3. 方向键 ← 上一题
      else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentIndex > 0) {
          goToQuestion(currentIndex - 1)
        }
      }
      // 4. 方向键 → 下一题
      else if (e.key === 'ArrowRight') {
        e.preventDefault()
        advanceQuestion()
      }
      // 5. Enter 展开 / 收起解析 (原地秒查定理)
      else if (e.key === 'Enter') {
        e.preventDefault()
        setShowFeedback(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, currentIndex, questions, handleOptionSelect, advanceQuestion, goToQuestion])


  const handleExitQuiz = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsExitModalOpen(false)
    setIsSubmitModalOpen(false)
    setMobileDrawerOpen(false)
    setActivePaperContext(null)
    setView('start')
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}
  }, [])

  const finishQuiz = useCallback(async (overrideAnswers?: Record<string, string>) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsSubmitModalOpen(false)
    setIsExitModalOpen(false)
    setMobileDrawerOpen(false)
    const finalAnswers = overrideAnswers || answers
    setView('results')
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}

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

      // 联动考点掌握度热力图
      const masteryKey = (q.tags && q.tags.length > 0) ? q.tags[q.tags.length - 1] : q.subject
      updateMasteryFromQuizResult(masteryKey, Boolean(isCorrect))

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
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
      <div className="mx-auto max-w-[1520px] w-full min-w-0 space-y-4 sm:space-y-6 pb-36 md:pb-0 animate-fade-in-up">
        {/* 双模式顶栏切换：历年真题整卷库 vs 考点专项演练 */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/85 shadow-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setHubTab('papers')}
              className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hubTab === 'papers'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>📑 历年真题整卷库</span>
              <span className={`text-2xs px-2 py-0.5 rounded-full font-mono ${
                hubTab === 'papers' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-100 text-slate-500'
              }`}>
                {ALL_EXAM_PAPERS.length} 套真实卷
              </span>
            </button>

            <button
              type="button"
              onClick={() => setHubTab('topics')}
              className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                hubTab === 'topics'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-accent-orange" />
              <span>🎯 章节考点专项演练</span>
              <span className={`text-2xs px-2 py-0.5 rounded-full font-mono ${
                hubTab === 'topics' ? 'bg-orange-500/20 text-orange-300' : 'bg-slate-100 text-slate-500'
              }`}>
                {availableCount} 题
              </span>
            </button>
          </div>

          <div className="text-2xs text-slate-400 hidden sm:block">
            {hubTab === 'papers' ? '支持整卷模考、单选专刷与解答大题专项演练' : '支持按学科考点组卷抽题自测'}
          </div>
        </div>

        {hubTab === 'papers' ? (
          /* 历年真题整卷库视图（带卷种/年份筛选与三大练习入口） */
          <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">正在装载历年真题整卷库...</div>}>
            <ExamPaperHubView onStartPaper={startPaperQuiz} />
          </Suspense>
        ) : (
          /* 章节考点专项演练原视图 */
          <>
        {/* Subframe Workspace Header */}
        <div className="bento-card rounded-2xl border border-slate-200/85 bg-white p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="subframe-pill mb-2 whitespace-nowrap leading-normal inline-flex items-center">
                <Flame className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="truncate">全真题库 · 分步推导 · 错题闭环</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                研考做题中心（408 专业课 + 考研数学）
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                支持 408 四门统考科目与数一/二/三专项演练，全量 KaTeX 公式推导与错题自动归因。
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={startQuiz}
                disabled={availableCount === 0}
                className="subframe-btn-black px-6 py-2.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {availableCount > 0 ? `开始做题 (${effectiveCount} 题) →` : '暂无匹配试题'}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar (Subframe Segmented Control) */}
        <div className="bento-card rounded-xl p-3.5 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1">学科领域:</span>
            <div className="flex rounded-lg border border-slate-200/80 bg-slate-100/90 p-1">
              <button
                onClick={() => handleDomainFilterChange('all')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  domainFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部学科
              </button>
              <button
                onClick={() => handleDomainFilterChange('math')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  domainFilter === 'math' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📐 考研数学
              </button>
              <button
                onClick={() => handleDomainFilterChange('cs_408')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  domainFilter === 'cs_408' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🖥️ 408 计算机
              </button>
            </div>

            {(domainFilter === 'math' || domainFilter === 'all') && (
              <div className="flex items-center gap-1 ml-2 rounded-lg border border-slate-200/80 bg-slate-100/90 p-1 text-xs">
                <span className="text-slate-400 pl-2 pr-1 text-2xs">卷种:</span>
                {(['all', '数一', '数二', '数三'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMathCategory(cat)}
                    className={`rounded-md px-2.5 py-1 text-2xs font-medium transition-all cursor-pointer ${
                      mathCategory === cat ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
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
            className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:underline cursor-pointer"
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
                className={`bento-card rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 text-left transition-all relative border-2 ${
                  isSelected
                    ? `${s.bgColor} border-current shadow-sm`
                    : 'bg-white/60 border-slate-200/60 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.emoji}</span>
                  {isSelected && (
                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xs font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className={`text-xs font-bold truncate ${isSelected ? s.color : 'text-slate-700'}`}>
                  {s.key}
                </div>
                <div className="text-2xs text-slate-400 mt-1 font-medium">{count} 题储备</div>
              </button>
            )
          })}
        </div>

        {/* Mode & Settings Config Cards */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Mode Selector */}
          <div className="bento-card rounded-xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-4">
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
          <div className="bento-card rounded-xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-4">
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

        {/* 做题计费与免积分透明公示卡片 */}
        <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-950 text-xs animate-fade-in-up">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <div className="leading-relaxed">
              <span className="font-bold text-emerald-900">做题自测永久 100% 免费：</span>
              <span className="text-emerald-800">所有统考科目刷题、组卷模考与参考解析均免费开放，不扣除任何积分！仅在主动调用 AI 导师深度答疑或 AI 变式题强化时按 0.1 积分/次扣除。</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-checkin-modal', { detail: { tab: 'logs' } }))
            }}
            className="text-2xs font-bold text-emerald-700 underline hover:text-emerald-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            查阅我的积分消费明细 →
          </button>
        </div>

        {/* Resource Ingestion & Student Analytics Banner Card */}
        <div className="bento-card rounded-xl border border-slate-200/80 bg-white shadow-xs p-5 border border-indigo-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/60">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">智能资料与题库导入中心</span>
                {customQuestions.length > 0 && (
                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    已入库 {customQuestions.length} 道自定义真题
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                支持导入手头教材参考书（PDF/MD）、智能文本识别题库、学情画像诊断
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDefaultModalTab('import_quiz')
                setImportModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 text-amber-800 text-xs font-bold shadow-xs hover:bg-amber-50 transition-all cursor-pointer"
              title="支持粘贴数学公式截图与 408 图表，AI 视觉自动识别转 LaTeX"
            >
              <Camera className="h-4 w-4 text-amber-600" />
              <span>📸 拍照/截图导错题</span>
            </button>

            <button
              type="button"
              onClick={() => setAlgoModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-slate-800 transition-all cursor-pointer"
              title="进入 408 统考第 42 题算法大题 C/C++ 手写判题沙箱"
            >
              <Code2 className="h-4 w-4 text-emerald-400" />
              <span>💻 408 算法大题 (第42题)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDefaultModalTab('analytics')
                setImportModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <span>学情画像</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDefaultModalTab('books')
                setImportModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>题库与书架</span>
            </button>
          </div>
        </div>

        {/* 📱 移动端悬浮吸底开刷栏（选完科目随时一键开始，无需滚回页面顶部） */}
        <div className="md:hidden fixed bottom-[calc(3.85rem+env(safe-area-inset-bottom,0px))] left-2.5 right-2.5 z-30 rounded-2xl bg-slate-900/95 text-white px-4 py-2.5 shadow-xl backdrop-blur-xl flex items-center justify-between gap-3 border border-white/10">
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">
              {mode === 'practice' ? '📖 练习模式' : '📋 考试模式'} · 抽 {effectiveCount} 题
            </div>
            <div className="text-2xs text-slate-400 truncate">
              已选 {selectedSubjects.size} 门科目（题池共 {availableCount} 题）
            </div>
          </div>
          <button
            type="button"
            onClick={startQuiz}
            disabled={availableCount === 0}
            className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer whitespace-nowrap min-w-[96px]"
          >
            <Flame className="h-3.5 w-3.5 text-amber-300" />
            <span className="whitespace-nowrap font-bold">立即开始</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 自定义安全退出做题确认弹窗（彻底消除浏览器原生 confirm 拦截与静默无响应） */}
        {isExitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">确定退出当前做题？</h3>
                  <p className="text-xs text-slate-500 mt-0.5">做题进度已实时自动缓存，随时可返回继续</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>• 当前进度：已完成 {Object.keys(answers).length} / {questions.length} 题</p>
                <p>• 累计用时：{formatTime(timeElapsed)}</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  继续做题
                </button>
                <button
                  type="button"
                  onClick={handleExitQuiz}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  确认退出
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 自定义交卷结算确认弹窗 */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  📝
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">立即交卷结算成绩报告？</h3>
                  <p className="text-xs text-slate-500 mt-0.5">交卷后将生成错题剖析与考点雷达图</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>已作答题目：</span>
                  <strong className="text-emerald-700 font-bold">{Object.keys(answers).length} 题</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>未作答题目：</span>
                  <strong className={questions.length - Object.keys(answers).length > 0 ? "text-amber-600 font-bold" : "text-slate-500"}>
                    {questions.length - Object.keys(answers).length} 题
                  </strong>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  再检查一下
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitModalOpen(false)
                    finishQuiz()
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  立即交卷结算
                </button>
              </div>
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          <ImportResourceModal
            isOpen={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            onQuestionsUpdated={fetchCustomQuestions}
            defaultTab={defaultModalTab}
          />
          {algoModalOpen && (
            <AlgorithmSandboxModal
              isOpen={algoModalOpen}
              onClose={() => setAlgoModalOpen(false)}
              initialQuestionId={selectedAlgoId}
            />
          )}
        </Suspense>
        {/* ── AI 举一反三 · 变式题强化训练舱 Modal ── */}
        {variantModalOpen && variantSourceQ && createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setVariantModalOpen(false)
            }}
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90dvh] flex flex-col overflow-hidden text-left font-sans animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-amber-50/50">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>AI 举一反三 · 变式题强化训练舱</span>
                      <span className="px-2 py-0.5 rounded-full text-2xs bg-indigo-100 text-indigo-800 font-bold">
                        定向弱项击破
                      </span>
                    </h3>
                    <p className="text-2xs text-slate-500 mt-0.5">
                      针对错题考点「{variantSourceQ.chapter || variantSourceQ.subject}」同类概念命制，改变设问参数深化理解
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVariantModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-4 sm:space-y-5 flex-1 text-xs sm:text-[13px]" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                {/* 原错题原貌提示卡 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="text-2xs font-bold text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>错题溯源原型：</span>
                  </div>
                  <div className="text-slate-700 font-serif leading-relaxed line-clamp-2"><MarkdownRenderer content={variantSourceQ.question} /></div>
                </div>

                {/* 变式题列表 */}
                <div className="space-y-4">
                  {variantQuestions.map((vq, idx) => {
                    const chosen = variantAnswers[vq.id]
                    const isAnswered = Boolean(chosen)
                    const isCorrect = chosen === vq.answer

                    return (
                      <div
                        key={vq.id}
                        className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-2xs">
                            <span>变式题 0{idx + 1}</span>
                            <span className="text-indigo-400 font-normal">· {vq.difficulty}</span>
                          </span>
                          {isAnswered && (
                            <span className={`text-xs font-black ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isCorrect ? '✓ 回答正确' : `✗ 回答错误 (正确选项: ${vq.answer})`}
                            </span>
                          )}
                        </div>

                        {/* 题干 */}
                        <div className="text-slate-900 font-medium leading-relaxed"><MarkdownRenderer content={vq.question} /></div>

                        {/* 选项组 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans">
                          {vq.options && Object.entries(vq.options).map(([optKey, optVal]) => {
                            const isPicked = chosen === optKey
                            return (
                              <button
                                key={optKey}
                                type="button"
                                onClick={() => {
                                  setVariantAnswers(prev => ({ ...prev, [vq.id]: optKey }))
                                  setVariantShowExplanation(prev => ({ ...prev, [vq.id]: true }))
                                }}
                                className={`text-left p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-2 ${
                                  isPicked
                                    ? isCorrect
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs'
                                      : 'bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs'
                                    : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100/80'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-2xs shrink-0 ${
                                  isPicked
                                    ? isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600'
                                }`}>
                                  {optKey}
                                </span>
                                <span className="leading-snug">{String(optVal)}</span>
                              </button>
                            )
                          })}
                        </div>

                        {/* 解析与考点总结 */}
                        {variantShowExplanation[vq.id] && (
                          <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5 animate-in fade-in">
                            <div className="font-bold text-amber-900 flex items-center gap-1">
                              <span>💡 考点命题深度解析：</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-sans">{vq.explanation}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const promptText = `我在做题中心刷题时遇到了这道关于「${variantSourceQ.chapter || variantSourceQ.subject}」的错题：\n> "${variantSourceQ.question}"\n\n请老师帮我详细剖析该考点的命题本质、高频设坑方式与秒杀解题技巧！`
                    sessionStorage.setItem('pending_chat_prompt', promptText)
                    window.location.href = '/chat'
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors cursor-pointer"
                >
                  <MessageCircle size={13} />
                  <span>携带本题前往【AI 伴学舱】向导师追问 →</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVariantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  完成巩固并关闭
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        </>
        )}
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
      <div className="mx-auto max-w-[1560px] w-full min-w-0 space-y-3 sm:space-y-4 pb-28 lg:pb-0 animate-fade-in-up">
        {/* ── 📱 移动端专属微型刷题控制条 (专为手机单手设计) ── */}
        <div className="sm:hidden bento-card rounded-2xl bg-white px-3 py-2 flex items-center justify-between gap-1.5 shadow-xs border border-slate-200/90 relative">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => setIsExitModalOpen(true)}
              className="text-2xs text-slate-600 hover:text-slate-900 flex items-center gap-0.5 font-bold cursor-pointer active:scale-95 shrink-0"
              title="退出当前做题"
            >
              <ArrowLeft size={13} />
              <span>退出</span>
            </button>
            <span className="text-slate-300 text-xs shrink-0">|</span>
            <span className="text-xs font-bold text-slate-800 truncate">
              {currentQ.subject}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-2xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {currentIndex + 1}/{questions.length}
            </span>
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="text-2xs font-bold px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer active:scale-95 transition-colors"
            >
              🧮 卡
            </button>
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="text-2xs font-bold px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 shadow-xs transition-colors"
            >
              交卷
            </button>
          </div>
        </div>

        {/* ── 💻 电脑端 / 平板端专属双栏工作台进度条 ── */}
        <div className="hidden sm:flex bento-card rounded-xl border border-slate-200/80 bg-white shadow-xs px-3.5 sm:px-5 py-2.5 items-center justify-between gap-2 shadow-sm border border-slate-200/90 relative overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsExitModalOpen(true)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors cursor-pointer active:scale-95 shrink-0"
              title="退出当前做题并返回题库"
            >
              <ArrowLeft size={14} />
              <span>退出做题</span>
            </button>
            <div className="h-3.5 w-px bg-slate-200 shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate">
              {currentQ.subject}
            </span>
            {currentQ.chapter && (
              <span className="text-2xs text-slate-500 hidden sm:inline truncate">
                · {currentQ.chapter}
              </span>
            )}
          </div>

          {/* Subframe Screen 5 Replica: Center Design / Prototype / Code Mode Switcher */}
          <div className="hidden md:inline-flex items-center bg-white rounded-xl p-1 shadow-xs border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveSideTab('palette')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                activeSideTab === 'palette'
                  ? 'bg-[#f2f2f4] text-[#18181b] font-semibold shadow-xs'
                  : 'text-[#52525b] hover:text-[#18181b]'
              }`}
            >
              <span>📖 真题测验</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSideTab('scratchpad')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                activeSideTab === 'scratchpad'
                  ? 'bg-[#f2f2f4] text-[#18181b] font-semibold shadow-xs'
                  : 'text-[#52525b] hover:text-[#18181b]'
              }`}
            >
              <span>✍️ 手写白板</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSideTab('hints')}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                activeSideTab === 'hints'
                  ? 'bg-[#f2f2f4] text-[#18181b] font-semibold shadow-xs'
                  : 'text-[#52525b] hover:text-[#18181b]'
              }`}
            >
              <span>📐 核心公式</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setDefaultModalTab('books')
                setImportModalOpen(true)
              }}
              className="hidden sm:flex text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Database size={13} className="text-indigo-600" />
              <span>题库与书架</span>
            </button>
            <div className="hidden sm:block h-4 w-px bg-slate-200" />
            <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5 tabular-nums">
              <span>⏱</span>
              <span className="font-semibold text-slate-850 font-mono">{formatTime(timeElapsed)}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-700 font-mono">
              {currentIndex + 1} / {questions.length} 题
            </span>
            <div className="h-4 w-px bg-slate-200" />
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 transition-all"
              title="交卷并进入成绩与错因分析报告"
            >
              <CheckCircle2 size={13} />
              <span>交卷结算</span>
            </button>
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden ml-1 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
            >
              <span>🧮 答题卡</span>
            </button>
          </div>
        </div>


        {/* Dual-Panel Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.22fr_0.78fr] gap-5 items-start">
          {/* ───────────────── LEFT PANEL: Question & Solution ───────────────── */}
          <div className="space-y-3.5 sm:space-y-4 min-w-0">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/60 bg-white shadow-xs p-3.5 sm:p-8 space-y-3.5 sm:space-y-5 relative">
              {/* Floating Canvas Action Pill (Subframe Screen 5 Replica) */}
              <div className="absolute right-4 top-4 z-10 hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50/90 border border-slate-200/80 text-slate-600 text-2xs shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveSideTab('hints')}
                  className="hover:text-black font-mono font-medium flex items-center gap-1 cursor-pointer"
                  title="速查本题定理与公式 (⌘)"
                >
                  <kbd className="px-1 py-0.2 bg-white rounded border border-slate-200 text-2xs">⌘</kbd>
                  <span>定理</span>
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setActiveSideTab('scratchpad')}
                  className="hover:text-black font-mono font-medium flex items-center gap-1 cursor-pointer"
                  title="呼出草稿纸 (⊞)"
                >
                  <kbd className="px-1 py-0.2 bg-white rounded border border-slate-200 text-2xs">⊞</kbd>
                  <span>草稿</span>
                </button>
              </div>

              {/* Question Meta Badges */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-2xs font-bold px-2.5 py-0.5 rounded-full ${
                    currentQ.difficulty === '简单' ? 'bg-emerald-100 text-emerald-700' :
                    currentQ.difficulty === '中等' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {currentQ.difficulty}
                  </span>

                  <span className="text-2xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {currentQ.type === 'blank' ? '填空题' : currentQ.type === 'analysis' ? '解答题' : '单选题'}
                  </span>

                  {currentQ.scope && (
                    <span className="text-2xs text-slate-500 font-medium bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      适用：{currentQ.scope.join(' / ')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAskAI(currentQ)}
                    title="唤起双核 AI 伴学抽屉追问此题（快捷键 ⌘J / Ctrl+J）"
                    className="p-1.5 px-2.5 rounded-xl text-indigo-700 bg-indigo-50/90 border border-indigo-200/90 hover:bg-indigo-100 hover:border-indigo-300 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Sparkles size={13} className="text-indigo-600" />
                    <span>✨ 追问 AI</span>
                    <kbd className="hidden sm:inline-block text-2xs font-mono text-indigo-500 bg-white/90 border border-indigo-200 rounded px-1 py-0.2">⌘J</kbd>
                  </button>

                  <button
                    onClick={() => toggleBookmark(currentQ.id)}
                    title={isBookmarked ? '取消标星' : '标星关注此题'}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                      isBookmarked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Star size={17} className={isBookmarked ? 'fill-amber-500' : ''} />
                  </button>
                </div>
              </div>

              {/* Question Text (KaTeX Rendered) */}
              <div className="text-[15px] sm:text-base font-medium text-slate-900 leading-[1.75] min-h-[4rem] academic-body">
                <MarkdownRenderer content={currentQ.question} />
              </div>

              {/* Answering Area */}
              {hasOptions ? (
                /* Choice Options (选择题选项) */
                <div className="space-y-2 sm:space-y-3 pt-1.5">
                  {optionKeys.map((key) => {
                    const optionText = currentQ.options![key]
                    if (!optionText) return null
                    const isSelected = selectedOption === key
                    const isCorrectAnswer = key.toUpperCase() === currentQ.answer.toUpperCase()
                    const showResult = mode === 'practice' && showFeedback

                    let btnStyle = 'border-slate-200/85 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
                    if (isSelected && !showResult) {
                      btnStyle = 'border-slate-900 bg-slate-50/90 ring-1 ring-slate-900 text-slate-900 font-semibold shadow-xs'
                    }
                    if (showResult && isCorrectAnswer) {
                      btnStyle = 'border-emerald-500 bg-emerald-50/60 text-emerald-900 font-semibold ring-1 ring-emerald-400 shadow-xs'
                    }
                    if (showResult && isSelected && !isCorrectAnswer) {
                      btnStyle = 'border-rose-400 bg-rose-50/60 text-rose-900 ring-1 ring-rose-300 shadow-xs'
                    }

                    return (
                      <button
                        key={key}
                        onClick={() => handleOptionSelect(key)}
                        disabled={mode === 'practice' && showFeedback}
                        aria-label={`选项 ${key}: ${optionText}`}
                        className={`w-full text-left rounded-xl sm:rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3.5 transition-all duration-150 group flex items-start gap-2.5 sm:gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${btnStyle} ${
                          mode === 'practice' && showFeedback
                            ? 'cursor-default'
                            : 'cursor-pointer hover:scale-[1.006] active:scale-[0.99] hover:shadow-sm'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 transition-colors shadow-xs ${
                          isSelected && !showResult ? 'bg-slate-900 text-white' :
                          showResult && isCorrectAnswer ? 'bg-emerald-600 text-white' :
                          showResult && isSelected && !isCorrectAnswer ? 'bg-rose-600 text-white' :
                          'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
                        }`}>
                          {key}
                        </span>

                        <div className="flex-1 text-sm pt-0.5 leading-relaxed">
                          <MarkdownRenderer content={optionText} inline />
                        </div>

                        {/* 键盘快捷键提示徽章 */}
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-2xs font-mono px-1.5 py-0.5 rounded border border-slate-200/80 bg-slate-50 text-slate-400 group-hover:text-slate-600 group-hover:border-slate-300 transition-colors shrink-0 mt-0.5">
                          <span>{key}</span>
                          <span className="text-slate-300">/</span>
                          <span>{key === 'A' ? '1' : key === 'B' ? '2' : key === 'C' ? '3' : '4'}</span>
                        </kbd>

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
              ) : currentQ.type === 'analysis' ? (
                /* Comprehensive Analysis / Proof Question Area (综合解答与大题专练) */
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>✍️ 综合解答题</span>
                        {currentQ.score && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-2xs font-bold">
                            满分 {currentQ.score} 分
                          </span>
                        )}
                      </span>
                      <span className="text-2xs text-slate-400">（请在草稿纸或下方记录关键推导步骤）</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentQ.domain === 'cs_408' && (currentQ.subject === '数据结构' || (currentQ.tags && currentQ.tags.includes('算法大题'))) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAlgoId('algo-custom')
                            setAlgoModalOpen(true)
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-blue-200/60"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>💻 启动算法沙盒实时调试</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowSteps(!showSteps)}
                        className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:border-slate-900 transition-colors cursor-pointer shadow-xs"
                      >
                        {showSteps ? '收起官方评分细则' : '📋 对照考研官方踩分点与评分细则'}
                      </button>
                    </div>
                  </div>

                  {/* 大题推导与作答思路草稿 */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      解题思路、步骤推导或代码草稿：
                    </label>
                    <textarea
                      rows={5}
                      value={scratchpads[currentQ.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        setScratchpads(prev => ({ ...prev, [currentQ.id]: val }))
                      }}
                      placeholder="在此记录推导的关键步骤、辅助线、特征方程、定理依据或算法核心逻辑..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-slate-900 font-mono leading-relaxed resize-y"
                    />
                  </div>

                  {/* 分步踩分点展示 */}
                  {showSteps && currentQ.steps && currentQ.steps.length > 0 && (
                    <div className="p-4 rounded-xl bg-white border border-emerald-200/80 space-y-2.5 shadow-xs animate-fade-in-up">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>考研官方阅卷评分标准与踩分点拆解：</span>
                        </span>
                        <span className="text-2xs text-slate-400">分步踩点给分制</span>
                      </div>
                      <div className="space-y-1.5">
                        {currentQ.steps.map((st, sidx) => (
                          <div key={sidx} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs text-slate-800 leading-relaxed">
                            <MarkdownRenderer content={st} inline />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 自我掌握度判定按钮 */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/50">
                    <span className="text-2xs text-slate-500">根据步骤核对判定掌握程度：</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAnswers(prev => ({ ...prev, [currentQ.id]: 'mastered' }))
                          setShowFeedback(true)
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          answers[currentQ.id] === 'mastered'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70'
                        }`}
                      >
                        ✓ 已完全掌握 (记满分)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAnswers(prev => ({ ...prev, [currentQ.id]: 'partial' }))
                          setShowFeedback(true)
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          answers[currentQ.id] === 'partial'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/70'
                        }`}
                      >
                        ⚠️ 部分掌握 / 步骤遗漏
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAnswers(prev => ({ ...prev, [currentQ.id]: 'unmastered' }))
                          setShowFeedback(true)
                          setBookmarkedIds(prev => new Set([...prev, currentQ.id]))
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          answers[currentQ.id] === 'unmastered'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/70'
                        }`}
                      >
                        ✕ 未掌握 (自动加入错题本)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Blank / Fill-in Answer Area (填空题输入区) */
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <span>✍️ 填空题作答</span>
                    <span className="text-2xs text-slate-400 font-normal">（支持直接输入数值或数学表达式）</span>
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
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors flex items-center gap-1.5 cursor-pointer rounded-xl hover:bg-slate-100/70"
                  title="上一题（快捷键 ←）"
                >
                  <ArrowLeft size={14} />
                  <span>上一题</span>
                  <kbd className="hidden sm:inline-block text-2xs font-mono px-1 py-0.2 rounded border border-slate-200 bg-slate-100 text-slate-400">
                    ←
                  </kbd>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedback(prev => !prev)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="按 Enter 键展开/收起解析"
                  >
                    <BookOpen size={13} className="text-indigo-600" />
                    <span>{showFeedback ? '收起解析' : '展开解析'}</span>
                    <kbd className="text-2xs font-mono px-1 py-0.2 rounded border border-slate-200 bg-slate-100 text-slate-400">
                      Enter
                    </kbd>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAskAI(currentQ)}
                    className="px-3 py-1.5 rounded-xl border border-indigo-200/90 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
                    title="唤起双核 AI 伴学舱追问（快捷键 ⌘J / Ctrl+J）"
                  >
                    <Sparkles size={13} className="text-indigo-600" />
                    <span>✨ 追问 AI</span>
                    <kbd className="text-2xs font-mono px-1 py-0.2 rounded border border-indigo-200 bg-white/80 text-indigo-500">
                      ⌘J
                    </kbd>
                  </button>
                </div>

                <WarmButton
                  onClick={advanceQuestion}
                  disabled={mode === 'practice' && !showFeedback && currentIndex < questions.length - 1}
                  className="bg-accent-orange text-white px-5 cursor-pointer flex items-center gap-1.5"
                  title="下一题（快捷键 →）"
                >
                  <span>{currentIndex < questions.length - 1 ? '下一题' : '交卷结算'}</span>
                  <kbd className="text-2xs font-mono px-1.5 py-0.2 rounded border border-white/30 bg-black/20 text-white">
                    →
                  </kbd>
                </WarmButton>
              </div>
            </div>

            {/* Explanation & Step-by-Step Derivation (Notion / Brilliant Style) */}
            {mode === 'practice' && showFeedback && (
              <div className="rounded-2xl sm:rounded-3xl border border-slate-200/60 bg-white shadow-xs p-3.5 sm:p-7 space-y-3 sm:space-y-4 animate-fade-in-up leading-[1.75]">
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
                <div className="text-sm sm:text-[14.5px] text-slate-800 leading-[1.75] pl-1 academic-body ai-explanation">
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

                {/* Anki-style Error Reason Tagging & Quick Note (错因反思与错题笔记闭环) */}
                <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>📌 错题归因与心得笔记</span>
                      <span className="text-2xs text-slate-400 font-normal">（自动归档至 Obsidian 错题本）</span>
                    </span>
                  </div>

                  {/* 错因标签大按钮 */}
                  <div className="flex flex-wrap gap-1.5">
                    {ERROR_REASONS.map(reason => {
                      const active = errorReasons[currentQ.id] === reason
                      return (
                        <button
                          key={reason}
                          onClick={() => recordErrorReason(reason)}
                          className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium transition-all active:scale-95 ${
                            active
                              ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {reason}
                        </button>
                      )
                    })}
                  </div>

                  {/* 手机专属本题速记/错因心得输入框 */}
                  <div className="space-y-1">
                    <textarea
                      value={scratchpads[currentQ.id] || ''}
                      onChange={(e) => setScratchpads({ ...scratchpads, [currentQ.id]: e.target.value })}
                      placeholder="写下你的反思心得或易错点（如：未注意偶次方正负号、泰勒Peano余项...）"
                      rows={2}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-400 transition-colors leading-relaxed placeholder:text-slate-400"
                    />
                  </div>

                  {/* 沉淀到错题本与变式题按钮 */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <button
                      onClick={() => handleSaveToErrorBook(currentQ)}
                      disabled={savingError}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-medium rounded-lg px-4 py-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Save size={14} />
                      <span>{savingError ? '正在写入知识库...' : '💾 存入 Obsidian 错题本'}</span>
                    </button>

                    <button
                      onClick={() => handleGenerateVariants(currentQ)}
                      disabled={generatingVariants}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl subframe-btn-secondary px-3.5 py-2 text-xs font-medium text-slate-800"
                    >
                      <Sparkles size={13} className="text-indigo-600" />
                      <span>{generatingVariants ? 'AI 命题中...' : '🔄 AI 变式题强化'}</span>
                    </button>
                  </div>

                  {savedErrorMsg && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{savedErrorMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ───────────────── RIGHT PANEL: Strategic Workbench (桌面宽屏常驻) ───────────────── */}
          <div className="hidden lg:block bento-card rounded-xl border border-slate-200/80 bg-white shadow-xs p-5 space-y-4 sticky top-20 shadow-sm">
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
                ✍️ 手写演算白板
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
                <div className="flex flex-wrap items-center gap-3 pt-2 text-2xs text-slate-500 border-t border-slate-100">
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

            {/* TAB 2: 手写演算白板 (纯手写涂鸦，支持 iPad/触控笔/触控板/鼠标画树与演算) */}
            {activeSideTab === 'scratchpad' && (
              <div className="space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span>✍️ 考研手写演算白板</span>
                    <span className="text-2xs text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">第 {currentIndex + 1} 题</span>
                  </span>
                  <span className="text-2xs text-slate-400">支持 iPad/触控板画二叉树与算式</span>
                </div>

                <DoodleScratchpadCanvas
                  questionId={currentQ.id}
                  questionIndex={currentIndex}
                  initialDataUrl={scratchpads[currentQ.id]}
                  onChange={(val) => setScratchpads({ ...scratchpads, [currentQ.id]: val })}
                  onClear={() => setScratchpads({ ...scratchpads, [currentQ.id]: '' })}
                />
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
                      <span key={tag} className="text-2xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 📱 移动端固定拇指答题操作栏 */}
        <div className="lg:hidden fixed bottom-[calc(3.85rem+env(safe-area-inset-bottom,0px))] left-2.5 right-2.5 z-30 rounded-2xl bg-white/95 border border-slate-200/90 px-3 py-2 shadow-xl backdrop-blur-xl flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => goToQuestion(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold disabled:opacity-35 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>上一题</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => { setActiveSideTab('palette'); setMobileDrawerOpen(true) }}
              className="px-2.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold active:scale-95 transition-all cursor-pointer"
            >
              🧮 {answeredCount}/{questions.length}
            </button>
            <button
              type="button"
              onClick={() => { setActiveSideTab('scratchpad'); setMobileDrawerOpen(true) }}
              className="px-2.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold active:scale-95 transition-all cursor-pointer"
            >
              📝 草稿
            </button>
            <button
              type="button"
              onClick={() => toggleBookmark(currentQ.id)}
              className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                isBookmarked ? 'bg-amber-50 border-amber-300 text-amber-500' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
              aria-label="标星"
            >
              <Star size={15} className={isBookmarked ? 'fill-amber-500' : ''} />
            </button>
          </div>

          <button
            type="button"
            onClick={advanceQuestion}
            disabled={mode === 'practice' && !showFeedback && currentIndex < questions.length - 1}
            className={`px-4 py-2 rounded-xl text-white text-xs font-bold active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
              currentIndex < questions.length - 1
                ? 'bg-slate-900 disabled:opacity-35'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            <span>{currentIndex < questions.length - 1 ? '下一题' : '立即交卷'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* ── 📱 Mobile Bottom Sheet Drawer (小屏抽屉式答题卡与工具) ── */}
        {mobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end modal-backdrop-contain">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={() => setMobileDrawerOpen(false)} />
            <div className="relative bg-white rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl border-t border-slate-200 max-h-[82dvh] overflow-y-auto modal-scroll-contain space-y-4 animate-sheet-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="text-sm font-bold text-slate-900">答题卡大纲 &amp; 辅助工具</div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tab Header */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => setActiveSideTab('palette')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeSideTab === 'palette' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🧮 答题卡
                </button>
                <button
                  onClick={() => setActiveSideTab('scratchpad')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeSideTab === 'scratchpad' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📝 草稿纸
                </button>
                <button
                  onClick={() => setActiveSideTab('hints')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeSideTab === 'hints' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  💡 定理提示
                </button>
              </div>

              {/* TAB 1: Answer Palette */}
              {activeSideTab === 'palette' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>已完成 {answeredCount} / {questions.length} 题</span>
                    <span>标星关注 {bookmarkedIds.size} 题</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-orange rounded-full" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 pt-1">
                    {questions.map((q, idx) => {
                      const isCurrent = idx === currentIndex
                      const isAnswered = Boolean(answers[q.id])
                      return (
                        <button
                          key={q.id}
                          onClick={() => goToQuestion(idx)}
                          className={`h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center border-2 ${
                            isCurrent
                              ? 'border-accent-orange bg-accent-orange text-white shadow-sm scale-105'
                              : isAnswered
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: Scratchpad */}
              {activeSideTab === 'scratchpad' && (
                <div className="space-y-2">
                  <textarea
                    value={currentScratchpad}
                    onChange={(e) => setScratchpads({ ...scratchpads, [currentQ.id]: e.target.value })}
                    placeholder="在此随手推演公式、草拟计算步骤..."
                    rows={6}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:border-accent-orange leading-relaxed"
                  />
                </div>
              )}

              {/* TAB 3: Theorem Hints */}
              {activeSideTab === 'hints' && (
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">当前知识点定理：</div>
                  {currentQ.keyPoints && currentQ.keyPoints.length > 0 ? (
                    <div className="space-y-1.5">
                      {currentQ.keyPoints.map((kp, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-slate-800">
                          {kp}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400">本题考查综合基础知识与定理。</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 自定义安全退出做题确认弹窗（彻底消除浏览器原生 confirm 拦截与静默无响应） */}
        {isExitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">确定退出当前做题？</h3>
                  <p className="text-xs text-slate-500 mt-0.5">做题进度已实时自动缓存，随时可返回继续</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>• 当前进度：已完成 {Object.keys(answers).length} / {questions.length} 题</p>
                <p>• 累计用时：{formatTime(timeElapsed)}</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  继续做题
                </button>
                <button
                  type="button"
                  onClick={handleExitQuiz}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  确认退出
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 自定义交卷结算确认弹窗 */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  📝
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">立即交卷结算成绩报告？</h3>
                  <p className="text-xs text-slate-500 mt-0.5">交卷后将生成错题剖析与考点雷达图</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>已作答题目：</span>
                  <strong className="text-emerald-700 font-bold">{Object.keys(answers).length} 题</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>未作答题目：</span>
                  <strong className={questions.length - Object.keys(answers).length > 0 ? "text-amber-600 font-bold" : "text-slate-500"}>
                    {questions.length - Object.keys(answers).length} 题
                  </strong>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  再检查一下
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitModalOpen(false)
                    finishQuiz()
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  立即交卷结算
                </button>
              </div>
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          <ImportResourceModal
            isOpen={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            onQuestionsUpdated={fetchCustomQuestions}
            defaultTab={defaultModalTab}
          />
          {algoModalOpen && (
            <AlgorithmSandboxModal
              isOpen={algoModalOpen}
              onClose={() => setAlgoModalOpen(false)}
              initialQuestionId={selectedAlgoId}
            />
          )}
        </Suspense>
        {/* ── AI 举一反三 · 变式题强化训练舱 Modal ── */}
        {variantModalOpen && variantSourceQ && createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setVariantModalOpen(false)
            }}
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90dvh] flex flex-col overflow-hidden text-left font-sans animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-amber-50/50">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>AI 举一反三 · 变式题强化训练舱</span>
                      <span className="px-2 py-0.5 rounded-full text-2xs bg-indigo-100 text-indigo-800 font-bold">
                        定向弱项击破
                      </span>
                    </h3>
                    <p className="text-2xs text-slate-500 mt-0.5">
                      针对错题考点「{variantSourceQ.chapter || variantSourceQ.subject}」同类概念命制，改变设问参数深化理解
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVariantModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-4 sm:space-y-5 flex-1 text-xs sm:text-[13px]" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                {/* 原错题原貌提示卡 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="text-2xs font-bold text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>错题溯源原型：</span>
                  </div>
                  <div className="text-slate-700 font-serif leading-relaxed line-clamp-2"><MarkdownRenderer content={variantSourceQ.question} /></div>
                </div>

                {/* 变式题列表 */}
                <div className="space-y-4">
                  {variantQuestions.map((vq, idx) => {
                    const chosen = variantAnswers[vq.id]
                    const isAnswered = Boolean(chosen)
                    const isCorrect = chosen === vq.answer

                    return (
                      <div
                        key={vq.id}
                        className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-2xs">
                            <span>变式题 0{idx + 1}</span>
                            <span className="text-indigo-400 font-normal">· {vq.difficulty}</span>
                          </span>
                          {isAnswered && (
                            <span className={`text-xs font-black ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isCorrect ? '✓ 回答正确' : `✗ 回答错误 (正确选项: ${vq.answer})`}
                            </span>
                          )}
                        </div>

                        {/* 题干 */}
                        <div className="text-slate-900 font-medium leading-relaxed"><MarkdownRenderer content={vq.question} /></div>

                        {/* 选项组 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans">
                          {vq.options && Object.entries(vq.options).map(([optKey, optVal]) => {
                            const isPicked = chosen === optKey
                            return (
                              <button
                                key={optKey}
                                type="button"
                                onClick={() => {
                                  setVariantAnswers(prev => ({ ...prev, [vq.id]: optKey }))
                                  setVariantShowExplanation(prev => ({ ...prev, [vq.id]: true }))
                                }}
                                className={`text-left p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-2 ${
                                  isPicked
                                    ? isCorrect
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs'
                                      : 'bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs'
                                    : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100/80'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-2xs shrink-0 ${
                                  isPicked
                                    ? isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600'
                                }`}>
                                  {optKey}
                                </span>
                                <span className="leading-snug">{String(optVal)}</span>
                              </button>
                            )
                          })}
                        </div>

                        {/* 解析与考点总结 */}
                        {variantShowExplanation[vq.id] && (
                          <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5 animate-in fade-in">
                            <div className="font-bold text-amber-900 flex items-center gap-1">
                              <span>💡 考点命题深度解析：</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-sans">{vq.explanation}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const promptText = `我在做题中心刷题时遇到了这道关于「${variantSourceQ.chapter || variantSourceQ.subject}」的错题：\n> "${variantSourceQ.question}"\n\n请老师帮我详细剖析该考点的命题本质、高频设坑方式与秒杀解题技巧！`
                    sessionStorage.setItem('pending_chat_prompt', promptText)
                    window.location.href = '/chat'
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors cursor-pointer"
                >
                  <MessageCircle size={13} />
                  <span>携带本题前往【AI 伴学舱】向导师追问 →</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVariantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  完成巩固并关闭
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

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
      <div className="mx-auto max-w-[1280px] w-full min-w-0 space-y-5 sm:space-y-6 pb-28 lg:pb-0 animate-fade-in-up">
        {/* Results Hero Header */}
        <div className="bento-card rounded-2xl border border-slate-200/80 bg-white shadow-xs p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">做题测评结算</div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>{gradeEmoji} 测评报告生成完毕</span>
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {mode === 'practice' ? '练习模式' : '考试模式'} · 答题用时 {formatTime(result.timeTaken)} · 成绩已沉淀至本地 Vault
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-8 bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border border-slate-200/80 w-full sm:w-auto">
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
              <div key={subject} className="bento-card rounded-xl border border-slate-200/80 bg-white shadow-xs p-4 space-y-2">
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
          <div className="bento-card rounded-xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="text-rose-500">✗</span>
                <span>错题精析与复盘 ({result.wrongQuestions.length} 题)</span>
              </h2>
              <button
                onClick={handleSaveAllWrongQuestions}
                disabled={savingAllErrors}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-medium rounded-lg px-4 py-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                <span>{savingAllErrors ? '正在批量写入知识库...' : '📦 一键将全部错题归档至 Obsidian'}</span>
              </button>
            </div>

            {saveAllMsg && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{saveAllMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              {result.wrongQuestions.map(({ question: q, userAnswer, errorReason }) => {
                const isSaved = savedItemIds.has(q.id)
                return (
                  <div key={q.id} className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-4 sm:p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {q.subject}
                        </span>
                        {q.chapter && (
                          <span className="text-2xs text-slate-500">
                            {q.chapter}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono flex items-center gap-3">
                        <span className="text-rose-600 font-semibold">你的回答: {userAnswer}</span>
                        <span className="text-emerald-700 font-bold">标准答案: {q.answer}</span>
                      </div>
                    </div>

                    <div className="text-sm font-medium text-slate-900 leading-relaxed">
                      <MarkdownRenderer content={q.question} />
                    </div>

                    <div className="bg-white/80 rounded-xl p-3 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <div className="font-bold text-slate-800 mb-1">真题解析：</div>
                      <MarkdownRenderer content={q.explanation} />
                    </div>

                    {/* 手机错题归因标签与心得速记 */}
                    <div className="pt-2 border-t border-rose-100 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>📌 错因反思与归纳</span>
                        </span>
                        {isSaved && (
                          <span className="text-2xs text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> 已沉淀至 Obsidian
                          </span>
                        )}
                      </div>

                      {/* 错因标签大按钮 */}
                      <div className="flex flex-wrap gap-1.5">
                        {ERROR_REASONS.map(reason => {
                          const active = (errorReasons[q.id] || errorReason) === reason
                          return (
                            <button
                              key={reason}
                              onClick={() => setErrorReasons(prev => ({ ...prev, [q.id]: reason }))}
                              className={`text-xs px-2.5 py-1.5 rounded-xl border font-medium transition-all active:scale-95 ${
                                active
                                  ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              {reason}
                            </button>
                          )
                        })}
                      </div>

                      {/* 错题反思小记输入框 */}
                      <textarea
                        value={scratchpads[q.id] || ''}
                        onChange={(e) => setScratchpads({ ...scratchpads, [q.id]: e.target.value })}
                        placeholder="写下本题反思与考点心得（如：未注意泰勒展开阶数、偶次方正负号...）"
                        rows={2}
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:border-rose-400 transition-colors leading-relaxed placeholder:text-slate-400"
                      />

                      {/* 存入错题本与变式题强化按钮 */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <button
                          onClick={() => handleSaveToErrorBook(q)}
                          disabled={savingError}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl subframe-btn-secondary text-rose-600 hover:text-rose-700 px-3.5 py-2 font-medium"
                        >
                          <Save size={13} />
                          <span>{isSaved ? '✅ 已存入错题本' : '💾 存入 Obsidian 错题本'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAskAI(q)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50/90 border border-indigo-200/90 hover:bg-indigo-100 transition-all cursor-pointer shadow-xs active:scale-95"
                          title="唤起双核 AI 伴学抽屉深度答疑此错题（快捷键 ⌘J / Ctrl+J）"
                        >
                          <Sparkles size={13} className="text-indigo-600" />
                          <span>✨ 追问 AI (⌘J)</span>
                        </button>

                        <button
                          onClick={() => handleGenerateVariants(q)}
                          disabled={generatingVariants}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl subframe-btn-secondary px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50/60 border border-indigo-200/80 hover:bg-indigo-100/70 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <Sparkles size={13} className={`text-indigo-600 ${generatingVariants && variantSourceQ?.id === q.id ? 'animate-spin' : ''}`} />
                          <span>{generatingVariants && variantSourceQ?.id === q.id ? 'AI 命题构思中...' : '🔄 AI 变式题强化'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <WarmButton onClick={() => { setActivePaperContext(null); setView('start'); }} className="bg-accent-orange text-white px-8">
            再练一轮
          </WarmButton>
          <WarmButton variant="secondary" onClick={() => window.location.href = '/dashboard'}>
            返回首页工作台
          </WarmButton>
        </div>

        {/* 自定义安全退出做题确认弹窗（彻底消除浏览器原生 confirm 拦截与静默无响应） */}
        {isExitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">确定退出当前做题？</h3>
                  <p className="text-xs text-slate-500 mt-0.5">做题进度已实时自动缓存，随时可返回继续</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>• 当前进度：已完成 {Object.keys(answers).length} / {questions.length} 题</p>
                <p>• 累计用时：{formatTime(timeElapsed)}</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsExitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  继续做题
                </button>
                <button
                  type="button"
                  onClick={handleExitQuiz}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  确认退出
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 自定义交卷结算确认弹窗 */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  📝
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">立即交卷结算成绩报告？</h3>
                  <p className="text-xs text-slate-500 mt-0.5">交卷后将生成错题剖析与考点雷达图</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>已作答题目：</span>
                  <strong className="text-emerald-700 font-bold">{Object.keys(answers).length} 题</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>未作答题目：</span>
                  <strong className={questions.length - Object.keys(answers).length > 0 ? "text-amber-600 font-bold" : "text-slate-500"}>
                    {questions.length - Object.keys(answers).length} 题
                  </strong>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  再检查一下
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitModalOpen(false)
                    finishQuiz()
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  立即交卷结算
                </button>
              </div>
            </div>
          </div>
        )}

        <Suspense fallback={null}>
          <ImportResourceModal
            isOpen={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            onQuestionsUpdated={fetchCustomQuestions}
            defaultTab={defaultModalTab}
          />
          {algoModalOpen && (
            <AlgorithmSandboxModal
              isOpen={algoModalOpen}
              onClose={() => setAlgoModalOpen(false)}
              initialQuestionId={selectedAlgoId}
            />
          )}
        </Suspense>
        {/* ── AI 举一反三 · 变式题强化训练舱 Modal ── */}
        {variantModalOpen && variantSourceQ && createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setVariantModalOpen(false)
            }}
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90dvh] flex flex-col overflow-hidden text-left font-sans animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-white to-amber-50/50">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>AI 举一反三 · 变式题强化训练舱</span>
                      <span className="px-2 py-0.5 rounded-full text-2xs bg-indigo-100 text-indigo-800 font-bold">
                        定向弱项击破
                      </span>
                    </h3>
                    <p className="text-2xs text-slate-500 mt-0.5">
                      针对错题考点「{variantSourceQ.chapter || variantSourceQ.subject}」同类概念命制，改变设问参数深化理解
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVariantModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-4 sm:space-y-5 flex-1 text-xs sm:text-[13px]" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
                {/* 原错题原貌提示卡 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="text-2xs font-bold text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>错题溯源原型：</span>
                  </div>
                  <div className="text-slate-700 font-serif leading-relaxed line-clamp-2"><MarkdownRenderer content={variantSourceQ.question} /></div>
                </div>

                {/* 变式题列表 */}
                <div className="space-y-4">
                  {variantQuestions.map((vq, idx) => {
                    const chosen = variantAnswers[vq.id]
                    const isAnswered = Boolean(chosen)
                    const isCorrect = chosen === vq.answer

                    return (
                      <div
                        key={vq.id}
                        className="p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-2xs">
                            <span>变式题 0{idx + 1}</span>
                            <span className="text-indigo-400 font-normal">· {vq.difficulty}</span>
                          </span>
                          {isAnswered && (
                            <span className={`text-xs font-black ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isCorrect ? '✓ 回答正确' : `✗ 回答错误 (正确选项: ${vq.answer})`}
                            </span>
                          )}
                        </div>

                        {/* 题干 */}
                        <div className="text-slate-900 font-medium leading-relaxed"><MarkdownRenderer content={vq.question} /></div>

                        {/* 选项组 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-sans">
                          {vq.options && Object.entries(vq.options).map(([optKey, optVal]) => {
                            const isPicked = chosen === optKey
                            return (
                              <button
                                key={optKey}
                                type="button"
                                onClick={() => {
                                  setVariantAnswers(prev => ({ ...prev, [vq.id]: optKey }))
                                  setVariantShowExplanation(prev => ({ ...prev, [vq.id]: true }))
                                }}
                                className={`text-left p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-2 ${
                                  isPicked
                                    ? isCorrect
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs'
                                      : 'bg-rose-50 border-rose-400 text-rose-950 font-bold shadow-xs'
                                    : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100/80'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-2xs shrink-0 ${
                                  isPicked
                                    ? isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600'
                                }`}>
                                  {optKey}
                                </span>
                                <span className="leading-snug">{String(optVal)}</span>
                              </button>
                            )
                          })}
                        </div>

                        {/* 解析与考点总结 */}
                        {variantShowExplanation[vq.id] && (
                          <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5 animate-in fade-in">
                            <div className="font-bold text-amber-900 flex items-center gap-1">
                              <span>💡 考点命题深度解析：</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-sans">{vq.explanation}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const promptText = `我在做题中心刷题时遇到了这道关于「${variantSourceQ.chapter || variantSourceQ.subject}」的错题：\n> "${variantSourceQ.question}"\n\n请老师帮我详细剖析该考点的命题本质、高频设坑方式与秒杀解题技巧！`
                    sessionStorage.setItem('pending_chat_prompt', promptText)
                    window.location.href = '/chat'
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors cursor-pointer"
                >
                  <MessageCircle size={13} />
                  <span>携带本题前往【AI 伴学舱】向导师追问 →</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVariantModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  完成巩固并关闭
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    )
  }

  return null
}
