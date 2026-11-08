path = r'e:\知识库项目\obsidian-viz\src\components\AIAssistantModal.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. 确保图标导入 AlertTriangle 和 Zap
if 'AlertTriangle,' not in text:
    text = text.replace('Trash2,\n  X,', 'Trash2,\n  X,\n  AlertTriangle,\n  Zap,')

# 2. 扩充 AIAssistantModalProps
old_props = '''interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  pagePath: string
}'''

new_props = '''interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  pagePath?: string
  initialContextPrompt?: string | null
  initialDefaultInput?: string | null
}'''

text = text.replace(old_props, new_props)

# 3. 默认尺寸改为优雅的右侧抽屉宽度 (560px, 高度 100%)
old_modal_size = '''    return {
      width: Math.min(1060, typeof window !== 'undefined' ? window.innerWidth - 40 : 980),
      height: Math.min(840, typeof window !== 'undefined' ? window.innerHeight - 50 : 780),
    }'''

new_modal_size = '''    return {
      width: Math.min(580, typeof window !== 'undefined' ? window.innerWidth : 560),
      height: typeof window !== 'undefined' ? window.innerHeight : 800,
    }'''

text = text.replace(old_modal_size, new_modal_size)

# 4. 增加耗时计时器、分阶段提示状态与上下文注入状态
state_inject_code = '''  // 分阶段流式等待反馈与超时容错状态
  const [loadingSeconds, setLoadingSeconds] = useState(0)
  const lastUserPromptRef = useRef<string>('')
  const [pendingContext, setPendingContext] = useState<string | null>(null)

  useEffect(() => {
    if (initialContextPrompt) {
      setPendingContext(initialContextPrompt)
    }
    if (initialDefaultInput) {
      setInput(initialDefaultInput)
    }
  }, [initialContextPrompt, initialDefaultInput])

  useEffect(() => {
    const onOpen = (e: Event) => {
      const custom = e as CustomEvent<{ contextPrompt?: string; defaultInput?: string }>
      if (custom?.detail?.contextPrompt) {
        setPendingContext(custom.detail.contextPrompt)
      }
      if (custom?.detail?.defaultInput) {
        setInput(custom.detail.defaultInput)
      }
      setTimeout(() => inputRef.current?.focus(), 150)
    }
    window.addEventListener('open-ai-assistant', onOpen)
    return () => window.removeEventListener('open-ai-assistant', onOpen)
  }, [])

  useEffect(() => {
    if (!loading) {
      setLoadingSeconds(0)
      return
    }
    const timer = setInterval(() => {
      setLoadingSeconds(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [loading])

  const loadingStatusText = useMemo(() => {
    if (loadingSeconds < 3) {
      return '正在检索 408 / 考研数学考点知识库...'
    } else if (loadingSeconds < 6) {
      return '双核智能体正在推演分步解题步骤与易错逻辑...'
    } else if (loadingSeconds < 8) {
      return '正在生成分步严谨推导与变式防错策略...'
    } else {
      return `深度推演中（已耗时 ${loadingSeconds} 秒）...`
    }
  }, [loadingSeconds])

  const handleSwitchFastModelAndRetry = () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setLoading(false)
    // 切换到备用极速模型并重新触发
    updateSession(activeSession.id, session => ({
      ...session,
      model: 'deepseek-v3',
    }))
    setTimeout(() => {
      if (lastUserPromptRef.current) {
        void sendMessage(lastUserPromptRef.current)
      }
    }, 200)
  }
'''

if 'loadingStatusText' not in text:
    text = text.replace(
        '  const abortRef = useRef<AbortController | null>(null)',
        '  const abortRef = useRef<AbortController | null>(null)\n' + state_inject_code
    )

# 5. 在 sendMessage 中记录 lastUserPromptRef 并拼接 pendingContext
old_send_start = '''    const text = (preset ?? input).trim()
    if (!text || loading) return

    const userMessage = createWorkspaceMessage('user', text)'''

new_send_start = '''    const rawText = (preset ?? input).trim()
    if (!rawText || loading) return
    const text = pendingContext ? `${pendingContext}\\n\\n【我的具体疑问】：${rawText}` : rawText
    lastUserPromptRef.current = rawText
    setPendingContext(null)

    const userMessage = createWorkspaceMessage('user', rawText)'''

text = text.replace(old_send_start, new_send_start)

# 6. 外层容器改造为全高右侧滑出抽屉 (Drawer)
old_container = '''    <div className="fixed inset-0 z-[80] flex items-end justify-end bg-warm-900/20 p-2 backdrop-blur-[2px]" onClick={onClose}>
      <section
        style={isMaximized ? { width: '100vw', height: '100vh', maxWidth: '100vw' } : { width: `${modalSize.width}px`, height: `${modalSize.height}px` }}
        className={`flex flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl transition-all duration-200 ${
          isMaximized ? 'fixed inset-0 rounded-none' : 'relative rounded-3xl'
        } ${
          resizingRef.current ? 'select-none transition-none' : ''
        }`}
        onMouseDown={event => event.stopPropagation()}
      >'''

