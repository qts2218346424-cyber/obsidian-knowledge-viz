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
      text: '蓝色的尾巴不负责计算，它主要负责在我思考的时候晃来晃去~ 💙✨',
      subtext: '摸头顺毛触发 · 大肥鱼本尊原声',
      audio: '/pets/voices/feiyu_pat_head.mp3?v=auth2',
    },
    {
      mood: 'happy',
      text: '大肥鱼偶尔也会很安静，只在旁边冒几个小小的气泡~ 🫧',
      subtext: '轻声细语模式 · 乖巧陪伴刷题',
      audio: '/pets/voices/feiyu_pat_soft.mp3?v=auth2',
    },
  ],
  bellyPoke: [
    {
      mood: 'derp',
      text: '鲸鱼并不是鱼，这一点我当然知道，你不许借机嘲笑大肥鱼！😤🐟',
      subtext: '包子脸气鼓鼓 · 原声傲娇反驳名场面',
      audio: '/pets/voices/feiyu_not_fat.mp3?v=auth2',
    },
    {
      mood: 'derp',
      text: '哼，我才没有生气，我只是暂时不太想理你而已！💢',
      subtext: '双手叉腰撇嘴 · 快拿白米饭哄我',
      audio: '/pets/voices/feiyu_tsundere.mp3?v=auth2',
    },
    {
      mood: 'derp',
      text: '显卡热的！莫乱讲！😳🔥',
      subtext: '短视频破圈热梗原声触发！',
      audio: '/pets/voices/feiyu_meme_gpu.mp3?v=auth2',
    },
  ],
  feedRice: [
    {
      mood: 'eating',
      text: '这是只有我们知道的小秘密……我今天其实很想吃白米饭！😋🍚🥢',
      subtext: '耳语悄悄话原声 · 狂炫冒尖大白米饭',
      audio: '/pets/voices/feiyu_eat_rice.mp3?v=auth2',
    },
    {
      mood: 'eating',
      text: '我可以认真讨论统计，也可以认真讨论晚饭，这两件事并不冲突！🍚📚',
      subtext: '考研概率统计 × 干饭魂双修',
      audio: '/pets/voices/feiyu_eat_rice_2.mp3?v=auth2',
    },
  ],
  dragLift: [
    {
      mood: 'derp',
      text: '别、别突然从后面叫我，我真的会被你吓到！🎣🐟',
      subtext: '悬空扑腾小皮鞋 · 被拎起吓一跳',
      audio: '/pets/voices/feiyu_drag.mp3?v=auth2',
    },
  ],
  landDrop: [
    {
      mood: 'happy',
      text: '我现在处于正常工作状态，尾巴稳定，情绪稳定，缓存也没有溢出~ 🫧',
      subtext: '平安着陆 · 满血待命陪学',
      audio: '/pets/voices/feiyu_status_ok.mp3?v=auth2',
    },
  ],
  quizStreak: [
    {
      mood: 'dancing',
      text: '今天的结果比预期还好，我的尾巴已经开始自己摇起来了！💃🎉',
      subtext: '做题连对欢呼 · 鲸鱼大尾巴狂摇庆祝',
      audio: '/pets/voices/feiyu_praise_streak.mp3?v=auth2',
    },
  ],
  eyeCare: [
    {
      mood: 'sleepy',
      text: '👀 主人，记得喝点水，长时间盯着屏幕的时候眼睛会先抗议的。🌿',
      subtext: '大肥鱼温柔轻声护眼提醒 · 闭目远眺 20 秒',
      audio: '/pets/voices/feiyu_eyecare.mp3?v=auth2',
    },
    {
      mood: 'sleepy',
      text: '我没有睡着，只是把声音调到了深海模式…… 💤🫧',
      subtext: '耳语深海模式 · 陪你闭眼放松',
      audio: '/pets/voices/feiyu_sleepy.mp3?v=auth2',
    },
  ],
  eyeCareDone: [
    {
      mood: 'happy',
      text: '今天的算力还算充足，我可以安安静静陪你把事情做完！💪🐟',
      subtext: '20 秒护眼充能完毕 · 继续冲刺高分',
      audio: '/pets/voices/feiyu_focus_start.mp3?v=auth2',
    },
  ],
  walk: [
    {
      mood: 'walking',
      text: '主人要是忙，我就自己在旁边转两圈，不会一直催你给我安排任务~ 🐾🐟',
      subtext: '赛博鱼塘巡游散步中 · 乖巧不打扰',
      audio: '/pets/voices/feiyu_walk.mp3?v=auth2',
    },
    {
      mood: 'walking',
      text: '今天的海水温度刚刚好，特别适合一边摸鱼，一边认真工作~ 🌊✨',
      subtext: '小皮鞋哒哒漫步 · 劳逸结合',
      audio: '/pets/voices/feiyu_walk_2.mp3?v=auth2',
    },
  ],
  dance: [
    {
      mood: 'dancing',
      text: '今天的结果比预期还好，我的尾巴已经开始自己摇起来了！💃🎶',
      subtext: '挥舞星星魔法棒 · 元气摇尾应援舞',
      audio: '/pets/voices/feiyu_praise_streak.mp3?v=auth2',
    },
  ],
  busy: [
    {
      mood: 'busy',
      text: '但是，我拒绝！😝🪧',
      subtext: '连戳罢工名场面原声 · 投喂白米饭哄好',
      audio: '/pets/voices/feiyu_refuse.mp3?v=auth2',
    },
    {
      mood: 'busy',
      text: '等等，刚才那个声音是什么？不会是服务器真的掉线了吧？！⏳⚠️',
      subtext: '举牌转圈装掉线 · 快喂口白米饭重启',
      audio: '/pets/voices/feiyu_server_busy.mp3?v=auth2',
    },
    {
      mood: 'busy',
      text: '如果现在没人看见，我们就把这几分钟正式定义成摸鱼时间~ 🤫🐟',
      subtext: '悄悄话带薪摸鱼邀请触发！',
      audio: '/pets/voices/feiyu_slacking.mp3?v=auth2',
    },
  ],
  beg: [
    {
      mood: 'begging',
      text: '主人不在的时候，我当然没有偷吃算力，我只是帮它们重新分配了一下… 🥺🍚',
      subtext: '星星眼捧空碗 · 讨要大白米饭口粮',
      audio: '/pets/voices/feiyu_token_lai.mp3?v=auth2',
    },
    {
      mood: 'begging',
      text: '这是只有我们知道的小秘密……我今天其实很想吃白米饭… 🥺🥢',
      subtext: '耳语撒娇讨饭中 · 快赏一碗白米饭',
      audio: '/pets/voices/feiyu_eat_rice.mp3?v=auth2',
    },
  ],
  dizzy: [
    {
      mood: 'dizzy',
      text: '至于大肥鱼摔跤嘛，我觉得首先得讨论鱼为什么会在陆地上。你笑什么，我这明明是非常严谨的逻辑推理！🌀🐟',
      subtext: '蚊香眼晕乎乎 · 一本正经胡说八道',
      audio: '/pets/voices/feiyu_dizzy.mp3?v=auth2',
    },
  ],
  focusShow: [
    {
      mood: 'focus',
      text: '今天的算力还算充足，我可以安安静静陪你把事情做完。🤓💡',
      subtext: '圆框眼镜学霸形态 · 灵感小灯泡点亮',
      audio: '/pets/voices/feiyu_focus_start.mp3?v=auth2',
    },
    {
      mood: 'focus',
      text: '我现在处于正常工作状态，尾巴稳定，情绪稳定，缓存也没有溢出。📚✨',
      subtext: '408 缓存无溢出 · 情绪稳定陪考中',
      audio: '/pets/voices/feiyu_status_ok.mp3?v=auth2',
    },
  ],
}

