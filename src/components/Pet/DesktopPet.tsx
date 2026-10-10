import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Clock,
  MessageSquare,
  Maximize2,
  Minimize2,
  Palette,
  Bot,
  X,
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

  // 伴学全屏聊天页时不重复显示桌面小宠物
  const isChatPage = location.pathname === '/chat'

  // 检测移动端视口（屏幕宽度小于 768px）
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  // 尺寸与安全边距
  const petSize = isMobile ? 56 : 64
  const bottomOffset = isMobile ? 85 : 30 // 手机端预留底部导航栏高度（约 60px）

  // 动态视口边界约束函数（Clamp）
  const getClampedPosition = useCallback(
    (pos: { x: number; y: number }, snapToEdge = false) => {
      if (typeof window === 'undefined') return pos
      const winWidth = window.innerWidth
      const winHeight = window.innerHeight
      const maxX = Math.max(10, winWidth - petSize - 12)
      const maxY = Math.max(10, winHeight - petSize - bottomOffset)

      let finalX = Math.max(12, Math.min(maxX, pos.x))
      const finalY = Math.max(12, Math.min(maxY, pos.y))

      // 手机窄屏松手后智能吸附至贴近的一侧边缘（左侧或右侧）
      if (snapToEdge && winWidth < 768) {
        const centerX = finalX + petSize / 2
        finalX = centerX < winWidth / 2 ? 12 : maxX
      }

      return { x: finalX, y: finalY }
    },
    [petSize, bottomOffset]
  )

  // 位置状态初始化：从缓存读取并严格校验屏幕边界
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 100, y: 100 }
    const mobile = window.innerWidth < 768
    const size = mobile ? 56 : 64
    const offset = mobile ? 85 : 30
    const maxX = Math.max(10, window.innerWidth - size - 12)
    const maxY = Math.max(10, window.innerHeight - size - offset)

    try {
      const saved = localStorage.getItem('coreforge_pet_pos')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          // 确保从宽屏切到手机时不会飞到屏幕外
          const clampedX = Math.max(12, Math.min(maxX, parsed.x))
          const clampedY = Math.max(12, Math.min(maxY, parsed.y))
          if (mobile) {
            return {
              x: clampedX + size / 2 < window.innerWidth / 2 ? 12 : maxX,
              y: clampedY,
            }
          }
          return { x: clampedX, y: clampedY }
        }
      }
    } catch {}

    // 默认停靠在右下角
    return {
      x: Math.max(12, window.innerWidth - size - (mobile ? 12 : 20)),
      y: Math.max(12, window.innerHeight - size - (mobile ? 120 : 150)),
    }
  })

  // 拖拽手势状态
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ startX: number; startY: number; petX: number; petY: number } | null>(null)
  const hasDraggedRef = useRef(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // 萌宠情绪与状态
  const [mood, setMood] = useState<PetMood>('idle')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [bubbleAction, setBubbleAction] = useState<{ label: string; onClick: () => void } | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [isSquishing, setIsSquishing] = useState(false)

  // 主题配色
  const [theme, setTheme] = useState<LuluTheme>(() => {
    return (localStorage.getItem('coreforge_lulu_theme') as LuluTheme) || 'yellow'
  })

  // 专注番茄钟
  const [focusActive, setFocusActive] = useState(false)
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(25 * 60)

  // Token 统计
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

  // 考研倒计时
  const daysToExam = Math.max(
    0,
    Math.ceil((new Date('2026-12-26').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  // 萌宠互动文案
  const interactiveQuotes = [
    '噜噜收到摸摸头！能量+100%，考研人冲鸭！( > ▽ < )',
    `考研倒计时仅剩 ${daysToExam} 天啦，噜噜今天会一直陪着你哦~ ✨`,
    '学累了嘛？要不要戳我做一道快闪高数/408题活动一下大脑？( ੭ ˙ᗜ˙ )੭',
    '已连线知识库与 AI 伴学大脑，有不懂的随时问噜噜！',
    '专注当下，每一道真题推导都在带你奔向目标高校！🌿',
    '咕噜噜~ 你的笔记整理得真棒，噜噜给你点个大赞！💖',
    '累了就深呼吸一下，喝口温水，噜噜在旁边为你加油！☕',
  ]

  // 主动问候气泡
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
    }, 2500)
    return () => clearTimeout(timer)
  }, [daysToExam, onOpenQuickPractice])

  // 番茄钟计时
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

  // 视口尺寸变化监听（横竖屏切换与缩放时自动纠偏防溢出）
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setPosition(prev => {
        const clamped = getClampedPosition(prev, mobile)
        try {
          localStorage.setItem('coreforge_pet_pos', JSON.stringify(clamped))
        } catch {}
        return clamped
      })
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [getClampedPosition])

  const toggleTheme = () => {
    const themes: LuluTheme[] = ['yellow', 'pink', 'purple']
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length
    const nextTheme = themes[nextIndex]
    setTheme(nextTheme)
    localStorage.setItem('coreforge_lulu_theme', nextTheme)
    setBubbleText(`换新衣服啦！当前形象：${nextTheme === 'yellow' ? '暖绒黄' : nextTheme === 'pink' ? '樱花粉' : '星空紫'}噜噜 ✨`)
    setTimeout(() => setBubbleText(null), 3000)
  }

  // ===== 拖拽手势核心引擎（多端兼容触控 + 鼠标） =====
  const handlePointerDown = (e: React.PointerEvent) => {
    // 鼠标仅响应左键，触控直接触发
    if (e.pointerType === 'mouse' && e.button !== 0) return

    setIsDragging(true)
    hasDraggedRef.current = false
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      petX: position.x,
      petY: position.y,
    }

    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.startX
    const dy = e.clientY - dragStartRef.current.startY

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      hasDraggedRef.current = true
      // 正在拖动中，收起干扰的气泡和菜单
      if (showMobileMenu) setShowMobileMenu(false)
      if (bubbleText) setBubbleText(null)
    }

    // 拖动过程中保持完全自由跟手（不强行贴边吸附）
    const nextPos = getClampedPosition(
      {
        x: dragStartRef.current.petX + dx,
        y: dragStartRef.current.petY + dy,
      },
      false
    )
    setPosition(nextPos)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)

    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}

    const wasDragged = hasDraggedRef.current
    dragStartRef.current = null

    if (wasDragged) {
      // 拖拽释放：在移动端自动执行平滑边缘贴附
      setPosition(prev => {
        const finalPos = getClampedPosition(prev, isMobile)
        try {
          localStorage.setItem('coreforge_pet_pos', JSON.stringify(finalPos))
        } catch {}
        return finalPos
      })
    } else {
      // 非拖拽微位移，判定为点击交互
      handlePetClick()
    }
  }

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    dragStartRef.current = null
    setPosition(prev => getClampedPosition(prev, isMobile))
  }

  const handlePetClick = () => {
    if (drawerOpen) {
      setDrawerOpen(false)
      return
    }

    // 移动端点击切换快捷功能菜单展开状态
    if (isMobile) {
      setShowMobileMenu(prev => !prev)
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

  // 若处于 /chat 全屏伴学对话页，则隐藏悬浮宠物以防视口冲突
  if (isChatPage) {
    return null
  }

  // 气泡和菜单朝向智能判断：靠屏幕右半区向左展开，靠左半区向右展开
  const isRightSide = position.x > (typeof window !== 'undefined' ? window.innerWidth / 2 : 200)
  const isNearTop = position.y < 95

  return (
    <>
      {/* 悬浮小宠物主容器 */}
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        className="fixed top-0 left-0 z-50 select-none cursor-grab active:cursor-grabbing will-change-transform"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* 对话与提示气泡（防横向溢出与顶部截断设计） */}
        {bubbleText && (
          <div
            className={`absolute ${
              isNearTop ? 'top-16' : '-top-20'
            } ${
              isRightSide ? 'right-0' : 'left-0'
            } w-60 sm:w-64 max-w-[calc(100vw-28px)] p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-200/90 dark:border-amber-800/60 shadow-xl shadow-amber-500/10 text-xs text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto z-20`}
          >
            <div className="flex items-start gap-2">
              <span className="text-amber-500 font-extrabold shrink-0 flex items-center gap-1">
                🐾 噜噜:
              </span>
              <span className="leading-snug break-words">{bubbleText}</span>
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
            {/* 气泡小箭头 */}
            <div
              className={`absolute ${
                isNearTop ? '-top-1.5 border-t border-l rotate-45' : '-bottom-1.5 border-b border-r rotate-45'
              } ${
                isRightSide ? 'right-6' : 'left-6'
              } w-3 h-3 bg-white dark:bg-slate-900 border-amber-200/90 dark:border-amber-800/60`}
            />
          </div>
        )}

        {/* 宠物主体 */}
        {!minimized ? (
          <div className="relative group">
            {/* 噜噜动漫吉祥物头像 */}
            <LuluAvatar
              mood={mood}
              size={isMobile ? 'sm' : 'md'}
              theme={theme}
              isSquishing={isSquishing}
              onClick={handlePetClick}
            />

            {/* 番茄钟专注药丸徽章 */}
            {focusActive && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold shadow-md whitespace-nowrap animate-pulse border border-white/30 pointer-events-none">
                ⏱️ {formatTimer(focusSecondsLeft)}
              </div>
            )}

            {/* 快捷操作栏（桌面端 Hover 展开，移动端点击展开） */}
            <div
              className={`absolute top-0 ${
                isRightSide ? '-left-11' : '-right-11'
              } flex flex-col gap-1.5 transition-all duration-200 pointer-events-auto z-10 ${
                isMobile
                  ? showMobileMenu
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-90 pointer-events-none'
                  : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {/* 进入 AI 伴学主工作台 */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  navigate('/chat')
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-indigo-600 shadow-lg border border-indigo-200 dark:border-slate-700 flex items-center justify-center hover:bg-indigo-50 hover:scale-110 active:scale-95 transition-all"
                title="进入深度 AI 伴学研学空间 (Chat 全屏工作台)"
              >
                <Bot className="w-4 h-4 text-indigo-500" />
              </button>

              {/* 打开智能笔记管家与抽屉 */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  setDrawerOpen(true)
                  setShowMobileMenu(false)
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 hover:scale-110 active:scale-95 transition-all"
                title="打开智能笔记管家与考点搜索抽屉"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* 番茄钟开关 */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  setFocusActive(!focusActive)
                  if (!focusActive) {
                    setMood('focus')
                    setBubbleText('⏱️ 专注番茄钟启动啦！噜噜陪你深度学 25 分钟~')
                  } else {
                    setMood('idle')
                    setBubbleText('番茄钟已暂停~')
                  }
                  setTimeout(() => setBubbleText(null), 3500)
                }}
                className={`w-8 h-8 rounded-full shadow-lg border flex items-center justify-center hover:scale-110 active:scale-95 transition-all ${
                  focusActive
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600'
                }`}
                title={focusActive ? '暂停番茄钟' : '开启 25 分钟考研专注伴学'}
              >
                <Clock className="w-4 h-4" />
              </button>

              {/* 换肤 */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  toggleTheme()
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-rose-500 shadow-lg border border-rose-200 dark:border-slate-700 flex items-center justify-center hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all"
                title="给噜噜换皮肤 (暖绒黄 / 樱花粉 / 星空紫)"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* 最小化为徽章 */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  setMinimized(true)
                  setShowMobileMenu(false)
                }}
                className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:text-slate-400 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                title="收起为极简萌宠徽章"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {/* 移动端菜单收起按钮 */}
              {isMobile && showMobileMenu && (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setShowMobileMenu(false)
                  }}
                  className="w-8 h-8 rounded-full bg-warm-100 text-warm-500 shadow border border-warm-200 flex items-center justify-center hover:bg-warm-200 transition-all"
                  title="关闭菜单"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* 最小化徽章形态（同样支持自由拖动和贴边） */
          <div
            onClick={() => {
              if (!hasDraggedRef.current) {
                setMinimized(false)
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200 dark:from-slate-900 dark:to-slate-800 text-amber-900 dark:text-amber-300 text-xs font-bold shadow-xl border border-amber-300 dark:border-amber-700/60 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <span className="text-sm">🐾</span>
            <span>噜噜</span>
            {focusActive && (
              <span className="text-[10px] text-amber-600 font-mono">
                ({formatTimer(focusSecondsLeft)})
              </span>
            )}
            <Maximize2 className="w-3 h-3 text-amber-600 ml-1" />
          </div>
        )}
      </div>

      {/* 智能笔记管家与 AI 问答侧滑抽屉 */}
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
