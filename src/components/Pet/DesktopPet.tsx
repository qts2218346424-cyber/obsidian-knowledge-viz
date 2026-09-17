import { useState, useEffect, useRef } from 'react'
import {
  Clock,
  MessageSquare,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import PetAssistantDrawer from './PetAssistantDrawer'

export type PetMood = 'idle' | 'focus' | 'thinking' | 'happy' | 'sleepy'

interface DesktopPetProps {
  onOpenQuickPractice?: () => void
}

export default function DesktopPet({ onOpenQuickPractice }: DesktopPetProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('coreforge_pet_pos')
      if (saved) return JSON.parse(saved)
    } catch {}
    return { x: window.innerWidth - 110, y: window.innerHeight - 200 }
  })

  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ startX: number; startY: number; petX: number; petY: number } | null>(null)
  const hasDraggedRef = useRef(false)

  const [mood, setMood] = useState<PetMood>('idle')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [bubbleAction, setBubbleAction] = useState<{ label: string; onClick: () => void } | null>(null)
  const [minimized, setMinimized] = useState(false)

  // Focus / Pomodoro Timer (minutes)
  const [focusActive, setFocusActive] = useState(false)
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(25 * 60)

  // Token stats tracking
  const [dailyTokens, setDailyTokens] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('coreforge_daily_tokens')
      if (saved) {
        const parsed = JSON.parse(saved)
        const today = new Date().toISOString().split('T')[0]
        if (parsed.date === today) return parsed.tokens || 0
      }
    } catch {}
    return 0
  })

  const [isLocalModel, setIsLocalModel] = useState(true)

  // Exam Countdown (Assume 2026考研 in late Dec 2026)
  const daysToExam = Math.max(
    0,
    Math.ceil((new Date('2026-12-26').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  // Interactive dialogue lines
  const interactiveQuotes = [
    `考研倒计时 ${daysToExam} 天！今天也要稳扎稳打！`,
    '累了吗？戳我做一道考研数学快闪错题吧～',
    '正在为你守候知识库，随时唤我管理笔记！',
    '已连线本地 AI 引擎，离线伴学 0 消耗！',
    '专注当下，每一道推导都在带你奔向目标高校！',
  ]

  // Proactive speech bubble timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setBubbleText(`考研倒计时 ${daysToExam} 天！今天已就绪，随时开启伴学。`)
      if (onOpenQuickPractice) {
        setBubbleAction({
          label: '🎯 开启随堂真题测试',
          onClick: onOpenQuickPractice,
        })
      }
      setTimeout(() => {
        setBubbleText(null)
        setBubbleAction(null)
      }, 7000)
    }, 2000)
    return () => clearTimeout(timer)
  }, [daysToExam, onOpenQuickPractice])


  // Focus timer countdown
  useEffect(() => {
    if (!focusActive) return
    const interval = setInterval(() => {
      setFocusSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setFocusActive(false)
          setMood('happy')
          setBubbleText('🎉 恭喜完成 25 分钟深度专注！建议起来活动一下，复盘一篇错题。')
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [focusActive])

  // Save pos
  useEffect(() => {
    localStorage.setItem('coreforge_pet_pos', JSON.stringify(position))
  }, [position])

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only drag with left click
    if (e.button !== 0) return
    setIsDragging(true)
    hasDraggedRef.current = false
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      petX: position.x,
      petY: position.y,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.startX
    const dy = e.clientY - dragStartRef.current.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDraggedRef.current = true
    }
    const newX = Math.max(10, Math.min(window.innerWidth - 90, dragStartRef.current.petX + dx))
    const newY = Math.max(10, Math.min(window.innerHeight - 90, dragStartRef.current.petY + dy))
    setPosition({ x: newX, y: newY })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    dragStartRef.current = null
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)

    // If it was a simple click without drag, trigger interaction
    if (!hasDraggedRef.current) {
      handlePetClick()
    }
  }

  const handlePetClick = () => {
    if (drawerOpen) {
      setDrawerOpen(false)
      return
    }
    // Random cute feedback
    setMood('happy')
    setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 1500)
    const quote = interactiveQuotes[Math.floor(Math.random() * interactiveQuotes.length)]
    setBubbleText(quote)
    setTimeout(() => setBubbleText(null), 5000)
  }

  const handleTokenConsumed = (tokens: number, local: boolean) => {
    setIsLocalModel(local)
    setDailyTokens(prev => {
      const next = prev + tokens
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem('coreforge_daily_tokens', JSON.stringify({ date: today, tokens: next }))
      return next
    })
  }

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <>
      {/* Floating Pet Container */}
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          touchAction: 'none',
        }}
        className="fixed top-0 left-0 z-50 select-none cursor-grab active:cursor-grabbing transition-transform duration-75"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Speech / Alert Bubble */}
        {bubbleText && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-orange-200/80 dark:border-orange-900/50 shadow-xl shadow-orange-500/10 text-xs text-warm-800 dark:text-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto">
            <div className="flex items-start gap-1.5">
              <span className="text-orange-500 font-bold shrink-0">研小核:</span>
              <span className="leading-snug">{bubbleText}</span>
            </div>
            {bubbleAction && (
              <button
                onClick={() => {
                  bubbleAction.onClick()
                  setBubbleText(null)
                }}
                className="mt-1.5 w-full py-1 text-[11px] font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {bubbleAction.label}
              </button>
            )}
            {/* Bubble arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-b border-r border-orange-200/80 dark:border-orange-900/50 rotate-45" />
          </div>
        )}

        {/* Pet Body Visuals */}
        {!minimized ? (
          <div className="relative group">
            {/* Ambient Aura */}
            <div
              className={`absolute -inset-2 rounded-full blur-md opacity-60 transition-colors duration-500 ${
                mood === 'focus'
                  ? 'bg-amber-400/40'
                  : mood === 'thinking'
                  ? 'bg-cyan-400/40 animate-pulse'
                  : mood === 'happy'
                  ? 'bg-emerald-400/50'
                  : 'bg-orange-400/30'
              }`}
            />

            {/* SVG Mascot Character (Ultra-lightweight vector) */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 p-1 border border-white/30 shadow-2xl hover:scale-105 transition-transform duration-200 flex items-center justify-center">
              {/* Pet Ears */}
              <div className="absolute -top-1.5 left-2 w-3.5 h-3.5 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-tl-full rotate-[-25deg] shadow-sm" />
              <div className="absolute -top-1.5 right-2 w-3.5 h-3.5 bg-gradient-to-tl from-orange-500 to-amber-400 rounded-tr-full rotate-[25deg] shadow-sm" />

              {/* Antenna Glow */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping" />
                <span className="w-0.5 h-1.5 bg-cyan-500/70" />
              </div>

              {/* Face Screen */}
              <div className="w-full h-full rounded-full bg-slate-950/90 flex flex-col items-center justify-center relative overflow-hidden border border-cyan-500/20">
                {/* Eyes State Machine */}
                {mood === 'sleepy' ? (
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-0.5 bg-cyan-400/70 rounded-full" />
                    <span className="w-2.5 h-0.5 bg-cyan-400/70 rounded-full" />
                  </div>
                ) : mood === 'focus' ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center">
                      <Clock className="w-2 h-2 text-amber-300" />
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center">
                      <Clock className="w-2 h-2 text-amber-300" />
                    </div>
                  </div>
                ) : mood === 'thinking' ? (
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
                  </div>
                ) : mood === 'happy' ? (
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-cyan-300 font-bold leading-none">^</span>
                    <span className="text-[13px] text-cyan-300 font-bold leading-none">^</span>
                  </div>
                ) : (
                  /* Idle Normal Eyes */
                  <div className="flex items-center gap-3.5">
                    <div className="w-2.5 h-3 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9] animate-pulse" />
                    <div className="w-2.5 h-3 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9] animate-pulse" />
                  </div>
                )}

                {/* Mouth & Blush */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1 rounded-full bg-rose-400/50" />
                  <span className="w-1.5 h-0.5 rounded-full bg-cyan-200/60" />
                  <span className="w-1.5 h-1 rounded-full bg-rose-400/50" />
                </div>
              </div>

              {/* Status Mini Badges */}
              {focusActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[9px] font-bold shadow whitespace-nowrap">
                  {formatTimer(focusSecondsLeft)}
                </div>
              )}
            </div>

            {/* Quick Actions Hover Dock */}
            <div className="absolute top-0 -left-12 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
              <button
                onClick={e => {
                  e.stopPropagation()
                  setDrawerOpen(true)
                }}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-warm-700 dark:text-slate-200 shadow-md border border-cream-200 dark:border-slate-700 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-colors"
                title="打开智能伴学与笔记管理工作台 (类似 Claudian)"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={e => {
                  e.stopPropagation()
                  setFocusActive(!focusActive)
                  if (!focusActive) {
                    setMood('focus')
                    setBubbleText('⏱️ 专注番茄钟已启动（25分钟），研小核将为你护航！')
                  } else {
                    setMood('idle')
                    setBubbleText('番茄钟已暂停')
                  }
                  setTimeout(() => setBubbleText(null), 3500)
                }}
                className={`w-7 h-7 rounded-full shadow-md border flex items-center justify-center transition-colors ${
                  focusActive
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white dark:bg-slate-800 text-warm-700 dark:text-slate-200 border-cream-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600'
                }`}
                title={focusActive ? '暂停番茄钟' : '开启 25 分钟考研专注伴学'}
              >
                <Clock className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={e => {
                  e.stopPropagation()
                  setMinimized(true)
                }}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-warm-400 hover:text-warm-700 dark:text-slate-400 shadow-md border border-cream-200 dark:border-slate-700 flex items-center justify-center transition-colors"
                title="收起为极简徽章"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          /* Minimized Badge State */
          <div
            onClick={() => setMinimized(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs font-semibold shadow-xl border border-white/20 hover:scale-105 transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>研小核</span>
            {focusActive && <span className="text-[10px] text-amber-300 font-mono">({formatTimer(focusSecondsLeft)})</span>}
            <Maximize2 className="w-3 h-3 text-slate-400 ml-1" />
          </div>
        )}
      </div>

      {/* Slide-out Companion & Note Management Drawer */}
      <PetAssistantDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        dailyTokens={dailyTokens}
        isLocalModel={isLocalModel}
        onTokenConsumed={handleTokenConsumed}
        onSetMood={setMood}
        onTriggerQuiz={() => onOpenQuickPractice && onOpenQuickPractice()}
      />
    </>
  )
}
