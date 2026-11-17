import { useState, useEffect, useRef } from 'react'
import {
  X,
  Send,
  Loader2,
  Trash2,
  Copy,
  Save,
  ChevronDown,
  Check,
  Bot,
  Sparkles,
} from 'lucide-react'
import MarkdownRenderer from '../MarkdownRenderer'
import { api, type LocalAgentStatus } from '../../services/api'
import { STUDY_AGENTS } from '../../data/studyAgents'
import { formatUnifiedModelName, detectCrossSubjectProxy } from '../../utils/modelDisplay'
import type { PetMood } from './DesktopPet'
import LuluAvatar, { useActivePetPersona, PetChibiHead, type PetId } from './LuluAvatar'
import DangoAvatar from '../DangoAvatar'
import { useAuth } from '../../contexts/AuthContext'
import { getAuthHeaders } from '../../services/auth'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentName?: string
  agentIcon?: string
  isProxyReply?: boolean
  proxySubject?: string
  modelLabel?: string
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

type ProviderType = 'antigravity' | 'codex' | 'claude-code' | 'web'

const PROVIDER_INFO: Record<ProviderType, { label: string; short: string; defaultModel: string }> = {
  antigravity: { label: '✨ Antigravity (Gemini 3.8 Flash)', short: '✨ Antigravity', defaultModel: 'gemini-3.8-flash' },
  codex: { label: '🤖 Codex', short: '🤖 Codex', defaultModel: 'gpt-5.6-luna' },
  'claude-code': { label: '⚡ Claude', short: '⚡ Claude', defaultModel: 'deepseek-v4-flash' },
  web: { label: '☁️ 云端双核', short: '☁️ 云端', defaultModel: 'deepseek-v4-pro' },
}

const QUICK_PROMPTS = [
  '🌿 备考好焦虑，感觉背不完学不动了...',
  '💡 帮我解析泰勒展开公式本质与考点',
  '⚡ 408 虚拟内存页表与 TLB 命中机制',
  '🎯 考我一道 408 核心考点高频选择题',
]

function buildWelcomeText(petId: PetId): string {
  if (petId === 'feiyu') {
    return '哼哼，我是大肥鱼（才不是胖鱼，是 DeepSeek 鲸鱼娘啦）！🐟🍚\n只要投喂够热乎的大白米饭补充 Token，不管是 408 算法/高数证明卡壳，还是备考压力大想找本鱼吐槽摸鱼，我都会全程陪着你稳稳上岸哟~ ✨'
  }
  return '我是奶龙！🐲🫧\n无论是 408/高数考点卡壳，还是备考压力大、心里焦虑学不动了，都可以随时跟我聊聊！揉揉大肚皮，俺不仅懂真题算法，还能做你的暖心心理疗愈师哟~ 🍗✨'
}

