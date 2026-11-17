import { useState, useEffect, useRef, useCallback } from 'react'
import type { PetMood, HitZone } from './NailongRigAvatar'
import NailongRigAvatar, { NailongChibiHead } from './NailongRigAvatar'
import FeiyuRigAvatar, { FeiyuChibiHead } from './FeiyuRigAvatar'

export type PetId = 'nailong' | 'feiyu'
export type LuluTheme = 'yellow' | 'nailong' | 'blue' | 'feiyu'

export interface PetPersonaMeta {
  theme: LuluTheme
  id: PetId
  name: string
  fullTitle: string
  tagline: string
  emoji: string
  foodName: string
  foodFull: string
  foodEmoji: string
  src: string
  glowColor: string
  ringColor: string
}

export const NAILONG_PERSONA: PetPersonaMeta = {
  theme: 'yellow',
  id: 'nailong',
  name: '奶龙',
  fullTitle: '呆傻贪吃大肚皮 · 奶龙',
  tagline: '圆滚滚暖心小黄龙，最爱啃大烤鸡腿，自带正版原声夸夸与治愈肚皮弹力',
  emoji: '🐲',
  foodName: '鸡腿',
  foodFull: '大烤鸡腿',
  foodEmoji: '🍗',
  src: '/pets/nailong.webp',
  glowColor: 'rgba(250, 204, 21, 0.48)',
  ringColor: 'rgba(245, 158, 11, 0.55)',
}

export const FEIYU_PERSONA: PetPersonaMeta = {
  theme: 'blue',
  id: 'feiyu',
  name: '大肥鱼',
  fullTitle: 'DeepSeek 干饭鲸鱼娘 · 大肥鱼',
  tagline: '顶着呆毛、身穿蓝鲸围裙女仆装的傲娇鲸鱼娘，靠狂炫冒尖大白米饭补充算力 Token',
  emoji: '🐟',
  foodName: '米饭',
  foodFull: '冒尖大白米饭',
  foodEmoji: '🍚',
  src: '/pets/feiyu_idle.webp?v=2',
  glowColor: 'rgba(59, 130, 246, 0.48)',
  ringColor: 'rgba(37, 99, 235, 0.55)',
}

export const PET_PERSONAS: Record<string, PetPersonaMeta> = {
  yellow: NAILONG_PERSONA,
  nailong: NAILONG_PERSONA,
  blue: FEIYU_PERSONA,
  feiyu: FEIYU_PERSONA,
  // 兼容历史存储键值
  pink: NAILONG_PERSONA,
  purple: NAILONG_PERSONA,
}

export const PET_PERSONA_LIST: PetPersonaMeta[] = [NAILONG_PERSONA, FEIYU_PERSONA]

const PET_STORAGE_KEY = 'coreforge_pet_persona'
const PET_CHANGE_EVENT = 'coreforge-pet-change'

export function getSavedPetId(): PetId {
  if (typeof window === 'undefined') return 'nailong'
  try {
    const saved = localStorage.getItem(PET_STORAGE_KEY)
    if (saved === 'feiyu' || saved === 'blue') return 'feiyu'
  } catch {
    // 忽略存储读取受限
  }
  return 'nailong'
}

export function getSavedPetTheme(): LuluTheme {
  return getSavedPetId() === 'feiyu' ? 'feiyu' : 'yellow'
}

export function setSavedPetId(nextId: PetId): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PET_STORAGE_KEY, nextId)
  } catch {
    // 忽略存储写入受限
  }
  window.dispatchEvent(new CustomEvent<PetId>(PET_CHANGE_EVENT, { detail: nextId }))
}

