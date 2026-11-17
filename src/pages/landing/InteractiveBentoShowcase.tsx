import { useState, useRef } from 'react'
import { updateTrialBridgeState } from '../../utils/trialStateBridge'
import { LiveWorkspaceGalleryStage, type GallerySlideId } from './LiveWorkspaceGalleryStage'
import {
  ClipboardList,
  BookOpen,
  Landmark,
  Headphones,
  Network,
  FileEdit,
  Timer,
  ArrowUpRight,
  RotateCw,
  Volume2,
  BrainCircuit,
  Bot,
  Layers,
  Search,
  X,
  ChevronRight,
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
  eyebrow: string
  desc: string
  category: Exclude<HubCategory, 'all'>
  icon: typeof ClipboardList
}

const HUB_PORTAL_ITEMS: HubPortalItem[] = [
  {
    path: '/quiz',
    label: '真题模考中心',
    eyebrow: '43 套统考整卷 · 1,900+ 精校题',
    desc: '完整收录 408 与考研数学历年真题及冲刺整卷，配备分色答题卡与顺滑演草白板。',
    category: 'exam',
    icon: ClipboardList,
  },
  {
    path: '/study',
    label: '仿真课件与闪卡',
    eyebrow: '22+ 动态推演 · SM-2 记忆引擎',
    desc: '将抽象的数据结构旋转与高数定理化为单步交互动画，按遗忘临界点智能推送每日闪卡。',
    category: 'memory',
    icon: BrainCircuit,
  },
  {
    path: '/english',
    label: '考研英语实战舱',
    eyebrow: '整卷点词即查 · 20 分制四维精批',
    desc: '完形、阅读、新题型与翻译全真排版点词生词本，大小作文约 1.2 秒阅卷级升格。',
    category: 'exam',
    icon: BookOpen,
  },
  {
    path: '/politics',
    label: '1839–2026 史纲地图',
    eyebrow: '矢量时空联动 · 十五五时政与千题',
    desc: '高精度中国历史地图同城多史实循环联动，涵盖“史上第一次”汇总与遮罩排雷自测。',
    category: 'exam',
    icon: Landmark,
  },
  {
    path: '/vocabulary',
    label: '背词默写与随身巡航',
    eyebrow: '拼写防笔误 · 5 阶词根色谱',
    desc: '融合词根衍生网络、拼写默写检验、靶向词单特训与免动手耳机自动连播巡航。',
    category: 'memory',
    icon: Headphones,
  },
  {
    path: '/graph',
    label: '掌握度热力星图',
    eyebrow: '双链拓扑 · 5 题靶向急救舱',
    desc: '三维可视化呈现全科掌握态势，点击薄弱节点即刻开启“错题复盘 + 仿真 + 5 题抢救”。',
    category: 'memory',
    icon: Network,
  },
  {
    path: '/editor',
    label: '双链笔记与 PDF 伴读',
    eyebrow: '出版级 KaTeX · Obsidian 同步',
    desc: '防误触阅读态与富文本/源码双模切换，支持左看高清 PDF 讲义、右写公式笔记。',
    category: 'focus',
    icon: FileEdit,
  },
  {
    path: '/pomodoro',
    label: '心流番茄与环境音',
    eyebrow: '跨页不断流 · 多轨白噪音混音',
    desc: '内置雨夜书房、篝火与 Lofi 电台，跨页面切换零中断，沉淀每日专注时长热力。',
    category: 'focus',
    icon: Timer,
  },
]

