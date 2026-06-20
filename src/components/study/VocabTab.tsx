import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, ChevronLeft, ChevronRight, RefreshCw, Plus,
  Volume2, Check, Award, BookOpen, Languages, Sparkles,
  Quote, X, Star, TrendingUp,
} from 'lucide-react'
import { api } from '../../services/api'
import WarmButton from '../ui/WarmButton'

// ─── Types ─────────────────────────────────────────────────────────────────────

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
  stats: { mastered: number; learning: number; newWords: number }
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const DAILY_GOAL = 20

const frequencyThemes: Record<string, {
  label: string
  gradient: string
  accent: string
  badge: string
}> = {
  high: {
    label: '高频',
    gradient: 'from-orange-50 to-amber-50',
    accent: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
  },
  medium: {
    label: '中频',
    gradient: 'from-amber-50 to-yellow-50',
    accent: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
  low: {
    label: '低频',
    gradient: 'from-sage-50 to-emerald-50',
    accent: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
  },
}

// ─── Component ─────────────────────────────────────────────────────────────────

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

  // Add words state
  const [addingSuggested, setAddingSuggested] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.getVocabulary() as unknown as VocabData
      setData(result)
      setCurrentIdx(0)
      setRevealed(false)
      setDone(false)
    } catch {
      setError('加载单词数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Review handler ────────────────────────────────────────────────────────

  const handleReview = async (result: 'known' | 'fuzzy' | 'unknown') => {
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

    // Slide to next card or finish
    setSlideDir('left')
    setTimeout(() => {
      if (currentIdx < data.dueRecords.length - 1) {
        setCurrentIdx(currentIdx + 1)
        setRevealed(false)
      } else {
        setDone(true)
      }
      setSlideDir(null)
    }, 250)

    setReviewing(false)
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  const goNext = () => {
    if (data && currentIdx < data.dueRecords.length - 1) {
      setSlideDir('left')
      setTimeout(() => {
        setCurrentIdx(currentIdx + 1)
        setRevealed(false)
        setSlideDir(null)
      }, 200)
    }
  }

  const goPrev = () => {
    if (currentIdx > 0) {
      setSlideDir('right')
      setTimeout(() => {
        setCurrentIdx(currentIdx - 1)
        setRevealed(false)
        setSlideDir(null)
      }, 200)
    }
  }

  // ── Add words ─────────────────────────────────────────────────────────────

  const handleAddSuggested = async () => {
    if (!data?.suggested.length) return
    setAddingSuggested(true)
    try {
      await api.addVocabulary(
        data.suggested.map(w => ({
          word: w.word,
          definition: w.definition,
          phonetic: w.phonetic,
          example: w.example,
        }))
      )
      await loadData()
    } catch { /* ignore */ }
    setAddingSuggested(false)
  }

  const handleAddSingle = async (word: SuggestedWord) => {
    try {
      await api.addVocabulary([{
        word: word.word,
        definition: word.definition,
        phonetic: word.phonetic,
        example: word.example,
      }])
      if (data) {
        setData({
          ...data,
          suggested: data.suggested.filter(w => w.word !== word.word),
        })
      }
    } catch { /* ignore */ }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await api.generateVocabulary()
      if (result.words.length > 0) {
        await api.addVocabulary(
          result.words.map((w: any) => ({
            word: w.word,
            definition: w.definition,
            phonetic: w.phonetic,
            example: w.example,
          }))
        )
        await loadData()
      }
    } catch { /* ignore */ }
    setGenerating(false)
  }

  // ── Render: Loading ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="w-6 h-6 text-accent-orange animate-spin" />
        <span className="text-sm text-warm-500">加载单词数据...</span>
      </div>
    )
  }

  // ── Render: Error ─────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <span className="text-sm text-accent-rose">{error}</span>
        <WarmButton variant="secondary" size="sm" onClick={loadData}>
          重试
        </WarmButton>
      </div>
    )
  }

  if (!data) return null

  const currentWord: VocabRecord | undefined = data.dueRecords[currentIdx]
  const totalDue = data.dueRecords.length
  const theme = currentWord ? (frequencyThemes[currentWord.frequency] || frequencyThemes['medium']) : frequencyThemes['medium']

  // ── Render: Done / Stats Summary ──────────────────────────────────────────

  if (done || totalDue === 0) {
    const pct = sessionReviewed > 0 ? Math.round((sessionResults.known / sessionReviewed) * 100) : 0

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in-up">
        {/* Completion header */}
        <div className="text-center space-y-4 py-8">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-accent-sage/10 animate-pulse-soft" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-accent-sage/20 to-accent-mint/20 flex items-center justify-center">
              <Award className="w-10 h-10 text-accent-sage" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-warm-800">
              {totalDue === 0 && sessionReviewed === 0
                ? '今日单词已全部复习完毕'
                : '本轮复习完成！'}
            </h3>
            <p className="text-sm text-warm-500 mt-1">
              {sessionReviewed > 0
                ? `本次复习了 ${sessionReviewed} 个单词`
                : '暂时没有需要复习的单词'}
            </p>
          </div>
        </div>

        {/* Session stats */}
        {sessionReviewed > 0 && (
          <div className="bg-surface border border-cream-200 rounded-2xl p-6 space-y-5">
            <div className="text-xs font-medium text-warm-500 uppercase tracking-wider">本次复习统计</div>

            {/* Accuracy ring */}
            <div className="flex items-center justify-center gap-8">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e7e5e4" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#7c9a72" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${pct * 2.51} 251`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-warm-800">{pct}%</span>
                  <span className="text-[10px] text-warm-400">掌握率</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: '认识', count: sessionResults.known, color: 'text-accent-sage', bg: 'bg-accent-sage' },
                  { label: '模糊', count: sessionResults.fuzzy, color: 'text-accent-amber', bg: 'bg-accent-amber' },
                  { label: '不认识', count: sessionResults.unknown, color: 'text-accent-rose', bg: 'bg-accent-rose' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
                    <span className="text-sm text-warm-600 w-12">{item.label}</span>
                    <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Accuracy bar */}
            <div className="flex h-2 rounded-full overflow-hidden bg-cream-200">
              <div
                className="bg-accent-sage transition-all duration-500"
                style={{ width: `${(sessionResults.known / sessionReviewed) * 100}%` }}
              />
              <div
                className="bg-accent-amber transition-all duration-500"
                style={{ width: `${(sessionResults.fuzzy / sessionReviewed) * 100}%` }}
              />
              <div
                className="bg-accent-rose transition-all duration-500"
                style={{ width: `${(sessionResults.unknown / sessionReviewed) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Overall stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '已掌握', value: data.stats.mastered, icon: Check, color: 'text-accent-sage' },
            { label: '学习中', value: data.stats.learning, icon: TrendingUp, color: 'text-accent-amber' },
            { label: '总词数', value: data.totalWords, icon: BookOpen, color: 'text-warm-800' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface border border-cream-200 rounded-2xl px-4 py-5 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-2 ${stat.color} opacity-50`} />
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-warm-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <WarmButton variant="secondary" onClick={loadData} className="flex-1 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> 刷新数据
          </WarmButton>
          <WarmButton variant="primary" onClick={() => setShowAddSection(s => !s)} className="flex-1 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> 添加新词
          </WarmButton>
        </div>

        {showAddSection && (
          <AddWordsSection
            suggested={data.suggested}
            addingAll={addingSuggested}
            generating={generating}
            onAddAll={handleAddSuggested}
            onAddSingle={handleAddSingle}
            onGenerate={handleGenerate}
          />
        )}
      </div>
    )
  }

  // ── Render: Review in progress ────────────────────────────────────────────

  const progressPct = ((sessionReviewed) / DAILY_GOAL) * 100

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-fade-in-up">
      {/* Top bar: progress + stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent-orange" />
          <span className="text-xs text-warm-500">
            今日 <span className="font-bold text-warm-800">{sessionReviewed}</span>/{DAILY_GOAL}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-warm-400">
          <span>待复习 {totalDue}</span>
          <span className="w-1 h-1 rounded-full bg-cream-300" />
          <span>已掌握 {data.stats.mastered}</span>
        </div>
      </div>

      {/* Thin progress bar */}
      <div className="h-1 bg-cream-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-orange rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progressPct, 100)}%` }}
        />
      </div>

      {/* Card navigation counter */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-warm-500 hover:text-warm-700 hover:bg-cream-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs text-warm-400 tabular-nums">
          <span className="font-bold text-warm-700">{currentIdx + 1}</span>
          <span className="mx-1">/</span>
          <span>{totalDue}</span>
        </span>

        <button
          onClick={goNext}
          disabled={currentIdx === totalDue - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-warm-500 hover:text-warm-700 hover:bg-cream-100 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Immersive Word Card ─────────────────────────────────────────────── */}
      {currentWord && (
        <div
          className={`relative overflow-hidden rounded-3xl border border-cream-200 transition-all duration-250 ${
            slideDir === 'left' ? '-translate-x-4 opacity-0' :
            slideDir === 'right' ? 'translate-x-4 opacity-0' :
            'translate-x-0 opacity-100'
          }`}
        >
          {/* Gradient accent top bar */}
          <div className={`h-1.5 bg-gradient-to-r ${
            currentWord.frequency === 'high' ? 'from-orange-400 to-amber-400' :
            currentWord.frequency === 'low' ? 'from-emerald-400 to-sage-400' :
            'from-amber-400 to-yellow-400'
          }`} />

          <div className={`bg-gradient-to-b ${theme.gradient} to-white px-8 pt-8 pb-6`}>
            {/* Unit + Frequency badges */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/70 text-warm-500 font-medium backdrop-blur-sm">
                Unit {currentWord.unit}
              </span>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${theme.badge}`}>
                {theme.label}
              </span>
            </div>

            {/* Word display */}
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-warm-900 tracking-tight mb-2">
                {currentWord.word}
              </h2>
              {currentWord.phonetic && (
                <div className="flex items-center justify-center gap-1.5 text-warm-400">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-sm font-light">{currentWord.phonetic}</span>
                </div>
              )}
            </div>

            {/* Example sentence (hero element) */}
            {currentWord.example && (
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-5 mb-5 border border-white/80">
                <Quote className={`absolute top-3 left-3 w-5 h-5 ${theme.accent} opacity-20`} />
                <p className="text-sm text-warm-700 leading-relaxed pl-4 italic">
                  {currentWord.example}
                </p>
                {currentWord.exampleCn && (
                  <p className="text-xs text-warm-400 leading-relaxed pl-4 mt-2">
                    {currentWord.exampleCn}
                  </p>
                )}
              </div>
            )}

            {/* Definition reveal area */}
            <div
              className="cursor-pointer"
              onClick={() => setRevealed(r => !r)}
            >
              {!revealed ? (
                <div className="text-center py-6 rounded-2xl border-2 border-dashed border-cream-300 hover:border-accent-orange/40 hover:bg-accent-orange/5 transition-all">
                  <span className="text-sm text-warm-400">
                    点击查看释义
                  </span>
                </div>
              ) : (
                <div className="text-center py-5 animate-fade-in-up">
                  <div className={`text-[10px] uppercase tracking-widest font-medium mb-2 ${theme.accent}`}>
                    释义
                  </div>
                  <p className="text-lg text-warm-800 font-medium leading-relaxed">
                    {currentWord.definition}
                  </p>
                </div>
              )}
            </div>

            {/* Review count footer */}
            <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-warm-400">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                复习 {currentWord.reviews} 次
              </span>
              <span className="w-1 h-1 rounded-full bg-cream-300" />
              <span>
                {revealed ? '点击卡片隐藏释义' : '点击卡片显示释义'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Buttons ──────────────────────────────────────────────────── */}
      {revealed && (
        <div className="flex gap-3 animate-fade-in-up">
          <button
            onClick={() => handleReview('known')}
            disabled={reviewing}
            className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl bg-accent-sage/8 border border-accent-sage/20 text-accent-sage text-sm font-medium hover:bg-accent-sage/15 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            <span>认识</span>
          </button>
          <button
            onClick={() => handleReview('fuzzy')}
            disabled={reviewing}
            className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl bg-accent-amber/8 border border-accent-amber/20 text-accent-amber text-sm font-medium hover:bg-accent-amber/15 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            <span>模糊</span>
          </button>
          <button
            onClick={() => handleReview('unknown')}
            disabled={reviewing}
            className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl bg-accent-rose/8 border border-accent-rose/20 text-accent-rose text-sm font-medium hover:bg-accent-rose/15 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            <span>不认识</span>
          </button>
        </div>
      )}

      {!revealed && (
        <div className="text-center py-2">
          <span className="text-xs text-warm-400">点击释义区域查看后评分</span>
        </div>
      )}

      {/* ── Add Words Section (collapsible) ─────────────────────────────────── */}
      <div className="pt-2">
        <button
          onClick={() => setShowAddSection(s => !s)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-cream-100 border border-cream-200 text-sm text-warm-600 hover:bg-cream-200 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent-sage" />
            添加新词
            {data.suggested.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-orange/15 text-accent-orange">
                {data.suggested.length} 个推荐
              </span>
            )}
          </span>
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showAddSection ? 'rotate-90' : ''}`} />
        </button>

        {showAddSection && (
          <AddWordsSection
            suggested={data.suggested}
            addingAll={addingSuggested}
            generating={generating}
            onAddAll={handleAddSuggested}
            onAddSingle={handleAddSingle}
            onGenerate={handleGenerate}
          />
        )}
      </div>
    </div>
  )
}

// ─── Add Words Section (shared sub-component) ─────────────────────────────────

function AddWordsSection({
  suggested,
  addingAll,
  generating,
  onAddAll,
  onAddSingle,
  onGenerate,
}: {
  suggested: SuggestedWord[]
  addingAll: boolean
  generating: boolean
  onAddAll: () => void
  onAddSingle: (word: SuggestedWord) => void
  onGenerate: () => void
}) {
  return (
    <div className="mt-3 bg-cream-100/60 border border-cream-200 rounded-2xl p-5 space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-warm-600">
          <Languages className="w-3.5 h-3.5 text-accent-sage" />
          扩充词库
        </div>
        <WarmButton
          variant="primary"
          size="sm"
          onClick={onGenerate}
          disabled={generating}
          className="flex items-center gap-1.5"
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          AI 生成新词
        </WarmButton>
      </div>

      {suggested.length > 0 ? (
        <>
          <div className="text-[11px] text-warm-400">
            推荐添加的单词 ({suggested.length} 个) - 来自词库分析
          </div>
          <div className="space-y-2 max-h-60 overflow-auto">
            {suggested.map(w => (
              <div
                key={w.word}
                className="flex items-center gap-3 px-3 py-2.5 bg-surface border border-cream-200 rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-warm-800">{w.word}</span>
                    {w.phonetic && (
                      <span className="text-[10px] text-warm-400">{w.phonetic}</span>
                    )}
                    {frequencyThemes[w.frequency] && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${frequencyThemes[w.frequency].badge}`}>
                        {frequencyThemes[w.frequency].label}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-warm-500 mt-0.5 truncate">{w.definition}</div>
                </div>
                <button
                  onClick={() => onAddSingle(w)}
                  className="shrink-0 p-1.5 rounded-lg text-accent-sage hover:bg-accent-sage/10 transition-colors"
                  title="添加此词"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <WarmButton variant="secondary" size="sm" onClick={onAddAll} disabled={addingAll} className="w-full">
            {addingAll ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> 添加中...
              </span>
            ) : (
              `+ 全部添加到词库 (${suggested.length})`
            )}
          </WarmButton>
        </>
      ) : (
        <div className="text-center py-4 text-xs text-warm-400">
          暂无推荐单词，点击 "AI 生成新词" 让 AI 从笔记中提取专业词汇
        </div>
      )}
    </div>
  )
}
