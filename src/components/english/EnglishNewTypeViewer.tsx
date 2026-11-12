import React, { useState, useMemo, useEffect } from 'react'
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'
import type { EnglishNewTypeExam } from '../../data/englishPracticeData'

interface EnglishNewTypeViewerProps {
  exam: EnglishNewTypeExam
  onBack?: () => void
}

const STORAGE_KEY_NEWTYPE_PREFIX = 'coreforge_english_newtype_record_'

export default function EnglishNewTypeViewer({ exam, onBack }: EnglishNewTypeViewerProps) {
  // 用户的槽位匹配作答: slotNumber (如 41) -> optionKey (如 'C')
  const [slotChoices, setSlotChoices] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_NEWTYPE_PREFIX}${exam.id}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [activeSlotNumber, setActiveSlotNumber] = useState<number>(exam.slots[0].slotNumber)

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_NEWTYPE_PREFIX}${exam.id}`, JSON.stringify(slotChoices))
    } catch {}
  }, [slotChoices, exam.id])

  // 哪些选项已经被选用了
  const usedOptionMap = useMemo(() => {
    const map: Record<string, number> = {}
    Object.entries(slotChoices).forEach(([slotNum, optKey]) => {
      if (optKey) {
        map[optKey] = parseInt(slotNum, 10)
      }
    })
    return map
  }, [slotChoices])

  const stats = useMemo(() => {
    let correctCount = 0
    let attemptedCount = 0
    exam.slots.forEach((s) => {
      if (slotChoices[s.slotNumber]) {
        attemptedCount++
        if (slotChoices[s.slotNumber] === s.answerKey) {
          correctCount++
        }
      }
    })
    const totalCount = exam.slots.length
    const score = correctCount * 2 // 5 题，每题 2 分，共 10 分
    const totalScore = totalCount * 2
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0
    return { correctCount, attemptedCount, totalCount, score, totalScore, accuracy }
  }, [exam.slots, slotChoices])

  // 将某个选项分配给当前槽位
  const handleAssignOption = (optKey: string) => {
    setSlotChoices((prev) => {
      const next = { ...prev }
      // 如果该选项已经在别的槽位，先腾出或直接移动
      Object.keys(next).forEach((k) => {
        if (next[parseInt(k, 10)] === optKey) {
          delete next[parseInt(k, 10)]
        }
      })
      next[activeSlotNumber] = optKey
      return next
    })

    // 自动移至下一个未填写的槽位
    const nextSlot = exam.slots.find(
      (s) => s.slotNumber !== activeSlotNumber && !slotChoices[s.slotNumber]
    )
    if (nextSlot) {
      setActiveSlotNumber(nextSlot.slotNumber)
    }
  }

  // 清除槽位选择
  const handleClearSlot = (slotNumber: number) => {
    setSlotChoices((prev) => {
      const next = { ...prev }
      delete next[slotNumber]
      return next
    })
  }

  const handleReset = () => {
    if (window.confirm('确定要清空新题型的填报作答吗？')) {
      setSlotChoices({})
      setIsSubmitted(false)
      setActiveSlotNumber(exam.slots[0].slotNumber)
      try {
        localStorage.removeItem(`${STORAGE_KEY_NEWTYPE_PREFIX}${exam.id}`)
      } catch {}
    }
  }

  const handleSubmit = () => {
    if (stats.attemptedCount < exam.slots.length) {
      if (!window.confirm(`还有 ${exam.slots.length - stats.attemptedCount} 个空位未分配，确定要提交吗？`)) {
        return
      }
    }
    setIsSubmitted(true)
  }

  // 渲染文章，并将 [Blank 41]... 渲染为交互槽位
  const renderedArticleParts = useMemo(() => {
    const text = exam.contextArticleEn
    const regex = /\[Blank\s+(\d+)\](?:\s*_{3,})?/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index
      const slotNum = parseInt(match[1], 10)
      const slotDef = exam.slots.find((s) => s.slotNumber === slotNum)

      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex))
      }

      const assignedKey = slotChoices[slotNum]
      const assignedOption = exam.options.find((o) => o.key === assignedKey)
      const isCurrent = activeSlotNumber === slotNum
      const isCorrect = isSubmitted && assignedKey === slotDef?.answerKey

      let slotStyle =
        'my-2 p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between '

      if (isSubmitted) {
        slotStyle += isCorrect
          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950'
          : 'border-rose-500 bg-rose-50/70 text-rose-950'
      } else if (isCurrent) {
        slotStyle += 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
      } else if (assignedKey) {
        slotStyle += 'border-indigo-200 bg-white hover:border-indigo-400'
      } else {
        slotStyle += 'border-dashed border-slate-300 bg-slate-50/80 hover:bg-white hover:border-slate-400'
      }

      parts.push(
        <div
          key={`blank-${slotNum}`}
          onClick={() => setActiveSlotNumber(slotNum)}
          className={slotStyle}
        >
          <div className="flex items-center justify-between text-xs font-bold pb-1.5 border-b border-black/5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[11px]">
                空缺 [{slotNum}]
              </span>
              <span className="text-[11px] text-slate-500">{slotDef?.targetPosition}</span>
            </div>

            <div className="flex items-center gap-2">
              {assignedKey && !isSubmitted && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearSlot(slotNum)
                  }}
                  className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  清空此空
                </button>
              )}
              {isSubmitted && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isCorrect ? '✅ 回答正确' : `❌ 错误，正确答案为: [${slotDef?.answerKey}]`}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 text-xs font-mono leading-relaxed">
            {assignedOption ? (
              <div className="space-y-1">
                <span className="font-bold text-indigo-700 font-sans inline-block mr-1.5">
                  已填入选项 [{assignedKey}]:
                </span>
                <span className="text-slate-800">{assignedOption.text}</span>
              </div>
            ) : (
              <span className="text-slate-400 italic">
                👉 点击激活此槽位，并在下方或右侧备选项中点击填入
              </span>
            )}
          </div>

          {/* 提交后展示衔接线索分析 */}
          {isSubmitted && slotDef && (
            <div className="mt-2.5 pt-2 border-t border-black/10 text-[11px] font-sans leading-relaxed space-y-1">
              <div className="font-bold text-indigo-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>衔接逻辑与线索剖析:</span>
              </div>
              <p className="text-slate-700">{slotDef.explanation}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-slate-500 text-[10px]">核心线索词:</span>
                {slotDef.clueKeywords.map((kw, kwIdx) => (
                  <span
                    key={kwIdx}
                    className="px-1.5 py-0.2 rounded bg-white border border-indigo-200 text-indigo-700 font-mono text-[10px]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )

      lastIndex = matchIndex + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts
  }, [exam.contextArticleEn, exam.slots, exam.options, slotChoices, activeSlotNumber, isSubmitted])

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
              {exam.year} 年真题 · {exam.variantLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="清空当前作答"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置填报</span>
          </button>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-xs cursor-pointer"
            >
              交卷判定 ({stats.attemptedCount}/{stats.totalCount})
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
        {/* 左侧：文章语境与可交互槽位 (7列) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-4">
            <div>
              <div className="text-[11px] font-bold text-indigo-600">{exam.source}</div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
                {exam.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 leading-relaxed">
                📖 <strong>解题说明：</strong> 本篇考查【{exam.variantLabel}】。请阅读文章，点击选中任意空位槽，并在右侧候选选项列表中选择最为恰当的段落或标题。
              </p>
            </div>

            {/* 原文与槽位渲染 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/40 border border-slate-200/80 font-mono text-xs sm:text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap select-text space-y-3">
              {renderedArticleParts}
            </div>
          </div>
        </div>

        {/* 右侧：候选选项池 A~G (5列) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4 sticky top-4 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  🎯
                </span>
                <span className="text-xs font-bold text-slate-900">
                  当前待分配槽位: [{activeSlotNumber}]
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {exam.options.length} 个候选选项
              </span>
            </div>

            {/* 7 个候选选项列表 */}
            <div className="space-y-3">
              {exam.options.map((opt) => {
                const usedInSlot = usedOptionMap[opt.key]
                const isSelectedForCurrentSlot = slotChoices[activeSlotNumber] === opt.key

                let cardStyle =
                  'p-3.5 rounded-2xl border text-xs transition-all cursor-pointer space-y-2 '

                if (isSelectedForCurrentSlot) {
                  cardStyle += 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                } else if (usedInSlot) {
                  cardStyle += 'border-slate-200 bg-slate-100/70 text-slate-500 opacity-75'
                } else {
                  cardStyle += 'border-slate-200/90 bg-white hover:border-indigo-300 hover:bg-slate-50'
                }

                return (
                  <div
                    key={opt.key}
                    onClick={() => handleAssignOption(opt.key)}
                    className={cardStyle}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                            isSelectedForCurrentSlot
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          {opt.key}
                        </span>
                        {opt.subTitle && (
                          <span className="text-[11px] font-bold text-slate-800">
                            {opt.subTitle}
                          </span>
                        )}
                      </div>

                      {usedInSlot && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-bold">
                          已用于空缺 [{usedInSlot}]
                        </span>
                      )}
                    </div>

                    <p className="font-mono text-[11.5px] leading-relaxed text-slate-800 line-clamp-4 hover:line-clamp-none">
                      {opt.text}
                    </p>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        className="text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{usedInSlot ? '替换至当前空位' : '填入当前空位'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
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
