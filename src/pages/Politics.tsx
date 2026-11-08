import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  Landmark,
  MapPin,
  Calendar,
  Flame,
  Eye,
  EyeOff,
  Star,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
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
  TrendingUp,
} from 'lucide-react'
import {
  HISTORY_ERAS,
  CATEGORY_META,
  ENHANCED_HISTORY_TIMELINE_ITEMS,
  COMPARISON_MATRICES,
  getYearStageContext,
  type EraKey,
  type ItemCategory,
  type HistoryItem,
} from '../data/historyTimelineData'
import {
  XIAO_1000_POLITICS_QUESTIONS,
  type PoliticsQuestion,
  type PoliticsSubject,
  type PoliticsQuestionType,
} from '../data/politicsQuestions'

type PoliticsTab = 'timeline' | 'xiao1000' | 'favorites' | 'matrices'
type AnniversaryMode = 'both' | '2027' | '2026'

const STORAGE_KEY_FAV_ITEMS = 'coreforge_politics_fav_items_v1'
const STORAGE_KEY_FAV_QUESTIONS = 'coreforge_politics_fav_questions_v1'
const STORAGE_KEY_QUIZ_HISTORY = 'coreforge_politics_quiz_history_v1'

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

export default function Politics() {
  const [activeTab, setActiveTab] = useState<PoliticsTab>('timeline')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const fullScreenContainerRef = useRef<HTMLDivElement | null>(null)

  // -------------------------------------------------------------
  // 1. 史纲时空轴核心状态
  // -------------------------------------------------------------
  const [activeYear, setActiveYear] = useState<number>(1851)
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')
  const [onlyAnniversary, setOnlyAnniversary] = useState(false)
  const [onlyPitfall, setOnlyPitfall] = useState(false)
  const [anniversaryMode, setAnniversaryMode] = useState<AnniversaryMode>('both')
  const [isPlaying, setIsPlaying] = useState(false)
  const [maskMode, setMaskMode] = useState(false)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({})
  const [activeMatrixId, setActiveMatrixId] = useState<string>(COMPARISON_MATRICES[0].id)

  // -------------------------------------------------------------
  // 2. 收藏夹与刷题记录持久化
  // -------------------------------------------------------------
  const [favItemIds, setFavItemIds] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FAV_ITEMS)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const [favQuestionIds, setFavQuestionIds] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FAV_QUESTIONS)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_QUIZ_HISTORY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAV_ITEMS, JSON.stringify(favItemIds))
    } catch {}
  }, [favItemIds])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAV_QUESTIONS, JSON.stringify(favQuestionIds))
    } catch {}
  }, [favQuestionIds])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUIZ_HISTORY, JSON.stringify(quizAnswers))
    } catch {}
  }, [quizAnswers])

  // -------------------------------------------------------------
  // 3. 肖秀荣 1000 题状态
  // -------------------------------------------------------------
  const [xiaoSubjectFilter, setXiaoSubjectFilter] = useState<PoliticsSubject | 'all'>('all')
  const [xiaoTypeFilter, setXiaoTypeFilter] = useState<PoliticsQuestionType | 'all'>('all')
  const [xiaoSearchQuery, setXiaoSearchQuery] = useState('')
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0)
  const [multiSelectBuffer, setMultiSelectBuffer] = useState<Record<string, string[]>>({})
  const [showAnalysis, setShowAnalysis] = useState<Record<string, boolean>>({})

  // -------------------------------------------------------------
  // 4. 时空轴数据衍生
  // -------------------------------------------------------------
  const filteredItems = useMemo(() => {
    return ENHANCED_HISTORY_TIMELINE_ITEMS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
      if (onlyAnniversary && !getAnniversaryInfo(item.year, anniversaryMode).matched) return false
      if (onlyPitfall && !item.pitfall) return false
      return true
    })
  }, [selectedCategory, onlyAnniversary, anniversaryMode, onlyPitfall])

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

  const activeItem = currentYearItems[0] || filteredItems[0]

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

  // 键盘快捷键监听
  useEffect(() => {
    if (activeTab !== 'timeline') return
    const onKeyDown = (e: KeyboardEvent) => {
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
    setFavItemIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleFavQuestion = (id: string) => {
    setFavQuestionIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // 肖秀荣 1000 题答题与判断
  const handleSingleSelect = (qid: string, opt: string) => {
    setQuizAnswers((prev) => ({ ...prev, [qid]: opt }))
    setShowAnalysis((prev) => ({ ...prev, [qid]: true }))
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
    setShowAnalysis((prev) => ({ ...prev, [qid]: true }))
  }

  // 肖秀荣 1000 题筛选结果
  const filteredXiaoQuestions = useMemo(() => {
    return XIAO_1000_POLITICS_QUESTIONS.filter((q) => {
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
  }, [xiaoSubjectFilter, xiaoTypeFilter, xiaoSearchQuery])

  // 收藏夹题目和知识点汇总
  const favoritedItemsList = useMemo(() => {
    return ENHANCED_HISTORY_TIMELINE_ITEMS.filter((item) => favItemIds[item.id])
  }, [favItemIds])

  const favoritedQuestionsList = useMemo(() => {
    return XIAO_1000_POLITICS_QUESTIONS.filter((q) => favQuestionIds[q.id])
  }, [favQuestionIds])

  // 从时空轴一键跳转到 1000 题中的关联题目
  const jumpToXiaoByHistory = (year: number) => {
    const targetQ = XIAO_1000_POLITICS_QUESTIONS.find((q) => q.relatedYear === year)
    if (targetQ) {
      setXiaoSubjectFilter('中国近现代史纲要')
      setActiveTab('xiao1000')
      const idx = filteredXiaoQuestions.findIndex((q) => q.id === targetQ.id)
      if (idx >= 0) setActiveQuestionIdx(idx)
    } else {
      setActiveTab('xiao1000')
    }
  }

  // 从 1000 题反向定位到时空轴年份
  const jumpToTimelineByQuestion = (year: number) => {
    setActiveYear(year)
    setActiveTab('timeline')
  }

  // 辅助计算当前年份相关的周年与背景
  const currentAnniv = getAnniversaryInfo(activeYear, anniversaryMode)
  const currentStage = getYearStageContext(activeYear)

  // 统计指标
  const totalFavCount = favoritedItemsList.length + favoritedQuestionsList.length
  const totalAnsweredCount = Object.keys(quizAnswers).length
  const currentScore = useMemo(() => {
    let correct = 0
    XIAO_1000_POLITICS_QUESTIONS.forEach((q) => {
      const ans = quizAnswers[q.id]
      if (!ans) return
      if (q.type === 'single' && ans === q.answer) correct++
      if (
        q.type === 'multiple' &&
        Array.isArray(ans) &&
        Array.isArray(q.answer) &&
        ans.length === q.answer.length &&
        ans.every((x, i) => x === (q.answer as string[])[i])
      ) {
        correct++
      }
    })
    return correct
  }, [quizAnswers])

  return (
    <div
      ref={fullScreenContainerRef}
      className={`mx-auto ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#080c14] text-slate-100 p-3 sm:p-5 overflow-y-auto no-scrollbar'
          : 'max-w-[1520px] space-y-4 sm:space-y-5 animate-fade-in-up text-slate-900'
      }`}
    >
      {/* ── 顶部统一政治专区导航驾驶舱 ── */}
      <section className="bento-card rounded-3xl p-3.5 sm:p-5 relative overflow-hidden bg-gradient-to-r from-white via-white to-rose-50/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-[11px] font-bold text-rose-700">
                <Landmark className="w-3.5 h-3.5 text-rose-600" />
                <span>2026/2027 考研政治总攻专区</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-800">
                <Flame className="w-3 h-3 text-amber-600" />
                <span>全屏史纲时空轴 · 肖秀荣1000题 · 知识点收藏</span>
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>🏛️ 考研政治研学大本营</span>
              <span className="hidden sm:inline text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                大纲必背 + 强化精练
              </span>
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
              拖动时空轴查看 1840–2024 近代大事件与重大会议，同步刷肖秀荣 1000 题真题解析，一键收藏核心考点
            </p>
          </div>

          {/* 顶部功能快捷切页与全屏按钮 */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex rounded-2xl bg-slate-100/90 p-1 border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>史纲时空大屏</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('xiao1000')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'xiao1000'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>肖秀荣1000题</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/15 text-rose-700 font-extrabold">
                  刷题
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('favorites')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>考点收藏夹</span>
                {totalFavCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
                    {totalFavCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('matrices')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'matrices'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>横向易混矩阵</span>
              </button>
            </div>

            {/* 全屏切换按钮 */}
            <button
              type="button"
              onClick={toggleFullScreen}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title={isFullscreen ? '退出全屏沉浸大屏' : '进入全屏时空沉浸大屏'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-indigo-600" />}
              <span className="hidden sm:inline">{isFullscreen ? '退出全屏' : '全屏时空大屏'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TAB 1: 全屏史纲时空轴（高保真中国发光地图 + 历史配图画廊 + 拖动时空联动）
         ========================================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* 筛选与操作小工具条 */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                全部脉络 ({ENHANCED_HISTORY_TIMELINE_ITEMS.length})
              </button>
              {(Object.keys(CATEGORY_META) as ItemCategory[]).map((cat) => {
                const meta = CATEGORY_META[cat]
                const count = ENHANCED_HISTORY_TIMELINE_ITEMS.filter((i) => i.category === cat).length
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                    <span className="opacity-70 font-mono text-[11px]">({count})</span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOnlyAnniversary((v) => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  onlyAnniversary
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>逢五逢十热点</span>
              </button>
              <button
                type="button"
                onClick={() => setOnlyPitfall((v) => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  onlyPitfall
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>易错陷阱</span>
              </button>
              <button
                type="button"
                onClick={() => setMaskMode((v) => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  maskMode
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {maskMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{maskMode ? '背诵遮罩中' : '背诵遮罩'}</span>
              </button>
            </div>
          </div>

          {/* ── 核心全屏大屏：左侧事件背景 + 中间中国发光历史地图 + 右侧考点拆解与配图 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
            {/* 左侧：历史事件背景与核心决议 (4列) */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="bento-card rounded-3xl p-4 sm:p-5 h-full flex flex-col justify-between border-t-4" style={{ borderTopColor: currentEra.themeColor }}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {currentEra.startYear}–{currentEra.key === 'reform_new_era' ? '至今' : currentEra.endYear}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${currentEra.badgeClass}`}>
                      {currentEra.name}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl sm:text-2xl font-black font-mono" style={{ color: currentEra.themeColor }}>
                        {activeYear} 年
                      </span>
                      {currentAnniv.matched && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-extrabold animate-pulse-soft">
                          🔥 {currentAnniv.labels.join(' · ')}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                      {activeItem?.title || `${activeYear}年历史概览`}
                    </h2>
                  </div>

                  {/* 历史视觉图解插画徽章卡片 */}
                  {activeItem?.illustration && (
                    <div className="rounded-2xl p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden shadow-sm">
                      <div className="absolute right-2 -bottom-2 text-6xl opacity-15 select-none pointer-events-none">
                        {activeItem.illustration.symbolIcon}
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span className="text-[11px] font-bold text-amber-300">
                          {activeItem.illustration.subtitle}
                        </span>
                      </div>
                      <div className="text-xs font-extrabold text-white leading-relaxed">
                        🔑 {activeItem.illustration.tag}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {activeItem.illustration.figureQuote}
                      </p>
                    </div>
                  )}

                  {/* 核心决议内容 */}
                  <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200/80">
                    <div className="text-xs font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                      <span>📋 核心决议 / 重要文献</span>
                    </div>
                    {maskMode && !revealedIds[activeItem?.id || ''] ? (
                      <button
                        type="button"
                        onClick={() => setRevealedIds((prev) => ({ ...prev, [activeItem?.id || '']: true }))}
                        className="w-full text-left py-2 px-3 rounded-xl bg-indigo-50/70 border border-dashed border-indigo-200 text-xs font-bold text-indigo-700 cursor-pointer"
                      >
                        🙈 考点已遮罩，点击揭晓答案
                      </button>
                    ) : (
                      <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                        {activeItem?.content || currentStage.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* 底部本时期社会主要矛盾导读 */}
                <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">主要矛盾：</span>
                  <span>{currentEra.coreContradiction.slice(0, 48)}...</span>
                </div>
              </div>
            </div>

            {/* 中间：全屏中国历史地理发光地图 (5列) */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="bento-card rounded-3xl p-4 sm:p-5 h-full flex flex-col justify-between bg-[#0a0f1d] text-white border border-slate-800 relative overflow-hidden shadow-xl min-h-[360px] sm:min-h-[420px]">
                {/* 地图顶部控制条 */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                    </span>
                    <span className="text-xs font-extrabold text-slate-200">
                      历史地理时空标绘 · {activeItem?.cityName || '中国全域'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    经纬度定位模式
                  </span>
                </div>

                {/* 矢量发光中国地图画布 */}
                <div className="relative my-2 flex-1 flex items-center justify-center">
                  <svg
                    viewBox="0 0 800 600"
                    className="w-full h-full max-h-[380px] drop-shadow-[0_0_20px_rgba(56,189,248,0.15)] select-none"
                  >
                    {/* 背景科技网格 */}
                    <defs>
                      <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                      </pattern>
                      <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(239, 68, 68, 0.25)" />
                        <stop offset="100%" stopColor="rgba(10, 15, 29, 0)" />
                      </radialGradient>
                    </defs>
                    <rect width="800" height="600" fill="url(#radarGrid)" />

                    {/* 中国地图简化写意轮廓 (包含主要国界特征与海岸线) */}
                    <path
                      d="M 170 180 Q 230 110, 310 130 T 420 120 T 520 100 T 640 120 T 700 170 T 680 240 T 620 280 T 640 350 T 580 430 T 540 500 T 460 520 T 400 480 T 310 470 T 240 430 T 180 370 T 140 280 Z"
                      fill="#121829"
                      stroke="#1e293b"
                      strokeWidth="2"
                    />
                    <path
                      d="M 230 180 L 330 220 L 420 260 L 520 320 L 590 380 L 560 450 L 460 470 L 380 430 L 300 370 L 220 280 Z"
                      fill="none"
                      stroke="rgba(56,189,248,0.2)"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />

                    {/* 长江与黄河写意水系光带 */}
                    <path
                      d="M 240 330 Q 340 300, 440 330 T 580 340 T 630 350"
                      fill="none"
                      stroke="rgba(56,189,248,0.3)"
                      strokeWidth="2"
                    />
                    <path
                      d="M 260 260 Q 360 230, 430 250 T 530 240 T 610 230"
                      fill="none"
                      stroke="rgba(245,158,11,0.25)"
                      strokeWidth="1.8"
                    />

                    {/* 预设各大主要历史名城背景常驻点 */}
                    {[
                      { name: '北京', x: 530, y: 190 },
                      { name: '南京', x: 580, y: 340 },
                      { name: '上海', x: 620, y: 350 },
                      { name: '广州', x: 510, y: 490 },
                      { name: '武昌', x: 510, y: 360 },
                      { name: '延安', x: 440, y: 250 },
                      { name: '遵义', x: 410, y: 410 },
                      { name: '西柏坡', x: 490, y: 220 },
                      { name: '沈阳', x: 620, y: 150 },
                      { name: '桂平金田', x: 480, y: 480 },
                      { name: '井冈山', x: 520, y: 420 },
                      { name: '瑞金', x: 540, y: 430 },
                    ].map((city) => (
                      <g key={city.name} className="opacity-45 hover:opacity-100 transition-opacity">
                        <circle cx={city.x} cy={city.y} r="2.5" fill="#64748b" />
                        <text x={city.x + 5} y={city.y + 3} fill="#64748b" fontSize="9" fontFamily="sans-serif">
                          {city.name}
                        </text>
                      </g>
                    ))}

                    {/* 当前活跃年份城市的大型发光涟漪与地标 Pin */}
                    {(() => {
                      const coords = activeItem?.coordinates || [116.4, 39.9]
                      // 投影算法：将经纬度转化为 800x600 视图坐标
                      const px = Math.min(740, Math.max(120, ((coords[0] - 78) / (132 - 78)) * 640 + 80))
                      const py = Math.min(540, Math.max(80, 560 - ((coords[1] - 19) / (52 - 19)) * 480))

                      return (
                        <g>
                          {/* 扩散光晕 */}
                          <circle cx={px} cy={py} r="28" fill="url(#centerGlow)" className="animate-pulse" />
                          <circle cx={px} cy={py} r="16" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6">
                            <animate attributeName="r" values="8;24;36" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.8;0.3;0" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx={px} cy={py} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="2" />

                          {/* 坐标悬浮卡牌 */}
                          <g transform={`translate(${px - 55}, ${py - 48})`}>
                            <rect width="110" height="34" rx="8" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                            <text x="55" y="16" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">
                              📍 {activeItem?.cityName || '历史坐标'}
                            </text>
                            <text x="55" y="27" fill="#94a3b8" fontSize="8" textAnchor="middle">
                              {activeItem?.date}
                            </text>
                          </g>
                        </g>
                      )
                    })()}
                  </svg>
                </div>

                {/* 地图下方空间位置说明与肖秀荣千题直达按钮 */}
                <div className="flex items-center justify-between z-10 pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    史实锚点：<strong className="text-amber-400">{activeItem?.location || activeItem?.cityName}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => jumpToXiaoByHistory(activeYear)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    <span>刷当年真题 (肖秀荣1000题)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：考研一字千金定性 + 易错排雷 + 收藏按钮 (3列) */}
            <div className="lg:col-span-3 space-y-3.5">
              <div className="bento-card rounded-3xl p-4 sm:p-5 h-full flex flex-col justify-between border-t-4" style={{ borderTopColor: currentEra.themeColor }}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">考研真题定性点</span>
                    <button
                      type="button"
                      onClick={() => toggleFavItem(activeItem?.id || '')}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        favItemIds[activeItem?.id || '']
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {favItemIds[activeItem?.id || ''] ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                      <span>{favItemIds[activeItem?.id || ''] ? '已收藏' : '收藏考点'}</span>
                    </button>
                  </div>

                  {/* 一字千金定性词 */}
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
                    <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">一字千金定性</div>
                    <div className="text-xs sm:text-sm font-extrabold leading-snug">
                      {activeItem?.keyTag || '历史转折与战略新开端'}
                    </div>
                  </div>

                  {/* 考研标准历史地位 */}
                  <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 text-slate-800">
                    <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1">考研标准历史意义</div>
                    {maskMode && !revealedIds[activeItem?.id || ''] ? (
                      <div className="text-xs text-indigo-500 font-medium py-1">（已打码，默背中...）</div>
                    ) : (
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {activeItem?.significance}
                      </p>
                    )}
                  </div>

                  {/* 肖秀荣命题陷阱红框警告 */}
                  {activeItem?.pitfall && (
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-rose-900">
                      <div className="flex items-center gap-1 text-[11px] font-extrabold text-red-600 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>命题陷阱排雷</span>
                      </div>
                      <p className="text-xs leading-relaxed text-red-950 font-medium">
                        {activeItem.pitfall}
                      </p>
                    </div>
                  )}
                </div>

                {/* 底部前后节点推进与自动演进按钮 */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 mt-3">
                  <button
                    type="button"
                    disabled={prevKeyYear === null}
                    onClick={() => prevKeyYear !== null && setActiveYear(prevKeyYear)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    ← 上一年
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlaying((v) => !v)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border cursor-pointer ${
                      isPlaying ? 'bg-rose-600 text-white border-rose-600' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-rose-600" />}
                  </button>
                  <button
                    type="button"
                    disabled={nextKeyYear === null}
                    onClick={() => nextKeyYear !== null && setActiveYear(nextKeyYear)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer"
                  >
                    下一年 →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── 底部沉浸式时间轴控制底座 ── */}
          <div className="bento-card rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-400">📅 考研史纲全编年轴 (1840–2024)</span>
                <span className="text-slate-400 hidden sm:inline">| 拖动滑块或使用键盘左右方向键</span>
              </div>
              <div className="font-mono text-slate-300">
                当前焦点：<strong className="text-amber-400 text-sm">{activeYear}</strong> 年（收录 {currentYearItems.length} 项史实）
              </div>
            </div>

            {/* 原生拖动进度条 */}
            <input
              type="range"
              min={0}
              max={Math.max(0, availableYears.length - 1)}
              step={1}
              value={Math.max(0, availableYears.indexOf(activeYear))}
              onChange={(e) => {
                const target = availableYears[Number(e.target.value)]
                if (target !== undefined) setActiveYear(target)
              }}
              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />

            {/* 刻度地标 */}
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1 select-none">
              <span>1840 鸦片战争</span>
              <span className="hidden sm:inline">1851 太平天国</span>
              <span className="hidden md:inline">1911 辛亥革命</span>
              <span>1921 中共建党</span>
              <span className="hidden sm:inline">1935 遵义会议</span>
              <span>1949 新中国诞生</span>
              <span className="hidden md:inline">1978 改革开放</span>
              <span>2024 二十届三中</span>
            </div>

            {/* 年份胶囊高频直达尺 */}
            <div className="flex items-end gap-1.5 overflow-x-auto no-scrollbar pt-3 mt-2 border-t border-slate-800">
              {availableYears.map((yr) => {
                const isCurr = yr === activeYear
                const yrCount = filteredItems.filter((i) => i.year === yr).length
                const anniv = getAnniversaryInfo(yr, anniversaryMode)
                const barHeight = Math.min(22, 6 + yrCount * 6)

                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setActiveYear(yr)}
                    className={`group flex flex-col items-center px-2 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                      isCurr
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md scale-105'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-1.5 rounded-full mb-1 transition-all ${
                        isCurr ? 'bg-amber-300' : anniv.matched ? 'bg-amber-400' : 'bg-slate-500'
                      }`}
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="font-mono text-[11px] font-bold">{yr}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 肖秀荣 1000 题专项刷题中心 (单选、多选、名师解析与一键收藏)
         ========================================================================= */}
      {activeTab === 'xiao1000' && (
        <div className="space-y-4">
          {/* 筛选控制器 */}
          <div className="bento-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">学科模块：</span>
              {(['all', '中国近现代史纲要', '马克思主义基本原理', '毛泽东思想和中国特色社会主义理论体系', '思想道德与法治'] as const).map(
                (subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => {
                      setXiaoSubjectFilter(subj)
                      setActiveQuestionIdx(0)
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      xiaoSubjectFilter === subj
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {subj === 'all' ? '全部学科' : subj}
                  </button>
                )
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">题型：</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                {(['all', 'single', 'multiple'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setXiaoTypeFilter(t)
                      setActiveQuestionIdx(0)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      xiaoTypeFilter === t ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t === 'all' ? '全部' : t === 'single' ? '单选题' : '多选题'}
                  </button>
                ))}
              </div>

              {/* 搜索框 */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={xiaoSearchQuery}
                  onChange={(e) => setXiaoSearchQuery(e.target.value)}
                  placeholder="搜索题目、章节、关键词..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 w-44 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* 做题主工作台 */}
          {filteredXiaoQuestions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* 左侧：题号列表导航抽屉 (3列) */}
              <div className="lg:col-span-3 bento-card rounded-3xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>题号导航 (共 {filteredXiaoQuestions.length} 题)</span>
                  <span className="text-emerald-600 font-mono">已做 {totalAnsweredCount} 题</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 max-h-[460px] overflow-y-auto no-scrollbar pr-1">
                  {filteredXiaoQuestions.map((q, idx) => {
                    const isAnswered = quizAnswers[q.id] !== undefined
                    const isActive = idx === activeQuestionIdx
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-sm ring-2 ring-indigo-500'
                            : isAnswered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> 已答题
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300" /> 未做
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-900" /> 当前
                  </span>
                </div>
              </div>

              {/* 右侧：单题做题、选项勾选与肖秀荣名师解析卡片 (9列) */}
              <div className="lg:col-span-9 space-y-4">
                {(() => {
                  const q = filteredXiaoQuestions[activeQuestionIdx] || filteredXiaoQuestions[0]
                  const userAnswer = quizAnswers[q.id]
                  const isSubmitted = userAnswer !== undefined
                  const isFav = Boolean(favQuestionIds[q.id])
                  const currentMulti = multiSelectBuffer[q.id] || []

                  const isCorrect =
                    q.type === 'single'
                      ? userAnswer === q.answer
                      : Array.isArray(userAnswer) &&
                        Array.isArray(q.answer) &&
                        userAnswer.length === q.answer.length &&
                        userAnswer.every((x, i) => x === (q.answer as string[])[i])

                  return (
                    <div className="bento-card rounded-3xl p-5 sm:p-7 space-y-5">
                      {/* 题目头部元信息 */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                            {q.subject}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-mono font-bold text-slate-600">
                            {q.type === 'single' ? '单项选择题' : '多项选择题'}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {q.chapter}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {q.relatedYear && (
                            <button
                              type="button"
                              onClick={() => jumpToTimelineByQuestion(q.relatedYear!)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl cursor-pointer"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>时空轴对应 {q.relatedYear} 年</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleFavQuestion(q.id)}
                            className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl border cursor-pointer transition-all ${
                              isFav
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {isFav ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                            <span>{isFav ? '已收藏' : '收藏此题'}</span>
                          </button>
                        </div>
                      </div>

                      {/* 题干内容 */}
                      <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                        <span className="text-indigo-600 font-mono mr-2">第 {activeQuestionIdx + 1} 题.</span>
                        {q.question}
                      </div>

                      {/* 选项组 */}
                      <div className="space-y-2.5">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const optText = q.options[optKey]
                          const isSingleSelected = q.type === 'single' && userAnswer === optKey
                          const isMultiChecked = q.type === 'multiple' && currentMulti.includes(optKey)
                          const isRightAnswer =
                            q.type === 'single'
                              ? q.answer === optKey
                              : Array.isArray(q.answer) && q.answer.includes(optKey)

                          let itemStyle = 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-800'
                          if (isSubmitted) {
                            if (isRightAnswer) {
                              itemStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold'
                            } else if (
                              (q.type === 'single' && isSingleSelected) ||
                              (q.type === 'multiple' && Array.isArray(userAnswer) && userAnswer.includes(optKey))
                            ) {
                              itemStyle = 'border-rose-300 bg-rose-50 text-rose-900'
                            }
                          } else {
                            if (q.type === 'multiple' && isMultiChecked) {
                              itemStyle = 'border-indigo-500 bg-indigo-50 text-indigo-900 font-semibold'
                            }
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
                              className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${itemStyle}`}
                            >
                              <div
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                  isSubmitted && isRightAnswer
                                    ? 'bg-emerald-600 text-white'
                                    : isSubmitted && isSingleSelected && !isRightAnswer
                                    ? 'bg-rose-600 text-white'
                                    : q.type === 'multiple' && isMultiChecked && !isSubmitted
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {optKey}
                              </div>
                              <div className="text-xs sm:text-sm pt-0.5 leading-relaxed">{optText}</div>
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
                            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                          >
                            提交本多选题 (已选 {currentMulti.join('、') || '空'})
                          </button>
                        </div>
                      )}

                      {/* 做题结果反馈与肖秀荣名师深度解析 */}
                      {isSubmitted && (
                        <div className="rounded-2xl p-4 sm:p-5 bg-slate-50 border border-slate-200 space-y-3.5 animate-fade-in-up">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isCorrect ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold text-sm">
                                  <Check className="w-4 h-4" /> 回答正确！
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-extrabold text-sm">
                                  <X className="w-4 h-4" /> 回答错误
                                </span>
                              )}
                              <span className="font-mono text-xs text-slate-600">
                                正确答案：
                                <strong className="text-emerald-700 text-sm ml-1 font-bold">
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
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>重做此题</span>
                            </button>
                          </div>

                          {/* 核心考点卡 */}
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                            <div className="text-xs font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>【肖秀荣考点精析】{q.keyKnowledgeCard.title}</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {q.analysis.corePoint}
                            </p>
                          </div>

                          {/* 选项逐项剖析 */}
                          <div className="text-xs text-slate-600 leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200">
                            <div className="font-bold text-slate-800 mb-1">【选项剖析】</div>
                            {q.analysis.optionBreakdown}
                          </div>

                          {/* 命题陷阱排雷 */}
                          {q.analysis.pitfallWarning && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                              <strong className="text-rose-700">【命题陷阱排雷】</strong>
                              {q.analysis.pitfallWarning}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 题目底部翻页器 */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          disabled={activeQuestionIdx === 0}
                          onClick={() => setActiveQuestionIdx((i) => Math.max(0, i - 1))}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer"
                        >
                          上一题
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {activeQuestionIdx + 1} / {filteredXiaoQuestions.length}
                        </span>
                        <button
                          type="button"
                          disabled={activeQuestionIdx === filteredXiaoQuestions.length - 1}
                          onClick={() => setActiveQuestionIdx((i) => Math.min(filteredXiaoQuestions.length - 1, i + 1))}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                        >
                          下一题
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          ) : (
            <div className="bento-card rounded-3xl p-8 text-center text-slate-500 space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
              <div className="text-sm font-bold text-slate-700">未找到符合条件的题目</div>
              <button
                type="button"
                onClick={() => {
                  setXiaoSubjectFilter('all')
                  setXiaoTypeFilter('all')
                  setXiaoSearchQuery('')
                }}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                重置全部筛选条件
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: 我的政治考点收藏夹与必背口袋书
         ========================================================================= */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="bento-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <h2 className="text-sm font-extrabold text-slate-900">
                我的考点与真题收藏夹 (共 {totalFavCount} 项)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              在史纲时空轴点击“收藏考点”或在 1000 题中点击“收藏此题”，均会自动汇总至此形成你的专属必背口袋书。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 收藏的史纲核心历史考点 */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 px-1 flex items-center justify-between">
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
                  <div key={item.id} className="bento-card rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-rose-600">{item.year} 年</span>
                      <button
                        type="button"
                        onClick={() => toggleFavItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                      >
                        取消收藏
                      </button>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
                    <div className="text-xs font-bold text-indigo-700">🔑 {item.keyTag}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveYear(item.year)
                          setActiveTab('timeline')
                        }}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        在全屏时空轴中定位 →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bento-card rounded-2xl p-8 text-center text-slate-400 text-xs">
                  暂未收藏史纲考点，在“史纲时空大屏”中点击右侧“收藏考点”即可添加。
                </div>
              )}
            </div>

            {/* 收藏的肖秀荣 1000 题错题与精选真题 */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 px-1 flex items-center justify-between">
                <span>📝 已收藏的 1000 题题目 ({favoritedQuestionsList.length})</span>
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
                  <div key={q.id} className="bento-card rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600">{q.subject}</span>
                      <button
                        type="button"
                        onClick={() => toggleFavQuestion(q.id)}
                        className="text-slate-400 hover:text-rose-600 text-xs cursor-pointer"
                      >
                        取消收藏
                      </button>
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-relaxed">{q.question}</div>
                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <strong>【正确答案】：</strong>
                      <span className="font-mono font-bold text-emerald-700">
                        {Array.isArray(q.answer) ? q.answer.join('') : q.answer}
                      </span>
                      <div className="mt-1 text-slate-600">{q.analysis.corePoint}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bento-card rounded-2xl p-8 text-center text-slate-400 text-xs">
                  暂未收藏 1000 题题目，在“肖秀荣1000题”刷题界面点击右上角“收藏此题”即可归档。
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 横向易混专题对比矩阵
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
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {m.title}
              </button>
            ))}
          </div>

          {COMPARISON_MATRICES.filter((m) => m.id === activeMatrixId).map((matrix) => (
            <div key={matrix.id} className="bento-card rounded-3xl p-4 sm:p-6 overflow-hidden">
              <div className="mb-4">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">{matrix.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{matrix.subtitle}</p>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[680px] border-collapse text-left text-xs sm:text-[13px]">
                  <thead>
                    <tr className="border-y-2 border-slate-900 bg-slate-50">
                      {matrix.headers.map((h, i) => (
                        <th key={i} className="py-3 px-3.5 font-extrabold text-slate-900">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {matrix.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-indigo-50/35 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-3 px-3.5 align-top leading-relaxed ${
                              cIdx === 0
                                ? 'font-extrabold text-slate-900 whitespace-nowrap'
                                : cIdx === 1
                                ? 'font-bold text-indigo-700'
                                : cIdx === 3
                                ? 'text-rose-800 bg-rose-50/25 font-medium'
                                : 'text-slate-700'
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
    </div>
  )
}
