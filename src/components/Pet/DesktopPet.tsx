import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Clock,
  MessageSquare,
  Maximize2,
  Minimize2,
  Palette,
  Bot,
} from 'lucide-react'
import PetAssistantDrawer from './PetAssistantDrawer'
import LuluAvatar, { type LuluTheme } from './LuluAvatar'

export type PetMood = 'idle' | 'focus' | 'thinking' | 'happy' | 'sleepy'

interface DesktopPetProps {
  onOpenQuickPractice?: () => void
}

export default function DesktopPet({ onOpenQuickPractice }: DesktopPetProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // Avoid duplicate presence and UI overlap when on /chat (AI 伴学主页面)
  const isChatPage = location.pathname === '/chat'

  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('coreforge_pet_pos')
      if (saved) return JSON.parse(saved)
    } catch {}
    return { x: window.innerWidth - 115, y: window.innerHeight - 210 }
  })

  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ startX: number; startY: number; petX: number; petY: number } | null>(null)
  const hasDraggedRef = useRef(false)

  const [mood, setMood] = useState<PetMood>('idle')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [bubbleAction, setBubbleAction] = useState<{ label: string; onClick: () => void } | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [isSquishing, setIsSquishing] = useState(false)

  // Cute Theme (Yellow: Sunny Lulu, Pink: Sakura Lulu, Purple: Magic Lulu)
  const [theme, setTheme] = useState<LuluTheme>(() => {
    return (localStorage.getItem('coreforge_lulu_theme') as LuluTheme) || 'yellow'
  })

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

  // Interactive cute dialogue lines
  const interactiveQuotes = [
    '噜噜收到摸摸头！能量+100%，考研人冲鸭！( > ▽ < )',
    `考研倒计时仅剩 ${daysToExam} 天啦，噜噜今天会一直陪着你哦~ ✨`,
    '学累了嘛？要不要戳我做一道快闪高数/408题活动一下大脑？( ੭ ˙ᗜ˙ )੭',
    '已连线知识库与 AI 伴学大脑，有不懂的随时问噜噜！',
    '专注当下，每一道真题推导都在带你奔向目标高校！🌿',
    '咕噜噜~ 你的笔记整理得真棒，噜噜给你点个大赞！💖',
    '累了就深呼吸一下，喝口温水，噜噜在旁边为你加油！☕',
  ]

  // Proactive speech bubble timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setBubbleText(`考研倒计时 ${daysToExam} 天！噜噜已就绪，今天也一起努力呀~`)
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
          setBubbleText('🎉 哇！恭喜完成 25 分钟深度专注！快站起来伸个懒腰，喝口温水叭~')
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

  const toggleTheme = () => {
    const themes: LuluTheme[] = ['yellow', 'pink', 'purple']
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length
    const nextTheme = themes[nextIndex]
    setTheme(nextTheme)
    localStorage.setItem('coreforge_lulu_theme', nextTheme)
    setBubbleText(`换新衣服啦！当前形象：${nextTheme === 'yellow' ? '暖绒黄' : nextTheme === 'pink' ? '樱花粉' : '星空紫'}噜噜 ✨`)
    setTimeout(() => setBubbleText(null), 3000)
  }

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
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

    if (!hasDraggedRef.current) {
      handlePetClick()
    }
  }

  const handlePetClick = () => {
    if (drawerOpen) {
      setDrawerOpen(false)
      return
    }
    setIsSquishing(true)
    setTimeout(() => setIsSquishing(false), 500)
    setMood('happy')
    setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 2000)
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

  // If user is on /chat page, auto-hide the floating desktop pet to eliminate conflict
  if (isChatPage) {
    return null
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
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-200/90 dark:border-amber-800/60 shadow-xl shadow-amber-500/10 text-xs text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 font-extrabold shrink-0 flex items-center gap-1">
                🐾 噜噜:
              </span>
              <span className="leading-snug">{bubbleText}</span>
            </div>
            {bubbleAction && (
              <button
                onClick={() => {
                  bubbleAction.onClick()
                  setBubbleText(null)
                }}
                className="mt-2 w-full py-1 text-[11px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
              >
                {bubbleAction.label}
              </button>
            )}
            {/* Bubble arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-b border-r border-amber-200/90 dark:border-amber-800/60 rotate-45" />
          </div>
        )}

        {/* Pet Body Visuals */}
        {!minimized ? (
          <div className="relative group">
            {/* Lulu Anime Mascot Character */}
            <LuluAvatar
              mood={mood}
              size="md"
              theme={theme}
              isSquishing={isSquishing}
              onClick={handlePetClick}
            />

            {/* Pomodoro Timer Pill Badge under pet */}
            {focusActive && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold shadow-md whitespace-nowrap animate-pulse border border-white/30">
                ⏱️ {formatTimer(focusSecondsLeft)}
              </div>
            )}

            {/* Quick Actions Hover Dock (Buttons appear on hover) */}
            <div className="absolute top-0 -left-12 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
              {/* Go to full AI Chat伴学工作台 */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  navigate('/chat')
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-indigo-600 shadow-lg border border-indigo-200 dark:border-slate-700 flex items-center justify-center hover:bg-indigo-50 hover:scale-110 transition-all"
                title="进入深度 AI 伴学研学空间 (Chat 全屏工作台)"
              >
                <Bot className="w-4 h-4 text-indigo-500" />
              </button>

              {/* Open Note Manager Drawer (Claudian Style) */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  setDrawerOpen(true)
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 hover:scale-110 transition-all"
                title="打开智能笔记管家与考点搜索抽屉"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Toggle Pomodoro Focus */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  setFocusActive(!focusActive)
                  if (!focusActive) {
                    setMood('focus')
                    setBubbleText('⏱️ 专注番茄钟启动啦！噜噜戴上眼镜陪你学 25 分钟~')
                  } else {
                    setMood('idle')
                    setBubbleText('番茄钟已暂停~')
                  }
                  setTimeout(() => setBubbleText(null), 3500)
                }}
                className={`w-8 h-8 rounded-full shadow-lg border flex items-center justify-center hover:scale-110 transition-all ${
                  focusActive
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600'
                }`}
                title={focusActive ? '暂停番茄钟' : '开启 25 分钟考研专注伴学'}
              >
                <Clock className="w-4 h-4" />
              </button>

              {/* Change Skin Palette */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  toggleTheme()
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-rose-500 shadow-lg border border-rose-200 dark:border-slate-700 flex items-center justify-center hover:bg-rose-50 hover:scale-110 transition-all"
                title="给噜噜换皮肤 (奶黄 / 樱花粉 / 星空紫)"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* Minimize to Badge */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  setMinimized(true)
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:text-slate-400 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 transition-all"
                title="收起为极简萌宠徽章"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Minimized Badge State */
          <div
            onClick={() => setMinimized(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 dark:from-slate-900 dark:to-slate-800 text-amber-900 dark:text-amber-300 text-xs font-bold shadow-xl border border-amber-300 dark:border-amber-700/60 hover:scale-105 transition-all cursor-pointer"
          >
            <span className="text-sm">🐾</span>
            <span>噜噜</span>
            {focusActive && <span className="text-[10px] text-amber-600 font-mono">({formatTimer(focusSecondsLeft)})</span>}
            <Maximize2 className="w-3 h-3 text-amber-600 ml-1" />
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
