import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Send, Loader2, FolderTree, X, Wrench, ChevronDown,
  Plus, Trash2, MessageSquare, Save, Sparkles, CheckCircle2, Target,
  Copy, Check, Bot, FileText, Brain, RefreshCw, Settings
} from 'lucide-react'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { api, type FileDetail, type LocalAgentStatus, type LocalSkill } from '../services/api'
import { useVaultTree } from '../hooks/useVaultData'
import FileExplorer from '../components/FileExplorer'
import LuluAvatar from '../components/Pet/LuluAvatar'
import { STUDY_SKILLS, type StudySkill } from '../data/studySkills'
import { STUDY_AGENTS, type StudyAgent } from '../data/studyAgents'
import QuickPracticeModal from '../components/QuickPracticeModal'
import AIMemoryModal from '../components/AIMemoryModal'
import LocalSkillPickerModal from '../components/LocalSkillPickerModal'
import ModelManagerModal from '../components/ModelManagerModal'

interface ToolCallInfo {
  tool: string
  input: Record<string, any>
  output?: string
  success?: boolean
}

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentName?: string
  agentIcon?: string
  toolCalls: ToolCallInfo[]
  citedNotes?: { title: string; path: string; excerpt: string; tags: string[] }[]
  timestamp: Date
  streaming?: boolean
}

interface Conversation {
  id: string
  title: string
  messages: AgentMessage[]
  createdAt: Date
}

type ProviderType = 'codex' | 'claude-code' | 'web'

