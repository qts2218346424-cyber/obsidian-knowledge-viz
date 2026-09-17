import { useState, useEffect } from 'react'
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Save,
  RefreshCw,
  Award,
  ChevronRight,
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

interface QuickPracticeModalProps {
  isOpen: boolean
  onClose: () => void
  noteTitle: string
  noteContent: string
  notePath?: string
}

export interface PracticeQuestion {
  id: string
  domain: 'cs_408' | 'math'
  subject: string
  chapter?: string
  type: 'choice'
  difficulty: '简单' | '中等' | '困难'
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: string
  explanation: string
  steps?: string[]
  tags: string[]
}

export default function QuickPracticeModal({
  isOpen,
  onClose,
  noteTitle,
  noteContent,
  notePath,
}: QuickPracticeModalProps) {
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [selectedErrorReason, setSelectedErrorReason] = useState<Record<number, string>>({})
  const [savedError, setSavedError] = useState<Record<number, boolean>>({})
  const [savingError, setSavingError] = useState<Record<number, boolean>>({})
  const [generatingVariant, setGeneratingVariant] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const generateQuestions = async () => {
    if (!noteTitle && !noteContent) return
    setLoading(true)
    setQuestions([])
    setCurrentIndex(0)
    setUserAnswers({})
    setSubmitted({})
    setSelectedErrorReason({})
    setSavedError({})
    setShowSummary(false)

    try {
      const res = await fetch('/api/quiz/generate-from-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent,
          path: notePath,
        }),
      })
      const data = await res.json()
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions)
      } else {
        alert('AI 未能生成题目，请确认网络与 API 配置后重试')
      }
    } catch (err: any) {
      alert(`生成失败: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && questions.length === 0 && !loading) {
      generateQuestions()
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentQ = questions[currentIndex]
  const isAnswered = submitted[currentIndex]
  const userAns = userAnswers[currentIndex]
  const isCorrect = userAns === currentQ?.answer

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return
    setUserAnswers(prev => ({ ...prev, [currentIndex]: opt }))
  }

  const handleSubmitAnswer = () => {
    if (!userAns) return
    setSubmitted(prev => ({ ...prev, [currentIndex]: true }))
  }

  const handleSaveToErrorNotes = async () => {
    if (!currentQ) return
    setSavingError(prev => ({ ...prev, [currentIndex]: true }))
    try {
      const errorType = selectedErrorReason[currentIndex] || '概念不清'
      const res = await fetch('/api/quiz/save-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ,
          userAnswer: userAns || '未作答',
          errorType,
          notes: `在复习笔记《${noteTitle}》时即学即练触发该错题。诊断为：${errorType}。`,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSavedError(prev => ({ ...prev, [currentIndex]: true }))
      }
    } catch (err: any) {
      alert(`保存失败: ${err.message}`)
    } finally {
      setSavingError(prev => ({ ...prev, [currentIndex]: false }))
    }
  }

  const handleGenerateVariant = async () => {
    if (!currentQ || generatingVariant) return
    setGeneratingVariant(true)
    try {
      const res = await fetch('/api/quiz/variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQ }),
      })
      const data = await res.json()
      if (data.variants && data.variants.length > 0) {
        setQuestions(prev => [...prev, ...data.variants])
        alert(`🎉 成功生成 ${data.variants.length} 道针对该考点的变式题，已追加至随堂测验！`)
      }
    } catch (err: any) {
      alert(`变式题生成失败: ${err.message}`)
    } finally {
      setGeneratingVariant(false)
    }
  }

  const correctCount = Object.entries(submitted).filter(
    ([idx, isSub]) => isSub && userAnswers[Number(idx)] === questions[Number(idx)]?.answer
  ).length


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-warm-900 dark:text-slate-100 text-base">即学即练 · 考点随堂真题测验</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-medium">
                  AI 智能出题
                </span>
              </div>
              <p className="text-xs text-warm-500 dark:text-slate-400 truncate max-w-md">
                靶向笔记：{noteTitle || '当前笔记'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 dark:hover:text-slate-200 hover:bg-cream-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-500 absolute top-0 right-0 animate-bounce" />
              </div>
              <div>
                <p className="text-sm font-semibold text-warm-800 dark:text-slate-200">
                  AI 正在深度研析本篇笔记考点与定理...
                </p>
                <p className="text-xs text-warm-400 dark:text-slate-500 mt-1">
                  依据 408 / 考研数学命题规律，为您量身命制 3 道高质量随堂真题与解析
                </p>
              </div>
            </div>
          ) : showSummary ? (
            /* Summary Report Card */
            <div className="py-8 px-4 text-center space-y-6">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/20">
                <Award className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-warm-900 dark:text-slate-100">随堂即练成绩报告</h4>
                <p className="text-sm text-warm-500 dark:text-slate-400 mt-1">
                  知识点：{noteTitle}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-4 rounded-xl bg-cream-50 dark:bg-slate-800/50 border border-cream-200 dark:border-slate-700">
                  <div className="text-xs text-warm-400 dark:text-slate-500">测试题目</div>
                  <div className="text-2xl font-bold text-warm-800 dark:text-slate-200 mt-1">{questions.length}</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">正确道数</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{correctCount}</div>
                </div>
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                  <div className="text-xs text-orange-600 dark:text-orange-400">掌握度</div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0}%
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-left text-xs text-amber-800 dark:text-amber-300">
                💡 <b>复习建议</b>：
                {correctCount === questions.length
                  ? ' 恭喜！本篇考点掌握扎实，概念与计算无死角，可继续攻克下一个专题。'
                  : ' 存在部分混淆考点，错题已支持一键归档至知识库错题本，建议结合笔记深度推导重温。'}
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={generateQuestions}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-cream-300 dark:border-slate-700 hover:bg-cream-100 dark:hover:bg-slate-800 text-warm-700 dark:text-slate-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 换一批新题
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-colors"
                >
                  完成复盘
                </button>
              </div>
            </div>
          ) : currentQ ? (
            /* Active Question Card */
            <div className="space-y-5">
              {/* Progress & Tags */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    第 {currentIndex + 1} / {questions.length} 题
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                    {currentQ.subject}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    {currentQ.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'bg-orange-500 scale-125'
                          : submitted[idx]
                          ? userAnswers[idx] === questions[idx].answer
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Stem */}
              <div className="p-4 rounded-xl bg-cream-50/60 dark:bg-slate-800/40 border border-cream-200 dark:border-slate-800 text-sm leading-relaxed text-warm-900 dark:text-slate-100">
                <MarkdownRenderer content={currentQ.question} />
              </div>

              {/* Options */}
              <div className="space-y-2">
                {currentQ.options &&
                  Object.entries(currentQ.options).map(([key, val]) => {
                    let optStyle = 'border-cream-200 dark:border-slate-800 hover:border-orange-300 hover:bg-orange-50/30 dark:hover:bg-slate-800'
                    if (userAns === key) {
                      optStyle = 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 ring-1 ring-orange-500 text-orange-900 dark:text-orange-200'
                    }
                    if (isAnswered) {
                      if (key === currentQ.answer) {
                        optStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                      } else if (userAns === key && key !== currentQ.answer) {
                        optStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-1 ring-rose-500'
                      }
                    }

                    return (
                      <button
                        key={key}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(key)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs transition-all ${optStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border border-current">
                          {key}
                        </span>
                        <div className="flex-1 min-w-0">
                          <MarkdownRenderer content={val} />
                        </div>
                      </button>
                    )
                  })}
              </div>

              {/* Action Buttons */}
              {!isAnswered ? (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userAns}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-500/20 transition-all"
                  >
                    提交作答
                  </button>
                </div>
              ) : (
                /* Feedback & Explanation */
                <div className="space-y-4 pt-2 border-t border-cream-200 dark:border-slate-800 animate-in fade-in">
                  <div
                    className={`flex items-center gap-3 p-3.5 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50/80 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-200'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    <div className="text-xs">
                      <span className="font-bold mr-2">
                        {isCorrect ? '🎉 恭喜回答正确！' : '❌ 遗憾回答错误！'}
                      </span>
                      <span>标准答案：<b>{currentQ.answer}</b></span>
                      {userAns && <span className="ml-3 text-slate-500">您的选择：{userAns}</span>}
                    </div>
                  </div>

                  {/* Explanation text */}
                  <div className="p-4 rounded-xl bg-cream-50/80 dark:bg-slate-800/60 border border-cream-200 dark:border-slate-700 text-xs space-y-2">
                    <div className="font-bold text-warm-800 dark:text-slate-200 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-orange-500" /> 详尽解析与破题步骤：
                    </div>
                    <div className="text-warm-700 dark:text-slate-300 leading-relaxed">
                      <MarkdownRenderer content={currentQ.explanation} />
                    </div>
                  </div>

                  {/* If incorrect, provide save & variant actions */}
                  {!isCorrect && (
                    <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-slate-800/40 border border-orange-200/60 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-warm-700 dark:text-slate-300">
                          标记错因类型（将沉淀至知识库错题本）：
                        </span>
                        <div className="flex items-center gap-1.5">
                          {['概念不清', '公式记错', '计算失误', '审题疏忽'].map(r => (
                            <button
                              key={r}
                              onClick={() =>
                                setSelectedErrorReason(prev => ({ ...prev, [currentIndex]: r }))
                              }
                              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                                (selectedErrorReason[currentIndex] || '概念不清') === r
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-cream-200 dark:bg-slate-700 text-warm-600 dark:text-slate-400'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveToErrorNotes}
                          disabled={savingError[currentIndex] || savedError[currentIndex]}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                            savedError[currentIndex]
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200'
                          }`}
                        >
                          {savingError[currentIndex] ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          {savedError[currentIndex] ? '✓ 已沉淀到 Obsidian 错题本' : '💾 一键归档至错题本'}
                        </button>

                        <button
                          onClick={handleGenerateVariant}
                          disabled={generatingVariant}
                          className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition-all"
                          title="针对该题定理与陷阱，原地命制 2 道变式题追加到测验中"
                        >
                          {generatingVariant ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          🔄 举一反三变式题
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Navigation to next */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                      className="px-3 py-1.5 rounded-lg text-xs text-warm-500 disabled:opacity-30 hover:bg-cream-100 dark:hover:bg-slate-800"
                    >
                      上一题
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                      >
                        下一题 <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowSummary(true)}
                        className="px-5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        查看成绩报告 <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-warm-400">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">未获取到题目</p>
              <button
                onClick={generateQuestions}
                className="mt-3 px-3 py-1 text-xs rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100"
              >
                重新生成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