export default function PetAssistantDrawer({
  isOpen,
  onClose,
  onTokenConsumed,
  onSetMood,
}: PetAssistantDrawerProps) {
  const [persona, setPetPersona] = useActivePetPersona()
  const isFeiyu = persona.id === 'feiyu'

  const [provider, setProvider] = useState<ProviderType>(() => {
    return (localStorage.getItem('coreforge_active_provider') as ProviderType) || 'codex'
  })
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(`coreforge_model_${provider}`) || PROVIDER_INFO[provider].defaultModel
  })
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-408')
  const activeStudyAgent = STUDY_AGENTS.find(a => a.id === selectedAgentId) || STUDY_AGENTS[0]
  const isPsychologyMode = activeStudyAgent.id === 'agent-psychology'
  const [agents, setAgents] = useState<LocalAgentStatus[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  useEffect(() => {
    api.getLocalAgentStatus()
      .then(data => {
        if (data?.agents) setAgents(data.agents)
      })
      .catch(() => {})
  }, [])

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: buildWelcomeText(persona.id),
    },
  ])
  const [loading, setLoading] = useState(false)
  const [currentToolStatus, setCurrentToolStatus] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 当切换宠物且仍处于初始欢迎消息时，自动同步对应角色的欢迎开场白
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], content: buildWelcomeText(persona.id) }]
      }
      return prev
    })
  }, [persona.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentToolStatus])

  if (!isOpen) return null

  const handleProviderSelect = (newProv: ProviderType) => {
    setProvider(newProv)
    localStorage.setItem('coreforge_active_provider', newProv)
    const provAgent = agents.find(a => a.provider === newProv)
    const available = provAgent?.models && provAgent.models.length > 0 ? provAgent.models[0] : PROVIDER_INFO[newProv].defaultModel
    const saved = localStorage.getItem(`coreforge_model_${newProv}`) || available
    setSelectedModel(saved)
    setShowConfig(false)
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    }

    const proxySubject = detectCrossSubjectProxy(text, activeStudyAgent.id)
    const assistantMsgId = `assistant-${Date.now()}`
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      agentName: activeStudyAgent.name,
      agentIcon: activeStudyAgent.icon,
      isProxyReply: Boolean(proxySubject),
      proxySubject: proxySubject || undefined,
      modelLabel: formatUnifiedModelName(provider, selectedModel),
      toolCalls: [],
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput('')
    setLoading(true)
    onSetMood('thinking')
    setCurrentToolStatus(
      isPsychologyMode
        ? isFeiyu
          ? '大肥鱼正放下大白米饭碗认真倾听你的心里话...'
          : '奶龙正在捧着热茶认真倾听你的心里话...'
        : `${activeStudyAgent.name}正在查阅知识库并推导...`
    )

    try {
      const isLocal = provider === 'codex' || provider === 'claude-code'
      const endpoint = '/api/local-agents/chat'
      const historyPayload = messages
        .filter(m => m.id !== 'welcome' && m.id !== 'reset' && m.content)
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }))
      const body = {
        provider,
        prompt: text,
        model: selectedModel || undefined,
        history: historyPayload,
        agentPrompt: `${activeStudyAgent.systemPrompt}${
          proxySubject ? `\n【跨科代答提示】：本题涉及${proxySubject}，当前由「${activeStudyAgent.name}」代答。` : ''
        }`,
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
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
              setCurrentToolStatus(event.content || '正在调用知识库...')
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
            // chunk 容错
          }
        }
      }

      onSetMood('happy')
      setTimeout(() => onSetMood('idle'), 2500)
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: m.content + `\n\n❌ 遇到异常: ${err.message}` }
            : m
        )
      )
      onSetMood('idle')
    } finally {
      setLoading(false)
      setCurrentToolStatus(null)
    }
  }

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSaveToNote = async (msg: Message) => {
    if (!msg.content) return
    const firstLine = msg.content
      .split('\n')[0]
      .replace(/^#+\s*/, '')
      .replace(/[<>:"/\\|?*]/g, '_')
      .substring(0, 30)
    const title = firstLine || `${persona.name}精析_${new Date().toLocaleDateString('zh-CN')}`
    const destPath = `wiki/AI伴学笔记/${title}.md`
    try {
      await api.createFile(destPath, msg.content, {
        title,
        tags: ['ai-study', `${persona.name}小助手`, provider],
        created: new Date().toISOString().split('T')[0],
      })
      setSavedId(msg.id)
      setTimeout(() => setSavedId(null), 3000)
    } catch (err: any) {
      alert(`保存失败: ${err.message}`)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'reset',
        role: 'assistant',
        content: '会话已重置。随时告诉我你需要查询或解析哪些考点！',
      },
    ])
  }

  const { user } = useAuth()

  return (
    <>
      {isMobile && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] animate-in fade-in"
        />
      )}

      <div
        className={`fixed z-50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border ${
          isFeiyu
            ? 'border-sky-200/90 dark:border-slate-800'
            : 'border-amber-200/90 dark:border-slate-800'
        } shadow-xl flex flex-col overflow-hidden animate-in fade-in duration-200 ${
          isMobile
            ? 'inset-x-2 bottom-3.5 h-[70vh] max-h-[560px] rounded-3xl slide-in-from-bottom-5'
            : 'right-4 bottom-20 w-[380px] h-[520px] max-h-[calc(100vh-100px)] rounded-3xl slide-in-from-bottom-4'
        }`}
      >
        {/* 极简轻巧 Header（含奶龙 ⇄ 大肥鱼一键切换胶囊） */}
        <div
          className={`px-3.5 py-2.5 border-b flex items-center justify-between shrink-0 ${
            isFeiyu
              ? 'border-sky-100 dark:border-slate-800/80 bg-gradient-to-r from-sky-400/15 via-blue-400/10 to-transparent'
              : 'border-amber-100 dark:border-slate-800/80 bg-gradient-to-r from-amber-400/15 via-orange-400/10 to-transparent'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                isFeiyu
                  ? 'bg-sky-100 dark:bg-sky-950 border-sky-300/80'
                  : 'bg-amber-100 dark:bg-amber-950 border-amber-300/80'
              }`}
            >
              <LuluAvatar petId={persona.id} size="xs" mood={loading ? 'thinking' : 'idle'} isSpeaking={loading} showAccessories={false} />
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                {persona.name} · 随身伴学
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="在线就绪" />
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* 双宠快捷切换小胶囊 */}
            <div
              className="inline-flex items-center p-0.5 rounded-lg bg-white/85 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700"
              role="group"
              aria-label="切换伴学宠物"
            >
              <button
                type="button"
                onClick={() => setPetPersona('nailong')}
                aria-pressed={!isFeiyu}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  !isFeiyu
                    ? 'bg-amber-400 text-amber-950 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="切换为奶龙"
              >
                🐲奶龙
              </button>
              <button
                type="button"
                onClick={() => setPetPersona('feiyu')}
                aria-pressed={isFeiyu}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  isFeiyu
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="切换为大肥鱼 (DeepSeek)"
              >
                🐟大肥鱼
              </button>
            </div>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-semibold bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-300 transition-all cursor-pointer shadow-xs"
              title="点击快速切换 AI 引擎"
            >
              <Bot className={`w-3 h-3 ${isFeiyu ? 'text-blue-600' : 'text-amber-500'}`} />
              <span>{PROVIDER_INFO[provider]?.short || provider}</span>
              <ChevronDown className={`w-2.5 h-2.5 text-slate-400 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={clearChat}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 transition-colors cursor-pointer"
              title="清空对话"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 transition-colors cursor-pointer"
              title="收起小助手"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 人设快捷切换条 */}
        <div
          className={`px-3 py-1.5 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 ${
            isFeiyu
              ? 'border-sky-100/80 dark:border-slate-800/80 bg-sky-50/35 dark:bg-slate-900/60'
              : 'border-amber-100/80 dark:border-slate-800/80 bg-amber-50/35 dark:bg-slate-900/60'
          }`}
        >
          {[
            ...STUDY_AGENTS.filter(a => a.id === 'agent-408' || a.id === 'agent-psychology'),
            ...STUDY_AGENTS.filter(a => a.id !== 'agent-408' && a.id !== 'agent-psychology'),
          ].map(agent => {
            const active = selectedAgentId === agent.id
            const label = agent.id === 'agent-psychology' ? '心理聊天师' : agent.name
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  setSelectedAgentId(agent.id)
                  if (messages.length <= 1) {
                    setMessages([
                      {
                        id: 'welcome',
                        role: 'assistant',
                        agentName: agent.name,
                        agentIcon: agent.icon,
                        content:
                          agent.id === 'agent-psychology'
                            ? isFeiyu
                              ? '呼噜噜~ 欢迎来到大肥鱼的深夜干饭情绪树洞！🐟🍚\n备考累了、错题多了或者心里焦虑的时候，别自己硬扛着内耗啦！坐下来跟本鱼分一碗热乎白米饭，把烦恼统统倒出来吧~ 💙'
                              : '呼噜噜~ 欢迎来到奶龙的秘密情绪树洞！🫧\n考研这条路有时候挺孤单也挺累的吧？不管今天是学不进去、错题一大堆，还是深夜焦虑失眠，都可以慢慢跟我说，奶龙的大肚皮一直为你敞开着哟~ 🐲💛'
                            : `已切换至「${agent.icon} ${agent.name} · ${agent.title}」！随时把你的问题发给我吧~`,
                      },
                    ])
                  }
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer border ${
                  active
                    ? agent.id === 'agent-psychology'
                      ? isFeiyu
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-500 shadow-xs'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300'
                }`}
              >
                <span>{agent.icon}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* 折叠引擎与导师选择卡 */}
        {showConfig && (
          <div
            className={`px-3.5 py-2.5 border-b shrink-0 animate-in fade-in slide-in-from-top-1 text-xs space-y-2 ${
              isFeiyu
                ? 'bg-sky-50/70 dark:bg-slate-950/80 border-sky-200/60 dark:border-slate-800'
                : 'bg-amber-50/70 dark:bg-slate-950/80 border-amber-200/60 dark:border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-2xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>选择伴学引擎:</span>
                <span className={`text-2xs font-mono ${isFeiyu ? 'text-blue-700 dark:text-sky-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {formatUnifiedModelName(provider, selectedModel)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['antigravity', 'codex', 'claude-code', 'web'] as ProviderType[]).map(p => (
                  <button
                    key={p}
                    onClick={() => handleProviderSelect(p)}
                    className={`py-1 px-1 rounded-lg text-2xs font-semibold transition-all text-center truncate cursor-pointer ${
                      provider === p
                        ? isFeiyu
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'bg-amber-500 text-white shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {PROVIDER_INFO[p].short}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-2xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                当前值班导师 (涵盖政治/英语/规划):
              </div>
              <select
                value={selectedAgentId}
                onChange={e => setSelectedAgentId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-2xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {STUDY_AGENTS.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.icon} {agent.name} · {agent.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 对话消息滚动主区 */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 custom-scrollbar text-xs">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {m.role === 'assistant' ? (
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 overflow-hidden ${
                    isFeiyu
                      ? 'bg-sky-100 dark:bg-sky-950 border-sky-300/80'
                      : 'bg-amber-100 dark:bg-amber-950 border-amber-300/80'
                  }`}
                >
                  <PetChibiHead petId={persona.id} className="w-5 h-5" />
                </div>
              ) : (
                <DangoAvatar
                  seed={user?.username || user?.displayName}
                  size="sm"
                  className="mt-0.5 shadow-xs"
                  title={user?.displayName || user?.username || '我'}
                />
              )}

              <div className={`space-y-1.5 max-w-[85%] ${m.role === 'user' ? 'items-end' : ''}`}>
                {m.role === 'assistant' && (m.agentName || m.isProxyReply) && (
                  <div className="flex flex-wrap items-center gap-1 text-2xs px-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {m.agentIcon || '🤖'} {m.agentName || '研小核'}
                    </span>
                    {m.isProxyReply && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                        研小核（代答）
                      </span>
                    )}
                    {m.modelLabel && (
                      <span className="text-2xs text-slate-400 font-mono">{m.modelLabel}</span>
                    )}
                  </div>
                )}
                <div
                  className={`px-3 py-2 rounded-2xl leading-relaxed break-words ${
                    m.role === 'user'
                      ? isFeiyu
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xs font-medium text-2xs'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-medium text-2xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 shadow-xs text-2xs'
                  }`}
                >
                  {m.role === 'assistant' && !m.content && loading ? (
                    <div className="space-y-1.5 py-0.5 min-w-[190px]">
                      <div className={`flex items-center gap-1.5 text-2xs font-semibold ${isFeiyu ? 'text-blue-600' : 'text-amber-600'}`}>
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>{currentToolStatus || '正在检索知识库并推导...'}</span>
                      </div>
                      <div className={`w-full h-1 rounded-full overflow-hidden ${isFeiyu ? 'bg-sky-100' : 'bg-amber-100'}`}>
                        <div className={`h-full rounded-full animate-pulse w-2/3 ${isFeiyu ? 'bg-blue-600' : 'bg-amber-500'}`} />
                      </div>
                    </div>
                  ) : (
                    <MarkdownRenderer content={m.content} />
                  )}
                </div>

                {m.role === 'assistant' && m.content && !loading && m.id !== 'welcome' && (
                  <div className="flex items-center gap-1 text-2xs text-slate-400 pl-1">
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      className="flex items-center gap-0.5 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-500" />
                          <span className="text-emerald-500">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>复制</span>
                        </>
                      )}
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => handleSaveToNote(m)}
                      className={`flex items-center gap-0.5 cursor-pointer ${
                        isFeiyu ? 'hover:text-blue-600 dark:hover:text-sky-400' : 'hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      {savedId === m.id ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-500" />
                          <span className="text-emerald-500">已存入笔记</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-2.5 h-2.5" />
                          <span>存入笔记</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {messages.length <= 1 && (
            <div className="pt-2 space-y-1.5 animate-in fade-in">
              <div className="text-2xs font-bold text-slate-400 px-1 flex items-center gap-1">
                <Sparkles className={`w-3 h-3 ${isFeiyu ? 'text-blue-500' : 'text-amber-500'}`} />
                <span>{isPsychologyMode ? `想和${persona.name}聊聊什么？` : '点选快捷提问:'}</span>
              </div>
              <div className="flex flex-col gap-1">
                {(isPsychologyMode ? activeStudyAgent.quickPrompts : QUICK_PROMPTS).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(isPsychologyMode ? p : p.slice(2))}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl border text-slate-700 dark:text-slate-300 text-2xs transition-all cursor-pointer truncate ${
                      isFeiyu
                        ? 'bg-sky-50/60 dark:bg-slate-800/60 hover:bg-sky-100/60 dark:hover:bg-slate-800 border-sky-200/50 dark:border-slate-700/60'
                        : 'bg-amber-50/60 dark:bg-slate-800/60 hover:bg-amber-100/60 dark:hover:bg-slate-800 border-amber-200/50 dark:border-slate-700/60'
                    }`}
                  >
                    {isPsychologyMode ? `🫧 ${p}` : p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div
              className={`flex items-center gap-2 p-2 rounded-xl border text-xs animate-pulse ${
                isFeiyu
                  ? 'bg-sky-50/80 dark:bg-slate-800/80 border-sky-200/60 dark:border-slate-700 text-blue-700 dark:text-sky-300'
                  : 'bg-amber-50/80 dark:bg-slate-800/80 border-amber-200/60 dark:border-slate-700 text-amber-700 dark:text-amber-300'
              }`}
            >
              <Loader2 className={`w-3.5 h-3.5 animate-spin shrink-0 ${isFeiyu ? 'text-blue-600' : 'text-amber-500'}`} />
              <span className="text-2xs truncate">{currentToolStatus || `${persona.name}正在推导中...`}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入条 */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 shrink-0">
          <div className="relative flex items-center">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={
                isPsychologyMode
                  ? `跟${persona.name}·心理聊天师说说心里话（Enter 发送）...`
                  : `向${persona.name}随时提问（Enter 发送）...`
              }
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (e.nativeEvent.isComposing || (e as any).keyCode === 229) return
                  handleSendMessage()
                }
              }}
              className={`w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-3 pr-10 text-xs text-slate-900 dark:text-slate-100 outline-none max-h-24 shadow-xs ${
                isFeiyu ? 'focus:border-blue-400' : 'focus:border-amber-400'
              }`}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className={`absolute right-1.5 p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer shadow-xs active:scale-95 ${
                isFeiyu ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'
              }`}
              title="发送提问"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
