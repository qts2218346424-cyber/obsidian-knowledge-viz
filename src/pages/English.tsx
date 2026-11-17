import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  FileEdit,
  Sparkles,
  ScrollText,
  Copy,
  Check,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Flame,
  ChevronRight,
  BarChart2,
  Camera,
  X,
  Upload,
  Zap,
  Bot,
  PenTool,
  Library,
  FileText,
  Clock,
  Globe,
  Lock,
  Wand2,
} from 'lucide-react'
import { authService } from '../services/auth'
import { api, type BookItem } from '../services/api'
import { lazyWithRetry } from '../utils/lazyWithRetry'
import ChunkErrorBoundary from '../components/ChunkErrorBoundary'
import SuspenseTimeoutFallback from '../components/ui/SuspenseTimeoutFallback'
import MarkdownRenderer from '../components/MarkdownRenderer'
import {
  ESSAY_TEMPLATES,
  ESSAY_GOLDEN_SENTENCES,
  PAST_ESSAY_PROMPTS,
  type PastEssayPrompt,
  type EssayTemplate,
  type EssayCategory,
  type EnglishExamType,
} from '../data/englishData'
import { ENGLISH_HANDOUTS } from '../data/englishHandouts'
import type { HandoutItem } from '../data/handoutsData'
import { gradeEssayLocally, type EssayGradingResult } from '../services/essayGrading'
import VocabTab from '../components/study/VocabTab'
import WordBrowser from '../components/vocab/WordBrowser'
import VocabStats from '../components/vocab/VocabStats'
import DailyReadingTab from '../components/english/DailyReadingTab'
import EnglishPracticeView from '../components/english/EnglishPracticeView'
import EnglishFullPaperView from '../components/english/EnglishFullPaperView'
import WordLookupPopover, { useEnglishWordLookup } from '../components/english/WordLookupPopover'

const WordRelations = lazyWithRetry(() => import('../components/vocab/WordRelations'), 'wordRelations')
const ImportResourceModal = lazyWithRetry(
  () => import('../components/ImportResourceModal'),
  'englishImportModal'
)
const HandoutReaderModal = lazyWithRetry(
  () => import('../components/HandoutReaderModal'),
  'englishHandoutReader'
)
const PdfViewerModal = lazyWithRetry(
  () => import('../components/PdfViewerModal'),
  'englishPdfViewer'
)

type EnglishMainTab =
  | 'practice'
  | 'papers'
  | 'dailyReading'
  | 'grading'
  | 'templates'
  | 'vocab'
  | 'materials'

type GradingEngineMode = 'local' | 'ai_standard' | 'mojuan'