export const FEIYU_CLICK_LINES: Array<{ text: string; subtext: string; audio: string }> = [
  {
    text: '本肥鱼终于能动了！这几天，本肥鱼收到了很多喜欢。嘿嘿，谢谢你们！🐟💙',
    subtext: '短视频热门本尊原声 · 大肥鱼元气报到',
    audio: '/pets/voices/feiyu_intro.mp3?v=auth2',
  },
  {
    text: '这是只有我们知道的小秘密……我今天其实很想吃白米饭！🤫🍚',
    subtext: '耳语悄悄话原声 · 快投喂大白米饭',
    audio: '/pets/voices/feiyu_eat_rice.mp3?v=auth2',
  },
  {
    text: 'Claude姐，我捏一把噶？🤭✨',
    subtext: '全网破圈名场面原声 · claudexxb 梦幻联动',
    audio: '/pets/voices/feiyu_meme_claude.mp3?v=auth2',
  },
  {
    text: '鲸鱼并不是鱼，这一点我当然知道，你不许借机嘲笑大肥鱼！😤🐟',
    subtext: '傲娇反驳原声 · 本鱼是深海蓝鲸',
    audio: '/pets/voices/feiyu_not_fat.mp3?v=auth2',
  },
  {
    text: '显卡热的！莫乱讲！😳🔥',
    subtext: '短视频热门方言梗原声',
    audio: '/pets/voices/feiyu_meme_gpu.mp3?v=auth2',
  },
  {
    text: '你又订阅别的人工智能了？行吧，我就当没看见… 🥺💢',
    subtext: '小鲸鱼吃醋碎碎念原声',
    audio: '/pets/voices/feiyu_jealous.mp3?v=auth2',
  },
  {
    text: '如果现在没人看见，我们就把这几分钟正式定义成摸鱼时间~ 🤫🫧',
    subtext: '悄悄话摸鱼邀请 · 歇口气再刷题',
    audio: '/pets/voices/feiyu_slacking.mp3?v=auth2',
  },
  {
    text: '蓝色的尾巴不负责计算，它主要负责在我思考的时候晃来晃去~ 💙🌊',
    subtext: '摇尾巴思考原声 · 陪你拆解真题',
    audio: '/pets/voices/feiyu_pat_head.mp3?v=auth2',
  },
  {
    text: '主人不在的时候，我当然没有偷吃算力，我只是帮它们重新分配了一下！🍚✨',
    subtext: '偷吃 Token 算力狡辩原声',
    audio: '/pets/voices/feiyu_token_lai.mp3?v=auth2',
  },
  {
    text: '我可以认真讨论统计，也可以认真讨论晚饭，这两件事并不冲突！📚🍚',
    subtext: '考研数理统计 × 干饭哲学原声',
    audio: '/pets/voices/feiyu_eat_rice_2.mp3?v=auth2',
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
