import { useState, useRef } from 'react'
import { updateTrialBridgeState } from '../../utils/trialStateBridge'
import { LiveWorkspaceGalleryStage, type GallerySlideId } from './LiveWorkspaceGalleryStage'
import {
  ClipboardList,
  GraduationCap,
  BookOpen,
  Landmark,
  Headphones,
  Network,
  FileEdit,
  Timer,
  ArrowUpRight,
  Sparkles,
  RotateCw,
  Volume2,
  HeartHandshake,
  CheckCircle2,
  Layers,
  Flame,
  Compass,
  BrainCircuit,
} from 'lucide-react'

interface InteractiveBentoShowcaseProps {
  isAuthenticated: boolean
  onLaunchModule: (path: string, label: string) => void
  onOpenRegister: (contextHint?: string) => void
  mode?: 'both' | 'features-only' | 'hub-only'
}

type HubCategory = 'all' | 'exam' | 'memory' | 'focus'

interface HubPortalItem {
  path: string
  label: string
  badge: string
  desc: string
  metric: string
  category: Exclude<HubCategory, 'all'>
  icon: typeof ClipboardList
  accentBg: string
  accentText: string
  accentRing: string
}

const HUB_PORTAL_ITEMS: HubPortalItem[] = [
  {
    path: '/quiz',
    label: '真题刷题中心',
    badge: '高频核心',
    desc: '收录 408 与考研数学历年整卷及名师冲刺卷，做错自动三维归因。',
    metric: '43 套整卷 · 1900+ 精校题',
    category: 'exam',
    icon: ClipboardList,
    accentBg: 'bg-indigo-50',
    accentText: 'text-indigo-600',
    accentRing: 'group-hover:border-indigo-300/80',
  },
  {
    path: '/study',
    label: 'SM-2 研学闪卡',
    badge: '抗遗忘引擎',
    desc: '按艾宾浩斯遗忘临界点自动推送今日待复习卡片，内置交互仿真课件。',
    metric: '动态记忆间隔 · 零盲目背诵',
    category: 'memory',
    icon: BrainCircuit,
    accentBg: 'bg-amber-50',
    accentText: 'text-amber-600',
    accentRing: 'group-hover:border-amber-300/80',
  },
  {
    path: '/english',
    label: '考研英语实战舱',
    badge: 'AI 秒级精批',
    desc: '英一图画与英二图表三段论模板，20 分制阅卷打分与平庸词高阶替换。',
    metric: '~1.2s 四维批改 · OCR 录入',
    category: 'exam',
    icon: BookOpen,
    accentBg: 'bg-emerald-50',
    accentText: 'text-emerald-600',
    accentRing: 'group-hover:border-emerald-300/80',
  },
  {
    path: '/politics',
    label: '史纲时空大本营',
    badge: '时空编年',
    desc: '1840–2024 近代史重大会议时空轴对照，肖秀荣千题精粹与遮罩自测。',
    metric: '五大模块 · 混淆选项辨析',
    category: 'exam',
    icon: Landmark,
    accentBg: 'bg-rose-50',
    accentText: 'text-rose-600',
    accentRing: 'group-hover:border-rose-300/80',
  },
  {
    path: '/vocabulary',
    label: '考研大纲背词',
    badge: '词根拓扑',
    desc: '精选 2000+ 考研高频核心词与熟词僻义，串联历年阅读真题原句语境。',
    metric: '词根词缀树 · 闪卡速刷',
    category: 'memory',
    icon: Headphones,
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-600',
    accentRing: 'group-hover:border-sky-300/80',
  },
  {
    path: '/study?tab=graph',
    label: '双链知识图谱',
    badge: '可视化掌握度',
    desc: '节点尺寸与色彩实时映射知识点掌握深度，一键扫描并修复孤立断链。',
    metric: '全局考点织网 · 查漏补缺',
    category: 'memory',
    icon: Network,
    accentBg: 'bg-violet-50',
    accentText: 'text-violet-600',
    accentRing: 'group-hover:border-violet-300/80',
  },
  {
    path: '/editor',
    label: 'LaTeX 沉浸笔记',
    badge: '本地优先',
    desc: '深度兼容 Obsidian Markdown 与 KaTeX 数学排版，支持 PDF 讲义双栏圈选切片。',
    metric: '毫秒级公式渲染 · 自由导出',
    category: 'focus',
    icon: FileEdit,
    accentBg: 'bg-teal-50',
    accentText: 'text-teal-600',
    accentRing: 'group-hover:border-teal-300/80',
  },
  {
    path: '/pomodoro',
    label: '心流番茄自习室',
    badge: '沉浸伴学',
    desc: '内置雨声、林涛、Lofi 电台与双耳专注节拍，每日打卡沉淀个人研学热力图。',
    metric: '专注计时 · 白噪音混音台',
    category: 'focus',
    icon: Timer,
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-600',
    accentRing: 'group-hover:border-orange-300/80',
  },
]

