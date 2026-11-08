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
} from 'lucide-react'

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
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: '备考驾驶舱 · 研学全局大盘',
    route: '/dashboard',
    icon: Home,
    badge: '第一站',
    highlightColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    summary: '这里是您的每日考研指挥中心，汇聚初试倒计时、备战闭环进度与笔记体检。',
    taskHint: '体验任务：查看今日复习建议与初试倒计时，感受一站式备考大盘。',
    tips: ['支持按科目快速定位弱项', '自动统计知识库内双链与笔记总数'],
  },
  {
    id: 2,
    title: '做题中心 · 408 与数学全真演练',
    route: '/quiz',
    icon: ClipboardList,
    badge: '第二站',
    highlightColor: 'text-amber-600 bg-amber-50 border-amber-200',
    summary: '涵盖历年 408 与考研数学海量真题，支持高质量 LaTeX 公式排版与错因智能归因。',
    taskHint: '体验任务：在题库中挑选一道题目试做，体验答题解析与自动错题收录。',
    tips: ['错题自动沉淀进入专属错题集', '支持题目关联至本地讲义笔记双向溯源'],
  },
  {
    id: 3,
    title: '学习中心 · 艾宾浩斯抗遗忘记忆',
    route: '/study',
    icon: GraduationCap,
    badge: '第三站',
    highlightColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    summary: '讲义精读与科学抗遗忘记忆法，采用 SM-2 间隔重复算法推送临界点闪卡。',
    taskHint: '体验任务：翻开一张闪卡或查看章节教材，体验抗遗忘记忆曲线。',
    tips: ['早晚 15 分钟抗遗忘记忆，高频概念终身不忘', '支持双栏对照研读讲义与课件'],
  },
  {
    id: 4,
    title: '知识图谱 · 全库双链拓扑网络',
    route: '/graph',
    icon: Network,
    badge: '第四站',
    highlightColor: 'text-purple-600 bg-purple-50 border-purple-200',
    summary: '基于 D3 物理力导向引擎，将全库 Markdown 笔记的双链结构转化为直观星系图谱。',
    taskHint: '体验任务：拖拽图谱节点，查看高频考点枢纽并排查未建立链接的孤立笔记。',
    tips: ['滚轮缩放与拖拽拓扑网络', '红绿提示快速定位知识盲区'],
  },
  {
    id: 5,
    title: 'AI 伴学导师 · 随时解题与推导',
    route: '/chat',
    icon: MessageCircle,
    badge: '第五站',
    highlightColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    summary: '内置专业大模型导师团队，随时解答 408 核心原理与高等数学复杂证明题。',
    taskHint: '体验任务：向伴学导师发送一个题目或提问，体验分步推导解析。',
    tips: ['支持快捷键 Ctrl+Shift+A 随时唤起导师', '答疑紧密结合您的本地笔记内容'],
  },
]

interface InteractiveTourGuideProps {
  isOpen: boolean
  onClose: () => void
}

export default function InteractiveTourGuide({ isOpen, onClose }: InteractiveTourGuideProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('coreforge_tour_step')
      return saved ? parseInt(saved, 10) || 0 : 0
    } catch {
      return 0
    }
  })
  const [isMinimized, setIsMinimized] = useState(false)

  const step = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0]
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1
  const isCurrentRoute = location.pathname === step.route

  useEffect(() => {
    try {
      localStorage.setItem('coreforge_tour_step', currentStepIndex.toString())
    } catch {}
  }, [currentStepIndex])

  if (!isOpen) return null

  const handleSkipTour = () => {
    try {
      localStorage.setItem('coreforge_onboarding_dismissed', 'true')
      localStorage.setItem('coreforge_tour_skipped', 'true')
    } catch {}
    onClose()
  }

  const handleGoToRoute = () => {
    if (!isCurrentRoute) {
      navigate(step.route)
    }
  }

  const handleNext = () => {
    if (isLastStep) {
      handleSkipTour()
    } else {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      navigate(TOUR_STEPS[nextIndex].route)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1
      setCurrentStepIndex(prevIndex)
      navigate(TOUR_STEPS[prevIndex].route)
    }
  }

  // 最小化悬浮胶囊状态
  if (isMinimized) {
    return (
      <aside 
        aria-label="新手教程导航快捷胶囊"
        className="fixed bottom-6 right-6 z-50 animate-fade-in"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 rounded-full border border-neutral-300/90 bg-white/95 px-4 py-2.5 text-xs font-semibold text-neutral-800 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Compass className="h-4 w-4 text-neutral-700" />
          <span>新手教程 ({currentStepIndex + 1}/{TOUR_STEPS.length})</span>
          <Maximize2 className="h-3 w-3 text-neutral-400 ml-1" />
        </button>
      </aside>
    )
  }

  return (
    <aside 
      aria-label="新手交互体验向导"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2.5rem)] sm:w-[420px] rounded-2xl border border-neutral-200/90 bg-white/95 p-4 sm:p-5 shadow-[0_20px_48px_rgba(0,0,0,0.12)] backdrop-blur-xl animate-fade-in text-neutral-900 font-sans select-none"
    >
      {/* 顶部指示条与控制项 */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-2xs">
            <Compass className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900">新用户研学实战引导</span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.2 text-[10px] font-semibold text-neutral-600 border border-neutral-200/60">
                {currentStepIndex + 1} / {TOUR_STEPS.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="最小化到右下角"
            aria-label="最小化向导"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleSkipTour}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="跳过并结束新手教程"
            aria-label="跳过新手教程"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 步骤进度条 */}
      <div className="my-3 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full bg-neutral-900 transition-all duration-300 rounded-full"
          style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
        />
      </div>

      {/* 步骤核心内容 */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${step.highlightColor}`}>
            <step.icon className="h-3 w-3 shrink-0" />
            <span>{step.badge}</span>
          </span>
          <h4 className="text-sm font-bold text-neutral-900 truncate">
            {step.title}
          </h4>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          {step.summary}
        </p>

        {/* 交互体验任务引导卡片 */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-2.5 text-xs text-amber-950">
          <div className="flex items-start gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>{step.taskHint}</span>
          </div>
        </div>

        {/* 亮点小贴士 */}
        <div className="space-y-1">
          {step.tips.map((tip, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部操作行 */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
        {/* 跳过新手教程按钮 */}
        <button
          onClick={handleSkipTour}
          className="text-xs text-neutral-400 hover:text-neutral-700 hover:underline px-1 py-1 font-medium transition-colors cursor-pointer select-none"
        >
          跳过新手教程
        </button>

        <div className="flex items-center gap-1.5">
          {/* 如果不在目标页面，提供一键前往 */}
          {!isCurrentRoute ? (
            <button
              onClick={handleGoToRoute}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/90 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <span>前往体验</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 px-2">
              <CheckCircle2 className="h-3 w-3" />
              <span>当前已在此功能页</span>
            </span>
          )}

          {/* 上一步 */}
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg border border-neutral-200/80 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            title="上一步"
            aria-label="上一步"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* 下一步 / 完成 */}
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <span>{isLastStep ? '完成教程 🎉' : '下一站'}</span>
            {!isLastStep && <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  )
}
