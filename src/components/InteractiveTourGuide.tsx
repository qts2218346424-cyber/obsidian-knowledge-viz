import { createPortal } from 'react-dom'
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
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
  Music,
  Play,
  Send,
  MoveHorizontal,
  Lightbulb,
  BookOpen,
  Cpu,
  PenLine,
  Crosshair,
  RotateCcw,
  Layers,
  MapPin,
} from 'lucide-react'
import { useAudioContext } from '../contexts/AudioContext'
import { ALL_RADIO_STATIONS } from '../data/ambientSounds'

export interface TourStep {
  id: number
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
  sampleQuestions?: string[]
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: '首页工作台 · 每天复习总览',
    route: '/dashboard',
    icon: Home,
    badge: '第 1 站 · 每天起点',
    highlightColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    summary:
      '每天打开平台先来这里瞄一眼：距离考研还有多少天、四门统考入口、薄弱点提醒和常用工具全在首屏摆好了。',
    whereHint: '点击顶部导航栏「总览」（手机端底部第 1 个「首页」图标）',
    checklist: [
      '看看页面顶部的考研倒计时与今日打卡状态',
      '认识 408 / 数学 / 政治 / 英语四张科目直达卡片',
      '点一下右上角「算力积分」徽章可每日签到领积分',
    ],
    tips: ['右上角风格胶囊可以一键切换「极简 / 鲜艳 / 护眼 / 暗黑」四种护眼外观'],
    targetSelectors: ['[data-tour="nav-dashboard"]', '[data-tour="nav-mobile-home"]'],
    pointerLabel: '点这里回首页工作台',
    actionLabel: '切换到首页工作台看看',
  },
  {
    id: 2,
    title: '全站搜索 & 随手记 · 灵感秒记',
    route: '/dashboard',
    icon: PenLine,
    badge: '第 2 站 · 高效入口',
    highlightColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    summary:
      '刷题或看书时想搜某个定理，按 Ctrl+K 一秒找到；突然冒出好思路或易错点，用「随手记」滑出窗口直接存，不用切页面。',
    whereHint: '顶栏「搜索...」按钮（Ctrl+K）；「更多功能 → 极速随手记」或下方一键体验',
    checklist: [
      '点击下方按钮当场弹出「随手记」抽屉体验',
      '试着点一下上方学科标签（如 408、高数）自动打标签',
      '体验完关掉抽屉，记住搜全站笔记/真题直接按 Ctrl+K',
    ],
    tips: ['随手记的内容会自动保存到本地笔记库的「随手记」文件夹，支持传图与数学公式'],
    targetSelectors: ['[data-tour="btn-search"]', '[data-tour="btn-mobile-search"]'],
    pointerLabel: '点这里全站秒搜（快捷键 Ctrl+K）',
    actionLabel: '立即弹出随手记抽屉试试',
    actionType: 'open_quicknote',
  },
  {
    id: 3,
    title: '刷题中心 · 真题、专项与答题卡',
    route: '/quiz',
    icon: ClipboardList,
    badge: '第 3 站 · 刷真题',
    highlightColor: 'text-amber-600 bg-amber-50 border-amber-200',
    summary:
      '想成套做历年真题就选「真题整卷」，想单练某章题型就选「题型专项」，想随便抽几题测验就选「自由组卷」。做题时右边就是答题卡与草稿纸。',
    whereHint: '点击顶部导航栏「刷题中心」（手机端底部点「刷题」）',
    checklist: [
      '观察页面顶部的 4 个模式切换按钮（真题整卷 / 题型专项 / 自由组卷 / 错题本）',
      '点开任意一套题或「自由组卷 → 立即开始」进入做题面板',
      '在右侧（或手机底部）试着点「答题卡」跳题号、切到「草稿纸」手写演算',
    ],
    tips: ['做题拿不准时，点一下「追问 AI」或者按 Ctrl+J，AI 老师直接对着当前题目给你讲'],
    targetSelectors: ['[data-tour="nav-quiz"]', '[data-tour="nav-mobile-quiz"]'],
    pointerLabel: '这里是刷题主阵地：刷题中心',
    actionLabel: '前往刷题中心看看',
    actionType: 'open_quiz',
  },
  {
    id: 4,
    title: '错题本 · 自动收录与变式强化',
    route: '/quiz?tab=errors',
    icon: Flame,
    badge: '第 4 站 · 消灭错题',
    highlightColor: 'text-rose-600 bg-rose-50 border-rose-200',
    summary:
      '平时刷题答错的题都会自动存进这里，不用手抄错题本。支持把错题重新组卷再考一遍，也能叫 AI 出几道同类变式题检验是否真会了。',
    whereHint: '在「刷题中心」顶部栏点击第 4 个红色「错题本」标签',
    checklist: [
      '查看错题列表里的错误答案对照与分步解析',
      '勾选或补充错因标签，方便二轮复习避开同类坑',
      '点「错题重练」或「AI 变式强化」，彻底把错题消灭掉',
    ],
    tips: ['交卷结算页点击「存入错题本」可以把重点难题直接归档成 Markdown 错题笔记'],
    targetSelectors: ['[data-tour="nav-quiz"]', '[data-tour="nav-mobile-quiz"]'],
    pointerLabel: '错题本就在「刷题中心」第 4 个标签里',
    actionLabel: '直达错题本面板',
    actionType: 'open_errors',
  },
  {
    id: 5,
    title: '研学中心 · 讲义、教材与研学进度',
    route: '/study',
    icon: BookOpen,
    badge: '第 5 站 · 讲义学习',
    highlightColor: 'text-blue-600 bg-blue-50 border-blue-200',
    summary:
      '「研学中心」把各科核心讲义、真题电子教材、全景图谱和个人学习进度汇集在一处，看讲义遇到重点还能在右上角开启「记批注」随手画线。',
    whereHint: '点击顶部导航栏「研学中心」（手机端底部点「研学」）',
    checklist: [
      '点开左侧或顶部的科目筛选（如 408 数据结构 / 考研数学）',
      '点开任意一篇「核心讲义」或切到「真题教材」查看 PDF',
      '点一下顶部的「研学进度」标签，看看各科当前完成百分比',
    ],
    tips: ['右上角「记批注」可在当前页面拉起透明画板，用荧光笔勾画讲义关键条件'],
    targetSelectors: ['[data-tour="nav-study"]', '[data-tour="nav-mobile-study"]'],
    pointerLabel: '讲义、闪卡、课件都在「研学中心」',
    actionLabel: '前往研学中心',
    actionType: 'open_study',
  },
  {
    id: 6,
    title: '仿真课件 · 看动画搞懂 408 难点',
    route: '/study?tab=coursewares',
    icon: Cpu,
    badge: '第 6 站 · 动态演示',
    highlightColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    summary:
      '红黑树旋转、LRU 页面置换、TCP 拥塞控制太抽象？在「仿真课件」里可以像放电影一样“上一步 / 下一步”单步播放，甚至自己填测试数据跑一遍。',
    whereHint: '在「研学中心」子导航栏点击「仿真课件」（或点下方按钮直达）',
    checklist: [
      '在下方列表任意点开一个仿真课件（如「页面置换」或「KMP 匹配」）',
      '点击底部的「单步前进 / 自动演示」，盯着动画和代码高亮行一起看',
      '试着改动输入序列，观察内部状态是如何一步步推演的',
    ],
    tips: ['数据结构和大题算法原理看懂一遍动画，比死背十遍文字记得还牢'],
    targetSelectors: ['[data-tour="nav-study"]', '[data-tour="nav-mobile-study"]'],
    pointerLabel: '仿真课件在「研学中心 → 仿真课件」',
    actionLabel: '一键切换查看仿真课件',
    actionType: 'open_coursewares',
  },
  {
    id: 7,
    title: '记忆闪卡 · 快忘记时提醒你复习',
    route: '/study?tab=flashcards',
    icon: GraduationCap,
    badge: '第 7 站 · 抗遗忘卡片',
    highlightColor: 'text-teal-600 bg-teal-50 border-teal-200',
    summary:
      '就像随身带着一叠核心考点问答卡：正面看问题想答案，翻面核对后选「忘记 / 模糊 / 记得」。系统会自动安排复习节奏，越不熟推得越勤。',
    whereHint: '在「研学中心」子导航栏点击「记忆闪卡」',
    checklist: [
      '点开一张今日到期的记忆闪卡，先自己在脑子里回忆答案',
      '点击卡片翻面查看标准解析',
      '诚实选择「忘记 / 模糊 / 记得」，让系统自动排好下次复习时间',
    ],
    tips: ['建议每天早晚花 10~15 分钟把待复习闪卡清零，琐碎协议和公式就不容易忘'],
    targetSelectors: ['[data-tour="nav-study"]', '[data-tour="nav-mobile-study"]'],
    pointerLabel: '记忆闪卡在「研学中心 → 记忆闪卡」',
    actionLabel: '一键切换进入记忆闪卡',
    actionType: 'open_flashcards',
  },
  {
    id: 8,
    title: '掌握热力图 & 知识关系网',
    route: '/graph',
    icon: Network,
    badge: '第 8 站 · 查漏地图',
    highlightColor: 'text-purple-600 bg-purple-50 border-purple-200',
    summary:
      '这里有两张王牌图：切到「掌握热力图」，红黄绿三色直接告诉你哪块没学透，点红点就能进急救舱做 5 题补救；切到「关系图谱」，看清全部笔记是怎么串联起来的。',
    whereHint: '顶栏「更多功能 → 知识图谱网络」（或手机端首页常用入口「知识图谱」）',
    checklist: [
      '在顶部切换热力图/关系网，用鼠标滚轮缩放或拖动画面看看',
      '单击任意红色闪烁圆点，体验弹出「提分急救舱」查看错题与 5 题突击',
      '切换到关系图谱时，双击任意圆点试试在右侧直接打开笔记原文',
    ],
    tips: ['关系图谱里带橙色边线的圆点代表还没有跟其他笔记连上线，复习时建议用 [[双链]] 串起来'],
    targetSelectors: ['[data-tour="btn-more"]', '[data-tour="nav-mobile-all"]'],
    pointerLabel: '知识图谱收在「更多功能」菜单里',
    actionLabel: '打开图谱并查看热力说明',
    actionType: 'inspect_mastery',
  },
  {
    id: 9,
    title: '英语背词 & 政治史纲时空轴',
    route: '/english',
    icon: Layers,
    badge: '第 9 站 · 公共课专项',
    highlightColor: 'text-violet-600 bg-violet-50 border-violet-200',
    summary:
      '除了 408 和数学，公共课也很趁手：考研英语支持词汇色谱记忆和 AI 逐句批改作文；考研政治把近代史纲重要事件排成了时间轴，下面直接配 1000 题。',
    whereHint: '点击顶部导航栏「学科专项」下拉菜单（手机端底部点「背词」或在首页点政治/英语卡片）',
    checklist: [
      '打开「学科专项」菜单，看看 408、数学、政治、英语四大独立入口',
      '在考研英语页试着输入作文或浏览长难句/词汇表',
      '也可以点下面按钮去「考研政治」划一划近代史纲时间轴',
    ],
    tips: ['背单词时可以筛选“高危生词”，先把不认识的红黄词优先攻克'],
    targetSelectors: ['[data-tour="nav-subjects"]', '[data-tour="nav-mobile-vocab"]'],
    pointerLabel: '公共课与四科入口都在「学科专项」',
    actionLabel: '顺便去看看考研政治时间轴',
    actionType: 'open_politics',
  },
  {
    id: 10,
    title: 'AI 伴学导师 & 白噪音自习室',
    route: '/chat',
    icon: MessageCircle,
    badge: '第 10 站 · 伴学与专注',
    highlightColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    summary:
      '遇到不会证的高数题或吃不透的 408 概念，在「AI 伴学」随时发问；学习前点一首「白噪音」电台，离开音乐页切回刷题声音照样放！',
    whereHint: '顶栏「AI 伴学」（快捷键 Ctrl+Shift+A）；「更多功能」里还能开「白噪音」和「番茄专注」',
    checklist: [
      '点击下方任意一个高频考研问题，看 AI 导师如何分步拆解回答',
      '想安静学习时，试着点下面按钮一键开启精选自习白噪音电台',
      '完成所有引导啦！今后忘记任何功能怎么用，随时点「使用手册」查大白话指南',
    ],
    tips: ['屏幕右下角还有伴学小萌宠，点开它可以帮你做大纲重构、提取挖空等小任务'],
    targetSelectors: ['[data-tour="nav-chat"]', '[data-tour="btn-theme"]'],
    pointerLabel: 'AI 伴学入口在这里（Ctrl+Shift+A 随时呼出）',
    actionLabel: '顺便开启白噪音自习电台试试',
    actionType: 'play_music',
    sampleQuestions: [
      '考研高数：用通俗的话帮我分步讲清楚柯西中值定理，并说说做证明大题常见切入点。',
      '408计网：详细对比 TCP 拥塞控制四个阶段（慢开始、拥塞避免、快重传、快恢复）怎么切换的？',
      '408操作系统：32位逻辑地址在做两级分页时，是怎么分成顶级页号、二级页号和页内偏移量的？',
    ],
  },
]

