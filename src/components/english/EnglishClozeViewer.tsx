import React, { useState, useMemo, useEffect } from 'react'
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { EnglishClozeExam, ClozeQuestionItem } from '../../data/englishPracticeData'

interface EnglishClozeViewerProps {
  exam: EnglishClozeExam
  onBack?: () => void
}

const STORAGE_KEY_CLOZE_PREFIX = 'coreforge_english_cloze_record_'

export default function EnglishClozeViewer({ exam, onBack }: EnglishClozeViewerProps) {
  // 用户作答状态：number -> 'A' | 'B' | 'C' | 'D'
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_CLOZE_PREFIX}${exam.id}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // 是否已交卷判定
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  // 当前聚焦选中的题号 (1~20)
  const [activeNumber, setActiveNumber] = useState<number>(1)
  // 是否展开双语全文翻译
  const [showFullTranslation, setShowFullTranslation] = useState<boolean>(false)
  // 即时批改模式开关 (默认统考模式)
  const [instantFeedback, setInstantFeedback] = useState<boolean>(false)

  // 保存作答记录
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_CLOZE_PREFIX}${exam.id}`, JSON.stringify(answers))
    } catch {}
  }, [answers, exam.id])

  // 当前选中试题
  const activeQuestion = useMemo(() => {
    return exam.questions.find((q) => q.number === activeNumber) || exam.questions[0]
  }, [exam.questions, activeNumber])

  // 成绩统计
  const stats = useMemo(() => {
    let correctCount = 0
    let attemptedCount = 0
    exam.questions.forEach((q) => {
      if (answers[q.number]) {
        attemptedCount++
        if (answers[q.number] === q.answer) {
          correctCount++
        }
      }
    })
    const totalCount = exam.questions.length
    const score = Number((correctCount * 0.5).toFixed(1))
    const totalScore = Number((totalCount * 0.5).toFixed(1))
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0
    return { correctCount, attemptedCount, totalCount, score, totalScore, accuracy }
  }, [exam.questions, answers])

  // 选择答案
  const handleSelectOption = (num: number, optKey: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({ ...prev, [num]: optKey }))
    // 自动平滑切至下一题
    if (num < exam.questions.length && !answers[num + 1]) {
      setActiveNumber(num + 1)
    }
  }

  // 重置
  const handleReset = () => {
    if (window.confirm('确定要清空本篇完形填空的作答记录吗？')) {
      setAnswers({})
      setIsSubmitted(false)
      setActiveNumber(1)
      try {
        localStorage.removeItem(`${STORAGE_KEY_CLOZE_PREFIX}${exam.id}`)
      } catch {}
    }
  }

  // 交卷
  const handleSubmit = () => {
    if (stats.attemptedCount < exam.questions.length) {
      if (!window.confirm(`还有 ${exam.questions.length - stats.attemptedCount} 道空未填写，确定要交卷吗？`)) {
        return
      }
    }
    setIsSubmitted(true)
  }

  /**
   * 将文章中的 [1], [2]... 替换为可交互的高亮词槽按钮
   */
  const renderedArticleSegments = useMemo(() => {
    const regex = /\[(\d+)\]/g
    const text = exam.fullArticleEn
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index
      const num = parseInt(match[1], 10)
      const q = exam.questions.find((item) => item.number === num)

      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex))
      }

      const userChoice = answers[num]
      const chosenWord = userChoice && q ? q.options[userChoice] : null
      const isCurrent = activeNumber === num
      const showAnswerStatus = (isSubmitted || instantFeedback) && userChoice

      let badgeClasses = 'border transition-all cursor-pointer inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold select-none '

      if (showAnswerStatus) {
        if (userChoice === q?.answer) {
          badgeClasses += 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/20 '
        } else {
          badgeClasses += 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-500/20 '
        }
      } else if (isCurrent) {
        badgeClasses += 'bg-indigo-600 border-indigo-700 text-white shadow-sm ring-2 ring-indigo-400/30 '
      } else if (chosenWord) {
        badgeClasses += 'bg-indigo-50 border-indigo-200 text-indigo-900 '
      } else {
        badgeClasses += 'bg-slate-100 hover:bg-indigo-50 border-slate-300 text-slate-700 '
      }

      parts.push(
        <button
          key={`slot-${num}`}
          type="button"
          onClick={() => setActiveNumber(num)}
          className={badgeClasses}
          title={`点击定位第 ${num} 题`}
        >
          <span className="opacity-70 text-[10px]">[{num}]</span>
          <span>{chosenWord || '____'}</span>
        </button>
      )

      lastIndex = matchIndex + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts
  }, [exam.fullArticleEn, exam.questions, answers, activeNumber, isSubmitted, instantFeedback])

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 顶部控制栏 */}
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
              {exam.examType === 'english_1' ? '英语(一)' : '英语(二)'}
            </span>
            <span className="text-xs font-bold text-slate-800">{exam.year} 年真题 · 完形填空</span>
          </div>
        </div>

        {/* 做题状态徽章与模式开关 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={instantFeedback}
              onChange={(e) => setInstantFeedback(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-[11px] font-medium">即时对答案</span>
          </label>

          <button
            type="button"
            onClick={() => setShowFullTranslation(!showFullTranslation)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
              showFullTranslation
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {showFullTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showFullTranslation ? '收起全文译文' : '查看全文译文'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="清空当前作答"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-xs cursor-pointer"
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

      {/* 主界面：左右分栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 左侧：文章互动阅读器 (7列) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-4">
            <div>
              <div className="text-[11px] font-bold text-indigo-600">{exam.source}</div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
                {exam.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  约 {exam.wordCount} 词
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                  主题：{exam.topic}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 leading-relaxed">
              💡 <strong>答题说明：</strong> 点击文中任意 <strong>[数字]</strong> 空白处，右侧面板将即时同步该题选项；选中选项后，空位将实时填入所选单词。
            </div>

            {/* 英文段落主干 (带交互槽位) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/50 border border-slate-200/80 font-mono text-xs sm:text-[13px] text-slate-800 leading-loose whitespace-pre-wrap select-text">
              {renderedArticleSegments}
            </div>

            {/* 全文双语翻译抽屉 */}
            {showFullTranslation && (
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-2 animate-fade-in">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>官方权威全文参考翻译:</span>
                </div>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {exam.fullArticleZh}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：答题面板与考点解析 (5列) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4 sticky top-4">
            {/* 顶部快速跳题卡 */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span>题号答题卡</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  已作答 {stats.attemptedCount}/{stats.totalCount}
                </span>
              </div>
              <div className="grid grid-cols-10 gap-1.5">
                {exam.questions.map((q) => {
                  const userAns = answers[q.number]
                  const isCurrent = activeNumber === q.number
                  const showStatus = (isSubmitted || instantFeedback) && userAns
                  let btnColor = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'

                  if (showStatus) {
                    btnColor =
                      userAns === q.answer
                        ? 'bg-emerald-500 border-emerald-600 text-white font-bold'
                        : 'bg-rose-500 border-rose-600 text-white font-bold'
                  } else if (isCurrent) {
                    btnColor = 'bg-indigo-600 border-indigo-700 text-white font-bold ring-2 ring-indigo-400/30'
                  } else if (userAns) {
                    btnColor = 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                  }

                  return (
                    <button
                      key={q.number}
                      type="button"
                      onClick={() => setActiveNumber(q.number)}
                      className={`h-7 rounded-lg border text-[11px] font-mono flex items-center justify-center transition-all cursor-pointer ${btnColor}`}
                    >
                      {q.number}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 当前选中试题的作答区 */}
            {activeQuestion && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold font-mono text-xs flex items-center justify-center shadow-2xs">
                      {activeQuestion.number}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      第 {activeQuestion.number} 题
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium">
                      {activeQuestion.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">0.5 分</span>
                </div>

                {/* 4 个选项 */}
                <div className="space-y-2">
                  {(['A', 'B', 'C', 'D'] as const).map((key) => {
                    const chosen = answers[activeQuestion.number] === key
                    const isCorrectAnswer = activeQuestion.answer === key
                    const showCheck = (isSubmitted || instantFeedback) && answers[activeQuestion.number]

                    let optClass =
                      'w-full text-left p-3 rounded-2xl border text-xs font-mono transition-all flex items-center justify-between cursor-pointer '

                    if (showCheck) {
                      if (isCorrectAnswer) {
                        optClass += 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-500/20'
                      } else if (chosen && !isCorrectAnswer) {
                        optClass += 'bg-rose-50 border-rose-400 text-rose-900 font-bold ring-1 ring-rose-500/20'
                      } else {
                        optClass += 'bg-white border-slate-200 text-slate-500 opacity-60'
                      }
                    } else if (chosen) {
                      optClass += 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold ring-1 ring-indigo-500/20 shadow-2xs'
                    } else {
                      optClass += 'bg-white border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                    }

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectOption(activeQuestion.number, key)}
                        className={optClass}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              chosen
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {key}
                          </span>
                          <span className="text-xs">{activeQuestion.options[key]}</span>
                        </div>

                        {showCheck && isCorrectAnswer && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            正确选项
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* 所在句子译文 */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
                  <div className="font-semibold text-slate-800 mb-0.5">所在语境译文:</div>
                  <p>{activeQuestion.translation}</p>
                </div>

                {/* 解析面板 (提交后或即时反馈模式开启且已选) */}
                {(isSubmitted || (instantFeedback && answers[activeQuestion.number])) && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2 animate-fade-in ${
                      answers[activeQuestion.number] === activeQuestion.answer
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/70 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        {answers[activeQuestion.number] === activeQuestion.answer ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>回答正确！正确答案: [{activeQuestion.answer}]</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>答错了，正确答案为: [{activeQuestion.answer}]</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70">
                        考点: {activeQuestion.type}
                      </span>
                    </div>

                    <p className="text-[11.5px] leading-relaxed pt-1 border-t border-black/5 font-sans">
                      {activeQuestion.analysis}
                    </p>
                  </div>
                )}

                {/* 前后题切换按钮 */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={activeNumber <= 1}
                    onClick={() => setActiveNumber((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  >
                    上一题
                  </button>
                  <button
                    type="button"
                    disabled={activeNumber >= exam.questions.length}
                    onClick={() => setActiveNumber((prev) => Math.min(exam.questions.length, prev + 1))}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    下一题
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
