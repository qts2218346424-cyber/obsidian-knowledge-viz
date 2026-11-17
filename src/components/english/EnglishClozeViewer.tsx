import React, { useState, useMemo, useEffect } from 'react'
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  EyeOff,
  BookOpen,
  Award,
  Search,
} from 'lucide-react'
import type { EnglishClozeExam } from '../../data/englishPracticeData'
import WordLookupPopover, { useEnglishWordLookup } from './WordLookupPopover'

interface EnglishClozeViewerProps {
  exam: EnglishClozeExam
  onBack?: () => void
}

type FontScale = 'sm' | 'md' | 'lg'

const STORAGE_KEY_CLOZE_PREFIX = 'coreforge_english_cloze_record_'

export default function EnglishClozeViewer({ exam, onBack }: EnglishClozeViewerProps) {
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_CLOZE_PREFIX}${exam.id}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [activeNumber, setActiveNumber] = useState<number>(1)
  const [showFullTranslation, setShowFullTranslation] = useState<boolean>(false)
  const [instantFeedback, setInstantFeedback] = useState<boolean>(false)
  const [fontScale, setFontScale] = useState<FontScale>('md')

  const {
    lookupState,
    setLookupState,
    closeLookup,
    handleWordLookupClick,
    handleWordLookupDoubleClick,
  } = useEnglishWordLookup()

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_CLOZE_PREFIX}${exam.id}`)
      setAnswers(saved ? JSON.parse(saved) : {})
    } catch {
      setAnswers({})
    }
    setIsSubmitted(false)
    setActiveNumber(1)
  }, [exam.id])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_CLOZE_PREFIX}${exam.id}`, JSON.stringify(answers))
    } catch {
      // ignore
    }
  }, [answers, exam.id])

  const activeQuestion = useMemo(() => {
    return exam.questions.find((q) => q.number === activeNumber) || exam.questions[0]
  }, [exam.questions, activeNumber])

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

  const handleSelectOption = (num: number, optKey: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({ ...prev, [num]: optKey }))
    if (num < exam.questions.length && !answers[num + 1]) {
      setActiveNumber(num + 1)
    }
  }

  const handleReset = () => {
    if (window.confirm('确定要清空本篇完形填空的作答记录吗？')) {
      setAnswers({})
      setIsSubmitted(false)
      setActiveNumber(1)
      try {
        localStorage.removeItem(`${STORAGE_KEY_CLOZE_PREFIX}${exam.id}`)
      } catch {
        // ignore
      }
    }
  }

  const handleSubmit = () => {
    if (stats.attemptedCount < exam.questions.length) {
      if (!window.confirm(`还有 ${exam.questions.length - stats.attemptedCount} 道空未填写，确定要交卷吗？`)) {
        return
      }
    }
    setIsSubmitted(true)
  }

  // 按自然段拆分完形原文，并将 [1], [2]... 替换为优雅学术内嵌词槽
  const renderedParagraphs = useMemo(() => {
    const rawParas = exam.fullArticleEn.split(/\n\s*\n/).filter(Boolean)

    return rawParas.map((paraText, pIdx) => {
      const regex = /\[(\d+)\]/g
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = regex.exec(paraText)) !== null) {
        const matchIndex = match.index
        const num = parseInt(match[1], 10)
        const q = exam.questions.find((item) => item.number === num)

        if (matchIndex > lastIndex) {
          parts.push(paraText.substring(lastIndex, matchIndex))
        }

        const userChoice = answers[num]
        const chosenWord = userChoice && q ? q.options[userChoice] : null
        const isCurrent = activeNumber === num
        const showAnswerStatus = (isSubmitted || instantFeedback) && userChoice

        let badgeClasses =
          'border transition-all cursor-pointer inline-flex items-baseline gap-1 mx-1 px-2 py-0.5 rounded-lg text-[13.5px] font-serif font-bold select-none align-baseline '

        if (showAnswerStatus) {
          if (userChoice === q?.answer) {
            badgeClasses +=
              'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20 '
          } else {
            badgeClasses +=
              'bg-rose-50 dark:bg-rose-950/60 border-rose-400 dark:border-rose-600 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/20 '
          }
        } else if (isCurrent) {
          badgeClasses +=
            'bg-indigo-600 border-indigo-700 text-white shadow-xs ring-2 ring-indigo-400/30 '
        } else if (chosenWord) {
          badgeClasses +=
            'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 '
        } else {
          badgeClasses +=
            'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 '
        }

        parts.push(
          <button
            key={`slot-${num}`}
            type="button"
            onClick={() => setActiveNumber(num)}
            className={badgeClasses}
            title={`点击定位第 ${num} 题`}
          >
            <span className="opacity-75 font-mono text-[10.5px]">[{num}]</span>
            <span>{chosenWord || '______'}</span>
          </button>
        )

        lastIndex = matchIndex + match[0].length
      }

      if (lastIndex < paraText.length) {
        parts.push(paraText.substring(lastIndex))
      }

      return (
        <p key={pIdx} className="indent-6 sm:indent-8">
          {parts}
        </p>
      )
    })
  }, [exam.fullArticleEn, exam.questions, answers, activeNumber, isSubmitted, instantFeedback])

  const typographyClass =
    fontScale === 'sm'
      ? 'font-serif text-[14.5px] sm:text-[15.5px] leading-[1.9] tracking-[0.01em]'
      : fontScale === 'lg'
      ? 'font-serif text-[17px] sm:text-[18px] leading-[2.0] tracking-[0.012em]'
      : 'font-serif text-[15.5px] sm:text-[16.5px] leading-[1.95] tracking-[0.01em]'

  // 为辨析选项单词手动触发即点即查浮窗
  const handleLookupOptionWord = (e: React.MouseEvent<HTMLButtonElement>, rawOptionText: string) => {
    e.stopPropagation()
    const cleanWord = rawOptionText.trim().split(/\s+/)[0].replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '')
    if (!cleanWord) return
    const rect = e.currentTarget.getBoundingClientRect()
    setLookupState({
      surfaceWord: cleanWord,
      contextSentence: activeQuestion?.translation
        ? `Option word "${rawOptionText}" — ${activeQuestion.translation}`
        : rawOptionText,
      anchorRect: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      },
    })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <WordLookupPopover state={lookupState} onClose={closeLookup} />

      {/* 顶部控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              ← 返回题库
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/70 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
              {exam.examType === 'english_1' ? '英语(一)' : '英语(二)'}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {exam.year} 年真题 · 完形填空
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 字号微调 */}
          <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/70 dark:border-slate-700">
            {(['sm', 'md', 'lg'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setFontScale(sz)}
                className={`px-2 py-1 rounded-lg text-[11px] font-serif font-bold transition-all cursor-pointer ${
                  fontScale === sz
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {sz === 'sm' ? 'A-' : sz === 'md' ? 'A' : 'A+'}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer">
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
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              showFullTranslation
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {showFullTranslation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showFullTranslation ? '收起全文译文' : '查看全文译文'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
          <div
            onClick={handleWordLookupClick}
            onDoubleClick={handleWordLookupDoubleClick}
            className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs space-y-4"
          >
            <div>
              <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                {exam.source}
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                {exam.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  约 {exam.wordCount} 词
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/50 text-amber-800 dark:text-amber-200">
                  主题：{exam.topic}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 leading-relaxed">
              💡 <strong>答题与查词说明：</strong> 点击文中 <strong>[题号]</strong> 词槽同步右侧选项；点击正文任意英文生词或选项右侧放大镜，可即点即查并收藏入艾宾浩斯词库。
            </div>

            {/* 英文学术衬线正文 (带交互槽位) */}
            <div
              className={`p-5 sm:p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 select-text space-y-4 ${typographyClass}`}
            >
              {renderedParagraphs}
            </div>

            {/* 全文双语翻译抽屉 */}
            {showFullTranslation && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60 space-y-2 animate-fade-in">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>官方权威全文参考翻译:</span>
                </div>
                <div className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {exam.fullArticleZh}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：答题面板与考点解析 (5列) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4 sticky top-4">
            {/* 顶部快速跳题卡 */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
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
                  let btnColor =
                    'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'

                  if (showStatus) {
                    btnColor =
                      userAns === q.answer
                        ? 'bg-emerald-500 border-emerald-600 text-white font-bold'
                        : 'bg-rose-500 border-rose-600 text-white font-bold'
                  } else if (isCurrent) {
                    btnColor =
                      'bg-indigo-600 border-indigo-700 text-white font-bold ring-2 ring-indigo-400/30'
                  } else if (userAns) {
                    btnColor =
                      'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold'
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
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold font-mono text-xs flex items-center justify-center shadow-2xs">
                      {activeQuestion.number}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      第 {activeQuestion.number} 题
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-medium">
                      {activeQuestion.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">0.5 分</span>
                </div>

                {/* 4 个学术衬线选项（支持一键点查生词） */}
                <div className="space-y-2">
                  {(['A', 'B', 'C', 'D'] as const).map((key) => {
                    const chosen = answers[activeQuestion.number] === key
                    const isCorrectAnswer = activeQuestion.answer === key
                    const showCheck =
                      (isSubmitted || instantFeedback) && Boolean(answers[activeQuestion.number])

                    let optClass =
                      'w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer '

                    if (showCheck) {
                      if (isCorrectAnswer) {
                        optClass +=
                          'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-bold ring-1 ring-emerald-500/20'
                      } else if (chosen && !isCorrectAnswer) {
                        optClass +=
                          'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-600 text-rose-950 dark:text-rose-100 font-bold ring-1 ring-rose-500/20'
                      } else {
                        optClass +=
                          'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 opacity-65'
                      }
                    } else if (chosen) {
                      optClass +=
                        'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-500 text-indigo-950 dark:text-indigo-100 font-bold ring-1 ring-indigo-500/20 shadow-2xs'
                    } else {
                      optClass +=
                        'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                    }

                    return (
                      <div
                        key={key}
                        onClick={() => handleSelectOption(activeQuestion.number, key)}
                        className={optClass}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-full font-mono flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              chosen
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {key}
                          </span>
                          <span className="font-serif text-[15px] tracking-[0.01em]">
                            {activeQuestion.options[key]}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {showCheck && isCorrectAnswer && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                              正确选项
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleLookupOptionWord(e, activeQuestion.options[key])}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={`查询词汇 "${activeQuestion.options[key]}" 并加入生词本`}
                          >
                            <Search className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 所在句子译文（默认提交后或开启全文翻译/即时反馈后展示，也可直接作为语境提示） */}
                {(isSubmitted || instantFeedback || showFullTranslation) && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <div className="font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
                      所在语境译文:
                    </div>
                    <p>{activeQuestion.translation}</p>
                  </div>
                )}

                {/* 解析面板 */}
                {(isSubmitted || (instantFeedback && answers[activeQuestion.number])) && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2 animate-fade-in ${
                      answers[activeQuestion.number] === activeQuestion.answer
                        ? 'bg-emerald-50/75 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-100'
                        : 'bg-rose-50/75 dark:bg-rose-950/35 border-rose-200 dark:border-rose-800/70 text-rose-950 dark:text-rose-100'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        {answers[activeQuestion.number] === activeQuestion.answer ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>回答正确！正确答案: [{activeQuestion.answer}]</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>答错了，正确答案为: [{activeQuestion.answer}]</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200">
                        考点: {activeQuestion.type}
                      </span>
                    </div>

                    <p className="text-[11.5px] leading-relaxed pt-1 border-t border-black/5 dark:border-white/10 font-sans">
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
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    上一题
                  </button>
                  <button
                    type="button"
                    disabled={activeNumber >= exam.questions.length}
                    onClick={() => setActiveNumber((prev) => Math.min(exam.questions.length, prev + 1))}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-30 cursor-pointer"
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
