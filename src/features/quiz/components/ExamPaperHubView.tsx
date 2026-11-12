import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Clock,
  Award,
  Search,
  Calendar,
  Layers,
  Flame,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import {
  ALL_EXAM_PAPERS,
  getAvailablePaperYears,
  getPaperStats,
  resolvePaperType,
  type ExamPaper,
  type PaperCategory,
  type PaperType,
  type PaperFilterSection,
} from '../../../data/examPapers'
import MarkdownRenderer from '../../../components/MarkdownRenderer'

interface ExamPaperHubViewProps {
  onStartPaper: (paper: ExamPaper, section: PaperFilterSection) => void
}

export default function ExamPaperHubView({ onStartPaper }: ExamPaperHubViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | PaperCategory>('all')
  const [selectedPaperType, setSelectedPaperType] = useState<'all' | PaperType>('all')
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all')
  const [searchKeyword, setSearchKeyword] = useState('')

  // 1. 按卷种过滤后的试卷池（用于联动统计真题 / 模拟数量）
  const categoryFilteredPapers = useMemo(() => {
    if (selectedCategory === 'all') return ALL_EXAM_PAPERS
    return ALL_EXAM_PAPERS.filter((paper) => paper.category === selectedCategory)
  }, [selectedCategory])

  // 2. 卷种统计与试卷性质（真题 / 模拟）联动统计（仅收纳 408 与 考研数学）
  const categoryStats = useMemo(() => {
    const totalCount = ALL_EXAM_PAPERS.length
    const math2Count = ALL_EXAM_PAPERS.filter((p) => p.category === '数二').length
    const math1Count = ALL_EXAM_PAPERS.filter((p) => p.category === '数一').length
    const cs408Count = ALL_EXAM_PAPERS.filter((p) => p.category === '408').length
    return { totalCount, math2Count, math1Count, cs408Count }
  }, [])

  const paperTypeStats = useMemo(() => {
    const allCount = categoryFilteredPapers.length
    const realCount = categoryFilteredPapers.filter((p) => resolvePaperType(p) === 'real').length
    const mockCount = categoryFilteredPapers.filter((p) => resolvePaperType(p) === 'mock').length
    return { allCount, realCount, mockCount }
  }, [categoryFilteredPapers])

  // 3. 按试卷性质过滤后的试卷池（用于动态计算可用年份）
  const typeFilteredPapers = useMemo(() => {
    if (selectedPaperType === 'all') return categoryFilteredPapers
    return categoryFilteredPapers.filter(
      (paper) => resolvePaperType(paper) === selectedPaperType
    )
  }, [categoryFilteredPapers, selectedPaperType])

  const availableYears = useMemo(
    () => getAvailablePaperYears(typeFilteredPapers),
    [typeFilteredPapers]
  )

  const handleSelectCategory = (category: 'all' | PaperCategory) => {
    setSelectedCategory(category)
    const nextCatPapers =
      category === 'all'
        ? ALL_EXAM_PAPERS
        : ALL_EXAM_PAPERS.filter((p) => p.category === category)
    const nextTypedPapers =
      selectedPaperType === 'all'
        ? nextCatPapers
        : nextCatPapers.filter((p) => resolvePaperType(p) === selectedPaperType)
    if (selectedYear !== 'all' && !nextTypedPapers.some((p) => p.year === Number(selectedYear))) {
      setSelectedYear('all')
    }
  }

  const handleSelectPaperType = (paperType: 'all' | PaperType) => {
    setSelectedPaperType(paperType)
    const nextTypedPapers =
      paperType === 'all'
        ? categoryFilteredPapers
        : categoryFilteredPapers.filter((p) => resolvePaperType(p) === paperType)
    if (selectedYear !== 'all' && !nextTypedPapers.some((p) => p.year === Number(selectedYear))) {
      setSelectedYear('all')
    }
  }

  // 4. 最终过滤结果（卷种 + 真题/模拟性质 + 年份 + 关键词）
  const filteredPapers = useMemo(() => {
    return typeFilteredPapers.filter((paper) => {
      if (selectedYear !== 'all' && paper.year !== Number(selectedYear)) return false
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase()
        const pType = resolvePaperType(paper)
        const typeLabel = pType === 'mock' ? '模拟 冲刺预测卷 模拟卷' : '真题 历年真题 统考原卷'
        const matchTitle = paper.title.toLowerCase().includes(kw)
        const matchSubtitle = (paper.subtitle || '').toLowerCase().includes(kw)
        const matchBadge = (paper.badgeLabel || '').toLowerCase().includes(kw)
        const matchDesc = paper.description.toLowerCase().includes(kw)
        const matchCategory = paper.category.toLowerCase().includes(kw)
        const matchType = typeLabel.includes(kw)
        if (
          !matchTitle &&
          !matchSubtitle &&
          !matchBadge &&
          !matchDesc &&
          !matchCategory &&
          !matchType
        ) {
          return false
        }
      }
      return true
    })
  }, [typeFilteredPapers, selectedYear, searchKeyword])

  // 当选中“全部性质”且筛选结果同时含真题和模拟卷时，按“真题 / 模拟”分区清晰展示
  const { realPapers, mockPapers, shouldGroupByType } = useMemo(() => {
    const real = filteredPapers.filter((p) => resolvePaperType(p) === 'real')
    const mock = filteredPapers.filter((p) => resolvePaperType(p) === 'mock')
    return {
      realPapers: real,
      mockPapers: mock,
      shouldGroupByType: selectedPaperType === 'all' && real.length > 0 && mock.length > 0,
    }
  }, [filteredPapers, selectedPaperType])

  const renderPaperCard = (paper: ExamPaper) => {
    const stats = getPaperStats(paper)
    const pType = resolvePaperType(paper)
    const isMock = pType === 'mock'

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
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-2xs ${
                  isMock
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'bg-neutral-900 text-white'
                }`}
              >
                {paper.badgeLabel || (isMock ? `${paper.year} 年模拟卷` : `${paper.year} 年真题`)}
              </span>

              <span
                className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold border ${
                  isMock
                    ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                }`}
              >
                {isMock ? '模拟卷' : '真题卷'}
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
            <span>📝 全卷模拟 ({paper.totalScore}分)</span>
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
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 学科专精说明与其它科目直达通道 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-pink-50/70 border border-neutral-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-neutral-700">
          <span className="w-5 h-5 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
            📑
          </span>
          <div>
            <span className="font-bold text-neutral-900">真题与模拟整卷库</span>
            <span className="text-neutral-500 ml-1.5 hidden md:inline">
              专精收录 408 计算机综合与考研数学历年官方真题及李林预测整卷；其他科目题目与套卷已收录于各学科专攻模块中。
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/english"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-indigo-700 hover:text-indigo-800 border border-indigo-200/80 hover:border-indigo-300 text-xs font-semibold shadow-2xs transition-all hover:shadow-xs"
          >
            <span>📖 考研英语真题套卷与模考</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link
            to="/politics"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-rose-700 hover:text-rose-800 border border-rose-200/80 hover:border-rose-300 text-xs font-semibold shadow-2xs transition-all hover:shadow-xs"
          >
            <span>🏛️ 考研政治 1000 题与刷题</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 卷种、性质（真题/模拟）与年份筛选控制台 */}
      <div className="bento-card rounded-2xl border border-neutral-200/85 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* 第 1 行：考研卷种切换 + 搜索框 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-accent-orange" />
              <span>考研卷种：</span>
            </span>

            <button
              type="button"
              onClick={() => handleSelectCategory('all')}
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
              onClick={() => handleSelectCategory('数二')}
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
              onClick={() => handleSelectCategory('数一')}
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
              onClick={() => handleSelectCategory('408')}
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
              placeholder="搜索真题/模拟卷、年份或考点..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 bg-neutral-50/50"
            />
          </div>
        </div>

        {/* 第 2 行：试卷性质分类划分（真题 vs 模拟） */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2.5 border-t border-neutral-100">
          <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
            <span>试卷类型：</span>
          </span>

          <button
            type="button"
            onClick={() => handleSelectPaperType('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              selectedPaperType === 'all'
                ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
            }`}
          >
            全部试卷 ({paperTypeStats.allCount})
          </button>

          <button
            type="button"
            onClick={() => handleSelectPaperType('real')}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPaperType === 'real'
                ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200/60'
            }`}
          >
            <span>📜 历年真题</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 font-mono">
              {paperTypeStats.realCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPaperType('mock')}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPaperType === 'mock'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-2xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100/80 border border-amber-200/60'
            }`}
          >
            <span>🔥 模拟冲刺卷</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 font-mono">
              {paperTypeStats.mockCount}
            </span>
          </button>
        </div>

        {/* 第 3 行：年份快速切换标签栏 */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2.5 border-t border-neutral-100">
          <span className="text-xs font-semibold text-neutral-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>试卷年份：</span>
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
          <h3 className="text-sm font-bold text-neutral-700">暂无符合筛选条件的试卷</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            {selectedPaperType === 'mock' && selectedCategory !== '数一' && selectedCategory !== 'all'
              ? `当前「${selectedCategory}」暂未收录模拟冲刺卷，您可以切换为「全部卷种」或「考研数学（一）」查看。`
              : '您可以尝试重置卷种、试卷类型或年份筛选条件，或在搜索框中键入其它考点关键词。'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all')
              setSelectedPaperType('all')
              setSelectedYear('all')
              setSearchKeyword('')
            }}
            className="px-4 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
          >
            重置所有筛选
          </button>
        </div>
      ) : shouldGroupByType ? (
        <div className="space-y-6">
          {/* 分区一：历年统考真题 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs">
                  📜
                </span>
                <h3 className="text-sm font-bold text-neutral-800">历年统考真题</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  {realPapers.length} 套
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectPaperType('real')}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                仅看真题 →
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {realPapers.map(renderPaperCard)}
            </div>
          </section>

          {/* 分区二：模拟冲刺卷 */}
          <section className="space-y-3 pt-2 border-t border-neutral-200/70">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 text-amber-700 text-xs">
                  🔥
                </span>
                <h3 className="text-sm font-bold text-neutral-800">模拟冲刺卷</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70">
                  {mockPapers.length} 套
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectPaperType('mock')}
                className="text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
              >
                仅看模拟卷 →
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {mockPapers.map(renderPaperCard)}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredPapers.map(renderPaperCard)}
        </div>
      )}
    </div>
  )
}
