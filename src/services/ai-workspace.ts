export interface AIWorkspaceMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  streaming?: boolean
  toolCalls?: {
    tool: string
    input?: Record<string, unknown>
    output?: string
    success?: boolean
  }[]
}

export interface AIProject {
  id: string
  name: string
  description: string
  cwd?: string
  createdAt: string
  updatedAt: string
}

export interface AISession {
  id: string
  projectId: string
  title: string
  createdAt: string
  updatedAt: string
  skillIds: string[]
  provider?: 'web' | 'claude-code' | 'codex'
  model?: string
  agentSessionId?: string
  messages: AIWorkspaceMessage[]
}

export interface AIWorkspaceState {
  version: 1
  activeProjectId: string
  activeSessionIdByProject: Record<string, string>
  projects: AIProject[]
  sessions: AISession[]
}

export const AI_WORKSPACE_STORAGE_KEY = 'knowledge-viz-ai-workspace-v1'
export const DEFAULT_PROJECT_ID = 'project-default'

function createId(prefix: string) {
  const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${uuid}`
}

export function createWorkspaceMessage(
  role: AIWorkspaceMessage['role'],
  content: string,
  extra: Partial<AIWorkspaceMessage> = {},
): AIWorkspaceMessage {
  return {
    id: createId(role),
    role,
    content,
    createdAt: new Date().toISOString(),
    ...extra,
  }
}

export function createInitialWorkspace(): AIWorkspaceState {
  const now = new Date().toISOString()
  const project: AIProject = {
    id: DEFAULT_PROJECT_ID,
    name: '当前知识库',
    description: '围绕当前 Obsidian Vault 的学习、整理和写作工作区。',
    createdAt: now,
    updatedAt: now,
  }
  const session: AISession = {
    id: createId('session'),
    projectId: project.id,
    title: '新会话',
    createdAt: now,
    updatedAt: now,
    skillIds: ['knowledge'],
    provider: 'web',
    messages: [],
  }
  return {
    version: 1,
    activeProjectId: project.id,
    activeSessionIdByProject: { [project.id]: session.id },
    projects: [project],
    sessions: [session],
  }
}

function isRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function normalizeWorkspace(value: unknown): AIWorkspaceState {
  const fallback = createInitialWorkspace()
  if (!isRecord(value)) return fallback

  const projects = Array.isArray(value.projects)
    ? value.projects.filter(isRecord).map(project => ({
      id: String(project.id || createId('project')),
      name: String(project.name || '未命名项目'),
      description: String(project.description || ''),
      cwd: typeof project.cwd === 'string' ? project.cwd : '',
      createdAt: String(project.createdAt || new Date().toISOString()),
      updatedAt: String(project.updatedAt || project.createdAt || new Date().toISOString()),
    }))
    : []

  const safeProjects = projects.length > 0 ? projects : fallback.projects
  const projectIds = new Set(safeProjects.map(project => project.id))
  const sessions: AISession[] = Array.isArray(value.sessions)
    ? value.sessions.filter(isRecord).map(session => ({
      id: String(session.id || createId('session')),
      projectId: projectIds.has(String(session.projectId)) ? String(session.projectId) : safeProjects[0].id,
      title: String(session.title || '新会话'),
      createdAt: String(session.createdAt || new Date().toISOString()),
      updatedAt: String(session.updatedAt || session.createdAt || new Date().toISOString()),
      skillIds: Array.isArray(session.skillIds) ? session.skillIds.map(String) : ['knowledge'],
      provider: session.provider === 'claude-code' || session.provider === 'codex' ? session.provider : 'web',
      model: typeof session.model === 'string' ? session.model : '',
      agentSessionId: typeof session.agentSessionId === 'string' ? session.agentSessionId : '',
      messages: Array.isArray(session.messages)
        ? session.messages.filter(isRecord).map(message => ({
          id: String(message.id || createId('message')),
          role: (message.role === 'user' ? 'user' : 'assistant') as AIWorkspaceMessage['role'],
          content: String(message.content || ''),
          createdAt: String(message.createdAt || new Date().toISOString()),
          streaming: false,
          toolCalls: Array.isArray(message.toolCalls) ? message.toolCalls : [],
        }))
        : [],
    }))
    : []

  const safeSessions: AISession[] = sessions.length > 0 ? sessions : fallback.sessions
  const activeProjectId = projectIds.has(String(value.activeProjectId))
    ? String(value.activeProjectId)
    : safeProjects[0].id
  const activeSessionIdByProject: Record<string, string> = {}
  for (const project of safeProjects) {
    const projectSession = safeSessions.find(session => session.projectId === project.id)
    const savedId = isRecord(value.activeSessionIdByProject)
      ? String(value.activeSessionIdByProject[project.id] || '')
      : ''
    activeSessionIdByProject[project.id] = safeSessions.some(session => session.id === savedId && session.projectId === project.id)
      ? savedId
      : projectSession?.id || createId('session')
    if (!safeSessions.some(session => session.id === activeSessionIdByProject[project.id])) {
      const newSession: AISession = {
        id: activeSessionIdByProject[project.id],
        projectId: project.id,
        title: '新会话',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skillIds: ['knowledge'],
        provider: 'web',
        messages: [],
      }
      safeSessions.push(newSession)
    }
  }

  return {
    version: 1,
    activeProjectId,
    activeSessionIdByProject,
    projects: safeProjects,
    sessions: safeSessions,
  }
}

export function loadWorkspace(): AIWorkspaceState {
  if (typeof window === 'undefined') return createInitialWorkspace()
  try {
    const raw = window.localStorage.getItem(AI_WORKSPACE_STORAGE_KEY)
    return raw ? normalizeWorkspace(JSON.parse(raw)) : createInitialWorkspace()
  } catch {
    return createInitialWorkspace()
  }
}

export function saveWorkspace(workspace: AIWorkspaceState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AI_WORKSPACE_STORAGE_KEY, JSON.stringify(workspace))
}

export function createProject(workspace: AIWorkspaceState, name: string, description: string, cwd = ''): AIWorkspaceState {
  const now = new Date().toISOString()
  const project: AIProject = {
    id: createId('project'),
    name: name.trim() || '未命名项目',
    description: description.trim(),
    cwd: cwd.trim(),
    createdAt: now,
    updatedAt: now,
  }
  const session: AISession = {
    id: createId('session'),
    projectId: project.id,
    title: '新会话',
    createdAt: now,
    updatedAt: now,
    skillIds: ['knowledge'],
    messages: [],
  }
  return {
    ...workspace,
    activeProjectId: project.id,
    activeSessionIdByProject: { ...workspace.activeSessionIdByProject, [project.id]: session.id },
    projects: [...workspace.projects, project],
    sessions: [...workspace.sessions, session],
  }
}

export function createSession(
  workspace: AIWorkspaceState,
  projectId: string,
  skillIds = ['knowledge'],
  provider: AISession['provider'] = 'web',
  model = '',
): AIWorkspaceState {
  const now = new Date().toISOString()
  const session: AISession = {
    id: createId('session'),
    projectId,
    title: '新会话',
    createdAt: now,
    updatedAt: now,
    skillIds,
    provider,
    model,
    messages: [],
  }
  return {
    ...workspace,
    activeSessionIdByProject: { ...workspace.activeSessionIdByProject, [projectId]: session.id },
    sessions: [session, ...workspace.sessions],
  }
}

export function deleteSession(workspace: AIWorkspaceState, sessionId: string): AIWorkspaceState {
  const session = workspace.sessions.find(item => item.id === sessionId)
  if (!session) return workspace
  const remaining = workspace.sessions.filter(item => item.id !== sessionId)
  const replacement = remaining.find(item => item.projectId === session.projectId) || {
    id: createId('session'),
    projectId: session.projectId,
    title: '新会话',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    skillIds: ['knowledge'],
    provider: 'web',
    messages: [],
  }
  const sessions = remaining.some(item => item.id === replacement.id) ? remaining : [replacement, ...remaining]
  return {
    ...workspace,
    activeSessionIdByProject: {
      ...workspace.activeSessionIdByProject,
      [session.projectId]: replacement.id,
    },
    sessions,
  }
}

export function deleteProject(workspace: AIWorkspaceState, projectId: string): AIWorkspaceState {
  if (workspace.projects.length <= 1) return workspace
  const remainingProjects = workspace.projects.filter(project => project.id !== projectId)
  const nextProject = remainingProjects[0]
  const sessions = workspace.sessions.filter(session => session.projectId !== projectId)
  const nextSession = sessions.find(session => session.projectId === nextProject.id) || createSession(
    { ...workspace, sessions, projects: remainingProjects },
    nextProject.id,
  ).sessions[0]
  return {
    ...workspace,
    activeProjectId: workspace.activeProjectId === projectId ? nextProject.id : workspace.activeProjectId,
    activeSessionIdByProject: {
      ...workspace.activeSessionIdByProject,
      [nextProject.id]: nextSession.id,
    },
    projects: remainingProjects,
    sessions: sessions.some(session => session.id === nextSession.id) ? sessions : [nextSession, ...sessions],
  }
}
