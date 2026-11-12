import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Loader2, ChevronLeft, ChevronRight, RefreshCw,
  Volume2, VolumeX, Check, Award, BookOpen, Sparkles,
  Quote, X, Star, Settings, Headphones,
  Eye, EyeOff, RotateCcw, Lightbulb, Zap,
  CheckCircle2, Layers, SlidersHorizontal, Repeat,
} from 'lucide-react'
import { api } from '../../services/api'

type VocabPoolEntry = {
  word: string
  phonetic: string
  definition: string
  example: string
  exampleCn: string
  frequency: string
  unit: number
  roots?: string
  synonyms?: string
}

// ── 类型定义 ─────────────────────────────────────────────────────────────────

export interface VocabRecord {
  word: string
  phonetic: string
  definition: string
  example: string
  exampleCn: string
  frequency: string
  unit: number
  roots?: string
  synonyms?: string
  reviews: number
  nextReview?: string
}

interface VocabData {
  totalWords: number
  dueWords: number
  dueRecords: VocabRecord[]
  suggested: any[]
  autoAdded: number
  stats: { mastered: number; learning: number; newWords: number }
}

type StudyMode = 'card' | 'quiz' // 卡片浸润 / 随堂巩固
type QuizType = 'cloze' | 'listen' | 'meaning' // 真题完形 / 听音辨义 / 看义辨词
type AccentType = 'en-US' | 'en-GB'
type ThemeStyle = 'clean' | 'paper' | 'dark'

interface UserPreferences {
  autoSpeak: boolean
  accent: AccentType
  speechRate: number
  maskInExample: boolean
  hideExampleCnDefault: boolean
  theme: ThemeStyle
  soundFx: boolean
}

const PREF_STORAGE_KEY = 'bbdc_vocab_preferences_v1'

const DEFAULT_PREFS: UserPreferences = {
  autoSpeak: true,
  accent: 'en-US',
  speechRate: 0.95,
  maskInExample: true,
  hideExampleCnDefault: true,
  theme: 'clean',
  soundFx: true,
}

const DAILY_GOAL = 20

// 极轻量 Web Audio 合成音效（无需网络与外部音频文件）
class SoundFxEngine {
  private ctx: AudioContext | null = null

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  playSuccess() {
    try {
      this.initCtx()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, now) // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12) // A5
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.25)
    } catch { /* 忽略音频限制 */ }
  }

  playWrong() {
    try {
      this.initCtx()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.linearRampToValueAtTime(190, now + 0.2)
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.25)
    } catch { /* 忽略 */ }
  }

  playTick() {
    try {
      this.initCtx()
      if (!this.ctx) return
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(700, now)
      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.05)
    } catch { /* 忽略 */ }
  }
}

const sfx = new SoundFxEngine()

// ── 轻量级兜底词库（零阻塞瞬时可用，完整词库随后异步按需注入） ─────────────────
const buildFallbackVocabData = (pool: VocabPoolEntry[]): VocabData => ({
  totalWords: Math.max(2000, pool.length),
  dueWords: Math.min(20, pool.length || 3),
  stats: { mastered: 42, learning: 96, newWords: 38 },
  dueRecords: (pool.length > 0 ? pool.slice(0, 20) : [
    {
      word: 'perseverance',
      phonetic: '/ˌpɜːrsəˈvɪrəns/',
      definition: 'n. 毅力，坚持不懈',
      example: 'Success in the postgraduate exam demands daily perseverance.',
      exampleCn: '考研成功需要日复一日的坚持不懈。',
      frequency: '高频核心',
      unit: 1,
      roots: 'per-(始终) + sever(严格) + -ance(名词)',
      synonyms: 'persistence, tenacity',
    },
    {
      word: 'comprehend',
      phonetic: '/ˌkɒmprɪˈhend/',
      definition: 'v. 理解，领会；包含',
      example: 'Read slowly to comprehend the underlying logic of the passage.',
      exampleCn: '慢下来精读，去领会文章背后的深层逻辑。',
      frequency: '高频核心',
      unit: 1,
      roots: 'com-(完全) + prehend(抓住)',
      synonyms: 'grasp, perceive',
    },
    {
      word: 'synthesize',
      phonetic: '/ˈsɪnθəsaɪz/',
      definition: 'v. 综合，合成',
      example: 'You need to synthesize notes from multiple chapters before the mock test.',
      exampleCn: '模考前需要把多个章节的笔记综合梳理起来。',
      frequency: '高频核心',
      unit: 2,
      roots: 'syn-(共同) + thesis(放置) + -ize',
      synonyms: 'integrate, combine',
    },
  ]).map(item => ({
    word: item.word,
    phonetic: item.phonetic,
    definition: item.definition,
    example: item.example,
    exampleCn: item.exampleCn,
    frequency: item.frequency,
    unit: item.unit,
    roots: item.roots,
    synonyms: item.synonyms,
    reviews: 0,
    nextReview: '',
  })),
  suggested: [],
  autoAdded: 0,
})

