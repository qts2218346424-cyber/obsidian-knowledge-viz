import { useState, useEffect, useCallback } from 'react'
import { api, type AppSettings, type CloudEndpoint } from '../services/api'
import {
  Save, RefreshCw, CheckCircle, AlertCircle, FolderOpen, Globe, Cpu,
  Eye, EyeOff, Folder, AlertTriangle, Zap, ChevronRight, ArrowUp,
  Loader2, X, HardDrive, Check, Download, Plug, Plus, Trash2, Star
} from 'lucide-react'

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
  const [vaultTestResult, setVaultTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [proxyTesting, setProxyTesting] = useState(false)
  const [proxyTestResult, setProxyTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [aiTesting, setAiTesting] = useState(false)
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

  // Obsidian plugin detection state
  const [detectedPlugins, setDetectedPlugins] = useState<{ pluginId: string; displayName: string; apiKey: string; baseURL: string; model: string; hasConfig: boolean }[]>([])
  const [scanningPlugins, setScanningPlugins] = useState(false)
  const [importingPlugin, setImportingPlugin] = useState('')
  const [importResult, setImportResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Basic Form state
  const [vaultPath, setVaultPath] = useState('')
  const [port, setPort] = useState(3001)
  const [proxy, setProxy] = useState('')

  // Multi-Endpoint State
  const [endpoints, setEndpoints] = useState<CloudEndpoint[]>([])
  const [activeEndpointId, setActiveEndpointId] = useState<string>('default')
  const [newModelInput, setNewModelInput] = useState('')

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const s = await api.getSettings()
      setSettings(s)
      setVaultPath(s.vaultPath || '')
      setPort(s.port || 3001)
      setProxy(s.proxy || '')
      setOriginalVaultPath(s.vaultPath || '')
      setShowRestartHint(false)

      if (s.ai?.endpoints && s.ai.endpoints.length > 0) {
        setEndpoints(s.ai.endpoints)
        setActiveEndpointId(s.ai.activeEndpointId || s.ai.endpoints[0].id)
      } else {
        const initialEp: CloudEndpoint = {
          id: 'default',
          name: '默认云端服务',
          apiFormat: s.ai?.apiFormat || (s.ai?.provider === 'openai-compatible' ? 'openai' : 'anthropic'),
          baseURL: s.ai?.baseURL || '',
          apiKey: s.ai?.apiKey || '',
          models: s.ai?.models && s.ai.models.length > 0 ? s.ai.models : (s.ai?.model ? [s.ai.model] : []),
          defaultModel: s.ai?.model || '',
        }
        setEndpoints([initialEp])
        setActiveEndpointId('default')
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `加载设置失败: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  // 当前正在编辑的接口
  const currentEp: CloudEndpoint = endpoints.find(e => e.id === activeEndpointId) || endpoints[0] || {
    id: 'default',
    name: '默认云端服务',
    apiFormat: 'anthropic',
    baseURL: '',
    apiKey: '',
    models: [],
    defaultModel: '',
  }

  const updateCurrentEndpoint = (updater: (ep: CloudEndpoint) => CloudEndpoint) => {
    setEndpoints(prev => prev.map(ep => ep.id === activeEndpointId ? updater(ep) : ep))
  }

  function handleAddEndpoint() {
    const newId = `ep-${Date.now()}`
    const newEp: CloudEndpoint = {
      id: newId,
      name: `接口 ${endpoints.length + 1}`,
      apiFormat: 'openai',
      baseURL: 'https://api.openai.com/v1',
      apiKey: '',
      models: [],
      defaultModel: '',
    }
    setEndpoints(prev => [...prev, newEp])
    setActiveEndpointId(newId)
    setShowModelList(false)
    setAvailableModels([])
    setMessage({ type: 'success', text: `已新建「${newEp.name}」，请配置其 API Key 和 Base URL` })
  }

  function handleDeleteEndpoint(idToDelete: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation()
    if (endpoints.length <= 1) {
      setMessage({ type: 'error', text: '至少需要保留一个接口配置' })
      return
    }
    const epName = endpoints.find(ep => ep.id === idToDelete)?.name || '此接口'
    if (!window.confirm(`确定要删除「${epName}」及其配置的所有模型吗？`)) return
    const next = endpoints.filter(ep => ep.id !== idToDelete)
    setEndpoints(next)
    if (activeEndpointId === idToDelete) {
      setActiveEndpointId(next[0].id)
    }
    setMessage({ type: 'success', text: `已删除「${epName}」` })
  }

  function handleOpenPicker() {
    setShowPicker(true)
  }

  function handlePickerSelect(folderPath: string) {
    setVaultPath(folderPath)
    setShowPicker(false)
  }

  async function handleFetchModels() {
    if (!currentEp.baseURL || !currentEp.apiKey) {
      setModelFetchError('请先填写该接口的 Base URL 与 API Key')
      setShowModelList(true)
      return
    }
    setFetchingModels(true)
    setModelFetchError('')
    setShowModelList(true)
    try {
      const data = await api.fetchAIModels({
        endpointId: currentEp.id,
        baseURL: currentEp.baseURL,
        apiKey: currentEp.apiKey,
      })
      setAvailableModels(data.models || [])
      if (!data.models || data.models.length === 0) {
        setModelFetchError(data.message || '未从该接口扫描到可用模型，请检查 Base URL 与 API Key，亦可在下方手动输入添加')
      }
    } catch (err: any) {
      setModelFetchError(err.message || '获取失败')
      setAvailableModels([])
    } finally {
      setFetchingModels(false)
    }
  }

  function handleImportAllModels() {
    if (availableModels.length === 0) return
    const ids = availableModels.map(m => m.id)
    updateCurrentEndpoint(ep => {
      const merged = Array.from(new Set([...ep.models, ...ids]))
      return {
        ...ep,
        models: merged,
        defaultModel: ep.defaultModel || ids[0] || '',
      }
    })
    setMessage({ type: 'success', text: `已成功将 ${ids.length} 个模型导入到「${currentEp.name}」！记得点击保存。` })
  }

  function handleAddModel(mId: string) {
    if (!mId) return
    updateCurrentEndpoint(ep => {
      const nextModels = Array.from(new Set([...ep.models, mId]))
      return {
        ...ep,
        models: nextModels,
        defaultModel: ep.defaultModel || mId,
      }
    })
  }

  function handleRemoveModel(mId: string) {
    updateCurrentEndpoint(ep => {
      const nextModels = ep.models.filter(m => m !== mId)
      return {
        ...ep,
        models: nextModels,
        defaultModel: ep.defaultModel === mId ? (nextModels[0] || '') : ep.defaultModel,
      }
    })
  }

  function handleManualAddModel() {
    const trimmed = newModelInput.trim()
    if (!trimmed) return
    handleAddModel(trimmed)
    setNewModelInput('')
  }

  async function handleScanPlugins() {
    setScanningPlugins(true)
    setImportResult(null)
    try {
      const data = await api.detectAIPlugins()
      setDetectedPlugins(data.plugins || [])
      if (data.plugins.length === 0) {
        setImportResult({ type: 'error', text: '未检测到已配置的 AI 插件' })
      }
    } catch (err: any) {
      setImportResult({ type: 'error', text: `扫描失败: ${err.message}` })
      setDetectedPlugins([])
    } finally {
      setScanningPlugins(false)
    }
  }

  async function handleImportPlugin(pluginId: string) {
    setImportingPlugin(pluginId)
    setImportResult(null)
    try {
      const result = await api.importAIPluginConfig(pluginId)
      setImportResult({ type: 'success', text: `已从 ${result.imported.displayName} 导入配置并加入新接口` })
      await loadSettings()
    } catch (err: any) {
      setImportResult({ type: 'error', text: `导入失败: ${err.message}` })
    } finally {
      setImportingPlugin('')
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const payload: any = { vaultPath, port, proxy: proxy || '' }
      const totalModelsCount = endpoints.reduce((sum, ep) => sum + (ep.models?.length || 0), 0)
      const activeEp = endpoints.find(e => e.id === activeEndpointId) || endpoints[0]

      payload.ai = {
        apiKey: activeEp?.apiKey || '',
        baseURL: activeEp?.baseURL || '',
        model: activeEp?.defaultModel || activeEp?.models?.[0] || '',
        models: activeEp?.models || [],
        apiFormat: activeEp?.apiFormat || 'anthropic',
        provider: activeEp?.apiFormat === 'openai' ? 'openai-compatible' : 'anthropic',
        endpoints,
        activeEndpointId,
      }

      await api.updateSettings(payload)
      setMessage({
        type: 'success',
        text: `设置已保存！已保存 ${endpoints.length} 个接口，共配置 ${totalModelsCount} 个云端模型。`,
      })

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

  async function handleTestVault() {
    setTesting(true)
    setVaultTestResult(null)
    try {
      const stats = await api.getStats()
      const text = `知识库连接正常：共 ${stats.totalNotes} 篇笔记，${stats.totalTags} 个标签`
      setVaultTestResult({ type: 'success', text })
      setMessage({ type: 'success', text })
    } catch (err: any) {
      const text = `知识库测试失败: ${err.message}`
      setVaultTestResult({ type: 'error', text })
      setMessage({ type: 'error', text })
    } finally {
      setTesting(false)
    }
  }

  async function handleTestProxy() {
    setProxyTesting(true)
    setProxyTestResult(null)
    try {
      const res = await api.testProxy(proxy)
      const text = res.message || '代理连接正常'
      setProxyTestResult({ type: 'success', text })
      setMessage({ type: 'success', text })
    } catch (err: any) {
      const text = `代理测试失败: ${err.message}`
      setProxyTestResult({ type: 'error', text })
      setMessage({ type: 'error', text })
    } finally {
      setProxyTesting(false)
    }
  }

  async function handleTestAI() {
    if (!currentEp.apiKey || !currentEp.baseURL) {
      setMessage({ type: 'error', text: '请先填写当前接口的 API Key 和 Base URL' })
      return
    }
    setAiTesting(true)
    setMessage(null)
    try {
      const result = await api.testAI({
        endpointId: currentEp.id,
        apiKey: currentEp.apiKey,
        baseURL: currentEp.baseURL,
        apiFormat: currentEp.apiFormat,
        model: currentEp.defaultModel || currentEp.models[0] || undefined,
      })
      if (!result.ok) throw new Error(result.error || 'AI 连接测试未通过')
      setMessage({
        type: 'success',
        text: `「${currentEp.name}」测试通过！模型响应: "${result.reply}" (${result.model})`,
      })
    } catch (err: any) {
      setMessage({ type: 'error', text: `「${currentEp.name}」测试失败: ${err.message}` })
    } finally {
      setAiTesting(false)
    }
  }

  // Configuration status checks
  const vaultConfigured = !!settings?.vaultPath && settings.vaultPath.length > 0
  const aiConfigured = (settings?.ai?.endpoints && settings.ai.endpoints.some(e => e.apiKey && e.apiKey.length > 0)) ||
    (!!settings?.ai?.apiKey && settings.ai.apiKey.length > 0)
  const aiModelSet = (settings?.ai?.endpoints && settings.ai.endpoints.some(e => (e.models && e.models.length > 0) || e.defaultModel)) ||
    (!!settings?.ai?.model && settings.ai.model.length > 0)

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
            <label className="block text-xs text-warm-500 mb-1.5 font-medium">Obsidian Vault 路径</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={vaultPath}
                onChange={(e) => setVaultPath(e.target.value)}
                placeholder="例如: E:\我的知识库"
                className="flex-1 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
              />
              <button
                type="button"
                onClick={handleOpenPicker}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-600 text-sm hover:text-warm-800 hover:border-cream-200 transition-colors cursor-pointer"
                title="浏览文件夹"
              >
                <Folder className="w-4 h-4" />
                浏览
              </button>
            </div>
            <p className="text-[11px] text-warm-400 mt-1">你的 Obsidian 笔记所在的文件夹路径</p>
          </div>

          <div>
            <label className="block text-xs text-warm-500 mb-1.5 font-medium">API 端口</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              className="w-32 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
            />
          </div>

          <div>
            <label className="block text-xs text-warm-500 mb-1.5 font-medium">网络代理</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={proxy}
                onChange={(e) => {
                  setProxy(e.target.value)
                  setProxyTestResult(null)
                }}
                placeholder="例如: http://127.0.0.1:7890"
                className="w-80 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
              />
              <button
                type="button"
                onClick={handleTestProxy}
                disabled={proxyTesting || !proxy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-sm text-warm-600 hover:text-warm-800 hover:border-cream-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${proxyTesting ? 'animate-spin' : ''}`} />
                {proxyTesting ? '测试代理中...' : '测试代理连接'}
              </button>
              {proxyTestResult && (
                <span className={`text-xs flex items-center gap-1 ${
                  proxyTestResult.type === 'success' ? 'text-accent-sage' : 'text-red-500'
                }`}>
                  {proxyTestResult.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {proxyTestResult.text}
                </span>
              )}
            </div>
            <p className="text-[11px] text-warm-400 mt-1">
              用于网页抓取（如 YouTube 等需要代理访问的站点）。留空则直接访问。
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleTestVault}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cream-100 border border-cream-300 text-sm text-warm-600 hover:text-warm-800 hover:border-cream-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? '测试知识库中...' : '测试知识库连接'}
          </button>
          {vaultTestResult && (
            <span className={`text-xs flex items-center gap-1 ${
              vaultTestResult.type === 'success' ? 'text-accent-sage' : 'text-red-500'
            }`}>
              {vaultTestResult.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {vaultTestResult.text}
            </span>
          )}
        </div>
      </section>

      {/* AI Settings (Multi-Endpoint Architecture) */}
      <section className="bg-cream-200/50 border border-cream-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200/60 pb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-warm-700">
            <Cpu className="w-4 h-4 text-accent-sage" />
            <span>AI 云端接口与多模型配置</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream-100 text-warm-500 font-normal">
              支持配置多个不同接口，聊天中随时自由切换
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddEndpoint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-orange text-white text-xs font-medium hover:bg-accent-orange/90 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              添加新接口
            </button>
          </div>
        </div>

        {/* 接口选择横向标签栏 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
          {endpoints.map((ep) => {
            const isActive = ep.id === activeEndpointId
            const isGlobalPrimary = ep.id === (settings?.ai?.activeEndpointId || endpoints[0]?.id)
            return (
              <div
                key={ep.id}
                onClick={() => {
                  setActiveEndpointId(ep.id)
                  setShowModelList(false)
                  setAvailableModels([])
                }}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none shrink-0 ${
                  isActive
                    ? 'bg-surface border-accent-orange text-warm-800 shadow-sm ring-1 ring-accent-orange/20'
                    : 'bg-cream-100/60 border-cream-200 text-warm-600 hover:bg-cream-100 hover:border-cream-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Globe className={`w-3.5 h-3.5 ${isActive ? 'text-accent-orange' : 'text-warm-400'}`} />
                  <span className="font-semibold">{ep.name || '未命名接口'}</span>
                  {isGlobalPrimary && (
                    <span className="text-[10px] text-amber-500" title="系统默认主接口">★</span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-accent-orange/15 text-accent-orange' : 'bg-cream-200 text-warm-500'
                  }`}>
                    {ep.models?.length || 0} 模型
                  </span>
                </div>
                {endpoints.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteEndpoint(ep.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-warm-400 hover:text-red-500 hover:bg-red-50 transition-all ml-1"
                    title="删除此接口"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* 当前激活接口的配置编辑区 */}
        <div className="p-4 rounded-xl bg-surface/80 border border-cream-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-warm-700">正在配置：</span>
              <input
                type="text"
                value={currentEp.name}
                onChange={(e) => updateCurrentEndpoint(ep => ({ ...ep, name: e.target.value }))}
                placeholder="例如: DeepSeek 官方"
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-cream-100 border border-cream-300 text-warm-800 focus:outline-none focus:border-accent-orange"
              />
              <span className="text-[11px] text-warm-400 font-mono">({currentEp.id})</span>
            </div>
            <div className="flex items-center gap-2">
              {activeEndpointId !== (settings?.ai?.activeEndpointId || endpoints[0]?.id) ? (
                <button
                  type="button"
                  onClick={() => {
                    updateCurrentEndpoint(ep => ({ ...ep }))
                    if (settings?.ai) {
                      setSettings({
                        ...settings,
                        ai: { ...settings.ai, activeEndpointId: currentEp.id }
                      })
                    }
                    setMessage({ type: 'success', text: `已将「${currentEp.name}」设为系统默认主接口，记得点击保存！` })
                  }}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-cream-100 hover:bg-cream-200 text-warm-600 transition-colors"
                >
                  <Star className="w-3 h-3 text-warm-400" />
                  设为系统默认接口
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium border border-amber-500/20">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  当前系统默认主接口
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-warm-500 mb-1.5 font-medium">API 协议格式</label>
              <select
                value={currentEp.apiFormat}
                onChange={(e) => updateCurrentEndpoint(ep => ({ ...ep, apiFormat: e.target.value as 'anthropic' | 'openai' }))}
                className="w-full px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
              >
                <option value="openai">OpenAI 兼容 Chat Completions API (/v1/chat/completions)</option>
                <option value="anthropic">Anthropic Messages API (/v1/messages)</option>
              </select>
              <p className="text-[11px] text-warm-400 mt-1">
                {currentEp.apiFormat === 'openai'
                  ? '支持 DeepSeek、OpenAI、Moonshot、硅基流动、通义千问、Ollama 等几乎所有兼容服务。'
                  : '支持 Anthropic Claude 官方原生 API 及兼容 Claude 格式的中转服务。'}
              </p>
            </div>

            <div>
              <label className="block text-xs text-warm-500 mb-1.5 font-medium">API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={currentEp.apiKey}
                  onChange={(e) => updateCurrentEndpoint(ep => ({ ...ep, apiKey: e.target.value }))}
                  placeholder="输入此接口的 API Key (例如 sk-...)"
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-warm-500 font-medium">API Base URL</label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-warm-400">快速填入:</span>
                <button
                  type="button"
                  onClick={() => updateCurrentEndpoint(ep => ({ ...ep, baseURL: 'https://api.deepseek.com', apiFormat: 'openai' }))}
                  className="text-accent-orange hover:underline cursor-pointer"
                >
                  DeepSeek
                </button>
                <span className="text-warm-300">|</span>
                <button
                  type="button"
                  onClick={() => updateCurrentEndpoint(ep => ({ ...ep, baseURL: 'https://api.anthropic.com', apiFormat: 'anthropic' }))}
                  className="text-accent-orange hover:underline cursor-pointer"
                >
                  Claude官方
                </button>
                <span className="text-warm-300">|</span>
                <button
                  type="button"
                  onClick={() => updateCurrentEndpoint(ep => ({ ...ep, baseURL: 'https://api.siliconflow.cn/v1', apiFormat: 'openai' }))}
                  className="text-accent-orange hover:underline cursor-pointer"
                >
                  硅基流动
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-warm-400 shrink-0" />
              <input
                type="text"
                value={currentEp.baseURL}
                onChange={(e) => updateCurrentEndpoint(ep => ({ ...ep, baseURL: e.target.value }))}
                placeholder={currentEp.apiFormat === 'openai' ? 'https://api.deepseek.com 或 https://api.openai.com/v1' : 'https://api.anthropic.com'}
                className="flex-1 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
              />
            </div>
          </div>

          {/* 模型管理部分 */}
          <div className="pt-2 border-t border-cream-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="text-xs text-warm-700 font-bold block">此接口导入的模型列表</label>
                <p className="text-[11px] text-warm-400">可拉取服务商提供的模型，或手动输入任意代号；保存后可在聊天中随意切换</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFetchModels}
                  disabled={fetchingModels || !currentEp.baseURL}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-xs font-medium hover:bg-cream-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {fetchingModels ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  拉取可用模型
                </button>
                {availableModels.length > 0 && (
                  <button
                    type="button"
                    onClick={handleImportAllModels}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-orange/10 border border-accent-orange/30 text-accent-orange text-xs font-medium hover:bg-accent-orange/20 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    一键导入全部 ({availableModels.length})
                  </button>
                )}
              </div>
            </div>

            {/* 拉取到的模型下拉抽屉 */}
            {showModelList && availableModels.length > 0 && (
              <div className="border border-cream-200 rounded-lg bg-surface max-h-52 overflow-auto shadow-sm divide-y divide-cream-100">
                <div className="p-2 bg-cream-100/60 flex items-center justify-between text-[11px] text-warm-500 font-medium">
                  <span>从「{currentEp.name}」拉取到 {availableModels.length} 个模型</span>
                  <button
                    type="button"
                    onClick={() => setShowModelList(false)}
                    className="text-warm-400 hover:text-warm-600 cursor-pointer"
                  >
                    收起 ✕
                  </button>
                </div>
                {availableModels.map(m => {
                  const isImported = currentEp.models?.includes(m.id)
                  const isDefault = currentEp.defaultModel === m.id
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between px-3 py-1.5 hover:bg-cream-100/80 transition-colors ${
                        isImported ? 'bg-accent-orange/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isDefault && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        <span className="text-xs font-mono font-medium text-warm-700">{m.name || m.id}</span>
                        {m.name !== m.id && <span className="text-[10px] text-warm-400 font-mono">({m.id})</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isImported) {
                            handleRemoveModel(m.id)
                          } else {
                            handleAddModel(m.id)
                          }
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                          isImported
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-red-500/10 hover:text-red-500'
                            : 'bg-cream-200 text-warm-600 hover:bg-accent-orange hover:text-white'
                        }`}
                      >
                        {isImported ? '已导入 ✕' : '+ 导入'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {showModelList && fetchingModels && (
              <p className="text-[11px] text-warm-400 flex items-center gap-1 py-1">
                <Loader2 className="w-3 h-3 animate-spin" /> 正在从远端接口拉取模型列表...
              </p>
            )}
            {showModelList && modelFetchError && (
              <p className="text-[11px] text-red-500 py-1">{modelFetchError}</p>
            )}

            {/* 已导入模型徽章展示区 */}
            <div className="p-3 rounded-lg bg-cream-100/50 border border-cream-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-warm-700 flex items-center gap-1.5">
                  <span>「{currentEp.name}」已导入的模型</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cream-200 text-warm-600 font-bold">
                    {currentEp.models?.length || 0}
                  </span>
                </span>
                <span className="text-[11px] text-warm-400">点击 ★ 可设为此接口默认模型</span>
              </div>

              {(!currentEp.models || currentEp.models.length === 0) ? (
                <p className="text-xs text-warm-400 italic py-1">
                  暂未导入模型。点击上方「拉取可用模型」或在下方手动输入添加。
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 py-1">
                  {currentEp.models.map(m => {
                    const isDefault = currentEp.defaultModel === m
                    return (
                      <div
                        key={m}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                          isDefault
                            ? 'bg-accent-orange/15 border border-accent-orange/40 text-accent-orange font-bold shadow-xs'
                            : 'bg-surface border border-cream-200 text-warm-700 hover:border-cream-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => updateCurrentEndpoint(ep => ({ ...ep, defaultModel: m }))}
                          className="cursor-pointer flex items-center gap-1"
                          title="设为此接口的默认模型"
                        >
                          {isDefault ? <Star className="w-3 h-3 fill-accent-orange text-accent-orange" /> : <Star className="w-3 h-3 text-warm-300 hover:text-accent-orange" />}
                          <span>{m}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveModel(m)}
                          className="ml-1 text-warm-400 hover:text-red-500 rounded p-0.5 cursor-pointer"
                          title="从列表中移出此模型"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 手动添加模型输入框 */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newModelInput}
                  onChange={(e) => setNewModelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleManualAddModel()
                    }
                  }}
                  placeholder="手动添加其他模型代号 (如 deepseek-chat, gpt-4o, claude-3-5-sonnet)"
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-surface border border-cream-200 text-warm-700 placeholder:text-warm-400 focus:outline-none focus:border-accent-orange"
                />
                <button
                  type="button"
                  onClick={handleManualAddModel}
                  disabled={!newModelInput.trim()}
                  className="px-3 py-1 rounded-lg bg-cream-200 hover:bg-cream-300 text-xs font-medium text-warm-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  + 添加到此接口
                </button>
              </div>
            </div>
          </div>

          {/* 接口连通测试 */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestAI}
              disabled={aiTesting || !currentEp.apiKey || !currentEp.baseURL}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-sage/10 border border-accent-sage/20 text-xs font-medium text-accent-sage hover:bg-accent-sage/15 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${aiTesting ? 'animate-pulse' : ''}`} />
              {aiTesting ? `正在测试「${currentEp.name}」连接…` : `测试「${currentEp.name}」连接`}
            </button>
            <span className="text-[11px] text-warm-400">
              配置完成后，请点击页面底部「保存设置」持久化保存所有接口
            </span>
          </div>
        </div>
      </section>

      {/* Obsidian Plugin Import */}
      <section className="bg-cream-200/50 border border-cream-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-warm-700">
          <Plug className="w-4 h-4 text-accent-mint" />
          从 Obsidian 插件导入
        </div>
        <p className="text-xs text-warm-500">
          自动检测知识库中已安装的 AI 插件（如 Copilot、Smart Connections 等），一键导入其 API 配置。
        </p>

        <button
          onClick={handleScanPlugins}
          disabled={scanningPlugins || !vaultPath}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cream-100 border border-cream-300 text-sm text-warm-600 hover:text-warm-800 hover:border-cream-200 transition-colors disabled:opacity-50"
        >
          {scanningPlugins ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {scanningPlugins ? '扫描中...' : '扫描已安装插件'}
        </button>

        {importResult && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
            importResult.type === 'success'
              ? 'bg-accent-sage/10 border border-accent-sage/20 text-accent-sage'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {importResult.type === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {importResult.text}
          </div>
        )}

        {detectedPlugins.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-warm-500 font-medium">检测到以下插件配置：</p>
            {detectedPlugins.map(plugin => (
              <div key={plugin.pluginId} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-cream-100/80 border border-cream-200">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-warm-700 font-medium">{plugin.displayName}</div>
                  <div className="text-[11px] text-warm-400 mt-0.5 truncate">
                    Key: {plugin.apiKey}
                    {plugin.baseURL && ` · ${plugin.baseURL}`}
                    {plugin.model && ` · ${plugin.model}`}
                  </div>
                </div>
                <button
                  onClick={() => handleImportPlugin(plugin.pluginId)}
                  disabled={importingPlugin === plugin.pluginId}
                  className="shrink-0 ml-3 px-3 py-1.5 rounded-lg bg-accent-sage/15 text-accent-sage text-xs font-medium hover:bg-accent-sage/25 transition-colors disabled:opacity-50"
                >
                  {importingPlugin === plugin.pluginId ? '导入中...' : '导入'}
                </button>
              </div>
            ))}
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

      {/* Folder Picker Modal */}
      {showPicker && (
        <FolderPickerModal
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
  onSelect,
  onClose,
}: {
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
