import { memo, useState, useMemo, useEffect } from 'react'
import {
  Copy,
  Check,
  Save,
  Target,
  Trash2,
  Play,
  RotateCcw,
  Edit3,
  Undo2,
  Users,
  FileCode,
  FileText,
  ChevronDown,
  ChevronUp,
  Columns,
  Maximize2,
  Loader2,
} from 'lucide-react'
import MarkdownRenderer from '../MarkdownRenderer'
import ToolCallCard from '../ToolCallCard'
import LuluAvatar from '../Pet/LuluAvatar'
import { STUDY_AGENTS, type StudyAgent } from '../../data/studyAgents'
import { formatUnifiedModelName, detectCrossSubjectProxy } from '../../utils/modelDisplay'
import type { AgentMessage } from '../../features/ai-chat/types'

interface ChatMessageItemProps {
  msg: AgentMessage
  isDeferred: boolean
  activeAgent: StudyAgent
  provider: string
  selectedModel: string
  messageWidthClass: string
  fontSizeClass: string
  copiedId: string | null
  isCurrentRunning: boolean
  onCopy: (id: string, text: string) => void
  onSaveMessage: (msg: AgentMessage) => void
  onTriggerPractice: (msg: AgentMessage) => void
  onDeleteMessage: (id: string) => void
  onContinue: (id: string) => void
  onRegenerate: (id: string) => void
  onEditMessage: (id: string) => void
  onRecallMessage: (id: string) => void
  onPreviewImage: (url: string) => void
  onSwitchModel?: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function StreamingWaitBanner() {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const stepIdx = elapsed < 4 ? 0 : elapsed < 12 ? 1 : elapsed < 25 ? 2 : 3
  const stepTexts = [
    '第 1/3 步：正在检索个人知识库与考纲关联点...',
    '第 2/3 步：正在推演核心解题步骤与避坑要点...',
    '第 3/3 步：正在校对数学公式与排版结构...',
    `深度推理内容较多，正在加速生成（已用时 ${elapsed} 秒）...`,
  ]
  const progress = Math.min(94, 14 + elapsed * 3)

  return (
    <div className="py-2 space-y-2 max-w-md">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-indigo-700">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
          <span>{stepTexts[stepIdx]}</span>
        </span>
        <span className="text-[10.5px] font-mono text-slate-400 shrink-0">{elapsed}s</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span className={stepIdx === 0 ? 'text-indigo-600 font-semibold' : 'text-emerald-600'}>
          ① 检索知识库
        </span>
        <span className={stepIdx === 1 ? 'text-indigo-600 font-semibold' : stepIdx > 1 ? 'text-emerald-600' : ''}>
          ② 推理核心逻辑
        </span>
        <span className={stepIdx >= 2 ? 'text-indigo-600 font-semibold' : ''}>
          ③ 校对并输出
        </span>
      </div>
    </div>
  )
}

export const ChatMessageItem = memo(
  function ChatMessageItem({
    msg,
    isDeferred,
    activeAgent,
    provider,
    selectedModel,
    messageWidthClass,
    fontSizeClass,
    copiedId,
    isCurrentRunning,
    onCopy,
    onSaveMessage,
    onTriggerPractice,
    onDeleteMessage,
    onContinue,
    onRegenerate,
    onEditMessage,
    onRecallMessage,
    onPreviewImage,
    onSwitchModel,
  }: ChatMessageItemProps) {
    const isUser = msg.role === 'user'
    const [isCollapsed, setIsCollapsed] = useState(false)
    // 双智能体视图模式：'split' (双栏并排) | 'tab-a' (仅看主导师 A) | 'tab-b' (仅看协同导师 B)
    const [dualViewMode, setDualViewMode] = useState<'split' | 'tab-a' | 'tab-b'>('split')

    // 提取首行摘要用于折叠态展示
    const summaryPreview = useMemo(() => {
      if (!msg.content) return '空内容'
      const clean = msg.content
        .replace(/<(think|thought)>[\s\S]*?<\/\1>/gi, '')
        .replace(/[#*`>-]/g, '')
        .trim()
      const firstLine = clean.split('\n').find(l => l.trim().length > 0) || clean
      return firstLine.slice(0, 85) + (firstLine.length > 85 ? '...' : '')
    }, [msg.content])

    const isLongMessage = (msg.content?.length || 0) > 360

    // 👥 双智能体协同消息渲染
    if (!isUser && msg.isDual && msg.peerResponse) {
      return (
        <div
          className={`${messageWidthClass} mx-auto my-2 sm:my-2.5 transition-all duration-150 ${
            isDeferred ? 'chat-message-deferred' : ''
          }`}
        >
          {/* 双师研讨顶部控制栏 */}
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <div className="p-1 rounded-lg bg-orange-500/10 text-accent-orange">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span>双师同台对比研讨</span>
              <span className="text-2xs text-slate-400 font-normal hidden sm:inline">
                多视角推演与采分点互补
              </span>
            </div>

            {/* 视图切换：双栏并排 vs 单栏专注放大 */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200/80 rounded-xl p-0.5 text-2xs">
              <button
                type="button"
                onClick={() => setDualViewMode('split')}
                className={`px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  dualViewMode === 'split'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="双栏同屏对比"
              >
                <Columns className="w-3 h-3" />
                <span>双栏对比</span>
              </button>
              <button
                type="button"
                onClick={() => setDualViewMode('tab-a')}
                className={`px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  dualViewMode === 'tab-a'
                    ? 'bg-orange-500 text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="全宽放大查看主导师 A"
              >
                <span>{msg.agentIcon || activeAgent.icon} 主导师</span>
              </button>
              <button
                type="button"
                onClick={() => setDualViewMode('tab-b')}
                className={`px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                  dualViewMode === 'tab-b'
                    ? 'bg-purple-600 text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="全宽放大查看协同导师 B"
              >
                <span>{msg.peerResponse.agentIcon} 协同导师</span>
              </button>
            </div>
          </div>

          <div
            className={`grid gap-3.5 ${
              dualViewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {/* 智能体 A 卡片 */}
            {(dualViewMode === 'split' || dualViewMode === 'tab-a') && (
              <div className="flex flex-col bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs hover:border-orange-300/80 transition-all min-w-0">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg p-1.5 rounded-xl bg-orange-500/10 text-orange-600 shrink-0">
                      {msg.agentIcon || activeAgent.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {msg.agentName || activeAgent.name}
                        </span>
                        <span className="text-2xs px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-200/60 font-semibold shrink-0">
                          主视角 A
                        </span>
                      </div>
                      <div className="text-2xs text-slate-400 font-mono truncate">
                        [{msg.provider || provider}] {(msg.model || selectedModel).replace(/^.*::/, '')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {msg.streaming ? (
                      <span className="text-2xs text-accent-orange font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
                        推演中...
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setDualViewMode(dualViewMode === 'tab-a' ? 'split' : 'tab-a')
                          }
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title={dualViewMode === 'tab-a' ? '恢复双栏对比' : '单栏全宽放大'}
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onCopy(msg.id + '-a', msg.content)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="复制回答"
                        >
                          {copiedId === msg.id + '-a' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className={`flex-1 ${fontSizeClass} text-slate-800 min-h-[60px] overflow-x-hidden`}>
                  {msg.streaming && !msg.content ? (
                    <StreamingWaitBanner />
                  ) : (
                    <>
                      <MarkdownRenderer content={msg.content} isStreaming={msg.streaming} />
                      {msg.streaming && (
                        <span className="inline-block w-2 h-4 bg-accent-orange animate-pulse ml-1 align-middle rounded-full" />
                      )}
                    </>
                  )}
                </div>

                {!msg.streaming && msg.content && (
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-2xs text-slate-500 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onCopy(msg.id + '-a', msg.content)}
                      className="hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id + '-a' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === msg.id + '-a' ? '已复制' : '复制'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onSaveMessage({
                          ...msg,
                          content: `### 【${msg.agentName} · 解答】\n\n` + msg.content,
                        })
                      }
                      className="hover:text-purple-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      <span>沉淀笔记</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onTriggerPractice({ ...msg, content: msg.content })}
                      className="hover:text-orange-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 text-orange-600 font-medium transition-colors cursor-pointer"
                    >
                      <Target className="w-3 h-3" />
                      <span>考我3道题</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(msg.id)}
                      className="hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer ml-auto"
                      title="删除此研讨"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 智能体 B 卡片 */}
            {(dualViewMode === 'split' || dualViewMode === 'tab-b') && (
              <div className="flex flex-col bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-indigo-300/60 transition-all min-w-0 leading-[1.75] academic-body">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg p-1.5 rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
                      {msg.peerResponse.agentIcon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {msg.peerResponse.agentName}
                        </span>
                        <span className="text-2xs px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-200/60 font-semibold shrink-0">
                          协同视角 B
                        </span>
                      </div>
                      <div className="text-2xs text-slate-400 font-mono truncate">
                        [{msg.peerResponse.provider}] {msg.peerResponse.model.replace(/^.*::/, '')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {msg.peerResponse.streaming ? (
                      <span className="text-2xs text-purple-600 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        协同解答中...
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setDualViewMode(dualViewMode === 'tab-b' ? 'split' : 'tab-b')
                          }
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title={dualViewMode === 'tab-b' ? '恢复双栏对比' : '单栏全宽放大'}
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onCopy(msg.id + '-b', msg.peerResponse!.content)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="复制回答"
                        >
                          {copiedId === msg.id + '-b' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className={`flex-1 ${fontSizeClass} text-slate-800 min-h-[60px] overflow-x-hidden`}>
                  <MarkdownRenderer
                    content={msg.peerResponse.content}
                    isStreaming={msg.peerResponse.streaming}
                  />
                  {msg.peerResponse.streaming && (
                    <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1 align-middle rounded-full" />
                  )}
                </div>

                {!msg.peerResponse.streaming && msg.peerResponse.content && (
                  <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-2xs text-slate-500 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onCopy(msg.id + '-b', msg.peerResponse!.content)}
                      className="hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id + '-b' ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === msg.id + '-b' ? '已复制' : '复制'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onSaveMessage({
                          ...msg,
                          content:
                            `### 【${msg.peerResponse!.agentName} · 解答】\n\n` +
                            msg.peerResponse!.content,
                        })
                      }
                      className="hover:text-purple-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      <span>沉淀笔记</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onTriggerPractice({ ...msg, content: msg.peerResponse!.content })
                      }
                      className="hover:text-orange-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 text-orange-600 font-medium transition-colors cursor-pointer"
                    >
                      <Target className="w-3 h-3" />
                      <span>考我3道题</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(msg.id)}
                      className="hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer ml-auto"
                      title="删除此研讨"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    const matchedAgent =
      STUDY_AGENTS.find(a => a.name === msg.agentName || a.id === msg.agentName) || activeAgent
    const provDisplay = msg.provider || provider
    const modelDisplay = msg.model || selectedModel
    const proxySubject = matchedAgent.id === 'agent-408'
      ? detectCrossSubjectProxy(msg.content || '', matchedAgent.id)
      : null

    return (
      <div
        className={`${messageWidthClass} mx-auto w-full flex gap-2 sm:gap-3 ${
          isUser ? 'justify-end' : 'justify-start'
        } ${isDeferred ? 'chat-message-deferred' : ''}`}
      >
        {!isUser && (
          <div className="hidden sm:flex w-8 h-8 rounded-xl bg-slate-100 items-center justify-center shrink-0 border border-slate-200/80 shadow-xs mt-0.5">
            <LuluAvatar size="xs" mood={msg.streaming ? 'thinking' : 'idle'} />
          </div>
        )}

        <div
          className={`${
            isUser ? 'max-w-[90%] sm:max-w-[78%]' : 'flex-1'
          } min-w-0 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
        >
          {/* 助手消息顶部信息栏 + 快捷工具条（解决长消息必须滚到底部才能复制/保存的痛点） */}
          {!isUser && (
            <div className="flex items-center justify-between gap-2 mb-1.5 px-1 text-xs w-full">
              <div className="flex items-center flex-wrap gap-1.5 min-w-0">
                <span className="sm:hidden inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 border border-slate-200/80 shrink-0">
                  <LuluAvatar size="xs" mood={msg.streaming ? 'thinking' : 'idle'} />
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span>{msg.agentIcon || matchedAgent.icon}</span>
                  <span>{msg.agentName || matchedAgent.name}</span>
                </span>
                {proxySubject && (
                  <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                    研小核（代答）
                  </span>
                )}
                <span
                  className={`inline-flex items-center text-2xs leading-tight px-1.5 py-0.5 rounded-md border font-medium ${matchedAgent.badgeClass}`}
                >
                  {matchedAgent.title}
                </span>
                {(provDisplay || modelDisplay) && (
                  <span className="text-2xs text-slate-400 font-mono truncate max-w-[160px] sm:max-w-[260px]">
                    {formatUnifiedModelName(provDisplay, modelDisplay)}
                  </span>
                )}
              </div>

              {/* 右上角快捷操作组（无需滚到底部即可一键复制、保存、出题、折叠） */}
              {!msg.streaming && msg.content && msg.id !== 'welcome' && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onCopy(msg.id, msg.content)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-2xs text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    title="复制全文 Markdown"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span className="hidden md:inline">
                      {copiedId === msg.id ? '已复制' : '复制'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveMessage(msg)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-2xs text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                    title="一键沉淀为知识库笔记"
                  >
                    <Save className="w-3 h-3 text-purple-500" />
                    <span className="hidden lg:inline">存笔记</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerPractice(msg)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-2xs text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                    title="针对此解答现场考我 3 道题"
                  >
                    <Target className="w-3 h-3 text-orange-500" />
                    <span className="hidden lg:inline">考3题</span>
                  </button>
                  {isLongMessage && (
                    <button
                      type="button"
                      onClick={() => setIsCollapsed(prev => !prev)}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-2xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title={isCollapsed ? '展开完整回答' : '折叠长回答'}
                    >
                      {isCollapsed ? (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          <span>展开</span>
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          <span className="hidden sm:inline">收起</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 消息卡片主体 (高密度精致排版：紧凑适度，保持可读性) */}
          <div
            className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl max-w-full overflow-x-hidden ${fontSizeClass} shadow-xs ${
              isUser
                ? 'bg-slate-900 text-white rounded-2xl rounded-br-xs shadow-xs border border-slate-800'
                : 'w-full bg-white border border-slate-200/60 text-slate-900 rounded-2xl rounded-tl-xs shadow-[0_2px_10px_rgba(0,0,0,0.02)] leading-[1.56] academic-body'
            }`}
          >
            {/* 工具调用折叠卡 */}
            {msg.toolCalls && msg.toolCalls.length > 0 && (
              <div className="mb-3 space-y-1.5 w-full">
                {msg.toolCalls.map((tc, idx) => (
                  <ToolCallCard key={idx} toolCall={tc} />
                ))}
              </div>
            )}

            {/* 用户附带的图片展示 */}
            {msg.images && msg.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2.5">
                {msg.images.map((imgUrl, imgIdx) => (
                  <img
                    key={imgIdx}
                    src={imgUrl}
                    alt="附带图片"
                    onClick={() => onPreviewImage(imgUrl)}
                    className="max-h-56 max-w-xs object-cover rounded-xl border border-white/20 shadow-xs cursor-pointer hover:opacity-90 transition-opacity bg-black/10"
                  />
                ))}
              </div>
            )}

            {/* 用户附带的文件胶囊卡片 */}
            {msg.files && msg.files.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {msg.files.map((file, fileIdx) => (
                  <div
                    key={fileIdx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs backdrop-blur-xs shadow-xs"
                    title={file.name}
                  >
                    {file.ext &&
                    [
                      '.c',
                      '.cpp',
                      '.h',
                      '.hpp',
                      '.py',
                      '.java',
                      '.js',
                      '.ts',
                      '.html',
                      '.css',
                      '.sql',
                    ].includes(file.ext) ? (
                      <FileCode className="w-3.5 h-3.5 text-amber-200 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                    )}
                    <span className="font-medium truncate max-w-[180px]">{file.name}</span>
                    <span className="text-2xs opacity-75 font-mono">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 正文渲染（支持长回答折叠预览） */}
            {!isUser && isCollapsed ? (
              <div
                onClick={() => setIsCollapsed(false)}
                className="flex items-center justify-between gap-3 py-1 px-1 cursor-pointer text-slate-600 hover:text-slate-900"
              >
                <p className="text-xs truncate flex-1 font-medium">
                  📌 <span className="text-slate-400 mr-1">[已折叠]</span>
                  {summaryPreview}
                </p>
                <span className="text-2xs font-semibold text-slate-800 shrink-0 flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                  <ChevronDown className="w-3.5 h-3.5" />
                  展开全文 ({msg.content.length} 字)
                </span>
              </div>
            ) : isUser ? (
              <div className="whitespace-pre-wrap break-words leading-relaxed text-2xs sm:text-xs">{msg.content}</div>
            ) : msg.streaming && !msg.content ? (
              <StreamingWaitBanner />
            ) : (
              <>
                {msg.content && (
                  <MarkdownRenderer content={msg.content} isStreaming={msg.streaming} />
                )}
                {msg.streaming && (
                  <span className="inline-block w-2 h-4 ml-1 rounded-full bg-accent-orange animate-pulse align-middle shadow-xs" />
                )}
                {!msg.streaming && msg.error && (
                  <div className="mt-1 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 space-y-2">
                    <div className="text-xs font-semibold text-amber-800">
                      {msg.error === '响应超时' ? '响应超时（30 秒内未收到模型回复，本次未扣费）' : msg.error}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onRegenerate(msg.id)}
                        disabled={isCurrentRunning}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-black text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>重试</span>
                      </button>
                      {onSwitchModel && (
                        <button
                          type="button"
                          onClick={onSwitchModel}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <span>切换模型</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 用户提问消息操作栏：编辑、撤回、复制 */}
          {isUser && (
            <div className="flex items-center gap-1.5 mt-1 text-2xs text-slate-400 opacity-80 hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEditMessage(msg.id)}
                className="hover:text-indigo-600 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                title="编辑问题并重新提问"
              >
                <Edit3 className="w-3 h-3" />
                <span>编辑</span>
              </button>
              <button
                type="button"
                onClick={() => onRecallMessage(msg.id)}
                className="hover:text-red-500 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                title="撤回本条提问及后续回答"
              >
                <Undo2 className="w-3 h-3" />
                <span>撤回</span>
              </button>
              <button
                type="button"
                onClick={() => onCopy(msg.id, msg.content)}
                className="hover:text-slate-700 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                title="复制提问内容"
              >
                {copiedId === msg.id ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedId === msg.id ? '已复制' : '复制'}</span>
              </button>
            </div>
          )}

          {/* 助手消息底部完整操作栏 */}
          {!isUser && !msg.streaming && msg.content && !isCollapsed && msg.id !== 'welcome' && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 px-0.5 text-2xs text-slate-400 flex-wrap w-full">
              <button
                type="button"
                onClick={() => onContinue(msg.id)}
                disabled={isCurrentRunning}
                className="text-indigo-600 hover:bg-indigo-50 border border-indigo-200/80 font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                title="若回答未讲完或断在半句，一键让智能体紧接着断点无缝续写"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>继续生成</span>
              </button>

              <button
                type="button"
                onClick={() => onRegenerate(msg.id)}
                disabled={isCurrentRunning}
                className="hover:text-slate-800 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                title="重新生成该条回答"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重新生成</span>
              </button>

              <button
                type="button"
                onClick={() => onCopy(msg.id, msg.content)}
                className="hover:text-slate-800 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="复制完整回复 Markdown"
              >
                {copiedId === msg.id ? (
                  <Check className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedId === msg.id ? '已复制' : '复制'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSaveMessage(msg)}
                className="hover:text-purple-700 text-purple-600 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer font-medium"
                title="一键将此讲解沉淀为知识库 Markdown 真实笔记"
              >
                <Save className="w-3 h-3" />
                <span>沉淀笔记</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerPractice(msg)}
                className="hover:text-orange-700 text-orange-600 flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-orange-50 font-medium transition-colors cursor-pointer"
                title="针对本条考点讲解，现场命制 3 道真题自测"
              >
                <Target className="w-3 h-3" />
                <span>考我3道题</span>
              </button>

              {isLongMessage && (
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="hover:text-slate-700 flex items-center gap-0.5 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="收起此长回答"
                >
                  <ChevronUp className="w-3 h-3" />
                  <span>收起</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onDeleteMessage(msg.id)}
                className="hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer ml-auto"
                title="删除此条回复"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  },
  (prev, next) => {
    const isPrevCopied =
      prev.copiedId === prev.msg.id ||
      prev.copiedId === prev.msg.id + '-a' ||
      prev.copiedId === prev.msg.id + '-b'
    const isNextCopied =
      next.copiedId === next.msg.id ||
      next.copiedId === next.msg.id + '-a' ||
      next.copiedId === next.msg.id + '-b'

    return (
      prev.msg.id === next.msg.id &&
      prev.msg.content === next.msg.content &&
      prev.msg.streaming === next.msg.streaming &&
      prev.msg.error === next.msg.error &&
      prev.msg.peerResponse?.content === next.msg.peerResponse?.content &&
      prev.msg.peerResponse?.streaming === next.msg.peerResponse?.streaming &&
      prev.msg.toolCalls?.length === next.msg.toolCalls?.length &&
      prev.isDeferred === next.isDeferred &&
      prev.messageWidthClass === next.messageWidthClass &&
      prev.fontSizeClass === next.fontSizeClass &&
      prev.isCurrentRunning === next.isCurrentRunning &&
      isPrevCopied === isNextCopied
    )
  }
)

export default ChatMessageItem
