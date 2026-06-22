import { useState, useEffect } from 'react'
import { api, type AppSettings } from '../services/api'
import { Save, RefreshCw, CheckCircle, AlertCircle, Key, FolderOpen, Globe, Cpu, Eye, EyeOff, Folder, AlertTriangle, Zap } from 'lucide-react'

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
  const [pickingFolder, setPickingFolder] = useState(false)

  // Track original vaultPath for restart hint
  const [originalVaultPath, setOriginalVaultPath] = useState('')
  const [showRestartHint, setShowRestartHint] = useState(false)

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

  async function handleSelectFolder() {
    if (!window.electronAPI?.selectFolder) return
    setPickingFolder(true)
    try {
      const folder = await window.electronAPI.selectFolder()
      if (folder) {
        setVaultPath(folder)
      }
    } catch {
      // user cancelled
    } finally {
      setPickingFolder(false)
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

  const hasElectron = !!window.electronAPI?.selectFolder

  // Configuration status checks
  const vaultConfigured = !!settings?.vaultPath && settings.vaultPath.length > 0
  const aiConfigured = !!settings?.ai?.apiKey && settings.ai.apiKey.length > 0 && !settings.ai.apiKey.includes('...')
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
              {hasElectron && (
                <button
                  onClick={handleSelectFolder}
                  disabled={pickingFolder}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-600 text-sm hover:text-warm-800 hover:border-cream-200 transition-colors disabled:opacity-50"
                  title="浏览文件夹"
                >
                  <Folder className="w-4 h-4" />
                  浏览
                </button>
              )}
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
              <Key className="w-3.5 h-3.5 text-warm-400" />
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="claude-3-5-sonnet-20241022"
                className="flex-1 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
              />
            </div>
            <p className="text-[11px] text-warm-400 mt-1">
              例如: claude-3-5-sonnet-20241022, mimo-v2.5-pro
            </p>
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
