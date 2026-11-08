import { useState, useEffect, useRef } from 'react'
import type { PetMood } from './DesktopPet'

export type LuluTheme = 'yellow' | 'pink' | 'purple'

export interface PetPersonaMeta {
  theme: LuluTheme
  id: 'nailong' | 'lulu' | 'xiaohe'
  name: string
  fullTitle: string
  emoji: string
  src: string
  spriteSrc?: string
  glowColor: string
  ringColor: string
}

export const PET_PERSONAS: Record<LuluTheme, PetPersonaMeta> = {
  yellow: {
    theme: 'yellow',
    id: 'nailong',
    name: '奶龙',
    fullTitle: '呆傻贪吃大肚皮 · 奶龙',
    emoji: '🐲',
    src: '/pets/nailong.png?v=2',
    spriteSrc: '/pets/nailong_sprite.png?v=2',
    glowColor: 'rgba(250, 204, 21, 0.48)',
    ringColor: 'rgba(245, 158, 11, 0.55)',
  },
  pink: {
    theme: 'pink',
    id: 'lulu',
    name: '噜噜',
    fullTitle: '呆萌顶橘水豚 · 噜噜',
    emoji: '🍊',
    src: '/pets/lulu.png',
    glowColor: 'rgba(249, 115, 22, 0.36)',
    ringColor: 'rgba(234, 88, 12, 0.5)',
  },
  purple: {
    theme: 'purple',
    id: 'xiaohe',
    name: '小核',
    fullTitle: '二次元元气学妹 · 小核',
    emoji: '🎀',
    src: '/pets/xiaohe.png',
    glowColor: 'rgba(244, 114, 182, 0.38)',
    ringColor: 'rgba(236, 72, 153, 0.5)',
  },
}

export function getSavedPetTheme(): LuluTheme {
  if (typeof window === 'undefined') return 'yellow'
  const val = localStorage.getItem('coreforge_lulu_theme')
  if (val === 'yellow' || val === 'pink' || val === 'purple') return val
  return 'yellow'
}

interface LuluAvatarProps {
  mood?: PetMood
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  theme?: LuluTheme
  isSquishing?: boolean
  isDragging?: boolean
  isSpeaking?: boolean
  onClick?: () => void
  showAccessories?: boolean
}

interface Particle {
  id: number
  symbol: string
  x: number
  tx: number
}

const SPARKLE_SYMBOLS = ['🍗', '💖', '✨', '⭐', '🍖', '🎵', '💫', '🫧']

/**
 * 奶龙 8 帧精灵表索引定义 (nailong_sprite.png):
 * 0: idle_1 (左歪头+左脚踏步+右爪招手+尾巴上翘)
 * 1: idle_2 (右歪头+右脚踏步+左爪下扑+肚皮微鼓)
 * 2: blink  (呆萌闭眼眨眼帧)
 * 3: derp   (呆傻斗鸡眼 + ω波浪嘴流口水 + 歪头扭屁股犯傻)
 * 4: talk_1 (开口说话小张嘴 + 挥爪)
 * 5: talk_2 (哇啦哇啦张大嘴露粉舌头 + 拍大肚皮)
 * 6: happy_1(弯弯月牙笑眼 + 哈哈大笑嘴 + 蹦跳)
 * 7: happy_2(斗鸡眼哈哈傻笑 + 换脚扭屁股)
 */
