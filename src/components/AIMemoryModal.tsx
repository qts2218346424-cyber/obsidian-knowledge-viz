import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  X, Brain, Sparkles, CheckCircle2, AlertTriangle, BookOpen,
  Target, FileText, Plus, Trash2, Search,
  TrendingUp, Award, Layers, Zap, Check, Copy
} from 'lucide-react'
import { api, type MemoryItem, type MemoryStats, type MemoryMastery } from '../services/api'
import MarkdownRenderer from './MarkdownRenderer'

interface AIMemoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAskAgent?: (prompt: string) => void
  onTriggerPractice?: (title: string, content: string) => void
  onSelectConcept?: (title: string) => void
}

type TabType = 'matrix' | 'chunks' | 'traps' | 'profile'

export default function AIMemoryModal({
  isOpen,
  onClose,
  onAskAgent,
  onTriggerPractice,
  onSelectConcept,
}: AIMemoryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('matrix')
  const [memories, setMemories] = useState<MemoryItem[]>([])
  const [stats, setStats] = useState<MemoryStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [masteryFilter, setMasteryFilter] = useState<string>('all')

  // Feedback states
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Add Memory Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newSubject, setNewSubject] = useState<any>('操作系统')
  const [newType, setNewType] = useState<'concept' | 'chunk' | 'mistake'>('concept')
  const [newMastery, setNewMastery] = useState<MemoryMastery>('learning')
  const [newTags, setNewTags] = useState('')

  const loadMemories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getAllMemories()
      if (data.success) {
        setMemories(data.memories)
        setStats(data.stats)
      }
    } catch (err: any) {
      console.error('Failed to load memories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadMemories()
    }
  }, [isOpen, loadMemories])

  // Update mastery
  const handleUpdateMastery = async (id: string, newMastery: MemoryMastery) => {
    try {
      const res = await api.updateMemory(id, { mastery: newMastery })
      if (res.success) {
        setMemories(prev => prev.map(m => m.id === id ? { ...m, mastery: newMastery } : m))
        loadMemories()
      }
    } catch (err: any) {
      alert('更新掌握度失败: ' + err.message)
    }
  }

  // Delete memory
  const handleDeleteMemory = async (id: string, title: string) => {
    if (!confirm(`确定要将考点记忆《${title}》从仓库中归档删除吗？`)) return
    try {
      const res = await api.deleteMemory(id)
      if (res.success) {
        setMemories(prev => prev.filter(m => m.id !== id))
        loadMemories()
      }
    } catch (err: any) {
      alert('删除失败: ' + err.message)
    }
  }

  // Export to Obsidian Vault
  const handleExportToObsidian = async (m: MemoryItem) => {
    try {
      const res = await api.exportMemoryToObsidian({
        memoryId: m.id,
        title: m.title,
        content: m.content,
        tags: m.tags,
        subject: m.subject,
      })
      if (res.success) {
        setActionFeedback(res.message || '已成功保存为知识库真实笔记！')
        setTimeout(() => setActionFeedback(null), 3000)
        loadMemories()
      }
    } catch (err: any) {
      alert('导出失败: ' + err.message)
    }
  }

  // Copy Content
  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Deep Dive in Chat
  const handleDeepDive = (m: MemoryItem) => {
    const prompt = `【深入研析记忆考点《${m.title}》】\n考点科目：${m.subject}\n考点核心机理：\n${m.content}\n请为我系统剖析其考研命题考法、易错点，并推导核心步骤。`
    onAskAgent?.(prompt)
    onSelectConcept?.(m.title)
    onClose()
  }

  // Trigger Quiz
  const handlePractice = (m: MemoryItem) => {
    onTriggerPractice?.(m.title, m.content)
    onClose()
  }

  // Add new Memory Item submit
  const handleCreateMemory = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('请填写考点标题和核心内容')
      return
    }
    try {
      const tagsArray = newTags.split(/[,，\s]+/).filter(Boolean)
      const domain = ['数据结构', '计算机组成', '操作系统', '计算机网络'].includes(newSubject) ? 'cs_408' : 'math'
      const res = await api.addMemory({
        type: newType,
        title: newTitle.trim(),
        content: newContent.trim(),
        subject: newSubject,
        domain,
        mastery: newType === 'concept' ? newMastery : undefined,
        tags: tagsArray,
        lastReviewed: new Date().toISOString().split('T')[0],
      })
      if (res.success) {
        setShowAddModal(false)
        setNewTitle('')
        setNewContent('')
        setNewTags('')
        loadMemories()
      }
    } catch (err: any) {
      alert('添加失败: ' + err.message)
    }
  }

  // Filter memories
  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      // Tab matching
      if (activeTab === 'matrix' && m.type !== 'concept') return false
      if (activeTab === 'chunks' && m.type !== 'chunk') return false
      if (activeTab === 'traps' && m.type !== 'mistake') return false

      // Subject filter
      if (subjectFilter !== 'all') {
        if (subjectFilter === 'cs_408' && m.domain !== 'cs_408') return false
        if (subjectFilter === 'math' && m.domain !== 'math') return false
        if (subjectFilter !== 'cs_408' && subjectFilter !== 'math' && m.subject !== subjectFilter) return false
      }

      // Mastery filter (only for concepts)
      if (activeTab === 'matrix' && masteryFilter !== 'all') {
        if (m.mastery !== masteryFilter) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.tags.some(t => t.toLowerCase().includes(q)) ||
          m.subject.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [memories, activeTab, subjectFilter, masteryFilter, searchQuery])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-cream-300 dark:border-slate-800 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-warm-800 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-cream-200 dark:border-slate-800 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">AI 可视化记忆仓库</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                  长效跨会话研学脑图
                </span>
              </div>
              <p className="text-xs text-warm-500 dark:text-slate-400 mt-0.5">
                自动萃取伴学过程中的考点熟练度、核心定理推导与历年真题思维盲区
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建考点记忆</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-warm-400 hover:text-warm-700 dark:hover:text-slate-200 hover:bg-cream-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionFeedback && (
          <div className="px-6 py-2 bg-emerald-500/15 border-b border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Metric Cards Row */}
        {stats && (
          <div className="px-6 py-3 bg-cream-100/50 dark:bg-slate-900/40 border-b border-cream-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 shrink-0">
            <div className="bg-surface dark:bg-slate-800/80 p-2 rounded-xl border border-cream-200 dark:border-slate-700/60 shadow-2xs">
              <div className="text-[10px] text-warm-400 font-medium">累计记忆考点</div>
              <div className="text-base font-bold text-warm-900 dark:text-slate-100 mt-0.5 font-mono flex items-center gap-1">
                <span>{stats.total}</span>
                <span className="text-[10px] text-purple-600 font-normal">项</span>
              </div>
            </div>

            <div className="bg-surface dark:bg-slate-800/80 p-2 rounded-xl border border-emerald-500/20 shadow-2xs">
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> 牢固掌握
              </div>
              <div className="text-base font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono">
                {stats.masteredCount} <span className="text-[10px] text-warm-400 font-normal">({stats.masteryRate}%)</span>
              </div>
            </div>

            <div className="bg-surface dark:bg-slate-800/80 p-2 rounded-xl border border-amber-500/20 shadow-2xs">
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 正在精进研磨
              </div>
              <div className="text-base font-bold text-amber-700 dark:text-amber-300 mt-0.5 font-mono">
                {stats.learningCount} <span className="text-[10px] text-warm-400 font-normal">个</span>
              </div>
            </div>

            <div className="bg-surface dark:bg-slate-800/80 p-2 rounded-xl border border-rose-500/20 shadow-2xs">
              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 重点薄弱考点
              </div>
              <div className="text-base font-bold text-rose-700 dark:text-rose-300 mt-0.5 font-mono">
                {stats.weakCount} <span className="text-[10px] text-warm-400 font-normal">个</span>
              </div>
            </div>

            <div className="bg-surface dark:bg-slate-800/80 p-2 rounded-xl border border-indigo-500/20 shadow-2xs">
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                <Layers className="w-3 h-3" /> 易错命题陷阱
              </div>
              <div className="text-base font-bold text-indigo-700 dark:text-indigo-300 mt-0.5 font-mono">
                {stats.mistakesCount} <span className="text-[10px] text-warm-400 font-normal">处</span>
              </div>
            </div>

            <div className="bg-surface dark:bg-slate-800/80 p-2 rounded-xl border border-purple-500/20 shadow-2xs">
              <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> 核心公式碎片
              </div>
              <div className="text-base font-bold text-purple-700 dark:text-purple-300 mt-0.5 font-mono">
                {stats.chunksCount} <span className="text-[10px] text-warm-400 font-normal">张</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher & Sub-toolbar */}
        <div className="px-6 py-2.5 border-b border-cream-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-cream-200/70 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { key: 'matrix' as const, label: '🌐 考点认知图谱', count: stats?.conceptsCount },
              { key: 'chunks' as const, label: '📦 高频公式与速记卡', count: stats?.chunksCount },
              { key: 'traps' as const, label: '⚠️ 易错陷阱与思维盲区', count: stats?.mistakesCount },
              { key: 'profile' as const, label: '👤 备考档案画像' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-surface dark:bg-slate-700 text-warm-900 dark:text-white shadow-xs font-bold'
                    : 'text-warm-500 dark:text-slate-400 hover:text-warm-700'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.key ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300' : 'bg-cream-300/60 dark:bg-slate-600 text-warm-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-warm-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索考点、公式或关键词..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-cream-100 dark:bg-slate-800 border border-cream-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-purple-400 w-52"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Filter Bar (Only for Matrix) */}
        {activeTab === 'matrix' && (
          <div className="px-6 py-2 bg-cream-50 dark:bg-slate-900/30 border-b border-cream-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
            {/* Subject Filters */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="text-[11px] text-warm-400 font-medium shrink-0">学科:</span>
              {[
                { key: 'all', label: '全部' },
                { key: 'cs_408', label: '💻 408 计算机' },
                { key: 'math', label: '📐 考研数学' },
                { key: '数据结构', label: '数据结构' },
                { key: '计算机组成', label: '计组' },
                { key: '操作系统', label: '操作系统' },
                { key: '计算机网络', label: '计网' },
                { key: '高等数学', label: '高数' },
                { key: '线性代数', label: '线代' },
                { key: '概率论', label: '概率' },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setSubjectFilter(s.key)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium shrink-0 transition-colors cursor-pointer ${
                    subjectFilter === s.key
                      ? 'bg-purple-500 text-white font-bold'
                      : 'bg-cream-100 dark:bg-slate-800 text-warm-600 dark:text-slate-300 hover:bg-cream-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Mastery Filters */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[11px] text-warm-400 font-medium">状态:</span>
              {[
                { key: 'all', label: '全部' },
                { key: 'mastered', label: '🟢 熟练' },
                { key: 'learning', label: '🟡 研磨' },
                { key: 'weak', label: '🔴 薄弱' },
              ].map(m => (
                <button
                  key={m.key}
                  onClick={() => setMasteryFilter(m.key)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    masteryFilter === m.key
                      ? 'bg-purple-500 text-white font-bold'
                      : 'bg-cream-100 dark:bg-slate-800 text-warm-600 dark:text-slate-300 hover:bg-cream-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-xs text-warm-400">
              正在读取 AI 记忆仓库数据...
            </div>
          ) : activeTab === 'profile' ? (
            /* Profile Tab */
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="bg-surface dark:bg-slate-800/80 rounded-2xl border border-cream-200 dark:border-slate-700 p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-warm-900 dark:text-slate-100">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span>考生档案与考研伴学画像</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-warm-400">目标考试科目</label>
                    <div className="p-2.5 rounded-xl bg-cream-100 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 font-medium">
                      408 计算机学科专业基础 &amp; 考研数学
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-warm-400">目标考研年份</label>
                    <div className="p-2.5 rounded-xl bg-cream-100 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 font-medium">
                      2027 级全国硕士研究生统考
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-warm-400">当前伴学智能体偏好</label>
                    <div className="p-2.5 rounded-xl bg-cream-100 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 font-medium">
                      💻 研小核 (408 全科导师) · 学术严谨模式
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-warm-400">本地知识库挂载点</label>
                    <div className="p-2.5 rounded-xl bg-cream-100 dark:bg-slate-900 border border-cream-200 dark:border-slate-700 font-mono text-[11px] truncate">
                      E:\考研\408考研学习
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-cream-200 dark:border-slate-700 text-xs text-warm-500 dark:text-slate-400 leading-relaxed">
                  💡 <b>长效记忆机制说明</b>：伴学智能体在与您交流 408 计算机与考研数学时，会自动识别您已掌握的考点并降低重复解释篇幅；对于被标记为「🔴 重点薄弱考点」或「⚠️ 命题陷阱」的知识元，智能体会主动为您设置连环追问与变式真题练习，确保考前彻底消灭盲区！
                </div>
              </div>
            </div>
          ) : filteredMemories.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Brain className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-warm-700 dark:text-slate-300">
                暂无符合筛选条件的记忆项
              </div>
              <p className="text-[11px] text-warm-400 max-w-sm">
                可以通过点击右上角「新建考点记忆」，或者在与智能体探讨考点时点击「沉淀笔记」自动积累记忆！
              </p>
            </div>
          ) : (
            /* Memory Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMemories.map(m => {
                const isMastered = m.mastery === 'mastered'
                const isWeak = m.mastery === 'weak'
                return (
                  <div
                    key={m.id}
                    className="bg-surface dark:bg-slate-800/90 rounded-2xl border border-cream-200 dark:border-slate-700/80 p-4 shadow-xs flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-600 transition-all group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            m.domain === 'cs_408'
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                          }`}>
                            {m.subject}
                          </span>

                          {m.examFrequency && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-semibold">
                              {m.examFrequency}
                            </span>
                          )}

                          {m.type === 'concept' && (
                            <div className="flex items-center gap-1">
                              <select
                                value={m.mastery || 'learning'}
                                onChange={e => handleUpdateMastery(m.id, e.target.value as MemoryMastery)}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border cursor-pointer focus:outline-hidden ${
                                  isMastered
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                    : isWeak
                                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                                }`}
                              >
                                <option value="mastered">🟢 牢固掌握</option>
                                <option value="learning">🟡 正在研磨</option>
                                <option value="weak">🔴 薄弱攻坚</option>
                              </select>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-warm-400">
                          <span className="text-[10px] font-mono">复习 {m.reviewCount} 次</span>
                          <button
                            onClick={() => handleDeleteMemory(m.id, m.title)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-warm-400 hover:text-red-500 transition-opacity"
                            title="归档删除"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-warm-900 dark:text-slate-100 leading-snug mb-2">
                        {m.title}
                      </h4>

                      {/* Content Preview */}
                      <div className="text-xs text-warm-700 dark:text-slate-300 leading-relaxed bg-cream-100/60 dark:bg-slate-900/60 p-3 rounded-xl border border-cream-200/70 dark:border-slate-800 mb-2.5">
                        <MarkdownRenderer content={m.content} />
                        {m.formulaKatex && (
                          <div className="mt-2 pt-2 border-t border-cream-200 dark:border-slate-800 text-center font-mono text-purple-600 dark:text-purple-400 text-xs">
                            ${m.formulaKatex}$
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {m.tags && m.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {m.tags.map((t, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-cream-200/70 dark:bg-slate-700 text-warm-600 dark:text-slate-300 font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Toolbar */}
                    <div className="pt-2 border-t border-cream-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeepDive(m)}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                          title="在伴学聊天中针对该考点深入研读"
                        >
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <span>去伴学深挖</span>
                        </button>

                        <button
                          onClick={() => handlePractice(m)}
                          className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                          title="现场针对该考点出题自测"
                        >
                          <Target className="w-3 h-3 text-orange-500" />
                          <span>考我这题</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="p-1 rounded-md hover:bg-cream-200 dark:hover:bg-slate-700 text-warm-400 hover:text-warm-700 dark:hover:text-slate-200 transition-colors"
                          title="复制考点解析"
                        >
                          {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleExportToObsidian(m)}
                          className="px-2 py-1 rounded-lg hover:bg-cream-200 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400 font-semibold transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                          title="一键写入 Obsidian 知识库真实笔记"
                        >
                          <FileText className="w-3 h-3" />
                          <span>沉淀到笔记</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-cream-200 dark:border-slate-800 bg-cream-100/40 dark:bg-slate-900/60 flex items-center justify-between text-xs text-warm-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-purple-500" />
            <span>长效记忆库实时保存在知识库 <code>wiki/.memory/ai_memory.json</code> 中</span>
          </div>
          <div>点击任意考点可直接调用 5 大专科智能体发起现场自测或深度剖析</div>
        </div>
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4 animate-in fade-in">
          <div className="bg-surface border border-cream-300 dark:border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cream-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-warm-900 dark:text-slate-100 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span>新建考研知识记忆元</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-warm-400 hover:text-warm-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-warm-500 mb-1">记忆类型</label>
                <div className="flex items-center gap-2">
                  {[
                    { key: 'concept', label: '🎓 考点掌握认知' },
                    { key: 'chunk', label: '📦 公式定理碎片' },
                    { key: 'mistake', label: '⚠️ 思维盲区与陷阱' },
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => setNewType(t.key as any)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                        newType === t.key
                          ? 'bg-purple-500 text-white border-purple-600'
                          : 'bg-cream-100 text-warm-700 border-cream-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-warm-500 mb-1">所属学科</label>
                <select
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full bg-cream-100 dark:bg-slate-800 border border-cream-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                >
                  <option value="数据结构">数据结构 (408)</option>
                  <option value="计算机组成">计算机组成原理 (408)</option>
                  <option value="操作系统">操作系统 (408)</option>
                  <option value="计算机网络">计算机网络 (408)</option>
                  <option value="高等数学">高等数学</option>
                  <option value="线性代数">线性代数</option>
                  <option value="概率论">概率论与数理统计</option>
                </select>
              </div>

              {newType === 'concept' && (
                <div>
                  <label className="block text-warm-500 mb-1">初始掌握度</label>
                  <select
                    value={newMastery}
                    onChange={e => setNewMastery(e.target.value as any)}
                    className="w-full bg-cream-100 dark:bg-slate-800 border border-cream-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                  >
                    <option value="learning">🟡 正在精进研磨</option>
                    <option value="mastered">🟢 已经熟练掌握</option>
                    <option value="weak">🔴 薄弱需攻坚</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-warm-500 mb-1">考点标题</label>
                <input
                  type="text"
                  placeholder="如：红黑树五大性质与插入旋转调色"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-cream-100 dark:bg-slate-800 border border-cream-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-warm-500 mb-1">核心机理与考研精析</label>
                <textarea
                  rows={4}
                  placeholder="输入考点本质机理、推导要点、避坑口诀..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full bg-cream-100 dark:bg-slate-800 border border-cream-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-warm-500 mb-1">标签 (空格或逗号分隔)</label>
                <input
                  type="text"
                  placeholder="二叉树 红黑树 平衡化"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  className="w-full bg-cream-100 dark:bg-slate-800 border border-cream-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-200 dark:border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg border border-cream-200 text-warm-600 text-xs font-semibold hover:bg-cream-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleCreateMemory}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold cursor-pointer"
              >
                保存在记忆库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
