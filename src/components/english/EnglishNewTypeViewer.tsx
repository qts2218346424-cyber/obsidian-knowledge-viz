import React, { useState, useMemo, useEffect } from 'react'
import {
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  Eye,
  EyeOff,
  BookOpen,
} from 'lucide-react'
import type { EnglishNewTypeExam } from '../../data/englishPracticeData'
import WordLookupPopover, { useEnglishWordLookup } from './WordLookupPopover'

interface EnglishNewTypeViewerProps {
  exam: EnglishNewTypeExam
  onBack?: () => void
}

type FontScale = 'sm' | 'md' | 'lg'

const STORAGE_KEY_NEWTYPE_PREFIX = 'coreforge_english_newtype_record_'

// 针对内置新题型篇目的完整双语权威参考译文补充映射（当 exam.contextArticleZh 未预填时无缝启用）
const BUILTIN_BILINGUAL_PACK: Record<
  string,
  {
    articleZh: string
    optionZhMap: Record<string, string>
  }
> = {
  newtype_2024_eng1_7choose5: {
    articleZh: `【第 1 段】城市规划者传统上一直纯粹用消极的眼光看待城市声音。警笛声、交通轰鸣声以及建筑施工的喧嚣声都被视为需要加以抑制的有害污染物。[空缺 41]

【第 2 段】这一新兴的范式转变在很大程度上依赖于“声景生态学”。研究人员不再仅仅用声级计测量分贝数值，而是评估声音如何与人类的情绪状态产生互动。[空缺 42]

【第 3 段】为了营造如此和谐的声学环境，富有创新精神的欧洲市政当局正在推行亲自然建筑设计。诸如石砌喷泉和轻柔叠水之类的水景设施被刻意安置在步行广场之中。[空缺 43]

【第 4 段】然而，重塑城市声景需要的不仅仅是声学技巧，它还要求社区共同参与创造。在北欧的几个试点项目中，周边居民受邀参加“声景漫步”，以寻找并确认珍贵的声学地标。[空缺 44]

【第 5 段】归根结底，声学公正与空间平等紧密交织在一起。低收入居住区往往首当其冲，承受着永无休止的高速公路低频轰鸣。[空缺 45] 通过主动积极的声学治理，我们的城市能够从嘈杂刺耳的水泥丛林蜕变为治愈身心的听觉庇护所。`,
    optionZhMap: {
      A: '这些流动的水景元素不仅能掩盖令人烦躁的低频交通嗡鸣声；它们自然的律动还能激发大脑 α 波，让行色匆匆的通勤者产生心理上的平静感。',
      B: '因此，市政声学复兴工程必须优先考虑历史上被边缘化的街区走廊，确保宁静的绿色缓冲带并非高档富人社区的专属特权。',
      C: '然而，一批具有开创性的现代声学学者认为，“绝对寂静”是一种违背自然且缺乏生机的城市理想；人类真正渴望的是丰富且具有疗愈作用的声景。',
      D: '一座回荡着远处孩童欢笑声与秋叶沙沙声的公园，其测得的分贝数值可能与地铁通道完全相同，但却能唤起截然相反的心理体验。',
      E: '当地参与者记录下了从教堂钟声到傍晚鸟鸣合唱在内的一切声音，从而确保新的城市分区法规能够正式保护这些承载文化记忆的听觉圣地。',
      F: '相反，工业制造商对这些指导方针表示抵制，声称机械消音装置会给工厂传送带系统带来过高的额外成本。',
      G: '现代建筑蓝图往往强调太阳能电池板的倾角与双层中空玻璃设计，以最大限度地提升冬季热力学保温性能。',
    },
  },
  newtype_2023_eng2_headings: {
    articleZh: `【导语段】当代企业招聘官的目光早已超越了单纯的成绩单（GPA）。在被自动化技术深刻变革的职场中，“软实力”已成为决定就业成败的关键通行证。

【空缺 41 对应段】毕业生往往以为单凭过硬的技术实力就能确保晋升。然而，向非技术背景的利益相关者清晰传达复杂的分析结论，而不让对方淹没在晦涩的专业黑话中，是不可或缺的能力。无论是撰写简明的项目进展简报，还是向部门主管汇报工作，表达的清晰度都是职业公信力的基石。

【空缺 42 对应段】项目推进很少沿着一条笔直且可预测的轨迹运行。当营销算法波动或供应链断裂时，死板固守既定蓝图只会导致陷入瘫痪。那些将意外冲击视为“学习实验室”的员工，表现总是优于抗拒必然调整的同事。

【空缺 43 对应段】在跨学科团队中工作，需要主动去理解截然不同的思维认知框架。在提出反建议之前，耐心地倾听而不急于打断，并共情认可同事的焦虑与顾虑，能够将团队摩擦转化为协同创新。

【空缺 44 对应段】自我驱动力是将普通员工与卓越未来领导者区分开来的分水岭。积极主动的新人不会被动坐等主管下发逐条列好的任务清单，而是在无人催促的情况下主动识别工作流程中的瓶颈并提出建设性的改进方案。

【空缺 45 对应段】不带防备与怨怼地坦然接受批评性反馈，是一项罕见的职场超能力。将绩效评估视为客观的诊断路线图而非针对个人的指责控诉，不仅能锤炼强大的心理韧性，还能大幅加速专业精进。`,
    optionZhMap: {
      A: '拥抱不确定性并培养敏捷应变力',
      B: '精通摒弃行业黑话的清晰沟通表达',
      C: '在团队协作中践行主动倾听与共情',
      D: '展现无需他人催促的主动担当精神',
      E: '将批评审视转化为自我成长的催化剂',
      F: '充满自信地开展薪酬与福利谈判',
      G: '利用自动化工具处理日常繁琐行政事务',
    },
  },
}

