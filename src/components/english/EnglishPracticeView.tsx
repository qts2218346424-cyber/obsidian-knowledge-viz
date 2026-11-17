import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  Award,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  BookOpen,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Upload,
  Inbox,
} from 'lucide-react'
import {
  ENGLISH_CLOZE_BANK,
  ENGLISH_READING_BANK,
  ENGLISH_NEW_TYPE_BANK,
  ENGLISH_TRANSLATION_BANK,
  type EnglishExamCategory,
  type EnglishQuestionType,
  type EnglishClozeExam,
  type EnglishReadingPassage,
  type EnglishNewTypeExam,
  type EnglishTranslationExam,
} from '../../data/englishPracticeData'
import { authService } from '../../services/auth'
import MarkdownRenderer from '../MarkdownRenderer'
import EnglishClozeViewer from './EnglishClozeViewer'
import EnglishReadingViewer from './EnglishReadingViewer'
import EnglishNewTypeViewer from './EnglishNewTypeViewer'
import EnglishTranslationViewer from './EnglishTranslationViewer'
import WordLookupPopover, { useEnglishWordLookup } from './WordLookupPopover'

export interface CustomEnglishQuestion {
  id: string
  domain?: string
  subject?: string
  chapter?: string
  type?: 'choice' | 'multiple' | 'blank' | 'analysis' | string
  difficulty?: string
  passage?: string
  question: string
  options?: Record<string, string> | string[]
  answer?: string
  correctAnswer?: string
  explanation?: string
  tags?: string[]
  importedAt?: string
}

export interface CustomQuestionGroup {
  id: string
  title: string
  subjectLabel: string
  hasSharedPassage: boolean
  sharedPassage?: string
  questions: CustomEnglishQuestion[]
}

interface EnglishPracticeViewProps {
  onGoToPapers?: () => void
  onOpenImportModal?: () => void
  refreshTrigger?: number
}

type ExtendedQuestionType = EnglishQuestionType | 'custom' | 'all'

type PracticeActiveItem =
  | { type: 'cloze'; data: EnglishClozeExam }
  | { type: 'reading'; data: EnglishReadingPassage }
  | { type: 'new_type'; data: EnglishNewTypeExam }
  | { type: 'translation'; data: EnglishTranslationExam }
  | { type: 'custom_group'; data: CustomQuestionGroup }
  | null

function extractPassageFromCustomQ(q: CustomEnglishQuestion): {
  passage: string
  cleanStem: string
} {
  const directPassage = (q.passage || '').trim()
  const blockRegex = /```(?:text|en|markdown)?\s*([\s\S]*?)```/i
  const match = (q.question || '').match(blockRegex)
  if (directPassage) {
    return {
      passage: directPassage,
      cleanStem: match ? q.question.replace(blockRegex, '').trim() : q.question,
    }
  }
  if (match) {
    return {
      passage: match[1].trim(),
      cleanStem: q.question.replace(blockRegex, '').trim(),
    }
  }
  return { passage: '', cleanStem: q.question }
}

function normalizeOptionsRecord(
  rawOpts?: Record<string, string> | string[]
): Array<{ key: string; text: string }> {
  if (!rawOpts) return []
  if (Array.isArray(rawOpts)) {
    return rawOpts.map((item, idx) => {
      const m = String(item).match(/^([A-G])[.、)\s]\s*(.*)$/i)
      const fallbackKey = ['A', 'B', 'C', 'D', 'E', 'F', 'G'][idx] || String(idx + 1)
      return {
        key: m ? m[1].toUpperCase() : fallbackKey,
        text: m ? m[2].trim() : String(item),
      }
    })
  }
  return Object.entries(rawOpts).map(([k, v]) => ({
    key: k.trim().toUpperCase(),
    text: String(v).replace(/^[A-G][.、)\s]\s*/i, '').trim(),
  }))
}

/**
 * 用户导入英语题库专属做题器（自动支持带 passage 共享短文的左 7 右 5 分栏阅读与独立单题刷题）
 */
