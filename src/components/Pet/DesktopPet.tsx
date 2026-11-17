import { getPomodoroSyncState, onPomodoroSync } from '../../utils/pomodoroSync'
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
  GripVertical,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import LuluAvatar, { useActivePetPersona, PetChibiHead } from './LuluAvatar'
import { useExamCountdown } from '../../utils/examDate'
import {
  playPetSynthSound,
  NAILONG_DIALOGUES,
  type PetMood,
  type HitZone,
} from './NailongRigAvatar'
import { FEIYU_DIALOGUES, FEIYU_CLICK_LINES } from './FeiyuRigAvatar'

export type { PetMood }

const PetAssistantDrawer = lazy(() => import('./PetAssistantDrawer'))

interface DesktopPetProps {
  onOpenQuickPractice?: () => void
}

interface PetVoiceItem {
  text: string
  subtext?: string
  audio?: string
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
  {
    text: '小天才养成记！芜湖~ 连对题目太酷啦，考神附体，高数408稳稳拿下！🎉✨',
    audio: '/pets/voices/nailong_7.mp3?v=3',
  },
  {
    text: '哼哼~ 关键时刻还得看奶龙！冲刺上岸秘籍都在俺的大肚皮里，跟着奶龙稳稳上岸！💪🔥',
    audio: '/pets/voices/nailong_8.mp3?v=3',
  },
  {
    text: '遇到难题别难过，一切很快就会好起来的！深呼吸眨眨眼，奶龙会一直陪着你考上岸的哟~ 🌸',
    audio: '/pets/voices/nailong_9.mp3?v=3',
  },
  {
    text: '学累了吗？医生帮你打针，奶龙帮你打气呀！元气加满，今天也是超棒的一天，冲鸭！🎈🐾',
    audio: '/pets/voices/nailong_10.mp3?v=3',
  },
]

