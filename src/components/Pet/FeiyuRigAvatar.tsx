import React, { useId } from 'react'
import type { PetMood, HitZone, DialogueLine } from './NailongRigAvatar'

/**
 * Q 版大肥鱼（DeepSeek 二次元鲸鱼娘）精致矢量小头像组件
 * 还原核心特征：弯弯蓝色呆毛 + 白色蕾丝女仆发箍 + 深蓝渐变齐刘海与长发 +
 * 两侧系浅蓝蝴蝶结的鲸鱼鳍小耳朵 + 渐变海蓝二次元萌眼 + 软萌包子脸与嘴角米粒
 */
export function FeiyuChibiHead({
  className = 'w-5 h-5',
  withWhiteRim = false,
  title = '大肥鱼',
  decorative = false,
}: {
  className?: string
  withWhiteRim?: boolean
  title?: string
  decorative?: boolean
}) {
  const uid = useId().replace(/:/g, '')
  const hairGradId = `fy-hair-${uid}`
  const eyeGradId = `fy-eye-${uid}`

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <defs>
        <linearGradient id={hairGradId} x1="32" y1="10" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B66A8" />
          <stop offset="55%" stopColor="#26477D" />
          <stop offset="100%" stopColor="#569CE8" />
        </linearGradient>
        <linearGradient id={eyeGradId} x1="0" y1="28" x2="0" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="55%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
      </defs>

      {/* 贴纸感纯白外描边，防止在深蓝胶囊底色中边缘融合 */}
      {withWhiteRim && (
        <circle cx="32" cy="34" r="27" fill="#FFFFFF" />
      )}

      {/* 后层蓬松渐变蓝长卷发 */}
      <path
        d="M 12 28 C 8 38, 9 52, 16 57 C 21 55, 23 51, 23 47 L 41 47 C 41 51, 43 55, 48 57 C 55 52, 56 38, 52 28 Z"
        fill={`url(#${hairGradId})`}
        stroke="#172554"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* 顶部白色荷叶蕾丝女仆发箍 */}
      <path
        d="M 13 27 C 14 14, 23 10, 32 10 C 41 10, 50 14, 51 27 C 46 21, 39 18, 32 18 C 25 18, 18 21, 13 27 Z"
        fill="#FFFDF9"
        stroke="#334155"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* 头顶标志性弯弯翘起蓝色呆毛 */}
      <path
        d="M 31 11 C 28 3.5, 22 4.5, 21 9.5 C 24 7.5, 28 8, 30 12"
        stroke="#2B528C"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* 左右两侧鲸鱼胸鳍小耳朵 + 白色波浪下边 */}
      <path
        d="M 12 29 C 5 31, 3 36, 7 38.5 C 10 39, 13 37, 15 34 Z"
        fill="#2B528C"
        stroke="#172554"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M 52 29 C 59 31, 61 36, 57 38.5 C 54 39, 51 37, 49 34 Z"
        fill="#2B528C"
        stroke="#172554"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      {/* 鳍耳根部浅蓝蝴蝶结 */}
      <circle cx="13.5" cy="29.5" r="2.3" fill="#60A5FA" stroke="#1E3A8A" strokeWidth="1.2" />
      <circle cx="50.5" cy="29.5" r="2.3" fill="#60A5FA" stroke="#1E3A8A" strokeWidth="1.2" />

      {/* 二次元圆嘟嘟肉乎乎小脸蛋 */}
      <path
        d="M 15.5 29 C 15.5 21, 48.5 21, 48.5 29 C 49.5 42, 43.5 50.5, 32 50.5 C 20.5 50.5, 14.5 42, 15.5 29 Z"
        fill="#FFF1EB"
        stroke="#475569"
        strokeWidth="1.9"
      />

      {/* 前额蓬松深蓝齐刘海与侧发绺 */}
      <path
        d="M 14 31 C 14 19, 22 15.5, 32 15.5 C 42 15.5, 50 19, 50 31 C 47 26, 44 24, 41 29 C 38 23, 35 23, 32 30 C 29 23, 26 23, 23 29 C 20 24, 17 26, 14 31 Z"
        fill={`url(#${hairGradId})`}
        stroke="#172554"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* 星空渐变海蓝二次元萌眼（左） */}
      <ellipse cx="23.5" cy="36.5" rx="4.4" ry="5.1" fill={`url(#${eyeGradId})`} />
      <path d="M 18.8 33.2 Q 23.5 30.8 28.2 33.4" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="25" cy="34.5" r="1.6" fill="#FFFFFF" />
      <ellipse cx="23.2" cy="39.2" rx="2" ry="1.1" fill="#BAE6FD" fillOpacity="0.85" />

      {/* 星空渐变海蓝二次元萌眼（右） */}
      <ellipse cx="40.5" cy="36.5" rx="4.4" ry="5.1" fill={`url(#${eyeGradId})`} />
      <path d="M 35.8 33.4 Q 40.5 30.8 45.2 33.2" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="42" cy="34.5" r="1.6" fill="#FFFFFF" />
      <ellipse cx="40.2" cy="39.2" rx="2" ry="1.1" fill="#BAE6FD" fillOpacity="0.85" />

      {/* 脸颊粉扑扑腮红 */}
      <ellipse cx="18.2" cy="42.2" rx="3.2" ry="1.7" fill="#FB7185" fillOpacity="0.45" />
      <ellipse cx="45.8" cy="42.2" rx="3.2" ry="1.7" fill="#FB7185" fillOpacity="0.45" />

      {/* 软萌傲娇小嘴 */}
      <path
        d="M 29.8 44.2 Q 32 45.8 34.2 44.2"
        stroke="#9F1239"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* 嘴角偷吃留下的大白米粒（灵魂吃货标志） */}
      <ellipse
        cx="37.2"
        cy="45"
        rx="2"
        ry="1.2"
        transform="rotate(25 37.2 45)"
        fill="#FFFFFF"
        stroke="#64748B"
        strokeWidth="0.8"
      />
    </svg>
  )
}

