import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, BookOpen, FolderTree, X } from 'lucide-react'
import { api, type ChatResponse, type FileDetail } from '../services/api'
import { useVaultTree } from '../hooks/useVaultData'
import ChatMessage from '../components/ChatMessage'
import FileExplorer from '../components/FileExplorer'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citedNotes?: ChatResponse['citedNotes']
  timestamp: Date
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的知识库助手。你可以向我提问，我会从你的 Vault 笔记中查找相关内容并给出回答。\n\n试试问我关于你的笔记内容的问题吧。',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFiles, setShowFiles] = useState(false)
  const [selectedNote, setSelectedNote] = useState<FileDetail | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { tree } = useVaultTree()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Build history from previous messages (last 10 turns)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-10)
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

      const res = await api.sendMessage(text, history)
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        citedNotes: res.citedNotes,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '抱歉，无法连接到知识库后端。请确保 Express 服务已启动 (`npm run dev:all`)。',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
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
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="h-full flex gap-4">
      {/* File Explorer Sidebar */}
      <div className={`shrink-0 transition-all duration-200 ${showFiles ? 'w-64' : 'w-0'} overflow-hidden`}>
        <FileExplorer tree={tree} onFileClick={handleNoteClick} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat toolbar */}
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
          <button
            onClick={() => setShowFiles(!showFiles)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
              showFiles
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/50'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            文件浏览器
          </button>
          <div className="text-[11px] text-slate-600 ml-2">
            Shift+Enter 换行 / Enter 发送
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto space-y-4 pb-4">
          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onNoteClick={handleNoteClick}
            />
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-slate-800 pt-4">
          <div className="flex items-end gap-3 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题... (按 Enter 发送)"
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 resize-none outline-none max-h-32"
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
              className="p-2 rounded-lg bg-violet-500 text-white hover:bg-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Note preview panel */}
      {selectedNote && (
        <div className="w-80 shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200 truncate">{selectedNote.title}</h3>
            <button
              onClick={() => setSelectedNote(null)}
              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mb-3">{selectedNote.path}</div>
          {selectedNote.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {selectedNote.tags.map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">#{tag}</span>
              ))}
            </div>
          )}
          <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
            {selectedNote.content}
          </div>
        </div>
      )}
    </div>
  )
}
