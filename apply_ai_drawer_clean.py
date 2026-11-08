# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'e:\知识库项目\obsidian-viz\src\components\AIAssistantModal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 确保图标导入
icons_import_target = "  X,\n"
icons_import_repl = "  X,\n  AlertTriangle,\n  Zap,\n"
if icons_import_target in content and "AlertTriangle," not in content:
    content = content.replace(icons_import_target, icons_import_repl, 1)

# 2. 接口扩展
interface_target = """interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  pagePath?: string
}"""

interface_repl = """interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  pagePath?: string
  initialContextPrompt?: string | null
  initialDefaultInput?: string | null
}"""

if interface_target in content:
    content = content.replace(interface_target, interface_repl, 1)

# 3. 在组件函数体内增加 pendingContext、loadingSeconds 等状态与事件监听
func_head_target = """export default function AIAssistantModal({ isOpen, onClose, pagePath }: AIAssistantModalProps) {"""
func_head_repl = """export default function AIAssistantModal({ isOpen, onClose, pagePath, initialContextPrompt, initialDefaultInput }: AIAssistantModalProps) {"""

if func_head_target in content:
    content = content.replace(func_head_target, func_head_repl, 1)

state_target = """  const abortRef = useRef<AbortController | null>(null)"""
state_repl = """  const abortRef = useRef<AbortController | null>(null)
  // 分阶段流式等待反馈与超时容错状态
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
  }, [loadingSeconds])"""

if state_target in content:
    content = content.replace(state_target, state_repl, 1)

# 4. 在 activeSession 声明之后，定义 handleSwitchFastModelAndRetry
active_session_target = """  const activeSession = useMemo(
    () => workspace.sessions.find(session => session.id === workspace.activeSessionIdByProject[activeProject?.id || '']),
    [workspace, activeProject]
  )"""

active_session_repl = """  const activeSession = useMemo(
    () => workspace.sessions.find(session => session.id === workspace.activeSessionIdByProject[activeProject?.id || '']),
    [workspace, activeProject]
  )

  const handleSwitchFastModelAndRetry = () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setLoading(false)
    const curSessionId = activeSession?.id || workspace.activeSessionIdByProject[activeProject?.id || '']
    if (curSessionId) {
      updateSession(curSessionId, session => ({
        ...session,
        model: 'deepseek-v3',
      }))
    }
    setTimeout(() => {
      if (lastUserPromptRef.current) {
        void sendMessage(lastUserPromptRef.current)
      }
    }, 200)
  }"""

if active_session_target in content:
    content = content.replace(active_session_target, active_session_repl, 1)

# 5. 发送消息时自动拼接 pendingContext 并记录 lastUserPromptRef
send_target = """  const sendMessage = async (preset?: string) => {
    const text = (preset ?? input).trim()
    if (!text || loading) return

    const userMessage = createWorkspaceMessage('user', text)"""

send_repl = """  const sendMessage = async (preset?: string) => {
    const rawText = (preset ?? input).trim()
    if (!rawText || loading) return
    const text = pendingContext ? `${pendingContext}\\n\\n【我的具体疑问】：${rawText}` : rawText
    lastUserPromptRef.current = rawText
    setPendingContext(null)

    const userMessage = createWorkspaceMessage('user', rawText)"""

if send_target in content:
    content = content.replace(send_target, send_repl, 1)

# 6. 外层右侧滑出抽屉改造
# 找到 return (
old_modal_wrapper = """  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-warm-900/40 p-2 backdrop-blur-xs sm:p-4" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="AI 工作区"
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-2xl"
        onMouseDown={event => event.stopPropagation()}
      >"""

new_modal_wrapper = """  return (
    <div className="fixed inset-0 z-[85] flex justify-end bg-black/30 backdrop-blur-[2px] transition-opacity" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="双核 AI 伴学抽屉"
        style={
          isMaximized
            ? { width: '100vw', height: '100vh', maxWidth: 'none', maxHeight: 'none' }
            : { width: `${modalSize.width}px`, height: '100vh', maxWidth: '100vw', maxHeight: '100vh' }
        }
        className={`relative flex flex-col overflow-hidden rounded-l-3xl border-l border-slate-200/90 bg-white shadow-[-16px_0_48px_rgba(0,0,0,0.2)] animate-in slide-in-from-right duration-200 transition-all ${
          resizingRef.current ? 'select-none transition-none' : ''
        }`}
        onMouseDown={event => event.stopPropagation()}
      >
        {/* 左边缘拖拽调整宽度手柄 */}
        {!isMaximized && (
          <div
            onMouseDown={e => handleResizeStart('left', e)}
            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-indigo-500/30 active:bg-indigo-600 transition-colors z-30 flex items-center justify-center group"
            title="按住向左/向右拖拽调整抽屉宽度"
          >
            <div className="w-0.5 h-8 bg-slate-300 group-hover:bg-indigo-500 rounded-full" />
          </div>
        )}"""

if old_modal_wrapper in content:
    content = content.replace(old_modal_wrapper, new_modal_wrapper, 1)

# 7. 顶部标题栏增加 ⌘J 快捷键徽标
old_header_title = """              <h2 className="truncate text-sm font-semibold text-warm-900">{activeProject.name}</h2>
              <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-warm-400 sm:inline">{context.title}</span>"""

new_header_title = """              <h2 className="truncate text-sm font-semibold text-warm-900">{activeProject.name}</h2>
              <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-warm-400 sm:inline">{context.title}</span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-700">
                伴学抽屉 ⌘J
              </span>"""

if old_header_title in content:
    content = content.replace(old_header_title, new_header_title, 1)

# 8. 消息列表注入 loadingStatusText, loadingSeconds, onSwitchFastModel
old_msg_map = """{activeSession.messages.map(message => <MessageBubble key={message.id} message={message} />)}"""
new_msg_map = """{activeSession.messages.map(message => <MessageBubble key={message.id} message={message} loadingStatusText={loadingStatusText} loadingSeconds={loadingSeconds} onSwitchFastModel={handleSwitchFastModelAndRetry} />)}"""

if old_msg_map in content:
    content = content.replace(old_msg_map, new_msg_map, 1)

# 9. 输入框上方增加 pendingContext 卡片与发送置灰
old_input_card = """            <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
              <form onSubmit={event => { event.preventDefault(); void sendMessage() }} className="flex items-center gap-2">"""

new_input_card = """            <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
              {/* 注入的题目上下文卡片（原地提问闭环） */}
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

              <form onSubmit={event => { event.preventDefault(); void sendMessage() }} className="flex items-center gap-2">"""

if old_input_card in content:
    content = content.replace(old_input_card, new_input_card, 1)

# 10. 改造 MessageBubble 支持分阶段流式提示和 8 秒超时切换极速模型
old_bubble = """function MessageBubble({ message }: { message: AIWorkspaceMessage }) {
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
}"""

new_bubble = """function MessageBubble({
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
}"""

if old_bubble in content:
    content = content.replace(old_bubble, new_bubble, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("AIAssistantModal.tsx 纯净升级成功！")