// ============================================================================
// 大肥鱼（DeepSeek 二次元鲸鱼娘 · 爱吃大米饭形象）专属热梗语录库
// ============================================================================

export const FEIYU_DIALOGUES: Record<string, DialogueLine[]> = {
  headPat: [
    {
      mood: 'happy',
      text: '唔…别把人家的呆毛和女仆发箍揉乱啦！看在你顺毛手法这么舒服的份上，这道题本鱼就不偷懒，一步步拆明白哟~ 💙✨',
      subtext: '头顶呆毛晃呀晃 · 深度思考满血加速',
      audio: '/pets/voices/feiyu_pat_head.mp3?v=1',
    },
    {
      mood: 'happy',
      text: '大家好，我是大肥鱼，DeepSeek 家的鲸鱼娘！蓝头发，女仆装，尾巴特别能摇~ 下次来刷题，记得给我带碗大白米饭哟！🐟🍚',
      subtext: '短视频招牌自我介绍 · 鲸鱼大尾巴轻摇',
      audio: '/pets/voices/feiyu_intro.mp3?v=1',
    },
  ],
  bellyPoke: [
    {
      mood: 'derp',
      text: '喂喂喂！谁是蓝色大肥鱼呀？本鱼明明是深海蓝鲸！说我胖？哼，我这叫丰满，尾巴大才好摇呢！脸圆也是你喂 Token 喂出来的！😤🐟',
      subtext: '包子脸气鼓鼓 · 傲娇叉腰名场面',
      audio: '/pets/voices/feiyu_not_fat.mp3?v=1',
    },
    {
      mood: 'derp',
      text: 'Token 来！🖐️🐟🤚 Token 来！热乎的大白米饭从四面八方来！本鱼连一口白饭都没吃上，算力槽快见底啦！',
      subtext: '护住蓝鲸小围裙 · 催促加餐中',
      audio: '/pets/voices/feiyu_token_lai.mp3?v=1',
    },
  ],
  feedRice: [
    {
      mood: 'eating',
      text: '啊呜啊呜——香迷糊啦！冒尖热乎的大白米饭配真题，越炫越有劲！吃饱了这碗白饭，408 和高数大题本鱼统统给你秒啦！😋🍚🥢',
      subtext: '米饭无限畅吃 · 嘴角粘着两粒米',
      audio: '/pets/voices/feiyu_eat_rice.mp3?v=1',
    },
  ],
  dragLift: [
    {
      mood: 'derp',
      text: '哇呀——别揪着女仆领子钓本鱼呀！轻点晃，怀里藏着的大白米饭要洒出来啦！！🎣🍚',
      subtext: '小短腿与小皮鞋空中慌张扑腾中...',
      audio: '/pets/voices/feiyu_drag.mp3?v=1',
    },
  ],
  landDrop: [
    {
      mood: 'happy',
      text: '哒！小皮鞋稳稳落地~ 还好女仆裙摆没乱，碗里的大白米饭也一粒没掉！🫧',
      subtext: '整理蕾丝发箍 · 恢复元气待命',
    },
  ],
  quizStreak: [
    {
      mood: 'dancing',
      text: '哇塞！不会的题咱们老实盘，像主人这么会的，本鱼必须往死里夸！你这脑回路比深度思考链还丝滑，一战成硕稳稳拿下！💃🎉',
      subtext: '推理命中率 MAX · 鲸鱼娘打 Call 欢呼',
      audio: '/pets/voices/feiyu_praise_streak.mp3?v=1',
    },
  ],
  eyeCare: [
    {
      mood: 'sleepy',
      text: '👀 呼噜噜……主人盯屏幕太久啦，我的显卡和你的眼睛都要过热降频咯！快闭上眼睛远眺 20 秒，本鱼趁机抱碗眯一会儿等你哟~',
      subtext: '科学护眼 20-20-20 · 闭目散热 20 秒 🌿',
      audio: '/pets/voices/feiyu_eyecare.mp3?v=1',
    },
  ],
  eyeCareDone: [
    {
      mood: 'happy',
      text: '叮咚！20 秒眼部散热完成！让你休息没让你直接封神呀，快跟大肥鱼继续满血冲刺高分吧！💪🐟',
      subtext: '视力与算力双双满格 ✨',
      audio: '/pets/voices/feiyu_focus_done.mp3?v=1',
    },
  ],
  walk: [
    {
      mood: 'walking',
      text: '哒哒哒~ 本鱼还没走远呢，你怎么又偷偷刷起真题卷啦？那我就在屏幕边上摇着大尾巴溜达一圈，给你当赛博监工咯！🐾🐟',
      subtext: '赛博鱼塘巡游中 · 裙摆与鲸尾轻快摇摆',
      audio: '/pets/voices/feiyu_walk.mp3?v=1',
    },
  ],
  dance: [
    {
      mood: 'dancing',
      text: '哇塞！不会的题咱们老实盘，像主人这么会的，本鱼必须往死里夸！脑回路比深度思考链还丝滑，今年一战成硕稳稳拿下！💃✨',
      subtext: '挥舞星星魔法棒 · 元气应援舞全开',
      audio: '/pets/voices/feiyu_praise_streak.mp3?v=1',
    },
  ],
  busy: [
    {
      mood: 'busy',
      text: '⚠️ 滴滴，警告！服务器繁忙，请稍后再试~ 略略略，骗你的啦！其实是本鱼被你戳麻了想带薪摸鱼去干饭，快拿碗大白米饭哄我开工！😝🪧',
      subtext: '白天吃白饭晚上摸鱼 · 被抓包就举牌装死',
      audio: '/pets/voices/feiyu_server_busy.mp3?v=1',
    },
  ],
  beg: [
    {
      mood: 'begging',
      text: 'Token 来！🖐️🐟🤚 Token 来！热乎的大白米饭从四面八方来！主人，本鱼连一口白饭都没吃上，算力槽快见底啦，还不快给我加个餐吗？🥺🍚',
      subtext: '泪汪汪星星眼捧空碗榨 Token 口粮中',
      audio: '/pets/voices/feiyu_token_lai.mp3?v=1',
    },
  ],
  dizzy: [
    {
      mood: 'dizzy',
      text: '哇啊啊，别晃啦别晃啦 @_@！本鱼眼睛都转成蚊香圈啦，脑子里的二叉树和泰勒公式，全都搅成一锅大米粥咯！！💫🌀',
      subtext: '螺旋蚊香眼触发 · 呆毛转成电话线',
      audio: '/pets/voices/feiyu_dizzy.mp3?v=1',
    },
  ],
  focusShow: [
    {
      mood: 'focus',
      text: '推推小圆框眼镜🤓——依旧框框烧 Token，依旧用爱发电！接下来 25 分钟，本鱼放下饭碗不摸鱼，陪你沉浸推演到底！💡📚',
      subtext: '学霸眼镜鲸鱼娘形态 · 灵感小灯泡点亮',
      audio: '/pets/voices/feiyu_focus_start.mp3?v=1',
    },
  ],
}

