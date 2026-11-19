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
  ChevronLeft,
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
  Keyboard,
  CalendarRange,
} from 'lucide-react'
import {
  FEATURE_MANUAL_DATA,
  MANUAL_CATEGORIES,
  QUICK_SCENARIO_GUIDES,
  HOT_SEARCH_TAGS,
  SHORTCUT_GROUPS,
  STAGE_ROADMAP_DATA,
  type ManualColorTheme,
} from '../data/featureManualData'

export interface UserGuideModalProps {
  isOpen: boolean
  onClose: () => void
  onStartInteractiveTour?: () => void
  initialTab?: 'tour' | 'doc' | 'roadmap'
  initialCategory?: string
  initialFeatureId?: string
  isGuestMode?: boolean
  onRequireAuth?: (targetPath: string, targetLabel: string) => void
}

interface TourScene {
  id: number
  shortNav: string
  title: string
  subtitle: string
  badge: string
  icon: any
  accentGrad: string
  colorText: string
  colorBg: string
  colorBorder: string
  description: string
  highlights: string[]
  route: string
  routeText: string
}

// 6 幕旗舰视觉巡礼：左文右景杂志级画报
const TOUR_SCENES: TourScene[] = [
  {
    id: 1,
    shortNav: '全景总台',
    title: '一站式智能研学系统 · 学练记测全打通',
    subtitle: '408 计算机 + 数学 + 英语 + 政治，告别碎片化工具拼凑',
    badge: '全景认知',
    icon: Sparkles,
    accentGrad: 'from-indigo-600 to-violet-600',
    colorText: 'text-indigo-700',
    colorBg: 'bg-indigo-50',
    colorBorder: 'border-indigo-200/90',
    description:
      '过去资料堆在网盘、刷题在手机软件、笔记散落在文档，复习越到后期越乱。研核将历年统考真题、双链公式笔记、动态仿真课件、艾宾浩斯闪卡与分科 AI 导师融为一体，形成高效提分飞轮。',
    highlights: [
      '首屏直观掌控初试倒计时、今日待背闪卡与四核统考直达舱',
      '100% 兼容本地 Obsidian 纯文本 .md 格式，资产主权永不锁死',
      '电脑深度学习与手机 PWA 随身刷卡实时云同步，排队睡前无缝接力',
    ],
    route: '/dashboard',
    routeText: '前往首页总览工作台',
  },
  {
    id: 2,
    shortNav: '真题考场',
    title: '刷题中心 · 历年整卷、屏幕草稿与错题闭环',
    subtitle: '1987–2024 统考真题精校，右侧自带答题卡与演草白板',
    badge: '刷题实战 /quiz',
    icon: ClipboardList,
    accentGrad: 'from-amber-500 to-orange-600',
    colorText: 'text-amber-800',
    colorBg: 'bg-amber-50',
    colorBorder: 'border-amber-200/90',
    description:
      '自由切换「真题整卷」「题型专项」「自由组卷」与「智能错题本」。交卷后答错题目自动按三维错因归档，支持一键组卷重练与 AI 变式出题，彻底杜绝“一看解析就会，一上考场就废”。',
    highlights: [
      '右侧常驻分色答题卡矩阵，标星存疑题目交卷前一键定位复查',
      '内置顺滑屏幕演草纸与常用定理速查卡，免翻纸笔直接列式推演',
      '做题卡壳按 Ctrl+J 一键召唤 AI 导师，针对当前题干逐步启发点拨',
    ],
    route: '/quiz',
    routeText: '进入真题刷题中心',
  },
  {
    id: 3,
    shortNav: '热力排雷',
    title: '红黄绿掌握热力图 & 提分急救舱',
    subtitle: '一眼揪出高危失分盲区，点开红点直接 5 题靶向抢救',
    badge: '精准查漏 /graph',
    icon: Flame,
    accentGrad: 'from-rose-500 to-pink-600',
    colorText: 'text-rose-700',
    colorBg: 'bg-rose-50',
    colorBorder: 'border-rose-200/90',
    description:
      '系统根据你的真实做题对错率与闪卡反馈，将全大纲考点涂上绿（稳拿）、黄（巩固）、红（高危盲区）三色信号。单击闪烁红点即刻开启「提分急救舱」，10 分钟完成定点爆破！',
    highlights: [
      '急救舱一条龙串起：回顾历史错因 → 观看配套动画课件 → 实测 5 道同类真题',
      '做对靶向突击题后掌握分实时回写，亲眼看着红灯变绿灯，成就感拉满',
      '搭配「11 级考点色谱」由浅入深攻克 408 与数学 22 大压舱石枢纽',
    ],
    route: '/graph',
    routeText: '打开掌握热力星图',
  },
  {
    id: 4,
    shortNav: '仿真与语政',
    title: '22+ 动态仿真课件 · 全新背词与 1839–2026 史纲地图',
    subtitle: '把抽象算法变成可单步播放的动画，把死记硬背变成科学闯关',
    badge: '研学与公共课',
    icon: GraduationCap,
    accentGrad: 'from-teal-500 to-emerald-600',
    colorText: 'text-teal-800',
    colorBg: 'bg-teal-50',
    colorBorder: 'border-teal-200/90',
    description:
      '无论是 408 红黑树旋转与页面置换，还是考研英语拼写默写、20分制四维作文精批，抑或是串联中国历史地图与“十五五”时政热点的 1839–2026 史纲全景大本营，全都可交互推演！',
    highlights: [
      '仿真课件支持单步回放与自定义输入测试数据，同步高亮底层代码指针',
      '全新背词支持「拼写默写 + 耳机随身巡航连播 + 5阶词根色谱」',
      '史纲地图支持同城多史实循环联动、“史上第一次”汇总与千题遮罩自测',
    ],
    route: '/study',
    routeText: '探索研学与仿真实验室',
  },
  {
    id: 5,
    shortNav: '笔记与PDF',
    title: '双链公式知识大脑 & PDF 双栏高清精读',
    subtitle: '默认防误触预览 · 富文本/源码双模 · PDF 智能提取题卡',
    badge: '知识沉淀 /editor',
    icon: FileEdit,
    accentGrad: 'from-sky-500 to-blue-600',
    colorText: 'text-sky-800',
    colorBg: 'bg-sky-50',
    colorBorder: 'border-sky-200/90',
    description:
      '打开已有笔记默认进入印刷级学术预览防手滑；写作时支持像办公软件一样流畅打字或切源码编辑，点击 Σ 秒插微积分矩阵公式，更支持左看高清 PDF 讲义、右记双链笔记并智能提取闪卡！',
    highlights: [
      '支持随时创建多级学科目录、Ctrl+V 粘贴截图上传与纸面荧光笔手写批注',
      '写完考点总结点「即学即练」，当场生成 3 道配套真题检验吸收度',
      '与本机 Obsidian 文件夹毫秒级双向监听同步，随时一键打包备份',
    ],
    route: '/editor',
    routeText: '打开双链笔记编辑器',
  },
  {
    id: 6,
    shortNav: 'AI与双宠',
    title: '分科 AI 导师思考流 & 奶龙×大肥鱼双宠伴学',
    subtitle: '4 位专属名师流式拆解 + 30+ 条真人萌宠配音与自由缩放随身聊',
    badge: '伴学与心流 /chat',
    icon: Bot,
    accentGrad: 'from-purple-600 to-indigo-600',
    colorText: 'text-purple-800',
    colorBg: 'bg-purple-50',
    colorBorder: 'border-purple-200/90',
    description:
      '随时按 Ctrl+Shift+A 召唤研小核、数小通、英小研、政小思！支持透视大模型深度思考链、划词追问细节与 6 款护眼聊天壁纸；右下角更有奶龙与大肥鱼陪你开 Lofi 电台沉浸冲刺！',
    highlights: [
      '支持双师同台会诊与本机 Claude Code / Codex CLI 智能体安全桥接',
      '右下角自由切换「奶龙🍗」与「大肥鱼🍚」，随身聊窗口支持拖拽与八向缩放',
      '白噪音混音台与番茄专注跨页面不断流，全站极简/鲜艳/护眼/暗黑四主题护航',
    ],
    route: '/chat',
    routeText: '体验分科 AI 伴学工作台',
  },
]

