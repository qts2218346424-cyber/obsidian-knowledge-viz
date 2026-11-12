import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../contexts/AuthContext'
import { useThemeStyle } from '../hooks/useThemeStyle'
import { getSecuritySettings, updateSecuritySettings } from '../services/auth'
import { api, type AppSettings, type CloudEndpoint } from '../services/api'
import {
  Save, RefreshCw, CheckCircle, AlertCircle, FolderOpen, Globe, Cpu, Palette,
  Eye, EyeOff, Folder, AlertTriangle, Zap, ChevronRight, ArrowUp,
  Loader2, X, HardDrive, Check, Download, Plug, Plus, Trash2, Star, KeyRound, ShieldCheck, Lock, Copy, ShieldAlert
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
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
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

  // 考生个性化备考偏好（本地与账号隔离）
  const [targetSubject, setTargetSubject] = useState<'408' | 'math' | 'all'>(() => {
    try {
      return (localStorage.getItem('coreforge_pref_target_subject') as any) || 'all'
    } catch {
      return 'all'
    }
  })
  const [dailyQuizGoal, setDailyQuizGoal] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('coreforge_pref_daily_quiz_goal')) || 20
    } catch {
      return 20
    }
  })
  const [dailyVocabGoal, setDailyVocabGoal] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('coreforge_pref_daily_vocab_goal')) || 30
    } catch {
      return 30
    }
  })
  const [defaultEditorMode, setDefaultEditorMode] = useState<'write' | 'markdown'>(() => {
    try {
      return (localStorage.getItem('coreforge_pref_editor_mode') as any) || 'write'
    } catch {
      return 'write'
    }
  })
  const [adminTab, setAdminTab] = useState<'student' | 'system'>('student')
  const { themeStyle, isVibrant, setThemeStyle } = useThemeStyle()

  // 考生账号安全与密码找回（密保与救援码）状态
  const [securityInfo, setSecurityInfo] = useState<{
    hasSecurityQuestion: boolean
    securityQuestion: string | null
    recoveryCode: string | null
    isDemo?: boolean
  } | null>(null)
  const [secQuestionInput, setSecQuestionInput] = useState('')
  const [secAnswerInput, setSecAnswerInput] = useState('')
  const [savingSec, setSavingSec] = useState(false)
  const [secMessage, setSecMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [showRecoveryCode, setShowRecoveryCode] = useState(false)
  const isDemoAccount = Boolean(
    (securityInfo as any)?.isDemo ||
    user?.username?.toLowerCase() === 'demo' ||
    (user as any)?.role === 'guest' ||
    user?.username?.toLowerCase() === 'test'
  )

  const loadSecuritySettings = useCallback(async () => {
    try {
      const res = await getSecuritySettings()
      setSecurityInfo(res)
      if (res.securityQuestion) {
        setSecQuestionInput(res.securityQuestion)
      }
    } catch {
      // 忽略未登录或接口错误
    }
  }, [])

  useEffect(() => {
    loadSecuritySettings()
  }, [loadSecuritySettings])

  const handleSaveSecuritySettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecMessage(null)
    if (!secQuestionInput.trim()) {
      setSecMessage({ type: 'error', text: '请填写安全密保问题' })
      return
    }
    if (!secAnswerInput.trim()) {
      setSecMessage({ type: 'error', text: '请填写安全密保答案' })
      return
    }
    setSavingSec(true)
    try {
      const res = await updateSecuritySettings({
        question: secQuestionInput.trim(),
        answer: secAnswerInput.trim(),
      })
      setSecMessage({ type: 'success', text: res.message || '安全密保设置已生效！' })
      setSecurityInfo(prev => prev ? {
        ...prev,
        hasSecurityQuestion: true,
        securityQuestion: secQuestionInput.trim(),
      } : null)
      setSecAnswerInput('')
      setTimeout(() => setSecMessage(null), 3000)
    } catch (err: any) {
      setSecMessage({ type: 'error', text: err.message || '保存密保失败' })
    } finally {
      setSavingSec(false)
    }
  }

  const handleCopyRecoveryCode = () => {
    if (isDemoAccount || !securityInfo?.recoveryCode) return
    navigator.clipboard.writeText(securityInfo.recoveryCode).then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }).catch(() => {})
  }

  const handleRegenerateRecoveryCode = async () => {
    if (isDemoAccount) return
    if (!window.confirm('重新换发专属救援码后，旧救援码将立即失效。确认换发新的安全救援码吗？')) return
    setSavingSec(true)
    try {
      const res = await updateSecuritySettings({ refreshRecoveryCode: true })
      setSecurityInfo(prev => prev ? {
        ...prev,
        recoveryCode: res.recoveryCode,
      } : null)
      setShowRecoveryCode(true)
      setSecMessage({ type: 'success', text: '已为您成功换发新的专属救援码，请妥善记录并抄写备份！' })
    } catch (err: any) {
      setSecMessage({ type: 'error', text: err.message || '换发救援码失败' })
    } finally {
      setSavingSec(false)
    }
  }


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
    if (!isAdmin) {
      setMessage({ type: 'error', text: '普通学员账号不可修改服务器系统物理路径与全局大模型密钥，仅超级管理员可操作。' })
      return
    }
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

  const handleSaveStudentPref = () => {
    try {
      localStorage.setItem('coreforge_pref_target_subject', targetSubject)
      localStorage.setItem('coreforge_pref_daily_quiz_goal', String(dailyQuizGoal))
      localStorage.setItem('coreforge_pref_daily_vocab_goal', String(dailyVocabGoal))
      localStorage.setItem('coreforge_pref_editor_mode', defaultEditorMode)
      setMessage({ type: 'success', text: '研学与备考偏好已保存！' })
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: '保存偏好设置失败' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full min-w-0 space-y-6 pb-28 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-warm-800">研学与备考设置</h1>
          <p className="text-xs text-warm-500 mt-1">
            {isAdmin ? '支持切换「考生备考偏好」与「系统底座管理」' : '定制您的 2026 考研目标科目、刷题量与笔记习惯'}
          </p>
        </div>

        {isAdmin && (
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAdminTab('student')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                adminTab === 'student' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              🎓 备考偏好
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('system')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                adminTab === 'system' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              ⚙️ 系统底座 (管理员)
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/60 border border-slate-200/80 rounded-2xl p-8 space-y-3 shadow-xs">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">正在同步研学偏好与系统配置...</span>
        </div>
      ) : (
        <>

      {/* 考生专属研学偏好面板（无任何服务器底层物理路径与端口噪音） */}
      {(!isAdmin || adminTab === 'student') && (
        <div className="space-y-5 animate-in fade-in">
          {/* 研学账号与安全沙箱 */}
          <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                <span>研学空间与个人账号</span>
              </div>
              <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                云端沙箱隔离已就绪
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <span className="text-slate-400">当前备考登录身份：</span>
                  <p className="font-bold text-slate-900 text-sm truncate">{user?.username || '未登录备考者'} <span className="text-xs text-slate-400 font-normal">({user?.role === 'admin' ? '系统站长' : '考研研学者'})</span></p>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-change-password-modal'))}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="修改当前账号的登录密码"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  <span>修改密码</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-400">研核伴学积分余额：</span>
                <p className="font-bold text-emerald-700 text-sm">{typeof user?.points === 'number' ? user.points.toFixed(1) : '5.0'} <span className="text-xs text-slate-500 font-normal">积分 (每日签到可领 1 积分)</span></p>
              </div>
            </div>
            <p className="text-2xs text-slate-400 leading-relaxed">
              🔒 隐私保证：您的自建笔记、错题本复盘记录以及每日模考成绩均受沙箱加密隔离保护，仅您个人账号可见。
            </p>
          </section>

          {/* 账号安全与密码找回（密保与专属救援码） */}
          <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>账号安全与密码找回凭证</span>
              </div>
              <span className={`text-2xs font-semibold px-2.5 py-0.5 rounded-full border ${
                securityInfo?.hasSecurityQuestion
                  ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                  : 'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
                {securityInfo?.hasSecurityQuestion ? '密保已绑定' : '建议预设密保'}
              </span>
            </div>

            {secMessage && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-1.5 ${
                secMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}>
                {secMessage.type === 'success' ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <ShieldAlert className="w-3.5 h-3.5 shrink-0" />}
                <span>{secMessage.text}</span>
              </div>
            )}

            {isDemoAccount ? (
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 space-y-2 animate-fade-in-up">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>公开演示沙箱安全防护已生效</span>
                </div>
                <p className="text-2xs text-amber-800 leading-relaxed">
                  当前账号为公共演示体验环境，系统已开启凭证隔离保护。专属恢复码与密保凭证已安全锁定隐藏，禁止公开查看或重置。如需管理个人专属安全凭据，请退出后注册属于您的独立考生账号。
                </p>
              </div>
            ) : (
              <>
                {/* 专属 8 位安全救援码卡片（默认密文脱敏，防偷窥与公开泄露） */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>专属安全救援码 (Recovery Code)</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowRecoveryCode(prev => !prev)}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        title={showRecoveryCode ? '隐藏救援码' : '显示救援码'}
                      >
                        {showRecoveryCode ? <EyeOff className="w-3 h-3 text-slate-500" /> : <Eye className="w-3 h-3 text-slate-500" />}
                        <span>{showRecoveryCode ? '隐藏' : '查看'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateRecoveryCode}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        title="换发新的救援码"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-500" />
                        <span>换发</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyRecoveryCode}
                        disabled={!securityInfo?.recoveryCode}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="点击复制救援码"
                      >
                        <Copy className="w-3 h-3 text-indigo-600" />
                        <span>{copiedCode ? '已复制！' : '复制救援码'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 font-mono text-sm font-bold text-slate-900 tracking-wider">
                    <span>
                      {showRecoveryCode
                        ? (securityInfo?.recoveryCode || '未绑定救援码')
                        : 'CF-••••-••••'}
                    </span>
                    <span className="text-2xs text-emerald-600 font-sans font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                      {showRecoveryCode ? '一键应急重置' : '密文防护中'}
                    </span>
                  </div>
                  <p className="text-2xs text-slate-400 leading-relaxed">
                    📌 提示：救援码是忘记密码时的终极应急凭据。默认脱敏显示，请点击「查看」或「换发」并在安全环境下抄写备份，切勿截图公开发布！
                  </p>
                </div>
              </>
            )}

            {/* 安全密保问答设置 */}
            <form onSubmit={handleSaveSecuritySettings} className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>绑定 / 修改安全密保问答</span>
                {securityInfo?.hasSecurityQuestion && (
                  <span className="text-2xs font-normal text-slate-400">
                    当前问题：{securityInfo.securityQuestion}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <input
                    type="text"
                    required
                    value={secQuestionInput}
                    onChange={(e) => setSecQuestionInput(e.target.value)}
                    placeholder="输入或选择密保问题 (如：我的考研目标大学是？)"
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-slate-50/50"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['我的考研目标大学是？', '我的第一志愿专业名称是？', '我的本科母校全称是？', '我的高中班主任姓名是？'].map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setSecQuestionInput(q)}
                        className="text-2xs px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                      >
                        + {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    value={secAnswerInput}
                    onChange={(e) => setSecAnswerInput(e.target.value)}
                    placeholder="设置密保问题答案 (验证时忽略大小写)"
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingSec}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {savingSec ? '正在保存...' : '保存安全密保设置'}
                </button>
              </div>
            </form>
          </section>

          {/* 备考目标学科定制 */}
          <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5 space-y-3">
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>目标专业与重点攻坚学科</span>
            </div>
            <p className="text-xs text-slate-500">
              设置后，首页做题推荐与智能导师将优先向您的目标学科倾斜：
            </p>
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {[
                { id: 'all', title: '全科双核冲刺', desc: '408 + 考研数学 + 政治' },
                { id: '408', title: '408 计算机专项', desc: '数据结构/计组/OS/计网' },
                { id: 'math', title: '考研数学统考', desc: '高数 / 线代 / 概率论' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTargetSubject(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    targetSubject === item.id
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{item.title}</div>
                  <div className="text-2xs text-slate-400 mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* 每日自律刷题与背词量 */}
          <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5 space-y-3">
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>每日自律与刷题目标</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">每日专业课真题自测数量</label>
                <select
                  value={dailyQuizGoal}
                  onChange={(e) => setDailyQuizGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value={10}>每日 10 题 (轻量巩固)</option>
                  <option value={20}>每日 20 题 (标准复习)</option>
                  <option value={30}>每日 30 题 (强化冲刺)</option>
                  <option value={50}>每日 50 题 (极限刷题)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">考研英语大纲词汇每日复盘</label>
                <select
                  value={dailyVocabGoal}
                  onChange={(e) => setDailyVocabGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                >
                  <option value={20}>每日 20 词 (基础积累)</option>
                  <option value={30}>每日 30 词 (推荐进度)</option>
                  <option value={50}>每日 50 词 (冲刺加速)</option>
                  <option value={100}>每日 100 词 (全量突击)</option>
                </select>
              </div>
            </div>
          </section>

          {/* 考研笔记与编辑器偏好 */}
          <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5 space-y-3">
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Save className="w-4 h-4 text-purple-600" />
              <span>笔记编辑器偏好</span>
            </div>
            <div className="space-y-2 text-xs">
              <label className="block text-slate-600 font-semibold">进入笔记时的默认写作模式</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDefaultEditorMode('write')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    defaultEditorMode === 'write'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">交互式富文本讲义纸</div>
                  <div className="text-2xs text-slate-400 mt-0.5">支持手写批注、实时公式与插图渲染</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDefaultEditorMode('markdown')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    defaultEditorMode === 'markdown'
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">极客 Markdown 源码模式</div>
                  <div className="text-2xs text-slate-400 mt-0.5">纯文本双链极速录入与快捷键编辑</div>
                </button>
              </div>
            </div>
          </section>

          {/* 研学视觉色彩风格偏好 */}
          <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5 space-y-3">
            <div className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>研学界面视觉风格</span>
              </div>
              <span className="text-2xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                实时生效并跨端同步
              </span>
            </div>
            <p className="text-xs text-slate-500">
              定制您偏好的工作台界面色彩风格，告别单一黑白，赋予学科鲜明生命力：
            </p>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setThemeStyle('vibrant')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isVibrant
                    ? 'border-indigo-600 bg-gradient-to-br from-indigo-50/80 via-purple-50/30 to-pink-50/20 ring-1 ring-indigo-500 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                    <span>🎨 鲜艳活力风</span>
                    <span className="text-2xs bg-indigo-600 text-white px-1.5 py-0.2 rounded font-normal">推荐</span>
                  </div>
                  {isVibrant && <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                </div>
                <div className="text-2xs text-slate-500 leading-relaxed">
                  408科技蓝、政治正气红、数学极光紫、英语薄荷绿，告别黑白沉闷，记忆更高效。
                </div>
              </button>

              <button
                type="button"
                onClick={() => setThemeStyle('minimal')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  !isVibrant
                    ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>♟️ 经典极简黑白风</span>
                  </div>
                  {!isVibrant && <CheckCircle className="w-3.5 h-3.5 text-slate-800 shrink-0" />}
                </div>
                <div className="text-2xs text-slate-500 leading-relaxed">
                  严谨冷淡灰度 Subframe 黑白极简设计，专注纯文本与低饱和沉浸排版。
                </div>
              </button>
            </div>
          </section>

          {/* 考生专属云端沙箱与隐私保护卡片 */}
          <section className="bento-card bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 border border-emerald-200/80 rounded-2xl shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>考生专属云端沙盒与数据隐私保护 (Personal Sandbox)</span>
              </div>
              <span className="text-2xs font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                物理多租户隔离已生效
              </span>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              您的双链笔记、AI 伴学档案与错题记录均存储在独享的云端安全沙箱中。系统已全面启用沙箱虚拟化机制，<b>云端服务器的底层磁盘结构与物理文件夹已对所有考生完全隔离屏蔽</b>，仅展示属于您个人的沙盒文件夹，绝无数据泄露风险。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-white/90 border border-emerald-200/60 shadow-xs">
                <div className="text-2xs text-slate-500 mb-0.5">沙箱隔离等级</div>
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>独立用户沙箱 (独占)</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/90 border border-emerald-200/60 shadow-xs">
                <div className="text-2xs text-slate-500 mb-0.5">物理路径屏蔽</div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>100% 宿主机路径脱敏</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/90 border border-emerald-200/60 shadow-xs">
                <div className="text-2xs text-slate-500 mb-0.5">离线数据自持</div>
                <div className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-teal-600" />
                  <span>支持一键导出 Zip</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-white/70 border border-emerald-100 rounded-xl p-3">
              <div className="text-xs text-slate-600">
                需要将云端编写的考研笔记同步到自己电脑本地的 Obsidian 软件？
              </div>
              <button
                type="button"
                onClick={() => {
                  const exportUrl = api.exportSandboxZipUrl ? api.exportSandboxZipUrl() : '/api/vault/export-zip';
                  const a = document.createElement('a');
                  a.href = exportUrl;
                  a.download = `CoreForge_Notes_${user?.username || 'Student'}.zip`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>一键打包导出我的笔记 (.zip)</span>
              </button>
            </div>
          </section>

          {/* 保存偏好按钮 */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveStudentPref}
              className="subframe-btn-black px-6 py-2.5 flex items-center gap-2 text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>保存备考设置</span>
            </button>
          </div>
        </div>
      )}

      {/* 仅在管理员身份且激活「系统底座」Tab 时渲染底层复杂配置 */}
      {isAdmin && adminTab === 'system' && (
        <div className="space-y-6 animate-in fade-in">
          <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-4">
              <Zap className="w-4 h-4 text-accent-amber" />
              系统底座配置状态
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <StatusCard
                label="知识库路径"
                configured={vaultConfigured}
                detail={vaultConfigured ? '安全沙箱隔离环境' : '未设置'}
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
                detail={settings?.ai?.model || currentEp?.defaultModel || (aiModelSet ? '已就绪' : '未选择')}
                configuredText={settings?.ai?.model || currentEp?.defaultModel || '已就绪'}
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
      <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-warm-700">
          <FolderOpen className="w-4 h-4 text-accent-orange" />
          Vault 配置
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-warm-500 mb-1.5 font-medium">Obsidian Vault 路径</label>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <input
                  type="text"
                  value={vaultPath}
                  onChange={(e) => setVaultPath(e.target.value)}
                  placeholder="例如: E:\我的知识库"
                  className="flex-1 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-700 text-sm placeholder:text-warm-400 focus:outline-none focus:border-accent-orange/40 focus:ring-1 focus:ring-accent-orange/15"
                />
              ) : (
                <div className="flex-1 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs font-mono select-none">
                  [云端研学知识库 · 安全沙箱隔离已就绪]
                </div>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleOpenPicker}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-warm-600 text-sm hover:text-warm-800 hover:border-cream-200 transition-colors cursor-pointer"
                  title="浏览文件夹"
                >
                  <Folder className="w-4 h-4" />
                  浏览
                </button>
              )}
            </div>
            <p className="text-2xs text-warm-400 mt-1">你的 Obsidian 笔记所在的文件夹路径</p>
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
            <p className="text-2xs text-warm-400 mt-1">
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
      <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200/60 pb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-warm-700">
            <Cpu className="w-4 h-4 text-accent-sage" />
            <span>AI 云端接口与多模型配置</span>
            <span className="text-2xs px-2 py-0.5 rounded-full bg-cream-100 text-warm-500 font-normal">
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
                    <span className="text-2xs text-amber-500" title="系统默认主接口">★</span>
                  )}
                  <span className={`text-2xs px-1.5 py-0.2 rounded-full ${
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
              <span className="text-2xs text-warm-400 font-mono">({currentEp.id})</span>
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
                  className="flex items-center gap-1 text-2xs px-2.5 py-1 rounded bg-cream-100 hover:bg-cream-200 text-warm-600 transition-colors"
                >
                  <Star className="w-3 h-3 text-warm-400" />
                  设为系统默认接口
                </button>
              ) : (
                <span className="flex items-center gap-1 text-2xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium border border-amber-500/20">
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
              <p className="text-2xs text-warm-400 mt-1">
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
              <div className="flex items-center gap-1.5 text-2xs">
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
                <p className="text-2xs text-warm-400">可拉取服务商提供的模型，或手动输入任意代号；保存后可在聊天中随意切换</p>
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
                <div className="p-2 bg-cream-100/60 flex items-center justify-between text-2xs text-warm-500 font-medium">
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
                        {m.name !== m.id && <span className="text-2xs text-warm-400 font-mono">({m.id})</span>}
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
                        className={`text-2xs px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
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
              <p className="text-2xs text-warm-400 flex items-center gap-1 py-1">
                <Loader2 className="w-3 h-3 animate-spin" /> 正在从远端接口拉取模型列表...
              </p>
            )}
            {showModelList && modelFetchError && (
              <p className="text-2xs text-red-500 py-1">{modelFetchError}</p>
            )}

            {/* 已导入模型徽章展示区 */}
            <div className="p-3 rounded-lg bg-cream-100/50 border border-cream-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-warm-700 flex items-center gap-1.5">
                  <span>「{currentEp.name}」已导入的模型</span>
                  <span className="text-2xs px-1.5 py-0.5 rounded-full bg-cream-200 text-warm-600 font-bold">
                    {currentEp.models?.length || 0}
                  </span>
                </span>
                <span className="text-2xs text-warm-400">点击 ★ 可设为此接口默认模型</span>
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
            <span className="text-2xs text-warm-400">
              配置完成后，请点击页面底部「保存设置」持久化保存所有接口
            </span>
          </div>
        </div>
      </section>

      {/* Obsidian Plugin Import */}
      <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5 space-y-4">
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
                  <div className="text-2xs text-warm-400 mt-0.5 truncate">
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

      {/* 管理员保存按钮与配置文件受控信息 */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-2xs text-slate-400 font-mono">
          [服务端系统参数已受控保护]
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="subframe-btn-black px-6 py-2.5 flex items-center gap-2 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer active:scale-95"
        >
          <Save className="w-4 h-4" />
          {saving ? '保存中...' : '保存系统设置'}
        </button>
      </div>
        </div>
      )}
        </>
      )}

      {/* Folder Picker Modal */}
      {isAdmin && showPicker && (
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-cream-200 rounded-2xl w-full max-w-[480px] max-h-[85dvh] flex flex-col shadow-xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-cream-200 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Folder className="w-4 h-4 text-accent-orange shrink-0" />
            <span className="text-sm font-semibold text-warm-800 truncate">选择知识库文件夹</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-warm-400 hover:text-warm-600 hover:bg-cream-200 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current path */}
        {currentPath && (
          <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-cream-100/60 border-b border-cream-200 shrink-0">
            {parent && (
              <button
                onClick={() => browse(parent)}
                className="flex items-center gap-1 text-xs text-accent-orange hover:text-accent-orange/80 font-medium transition-colors shrink-0"
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
        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2" style={{ WebkitOverflowScrolling: 'touch' }}>
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
                <ChevronRight className="w-3.5 h-3.5 text-warm-300 group-hover:text-warm-500 transition-colors shrink-0" />
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-cream-200 bg-cream-50/50 shrink-0">
          <div className="text-2xs text-warm-400 truncate max-w-full sm:max-w-[240px]">
            {currentPath ? `当前: ${currentPath}` : '请选择一个磁盘或文件夹'}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs text-warm-500 hover:text-warm-700 hover:bg-cream-200 transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={() => currentPath && onSelect(currentPath)}
              disabled={!currentPath}
              className="px-4 py-1.5 rounded-lg bg-accent-orange text-white text-xs font-medium hover:bg-accent-orange/85 shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              选择此文件夹
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
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
      <div className={`text-2xs truncate ${configured ? 'text-accent-sage/80' : 'text-warm-400'}`}>
        {configured ? configuredText : detail}
      </div>
    </div>
  )
}