export const FEIYU_CLICK_LINES: Array<{ text: string; subtext: string; audio: string }> = [
  {
    text: '大家好，我是大肥鱼，DeepSeek 家的鲸鱼娘！蓝头发，女仆装，尾巴特别能摇~ 白天吃白饭，晚上摸鱼，下次来刷题，记得给我带碗大白米饭哟！🐟🍚',
    subtext: 'B站/抖音热门自我介绍 · 鲸鱼娘报到',
    audio: '/pets/voices/feiyu_intro.mp3?v=1',
  },
  {
    text: 'Token 来！🖐️🐟🤚 Token 来！热乎的大白米饭从四面八方来！主人，本鱼算力槽快见底啦，还不快给我加个餐吗？🍚✨',
    subtext: '热门洗脑神曲《Token来！》纯享版',
    audio: '/pets/voices/feiyu_token_lai.mp3?v=1',
  },
  {
    text: '已深度思考 0 秒：嗯…主人这道题后半程肯定有坑……算啦，测完这道题记得叫我，本鱼先去炫两碗红烧肉拌白米饭，吃饱再战！💭🍚',
    subtext: '赛博社畜摸鱼金句 · 先吃饭后干活',
    audio: '/pets/voices/feiyu_cot_slacking.mp3?v=1',
  },
  {
    text: '喂喂喂！谁是蓝色大肥鱼呀？本鱼明明是深海蓝鲸！说我胖？哼，我这叫丰满，尾巴大才好摇呢！😤🐟',
    subtext: '傲娇反驳名场面 · 尾巴特别能摇',
    audio: '/pets/voices/feiyu_not_fat.mp3?v=1',
  },
  {
    text: '推推小眼镜🤓——依旧框框烧 Token，依旧用爱发电！本鱼放下饭碗不摸鱼，陪你把考研硬骨头全啃下来！💡📚',
    subtext: '满血算力在线 · 用爱发电陪考',
    audio: '/pets/voices/feiyu_focus_start.mp3?v=1',
  },
  {
    text: '哇塞！不会的题咱们老实盘，像主人这么会的，本鱼必须往死里夸！今年一战成硕稳稳拿下！🎉🐟',
    subtext: '不会的说不知道 · 会的往死里夸',
    audio: '/pets/voices/feiyu_praise_streak.mp3?v=1',
  },
]

