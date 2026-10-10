import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Send, Loader2, FolderTree, X, Wrench, ChevronDown,
  Plus, Trash2, MessageSquare, Save, Sparkles, CheckCircle2, Target,
  Copy, Check, Bot, FileText, Brain, RefreshCw, Settings, Users,
  FolderPlus, Folder, Square, Layers, Globe, Edit3, Undo2, RotateCcw, Play
} from 'lucide-react'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { api, type FileDetail, type LocalAgentStatus, type LocalSkill, type AppSettings, type CloudEndpoint } from '../services/api'
import {
  loadWorkspace,
  saveWorkspace,
  createProject,
  deleteProject,
  type AIProject,
  DEFAULT_PROJECT_ID,
} from '../services/ai-workspace'
import { useVaultTree } from '../hooks/useVaultData'
import FileExplorer from '../components/FileExplorer'
import LuluAvatar from '../components/Pet/LuluAvatar'
import { STUDY_SKILLS, type StudySkill } from '../data/studySkills'
import { STUDY_AGENTS, type StudyAgent } from '../data/studyAgents'
import { extractFollowUpPrompts, getRandomPromptsForAgent } from '../data/studyPrompts'
import QuickPracticeModal from '../components/QuickPracticeModal'
import AIMemoryModal from '../components/AIMemoryModal'
import LocalSkillPickerModal from '../components/LocalSkillPickerModal'
import ModelManagerModal from '../components/ModelManagerModal'
import StepTutorModal from '../components/study/StepTutorModal'
import MemoryTierModal from '../components/MemoryTierModal'

interface ToolCallInfo {
  tool: string
  input: Record<string, any>
  output?: string
  success?: boolean
}

export interface PeerAgentResponse {
  agentName: string
  agentIcon: string
  provider: ProviderType
  model: string
  content: string
  streaming?: boolean
  error?: string
}

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentName?: string
  agentIcon?: string
  provider?: ProviderType
  model?: string
  toolCalls: ToolCallInfo[]
  citedNotes?: { title: string; path: string; excerpt: string; tags: string[] }[]
  timestamp: Date
  streaming?: boolean
  isDual?: boolean
  peerResponse?: PeerAgentResponse
}

interface Conversation {
  id: string
  projectId?: string
  title: string
  messages: AgentMessage[]
  createdAt: Date
  provider?: ProviderType
  model?: string
  agentId?: string
}

type ProviderType = 'antigravity' | 'codex' | 'claude-code' | 'web'

const PROVIDER_PRESET_MODELS: Record<ProviderType, string[]> = {
  antigravity: ['gemini-3.8-flash', 'gemini-2.5-pro', 'gemini-2.5-flash'],
  codex: ['gpt-6-luna', 'gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.5', 'o3-mini'],
  'claude-code': ['deepseek-flash', 'deepseek-reasoner', 'claude-3-7-sonnet', 'claude-3-5-sonnet'],
  web: ['deepseek-flash', 'deepseek-reasoner', 'deepseek-chat'],
}

