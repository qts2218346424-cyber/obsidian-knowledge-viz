import MarkdownRenderer from '../../../components/MarkdownRenderer'
import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { XCircle, Loader2, Check, ThumbsUp, ThumbsDown, Minus, Sparkles } from 'lucide-react'
import { api, type DailyReviewData } from '../../../services/api'
import { formatQuestionContent } from '../utils'

const StepTutorModal = lazy(() => import('../../../components/study/StepTutorModal'))

export default function DailyErrorTab() {
  const [data, setData] = useState<DailyReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    api.getDailyReview()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleResult = async (result: 'mastered' | 'easy' | 'hard') => {
    if (!data || currentIdx >= data.dueQuestions.length) return
    const q = data.dueQuestions[currentIdx]
    const date = q._sourceFile?.replace('.md', '') || data.date

    setReviewing(true)
    try {
      await api.markReviewComplete(date, currentIdx, result)
    } catch { /* ignore */ }

    if (currentIdx < data.dueQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setShowAnswer(false)
    } else {
      setCurrentIdx(0)
      setShowAnswer(false)
      await loadData()
    }
    setReviewing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-warm-500 py-12 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> 正在加载今日错题…
      </div>
    )
  }

  if (!data || data.dueQuestions.length === 0) {
    return (
      <div className="bg-surface border border-slate-200/80 rounded-xl text-center py-16 space-y-4 max-w-xl mx-auto">
        <Check className="w-12 h-12 mx-auto text-accent-sage/40" />
        <div className="text-base font-bold text-warm-800">太棒了！今日没有待复习的错题</div>
        <div className="text-xs text-warm-400">
          错题库共收录 {data?.stats.totalQuestions || 0} 道考研错题，已彻底掌握 {data?.stats.masteredCount || 0} 道
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-cream-200 text-xs font-semibold text-warm-600 hover:bg-cream-300 transition-colors"
        >
          刷新检查
        </button>
      </div>
    )
  }

  const currentQ = data.dueQuestions[currentIdx]
  const stats = data.stats

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-surface border border-cream-200 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-warm-400">今日待复习</div>
          <div className="text-xl font-bold text-accent-amber">{stats.dueCount}</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-warm-400">总错题数</div>
          <div className="text-xl font-bold text-warm-800">{stats.totalQuestions}</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-warm-400">已掌握</div>
          <div className="text-xl font-bold text-accent-sage">{stats.masteredCount}</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-warm-400">当前题号</div>
          <div className="text-xl font-bold text-accent-orange">
            {currentIdx + 1}/{data.dueQuestions.length}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-warm-500 font-semibold">
              错题复盘 {currentIdx + 1} / {data.dueQuestions.length}
            </span>
            {currentQ.source && (
              <span className="ml-auto text-2xs text-warm-400 truncate max-w-[200px]">
                来源: {currentQ.source}
              </span>
            )}
          </div>
          <div className="text-sm sm:text-base text-warm-800 font-medium leading-relaxed">
            <MarkdownRenderer content={formatQuestionContent(currentQ.question)} />
          </div>
          {currentQ.userAnswer && (
            <div className="px-3 py-2 bg-rose-500/5 border border-rose-500/10 rounded-lg">
              <span className="text-2xs text-rose-500 block mb-1">你记录的错误解答：</span>
              <div className="text-xs text-rose-700">
                <MarkdownRenderer content={currentQ.userAnswer} inline />
              </div>
            </div>
          )}
        </div>

        {showAnswer ? (
          <div className="border-t border-cream-200 bg-cream-100/50 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent-sage" />
              <span className="text-xs text-accent-sage font-bold">正确答案与推导</span>
            </div>
            <div className="text-sm text-warm-800 leading-relaxed font-semibold">
              <MarkdownRenderer content={currentQ.correctAnswer} inline />
            </div>
            {currentQ.explanation && (
              <div className="mt-2 px-3.5 py-2.5 bg-cream-200/60 rounded-xl">
                <span className="text-2xs text-warm-400 block mb-1">名师解析与考点归因：</span>
                <div className="text-xs text-warm-700 leading-relaxed">
                  <MarkdownRenderer content={currentQ.explanation} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-t border-cream-200 p-4 flex items-center justify-center gap-4 bg-cream-50/50">
            <button
              onClick={() => setTutorOpen(true)}
              className="px-4 py-2 rounded-xl bg-accent-orange/10 hover:bg-accent-orange/20 text-accent-orange text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              💡 AI 启发式分步辅导 (切入点/挑刺)
            </button>
            <button
              onClick={() => setShowAnswer(true)}
              className="px-4 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-warm-700 text-xs font-semibold transition-colors"
            >
              点击查看正确答案与解析
            </button>
          </div>
        )}
      </div>

      {tutorOpen && (
        <Suspense fallback={null}>
          <StepTutorModal
            isOpen
            onClose={() => setTutorOpen(false)}
            initialQuestion={currentQ.question}
            initialOptions=""
          />
        </Suspense>
      )}

      {showAnswer && (
        <div className="flex gap-3">
          <button
            onClick={() => handleResult('hard')}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm font-semibold hover:bg-accent-rose/20 transition-colors disabled:opacity-50"
          >
            <ThumbsDown className="w-4 h-4" /> 仍有疑惑 (留存)
          </button>
          <button
            onClick={() => handleResult('easy')}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-sm font-semibold hover:bg-accent-amber/20 transition-colors disabled:opacity-50"
          >
            <Minus className="w-4 h-4" /> 稍加思索 (3天后)
          </button>
          <button
            onClick={() => handleResult('mastered')}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-sage/10 border border-accent-sage/20 text-accent-sage text-sm font-semibold hover:bg-accent-sage/20 transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" /> 完全掌握 (归档)
          </button>
        </div>
      )}
    </div>
  )
}
