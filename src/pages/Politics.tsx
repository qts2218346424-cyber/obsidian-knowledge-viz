import { useState, useMemo, useEffect, useRef, useCallback, Suspense, type CSSProperties } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { lazyWithRetry } from '../utils/lazyWithRetry'
import ChunkErrorBoundary from '../components/ChunkErrorBoundary'
import SuspenseTimeoutFallback from '../components/ui/SuspenseTimeoutFallback'
import { useAuth } from '../contexts/AuthContext'
import { useThemeStyle } from '../hooks/useThemeStyle'
import { api, type BookItem } from '../services/api'
import { authService } from '../services/auth'
import type { HandoutItem } from '../data/handoutsData'
import { POLITICS_HANDOUTS } from '../data/politicsHandouts'
import {
  HISTORY_ERAS,
  CATEGORY_META,
  ENHANCED_HISTORY_TIMELINE_ITEMS,
  COMPARISON_MATRICES,
  getYearStageContext,
  type ItemCategory,
} from '../data/historyTimelineData'
import {
  XIAO_1000_POLITICS_QUESTIONS,
  POLITICS_SUBJECT_META,
  type PoliticsQuestion,
  type PoliticsSubject,
  type PoliticsQuestionType,
} from '../data/politicsQuestions'
import {
  POLITICS_HAT_ITEMS,
  HAT_CATEGORY_TAGS,
  HAT_SUBJECT_LIST,
  POLITICS_SUBJECTIVE_QUESTIONS,
  type HatCategoryTag,
  type HatSubject,
} from '../data/politicsBoosterData'
import {
  Landmark,
  MapPin,
  Flame,
  Eye,
  EyeOff,
  Star,
  AlertTriangle,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Search,
  BookOpen,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  Table2,
  Compass,
  FileCheck2,
  HelpCircle,
  Upload,
  Library,
  FileText,
  Target,
  PenTool,
  Bot,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Layers,
  ExternalLink,
  CheckCircle2,
  Square,
  Loader2,
  Sun,
  Moon,
  Award,
  Globe,
} from 'lucide-react'

const ChinaHistoricalMap = lazyWithRetry(() => import('../components/ChinaHistoricalMap'), 'chinaHistoricalMap')
const ImportResourceModal = lazyWithRetry(() => import('../components/ImportResourceModal'), 'importResourceModal')
const HandoutReaderModal = lazyWithRetry(() => import('../components/HandoutReaderModal'), 'handoutReaderModal')
const PdfViewerModal = lazyWithRetry(() => import('../components/PdfViewerModal'), 'pdfViewerModal')
const MarkdownRenderer = lazyWithRetry(() => import('../components/MarkdownRenderer'), 'markdownRenderer')

type PoliticsTab = 'timeline' | 'library' | 'xiao1000' | 'booster' | 'matrices' | 'favorites'
type AnniversaryMode = 'both' | '2027' | '2026'
type MapThemeMode = 'adaptive' | 'cinema'
type QuizSourceFilter = 'all' | 'builtin' | 'custom'
type BoosterSubTab = 'hats' | 'subjective'

const STORAGE_KEY_FAV_ITEMS = 'coreforge_politics_fav_items_v1'
const STORAGE_KEY_FAV_QUESTIONS = 'coreforge_politics_fav_questions_v1'
const STORAGE_KEY_QUIZ_HISTORY = 'coreforge_politics_quiz_history_v1'

const CIRCLED_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧']

function getAnniversaryInfo(year: number, mode: AnniversaryMode): { matched: boolean; labels: string[] } {
  const labels: string[] = []
  const diff2026 = 2026 - year
  const diff2027 = 2027 - year
  if ((mode === '2026' || mode === 'both') && diff2026 > 0 && diff2026 % 5 === 0) {
    labels.push(`2026逢${diff2026}周年`)
  }
  if ((mode === '2027' || mode === 'both') && diff2027 > 0 && diff2027 % 5 === 0) {
    labels.push(`2027考研${diff2027}周年`)
  }
  return { matched: labels.length > 0, labels }
}

/** 将外部导入的政治科目名称智能映射至六大标准分类 */
function mapToPoliticsSubject(rawSubject?: string, rawText?: string): PoliticsSubject {
  const s = `${rawSubject || ''} ${rawText || ''}`
  if (/史纲|近代史|现代史|鸦片战争|辛亥|五四|长征|抗日/.test(s)) return '中国近现代史纲要'
  if (/思修|道德|法治|法律|人生观|爱国主义/.test(s)) return '思想道德与法治'
  if (/习思想|新思想|新时代|中国式现代化|新质生产力|两个结合/.test(s)) return '习近平新时代中国特色社会主义思想'
  if (/毛中特|毛泽东|邓小平|三个代表|科学发展观|新民主主义|三大改造/.test(s)) return '毛泽东思想和中国特色社会主义理论体系'
  if (/时政|形势与政策|二十届|人类命运共同体|全球倡议|大国外交/.test(s)) return '形势与政策'
  return '马克思主义基本原理'
}

/** 将 /api/quiz/custom 返回的题目规整为标准政治单选/多选题 */
function normalizeCustomPoliticsQuestion(raw: any, idx: number): PoliticsQuestion | null {
  if (!raw || typeof raw.question !== 'string' || !raw.question.trim()) return null

  const domainStr = String(raw.domain || '').toLowerCase()
  const subjStr = String(raw.subject || '')
  const isPoliticsDomain =
    domainStr === 'politics' ||
    /马原|马克思主义|毛中特|毛泽东|习思想|新时代|史纲|近代史|思修|道德与法治|形势与政策|时政|考研政治/.test(subjStr)

  if (!isPoliticsDomain) return null

  // 必须具备可选项（若选项缺失则尝试跳过纯主观简答题）
  const rawOpts = raw.options
  if (!rawOpts || typeof rawOpts !== 'object') return null
  const optA = String(rawOpts.A ?? rawOpts.a ?? '').trim()
  const optB = String(rawOpts.B ?? rawOpts.b ?? '').trim()
  const optC = String(rawOpts.C ?? rawOpts.c ?? '').trim()
  const optD = String(rawOpts.D ?? rawOpts.d ?? '').trim()
  if (!optA && !optB) return null

  // 智能解析单选或多项答案（如 ['A','C'] 或 'ACD' 或 'A, C, D'）
  let letters: string[] = []
  if (Array.isArray(raw.answer)) {
    letters = raw.answer
      .map((x: unknown) => String(x).toUpperCase().trim())
      .filter((x: string) => ['A', 'B', 'C', 'D'].includes(x))
  } else if (typeof raw.answer === 'string') {
    const matched: string[] | null = raw.answer.toUpperCase().match(/[ABCD]/g)
    if (matched) {
      letters = Array.from(new Set<string>(matched)).sort()
    }
  }
  if (letters.length === 0) letters = ['A']

  const isMultiple = raw.type === 'multiple' || letters.length > 1
  const normalizedSubject = mapToPoliticsSubject(subjStr, raw.question)
  const explanationText = String(raw.explanation || raw.analysis?.corePoint || '详见教材及权威真题解析。').trim()

  return {
    id: String(raw.id || `custom-pol-${idx}`),
    subject: normalizedSubject,
    type: isMultiple ? 'multiple' : 'single',
    chapter: String(raw.chapter || '📥 个人上传题库提取'),
    question: raw.question.trim(),
    options: {
      A: optA || '选项 A',
      B: optB || '选项 B',
      C: optC || '选项 C',
      D: optD || '选项 D',
    },
    answer: isMultiple ? letters : letters[0],
    analysis: {
      corePoint: explanationText,
      optionBreakdown: String(
        raw.analysis?.optionBreakdown ||
          `本题为${isMultiple ? '多项选择题（少选、多选或错选均不得分）' : '单项选择题'}，标准答案为 ${letters.join('')}。`
      ),
      pitfallWarning: String(
        raw.analysis?.pitfallWarning ||
          (Array.isArray(raw.tags) && raw.tags.length > 0 ? `关联考点标签：${raw.tags.join(' · ')}` : '')
      ),
    },
    keyKnowledgeCard: {
      title: `${normalizedSubject} · 导入真题考点`,
      formula: `标准答案：${letters.join('')}`,
      takeaway: explanationText.slice(0, 120),
    },
    difficulty:
      raw.difficulty === '困难' || raw.difficulty === '易错陷阱'
        ? '易错陷阱'
        : raw.difficulty === '简单' || raw.difficulty === '基础必拿'
        ? '基础必拿'
        : '重点高频',
    isCustom: true,
    sourceLabel: '我的导入题库',
  }
}

const POLITICS_INTERACTIVE_LABS = [
  {
    id: 'cw-marx-surplus-value',
    emoji: '💰',
    title: '剩余价值生产模拟器',
    badge: '马原政经必考',
    desc: '动态调节工作日长度、必要劳动时间与不变资本 c，实时透视绝对/相对剩余价值、剩余价值率 m′ 与利润率 p′ 联动公式。',
    accent: 'from-amber-500/15 to-orange-500/10 border-amber-300/60 dark:border-amber-500/30',
  },
  {
    id: 'cw-marx-dialectics',
    emoji: '🧭',
    title: '唯物辩证法情景闯关',
    badge: '选择题秒杀',
    desc: '用古诗词与时政语境训练对立统一、质量互变、否定之否定三大规律及五对基本范畴的快速定性归类能力。',
    accent: 'from-indigo-500/15 to-blue-500/10 border-indigo-300/60 dark:border-indigo-500/30',
  },
  {
    id: 'cw-marx-classic-works',
    emoji: '📚',
    title: '马恩经典著作双向配对',
    badge: '文献帽子题',
    desc: '从《1844手稿》《提纲》《共产党宣言》《资本论》到《实践论》《矛盾论》，支持“观点配著作”双向随机自测。',
    accent: 'from-rose-500/15 to-pink-500/10 border-rose-300/60 dark:border-rose-500/30',
  },
  {
    id: 'cw-current-affairs-cards',
    emoji: '📰',
    title: '考研时政热点翻转卡',
    badge: '考前抢分',
    desc: '按理论创新、经济发展、制度改革、大国外交四象限提炼 20 张高频翻转记忆卡，随时抽查核心提法。',
    accent: 'from-emerald-500/15 to-teal-500/10 border-emerald-300/60 dark:border-emerald-500/30',
  },
]

