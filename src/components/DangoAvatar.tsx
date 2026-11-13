import { useEffect, useId, useState } from 'react'

export type DangoColorKey =
  | 'sakura'
  | 'sky'
  | 'cream'
  | 'matcha'
  | 'lavender'
  | 'peach'
  | 'mint'
  | 'berry'

export interface DangoPalette {
  key: DangoColorKey
  label: string
  swatch: string
  bg: string
  ring: string
  light: string
  mid: string
  dark: string
  eye: string
  blush: string
}

export const DANGO_PALETTES: DangoPalette[] = [
  {
    key: 'sakura',
    label: '樱花粉团子',
    swatch: '#F9A8D4',
    bg: '#FFF1F5',
    ring: '#FBCFE8',
    light: '#FFEBF1',
    mid: '#FFC0D3',
    dark: '#F094B1',
    eye: '#5A4A4F',
    blush: '#FF7597',
  },
  {
    key: 'sky',
    label: '晴空蓝团子',
    swatch: '#7DD3FC',
    bg: '#F0F9FF',
    ring: '#BAE6FD',
    light: '#E0F6FF',
    mid: '#9CDDF7',
    dark: '#67B8E3',
    eye: '#475569',
    blush: '#FB859E',
  },
  {
    key: 'cream',
    label: '奶油黄团子',
    swatch: '#FCD34D',
    bg: '#FEFCE8',
    ring: '#FDE68A',
    light: '#FFFBEB',
    mid: '#FFE380',
    dark: '#F2BC43',
    eye: '#644A32',
    blush: '#FB8078',
  },
  {
    key: 'matcha',
    label: '抹茶绿团子',
    swatch: '#86EFAC',
    bg: '#F0FDF4',
    ring: '#BBF7D0',
    light: '#E4FCEB',
    mid: '#A3E9B8',
    dark: '#6DC98A',
    eye: '#3F5246',
    blush: '#FA889E',
  },
  {
    key: 'lavender',
    label: '香芋紫团子',
    swatch: '#C4B5FD',
    bg: '#F5F3FF',
    ring: '#DDD6FE',
    light: '#F1ECFF',
    mid: '#D3C4FC',
    dark: '#AD97EE',
    eye: '#4D445E',
    blush: '#F47EA6',
  },
  {
    key: 'peach',
    label: '蜜桃橙团子',
    swatch: '#FDBA74',
    bg: '#FFF7ED',
    ring: '#FED7AA',
    light: '#FFF0DF',
    mid: '#FFD09E',
    dark: '#F3A45F',
    eye: '#5E4639',
    blush: '#FA7A7A',
  },
  {
    key: 'mint',
    label: '薄荷青团子',
    swatch: '#5EEAD4',
    bg: '#F0FDFA',
    ring: '#99F6E4',
    light: '#DFFCF7',
    mid: '#93EFE0',
    dark: '#54CEBC',
    eye: '#3B5451',
    blush: '#FA859A',
  },
  {
    key: 'berry',
    label: '草莓红团子',
    swatch: '#FDA4AF',
    bg: '#FFF1F2',
    ring: '#FECDD3',
    light: '#FFE5E8',
    mid: '#FFB4BE',
    dark: '#F08394',
    eye: '#5D4449',
    blush: '#F45E78',
  },
]

const STORAGE_KEY = 'coreforge_user_dango_color'
const CHANGE_EVENT = 'coreforge-dango-color-change'

export function getSavedUserDangoColor(): DangoColorKey | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && DANGO_PALETTES.some(p => p.key === raw)) {
      return raw as DangoColorKey
    }
  } catch {
    // 忽略本地存储读取异常
  }
  return null
}

export function setSavedUserDangoColor(color: DangoColorKey): void {
  try {
    localStorage.setItem(STORAGE_KEY, color)
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: color }))
  } catch {
    // 忽略本地存储写入异常
  }
}

export function hashDangoColor(seed?: string): DangoColorKey {
  if (!seed) return 'sakura'
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const idx = Math.abs(h) % DANGO_PALETTES.length
  return DANGO_PALETTES[idx].key
}

