import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Clock,
  MessageSquare,
  Maximize2,
  Minimize2,
  Palette,
  Bot,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import LuluAvatar, { PET_PERSONAS, getSavedPetTheme, type LuluTheme } from './LuluAvatar'

const PetAssistantDrawer = lazy(() => import('./PetAssistantDrawer'))

export type PetMood = 'idle' | 'focus' | 'thinking' | 'happy' | 'sleepy'

interface DesktopPetProps {
  onOpenQuickPractice?: () => void
}

interface PetVoiceItem {
  text: string
  audio: string
}

const PET_VOICE_PACKS: Record<LuluTheme, PetVoiceItem[]> = {
  yellow: [
    {
      text: '嘿嘿嘿……别戳我大肚皮啦，好痒呀哈哈哈！再戳我就要变成黄色小皮球滚走咯~ 🐲✨',
      audio: '/pets/voices/nailong_1.mp3?v=2',
    },
    {
      text: '咦——？一加一等于几来着？呃……等于两个大鸡腿！嘿嘿，反正跟着奶龙混，高数408全都稳过哟！🍗',
      audio: '/pets/voices/nailong_2.mp3?v=2',
    },
    {
      text: '哎呀妈呀……我肚子饿得咕咕叫啦！你是不是偷偷藏好吃的啦？快喂我吃两道真题，啊呜一口吞掉！😋',
      audio: '/pets/voices/nailong_3.mp3?v=2',
    },
    {
      text: '哼哼，我才是真的奶龙！你看我圆滚滚的大肚子，里面装的可全是红烧肉和一战成硕的秘籍哟！💪',
      audio: '/pets/voices/nailong_4.mp3?v=2',
    },
    {
      text: '呼噜噜……啊？我没睡着，我才没流口水呢！我刚刚是在闭着眼睛帮你想这道难题呢，信奶龙一回嘛~ 🫧',
      audio: '/pets/voices/nailong_5.mp3?v=2',
    },
    {
      text: '哇哦——！你居然学了这么久，太酷啦！快看奶龙给你跳个扭屁股舞，12月19号咱们妥妥考上岸，耶！🌟',
      audio: '/pets/voices/nailong_6.mp3?v=2',
    },
  ],
  pink: [
    {
      text: '咕噜噜~ 头顶小橘子稳稳当当，祝你心态超稳，「橘」定上岸哟！🍊',
      audio: '/pets/voices/lulu_1.mp3?v=2',
    },
    {
      text: '摸摸水豚头，做题不用愁，深呼吸慢慢推导吧~ 🌿',
      audio: '/pets/voices/lulu_2.mp3?v=2',
    },
  ],
  purple: [
    {
      text: '收到召唤啦！学妹小核抱着错题本为你全力应援，冲鸭！🎀📖',
      audio: '/pets/voices/xiaohe_1.mp3?v=2',
    },
    {
      text: '遇到卡壳的知识点别着急，随时点开伴学空间问我哟！✨',
      audio: '/pets/voices/xiaohe_2.mp3?v=2',
    },
  ],
}