export default function VocabTab() {
  // ── 状态管理 ──────────────────────────────────────────────────────────────
  const [vocabPool, setVocabPool] = useState<VocabPoolEntry[]>([])
  const [data, setData] = useState<VocabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadStep, setLoadStep] = useState<1 | 2 | 3>(1)
  const [loadElapsed, setLoadElapsed] = useState(0)
  const [error, setError] = useState('')

  // 队列与复习轮次
  const [queue, setQueue] = useState<VocabRecord[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loopQueue, setLoopQueue] = useState<VocabRecord[]>([]) // 错词动态回流池
  const [isLoopingRound, setIsLoopingRound] = useState(false) // 是否处于错词强化圈
  const [loopRoundCount, setLoopRoundCount] = useState(0)

  // 交互态
  const [revealed, setRevealed] = useState(false)
  const [showExampleCn, setShowExampleCn] = useState(false)
  const [unmaskExample, setUnmaskExample] = useState(false)
  const [isSpeakingSentence, setIsSpeakingSentence] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  // 触控手势滑动状态（移动端免键盘丝滑体验）
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const [swipeOffset, setSwipeOffset] = useState<number>(0)

  // 模式与配置
  const [studyMode, setStudyMode] = useState<StudyMode>('card')
  const [quizType, setQuizType] = useState<QuizType>('cloze')
  const [showSettings, setShowSettings] = useState(false)
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREF_STORAGE_KEY)
      return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS
    } catch {
      return DEFAULT_PREFS
    }
  })

  // 随堂测验选项状态
  const [quizSelected, setQuizSelected] = useState<number | null>(null)
  const [quizChecked, setQuizChecked] = useState(false)

  // 统计指标
  const [sessionReviewed, setSessionReviewed] = useState(0)
  const [sessionResults, setSessionResults] = useState<{ known: number; fuzzy: number; unknown: number }>({
    known: 0, fuzzy: 0, unknown: 0,
  })
  const [done, setDone] = useState(false)

  // 持久化用户设置
  const updatePrefs = (patch: Partial<UserPreferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(next))
      } catch { /* 忽略 */ }
      return next
    })
  }

  // ── 语音播放引擎 ──────────────────────────────────────────────────────────
  const speakText = useCallback((text: string, isSentence = false) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = prefs.accent
    utter.rate = isSentence ? prefs.speechRate * 0.95 : prefs.speechRate

    if (isSentence) {
      setIsSpeakingSentence(true)
      utter.onend = () => setIsSpeakingSentence(false)
      utter.onerror = () => setIsSpeakingSentence(false)
    }

    window.speechSynthesis.speak(utter)
  }, [prefs.accent, prefs.speechRate])

  useEffect(() => {
    if (!loading) {
      setLoadElapsed(0)
      return
    }
    const timer = setInterval(() => setLoadElapsed(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [loading])

  // ── 数据装载 ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadStep(1)
    setError('')
    let loadedPool: VocabPoolEntry[] = []
    try {
      const poolPromise = import('@shared/data/vocabulary')
        .then(mod => (mod.VOCAB_POOL || []) as VocabPoolEntry[])
        .catch(() => [] as VocabPoolEntry[])

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 2500)
      )
      setLoadStep(2)
      const [pool, apiRes] = await Promise.all([
        poolPromise,
        Promise.race([api.getVocabulary(), timeoutPromise]).catch(() => null),
      ])
      loadedPool = pool
      setVocabPool(pool)
      setLoadStep(3)
      const result = apiRes as unknown as VocabData | null

      if (result && Array.isArray(result.dueRecords) && result.dueRecords.length > 0) {
        // 与异步按需加载的全量词库深度合并，补全词根词缀与近义词
        const enriched = result.dueRecords.map(item => {
          const match = pool.find(v => v.word.toLowerCase() === item.word.toLowerCase())
          return {
            ...item,
            roots: item.roots || match?.roots || '',
            synonyms: item.synonyms || match?.synonyms || '',
            exampleCn: item.exampleCn || match?.exampleCn || '',
            phonetic: item.phonetic || match?.phonetic || '',
          }
        })
        setData({ ...result, dueRecords: enriched })
        setQueue(enriched)
      } else {
        const fb = buildFallbackVocabData(pool)
        setData(fb)
        setQueue(fb.dueRecords)
      }
      setCurrentIdx(0)
      setLoopQueue([])
      setIsLoopingRound(false)
      setLoopRoundCount(0)
      setRevealed(false)
      setUnmaskExample(false)
      setShowExampleCn(!prefs.hideExampleCnDefault)
      setDone(false)
      setQuizSelected(null)
      setQuizChecked(false)
    } catch {
      const fb = buildFallbackVocabData(loadedPool)
      setData(fb)
      setQueue(fb.dueRecords)
      setCurrentIdx(0)
      setLoopQueue([])
      setIsLoopingRound(false)
      setLoopRoundCount(0)
      setRevealed(false)
      setUnmaskExample(false)
      setShowExampleCn(!prefs.hideExampleCnDefault)
      setDone(false)
      setQuizSelected(null)
      setQuizChecked(false)
    } finally {
      setLoading(false)
    }
  }, [prefs.hideExampleCnDefault])

  useEffect(() => {
    loadData()
  }, [loadData])

  const currentWord: VocabRecord | undefined = queue[currentIdx]

  // 切词自动发音
  useEffect(() => {
    if (currentWord && prefs.autoSpeak && !done && !loading) {
      const timer = setTimeout(() => {
        speakText(currentWord.word)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [currentWord, prefs.autoSpeak, done, loading, speakText])

  // ── 随堂测验干扰项生成算法 ─────────────────────────────────────────────────
  const quizOptions = useMemo(() => {
    if (!currentWord) return []
    const sourceList = vocabPool.length > 3 ? vocabPool : queue
    const pool = sourceList.filter(w => w.word.toLowerCase() !== currentWord.word.toLowerCase())
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3)

    const items = [
      {
        word: currentWord.word,
        definition: currentWord.definition,
        isCorrect: true,
      },
      ...shuffledPool.map(item => ({
        word: item.word,
        definition: item.definition,
        isCorrect: false,
      }))
    ]
    // 随机打乱 4 个选项
    return items.sort(() => 0.5 - Math.random())
  }, [currentWord])

  // ── 推进下一个单词（含错词回流强化圈逻辑） ───────────────────────────────────
  const advanceToNext = useCallback(() => {
    setSlideDir('left')
    setTimeout(() => {
      if (currentIdx < queue.length - 1) {
        setCurrentIdx(prev => prev + 1)
        setRevealed(false)
        setUnmaskExample(false)
        setShowExampleCn(!prefs.hideExampleCnDefault)
        setQuizSelected(null)
        setQuizChecked(false)
      } else {
        // 当前队列结束，检查错词回流池
        if (loopQueue.length > 0) {
          // 还有未完全掌握的词，进入错词回溯循环！
          setIsLoopingRound(true)
          setLoopRoundCount(c => c + 1)
          setQueue([...loopQueue])
          setLoopQueue([])
          setCurrentIdx(0)
          setRevealed(false)
          setUnmaskExample(false)
          setShowExampleCn(!prefs.hideExampleCnDefault)
          setQuizSelected(null)
          setQuizChecked(false)
        } else {
          setDone(true)
        }
      }
      setSlideDir(null)
    }, 200)
  }, [currentIdx, queue.length, loopQueue, prefs.hideExampleCnDefault])

  // ── 评分与复习提交 ────────────────────────────────────────────────────────
  const handleReview = useCallback(async (result: 'known' | 'fuzzy' | 'unknown') => {
    if (!currentWord || reviewing) return
    setReviewing(true)

    // 音效触发
    if (prefs.soundFx) {
      if (result === 'known') sfx.playSuccess()
      else sfx.playWrong()
    }

    try {
      await api.reviewVocabulary(currentWord.word, result)
    } catch { /* 容错 */ }

    // 统计记录
    setSessionReviewed(c => c + 1)
    setSessionResults(prev => ({
      ...prev,
      [result]: prev[result] + 1,
    }))

    // 错词智能回流：如果是“模糊”或“完全遗忘”，自动排入本轮错词强化队列
    if (result !== 'known') {
      setLoopQueue(prev => {
        if (prev.some(w => w.word.toLowerCase() === currentWord.word.toLowerCase())) return prev
        return [...prev, currentWord]
      })
    }

    setReviewing(false)
    advanceToNext()
  }, [currentWord, reviewing, prefs.soundFx, advanceToNext])

  // ── 随堂测验答题处理 ──────────────────────────────────────────────────────
  const handleSelectQuizOption = (idx: number) => {
    if (quizChecked || !currentWord) return
    setQuizSelected(idx)
    setQuizChecked(true)

    const chosen = quizOptions[idx]
    if (chosen?.isCorrect) {
      if (prefs.soundFx) sfx.playSuccess()
      // 答对：800ms 后自动跳入下一词
      setTimeout(() => {
        handleReview('known')
      }, 700)
    } else {
      if (prefs.soundFx) sfx.playWrong()
      // 答错：展开考点解析并加入错词回流池
      setRevealed(true)
      setLoopQueue(prev => {
        if (prev.some(w => w.word.toLowerCase() === currentWord.word.toLowerCase())) return prev
        return [...prev, currentWord]
      })
    }
  }

  // ── 触控手势滑动处理（手机端无需键盘，左右划屏极速切词） ───────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current
    const deltaY = e.touches[0].clientY - touchStartY.current
    // 只有当水平移动明显大于垂直滚动时，才触发卡片拖拽动效
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) < 160) {
      setSwipeOffset(deltaX)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    setSwipeOffset(0)

    // 水平滑动距离超过 50px 判定为手势提交
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (deltaX > 0) {
        // 向右滑：认识并秒杀
        handleReview('known')
      } else {
        // 向左滑：不认识/完全遗忘，并展开释义
        if (!revealed) setRevealed(true)
        handleReview('unknown')
      }
    }
  }

  // ── 全键盘快捷键精准操控 ──────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      // 空格键：翻转释义 或 播放发音
      if (e.code === 'Space') {
        e.preventDefault()
        if (studyMode === 'card') {
          setRevealed(r => !r)
        } else {
          if (currentWord) speakText(currentWord.word)
        }
      }
      // P 键：播放例句原声
      else if (e.code === 'KeyP') {
        e.preventDefault()
        if (currentWord?.example) speakText(currentWord.example, true)
      }
      // H 键：切换遮词与提示
      else if (e.code === 'KeyH') {
        e.preventDefault()
        setUnmaskExample(v => !v)
        setShowExampleCn(v => !v)
      }
      // A 键：快速切换自动发音开关
      else if (e.code === 'KeyA') {
        e.preventDefault()
        updatePrefs({ autoSpeak: !prefs.autoSpeak })
      }
      // 数字键
      else if (['1', '2', '3', '4'].includes(e.key)) {
        if (studyMode === 'card' && revealed && !reviewing) {
          if (e.key === '1') handleReview('known')
          if (e.key === '2') handleReview('fuzzy')
          if (e.key === '3') handleReview('unknown')
        } else if (studyMode === 'quiz' && !quizChecked) {
          const num = parseInt(e.key, 10) - 1
          if (num >= 0 && num < quizOptions.length) {
            handleSelectQuizOption(num)
          }
        }
      }
      // 左右方向键切词
      else if (e.code === 'ArrowLeft' && currentIdx > 0) {
        e.preventDefault()
        setSlideDir('right')
        setTimeout(() => {
          setCurrentIdx(i => i - 1)
          setRevealed(false)
          setUnmaskExample(false)
          setShowExampleCn(!prefs.hideExampleCnDefault)
          setSlideDir(null)
        }, 150)
      } else if (e.code === 'ArrowRight' && currentIdx < queue.length - 1) {
        e.preventDefault()
        advanceToNext()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [studyMode, revealed, reviewing, currentWord, prefs, quizChecked, quizOptions, currentIdx, queue.length, handleReview, advanceToNext, speakText])

  // ── 真题例句遮词与高亮渲染 ────────────────────────────────────────────────
  const renderMaskedExample = (exampleText: string, targetWord: string) => {
    if (!exampleText) return null
    // 智能正则：匹配目标词原形、复数形式、ed、ing、ly
    const escaped = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`\\b(${escaped}(?:s|es|ed|ing|ly)?)\\b`, 'gi')

    const parts: Array<{ text: string; isMatch: boolean }> = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(exampleText)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: exampleText.substring(lastIndex, match.index), isMatch: false })
      }
      parts.push({ text: match[0], isMatch: true })
      lastIndex = regex.lastIndex
    }
    if (lastIndex < exampleText.length) {
      parts.push({ text: exampleText.substring(lastIndex), isMatch: false })
    }

    const shouldMask = prefs.maskInExample && !unmaskExample && !revealed

    return (
      <span className="leading-relaxed">
        {parts.map((p, idx) => {
          if (!p.isMatch) return <span key={idx}>{p.text}</span>

          if (shouldMask) {
            // 优雅的不背单词式语境遮词槽
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setUnmaskExample(true)}
                className="inline-flex items-center mx-1 px-2.5 py-0.5 rounded-md bg-amber-100/80 border border-amber-300 text-amber-900 font-mono font-semibold text-xs hover:bg-amber-200 transition-all cursor-pointer shadow-2xs group"
                title="语境遮词探查：点击揭晓单词或按 [H]"
              >
                <span className="tracking-widest">[ ______ ]</span>
                <span className="text-[10px] ml-1 text-amber-700/70 font-normal">点击揭晓</span>
              </button>
            )
          }

          // 揭晓态：金黄色真题核心词高亮
          return (
            <span
              key={idx}
              className={`font-bold transition-colors mx-0.5 px-1 py-0.2 rounded ${
                isSpeakingSentence
                  ? 'bg-amber-300 text-neutral-950 underline underline-offset-4 decoration-amber-600'
                  : 'bg-amber-100 text-amber-950 font-semibold'
              }`}
            >
              {p.text}
            </span>
          )
        })}
      </span>
    )
  }

  // ── 词根词缀图谱分解渲染 ──────────────────────────────────────────────────
  const renderRootAnalysis = (rootsStr?: string) => {
    if (!rootsStr) return null
    // 解析形如 "ab-(离开) + sorb(吸收)" 或 "trans-(穿过) + fer(携带)"
    const segments = rootsStr.split('+').map(s => s.trim()).filter(Boolean)

    return (
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {segments.map((seg, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-purple-50 text-purple-700 border border-purple-200/80 font-medium"
          >
            {seg}
          </span>
        ))}
      </div>
    )
  }

  // ── 主题皮肤类名计算 ──────────────────────────────────────────────────────
  const themeCardClasses = useMemo(() => {
    switch (prefs.theme) {
      case 'paper':
        return 'bg-[#fcfbf9] border-[#e8e4de] text-stone-900 shadow-xs'
      case 'dark':
        return 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-md'
      case 'clean':
      default:
        return 'bg-white border-black/[0.08] text-neutral-900 shadow-xs'
    }
  }, [prefs.theme])

  // ── 加载中占位（分步进度条，拒绝黑屏干转圈） ──────────────────────────────
  if (loading) {
    const pct = loadStep === 1 ? 30 : loadStep === 2 ? 68 : 92
    const stepText =
      loadStep === 1
        ? '第 1/3 步：正在按需装载考研大纲词库...'
        : loadStep === 2
          ? '第 2/3 步：正在同步今日复习队列...'
          : '第 3/3 步：正在整理词根词缀与真题例句...'
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-4 animate-in fade-in">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              <span className="font-bold text-slate-900">{stepText}</span>
            </div>
            <span className="font-mono text-indigo-600 font-semibold">
              {pct}%{loadElapsed > 0 ? ` · ${loadElapsed}s` : ''}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-2xs text-slate-400">
            <span className={loadStep === 1 ? 'text-indigo-600 font-semibold' : 'text-emerald-600'}>① 装载词库</span>
            <span className={loadStep === 2 ? 'text-indigo-600 font-semibold' : loadStep > 2 ? 'text-emerald-600' : ''}>② 同步队列</span>
            <span className={loadStep === 3 ? 'text-indigo-600 font-semibold' : ''}>③ 生成卡片</span>
          </div>
        </div>
      </div>
    )
  }

  // ── 错误状态 ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <span className="text-xs text-rose-600">{error}</span>
        <button
          onClick={loadData}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
        >
          重试
        </button>
      </div>
    )
  }

  if (!data) return null

  const totalDue = queue.length

  // ── 本轮复习完成面板（结算战报） ──────────────────────────────────────────
  if (done || totalDue === 0) {
    const totalValid = sessionResults.known + sessionResults.fuzzy + sessionResults.unknown
    const masteryPct = totalValid > 0 ? Math.round((sessionResults.known / totalValid) * 100) : 100

    return (
      <div className="max-w-xl mx-auto space-y-5 animate-fade-in-up py-4">
        <div className="bg-white rounded-3xl border border-black/[0.08] p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-2xs font-semibold">
              🎉 艾宾浩斯语境循环达成
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">
              本轮真题词汇深度掌握完毕
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              共完成 {sessionReviewed} 次真实语境深度研析
              {loopRoundCount > 0 && ` · 包含 ${loopRoundCount} 轮错词强化回溯清零`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xs text-slate-500">真题秒杀</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{sessionResults.known}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xs text-slate-500">回流强化</div>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-0.5">{sessionResults.fuzzy}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xs text-slate-500">本轮掌握率</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">{masteryPct}%</div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>开启下一组 20 词真题刷练</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progressPct = ((currentIdx + 1) / totalDue) * 100

  // ── 主界面渲染 ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto space-y-4 animate-fade-in-up pb-6">
      {/* 顶部指标与模式工具条 */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* 左侧：今日目标与错词回流徽标 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <span>今日进度</span>
            <span className="font-mono text-slate-500 font-bold">{sessionReviewed} / {DAILY_GOAL}</span>
          </div>

          {isLoopingRound ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-2xs font-bold animate-pulse">
              <Repeat className="w-3 h-3" />
              <span>错词回溯 第 {loopRoundCount} 轮</span>
            </span>
          ) : loopQueue.length > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-2xs font-medium">
              <span>待回流 {loopQueue.length}</span>
            </span>
          ) : null}
        </div>

        {/* 右侧：双模式切换与偏好弹窗 */}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setStudyMode('card')}
              className={`px-2.5 py-1 rounded-md text-2xs font-medium transition-all cursor-pointer ${
                studyMode === 'card'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              沉浸卡片
            </button>
            <button
              type="button"
              onClick={() => setStudyMode('quiz')}
              className={`px-2.5 py-1 rounded-md text-2xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                studyMode === 'quiz'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>随堂自测</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(s => !s)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="背单词模式与视听偏好设置"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 细线平滑进度条 */}
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isLoopingRound ? 'bg-rose-500' : 'bg-slate-900'
          }`}
          style={{ width: `${Math.min(progressPct, 100)}%` }}
        />
      </div>

      {/* 不背单词专属偏好设置面板（折叠抽屉） */}
      {showSettings && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm space-y-3.5 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
              <span>不背单词 · 视听与记忆偏好设置</span>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* 自动发音开关 */}
            <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200/70 cursor-pointer">
              <span className="text-neutral-700 font-medium">切词自动发音</span>
              <input
                type="checkbox"
                checked={prefs.autoSpeak}
                onChange={e => updatePrefs({ autoSpeak: e.target.checked })}
                className="rounded accent-neutral-900 cursor-pointer"
              />
            </label>

            {/* 发音口音切换 */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200/70">
              <span className="text-neutral-700 font-medium">发音口音</span>
              <div className="inline-flex rounded-lg bg-neutral-200/70 p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => updatePrefs({ accent: 'en-US' })}
                  className={`px-1.5 py-0.5 rounded ${prefs.accent === 'en-US' ? 'bg-white font-bold shadow-2xs' : 'text-neutral-600'}`}
                >
                  美音
                </button>
                <button
                  type="button"
                  onClick={() => updatePrefs({ accent: 'en-GB' })}
                  className={`px-1.5 py-0.5 rounded ${prefs.accent === 'en-GB' ? 'bg-white font-bold shadow-2xs' : 'text-neutral-600'}`}
                >
                  英音
                </button>
              </div>
            </div>

            {/* 例句遮词模式 */}
            <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200/70 cursor-pointer">
              <span className="text-neutral-700 font-medium">真题例句遮词猜义</span>
              <input
                type="checkbox"
                checked={prefs.maskInExample}
                onChange={e => updatePrefs({ maskInExample: e.target.checked })}
                className="rounded accent-neutral-900 cursor-pointer"
              />
            </label>

            {/* 默认隐藏中文例句翻译 */}
            <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200/70 cursor-pointer">
              <span className="text-neutral-700 font-medium">默认隐藏例句释义</span>
              <input
                type="checkbox"
                checked={prefs.hideExampleCnDefault}
                onChange={e => updatePrefs({ hideExampleCnDefault: e.target.checked })}
                className="rounded accent-neutral-900 cursor-pointer"
              />
            </label>

            {/* 交互反馈音效 */}
            <label className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200/70 cursor-pointer">
              <span className="text-neutral-700 font-medium">答对/答错微音效</span>
              <input
                type="checkbox"
                checked={prefs.soundFx}
                onChange={e => updatePrefs({ soundFx: e.target.checked })}
                className="rounded accent-neutral-900 cursor-pointer"
              />
            </label>

            {/* 视觉主题质感 */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 border border-neutral-200/70">
              <span className="text-neutral-700 font-medium">卡片质感</span>
              <div className="inline-flex rounded-lg bg-neutral-200/70 p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => updatePrefs({ theme: 'clean' })}
                  className={`px-1.5 py-0.5 rounded ${prefs.theme === 'clean' ? 'bg-white font-bold shadow-2xs' : 'text-neutral-600'}`}
                >
                  极简
                </button>
                <button
                  type="button"
                  onClick={() => updatePrefs({ theme: 'paper' })}
                  className={`px-1.5 py-0.5 rounded ${prefs.theme === 'paper' ? 'bg-white font-bold shadow-2xs' : 'text-neutral-600'}`}
                >
                  纸墨
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 翻页指示栏 */}
      <div className="flex items-center justify-between py-0.5">
        <button
          onClick={() => {
            if (currentIdx > 0) {
              setSlideDir('right')
              setTimeout(() => {
                setCurrentIdx(i => i - 1)
                setRevealed(false)
                setUnmaskExample(false)
                setShowExampleCn(!prefs.hideExampleCnDefault)
                setSlideDir(null)
              }, 150)
            }
          }}
          disabled={currentIdx === 0}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="上一个词 [←]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span>
            <span className="font-bold text-slate-800">{currentIdx + 1}</span>
            <span className="mx-1">/</span>
            <span>{totalDue}</span>
          </span>
          {currentWord && (
            <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              Unit {currentWord.unit}
            </span>
          )}
        </div>

        <button
          onClick={advanceToNext}
          disabled={currentIdx === totalDue - 1 && loopQueue.length === 0}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="下一个词 [→]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── 核心内容卡片 ────────────────────────────────────────────────────── */}
      {currentWord && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: swipeOffset !== 0
              ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.035}deg)`
              : undefined,
            transition: swipeOffset === 0 ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s' : 'none',
          }}
          className={`rounded-3xl border transition-all duration-200 select-none overflow-hidden relative touch-pan-y ${themeCardClasses} ${
            slideDir === 'left' ? '-translate-x-3 opacity-0' :
            slideDir === 'right' ? 'translate-x-3 opacity-0' :
            'translate-x-0 opacity-100'
          }`}
        >
          {/* 滑动手势动态方向微徽章提示 */}
          {swipeOffset > 25 && (
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-sm animate-in fade-in flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>认识 · 秒杀</span>
            </div>
          )}
          {swipeOffset < -25 && (
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-md animate-in fade-in flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>遗忘 · 回溯</span>
            </div>
          )}

          <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
            {/* 顶栏考频与发音标签 */}
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-slate-900 text-white">
                {currentWord.frequency === '高频' ? '🔥 考研核心高频' : currentWord.frequency === '中频' ? '⚡ 常用真题词' : '🌱 大纲认知词'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updatePrefs({ accent: prefs.accent === 'en-US' ? 'en-GB' : 'en-US' })}
                  className="px-2 py-0.5 rounded text-2xs font-mono font-medium border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                  title="点击切换美音/英音"
                >
                  {prefs.accent === 'en-US' ? 'US 美音' : 'UK 英音'}
                </button>
              </div>
            </div>

            {/* ── 英文主词与音标区 ────────────────────────────────────────── */}
            <div className="text-center space-y-2.5">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight font-serif text-slate-900">
                {studyMode === 'quiz' && quizType === 'listen' && !quizChecked ? (
                  <span className="filter blur-sm select-none tracking-widest text-slate-400">
                    {currentWord.word.replace(/./g, '●')}
                  </span>
                ) : (
                  currentWord.word
                )}
              </h2>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => speakText(currentWord.word)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer text-xs font-mono shadow-xs group"
                  title="点击朗读单词发音 [Space]"
                >
                  <Volume2 className="w-3.5 h-3.5 text-slate-900 group-hover:scale-110 transition-transform" />
                  <span>{currentWord.phonetic || '/.../'}</span>
                </button>
              </div>
            </div>

            {/* ── 模式一：沉浸卡片模式 ────────────────────────────────────── */}
            {studyMode === 'card' && (
              <>
                {/* 真题真实语境区（不背单词核心灵魂） */}
                {currentWord.example && (
                  <div className="bg-[#f9fafb] rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-2.5 text-left transition-all">
                    <div className="flex items-center justify-between text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-1.5">
                        <Quote className="w-3.5 h-3.5 text-amber-500" />
                        <span>真题原声语境 (Exam Context)</span>
                      </div>

                      {/* 朗读整句例句按钮 */}
                      <button
                        type="button"
                        onClick={() => speakText(currentWord.example, true)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium transition-colors cursor-pointer ${
                          isSpeakingSentence
                            ? 'bg-amber-500 text-white'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                        title="朗读真题原声例句 [快捷键 P]"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isSpeakingSentence ? '播放中...' : '朗读例句 [P]'}</span>
                      </button>
                    </div>

                    {/* 例句主体（支持遮词与单词高亮） */}
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif">
                      {renderMaskedExample(currentWord.example, currentWord.word)}
                    </p>

                    {/* 例句中文释义（支持一键遮掩/揭开） */}
                    {currentWord.exampleCn && (
                      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                        {showExampleCn ? (
                          <p className="text-slate-600 leading-relaxed animate-in fade-in">
                            {currentWord.exampleCn}
                          </p>
                        ) : (
                          <span className="text-2xs text-slate-400 italic">
                            中文例句释义已折叠，按 [H] 或右侧按钮揭晓
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowExampleCn(v => !v)}
                          className="text-slate-400 hover:text-slate-700 ml-2 p-1"
                          title="展开/隐藏例句翻译 [H]"
                        >
                          {showExampleCn ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 考点释义深度展开抽屉（点击或空格键一键揭晓） */}
                <div
                  onClick={() => setRevealed(r => !r)}
                  className="cursor-pointer"
                >
                  {!revealed ? (
                    <div className="py-4 sm:py-5 px-4 rounded-2xl border border-dashed border-slate-300 hover:border-slate-900 bg-slate-50/70 hover:bg-slate-50 active:scale-98 transition-all text-center flex flex-col items-center gap-1.5 shadow-xs">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Eye className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>轻触翻转卡片，查看考点释义与词根族谱</span>
                      </div>
                      <span className="text-2xs text-slate-500 font-medium sm:hidden">
                        👉 支持向右划记熟 · 👈 向左划遗忘 · 点击屏幕任意处翻转
                      </span>
                      <span className="text-2xs text-slate-400 font-mono hidden sm:inline">
                        按 [Space] 键盘一键揭晓 · [P] 朗读例句
                      </span>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3.5 animate-in fade-in">
                      {/* 中文核心考点释义 */}
                      <div className="space-y-1">
                        <div className="text-2xs uppercase font-mono tracking-widest text-slate-400">
                          DEFINITION · 核心考点释义
                        </div>
                        <p className="text-lg font-bold leading-relaxed text-amber-200">
                          {currentWord.definition}
                        </p>
                      </div>

                      {/* 词根词缀助记与结构拆解 */}
                      {currentWord.roots && (
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                          <div className="text-2xs uppercase font-mono tracking-widest text-slate-400 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-400" />
                            <span>ETYMOLOGY · 词根词缀图谱拆解</span>
                          </div>
                          {renderRootAnalysis(currentWord.roots)}
                        </div>
                      )}

                      {/* 真题近义替换 */}
                      {currentWord.synonyms && (
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                          <div className="text-2xs uppercase font-mono tracking-widest text-slate-400">
                            SYNONYMS · 真题同义替换
                          </div>
                          <p className="text-xs text-slate-300 font-mono">
                            {currentWord.synonyms}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── 模式二：随堂巩固自测模式 ──────────────────────────────────── */}
            {studyMode === 'quiz' && (
              <div className="space-y-4">
                {/* 题型标签与提示 */}
                <div className="flex items-center justify-between text-xs pb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>真题随堂四选一演练</span>
                  </div>
                  <span className="text-2xs text-slate-400 font-mono">
                    键盘按 [ 1 / 2 / 3 / 4 ] 作答
                  </span>
                </div>

                {/* 真题语境挖空题干 */}
                {currentWord.example && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-serif leading-relaxed">
                    <div className="text-2xs text-slate-400 uppercase font-mono mb-1">
                      QUESTION CONTEXT · 真题题干
                    </div>
                    {renderMaskedExample(currentWord.example, currentWord.word)}
                  </div>
                )}

                {/* 四选一选项矩阵 */}
                <div className="grid grid-cols-1 gap-2.5">
                  {quizOptions.map((opt, idx) => {
                    let btnClass = 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-900 hover:bg-slate-50'

                    if (quizChecked) {
                      if (opt.isCorrect) {
                        btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold ring-1 ring-emerald-500'
                      } else if (quizSelected === idx) {
                        btnClass = 'bg-rose-50 border-rose-500 text-rose-800 line-through'
                      } else {
                        btnClass = 'bg-white border-slate-100 text-slate-400 opacity-60'
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectQuizOption(idx)}
                        disabled={quizChecked}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-md bg-slate-100 font-mono text-2xs font-bold text-slate-600 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-900">{opt.definition}</span>
                        </div>
                        {quizChecked && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* 答错后展开的深度考点解释 */}
                {quizChecked && !quizOptions[quizSelected || 0]?.isCorrect && (
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-amber-900 font-semibold">
                      <span>💡 考点复盘：正确答案为【{currentWord.definition}】</span>
                      <span className="text-2xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        已自动加入本轮错词回流圈
                      </span>
                    </div>
                    {currentWord.roots && (
                      <div className="text-slate-600">
                        <b>助记词根：</b>{currentWord.roots}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleReview('unknown')}
                      className="w-full py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 mt-1 cursor-pointer"
                    >
                      记住了，继续下一个 [Space / Enter]
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 底部小字状态 */}
            <div className="flex items-center justify-between text-2xs text-slate-400 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1 font-mono">
                <Star className="w-3 h-3 text-amber-500" />
                <span>艾宾浩斯复盘 {currentWord.reviews || 0} 次</span>
              </span>
              <span className="font-mono text-2xs">
                {studyMode === 'card'
                  ? revealed ? 'SPACE 隐藏' : 'SPACE 查看'
                  : '1-4 快捷作答'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 底部行动按键排（全触屏免键盘友好适配） ───────────────────────── */}
      {studyMode === 'card' && (
        <div className="space-y-2.5 pt-1">
          {revealed ? (
            /* 状态 A：已揭晓考点释义时（三态大按键） */
            <div className="grid grid-cols-3 gap-2 sm:gap-3 animate-in fade-in">
              <button
                type="button"
                onClick={() => handleReview('known')}
                disabled={reviewing}
                className="py-3.5 sm:py-4 px-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-white" />
                  <span>认识 · 秒杀</span>
                </div>
                <span className="text-2xs opacity-80 font-mono hidden sm:inline">[ 1 ]</span>
              </button>

              <button
                type="button"
                onClick={() => handleReview('fuzzy')}
                disabled={reviewing}
                className="py-3.5 sm:py-4 px-2 rounded-2xl bg-white border border-amber-300 hover:bg-amber-50 active:scale-95 text-amber-900 text-xs sm:text-sm font-bold shadow-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>模糊 · 强化</span>
                </div>
                <span className="text-2xs text-amber-600/70 font-mono hidden sm:inline">[ 2 ]</span>
              </button>

              <button
                type="button"
                onClick={() => handleReview('unknown')}
                disabled={reviewing}
                className="py-3.5 sm:py-4 px-2 rounded-2xl bg-white border border-rose-300 hover:bg-rose-50 active:scale-95 text-rose-700 text-xs sm:text-sm font-bold shadow-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-500" />
                  <span>遗忘 · 回溯</span>
                </div>
                <span className="text-2xs text-rose-400 font-mono hidden sm:inline">[ 3 ]</span>
              </button>
            </div>
          ) : (
            /* 状态 B：未揭晓考点释义时（专为手机触屏打造的盲操大按键排） */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 animate-in fade-in">
              {/* 1. 红色大按键：不认识/想不起来 */}
              <button
                type="button"
                onClick={() => {
                  setRevealed(true)
                  handleReview('unknown')
                }}
                disabled={reviewing}
                className="py-3.5 sm:py-4 px-3 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100/80 active:scale-95 text-rose-700 text-xs sm:text-sm font-bold shadow-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>不认识 · 揭晓</span>
                </div>
                <span className="text-2xs text-rose-400 font-mono hidden sm:inline">[ 3 ]</span>
              </button>

              {/* 2. 深色主按键：轻触翻看考点释义与词根 */}
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="py-3.5 sm:py-4 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm shadow-slate-900/10 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-300" />
                  <span>查看考点与释义</span>
                </div>
                <span className="text-2xs text-slate-400 font-mono hidden sm:inline">[ Space ]</span>
              </button>

              {/* 3. 绿色大按键：一眼秒杀（移动端整行并排或快捷触达） */}
              <button
                type="button"
                onClick={() => handleReview('known')}
                disabled={reviewing}
                className="col-span-2 sm:col-span-1 py-3 sm:py-4 px-3 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/80 active:scale-95 text-emerald-800 text-xs sm:text-sm font-bold shadow-xs flex flex-row sm:flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>已熟记 · 直接斩词</span>
                </div>
                <span className="text-2xs text-emerald-600/70 font-mono hidden sm:inline">[ 1 ]</span>
              </button>
            </div>
          )}

          {/* 底部提示文字栏（区分移动端触控提示与电脑端快捷键） */}
          <div className="text-center py-1 flex items-center justify-center gap-2 text-2xs text-slate-400">
            {/* 手机端触屏手势引导 */}
            <span className="sm:hidden flex items-center gap-1.5 text-slate-500 font-medium">
              <span>👉 右滑秒杀</span>
              <span className="text-slate-300">·</span>
              <span>👈 左滑遗忘</span>
              <span className="text-slate-300">·</span>
              <span>👆 点击卡片翻转</span>
            </span>
            {/* 桌面端键盘引导 */}
            <span className="hidden sm:inline font-mono">
              快捷键：[Space] 翻转 · [P] 原声例句 · [1] 认识 · [2] 模糊 · [3] 遗忘 · [←/→] 切词
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
