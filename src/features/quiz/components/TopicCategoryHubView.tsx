import { useMemo, useState } from 'react'
import {
  Search,
  Sparkles,
  Flame,
  ArrowRight,
  Check,
  Shuffle,
  ListOrdered,
  Upload,
  Filter,
  Layers,
} from 'lucide-react'
import type { ResourceDomain } from '../../../services/api'
import type { MathCategory } from '../../../types/subject'
import type { PopulatedTopicCategory } from '../utils/questionTopics'

interface TopicCategoryHubViewProps {
  categories: PopulatedTopicCategory[]
  mathCategory: MathCategory | 'all'
  onMathCategoryChange: (cat: MathCategory | 'all') => void
  mode: 'practice' | 'exam'
  onModeChange: (mode: 'practice' | 'exam') => void
  onStartTopics: (
    topicIds: string[],
    options: { shuffle: boolean; onlyCustom?: boolean }
  ) => void
  onOpenImport: (tab?: 'books' | 'import_quiz' | 'analytics') => void
}

type GroupFilter =
  | 'all'
  | '高等数学'
  | '线性代数'
  | '概率论与数理统计'
  | 'cs_408'
  | 'custom'
  | 'other'

export default function TopicCategoryHubView({
  categories,
  mathCategory,
  onMathCategoryChange,
  mode,
  onModeChange,
  onStartTopics,
  onOpenImport,
}: TopicCategoryHubViewProps) {
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all')
  const [csSubjectFilter, setCsSubjectFilter] = useState<'all' | '数据结构' | '计算机组成原理' | '操作系统' | '计算机网络'>('all')
  const [searchKw, setSearchKw] = useState('')
  const [shuffleMode, setShuffleMode] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const totalQuestionsCount = useMemo(
    () => categories.reduce((acc, c) => acc + c.totalCount, 0),
    [categories]
  )
  const totalCustomCount = useMemo(
    () => categories.reduce((acc, c) => acc + c.customCount, 0),
    [categories]
  )

  const hasOtherDomains = useMemo(
    () => categories.some((c) => c.domain === 'general'),
    [categories]
  )

  const featuredTopics = useMemo(() => {
    if (groupFilter === 'cs_408') {
      return categories.filter((c) => c.domain === 'cs_408' && c.isHot).slice(0, 8)
    }
    if (groupFilter === '高等数学' || groupFilter === '线性代数' || groupFilter === '概率论与数理统计') {
      return categories.filter((c) => c.subjectGroup === groupFilter && c.isHot).slice(0, 6)
    }
    return categories.filter((c) => c.isHot).slice(0, 10)
  }, [categories, groupFilter])

  const filteredCategories = useMemo(() => {
    const kw = searchKw.trim().toLowerCase()
    return categories.filter((cat) => {
      if (groupFilter === '高等数学' && cat.subjectGroup !== '高等数学') return false
      if (groupFilter === '线性代数' && cat.subjectGroup !== '线性代数') return false
      if (groupFilter === '概率论与数理统计' && cat.subjectGroup !== '概率论与数理统计')
        return false
      if (groupFilter === 'cs_408') {
        if (cat.domain !== 'cs_408') return false
        if (csSubjectFilter !== 'all' && cat.subjectGroup !== csSubjectFilter) return false
      }
      if (groupFilter === 'custom' && !cat.hasImported) return false
      if (groupFilter === 'other' && cat.domain !== 'general') {
        return false
      }

      if (kw) {
        const hay = [cat.title, cat.shortDesc, cat.subjectGroup, ...cat.keywords]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(kw)) return false
      }
      return true
    })
  }, [categories, groupFilter, csSubjectFilter, searchKw])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedQuestionCount = useMemo(() => {
    return categories
      .filter((c) => selectedIds.has(c.id))
      .reduce((sum, c) => sum + c.totalCount, 0)
  }, [categories, selectedIds])

  const getDomainBadgeStyle = (domain: ResourceDomain, subjectGroup: string) => {
    if (subjectGroup === '高等数学') return 'bg-pink-50 text-pink-700 border-pink-200/80'
    if (subjectGroup === '线性代数') return 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
    if (subjectGroup === '概率论与数理统计') return 'bg-teal-50 text-teal-700 border-teal-200/80'
    if (domain === 'cs_408') return 'bg-blue-50 text-blue-700 border-blue-200/80'
    if (domain === 'english') return 'bg-sky-50 text-sky-700 border-sky-200/80'
    if (domain === 'politics') return 'bg-rose-50 text-rose-700 border-rose-200/80'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <div className="space-y-4 sm:space-y-5 min-w-0 max-w-full">
      {/* 顶部专题概览与热门速刷胶囊 */}
      <div className="bento-card rounded-2xl border border-neutral-200/85 bg-white p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] font-bold mb-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>智能题型归纳引擎 · 全题库 + 真题 + 个人导入统一聚合</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
              高频题型专题专项突破
            </h2>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              已按考研大纲考法自动归纳 <strong className="text-neutral-800">{categories.length} 个题型专项</strong>（共 <strong className="text-neutral-800">{totalQuestionsCount} 题</strong>
              {totalCustomCount > 0 ? `，含你导入的 ${totalCustomCount} 道题` : ''}），支持单专题一键开刷与多专题组合专练。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenImport('import_quiz')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>导入题目自动归类</span>
            </button>
          </div>
        </div>

        {/* 高频专题直达胶囊 */}
        {featuredTopics.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>考研高频专题直达（点击即刻开刷）：</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {featuredTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onStartTopics([topic.id], { shuffle: shuffleMode })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/60 hover:from-indigo-50 hover:to-indigo-100/70 border border-slate-200 hover:border-indigo-300 text-xs font-semibold text-slate-800 transition-all cursor-pointer active:scale-95"
                >
                  <span>{topic.emoji}</span>
                  <span>{topic.title.replace(/专项.*$/, '').trim()}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white text-indigo-600 border border-indigo-200/70">
                    {topic.totalCount}题
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 筛选与做题模式控制栏 */}
      <div className="bento-card rounded-2xl border border-neutral-200/85 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* 学科/专题分组切换 */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: '全部专题' },
                { id: '高等数学', label: '📐 高等数学' },
                { id: '线性代数', label: '🔢 线性代数' },
                { id: '概率论与数理统计', label: '🎲 概率统计' },
                { id: 'cs_408', label: '🖥️ 408计算机' },
                ...(totalCustomCount > 0
                  ? [{ id: 'custom' as const, label: `📥 含导入 (${totalCustomCount})` }]
                  : []),
                ...(hasOtherDomains ? [{ id: 'other' as const, label: '📚 其他导入' }] : []),
              ] as Array<{ id: GroupFilter; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGroupFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  groupFilter === tab.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 408 专业课科目筛选 */}
          {groupFilter === 'cs_408' && (
            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-neutral-200/80 bg-neutral-100/90 p-1 text-xs">
              <span className="text-neutral-400 pl-1.5 pr-1 text-[11px]">408科目:</span>
              {(
                [
                  { id: 'all', label: '全部科目' },
                  { id: '数据结构', label: '🧮 数据结构' },
                  { id: '计算机组成原理', label: '🖥️ 计组' },
                  { id: '操作系统', label: '⚙️ 操作系统' },
                  { id: '计算机网络', label: '🌐 计网' },
                ] as const
              ).map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setCsSubjectFilter(sub.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                    csSubjectFilter === sub.id
                      ? 'bg-white text-neutral-900 shadow-xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {/* 数学卷种筛选 */}
          {(groupFilter === 'all' ||
            groupFilter === '高等数学' ||
            groupFilter === '线性代数' ||
            groupFilter === '概率论与数理统计' ||
            groupFilter === 'custom') && (
            <div className="flex items-center gap-1 rounded-xl border border-neutral-200/80 bg-neutral-100/90 p-1 text-xs">
              <span className="text-neutral-400 pl-1.5 pr-1 text-[11px]">卷种:</span>
              {(['all', '数一', '数二', '数三'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onMathCategoryChange(cat)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                    mathCategory === cat
                      ? 'bg-white text-neutral-900 shadow-xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {cat === 'all' ? '全部' : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 搜索框 + 练法切换 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              placeholder="搜索题型（如：线面积分、极限、格林、级数、特征值、PV、Cache）..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-indigo-400 outline-none text-xs text-slate-800 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* 模式切换 */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => onModeChange('practice')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  mode === 'practice' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                📖 练习模式
              </button>
              <button
                type="button"
                onClick={() => onModeChange('exam')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  mode === 'exam' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                📋 考试模式
              </button>
            </div>

            {/* 顺序/乱序切换 */}
            <button
              type="button"
              onClick={() => setShuffleMode((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 cursor-pointer"
              title="切换专题抽题顺序"
            >
              {shuffleMode ? (
                <>
                  <Shuffle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>随机乱序</span>
                </>
              ) : (
                <>
                  <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                  <span>顺序刷题</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 专题卡片矩阵 */}
      {filteredCategories.length === 0 ? (
        <div className="bento-card rounded-2xl border border-neutral-200/85 bg-white p-10 text-center space-y-2">
          <Filter className="w-6 h-6 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-700">当前筛选条件下暂无对应专题</div>
          <p className="text-xs text-slate-400">
            请尝试切换学科、卷种（如选回“全部卷”）或清空关键词，也可以直接导入个人错题自动生成专题。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 min-w-0">
          {filteredCategories.map((cat) => {
            const isChecked = selectedIds.has(cat.id)
            return (
              <div
                key={cat.id}
                className={`rounded-2xl border bg-white p-4 sm:p-5 flex flex-col justify-between gap-3.5 transition-all shadow-2xs min-w-0 ${
                  isChecked
                    ? 'border-indigo-500 ring-1 ring-indigo-500/40 bg-indigo-50/15'
                    : 'border-slate-200/85 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="space-y-2.5 min-w-0">
                  {/* 顶部元数据 + 多选框 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-base shrink-0">
                        {cat.emoji}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDomainBadgeStyle(
                          cat.domain,
                          cat.subjectGroup
                        )}`}
                      >
                        {cat.subjectGroup}
                      </span>
                      {cat.isHot && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          🔥 高频
                        </span>
                      )}
                      {cat.hasImported && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          📥 导入 +{cat.customCount}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSelect(cat.id)}
                      aria-label={`选择专题 ${cat.title}`}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-300 text-transparent hover:border-indigo-400'
                      }`}
                      title="勾选用于多专题组合联刷"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 标题与考法说明 */}
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {cat.shortDesc}
                    </p>
                  </div>

                  {/* 核心考法关键词 */}
                  <div className="flex flex-wrap gap-1">
                    {cat.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-600 font-medium"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 底部题量统计 + 开刷按钮 */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-[11px] text-slate-500 font-medium space-x-1.5">
                    <span className="font-bold text-slate-800">{cat.totalCount} 题</span>
                    {cat.realCount > 0 && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                        真题 {cat.realCount}
                      </span>
                    )}
                    {cat.mockCount > 0 && (
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                        模拟 {cat.mockCount}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {cat.customCount > 0 && cat.customCount < cat.totalCount && (
                      <button
                        type="button"
                        onClick={() =>
                          onStartTopics([cat.id], { shuffle: shuffleMode, onlyCustom: true })
                        }
                        className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors cursor-pointer"
                        title="只刷本专题里我个人导入的题目"
                      >
                        只刷导入({cat.customCount})
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onStartTopics([cat.id], { shuffle: shuffleMode })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer active:scale-95"
                    >
                      <span>开刷专项</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 多专题联合组卷吸底操作条 */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-[calc(4.1rem+env(safe-area-inset-bottom,0px))] md:bottom-4 z-30 rounded-2xl bg-slate-900/95 text-white px-4 py-3 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 border border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs font-bold truncate">
              已勾选 {selectedIds.size} 个题型专项（共 {selectedQuestionCount} 题）
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer"
            >
              清空已选
            </button>
            <button
              type="button"
              onClick={() =>
                onStartTopics(Array.from(selectedIds), { shuffle: shuffleMode })
              }
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>联合开刷 ({selectedQuestionCount} 题)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
