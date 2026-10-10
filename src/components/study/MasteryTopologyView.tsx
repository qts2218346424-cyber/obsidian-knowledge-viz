import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Network, Flame, CheckCircle2, AlertTriangle,
  Search, ChevronRight, ChevronDown, Sparkles,
  RefreshCw, Loader2, ArrowRight, X, Target
} from 'lucide-react'
import { api } from '../../services/api'
import StepTutorModal from './StepTutorModal'
import QuickPracticeModal from '../QuickPracticeModal'

interface HierarchyNode {
  name: string
  score: number
  status: 'red' | 'yellow' | 'green'
  attempted: number
  correct: number
  children?: HierarchyNode[]
  syllabusId?: string
}

interface DomainSummary {
  domain: string
  totalPoints: number
  masteredCount: number
  inProgressCount: number
  weakCount: number
  averageScore: number
  tree: HierarchyNode[]
}

export default function MasteryTopologyView() {
  const [activeDomain, setActiveDomain] = useState<'cs_408' | 'math'>('cs_408')
  const [summaries, setSummaries] = useState<DomainSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all')

  // 折叠状态记录 (key: subject-level1 或 subject-level1-level2)
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set())

  // 当前选中的考点详情抽屉
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string | null>(null)
  const [nodeDetail, setNodeDetail] = useState<{
    node: any
    record: any
    errorQuestions: any[]
  } | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 启发式辅导弹窗
  const [tutorOpen, setTutorOpen] = useState(false)
  const [tutorQuestion, setTutorQuestion] = useState('')
  const [tutorSubject, setTutorSubject] = useState('')

  // 专项做题弹窗
  const [practiceOpen, setPracticeOpen] = useState(false)
  const [practiceData, setPracticeData] = useState<{ title: string; content: string }>({
    title: '', content: ''
  })

  // 加载掌握度热力数据
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getMasteryHeatmap()
      if (res.summaries) {
        setSummaries(res.summaries)
      }
    } catch (err) {
      console.error('加载考点热力数据失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 当前选中学科领域的汇总数据
  const currentSummary = useMemo(() => {
    return summaries.find(s => s.domain === activeDomain) || null
  }, [summaries, activeDomain])

  // 折叠切换
  const toggleCollapse = (nodeKey: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeKey)) next.delete(nodeKey)
      else next.add(nodeKey)
      return next
    })
  }

  // 加载考点详情
  const handleSelectNode = async (syllabusId: string) => {
    setSelectedSyllabusId(syllabusId)
    setLoadingDetail(true)
    try {
      const res = await api.getMasteryNodeDetail(syllabusId)
      if (res.detail) {
        setNodeDetail(res.detail)
      }
    } catch (err) {
      console.error('加载考点详情失败:', err)
    } finally {
      setLoadingDetail(false)
    }
  }

  // 手动标记考点掌握度
  const handleUpdateStatus = async (status: 'red' | 'yellow' | 'green') => {
    if (!selectedSyllabusId) return
    try {
      await api.updateMasteryStatus({
        syllabusId: selectedSyllabusId,
        status,
      })
      // 局部更新与全局刷新
      await handleSelectNode(selectedSyllabusId)
      await loadData()
    } catch (err) {
      console.error('更新掌握度失败:', err)
    }
  }

  // 启动启发式辅导
  const handleLaunchTutor = (questionText?: string) => {
    if (!nodeDetail) return
    const text = questionText || `【考点自测求助】：关于 ${nodeDetail.node.subject}「${nodeDetail.node.level3}」的典型考查题型与第一步思路引导。`
    setTutorQuestion(text)
    setTutorSubject(nodeDetail.node.subject)
    setTutorOpen(true)
  }

  // 启动专项练习
  const handleLaunchPractice = () => {
    if (!nodeDetail) return
    setPracticeData({
      title: `${nodeDetail.node.subject} · ${nodeDetail.node.level3} 专项快练`,
      content: `本题考查核心知识点：${nodeDetail.node.level3}\n\n关键词：${(nodeDetail.node.keywords || []).join(', ')}\n请结合考纲要求进行演算作答。`
    })
    setPracticeOpen(true)
  }

  // 状态着色辅助函数
  const getStatusBadge = (status: 'red' | 'yellow' | 'green', score: number) => {
    if (status === 'green') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          熟练 · {score}分
        </span>
      )
    }
    if (status === 'yellow') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" />
          巩固 · {score}分
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse">
        <Flame className="w-3 h-3" />
        盲区 · {score}分
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* 顶部全景总览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-surface border border-cream-200 rounded-2xl p-4 shadow-xs">
          <div className="text-xs text-warm-400 font-medium">考点总库</div>
          <div className="text-2xl font-bold text-warm-900 mt-1">
            {currentSummary?.totalPoints || 0} <span className="text-xs font-normal text-warm-400">个考纲考点</span>
          </div>
          <div className="text-[11px] text-warm-500 mt-1">三级精细化知识拓扑</div>
        </div>

        <div className="bg-surface border border-emerald-500/20 rounded-2xl p-4 shadow-xs bg-emerald-500/5">
          <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 已攻克精通
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {currentSummary?.masteredCount || 0} <span className="text-xs font-normal text-emerald-600">个 (🟢)</span>
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1">掌握度 ≥ 80%</div>
        </div>

        <div className="bg-surface border border-amber-500/20 rounded-2xl p-4 shadow-xs bg-amber-500/5">
          <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> 进阶巩固中
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">
            {currentSummary?.inProgressCount || 0} <span className="text-xs font-normal text-amber-600">个 (🟡)</span>
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1">掌握度 50% ~ 80%</div>
        </div>

        <div className="bg-surface border border-rose-500/20 rounded-2xl p-4 shadow-xs bg-rose-500/5">
          <div className="text-xs text-rose-600 font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> 薄弱盲区预警
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">
            {currentSummary?.weakCount || 0} <span className="text-xs font-normal text-rose-600">个 (🔴)</span>
          </div>
          <div className="text-[11px] text-rose-600/80 mt-1">掌握度 &lt; 50% 或高频错题</div>
        </div>

        <div className="bg-surface border border-cream-200 rounded-2xl p-4 shadow-xs col-span-2 md:col-span-1">
          <div className="text-xs text-warm-400 font-medium">全科平均熟练度</div>
          <div className="text-2xl font-bold text-accent-orange mt-1">
            {currentSummary?.averageScore || 0}%
          </div>
          <div className="w-full bg-cream-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-accent-orange h-full rounded-full transition-all duration-500"
              style={{ width: `${currentSummary?.averageScore || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 控制栏：领域切换 + 过滤与搜索 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface border border-cream-200 rounded-2xl shadow-xs">
        {/* 学科切换 */}
        <div className="flex items-center gap-1.5 p-1 bg-cream-200/50 rounded-xl">
          <button
            onClick={() => setActiveDomain('cs_408')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeDomain === 'cs_408'
                ? 'bg-surface text-accent-orange shadow-xs'
                : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            💻 408 计算机学科专业综合
          </button>
          <button
            onClick={() => setActiveDomain('math')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeDomain === 'math'
                ? 'bg-surface text-purple-600 shadow-xs'
                : 'text-warm-600 hover:text-warm-900'
            }`}
          >
            📐 全国硕士考研数学 (数一/数二/数三)
          </button>
        </div>

        {/* 状态过滤与搜索 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-cream-200/60 rounded-lg text-[11px]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'all' ? 'bg-surface text-warm-900 shadow-xs' : 'text-warm-500'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setStatusFilter('red')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'red' ? 'bg-surface text-rose-600 shadow-xs' : 'text-warm-500'
              }`}
            >
              🔴 盲区
            </button>
            <button
              onClick={() => setStatusFilter('yellow')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'yellow' ? 'bg-surface text-amber-600 shadow-xs' : 'text-warm-500'
              }`}
            >
              🟡 巩固
            </button>
            <button
              onClick={() => setStatusFilter('green')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                statusFilter === 'green' ? 'bg-surface text-emerald-600 shadow-xs' : 'text-warm-500'
              }`}
            >
              🟢 熟练
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索三级考点/关键词..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-xl bg-cream-100/50 border border-cream-200 text-warm-800 placeholder-warm-400 focus:outline-hidden focus:border-accent-orange/60 w-48"
            />
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-warm-600 transition-colors"
            title="刷新热力状态"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 主视图区域：左侧树状拓扑 + 右侧考点详情抽屉 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧拓扑树 (占 2 列) */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-24 bg-surface border border-cream-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-warm-500">
              <Loader2 className="w-6 h-6 animate-spin text-accent-orange" />
              <div className="text-xs">正在实时聚合考点掌握度热力分布...</div>
            </div>
          ) : !currentSummary || currentSummary.tree.length === 0 ? (
            <div className="py-24 bg-surface border border-cream-200 rounded-2xl text-center text-warm-400 text-xs">
              暂无考纲拓扑数据
            </div>
          ) : (
            currentSummary.tree.map((subjectNode) => (
              <div
                key={subjectNode.name}
                className="bg-surface border border-cream-200 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* 科目标题栏 */}
                <div className="px-5 py-3.5 bg-cream-50/70 border-b border-cream-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-warm-900">{subjectNode.name}</span>
                    <span className="text-xs text-warm-400">
                      (共 {subjectNode.children?.reduce((acc, c) => acc + (c.children?.reduce((a2, c2) => a2 + (c2.children?.length || 0), 0) || 0), 0)} 个考点)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-warm-600">科目平均：</span>
                    {getStatusBadge(subjectNode.status, subjectNode.score)}
                  </div>
                </div>

                {/* 一级章节与二级模块树 */}
                <div className="p-4 space-y-3">
                  {subjectNode.children?.map((l1) => {
                    const l1Key = `${subjectNode.name}-${l1.name}`
                    const isL1Collapsed = collapsedNodes.has(l1Key)

                    return (
                      <div key={l1.name} className="border border-cream-200/80 rounded-xl overflow-hidden bg-cream-50/30">
                        {/* 一级大章行 */}
                        <div
                          onClick={() => toggleCollapse(l1Key)}
                          className="px-4 py-2.5 flex items-center justify-between hover:bg-cream-100/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isL1Collapsed ? (
                              <ChevronRight className="w-4 h-4 text-warm-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-warm-400" />
                            )}
                            <span className="text-xs font-bold text-warm-800">{l1.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(l1.status, l1.score)}
                          </div>
                        </div>

                        {/* 二级与三级考点 */}
                        {!isL1Collapsed && (
                          <div className="p-3 pt-0 space-y-2 border-t border-cream-200/60 bg-surface">
                            {l1.children?.map((l2) => (
                              <div key={l2.name} className="pl-4 py-2 space-y-1.5 border-l-2 border-cream-200">
                                <div className="text-[11px] font-semibold text-warm-500 flex items-center justify-between">
                                  <span>{l2.name}</span>
                                  <span className="text-[10px] text-warm-400 font-normal">平均: {l2.score}分</span>
                                </div>

                                {/* 三级叶子考点网格 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                                  {l2.children?.filter((leaf) => {
                                    // 搜索过滤
                                    if (searchQuery && !leaf.name.includes(searchQuery)) return false
                                    // 状态过滤
                                    if (statusFilter !== 'all' && leaf.status !== statusFilter) return false
                                    return true
                                  }).map((leaf) => {
                                    const isSelected = selectedSyllabusId === leaf.syllabusId

                                    let cardBg = 'bg-cream-50 hover:bg-cream-100/80 border-cream-200'
                                    if (leaf.status === 'green') cardBg = 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20'
                                    else if (leaf.status === 'yellow') cardBg = 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20'
                                    else if (leaf.status === 'red') cardBg = 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20'

                                    return (
                                      <div
                                        key={leaf.name}
                                        onClick={() => leaf.syllabusId && handleSelectNode(leaf.syllabusId)}
                                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-2 ${cardBg} ${
                                          isSelected ? 'ring-2 ring-accent-orange shadow-xs' : ''
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-1.5">
                                          <span className="font-medium text-warm-800 line-clamp-2 leading-relaxed">
                                            {leaf.name}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10px]">
                                          <span className="text-warm-400">
                                            作答 {leaf.attempted} 次 (正确率 {leaf.attempted > 0 ? Math.round((leaf.correct / leaf.attempted) * 100) : 0}%)
                                          </span>
                                          {getStatusBadge(leaf.status, leaf.score)}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 右侧：考点研学沉浸抽屉 (占 1 列) */}
        <div className="space-y-4">
          <div className="bg-surface border border-cream-200 rounded-2xl p-5 shadow-xs sticky top-4">
            {loadingDetail ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-warm-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin text-accent-orange" />
                正在调取考点全量元数据与历史错题...
              </div>
            ) : !nodeDetail ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto text-warm-400">
                  <Network className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-warm-700">点击任意考点节点</div>
                <div className="text-[11px] text-warm-400 max-w-[200px] mx-auto">
                  展开考点大纲要求、一键 AI 分步辅导、专项刷题自测及关联错题复盘
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in">
                {/* 考点头部 */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-accent-orange font-semibold">
                      {nodeDetail.node.subject} · {nodeDetail.node.level1}
                    </span>
                    <button
                      onClick={() => setSelectedSyllabusId(null)}
                      className="text-warm-400 hover:text-warm-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-warm-900 mt-1 leading-snug">
                    {nodeDetail.node.level3}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(nodeDetail.node.keywords || []).map((kw: string) => (
                      <span key={kw} className="px-2 py-0.5 rounded-md text-[10px] bg-cream-200/80 text-warm-600 font-medium">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 掌握度状态与统计 */}
                <div className="p-3 rounded-xl bg-cream-50 border border-cream-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-warm-500">当前熟练度评级：</span>
                    {getStatusBadge(nodeDetail.record.status, nodeDetail.record.masteryScore)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-cream-200/60 text-xs">
                    <div>
                      <div className="text-[10px] text-warm-400">总作答</div>
                      <div className="font-bold text-warm-800">{nodeDetail.record.totalAttempted} 次</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-warm-400">做对次数</div>
                      <div className="font-bold text-emerald-600">{nodeDetail.record.correctCount} 次</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-warm-400">掌握得分</div>
                      <div className="font-bold text-accent-orange">{nodeDetail.record.masteryScore} 分</div>
                    </div>
                  </div>
                </div>

                {/* 手动调整熟练度胶囊 */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-warm-500">标记掌握状态：</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleUpdateStatus('green')}
                      className="py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-500/20 transition-colors"
                    >
                      熟练 🟢
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('yellow')}
                      className="py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/20 transition-colors"
                    >
                      巩固 🟡
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('red')}
                      className="py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 border border-rose-500/20 transition-colors"
                    >
                      盲区 🔴
                    </button>
                  </div>
                </div>

                {/* 核心行动按钮 */}
                <div className="space-y-2 pt-2 border-t border-cream-200">
                  <button
                    onClick={() => handleLaunchTutor()}
                    className="w-full py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI 启发式多轮分步辅导 (CoT)
                  </button>

                  <button
                    onClick={handleLaunchPractice}
                    className="w-full py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-warm-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Target className="w-3.5 h-3.5" />
                    针对此考点快速做题自测
                  </button>
                </div>

                {/* 关联错题本复盘 */}
                <div className="space-y-2 pt-2 border-t border-cream-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-warm-800">关联收录错题</span>
                    <span className="text-[10px] text-warm-400">
                      {nodeDetail.errorQuestions.length} 道
                    </span>
                  </div>

                  {nodeDetail.errorQuestions.length === 0 ? (
                    <div className="p-3 bg-cream-50 rounded-xl text-center text-[11px] text-warm-400">
                      该考点暂无收录错题，继续保持！
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {nodeDetail.errorQuestions.map((eq: any, idx: number) => (
                        <div
                          key={eq.id || idx}
                          onClick={() => handleLaunchTutor(eq.question)}
                          className="p-2.5 rounded-xl border border-rose-500/15 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer text-xs space-y-1 transition-colors"
                          title="点击调用启发式导师辅导此题"
                        >
                          <div className="font-medium text-warm-900 line-clamp-2">
                            {eq.question}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-rose-600">
                            <span>错误类型: {eq.errorType || '概念模糊'}</span>
                            <span className="flex items-center gap-0.5">
                              辅导此题 <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 启发式分步辅导弹窗 */}
      <StepTutorModal
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
        initialQuestion={tutorQuestion}
        initialSubject={tutorSubject}
        syllabusId={selectedSyllabusId || undefined}
      />

      {/* 专项快练弹窗 */}
      <QuickPracticeModal
        isOpen={practiceOpen}
        onClose={() => setPracticeOpen(false)}
        noteTitle={practiceData.title}
        noteContent={practiceData.content}
      />
    </div>
  )
}
