import { useState, useEffect } from 'react'
import {
  X,
  Trash2,
  RefreshCw,
  Cpu,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
} from 'lucide-react'
import { api, type LocalAgentStatus } from '../services/api'

interface ModelManagerModalProps {
  isOpen: boolean
  onClose: () => void
  agents: LocalAgentStatus[]
  currentProvider: 'codex' | 'claude-code' | 'web'
  onModelsUpdated: (updatedAgents: LocalAgentStatus[]) => void
}

export default function ModelManagerModal({
  isOpen,
  onClose,
  agents,
  currentProvider,
  onModelsUpdated,
}: ModelManagerModalProps) {
  const [selectedTab, setSelectedTab] = useState<'codex' | 'claude-code' | 'web'>(currentProvider)
  const [deletedModels, setDeletedModels] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [customModelInput, setCustomModelInput] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSelectedTab(currentProvider)
      loadDeletedModels()
    }
  }, [isOpen, currentProvider])

  const loadDeletedModels = async () => {
    try {
      const res = await api.getDeletedModels()
      if (res.deletedModels) {
        setDeletedModels(res.deletedModels)
      }
    } catch {
      // ignore
    }
  }

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, text })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleDeleteModel = async (model: string) => {
    setLoading(true)
    try {
      const res = await api.deleteLocalModel(model)
      if (res.success && res.agents) {
        onModelsUpdated(res.agents)
        setDeletedModels(res.deletedModels || [])
        showFeedback(`已成功删除模型: ${model}`)
      }
    } catch (err: any) {
      showFeedback(`删除失败: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUndeleteModel = async (model: string) => {
    setLoading(true)
    try {
      const res = await api.undeleteLocalModel(model)
      if (res.success && res.agents) {
        onModelsUpdated(res.agents)
        setDeletedModels(res.deletedModels || [])
        showFeedback(`已恢复模型: ${model}`)
      }
    } catch (err: any) {
      showFeedback(`恢复失败: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreAll = async () => {
    if (!window.confirm('确定要恢复所有被删除的模型吗？')) return
    setLoading(true)
    try {
      const res = await api.restoreLocalModels()
      if (res.success && res.agents) {
        onModelsUpdated(res.agents)
        setDeletedModels([])
        showFeedback('已恢复所有已删除模型')
      }
    } catch (err: any) {
      showFeedback(`恢复失败: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setLoading(true)
    try {
      const res = await api.syncLocalAgentModels()
      if (res.success && res.agents) {
        onModelsUpdated(res.agents)
        await loadDeletedModels()
        showFeedback('已重新扫描本机全部模型')
      }
    } catch (err: any) {
      showFeedback(`扫描失败: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCustomModel = async () => {
    const trimmed = customModelInput.trim()
    if (!trimmed) return
    // If it's in deletedModels, undelete it
    if (deletedModels.includes(trimmed)) {
      await handleUndeleteModel(trimmed)
    } else {
      showFeedback(`已添加自定义模型: ${trimmed}`)
    }
    setCustomModelInput('')
  }

  if (!isOpen) return null

  const currentAgent = agents.find(a => a.provider === selectedTab)
  const currentModels = currentAgent?.models || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-surface border border-cream-300 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-cream-200 dark:border-slate-800 flex items-center justify-between bg-cream-100/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-warm-900 dark:text-slate-100 flex items-center gap-2">
                模型仓库管理
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-normal">
                  已连接本机引擎
                </span>
              </h2>
              <p className="text-xs text-warm-500 dark:text-slate-400">
                管理已检测的大模型，可一键删除不需要或不存在的无效模型，彻底净化下拉列表
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 dark:hover:text-slate-200 hover:bg-cream-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-4 py-2 text-xs flex items-center gap-2 border-b ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Provider Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-cream-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap bg-cream-50/40 dark:bg-slate-900/30">
          <div className="flex items-center gap-1.5 bg-cream-200/60 dark:bg-slate-800/80 p-1 rounded-xl">
            {[
              { key: 'codex' as const, label: '🤖 Codex 引擎', count: agents.find(a => a.provider === 'codex')?.models?.length || 0 },
              { key: 'claude-code' as const, label: '⚡ Claude Code', count: agents.find(a => a.provider === 'claude-code')?.models?.length || 0 },
              { key: 'web' as const, label: '☁️ 云端双核', count: 4 },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTab === tab.key
                    ? 'bg-surface dark:bg-slate-700 text-warm-900 dark:text-white shadow-xs'
                    : 'text-warm-500 dark:text-slate-400 hover:text-warm-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cream-200 dark:bg-slate-600 text-warm-600 dark:text-slate-300">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={loading}
              title="重新扫描本机当前配置的大模型"
              className="px-2.5 py-1.5 rounded-lg border border-cream-200 dark:border-slate-700 bg-surface dark:bg-slate-800 hover:border-orange-400 text-xs font-medium text-warm-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-500 ${loading ? 'animate-spin' : ''}`} />
              <span>重新扫描本机</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Active Models for Current Provider */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-warm-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>当前可用模型列表 ({currentModels.length} 个)</span>
              </h3>
              <span className="text-[11px] text-warm-400">点击右侧垃圾桶即可从系统列表彻底移除</span>
            </div>

            {currentModels.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-cream-300 dark:border-slate-700 rounded-xl bg-cream-50/50 dark:bg-slate-900/30 text-warm-400 dark:text-slate-500 text-xs">
                暂无此分类下的可用模型，可点击「重新扫描本机」或在下方手动添加。
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentModels.map(m => (
                  <div
                    key={m}
                    className="group p-2.5 rounded-xl border border-cream-200 dark:border-slate-800 bg-surface dark:bg-slate-900/50 hover:border-orange-300 dark:hover:border-orange-500/40 transition-all flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-mono font-medium text-warm-800 dark:text-slate-200 truncate" title={m}>
                        {m}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteModel(m)}
                      disabled={loading}
                      title="删除此模型（移入黑名单，不再出现在下拉列表）"
                      className="p-1.5 rounded-lg text-warm-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Custom Model */}
          <div className="p-3 bg-cream-100/60 dark:bg-slate-900/40 border border-cream-200 dark:border-slate-800 rounded-xl flex items-center gap-2">
            <input
              type="text"
              placeholder="指定新模型名称，如 deepseek-reasoner 或 qwen-plus..."
              value={customModelInput}
              onChange={e => setCustomModelInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustomModel()}
              className="flex-1 bg-surface dark:bg-slate-800 border border-cream-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-warm-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
            />
            <button
              onClick={handleAddCustomModel}
              disabled={!customModelInput.trim()}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加模型</span>
            </button>
          </div>

          {/* Deleted Models Blacklist Section */}
          {deletedModels.length > 0 && (
            <div className="pt-2 border-t border-cream-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-warm-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span>已删除 / 黑名单模型 ({deletedModels.length} 个)</span>
                </h4>
                <button
                  onClick={handleRestoreAll}
                  disabled={loading}
                  className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>恢复全部模型</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {deletedModels.map(m => (
                  <div
                    key={m}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-cream-200 dark:border-slate-800 bg-cream-100/70 dark:bg-slate-800/40 text-[11px] text-warm-500 dark:text-slate-400"
                  >
                    <span className="line-through">{m}</span>
                    <button
                      onClick={() => handleUndeleteModel(m)}
                      disabled={loading}
                      title="恢复此模型"
                      className="text-orange-500 hover:text-orange-700 dark:hover:text-orange-300 font-bold ml-1 cursor-pointer"
                    >
                      恢复
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-cream-200 dark:border-slate-800 flex items-center justify-between bg-cream-50 dark:bg-slate-900/60">
          <span className="text-[11px] text-warm-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            所有删除操作将实时持久化保存，重启应用后依然保持纯净
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
