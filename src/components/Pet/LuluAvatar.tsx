import { useState } from 'react'
import type { PetMood } from './DesktopPet'

export type LuluTheme = 'yellow' | 'pink' | 'purple'

interface LuluAvatarProps {
  mood?: PetMood
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  theme?: LuluTheme
  isSquishing?: boolean
  onClick?: () => void
  showAccessories?: boolean
}

export default function LuluAvatar({
  mood = 'idle',
  size = 'md',
  theme = 'yellow',
  isSquishing = false,
  onClick,
  showAccessories = true,
}: LuluAvatarProps) {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number }>>([])

  const handleClick = () => {
    if (onClick) onClick()
    const newHeart = { id: Date.now(), x: Math.random() * 20 - 10 }
    setHearts(prev => [...prev.slice(-3), newHeart])
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id))
    }, 1500)
  }

  // Dimension mapping
  const sizeClass = {
    xs: 'w-8 h-8',
    sm: 'w-11 h-11',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size]

  // Color theme definitions
  const themeColors = {
    yellow: {
      bodyGrad1: '#fffbeb',
      bodyGrad2: '#fef08a',
      bodyGrad3: '#facc15',
      outline: '#ca8a04',
      earInner: '#fda4af',
      belly: '#ffffff',
      aura: 'rgba(250, 204, 21, 0.35)',
    },
    pink: {
      bodyGrad1: '#fff1f2',
      bodyGrad2: '#fce7f3',
      bodyGrad3: '#f472b6',
      outline: '#db2777',
      earInner: '#f43f5e',
      belly: '#ffffff',
      aura: 'rgba(244, 114, 182, 0.35)',
    },
    purple: {
      bodyGrad1: '#faf5ff',
      bodyGrad2: '#ede9fe',
      bodyGrad3: '#c084fc',
      outline: '#9333ea',
      earInner: '#f472b6',
      belly: '#ffffff',
      aura: 'rgba(192, 132, 252, 0.35)',
    },
  }[theme]

  return (
    <div
      onClick={handleClick}
      className={`relative select-none flex items-center justify-center cursor-pointer transition-transform duration-200 ${sizeClass} ${
        isSquishing ? 'animate-lulu-jelly' : 'animate-lulu-float'
      }`}
      style={{ filter: `drop-shadow(0 6px 12px ${themeColors.aura})` }}
    >
      {/* Floating hearts when petted */}
      {hearts.map(h => (
        <span
          key={h.id}
          className="absolute -top-3 text-sm animate-lulu-heart pointer-events-none z-30"
          style={{ left: `calc(50% + ${h.x}px)` }}
        >
          💖
        </span>
      ))}

      {/* Sleep Zzz indicator */}
      {mood === 'sleepy' && (
        <span className="absolute -top-2 -right-1 text-xs font-bold text-indigo-400 animate-lulu-zzz pointer-events-none z-30">
          Zzz
        </span>
      )}

      {/* SVG Anime Lulu Mascot Character */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Body linear gradient */}
          <linearGradient id={`lulu-body-${theme}`} x1="50" y1="18" x2="50" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={themeColors.bodyGrad1} />
            <stop offset="45%" stopColor={themeColors.bodyGrad2} />
            <stop offset="100%" stopColor={themeColors.bodyGrad3} />
          </linearGradient>

          {/* Eye iris gradient */}
          <linearGradient id="lulu-eye-iris" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="65%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          {/* Blush radial gradient */}
          <radialGradient id="lulu-blush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- Ears --- */}
        {/* Left Ear */}
        <g className="animate-lulu-ear-l" style={{ transformOrigin: '32px 30px' }}>
          <ellipse cx="28" cy="24" rx="9" ry="13" fill={`url(#lulu-body-${theme})`} stroke={themeColors.outline} strokeWidth="1.8" />
          <ellipse cx="28" cy="25" rx="5.5" ry="8" fill={themeColors.earInner} opacity="0.65" />
        </g>
        {/* Right Ear */}
        <g className="animate-lulu-ear-r" style={{ transformOrigin: '68px 30px' }}>
          <ellipse cx="72" cy="24" rx="9" ry="13" fill={`url(#lulu-body-${theme})`} stroke={themeColors.outline} strokeWidth="1.8" />
          <ellipse cx="72" cy="25" rx="5.5" ry="8" fill={themeColors.earInner} opacity="0.65" />
        </g>

        {/* --- Head Sprout / Accessory (考研幸运小嫩芽) --- */}
        {showAccessories && (
          <g className="animate-lulu-sprout" style={{ transformOrigin: '50px 22px' }}>
            {mood === 'focus' ? (
              // Scholar mortarboard / graduation cap in focus mode
              <g transform="translate(32, 4) scale(0.7)">
                <polygon points="25,5 50,15 25,25 0,15" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="1.5" />
                <rect x="18" y="20" width="14" height="8" rx="2" fill="#312e81" />
                <path d="M 45,16 Q 48,22 47,28" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                <circle cx="47" cy="28" r="2" fill="#f59e0b" />
              </g>
            ) : mood === 'thinking' ? (
              // Lightbulb spark in thinking mode
              <g transform="translate(42, 6) scale(0.8)">
                <circle cx="10" cy="10" r="7" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
                <line x1="10" y1="0" x2="10" y2="3" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="5" x2="5" y2="7" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                <line x1="17" y1="5" x2="15" y2="7" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
              </g>
            ) : (
              // Cute twin-leaf lucky sprout
              <g>
                <path d="M 50,22 Q 49,15 50,11" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 50,12 C 45,8 41,12 47,15 C 50,15 50,13 50,12 Z" fill="#4ade80" stroke="#16a34a" strokeWidth="1" />
                <path d="M 50,13 C 55,9 60,13 53,16 C 50,16 50,14 50,13 Z" fill="#86efac" stroke="#16a34a" strokeWidth="1" />
              </g>
            )}
          </g>
        )}

        {/* --- Main Chubby Mochi Body --- */}
        <path
          d="M 32,24 C 15,26 8,44 10,64 C 12,83 24,93 50,93 C 76,93 88,83 90,64 C 92,44 85,26 68,24 C 57,22 43,22 32,24 Z"
          fill={`url(#lulu-body-${theme})`}
          stroke={themeColors.outline}
          strokeWidth="2.2"
        />

        {/* Soft Creamy Belly Patch */}
        <ellipse cx="50" cy="67" rx="26" ry="19" fill={themeColors.belly} opacity="0.65" />

        {/* --- Cheeks / Blush (粉嫩腮红) --- */}
        <ellipse cx="26" cy="56" rx="6" ry="3.5" fill="url(#lulu-blush)" />
        <ellipse cx="74" cy="56" rx="6" ry="3.5" fill="url(#lulu-blush)" />

        {/* --- Eyes (水汪汪大眼睛) --- */}
        {mood === 'happy' ? (
          // Happy crescent curved eyes ( ^ ω ^ )
          <g stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 30,51 Q 36,44 42,51" />
            <path d="M 58,51 Q 64,44 70,51" />
          </g>
        ) : mood === 'sleepy' ? (
          // Sleepy closed lines (_ ω _)
          <g stroke="#334155" strokeWidth="2.8" strokeLinecap="round" fill="none">
            <path d="M 30,53 Q 36,56 42,53" />
            <path d="M 58,53 Q 64,56 70,53" />
          </g>
        ) : mood === 'focus' ? (
          // Focus mode: Cute round intellectual glasses + shiny eyes
          <g>
            {/* Focused shiny eyes */}
            <ellipse cx="36" cy="49" rx="4.5" ry="5.5" fill="#1e1b4b" />
            <circle cx="38" cy="47" r="2" fill="#ffffff" />
            <ellipse cx="64" cy="49" rx="4.5" ry="5.5" fill="#1e1b4b" />
            <circle cx="66" cy="47" r="2" fill="#ffffff" />
            {/* Cute round glasses */}
            <circle cx="36" cy="49" r="8.5" stroke="#f59e0b" strokeWidth="1.8" fill="rgba(254, 240, 138, 0.15)" />
            <circle cx="64" cy="49" r="8.5" stroke="#f59e0b" strokeWidth="1.8" fill="rgba(254, 240, 138, 0.15)" />
            <line x1="44.5" y1="49" x2="55.5" y2="49" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : (
          // Normal / Thinking: Big Sparkly Anime Eyes with blinking animation
          <g className="animate-lulu-blink" style={{ transformOrigin: '50px 48px' }}>
            {/* Left Eye */}
            <ellipse cx="36" cy="48" rx="5.5" ry="7.5" fill="url(#lulu-eye-iris)" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx="38.5" cy="45" r="2.6" fill="#ffffff" />
            <circle cx="34" cy="51.5" r="1.3" fill="#ffffff" />

            {/* Right Eye */}
            <ellipse cx="64" cy="48" rx="5.5" ry="7.5" fill="url(#lulu-eye-iris)" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx="66.5" cy="45" r="2.6" fill="#ffffff" />
            <circle cx="62" cy="51.5" r="1.3" fill="#ffffff" />
          </g>
        )}

        {/* --- Cute Cute "ω" / Open Mouth (萌系三瓣嘴) --- */}
        {mood === 'happy' ? (
          // Open cheerful smile with tongue
          <g transform="translate(50, 56)">
            <path d="M -5,-1 Q 0,7 5,-1 Z" fill="#e11d48" stroke="#881337" strokeWidth="1.2" />
            <path d="M -3,2 Q 0,6 3,2" fill="#fda4af" />
          </g>
        ) : (
          // Classic anime "ω" cat/mochi mouth
          <path
            d="M 45,55 Q 47.5,58 50,56 Q 52.5,58 55,55"
            stroke="#475569"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* --- Little Paws (小短手) --- */}
        {mood === 'focus' ? (
          // Holding a tiny book
          <g transform="translate(36, 64)">
            {/* Mini Study Textbook */}
            <rect x="4" y="2" width="20" height="15" rx="2" fill="#4f46e5" stroke="#312e81" strokeWidth="1" />
            <rect x="7" y="4" width="14" height="11" fill="#ffffff" />
            <text x="8.5" y="12" fontSize="5.5" fontWeight="bold" fill="#4f46e5" fontFamily="sans-serif">
              408
            </text>
            {/* Left paw */}
            <ellipse cx="4" cy="10" rx="3.5" ry="3.5" fill={themeColors.bodyGrad2} stroke={themeColors.outline} strokeWidth="1" />
            {/* Right paw */}
            <ellipse cx="24" cy="10" rx="3.5" ry="3.5" fill={themeColors.bodyGrad2} stroke={themeColors.outline} strokeWidth="1" />
          </g>
        ) : mood === 'happy' ? (
          // Paws raised up in celebration
          <g>
            <ellipse cx="23" cy="48" rx="4" ry="4" fill={themeColors.bodyGrad2} stroke={themeColors.outline} strokeWidth="1.2" />
            <ellipse cx="77" cy="48" rx="4" ry="4" fill={themeColors.bodyGrad2} stroke={themeColors.outline} strokeWidth="1.2" />
          </g>
        ) : (
          // Normal relaxed paws on belly
          <g>
            <ellipse cx="38" cy="69" rx="4.2" ry="3.8" fill={themeColors.bodyGrad2} stroke={themeColors.outline} strokeWidth="1.2" />
            <ellipse cx="62" cy="69" rx="4.2" ry="3.8" fill={themeColors.bodyGrad2} stroke={themeColors.outline} strokeWidth="1.2" />
          </g>
        )}

        {/* Tiny feet at bottom */}
        <ellipse cx="36" cy="91" rx="6" ry="3.5" fill={themeColors.bodyGrad3} stroke={themeColors.outline} strokeWidth="1.2" />
        <ellipse cx="64" cy="91" rx="6" ry="3.5" fill={themeColors.bodyGrad3} stroke={themeColors.outline} strokeWidth="1.2" />
      </svg>
    </div>
  )
}