const PROVIDER_PRESET_MODELS: Record<ProviderType, string[]> = {
  codex: ['gpt-5.6-luna', 'gpt-4o', 'o3-mini', 'o1', 'gpt-4o-mini'],
  'claude-code': ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-flash', 'deepseek-reasoner'],
  web: ['deepseek-v4-pro', 'deepseek-flash', 'deepseek-reasoner', 'deepseek-chat'],
}

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')
  const [input, setInput] = useState('')

  // Agent Selection state
  const [activeAgent, setActiveAgent] = useState<StudyAgent>(() => STUDY_AGENTS[0])

  // Model & Provider Selection state
  const [provider, setProvider] = useState<ProviderType>(() => {
    return (localStorage.getItem('coreforge_active_provider') as ProviderType) || 'codex'
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

  // Built-in Skill state
  const [activeSkill, setActiveSkill] = useState<StudySkill | null>(null)
  const [showSkillsMenu, setShowSkillsMenu] = useState(false)

  // Study Tone / Mode
  const [studyTone, setStudyTone] = useState<'rigorous' | 'vivid' | 'exam'>('rigorous')

  // UI state
  const [loading, setLoading] = useState(false)
  const [currentToolStatus, setCurrentToolStatus] = useState<string | null>(null)
  const [showFiles, setShowFiles] = useState(false)
  const [showSessions, setShowSessions] = useState(true)
  const [selectedNote, setSelectedNote] = useState<FileDetail | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Quick Practice Modal state
  const [practiceModalOpen, setPracticeModalOpen] = useState(false)
  const [practiceData, setPracticeData] = useState<{ title: string; content: string }>({
    title: '', content: ''
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { tree } = useVaultTree()
  const abortRef = useRef<AbortController | null>(null)

  // Get active conversation
  const activeConv = conversations.find(c => c.id === activeConvId)
  const messages = activeConv?.messages || []

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // Compute dynamically available models for current provider
  const currentAvailableModels = useMemo(() => {
    const active = agents.find(a => a.provider === provider)
    if (active?.models && active.models.length > 0) {
      return active.models
    }
    return PROVIDER_PRESET_MODELS[provider] || []
  }, [agents, provider])

  const activeAgentStatus = agents.find(a => a.provider === provider)

  const handleSyncLocalModels = async () => {
    setSyncingModels(true)
    setModelSyncFeedback(null)
    try {
      const res = await api.syncLocalAgentModels()
      if (res.agents) {
        setAgents(res.agents)
        const active = res.agents.find(a => a.provider === provider)
        if (active?.models && active.models.length > 0) {
          setSelectedModel(active.models[0])
          localStorage.setItem(`coreforge_model_${provider}`, active.models[0])
        }
      }
      setModelSyncFeedback(`已从本机同步 ${res.agents?.length || 0} 个本地引擎模型`)
      setTimeout(() => setModelSyncFeedback(null), 3500)
    } catch (err: any) {
      setModelSyncFeedback(`同步失败: ${err.message}`)
      setTimeout(() => setModelSyncFeedback(null), 3500)
    } finally {
      setSyncingModels(false)
    }
  }

  const handleDeleteCurrentModel = async () => {
    if (!selectedModel || selectedModel === '__custom__') return
    if (!window.confirm(`确定要从下拉列表中删除模型「${selectedModel}」吗？`)) return
    try {
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

  // Fetch agent status & auto-select models
  const fetchAgentStatus = useCallback(async () => {
    setLoadingAgents(true)
    try {
      const data = await api.getLocalAgentStatus()
      setAgents(data.agents)

      const codexAgent = data.agents.find(a => a.provider === 'codex')
      const claudeAgent = data.agents.find(a => a.provider === 'claude-code')

      let currentProv = provider
      if (currentProv === 'codex' && !codexAgent?.available && claudeAgent?.available) {
        currentProv = 'claude-code'
        setProvider('claude-code')
      } else if (!codexAgent?.available && !claudeAgent?.available) {
        currentProv = 'web'
        setProvider('web')
      }

      const savedModel = localStorage.getItem(`coreforge_model_${currentProv}`)
      const activeObj = data.agents.find(a => a.provider === currentProv)
      const availableModels = (activeObj?.models && activeObj.models.length > 0)
        ? activeObj.models
        : PROVIDER_PRESET_MODELS[currentProv]

      if (savedModel && (availableModels.includes(savedModel) || savedModel.length > 0)) {
        setSelectedModel(savedModel)
        setIsCustomModel(!availableModels.includes(savedModel))
        if (!availableModels.includes(savedModel)) setCustomModelInput(savedModel)
      } else {
        setSelectedModel(availableModels[0] || 'default')
        setIsCustomModel(false)
      }
    } catch {
      setSelectedModel(PROVIDER_PRESET_MODELS[provider][0])
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
    const presets = PROVIDER_PRESET_MODELS[newProv]
    if (savedModel) {
      setSelectedModel(savedModel)
      setIsCustomModel(!presets.includes(savedModel))
      if (!presets.includes(savedModel)) setCustomModelInput(savedModel)
    } else {
      setSelectedModel(presets[0])
      setIsCustomModel(false)
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
    }
  }

  const handleCustomModelConfirm = () => {
    if (customModelInput.trim()) {
      setSelectedModel(customModelInput.trim())
      localStorage.setItem(`coreforge_model_${provider}`, customModelInput.trim())
    }
  }

  // Create new conversation
  const createConversation = useCallback((initialAgent = activeAgent) => {
    const id = `conv-${Date.now()}`
    const newConv: Conversation = {
      id,
      title: `${initialAgent.name} 专属伴学`,
      messages: [{
        id: 'welcome',
        role: 'assistant',
        agentName: initialAgent.name,
        agentIcon: initialAgent.icon,
        content: `你好！我是你的 ${initialAgent.title}「${initialAgent.name}」${initialAgent.icon}。\n\n${initialAgent.description}\n\n💡 **已为你量身就绪**：\n- **智能体定位**：${initialAgent.role}\n- **模型引擎**：自由切换 Codex / Claude Code / 云端双核\n- **免插件研学技能**：支持直接一键调用大纲重构、图谱双链、定理挖空、错题诊断！\n\n试着向我提问，或点击下方快捷考点直接开始研学！`,
        toolCalls: [],
        timestamp: new Date(),
      }],
      createdAt: new Date(),
    }
    setConversations(prev => [newConv, ...prev])
    setActiveConvId(id)
  }, [activeAgent])

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
    setConversations(prev => {
      const next = prev.filter(c => c.id !== convId)
      if (activeConvId === convId && next.length > 0) {
        setActiveConvId(next[0].id)
      } else if (next.length === 0) {
        setActiveConvId('')
      }
      return next
    })
  }, [activeConvId])

  const handleSend = async (overridePrompt?: string) => {
    const text = (overridePrompt || input).trim()
    if (!text || loading || !activeConvId) return

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

    updateConversation(activeConvId, conv => ({
      ...conv,
      messages: [...conv.messages, userMsg, assistantMsg],
      title: conv.messages.length <= 1 ? text.substring(0, 26) : conv.title,
    }))

    setInput('')
    setLoading(true)
    setCurrentToolStatus('正在调取智能体与模型进行深度思考...')

    const convId = activeConvId
    const controller = new AbortController()
    abortRef.current = controller

    // Construct tone instruction
    let toneInstruction = ''
    if (studyTone === 'rigorous') toneInstruction = '【作答风格要求】：学术严谨模式，考纲对齐，公式推导严谨规范，杜绝一切幻觉。'
    else if (studyTone === 'vivid') toneInstruction = '【作答风格要求】：通俗直观模式，多打比方与生动类比，帮助快速构建底层脑海图景。'
    else toneInstruction = '【作答风格要求】：考场冲刺模式，直击采分点与答题模板，快速提炼考场必背避坑口诀。'

    try {
      const endpoint = '/api/local-agents/chat'
      const skillPrompt = selectedLocalSkill
        ? `【启用本地技能: ${selectedLocalSkill.displayName} (${selectedLocalSkill.name})】\n${selectedLocalSkill.instructions}`
        : (activeSkill?.prompt || undefined)

      const body = {
        provider,
        prompt: text,
        model: selectedModel || undefined,
        skillPrompt,
        agentPrompt: `${activeAgent.systemPrompt}\n${toneInstruction}`,
        projectName: '考研 408 & 数学研学工作台',
        pageContext: `AI 伴学主页面 (${activeAgent.name})`,
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
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

            updateConversation(convId, conv => {
              const msgs = [...conv.messages]
              const idx = msgs.findIndex(m => m.id === assistantMsgId)
              if (idx === -1) return conv

              const msg = { ...msgs[idx] }

              switch (event.type) {
                case 'text':
                  msg.content += event.content || ''
                  break
                case 'status':
                  setCurrentToolStatus(event.content || '智能体执行中...')
                  break
                case 'tool_call':
                  setCurrentToolStatus(`调用知识库工具: ${event.tool}`)
                  msg.toolCalls = [
                    ...msg.toolCalls,
                    { tool: event.tool, input: event.input || {}, success: true },
                  ]
                  break
                case 'tool_result':
                  setCurrentToolStatus(`已完成: ${event.tool}`)
                  msg.toolCalls = msg.toolCalls.map(tc =>
                    tc.tool === event.tool ? { ...tc, output: event.output, success: event.success } : tc
                  )
                  break
                case 'done':
                  msg.streaming = false
                  break
                case 'error':
                  msg.content += `\n\n❌ **执行异常**: ${event.content}`
                  msg.streaming = false
                  break
              }

              msgs[idx] = msg
              return { ...conv, messages: msgs }
            })
          } catch {
            // ignore chunk parse errors
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        updateConversation(convId, conv => {
          const msgs = [...conv.messages]
          const idx = msgs.findIndex(m => m.id === assistantMsgId)
          if (idx !== -1) {
            msgs[idx] = {
              ...msgs[idx],
              content: `抱歉，模型响应异常: ${err.message}。请检查服务或切换模型重试。`,
              streaming: false
            }
          }
          return { ...conv, messages: msgs }
        })
      }
    } finally {
      updateConversation(convId, conv => {
        const msgs = [...conv.messages]
        const idx = msgs.findIndex(m => m.id === assistantMsgId)
        if (idx !== -1 && msgs[idx].streaming) {
          msgs[idx] = { ...msgs[idx], streaming: false }
        }
        return { ...conv, messages: msgs }
      })
      setLoading(false)
      setCurrentToolStatus(null)
      abortRef.current = null
      setActiveSkill(null)
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
      {/* Top Section 1: Agent Persona Switcher */}
      <div className="bg-surface border border-cream-200 rounded-xl px-3 py-2 shadow-2xs shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2">
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

      {/* Top Section 2: Model & Engine Switcher + Skills Bar */}
      <div className="bg-surface border border-cream-200 rounded-xl px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Left: Provider & Model Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Provider Tabs */}
          <div className="flex items-center gap-1 bg-cream-200/70 p-1 rounded-xl">
            {[
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
                      ? 'bg-surface text-warm-800 shadow-xs font-bold'
                      : 'text-warm-500 hover:text-warm-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isAvail && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="已就绪" />
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
              {currentAvailableModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
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

            {/* Open Model Manager Modal */}
            <button
              onClick={() => setShowModelManagerModal(true)}
              title="管理全部大模型，净化下拉列表"
              className="px-2 py-1 rounded-lg border border-cream-200 bg-cream-100 hover:border-accent-orange text-xs text-warm-700 font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Settings className="w-3 h-3 text-accent-orange" />
              <span>管理模型</span>
            </button>

            {/* Sync Local Models Button */}
            <button
              onClick={handleSyncLocalModels}
              disabled={syncingModels}
              title="一键扫描并同步本机已配置的大模型"
              className="px-2 py-1 rounded-lg border border-cream-200 bg-cream-100 hover:border-accent-orange text-xs text-warm-700 font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 text-accent-orange ${syncingModels ? 'animate-spin' : ''}`} />
              <span>{syncingModels ? '同步中...' : '🔄 扫描'}</span>
            </button>

            {modelSyncFeedback && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                {modelSyncFeedback}
              </span>
            )}
          </div>
        </div>

        {/* Right: AI Memory Hub + Local Skills Picker + Built-in Skills */}
        <div className="flex items-center gap-2 flex-wrap">
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
                      <span className="text-xs font-bold text-warm-800 flex items-center gap-1.5">
                        <span>{skill.emoji}</span>
                        <span>{skill.shortName}</span>
                      </span>
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
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            新建对话
          </button>
        </div>
      </div>

      {/* Main Body: Sidebar + Chat Stream */}
      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden">
        {/* Session sidebar */}
        <div className={`shrink-0 transition-all duration-200 ${showSessions ? 'w-52' : 'w-0'} overflow-hidden`}>
          <div className="h-full flex flex-col bg-surface border border-cream-200 rounded-xl">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-cream-200">
              <span className="text-xs font-medium text-warm-500">对话历史</span>
              <button
                onClick={() => createConversation(activeAgent)}
                className="p-1 rounded hover:bg-cream-200 text-warm-400 hover:text-warm-600"
                title="新建对话"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto py-1">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 px-3 py-2 mx-1 rounded-lg cursor-pointer text-xs transition-colors ${
                    activeConvId === conv.id
                      ? 'bg-accent-orange/15 text-warm-800 font-medium'
                      : 'text-warm-500 hover:bg-cream-200 hover:text-warm-700'
                  }`}
                  onClick={() => setActiveConvId(conv.id)}
                >
                  <MessageSquare className="w-3 h-3 shrink-0" />
                  <span className="truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id) }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-cream-300 text-warm-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File Explorer sidebar */}
        <div className={`shrink-0 transition-all duration-200 ${showFiles ? 'w-56' : 'w-0'} overflow-hidden`}>
          <FileExplorer tree={tree} onFileClick={handleNoteClick} />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-surface border border-cream-200 rounded-2xl overflow-hidden min-w-0">
          {/* Sub Toolbar */}
          <div className="px-4 py-2 border-b border-cream-200 flex items-center justify-between gap-3 text-xs bg-cream-100/40">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSessions(!showSessions)}
                className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                  showSessions ? 'bg-accent-orange/15 text-warm-800 border-accent-orange/30' : 'bg-transparent text-warm-500 border-cream-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> 对话
              </button>
              <button
                onClick={() => setShowFiles(!showFiles)}
                className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                  showFiles ? 'bg-accent-orange/15 text-warm-800 border-accent-orange/30' : 'bg-transparent text-warm-500 border-cream-200'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" /> 知识库文件
              </button>

              <span className="text-[11px] text-warm-400 pl-2 border-l border-cream-200 flex items-center gap-1.5">
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
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => {
              const isUser = msg.role === 'user'
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

                    {/* Bottom action buttons on assistant messages */}
                    {!isUser && !msg.streaming && msg.content && (
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-warm-400">
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-warm-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors"
                          title="复制完整回复 Markdown"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? '已复制' : '复制'}</span>
                        </button>

                        {/* Practical Tool 1: Save as Note */}
                        <button
                          onClick={() => handleSaveMessage(msg)}
                          className="hover:text-warm-700 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cream-200 transition-colors"
                          title="一键将此讲解沉淀为知识库 Markdown 真实笔记"
                        >
                          <Save className="w-3 h-3 text-purple-500" />
                          <span>沉淀笔记</span>
                        </button>

                        {/* Practical Tool 2: Test 3 Questions */}
                        <button
                          onClick={() => handleTriggerPracticeFromChat(msg)}
                          className="hover:text-orange-600 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-orange-50 text-orange-600 font-medium transition-colors"
                          title="针对本条考点讲解，现场命制 3 道真题自测"
                        >
                          <Target className="w-3 h-3" />
                          <span>考我3道题</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {/* Quick-start exploration cards when conversation is fresh */}
            {messages.length <= 1 && (
              <div className="mt-4 p-4 rounded-2xl border border-cream-200 bg-cream-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-warm-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                    <span>研学探索·快捷启发：</span>
                  </span>
                  <span className="text-[11px] text-warm-400">点击卡片即可直接向 {activeAgent.name} 发起深度研习</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      disabled={loading}
                      className="p-3 text-left rounded-xl border border-cream-200 bg-surface hover:border-accent-orange hover:shadow-xs transition-all flex items-start gap-2.5 group cursor-pointer"
                    >
                      <span className="text-xl shrink-0 p-1.5 rounded-lg bg-cream-100 group-hover:scale-110 transition-transform">
                        {card.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-warm-800 group-hover:text-accent-orange transition-colors">
                          {card.title}
                        </div>
                        <div className="text-[11px] text-warm-500 line-clamp-1 mt-0.5">
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

          {/* Quick prompt suggestions for current agent */}
          <div className="px-4 py-2 border-t border-cream-200/80 bg-cream-100/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-warm-400 shrink-0">
              {activeAgent.icon} 考点速问:
            </span>
            {activeAgent.quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(qp)
                  handleSend(qp)
                }}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg text-[11px] text-warm-600 bg-surface border border-cream-200 hover:border-accent-orange hover:text-accent-orange transition-colors shrink-0 truncate max-w-xs cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Active Note Citation Indicator */}
          {selectedNote && (
            <div className="px-4 py-1.5 bg-accent-orange/10 border-t border-accent-orange/20 flex items-center justify-between text-xs text-warm-800">
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
            <div className="px-4 py-1.5 bg-purple-500/10 border-t border-purple-500/20 flex items-center justify-between text-xs text-purple-700">
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
            <div className="px-4 py-1.5 bg-indigo-500/10 border-t border-indigo-500/20 flex items-center justify-between text-xs text-indigo-700">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">
                  已启用本机 Agent 技能：<b>{selectedLocalSkill.displayName}</b> ({selectedLocalSkill.source} / {selectedLocalSkill.category})
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

          {/* Loading tool indicator */}
          {currentToolStatus && (
            <div className="px-4 py-1 bg-amber-500/10 border-t border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-700 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{currentToolStatus}</span>
            </div>
          )}

          {/* Input box */}
          <div className="p-3 border-t border-cream-200 bg-surface">
            <div className="relative flex items-end gap-2 bg-cream-100 rounded-xl border border-cream-200 focus-within:border-accent-orange p-2 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`向 ${activeAgent.name} 提问 408 / 数学考点、整理笔记或现场命题自测...`}
                rows={2}
                disabled={loading}
                className="flex-1 bg-transparent border-none text-xs text-warm-800 placeholder-warm-400 focus:outline-hidden resize-none min-h-[38px] max-h-32"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-2 rounded-lg bg-accent-orange text-white hover:bg-accent-orange/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
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
        onModelsUpdated={updated => {
          setAgents(updated)
          const active = updated.find(a => a.provider === provider)
          if (active?.models && !active.models.includes(selectedModel)) {
            setSelectedModel(active.models[0] || '')
          }
        }}
      />
    </div>
  )
}
