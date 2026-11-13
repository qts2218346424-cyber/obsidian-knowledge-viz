import React, { useId } from 'react'

/**
 * Q 版奶龙小头像 SVG 组件（圆润明黄麻薯头 + 招牌抹茶绿大眼眶 + 呆萌憨笑）
 * 适用于边缘隐藏胶囊、气泡标题、AI 对话头像等小尺寸精致展示场景
 */
export function NailongChibiHead({
  className = 'w-5 h-5',
  withWhiteRim = false,
  title = '奶龙',
}: {
  className?: string
  withWhiteRim?: boolean
  title?: string
}) {
  const uid = useId().replace(/:/g, '')
  const bodyGradId = `nl-head-body-${uid}`
  const eyeGradId = `nl-head-eye-${uid}`
  const headPath =
    'M 32 8.5 C 44.5 8.5, 51.5 17.5, 54 28.5 C 56.8 40.5, 52.5 53.5, 32 54.5 C 11.5 53.5, 7.2 40.5, 10 28.5 C 12.5 17.5, 19.5 8.5, 32 8.5 Z'

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <radialGradient id={bodyGradId} cx="42%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="52%" stopColor="#FFD82B" />
          <stop offset="100%" stopColor="#F5AF00" />
        </radialGradient>
        <radialGradient id={eyeGradId} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#B8F095" />
          <stop offset="65%" stopColor="#8AD66A" />
          <stop offset="100%" stopColor="#65B849" />
        </radialGradient>
      </defs>

      {/* 贴纸感奶油白外圈描边，防止在黄色按钮底色中边缘融合 */}
      {withWhiteRim && (
        <path
          d={headPath}
          stroke="#FFFDF7"
          strokeWidth="7.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {/* 奶龙圆润亮黄色 Q 版头部轮廓 */}
      <path
        d={headPath}
        fill={`url(#${bodyGradId})`}
        stroke="#854D0E"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* 头顶 Q 弹柔和反光 */}
      <ellipse
        cx="25"
        cy="16.5"
        rx="7.5"
        ry="3"
        transform="rotate(-18 25 16.5)"
        fill="#FFFDE7"
        fillOpacity="0.65"
      />

      {/* 左眼：奶龙标志性抹茶绿眼眶 + 乌黑圆瞳 + 双高光 */}
      <circle
        cx="21.5"
        cy="28"
        r="7"
        fill={`url(#${eyeGradId})`}
        stroke="#4D8F36"
        strokeWidth="1.1"
      />
      <circle cx="21.8" cy="28.2" r="4.3" fill="#18181B" />
      <circle cx="23.4" cy="26.3" r="1.7" fill="#FFFFFF" />
      <circle cx="20.2" cy="29.9" r="0.8" fill="#FFFFFF" fillOpacity="0.75" />

      {/* 右眼：奶龙标志性抹茶绿眼眶 + 乌黑圆瞳 + 双高光 */}
      <circle
        cx="42.5"
        cy="28"
        r="7"
        fill={`url(#${eyeGradId})`}
        stroke="#4D8F36"
        strokeWidth="1.1"
      />
      <circle cx="42.2" cy="28.2" r="4.3" fill="#18181B" />
      <circle cx="43.8" cy="26.3" r="1.7" fill="#FFFFFF" />
      <circle cx="40.6" cy="29.9" r="0.8" fill="#FFFFFF" fillOpacity="0.75" />

      {/* 脸颊软萌粉橘腮红 */}
      <ellipse cx="14.8" cy="38.5" rx="4.2" ry="2.4" fill="#FB7185" fillOpacity="0.42" />
      <ellipse cx="49.2" cy="38.5" rx="4.2" ry="2.4" fill="#FB7185" fillOpacity="0.42" />

      {/* 憨萌微微弧形微笑小嘴 */}
      <path
        d="M 26 35.8 Q 32 39.2 38 35.8"
        stroke="#78350F"
        strokeWidth="2.3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 29.5 39.8 Q 32 41.2 34.5 39.8"
        stroke="#B45309"
        strokeOpacity="0.45"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

// ============================================================================
// 1. 类型与常量定义
// ============================================================================

export type PetMood = 'idle' | 'happy' | 'derp' | 'eating' | 'focus' | 'sleepy' | 'thinking'
export type HitZone = 'head' | 'belly' | 'leftArm' | 'rightArm' | null

export interface FloatingParticle {
  id: number
  text: string
  x: number
  y: number
  tx: number
  ty: number
  scale: number
}

export interface DialogueLine {
  mood: PetMood
  text: string
  subtext?: string
}

export const NAILONG_DIALOGUES: Record<string, DialogueLine[]> = {
  headPat: [
    { mood: 'happy', text: '嘿嘿~ 摸头长不高啦，但能帮你把 408 大题全蒙对！', subtext: '呼噜呼噜~ 考神附体 ✨' },
    { mood: 'happy', text: '好舒服呀~ 俺的脑瓜里现在装满了泰勒展开式！', subtext: '亲密度 +10 · 心态稳如老狗' },
    { mood: 'happy', text: '再摸摸！奶龙今天把中值定理给你嚼碎了喂嘴里~', subtext: '小短手开心拍肚皮中' },
  ],
  bellyPoke: [
    { mood: 'derp', text: '噗——！别戳俺的软乎乎大肚皮，刚炫完两碗红烧肉！', subtext: 'Duang~ 肚皮弹力值 MAX' },
    { mood: 'happy', text: '哈哈哈好痒呀！再戳肚皮俺就要变成小黄球滚走咯~', subtext: '果冻物理震颤触发！' },
    { mood: 'derp', text: '嗝~ 俺这肚子里装的可不是肥肉，全是数据结构和操作系统！', subtext: '大肚皮 Q 弹回弹中' },
  ],
  feedChicken: [
    { mood: 'eating', text: '啊呜——！香迷糊了！大鸡腿配高数题，越啃越有劲！🍗', subtext: '饱食度 +25 · 腮帮子鼓鼓囊囊' },
    { mood: 'eating', text: '吧唧吧唧…太香啦！吃完这口鸡腿，陪你再刷十道真题！', subtext: '小粉舌头舔嘴角~' },
  ],
  dragLift: [
    { mood: 'derp', text: '哇啊啊——！飞起来啦！快放俺下来，肚皮要坠地啦！', subtext: '小短腿空中慌张乱蹬中...' },
  ],
  landDrop: [
    { mood: 'happy', text: '咚！平安着陆~ 幸好俺肚皮肉厚不怕摔，嘿嘿！', subtext: '触发重力墩地回弹' },
  ],
  quizStreak: [
    { mood: 'happy', text: '小天才养成记！芜湖~ 连对三题，你脑子怎么长的呀，高数408稳稳拿下！🎉', subtext: '考神附体 · 奖励大鸡腿一根' },
    { mood: 'happy', text: '芜湖！连对三题！关键时刻还得看你呀，快让奶龙蹭蹭喜气，冲鸭！💪', subtext: '答题开挂 · 状态拉满 ✨' },
  ],
  eyeCare: [
    {
      mood: 'sleepy',
      text: '👀 学了这么久，眼睛酸酸了吧！快揉揉眼睛，跟奶龙一起闭眼 20 秒、看看窗外绿植放松一下~',
      subtext: '长时间用眼警报 · 闭目远眺 20 秒 🌿',
    },
    {
      mood: 'sleepy',
      text: '呼噜噜……看屏幕太久啦，奶龙的大眼睛都快眯成一条缝啦！快眨眨眼转一转，休息两分钟再战！',
      subtext: '科学护眼 20-20-20 · 缓解视疲劳 🫧',
    },
    {
      mood: 'happy',
      text: '停一停看远方！视线移开屏幕 20 秒，保你考研眼神清澈、考场不眼花，嘿嘿~',
      subtext: '极目远眺 · 视疲劳消除中 ✨',
    },
  ],
  eyeCareDone: [
    {
      mood: 'happy',
      text: '芜湖！20 秒眼部放松完成！眼睛亮晶晶，奶龙元气满满陪你继续冲刺高分！💪',
      subtext: '视力充能完毕 · 状态拉满 ✨',
    },
  ],
}

// ============================================================================
// 2. Web Audio 零依赖软萌合成音效引擎 (与真实原声音频双轨并发)
// ============================================================================

export function playPetSynthSound(type: 'boing' | 'pat' | 'nom' | 'lift' | 'land' | 'cheer', muted: boolean) {
  if (muted || typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    if (type === 'boing') {
      // 戳大肚皮果冻 Q 弹音
      osc.type = 'sine'
      osc.frequency.setValueAtTime(190, now)
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.09)
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.22)
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.32)
      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35)
      osc.start(now)
      osc.stop(now + 0.35)
    } else if (type === 'pat') {
      // 摸头治愈软萌音
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(380, now)
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.16)
      gain.gain.setValueAtTime(0.14, now)
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.2)
      osc.start(now)
      osc.stop(now + 0.2)
    } else if (type === 'nom') {
      // 啃鸡腿吧唧音
      osc.type = 'sine'
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.07)
      osc.frequency.setValueAtTime(280, now + 0.1)
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.18)
      gain.gain.setValueAtTime(0.16, now)
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.22)
      osc.start(now)
      osc.stop(now + 0.22)
    } else if (type === 'lift') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.18)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.2)
      osc.start(now)
      osc.stop(now + 0.2)
    } else if (type === 'land') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(240, now)
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.15)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18)
      osc.start(now)
      osc.stop(now + 0.18)
    } else if (type === 'cheer') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.setValueAtTime(554.37, now + 0.08)
      osc.frequency.setValueAtTime(659.25, now + 0.16)
      osc.frequency.setValueAtTime(880, now + 0.24)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.42)
      osc.start(now)
      osc.stop(now + 0.42)
    }
    setTimeout(() => {
      ctx.close().catch(() => {})
    }, 500)
  } catch {
    // 忽略音频上下文限制
  }
}

