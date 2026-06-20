import { useState, useEffect, useCallback } from 'react'
import {
  Loader2, ChevronLeft, ChevronRight, RefreshCw, Plus,
  Volume2, Check, Award, BookOpen, Languages, Sparkles,
} from 'lucide-react'
import { api } from '../../services/api'
import ProgressBar from '../ui/ProgressBar'
import WarmButton from '../ui/WarmButton'

// ─── Types (new VocabData format) ─────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const DAILY_GOAL = 20

const frequencyLabels: Record<string, { label: string; color: string }> = {
  high: { label: '高频', color: 'bg-accent-rose/15 text-accent-rose' },
  medium: { label: '中频', color: 'bg-accent-amber/15 text-accent-amber' },
  low: { label: '低频', color: 'bg-accent-sage/15 text-accent-sage' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VocabTab() {
  const [data, setData] = useState<VocabData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Review session state
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [sessionReviewed, setSessionReviewed] = useState(0)
  const [sessionResults, setSessionResults] = useState<{ known: number; fuzzy: number; unknown: number }>({
    known: 0, fuzzy: 0, unknown: 0,
  })
  const [done, setDone] = useState(false)

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
      setFlipped(false)
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
      [result === 'known' ? 'known' : result === 'fuzzy' ? 'fuzzy' : 'unknown']:
        prev[result === 'known' ? 'known' : result === 'fuzzy' ? 'fuzzy' : 'unknown'] + 1,
    }))

    // Move to next card or finish
    if (currentIdx < data.dueRecords.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setFlipped(false)
    } else {
      setDone(true)
    }

    setReviewing(false)
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  const goNext = () => {
    if (data && currentIdx < data.dueRecords.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setFlipped(false)
    }
  }

  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
      setFlipped(false)
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
      // Remove from suggested list locally
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
  const freqInfo = currentWord ? frequencyLabels[currentWord.frequency] || frequencyLabels['medium'] : null

  // ── Render: Done / Stats Summary ──────────────────────────────────────────

  if (done || totalDue === 0) {
    return (
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in-up">
        {/* Completion header */}
        <div className="text-center space-y-3 py-6">
          <div className="w-16 h-16 rounded-full bg-accent-sage/15 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8 text-accent-sage" />
          </div>
          <h3 className="text-lg font-bold text-warm-800">
            {totalDue === 0 && sessionReviewed === 0
              ? '今日单词已全部复习完毕'
              : '本轮复习完成！'}
          </h3>
          <p className="text-sm text-warm-500">
            {sessionReviewed > 0
              ? `本次复习了 ${sessionReviewed} 个单词`
              : '暂时没有需要复习的单词'}
          </p>
        </div>

        {/* Session stats */}
        {sessionReviewed > 0 && (
          <div className="bg-surface border border-cream-200 rounded-2xl p-6 space-y-4">
            <div className="text-xs font-medium text-warm-500 uppercase tracking-wider">本次复习统计</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-sage">{sessionResults.known}</div>
                <div className="text-xs text-warm-400 mt-1">认识</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-amber">{sessionResults.fuzzy}</div>
                <div className="text-xs text-warm-400 mt-1">模糊</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-rose">{sessionResults.unknown}</div>
                <div className="text-xs text-warm-400 mt-1">不认识</div>
              </div>
            </div>

            {/* Accuracy bar */}
            {sessionReviewed > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-warm-400">
                  <span>掌握率</span>
                  <span>{Math.round((sessionResults.known / sessionReviewed) * 100)}%</span>
                </div>
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
          </div>
        )}

        {/* Overall stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface border border-cream-200 rounded-2xl px-4 py-4 text-center">
            <div className="text-xs text-warm-400">已掌握</div>
            <div className="text-2xl font-bold text-accent-sage mt-1">{data.stats.mastered}</div>
          </div>
          <div className="bg-surface border border-cream-200 rounded-2xl px-4 py-4 text-center">
            <div className="text-xs text-warm-400">学习中</div>
            <div className="text-2xl font-bold text-accent-amber mt-1">{data.stats.learning}</div>
          </div>
          <div className="bg-surface border border-cream-200 rounded-2xl px-4 py-4 text-center">
            <div className="text-xs text-warm-400">总词数</div>
            <div className="text-2xl font-bold text-warm-800 mt-1">{data.totalWords}</div>
          </div>
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

        {/* Add words section (conditionally shown) */}
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

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in-up">
      {/* Daily goal banner */}
      <div className="bg-surface border border-cream-200 rounded-2xl px-5 py-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent-orange" />
            <span className="text-sm font-medium text-warm-700">今日进度</span>
          </div>
          <span className="text-sm font-bold text-warm-800">
            {sessionReviewed}<span className="text-warm-400 font-normal">/{DAILY_GOAL} 词</span>
          </span>
        </div>
        <ProgressBar
          value={sessionReviewed}
          max={DAILY_GOAL}
          color="bg-accent-orange"
          height={6}
        />
        <div className="flex items-center justify-between text-[11px] text-warm-400">
          <span>待复习 {totalDue} 词</span>
          <span>已掌握 {data.stats.mastered} / {data.totalWords}</span>
        </div>
      </div>

      {/* Card counter + refresh */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-warm-500">
          第 <span className="font-bold text-warm-700">{currentIdx + 1}</span> / {totalDue} 词
        </span>
        <button
          onClick={loadData}
          className="p-1.5 rounded-lg text-warm-400 hover:text-warm-600 hover:bg-cream-100 transition-colors"
          title="刷新"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Flip Card ─────────────────────────────────────────────────────── */}
      {currentWord && (
        <div
          className={`flip-card cursor-pointer ${flipped ? 'flipped' : ''}`}
          onClick={() => setFlipped(f => !f)}
          style={{ minHeight: 320 }}
        >
          <div className="flip-card-inner relative w-full" style={{ minHeight: 320 }}>
            {/* ── Front: Word + Phonetic + Frequency ─────────────────────── */}
            <div
              className="flip-card-front absolute inset-0 bg-surface border border-cream-200 rounded-2xl p-8 flex flex-col items-center justify-center"
              style={{ minHeight: 320 }}
            >
              {/* Frequency badge */}
              {freqInfo && (
                <span className={`absolute top-4 right-4 text-[10px] px-2.5 py-1 rounded-full font-medium ${freqInfo.color}`}>
                  {freqInfo.label}
                </span>
              )}

              {/* Unit badge */}
              <span className="absolute top-4 left-4 text-[10px] px-2.5 py-1 rounded-full bg-cream-200 text-warm-500">
                Unit {currentWord.unit}
              </span>

              {/* Word */}
              <div className="text-3xl font-bold text-warm-800 mb-3">{currentWord.word}</div>

              {/* Phonetic */}
              {currentWord.phonetic && (
                <div className="flex items-center gap-1.5 text-warm-400">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-sm">{currentWord.phonetic}</span>
                </div>
              )}

              {/* Review count */}
              <div className="absolute bottom-5 flex items-center gap-3 text-[11px] text-warm-400">
                <span>复习 {currentWord.reviews} 次</span>
                <span className="w-1 h-1 rounded-full bg-cream-300" />
                <span>点击翻转查看释义</span>
              </div>
            </div>

            {/* ── Back: Definition + Example + Translation ──────────────── */}
            <div
              className="flip-card-back absolute inset-0 bg-cream-100 border border-cream-300 rounded-2xl p-8 flex flex-col items-center justify-center"
              style={{ minHeight: 320 }}
            >
              {/* Chinese definition */}
              <div className="text-[10px] text-accent-sage uppercase tracking-wider mb-3 font-medium">释义</div>
              <div className="text-lg text-warm-800 font-medium text-center mb-5 leading-relaxed">
                {currentWord.definition}
              </div>

              {/* English example */}
              {currentWord.example && (
                <div className="space-y-2 w-full max-w-sm">
                  <div className="text-[10px] text-accent-orange uppercase tracking-wider font-medium">例句</div>
                  <div className="text-sm text-warm-700 text-center italic leading-relaxed">
                    &ldquo;{currentWord.example}&rdquo;
                  </div>
                  {currentWord.exampleCn && (
                    <div className="text-xs text-warm-500 text-center leading-relaxed">
                      {currentWord.exampleCn}
                    </div>
                  )}
                </div>
              )}

              <div className="absolute bottom-5 text-[11px] text-warm-400">
                点击翻回正面
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-cream-200 text-warm-600 hover:bg-cream-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> 上一个
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1">
          {data.dueRecords.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIdx(i); setFlipped(false) }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIdx
                  ? 'bg-accent-orange'
                  : i < currentIdx
                    ? 'bg-accent-sage/50'
                    : 'bg-cream-300 hover:bg-cream-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={currentIdx === totalDue - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-cream-200 text-warm-600 hover:bg-cream-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          下一个 <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Review Buttons (only when flipped) ──────────────────────────────── */}
      {flipped && (
        <div className="flex gap-3 animate-fade-in-up">
          <button
            onClick={() => handleReview('known')}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent-sage/10 border border-accent-sage/25 text-accent-sage text-sm font-medium hover:bg-accent-sage/20 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> 认识
          </button>
          <button
            onClick={() => handleReview('fuzzy')}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent-amber/10 border border-accent-amber/25 text-accent-amber text-sm font-medium hover:bg-accent-amber/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> 模糊
          </button>
          <button
            onClick={() => handleReview('unknown')}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent-rose/10 border border-accent-rose/25 text-accent-rose text-sm font-medium hover:bg-accent-rose/20 transition-all disabled:opacity-50"
          >
            <Languages className="w-4 h-4" /> 不认识
          </button>
        </div>
      )}

      {!flipped && (
        <div className="text-center">
          <span className="text-xs text-warm-400">点击卡片翻转查看释义后再评分</span>
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
                    {frequencyLabels[w.frequency] && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${frequencyLabels[w.frequency].color}`}>
                        {frequencyLabels[w.frequency].label}
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