export default function Politics() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { themeStyle } = useThemeStyle()

  const [showMobileMap, setShowMobileMap] = useState(true)
  const [isScrubbingMobileRail, setIsScrubbingMobileRail] = useState(false)
  const [activeTab, setActiveTab] = useState<PoliticsTab>('timeline')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'xiao1000' || tab === 'quiz' || tab === 'practice') {
      setActiveTab('xiao1000')
    } else if (tab === 'library' || tab === 'handouts' || tab === 'books') {
      setActiveTab('library')
    } else if (tab === 'booster' || tab === 'hats' || tab === 'subjective') {
      setActiveTab('booster')
      if (tab === 'subjective') setBoosterSubTab('subjective')
      if (tab === 'hats') setBoosterSubTab('hats')
    } else if (tab === 'timeline') {
      setActiveTab('timeline')
    } else if (tab === 'favorites') {
      setActiveTab('favorites')
    } else if (tab === 'matrices') {
      setActiveTab('matrices')
    }
  }, [searchParams])

  const [isFullscreen, setIsFullscreen] = useState(false)
  const fullScreenContainerRef = useRef<HTMLDivElement | null>(null)

  // -------------------------------------------------------------
  // 1. 史纲时空轴核心状态（含明暗自适应主题、同年份多事件切换、截断展开）
  // -------------------------------------------------------------
  const [mapThemeMode, setMapThemeMode] = useState<MapThemeMode>('adaptive')
  const isEyecareTheme = themeStyle === 'eyecare'
  const isCinemaTimeline = themeStyle === 'dark' || mapThemeMode === 'cinema'

  const [activeYear, setActiveYear] = useState<number>(1921)
  const [activeYearEventIdx, setActiveYearEventIdx] = useState<number>(0)
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')
  const [onlyAnniversary, setOnlyAnniversary] = useState(false)
  const [onlyPitfall, setOnlyPitfall] = useState(false)
  const [onlyHistoricalFirst, setOnlyHistoricalFirst] = useState(false)
  const [onlyRecentCurrent, setOnlyRecentCurrent] = useState(false)
  const [anniversaryMode] = useState<AnniversaryMode>('both')
  const [isPlaying, setIsPlaying] = useState(false)
  const [maskMode, setMaskMode] = useState(false)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({})
  const [expandedQuote, setExpandedQuote] = useState(false)
  const [expandedContradiction, setExpandedContradiction] = useState(false)
  const [activeMatrixId, setActiveMatrixId] = useState<string>(COMPARISON_MATRICES[0].id)
  const yearRailRef = useRef<HTMLDivElement | null>(null)
  const mobileYearRailRef = useRef<HTMLDivElement | null>(null)
  const pendingEventIdRef = useRef<string | null>(null)

  // 当切换年份时，若有指定待定位事件 ID 则对齐到该子事件，否则重置子事件索引与金句展开态
  useEffect(() => {
    if (!pendingEventIdRef.current) {
      setActiveYearEventIdx(0)
    }
    setExpandedQuote(false)
  }, [activeYear])

  // -------------------------------------------------------------
  // 2. 讲义与个人政治资料库 & 资源导入弹窗状态
  // -------------------------------------------------------------
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importModalTab, setImportModalTab] = useState<'books' | 'import_quiz' | 'analytics'>('books')
  const [politicsBooks, setPoliticsBooks] = useState<BookItem[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [readingBookId, setReadingBookId] = useState<string | null>(null)
  const [bookSearchQuery, setBookSearchQuery] = useState('')
  const [bookFormatFilter, setBookFormatFilter] = useState<'all' | 'pdf' | 'doc'>('all')
  const [handoutTagFilter, setHandoutTagFilter] = useState<string>('all')

  const [activeHandout, setActiveHandout] = useState<HandoutItem | null>(null)
  const [activePdfBook, setActivePdfBook] = useState<BookItem | null>(null)

  const openImportModal = useCallback((tab: 'books' | 'import_quiz' = 'books') => {
    setImportModalTab(tab)
    setImportModalOpen(true)
  }, [])

  const loadPoliticsBooks = useCallback(async () => {
    setLoadingBooks(true)
    try {
      const apiCompat = api as typeof api & { listBooks?: () => Promise<{ books: BookItem[] }> }
      const res = apiCompat.listBooks ? await apiCompat.listBooks() : await api.getBooks()
      if (res?.books && Array.isArray(res.books)) {
        setPoliticsBooks(res.books.filter((b) => b.domain === 'politics'))
      }
    } catch (err) {
      console.warn('加载政治书架资料失败:', err)
    } finally {
      setLoadingBooks(false)
    }
  }, [])

  useEffect(() => {
    loadPoliticsBooks()
  }, [loadPoliticsBooks])

  const handleOpenBookItem = useCallback(
    async (book: BookItem) => {
      const extLower = (book.ext || '').toLowerCase()
      const isPdfFile = Boolean(book.isPdf || extLower === '.pdf' || book.fileType === 'pdf')
      if (isPdfFile) {
        setActivePdfBook(book)
        return
      }

      setReadingBookId(book.id)
      try {
        const res = await api.readBook(book.relativePath, book.scope)
        const cleanTitle = book.name.replace(/\.[^/.]+$/, '')
        const virtualHandout: HandoutItem = {
          id: `book-reader-${book.id}`,
          title: cleanTitle,
          domain: 'politics',
          subject: '考研政治',
          readTime: `${Math.max(3, Math.ceil((res.content?.length || 1200) / 500))} 分钟`,
          difficulty: '核心考点',
          tags: ['个人政治书架', book.category || '政治资料', extLower.replace('.', '').toUpperCase() || '文档'],
          summary: `来自${book.scope === 'personal' ? '个人独享书架' : '共享政治资料库'}：《${book.name}》全文无乱码精读视图。`,
          keyTheorems: [
            `文件来源：${book.name}`,
            book.extractedInfo?.questionCount
              ? `已智能提取入库 ${book.extractedInfo.questionCount} 道政治题目`
              : '可在政治书架点击“提取题库”一键扫描生成单选/多选练习题',
          ],
          content: res.content || '> 暂未读取到文本内容，若该文件为纯扫描版文档，建议使用 PDF 预览或上传识别。',
        }
        setActiveHandout(virtualHandout)
      } catch (err: any) {
        window.alert(`读取资料《${book.name}》失败：${err?.message || '请稍后重试'}`)
      } finally {
        setReadingBookId(null)
      }
    },
    []
  )

  const handlePracticeFromHandout = useCallback((handout: HandoutItem) => {
    setActiveHandout(null)
    const tagText = `${handout.title} ${handout.tags.join(' ')}`
    const matchedSubject = mapToPoliticsSubject(handout.subject, tagText)
    setXiaoSubjectFilter(matchedSubject)
    setActiveQuestionIdx(0)
    setActiveTab('xiao1000')
  }, [])

  const handleAskAIFromHandout = useCallback(
    (handout: HandoutItem) => {
      setActiveHandout(null)
      const prompt = `我正在学习考研政治讲义《${handout.title}》，请帮我梳理本章最核心的选择题“帽子题”高频陷阱，并出一道结合时政的分析题考考我！`
      try {
        sessionStorage.setItem('prefilled_chat_prompt', prompt)
      } catch {}
      navigate('/chat')
    },
    [navigate]
  )

  // -------------------------------------------------------------
  // 3. 用户上传提取的自定义政治题库接入 (/api/quiz/custom?domain=politics)
  // -------------------------------------------------------------
  const [customPoliticsQuestions, setCustomPoliticsQuestions] = useState<PoliticsQuestion[]>([])
  const [quizSourceFilter, setQuizSourceFilter] = useState<QuizSourceFilter>('all')

  const fetchCustomPoliticsQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/quiz/custom?domain=politics', {
        headers: authService.getAuthHeaders(),
      })
      if (!res.ok) return
      const data = await res.json()
      if (data?.questions && Array.isArray(data.questions)) {
        const list: PoliticsQuestion[] = []
        data.questions.forEach((raw: any, i: number) => {
          const normalized = normalizeCustomPoliticsQuestion(raw, i)
          if (normalized) list.push(normalized)
        })
        setCustomPoliticsQuestions(list)
      }
    } catch (err) {
      console.warn('获取自定义政治题库失败:', err)
    }
  }, [])

  useEffect(() => {
    fetchCustomPoliticsQuestions()
    const onUpdated = () => {
      fetchCustomPoliticsQuestions()
    }
    window.addEventListener('custom-questions-updated', onUpdated)
    return () => window.removeEventListener('custom-questions-updated', onUpdated)
  }, [fetchCustomPoliticsQuestions])

  const allPoliticsQuestions = useMemo(() => {
    return [...XIAO_1000_POLITICS_QUESTIONS, ...customPoliticsQuestions]
  }, [customPoliticsQuestions])

  // -------------------------------------------------------------
  // 4. 用户级隔离：收藏夹与刷题记录持久化
  // -------------------------------------------------------------
  const { user } = useAuth()
  const userSuffix = user?.id ? `_u_${user.id}` : '_guest'
  const quizHistoryKey = `${STORAGE_KEY_QUIZ_HISTORY}${userSuffix}`
  const favItemsKey = `${STORAGE_KEY_FAV_ITEMS}${userSuffix}`
  const favQuestionsKey = `${STORAGE_KEY_FAV_QUESTIONS}${userSuffix}`

  const [favItemIds, setFavItemIds] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(favItemsKey)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const [favQuestionIds, setFavQuestionIds] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(favQuestionsKey)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>(() => {
    try {
      const raw = localStorage.getItem(quizHistoryKey)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const prevHistoryKeyRef = useRef<string>(quizHistoryKey)
  const skipNextHistorySaveRef = useRef<boolean>(false)

  useEffect(() => {
    if (prevHistoryKeyRef.current !== quizHistoryKey) {
      prevHistoryKeyRef.current = quizHistoryKey
      skipNextHistorySaveRef.current = true
    }
    try {
      const raw = localStorage.getItem(quizHistoryKey)
      setQuizAnswers(raw ? JSON.parse(raw) : {})
    } catch {
      setQuizAnswers({})
    }
  }, [quizHistoryKey])

  useEffect(() => {
    try {
      localStorage.setItem(favItemsKey, JSON.stringify(favItemIds))
    } catch {}
  }, [favItemIds, favItemsKey])

  useEffect(() => {
    try {
      localStorage.setItem(favQuestionsKey, JSON.stringify(favQuestionIds))
    } catch {}
  }, [favQuestionIds, favQuestionsKey])

  useEffect(() => {
    if (skipNextHistorySaveRef.current) {
      skipNextHistorySaveRef.current = false
      return
    }
    try {
      localStorage.setItem(quizHistoryKey, JSON.stringify(quizAnswers))
    } catch {}
  }, [quizAnswers, quizHistoryKey])

  const handleResetQuizHistory = () => {
    if (window.confirm('确定要清空当前的政治刷题记录吗？清空后将从第一题重新开始自测。')) {
      setQuizAnswers({})
      try {
        localStorage.removeItem(quizHistoryKey)
        localStorage.removeItem(STORAGE_KEY_QUIZ_HISTORY)
      } catch {}
    }
  }

  // -------------------------------------------------------------
  // 5. 核心刷题过滤状态
  // -------------------------------------------------------------
  const [xiaoSubjectFilter, setXiaoSubjectFilter] = useState<PoliticsSubject | 'all'>('all')
  const [xiaoTypeFilter, setXiaoTypeFilter] = useState<PoliticsQuestionType | 'all'>('all')
  const [xiaoSearchQuery, setXiaoSearchQuery] = useState('')
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0)
  const [multiSelectBuffer, setMultiSelectBuffer] = useState<Record<string, string[]>>({})

  // -------------------------------------------------------------
  // 6. 提分王牌：帽子题速查挖空 + 34–38 主观大题踩点默写 & AI 阅卷状态
  // -------------------------------------------------------------
  const [boosterSubTab, setBoosterSubTab] = useState<BoosterSubTab>('hats')

  // 6.1 帽子题状态
  const [hatSubjectFilter, setHatSubjectFilter] = useState<HatSubject | 'all'>('all')
  const [hatTagFilter, setHatTagFilter] = useState<HatCategoryTag | 'all'>('all')
  const [hatSearchQuery, setHatSearchQuery] = useState('')
  const [hatGlobalMask, setHatGlobalMask] = useState<boolean>(true)
  const [hatRevealedMap, setHatRevealedMap] = useState<Record<string, boolean>>({})

  const filteredHatItems = useMemo(() => {
    const q = hatSearchQuery.trim().toLowerCase()
    return POLITICS_HAT_ITEMS.filter((item) => {
      if (hatSubjectFilter !== 'all' && item.subject !== hatSubjectFilter) return false
      if (hatTagFilter !== 'all' && item.category !== hatTagFilter) return false
      if (q) {
        return (
          item.prompt.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.contrastTip.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [hatSubjectFilter, hatTagFilter, hatSearchQuery])

  const toggleSingleHatCloze = (id: string) => {
    setHatRevealedMap((prev) => {
      const currentlyVisible = hatGlobalMask ? Boolean(prev[id]) : prev[id] !== false
      return { ...prev, [id]: !currentlyVisible }
    })
  }

  const handleToggleAllHatsMask = (maskAll: boolean) => {
    setHatGlobalMask(maskAll)
    setHatRevealedMap({})
  }

  // 6.2 34–38 主观分析大题状态
  const [activeSubjectiveId, setActiveSubjectiveId] = useState<string>(POLITICS_SUBJECTIVE_QUESTIONS[0].id)
  const [maskPrincipleSegments, setMaskPrincipleSegments] = useState<boolean>(false)
  const [revealedSegmentKeys, setRevealedSegmentKeys] = useState<Record<string, boolean>>({})
  const [hideFullReferenceInRecite, setHideFullReferenceInRecite] = useState<boolean>(false)
  const [userEssayDrafts, setUserEssayDrafts] = useState<Record<string, string>>({})
  const [showMissedPointsHint, setShowMissedPointsHint] = useState<Record<string, boolean>>({})
  const isImeComposingRef = useRef<boolean>(false)

  // AI 政治阅卷组长 SSE 状态
  const [aiGradingMap, setAiGradingMap] = useState<Record<string, string>>({})
  const [isAiGrading, setIsAiGrading] = useState<boolean>(false)
  const [aiGradingError, setAiGradingError] = useState<string | null>(null)
  const aiAbortRef = useRef<AbortController | null>(null)

  const activeSubjective = useMemo(() => {
    return (
      POLITICS_SUBJECTIVE_QUESTIONS.find((item) => item.id === activeSubjectiveId) ||
      POLITICS_SUBJECTIVE_QUESTIONS[0]
    )
  }, [activeSubjectiveId])

  const currentDraft = userEssayDrafts[activeSubjective.id] || ''

  // 本地即时比对官方采分关键词命中情况
  const localScoringEval = useMemo(() => {
    const normalizedDraft = currentDraft.replace(/\s+/g, '').toLowerCase()
    const hitPoints: typeof activeSubjective.scoringPoints = []
    const missedPoints: typeof activeSubjective.scoringPoints = []
    let earnedWeight = 0
    let totalWeight = 0

    for (const pt of activeSubjective.scoringPoints) {
      totalWeight += pt.weight
      const candidates = [pt.keyword, ...(pt.aliases || [])]
      const isHit =
        normalizedDraft.length > 0 &&
        candidates.some((kw) => normalizedDraft.includes(kw.replace(/\s+/g, '').toLowerCase()))
      if (isHit) {
        hitPoints.push(pt)
        earnedWeight += pt.weight
      } else {
        missedPoints.push(pt)
      }
    }

    const hitPercent =
      activeSubjective.scoringPoints.length > 0
        ? Math.round((hitPoints.length / activeSubjective.scoringPoints.length) * 100)
        : 0
    const normalizedScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) / 10 : 0

    return {
      hitPoints,
      missedPoints,
      hitPercent,
      normalizedScore,
      totalCount: activeSubjective.scoringPoints.length,
    }
  }, [activeSubjective, currentDraft])

  const handleRequestAiGrading = useCallback(async () => {
    const draft = (userEssayDrafts[activeSubjective.id] || '').trim()
    if (!draft) {
      setAiGradingError('请先在默写框中输入你的作答要点，再呼叫 AI 政治阅卷组长踩点批改。')
      return
    }

    if (aiAbortRef.current) {
      aiAbortRef.current.abort()
    }
    const controller = new AbortController()
    aiAbortRef.current = controller

    setIsAiGrading(true)
    setAiGradingError(null)
    setAiGradingMap((prev) => ({ ...prev, [activeSubjective.id]: '' }))

    // 读取当前用户偏好的智能体通道，默认使用高可用 antigravity 通道
    let preferredProvider = 'antigravity'
    try {
      const savedProv = localStorage.getItem('coreforge_agent_provider')
      if (
        savedProv &&
        ['antigravity', 'web', 'claude-code', 'codex', 'ollama', 'lm-studio'].includes(savedProv)
      ) {
        preferredProvider = savedProv
      }
    } catch {}

    const officialRubricText = activeSubjective.scoringPoints
      .map((pt, idx) => `${idx + 1}. 【${pt.keyword}】（${pt.weight}分）：${pt.hint}`)
      .join('\n')

    const standardAnswerText = activeSubjective.segments
      .map((seg) => `[${seg.label}] ${seg.text}`)
      .join('\n')

    const gradingPrompt = [
      `请你作为全国硕士研究生招生考试《思想政治理论》主观分析题阅卷组长，对考生针对【${activeSubjective.questionNo} · ${activeSubjective.subject}】的背诵默写答案进行严格的“按点给分（满分 10 分）”批改！`,
      '',
      `【题目名称】：${activeSubjective.title}`,
      `${activeSubjective.materialBackground}`,
      `【设问】：\n${activeSubjective.subQuestions.join('\n')}`,
      '',
      `【官方采分关键词及分值权重（总计 10 分）】：\n${officialRubricText}`,
      '',
      `【标准参考答案范本】：\n${standardAnswerText}`,
      '',
      `【考生实际默写作答】：\n${draft}`,
      '',
      '请严格按以下 Markdown 结构输出纯中文阅卷报告（精炼犀利、一目了然）：',
      '1. **🏆 阅卷组长总评得分**：给出 `X.X / 10 分` 及档次定性（如一类卷/二类卷/三类卷）；',
      '2. **✅ 已踩中得分点明细**：逐条列出考生命中的原理词与材料结合亮点，并标注各项得分；',
      '3. **⚠️ 漏踩采分点与术语偏差**：一针见血指出遗漏的核心政治术语或表述不严谨之处（例如白话过多、未写哲学方法论或官方定性词）；',
      '4. **✨ 考场满分升华润色示范**：针对考生的薄弱段落，给出一段 120 字左右可直接背诵套用的高分规范答案改写。',
    ].join('\n')

    try {
      const res = await fetch('/api/local-agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({
          provider: preferredProvider,
          prompt: gradingPrompt,
          agentPrompt:
            '你是权威、严谨又善于鼓励考生的考研政治主观题阅卷组长。请全程使用纯正简体中文按采分点精准评阅，突出官方标准政治术语。',
          pageContext: `考研政治主观题阅卷舱 · ${activeSubjective.questionNo}`,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        if (res.status === 402) {
          const errData = await res.json().catch(() => ({}))
          window.dispatchEvent(new CustomEvent('open-checkin-modal'))
          throw new Error(errData.message || '伴学积分不足（单次阅卷需 0.1 积分），请先签到领取积分。')
        }
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `阅卷请求响应异常 (HTTP ${res.status})`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('浏览器当前不支持流式读取响应')

      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const evtBlock of events) {
          const lines = evtBlock.split('\n')
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const jsonStr = trimmed.slice(5).trim()
            if (!jsonStr || jsonStr === '[DONE]') continue
            try {
              const parsed = JSON.parse(jsonStr)
              if (parsed.type === 'text' && typeof parsed.content === 'string') {
                accumulated += parsed.content
                setAiGradingMap((prev) => ({ ...prev, [activeSubjective.id]: accumulated }))
              } else if (parsed.type === 'error' && parsed.content) {
                setAiGradingError(String(parsed.content))
              }
            } catch {
              // 忽略非 JSON 心跳行
            }
          }
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setAiGradingError(err?.message || 'AI 阅卷连接中断，请检查模型配置或稍后重试。')
    } finally {
      setIsAiGrading(false)
    }
  }, [activeSubjective, userEssayDrafts])

  const handleStopAiGrading = useCallback(() => {
    if (aiAbortRef.current) {
      aiAbortRef.current.abort()
      aiAbortRef.current = null
    }
    setIsAiGrading(false)
  }, [])

  // -------------------------------------------------------------
  // 7. 时空轴数据衍生
  // -------------------------------------------------------------
  const filteredItems = useMemo(() => {
    return ENHANCED_HISTORY_TIMELINE_ITEMS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
      if (onlyAnniversary && !getAnniversaryInfo(item.year, anniversaryMode).matched) return false
      if (onlyPitfall && !item.pitfall) return false
      if (onlyHistoricalFirst && !item.isHistoricalFirst) return false
      if (onlyRecentCurrent && !item.isRecentCivicCurrent) return false
      return true
    })
  }, [selectedCategory, onlyAnniversary, anniversaryMode, onlyPitfall, onlyHistoricalFirst, onlyRecentCurrent])

  const historicalFirstTotalCount = useMemo(
    () => ENHANCED_HISTORY_TIMELINE_ITEMS.filter((i) => i.isHistoricalFirst).length,
    []
  )
  const recentCurrentTotalCount = useMemo(
    () => ENHANCED_HISTORY_TIMELINE_ITEMS.filter((i) => i.isRecentCivicCurrent).length,
    []
  )

  const availableYears = useMemo(() => {
    const set = new Set<number>()
    filteredItems.forEach((item) => set.add(item.year))
    const list = Array.from(set).sort((a, b) => a - b)
    return list.length > 0 ? list : [1921]
  }, [filteredItems])

  useEffect(() => {
    if (!availableYears.includes(activeYear)) {
      const closest = availableYears.reduce((prev, curr) =>
        Math.abs(curr - activeYear) < Math.abs(prev - activeYear) ? curr : prev
      )
      setActiveYear(closest)
    }
  }, [availableYears, activeYear])

  const currentEra = useMemo(() => {
    if (activeYear < 1919) return HISTORY_ERAS[0]
    if (activeYear < 1949) return HISTORY_ERAS[1]
    if (activeYear < 1978) return HISTORY_ERAS[2]
    return HISTORY_ERAS[3]
  }, [activeYear])

  const currentYearItems = useMemo(() => {
    return filteredItems.filter((item) => item.year === activeYear)
  }, [filteredItems, activeYear])

  // 当通过地图点击名城切换同城事件时，精准定位到目标子事件索引
  useEffect(() => {
    const targetId = pendingEventIdRef.current
    if (!targetId) return
    const idx = currentYearItems.findIndex((i) => i.id === targetId)
    if (idx >= 0) {
      setActiveYearEventIdx(idx)
      pendingEventIdRef.current = null
    }
  }, [currentYearItems])

  // 自动将当前选中的年份胶囊在各自水平轨道内居中对齐（仅滚动轨道容器自身，避免触发整页垂直跳动）
  useEffect(() => {
    if (activeTab !== 'timeline') return
    const scrollRailToActive = (rail: HTMLDivElement | null) => {
      if (!rail || rail.offsetParent === null) return
      const activePill = rail.querySelector<HTMLButtonElement>(`[data-year-pill="${activeYear}"]`)
      if (!activePill) return
      const targetLeft = activePill.offsetLeft - rail.clientWidth / 2 + activePill.offsetWidth / 2
      rail.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: isScrubbingMobileRail ? 'auto' : 'smooth',
      })
    }
    scrollRailToActive(yearRailRef.current)
    scrollRailToActive(mobileYearRailRef.current)
  }, [activeYear, activeTab, isScrubbingMobileRail])

  const safeEventIdx = activeYearEventIdx < currentYearItems.length ? activeYearEventIdx : 0
  const activeItem = currentYearItems[safeEventIdx] || currentYearItems[0] || filteredItems[0]

  const { prevKeyYear, nextKeyYear } = useMemo(() => {
    let prev: number | null = null
    let next: number | null = null
    for (const y of availableYears) {
      if (y < activeYear) prev = y
      if (y > activeYear && next === null) next = y
    }
    return { prevKeyYear: prev, nextKeyYear: next }
  }, [availableYears, activeYear])

  // 自动巡航演练定时器
  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setInterval(() => {
      setActiveYear((curr) => {
        const next = availableYears.find((y) => y > curr)
        if (next !== undefined) return next
        setIsPlaying(false)
        return availableYears[0] ?? curr
      })
    }, 3600)
    return () => window.clearInterval(timer)
  }, [isPlaying, availableYears])

  // 键盘快捷键监听（严格避开输入框与中文输入法组合态）
  useEffect(() => {
    if (activeTab !== 'timeline') return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing || e.keyCode === 229) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowLeft' && prevKeyYear !== null) {
        e.preventDefault()
        setActiveYear(prevKeyYear)
      } else if (e.key === 'ArrowRight' && nextKeyYear !== null) {
        e.preventDefault()
        setActiveYear(nextKeyYear)
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying((v) => !v)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeTab, prevKeyYear, nextKeyYear])

  // 全屏切换处理
  const toggleFullScreen = useCallback(() => {
    const el = fullScreenContainerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => setIsFullscreen(true))
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => setIsFullscreen(false))
    }
  }, [])

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // 收藏切换
  const toggleFavItem = (id: string) => {
    if (!id) return
    setFavItemIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleFavQuestion = (id: string) => {
    if (!id) return
    setFavQuestionIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // 单选与多选判分交互
  const handleSingleSelect = (qid: string, opt: string) => {
    setQuizAnswers((prev) => ({ ...prev, [qid]: opt }))
  }

  const handleMultiToggle = (qid: string, opt: string) => {
    setMultiSelectBuffer((prev) => {
      const curr = prev[qid] || []
      const next = curr.includes(opt) ? curr.filter((x) => x !== opt) : [...curr, opt].sort()
      return { ...prev, [qid]: next }
    })
  }

  const handleMultiSubmit = (qid: string) => {
    const chosen = multiSelectBuffer[qid] || []
    if (chosen.length === 0) return
    setQuizAnswers((prev) => ({ ...prev, [qid]: chosen }))
  }

  // 题库筛选结果（融合内置精选 + 用户上传提取题库）
  const filteredXiaoQuestions = useMemo(() => {
    return allPoliticsQuestions.filter((q) => {
      if (quizSourceFilter === 'builtin' && q.isCustom) return false
      if (quizSourceFilter === 'custom' && !q.isCustom) return false
      if (xiaoSubjectFilter !== 'all' && q.subject !== xiaoSubjectFilter) return false
      if (xiaoTypeFilter !== 'all' && q.type !== xiaoTypeFilter) return false
      if (xiaoSearchQuery.trim()) {
        const query = xiaoSearchQuery.toLowerCase()
        return (
          q.question.toLowerCase().includes(query) ||
          q.chapter.toLowerCase().includes(query) ||
          q.analysis.corePoint.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [allPoliticsQuestions, quizSourceFilter, xiaoSubjectFilter, xiaoTypeFilter, xiaoSearchQuery])

  useEffect(() => {
    if (activeQuestionIdx >= filteredXiaoQuestions.length && filteredXiaoQuestions.length > 0) {
      setActiveQuestionIdx(0)
    }
  }, [filteredXiaoQuestions.length, activeQuestionIdx])

  // 个人书架与内置讲义筛选
  const filteredPoliticsBooks = useMemo(() => {
    const q = bookSearchQuery.trim().toLowerCase()
    return politicsBooks.filter((b) => {
      const isPdfFile = Boolean(b.isPdf || (b.ext || '').toLowerCase() === '.pdf' || b.fileType === 'pdf')
      if (bookFormatFilter === 'pdf' && !isPdfFile) return false
      if (bookFormatFilter === 'doc' && isPdfFile) return false
      if (q && !b.name.toLowerCase().includes(q) && !(b.category || '').toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [politicsBooks, bookSearchQuery, bookFormatFilter])

  const filteredBuiltInHandouts = useMemo(() => {
    if (handoutTagFilter === 'all') return POLITICS_HANDOUTS
    return POLITICS_HANDOUTS.filter(
      (h) => h.tags.some((t) => t.includes(handoutTagFilter)) || h.title.includes(handoutTagFilter)
    )
  }, [handoutTagFilter])

  // 收藏夹汇总
  const favoritedItemsList = useMemo(() => {
    return ENHANCED_HISTORY_TIMELINE_ITEMS.filter((item) => favItemIds[item.id])
  }, [favItemIds])

  const favoritedQuestionsList = useMemo(() => {
    return allPoliticsQuestions.filter((q) => favQuestionIds[q.id])
  }, [allPoliticsQuestions, favQuestionIds])

  // 从时空轴跳转到关联真题
  const jumpToXiaoByHistory = (year: number) => {
    const targetQ = allPoliticsQuestions.find((q) => q.relatedYear === year)
    setQuizSourceFilter('all')
    if (targetQ) {
      setXiaoSubjectFilter(targetQ.subject)
      setXiaoTypeFilter('all')
      setXiaoSearchQuery('')
      setActiveTab('xiao1000')
      const subjectPool = allPoliticsQuestions.filter((q) => q.subject === targetQ.subject)
      const idx = subjectPool.findIndex((q) => q.id === targetQ.id)
      setActiveQuestionIdx(idx >= 0 ? idx : 0)
    } else {
      setXiaoSubjectFilter('中国近现代史纲要')
      setActiveQuestionIdx(0)
      setActiveTab('xiao1000')
    }
  }

  const jumpToTimelineByQuestion = (year: number) => {
    setActiveYear(year)
    setActiveTab('timeline')
  }

  const currentAnniv = getAnniversaryInfo(activeYear, anniversaryMode)
  const currentStage = getYearStageContext(activeYear)

  // 统计指标
  const totalFavCount = favoritedItemsList.length + favoritedQuestionsList.length
  const answeredStats = useMemo(() => {
    let answered = 0
    let correct = 0
    allPoliticsQuestions.forEach((q) => {
      const ans = quizAnswers[q.id]
      if (!ans || (Array.isArray(ans) && ans.length === 0)) return
      answered++
      if (q.type === 'single' && ans === q.answer) {
        correct++
      } else if (
        q.type === 'multiple' &&
        Array.isArray(ans) &&
        Array.isArray(q.answer) &&
        ans.length === q.answer.length &&
        ans.every((x, i) => x === (q.answer as string[])[i])
      ) {
        correct++
      }
    })
    return { answered, correct }
  }, [allPoliticsQuestions, quizAnswers])

  // 地图城市点击联动历史事件（支持同城多史实循环切换，若受限于当前筛选器则自动放开筛选）
  const handleMapCityClick = useCallback(
    (cityName: string) => {
      const visibleMatches = filteredItems.filter(
        (item) =>
          item.cityName?.includes(cityName) ||
          item.location?.includes(cityName) ||
          item.title.includes(cityName)
      )
      const allMatches = ENHANCED_HISTORY_TIMELINE_ITEMS.filter(
        (item) =>
          item.cityName?.includes(cityName) ||
          item.location?.includes(cityName) ||
          item.title.includes(cityName)
      )
      if (allMatches.length === 0) return

      let pool = visibleMatches
      if (pool.length === 0) {
        setSelectedCategory('all')
        setOnlyAnniversary(false)
        setOnlyPitfall(false)
        setOnlyHistoricalFirst(false)
        setOnlyRecentCurrent(false)
        pool = allMatches
      }

      const currentIdx = pool.findIndex((item) => item.id === activeItem?.id)
      const targetItem = currentIdx >= 0 ? pool[(currentIdx + 1) % pool.length] : pool[0]
      pendingEventIdRef.current = targetItem.id
      if (targetItem.year === activeYear) {
        const sameYearList = (visibleMatches.length > 0 ? filteredItems : ENHANCED_HISTORY_TIMELINE_ITEMS).filter(
          (i) => i.year === targetItem.year
        )
        const subIdx = sameYearList.findIndex((i) => i.id === targetItem.id)
        if (subIdx >= 0) setActiveYearEventIdx(subIdx)
        pendingEventIdRef.current = null
      } else {
        setActiveYear(targetItem.year)
      }
    },
    [filteredItems, activeItem?.id, activeYear]
  )

  // 计算唯一编年滑块在轨道上的百分比位置与 CSS 变量（遵循 modern-web-guidance slider 规范）
  const sliderIndex = Math.max(0, availableYears.indexOf(activeYear))
  const sliderMaxIdx = Math.max(0, availableYears.length - 1)
  const sliderPercent = useMemo(() => {
    if (sliderIndex <= 0 || availableYears.length <= 1) return 0
    return Math.min(100, Math.max(0, (sliderIndex / sliderMaxIdx) * 100))
  }, [availableYears.length, sliderIndex, sliderMaxIdx])

  const sliderThemeClass = isCinemaTimeline
    ? 'slider-cinema'
    : isEyecareTheme
    ? 'slider-eyecare'
    : ''

  const sliderCustomStyle = useMemo((): CSSProperties => {
    return {
      '--attr-min': 0,
      '--attr-max': Math.max(1, sliderMaxIdx),
      '--control-value': sliderIndex,
      '--slider-fill-color': isCinemaTimeline
        ? '#f59e0b'
        : isEyecareTheme
        ? '#2d6a4f'
        : currentEra.themeColor,
    } as CSSProperties
  }, [sliderMaxIdx, sliderIndex, isCinemaTimeline, isEyecareTheme, currentEra.themeColor])

  // 计算移动端地图旁侧竖向编年轴的等比例里程碑刻度（自动防重叠且与滑块物理位置严格对齐）
  const mobileRailTicks = useMemo(() => {
    const total = availableYears.length
    if (total === 0) return []
    if (total === 1) return [{ year: availableYears[0], percent: 0 }]

    const maxIdx = total - 1
    const preferredAnchors = [
      availableYears[0],
      1895,
      1919,
      1921,
      1935,
      1949,
      1978,
      2012,
      availableYears[maxIdx],
    ]
    const chosen: Array<{ year: number; percent: number }> = []

    for (const y of preferredAnchors) {
      const idx = availableYears.indexOf(y)
      if (idx < 0) continue
      const percent = (idx / maxIdx) * 100
      const prev = chosen[chosen.length - 1]
      if (prev && percent - prev.percent < 15) {
        if (idx === maxIdx) {
          chosen[chosen.length - 1] = { year: y, percent }
        }
        continue
      }
      chosen.push({ year: y, percent })
    }

    if (chosen.length < Math.min(3, total)) {
      const count = Math.min(5, total)
      const fallback: Array<{ year: number; percent: number }> = []
      for (let i = 0; i < count; i++) {
        const idx = Math.round((i / (count - 1)) * maxIdx)
        const yr = availableYears[idx]
        const pct = (idx / maxIdx) * 100
        if (!fallback.some((t) => t.year === yr)) {
          fallback.push({ year: yr, percent: pct })
        }
      }
      return fallback
    }

    return chosen
  }, [availableYears])

  return (
    <div
      ref={fullScreenContainerRef}
      className={`mx-auto ${
        isFullscreen
          ? `fixed inset-0 z-50 p-3 sm:p-5 overflow-y-auto no-scrollbar ${
              themeStyle === 'dark'
                ? 'bg-[#080c14] text-slate-100'
                : isEyecareTheme
                ? 'bg-[#f5f6f2] text-[#243329]'
                : 'bg-slate-50 text-slate-900'
            }`
          : 'max-w-[1520px] w-full min-w-0 space-y-4 sm:space-y-5 pb-28 sm:pb-8 animate-fade-in-up text-slate-900 dark:text-slate-100'
      }`}
    >
      {/* ── 顶部统一政治专区导航驾驶舱（完美兼容鲜艳/极简/护眼/暗夜四大主题） ── */}
      <section className="bento-card rounded-3xl p-4 sm:p-5 relative overflow-hidden bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-500/30 text-2xs font-bold text-rose-700 dark:text-rose-300">
                <Landmark className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>2026/2027 考研政治五科全栈工作台</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-2xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-500/30">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>史纲舆图 · 讲义书架 · 核心刷题 · 帽子题挖空 · 34–38 大题 AI 阅卷</span>
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2 flex-wrap">
              <span>🏛️ 考研政治研学大本营</span>
              <span className="hidden sm:inline text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-500/30">
                五大学科 + 时政闭环
              </span>
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              集齐史纲时空舆图、政治 PDF/讲义个人资料库、单选多选母题库、高频“帽子题”挖空自测与主观分析题 AI 踩点阅卷
            </p>
          </div>

          {/* 顶栏右侧：醒目上传政治讲义/PDF题库按钮 + 全屏切换 */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openImportModal('books')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>📤 上传政治讲义 / PDF题库</span>
            </button>

            <button
              type="button"
              onClick={toggleFullScreen}
              aria-label={isFullscreen ? '退出全屏大屏' : '开启全屏沉浸研学'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/90 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all active:scale-95 cursor-pointer"
              title={isFullscreen ? '退出全屏大屏' : '全屏沉浸研学'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-amber-500" aria-hidden="true" />
              ) : (
                <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{isFullscreen ? '退出全屏' : '全屏模式'}</span>
            </button>
          </div>
        </div>

        {/* 单行水平滚动无障碍主 Tab 栏（6 大核心模块并列） */}
        <div
          role="tablist"
          aria-label="考研政治功能模块导航"
          className="flex items-center gap-1.5 overflow-x-auto mobile-no-scrollbar whitespace-nowrap rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 p-1.5 border border-slate-200/80 dark:border-slate-700/70"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'timeline'}
            onClick={() => setActiveTab('timeline')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'timeline'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>史纲时空大屏</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'library'}
            onClick={() => setActiveTab('library')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'library'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700/60'
            }`}
          >
            <Library className="w-3.5 h-3.5 shrink-0" />
            <span>📚 讲义与资料库</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-2xs font-extrabold ${
                activeTab === 'library'
                  ? 'bg-white/20 text-white'
                  : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
              }`}
            >
              {POLITICS_HANDOUTS.length + politicsBooks.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'xiao1000'}
            onClick={() => setActiveTab('xiao1000')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'xiao1000'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700/60'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
            <span>核心刷题舱</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-2xs font-extrabold ${
                activeTab === 'xiao1000'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
              }`}
            >
              {allPoliticsQuestions.length}题
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'booster'}
            onClick={() => setActiveTab('booster')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'booster'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700/60'
            }`}
          >
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span>🎯 帽子题 & 34–38 大题</span>
            <span
              className={`hidden sm:inline px-1.5 py-0.2 rounded-full text-2xs font-extrabold ${
                activeTab === 'booster'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
              }`}
            >
              AI阅卷
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'matrices'}
            onClick={() => setActiveTab('matrices')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'matrices'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700/60'
            }`}
          >
            <Table2 className="w-3.5 h-3.5 shrink-0" />
            <span>横向易混矩阵</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'favorites'}
            onClick={() => setActiveTab('favorites')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'favorites'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700/60'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 shrink-0" />
            <span>考点收藏夹</span>
            {totalFavCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-2xs bg-amber-500 text-white font-extrabold">
                {totalFavCount}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* =========================================================================
          TAB 1: 史纲时空大屏（支持 adaptive 温润明暗自适应 & cinema 玄墨金辉沉浸风）
         ========================================================================= */}
      {activeTab === 'timeline' && (
        <div
          className={`space-y-3.5 p-2.5 sm:p-5 rounded-3xl border transition-colors ${
            isCinemaTimeline
              ? 'cinema-dark-lock bg-[#070b14] border-amber-500/25 shadow-[0_12px_40px_rgba(0,0,0,0.45)] text-slate-100'
              : isEyecareTheme
              ? 'bento-card bg-[#fafbf8] border-[#cfe0c9] shadow-xs text-[#243329]'
              : 'bento-card bg-white border-amber-200/80 shadow-xs text-slate-800'
          }`}
        >
          {/* ── 顶部大屏标题与分类导航条 ── */}
          <div
            className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b ${
              isCinemaTimeline ? 'border-amber-500/20' : 'border-slate-200/80'
            }`}
          >
            {/* 左侧：年份与历史时期 */}
            <div className="flex items-baseline gap-3.5 flex-wrap">
              <span
                className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                  isCinemaTimeline
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.45)]'
                    : isEyecareTheme
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#40916c]'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-rose-700 via-amber-700 to-amber-600'
                }`}
              >
                {activeYear}
              </span>
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs sm:text-sm font-extrabold tracking-wide ${
                      isCinemaTimeline ? 'text-amber-200' : 'text-slate-900'
                    }`}
                  >
                    {currentEra.name}
                  </span>
                  <span
                    className={`text-2xs font-mono px-2 py-0.5 rounded-full border ${
                      isCinemaTimeline
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {currentEra.startYear}–{currentEra.key === 'reform_new_era' ? '至今' : currentEra.endYear}
                  </span>
                  {currentAnniv.matched && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-2xs font-black">
                      🔥 {currentAnniv.labels.join(' · ')}
                    </span>
                  )}
                </div>
                <span
                  className={`text-2xs font-mono mt-0.5 ${
                    isCinemaTimeline ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <span className="lg:hidden">中国近现代史纲要历史地理联动 · 上下拖动地图右侧编年轴切换年份</span>
                  <span className="hidden lg:inline">中国近现代史纲要历史地理联动视窗 · 支持键盘 ← / → 切换年份</span>
                </span>
              </div>
            </div>

            {/* 右侧：分类筛选药丸与控制按钮组 */}
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex overflow-x-auto mobile-no-scrollbar rounded-xl p-1 border ${
                  isCinemaTimeline
                    ? 'bg-[#0c1220] border-slate-800'
                    : 'bg-slate-100/90 border-slate-200/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedCategory === 'all'
                      ? isCinemaTimeline
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-rose-600 text-white shadow-xs'
                      : isCinemaTimeline
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  全部 ({ENHANCED_HISTORY_TIMELINE_ITEMS.length})
                </button>
                {(Object.keys(CATEGORY_META) as ItemCategory[]).map((cat) => {
                  const meta = CATEGORY_META[cat]
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                        selectedCategory === cat
                          ? isCinemaTimeline
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'bg-rose-600 text-white shadow-xs'
                          : isCinemaTimeline
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{meta.emoji}</span>
                      <span>{meta.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* 功能操作按钮（含自适应/沉浸暗屏切换） */}
              <div className="flex flex-wrap items-center gap-1.5">
                {themeStyle !== 'dark' && !isFullscreen && (
                  <button
                    type="button"
                    onClick={() => setMapThemeMode((m) => (m === 'adaptive' ? 'cinema' : 'adaptive'))}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      mapThemeMode === 'cinema'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                    title="在温润浅底自适应模式与玄墨沉浸暗屏之间切换"
                  >
                    {mapThemeMode === 'cinema' ? (
                      <>
                        <Sun className="w-3.5 h-3.5" />
                        <span>自适应浅底</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5" />
                        <span>🌌 沉浸暗屏</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  aria-pressed={onlyHistoricalFirst}
                  onClick={() => setOnlyHistoricalFirst((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    onlyHistoricalFirst
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs font-black'
                      : isCinemaTimeline
                      ? 'bg-[#0f172a] text-amber-300 border-amber-500/40 hover:border-amber-400'
                      : 'bg-amber-50/80 text-amber-800 border-amber-200 hover:bg-amber-100/80'
                  }`}
                  title="筛选近代反侵略第一次与各时期标志性首创考点"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>史上第一 ({historicalFirstTotalCount})</span>
                </button>

                <button
                  type="button"
                  aria-pressed={onlyRecentCurrent}
                  onClick={() => setOnlyRecentCurrent((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    onlyRecentCurrent
                      ? 'bg-sky-600 text-white border-sky-500 shadow-xs font-black'
                      : isCinemaTimeline
                      ? 'bg-[#0f172a] text-sky-300 border-sky-500/40 hover:border-sky-400'
                      : 'bg-sky-50/80 text-sky-800 border-sky-200 hover:bg-sky-100/80'
                  }`}
                  title="直达 2024–2026 近两年重大会议、大思政课与“十五五”时政热点"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>近两年思政/时政 ({recentCurrentTotalCount})</span>
                </button>

                <button
                  type="button"
                  aria-pressed={onlyAnniversary}
                  onClick={() => setOnlyAnniversary((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    onlyAnniversary
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                      : isCinemaTimeline
                      ? 'bg-[#0f172a] text-amber-400 border-amber-500/30 hover:border-amber-400'
                      : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>逢五逢十</span>
                </button>

                <button
                  type="button"
                  aria-pressed={onlyPitfall}
                  onClick={() => setOnlyPitfall((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    onlyPitfall
                      ? 'bg-rose-600 text-white border-rose-500 shadow-xs'
                      : isCinemaTimeline
                      ? 'bg-[#0f172a] text-rose-400 border-rose-500/30 hover:border-rose-400'
                      : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>陷阱</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMaskMode((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    maskMode
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : isCinemaTimeline
                      ? 'bg-[#0f172a] text-indigo-400 border-indigo-500/30 hover:border-indigo-400'
                      : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  {maskMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{maskMode ? '遮罩中' : '背诵遮罩'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying((v) => !v)}
                  aria-label={isPlaying ? '暂停自动巡航' : '自动播放历史演进'}
                  className={`p-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                    isPlaying
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : isCinemaTimeline
                      ? 'bg-[#0f172a] text-slate-300 border-slate-700 hover:border-amber-400'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={isPlaying ? '暂停自动巡航' : '自动播放历史演进'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Play className={`w-4 h-4 ${isCinemaTimeline ? 'text-amber-400' : 'text-rose-600'}`} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── 同一年份多史实切换胶囊条（彻底解决同年份第2/3个事件被吞没的 Bug） ── */}
          {currentYearItems.length > 1 && (
            <div
              className={`flex flex-wrap items-center gap-2 p-2.5 rounded-2xl border ${
                isCinemaTimeline
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  : 'bg-amber-50/90 border-amber-200 text-amber-900'
              }`}
            >
              <span className="text-xs font-extrabold flex items-center gap-1 shrink-0">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>{activeYear} 年共收录 {currentYearItems.length} 项重大史实，点击切换查阅：</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {currentYearItems.map((ev, idx) => {
                  const selected = idx === safeEventIdx
                  const numBadge = CIRCLED_NUMBERS[idx] || `(${idx + 1})`
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => {
                        setActiveYearEventIdx(idx)
                        setExpandedQuote(false)
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selected
                          ? isCinemaTimeline
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                            : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : isCinemaTimeline
                          ? 'bg-[#0c1220] text-slate-300 border-slate-700 hover:border-amber-400'
                          : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/60'
                      }`}
                    >
                      {numBadge} {ev.title}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── 核心三栏指挥视窗：移动端优先呈现「地图 + 旁侧可拖动编年轴」，桌面端保持三栏并列 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* 左侧（移动端排第2）：事件背景与核心决议文献 (4列) */}
            <div
              className={`order-2 lg:order-1 lg:col-span-4 flex flex-col justify-between p-4 sm:p-5 rounded-2xl border relative overflow-hidden ${
                isCinemaTimeline
                  ? 'bg-[#0c1220]/95 border-amber-500/20 shadow-xl'
                  : 'bg-slate-50/70 border-slate-200/80'
              }`}
            >
              <div className="space-y-3">
                <div>
                  <div
                    className={`flex items-center justify-between text-xs font-mono mb-1 ${
                      isCinemaTimeline ? 'text-amber-400/90' : 'text-rose-700 font-semibold'
                    }`}
                  >
                    <span>
                      {activeItem?.date || `${activeYear}年`}
                      {currentYearItems.length > 1 && ` · 事件 ${safeEventIdx + 1}/${currentYearItems.length}`}
                    </span>
                    <span>📍 {activeItem?.location || activeItem?.cityName || '中国'}</span>
                  </div>
                  <h2
                    className={`text-lg sm:text-xl font-black leading-snug tracking-wide text-balance ${
                      isCinemaTimeline ? 'text-amber-300' : 'text-slate-900'
                    }`}
                  >
                    {activeItem?.title || `${activeYear}年历史概览`}
                  </h2>
                  {(activeItem?.isHistoricalFirst || activeItem?.isRecentCivicCurrent) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {activeItem.isHistoricalFirst && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-extrabold border ${
                            isCinemaTimeline
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-amber-100/90 text-amber-900 border-amber-300'
                          }`}
                        >
                          <span>🥇</span>
                          <span>{activeItem.firstBadge || '历史上的第一次必考锚点'}</span>
                        </span>
                      )}
                      {activeItem.isRecentCivicCurrent && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-extrabold border ${
                            isCinemaTimeline
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-sky-100/90 text-sky-900 border-sky-300'
                          }`}
                        >
                          <span>🌟</span>
                          <span>2024–2026 思政与时政核心</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 视觉图解与文献金句卡片（支持点击展开被截断的金句） */}
                {activeItem?.illustration && (
                  <div
                    onClick={() => setExpandedQuote((v) => !v)}
                    className={`rounded-xl p-3 border relative overflow-hidden cursor-pointer transition-colors ${
                      isCinemaTimeline
                        ? 'bg-gradient-to-br from-[#121b2d] to-[#0a0f1d] border-amber-500/30 text-white hover:border-amber-400/60'
                        : 'bg-gradient-to-br from-amber-50/90 to-rose-50/50 border-amber-200/90 text-slate-800 hover:border-amber-300'
                    }`}
                    title="点击展开或收起完整文献金句"
                  >
                    <div className="absolute right-1 -bottom-2 text-5xl opacity-15 select-none pointer-events-none">
                      {activeItem.illustration.symbolIcon}
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span
                          className={`text-2xs font-bold ${
                            isCinemaTimeline ? 'text-amber-300' : 'text-amber-800'
                          }`}
                        >
                          {activeItem.illustration.subtitle}
                        </span>
                      </div>
                      {activeItem.illustration.figureQuote && (
                        <span
                          className={`text-2xs inline-flex items-center gap-0.5 font-semibold ${
                            isCinemaTimeline ? 'text-amber-400/80' : 'text-amber-700'
                          }`}
                        >
                          {expandedQuote ? (
                            <>
                              收起 <ChevronUp className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              展开金句 <ChevronDown className="w-3 h-3" />
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-xs font-black ${
                        isCinemaTimeline ? 'text-slate-100' : 'text-rose-800'
                      }`}
                    >
                      🔑 {activeItem.illustration.tag}
                    </div>
                    {activeItem.illustration.figureQuote && (
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          expandedQuote ? '' : 'line-clamp-2'
                        } ${isCinemaTimeline ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        {activeItem.illustration.figureQuote}
                      </p>
                    )}
                  </div>
                )}

                {/* 核心决议 / 重要文献 */}
                <div
                  className={`rounded-xl p-3 border space-y-1.5 ${
                    isCinemaTimeline
                      ? 'bg-[#0a0f1c] border-slate-800'
                      : 'bg-white border-slate-200/90 shadow-2xs'
                  }`}
                >
                  <div
                    className={`text-xs font-bold flex items-center gap-1.5 ${
                      isCinemaTimeline ? 'text-amber-400' : 'text-indigo-700'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>📜 历史背景与核心决议文献</span>
                  </div>
                  {maskMode && !revealedIds[activeItem?.id || ''] ? (
                    <button
                      type="button"
                      onClick={() => setRevealedIds((prev) => ({ ...prev, [activeItem?.id || '']: true }))}
                      className={`w-full text-left py-2 px-3 rounded-lg border border-dashed text-xs font-bold cursor-pointer ${
                        isCinemaTimeline
                          ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                          : 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      }`}
                    >
                      🙈 考点已遮罩，点击显影核对背诵结果
                    </button>
                  ) : (
                    <p
                      className={`text-xs leading-relaxed ${
                        isCinemaTimeline ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {activeItem?.content || currentStage.summary}
                    </p>
                  )}
                </div>

                {/* 历史主要矛盾与历史任务（支持点击展开全文） */}
                <div
                  onClick={() => setExpandedContradiction((v) => !v)}
                  className={`rounded-xl p-3 border text-xs space-y-1 cursor-pointer transition-colors ${
                    isCinemaTimeline
                      ? 'bg-[#090d18] border-slate-800/80 text-slate-300 hover:border-slate-700'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:border-slate-300'
                  }`}
                  title="点击展开完整主要矛盾与时期历史任务"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-bold ${
                        isCinemaTimeline ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      ⚖️ 本时期主要矛盾与历史任务
                    </span>
                    <span
                      className={`text-2xs inline-flex items-center gap-0.5 font-semibold ${
                        isCinemaTimeline ? 'text-amber-400' : 'text-indigo-600'
                      }`}
                    >
                      {expandedContradiction ? (
                        <>
                          收起 <ChevronUp className="w-3 h-3" />
                        </>
                      ) : (
                        <>
                          展开全文 <ChevronDown className="w-3 h-3" />
                        </>
                      )}
                    </span>
                  </div>
                  <p className={`leading-relaxed ${expandedContradiction ? '' : 'line-clamp-2'}`}>
                    <strong>主要矛盾：</strong>
                    {currentEra.coreContradiction}
                  </p>
                  {expandedContradiction && (
                    <p className="leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <strong>核心任务：</strong>
                      {currentEra.historicalTask}
                    </p>
                  )}
                </div>
              </div>

              {/* 底部前后节点导航 */}
              <div
                className={`pt-3 border-t flex items-center justify-between gap-2 mt-3 text-xs ${
                  isCinemaTimeline ? 'border-slate-800/80' : 'border-slate-200/80'
                }`}
              >
                <button
                  type="button"
                  disabled={prevKeyYear === null}
                  onClick={() => prevKeyYear !== null && setActiveYear(prevKeyYear)}
                  className={`flex-1 py-1.5 px-2 rounded-xl font-bold disabled:opacity-35 cursor-pointer text-center transition-colors ${
                    isCinemaTimeline
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                      : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  ← 上一节点 {prevKeyYear ? `(${prevKeyYear})` : ''}
                </button>
                <button
                  type="button"
                  disabled={nextKeyYear === null}
                  onClick={() => nextKeyYear !== null && setActiveYear(nextKeyYear)}
                  className={`flex-1 py-1.5 px-2 rounded-xl font-bold disabled:opacity-35 cursor-pointer text-center transition-colors ${
                    isCinemaTimeline
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-2xs'
                  }`}
                >
                  下一节点 {nextKeyYear ? `(${nextKeyYear})` : ''} →
                </button>
              </div>
            </div>

            {/* 中间（移动端置顶排第1）：中国历史地理矢量舆图 + 手机端右侧紧邻竖向编年轴 (5列) */}
            <div
              className={`order-1 lg:order-2 lg:col-span-5 flex flex-col justify-between p-2.5 sm:p-4 rounded-2xl border relative overflow-hidden lg:min-h-[410px] transition-colors ${
                isCinemaTimeline
                  ? 'bg-[#090e1a] border-amber-500/30 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] text-slate-100'
                  : isEyecareTheme
                  ? 'bg-[#e8f0e4] border-[#c7dbc0] shadow-inner text-[#243329]'
                  : 'bg-slate-100/85 border-slate-200/90 shadow-inner text-slate-800'
              }`}
            >
              {/* 地图顶部状态栏 */}
              <div className="flex items-center justify-between gap-2 z-10 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-2.5 w-2.5 relative shrink-0">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isCinemaTimeline ? 'bg-amber-400' : isEyecareTheme ? 'bg-[#52b788]' : 'bg-rose-500'
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isCinemaTimeline ? 'bg-amber-500' : isEyecareTheme ? 'bg-[#2d6a4f]' : 'bg-rose-600'
                      }`}
                    />
                  </span>
                  <span
                    className={`font-extrabold truncate ${
                      isCinemaTimeline ? 'text-amber-300' : isEyecareTheme ? 'text-[#1b4332]' : 'text-slate-800'
                    }`}
                  >
                    时空地理标绘：{activeItem?.cityName || '中国全域'} · {activeYear}年
                  </span>
                </div>

                {/* 桌面端提示徽章 */}
                <span
                  className={`hidden lg:inline-flex text-2xs font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                    isCinemaTimeline
                      ? 'bg-slate-800/90 text-amber-200/90 border-slate-700'
                      : isEyecareTheme
                      ? 'bg-[#f6faf4] text-[#2d6a4f] border-[#c8dcc2]'
                      : 'bg-white/90 text-slate-600 border-slate-200'
                  }`}
                >
                  点击名城瞬时联动
                </span>

                {/* 移动端精巧展开/收起舆图切换按钮 */}
                <button
                  type="button"
                  aria-expanded={showMobileMap}
                  onClick={() => setShowMobileMap((prev) => !prev)}
                  className={`lg:hidden inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-2xs font-bold shrink-0 cursor-pointer transition-colors ${
                    isCinemaTimeline
                      ? 'bg-slate-900/90 border-amber-500/35 text-amber-300'
                      : isEyecareTheme
                      ? 'bg-[#f6faf4] border-[#c7dbc0] text-[#1b4332]'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <MapPin
                    className={`w-3 h-3 ${
                      isCinemaTimeline ? 'text-amber-400' : isEyecareTheme ? 'text-[#2d6a4f]' : 'text-rose-600'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{showMobileMap ? '收起舆图' : '展开舆图'}</span>
                </button>
              </div>

              {/* 核心视区：左侧高精矢量中国历史地图 + 右侧紧邻可拖动竖向编年轴（移动端并排同框） */}
              <div
                className={`${
                  showMobileMap ? 'flex' : 'hidden lg:flex'
                } items-stretch gap-1.5 sm:gap-2.5 my-1.5 flex-1 min-w-0`}
              >
                {/* 左：中国历史地图画布 */}
                <div className="relative flex-1 min-w-0 flex items-center justify-center min-h-[240px] sm:min-h-[300px] lg:min-h-[320px]">
                  <ChunkErrorBoundary title="历史地图加载失败" className="h-56 sm:h-64 w-full">
                    <Suspense
                      fallback={
                        <SuspenseTimeoutFallback
                          label="正在渲染高精矢量历史舆图..."
                          className={`h-56 sm:h-64 ${isCinemaTimeline ? 'text-amber-400' : 'text-slate-600'}`}
                        />
                      }
                    >
                      <ChinaHistoricalMap
                        activeCoordinates={activeItem?.coordinates}
                        activeCityName={activeItem?.cityName}
                        activeDate={activeItem?.date}
                        activeBadgeTag={
                          activeItem?.isHistoricalFirst
                            ? '🥇 史上第一必考锚点'
                            : activeItem?.isRecentCivicCurrent
                            ? '🌟 近两年思政与时政'
                            : undefined
                        }
                        onCityClick={handleMapCityClick}
                        mapTone={isCinemaTimeline ? 'cinema' : isEyecareTheme ? 'eyecare' : 'paper'}
                      />
                    </Suspense>
                  </ChunkErrorBoundary>
                </div>

                {/* 右（仅手机/平板单列视口 < lg 呈现）：紧挨在地图旁边的竖向可拖动编年轴 */}
                <aside
                  aria-label="史纲编年时间轴侧栏（上下拖动切换年份）"
                  className={`lg:hidden w-[74px] sm:w-[84px] shrink-0 rounded-xl border px-1 py-1.5 flex flex-col items-center justify-between select-none relative z-20 ${
                    isCinemaTimeline
                      ? 'bg-[#060a14]/95 border-amber-500/35 shadow-md'
                      : isEyecareTheme
                      ? 'bg-[#f4f9f1]/95 border-[#bdd6b4] shadow-2xs'
                      : 'bg-white/95 border-slate-200/95 shadow-2xs'
                  }`}
                >
                  {/* 顶部：上一节点微调按钮 + 当前年份数字铭牌 */}
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      disabled={prevKeyYear === null}
                      aria-label={prevKeyYear !== null ? `切换至上一年份 ${prevKeyYear} 年` : '已是首个年份节点'}
                      onClick={() => prevKeyYear !== null && setActiveYear(prevKeyYear)}
                      className={`w-full min-h-[28px] rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer ${
                        isCinemaTimeline
                          ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300'
                          : isEyecareTheme
                          ? 'bg-[#e3eee0] hover:bg-[#d3e4ce] text-[#1b4332]'
                          : 'bg-slate-100 hover:bg-rose-50 text-rose-700'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <span
                      className={`font-mono text-[11px] font-black leading-tight px-1.5 py-0.5 rounded-md ${
                        isCinemaTimeline
                          ? 'bg-amber-500/20 text-amber-300'
                          : isEyecareTheme
                          ? 'bg-[#2d6a4f] text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {activeYear}
                    </span>
                  </div>

                  {/* 中部：左侧等比例里程碑刻度 + 右侧 44px 原生竖向无冲突滑轨 + 拖动跟手左向气泡 */}
                  <div className="relative w-full flex items-stretch justify-between my-1">
                    {isScrubbingMobileRail && (
                      <div
                        className="absolute right-[calc(100%+8px)] pointer-events-none z-30 -translate-y-1/2 transition-[top] duration-75"
                        style={{
                          top: `calc(11px + (100% - 22px) * ${sliderPercent / 100})`,
                        }}
                      >
                        <div
                          className={`px-2.5 py-1 rounded-xl border text-2xs font-black whitespace-nowrap flex items-center gap-1.5 shadow-lg max-w-[185px] sm:max-w-[240px] ${
                            isCinemaTimeline
                              ? 'bg-[#080d1a]/95 border-amber-400 text-amber-300'
                              : isEyecareTheme
                              ? 'bg-[#1b4332] border-[#52b788] text-white'
                              : 'bg-rose-600 border-rose-400 text-white'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse shrink-0" />
                          <span className="truncate">
                            {activeYear} · {activeItem?.title || '历史节点'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 左半列：等比例里程碑年份刻度（点击可直接跳转） */}
                    <div className="relative flex-1 min-w-[26px]">
                      {mobileRailTicks.map((tick) => {
                        const isNear = Math.abs(tick.year - activeYear) <= 2
                        return (
                          <button
                            key={tick.year}
                            type="button"
                            onClick={() => setActiveYear(tick.year)}
                            style={{
                              top: `calc(11px + (100% - 22px) * ${tick.percent / 100})`,
                            }}
                            className={`absolute right-0 -translate-y-1/2 font-mono text-[9.5px] leading-none px-0.5 py-0.5 rounded cursor-pointer transition-colors ${
                              tick.year === activeYear
                                ? isCinemaTimeline
                                  ? 'text-amber-300 font-black'
                                  : isEyecareTheme
                                  ? 'text-[#1b4332] font-black'
                                  : 'text-rose-600 font-black'
                                : isNear
                                ? isCinemaTimeline
                                  ? 'text-slate-200 font-bold'
                                  : 'text-slate-700 font-bold'
                                : isCinemaTimeline
                                ? 'text-slate-400 hover:text-amber-300'
                                : 'text-slate-500 hover:text-rose-600'
                            }`}
                          >
                            {tick.year}
                          </button>
                        )
                      })}
                    </div>

                    {/* 右半列：44px 宽原生竖向滑轨槽（touch-action: none 避免网页伴随上下滑动） */}
                    <div className="politics-vertical-rail-slot -mr-1">
                      <input
                        type="range"
                        aria-label="移动端地图旁侧史纲编年时间轴滑块"
                        aria-valuetext={`${activeYear}年：${activeItem?.title || '历史节点'}`}
                        min={0}
                        max={sliderMaxIdx}
                        step={1}
                        value={sliderIndex}
                        style={sliderCustomStyle}
                        onPointerDown={() => setIsScrubbingMobileRail(true)}
                        onPointerUp={() => setIsScrubbingMobileRail(false)}
                        onPointerCancel={() => setIsScrubbingMobileRail(false)}
                        onBlur={() => setIsScrubbingMobileRail(false)}
                        onChange={(e) => {
                          const target = availableYears[Number(e.target.value)]
                          if (target !== undefined) setActiveYear(target)
                        }}
                        className={`politics-timeline-slider politics-timeline-slider-vertical ${sliderThemeClass}`}
                      />
                    </div>
                  </div>

                  {/* 底部：下一节点微调按钮 + 拖动提示 */}
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <button
                      type="button"
                      disabled={nextKeyYear === null}
                      aria-label={nextKeyYear !== null ? `切换至下一年份 ${nextKeyYear} 年` : '已是末个年份节点'}
                      onClick={() => nextKeyYear !== null && setActiveYear(nextKeyYear)}
                      className={`w-full min-h-[28px] rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer ${
                        isCinemaTimeline
                          ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300'
                          : isEyecareTheme
                          ? 'bg-[#e3eee0] hover:bg-[#d3e4ce] text-[#1b4332]'
                          : 'bg-slate-100 hover:bg-rose-50 text-rose-700'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <span
                      className={`text-[9px] font-bold tracking-tight ${
                        isCinemaTimeline ? 'text-amber-400/80' : 'text-slate-500'
                      }`}
                    >
                      上下拖轴
                    </span>
                  </div>
                </aside>
              </div>

              {/* 移动端当用户主动收起地图时，提供紧凑兜底编年滑轨 */}
              {!showMobileMap && (
                <div className="lg:hidden my-2 px-1">
                  <input
                    type="range"
                    aria-label="史纲编年时间轴紧凑滑块"
                    aria-valuetext={`${activeYear}年：${activeItem?.title || '历史节点'}`}
                    min={0}
                    max={sliderMaxIdx}
                    step={1}
                    value={sliderIndex}
                    style={sliderCustomStyle}
                    onChange={(e) => {
                      const target = availableYears[Number(e.target.value)]
                      if (target !== undefined) setActiveYear(target)
                    }}
                    className={`politics-timeline-slider ${sliderThemeClass}`}
                  />
                </div>
              )}

              {/* 移动端专属：紧贴地图与编年轴下方的当前焦点史实即时联动条 */}
              <div
                className={`lg:hidden z-10 mb-1.5 px-2.5 py-1.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                  isCinemaTimeline
                    ? 'bg-[#0c1424]/95 border-amber-500/25 text-slate-100'
                    : isEyecareTheme
                    ? 'bg-[#f6faf4]/95 border-[#c8dcc2] text-[#1b4332]'
                    : 'bg-white/95 border-rose-200/80 text-slate-800'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold truncate">
                    {activeYear} · {activeItem?.title || '历史节点'}
                  </div>
                  <div
                    className={`text-2xs truncate mt-0.5 ${
                      isCinemaTimeline ? 'text-amber-300/90' : isEyecareTheme ? 'text-[#2d6a4f]' : 'text-rose-700'
                    }`}
                  >
                    🔑 {activeItem?.keyTag || '历史转折与战略新开端'}
                  </div>
                </div>
                <span
                  className={`text-2xs font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                    isCinemaTimeline
                      ? 'bg-slate-800 text-amber-200 border-slate-700'
                      : isEyecareTheme
                      ? 'bg-[#e6efe2] text-[#244333] border-[#c8dcc2]'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  📍 {activeItem?.cityName || '中国'}
                </span>
              </div>

              {/* 地图底栏：简洁坐标定位与热点名城快跳（支持多次点击循环浏览同城史实） */}
              <div
                className={`z-10 pt-2 px-2.5 pb-1.5 border rounded-xl flex flex-wrap items-center justify-between gap-2 text-2xs ${
                  isCinemaTimeline
                    ? 'border-slate-800/90 bg-[#070b14]/80'
                    : isEyecareTheme
                    ? 'border-[#cbdec4] bg-[#f6faf4]/90'
                    : 'border-slate-200/90 bg-white/90'
                }`}
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={isCinemaTimeline ? 'text-slate-400' : 'text-slate-500'}>坐标快跳：</span>
                  {['三元里', '上海', '井冈山', '遵义', '延安', '会宁', '西柏坡', '深圳', '北京'].map((city) => {
                    const isCityActive =
                      activeItem?.cityName?.includes(city) || activeItem?.location?.includes(city)
                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleMapCityClick(city)}
                        title={`点击定位「${city}」历史事件（同城多事件支持连续点击切换）`}
                        className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          isCityActive
                            ? isCinemaTimeline
                              ? 'bg-amber-500 text-slate-950'
                              : isEyecareTheme
                              ? 'bg-[#2d6a4f] text-white'
                              : 'bg-rose-600 text-white'
                            : isCinemaTimeline
                            ? 'bg-slate-800/90 text-amber-300/90 hover:bg-slate-700'
                            : isEyecareTheme
                            ? 'bg-[#e6efe2] text-[#244333] hover:bg-[#d5e5ce]'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {city}
                      </button>
                    )
                  })}
                </div>
                <span className={`hidden sm:inline font-mono ${isCinemaTimeline ? 'text-slate-400' : 'text-slate-500'}`}>
                  当前：
                  <strong
                    className={
                      isCinemaTimeline ? 'text-amber-300' : isEyecareTheme ? 'text-[#1b4332]' : 'text-slate-800'
                    }
                  >
                    {activeItem?.location || activeItem?.cityName || '中国'}
                  </strong>
                </span>
              </div>

              {/* 移动端专属：紧随地图卡片底部的紧凑年份热力胶囊微调尺 */}
              <div
                ref={mobileYearRailRef}
                className={`lg:hidden flex items-end gap-1 overflow-x-auto no-scrollbar pt-2 mt-1.5 border-t ${
                  isCinemaTimeline ? 'border-slate-800/80' : 'border-slate-200/80'
                }`}
              >
                {availableYears.map((yr) => {
                  const isCurr = yr === activeYear
                  const yrItems = filteredItems.filter((i) => i.year === yr)
                  const yrCount = yrItems.length
                  const hasFirst = yrItems.some((i) => i.isHistoricalFirst)
                  const hasRecent = yrItems.some((i) => i.isRecentCivicCurrent)
                  const anniv = getAnniversaryInfo(yr, anniversaryMode)
                  const barHeight = Math.min(18, 5 + yrCount * 5)

                  return (
                    <button
                      key={yr}
                      type="button"
                      data-year-pill={yr}
                      aria-pressed={isCurr}
                      onClick={() => setActiveYear(yr)}
                      className={`flex flex-col items-center px-1.5 py-0.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                        isCurr
                          ? isCinemaTimeline
                            ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                            : isEyecareTheme
                            ? 'bg-[#2d6a4f] text-white font-black border-[#2d6a4f]'
                            : 'bg-rose-600 text-white font-black border-rose-600'
                          : isCinemaTimeline
                          ? 'bg-[#0c1220] text-slate-400 border-slate-800'
                          : 'bg-white/90 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 rounded-full mb-0.5 transition-all ${
                          isCurr
                            ? isCinemaTimeline
                              ? 'bg-slate-950'
                              : 'bg-white'
                            : hasRecent
                            ? 'bg-sky-500'
                            : hasFirst || anniv.matched
                            ? 'bg-amber-500'
                            : isCinemaTimeline
                            ? 'bg-slate-600'
                            : 'bg-slate-300'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="font-mono text-[10px] font-bold">{yr}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 右侧（移动端排第3）：考点速览与命题陷阱排雷 (3列) */}
            <div
              className={`order-3 lg:order-3 lg:col-span-3 flex flex-col justify-between p-4 sm:p-5 rounded-2xl border relative overflow-hidden ${
                isCinemaTimeline
                  ? 'bg-[#0c1220]/95 border-amber-500/20 shadow-xl'
                  : 'bg-slate-50/70 border-slate-200/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                      isCinemaTimeline ? 'text-amber-400' : 'text-rose-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>考点定性与排雷</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFavItem(activeItem?.id || '')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      favItemIds[activeItem?.id || '']
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : isCinemaTimeline
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    {favItemIds[activeItem?.id || ''] ? (
                      <BookmarkCheck className="w-3.5 h-3.5" />
                    ) : (
                      <Bookmark className="w-3.5 h-3.5" />
                    )}
                    <span>{favItemIds[activeItem?.id || ''] ? '已收藏' : '收藏'}</span>
                  </button>
                </div>

                {/* 一字千金核心定性 */}
                <div
                  className={`p-3 rounded-xl border ${
                    isCinemaTimeline
                      ? 'bg-[#090e1a] border-amber-500/30'
                      : 'bg-amber-50/90 border-amber-200'
                  }`}
                >
                  <div
                    className={`text-2xs font-bold uppercase tracking-wider mb-1 ${
                      isCinemaTimeline ? 'text-amber-400/80' : 'text-amber-800'
                    }`}
                  >
                    {activeYear} 考研一字千金定性
                  </div>
                  <div
                    className={`text-xs sm:text-sm font-black leading-snug ${
                      isCinemaTimeline ? 'text-amber-300' : 'text-amber-950'
                    }`}
                  >
                    {activeItem?.keyTag || '历史转折与战略新开端'}
                  </div>
                </div>

                {/* 考研标准历史意义 */}
                <div
                  className={`p-3 rounded-xl border ${
                    isCinemaTimeline
                      ? 'bg-[#0a0f1d] border-slate-800 text-slate-200'
                      : 'bg-white border-slate-200/90 text-slate-700'
                  }`}
                >
                  <div
                    className={`text-2xs font-bold uppercase tracking-wider mb-1 ${
                      isCinemaTimeline ? 'text-sky-400' : 'text-indigo-700'
                    }`}
                  >
                    🏛️ 考研标准历史意义
                  </div>
                  {maskMode && !revealedIds[activeItem?.id || ''] ? (
                    <button
                      type="button"
                      onClick={() => setRevealedIds((prev) => ({ ...prev, [activeItem?.id || '']: true }))}
                      className={`text-xs font-bold py-1 cursor-pointer underline ${
                        isCinemaTimeline ? 'text-indigo-400' : 'text-indigo-600'
                      }`}
                    >
                      （已遮罩默背中，点击显影）
                    </button>
                  ) : (
                    <p
                      className={`text-xs leading-relaxed ${
                        isCinemaTimeline ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {activeItem?.significance}
                    </p>
                  )}
                </div>

                {/* 命题陷阱排雷 */}
                {activeItem?.pitfall && (
                  <div
                    className={`p-3 rounded-xl border ${
                      isCinemaTimeline
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1 text-2xs font-black mb-1 ${
                        isCinemaTimeline ? 'text-rose-400' : 'text-rose-700'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>命题陷阱排雷</span>
                    </div>
                    <p className="text-xs leading-relaxed font-medium">{activeItem.pitfall}</p>
                  </div>
                )}
              </div>

              {/* 关联真题直通按钮 */}
              <div
                className={`pt-3 border-t mt-3 ${
                  isCinemaTimeline ? 'border-slate-800/80' : 'border-slate-200/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => jumpToXiaoByHistory(activeYear)}
                  className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 ${
                    isCinemaTimeline
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-sm'
                      : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-xs'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>刷 {activeYear} 关联政治真题</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── 桌面端唯一高响应度编年时间轴底座（1839–2026 合并单轨 + 悬浮气泡 + 热力胶囊尺，移动端已移至地图右侧） ── */}
          <div
            className={`hidden lg:block p-3.5 sm:p-4 rounded-2xl border relative ${
              isCinemaTimeline
                ? 'bg-[#090e1a] border-amber-500/20 shadow-xl'
                : 'bg-slate-50/90 border-slate-200/80'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-extrabold ${
                    isCinemaTimeline ? 'text-amber-400' : 'text-rose-700'
                  }`}
                >
                  📅 考研史纲唯一主编年轴 (1839–2026)
                </span>
                <span className={isCinemaTimeline ? 'text-slate-400' : 'text-slate-500'}>
                  | 涵盖近代反侵略首创至“十五五”开局思政时政
                </span>
              </div>
              <div className={`font-mono ${isCinemaTimeline ? 'text-slate-300' : 'text-slate-700'}`}>
                当前焦点：
                <strong
                  className={`text-sm font-black mx-1 ${
                    isCinemaTimeline ? 'text-amber-400' : 'text-rose-600'
                  }`}
                >
                  {activeYear}
                </strong>
                年（收录 {currentYearItems.length} 项史实）
              </div>
            </div>

            {/* 唯一编年滑轨容器 */}
            <div className="relative pt-7 pb-1 px-1">
              <div
                className="absolute top-0 transition-all duration-100 pointer-events-none transform -translate-x-1/2 flex flex-col items-center z-20"
                style={{ left: `clamp(72px, ${sliderPercent}%, calc(100% - 72px))` }}
              >
                <div
                  className={`px-2.5 py-0.5 rounded-lg border text-2xs font-black whitespace-nowrap flex items-center gap-1.5 shadow-xs max-w-[260px] sm:max-w-[360px] truncate ${
                    isCinemaTimeline
                      ? 'bg-[#080d1a] border-amber-400/90 text-amber-300'
                      : 'bg-rose-600 border-rose-500 text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse shrink-0" />
                  <span className="truncate">
                    {activeYear} {activeItem?.title || '历史节点'}
                  </span>
                </div>
              </div>

              <input
                type="range"
                aria-label="史纲编年时间轴滑块"
                aria-valuetext={`${activeYear}年：${activeItem?.title || '历史节点'}`}
                min={0}
                max={sliderMaxIdx}
                step={1}
                value={sliderIndex}
                style={sliderCustomStyle}
                onChange={(e) => {
                  const target = availableYears[Number(e.target.value)]
                  if (target !== undefined) setActiveYear(target)
                }}
                className={`politics-timeline-slider ${sliderThemeClass}`}
              />
            </div>

            {/* 关键里程碑年份刻度 */}
            <div
              className={`flex justify-between text-2xs font-mono mt-0.5 select-none ${
                isCinemaTimeline ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {[
                { y: 1841, label: '1841 三元里抗英', always: true },
                { y: 1895, label: '1895 甲午觉醒', always: false },
                { y: 1921, label: '1921 中共建党', always: true },
                { y: 1935, label: '1935 遵义会议', always: false },
                { y: 1937, label: '1937 平型关首捷', always: false },
                { y: 1949, label: '1949 新中国成立', always: true },
                { y: 1978, label: '1978 改革开放', always: false },
                { y: 2025, label: '2025 二十届四中', always: false },
                { y: 2026, label: '2026 十五五开局', always: true },
              ].map((m) => (
                <button
                  key={m.y}
                  type="button"
                  onClick={() => {
                    if (!availableYears.includes(m.y)) {
                      setSelectedCategory('all')
                      setOnlyAnniversary(false)
                      setOnlyPitfall(false)
                      setOnlyHistoricalFirst(false)
                      setOnlyRecentCurrent(false)
                    }
                    setActiveYear(m.y)
                  }}
                  className={`${
                    m.always ? 'inline' : 'hidden md:inline'
                  } cursor-pointer font-semibold transition-colors ${
                    isCinemaTimeline ? 'hover:text-amber-400' : 'hover:text-rose-600'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* 年份胶囊高频直达尺（多事件年份柱高醒目提示） */}
            <div
              ref={yearRailRef}
              className={`flex items-end gap-1.5 overflow-x-auto no-scrollbar pt-2.5 mt-2 border-t ${
                isCinemaTimeline ? 'border-slate-800/80' : 'border-slate-200/80'
              }`}
            >
              {availableYears.map((yr) => {
                const isCurr = yr === activeYear
                const yrItems = filteredItems.filter((i) => i.year === yr)
                const yrCount = yrItems.length
                const hasFirst = yrItems.some((i) => i.isHistoricalFirst)
                const hasRecent = yrItems.some((i) => i.isRecentCivicCurrent)
                const anniv = getAnniversaryInfo(yr, anniversaryMode)
                const barHeight = Math.min(22, 6 + yrCount * 6)

                return (
                  <button
                    key={yr}
                    type="button"
                    data-year-pill={yr}
                    aria-pressed={isCurr}
                    onClick={() => setActiveYear(yr)}
                    title={`${yr}年（收录 ${yrCount} 项史实${hasFirst ? ' · 含史上第一考点' : ''}${
                      hasRecent ? ' · 近两年思政时政' : ''
                    }）`}
                    className={`group flex flex-col items-center px-2 py-1 rounded-lg border transition-all shrink-0 cursor-pointer ${
                      isCurr
                        ? isCinemaTimeline
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400 scale-105'
                          : 'bg-rose-600 text-white font-black border-rose-600 scale-105'
                        : isCinemaTimeline
                        ? 'bg-[#0c1220] text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 rounded-full mb-1 transition-all ${
                        isCurr
                          ? isCinemaTimeline
                            ? 'bg-slate-950'
                            : 'bg-white'
                          : hasRecent
                          ? 'bg-sky-500'
                          : hasFirst || anniv.matched
                          ? 'bg-amber-500'
                          : isCinemaTimeline
                          ? 'bg-slate-600'
                          : 'bg-slate-300'
                      }`}
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="font-mono text-2xs font-bold">{yr}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 📚 讲义与资料库（个人/共享政治书架 + 五大学科名师精讲讲义 + 动态交互实验室）
         ========================================================================= */}
      {activeTab === 'library' && (
        <div className="space-y-5">
          {/* 1) 个人与共享政治资料书架 */}
          <section className="bento-card rounded-3xl p-4 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30 text-2xs font-extrabold text-rose-700 dark:text-rose-300">
                    个人 & 共享书架
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    📂 我的考研政治资料库 ({politicsBooks.length})
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  支持上传肖秀荣背诵手册、腿姐冲刺讲义、肖1000/肖八肖四 PDF 或 Word/Markdown 笔记；点击 PDF 高清原位阅读，点击文档无乱码精读
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                  {(
                    [
                      { k: 'all', label: '全部' },
                      { k: 'pdf', label: 'PDF专著' },
                      { k: 'doc', label: '文档讲义' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.k}
                      type="button"
                      onClick={() => setBookFormatFilter(f.k)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        bookFormatFilter === f.k
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={bookSearchQuery}
                    onChange={(e) => setBookSearchQuery(e.target.value)}
                    placeholder="搜索政治书架..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 w-40 sm:w-48"
                  />
                </div>

                <button
                  type="button"
                  onClick={loadPoliticsBooks}
                  disabled={loadingBooks}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="刷新政治书架"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingBooks ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => openImportModal('books')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>上传政治资料</span>
                </button>
              </div>
            </div>

            {loadingBooks && politicsBooks.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                <span>正在同步个人与共享政治资料书架...</span>
              </div>
            ) : filteredPoliticsBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredPoliticsBooks.map((book) => {
                  const extLower = (book.ext || '').toLowerCase()
                  const isPdfFile = Boolean(book.isPdf || extLower === '.pdf' || book.fileType === 'pdf')
                  const sizeMb = Math.max(0.01, book.size / (1024 * 1024)).toFixed(2)
                  const isReadingThis = readingBookId === book.id

                  return (
                    <div
                      key={book.id}
                      onClick={() => handleOpenBookItem(book)}
                      className="group rounded-2xl p-4 border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-rose-300 dark:hover:border-rose-500/50 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-2xs font-bold border ${
                                isPdfFile
                                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
                              }`}
                            >
                              {isPdfFile ? '📕 PDF 高清预览' : `📄 ${extLower.replace('.', '').toUpperCase() || '讲义'} 精读`}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-2xs font-semibold border ${
                                book.scope === 'personal'
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                              }`}
                            >
                              {book.scope === 'personal' ? '🔒 个人独享' : '🌐 全员共享'}
                            </span>
                          </div>
                          <span className="text-2xs font-mono text-slate-400 shrink-0">{sizeMb} MB</span>
                        </div>

                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2">
                          {book.name}
                        </h3>

                        <div className="flex items-center gap-2 text-2xs text-slate-500 dark:text-slate-400">
                          <span>分类：{book.category || '考研政治'}</span>
                          {book.extractedInfo?.questionCount ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              · 已入库 {book.extractedInfo.questionCount} 题
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                          {isReadingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>正在打开...</span>
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{isPdfFile ? '原位阅读 PDF' : '打开无乱码精读'}</span>
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openImportModal('books')
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30 text-2xs font-bold cursor-pointer"
                        >
                          ⚡ 扫描提取题库
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-7 text-center space-y-2.5">
                <FileText className="w-8 h-8 mx-auto text-slate-400" />
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {politicsBooks.length === 0
                    ? '你的政治专属书架暂未上传资料'
                    : '没有匹配当前筛选条件的政治资料'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                  支持上传 PDF 电子书、Word (.docx) 背诵讲义、Markdown 或 TXT 题库，系统可自动提取政治单选与多选题汇入核心刷题舱！
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => openImportModal('books')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>立即上传第一份政治讲义 / 题库 PDF</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 2) 内置名师核心精讲讲义（五大学科 + 时政全覆盖） */}
          <section className="bento-card rounded-3xl p-4 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-2xs font-extrabold text-indigo-700 dark:text-indigo-300">
                    开箱即读 · 大纲精粹
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    📖 内置五大学科核心精讲讲义 ({POLITICS_HANDOUTS.length} 篇)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  覆盖马原（哲学/政经/科社/经典著作）、毛中特、习思想、史纲、思修法治与时政框架，点击即享大纲目录导航与随堂联动自测
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['all', '马原', '毛中特', '习思想', '史纲', '思修法治', '时政'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setHandoutTagFilter(tag)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      handoutTagFilter === tag
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tag === 'all' ? '全部学科' : tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredBuiltInHandouts.map((h) => (
                <div
                  key={h.id}
                  onClick={() => setActiveHandout(h)}
                  className="group rounded-2xl p-4 border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-500/30">
                        {h.difficulty}
                      </span>
                      <span className="text-2xs font-mono text-slate-400">⏱ {h.readTime}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {h.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {h.summary}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 overflow-hidden">
                      {h.tags.slice(1, 4).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 text-2xs whitespace-nowrap"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-0.5 shrink-0">
                      <span>阅读讲义</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3) 政治动态交互实验室入口 */}
          <section className="bento-card rounded-3xl p-4 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  🧪 政治动态交互仿真实验室
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  把抽象政治经济学公式、唯物辩证法与马恩文献变成可拖拽、可闯关的交互微件
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/study?tab=coursewares')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer self-start sm:self-auto"
              >
                <span>全部交互仿真课件</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {POLITICS_INTERACTIVE_LABS.map((lab) => (
                <div
                  key={lab.id}
                  onClick={() => navigate(`/study?tab=coursewares&cw=${lab.id}`)}
                  className={`rounded-2xl p-4 border bg-gradient-to-br ${lab.accent} hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between gap-3`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{lab.emoji}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-2xs font-extrabold text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700">
                        {lab.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{lab.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{lab.desc}</p>
                  </div>
                  <div className="text-xs font-extrabold text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
                    <span>启动仿真实验</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 核心刷题舱（六大模块全覆盖 + 实时接入上传提取的自定义政治单选/多选题库）
         ========================================================================= */}
      {activeTab === 'xiao1000' && (
        <div className="space-y-4">
          {/* 顶部题库来源胶囊 + 六大学科 + 题型筛选器 */}
          <div className="bento-card rounded-3xl p-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-3">
            {/* 第一排：题库来源筛选 + 上传导入快捷按钮 */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">题库来源：</span>
                {(
                  [
                    { k: 'all', label: `全部题库 (${allPoliticsQuestions.length})` },
                    { k: 'builtin', label: `内置母题精选 (${XIAO_1000_POLITICS_QUESTIONS.length})` },
                    { k: 'custom', label: `📥 我的导入题库 (${customPoliticsQuestions.length})` },
                  ] as const
                ).map((src) => (
                  <button
                    key={src.k}
                    type="button"
                    onClick={() => {
                      setQuizSourceFilter(src.k)
                      setActiveQuestionIdx(0)
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      quizSourceFilter === src.k
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                  累计答对 <strong className="text-emerald-600 dark:text-emerald-400">{answeredStats.correct}</strong> / {answeredStats.answered} 题
                </span>
                <button
                  type="button"
                  onClick={() => openImportModal('import_quiz')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 text-xs font-bold cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>导入政治 PDF / 文本题库</span>
                </button>
              </div>
            </div>

            {/* 第二排：六大学科筛选 + 单多选 + 搜索 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">学科模块：</span>
                <button
                  type="button"
                  onClick={() => {
                    setXiaoSubjectFilter('all')
                    setActiveQuestionIdx(0)
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    xiaoSubjectFilter === 'all'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  全部
                </button>
                {POLITICS_SUBJECT_META.map((meta) => (
                  <button
                    key={meta.value}
                    type="button"
                    onClick={() => {
                      setXiaoSubjectFilter(meta.value)
                      setActiveQuestionIdx(0)
                    }}
                    className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      xiaoSubjectFilter === meta.value
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title={meta.fullLabel}
                  >
                    <span className="sm:hidden">{meta.shortLabel}</span>
                    <span className="hidden sm:inline">{meta.fullLabel}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
                  {(['all', 'single', 'multiple'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setXiaoTypeFilter(t)
                        setActiveQuestionIdx(0)
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        xiaoTypeFilter === t
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t === 'all' ? '全部题型' : t === 'single' ? '单选题' : '多选题'}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={xiaoSearchQuery}
                    onChange={(e) => setXiaoSearchQuery(e.target.value)}
                    placeholder="搜索题干、章节、考点..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 w-44 sm:w-56"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 做题主工作台 */}
          {filteredXiaoQuestions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* 左侧：题号矩阵导航 */}
              <div className="lg:col-span-3 bento-card rounded-3xl p-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-3 self-start">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>题号导航 ({filteredXiaoQuestions.length} 题)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      已做 {answeredStats.answered}
                    </span>
                    {answeredStats.answered > 0 && (
                      <button
                        type="button"
                        onClick={handleResetQuizHistory}
                        className="text-2xs text-slate-400 hover:text-rose-600 font-normal underline cursor-pointer"
                      >
                        重置
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5 max-h-[460px] overflow-y-auto no-scrollbar pr-1">
                  {filteredXiaoQuestions.map((q, idx) => {
                    const ans = quizAnswers[q.id]
                    const isAnswered =
                      ans !== undefined && (!Array.isArray(ans) || ans.length > 0)
                    const isRight =
                      isAnswered &&
                      (q.type === 'single'
                        ? ans === q.answer
                        : Array.isArray(ans) &&
                          Array.isArray(q.answer) &&
                          ans.length === q.answer.length &&
                          ans.every((x, i) => x === (q.answer as string[])[i]))
                    const isActive = idx === activeQuestionIdx

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400/50'
                            : isAnswered
                            ? isRight
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title={`${idx + 1}. [${q.type === 'single' ? '单选' : '多选'}] ${q.subject}`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> 答对
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> 答错
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> 未做
                  </span>
                </div>
              </div>

              {/* 右侧：单题精练与精准判分解析 */}
              <div className="lg:col-span-9 space-y-4">
                {(() => {
                  const q = filteredXiaoQuestions[activeQuestionIdx] || filteredXiaoQuestions[0]
                  const userAnswer = quizAnswers[q.id]
                  const isSubmitted =
                    q.type === 'single'
                      ? typeof userAnswer === 'string' && userAnswer.trim().length > 0
                      : Array.isArray(userAnswer) && userAnswer.length > 0
                  const isFav = Boolean(favQuestionIds[q.id])
                  const currentMulti = multiSelectBuffer[q.id] || []

                  const isCorrect =
                    isSubmitted &&
                    (q.type === 'single'
                      ? userAnswer === q.answer
                      : Array.isArray(userAnswer) &&
                        Array.isArray(q.answer) &&
                        q.answer.length > 0 &&
                        userAnswer.length === q.answer.length &&
                        userAnswer.every((x, i) => x === (q.answer as string[])[i]))

                  // 多选题少选/错选细分诊断
                  const isPartialOnly =
                    isSubmitted &&
                    !isCorrect &&
                    q.type === 'multiple' &&
                    Array.isArray(userAnswer) &&
                    Array.isArray(q.answer) &&
                    userAnswer.every((x) => (q.answer as string[]).includes(x)) &&
                    userAnswer.length < q.answer.length

                  return (
                    <div className="bento-card bg-white dark:bg-slate-900/90 rounded-3xl p-5 sm:p-7 space-y-5 border border-slate-200/80 dark:border-slate-700/70 shadow-xs">
                      {/* 题目头部元信息 */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30 text-xs font-bold text-rose-700 dark:text-rose-300">
                            {q.subject}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                              q.type === 'multiple'
                                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {q.type === 'single' ? '单项选择题 (1分)' : '多项选择题 (2分 · 多选/少选均0分)'}
                          </span>
                          {q.isCustom && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-2xs font-bold text-amber-800 dark:text-amber-300">
                              📥 我的导入题库
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-medium">{q.chapter}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {q.relatedYear && (
                            <button
                              type="button"
                              onClick={() => jumpToTimelineByQuestion(q.relatedYear!)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 px-2.5 py-1 rounded-xl cursor-pointer"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>时空轴 {q.relatedYear} 年</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleFavQuestion(q.id)}
                            className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl border cursor-pointer transition-all ${
                              isFav
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            {isFav ? (
                              <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5" />
                            )}
                            <span>{isFav ? '已收藏' : '收藏此题'}</span>
                          </button>
                        </div>
                      </div>

                      {/* 题干 */}
                      <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-[1.75] tracking-tight">
                        <span className="text-rose-600 dark:text-rose-400 font-mono mr-2">
                          第 {activeQuestionIdx + 1} 题.
                        </span>
                        {q.question}
                      </div>

                      {/* 选项组（精准标红标绿 + 漏选提示） */}
                      <div className="space-y-2.5">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const optText = q.options[optKey]
                          const isUserPicked =
                            q.type === 'single'
                              ? userAnswer === optKey
                              : Array.isArray(userAnswer) && userAnswer.includes(optKey)
                          const isMultiChecked = q.type === 'multiple' && currentMulti.includes(optKey)
                          const isRightAnswer =
                            q.type === 'single'
                              ? q.answer === optKey
                              : Array.isArray(q.answer) && q.answer.includes(optKey)

                          let itemStyle =
                            'border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100'
                          let badgeStyle = 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          let statusTag: string | null = null

                          if (isSubmitted) {
                            if (isRightAnswer && isUserPicked) {
                              itemStyle =
                                'border-emerald-400 dark:border-emerald-500/60 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold'
                              badgeStyle = 'bg-emerald-600 text-white'
                              statusTag = '✓ 命中正确项'
                            } else if (isRightAnswer && !isUserPicked) {
                              itemStyle =
                                'border-dashed border-emerald-400 dark:border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-semibold'
                              badgeStyle = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400'
                              statusTag = q.type === 'multiple' ? '⚠️ 漏选正确项' : '✓ 正确答案'
                            } else if (!isRightAnswer && isUserPicked) {
                              itemStyle =
                                'border-rose-400 dark:border-rose-500/60 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100'
                              badgeStyle = 'bg-rose-600 text-white'
                              statusTag = '✕ 误选干扰项'
                            }
                          } else if (q.type === 'multiple' && isMultiChecked) {
                            itemStyle =
                              'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 font-semibold'
                            badgeStyle = 'bg-indigo-600 text-white'
                          }

                          return (
                            <div
                              key={optKey}
                              onClick={() => {
                                if (isSubmitted) return
                                if (q.type === 'single') {
                                  handleSingleSelect(q.id, optKey)
                                } else {
                                  handleMultiToggle(q.id, optKey)
                                }
                              }}
                              className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${itemStyle}`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${badgeStyle}`}
                                >
                                  {optKey}
                                </div>
                                <div className="text-xs sm:text-sm pt-0.5 leading-relaxed">{optText}</div>
                              </div>
                              {statusTag && (
                                <span
                                  className={`text-2xs font-extrabold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                                    isRightAnswer
                                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                                  }`}
                                >
                                  {statusTag}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* 多选题提交按钮 */}
                      {q.type === 'multiple' && !isSubmitted && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            disabled={currentMulti.length === 0}
                            onClick={() => handleMultiSubmit(q.id)}
                            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                          >
                            提交多项选择题（已选：{currentMulti.join('') || '未选'}）
                          </button>
                        </div>
                      )}

                      {/* 判分结果与名师深度解析 */}
                      {isSubmitted && (
                        <div className="rounded-2xl p-4 sm:p-5 bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3.5 animate-fade-in-up">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2.5">
                              {isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                                  <Check className="w-4 h-4" /> 回答正确！满分拿下
                                </span>
                              ) : isPartialOnly ? (
                                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-extrabold text-sm">
                                  <AlertTriangle className="w-4 h-4" /> 少选漏选（政治多选少选得 0 分）
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-extrabold text-sm">
                                  <X className="w-4 h-4" /> 回答错误
                                </span>
                              )}
                              <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                                你的作答：
                                <strong className="mx-1 font-bold">
                                  {Array.isArray(userAnswer) ? userAnswer.join('') : userAnswer}
                                </strong>
                                ｜ 标准答案：
                                <strong className="text-emerald-700 dark:text-emerald-400 text-sm ml-1 font-bold">
                                  {Array.isArray(q.answer) ? q.answer.join('') : q.answer}
                                </strong>
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setQuizAnswers((prev) => {
                                  const next = { ...prev }
                                  delete next[q.id]
                                  return next
                                })
                              }}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>重做此题</span>
                            </button>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>【核心考点精析】{q.keyKnowledgeCard.title}</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              {q.analysis.corePoint}
                            </p>
                            {q.keyKnowledgeCard.formula && (
                              <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 text-2xs font-mono font-bold">
                                💡 速记公式：{q.keyKnowledgeCard.formula}
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="font-bold text-slate-800 dark:text-slate-100 mb-1">【选项逐项剖析】</div>
                            {q.analysis.optionBreakdown}
                          </div>

                          {q.analysis.pitfallWarning && (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-900 dark:text-rose-200">
                              <strong className="text-rose-700 dark:text-rose-300">【命题陷阱排雷】</strong>
                              {q.analysis.pitfallWarning}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 题目底部翻页器 */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          disabled={activeQuestionIdx === 0}
                          onClick={() => setActiveQuestionIdx((i) => Math.max(0, i - 1))}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
                        >
                          ← 上一题
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                          {activeQuestionIdx + 1} / {filteredXiaoQuestions.length}
                        </span>
                        <button
                          type="button"
                          disabled={activeQuestionIdx === filteredXiaoQuestions.length - 1}
                          onClick={() =>
                            setActiveQuestionIdx((i) => Math.min(filteredXiaoQuestions.length - 1, i + 1))
                          }
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold disabled:opacity-40 cursor-pointer shadow-2xs"
                        >
                          下一题 →
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          ) : (
            <div className="bento-card rounded-3xl p-8 text-center bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-3">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {quizSourceFilter === 'custom' && customPoliticsQuestions.length === 0
                  ? '尚未导入自定义政治题目'
                  : '未找到符合当前筛选条件的题目'}
              </div>
              {quizSourceFilter === 'custom' && customPoliticsQuestions.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    点击右上角「上传政治讲义 / PDF题库」，导入你的肖1000、腿姐或模拟卷文本，即可在此开启单选与多选实战！
                  </p>
                  <button
                    type="button"
                    onClick={() => openImportModal('import_quiz')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>立即上传提取政治题库</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQuizSourceFilter('all')
                    setXiaoSubjectFilter('all')
                    setXiaoTypeFilter('all')
                    setXiaoSearchQuery('')
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                >
                  重置全部筛选条件
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: 🎯 帽子题速查挖空 + ✍️ 34–38 主观材料分析题踩点背诵与 AI 阅卷舱
         ========================================================================= */}
      {activeTab === 'booster' && (
        <div className="space-y-4">
          {/* 子模式双引擎切换顶栏 */}
          <div className="bento-card rounded-3xl p-3.5 sm:p-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 self-start">
              <button
                type="button"
                onClick={() => setBoosterSubTab('hats')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  boosterSubTab === 'hats'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>🎯 高频“帽子题”精准速查 ({POLITICS_HAT_ITEMS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setBoosterSubTab('subjective')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  boosterSubTab === 'subjective'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>✍️ 34–38 主观大题踩点默写 & AI 阅卷</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              {boosterSubTab === 'hats'
                ? '攻克单选/多选一字之差定性词：支持按 7 类帽子标签检索与行内点击挖空自测'
                : '肖四必背三色踩点拆解：本地即时计算采分词命中率 + 呼叫 AI 阅卷组长按 10 分制给分'}
            </div>
          </div>

          {/* ── 子舱 A：高频“帽子题”精准对比检索与行内挖空背诵 ── */}
          {boosterSubTab === 'hats' && (
            <div className="space-y-4">
              <div className="bento-card rounded-3xl p-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-3">
                {/* 学科筛选 + 搜索 + 一键全遮罩/全显影 */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">学科：</span>
                    <button
                      type="button"
                      onClick={() => setHatSubjectFilter('all')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                        hatSubjectFilter === 'all'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      全部五科
                    </button>
                    {HAT_SUBJECT_LIST.map((subj) => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setHatSubjectFilter(subj)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                          hatSubjectFilter === subj
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={hatSearchQuery}
                        onChange={(e) => setHatSearchQuery(e.target.value)}
                        placeholder="搜索如：唯一特性、枢纽、精髓..."
                        className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 w-52"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleAllHatsMask(!hatGlobalMask)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border cursor-pointer transition-all ${
                        hatGlobalMask
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {hatGlobalMask ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{hatGlobalMask ? '👁️ 一键全部显影' : '🙈 一键全遮罩自测'}</span>
                    </button>
                  </div>
                </div>

                {/* 7 大定性词帽子标签筛选 */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">定性标签：</span>
                  <button
                    type="button"
                    onClick={() => setHatTagFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-2xs font-bold cursor-pointer ${
                      hatTagFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-500/30'
                    }`}
                  >
                    全部标签 ({POLITICS_HAT_ITEMS.length})
                  </button>
                  {HAT_CATEGORY_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setHatTagFilter(tag)}
                      className={`px-2.5 py-1 rounded-lg text-2xs font-bold cursor-pointer transition-all ${
                        hatTagFilter === tag
                          ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 帽子题卡片网格（支持单条 Inline Cloze 点击显影/遮回） */}
              {filteredHatItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredHatItems.map((item) => {
                    const isVisible = hatGlobalMask
                      ? Boolean(hatRevealedMap[item.id])
                      : hatRevealedMap[item.id] !== false

                    return (
                      <div
                        key={item.id}
                        className="bento-card rounded-2xl p-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 flex flex-col justify-between gap-2.5"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-500/30 text-2xs font-extrabold">
                                {item.subject}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30 text-2xs font-bold">
                                {item.category}
                              </span>
                            </div>
                            <span className="text-2xs font-mono font-bold text-rose-600 dark:text-rose-400">
                              {item.frequency}
                            </span>
                          </div>

                          {/* 提问词 + 行内点击挖空遮罩 (Inline Cloze) */}
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed pt-0.5">
                            <span>{item.prompt}是：</span>
                            {isVisible ? (
                              <button
                                type="button"
                                onClick={() => toggleSingleHatCloze(item.id)}
                                title="点击重新遮罩复测"
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 mx-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-extrabold text-sm cursor-pointer hover:opacity-85 transition-all text-left"
                              >
                                <span>{item.answer}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleSingleHatCloze(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-0.5 mx-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-dashed border-indigo-400 dark:border-indigo-500/50 font-mono text-xs font-extrabold cursor-pointer transition-all"
                              >
                                <span>[ 点击显影 ]</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 易混对比排雷（当答案显影后展示完整排雷，防止遮罩自测时提前剧透） */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                          {isVisible ? (
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                              <strong className="text-amber-700 dark:text-amber-400">⚡ 易混对比：</strong>
                              {item.contrastTip}
                            </p>
                          ) : (
                            <p className="text-2xs text-slate-400 dark:text-slate-500 italic">
                              💡 先在脑海中默念定性词答案，点击上方「[ 点击显影 ]」同时揭晓易混干扰项排雷
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bento-card rounded-2xl p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  未检索到匹配的“帽子题”词条，请尝试更换筛选标签或搜索词。
                </div>
              )}
            </div>
          )}

          {/* ── 子舱 B：34–38 主观材料分析大题踩点背诵与 AI 阅卷舱 ── */}
          {boosterSubTab === 'subjective' && (
            <div className="space-y-4">
              {/* 顶部 34–38 题号导航卡片 */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {POLITICS_SUBJECTIVE_QUESTIONS.map((item) => {
                  const isSelected = item.id === activeSubjective.id
                  const hasDraft = Boolean((userEssayDrafts[item.id] || '').trim())
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSubjectiveId(item.id)
                        setAiGradingError(null)
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-700/70 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-black">{item.questionNo}</span>
                        {hasDraft && (
                          <span
                            className={`text-2xs px-1.5 py-0.2 rounded-full font-bold ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            已练
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs font-bold mt-1 truncate ${
                          isSelected ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.topicBadge}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* 左右双栏：左栏三色踩点范本拆解 + 右栏默写命中率自测 & AI 阅卷组长 */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                {/* 左栏：材料 + 设问 + 三色踩点拆解视图 (6列) */}
                <div className="xl:col-span-6 bento-card rounded-3xl p-4 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-4">
                  <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                        {activeSubjective.questionNo} · {activeSubjective.subject}
                      </span>
                      <span className="text-2xs font-mono text-slate-400">满分 10 分 · 肖四经典范式</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                      {activeSubjective.title}
                    </h2>
                  </div>

                  {/* 材料背景与设问 */}
                  <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2.5 text-xs">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeSubjective.materialBackground}
                    </p>
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700 space-y-1">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100">【真题设问】</div>
                      {activeSubjective.subQuestions.map((sq, i) => (
                        <div key={i} className="font-semibold text-indigo-800 dark:text-indigo-300 leading-relaxed">
                          {sq}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 三色踩点标准答案拆解控制器 */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-2xs font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        📘 核心原理必背句
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        📗 结合材料过渡句
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                        📙 意义升华总结句
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setMaskPrincipleSegments((v) => !v)
                          setRevealedSegmentKeys({})
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-2xs font-extrabold border cursor-pointer transition-all ${
                          maskPrincipleSegments
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {maskPrincipleSegments ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{maskPrincipleSegments ? '已遮罩核心原理句' : '一键遮罩核心采分句'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHideFullReferenceInRecite((v) => !v)}
                        className="px-2.5 py-1 rounded-xl text-2xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        {hideFullReferenceInRecite ? '展开范本' : '闭卷隐藏范本'}
                      </button>
                    </div>
                  </div>

                  {/* 三色踩点段落展示 */}
                  {hideFullReferenceInRecite ? (
                    <div className="rounded-2xl p-6 border border-dashed border-indigo-300 dark:border-indigo-500/40 bg-indigo-50/40 dark:bg-indigo-950/20 text-center space-y-2">
                      <div className="text-xs font-extrabold text-indigo-800 dark:text-indigo-300">
                        🙈 当前处于全闭卷默写模式，标准答案已临时折叠防剧透
                      </div>
                      <button
                        type="button"
                        onClick={() => setHideFullReferenceInRecite(false)}
                        className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                      >
                        默写完毕，展开三色标准范本核对
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeSubjective.segments.map((seg, idx) => {
                        const segKey = `${activeSubjective.id}-${idx}`
                        const isMasked =
                          seg.type === 'principle' && maskPrincipleSegments && !revealedSegmentKeys[segKey]

                        const boxClass =
                          seg.type === 'principle'
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/35 border-indigo-200 dark:border-indigo-500/35 text-indigo-950 dark:text-indigo-100'
                            : seg.type === 'material'
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-500/35 text-emerald-950 dark:text-emerald-100'
                            : 'bg-amber-50/70 dark:bg-amber-950/35 border-amber-200 dark:border-amber-500/35 text-amber-950 dark:text-amber-100'

                        return (
                          <div key={segKey} className={`rounded-2xl p-3.5 border ${boxClass} space-y-1.5`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-2xs font-extrabold">{seg.label}</span>
                              {seg.type === 'principle' && maskPrincipleSegments && revealedSegmentKeys[segKey] && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRevealedSegmentKeys((prev) => ({ ...prev, [segKey]: false }))
                                  }
                                  className="text-2xs underline opacity-75 cursor-pointer"
                                >
                                  重新遮罩
                                </button>
                              )}
                            </div>

                            {isMasked ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedSegmentKeys((prev) => ({ ...prev, [segKey]: true }))
                                }
                                className="w-full py-2.5 px-3 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-dashed border-indigo-400 text-xs font-bold text-indigo-700 dark:text-indigo-300 cursor-pointer text-left"
                              >
                                🔒 核心原理必背句已遮罩 —— 先在右侧默写，点击此处显影核对
                              </button>
                            ) : (
                              <p className="text-xs leading-relaxed font-medium">{seg.text}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* 阅卷组长心法 */}
                  <div className="rounded-2xl p-3.5 bg-rose-50/80 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                    <strong className="text-rose-700 dark:text-rose-300">💡 阅卷组长排版心法：</strong>
                    {activeSubjective.examinerTip}
                  </div>
                </div>

                {/* 右栏：考生默写命中率即时诊断 + AI 阅卷组长流式批改舱 (6列) */}
                <div className="xl:col-span-6 bento-card rounded-3xl p-4 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <PenTool className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <span>考场背诵默写 & 采分词雷达舱</span>
                      </h3>
                      <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                        输入作答要点即时高亮命中的官方采分词，支持 Ctrl + Enter 呼叫 AI 政治阅卷组长给分
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-mono text-slate-400">{currentDraft.length} 字</span>
                      {currentDraft.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setUserEssayDrafts((prev) => ({ ...prev, [activeSubjective.id]: '' }))
                          }
                          className="text-2xs text-slate-400 hover:text-rose-600 underline cursor-pointer"
                        >
                          清空重写
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 中文输入法 IME 安全默写框 */}
                  <textarea
                    rows={7}
                    value={currentDraft}
                    onCompositionStart={() => {
                      isImeComposingRef.current = true
                    }}
                    onCompositionEnd={() => {
                      isImeComposingRef.current = false
                    }}
                    onChange={(e) => {
                      const val = e.target.value
                      setUserEssayDrafts((prev) => ({ ...prev, [activeSubjective.id]: val }))
                    }}
                    onKeyDown={(e) => {
                      if (
                        (e.ctrlKey || e.metaKey) &&
                        e.key === 'Enter' &&
                        !e.nativeEvent.isComposing &&
                        !isImeComposingRef.current &&
                        e.keyCode !== 229
                      ) {
                        e.preventDefault()
                        if (!isAiGrading) handleRequestAiGrading()
                      }
                    }}
                    placeholder={`请在此默写【${activeSubjective.questionNo}】分点作答要点...\n建议格式：\n（1）首先，从唯物辩证法/核心理论来看，……（原理必背句）\n结合材料可知，……（扣题分析）\n（2）其次，我们必须坚持……（方法论/意义升华）`}
                    className="w-full rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
                  />

                  {/* 本地即时采分词命中率进度条与诊断 */}
                  <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">
                        🎯 官方采分词实时命中率：{localScoringEval.hitPercent}%（{localScoringEval.hitPoints.length}/{localScoringEval.totalCount} 点）
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        本地词频基准：{localScoringEval.normalizedScore} / 10 分
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-teal-500 transition-all duration-300"
                        style={{ width: `${localScoringEval.hitPercent}%` }}
                      />
                    </div>

                    {/* 已命中的采分词 */}
                    {localScoringEval.hitPoints.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-2xs font-bold text-emerald-700 dark:text-emerald-400">
                          ✅ 已踩中：
                        </span>
                        {localScoringEval.hitPoints.map((pt) => (
                          <span
                            key={pt.keyword}
                            className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-2xs font-bold"
                          >
                            ✓ {pt.keyword} (+{pt.weight}分)
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 漏掉的采分词（支持防剧透按需展开） */}
                    {localScoringEval.missedPoints.length > 0 && (
                      <div className="pt-1 space-y-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setShowMissedPointsHint((prev) => ({
                              ...prev,
                              [activeSubjective.id]: !prev[activeSubjective.id],
                            }))
                          }
                          className="text-2xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>
                            {showMissedPointsHint[activeSubjective.id]
                              ? '▾ 隐藏未命中的采分词提示'
                              : `💡 还有 ${localScoringEval.missedPoints.length} 个官方采分词未命中，点击查看漏词提示`}
                          </span>
                        </button>

                        {showMissedPointsHint[activeSubjective.id] && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {localScoringEval.missedPoints.map((pt) => (
                              <span
                                key={pt.keyword}
                                title={pt.hint}
                                className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30 text-2xs font-semibold"
                              >
                                ○ {pt.keyword}（{pt.hint}）
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 呼叫 AI 政治阅卷组长按钮 */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isAiGrading}
                      onClick={handleRequestAiGrading}
                      className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 disabled:opacity-60 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
                    >
                      {isAiGrading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>AI 政治阅卷组长正在逐点批改给分...</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4" />
                          <span>🤖 呼叫 AI 政治阅卷组长踩点给分（10 分制）</span>
                        </>
                      )}
                    </button>

                    {isAiGrading && (
                      <button
                        type="button"
                        onClick={handleStopAiGrading}
                        className="px-3.5 py-2.5 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>停止</span>
                      </button>
                    )}
                  </div>

                  {aiGradingError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-800 dark:text-rose-200">
                      ⚠️ {aiGradingError}
                    </div>
                  )}

                  {/* AI 阅卷组长流式结果展示舱 */}
                  {aiGradingMap[activeSubjective.id] && (
                    <div className="rounded-2xl p-4 bg-indigo-50/45 dark:bg-slate-800/80 border border-indigo-200/80 dark:border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-extrabold text-indigo-800 dark:text-indigo-300 pb-2 border-b border-indigo-200/60 dark:border-slate-700">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>AI 政治阅卷组长分点批改报告</span>
                        </span>
                        <span className="text-2xs font-mono text-slate-400">按点给分 · 术语校准</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                        <ChunkErrorBoundary title="阅卷报告渲染异常">
                          <Suspense fallback={<div className="whitespace-pre-wrap">{aiGradingMap[activeSubjective.id]}</div>}>
                            <MarkdownRenderer
                              content={aiGradingMap[activeSubjective.id]}
                              isStreaming={isAiGrading}
                            />
                          </Suspense>
                        </ChunkErrorBoundary>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: 横向易混专题对比矩阵（首列 sticky 防小屏看串行 + 完整暗夜模式适配）
         ========================================================================= */}
      {activeTab === 'matrices' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {COMPARISON_MATRICES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMatrixId(m.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shrink-0 ${
                  activeMatrixId === m.id
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {m.title}
              </button>
            ))}
          </div>

          {COMPARISON_MATRICES.filter((m) => m.id === activeMatrixId).map((matrix) => (
            <div
              key={matrix.id}
              className="bento-card rounded-3xl p-4 sm:p-6 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 overflow-hidden"
            >
              <div className="mb-4">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {matrix.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{matrix.subtitle}</p>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[680px] border-collapse text-left text-xs sm:text-[13px]">
                  <thead>
                    <tr className="border-y-2 border-rose-600 dark:border-rose-500/70 bg-slate-50 dark:bg-slate-800">
                      {matrix.headers.map((h, i) => (
                        <th
                          key={i}
                          className={`py-3 px-3.5 font-extrabold text-slate-900 dark:text-slate-100 ${
                            i === 0
                              ? 'sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]'
                              : ''
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-700/70">
                    {matrix.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="group hover:bg-indigo-50/40 dark:hover:bg-slate-800/70 transition-colors"
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-3 px-3.5 align-top leading-relaxed ${
                              cIdx === 0
                                ? 'sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-indigo-50 dark:group-hover:bg-slate-800 font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]'
                                : cIdx === 1
                                ? 'font-bold text-indigo-700 dark:text-indigo-300'
                                : cIdx === 3
                                ? 'text-rose-800 dark:text-rose-200 bg-rose-50/40 dark:bg-rose-950/25 font-medium'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          TAB 6: 我的政治考点与真题收藏夹（完整亮暗主题兼容）
         ========================================================================= */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="bento-card rounded-2xl p-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                我的考点与真题收藏夹 (共 {totalFavCount} 项)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              在史纲时空轴点击“收藏”或在刷题舱点击“收藏此题”，均会自动汇总至此形成你的考前必背口袋书。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 收藏的史纲考点 */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1 flex items-center justify-between">
                <span>🏛️ 已收藏的史纲考点 ({favoritedItemsList.length})</span>
                {favoritedItemsList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFavItemIds({})}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    清空考点收藏
                  </button>
                )}
              </div>

              {favoritedItemsList.length > 0 ? (
                favoritedItemsList.map((item) => (
                  <div
                    key={item.id}
                    className="bento-card rounded-2xl p-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        {item.year} 年
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFavItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                      >
                        取消收藏
                      </button>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{item.title}</h3>
                    <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">🔑 {item.keyTag}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.content}</p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveYear(item.year)
                          setActiveTab('timeline')
                        }}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        在史纲时空轴中定位 →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bento-card rounded-2xl p-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 text-center text-slate-400 text-xs">
                  暂未收藏史纲考点，在“史纲时空大屏”中点击右侧“收藏”即可添加。
                </div>
              )}
            </div>

            {/* 收藏的真题（内置 + 导入） */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1 flex items-center justify-between">
                <span>📝 已收藏的政治题目 ({favoritedQuestionsList.length})</span>
                {favoritedQuestionsList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFavQuestionIds({})}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    清空题目收藏
                  </button>
                )}
              </div>

              {favoritedQuestionsList.length > 0 ? (
                favoritedQuestionsList.map((q) => (
                  <div
                    key={q.id}
                    className="bento-card rounded-2xl p-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{q.subject}</span>
                      <button
                        type="button"
                        onClick={() => toggleFavQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                      >
                        取消收藏
                      </button>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {q.question}
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <strong>【正确答案】：</strong>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {Array.isArray(q.answer) ? q.answer.join('') : q.answer}
                      </span>
                      <div className="mt-1 text-slate-600 dark:text-slate-300">{q.analysis.corePoint}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bento-card rounded-2xl p-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/70 text-center text-slate-400 text-xs">
                  暂未收藏政治真题，在“核心刷题舱”点击右上角“收藏此题”即可归档。
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 跨组件模态框集成（政治上传与提取 / 讲义精读 / PDF 原位高清阅读） ── */}
      <Suspense fallback={null}>
        {importModalOpen && (
          <ImportResourceModal
            isOpen={importModalOpen}
            onClose={() => setImportModalOpen(false)}
            defaultDomain="politics"
            defaultTab={importModalTab}
            onBooksUpdated={loadPoliticsBooks}
            onQuestionsUpdated={fetchCustomPoliticsQuestions}
          />
        )}

        {activeHandout && (
          <HandoutReaderModal
            isOpen={Boolean(activeHandout)}
            onClose={() => setActiveHandout(null)}
            handout={activeHandout}
            onPractice={handlePracticeFromHandout}
            onAskAI={handleAskAIFromHandout}
          />
        )}

        {activePdfBook && (
          <PdfViewerModal
            isOpen={Boolean(activePdfBook)}
            onClose={() => setActivePdfBook(null)}
            book={activePdfBook}
            onExtractAi={() => {
              setActivePdfBook(null)
              openImportModal('books')
            }}
          />
        )}
      </Suspense>
    </div>
  )
}
