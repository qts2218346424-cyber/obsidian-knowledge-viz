import { createPortal } from 'react-dom'
import { useAuth } from '../contexts/AuthContext'
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
  ArrowLeft,
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
  const { isAdmin } = useAuth()
  const [skills, setSkills] = useState<LocalSkill[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [selectedSource, setSelectedSource] = useState<string>('全部')
  const [previewSkill, setPreviewSkill] = useState<LocalSkill | null>(null)
  const [mobileShowDetail, setMobileShowDetail] = useState(false)

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
        setSyncMessage(`已成功同步 ${res.scannedCount || res.skills.length} 项系统专项技能！`)
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
      setMobileShowDetail(false)
      loadSkills()
    }
  }, [isOpen])

  const categories = useMemo(() => {
    const set = new Set(skills.map(s => s.category))
    return ['全部', ...Array.from(set)]
  }, [skills])

  const availableSources = useMemo(() => {
    return Array.from(new Set(skills.map(s => s.source)))
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
        return { label: 'Claude 扩展', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200' }
      case 'agents':
        return { label: '全局通用技能', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' }
      case 'codex':
        return { label: 'Codex 工程', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200' }
      case 'antigravity':
        return { label: 'Antigravity 引擎', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200' }
      case 'plugin':
        return { label: '拓展插件', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200' }
      case 'builtin':
        return { label: 'CoreForge 研学', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200' }
      default:
        return { label: '系统技能', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200' }
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case '研学与考研':
        return <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      case '安全与审计':
        return <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />
      case '文档与办公':
        return <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
      case '浏览器与自动化':
        return <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
      case '开发与架构':
        return <FileCode className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      default:
        return <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92dvh] sm:h-[86vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start sm:items-center justify-between gap-2 bg-gradient-to-r from-amber-50/50 via-white to-orange-50/30 dark:from-slate-900 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-[16px] sm:text-base font-bold text-slate-900 dark:text-white whitespace-nowrap">
                  系统自带技能库
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs font-semibold border border-amber-300 whitespace-nowrap shrink-0">
                  共 {skills.length} 项技能
                </span>
              </div>
              <p className="text-[12px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                内置考研深度研学专项技能，涵盖大纲重构、图谱双链、真题命题与错因诊断
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {isAdmin && (
              <button
                onClick={handleSyncSkills}
                disabled={syncing}
                title="管理员专属：同步最新系统扩展技能"
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400 dark:hover:border-amber-500 text-[12px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-500 shrink-0 ${syncing ? 'animate-spin' : ''}`} />
                <span className="sm:hidden">{syncing ? '同步中...' : '同步技能'}</span>
                <span className="hidden sm:inline">{syncing ? '正在同步技能...' : '同步系统技能'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="关闭技能库"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Feedback Toast */}
        {syncMessage && (
          <div className="px-4 sm:px-5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 text-[12px] sm:text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Toolbar: Search + Categories (移动端进入详情时收起工具栏以释放阅读空间) */}
        <div className={`${mobileShowDetail ? 'hidden md:flex' : 'flex'} p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex-col gap-2.5 sm:gap-3 shrink-0`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索技能名称、关键字或功能..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[13px] sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 shadow-inner"
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

            {availableSources.length > 1 && (
              <div className="flex items-center gap-1.5 text-[12px] sm:text-xs text-slate-500 shrink-0">
                <span className="whitespace-nowrap">来源:</span>
                <select
                  value={selectedSource}
                  onChange={e => setSelectedSource(e.target.value)}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-[13px] sm:text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="全部">全部来源</option>
                  {availableSources.includes('builtin') && <option value="builtin">CoreForge 研学核心</option>}
                  {availableSources.includes('antigravity') && <option value="antigravity">Antigravity 专项引擎</option>}
                  {availableSources.includes('claude') && <option value="claude">Claude 扩展技能</option>}
                  {availableSources.includes('agents') && <option value="agents">全局通用技能</option>}
                  {availableSources.includes('codex') && <option value="codex">Codex 工程技能</option>}
                  {availableSources.includes('plugin') && <option value="plugin">辅助插件库</option>}
                </select>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {categories.map(cat => {
                const count = cat === '全部' ? skills.length : skills.filter(s => s.category === cat).length
                const isSelected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] sm:text-xs font-semibold shrink-0 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-sm font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    {cat !== '全部' && getCategoryIcon(cat)}
                    <span>{cat}</span>
                    <span className={`text-[11px] sm:text-2xs px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Content Area: 手机端单栏切换，桌面端左右双栏 */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Skills List */}
          <div className={`${mobileShowDetail ? 'hidden md:block' : 'block'} w-full md:w-[56%] md:border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-3 sm:p-4 space-y-2.5 custom-scrollbar`}>
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-[13px] sm:text-xs">
                正在加载系统技能列表...
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-[13px] sm:text-xs">
                没有找到匹配的技能，试着调整搜索词或分类
              </div>
            ) : (
              filteredSkills.map(skill => {
                const isSelected = previewSkill?.id === skill.id
                const isCurrent = currentSkillId === skill.id
                const badge = getSourceBadge(skill.source)

                return (
                  <div
                    key={skill.id}
                    onClick={() => {
                      setPreviewSkill(skill)
                      setMobileShowDetail(true)
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getCategoryIcon(skill.category)}
                        <span className="text-[14px] sm:text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                          {skill.displayName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[11px] sm:text-2xs font-bold whitespace-nowrap">
                            已启用
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-md text-[11px] sm:text-2xs font-medium border whitespace-nowrap ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-[13px] sm:text-2xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {skill.description}
                    </p>

                    <div className="flex items-center justify-between text-[12px] sm:text-2xs text-slate-400 pt-0.5">
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {skill.category}
                      </span>
                      <span className="md:hidden text-amber-600 font-medium flex items-center gap-1">
                        <span>查看与启用</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Skill Detail Preview */}
          <div className={`${mobileShowDetail ? 'flex' : 'hidden md:flex'} w-full md:w-[44%] bg-slate-50/60 dark:bg-slate-950/40 flex-col min-h-0 overflow-hidden`}>
            {previewSkill ? (
              <>
                {/* 移动端详情顶部返回条 */}
                <div className="md:hidden px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileShowDetail(false)}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-600 dark:text-amber-400 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>返回技能列表</span>
                  </button>
                  <span className="text-[12px] text-slate-400">技能详情预览</span>
                </div>

                {/* 可滚动详情主体 */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar">
                  <div>
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] sm:text-2xs font-medium border whitespace-nowrap ${getSourceBadge(previewSkill.source).color}`}>
                        {getSourceBadge(previewSkill.source).label}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] sm:text-2xs font-medium whitespace-nowrap">
                        {previewSkill.category}
                      </span>
                      {currentSkillId === previewSkill.id && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[11px] sm:text-2xs font-bold whitespace-nowrap">
                          当前对话已启用
                        </span>
                      )}
                    </div>
                    <h4 className="text-[16px] sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 leading-snug">
                      {previewSkill.displayName}
                    </h4>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="text-[13px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                      💡 技能目标与触发说明
                    </div>
                    <p className="text-[13px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {previewSkill.description}
                    </p>
                  </div>

                  {isAdmin && previewSkill.allowedTools && previewSkill.allowedTools.length > 0 && (
                    <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
                      <div className="text-[13px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>辅助工具支持</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {previewSkill.allowedTools.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-mono text-[11px] sm:text-2xs">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col space-y-2">
                    <div className="text-[13px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-slate-500" />
                      <span>技能执行规范说明</span>
                    </div>
                    <pre className="max-h-[260px] sm:max-h-[300px] overflow-y-auto p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 text-[12px] sm:text-2xs font-sans sm:font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed custom-scrollbar">
                      {previewSkill.instructions}
                    </pre>
                  </div>
                </div>

                {/* 底部固定启用操作栏，确保任何尺寸下永不溢出屏幕 */}
                <div className="shrink-0 p-3.5 sm:p-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <button
                    onClick={() => {
                      onSelectSkill(previewSkill)
                      onClose()
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[14px] sm:text-xs shadow-sm shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span className="truncate">启用此技能（{previewSkill.displayName}）</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-[13px] sm:text-xs text-slate-400">
                请选择一项技能以查看详情
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
