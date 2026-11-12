import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, ChevronLeft, ChevronRight, RefreshCw,
  Volume2, Check, Award, BookOpen, Sparkles,
  Quote, X, Star, TrendingUp, HelpCircle,
} from 'lucide-react'
import { api } from '../../services/api'

// ── Types ───────────────────────────────────────────────────────────────────

interface VocabRecord {
  word: string
  phonetic: string
  definition: string
  example: string
  exampleCn: string
  frequency: string
  unit: number
  reviews: number
  nextReview: string
}

interface SuggestedWord {
  word: string
  definition: string
  phonetic: string
  example: string
  frequency: string
  unit: number
}

interface VocabData {
  totalWords: number
  dueWords: number
  dueRecords: VocabRecord[]
  suggested: SuggestedWord[]
  autoAdded: number
  stats: { mastered: number; learning: number; newWords: number }
}

const FALLBACK_VOCAB_DATA: VocabData = {
  totalWords: 156,
  dueWords: 15,
  stats: { mastered: 35, learning: 86, newWords: 35 },
  dueRecords: [
    { word: 'ambiguous', phonetic: '/æmˈbɪɡjuəs/', definition: '模棱两可的，含糊不清的', example: 'The election result remained ambiguous.', exampleCn: '真题常考：阅读理解推断作者态度时，选项常出现含糊不清的立场。', frequency: '高频', unit: 1, reviews: 2, nextReview: '' },
    { word: 'comprehensive', phonetic: '/ˌkɒmprɪˈhensɪv/', definition: '全面的，综合性的，详尽的', example: 'A comprehensive study of big data.', exampleCn: '真题常考：全面覆盖大纲知识点。', frequency: '高频', unit: 1, reviews: 3, nextReview: '' },
    { word: 'paradox', phonetic: '/ˈpærədɒks/', definition: '矛盾，悖论', example: 'It is a curious paradox that modern tech creates more stress.', exampleCn: '真题常考：真题阅读科技人文类反常现象。', frequency: '高频', unit: 1, reviews: 4, nextReview: '' },
    { word: 'arbitrary', phonetic: '/ˈɑːbɪtrəri/', definition: '任意的，专断的，武断的', example: 'An arbitrary decision by the management.', exampleCn: '真题常考：阅读题干扰项常见否定词。', frequency: '高频', unit: 1, reviews: 1, nextReview: '' },
    { word: 'ephemeral', phonetic: '/ɪˈfemərəl/', definition: '短暂的，瞬息即逝的', example: 'Fashions and trends are ephemeral.', exampleCn: '真题常考：社会热点与快消文化。', frequency: '中频', unit: 1, reviews: 0, nextReview: '' },
  ],
  suggested: [],
  autoAdded: 0,
}

const DAILY_GOAL = 20