export default function LuluAvatar({
  mood = 'idle',
  size = 'md',
  theme,
  isSquishing = false,
  isDragging = false,
  isSpeaking = false,
  onClick,
  showAccessories = true,
}: LuluAvatarProps) {
  const [syncedTheme, setSyncedTheme] = useState<LuluTheme>(() => theme || getSavedPetTheme())
  const [particles, setParticles] = useState<Particle[]>([])
  const [headTilt, setHeadTilt] = useState(0)
  const [frameIdx, setFrameIdx] = useState<number>(0)
  const [goofyAct, setGoofyAct] = useState<'none' | 'derp' | 'wiggle' | 'boing'>('none')
  const petRef = useRef<HTMLDivElement>(null)
  const tickRef = useRef<number>(0)

  useEffect(() => {
    if (theme) {
      setSyncedTheme(theme)
      return
    }
    const sync = () => setSyncedTheme(getSavedPetTheme())
    window.addEventListener('coreforge-pet-theme-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('coreforge-pet-theme-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [theme])

  const activeTheme = theme || syncedTheme
  const persona = PET_PERSONAS[activeTheme] || PET_PERSONAS.yellow
  const isMini = size === 'xs'
  const isNailong = persona.id === 'nailong' && !isMini

  // 光标靠近时奶龙自动变成斗鸡眼流口水或者歪头盯你看
  useEffect(() => {
    if (typeof window === 'undefined' || isMini) return
    let rafId = 0
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!petRef.current) return
        const rect = petRef.current.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.hypot(dx, dy)
        if (dist < 180 && dist > 6) {
          setHeadTilt(Number(Math.max(-8, Math.min(8, (dx / 180) * 8)).toFixed(2)))
        } else {
          setHeadTilt(0)
        }
      })
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      cancelAnimationFrame(rafId)
    }
  }, [isMini])

  // 奶龙全天候动态帧状态机（说话高频张嘴同步 / 戳肚皮大笑 / 待机踏步招手眨眼犯傻）
  useEffect(() => {
    if (!isNailong) return

    if (isSpeaking) {
      // 说话或大笑时：135ms 高速切换张嘴露舌头、大笑、斗鸡眼傻笑与招手踏步帧
      const talkSeq = [4, 5, 4, 6, 5, 0, 4, 7, 5, 6]
      let i = 0
      const timer = window.setInterval(() => {
        setFrameIdx(talkSeq[i % talkSeq.length])
        i++
      }, 135)
      return () => window.clearInterval(timer)
    }

    if (isSquishing || mood === 'happy') {
      // 被戳肚皮或开心时：在月牙眼大笑 (6) 与 斗鸡眼傻笑 (7) 之间欢快切换
      const happySeq = [6, 7, 6, 3, 7, 6]
      let i = 0
      const timer = window.setInterval(() => {
        setFrameIdx(happySeq[i % happySeq.length])
        i++
      }, 170)
      return () => window.clearInterval(timer)
    }

    if (isDragging) {
      // 被拎起来摇晃时：斗鸡眼流口水 (3) 与 张大嘴惊呼 (5) 交替
      const dragSeq = [3, 5, 3, 7]
      let i = 0
      const timer = window.setInterval(() => {
        setFrameIdx(dragSeq[i % dragSeq.length])
        i++
      }, 180)
      return () => window.clearInterval(timer)
    }

    // 日常待机：每 300ms 踏步招手扭屁股，穿插眨眼 (2)、斗鸡眼流口水犯傻 (3) 与偷笑 (6)
    const idleTimer = window.setInterval(() => {
      tickRef.current += 1
      const t = tickRef.current
      const mod = t % 20
      if (mod === 5 || mod === 13) {
        setFrameIdx(2) // 呆萌眨眼
      } else if (mod >= 8 && mod <= 10) {
        setFrameIdx(3) // 连续3拍斗鸡眼流口水犯傻
        if (mod === 8) {
          setGoofyAct('derp')
          setTimeout(() => setGoofyAct('none'), 900)
        }
      } else if (mod === 16 || mod === 17) {
        setFrameIdx(6) // 傻笑两拍
        if (mod === 16) {
          setGoofyAct('wiggle')
          setTimeout(() => setGoofyAct('none'), 700)
        }
      } else {
        setFrameIdx(t % 2 === 0 ? 0 : 1) // 左右踏步招手摇尾巴
      }
    }, 310)

    return () => window.clearInterval(idleTimer)
  }, [isNailong, isSpeaking, isSquishing, isDragging, mood])

  const sizeMap = {
    xs: 'w-7 h-7',
    sm: 'w-[68px] h-[68px]',
    md: 'w-[86px] h-[86px]',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }

  const spawnParticles = () => {
    if (isMini) return
    const count = 5
    const next: Particle[] = Array.from({ length: count }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      symbol: SPARKLE_SYMBOLS[Math.floor(Math.random() * SPARKLE_SYMBOLS.length)],
      x: 15 + Math.random() * 70,
      tx: (Math.random() - 0.5) * 56,
    }))
    setParticles(prev => [...prev.slice(-8), ...next])
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !next.some(n => n.id === p.id)))
    }, 950)
  }

  const handleTap = () => {
    spawnParticles()
    onClick?.()
  }

  const moodBadge =
    !showAccessories || isMini
      ? null
      : isSpeaking
      ? '🎵'
      : goofyAct === 'derp'
      ? '🍗'
      : mood === 'thinking'
      ? '💭'
      : mood === 'happy'
      ? '💖'
      : mood === 'sleepy'
      ? '💤'
      : mood === 'focus'
      ? '🔥'
      : null

  return (
    <div
      ref={petRef}
      onClick={handleTap}
      className={`relative ${sizeMap[size]} flex items-center justify-center select-none ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <style>{`
        @keyframes pet-waddle-dance {
          0%, 100% { transform: translateY(0px) rotate(-2.5deg) scale(1.01, 0.99); }
          25% { transform: translateY(-4px) rotate(0deg) scale(0.99, 1.02); }
          50% { transform: translateY(0px) rotate(2.5deg) scale(1.01, 0.99); }
          75% { transform: translateY(-4px) rotate(0deg) scale(0.99, 1.02); }
        }
        @keyframes pet-talk-bop {
          0%, 100% { transform: translateY(0px) rotate(-4deg) scale(1.04, 0.96); }
          50% { transform: translateY(-8px) rotate(4deg) scale(0.96, 1.06); }
        }
        @keyframes pet-belly-boing {
          0% { transform: scale(1, 1); }
          20% { transform: scale(1.30, 0.74) translateY(7px) rotate(-5deg); }
          45% { transform: scale(0.84, 1.20) translateY(-10px) rotate(5deg); }
          68% { transform: scale(1.14, 0.88) translateY(3px) rotate(-3deg); }
          85% { transform: scale(0.96, 1.04) translateY(-2px); }
          100% { transform: scale(1, 1); }
        }
        @keyframes pet-derp-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(7deg) scale(1.05, 0.96); }
          75% { transform: rotate(-7deg) scale(1.05, 0.96); }
        }
        @keyframes pet-drag-dangle {
          0%, 100% { transform: translateY(-7px) rotate(-9deg) scale(1.06); }
          50% { transform: translateY(-10px) rotate(9deg) scale(1.06); }
        }
        @keyframes pet-shadow-breathe {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.30; }
          50% { transform: translateX(-50%) scale(0.80); opacity: 0.16; }
        }
        @keyframes pet-particle-rise {
          0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
          100% { transform: translate(var(--tx), -46px) scale(1.25); opacity: 0; }
        }
        .anim-pet-idle { animation: pet-waddle-dance 1.24s ease-in-out infinite; }
        .anim-pet-talk { animation: pet-talk-bop 0.42s ease-in-out infinite; }
        .anim-pet-squish { animation: pet-belly-boing 0.62s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .anim-pet-derp { animation: pet-derp-shake 0.45s ease-in-out infinite; }
        .anim-pet-drag { animation: pet-drag-dangle 0.48s ease-in-out infinite; }
      `}</style>

      {/* 底部立体软萌呼吸阴影 */}
      {!isMini && (
        <div
          className="absolute bottom-0.5 left-1/2 w-[62%] h-2.5 rounded-full bg-slate-900/40 blur-[3px] pointer-events-none"
          style={{ animation: 'pet-shadow-breathe 1.24s ease-in-out infinite' }}
        />
      )}

      {/* 柔和氛围背光光环 */}
      {!isMini && (isSpeaking || mood === 'focus' || mood === 'happy') && (
        <div
          className="absolute inset-0.5 rounded-full blur-md pointer-events-none transition-opacity duration-300"
          style={{
            background:
              mood === 'focus'
                ? 'radial-gradient(circle, rgba(56,189,248,0.45) 0%, transparent 72%)'
                : persona.glowColor,
          }}
        />
      )}

      {/* 角色主体：奶龙使用 8 帧无缝动态精灵引擎，其他皮肤使用高清立绘 */}
      <div
        className={`relative w-full h-full flex items-center justify-center origin-bottom will-change-transform ${
          isDragging
            ? 'anim-pet-drag'
            : isSquishing
            ? 'anim-pet-squish'
            : isSpeaking
            ? 'anim-pet-talk'
            : goofyAct === 'derp' || goofyAct === 'wiggle'
            ? 'anim-pet-derp'
            : 'anim-pet-idle'
        }`}
      >
        {isNailong && persona.spriteSrc ? (
          <div
            style={{
              transform: headTilt ? `rotate(${headTilt}deg)` : undefined,
              transition: 'transform 0.18s ease-out',
              filter: 'drop-shadow(0 5px 10px rgba(15, 23, 42, 0.24))',
            }}
            className="w-full h-full overflow-hidden pointer-events-none select-none relative"
          >
            <img
              src={persona.spriteSrc}
              alt={persona.name}
              draggable={false}
              style={{
                width: '800%',
                height: '100%',
                maxWidth: 'none',
                transform: `translate3d(-${frameIdx * 12.5}%, 0, 0)`,
              }}
              className="block h-full object-fill pointer-events-none select-none"
            />
          </div>
        ) : (
          <img
            src={persona.src}
            alt={persona.name}
            draggable={false}
            style={{
              transform: headTilt ? `rotate(${headTilt}deg)` : undefined,
              transition: 'transform 0.22s ease-out',
              filter: isMini
                ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.16))'
                : 'drop-shadow(0 5px 10px rgba(15, 23, 42, 0.22))',
            }}
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        )}
      </div>

      {/* 状态小气泡角标（唱歌音符 / 贪吃大鸡腿 / 专注小火苗） */}
      {moodBadge && (
        <span
          className="absolute -top-1 -right-0.5 text-sm leading-none drop-shadow-sm animate-bounce pointer-events-none select-none"
          aria-hidden="true"
        >
          {moodBadge}
        </span>
      )}

      {/* 摸头/戳肚皮飘浮粒子 */}
      {particles.map(p => (
        <span
          key={p.id}
          style={
            {
              left: `${p.x}%`,
              top: '12%',
              '--tx': `${p.tx}px`,
              animation: 'pet-particle-rise 0.9s ease-out forwards',
            } as React.CSSProperties
          }
          className="absolute text-sm pointer-events-none select-none z-30"
        >
          {p.symbol}
        </span>
      ))}
    </div>
  )
}
