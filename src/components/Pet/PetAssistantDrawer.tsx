import { useState, useEffect, useRef } from 'react'
import {
  X,
  Send,
  Loader2,
  Sparkles,
  Bot,
  Zap,
  CheckCircle2,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import MarkdownRenderer from '../MarkdownRenderer'
import { api, type LocalAgentStatus } from '../../services/api'
import type { PetMood } from './DesktopPet'


interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
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

export default function PetAssistantDrawer({
  isOpen,
  onClose,
  dailyTokens,
  isLocalModel,
  onTokenConsumed,
  onSetMood,
  onTriggerQuiz,
}: PetAssistantDrawerProps) {
  const [provider, setProvider] = useState<'ollama' | 'lm-studio' | 'claude-code' | 'web'>('ollama')
  const [agents, setAgents] = useState<LocalAgentStatus[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [loadingAgents, setLoadingAgents] = useState(false)

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '你好！我是你的考研伴学桌宠「研小核」🐾。\n\n我具备类似 Obsidian Claudian 的全功能 Agent 权限，不仅能为你解答 408 与考研数学考点，还能直接**查阅、新建、修改和整理你知识库中的真实笔记**。\n\n试着吩咐我：\n- *“搜索知识库里关于二叉树的笔记”*\n- *“帮我在高等数学下写一篇《泰勒展开八大必备公式》”*\n- *“诊断一下知识库有没有孤立笔记”*',
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
      // Select best available provider
      const ollama = data.agents.find(a => a.provider === 'ollama')
      if (ollama?.available && ollama.models?.length) {
        setProvider('ollama')
        setSelectedModel(ollama.defaultModel || ollama.models[0])
      } else {
        const lm = data.agents.find(a => a.provider === 'lm-studio')
        if (lm?.available && lm.models?.length) {
          setProvider('lm-studio')
          setSelectedModel(lm.defaultModel || lm.models[0])
        } else {
          setProvider('web')
        }
      }
    } catch {
      setProvider('web')
    } finally {
      setLoadingAgents(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAgentStatus()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentToolStatus])

  if (!isOpen) return null

  const activeAgent = agents.find(a => a.provider === provider)
  const isLocal = provider === 'ollama' || provider === 'lm-studio'

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
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
    setCurrentToolStatus('正在研析指令...')

    try {
      const isWeb = provider === 'web'
      const endpoint = isWeb ? '/api/agent/chat' : '/api/local-agents/chat'
      const body = isWeb
        ? {
            message: text,
            history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
          }
        : {
            provider,
            prompt: text,
            model: selectedModel || undefined,
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
          const rawData = trimmed.slice(6)

          try {
            const event = JSON.parse(rawData)

            if (event.type === 'text' && event.content) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId ? { ...m, content: m.content + event.content } : m
                )
              )
            } else if (event.type === 'tool_call') {
              setCurrentToolStatus(`正在执行笔记工具: ${event.tool}...`)
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

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-cream-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-cream-200 dark:border-slate-800 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-warm-900 dark:text-slate-100 text-sm">研小核 · 本地 AI 笔记管家</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium">
                Claudian 模式
              </span>
            </div>
            <p className="text-[11px] text-warm-500 dark:text-slate-400">
              直连本地 AI 与 Obsidian 知识库双向自主管理
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 dark:hover:text-slate-200 hover:bg-cream-100 dark:hover:bg-slate-800 transition-colors"
            title="清空记录"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 dark:hover:text-slate-200 hover:bg-cream-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Model & Provider Switch Bar */}
      <div className="px-5 py-2.5 bg-cream-50 dark:bg-slate-950/60 border-b border-cream-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {[
              { key: 'ollama' as const, label: '🦙 Ollama 本地' },
              { key: 'lm-studio' as const, label: '💻 LM Studio' },
              { key: 'claude-code' as const, label: '⚡ Claude Code' },
              { key: 'web' as const, label: '☁️ 云端 API' },
            ].map(tab => {
              const tabAgent = agents.find(a => a.provider === tab.key)
              const isAvail = tab.key === 'web' || tabAgent?.available
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setProvider(tab.key)
                    if (tabAgent?.models?.length) {
                      setSelectedModel(tabAgent.defaultModel || tabAgent.models[0])
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    provider === tab.key
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-warm-600 dark:text-slate-300 border border-cream-200 dark:border-slate-700 hover:border-orange-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isAvail && tab.key !== 'web' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          <button
            onClick={fetchAgentStatus}
            disabled={loadingAgents}
            className="p-1 text-warm-400 hover:text-warm-700 dark:hover:text-slate-200 transition-colors"
            title="刷新检测本地 AI 服务"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAgents ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Model Dropdown & Token Tracker */}
        <div className="flex items-center justify-between text-xs pt-1">
          {activeAgent?.models && activeAgent.models.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="text-warm-400 text-[11px]">模型:</span>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-cream-300 dark:border-slate-700 rounded-md px-2 py-0.5 text-warm-800 dark:text-slate-200"
              >
                {activeAgent.models.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-[11px] text-warm-400 truncate max-w-[240px]">
              {provider === 'web'
                ? '使用 config.json 中配置的云端大模型'
                : activeAgent?.detail || '未检测到该本地服务启动'}
            </div>
          )}

          {/* Token Meter */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-[11px] font-mono">
            <Zap className="w-3 h-3 text-orange-500" />
            <span>今日: {dailyTokens.toLocaleString()} T</span>
            {(isLocal || isLocalModel) && <span className="text-[10px] text-emerald-600 font-sans font-bold">(0元离线)</span>}
          </div>

        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-warm-400 mb-1 px-1">
              <span>{m.role === 'user' ? '考生' : '研小核 (Agent)'}</span>
              {m.usage && (
                <span className="text-[10px] text-orange-500 font-mono">
                  · {m.usage.total_tokens} tokens
                </span>
              )}
            </div>

            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none'
                  : 'bg-cream-50 dark:bg-slate-800 border border-cream-200 dark:border-slate-700 text-warm-900 dark:text-slate-100 rounded-bl-none'
              }`}
            >
              {/* Tool Execution Badges */}
              {m.toolCalls && m.toolCalls.length > 0 && (
                <div className="mb-2.5 space-y-1.5 border-b border-cream-200 dark:border-slate-700 pb-2">
                  <div className="text-[10px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 知识库 Agent 工具执行记录:
                  </div>
                  {m.toolCalls.map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-cream-200 dark:border-slate-700 text-[11px]"
                    >
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <b>{tc.tool}</b>: {JSON.stringify(tc.input || {})}
                      </div>
                      {tc.output && (
                        <div className="text-[10px] text-slate-500 mt-1 pl-4 truncate">
                          ➔ {tc.output.slice(0, 120)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Message Content */}
              {m.content ? (
                <MarkdownRenderer content={m.content} />
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>正在自主整理知识库并生成回复...</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Current Working Status */}
        {currentToolStatus && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 text-xs text-orange-700 dark:text-orange-300 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{currentToolStatus}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Actions */}
      <div className="px-4 py-2 border-t border-cream-200 dark:border-slate-800 bg-cream-50/50 dark:bg-slate-950/40">
        <div className="text-[10px] text-warm-400 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-500" /> 考研快捷指令:
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {onTriggerQuiz && (
            <button
              onClick={() => {
                onTriggerQuiz()
                onClose()
              }}
              className="px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 font-medium text-[11px] whitespace-nowrap transition-colors shrink-0 flex items-center gap-1"
            >
              🎯 开启随堂真题测试
            </button>
          )}
          {[
            '搜索知识库关于二叉树的笔记',
            '在高等数学下写一篇《泰勒展开八大必备公式》',
            '诊断一下知识库有没有孤立笔记',
            '归纳一道做错的极限题到错题本',
          ].map((prompt, i) => (

            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-cream-200 dark:border-slate-700 hover:border-orange-300 text-[11px] text-warm-700 dark:text-slate-300 whitespace-nowrap transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-cream-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="对研小核说：查笔记、写笔记、归档错题或答疑..."
            rows={2}
            className="flex-1 p-2.5 text-xs bg-cream-50 dark:bg-slate-800 border border-cream-200 dark:border-slate-700 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-orange-500 text-warm-900 dark:text-slate-100"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white disabled:opacity-40 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20 transition-all shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
