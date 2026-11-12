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
  Keyboard,
  Sliders,
} from 'lucide-react'
import {
  FEATURE_MANUAL_DATA,
  MANUAL_CATEGORIES,
  type FeatureManualItem,
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

// 扩充后的全景 6 幕巡礼场景：强化考点掌握度色谱图、极速随手记等小功能体验
const TOUR_SCENES: TourScene[] = [
  {
    id: 1,
    title: '为什么是 CoreForge 研核？',
    subtitle: '408 计算机综合 + 考研数学 · 智能双核研学体系',
    badge: '初衷与定位',
    icon: Sparkles,
    colorText: 'text-indigo-600',
    colorBg: 'bg-indigo-50/80',
    colorBorder: 'border-indigo-200/80',
    description:
      '考研并非孤立的背题过程。CoreForge 将您的本地 Obsidian Markdown 知识库与全真历年真题库无缝联结，打破笔记与刷题的物理隔阂，构建网状拓扑知识体系。',
    highlights: [
      '双核联动：深度适配 408 计组/操作系统/计网/数据结构与高数/线代/概率论',
      '本地优先：纯本地 Markdown 存储，永不被任何第三方云端格式绑架',
      '多端协同：支持局域网多设备、平板与手机浏览器即插即用协同复习',
    ],
    route: '/dashboard',
    routeText: '查看备考驾驶舱',
  },
  {
    id: 2,
    title: '考点掌握度色谱图与提分急救舱',
    subtitle: '红黄绿三色热力透视 · 呼吸光晕锁定高危考点',
    badge: '掌握度色谱 /graph',
    icon: Flame,
    colorText: 'text-rose-600',
    colorBg: 'bg-rose-50/80',
    colorBorder: 'border-rose-200/80',
    description:
      '将抽象考纲转化为直观掌握度热力色谱。绿色稳固(≥80%)、黄色巩固(50%~80%)、红色高危薄弱(<50%)带呼吸脉冲闪烁。单击红色薄弱考点直达提分急救舱，5题速测与仿真课件立即可用。',
    highlights: [
      '动态三色色谱：客观感知薄弱盲区，告别“以为自己掌握了”的复习盲目感',
      '提分急救舱：一键定位关联错题记录并抽取同考点精选变式题',
      '算法仿真联动：配套红黑树、LRU页面置换、TCP握手等动态步进课件',
    ],
    route: '/graph',
    routeText: '体验掌握度色谱图',
  },
  {
    id: 3,
    title: '极速随手记与沉浸式笔记',
    subtitle: '随时随地顶栏滑出 · 碎片推导灵感0中断入库',
    badge: '随手记抽屉 ⚡',
    icon: Sparkles,
    colorText: 'text-emerald-600',
    colorBg: 'bg-emerald-50/80',
    colorBorder: 'border-emerald-200/80',
    description:
      '在做题或研读讲义时，无需跳转页面，随时点击顶栏随手记胶囊即可滑出抽屉。预设多学科标签，支持 LaTeX 公式与拍照上传，一键保存到个人笔记库。',
    highlights: [
      '0 中断心流：顶栏一键呼出，做题草稿、考点灵感与闪念随手保存',
      '双链与标签：自动按日期归档至随手记目录，并自动纳入全库双链网络',
      '多端插图：支持本地截图与手机扫码拍照直传，自动生成 Markdown 语法',
    ],
    route: '/editor',
    routeText: '查看笔记编辑器',
  },
  {
    id: 4,
    title: '全真做题、答题卡调色板与错题归因',
    subtitle: 'LeetCode 风格色板矩阵 · 分步解析与真题收录',
    badge: '刷题中心 /quiz',
    icon: ClipboardList,
    colorText: 'text-amber-600',
    colorBg: 'bg-amber-50/80',
    colorBorder: 'border-amber-200/80',
    description:
      '内置历年 408 统考真题与考研数学精选题库，支持高质量 KaTeX 公式渲染。右侧答题卡调色板矩阵直观显示已答、未答与标记状态，做题草稿纸随时推演。',
    highlights: [
      '答题卡矩阵调色板：题号色彩实时区分作答状态，一键平滑跳转题号',
      '做题草稿板 (Scratchpad)：压感草稿纸，随时演算微积分或二进制推导',
      '多维错因归因：概念混淆、计算失误、审题疏漏分类沉淀并推荐变式题',
    ],
    route: '/quiz',
    routeText: '进入真题刷题中心',
  },
  {
    id: 5,
    title: '全库双链网络图谱与盲区雷达',
    subtitle: '从宏观上帝视角透视全科目考点联系',
    badge: '知识图谱 /graph',
    icon: Network,
    colorText: 'text-purple-600',
    colorBg: 'bg-purple-50/80',
    colorBorder: 'border-purple-200/80',
    description:
      '基于 D3 力导向物理引擎，自动提取所有笔记的双链（[[链接]]）与标签体系。直观识别高频枢纽核心概念，实时排查无连接的孤立节点（Orphan Notes）。',
    highlights: [
      '动态拓扑漫游：自由缩放拖拽知识网络，感受考点之间的脉络互联',
      '孤立笔记雷达：红绿警示快速发现未建立关联的遗漏死角，二轮复盘神器',
      '属性检查器：双击节点右侧滑出抽屉，实时阅读笔记 Markdown 正文与大纲',
    ],
    route: '/graph',
    routeText: '打开双链图谱',
  },
  {
    id: 6,
    title: 'SM-2 艾宾浩斯闪卡与科学抗遗忘',
    subtitle: '在临界点抗遗忘巩固 · 智能多 Agent 导师伴学',
    badge: '学习中心 /study',
    icon: ShieldCheck,
    colorText: 'text-teal-600',
    colorBg: 'bg-teal-50/80',
    colorBorder: 'border-teal-200/80',
    description:
      '内置基于认知心理学的 SM-2 间隔重复算法，在即将遗忘的黄金临界点自动推送复习。全站按下 Ctrl+Shift+A 随时召唤 AI 伴学导师，解答复杂大题推导。',
    highlights: [
      'SM-2 记忆曲线：自适应评估掌握度，高频核心概念定理永不生疏',
      'AI 导师随时召唤：Ctrl+Shift+A 快捷呼出，结合本地笔记给出严谨证明步骤',
      '伴学萌宠与专属 Skills：右下角常驻奶龙/小猫伙伴，自主执行笔记治理与大纲重构',
    ],
    route: '/study',
    routeText: '体验艾宾浩斯闪卡',
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
  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(initialFeatureId || null)

  // 响应外部属性变化
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
    if (initialCategory) setSelectedCategory(initialCategory)
    if (initialFeatureId) {
      setExpandedFeatureId(initialFeatureId)
      setActiveTab('doc')
    }
  }, [initialTab, initialCategory, initialFeatureId])

  // 视频/巡礼自动轮播定时器
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

  // 动态渲染功能手册图标
  const renderItemIcon = (iconName: string) => {
    const iconClass = 'w-4 h-4'
    switch (iconName) {
      case 'Flame': return <Flame className={iconClass} />
      case 'Network': return <Network className={iconClass} />
      case 'ShieldAlert': return <ShieldAlert className={iconClass} />
      case 'Sparkles': return <Sparkles className={iconClass} />
      case 'FileEdit': return <FileEdit className={iconClass} />
      case 'Palette': return <Palette className={iconClass} />
      case 'PenTool': return <PenTool className={iconClass} />
      case 'AlertTriangle': return <AlertTriangle className={iconClass} />
      case 'GraduationCap': return <GraduationCap className={iconClass} />
      case 'BookOpen': return <BookOpen className={iconClass} />
      case 'Landmark': return <Landmark className={iconClass} />
      case 'Cpu': return <Cpu className={iconClass} />
      case 'Music': return <Music className={iconClass} />
      case 'Timer': return <Timer className={iconClass} />
      case 'Highlighter': return <Highlighter className={iconClass} />
      case 'Bot': return <Bot className={iconClass} />
      case 'Smile': return <Smile className={iconClass} />
      case 'Workflow': return <Workflow className={iconClass} />
      case 'Search': return <Search className={iconClass} />
      case 'ShieldCheck': return <ShieldCheck className={iconClass} />
      case 'Smartphone': return <Smartphone className={iconClass} />
      default: return <Sparkles className={iconClass} />
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
      default: return 'bg-neutral-50 text-neutral-700 border-neutral-200'
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-5 bg-black/40 backdrop-blur-sm animate-fade-in font-sans"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl rounded-2xl sm:rounded-3xl bg-white border border-neutral-200/90 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.16)] overflow-hidden flex flex-col max-h-[92vh] text-neutral-900"
      >
        {/* Top Header - 纯净现代玻璃质感 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 px-5 sm:px-6 py-4 bg-white/95 shrink-0">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 p-2 text-white shadow-xs">
                <Compass className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight truncate">
                    CoreForge 研核 · 全功能与小功能完全使用手册
                  </h3>
                  <span className="hidden md:inline-flex px-2 py-0.5 text-[10.5px] font-semibold rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200/70 shrink-0">
                    22 大功能全景
                  </span>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                  涵盖色谱图、知识图谱、随手记、答题卡调色板、SM-2 闪卡与所有小功能的作用与使用说明
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="sm:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            {/* Tab Switch */}
            <div className="flex w-full sm:w-auto p-1 rounded-xl bg-neutral-100 border border-neutral-200/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('tour')}
                className={`flex-1 sm:flex-initial whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'tour'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                功能巡礼导览
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('doc')}
                className={`flex-1 sm:flex-initial whitespace-nowrap px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'doc'
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                全功能使用手册字典
              </button>
            </div>

            <button
              onClick={handleClose}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'tour' ? (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Feature Preview Card */}
              <div className="relative rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-5 sm:p-7 overflow-hidden transition-all duration-300">
                {/* 顶部控制栏 */}
                <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${scene.colorBg} ${scene.colorBorder} ${scene.colorText} whitespace-nowrap`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>
                      第 {scene.id}/{TOUR_SCENES.length} 幕 · {scene.badge}
                    </span>
                  </span>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-2xs shrink-0"
                    title={isPlaying ? '暂停自动演播' : '继续自动演播'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3 w-3 shrink-0" />
                        <span>自动演示中</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 shrink-0" />
                        <span>已暂停</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 核心内容展示区 */}
                <div className="my-5 relative z-10 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`p-1.5 rounded-xl border ${scene.colorBg} ${scene.colorBorder} ${scene.colorText} shadow-2xs`}
                    >
                      <scene.icon className="h-4 w-4" />
                    </span>
                    <h4 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                      {scene.title}
                    </h4>
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm font-semibold text-neutral-600">
                    {scene.subtitle}
                  </p>
                  <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed">
                    {scene.description}
                  </p>

                  {/* Highlights Bullet Points */}
                  <div className="mt-4 space-y-1.5">
                    {scene.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-700">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 底部时间线与直达体验按钮 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 relative z-10">
                  {/* 时间线微指示点 */}
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
                            ? 'w-6 bg-neutral-900'
                            : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                        }`}
                        title={s.title}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleNavigate(scene.route)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300/80 bg-white hover:bg-neutral-50 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{scene.routeText}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
                  </button>
                </div>
              </div>

              {/* 每日研学 4 步通关指南 */}
              <div>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
                  <span>每日研学 4 步高分通关指南</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div
                    onClick={() => handleNavigate('/dashboard')}
                    className="p-3 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-indigo-600">第一步 · 驾驶舱</span>
                    <h6 className="mt-1 text-xs font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                      查看备考倒计时与待办
                    </h6>
                    <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
                      掌握初试剩余天数，快速查看今日艾宾浩斯复习卡与薄弱考点提示。
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigate('/quiz')}
                    className="p-3 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-amber-600">第二步 · 真题刷题</span>
                    <h6 className="mt-1 text-xs font-bold text-neutral-900 group-hover:text-amber-600 transition-colors">
                      答题卡调色板与草稿演练
                    </h6>
                    <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
                      做 408 与考研数学历年真题，利用调色板快速跳题，手写板即时演练。
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigate('/graph')}
                    className="p-3 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-rose-600">第三步 · 掌握度色谱</span>
                    <h6 className="mt-1 text-xs font-bold text-neutral-900 group-hover:text-rose-600 transition-colors">
                      透视红黄盲区直通急救舱
                    </h6>
                    <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
                      在色谱图中查看红灯高危考点，单击呼出急救舱开展 5 题靶向速测。
                    </p>
                  </div>

                  <div
                    onClick={() => handleNavigate('/study')}
                    className="p-3 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-teal-600">第四步 · 间隔记忆</span>
                    <h6 className="mt-1 text-xs font-bold text-neutral-900 group-hover:text-teal-600 transition-colors">
                      SM-2 艾宾浩斯闪卡
                    </h6>
                    <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
                      早晚各 15 分钟抗遗忘复盘，强化定理公式与计算机协议细节。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 全功能与小功能完全使用手册字典 Tab */
            <div className="p-4 sm:p-6 space-y-5">
              {/* 顶部搜索与官方 Markdown 打开条 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/90">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索小功能作用或说明 (如：色谱图、知识图谱、随手记、答题卡、草稿纸、仿真课件...)"
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleOpenDocInEditor}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-800 px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
                  title="在 Obsidian 笔记编辑器中查看原始 Markdown 文件"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>在笔记编辑器中打开文档</span>
                </button>
              </div>

              {/* 分类快捷标签栏 */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {MANUAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.key
                        ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* 功能卡片列表 */}
              <div className="space-y-4">
                {filteredManualItems.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 text-xs">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    未找到与「{searchQuery}」匹配的小功能说明。您可以尝试更换关键词或清除搜索。
                  </div>
                ) : (
                  filteredManualItems.map((item) => {
                    const isExpanded = expandedFeatureId === item.id
                    const badgeClass = getBadgeStyle(item.color)

                    return (
                      <div
                        key={item.id}
                        id={`manual-${item.id}`}
                        className={`rounded-2xl border transition-all duration-200 bg-white ${
                          isExpanded
                            ? 'border-neutral-900/40 shadow-sm ring-1 ring-neutral-900/10'
                            : 'border-neutral-200/90 hover:border-neutral-300 hover:shadow-2xs'
                        }`}
                      >
                        {/* 卡片头部 */}
                        <div
                          onClick={() => setExpandedFeatureId(isExpanded ? null : item.id)}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-xl border shrink-0 ${badgeClass}`}>
                              {renderItemIcon(item.iconName)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm sm:text-base font-bold text-neutral-900">
                                  {item.name}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass}`}
                                >
                                  {item.badge}
                                </span>
                                {item.shortcuts?.map((sc, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[10px] font-mono text-neutral-600"
                                  >
                                    {sc}
                                  </span>
                                ))}
                              </div>
                              <p className="mt-1 text-xs text-neutral-600 line-clamp-2">
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
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
                              >
                                <span>{item.routeText || '前往体验'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              type="button"
                              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700"
                            >
                              <ChevronRight
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* 展开的详尽说明内容 */}
                        {isExpanded && (
                          <div className="px-4 pb-5 sm:px-5 sm:pb-5 border-t border-neutral-100 space-y-4 pt-4 text-xs text-neutral-700">
                            {/* 解决的核心痛点 */}
                            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-amber-900 flex items-start gap-2.5">
                              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-[11px] block text-amber-800">
                                  功能作用与解决的备考痛点：
                                </span>
                                <p className="mt-0.5 leading-relaxed">{item.problemSolved}</p>
                              </div>
                            </div>

                            {/* 具体使用步骤与操作说明 */}
                            <div>
                              <div className="font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>具体使用说明与操作步骤：</span>
                              </div>
                              <div className="space-y-1.5 pl-1">
                                {item.howToUse.map((step, idx) => (
                                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                                    <span className="h-4 w-4 rounded-full bg-neutral-100 text-neutral-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 进阶提效与实战技巧 */}
                            {item.proTips.length > 0 && (
                              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                                <div className="font-bold text-neutral-900 mb-1.5 flex items-center gap-1.5 text-[11px]">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>进阶实战提效技巧 (Pro Tips)：</span>
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-neutral-600 leading-relaxed pl-1">
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

        {/* Modal Footer */}
        <div className="border-t border-neutral-100 px-5 sm:px-6 py-3.5 bg-neutral-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <label className="flex items-center gap-2 text-neutral-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 h-3.5 w-3.5"
            />
            <span>不再自动弹出新手巡礼（可在导航栏点击「使用手册」图标随时打开）</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSkipTour}
              className="px-3 py-1.5 rounded-lg border border-neutral-200/80 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 font-medium transition-colors cursor-pointer"
            >
              关闭
            </button>

            <button
              onClick={handleStartTour}
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>开启实战全景漫游</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
