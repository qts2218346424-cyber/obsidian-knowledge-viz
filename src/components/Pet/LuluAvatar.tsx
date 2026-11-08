import { useState, useEffect, useRef } from 'react'
import type { PetMood, HitZone } from './NailongRigAvatar'
import NailongRigAvatar from './NailongRigAvatar'

export type LuluTheme = 'yellow' | 'nailong'

export interface PetPersonaMeta {
  theme: LuluTheme
  id: 'nailong'
  name: string
  fullTitle: string
  emoji: string
  src: string
  glowColor: string
  ringColor: string
}

export const NAILONG_PERSONA: PetPersonaMeta = {
  theme: 'yellow',
  id: 'nailong',
  name: '奶龙',
  fullTitle: '呆傻贪吃大肚皮 · 奶龙',
  emoji: '🐲',
  src: '/pets/nailong.png',
  glowColor: 'rgba(250, 204, 21, 0.48)',
  ringColor: 'rgba(245, 158, 11, 0.55)',
}

export const PET_PERSONAS: Record<string, PetPersonaMeta> = {
  yellow: NAILONG_PERSONA,
  nailong: NAILONG_PERSONA,
  // 兼容旧存储键值映射
  pink: NAILONG_PERSONA,
  purple: NAILONG_PERSONA,
}

export function getSavedPetTheme(): LuluTheme {
  return 'yellow'
}

export interface LuluAvatarProps {
  mood?: PetMood
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  theme?: string
  isSquishing?: boolean
  isDragging?: boolean
  isSpeaking?: boolean
  onClick?: () => void
  showAccessories?: boolean
  // 骨骼与物理交互支持
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
  const [particles, setParticles] = useState<Particle[]>([])
  const [internalEyeOffset, setInternalEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const petRef = useRef<HTMLDivElement>(null)

  const isMini = size === 'xs'

  // 如果未从外部提供 eyeOffset，则内部自动进行光标视差追踪计算
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

  const handleTap = () => {
    spawnParticles()
    onClick?.()
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
        @keyframes pet-particle-rise {
          0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
          100% { transform: translate(var(--tx), -46px) scale(1.25); opacity: 0; }
        }
      `}</style>

      {/* 底部柔和光环 */}
      {!isMini && (isSpeaking || mood === 'focus' || mood === 'happy') && (
        <div
          className="absolute inset-0.5 rounded-full blur-md pointer-events-none transition-opacity duration-300"
          style={{
            background:
              mood === 'focus'
                ? 'radial-gradient(circle, rgba(56,189,248,0.45) 0%, transparent 72%)'
                : NAILONG_PERSONA.glowColor,
          }}
        />
      )}

      {/* 唯一核心角色：正版 3D 奶龙物理骨骼引擎 */}
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

export { LuluAvatar as NailongAvatar }