new_container = '''    <div className="fixed inset-0 z-[80] flex justify-end bg-black/35 backdrop-blur-[1.5px] animate-in fade-in duration-200" onClick={onClose}>
      <section
        style={isMaximized ? { width: '100vw', height: '100vh', maxWidth: '100vw' } : { width: `${modalSize.width}px`, height: '100vh' }}
        className={`relative flex h-full flex-col overflow-hidden bg-white shadow-2xl border-l border-slate-200 transition-all duration-300 ease-out animate-in slide-in-from-right duration-300 ${
          isMaximized ? 'fixed inset-0 rounded-none' : 'rounded-l-2xl sm:rounded-l-3xl rounded-r-none'
        } ${
          resizingRef.current ? 'select-none transition-none' : ''
        }`}
        onMouseDown={event => event.stopPropagation()}
      >'''

text = text.replace(old_container, new_container)

# 7. 在输入框上方渲染注入的上下文卡片
context_card = '''            {/* 注入的题目上下文卡片（原地提问闭环） */}
            {pendingContext && (
              <div className="mx-auto mb-2 max-w-2xl rounded-xl bg-indigo-50/90 border border-indigo-200/80 p-2.5 text-xs text-indigo-900 flex items-start justify-between gap-2 shadow-2xs animate-in fade-in">
                <div className="flex items-start gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-bold text-[11px] text-indigo-700 block">📌 已关联当前题目考点（原地提问闭环）：</span>
                    <p className="text-[11px] text-indigo-800 line-clamp-2 mt-0.5 font-mono whitespace-pre-wrap">{pendingContext}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingContext(null)}
                  className="p-1 rounded-md text-indigo-400 hover:bg-indigo-100 hover:text-indigo-700 transition-colors shrink-0"
                  title="清除此题目关联"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
'''

if '已关联当前题目考点（原地提问闭环）' not in text:
    text = text.replace(
        '<div className="border-t border-slate-200 bg-white p-3 sm:p-4">',
        '<div className="border-t border-slate-200 bg-white p-3 sm:p-4">\n' + context_card
    )

# 8. 更新 MessageBubble 传递 loading 状态
old_bubble_render = '{activeSession.messages.map(message => <MessageBubble key={message.id} message={message} />)}'
new_bubble_render = '{activeSession.messages.map(message => <MessageBubble key={message.id} message={message} loadingStatusText={loadingStatusText} loadingSeconds={loadingSeconds} onSwitchFastModel={handleSwitchFastModelAndRetry} />)}'

text = text.replace(old_bubble_render, new_bubble_render)

# 9. 更新 MessageBubble 组件定义
old_bubble_func = '''function MessageBubble({ message }: { message: AIWorkspaceMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed transition-all shadow-2xs ${
          isUser
            ? 'rounded-br-xs bg-gradient-to-r from-accent-orange to-blue-600 text-white shadow-xs'
            : 'rounded-bl-xs border border-cream-200/90 dark:border-slate-800 bg-surface dark:bg-slate-900 text-warm-800 dark:text-slate-200'
        }`}
      >
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-2.5 space-y-1.5 w-full">
            {message.toolCalls.map((call, idx) => (
              <ToolCallCard key={idx} toolCall={call as any} />
            ))}
          </div>
        )}
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="leading-relaxed">
            {message.content ? (
              <MarkdownRenderer content={message.content} isStreaming={message.streaming} />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-accent-orange" />
            )}
          </div>
        )}
        {message.streaming && message.content && (
          <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse rounded-full bg-accent-orange align-middle shadow-xs" />
        )}
      </div>
    </div>
  )
}'''

new_bubble_func = '''function MessageBubble({
  message,
  loadingStatusText,
  loadingSeconds = 0,
  onSwitchFastModel,
}: {
  message: AIWorkspaceMessage
  loadingStatusText?: string
  loadingSeconds?: number
  onSwitchFastModel?: () => void
}) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed transition-all shadow-2xs ${
          isUser
            ? 'rounded-br-xs bg-gradient-to-r from-accent-orange to-blue-600 text-white shadow-xs'
            : 'rounded-bl-xs border border-cream-200/90 dark:border-slate-800 bg-surface dark:bg-slate-900 text-warm-800 dark:text-slate-200'
        }`}
      >
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-2.5 space-y-1.5 w-full">
            {message.toolCalls.map((call, idx) => (
              <ToolCallCard key={idx} toolCall={call as any} />
            ))}
          </div>
        )}
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="leading-relaxed">
            {message.content ? (
              <MarkdownRenderer content={message.content} isStreaming={message.streaming} />
            ) : (
              <div className="space-y-2.5 py-1">
                <div className="flex items-center gap-2 text-xs font-medium text-warm-700">
                  <Loader2 className="h-4 w-4 animate-spin text-accent-orange shrink-0" />
                  <span className="font-semibold text-accent-orange animate-pulse">
                    {loadingStatusText || '正在检索知识库并深度推演中...'}
                  </span>
                </div>
                {loadingSeconds >= 8 && onSwitchFastModel && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>思考耗时较长（已用时 {loadingSeconds} 秒，未重复扣费）</span>
                    </div>
                    <p className="text-[10.5px] text-amber-700 leading-relaxed">
                      您可以继续等待推理，或一键切换备用极速模型即刻重答：
                    </p>
                    <button
                      type="button"
                      onClick={onSwitchFastModel}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10.5px] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Zap className="w-3 h-3" />
                      <span>切换备用极速模型重试</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {message.streaming && message.content && (
          <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse rounded-full bg-accent-orange align-middle shadow-xs" />
        )}
      </div>
    </div>
  )
}'''

text = text.replace(old_bubble_func, new_bubble_func)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
print('AIAssistantModal.tsx updated successfully!')
