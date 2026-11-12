import { useState, useMemo, useEffect, useRef, type CSSProperties } from 'react'
import {
  Landmark,
  Flame,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  Table2,
  Compass,
  ListFilter,
  RotateCcw,
  Star,
} from 'lucide-react'
import {
  HISTORY_ERAS,
  CATEGORY_META,
  HISTORY_TIMELINE_ITEMS,
  COMPARISON_MATRICES,
  getYearStageContext,
  type EraKey,
  type ItemCategory,
  type HistoryItem,
} from '../data/historyTimelineData'

type ViewTab = 'timeline' | 'matrix' | 'search'
type SliderMode = 'snap' | 'continuous'
type AnniversaryMode = 'both' | '2027' | '2026'

const STORAGE_KEY_MASTERED = 'coreforge_history_mastered_v1'

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

export default function HistoryOutline() {
  const [viewTab, setViewTab] = useState<ViewTab>('timeline')
  const [sliderMode, setSliderMode] = useState<SliderMode>('snap')
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all')
  const [onlyAnniversary, setOnlyAnniversary] = useState(false)
  const [onlyPitfall, setOnlyPitfall] = useState(false)
  const [onlyUnmastered, setOnlyUnmastered] = useState(false)
  const [anniversaryMode, setAnniversaryMode] = useState<AnniversaryMode>('both')

  // 背诵自测遮罩模式与单卡揭晓状态
  const [maskMode, setMaskMode] = useState(false)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({})

  // 已掌握考点持久化
  const [masteredIds, setMasteredIds] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_MASTERED)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  // 当前选中的年份（默认定位于极具代表性的 1921 建党开天辟地，方便一进页面即刻感知）
  const [activeYear, setActiveYear] = useState<number>(1921)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showEraDetail, setShowEraDetail] = useState(false)
  const [activeMatrixId, setActiveMatrixId] = useState<string>(COMPARISON_MATRICES[0].id)
  const [searchQuery, setSearchQuery] = useState('')

  const sliderRef = useRef<HTMLInputElement | null>(null)
  const yearPillContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MASTERED, JSON.stringify(masteredIds))
    } catch {}
  }, [masteredIds])

  // 根据分类、周年、易混、未掌握筛选后的事件池
  const filteredItems = useMemo(() => {
    return HISTORY_TIMELINE_ITEMS.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
      if (onlyAnniversary && !getAnniversaryInfo(item.year, anniversaryMode).matched) return false
      if (onlyPitfall && !item.pitfall) return false
      if (onlyUnmastered && masteredIds[item.id]) return false
      return true
    })
  }, [selectedCategory, onlyAnniversary, anniversaryMode, onlyPitfall, onlyUnmastered, masteredIds])

  // 排序去重后的有效考点年份列表
  const availableYears = useMemo(() => {
    const set = new Set<number>()
    filteredItems.forEach(item => set.add(item.year))
    const list = Array.from(set).sort((a, b) => a - b)
    return list.length > 0 ? list : [1921]
  }, [filteredItems])

  // 当筛选条件变化且处于考点吸附模式时，若当前年份不在有效年份内，自动对齐到最近的考点年份
  useEffect(() => {
    if (sliderMode === 'snap' && !availableYears.includes(activeYear)) {
      const closest = availableYears.reduce((prev, curr) =>
        Math.abs(curr - activeYear) < Math.abs(prev - activeYear) ? curr : prev
      )
      setActiveYear(closest)
    }
  }, [availableYears, sliderMode, activeYear])

  // 当前年份所属历史时期
  const currentEra = useMemo(() => {
    if (activeYear < 1919) return HISTORY_ERAS[0]
    if (activeYear < 1949) return HISTORY_ERAS[1]
    if (activeYear < 1978) return HISTORY_ERAS[2]
    return HISTORY_ERAS[3]
  }, [activeYear])

  // 当前年份命中的事件列表
  const currentYearItems = useMemo(() => {
    return filteredItems.filter(item => item.year === activeYear)
  }, [filteredItems, activeYear])

  // 计算前后相邻考点年份（用于连续模式下快捷瞬移 & 左右步进按钮）
  const { prevKeyYear, nextKeyYear } = useMemo(() => {
    let prev: number | null = null
    let next: number | null = null
    for (const y of availableYears) {
      if (y < activeYear) prev = y
      if (y > activeYear && next === null) next = y
    }
    return { prevKeyYear: prev, nextKeyYear: next }
  }, [availableYears, activeYear])

  // 滑块数值计算
  const sliderMin = sliderMode === 'snap' ? 0 : 1840
  const sliderMax = sliderMode === 'snap' ? Math.max(0, availableYears.length - 1) : 2024
  const sliderValue = useMemo(() => {
    if (sliderMode === 'continuous') return activeYear
    const idx = availableYears.indexOf(activeYear)
    return idx >= 0 ? idx : 0
  }, [sliderMode, activeYear, availableYears])

  // 同步 CSS 变量给原生滑块（遵循 modern-web-guidance slider 规范，保障跨浏览器轨道进度条填充）
  const sliderStyle = useMemo((): CSSProperties => {
    return {
      '--attr-min': sliderMin,
      '--attr-max': Math.max(sliderMin + 1, sliderMax),
      '--control-value': sliderValue,
      '--slider-fill-color': currentEra.themeColor,
    } as CSSProperties
  }, [sliderMin, sliderMax, sliderValue, currentEra.themeColor])

  // 自动将底部年份胶囊滚动到可视区中心
  useEffect(() => {
    const container = yearPillContainerRef.current
    if (!container) return
    const activeBtn = container.querySelector<HTMLButtonElement>(`[data-year="${activeYear}"]`)
    if (activeBtn) {
      const targetScroll = activeBtn.offsetLeft - container.clientWidth / 2 + activeBtn.clientWidth / 2
      container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' })
    }
  }, [activeYear, viewTab])

  // 自动巡航播放定时器
  useEffect(() => {
    if (!isPlaying) return
    const timer = window.setInterval(() => {
      setActiveYear(curr => {
        const next = availableYears.find(y => y > curr)
        if (next !== undefined) return next
        setIsPlaying(false)
        return availableYears[0] ?? curr
      })
    }, 3800)
    return () => window.clearInterval(timer)
  }, [isPlaying, availableYears])

  // 键盘左右方向键快捷推进年份（当未聚焦在搜索框等输入控件时生效）
  useEffect(() => {
    if (viewTab !== 'timeline') return
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowLeft' && prevKeyYear !== null) {
        e.preventDefault()
        setActiveYear(prevKeyYear)
      } else if (e.key === 'ArrowRight' && nextKeyYear !== null) {
        e.preventDefault()
        setActiveYear(nextKeyYear)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [viewTab, prevKeyYear, nextKeyYear])

  const handleSliderChange = (rawVal: number) => {
    setIsPlaying(false)
    if (sliderMode === 'continuous') {
      setActiveYear(rawVal)
    } else {
      const targetYear = availableYears[rawVal]
      if (targetYear !== undefined) {
        setActiveYear(targetYear)
      }
    }
  }

  const jumpToEra = (eraKey: EraKey) => {
    setIsPlaying(false)
    const era = HISTORY_ERAS.find(e => e.key === eraKey)
    if (!era) return
    const firstInEra = availableYears.find(y => y >= era.startYear && y <= era.endYear)
    setActiveYear(firstInEra ?? era.startYear)
  }

  const toggleMastered = (id: string) => {
    setMasteredIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleRevealCard = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleMaskMode = () => {
    setMaskMode(prev => {
      const next = !prev
      if (next) setRevealedIds({})
      return next
    })
  }

  // 搜索页过滤结果
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return HISTORY_TIMELINE_ITEMS
    return HISTORY_TIMELINE_ITEMS.filter(item =>
      String(item.year).includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.keyTag.toLowerCase().includes(q) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      item.content.toLowerCase().includes(q) ||
      item.significance.toLowerCase().includes(q) ||
      (item.pitfall && item.pitfall.toLowerCase().includes(q))
    )
  }, [searchQuery])

  const masteredCount = useMemo(
    () => HISTORY_TIMELINE_ITEMS.filter(i => masteredIds[i.id]).length,
    [masteredIds]
  )
  const totalCount = HISTORY_TIMELINE_ITEMS.length
  const masteredPercent = Math.round((masteredCount / totalCount) * 100)

  const activeAnniversary = getAnniversaryInfo(activeYear, anniversaryMode)
  const stageContext = getYearStageContext(activeYear)

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5 animate-fade-in-up">
      {/* ── 顶部 Bento 驾驶舱标题栏 ── */}
      <section className="bento-card rounded-3xl p-4 sm:p-6 relative overflow-hidden">
        <div
          className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: currentEra.themeColor }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/80 text-2xs font-bold text-rose-700">
                <Landmark className="w-3.5 h-3.5" />
                <span>考研政治 · 史纲核心脉络</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-2xs font-bold text-amber-800">
                <Flame className="w-3 h-3 text-amber-600" />
                <span>1840–2024 共 {totalCount} 组必背史实与会议</span>
              </span>
            </div>

            <h1 className="fluid-section-title font-extrabold text-slate-900 mt-2 flex items-center gap-2">
              <span>🏛️ 中国近现代史纲要 · 交互编年时空轴</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              拖动进度条或按键盘 <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-2xs text-slate-700">←</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-2xs text-slate-700">→</kbd> 键，按年份透视重要政治会议、核心定性与单多选易混陷阱
            </p>
          </div>

          {/* 右侧掌握进度与背诵自测主开关 */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <div className="text-2xs font-semibold text-slate-500">考点掌握度</div>
                <div className="text-xs font-extrabold font-mono text-slate-900">
                  {masteredCount} / {totalCount} ({masteredPercent}%)
                </div>
              </div>
              <div className="w-14 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{ width: `${masteredPercent}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMaskMode}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 border ${
                maskMode
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
              }`}
              title="开启后自动遮挡核心定性、决议内容与历史意义，点击单张卡片即可揭晓答案"
            >
              {maskMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-indigo-600" />}
              <span>{maskMode ? '背诵遮罩已开启' : '背诵遮罩自测'}</span>
            </button>
          </div>
        </div>

        {/* 顶部三大功能视图切换条 */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3.5 border-t border-slate-200/75">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setViewTab('timeline')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                viewTab === 'timeline'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>时间轴拖动透视</span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('matrix')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                viewTab === 'matrix'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Table2 className="w-4 h-4" />
              <span>横向易混对比表</span>
              <span className="px-1.5 py-0.2 rounded-full text-2xs bg-amber-400/20 text-amber-600 font-extrabold">
                抢分
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('search')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                viewTab === 'search'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>全景关键词检索</span>
            </button>
          </div>

          {/* 逢五逢十周年命题雷达基准切换 */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">周年押题基准：</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
              {(
                [
                  { key: 'both', label: '26/27双年热点' },
                  { key: '2027', label: '2027考研' },
                  { key: '2026', label: '2026当年' },
                ] as { key: AnniversaryMode; label: string }[]
              ).map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAnniversaryMode(opt.key)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer ${
                    anniversaryMode === opt.key
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          视图一：核心时间轴进度条拖动视图 (Timeline View)
         ===================================================================== */}
      {viewTab === 'timeline' && (
        <>
          {/* ── 分类与高频属性筛选条 ── */}
          <section className="bento-card rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 mr-1 shrink-0">
                <ListFilter className="w-3.5 h-3.5" />
                <span>筛选轴线：</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                全部脉络 ({HISTORY_TIMELINE_ITEMS.length})
              </button>

              {(Object.keys(CATEGORY_META) as ItemCategory[]).map(cat => {
                const meta = CATEGORY_META[cat]
                const count = HISTORY_TIMELINE_ITEMS.filter(i => i.category === cat).length
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                    <span className="opacity-70 font-mono text-2xs">({count})</span>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOnlyAnniversary(v => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  onlyAnniversary
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-amber-50/70 text-amber-800 border-amber-200/80 hover:bg-amber-100/70'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>仅逢五逢十周年</span>
              </button>

              <button
                type="button"
                onClick={() => setOnlyPitfall(v => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  onlyPitfall
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50/70 text-rose-700 border-rose-200/80 hover:bg-rose-100/70'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>含易错陷阱</span>
              </button>

              <button
                type="button"
                onClick={() => setOnlyUnmastered(v => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  onlyUnmastered
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>待强化考点</span>
              </button>

              {(selectedCategory !== 'all' || onlyAnniversary || onlyPitfall || onlyUnmastered) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all')
                    setOnlyAnniversary(false)
                    setOnlyPitfall(false)
                    setOnlyUnmastered(false)
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  title="重置筛选条件"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重置</span>
                </button>
              )}
            </div>
          </section>

          {/* ── 核心交互式历史进度条控制台 ── */}
          <section className={`bento-card rounded-3xl p-4 sm:p-6 bg-gradient-to-br ${currentEra.bgSoftClass} transition-colors duration-500`}>
            {/* 四大历史分期一键跳转分段器 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
              {HISTORY_ERAS.map(era => {
                const isActive = currentEra.key === era.key
                return (
                  <button
                    key={era.key}
                    type="button"
                    onClick={() => jumpToEra(era.key)}
                    className={`text-left rounded-2xl p-2.5 sm:p-3 border transition-all cursor-pointer active:scale-[0.99] ${
                      isActive
                        ? 'bg-white border-slate-900/20 shadow-sm ring-2 ring-offset-1'
                        : 'bg-white/65 border-slate-200/80 hover:bg-white'
                    }`}
                    style={isActive ? ({ '--tw-ring-color': era.themeColor } as CSSProperties) : undefined}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: era.themeColor }}
                      />
                      <span className="font-mono text-2xs font-bold text-slate-400">
                        {era.startYear}–{era.key === 'reform_new_era' ? '至今' : era.endYear}
                      </span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-extrabold text-slate-900 mt-1 truncate">
                      {era.name}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* 当前年份大型仪表盘 + 播放控制 + 滑块模式切换 */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span
                  className="text-4xl sm:text-6xl font-black font-mono tracking-tight leading-none transition-colors duration-300"
                  style={{ color: currentEra.themeColor }}
                >
                  {activeYear}
                </span>
                <span className="text-base sm:text-lg font-extrabold text-slate-700">年</span>

                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${currentEra.badgeClass}`}>
                  {currentEra.name}
                </span>

                {activeAnniversary.matched && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-extrabold shadow-sm animate-pulse-soft">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{activeAnniversary.labels.join(' · ')}</span>
                  </span>
                )}
              </div>

              {/* 步进、自动巡航与拖动模式开关 */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center rounded-xl bg-white/90 border border-slate-200/90 p-0.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setSliderMode('snap')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sliderMode === 'snap'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="拖动时精准吸附在有重要考点的年份节点上，零空白年份"
                  >
                    🎯 考点吸附 ({availableYears.length}年)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSliderMode('continuous')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sliderMode === 'continuous'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="按 1840–2024 真实历史时间比例逐年连续拖动"
                  >
                    📅 全编年连续
                  </button>
                </div>

                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    disabled={prevKeyYear === null}
                    onClick={() => prevKeyYear !== null && setActiveYear(prevKeyYear)}
                    className="inline-flex items-center justify-center h-9 px-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                    title="上一个考点年份 (键盘 ←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{prevKeyYear ?? '起点'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying(p => !p)}
                    className={`inline-flex items-center gap-1 h-9 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                      isPlaying
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
                    }`}
                    title="自动按年代演进巡航复习"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? '暂停巡航' : '自动演进'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={nextKeyYear === null}
                    onClick={() => nextKeyYear !== null && setActiveYear(nextKeyYear)}
                    className="inline-flex items-center justify-center h-9 px-2.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                    title="下一个考点年份 (键盘 →)"
                  >
                    <span className="hidden sm:inline">{nextKeyYear ?? '终点'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 原生高可访问性进度条 (遵循 modern-web-guidance `slider` 标准) */}
            <div className="bg-white/90 rounded-2xl px-4 pt-3 pb-3.5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <label htmlFor="history-year-slider" className="font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                  <span>拖动历史进度条查看当年政治会议与大事记</span>
                </label>
                <span className="font-mono font-semibold text-slate-600">
                  当年收录 {currentYearItems.length} 项核心史实
                </span>
              </div>

              <input
                ref={sliderRef}
                id="history-year-slider"
                type="range"
                className="history-range-slider"
                min={sliderMin}
                max={sliderMax}
                step={1}
                value={sliderValue}
                style={sliderStyle}
                aria-valuetext={`${activeYear}年（${currentEra.name}，共${currentYearItems.length}项重要史实）`}
                onChange={e => handleSliderChange(Number(e.target.value))}
              />

              {/* 进度条刻度地标提示 */}
              <div className="flex items-center justify-between text-2xs font-mono font-semibold text-slate-400 mt-0.5 select-none">
                <span>1840 鸦片战争</span>
                <span className="hidden sm:inline">1919 五四运动</span>
                <span>1921 中共成立</span>
                <span className="hidden md:inline">1935 遵义会议</span>
                <span>1949 新中国成立</span>
                <span className="hidden sm:inline">1978 改革开放</span>
                <span>2024 二十届三中</span>
              </div>

              {/* 黄金考点年份热力胶囊尺（支持点击直达任意年份，柱高代表当年考点密集度） */}
              <div
                ref={yearPillContainerRef}
                className="flex items-end gap-1.5 overflow-x-auto no-scrollbar pt-3 mt-2.5 border-t border-slate-100"
                aria-label="考点年份快捷跳转刻度栏"
              >
                {availableYears.map(yr => {
                  const isCurr = yr === activeYear
                  const yrItems = filteredItems.filter(i => i.year === yr)
                  const anniv = getAnniversaryInfo(yr, anniversaryMode)
                  const hasMeeting = yrItems.some(i => i.category === 'meeting')
                  const barHeight = Math.min(22, 8 + yrItems.length * 6)

                  return (
                    <button
                      key={yr}
                      type="button"
                      data-year={yr}
                      onClick={() => {
                        setIsPlaying(false)
                        setActiveYear(yr)
                      }}
                      className={`group flex flex-col items-center px-2 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer active:scale-95 ${
                        isCurr
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50/90 text-slate-600 border-slate-200/75 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-end gap-0.5 h-5 mb-1">
                        <span
                          className={`w-1.5 rounded-full transition-all ${
                            isCurr
                              ? 'bg-amber-400'
                              : hasMeeting
                              ? 'bg-rose-400 group-hover:bg-rose-500'
                              : 'bg-indigo-300 group-hover:bg-indigo-500'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        />
                        {anniv.matched && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mb-0.5" title={anniv.labels.join(' ')} />
                        )}
                      </div>
                      <span className="font-mono text-xs font-bold leading-none">{yr}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 当前时期社会主要矛盾与历史任务折叠导读 */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="text-slate-600">
                <span className="font-bold text-slate-800">阶段背景：</span>
                <span>{stageContext.stageTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEraDetail(v => !v)}
                className="inline-flex items-center gap-1 text-indigo-700 font-bold hover:underline cursor-pointer self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showEraDetail ? '收起本时期主要矛盾与总任务' : '查看本时期社会主要矛盾与历史任务'}</span>
              </button>
            </div>

            {showEraDetail && (
              <div className="mt-2.5 grid md:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 text-xs leading-relaxed animate-fade-in-up">
                <div>
                  <div className="font-extrabold text-slate-900 mb-1">📌 本时期社会主要矛盾</div>
                  <p className="text-slate-600">{currentEra.coreContradiction}</p>
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 mb-1">🎯 本时期核心历史任务</div>
                  <p className="text-slate-600">{currentEra.historicalTask}</p>
                </div>
              </div>
            )}
          </section>

          {/* ── 当年重要历史事件与政治会议详情区 ── */}
          <section className="space-y-4">
            {currentYearItems.length > 0 ? (
              currentYearItems.map(item => {
                const catMeta = CATEGORY_META[item.category]
                const isMastered = Boolean(masteredIds[item.id])
                const isHiddenByMask = maskMode && !revealedIds[item.id]
                const itemAnniv = getAnniversaryInfo(item.year, anniversaryMode)

                return (
                  <article
                    key={item.id}
                    className={`bento-card bento-card-hover rounded-3xl p-4 sm:p-6 border-l-4 transition-all ${
                      isMastered ? 'opacity-90' : ''
                    }`}
                    style={{ borderLeftColor: currentEra.themeColor }}
                  >
                    {/* 卡片头部元信息 */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${catMeta.badge}`}>
                            <span>{catMeta.emoji}</span>
                            <span>{catMeta.label}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{item.date}</span>
                          </span>

                          {item.location && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2.5 py-0.5 rounded-full">
                              <MapPin className="w-3 h-3 text-indigo-600" />
                              <span>{item.location}</span>
                            </span>
                          )}

                          {item.importance === 5 && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 fill-rose-600 text-rose-600" />
                              <span>必背超核心</span>
                            </span>
                          )}

                          {itemAnniv.matched && (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-800 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full">
                              <Flame className="w-3 h-3 text-amber-600" />
                              <span>{itemAnniv.labels.join(' / ')}</span>
                            </span>
                          )}
                        </div>

                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                          {item.title}
                        </h2>
                      </div>

                      {/* 卡片右侧操作：揭晓遮罩 / 标记掌握 */}
                      <div className="flex items-center gap-2 shrink-0">
                        {maskMode && (
                          <button
                            type="button"
                            onClick={() => toggleRevealCard(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
                          >
                            {revealedIds[item.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{revealedIds[item.id] ? '重新遮挡' : '揭晓答案'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleMastered(item.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                            isMastered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{isMastered ? '已掌握' : '标记掌握'}</span>
                        </button>
                      </div>
                    </div>

                    {/* 背诵遮罩自测交互区 vs 完整考点解析区 */}
                    {isHiddenByMask ? (
                      <button
                        type="button"
                        onClick={() => toggleRevealCard(item.id)}
                        className="mt-4 w-full text-left rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/80 p-5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5">
                              <Eye className="w-4 h-4" />
                              <span>主动回忆自测中（先在脑海中默背，再点击揭晓核对）</span>
                            </div>
                            <p className="text-xs text-slate-600">
                              请回忆：① 该事件/会议的<strong>一字千金定性（首次/标志/转折）</strong>是什么？② 核心决议或文献主张是什么？③ 有哪些常考干扰项？
                            </p>
                          </div>
                          <span className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
                            点击揭晓
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="mt-4 space-y-3.5 animate-fade-in-up">
                        {/* 一字千金定性横幅 */}
                        <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-xs">
                          <span className="text-amber-400">🔑 核心定性：</span>
                          <span>{item.keyTag}</span>
                        </div>

                        {/* 核心内容与历史意义双栏卡片 */}
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3.5 sm:p-4">
                            <div className="text-xs font-extrabold text-slate-800 mb-1.5 flex items-center gap-1.5">
                              <span>📋 核心内容 / 会议决议</span>
                            </div>
                            <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed">
                              {item.content}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-indigo-50/45 border border-indigo-200/70 p-3.5 sm:p-4">
                            <div className="text-xs font-extrabold text-indigo-950 mb-1.5 flex items-center gap-1.5">
                              <span>🌟 考研标准历史意义与地位</span>
                            </div>
                            <p className="text-xs sm:text-[13.5px] text-slate-700 leading-relaxed">
                              {item.significance}
                            </p>
                          </div>
                        </div>

                        {/* 命题陷阱与易混辨析红框警示 */}
                        {item.pitfall && (
                          <div className="rounded-2xl bg-rose-50/80 border border-rose-200/90 p-3.5 sm:p-4 flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div className="text-xs sm:text-[13px] text-rose-950 leading-relaxed">
                              <span className="font-extrabold text-rose-700">命题陷阱与易混辨析：</span>
                              <span>{item.pitfall}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                )
              })
            ) : (
              /* 全编年连续模式下，拖到非独立必考年份时的阶段导读与瞬移卡片 */
              <div className="bento-card rounded-3xl p-6 sm:p-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 text-xl font-mono font-bold">
                  {activeYear}
                </div>
                <div className="max-w-xl mx-auto space-y-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {activeYear} 年处于「{stageContext.stageTitle}」
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {stageContext.summary}
                  </p>
                  <p className="text-xs text-slate-400">
                    （当前筛选条件下该年份无单独拆分的大纲必背条目，可一键跳转前后相邻黄金考点年份，或切回「🎯 考点吸附」模式）
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {prevKeyYear !== null && (
                    <button
                      type="button"
                      onClick={() => setActiveYear(prevKeyYear)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>跳至上一考点：{prevKeyYear} 年</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSliderMode('snap')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-indigo-600 cursor-pointer"
                  >
                    <span>🎯 开启考点吸附模式</span>
                  </button>
                  {nextKeyYear !== null && (
                    <button
                      type="button"
                      onClick={() => setActiveYear(nextKeyYear)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <span>跳至下一考点：{nextKeyYear} 年</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* =====================================================================
          视图二：横向易混专题对比矩阵 (Comparison Matrix View)
         ===================================================================== */}
      {viewTab === 'matrix' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {COMPARISON_MATRICES.map(m => (
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

          {COMPARISON_MATRICES.filter(m => m.id === activeMatrixId).map(matrix => (
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
                            {maskMode && cIdx >= 2 ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-200/80 text-slate-500 text-xs select-none">
                                已开启背诵遮罩（关闭顶部遮罩即可核对）
                              </span>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* =====================================================================
          视图三：全景关键词检索与一键定位时间轴 (Search View)
         ===================================================================== */}
      {viewTab === 'search' && (
        <section className="space-y-4">
          <div className="bento-card rounded-2xl p-3.5 sm:p-4 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="输入会议名称、年份、地点或定性词（如：遵义、西柏坡、首次提出、土地、转折、马克思主义中国化）..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
              >
                清空
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 px-1">
            共检索到 <span className="font-bold text-slate-900">{searchResults.length}</span> 条史纲考点，点击任意条目可直接定位至时间轴对应年份：
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {searchResults.map((item: HistoryItem) => {
              const catMeta = CATEGORY_META[item.category]
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all')
                    setOnlyAnniversary(false)
                    setOnlyPitfall(false)
                    setOnlyUnmastered(false)
                    setActiveYear(item.year)
                    setViewTab('timeline')
                  }}
                  className="bento-card bento-card-hover text-left rounded-2xl p-4 flex flex-col justify-between gap-2.5 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-sm font-black text-rose-600">{item.year} 年</span>
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-bold border ${catMeta.badge}`}>
                        {catMeta.emoji} {catMeta.label}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
                    <p className="text-xs font-bold text-indigo-700 mt-1">🔑 {item.keyTag}</p>
                  </div>
                  <div className="flex items-center justify-between text-2xs text-slate-400 pt-2 border-t border-slate-100">
                    <span>{item.location ? `📍 ${item.location}` : item.date}</span>
                    <span className="text-indigo-600 font-bold">定位到时间轴 →</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