interface InteractiveTourGuideProps {
  isOpen: boolean
  onClose: () => void
}

const CHECKLIST_STORAGE_KEY = 'coreforge_tour_checklist_v2'

export default function InteractiveTourGuide({ isOpen, onClose }: InteractiveTourGuideProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setQueue, play } = useAudioContext()

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

  // 记录每一站勾选完成了哪些实操小清单
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const [isMinimized, setIsMinimized] = useState(false)
  const [spotlightEnabled, setSpotlightEnabled] = useState(true)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const step = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0]
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1
  const currentBaseRoute = location.pathname + (location.search || '')
  const targetRoutePath = step.route.split('?')[0]
  const isCurrentRoute =
    step.route.includes('?')
      ? currentBaseRoute === step.route || location.pathname === targetRoutePath
      : location.pathname.startsWith(targetRoutePath)

  // 保存步骤索引
  useEffect(() => {
    try {
      localStorage.setItem('coreforge_tour_step', currentStepIndex.toString())
    } catch {}
  }, [currentStepIndex])

  // 保存勾选进度
  useEffect(() => {
    try {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedMap))
    } catch {}
  }, [checkedMap])

  // 查找并实时追踪当前引导目标 DOM 元素位置
  const updateSpotlightRect = useCallback(() => {
    if (!isOpen || isMinimized || !spotlightEnabled || !step.targetSelectors?.length) {
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
  }, [isOpen, isMinimized, spotlightEnabled, step])

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

  const completedStepsCount = TOUR_STEPS.filter((s) =>
    s.checklist.every((_, idx) => Boolean(checkedMap[`${s.id}-${idx}`]))
  ).length

  const currentStepDoneCount = step.checklist.filter((_, idx) =>
    Boolean(checkedMap[`${step.id}-${idx}`])
  ).length
  const isCurrentStepAllChecked = currentStepDoneCount === step.checklist.length

  if (!isOpen) return null

  const handleSkipTour = () => {
    try {
      localStorage.setItem('coreforge_onboarding_dismissed', 'true')
      localStorage.setItem('coreforge_tour_skipped', 'true')
    } catch {}
    onClose()
  }

  const handleGoToRoute = (targetRoute?: string) => {
    const dest = targetRoute || step.route
    navigate(dest)
  }

  const handleNext = () => {
    if (isLastStep) {
      handleSkipTour()
    } else {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      navigate(TOUR_STEPS[nextIndex].route)
      setActionFeedback(null)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1
      setCurrentStepIndex(prevIndex)
      navigate(TOUR_STEPS[prevIndex].route)
      setActionFeedback(null)
    }
  }

  const handleResetProgress = () => {
    setCheckedMap({})
    setCurrentStepIndex(0)
    navigate(TOUR_STEPS[0].route)
    setActionFeedback('已重置导览进度，从第 1 站重新开始。')
  }

  // 执行对应引导站的快捷演示动作
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
      setActionFeedback('已将问题发给 AI 伴学导师，正在为您分步演算...')
      return
    }

    switch (step.actionType) {
      case 'play_music': {
        if (ALL_RADIO_STATIONS.length > 0) {
          const s = ALL_RADIO_STATIONS[0]
          setQueue(ALL_RADIO_STATIONS, 0)
          play(s)
          setActionFeedback(`已开始播放「${s.title}」，切去别的页面音乐也会一直陪着你。`)
        } else {
          navigate('/music?tab=radio')
        }
        break
      }
      case 'ask_ai': {
        const q =
          (step.sampleQuestions && step.sampleQuestions[0]) ||
          '帮我分步讲清楚柯西中值定理的证明思路。'
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
        setActionFeedback('已向 AI 伴学导师发送问题，正在解答...')
        break
      }
      case 'open_quicknote': {
        window.dispatchEvent(new CustomEvent('open-quick-note'))
        setActionFeedback('已为您打开随手记抽屉，可以试着选个标签写两句并保存。')
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
        setActionFeedback('已来到刷题中心，可以挑选「真题整卷」「题型专项」或「自由组卷」。')
        break
      }
      case 'open_errors': {
        navigate('/quiz?tab=errors')
        setActionFeedback('已直达错题本，可查看错因统计或点按钮开启错题重练。')
        break
      }
      case 'open_study': {
        navigate('/study')
        setActionFeedback('已来到研学中心，顶部一排标签可随时切换讲义、教材与进度。')
        break
      }
      case 'open_coursewares': {
        navigate('/study?tab=coursewares')
        setActionFeedback('已切换到仿真课件区，挑一个模块点开就能体验单步动画演示。')
        break
      }
      case 'open_flashcards': {
        navigate('/study?tab=flashcards')
        setActionFeedback('已切换到记忆闪卡区，翻开卡片自评掌握程度即可。')
        break
      }
      case 'open_politics': {
        navigate('/politics')
        setActionFeedback('已前往考研政治中心，上方是近代史纲时间轴，下方是 1000 题专项。')
        break
      }
      default: {
        navigate(step.route)
        break
      }
    }
  }

  // 最小化胶囊
  if (isMinimized) {
    return (
      <aside
        aria-label="细致引导快捷胶囊"
        className={`fixed z-[55] animate-fade-in ${
          dockSide === 'left'
            ? 'bottom-[calc(4.15rem+env(safe-area-inset-bottom,0px))] left-2.5 sm:bottom-6 sm:left-6'
            : 'bottom-[calc(4.15rem+env(safe-area-inset-bottom,0px))] right-2.5 sm:bottom-6 sm:right-6'
        }`}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all cursor-pointer font-sans text-[11px] sm:text-xs border border-slate-700 active:scale-95"
          title="展开细致新手引导"
        >
          <Compass className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
          <span className="font-semibold">
            新手引导 ({currentStepIndex + 1}/{TOUR_STEPS.length})
          </span>
          <Maximize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
        </button>
      </aside>
    )
  }

  const dockPositionClass =
    dockSide === 'left'
      ? 'bottom-[calc(4.1rem+env(safe-area-inset-bottom,0px))] left-2 right-2 mx-auto sm:mx-0 sm:right-auto sm:bottom-6 sm:left-6'
      : 'bottom-[calc(4.1rem+env(safe-area-inset-bottom,0px))] left-2 right-2 mx-auto sm:mx-0 sm:left-auto sm:bottom-6 sm:right-6'

  // 屏幕元素实时聚光框与指示标签（Portal 渲染，不阻挡用户点击目标按钮）
  const spotlightOverlay =
    spotlightEnabled && spotlightRect && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[54] pointer-events-none">
            {/* 目标外围脉冲框 */}
            <div
              className="fixed rounded-xl ring-2 ring-indigo-500 ring-offset-1 sm:ring-offset-2 ring-offset-white/80 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all duration-200 animate-pulse"
              style={{
                top: Math.max(4, spotlightRect.top - 3),
                left: Math.max(4, spotlightRect.left - 3),
                width: spotlightRect.width + 6,
                height: spotlightRect.height + 6,
              }}
            />
            {/* 指向标签：智能避开顶部/底部边缘 */}
            {step.pointerLabel && (
              <div
                className="fixed px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-900 text-white text-[10px] sm:text-[11px] font-bold shadow-lg flex items-center gap-1 sm:gap-1.5 whitespace-nowrap border border-indigo-400/50 transition-all duration-200 max-w-[calc(100vw-16px)] truncate"
                style={{
                  top:
                    spotlightRect.bottom + 38 < window.innerHeight
                      ? spotlightRect.bottom + 8
                      : Math.max(8, spotlightRect.top - 30),
                  left: Math.min(
                    Math.max(8, spotlightRect.left),
                    Math.max(8, window.innerWidth - 195)
                  ),
                }}
              >
                <Crosshair className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
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
        aria-label="手把手细致功能引导"
        className={`fixed z-[55] w-[calc(100vw-1.25rem)] max-w-[348px] sm:max-w-[420px] sm:w-[420px] rounded-xl sm:rounded-2xl bg-white/98 backdrop-blur-md border border-slate-200/90 shadow-[0_14px_35px_-10px_rgba(0,0,0,0.22)] overflow-hidden animate-fade-in font-sans text-slate-900 flex flex-col max-h-[42dvh] sm:max-h-[82vh] ${dockPositionClass}`}
      >
        {/* 头部控制栏 */}
        <div className="flex items-center justify-between border-b border-slate-100 px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-slate-50/95 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md sm:rounded-lg bg-slate-900 text-white shrink-0">
              <Compass className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                细致导览 · 第 {step.id}/{TOUR_STEPS.length} 站
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSpotlightEnabled((v) => !v)}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                spotlightEnabled
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
              }`}
              title={spotlightEnabled ? '点击关闭屏幕位置红框指示' : '点击开启屏幕位置高亮指示'}
            >
              <Crosshair className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">{spotlightEnabled ? '指路开' : '指路关'}</span>
            </button>

            <button
              type="button"
              onClick={toggleDockSide}
              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title={dockSide === 'left' ? '移到右下角' : '移到左下角'}
            >
              <MoveHorizontal className="w-3 h-3" />
              <span>{dockSide === 'left' ? '靠左' : '靠右'}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('open-user-guide', { detail: { tab: 'doc' } })
                )
              }
              className="p-1 rounded-md text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
              title="打开使用手册"
            >
              <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="收起为小胶囊"
            >
              <Minimize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>

            <button
              type="button"
              onClick={handleSkipTour}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="结束导览"
            >
              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>
        </div>

        {/* 导览总进度条 */}
        <div className="px-2.5 py-1 sm:px-4 sm:py-1.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <span className="text-slate-500 font-medium whitespace-nowrap">
              完成 {completedStepsCount}/{TOUR_STEPS.length} 站
            </span>
            <div className="flex-1 h-1 sm:h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((completedStepsCount / TOUR_STEPS.length) * 100)}%` }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetProgress}
            className="text-slate-400 hover:text-slate-700 inline-flex items-center gap-0.5 cursor-pointer shrink-0"
            title="重置实操打卡进度"
          >
            <RotateCcw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>重置</span>
          </button>
        </div>

        {/* 主体引导区 */}
        <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3 overflow-y-auto overscroll-contain flex-1">
          {/* 标题与位置 */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span
                className={`inline-block px-1.5 py-0.5 sm:px-2 rounded text-[10px] sm:text-2xs font-bold border ${step.highlightColor}`}
              >
                {step.badge}
              </span>
              <h4 className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1 sm:gap-1.5">
                <step.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-700 shrink-0" />
                <span className="truncate">{step.title}</span>
              </h4>
            </div>

            {!isCurrentRoute && (
              <button
                type="button"
                onClick={() => handleGoToRoute()}
                className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-2xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>去这页</span>
                <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </button>
            )}
          </div>

          {/* 入口在哪里 */}
          <div className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-200/60 text-indigo-900 text-[10.5px] sm:text-[11px] flex items-start gap-1 sm:gap-1.5 leading-snug">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong className="font-semibold">入口：</strong>
              {step.whereHint}
            </span>
          </div>

          {/* 大白话概要 */}
          <p className="text-[11px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed">{step.summary}</p>

          {/* 手把手实操打卡清单 */}
          <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] font-bold text-amber-900">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 shrink-0" />
                <span>跟着做一做（点一项打卡）：</span>
              </span>
              <span className="font-mono text-amber-700">
                {currentStepDoneCount}/{step.checklist.length}
              </span>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              {step.checklist.map((itemText, idx) => {
                const checked = Boolean(checkedMap[`${step.id}-${idx}`])
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleCheckItem(step.id, idx)}
                    className={`w-full text-left flex items-start gap-1.5 sm:gap-2 px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg border text-[10.5px] sm:text-[11.5px] leading-snug transition-all cursor-pointer ${
                      checked
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                        : 'bg-white/90 border-amber-200/70 text-slate-800 hover:bg-white'
                    }`}
                  >
                    {checked ? (
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <span className={checked ? 'line-through opacity-80' : ''}>{itemText}</span>
                  </button>
                )
              })}
            </div>

            {isCurrentStepAllChecked && (
              <div className="text-[10.5px] sm:text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-0.5">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>已完成本站操作，点「下一站」继续！</span>
              </div>
            )}
          </div>

          {/* 快捷体验动作按钮 */}
          {step.actionLabel && (
            <div className="space-y-1.5 sm:space-y-2">
              <button
                type="button"
                onClick={() => handlePerformAction()}
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] sm:text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                {step.actionType === 'play_music' ? (
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-sky-400" />
                ) : step.actionType === 'ask_ai' ? (
                  <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                ) : step.actionType === 'open_quicknote' ? (
                  <PenLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                ) : (
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                )}
                <span>{step.actionLabel}</span>
              </button>

              {/* AI 示例提问快捷按钮 */}
              {step.sampleQuestions && step.sampleQuestions.length > 0 && (
                <div className="space-y-1 sm:space-y-1.5 pt-0.5">
                  <span className="text-[10px] sm:text-2xs font-bold text-slate-500 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    <span>点一个例题直接发给 AI 导师：</span>
                  </span>
                  <div className="space-y-1">
                    {step.sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePerformAction(q)}
                        className="w-full text-left p-1.5 sm:p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-[10.5px] sm:text-2xs text-slate-800 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <span className="truncate">{q}</span>
                        <Send className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 group-hover:text-cyan-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 实时操作反馈 */}
              {actionFeedback && (
                <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] sm:text-2xs font-medium animate-fade-in flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{actionFeedback}</span>
                </div>
              )}
            </div>
          )}

          {/* 小贴士 */}
          {step.tips.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-slate-100">
              {step.tips.map((t, idx) => (
                <div key={idx} className="flex items-start gap-1 text-[10px] sm:text-2xs text-slate-500 leading-snug sm:leading-relaxed">
                  <Lightbulb className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部翻页栏 */}
        <div className="flex items-center justify-between border-t border-slate-100 px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-slate-50/80 text-[11px] sm:text-xs shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="inline-flex items-center gap-0.5 sm:gap-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>上一站</span>
          </button>

          {/* 步骤圆点 */}
          <div className="flex items-center gap-1">
            {TOUR_STEPS.map((s, idx) => {
              const stepDone = s.checklist.every((_, cIdx) => Boolean(checkedMap[`${s.id}-${cIdx}`]))
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
                    idx === currentStepIndex
                      ? 'w-3.5 sm:w-4 bg-slate-900'
                      : stepDone
                        ? 'w-1.5 sm:w-2 bg-emerald-500 hover:bg-emerald-600'
                        : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`第 ${s.id} 站：${s.title}`}
                />
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-0.5 sm:gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>{isLastStep ? '完成' : '下一站'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>
    </>
  )
}