export default function DesktopPet({ onOpenQuickPractice }: DesktopPetProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const isChatPage = location.pathname === '/chat'
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  const petSize = isMobile ? 66 : 84
  const bottomOffset = isMobile ? 84 : 28

  const getClampedPosition = useCallback(
    (pos: { x: number; y: number }, snapToEdge = false) => {
      if (typeof window === 'undefined') return pos
      const winWidth = window.innerWidth
      const winHeight = window.innerHeight
      const maxX = Math.max(8, winWidth - petSize - 10)
      const maxY = Math.max(8, winHeight - petSize - bottomOffset)

      let finalX = Math.max(8, Math.min(maxX, pos.x))
      const finalY = Math.max(8, Math.min(maxY, pos.y))

      if (snapToEdge && winWidth < 768) {
        const centerX = finalX + petSize / 2
        finalX = centerX < winWidth / 2 ? 8 : maxX
      }

      return { x: finalX, y: finalY }
    },
    [petSize, bottomOffset]
  )

  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 100, y: 100 }
    const mobile = window.innerWidth < 768
    const size = mobile ? 66 : 84
    const offset = mobile ? 84 : 28
    const maxX = Math.max(8, window.innerWidth - size - 10)
    const maxY = Math.max(8, window.innerHeight - size - offset)

    try {
      const saved = localStorage.getItem('coreforge_pet_pos')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const clampedX = Math.max(8, Math.min(maxX, parsed.x))
          const clampedY = Math.max(8, Math.min(maxY, parsed.y))
          if (mobile) {
            return {
              x: clampedX + size / 2 < window.innerWidth / 2 ? 8 : maxX,
              y: clampedY,
            }
          }
          return { x: clampedX, y: clampedY }
        }
      }
    } catch {}

    return {
      x: Math.max(8, window.innerWidth - size - (mobile ? 10 : 22)),
      y: Math.max(8, window.innerHeight - size - (mobile ? 110 : 120)),
    }
  })

  // 拖拽手势状态
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ startX: number; startY: number; petX: number; petY: number } | null>(null)
  const hasDraggedRef = useRef(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // 萌宠情绪、气泡与语音状态
  const [mood, setMood] = useState<PetMood>('idle')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const [bubbleAction, setBubbleAction] = useState<{ label: string; onClick: () => void } | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [isSquishing, setIsSquishing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceMuted, setVoiceMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('coreforge_pet_voice_muted') === '1'
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastLineIdxRef = useRef<number>(-1)
  const bubbleTimerRef = useRef<number | null>(null)

  // 角色形象（默认原版奶龙）
  const [theme, setTheme] = useState<LuluTheme>(() => getSavedPetTheme())
  const persona = PET_PERSONAS[theme] || PET_PERSONAS.yellow

  // 按需播放语音引擎（惰性实例化 HTMLAudioElement，不占首屏加载带宽）
  const playVoice = useCallback(
    (audioUrl: string, force = false) => {
      if (typeof window === 'undefined') return
      if (voiceMuted && !force) return
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio()
          audioRef.current.preload = 'none'
          audioRef.current.onended = () => setIsSpeaking(false)
          audioRef.current.onerror = () => setIsSpeaking(false)
        }
        audioRef.current.pause()
        audioRef.current.src = audioUrl
        audioRef.current.currentTime = 0
        setIsSpeaking(true)
        audioRef.current.play().catch(() => {
          setIsSpeaking(false)
        })
      } catch {
        setIsSpeaking(false)
      }
    },
    [voiceMuted]
  )

  const showBubbleWithVoice = useCallback(
    (text: string, audioUrl?: string, durationMs = 5200, forcePlay = false) => {
      if (bubbleTimerRef.current) {
        window.clearTimeout(bubbleTimerRef.current)
      }
      setBubbleText(text)
      setCurrentAudioUrl(audioUrl || null)
      if (audioUrl) {
        playVoice(audioUrl, forcePlay)
      }
      bubbleTimerRef.current = window.setTimeout(() => {
        setBubbleText(null)
        setBubbleAction(null)
      }, durationMs)
    },
    [playVoice]
  )

  // 组件卸载时停止音频
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (bubbleTimerRef.current) {
        window.clearTimeout(bubbleTimerRef.current)
      }
    }
  }, [])

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

  // 考研倒计时（12月19日初试）
  const daysToExam = Math.max(
    0,
    Math.ceil((new Date('2026-12-19T08:30:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  // 首次进入主动问候气泡（附带小喇叭按钮供用户点击播放语音，遵循浏览器未交互前静音礼仪）
  useEffect(() => {
    // 每个浏览器会话只主动问候一次，避免每次切页都弹气泡遮挡内容
    let greeted = false
    try { greeted = sessionStorage.getItem('pet_greeted') === '1' } catch { /* ignore */ }
    if (greeted) return
    const isMobileViewport = window.innerWidth < 640
    const timer = window.setTimeout(() => {
      try { sessionStorage.setItem('pet_greeted', '1') } catch { /* ignore */ }
      const curTheme = getSavedPetTheme()
      const p = PET_PERSONAS[curTheme] || PET_PERSONAS.yellow
      const firstAudio = PET_VOICE_PACKS[curTheme]?.[0]?.audio || '/pets/voices/nailong_1.mp3'
      setBubbleText(`考研倒计时 ${daysToExam} 天！我是${p.name}，戳戳我听专属加油语音哟~`)
      setCurrentAudioUrl(firstAudio)
      if (onOpenQuickPractice) {
        setBubbleAction({
          label: '🎯 开启随堂真题测试',
          onClick: onOpenQuickPractice,
        })
      }
      bubbleTimerRef.current = window.setTimeout(() => {
        setBubbleText(null)
        setBubbleAction(null)
      }, isMobileViewport ? 3500 : 6800)
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [daysToExam, onOpenQuickPractice])

  // 番茄钟计时与完成语音播报
  useEffect(() => {
    if (!focusActive) return
    const interval = setInterval(() => {
      setFocusSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setFocusActive(false)
          setMood('happy')
          showBubbleWithVoice(
            `🎉 芜湖——！25 分钟深度专注达成！你脑子怎么这么聪明呀，快让奶龙蹭蹭喜气，嘿嘿嘿~`,
            '/pets/voices/nailong_focus_done.mp3?v=2',
            6000
          )
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [focusActive, showBubbleWithVoice])

  // 视口尺寸变化监听
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

  // 切换语音静音开关
  const toggleVoiceMute = () => {
    setVoiceMuted(prev => {
      const nextMuted = !prev
      localStorage.setItem('coreforge_pet_voice_muted', nextMuted ? '1' : '0')
      if (nextMuted) {
        audioRef.current?.pause()
        setIsSpeaking(false)
        showBubbleWithVoice(`🔇 已切换为自习静音模式，${persona.name}安安静静陪你学习~`, undefined, 3000)
      } else {
        const firstLine = PET_VOICE_PACKS[theme]?.[0] || PET_VOICE_PACKS.yellow[0]
        showBubbleWithVoice(`🔊 语音已开启！${firstLine.text}`, firstLine.audio, 5000, true)
      }
      return nextMuted
    })
  }

  // 一键切换萌宠形象并播放新角色登场语音
  const toggleTheme = () => {
    const themes: LuluTheme[] = ['yellow', 'pink', 'purple']
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length
    const nextTheme = themes[nextIndex]
    const nextPersona = PET_PERSONAS[nextTheme]
    const greetLine = PET_VOICE_PACKS[nextTheme]?.[0]
    setTheme(nextTheme)
    lastLineIdxRef.current = 0
    localStorage.setItem('coreforge_lulu_theme', nextTheme)
    window.dispatchEvent(new Event('coreforge-pet-theme-change'))
    setIsSquishing(true)
    setTimeout(() => setIsSquishing(false), 450)
    setMood('happy')
    setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 1800)
    setBubbleAction(null)
    showBubbleWithVoice(
      `✨ 变身：${nextPersona.emoji} ${nextPersona.fullTitle}！${greetLine ? greetLine.text : ''}`,
      greetLine?.audio,
      4800
    )
  }

  // ===== 拖拽手势核心引擎 =====
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const target = e.target as HTMLElement | null
    if (target?.closest('button') || target?.closest('.pet-action-panel') || target?.closest('.pet-interactive')) {
      return
    }

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
      if (showMobileMenu) setShowMobileMenu(false)
      if (bubbleText) setBubbleText(null)
    }

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
      setPosition(prev => {
        const finalPos = getClampedPosition(prev, isMobile)
        try {
          localStorage.setItem('coreforge_pet_pos', JSON.stringify(finalPos))
        } catch {}
        return finalPos
      })
    } else {
      const target = e.target as HTMLElement | null
      if (!target?.closest('button') && !target?.closest('.pet-action-panel') && !target?.closest('.pet-interactive')) {
        handlePetClick()
      }
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

  const pickNextVoiceLine = (): PetVoiceItem => {
    const lines = PET_VOICE_PACKS[theme] || PET_VOICE_PACKS.yellow
    if (lines.length <= 1) return lines[0]
    let idx = Math.floor(Math.random() * lines.length)
    if (idx === lastLineIdxRef.current) {
      idx = (idx + 1) % lines.length
    }
    lastLineIdxRef.current = idx
    return lines[idx]
  }

  const handlePetClick = () => {
    if (minimized) {
      setMinimized(false)
      setIsSquishing(true)
      setTimeout(() => setIsSquishing(false), 500)
      setMood('happy')
      setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 2000)
      const line = pickNextVoiceLine()
      showBubbleWithVoice(line.text, line.audio, 4800)
      return
    }

    if (drawerOpen) {
      setDrawerOpen(false)
      return
    }

    setShowMobileMenu(prev => !prev)
    setIsSquishing(true)
    setTimeout(() => setIsSquishing(false), 500)
    setMood('happy')
    setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 2200)
    setBubbleAction(null)
    const line = pickNextVoiceLine()
    showBubbleWithVoice(line.text, line.audio, 5500)
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

  if (isChatPage) {
    return null
  }

  const isRightSide = position.x > (typeof window !== 'undefined' ? window.innerWidth / 2 : 200)
  const isNearTop = position.y < 110

  return (
    <>
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
        {/* 对话与语音气泡 */}
        {bubbleText && (
          <div
            className={`pet-interactive absolute ${
              isNearTop ? 'top-20' : 'bottom-full mb-2.5'
            } ${
              isRightSide ? 'right-0' : 'left-0'
            } w-64 sm:w-68 max-w-[calc(100vw-24px)] p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-200/90 dark:border-amber-800/60 shadow-xl shadow-amber-500/10 text-xs text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto z-20`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5 min-w-0">
                <span className="text-amber-600 dark:text-amber-400 font-extrabold shrink-0">
                  {persona.emoji} {persona.name}:
                </span>
                <span className="leading-relaxed break-words">{bubbleText}</span>
              </div>
              {currentAudioUrl && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    playVoice(currentAudioUrl, true)
                  }}
                  className={`p-1.5 rounded-full shrink-0 transition-all cursor-pointer ${
                    isSpeaking
                      ? 'bg-amber-500 text-white animate-pulse shadow-sm'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-slate-800 dark:text-amber-400'
                  }`}
                  title="点击播放/重听奶萌语音"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {bubbleAction && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  bubbleAction.onClick()
                  setBubbleText(null)
                }}
                className="mt-2 w-full py-1.5 text-[11px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm cursor-pointer"
              >
                {bubbleAction.label}
              </button>
            )}
            <div
              className={`absolute ${
                isNearTop ? '-top-1.5 border-t border-l rotate-45' : '-bottom-1.5 border-b border-r rotate-45'
              } ${
                isRightSide ? 'right-7' : 'left-7'
              } w-3 h-3 bg-white dark:bg-slate-900 border-amber-200/90 dark:border-amber-800/60`}
            />
          </div>
        )}

        {/* 宠物主体 */}
        {!minimized ? (
          <div className="relative group">
            <LuluAvatar
              mood={mood}
              size={isMobile ? 'sm' : 'md'}
              theme={theme}
              isSquishing={isSquishing}
              isDragging={isDragging}
              isSpeaking={isSpeaking}
            />

            {/* 番茄钟专注药丸徽章 */}
            {focusActive && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold shadow-md whitespace-nowrap animate-pulse border border-white/40 pointer-events-none">
                ⏱️ {formatTimer(focusSecondsLeft)}
              </div>
            )}

            {/* 快捷操作栏 */}
            <div
              onPointerDown={e => e.stopPropagation()}
              onPointerMove={e => e.stopPropagation()}
              onPointerUp={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
              className={`pet-action-panel absolute top-0 ${
                isRightSide ? '-left-10' : '-right-10'
              } flex flex-col gap-1.5 transition-all duration-200 z-20 ${
                showMobileMenu
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
              }`}
            >
              {/* 进入 AI 伴学主工作台 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  navigate('/chat')
                }}
                className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800 text-indigo-600 shadow-lg border border-indigo-200 dark:border-slate-700 flex items-center justify-center hover:bg-indigo-50 hover:scale-110 active:scale-95 transition-all cursor-pointer select-none"
                title="进入全屏 AI 伴学空间"
              >
                <Bot className="w-4 h-4 text-indigo-500" />
              </button>

              {/* 打开智能伴学侧滑抽屉 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setDrawerOpen(prev => !prev)
                  setShowMobileMenu(false)
                }}
                className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 hover:scale-110 active:scale-95 transition-all cursor-pointer select-none"
                title={`呼出${persona.name}快捷伴学抽屉`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* 语音开关按钮 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  toggleVoiceMute()
                }}
                className={`w-8 h-8 rounded-full shadow-lg border flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer select-none ${
                  !voiceMuted
                    ? 'bg-amber-50 dark:bg-slate-800 text-amber-600 border-amber-300 dark:border-amber-700'
                    : 'bg-white/95 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
                title={voiceMuted ? '点击开启奶龙语音' : '语音已开启（点击切换静音自习模式）'}
              >
                {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* 番茄钟开关 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setFocusActive(prev => {
                    const next = !prev
                    if (next) {
                      setMood('focus')
                      showBubbleWithVoice(
                        `⏱️ 嘘——！专注时间到咯，${persona.name}把小嘴巴捂住，乖乖在旁边陪你学 25 分钟哟，嘿嘿~`,
                        theme === 'yellow' ? '/pets/voices/nailong_focus_start.mp3?v=2' : undefined,
                        4800
                      )
                    } else {
                      setMood('idle')
                      showBubbleWithVoice('番茄钟已暂停~', undefined, 3000)
                    }
                    return next
                  })
                }}
                className={`w-8 h-8 rounded-full shadow-lg border flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer select-none ${
                  focusActive
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white/95 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600'
                }`}
                title={focusActive ? '暂停番茄钟' : '开启 25 分钟考研专注伴学'}
              >
                <Clock className="w-4 h-4" />
              </button>

              {/* 切换角色形象 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  toggleTheme()
                }}
                className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800 text-rose-500 shadow-lg border border-rose-200 dark:border-slate-700 flex items-center justify-center hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all cursor-pointer select-none"
                title="切换萌宠形象 (🐲原版奶龙 / 🍊水豚噜噜 / 🎀学妹小核)"
              >
                <Palette className="w-4 h-4" />
              </button>

              {/* 最小化为胶囊徽章 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setMinimized(true)
                  setShowMobileMenu(false)
                }}
                className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800 text-slate-400 hover:text-slate-700 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer select-none"
                title="收起为迷你萌宠胶囊"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>

              {showMobileMenu && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    setShowMobileMenu(false)
                  }}
                  className="w-8 h-8 rounded-full bg-warm-100 dark:bg-slate-800 text-warm-500 dark:text-slate-300 shadow border border-warm-200 dark:border-slate-700 flex items-center justify-center hover:bg-warm-200 transition-all cursor-pointer select-none"
                  title="收起菜单"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            onClick={e => {
              e.stopPropagation()
              if (!hasDraggedRef.current) {
                setMinimized(false)
                setIsSquishing(true)
                setTimeout(() => setIsSquishing(false), 500)
                setMood('happy')
                setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 2000)
                const line = pickNextVoiceLine()
                showBubbleWithVoice(line.text, line.audio, 4800)
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 text-amber-900 dark:text-amber-300 text-xs font-bold shadow-xl border border-amber-300 dark:border-amber-700/60 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap select-none backdrop-blur-md"
            title="点击展开伴学奶龙（可按住自由拖拽）"
          >
            <img src={persona.src} alt={persona.name} className="w-5 h-5 object-contain" draggable={false} />
            <span>{persona.name}</span>
            {focusActive && (
              <span className="text-[10px] text-amber-600 font-mono">
                ({formatTimer(focusSecondsLeft)})
              </span>
            )}
            <Maximize2 className="w-3 h-3 text-amber-600 ml-0.5" />
          </div>
        )}
      </div>

      {drawerOpen && (
        <Suspense fallback={null}>
          <PetAssistantDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            dailyTokens={dailyTokens}
            isLocalModel={isLocalModel}
            onTokenConsumed={handleTokenConsumed}
            onSetMood={setMood}
            onTriggerQuiz={() => onOpenQuickPractice && onOpenQuickPractice()}
          />
        </Suspense>
      )}
    </>
  )
}