// ============================================================================
// 3. 真·正版高精 3D 奶龙物理骨骼组件 (NailongRigAvatar)
//    - 采用互联网精选正版 3D 奶龙透明免抠原画素材（高饱和度、圆润3D软萌下颌、治愈憨笑）
//    - 搭载 360° 视差微倾斜、部位级触碰反馈（摸头眯眼享受 vs 戳肚皮果冻回弹）、
//      拖拽惯性摆角、落地墩地弹簧、头戴降噪律动耳机与大烤鸡腿道具
// ============================================================================

export interface NailongRigProps {
  mood: PetMood
  isSpeaking?: boolean
  isDragging?: boolean
  dragTilt?: number
  wearingHeadphones?: boolean
  holdingDrumstick?: boolean
  eyeOffset?: { x: number; y: number }
  bellyJiggle?: boolean
  headPatting?: boolean
  landingBounce?: boolean
  size?: number | string
  className?: string
  onZoneTrigger?: (zone: HitZone, e: React.MouseEvent) => void
}

export function NailongRigAvatar({
  mood,
  isSpeaking = false,
  isDragging = false,
  dragTilt = 0,
  wearingHeadphones = false,
  holdingDrumstick = false,
  eyeOffset = { x: 0, y: 0 },
  bellyJiggle = false,
  headPatting = false,
  landingBounce = false,
  size = '100%',
  className = '',
  onZoneTrigger,
}: NailongRigProps) {
  // 根据情绪状态选择对应的正版 3D 高清免抠贴图
  const imageSrc = isDragging
    ? '/pets/nailong_drag.png'
    : headPatting || mood === 'happy'
    ? '/pets/nailong_happy.png'
    : bellyJiggle || mood === 'derp'
    ? '/pets/nailong_derp.png'
    : mood === 'focus'
    ? '/pets/nailong_focus.png'
    : mood === 'sleepy'
    ? '/pets/nailong_sleepy.png'
    : mood === 'eating' || holdingDrumstick
    ? '/pets/nailong_happy.png'
    : '/pets/nailong.png'

  // 视差微倾斜与旋转
  const headShiftX = (eyeOffset?.x ?? 0) * 4
  const headShiftY = (eyeOffset?.y ?? 0) * 2.5
  const headRotate = headPatting ? -4 : (eyeOffset?.x ?? 0) * 5

  // 物理动画类名
  const bodyAnimClass = isDragging
    ? 'nl-anim-dragging'
    : landingBounce
    ? 'nl-anim-land'
    : bellyJiggle
    ? 'nl-anim-belly-boing'
    : headPatting
    ? 'nl-anim-head-pat'
    : mood === 'happy' || mood === 'eating'
    ? 'nl-anim-happy-bounce'
    : mood === 'sleepy'
    ? 'nl-anim-sleep-breathe'
    : isSpeaking
    ? 'nl-anim-speaking-bop'
    : 'nl-anim-idle-breathe'

  const containerStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    transform: isDragging ? `rotate(${dragTilt}deg) scale(1.05)` : undefined,
    transition: isDragging ? 'transform 0.08s linear' : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
  }

  return (
    <div
      style={containerStyle}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      <style>{`
        @keyframes nl-breathe {
          0%, 100% { transform: translateY(0px) scale(1, 1); }
          50% { transform: translateY(-3.5px) scale(1.02, 0.98); }
        }
        @keyframes nl-sleep {
          0%, 100% { transform: translateY(2px) scale(1.02, 0.98); }
          50% { transform: translateY(-1px) scale(0.98, 1.02); }
        }
        @keyframes nl-happy {
          0%, 100% { transform: translateY(0px) rotate(-2deg) scale(1.03, 0.97); }
          25% { transform: translateY(-7px) rotate(0deg) scale(0.97, 1.04); }
          50% { transform: translateY(0px) rotate(2deg) scale(1.03, 0.97); }
          75% { transform: translateY(-7px) rotate(0deg) scale(0.97, 1.04); }
        }
        @keyframes nl-speak {
          0%, 100% { transform: translateY(0px) scale(1, 1); }
          50% { transform: translateY(-5px) scale(1.04, 0.96) rotate(-2deg); }
        }
        @keyframes nl-belly-jelly {
          0% { transform: scale(1, 1); }
          18% { transform: scale(1.24, 0.78) translateY(8px); }
          38% { transform: scale(0.86, 1.16) translateY(-9px); }
          58% { transform: scale(1.12, 0.90) translateY(4px); }
          78% { transform: scale(0.96, 1.04) translateY(-2px); }
          100% { transform: scale(1, 1) translateY(0); }
        }
        @keyframes nl-head-cozy {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          30% { transform: translateY(5px) rotate(-5deg) scale(1.04, 0.96); }
          65% { transform: translateY(2px) rotate(4deg) scale(1.02, 0.98); }
        }
        @keyframes nl-drag-kick {
          0%, 100% { transform: translateY(-5px) rotate(-3deg); }
          50% { transform: translateY(-9px) rotate(3deg); }
        }
        @keyframes nl-land-squish {
          0% { transform: translateY(-14px) scale(0.92, 1.1); }
          35% { transform: translateY(7px) scale(1.22, 0.78); }
          68% { transform: translateY(-4px) scale(0.96, 1.04); }
          100% { transform: translateY(0) scale(1, 1); }
        }
        @keyframes nl-snot-bubble {
          0%, 100% { transform: scale(0.55); opacity: 0.75; }
          50% { transform: scale(1.25); opacity: 0.95; }
        }

        .nl-anim-idle-breathe { animation: nl-breathe 2.5s ease-in-out infinite; transform-origin: 50% 90%; }
        .nl-anim-sleep-breathe { animation: nl-sleep 3.2s ease-in-out infinite; transform-origin: 50% 90%; }
        .nl-anim-happy-bounce { animation: nl-happy 0.76s ease-in-out infinite; transform-origin: 50% 90%; }
        .nl-anim-speaking-bop { animation: nl-speak 0.38s ease-in-out infinite; transform-origin: 50% 90%; }
        .nl-anim-belly-boing { animation: nl-belly-jelly 0.65s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 50% 88%; }
        .nl-anim-head-pat { animation: nl-head-cozy 0.6s ease-in-out; transform-origin: 50% 88%; }
        .nl-anim-dragging { animation: nl-drag-kick 0.32s ease-in-out infinite; transform-origin: 50% 30%; }
        .nl-anim-land { animation: nl-land-squish 0.52s cubic-bezier(0.22, 1, 0.36, 1); transform-origin: 50% 92%; }
      `}</style>

      {/* 1. 底部柔和立体呼吸投影 */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-amber-950/25 blur-[3px] pointer-events-none transition-all duration-300"
        style={{
          width: isDragging ? '45%' : bellyJiggle ? '75%' : '65%',
          height: isDragging ? '6px' : '9px',
        }}
      />

      {/* 2. 奶龙正版 3D 免抠主体容器 (结合视差微摆与物理动画) */}
      <div
        style={{
          transform: `translate(${headShiftX}px, ${headShiftY}px) rotate(${headRotate}deg)`,
          transformOrigin: '50% 85%',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        className={`relative w-full h-full flex items-center justify-center ${bodyAnimClass}`}
      >
        <img
          src={imageSrc}
          alt="奶龙"
          draggable={false}
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(245,158,11,0.28)]"
        />

        {/* 3. 伴学专注耳机图层 */}
        {(wearingHeadphones || mood === 'focus') && (
          <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[82%] pointer-events-none z-10 animate-in fade-in zoom-in-95">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              <path
                d="M 12 36 C 10 6, 90 6, 88 36"
                stroke="#1E293B"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* 左耳罩 */}
              <rect x="5" y="24" width="13" height="22" rx="6.5" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
              <circle cx="11.5" cy="35" r="3" fill="#38BDF8" />
              {/* 右耳罩 */}
              <rect x="82" y="24" width="13" height="22" rx="6.5" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
              <circle cx="88.5" cy="35" r="3" fill="#38BDF8" />
            </svg>
          </div>
        )}

        {/* 4. 黄金烤鸡腿道具图层 */}
        {(holdingDrumstick || mood === 'eating') && (
          <div className="absolute bottom-[22%] right-[-4%] w-[38%] pointer-events-none z-10 animate-bounce">
            <svg viewBox="0 0 50 40" className="w-full h-full drop-shadow-md">
              <g transform="rotate(-18 25 20)">
                <rect x="28" y="18" width="16" height="5.5" rx="2.5" fill="#FEF3C7" />
                <circle cx="44" cy="18" r="4.2" fill="#FEF3C7" />
                <circle cx="44" cy="24" r="4.2" fill="#FEF3C7" />
                <ellipse cx="18" cy="21" rx="16" ry="12" fill="#D97706" />
                <ellipse cx="16" cy="18" rx="10" ry="5.5" fill="#F59E0B" />
              </g>
            </svg>
          </div>
        )}

        {/* 5. 打瞌睡鼻涕泡图层 */}
        {mood === 'sleepy' && (
          <div
            className="absolute top-[32%] right-[22%] w-6 h-6 pointer-events-none z-10"
            style={{
              animation: 'nl-snot-bubble 2.2s ease-in-out infinite',
              transformOrigin: '20% 80%',
            }}
          >
            <div className="w-full h-full rounded-full bg-sky-200/80 border-2 border-sky-400 shadow-sm relative">
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/90" />
            </div>
          </div>
        )}

        {/* 6. 透明分区交互热区 (覆盖在大脑袋与大白肚皮上) */}
        {onZoneTrigger && (
          <div className="absolute inset-0 pointer-events-auto">
            {/* 上半部大脑袋热区 */}
            <div
              onClick={e => {
                e.stopPropagation()
                onZoneTrigger('head', e)
              }}
              className="absolute top-0 left-0 right-0 h-[48%] cursor-pointer"
              title="摸摸奶龙大脑袋 (触发眯眼享受)"
            />
            {/* 下半部大肚皮热区 */}
            <div
              onClick={e => {
                e.stopPropagation()
                onZoneTrigger('belly', e)
              }}
              className="absolute bottom-0 left-[8%] right-[8%] h-[52%] cursor-pointer"
              title="戳戳奶龙 Q 弹大肚皮 (触发果冻回弹与大笑)"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default NailongRigAvatar
