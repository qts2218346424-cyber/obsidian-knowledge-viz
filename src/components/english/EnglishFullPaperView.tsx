import React, { useState, useMemo, useEffect } from 'react'
import {
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Layers,
  ChevronRight,
  ChevronLeft,
  FileText,
  Play,
  Pause,
  HelpCircle,
} from 'lucide-react'
import {
  ENGLISH_FULL_EXAM_PAPERS,
  ENGLISH_CLOZE_BANK,
  ENGLISH_READING_BANK,
  ENGLISH_NEW_TYPE_BANK,
  ENGLISH_TRANSLATION_BANK,
  type EnglishFullPaper,
  type EnglishExamCategory,
} from '../../data/englishPracticeData'
import { ENGLISH_EXAM_PAPERS } from '../../data/examPapers/englishPapers'
import type { ExamPaper, ExamPaperQuestion } from '../../data/examPapers/types'
import MarkdownRenderer from '../MarkdownRenderer'
import EnglishClozeViewer from './EnglishClozeViewer'
import EnglishReadingViewer from './EnglishReadingViewer'
import EnglishNewTypeViewer from './EnglishNewTypeViewer'
import EnglishTranslationViewer from './EnglishTranslationViewer'

interface EnglishFullPaperViewProps {
  onGoToEssayGrading?: () => void
  onGoToPractice?: () => void
}

type SectionKey = 'cloze' | 'reading' | 'new_type' | 'translation' | 'writing'

type PaperKind = 'modular' | 'full_raw'

interface DisplayPaperItem {
  id: string
  year: number
  kind: PaperKind
  examType: EnglishExamCategory
  categoryLabel: string
  title: string
  subtitle: string
  totalScore: number
  durationMinutes: number
  hotTopics: string[]
  avgScoreDesc?: string
  modularPaper?: EnglishFullPaper
  rawPaper?: ExamPaper
}

