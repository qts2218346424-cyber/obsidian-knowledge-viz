import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ClipboardList,
  GraduationCap,
  Network,
  MessageCircle,
  Home,
  Minimize2,
  Maximize2,
  HelpCircle,
  Flame,
  Music,
  Play,
  RotateCcw,
  Volume2,
  Send,
  MoveHorizontal,
  Lightbulb,
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
  taskHint: string
  tips: string[]
  actionLabel?: string
  actionType?: 'play_music' | 'ask_ai' | 'open_quicknote' | 'inspect_mastery' | 'open_quiz' | 'open_study'
  sampleQuestions?: string[]
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: '备考驾驶舱 · 研学全局大盘',
    route: '/dashboard',
    icon: Home,
    badge: '第一站 · 驾驶舱',
    highlightColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    summary: '这里是您的每日考研指挥中心，汇聚初试倒计时、备战闭环进度、Vault 健康体检与每日待办。',
    taskHint: '体验任务：查看今日复习建议与初试倒计时，感受一站式备考大盘。',
    tips: ['支持按科目快速定位弱项', '自动统计知识库内双链与笔记总数'],
    actionLabel: '🏠 浏览备战驾驶舱大盘',
  },
  {
    id: 2,
    title: '考点掌握度色谱图 · 提分急救导航',
    route: '/graph',
    icon: Flame,
    badge: '第二站 · 色谱图',
    highlightColor: 'text-rose-600 bg-rose-50 border-rose-200',
    summary: '将 408 与数学考纲考点以红、黄、绿三色色谱直观呈现。红色高危薄弱考点带动态呼吸脉冲光晕。',
    taskHint: '体验任务：在顶部切换至「掌握度热力图」，单击任意红色薄弱考点唤起「提分急救舱」体验 5 题靶向速测。',
    tips: ['绿色稳固(≥80%)、黄色巩固(50%~80%)、红色高危(<50%)', '急救舱内置错题溯源与算法仿真课件联动'],
    actionLabel: '🔥 查看色谱图与急救舱说明',
    actionType: 'inspect_mastery',
  },
  {
    id: 3,
    title: '极速随手记 · 碎片灵感秒速入库',
    route: '/dashboard',
    icon: Sparkles,
    badge: '第三站 · 随手记',
    highlightColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    summary: '常驻顶栏的闪电速记胶囊。做题或阅读时无需离开当前页面，一键滑出抽屉记录灵感或推导草稿。',
    taskHint: '体验任务：点击下方按钮直接滑出随手记抽屉，体验预设学科标签与公式输入。',
    tips: ['支持 LaTeX 公式、待办清单与手机扫码拍照插图', '自动保存到本地 Obsidian Vault 随手记目录'],
    actionLabel: '⚡ 立即滑出随手记抽屉',
    actionType: 'open_quicknote',
  },
  {
    id: 4,
    title: '做题中心 · 答题卡调色板与草稿纸',
    route: '/quiz',
    icon: ClipboardList,
    badge: '第四站 · 刷真题',
    highlightColor: 'text-amber-600 bg-amber-50 border-amber-200',
    summary: '历年 408 与考研数学全真演练。右侧答题卡矩阵调色板实时呈现做题状态，右侧草稿纸随时推演。',
    taskHint: '体验任务：在做题界面右侧查看答题卡矩阵调色板，并点击「草稿纸」标签尝试手写演算。',
    tips: ['绿（已答）、白（未答）、黄（标记存疑）、红（判错）', '答错题目自动沉淀至错题档案并支持多维归因'],
    actionLabel: '📝 体验真题刷题中心',
    actionType: 'open_quiz',
  },
  {
    id: 5,
    title: '学习中心 · SM-2 艾宾浩斯抗遗忘记忆',
    route: '/study',
    icon: GraduationCap,
    badge: '第五站 · 闪卡中心',
    highlightColor: 'text-teal-600 bg-teal-50 border-teal-200',
    summary: '讲义精读与科学抗遗忘记忆法，采用 SM-2 认知算法在遗忘黄金临界点自动推送复习。',
    taskHint: '体验任务：翻开一张闪卡自评掌握度，体验间隔重复记忆流。',
    tips: ['早晚各 15 分钟抗遗忘记忆，高频核心概念终身不忘', '支持双栏对照研读讲义与课件'],
    actionLabel: '🎴 进入艾宾浩斯闪卡复习',
    actionType: 'open_study',
  },
  {
    id: 6,
    title: '知识图谱 · 全库双链拓扑星系',
    route: '/graph',
    icon: Network,
    badge: '第六站 · 双链图谱',
    highlightColor: 'text-purple-600 bg-purple-50 border-purple-200',
    summary: '基于 D3 物理力导向引擎，将全库 Markdown 笔记的双向链接转化为直观网状拓扑。',
    taskHint: '体验任务：拖拽图谱节点，排查带有橙色警示边框的未连接孤立笔记（Orphan Notes）。',
    tips: ['滚轮缩放与拖拽拓扑网络', '双击节点可在右侧抽屉直接阅读笔记 Markdown 原文'],
    actionLabel: '🕸️ 漫游知识双链拓扑图',
  },
  {
    id: 7,
    title: '声学自习 · 在线专注电台与白噪音',
    route: '/music?tab=radio',
    icon: Music,
    badge: '第七站 · 专注电台',
    highlightColor: 'text-sky-600 bg-sky-50 border-sky-200',
    summary: '直达在线专注电台（Lo-fi、古典伴学、自习白噪音）。底部常驻悬浮播放器，跨页面学习音乐永不中断。',
    taskHint: '体验任务：点击下方「一键播放」按钮，立刻开启精选 Lo-fi 自习电台并观察底部浮动播放器。',
    tips: ['数学推导建议配合 Gamma 脑波，英语背词建议配合 Alpha 脑波', '离开音乐页面音乐依然在后台流畅播放'],
    actionLabel: '🎵 一键播放精选 Lo-fi 学习电台',
    actionType: 'play_music',
  },
  {
    id: 8,
    title: 'AI 伴学导师 · 随时解题与定理证明',
    route: '/chat',
    icon: MessageCircle,
    badge: '第八站 · AI 导师',
    highlightColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    summary: '专业考研 AI 导师团队，严格按大纲规范分步推导演绎，给出结论先行与考场避坑建议。',
    taskHint: '体验任务：点击下方精选考研示例问题胶囊，系统将自动向 AI 导师提问并实时呈现推导。',
    tips: ['支持快捷键 Ctrl+Shift+A 随时唤起导师', '答题紧密结合大纲与您的本地笔记库'],
    actionLabel: '💬 发送考研高频问题体验推导',
    actionType: 'ask_ai',
    sampleQuestions: [
      '考研高数：帮我分步证明柯西中值定理，并总结与拉格朗日中值定理的联系及考研大题常见切入点。',
      '408计网：详细对比 TCP 拥塞控制四阶段（慢开始、拥塞避免、快重传、快恢复），画出拥塞窗口变化规律。',
      '408操作系统：两级分页地址转换中，32位逻辑地址如何拆分为顶级页号、二级页号和页内偏移量？',
    ],
  },
]

