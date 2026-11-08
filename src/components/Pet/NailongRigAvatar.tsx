import React, { useState, useEffect } from 'react'

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
    { mood: 'happy', text: '嘿嘿~ 摸头长不高啦，但能帮你把 408 大题全蒙对！', subtext: '呼噜呼噜~ 头顶小呆角都在发光✨' },
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
    { mood: 'happy', text: '芜湖！连对三题！你脑子怎么长的呀，分奶龙一点呗！🎉', subtext: '考神附体 · 奖励大鸡腿一根' },
  ],
}

// ============================================================================
// 2. Web Audio 零依赖软萌合成音效引擎 (无需外部 mp3 也能发出 Q 弹音效)
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
// 3. 真·骨骼分层矢量奶龙核心组件 (NailongRigAvatar)
//    - 彻底告别长狗鼻子的 AI 贴图，还原正版圆润宽吻部、小鼻孔、头顶软角、
//      3:7 梨形超大奶黄肚皮、背鳍与无骨Q弹小短手
//    - 支持 360° 鼠标瞳孔视差追踪、分区点击（摸头 vs 戳肚皮）、吃鸡腿、耳机模式
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
  const [blinking, setBlinking] = useState(false)
  const [talkMouthFrame, setTalkMouthFrame] = useState(0)

  // 自然随机眨眼（每 2.6 ~ 4.8 秒眨一次，偶尔连眨两次）
  useEffect(() => {
    let timeoutId: number
    const scheduleBlink = () => {
      const delay = 2400 + Math.random() * 2400
      timeoutId = window.setTimeout(() => {
        setBlinking(true)
        setTimeout(() => {
          setBlinking(false)
          // 25% 概率触发呆萌双连眨
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setBlinking(true)
              setTimeout(() => setBlinking(false), 120)
            }, 140)
          }
          scheduleBlink()
        }, 140)
      }, delay)
    }
    scheduleBlink()
    return () => clearTimeout(timeoutId)
  }, [])

  // 说话或吃东西时的口型高频开合动画
  useEffect(() => {
    if (!isSpeaking && mood !== 'eating') {
      setTalkMouthFrame(0)
      return
    }
    const timer = window.setInterval(() => {
      setTalkMouthFrame(prev => (prev + 1) % 3)
    }, 130)
    return () => clearInterval(timer)
  }, [isSpeaking, mood])

  // 瞳孔跟随与斗鸡眼偏移计算
  const leftPupilX = mood === 'derp' ? 4.5 : (eyeOffset?.x ?? 0) * 5.5
  const leftPupilY = mood === 'derp' ? 1.5 : (eyeOffset?.y ?? 0) * 4.5
  const rightPupilX = mood === 'derp' ? -4.5 : (eyeOffset?.x ?? 0) * 5.5
  const rightPupilY = mood === 'derp' ? -1.5 : (eyeOffset?.y ?? 0) * 4.5

  // 头部随光标轻微视差摆动
  const headShiftX = (eyeOffset?.x ?? 0) * 3.2
  const headShiftY = (eyeOffset?.y ?? 0) * 2.2
  const headRotate = headPatting ? -5 : (eyeOffset?.x ?? 0) * 4.5

  // 整体动画类名
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
    : 'nl-anim-idle-breathe'

  const containerStyle: React.CSSProperties = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    transform: isDragging ? `rotate(${dragTilt}deg) scale(1.04)` : undefined,
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
          50% { transform: translateY(-4px) scale(1.025, 0.975); }
        }
        @keyframes nl-sleep {
          0%, 100% { transform: translateY(2px) scale(1.03, 0.97); }
          50% { transform: translateY(-1px) scale(0.98, 1.02); }
        }
        @keyframes nl-happy {
          0%, 100% { transform: translateY(0px) rotate(-2.5deg) scale(1.04, 0.96); }
          25% { transform: translateY(-9px) rotate(0deg) scale(0.96, 1.05); }
          50% { transform: translateY(0px) rotate(2.5deg) scale(1.04, 0.96); }
          75% { transform: translateY(-9px) rotate(0deg) scale(0.96, 1.05); }
        }
        @keyframes nl-belly-jelly {
          0% { transform: scale(1, 1); }
          18% { transform: scale(1.24, 0.78) translateY(8px); }
          38% { transform: scale(0.86, 1.16) translateY(-9px); }
          58% { transform: scale(1.12, 0.90) translateY(4px); }
          78% { transform: scale(0.96, 1.04) translateY(-2px); }
          100% { transform: scale(1, 1) translateY(0); }
        }
        @keyframes nl-belly-inner-jiggle {
          0% { transform: scale(1, 1) translateY(0); }
          22% { transform: scale(1.14, 0.88) translateY(5px); }
          48% { transform: scale(0.92, 1.10) translateY(-5px); }
          72% { transform: scale(1.06, 0.95) translateY(2px); }
          100% { transform: scale(1, 1) translateY(0); }
        }
        @keyframes nl-head-cozy {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          30% { transform: translateY(4px) rotate(-4deg) scale(1.05, 0.95); }
          65% { transform: translateY(2px) rotate(4deg) scale(1.03, 0.97); }
        }
        @keyframes nl-drag-kick {
          0%, 100% { transform: translateY(-6px) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes nl-land-squish {
          0% { transform: translateY(-14px) scale(0.92, 1.1); }
          35% { transform: translateY(7px) scale(1.22, 0.78); }
          68% { transform: translateY(-4px) scale(0.96, 1.04); }
          100% { transform: translateY(0) scale(1, 1); }
        }
        @keyframes nl-tail-wag {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(12deg); }
        }
        @keyframes nl-tail-fast-wag {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes nl-arm-wave-left {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(16deg); }
        }
        @keyframes nl-arm-wave-right {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-18deg); }
        }
        @keyframes nl-foot-kick {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-5px) rotate(14deg); }
        }
        @keyframes nl-snot-bubble {
          0%, 100% { transform: scale(0.55); opacity: 0.75; }
          50% { transform: scale(1.25); opacity: 0.95; }
        }

        .nl-anim-idle-breathe { animation: nl-breathe 2.6s ease-in-out infinite; transform-origin: 50% 90%; }
        .nl-anim-sleep-breathe { animation: nl-sleep 3.4s ease-in-out infinite; transform-origin: 50% 90%; }
        .nl-anim-happy-bounce { animation: nl-happy 0.76s ease-in-out infinite; transform-origin: 50% 90%; }
        .nl-anim-belly-boing { animation: nl-belly-jelly 0.65s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 50% 88%; }
        .nl-anim-head-pat { animation: nl-head-cozy 0.6s ease-in-out; transform-origin: 50% 88%; }
        .nl-anim-dragging { animation: nl-drag-kick 0.35s ease-in-out infinite; transform-origin: 50% 30%; }
        .nl-anim-land { animation: nl-land-squish 0.52s cubic-bezier(0.22, 1, 0.36, 1); transform-origin: 50% 92%; }

        .nl-tail { animation: nl-tail-wag 1.4s ease-in-out infinite; transform-origin: 65px 158px; }
        .nl-tail-fast { animation: nl-tail-fast-wag 0.45s ease-in-out infinite; transform-origin: 65px 158px; }
        .nl-arm-l { animation: nl-arm-wave-left 2.2s ease-in-out infinite; transform-origin: 52px 116px; }
        .nl-arm-l-active { animation: nl-arm-wave-left 0.4s ease-in-out infinite; transform-origin: 52px 116px; }
        .nl-arm-r { animation: nl-arm-wave-right 2.2s ease-in-out infinite; transform-origin: 148px 116px; }
        .nl-arm-r-active { animation: nl-arm-wave-right 0.4s ease-in-out infinite; transform-origin: 148px 116px; }
        .nl-belly-bounce { animation: nl-belly-inner-jiggle 0.62s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 100px 146px; }
      `}</style>

      <svg
        viewBox="0 0 200 210"
        className="w-full h-full overflow-visible drop-shadow-[0_10px_18px_rgba(245,158,11,0.22)]"
      >
        <defs>
          {/* 正版奶龙暖阳黄立体皮肤渐变 (顶部亮鹅黄 -> 中部暖奶黄 -> 底部橘黄微阴影) */}
          <radialGradient id="nlSkinGrad" cx="46%" cy="32%" r="62%" fx="38%" fy="24%">
            <stop offset="0%" stopColor="#FFF07C" />
            <stop offset="42%" stopColor="#FFD426" />
            <stop offset="82%" stopColor="#F5A60B" />
            <stop offset="100%" stopColor="#E08600" />
          </radialGradient>

          {/* 头部柔光立体渐变 */}
          <radialGradient id="nlHeadGrad" cx="45%" cy="30%" r="60%" fx="36%" fy="20%">
            <stop offset="0%" stopColor="#FFF494" />
            <stop offset="48%" stopColor="#FFDA33" />
            <stop offset="88%" stopColor="#F7AE11" />
            <stop offset="100%" stopColor="#E59004" />
          </radialGradient>

          {/* 标志性超大软糯奶白肚皮渐变 */}
          <radialGradient id="nlBellyGrad" cx="48%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="65%" stopColor="#FFF4CC" />
            <stop offset="100%" stopColor="#FCE192" />
          </radialGradient>

          {/* 森林翡翠绿亮晶晶虹膜渐变 */}
          <radialGradient id="nlIrisGrad" cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="55%" stopColor="#15803D" />
            <stop offset="100%" stopColor="#052E16" />
          </radialGradient>

          {/* 蜜桃腮红柔化滤镜 */}
          <radialGradient id="nlBlushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B8B" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#FF6B8B" stopOpacity="0" />
          </radialGradient>

          {/* 口腔深处与粉嫩舌头渐变 */}
          <linearGradient id="nlMouthIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7F1D1D" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="nlTongueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
        </defs>

        {/* 1. 底部动态呼吸投影 */}
        <ellipse
          cx="100"
          cy="196"
          rx={isDragging ? 34 : bellyJiggle ? 58 : 48}
          ry={isDragging ? 5 : 8}
          fill="rgba(120, 53, 15, 0.20)"
          className="transition-all duration-300"
        />

        {/* 2. 奶龙骨骼主容器 */}
        <g className={bodyAnimClass}>
          {/* ── 2.1 肥嘟嘟上翘小恐龙尾巴 + 软萌背鳍 ── */}
          <g className={mood === 'happy' || mood === 'eating' || isSpeaking ? 'nl-tail-fast' : 'nl-tail'}>
            {/* 背鳍小凸起 */}
            <circle cx="38" cy="140" r="5.5" fill="#F59E0B" />
            <circle cx="46" cy="150" r="6" fill="#F59E0B" />
            {/* 尾巴主体 */}
            <path
              d="M 68 152 C 42 150, 24 138, 22 124 C 20 116, 30 116, 38 124 C 48 134, 58 136, 72 138 Z"
              fill="url(#nlSkinGrad)"
            />
          </g>

          {/* ── 2.2 左右圆墩墩小短腿 (拖拽时慌张交替乱蹬) ── */}
          <g
            style={{
              animation: isDragging ? 'nl-foot-kick 0.22s ease-in-out infinite alternate' : undefined,
              transformOrigin: '74px 175px',
            }}
          >
            <ellipse cx="73" cy="182" rx="19" ry="13" fill="url(#nlSkinGrad)" />
            {/* 三个圆润小脚趾凸起 (绝不画尖锐猫狗爪) */}
            <circle cx="61" cy="186" r="5.5" fill="#FBBF24" />
            <circle cx="71" cy="188" r="6" fill="#FBBF24" />
            <circle cx="81" cy="187" r="5.5" fill="#FBBF24" />
          </g>

          <g
            style={{
              animation: isDragging ? 'nl-foot-kick 0.22s ease-in-out 0.11s infinite alternate' : undefined,
              transformOrigin: '127px 175px',
            }}
          >
            <ellipse cx="127" cy="182" rx="19" ry="13" fill="url(#nlSkinGrad)" />
            <circle cx="119" cy="187" r="5.5" fill="#FBBF24" />
            <circle cx="129" cy="188" r="6" fill="#FBBF24" />
            <circle cx="139" cy="186" r="5.5" fill="#FBBF24" />
          </g>

          {/* ── 2.3 标志性 3:7 梨形圆滚滚大身体与 Q 弹大肚皮 ── */}
          <g className={bellyJiggle ? 'nl-belly-bounce' : ''}>
            {/* 梨形敦实躯干 */}
            <path
              d="M 56 102 C 42 126, 40 166, 58 180 C 74 192, 126 192, 142 180 C 160 166, 158 126, 144 102 Z"
              fill="url(#nlSkinGrad)"
            />
            {/* 超大软糯奶白色圆肚皮 */}
            <ellipse
              cx="100"
              cy="145"
              rx="39"
              ry="35"
              fill="url(#nlBellyGrad)"
            />
            {/* 肚皮高光与软萌小肚脐弧线 */}
            <ellipse
              cx="88"
              cy="128"
              rx="14"
              ry="7"
              transform="rotate(-18 88 128)"
              fill="#FFFFFF"
              opacity="0.55"
            />
            <path
              d="M 96 163 Q 100 166 104 163"
              stroke="#EAB308"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
          </g>

          {/* ── 2.4 左小短手 (无猫狗肉垫、无尖指甲，圆润小馒头手) ── */}
          <g
            className={
              mood === 'happy' || isSpeaking || bellyJiggle ? 'nl-arm-l-active' : 'nl-arm-l'
            }
          >
            {mood === 'happy' || isSpeaking ? (
              // 开心/说话时高举挥动的小短手
              <path
                d="M 55 116 C 36 104, 26 84, 36 74 C 44 66, 56 80, 62 102 Z"
                fill="url(#nlSkinGrad)"
              />
            ) : (
              // 自然垂在圆肚皮旁的小短手
              <path
                d="M 54 112 C 36 120, 30 140, 41 146 C 50 151, 58 136, 61 122 Z"
                fill="url(#nlSkinGrad)"
              />
            )}
          </g>

          {/* ── 2.5 右小短手 (支持拿着香喷喷烤鸡腿 🍗) ── */}
          <g
            className={
              mood === 'happy' || mood === 'eating' || holdingDrumstick || isSpeaking
                ? 'nl-arm-r-active'
                : 'nl-arm-r'
            }
          >
            {mood === 'eating' || holdingDrumstick ? (
              <g>
                {/* 举到嘴边啃鸡腿的小手 */}
                <path
                  d="M 145 116 C 162 104, 164 86, 150 80 C 138 75, 132 94, 138 110 Z"
                  fill="url(#nlSkinGrad)"
                />
                {/* 黄金烤鸡腿矢量图 */}
                <g transform="translate(116, 68) rotate(-25)">
                  <rect x="24" y="10" width="14" height="5" rx="2.5" fill="#FEF3C7" />
                  <circle cx="38" cy="10" r="4" fill="#FEF3C7" />
                  <circle cx="38" cy="15" r="4" fill="#FEF3C7" />
                  <ellipse cx="15" cy="12.5" rx="14" ry="10" fill="#D97706" />
                  <ellipse cx="13" cy="10" rx="8" ry="4.5" fill="#F59E0B" />
                </g>
              </g>
            ) : (
              <path
                d="M 146 112 C 164 120, 170 140, 159 146 C 150 151, 142 136, 139 122 Z"
                fill="url(#nlSkinGrad)"
              />
            )}
          </g>

          {/* ── 2.6 奶龙灵魂大脑袋 (宽吻部圆润花生/馒头形，带头顶一对软萌小呆角) ── */}
          <g
            style={{
              transform: `translate(${headShiftX}px, ${headShiftY}px) rotate(${headRotate}deg)`,
              transformOrigin: '100px 95px',
              transition: 'transform 0.12s ease-out',
            }}
          >
            {/* 头顶两侧软糯小龙角 (奶龙正版标志特征：圆钝小凸起) */}
            <ellipse
              cx="73"
              cy="25"
              rx="9"
              ry="7.5"
              transform="rotate(-18 73 25)"
              fill="#FBBF24"
            />
            <ellipse
              cx="73"
              cy="24"
              rx="5"
              ry="4"
              transform="rotate(-18 73 24)"
              fill="#FDE047"
            />
            <ellipse
              cx="127"
              cy="25"
              rx="9"
              ry="7.5"
              transform="rotate(18 127 25)"
              fill="#FBBF24"
            />
            <ellipse
              cx="127"
              cy="24"
              rx="5"
              ry="4"
              transform="rotate(18 127 24)"
              fill="#FDE047"
            />

            {/* 奶龙标志性上窄下宽「软糯宽吻部下颌」轮廓 */}
            <path
              d="M 100 22
                 C 134 22, 150 42, 152 66
                 C 155 92, 146 114, 100 114
                 C 54 114, 45 92, 48 66
                 C 50 42, 66 22, 100 22 Z"
              fill="url(#nlHeadGrad)"
            />

            {/* 额头柔和高光 */}
            <ellipse
              cx="84"
              cy="36"
              rx="20"
              ry="8"
              transform="rotate(-12 84 36)"
              fill="#FFFFFF"
              opacity="0.45"
            />

            {/* 鼓鼓的蜜桃腮红 */}
            <ellipse
              cx="60"
              cy="82"
              rx="13"
              ry="8.5"
              fill="url(#nlBlushGrad)"
              opacity={headPatting || mood === 'happy' || mood === 'eating' ? 1 : 0.75}
            />
            <ellipse
              cx="140"
              cy="82"
              rx="13"
              ry="8.5"
              fill="url(#nlBlushGrad)"
              opacity={headPatting || mood === 'happy' || mood === 'eating' ? 1 : 0.75}
            />

            {/* ── 2.7 灵动大眼睛 (360° 鼠标追踪 + 双高光 + 眨眼/月牙笑眼) ── */}
            {blinking || mood === 'sleepy' || headPatting || mood === 'happy' ? (
              <g>
                {mood === 'sleepy' ? (
                  // 犯困打瞌睡闭眼
                  <>
                    <path
                      d="M 65 65 Q 76 72 87 65"
                      stroke="#451A03"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 113 65 Q 124 72 135 65"
                      stroke="#451A03"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* 呼呼大睡鼻涕泡 */}
                    <circle
                      cx="116"
                      cy="76"
                      r="9"
                      fill="rgba(186, 230, 253, 0.75)"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                      style={{ animation: 'nl-snot-bubble 2.2s ease-in-out infinite', transformOrigin: '108px 76px' }}
                    />
                    <circle cx="119" cy="73" r="2.5" fill="#FFFFFF" opacity="0.9" />
                  </>
                ) : (
                  // 开心/摸头弯弯月牙笑眼
                  <>
                    <path
                      d="M 65 66 Q 76 53 87 66"
                      stroke="#451A03"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 113 66 Q 124 53 135 66"
                      stroke="#451A03"
                      strokeWidth="3.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </>
                )}
              </g>
            ) : (
              <g>
                {/* 左眼眼白 */}
                <ellipse cx="76" cy="63" rx="13.5" ry="14.5" fill="#FFFFFF" stroke="#B45309" strokeWidth="1.2" />
                {/* 左眼翠绿虹膜 + 瞳孔 (实时跟随鼠标) */}
                <g transform={`translate(${leftPupilX}, ${leftPupilY})`}>
                  <circle cx="77" cy="63" r="9.2" fill="url(#nlIrisGrad)" />
                  <circle cx="77" cy="63" r="5.2" fill="#090D16" />
                  {/* 动漫感双高光点 */}
                  <circle cx="73.5" cy="59" r="3.2" fill="#FFFFFF" />
                  <circle cx="80.5" cy="66.5" r="1.6" fill="#FFFFFF" opacity="0.85" />
                </g>

                {/* 右眼眼白 */}
                <ellipse cx="124" cy="63" rx="13.5" ry="14.5" fill="#FFFFFF" stroke="#B45309" strokeWidth="1.2" />
                {/* 右眼翠绿虹膜 + 瞳孔 */}
                <g transform={`translate(${rightPupilX}, ${rightPupilY})`}>
                  <circle cx="123" cy="63" r="9.2" fill="url(#nlIrisGrad)" />
                  <circle cx="123" cy="63" r="5.2" fill="#090D16" />
                  <circle cx="119.5" cy="59" r="3.2" fill="#FFFFFF" />
                  <circle cx="126.5" cy="66.5" r="1.6" fill="#FFFFFF" opacity="0.85" />
                </g>
              </g>
            )}

            {/* 小眉毛 (赋予鲜明情绪) */}
            <path
              d={
                mood === 'derp'
                  ? 'M 66 45 Q 76 41 84 47'
                  : mood === 'focus'
                  ? 'M 66 47 L 85 50'
                  : 'M 66 46 Q 76 42 85 45'
              }
              stroke="#92400E"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={
                mood === 'derp'
                  ? 'M 116 47 Q 124 41 134 45'
                  : mood === 'focus'
                  ? 'M 134 47 L 115 50'
                  : 'M 115 45 Q 124 42 134 46'
              }
              stroke="#92400E"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />

            {/* ── 2.8 正版奶龙两个迷你小圆鼻孔 (彻底消灭丑陋的黑色倒三角狗鼻子和胡须点！) ── */}
            <ellipse cx="94.5" cy="73.5" rx="2.2" ry="1.6" transform="rotate(-12 94.5 73.5)" fill="#92400E" opacity="0.75" />
            <ellipse cx="105.5" cy="73.5" rx="2.2" ry="1.6" transform="rotate(12 105.5 73.5)" fill="#92400E" opacity="0.75" />

            {/* ── 2.9 丰富表情大嘴 + 软萌小粉舌 + 馋嘴口水滴 ── */}
            {isSpeaking || mood === 'eating' ? (
              // 哇啦哇啦说话/大口啃鸡腿动态口型
              talkMouthFrame === 0 ? (
                <g>
                  <path
                    d="M 80 84 Q 100 81 120 84 C 122 102, 78 102, 80 84 Z"
                    fill="url(#nlMouthIn)"
                    stroke="#78350F"
                    strokeWidth="2"
                  />
                  <path d="M 87 93 Q 100 87 113 93 C 110 100, 90 100, 87 93 Z" fill="url(#nlTongueGrad)" />
                </g>
              ) : talkMouthFrame === 1 ? (
                <g>
                  <ellipse cx="100" cy="89" rx="11" ry="8" fill="url(#nlMouthIn)" stroke="#78350F" strokeWidth="2" />
                  <ellipse cx="100" cy="92" rx="7" ry="4.5" fill="url(#nlTongueGrad)" />
                </g>
              ) : (
                <path
                  d="M 85 86 Q 100 95 115 86"
                  stroke="#78350F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              )
            ) : mood === 'happy' || headPatting ? (
              // 招牌憨憨露舌头大笑嘴 + 小白牙
              <g>
                <path
                  d="M 78 83 Q 100 80 122 83 C 124 104, 76 104, 78 83 Z"
                  fill="url(#nlMouthIn)"
                  stroke="#78350F"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                {/* 上排小萌牙 */}
                <path d="M 88 83 L 94 83 L 93 86.5 L 89 86.5 Z" fill="#FFFFFF" />
                {/* 粉嫩大舌头 */}
                <path d="M 85 92 Q 100 85 115 92 C 112 102, 88 102, 85 92 Z" fill="url(#nlTongueGrad)" />
              </g>
            ) : mood === 'derp' || isDragging ? (
              // 戳肚皮/拎起时的呆傻波浪 ω 嘴 + 晶莹口水滴
              <g>
                <path
                  d="M 86 86 Q 93 93 100 86 Q 107 93 114 86"
                  stroke="#78350F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* 伸出一点点小粉舌头 */}
                <path d="M 96 89 C 96 96, 104 96, 104 89 Z" fill="url(#nlTongueGrad)" />
                {/* 晶莹小口水滴 */}
                <path
                  d="M 111 89 C 111 89, 115 95, 112 98 C 109 98, 109 94, 111 89 Z"
                  fill="#38BDF8"
                />
              </g>
            ) : mood === 'sleepy' ? (
              // 睡觉微张小圆嘴
              <circle cx="100" cy="88" r="4.5" fill="#78350F" opacity="0.75" />
            ) : (
              // 日常待机：憨厚呆萌微笑 + 嘴角小酒窝
              <g>
                <path
                  d="M 85 85 Q 100 94 115 85"
                  stroke="#78350F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
                <path d="M 82 83 Q 84 86 82 88" stroke="#D97706" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M 118 83 Q 116 86 118 88" stroke="#D97706" strokeWidth="2" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* ── 2.10 专注模式/听歌模式：头戴式律动小耳机 ── */}
            {(wearingHeadphones || mood === 'focus') && (
              <g>
                <path
                  d="M 46 66 C 44 22, 156 22, 154 66"
                  stroke="#334155"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <rect x="38" y="54" width="13" height="26" rx="6.5" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
                <rect x="149" y="54" width="13" height="26" rx="6.5" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
                <circle cx="44.5" cy="67" r="3" fill="#38BDF8" />
                <circle cx="155.5" cy="67" r="3" fill="#38BDF8" />
              </g>
            )}
          </g>
        </g>

        {/* 3. 透明分区交互热区 (Hitbox Zones：区分「摸摸头」与「戳大肚皮」) */}
        {onZoneTrigger && (
          <g>
            {/* 头部热区 */}
            <ellipse
              cx="100"
              cy="66"
              rx="54"
              ry="46"
              fill="transparent"
              className="cursor-pointer"
              onClick={e => {
                e.stopPropagation()
                onZoneTrigger('head', e)
              }}
            >
              <title>摸摸奶龙大脑袋 (触发眯眼享受)</title>
            </ellipse>
            {/* 肚皮热区 */}
            <ellipse
              cx="100"
              cy="148"
              rx="48"
              ry="38"
              fill="transparent"
              className="cursor-pointer"
              onClick={e => {
                e.stopPropagation()
                onZoneTrigger('belly', e)
              }}
            >
              <title>戳戳奶龙 Q 弹大肚皮 (触发果冻回弹与傻笑)</title>
            </ellipse>
          </g>
        )}
      </svg>
    </div>
  )
}

export default NailongRigAvatar