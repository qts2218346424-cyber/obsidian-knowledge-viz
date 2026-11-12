import * as authService from '../services/auth'
import { useAuth } from '../contexts/AuthContext'
import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  X,
  ChevronDown,
  Sparkles,
  RefreshCw,
  FolderPlus,
  ArrowUp,
} from 'lucide-react'
import {
  api,
  type FileDetail,
  type LocalAgentStatus,
  type LocalSkill,
  type AppSettings,
  type CloudEndpoint,
} from '../services/api'
import {
  loadWorkspace,
  saveWorkspace,
  createProject,
  DEFAULT_PROJECT_ID,
} from '../services/ai-workspace'
import { useVaultTree } from '../hooks/useVaultData'
import { STUDY_AGENTS, type StudyAgent } from '../data/studyAgents'
import { type StudySkill } from '../data/studySkills'
import { extractFollowUpPrompts, getRandomPromptsForAgent } from '../data/studyPrompts'
import ChatMessageItem from '../components/chat/ChatMessageItem'
import { NoteCompanionPanel } from '../components/chat/NoteCompanionPanel'
import ChatStudioHeader, {
  PROVIDER_PRESET_MODELS,
  type ProviderType,
  type ChatWidthMode,
  type ChatFontSize,
} from '../components/chat/ChatStudioHeader'
import ChatComposerDock from '../components/chat/ChatComposerDock'
import ChatMobileConfigSheet from '../components/chat/ChatMobileConfigSheet'
import ChatSessionSidebar from '../components/chat/ChatSessionSidebar'

const QuickPracticeModal = lazy(() => import('../components/QuickPracticeModal'))
const AIMemoryModal = lazy(() => import('../components/AIMemoryModal'))
const LocalSkillPickerModal = lazy(() => import('../components/LocalSkillPickerModal'))
const ModelManagerModal = lazy(() => import('../components/ModelManagerModal'))
export type StudyTone = 'rigorous' | 'vivid' | 'exam' | 'followup'
const StepTutorModal = lazy(() => import('../components/study/StepTutorModal'))

import type { ToolCallInfo, AgentMessage, AttachedFile, Conversation } from '../features/ai-chat/types'
import { processImageFile, formatFileSize } from '../features/ai-chat/utils'

// 向后兼容：保留原有的类型导出入口
export type { PeerAgentResponse, AttachedFile, AgentMessage } from '../features/ai-chat/types'

function buildWelcomeMessage(agent: StudyAgent, projectName?: string): AgentMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    agentName: agent.name,
    agentIcon: agent.icon,
    content: `你好！我是你的 ${agent.title}「${agent.name}」${agent.icon}。\n\n${agent.description}\n\n💡 **伴学工作台快捷指南**：\n- **当前项目**：${projectName || '当前知识库'}（支持顶栏直切 5 大导师与双师对比）\n- **知识库伴读**：点击右上角「笔记伴读」即可边看讲义原文边提问，自动注入上下文\n- **随堂实战**：任意回答右上角或底部均可一键「复制」、「存笔记」或「考我3道题」！`,
    toolCalls: [],
    timestamp: new Date(),
  }
}


function getUserChatStorageKey(userId?: string): string {
  return userId ? `coreforge_study_conversations_${userId}` : 'coreforge_study_conversations_guest'
}