export function useActivePetPersona(): [PetPersonaMeta, (nextId: PetId) => void] {
  const [petId, setPetId] = useState<PetId>(() => getSavedPetId())

  useEffect(() => {
    const handlePetChange = (e: Event) => {
      const detail = (e as CustomEvent<PetId>).detail
      if (detail === 'nailong' || detail === 'feiyu') {
        setPetId(detail)
      } else {
        setPetId(getSavedPetId())
      }
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PET_STORAGE_KEY) {
        setPetId(getSavedPetId())
      }
    }
    window.addEventListener(PET_CHANGE_EVENT, handlePetChange)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener(PET_CHANGE_EVENT, handlePetChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const updatePet = useCallback((nextId: PetId) => {
    setPetId(nextId)
    setSavedPetId(nextId)
  }, [])

  return [petId === 'feiyu' ? FEIYU_PERSONA : NAILONG_PERSONA, updatePet]
}

export function PetChibiHead({
  petId,
  className = 'w-5 h-5',
  withWhiteRim = false,
  decorative = false,
}: {
  petId?: PetId
  className?: string
  withWhiteRim?: boolean
  decorative?: boolean
}) {
  const [activePersona] = useActivePetPersona()
  const resolvedId = petId ?? activePersona.id
  if (resolvedId === 'feiyu') {
    return (
      <FeiyuChibiHead
        className={className}
        withWhiteRim={withWhiteRim}
        decorative={decorative}
      />
    )
  }
  return (
    <NailongChibiHead
      className={className}
      withWhiteRim={withWhiteRim}
      decorative={decorative}
    />
  )
}

export interface LuluAvatarProps {
  petId?: PetId
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
  walkDirection?: 'left' | 'right'
  onZoneTrigger?: (zone: HitZone, e: React.MouseEvent) => void
}

interface Particle {
  id: number
  symbol: string
  x: number
  tx: number
}

const NAILONG_SPARKLES = ['🍗', '💖', '✨', '⭐', '🍖', '🎵', '💫', '🫧']
const FEIYU_SPARKLES = ['🍚', '🐳', '🫧', '✨', '🥢', '💧', '💙', '⭐']

export default function LuluAvatar({
  petId,
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
  walkDirection,
  onZoneTrigger,
}: LuluAvatarProps) {
  const [activePersona] = useActivePetPersona()
  const resolvedPersona = petId
    ? PET_PERSONAS[petId]
    : theme && PET_PERSONAS[theme]
    ? PET_PERSONAS[theme]
    : activePersona
  const isFeiyu = resolvedPersona.id === 'feiyu'

  const [particles, setParticles] = useState<Particle[]>([])
  const [internalEyeOffset, setInternalEyeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const petRef = useRef<HTMLDivElement>(null)

  const isMini = size === 'xs'

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
    const symbols = isFeiyu ? FEIYU_SPARKLES : NAILONG_SPARKLES
    const count = 5
    const next: Particle[] = Array.from({ length: count }).map((_, idx) => ({
      id: Date.now() + idx + Math.random(),
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
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
      : mood === 'dizzy'
      ? '💫'
      : mood === 'busy'
      ? '⏳'
      : mood === 'begging'
      ? '🥺'
      : mood === 'dancing'
      ? '🎶'
      : mood === 'walking'
      ? '🐾'
      : isSpeaking
      ? '🎵'
      : mood === 'thinking'
      ? '💭'
      : mood === 'happy'
      ? isFeiyu
        ? '🫧'
        : '💖'
      : mood === 'sleepy'
      ? '💤'
      : mood === 'focus'
      ? isFeiyu
        ? '💡'
        : '🔥'
      : mood === 'eating'
      ? resolvedPersona.foodEmoji
      : mood === 'derp'
      ? isFeiyu
        ? '😤'
        : '🤪'
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

      {/* 底部柔和角色专属光环 */}
      {!isMini && (isSpeaking || mood === 'focus' || mood === 'happy' || mood === 'eating' || mood === 'dancing') && (
        <div
          className="absolute inset-0.5 rounded-full blur-md pointer-events-none transition-opacity duration-300"
          style={{
            background:
              mood === 'focus'
                ? 'radial-gradient(circle, rgba(56,189,248,0.45) 0%, transparent 72%)'
                : resolvedPersona.glowColor,
          }}
        />
      )}

      {/* 双核角色分发引擎：3D 奶龙 vs 二次元鲸鱼娘大肥鱼 */}
      <div className="w-full h-full flex items-center justify-center pointer-events-auto">
        {isFeiyu ? (
          <FeiyuRigAvatar
            mood={mood}
            isSpeaking={isSpeaking}
            isDragging={isDragging}
            dragTilt={dragTilt}
            wearingHeadphones={wearingHeadphones || mood === 'focus'}
            holdingRiceBowl={holdingDrumstick || mood === 'eating'}
            eyeOffset={effectiveEyeOffset}
            bellyJiggle={bellyJiggle || isSquishing}
            headPatting={headPatting}
            landingBounce={landingBounce}
            walkDirection={walkDirection}
            size={sizePixelMap[size]}
            onZoneTrigger={onZoneTrigger}
          />
        ) : (
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
            walkDirection={walkDirection}
            size={sizePixelMap[size]}
            onZoneTrigger={onZoneTrigger}
          />
        )}
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