const DEMO_FLASHCARDS = [
  {
    subject: '408 操作系统 · PV 同步互斥',
    question: '为什么在生产者-消费者问题中，必须先执行「资源信号量 P(empty/full)」，再执行「互斥信号量 P(mutex)」？',
    answer:
      '若颠倒顺序先 P(mutex) 锁住缓冲区，当缓冲区已满时生产者阻塞在 P(empty)，但仍持有 mutex 锁，导致消费者无法进入临界区取走数据，引发永久死锁！',
    mnemonic: '口诀：先看有没有空位/产品，再关门上锁；切忌占着茅坑等资源。',
  },
  {
    subject: '考研数学 · 泰勒展开黄金准则',
    question: '求极限 lim(x→0) [eˣ − 1 − x − x²/2] / (x · sin²x) 时，分子应该展开到几阶皮亚诺余项？',
    answer:
      '遵循「上下同阶」原则：分母 x · sin²x ~ x³ 为 3 阶无穷小，因此分子 eˣ 必须展开到 x³ 项（即 1 + x + x²/2 + x³/6 + o(x³)），立即求得极限为 1/6。',
    mnemonic: '口诀：乘除因子先等价定分母阶数，加减分子同阶展开不漏项。',
  },
  {
    subject: '考研政治 · 史纲重要会议对比',
    question: '「八七会议」与「遵义会议」分别纠正了党内什么性质的错误路线？',
    answer:
      '1927 年八七会议清算了大革命后期陈独秀的「右倾机会主义」错误，确定土地革命和武装起义方针；1935 年遵义会议结束了王明「“左”倾教条主义」在党中央的统治。',
    mnemonic: '记忆锚点：二七八七纠右倾（枪杆子出政权），三五遵义纠左倾（生死攸关转折点）。',
  },
]

const NAILONG_MOODS = [
  {
    img: '/pets/nailong_wave.webp',
    tag: '元气迎新模式',
    quote: '嗨！今天背完这一组闪卡，离上岸目标院校就又近了一大步哟！',
    voice: '/pets/voices/nailong_2.mp3',
  },
  {
    img: '/pets/nailong_focus.webp',
    tag: '深度心流模式',
    quote: '这道 408 大题虽然绕，但咱们拆成 3 个踩分点逐个击破，绝对稳拿！',
    voice: '/pets/voices/nailong_focus_start.mp3',
  },
  {
    img: '/pets/nailong_happy.webp',
    tag: '满分夸夸模式',
    quote: '太棒啦！连续答对真题陷阱，今晚奖励自己听首 Lofi 好好休息一下！',
    voice: '/pets/voices/nailong_focus_done.mp3',
  },
]

const GALLERY_SLIDES: Array<{
  id: GallerySlideId
  title: string
  subtitle: string
  targetPath: string
}> = [
  {
    id: 'graph',
    title: '双链知识网络与掌握度拓扑',
    subtitle: '哪些考点已经吃透、哪些还是薄弱孤岛，一张三维星图尽收眼底',
    targetPath: '/study?tab=graph',
  },
  {
    id: 'editor',
    title: '出版级 LaTeX 公式与双栏笔记',
    subtitle: '原生兼容本地 Obsidian 语法，微积分矩阵推导与真题错因一键双链',
    targetPath: '/editor',
  },
  {
    id: 'quiz',
    title: '全真模考卷面与分步踩分导师',
    subtitle: '还原统考真实节奏，解答大题提供逐级启发提示与易错点预警',
    targetPath: '/quiz',
  },
  {
    id: 'pomodoro',
    title: '沉浸式番茄钟与 Lofi 自习电台',
    subtitle: '隔绝外界信息焦虑，记录你每一个披星戴月的专注番茄与热力足迹',
    targetPath: '/pomodoro',
  },
]

