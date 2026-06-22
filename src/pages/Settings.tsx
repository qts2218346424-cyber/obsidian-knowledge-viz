import { useState, useEffect } from 'react'
import { api, type AppSettings } from '../services/api'
import { Save, RefreshCw, CheckCircle, AlertCircle, Key, FolderOpen, Globe, Cpu, Eye, EyeOff } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

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
    } catch (err: any) {
      setMessage({ type: 'error', text: `加载设置失败: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const payload: any = { vaultPath, port }
      if (apiKey || baseURL || model) {
        // If API key hasn't changed (contains ...), don't send it
        const actualKey = apiKey.includes('...') && settings?.ai
          ? settings.ai.apiKey
          : apiKey
        payload.ai = { apiKey: actualKey, baseURL: baseURL || 'https://api.anthropic.com', model: model || 'claude-3-5-sonnet-20241022' }
      }
      const result = await api.updateSettings(payload)
      setMessage({ type: 'success', text: `设置已保存！Vault: ${result.vaultPath}` })
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
            <input
              type="text"
              value={vaultPath}
              onChange={(e) => setVaultPath(e.target.value)}
              placeholder="例如: E:\我的知识库"
              className="w-full px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
            />
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

        {settings?.ai && (
          <div className="flex items-center gap-2 text-xs text-accent-sage">
            <CheckCircle className="w-3.5 h-3.5" />
            AI 已配置 ({settings.ai.model || baseURL})
          </div>
        )}
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
