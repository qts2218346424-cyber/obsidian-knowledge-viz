import { Loader2, X, Plus, Trash2, MessageSquare, FolderPlus, Folder, Square } from 'lucide-react'
import { DEFAULT_PROJECT_ID, type loadWorkspace } from '../../services/ai-workspace'
import type { Conversation } from '../../features/ai-chat/types'

type Workspace = ReturnType<typeof loadWorkspace>

export interface ChatSessionSidebarProps {
  activeConvId: string
  activeProject: Workspace['projects'][number] | undefined
  workspace: Workspace
  projectConversations: Conversation[]
  runningConvs: Record<string, { status: string; streaming: boolean }>
  isHistoryLoaded: boolean
  showSessions: boolean
  sidebarWidth: number
  onCreateConversation: () => void
  deleteConversation: (convId: string) => void
  handleSelectConversation: (convId: string) => void
  handleSelectProject: (projectId: string) => void
  handleStopConversation: (convId: string) => void
  handleSidebarResizeStart: (e: React.MouseEvent) => void
  setShowProjectModal: (open: boolean) => void
  setShowSessions: (open: boolean) => void
}

export default function ChatSessionSidebar({ activeConvId, activeProject, workspace, projectConversations, runningConvs, isHistoryLoaded, showSessions, sidebarWidth, onCreateConversation, deleteConversation, handleSelectConversation, handleSelectProject, handleStopConversation, handleSidebarResizeStart, setShowProjectModal, setShowSessions }: ChatSessionSidebarProps) {
  return (
    <>
      {/* 2.1 左侧：项目与历史会话栏 */}
          {showSessions && (
            <div
              className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
              onClick={() => setShowSessions(false)}
            />
          )}
          <div
            style={{
              width: showSessions
                ? typeof window !== 'undefined' && window.innerWidth >= 768
                  ? `${sidebarWidth}px`
                  : undefined
                : undefined,
            }}
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-200 md:static md:z-auto md:shadow-2xs md:transition-none ${
              showSessions ? 'translate-x-0' : '-translate-x-full md:hidden'
            } overflow-hidden md:border md:border-neutral-200/80 md:rounded-xl shrink-0 shadow-xs complex-panel-contain`}
          >
            <div className="h-full flex flex-col bg-white">
              {/* 项目工作区与快捷操作一体顶栏 */}
              <div className="p-3 border-b border-slate-100 flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-indigo-500" />
                    <span>工作区</span>
                  </span>
                  <div className="flex items-center gap-0.5">

                    <button
                      type="button"
                      onClick={() => setShowProjectModal(true)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="新建独立项目工作区"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSessions(false)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="收起对话栏"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <select
                  value={activeProject?.id || DEFAULT_PROJECT_ID}
                  onChange={e => handleSelectProject(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-hidden focus:border-indigo-500 truncate cursor-pointer transition-colors"
                >
                  {workspace.projects.map(p => (
                    <option key={p.id} value={p.id}>
                      📁 {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 会话历史分组标题 */}
              <div className="flex items-center justify-between px-3.5 pt-3 pb-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
                  历史对话 ({projectConversations.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onCreateConversation()
                    if (window.innerWidth < 768) setShowSessions(false)
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title="新建对话"
                >
                  <Plus className="w-3 h-3" />
                  <span>新建</span>
                </button>
              </div>

              {/* 会话列表 */}
              <div className="flex-1 overflow-y-auto py-1 space-y-1">
                {!isHistoryLoaded ? (
                  <div className="p-5 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>同步云端历史记录...</span>
                  </div>
                ) : projectConversations.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400">
                    <p>当前项目暂无对话</p>
                    <button
                      type="button"
                      onClick={() => onCreateConversation()}
                      className="mt-2.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[11px] font-semibold cursor-pointer"
                    >
                      + 开启新对话
                    </button>
                  </div>
                ) : (
                  projectConversations.map(conv => {
                    const isConvRunning = Boolean(runningConvs[conv.id]?.streaming)
                    const isCurrent = activeConvId === conv.id
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          handleSelectConversation(conv.id)
                          if (window.innerWidth < 768) setShowSessions(false)
                        }}
                        className={`group flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-lg cursor-pointer text-xs transition-all ${
                          isCurrent
                            ? 'bg-neutral-900 text-white font-medium shadow-xs'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        }`}
                      >
                        {isConvRunning ? (
                          <Loader2 className="w-3.5 h-3.5 shrink-0 text-indigo-600 mt-0.5 animate-spin self-start" />
                        ) : (
                          <MessageSquare
                            className={`w-3.5 h-3.5 shrink-0 mt-0.5 self-start ${
                              isCurrent ? 'text-white' : 'text-neutral-400'
                            }`}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate flex items-center gap-1">
                            <span className="truncate">{conv.title}</span>
                            {isConvRunning && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-700 font-semibold shrink-0">
                                运行中
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400 font-normal">
                            <span>
                              {conv.provider === 'antigravity'
                                ? '✨ 研核官方 (Gemini 3.8 Flash)'
                                : conv.provider === 'codex'
                                ? '🤖 Codex'
                                : conv.provider === 'claude-code'
                                ? '⚡ Claude'
                                : '☁️ 云端'}
                            </span>
                            {conv.model && (
                              <>
                                <span>·</span>
                                <span className="font-mono truncate max-w-[110px]">
                                  {conv.model.includes('::')
                                    ? conv.model.split('::')[1]
                                    : conv.model}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          {isConvRunning && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                handleStopConversation(conv.id)
                              }}
                              className="p-1 rounded hover:bg-red-100 text-red-500 transition-all cursor-pointer"
                              title="终止该会话"
                            >
                              <Square className="w-3 h-3 fill-current" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation()
                              deleteConversation(conv.id)
                            }}
                            className="opacity-75 md:opacity-0 md:group-hover:opacity-100 p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                            title="删除会话"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* 左侧会话栏拖拽调整手柄 */}
          {showSessions && (
            <div
              onMouseDown={handleSidebarResizeStart}
              className="hidden md:flex items-center justify-center w-1.5 hover:w-2 -mx-1.5 hover:mx-0 bg-transparent hover:bg-indigo-500/30 active:bg-indigo-600 cursor-col-resize transition-all shrink-0 rounded-full my-6 z-10 group"
              title="拖拽调节会话栏宽度"
            >
              <div className="w-0.5 h-6 bg-slate-300 group-hover:bg-indigo-600 rounded-full" />
            </div>
          )}
    </>
  )
}
