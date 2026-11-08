import { useState, useEffect, useRef } from 'react'
import type { PetMood, HitZone } from './NailongRigAvatar'
import NailongRigAvatar from './NailongRigAvatar'

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
    fullTitle: '真·呆傻贪吃大肚皮 · 奶龙',
    emoji: '🐲',
    src: '/pets/nailong.png?v=2',
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

export interface LuluAvatarProps {
  mood?: PetMood
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  theme?: LuluTheme
  isSquishing?: boolean
  isDragging?: boolean
  isSpeaking?: boolean
  onClick?: () => void
  showAccessories?: boolean
  // 新增骨骼与交互增强支持
  dragTilt?: number
  wearingHeadphones?: boolean
  holdingDrumstick?: boolean
  eyeOffset?: { x: number; y: number }
  bellyJiggle?: boolean
  headPatting?: boolean
  landingBounce?: boolean
  onZoneTrigger?: (zone: HitZone, e: React.MouseEvent) => void
}

interface Particle {
  id: number
  symbol: string
  x: number
  tx: number
}

const SPARKLE_SYMBOLS = ['🍗', '💖', '✨', '⭐', '🍖', '🎵', '💫', '🫧']

export default function LuluAvatar({
  mood = 'idle',
  size = 'md',
  theme,
  isSquishing = false,
  isDragging = false,
  isSpeaking = false,
  onClick,
  showAccessories = true,
  dragTilt = 0,
  wearingHeadphones = false,
  holdingDrumstick = false,
  eyeOffset,
  bellyJiggle = false,
  headPatting = false,
  landingBounce = false,
  onZoneTrigger,
}: LuluAvatarProps) {
  const [syncedTheme, setSyncedTheme] = useState<LuluTheme>(() => theme || getSavedPetTheme())
  const [particles, setParticles] = useState<Particle[]>([])
  const [internalEyeOffset, setInternalEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const petRef = useRef<HTMLDivElement>(null)

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
  const isNailong = persona.id === 'nailong'

  // 如果未从外部提供 eyeOffset，则内部自动进行简单的光标视差追踪计算
  useEffect(() => {
    if (eyeOffset !== undefined || typeof window === 'undefined' || isMini) return
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
        const maxDist = 240
        const nx = Math.max(-1, Math.min(1, dx / maxDist))
        const ny = Math.max(-1, Math.min(1, dy / maxDist))
        setInternalEyeOffset({ x: Number(nx.toFixed(2)), y: Number(ny.toFixed(2)) })
      })
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      cancelAnimationFrame(rafId)
    }
  }, [eyeOffset, isMini])

  const effectiveEyeOffset = eyeOffset ?? internalEyeOffset

  const sizePixelMap = {
    xs: 28,
    sm: 68,
    md: 86,
    lg: 96,
    xl: 128,
  }

  const sizeClassMap = {
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

  const handleTap = (e: React.MouseEvent) => {
    spawnParticles()
    onClick?.()
    if (!onZoneTrigger && isNailong) {
      // 默认如果没有区分热区，则默认判定为肚皮触摸
      // onZoneTrigger?.('belly', e)
    }
  }

  const moodBadge =
    !showAccessories || isMini
      ? null
      : isSpeaking
      ? '🎵'
      : mood === 'thinking'
      ? '💭'
      : mood === 'happy'
      ? '💖'
      : mood === 'sleepy'
      ? '💤'
      : mood === 'focus'
      ? '🔥'
      : mood === 'eating'
      ? '🍗'
      : mood === 'derp'
      ? '🤪'
      : null

  return (
    <div
      ref={petRef}
      onClick={handleTap}
      className={`relative ${sizeClassMap[size]} flex items-center justify-center select-none ${
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
        @keyframes pet-shadow-breathe {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.28; }
          50% { transform: translateX(-50%) scale(0.82); opacity: 0.16; }
        }
        @keyframes pet-particle-rise {
          0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
          100% { transform: translate(var(--tx), -46px) scale(1.25); opacity: 0; }
        }
        .anim-pet-idle { animation: pet-waddle-dance 1.24s ease-in-out infinite; }
      `}</style>

      {/* 底部柔和光环 */}
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

      {/* 角色核心渲染 */}
      {isNailong ? (
        // 真·骨骼分层矢量奶龙：彻底淘汰黑狗鼻子与猫爪肉垫贴图，自带 360° 视差眼睛与物理弹簧
        <div className="w-full h-full flex items-center justify-center pointer-events-auto">
          <NailongRigAvatar
            mood={mood}
            isSpeaking={isSpeaking}
            isDragging={isDragging}
            dragTilt={dragTilt}
            wearingHeadphones={wearingHeadphones || mood === 'focus'}
            holdingDrumstick={holdingDrumstick || mood === 'eating'}
            eyeOffset={effectiveEyeOffset}
            bellyJiggle={bellyJiggle || isSquishing}
            headPatting={headPatting}
            landingBounce={landingBounce}
            size={sizePixelMap[size]}
            onZoneTrigger={onZoneTrigger}
          />
        </div>
      ) : (
        // 其他皮肤：保留原高精立绘和呼吸动效
        <div className="relative w-full h-full flex items-center justify-center origin-bottom will-change-transform anim-pet-idle">
          {!isMini && (
            <div
              className="absolute bottom-0.5 left-1/2 w-[62%] h-2.5 rounded-full bg-slate-900/40 blur-[3px] pointer-events-none"
              style={{ animation: 'pet-shadow-breathe 1.24s ease-in-out infinite' }}
            />
          )}
          <img
            src={persona.src}
            alt={persona.name}
            draggable={false}
            style={{
              transform: effectiveEyeOffset.x ? `rotate(${effectiveEyeOffset.x * 6}deg)` : undefined,
              transition: 'transform 0.22s ease-out',
              filter: isMini
                ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.16))'
                : 'drop-shadow(0 5px 10px rgba(15, 23, 42, 0.22))',
            }}
            className="w-full h-full object-contain pointer-events-none select-none"
          />
        </div>
      )}

      {/* 状态小气泡角标 */}
      {moodBadge && (
        <span
          className="absolute -top-1 -right-0.5 text-sm leading-none drop-shadow-sm animate-bounce pointer-events-none select-none z-10"
          aria-hidden="true"
        >
          {moodBadge}
        </span>
      )}

      {/* 触摸粒子 */}
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