const DEMO_FLASHCARDS = [
  {
    subject: '408 操作系统 · PV 同步互斥',
    question: '为什么在生产者-消费者问题中，必须先执行「资源信号量 P(empty/full)」，再执行「互斥信号量 P(mutex)」？',
    answer:
      '若颠倒顺序先 P(mutex) 锁住缓冲区，当缓冲区已满时生产者阻塞在 P(empty)，但仍持有 mutex 锁，导致消费者无法进入临界区取走数据，引发永久死锁。',
    mnemonic: '记忆锚点：先确认空位或产品资源，再关门上锁；切忌持锁等待资源。',
  },
  {
    subject: '考研数学 · 泰勒展开阶数准则',
    question: '求极限 lim(x→0) [eˣ − 1 − x − x²/2] / (x · sin²x) 时，分子应当展开到几阶皮亚诺余项？',
    answer:
      '遵循「上下同阶」原则：分母 x · sin²x ~ x³ 为 3 阶无穷小，因此分子 eˣ 展开至 x³ 项（1 + x + x²/2 + x³/6 + o(x³)），化简即得极限 1/6。',
    mnemonic: '记忆锚点：乘除因子先等价定分母阶数，加减分子同阶展开不漏项。',
  },
  {
    subject: '考研政治 · 1839–2026 史纲辨析',
    question: '「八七会议」与「遵义会议」分别纠正了党内什么性质的错误倾向？',
    answer:
      '1927 年八七会议清算了大革命后期陈独秀的「右倾机会主义」错误，确定土地革命和武装起义方针；1935 年遵义会议结束了王明「“左”倾教条主义」在党中央的统治。',
    mnemonic: '记忆锚点：二七八七纠右倾（枪杆子出政权），三五遵义纠左倾（生死攸关转折）。',
  },
]

type ShowcasePetId = 'nailong' | 'feiyu'

const PET_SHOWCASE_DATA: Record<
  ShowcasePetId,
  {
    name: string
    role: string
    feedBtn: string
    moods: Array<{
      img: string
      tag: string
      quote: string
      voice: string
    }>
  }
> = {
  feiyu: {
    name: '大肥鱼',
    role: 'DeepSeek 算力伴学鲸 · 投喂白米饭',
    feedBtn: '试听语音并投喂米饭',
    moods: [
      {
        img: '/pets/feiyu_happy.webp',
        tag: '满血伴学状态',
        quote: '不懂的高数中值定理证明题，随时拖进随身窗，我陪你一步步推出来。',
        voice: '/pets/voices/feiyu_intro.mp3',
      },
      {
        img: '/pets/feiyu_eating.webp',
        tag: '算力充能时刻',
        quote: '吃完这碗热腾腾的大白米饭，马上帮你把整章操作系统的错因双链梳理清楚。',
        voice: '/pets/voices/feiyu_eat_rice.mp3',
      },
      {
        img: '/pets/feiyu_dance.webp',
        tag: '连对激励反馈',
        quote: '连续三道真题全对！节奏稳得漂亮，保持这个手感直奔考场。',
        voice: '/pets/voices/feiyu_praise_streak.mp3',
      },
    ],
  },
  nailong: {
    name: '奶龙',
    role: '暖心情绪陪伴 · 投喂烤鸡腿',
    feedBtn: '试听语音并投喂鸡腿',
    moods: [
      {
        img: '/pets/nailong_wave.webp',
        tag: '清晨迎新问候',
        quote: '嗨！今天复盘完这一组待背闪卡，离目标院校就又扎实迈进了一步。',
        voice: '/pets/voices/nailong_2.mp3',
      },
      {
        img: '/pets/nailong_focus.webp',
        tag: '深度心流陪伴',
        quote: '这道 408 综合应用题虽然长，拆成三个小问逐个踩分，一定能拿下。',
        voice: '/pets/voices/nailong_focus_start.mp3',
      },
      {
        img: '/pets/nailong_happy.webp',
        tag: '阶段达成庆祝',
        quote: '太棒啦！精准避开所有干扰项，今晚开一轮番茄白噪音好好放松一下吧。',
        voice: '/pets/voices/nailong_focus_done.mp3',
      },
    ],
  },
}

const GALLERY_SLIDES: Array<{
  id: GallerySlideId
  title: string
  subtitle: string
  targetPath: string
}> = [
  {
    id: 'graph',
    title: '双链知识网络与掌握度拓扑',
    subtitle: '哪些考点已经融会贯通、哪些仍是薄弱孤岛，一张三维交互星图清晰呈现。',
    targetPath: '/graph',
  },
  {
    id: 'editor',
    title: '出版级公式排版与双栏精读',
    subtitle: '原生兼容本地 Obsidian Markdown 语法，微积分矩阵推导与真题错因无缝双链。',
    targetPath: '/editor',
  },
  {
    id: 'quiz',
    title: '全真模考卷面与分步启发导师',
    subtitle: '还原统考真实卷面感，大题卡壳时提供苏格拉底式逐级提示而非生硬剧透答案。',
    targetPath: '/quiz',
  },
  {
    id: 'pomodoro',
    title: '沉浸心流计时与多轨环境混音',
    subtitle: '隔绝外界信息噪音，忠实记录你每一个专注番茄与长周期备考热力。',
    targetPath: '/pomodoro',
  },
]

