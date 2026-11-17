import { createPortal } from 'react-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  ClipboardList,
  GraduationCap,
  Network,
  MessageCircle,
  Home,
  Minimize2,
  Maximize2,
  Flame,
  Play,
  Send,
  MoveHorizontal,
  Lightbulb,
  BookOpen,
  Cpu,
  PenLine,
  FileEdit,
  Crosshair,
  RotateCcw,
  Layers,
  MapPin,
  Award,
  Zap,
  ListChecks,
} from 'lucide-react'
import { useAudioContext } from '../contexts/AudioContext'
import { ALL_RADIO_STATIONS } from '../data/ambientSounds'

export interface TourStep {
  id: number
  isCore?: boolean // 是否纳入「5站极速精华路线」
  title: string
  route: string
  icon: any
  badge: string
  highlightColor: string
  summary: string
  whereHint: string
  checklist: string[]
  tips: string[]
  targetSelectors?: string[]
  pointerLabel?: string
  actionLabel?: string
  actionType?:
    | 'play_music'
    | 'ask_ai'
    | 'open_quicknote'
    | 'inspect_mastery'
    | 'open_quiz'
    | 'open_errors'
    | 'open_study'
    | 'open_coursewares'
    | 'open_flashcards'
    | 'open_politics'
    | 'open_editor'
  sampleQuestions?: string[]
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    isCore: true,
    title: '首页全景总台 · 每日冲刺起点',
    route: '/dashboard',
    icon: Home,
    badge: '必看核心 · 每日总览',
    highlightColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    summary:
      '每天打开研核先看一眼这里：初试精准倒计时、408/数学/英语/政治四核直达舱、薄弱盲区预警与每日积分打卡全部就绪。',
    whereHint: '点击顶部导航栏「总览」（手机端底部第 1 个「首页」图标）',
    checklist: [
      '确认页面顶部的考研初试倒计时与今日学习概览',
      '浏览 408 / 数学 / 政治 / 英语四张主力学科直达卡',
      '点击顶栏右上角「算力积分」徽章可每日签到领免费积分',
    ],
    tips: ['顶栏右侧风格胶囊支持一键切换「极简 / 鲜艳 / 护眼 / 暗黑」四种舒适主题'],
    targetSelectors: ['[data-tour="nav-dashboard"]', '[data-tour="nav-mobile-home"]'],
    pointerLabel: '点这里随时回到首页总览总台',
    actionLabel: '切换到首页工作台看看',
  },
  {
    id: 2,
    isCore: false,
    title: '全站秒搜 (Ctrl+K) & 极速随手记',
    route: '/dashboard',
    icon: PenLine,
    badge: '效率神器 · 灵感不中断',
    highlightColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    summary:
      '想找某道真题或定理按 Ctrl+K 一秒定位；刷题半路冒出好思路或易错结论，唤出「随手记」侧栏写完即存，绝不打断做题节奏。',
    whereHint: '顶栏「搜索...」按钮（Ctrl+K）；「更多功能 → 极速随手记」',
    checklist: [
      '点击下方体验按钮当场滑出「随手记」闪电便签抽屉',
      '试着点选顶部学科胶囊（如 408、高数）自动打好分类标签',
      '记住在全站任何界面按 Ctrl+K 都能秒搜笔记与历年真题',
    ],
    tips: ['随手记支持直接粘贴截图与插入公式，自动归档至本地「随手记」目录'],
    targetSelectors: ['[data-tour="btn-search"]', '[data-tour="btn-mobile-search"]'],
    pointerLabel: '全站极速搜索入口（快捷键 Ctrl+K）',
    actionLabel: '立即弹出随手记抽屉试试',
    actionType: 'open_quicknote',
  },
  {
    id: 3,
    isCore: true,
    title: '刷题中心 · 历年整卷、答题卡与草稿纸',
    route: '/quiz',
    icon: ClipboardList,
    badge: '必看核心 · 刷真题主阵地',
    highlightColor: 'text-amber-800 bg-amber-50 border-amber-200',
    summary:
      '收录 1987–2024 考研数学与 2009–2024 统考 408 精校卷！支持整卷模考、章节专项与自由抽题，做题右侧自带分色答题卡与屏幕演草白板。',
    whereHint: '点击顶部导航栏「刷题中心」（手机端底部点「刷题」）',
    checklist: [
      '查看顶部的 4 大模式标签（真题整卷 / 题型专项 / 自由组卷 / 错题本）',
      '点开任意一套真题或「自由组卷 → 立即开始」进入沉浸做题面板',
      '在右侧面板试试点题号跳转、切到「草稿纸」手写推演或看「定理速查」',
    ],
    tips: ['做题卡壳时按 Ctrl+J（或点「追问 AI」），导师直接盯着当前题干给你拆解步骤！'],
    targetSelectors: ['[data-tour="nav-quiz"]', '[data-tour="nav-mobile-quiz"]'],
    pointerLabel: '刷真题与专项模考主阵地：刷题中心',
    actionLabel: '前往刷题中心实景体验',
    actionType: 'open_quiz',
  },
  {
    id: 4,
    isCore: false,
    title: '智能错题本 · 三维归因与变式斩题',
    route: '/quiz?tab=errors',
    icon: Flame,
    badge: '查漏闭环 · 消灭失分点',
    highlightColor: 'text-rose-700 bg-rose-50 border-rose-200',
    summary:
      '刷题答错自动按学科、考点与错因归档，告别低效手抄。支持一键抽题重考，还能召唤 AI 命制同考点变式新题检验是否真学透。',
    whereHint: '在「刷题中心」顶部栏点击第 4 个「错题本」标签',
    checklist: [
      '浏览错题列表中的原选答案对比与分步踩分解析',
      '按错因类型（概念混淆 / 计算失误等）筛选高频易错项',
      '点击「错题重练」或「AI 变式强化」，彻底拔除顽固错题',
    ],
    tips: ['在交卷结算页点击「存入错题本」可将典型难题一键保存为双链 Markdown 笔记'],
    targetSelectors: ['[data-tour="nav-quiz"]', '[data-tour="nav-mobile-quiz"]'],
    pointerLabel: '智能错题本位于「刷题中心」第 4 个标签',
    actionLabel: '直达智能错题本面板',
    actionType: 'open_errors',
  },
  {
    id: 5,
    isCore: false,
    title: '研学中心 · 讲义、PDF双栏啃书与提取',
    route: '/study',
    icon: BookOpen,
    badge: '啃书神器 · 8合1研学舱',
    highlightColor: 'text-blue-700 bg-blue-50 border-blue-200',
    summary:
      '集结核心讲义、PDF 电子教材书架、11 级考点色谱与学习进度。支持高清 PDF 双栏伴读，并能从教材讲义中一键智能提取题库与闪卡！',
    whereHint: '点击顶部导航栏「研学中心」（手机端底部点「研学」）',
    checklist: [
      '浏览各科「核心讲义」或切换到「真题教材」打开高清 PDF 阅读器',
      '试试右上角「记批注」透明荧光笔画板，直接在讲义上圈画重点',
      '点开「考点色谱」或「研学进度」，掌握 22 大核心枢纽推进度',
    ],
    tips: ['支持导入你自己的名师 PDF 讲义或押题卷，一键提取知识点卡片入库'],
    targetSelectors: ['[data-tour="nav-study"]', '[data-tour="nav-mobile-study"]'],
    pointerLabel: '讲义、PDF教材、课件与闪卡都在「研学中心」',
    actionLabel: '前往研学中心总台',
    actionType: 'open_study',
  },
  {
    id: 6,
    isCore: true,
    title: '22+ 动态仿真课件 & SM-2 记忆闪卡',
    route: '/study?tab=coursewares',
    icon: Cpu,
    badge: '必看核心 · 动画破难点',
    highlightColor: 'text-cyan-800 bg-cyan-50 border-cyan-200',
    summary:
      'AVL/红黑树旋转、LRU 页面置换、TCP 拥塞窗口与泰勒逼近全都可单步回放、自定义填数据推演！搭配「记忆闪卡」在遗忘临界点自动提醒复盘。',
    whereHint: '在「研学中心」子标签点击「仿真课件」或「记忆闪卡」',
    checklist: [
      '点开任意一个仿真实验（如 AVL 树或页面置换），体验单步前进与代码同步高亮',
      '试着修改输入测试序列，亲眼观察算法指针与数据结构每一步如何演变',
      '顺手切到旁边「记忆闪卡」翻开一张卡片，体验「生疏/模糊/掌握」智能排期',
    ],
    tips: ['408 综合算法与机理大题亲手跑一遍动画，比死背十遍文字记得更牢'],
    targetSelectors: ['[data-tour="nav-study"]', '[data-tour="nav-mobile-study"]'],
    pointerLabel: '动画仿真课件与抗遗忘闪卡入口',
    actionLabel: '一键直达动态仿真课件区',
    actionType: 'open_coursewares',
  },
  {
    id: 7,
    isCore: false,
    title: 'SM-2 抗遗忘闪卡 · 每天 15 分钟锁分',
    route: '/study?tab=flashcards',
    icon: GraduationCap,
    badge: '科学记忆 · 告别反复重背',
    highlightColor: 'text-teal-800 bg-teal-50 border-teal-200',
    summary:
      '正面看问题默想答案，翻面核对后诚实打分。系统按艾宾浩斯遗忘曲线动态计算下次复习间隔：生疏卡高频强化，熟练卡自动延后。',
    whereHint: '在「研学中心」子导航栏点击「记忆闪卡」',
    checklist: [
      '查看今日到期需要复习的闪卡队列数量',
      '点击卡片丝滑翻面，核对印刷级 KaTeX 公式与标准解析',
      '点选「忘记 / 模糊 / 掌握」，把今日待复习队列清零',
    ],
    tips: ['在笔记编辑器或考研背词页，均可把重点公式和难词一键转存为闪卡'],
    targetSelectors: ['[data-tour="nav-study"]', '[data-tour="nav-mobile-study"]'],
    pointerLabel: '每日抗遗忘闪卡队列入口',
    actionLabel: '切换到记忆闪卡体验翻转',
    actionType: 'open_flashcards',
  },
  {
    id: 8,
    isCore: true,
    title: '红黄绿掌握热力图 & 提分急救舱',
    route: '/graph',
    icon: Network,
    badge: '必看核心 · 靶向排雷星图',
    highlightColor: 'text-purple-800 bg-purple-50 border-purple-200',
    summary:
      '两张王牌视图：在「掌握热力图」一眼揪出闪烁红灯盲区，点红点即开急救舱看课件+练5题救绿；切到「关系图谱」纵览全库双链脉络！',
    whereHint: '顶栏「更多功能 → 知识图谱网络」（手机端首页点「知识图谱」）',
    checklist: [
      '切换「掌握热力图」与「双链关系网」，用滚轮缩放或拖拽漫游星图',
      '单击任意闪烁红色盲区节点，体验弹出「提分急救舱」5 题靶向突击',
      '在关系图谱双击任意节点，在右侧抽屉直接就地阅读原笔记',
    ],
    tips: ['带橙色呼吸边框的圆点是尚未连线的孤岛笔记，建议用 [[双链]] 织入主干网'],
    targetSelectors: ['[data-tour="btn-more"]', '[data-tour="nav-mobile-all"]'],
    pointerLabel: '热力图与双链星空图位于「更多功能」菜单',
    actionLabel: '打开热力星图并查看诊断说明',
    actionType: 'inspect_mastery',
  },
  {
    id: 9,
    isCore: false,
    title: '双链公式笔记系统 · Obsidian 实时同步',
    route: '/editor',
    icon: FileEdit,
    badge: '知识大脑 · 100%本地主权',
    highlightColor: 'text-sky-800 bg-sky-50 border-sky-200',
    summary:
      '默认优先进入防误触学术预览；切写作态支持富文本顺滑打字与源码互切、新建多级文件夹、Σ 公式速插、即学即练 3 题自测与本地 Obsidian 秒级同步！',
    whereHint: '顶栏「更多功能 → 笔记编辑」（手机端「全部 → 笔记编辑」）',
    checklist: [
      '点击左侧目录任意笔记体验纯净预览，再点右上角「切换写作模式」编辑',
      '试试「新建目录」建立多级学科文件夹，并用 Σ 菜单速插微积分矩阵公式',
      '点击下方按钮直达笔记编辑器，可衔接开启 7 步编辑器专属精讲导览',
    ],
    tips: ['所有笔记以通用 .md 纯文本落盘本机硬盘，绝无封闭格式锁定'],
    targetSelectors: ['[data-tour="btn-more"]', '[data-tour="nav-mobile-all"]'],
    pointerLabel: '双链 Markdown 笔记工作台入口',
    actionLabel: '进入笔记工作台并开启专属导览',
    actionType: 'open_editor',
  },
  {
    id: 10,
    isCore: false,
    title: '全新背词巡航默写 & 1839–2026 史纲地图',
    route: '/english',
    icon: Layers,
    badge: '公共课王牌 · 语政双绝杀',
    highlightColor: 'text-rose-700 bg-rose-50 border-rose-200',
    summary:
      '考研英语配齐整卷点词即查、20分制 AI 四维精批与「拼写默写 + 耳机随身巡航背词」；考研政治升级 1839–2026 矢量中国地图、同城史实联动与“十五五”时政千题！',
    whereHint: '点击顶部导航栏「学科专项」下拉菜单（手机端底部点「背词」或首页卡片）',
    checklist: [
      '打开「学科专项」菜单，认识 408、数学、政治、英语、背词五大独立入口',
      '在考研英语页体验 20 分制 AI 四维批改，或去背词页试试「拼写默写/随身巡航」',
      '点击下方按钮前往「考研政治」，漫游 1839–2026 史纲全景地图与千题精粹',
    ],
    tips: ['史纲地图支持点击同一城市循环查看不同时期的重大会议，彻底告别张冠李戴'],
    targetSelectors: ['[data-tour="nav-subjects"]', '[data-tour="nav-mobile-vocab"]'],
    pointerLabel: '英语、背词与政治史纲地图均在「学科专项」',
    actionLabel: '前往漫游 1839–2026 史纲全景地图',
    actionType: 'open_politics',
  },
  {
    id: 11,
    isCore: true,
    title: '分科 AI 导师思考流 & 奶龙×大肥鱼伴学',
    route: '/chat',
    icon: MessageCircle,
    badge: '必看核心 · 名师与双宠伴学',
    highlightColor: 'text-violet-800 bg-violet-50 border-violet-200',
    summary:
      '4 位分科导师支持 DeepSeek 思考链零缓冲流式直出、划词追问与 6 款沉浸背景；右下角更有「奶龙🍗」与「大肥鱼🍚」30+ 真人语音陪伴及自由缩放随身聊，开着 Lofi 电台专注到底！',
    whereHint: '顶栏「AI 伴学」（Ctrl+Shift+A）；屏幕右下角切换奶龙/大肥鱼随身聊',
    checklist: [
      '点击下方任一考研经典真题提问，观察 AI 导师如何透明展开思考链逐步推导',
      '点击右下角萌宠试试摸头语音互动，或拖动/八向缩放「随身聊」自由视窗',
      '点击下方按钮一键开启跨页面不断流的精选自习室 Lofi 白噪音电台',
    ],
    tips: ['恭喜走完导览！今后任何功能不确定怎么用，随时点顶栏「使用手册」查视觉百科'],
    targetSelectors: ['[data-tour="nav-chat"]', '[data-tour="btn-theme"]'],
    pointerLabel: '分科 AI 伴学工作台（快捷键 Ctrl+Shift+A 随时呼出）',
    actionLabel: '一键开启自习室白噪音电台试试',
    actionType: 'play_music',
    sampleQuestions: [
      '考研高数：用通俗语言分步讲透拉格朗日与柯西中值定理的构造辅助函数切入点。',
      '408计网：详细对比 TCP 拥塞控制四个阶段（慢开始、拥塞避免、快重传、快恢复）的窗口切换细节。',
      '408操作系统：32位逻辑地址在两级页表机制下如何拆分为外层页号、页表索引与页内偏移量？',
    ],
  },
]