export default function EnglishNewTypeViewer({ exam, onBack }: EnglishNewTypeViewerProps) {
  const [slotChoices, setSlotChoices] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_NEWTYPE_PREFIX}${exam.id}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [showBilingual, setShowBilingual] = useState<boolean>(false)
  const [fontScale, setFontScale] = useState<FontScale>('md')
  const [activeSlotNumber, setActiveSlotNumber] = useState<number>(exam.slots[0]?.slotNumber || 41)

  const {
    lookupState,
    closeLookup,
    handleWordLookupClick,
    handleWordLookupDoubleClick,
  } = useEnglishWordLookup()

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_NEWTYPE_PREFIX}${exam.id}`)
      setSlotChoices(saved ? JSON.parse(saved) : {})
    } catch {
      setSlotChoices({})
    }
    setIsSubmitted(false)
    setActiveSlotNumber(exam.slots[0]?.slotNumber || 41)
  }, [exam.id, exam.slots])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_NEWTYPE_PREFIX}${exam.id}`, JSON.stringify(slotChoices))
    } catch {
      // ignore
    }
  }, [slotChoices, exam.id])

  const bilingualPack = BUILTIN_BILINGUAL_PACK[exam.id]
  const fullArticleZh = exam.contextArticleZh || bilingualPack?.articleZh || ''

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
    const score = correctCount * 2
    const totalScore = totalCount * 2
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0
    return { correctCount, attemptedCount, totalCount, score, totalScore, accuracy }
  }, [exam.slots, slotChoices])

  const handleAssignOption = (optKey: string) => {
    setSlotChoices((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((k) => {
        if (next[parseInt(k, 10)] === optKey) {
          delete next[parseInt(k, 10)]
        }
      })
      next[activeSlotNumber] = optKey
      return next
    })

    const nextSlot = exam.slots.find(
      (s) => s.slotNumber !== activeSlotNumber && !slotChoices[s.slotNumber]
    )
    if (nextSlot) {
      setActiveSlotNumber(nextSlot.slotNumber)
    }
  }

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
      setActiveSlotNumber(exam.slots[0]?.slotNumber || 41)
      try {
        localStorage.removeItem(`${STORAGE_KEY_NEWTYPE_PREFIX}${exam.id}`)
      } catch {
        // ignore
      }
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

  const typographyClass =
    fontScale === 'sm'
      ? 'font-serif text-[14.5px] sm:text-[15.5px] leading-[1.82] tracking-[0.01em]'
      : fontScale === 'lg'
      ? 'font-serif text-[17px] sm:text-[18px] leading-[1.92] tracking-[0.012em]'
      : 'font-serif text-[15.5px] sm:text-[16.5px] leading-[1.86] tracking-[0.01em]'

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
      const assignedZh =
        assignedOption?.subTitle ||
        (assignedKey ? bilingualPack?.optionZhMap[assignedKey] : '') ||
        ''
      const isCurrent = activeSlotNumber === slotNum
      const isCorrect = isSubmitted && assignedKey === slotDef?.answerKey

      let slotStyle =
        'my-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between font-sans '

      if (isSubmitted) {
        slotStyle += isCorrect
          ? 'border-emerald-500 bg-emerald-50/75 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
          : 'border-rose-500 bg-rose-50/75 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100'
      } else if (isCurrent) {
        slotStyle +=
          'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/45 ring-2 ring-indigo-500/20 shadow-xs'
      } else if (assignedKey) {
        slotStyle +=
          'border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 hover:border-indigo-400'
      } else {
        slotStyle +=
          'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-400'
      }

      parts.push(
        <div
          key={`blank-${slotNum}`}
          data-no-word-lookup="true"
          onClick={() => setActiveSlotNumber(slotNum)}
          className={slotStyle}
        >
          <div className="flex items-center justify-between text-xs font-bold pb-1.5 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-indigo-600 text-white font-mono text-[11px]">
                空缺 [{slotNum}]
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {slotDef?.targetPosition}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {assignedKey && !isSubmitted && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearSlot(slotNum)
                  }}
                  className="text-[10px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                >
                  清空此空
                </button>
              )}
              {isSubmitted && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isCorrect
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {isCorrect ? '✅ 回答正确' : `❌ 错误，正确答案为: [${slotDef?.answerKey}]`}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 leading-relaxed">
            {assignedOption ? (
              <div className="space-y-1">
                <div>
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 font-sans inline-block mr-1.5">
                    已填入选项 [{assignedKey}]:
                  </span>
                  <span className="font-serif text-[14.5px] text-slate-800 dark:text-slate-100">
                    {assignedOption.text}
                  </span>
                </div>
                {showBilingual && assignedZh && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                    译：{assignedZh}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                👉 点击激活此槽位，并在右侧候选池 A~G 中点击填入
              </span>
            )}
          </div>

          {isSubmitted && slotDef && (
            <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 text-[11.5px] font-sans leading-relaxed space-y-1.5">
              <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>衔接逻辑与线索剖析:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-200">{slotDef.explanation}</p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                  核心衔接线索词:
                </span>
                {slotDef.clueKeywords.map((kw, kwIdx) => (
                  <span
                    key={kwIdx}
                    className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-serif text-[11px]"
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
  }, [
    exam.contextArticleEn,
    exam.slots,
    exam.options,
    slotChoices,
    activeSlotNumber,
    isSubmitted,
    showBilingual,
    bilingualPack,
  ])

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
              {exam.year} 年真题 · {exam.variantLabel}
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

          {/* 双语译文对照开关 */}
          <button
            type="button"
            onClick={() => setShowBilingual((v) => !v)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              showBilingual
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {showBilingual ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showBilingual ? '收起双语译文' : '双语译文对照'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 leading-relaxed">
                📖 <strong>解题与查词提示：</strong> 本篇考查【{exam.variantLabel}】。点击空缺槽并在右侧候选池分配选项；点击正文任意英文生词（或双击右侧选项内单词）即可即点即查并收藏至艾宾浩斯词库。
              </p>
            </div>

            {/* 原文学术衬线渲染与槽位 */}
            <div
              className={`p-5 sm:p-6 rounded-2xl bg-slate-50/40 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 whitespace-pre-wrap select-text ${typographyClass}`}
            >
              {renderedArticleParts}
            </div>

            {/* 双语对照全文参考译文面板 */}
            {showBilingual && fullArticleZh && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/55 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2 animate-fade-in">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>新题型语篇结构中文对照译文:</span>
                </div>
                <div className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {fullArticleZh}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：候选选项池 A~G (5列) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDoubleClick={handleWordLookupDoubleClick}
            className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4 sticky top-4 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  🎯
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  当前待分配槽位: [{activeSlotNumber}]
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {exam.options.length} 个候选选项 · 双击查词
              </span>
            </div>

            <div className="space-y-3">
              {exam.options.map((opt) => {
                const usedInSlot = usedOptionMap[opt.key]
                const isSelectedForCurrentSlot = slotChoices[activeSlotNumber] === opt.key
                const optionZh = opt.subTitle || bilingualPack?.optionZhMap[opt.key] || ''

                let cardStyle =
                  'p-4 rounded-2xl border text-xs transition-all cursor-pointer space-y-2 '

                if (isSelectedForCurrentSlot) {
                  cardStyle +=
                    'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20 shadow-xs'
                } else if (usedInSlot) {
                  cardStyle +=
                    'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 opacity-75'
                } else {
                  cardStyle +=
                    'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }

                return (
                  <div
                    key={opt.key}
                    onClick={() => handleAssignOption(opt.key)}
                    className={cardStyle}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                            isSelectedForCurrentSlot
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-900 dark:bg-slate-700 text-white'
                          }`}
                        >
                          {opt.key}
                        </span>
                        {showBilingual && opt.subTitle && (
                          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 truncate">
                            {opt.subTitle}
                          </span>
                        )}
                      </div>

                      {usedInSlot && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold shrink-0">
                          已用于空缺 [{usedInSlot}]
                        </span>
                      )}
                    </div>

                    <p className="font-serif text-[14.5px] sm:text-[15px] leading-[1.78] tracking-[0.01em] text-slate-800 dark:text-slate-100">
                      {opt.text}
                    </p>

                    {showBilingual && optionZh && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-sans leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
                        译：{optionZh}
                      </p>
                    )}

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        className="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 inline-flex items-center gap-1 cursor-pointer"
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
