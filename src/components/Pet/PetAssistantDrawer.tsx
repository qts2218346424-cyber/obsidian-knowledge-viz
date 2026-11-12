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
import LuluAvatar, { PET_PERSONAS, getSavedPetTheme } from './LuluAvatar'

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
  '💡 帮我解析泰勒展开公式本质与考点',
  '⚡ 408 虚拟内存页表与 TLB 命中机制',
  '🎯 考我一道 408 核心考点高频选择题',
  '🌿 学习有点累了，给我加加油打打气',
]

export default function PetAssistantDrawer({
  isOpen,
  onClose,
  onTokenConsumed,
  onSetMood,
}: PetAssistantDrawerProps) {
  const [provider, setProvider] = useState<ProviderType>(() => {
    return (localStorage.getItem('coreforge_active_provider') as ProviderType) || 'codex'
  })
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(`coreforge_model_${provider}`) || PROVIDER_INFO[provider].defaultModel
  })
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-408')
  const activeStudyAgent = STUDY_AGENTS.find(a => a.id === selectedAgentId) || STUDY_AGENTS[0]
  const [agents, setAgents] = useState<LocalAgentStatus[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  // 移动端视口检测
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

  // 加载本地可用代理模型列表
  useEffect(() => {
    api.getLocalAgentStatus()
      .then(data => {
        if (data?.agents) setAgents(data.agents)
      })
      .catch(() => {})
  }, [])

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '我是奶龙！🐲\n考研数学或 408 复习遇到卡壳了？随时把题目发给我，秒速为你推导解析~',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [currentToolStatus, setCurrentToolStatus] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
    setCurrentToolStatus(`${activeStudyAgent.name}正在查阅知识库并推导...`)

    try {
      const isLocal = provider === 'codex' || provider === 'claude-code'
      const endpoint = '/api/local-agents/chat'
      const body = {
        provider,
        prompt: text,
        model: selectedModel || undefined,
        agentPrompt: `${activeStudyAgent.systemPrompt}${
          proxySubject ? `\n【跨科代答提示】：本题涉及${proxySubject}，当前由「${activeStudyAgent.name}」代答。` : ''
        }`,
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
    const title = firstLine || `奶龙精析_${new Date().toLocaleDateString('zh-CN')}`
    const destPath = `wiki/AI伴学笔记/${title}.md`
    try {
      await api.createFile(destPath, msg.content, {
        title,
        tags: ['ai-study', '奶龙小助手', provider],
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

  const personaName = PET_PERSONAS[getSavedPetTheme()]?.name || '奶龙'

  return (
    <>
      {/* 移动端点击外部轻量背景遮罩 */}
      {isMobile && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] animate-in fade-in"
        />
      )}

      <div
        className={`fixed z-50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border border-amber-200/90 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden animate-in fade-in duration-200 ${
          isMobile
            ? 'inset-x-2 bottom-3.5 h-[70vh] max-h-[560px] rounded-3xl slide-in-from-bottom-5'
            : 'right-4 bottom-20 w-[380px] h-[520px] max-h-[calc(100vh-100px)] rounded-3xl slide-in-from-bottom-4'
        }`}
      >
        {/* 极简轻巧 Header */}
        <div className="px-3.5 py-2.5 border-b border-amber-100 dark:border-slate-800/80 bg-gradient-to-r from-amber-400/15 via-orange-400/10 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0 border border-amber-300/80">
              <LuluAvatar size="xs" mood={loading ? 'thinking' : 'idle'} isSpeaking={loading} showAccessories={false} />
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                {personaName} · 随身伴学
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="在线就绪" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* 微型极简引擎小标签，点击可切换 */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-semibold bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-300 transition-all cursor-pointer shadow-xs"
              title="点击快速切换 AI 引擎"
            >
              <Bot className="w-3 h-3 text-amber-500" />
              <span>{PROVIDER_INFO[provider]?.short || provider}</span>
              <ChevronDown className={`w-2.5 h-2.5 text-slate-400 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
            </button>

            {/* 清空对话 */}
            <button
              onClick={clearChat}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 transition-colors cursor-pointer"
              title="清空对话"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* 关闭小窗口 */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 transition-colors cursor-pointer"
              title="收起小助手"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 极简折叠引擎与导师选择卡（默认收起，点小标签展开） */}
        {showConfig && (
          <div className="px-3.5 py-2.5 bg-amber-50/70 dark:bg-slate-950/80 border-b border-amber-200/60 dark:border-slate-800 shrink-0 animate-in fade-in slide-in-from-top-1 text-xs space-y-2">
            <div>
              <div className="flex items-center justify-between text-2xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>选择伴学引擎:</span>
                <span className="text-2xs text-amber-700 dark:text-amber-400 font-mono">
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
                        ? 'bg-amber-500 text-white shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-300'
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
                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-300/80 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">🐲</span>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xs font-bold text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                  你
                </div>
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
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-medium text-2xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 shadow-xs text-2xs'
                  }`}
                >
                  {m.role === 'assistant' && !m.content && loading ? (
                    <div className="space-y-1.5 py-0.5 min-w-[190px]">
                      <div className="flex items-center gap-1.5 text-2xs font-semibold text-amber-600">
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>{currentToolStatus || '正在检索知识库并推导...'}</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-amber-100 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full animate-pulse w-2/3" />
                      </div>
                    </div>
                  ) : (
                    <MarkdownRenderer content={m.content} />
                  )}
                </div>

                {/* 消息底部辅助快捷小操作 */}
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
                      className="flex items-center gap-0.5 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
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

          {/* 空状态快捷提示小胶囊 */}
          {messages.length <= 1 && (
            <div className="pt-2 space-y-1.5 animate-in fade-in">
              <div className="text-2xs font-bold text-slate-400 px-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>点选快捷提问:</span>
              </div>
              <div className="flex flex-col gap-1">
                {QUICK_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.slice(2))}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl bg-amber-50/60 dark:bg-slate-800/60 hover:bg-amber-100/60 dark:hover:bg-slate-800 border border-amber-200/50 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-2xs transition-all cursor-pointer truncate"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 正在思考指示条 */}
          {loading && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200/60 dark:border-slate-700 text-xs text-amber-700 dark:text-amber-300 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />
              <span className="text-2xs truncate">{currentToolStatus || '奶龙正在挠头推导中...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 极简底部输入条 */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 shrink-0">
          <div className="relative flex items-center">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder="向奶龙随时提问（Enter 发送）..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-3 pr-10 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-amber-400 max-h-24 shadow-xs"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !input.trim()}
              className="absolute right-1.5 p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer shadow-xs active:scale-95"
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