export default function Chat() {
  const { user, isAdmin } = useAuth()
  // 项目工作区管理状态
  const [workspace, setWorkspace] = useState(() => loadWorkspace())
  const activeProject = useMemo(() => {
    return (
      workspace.projects.find(p => p.id === workspace.activeProjectId) || workspace.projects[0]
    )
  }, [workspace])
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newProjectCwd, setNewProjectCwd] = useState('')

  // 版面宽度模式
  const [chatWidthMode, setChatWidthMode] = useState<ChatWidthMode>(() => {
    return (localStorage.getItem('coreforge_chat_width_mode') as ChatWidthMode) || 'wide'
  })
  const handleSetWidthMode = useCallback((mode: ChatWidthMode) => {
    setChatWidthMode(mode)
    localStorage.setItem('coreforge_chat_width_mode', mode)
  }, [])

  // 字体大小控制
  const [chatFontSize, setChatFontSize] = useState<ChatFontSize>(() => {
    return (localStorage.getItem('coreforge_chat_font_size') as ChatFontSize) || 'base'
  })
  const handleSetFontSize = useCallback((size: ChatFontSize) => {
    setChatFontSize(size)
    localStorage.setItem('coreforge_chat_font_size', size)
  }, [])

  // 沉浸全屏专注阅读模式
  const [isFocusMode, setIsFocusMode] = useState(false)

  // 会话侧边栏宽度拖拽（默认 248px，范围 180px ~ 380px）
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('coreforge_chat_sidebar_width')
      if (saved) return Number(saved)
    } catch {}
    return 248
  })
  const isResizingSidebarRef = useRef(false)

  const handleSidebarResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizingSidebarRef.current = true
    const startX = e.clientX
    const startW = sidebarWidth
    let latestW = startW

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizingSidebarRef.current) return
      latestW = Math.max(160, Math.min(380, startW + (ev.clientX - startX)))
      setSidebarWidth(latestW)
    }

    const handleMouseUp = () => {
      isResizingSidebarRef.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      try {
        localStorage.setItem('coreforge_chat_sidebar_width', String(latestW))
      } catch {}
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // 知识库伴读面板宽度拖拽（默认 320px，范围 240px ~ 560px）
  const [notePanelWidth, setNotePanelWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('coreforge_chat_notepanel_width')
      if (saved) return Number(saved)
    } catch {}
    return 320
  })
  const isResizingNotePanelRef = useRef(false)

  const handleNotePanelResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizingNotePanelRef.current = true
    const startX = e.clientX
    const startW = notePanelWidth
    let latestW = startW

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizingNotePanelRef.current) return
      // 伴读栏在右侧，向左拖变宽
      latestW = Math.max(240, Math.min(560, startW - (ev.clientX - startX)))
      setNotePanelWidth(latestW)
    }

    const handleMouseUp = () => {
      isResizingNotePanelRef.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      try {
        localStorage.setItem('coreforge_chat_notepanel_width', String(latestW))
      } catch {}
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const messageWidthClass = useMemo(() => {
    switch (chatWidthMode) {
      case 'normal':
        return 'max-w-3xl'
      case 'wide':
        return 'max-w-5xl'
      case 'full':
        return 'max-w-none w-full'
    }
  }, [chatWidthMode])

  const fontSizeClass = useMemo(() => {
    switch (chatFontSize) {
      case 'sm':
        return 'text-[11px] sm:text-[11.5px] leading-[1.52]'
      case 'base':
        return 'text-[12px] sm:text-[12.5px] leading-[1.56]'
      case 'lg':
        return 'text-[12.5px] sm:text-[13.5px] leading-[1.6]'
    }
  }, [chatFontSize])

  // 按会话隔离记录运行状态与 AbortController
  const [runningConvs, setRunningConvs] = useState<
    Record<string, { status: string; streaming: boolean }>
  >({})
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const key = getUserChatStorageKey(user?.id)
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => ({
            ...c,
            projectId: c.projectId || DEFAULT_PROJECT_ID,
            createdAt: new Date(c.createdAt || Date.now()),
            messages: (c.messages || []).map((m: any) => ({
              ...m,
              streaming: false,
              timestamp: new Date(m.timestamp || Date.now()),
            })),
          }))
        }
      }
    } catch {}
    return []
  })


  const [activeConvId, setActiveConvId] = useState<string>('')
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)
  const isDirtyRef = useRef(false)

  // 核心：当账号加载或切换时，严格隔离并拉取属于当前账号独享的聊天历史与会话，严禁竞态覆盖
  useEffect(() => {
    let isCancelled = false
    setIsHistoryLoaded(false)
    const key = getUserChatStorageKey(user?.id)

    // 1. 优先读取当前账号本地缓存，实现极致首屏秒开体验
    let localConvs: Conversation[] = []
    try {
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          localConvs = parsed.map((c: any) => ({
            ...c,
            projectId: c.projectId || DEFAULT_PROJECT_ID,
            createdAt: new Date(c.createdAt || Date.now()),
            messages: (c.messages || []).map((m: any) => ({
              ...m,
              streaming: false,
              timestamp: new Date(m.timestamp || Date.now()),
            })),
          }))
        }
      }
    } catch {}

    if (localConvs.length > 0) {
      setConversations(localConvs)
      setActiveConvId(prev => (prev && localConvs.some(c => c.id === prev) ? prev : localConvs[0].id))
    } else {
      setConversations([])
      setActiveConvId('')
    }

    // 2. 从云端 SQLite 强持久化中心精准同步该用户历史（3 秒超时竞速保护，杜绝左侧无限转圈）
    const fetchCloudWithTimeout = Promise.race([
      api.getAiConversations(),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 3000))
    ])

    fetchCloudWithTimeout.then(cloudConvs => {
      if (isCancelled) return
      if (Array.isArray(cloudConvs) && cloudConvs.length > 0) {
        const mapped = cloudConvs.map((c: any) => ({
          ...c,
          projectId: c.projectId || DEFAULT_PROJECT_ID,
          createdAt: new Date(c.createdAt || Date.now()),
          messages: (c.messages || []).map((m: any) => ({
            ...m,
            streaming: false,
            timestamp: new Date(m.timestamp || Date.now()),
          })),
        }))
        setConversations(mapped)
        setActiveConvId(prev => (prev && mapped.some((c: any) => c.id === prev) ? prev : mapped[0].id))
        try {
          localStorage.setItem(key, JSON.stringify(mapped.slice(0, 40)))
        } catch {}
      } else if (localConvs.length > 0 && user?.id) {
        // 云端没有但本地有历史，自动将本地历史回填同步上云
        api.saveAiConversations(localConvs.slice(0, 40)).catch(() => {})
      }
      setIsHistoryLoaded(true)
    }).catch(err => {
      if (isCancelled) return
      // 云端超时或未连接，优雅释放加载状态，直接允许本地会话无阻塞使用
      console.warn('[Chat] 云端对话历史同步超时或离线，已降级载入本地会话:', err)
      setIsHistoryLoaded(true)
    })

    return () => {
      isCancelled = true
    }
  }, [user?.id])

  const [input, setInput] = useState('')
  const [stagedImages, setStagedImages] = useState<string[]>([])
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null)
  const [stagedFiles, setStagedFiles] = useState<AttachedFile[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)

  const handleAddImages = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (list.length === 0) return
    try {
      const base64List = await Promise.all(list.slice(0, 5).map(processImageFile))
      setStagedImages(prev => [...prev, ...base64List].slice(0, 6))
    } catch (err: any) {
      console.error('图片读取失败:', err)
    }
  }, [])


  const handleAddGeneralFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      const imageFiles = fileArray.filter(f => f.type.startsWith('image/'))
      if (imageFiles.length > 0) {
        handleAddImages(imageFiles)
      }

      const nonImageFiles = fileArray.filter(f => !f.type.startsWith('image/'))
      if (nonImageFiles.length === 0) return

      setUploadingFile(true)
      try {
        const processed: AttachedFile[] = []
        for (const file of nonImageFiles.slice(0, 6)) {
          const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
          const isPdfOrDoc =
            ext === '.pdf' || ext === '.docx' || ext === '.pptx' || ext === '.xlsx'

          if (isPdfOrDoc) {
            try {
              const formData = new FormData()
              formData.append('file', file)
              const res = await fetch('/api/ingest/upload', {
                method: 'POST',
                headers: authService.getAuthTokenHeaders(),
                body: formData,
              })
              const data = await res.json()
              if (data.markdownPath) {
                processed.push({
                  name: file.name,
                  size: file.size,
                  ext,
                  content: `【已导入知识库文档: ${data.originalName || file.name}，路径: ${data.markdownPath}】\n\n${data.preview || ''}`,
                })
              } else {
                processed.push({
                  name: file.name,
                  size: file.size,
                  ext,
                  content: `【文档附件: ${file.name}】`,
                })
              }
            } catch {
              processed.push({
                name: file.name,
                size: file.size,
                ext,
                content: `【文档附件: ${file.name}】`,
              })
            }
          } else {
            try {
              const textContent = await file.text()
              processed.push({
                name: file.name,
                size: file.size,
                ext,
                content: textContent,
              })
            } catch {
              processed.push({
                name: file.name,
                size: file.size,
                ext,
                content: `【读取失败: ${file.name}】`,
              })
            }
          }
        }
        setStagedFiles(prev => [...prev, ...processed].slice(0, 8))
      } finally {
        setUploadingFile(false)
      }
    },
    [handleAddImages]
  )

  // Agent & Model Selection state
  const [activeAgent, setActiveAgent] = useState<StudyAgent>(() => STUDY_AGENTS[0])
  const [provider, setProvider] = useState<ProviderType>(() => {
    return (localStorage.getItem('coreforge_active_provider') as ProviderType) || 'antigravity'
  })
  const [agents, setAgents] = useState<LocalAgentStatus[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [customModelInput, setCustomModelInput] = useState('')
  const [isCustomModel, setIsCustomModel] = useState(false)

  // Local Skills & Memory Hub state
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [selectedLocalSkill, setSelectedLocalSkill] = useState<LocalSkill | null>(null)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [showModelManagerModal, setShowModelManagerModal] = useState(false)
  const [syncingModels, setSyncingModels] = useState(false)
  const [modelSyncFeedback, setModelSyncFeedback] = useState<string | null>(null)
  const [webModels, setWebModels] = useState<string[]>([])
  const [cloudEndpoints, setCloudEndpoints] = useState<CloudEndpoint[]>([])
  const [cloudSettings, setCloudSettings] = useState<AppSettings['ai'] | null>(null)

  const [activeSkill, setActiveSkill] = useState<StudySkill | null>(null)
  const [studyTone, setStudyTone] = useState<StudyTone>(() => {
    return (localStorage.getItem('coreforge_study_tone') as StudyTone) || 'rigorous'
  })
  const handleStudyToneChange = useCallback((tone: StudyTone) => {
    setStudyTone(tone)
    localStorage.setItem('coreforge_study_tone', tone)
  }, [])

  // 双智能体协同状态
  const [isDualMode, setIsDualMode] = useState<boolean>(() => {
    return localStorage.getItem('coreforge_dual_agent_mode') === 'true'
  })
  const [peerAgent, setPeerAgent] = useState<StudyAgent>(() => {
    const savedId = localStorage.getItem('coreforge_peer_agent_id')
    return STUDY_AGENTS.find(a => a.id === savedId) || STUDY_AGENTS[1] || STUDY_AGENTS[0]
  })
  const [peerProvider, setPeerProvider] = useState<ProviderType>(() => {
    return (localStorage.getItem('coreforge_peer_provider') as ProviderType) || 'claude-code'
  })
  const [peerModel, setPeerModel] = useState<string>(() => {
    return localStorage.getItem('coreforge_peer_model') || 'deepseek-flash'
  })

  // UI 侧栏与抽屉状态
  const [showFiles, setShowFiles] = useState(false)
  const [showSessions, setShowSessions] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  )
  const [selectedNote, setSelectedNote] = useState<FileDetail | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false)
  const [showAgentPicker, setShowAgentPicker] = useState(false)

  // Quick Practice & Step Tutor Modal state
  const [practiceModalOpen, setPracticeModalOpen] = useState(false)
  const [practiceData, setPracticeData] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  })
  const [stepTutorOpen, setStepTutorOpen] = useState(false)

  // 动态发散提问状态
  const [promptsList, setPromptsList] = useState<string[]>(() => activeAgent.quickPrompts || [])
  const [promptLabel, setPromptLabel] = useState<string>('考点速问:')
  const [promptTopic, setPromptTopic] = useState<string | null>(null)
  const [isRefreshingPrompts, setIsRefreshingPrompts] = useState<boolean>(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false)
  const [showScrollTopBtn, setShowScrollTopBtn] = useState(false)
  const { tree } = useVaultTree()

  const activeConv = useMemo(
    () => conversations.find(c => c.id === activeConvId),
    [conversations, activeConvId]
  )
  const messages = activeConv?.messages || []
  const isCurrentRunning = Boolean(runningConvs[activeConvId]?.streaming)
  const isAnyStreaming = useMemo(() => Object.keys(runningConvs).length > 0, [runningConvs])

  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const threshold = 140
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
    isAtBottomRef.current = isAtBottom
    setShowScrollBottomBtn(!isAtBottom)
    setShowScrollTopBtn(el.scrollTop > 480)
  }, [])

  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }
  }, [])

  const scrollToTop = useCallback(() => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom(false)
    }
  }, [messages.length, messages[messages.length - 1]?.content, scrollToBottom])

  const updateConversation = useCallback(
    (convId: string, updater: (conv: Conversation) => Conversation) => {
      isDirtyRef.current = true
      setConversations(prev => prev.map(c => (c.id === convId ? updater(c) : c)))
    },
    []
  )

  // 刷新发散提问或考点速问
  const handleRefreshPrompts = useCallback(
    (forceRandom = true) => {
      setIsRefreshingPrompts(true)
      setTimeout(() => {
        if (!forceRandom && selectedNote) {
          const noteText = `${selectedNote.title || ''} ${
            selectedNote.content ? selectedNote.content.slice(0, 500) : ''
          }`
          const matched = extractFollowUpPrompts(noteText, activeAgent.domain)
          if (matched && matched.prompts.length > 0) {
            setPromptsList(matched.prompts)
            setPromptLabel('📝 笔记发散:')
            setPromptTopic(matched.topic)
            setIsRefreshingPrompts(false)
            return
          }
        }

        const validMsgs = messages.filter(m => m.id !== 'welcome' && m.content)
        if (!forceRandom && validMsgs.length > 0) {
          const lastUser = [...validMsgs].reverse().find(m => m.role === 'user')
          const lastAss = [...validMsgs].reverse().find(m => m.role === 'assistant')
          const combined = `${lastUser?.content || ''} ${
            lastAss?.content ? lastAss.content.slice(0, 600) : ''
          }`
          const matched = extractFollowUpPrompts(combined, activeAgent.domain)
          if (matched && matched.prompts.length > 0) {
            setPromptsList(matched.prompts)
            setPromptLabel('✨ 深度发散:')
            setPromptTopic(matched.topic)
            setIsRefreshingPrompts(false)
            return
          }
        }

        const randomSet = getRandomPromptsForAgent(activeAgent.id, 4)
        setPromptsList(randomSet)
        setPromptLabel(validMsgs.length > 0 ? '✨ 考点延伸:' : '考点速问:')
        setPromptTopic(null)
        setIsRefreshingPrompts(false)
      }, 120)
    },
    [selectedNote, messages, activeAgent]
  )

  useEffect(() => {
    handleRefreshPrompts(false)
  }, [activeConvId, activeAgent.id, selectedNote?.path])

  // Compute dynamically available models for current provider
  const currentAvailableModels = useMemo(() => {
    if (provider === 'web') {
      if (webModels.length > 0) return webModels
      if (cloudSettings?.models && cloudSettings.models.length > 0) return cloudSettings.models
      if (cloudSettings?.model) return [cloudSettings.model]
      return []
    }
    const active = agents.find(a => a.provider === provider)
    if (active?.models && active.models.length > 0) {
      return active.models
    }
    return PROVIDER_PRESET_MODELS[provider] || []
  }, [agents, provider, webModels, cloudSettings])

  // 扫描模型
  const handleScanModels = useCallback(async () => {
    setSyncingModels(true)
    setModelSyncFeedback(null)
    try {
      if (provider === 'web') {
        const currentSettings = await api.getSettings()
        const eps = currentSettings.ai?.endpoints || []

        if (eps.length > 0) {
          let targetEp =
            eps.find(e => e.id === currentSettings.ai?.activeEndpointId) || eps[0]
          if (selectedModel && selectedModel.includes('::')) {
            const [epId] = selectedModel.split('::')
            const found = eps.find(e => e.id === epId)
            if (found) targetEp = found
          }

          const res = await api.fetchAIModels({
            endpointId: targetEp.id,
            baseURL: targetEp.baseURL,
            apiKey: targetEp.apiKey,
          })
          const fetchedIds = (res.models || []).map(m => m.id)
          if (fetchedIds.length === 0) {
            setModelSyncFeedback(`未从「${targetEp.name}」扫描到可用模型`)
          } else {
            const updatedEndpoints = eps.map(e => {
              if (e.id === targetEp.id) {
                return {
                  ...e,
                  models: fetchedIds,
                  defaultModel:
                    e.defaultModel && fetchedIds.includes(e.defaultModel)
                      ? e.defaultModel
                      : fetchedIds[0],
                }
              }
              return e
            })

            await api.updateSettings({
              ai: {
                ...currentSettings.ai!,
                endpoints: updatedEndpoints,
              },
            })

            setCloudEndpoints(updatedEndpoints)
            const allAggregated: string[] = []
            for (const e of updatedEndpoints) {
              for (const m of e.models) {
                allAggregated.push(`${e.id}::${m}`)
              }
            }
            setWebModels(allAggregated)
            const nextOption = `${targetEp.id}::${fetchedIds[0]}`
            setSelectedModel(nextOption)
            localStorage.setItem('coreforge_model_web', nextOption)
            setModelSyncFeedback(`已从「${targetEp.name}」扫描到 ${fetchedIds.length} 个模型`)
          }
        } else {
          const res = await api.fetchAIModels()
          const fetchedIds = (res.models || []).map(m => m.id)
          if (fetchedIds.length === 0) {
            setModelSyncFeedback('未扫描到云端可用模型')
          } else {
            setWebModels(fetchedIds)
            if (currentSettings.ai) {
              await api.updateSettings({
                ai: {
                  ...currentSettings.ai,
                  models: fetchedIds,
                  model: fetchedIds[0],
                },
              })
            }
            setSelectedModel(fetchedIds[0])
            localStorage.setItem('coreforge_model_web', fetchedIds[0])
            setModelSyncFeedback(`已扫描到 ${fetchedIds.length} 个云端模型`)
          }
        }
      } else {
        const res = await api.syncLocalAgentModels()
        if (res.agents) {
          setAgents(res.agents)
          const active = res.agents.find(a => a.provider === provider)
          if (active?.models && active.models.length > 0) {
            if (!active.models.includes(selectedModel)) {
              setSelectedModel(active.models[0])
              localStorage.setItem(`coreforge_model_${provider}`, active.models[0])
            }
            setModelSyncFeedback(`已探测到 ${active.models.length} 个本机模型`)
          } else {
            setModelSyncFeedback(`未从本机检测到 ${provider} 模型`)
          }
        }
      }
      setTimeout(() => setModelSyncFeedback(null), 4000)
    } catch (err: any) {
      setModelSyncFeedback(`扫描失败: ${err.message}`)
      setTimeout(() => setModelSyncFeedback(null), 4000)
    } finally {
      setSyncingModels(false)
    }
  }, [provider, selectedModel])

  const handleDeleteCurrentModel = useCallback(async () => {
    if (!selectedModel || selectedModel === '__custom__') return
    const displayName = selectedModel.includes('::')
      ? selectedModel.split('::')[1]
      : selectedModel
    if (!window.confirm(`确定要从下拉列表中删除模型「${displayName}」吗？`)) return
    try {
      if (provider === 'web') {
        const currentSettings = await api.getSettings()
        const eps = currentSettings.ai?.endpoints || []

        if (eps.length > 0 && selectedModel.includes('::')) {
          const [epId, mName] = selectedModel.split('::')
          const updatedEndpoints = eps.map(e => {
            if (e.id === epId) {
              const nextM = (e.models || []).filter(m => m !== mName)
              return {
                ...e,
                models: nextM,
                defaultModel: e.defaultModel === mName ? nextM[0] || '' : e.defaultModel,
              }
            }
            return e
          })

          await api.updateSettings({
            ai: {
              ...currentSettings.ai!,
              endpoints: updatedEndpoints,
            },
          })
          setCloudEndpoints(updatedEndpoints)
          const allAggregated: string[] = []
          for (const e of updatedEndpoints) {
            for (const m of e.models) {
              allAggregated.push(`${e.id}::${m}`)
            }
          }
          setWebModels(allAggregated)
          setSelectedModel(allAggregated[0] || '')
          localStorage.setItem('coreforge_model_web', allAggregated[0] || '')
          setModelSyncFeedback(`已删除模型 ${mName}`)
        } else {
          const next = webModels.filter(m => m !== selectedModel)
          setWebModels(next)
          if (currentSettings.ai) {
            await api.updateSettings({
              ai: {
                ...currentSettings.ai,
                models: next,
                model: next[0] || '',
              },
            })
          }
          setSelectedModel(next[0] || '')
          localStorage.setItem('coreforge_model_web', next[0] || '')
          setModelSyncFeedback(`已删除模型 ${displayName}`)
        }
        setTimeout(() => setModelSyncFeedback(null), 3000)
        return
      }

      const res = await api.deleteLocalModel(selectedModel)
      if (res.success && res.agents) {
        setAgents(res.agents)
        const active = res.agents.find(a => a.provider === provider)
        if (active?.models && active.models.length > 0) {
          setSelectedModel(active.models[0])
          localStorage.setItem(`coreforge_model_${provider}`, active.models[0])
        } else {
          setSelectedModel('')
        }
        setModelSyncFeedback(`已删除模型 ${selectedModel}`)
        setTimeout(() => setModelSyncFeedback(null), 3000)
      }
    } catch (err: any) {
      alert(`删除模型失败: ${err.message}`)
    }
  }, [provider, selectedModel, webModels])

  const handleWebModelsUpdated = useCallback(
    async (updated: string[]) => {
      setWebModels(updated)
      try {
        const currentSettings = await api.getSettings()
        if (currentSettings.ai) {
          await api.updateSettings({
            ai: {
              ...currentSettings.ai,
              models: updated,
              model: updated.includes(selectedModel) ? selectedModel : updated[0] || '',
            },
          })
        }
      } catch {}
      if (!updated.includes(selectedModel)) {
        setSelectedModel(updated[0] || '')
        localStorage.setItem('coreforge_model_web', updated[0] || '')
      }
    },
    [selectedModel]
  )

  const fetchAgentStatus = useCallback(async () => {
    try {
      const data = await api.getLocalAgentStatus()
      setAgents(data.agents)

      let cloudModList: string[] = []
      let cloudDefault = ''
      try {
        const s = await api.getSettings()
        setCloudSettings(s.ai || null)
        if (s.ai?.endpoints && s.ai.endpoints.length > 0) {
          setCloudEndpoints(s.ai.endpoints)
          for (const ep of s.ai.endpoints) {
            const epModels = ep.models || (ep.defaultModel ? [ep.defaultModel] : [])
            for (const m of epModels) {
              cloudModList.push(`${ep.id}::${m}`)
            }
          }
          const activeEp =
            s.ai.endpoints.find(e => e.id === s.ai?.activeEndpointId) || s.ai.endpoints[0]
          cloudDefault = activeEp
            ? activeEp.defaultModel
              ? `${activeEp.id}::${activeEp.defaultModel}`
              : activeEp.models?.[0]
              ? `${activeEp.id}::${activeEp.models[0]}`
              : ''
            : ''
        } else {
          cloudDefault = s.ai?.model || ''
          cloudModList =
            s.ai?.models && s.ai.models.length > 0
              ? s.ai.models
              : s.ai?.model
              ? [s.ai.model]
              : []
        }
        if (cloudModList.length > 0) {
          setWebModels(cloudModList)
        }
      } catch {}

      setSelectedModel(prev => {
        const curProv =
          (localStorage.getItem('coreforge_active_provider') as ProviderType) ||
          provider ||
          'antigravity'
        const saved = localStorage.getItem(`coreforge_model_${curProv}`)
        const activeObj = data.agents?.find(a => a.provider === curProv)
        const available = activeObj?.models && activeObj.models.length > 0
          ? activeObj.models
          : PROVIDER_PRESET_MODELS[curProv] || []

        if (prev && available.includes(prev)) return prev
        if (saved && available.includes(saved)) return saved
        if (curProv === 'web') return cloudDefault || cloudModList[0] || 'deepseek-flash'

        const fallback =
          available[0] ||
          'gemini-3.8-flash'
        if (fallback) {
          localStorage.setItem(`coreforge_model_${curProv}`, fallback)
        }
        return fallback
      })
    } catch {}
  }, [provider])

  useEffect(() => {
    fetchAgentStatus()
  }, [fetchAgentStatus])

  const handleProviderChange = useCallback(
    (newProv: ProviderType) => {
      setProvider(newProv)
      localStorage.setItem('coreforge_active_provider', newProv)
      const savedModel = localStorage.getItem(`coreforge_model_${newProv}`)
      let available: string[] = []
      if (newProv === 'web') {
        available =
          webModels.length > 0
            ? webModels
            : cloudSettings?.models && cloudSettings.models.length > 0
            ? cloudSettings.models
            : cloudSettings?.model
            ? [cloudSettings.model]
            : []
      } else {
        const activeObj = agents.find(a => a.provider === newProv)
        available =
          activeObj?.models && activeObj.models.length > 0
            ? activeObj.models
            : PROVIDER_PRESET_MODELS[newProv]
      }

      let finalModel = ''
      if (savedModel && available.includes(savedModel)) {
        finalModel = savedModel
        setSelectedModel(savedModel)
        setIsCustomModel(false)
      } else {
        finalModel =
          newProv === 'web'
            ? available[0] || cloudSettings?.model || ''
            : available[0] || ''
        setSelectedModel(finalModel)
        setIsCustomModel(false)
        if (finalModel) {
          localStorage.setItem(`coreforge_model_${newProv}`, finalModel)
        }
      }

      if (activeConvId) {
        updateConversation(activeConvId, conv => ({
          ...conv,
          provider: newProv,
          model: finalModel,
        }))
      }
    },
    [webModels, cloudSettings, agents, activeConvId, updateConversation]
  )

  const handleModelSelect = useCallback(
    (model: string) => {
      if (model === '__custom__') {
        setIsCustomModel(true)
        setSelectedModel(customModelInput || '')
      } else {
        setIsCustomModel(false)
        setSelectedModel(model)
        localStorage.setItem(`coreforge_model_${provider}`, model)
        if (activeConvId) {
          updateConversation(activeConvId, conv => ({
            ...conv,
            model,
          }))
        }
      }
    },
    [customModelInput, provider, activeConvId, updateConversation]
  )

  const handleCustomModelConfirm = useCallback(() => {
    if (customModelInput.trim()) {
      const val = customModelInput.trim()
      setSelectedModel(val)
      localStorage.setItem(`coreforge_model_${provider}`, val)
      if (activeConvId) {
        updateConversation(activeConvId, conv => ({
          ...conv,
          model: val,
        }))
      }
    }
  }, [customModelInput, provider, activeConvId, updateConversation])

  // 智能切换导师：若当前对话为空（仅欢迎语），原地更新欢迎语和导师；若已有历史提问，直接切换当值导师，绝不乱建空白垃圾对话！
  const handleSelectAgent = useCallback(
    (agent: StudyAgent) => {
      setActiveAgent(agent)
      if (!activeConvId) return
      updateConversation(activeConvId, conv => {
        const hasUserMessages = conv.messages.some(m => m.role === 'user')
        if (!hasUserMessages) {
          return {
            ...conv,
            title: `${agent.name} 专属伴学`,
            agentId: agent.id,
            messages: [buildWelcomeMessage(agent, activeProject?.name)],
          }
        }
        return {
          ...conv,
          agentId: agent.id,
        }
      })
    },
    [activeConvId, activeProject?.name, updateConversation]
  )

  const handleSelectConversation = useCallback(
    (convId: string) => {
      setActiveConvId(convId)
      const target = conversations.find(c => c.id === convId)
      if (target) {
        if (target.provider) {
          setProvider(target.provider)
          localStorage.setItem('coreforge_active_provider', target.provider)
        }
        if (target.model) {
          setSelectedModel(target.model)
          if (target.provider) {
            localStorage.setItem(`coreforge_model_${target.provider}`, target.model)
          }
        }
        if (target.agentId) {
          const matched = STUDY_AGENTS.find(a => a.id === target.agentId)
          if (matched) setActiveAgent(matched)
        }
      }
    },
    [conversations]
  )

  const projectConversations = useMemo(() => {
    const currentProjId = activeProject?.id || DEFAULT_PROJECT_ID
    return conversations.filter(c => (c.projectId || DEFAULT_PROJECT_ID) === currentProjId)
  }, [conversations, activeProject])

  const handleSelectProject = useCallback(
    (projectId: string) => {
      setWorkspace(prev => {
        const next = { ...prev, activeProjectId: projectId }
        saveWorkspace(next)
        return next
      })
      const matched = conversations.filter(
        c => (c.projectId || DEFAULT_PROJECT_ID) === projectId
      )
      if (matched.length > 0) {
        handleSelectConversation(matched[0].id)
      } else {
        const newId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `conv-${Date.now()}`
        const p = workspace.projects.find(x => x.id === projectId)
        const newConv: Conversation = {
          id: newId,
          projectId,
          title: `${p?.name || '新项目'} 专属对话`,
          provider,
          model: selectedModel,
          agentId: activeAgent.id,
          messages: [buildWelcomeMessage(activeAgent, p?.name)],
          createdAt: new Date(),
        }
        setConversations(prev => [newConv, ...prev])
        setActiveConvId(newId)
      }
    },
    [
      conversations,
      handleSelectConversation,
      activeAgent,
      provider,
      selectedModel,
      workspace.projects,
    ]
  )

  const handleCreateProjectSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!newProjectName.trim()) return
      const nextWs = createProject(
        workspace,
        newProjectName.trim(),
        newProjectDesc.trim(),
        newProjectCwd.trim()
      )
      setWorkspace(nextWs)
      saveWorkspace(nextWs)
      setNewProjectName('')
      setNewProjectDesc('')
      setNewProjectCwd('')
      setShowProjectModal(false)
      handleSelectProject(nextWs.activeProjectId)
    },
    [workspace, newProjectName, newProjectDesc, newProjectCwd, handleSelectProject]
  )

  const handleUpdateProjectDesc = useCallback(
    (newDesc: string) => {
      setWorkspace(prev => {
        const nextProjects = prev.projects.map(p =>
          p.id === (activeProject?.id || DEFAULT_PROJECT_ID)
            ? { ...p, description: newDesc }
            : p
        )
        const nextWs = { ...prev, projects: nextProjects }
        saveWorkspace(nextWs)
        return nextWs
      })
    },
    [activeProject?.id]
  )

  const handleStopConversation = useCallback((convIdToStop: string) => {
    const ctrl = abortControllersRef.current.get(convIdToStop)
    if (ctrl) {
      ctrl.abort()
      abortControllersRef.current.delete(convIdToStop)
    }
    setRunningConvs(prev => {
      const next = { ...prev }
      delete next[convIdToStop]
      return next
    })
    setConversations(prev =>
      prev.map(c =>
        c.id === convIdToStop
          ? {
              ...c,
              messages: c.messages.map(m =>
                m.streaming
                  ? {
                      ...m,
                      streaming: false,
                      peerResponse: m.peerResponse
                        ? { ...m.peerResponse, streaming: false }
                        : undefined,
                    }
                  : m
              ),
            }
          : c
      )
    )
  }, [])

  const createConversation = useCallback(
    (
      initialAgent = activeAgent,
      initProvider = provider,
      initModel = selectedModel
    ) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `conv-${Date.now()}`
      const currentProjId = activeProject?.id || DEFAULT_PROJECT_ID
      const newConv: Conversation = {
        id,
        projectId: currentProjId,
        title: `${initialAgent.name} 专属伴学`,
        provider: initProvider,
        model: initModel,
        agentId: initialAgent.id,
        messages: [buildWelcomeMessage(initialAgent, activeProject?.name)],
        createdAt: new Date(),
      }
      isDirtyRef.current = true
      setConversations(prev => [newConv, ...prev])
      setActiveConvId(id)
    },
    [activeAgent, provider, selectedModel, activeProject]
  )

  // 核心性能与可靠性：仅在云端历史加载完毕且无流式生成时防抖持久化，坚决防止覆盖历史
  useEffect(() => {
    if (!isHistoryLoaded || isAnyStreaming) return
    const timer = setTimeout(() => {
      const key = getUserChatStorageKey(user?.id)
      try {
        localStorage.setItem(
          key,
          JSON.stringify(conversations.slice(0, 40))
        )
      } catch {
        try {
          localStorage.setItem(
            key,
            JSON.stringify(conversations.slice(0, 12))
          )
        } catch {}
      }
      // 异步同步到云端沙箱与 SQLite 数据库 (仅在有本地改动时才同步上云，防止挂载时空写触发刷新)
      if (user?.id && conversations.length > 0 && isDirtyRef.current) {
        api.saveAiConversations(conversations.slice(0, 40))
          .then(() => {
            isDirtyRef.current = false
          })
          .catch(() => {})
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [conversations, isAnyStreaming, user?.id, isHistoryLoaded])

  useEffect(() => {
    // 必须等待云端历史同步完成后，再决定是否新建默认空会话，杜绝竞态覆盖已存在的历史记录
    if (!isHistoryLoaded) return
    const prefilled = sessionStorage.getItem('prefilled_chat_prompt')
    if (prefilled) {
      sessionStorage.removeItem('prefilled_chat_prompt')
      setInput(prefilled)
      if (conversations.length === 0) {
        createConversation()
      }
    } else if (conversations.length === 0) {
      createConversation()
    }
  }, [conversations.length, createConversation, isHistoryLoaded])

  const deleteConversation = useCallback(
    (convId: string) => {
      handleStopConversation(convId)
      isDirtyRef.current = true
      api.deleteAiConversation(convId).catch(() => {})
      setConversations(prev => {
        const next = prev.filter(c => c.id !== convId)
        if (activeConvId === convId && next.length > 0) {
          setActiveConvId(next[0].id)
        } else if (next.length === 0) {
          setActiveConvId('')
        }
        return next
      })
    },
    [activeConvId, handleStopConversation]
  )

  // 核心性能优化 2：基于 requestAnimationFrame 的流式增量帧合并与笔记伴读上下文自动注入
  const handleSend = useCallback(
    async (overridePrompt?: string, forceInterrupt = false) => {
      const rawText = (overridePrompt ?? input).trim()
      const convId = activeConvId
      const currentImages = [...stagedImages]
      const currentFiles = [...stagedFiles]
      const hasNoteContext = Boolean(selectedNote)

      if (
        !rawText &&
        !hasNoteContext &&
        currentImages.length === 0 &&
        currentFiles.length === 0
      ) {
        return
      }
      if (!convId) return

      if (runningConvs[convId]?.streaming) {
        if (forceInterrupt) {
          handleStopConversation(convId)
        } else {
          return
        }
      }

      // 展示在用户气泡里的干净问题文本
      const displayUserText =
        rawText ||
        (selectedNote
          ? `请结合伴读笔记《${selectedNote.title || selectedNote.path}》为我深度精讲核心考点与统考命题陷阱。`
          : '请分析附加内容')

      // 构造发送给后端的完整上下文 Prompt（自动附带伴读笔记内容，不污染用户输入框）
      let fullPromptText = displayUserText
      if (selectedNote) {
        const noteContextBlock = `【当前伴读知识库笔记：《${selectedNote.title || selectedNote.path}》 (路径: ${selectedNote.path})】\n\`\`\`markdown\n${selectedNote.content.slice(0, 6000)}\n\`\`\``
        fullPromptText = `${noteContextBlock}\n\n【用户提问】：${displayUserText}`
      }
      if (currentFiles.length > 0) {
        const fileExcerpts = currentFiles
          .map(f => {
            const lang = f.ext?.replace('.', '') || 'text'
            return `【附件文件: ${f.name} (${formatFileSize(f.size)})】\n\`\`\`${lang}\n${f.content.slice(0, 16000)}\n\`\`\``
          })
          .join('\n\n')
        fullPromptText = `${fileExcerpts}\n\n${fullPromptText}`
      }

      isAtBottomRef.current = true
      setShowScrollBottomBtn(false)
      setTimeout(() => scrollToBottom(true), 40)

      const userMsg: AgentMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: displayUserText,
        images: currentImages.length > 0 ? currentImages : undefined,
        files: currentFiles.length > 0 ? currentFiles : undefined,
        toolCalls: [],
        timestamp: new Date(),
      }

      const assistantMsgId = `assistant-${Date.now()}`
      const assistantMsg: AgentMessage = {
        id: assistantMsgId,
        role: 'assistant',
        agentName: activeAgent.name,
        agentIcon: activeAgent.icon,
        provider,
        model: selectedModel,
        content: '',
        toolCalls: [],
        timestamp: new Date(),
        streaming: true,
      }

      let defaultTitle = displayUserText.substring(0, 26)
      if (!rawText && currentFiles.length > 0) {
        defaultTitle = `文档: ${currentFiles[0].name.substring(0, 20)}`
      } else if (!rawText && currentImages.length > 0) {
        defaultTitle = '图片研学解析'
      }

      updateConversation(convId, conv => ({
        ...conv,
        messages: [...conv.messages, userMsg, assistantMsg],
        title: conv.messages.length <= 1 ? defaultTitle : conv.title,
      }))

      if (!overridePrompt) setInput('')
      setStagedImages([])
      setStagedFiles([])

      const initStatus = `正在调取【${activeAgent.name}】(${provider}) 进行深度研学推演...`
      setRunningConvs(prev => ({
        ...prev,
        [convId]: { status: initStatus, streaming: true },
      }))

      let accumulatedAssistantText = ''
      const convController = new AbortController()
      abortControllersRef.current.set(convId, convController)

      const intuitiveFormattingRules = `
【排版交付与中文母语习惯黄金准则（强制遵守）】：
1. 全程纯正中文习惯：必须全程使用规范、严谨、通顺的简体中文进行解答与解析推导，严格符合中文母语考生的思维与阅读习惯！除专业英文术语、变量名、英文缩写或代码片段本身外，所有解释、推导过程、设坑剖析与结论必须用纯中文表达，严禁整句英文回答。
2. 结论先行：第一句直接输出核心答案/结论/计算结果，严禁“同学你好/我是XX导师”等客套开场白。
3. 视觉分层：使用 ### 小标题划分模块，概念拆分为带加粗标签的清单项。
4. 对比表格：多方案、多概念异同优先采用 Markdown 表格展示。
5. 考点高亮：易错陷阱使用 > ⚠️ **考场避坑**，速记技巧使用 > 💡 **提分口诀**。`

      let toneInstruction = ''
      if (studyTone === 'followup') {
        toneInstruction = `【作答风格要求】：🎯 针对性靶向追问模式（严格遵守：直击疑问靶心，拒绝笼统套话）！
1. 【拒绝笼统泛谈】：严禁从头背诵整个知识点、大而化之地复述课本宏观概念定义或给出宽泛的概括，杜绝敷衍的客套话。
2. 【靶向精准解惑】：必须精准锁定用户在本次追问中提出的具体疑问点、思维盲区、认知卡壳步骤或对前文推导的具体分歧，直击核心！
3. 【思维偏差诊断】：一针见血剖析“为什么会有这个疑问”、“原理解存在什么偏差或忽略了什么前提/边界条件”，对比正误认知差异。
4. 【微观逐步拆解】：针对该疑问所涉及的细节步骤进行显微镜式的深入剖析与逻辑推演，做到步步有据，条理分明，直击本质。
5. 【针对性小自测】：在解答完该具体疑问后，给出一个极小粒度的针对性微自测问题或推导反思，检验盲点是否真正攻克。
\n${intuitiveFormattingRules}`
      } else if (studyTone === 'rigorous') {
        toneInstruction = `【作答风格要求】：学术严谨模式，考纲对齐，公式推导严谨规范。\n${intuitiveFormattingRules}`
      } else if (studyTone === 'vivid') {
        toneInstruction = `【作答风格要求】：通俗直观模式，多打比方与生动类比。\n${intuitiveFormattingRules}`
      } else {
        toneInstruction = `【作答风格要求】：考场冲刺模式，直击采分点与答题模板。\n${intuitiveFormattingRules}`
      }

      const executeStreamRequest = async (
        tgtProvider: ProviderType,
        tgtModel: string,
        tgtAgent: StudyAgent,
        onFlushDelta: (bufferedDelta: string) => void,
        onStatus?: (st: string) => void,
        onDone?: () => void,
        onErrorMsg?: (err: string) => void
      ) => {
        let pendingDelta = ''
        let rafId: number | null = null

        const flushNow = () => {
          if (rafId !== null) {
            cancelAnimationFrame(rafId)
            rafId = null
          }
          if (pendingDelta) {
            const chunk = pendingDelta
            pendingDelta = ''
            onFlushDelta(chunk)
          }
        }

        const scheduleFlush = (delta: string) => {
          pendingDelta += delta
          if (rafId === null) {
            rafId = requestAnimationFrame(() => {
              rafId = null
              if (pendingDelta) {
                const chunk = pendingDelta
                pendingDelta = ''
                onFlushDelta(chunk)
              }
            })
          }
        }

        let hasReportedStreamError = false
        try {
          const endpoint = '/api/local-agents/chat'
          const skillPrompt = selectedLocalSkill
            ? `【启用本地技能: ${selectedLocalSkill.displayName} (${selectedLocalSkill.name})】\n${selectedLocalSkill.instructions}`
            : activeSkill?.prompt || undefined

          const currentConv = conversations.find(c => c.id === convId)
          const history = (currentConv?.messages || [])
            .filter(
              m =>
                m.content &&
                m.content.trim().length > 0 &&
                (m.role === 'user' || m.role === 'assistant') &&
                m.id !== 'welcome'
            )
            .slice(-16)
            .map(m => ({
              role: m.role,
              content: m.content,
            }))

          const body = {
            provider: tgtProvider,
            prompt: fullPromptText,
            images: currentImages.length > 0 ? currentImages : undefined,
            model: tgtModel || undefined,
            sessionId: convId,
            history,
            mode: studyTone,
            isFollowUp: studyTone === 'followup',
            skillPrompt,
            agentPrompt: `${tgtAgent.systemPrompt}\n${toneInstruction}`,
            projectName: activeProject?.name || '考研 408 & 数学研学工作台',
            projectDescription: activeProject?.description || '',
            cwd: activeProject?.cwd || undefined,
            pageContext: `AI 伴学主页面 (${tgtAgent.name})`,
          }

          let attempt = 0
          const maxAttempts = 2
          let receivedAnyContent = false

          while (attempt < maxAttempts) {
            attempt++
            const attemptController = new AbortController()
            let firstEventTimedOut = false
            let receivedAnyModelEvent = false
            const syncAbort = () => attemptController.abort()
            if (convController.signal.aborted) {
              attemptController.abort()
            } else {
              convController.signal.addEventListener('abort', syncAbort, { once: true })
            }
            const firstEventTimer = window.setTimeout(() => {
              if (!receivedAnyModelEvent) {
                firstEventTimedOut = true
                attemptController.abort()
              }
            }, 30_000)

            try {
              const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  ...authService.getAuthHeaders(),
                },
                body: JSON.stringify(body),
                signal: attemptController.signal,
              })

              if (!res.ok) {
                window.clearTimeout(firstEventTimer)
                if (res.status === 402) {
                  const errData = await res.json().catch(() => ({}))
                  window.dispatchEvent(new CustomEvent('open-checkin-modal'))
                  throw new Error(errData.message || '伴学积分不足（单次对话消耗 0.1 积分），请每日签到领取或联系管理员分配。')
                }
                if (res.status === 413) {
                  throw new Error('上传的图片或附件体积超出限制，已为您进行自动压缩，请重新尝试发送。')
                }
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || errData.message || `服务响应异常: HTTP ${res.status}`)
              }

              const reader = res.body?.getReader()
              if (!reader) {
                window.clearTimeout(firstEventTimer)
                throw new Error('流式传输不可用')
              }

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
                    if (event.type && event.type !== 'points_updated' && !receivedAnyModelEvent) {
                      receivedAnyModelEvent = true
                      window.clearTimeout(firstEventTimer)
                    }
                    if (event.type === 'points_updated' && typeof event.points === 'number') {
                      window.dispatchEvent(new CustomEvent('points-updated', { detail: { points: event.points } }))
                    } else if (event.type === 'text' && event.content) {
                      receivedAnyContent = true
                      scheduleFlush(event.content)
                    } else if (event.type === 'status' && event.content) {
                      onStatus?.(event.content)
                    } else if (event.type === 'tool_call') {
                      onStatus?.(`🔍 正在调用工具「${event.tool}」探索知识库...`)
                    } else if (event.type === 'tool_result') {
                      onStatus?.(`⚡ 工具「${event.tool}」执行完毕，正在组织回答...`)
                    } else if (event.type === 'done') {
                      flushNow()
                      onDone?.()
                    } else if (event.type === 'error') {
                      flushNow()
                      hasReportedStreamError = true
                      onErrorMsg?.(event.content || '智能体执行异常')
                    }
                  } catch {}
                }
              }
              break
            } catch (retryErr: any) {
              if (firstEventTimedOut) {
                hasReportedStreamError = true
                onErrorMsg?.('响应超时')
                break
              }
              const isNetworkErr =
                retryErr?.name !== 'AbortError' &&
                !hasReportedStreamError &&
                !receivedAnyContent &&
                (retryErr?.message?.includes('Failed to fetch') ||
                  retryErr?.message?.includes('NetworkError') ||
                  /network error/i.test(retryErr?.message || '') ||
                  retryErr?.message?.includes('流式传输不可用'))
              if (attempt < maxAttempts && isNetworkErr && !convController.signal.aborted) {
                onStatus?.('⚡ 网络连接短暂波动，正在自动重连...')
                await new Promise(r => setTimeout(r, 800))
                continue
              }
              throw retryErr
            } finally {
              window.clearTimeout(firstEventTimer)
              convController.signal.removeEventListener('abort', syncAbort)
            }
          }
          flushNow()
          onDone?.()
        } catch (err: any) {
          flushNow()
          if (err.name !== 'AbortError' && !hasReportedStreamError) {
            let msg = err?.message || '网络连接异常'
            if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || /network error/i.test(msg) || msg.includes('fetch')) {
              msg = '服务响应中断或网络连接异常，建议检查网络状态后点击重新生成。'
            }
            onErrorMsg?.(msg)
          }
        }
      }

      const applyDynamicFollowups = (inputText: string, responseText: string) => {
        const combined = `${inputText} ${responseText}`
        const matched = extractFollowUpPrompts(combined, activeAgent.domain)
        if (matched && matched.prompts.length > 0) {
          setPromptsList(matched.prompts)
          setPromptLabel('✨ 深度发散:')
          setPromptTopic(matched.topic)
        } else {
          const fallbackSet = getRandomPromptsForAgent(activeAgent.id, 4)
          setPromptsList(fallbackSet)
          setPromptLabel('✨ 考点延伸:')
          setPromptTopic(null)
        }

        fetch('/api/local-agents/generate-followups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: inputText,
            lastResponse: responseText.slice(0, 800),
            noteTitle: selectedNote?.title,
          }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.success && Array.isArray(data.followups) && data.followups.length >= 2) {
              setPromptsList(data.followups)
              setPromptLabel('✨ 深度发散:')
              setPromptTopic('AI 定向')
            }
          })
          .catch(() => {})
      }

      if (isDualMode) {
        const pModel =
          peerModel ||
          (peerProvider === 'codex'
            ? 'gpt-6-luna'
            : peerProvider === 'claude-code'
            ? 'deepseek-flash'
            : 'deepseek-chat')
        const dualAssistantMsg: AgentMessage = {
          id: assistantMsgId,
          role: 'assistant',
          agentName: activeAgent.name,
          agentIcon: activeAgent.icon,
          provider,
          model: selectedModel,
          content: '',
          toolCalls: [],
          timestamp: new Date(),
          streaming: true,
          isDual: true,
          peerResponse: {
            agentName: peerAgent.name,
            agentIcon: peerAgent.icon,
            provider: peerProvider,
            model: pModel,
            content: '',
            streaming: true,
          },
        }

        updateConversation(convId, conv => ({
          ...conv,
          messages: [
            ...conv.messages.filter(m => m.id !== assistantMsgId),
            dualAssistantMsg,
          ],
          title: conv.messages.length <= 1 ? defaultTitle : conv.title,
        }))

        setRunningConvs(prev => ({
          ...prev,
          [convId]: {
            status: `👥 双师「${activeAgent.name}」与「${peerAgent.name}」正在协同研讨中...`,
            streaming: true,
          },
        }))

        try {
          const primaryTask = executeStreamRequest(
            provider,
            selectedModel,
            activeAgent,
            delta => {
              accumulatedAssistantText += delta
              updateConversation(convId, conv => {
                const msgs = [...conv.messages]
                const idx = msgs.findIndex(m => m.id === assistantMsgId)
                if (idx === -1) return conv
                msgs[idx] = { ...msgs[idx], content: msgs[idx].content + delta }
                return { ...conv, messages: msgs }
              })
            },
            st => {
              setRunningConvs(prev =>
                prev[convId]
                  ? {
                      ...prev,
                      [convId]: { ...prev[convId], status: `【${activeAgent.name}】${st}` },
                    }
                  : prev
              )
            },
            () => {
              updateConversation(convId, conv => {
                const msgs = [...conv.messages]
                const idx = msgs.findIndex(m => m.id === assistantMsgId)
                if (idx === -1) return conv
                msgs[idx] = { ...msgs[idx], streaming: false }
                return { ...conv, messages: msgs }
              })
            },
            err => {
              updateConversation(convId, conv => {
                const msgs = [...conv.messages]
                const idx = msgs.findIndex(m => m.id === assistantMsgId)
                if (idx === -1) return conv
                msgs[idx] = {
                  ...msgs[idx],
                  content: msgs[idx].content + `\n\n❌ **异常**: ${err}`,
                  streaming: false,
                }
                return { ...conv, messages: msgs }
              })
            }
          )

          const peerTask = executeStreamRequest(
            peerProvider,
            pModel,
            peerAgent,
            delta => {
              updateConversation(convId, conv => {
                const msgs = [...conv.messages]
                const idx = msgs.findIndex(m => m.id === assistantMsgId)
                if (idx === -1 || !msgs[idx].peerResponse) return conv
                const prev = msgs[idx].peerResponse!
                msgs[idx] = {
                  ...msgs[idx],
                  peerResponse: { ...prev, content: prev.content + delta },
                }
                return { ...conv, messages: msgs }
              })
            },
            st => {
              setRunningConvs(prev =>
                prev[convId]
                  ? {
                      ...prev,
                      [convId]: { ...prev[convId], status: `【${peerAgent.name}】${st}` },
                    }
                  : prev
              )
            },
            () => {
              updateConversation(convId, conv => {
                const msgs = [...conv.messages]
                const idx = msgs.findIndex(m => m.id === assistantMsgId)
                if (idx === -1 || !msgs[idx].peerResponse) return conv
                msgs[idx] = {
                  ...msgs[idx],
                  peerResponse: { ...msgs[idx].peerResponse!, streaming: false },
                }
                return { ...conv, messages: msgs }
              })
            },
            err => {
              updateConversation(convId, conv => {
                const msgs = [...conv.messages]
                const idx = msgs.findIndex(m => m.id === assistantMsgId)
                if (idx === -1 || !msgs[idx].peerResponse) return conv
                const prev = msgs[idx].peerResponse!
                msgs[idx] = {
                  ...msgs[idx],
                  peerResponse: {
                    ...prev,
                    content: prev.content + `\n\n❌ **异常**: ${err}`,
                    streaming: false,
                  },
                }
                return { ...conv, messages: msgs }
              })
            }
          )

          await Promise.allSettled([primaryTask, peerTask])
        } finally {
          updateConversation(convId, conv => {
            const msgs = [...conv.messages]
            const idx = msgs.findIndex(m => m.id === assistantMsgId)
            if (idx !== -1) {
              msgs[idx] = {
                ...msgs[idx],
                streaming: false,
                peerResponse: msgs[idx].peerResponse
                  ? { ...msgs[idx].peerResponse!, streaming: false }
                  : undefined,
              }
            }
            return { ...conv, messages: msgs }
          })
          abortControllersRef.current.delete(convId)
          setRunningConvs(prev => {
            const next = { ...prev }
            delete next[convId]
            return next
          })
          setActiveSkill(null)
          applyDynamicFollowups(displayUserText, accumulatedAssistantText)
        }
        return
      }

      // 单智能体标准模式
      try {
        await executeStreamRequest(
          provider,
          selectedModel,
          activeAgent,
          delta => {
            accumulatedAssistantText += delta
            updateConversation(convId, conv => {
              const msgs = [...conv.messages]
              const idx = msgs.findIndex(m => m.id === assistantMsgId)
              if (idx === -1) return conv
              msgs[idx] = { ...msgs[idx], content: msgs[idx].content + delta }
              return { ...conv, messages: msgs }
            })
          },
          st => {
            setRunningConvs(prev =>
              prev[convId]
                ? {
                    ...prev,
                    [convId]: { ...prev[convId], status: st },
                  }
                : prev
            )
          },
          () => {
            updateConversation(convId, conv => {
              const msgs = [...conv.messages]
              const idx = msgs.findIndex(m => m.id === assistantMsgId)
              if (idx === -1) return conv
              msgs[idx] = { ...msgs[idx], streaming: false }
              return { ...conv, messages: msgs }
            })
          },
          err => {
            updateConversation(convId, conv => {
              const msgs = [...conv.messages]
              const idx = msgs.findIndex(m => m.id === assistantMsgId)
              if (idx === -1) return conv
              msgs[idx] = {
                ...msgs[idx],
                content: err === '响应超时' ? msgs[idx].content : msgs[idx].content + `\n\n❌ **执行异常**: ${err}`,
                error: err,
                streaming: false,
              }
              return { ...conv, messages: msgs }
            })
          }
        )
      } finally {
        updateConversation(convId, conv => {
          const msgs = [...conv.messages]
          const idx = msgs.findIndex(m => m.id === assistantMsgId)
          if (idx !== -1) {
            const rawContent = msgs[idx].content?.trim() || accumulatedAssistantText.trim()
            const hasError = Boolean(msgs[idx].error)
            msgs[idx] = {
              ...msgs[idx],
              content:
                rawContent ||
                (hasError
                  ? ''
                  : '⚠️ **智能体已完成推演，但模型服务暂未返回文本内容（系统已自动保留您的伴学积分，本次未扣费）。**\n\n> 💡 建议检查网络连接或直接点击重新生成。'),
              streaming: false,
            }
          }
          return { ...conv, messages: msgs }
        })
        abortControllersRef.current.delete(convId)
        setRunningConvs(prev => {
          const next = { ...prev }
          delete next[convId]
          return next
        })
        setActiveSkill(null)
        applyDynamicFollowups(displayUserText, accumulatedAssistantText)
      }
    },
    [
      input,
      activeConvId,
      stagedImages,
      stagedFiles,
      selectedNote,
      runningConvs,
      handleStopConversation,
      scrollToBottom,
      activeAgent,
      provider,
      selectedModel,
      updateConversation,
      studyTone,
      selectedLocalSkill,
      activeSkill,
      conversations,
      activeProject,
      isDualMode,
      peerModel,
      peerProvider,
      peerAgent,
    ]
  )

  const [searchParams, setSearchParams] = useSearchParams()

  // 监听实战引导或外部直达的提问事件
  useEffect(() => {
    const onPrefill = (e: any) => {
      const q = e?.detail?.question
      if (q) {
        setInput(q)
        if (e?.detail?.autoSend) {
          setTimeout(() => {
            handleSend(q)
          }, 350)
        }
      }
    }
    window.addEventListener('chat-prefill-question', onPrefill)
    return () => window.removeEventListener('chat-prefill-question', onPrefill)
  }, [handleSend])

  // 读取 URL query 中的提问内容 (?q=... 或 ?prompt=... &auto=1) 以及 sessionStorage 中的追问缓存
  useEffect(() => {
    let pendingPrompt = ''
    try {
      const sessPrompt = sessionStorage.getItem('pending_chat_prompt') || sessionStorage.getItem('prefilled_chat_prompt')
      if (sessPrompt) {
        pendingPrompt = sessPrompt
        sessionStorage.removeItem('pending_chat_prompt')
        sessionStorage.removeItem('prefilled_chat_prompt')
      }
    } catch {}

    const queryPrompt = searchParams.get('prompt') || searchParams.get('q')
    const modeParam = searchParams.get('mode')
    if (modeParam === 'followup') {
      setStudyTone('followup')
      localStorage.setItem('coreforge_study_tone', 'followup')
    }
    const finalPrompt = pendingPrompt || queryPrompt
    const auto = searchParams.get('auto') === '1' || Boolean(pendingPrompt)

    if (queryPrompt || modeParam) {
      const next = new URLSearchParams(searchParams)
      next.delete('q')
      next.delete('prompt')
      next.delete('auto')
      next.delete('mode')
      setSearchParams(next, { replace: true })
    }

    if (finalPrompt) {
      setInput(finalPrompt)
      if (auto) {
        const timer = setTimeout(() => {
          handleSend(finalPrompt)
        }, 450)
        return () => clearTimeout(timer)
      }
    }
  }, [searchParams, setSearchParams, handleSend])

  // 点击知识库笔记：仅挂载为伴读上下文并预览，绝不污染用户输入框
  const handleNoteClick = useCallback(async (notePath: string) => {
    try {
      const note = await api.getFile(notePath)
      setSelectedNote(note)
      setShowFiles(true)
    } catch {}
  }, [])

  const handleRecallMessage = useCallback(
    (msgId: string) => {
      if (!activeConvId) return
      updateConversation(activeConvId, conv => {
        const idx = conv.messages.findIndex(m => m.id === msgId)
        if (idx === -1) return conv
        const target = conv.messages[idx]
        const nextMsgs =
          target.role === 'user'
            ? conv.messages.slice(0, idx)
            : conv.messages.filter(m => m.id !== msgId)
        return { ...conv, messages: nextMsgs }
      })
    },
    [activeConvId, updateConversation]
  )

  const handleEditMessage = useCallback(
    (msgId: string) => {
      const targetMsg = messages.find(m => m.id === msgId)
      if (!targetMsg) return
      setInput(targetMsg.content)
      handleRecallMessage(msgId)
    },
    [messages, handleRecallMessage]
  )

  const handleDeleteMessage = useCallback(
    (msgId: string) => {
      if (!activeConvId) return
      updateConversation(activeConvId, conv => ({
        ...conv,
        messages: conv.messages.filter(m => m.id !== msgId),
      }))
    },
    [activeConvId, updateConversation]
  )

  const handleRegenerate = useCallback(
    (assistantMsgId: string) => {
      if (!activeConvId || isCurrentRunning) return
      const conv = conversations.find(c => c.id === activeConvId)
      if (!conv) return
      const idx = conv.messages.findIndex(m => m.id === assistantMsgId)
      if (idx === -1) return
      const prevUserMsg = [...conv.messages.slice(0, idx)]
        .reverse()
        .find(m => m.role === 'user')
      if (!prevUserMsg) return

      updateConversation(activeConvId, c => ({
        ...c,
        messages: c.messages.slice(0, idx),
      }))

      setTimeout(() => {
        handleSend(prevUserMsg.content)
      }, 80)
    },
    [activeConvId, isCurrentRunning, conversations, updateConversation, handleSend]
  )

  // 断点续写（同样采用 rAF 帧合并）
  const handleContinue = useCallback(
    async (assistantMsgId: string) => {
      if (!activeConvId || isCurrentRunning) return
      const conv = conversations.find(c => c.id === activeConvId)
      if (!conv) return
      const targetMsg = conv.messages.find(m => m.id === assistantMsgId)
      if (!targetMsg) return

      const continuePrompt = `【用户指令：请继续往下写】\n你上一段回答在末尾处暂停了，请紧密承接上一段末尾断点继续往下写，不要重复上文已经说过的内容，直接继续输出后续内容、推导或代码：`

      updateConversation(activeConvId, c => ({
        ...c,
        messages: c.messages.map(m =>
          m.id === assistantMsgId ? { ...m, streaming: true } : m
        ),
      }))

      const convId = activeConvId
      const initStatus = `正在让【${activeAgent.name}】(${provider}) 接续未完内容...`
      setRunningConvs(prev => ({
        ...prev,
        [convId]: { status: initStatus, streaming: true },
      }))

      const convController = new AbortController()
      abortControllersRef.current.set(convId, convController)

      let pendingDelta = ''
      let rafId: number | null = null
      const flushDelta = () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
          rafId = null
        }
        if (pendingDelta) {
          const chunk = pendingDelta
          pendingDelta = ''
          updateConversation(convId, c => ({
            ...c,
            messages: c.messages.map(m =>
              m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m
            ),
          }))
        }
      }

      try {
        const history = (conv.messages || [])
          .filter(m => m.content && m.content.trim().length > 0 && m.id !== 'welcome')
          .slice(-16)
          .map(m => ({ role: m.role, content: m.content }))

        const body = {
          provider,
          prompt: continuePrompt,
          model: selectedModel || undefined,
          sessionId: convId,
          history,
          agentPrompt: `${activeAgent.systemPrompt}\n【续写要求】：请直接承接断点无缝续写，不要客套，不要重复上文。`,
          projectName: activeProject?.name || '考研 408 & 数学研学工作台',
          projectDescription: activeProject?.description || '',
          cwd: activeProject?.cwd || undefined,
          pageContext: `AI 伴学主页面 (${activeAgent.name}) · 继续生成`,
        }

        const res = await fetch('/api/local-agents/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders(),
          },
          body: JSON.stringify(body),
          signal: convController.signal,
        })

        if (!res.ok) {
          if (res.status === 402) {
            const errData = await res.json().catch(() => ({}))
            window.dispatchEvent(new CustomEvent('open-checkin-modal'))
            throw new Error(errData.message || '伴学积分不足（单次对话消耗 0.1 积分），请每日签到领取或联系管理员分配。')
          }
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
                pendingDelta += event.content
                if (rafId === null) {
                  rafId = requestAnimationFrame(() => {
                    rafId = null
                    flushDelta()
                  })
                }
              } else if (event.type === 'status' && event.content) {
                setRunningConvs(prev =>
                  prev[convId]
                    ? {
                        ...prev,
                        [convId]: { ...prev[convId], status: event.content },
                      }
                    : prev
                )
              }
            } catch {}
          }
        }
        flushDelta()
      } catch (err: any) {
        flushDelta()
        if (err.name !== 'AbortError') {
          updateConversation(convId, c => ({
            ...c,
            messages: c.messages.map(m =>
              m.id === assistantMsgId
                ? { ...m, content: m.content + `\n\n❌ **续写异常**: ${err.message}` }
                : m
            ),
          }))
        }
      } finally {
        updateConversation(convId, c => ({
          ...c,
          messages: c.messages.map(m =>
            m.id === assistantMsgId ? { ...m, streaming: false } : m
          ),
        }))
        abortControllersRef.current.delete(convId)
        setRunningConvs(prev => {
          const next = { ...prev }
          delete next[convId]
          return next
        })
      }
    },
    [
      activeConvId,
      isCurrentRunning,
      conversations,
      updateConversation,
      activeAgent,
      provider,
      selectedModel,
      activeProject,
    ]
  )

  const handleSaveMessage = useCallback(
    async (msg: AgentMessage) => {
      if (!msg.content) return
      const firstLine = msg.content
        .split('\n')[0]
        .replace(/^#+\s*/, '')
        .replace(/[<>:"/\\|?*]/g, '_')
        .substring(0, 40)
      const title =
        firstLine || `AI伴学精析_${new Date().toLocaleDateString('zh-CN')}`
      const destPath = `wiki/AI伴学笔记/${title}.md`
      try {
        await api.createFile(destPath, msg.content, {
          title,
          tags: ['ai-study', activeAgent.domain, provider],
          created: new Date().toISOString().split('T')[0],
        })
        alert(`✅ 已成功沉淀为知识库笔记：\n${destPath}`)
      } catch (err: any) {
        alert(`保存失败: ${err.message}`)
      }
    },
    [activeAgent.domain, provider]
  )

  const handleTriggerPracticeFromChat = useCallback(
    (msg: AgentMessage) => {
      setPracticeData({
        title: `${activeAgent.name} · 考点随堂测验`,
        content: msg.content.slice(0, 3000),
      })
      setPracticeModalOpen(true)
    },
    [activeAgent.name]
  )

  const handleCopy = useCallback((id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const handleRemoveStagedImage = useCallback((idx: number) => {
    setStagedImages(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const handleRemoveStagedFile = useCallback((idx: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const visibleMessages = useMemo(
    () => messages.filter(m => m.id !== 'welcome'),
    [messages]
  )
  const isWelcomeState = visibleMessages.length === 0
  const welcomeCards = useMemo(() => {
    const source = promptsList.length >= 4 ? promptsList : activeAgent.quickPrompts || []
    return source.slice(0, 4)
  }, [promptsList, activeAgent.quickPrompts])

  return (
    <div className="h-full max-h-full flex flex-col gap-0 sm:gap-2.5 overflow-hidden min-h-0">
      {/* 1. 一体化高颜值灵动工作台顶栏 (Unified Studio Header) */}
      <ChatStudioHeader
        activeAgent={activeAgent}
        onSelectAgent={handleSelectAgent}
        onCreateNewConversation={() => createConversation(activeAgent)}
        showSessions={showSessions}
        onToggleSessions={() => setShowSessions(prev => !prev)}
        conversationsCount={projectConversations.length}
        showFiles={showFiles}
        onToggleFiles={() => setShowFiles(prev => !prev)}
        selectedNote={selectedNote}
        provider={provider}
        onProviderChange={handleProviderChange}
        agents={agents}
        selectedModel={selectedModel}
        isCustomModel={isCustomModel}
        customModelInput={customModelInput}
        onCustomModelInputChange={setCustomModelInput}
        onCustomModelConfirm={handleCustomModelConfirm}
        onModelSelect={handleModelSelect}
        onDeleteCurrentModel={handleDeleteCurrentModel}
        currentAvailableModels={currentAvailableModels}
        cloudEndpoints={cloudEndpoints}
        webModels={webModels}
        syncingModels={syncingModels}
        modelSyncFeedback={modelSyncFeedback}
        onScanModels={handleScanModels}
        onOpenModelManager={() => setShowModelManagerModal(true)}
        studyTone={studyTone}
        onStudyToneChange={handleStudyToneChange}
        isDualMode={isDualMode}
        onToggleDualMode={() => {
          const next = !isDualMode
          setIsDualMode(next)
          localStorage.setItem('coreforge_dual_agent_mode', String(next))
        }}
        peerAgent={peerAgent}
        onPeerAgentChange={agent => {
          setPeerAgent(agent)
          localStorage.setItem('coreforge_peer_agent_id', agent.id)
        }}
        peerProvider={peerProvider}
        onPeerProviderChange={p => {
          setPeerProvider(p)
          localStorage.setItem('coreforge_peer_provider', p)
          const pPreset =
            p === 'codex'
              ? 'gpt-6-luna'
              : p === 'claude-code'
              ? 'deepseek-flash'
              : 'deepseek-chat'
          setPeerModel(pPreset)
          localStorage.setItem('coreforge_peer_model', pPreset)
        }}
        peerModel={peerModel}
        onPeerModelChange={m => {
          setPeerModel(m)
          localStorage.setItem('coreforge_peer_model', m)
        }}
        activeSkill={activeSkill}
        onSelectStudySkill={skill => {
          setActiveSkill(skill)
          setInput(skill.placeholder)
        }}
        selectedLocalSkill={selectedLocalSkill}
        onOpenSkillPicker={() => setShowSkillPicker(true)}
        onOpenMemoryModal={() => setShowMemoryModal(true)}
        chatWidthMode={chatWidthMode}
        onWidthModeChange={handleSetWidthMode}
        chatFontSize={chatFontSize}
        onFontSizeChange={handleSetFontSize}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(prev => !prev)}
        onOpenMobileConfig={() => setMobileConfigOpen(true)}
        onOpenAgentPicker={() => setShowAgentPicker(true)}
      />

      {/* 2. 主体三栏弹性工作区：左侧会话栏 + 中间主伴学流 + 右侧知识库伴读分栏 */}
      <div className="flex-1 flex gap-3 min-h-0 overflow-hidden relative z-0">
        <ChatSessionSidebar
          activeConvId={activeConvId}
          activeProject={activeProject}
          workspace={workspace}
          projectConversations={projectConversations}
          runningConvs={runningConvs}
          isHistoryLoaded={isHistoryLoaded}
          showSessions={showSessions}
          sidebarWidth={sidebarWidth}
          onCreateConversation={() => createConversation(activeAgent)}
          deleteConversation={deleteConversation}
          handleSelectConversation={handleSelectConversation}
          handleSelectProject={handleSelectProject}
          handleStopConversation={handleStopConversation}
          handleSidebarResizeStart={handleSidebarResizeStart}
          setShowProjectModal={setShowProjectModal}
          setShowSessions={setShowSessions}
        />

        {/* 2.2 中间：主伴学对话流 + 一体化智能输入舱 */}
        <div className="flex-1 flex flex-col bg-white sm:border sm:border-neutral-200/80 sm:rounded-xl overflow-hidden min-w-0 shadow-xs complex-panel-contain">
          {/* 消息滚动列表 (手机端内边距紧凑化，释放大屏可视空间) */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="flex-1 overflow-y-auto px-2 sm:px-6 py-2.5 sm:py-6 space-y-3 sm:space-y-5 relative bg-neutral-50/20"
          >
            {isWelcomeState ? (
              <div
                className={`${messageWidthClass} mx-auto w-full min-h-full flex flex-col justify-center py-4 sm:py-8`}
              >
                {/* 清爽通透的居中导师欢迎区 (Clean Studio Hero) */}
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-7 sm:mb-9">
                  <div className="w-14 h-14 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-2xl shadow-2xs mb-3.5">
                    {activeAgent.icon}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-center mb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      你好，我是「{activeAgent.name}」
                    </h2>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${activeAgent.badgeClass}`}
                    >
                      {activeAgent.title}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
                    {activeAgent.description}
                  </p>
                  <div className="flex items-center justify-center flex-wrap gap-2 mt-3.5 text-[11px] text-slate-400">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100/80 text-slate-600">
                      👥 顶栏支持双师同台对比
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100/80 text-slate-600">
                      📖 右上角开启讲义原文伴读
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100/80 text-slate-600">
                      🎯 回答可一键存笔记或现场考 3 题
                    </span>
                  </div>
                </div>

                {/* 舒展无外框嵌套的 2x2 研学切入点卡片 */}
                <div className="w-full max-w-3xl mx-auto space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>推荐高频研学切入点</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRefreshPrompts(true)}
                      disabled={isCurrentRunning || isRefreshingPrompts}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${
                          isRefreshingPrompts ? 'animate-spin text-indigo-600' : ''
                        }`}
                      />
                      <span>换一批</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {welcomeCards.map((promptText, idx) => {
                      const badges = ['⚡ 核心机制', '🎯 高频真题', '🧭 脉络辨析', '💡 秒杀口诀']
                      return (
                        <button
                          key={`${idx}-${promptText.slice(0, 10)}`}
                          type="button"
                          onClick={() => handleSend(promptText)}
                          disabled={isCurrentRunning}
                          className="p-4 text-left rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-900 hover:shadow-xs transition-all flex flex-col gap-1.5 group cursor-pointer"
                        >
                          <span className="text-[11px] font-semibold text-indigo-600/90">
                            {badges[idx % badges.length]}
                          </span>
                          <span className="text-xs sm:text-[13px] font-medium text-slate-700 group-hover:text-slate-950 line-clamp-2 leading-relaxed">
                            {promptText}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              visibleMessages.map((msg, index) => {
                // 仅对距离底部较远的历史消息启用 content-visibility: auto 离屏渲染延迟
                const isDeferred = index < visibleMessages.length - 3
                return (
                  <ChatMessageItem
                    key={msg.id}
                    msg={msg}
                    isDeferred={isDeferred}
                    activeAgent={activeAgent}
                    provider={provider}
                    selectedModel={selectedModel}
                    messageWidthClass={messageWidthClass}
                    fontSizeClass={fontSizeClass}
                    copiedId={copiedId}
                    isCurrentRunning={isCurrentRunning}
                    onCopy={handleCopy}
                    onSaveMessage={handleSaveMessage}
                    onTriggerPractice={handleTriggerPracticeFromChat}
                    onDeleteMessage={handleDeleteMessage}
                    onContinue={handleContinue}
                    onRegenerate={handleRegenerate}
                    onEditMessage={handleEditMessage}
                    onRecallMessage={handleRecallMessage}
                    onPreviewImage={setPreviewImageModal}
                    onSwitchModel={() => setShowModelManagerModal(true)}
                  />
                )
              })
            )}

            {/* 悬浮回到顶部 / 回到底部双导航胶囊 */}
            {(showScrollBottomBtn || showScrollTopBtn) && (
              <div className="sticky bottom-2 flex justify-end gap-1.5 w-full pointer-events-none z-10 pr-2">
                {showScrollTopBtn && (
                  <button
                    type="button"
                    onClick={scrollToTop}
                    className="pointer-events-auto px-2.5 py-1 rounded-full bg-white/95 border border-slate-200/90 shadow-md text-[11px] font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition-all cursor-pointer backdrop-blur-xs"
                    title="回到对话顶部"
                  >
                    <ArrowUp className="w-3 h-3" />
                    <span className="hidden sm:inline">顶部</span>
                  </button>
                )}
                {showScrollBottomBtn && (
                  <button
                    type="button"
                    onClick={() => {
                      isAtBottomRef.current = true
                      setShowScrollBottomBtn(false)
                      scrollToBottom(true)
                    }}
                    className="pointer-events-auto px-3 py-1 rounded-full bg-slate-900/95 text-white shadow-md text-[11px] font-semibold hover:bg-indigo-600 flex items-center gap-1 transition-all cursor-pointer backdrop-blur-xs"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>最新回复</span>
                  </button>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 追问模式专属全局高亮指引条 */}
          {studyTone === 'followup' && (
            <div className="mx-2 sm:mx-4 mb-1 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-center justify-between text-xs animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold text-amber-800">🎯 追问模式已激活</span>
                <span className="text-[11px] text-amber-700 hidden sm:inline">
                  导师将锁定您的具体疑问做靶向深度解答，拒绝笼统套话与大段概念复述
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleStudyToneChange('rigorous')}
                className="text-[11px] text-amber-800 hover:text-amber-950 font-medium underline underline-offset-2 cursor-pointer"
              >
                退出追问模式
              </button>
            </div>
          )}

          {/* 一体化智能输入舱 (Smart Composer Dock) */}
          <ChatComposerDock
            input={input}
            onInputChange={setInput}
            onSend={handleSend}
            onStop={() => handleStopConversation(activeConvId)}
            isCurrentRunning={isCurrentRunning}
            runningStatus={runningConvs[activeConvId]?.status}
            activeAgent={activeAgent}
            studyTone={studyTone}
            onStudyToneChange={handleStudyToneChange}
            promptsList={promptsList}
            promptLabel={promptLabel}
            promptTopic={promptTopic}
            isRefreshingPrompts={isRefreshingPrompts}
            onRefreshPrompts={() => handleRefreshPrompts(true)}
            onOpenStepTutor={() => setStepTutorOpen(true)}
            onToggleNotePanel={() => setShowFiles(prev => !prev)}
            selectedNote={selectedNote}
            onClearSelectedNote={() => setSelectedNote(null)}
            activeSkill={activeSkill}
            onClearActiveSkill={() => setActiveSkill(null)}
            selectedLocalSkill={selectedLocalSkill}
            onClearLocalSkill={() => setSelectedLocalSkill(null)}
            stagedImages={stagedImages}
            onRemoveStagedImage={handleRemoveStagedImage}
            onPreviewImage={setPreviewImageModal}
            stagedFiles={stagedFiles}
            onRemoveStagedFile={handleRemoveStagedFile}
            uploadingFile={uploadingFile}
            onAddImages={handleAddImages}
            onAddGeneralFiles={handleAddGeneralFiles}
            hideQuickPrompts={isWelcomeState}
            messageWidthClass={messageWidthClass}
          />
        </div>

        {/* 右侧伴读分栏拖拽调整手柄 */}
        {showFiles && (
          <div
            onMouseDown={handleNotePanelResizeStart}
            className="hidden md:flex items-center justify-center w-1.5 hover:w-2 -mx-1 hover:mx-0 bg-transparent hover:bg-amber-500/30 active:bg-amber-500 cursor-col-resize transition-all shrink-0 rounded-full my-6 z-10 group"
            title="拖拽调节知识库伴读分栏宽度"
          >
            <div className="w-0.5 h-6 bg-slate-300 group-hover:bg-amber-500 rounded-full" />
          </div>
        )}

        {/* 2.3 右侧：知识库目录与笔记原文伴读分栏 (NoteCompanionPanel) */}
        {showFiles && (
          <div
            className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
            onClick={() => setShowFiles(false)}
          />
        )}
        <div
          style={{
            width: showFiles
              ? typeof window !== 'undefined' && window.innerWidth >= 768
                ? `${notePanelWidth}px`
                : undefined
              : undefined,
          }}
          className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl transition-transform duration-200 md:static md:z-auto md:shadow-none md:transition-none ${
            showFiles ? 'translate-x-0' : 'translate-x-full md:hidden'
          } shrink-0`}
        >
          <NoteCompanionPanel
            tree={tree}
            selectedNote={selectedNote}
            onSelectNotePath={(path: string) => handleNoteClick(path)}
            onClearSelectedNote={() => setSelectedNote(null)}
            onQuickActionWithNote={(promptText: string) => {
              handleSend(promptText)
              if (window.innerWidth < 768) setShowFiles(false)
            }}
            onClosePanel={() => setShowFiles(false)}
          />
        </div>
      </div>

      {/* 📱 移动端引擎与高级能力控制抽屉 */}
      <ChatMobileConfigSheet
          mobileConfigOpen={mobileConfigOpen}
          setMobileConfigOpen={setMobileConfigOpen}
          studyTone={studyTone}
          setStudyTone={setStudyTone}
          provider={provider}
          handleProviderChange={handleProviderChange}
          currentAvailableModels={currentAvailableModels}
          selectedModel={selectedModel}
          isCustomModel={isCustomModel}
          handleModelSelect={handleModelSelect}
          isAdmin={isAdmin}
          setShowModelManagerModal={setShowModelManagerModal}
          setShowMemoryModal={setShowMemoryModal}
          setShowSkillPicker={setShowSkillPicker}
          chatFontSize={chatFontSize}
          handleSetFontSize={handleSetFontSize}
          isDualMode={isDualMode}
          setIsDualMode={setIsDualMode}
        />

        {/* 📱 移动端伴学智能体选择抽屉 */}
      {showAgentPicker && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setShowAgentPicker(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 max-h-[75vh] overflow-y-auto space-y-3 animate-sheet-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">切换伴学导师</span>
              <button
                type="button"
                onClick={() => setShowAgentPicker(false)}
                className="p-1 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {STUDY_AGENTS.map(agent => {
                const isSelected = activeAgent.id === agent.id
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => {
                      handleSelectAgent(agent)
                      setShowAgentPicker(false)
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white shadow-2xs shrink-0">
                      {agent.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{agent.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded border ${agent.badgeClass}`}
                        >
                          {agent.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {agent.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 按需条件挂载的模态框（未打开时零组件树开销） */}
      <Suspense fallback={null}>
        {practiceModalOpen && (
          <QuickPracticeModal
            isOpen={practiceModalOpen}
            onClose={() => setPracticeModalOpen(false)}
            noteTitle={practiceData.title}
            noteContent={practiceData.content}
          />
        )}

        {showMemoryModal && (
          <AIMemoryModal
            isOpen={showMemoryModal}
            onClose={() => setShowMemoryModal(false)}
            onSelectConcept={(title: string) => {
              setInput(`请详细为我深度解析考点「${title}」，给出考点本质、真题考法和记忆口诀：`)
            }}
          />
        )}

        {showSkillPicker && (
          <LocalSkillPickerModal
            isOpen={showSkillPicker}
            onClose={() => setShowSkillPicker(false)}
            onSelectSkill={skill => setSelectedLocalSkill(skill)}
            currentSkillId={selectedLocalSkill?.id}
          />
        )}

        {showModelManagerModal && (
          <ModelManagerModal
            isOpen={showModelManagerModal}
            onClose={() => setShowModelManagerModal(false)}
            agents={agents}
            currentProvider={provider}
            webModels={webModels}
            onWebModelsUpdated={handleWebModelsUpdated}
            onModelsUpdated={updated => {
              setAgents(updated)
              const active = updated.find(a => a.provider === provider)
              if (active?.models && !active.models.includes(selectedModel)) {
                setSelectedModel(active.models[0] || '')
              }
            }}
          />
        )}

        {stepTutorOpen && (
          <StepTutorModal
            isOpen={stepTutorOpen}
            onClose={() => setStepTutorOpen(false)}
            initialQuestion={input || ''}
          />
        )}


      </Suspense>

      {/* 新建项目工作区模态框 */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-indigo-600" />
                <span>新建独立研学项目工作区</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProjectSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  项目名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="例如：408 计算机网络专题、高等数学历年真题"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  项目专属记忆与领域要求 (可选)
                </label>
                <textarea
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  placeholder="为该项目注入专属背景记忆（各项目完全物理隔离）"
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  独立本地工作目录 (cwd，可选)
                </label>
                <input
                  type="text"
                  value={newProjectCwd}
                  onChange={e => setNewProjectCwd(e.target.value)}
                  placeholder="绝对路径，例如 E:\考研\408考研学习\计算机网络"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  确认创建并进入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 图片全屏高清预览模态框 */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewImageModal(null)}
              className="absolute -top-11 right-0 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors cursor-pointer"
              title="关闭预览"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageModal}
              alt="大图预览"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
