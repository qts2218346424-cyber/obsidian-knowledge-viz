import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bot,
  Check,
  ChevronDown,
  Cpu,
  FolderPlus,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'
import { AI_SKILLS, getSkills } from '../data/ai-skills'
import { api, type LocalAgentStatus } from '../services/api'
import {
  createInitialWorkspace,
  createProject,
  createSession,
  createWorkspaceMessage,
  deleteProject,
  deleteSession,
  loadWorkspace,
  saveWorkspace,
  type AISession,
  type AIWorkspaceMessage,
  type AIWorkspaceState,
} from '../services/ai-workspace'

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  pagePath: string
}

const pageContext: Record<string, { title: string; description: string; prompts: string[] }> = {
  '/dashboard': {
    title: '首页助手',
    description: '帮你决定今天先做什么。',
    prompts: ['告诉我今天先做什么', '帮我看看知识库最值得整理的地方', '根据我的笔记制定一个学习计划'],
  },
  '/editor': {
    title: '笔记助手',
    description: '整理、改写和复习当前笔记。',
    prompts: ['帮我整理这篇笔记的结构', '把这篇笔记改成复习卡片', '找出这篇笔记还缺少的内容'],
  },
  '/workflow': {
    title: '整理助手',
    description: '解释整理结果并选择下一步。',
    prompts: ['分析知识库最应该先整理的地方', '解释这些整理建议', '帮我设计一个简单的文件夹结构'],
  },
  '/graph': {
    title: '图谱助手',
    description: '理解知识之间的关系。',
    prompts: ['找出知识库中的孤立主题', '哪些知识点最值得连接起来？', '根据知识图谱给我一个学习顺序'],
  },
  '/study': {
    title: '学习助手',
    description: '把知识库内容变成可执行的复习计划。',
    prompts: ['根据知识库安排今天的复习', '帮我生成一个三天复习计划', '我应该先复习哪些薄弱点？'],
  },
  '/quiz': {
    title: '做题助手',
    description: '分析错题并解释知识点。',
    prompts: ['分析我最近的错题', '根据笔记生成几道练习题', '怎样减少同类错误？'],
  },
}

const defaultContext = {
  title: '知识库助手',
  description: '搜索、整理和学习你的知识库。',
  prompts: ['搜索我的知识库', '帮我整理一个学习主题', '根据我的笔记给出下一步建议'],
}