export default function UserGuideModal({
  isOpen,
  onClose,
  onStartInteractiveTour,
  initialTab = 'tour',
  initialCategory,
  initialFeatureId,
  isGuestMode = false,
  onRequireAuth,
}: UserGuideModalProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'tour' | 'doc' | 'roadmap'>(initialTab)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHoveringStage, setIsHoveringStage] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  // 手册搜索与筛选状态
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all')
  const [onlyNewFeatures, setOnlyNewFeatures] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    if (initialFeatureId) return new Set([initialFeatureId])
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

  // Esc 快捷键关闭弹窗
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        handleClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, dontShowAgain])

  // 自动轮播定时器（悬停在画报卡片上时智能暂停，移开恢复）
  useEffect(() => {
    if (!isOpen || !isPlaying || isHoveringStage || activeTab !== 'tour') return
    const timer = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % TOUR_SCENES.length)
    }, 6800)
    return () => clearInterval(timer)
  }, [isOpen, isPlaying, isHoveringStage, activeTab])

  // 统计各分类条目数量
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: FEATURE_MANUAL_DATA.length }
    for (const item of FEATURE_MANUAL_DATA) {
      counts[item.category] = (counts[item.category] || 0) + 1
    }
    return counts
  }, [])

  const newFeaturesCount = useMemo(
    () => FEATURE_MANUAL_DATA.filter((i) => i.isNew).length,
    []
  )

  // 过滤后的手册条目列表
  const filteredManualItems = useMemo(() => {
    return FEATURE_MANUAL_DATA.filter((item) => {
      if (onlyNewFeatures && !item.isNew) return false
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
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q))) ||
        item.howToUse.some((step) => step.toLowerCase().includes(q)) ||
        item.proTips.some((tip) => tip.toLowerCase().includes(q))
      )
    })
  }, [selectedCategory, searchQuery, onlyNewFeatures])

  if (!isOpen) return null

  const scene = TOUR_SCENES[currentSceneIndex]

  function handleClose() {
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
    if (isGuestMode && onRequireAuth) {
      onRequireAuth('/dashboard', '研核工作台实景新手导览')
      return
    }
    if (onStartInteractiveTour) {
      onStartInteractiveTour()
    } else {
      window.dispatchEvent(new CustomEvent('start-interactive-tour'))
    }
  }

  const handleNavigate = (path: string, label = '对应功能舱') => {
    handleClose()
    if (isGuestMode && onRequireAuth) {
      onRequireAuth(path, label)
      return
    }
    navigate(path)
  }

  const handleOpenDocInEditor = () => {
    const docRoute = '/editor?file=💡 新手指引 · CoreForge 研核完全使用手册.md'
    handleNavigate(docRoute, '完整 Markdown 使用手册')
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

  // 动态渲染功能图标
  const renderItemIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Flame': return <Flame className={className} aria-hidden="true" />
      case 'Network': return <Network className={className} aria-hidden="true" />
      case 'ShieldAlert': return <ShieldAlert className={className} aria-hidden="true" />
      case 'Sparkles': return <Sparkles className={className} aria-hidden="true" />
      case 'FileEdit': return <FileEdit className={className} aria-hidden="true" />
      case 'Palette': return <Palette className={className} aria-hidden="true" />
      case 'PenTool': return <PenTool className={className} aria-hidden="true" />
      case 'PenLine': return <PenLine className={className} aria-hidden="true" />
      case 'AlertTriangle': return <AlertTriangle className={className} aria-hidden="true" />
      case 'GraduationCap': return <GraduationCap className={className} aria-hidden="true" />
      case 'BookOpen': return <BookOpen className={className} aria-hidden="true" />
      case 'Landmark': return <Landmark className={className} aria-hidden="true" />
      case 'Cpu': return <Cpu className={className} aria-hidden="true" />
      case 'Music': return <Music className={className} aria-hidden="true" />
      case 'Timer': return <Timer className={className} aria-hidden="true" />
      case 'Highlighter': return <Highlighter className={className} aria-hidden="true" />
      case 'Bot': return <Bot className={className} aria-hidden="true" />
      case 'Smile': return <Smile className={className} aria-hidden="true" />
      case 'Workflow': return <Workflow className={className} aria-hidden="true" />
      case 'Search': return <Search className={className} aria-hidden="true" />
      case 'ShieldCheck': return <ShieldCheck className={className} aria-hidden="true" />
      case 'Smartphone': return <Smartphone className={className} aria-hidden="true" />
      case 'Zap': return <Zap className={className} aria-hidden="true" />
      case 'ClipboardList': return <ClipboardList className={className} aria-hidden="true" />
      case 'LayoutGrid': return <LayoutGrid className={className} aria-hidden="true" />
      case 'Languages': return <Languages className={className} aria-hidden="true" />
      default: return <Sparkles className={className} aria-hidden="true" />
    }
  }

  // 徽章颜色映射
  const getBadgeStyle = (color: ManualColorTheme | string) => {
    switch (color) {
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'amber': return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'teal': return 'bg-teal-50 text-teal-700 border-teal-200'
      case 'cyan': return 'bg-cyan-50 text-cyan-800 border-cyan-200'
      case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  // 渲染右侧 6 幕动态微缩视觉舞台（让新手一眼看懂功能长什么样）
  const renderSceneVisualStage = (sceneId: number) => {
    switch (sceneId) {
      case 1:
        return (
          <div className="space-y-2.5 text-left select-none">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white">
              <span className="text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Obsidian 本地双向同步就绪</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                多端云接力
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: '408 计算机综合', pct: '78%', bar: 'bg-sky-400', tag: '43套精校卷' },
                { name: '考研数学一/二/三', pct: '84%', bar: 'bg-violet-400', tag: 'KaTeX 推导' },
                { name: '考研英语实战舱', pct: '72%', bar: 'bg-emerald-400', tag: '20分制精批' },
                { name: '史纲 1839–2026', pct: '81%', bar: 'bg-rose-400', tag: '全景地图' },
              ].map((m) => (
                <div key={m.name} className="p-2.5 rounded-xl bg-white/[0.07] border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span className="font-bold text-white truncate">{m.name}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${m.bar}`} style={{ width: m.pct }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{m.tag}</span>
                    <span className="font-mono text-white">{m.pct}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-between text-[11px] text-emerald-200">
              <span>今日待复习 SM-2 闪卡：18 张</span>
              <span className="font-bold text-white">一键清零 →</span>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-2.5 text-left select-none">
            <div className="p-3 rounded-xl bg-white/[0.08] border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="px-2 py-0.5 rounded bg-amber-500/25 text-amber-200 font-bold">
                  2024 统考 408 真题 · 第 15 题
                </span>
                <span className="font-mono text-emerald-300">⏱ 02:18:45</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-snug">
                向一棵空 AVL 树依次插入关键字 25, 18, 30, 12, 20, 15 后，根节点关键字为？
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-amber-300 font-semibold">★ 已标星待复查</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/30 border border-indigo-400/40 text-[10px] text-indigo-100 font-bold">
                  Ctrl+J 追问 AI 导师
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10">
                <div className="text-[10px] text-slate-300 font-bold mb-1.5">分色答题卡矩阵</div>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <span
                      key={n}
                      className={`h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center ${
                        n <= 6
                          ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/30'
                          : n === 7
                          ? 'bg-amber-400/30 text-amber-200 border border-amber-300/40'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 flex flex-col justify-between">
                <div className="text-[10px] text-slate-300 font-bold">屏幕演草白板</div>
                <div className="font-mono text-[11px] text-sky-300 bg-slate-950/60 rounded-lg p-1.5 border border-white/10">
                  BF(18) = +2 → LR双旋
                  <br />
                  root ⇐ 20 ✓
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-2.5 text-left select-none">
            <div className="p-3 rounded-xl bg-white/[0.07] border border-white/15">
              <div className="flex items-center justify-between text-[10px] text-slate-300 mb-2">
                <span className="font-bold text-white">考点掌握度三色星图</span>
                <span className="text-rose-300 font-semibold">发现 2 个高危红灯盲区</span>
              </div>
              <div className="flex items-center justify-around py-2">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200 text-[10px] font-bold flex items-center justify-center">
                    92%
                  </span>
                  <span className="text-[10px] text-slate-300">二叉树遍历</span>
                </div>
                <div className="h-px w-6 bg-white/20" />
                <div className="flex flex-col items-center gap-1">
                  <span className="w-9 h-9 rounded-full bg-rose-500/35 border-2 border-rose-400 text-rose-100 text-[10px] font-extrabold flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.5)]">
                    38%
                  </span>
                  <span className="text-[10px] text-rose-300 font-bold">PV 同步死锁</span>
                </div>
                <div className="h-px w-6 bg-white/20" />
                <div className="flex flex-col items-center gap-1">
                  <span className="w-8 h-8 rounded-full bg-amber-500/30 border-2 border-amber-400 text-amber-200 text-[10px] font-bold flex items-center justify-center">
                    65%
                  </span>
                  <span className="text-[10px] text-slate-300">管程条件变量</span>
                </div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-400/35 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-white">
                <span>🚑 提分急救舱 · PV 同步互斥</span>
                <span className="text-amber-300 text-[10px]">靶向 5 题突击</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-200">
                <span className="px-2 py-0.5 rounded bg-white/10">1. 复盘历史错题</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-white/10">2. 动画推演</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-bold">3. 救绿考点</span>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-2.5 text-left select-none">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-white/[0.08] border border-white/15 space-y-1.5">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/25 text-cyan-200 text-[10px] font-bold">
                  🎧 背词巡航 + 默写
                </span>
                <div className="text-xs font-bold text-white font-mono">conspicuous</div>
                <div className="text-[10px] text-slate-300">adj. 显著的；引人注目的</div>
                <div className="text-[10px] text-emerald-300 font-semibold">✓ 词根 spec (看) 串记 8 词</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.08] border border-white/15 space-y-1.5">
                <span className="px-1.5 py-0.5 rounded bg-rose-500/25 text-rose-200 text-[10px] font-bold">
                  🗺️ 1839–2026 史纲
                </span>
                <div className="text-xs font-bold text-white">遵义会议 · 1935.01</div>
                <div className="text-[10px] text-slate-300">生死攸关转折点 · 同城联动</div>
                <div className="text-[10px] text-amber-300 font-semibold">+ 十五五规划时政热点</div>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span className="font-bold text-white">🧬 SM-2 记忆闪卡智能排期</span>
                <span className="text-emerald-300">点击诚实自评</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                <div className="py-1 rounded-lg bg-rose-500/25 border border-rose-400/30 text-rose-200">
                  生疏 · 10m
                </div>
                <div className="py-1 rounded-lg bg-amber-500/25 border border-amber-400/30 text-amber-200">
                  模糊 · 1d
                </div>
                <div className="py-1 rounded-lg bg-emerald-500/25 border border-emerald-400/30 text-emerald-200">
                  掌握 · 4d
                </div>
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-2.5 text-left select-none">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5 p-2.5 rounded-xl bg-white/[0.07] border border-white/15 space-y-1.5">
                <div className="text-[10px] font-bold text-sky-300">📄 PDF 原卷讲义</div>
                <div className="p-1.5 rounded bg-white/10 text-[10px] text-slate-200 leading-snug">
                  定理3：设函数 f(x) 在 x₀ 处具有 n 阶导数...
                </div>
                <div className="text-[10px] font-semibold text-emerald-300">
                  ✨ 一键智能提取 6 张闪卡
                </div>
              </div>
              <div className="col-span-7 p-2.5 rounded-xl bg-white/[0.09] border border-sky-400/30 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-white">✍️ 双链公式笔记</span>
                  <span className="text-emerald-300 font-mono">.md 实时落盘</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/70 font-mono text-[10.5px] text-indigo-200">
                  关联：[[拉格朗日中值定理]]
                  <br />
                  eˣ = 1 + x + x²/2! + o(x²)
                </div>
                <div className="flex items-center justify-between text-[10px] text-amber-200">
                  <span>Σ 公式速插</span>
                  <span className="font-bold underline">⚡ 即学即练 (3题)</span>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-2.5 text-left select-none">
            <div className="p-2.5 rounded-xl bg-white/[0.08] border border-white/15 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-purple-200">📐 数小通 · 深度思考流已展开</span>
                <span className="text-emerald-300 font-mono">SSE 零缓冲直出</span>
              </div>
              <p className="text-[10.5px] text-slate-300 leading-snug">
                💡 破题思路：被积函数含 x²+y² 且积分域为圆域，优先转换极坐标 r·dr·dθ...
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-sky-500/15 border border-white/15 flex items-center gap-3">
              <div className="flex -space-x-2 shrink-0">
                <img
                  src="/pets/nailong_wave.webp"
                  alt="奶龙桌宠"
                  className="w-10 h-10 rounded-xl bg-white/90 p-0.5 object-contain ring-2 ring-amber-400"
                />
                <img
                  src="/pets/feiyu_happy.webp"
                  alt="大肥鱼桌宠"
                  className="w-10 h-10 rounded-xl bg-white/90 p-0.5 object-contain ring-2 ring-sky-400"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white">
                  🐲 奶龙 × 🐟 大肥鱼 双宠随身聊
                </div>
                <div className="text-[10px] text-slate-300 leading-snug mt-0.5">
                  30+ 条真人趣味配音 · 八向自由缩放窗口 · Lofi 电台伴学
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-2 sm:p-5 bg-slate-950/55 backdrop-blur-md animate-fade-in font-sans overscroll-contain"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-guide-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-[0_28px_70px_-12px_rgba(15,23,42,0.35)] overflow-hidden flex flex-col max-h-[92dvh] text-slate-900 overscroll-contain"
      >
        {/* 顶部旗舰品牌导航栏 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 shrink-0">
          <div className="flex items-center justify-between gap-2.5 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm ring-1 ring-indigo-500/20">
                <Compass className="h-5 w-5 text-amber-300" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    id="user-guide-modal-title"
                    className="text-sm sm:text-lg font-extrabold text-slate-900 tracking-tight"
                  >
                    CoreForge 研核 · 视觉使用手册与通关秘籍
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-2xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0">
                    <span>收录 {FEATURE_MANUAL_DATA.length} 项全栈能力</span>
                  </span>
                </div>
                <p className="text-2xs sm:text-xs text-slate-500 mt-0.5">
                  图文微缩演示 + 大白话分步指南，1 分钟摸清所有提分黑科技
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="关闭使用手册窗口"
            >
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
            {/* 三视图单行标签栏（遵循 WAI-ARIA Tablist 与不折行规范） */}
            <div
              role="tablist"
              aria-label="使用手册视图切换"
              className="flex w-full lg:w-auto p-1 rounded-xl bg-slate-100/95 border border-slate-200/80 text-xs overflow-x-auto no-scrollbar"
            >
              {[
                { id: 'tour' as const, label: '✨ 1分钟视觉巡礼' },
                { id: 'doc' as const, label: `📖 全功能百科 (${FEATURE_MANUAL_DATA.length})` },
                { id: 'roadmap' as const, label: '⌨️ 快捷键与备考路线' },
              ].map((t) => {
                const selected = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    id={`guide-tab-${t.id}`}
                    aria-selected={selected}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative flex-1 lg:flex-initial whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      selected
                        ? 'bg-white text-slate-900 shadow-xs after:content-[""] after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-indigo-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="hidden lg:inline-flex p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="关闭使用手册窗口"
            >
              <X className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 主体滚动内容区 */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-[#f8f9fc]">
          {activeTab === 'tour' ? (
            <div
              role="tabpanel"
              aria-labelledby="guide-tab-tour"
              className="p-3.5 sm:p-6 space-y-5"
            >
              {/* 顶部 6 幕胶囊快速导览轨 */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-0.5">
                <div className="flex items-center gap-1.5">
                  {TOUR_SCENES.map((s, idx) => {
                    const active = idx === currentSceneIndex
                    const Icon = s.icon
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setCurrentSceneIndex(idx)
                          setIsPlaying(false)
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200/90 hover:border-slate-300 hover:text-slate-900'
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-amber-300' : 'text-slate-400'}`}
                          aria-hidden="true"
                        />
                        <span>
                          0{s.id} {s.shortNav}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* 暂停/继续自动轮播控制按钮（严格遵循 WCAG 2.2.2，动态标签不叠用 aria-pressed） */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 text-2xs sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs shrink-0"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
                      <span>暂停轮播</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                      <span>继续轮播</span>
                    </>
                  )}
                </button>
              </div>

              {/* 杂志级双栏视觉画报主舞台 */}
              <div
                onMouseEnter={() => setIsHoveringStage(true)}
                onMouseLeave={() => setIsHoveringStage(false)}
                className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12"
              >
                {/* 左栏 (7 列)：清晰叙事与价值拆解 */}
                <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs font-extrabold border ${scene.colorBg} ${scene.colorBorder} ${scene.colorText}`}
                      >
                        <span>
                          第 {scene.id} / {TOUR_SCENES.length} 幕 · {scene.badge}
                        </span>
                      </span>
                    </div>

                    <h4 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {scene.title}
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-indigo-600">
                      {scene.subtitle}
                    </p>
                    <p className="mt-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                      {scene.description}
                    </p>

                    <div className="mt-4 space-y-2">
                      {scene.highlights.map((h, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-800 font-medium"
                        >
                          <CheckCircle2
                            className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 左下翻幕与直达按钮组 */}
                  <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentSceneIndex(
                            (prev) => (prev - 1 + TOUR_SCENES.length) % TOUR_SCENES.length
                          )
                          setIsPlaying(false)
                        }}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        aria-label="上一幕"
                      >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentSceneIndex((prev) => (prev + 1) % TOUR_SCENES.length)
                          setIsPlaying(false)
                        }}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                        aria-label="下一幕"
                      >
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('doc')}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        查阅百科详情
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleNavigate(scene.route, scene.shortNav)}
                      className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${scene.accentGrad} hover:opacity-95 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer`}
                    >
                      <span>{scene.routeText}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* 右栏 (5 列)：深色精密界面微缩演示舞台 */}
                <div className="cinema-dark-lock lg:col-span-5 bg-gradient-to-br from-[#0f172a] via-[#161d35] to-[#0f172a] p-4 sm:p-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 text-white">
                  <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-white/10 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                      <span className="ml-1 font-mono text-slate-300">界面实景示意</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400">{scene.route}</span>
                  </div>

                  <div className="my-auto py-1">{renderSceneVisualStage(scene.id)}</div>

                  <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[10.5px] text-slate-400">
                    <span>悬停卡片可自动暂停轮播</span>
                    <span className="text-amber-300 font-semibold">所见即所得</span>
                  </div>
                </div>
              </div>

              {/* 6 宫格高频意图直达罗盘 */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-indigo-600" aria-hidden="true" />
                    <span>按备考意图秒速直达 · 我现在想做什么就点哪里</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('roadmap')}
                    className="text-2xs sm:text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>看三阶段通关攻略</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {QUICK_SCENARIO_GUIDES.map((sc) => {
                    const badgeClass = getBadgeStyle(sc.color)
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => sc.route && handleNavigate(sc.route, sc.title)}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group text-left flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`p-2 rounded-xl border ${badgeClass}`}>
                              {renderItemIcon(sc.iconName, 'w-4 h-4')}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-2xs font-bold text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors inline-flex items-center gap-1">
                              <span>{sc.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" aria-hidden="true" />
                            </span>
                          </div>
                          <h5 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {sc.title}
                          </h5>
                          <p className="mt-1 text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                            {sc.subtitle}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : activeTab === 'doc' ? (
            /* 全功能百科词典 Tab：桌面端左栏目录 + 右栏精装卡片流 */
            <div
              role="tabpanel"
              aria-labelledby="guide-tab-doc"
              className="p-3.5 sm:p-6 space-y-4"
            >
              {/* 顶部搜索框 + 热门搜索词胶囊 */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索功能、痛点或快捷键（如：大肥鱼、拼写默写、急救舱、史纲地图、PDF...）"
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="清空搜索关键词"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setOnlyNewFeatures((v) => !v)}
                      className={`inline-flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                        onlyNewFeatures
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-rose-50/80 border-rose-200 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>近期上新 ({newFeaturesCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleExpandAll}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-2 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <ChevronsDownUp className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                      <span>{allExpanded ? '全部收起' : '全部展开'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenDocInEditor}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      title="在笔记编辑器中打开完整 Markdown 手册文档"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">编辑器阅读</span>
                    </button>
                  </div>
                </div>

                {/* 热门词一键点选 */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-2xs">
                  <span className="text-slate-400 font-semibold shrink-0">大家常搜：</span>
                  {HOT_SEARCH_TAGS.map((tag) => {
                    const active = searchQuery === tag
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSearchQuery(active ? '' : tag)}
                        className={`px-2.5 py-1 rounded-full font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                      >
                        #{tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 移动端横向分类栏 */}
              <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {MANUAL_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.key
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {renderItemIcon(
                        cat.iconName,
                        `w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`
                      )}
                      <span>{cat.shortLabel}</span>
                      <span className="text-[10px] opacity-75">({categoryCounts[cat.key] || 0})</span>
                    </button>
                  )
                })}
              </div>

              {/* 桌面端左导右卡双栏布局 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* 左栏粘性目录 (3 列) */}
                <div className="hidden lg:block lg:col-span-3 sticky top-0 space-y-1.5 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="px-2.5 py-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    功能模块目录
                  </div>
                  {MANUAL_CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.key
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {renderItemIcon(
                            cat.iconName,
                            `w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`
                          )}
                          <span className="truncate">{cat.label}</span>
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                            isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {categoryCounts[cat.key] || 0}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* 右栏卡片列表 (9 列) */}
                <div className="lg:col-span-9 space-y-3">
                  {filteredManualItems.length === 0 ? (
                    <div className="text-center py-14 px-4 rounded-2xl bg-white border border-slate-200/80 text-slate-500 text-xs space-y-2">
                      <HelpCircle className="w-9 h-9 mx-auto text-slate-300" aria-hidden="true" />
                      <p className="font-bold text-slate-700">
                        没有找到匹配的说明词条
                      </p>
                      <p>可以尝试切换左侧分类，或点击下方按钮重置筛选条件</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedCategory('all')
                          setOnlyNewFeatures(false)
                        }}
                        className="mt-1 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                      >
                        显示全部 {FEATURE_MANUAL_DATA.length} 项功能
                      </button>
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
                              ? 'border-indigo-400/70 shadow-md ring-2 ring-indigo-500/10'
                              : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          {/* 卡片头部 */}
                          <div
                            onClick={() => toggleExpandItem(item.id)}
                            className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer select-none"
                          >
                            <div className="flex items-start sm:items-center gap-3 min-w-0">
                              <div className={`p-2.5 rounded-xl border shrink-0 ${badgeClass}`}>
                                {renderItemIcon(item.iconName, 'w-4.5 h-4.5')}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <h4 className="text-xs sm:text-[14.5px] font-extrabold text-slate-900">
                                    {item.name}
                                  </h4>
                                  {item.isNew && (
                                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-2xs">
                                      NEW 升级
                                    </span>
                                  )}
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-2xs font-bold border ${badgeClass}`}
                                  >
                                    {item.badge}
                                  </span>
                                  {item.shortcuts?.map((sc, i) => (
                                    <kbd
                                      key={i}
                                      className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 shadow-[0_1px_0_#cbd5e1] text-[10px] font-mono font-bold text-slate-700"
                                    >
                                      {sc}
                                    </kbd>
                                  ))}
                                </div>
                                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                  {item.summary}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {item.route && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleNavigate(item.route!, item.name)
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                                >
                                  <span>{item.routeText || '前往体验'}</span>
                                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                                </button>
                              )}
                              <button
                                type="button"
                                aria-label={isExpanded ? '收起功能详情' : '展开功能详情'}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              >
                                <ChevronRight
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-90 text-indigo-600' : ''
                                  }`}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>

                          {/* 展开的四段式结构化图文指南 */}
                          {isExpanded && (
                            <div className="px-3.5 pb-4 sm:px-5 sm:pb-5 border-t border-slate-100 space-y-3.5 pt-3.5 text-xs text-slate-700">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {/* 在哪找到它 */}
                                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/70 text-indigo-950 flex items-start gap-2.5">
                                  <MapPin
                                    className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5"
                                    aria-hidden="true"
                                  />
                                  <div>
                                    <span className="font-extrabold text-2xs block text-indigo-800">
                                      入口位置在哪里：
                                    </span>
                                    <p className="mt-0.5 leading-relaxed font-medium">
                                      {item.whereToFind}
                                    </p>
                                  </div>
                                </div>

                                {/* 解决什么痛点 */}
                                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-950 flex items-start gap-2.5">
                                  <Lightbulb
                                    className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                                    aria-hidden="true"
                                  />
                                  <div>
                                    <span className="font-extrabold text-2xs block text-amber-800">
                                      帮你解决什么备考痛点：
                                    </span>
                                    <p className="mt-0.5 leading-relaxed">{item.problemSolved}</p>
                                  </div>
                                </div>
                              </div>

                              {/* 纵向时间轴分步指南 */}
                              <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80">
                                <div className="font-extrabold text-slate-900 mb-2.5 flex items-center gap-1.5">
                                  <CheckCircle2
                                    className="w-4 h-4 text-emerald-600"
                                    aria-hidden="true"
                                  />
                                  <span>手把手操作步骤：</span>
                                </div>
                                <div className="space-y-2.5 relative pl-1">
                                  {item.howToUse.map((step, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2.5 leading-relaxed whitespace-pre-line"
                                    >
                                      <span className="h-5 w-5 rounded-full bg-slate-900 text-white font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                        {idx + 1}
                                      </span>
                                      <span className="text-slate-800">{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 顺手提效锦囊 */}
                              {item.proTips.length > 0 && (
                                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                                  <div className="font-extrabold text-emerald-900 mb-1 flex items-center gap-1.5 text-2xs">
                                    <Sparkles
                                      className="w-3.5 h-3.5 text-emerald-600"
                                      aria-hidden="true"
                                    />
                                    <span>高分学长提效小锦囊：</span>
                                  </div>
                                  <ul className="list-disc list-inside space-y-1 text-emerald-950/85 leading-relaxed pl-0.5">
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
            </div>
          ) : (
            /* 第 3 视图：立体键帽快捷键矩阵 + 考研三阶段黄金路线图 */
            <div
              role="tabpanel"
              aria-labelledby="guide-tab-roadmap"
              className="p-3.5 sm:p-6 space-y-6"
            >
              {/* 上半区：全站效率快捷键速查 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-slate-900 text-white">
                    <Keyboard className="w-4 h-4 text-amber-300" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                      全站效率键盘快捷键速查
                    </h4>
                    <p className="text-2xs sm:text-xs text-slate-500">
                      记住这几个黄金组合键，刷题切解析、搜真题与写公式效率翻倍
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                  {SHORTCUT_GROUPS.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/70">
                          {renderItemIcon(group.iconName, 'w-3.5 h-3.5')}
                        </span>
                        <div>
                          <div className="text-xs sm:text-[13px] font-extrabold text-slate-900">
                            {group.title}
                          </div>
                          <div className="text-[10.5px] text-slate-500">{group.subtitle}</div>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {group.items.map((sc, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1">
                                {sc.keys.map((k, kIdx) => (
                                  <span key={kIdx} className="inline-flex items-center gap-1">
                                    {kIdx > 0 && (
                                      <span className="text-[10px] text-slate-400 font-bold">+</span>
                                    )}
                                    <kbd className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-md bg-white border border-slate-300 shadow-[0_2px_0_#cbd5e1] text-[11px] font-mono font-extrabold text-slate-800">
                                      {k}
                                    </kbd>
                                  </span>
                                ))}
                              </div>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600">
                                {sc.scope}
                              </span>
                            </div>
                            <p className="text-[11.5px] text-slate-700 leading-snug">{sc.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 下半区：考研三阶段研核黄金通关路线图 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <CalendarRange className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                      考研三阶段 · 研核科学组合打法路线图
                    </h4>
                    <p className="text-2xs sm:text-xs text-slate-500">
                      不同备考月份重点用哪几个舱室？照着这张闭环路线稳步推进
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                  {STAGE_ROADMAP_DATA.map((st) => {
                    const headerCls =
                      st.color === 'indigo'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : st.color === 'amber'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    return (
                      <div
                        key={st.stage}
                        className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold border ${headerCls}`}
                            >
                              {st.stage}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-slate-500">{st.period}</div>
                          <h5 className="text-sm font-extrabold text-slate-900">{st.title}</h5>
                          <p className="text-xs text-slate-600 leading-relaxed">{st.goal}</p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          {st.recommendedModules.map((mod) => (
                            <button
                              key={mod.label}
                              type="button"
                              onClick={() => handleNavigate(mod.route, mod.label)}
                              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-300 transition-all group cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                                <span>{mod.label}</span>
                                <ArrowRight
                                  className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0"
                                  aria-hidden="true"
                                />
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-500 leading-snug">
                                {mod.tip}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="border-t border-slate-200/80 px-4 sm:px-6 py-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs shrink-0">
          {!isGuestMode ? (
            <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4"
              />
              <span>以后不再自动弹出（随时可在顶栏「使用手册」重新唤起）</span>
            </label>
          ) : (
            <div className="text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" aria-hidden="true" />
              <span>进入工作台开启「手把手实景交互导览」</span>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={isGuestMode ? handleClose : handleSkipTour}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
            >
              先自己逛逛
            </button>

            <button
              type="button"
              onClick={handleStartTour}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:opacity-95 text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Compass className="h-4 w-4 text-amber-300" aria-hidden="true" />
              <span>{isGuestMode ? '注册并开启手把手实景导览' : '开启手把手实景导览'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
