import { useState, useEffect, useMemo } from 'react'
import {
  X,
  Search,
  Sparkles,
  RefreshCw,
  Check,
  BookOpen,
  Shield,
  FileCode,
  Globe,
  Terminal,
  ArrowRight,
  FileText,
  Wrench,
} from 'lucide-react'
import { api, type LocalSkill } from '../services/api'

interface LocalSkillPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSkill: (skill: LocalSkill) => void
  currentSkillId?: string
}

export default function LocalSkillPickerModal({
  isOpen,
  onClose,
  onSelectSkill,
  currentSkillId,
}: LocalSkillPickerModalProps) {
  const [skills, setSkills] = useState<LocalSkill[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [selectedSource, setSelectedSource] = useState<string>('全部')
  const [previewSkill, setPreviewSkill] = useState<LocalSkill | null>(null)

  const loadSkills = async () => {
    setLoading(true)
    try {
      const res = await api.getLocalSkills()
      if (res.skills) {
        setSkills(res.skills)
        if (!previewSkill && res.skills.length > 0) {
          setPreviewSkill(res.skills[0])
        }
      }
    } catch (err: any) {
      console.error('Failed to load local skills:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncSkills = async () => {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const res = await api.syncLocalSkills()
      if (res.skills) {
        setSkills(res.skills)
        setSyncMessage(`已成功从本机扫描到 ${res.scannedCount || res.skills.length} 个 Agent Skills！`)
        setTimeout(() => setSyncMessage(null), 4000)
      }
    } catch (err: any) {
      setSyncMessage(`同步失败: ${err.message}`)
      setTimeout(() => setSyncMessage(null), 4000)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadSkills()
    }
  }, [isOpen])

  const categories = useMemo(() => {
    const set = new Set(skills.map(s => s.category))
    return ['全部', ...Array.from(set)]
  }, [skills])

  const filteredSkills = useMemo(() => {
    return skills.filter(s => {
      const matchCat = selectedCategory === '全部' || s.category === selectedCategory
      const matchSrc = selectedSource === '全部' || s.source === selectedSource
      const matchQuery =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSrc && matchQuery
    })
  }, [skills, selectedCategory, selectedSource, searchQuery])

  // Keep preview updated
  useEffect(() => {
    if (filteredSkills.length > 0 && (!previewSkill || !filteredSkills.find(s => s.id === previewSkill.id))) {
      setPreviewSkill(filteredSkills[0])
    }
  }, [filteredSkills, previewSkill])

  if (!isOpen) return null

  const getSourceBadge = (source: LocalSkill['source']) => {
    switch (source) {
      case 'claude':
        return { label: 'Claude Code 本机', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200' }
      case 'agents':
        return { label: '.agents 全局', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' }
      case 'codex':
        return { label: 'Codex 本机', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200' }
      case 'antigravity':
        return { label: 'Antigravity 内置', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200' }
      case 'plugin':
        return { label: 'DevTools 插件', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200' }
      case 'builtin':
        return { label: 'CoreForge 研学', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200' }
      default:
        return { label: '本地技能', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200' }
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case '研学与考研':
        return <BookOpen className="w-3.5 h-3.5 text-amber-500" />
      case '安全与审计':
        return <Shield className="w-3.5 h-3.5 text-rose-500" />
      case '文档与办公':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />
      case '浏览器与自动化':
        return <Globe className="w-3.5 h-3.5 text-indigo-500" />
      case '开发与架构':
        return <FileCode className="w-3.5 h-3.5 text-emerald-500" />
      default:
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[86vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50/50 via-white to-orange-50/30 dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  本机 Agent 技能矩阵 (Skills Hub)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-300">
                  共已发现 {skills.length} 个本地技能
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                实时同步扫描自 ~/.claude/skills, ~/.agents/skills, ~/.codex 与 Antigravity，免插件一键调用
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSyncSkills}
              disabled={syncing}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400 dark:hover:border-amber-500 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? '正在扫描本机...' : '🔄 重新同步本机技能'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {syncMessage && (
          <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Toolbar: Search + Categories */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索技能名称、关键字或功能描述 (如：pdf, playwright, 大纲, audit, debug)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
              <span>来源:</span>
              <select
                value={selectedSource}
                onChange={e => setSelectedSource(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="全部">全部来源</option>
                <option value="claude">Claude Code (~/.claude)</option>
                <option value="agents">Agent 标准库 (~/.agents)</option>
                <option value="codex">Codex 本机 (~/.codex)</option>
                <option value="antigravity">Antigravity</option>
                <option value="builtin">CoreForge 研学内置</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => {
              const count = cat === '全部' ? skills.length : skills.filter(s => s.category === cat).length
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-sm font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  {cat !== '全部' && getCategoryIcon(cat)}
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area: Left list (60%) + Right preview (40%) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Skills List */}
          <div className="w-[58%] border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                正在加载本机技能列表...
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                没有找到匹配的本地技能，试着调整搜索词或分类
              </div>
            ) : (
              filteredSkills.map(skill => {
                const isSelected = previewSkill?.id === skill.id
                const isCurrent = currentSkillId === skill.id
                const badge = getSourceBadge(skill.source)

                return (
                  <div
                    key={skill.id}
                    onClick={() => setPreviewSkill(skill)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(skill.category)}
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {skill.displayName}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">
                            当前已启用
                          </span>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${badge.color} shrink-0`}>
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {skill.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="font-mono truncate max-w-[240px]">
                        ID: {skill.name}
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {skill.category}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Skill Detail Preview */}
          <div className="w-[42%] bg-slate-50/60 dark:bg-slate-950/40 p-5 flex flex-col overflow-y-auto custom-scrollbar">
            {previewSkill ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getSourceBadge(previewSkill.source).color}`}>
                      {getSourceBadge(previewSkill.source).label}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                      {previewSkill.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {previewSkill.displayName}
                  </h4>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {previewSkill.name}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    💡 技能目标与触发说明
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {previewSkill.description}
                  </p>
                </div>

                {previewSkill.allowedTools && previewSkill.allowedTools.length > 0 && (
                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
                    <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>调用工具权限</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {previewSkill.allowedTools.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-mono text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex-1 min-h-[160px] p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col space-y-1.5 overflow-hidden">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    <span>技能系统 Prompt 蓝图预览</span>
                  </div>
                  <pre className="flex-1 overflow-y-auto p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed custom-scrollbar">
                    {previewSkill.instructions}
                  </pre>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      onSelectSkill(previewSkill)
                      onClose()
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>启用此技能 ({previewSkill.displayName})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                请在左侧选择技能以查看详情
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
