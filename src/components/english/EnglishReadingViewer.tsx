import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Award,
  RotateCcw,
  Compass,
  Bookmark,
  Volume2,
  HelpCircle,
  ArrowRight,
  Filter,
} from 'lucide-react'
import type { EnglishReadingPassage, ReadingQuestionItem } from '../../data/englishPracticeData'

interface EnglishReadingViewerProps {
  passage: EnglishReadingPassage
  onBack?: () => void
}

const STORAGE_KEY_READING_PREFIX = 'coreforge_english_reading_record_'

export default function EnglishReadingViewer({ passage, onBack }: EnglishReadingViewerProps) {
  // 作答记录: questionId -> 'A' | 'B' | 'C' | 'D'
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_READING_PREFIX}${passage.id}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [showBilingual, setShowBilingual] = useState<boolean>(false)
  const [showHardGrammarOnly, setShowHardGrammarOnly] = useState<boolean>(false)
  const [activeQuestionId, setActiveQuestionId] = useState<string>(passage.questions[0].id)
  const [highlightParagraph, setHighlightParagraph] = useState<number | null>(null)

  // 左侧段落容器引用，用于平滑滚动定位
  const paragraphRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // 保存作答记录
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_READING_PREFIX}${passage.id}`, JSON.stringify(answers))
    } catch {}
  }, [answers, passage.id])

  const stats = useMemo(() => {
    let correctCount = 0
    let attemptedCount = 0
    passage.questions.forEach((q) => {
      if (answers[q.id]) {
        attemptedCount++
        if (answers[q.id] === q.answer) {
          correctCount++
        }
      }
    })
    const totalCount = passage.questions.length
    const score = correctCount * 2 // 每题 2 分
    const totalScore = totalCount * 2
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0
    return { correctCount, attemptedCount, totalCount, score, totalScore, accuracy }
  }, [passage.questions, answers])

  const handleSelectOption = (qId: string, optKey: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({ ...prev, [qId]: optKey }))
  }

  // 题文联动定位段落
  const handleLocateParagraph = (paraNum: number, qId: string) => {
    setActiveQuestionId(qId)
    setHighlightParagraph(paraNum)
    const el = paragraphRefs.current[paraNum]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleReset = () => {
    if (window.confirm('确定要清空本篇阅读理解的作答记录吗？')) {
      setAnswers({})
      setIsSubmitted(false)
      try {
        localStorage.removeItem(`${STORAGE_KEY_READING_PREFIX}${passage.id}`)
      } catch {}
    }
  }

  const handleSubmit = () => {
    if (stats.attemptedCount < passage.questions.length) {
      if (!window.confirm(`还有 ${passage.questions.length - stats.attemptedCount} 道题未作答，确定要交卷吗？`)) {
        return
      }
    }
    setIsSubmitted(true)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 顶部操作条 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              ← 返回题库
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 text-[11px] font-bold text-indigo-700">
              {passage.examType === 'english_1' ? '英语(一)' : '英语(二)'}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {passage.year} 年真题 · {passage.textNumber}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowBilingual(!showBilingual)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              showBilingual
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {showBilingual ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showBilingual ? '收起逐句译文' : '双语精读对照'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHardGrammarOnly(!showHardGrammarOnly)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              showHardGrammarOnly
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showHardGrammarOnly ? '已过滤重点长难句' : '长难句语法透析'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="清空当前作答"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-xs cursor-pointer"
            >
              交卷判分 ({stats.attemptedCount}/{stats.totalCount})
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>
                得分: {stats.score} / {stats.totalScore} 分 (正确率 {stats.accuracy}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 左右分栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：文章主体与段落标号 (7列) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
            <div>
              <div className="text-[11px] font-bold text-indigo-600">{passage.source}</div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">{passage.title}</h2>
              <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 leading-relaxed">
                📖 <strong>文章立意梗概:</strong> {passage.summary}
              </p>
            </div>

            {/* 逐段逐句渲染 */}
            <div className="space-y-6">
              {passage.paragraphs.map((para) => {
                const isTargetPara = highlightParagraph === para.paraIndex

                return (
                  <div
                    key={para.paraIndex}
                    ref={(el) => {
                      paragraphRefs.current[para.paraIndex] = el
                    }}
                    className={`rounded-2xl p-4 transition-all duration-300 border ${
                      isTargetPara
                        ? 'border-indigo-400 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        PARAGRAPH {para.paraIndex}
                      </span>
                      {isTargetPara && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <Compass className="w-3 h-3" />
                          <span>当前试题定位段落</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-800">
                      {para.sentences.map((sen, sIdx) => {
                        return (
                          <div key={sIdx} className="space-y-1">
                            <p
                              className={`${
                                sen.isHard
                                  ? 'underline decoration-amber-400/80 decoration-wavy decoration-1'
                                  : ''
                              }`}
                            >
                              {sen.en}
                            </p>

                            {/* 逐句译文 */}
                            {showBilingual && (
                              <p className="font-sans text-[11.5px] text-slate-500 pt-0.5 leading-snug">
                                {sen.zh}
                              </p>
                            )}

                            {/* 长难句语法剖析 */}
                            {showHardGrammarOnly && sen.isHard && sen.hardGrammar && (
                              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 font-sans text-[11px] text-amber-900 leading-relaxed mt-1">
                                <span className="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
                                  ⚡ 长难句主干解析:
                                </span>
                                {sen.hardGrammar}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 核心词汇小贴士 */}
            {passage.vocabularyList && passage.vocabularyList.length > 0 && (
              <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2">
                <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                  <span>本篇考研核心生词矩阵:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {passage.vocabularyList.map((v, vIdx) => (
                    <span
                      key={vIdx}
                      className="px-2.5 py-1 rounded-xl bg-white border border-indigo-200 text-xs text-indigo-900 shadow-2xs font-mono"
                    >
                      <strong>{v.word}</strong> <span className="text-[11px] text-slate-500 font-sans">{v.meaning}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：5道单选题与精讲 (5列) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5 sticky top-4 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>精选单项选择 ({passage.questions.length} 题)</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">每题 2 分 · 满分 10 分</span>
            </div>

            {/* 5 道题目列表 */}
            <div className="space-y-6">
              {passage.questions.map((q, qIndex) => {
                const userChoice = answers[q.id]
                const isSelected = userChoice !== undefined
                const isCorrect = userChoice === q.answer
                const isCurrentlyFocused = activeQuestionId === q.id

                return (
                  <div
                    key={q.id}
                    onClick={() => setActiveQuestionId(q.id)}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isCurrentlyFocused
                        ? 'border-indigo-400 bg-slate-50/60 shadow-2xs ring-1 ring-indigo-500/10'
                        : 'border-slate-200/80 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                          {q.number}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {q.category}
                        </span>
                      </div>

                      {/* 题文联动定位按钮 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLocateParagraph(q.targetParagraph, q.id)
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                        title="点击左侧高亮对应段落"
                      >
                        <Compass className="w-3 h-3" />
                        <span>定位第 {q.targetParagraph} 段</span>
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 leading-snug">{q.stem}</p>

                    {/* 4 个选项按钮 */}
                    <div className="space-y-1.5">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const chosen = userChoice === optKey
                        const showCorrectBadge = isSubmitted && q.answer === optKey

                        let optClass =
                          'w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all flex items-start gap-2 cursor-pointer '

                        if (isSubmitted) {
                          if (optKey === q.answer) {
                            optClass += 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-500/20'
                          } else if (chosen && !isCorrect) {
                            optClass += 'bg-rose-50 border-rose-400 text-rose-900 font-bold ring-1 ring-rose-500/20'
                          } else {
                            optClass += 'bg-white border-slate-200 text-slate-500 opacity-60'
                          }
                        } else if (chosen) {
                          optClass += 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-1 ring-indigo-500/20'
                        } else {
                          optClass += 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                        }

                        return (
                          <button
                            key={optKey}
                            type="button"
                            onClick={() => handleSelectOption(q.id, optKey)}
                            className={optClass}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                                chosen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span className="leading-snug">{q.options[optKey]}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* 答案与同义替换精析 */}
                    {isSubmitted && (
                      <div
                        className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2 animate-fade-in ${
                          isCorrect
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-rose-50/70 border-rose-200 text-rose-950'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>答对！正确答案: [{q.answer}]</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>答错，正确答案为: [{q.answer}]</span>
                              </>
                            )}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/80">
                            {q.category}
                          </span>
                        </div>

                        <p className="text-[11px] leading-relaxed pt-1 border-t border-black/5 font-sans">
                          {q.analysis}
                        </p>

                        {q.paraphraseDetail && (
                          <div className="text-[10.5px] p-2 rounded-xl bg-white/80 border border-black/5 text-slate-700 font-sans">
                            <strong className="text-indigo-800">💡 同义替换与干扰项排查:</strong>
                            <p className="mt-0.5">{q.paraphraseDetail}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
