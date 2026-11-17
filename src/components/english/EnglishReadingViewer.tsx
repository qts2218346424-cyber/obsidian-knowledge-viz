import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  RotateCcw,
  Compass,
  Bookmark,
  Volume2,
  Search,
  Star,
  Check,
  Highlighter,
} from 'lucide-react'
import type { EnglishReadingPassage } from '../../data/englishPracticeData'
import WordLookupPopover, {
  useEnglishWordLookup,
  speakEnglishText,
  saveWordToEbbinghaus,
  isWordSavedLocally,
} from './WordLookupPopover'

interface EnglishReadingViewerProps {
  passage: EnglishReadingPassage
  onBack?: () => void
}

type FontScale = 'sm' | 'md' | 'lg'

const STORAGE_KEY_READING_PREFIX = 'coreforge_english_reading_record_'

/**
 * 在英文原句中安全高亮当前题目的题眼线索词（locatingKeywords）
 */
function renderHighlightedSentence(sentence: string, keywords: string[]): React.ReactNode {
  const validKeywords = keywords
    .map((k) => k.trim())
    .filter((k) => k.length >= 2)
    .sort((a, b) => b.length - a.length)

  if (validKeywords.length === 0) return sentence

  const escapedPattern = validKeywords
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')

  const regex = new RegExp(`(${escapedPattern})`, 'gi')
  const parts = sentence.split(regex)
  if (parts.length <= 1) return sentence

  const lowerSet = new Set(validKeywords.map((k) => k.toLowerCase()))

  return parts.map((part, idx) => {
    if (lowerSet.has(part.toLowerCase())) {
      return (
        <mark
          key={idx}
          className="px-1 py-0.5 rounded-md bg-amber-200/85 dark:bg-amber-500/30 text-amber-950 dark:text-amber-100 font-semibold border-b-2 border-amber-400 dark:border-amber-400/80 transition-colors"
        >
          {part}
        </mark>
      )
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>
  })
}

/**
 * 辅助拆解长难句为主句主干提示与修饰从句层次
 */
function extractGrammarLayers(en: string, hardGrammar: string): {
  mainClauseHint: string
  subordinateDetail: string
} {
  // 若解析文案中显式给出了“主干为...”则直接提取
  const explicitMatch = hardGrammar.match(/主干(?:为|是)[：:\s]*([^。；;]+)/)
  if (explicitMatch) {
    return {
      mainClauseHint: explicitMatch[1].trim(),
      subordinateDetail: hardGrammar,
    }
  }

  // 智能剥离括号/双破折号插入语与句首状语从句，定位核心主干子句
  const stripped = en
    .replace(/—[^—]+—/g, ' ')
    .replace(/^(?:Yet|However|Moreover|Consequently|Furthermore|Instead of[^,]+|When[^,]+|Although[^,]+|While[^,]+),\s*/i, '')
    .split(/,\s*(?:which|who|revealing|triggering|allowing|asserting|making|enabling)\b/i)[0]
    .trim()

  return {
    mainClauseHint: stripped.length > 110 ? stripped.slice(0, 108) + '...' : stripped,
    subordinateDetail: hardGrammar,
  }
}

export default function EnglishReadingViewer({ passage, onBack }: EnglishReadingViewerProps) {
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
  const [showHardGrammar, setShowHardGrammar] = useState<boolean>(false)
  const [showClueHighlight, setShowClueHighlight] = useState<boolean>(true)
  const [fontScale, setFontScale] = useState<FontScale>('md')
  const [activeQuestionId, setActiveQuestionId] = useState<string>(passage.questions[0]?.id || '')
  const [highlightParagraph, setHighlightParagraph] = useState<number | null>(
    passage.questions[0]?.targetParagraph ?? null
  )
  const [savedVocabSet, setSavedVocabSet] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const v of passage.vocabularyList || []) {
      if (isWordSavedLocally(v.word)) init[v.word.toLowerCase()] = true
    }
    return init
  })

  // 正文即点即查 Hook
  const {
    lookupState,
    closeLookup,
    handleWordLookupClick,
    handleWordLookupDoubleClick,
  } = useEnglishWordLookup()

  // 左侧段落容器引用，用于平滑滚动定位
  const paragraphRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // 切换篇目时同步重置状态
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_READING_PREFIX}${passage.id}`)
      setAnswers(saved ? JSON.parse(saved) : {})
    } catch {
      setAnswers({})
    }
    setIsSubmitted(false)
    setActiveQuestionId(passage.questions[0]?.id || '')
    setHighlightParagraph(passage.questions[0]?.targetParagraph ?? null)
  }, [passage.id, passage.questions])

  // 保存作答记录
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_READING_PREFIX}${passage.id}`, JSON.stringify(answers))
    } catch {
      // ignore
    }
  }, [answers, passage.id])

  // 监听全局生词入库事件，实时刷新底部核心词表星标
  useEffect(() => {
    const syncHandler = (ev: Event) => {
      const detail = (ev as CustomEvent<{ word?: string }>).detail
      if (detail?.word) {
        setSavedVocabSet((prev) => ({ ...prev, [detail.word!.toLowerCase()]: true }))
      }
    }
    window.addEventListener('english-vocab-saved', syncHandler)
    return () => window.removeEventListener('english-vocab-saved', syncHandler)
  }, [])

  const activeQuestion = useMemo(() => {
    return passage.questions.find((q) => q.id === activeQuestionId) || passage.questions[0]
  }, [passage.questions, activeQuestionId])

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
    const score = correctCount * 2
    const totalScore = totalCount * 2
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0
    return { correctCount, attemptedCount, totalCount, score, totalScore, accuracy }
  }, [passage.questions, answers])

  // 题文双向联动：点击题目卡片或定位按钮，左侧平滑滚动至对应段落并原位高亮题眼词
  const handleFocusQuestionAndLocate = (paraNum: number, qId: string, shouldScroll = true) => {
    setActiveQuestionId(qId)
    setHighlightParagraph(paraNum)
    if (shouldScroll) {
      const el = paragraphRefs.current[paraNum]
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const handleSelectOption = (qId: string, paraNum: number, optKey: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({ ...prev, [qId]: optKey }))
    setActiveQuestionId(qId)
    setHighlightParagraph(paraNum)
  }

  const handleReset = () => {
    if (window.confirm('确定要清空本篇阅读理解的作答记录吗？')) {
      setAnswers({})
      setIsSubmitted(false)
      try {
        localStorage.removeItem(`${STORAGE_KEY_READING_PREFIX}${passage.id}`)
      } catch {
        // ignore
      }
    }
  }

  const handleSubmit = () => {
    if (stats.attemptedCount < passage.questions.length) {
      if (!window.confirm(`还有 ${passage.questions.length - stats.attemptedCount} 道题未作答，确定要交卷吗？`)) {
        return
      }
    }
    setIsSubmitted(true)
    setShowClueHighlight(true)
  }

  const handleSavePresetWord = async (v: { word: string; meaning: string; phonetic?: string }) => {
    try {
      await saveWordToEbbinghaus({
        word: v.word,
        phonetic: v.phonetic || '',
        definition: v.meaning,
        example: `From ${passage.year} Reading ${passage.textNumber}: ${passage.title}`,
      })
      setSavedVocabSet((prev) => ({ ...prev, [v.word.toLowerCase()]: true }))
    } catch {
      // ignore
    }
  }

  const typographyClass =
    fontScale === 'sm'
      ? 'font-serif text-[14.5px] sm:text-[15.5px] leading-[1.82] tracking-[0.01em]'
      : fontScale === 'lg'
      ? 'font-serif text-[17px] sm:text-[18px] leading-[1.92] tracking-[0.012em]'
      : 'font-serif text-[15.5px] sm:text-[16.5px] leading-[1.86] tracking-[0.01em]'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 正文即点即查生词气泡 */}
      <WordLookupPopover
        state={lookupState}
        onClose={closeLookup}
        onWordSaved={(w) => setSavedVocabSet((prev) => ({ ...prev, [w.toLowerCase()]: true }))}
      />

      {/* 顶部操作条 */}
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
              {passage.examType === 'english_1' ? '英语(一)' : '英语(二)'}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {passage.year} 年真题 · {passage.textNumber}
            </span>
          </div>
          <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
            💡 点击文中任意英文单词即可即点即查并加入艾宾浩斯词库
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 字号微调胶囊 */}
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
                title="调节英文阅读字号"
              >
                {sz === 'sm' ? 'A-' : sz === 'md' ? 'A' : 'A+'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowClueHighlight((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              showClueHighlight
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/70'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="在定位段落自动用琥珀荧光笔标出当前小题的题眼线索词"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{showClueHighlight ? '题眼荧光笔: 开' : '题眼荧光笔'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBilingual(!showBilingual)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              showBilingual
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {showBilingual ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showBilingual ? '收起逐句译文' : '双语精读对照'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHardGrammar(!showHardGrammar)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              showHardGrammar
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{showHardGrammar ? '🔍 收起长难句透视' : '🔍 长难句语法透视'}</span>
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
              className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-xs cursor-pointer"
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

      {/* 左右分栏（支持点击任意英文单词即点即查） */}
      <div
        onClick={handleWordLookupClick}
        onDoubleClick={handleWordLookupDoubleClick}
        className="grid grid-cols-1 lg:grid-cols-12 gap-5"
      >
        {/* 左侧：文章主体与段落标号 (7列) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs space-y-6">
            <div>
              <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                {passage.source}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {passage.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 leading-relaxed">
                📖 <strong>文章立意梗概：</strong> {passage.summary}
              </p>
            </div>

            {/* 逐段逐句学术衬线渲染 */}
            <div className="space-y-6">
              {passage.paragraphs.map((para) => {
                const isTargetPara = highlightParagraph === para.paraIndex
                const activeClues =
                  isTargetPara &&
                  (showClueHighlight || isSubmitted) &&
                  activeQuestion?.targetParagraph === para.paraIndex
                    ? activeQuestion.locatingKeywords || []
                    : []

                return (
                  <div
                    key={para.paraIndex}
                    ref={(el) => {
                      paragraphRefs.current[para.paraIndex] = el
                    }}
                    className={`rounded-2xl p-4 sm:p-5 transition-all duration-300 border ${
                      isTargetPara
                        ? 'border-indigo-400 dark:border-indigo-500/70 bg-indigo-50/25 dark:bg-indigo-950/25 ring-2 ring-indigo-500/15 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        PARAGRAPH {para.paraIndex}
                      </span>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isTargetPara && activeQuestion && (
                          <span className="text-[10.5px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/90 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Compass className="w-3 h-3" />
                            <span>第 {activeQuestion.number} 题定位段</span>
                          </span>
                        )}
                        {activeClues.length > 0 && (
                          <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-200 bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300/70 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
                            🖍️ 已标出 {activeClues.length} 处同义替换线索
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`space-y-4 text-slate-800 dark:text-slate-100 ${typographyClass}`}>
                      {para.sentences.map((sen, sIdx) => {
                        const layers =
                          sen.isHard && sen.hardGrammar
                            ? extractGrammarLayers(sen.en, sen.hardGrammar)
                            : null

                        return (
                          <div key={sIdx} className="space-y-1.5">
                            <p
                              className={`cursor-text selection:bg-indigo-200/70 dark:selection:bg-indigo-500/40 ${
                                sen.isHard
                                  ? 'underline decoration-amber-400/80 decoration-wavy decoration-1 underline-offset-4'
                                  : ''
                              }`}
                            >
                              {activeClues.length > 0
                                ? renderHighlightedSentence(sen.en, activeClues)
                                : sen.en}
                            </p>

                            {/* 逐句译文 */}
                            {showBilingual && (
                              <p className="font-sans text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 pt-0.5 leading-relaxed pl-2.5 border-l-2 border-slate-200 dark:border-slate-700">
                                {sen.zh}
                              </p>
                            )}

                            {/* 结构化长难句语法层次透视卡片（区分主句主干与修饰从句） */}
                            {showHardGrammar && sen.isHard && layers && (
                              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 font-sans text-xs space-y-2 mt-2 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    <span>长难句语法结构层次透视</span>
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold">
                                    重点长难句
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                  <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-800/50">
                                    <span className="text-[10.5px] font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">
                                      🌳 主句主干核心 (Main Clause)：
                                    </span>
                                    <span className="font-serif text-xs sm:text-[13px] text-slate-900 dark:text-slate-100">
                                      {layers.mainClauseHint}
                                    </span>
                                  </div>

                                  <div className="p-2.5 rounded-xl bg-white/75 dark:bg-slate-900/60 border border-amber-200/50 dark:border-amber-800/40">
                                    <span className="text-[10.5px] font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                                      🔗 修饰从句与逻辑拆解 (Modifiers & Clauses)：
                                    </span>
                                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                      {layers.subordinateDetail}
                                    </span>
                                  </div>
                                </div>
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

            {/* 核心词汇小贴士（支持发音与一键写入艾宾浩斯生词库） */}
            {passage.vocabularyList && passage.vocabularyList.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/45 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/60 space-y-3">
                <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>本篇考研核心生词矩阵（点击星标同步至艾宾浩斯词库）</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {passage.vocabularyList.map((v, vIdx) => {
                    const saved = Boolean(savedVocabSet[v.word.toLowerCase()])
                    return (
                      <div
                        key={vIdx}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <strong className="font-serif text-sm text-indigo-900 dark:text-indigo-200">
                              {v.word}
                            </strong>
                            {v.phonetic && (
                              <span className="text-[10.5px] font-mono text-slate-400">
                                {v.phonetic}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                            {v.meaning}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => speakEnglishText(v.word, 'en-US')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="朗读发音"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSavePresetWord(v)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              saved
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
                            }`}
                            title={saved ? '已加入艾宾浩斯生词库' : '加入艾宾浩斯生词库'}
                          >
                            {saved ? <Check className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：单选题与双向定位精讲 (5列) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5 sticky top-4 max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>精选单项选择 ({passage.questions.length} 题 · 点击题卡自动定位段落)</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                每题 2 分
              </span>
            </div>

            <div className="space-y-5">
              {passage.questions.map((q) => {
                const userChoice = answers[q.id]
                const isCorrect = userChoice === q.answer
                const isCurrentlyFocused = activeQuestionId === q.id

                return (
                  <div
                    key={q.id}
                    onClick={() => handleFocusQuestionAndLocate(q.targetParagraph, q.id, true)}
                    className={`p-4 rounded-2xl border transition-all space-y-3 cursor-pointer ${
                      isCurrentlyFocused
                        ? 'border-indigo-400 dark:border-indigo-500/80 bg-indigo-50/25 dark:bg-indigo-950/25 shadow-2xs ring-1 ring-indigo-500/15'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-900 dark:bg-indigo-600 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                          {q.number}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 px-2 py-0.5 rounded">
                          {q.category}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowClueHighlight(true)
                          handleFocusQuestionAndLocate(q.targetParagraph, q.id, true)
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                        title="点击左侧平滑定位对应段落并高亮题眼线索词"
                      >
                        <Compass className="w-3 h-3" />
                        <span>定位第 {q.targetParagraph} 段</span>
                      </button>
                    </div>

                    <p className="font-serif text-[15px] font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {q.stem}
                    </p>

                    {/* 4 个选项按钮 */}
                    <div className="space-y-2">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const chosen = userChoice === optKey

                        let optClass =
                          'w-full text-left p-3 rounded-xl border font-serif text-[14.5px] leading-relaxed transition-all flex items-start gap-2.5 cursor-pointer '

                        if (isSubmitted) {
                          if (optKey === q.answer) {
                            optClass +=
                              'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500/20'
                          } else if (chosen && !isCorrect) {
                            optClass +=
                              'bg-rose-50 dark:bg-rose-950/50 border-rose-400 dark:border-rose-600 text-rose-950 dark:text-rose-100 font-semibold ring-1 ring-rose-500/20'
                          } else {
                            optClass +=
                              'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 opacity-65'
                          }
                        } else if (chosen) {
                          optClass +=
                            'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-500 text-indigo-950 dark:text-indigo-100 font-semibold ring-1 ring-indigo-500/20'
                        } else {
                          optClass +=
                            'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                        }

                        return (
                          <button
                            key={optKey}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectOption(q.id, q.targetParagraph, optKey)
                            }}
                            className={optClass}
                          >
                            <span
                              className={`w-5 h-5 rounded-full font-mono flex items-center justify-center font-bold text-[10.5px] shrink-0 mt-0.5 ${
                                chosen
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
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
                            ? 'bg-emerald-50/75 dark:bg-emerald-950/35 border-emerald-200 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-100'
                            : 'bg-rose-50/75 dark:bg-rose-950/35 border-rose-200 dark:border-rose-800/70 text-rose-950 dark:text-rose-100'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>答对！正确答案: [{q.answer}]</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                <span>答错，正确答案为: [{q.answer}]</span>
                              </>
                            )}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200">
                            {q.category}
                          </span>
                        </div>

                        <p className="text-[11.5px] leading-relaxed pt-1 border-t border-black/5 dark:border-white/10 font-sans">
                          {q.analysis}
                        </p>

                        {q.locatingKeywords && q.locatingKeywords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300">
                              🖍️ 原文定位题眼：
                            </span>
                            {q.locatingKeywords.map((kw, kIdx) => (
                              <span
                                key={kIdx}
                                className="px-1.5 py-0.2 rounded bg-amber-100/90 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-serif text-[11px]"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}

                        {q.paraphraseDetail && (
                          <div className="text-[11px] p-2.5 rounded-xl bg-white/85 dark:bg-slate-900/80 border border-black/5 dark:border-white/10 text-slate-700 dark:text-slate-200 font-sans">
                            <strong className="text-indigo-700 dark:text-indigo-300">
                              💡 同义替换与干扰项排查:
                            </strong>
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
