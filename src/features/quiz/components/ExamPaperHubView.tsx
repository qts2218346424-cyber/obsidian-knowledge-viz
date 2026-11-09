import React, { useState, useMemo } from 'react'
import {
  FileText,
  Clock,
  Award,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Flame,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import {
  ALL_EXAM_PAPERS,
  getAvailablePaperYears,
  getPaperStats,
  type ExamPaper,
  type PaperCategory,
  type PaperFilterSection,
} from '../../../data/examPapers'
import MarkdownRenderer from '../../../components/MarkdownRenderer'

interface ExamPaperHubViewProps {
  onStartPaper: (paper: ExamPaper, section: PaperFilterSection) => void
}

export default function ExamPaperHubView({ onStartPaper }: ExamPaperHubViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | PaperCategory>('all')
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all')
  const [searchKeyword, setSearchKeyword] = useState('')

  const availableYears = useMemo(() => getAvailablePaperYears(), [])

  const filteredPapers = useMemo(() => {
    return ALL_EXAM_PAPERS.filter((paper) => {
      if (selectedCategory !== 'all' && paper.category !== selectedCategory) return false
      if (selectedYear !== 'all' && paper.year !== Number(selectedYear)) return false
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase()
        const matchTitle = paper.title.toLowerCase().includes(kw)
        const matchDesc = paper.description.toLowerCase().includes(kw)
        const matchCategory = paper.category.toLowerCase().includes(kw)
        if (!matchTitle && !matchDesc && !matchCategory) return false
      }
      return true
    })
  }, [selectedCategory, selectedYear, searchKeyword])

  const categoryStats = useMemo(() => {
    const totalCount = ALL_EXAM_PAPERS.length
    const math2Count = ALL_EXAM_PAPERS.filter((p) => p.category === '数二').length
    const math1Count = ALL_EXAM_PAPERS.filter((p) => p.category === '数一').length
    const cs408Count = ALL_EXAM_PAPERS.filter((p) => p.category === '408').length
    return { totalCount, math2Count, math1Count, cs408Count }
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 卷种与年份筛选控制台 */}
      <div className="bento-card rounded-2xl border border-neutral-200/85 bg-white p-4 sm:p-5 shadow-xs space-y-4">
        {/* 顶部卷种切换胶囊 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-accent-orange" />
              <span>考研卷种：</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
              }`}
            >
              全部卷种 ({categoryStats.totalCount})
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('数二')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === '数二'
                  ? 'bg-pink-600 text-white font-semibold shadow-xs'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100/80 border border-pink-200/60'
              }`}
            >
              <span>📐 考研数学（二）</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {categoryStats.math2Count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('数一')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === '数一'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 border border-indigo-200/60'
              }`}
            >
              <span>📐 考研数学（一）</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {categoryStats.math1Count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('408')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === '408'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100/80 border border-blue-200/60'
              }`}
            >
              <span>🖥️ 408 计算机综合</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {categoryStats.cs408Count}
              </span>
            </button>
          </div>

          {/* 关键字搜索框 */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索真题试卷、年份或考点..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
            />
          </div>
        </div>

        {/* 年份快速切换标签栏 */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-neutral-100">
          <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>真题年份：</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer ${
              selectedYear === 'all'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            历年全部
          </button>

          {availableYears.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`rounded-lg px-2.5 py-1 text-xs transition-all cursor-pointer font-mono ${
                selectedYear === year
                  ? 'bg-accent-orange text-white font-bold shadow-2xs'
                  : 'bg-neutral-100/80 text-neutral-700 hover:bg-neutral-200/70'
              }`}
            >
              {year} 年
            </button>
          ))}
        </div>
      </div>

      {/* 试卷列表展示 */}
      {filteredPapers.length === 0 ? (
        <div className="bento-card rounded-2xl border border-dashed border-neutral-300 p-12 text-center bg-white space-y-3">
          <FileText className="w-10 h-10 mx-auto text-neutral-300" />
          <h3 className="text-sm font-bold text-neutral-700">暂无符合筛选条件的真题试卷</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            您可以尝试重置卷种或年份筛选条件，或在搜索框中键入其它考点关键词。
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all')
              setSelectedYear('all')
              setSearchKeyword('')
            }}
            className="px-4 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
          >
            重置所有筛选
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredPapers.map((paper) => {
            const stats = getPaperStats(paper)
            const isMath = paper.domain === 'math'

            return (
              <div
                key={paper.id}
                className="bento-card rounded-2xl border border-neutral-200/85 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-200 group relative overflow-hidden"
              >
                {/* 装饰条 */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    paper.category === '408'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      : paper.category === '数二'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  }`}
                />

                <div className="space-y-3.5">
                  {/* 试卷元信息徽标 */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-neutral-900 text-white shadow-2xs">
                        {paper.year} 年真题
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-lg font-semibold ${
                          paper.category === '408'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                            : paper.category === '数二'
                            ? 'bg-pink-50 text-pink-700 border border-pink-200/80'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                        }`}
                      >
                        {paper.category === '408'
                          ? '408 计算机综合'
                          : `考研数学（${paper.category === '数二' ? '二' : '一'}）`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>满分 {paper.totalScore} 分</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{paper.durationMinutes} 分钟</span>
                      </span>
                    </div>
                  </div>

                  {/* 试卷全名与副标题 */}
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight leading-snug group-hover:text-accent-orange transition-colors">
                      {paper.title}
                    </h2>
                    {paper.subtitle && (
                      <p className="mt-1 text-xs text-neutral-400 font-medium">{paper.subtitle}</p>
                    )}
                  </div>

                  {/* 试卷题型架构与分值分布胶囊 */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {stats.choiceCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>单选题 {stats.choiceCount} 题 ({stats.choiceScore}分)</span>
                      </span>
                    )}

                    {stats.blankCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>填空题 {stats.blankCount} 题 ({stats.blankScore}分)</span>
                      </span>
                    )}

                    {stats.analysisCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>综合解答大题 {stats.analysisCount} 题 ({stats.analysisScore}分)</span>
                      </span>
                    )}
                  </div>

                  {/* 试卷考点范围描述 */}
                  <div className="p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/60 text-xs text-neutral-600 leading-relaxed">
                    <MarkdownRenderer content={paper.description} inline />
                  </div>
                </div>

                {/* 试卷精准三大练习入口（核心功能交付点） */}
                <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  {/* 全卷模考入口 */}
                  <button
                    type="button"
                    onClick={() => onStartPaper(paper, 'all')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>📝 全卷模拟 (150分)</span>
                  </button>

                  {/* 专练选择题入口 */}
                  {stats.choiceCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onStartPaper(paper, 'choice')}
                      className="inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/90 text-blue-700 border border-blue-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>🔘 专练选择题 ({stats.choiceCount}题)</span>
                    </button>
                  )}

                  {/* 专练解答大题入口 */}
                  {stats.analysisCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onStartPaper(paper, 'analysis')}
                      className="inline-flex items-center justify-center gap-1 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>✍️ 专练解答大题 ({stats.analysisCount}题)</span>
                    </button>
                  )}

                  {/* 专练填空题入口（如果有） */}
                  {stats.blankCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onStartPaper(paper, 'blank')}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/90 text-amber-800 border border-amber-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>✏️ 填空题 ({stats.blankCount}题)</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
