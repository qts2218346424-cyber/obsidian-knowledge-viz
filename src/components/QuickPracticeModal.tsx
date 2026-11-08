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
  ArrowLeft,
  Check,
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
        alert(data.error ? `题目生成失败: ${data.error}` : 'AI 未能生成题目，请确认网络与 API 配置后重试')
      }
    } catch (err: any) {
      alert(`请求失败: ${err.message}`)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 md:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border-0 md:border md:border-cream-200 md:dark:border-slate-800 rounded-none md:rounded-3xl shadow-2xl w-full h-[100dvh] md:h-auto md:max-w-2xl md:max-h-[88vh] flex flex-col overflow-hidden">
        {/* Android M3 Top App Bar */}
        <div className="flex flex-col border-b border-cream-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 pt-[env(safe-area-inset-top,0px)] shrink-0">
          <div className="flex items-center justify-between px-3 md:px-5 py-2.5 md:py-3.5 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={onClose}
                aria-label="返回并退出测验"
                className="p-2 -ml-1 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm md:text-base truncate">
                    考点随堂真题测验
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-semibold shrink-0">
                    AI 命制
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                  靶向笔记：{noteTitle || '当前笔记'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {questions.length > 0 && !showSummary && (
                <span className="text-xs font-bold font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-900/40">
                  第 {currentIndex + 1} / {questions.length} 题
                </span>
              )}
              <button
                onClick={onClose}
                className="hidden md:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Android M3 线性进度条 */}
          {questions.length > 0 && !showSummary && (
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:p-6 overscroll-contain">
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
            <div className="space-y-4 md:space-y-5 pb-6">
              {/* Question Header Tags */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    考点单选题
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200/60 dark:border-slate-700">
                    {currentQ.subject}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium border border-amber-200/60 dark:border-amber-900/40">
                    难度：{currentQ.difficulty}
                  </span>
                </div>

                {/* 题号快速切换指示胶囊 */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-full">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex
                          ? 'w-5 bg-orange-500'
                          : submitted[idx]
                          ? userAnswers[idx] === questions[idx].answer
                            ? 'w-2 bg-emerald-500'
                            : 'w-2 bg-rose-500'
                          : 'w-2 bg-slate-300 dark:bg-slate-600'
                      }`}
                      aria-label={`跳转至第 ${idx + 1} 题`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Stem - Android M3 Card */}
              <div className="p-4 md:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-sm md:text-base leading-relaxed text-slate-900 dark:text-slate-100 shadow-2xs">
                <div className="font-semibold mb-1 text-slate-400 dark:text-slate-500 text-[11px] uppercase tracking-wider">
                  题目背景与条件：
                </div>
                <MarkdownRenderer content={currentQ.question} />
              </div>

              {/* Options - Material 3 Large Touch Cards */}
              <div className="space-y-2.5">
                {currentQ.options &&
                  Object.entries(currentQ.options).map(([key, val]) => {
                    let optStyle = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300 hover:bg-orange-50/20 active:scale-[0.99]'
                    let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'

                    if (userAns === key) {
                      optStyle = 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/40 ring-2 ring-orange-500/20 text-orange-950 dark:text-orange-200'
                      badgeStyle = 'bg-orange-500 text-white border-orange-500 shadow-xs'
                    }
                    if (isAnswered) {
                      if (key === currentQ.answer) {
                        optStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 text-emerald-950 dark:text-emerald-200'
                        badgeStyle = 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                      } else if (userAns === key && key !== currentQ.answer) {
                        optStyle = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 ring-2 ring-rose-500/20 text-rose-950 dark:text-rose-200'
                        badgeStyle = 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      }
                    }

                    return (
                      <button
                        key={key}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(key)}
                        className={`w-full flex items-center gap-3.5 p-3.5 md:p-4 rounded-2xl border text-left text-xs md:text-sm transition-all shadow-2xs select-none cursor-pointer ${optStyle}`}
                      >
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border transition-all ${badgeStyle}`}>
                          {key}
                        </span>
                        <div className="flex-1 min-w-0 font-medium leading-relaxed">
                          <MarkdownRenderer content={val} />
                        </div>
                      </button>
                    )
                  })}
              </div>

              {/* Action Buttons - 手机端宽幅大按钮 */}
              {!isAnswered ? (
                <div className="pt-2">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userAns}
                    className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>确认作答</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Feedback & Explanation */
                <div className="space-y-4 pt-2 border-t border-cream-200 dark:border-slate-800 animate-in fade-in">
                  <div
                    className={`flex items-center gap-3 p-3.5 md:p-4 rounded-2xl border ${
                      isCorrect
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50/90 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <div className="text-xs md:text-sm">
                      <span className="font-bold mr-2">
                        {isCorrect ? '🎉 恭喜回答正确！' : '❌ 遗憾回答错误！'}
                      </span>
                      <span>标准答案：<b className="text-sm font-extrabold">{currentQ.answer}</b></span>
                      {userAns && <span className="ml-3 opacity-75">您的选择：{userAns}</span>}
                    </div>
                  </div>

                  {/* Explanation text */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs md:text-sm space-y-2">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-orange-500" />
                      <span>详尽分步解析与考点定理：</span>
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      <MarkdownRenderer content={currentQ.explanation} />
                    </div>
                  </div>

                  {/* If incorrect, provide save & variant actions */}
                  {!isCorrect && (
                    <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-slate-800/40 border border-orange-200/60 dark:border-slate-700 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          错因诊断标签（归档至 Obsidian 知识库）：
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {['概念不清', '公式记错', '计算失误', '审题疏忽'].map(r => (
                            <button
                              key={r}
                              onClick={() =>
                                setSelectedErrorReason(prev => ({ ...prev, [currentIndex]: r }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                (selectedErrorReason[currentIndex] || '概念不清') === r
                                  ? 'bg-orange-500 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <button
                          onClick={handleSaveToErrorNotes}
                          disabled={savingError[currentIndex] || savedError[currentIndex]}
                          className={`w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            savedError[currentIndex]
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 hover:bg-orange-200'
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
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-200 transition-all cursor-pointer shrink-0"
                          title="针对该题定理与陷阱，原地命制变式题追加到测验中"
                        >
                          {generatingVariant ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          <span>🔄 举一反三变式题</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Navigation to next - Android 底部按钮条 */}
                  <div className="flex items-center justify-between gap-3 pt-3">
                    <button
                      onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                      className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      上一题
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentIndex(prev => prev + 1)}
                        className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>下一题</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowSummary(true)}
                        className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <span>查看成绩报告</span>
                        <ArrowRight className="w-4 h-4" />
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