const SPECTRUM_BARS = [
  { h: '28%', bg: 'bg-[#d2d2d7]' },
  { h: '36%', bg: 'bg-[#c7c7cc]' },
  { h: '44%', bg: 'bg-[#aeaeb2]' },
  { h: '52%', bg: 'bg-[#8e8e93]' },
  { h: '60%', bg: 'bg-[#6eb5ff]' },
  { h: '68%', bg: 'bg-[#409cff]' },
  { h: '76%', bg: 'bg-[#0071e3]' },
  { h: '84%', bg: 'bg-[#005bb5]' },
  { h: '90%', bg: 'bg-[#3634a3]' },
  { h: '95%', bg: 'bg-[#1d1d1f]' },
  { h: '100%', bg: 'bg-[#000000]' },
]

export function InteractiveBentoShowcase({
  isAuthenticated,
  onLaunchModule,
  onOpenRegister,
  mode = 'both',
}: InteractiveBentoShowcaseProps) {
  const [hubCategory, setHubCategory] = useState<HubCategory>('all')
  const [hubSearch, setHubSearch] = useState('')

  // SM-2 闪卡微交互状态
  const [cardIdx, setCardIdx] = useState(0)
  const [cardFlipped, setCardFlipped] = useState(false)
  const [scheduledHint, setScheduledHint] = useState<string | null>(null)

  // 双宠微交互状态
  const [selectedPet, setSelectedPet] = useState<ShowcasePetId>('feiyu')
  const [moodIdx, setMoodIdx] = useState(0)
  const [playingVoice, setPlayingVoice] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 实景画廊状态
  const [slideIdx, setSlideIdx] = useState(0)

  const filteredHubItems = HUB_PORTAL_ITEMS.filter((item) => {
    const matchCat = hubCategory === 'all' || item.category === hubCategory
    if (!matchCat) return false
    if (!hubSearch.trim()) return true
    const q = hubSearch.toLowerCase().trim()
    return (
      item.label.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.eyebrow.toLowerCase().includes(q)
    )
  })

  const currentCard = DEMO_FLASHCARDS[cardIdx]
  const petConfig = PET_SHOWCASE_DATA[selectedPet]
  const currentMood = petConfig.moods[moodIdx % petConfig.moods.length]
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
    setScheduledHint(`已记录「${ratingLabel}」· 下次复习：${nextInterval}`)
    setTimeout(() => {
      setCardFlipped(false)
      setCardIdx((prev) => (prev + 1) % DEMO_FLASHCARDS.length)
    }, 850)
  }

  const playPetVoice = (voiceUrl: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(voiceUrl)
      audio.volume = 0.68
      audioRef.current = audio
      setPlayingVoice(true)
      audio.onended = () => setPlayingVoice(false)
      audio.onerror = () => setPlayingVoice(false)
      audio.play().catch(() => setPlayingVoice(false))
    } catch {
      setPlayingVoice(false)
    }
  }

  const handleSwitchPet = (petId: ShowcasePetId) => {
    setSelectedPet(petId)
    setMoodIdx(0)
    if (audioRef.current) {
      audioRef.current.pause()
      setPlayingVoice(false)
    }
  }

  const handleInteractPet = (withAudio = false) => {
    const moods = PET_SHOWCASE_DATA[selectedPet].moods
    const nextIdx = (moodIdx + 1) % moods.length
    setMoodIdx(nextIdx)
    if (withAudio) {
      playPetVoice(moods[nextIdx].voice)
    }
  }

  return (
    <>
      {/* =====================================================================
          模块一：Apple Highlights 风格全景研学空间导航 (#hub · 浅钛灰 #F5F5F7 画布)
         ===================================================================== */}
      {mode !== 'features-only' && (
        <section id="hub" className="w-full min-w-0 apple-section-gray py-20 sm:py-28">
          <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8">
            {/* 顶部标题与分段筛选条 */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
              <div className="text-left max-w-xl">
                <p className="text-xs sm:text-[13px] font-semibold tracking-wider text-[#6e6e73] mb-2">
                  全景工作台导览
                </p>
                <h2 className="apple-section-headline text-[#1d1d1f]">
                  十座专业舱室，一触即达。
                </h2>
                <p className="mt-3 text-sm sm:text-[15px] text-[#6e6e73] landing-pretty-copy">
                  {isAuthenticated
                    ? '点选任意模块即可切入对应研学空间，进度实时云端接力。'
                    : '点选任意模块即可创建专属知识沙盒并直达目标空间，试玩记录自动继承。'}
                </p>
              </div>

              {/* Apple 风格圆角搜索胶囊 + 分段控制器 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 self-start lg:self-auto w-full lg:w-auto">
                <div className="relative sm:w-48">
                  <Search
                    className="w-3.5 h-3.5 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={hubSearch}
                    onChange={(e) => setHubSearch(e.target.value)}
                    placeholder="搜索功能舱..."
                    aria-label="搜索研学功能舱室"
                    className="w-full min-h-9 pl-9 pr-8 py-1.5 rounded-full bg-white border border-black/[0.06] text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/25 focus:border-[#0071e3]"
                  />
                  {hubSearch && (
                    <button
                      type="button"
                      onClick={() => setHubSearch('')}
                      aria-label="清空搜索"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#86868b] hover:text-[#1d1d1f] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div
                  role="group"
                  aria-label="功能舱分类过滤"
                  className="apple-segmented-track max-w-full overflow-x-auto no-scrollbar"
                >
                  {[
                    { id: 'all' as const, label: '全部' },
                    { id: 'exam' as const, label: '真题实战' },
                    { id: 'memory' as const, label: '记忆与图谱' },
                    { id: 'focus' as const, label: '精读与心流' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={hubCategory === tab.id}
                      onClick={() => setHubCategory(tab.id)}
                      className={`apple-segmented-pill whitespace-nowrap cursor-pointer ${
                        hubCategory === tab.id ? 'apple-segmented-pill-active' : ''
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 第一排：非对称 7:5 旗舰双卡（深空黑 AI 中枢 + 纯白 11 级考点色谱） */}
            {hubCategory === 'all' && !hubSearch.trim() && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
                {/* 左旗舰 (7 列)：深空黑 AI 导师思考流 */}
                <button
                  type="button"
                  onClick={() => onLaunchModule('/chat', '分科 AI 导师思考流工作台')}
                  className="cinema-dark-lock lg:col-span-7 group apple-tile-dark p-7 sm:p-9 text-left flex flex-col justify-between gap-7 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 max-w-lg">
                      <p className="text-xs font-semibold tracking-wider text-[#86868b]">
                        AI 伴学中枢 · 零缓冲思考流
                      </p>
                      <h3 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.03em] leading-[1.16] text-[#f5f5f7]">
                        四科导师同台会诊，
                        <br className="hidden sm:inline" />
                        每一步破题皆有迹可循。
                      </h3>
                      <p className="text-[13.5px] sm:text-sm text-[#a1a1a6] leading-relaxed pt-1">
                        内置研小核、数小通、英小研、政小思专属智能体，支持 DeepSeek 深度推理链逐字直出、划词追问与本机 CLI 桥接。
                      </p>
                    </div>

                    <span className="apple-circle-action-dark shrink-0" aria-hidden="true">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  {/* 微缩 Apple 风格推理脉络视窗 */}
                  <div className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-[#f5f5f7] font-medium">
                        <Bot className="w-4 h-4 text-[#2997ff]" aria-hidden="true" />
                        <span>深度推理链已展开</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#86868b]">Ctrl + Shift + A</span>
                    </div>
                    <div className="pl-3 border-l border-[#2997ff]/50 text-xs text-[#a1a1a6] leading-relaxed">
                      先由分母等价无穷小确定阶数为 3 阶，再将分子泰勒展开至 x³ 项消去低阶项……
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {['研小核 · 408', '数小通 · 数学', '英小研 · 英语', '政小思 · 政治', '双宠随身窗'].map(
                        (tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-full bg-white/[0.06] text-[11px] font-medium text-[#d2d2d7]"
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </button>

                {/* 右旗舰 (5 列)：纯白 11 级考点色谱与 PDF 精读 */}
                <button
                  type="button"
                  onClick={() => onLaunchModule('/study?tab=mastery', '11级考点色谱与PDF智能提取')}
                  className="lg:col-span-5 group apple-tile-white p-7 sm:p-9 text-left flex flex-col justify-between gap-7 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold tracking-wider text-[#6e6e73]">
                        11 级考点色谱 · PDF 伴读
                      </p>
                      <h3 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.03em] leading-[1.16] text-[#1d1d1f]">
                        讲义自动抽卡，
                        <br />
                        薄弱靶点一眼看穿。
                      </h3>
                      <p className="text-[13.5px] sm:text-sm text-[#6e6e73] leading-relaxed pt-1">
                        从基础概念到压轴综合 11 阶难度量化分层，支持上传 PDF 辅导书双栏伴读并一键提取自测题与闪卡。
                      </p>
                    </div>

                    <span className="apple-circle-action shrink-0" aria-hidden="true">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  {/* 微缩 11 阶光谱高度条视觉组件 */}
                  <div className="w-full rounded-2xl bg-[#f5f5f7] p-4 sm:p-5">
                    <div className="flex items-end justify-between gap-1.5 h-16 px-1">
                      {SPECTRUM_BARS.map((bar, idx) => (
                        <div
                          key={idx}
                          style={{ height: bar.h }}
                          className={`flex-1 rounded-full ${bar.bg} transition-transform duration-300 group-hover:scale-y-105 origin-bottom`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#86868b] mt-3 pt-2.5 border-t border-black/[0.05]">
                      <span>Lv.1 基础识记</span>
                      <span className="text-[#0066cc] font-semibold">22 大统考知识域</span>
                      <span>Lv.11 压轴综合</span>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* 第二、三排：八大纯净无框 Bento 功能舱 */}
            {filteredHubItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {filteredHubItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => onLaunchModule(item.path, item.label)}
                      className="group apple-tile-white p-6 sm:p-7 text-left flex flex-col justify-between gap-6 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-3 w-full">
                        <div className="w-11 h-11 rounded-2xl bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                        </div>
                        <span className="apple-circle-action shrink-0" aria-hidden="true">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>

                      <div className="space-y-1.5 w-full min-w-0">
                        <p className="text-[11.5px] font-medium text-[#86868b] truncate">
                          {item.eyebrow}
                        </p>
                        <h3 className="text-[18px] sm:text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f] leading-snug">
                          {item.label}
                        </h3>
                        <p className="text-[13px] text-[#6e6e73] leading-relaxed line-clamp-3 landing-pretty-copy pt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="apple-tile-white p-12 text-center space-y-3">
                <p className="text-sm text-[#6e6e73]">未找到匹配「{hubSearch}」的功能舱室</p>
                <button
                  type="button"
                  onClick={() => {
                    setHubSearch('')
                    setHubCategory('all')
                  }}
                  className="text-sm font-medium text-[#0066cc] hover:underline cursor-pointer"
                >
                  显示全部十座舱室
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================================
          模块二：Apple Pro 深空黑剧场 (#features · 纯黑 #000000 沉浸交互画廊)
         ===================================================================== */}
      {mode !== 'hub-only' && (
        <section id="features" className="cinema-dark-lock apple-section-dark w-full min-w-0 py-20 sm:py-28">
          <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <p className="text-xs sm:text-[13px] font-semibold tracking-wider text-[#86868b] mb-2.5">
                交互黑科技体验
              </p>
              <h2 className="apple-section-headline text-[#f5f5f7]">
                记忆科学与温暖陪伴，在此交汇。
              </h2>
              <p className="mt-3.5 text-sm sm:text-base text-[#a1a1a6] landing-pretty-copy">
                无需离开页面，直接翻转下方真题闪卡、试听双宠真人语音，或切换预览真实研学视窗。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
              {/* ── 左上 (7 列)：SM-2 艾宾浩斯真题闪卡微件 ── */}
              <div className="lg:col-span-7 apple-tile-dark p-6 sm:p-8 flex flex-col justify-between gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.08] text-[#f5f5f7] flex items-center justify-center shrink-0">
                      <Layers className="w-4.5 h-4.5" aria-hidden="true" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-base sm:text-[17px] font-semibold text-[#f5f5f7] tracking-[-0.015em]">
                        SM-2 艾宾浩斯记忆闪卡
                      </h3>
                      <p className="text-xs text-[#86868b]">轻点卡片翻转查看解析与记忆锚点</p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.08]">
                    {DEMO_FLASHCARDS.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCardIdx(i)
                          setCardFlipped(false)
                          setScheduledHint(null)
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          cardIdx === i
                            ? 'bg-[#f5f5f7] text-[#1d1d1f]'
                            : 'text-[#a1a1a6] hover:text-white'
                        }`}
                      >
                        0{i + 1}
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
                  className={`w-full min-h-[208px] rounded-2xl p-5 sm:p-6 text-left flex flex-col justify-between transition-all duration-300 cursor-pointer select-none border ${
                    cardFlipped
                      ? 'bg-[#132033] border-[#2997ff]/40 text-[#f5f5f7]'
                      : 'bg-white/[0.04] hover:bg-white/[0.06] border-white/[0.08] text-[#f5f5f7]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#2997ff] font-medium">{currentCard.subject}</span>
                    <span className="inline-flex items-center gap-1.5 text-[#86868b]">
                      <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{cardFlipped ? '核心解析' : '点击翻面'}</span>
                    </span>
                  </div>

                  {!cardFlipped ? (
                    <div className="my-4 text-[15px] sm:text-[17px] font-medium leading-relaxed text-[#f5f5f7]">
                      {currentCard.question}
                    </div>
                  ) : (
                    <div className="my-3 space-y-3">
                      <p className="text-xs sm:text-[14px] leading-relaxed text-[#e8e8ed]">
                        {currentCard.answer}
                      </p>
                      <div className="px-3.5 py-2 rounded-xl bg-white/[0.06] text-xs font-medium text-[#64d2ff]">
                        {currentCard.mnemonic}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-[#86868b] flex items-center justify-between">
                    <span>自动关联错题双链</span>
                    <span>轻触任意处翻转</span>
                  </div>
                </div>

                {/* 掌握度自评栏 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    {[
                      { label: '生疏 · 10分钟', rate: '生疏重来', next: '10 分钟后' },
                      { label: '模糊 · 1天后', rate: '有点模糊', next: '明日清晨' },
                      { label: '熟练 · 4天后', rate: '稳稳掌握', next: '4 天后' },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => handleRateCard(btn.rate, btn.next)}
                        className="min-h-9 py-2 px-3 rounded-full bg-white/[0.07] hover:bg-white/[0.14] text-[#f5f5f7] text-xs font-medium transition-colors cursor-pointer"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {scheduledHint ? (
                    <span className="text-xs text-[#30d158] font-medium">{scheduledHint}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenRegister('开启个人专属艾宾浩斯每日复习队列')}
                      className="inline-flex items-center gap-0.5 text-xs font-medium text-[#2997ff] hover:underline cursor-pointer shrink-0"
                    >
                      <span>开启记忆队列</span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── 右上 (5 列)：大肥鱼 × 奶龙 双宠伴学语音舱 ── */}
              <div className="lg:col-span-5 apple-tile-dark p-6 sm:p-8 flex flex-col justify-between gap-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-left">
                    <h3 className="text-base sm:text-[17px] font-semibold text-[#f5f5f7] tracking-[-0.015em]">
                      双宠语音伴学与随身聊
                    </h3>
                    <p className="text-xs text-[#86868b] mt-0.5">30+ 真人配音 · 八向缩放随身 AI 窗</p>
                  </div>

                  <div className="inline-flex items-center p-1 rounded-full bg-white/[0.08] text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => handleSwitchPet('feiyu')}
                      className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        selectedPet === 'feiyu'
                          ? 'bg-[#f5f5f7] text-[#1d1d1f]'
                          : 'text-[#a1a1a6] hover:text-white'
                      }`}
                    >
                      大肥鱼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchPet('nailong')}
                      className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        selectedPet === 'nailong'
                          ? 'bg-[#f5f5f7] text-[#1d1d1f]'
                          : 'text-[#a1a1a6] hover:text-white'
                      }`}
                    >
                      奶龙
                    </button>
                  </div>
                </div>

                {/* 纯净暗幕聚光立绘舞台 */}
                <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 flex flex-col sm:flex-row items-center gap-5">
                  <button
                    type="button"
                    onClick={() => handleInteractPet(true)}
                    className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                    aria-label={`点击试听${petConfig.name}伴学语音`}
                  >
                    <img
                      src={currentMood.img}
                      alt={currentMood.tag}
                      width={92}
                      height={92}
                      loading="lazy"
                      decoding="async"
                      className="w-20 h-20 sm:w-22 sm:h-22 object-contain"
                    />
                  </button>

                  <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
                    <div className="text-xs font-medium text-[#2997ff]">
                      {currentMood.tag} · {petConfig.name}
                    </div>
                    <p className="text-[13.5px] text-[#f5f5f7] leading-relaxed landing-pretty-copy">
                      “{currentMood.quote}”
                    </p>
                    <p className="text-[11px] text-[#86868b]">{petConfig.role}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleInteractPet(true)}
                    className="flex-1 min-h-10 py-2.5 px-4 rounded-full bg-[#f5f5f7] hover:bg-white text-[#1d1d1f] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Volume2
                      className={`w-3.5 h-3.5 text-[#0071e3] shrink-0 ${playingVoice ? 'animate-pulse' : ''}`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{playingVoice ? '正在播放伴学语音...' : petConfig.feedBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenRegister(`注册即可在工作台领养${petConfig.name}并开启随身聊窗口`)
                    }
                    className="min-h-10 py-2.5 px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[#f5f5f7] text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>领养至桌面</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#86868b]" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* ── 下方通栏 (12 列)：真实工作台四维实景剧场 ── */}
              <div className="lg:col-span-12 apple-tile-dark p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-10 items-center">
                <div className="lg:col-span-5 text-left space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-wider text-[#2997ff]">
                      工作台实景预览
                    </p>
                    <h3 className="text-xl sm:text-[26px] font-semibold text-[#f5f5f7] tracking-[-0.025em] leading-tight">
                      {currentSlide.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed landing-pretty-copy">
                      {currentSlide.subtitle}
                    </p>
                  </div>

                  <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                    {GALLERY_SLIDES.map((slide, i) => {
                      const active = slideIdx === i
                      return (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setSlideIdx(i)}
                          className={`w-full py-3.5 px-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                            active ? 'text-[#f5f5f7]' : 'text-[#86868b] hover:text-[#d2d2d7]'
                          }`}
                        >
                          <span className="text-[13.5px] sm:text-sm font-medium truncate">
                            {slide.title}
                          </span>
                          <span
                            className={`text-xs font-mono shrink-0 ${
                              active ? 'text-[#2997ff]' : 'text-[#6e6e73]'
                            }`}
                          >
                            0{i + 1}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => onLaunchModule(currentSlide.targetPath, currentSlide.title)}
                      className="apple-btn-blue text-xs sm:text-sm cursor-pointer"
                    >
                      <span>{isAuthenticated ? '进入该工作台' : '开启该功能空间'}</span>
                      <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <span className="text-xs text-[#86868b]">支持本地 Markdown 随时导出</span>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="rounded-2xl bg-[#0b0b0d] p-2 sm:p-2.5 border border-white/[0.1] shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 pb-2 text-[11px] text-[#86868b]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                        <span className="ml-2 text-[#a1a1a6] truncate">{currentSlide.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#6e6e73]">CoreForge Studio</span>
                    </div>
                    <div className="w-full rounded-xl overflow-hidden bg-slate-950 border border-white/[0.06]">
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
