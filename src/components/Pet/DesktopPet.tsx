import { getPomodoroSyncState, setPomodoroSyncState, onPomodoroSync } from '../../utils/pomodoroSync'
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Clock,
  MessageSquare,
  Maximize2,
  Minimize2,
  Bot,
  Volume2,
  VolumeX,
  X,
  Utensils,
  Award,
  Eye,
  EyeOff,
} from 'lucide-react'
import LuluAvatar, { NAILONG_PERSONA } from './LuluAvatar'
import { getExamCountdownDays, EXAM_DATE_DISPLAY } from '../../utils/examDate'
import {
  playPetSynthSound,
  NAILONG_DIALOGUES,
  type PetMood,
  type HitZone,
} from './NailongRigAvatar'

export type { PetMood }

const PetAssistantDrawer = lazy(() => import('./PetAssistantDrawer'))

interface DesktopPetProps {
  onOpenQuickPractice?: () => void
}

interface PetVoiceItem {
  text: string
  audio: string
}

const NAILONG_VOICE_PACK: PetVoiceItem[] = [
  {
    text: '哈哈哈好痒呀！别戳俺的大肚皮，再戳俺就要变成小黄球滚走咯~ 🐲✨',
    audio: '/pets/voices/nailong_1.mp3?v=3',
  },
  {
    text: '我是奶龙！咦——？一加一等于几来着？等于两个大鸡腿！跟着奶龙混，高数408全都稳过哟！🍗',
    audio: '/pets/voices/nailong_2.mp3?v=3',
  },
  {
    text: '啊呜——！香迷糊了！大鸡腿配高数真题，越啃越有劲，啊呜一口全吃掉！😋',
    audio: '/pets/voices/nailong_3.mp3?v=3',
  },
  {
    text: '哼哼，我才是真的奶龙！你看我圆滚滚的大肚子，里面装的全是一战成硕的秘籍哟！💪',
    audio: '/pets/voices/nailong_4.mp3?v=3',
  },
  {
    text: '呼噜噜……啊？我没睡着，我才没流口水呢！我刚刚是在闭着眼睛帮你想难题呢，信奶龙一回嘛~ 🫧',
    audio: '/pets/voices/nailong_5.mp3?v=3',
  },
  {
    text: '芜湖！你居然学了这么久，太酷啦！快看奶龙给你跳个扭屁股舞，12月19号咱们妥妥考上岸，耶！🌟',
    audio: '/pets/voices/nailong_6.mp3?v=3',
  },
]

