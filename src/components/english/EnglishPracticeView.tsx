import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  Search,
  RotateCcw,
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
import EnglishClozeViewer from './EnglishClozeViewer'
import EnglishReadingViewer from './EnglishReadingViewer'
import EnglishNewTypeViewer from './EnglishNewTypeViewer'
import EnglishTranslationViewer from './EnglishTranslationViewer'

interface EnglishPracticeViewProps {
  onGoToPapers?: () => void
}

type PracticeActiveItem =
  | { type: 'cloze'; data: EnglishClozeExam }
  | { type: 'reading'; data: EnglishReadingPassage }
  | { type: 'new_type'; data: EnglishNewTypeExam }
  | { type: 'translation'; data: EnglishTranslationExam }
  | null

export default function EnglishPracticeView({ onGoToPapers }: EnglishPracticeViewProps) {
  // 当前正在刷的题目实例（null 表示处于题库选择列表）
  const [activeItem, setActiveItem] = useState<PracticeActiveItem>(null)

  // 题型筛选：'all' | 'cloze' | 'reading' | 'new_type' | 'translation'
  const [selectedType, setSelectedType] = useState<EnglishQuestionType | 'all'>('all')

  // 科目筛选：'all' | 'english_1' | 'english_2'
  const [selectedExam, setSelectedExam] = useState<EnglishExamCategory>('both')

  // 搜索关键字
  const [searchQuery, setSearchQuery] = useState('')

  // 完形题库
  const filteredClozes = useMemo(() => {
    return ENGLISH_CLOZE_BANK.filter((c) => {
      if (selectedExam !== 'both' && c.examType !== selectedExam) return false
      if (searchQuery && !c.title.includes(searchQuery) && !c.topic.includes(searchQuery)) return false
      return true
    })
  }, [selectedExam, searchQuery])

  // 阅读题库
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

  // 新题型题库
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

  // 翻译题库
  const filteredTranslations = useMemo(() => {
    return ENGLISH_TRANSLATION_BANK.filter((t) => {
      if (selectedExam !== 'both' && t.examType !== selectedExam) return false
      if (searchQuery && !t.title.includes(searchQuery)) return false
      return true
    })
  }, [selectedExam, searchQuery])

  // 总体题目数量
  const totalItemsCount =
    filteredClozes.length +
    filteredReadings.length +
    filteredNewTypes.length +
    filteredTranslations.length

  // 如果处于具体的做题页面，渲染对应的做题器
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
      return (
        <EnglishTranslationViewer exam={activeItem.data} onBack={() => setActiveItem(null)} />
      )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* 顶栏控制台与题型快速切换 */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                🎯
              </span>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                考研英语 · 分题型专项刷题中心
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              按考研官方题型划分：针对完形填空、传统阅读、新题型（七选五/排序/小标题）进行定向专项突破
            </p>
          </div>

          {onGoToPapers && (
            <button
              type="button"
              onClick={onGoToPapers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>切换至整套真题模考</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 题型大药丸导航 */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          {[
            { key: 'all', label: '全部题型', count: totalItemsCount, emoji: '⚡' },
            { key: 'cloze', label: '完形填空 (Cloze)', count: filteredClozes.length, emoji: '🧩' },
            { key: 'reading', label: '传统阅读 (Reading)', count: filteredReadings.length, emoji: '📖' },
            { key: 'new_type', label: '新题型 (New Types)', count: filteredNewTypes.length, emoji: '🔀' },
            { key: 'translation', label: '英汉翻译 (Translation)', count: filteredTranslations.length, emoji: '✍️' },
          ].map((tab) => {
            const isActive = selectedType === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedType(tab.key as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
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
          <div className="flex items-center gap-2">
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
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              className="h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* 题型模块列表流 */}
      <div className="space-y-6">
        {/* 1. 完形填空卡片区 */}
        {(selectedType === 'all' || selectedType === 'cloze') && filteredClozes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
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
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60">
                        {item.year} 年 · {item.examType === 'english_1' ? '英语(一)' : '英语(二)'}
                      </span>
                      <span className="text-slate-400 font-mono">约 {item.wordCount} 词</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                      考查：{item.topic}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
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
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
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
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                        {item.year} 年 · {item.examType === 'english_1' ? '英语(一)' : '英语(二)'} · {item.textNumber}
                      </span>
                      <span className="text-slate-400">{item.questions.length} 题选择</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]">
                      {item.topic}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
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
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
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
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200/60">
                        {item.year} 年 · {item.examType === 'english_1' ? '英语(一)' : '英语(二)'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">
                        {item.variantLabel}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">
                      7 选 5 逻辑槽位
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
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
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
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
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200/60">
                        {item.year} 年 · {item.examType === 'english_1' ? '英语(一)' : '英语(二)'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {item.items.length} 题翻译
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.source}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      配官方采分要点分步对照
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
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
