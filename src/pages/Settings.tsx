import { useState, useEffect, useCallback } from 'react'
import { api, type AppSettings } from '../services/api'
import { Save, RefreshCw, CheckCircle, AlertCircle, Key, FolderOpen, Globe, Cpu, Eye, EyeOff, Folder, AlertTriangle, Zap, ChevronRight, ChevronDown, ArrowUp, Loader2, X, HardDrive, Check } from 'lucide-react'

declare global {
  interface Window {
    electronAPI?: {
      platform: string
      selectFolder: () => Promise<string | null>
    }
  }
}

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Track original vaultPath for restart hint
  const [originalVaultPath, setOriginalVaultPath] = useState('')
  const [showRestartHint, setShowRestartHint] = useState(false)

  // Folder picker state
  const [showPicker, setShowPicker] = useState(false)

  // Model selector state
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>([])
  const [fetchingModels, setFetchingModels] = useState(false)
  const [showModelList, setShowModelList] = useState(false)
  const [modelFetchError, setModelFetchError] = useState('')

  // Form state
  const [vaultPath, setVaultPath] = useState('')
  const [port, setPort] = useState(3001)
  const [apiKey, setApiKey] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [model, setModel] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const s = await api.getSettings()
      setSettings(s)
      setVaultPath(s.vaultPath || '')
      setPort(s.port || 3001)
      setApiKey(s.ai?.apiKey || '')
      setBaseURL(s.ai?.baseURL || '')
      setModel(s.ai?.model || '')
      setOriginalVaultPath(s.vaultPath || '')
      setShowRestartHint(false)
    } catch (err: any) {
      setMessage({ type: 'error', text: `加载设置失败: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  function handleOpenPicker() {
    setShowPicker(true)
  }

  function handlePickerSelect(folderPath: string) {
    setVaultPath(folderPath)
    setShowPicker(false)
  }

  async function handleFetchModels() {
    setFetchingModels(true)
    setModelFetchError('')
    setShowModelList(true)
    try {
      const data = await api.fetchAIModels()
      setAvailableModels(data.models || [])
      if (data.models.length === 0) {
        setModelFetchError('未找到可用模型')
      }
    } catch (err: any) {
      setModelFetchError(err.message || '获取失败')
      setAvailableModels([])
    } finally {
      setFetchingModels(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const payload: any = { vaultPath, port }
      if (apiKey || baseURL || model) {
        const actualKey = apiKey.includes('...') && settings?.ai
          ? settings.ai.apiKey
          : apiKey
        payload.ai = { apiKey: actualKey, baseURL: baseURL || 'https://api.anthropic.com', model: model || 'claude-3-5-sonnet-20241022' }
      }
      const result = await api.updateSettings(payload)
      setMessage({ type: 'success', text: `设置已保存！Vault: ${result.vaultPath}` })

      // Show restart hint if vaultPath changed
      if (vaultPath !== originalVaultPath) {
        setShowRestartHint(true)
      }

      await loadSettings()
    } catch (err: any) {
      setMessage({ type: 'error', text: `保存失败: ${err.message}` })
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    try {
      const stats = await api.getStats()
      setMessage({ type: 'success', text: `连接成功！共 ${stats.totalNotes} 篇笔记，${stats.totalTags} 个标签` })
    } catch (err: any) {
      setMessage({ type: 'error', text: `连接测试失败: ${err.message}` })
    } finally {
      setTesting(false)
    }
  }

  // Configuration status checks
  const vaultConfigured = !!settings?.vaultPath && settings.vaultPath.length > 0
  // Server masks the key as "first8...last4", so presence of '...' means a key IS set
  const aiConfigured = !!settings?.ai?.apiKey && settings.ai.apiKey.length > 0
  const aiModelSet = !!settings?.ai?.model && settings.ai.model.length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-warm-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-warm-800">设置</h1>
        <p className="text-sm text-warm-500 mt-1">配置 Vault 路径、AI 模型和应用参数</p>
      </div>

      {/* Configuration status overview */}
      <section className="bg-surface border border-cream-200 rounded-xl p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-4">
          <Zap className="w-4 h-4 text-accent-amber" />
          配置状态
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatusCard
            label="知识库路径"
            configured={vaultConfigured}
            detail={vaultConfigured ? settings!.vaultPath.split(/[\\/]/).pop() || '已设置' : '未设置'}
            configuredText="已连接"
          />
          <StatusCard
            label="AI 密钥"
            configured={aiConfigured}
            detail={aiConfigured ? '已配置' : '未配置'}
            configuredText="AI 功能可用"
          />
          <StatusCard
            label="AI 模型"
            configured={aiModelSet}
            detail={aiModelSet ? settings!.ai!.model! : '未选择'}
            configuredText="已选择"
          />
        </div>
      </section>

      {/* Restart hint */}
      {showRestartHint && (
        <div className="flex items-start gap-3 px-5 py-3.5 rounded-xl bg-accent-amber/8 border border-accent-amber/25">
          <AlertTriangle className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-sm font-medium text-warm-800">知识库路径已更改</span>
            <p className="text-xs text-warm-500 mt-1">
              知识图谱、文件树等数据需要重新扫描才能反映新的知识库内容。建议刷新页面或重启应用以使所有功能生效。
            </p>
          </div>
          <button
            onClick={() => {
              setShowRestartHint(false)
              window.location.reload()
            }}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-accent-amber/15 text-accent-amber hover:bg-accent-amber/25 transition-colors"
          >
            立即刷新
          </button>
        </div>
      )}

      {/* Status message */}
      {message && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
          message.type === 'success'
            ? 'bg-accent-sage/10 border border-accent-sage/20 text-accent-sage'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Vault Settings */}
      <section className="bg-cream-200/50 border border-cream-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-warm-700">
          <FolderOpen className="w-4 h-4 text-accent-orange" />
          Vault 配置
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-warm-500 mb-1.5">Obsidian Vault 路径</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={vaultPath}
                onChange={(e) => setVaultPath(e.target.value)}
                placeholder="例如: E:\我的知识库"
                className="flex-1 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
              />
              <button
                onClick={handleOpenPicker}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-600 text-sm hover:text-warm-800 hover:border-cream-200 transition-colors"
                title="浏览文件夹"
              >
                <Folder className="w-4 h-4" />
                浏览
              </button>
            </div>
            <p className="text-[11px] text-warm-400 mt-1">你的 Obsidian 笔记所在的文件夹路径</p>
          </div>

          <div>
            <label className="block text-xs text-warm-500 mb-1.5">API 端口</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              className="w-32 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
            />
          </div>
        </div>

        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cream-100 border border-cream-300 text-sm text-warm-600 hover:text-warm-800 hover:border-cream-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
          {testing ? '测试中...' : '测试连接'}
        </button>
      </section>

      {/* AI Settings */}
      <section className="bg-cream-200/50 border border-cream-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-warm-700">
          <Cpu className="w-4 h-4 text-accent-sage" />
          AI 模型配置
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-warm-500 mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入你的 API 密钥"
                className="w-full px-3 py-2 pr-10 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-warm-500 mb-1.5">API Base URL</label>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-warm-400" />
              <input
                type="text"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder="https://api.anthropic.com"
                className="flex-1 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
              />
            </div>
            <p className="text-[11px] text-warm-400 mt-1">
              支持 Anthropic、小米 MiMo、或其他兼容 Anthropic API 格式的服务
            </p>
          </div>

          <div>
            <label className="block text-xs text-warm-500 mb-1.5">模型名称</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={model}
                  onChange={(e) => { setModel(e.target.value); setShowModelList(false) }}
                  onFocus={() => availableModels.length > 0 && setShowModelList(true)}
                  placeholder="选择或输入模型名称"
                  className="w-full px-3 py-2 pr-8 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
                />
                {model && (
                  <button
                    onClick={() => { setModel(''); setShowModelList(false) }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-warm-300 hover:text-warm-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={handleFetchModels}
                disabled={fetchingModels}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-600 text-sm hover:text-warm-800 hover:border-cream-200 transition-colors disabled:opacity-50 shrink-0"
              >
                {fetchingModels ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                拉取模型
              </button>
            </div>

            {/* Model dropdown */}
            {showModelList && availableModels.length > 0 && (
              <div className="mt-1.5 border border-cream-200 rounded-lg bg-surface max-h-48 overflow-auto">
                {availableModels.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setModel(m.id); setShowModelList(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-cream-100 transition-colors ${
                      model === m.id ? 'text-accent-orange' : 'text-warm-700'
                    }`}
                  >
                    {model === m.id && <Check className="w-3.5 h-3.5 text-accent-orange shrink-0" />}
                    <span className="truncate flex-1">{m.name || m.id}</span>
                    {m.name !== m.id && <span className="text-[10px] text-warm-400 shrink-0">{m.id}</span>}
                  </button>
                ))}
              </div>
            )}

            {showModelList && fetchingModels && (
              <p className="text-[11px] text-warm-400 mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> 正在获取可用模型...
              </p>
            )}
            {showModelList && modelFetchError && (
              <p className="text-[11px] text-red-400 mt-1">{modelFetchError}</p>
            )}
            {!showModelList && (
              <p className="text-[11px] text-warm-400 mt-1">
                点击「拉取模型」自动获取可选模型列表，或直接输入模型名称
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Config file info */}
      {settings?.configPath && (
        <section className="bg-cream-200/30 border border-cream-200/50 rounded-xl p-4">
          <p className="text-xs text-warm-400">
            配置文件位置: <code className="text-warm-500">{settings.configPath}</code>
          </p>
        </section>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent-orange hover:bg-accent-orange/85 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>

      {/* Folder Picker Modal */}
      {showPicker && (
        <FolderPickerModal
          initialPath={vaultPath}
          onSelect={handlePickerSelect}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

// ─── Folder Picker Modal ──────────────────────────────────────────────────────

interface FsEntry {
  name: string
  path: string
}

function FolderPickerModal({
  initialPath,
  onSelect,
  onClose,
}: {
  initialPath: string
  onSelect: (path: string) => void
  onClose: () => void
}) {
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined)
  const [parent, setParent] = useState<string | null>(null)
  const [entries, setEntries] = useState<FsEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const browse = useCallback(async (dirPath?: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.fsBrowse(dirPath)
      setCurrentPath(data.current || undefined)
      setParent(data.parent || null)
      setEntries(data.entries || [])
    } catch (err: any) {
      setError(err.message || '浏览失败')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Always start from root to show all drives, so user can pick any folder on their computer
    browse()
  }, [browse])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface border border-cream-200 rounded-2xl w-[480px] max-h-[520px] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-accent-orange" />
            <span className="text-sm font-medium text-warm-800">选择知识库文件夹</span>
          </div>
          <button onClick={onClose} className="text-warm-400 hover:text-warm-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current path */}
        {currentPath && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-cream-100/60 border-b border-cream-200">
            {parent && (
              <button
                onClick={() => browse(parent)}
                className="flex items-center gap-1 text-xs text-accent-orange hover:text-accent-orange/80 transition-colors"
              >
                <ArrowUp className="w-3 h-3" />
                上级
              </button>
            )}
            <span className="text-xs text-warm-400 truncate flex-1" title={currentPath}>
              {currentPath}
            </span>
          </div>
        )}

        {/* File list */}
        <div className="flex-1 overflow-auto px-2 py-2">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-warm-500 py-8 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              加载中...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 px-3 py-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="text-center text-warm-400 text-sm py-8">
              此目录下没有子文件夹
            </div>
          )}

          {!loading && entries.map(entry => {
            const isDrive = /^[A-Z]:\\$/.test(entry.path)
            return (
              <button
                key={entry.path}
                onClick={() => browse(entry.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-cream-100 transition-colors text-left group"
              >
                {isDrive ? (
                  <HardDrive className="w-4 h-4 text-warm-400 shrink-0" />
                ) : (
                  <FolderOpen className="w-4 h-4 text-accent-orange/60 shrink-0" />
                )}
                <span className="text-sm text-warm-700 flex-1 truncate">{entry.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-warm-300 group-hover:text-warm-500 transition-colors" />
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-cream-200">
          <div className="text-[11px] text-warm-400 truncate flex-1 mr-3">
            {currentPath ? `当前: ${currentPath}` : '请选择一个磁盘或文件夹'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs text-warm-500 hover:text-warm-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => currentPath && onSelect(currentPath)}
              disabled={!currentPath}
              className="px-4 py-1.5 rounded-lg bg-accent-orange text-white text-xs font-medium hover:bg-accent-orange/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              选择此文件夹
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Status Card ──────────────────────────────────────────────────────────────

function StatusCard({
  label,
  configured,
  detail,
  configuredText,
}: {
  label: string
  configured: boolean
  detail: string
  configuredText: string
}) {
  return (
    <div className={`rounded-lg px-4 py-3 border ${
      configured
        ? 'bg-accent-sage/5 border-accent-sage/20'
        : 'bg-cream-100 border-cream-300'
    }`}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-2 h-2 rounded-full ${configured ? 'bg-accent-sage' : 'bg-warm-300'}`} />
        <span className="text-xs font-medium text-warm-600">{label}</span>
      </div>
      <div className={`text-[11px] truncate ${configured ? 'text-accent-sage/80' : 'text-warm-400'}`}>
        {configured ? configuredText : detail}
      </div>
    </div>
  )
}
