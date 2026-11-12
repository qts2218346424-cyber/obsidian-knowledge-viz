import React, { useState, useEffect } from 'react'
import { CheckCircle2, RotateCcw, Sparkles, BookOpen, Award, Eye, EyeOff } from 'lucide-react'
import type { EnglishTranslationExam } from '../../data/englishPracticeData'

interface EnglishTranslationViewerProps {
  exam: EnglishTranslationExam
  onBack?: () => void
}

const STORAGE_KEY_TRANS_PREFIX = 'coreforge_english_trans_record_'

export default function EnglishTranslationViewer({ exam, onBack }: EnglishTranslationViewerProps) {
  // 用户的翻译输入: number -> string
  const [userInputs, setUserInputs] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_TRANS_PREFIX}${exam.id}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // 展开参考译文状态
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({})

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_TRANS_PREFIX}${exam.id}`, JSON.stringify(userInputs))
    } catch {}
  }, [userInputs, exam.id])

  const handleInputChange = (num: number, val: string) => {
    setUserInputs((prev) => ({ ...prev, [num]: val }))
  }

  const toggleReveal = (num: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [num]: !prev[num] }))
  }

  const handleReset = () => {
    if (window.confirm('确定要清空翻译作答内容吗？')) {
      setUserInputs({})
      setRevealedAnswers({})
      try {
        localStorage.removeItem(`${STORAGE_KEY_TRANS_PREFIX}${exam.id}`)
      } catch {}
    }
  }

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
            <span className="text-xs font-bold text-slate-800">
              {exam.year} 年真题 · 英译汉翻译专项
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>清空作答</span>
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6">
        <div>
          <div className="text-[11px] font-bold text-indigo-600">{exam.source}</div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
            {exam.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 leading-relaxed">
            📖 <strong>考查说明：</strong> 请仔细阅读并翻译下列句子或段落，要求：准确、通顺、完整，符合中文表达习惯。点击“核对参考译文”可对照官方采分点自查。
          </p>
        </div>

        {/* 逐题翻译卡片 */}
        <div className="space-y-6">
          {exam.items.map((item) => {
            const isRevealed = revealedAnswers[item.number]
            const userText = userInputs[item.number] || ''

            return (
              <div
                key={item.number}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                      {item.number}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      第 {item.number} 题 · 英文原句
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    满分 {exam.examType === 'english_1' ? '2.0' : '15.0'} 分
                  </span>
                </div>

                {/* 英文原句 */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed select-text">
                  {item.en}
                </div>

                {/* 考生作答输入框 */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                    <span>我的中文翻译草稿:</span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {userText.length} 字
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={userText}
                    onChange={(e) => handleInputChange(item.number, e.target.value)}
                    placeholder="在此输入您的中文译文..."
                    className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none leading-relaxed text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => toggleReveal(item.number)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isRevealed
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
                    }`}
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isRevealed ? '收起官方译文' : '核对参考译文与采分点'}</span>
                  </button>
                </div>

                {/* 参考译文与采分点折叠 */}
                {isRevealed && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3 animate-fade-in text-xs font-sans">
                    <div>
                      <span className="font-bold text-amber-900 block mb-1">
                        🎯 官方权威标准参考译文:
                      </span>
                      <p className="text-slate-800 bg-white/80 p-2.5 rounded-xl border border-amber-200/50 leading-relaxed font-sans">
                        {item.zhRef}
                      </p>
                    </div>

                    {/* 采分点拆解 */}
                    {item.scoringPoints && item.scoringPoints.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="font-bold text-amber-900 block text-[11px]">
                          ⚖️ 阅卷采分要点分步对照:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.scoringPoints.map((sp, spIdx) => (
                            <div
                              key={spIdx}
                              className="p-2 rounded-lg bg-white/90 border border-amber-200/60 flex items-center justify-between text-[11px]"
                            >
                              <span className="text-slate-700">{sp.point}</span>
                              <span className="font-mono font-bold text-amber-700 shrink-0 ml-2">
                                +{sp.score} 分
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 句法剖析 */}
                    {item.analysis && (
                      <div className="text-[11px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-amber-100">
                        <strong className="text-slate-800">🔍 语法结构与翻译策略: </strong>
                        <span>{item.analysis}</span>
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
  )
}
