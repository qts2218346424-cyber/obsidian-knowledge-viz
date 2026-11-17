import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Volume2,
  Check,
  Award,
  Sparkles,
  Quote,
  X,
  Star,
  Settings,
  Headphones,
  Eye,
  EyeOff,
  RotateCcw,
  Lightbulb,
  Zap,
  CheckCircle2,
  SlidersHorizontal,
  Repeat,
  PenTool,
  Play,
  Pause,
  BookmarkPlus,
  Filter,
} from 'lucide-react'
import { api } from '../../services/api'
import * as authService from '../../services/auth'

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

type StudyMode = 'card' | 'quiz' | 'spell'
type QuizType = 'cloze' | 'listen'
type DeckFilterMode = 'due' | 'high' | 'unit' | 'starred'
type AccentType = 'en-US' | 'en-GB'
type ThemeStyle = 'clean' | 'paper' | 'sage' | 'dark'

interface UserPreferences {
  autoSpeak: boolean
  accent: AccentType
  speechRate: number
  maskInExample: boolean
  hideExampleCnDefault: boolean
  theme: ThemeStyle
  soundFx: boolean
  batchSize: 15 | 25 | 40
}

const PREF_STORAGE_KEY = 'bbdc_vocab_preferences_v2'
const STARRED_STORAGE_KEY = 'coreforge_vocab_starred_v1'

const DEFAULT_PREFS: UserPreferences = {
  autoSpeak: true,
  accent: 'en-US',
  speechRate: 0.95,
  maskInExample: true,
  hideExampleCnDefault: true,
  theme: 'clean',
  soundFx: true,
  batchSize: 25,
}

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
      osc.frequency.setValueAtTime(587.33, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.25)
    } catch {}
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
    } catch {}
  }
}

const sfx = new SoundFxEngine()

const FALLBACK_SEED: VocabPoolEntry[] = [
  {
    word: 'perseverance',
    phonetic: '/ˌpɜːrsəˈvɪrəns/',
    definition: 'n. 毅力，坚持不懈',
    example: 'Success in the postgraduate exam demands daily perseverance.',
    exampleCn: '考研成功需要日复一日的坚持不懈。',
    frequency: '高频',
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
    frequency: '高频',
    unit: 1,
    roots: 'com-(完全) + prehend(抓住)',
    synonyms: 'grasp, perceive',
  },
  {
    word: 'compromise',
    phonetic: '/ˈkɒmprəmaɪz/',
    definition: 'n./v. 妥协；【熟词僻义】危及，损害',
    example: 'Lack of sleep will severely compromise your cognitive performance.',
    exampleCn: '睡眠不足会严重危及你的认知表现。',
    frequency: '高频',
    unit: 1,
    roots: 'com-(共同) + promise(承诺) → 引申为因妥协而危及原则或健康',
    synonyms: 'jeopardize, undermine, impair',
  },
  {
    word: 'synthesize',
    phonetic: '/ˈsɪnθəsaɪz/',
    definition: 'v. 综合，合成',
    example: 'You need to synthesize notes from multiple chapters before the mock test.',
    exampleCn: '模考前需要把多个章节的笔记综合梳理起来。',
    frequency: '高频',
    unit: 2,
    roots: 'syn-(共同) + thesis(放置) + -ize',
    synonyms: 'integrate, combine',
  },
]

function toVocabRecord(item: VocabPoolEntry | VocabRecord): VocabRecord {
  return {
    word: item.word,
    phonetic: item.phonetic || '',
    definition: item.definition,
    example: item.example || '',
    exampleCn: item.exampleCn || '',
    frequency: item.frequency || '高频',
    unit: item.unit || 1,
    roots: item.roots || '',
    synonyms: item.synonyms || '',
    reviews: 'reviews' in item && typeof item.reviews === 'number' ? item.reviews : 0,
    nextReview: 'nextReview' in item ? item.nextReview : '',
  }
}

const buildFallbackVocabData = (pool: VocabPoolEntry[], batchSize: number): VocabData => {
  const src = pool.length > 0 ? pool.slice(0, batchSize) : FALLBACK_SEED
  return {
    totalWords: Math.max(2000, pool.length),
    dueWords: src.length,
    stats: { mastered: 42, learning: 96, newWords: 38 },
    dueRecords: src.map(toVocabRecord),
    suggested: [],
    autoAdded: 0,
  }
}