export default function AIAssistantModal({ isOpen, onClose, pagePath }: AIAssistantModalProps) {
  const context = pageContext[pagePath] || defaultContext
  const [workspace, setWorkspace] = useState<AIWorkspaceState>(() => loadWorkspace())
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<'projects' | 'skills' | null>(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectCwd, setProjectCwd] = useState('')
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [localAgents, setLocalAgents] = useState<LocalAgentStatus[]>([])
  const [localStatusLoading, setLocalStatusLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const activeProject = useMemo(
    () => workspace.projects.find(project => project.id === workspace.activeProjectId) || workspace.projects[0],
    [workspace],
  )
  const activeSession = useMemo(
    () => workspace.sessions.find(session => session.id === workspace.activeSessionIdByProject[activeProject?.id || ''])
      || workspace.sessions.find(session => session.projectId === activeProject?.id),
    [workspace, activeProject],
  )
  const activeSkills = useMemo(() => getSkills(activeSession?.skillIds || ['knowledge']), [activeSession])
  const activeProvider = activeSession?.provider || 'web'
  const activeLocalStatus = localAgents.find(agent => agent.provider === activeProvider)
  const projectSessions = useMemo(
    () => workspace.sessions
      .filter(session => session.projectId === activeProject?.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [workspace.sessions, activeProject],
  )

  useEffect(() => {
    saveWorkspace(workspace)
  }, [workspace])

  useEffect(() => {
    if (!workspace.projects.length) setWorkspace(createInitialWorkspace())
  }, [workspace.projects.length])

  useEffect(() => {
    if (!isOpen) return
    window.setTimeout(() => inputRef.current?.focus(), 80)
    setLocalStatusLoading(true)
    api.getLocalAgentStatus()
      .then(data => setLocalAgents(data.agents))
      .catch(() => setLocalAgents([]))
      .finally(() => setLocalStatusLoading(false))
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.messages])

  useEffect(() => () => abortRef.current?.abort(), [])

  if (!isOpen || !activeProject || !activeSession) return null

  const updateSession = (sessionId: string, updater: (session: AISession) => AISession) => {
    setWorkspace(previous => ({
      ...previous,
      sessions: previous.sessions.map(session => session.id === sessionId ? updater(session) : session),
    }))
  }

  const selectProject = (projectId: string) => {
    setWorkspace(previous => ({
      ...previous,
      activeProjectId: projectId,
    }))
    setMobilePanel(null)
  }

  const selectSession = (sessionId: string) => {
    setWorkspace(previous => ({
      ...previous,
      activeSessionIdByProject: { ...previous.activeSessionIdByProject, [activeProject.id]: sessionId },
    }))
    setMobilePanel(null)
  }

  const handleCreateProject = (event: React.FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) return
    setWorkspace(previous => createProject(previous, projectName, projectDescription, projectCwd))
    setProjectName('')
    setProjectDescription('')
    setProjectCwd('')
    setShowProjectForm(false)
  }

  const handleCreateSession = () => {
    setWorkspace(previous => createSession(previous, activeProject.id, activeSession.skillIds, activeProvider, activeSession.model || ''))
  }

  const selectProvider = (provider: AISession['provider']) => {
    if (!provider || provider === activeProvider) return
    updateSession(activeSession.id, session => ({
      ...session,
      provider,
      agentSessionId: '',
      updatedAt: new Date().toISOString(),
    }))
  }

  const toggleSkill = (skillId: string) => {
    const nextIds = activeSession.skillIds.includes(skillId)
      ? activeSession.skillIds.filter(id => id !== skillId)
      : [...activeSession.skillIds, skillId]
    updateSession(activeSession.id, session => ({ ...session, skillIds: nextIds.length ? nextIds : ['knowledge'], updatedAt: new Date().toISOString() }))
  }

  const sendMessage = async (preset?: string) => {
    const text = (preset ?? input).trim()
    if (!text || loading) return

    const userMessage = createWorkspaceMessage('user', text)
    const assistantMessage = createWorkspaceMessage('assistant', '', { streaming: true, toolCalls: [] })
    const history = activeSession.messages
      .filter(message => !message.streaming && message.content)
      .slice(-10)
      .map(message => ({ role: message.role, content: message.content }))
    const skillPrompt = activeSkills.length
      ? activeSkills.map(skill => `- ${skill.name}：${skill.instruction}`).join('\n')
      : '- 知识库问答：优先基于当前 Vault 回答。'
    const agentMessage = [
      `当前项目：${activeProject.name}`,
      `项目说明：${activeProject.description || '暂无项目说明'}`,
      `当前页面：${context.title}。${context.description}`,
      `已启用 Skill：\n${skillPrompt}`,
      '',
      `用户问题：${text}`,
    ].join('\n')

    updateSession(activeSession.id, session => ({
      ...session,
      title: session.messages.length === 0 ? text.slice(0, 32) : session.title,
      updatedAt: new Date().toISOString(),
      messages: [...session.messages, userMessage, assistantMessage],
    }))
    setInput('')
    setLoading(true)

    const sessionId = activeSession.id
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch(
        activeProvider === 'web' ? '/api/agent/chat' : '/api/local-agents/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            activeProvider === 'web'
              ? { message: agentMessage, history }
              : {
                  provider: activeProvider,
                  prompt: text,
                  cwd: activeProject.cwd,
                  sessionId: activeSession.agentSessionId || undefined,
                  model: activeSession.model || undefined,
                  projectName: activeProject.name,
                  projectDescription: activeProject.description,
                  pageContext: `${context.title}。${context.description}`,
                  skillPrompt,
                },
          ),
          signal: controller.signal,
        },
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || `AI 请求失败（${response.status}）`)
      }

      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('text/event-stream')) {
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
            if (!line.startsWith('data: ')) continue
            try {
              const event = JSON.parse(line.slice(6))
              if (event.type === 'session' && event.sessionId) {
                updateSession(sessionId, session => ({
                  ...session,
                  agentSessionId: String(event.sessionId),
                  provider: activeProvider,
                  updatedAt: new Date().toISOString(),
                }))
              }
              updateSession(sessionId, session => {
                const messages = session.messages.map(message => {
                  if (message.id !== assistantMessage.id) return message
                  if (event.type === 'text') return { ...message, content: message.content + event.content }
                  if (event.type === 'tool_call') return {
                    ...message,
                    toolCalls: [...(message.toolCalls || []), { tool: event.tool, input: event.input }],
                  }
                  if (event.type === 'tool_result') {
                    const calls = [...(message.toolCalls || [])]
                    const last = calls[calls.length - 1]
                    if (last?.tool === event.tool) calls[calls.length - 1] = { ...last, output: event.output, success: event.success }
                    return { ...message, toolCalls: calls }
                  }
                  if (event.type === 'error') return { ...message, content: `请求失败：${shortError(event.content)}`, streaming: false }
                  if (event.type === 'done') return { ...message, streaming: false }
                  return message
                })
                return { ...session, messages, updatedAt: new Date().toISOString() }
              })
            } catch {
              // 忽略不完整的 SSE 数据帧。
            }
          }
        }
      } else {
        const data = await response.json()
        updateSession(sessionId, session => ({
          ...session,
          messages: session.messages.map(message => message.id === assistantMessage.id
            ? { ...message, content: data.reply || 'AI 暂时没有返回内容。', streaming: false }
            : message),
          updatedAt: new Date().toISOString(),
        }))
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        updateSession(sessionId, session => ({
          ...session,
          messages: session.messages.map(message => message.id === assistantMessage.id
            ? { ...message, content: `请求失败：${shortError(error?.message)}`, streaming: false }
            : message),
          updatedAt: new Date().toISOString(),
        }))
      }
    } finally {
      updateSession(sessionId, session => ({
        ...session,
        messages: session.messages.map(message => message.id === assistantMessage.id ? { ...message, streaming: false } : message),
        updatedAt: new Date().toISOString(),
      }))
      setLoading(false)
      abortRef.current = null
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-end bg-warm-900/20 p-2 backdrop-blur-[2px] sm:p-5" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="AI 工作区"
        className="flex h-[min(820px,calc(100vh-1rem))] w-full max-w-[980px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:h-[min(820px,calc(100vh-2.5rem))]"
        onMouseDown={event => event.stopPropagation()}
      >
        <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-warm-900 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-warm-900">{activeProject.name}</h2>
              <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-warm-400 sm:inline">{context.title}</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-warm-400">{activeSession.title} · {activeProject.description || '本地 AI 工作区'}</p>
          </div>
          <button onClick={() => setMobilePanel(mobilePanel === 'projects' ? null : 'projects')} className="rounded-full p-2 text-warm-400 hover:bg-slate-100 md:hidden" aria-label="打开项目与会话">
            <MessageSquare className="h-4 w-4" />
          </button>
          <button onClick={() => setMobilePanel(mobilePanel === 'skills' ? null : 'skills')} className="rounded-full p-2 text-warm-400 hover:bg-slate-100 md:hidden" aria-label="打开 Skill">
            <Sparkles className="h-4 w-4" />
          </button>
          <button onClick={onClose} aria-label="关闭 AI 工作区" className="rounded-full p-2 text-warm-400 hover:bg-slate-100 hover:text-warm-900">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside className={`${mobilePanel === 'projects' ? 'fixed inset-x-2 bottom-2 top-16 z-10 flex' : 'hidden'} w-[250px] shrink-0 flex-col border-r border-slate-200 bg-white md:static md:flex`}>
            <div className="flex items-center gap-2 border-b border-slate-200 p-3">
              <select value={activeProject.id} onChange={event => selectProject(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-warm-700 outline-none focus:border-accent-orange/50">
                {workspace.projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
              <button onClick={() => setShowProjectForm(value => !value)} className="rounded-xl border border-slate-200 p-2 text-warm-400 hover:border-accent-orange/40 hover:text-accent-orange" aria-label="新建项目">
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>

            {showProjectForm && (
              <form onSubmit={handleCreateProject} className="space-y-2 border-b border-slate-200 bg-slate-50 p-3">
                <input value={projectName} onChange={event => setProjectName(event.target.value)} autoFocus placeholder="项目名称" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-accent-orange/50" />
                <textarea value={projectDescription} onChange={event => setProjectDescription(event.target.value)} rows={2} placeholder="项目说明（可选）" className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-accent-orange/50" />
                <input value={projectCwd} onChange={event => setProjectCwd(event.target.value)} placeholder="本地工作目录（可选）" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-accent-orange/50" />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-xl bg-warm-900 px-3 py-2 text-xs font-medium text-white">创建项目</button>
                  <button type="button" onClick={() => setShowProjectForm(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs text-warm-500">取消</button>
                </div>
              </form>
            )}

            <div className="flex items-center justify-between px-3 pb-1 pt-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-warm-400">会话</span>
              <button onClick={handleCreateSession} className="rounded-lg p-1 text-warm-400 hover:bg-slate-100 hover:text-accent-orange" aria-label="新建会话">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
              {projectSessions.map(session => (
                <div key={session.id} className={`group flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs ${session.id === activeSession.id ? 'bg-warm-900 text-white' : 'text-warm-600 hover:bg-slate-100'}`}>
                  <button onClick={() => selectSession(session.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{session.title}</span>
                  </button>
                  <button onClick={() => setWorkspace(previous => deleteSession(previous, session.id))} className={`shrink-0 rounded p-1 opacity-0 group-hover:opacity-100 ${session.id === activeSession.id ? 'hover:bg-white/15' : 'hover:bg-slate-200'}`} aria-label="删除会话">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            {workspace.projects.length > 1 && (
              <button onClick={() => setWorkspace(previous => deleteProject(previous, activeProject.id))} className="m-3 flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-[11px] text-rose-500 hover:bg-rose-50">
                <Trash2 className="h-3 w-3" /> 删除当前项目
              </button>
            )}
          </aside>

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5 sm:px-5">
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                {([
                  ['web', '网页 AI'],
                  ['claude-code', 'Claude Code'],
                  ['codex', 'Codex'],
                ] as const).map(([provider, label]) => {
                  const status = localAgents.find(agent => agent.provider === provider)
                  const selected = activeProvider === provider
                  const disabled = provider !== 'web' && (!status?.available || localStatusLoading)
                  return (
                    <button
                      key={provider}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectProvider(provider)}
                      className={`rounded-full px-2.5 py-1.5 text-[11px] transition ${
                        selected
                          ? 'bg-warm-900 text-white shadow-sm'
                          : disabled
                            ? 'cursor-not-allowed text-warm-300'
                            : 'text-warm-500 hover:bg-white hover:text-warm-900'
                      }`}
                      title={provider === 'web'
                        ? '使用已配置的网页 AI'
                        : status?.available
                          ? `${label}：${status.version || '已检测'}`
                          : `${label}：${status?.detail || '本机未检测到'}`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <span className="hidden items-center gap-1 text-[10px] text-warm-400 lg:flex">
                <Cpu className="h-3 w-3" />
                {localStatusLoading
                  ? '正在检测本机 Agent…'
                  : activeProvider === 'web'
                    ? '网页模式'
                    : activeLocalStatus?.available
                      ? `${activeProvider === 'claude-code' ? 'Claude Code' : 'Codex'} 已连接`
                      : '本机 Agent 不可用'}
              </span>
              <button onClick={() => setSkillsOpen(value => !value)} className="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-warm-600 hover:border-accent-orange/40">
                <Sparkles className="h-3.5 w-3.5 text-accent-orange" />
                <span>{activeSkills.length ? activeSkills.map(skill => skill.name).join('、') : '选择 Skill'}</span>
                <ChevronDown className="h-3 w-3 text-warm-400" />
              </button>
              <span className="hidden truncate text-[11px] text-warm-400 sm:inline">{context.description}</span>
              {activeProvider !== 'web' && activeProject.cwd && (
                <span className="hidden max-w-[220px] truncate text-[10px] text-warm-400 xl:inline" title={activeProject.cwd}>
                  {activeProject.cwd}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setLocalStatusLoading(true)
                  api.getLocalAgentStatus()
                    .then(data => setLocalAgents(data.agents))
                    .catch(() => setLocalAgents([]))
                    .finally(() => setLocalStatusLoading(false))
                }}
                className="rounded-lg p-1.5 text-warm-400 hover:bg-slate-100 hover:text-warm-900"
                aria-label="刷新本机 Agent 状态"
                title="刷新本机 Agent 状态"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${localStatusLoading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setMobilePanel('projects')} className="ml-auto rounded-lg p-1.5 text-warm-400 hover:bg-slate-100 md:hidden" aria-label="会话管理">
                <Settings2 className="h-4 w-4" />
              </button>
            </div>

            {skillsOpen && (
              <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
                <div className="mb-2 text-[11px] font-medium text-warm-500">为当前会话启用 Skill</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {AI_SKILLS.map(skill => {
                    const active = activeSession.skillIds.includes(skill.id)
                    return (
                      <button key={skill.id} onClick={() => toggleSkill(skill.id)} className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-left ${active ? 'border-accent-orange/40 bg-accent-orange/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs ${skill.color}`}>{skill.icon}</span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-warm-700">{skill.name}{active && <Check className="h-3 w-3 text-accent-sage" />}</span>
                          <span className="mt-0.5 block text-[10px] leading-4 text-warm-400">{skill.description}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto bg-slate-50/70 px-4 py-4 sm:px-6">
              {activeSession.messages.length === 0 && (
                <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-warm-800">
                    <Sparkles className="h-4 w-4 text-accent-orange" />
                    从一个具体问题开始
                  </div>
                  <p className="mt-1 text-xs leading-5 text-warm-400">当前项目、页面上下文和已启用 Skill 会自动带入这次对话。</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {context.prompts.map(prompt => (
                      <button key={prompt} onClick={() => void sendMessage(prompt)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs text-warm-600 hover:border-accent-orange/40 hover:bg-accent-orange/5 hover:text-warm-900">
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mx-auto max-w-2xl space-y-4">
                {activeSession.messages.map(message => <MessageBubble key={message.id} message={message} />)}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
              <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-accent-orange/50 focus-within:bg-white">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void sendMessage()
                    }
                  }}
                  rows={1}
                  placeholder="问问当前项目或页面内容…"
                  className="max-h-28 min-h-8 flex-1 resize-none bg-transparent px-1 py-1 text-sm text-warm-800 outline-none placeholder:text-warm-400"
                />
                <button onClick={() => void sendMessage()} disabled={!input.trim() || loading} aria-label="发送消息" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-warm-900 text-white hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
              <div className="mx-auto mt-2 flex max-w-2xl items-center gap-1 text-[10px] text-warm-400">
                <Check className="h-3 w-3 text-accent-sage" />
                已保存到本地工作区 · Enter 发送，Shift + Enter 换行
              </div>
            </div>
          </main>
        </div>
      </section>
    </div>
  )
}

function MessageBubble({ message }: { message: AIWorkspaceMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${isUser ? 'rounded-br-md bg-warm-900 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-warm-700'}`}>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-2 rounded-xl bg-slate-50 px-2.5 py-2 text-[10px] text-warm-400">
            已调用 {message.toolCalls.length} 个知识库工具：{message.toolCalls.map(call => call.tool).join('、')}
          </div>
        )}
        {isUser
          ? <div className="whitespace-pre-wrap">{message.content}</div>
          : <div className="prose prose-sm max-w-none [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_code]:text-accent-sage">{message.content ? <MarkdownRenderer content={message.content} /> : <Loader2 className="h-4 w-4 animate-spin text-accent-orange" />}</div>}
        {message.streaming && message.content && <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded bg-accent-orange align-middle" />}
      </div>
    </div>
  )
}

function shortError(message: unknown) {
  const text = String(message || 'AI 暂时不可用')
  if (text.includes('Cloudflare') || text.includes('Just a moment')) return 'AI 服务被上游防护页面拦截，请检查 Base URL。'
  return text.length > 180 ? `${text.slice(0, 180)}…` : text
}