export function useUserDangoColor(seed?: string, followUserPreference = true): DangoColorKey {
  const [saved, setSaved] = useState<DangoColorKey | null>(() =>
    followUserPreference ? getSavedUserDangoColor() : null,
  )

  useEffect(() => {
    if (!followUserPreference) return
    const sync = () => setSaved(getSavedUserDangoColor())
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [followUserPreference])

  return (followUserPreference && saved) || hashDangoColor(seed)
}

interface DangoAvatarProps {
  seed?: string
  colorKey?: DangoColorKey
  followUserPreference?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  title?: string
}

const SIZE_MAP: Record<NonNullable<DangoAvatarProps['size']>, string> = {
  xs: 'w-5 h-5',
  sm: 'w-6 h-6',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
  xl: 'w-11 h-11',
}

/**
 * 团子大家族多彩用户头像组件
 * 支持按用户名自动分配不同团子色彩，或响应用户自选偏好实时换色
 */
export default function DangoAvatar({
  seed,
  colorKey,
  followUserPreference = true,
  size = 'md',
  className = '',
  title,
}: DangoAvatarProps) {
  const uid = useId().replace(/:/g, '')
  const resolvedKey = useUserDangoColor(seed, followUserPreference && !colorKey)
  const finalKey = colorKey || resolvedKey
  const palette = DANGO_PALETTES.find(p => p.key === finalKey) || DANGO_PALETTES[0]

  const bodyGradId = `dango-user-body-${uid}`
  const blushGradId = `dango-user-blush-${uid}`

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none ${SIZE_MAP[size]} ${className}`}
      style={{
        backgroundColor: palette.bg,
        boxShadow: `inset 0 0 0 1px ${palette.ring}`,
      }}
      title={title || palette.label}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label={title || palette.label}
      >
        <defs>
          <radialGradient id={bodyGradId} cx="42%" cy="30%" r="70%">
            <stop offset="0%" stopColor={palette.light} />
            <stop offset="56%" stopColor={palette.mid} />
            <stop offset="100%" stopColor={palette.dark} />
          </radialGradient>
          <radialGradient id={blushGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.blush} stopOpacity="0.65" />
            <stop offset="100%" stopColor={palette.blush} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 柔和底部投影 */}
        <ellipse cx="32" cy="52" rx="19" ry="4" fill={palette.dark} fillOpacity="0.24" />

        {/* 圆润软萌团子轮廓 */}
        <path
          d="M11 39 C11 22 20 13 32 13 C44 13 53 22 53 39 C53 48 47 52 32 52 C17 52 11 48 11 39 Z"
          fill={`url(#${bodyGradId})`}
        />

        {/* 顶部光泽 */}
        <ellipse
          cx="25.5"
          cy="21"
          rx="8"
          ry="3.6"
          transform="rotate(-15 25.5 21)"
          fill="#FFFFFF"
          fillOpacity="0.44"
        />

        {/* 招牌腮红 */}
        <ellipse cx="20.5" cy="36.5" rx="5.2" ry="3.2" fill={`url(#${blushGradId})`} />
        <ellipse cx="43.5" cy="36.5" rx="5.2" ry="3.2" fill={`url(#${blushGradId})`} />

        {/* 团子大家族标志性竖线小眼睛 */}
        <rect x="24.8" y="27.2" width="2.8" height="7.6" rx="1.4" fill={palette.eye} />
        <rect x="36.4" y="27.2" width="2.8" height="7.6" rx="1.4" fill={palette.eye} />
      </svg>
    </span>
  )
}

/**
 * 精巧一排 8 色团子小切换条，方便用户在个人菜单或设置里一键更换头像颜色
 */
export function DangoColorPicker({
  seed,
  compact = false,
}: {
  seed?: string
  compact?: boolean
}) {
  const activeKey = useUserDangoColor(seed, true)

  return (
    <div className="flex items-center flex-wrap gap-1.5" role="radiogroup" aria-label="选择团子头像颜色">
      {DANGO_PALETTES.map(p => {
        const selected = p.key === activeKey
        return (
          <button
            key={p.key}
            type="button"
            onClick={e => {
              e.stopPropagation()
              setSavedUserDangoColor(p.key)
            }}
            className={`relative rounded-full transition-all cursor-pointer flex items-center justify-center ${
              compact ? 'w-5 h-5' : 'w-6 h-6'
            } ${
              selected
                ? 'ring-2 ring-offset-1 ring-slate-800 scale-110 shadow-xs'
                : 'hover:scale-110 opacity-85 hover:opacity-100'
            }`}
            style={{ backgroundColor: p.mid, boxShadow: `inset 0 0 0 1px ${p.dark}` }}
            title={p.label}
            aria-label={p.label}
            aria-checked={selected}
            role="radio"
          >
            {/* 迷你团子双竖眼点缀 */}
            <span className="flex items-center gap-[2px] pointer-events-none">
              <span className="w-[1.5px] h-[3.5px] rounded-full" style={{ backgroundColor: p.eye }} />
              <span className="w-[1.5px] h-[3.5px] rounded-full" style={{ backgroundColor: p.eye }} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