export default function EnglishFullPaperView({
  onGoToEssayGrading,
  onGoToPractice,
}: EnglishFullPaperViewProps) {
  // 汇总所有英语真题套卷（包含模块化模考舱套卷 + 全国统考原卷整卷）
  const allPapers = useMemo<DisplayPaperItem[]>(() => {
    const list: DisplayPaperItem[] = []

    for (const p of ENGLISH_FULL_EXAM_PAPERS) {
      list.push({
        id: p.id,
        year: p.year,
        kind: 'modular',
        examType: p.examType,
        categoryLabel: p.examType === 'english_1' ? '英语(一)' : '英语(二)',
        title: p.title,
        subtitle: p.subtitle,
        totalScore: p.totalScore,
        durationMinutes: p.durationMinutes,
        hotTopics: p.hotTopics,
        avgScoreDesc: `全国历年平均分: ${p.avgNationalScore} 分`,
        modularPaper: p,
      })
    }

    for (const p of ENGLISH_EXAM_PAPERS) {
      list.push({
        id: p.id,
        year: p.year,
        kind: 'full_raw',
        examType: 'english_1',
        categoryLabel: '英语(一) 全国统考原卷',
        title: p.title,
        subtitle: p.subtitle || `${p.year} 年全国硕士研究生统一命题官方真实原卷`,
        totalScore: p.totalScore,
        durationMinutes: p.durationMinutes,
        hotTopics: ['全国统考原卷', '完形填空', '传统阅读', '英译汉', '高分写作'],
        avgScoreDesc: `共收录 ${p.questions.length} 道权威真实原卷试题与长难句详解`,
        rawPaper: p,
      })
    }

    return list.sort((a, b) => b.year - a.year)
  }, [])

  // 卷种筛选
  const [examTypeFilter, setExamTypeFilter] = useState<EnglishExamCategory | 'all'>('all')

  const filteredPaperList = useMemo(() => {
    if (examTypeFilter === 'all') return allPapers
    return allPapers.filter((p) => p.examType === examTypeFilter || p.examType === 'both')
  }, [allPapers, examTypeFilter])

  // 当前选中的套卷 ID
  const [selectedPaperId, setSelectedPaperId] = useState<string>(allPapers[0]?.id || '')

  const currentPaper = useMemo(() => {
    return allPapers.find((p) => p.id === selectedPaperId) || allPapers[0]
  }, [allPapers, selectedPaperId])

  // 是否处于模考工作台
  const [isExamMode, setIsExamMode] = useState<boolean>(false)

  // 计时器状态
  const [timerSeconds, setTimerSeconds] = useState<number>(180 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false)

  // ── 模块化套卷状态 ───────────────────────────────────────────
  const [activeModularSection, setActiveModularSection] = useState<SectionKey>('cloze')
  const [activeReadingIndex, setActiveReadingIndex] = useState<number>(0)

  const activeModularPaper = currentPaper?.modularPaper || ENGLISH_FULL_EXAM_PAPERS[0]
  const clozeExam = useMemo(() => {
    return (
      ENGLISH_CLOZE_BANK.find((c) => c.id === activeModularPaper.clozeId) ||
      ENGLISH_CLOZE_BANK[0]
    )
  }, [activeModularPaper.clozeId])

  const readingExams = useMemo(() => {
    return ENGLISH_READING_BANK.filter((r) => activeModularPaper.readingIds.includes(r.id))
  }, [activeModularPaper.readingIds])

  const newTypeExam = useMemo(() => {
    return (
      ENGLISH_NEW_TYPE_BANK.find((n) => n.id === activeModularPaper.newTypeId) ||
      ENGLISH_NEW_TYPE_BANK[0]
    )
  }, [activeModularPaper.newTypeId])

  const translationExam = useMemo(() => {
    return (
      ENGLISH_TRANSLATION_BANK.find((t) => t.id === activeModularPaper.translationId) ||
      ENGLISH_TRANSLATION_BANK[0]
    )
  }, [activeModularPaper.translationId])

  // ── 统考原卷状态 ─────────────────────────────────────────────
  const rawPaperQuestions = useMemo<ExamPaperQuestion[]>(() => {
    return currentPaper?.rawPaper?.questions || []
  }, [currentPaper])

  const [rawQuestionIndex, setRawQuestionIndex] = useState<number>(0)
  const [rawUserAnswers, setRawUserAnswers] = useState<Record<string, string>>({})
  const [rawShowExplanations, setRawShowExplanations] = useState<Record<string, boolean>>({})
  const [rawIsSubmitted, setRawIsSubmitted] = useState<boolean>(false)
  const [rawSectionFilter, setRawSectionFilter] = useState<string>('all')

  const displayedRawQuestions = useMemo(() => {
    if (rawSectionFilter === 'all') return rawPaperQuestions
    return rawPaperQuestions.filter((q) => q.sectionName === rawSectionFilter)
  }, [rawPaperQuestions, rawSectionFilter])

  const currentRawQ = displayedRawQuestions[rawQuestionIndex] || displayedRawQuestions[0]

  // 计算原卷答题统计
  const rawStats = useMemo(() => {
    let answered = 0
    let correct = 0
    let earnedScore = 0

    for (const q of rawPaperQuestions) {
      const userAns = rawUserAnswers[q.id]?.trim().toUpperCase()
      if (userAns) {
        answered++
        if (q.type === 'choice' && userAns === q.correctAnswer?.trim().toUpperCase()) {
          correct++
          earnedScore += q.score || 0
        }
      }
    }

    const totalChoice = rawPaperQuestions.filter((q) => q.type === 'choice').length
    return {
      total: rawPaperQuestions.length,
      totalChoice,
      answered,
      correct,
      earnedScore,
      percentage: totalChoice > 0 ? Math.round((correct / totalChoice) * 100) : 0,
    }
  }, [rawPaperQuestions, rawUserAnswers])

  // 倒计时计时器
  useEffect(() => {
    let timer: any = null
    if (isExamMode && isTimerRunning && timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isExamMode, isTimerRunning, timerSeconds])

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStartExam = () => {
    setIsExamMode(true)
    setIsTimerRunning(true)
    setTimerSeconds((currentPaper?.durationMinutes || 180) * 60)
    setActiveModularSection('cloze')
    setRawQuestionIndex(0)
    setRawIsSubmitted(false)
  }

  const handleExitExam = () => {
    if (window.confirm('确定要退出当前模考模式吗？已做题记录已暂存。')) {
      setIsExamMode(false)
      setIsTimerRunning(false)
    }
  }

  // 原卷选择题作答
  const handleSelectRawChoice = (questionId: string, optKey: string) => {
    setRawUserAnswers((prev) => ({
      ...prev,
      [questionId]: optKey,
    }))
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 头部：考研英语学科整卷库与模考舱 */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                📜
              </span>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                考研英语 · 历年真题套卷与全真模考舱
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              汇聚考研英语(一)与英语(二)全国统考历年官方真实整卷，支持 180 分钟实战模考计时、题号矩阵色板与长难句精析
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 卷种筛选 */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setExamTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  examTypeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部试卷 ({allPapers.length})
              </button>
              <button
                type="button"
                onClick={() => setExamTypeFilter('english_1')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  examTypeFilter === 'english_1'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                英语(一)
              </button>
              <button
                type="button"
                onClick={() => setExamTypeFilter('english_2')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  examTypeFilter === 'english_2'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                英语(二)
              </button>
            </div>

            {onGoToPractice && (
              <button
                type="button"
                onClick={onGoToPractice}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer shrink-0 border border-indigo-200/60"
              >
                <span>切换至分题型专项刷题</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 试卷列表网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {filteredPaperList.map((paper) => {
            const isSelected = selectedPaperId === paper.id
            const isRaw = paper.kind === 'full_raw'

            return (
              <div
                key={paper.id}
                onClick={() => {
                  setSelectedPaperId(paper.id)
                  if (isExamMode) setIsExamMode(false)
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden group ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                {/* 顶部指示条 */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isRaw
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-600'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                  }`}
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                        isRaw
                          ? 'bg-teal-50 text-teal-700 border-teal-200/60'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                      }`}
                    >
                      {paper.year} 年 · {paper.categoryLabel}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {paper.durationMinutes} 分钟
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {paper.title}
                  </h3>

                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {paper.hotTopics.slice(0, 3).map((topic, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px]"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">
                    {paper.avgScoreDesc}
                  </span>
                  <span
                    className={`font-bold text-xs shrink-0 ${
                      isSelected ? 'text-indigo-600' : 'text-slate-500'
                    }`}
                  >
                    {isSelected ? '✓ 选定' : '选择'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 模考大厅 / 实战工作台 ─────────────────────────────── */}
      {!isExamMode ? (
        /* 试卷未开考：试卷结构与考点导览大厅 */
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/60">
                  {currentPaper.year} 年官方真题
                </span>
                <span>
                  {currentPaper.kind === 'full_raw'
                    ? '全国硕士研究生统一命题 · 官方统考原卷'
                    : currentPaper.examType === 'english_1'
                    ? '英语(一) 权威全题型全真模考舱'
                    : '英语(二) 权威全题型全真模考舱'}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-2">{currentPaper.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{currentPaper.subtitle}</p>
            </div>

            <button
              type="button"
              onClick={handleStartExam}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>进入全真模考 (180分钟全卷)</span>
            </button>
          </div>

          {/* 试卷结构总览 */}
          {currentPaper.kind === 'modular' ? (
            /* 模块化套卷明细 */
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>试卷模块明细与分值构成 (总计 100 分)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">Section I: 完形填空 (Use of English)</span>
                    <span className="text-indigo-600 font-mono">20 题 · 10 分</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    篇目：{clozeExam.title} (约 {clozeExam.wordCount} 词，考查词汇搭配与语境连词)
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExamMode(true)
                        setActiveModularSection('cloze')
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      单项做题 →
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">Section II Part A: 传统阅读 (Reading)</span>
                    <span className="text-indigo-600 font-mono">4 篇 · 40 分</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    篇目：{readingExams.map((r) => r.textNumber).join(', ') || 'Text 1~4'} (考查主旨细节推理)
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExamMode(true)
                        setActiveModularSection('reading')
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      单项做题 →
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">Section II Part B: 新题型 (New Types)</span>
                    <span className="text-indigo-600 font-mono">5 题 · 10 分</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    题型：{newTypeExam.variantLabel} ({newTypeExam.title})
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExamMode(true)
                        setActiveModularSection('new_type')
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      单项做题 →
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">Section II Part C: 英汉翻译 (Translation)</span>
                    <span className="text-indigo-600 font-mono">
                      {activeModularPaper.examType === 'english_1' ? '5 题 · 10 分' : '整段 · 15 分'}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    考查长难句切分主干、从句转换与地道中文译文。
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExamMode(true)
                        setActiveModularSection('translation')
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      单项做题 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 全国统考原卷明细 */
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>全国统考真实原卷试卷架构 (总题数 {rawPaperQuestions.length} 题 · 满分 100 分)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">Section I 英语知识运用</span>
                    <span className="text-teal-600 font-mono">20 题 · 10 分</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    完形填空 20 道客观单选题，深度考查篇章连贯、逻辑词与词义辨析
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">Section II 阅读理解</span>
                    <span className="text-teal-600 font-mono">20 题 · 40 分</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    4 篇传统阅读深度精读，涵盖主旨、细节、推理与作者态度题型
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900">Section II Part C / 写作</span>
                    <span className="text-teal-600 font-mono">主观题 · 50 分</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    英汉翻译 5 句核心长难句攻关 + 应用文小作文与图画大作文
                  </p>
                </div>
              </div>

              {currentPaper.rawPaper?.description && (
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/60 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-teal-900 mr-1.5">📌 试卷导读：</span>
                  <MarkdownRenderer content={currentPaper.rawPaper.description} inline />
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* 模考进行时工作台 */
        <div className="space-y-5">
          {/* 模考顶栏控制条 */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white shadow-md">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExitExam}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors cursor-pointer"
              >
                ← 退出模考
              </button>
              <div>
                <div className="text-xs font-bold flex items-center gap-2">
                  <span>{currentPaper.title}</span>
                  <span className="text-[10px] bg-indigo-500 px-1.5 py-0.2 rounded font-mono">
                    {currentPaper.kind === 'full_raw' ? '原卷实战模考' : '模考舱实战中'}
                  </span>
                </div>
              </div>
            </div>

            {/* 倒计时器 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-mono text-sm font-bold bg-white/10 px-3 py-1 rounded-xl">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className={timerSeconds < 600 ? 'text-rose-400 animate-pulse' : 'text-white'}>
                  {formatTime(timerSeconds)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-xs"
                title={isTimerRunning ? '暂停计时' : '继续计时'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 如果是模块化套卷 */}
          {currentPaper.kind === 'modular' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveModularSection('cloze')}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeModularSection === 'cloze'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  1. 完形填空 (10分)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModularSection('reading')}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeModularSection === 'reading'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  2. 传统阅读 (40分)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModularSection('new_type')}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeModularSection === 'new_type'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  3. 新题型 (10分)
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModularSection('translation')}
                  className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeModularSection === 'translation'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  4. 英汉翻译 ({activeModularPaper.examType === 'english_1' ? '10分' : '15分'})
                </button>

                {onGoToEssayGrading && (
                  <button
                    type="button"
                    onClick={onGoToEssayGrading}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-all cursor-pointer shrink-0 flex items-center gap-1 ml-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>5. 作文智能批改舱 →</span>
                  </button>
                )}
              </div>

              <div>
                {activeModularSection === 'cloze' && (
                  <EnglishClozeViewer exam={clozeExam} onBack={handleExitExam} />
                )}

                {activeModularSection === 'reading' && (
                  <div className="space-y-4">
                    {readingExams.length > 1 && (
                      <div className="flex items-center gap-2 pb-1">
                        {readingExams.map((r, idx) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setActiveReadingIndex(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              activeReadingIndex === idx
                                ? 'bg-slate-900 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {r.textNumber}
                          </button>
                        ))}
                      </div>
                    )}
                    {readingExams[activeReadingIndex] && (
                      <EnglishReadingViewer
                        passage={readingExams[activeReadingIndex]}
                        onBack={handleExitExam}
                      />
                    )}
                  </div>
                )}

                {activeModularSection === 'new_type' && (
                  <EnglishNewTypeViewer exam={newTypeExam} onBack={handleExitExam} />
                )}

                {activeModularSection === 'translation' && (
                  <EnglishTranslationViewer exam={translationExam} onBack={handleExitExam} />
                )}
              </div>
            </div>
          ) : (
            /* 全国统考原卷模考交互舱 */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* 左侧/上方：试卷题号色板矩阵 (LeetCode / 粉笔风格) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>答题卡题号色板</span>
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      已答 {rawStats.answered} / {rawStats.total} 题
                    </span>
                  </div>

                  {/* 部分筛选 */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        setRawSectionFilter('all')
                        setRawQuestionIndex(0)
                      }}
                      className={`px-2 py-1 rounded-lg font-medium cursor-pointer ${
                        rawSectionFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      全部题目
                    </button>
                    {Array.from(new Set(rawPaperQuestions.map((q) => q.sectionName))).map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          setRawSectionFilter(sec)
                          setRawQuestionIndex(0)
                        }}
                        className={`px-2 py-1 rounded-lg font-medium cursor-pointer truncate max-w-[120px] ${
                          rawSectionFilter === sec
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={sec}
                      >
                        {sec.replace(/^Section\s*/i, '')}
                      </button>
                    ))}
                  </div>

                  {/* 题号按钮矩阵 */}
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 gap-1.5 max-h-72 overflow-y-auto pr-1">
                    {displayedRawQuestions.map((q, idx) => {
                      const userAns = rawUserAnswers[q.id]
                      const isCurrent = idx === rawQuestionIndex
                      const isCorrect =
                        rawIsSubmitted &&
                        q.type === 'choice' &&
                        userAns?.toUpperCase() === q.correctAnswer?.toUpperCase()
                      const isWrong =
                        rawIsSubmitted &&
                        q.type === 'choice' &&
                        userAns &&
                        userAns.toUpperCase() !== q.correctAnswer?.toUpperCase()

                      let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200'
                      if (isCurrent) {
                        btnStyle = 'ring-2 ring-indigo-500 font-bold border-indigo-400 bg-indigo-50 text-indigo-700'
                      } else if (rawIsSubmitted) {
                        if (isCorrect) btnStyle = 'bg-emerald-500 text-white border-emerald-600'
                        else if (isWrong) btnStyle = 'bg-rose-500 text-white border-rose-600'
                        else if (userAns) btnStyle = 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      } else if (userAns) {
                        btnStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold'
                      }

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setRawQuestionIndex(idx)}
                          className={`h-8 rounded-lg text-xs font-mono border flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                          title={`第 ${q.paperQuestionNumber} 题 (${q.sectionName})`}
                        >
                          {q.paperQuestionNumber}
                        </button>
                      )
                    })}
                  </div>

                  {/* 交卷评分控制按钮 */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRawIsSubmitted(true)}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>提交并全卷评分</span>
                    </button>
                    {rawIsSubmitted && (
                      <button
                        type="button"
                        onClick={() => {
                          setRawIsSubmitted(false)
                          setRawUserAnswers({})
                          setRawShowExplanations({})
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors cursor-pointer"
                        title="清空重刷"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 评分结果报告卡片 */}
                {rawIsSubmitted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200/80 shadow-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>🎉 全卷模考评估结果</span>
                      <span className="font-mono text-indigo-700 text-sm">
                        选择题得分: {rawStats.earnedScore} 分
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div>
                        客观选择题正确率: <strong>{rawStats.percentage}%</strong> ({rawStats.correct} /{' '}
                        {rawStats.totalChoice} 题)
                      </div>
                      <div>
                        已作答总计: {rawStats.answered} / {rawStats.total} 题
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 右侧：单题做题工作台 */}
              <div className="lg:col-span-8 space-y-4">
                {currentRawQ ? (
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
                    {/* 题目头部元信息 */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs">
                          第 {currentRawQ.paperQuestionNumber} 题
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {currentRawQ.sectionName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({currentRawQ.score} 分)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setRawShowExplanations((prev) => ({
                              ...prev,
                              [currentRawQ.id]: !prev[currentRawQ.id],
                            }))
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            {rawShowExplanations[currentRawQ.id] || rawIsSubmitted
                              ? '隐藏考点精解'
                              : '查看考点精解'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* 题干内容 */}
                    <div className="text-sm text-slate-800 leading-relaxed space-y-3">
                      <MarkdownRenderer content={currentRawQ.question} />
                    </div>

                    {/* 选择题选项 */}
                    {currentRawQ.type === 'choice' && currentRawQ.options && (
                      <div className="space-y-2 pt-2">
                        {currentRawQ.options.map((opt, oIdx) => {
                          const optKey = opt.match(/^([A-D])\./)?.[1] || ['A', 'B', 'C', 'D'][oIdx]
                          const isSelected = rawUserAnswers[currentRawQ.id] === optKey
                          const isCorrect =
                            rawIsSubmitted && optKey === currentRawQ.correctAnswer?.toUpperCase()
                          const isWrong =
                            rawIsSubmitted && isSelected && !isCorrect

                          let optStyle = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          if (isSelected) {
                            optStyle = 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 font-bold'
                          }
                          if (rawIsSubmitted) {
                            if (isCorrect) {
                              optStyle = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30 text-emerald-900 font-bold'
                            } else if (isWrong) {
                              optStyle = 'border-rose-500 bg-rose-50 text-rose-900'
                            }
                          }

                          return (
                            <div
                              key={oIdx}
                              onClick={() => handleSelectRawChoice(currentRawQ.id, optKey)}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs sm:text-sm ${optStyle}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 font-mono font-bold text-xs flex items-center justify-center shadow-2xs">
                                  {optKey}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {rawIsSubmitted && isCorrect && (
                                <span className="text-xs font-bold text-emerald-600">
                                  ✓ 正确答案
                                </span>
                              )}
                              {rawIsSubmitted && isWrong && (
                                <span className="text-xs font-bold text-rose-600">
                                  ✗ 你的选择
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* 非单选题（翻译或写作）：草稿文本框 */}
                    {currentRawQ.type !== 'choice' && (
                      <div className="pt-2 space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>你的答题草稿 / 译文练习：</span>
                          {onGoToEssayGrading && (
                            <button
                              type="button"
                              onClick={onGoToEssayGrading}
                              className="text-xs font-bold text-amber-600 hover:underline inline-flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>前往万能作文批改舱</span>
                            </button>
                          )}
                        </label>
                        <textarea
                          rows={4}
                          value={rawUserAnswers[currentRawQ.id] || ''}
                          onChange={(e) =>
                            setRawUserAnswers((prev) => ({
                              ...prev,
                              [currentRawQ.id]: e.target.value,
                            }))
                          }
                          placeholder="在此输入你的答题思路或译文草稿..."
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                        />
                      </div>
                    )}

                    {/* 官方详解与长难句剖析 */}
                    {(rawShowExplanations[currentRawQ.id] || rawIsSubmitted) && (
                      <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2 animate-in fade-in">
                        <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>官方标准答案与名师解析</span>
                          {currentRawQ.correctAnswer && (
                            <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold ml-1">
                              正确答案：{currentRawQ.correctAnswer}
                            </span>
                          )}
                        </div>
                        <div className="text-slate-700 leading-relaxed pt-1">
                          <MarkdownRenderer content={currentRawQ.explanation} />
                        </div>
                      </div>
                    )}

                    {/* 上下题切换与做题进度条 */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={rawQuestionIndex <= 0}
                        onClick={() => setRawQuestionIndex((prev) => Math.max(0, prev - 1))}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>上一题</span>
                      </button>

                      <span className="text-xs font-mono text-slate-400">
                        {rawQuestionIndex + 1} / {displayedRawQuestions.length}
                      </span>

                      <button
                        type="button"
                        disabled={rawQuestionIndex >= displayedRawQuestions.length - 1}
                        onClick={() =>
                          setRawQuestionIndex((prev) =>
                            Math.min(displayedRawQuestions.length - 1, prev + 1)
                          )
                        }
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <span>下一题</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-slate-400">
                    当前筛选下无题目
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