export default function DesktopPet({ onOpenQuickPractice }: DesktopPetProps) {
  const location = useLocation()
  const navigate = useNavigate()

  // 当前激活的伴学宠物人设（支持奶龙 🐲 与 大肥鱼 🐳 全局实时切换）
  const [persona, setPetPersona] = useActivePetPersona()
  const isFeiyu = persona.id === 'feiyu'
  const activeDialogues = isFeiyu ? FEIYU_DIALOGUES : NAILONG_DIALOGUES

  const isChatPage = location.pathname === '/chat'
  const isQuizPage = location.pathname.startsWith('/quiz')

  // 📱 边缘隐藏萌爪形态自由拖动位置管理
  const [hiddenPos, setHiddenPos] = useState<{ y: number; side: 'left' | 'right' }>(() => {
    let y = typeof window !== 'undefined' ? window.innerHeight - 150 : 300
    let side: 'left' | 'right' = 'right'
    try {
      const savedY = localStorage.getItem('coreforge_pet_hidden_y')
      if (savedY) y = Math.max(70, Math.min(window.innerHeight - 90, Number(savedY)))
      const savedSide = localStorage.getItem('coreforge_pet_hidden_side')
      if (savedSide === 'left' || savedSide === 'right') side = savedSide
    } catch {}
    return { y, side }
  })
  const hiddenDragRef = useRef<{ startX: number; startY: number; origY: number; moved: boolean } | null>(null)
  const [isHiddenDragging, setIsHiddenDragging] = useState(false)

  const handleHiddenPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    hiddenDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origY: hiddenPos.y,
      moved: false,
    }
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {}
  }

  const handleHiddenPointerMove = (e: React.PointerEvent) => {
    if (!hiddenDragRef.current) return
    const dx = e.clientX - hiddenDragRef.current.startX
    const dy = e.clientY - hiddenDragRef.current.startY
    if (!hiddenDragRef.current.moved && Math.hypot(dx, dy) > 6) {
      hiddenDragRef.current.moved = true
      setIsHiddenDragging(true)
    }
    if (hiddenDragRef.current.moved) {
      const nextY = Math.max(60, Math.min(window.innerHeight - 90, hiddenDragRef.current.origY + dy))
      const side: 'left' | 'right' = e.clientX < window.innerWidth / 2 ? 'left' : 'right'
      setHiddenPos({ y: nextY, side })
    }
  }

  const handleHiddenPointerUp = (e: React.PointerEvent) => {
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    const moved = hiddenDragRef.current?.moved
    hiddenDragRef.current = null
    setIsHiddenDragging(false)
    if (moved) {
      try {
        localStorage.setItem('coreforge_pet_hidden_y', String(hiddenPos.y))
        localStorage.setItem('coreforge_pet_hidden_side', hiddenPos.side)
      } catch {}
    } else {
      setPetHidden(false)
      try {
        localStorage.removeItem('coreforge_pet_hidden')
      } catch {}
    }
  }

  const handleHiddenPointerCancel = (e: React.PointerEvent) => {
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    hiddenDragRef.current = null
    setIsHiddenDragging(false)
  }

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

  const petBoxWidth = minimized ? (isMobile ? 124 : 138) : petSize

  useEffect(() => {
    if (isMobile && isQuizPage) {
      setMinimized(true)
    }
  }, [isMobile, isQuizPage])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const maxSafeX = Math.max(8, window.innerWidth - petBoxWidth - 10)
    setPosition(prev => (prev.x > maxSafeX ? { x: maxSafeX, y: prev.y } : prev))
  }, [petBoxWidth, isMobile])

  const [isSquishing, setIsSquishing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [bellyJiggle, setBellyJiggle] = useState(false)
  const [headPatting, setHeadPatting] = useState(false)
  const [landingBounce, setLandingBounce] = useState(false)
  const [holdingFood, setHoldingFood] = useState(false)
  const [walkDirection, setWalkDirection] = useState<'left' | 'right'>('right')
  const [isWalkingMove, setIsWalkingMove] = useState(false)

  // 连戳过载、拖拽摇晃眩晕、花式动作轮播与散步计时器引用
  const rapidPokeRef = useRef<{ count: number; firstTs: number }>({ count: 0, firstTs: 0 })
  const shakeTrackRef = useRef<{ lastDir: number; flips: number; windowStart: number }>({
    lastDir: 0,
    flips: 0,
    windowStart: 0,
  })
  const trickIndexRef = useRef<number>(0)
  const walkStopTimerRef = useRef<number | null>(null)
  const moodResetTimerRef = useRef<number | null>(null)

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
  const [eyeCareActive, setEyeCareActive] = useState(false)
  const [eyeCareSecondsLeft, setEyeCareSecondsLeft] = useState(20)
  const [continuousStudySeconds, setContinuousStudySeconds] = useState(0)
  const lastInteractionTimeRef = useRef<number>(Date.now())
  const lastEyeReminderTimeRef = useRef<number>(0)
  const eyeCareCountdownTimerRef = useRef<number | null>(null)

  // 当从其他页面（如设置页或抽屉）切换宠物时，停止上一个宠物的残留音频
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsSpeaking(false)
    }
    setCurrentAudioUrl(null)
  }, [persona.id])

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

  // 按需播放语音引擎（奶龙使用正版原声，大肥鱼使用 Q 弹合成音效避免角色串音）
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
      if (walkStopTimerRef.current) {
        window.clearTimeout(walkStopTimerRef.current)
      }
      if (moodResetTimerRef.current) {
        window.clearTimeout(moodResetTimerRef.current)
      }
    }
  }, [])

  // 专注番茄钟
  const [focusActive, setFocusActive] = useState(() => getPomodoroSyncState().isRunning)
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(() => getPomodoroSyncState().timeLeft)

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const updateInteraction = () => {
      lastInteractionTimeRef.current = Date.now()
    }
    window.addEventListener('pointerdown', updateInteraction, { passive: true })
    window.addEventListener('keydown', updateInteraction, { passive: true })
    window.addEventListener('scroll', updateInteraction, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', updateInteraction)
      window.removeEventListener('keydown', updateInteraction)
      window.removeEventListener('scroll', updateInteraction)
    }
  }, [])

  // 开启 20 秒科学闭目护眼倒计时
  const startEyeCareBreak = useCallback(() => {
    if (eyeCareCountdownTimerRef.current) {
      window.clearInterval(eyeCareCountdownTimerRef.current)
    }
    setEyeCareActive(true)
    setEyeCareSecondsLeft(20)
    setMood('sleepy')
    setShowMobileMenu(false)
    playPetSynthSound('boing', voiceMuted)

    setBubbleAction(null)
    setBubbleText('🌿 正在闭目远眺中... 剩余 20 秒，放松眼眶与睫状肌~')
    setBubbleSubtext(`科学护眼 20-20-20 · ${persona.name}陪你一起闭眼养神 🫧`)

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
        setMood('happy')
        playPetSynthSound('cheer', voiceMuted)
        const doneLine = activeDialogues.eyeCareDone?.[0] || {
          text: `20 秒眼部放松完成！${persona.name}元气满满陪你继续冲刺高分！💪`,
          subtext: '视力充能完毕 · 状态拉满 ✨',
        }
        const doneAudio = doneLine.audio || (isFeiyu ? '/pets/voices/feiyu_focus_done.mp3?v=1' : '/pets/voices/nailong_6.mp3?v=3')
        showBubbleWithVoice(doneLine.text, doneAudio, 6000, false, doneLine.subtext)
        setTimeout(() => {
          setMood(focusActive ? 'focus' : 'idle')
        }, 2500)
      }
    }, 1000)
  }, [voiceMuted, showBubbleWithVoice, focusActive, persona.name, activeDialogues, isFeiyu])

  const triggerEyeCareReminder = useCallback(
    (force = false) => {
      setMood('sleepy')
      playPetSynthSound('pat', voiceMuted)
      const list = activeDialogues.eyeCare || []
      const line = list[Math.floor(Math.random() * list.length)] || {
        mood: 'sleepy',
        text: `👀 学了这么久，眼睛酸酸了吧！跟${persona.name}一起闭眼 20 秒、看看窗外绿植放松一下~`,
        subtext: '长时间用眼警报 · 闭目远眺 20 秒 🌿',
      }

      const eyeAudios = ['/pets/voices/nailong_5.mp3?v=3', '/pets/voices/nailong_6.mp3?v=3']
      const chosenAudio = line.audio || (isFeiyu ? '/pets/voices/feiyu_eyecare.mp3?v=1' : eyeAudios[Math.floor(Math.random() * eyeAudios.length)])

      setBubbleAction({
        label: `👀 陪${persona.name}闭眼远眺 20 秒`,
        onClick: () => startEyeCareBreak(),
      })
      showBubbleWithVoice(line.text, chosenAudio, 8000, force, line.subtext)
    },
    [voiceMuted, showBubbleWithVoice, startEyeCareBreak, activeDialogues, persona.name, isFeiyu]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const interval = window.setInterval(() => {
      const now = Date.now()
      const idleTime = now - lastInteractionTimeRef.current
      if (idleTime > 8 * 60 * 1000) {
        setContinuousStudySeconds(0)
        return
      }

      setContinuousStudySeconds(prev => {
        const next = prev + 10
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

  const countdown = useExamCountdown()
  const daysToExam = countdown.days

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
      if (isFeiyu) {
        setBubbleText(
          `考研倒计时 ${daysToExam} 天！大家好，我是大肥鱼🐟，DeepSeek 家的鲸鱼娘！下次来刷题，记得给我带碗大白米饭哟~`
        )
        setBubbleSubtext('热门短视频少女语音已就绪 · 点击右上角小喇叭畅听')
        setCurrentAudioUrl('/pets/voices/feiyu_intro.mp3?v=1')
      } else {
        const firstAudio = NAILONG_VOICE_PACK[1]?.audio || '/pets/voices/nailong_2.mp3?v=3'
        setBubbleText(`考研倒计时 ${daysToExam} 天！我是奶龙，摸摸我头或者戳戳大肚皮听我唠叨哟~`)
        setBubbleSubtext('真·正版 3D 软萌奶龙已就绪 · 支持 360° 眼神跟随')
        setCurrentAudioUrl(firstAudio)
      }
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
  }, [daysToExam, onOpenQuickPractice, isFeiyu, navigate])

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
          if (isFeiyu) {
            showBubbleWithVoice(
              '🎉 叮咚！25 分钟深度专注达成！让你刷题没让你直接封神呀！快跟本鱼一起炫碗大白米饭庆祝一下吧！🍚🐟',
              '/pets/voices/feiyu_focus_done.mp3?v=1',
              6500,
              false,
              '考神附体 · 奖励冒尖大白米饭一碗'
            )
          } else {
            showBubbleWithVoice(
              '🎉 芜湖——！25 分钟深度专注达成！你脑子怎么这么聪明呀，快让奶龙蹭蹭喜气，嘿嘿嘿~',
              '/pets/voices/nailong_focus_done.mp3?v=2',
              6000,
              false,
              '考神附体 · 奖励大鸡腿一根'
            )
          }
          return 25 * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [focusActive, showBubbleWithVoice, voiceMuted, isFeiyu])

  // 监听全站做题连对事件：直接跳起元气应援舞庆祝！
  useEffect(() => {
    const handleStreak = () => {
      playPetSynthSound('dance', voiceMuted)
      setMood('dancing')
      const streakLines = activeDialogues.quizStreak
      const streakLine = streakLines[Math.floor(Math.random() * streakLines.length)]
      const cheerAudio =
        streakLine.audio || (Math.random() < 0.6 ? '/pets/voices/nailong_7.mp3?v=3' : '/pets/voices/nailong_8.mp3?v=3')
      showBubbleWithVoice(streakLine.text, cheerAudio, 5800, false, streakLine.subtext)
      setTimeout(() => {
        setMood(focusActive ? 'focus' : 'idle')
      }, 3200)
    }
    window.addEventListener('coreforge-quiz-streak', handleStreak)
    return () => window.removeEventListener('coreforge-quiz-streak', handleStreak)
  }, [voiceMuted, showBubbleWithVoice, activeDialogues, focusActive])

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

  // 一键切换伴学宠物搭档（奶龙 🐲 ⇄ 大肥鱼 🐳）
  const handleSwitchPetPartner = () => {
    const nextId = isFeiyu ? 'nailong' : 'feiyu'
    audioRef.current?.pause()
    setIsSpeaking(false)
    setPetPersona(nextId)
    setIsSquishing(true)
    setMood('happy')
    setShowMobileMenu(false)
    playPetSynthSound('cheer', voiceMuted)
    setTimeout(() => {
      setIsSquishing(false)
      setMood(focusActive ? 'focus' : 'idle')
    }, 1800)

    if (nextId === 'feiyu') {
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current)
      setBubbleAction(null)
      const introAudio = '/pets/voices/feiyu_intro.mp3?v=1'
      setCurrentAudioUrl(introAudio)
      if (!voiceMuted) playVoice(introAudio, false)
      setBubbleText('大家好，我是大肥鱼，DeepSeek 家的鲸鱼娘！蓝头发，女仆装，尾巴特别能摇~ 白天吃白饭，晚上摸鱼，记得带碗大白米饭哟！🐟🍚')
      setBubbleSubtext('已切换至：大肥鱼 · 短视频热门少女语音已开启')
      bubbleTimerRef.current = window.setTimeout(() => {
        setBubbleText(null)
        setBubbleSubtext(null)
      }, 7200)
    } else {
      if (bubbleTimerRef.current) window.clearTimeout(bubbleTimerRef.current)
      setBubbleAction(null)
      const audio = NAILONG_VOICE_PACK[1]?.audio
      setCurrentAudioUrl(audio || null)
      if (audio && !voiceMuted) playVoice(audio, false)
      setBubbleText('芜湖~ 奶龙满血归位啦！摸摸俺的大肚皮，大鸡腿和高分秘籍全都给你留着哟！🐲🍗')
      setBubbleSubtext('已切换至：奶龙 · 治愈系伴学小黄龙')
      bubbleTimerRef.current = window.setTimeout(() => {
        setBubbleText(null)
        setBubbleSubtext(null)
      }, 5200)
    }
  }

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
        playPetSynthSound('cheer', false)
        if (isFeiyu) {
          const introLine = FEIYU_CLICK_LINES[0]
          showBubbleWithVoice(
            `🔊 大肥鱼少女语音已开启！${introLine.text}`,
            introLine.audio,
            6800,
            true,
            introLine.subtext
          )
        } else {
          const firstLine = NAILONG_VOICE_PACK[0]
          showBubbleWithVoice(`🔊 语音与Q弹音效已开启！${firstLine.text}`, firstLine.audio, 5000, true)
        }
      }
      return nextMuted
    })
  }

  // 投喂专属美食动作（奶龙：大烤鸡腿 🍗 | 大肥鱼：冒尖大白米饭 🍚）
  const handleFeedTreat = useCallback(() => {
    if (moodResetTimerRef.current) window.clearTimeout(moodResetTimerRef.current)
    if (walkStopTimerRef.current) window.clearTimeout(walkStopTimerRef.current)
    setIsWalkingMove(false)
    playPetSynthSound('nom', voiceMuted)
    setHoldingFood(true)
    setMood('eating')
    setShowMobileMenu(false)
    setBubbleAction(null)
    const list = isFeiyu ? FEIYU_DIALOGUES.feedRice : NAILONG_DIALOGUES.feedChicken
    const line = list[Math.floor(Math.random() * list.length)]
    const eatAudio = line.audio || '/pets/voices/nailong_3.mp3?v=3'
    showBubbleWithVoice(line.text, eatAudio, 5800, false, line.subtext)
    moodResetTimerRef.current = window.setTimeout(() => {
      setHoldingFood(false)
      setMood('happy')
      moodResetTimerRef.current = window.setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 1200)
    }, 2600)
  }, [voiceMuted, isFeiyu, showBubbleWithVoice, focusActive])

  // 触发一段屏幕巡游小碎步散步动作
  const triggerPetStroll = useCallback(
    (showTalk = true) => {
      if (typeof window === 'undefined' || isDragging || minimized || petHidden) return
      if (walkStopTimerRef.current) window.clearTimeout(walkStopTimerRef.current)
      if (moodResetTimerRef.current) window.clearTimeout(moodResetTimerRef.current)

      setPosition(prev => {
        const winW = window.innerWidth
        const minSafeX = 20
        const maxSafeX = Math.max(40, winW - petSize - 24)
        // 靠右时往左溜达，靠左时往右溜达，中间随机
        const preferLeft = prev.x > winW * 0.62 ? true : prev.x < winW * 0.38 ? false : Math.random() < 0.5
        const stepDist = 95 + Math.floor(Math.random() * 65)
        const dir: 'left' | 'right' = preferLeft ? 'left' : 'right'
        const targetX = dir === 'left' ? Math.max(minSafeX, prev.x - stepDist) : Math.min(maxSafeX, prev.x + stepDist)
        setWalkDirection(dir)
        setIsWalkingMove(true)
        setMood('walking')

        const nextPos = getClampedPosition({ x: targetX, y: prev.y }, false)
        try {
          localStorage.setItem('coreforge_pet_pos', JSON.stringify(nextPos))
        } catch {}
        return nextPos
      })

      if (showTalk) {
        const walkLines = activeDialogues.walk || []
        const line = walkLines[Math.floor(Math.random() * walkLines.length)]
        if (line) {
          showBubbleWithVoice(line.text, line.audio, 5400, false, line.subtext)
        }
      }

      walkStopTimerRef.current = window.setTimeout(() => {
        setIsWalkingMove(false)
        setMood(prev => (prev === 'walking' ? (focusActive ? 'focus' : 'idle') : prev))
      }, 2800)
    },
    [isDragging, minimized, petHidden, petSize, getClampedPosition, activeDialogues, showBubbleWithVoice, focusActive]
  )

  // 桌面闲置自主生命行为：定时出来散步巡游或捧空碗撒娇讨饭
  useEffect(() => {
    if (typeof window === 'undefined' || isMobile || petHidden || minimized || focusActive || eyeCareActive || drawerOpen) {
      return
    }
    const lifeTimer = window.setInterval(() => {
      if (isDragging) return
      setMood(currentMood => {
        if (currentMood !== 'idle' && currentMood !== 'sleepy') return currentMood
        // 70% 概率欢快巡游散步，30% 概率捧着空碗星星眼撒娇讨饭
        if (Math.random() < 0.7) {
          window.setTimeout(() => triggerPetStroll(false), 0)
          return currentMood
        } else {
          const begLines = activeDialogues.beg || []
          const line = begLines[Math.floor(Math.random() * begLines.length)]
          if (line) {
            window.setTimeout(() => {
              playPetSynthSound('pat', voiceMuted)
              setBubbleAction({
                label: `${persona.foodEmoji} 立即投喂${persona.foodFull}`,
                onClick: () => handleFeedTreat(),
              })
              showBubbleWithVoice(line.text, line.audio, 6800, false, line.subtext)
            }, 0)
          }
          if (moodResetTimerRef.current) window.clearTimeout(moodResetTimerRef.current)
          moodResetTimerRef.current = window.setTimeout(() => {
            setMood(prev => (prev === 'begging' ? 'idle' : prev))
          }, 5500)
          return 'begging'
        }
      })
    }, 45000)

    return () => window.clearInterval(lifeTimer)
  }, [
    isMobile,
    petHidden,
    minimized,
    focusActive,
    eyeCareActive,
    drawerOpen,
    isDragging,
    triggerPetStroll,
    activeDialogues,
    voiceMuted,
    persona.foodEmoji,
    persona.foodFull,
    handleFeedTreat,
    showBubbleWithVoice,
  ])

  // 一键轮播表演 6 种招牌花式特技动作（无需猜手势，点一下换一种！）
  const handlePerformTrick = () => {
    setShowMobileMenu(false)
    if (moodResetTimerRef.current) window.clearTimeout(moodResetTimerRef.current)
    if (walkStopTimerRef.current) window.clearTimeout(walkStopTimerRef.current)
    setIsWalkingMove(false)
    setBubbleAction(null)

    const tricks: Array<'dance' | 'walk' | 'busy' | 'beg' | 'focusShow' | 'dizzy'> = [
      'dance',
      'walk',
      'busy',
      'beg',
      'focusShow',
      'dizzy',
    ]
    const currentTrick = tricks[trickIndexRef.current % tricks.length]
    trickIndexRef.current += 1

    if (currentTrick === 'walk') {
      playPetSynthSound('pat', voiceMuted)
      triggerPetStroll(true)
      return
    }

    if (currentTrick === 'dance') {
      playPetSynthSound('dance', voiceMuted)
      setMood('dancing')
      const list = activeDialogues.dance || []
      const line = list[Math.floor(Math.random() * list.length)]
      const danceAudio = line?.audio || (isFeiyu ? '/pets/voices/feiyu_praise_streak.mp3?v=1' : '/pets/voices/nailong_6.mp3?v=3')
      if (line) showBubbleWithVoice(line.text, danceAudio, 6200, false, line.subtext)
      moodResetTimerRef.current = window.setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 5200)
    } else if (currentTrick === 'busy') {
      playPetSynthSound('overload', voiceMuted)
      setMood('busy')
      const list = activeDialogues.busy || []
      const line = list[Math.floor(Math.random() * list.length)]
      setBubbleAction({
        label: `${persona.foodEmoji} 投喂${persona.foodFull}满血重启`,
        onClick: () => handleFeedTreat(),
      })
      if (line) showBubbleWithVoice(line.text, line.audio, 6800, false, line.subtext)
      moodResetTimerRef.current = window.setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 6000)
    } else if (currentTrick === 'beg') {
      playPetSynthSound('pat', voiceMuted)
      setMood('begging')
      const list = activeDialogues.beg || []
      const line = list[Math.floor(Math.random() * list.length)]
      setBubbleAction({
        label: `${persona.foodEmoji} 赏一碗${persona.foodFull}`,
        onClick: () => handleFeedTreat(),
      })
      if (line) showBubbleWithVoice(line.text, line.audio, 6800, false, line.subtext)
      moodResetTimerRef.current = window.setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 6000)
    } else if (currentTrick === 'focusShow') {
      playPetSynthSound('cheer', voiceMuted)
      setMood('focus')
      const list = (activeDialogues as Record<string, typeof FEIYU_DIALOGUES.headPat>).focusShow || [
        {
          mood: 'focus' as PetMood,
          text: `🤓 ${persona.name}进入学霸推演状态！把最难的 408 或高数大题砸过来吧！`,
          subtext: '深度专注思考姿态展示',
          audio: isFeiyu ? '/pets/voices/feiyu_focus_start.mp3?v=1' : '/pets/voices/nailong_focus_start.mp3?v=3',
        },
      ]
      const line = list[Math.floor(Math.random() * list.length)]
      showBubbleWithVoice(line.text, line.audio, 6200, false, line.subtext)
      moodResetTimerRef.current = window.setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 5200)
    } else if (currentTrick === 'dizzy') {
      playPetSynthSound('dizzy', voiceMuted)
      setMood('dizzy')
      const list = activeDialogues.dizzy || []
      const line = list[0]
      if (line) showBubbleWithVoice(line.text, line.audio, 5600, false, line.subtext)
      moodResetTimerRef.current = window.setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 4800)
    }
  }

  // 检测 2.8 秒内连续猛戳过载 -> 触发“服务器繁忙/举牌摸鱼”彩蛋
  const checkRapidPokeOverload = (): boolean => {
    const now = Date.now()
    if (now - rapidPokeRef.current.firstTs > 2800) {
      rapidPokeRef.current = { count: 1, firstTs: now }
      return false
    }
    rapidPokeRef.current.count += 1
    if (rapidPokeRef.current.count >= 4) {
      rapidPokeRef.current = { count: 0, firstTs: 0 }
      if (moodResetTimerRef.current) window.clearTimeout(moodResetTimerRef.current)
      playPetSynthSound('overload', voiceMuted)
      setMood('busy')
      const list = activeDialogues.busy || []
      const line = list[Math.floor(Math.random() * list.length)]
      setBubbleAction({
        label: `${persona.foodEmoji} 塞一口${persona.foodFull}哄好`,
        onClick: () => handleFeedTreat(),
      })
      if (line) showBubbleWithVoice(line.text, line.audio, 6800, false, line.subtext)
      moodResetTimerRef.current = window.setTimeout(() => {
        setMood(focusActive ? 'focus' : 'idle')
      }, 5200)
      return true
    }
    return false
  }

  // ===== 拖拽手势核心引擎 =====
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
      if (walkStopTimerRef.current) window.clearTimeout(walkStopTimerRef.current)
      setIsWalkingMove(false)
      setIsDragging(true)
      hasDraggedRef.current = true
      shakeTrackRef.current = { lastDir: 0, flips: 0, windowStart: Date.now() }
      if (showMobileMenu) setShowMobileMenu(false)
      if (!minimized) {
        playPetSynthSound('lift', voiceMuted)
        const liftLine = activeDialogues.dragLift[0]
        showBubbleWithVoice(liftLine.text, liftLine.audio, 4200, false, liftLine.subtext)
      }
    }

    if (isDragging || Math.hypot(dx, dy) > 8) {
      const vx = e.clientX - dragStartRef.current.lastX
      dragStartRef.current.lastX = e.clientX
      setDragTilt(Math.max(-22, Math.min(22, vx * 1.35)))

      // 检测鼠标快速左右来回摇晃（1.3 秒内反转方向 ≥ 4 次触发蚊香眼眩晕！）
      if (Math.abs(vx) >= 7) {
        const dir = vx > 0 ? 1 : -1
        const now = Date.now()
        if (now - shakeTrackRef.current.windowStart > 1300) {
          shakeTrackRef.current = { lastDir: dir, flips: 1, windowStart: now }
        } else if (shakeTrackRef.current.lastDir !== 0 && dir !== shakeTrackRef.current.lastDir) {
          shakeTrackRef.current.lastDir = dir
          shakeTrackRef.current.flips += 1
        } else {
          shakeTrackRef.current.lastDir = dir
        }
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
      const wasShakenHard = shakeTrackRef.current.flips >= 4 && !minimized
      shakeTrackRef.current = { lastDir: 0, flips: 0, windowStart: 0 }

      if (wasShakenHard) {
        // 触发快速摇晃蚊香眼眩晕彩蛋！
        playPetSynthSound('dizzy', voiceMuted)
        setMood('dizzy')
        const dizzyLine = activeDialogues.dizzy?.[0]
        if (dizzyLine) {
          showBubbleWithVoice(dizzyLine.text, dizzyLine.audio, 5600, false, dizzyLine.subtext)
        }
        if (moodResetTimerRef.current) window.clearTimeout(moodResetTimerRef.current)
        moodResetTimerRef.current = window.setTimeout(() => {
          setMood(focusActive ? 'focus' : 'idle')
        }, 3500)
      } else {
        playPetSynthSound('land', voiceMuted)
        setLandingBounce(true)
        const landLine = activeDialogues.landDrop[0]
        showBubbleWithVoice(landLine.text, undefined, 2500, false, landLine.subtext)
        setTimeout(() => {
          setLandingBounce(false)
          setMood(focusActive ? 'focus' : 'idle')
        }, 650)
      }

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
    if (isFeiyu) {
      let idx = Math.floor(Math.random() * FEIYU_CLICK_LINES.length)
      if (idx === lastLineIdxRef.current) {
        idx = (idx + 1) % FEIYU_CLICK_LINES.length
      }
      lastLineIdxRef.current = idx
      return FEIYU_CLICK_LINES[idx]
    }
    if (NAILONG_VOICE_PACK.length <= 1) return NAILONG_VOICE_PACK[0]
    let idx = Math.floor(Math.random() * NAILONG_VOICE_PACK.length)
    if (idx === lastLineIdxRef.current) {
      idx = (idx + 1) % NAILONG_VOICE_PACK.length
    }
    lastLineIdxRef.current = idx
    return NAILONG_VOICE_PACK[idx]
  }

  // 分区点击：摸脑袋 vs 戳大肚皮（连续猛戳 4 下触发举牌“服务器繁忙”罢工彩蛋！）
  const handleZoneTrigger = (zone: HitZone) => {
    if (isDragging || hasDraggedRef.current) return
    if (checkRapidPokeOverload()) return

    if (zone === 'head') {
      if (moodResetTimerRef.current) window.clearTimeout(moodResetTimerRef.current)
      playPetSynthSound('pat', voiceMuted)
      setHeadPatting(true)
      setBellyJiggle(false)
      setMood('happy')
      const list = activeDialogues.headPat
      const line = list[Math.floor(Math.random() * list.length)]
      const headAudio = line.audio || (Math.random() < 0.5 ? '/pets/voices/nailong_9.mp3?v=3' : undefined)
      showBubbleWithVoice(line.text, headAudio, 5800, false, line.subtext)
      moodResetTimerRef.current = window.setTimeout(() => {
        setHeadPatting(false)
        setMood(focusActive ? 'focus' : 'idle')
      }, 2200)
    } else if (zone === 'belly') {
      if (moodResetTimerRef.current) window.clearTimeout(moodResetTimerRef.current)
      playPetSynthSound('boing', voiceMuted)
      setBellyJiggle(true)
      setHeadPatting(false)
      setMood('derp')
      const list = activeDialogues.bellyPoke
      const line = list[Math.floor(Math.random() * list.length)]
      const bellyAudio = line.audio || '/pets/voices/nailong_1.mp3?v=3'
      showBubbleWithVoice(line.text, bellyAudio, 6200, false, line.subtext)
      moodResetTimerRef.current = window.setTimeout(() => {
        setBellyJiggle(false)
        setMood(focusActive ? 'focus' : 'idle')
      }, 2400)
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
      showBubbleWithVoice(line.text, line.audio, 4800, false, line.subtext)
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
    showBubbleWithVoice(line.text, line.audio, 5500, false, line.subtext)
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

  if (isChatPage || (isMobile && isQuizPage)) {
    return null
  }

  if (petHidden) {
    return (
      <div
        style={{
          top: `${hiddenPos.y}px`,
          left: hiddenPos.side === 'left' ? '0px' : 'auto',
          right: hiddenPos.side === 'right' ? '0px' : 'auto',
          touchAction: 'none',
          userSelect: 'none',
        }}
        className={`fixed z-50 select-none cursor-grab active:cursor-grabbing ${
          hiddenPos.side === 'left'
            ? 'rounded-r-2xl border-l-0 pl-1.5 pr-2.5'
            : 'rounded-l-2xl border-r-0 pl-2.5 pr-1.5'
        } py-1.5 ${
          isFeiyu
            ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-300'
            : 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-amber-300'
        } font-bold shadow-xl border flex items-center gap-1 active:scale-95 transition-transform ${
          isHiddenDragging ? 'scale-105 shadow-xl opacity-90' : ''
        }`}
        onPointerDown={handleHiddenPointerDown}
        onPointerMove={handleHiddenPointerMove}
        onPointerUp={handleHiddenPointerUp}
        onPointerCancel={handleHiddenPointerCancel}
        title={`点击唤出${persona.name}伴学小助手（可按住沿边缘自由拖动位置）`}
      >
        <GripVertical className={`w-3 h-3 shrink-0 ${isFeiyu ? 'text-white/60' : 'text-amber-900/40'}`} />
        <PetChibiHead className="w-5 h-5 shrink-0 drop-shadow-xs" withWhiteRim decorative />
        <span className="text-2xs font-extrabold">{persona.name}</span>
      </div>
    )
  }

  const isRightSide = position.x > (typeof window !== 'undefined' ? window.innerWidth / 2 : 200)
  const isNearTop = position.y < 110
  const isNearBottom = typeof window !== 'undefined' && position.y > window.innerHeight - 360

  return (
    <>
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isDragging
            ? 'none'
            : isWalkingMove
            ? 'transform 2.75s linear'
            : 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
        className="fixed top-0 left-0 z-50 select-none cursor-grab active:cursor-grabbing will-change-transform"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onDoubleClick={e => {
          const target = e.target as HTMLElement | null
          if (target?.closest('button') || target?.closest('.pet-action-panel') || minimized) return
          e.stopPropagation()
          if (moodResetTimerRef.current) window.clearTimeout(moodResetTimerRef.current)
          playPetSynthSound('dance', voiceMuted)
          setMood('dancing')
          const list = activeDialogues.dance || []
          const line = list[Math.floor(Math.random() * list.length)]
          const danceAudio = line?.audio || (isFeiyu ? '/pets/voices/feiyu_praise_streak.mp3?v=1' : '/pets/voices/nailong_6.mp3?v=3')
          if (line) showBubbleWithVoice(line.text, danceAudio, 6200, false, line.subtext)
          moodResetTimerRef.current = window.setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 4800)
        }}
      >
        {/* 对话与语音气泡 */}
        {bubbleText && !(isMobile && isQuizPage && minimized) && (
          <div
            className={`pet-interactive absolute ${
              isNearTop ? 'top-20 sm:top-24' : 'bottom-full mb-2.5 sm:mb-3'
            } ${
              isRightSide ? 'right-0' : 'left-0'
            } w-[min(230px,calc(100vw-2rem))] sm:w-72 p-2.5 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border ${
              isFeiyu
                ? 'border-sky-200/90 dark:border-sky-800/60 shadow-xl shadow-blue-500/10'
                : 'border-amber-200/90 dark:border-amber-800/60 shadow-xl shadow-amber-500/10'
            } text-xs text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 pointer-events-auto z-20`}
          >
            <div className="flex items-start justify-between gap-1.5 sm:gap-2">
              <div className="flex flex-col min-w-0">
                <div
                  className={`flex items-center gap-1.5 font-extrabold text-2xs sm:text-xs ${
                    isFeiyu ? 'text-blue-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <PetChibiHead className="w-4 h-4 shrink-0" decorative />
                    <span>{persona.name}</span>
                  </span>
                  {eyeCareActive && (
                    <span className="text-2xs text-sky-600 font-mono">
                      (👀 {eyeCareSecondsLeft}s)
                    </span>
                  )}
                </div>
                <div className="mt-1 leading-snug sm:leading-relaxed font-medium break-words text-2xs sm:text-xs text-slate-800 dark:text-slate-100 max-h-[120px] sm:max-h-none overflow-y-auto overscroll-contain line-clamp-4 sm:line-clamp-none">
                  {bubbleText}
                </div>
                {bubbleSubtext && (
                  <div
                    className={`text-2xs font-semibold mt-1 ${
                      isFeiyu ? 'text-blue-600/90 dark:text-sky-400/90' : 'text-amber-600/90 dark:text-amber-400/90'
                    }`}
                  >
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
                      ? isFeiyu
                        ? 'bg-blue-600 text-white animate-pulse shadow-sm'
                        : 'bg-amber-500 text-white animate-pulse shadow-sm'
                      : isFeiyu
                      ? 'bg-sky-100 hover:bg-sky-200 text-blue-700 dark:bg-slate-800 dark:text-sky-400'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-slate-800 dark:text-amber-400'
                  }`}
                  title={`点击播放/重听${persona.name}语音`}
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
                className={`mt-2 w-full py-1.5 text-2xs font-semibold text-white rounded-xl transition-all shadow-sm cursor-pointer ${
                  isFeiyu
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                }`}
              >
                {bubbleAction.label}
              </button>
            )}
            <div
              className={`absolute ${
                isNearTop ? '-top-1.5 border-t border-l rotate-45' : '-bottom-1.5 border-b border-r rotate-45'
              } ${
                isRightSide ? 'right-7' : 'left-7'
              } w-3 h-3 bg-white dark:bg-slate-900 ${
                isFeiyu ? 'border-sky-200/90 dark:border-sky-800/60' : 'border-amber-200/90 dark:border-amber-800/60'
              }`}
            />
          </div>
        )}

        {/* 宠物主体 */}
        {!minimized ? (
          <div className="relative group">
            <LuluAvatar
              petId={persona.id}
              mood={mood}
              size={isMobile ? 'sm' : 'md'}
              isSquishing={isSquishing}
              isDragging={isDragging}
              isSpeaking={isSpeaking}
              dragTilt={dragTilt}
              wearingHeadphones={focusActive}
              holdingDrumstick={holdingFood}
              eyeOffset={eyeOffset}
              bellyJiggle={bellyJiggle}
              headPatting={headPatting}
              landingBounce={landingBounce}
              walkDirection={walkDirection}
              onZoneTrigger={handleZoneTrigger}
            />

            {/* 护眼闭目倒计时徽章 */}
            {eyeCareActive && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-sky-500 text-white font-mono text-2xs font-bold shadow-sm whitespace-nowrap animate-bounce border border-white/40 pointer-events-none">
                👀 闭目 {eyeCareSecondsLeft}s
              </div>
            )}

            {/* 番茄钟专注药丸徽章 */}
            {focusActive && (
              <div
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-white font-mono text-2xs font-bold shadow-sm whitespace-nowrap animate-pulse border border-white/40 pointer-events-none ${
                  isFeiyu ? 'bg-blue-600' : 'bg-amber-500'
                }`}
              >
                ⏱️ {formatTimer(focusSecondsLeft)}
              </div>
            )}

            {/* 快捷操作栏 */}
            <div
              onPointerDown={e => e.stopPropagation()}
              onPointerMove={e => e.stopPropagation()}
              onPointerUp={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
              className={`pet-action-panel absolute ${
                isNearBottom ? 'bottom-0' : 'top-0'
              } ${
                isRightSide ? 'right-[calc(100%+8px)]' : 'left-[calc(100%+8px)]'
              } flex flex-col gap-1.5 transition-all duration-200 z-20 max-h-[calc(100vh-60px)] overflow-y-auto scrollbar-none py-1.5 px-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl border border-slate-200/80 dark:border-slate-700/80 min-w-[120px] overscroll-contain ${
                showMobileMenu
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'
              }`}
            >
              {/* 一键切换伴学宠物搭档：奶龙 ⇄ 大肥鱼 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  handleSwitchPetPartner()
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl border flex items-center gap-2 active:scale-95 transition-all cursor-pointer select-none text-2xs font-bold whitespace-nowrap ${
                  isFeiyu
                    ? 'bg-amber-50/90 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-slate-700 hover:bg-amber-100'
                    : 'bg-sky-50/90 dark:bg-slate-800 text-blue-700 dark:text-sky-300 border-sky-200/80 dark:border-slate-700 hover:bg-sky-100'
                }`}
                title={isFeiyu ? '切换伴学宠物为：奶龙 🐲' : '切换伴学宠物为：大肥鱼 (DeepSeek) 🐳'}
              >
                <PetChibiHead petId={isFeiyu ? 'nailong' : 'feiyu'} className="w-3.5 h-3.5 shrink-0" decorative />
                <span>{isFeiyu ? '换奶龙陪学' : '换大肥鱼'}</span>
                <RefreshCw className="w-2.5 h-2.5 ml-auto opacity-60 shrink-0" />
              </button>

              {/* 进入 AI 伴学主工作台 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  navigate('/chat')
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-indigo-50/80 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-slate-700 flex items-center gap-2 hover:bg-indigo-100 active:scale-95 transition-all cursor-pointer select-none text-2xs font-semibold whitespace-nowrap"
                title="进入全屏 AI 伴学空间"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>AI 伴学舱</span>
              </button>

              {/* 打开智能伴学侧滑抽屉 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setDrawerOpen(prev => !prev)
                  setShowMobileMenu(false)
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 hover:bg-amber-50 hover:text-amber-700 active:scale-95 transition-all cursor-pointer select-none text-2xs font-semibold whitespace-nowrap"
                title={`呼出${persona.name}快捷伴学抽屉`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>快捷对话</span>
              </button>

              {/* 投喂专属美食（奶龙：鸡腿 🍗 | 大肥鱼：大白米饭 🍚） */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  handleFeedTreat()
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl border flex items-center gap-2 active:scale-95 transition-all cursor-pointer select-none text-2xs font-semibold whitespace-nowrap ${
                  isFeiyu
                    ? 'bg-sky-50/85 dark:bg-slate-800 text-blue-700 dark:text-sky-300 border-sky-200/75 dark:border-slate-700 hover:bg-sky-100'
                    : 'bg-amber-50/80 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-slate-700 hover:bg-amber-100'
                }`}
                title={`投喂香喷喷${persona.foodFull} ${persona.foodEmoji}`}
              >
                <Utensils className={`w-3.5 h-3.5 shrink-0 ${isFeiyu ? 'text-blue-600' : 'text-amber-600'}`} />
                <span>投喂{persona.foodName} {persona.foodEmoji}</span>
              </button>

              {/* 花式动作轮播（跳舞 / 散步 / 举牌服务器繁忙 / 捧碗讨饭 / 学霸眼镜 / 蚊香眼） */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  handlePerformTrick()
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-fuchsia-50/85 dark:bg-slate-800 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200/75 dark:border-slate-700 flex items-center gap-2 hover:bg-fuchsia-100 active:scale-95 transition-all cursor-pointer select-none text-2xs font-semibold whitespace-nowrap"
                title="轮播体验 6 种花式整活特技（也可双击跳舞、连戳 4 下触发罢工、左右摇晃触发蚊香眼）"
              >
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-500 shrink-0" />
                <span>花式动作 ✨</span>
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
                className="w-full px-2.5 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-slate-700 flex items-center gap-2 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer select-none text-2xs font-semibold whitespace-nowrap"
                title="开启考研做题中心 / 随堂测验"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>做题测验</span>
              </button>

              {/* 语音/音效开关按钮 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  toggleVoiceMute()
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl border flex items-center gap-2 active:scale-95 transition-all cursor-pointer select-none text-2xs font-semibold whitespace-nowrap ${
                  !voiceMuted
                    ? isFeiyu
                      ? 'bg-sky-50 dark:bg-slate-800 text-blue-700 border-sky-300 dark:border-sky-700'
                      : 'bg-amber-50 dark:bg-slate-800 text-amber-700 border-amber-300 dark:border-amber-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                }`}
                title={voiceMuted ? `点击开启${persona.name}语音与Q弹音效` : '语音与音效已开启（点击切换静音自习模式）'}
              >
                {voiceMuted ? <VolumeX className="w-3.5 h-3.5 shrink-0" /> : <Volume2 className="w-3.5 h-3.5 shrink-0" />}
                <span>{voiceMuted ? '开启语音' : '静音模式'}</span>
              </button>

              {/* 长时间用眼科学护眼提醒 */}
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
                    setMood(focusActive ? 'focus' : 'idle')
                    showBubbleWithVoice('已提前结束闭目休息~ 眼睛也要继续注意放松哟！', undefined, 3000)
                  } else {
                    triggerEyeCareReminder(true)
                  }
                  setShowMobileMenu(false)
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl border flex items-center gap-2 active:scale-95 transition-all cursor-pointer select-none text-2xs font-semibold whitespace-nowrap ${
                  eyeCareActive
                    ? 'bg-sky-500 text-white border-sky-400 animate-pulse'
                    : 'bg-sky-50/90 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-slate-700 hover:bg-sky-100'
                }`}
                title={
                  eyeCareActive
                    ? `正在闭目护眼倒计时（剩余 ${eyeCareSecondsLeft} 秒）`
                    : `长时间用眼护眼助手（已连续用眼 ${Math.floor(continuousStudySeconds / 60)} 分钟，点击开启 20 秒闭目远眺）`
                }
              >
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span>{eyeCareActive ? `护眼中 ${eyeCareSecondsLeft}s` : '护眼助手'}</span>
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
                      if (isFeiyu) {
                        showBubbleWithVoice(
                          '⏱️ 推推小圆框眼镜🤓——依旧框框烧 Token，依旧用爱发电！接下来 25 分钟，本鱼放下饭碗不摸鱼，陪你沉浸推演到底！🐟💡',
                          '/pets/voices/feiyu_focus_start.mp3?v=1',
                          6200,
                          false,
                          '学霸眼镜鲸鱼娘 · 开启 408 考研心流模式'
                        )
                      } else {
                        showBubbleWithVoice(
                          `⏱️ 嘘——！专注时间到咯，${persona.name}戴上降噪耳机，乖乖在旁边陪你学 25 分钟哟，嘿嘿~`,
                          '/pets/voices/nailong_focus_start.mp3?v=3',
                          4800,
                          false,
                          '头戴降噪小耳机 · 开启 408 考研心流模式'
                        )
                      }
                    } else {
                      setMood('idle')
                      showBubbleWithVoice('番茄钟已暂停~', undefined, 3000)
                    }
                    return next
                  })
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl border flex items-center gap-2 active:scale-95 transition-all cursor-pointer select-none text-2xs font-semibold whitespace-nowrap ${
                  focusActive
                    ? isFeiyu
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-amber-50 hover:text-amber-600'
                }`}
                title={focusActive ? '暂停番茄钟' : '开启 25 分钟考研专注伴学'}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{focusActive ? '暂停专注' : '专注番茄'}</span>
              </button>

              {/* 最小化为胶囊徽章 */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  setMinimized(true)
                  setShowMobileMenu(false)
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 active:scale-95 transition-all cursor-pointer select-none text-2xs font-semibold whitespace-nowrap"
                title="收起为迷你萌宠胶囊"
              >
                <Minimize2 className="w-3.5 h-3.5 shrink-0" />
                <span>最小化</span>
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
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-rose-500 border border-slate-200 dark:border-slate-700 flex items-center gap-2 active:scale-95 transition-all cursor-pointer select-none text-2xs font-semibold whitespace-nowrap"
                title="暂时隐藏（可在屏幕右侧边缘随时点开）"
              >
                <EyeOff className="w-3.5 h-3.5 shrink-0" />
                <span>暂时隐藏</span>
              </button>

              {showMobileMenu && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    setShowMobileMenu(false)
                  }}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-warm-100 dark:bg-slate-800 text-warm-600 dark:text-slate-300 border border-warm-200 dark:border-slate-700 flex items-center gap-2 hover:bg-warm-200 transition-all cursor-pointer select-none text-[11px] font-semibold whitespace-nowrap"
                  title="收起菜单"
                >
                  <X className="w-3.5 h-3.5 shrink-0" />
                  <span>收起菜单</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{ touchAction: 'none' }}
            onClick={e => {
              e.stopPropagation()
              if (!hasDraggedRef.current && !isDragging) {
                setMinimized(false)
                setIsSquishing(true)
                playPetSynthSound('boing', voiceMuted)
                setTimeout(() => setIsSquishing(false), 500)
                setMood('happy')
                setTimeout(() => setMood(focusActive ? 'focus' : 'idle'), 2000)
                const line = pickNextVoiceLine()
                showBubbleWithVoice(line.text, line.audio, 4800, false, line.subtext)
              }
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-2xs sm:text-xs font-bold shadow-xl border hover:scale-105 active:scale-95 transition-all cursor-grab active:cursor-grabbing whitespace-nowrap select-none backdrop-blur-md max-w-[min(200px,calc(100vw-3rem))] touch-none ${
              isFeiyu
                ? 'text-blue-900 dark:text-sky-300 border-sky-300 dark:border-sky-700/60'
                : 'text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60'
            }`}
            title={`按住自由拖拽位置，轻点展开伴学${persona.name}`}
          >
            <GripVertical className={`w-3 h-3 shrink-0 ${isFeiyu ? 'text-blue-500/70' : 'text-amber-500/70'}`} />
            <LuluAvatar petId={persona.id} size="xs" showAccessories={false} />
            <span>{persona.name}</span>
            {focusActive && (
              <span className={`text-2xs font-mono ${isFeiyu ? 'text-blue-600' : 'text-amber-600'}`}>
                ({formatTimer(focusSecondsLeft)})
              </span>
            )}
            <Maximize2 className={`w-3 h-3 ml-0.5 ${isFeiyu ? 'text-blue-600' : 'text-amber-600'}`} />
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                setPetHidden(true)
                try {
                  localStorage.setItem('coreforge_pet_hidden', '1')
                } catch {}
              }}
              className={`p-0.5 rounded-full transition-colors ml-1 cursor-pointer ${
                isFeiyu
                  ? 'hover:bg-sky-100 dark:hover:bg-slate-800 text-blue-700/60 hover:text-rose-500'
                  : 'hover:bg-amber-100 dark:hover:bg-slate-800 text-amber-700/60 hover:text-rose-500'
              }`}
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