function CustomEnglishGroupViewer({
  group,
  onBack,
}: {
  group: CustomQuestionGroup
  onBack: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({})
  const [isAllSubmitted, setIsAllSubmitted] = useState(false)
  const passageScrollRef = useRef<HTMLDivElement | null>(null)
  const lastPassageSigRef = useRef<string>('')

  const {
    lookupState,
    closeLookup,
    handleWordLookupClick,
    handleWordLookupDoubleClick,
  } = useEnglishWordLookup()

  const currentQ = group.questions[currentIndex] || group.questions[0]
  const parsed = useMemo(() => extractPassageFromCustomQ(currentQ), [currentQ])
  const effectivePassage = parsed.passage || group.sharedPassage || ''

  useEffect(() => {
    const sig = effectivePassage.slice(0, 120)
    if (sig && sig !== lastPassageSigRef.current) {
      lastPassageSigRef.current = sig
      if (passageScrollRef.current) {
        passageScrollRef.current.scrollTop = 0
      }
    }
  }, [effectivePassage])

  const optionsList = useMemo(
    () => normalizeOptionsRecord(currentQ?.options),
    [currentQ?.options]
  )
  const stdAnswer = (currentQ?.answer || currentQ?.correctAnswer || '').trim()
  const isChoice = optionsList.length > 0 && currentQ?.type !== 'multiple'
  const isMultiple = optionsList.length > 0 && currentQ?.type === 'multiple'
  const showExplanation = isAllSubmitted || Boolean(revealedMap[currentQ?.id || ''])
  const userAns = (userAnswers[currentQ?.id || ''] || '').trim()

  const handleToggleOption = (qId: string, key: string) => {
    if (isMultiple) {
      setUserAnswers((prev) => {
        const cur = prev[qId] || ''
        const set = new Set(cur.split('').filter(Boolean))
        if (set.has(key)) set.delete(key)
        else set.add(key)
        return { ...prev, [qId]: Array.from(set).sort().join('') }
      })
    } else {
      setUserAnswers((prev) => ({ ...prev, [qId]: key }))
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <WordLookupPopover state={lookupState} onClose={closeLookup} />

      {/* 顶栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            ← 返回题库
          </button>
          <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800 text-[11px] font-bold text-teal-700 dark:text-teal-300">
            📥 我的导入题库 · {group.subjectLabel}
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
            {group.title}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setUserAnswers({})
              setRevealedMap({})
              setIsAllSubmitted(false)
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAllSubmitted(true)}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-xs cursor-pointer"
          >
            全部判分与展开解析
          </button>
        </div>
      </div>

      {/* 题号快速跳转条 */}
      {group.questions.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 shrink-0">
            题号导航:
          </span>
          {group.questions.map((q, idx) => {
            const active = idx === currentIndex
            const answered = Boolean(userAnswers[q.id]?.trim())
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer shrink-0 ${
                  active
                    ? 'bg-indigo-600 border-indigo-700 text-white'
                    : answered
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
      )}

      {/* 主体：若存在共享阅读短文则左 7 列固定独立滚动阅读 + 右 5 列作答；否则单栏精致大卡 */}
      <div
        onClick={handleWordLookupClick}
        onDoubleClick={handleWordLookupDoubleClick}
        className={
          effectivePassage
            ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
            : 'max-w-4xl mx-auto'
        }
      >
        {effectivePassage && (
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col lg:max-h-[78vh]">
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>阅读篇章原文（点击任意单词即点即查）</span>
                </span>
              </div>
              <div
                ref={passageScrollRef}
                className="p-5 sm:p-7 overflow-y-auto space-y-4 font-serif text-[15.5px] sm:text-[16.5px] leading-[1.86] tracking-[0.01em] text-slate-800 dark:text-slate-100"
              >
                {effectivePassage
                  .split(/\n+/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((p, idx) => (
                    <p key={idx} className="indent-6 select-text cursor-text">
                      {p}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        )}

        <div className={effectivePassage ? 'lg:col-span-5 lg:sticky lg:top-4' : ''}>
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs">
                  第 {currentIndex + 1} / {group.questions.length} 题
                </span>
                {currentQ?.difficulty && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold">
                    {currentQ.difficulty}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setRevealedMap((prev) => ({
                    ...prev,
                    [currentQ.id]: !prev[currentQ.id],
                  }))
                }
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {showExplanation ? '收起解析' : '查看本题答案与解析'}
              </button>
            </div>

            {/* 题干 */}
            <div className="font-serif text-[15.5px] sm:text-[16px] font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              <MarkdownRenderer content={parsed.cleanStem} />
            </div>

            {/* 选项或文本输入 */}
            {isChoice || isMultiple ? (
              <div className="space-y-2.5">
                {optionsList.map((opt) => {
                  const chosen = isMultiple
                    ? userAns.includes(opt.key)
                    : userAns.toUpperCase() === opt.key
                  const isRightOpt = stdAnswer.toUpperCase().includes(opt.key)

                  let cls =
                    'w-full text-left p-3.5 rounded-xl border font-serif text-[15px] leading-relaxed transition-all flex items-start gap-2.5 cursor-pointer '
                  if (showExplanation && stdAnswer) {
                    if (isRightOpt) {
                      cls +=
                        'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-semibold'
                    } else if (chosen && !isRightOpt) {
                      cls +=
                        'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-950 dark:text-rose-100'
                    } else {
                      cls +=
                        'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 opacity-70'
                    }
                  } else if (chosen) {
                    cls +=
                      'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-indigo-100 font-semibold ring-1 ring-indigo-500/20'
                  } else {
                    cls +=
                      'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleToggleOption(currentQ.id, opt.key)}
                      className={cls}
                    >
                      <span
                        className={`w-5 h-5 rounded-full font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          chosen
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div data-no-word-lookup="true" className="space-y-1.5">
                <textarea
                  rows={4}
                  value={userAns}
                  onChange={(e) =>
                    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                  }
                  placeholder="在此输入您的译文、填空或作答草稿..."
                  className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                />
              </div>
            )}

            {/* 解析卡片 */}
            {showExplanation && (
              <div className="p-4 rounded-2xl bg-amber-50/75 dark:bg-amber-950/35 border border-amber-200/80 dark:border-amber-800/60 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                  <span className="flex items-center gap-1.5">
                    {isChoice && userAns ? (
                      userAns.toUpperCase() === stdAnswer.toUpperCase() ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>回答正确！</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          <span>作答有误</span>
                        </>
                      )
                    ) : (
                      <span>📋 参考答案与考点详解</span>
                    )}
                  </span>
                  {stdAnswer && (
                    <span className="font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 text-emerald-700 dark:text-emerald-300">
                      答案：{stdAnswer}
                    </span>
                  )}
                </div>
                {currentQ.explanation && (
                  <div className="text-slate-700 dark:text-slate-200 leading-relaxed pt-1 border-t border-amber-200/50 dark:border-amber-800/50">
                    <MarkdownRenderer content={currentQ.explanation} />
                  </div>
                )}
              </div>
            )}

            {/* 上下题控制 */}
            {group.questions.length > 1 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIndex <= 0}
                  onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一题</span>
                </button>
                <button
                  type="button"
                  disabled={currentIndex >= group.questions.length - 1}
                  onClick={() =>
                    setCurrentIndex((p) => Math.min(group.questions.length - 1, p + 1))
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  <span>下一题</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EnglishPracticeView({
  onGoToPapers,
  onOpenImportModal,
  refreshTrigger = 0,
}: EnglishPracticeViewProps) {
  const [activeItem, setActiveItem] = useState<PracticeActiveItem>(null)
  const [selectedType, setSelectedType] = useState<ExtendedQuestionType>('all')
  const [selectedExam, setSelectedExam] = useState<EnglishExamCategory>('both')
  const [searchQuery, setSearchQuery] = useState('')
  const [customQuestions, setCustomQuestions] = useState<CustomEnglishQuestion[]>([])

  // 自动拉取用户通过 PDF 提取或手动导入的自定义英语题库
  const fetchCustomEnglishQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/quiz/custom?domain=english', {
        headers: authService.getAuthHeaders(),
      })
      if (!res.ok) return
      const data = await res.json()
      const rawList = Array.isArray(data?.questions) ? data.questions : []
      const englishOnly = rawList.filter(
        (q: CustomEnglishQuestion) =>
          q.domain === 'english' ||
          (!q.domain && /英语|阅读|完形|翻译|新题型|长难句|外刊/i.test(q.subject || ''))
      )
      setCustomQuestions(englishOnly)
    } catch {
      // 未登录或离线静默忽略
    }
  }, [])

  useEffect(() => {
    fetchCustomEnglishQuestions()
  }, [fetchCustomEnglishQuestions, refreshTrigger])

  // 将导入的英语题目智能聚合成篇章题组或章节题组
  const customGroups = useMemo<CustomQuestionGroup[]>(() => {
    if (customQuestions.length === 0) return []
    const passageBuckets = new Map<string, CustomEnglishQuestion[]>()
    const standaloneBuckets = new Map<string, CustomEnglishQuestion[]>()

    for (const q of customQuestions) {
      if (
        searchQuery &&
        !q.question?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(q.subject || '').includes(searchQuery) &&
        !(q.chapter || '').includes(searchQuery)
      ) {
        continue
      }

      const { passage } = extractPassageFromCustomQ(q)
      if (passage) {
        const key = passage.slice(0, 140)
        const arr = passageBuckets.get(key) || []
        arr.push(q)
        passageBuckets.set(key, arr)
      } else {
        const key = `${q.subject || '考研英语'}::${q.chapter || '自定义专项训练'}`
        const arr = standaloneBuckets.get(key) || []
        arr.push(q)
        standaloneBuckets.set(key, arr)
      }
    }

    const groups: CustomQuestionGroup[] = []
    let pIndex = 1
    for (const [, list] of passageBuckets.entries()) {
      const first = list[0]
      const { passage } = extractPassageFromCustomQ(first)
      groups.push({
        id: `custom-passage-${pIndex}`,
        title: first.chapter || `${first.subject || '英语阅读/完形'} · 导入篇章 #${pIndex}`,
        subjectLabel: first.subject || '阅读/完形篇章',
        hasSharedPassage: true,
        sharedPassage: passage,
        questions: list,
      })
      pIndex++
    }

    let sIndex = 1
    for (const [, list] of standaloneBuckets.entries()) {
      const first = list[0]
      groups.push({
        id: `custom-standalone-${sIndex}`,
        title: first.chapter || `${first.subject || '英语专项'} · 导入题集 #${sIndex}`,
        subjectLabel: first.subject || '单题精练',
        hasSharedPassage: false,
        questions: list,
      })
      sIndex++
    }

    return groups
  }, [customQuestions, searchQuery])

  const filteredClozes = useMemo(() => {
    return ENGLISH_CLOZE_BANK.filter((c) => {
      if (selectedExam !== 'both' && c.examType !== selectedExam) return false
      if (searchQuery && !c.title.includes(searchQuery) && !c.topic.includes(searchQuery)) return false
      return true
    })
  }, [selectedExam, searchQuery])

  const filteredReadings = useMemo(() => {
    return ENGLISH_READING_BANK.filter((r) => {
      if (selectedExam !== 'both' && r.examType !== selectedExam) return false
      if (
        searchQuery &&
        !r.title.includes(searchQuery) &&
        !r.topic.includes(searchQuery) &&
        !r.summary.includes(searchQuery)
      ) {
        return false
      }
      return true
    })
  }, [selectedExam, searchQuery])

  const filteredNewTypes = useMemo(() => {
    return ENGLISH_NEW_TYPE_BANK.filter((n) => {
      if (selectedExam !== 'both' && n.examType !== selectedExam) return false
      if (
        searchQuery &&
        !n.title.includes(searchQuery) &&
        !n.variantLabel.includes(searchQuery) &&
        !n.summary.includes(searchQuery)
      ) {
        return false
      }
      return true
    })
  }, [selectedExam, searchQuery])

  const filteredTranslations = useMemo(() => {
    return ENGLISH_TRANSLATION_BANK.filter((t) => {
      if (selectedExam !== 'both' && t.examType !== selectedExam) return false
      if (searchQuery && !t.title.includes(searchQuery)) return false
      return true
    })
  }, [selectedExam, searchQuery])

  const totalItemsCount =
    filteredClozes.length +
    filteredReadings.length +
    filteredNewTypes.length +
    filteredTranslations.length +
    customGroups.length

  if (activeItem) {
    if (activeItem.type === 'cloze') {
      return <EnglishClozeViewer exam={activeItem.data} onBack={() => setActiveItem(null)} />
    }
    if (activeItem.type === 'reading') {
      return <EnglishReadingViewer passage={activeItem.data} onBack={() => setActiveItem(null)} />
    }
    if (activeItem.type === 'new_type') {
      return <EnglishNewTypeViewer exam={activeItem.data} onBack={() => setActiveItem(null)} />
    }
    if (activeItem.type === 'translation') {
      return <EnglishTranslationViewer exam={activeItem.data} onBack={() => setActiveItem(null)} />
    }
    if (activeItem.type === 'custom_group') {
      return <CustomEnglishGroupViewer group={activeItem.data} onBack={() => setActiveItem(null)} />
    }
  }

  const navTabs: Array<{ key: ExtendedQuestionType; label: string; count: number; emoji: string }> = [
    { key: 'all', label: '全部题型', count: totalItemsCount, emoji: '⚡' },
    ...(customGroups.length > 0
      ? [{ key: 'custom' as const, label: '我的导入题库', count: customGroups.length, emoji: '📥' }]
      : []),
    { key: 'cloze', label: '完形填空 (Cloze)', count: filteredClozes.length, emoji: '🧩' },
    { key: 'reading', label: '传统阅读 (Reading)', count: filteredReadings.length, emoji: '📖' },
    { key: 'new_type', label: '新题型 (New Types)', count: filteredNewTypes.length, emoji: '🔀' },
    { key: 'translation', label: '英汉翻译 (Translation)', count: filteredTranslations.length, emoji: '✍️' },
  ]

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 顶栏控制台与题型快速切换 */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                🎯
              </span>
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                考研英语 · 分题型专项刷题中心
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              按考研官方题型划分：完形填空、传统阅读双向题眼定位、新题型双语推演、英汉翻译 AI 批改及自定义导入题库
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenImportModal && (
              <button
                type="button"
                onClick={onOpenImportModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>导入英语题目</span>
              </button>
            )}
            {onGoToPapers && (
              <button
                type="button"
                onClick={onGoToPapers}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>切换至整套真题模考</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 题型大药丸导航 */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100 dark:border-slate-800">
          {navTabs.map((tab) => {
            const isActive = selectedType === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedType(tab.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* 次级筛选栏：科目与关键词 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>适用考试:</span>
            </span>
            {(
              [
                { key: 'both', label: '英一 / 英二 通用' },
                { key: 'english_1', label: '仅英语(一)' },
                { key: 'english_2', label: '仅英语(二)' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedExam(item.key)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedExam === item.key
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索真题篇目、考查话题..."
              className="h-8 pl-8 pr-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 outline-none w-48 sm:w-60 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* 题型模块列表流 */}
      <div className="space-y-6">
        {/* 0. 我的导入题库卡片区（若用户通过 PDF 或文本提取了英语题） */}
        {(selectedType === 'all' || selectedType === 'custom') && customGroups.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>📥 我的导入题库（PDF 提取 / 自定义英语专项 · 共 {customQuestions.length} 题）</span>
              </h3>
              <span className="text-[11px] text-slate-400">{customGroups.length} 个题组</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customGroups.map((grp) => (
                <div
                  key={grp.id}
                  onClick={() => setActiveItem({ type: 'custom_group', data: grp })}
                  className="rounded-2xl border border-teal-200/90 dark:border-teal-800/70 bg-gradient-to-br from-teal-50/40 via-white to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-teal-950/35 p-5 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-teal-100/80 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 font-bold border border-teal-200/70 dark:border-teal-800">
                        {grp.hasSharedPassage ? '📖 双栏篇章题组' : '📝 独立专项题集'} · {grp.subjectLabel}
                      </span>
                      <span className="text-slate-400 font-mono">{grp.questions.length} 题</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors leading-snug">
                      {grp.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-serif">
                      {grp.sharedPassage
                        ? grp.sharedPassage.slice(0, 140) + '...'
                        : grp.questions[0]?.question?.slice(0, 120) || '自定义导入英语题目'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-teal-700 dark:text-teal-300 font-medium">
                      {grp.hasSharedPassage ? '支持左文右题分栏与点词即查' : '支持逐题精练与解析对照'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">
                      <span>进入刷题</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1. 完形填空卡片区 */}
        {(selectedType === 'all' || selectedType === 'cloze') && filteredClozes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span className="text-base">🧩</span>
                <span>完形填空专项 (Section I Use of English · 20空 10分)</span>
              </h3>
              <span className="text-[11px] text-slate-400">{filteredClozes.length} 篇收录</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClozes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem({ type: 'cloze', data: item })}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                        {item.year} 年 · {item.examType === 'english_1' ? '英语(一)' : '英语(二)'}
                      </span>
                      <span className="text-slate-400 font-mono">约 {item.wordCount} 词</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/50 px-2 py-0.5 rounded-md font-medium">
                      考查：{item.topic}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      <span>开始刷题</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. 传统阅读卡片区 */}
        {(selectedType === 'all' || selectedType === 'reading') && filteredReadings.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span className="text-base">📖</span>
                <span>传统阅读理解 (Section II Part A · 四选一精读 5题 10分)</span>
              </h3>
              <span className="text-[11px] text-slate-400">{filteredReadings.length} 篇收录</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReadings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem({ type: 'reading', data: item })}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                        {item.year} 年 · {item.examType === 'english_1' ? '英语(一)' : '英语(二)'} · {item.textNumber}
                      </span>
                      <span className="text-slate-400">{item.questions.length} 题选择</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]">
                      {item.topic}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      <span>题文联动精读</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. 新题型卡片区 */}
        {(selectedType === 'all' || selectedType === 'new_type') && filteredNewTypes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span className="text-base">🔀</span>
                <span>新题型专项 (Section II Part B · 七选五 / 排序 / 小标题匹配 10分)</span>
              </h3>
              <span className="text-[11px] text-slate-400">{filteredNewTypes.length} 篇收录</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNewTypes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem({ type: 'new_type', data: item })}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/60 dark:border-purple-800/60">
                        {item.year} 年 · {item.examType === 'english_1' ? '英语(一)' : '英语(二)'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 text-[10px] font-bold">
                        {item.variantLabel}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      7 选 5 逻辑槽位 · 支持双语对照
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      <span>开启逻辑推演</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 翻译卡片区 */}
        {(selectedType === 'all' || selectedType === 'translation') && filteredTranslations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span className="text-base">✍️</span>
                <span>英汉翻译专项 (Section II Part C · 画线长难句 / 全文精译 10/15分)</span>
              </h3>
              <span className="text-[11px] text-slate-400">{filteredTranslations.length} 篇收录</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTranslations.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem({ type: 'translation', data: item })}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/60">
                        {item.year} 年 · {item.examType === 'english_1' ? '英语(一)' : '英语(二)'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {item.items.length} 题翻译
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.source}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      支持 AI 对照官方采分点流式批改
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      <span>开始翻译</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