export interface InteractiveTourGuideProps {
  isOpen: boolean
  onClose: () => void
}

const CHECKLIST_STORAGE_KEY = 'coreforge_tour_checklist_v2'

export default function InteractiveTourGuide({ isOpen, onClose }: InteractiveTourGuideProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setQueue, play } = useAudioContext()

  // 路线模式：'core' (5站极速精华) | 'full' (11站全景通关)
  const [tourMode, setTourMode] = useState<'core' | 'full'>(() => {
    try {
      const saved = localStorage.getItem('coreforge_tour_mode')
      return saved === 'core' ? 'core' : 'full'
    } catch {
      return 'full'
    }
  })

  const activeSteps = useMemo(
    () => (tourMode === 'core' ? TOUR_STEPS.filter((s) => s.isCore) : TOUR_STEPS),
    [tourMode]
  )

  const [dockSide, setDockSide] = useState<'left' | 'right'>(() => {
    try {
      const saved = localStorage.getItem('coreforge_tour_dock_side')
      return (saved as 'left' | 'right') || 'left'
    } catch {
      return 'left'
    }
  })

  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('coreforge_tour_step')
      const num = saved ? parseInt(saved, 10) : 0
      return num >= 0 && num < TOUR_STEPS.length ? num : 0
    } catch {
      return 0
    }
  })

  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const [isMinimized, setIsMinimized] = useState(false)
  const [showStepMap, setShowStepMap] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [spotlightEnabled, setSpotlightEnabled] = useState(true)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const safeIndex = Math.min(currentStepIndex, Math.max(0, activeSteps.length - 1))
  const step = activeSteps[safeIndex] || activeSteps[0]
  const isLastStep = safeIndex === activeSteps.length - 1

  const currentBaseRoute = location.pathname + (location.search || '')
  const targetRoutePath = step.route.split('?')[0]
  const isCurrentRoute = step.route.includes('?')
    ? currentBaseRoute === step.route || location.pathname === targetRoutePath
    : location.pathname.startsWith(targetRoutePath)

  useEffect(() => {
    try {
      localStorage.setItem('coreforge_tour_step', safeIndex.toString())
    } catch {}
  }, [safeIndex])

  useEffect(() => {
    try {
      localStorage.setItem('coreforge_tour_mode', tourMode)
    } catch {}
  }, [tourMode])

  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedMap))
    } catch {}
  }, [checkedMap])

  // 切换路线模式时重置索引至合法范围
  const handleSwitchMode = (nextMode: 'core' | 'full') => {
    if (nextMode === tourMode) return
    setTourMode(nextMode)
    setCurrentStepIndex(0)
    setShowCelebration(false)
    setActionFeedback(
      nextMode === 'core'
        ? '已切换为「5 站极速核心路线」，2 分钟掌握最关键提分闭环！'
        : '已切换为「11 站全景深度路线」，完整探索每一项研学神器！'
    )
  }

  // 追踪当前引导目标 DOM 元素矩形坐标
  const updateSpotlightRect = useCallback(() => {
    if (
      !isOpen ||
      isMinimized ||
      showCelebration ||
      !spotlightEnabled ||
      !step.targetSelectors?.length
    ) {
      setSpotlightRect(null)
      return
    }
    let foundRect: DOMRect | null = null
    for (const selector of step.targetSelectors) {
      const el = document.querySelector(selector) as HTMLElement | null
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          foundRect = rect
          break
        }
      }
    }
    setSpotlightRect(foundRect)
  }, [isOpen, isMinimized, showCelebration, spotlightEnabled, step])

  useEffect(() => {
    updateSpotlightRect()
    const timer = setTimeout(updateSpotlightRect, 180)
    window.addEventListener('resize', updateSpotlightRect)
    window.addEventListener('scroll', updateSpotlightRect, true)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateSpotlightRect)
      window.removeEventListener('scroll', updateSpotlightRect, true)
    }
  }, [updateSpotlightRect, location.pathname, location.search])

  // 支持键盘左右方向键快速翻站（避开输入框焦点）
  useEffect(() => {
    if (!isOpen || isMinimized || showCelebration) return
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (e.target as HTMLElement | null)?.isContentEditable
      ) {
        return
      }
      if (e.key === 'ArrowRight' && safeIndex < activeSteps.length - 1) {
        const nextIdx = safeIndex + 1
        setCurrentStepIndex(nextIdx)
        navigate(activeSteps[nextIdx].route)
        setActionFeedback(null)
      } else if (e.key === 'ArrowLeft' && safeIndex > 0) {
        const prevIdx = safeIndex - 1
        setCurrentStepIndex(prevIdx)
        navigate(activeSteps[prevIdx].route)
        setActionFeedback(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, isMinimized, showCelebration, safeIndex, activeSteps, navigate])

  const toggleDockSide = () => {
    const nextSide = dockSide === 'left' ? 'right' : 'left'
    setDockSide(nextSide)
    try {
      localStorage.setItem('coreforge_tour_dock_side', nextSide)
    } catch {}
  }

  const toggleCheckItem = (stepId: number, itemIdx: number) => {
    const key = `${stepId}-${itemIdx}`
    setCheckedMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const completedStepsCount = activeSteps.filter((s) =>
    s.checklist.every((_, idx) => Boolean(checkedMap[`${s.id}-${idx}`]))
  ).length

  const currentStepDoneCount = step.checklist.filter((_, idx) =>
    Boolean(checkedMap[`${step.id}-${idx}`])
  ).length
  const isCurrentStepAllChecked = currentStepDoneCount === step.checklist.length

  if (!isOpen) return null

  const handleFinishAndDismiss = () => {
    try {
      localStorage.setItem('coreforge_onboarding_dismissed', 'true')
      localStorage.setItem('coreforge_tour_skipped', 'true')
    } catch {}
    setShowCelebration(false)
    onClose()
  }

  const handleGoToRoute = (targetRoute?: string) => {
    const dest = targetRoute || step.route
    navigate(dest)
  }

  const handleNext = () => {
    if (isLastStep) {
      setShowCelebration(true)
    } else {
      const nextIndex = safeIndex + 1
      setCurrentStepIndex(nextIndex)
      navigate(activeSteps[nextIndex].route)
      setActionFeedback(null)
      setShowStepMap(false)
    }
  }

  const handlePrev = () => {
    if (showCelebration) {
      setShowCelebration(false)
      return
    }
    if (safeIndex > 0) {
      const prevIndex = safeIndex - 1
      setCurrentStepIndex(prevIndex)
      navigate(activeSteps[prevIndex].route)
      setActionFeedback(null)
      setShowStepMap(false)
    }
  }

  const handleResetProgress = () => {
    setCheckedMap({})
    setCurrentStepIndex(0)
    setShowCelebration(false)
    navigate(activeSteps[0].route)
    setActionFeedback('已重置打卡进度，从第 1 站重新启程！')
  }

  // 执行对应引导站的快捷实操动作
  const handlePerformAction = (customQuestion?: string) => {
    if (customQuestion) {
      if (!location.pathname.startsWith('/chat')) {
        navigate('/chat')
      }
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('chat-prefill-question', {
            detail: { question: customQuestion, autoSend: true },
          })
        )
      }, 300)
      setActionFeedback('已将真题发给分科 AI 导师，正在为您零缓冲流式拆解...')
      return
    }

    switch (step.actionType) {
      case 'play_music': {
        if (ALL_RADIO_STATIONS.length > 0) {
          const s = ALL_RADIO_STATIONS[0]
          setQueue(ALL_RADIO_STATIONS, 0)
          play(s)
          setActionFeedback(`已开启「${s.title}」，切去任何页面刷题声音都会全程陪伴！`)
        } else {
          navigate('/music?tab=radio')
        }
        break
      }
      case 'ask_ai': {
        const q =
          (step.sampleQuestions && step.sampleQuestions[0]) ||
          '帮我分步讲清楚柯西中值定理的证明构造切入点。'
        if (!location.pathname.startsWith('/chat')) {
          navigate('/chat')
        }
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('chat-prefill-question', {
              detail: { question: q, autoSend: true },
            })
          )
        }, 300)
        setActionFeedback('已向分科 AI 导师发送问题，正在流式解答...')
        break
      }
      case 'open_quicknote': {
        window.dispatchEvent(new CustomEvent('open-quick-note'))
        setActionFeedback('已滑出随手记抽屉，试试点选科目标签写两句保存吧！')
        break
      }
      case 'inspect_mastery': {
        if (!location.pathname.startsWith('/graph')) {
          navigate('/graph')
        }
        window.dispatchEvent(
          new CustomEvent('open-user-guide', {
            detail: { tab: 'doc', category: 'spectrum_graph', featureId: 'mastery-spectrum' },
          })
        )
        break
      }
      case 'open_quiz': {
        navigate('/quiz')
        setActionFeedback('已来到刷题中心，可自由挑选「真题整卷」「题型专项」或「自由组卷」。')
        break
      }
      case 'open_errors': {
        navigate('/quiz?tab=errors')
        setActionFeedback('已直达智能错题本，可查看三维错因统计或开启错题重练。')
        break
      }
      case 'open_study': {
        navigate('/study')
        setActionFeedback('已来到研学中心，顶部一排标签可随时切换讲义、PDF教材与考点色谱。')
        break
      }
      case 'open_coursewares': {
        navigate('/study?tab=coursewares')
        setActionFeedback('已进入动态仿真课件实验室，挑一个算法模块即可体验单步推演！')
        break
      }
      case 'open_flashcards': {
        navigate('/study?tab=flashcards')
        setActionFeedback('已切换到 SM-2 记忆闪卡区，点击卡片翻面自评即可。')
        break
      }
      case 'open_politics': {
        navigate('/politics')
        setActionFeedback('已来到考研政治大本营，上方是 1839–2026 史纲全景地图，下方是千题精粹！')
        break
      }
      case 'open_editor': {
        navigate('/editor')
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('start-editor-tour'))
        }, 250)
        onClose()
        break
      }
      default: {
        navigate(step.route)
        break
      }
    }
  }

  // 最小化边角悬浮胶囊
  if (isMinimized) {
    return (
      <aside
        aria-label="实景引导快捷胶囊"
        className={`fixed z-[55] animate-fade-in ${
          dockSide === 'left'
            ? 'bottom-[calc(4.15rem+env(safe-area-inset-bottom,0px))] left-2.5 sm:bottom-6 sm:left-6'
            : 'bottom-[calc(4.15rem+env(safe-area-inset-bottom,0px))] right-2.5 sm:bottom-6 sm:right-6'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl hover:opacity-95 transition-all cursor-pointer font-sans text-xs border border-indigo-400/40 active:scale-95"
          title="展开手把手实景新手引导"
        >
          <img
            src="/pets/feiyu_happy.webp"
            alt="导览助手"
            className="w-5 h-5 rounded-full bg-white/90 object-contain shrink-0"
          />
          <span className="font-bold">
            实景导览 ({safeIndex + 1}/{activeSteps.length})
          </span>
          <Maximize2 className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
        </button>
      </aside>
    )
  }

  const dockPositionClass =
    dockSide === 'left'
      ? 'bottom-[calc(4.1rem+env(safe-area-inset-bottom,0px))] left-2 right-2 mx-auto sm:mx-0 sm:right-auto sm:bottom-6 sm:left-6'
      : 'bottom-[calc(4.1rem+env(safe-area-inset-bottom,0px))] left-2 right-2 mx-auto sm:mx-0 sm:left-auto sm:bottom-6 sm:right-6'

  // 聚光灯 2.0：SVG 柔光镂空暗角 + 双层流光聚焦框 + 智能防裁切指路胶囊（全程 pointer-events-none 不挡真实操作）
  const spotlightOverlay =
    spotlightEnabled && !showCelebration && spotlightRect && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[54] pointer-events-none">
            <svg className="fixed inset-0 w-full h-full" aria-hidden="true">
              <defs>
                <mask id="coreforge-tour-spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={Math.max(2, spotlightRect.left - 6)}
                    y={Math.max(2, spotlightRect.top - 6)}
                    width={spotlightRect.width + 12}
                    height={spotlightRect.height + 12}
                    rx="14"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(15, 23, 42, 0.16)"
                mask="url(#coreforge-tour-spotlight-mask)"
              />
            </svg>

            {/* 目标外围双层流光框 */}
            <div
              className="fixed rounded-2xl ring-2 ring-indigo-500 ring-offset-2 ring-offset-white/90 bg-indigo-500/10 shadow-[0_0_28px_rgba(99,102,241,0.48)] transition-all duration-200"
              style={{
                top: Math.max(2, spotlightRect.top - 5),
                left: Math.max(2, spotlightRect.left - 5),
                width: spotlightRect.width + 10,
                height: spotlightRect.height + 10,
              }}
            />

            {/* 智能防溢出指向气泡 */}
            {step.pointerLabel && (
              <div
                className="fixed px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-[10.5px] sm:text-xs font-bold shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-indigo-400/50 transition-all duration-200 max-w-[calc(100vw-16px)] truncate"
                style={{
                  top:
                    spotlightRect.bottom + 42 < window.innerHeight
                      ? spotlightRect.bottom + 10
                      : Math.max(8, spotlightRect.top - 36),
                  left: Math.min(
                    Math.max(8, spotlightRect.left),
                    Math.max(8, window.innerWidth - 230)
                  ),
                }}
              >
                <Crosshair className="w-3 h-3 text-amber-300 shrink-0" aria-hidden="true" />
                <span className="truncate">{step.pointerLabel}</span>
              </div>
            )}
          </div>,
          document.body
        )
      : null

  return (
    <>
      {spotlightOverlay}

      <aside
        aria-label="手把手实景功能向导"
        className={`fixed z-[55] w-[calc(100vw-1.25rem)] max-w-[360px] sm:max-w-[435px] sm:w-[435px] rounded-2xl sm:rounded-3xl bg-white/98 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.28)] overflow-hidden animate-fade-in font-sans text-slate-900 flex flex-col max-h-[48dvh] sm:max-h-[84vh] ${dockPositionClass}`}
      >
        {/* 头部深色科技伴学控制栏 */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <button
            type="button"
            onClick={() => setShowStepMap((v) => !v)}
            className="flex items-center gap-2 min-w-0 hover:opacity-90 transition-opacity cursor-pointer text-left"
            title="点击展开或收起全部导览站点目录"
          >
            <img
              src={safeIndex % 2 === 0 ? '/pets/nailong_wave.webp' : '/pets/feiyu_happy.webp'}
              alt="伴学向导"
              className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-white/95 p-0.5 object-contain shrink-0 ring-1 ring-amber-300/60"
            />
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-extrabold text-white flex items-center gap-1">
                <span className="truncate">
                  {showCelebration
                    ? '🎉 新手训练营通关'
                    : `实景向导 · 第 ${safeIndex + 1}/${activeSteps.length} 站`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-amber-300 transition-transform shrink-0 ${
                    showStepMap ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSpotlightEnabled((v) => !v)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                spotlightEnabled
                  ? 'bg-indigo-500/30 text-amber-200 border border-indigo-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title={spotlightEnabled ? '关闭屏幕聚光指路框' : '开启屏幕聚光指路框'}
            >
              <Crosshair className="w-3 h-3" aria-hidden="true" />
              <span className="hidden sm:inline">{spotlightEnabled ? '聚光开' : '聚光关'}</span>
            </button>

            <button
              type="button"
              onClick={toggleDockSide}
              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={dockSide === 'left' ? '移到右下角停靠' : '移到左下角停靠'}
            >
              <MoveHorizontal className="w-3 h-3" aria-hidden="true" />
              <span>{dockSide === 'left' ? '靠左' : '靠右'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('open-user-guide', { detail: { tab: 'doc' } })
                )
              }
              className="p-1 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="打开全功能视觉手册"
              aria-label="打开全功能视觉手册"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="收起为边角迷你胶囊"
              aria-label="收起为边角迷你胶囊"
            >
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleFinishAndDismiss}
              className="p-1 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="结束导览"
              aria-label="结束导览"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 路线模式切换 + 打卡进度条 */}
        {!showCelebration && (
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 text-[10.5px] sm:text-[11px] shrink-0">
            {/* 极速 5 站 vs 全景 11 站 切换胶囊 */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/80 text-[10px] font-bold shrink-0">
              <button
                type="button"
                onClick={() => handleSwitchMode('core')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer flex items-center gap-0.5 ${
                  tourMode === 'core'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-2.5 h-2.5" aria-hidden="true" />
                <span>5站精华</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('full')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  tourMode === 'full'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                11站全景
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(8, Math.round(((safeIndex + 1) / activeSteps.length) * 100))}%`,
                  }}
                />
              </div>
              <span className="text-slate-500 font-mono text-[10px] shrink-0">
                已打卡 {completedStepsCount}
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetProgress}
              className="text-slate-400 hover:text-slate-700 inline-flex items-center gap-0.5 cursor-pointer shrink-0"
              title="重置实操打卡进度"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* 下拉站点全览地图抽屉 */}
        {showStepMap && !showCelebration && (
          <div className="border-b border-slate-200 bg-slate-50/95 p-2.5 max-h-52 overflow-y-auto overscroll-contain space-y-1">
            <div className="px-1.5 pb-1 flex items-center justify-between text-[10.5px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <ListChecks className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                <span>点击任意站点可直接空降体验：</span>
              </span>
              <button
                type="button"
                onClick={() => setShowStepMap(false)}
                className="text-indigo-600 hover:underline cursor-pointer"
              >
                收起列表
              </button>
            </div>
            {activeSteps.map((s, idx) => {
              const stepDone = s.checklist.every((_, cIdx) => Boolean(checkedMap[`${s.id}-${cIdx}`]))
              const active = idx === safeIndex
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setCurrentStepIndex(idx)
                    navigate(s.route)
                    setActionFeedback(null)
                    setShowStepMap(false)
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-white hover:bg-indigo-50/70 text-slate-700 border border-slate-200/70'
                  }`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] opacity-75">0{idx + 1}</span>
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{s.title}</span>
                  </span>
                  {stepDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                  ) : (
                    <ArrowRight className="w-3 h-3 opacity-40 shrink-0" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* 主体内容区：通关庆祝界面 OR 当前站详情 */}
        {showCelebration ? (
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto overscroll-contain text-center">
            <div className="inline-flex items-center justify-center gap-2 mx-auto px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold">
              <Award className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span>恭喜通关 CoreForge 研核新手训练营！</span>
            </div>

            <div className="flex items-center justify-center gap-3 py-1">
              <img
                src="/pets/nailong_happy.webp"
                alt="奶龙祝贺"
                className="w-14 h-14 rounded-2xl bg-amber-50 p-1 object-contain border border-amber-200 shadow-xs"
              />
              <img
                src="/pets/feiyu_dance.webp"
                alt="大肥鱼祝贺"
                className="w-14 h-14 rounded-2xl bg-sky-50 p-1 object-contain border border-sky-200 shadow-xs"
              />
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                全套提分装备已解锁，准备发车！
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                你已经摸清了研核的核心工作流。接下来挑一个你今天最想推进的目标立即开练吧：
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 text-left">
              {[
                {
                  label: '去刷一套历年统考真题 / 专项测验',
                  sub: '进入刷题中心，右侧自带答题卡与演草白板',
                  route: '/quiz',
                  cls: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-950',
                },
                {
                  label: '打开双链公式笔记写今日复盘',
                  sub: '支持 Σ 数学公式速插与本地 Obsidian 实时同步',
                  route: '/editor',
                  cls: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-950',
                },
                {
                  label: '向分科 AI 导师提问重难点推导',
                  sub: '研小核、数小通、英小研、政小思随时在线',
                  route: '/chat',
                  cls: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-950',
                },
              ].map((act) => (
                <button
                  key={act.route}
                  type="button"
                  onClick={() => {
                    navigate(act.route)
                    handleFinishAndDismiss()
                  }}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${act.cls}`}
                >
                  <div>
                    <div className="text-xs font-extrabold">{act.label}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{act.sub}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                ← 返回查看站点
              </button>
              <button
                type="button"
                onClick={handleFinishAndDismiss}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
              >
                开启高效备考 ✓
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-3 sm:p-4 space-y-2.5 sm:space-y-3 overflow-y-auto overscroll-contain flex-1">
              {/* 标题与跳转页按钮 */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] sm:text-2xs font-extrabold border ${step.highlightColor}`}
                  >
                    {step.badge}
                  </span>
                  <h4 className="mt-1 text-xs sm:text-[15px] font-extrabold text-slate-900 flex items-center gap-1.5">
                    <step.icon className="h-4 w-4 text-indigo-600 shrink-0" aria-hidden="true" />
                    <span className="truncate">{step.title}</span>
                  </h4>
                </div>

                {!isCurrentRoute && (
                  <button
                    type="button"
                    onClick={() => handleGoToRoute()}
                    className="shrink-0 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10.5px] sm:text-2xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span>跳到该页</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* 入口位置定位条 */}
              <div className="px-2.5 py-1.5 rounded-xl bg-indigo-50/75 border border-indigo-200/70 text-indigo-950 text-[10.5px] sm:text-[11.5px] flex items-start gap-1.5 leading-snug">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong className="font-extrabold">位置：</strong>
                  {step.whereHint}
                </span>
              </div>

              {/* 大白话精讲 */}
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{step.summary}</p>

              {/* 手把手实操打卡清单 */}
              <div className="p-2.5 rounded-xl bg-amber-50/65 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] font-extrabold text-amber-950">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>跟着试一试（点击即可打勾）：</span>
                  </span>
                  <span className="font-mono text-amber-700">
                    {currentStepDoneCount}/{step.checklist.length}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {step.checklist.map((itemText, idx) => {
                    const checked = Boolean(checkedMap[`${step.id}-${idx}`])
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleCheckItem(step.id, idx)}
                        className={`w-full text-left flex items-start gap-2 px-2.5 py-1.5 rounded-lg border text-[10.5px] sm:text-[11.5px] leading-snug transition-all cursor-pointer ${
                          checked
                            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                            : 'bg-white/95 border-amber-200/70 text-slate-800 hover:bg-white'
                        }`}
                      >
                        {checked ? (
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle
                            className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                        <span className={checked ? 'line-through opacity-80' : ''}>{itemText}</span>
                      </button>
                    )
                  })}
                </div>

                {isCurrentStepAllChecked && (
                  <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>本站实操全部达成！点右下角「下一站」继续闯关</span>
                  </div>
                )}
              </div>

              {/* 快捷演示动作按钮 */}
              {step.actionLabel && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handlePerformAction()}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:opacity-95 text-white text-[11px] sm:text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {step.actionType === 'play_music' ? (
                      <Play className="w-3.5 h-3.5 fill-current text-sky-400" aria-hidden="true" />
                    ) : step.actionType === 'ask_ai' ? (
                      <MessageCircle className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                    ) : step.actionType === 'open_quicknote' ? (
                      <PenLine className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                    )}
                    <span>{step.actionLabel}</span>
                  </button>

                  {step.sampleQuestions && step.sampleQuestions.length > 0 && (
                    <div className="space-y-1.5 pt-0.5">
                      <span className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" aria-hidden="true" />
                        <span>点选一道考研真题，当场发给 AI 导师拆解：</span>
                      </span>
                      <div className="space-y-1">
                        {step.sampleQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePerformAction(q)}
                            className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-300 text-[10.5px] sm:text-2xs text-slate-800 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                          >
                            <span className="truncate">{q}</span>
                            <Send
                              className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0"
                              aria-hidden="true"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {actionFeedback && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] sm:text-2xs font-semibold animate-fade-in flex items-start gap-1.5">
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{actionFeedback}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 小锦囊 */}
              {step.tips.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  {step.tips.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-1.5 text-[10.5px] sm:text-2xs text-slate-500 leading-relaxed"
                    >
                      <Lightbulb className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 底部翻站栏 */}
            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-50/90 text-[11px] sm:text-xs shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                disabled={safeIndex === 0}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>上一站</span>
              </button>

              {/* 步骤圆点轨道 */}
              <div className="flex items-center gap-1">
                {activeSteps.map((s, idx) => {
                  const stepDone = s.checklist.every((_, cIdx) =>
                    Boolean(checkedMap[`${s.id}-${cIdx}`])
                  )
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setCurrentStepIndex(idx)
                        navigate(s.route)
                        setActionFeedback(null)
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === safeIndex
                          ? 'w-4 bg-indigo-600'
                          : stepDone
                          ? 'w-2 bg-emerald-500 hover:bg-emerald-600'
                          : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                      }`}
                      title={`第 ${idx + 1} 站：${s.title}`}
                      aria-label={`跳转到第 ${idx + 1} 站：${s.title}`}
                    />
                  )
                })}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <span>{isLastStep ? '完成通关 🎉' : '下一站'}</span>
                {!isLastStep && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