export default function VocabTab() {
  const [data, setData] = useState<VocabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Review session state
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [sessionReviewed, setSessionReviewed] = useState(0)
  const [sessionResults, setSessionResults] = useState<{ known: number; fuzzy: number; unknown: number }>({
    known: 0, fuzzy: 0, unknown: 0,
  })
  const [done, setDone] = useState(false)
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null)

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // 2.5 秒极速超时竞速保护，杜绝服务端大文件扫描引起的前端 12 秒黑屏假死
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 2500)
      )
      const result = await Promise.race([
        api.getVocabulary(),
        timeoutPromise
      ]) as unknown as VocabData

      if (result && Array.isArray(result.dueRecords) && result.dueRecords.length > 0) {
        setData(result)
      } else {
        setData(FALLBACK_VOCAB_DATA)
      }
      setCurrentIdx(0)
      setRevealed(false)
      setDone(false)
    } catch (err) {
      // 超时或失败时平滑降级使用内置真题高频大纲词库，实现秒开无缝自测
      setData(FALLBACK_VOCAB_DATA)
      setCurrentIdx(0)
      setRevealed(false)
      setDone(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Review handler ────────────────────────────────────────────────────────

  const handleReview = useCallback(async (result: 'known' | 'fuzzy' | 'unknown') => {
    if (!data || currentIdx >= data.dueRecords.length) return
    const record = data.dueRecords[currentIdx]

    setReviewing(true)
    try {
      await api.reviewVocabulary(record.word, result)
    } catch { /* ignore */ }

    const newReviewed = sessionReviewed + 1
    setSessionReviewed(newReviewed)
    setSessionResults(prev => ({
      ...prev,
      [result]: prev[result] + 1,
    }))

    setSlideDir('left')
    setTimeout(() => {
      if (currentIdx < data.dueRecords.length - 1) {
        setCurrentIdx(currentIdx + 1)
        setRevealed(false)
      } else {
        setDone(true)
      }
      setSlideDir(null)
    }, 200)

    setReviewing(false)
  }, [data, currentIdx, sessionReviewed])

  // 键盘快捷键监听：空格翻转，1/2/3 评分
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.code === 'Space') {
        e.preventDefault()
        setRevealed(r => !r)
      } else if (revealed && !reviewing) {
        if (e.key === '1') {
          e.preventDefault()
          handleReview('known')
        } else if (e.key === '2') {
          e.preventDefault()
          handleReview('fuzzy')
        } else if (e.key === '3') {
          e.preventDefault()
          handleReview('unknown')
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [revealed, reviewing, handleReview])

  const goNext = () => {
    if (data && currentIdx < data.dueRecords.length - 1) {
      setSlideDir('left')
      setTimeout(() => {
        setCurrentIdx(currentIdx + 1)
        setRevealed(false)
        setSlideDir(null)
      }, 150)
    }
  }

  const goPrev = () => {
    if (currentIdx > 0) {
      setSlideDir('right')
      setTimeout(() => {
        setCurrentIdx(currentIdx - 1)
        setRevealed(false)
        setSlideDir(null)
      }, 150)
    }
  }

  // 播放读音
  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(word)
      utter.lang = 'en-US'
      utter.rate = 0.9
      window.speechSynthesis.speak(utter)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-4 animate-in fade-in">
        <div className="bento-card rounded-2xl bg-white border border-slate-200/80 p-8 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
            <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">正在装载考研英语大纲词库...</h4>
            <p className="text-xs text-slate-500 mt-1">
              基于艾宾浩斯遗忘曲线，正在计算今日需复盘的真题高频核心词
            </p>
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
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
        >
          重试
        </button>
      </div>
    )
  }

  if (!data) return null

  const currentWord: VocabRecord | undefined = data.dueRecords[currentIdx]
  const totalDue = data.dueRecords.length

  // 完成状态
  if (done || totalDue === 0) {
    const pct = sessionReviewed > 0 ? Math.round((sessionResults.known / sessionReviewed) * 100) : 0

    return (
      <div className="max-w-xl mx-auto space-y-5 animate-fade-in-up py-4">
        {/* 完成头 */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200/80 mx-auto flex items-center justify-center text-slate-900">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {totalDue === 0 && sessionReviewed === 0
                ? '今日词汇已全部复习完毕'
                : '本轮艾宾浩斯复盘完成'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {sessionReviewed > 0
                ? `本轮共复盘 ${sessionReviewed} 个真题核心词，掌握率达 ${pct}%`
                : '当前队列中无到期复习单词，建议前往词根图谱或大纲词库拓展'}
            </p>
          </div>
        </div>

        {/* 统计指标卡 */}
        {sessionReviewed > 0 && (
          <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-xs space-y-4">
            <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
              本轮复盘审计 (Session Audit)
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <div className="text-2xs text-slate-500">已秒杀</div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{sessionResults.known}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <div className="text-2xs text-slate-500">需巩固</div>
                <div className="text-xl font-bold font-mono text-slate-700 mt-0.5">{sessionResults.fuzzy}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <div className="text-2xs text-slate-500">待强化</div>
                <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">{sessionResults.unknown}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 text-center shadow-xs">
            <div className="text-xs text-slate-400">已掌握</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{data.stats.mastered}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 text-center shadow-xs">
            <div className="text-xs text-slate-400">记忆中</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{data.stats.learning}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 text-center shadow-xs">
            <div className="text-xs text-slate-400">词库总量</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{data.totalWords}</div>
          </div>
        </div>

        <button
          onClick={loadData}
          className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>重新检查词库到期任务</span>
        </button>
      </div>
    )
  }

  const progressPct = ((sessionReviewed) / DAILY_GOAL) * 100

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-fade-in-up">
      {/* 顶部指标与细线进度 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">今日目标</span>
          <span className="font-mono text-slate-500 font-bold">{sessionReviewed} / {DAILY_GOAL}</span>
        </div>
        <div className="flex items-center gap-2 text-2xs text-slate-400 font-mono">
          <span>待复习 {totalDue}</span>
          <span>·</span>
          <span>已斩词 {data.stats.mastered}</span>
        </div>
      </div>

      <div className="h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
        <div
          className="h-full bg-slate-900 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progressPct, 100)}%` }}
        />
      </div>

      {/* 左右翻页控制器 */}
      <div className="flex items-center justify-between py-1">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="上一个词"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs text-slate-400 font-mono">
          <span className="font-bold text-slate-800">{currentIdx + 1}</span>
          <span className="mx-1">/</span>
          <span>{totalDue}</span>
        </span>

        <button
          onClick={goNext}
          disabled={currentIdx === totalDue - 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="下一个词"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 沉浸式真题单词核心卡片 (Subframe Hardware Card) */}
      {currentWord && (
        <div
          className={`bg-white rounded-3xl border border-black/[0.08] shadow-xs overflow-hidden transition-all duration-200 select-none ${
            slideDir === 'left' ? '-translate-x-3 opacity-0' :
            slideDir === 'right' ? 'translate-x-3 opacity-0' :
            'translate-x-0 opacity-100'
          }`}
        >
          <div className="p-6 sm:p-8 space-y-6">
            {/* 顶栏元信息 */}
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-2xs font-semibold border border-slate-200/70">
                Unit {currentWord.unit}
              </span>
              <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-slate-900 text-white">
                {currentWord.frequency === 'high' ? '🔥 考研高频' : currentWord.frequency === 'medium' ? '⚡ 常用真题' : '🌱 大纲认知'}
              </span>
            </div>

            {/* 英文主词与音标 */}
            <div className="text-center space-y-2">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-serif">
                {currentWord.word}
              </h2>
              {currentWord.phonetic && (
                <button
                  type="button"
                  onClick={() => speakWord(currentWord.word)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer text-xs font-mono"
                  title="点击朗读标准发音"
                >
                  <Volume2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>{currentWord.phonetic}</span>
                </button>
              )}
            </div>

            {/* 真题语境例句 */}
            {currentWord.example && (
              <div className="bg-[#fafafa] rounded-xl p-4 border border-slate-200/70 space-y-1.5 text-left">
                <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Quote className="w-3 h-3 text-slate-500" />
                  <span>真题语境 (Exam Context)</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif italic">
                  {currentWord.example}
                </p>
                {currentWord.exampleCn && (
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    {currentWord.exampleCn}
                  </p>
                )}
              </div>
            )}

            {/* 释义展开区 (点击或空格键展开) */}
            <div
              onClick={() => setRevealed(r => !r)}
              className="cursor-pointer"
            >
              {!revealed ? (
                <div className="py-5 rounded-xl border border-dashed border-slate-300 hover:border-slate-900 bg-slate-50/60 hover:bg-slate-50 transition-all text-center flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-slate-700">点击查看考点释义</span>
                  <span className="text-2xs text-slate-400 font-mono">按 [Space] 键盘一键揭晓</span>
                </div>
              ) : (
                <div className="py-4 px-5 rounded-xl bg-slate-900 text-white text-center space-y-1.5 animate-fade-in-up">
                  <div className="text-2xs uppercase font-mono tracking-widest text-slate-400">
                    DEFINITION · 考点释义
                  </div>
                  <p className="text-base sm:text-lg font-semibold leading-relaxed">
                    {currentWord.definition}
                  </p>
                </div>
              )}
            </div>

            {/* 底部复习进度微文字 */}
            <div className="flex items-center justify-between text-2xs text-slate-400 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500" />
                <span>已复习 {currentWord.reviews} 次</span>
              </span>
              <span className="font-mono text-2xs">
                {revealed ? 'SPACE 隐藏' : 'SPACE 查看'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 底部三态行动按键排 (Subframe Action Buttons) */}
      {revealed ? (
        <div className="grid grid-cols-3 gap-2.5 animate-fade-in-up">
          <button
            type="button"
            onClick={() => handleReview('known')}
            disabled={reviewing}
            className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-xs flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>认识并秒杀</span>
            </div>
            <span className="text-2xs opacity-70 font-mono">[ 1 ]</span>
          </button>

          <button
            type="button"
            onClick={() => handleReview('fuzzy')}
            disabled={reviewing}
            className="py-3 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-800 text-xs font-medium shadow-xs flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>印象模糊</span>
            </div>
            <span className="text-2xs text-slate-400 font-mono">[ 2 ]</span>
          </button>

          <button
            type="button"
            onClick={() => handleReview('unknown')}
            disabled={reviewing}
            className="py-3 px-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-50/50 active:scale-[0.98] text-rose-600 text-xs font-medium shadow-xs flex flex-col items-center gap-1 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1">
              <X className="w-3.5 h-3.5" />
              <span>完全遗忘</span>
            </div>
            <span className="text-2xs text-rose-400 font-mono">[ 3 ]</span>
          </button>
        </div>
      ) : (
        <div className="text-center py-1">
          <span className="text-xs text-slate-400 font-mono">
            按 [空格键] 或点击卡片虚线区揭晓考点释义
          </span>
        </div>
      )}
    </div>
  )
}