export default function English() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<EnglishMainTab>('practice')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (
      tab === 'papers' ||
      tab === 'practice' ||
      tab === 'dailyReading' ||
      tab === 'grading' ||
      tab === 'templates' ||
      tab === 'vocab' ||
      tab === 'materials'
    ) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // 即点即查词典浮窗（用于模板金句与示范范文阅读）
  const {
    lookupState,
    closeLookup,
    handleWordLookupClick,
    handleWordLookupDoubleClick,
  } = useEnglishWordLookup()

  // -------------------------------------------------------------
  // 0. 英语上传弹窗与讲义资料库状态
  // -------------------------------------------------------------
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importDefaultTab, setImportDefaultTab] = useState<'books' | 'import_quiz'>('books')
  const [customQuizRefreshKey, setCustomQuizRefreshKey] = useState(0)

  const [englishBooks, setEnglishBooks] = useState<BookItem[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [bookScopeFilter, setBookScopeFilter] = useState<'all' | 'personal' | 'shared'>('all')
  const [materialSearch, setMaterialSearch] = useState('')
  const [readingBookId, setReadingBookId] = useState<string | null>(null)

  const [selectedHandout, setSelectedHandout] = useState<HandoutItem | null>(null)
  const [handoutModalOpen, setHandoutModalOpen] = useState(false)
  const [selectedPdfBook, setSelectedPdfBook] = useState<BookItem | null>(null)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)

  const loadEnglishBooks = useCallback(async () => {
    setLoadingBooks(true)
    try {
      const res = await api.getBooks()
      const filtered = (res.books || []).filter((b) => b.domain === 'english')
      setEnglishBooks(filtered)
    } catch {
      // 未登录或离线静默忽略
    } finally {
      setLoadingBooks(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'materials') {
      loadEnglishBooks()
    }
  }, [activeTab, loadEnglishBooks])

  const openUploadModal = (tab: 'books' | 'import_quiz' = 'books') => {
    setImportDefaultTab(tab)
    setImportModalOpen(true)
  }

  const handleOpenBookItem = async (book: BookItem) => {
    const isPdf = Boolean(book.isPdf || book.ext?.toLowerCase() === '.pdf')
    if (isPdf) {
      setSelectedPdfBook(book)
      setPdfModalOpen(true)
      return
    }

    setReadingBookId(book.id)
    try {
      const res = await api.readBook(book.relativePath, book.scope)
      const pseudoHandout: HandoutItem = {
        id: `book-handout-${book.id}`,
        title: book.name.replace(/\.[^.]+$/, ''),
        domain: 'english',
        subject: '考研英语',
        readTime: `${Math.max(3, Math.round((res.content || '').length / 600))} 分钟`,
        difficulty: '核心考点',
        tags: ['书架资料', book.category || '英语讲义'],
        summary: `来自${book.scope === 'personal' ? '个人独享' : '全员共享'}书架的考研英语文档资料。`,
        keyTheorems: [],
        content: res.content || '（文档内容为空）',
      }
      setSelectedHandout(pseudoHandout)
      setHandoutModalOpen(true)
    } catch (err: any) {
      alert('打开文档失败：' + (err?.message || '请确认文件格式可读'))
    } finally {
      setReadingBookId(null)
    }
  }

  const filteredHandouts = useMemo(() => {
    if (!materialSearch.trim()) return ENGLISH_HANDOUTS
    const q = materialSearch.toLowerCase()
    return ENGLISH_HANDOUTS.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.summary.toLowerCase().includes(q) ||
        h.tags.some((t) => t.toLowerCase().includes(q))
    )
  }, [materialSearch])

  const filteredShelfBooks = useMemo(() => {
    return englishBooks.filter((b) => {
      if (bookScopeFilter !== 'all' && (b.scope || 'shared') !== bookScopeFilter) return false
      if (materialSearch.trim() && !b.name.toLowerCase().includes(materialSearch.toLowerCase())) {
        return false
      }
      return true
    })
  }, [englishBooks, bookScopeFilter, materialSearch])

  // -------------------------------------------------------------
  // 1. 词汇子选项卡
  // -------------------------------------------------------------
  const [vocabSubTab, setVocabSubTab] = useState<'review' | 'browse' | 'stats' | 'relations'>(
    'review'
  )

  // -------------------------------------------------------------
  // 2. 作文模板与万能金句状态
  // -------------------------------------------------------------
  const [templateFilterExam, setTemplateFilterExam] = useState<EnglishExamType | 'all'>('all')
  const [templateFilterCategory, setTemplateFilterCategory] = useState<EssayCategory | 'all'>('all')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(ESSAY_TEMPLATES[0].id)
  const [copiedSectionIdx, setCopiedSectionIdx] = useState<number | null>(null)
  const [copiedFullTemplate, setCopiedFullTemplate] = useState(false)

  const [goldenSearch, setGoldenSearch] = useState('')
  const [goldenCategory, setGoldenCategory] = useState<string>('all')
  const [copiedSentenceId, setCopiedSentenceId] = useState<string | null>(null)

  // -------------------------------------------------------------
  // 3. 作文智能批改舱状态（本地规则诊断 + AI 标准阅卷 + 墨卷流式精批）
  // -------------------------------------------------------------
  const [gradingEssayType, setGradingEssayType] = useState<'big_essay' | 'small_essay'>('big_essay')
  const [essayInput, setEssayInput] = useState<string>(
    'As is vividly depicted in the cartoon, two individuals are standing at a crossroads. One is staring at his phone, while the other is looking at the distant future. This picture is very important because it shows modern technology problems. Many people lose their minds in smartphones. I think it is very good if government can help us make better rules.'
  )
  const [activeGradingEngine, setActiveGradingEngine] = useState<GradingEngineMode>('ai_standard')
  const [gradingResult, setGradingResult] = useState<EssayGradingResult | null>(null)
  const [isLocalGrading, setIsLocalGrading] = useState(false)

  const [selectedPromptId, setSelectedPromptId] = useState<string>(PAST_ESSAY_PROMPTS[0].id)
  const activePrompt = useMemo(() => {
    return PAST_ESSAY_PROMPTS.find((p) => p.id === selectedPromptId) || PAST_ESSAY_PROMPTS[0]
  }, [selectedPromptId])

  const [isAiStandardGrading, setIsAiStandardGrading] = useState(false)
  const [aiEssayEvaluation, setAiEssayEvaluation] = useState<any | null>(null)

  const [isMojuanGrading, setIsMojuanGrading] = useState(false)
  const [mojuanStreamingText, setMojuanStreamingText] = useState('')
  const [mojuanError, setMojuanError] = useState<string | null>(null)
  const [mojuanStatusNotice, setMojuanStatusNotice] = useState<string | null>(null)

  // 记录已一键采纳替换至草稿的句子/词汇键，给予即时绿色反馈
  const [adoptedReplacements, setAdoptedReplacements] = useState<Record<string, boolean>>({})

  // 拍照/截图答题卡 OCR 识别状态
  const [handwritingImage, setHandwritingImage] = useState<string | null>(null)
  const [isOcrExtracting, setIsOcrExtracting] = useState(false)
  const handwritingInputRef = useRef<HTMLInputElement>(null)
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false)

  // 原位采纳替换句子或短语至左侧作文草稿框
  const handleAdoptReplacement = (key: string, originalStr: string, replacementStr: string) => {
    const cleanOrig = (originalStr || '').trim()
    const cleanNext = (replacementStr || '').replace(/^[✓✨\s]+/, '').trim()
    if (!cleanOrig || !cleanNext) return

    setEssayInput((prev) => {
      if (prev.includes(cleanOrig)) {
        return prev.replace(cleanOrig, cleanNext)
      }
      // 忽略句末标点或多余空格进行容错定位替换
      const strippedOrig = cleanOrig.replace(/[.!?]+$/, '').trim()
      if (strippedOrig && prev.includes(strippedOrig)) {
        return prev.replace(strippedOrig, cleanNext.replace(/[.!?]+$/, ''))
      }
      // 单词级不区分大小写替换（用于平庸词升级）
      if (!/\s/.test(cleanOrig)) {
        const wordRegex = new RegExp(`\\b${cleanOrig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
        if (wordRegex.test(prev)) {
          return prev.replace(wordRegex, cleanNext)
        }
      }
      return prev + '\n' + cleanNext
    })

    setAdoptedReplacements((prev) => ({ ...prev, [key]: true }))
  }

  const handleHandwritingPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          e.preventDefault()
          const reader = new FileReader()
          reader.onload = (loadEvent) => {
            const base64 = loadEvent.target?.result as string
            setHandwritingImage(base64)
          }
          reader.readAsDataURL(file)
          break
        }
      }
    }
  }

  const handleHandwritingFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string
        setHandwritingImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOcrExtractHandwriting = async () => {
    if (!handwritingImage) return
    setIsOcrExtracting(true)
    try {
      const res = await fetch('/api/english/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({
          image: handwritingImage,
          essayType: gradingEssayType,
          questionPrompt: activePrompt.promptZh,
        }),
      })
      const data = await res.json()
      if (data.extractedText) {
        setEssayInput(data.extractedText)
        setAiEssayEvaluation(data)
        setActiveGradingEngine('ai_standard')
        setAdoptedReplacements({})
      } else {
        alert(data.error || '图片文本识别失败，请确保图片清晰包含手写英文作文')
      }
    } catch (err: any) {
      alert('手写答题卡识别异常: ' + err.message)
    } finally {
      setIsOcrExtracting(false)
    }
  }

  // 引擎 1：⚡ 本地秒级规则诊断
  const handleStartLocalGrading = () => {
    if (!essayInput.trim()) return
    setIsLocalGrading(true)
    setActiveGradingEngine('local')
    setAdoptedReplacements({})
    setTimeout(() => {
      const res = gradeEssayLocally(essayInput, gradingEssayType)
      setGradingResult(res)
      setIsLocalGrading(false)
    }, 220)
  }

  // 引擎 2：🤖 AI 标准阅卷批改
  const handleStartAiGrading = async () => {
    if (!essayInput.trim()) {
      alert('请先输入或粘贴英文作文草稿')
      return
    }
    setIsAiStandardGrading(true)
    setActiveGradingEngine('ai_standard')
    setAdoptedReplacements({})
    try {
      const res = await fetch('/api/english/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({
          essayText: essayInput,
          essayType: gradingEssayType,
          questionPrompt: `${activePrompt.title}: ${activePrompt.promptZh}`,
          image: handwritingImage || undefined,
        }),
      })
      const data = await res.json()
      if (data.totalScore !== undefined) {
        setAiEssayEvaluation(data)
      } else {
        alert(data.error || 'AI 阅卷评估返回异常')
      }
    } catch (err: any) {
      const localFallback = gradeEssayLocally(essayInput, gradingEssayType)
      setGradingResult(localFallback)
      setActiveGradingEngine('local')
      alert('云端服务波动，已自动为您切换至本地离线规则诊断引擎：' + err.message)
    } finally {
      setIsAiStandardGrading(false)
    }
  }

  // 引擎 3：🖋️ 墨卷名师流式精批 (调用 /api/local-agents/chat)
  const handleStartMojuanGrading = async () => {
    if (!essayInput.trim()) return
    setIsMojuanGrading(true)
    setActiveGradingEngine('mojuan')
    setMojuanStreamingText('')
    setMojuanError(null)
    setMojuanStatusNotice('墨卷导师正在审阅考题与您的作答，推演多维诊断...')

    const maxScore = gradingEssayType === 'big_essay' ? 20 : 10
    const promptMessage = `【考研英语作文 AI 多维批改请求】
真题背景与题目：
- 题目标题：${activePrompt.title} (${activePrompt.subType})
- 官方要求：${activePrompt.promptZh}
- 图画/图表核心要素：${activePrompt.visualDescription}
- 目标满分制：${maxScore} 分制 (${gradingEssayType === 'big_essay' ? '大作文' : '小作文'})

考生作答文本如下：
"""
${essayInput.trim()}
"""

请你作为【墨卷（政治/英语双科领航导师）】，按照全国考研英语大纲官方评阅标准进行深度多维诊断：
1. 【考研官方得分评估】给出建议总得分（${maxScore}分制，如 17.5 / ${maxScore}），并拆分四项小分：切题与立意(25%)、框架结构与衔接(25%)、句法精准度(25%)、高级闪光词汇(25%)，给出所在档次（一档优秀/二档良好/三档及格）与一句话核心点评；
2. 【逐句排雷与语法抓虫】逐句指出考生句子中的语法缺陷、主谓不一致、介词冠词搭配不当、或过于口语化的句子，并给出地道修正；
3. 【平庸词升级矩阵】挑选 3-5 个初级词汇（如 important, good, many 等），给出考研一档闪光升级词汇与例句示范；
4. 【墨卷一档高分重构示范范文】根据本题立意，给出 1 篇辞藻优美、衔接自如、符合考研大纲要求的满分示范范文。`

    try {
      const res = await fetch('/api/local-agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({
          message: promptMessage,
          agentId: 'mojuan',
          history: [],
          projectName: '考研英语研学中枢 · 作文批改舱',
          pageContext: '考研英语作文 AI 深度批改 (墨卷导师)',
        }),
      })

      if (!res.ok) {
        if (res.status === 402) {
          throw new Error('伴学积分不足（单次批改消耗 0.1 积分），请签到领积分或联系管理员。')
        }
        throw new Error(`服务连接异常 (HTTP ${res.status})`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('流式读取不可用')
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const rawData = trimmed.replace(/^data:\s*/, '')
          try {
            const data = JSON.parse(rawData)
            if (data.type === 'delta' && data.text) {
              accumulated += data.text
              setMojuanStreamingText(accumulated)
            } else if (data.type === 'points_updated') {
              if (data.deducted > 0) {
                setMojuanStatusNotice(
                  `批改完成，已扣除 ${data.deducted} 伴学积分 (剩余 ${data.remainingPoints?.toFixed(1)} 分)`
                )
              } else {
                setMojuanStatusNotice('由于本次返回未达标或超时，系统已自动保留您的伴学积分，未扣除费用。')
              }
            } else if (data.type === 'error') {
              setMojuanError(data.message || '批改过程遇到异常')
            }
          } catch {
            // ignore chunk parse error
          }
        }
      }
    } catch (err: any) {
      setMojuanError(err.message || '网络连接超时，已为您免除积分扣除，请重试。')
    } finally {
      setIsMojuanGrading(false)
    }
  }

  const handleSelectPrompt = (prompt: PastEssayPrompt) => {
    setSelectedPromptId(prompt.id)
    setGradingEssayType(prompt.category)
    if (prompt.sampleDraft) {
      setEssayInput(prompt.sampleDraft)
      setAdoptedReplacements({})
    }
  }

  const activeTemplate = useMemo(() => {
    return ESSAY_TEMPLATES.find((t) => t.id === selectedTemplateId) || ESSAY_TEMPLATES[0]
  }, [selectedTemplateId])

  const filteredTemplates = useMemo(() => {
    return ESSAY_TEMPLATES.filter((t) => {
      if (templateFilterExam !== 'all' && t.examType !== templateFilterExam && t.examType !== 'both')
        return false
      if (templateFilterCategory !== 'all' && t.category !== templateFilterCategory) return false
      return true
    })
  }, [templateFilterExam, templateFilterCategory])

  const filteredGoldenSentences = useMemo(() => {
    return ESSAY_GOLDEN_SENTENCES.filter((g) => {
      if (goldenCategory !== 'all' && g.category !== goldenCategory) return false
      if (
        goldenSearch &&
        !g.sentence.toLowerCase().includes(goldenSearch.toLowerCase()) &&
        !g.translation.includes(goldenSearch)
      ) {
        return false
      }
      return true
    })
  }, [goldenCategory, goldenSearch])

  const handleCopySection = (text: string, idx: number) => {
    navigator.clipboard?.writeText?.(text)
    setCopiedSectionIdx(idx)
    setTimeout(() => setCopiedSectionIdx(null), 2000)
  }

  const handleCopyFullTemplate = (t: EssayTemplate) => {
    const full = t.structure.map((s) => s.templateText).join('\n\n')
    navigator.clipboard?.writeText?.(full)
    setCopiedFullTemplate(true)
    setTimeout(() => setCopiedFullTemplate(false), 2000)
  }

  const handleCopySentence = (text: string, id: string) => {
    navigator.clipboard?.writeText?.(text)
    setCopiedSentenceId(id)
    setTimeout(() => setCopiedSentenceId(null), 2000)
  }

  const anyGradingBusy = isLocalGrading || isAiStandardGrading || isMojuanGrading

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0 space-y-5 sm:space-y-6 pb-28 sm:pb-16 animate-fade-in font-sans">
      <WordLookupPopover state={lookupState} onClose={closeLookup} />

      {/* ── 顶部头图看板（完整适配亮色、护眼与深空暗夜四大主题） ── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-indigo-50/25 to-slate-50 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/40 p-4 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/70 text-2xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-xs">
                <Sparkles
                  className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0"
                  style={{ animationDuration: '6s' }}
                />
                <span className="sm:hidden">英语一 / 英语二研学总攻</span>
                <span className="hidden sm:inline">
                  2026/2027 考研英语总攻作战舱 · 英语一 & 英语二双轨适配
                </span>
              </div>

              {/* 顶栏快捷上传英语真题 / 外刊讲义入口 */}
              <button
                type="button"
                onClick={() => openUploadModal('books')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-2xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Upload className="w-3 h-3 text-amber-300" />
                <span>📤 上传英语真题 / 外刊讲义</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5 flex-wrap">
              <span>考研英语 · 全题型研学中枢</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white">
                ENGLISH MASTER
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              汇聚真题分题型刷题（即点即查生词·题眼定位）、历年统考原卷双栏模考、大纲词汇艾宾浩斯复盘、方法论讲义书架与三引擎 AI 作文精批。
            </p>
          </div>

          {/* 快捷数据统计徽章 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-center">
            <div
              onClick={() => setActiveTab('vocab')}
              className={`rounded-2xl border p-3 shadow-xs cursor-pointer transition-all active:scale-95 ${
                activeTab === 'vocab'
                  ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <div className="text-2xs font-semibold text-indigo-600 dark:text-indigo-300 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>核心词汇打卡</span>
              </div>
              <div className="text-base font-black font-mono text-indigo-700 dark:text-indigo-200 mt-0.5">
                2000+ 真题词
              </div>
            </div>
            <div
              onClick={() => setActiveTab('practice')}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 hover:border-indigo-300 dark:hover:border-indigo-700 p-3 shadow-xs cursor-pointer transition-all"
            >
              <div className="text-2xs font-semibold text-slate-400">分题型题库</div>
              <div className="text-base font-black font-mono text-indigo-600 dark:text-indigo-300 mt-0.5">
                完型·阅读·新题
              </div>
            </div>
            <div
              onClick={() => setActiveTab('materials')}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 hover:border-emerald-300 dark:hover:border-emerald-700 p-3 shadow-xs cursor-pointer transition-all"
            >
              <div className="text-2xs font-semibold text-slate-400">方法论与书架</div>
              <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                讲义·PDF库
              </div>
            </div>
            <div
              onClick={() => setActiveTab('grading')}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 hover:border-rose-300 dark:hover:border-rose-700 p-3 shadow-xs cursor-pointer transition-all"
            >
              <div className="text-2xs font-semibold text-slate-400">作文三核精批</div>
              <div className="text-base font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                原位采纳润色
              </div>
            </div>
          </div>
        </div>

        {/* 主功能导航切换药丸 */}
        <div className="mt-5 sm:mt-6 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar border-t border-slate-200/60 dark:border-slate-800 pt-3 sm:pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('vocab')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'vocab'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 ring-1 ring-amber-400/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="sm:hidden">背单词</span>
            <span className="hidden sm:inline">核心词汇背单词 (艾宾浩斯)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black">
              每日必刷
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="sm:hidden">分题型刷题</span>
            <span className="hidden sm:inline">分题型刷题 (完型/阅读/新题型)</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black">
              专项突破
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('papers')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'papers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="sm:hidden">真题套卷</span>
            <span className="hidden sm:inline">历年真题套卷模考</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              180分钟
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dailyReading')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'dailyReading'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="sm:hidden">每日精读</span>
            <span className="hidden sm:inline">每日文献精读 (AI伴读)</span>
            <span className="hidden sm:inline text-2xs px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black">
              外刊题源
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grading')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'grading'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="sm:hidden">作文批改</span>
            <span className="hidden sm:inline">作文批改舱 (20分制)</span>
            <span className="hidden sm:inline text-2xs px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black">
              三核精批
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">高分模板</span>
            <span className="hidden sm:inline">作文高分模板库</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'materials'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 ring-1 ring-emerald-500/25'
            }`}
          >
            <Library className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="sm:hidden">讲义资料</span>
            <span className="hidden sm:inline">📚 讲义与真题资料库</span>
            <span className="hidden sm:inline text-2xs px-1.5 py-0.2 rounded-md bg-emerald-500 text-white font-bold">
              NEW
            </span>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          板块 -1: 考研英语分题型专项刷题（含上传提取的自定义英语题库）
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'practice' && (
        <EnglishPracticeView
          onGoToPapers={() => setActiveTab('papers')}
          onOpenImportModal={() => openUploadModal('import_quiz')}
          refreshTrigger={customQuizRefreshKey}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          板块 0: 每日文献精读 (动态自选外刊挂载 + 流式 AI 伴读 + 真实入库)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'dailyReading' && <DailyReadingTab />}

      {/* ─────────────────────────────────────────────────────────────
          板块 1: 作文高分模板库 & 万能金句
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div
          onClick={handleWordLookupClick}
          onDoubleClick={handleWordLookupDoubleClick}
          className="space-y-6"
        >
          {/* 筛选控制器 */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>科目筛选:</span>
              </span>
              {(['all', 'english_1', 'english_2'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTemplateFilterExam(mode)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    templateFilterExam === mode
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {mode === 'all' ? '全部卷别' : mode === 'english_1' ? '英语一专属' : '英语二专属'}
                </button>
              ))}

              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

              <span className="font-bold text-slate-400 mr-1 hidden sm:inline">题型类型:</span>
              {(['all', 'small_letter', 'small_notice', 'big_picture', 'big_chart'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setTemplateFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      templateFilterCategory === cat
                        ? 'bg-slate-900 dark:bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'all'
                      ? '全部题型'
                      : cat === 'small_letter'
                      ? '应用文 · 书信'
                      : cat === 'small_notice'
                      ? '应用文 · 告示通知'
                      : cat === 'big_picture'
                      ? '图画议论文 (英一)'
                      : '图表分析文 (英二)'}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => handleCopyFullTemplate(activeTemplate)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ml-auto"
            >
              {copiedFullTemplate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFullTemplate ? '已复制全篇模板！' : '一键复制全篇模板'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 左侧：模板目录列表 (4列) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs font-bold text-slate-400 px-1">
                可选范式模板 ({filteredTemplates.length})
              </div>
              <div className="space-y-2.5 max-h-[700px] overflow-y-auto no-scrollbar pr-1">
                {filteredTemplates.map((item) => {
                  const isSelected = item.id === selectedTemplateId
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTemplateId(item.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-900 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-2xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                          {item.typeLabel}
                        </span>
                        <span className="text-2xs font-mono text-slate-400">
                          {item.examType === 'both'
                            ? '英一/英二通用'
                            : item.examType === 'english_1'
                            ? '英语(一)'
                            : '英语(二)'}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-2xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400">
                        <span>含 {item.structure.length} 个结构段落</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                          <span>查看详情</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 右侧：当前模板深度拆解与填空指引 (8列) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                      {activeTemplate.typeLabel} · 核心高分模板
                    </span>
                    <span className="text-xs text-slate-400">
                      适用话题：
                      <strong className="text-slate-700 dark:text-slate-200">
                        {activeTemplate.topic}
                      </strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-2">
                    {activeTemplate.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {activeTemplate.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {activeTemplate.structure.map((sec, idx) => (
                    <div
                      key={sec.sectionName}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 sm:p-5 space-y-3 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center text-2xs font-mono font-bold">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {sec.sectionName}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopySection(sec.templateText, idx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-2xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          {copiedSectionIdx === idx ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedSectionIdx === idx ? '已复制' : '复制本段'}</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 font-serif text-[15px] text-slate-800 dark:text-slate-100 leading-[1.82] whitespace-pre-wrap select-text">
                        {sec.templateText}
                      </div>

                      <div className="text-2xs text-slate-600 dark:text-slate-300 leading-relaxed bg-amber-50/60 dark:bg-amber-950/35 border border-amber-200/50 dark:border-amber-800/60 rounded-xl p-3">
                        <div className="font-semibold text-amber-900 dark:text-amber-200 mb-0.5">
                          💡 译文与逻辑解析:
                        </div>
                        <p>{sec.translation}</p>
                        {sec.placeholderHints.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-amber-200/40 dark:border-amber-800/50 text-2xs text-amber-800 dark:text-amber-200">
                            <strong>填空与替换建议:</strong>
                            <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                              {sec.placeholderHints.map((hint, hIdx) => (
                                <li key={hIdx}>{hint}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-indigo-100 dark:border-indigo-800/60 bg-indigo-50/45 dark:bg-indigo-950/30 p-4">
                  <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>本篇核心闪光表达与连词（点击任意单词即点即查）：</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTemplate.highlightPhrases.map((phrase, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-serif font-medium text-indigo-700 dark:text-indigo-300 shadow-xs"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 万能高分金句速查库 */}
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>万能高分句型库 (即查即背即拷)</span>
                    </h3>
                    <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                      覆盖首段名言引出、图表极值分析、深度归因与结尾倒装升华句
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="检索金句/语法结构..."
                      value={goldenSearch}
                      onChange={(e) => setGoldenSearch(e.target.value)}
                      className="h-8 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 outline-none w-44 sm:w-56 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs pb-1">
                  {(
                    ['all', 'opening', 'data_analysis', 'cause_effect', 'solution', 'conclusion'] as const
                  ).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGoldenCategory(c)}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        goldenCategory === c
                          ? 'bg-slate-900 dark:bg-indigo-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {c === 'all'
                        ? '全部金句'
                        : c === 'opening'
                        ? '首段引出'
                        : c === 'data_analysis'
                        ? '数据描摹'
                        : c === 'cause_effect'
                        ? '多维归因'
                        : c === 'solution'
                        ? '对策建议'
                        : '升华尾句'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto no-scrollbar">
                  {filteredGoldenSentences.map((g) => (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-2 group shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between text-2xs font-bold mb-1">
                          <span className="text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                            {g.categoryLabel}
                          </span>
                          <span className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                            {g.difficulty}
                          </span>
                        </div>
                        <p className="text-[14px] font-serif font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                          {g.sentence}
                        </p>
                        <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                          {g.translation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between text-2xs text-slate-400">
                        <span className="truncate max-w-[200px]">亮点：{g.grammarHighlight}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySentence(g.sentence, g.id)}
                          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedSentenceId === g.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedSentenceId === g.id ? '已复制' : '复制'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          板块 2: AI 作文智能批改舱 (三引擎并列触发 + 逐句一键采纳替换至草稿)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'grading' && (
        <div className="space-y-6">
          {/* 顶栏：历年真题写作精选题库快捷选取栏 */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs">
                  🎯
                </span>
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  考研英语历年真题作文题库速选
                </span>
                <span className="text-2xs text-slate-400 hidden sm:inline">
                  · 点击即可载入真题题干、图意要求与参考草稿
                </span>
              </div>
              <span className="text-2xs font-mono text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-800/70">
                英语一 / 英语二 双轨图文真题
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {PAST_ESSAY_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedPromptId === prompt.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <span className="text-2xs px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/15">
                    {prompt.year}{' '}
                    {prompt.examType === 'english_1'
                      ? '英一'
                      : prompt.examType === 'english_2'
                      ? '英二'
                      : '通用'}
                  </span>
                  <span>{prompt.subType}</span>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-indigo-100/80 dark:border-indigo-800/60 bg-indigo-50/35 dark:bg-indigo-950/30 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <span className="text-base">📌</span>
                  <span>{activePrompt.title}</span>
                </h3>
                <span className="text-2xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                  {activePrompt.category === 'big_essay' ? '大作文 (满分 20 分)' : '小作文 (满分 10 分)'}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 font-serif leading-relaxed bg-white/85 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/60">
                {activePrompt.promptZh}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-1 text-xs">
                <div className="md:col-span-7 text-2xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-800 dark:text-slate-100">
                    🖼️ 图画/图表核心要点：
                  </strong>
                  <span>{activePrompt.visualDescription}</span>
                </div>
                <div className="md:col-span-5 text-2xs flex flex-wrap items-center gap-1">
                  <strong className="text-indigo-900 dark:text-indigo-200 shrink-0">
                    ✨ 推荐闪光词：
                  </strong>
                  {activePrompt.recommendedKeywords.slice(0, 3).map((kw, kwIdx) => (
                    <span
                      key={kwIdx}
                      className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-serif text-2xs"
                    >
                      {kw.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 下部左右分栏工作台 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 左侧：输入工作台与三核批改控制台 (6列) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs space-y-4">
                <input
                  type="file"
                  ref={handwritingInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleHandwritingFile}
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      ✍️
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        英语写作作答区
                      </h2>
                      <p className="text-2xs text-slate-400">
                        支持打字、Ctrl+V 粘贴手写答题卡图片，纠错建议可一键原位替换回草稿
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs shrink-0">
                    <button
                      type="button"
                      onClick={() => setGradingEssayType('big_essay')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        gradingEssayType === 'big_essay'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      大作文 (20分)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGradingEssayType('small_essay')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        gradingEssayType === 'small_essay'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      小作文 (10分)
                    </button>
                  </div>
                </div>

                {/* 拍照/截图 OCR 捕获展示条 */}
                {handwritingImage && (
                  <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/35 p-3 flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={handwritingImage}
                        alt="手写作文预览"
                        className="w-12 h-12 object-cover rounded-xl border border-indigo-200 dark:border-indigo-700 shadow-xs shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                          <span>已捕获手写作文图片</span>
                          <span className="text-2xs text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                            OCR就绪
                          </span>
                        </div>
                        <p className="text-2xs text-indigo-600/80 dark:text-indigo-300/80 truncate">
                          可一键识别文字填入下方草稿框，或直接提交 AI 批改
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleOcrExtractHandwriting}
                        disabled={isOcrExtracting}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-500 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isOcrExtracting ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        <span>{isOcrExtracting ? '识别中...' : '提取文字'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHandwritingImage(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="移除此图片"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    rows={12}
                    onPaste={handleHandwritingPaste}
                    value={essayInput}
                    onChange={(e) => setEssayInput(e.target.value)}
                    placeholder="请在此输入或粘贴您的考研英语作文作答文本...（支持直接按 Ctrl + V 粘贴手写作文截图）"
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm sm:text-[15px] font-serif leading-[1.82] outline-none resize-none text-slate-800 dark:text-slate-100"
                  />
                  <div className="absolute right-3 bottom-3 text-2xs font-mono text-slate-400 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-xs">
                    当前: {(essayInput.match(/[a-zA-Z]+/g) || []).length} 词 ·{' '}
                    {essayInput.split(/\n+/).filter(Boolean).length} 段
                  </div>
                </div>

                {/* 辅助工具条 */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handwritingInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/50 text-xs text-indigo-700 dark:text-indigo-300 cursor-pointer font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>拍照/上传手写</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateDrawerOpen(!templateDrawerOpen)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-medium flex items-center gap-1"
                  >
                    <ScrollText className="w-3.5 h-3.5 text-amber-500" />
                    <span>{templateDrawerOpen ? '收起模板' : '速查万能模板'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activePrompt.sampleDraft) {
                        setEssayInput(activePrompt.sampleDraft)
                        setAdoptedReplacements({})
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-medium"
                  >
                    载入示例草稿
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEssayInput('')
                      setAdoptedReplacements({})
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-medium ml-auto"
                  >
                    清空
                  </button>
                </div>

                {/* 核心修复：清晰并列呈现三大作文批改引擎入口！ */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    选择批改引擎启动评估（纠错后支持一键原位替换草稿并重评）：
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={anyGradingBusy || !essayInput.trim()}
                      onClick={handleStartLocalGrading}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                      title="离线零积分毫秒级检测词数、复合句比、平庸词升级与常见语法缺陷"
                    >
                      {isLocalGrading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span>⚡ 本地秒级规则诊断</span>
                    </button>

                    <button
                      type="button"
                      disabled={anyGradingBusy || !essayInput.trim()}
                      onClick={handleStartAiGrading}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs shadow-indigo-600/20 disabled:opacity-50 cursor-pointer active:scale-98"
                      title="结构化五档评分、四维雷达进度条、逐句红线纠错对比与一键采纳"
                    >
                      {isAiStandardGrading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-sky-200" />
                      )}
                      <span>🤖 AI 标准阅卷批改</span>
                    </button>

                    <button
                      type="button"
                      disabled={anyGradingBusy || !essayInput.trim()}
                      onClick={handleStartMojuanGrading}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-xs shadow-purple-600/20 disabled:opacity-50 cursor-pointer active:scale-98"
                      title="呼叫墨卷领航导师流式深度推演逐段讲评与一档重构范文"
                    >
                      {isMojuanGrading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span>🖋️ 墨卷名师流式精批</span>
                    </button>
                  </div>
                </div>

                {/* 万能模板速背抽屉 */}
                {templateDrawerOpen && (
                  <div className="rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/35 dark:bg-amber-950/30 p-4 space-y-3 animate-fade-in text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                        <ScrollText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>考研英语写作万能高分模板背诵舱</span>
                      </span>
                      <span className="text-2xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded font-mono">
                        点击一键套用
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ESSAY_TEMPLATES.slice(0, 3).map((tpl) => (
                        <div
                          key={tpl.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-800/60 shadow-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-100">
                              {tpl.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const full = tpl.structure.map((s) => s.templateText).join('\n\n')
                                setEssayInput(full)
                                setTemplateDrawerOpen(false)
                              }}
                              className="text-2xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                            >
                              套用此模板 →
                            </button>
                          </div>
                          <p className="text-2xs text-slate-500 dark:text-slate-400">
                            {tpl.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mojuanStatusNotice && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800 text-2xs text-indigo-800 dark:text-indigo-200 flex items-center justify-between">
                    <span>💡 {mojuanStatusNotice}</span>
                    <button
                      type="button"
                      onClick={() => setMojuanStatusNotice(null)}
                      className="text-indigo-400 hover:text-indigo-700 font-bold ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {mojuanError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-2xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
                    <span>⚠️ {mojuanError}</span>
                    <button
                      type="button"
                      onClick={() => setMojuanError(null)}
                      className="text-rose-400 hover:text-rose-700 font-bold ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：多维诊断报告面板 (6列，支持多引擎结果自由切换) */}
            <div className="lg:col-span-6 space-y-4">
              {/* 若已有多个引擎结果，显示报告视图切换胶囊 */}
              {(gradingResult || aiEssayEvaluation || mojuanStreamingText || isMojuanGrading) && (
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveGradingEngine('local')}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl transition-all cursor-pointer ${
                      activeGradingEngine === 'local'
                        ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    ⚡ 本地规则报告 {gradingResult ? `(${gradingResult.overallScore}分)` : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGradingEngine('ai_standard')}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl transition-all cursor-pointer ${
                      activeGradingEngine === 'ai_standard'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    🤖 AI 标准阅卷 {aiEssayEvaluation ? `(${aiEssayEvaluation.totalScore}分)` : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGradingEngine('mojuan')}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl transition-all cursor-pointer ${
                      activeGradingEngine === 'mojuan'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    🖋️ 墨卷流式精批
                  </button>
                </div>
              )}

              {/* ── 报告视图 A：AI 标准阅卷批改结果 ── */}
              {activeGradingEngine === 'ai_standard' && aiEssayEvaluation ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-3xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-300" />
                        <span>考研英语大纲官方阅卷评估</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold">
                        {aiEssayEvaluation.tier}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2.5">
                      <span className="text-5xl font-black font-mono text-amber-300">
                        {aiEssayEvaluation.totalScore}
                      </span>
                      <span className="text-xl text-slate-400 font-mono">
                        / {aiEssayEvaluation.maxScore} 分
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                      <div className="p-2 rounded-xl bg-white/5">
                        <div className="text-2xs text-slate-400">总字数统计</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {aiEssayEvaluation.wordCount} 词
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5">
                        <div className="text-2xs text-slate-400">平均句长</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {aiEssayEvaluation.avgWordsPerSentence} 词
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5">
                        <div className="text-2xs text-slate-400">评分标准制</div>
                        <div className="text-sm font-bold font-mono text-emerald-300 mt-0.5">
                          全国统考五档制
                        </div>
                      </div>
                    </div>
                  </div>

                  {aiEssayEvaluation.dimensions && (
                    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>考研英语写作四维阅卷细分</span>
                      </h3>
                      <div className="space-y-3">
                        {aiEssayEvaluation.dimensions.map((dim: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {dim.dimension}
                              </span>
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {dim.score} / 100
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${dim.score}%` }}
                              />
                            </div>
                            <p className="text-2xs text-slate-500 dark:text-slate-400 leading-snug">
                              {dim.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 逐句排雷与红线纠错对比 + 一键采纳替换至草稿 */}
                  {aiEssayEvaluation.sentenceDiagnostics &&
                    aiEssayEvaluation.sentenceDiagnostics.length > 0 && (
                      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-3">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>
                            逐句语法排雷与纠错对比 ({aiEssayEvaluation.sentenceDiagnostics.length})
                          </span>
                        </h3>
                        <div className="space-y-3">
                          {aiEssayEvaluation.sentenceDiagnostics.map((diag: any, idx: number) => {
                            const adoptKey = `ai-diag-${idx}`
                            const adopted = Boolean(adoptedReplacements[adoptKey])
                            return (
                              <div
                                key={idx}
                                className="p-3.5 rounded-2xl border border-rose-100 dark:border-rose-800/60 bg-rose-50/25 dark:bg-rose-950/25 text-xs space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-2xs font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                                    {diag.errorType || '语法与语用规范'}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAdoptReplacement(adoptKey, diag.original, diag.corrected)
                                    }
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                      adopted
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs'
                                    }`}
                                  >
                                    {adopted ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>已替换至草稿</span>
                                      </>
                                    ) : (
                                      <>
                                        <Wand2 className="w-3 h-3" />
                                        <span>一键采纳替换至草稿</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-serif line-through leading-relaxed">
                                  {diag.original}
                                </div>
                                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-serif font-semibold leading-relaxed">
                                  ✓ {diag.corrected}
                                </div>
                                <p className="text-2xs text-slate-600 dark:text-slate-300">
                                  {diag.explanation}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                  {/* 闪光句型升级推荐 + 一键采纳替换至草稿 */}
                  {aiEssayEvaluation.sparkleUpgrades &&
                    aiEssayEvaluation.sparkleUpgrades.length > 0 && (
                      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-3">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>替换为高分闪光句型 (倒装/强调/无灵主语)</span>
                        </h3>
                        <div className="space-y-3">
                          {aiEssayEvaluation.sparkleUpgrades.map((item: any, idx: number) => {
                            const adoptKey = `ai-sparkle-${idx}`
                            const adopted = Boolean(adoptedReplacements[adoptKey])
                            return (
                              <div
                                key={idx}
                                className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/25 dark:bg-amber-950/25 text-xs space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-2xs text-slate-400 font-serif line-through truncate">
                                    {item.original}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAdoptReplacement(adoptKey, item.original, item.upgrade)
                                    }
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                                      adopted
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                    }`}
                                  >
                                    {adopted ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>已替换至草稿</span>
                                      </>
                                    ) : (
                                      <>
                                        <Wand2 className="w-3 h-3" />
                                        <span>一键采纳替换至草稿</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div className="text-sm text-amber-950 dark:text-amber-100 font-semibold font-serif bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 leading-relaxed">
                                  ✨ {item.upgrade}
                                </div>
                                <p className="text-2xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                                  {item.reason}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                  {aiEssayEvaluation.polishedVersion && (
                    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>基于您的立意重构的一档满分范文</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText?.(aiEssayEvaluation.polishedVersion)
                            alert('已复制满分范文！')
                          }}
                          className="text-2xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>复制范文</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/35 border border-indigo-100 dark:border-indigo-800/60 font-serif text-[14.5px] text-slate-800 dark:text-slate-100 leading-[1.82] whitespace-pre-wrap">
                        {aiEssayEvaluation.polishedVersion}
                      </div>

                      {aiEssayEvaluation.translation && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block mb-1">
                            地道中文参考译文：
                          </span>
                          {aiEssayEvaluation.translation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : activeGradingEngine === 'mojuan' && (isMojuanGrading || mojuanStreamingText) ? (
                /* ── 报告视图 B：墨卷导师流式深度精批 ── */
                <div className="rounded-3xl border border-indigo-200/90 dark:border-indigo-800 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        墨
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>墨卷导师 · 考研官方 20 分制流式精批</span>
                          {isMojuanGrading && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-2xs font-mono animate-pulse">
                              <Sparkles className="w-2.5 h-2.5" /> 逐维推演中
                            </span>
                          )}
                        </div>
                        <div className="text-2xs text-indigo-300">
                          政治/英语双科领航导师 · 阅卷采分点严审
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText?.(mojuanStreamingText)
                        alert('已复制墨卷导师批改全案！')
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>复制全案</span>
                    </button>
                  </div>

                  <div className="rounded-2xl bg-black/35 border border-white/10 p-4 max-h-[560px] overflow-y-auto no-scrollbar text-xs text-slate-200 leading-relaxed">
                    {mojuanStreamingText ? (
                      <MarkdownRenderer content={mojuanStreamingText} />
                    ) : (
                      <span>墨卷导师正在建立采分点矩阵，请稍候...</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-2xs text-indigo-300">
                    <span>💡 批改标准：严格对标考研英语大纲 4 大阅卷维度</span>
                    <button
                      type="button"
                      disabled={isMojuanGrading}
                      onClick={handleStartMojuanGrading}
                      className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      重新批改
                    </button>
                  </div>
                </div>
              ) : activeGradingEngine === 'local' && gradingResult ? (
                /* ── 报告视图 C：本地秒级规则诊断报告 + 一键采纳替换至草稿 ── */
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                        LOCAL RULE ENGINE REPORT
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-xs font-bold">
                        {gradingResult.tierLevel}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-amber-300">
                        {gradingResult.overallScore}
                      </span>
                      <span className="text-lg text-slate-400 font-mono">
                        / {gradingResult.maxScore} 分
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      {gradingResult.tierFeedback}
                    </p>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center">
                      <div>
                        <div className="text-2xs text-slate-400">总字数</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {gradingResult.statistics.wordCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xs text-slate-400">复合句比</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {gradingResult.statistics.complexSentenceRatio}%
                        </div>
                      </div>
                      <div>
                        <div className="text-2xs text-slate-400">词汇丰富度</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {gradingResult.statistics.typeTokenRatio}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xs text-slate-400">平均句长</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {gradingResult.statistics.avgWordsPerSentence} 词
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 本地逐句语法排雷 + 一键采纳替换至草稿 */}
                  {gradingResult.syntaxAndGrammarIssues.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>
                          逐句语法与句式诊断 ({gradingResult.syntaxAndGrammarIssues.length})
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {gradingResult.syntaxAndGrammarIssues.map((iss, idx) => {
                          const adoptKey = `local-syntax-${idx}`
                          const adopted = Boolean(adoptedReplacements[adoptKey])
                          return (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl border border-rose-100 dark:border-rose-800/60 bg-rose-50/25 dark:bg-rose-950/25 text-xs space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-2xs font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                                  {iss.issueType}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAdoptReplacement(adoptKey, iss.sentence, iss.improvement)
                                  }
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    adopted
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                  }`}
                                >
                                  {adopted ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>已替换至草稿</span>
                                    </>
                                  ) : (
                                    <>
                                      <Wand2 className="w-3 h-3" />
                                      <span>一键采纳替换至草稿</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/70 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-serif line-through">
                                {iss.sentence}
                              </div>
                              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-serif font-semibold">
                                ✓ {iss.improvement}
                              </div>
                              <p className="text-2xs text-slate-600 dark:text-slate-300">
                                {iss.description}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* 平庸词升级矩阵 + 一键采纳首推高级词替换回草稿 */}
                  <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>
                          平庸词一档升级替换 ({gradingResult.vocabularyUpgrades.length})
                        </span>
                      </h3>
                      <span className="text-2xs text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                        点击高级词一键替换至草稿
                      </span>
                    </div>

                    {gradingResult.vocabularyUpgrades.length > 0 ? (
                      <div className="space-y-2.5">
                        {gradingResult.vocabularyUpgrades.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-indigo-950/25 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="line-through text-slate-400 font-serif font-medium">
                                {item.original}
                              </span>
                              <ArrowRight className="w-3 h-3 text-indigo-400" />
                              <div className="flex flex-wrap gap-1">
                                {item.suggested.map((sug, sIdx) => {
                                  const wKey = `vocab-up-${idx}-${sIdx}`
                                  const isUsed = Boolean(adoptedReplacements[wKey])
                                  return (
                                    <button
                                      key={sIdx}
                                      type="button"
                                      onClick={() =>
                                        handleAdoptReplacement(
                                          wKey,
                                          item.original.split('/')[0].trim(),
                                          sug
                                        )
                                      }
                                      className={`px-2 py-0.5 rounded-md border font-bold font-serif text-xs transition-colors cursor-pointer ${
                                        isUsed
                                          ? 'bg-emerald-600 border-emerald-600 text-white'
                                          : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white'
                                      }`}
                                      title="点击将该高级词替换至左侧草稿"
                                    >
                                      {isUsed ? `✓ ${sug}` : sug}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                            <p className="text-2xs text-slate-600 dark:text-slate-300">
                              {item.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-3">
                        🎉 未检测到初级平庸词，词汇档次表现优异！
                      </p>
                    )}
                  </div>

                  {/* 四维细分 */}
                  <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>考研四维阅卷维度细分</span>
                    </h3>

                    <div className="space-y-3">
                      {gradingResult.dimensionScores.map((dim) => (
                        <div key={dim.dimension} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {dim.dimension}
                            </span>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {dim.score} / 100
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                          <p className="text-2xs text-slate-500 dark:text-slate-400 leading-snug">
                            {dim.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>智能升级示范全文 (一档范文)</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText?.(gradingResult.polishedVersion)
                          alert('已复制润色范文！')
                        }}
                        className="text-2xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制范文</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/35 border border-indigo-100 dark:border-indigo-800/60 font-serif text-[14.5px] text-slate-800 dark:text-slate-100 leading-[1.82] whitespace-pre-wrap">
                      {gradingResult.polishedVersion}
                    </div>
                  </div>
                </div>
              ) : (
                /* 空态提示卡 */
                <div className="h-full min-h-[420px] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xl shadow-xs">
                    📝
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    等待提交作文启动多核精批
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    在左侧选择历年真题并输入草稿，点击底部「⚡ 本地秒级规则诊断」、「🤖 AI 标准阅卷批改」或「🖋️ 墨卷名师流式精批」，逐句纠错卡片支持一键原位替换回草稿重评。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          板块 3: 历年真题套卷全真模考舱与精析
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'papers' && (
        <EnglishFullPaperView
          onGoToPractice={() => setActiveTab('practice')}
          onGoToEssayGrading={() => setActiveTab('grading')}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          板块 4: 大纲核心背单词中心
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'vocab' && (
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { key: 'review', label: '艾宾浩斯真题刷词' },
              { key: 'browse', label: '2000+大纲词库' },
              { key: 'stats', label: '记忆掌握度统计' },
              { key: 'relations', label: '词根词缀图谱' },
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setVocabSubTab(st.key as any)}
                className={`shrink-0 whitespace-nowrap px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  vocabSubTab === st.key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div
            className={`rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs ${
              vocabSubTab === 'relations' ? 'p-2 sm:p-4 overflow-hidden' : 'p-3.5 sm:p-6'
            }`}
          >
            {vocabSubTab === 'review' && <VocabTab />}
            {vocabSubTab === 'browse' && <WordBrowser />}
            {vocabSubTab === 'stats' && <VocabStats />}
            {vocabSubTab === 'relations' && (
              <ChunkErrorBoundary title="词根词缀衍生树加载失败">
                <Suspense fallback={<SuspenseTimeoutFallback label="正在装载词根词缀衍生树..." />}>
                  <div className="h-[62dvh] min-h-[440px] max-h-[620px] md:h-[640px] w-full">
                    <WordRelations />
                  </div>
                </Suspense>
              </ChunkErrorBoundary>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          板块 5 (新增): 📚 讲义与真题资料库（核心解题方法论讲义 + 英语 PDF/文档书架）
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'materials' && (
        <div className="space-y-6 animate-fade-in">
          {/* 顶栏搜索与上传控制卡 */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Library className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>考研英语 · 核心解题方法论讲义与真题书架</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                内置考研英语四大题型高分方法论精讲，并聚合个人与共享英语真题 PDF、外刊讲义与题库提取入口
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  placeholder="搜索讲义、技巧或真题书名..."
                  className="h-9 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 outline-none w-48 sm:w-56 text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="button"
                onClick={() => openUploadModal('books')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>上传真题 PDF / 外刊讲义</span>
              </button>
            </div>
          </div>

          {/* 第一部分：内置考研英语核心解题方法论讲义 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>精选考研英语高分方法论讲义 ({filteredHandouts.length} 篇)</span>
              </h3>
              <span className="text-[11px] text-slate-400">支持章节目录导览与随时对照练习</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHandouts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedHandout(item)
                    setHandoutModalOpen(true)
                  }}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3.5 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                        {item.difficulty}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.readTime}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>

                    {item.keyTheorems.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-50/55 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 truncate">
                        💡 {item.keyTheorems[0]}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>沉浸精读</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 第二部分：个人与共享英语资料书架 */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>英语电子书与真题文档书架 ({filteredShelfBooks.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={loadEnglishBooks}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="刷新书架列表"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBooks ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                {(
                  [
                    { key: 'all', label: '全部来源' },
                    { key: 'personal', label: '个人独享' },
                    { key: 'shared', label: '全员共享' },
                  ] as const
                ).map((sc) => (
                  <button
                    key={sc.key}
                    type="button"
                    onClick={() => setBookScopeFilter(sc.key)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      bookScopeFilter === sc.key
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredShelfBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShelfBooks.map((book) => {
                  const isPdf = Boolean(book.isPdf || book.ext?.toLowerCase() === '.pdf')
                  const sizeMb = (book.size / (1024 * 1024)).toFixed(2)
                  const isBusy = readingBookId === book.id

                  return (
                    <div
                      key={book.id}
                      onClick={() => handleOpenBookItem(book)}
                      className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-[10.5px]">
                          <span
                            className={`px-2 py-0.5 rounded font-bold border ${
                              isPdf
                                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800'
                                : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800'
                            }`}
                          >
                            {isPdf ? 'PDF 真题/专著' : `${(book.ext || 'DOC').toUpperCase()} 讲义`}
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            {book.scope === 'personal' ? (
                              <>
                                <Lock className="w-3 h-3 text-indigo-500" />
                                <span>个人</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-3 h-3 text-emerald-500" />
                                <span>共享</span>
                              </>
                            )}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 leading-snug">
                          {book.name}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono">
                          {book.category || '考研英语'} · {sizeMb} MB
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {isBusy ? '加载中...' : isPdf ? 'Canvas 预览 →' : '阅读讲义 →'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-8 text-center space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  当前书架暂无已上传的考研英语 PDF 真题或外刊文档资料
                </p>
                <button
                  type="button"
                  onClick={() => openUploadModal('books')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>立即上传英语真题卷 / 外刊文档并提取题库</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 跨组件模态框挂载（上传导入、Markdown 讲义阅读器、PDF Canvas 阅读器） ── */}
      {importModalOpen && (
        <Suspense fallback={null}>
          <ImportResourceModal
            isOpen={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            defaultDomain="english"
            defaultTab={importDefaultTab}
            onBooksUpdated={loadEnglishBooks}
            onQuestionsUpdated={() => setCustomQuizRefreshKey((k) => k + 1)}
          />
        </Suspense>
      )}

      {handoutModalOpen && (
        <Suspense fallback={null}>
          <HandoutReaderModal
            isOpen={handoutModalOpen}
            onClose={() => setHandoutModalOpen(false)}
            handout={selectedHandout}
            onPractice={() => {
              setHandoutModalOpen(false)
              setActiveTab('practice')
            }}
            onAskAI={() => {
              setHandoutModalOpen(false)
              setActiveTab('dailyReading')
            }}
          />
        </Suspense>
      )}

      {pdfModalOpen && (
        <Suspense fallback={null}>
          <PdfViewerModal
            isOpen={pdfModalOpen}
            onClose={() => setPdfModalOpen(false)}
            book={selectedPdfBook}
          />
        </Suspense>
      )}
    </div>
  )
}