export function InteractiveBentoShowcase({
  isAuthenticated,
  onLaunchModule,
  onOpenRegister,
  mode = 'both',
}: InteractiveBentoShowcaseProps) {
  const [hubCategory, setHubCategory] = useState<HubCategory>('all')

  // SM-2 闪卡微交互状态
  const [cardIdx, setCardIdx] = useState(0)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [scheduledHint, setScheduledHint] = useState<string | null>(null)

  // 奶龙伴宠微交互状态
  const [moodIdx, setMoodIdx] = useState(0)
  const [petHearts, setPetHearts] = useState(128)
  const [playingVoice, setPlayingVoice] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 实景画廊状态
  const [slideIdx, setSlideIdx] = useState(0)

  const filteredHubItems =
    hubCategory === 'all'
      ? HUB_PORTAL_ITEMS
      : HUB_PORTAL_ITEMS.filter((item) => item.category === hubCategory)

  const currentCard = DEMO_FLASHCARDS[cardIdx]
  const currentMood = NAILONG_MOODS[moodIdx]
  const currentSlide = GALLERY_SLIDES[slideIdx]

  const handleRateCard = (ratingLabel: string, nextInterval: string) => {
    const card = DEMO_FLASHCARDS[cardIdx]
    updateTrialBridgeState((prev) => {
      const filtered = prev.flashcardRatedItems.filter((x) => x.question !== card.question)
      return {
        flashcardRatedItems: [
          ...filtered,
          {
            subject: card.subject,
            question: card.question,
            answer: card.answer,
            rating: ratingLabel,
          },
        ],
      }
    })
    setScheduledHint(`已暂存自评「${ratingLabel}」（注册后自动导入复习队列 · 下次复习：${nextInterval}）`)
    setTimeout(() => {
      setCardFlipped(false)
      setCardIdx((prev) => (prev + 1) % DEMO_FLASHCARDS.length)
    }, 900)
  }

  const handleInteractPet = (withAudio = false) => {
    const nextIdx = (moodIdx + 1) % NAILONG_MOODS.length
    setMoodIdx(nextIdx)
    setPetHearts((c) => c + 1)

    if (withAudio) {
      try {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        const audio = new Audio(NAILONG_MOODS[nextIdx].voice)
        audio.volume = 0.65
        audioRef.current = audio
        setPlayingVoice(true)
        audio.onended = () => setPlayingVoice(false)
        audio.onerror = () => setPlayingVoice(false)
        audio.play().catch(() => setPlayingVoice(false))
      } catch {
        setPlayingVoice(false)
      }
    }
  }

  return (
    <>
      {/* =====================================================================
          模块一：全景研学导航舱 (#hub) —— 一键直达 8 大核心研学空间
         ===================================================================== */}
      {mode !== 'features-only' && (
      <section id="hub" className="w-full min-w-0 max-w-[1280px] mx-auto px-3.5 sm:px-8 pt-6 pb-16 sm:pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-9">
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-2xs font-bold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>全景研学导航总台 · 八大核心舱室一键直达</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-[#18181b] tracking-[-0.03em]">
              你想从哪个研学模块开始突破？
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#71717a] landing-pretty-copy">
              点击任意功能舱即可{isAuthenticated ? '立即进入对应工作台' : '极速创建专属账号并直达目标空间，无需在繁杂菜单中迷路'}。
            </p>
          </div>

          {/* 分类胶囊筛选器（移动端可平滑横向轻扫或自适应折行） */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/90 shadow-xs self-start md:self-auto max-w-full overflow-x-auto no-scrollbar">
            {[
              { id: 'all' as const, label: '全部舱室 (8)' },
              { id: 'exam' as const, label: '真题与批改' },
              { id: 'memory' as const, label: '闪卡与图谱' },
              { id: 'focus' as const, label: '笔记与自习' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHubCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  hubCategory === tab.id
                    ? 'bg-[#18181b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 宫格高质感导航矩阵（手机端精致 2 列，桌面端 4 列） */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredHubItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onLaunchModule(item.path, item.label)}
                className={`group landing-bento-card rounded-2xl p-3.5 sm:p-5 text-left flex flex-col justify-between gap-3 cursor-pointer ${item.accentRing}`}
              >
                <div className="w-full min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2.5 sm:mb-3.5">
                    <div
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${item.accentBg} ${item.accentText} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-slate-900 text-slate-600 group-hover:text-white text-[10px] sm:text-2xs font-bold transition-colors shrink-0">
                      <span className="hidden xs:inline">{item.badge}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>

                  <h3 className="text-[13.5px] sm:text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2 sm:line-clamp-3 landing-pretty-copy">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px] sm:text-2xs font-semibold text-slate-600 w-full min-w-0">
                  <span className="truncate">{item.metric}</span>
                  <span className="text-indigo-600 font-bold shrink-0 group-hover:translate-x-0.5 transition-transform">
                    {isAuthenticated ? '立即进入 →' : '登录开启 →'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>
      )}

      {/* =====================================================================
          模块二：交互式黑科技 Bento 兴趣画廊 (#features)
         ===================================================================== */}
      {mode !== 'hub-only' && (
      <section
        id="features"
        className="w-full min-w-0 py-16 sm:py-22 border-t border-slate-200/80 bg-gradient-to-b from-white/75 via-[#f6f7fb] to-white/90"
      >
        <div className="w-full max-w-[1280px] mx-auto px-3.5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-2xs font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>先玩再注册 · 沉浸式生产力黑科技</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-[#18181b] tracking-[-0.03em]">
              把枯燥的死记硬背，变成上瘾的通关体验
            </h2>
            <p className="mt-2.5 text-xs sm:text-sm text-[#71717a] landing-pretty-copy">
              无需离开当前页面，直接点击下方交互卡片，感受艾宾浩斯记忆调度、奶龙语音伴学与全真知识星图的魅力。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
            {/* ── Bento 左上 (7 列)：可亲手翻转的 SM-2 艾宾浩斯真题闪卡微件 ── */}
            <div className="lg:col-span-7 landing-bento-card rounded-3xl p-4 sm:p-7 flex flex-col justify-between gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      互动体验 1：SM-2 艾宾浩斯真题记忆闪卡
                    </h3>
                    <p className="text-2xs text-slate-500">点击卡片立即翻转看解析，体验科学抗遗忘排期</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {DEMO_FLASHCARDS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCardIdx(i)
                        setCardFlipped(false)
                        setScheduledHint(null)
                      }}
                      className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-colors cursor-pointer ${
                        cardIdx === i
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      考点 {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* 闪卡主体 */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setCardFlipped((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setCardFlipped((v) => !v)
                  }
                }}
                aria-label="点击翻转真题记忆闪卡"
                className={`w-full min-h-[196px] sm:min-h-[210px] rounded-2xl p-4 sm:p-6 text-left flex flex-col justify-between transition-all duration-300 cursor-pointer select-none border ${
                  cardFlipped
                    ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/40 shadow-lg'
                    : 'bg-gradient-to-br from-amber-50/70 via-white to-indigo-50/40 text-slate-900 border-slate-200/90 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-2xs font-bold">
                  <span
                    className={`px-2.5 py-0.5 rounded-full ${
                      cardFlipped
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {currentCard.subject}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 ${
                      cardFlipped ? 'text-indigo-200' : 'text-slate-500'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{cardFlipped ? '背面：核心解析与口诀' : '正面：点击翻转查看答案'}</span>
                  </span>
                </div>

                {!cardFlipped ? (
                  <div className="my-3 text-sm sm:text-[16px] font-bold leading-relaxed text-slate-900">
                    {currentCard.question}
                  </div>
                ) : (
                  <div className="my-2.5 space-y-2">
                    <p className="text-xs sm:text-[13.5px] leading-relaxed text-slate-100">
                      {currentCard.answer}
                    </p>
                    <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-2xs font-semibold text-amber-300">
                      {currentCard.mnemonic}
                    </div>
                  </div>
                )}

                <div className="text-2xs flex items-center justify-between opacity-80">
                  <span>高频真题提炼 · 自动关联错题本</span>
                  <span className="font-semibold underline">点击卡片任意位置翻面</span>
                </div>
              </div>

              {/* 艾宾浩斯掌握度打分按钮 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => handleRateCard('生疏重来', '10 分钟后强化')}
                    className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 text-2xs sm:text-xs font-bold transition-colors cursor-pointer"
                  >
                    生疏 · 10分钟
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCard('有点模糊', '明日黄金时段')}
                    className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-800 text-2xs sm:text-xs font-bold transition-colors cursor-pointer"
                  >
                    模糊 · 1天后
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCard('稳稳掌握', '4 天后巩固')}
                    className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-700 text-2xs sm:text-xs font-bold transition-colors cursor-pointer"
                  >
                    熟练 · 4天后
                  </button>
                </div>

                {scheduledHint ? (
                  <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    {scheduledHint}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenRegister('注册即可开启个人专属艾宾浩斯每日复习队列')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer shrink-0 text-left sm:text-right"
                  >
                    开启我的记忆曲线 →
                  </button>
                )}
              </div>
            </div>

            {/* ── Bento 右上 (5 列)：治愈系奶龙桌面伴学桌宠实时互动 ── */}
            <div className="lg:col-span-5 landing-bento-card rounded-3xl p-4 sm:p-7 flex flex-col justify-between gap-4 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      互动体验 2：奶龙治愈系伴学桌宠
                    </h3>
                    <p className="text-2xs text-slate-500">备考不孤单，真人配音打气与随时唤出答疑</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-rose-600 text-2xs font-bold shrink-0">
                  <Flame className="w-3 h-3" />
                  <span>{petHearts} 次打气</span>
                </span>
              </div>

              {/* 奶龙互动舞台 */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-rose-50/70 border border-amber-200/70 p-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleInteractPet(false)}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/90 border border-amber-200/80 shadow-sm flex items-center justify-center shrink-0 group cursor-pointer active:scale-95 transition-transform"
                  aria-label="点击切换奶龙伴学状态"
                >
                  <img
                    src={currentMood.img}
                    alt={currentMood.tag}
                    width={96}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-xs whitespace-nowrap">
                    点我互动
                  </span>
                </button>

                <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-950 text-2xs font-bold">
                    {currentMood.tag}
                  </span>
                  <p className="text-xs sm:text-[13px] font-medium text-slate-800 leading-relaxed landing-pretty-copy">
                    “{currentMood.quote}”
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleInteractPet(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                >
                  <Volume2 className={`w-3.5 h-3.5 text-amber-300 ${playingVoice ? 'animate-bounce' : ''}`} />
                  <span>{playingVoice ? '正在语音鼓励...' : '试听伴学语音'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenRegister('注册即可在工作台领养专属奶龙伴学桌宠')}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50/60 text-slate-900 border border-slate-200/90 text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>领养进我的桌面</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                </button>
              </div>
            </div>

            {/* ── Bento 下方通栏 (12 列)：真实研学工作台高清实景画廊快切 ── */}
            <div className="lg:col-span-12 landing-bento-card rounded-3xl p-4 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-center">
              <div className="lg:col-span-5 text-left space-y-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-2xs font-bold mb-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>100% 真实工作台实景 · 所见即所得</span>
                  </span>
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {currentSlide.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed landing-pretty-copy">
                    {currentSlide.subtitle}
                  </p>
                </div>

                <div className="space-y-2">
                  {GALLERY_SLIDES.map((slide, i) => {
                    const active = slideIdx === i
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setSlideIdx(i)}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-slate-50/80 hover:bg-white text-slate-700 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-400' : 'text-slate-400'}`}
                          />
                          <span className="text-xs sm:text-[13px] font-semibold truncate">{slide.title}</span>
                        </div>
                        <span className={`text-2xs font-mono shrink-0 ${active ? 'text-emerald-300' : 'text-slate-400'}`}>
                          0{i + 1}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onLaunchModule(currentSlide.targetPath, currentSlide.title)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-[13px] font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>{isAuthenticated ? '立即进入该功能实操' : '注册 / 登录进入该功能舱'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <span className="text-2xs text-slate-500">支持本地 Markdown 随时无损导出</span>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-2xl bg-slate-900 p-2 sm:p-2.5 shadow-[0_20px_50px_rgba(15,23,42,0.16)] border border-slate-800 overflow-hidden">
                  <div className="flex items-center justify-between px-2.5 pb-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                      <span className="ml-1.5 font-mono text-slate-300 truncate">{currentSlide.title}</span>
                    </div>
                    <span className="font-mono text-2xs text-emerald-400">研核实景视窗</span>
                  </div>
                  <div className="w-full rounded-xl overflow-hidden bg-slate-950 border border-white/10">
                    <LiveWorkspaceGalleryStage slideId={currentSlide.id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
    </>
  )
}
