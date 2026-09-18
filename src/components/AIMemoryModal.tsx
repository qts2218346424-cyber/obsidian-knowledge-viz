import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  X, Brain, CheckCircle2, AlertTriangle,
  Target, FileText, Plus, Trash2, Search,
  Zap, Check, Copy,
  RefreshCw, Save, RotateCcw, ShieldCheck, UserCheck, MessageSquare,
  Code2
} from 'lucide-react'
import {
  api,
  type AgentMemoryConfig,
  type AgentDirective,
  type AgentPersona,
  type UserProfileContext
} from '../services/api'

interface AIMemoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAskAgent?: (prompt: string) => void
  onTriggerPractice?: (title: string, content: string) => void
  onSelectConcept?: (title: string) => void
}

type TabType = 'persona' | 'rules' | 'profile' | 'directives' | 'raw_markdown'

export default function AIMemoryModal({
  isOpen,
  onClose,
  onAskAgent,
}: AIMemoryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('directives')
  const [config, setConfig] = useState<AgentMemoryConfig | null>(null)
  const [rawMarkdown, setRawMarkdown] = useState<string>('')
  const [filePath, setFilePath] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Filters for directives tab
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Edit / Add Directive Modal State
  const [showAddDirectiveModal, setShowAddDirectiveModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState<'behavior' | 'knowledge' | 'preference' | 'habit'>('behavior')

  // Form states for editable sections
  const [editingPersona, setEditingPersona] = useState<AgentPersona | null>(null)
  const [editingProfile, setEditingProfile] = useState<UserProfileContext | null>(null)
  const [editingRules, setEditingRules] = useState<string[]>([])
  const [newRuleText, setNewRuleText] = useState('')
  const [newWeakPointText, setNewWeakPointText] = useState('')
  const [newPreferenceText, setNewPreferenceText] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getAgentMemoryConfig()
      if (res.success && res.config) {
        setConfig(res.config)
        setRawMarkdown(res.rawMarkdown || '')
        setFilePath(res.filePath || 'agent.md')
        setEditingPersona(res.config.persona)
        setEditingProfile(res.config.userProfile)
        setEditingRules(res.config.rules || [])
      }
    } catch (err: any) {
      console.error('Failed to load agent memory config:', err)
      setActionFeedback('加载 agent.md 设定失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, loadData])

  // Save current structured config to agent.md
  const handleSaveConfig = async () => {
    if (!config || !editingPersona || !editingProfile) return
    setSaving(true)
    try {
      const updatedConfig: AgentMemoryConfig = {
        ...config,
        persona: editingPersona,
        rules: editingRules,
        userProfile: editingProfile,
        lastUpdated: new Date().toISOString().split('T')[0],
      }
      const res = await api.saveAgentMemoryConfig(updatedConfig)
      if (res.success) {
        setConfig(res.config)
        setRawMarkdown(res.rawMarkdown)
        setActionFeedback('agent.md 设定已成功保存并实时注入 AI System Prompt！')
        setTimeout(() => setActionFeedback(null), 3000)
      }
    } catch (err: any) {
      alert('保存失败: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Save raw markdown directly
  const handleSaveRawMarkdown = async () => {
    setSaving(true)
    try {
      const res = await api.saveRawAgentMarkdown(rawMarkdown)
      if (res.success) {
        setConfig(res.config)
        setEditingPersona(res.config.persona)
        setEditingProfile(res.config.userProfile)
        setEditingRules(res.config.rules || [])
        setActionFeedback('agent.md 源码已成功保存并同步生效！')
        setTimeout(() => setActionFeedback(null), 3000)
      }
    } catch (err: any) {
      alert('保存 Markdown 源码失败: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Toggle directive enabled state
  const handleToggleDirective = async (d: AgentDirective) => {
    const nextState = !d.enabled
    try {
      const res = await api.updateAgentDirective(d.id, { enabled: nextState })
      if (res.success && res.directive) {
        setConfig(prev => {
          if (!prev) return prev
          return {
            ...prev,
            directives: prev.directives.map(item => item.id === d.id ? res.directive : item)
          }
        })
      }
    } catch (err: any) {
      alert('切换记忆项状态失败: ' + err.message)
    }
  }

  // Delete directive
  const handleDeleteDirective = async (id: string, title: string) => {
    if (!confirm(`确定要从 agent.md 中删除记忆指令《${title}》吗？`)) return
    try {
      const res = await api.deleteAgentDirective(id)
      if (res.success) {
        setConfig(prev => {
          if (!prev) return prev
          return {
            ...prev,
            directives: prev.directives.filter(item => item.id !== id)
          }
        })
      }
    } catch (err: any) {
      alert('删除记忆指令失败: ' + err.message)
    }
  }

  // Add directive
  const handleAddDirectiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) {
      alert('标题与记忆内容均为必填项')
      return
    }
    try {
      const res = await api.addAgentDirective({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        enabled: true,
      })
      if (res.success && res.directive) {
        setConfig(prev => {
          if (!prev) return prev
          return {
            ...prev,
            directives: [res.directive, ...prev.directives]
          }
        })
        setShowAddDirectiveModal(false)
        setNewTitle('')
        setNewContent('')
        setActionFeedback(`已将记忆指令《${res.directive.title}》追加写入 agent.md！`)
        setTimeout(() => setActionFeedback(null), 3000)
      }
    } catch (err: any) {
      alert('添加失败: ' + err.message)
    }
  }

  // Reset to default
  const handleResetDefault = async () => {
    if (!confirm('确定要将 agent.md 恢复为初始标准推荐设定吗？此操作会重置人设、规则与预置长效记忆。')) return
    try {
      const res = await api.resetAgentMemoryDefault()
      if (res.success) {
        setConfig(res.config)
        setRawMarkdown(res.rawMarkdown)
        setEditingPersona(res.config.persona)
        setEditingProfile(res.config.userProfile)
        setEditingRules(res.config.rules || [])
        setActionFeedback('已重置恢复默认 agent.md 设定！')
        setTimeout(() => setActionFeedback(null), 3000)
      }
    } catch (err: any) {
      alert('重置失败: ' + err.message)
    }
  }

  // Copy raw markdown
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(rawMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Filtered directives
  const filteredDirectives = useMemo(() => {
    if (!config?.directives) return []
    const q = searchQuery.toLowerCase().trim()
    return config.directives.filter(d => {
      if (categoryFilter !== 'all' && d.category !== categoryFilter) return false
      if (q && !d.title.toLowerCase().includes(q) && !d.content.toLowerCase().includes(q)) return false
      return true
    })
  }, [config?.directives, searchQuery, categoryFilter])

  const stats = useMemo(() => {
    const list = config?.directives || []
    const active = list.filter(d => d.enabled).length
    return {
      total: list.length,
      active,
      rulesCount: editingRules.length,
      weakPointsCount: editingProfile?.weakPoints.length || 0,
      personaName: editingPersona?.name || '研小核',
    }
  }, [config?.directives, editingRules, editingProfile, editingPersona])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-cream-300 bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream-200 bg-surface/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-orange/15 text-accent-orange shadow-sm">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-warm-800">AI 可视化记忆仓库</h2>
                <span className="rounded-md bg-accent-orange/12 px-2 py-0.5 text-[11px] font-semibold text-accent-orange">
                  agent.md 智能体设定
                </span>
              </div>
              <p className="mt-0.5 text-xs text-warm-500">
                我对 AI 智能体的角色人设、行为准则规范与长期记忆库，实时同步本地知识库并注入 System Prompt。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              title="刷新设定"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-cream-200 text-warm-500 hover:bg-cream-100 hover:text-warm-800 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-cream-200 text-warm-400 hover:bg-cream-100 hover:text-warm-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Global Action Feedback Alert */}
        {actionFeedback && (
          <div className="flex items-center justify-between bg-accent-sage/10 border-b border-accent-sage/20 px-6 py-2 text-xs font-medium text-accent-sage animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent-sage" />
              <span>{actionFeedback}</span>
            </div>
            <button onClick={() => setActionFeedback(null)} className="text-[11px] underline hover:opacity-80">
              关闭
            </button>
          </div>
        )}

        {/* Top Metric Overview Bar */}
        <div className="grid grid-cols-2 gap-3 border-b border-cream-200 bg-cream-50/60 px-6 py-3 sm:grid-cols-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-warm-400">当前人设</div>
              <div className="text-xs font-bold text-warm-800 truncate max-w-[140px]">{stats.personaName}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-warm-400">全局准则规范</div>
              <div className="text-xs font-bold text-warm-800">{stats.rulesCount} 项严选规则</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-orange/15 text-accent-orange">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-warm-400">活跃长效记忆</div>
              <div className="text-xs font-bold text-warm-800">{stats.active} / {stats.total} 条生效中</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] text-warm-400">重点弱项画像</div>
              <div className="text-xs font-bold text-warm-800">{stats.weakPointsCount} 个标记考点</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Mode Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-200 px-6 py-2 bg-surface">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('directives')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'directives'
                  ? 'bg-accent-orange text-white shadow-sm'
                  : 'text-warm-600 hover:bg-cream-100'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>长效记忆清单</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'directives' ? 'bg-white/20 text-white' : 'bg-cream-200 text-warm-600'
              }`}>
                {stats.active}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('persona')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'persona'
                  ? 'bg-accent-orange text-white shadow-sm'
                  : 'text-warm-600 hover:bg-cream-100'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>人设与角色定位</span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'rules'
                  ? 'bg-accent-orange text-white shadow-sm'
                  : 'text-warm-600 hover:bg-cream-100'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>行为准则规范</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'rules' ? 'bg-white/20 text-white' : 'bg-cream-200 text-warm-600'
              }`}>
                {stats.rulesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-accent-orange text-white shadow-sm'
                  : 'text-warm-600 hover:bg-cream-100'
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>考生档案与偏好</span>
            </button>

            <button
              onClick={() => setActiveTab('raw_markdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'raw_markdown'
                  ? 'bg-accent-orange text-white shadow-sm'
                  : 'text-warm-600 hover:bg-cream-100'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>agent.md 源码所见即所得</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefault}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-cream-200 text-warm-500 hover:bg-cream-100 text-xs transition-colors"
              title="重置为默认 agent.md"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>恢复默认</span>
            </button>

            {activeTab === 'raw_markdown' ? (
              <button
                onClick={handleSaveRawMarkdown}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-orange text-white text-xs font-medium hover:bg-accent-orange/90 shadow-sm transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? '保存中...' : '保存 Markdown 源码'}</span>
              </button>
            ) : (
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-orange text-white text-xs font-medium hover:bg-accent-orange/90 shadow-sm transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? '同步中...' : '保存并同步生效'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF8F5]">
          {/* TAB 1: ACTIVE DIRECTIVES (LONG-TERM MEMORY) */}
          {activeTab === 'directives' && (
            <div className="flex flex-col gap-4">
              {/* Directive Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3 rounded-2xl border border-cream-200 shadow-sm">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-warm-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="搜索记忆指令关键词..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-700 placeholder-warm-400 focus:bg-white focus:outline-none focus:border-accent-orange transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-cream-100 p-1 rounded-xl text-xs">
                    {(['all', 'behavior', 'knowledge', 'habit', 'preference'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          categoryFilter === cat
                            ? 'bg-surface font-semibold text-warm-800 shadow-sm'
                            : 'text-warm-500 hover:text-warm-800'
                        }`}
                      >
                        {cat === 'all' ? '全部类别' : cat === 'behavior' ? '解题规范' : cat === 'knowledge' ? '考点防错' : cat === 'habit' ? '笔记习惯' : '交互偏好'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAddDirectiveModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 shadow-sm transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>新增记忆指令</span>
                  </button>
                </div>
              </div>

              {/* Directive Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredDirectives.map(d => (
                  <div
                    key={d.id}
                    className={`flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                      d.enabled
                        ? 'border-cream-300 bg-surface shadow-sm'
                        : 'border-cream-200/80 bg-cream-50/70 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            d.category === 'behavior' ? 'bg-indigo-50 text-indigo-600' :
                            d.category === 'knowledge' ? 'bg-emerald-50 text-emerald-600' :
                            d.category === 'habit' ? 'bg-accent-orange/15 text-accent-orange' :
                            'bg-purple-50 text-purple-600'
                          }`}>
                            {d.category === 'behavior' ? '解题规范' : d.category === 'knowledge' ? '考点防错' : d.category === 'habit' ? '笔记习惯' : '个性化偏好'}
                          </span>
                          <span className="text-xs font-bold text-warm-800">{d.title}</span>
                        </div>

                        {/* Enable/Disable Toggle */}
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={d.enabled}
                            onChange={() => handleToggleDirective(d)}
                            className="sr-only"
                          />
                          <div className={`w-8 h-4.5 rounded-full transition-colors relative ${
                            d.enabled ? 'bg-accent-orange' : 'bg-cream-300'
                          }`}>
                            <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform absolute top-0.5 ${
                              d.enabled ? 'left-4' : 'left-0.5'
                            }`} />
                          </div>
                          <span className="text-[10px] font-medium text-warm-500">
                            {d.enabled ? '已启用' : '已停用'}
                          </span>
                        </label>
                      </div>

                      <p className="text-xs text-warm-600 leading-relaxed font-normal whitespace-pre-wrap">
                        {d.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-cream-100 pt-3 mt-3 text-[11px] text-warm-400">
                      <span>更新: {d.lastUpdated}</span>
                      <div className="flex items-center gap-2">
                        {onAskAgent && (
                          <button
                            onClick={() => onAskAgent(`请基于你 agent.md 中关于【${d.title}】的记忆设定，指导我练习一道对应的考研题。`)}
                            className="text-accent-orange hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>提问此设定</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteDirective(d.id, d.title)}
                          className="text-warm-400 hover:text-rose-600 transition-colors p-1"
                          title="删除此记忆"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDirectives.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-cream-300 bg-surface/60">
                  <Brain className="h-10 w-10 text-warm-300 mb-2" />
                  <div className="text-sm font-semibold text-warm-700">没有找到匹配的记忆指令</div>
                  <p className="text-xs text-warm-400 mt-1">您可以尝试清空搜索框或点击右上角“新增记忆指令”添加新规则。</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PERSONA & IDENTITY */}
          {activeTab === 'persona' && editingPersona && (
            <div className="max-w-2xl mx-auto flex flex-col gap-4 bg-surface p-6 rounded-2xl border border-cream-200 shadow-sm">
              <div className="flex items-center gap-2 border-b border-cream-100 pb-3">
                <UserCheck className="h-5 w-5 text-accent-orange" />
                <div>
                  <h3 className="text-sm font-bold text-warm-800">智能体角色定位与语气人设</h3>
                  <p className="text-xs text-warm-400">定义 AI 助手的身份、回答风格与核心教学理念。</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-1">助手称谓 / 名字</label>
                  <input
                    type="text"
                    value={editingPersona.name}
                    onChange={e => setEditingPersona({ ...editingPersona, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-1">角色定位</label>
                  <input
                    type="text"
                    value={editingPersona.role}
                    onChange={e => setEditingPersona({ ...editingPersona, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-1">对话语气与教学风格</label>
                  <input
                    type="text"
                    value={editingPersona.tone}
                    onChange={e => setEditingPersona({ ...editingPersona, tone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-1">能力概述与核心使命</label>
                  <textarea
                    rows={4}
                    value={editingPersona.summary}
                    onChange={e => setEditingPersona({ ...editingPersona, summary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 transition-colors shadow-sm"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>保存人设修改</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BEHAVIORAL DIRECTIVES (RULES) */}
          {activeTab === 'rules' && (
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              <div className="bg-surface p-5 rounded-2xl border border-cream-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-cream-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-accent-orange" />
                    <div>
                      <h3 className="text-sm font-bold text-warm-800">全局行为准则与交互规范</h3>
                      <p className="text-xs text-warm-400">大模型在每一次答疑、解题和操作笔记时必须严格履行的铁律。</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-accent-orange">{editingRules.length} 条已生效</span>
                </div>

                <div className="space-y-2.5 mb-4">
                  {editingRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl border border-cream-200 bg-cream-50/70 hover:bg-cream-50 transition-colors"
                    >
                      <div className="flex items-start gap-2 text-xs text-warm-700 leading-relaxed">
                        <span className="font-bold text-accent-orange shrink-0">{idx + 1}.</span>
                        <span>{rule}</span>
                      </div>
                      <button
                        onClick={() => setEditingRules(editingRules.filter((_, i) => i !== idx))}
                        className="text-warm-300 hover:text-rose-600 transition-colors shrink-0 p-1"
                        title="删除该规则"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new rule */}
                <div className="flex items-center gap-2 pt-2 border-t border-cream-100">
                  <input
                    type="text"
                    value={newRuleText}
                    onChange={e => setNewRuleText(e.target.value)}
                    placeholder="输入新的行为准则规范（例如：每次回答前先简要提炼 3 个核心定理关键词）..."
                    className="flex-1 px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newRuleText.trim()) {
                        setEditingRules([...editingRules, newRuleText.trim()])
                        setNewRuleText('')
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newRuleText.trim()) return
                      setEditingRules([...editingRules, newRuleText.trim()])
                      setNewRuleText('')
                    }}
                    className="px-3 py-2 rounded-xl bg-warm-800 text-white text-xs font-semibold hover:bg-warm-900 transition-colors"
                  >
                    添加规则
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USER PROFILE & CONTEXT */}
          {activeTab === 'profile' && editingProfile && (
            <div className="max-w-3xl mx-auto flex flex-col gap-4 bg-surface p-6 rounded-2xl border border-cream-200 shadow-sm">
              <div className="flex items-center gap-2 border-b border-cream-100 pb-3">
                <Target className="h-5 w-5 text-accent-orange" />
                <div>
                  <h3 className="text-sm font-bold text-warm-800">考生背景档案与个性化偏好记忆</h3>
                  <p className="text-xs text-warm-400">告知 AI 你的目标考向、基础背景与薄弱考点，AI 将因材施教量身定制回答。</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-1">目标考向 / 科目</label>
                  <input
                    type="text"
                    value={editingProfile.targetExam}
                    onChange={e => setEditingProfile({ ...editingProfile, targetExam: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-1">目标院校 / 院系</label>
                  <input
                    type="text"
                    value={editingProfile.targetSchool}
                    onChange={e => setEditingProfile({ ...editingProfile, targetSchool: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-1">考生基础与背景</label>
                  <input
                    type="text"
                    value={editingProfile.userBackground}
                    onChange={e => setEditingProfile({ ...editingProfile, userBackground: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-warm-700 mb-1">当前备考阶段</label>
                  <input
                    type="text"
                    value={editingProfile.currentStage}
                    onChange={e => setEditingProfile({ ...editingProfile, currentStage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                  />
                </div>
              </div>

              {/* Weak Points Tags */}
              <div className="border-t border-cream-100 pt-3">
                <label className="block text-xs font-semibold text-warm-700 mb-2">重点薄弱考点清单（AI 会自动加强相关变式）</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editingProfile.weakPoints.map((wp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs"
                    >
                      <span>{wp}</span>
                      <button
                        onClick={() => setEditingProfile({
                          ...editingProfile,
                          weakPoints: editingProfile.weakPoints.filter((_, i) => i !== idx)
                        })}
                        className="hover:text-rose-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newWeakPointText}
                    onChange={e => setNewWeakPointText(e.target.value)}
                    placeholder="添加薄弱考点（如：线代相似对角化判定）..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newWeakPointText.trim()) {
                        setEditingProfile({
                          ...editingProfile,
                          weakPoints: [...editingProfile.weakPoints, newWeakPointText.trim()]
                        })
                        setNewWeakPointText('')
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newWeakPointText.trim()) return
                      setEditingProfile({
                        ...editingProfile,
                        weakPoints: [...editingProfile.weakPoints, newWeakPointText.trim()]
                      })
                      setNewWeakPointText('')
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cream-200 text-warm-700 text-xs font-semibold hover:bg-cream-300 transition-colors"
                  >
                    添加考点
                  </button>
                </div>
              </div>

              {/* Preferences */}
              <div className="border-t border-cream-100 pt-3">
                <label className="block text-xs font-semibold text-warm-700 mb-2">个人习惯与学习偏好</label>
                <div className="space-y-1.5 mb-2">
                  {editingProfile.customPreferences.map((cp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-cream-50 text-xs text-warm-700">
                      <span>• {cp}</span>
                      <button
                        onClick={() => setEditingProfile({
                          ...editingProfile,
                          customPreferences: editingProfile.customPreferences.filter((_, i) => i !== idx)
                        })}
                        className="text-warm-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPreferenceText}
                    onChange={e => setNewPreferenceText(e.target.value)}
                    placeholder="添加个人习惯（如：喜欢用 Python 代码验证高数求极限）..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newPreferenceText.trim()) {
                        setEditingProfile({
                          ...editingProfile,
                          customPreferences: [...editingProfile.customPreferences, newPreferenceText.trim()]
                        })
                        setNewPreferenceText('')
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!newPreferenceText.trim()) return
                      setEditingProfile({
                        ...editingProfile,
                        customPreferences: [...editingProfile.customPreferences, newPreferenceText.trim()]
                      })
                      setNewPreferenceText('')
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cream-200 text-warm-700 text-xs font-semibold hover:bg-cream-300 transition-colors"
                  >
                    添加习惯
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 transition-colors shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>保存档案设定</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: RAW MARKDOWN EDITOR */}
          {activeTab === 'raw_markdown' && (
            <div className="h-full flex flex-col gap-3 bg-surface p-4 rounded-2xl border border-cream-200 shadow-sm">
              <div className="flex items-center justify-between text-xs text-warm-500 border-b border-cream-100 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent-orange" />
                  <span className="font-mono text-warm-700">{filePath}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-cream-200 hover:bg-cream-100 text-warm-600 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-accent-sage" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? '已复制' : '复制全文'}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <textarea
                  value={rawMarkdown}
                  onChange={e => setRawMarkdown(e.target.value)}
                  className="w-full flex-1 p-3 rounded-xl border border-cream-200 bg-[#FAF9F5] font-mono text-xs text-warm-800 leading-relaxed focus:bg-white focus:outline-none focus:border-accent-orange resize-none"
                  placeholder="agent.md 完整 Markdown 源码..."
                />
              </div>

              <div className="flex items-center justify-between text-xs text-warm-400 pt-1">
                <span>提示：直接在此处编辑标准 Markdown，点击右上方“保存 Markdown 源码”将直接持久化至知识库并实时生效。</span>
                <span className="font-mono">{rawMarkdown.length} 字符</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-cream-200 bg-surface px-6 py-3 text-xs text-warm-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent-sage animate-pulse" />
            <span>实时同步文件：{filePath}</span>
          </div>
          <span>设置即时写入大模型 System Prompt · 考研伴学双核大脑</span>
        </div>
      </div>

      {/* Add Directive Modal Popup */}
      {showAddDirectiveModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-cream-300 bg-surface p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-cream-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-warm-800">新建长效记忆指令 (agent.md)</h3>
              <button onClick={() => setShowAddDirectiveModal(false)} className="text-warm-400 hover:text-warm-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddDirectiveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-warm-700 mb-1">指令分类</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                >
                  <option value="behavior">解题规范 (行为与格式约束)</option>
                  <option value="knowledge">考点防错 (核心陷阱与定理约束)</option>
                  <option value="habit">笔记习惯 (知识库整理与联动)</option>
                  <option value="preference">交互偏好 (问答风格与引导模式)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-700 mb-1">记忆标题 (简明标签)</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="例如：泰勒展开截断阶数必须一致"
                  className="w-full px-3 py-1.5 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-warm-700 mb-1">长效记忆指令内容</label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="详细描述你希望 AI 始终记住并履行的规则，例如：在回答任何未定式求极限题目前，先核对分母阶数，并在步骤中高亮提示展开阶数..."
                  className="w-full px-3 py-1.5 rounded-xl border border-cream-200 bg-cream-50 text-xs text-warm-800 focus:bg-white focus:outline-none focus:border-accent-orange leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-cream-100">
                <button
                  type="button"
                  onClick={() => setShowAddDirectiveModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-cream-200 text-warm-600 text-xs hover:bg-cream-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 shadow-sm"
                >
                  写入 agent.md
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