export default function DesktopPet({ onOpenQuickPractice }: DesktopPetProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const isChatPage = location.pathname === '/chat'
  const isQuizPage = location.pathname.startsWith('/quiz')
  const [petHidden, setPetHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem('coreforge_pet_hidden') === '1'
    } catch {
      return false
    }
  })
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  const petSize = isMobile ? 68 : 88
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
    const size = mobile ? 68 : 88
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

  // 拖拽手势状态与物理摆角
  const [isDragging, setIsDragging] = useState(false)
  const [dragTilt, setDragTilt] = useState(0)
  const dragStartRef = useRef<{
    startX: number
    startY: number
    petX: number
    petY: number
    lastX: number
  } | null>(null)
  const hasDraggedRef = useRef(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // 萌宠情绪、骨骼微动与物理状态
  const [mood, setMood] = useState<PetMood>('idle')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bubbleText, setBubbleText] = useState<string | null>(null)
  const [bubbleSubtext, setBubbleSubtext] = useState<string | null>(null)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const [bubbleAction, setBubbleAction] = useState<{ label: string; onClick: () => void } | null>(null)
  const [minimized, setMinimized] = useState(false)

  // 📱 移动端做题中心自动微缩贴边，避免遮挡科目卡片右上角或做题正文
  useEffect(() => {
    if (isMobile && isQuizPage) {
      setMinimized(true)
    }
  }, [isMobile, isQuizPage])
  const [isSquishing, setIsSquishing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [bellyJiggle, setBellyJiggle] = useState(false)
  const [headPatting, setHeadPatting] = useState(false)
  const [landingBounce, setLandingBounce] = useState(false)
  const [holdingDrumstick, setHoldingDrumstick] = useState(false)

  // 360° 视差目光追踪与闲置打瞌睡
  const [eyeOffset, setEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const idleSleepTimerRef = useRef<number | null>(null)

  const [voiceMuted, setVoiceMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('coreforge_pet_voice_muted') === '1'
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastLineIdxRef = useRef<number>(-1)
  const bubbleTimerRef = useRef<number | null>(null)

  // ===== 长时间用眼与护眼健康机制 (Eye Care System) =====
  // 保持当前奶龙正版音源 (nailong_5.mp3 打瞌睡揉眼版 / nailong_6.mp3 学习超久夸夸舞版)
  const [eyeCareActive, setEyeCareActive] = useState(false)
  const [eyeCareSecondsLeft, setEyeCareSecondsLeft] = useState(20)
  const [continuousStudySeconds, setContinuousStudySeconds] = useState(0)
  const lastInteractionTimeRef = useRef<number>(Date.now())
  const lastEyeReminderTimeRef = useRef<number>(0)
  const eyeCareCountdownTimerRef = useRef<number | null>(null)

  // 角色形象：奶龙专属
  const persona = NAILONG_PERSONA

  // 360° 视差目光跟随与自然呼吸/闲置瞌睡
  useEffect(() => {
    if (typeof window === 'undefined' || isMobile) return

    const handlePointerMove = (e: PointerEvent) => {
      const cx = position.x + petSize / 2
      const cy = position.y + petSize / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const maxDist = 260
      const nx = Math.max(-1, Math.min(1, dx / maxDist))
      const ny = Math.max(-1, Math.min(1, dy / maxDist))
      setEyeOffset({ x: Number(nx.toFixed(2)), y: Number(ny.toFixed(2)) })

      // 如果正在打瞌睡，光标晃动时唤醒奶龙
      setMood(prev => (prev === 'sleepy' ? 'idle' : prev))

      if (idleSleepTimerRef.current) clearTimeout(idleSleepTimerRef.current)
      idleSleepTimerRef.current = window.setTimeout(() => {
        setMood(prev => (prev === 'idle' ? 'sleepy' : prev))
      }, 22000)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      if (idleSleepTimerRef.current) clearTimeout(idleSleepTimerRef.current)
    }
  }, [position.x, position.y, petSize, isMobile])

  // 按需播放语音引擎（与软萌合成音效双轨联动）
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
    (text: string, audioUrl?: string, durationMs = 5200, forcePlay = false, subtext?: string) => {
      if (bubbleTimerRef.current) {
        window.clearTimeout(bubbleTimerRef.current)
      }
      setBubbleText(text)
      setBubbleSubtext(subtext || null)
      setCurrentAudioUrl(audioUrl || null)
      if (audioUrl) {
        playVoice(audioUrl, forcePlay)
      }
      bubbleTimerRef.current = window.setTimeout(() => {
        setBubbleText(null)
        setBubbleSubtext(null)
        setBubbleAction(null)
      }, durationMs)
    },
    [playVoice]
  )

  // 组件卸载时停止音频与计时器
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (bubbleTimerRef.current) {
        window.clearTimeout(bubbleTimerRef.current)
      }
      if (idleSleepTimerRef.current) {
        window.clearTimeout(idleSleepTimerRef.current)
      }
      if (eyeCareCountdownTimerRef.current) {
        window.clearInterval(eyeCareCountdownTimerRef.current)
      }
    }
  }, [])

  // 专注番茄钟
  const [focusActive, setFocusActive] = useState(() => getPomodoroSyncState().isRunning)
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(() => getPomodoroSyncState().timeLeft)

  // 监听全站番茄钟全局同频同步事件
  useEffect(() => {
    const unsub = onPomodoroSync(state => {
      setFocusActive(state.isRunning)
      setFocusSecondsLeft(state.timeLeft)
      if (state.isRunning) {
        setMood('focus')
      }
    })
    return unsub
  }, [])

  // 用户交互活跃监听（用于精准评估连续用眼时长）
  useEffect(() => {
    if (typeof window === "undefined") return
    const updateInteraction = () => {
      lastInteractionTimeRef.current = Date.now()
    }
    window.addEventListener("pointerdown", updateInteraction, { passive: true })
    window.addEventListener("keydown", updateInteraction, { passive: true })
    window.addEventListener("scroll", updateInteraction, { passive: true })
    return () => {
      window.removeEventListener("pointerdown", updateInteraction)
      window.removeEventListener("keydown", updateInteraction)
      window.removeEventListener("scroll", updateInteraction)
    }
  }, [])

  // 开启 20 秒科学闭目护眼倒计时 (20-20-20 护眼法则)
  const startEyeCareBreak = useCallback(() => {
    if (eyeCareCountdownTimerRef.current) {
      window.clearInterval(eyeCareCountdownTimerRef.current)
    }
    setEyeCareActive(true)
    setEyeCareSecondsLeft(20)
    setMood("sleepy")
    setShowMobileMenu(false)
    playPetSynthSound("boing", voiceMuted)

    setBubbleAction(null)
    setBubbleText("🌿 正在闭目远眺中... 剩余 20 秒，放松眼眶与睫状肌~")
    setBubbleSubtext("科学护眼 20-20-20 · 奶龙陪你一起闭眼养神 🫧")

    let left = 20
    eyeCareCountdownTimerRef.current = window.setInterval(() => {
      left -= 1
      setEyeCareSecondsLeft(left)
      if (left > 0) {
        setBubbleText(`🌿 正在闭目远眺中... 剩余 ${left} 秒，放松眼眶与睫状肌~`)
      } else {
        if (eyeCareCountdownTimerRef.current) {
          window.clearInterval(eyeCareCountdownTimerRef.current)
          eyeCareCountdownTimerRef.current = null
        }
        setEyeCareActive(false)
        setContinuousStudySeconds(0)
        setMood("happy")
        playPetSynthSound("cheer", voiceMuted)
        const doneLine = NAILONG_DIALOGUES.eyeCareDone?.[0] || {
          text: "芜湖！20 秒眼部放松完成！眼睛亮晶晶，奶龙元气满满陪你继续冲刺高分！💪",
          subtext: "视力充能完毕 · 状态拉满 ✨",
        }
        showBubbleWithVoice(doneLine.text, "/pets/voices/nailong_6.mp3?v=3", 6000, false, doneLine.subtext)
        setTimeout(() => {
          setMood(focusActive ? "focus" : "idle")
        }, 2500)
      }
    }, 1000)
  }, [voiceMuted, showBubbleWithVoice, focusActive])

  // 触发长时间用眼护眼提醒（保持当前正版奶龙原声音源）
  const triggerEyeCareReminder = useCallback(
    (force = false) => {
      setMood("sleepy")
      playPetSynthSound("pat", voiceMuted)
      const list = NAILONG_DIALOGUES.eyeCare || []
      const line = list[Math.floor(Math.random() * list.length)] || {
        mood: "sleepy",
        text: "👀 学了这么久，眼睛酸酸了吧！快揉揉眼睛，跟奶龙一起闭眼 20 秒、看看窗外绿植放松一下~",
        subtext: "长时间用眼警报 · 闭目远眺 20 秒 🌿",
      }

      // 保持当前音源：轮换使用闭目揉眼 (nailong_5.mp3) 与学了这么久夸夸 (nailong_6.mp3)
      const eyeAudios = [
        "/pets/voices/nailong_5.mp3?v=3",
        "/pets/voices/nailong_6.mp3?v=3",
      ]
      const chosenAudio = eyeAudios[Math.floor(Math.random() * eyeAudios.length)]

      setBubbleAction({
        label: "👀 陪奶龙闭眼远眺 20 秒",
        onClick: () => startEyeCareBreak(),
      })
      showBubbleWithVoice(line.text, chosenAudio, 8000, force, line.subtext)
    },
    [voiceMuted, showBubbleWithVoice, startEyeCareBreak]
  )

  // 护眼检查时钟：每 10 秒评估一次连续活跃时间
  useEffect(() => {
    if (typeof window === "undefined") return
    const interval = window.setInterval(() => {
      const now = Date.now()
      const idleTime = now - lastInteractionTimeRef.current
      // 如果超过 8 分钟没有任何交互，说明用户已离席休息，将连续用眼时间重置
      if (idleTime > 8 * 60 * 1000) {
        setContinuousStudySeconds(0)
        return
      }

      setContinuousStudySeconds(prev => {
        const next = prev + 10
        // 当连续用眼达到 30 分钟 (1800 秒)，且距离上次提醒超过 20 分钟 (1200 秒)
        const EYE_REMINDER_THRESHOLD = 30 * 60
        const MIN_INTERVAL_BETWEEN_REMINDERS = 20 * 60 * 1000
        if (
          next >= EYE_REMINDER_THRESHOLD &&
          !eyeCareActive &&
          now - lastEyeReminderTimeRef.current > MIN_INTERVAL_BETWEEN_REMINDERS
        ) {
          lastEyeReminderTimeRef.current = now
          triggerEyeCareReminder()
        }
        return next
      })
    }, 10000)

    return () => window.clearInterval(interval)
  }, [eyeCareActive, triggerEyeCareReminder])

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

  // 考研初试统一倒计时（12月19日初试）
  const daysToExam = Math.max(
    0,
    getExamCountdownDays()
  )

  // 首次进入主动问候气泡
  useEffect(() => {
    let greeted = false
    try {
      greeted = sessionStorage.getItem('pet_greeted') === '1'
    } catch {
      /* ignore */
    }
    if (greeted) return
    const isMobileViewport = window.innerWidth < 640
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem('pet_greeted', '1')
      } catch {
        /* ignore */
      }
      const firstAudio = NAILONG_VOICE_PACK[1]?.audio || '/pets/voices/nailong_2.mp3?v=3'
      setBubbleText(`考研倒计时 ${daysToExam} 天！我是奶龙，摸摸我头或者戳戳大肚皮听我唠叨哟~`)
      setBubbleSubtext('真·正版 3D 软萌奶龙已就绪 · 支持 360° 眼神跟随')
      setCurrentAudioUrl(firstAudio)
      const triggerPractice = onOpenQuickPractice || (() => navigate('/quiz'))
      setBubbleAction({
        label: '🎯 开启随堂真题测试',
        onClick: triggerPractice,
      })
      bubbleTimerRef.current = window.setTimeout(() => {
        setBubbleText(null)
        setBubbleSubtext(null)
        setBubbleAction(null)
      }, isMobileViewport ? 4000 : 7000)
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [daysToExam, onOpenQuickPractice])

  // 番茄钟计时与完成播报
  useEffect(() => {
    if (!focusActive) return
    const interval = setInterval(() => {
      setFocusSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setFocusActive(false)
          setMood('happy')
          playPetSynthSound('cheer', voiceMuted)
          showBubbleWithVoice(
            `🎉 芜湖——！25 分钟深度专注达成！你脑子怎么这么聪明呀，快让奶龙蹭蹭喜气，嘿嘿嘿~`,
            '/pets/voices/nailong_focus_done.mp3?v=2',
            6000,
            false,
            '考神附体 · 奖励大鸡腿一根'
          )
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [focusActive, showBubbleWithVoice, voiceMuted])

  // 监听全站做题连对事件，触发奶龙欢呼与庆祝
  useEffect(() => {
    const handleStreak = () => {
      playPetSynthSound('cheer', voiceMuted)
      setBellyJiggle(true)
      setMood('happy')
      const streakLine = NAILONG_DIALOGUES.quizStreak[0]
      showBubbleWithVoice(streakLine.text, undefined, 4500, false, streakLine.subtext)
      setTimeout(() => {
        setBellyJiggle(false)
        setMood('idle')
      }, 2500)
    }
    window.addEventListener('coreforge-quiz-streak', handleStreak)
    return () => window.removeEventListener('coreforge-quiz-streak', handleStreak)
  }, [voiceMuted, showBubbleWithVoice])

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
        showBubbleWithVoice(`🔇 已切换为自习静音模式，奶龙安安静静陪你学习~`, undefined, 3000)
      } else {
        playPetSynthSound('cheer', false)
        const firstLine = NAILONG_VOICE_PACK[0]
        showBubbleWithVoice(`🔊 语音与Q弹音效已开启！${firstLine.text}`, firstLine.audio, 5000, true)
      }
      return nextMuted
    })
  }

  // 投喂大烤鸡腿动作
  const handleFeedDrumstick = () => {
    playPetSynthSound('nom', voiceMuted)
    setHoldingDrumstick(true)
    setMood('eating')
    setShowMobileMenu(false)
    const list = NAILONG_DIALOGUES.feedChicken
    const line = list[Math.floor(Math.random() * list.length)]
    showBubbleWithVoice(line.text, '/pets/voices/nailong_3.mp3?v=3', 4500, false, line.subtext)
    setTimeout(() => {
      setHoldingDrumstick(false)
      setMood('happy')
      setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 1200)
    }, 2400)
  }

  // ===== 拖拽手势核心引擎（带惯性倾角与踢腿） =====
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const target = e.target as HTMLElement | null
    if (target?.closest('button') || target?.closest('.pet-action-panel') || target?.closest('.pet-interactive')) {
      return
    }

    hasDraggedRef.current = false
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      petX: position.x,
      petY: position.y,
      lastX: e.clientX,
    }

    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {}
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.startX
    const dy = e.clientY - dragStartRef.current.startY

    if (!isDragging && Math.hypot(dx, dy) > 8) {
      setIsDragging(true)
      hasDraggedRef.current = true
      if (showMobileMenu) setShowMobileMenu(false)
      playPetSynthSound('lift', voiceMuted)
      const liftLine = NAILONG_DIALOGUES.dragLift[0]
      showBubbleWithVoice(liftLine.text, undefined, 2600, false, liftLine.subtext)
    }

    if (isDragging || Math.hypot(dx, dy) > 8) {
      const vx = e.clientX - dragStartRef.current.lastX
      dragStartRef.current.lastX = e.clientX
      setDragTilt(Math.max(-22, Math.min(22, vx * 1.35)))

      const nextPos = getClampedPosition(
        {
          x: dragStartRef.current.petX + dx,
          y: dragStartRef.current.petY + dy,
        },
        false
      )
      setPosition(nextPos)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}

    const wasDragging = isDragging
    const wasDragged = hasDraggedRef.current
    dragStartRef.current = null
    setIsDragging(false)
    setDragTilt(0)

    if (wasDragging || wasDragged) {
      // 落地重力回弹
      playPetSynthSound('land', voiceMuted)
      setLandingBounce(true)
      const landLine = NAILONG_DIALOGUES.landDrop[0]
      showBubbleWithVoice(landLine.text, undefined, 2500, false, landLine.subtext)
      setTimeout(() => {
        setLandingBounce(false)
        setMood(focusActive ? 'focus' : 'idle')
      }, 650)

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
    setIsDragging(false)
    setDragTilt(0)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    dragStartRef.current = null
    setPosition(prev => getClampedPosition(prev, isMobile))
  }

  const pickNextVoiceLine = (): PetVoiceItem => {
    if (NAILONG_VOICE_PACK.length <= 1) return NAILONG_VOICE_PACK[0]
    let idx = Math.floor(Math.random() * NAILONG_VOICE_PACK.length)
    if (idx === lastLineIdxRef.current) {
      idx = (idx + 1) % NAILONG_VOICE_PACK.length
    }
    lastLineIdxRef.current = idx
    return NAILONG_VOICE_PACK[idx]
  }

  // 分区点击：摸大脑袋 vs 戳大白肚皮
  const handleZoneTrigger = (zone: HitZone) => {
    if (isDragging || hasDraggedRef.current) return

    if (zone === 'head') {
      playPetSynthSound('pat', voiceMuted)
      setHeadPatting(true)
      setMood('happy')
      const list = NAILONG_DIALOGUES.headPat
      const line = list[Math.floor(Math.random() * list.length)]
      showBubbleWithVoice(line.text, undefined, 4200, false, line.subtext)
      setTimeout(() => {
        setHeadPatting(false)
        setMood(focusActive ? 'focus' : 'idle')
      }, 1500)
    } else if (zone === 'belly') {
      playPetSynthSound('boing', voiceMuted)
      setBellyJiggle(true)
      setMood('derp')
      const list = NAILONG_DIALOGUES.bellyPoke
      const line = list[Math.floor(Math.random() * list.length)]
      // 戳肚皮直接触发正版奶龙魔性爆笑原声！
      showBubbleWithVoice(line.text, '/pets/voices/nailong_1.mp3?v=3', 4800, false, line.subtext)
      setTimeout(() => {
        setBellyJiggle(false)
        setMood(focusActive ? 'focus' : 'idle')
      }, 1800)
    }
  }

  // 基础点击处理
  const handlePetClick = () => {
    if (minimized) {
      setMinimized(false)
      setIsSquishing(true)
      playPetSynthSound('boing', voiceMuted)
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
    playPetSynthSound('boing', voiceMuted)
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

  if (petHidden) {
    return (
      <button
        type="button"
        onClick={() => {
          setPetHidden(false)
          try {
            localStorage.removeItem('coreforge_pet_hidden')
          } catch {}
        }}
        className="fixed right-0 bottom-24 z-40 px-2 py-1.5 rounded-l-xl bg-amber-400/90 hover:bg-amber-400 text-amber-950 text-xs font-bold shadow-md backdrop-blur-xs flex items-center gap-1 transition-all cursor-pointer border border-amber-300"
        title="点击唤出奶龙伴学小助手"
      >
        <span>🐲</span>
        <span className="text-[10px]">奶龙</span>
      </button>
    )
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
              isNearTop ? 'top-20 sm:top-24' : 'bottom-full mb-2.5 sm:mb-3'
            } ${
              isRightSide ? 'right-0' : 'left-0'
            } w-[min(240px,calc(100vw-2rem))] sm:w-72 p-2.5 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-200/90 dark:border-amber-800/60 shadow-xl shadow-amber-500/10 text-xs text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto z-20`}
          >
            <div className="flex items-start justify-between gap-1.5 sm:gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs">
                  <span>{persona.emoji} {persona.name}</span>
            {eyeCareActive && (
              <span className="text-[10px] text-sky-600 font-mono">
                (👀 {eyeCareSecondsLeft}s)
              </span>
            )}
                </div>
                <div className="mt-1 leading-snug sm:leading-relaxed font-medium break-words text-[11.5px] sm:text-xs text-slate-800 dark:text-slate-100 max-h-[120px] sm:max-h-none overflow-y-auto overscroll-contain line-clamp-4 sm:line-clamp-none">
                  {bubbleText}
                </div>
                {bubbleSubtext && (
                  <div className="text-[11px] font-semibold text-amber-600/90 dark:text-amber-400/90 mt-1">
                    {bubbleSubtext}
                  </div>
                )}
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
                  setBubbleSubtext(null)
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
              isSquishing={isSquishing}
              isDragging={isDragging}
              isSpeaking={isSpeaking}
              dragTilt={dragTilt}
              wearingHeadphones={focusActive}
              holdingDrumstick={holdingDrumstick}
              eyeOffset={eyeOffset}
              bellyJiggle={bellyJiggle}
              headPatting={headPatting}
              landingBounce={landingBounce}
              onZoneTrigger={handleZoneTrigger}
            />

            {/* 护眼闭目倒计时徽章 */}
            {eyeCareActive && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-sky-500 text-white font-mono text-[10px] font-bold shadow-md whitespace-nowrap animate-bounce border border-white/40 pointer-events-none">
                👀 闭目 {eyeCareSecondsLeft}s
              </div>
            )}

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

              {/* 投喂大烤鸡腿 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  handleFeedDrumstick()
                }}
                className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800 text-amber-600 shadow-lg border border-amber-200 dark:border-slate-700 flex items-center justify-center hover:bg-amber-50 hover:scale-110 active:scale-95 transition-all cursor-pointer select-none"
                title="投喂香喷喷大烤鸡腿 🍗"
              >
                <Utensils className="w-4 h-4 text-amber-600" />
              </button>

              {/* 随堂练习快捷按钮 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  if (onOpenQuickPractice) {
                    onOpenQuickPractice()
                  } else {
                    navigate('/quiz')
                  }
                  setShowMobileMenu(false)
                }}
                className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800 text-emerald-600 shadow-lg border border-emerald-200 dark:border-slate-700 flex items-center justify-center hover:bg-emerald-50 hover:scale-110 active:scale-95 transition-all cursor-pointer select-none"
                title="开启考研做题中心 / 随堂测验"
              >
                <Award className="w-4 h-4 text-emerald-600" />
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
                title={voiceMuted ? '点击开启奶龙语音与Q弹音效' : '语音与音效已开启（点击切换静音自习模式）'}
              >
                {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* 长时间用眼科学护眼提醒 / 一键开启 20 秒放松 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  if (eyeCareActive) {
                    if (eyeCareCountdownTimerRef.current) {
                      window.clearInterval(eyeCareCountdownTimerRef.current)
                      eyeCareCountdownTimerRef.current = null
                    }
                    setEyeCareActive(false)
                    setMood(focusActive ? "focus" : "idle")
                    showBubbleWithVoice("已提前结束闭目休息~ 眼睛也要继续注意放松哟！", undefined, 3000)
                  } else {
                    triggerEyeCareReminder(true)
                  }
                  setShowMobileMenu(false)
                }}
                className={`w-8 h-8 rounded-full shadow-lg border flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer select-none ${
                  eyeCareActive
                    ? "bg-sky-500 text-white border-sky-400 animate-pulse"
                    : "bg-white/95 dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-lg border border-sky-200 dark:border-slate-700 hover:bg-sky-50"
                }`}
                title={
                  eyeCareActive
                    ? `正在闭目护眼倒计时（剩余 ${eyeCareSecondsLeft} 秒）`
                    : `长时间用眼护眼助手（已连续用眼 ${Math.floor(continuousStudySeconds / 60)} 分钟，点击开启 20 秒闭目远眺）`
                }
              >
                <Eye className="w-4 h-4" />
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
                      playPetSynthSound('cheer', voiceMuted)
                      showBubbleWithVoice(
                        `⏱️ 嘘——！专注时间到咯，${persona.name}戴上降噪耳机，乖乖在旁边陪你学 25 分钟哟，嘿嘿~`,
                        '/pets/voices/nailong_focus_start.mp3?v=3',
                        4800,
                        false,
                        '头戴降噪小耳机 · 开启 408 考研心流模式'
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

              {/* 一键隐藏到屏幕边缘 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setPetHidden(true)
                  try {
                    localStorage.setItem('coreforge_pet_hidden', '1')
                  } catch {}
                  setShowMobileMenu(false)
                }}
                className="w-8 h-8 rounded-full bg-white/95 dark:bg-slate-800 text-slate-400 hover:text-rose-500 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer select-none"
                title="暂时隐藏（可在屏幕右侧边缘随时点开）"
              >
                <EyeOff className="w-3.5 h-3.5" />
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
                playPetSynthSound('boing', voiceMuted)
                setTimeout(() => setIsSquishing(false), 500)
                setMood('happy')
                setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 2000)
                const line = pickNextVoiceLine()
                showBubbleWithVoice(line.text, line.audio, 4800)
              }
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 text-amber-900 dark:text-amber-300 text-[11px] sm:text-xs font-bold shadow-xl border border-amber-300 dark:border-amber-700/60 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap select-none backdrop-blur-md max-w-[min(200px,calc(100vw-3rem))]"
            title="点击展开伴学奶龙（可按住自由拖拽）"
          >
            <LuluAvatar size="xs" showAccessories={false} />
            <span>{persona.name}</span>
            {focusActive && (
              <span className="text-[10px] text-amber-600 font-mono">
                ({formatTimer(focusSecondsLeft)})
              </span>
            )}
            <Maximize2 className="w-3 h-3 text-amber-600 ml-0.5" />
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                setPetHidden(true)
                try {
                  localStorage.setItem('coreforge_pet_hidden', '1')
                } catch {}
              }}
              className="p-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-slate-800 text-amber-700/60 hover:text-rose-500 transition-colors ml-1 cursor-pointer"
              title="收起为边缘萌爪"
            >
              <X className="w-3 h-3" />
            </button>
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