export default function Chat() {
  // 项目工作区管理状态
  const [workspace, setWorkspace] = useState(() => loadWorkspace())
  const activeProject = useMemo(() => {
    return workspace.projects.find(p => p.id === workspace.activeProjectId) || workspace.projects[0]
  }, [workspace])
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newProjectCwd, setNewProjectCwd] = useState('')
  const [showMemoryTierModal, setShowMemoryTierModal] = useState(false)

  // 核心：按会话隔离记录各自独立的运行状态与提示信息
  const [runningConvs, setRunningConvs] = useState<Record<string, { status: string; streaming: boolean }>>({})
  // 按会话独立隔离的 AbortController 集合
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('coreforge_study_conversations')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => ({
            ...c,
            projectId: c.projectId || DEFAULT_PROJECT_ID,
            createdAt: new Date(c.createdAt || Date.now()),
            messages: (c.messages || []).map((m: any) => ({
              ...m,
              timestamp: new Date(m.timestamp || Date.now()),
            }))
          }))
        }
      }
    } catch {}
    return []
  })
  const [activeConvId, setActiveConvId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('coreforge_study_conversations')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed[0]?.id) return parsed[0].id
      }
    } catch {}
    return ''
  })
  const [input, setInput] = useState('')

  // Agent Selection state
  const [activeAgent, setActiveAgent] = useState<StudyAgent>(() => STUDY_AGENTS[0])

  // Model & Provider Selection state
  const [provider, setProvider] = useState<ProviderType>(() => {
    return (localStorage.getItem('coreforge_active_provider') as ProviderType) || 'antigravity'
  })
  const [agents, setAgents] = useState<LocalAgentStatus[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [customModelInput, setCustomModelInput] = useState('')
  const [isCustomModel, setIsCustomModel] = useState(false)
  const [loadingAgents, setLoadingAgents] = useState(false)

  // Local Skills & Memory Hub state
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [selectedLocalSkill, setSelectedLocalSkill] = useState<LocalSkill | null>(null)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [showModelManagerModal, setShowModelManagerModal] = useState(false)
  const [syncingModels, setSyncingModels] = useState(false)
  const [modelSyncFeedback, setModelSyncFeedback] = useState<string | null>(null)
  const [webModels, setWebModels] = useState<string[]>([])
  const [cloudEndpoints, setCloudEndpoints] = useState<CloudEndpoint[]>([])
  const [cloudSettings, setCloudSettings] = useState<AppSettings['ai'] | null>(null)

  // Built-in Skill state
  const [activeSkill, setActiveSkill] = useState<StudySkill | null>(null)
  const [showSkillsMenu, setShowSkillsMenu] = useState(false)

  // Study Tone / Mode
  const [studyTone, setStudyTone] = useState<'rigorous' | 'vivid' | 'exam'>('rigorous')

  // 双智能体/多智能体协同研讨 (Dual-Agent Arena) 模式状态
  const [isDualMode, setIsDualMode] = useState<boolean>(() => {
    return localStorage.getItem('coreforge_dual_agent_mode') === 'true'
  })
  const [peerAgent, setPeerAgent] = useState<StudyAgent>(() => {
    const savedId = localStorage.getItem('coreforge_peer_agent_id')
    return STUDY_AGENTS.find(a => a.id === savedId) || STUDY_AGENTS[1] || STUDY_AGENTS[0]
  })
  const [peerProvider, setPeerProvider] = useState<ProviderType>(() => {
    return (localStorage.getItem('coreforge_peer_provider') as ProviderType) || 'claude-code'
  })
  const [peerModel, setPeerModel] = useState<string>(() => {
    return localStorage.getItem('coreforge_peer_model') || 'deepseek-flash'
  })

  // UI state
  const [showFiles, setShowFiles] = useState(false)
  const [showSessions, setShowSessions] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : false)
  const [selectedNote, setSelectedNote] = useState<FileDetail | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false)
  const [showAgentPicker, setShowAgentPicker] = useState(false)

  // Quick Practice Modal state
  const [practiceModalOpen, setPracticeModalOpen] = useState(false)
  const [practiceData, setPracticeData] = useState<{ title: string; content: string }>({
    title: '', content: ''
  })
  const [stepTutorOpen, setStepTutorOpen] = useState(false)

  // 动态发散提问与考点轮换状态
  const [promptsList, setPromptsList] = useState<string[]>(() => activeAgent.quickPrompts || [])
  const [promptLabel, setPromptLabel] = useState<string>('考点速问:')
  const [promptTopic, setPromptTopic] = useState<string | null>(null)
  const [isRefreshingPrompts, setIsRefreshingPrompts] = useState<boolean>(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { tree } = useVaultTree()

  // Get active conversation
  const activeConv = conversations.find(c => c.id === activeConvId)
  const messages = activeConv?.messages || []
  const isCurrentRunning = Boolean(runningConvs[activeConvId]?.streaming)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // 刷新发散提问或考点速问
  const handleRefreshPrompts = useCallback((forceRandom = true) => {
    setIsRefreshingPrompts(true)
    setTimeout(() => {
      // 1. 如果没有强制随机，且有关联笔记，围绕笔记发散
      if (!forceRandom && selectedNote) {
        const noteText = `${selectedNote.title || ''} ${selectedNote.content ? selectedNote.content.slice(0, 500) : ''}`
        const matched = extractFollowUpPrompts(noteText, activeAgent.domain)
        if (matched && matched.prompts.length > 0) {
          setPromptsList(matched.prompts)
          setPromptLabel('📝 笔记发散:')
          setPromptTopic(matched.topic)
          setIsRefreshingPrompts(false)
          return
        }
      }

      // 2. 如果没有强制随机，且有对话历史，围绕对话历史提取发散
      const validMsgs = messages.filter(m => m.id !== 'welcome' && m.content)
      if (!forceRandom && validMsgs.length > 0) {
        const lastUser = [...validMsgs].reverse().find(m => m.role === 'user')
        const lastAss = [...validMsgs].reverse().find(m => m.role === 'assistant')
        const combined = `${lastUser?.content || ''} ${lastAss?.content ? lastAss.content.slice(0, 600) : ''}`
        const matched = extractFollowUpPrompts(combined, activeAgent.domain)
        if (matched && matched.prompts.length > 0) {
          setPromptsList(matched.prompts)
          setPromptLabel('✨ 深度发散:')
          setPromptTopic(matched.topic)
          setIsRefreshingPrompts(false)
          return
        }
      }

      // 3. 随机轮换考点
      const randomSet = getRandomPromptsForAgent(activeAgent.id, 4)
      setPromptsList(randomSet)
      setPromptLabel(validMsgs.length > 0 ? '✨ 考点延伸:' : '考点速问:')
      setPromptTopic(null)
      setIsRefreshingPrompts(false)
    }, 200)
  }, [selectedNote, messages, activeAgent])

  // 当切换智能体、会话或关联笔记时，自适应更新发散提问
  useEffect(() => {
    handleRefreshPrompts(false)
  }, [activeConvId, activeAgent.id, selectedNote?.path])

  // Compute dynamically available models for current provider
  const currentAvailableModels = useMemo(() => {
    if (provider === 'web') {
      if (webModels.length > 0) return webModels
      if (cloudSettings?.models && cloudSettings.models.length > 0) return cloudSettings.models
      if (cloudSettings?.model) return [cloudSettings.model]
      return []
    }
    const active = agents.find(a => a.provider === provider)
    if (active?.models && active.models.length > 0) {
      return active.models
    }
    return PROVIDER_PRESET_MODELS[provider] || []
  }, [agents, provider, webModels, cloudSettings])

  const activeAgentStatus = agents.find(a => a.provider === provider)

  // 动态扫描：根据当前选中的引擎/模式来执行对应的扫描逻辑
  const handleScanModels = async () => {
    setSyncingModels(true)
    setModelSyncFeedback(null)
    try {
      if (provider === 'web') {
        const currentSettings = await api.getSettings()
        const eps = currentSettings.ai?.endpoints || []

        if (eps.length > 0) {
          // 找出当前选中的模型所属的 endpoint
          let targetEp = eps.find(e => e.id === currentSettings.ai?.activeEndpointId) || eps[0]
          if (selectedModel && selectedModel.includes('::')) {
            const [epId] = selectedModel.split('::')
            const found = eps.find(e => e.id === epId)
            if (found) targetEp = found
          }

          const res = await api.fetchAIModels({
            endpointId: targetEp.id,
            baseURL: targetEp.baseURL,
            apiKey: targetEp.apiKey,
          })
          const fetchedIds = (res.models || []).map(m => m.id)
          if (fetchedIds.length === 0) {
            setModelSyncFeedback(`未从「${targetEp.name}」扫描到可用模型，请检查该接口配置`)
          } else {
            const updatedEndpoints = eps.map(e => {
              if (e.id === targetEp.id) {
                return {
                  ...e,
                  models: fetchedIds,
                  defaultModel: (e.defaultModel && fetchedIds.includes(e.defaultModel)) ? e.defaultModel : fetchedIds[0]
                }
              }
              return e
            })

            await api.updateSettings({
              ai: {
                ...currentSettings.ai!,
                endpoints: updatedEndpoints,
              }
            })

            setCloudEndpoints(updatedEndpoints)
            const allAggregated: string[] = []
            for (const e of updatedEndpoints) {
              for (const m of e.models) {
                allAggregated.push(`${e.id}::${m}`)
              }
            }
            setWebModels(allAggregated)
            const nextOption = `${targetEp.id}::${fetchedIds[0]}`
            setSelectedModel(nextOption)
            localStorage.setItem('coreforge_model_web', nextOption)
            setModelSyncFeedback(`已从「${targetEp.name}」真实扫描到 ${fetchedIds.length} 个模型：${fetchedIds.join(', ')}`)
          }
        } else {
          // 单接口兼容模式
          const res = await api.fetchAIModels()
          const fetchedIds = (res.models || []).map(m => m.id)
          if (fetchedIds.length === 0) {
            setModelSyncFeedback('未扫描到云端可用模型，请检查设置中的 API 密钥与地址')
          } else {
            setWebModels(fetchedIds)
            if (currentSettings.ai) {
              await api.updateSettings({
                ai: {
                  ...currentSettings.ai,
                  models: fetchedIds,
                  model: fetchedIds[0],
                }
              })
            }
            setSelectedModel(fetchedIds[0])
            localStorage.setItem('coreforge_model_web', fetchedIds[0])
            setModelSyncFeedback(`已从云端 API 真实扫描到 ${fetchedIds.length} 个模型：${fetchedIds.join(', ')}`)
          }
        }
      } else {
        // 本地引擎模式（Codex 或 Claude Code）：扫描本机已配置的本地模型
        const res = await api.syncLocalAgentModels()
        if (res.agents) {
          setAgents(res.agents)
          const active = res.agents.find(a => a.provider === provider)
          if (active?.models && active.models.length > 0) {
            if (!active.models.includes(selectedModel)) {
              setSelectedModel(active.models[0])
              localStorage.setItem(`coreforge_model_${provider}`, active.models[0])
            }
            const pName = provider === 'codex' ? 'Codex' : 'Claude Code'
            setModelSyncFeedback(`已从本机 ${pName} 真实探测到 ${active.models.length} 个模型：${active.models.join(', ')}`)
          } else {
            setModelSyncFeedback(`未从本机检测到 ${provider} 可用模型`)
          }
        }
      }
      setTimeout(() => setModelSyncFeedback(null), 5000)
    } catch (err: any) {
      setModelSyncFeedback(`扫描失败: ${err.message}`)
      setTimeout(() => setModelSyncFeedback(null), 4000)
    } finally {
      setSyncingModels(false)
    }
  }

  const handleDeleteCurrentModel = async () => {
    if (!selectedModel || selectedModel === '__custom__') return
    const displayName = selectedModel.includes('::') ? selectedModel.split('::')[1] : selectedModel
    if (!window.confirm(`确定要从下拉列表中删除模型「${displayName}」吗？`)) return
    try {
      if (provider === 'web') {
        const currentSettings = await api.getSettings()
        const eps = currentSettings.ai?.endpoints || []

        if (eps.length > 0 && selectedModel.includes('::')) {
          const [epId, mName] = selectedModel.split('::')
          const updatedEndpoints = eps.map(e => {
            if (e.id === epId) {
              const nextM = (e.models || []).filter(m => m !== mName)
              return {
                ...e,
                models: nextM,
                defaultModel: e.defaultModel === mName ? (nextM[0] || '') : e.defaultModel,
              }
            }
            return e
          })

          await api.updateSettings({
            ai: {
              ...currentSettings.ai!,
              endpoints: updatedEndpoints,
            }
          })
          setCloudEndpoints(updatedEndpoints)
          const allAggregated: string[] = []
          for (const e of updatedEndpoints) {
            for (const m of e.models) {
              allAggregated.push(`${e.id}::${m}`)
            }
          }
          setWebModels(allAggregated)
          setSelectedModel(allAggregated[0] || '')
          localStorage.setItem('coreforge_model_web', allAggregated[0] || '')
          setModelSyncFeedback(`已删除模型 ${mName}`)
        } else {
          const next = webModels.filter(m => m !== selectedModel)
          setWebModels(next)
          if (currentSettings.ai) {
            await api.updateSettings({
              ai: {
                ...currentSettings.ai,
                models: next,
                model: next[0] || '',
              }
            })
          }
          setSelectedModel(next[0] || '')
          localStorage.setItem('coreforge_model_web', next[0] || '')
          setModelSyncFeedback(`已删除模型 ${displayName}`)
        }
        setTimeout(() => setModelSyncFeedback(null), 3000)
        return
      }

      const res = await api.deleteLocalModel(selectedModel)
      if (res.success && res.agents) {
        setAgents(res.agents)
        const active = res.agents.find(a => a.provider === provider)
        if (active?.models && active.models.length > 0) {
          setSelectedModel(active.models[0])
          localStorage.setItem(`coreforge_model_${provider}`, active.models[0])
        } else {
          setSelectedModel('')
        }
        setModelSyncFeedback(`已删除模型 ${selectedModel}`)
        setTimeout(() => setModelSyncFeedback(null), 3000)
      }
    } catch (err: any) {
      alert(`删除模型失败: ${err.message}`)
    }
  }

  const handleWebModelsUpdated = async (updated: string[]) => {
    setWebModels(updated)
    try {
      const currentSettings = await api.getSettings()
      if (currentSettings.ai) {
        await api.updateSettings({
          ai: {
            ...currentSettings.ai,
            models: updated,
            model: updated.includes(selectedModel) ? selectedModel : (updated[0] || ''),
          }
        })
      }
    } catch {}
    if (!updated.includes(selectedModel)) {
      setSelectedModel(updated[0] || '')
      localStorage.setItem('coreforge_model_web', updated[0] || '')
    }
  }

  // Fetch agent status & auto-select models
  const fetchAgentStatus = useCallback(async () => {
    setLoadingAgents(true)
    try {
      // 1. 获取本地智能体状态
      const data = await api.getLocalAgentStatus()
      setAgents(data.agents)

      // 2. 同时获取设置中的云端大模型配置
      let cloudModList: string[] = []
      let cloudDefault = ''
      try {
        const s = await api.getSettings()
        setCloudSettings(s.ai || null)
        if (s.ai?.endpoints && s.ai.endpoints.length > 0) {
          setCloudEndpoints(s.ai.endpoints)
          for (const ep of s.ai.endpoints) {
            const epModels = ep.models || (ep.defaultModel ? [ep.defaultModel] : [])
            for (const m of epModels) {
              cloudModList.push(`${ep.id}::${m}`)
            }
          }
          const activeEp = s.ai.endpoints.find(e => e.id === s.ai?.activeEndpointId) || s.ai.endpoints[0]
          cloudDefault = activeEp ? (activeEp.defaultModel ? `${activeEp.id}::${activeEp.defaultModel}` : (activeEp.models?.[0] ? `${activeEp.id}::${activeEp.models[0]}` : '')) : ''
        } else {
          cloudDefault = s.ai?.model || ''
          cloudModList = s.ai?.models && s.ai.models.length > 0
            ? s.ai.models
            : (s.ai?.model ? [s.ai.model] : [])
        }
        if (cloudModList.length > 0) {
          setWebModels(cloudModList)
        }
      } catch {}

      const antigravityAgent = data.agents.find(a => a.provider === 'antigravity')
      const codexAgent = data.agents.find(a => a.provider === 'codex')
      const claudeAgent = data.agents.find(a => a.provider === 'claude-code')

      let currentProv = provider
      if (currentProv === 'antigravity' && !antigravityAgent?.available) {
        if (claudeAgent?.available) {
          currentProv = 'claude-code'
          setProvider('claude-code')
        } else if (codexAgent?.available) {
          currentProv = 'codex'
          setProvider('codex')
        } else {
          currentProv = 'web'
          setProvider('web')
        }
      } else if (currentProv === 'codex' && !codexAgent?.available) {
        if (antigravityAgent?.available) {
          currentProv = 'antigravity'
          setProvider('antigravity')
        } else if (claudeAgent?.available) {
          currentProv = 'claude-code'
          setProvider('claude-code')
        } else {
          currentProv = 'web'
          setProvider('web')
        }
      } else if (!antigravityAgent?.available && !codexAgent?.available && !claudeAgent?.available) {
        currentProv = 'web'
        setProvider('web')
      }

      const savedModel = localStorage.getItem(`coreforge_model_${currentProv}`)
      let availableModels: string[] = []
      if (currentProv === 'web') {
        availableModels = cloudModList.length > 0 ? cloudModList : (cloudDefault ? [cloudDefault] : [])
      } else {
        const activeObj = data.agents.find(a => a.provider === currentProv)
        availableModels = (activeObj?.models && activeObj.models.length > 0)
          ? activeObj.models
          : PROVIDER_PRESET_MODELS[currentProv]
      }

      if (savedModel && (availableModels.includes(savedModel) || savedModel.length > 0)) {
        setSelectedModel(savedModel)
        setIsCustomModel(!availableModels.includes(savedModel))
        if (!availableModels.includes(savedModel)) setCustomModelInput(savedModel)
      } else {
        const defaultChoice = currentProv === 'web'
          ? (cloudDefault || availableModels[0] || '')
          : (availableModels[0] || 'default')
        setSelectedModel(defaultChoice)
        setIsCustomModel(false)
      }
    } catch {
      setSelectedModel(provider === 'web' ? '' : (PROVIDER_PRESET_MODELS[provider]?.[0] || ''))
    } finally {
      setLoadingAgents(false)
    }
  }, [provider])

  useEffect(() => {
    fetchAgentStatus()
  }, [fetchAgentStatus])

  const handleProviderChange = (newProv: ProviderType) => {
    setProvider(newProv)
    localStorage.setItem('coreforge_active_provider', newProv)
    const savedModel = localStorage.getItem(`coreforge_model_${newProv}`)
    let available: string[] = []
    if (newProv === 'web') {
      available = webModels.length > 0
        ? webModels
        : (cloudSettings?.models && cloudSettings.models.length > 0
            ? cloudSettings.models
            : (cloudSettings?.model ? [cloudSettings.model] : []))
    } else {
      const activeObj = agents.find(a => a.provider === newProv)
      available = (activeObj?.models && activeObj.models.length > 0) ? activeObj.models : PROVIDER_PRESET_MODELS[newProv]
    }

    let finalModel = ''
    if (savedModel && (available.includes(savedModel) || savedModel.length > 0)) {
      finalModel = savedModel
      setSelectedModel(savedModel)
      setIsCustomModel(!available.includes(savedModel))
      if (!available.includes(savedModel)) setCustomModelInput(savedModel)
    } else {
      finalModel = newProv === 'web' ? (available[0] || cloudSettings?.model || '') : (available[0] || '')
      setSelectedModel(finalModel)
      setIsCustomModel(false)
    }

    if (activeConvId) {
      updateConversation(activeConvId, conv => ({
        ...conv,
        provider: newProv,
        model: finalModel,
      }))
    }
  }

  const handleModelSelect = (model: string) => {
    if (model === '__custom__') {
      setIsCustomModel(true)
      setSelectedModel(customModelInput || '')
    } else {
      setIsCustomModel(false)
      setSelectedModel(model)
      localStorage.setItem(`coreforge_model_${provider}`, model)
      if (activeConvId) {
        updateConversation(activeConvId, conv => ({
          ...conv,
          model,
        }))
      }
    }
  }

  const handleCustomModelConfirm = () => {
    if (customModelInput.trim()) {
      const val = customModelInput.trim()
      setSelectedModel(val)
      localStorage.setItem(`coreforge_model_${provider}`, val)
      if (activeConvId) {
        updateConversation(activeConvId, conv => ({
          ...conv,
          model: val,
        }))
      }
    }
  }


  // 核心：点击切换会话时，自动无缝恢复该会话当时绑定的引擎、模型与智能体！
  const handleSelectConversation = useCallback((convId: string) => {
    setActiveConvId(convId)
    const target = conversations.find(c => c.id === convId)
    if (target) {
      if (target.provider) {
        setProvider(target.provider)
        localStorage.setItem('coreforge_active_provider', target.provider)
      }
      if (target.model) {
        setSelectedModel(target.model)
        if (target.provider) {
          localStorage.setItem(`coreforge_model_${target.provider}`, target.model)
        }
      }
      if (target.agentId) {
        const matched = STUDY_AGENTS.find(a => a.id === target.agentId)
        if (matched) setActiveAgent(matched)
      }
    }
  }, [conversations])

  // 当前活动项目下的专属会话列表（项目间会话严格物理隔离）
  const projectConversations = useMemo(() => {
    const currentProjId = activeProject?.id || DEFAULT_PROJECT_ID
    return conversations.filter(c => (c.projectId || DEFAULT_PROJECT_ID) === currentProjId)
  }, [conversations, activeProject])


  // 切换项目处理（同时隔离更新当前项目的活动会话）
  const handleSelectProject = useCallback((projectId: string) => {
    setWorkspace(prev => {
      const next = { ...prev, activeProjectId: projectId }
      saveWorkspace(next)
      return next
    })
    const matched = conversations.filter(c => (c.projectId || DEFAULT_PROJECT_ID) === projectId)
    if (matched.length > 0) {
      handleSelectConversation(matched[0].id)
    } else {
      // 该项目下尚无会话，自动创建首个专属会话
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}`
      const p = workspace.projects.find(x => x.id === projectId)
      const newConv: Conversation = {
        id: newId,
        projectId,
        title: `${p?.name || '新项目'} 专属对话`,
        provider,
        model: selectedModel,
        agentId: activeAgent.id,
        messages: [{
          id: 'welcome',
          role: 'assistant',
          agentName: activeAgent.name,
          agentIcon: activeAgent.icon,
          content: `你好！已进入专属项目「${p?.name || '未命名'}」。\n${p?.description ? `📌 **项目说明**：${p.description}\n` : ''}${p?.cwd ? `📁 **独立工作目录**：\`${p.cwd}\`\n` : ''}\n该项目下的会话、执行流与长效记忆完全独立隔离，请随时向我提问！`,
          toolCalls: [],
          timestamp: new Date(),
        }],
        createdAt: new Date(),
      }
      setConversations(prev => [newConv, ...prev])
      setActiveConvId(newId)
    }
  }, [conversations, handleSelectConversation, activeAgent, provider, selectedModel, workspace.projects])

  // 创建新项目表单提交
  const handleCreateProjectSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    const nextWs = createProject(workspace, newProjectName.trim(), newProjectDesc.trim(), newProjectCwd.trim())
    setWorkspace(nextWs)
    saveWorkspace(nextWs)
    setNewProjectName('')
    setNewProjectDesc('')
    setNewProjectCwd('')
    setShowProjectModal(false)
    handleSelectProject(nextWs.activeProjectId)
  }, [workspace, newProjectName, newProjectDesc, newProjectCwd, handleSelectProject])

  // 更新当前项目的专属领域记忆与说明
  const handleUpdateProjectDesc = useCallback((newDesc: string) => {
    setWorkspace(prev => {
      const nextProjects = prev.projects.map(p => p.id === (activeProject?.id || DEFAULT_PROJECT_ID) ? { ...p, description: newDesc } : p)
      const nextWs = { ...prev, projects: nextProjects }
      saveWorkspace(nextWs)
      return nextWs
    })
  }, [activeProject?.id])

  // 独立终止特定会话的后台执行流，绝不影响其他对话
  const handleStopConversation = useCallback((convIdToStop: string) => {
    const ctrl = abortControllersRef.current.get(convIdToStop)
    if (ctrl) {
      ctrl.abort()
      abortControllersRef.current.delete(convIdToStop)
    }
    setRunningConvs(prev => {
      const next = { ...prev }
      delete next[convIdToStop]
      return next
    })
    setConversations(prev => prev.map(c => c.id === convIdToStop ? {
      ...c,
      messages: c.messages.map(m => m.streaming ? { ...m, streaming: false } : m)
    } : c))
  }, [])

  // Create new conversation - 严格绑定当前活动项目
  const createConversation = useCallback((initialAgent = activeAgent, initProvider = provider, initModel = selectedModel) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `conv-${Date.now()}`
    const currentProjId = activeProject?.id || DEFAULT_PROJECT_ID
    const newConv: Conversation = {
      id,
      projectId: currentProjId,
      title: `${initialAgent.name} 专属伴学`,
      provider: initProvider,
      model: initModel,
      agentId: initialAgent.id,
      messages: [{
        id: 'welcome',
        role: 'assistant',
        agentName: initialAgent.name,
        agentIcon: initialAgent.icon,
        content: `你好！我是你的 ${initialAgent.title}「${initialAgent.name}」${initialAgent.icon}。\n\n${initialAgent.description}\n\n💡 **已为你量身就绪**：\n- **所属项目**：${activeProject?.name || '当前知识库'}\n- **智能体定位**：${initialAgent.role}\n- **模型引擎**：自由切换 Antigravity / Claude Code / Codex / 云端双核\n- **免插件研学技能**：支持直接一键调用大纲重构、图谱双链、定理挖空、错题诊断！\n\n试着向我提问，或点击下方快捷考点直接开始研学！`,
        toolCalls: [],
        timestamp: new Date(),
      }],
      createdAt: new Date(),
    }
    setConversations(prev => [newConv, ...prev])
    setActiveConvId(id)
  }, [activeAgent, provider, selectedModel, activeProject])

  // 本地自动持久化会话列表
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem('coreforge_study_conversations', JSON.stringify(conversations.slice(0, 50)))
      } catch {}
    }
  }, [conversations])

  // Handle prefilled prompt from Study center or other pages
  useEffect(() => {
    const prefilled = sessionStorage.getItem('prefilled_chat_prompt')
    if (prefilled) {
      sessionStorage.removeItem('prefilled_chat_prompt')
      setInput(prefilled)
      if (conversations.length === 0) {
        createConversation()
      }
    } else if (conversations.length === 0) {
      createConversation()
    }
  }, [conversations.length, createConversation])

  const updateConversation = useCallback((convId: string, updater: (conv: Conversation) => Conversation) => {
    setConversations(prev => prev.map(c => c.id === convId ? updater(c) : c))
  }, [])

  const deleteConversation = useCallback((convId: string) => {
    // 若正在运行，先停止
    handleStopConversation(convId)
    setConversations(prev => {
      const next = prev.filter(c => c.id !== convId)
      if (activeConvId === convId && next.length > 0) {
        setActiveConvId(next[0].id)
      } else if (next.length === 0) {
        setActiveConvId('')
      }
      return next
    })
  }, [activeConvId, handleStopConversation])

  const handleSend = async (overridePrompt?: string) => {
    const text = (overridePrompt || input).trim()
    const convId = activeConvId
    if (!text || !convId || runningConvs[convId]?.streaming) return

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      toolCalls: [],
      timestamp: new Date(),
    }

    const assistantMsgId = `assistant-${Date.now()}`
    const assistantMsg: AgentMessage = {
      id: assistantMsgId,
      role: 'assistant',
      agentName: activeAgent.name,
      agentIcon: activeAgent.icon,
      content: '',
      toolCalls: [],
      timestamp: new Date(),
      streaming: true,
    }

    updateConversation(convId, conv => ({
      ...conv,
      messages: [...conv.messages, userMsg, assistantMsg],
      title: conv.messages.length <= 1 ? text.substring(0, 26) : conv.title,
    }))

    setInput('')
    const initStatus = `正在调取【${activeAgent.name}】(${provider}) 进行深度研学推演...`
    setRunningConvs(prev => ({
      ...prev,
      [convId]: { status: initStatus, streaming: true },
    }))

    let accumulatedAssistantText = ''
    const convController = new AbortController()
    abortControllersRef.current.set(convId, convController)

    // Construct tone instruction
    let toneInstruction = ''
    if (studyTone === 'rigorous') toneInstruction = '【作答风格要求】：学术严谨模式，考纲对齐，公式推导严谨规范，杜绝一切幻觉。'
    else if (studyTone === 'vivid') toneInstruction = '【作答风格要求】：通俗直观模式，多打比方与生动类比，帮助快速构建底层脑海图景。'
    else toneInstruction = '【作答风格要求】：考场冲刺模式，直击采分点与答题模板，快速提炼考场必背避坑口诀。'

    const executeStreamRequest = async (
      tgtProvider: ProviderType,
      tgtModel: string,
      tgtAgent: StudyAgent,
      onDelta: (delta: string) => void,
      onStatus?: (st: string) => void,
      onDone?: () => void,
      onErrorMsg?: (err: string) => void
    ) => {
      try {
        const endpoint = '/api/local-agents/chat'
        const skillPrompt = selectedLocalSkill
          ? `【启用本地技能: ${selectedLocalSkill.displayName} (${selectedLocalSkill.name})】\n${selectedLocalSkill.instructions}`
          : (activeSkill?.prompt || undefined)

        const currentConv = conversations.find(c => c.id === convId)
        const history = (currentConv?.messages || [])
          .filter(m => m.content && m.content.trim().length > 0 && (m.role === 'user' || m.role === 'assistant') && m.id !== 'welcome')
          .slice(-16)
          .map(m => ({
            role: m.role,
            content: m.content,
          }))

        const body = {
          provider: tgtProvider,
          prompt: text,
          model: tgtModel || undefined,
          sessionId: convId,
          history,
          skillPrompt,
          agentPrompt: `${tgtAgent.systemPrompt}\n${toneInstruction}`,
          projectName: activeProject?.name || '考研 408 & 数学研学工作台',
          projectDescription: activeProject?.description || '',
          cwd: activeProject?.cwd || undefined,
          pageContext: `AI 伴学主页面 (${tgtAgent.name})`,
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: convController.signal,
        })

        if (!res.ok) {
          throw new Error(`服务响应异常: HTTP ${res.status}`)
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('流式传输不可用')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data: ')) continue
            const jsonStr = trimmed.slice(6)

            try {
              const event = JSON.parse(jsonStr)
              if (event.type === 'text' && event.content) {
                onDelta(event.content)
              } else if (event.type === 'status' && event.content) {
                onStatus?.(event.content)
              } else if (event.type === 'done') {
                onDone?.()
              } else if (event.type === 'error') {
                onErrorMsg?.(event.content || '智能体执行异常')
              }
            } catch {}
          }
        }
        onDone?.()
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          onErrorMsg?.(err.message || '网络连接异常')
        }
      }
    }

    const applyDynamicFollowups = (inputText: string, responseText: string) => {
      const combined = `${inputText} ${responseText}`
      const matched = extractFollowUpPrompts(combined, activeAgent.domain)
      if (matched && matched.prompts.length > 0) {
        setPromptsList(matched.prompts)
        setPromptLabel('✨ 深度发散:')
        setPromptTopic(matched.topic)
      } else {
        const fallbackSet = getRandomPromptsForAgent(activeAgent.id, 4)
        setPromptsList(fallbackSet)
        setPromptLabel('✨ 考点延伸:')
        setPromptTopic(null)
      }

      fetch('/api/local-agents/generate-followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputText,
          lastResponse: responseText.slice(0, 800),
          noteTitle: selectedNote?.title,
        }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && Array.isArray(data.followups) && data.followups.length >= 2) {
            setPromptsList(data.followups)
            setPromptLabel('✨ 深度发散:')
            setPromptTopic('AI 定向')
          }
        })
        .catch(() => {})
    }

    if (isDualMode) {
      // ===== 双智能体协同研讨 (Dual Arena) 模式 =====
      const pModel = peerModel || (peerProvider === 'codex' ? 'gpt-6-luna' : peerProvider === 'claude-code' ? 'deepseek-flash' : 'deepseek-chat')
      const dualAssistantMsg: AgentMessage = {
        id: assistantMsgId,
        role: 'assistant',
        agentName: activeAgent.name,
        agentIcon: activeAgent.icon,
        provider,
        model: selectedModel,
        content: '',
        toolCalls: [],
        timestamp: new Date(),
        streaming: true,
        isDual: true,
        peerResponse: {
          agentName: peerAgent.name,
          agentIcon: peerAgent.icon,
          provider: peerProvider,
          model: pModel,
          content: '',
          streaming: true,
        }
      }

      updateConversation(convId, conv => ({
        ...conv,
        messages: [...conv.messages.filter(m => m.id !== assistantMsgId), dualAssistantMsg],
        title: conv.messages.length <= 1 ? text.substring(0, 26) : conv.title,
      }))

      setRunningConvs(prev => ({
        ...prev,
        [convId]: { status: `👥 双智能体「${activeAgent.name}」与「${peerAgent.name}」正在协同研讨中...`, streaming: true }
      }))

      try {
        const primaryTask = executeStreamRequest(
          provider,
          selectedModel,
          activeAgent,
          (delta) => {
            accumulatedAssistantText += delta
            updateConversation(convId, conv => {
              const msgs = [...conv.messages]
              const idx = msgs.findIndex(m => m.id === assistantMsgId)
              if (idx === -1) return conv
              msgs[idx] = { ...msgs[idx], content: msgs[idx].content + delta }
              return { ...conv, messages: msgs }
            })
          },
          (st) => {
            setRunningConvs(prev => prev[convId] ? {
              ...prev,
              [convId]: { ...prev[convId], status: `【${activeAgent.name}】${st}` }
            } : prev)
          },
          () => {
            updateConversation(convId, conv => {
              const msgs = [...conv.messages]
              const idx = msgs.findIndex(m => m.id === assistantMsgId)
              if (idx === -1) return conv
              msgs[idx] = { ...msgs[idx], streaming: false }
              return { ...conv, messages: msgs }
            })
          },
          (err) => {
            updateConversation(convId, conv => {
              const msgs = [...conv.messages]
              const idx = msgs.findIndex(m => m.id === assistantMsgId)
              if (idx === -1) return conv
              msgs[idx] = { ...msgs[idx], content: msgs[idx].content + `\n\n❌ **异常**: ${err}`, streaming: false }
              return { ...conv, messages: msgs }
            })
          }
        )

        const peerTask = executeStreamRequest(
          peerProvider,
          pModel,
          peerAgent,
          (delta) => {
            updateConversation(convId, conv => {
              const msgs = [...conv.messages]
              const idx = msgs.findIndex(m => m.id === assistantMsgId)
              if (idx === -1 || !msgs[idx].peerResponse) return conv
              const prev = msgs[idx].peerResponse!
              msgs[idx] = {
                ...msgs[idx],
                peerResponse: { ...prev, content: prev.content + delta }
              }
              return { ...conv, messages: msgs }
            })
          },
          (st) => {
            setRunningConvs(prev => prev[convId] ? {
              ...prev,
              [convId]: { ...prev[convId], status: `【${peerAgent.name}】${st}` }
            } : prev)
          },
          () => {
            updateConversation(convId, conv => {
              const msgs = [...conv.messages]
              const idx = msgs.findIndex(m => m.id === assistantMsgId)
              if (idx === -1 || !msgs[idx].peerResponse) return conv
              msgs[idx] = {
                ...msgs[idx],
                peerResponse: { ...msgs[idx].peerResponse!, streaming: false }
              }
              return { ...conv, messages: msgs }
            })
          },
          (err) => {
            updateConversation(convId, conv => {
              const msgs = [...conv.messages]
              const idx = msgs.findIndex(m => m.id === assistantMsgId)
              if (idx === -1 || !msgs[idx].peerResponse) return conv
              const prev = msgs[idx].peerResponse!
              msgs[idx] = {
                ...msgs[idx],
                peerResponse: { ...prev, content: prev.content + `\n\n❌ **异常**: ${err}`, streaming: false }
              }
              return { ...conv, messages: msgs }
            })
          }
        )

        await Promise.allSettled([primaryTask, peerTask])
      } finally {
        updateConversation(convId, conv => {
          const msgs = [...conv.messages]
          const idx = msgs.findIndex(m => m.id === assistantMsgId)
          if (idx !== -1) {
            msgs[idx] = {
              ...msgs[idx],
              streaming: false,
              peerResponse: msgs[idx].peerResponse ? { ...msgs[idx].peerResponse!, streaming: false } : undefined,
            }
          }
          return { ...conv, messages: msgs }
        })
        abortControllersRef.current.delete(convId)
        setRunningConvs(prev => {
          const next = { ...prev }
          delete next[convId]
          return next
        })
        setActiveSkill(null)
        applyDynamicFollowups(text, accumulatedAssistantText)
      }
      return
    }

    // ===== 单智能体标准模式 =====
    try {
      await executeStreamRequest(
        provider,
        selectedModel,
        activeAgent,
        (delta) => {
          accumulatedAssistantText += delta
          updateConversation(convId, conv => {
            const msgs = [...conv.messages]
            const idx = msgs.findIndex(m => m.id === assistantMsgId)
            if (idx === -1) return conv
            msgs[idx] = { ...msgs[idx], content: msgs[idx].content + delta }
            return { ...conv, messages: msgs }
          })
        },
        (st) => {
          setRunningConvs(prev => prev[convId] ? {
            ...prev,
            [convId]: { ...prev[convId], status: st }
          } : prev)
        },
        () => {
          updateConversation(convId, conv => {
            const msgs = [...conv.messages]
            const idx = msgs.findIndex(m => m.id === assistantMsgId)
            if (idx === -1) return conv
            msgs[idx] = { ...msgs[idx], streaming: false }
            return { ...conv, messages: msgs }
          })
        },
        (err) => {
          updateConversation(convId, conv => {
            const msgs = [...conv.messages]
            const idx = msgs.findIndex(m => m.id === assistantMsgId)
            if (idx === -1) return conv
            msgs[idx] = { ...msgs[idx], content: msgs[idx].content + `\n\n❌ **执行异常**: ${err}`, streaming: false }
            return { ...conv, messages: msgs }
          })
        }
      )
    } finally {
      updateConversation(convId, conv => {
        const msgs = [...conv.messages]
        const idx = msgs.findIndex(m => m.id === assistantMsgId)
        if (idx !== -1 && msgs[idx].streaming) {
          msgs[idx] = { ...msgs[idx], streaming: false }
        }
        return { ...conv, messages: msgs }
      })
      abortControllersRef.current.delete(convId)
      setRunningConvs(prev => {
        const next = { ...prev }
        delete next[convId]
        return next
      })
      setActiveSkill(null)
      applyDynamicFollowups(text, accumulatedAssistantText)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNoteClick = async (notePath: string) => {
    try {
      const note = await api.getFile(notePath)
      setSelectedNote(note)
      setInput(prev => {
        const citation = `【请结合知识库笔记《${note.title || notePath}》进行精讲/重构】：\n${note.content.slice(0, 1500)}`
        return prev ? prev + '\n\n' + citation : citation
      })
    } catch { /* silent */ }
  }

  // 核心功能 1：撤回消息（若是用户消息，撤回该提问及智能体的回答）
  const handleRecallMessage = useCallback((msgId: string) => {
    if (!activeConvId) return
    updateConversation(activeConvId, conv => {
      const idx = conv.messages.findIndex(m => m.id === msgId)
      if (idx === -1) return conv
      const target = conv.messages[idx]
      let nextMsgs: AgentMessage[] = []
      if (target.role === 'user') {
        // 撤回该提问及后续的回答
        nextMsgs = conv.messages.slice(0, idx)
      } else {
        // 单独删除此条回复
        nextMsgs = conv.messages.filter(m => m.id !== msgId)
      }
      return { ...conv, messages: nextMsgs }
    })
  }, [activeConvId, updateConversation])

  // 核心功能 2：编辑用户消息（将内容填回输入框，并撤回此轮对话）
  const handleEditMessage = useCallback((msgId: string) => {
    const targetMsg = messages.find(m => m.id === msgId)
    if (!targetMsg) return
    setInput(targetMsg.content)
    handleRecallMessage(msgId)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
  }, [messages, handleRecallMessage])

  // 核心功能 3：删除单条消息
  const handleDeleteMessage = useCallback((msgId: string) => {
    if (!activeConvId) return
    updateConversation(activeConvId, conv => ({
      ...conv,
      messages: conv.messages.filter(m => m.id !== msgId),
    }))
  }, [activeConvId, updateConversation])

  // 核心功能 4：重新生成（Regenerate）
  const handleRegenerate = useCallback((assistantMsgId: string) => {
    if (!activeConvId || isCurrentRunning) return
    const conv = conversations.find(c => c.id === activeConvId)
    if (!conv) return
    const idx = conv.messages.findIndex(m => m.id === assistantMsgId)
    if (idx === -1) return
    const prevUserMsg = [...conv.messages.slice(0, idx)].reverse().find(m => m.role === 'user')
    if (!prevUserMsg) return

    updateConversation(activeConvId, c => ({
      ...c,
      messages: c.messages.slice(0, idx),
    }))

    setTimeout(() => {
      handleSend(prevUserMsg.content)
    }, 100)
  }, [activeConvId, isCurrentRunning, conversations, updateConversation, handleSend])

  // 核心功能 5：断点续写 / 继续生成（彻底解决说一半截断没后续的痛点）
  const handleContinue = async (assistantMsgId: string) => {
    if (!activeConvId || isCurrentRunning) return
    const conv = conversations.find(c => c.id === activeConvId)
    if (!conv) return
    const targetMsg = conv.messages.find(m => m.id === assistantMsgId)
    if (!targetMsg) return

    const continuePrompt = `【用户指令：请继续往下写】\n你上一段回答在末尾处暂停了，请紧密承接上一段末尾断点继续往下写，不要重复上文已经说过的内容，直接继续输出后续内容、推导或代码：`

    updateConversation(activeConvId, c => ({
      ...c,
      messages: c.messages.map(m => m.id === assistantMsgId ? { ...m, streaming: true } : m),
    }))

    const convId = activeConvId
    const initStatus = `正在让【${activeAgent.name}】(${provider}) 接续未完内容...`
    setRunningConvs(prev => ({
      ...prev,
      [convId]: { status: initStatus, streaming: true },
    }))

    const convController = new AbortController()
    abortControllersRef.current.set(convId, convController)

    try {
      const history = (conv.messages || [])
        .filter(m => m.content && m.content.trim().length > 0 && m.id !== 'welcome')
        .slice(-16)
        .map(m => ({ role: m.role, content: m.content }))

      const body = {
        provider,
        prompt: continuePrompt,
        model: selectedModel || undefined,
        sessionId: convId,
        history,
        agentPrompt: `${activeAgent.systemPrompt}\n【续写要求】：请直接承接断点无缝续写，不要客套，不要重复上文。`,
        projectName: activeProject?.name || '考研 408 & 数学研学工作台',
        projectDescription: activeProject?.description || '',
        cwd: activeProject?.cwd || undefined,
        pageContext: `AI 伴学主页面 (${activeAgent.name}) · 继续生成`,
      }

      const res = await fetch('/api/local-agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: convController.signal,
      })

      if (!res.ok) throw new Error(`服务响应异常: HTTP ${res.status}`)

      const reader = res.body?.getReader()
      if (!reader) throw new Error('流式传输不可用')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const jsonStr = trimmed.slice(6)

          try {
            const event = JSON.parse(jsonStr)
            if (event.type === 'text' && event.content) {
              const delta = event.content
              updateConversation(convId, c => ({
                ...c,
                messages: c.messages.map(m => m.id === assistantMsgId ? { ...m, content: m.content + delta } : m),
              }))
            } else if (event.type === 'status' && event.content) {
              setRunningConvs(prev => prev[convId] ? {
                ...prev,
                [convId]: { ...prev[convId], status: event.content }
              } : prev)
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        updateConversation(convId, c => ({
          ...c,
          messages: c.messages.map(m => m.id === assistantMsgId ? { ...m, content: m.content + `\n\n❌ **续写异常**: ${err.message}` } : m),
        }))
      }
    } finally {
      updateConversation(convId, c => ({
        ...c,
        messages: c.messages.map(m => m.id === assistantMsgId ? { ...m, streaming: false } : m),
      }))
      abortControllersRef.current.delete(convId)
      setRunningConvs(prev => {
        const next = { ...prev }
        delete next[convId]
        return next
      })
    }
  }

  // Practical Tool 1: Save message as Obsidian Markdown Note
  const handleSaveMessage = async (msg: AgentMessage) => {
    if (!msg.content) return
    const firstLine = msg.content.split('\n')[0].replace(/^#+\s*/, '').replace(/[<>:"/\\|?*]/g, '_').substring(0, 40)
    const title = firstLine || `AI伴学精析_${new Date().toLocaleDateString('zh-CN')}`
    const destPath = `wiki/AI伴学笔记/${title}.md`
    try {
      await api.createFile(destPath, msg.content, {
        title,
        tags: ['ai-study', activeAgent.domain, provider],
        created: new Date().toISOString().split('T')[0],
      })
      alert(`✅ 已成功沉淀为真实知识库笔记：\n${destPath}`)
    } catch (err: any) {
      alert(`保存失败: ${err.message}`)
    }
  }

  // Practical Tool 2: Launch Quick Practice from conversation
  const handleTriggerPracticeFromChat = (msg: AgentMessage) => {
    setPracticeData({
      title: `${activeAgent.name} · 考点随堂测验`,
      content: msg.content.slice(0, 3000),
    })
    setPracticeModalOpen(true)
  }

  // Copy Markdown
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="h-full max-h-full flex flex-col gap-2 overflow-hidden min-h-0">
      {/* 📱 移动端专属高能紧凑顶栏 (高度仅 44px，为手机聊天释放 250px 宝贵视口) */}
      <div className="flex md:hidden items-center justify-between px-3 py-1.5 bg-surface border border-cream-200 rounded-xl shadow-2xs shrink-0">
        {/* 左侧：当前智能体切换 */}
        <button
          onClick={() => setShowAgentPicker(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 border border-cream-200 text-warm-800 text-xs font-bold active:scale-95 transition-all"
        >
          <span>{activeAgent.icon}</span>
          <span className="truncate max-w-[85px]">{activeAgent.name}</span>
          <ChevronDown className="w-3 h-3 text-warm-400" />
        </button>

        {/* 中间：当前模型与状态胶囊 */}
        <button
          onClick={() => setMobileConfigOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cream-100/90 border border-cream-200 text-[11px] text-warm-700 max-w-[125px] truncate active:scale-95 transition-all"
          title="点击配置模型与引擎"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-mono truncate">{selectedModel || '默认模型'}</span>
        </button>

        {/* 右侧：高级控制中心抽屉开关与新建按钮 */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setMobileConfigOpen(true)}
            className="p-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 border border-cream-200 text-warm-600 active:scale-95 transition-all"
            title="展开引擎与技能控制面板"
          >
            <Settings className="w-4 h-4 text-accent-orange" />
          </button>
          <button
            onClick={() => createConversation(activeAgent)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-orange text-white text-xs font-semibold active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建</span>
          </button>
        </div>
      </div>

      {/* 📱 移动端引擎与高级能力控制抽屉 (Bottom Sheet Drawer) */}
      {mobileConfigOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMobileConfigOpen(false)}
          />
          <div className="relative bg-surface rounded-t-3xl p-5 shadow-2xl border-t border-cream-300 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            {/* 抽屉头部 */}
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-accent-orange" />
                <span className="font-bold text-sm text-warm-800">伴学引擎与技能控制台</span>
              </div>
              <button
                onClick={() => setMobileConfigOpen(false)}
                className="p-1 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-cream-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. 伴学风格调节 */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-warm-500 uppercase tracking-wider">伴学风格与语调</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'rigorous', label: '📐 学术严谨' },
                  { key: 'vivid', label: '💡 通俗直观' },
                  { key: 'exam', label: '⚡ 考场冲刺' },
                ].map(tone => (
                  <button
                    key={tone.key}
                    onClick={() => setStudyTone(tone.key as any)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                      studyTone === tone.key
                        ? 'bg-accent-orange text-white border-accent-orange shadow-xs'
                        : 'bg-cream-100 text-warm-700 border-cream-200'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 双核引擎选择 */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-warm-500 uppercase tracking-wider">AI 驱动底座</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-cream-200/60 p-1.5 rounded-2xl">
                {[
                  { key: 'antigravity' as const, label: '✨ Antigravity' },
                  { key: 'codex' as const, label: '🤖 Codex' },
                  { key: 'claude-code' as const, label: '⚡ Claude' },
                  { key: 'web' as const, label: '☁️ 云端双核' },
                ].map(tab => {
                  const tabAgent = agents.find(a => a.provider === tab.key)
                  const isAvail = tab.key === 'web' || tabAgent?.available
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleProviderChange(tab.key)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all relative flex items-center justify-center gap-1 ${
                        provider === tab.key
                          ? tab.key === 'antigravity'
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm font-bold'
                            : 'bg-white text-warm-800 shadow-sm font-bold'
                          : tab.key === 'antigravity' && isAvail
                            ? 'bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 font-semibold'
                            : 'text-warm-500 hover:text-warm-700'
                      }`}
                      title={tabAgent ? `${tabAgent.version || '已检测'} (${tabAgent.detail || ''})` : ''}
                    >
                      <span>{tab.label}</span>
                      {tab.key === 'antigravity' && isAvail && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. 模型选择与管理 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-warm-500 uppercase tracking-wider">选择模型</span>
                <button
                  onClick={handleScanModels}
                  disabled={syncingModels}
                  className="text-[11px] text-accent-orange hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className={`w-3 h-3 ${syncingModels ? 'animate-spin' : ''}`} />
                  <span>{syncingModels ? '扫描中...' : (provider === 'web' ? '扫描云端模型' : '扫描本地模型')}</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={isCustomModel ? '__custom__' : selectedModel}
                  onChange={e => handleModelSelect(e.target.value)}
                  className="flex-1 text-xs bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-warm-800 font-medium outline-none focus:border-accent-orange"
                >
                  {provider === 'web' && cloudEndpoints.length > 0 ? (
                    cloudEndpoints.map(ep => (
                      <optgroup key={ep.id} label={`🌐 ${ep.name} (${ep.apiFormat === 'openai' ? 'OpenAI' : 'Anthropic'})`}>
                        {(ep.models && ep.models.length > 0 ? ep.models : (ep.defaultModel ? [ep.defaultModel] : [])).map(m => {
                          const optionValue = `${ep.id}::${m}`
                          return (
                            <option key={optionValue} value={optionValue}>
                              {m}
                            </option>
                          )
                        })}
                      </optgroup>
                    ))
                  ) : currentAvailableModels.length > 0 ? (
                    currentAvailableModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))
                  ) : (
                    <option value="" disabled>（未检测到可用模型，请点击上方扫描）</option>
                  )}
                  <option value="__custom__">⚙️ 自定义模型名称...</option>
                </select>
                <button
                  onClick={() => { setMobileConfigOpen(false); setShowModelManagerModal(true); }}
                  className="p-2 rounded-xl border border-cream-200 bg-cream-100 text-warm-600 hover:text-accent-orange"
                  title="管理大模型"
                >
                  <Settings className="w-4 h-4 text-accent-orange" />
                </button>
              </div>
              {modelSyncFeedback && (
                <div className="text-xs text-emerald-600 font-medium">{modelSyncFeedback}</div>
              )}
            </div>

            {/* 4. 扩展技能与记忆仓库 */}
            <div className="space-y-2 pt-1 border-t border-cream-200">
              <div className="text-[11px] font-bold text-warm-500 uppercase tracking-wider">智能体扩展技能与记忆</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setMobileConfigOpen(false); setShowMemoryModal(true); }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800"
                >
                  <Brain className="w-3.5 h-3.5 text-amber-600" />
                  <span>AI 记忆仓库</span>
                </button>
                <button
                  onClick={() => { setMobileConfigOpen(false); setShowSkillPicker(true); }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-800"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>本机技能 (98+)</span>
                </button>
              </div>

              {/* 考研专项技能选择 */}
              <div className="relative">
                <button
                  onClick={() => setShowSkillsMenu(!showSkillsMenu)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold bg-cream-100 border border-cream-200 text-warm-700"
                >
                  <span>{activeSkill ? `专项: ${activeSkill.shortName}` : '📚 考研专项自动化 Skills'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-warm-400" />
                </button>
                {showSkillsMenu && (
                  <div className="mt-2 w-full bg-white border border-cream-200 rounded-xl shadow-lg p-2 space-y-1">
                    {STUDY_SKILLS.map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => {
                          setActiveSkill(skill)
                          setShowSkillsMenu(false)
                          setInput(skill.placeholder)
                          setMobileConfigOpen(false)
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-cream-100 transition-colors"
                      >
                        <div className="text-xs font-bold text-warm-800 flex items-center gap-1.5">
                          <span>{skill.emoji}</span>
                          <span>{skill.shortName}</span>
                        </div>
                        <div className="text-[10px] text-warm-400 truncate mt-0.5">{skill.desc}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 完成并返回对话按钮 */}
            <button
              onClick={() => setMobileConfigOpen(false)}
              className="w-full py-2.5 rounded-xl bg-accent-orange text-white text-xs font-bold shadow-md hover:bg-accent-orange/90 transition-all cursor-pointer"
            >
              完成配置并返回对话
            </button>
          </div>
        </div>
      )}

      {/* 📱 移动端伴学智能体选择抽屉 */}
      {showAgentPicker && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowAgentPicker(false)}
          />
          <div className="relative bg-surface rounded-t-3xl p-5 shadow-2xl border-t border-cream-300 max-h-[75vh] overflow-y-auto space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
              <span className="font-bold text-sm text-warm-800">切换伴学智能体</span>
              <button onClick={() => setShowAgentPicker(false)} className="p-1 rounded-lg text-warm-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {STUDY_AGENTS.map(agent => {
                const isSelected = activeAgent.id === agent.id
                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setActiveAgent(agent)
                      createConversation(agent)
                      setShowAgentPicker(false)
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-accent-orange bg-accent-orange/10 shadow-xs'
                        : 'border-cream-200 bg-cream-50 hover:bg-cream-100'
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white shadow-2xs shrink-0">{agent.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-warm-800">{agent.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border ${agent.badgeClass}`}>
                          {agent.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-warm-500 mt-0.5 line-clamp-1">{agent.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🖥️ 桌面端顶栏 1: 伴学智能体切换栏 (桌面宽屏常驻) */}
      <div className="hidden md:flex bg-surface border border-cream-200 rounded-xl px-3 py-2 shadow-2xs shrink-0 flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-cream-200 mr-1">
            <Bot className="w-4 h-4 text-accent-orange" />
            <span className="text-xs font-bold text-warm-700">伴学智能体:</span>
          </div>
          {STUDY_AGENTS.map(agent => {
            const isSelected = activeAgent.id === agent.id
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setActiveAgent(agent)
                  createConversation(agent)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-accent-orange text-white shadow-xs font-bold'
                    : 'bg-cream-100 hover:bg-cream-200 text-warm-700 border border-cream-200 hover:border-accent-orange/40'
                }`}
              >
                <span>{agent.icon}</span>
                <span>{agent.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-cream-200 text-warm-500'
                }`}>
                  {agent.title.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Current Agent Mini-Description & Tone Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={studyTone}
            onChange={e => setStudyTone(e.target.value as any)}
            className="text-xs bg-cream-100 border border-cream-200 rounded-lg px-2.5 py-1 text-warm-700 focus:outline-hidden focus:border-accent-orange"
            title="调节智能体伴学风格"
          >
            <option value="rigorous">📐 学术严谨模式</option>
            <option value="vivid">💡 通俗直观模式</option>
            <option value="exam">⚡ 考场冲刺模式</option>
          </select>
        </div>
      </div>

      {/* 🖥️ 桌面端顶栏 2: 驱动引擎、模型与技能控制条 (桌面宽屏常驻) */}
      <div className="hidden md:flex bg-surface border border-cream-200 rounded-xl px-3 py-1.5 flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Left: Provider & Model Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Provider Tabs */}
          <div className="flex items-center gap-1 bg-cream-200/70 p-1 rounded-xl">
            {[
              { key: 'antigravity' as const, label: '✨ Antigravity' },
              { key: 'codex' as const, label: '🤖 Codex' },
              { key: 'claude-code' as const, label: '⚡ Claude Code' },
              { key: 'web' as const, label: '☁️ 云端双核' },
            ].map(tab => {
              const tabAgent = agents.find(a => a.provider === tab.key)
              const isAvail = tab.key === 'web' || tabAgent?.available
              return (
                <button
                  key={tab.key}
                  onClick={() => handleProviderChange(tab.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    provider === tab.key
                      ? tab.key === 'antigravity'
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs font-bold'
                        : 'bg-surface text-warm-800 shadow-xs font-bold'
                      : tab.key === 'antigravity' && isAvail
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold'
                        : 'text-warm-500 hover:text-warm-700'
                  }`}
                  title={tabAgent ? `${tabAgent.version || '已检测'} (${tabAgent.detail || ''})` : ''}
                >
                  <span>{tab.label}</span>
                  {isAvail && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        provider === tab.key ? 'bg-emerald-300' : 'bg-emerald-500'
                      }`}
                      title={`${tabAgent?.version || '已就绪'}`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Model Dropdown & Management */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <select
              value={isCustomModel ? '__custom__' : selectedModel}
              onChange={e => handleModelSelect(e.target.value)}
              className="text-xs bg-cream-100 border border-cream-200 rounded-lg px-2.5 py-1 text-warm-800 font-medium focus:outline-hidden focus:border-accent-orange"
            >
              {provider === 'web' && cloudEndpoints.length > 0 ? (
                cloudEndpoints.map(ep => (
                  <optgroup key={ep.id} label={`🌐 ${ep.name} (${ep.apiFormat === 'openai' ? 'OpenAI' : 'Anthropic'})`}>
                    {(ep.models && ep.models.length > 0 ? ep.models : (ep.defaultModel ? [ep.defaultModel] : [])).map(m => {
                      const optionValue = `${ep.id}::${m}`
                      return (
                        <option key={optionValue} value={optionValue}>
                          {m}
                        </option>
                      )
                    })}
                  </optgroup>
                ))
              ) : currentAvailableModels.length > 0 ? (
                currentAvailableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))
              ) : (
                <option value="" disabled>（未检测到可用模型，请点击右侧扫描）</option>
              )}
              <option value="__custom__">⚙️ 自定义模型名称...</option>
            </select>

            {isCustomModel && (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="如 deepseek-reasoner"
                  value={customModelInput}
                  onChange={e => setCustomModelInput(e.target.value)}
                  className="w-36 text-xs bg-cream-100 border border-cream-200 rounded-lg px-2 py-1 text-warm-800 focus:outline-hidden focus:border-accent-orange"
                />
                <button
                  onClick={handleCustomModelConfirm}
                  className="px-2 py-1 rounded-lg bg-accent-orange text-white text-xs font-semibold cursor-pointer"
                >
                  确认
                </button>
              </div>
            )}

            {/* Quick 1-Click Delete Current Model Button */}
            {selectedModel && !isCustomModel && (
              <button
                onClick={handleDeleteCurrentModel}
                title={`从列表删除当前模型「${selectedModel}」`}
                className="p-1 rounded-lg border border-cream-200 bg-cream-100 hover:border-red-400 hover:bg-red-50 text-warm-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Dual Agent Arena Toggle Button */}
            <button
              onClick={() => {
                const next = !isDualMode
                setIsDualMode(next)
                localStorage.setItem('coreforge_dual_agent_mode', String(next))
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                isDualMode
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-xs'
                  : 'bg-cream-100 hover:bg-cream-200 text-warm-700 border-cream-200 hover:border-orange-300'
              }`}
              title="开启后，一条提问同时分发给两个智能体/引擎，并排双栏对比作答"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isDualMode ? '👥 双智能体协同中' : '👥 双智能体协同'}</span>
            </button>

            {/* Open Model Manager Modal */}
            <button
              onClick={() => setShowModelManagerModal(true)}
              title="管理全部大模型，净化下拉列表"
              className="px-2 py-1 rounded-lg border border-cream-200 bg-cream-100 hover:border-accent-orange text-xs text-warm-700 font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Settings className="w-3 h-3 text-accent-orange" />
              <span>管理模型</span>
            </button>

            {/* Sync / Scan Models Button */}
            <button
              onClick={handleScanModels}
              disabled={syncingModels}
              title={provider === 'web' ? '从设置的云端服务商 API 扫描拉取全部可用大模型' : `扫描本机已配置的 ${provider === 'codex' ? 'Codex' : 'Claude Code'} 本地模型`}
              className="px-2 py-1 rounded-lg border border-cream-200 bg-cream-100 hover:border-accent-orange text-xs text-warm-700 font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 text-accent-orange ${syncingModels ? 'animate-spin' : ''}`} />
              <span>{syncingModels ? '扫描中...' : (provider === 'web' ? '🔄 扫描云端' : '🔄 扫描本地')}</span>
            </button>

            {modelSyncFeedback && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                {modelSyncFeedback}
              </span>
            )}
          </div>
        </div>

        {/* Right: Memory Tier + AI Memory Hub + Local Skills Picker + Built-in Skills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowMemoryTierModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-300 dark:border-indigo-700/60 text-indigo-800 dark:text-indigo-300 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all shadow-2xs cursor-pointer"
            title="查看全局记忆、项目专属记忆与会话物理隔离架构"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>🏛️ 记忆分层体系</span>
          </button>

          <button
            onClick={() => setShowMemoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 hover:from-amber-500/20 hover:to-orange-500/20 transition-all shadow-2xs cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5 text-amber-600" />
            <span>🧠 AI 可视化记忆仓库</span>
          </button>

          <button
            onClick={() => setShowSkillPicker(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              selectedLocalSkill
                ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-xs'
                : 'bg-cream-100 hover:bg-cream-200 text-warm-700 border-cream-200 hover:border-purple-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{selectedLocalSkill ? `本机: ${selectedLocalSkill.displayName}` : '⚡ 本机 Agent 技能库 (98+)'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSkillsMenu(!showSkillsMenu)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                activeSkill
                  ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-400/40 shadow-xs'
                  : 'bg-cream-100 text-warm-600 border-cream-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <span>{activeSkill ? `专项: ${activeSkill.shortName}` : '📚 考研专项 Skills'}</span>
              <ChevronDown className="w-3 h-3 text-warm-400" />
            </button>

            {showSkillsMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-cream-200 rounded-xl shadow-xl p-2 z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider px-2 py-1 border-b border-cream-200">
                  选择考研自动化技能
                </div>
                {STUDY_SKILLS.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => {
                      setActiveSkill(skill)
                      setShowSkillsMenu(false)
                      setInput(skill.placeholder)
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-cream-200/70 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-warm-800 flex items-center gap-1.5">
                        <span>{skill.emoji}</span>
                        <span>{skill.shortName}</span>
                      </div>
                      <span className="text-[10px] text-purple-600 font-mono">{skill.command}</span>
                    </div>
                    <p className="text-[10px] text-warm-500 mt-0.5 leading-relaxed">
                      {skill.desc}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => createConversation(activeAgent)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            新建对话
          </button>
        </div>
      </div>

      {/* 👥 双智能体协同配置条 (当开启双智能体模式时常驻展示) */}
      {isDualMode && (
        <div className="hidden md:flex bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-purple-500/10 border border-orange-300/80 rounded-xl px-3.5 py-2 items-center justify-between gap-3 shrink-0 animate-in fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-orange-800 flex items-center gap-1">
              <span>👥 双智能体同台研讨：</span>
            </span>

            {/* 智能体 A 显示 */}
            <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-orange-200 text-xs text-warm-800 font-medium shadow-2xs">
              <span className="font-bold text-orange-600">A (主):</span>
              <span>{activeAgent.icon} {activeAgent.name}</span>
              <span className="text-[10px] text-warm-400 font-mono">[{provider} · {selectedModel || '默认'}]</span>
            </div>

            <span className="text-xs font-bold text-warm-400">⚡ VS 协同 ⚡</span>

            {/* 智能体 B 配置 */}
            <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-800 px-2 py-1 rounded-lg border border-purple-200 text-xs text-warm-800 font-medium shadow-2xs">
              <span className="font-bold text-purple-600">B (协同):</span>
              {/* 导师角色选择 */}
              <select
                value={peerAgent.id}
                onChange={e => {
                  const found = STUDY_AGENTS.find(a => a.id === e.target.value)
                  if (found) {
                    setPeerAgent(found)
                    localStorage.setItem('coreforge_peer_agent_id', found.id)
                  }
                }}
                className="bg-transparent text-xs font-semibold text-warm-800 focus:outline-hidden"
              >
                {STUDY_AGENTS.map(a => (
                  <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                ))}
              </select>

              {/* 引擎选择 */}
              <select
                value={peerProvider}
                onChange={e => {
                  const p = e.target.value as ProviderType
                  setPeerProvider(p)
                  localStorage.setItem('coreforge_peer_provider', p)
                  const pPreset = p === 'codex' ? 'gpt-6-luna' : p === 'claude-code' ? 'deepseek-flash' : 'deepseek-chat'
                  setPeerModel(pPreset)
                  localStorage.setItem('coreforge_peer_model', pPreset)
                }}
                className="bg-transparent text-xs font-semibold text-purple-700 focus:outline-hidden"
              >
                <option value="claude-code">⚡ Claude Code</option>
                <option value="codex">🤖 Codex</option>
                <option value="web">☁️ 云端</option>
                <option value="antigravity">✨ Antigravity</option>
              </select>

              {/* 模型选择 */}
              <select
                value={peerModel}
                onChange={e => {
                  setPeerModel(e.target.value)
                  localStorage.setItem('coreforge_peer_model', e.target.value)
                }}
                className="bg-transparent text-xs font-mono text-warm-700 focus:outline-hidden max-w-[130px] truncate"
              >
                {(PROVIDER_PRESET_MODELS[peerProvider] || [peerModel]).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[11px] text-warm-500 font-medium hidden lg:inline">
            💡 发送一次问题，两个智能体将分别给出不同视角并排对比
          </div>
        </div>
      )}

      {/* Main Body: Sidebar + Chat Stream */}
      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
        {/* Session sidebar: 移动端为浮层抽屉，桌面端保持经典侧边栏 */}
        {showSessions && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
            onClick={() => setShowSessions(false)}
          />
        )}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-2xl transition-transform duration-200
          md:static md:z-auto md:shadow-none md:transition-all
          ${showSessions ? 'translate-x-0 md:w-52' : '-translate-x-full md:w-0'}
          overflow-hidden md:border md:border-cream-200 md:rounded-xl shrink-0
        `}>
          <div className="h-full flex flex-col bg-surface border-r border-cream-200 md:border-none">
            {/* 📁 项目工作区切换栏 */}
            <div className="p-3 border-b border-cream-200 bg-cream-100/70 flex flex-col gap-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-warm-700 flex items-center gap-1">
                  <Folder className="w-3.5 h-3.5 text-accent-orange" />
                  <span>当前项目工作区</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowMemoryTierModal(true)}
                    className="p-1 rounded hover:bg-cream-200 text-warm-500 hover:text-indigo-600 transition-colors cursor-pointer"
                    title="查看三层记忆分层与项目专属记忆"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="p-1 rounded hover:bg-cream-200 text-warm-500 hover:text-accent-orange transition-colors cursor-pointer"
                    title="新建独立项目工作区"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 项目选择下拉框 */}
              <select
                value={activeProject?.id || DEFAULT_PROJECT_ID}
                onChange={e => handleSelectProject(e.target.value)}
                className="w-full text-xs font-semibold bg-surface border border-cream-200 rounded-lg px-2 py-1.5 text-warm-800 focus:outline-hidden focus:border-accent-orange truncate cursor-pointer shadow-2xs"
              >
                {workspace.projects.map(p => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>

              {activeProject?.cwd && (
                <div className="text-[10px] text-warm-400 font-mono truncate px-0.5" title={`工作目录: ${activeProject.cwd}`}>
                  cwd: {activeProject.cwd}
                </div>
              )}
            </div>

            {/* 会话历史顶栏 */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-cream-200 bg-cream-50/70 shrink-0">
              <span className="text-xs font-bold text-warm-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-accent-orange" />
                <span>专属对话 ({projectConversations.length})</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { createConversation(activeAgent); if (window.innerWidth < 768) setShowSessions(false) }}
                  className="p-1 rounded hover:bg-cream-200 text-warm-500 hover:text-accent-orange cursor-pointer"
                  title="新建对话"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowSessions(false)}
                  className="md:hidden p-1 rounded hover:bg-cream-200 text-warm-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 当前项目下的专属会话列表 */}
            <div className="flex-1 overflow-auto py-1">
              {projectConversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-warm-400">
                  <p>当前项目暂无对话</p>
                  <button
                    onClick={() => createConversation(activeAgent)}
                    className="mt-2 px-3 py-1 rounded-lg bg-accent-orange/10 text-accent-orange hover:bg-accent-orange/20 text-[11px] font-semibold cursor-pointer"
                  >
                    + 开启新对话
                  </button>
                </div>
              ) : (
                projectConversations.map(conv => {
                  const isConvRunning = Boolean(runningConvs[conv.id]?.streaming)
                  return (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-2 px-3 py-2.5 mx-1.5 rounded-xl cursor-pointer text-xs transition-colors ${
                        activeConvId === conv.id
                          ? 'bg-accent-orange/15 text-warm-900 font-bold'
                          : 'text-warm-600 hover:bg-cream-100'
                      }`}
                      onClick={() => {
                        handleSelectConversation(conv.id)
                        if (window.innerWidth < 768) setShowSessions(false)
                      }}
                    >
                      {isConvRunning ? (
                        <Loader2 className="w-3.5 h-3.5 shrink-0 text-accent-orange mt-0.5 animate-spin self-start" />
                      ) : (
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 text-accent-orange mt-0.5 self-start" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate flex items-center gap-1">
                          <span className="truncate">{conv.title}</span>
                          {isConvRunning && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-700 font-semibold shrink-0">
                              运行中
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-warm-400 font-normal">
                          <span>
                            {conv.provider === 'antigravity' ? '✨ Antigravity' : conv.provider === 'codex' ? '🤖 Codex' : conv.provider === 'claude-code' ? '⚡ Claude' : '☁️ 云端'}
                          </span>
                          {conv.model && (
                            <>
                              <span>·</span>
                              <span className="font-mono truncate max-w-[75px]">
                                {conv.model.includes('::') ? conv.model.split('::')[1] : conv.model}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        {isConvRunning && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStopConversation(conv.id) }}
                            className="p-1 rounded hover:bg-red-100 text-red-500 transition-all cursor-pointer"
                            title="终止该会话执行"
                          >
                            <Square className="w-3 h-3 fill-current" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id) }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-cream-300 text-warm-400 hover:text-red-500 transition-all cursor-pointer"
                          title="删除会话"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* File Explorer sidebar: 移动端为浮层抽屉，桌面端保持经典侧边栏 */}
        {showFiles && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
            onClick={() => setShowFiles(false)}
          />
        )}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-cream-50 shadow-2xl transition-transform duration-200
          md:static md:z-auto md:shadow-none md:transition-all
          ${showFiles ? 'translate-x-0 md:w-56' : '-translate-x-full md:w-0'}
          overflow-hidden border-r border-cream-200 md:border md:rounded-xl shrink-0
        `}>
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-cream-200 md:hidden bg-cream-100">
            <span className="font-bold text-xs text-warm-800 flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-accent-orange" /> 引用知识库笔记
            </span>
            <button onClick={() => setShowFiles(false)} className="p-1 rounded text-warm-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="h-[calc(100%-48px)] md:h-full overflow-y-auto">
            <FileExplorer tree={tree} onFileClick={(path) => { handleNoteClick(path); if (window.innerWidth < 768) setShowFiles(false) }} />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-surface border border-cream-200 rounded-2xl overflow-hidden min-w-0">
          {/* Sub Toolbar */}
          <div className="px-3 sm:px-4 py-2 border-b border-cream-200 flex items-center justify-between gap-2 text-xs bg-cream-100/50 shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowSessions(!showSessions)}
                className={`px-2 py-1 rounded-lg border text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                  showSessions ? 'bg-accent-orange/15 text-warm-800 border-accent-orange/30 font-semibold' : 'bg-white text-warm-600 border-cream-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-accent-orange" /> 
                <span className="hidden sm:inline">对话历史</span>
                <span className="sm:hidden">历史</span>
              </button>
              <button
                onClick={() => setShowFiles(!showFiles)}
                className={`px-2 py-1 rounded-lg border text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                  showFiles ? 'bg-accent-orange/15 text-warm-800 border-accent-orange/30 font-semibold' : 'bg-white text-warm-600 border-cream-200'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5 text-accent-orange" /> 
                <span className="hidden sm:inline">知识库笔记</span>
                <span className="sm:hidden">文档</span>
              </button>

              <span className="text-[11px] text-warm-500 pl-2 border-l border-cream-200 hidden sm:flex items-center gap-1.5">
                <span>当前模型:</span>
                <span className="font-mono text-accent-orange font-bold">{selectedModel || '默认'}</span>
                {loadingAgents ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-warm-400" />
                ) : activeAgentStatus?.version ? (
                  <span className="text-[10px] text-warm-400 font-mono">({activeAgentStatus.version})</span>
                ) : null}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-warm-400">
              <span className="hidden sm:inline">Shift+Enter 换行 · Enter 发送</span>
              <span className="sm:hidden text-[10px] text-warm-500 font-medium">研小核 在线</span>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => {
              const isUser = msg.role === 'user'

              // 👥 如果是双智能体协同消息，渲染为双栏并排对比卡片
              if (!isUser && msg.isDual && msg.peerResponse) {
                return (
                  <div key={msg.id} className="w-full my-3 animate-in fade-in">
                    <div className="flex items-center gap-2 mb-2 px-1 text-xs font-bold text-warm-700">
                      <div className="p-1 rounded-lg bg-orange-500/10 text-accent-orange">
                        <Users className="w-4 h-4" />
                      </div>
                      <span>👥 双智能体同台研讨</span>
                      <span className="text-[10px] text-warm-400 font-normal">多视角推演与解答对比</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* 智能体 A 卡片 */}
                      <div className="flex flex-col bg-surface border border-cream-300 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-accent-orange/50 transition-all">
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-cream-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xl p-1 rounded-xl bg-orange-500/10 text-orange-600">{msg.agentIcon || activeAgent.icon}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-warm-900 dark:text-slate-100">{msg.agentName || activeAgent.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-600 font-semibold">导师 A (主)</span>
                              </div>
                              <div className="text-[10px] text-warm-400 font-mono">
                                [{msg.provider || provider}] {msg.model || selectedModel}
                              </div>
                            </div>
                          </div>
                          {msg.streaming && (
                            <span className="text-[10px] text-accent-orange font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-accent-orange animate-ping" />
                              正在深度思考...
                            </span>
                          )}
                        </div>

                        <div className="flex-1 text-xs leading-relaxed text-warm-800 dark:text-slate-200 min-h-[60px]">
                          <MarkdownRenderer content={msg.content} />
                          {msg.streaming && <span className="inline-block w-2 h-4 bg-accent-orange animate-pulse ml-1 align-middle" />}
                        </div>

                        {/* 底部操作工具 */}
                        {!msg.streaming && msg.content && (
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-cream-200 dark:border-slate-800 text-[11px] text-warm-400">
                            <button
                              onClick={() => handleCopy(msg.id + '-a', msg.content)}
                              className="hover:text-warm-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedId === msg.id + '-a' ? '已复制' : '复制'}</span>
                            </button>
                            <button
                              onClick={() => handleSaveMessage({ ...msg, content: `### 【${msg.agentName} · 解答】\n\n` + msg.content })}
                              className="hover:text-purple-600 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors cursor-pointer"
                            >
                              <Save className="w-3 h-3 text-purple-500" />
                              <span>沉淀笔记</span>
                            </button>
                            <button
                              onClick={() => handleTriggerPracticeFromChat({ ...msg, content: msg.content })}
                              className="hover:text-orange-600 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-orange-50 text-orange-600 font-medium transition-colors cursor-pointer"
                            >
                              <Target className="w-3 h-3" />
                              <span>考我3道题</span>
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="hover:text-red-500 p-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer ml-auto"
                              title="删除此研讨"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 智能体 B 卡片 */}
                      <div className="flex flex-col bg-surface border border-cream-300 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-purple-400/50 transition-all">
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-cream-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xl p-1 rounded-xl bg-purple-500/10 text-purple-600">{msg.peerResponse.agentIcon}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-warm-900 dark:text-slate-100">{msg.peerResponse.agentName}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 font-semibold">导师 B (协同)</span>
                              </div>
                              <div className="text-[10px] text-warm-400 font-mono">
                                [{msg.peerResponse.provider}] {msg.peerResponse.model}
                              </div>
                            </div>
                          </div>
                          {msg.peerResponse.streaming && (
                            <span className="text-[10px] text-purple-600 font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                              正在深度思考...
                            </span>
                          )}
                        </div>

                        <div className="flex-1 text-xs leading-relaxed text-warm-800 dark:text-slate-200 min-h-[60px]">
                          <MarkdownRenderer content={msg.peerResponse.content} />
                          {msg.peerResponse.streaming && <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1 align-middle" />}
                        </div>

                        {/* 底部操作工具 */}
                        {!msg.peerResponse.streaming && msg.peerResponse.content && (
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-cream-200 dark:border-slate-800 text-[11px] text-warm-400">
                            <button
                              onClick={() => handleCopy(msg.id + '-b', msg.peerResponse!.content)}
                              className="hover:text-warm-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedId === msg.id + '-b' ? '已复制' : '复制'}</span>
                            </button>
                            <button
                              onClick={() => handleSaveMessage({ ...msg, content: `### 【${msg.peerResponse!.agentName} · 解答】\n\n` + msg.peerResponse!.content })}
                              className="hover:text-purple-600 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors cursor-pointer"
                            >
                              <Save className="w-3 h-3 text-purple-500" />
                              <span>沉淀笔记</span>
                            </button>
                            <button
                              onClick={() => handleTriggerPracticeFromChat({ ...msg, content: msg.peerResponse!.content })}
                              className="hover:text-orange-600 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-orange-50 text-orange-600 font-medium transition-colors cursor-pointer"
                            >
                              <Target className="w-3 h-3" />
                              <span>考我3道题</span>
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="hover:text-red-500 p-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer ml-auto"
                              title="删除此研讨"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 shadow-2xs">
                      <LuluAvatar size="xs" mood={msg.streaming ? 'thinking' : 'idle'} theme="yellow" />
                    </div>
                  )}

                  <div className={`max-w-3xl flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {!isUser && (
                      <div className="flex items-center gap-2 mb-1 text-xs">
                        <span className="font-bold text-warm-800 flex items-center gap-1">
                          <span>{msg.agentIcon || activeAgent.icon}</span>
                          <span>{msg.agentName || activeAgent.name}</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border ${activeAgent.badgeClass}`}>
                          {activeAgent.title}
                        </span>
                      </div>
                    )}

                    <div
                      className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? 'bg-accent-orange text-white rounded-br-xs shadow-xs'
                          : 'bg-cream-100/80 border border-cream-200/80 text-warm-800 rounded-bl-xs'
                      }`}
                    >
                      {/* Tool calls execution badge */}
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="mb-2.5 pb-2 border-b border-cream-200/80 space-y-1">
                          {msg.toolCalls.map((tc, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-warm-500 font-mono bg-cream-200/50 px-2 py-0.5 rounded">
                              <Wrench className="w-3 h-3 text-orange-500 shrink-0" />
                              <span>已调用工具: {tc.tool}</span>
                              {tc.success && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Content */}
                      <MarkdownRenderer content={msg.content} />

                      {/* Streaming cursor */}
                      {msg.streaming && (
                        <span className="inline-block w-2 h-4 bg-accent-orange animate-pulse ml-1 align-middle" />
                      )}
                    </div>

                    {/* 用户提问消息操作栏：撤回、编辑、复制 */}
                    {isUser && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-warm-400 opacity-70 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditMessage(msg.id)}
                          className="hover:text-accent-orange flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors cursor-pointer"
                          title="编辑问题并撤回后续回复"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>编辑</span>
                        </button>
                        <button
                          onClick={() => handleRecallMessage(msg.id)}
                          className="hover:text-red-500 flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="撤回本条提问及智能体的回答"
                        >
                          <Undo2 className="w-3 h-3" />
                          <span>撤回</span>
                        </button>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-warm-700 flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors cursor-pointer"
                          title="复制内容"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? '已复制' : '复制'}</span>
                        </button>
                      </div>
                    )}

                    {/* Bottom action buttons on assistant messages */}
                    {!isUser && !msg.streaming && msg.content && (
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-warm-400 flex-wrap">
                        {/* 核心：继续生成按钮（一键接续未完成断点，彻底解决半截截断问题） */}
                        <button
                          onClick={() => handleContinue(msg.id)}
                          disabled={isCurrentRunning}
                          className="text-accent-orange hover:bg-accent-orange/10 border border-accent-orange/30 font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
                          title="若回答未讲完或断在半句，一键让智能体紧接着断点无缝续写"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>继续生成</span>
                        </button>

                        {/* 重新生成按钮 */}
                        <button
                          onClick={() => handleRegenerate(msg.id)}
                          disabled={isCurrentRunning}
                          className="hover:text-warm-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors cursor-pointer disabled:opacity-50"
                          title="重新生成该条回答"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>重新生成</span>
                        </button>

                        {/* Copy button */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-warm-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors cursor-pointer"
                          title="复制完整回复 Markdown"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? '已复制' : '复制'}</span>
                        </button>

                        {/* Practical Tool 1: Save as Note */}
                        <button
                          onClick={() => handleSaveMessage(msg)}
                          className="hover:text-warm-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors cursor-pointer"
                          title="一键将此讲解沉淀为知识库 Markdown 真实笔记"
                        >
                          <Save className="w-3 h-3 text-purple-500" />
                          <span>沉淀笔记</span>
                        </button>

                        {/* Practical Tool 2: Test 3 Questions */}
                        <button
                          onClick={() => handleTriggerPracticeFromChat(msg)}
                          className="hover:text-orange-600 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-orange-50 text-orange-600 font-medium transition-colors cursor-pointer"
                          title="针对本条考点讲解，现场命制 3 道真题自测"
                        >
                          <Target className="w-3 h-3" />
                          <span>考我3道题</span>
                        </button>

                        {/* 删除此条回复 */}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="hover:text-red-500 p-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer ml-auto"
                          title="删除此条回复"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {/* Quick-start exploration cards when conversation is fresh */}
            {messages.length <= 1 && (
              <div className="mt-2 sm:mt-4 p-3 sm:p-4 rounded-2xl border border-cream-200 bg-cream-50/70 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-warm-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                    <span>研学探索·快捷启发：</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-warm-400">点击直接向 {activeAgent.name} 发起深度研习</span>
                </div>

                <div className="flex sm:grid sm:grid-cols-2 gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 scrollbar-none">
                  {[
                    {
                      icon: '⚡',
                      title: '408 核心考点深度精讲',
                      desc: '解析虚拟内存分页与分段、TLB快表机制与缺页中断流程',
                      prompt: '请为我深度解析 408 核心考点：请求分页存储管理、快表（TLB）与页表机制、缺页中断处理流程，结合硬件底层原理给出命题常考陷阱。',
                    },
                    {
                      icon: '🎯',
                      title: '现场命题·随堂真题自测',
                      desc: '针对 408 重点题型现场命制 3 道考研难度测验',
                      prompt: '请针对 408 数据结构与操作系统高频重点，现场命制 3 道考研难度的单选/大题进行随堂自测，附带答案解析。',
                    },
                    {
                      icon: '📖',
                      title: '关联知识库笔记研析',
                      desc: '调取本地 Obsidian 笔记，查漏补缺与知识网串联',
                      prompt: '请检索并结合我本地 Obsidian 知识库中的相关笔记，为我梳理当前科目的重难点脉络，指出笔记中未覆盖的考研高频知识盲区。',
                    },
                    {
                      icon: '🧠',
                      title: '考点口诀与对比辨析',
                      desc: '易混淆考点对比表、一针见血记忆口诀与思维导图',
                      prompt: '请梳理 408 历年极易混淆的 5 组核心概念（如同步vs异步、阻塞vs非阻塞、中断vs异常等），以清晰对比表呈现，并提供易记口诀。',
                    },
                  ].map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(card.prompt)
                        handleSend(card.prompt)
                      }}
                      disabled={isCurrentRunning}
                      className="p-2.5 sm:p-3 text-left rounded-xl border border-cream-200 bg-surface hover:border-accent-orange hover:shadow-xs transition-all flex items-start gap-2.5 group cursor-pointer shrink-0 min-w-[210px] sm:min-w-0"
                    >
                      <span className="text-lg shrink-0 p-1.5 rounded-lg bg-cream-100 group-hover:scale-110 transition-transform">
                        {card.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-warm-800 group-hover:text-accent-orange transition-colors">
                          {card.title}
                        </div>
                        <div className="text-[10px] text-warm-500 line-clamp-1 mt-0.5">
                          {card.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt suggestions & dynamic follow-ups - 移动端单行横滑，绝不折行占高 */}
          <div className="px-3 sm:px-4 py-1.5 border-t border-cream-200/80 bg-cream-100/30 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar shrink-0">
            <button
              onClick={() => setStepTutorOpen(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-accent-orange bg-accent-orange/10 border border-accent-orange/20 hover:bg-accent-orange/20 transition-colors shrink-0 flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
              title="开启考研启发式分步辅导"
            >
              <Sparkles className="w-3 h-3" />
              💡 考研启发式分步辅导 (CoT)
            </button>

            {/* 动态标签与专题标识 */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold text-warm-600 flex items-center gap-1">
                <span>{activeAgent.icon}</span>
                <span className="hidden sm:inline font-semibold">{promptLabel}</span>
              </span>
              {promptTopic && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent-orange/10 text-accent-orange border border-accent-orange/20 font-medium hidden md:inline shrink-0">
                  {promptTopic}
                </span>
              )}
            </div>

            {/* 换一批 按钮 */}
            <button
              onClick={() => handleRefreshPrompts(true)}
              disabled={isCurrentRunning || isRefreshingPrompts}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-warm-500 hover:text-accent-orange bg-surface border border-cream-200 hover:border-accent-orange/40 transition-all shrink-0 flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
              title="换一组发散提问或考点"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isRefreshingPrompts ? 'animate-spin text-accent-orange' : ''}`} />
              <span>换一批</span>
            </button>

            {/* 动态发散问题胶囊 */}
            {promptsList.map((qp, i) => (
              <button
                key={`${i}-${qp.slice(0, 8)}`}
                onClick={() => {
                  setInput(qp)
                  handleSend(qp)
                }}
                disabled={isCurrentRunning}
                title={qp}
                className="px-2.5 py-1 rounded-lg text-[11px] text-warm-700 bg-surface border border-cream-200 hover:border-accent-orange hover:text-accent-orange transition-colors shrink-0 truncate max-w-[240px] sm:max-w-xs cursor-pointer shadow-2xs active:scale-95 group flex items-center gap-1"
              >
                <span className="text-accent-orange/70 font-mono text-[10px] group-hover:text-accent-orange">#</span>
                <span className="truncate">{qp}</span>
              </button>
            ))}
          </div>

          {/* Active Note Citation Indicator */}
          {selectedNote && (
            <div className="px-3 sm:px-4 py-1.5 bg-accent-orange/10 border-t border-accent-orange/20 flex items-center justify-between text-xs text-warm-800 shrink-0">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <FileText className="w-3.5 h-3.5 text-accent-orange shrink-0" />
                <span className="truncate">已关联知识库笔记：《{selectedNote.title || selectedNote.path}》</span>
              </span>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-warm-400 hover:text-warm-700 shrink-0 ml-2 cursor-pointer"
                title="清除笔记引用"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Skill Indicator */}
          {activeSkill && (
            <div className="px-3 sm:px-4 py-1.5 bg-purple-500/10 border-t border-purple-500/20 flex items-center justify-between text-xs text-purple-700 shrink-0">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>已激活技能：{activeSkill.shortName} ({activeSkill.command})</span>
              </span>
              <button
                onClick={() => setActiveSkill(null)}
                className="text-purple-400 hover:text-purple-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Local Skill Indicator */}
          {selectedLocalSkill && (
            <div className="px-3 sm:px-4 py-1.5 bg-indigo-500/10 border-t border-indigo-500/20 flex items-center justify-between text-xs text-indigo-700 shrink-0">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">
                  已启用本机技能：<b>{selectedLocalSkill.displayName}</b>
                </span>
              </span>
              <button
                onClick={() => setSelectedLocalSkill(null)}
                className="text-indigo-400 hover:text-indigo-700 cursor-pointer ml-2 shrink-0"
                title="关闭此技能"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 核心：只渲染当前活动会话专属的运行状态与工具提示，杜绝跨会话串台！ */}
          {runningConvs[activeConvId]?.status && (
            <div className="px-3 sm:px-4 py-1.5 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between gap-2 text-[11px] text-amber-700 animate-pulse shrink-0">
              <div className="flex items-center gap-2 truncate">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-orange shrink-0" />
                <span className="truncate">{runningConvs[activeConvId].status}</span>
              </div>
              <button
                onClick={() => handleStopConversation(activeConvId)}
                className="px-2 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold shrink-0 cursor-pointer flex items-center gap-1 transition-colors"
                title="终止当前会话生成"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>停止生成</span>
              </button>
            </div>
          )}

          {/* Input box */}
          <div className="p-2.5 sm:p-3 border-t border-cream-200 bg-surface shrink-0">
            <div className="relative flex items-end gap-2 bg-cream-100 rounded-2xl border border-cream-200 focus-within:border-accent-orange p-1.5 sm:p-2 transition-colors shadow-2xs">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`向 ${activeAgent.name} 提问 408 / 数学考点、整理笔记或自测...`}
                rows={1}
                disabled={Boolean(runningConvs[activeConvId]?.streaming)}
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-warm-800 placeholder-warm-400 focus:outline-hidden resize-none min-h-[34px] max-h-28 py-1 px-1 leading-relaxed"
              />
              {runningConvs[activeConvId]?.streaming ? (
                <button
                  onClick={() => handleStopConversation(activeConvId)}
                  className="p-2 sm:p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                  title="停止当前会话生成"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-2 sm:p-2.5 rounded-xl bg-accent-orange text-white hover:bg-accent-orange/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Practice Modal */}
      <QuickPracticeModal
        isOpen={practiceModalOpen}
        onClose={() => setPracticeModalOpen(false)}
        noteTitle={practiceData.title}
        noteContent={practiceData.content}
      />

      {/* AI Visual Memory Hub Modal */}
      <AIMemoryModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        onSelectConcept={(title: string) => {
          setInput(`请详细为我深度解析考点「${title}」，给出考点本质、真题考法和记忆口诀：`)
          inputRef.current?.focus()
        }}
      />

      {/* Local Agent Skill Picker Hub Modal */}
      <LocalSkillPickerModal
        isOpen={showSkillPicker}
        onClose={() => setShowSkillPicker(false)}
        onSelectSkill={skill => setSelectedLocalSkill(skill)}
        currentSkillId={selectedLocalSkill?.id}
      />

      {/* Model Management Modal */}
      <ModelManagerModal
        isOpen={showModelManagerModal}
        onClose={() => setShowModelManagerModal(false)}
        agents={agents}
        currentProvider={provider}
        webModels={webModels}
        onWebModelsUpdated={handleWebModelsUpdated}
        onModelsUpdated={updated => {
          setAgents(updated)
          const active = updated.find(a => a.provider === provider)
          if (active?.models && !active.models.includes(selectedModel)) {
            setSelectedModel(active.models[0] || '')
          }
        }}
      />

      {/* Step-by-Step CoT AI Tutor Modal */}
      <StepTutorModal
        isOpen={stepTutorOpen}
        onClose={() => setStepTutorOpen(false)}
        initialQuestion={input || ''}
      />

      {/* CoreForge 研核 · 三层认知记忆与项目隔离架构管理模态框 */}
      <MemoryTierModal
        isOpen={showMemoryTierModal}
        onClose={() => setShowMemoryTierModal(false)}
        activeProject={activeProject}
        activeConvTitle={activeConv?.title}
        totalConversationsCount={projectConversations.length}
        onUpdateProjectDesc={handleUpdateProjectDesc}
      />

      {/* 新建项目工作区模态框 */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface border border-cream-300 dark:border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <h3 className="font-bold text-sm text-warm-800 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-accent-orange" />
                <span>新建独立研学项目工作区</span>
              </h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="p-1 rounded-lg text-warm-400 hover:text-warm-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProjectSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-warm-700 block mb-1">
                  项目名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="例如：408 计算机网络专题、高等数学历年真题"
                  className="w-full text-xs p-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-hidden focus:border-accent-orange"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-warm-700 block mb-1">
                  项目专属记忆与领域要求 (可选)
                </label>
                <textarea
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  placeholder="为该项目注入专属背景记忆（各项目完全物理隔离，不互相串扰）"
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-hidden focus:border-accent-orange"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-warm-700 block mb-1">
                  独立本地工作目录 (cwd，可选)
                </label>
                <input
                  type="text"
                  value={newProjectCwd}
                  onChange={e => setNewProjectCwd(e.target.value)}
                  placeholder="绝对路径，例如 E:\考研\408考研学习\计算机网络"
                  className="w-full text-xs p-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-hidden focus:border-accent-orange font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-cream-200 text-xs text-warm-600 hover:bg-cream-100 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 shadow-xs cursor-pointer active:scale-95"
                >
                  确认创建并进入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