interface InteractiveTourGuideProps {
  isOpen: boolean
  onClose: () => void
}

export default function InteractiveTourGuide({ isOpen, onClose }: InteractiveTourGuideProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { setQueue, play, state: audioState } = useAudioContext()

  // 停靠位置偏好：默认停靠在左下角 (bottom-left)，避开右下角萌宠、MiniPlayer 与右侧工作台
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
      return saved ? parseInt(saved, 10) || 0 : 0
    } catch {
      return 0
    }
  })
  const [isMinimized, setIsMinimized] = useState(false)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const step = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0]
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1
  const currentBaseRoute = location.pathname + (location.search || '')
  const isCurrentRoute = currentBaseRoute.startsWith(step.route.split('?')[0])

  useEffect(() => {
    try {
      localStorage.setItem('coreforge_tour_step', currentStepIndex.toString())
    } catch {}
  }, [currentStepIndex])

  const toggleDockSide = () => {
    const nextSide = dockSide === 'left' ? 'right' : 'left'
    setDockSide(nextSide)
    try {
      localStorage.setItem('coreforge_tour_dock_side', nextSide)
    } catch {}
  }

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

  // 🚀 核心：执行各站专属的深度实战动作
  const handlePerformAction = (customQuestion?: string) => {
    switch (step.actionType) {
      case 'play_music': {
        // 1. 跳转到音乐电台 Tab
        if (!location.pathname.startsWith('/music')) {
          navigate('/music?tab=radio')
        }
        // 2. 播放第一首精选在线电台 (RadioStation 本身即符合 AudioTrack 规范)
        if (ALL_RADIO_STATIONS.length > 0) {
          const s = ALL_RADIO_STATIONS[0]
          setQueue(ALL_RADIO_STATIONS, 0)
          play(s)
          setActionFeedback(`🎵 已成功为您播放「${s.title}」！全站背景音已就绪，底部 MiniPlayer 已激活。`)
        }
        break
      }
      case 'ask_ai': {
        const q = customQuestion || (step.sampleQuestions ? step.sampleQuestions[0] : '考研高数中柯西中值定理的几何意义与考法')
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
        setActionFeedback('💬 已向 AI 伴学导师下发提问，正在分步演算...')
        break
      }
      case 'open_quicknote': {
        window.dispatchEvent(new CustomEvent('open-quick-note'))
        setActionFeedback('⚡ 已滑出随手记抽屉，快记录一段灵感吧！')
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
        break
      }
      case 'open_study': {
        navigate('/study')
        break
      }
      default: {
        navigate(step.route)
        break
      }
    }
  }

  // 最小化状态胶囊
  if (isMinimized) {
    return (
      <aside
        aria-label="新手教程导航快捷胶囊"
        className={`fixed z-[55] animate-fade-in ${
          dockSide === 'left' ? 'bottom-6 left-6' : 'bottom-6 right-6'
        }`}
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-900 text-white shadow-xl hover:bg-neutral-800 transition-all cursor-pointer font-sans text-xs border border-neutral-700 active:scale-95"
          title="展开实战新手引导"
        >
          <Compass className="h-4 w-4 animate-spin-slow text-amber-400" />
          <span className="font-semibold">
            实战引导 ({currentStepIndex + 1}/{TOUR_STEPS.length})
          </span>
          <Maximize2 className="h-3.5 w-3.5 text-neutral-400" />
        </button>
      </aside>
    )
  }

  // 浮层停靠定位样式（支持左下角 vs 右下角一键切换，移动端居中）
  const dockPositionClass =
    dockSide === 'left'
      ? 'bottom-20 left-4 sm:bottom-6 sm:left-6'
      : 'bottom-20 right-4 sm:bottom-6 sm:right-6'

  return (
    <aside
      aria-label="实战功能引导导航"
      className={`fixed z-[55] w-[calc(100vw-2rem)] sm:w-[420px] rounded-2xl bg-white border border-neutral-200/90 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.2)] overflow-hidden animate-fade-in font-sans text-neutral-900 ${dockPositionClass}`}
    >
      {/* 头部控制栏 */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5 bg-neutral-50/90 shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-900 text-white text-[11px] font-bold">
            <Compass className="h-3.5 w-3.5 text-amber-400" />
          </span>
          <span className="text-xs font-bold text-neutral-900">
            实战功能引导 · 第 {step.id}/{TOUR_STEPS.length} 站
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* 一键切换停靠侧 */}
          <button
            onClick={toggleDockSide}
            className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/60 transition-colors cursor-pointer"
            title={dockSide === 'left' ? '移至右下角' : '移至左下角'}
          >
            <MoveHorizontal className="w-3 h-3" />
            <span>{dockSide === 'left' ? '靠左' : '靠右'}</span>
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
            title="最小化"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleSkipTour}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
            title="退出引导"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
        {/* 标题与站名 */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${step.highlightColor}`}
            >
              {step.badge}
            </span>
            <h4 className="mt-1 text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <step.icon className="h-4 w-4 text-neutral-700" />
              <span>{step.title}</span>
            </h4>
          </div>

          {!isCurrentRoute && (
            <button
              onClick={() => handleGoToRoute()}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[10.5px] font-semibold transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>跳转此页</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* 作用概要 */}
        <p className="text-xs text-neutral-600 leading-relaxed">{step.summary}</p>

        {/* 实战操作任务提示 */}
        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs">
          <div className="flex items-start gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-semibold text-[11px] leading-relaxed">{step.taskHint}</span>
          </div>
        </div>

        {/* 🌟 核心引导实战动作区 (专门针对音乐、AI提问、随手记等定制) */}
        {step.actionLabel && (
          <div className="pt-0.5 space-y-2">
            <button
              type="button"
              onClick={() => handlePerformAction()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white text-xs font-bold shadow-xs hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              {step.actionType === 'play_music' && <Play className="w-3.5 h-3.5 fill-current text-sky-400" />}
              {step.actionType === 'ask_ai' && <MessageCircle className="w-3.5 h-3.5 text-cyan-400" />}
              {step.actionType === 'open_quicknote' && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              <span>{step.actionLabel}</span>
            </button>

            {/* AI 专属引导：提供一键发送的考研真题问题胶囊 */}
            {step.sampleQuestions && step.sampleQuestions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10.5px] font-bold text-neutral-500 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-amber-500" />
                  <span>或点击下方高频问题直接向导师提问：</span>
                </span>
                <div className="space-y-1">
                  {step.sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePerformAction(q)}
                      className="w-full text-left p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/70 text-[11px] text-neutral-800 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                    >
                      <span className="truncate">{q}</span>
                      <Send className="w-3 h-3 text-neutral-400 group-hover:text-cyan-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 动作即时反馈提示 */}
            {actionFeedback && (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium animate-fade-in flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{actionFeedback}</span>
              </div>
            )}
          </div>
        )}

        {/* 贴士列表 */}
        <div className="space-y-1 pt-1 border-t border-neutral-100">
          {step.tips.map((t, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
              <span className="truncate">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部前后翻页与完成 */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2.5 bg-neutral-50/70 text-xs shrink-0">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>上一步</span>
        </button>

        {/* 进度微胶囊指示器 */}
        <div className="flex items-center gap-1">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStepIndex(idx)
                navigate(s.route)
                setActionFeedback(null)
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'w-4 bg-neutral-900'
                  : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
              }`}
              title={s.title}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <span>{isLastStep ? '完成漫游' : '下一步'}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  )
}
