import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Loader2, BookOpen, FolderTree, X, Wrench, ChevronDown, ChevronRight, Plus, Trash2, MessageSquare, Save } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api, type FileDetail } from '../services/api'
import { useVaultTree } from '../hooks/useVaultData'
import FileExplorer from '../components/FileExplorer'

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
  toolCalls: ToolCallInfo[]
  citedNotes?: { title: string; path: string; excerpt: string; tags: string[] }[]
  timestamp: Date
  streaming?: boolean
}

// Conversation session stored in memory
interface Conversation {
  id: string
  title: string
  messages: AgentMessage[]
  createdAt: Date
}

export default function Chat() {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFiles, setShowFiles] = useState(false)
  const [showSessions, setShowSessions] = useState(true)
  const [selectedNote, setSelectedNote] = useState<FileDetail | null>(null)
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

  // Create new conversation
  const createConversation = useCallback(() => {
    const id = `conv-${Date.now()}`
    const newConv: Conversation = {
      id,
      title: '新对话',
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是你的知识库 AI 助手。我可以帮你：\n\n- **读取笔记** — 查看任何笔记的内容\n- **创建/修改笔记** — 直接在知识库中操作\n- **搜索知识** — 在 vault 中查找相关内容\n- **回答问题** — 基于你的笔记内容\n\n试试问我关于你的笔记的问题吧！',
        toolCalls: [],
        timestamp: new Date(),
      }],
      createdAt: new Date(),
    }
    setConversations(prev => [newConv, ...prev])
    setActiveConvId(id)
  }, [])

  // Initialize with first conversation
  useEffect(() => {
    if (conversations.length === 0) {
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

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading || !activeConvId) return

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      toolCalls: [],
      timestamp: new Date(),
    }

    // Add user message and create streaming assistant message
    const assistantMsgId = `assistant-${Date.now()}`
    const assistantMsg: AgentMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      toolCalls: [],
      timestamp: new Date(),
      streaming: true,
    }

    updateConversation(activeConvId, conv => {
      const updated = {
        ...conv,
        messages: [...conv.messages, userMsg, assistantMsg],
        title: conv.messages.length <= 2 ? text.substring(0, 30) : conv.title,
      }
      return updated
    })

    setInput('')
    setLoading(true)

    const convId = activeConvId
    const controller = new AbortController()
    abortRef.current = controller

    try {
      // Build history from current conversation
      const currentConv = conversations.find(c => c.id === convId)
      const history = (currentConv?.messages || [])
        .filter(m => m.id !== 'welcome' && !m.streaming)
        .slice(-10)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('text/event-stream')) {
        // SSE streaming mode
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (reader) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.slice(6))
                updateConversation(convId, conv => {
                  const msgs = [...conv.messages]
                  const idx = msgs.findIndex(m => m.id === assistantMsgId)
                  if (idx === -1) return conv

                  const msg = { ...msgs[idx] }

                  switch (event.type) {
                    case 'text':
                      msg.content += event.content
                      break
                    case 'tool_call':
                      msg.toolCalls = [...msg.toolCalls, { tool: event.tool, input: event.input }]
                      break
                    case 'tool_result':
                      const lastTool = msg.toolCalls[msg.toolCalls.length - 1]
                      if (lastTool && lastTool.tool === event.tool) {
                        msg.toolCalls = [...msg.toolCalls.slice(0, -1), { ...lastTool, output: event.output, success: event.success }]
                      }
                      break
                    case 'done':
                      msg.streaming = false
                      break
                    case 'error':
                      msg.content += `\n\n**错误**: ${event.content}`
                      msg.streaming = false
                      break
                  }

                  msgs[idx] = msg
                  return { ...conv, messages: msgs }
                })
              } catch {
                // ignore parse errors
              }
            }
          }
        }
      } else {
        // JSON fallback mode
        const data = await response.json()
        updateConversation(convId, conv => {
          const msgs = [...conv.messages]
          const idx = msgs.findIndex(m => m.id === assistantMsgId)
          if (idx !== -1) {
            msgs[idx] = { ...msgs[idx], content: data.reply, streaming: false }
          }
          return { ...conv, messages: msgs }
        })
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        updateConversation(convId, conv => {
          const msgs = [...conv.messages]
          const idx = msgs.findIndex(m => m.id === assistantMsgId)
          if (idx !== -1) {
            msgs[idx] = { ...msgs[idx], content: '抱歉，无法连接到知识库。请确保后端服务已启动。', streaming: false }
          }
          return { ...conv, messages: msgs }
        })
      }
    } finally {
      // Mark streaming as done
      updateConversation(convId, conv => {
        const msgs = [...conv.messages]
        const idx = msgs.findIndex(m => m.id === assistantMsgId)
        if (idx !== -1 && msgs[idx].streaming) {
          msgs[idx] = { ...msgs[idx], streaming: false }
        }
        return { ...conv, messages: msgs }
      })
      setLoading(false)
      abortRef.current = null
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
    } catch { /* silent */ }
  }

  const handleSaveMessage = async (msg: AgentMessage) => {
    if (!msg.content) return
    const title = msg.content.split('\n')[0].replace(/^#+\s*/, '').substring(0, 50) || 'AI 回复'
    const safeName = title.replace(/[<>:"/\\|?*]/g, '_')
    try {
      await api.createFile(`AI笔记/${safeName}.md`, msg.content, {
        title, tags: ['ai-generated'], created: new Date().toISOString().split('T')[0],
      })
      alert(`已保存为笔记: AI笔记/${safeName}.md`)
    } catch (err: any) {
      alert(`保存失败: ${err.message}`)
    }
  }

  return (
    <div className="h-full flex gap-3">
      {/* Session sidebar */}
      <div className={`shrink-0 transition-all duration-200 ${showSessions ? 'w-52' : 'w-0'} overflow-hidden`}>
        <div className="h-full flex flex-col bg-cream-100 border border-cream-200 rounded-xl">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-cream-200">
            <span className="text-xs font-medium text-warm-500">对话历史</span>
            <button
              onClick={createConversation}
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
                    ? 'bg-accent-orange/15 text-warm-800'
                    : 'text-warm-500 hover:bg-cream-200 hover:text-warm-700'
                }`}
                onClick={() => setActiveConvId(conv.id)}
              >
                <MessageSquare className="w-3 h-3 shrink-0" />
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id) }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-cream-300 text-warm-400 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File Explorer */}
      <div className={`shrink-0 transition-all duration-200 ${showFiles ? 'w-52' : 'w-0'} overflow-hidden`}>
        <FileExplorer tree={tree} onFileClick={handleNoteClick} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 pb-3 border-b border-cream-200 mb-3">
          <button
            onClick={() => setShowSessions(!showSessions)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              showSessions ? 'bg-accent-orange/15 text-warm-800 border border-accent-orange/30' : 'bg-cream-200/60 text-warm-500 hover:text-warm-700 border border-cream-300/50'
            }`}
          >
            <MessageSquare className="w-3 h-3" /> 对话
          </button>
          <button
            onClick={() => setShowFiles(!showFiles)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              showFiles ? 'bg-accent-orange/15 text-warm-800 border border-accent-orange/30' : 'bg-cream-200/60 text-warm-500 hover:text-warm-700 border border-cream-300/50'
            }`}
          >
            <FolderTree className="w-3 h-3" /> 文件
          </button>
          <div className="ml-auto text-[11px] text-warm-400">
            Shift+Enter 换行 / Enter 发送
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto space-y-4 pb-4 pr-1">
          {messages.map(msg => (
            <AgentMessageBubble
              key={msg.id}
              message={msg}
              onSave={() => handleSaveMessage(msg)}
            />
          ))}
          {loading && messages[messages.length - 1]?.streaming === false && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-orange to-accent-peach flex items-center justify-center shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-cream-200/50 border border-cream-300/50 rounded-xl px-4 py-3">
                <Loader2 className="w-4 h-4 text-accent-orange animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-cream-200 pt-3">
          <div className="flex items-end gap-3 bg-surface border border-cream-300 rounded-xl px-4 py-3 focus-within:border-accent-orange/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入问题... AI 可以读写你的笔记"
              rows={1}
              className="flex-1 bg-transparent text-sm text-warm-700 placeholder-warm-400 resize-none outline-none max-h-32"
              style={{ minHeight: 24 }}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 128) + 'px'
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Note preview panel */}
      {selectedNote && (
        <div className="w-72 shrink-0 bg-surface border border-cream-200 rounded-xl p-4 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-warm-700 truncate">{selectedNote.title}</h3>
            <button onClick={() => setSelectedNote(null)} className="p-1 rounded hover:bg-cream-200 text-warm-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[10px] text-warm-400 font-mono mb-2">{selectedNote.path}</div>
          <div className="text-xs text-warm-500 leading-relaxed whitespace-pre-wrap line-clamp-[40]">
            {selectedNote.content}
          </div>
          <button
            onClick={() => navigate(`/editor?path=${encodeURIComponent(selectedNote.path)}`)}
            className="mt-3 w-full py-1.5 rounded-lg text-[11px] text-warm-500 bg-cream-200 border border-cream-300 hover:text-warm-700 transition-colors"
          >
            在编辑器中打开
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Agent Message Bubble ─────────────────────────────────────────────────────

function AgentMessageBubble({
  message, onSave,
}: {
  message: AgentMessage
  onSave: () => void
}) {
  const [toolCallsExpanded, setToolCallsExpanded] = useState(true)
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
        isUser
          ? 'bg-cream-300'
          : 'bg-gradient-to-br from-accent-orange to-accent-peach'
      }`}>
        {isUser
          ? <span className="text-[10px] text-warm-600 font-medium">你</span>
          : <BookOpen className="w-3.5 h-3.5 text-white" />
        }
      </div>

      {/* Message body */}
      <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : ''}`}>
        {/* Tool calls */}
        {message.toolCalls.length > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => setToolCallsExpanded(!toolCallsExpanded)}
              className="flex items-center gap-1.5 text-[10px] text-warm-400 hover:text-warm-600 transition-colors"
            >
              {toolCallsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <Wrench className="w-3 h-3" />
              {message.toolCalls.length} 个工具调用
            </button>

            {toolCallsExpanded && message.toolCalls.map((tc, i) => (
              <div key={i} className="ml-4 bg-cream-100/50 border border-cream-200 rounded-lg p-2.5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    tc.success === false ? 'bg-rose-500/10 text-rose-400' : 'bg-accent-sage/10 text-accent-sage'
                  }`}>
                    {tc.tool}
                  </span>
                  <span className="text-[10px] text-warm-400 truncate">
                    {tc.input?.path || tc.input?.query || ''}
                  </span>
                </div>
                {tc.output && (
                  <pre className="text-[10px] text-warm-500 whitespace-pre-wrap font-mono bg-cream-100/50 rounded p-2 max-h-40 overflow-auto leading-relaxed">
                    {tc.output.substring(0, 1000)}
                    {tc.output.length > 1000 && '...'}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-accent-orange/15 border border-accent-orange/20 text-warm-800'
              : 'bg-surface border border-cream-200 text-warm-700'
          }`}>
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <div className="prose prose-sm max-w-none [&_p]:my-1.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_pre]:my-2 [&_code]:text-accent-sage [&_code]:text-xs [&_a]:text-accent-orange [&_strong]:text-warm-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            )}
            {message.streaming && (
              <span className="inline-block w-1.5 h-4 bg-accent-orange animate-pulse ml-0.5 align-middle rounded-sm" />
            )}
          </div>
        )}

        {/* Actions for assistant messages */}
        {!isUser && !message.streaming && message.content && (
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-1 text-[10px] text-warm-400 hover:text-warm-600 transition-colors"
              title="保存为笔记"
            >
              <Save className="w-3 h-3" /> 保存
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