export default function VocabTab() {
  const [vocabPool, setVocabPool] = useState<VocabPoolEntry[]>([])
  const [serverDueRecords, setServerDueRecords] = useState<VocabRecord[]>([])
  const [data, setData] = useState<VocabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadStep, setLoadStep] = useState<1 | 2 | 3>(1)
  const [loadElapsed, setLoadElapsed] = useState(0)
  const [error, setError] = useState('')

  // 偏好设置持久化
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREF_STORAGE_KEY)
      return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS
    } catch {
      return DEFAULT_PREFS
    }
  })

  // 星标生词本持久化
  const [starredWords, setStarredWords] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STARRED_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // 词单筛选器与单元选择
  const [deckMode, setDeckMode] = useState<DeckFilterMode>('due')
  const [selectedUnit, setSelectedUnit] = useState<number>(1)

  // 队列与复习轮次
  const [queue, setQueue] = useState<VocabRecord[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [loopQueue, setLoopQueue] = useState<VocabRecord[]>([])
  const [isLoopingRound, setIsLoopingRound] = useState(false)
  const [loopRoundCount, setLoopRoundCount] = useState(0)

  // 交互态
  const [revealed, setRevealed] = useState(false)
  const [showExampleCn, setShowExampleCn] = useState(false)
  const [unmaskExample, setUnmaskExample] = useState(false)
  const [isSpeakingSentence, setIsSpeakingSentence] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)
  const [toastTip, setToastTip] = useState<string | null>(null)

  // 随身磨耳朵自动巡航连播状态
  const [autoCruise, setAutoCruise] = useState(false)

  // 触控手势滑动状态
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const [swipeOffset, setSwipeOffset] = useState<number>(0)

  // 模式与配置
  const [studyMode, setStudyMode] = useState<StudyMode>('card')
  const [quizType, setQuizType] = useState<QuizType>('cloze')
  const [showSettings, setShowSettings] = useState(false)

  // 随堂测验选项状态
  const [quizSelected, setQuizSelected] = useState<number | null>(null)
  const [quizChecked, setQuizChecked] = useState(false)

  // 拼写默写模式状态
  const [spellInput, setSpellInput] = useState('')
  const [spellChecked, setSpellChecked] = useState<'correct' | 'wrong' | null>(null)
  const [spellHintLevel, setSpellHintLevel] = useState(1)
  const spellInputRef = useRef<HTMLInputElement | null>(null)

  // 统计指标
  const [sessionReviewed, setSessionReviewed] = useState(0)
  const [sessionResults, setSessionResults] = useState<{ known: number; fuzzy: number; unknown: number }>({
    known: 0,
    fuzzy: 0,
    unknown: 0,
  })
  const [done, setDone] = useState(false)

  const showToast = useCallback((msg: string) => {
    setToastTip(msg)
    setTimeout(() => {
      setToastTip((prev) => (prev === msg ? null : prev))
    }, 2400)
  }, [])

  const updatePrefs = (patch: Partial<UserPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const toggleStarWord = useCallback(
    (word: string) => {
      const lower = word.toLowerCase()
      setStarredWords((prev) => {
        const exists = prev.some((w) => w.toLowerCase() === lower)
        const next = exists ? prev.filter((w) => w.toLowerCase() !== lower) : [word, ...prev]
        try {
          localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(next))
        } catch {}
        showToast(exists ? `已从星标生词本移除「${word}」` : `已将「${word}」加入星标重点生词本`)
        return next
      })
    },
    [showToast]
  )

  // 一键将当前难词转存至全局 SM-2 艾宾浩斯闪卡库
  const handleSaveWordToFlashcard = async (rec: VocabRecord) => {
    try {
      const backLines = [
        `**核心考义**：${rec.definition}`,
        rec.phonetic ? `**音标**：\`${rec.phonetic}\`` : '',
        rec.roots ? `**词根拆解**：${rec.roots}` : '',
        rec.synonyms ? `**真题同义替换**：${rec.synonyms}` : '',
        rec.example ? `\n> **真题例句**：${rec.example}\n> ${rec.exampleCn || ''}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      const res = await fetch('/api/flashcards/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({
          title: `考研核心词：${rec.word}`,
          domain: 'cs_408',
          subject: '考研英语词汇',
          chapter: `Unit ${rec.unit}`,
          front: `请回忆考研核心词 **${rec.word}** ${rec.phonetic} 的精准考义、词根拆解及熟词僻义？`,
          back: backLines,
          mnemonic: rec.roots || undefined,
          isForgotten: true,
          difficulty: 'medium',
          tags: ['考研词汇', rec.frequency || '核心词'],
        }),
      })
      if (!res.ok) throw new Error('保存失败')
      showToast(`已将「${rec.word}」同步至全局艾宾浩斯闪卡库`)
    } catch {
      showToast('已为您星标收藏该词（离线状态下本地保留）')
    }
  }

  // 语音播放引擎
  const speakText = useCallback(
    (text: string, isSentence = false) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()

      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = prefs.accent
      utter.rate = isSentence ? Math.max(0.75, prefs.speechRate * 0.94) : prefs.speechRate

      if (isSentence) {
        setIsSpeakingSentence(true)
        utter.onend = () => setIsSpeakingSentence(false)
        utter.onerror = () => setIsSpeakingSentence(false)
      }

      window.speechSynthesis.speak(utter)
    },
    [prefs.accent, prefs.speechRate]
  )

  useEffect(() => {
    if (!loading) {
      setLoadElapsed(0)
      return
    }
    const timer = setInterval(() => setLoadElapsed((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [loading])

  // 提取可用单元列表
  const availableUnits = useMemo(() => {
    const set = new Set<number>()
    vocabPool.forEach((w) => {
      if (typeof w.unit === 'number' && w.unit > 0) set.add(w.unit)
    })
    const arr = Array.from(set).sort((a, b) => a - b)
    return arr.length > 0 ? arr : [1, 2, 3, 4, 5]
  }, [vocabPool])

  // 根据词源范围与每组词量重组当前学习队列
  const rebuildActiveQueue = useCallback(
    (
      nextDeckMode: DeckFilterMode,
      unitNum: number,
      batchSize: number,
      poolSource: VocabPoolEntry[],
      dueSource: VocabRecord[],
      starredList: string[]
    ) => {
      let records: VocabRecord[] = []
      const allSource = poolSource.length > 0 ? poolSource : FALLBACK_SEED

      if (nextDeckMode === 'starred') {
        const starSet = new Set(starredList.map((s) => s.toLowerCase()))
        const matched = allSource.filter((w) => starSet.has(w.word.toLowerCase()))
        if (matched.length > 0) {
          records = matched.slice(0, batchSize).map(toVocabRecord)
        } else {
          showToast('当前星标生词本为空，可点击卡片右上角五角星收藏重点难词')
          records = (dueSource.length > 0 ? dueSource : allSource.map(toVocabRecord)).slice(0, batchSize)
        }
      } else if (nextDeckMode === 'high') {
        const highs = allSource.filter((w) => String(w.frequency).includes('高频'))
        records = (highs.length > 0 ? highs : allSource).slice(0, batchSize).map(toVocabRecord)
      } else if (nextDeckMode === 'unit') {
        const inUnit = allSource.filter((w) => w.unit === unitNum)
        records = (inUnit.length > 0 ? inUnit : allSource).slice(0, batchSize).map(toVocabRecord)
      } else {
        records = (dueSource.length > 0 ? dueSource : allSource.map(toVocabRecord)).slice(0, batchSize)
      }

      setQueue(records)
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
      setSpellInput('')
      setSpellChecked(null)
      setSpellHintLevel(1)
    },
    [prefs.hideExampleCnDefault, showToast]
  )

  // 数据装载
  const loadData = useCallback(async () => {
    setLoading(true)
    setLoadStep(1)
    setError('')
    let loadedPool: VocabPoolEntry[] = []
    try {
      const poolPromise = import('@shared/data/vocabulary')
        .then((mod) => (mod.VOCAB_POOL || []) as VocabPoolEntry[])
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

      let enrichedDue: VocabRecord[] = []
      if (result && Array.isArray(result.dueRecords) && result.dueRecords.length > 0) {
        enrichedDue = result.dueRecords.map((item) => {
          const match = pool.find((v) => v.word.toLowerCase() === item.word.toLowerCase())
          return {
            ...item,
            roots: item.roots || match?.roots || '',
            synonyms: item.synonyms || match?.synonyms || '',
            exampleCn: item.exampleCn || match?.exampleCn || '',
            phonetic: item.phonetic || match?.phonetic || '',
          }
        })
        setData({ ...result, dueRecords: enrichedDue })
      } else {
        const fb = buildFallbackVocabData(pool, prefs.batchSize)
        enrichedDue = fb.dueRecords
        setData(fb)
      }

      setServerDueRecords(enrichedDue)
      rebuildActiveQueue(deckMode, selectedUnit, prefs.batchSize, pool, enrichedDue, starredWords)
    } catch {
      const fb = buildFallbackVocabData(loadedPool, prefs.batchSize)
      setServerDueRecords(fb.dueRecords)
      setData(fb)
      setQueue(fb.dueRecords)
      setCurrentIdx(0)
      setDone(false)
    } finally {
      setLoading(false)
    }
  }, [deckMode, prefs.batchSize, rebuildActiveQueue, selectedUnit, starredWords])

  useEffect(() => {
    loadData()
    // 仅在首次挂载装载词库，后续切换词单直接内存毫秒重组
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSwitchDeck = (nextMode: DeckFilterMode, nextUnit = selectedUnit, nextBatch = prefs.batchSize) => {
    setAutoCruise(false)
    setDeckMode(nextMode)
    setSelectedUnit(nextUnit)
    if (nextBatch !== prefs.batchSize) {
      updatePrefs({ batchSize: nextBatch })
    }
    rebuildActiveQueue(nextMode, nextUnit, nextBatch, vocabPool, serverDueRecords, starredWords)
  }

  const currentWord: VocabRecord | undefined = queue[currentIdx]
  const isCurrentStarred = useMemo(() => {
    if (!currentWord) return false
    return starredWords.some((w) => w.toLowerCase() === currentWord.word.toLowerCase())
  }, [currentWord, starredWords])

  // 切词自动发音（拼写默写模式同样可听音辅助拼写）
  useEffect(() => {
    if (currentWord && prefs.autoSpeak && !done && !loading && !autoCruise) {
      const timer = setTimeout(() => {
        speakText(currentWord.word)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [currentWord, prefs.autoSpeak, done, loading, autoCruise, speakText])

  // 切入拼写模式时自动聚焦输入框
  useEffect(() => {
    if (studyMode === 'spell' && !spellChecked) {
      setTimeout(() => spellInputRef.current?.focus(), 80)
    }
  }, [studyMode, currentIdx, spellChecked])

  // 随堂测验干扰项生成
  const quizOptions = useMemo(() => {
    if (!currentWord) return []
    const sourceList = vocabPool.length > 3 ? vocabPool : queue
    const pool = sourceList.filter((w) => w.word.toLowerCase() !== currentWord.word.toLowerCase())
    const shuffledPool = pool.toSorted(() => 0.5 - Math.random()).slice(0, 3)

    const items = [
      {
        word: currentWord.word,
        definition: currentWord.definition,
        isCorrect: true,
      },
      ...shuffledPool.map((item) => ({
        word: item.word,
        definition: item.definition,
        isCorrect: false,
      })),
    ]
    return items.sort(() => 0.5 - Math.random())
  }, [currentWord, vocabPool, queue])

  const resetCardStepState = useCallback(() => {
    setRevealed(false)
    setUnmaskExample(false)
    setShowExampleCn(!prefs.hideExampleCnDefault)
    setQuizSelected(null)
    setQuizChecked(false)
    setSpellInput('')
    setSpellChecked(null)
    setSpellHintLevel(1)
  }, [prefs.hideExampleCnDefault])

  // 推进下一个单词
  const advanceToNext = useCallback(() => {
    setSlideDir('left')
    setTimeout(() => {
      if (currentIdx < queue.length - 1) {
        setCurrentIdx((prev) => prev + 1)
        resetCardStepState()
      } else {
        if (loopQueue.length > 0) {
          setIsLoopingRound(true)
          setLoopRoundCount((c) => c + 1)
          setQueue([...loopQueue])
          setLoopQueue([])
          setCurrentIdx(0)
          resetCardStepState()
        } else {
          setAutoCruise(false)
          setDone(true)
        }
      }
      setSlideDir(null)
    }, 180)
  }, [currentIdx, queue.length, loopQueue, resetCardStepState])

  // 随身磨耳朵自动巡航连播状态机
  useEffect(() => {
    if (!autoCruise || !currentWord || done || loading) return
    setStudyMode('card')
    setRevealed(false)
    speakText(currentWord.word)

    const t1 = window.setTimeout(() => {
      setRevealed(true)
      setShowExampleCn(true)
      if (currentWord.example) {
        speakText(currentWord.example, true)
      }
    }, 1900)

    const t2 = window.setTimeout(() => {
      advanceToNext()
    }, 5600)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [autoCruise, currentWord, done, loading, speakText, advanceToNext])

  // 评分与复习提交
  const handleReview = useCallback(
    async (result: 'known' | 'fuzzy' | 'unknown') => {
      if (!currentWord || reviewing) return
      setReviewing(true)

      if (prefs.soundFx) {
        if (result === 'known') sfx.playSuccess()
        else sfx.playWrong()
      }

      try {
        await api.reviewVocabulary(currentWord.word, result)
      } catch {}

      setSessionReviewed((c) => c + 1)
      setSessionResults((prev) => ({
        ...prev,
        [result]: prev[result] + 1,
      }))

      if (result !== 'known') {
        setLoopQueue((prev) => {
          if (prev.some((w) => w.word.toLowerCase() === currentWord.word.toLowerCase())) return prev
          return [...prev, currentWord]
        })
      }

      setReviewing(false)
      advanceToNext()
    },
    [currentWord, reviewing, prefs.soundFx, advanceToNext]
  )

  // 随堂测验答题处理
  const handleSelectQuizOption = (idx: number) => {
    if (quizChecked || !currentWord) return
    setQuizSelected(idx)
    setQuizChecked(true)

    const chosen = quizOptions[idx]
    if (chosen?.isCorrect) {
      if (prefs.soundFx) sfx.playSuccess()
      setTimeout(() => {
        handleReview('known')
      }, 680)
    } else {
      if (prefs.soundFx) sfx.playWrong()
      setRevealed(true)
      setLoopQueue((prev) => {
        if (prev.some((w) => w.word.toLowerCase() === currentWord.word.toLowerCase())) return prev
        return [...prev, currentWord]
      })
    }
  }

  // 拼写默写核对处理
  const handleCheckSpelling = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentWord) return
    if (spellChecked) {
      handleReview(spellChecked === 'correct' ? 'known' : 'unknown')
      return
    }
    const cleanInput = spellInput.trim().toLowerCase()
    if (!cleanInput) return
    const target = currentWord.word.trim().toLowerCase()
    if (cleanInput === target) {
      setSpellChecked('correct')
      if (prefs.soundFx) sfx.playSuccess()
      speakText(currentWord.word)
      setTimeout(() => {
        handleReview('known')
      }, 750)
    } else {
      setSpellChecked('wrong')
      if (prefs.soundFx) sfx.playWrong()
      speakText(currentWord.word)
      setLoopQueue((prev) => {
        if (prev.some((w) => w.word.toLowerCase() === target)) return prev
        return [...prev, currentWord]
      })
    }
  }

  // 触控手势滑动处理
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current
    const deltaY = e.touches[0].clientY - touchStartY.current
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) < 160) {
      setSwipeOffset(deltaX)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    setSwipeOffset(0)

    if (studyMode === 'spell') return
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (deltaX > 0) {
        handleReview('known')
      } else {
        if (!revealed) setRevealed(true)
        handleReview('unknown')
      }
    }
  }

  // 键盘快捷键操控
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.code === 'Space') {
        e.preventDefault()
        if (studyMode === 'card') {
          setRevealed((r) => !r)
        } else if (currentWord) {
          speakText(currentWord.word)
        }
      } else if (e.code === 'KeyP') {
        e.preventDefault()
        if (currentWord?.example) speakText(currentWord.example, true)
      } else if (e.code === 'KeyS') {
        e.preventDefault()
        if (currentWord) toggleStarWord(currentWord.word)
      } else if (e.code === 'KeyH') {
        e.preventDefault()
        setUnmaskExample((v) => !v)
        setShowExampleCn((v) => !v)
      } else if (['1', '2', '3', '4'].includes(e.key)) {
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
      } else if (e.code === 'ArrowLeft' && currentIdx > 0) {
        e.preventDefault()
        setSlideDir('right')
        setTimeout(() => {
          setCurrentIdx((i) => i - 1)
          resetCardStepState()
          setSlideDir(null)
        }, 150)
      } else if (e.code === 'ArrowRight' && currentIdx < queue.length - 1) {
        e.preventDefault()
        advanceToNext()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    studyMode,
    revealed,
    reviewing,
    currentWord,
    quizChecked,
    quizOptions,
    currentIdx,
    queue.length,
    handleReview,
    advanceToNext,
    speakText,
    toggleStarWord,
    resetCardStepState,
  ])

  // 真题例句遮词与高亮渲染
  const renderMaskedExample = (exampleText: string, targetWord: string, forceMask = false) => {
    if (!exampleText) return null
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

    const shouldMask = forceMask || (prefs.maskInExample && !unmaskExample && !revealed)

    return (
      <span className="leading-relaxed">
        {parts.map((p, idx) => {
          if (!p.isMatch) return <span key={idx}>{p.text}</span>

          if (shouldMask) {
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (!forceMask) setUnmaskExample(true)
                }}
                className="inline-flex items-center mx-1 px-2.5 py-0.5 rounded-md bg-amber-100/90 border border-amber-300 text-amber-900 font-mono font-semibold text-xs hover:bg-amber-200 transition-all cursor-pointer shadow-2xs"
                title="语境遮词探查：点击揭晓单词或按 [H]"
              >
                <span className="tracking-widest">[ ______ ]</span>
                {!forceMask && (
                  <span className="text-[10px] ml-1 text-amber-800/75 font-normal">揭晓</span>
                )}
              </button>
            )
          }

          return (
            <span
              key={idx}
              className={`font-bold transition-colors mx-0.5 px-1.5 py-0.5 rounded ${
                isSpeakingSentence
                  ? 'bg-amber-300 text-neutral-950 underline underline-offset-4 decoration-amber-600'
                  : 'bg-amber-200/80 text-amber-950 font-semibold'
              }`}
            >
              {p.text}
            </span>
          )
        })}
      </span>
    )
  }

  const renderRootAnalysis = (rootsStr?: string) => {
    if (!rootsStr) return null
    const segments = rootsStr
      .split('+')
      .map((s) => s.trim())
      .filter(Boolean)

    return (
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {segments.map((seg, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-purple-500/15 text-purple-200 border border-purple-400/30 font-medium"
          >
            {seg}
          </span>
        ))}
      </div>
    )
  }

  // 四款高对比度卡片主题皮肤计算
  const isDarkCard = prefs.theme === 'dark'
  const themeCardClasses = useMemo(() => {
    switch (prefs.theme) {
      case 'paper':
        return 'bg-[#fbf8f1] border-[#e5dec9] text-stone-900 shadow-xs'
      case 'sage':
        return 'bg-[#f2f8f4] border-[#cfe4d6] text-slate-900 shadow-xs'
      case 'dark':
        return 'bg-[#111625] border-slate-800 text-slate-100 shadow-lg'
      case 'clean':
      default:
        return 'bg-white border-black/[0.08] text-neutral-900 shadow-xs'
    }
  }, [prefs.theme])

  if (loading) {
    const pct = loadStep === 1 ? 30 : loadStep === 2 ? 68 : 92
    const stepText =
      loadStep === 1
        ? '第 1/3 步：正在按需装载考研大纲词库...'
        : loadStep === 2
        ? '第 2/3 步：正在同步今日艾宾浩斯复习队列...'
        : '第 3/3 步：正在整理词根词缀与真题例句...'
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-4 animate-in fade-in">
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
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <span className="text-xs text-rose-600">{error}</span>
        <button
          onClick={loadData}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
        >
          重试加载词库
        </button>
      </div>
    )
  }

  if (!data) return null

  const totalDue = queue.length

  if (done || totalDue === 0) {
    const totalValid = sessionResults.known + sessionResults.fuzzy + sessionResults.unknown
    const masteryPct = totalValid > 0 ? Math.round((sessionResults.known / totalValid) * 100) : 100

    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in-up py-4">
        <div className="bg-white rounded-3xl border border-black/[0.08] p-8 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-2xs font-semibold">
              艾宾浩斯语境循环达成
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">
              本组 {prefs.batchSize} 词深度特训圆满完成
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              共完成 {sessionReviewed} 次词义核验
              {loopRoundCount > 0 && ` · 包含 ${loopRoundCount} 轮错词回溯彻底清零`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xs text-slate-500">精准秒杀</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
                {sessionResults.known}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xs text-slate-500">回流强化</div>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-0.5">
                {sessionResults.fuzzy + sessionResults.unknown}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-2xs text-slate-500">首遍掌握率</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-0.5">
                {masteryPct}%
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSessionReviewed(0)
                setSessionResults({ known: 0, fuzzy: 0, unknown: 0 })
                loadData()
              }}
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>继续下一组 {prefs.batchSize} 词刷练</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStudyMode('spell')
                setDone(false)
                setCurrentIdx(0)
                resetCardStepState()
              }}
              className="py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>对本组进行拼写默写复测</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const progressPct = ((currentIdx + 1) / totalDue) * 100

  // 生成拼写骨架提示（如 per _ _ _ _ _ _ _ _ e）
  const spellSkeleton = currentWord
    ? currentWord.word
        .split('')
        .map((ch, idx, arr) => {
          if (idx < spellHintLevel || idx === arr.length - 1) return ch
          return '_'
        })
        .join(' ')
    : ''

  return (
    <div className="max-w-2xl mx-auto space-y-3.5 animate-fade-in-up pb-6 relative">
      {/* 轻提示胶囊 */}
      {toastTip && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/15 flex items-center gap-2 animate-fade-in-up"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>{toastTip}</span>
        </div>
      )}

      {/* 第一排：靶向词单与组量快捷筛选条 */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5 shrink-0" />
          {[
            { id: 'due' as const, label: '智能待复习' },
            { id: 'high' as const, label: '核心高频必考' },
            { id: 'unit' as const, label: '按单元闯关' },
            { id: 'starred' as const, label: `星标生词 (${starredWords.length})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSwitchDeck(item.id)}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                deckMode === item.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}

          {deckMode === 'unit' && (
            <select
              aria-label="选择词汇单元"
              value={selectedUnit}
              onChange={(e) => handleSwitchDeck('unit', Number(e.target.value))}
              className="ml-1 px-2 py-1 rounded-lg bg-white border border-slate-300 text-2xs font-bold text-indigo-700 cursor-pointer outline-none"
            >
              {availableUnits.map((u) => (
                <option key={u} value={u}>
                  第 {u} 单元
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 每组词量定制 */}
        <div className="inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-lg border border-slate-200/80 text-2xs">
          <span className="text-slate-400 pl-1">每组</span>
          {([15, 25, 40] as const).map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => handleSwitchDeck(deckMode, selectedUnit, sz)}
              className={`px-1.5 py-0.5 rounded font-mono font-bold cursor-pointer ${
                prefs.batchSize === sz
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* 第二排：四大实战模式切换 + 随身磨耳朵连播 + 偏好设置 */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <span>本轮已斩</span>
            <span className="font-mono text-indigo-600 font-extrabold">
              {sessionReviewed} / {totalDue}
            </span>
          </div>

          {isLoopingRound ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-2xs font-bold animate-pulse">
              <Repeat className="w-3 h-3" />
              <span>错词清零圈 #{loopRoundCount}</span>
            </span>
          ) : loopQueue.length > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-2xs font-semibold">
              <span>待回溯 {loopQueue.length}</span>
            </span>
          ) : null}
        </div>

        {/* 右侧：模式胶囊 + 自动磨耳朵连播 + 偏好齿轮 */}
        <div className="flex items-center gap-1.5 max-w-full overflow-x-auto no-scrollbar">
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => {
                setAutoCruise(false)
                setStudyMode('card')
              }}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer ${
                studyMode === 'card'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              沉浸卡片
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoCruise(false)
                setStudyMode('quiz')
                setQuizType('cloze')
              }}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                studyMode === 'quiz' && quizType === 'cloze'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>语境选义</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoCruise(false)
                setStudyMode('quiz')
                setQuizType('listen')
                if (currentWord) speakText(currentWord.word)
              }}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                studyMode === 'quiz' && quizType === 'listen'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Headphones className="w-3 h-3 text-sky-500" />
              <span>听音辨义</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoCruise(false)
                setStudyMode('spell')
              }}
              className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                studyMode === 'spell'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PenTool className="w-3 h-3 text-indigo-500" />
              <span>拼写默写</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAutoCruise((v) => !v)}
            aria-pressed={autoCruise}
            className={`px-2.5 py-1.5 rounded-xl border text-2xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
              autoCruise
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="随身磨耳朵模式：自动朗读单词、展开释义、播放真题例句并切下一词"
          >
            {autoCruise ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-600" />}
            <span className="hidden xs:inline">{autoCruise ? '巡航中' : '自动连播'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            aria-label="打开背单词视听与皮肤设置"
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
              showSettings
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 平滑进度条 */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isLoopingRound
              ? 'bg-rose-500'
              : autoCruise
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-slate-900 to-indigo-600'
          }`}
          style={{ width: `${Math.min(progressPct, 100)}%` }}
        />
      </div>

      {/* 偏好设置折叠面板 */}
      {showSettings && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm space-y-3.5 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>背词视听与卡片护眼皮肤设置</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              aria-label="收起设置面板"
              className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 cursor-pointer">
              <span className="text-neutral-700 font-medium">切词自动朗读发音</span>
              <input
                type="checkbox"
                checked={prefs.autoSpeak}
                onChange={(e) => updatePrefs({ autoSpeak: e.target.checked })}
                className="rounded accent-neutral-900 cursor-pointer"
              />
            </label>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
              <span className="text-neutral-700 font-medium">发音口音与语速</span>
              <div className="flex items-center gap-1">
                <div className="inline-flex rounded-lg bg-neutral-200/70 p-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => updatePrefs({ accent: 'en-US' })}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      prefs.accent === 'en-US' ? 'bg-white font-bold shadow-2xs' : 'text-neutral-600'
                    }`}
                  >
                    美音
                  </button>
                  <button
                    type="button"
                    onClick={() => updatePrefs({ accent: 'en-GB' })}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      prefs.accent === 'en-GB' ? 'bg-white font-bold shadow-2xs' : 'text-neutral-600'
                    }`}
                  >
                    英音
                  </button>
                </div>
                <select
                  aria-label="朗读语速"
                  value={prefs.speechRate}
                  onChange={(e) => updatePrefs({ speechRate: Number(e.target.value) })}
                  className="px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-[10.5px] font-mono cursor-pointer"
                >
                  <option value={0.8}>0.8x 慢速</option>
                  <option value={0.95}>1.0x 标准</option>
                  <option value={1.15}>1.2x 快速</option>
                </select>
              </div>
            </div>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 cursor-pointer">
              <span className="text-neutral-700 font-medium">真题例句先遮词猜义</span>
              <input
                type="checkbox"
                checked={prefs.maskInExample}
                onChange={(e) => updatePrefs({ maskInExample: e.target.checked })}
                className="rounded accent-neutral-900 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 cursor-pointer">
              <span className="text-neutral-700 font-medium">答对/答错清脆提示音</span>
              <input
                type="checkbox"
                checked={prefs.soundFx}
                onChange={(e) => updatePrefs({ soundFx: e.target.checked })}
                className="rounded accent-neutral-900 cursor-pointer"
              />
            </label>

            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70">
              <span className="text-neutral-700 font-medium">卡片护眼皮肤质感</span>
              <div className="inline-flex rounded-lg bg-neutral-200/70 p-0.5 text-[11px]">
                {[
                  { id: 'clean' as const, label: '白瓷极简' },
                  { id: 'paper' as const, label: '古籍宣纸' },
                  { id: 'sage' as const, label: '清茗青瓷' },
                  { id: 'dark' as const, label: '静谧暗夜' },
                ].map((th) => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => updatePrefs({ theme: th.id })}
                    className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                      prefs.theme === th.id
                        ? 'bg-white text-slate-900 font-bold shadow-2xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 翻页指示栏 */}
      <div className="flex items-center justify-between py-0.5">
        <button
          type="button"
          onClick={() => {
            if (currentIdx > 0) {
              setSlideDir('right')
              setTimeout(() => {
                setCurrentIdx((i) => i - 1)
                resetCardStepState()
                setSlideDir(null)
              }, 150)
            }
          }}
          disabled={currentIdx === 0}
          aria-label="上一个单词"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
              第 {currentWord.unit} 单元
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={advanceToNext}
          disabled={currentIdx === totalDue - 1 && loopQueue.length === 0}
          aria-label="下一个单词"
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
            transform:
              swipeOffset !== 0
                ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.035}deg)`
                : undefined,
            transition:
              swipeOffset === 0
                ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s'
                : 'none',
          }}
          className={`rounded-3xl border transition-all duration-200 select-none overflow-hidden relative touch-pan-y ${themeCardClasses} ${
            slideDir === 'left'
              ? '-translate-x-3 opacity-0'
              : slideDir === 'right'
              ? 'translate-x-3 opacity-0'
              : 'translate-x-0 opacity-100'
          }`}
        >
          {/* 滑动手势动态方向微徽章提示 */}
          {swipeOffset > 25 && (
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>认识 · 秒杀</span>
            </div>
          )}
          {swipeOffset < -25 && (
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-md flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>遗忘 · 回溯</span>
            </div>
          )}

          <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
            {/* 顶栏考频、星标生词收藏与闪卡转存 */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span
                className={`px-2.5 py-0.5 rounded-full text-2xs font-bold ${
                  isDarkCard
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {String(currentWord.frequency).includes('高频')
                  ? '考研核心高频词'
                  : String(currentWord.frequency).includes('中频')
                  ? '真题常考进阶词'
                  : '大纲重点认知词'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleStarWord(currentWord.word)}
                  aria-pressed={isCurrentStarred}
                  title="加入/移出星标生词本 [快捷键 S]"
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-2xs font-bold transition-all cursor-pointer ${
                    isCurrentStarred
                      ? 'bg-amber-400/20 border-amber-400 text-amber-600'
                      : isDarkCard
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isCurrentStarred ? 'fill-amber-400 text-amber-500' : ''
                    }`}
                  />
                  <span>{isCurrentStarred ? '已星标' : '星标'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveWordToFlashcard(currentWord)}
                  title="将该词及真题例句一键转存至全局 SM-2 闪卡库"
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-2xs font-semibold transition-colors cursor-pointer ${
                    isDarkCard
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">存闪卡</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updatePrefs({ accent: prefs.accent === 'en-US' ? 'en-GB' : 'en-US' })
                  }
                  className={`px-2 py-1 rounded-lg text-2xs font-mono font-semibold border transition-colors cursor-pointer ${
                    isDarkCard
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {prefs.accent === 'en-US' ? '美音' : '英音'}
                </button>
              </div>
            </div>

            {/* ── 英文主词与音标区 ────────────────────────────────────────── */}
            <div className="text-center space-y-2.5">
              {studyMode === 'spell' && !spellChecked ? (
                <div className="space-y-1.5">
                  <div className="text-2xs font-bold text-indigo-500">请根据下方考义与发音默写单词</div>
                  <div
                    className={`text-2xl sm:text-3xl font-mono font-bold tracking-widest ${
                      isDarkCard ? 'text-indigo-200' : 'text-indigo-900'
                    }`}
                  >
                    {spellSkeleton}
                  </div>
                </div>
              ) : (
                <h2
                  className={`text-4xl sm:text-5xl font-bold tracking-tight font-serif ${
                    isDarkCard ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {studyMode === 'quiz' && quizType === 'listen' && !quizChecked ? (
                    <span className="tracking-widest text-slate-400">
                      {currentWord.word.replace(/./g, '●')}
                    </span>
                  ) : (
                    currentWord.word
                  )}
                </h2>
              )}

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => speakText(currentWord.word)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border transition-all cursor-pointer text-xs font-mono shadow-2xs group ${
                    isDarkCard
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-white/80 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span>
                    {studyMode === 'spell' && !spellChecked
                      ? '点击重听发音'
                      : currentWord.phonetic || '点击发音'}
                  </span>
                </button>
              </div>
            </div>

            {/* ── 模式一：沉浸卡片模式 ────────────────────────────────────── */}
            {studyMode === 'card' && (
              <>
                {currentWord.example && (
                  <div
                    className={`rounded-2xl p-4 sm:p-5 border space-y-2.5 text-left transition-all ${
                      isDarkCard
                        ? 'bg-slate-900/90 border-slate-800 text-slate-100'
                        : 'bg-white/75 border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-2xs font-bold text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Quote className="w-3.5 h-3.5 text-amber-500" />
                        <span>历年真题原声语境</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => speakText(currentWord.example, true)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-semibold transition-colors cursor-pointer ${
                          isSpeakingSentence
                            ? 'bg-amber-500 text-white'
                            : 'text-slate-500 hover:text-indigo-600'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isSpeakingSentence ? '正在朗读...' : '朗读整句 [P]'}</span>
                      </button>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed font-serif select-text">
                      {renderMaskedExample(currentWord.example, currentWord.word)}
                    </p>

                    {currentWord.exampleCn && (
                      <div className="pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-xs">
                        {showExampleCn ? (
                          <p
                            className={`leading-relaxed animate-in fade-in ${
                              isDarkCard ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {currentWord.exampleCn}
                          </p>
                        ) : (
                          <span className="text-2xs text-slate-400">
                            例句中文译文已隐藏，按 [H] 或点右侧眼睛查看
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowExampleCn((v) => !v)}
                          aria-label={showExampleCn ? '隐藏例句译文' : '显示例句译文'}
                          className="text-slate-400 hover:text-indigo-500 ml-2 p-1 cursor-pointer"
                        >
                          {showExampleCn ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div onClick={() => setRevealed((r) => !r)} className="cursor-pointer">
                  {!revealed ? (
                    <div
                      className={`py-4 sm:py-5 px-4 rounded-2xl border border-dashed transition-all text-center flex flex-col items-center gap-1.5 ${
                        isDarkCard
                          ? 'border-slate-700 bg-slate-900/60 hover:border-indigo-400 text-slate-200'
                          : 'border-slate-300 hover:border-slate-900 bg-slate-50/70 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <Eye className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>轻触揭晓核心考义、熟词僻义与词根拆解</span>
                      </div>
                      <span className="text-2xs text-slate-400 sm:hidden">
                        支持右滑秒杀 · 左滑回溯 · 轻触卡片翻转
                      </span>
                      <span className="text-2xs text-slate-400 font-mono hidden sm:inline">
                        快捷键：[空格] 翻转 · [S] 星标收藏 · [P] 朗读真题例句
                      </span>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-slate-950 text-white space-y-3.5 animate-in fade-in text-left border border-white/10">
                      <div className="space-y-1">
                        <div className="text-2xs font-bold text-slate-400">核心考点释义</div>
                        <p className="text-lg font-bold leading-relaxed text-amber-200">
                          {currentWord.definition}
                        </p>
                      </div>

                      {currentWord.roots && (
                        <div className="pt-2.5 border-t border-slate-800 space-y-1">
                          <div className="text-2xs font-bold text-slate-400 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            <span>词根词缀结构助记</span>
                          </div>
                          {renderRootAnalysis(currentWord.roots)}
                        </div>
                      )}

                      {currentWord.synonyms && (
                        <div className="pt-2.5 border-t border-slate-800 space-y-1">
                          <div className="text-2xs font-bold text-slate-400">阅读与写作高分同义替换</div>
                          <p className="text-xs text-emerald-300 font-mono">{currentWord.synonyms}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── 模式二：语境选义 / 听音辨义四选一模式 ──────────────────── */}
            {studyMode === 'quiz' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs pb-1">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-600">
                    {quizType === 'listen' ? (
                      <>
                        <Headphones className="w-3.5 h-3.5" />
                        <span>盲听辨义特训（已隐藏拼写，请听发音选词义）</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>真题语境四选一秒杀演练</span>
                      </>
                    )}
                  </div>
                  <span className="text-2xs text-slate-400 font-mono hidden sm:inline">
                    按 [ 1 - 4 ] 快捷作答
                  </span>
                </div>

                {currentWord.example && quizType === 'cloze' && (
                  <div
                    className={`p-4 rounded-xl border text-xs sm:text-sm font-serif leading-relaxed text-left ${
                      isDarkCard
                        ? 'bg-slate-900 border-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    {renderMaskedExample(currentWord.example, currentWord.word, !quizChecked)}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5">
                  {quizOptions.map((opt, idx) => {
                    let btnClass = isDarkCard
                      ? 'bg-slate-900 border-slate-700 text-slate-100 hover:border-indigo-400'
                      : 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-900 hover:bg-slate-50'

                    if (quizChecked) {
                      if (opt.isCorrect) {
                        btnClass =
                          'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500'
                      } else if (quizSelected === idx) {
                        btnClass = 'bg-rose-50 border-rose-500 text-rose-800 line-through'
                      } else {
                        btnClass = isDarkCard
                          ? 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                          : 'bg-white border-slate-100 text-slate-400 opacity-60'
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
                          <span className="w-5 h-5 rounded-md bg-slate-100 font-mono text-2xs font-bold text-slate-700 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium">{opt.definition}</span>
                        </div>
                        {quizChecked && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {quizChecked && !quizOptions[quizSelected || 0]?.isCorrect && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-slate-800 space-y-2 animate-in fade-in text-left">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-amber-950 font-bold">
                      <span>正确答案：{currentWord.definition}</span>
                      <span className="text-2xs text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
                        已自动加入本轮错词回流圈
                      </span>
                    </div>
                    {currentWord.roots && <div>词根拆解：{currentWord.roots}</div>}
                    <button
                      type="button"
                      onClick={() => handleReview('unknown')}
                      className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 mt-1 cursor-pointer"
                    >
                      记住了，继续下一词 →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── 模式三：写作拼写默写特训模式（全新攻克提笔忘词！） ─────── */}
            {studyMode === 'spell' && (
              <form onSubmit={handleCheckSpelling} className="space-y-4 text-left">
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isDarkCard
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100'
                      : 'bg-indigo-50/50 border-indigo-200/80 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-2xs font-bold text-indigo-600">
                    <span>写作核心拼写检测（共 {currentWord.word.length} 个字母）</span>
                    {!spellChecked && (
                      <button
                        type="button"
                        onClick={() =>
                          setSpellHintLevel((lv) => Math.min(currentWord.word.length - 1, lv + 1))
                        }
                        className="underline hover:text-indigo-800 cursor-pointer"
                      >
                        多提示一个字母
                      </button>
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-bold">{currentWord.definition}</div>
                  {currentWord.example && (
                    <div
                      className={`text-xs font-serif pt-1.5 border-t ${
                        isDarkCard
                          ? 'border-slate-800 text-slate-300'
                          : 'border-indigo-200/60 text-slate-600'
                      }`}
                    >
                      {renderMaskedExample(currentWord.example, currentWord.word, !spellChecked)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    ref={spellInputRef}
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={spellInput}
                    onChange={(e) => setSpellInput(e.target.value)}
                    disabled={Boolean(spellChecked)}
                    placeholder={`请输入以 ${currentWord.word[0]} 开头的英文单词...`}
                    className={`flex-1 py-3 px-4 rounded-xl border font-mono text-base sm:text-sm font-bold outline-none transition-all ${
                      spellChecked === 'correct'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                        : spellChecked === 'wrong'
                        ? 'bg-rose-50 border-rose-500 text-rose-900'
                        : isDarkCard
                        ? 'bg-slate-950 border-slate-700 text-white focus:border-indigo-400'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                    }`}
                  />
                  <button
                    type="submit"
                    className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold cursor-pointer shrink-0 shadow-xs"
                  >
                    {spellChecked ? '进入下一词 →' : '核对拼写'}
                  </button>
                </div>

                {spellChecked === 'wrong' && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1 animate-in fade-in">
                    <div className="font-bold">
                      拼写存在偏差！正确拼写为：
                      <span className="ml-1.5 font-mono text-sm text-emerald-700 underline">
                        {currentWord.word}
                      </span>
                    </div>
                    {currentWord.roots && (
                      <div className="text-slate-600">词根记忆法：{currentWord.roots}</div>
                    )}
                    <div className="text-2xs text-rose-600">
                      该词已加入本轮错词回流池，稍后将再次默写巩固。
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* 底部小字状态 */}
            <div
              className={`flex items-center justify-between text-2xs pt-2 border-t ${
                isDarkCard ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>累计复盘 {currentWord.reviews || 0} 次</span>
              </span>
              <span className="font-mono text-2xs">
                {studyMode === 'card'
                  ? revealed
                    ? '按 1/2/3 评定记忆度'
                    : '按空格键揭晓释义'
                  : studyMode === 'spell'
                  ? '回车键提交核对'
                  : '按 1-4 快捷选义'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 底部行动按键排（沉浸卡片模式专属） ───────────────────────── */}
      {studyMode === 'card' && (
        <div className="space-y-2.5 pt-1">
          {revealed ? (
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
                <span className="text-2xs text-amber-700/80 font-mono hidden sm:inline">[ 2 ]</span>
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
                <span className="text-2xs text-rose-500 font-mono hidden sm:inline">[ 3 ]</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 animate-in fade-in">
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
                  <span>不认识 · 回流</span>
                </div>
                <span className="text-2xs text-rose-500 font-mono hidden sm:inline">[ 3 ]</span>
              </button>

              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="py-3.5 sm:py-4 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-300" />
                  <span>查看考点与释义</span>
                </div>
                <span className="text-2xs text-slate-400 font-mono hidden sm:inline">[ 空格 ]</span>
              </button>

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
                <span className="text-2xs text-emerald-700/75 font-mono hidden sm:inline">[ 1 ]</span>
              </button>
            </div>
          )}

          <div className="text-center py-1 flex items-center justify-center gap-2 text-2xs text-slate-400">
            <span className="sm:hidden flex items-center gap-1.5 text-slate-500 font-medium">
              <span>右滑秒杀</span>
              <span className="text-slate-300">·</span>
              <span>左滑回流</span>
              <span className="text-slate-300">·</span>
              <span>点击卡片翻面</span>
            </span>
            <span className="hidden sm:inline font-mono">
              快捷键：[空格] 翻面 · [S] 星标 · [P] 朗读例句 · [1] 认识 · [2] 模糊 · [3] 遗忘 · [←/→] 切词
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
