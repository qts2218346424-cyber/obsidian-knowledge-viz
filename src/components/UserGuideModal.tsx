import { createPortal } from 'react-dom'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  Play,
  Pause,
  Sparkles,
  Network,
  ClipboardList,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Compass,
  ArrowRight,
  Search,
  Flame,
  ShieldAlert,
  FileEdit,
  Palette,
  PenTool,
  PenLine,
  AlertTriangle,
  BookOpen,
  Landmark,
  Cpu,
  Music,
  Timer,
  Highlighter,
  Bot,
  Smile,
  Workflow,
  Smartphone,
  HelpCircle,
  Lightbulb,
  Zap,
  LayoutGrid,
  Languages,
  MapPin,
  ChevronsDownUp,
} from 'lucide-react'
import {
  FEATURE_MANUAL_DATA,
  MANUAL_CATEGORIES,
  QUICK_SCENARIO_GUIDES,
} from '../data/featureManualData'

interface UserGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStartInteractiveTour?: () => void
  initialTab?: 'tour' | 'doc'
  initialCategory?: string
  initialFeatureId?: string
}

interface TourScene {
  id: number
  title: string
  subtitle: string
  badge: string
  icon: any
  colorText: string
  colorBg: string
  colorBorder: string
  description: string
  highlights: string[]
  route: string
  routeText: string
}