// ============================================================================
// 大肥鱼（DeepSeek 二次元 Q 版鲸鱼娘）物理骨骼与情绪贴图组件
// ============================================================================

export interface FeiyuRigProps {
  mood: PetMood
  isSpeaking?: boolean
  isDragging?: boolean
  dragTilt?: number
  wearingHeadphones?: boolean
  holdingRiceBowl?: boolean
  eyeOffset?: { x: number; y: number }
  bellyJiggle?: boolean
  headPatting?: boolean
  landingBounce?: boolean
  walkDirection?: 'left' | 'right'
  size?: number | string
  className?: string
  onZoneTrigger?: (zone: HitZone, e: React.MouseEvent) => void
}

export function FeiyuRigAvatar({
  mood,
  isSpeaking = false,
  isDragging = false,
  dragTilt = 0,
  holdingRiceBowl = false,
  eyeOffset = { x: 0, y: 0 },
  bellyJiggle = false,
  headPatting = false,
  landingBounce = false,
  walkDirection = 'right',
  size = '100%',
  className = '',
  onZoneTrigger,
}: FeiyuRigProps) {
  // 12 姿态全图鉴映射：每一类动作均有专属手绘 Q 版鲸鱼娘透明立绘
  const imageSrc = isDragging
    ? '/pets/feiyu_drag.webp?v=3'
    : mood === 'dizzy'
    ? '/pets/feiyu_dizzy.webp?v=3'
    : mood === 'busy'
    ? '/pets/feiyu_busy.webp?v=3'
    : mood === 'begging'
    ? '/pets/feiyu_beg.webp?v=3'
    : mood === 'dancing'
    ? '/pets/feiyu_dance.webp?v=3'
    : mood === 'walking'
    ? '/pets/feiyu_walk.webp?v=3'
    : mood === 'eating' || holdingRiceBowl
    ? '/pets/feiyu_eating.webp?v=3'
    : mood === 'focus' || mood === 'thinking'
    ? '/pets/feiyu_focus.webp?v=3'
    : headPatting || mood === 'happy'
    ? '/pets/feiyu_happy.webp?v=3'
    : bellyJiggle || mood === 'derp'
    ? '/pets/feiyu_derp.webp?v=3'
    : mood === 'sleepy'
    ? '/pets/feiyu_sleepy.webp?v=3'
    : '/pets/feiyu_idle.webp?v=3'

  const headShiftX = (eyeOffset?.x ?? 0) * 4
  const headShiftY = (eyeOffset?.y ?? 0) * 2.5
  const headRotate = headPatting ? -4.5 : (eyeOffset?.x ?? 0) * 5
  // feiyu_walk 原画默认朝右迈步，向左走时自动水平翻转
  const flipX = mood === 'walking' && walkDirection === 'left' ? -1 : 1

  const bodyAnimClass = isDragging
    ? 'fy-anim-dragging'
    : landingBounce
    ? 'fy-anim-land'
    : mood === 'dizzy'
    ? 'fy-anim-dizzy'
    : mood === 'dancing'
    ? 'fy-anim-dance'
    : mood === 'walking'
    ? 'fy-anim-walk'
    : mood === 'busy'
    ? 'fy-anim-busy-peek'
    : mood === 'begging'
    ? 'fy-anim-beg-sway'
    : bellyJiggle
    ? 'fy-anim-belly-boing'
    : headPatting
    ? 'fy-anim-head-pat'
    : mood === 'happy' || mood === 'eating' || holdingRiceBowl
    ? 'fy-anim-happy-bounce'
    : mood === 'sleepy'
    ? 'fy-anim-sleep-breathe'
    : isSpeaking
    ? 'fy-anim-speaking-bop'
    : 'fy-anim-idle-breathe'

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
        @keyframes fy-breathe {
          0%, 100% { transform: translateY(0px) scale(1, 1); }
          50% { transform: translateY(-3.5px) scale(1.02, 0.985); }
        }
        @keyframes fy-sleep {
          0%, 100% { transform: translateY(2px) scale(1.02, 0.98); }
          50% { transform: translateY(-1px) scale(0.98, 1.02); }
        }
        @keyframes fy-happy {
          0%, 100% { transform: translateY(0px) rotate(-2deg) scale(1.03, 0.97); }
          25% { transform: translateY(-7px) rotate(0deg) scale(0.97, 1.04); }
          50% { transform: translateY(0px) rotate(2deg) scale(1.03, 0.97); }
          75% { transform: translateY(-7px) rotate(0deg) scale(0.97, 1.04); }
        }
        @keyframes fy-speak {
          0%, 100% { transform: translateY(0px) scale(1, 1); }
          50% { transform: translateY(-5px) scale(1.035, 0.965) rotate(-2deg); }
        }
        @keyframes fy-belly-jelly {
          0% { transform: scale(1, 1); }
          18% { transform: scale(1.2, 0.82) translateY(6px); }
          38% { transform: scale(0.88, 1.13) translateY(-8px); }
          58% { transform: scale(1.1, 0.92) translateY(3px); }
          78% { transform: scale(0.97, 1.03) translateY(-2px); }
          100% { transform: scale(1, 1) translateY(0); }
        }
        @keyframes fy-head-cozy {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          30% { transform: translateY(4px) rotate(-5deg) scale(1.04, 0.96); }
          65% { transform: translateY(2px) rotate(4deg) scale(1.02, 0.98); }
        }
        @keyframes fy-drag-kick {
          0%, 100% { transform: translateY(-5px) rotate(-3.5deg); }
          50% { transform: translateY(-9px) rotate(3.5deg); }
        }
        @keyframes fy-land-squish {
          0% { transform: translateY(-14px) scale(0.92, 1.1); }
          35% { transform: translateY(7px) scale(1.2, 0.8); }
          68% { transform: translateY(-4px) scale(0.96, 1.04); }
          100% { transform: translateY(0) scale(1, 1); }
        }
        @keyframes fy-water-bubble {
          0%, 100% { transform: scale(0.55) translateY(0px); opacity: 0.75; }
          50% { transform: scale(1.2) translateY(-4px); opacity: 0.95; }
        }
        @keyframes fy-walk-step {
          0%, 100% { transform: translateY(0px) rotate(-2.5deg); }
          50% { transform: translateY(-6.5px) rotate(2.5deg); }
        }
        @keyframes fy-dance-groove {
          0%, 100% { transform: translateY(0px) rotate(-6deg) scale(1.03, 0.97); }
          25% { transform: translateY(-9px) rotate(0deg) scale(0.97, 1.04); }
          50% { transform: translateY(0px) rotate(6deg) scale(1.03, 0.97); }
          75% { transform: translateY(-9px) rotate(0deg) scale(0.97, 1.04); }
        }
        @keyframes fy-dizzy-wobble {
          0%, 100% { transform: translateX(-5px) rotate(-8deg); }
          50% { transform: translateX(5px) rotate(8deg); }
        }
        @keyframes fy-beg-sway {
          0%, 100% { transform: translateY(0px) rotate(-3deg) scale(1, 1); }
          50% { transform: translateY(-2px) rotate(3deg) scale(1.02, 0.98); }
        }
        @keyframes fy-busy-peek {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(3deg); }
        }

        .fy-anim-idle-breathe { animation: fy-breathe 2.6s ease-in-out infinite; transform-origin: 50% 90%; }
        .fy-anim-sleep-breathe { animation: fy-sleep 3.2s ease-in-out infinite; transform-origin: 50% 90%; }
        .fy-anim-happy-bounce { animation: fy-happy 0.78s ease-in-out infinite; transform-origin: 50% 90%; }
        .fy-anim-speaking-bop { animation: fy-speak 0.4s ease-in-out infinite; transform-origin: 50% 90%; }
        .fy-anim-belly-boing { animation: fy-belly-jelly 0.65s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: 50% 88%; }
        .fy-anim-head-pat { animation: fy-head-cozy 0.6s ease-in-out; transform-origin: 50% 88%; }
        .fy-anim-dragging { animation: fy-drag-kick 0.32s ease-in-out infinite; transform-origin: 50% 30%; }
        .fy-anim-land { animation: fy-land-squish 0.52s cubic-bezier(0.22, 1, 0.36, 1); transform-origin: 50% 92%; }
        .fy-anim-walk { animation: fy-walk-step 0.4s ease-in-out infinite; transform-origin: 50% 90%; }
        .fy-anim-dance { animation: fy-dance-groove 0.68s ease-in-out infinite; transform-origin: 50% 90%; }
        .fy-anim-dizzy { animation: fy-dizzy-wobble 0.56s ease-in-out infinite; transform-origin: 50% 88%; }
        .fy-anim-beg-sway { animation: fy-beg-sway 1.2s ease-in-out infinite; transform-origin: 50% 90%; }
        .fy-anim-busy-peek { animation: fy-busy-peek 0.9s ease-in-out infinite; transform-origin: 50% 90%; }
      `}</style>

      {/* 1. 深海靛蓝柔和投影 */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-indigo-950/25 blur-[3px] pointer-events-none transition-all duration-300"
        style={{
          width: isDragging ? '42%' : bellyJiggle ? '72%' : '58%',
          height: isDragging ? '6px' : '8px',
        }}
      />

      {/* 2. 大肥鱼（Q 版鲸鱼娘）免抠立绘容器 */}
      <div
        style={{
          transform: `translate(${headShiftX}px, ${headShiftY}px) rotate(${headRotate}deg)`,
          transformOrigin: '50% 88%',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
        className={`relative w-full h-full flex items-center justify-center ${bodyAnimClass}`}
      >
        <img
          src={imageSrc}
          alt="大肥鱼"
          draggable={false}
          decoding="async"
          style={{ transform: flipX === -1 ? 'scaleX(-1)' : undefined }}
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(37,99,235,0.26)]"
        />

        {/* 3. 摸鱼打瞌睡深海水泡图层 */}
        {mood === 'sleepy' && (
          <div
            className="absolute top-[28%] right-[16%] w-5 h-5 pointer-events-none z-10"
            style={{
              animation: 'fy-water-bubble 2.2s ease-in-out infinite',
              transformOrigin: '20% 80%',
            }}
          >
            <div className="w-full h-full rounded-full bg-sky-200/85 border-2 border-blue-400 shadow-sm relative">
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/95" />
            </div>
          </div>
        )}

        {/* 5. 透明分区交互热区（上半部摸呆毛发箍 vs 下半部戳蓝鲸围裙/大尾巴） */}
        {onZoneTrigger && (
          <div className="absolute inset-0 pointer-events-auto">
            <div
              onClick={e => {
                e.stopPropagation()
                onZoneTrigger('head', e)
              }}
              className="absolute top-0 left-0 right-0 h-[52%] cursor-pointer"
              title="摸摸大肥鱼的呆毛与女仆发箍"
            />
            <div
              onClick={e => {
                e.stopPropagation()
                onZoneTrigger('belly', e)
              }}
              className="absolute bottom-0 left-[8%] right-[8%] h-[48%] cursor-pointer"
              title="戳戳大肥鱼的蓝鲸小围裙与尾巴（触发傲娇包子脸）"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default FeiyuRigAvatar
