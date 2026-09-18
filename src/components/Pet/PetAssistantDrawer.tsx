import { useState, useEffect, useRef, useMemo } from 'react'
import {
  X,
  Send,
  Loader2,
  Sparkles,
  Zap,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Cpu,
  Wrench,
  ChevronDown,
  Terminal,
  Maximize2,
  Minimize2,
  Brain,
  Target,
  BookOpen,
  ArrowRight,
  Copy,
  Save,
} from 'lucide-react'
import MarkdownRenderer from '../MarkdownRenderer'
import { api, type LocalAgentStatus, type LocalSkill } from '../../services/api'
import type { PetMood } from './DesktopPet'
import LuluAvatar from './LuluAvatar'
import { STUDY_SKILLS, type StudySkill } from '../../data/studySkills'
import { STUDY_AGENTS, type StudyAgent } from '../../data/studyAgents'
import AIMemoryModal from '../AIMemoryModal'
import QuickPracticeModal from '../QuickPracticeModal'
import LocalSkillPickerModal from '../LocalSkillPickerModal'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  skillName?: string
  toolCalls?: Array<{
    tool: string
    input?: Record<string, any>
    output?: string
    success?: boolean
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface PetAssistantDrawerProps {
  isOpen: boolean
  onClose: () => void
  dailyTokens: number
  isLocalModel: boolean
  onTokenConsumed: (tokens: number, local: boolean) => void
  onSetMood: (mood: PetMood) => void
  onTriggerQuiz?: () => void
}

type ProviderType = 'codex' | 'claude-code' | 'web'

const PROVIDER_PRESET_MODELS: Record<ProviderType, string[]> = {
  codex: ['gpt-4o', 'o3-mini', 'o1', 'gpt-4o-mini', 'codex'],
  'claude-code': ['claude-3-7-sonnet', 'claude-3-5-sonnet', 'claude-3-5-haiku'],
  web: ['deepseek-v4-pro', 'deepseek-reasoner', 'deepseek-chat', 'claude-3-7-sonnet', 'gpt-4o'],
}

export default function PetAssistantDrawer({
  isOpen,
  onClose,
  dailyTokens,
  onTokenConsumed,
  onSetMood,
}: PetAssistantDrawerProps) {
  const [provider, setProvider] = useState<ProviderType>(() => {
    return (localStorage.getItem('coreforge_active_provider') as ProviderType) || 'codex'
  })
  const [agents, setAgents] = useState<LocalAgentStatus[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [customModelInput, setCustomModelInput] = useState('')
  const [isCustomModel, setIsCustomModel] = useState(false)
  const [, setLoadingAgents] = useState(false)

  // Drawer sizing & resizing state
  const [drawerWidth, setDrawerWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('coreforge_pet_drawer_width')
      if (saved) return Math.max(380, Math.min(window.innerWidth - 60, parseInt(saved, 10)))
    } catch {}
    return 560
  })
  const [isResizing, setIsResizing] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  // Agent persona state
  const [activeAgent, setActiveAgent] = useState<StudyAgent>(() => STUDY_AGENTS[0])

  // AI Memory & Practice state
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [selectedLocalSkill, setSelectedLocalSkill] = useState<LocalSkill | null>(null)
  const [syncingModels, setSyncingModels] = useState(false)
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)
  const [practiceModalOpen, setPracticeModalOpen] = useState(false)
  const [practiceData, setPracticeData] = useState<{ title: string; content: string }>({
    title: '', content: ''
  })

  // Mouse move / up handler for free resizing
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(380, Math.min(window.innerWidth - 40, window.innerWidth - e.clientX))
      setDrawerWidth(newWidth)
      localStorage.setItem('coreforge_pet_drawer_width', newWidth.toString())
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Skill state
  const [activeSkill, setActiveSkill] = useState<StudySkill | null>(null)
  const [showSkillsMenu, setShowSkillsMenu] = useState(false)

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '你好！我是你的考研伴学小精灵「噜噜」🐾。\n\n我具备类似 Claude Code / Codex 的自主 Agent 权限，不仅能为你深度解答 408 与考研数学考点，还能直接**查阅、新建、修改和整理你知识库中的真实笔记**。\n\n💡 **考研专属 Skills 已就绪（无需安装任何外部插件）**：\n- 点击上方 Skills 标签即可调用：`大纲重构`、`图谱双链`、`推导挖空`、`错题避坑`、`命题预测`、`全库治理`。\n- 支持在 `Codex`、`Claude Code` 与 `云端双核` 间自由切换模型！',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [currentToolStatus, setCurrentToolStatus] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const fetchAgentStatus = async () => {
    setLoadingAgents(true)
    try {
      const data = await api.getLocalAgentStatus()
      setAgents(data.agents)

      // Check current provider status, auto-select best available
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

      // Restore saved model for this provider
      const savedModel = localStorage.getItem(`coreforge_model_${currentProv}`)
      const presets = PROVIDER_PRESET_MODELS[currentProv]
      if (savedModel) {
        setSelectedModel(savedModel)
        setIsCustomModel(!presets.includes(savedModel))
        if (!presets.includes(savedModel)) setCustomModelInput(savedModel)
      } else {
        setSelectedModel(presets[0])
        setIsCustomModel(false)
      }
    } catch {
      setSelectedModel(PROVIDER_PRESET_MODELS[provider][0])
    } finally {
      setLoadingAgents(false)
    }
  }

  useEffect(() => {
    fetchAgentStatus()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentToolStatus])

  if (!isOpen) return null

  const currentProviderStatus = agents.find(a => a.provider === provider)
  const isLocal = provider === 'codex' || provider === 'claude-code'

  const currentAvailableModels = useMemo(() => {
    const fromAgent = currentProviderStatus?.models || []
    const presets = PROVIDER_PRESET_MODELS[provider] || []
    const combined = Array.from(new Set([...fromAgent, ...presets]))
    return combined.slice(0, 25)
  }, [currentProviderStatus, provider])

  const handleSyncLocalModels = async () => {
    setSyncingModels(true)
    try {
      const data = await api.syncLocalAgentModels()
      if (data.agents) {
        setAgents(data.agents)
        const currentA = data.agents.find(a => a.provider === provider)
        if (currentA?.models && currentA.models.length > 0) {
          if (!selectedModel || !currentA.models.includes(selectedModel)) {
            setSelectedModel(currentA.models[0])
            localStorage.setItem(`coreforge_model_${provider}`, currentA.models[0])
          }
          setSyncFeedback(`已同步本地 ${currentA.models.length} 个模型 (来自系统/CC-Switch)`)
        } else {
          setSyncFeedback('已检测并同步本地 CLI 状态')
        }
        setTimeout(() => setSyncFeedback(null), 3500)
      }
    } catch {
      setSyncFeedback('已重新检测本地 CLI')
      setTimeout(() => setSyncFeedback(null), 3000)
    } finally {
      setSyncingModels(false)
    }
  }

  const handleProviderChange = (newProvider: ProviderType) => {
    setProvider(newProvider)
    localStorage.setItem('coreforge_active_provider', newProvider)
    const provAgent = agents.find(a => a.provider === newProvider)
    const saved = localStorage.getItem(`coreforge_model_${newProvider}`)
    const available = provAgent?.models && provAgent.models.length > 0 ? provAgent.models : PROVIDER_PRESET_MODELS[newProvider]
    if (saved) {
      setSelectedModel(saved)
      setIsCustomModel(!available.includes(saved))
      if (!available.includes(saved)) setCustomModelInput(saved)
    } else {
      setSelectedModel(available[0] || '默认')
      setIsCustomModel(false)
    }
  }

  const handleModelSelect = (model: string) => {
    setSelectedModel(model)
    setIsCustomModel(false)
    localStorage.setItem(`coreforge_model_${provider}`, model)
  }

  const handleCustomModelApply = () => {
    const trimmed = customModelInput.trim()
    if (!trimmed) return
    setSelectedModel(trimmed)
    setIsCustomModel(true)
    localStorage.setItem(`coreforge_model_${provider}`, trimmed)
  }

  const handleSkillSelect = (skill: StudySkill) => {
    if (activeSkill?.id === skill.id) {
      setActiveSkill(null)
    } else {
      setActiveSkill(skill)
      setInput(skill.placeholder)
      inputRef.current?.focus()
    }
    setShowSkillsMenu(false)
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim()
    if (!text || loading) return

    const activeSkillName = selectedLocalSkill ? selectedLocalSkill.displayName : activeSkill?.name
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      skillName: activeSkillName,
    }

    const assistantMsgId = `assistant-${Date.now()}`
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      toolCalls: [],
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput('')
    setLoading(true)
    onSetMood('thinking')
    setCurrentToolStatus('正在通过本地 Agent 执行指令...')

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
        agentPrompt: activeAgent?.systemPrompt || undefined,
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId ? { ...m, content: m.content + event.content } : m
                )
              )
            } else if (event.type === 'status') {
              setCurrentToolStatus(event.content || '正在调用知识库工具...')
            } else if (event.type === 'tool_call') {
              setCurrentToolStatus(`调用工具: ${event.tool}`)
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        toolCalls: [
                          ...(m.toolCalls || []),
                          { tool: event.tool, input: event.input, success: true },
                        ],
                      }
                    : m
                )
              )
            } else if (event.type === 'tool_result') {
              setCurrentToolStatus(`已完成: ${event.tool}`)
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        toolCalls: (m.toolCalls || []).map(tc =>
                          tc.tool === event.tool ? { ...tc, output: event.output, success: event.success } : tc
                        ),
                      }
                    : m
                )
              )
            } else if (event.type === 'usage' && event.usage) {
              onTokenConsumed(event.usage.total_tokens, isLocal)
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId ? { ...m, usage: event.usage } : m
                )
              )
            }
          } catch {
            // Ignore parse errors on chunks
          }
        }
      }

      onSetMood('happy')
      setTimeout(() => onSetMood('idle'), 2500)
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: m.content + `\n\n❌ 执行遇到异常: ${err.message}` }
            : m
        )
      )
      onSetMood('idle')
    } finally {
      setLoading(false)
      setCurrentToolStatus(null)
      setActiveSkill(null)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'reset',
        role: 'assistant',
        content: '会话已重置。随时告诉我你需要查询、创建或整理哪些考研笔记！',
      },
    ])
  }

  const handleSaveMessage = async (msg: Message) => {
    if (!msg.content) return
    const firstLine = msg.content.split('\n')[0].replace(/^#+\s*/, '').replace(/[<>:"/\\|?*]/g, '_').substring(0, 35)
    const title = firstLine || `噜噜伴学精析_${new Date().toLocaleDateString('zh-CN')}`
    const destPath = `wiki/AI伴学笔记/${title}.md`
    try {
      await api.createFile(destPath, msg.content, {
        title,
        tags: ['ai-study', activeAgent.domain, provider],
        created: new Date().toISOString().split('T')[0],
      })
      alert(`✅ 已成功沉淀为知识库真实笔记：\n${destPath}`)
    } catch (err: any) {
      alert(`保存失败: ${err.message}`)
    }
  }

  const handleTriggerPracticeFromChat = (msg: Message) => {
    setPracticeData({
      title: `${activeAgent.name} · 考点随堂测验`,
      content: msg.content.slice(0, 3000),
    })
    setPracticeModalOpen(true)
  }

  return (
    <div
      style={{ width: isMaximized ? '95vw' : `${drawerWidth}px` }}
      className={`fixed inset-y-0 right-0 z-50 bg-white dark:bg-slate-900 border-l border-cream-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all duration-150 ${
        isResizing ? 'select-none' : ''
      }`}
    >
      {/* Left resize handle */}
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute -left-1.5 inset-y-0 w-3 cursor-ew-resize z-20 flex items-center justify-center group hover:bg-orange-500/20 active:bg-orange-500/40 transition-colors"
        title="按住鼠标左键左右拖拽，可自由缩放聊天窗口宽度"
      >
        <div className="w-1 h-12 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-orange-500 group-active:bg-orange-600 transition-colors shadow-xs" />
      </div>

      {/* Header */}
      <div className="px-5 py-3 border-b border-cream-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <LuluAvatar size="sm" mood="idle" theme="yellow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-warm-900 dark:text-slate-100 text-sm">噜噜 · 考研伴学与笔记管家</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${activeAgent.badgeClass}`}>
                {activeAgent.icon} {activeAgent.title}
              </span>
            </div>
            <p className="text-[11px] text-warm-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{activeAgent.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowMemoryModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-400/30 transition-colors cursor-pointer"
            title="打开 AI 可视化记忆仓库 (考点图谱/错题盲区/长效记忆)"
          >
            <Brain className="w-3.5 h-3.5 text-purple-500" />
            <span>记忆仓库</span>
          </button>
          <button
            onClick={() => setShowSkillPicker(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-400/30 transition-colors cursor-pointer"
            title="查看并调用本机扫描到的 98+ 个 Agent 自动化技能组件"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>{selectedLocalSkill ? selectedLocalSkill.displayName : '本机技能'}</span>
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 dark:hover:text-slate-200 hover:bg-cream-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isMaximized ? '还原窗口' : '最大化窗口 (宽屏精析)'}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 dark:hover:text-slate-200 hover:bg-cream-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="清空记录"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 dark:hover:text-slate-200 hover:bg-cream-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Provider, Model & Agent Selector Control Bar */}
      <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/70 border-b border-cream-200 dark:border-slate-800 space-y-2 shrink-0">
        {/* Row 0: Agent Persona Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 shrink-0">智能体:</span>
          {STUDY_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                activeAgent.id === agent.id
                  ? 'bg-orange-500 text-white shadow-xs font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-orange-300'
              }`}
            >
              <span>{agent.icon}</span>
              <span>{agent.name}</span>
            </button>
          ))}
        </div>

        {/* Row 1: Provider Tabs & Sync Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
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
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    provider === tab.key
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isAvail && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="已就绪" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5">
            {syncFeedback && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                {syncFeedback}
              </span>
            )}
            <button
              onClick={handleSyncLocalModels}
              disabled={syncingModels}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              title="一键深度扫描并同步您本地电脑中已配置的 Claude Code / Codex / CC-Switch 模型"
            >
              <RefreshCw className={`w-3 h-3 ${syncingModels ? 'animate-spin' : ''}`} />
              <span>{syncingModels ? '同步中...' : '🔄 同步本机模型'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Dynamic Local Model Selector Pills */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto py-0.5 custom-scrollbar">
          <span className="text-slate-400 text-[11px] shrink-0 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-indigo-500" />
            模型:
          </span>

          {currentAvailableModels.map(m => (
            <button
              key={m}
              onClick={() => handleModelSelect(m)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition-all shrink-0 cursor-pointer ${
                selectedModel === m && !isCustomModel
                  ? 'bg-amber-500 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-300'
              }`}
            >
              {m}
            </button>
          ))}

          {/* Custom model entry */}
          <div className="flex items-center gap-1 shrink-0">
            <input
              type="text"
              placeholder="自定义模型..."
              value={customModelInput}
              onChange={e => setCustomModelInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomModelApply()}
              className="w-24 text-[11px] font-mono px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-400"
            />
            {customModelInput.trim() && (
              <button
                onClick={handleCustomModelApply}
                className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:bg-indigo-100"
              >
                应用
              </button>
            )}
          </div>
        </div>

        {/* Active Provider detail indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5 truncate">
            <Terminal className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">
              {currentProviderStatus?.version || (provider === 'web' ? '云端 AI 智算网络' : `${provider} 命令行已连接`)}
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-amber-600 dark:text-amber-400 shrink-0">
            <Zap className="w-3 h-3" />
            <span>今日消耗: {dailyTokens.toLocaleString()} tokens</span>
          </div>
        </div>
      </div>

      {/* Built-in Study Skills Toolbar (免插件考研笔记与学习功能) */}
      <div className="px-5 py-2 bg-amber-50/50 dark:bg-slate-900 border-b border-amber-200/50 dark:border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            考研研学 &amp; 笔记专属 Skills (零插件一键触发):
          </span>
          <button
            onClick={() => setShowSkillsMenu(!showSkillsMenu)}
            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            <span>{showSkillsMenu ? '收起' : '展开全部技能'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showSkillsMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Skill Chips */}
        <div className="flex flex-wrap gap-1.5">
          {STUDY_SKILLS.slice(0, showSkillsMenu ? STUDY_SKILLS.length : 4).map(skill => {
            const isCurrent = activeSkill?.id === skill.id
            return (
              <button
                key={skill.id}
                onClick={() => handleSkillSelect(skill)}
                title={skill.desc}
                className={`px-2.5 py-1 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500 text-white font-bold shadow-xs scale-102'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:bg-amber-50/40'
                }`}
              >
                <span>{skill.emoji}</span>
                <span>{skill.shortName}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {skill.command}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Skill Notice Banner */}
        {activeSkill && (
          <div className="mt-2 p-2 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              <span>已激活技能：<b>{activeSkill.name}</b></span>
            </div>
            <button
              onClick={() => setActiveSkill(null)}
              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 text-xs font-bold"
            >
              取消
            </button>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {m.role === 'assistant' ? (
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center shrink-0">
                <LuluAvatar size="xs" mood="idle" theme="yellow" showAccessories={false} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                你
              </div>
            )}

            <div className={`space-y-2 max-w-[85%] ${m.role === 'user' ? 'items-end' : ''}`}>
              {m.skillName && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-semibold border border-amber-300">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>执行 Skill: {m.skillName}</span>
                </div>
              )}

              {/* Tool calls badges */}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <div className="space-y-1">
                  {m.toolCalls.map((tc, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5"
                    >
                      <Wrench className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="font-bold">{tc.tool}</span>
                      {tc.input?.path && (
                        <span className="text-slate-500 truncate max-w-[200px]">({tc.input.path})</span>
                      )}
                      {tc.input?.query && (
                        <span className="text-slate-500 truncate max-w-[200px]">({tc.input.query})</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                }`}
              >
                <MarkdownRenderer content={m.content} />
              </div>

              {m.role === 'assistant' && m.content && !loading && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(m.content)
                      alert('已复制回答内容')
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>复制</span>
                  </button>
                  <button
                    onClick={() => handleSaveMessage(m)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    <span>沉淀笔记</span>
                  </button>
                  <button
                    onClick={() => handleTriggerPracticeFromChat(m)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>考我相关题</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty state rich study memory dashboard to fill vertical void */}
        {messages.length <= 1 && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-indigo-50/40 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-amber-200/60 dark:border-slate-700/80 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    研学记忆矩阵 · 408 与考研数学速览
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    点击考点立即唤起深度解析与记忆强化
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMemoryModal(true)}
                className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
              >
                <span>记忆仓库</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { title: '虚拟内存四级页表', tag: '操作系统', color: 'border-blue-200 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/30' },
                { title: '流水线冲突与旁路转发', tag: '计组', color: 'border-purple-200 text-purple-700 dark:text-purple-300 bg-purple-50/50 dark:bg-purple-950/30' },
                { title: '泰勒公式与麦克劳林展开', tag: '高等数学', color: 'border-emerald-200 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30' },
                { title: 'TCP 拥塞控制四阶段', tag: '计网', color: 'border-amber-200 text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30' },
                { title: '红黑树平衡调节与旋转', tag: '数据结构', color: 'border-rose-200 text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/30' },
                { title: '矩阵特征值与正交化', tag: '线性代数', color: 'border-cyan-200 text-cyan-700 dark:text-cyan-300 bg-cyan-50/50 dark:bg-cyan-950/30' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(`请详细为我深度解析考点「${item.title}」，给出考点本质、真题常考陷阱和速记口诀：`)
                    inputRef.current?.focus()
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${item.color}`}
                >
                  <div className="text-[10px] font-semibold opacity-75">{item.tag}</div>
                  <div className="text-xs font-bold truncate mt-0.5">{item.title}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">快捷操作:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setPracticeData({
                      title: '408 核心架构随堂抽考',
                      content: '408 核心基础考点测试题：包含数据结构、组成原理、操作系统与网络常见经典真题。',
                    })
                    setPracticeModalOpen(true)
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 text-[11px] font-medium flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Target className="w-3 h-3 text-amber-500" />
                  <span>随堂抽测</span>
                </button>
                <button
                  onClick={() => setShowMemoryModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 text-[11px] font-medium flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Brain className="w-3 h-3 text-indigo-500" />
                  <span>记忆图谱</span>
                </button>
                <button
                  onClick={handleSyncLocalModels}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400 text-[11px] font-medium flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 text-emerald-500 ${syncingModels ? 'animate-spin' : ''}`} />
                  <span>同步模型</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Streaming / Tool status indicator */}
        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>{currentToolStatus || '噜噜正在思考推导中...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Local Skill Banner */}
      {selectedLocalSkill && (
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border-t border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">已启用本机技能：<b>{selectedLocalSkill.displayName}</b> ({selectedLocalSkill.source} / {selectedLocalSkill.category})</span>
          </span>
          <button
            onClick={() => setSelectedLocalSkill(null)}
            className="text-indigo-400 hover:text-indigo-700 cursor-pointer ml-2 shrink-0"
            title="取消技能"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="relative">
          <textarea
            ref={inputRef}
            rows={3}
            placeholder={
              selectedLocalSkill
                ? `[已载入本机技能: ${selectedLocalSkill.displayName}] 输入问题或吩咐智能体执行该技能...`
                : activeSkill
                ? `[${activeSkill.shortName}] ${activeSkill.placeholder}`
                : `吩咐噜噜管理笔记、解析定理，或输入 / 调用专属技能...`
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 pr-12 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 shadow-inner"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="absolute right-2.5 bottom-3.5 p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-amber-600 hover:to-orange-600 transition-all shadow-md cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>当前引擎: <b className="text-slate-700 dark:text-slate-200">{provider}</b> ({selectedModel})</span>
          </div>
          <div>Shift+Enter 换行 / Enter 发送</div>
        </div>
      </div>

      {/* AI Memory Hub Modal */}
      <AIMemoryModal
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        onSelectConcept={(title: string) => {
          setInput(`请详细为我深度解析考点「${title}」，给出考点本质、真题考法和记忆口诀：`)
          inputRef.current?.focus()
        }}
      />

      {/* Quick Practice Modal */}
      <QuickPracticeModal
        isOpen={practiceModalOpen}
        onClose={() => setPracticeModalOpen(false)}
        noteTitle={practiceData.title}
        noteContent={practiceData.content}
      />

      {/* Local Skill Picker Modal */}
      <LocalSkillPickerModal
        isOpen={showSkillPicker}
        onClose={() => setShowSkillPicker(false)}
        onSelectSkill={skill => setSelectedLocalSkill(skill)}
        currentSkillId={selectedLocalSkill?.id}
      />
    </div>
  )
}