// 6 幕功能巡礼：用通俗语言快速了解系统怎么帮你复习
const TOUR_SCENES: TourScene[] = [
  {
    id: 1,
    title: '一站式考研工作台 · 学、练、记全部打通',
    subtitle: '408 专业课 + 数学 + 英语 + 政治，一个地方就能搞定',
    badge: '总体介绍',
    icon: Sparkles,
    colorText: 'text-indigo-600',
    colorBg: 'bg-indigo-50/80',
    colorBorder: 'border-indigo-200/80',
    description:
      '很多同学资料在网盘、错题在纸上、笔记在软件里，找起来特别散。这里把你的笔记、真题试卷、错题本、背诵卡片和 AI 老师放到了一起，学完马上就能练，错题自动攒成专属巩固本。',
    highlights: [
      '首页直接看初试倒计时、今日复习提醒和四门科目直达入口',
      '所有笔记纯文本保存在本地，不用担心格式锁定或找不到原文件',
      '电脑上做的笔记和刷题记录，手机扫码打开也能同步接着学',
    ],
    route: '/dashboard',
    routeText: '回首页工作台',
  },
  {
    id: 2,
    title: '刷题中心 · 真题整卷、题型专项与错题本',
    subtitle: '右边就是答题卡和草稿纸，做错自动记到错题本',
    badge: '刷题中心 /quiz',
    icon: ClipboardList,
    colorText: 'text-amber-600',
    colorBg: 'bg-amber-50/80',
    colorBorder: 'border-amber-200/80',
    description:
      '点开顶部「刷题中心」，可以根据当前复习阶段自由选择：想成套限时模拟就选「真题整卷」；想专题打基础就选「题型专项」；想随便抽几题测验就选「自由组卷」。交卷后错题会自动收入「错题本」。',
    highlights: [
      '右侧自带答题卡矩阵，点一下题号就能跳过去，标星后交卷前方便复查',
      '旁边就是屏幕草稿纸，用鼠标或手写笔随时打草稿，还能一键查常用定理',
      '做题遇到卡壳？点题目旁的「追问 AI」，导师会针对这道题手把手给你讲明白',
    ],
    route: '/quiz',
    routeText: '进入刷题中心',
  },
  {
    id: 3,
    title: '考点掌握热力图 · 一眼看出哪里没学透',
    subtitle: '绿稳黄一般红报警 · 点开薄弱点直接急救 5 题',
    badge: '热力图 /graph',
    icon: Flame,
    colorText: 'text-rose-600',
    colorBg: 'bg-rose-50/80',
    colorBorder: 'border-rose-200/80',
    description:
      '系统会根据你的刷题对错和闪卡情况，在「热力色谱图」把知识点涂成绿、黄、红三种颜色。看到闪烁红光的圆点别慌，直接点它就会弹出「提分急救舱」，顺着看历史错题、看动画课件，再练 5 道同类题把它救绿！',
    highlights: [
      '绿色 (≥80%) 代表稳了，黄色 (50%~80%) 需要巩固，红色 (<50%) 要优先抢救',
      '急救舱里整合了错题记录、配套仿真课件和 5 题靶向小测',
      '也可去「研学中心 → 考点色谱」按 11 级灰阶/紫阶梯队挨个攻克核心专题',
    ],
    route: '/graph',
    routeText: '查看考点热力图',
  },
  {
    id: 4,
    title: '研学中心 · 讲义、仿真动画课件与记忆闪卡',
    subtitle: '看动画学懂红黑树/页面置换，用闪卡在快忘时提醒复习',
    badge: '研学中心 /study',
    icon: GraduationCap,
    colorText: 'text-teal-600',
    colorBg: 'bg-teal-50/80',
    colorBorder: 'border-teal-200/80',
    description:
      '「研学中心」把核心讲义、PDF 教材、仿真课件、记忆闪卡和学习进度放在同一个工作台里。难懂的 408 算法可以看单步动画推演；容易忘的公式和概念交给记忆闪卡，快忘的时候系统会自动推给你复习。',
    highlights: [
      '仿真课件支持「上一步 / 下一步 / 自己输入数据」，看清算法每一步怎么变',
      '记忆闪卡点一下「忘记 / 模糊 / 记得」，记不牢的会自动安排更频繁复盘',
      '看讲义或 PDF 时，点右上角「记批注」就能直接在屏幕上涂写勾重点',
    ],
    route: '/study',
    routeText: '打开研学中心',
  },
  {
    id: 5,
    title: '笔记系统与随手记 · 知识大脑全天候沉淀',
    subtitle: '优先预览 · 富文本与源码打字 · 多级目录分类 · Obsidian 双向同步',
    badge: '笔记系统 /editor',
    icon: PenLine,
    colorText: 'text-emerald-600',
    colorBg: 'bg-emerald-50/80',
    colorBorder: 'border-emerald-200/80',
    description:
      '点击目录里的笔记默认优先进入纯净预览模式，防误触改乱；需要编辑时点击右上角一键切换写作模式，支持富文本直观打字或 Markdown 源码编辑。随时随地新建多级分类目录、指定目录新建笔记，还支持 LaTeX 数学公式、截图粘贴、随页手写批注及与本地 Obsidian 实时同步！',
    highlights: [
      '支持随时新建单级/多级目录，新建笔记可在标题下方自由指定保存目录或套用模版',
      '写作模式支持富文本（像 Word 一样流畅打字）和源码双模式无缝切换，支持 Ctrl+V 粘贴截图与 Σ 公式速插',
      '写完总结可点「即学即练」现场生成 3 道真题测验，也能点页面内「💡 笔记导览」手把手体验',
    ],
    route: '/editor',
    routeText: '打开笔记编辑器',
  },
  {
    id: 6,
    title: 'AI 伴学导师、白噪音与番茄专注',
    subtitle: '24 小时随时问大题推导，开着白噪音专心学不被打断',
    badge: 'AI 与专注',
    icon: Bot,
    colorText: 'text-purple-600',
    colorBg: 'bg-purple-50/80',
    colorBorder: 'border-purple-200/80',
    description:
      '遇到看不懂的定理证明或 408 代码题，随时按 Ctrl+Shift+A（或点顶部「AI 伴学」）问导师，支持直接把解答存进笔记。学习前打开「白噪音」挑个自习室雨声或电台，切去刷题、背单词声音依然不断线。',
    highlights: [
      'AI 伴学不仅给答案，更按“结论 + 分步推导 + 避坑提示”帮你理顺思路',
      '右下角伴学小萌宠能帮忙整理笔记大纲、查找错题和梳理目录',
      '支持在右上角一键切换 极简、鲜艳、护眼、暗黑 4 种舒服的界面风格',
    ],
    route: '/chat',
    routeText: '体验 AI 伴学',
  },
]

export default function UserGuideModal({
  isOpen,
  onClose,
  onStartInteractiveTour,
  initialTab = 'tour',
  initialCategory,
  initialFeatureId,
}: UserGuideModalProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'tour' | 'doc'>(initialTab)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  // 手册搜索与筛选状态
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (initialFeatureId) return new Set([initialFeatureId])
    // 默认展开第一条高频功能，方便新手打开就能直接看到示范卡片
    return new Set([FEATURE_MANUAL_DATA[0]?.id].filter(Boolean))
  })

  // 响应外部属性变化
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
    if (initialCategory) setSelectedCategory(initialCategory)
    if (initialFeatureId) {
      setExpandedIds(new Set([initialFeatureId]))
      setActiveTab('doc')
    }
  }, [initialTab, initialCategory, initialFeatureId])

  // 自动轮播定时器
  useEffect(() => {
    if (!isOpen || !isPlaying || activeTab !== 'tour') return
    const timer = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % TOUR_SCENES.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [isOpen, isPlaying, activeTab])

  // 过滤后的手册条目列表
  const filteredManualItems = useMemo(() => {
    return FEATURE_MANUAL_DATA.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory
      if (!matchCategory) return false

      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      return (
        item.name.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.whereToFind.toLowerCase().includes(q) ||
        item.problemSolved.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.howToUse.some((step) => step.toLowerCase().includes(q)) ||
        item.proTips.some((tip) => tip.toLowerCase().includes(q))
      )
    })
  }, [selectedCategory, searchQuery])

  if (!isOpen) return null

  const scene = TOUR_SCENES[currentSceneIndex]

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('coreforge_onboarding_dismissed', 'true')
      } catch {}
    }
    onClose()
  }

  const handleSkipTour = () => {
    try {
      localStorage.setItem('coreforge_onboarding_dismissed', 'true')
      localStorage.setItem('coreforge_tour_skipped', 'true')
    } catch {}
    onClose()
  }

  const handleStartTour = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('coreforge_onboarding_dismissed', 'true')
      } catch {}
    }
    onClose()
    if (onStartInteractiveTour) {
      onStartInteractiveTour()
    } else {
      window.dispatchEvent(new CustomEvent('start-interactive-tour'))
    }
  }

  const handleNavigate = (path: string) => {
    handleClose()
    navigate(path)
  }

  const handleOpenDocInEditor = () => {
    handleClose()
    navigate('/editor?file=💡 新手指引 · CoreForge 研核完全使用手册.md')
  }

  const toggleExpandItem = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allExpanded =
    filteredManualItems.length > 0 &&
    filteredManualItems.every((item) => expandedIds.has(item.id))

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(filteredManualItems.map((i) => i.id)))
    }
  }

  // 动态渲染功能手册图标
  const renderItemIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Flame': return <Flame className={className} />
      case 'Network': return <Network className={className} />
      case 'ShieldAlert': return <ShieldAlert className={className} />
      case 'Sparkles': return <Sparkles className={className} />
      case 'FileEdit': return <FileEdit className={className} />
      case 'Palette': return <Palette className={className} />
      case 'PenTool': return <PenTool className={className} />
      case 'PenLine': return <PenLine className={className} />
      case 'AlertTriangle': return <AlertTriangle className={className} />
      case 'GraduationCap': return <GraduationCap className={className} />
      case 'BookOpen': return <BookOpen className={className} />
      case 'Landmark': return <Landmark className={className} />
      case 'Cpu': return <Cpu className={className} />
      case 'Music': return <Music className={className} />
      case 'Timer': return <Timer className={className} />
      case 'Highlighter': return <Highlighter className={className} />
      case 'Bot': return <Bot className={className} />
      case 'Smile': return <Smile className={className} />
      case 'Workflow': return <Workflow className={className} />
      case 'Search': return <Search className={className} />
      case 'ShieldCheck': return <ShieldCheck className={className} />
      case 'Smartphone': return <Smartphone className={className} />
      case 'Zap': return <Zap className={className} />
      case 'ClipboardList': return <ClipboardList className={className} />
      case 'LayoutGrid': return <LayoutGrid className={className} />
      case 'Languages': return <Languages className={className} />
      default: return <Sparkles className={className} />
    }
  }

  // 徽章颜色映射
  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'teal': return 'bg-teal-50 text-teal-700 border-teal-200'
      case 'cyan': return 'bg-cyan-50 text-cyan-700 border-cyan-200'
      case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-5 bg-black/45 backdrop-blur-sm animate-fade-in font-sans"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col max-h-[92dvh] text-slate-900"
      >
        {/* 顶部标题栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4 bg-white/95 shrink-0">
          <div className="flex items-center justify-between gap-2.5 min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 p-2 text-white shadow-xs">
                <Compass className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                    研核使用手册与新手导览
                  </h3>
                  <span className="hidden md:inline-flex px-2 py-0.5 text-2xs font-semibold rounded-md bg-slate-100 text-slate-600 border border-slate-200/70 shrink-0">
                    共 {FEATURE_MANUAL_DATA.length} 项功能说明
                  </span>
                </div>
                <p className="text-2xs sm:text-xs text-slate-500 line-clamp-1 mt-0.5">
                  哪里找不到功能、不确定怎么操作，在这里一看就懂
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="关闭"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            {/* 标签切换 */}
            <div className="flex w-full sm:w-auto p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('tour')}
                className={`flex-1 sm:flex-initial whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'tour'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                1 分钟快速看懂
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('doc')}
                className={`flex-1 sm:flex-initial whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'doc'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                全功能使用手册
              </button>
            </div>

            <button
              onClick={handleClose}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 主体内容区 */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === 'tour' ? (
            <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5">
              {/* 6 幕概览轮播卡 */}
              <div className="relative rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-6 overflow-hidden transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs sm:text-xs font-bold border ${scene.colorBg} ${scene.colorBorder} ${scene.colorText} whitespace-nowrap`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>
                      第 {scene.id}/{TOUR_SCENES.length} 幕 · {scene.badge}
                    </span>
                  </span>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-2xs sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-xs shrink-0"
                    title={isPlaying ? '暂停自动轮播' : '继续自动轮播'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3 w-3 shrink-0" />
                        <span>自动轮播中</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 shrink-0" />
                        <span>已暂停</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 展示正文 */}
                <div className="my-4 sm:my-5 relative z-10 max-w-3xl">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`p-1.5 rounded-xl border ${scene.colorBg} ${scene.colorBorder} ${scene.colorText} shadow-xs shrink-0`}
                    >
                      <scene.icon className="h-4 w-4" />
                    </span>
                    <h4 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                      {scene.title}
                    </h4>
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm font-semibold text-slate-600">
                    {scene.subtitle}
                  </p>
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    {scene.description}
                  </p>

                  <div className="mt-3.5 space-y-1.5">
                    {scene.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 底部切换指示条与跳转体验 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-200/80 relative z-10">
                  <div className="flex items-center gap-1.5">
                    {TOUR_SCENES.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setCurrentSceneIndex(idx)
                          setIsPlaying(false)
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentSceneIndex
                            ? 'w-6 bg-slate-900'
                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                        }`}
                        title={s.title}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setActiveTab('doc')}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all cursor-pointer"
                    >
                      <span>看详细图文手册</span>
                    </button>
                    <button
                      onClick={() => handleNavigate(scene.route)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300/80 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>{scene.routeText}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 1 分钟按场景找功能 */}
              <div>
                <div className="text-xs font-bold text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-indigo-600" />
                  <span>按想法直达 · 我现在想做什么就点哪里</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  {QUICK_SCENARIO_GUIDES.map((sc) => {
                    const badgeClass = getBadgeStyle(sc.color)
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => sc.route && handleNavigate(sc.route)}
                        className="p-3 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group text-left flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className={`p-1.5 rounded-lg border ${badgeClass}`}>
                              {renderItemIcon(sc.iconName, 'w-3.5 h-3.5')}
                            </span>
                            <span className="text-2xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                              <span>{sc.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                          <h6 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {sc.title}
                          </h6>
                          <p className="mt-1 text-2xs text-slate-500 leading-relaxed">
                            {sc.subtitle}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* 全功能使用手册字典 Tab */
            <div className="p-3.5 sm:p-6 space-y-4">
              {/* 顶部搜索与全部展开控制 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜一搜功能名称或问题（如：考点色谱、词汇色谱、错题本、热力图、背单词...）"
                    className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={toggleExpandAll}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
                  >
                    <ChevronsDownUp className="h-3.5 w-3.5 text-slate-500" />
                    <span>{allExpanded ? '全部收起' : '全部展开'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenDocInEditor}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 px-3 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    title="在笔记编辑器中打开完整 Markdown 手册"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">编辑器打开文档</span>
                    <span className="sm:hidden">原文档</span>
                  </button>
                </div>
              </div>

              {/* 分类标签栏 */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {MANUAL_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.key
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                      }`}
                    >
                      {renderItemIcon(cat.iconName, `w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`)}
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* 手册条目列表 */}
              <div className="space-y-3">
                {filteredManualItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    没有找到与「{searchQuery}」相关的说明，可以换个词试试或点右侧清空搜索。
                  </div>
                ) : (
                  filteredManualItems.map((item) => {
                    const isExpanded = expandedIds.has(item.id)
                    const badgeClass = getBadgeStyle(item.color)

                    return (
                      <div
                        key={item.id}
                        id={`manual-${item.id}`}
                        className={`rounded-2xl border transition-all duration-200 bg-white ${
                          isExpanded
                            ? 'border-slate-900/35 shadow-sm ring-1 ring-slate-900/10'
                            : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        {/* 卡片头部 */}
                        <div
                          onClick={() => toggleExpandItem(item.id)}
                          className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer select-none"
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-xl border shrink-0 ${badgeClass}`}>
                              {renderItemIcon(item.iconName)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                  {item.name}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-2xs font-bold border ${badgeClass}`}
                                >
                                  {item.badge}
                                </span>
                                {item.shortcuts?.map((sc, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-2xs font-mono text-slate-600"
                                  >
                                    {sc}
                                  </span>
                                ))}
                              </div>
                              <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                                {item.summary}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {item.route && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNavigate(item.route!)
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <span>{item.routeText || '前往体验'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              aria-label={isExpanded ? '收起说明' : '展开说明'}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                            >
                              <ChevronRight
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* 展开的通俗操作指南 */}
                        {isExpanded && (
                          <div className="px-3.5 pb-4 sm:px-5 sm:pb-5 border-t border-slate-100 space-y-3.5 pt-3.5 text-xs text-slate-700">
                            {/* 在哪找到它 */}
                            <div className="px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-200/70 text-indigo-900 flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">入口位置：</span>
                                <span>{item.whereToFind}</span>
                              </div>
                            </div>

                            {/* 什么时候用 / 解决什么麻烦 */}
                            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-amber-900 flex items-start gap-2.5">
                              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-2xs block text-amber-800">
                                  什么时候适合用它：
                                </span>
                                <p className="mt-0.5 leading-relaxed">{item.problemSolved}</p>
                              </div>
                            </div>

                            {/* 一步步怎么操作 */}
                            <div>
                              <div className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>一步步怎么操作：</span>
                              </div>
                              <div className="space-y-2 pl-0.5">
                                {item.howToUse.map((step, idx) => (
                                  <div key={idx} className="flex items-start gap-2 leading-relaxed whitespace-pre-line">
                                    <span className="h-4.5 w-4.5 rounded-full bg-slate-900 text-white font-bold text-2xs flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 实用小技巧 */}
                            {item.proTips.length > 0 && (
                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5 text-2xs">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>顺手提效小窍门：</span>
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed pl-0.5">
                                  {item.proTips.map((tip, idx) => (
                                    <li key={idx}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="border-t border-slate-100 px-4 sm:px-6 py-3 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs shrink-0">
          <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
            />
            <span>以后不再自动弹出（随时可在顶部「使用手册」再打开）</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSkipTour}
              className="px-3 py-1.5 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
            >
              关闭
            </button>

            <button
              onClick={handleStartTour}
              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Compass className="h-3.5 w-3.5 text-amber-400" />
              <span>开启手把手细致导览</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
