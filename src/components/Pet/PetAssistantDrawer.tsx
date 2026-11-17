import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  Send,
  Loader2,
  Trash2,
  Copy,
  Save,
  ChevronDown,
  Check,
  Bot,
  Sparkles,
  Maximize2,
  Minimize2,
  RefreshCw,
  Square,
  GripHorizontal,
  AlertCircle,
} from 'lucide-react'
import MarkdownRenderer from '../MarkdownRenderer'
import { api, type LocalAgentStatus } from '../../services/api'
import { STUDY_AGENTS } from '../../data/studyAgents'
import { formatUnifiedModelName, detectCrossSubjectProxy } from '../../utils/modelDisplay'
import type { PetMood } from './DesktopPet'
import LuluAvatar, { useActivePetPersona, PetChibiHead, type PetId } from './LuluAvatar'
import DangoAvatar from '../DangoAvatar'
import { useAuth } from '../../contexts/AuthContext'
import { getAuthHeaders } from '../../services/auth'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  promptText?: string
  error?: string
  aborted?: boolean
  agentName?: string
  agentIcon?: string
  isProxyReply?: boolean
  proxySubject?: string
  modelLabel?: string
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

type ProviderType = 'antigravity' | 'codex' | 'claude-code' | 'web'

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

interface WindowRect {
  x: number
  y: number
  width: number
  height: number
}

const MIN_WIDTH = 348
const MIN_HEIGHT = 420
const DEFAULT_WIDTH = 416
const DEFAULT_HEIGHT = 560
const RECT_STORAGE_KEY = 'coreforge_pet_drawer_rect_v1'
const CHAT_CACHE_KEY = 'coreforge_pet_drawer_msgs_v1'

const PROVIDER_INFO: Record<ProviderType, { label: string; short: string; defaultModel: string }> = {
  antigravity: { label: '✨ Antigravity (Gemini 3.8 Flash)', short: '✨ Antigravity', defaultModel: 'gemini-3.8-flash' },
  codex: { label: '🤖 Codex', short: '🤖 Codex', defaultModel: 'gpt-5.6-luna' },
  'claude-code': { label: '⚡ Claude', short: '⚡ Claude', defaultModel: 'deepseek-v4-flash' },
  web: { label: '☁️ 云端双核', short: '☁️ 云端', defaultModel: 'deepseek-v4-pro' },
}

const QUICK_PROMPTS = [
  '🌿 备考好焦虑，感觉背不完学不动了...',
  '💡 帮我解析泰勒展开公式本质与考点',
  '⚡ 408 虚拟内存页表与 TLB 命中机制',
  '🎯 考我一道 408 核心考点高频选择题',
]

function buildWelcomeText(petId: PetId): string {
  if (petId === 'feiyu') {
    return '哼哼，我是大肥鱼（才不是胖鱼，是 DeepSeek 鲸鱼娘啦）！🐟🍚\n只要投喂够热乎的大白米饭补充 Token，不管是 408 算法/高数证明卡壳，还是备考压力大想找本鱼吐槽摸鱼，我都会全程陪着你稳稳上岸哟~ ✨'
  }
  return '我是奶龙！🐲🫧\n无论是 408/高数考点卡壳，还是备考压力大、心里焦虑学不动了，都可以随时跟我聊聊！揉揉大肚皮，俺不仅懂真题算法，还能做你的暖心心理疗愈师哟~ 🍗✨'
}

function clampWindowRect(rect: WindowRect): WindowRect {
  if (typeof window === 'undefined') return rect
  const vw = window.innerWidth
  const vh = window.innerHeight
  const maxWidth = Math.max(MIN_WIDTH, vw - 24)
  const maxHeight = Math.max(MIN_HEIGHT, vh - 24)
  const width = Math.min(maxWidth, Math.max(MIN_WIDTH, Math.round(rect.width)))
  const height = Math.min(maxHeight, Math.max(MIN_HEIGHT, Math.round(rect.height)))
  const x = Math.min(Math.max(8, vw - width - 8), Math.max(8, Math.round(rect.x)))
  const y = Math.min(Math.max(8, vh - height - 8), Math.max(8, Math.round(rect.y)))
  return { x, y, width, height }
}

function getInitialWindowRect(): WindowRect {
  if (typeof window === 'undefined') {
    return { x: 800, y: 120, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }
  }
  try {
    const saved = localStorage.getItem(RECT_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as WindowRect
      if (
        typeof parsed?.x === 'number' &&
        typeof parsed?.y === 'number' &&
        typeof parsed?.width === 'number' &&
        typeof parsed?.height === 'number'
      ) {
        return clampWindowRect(parsed)
      }
    }
  } catch {
    // ignore
  }
  return clampWindowRect({
    x: window.innerWidth - DEFAULT_WIDTH - 20,
    y: window.innerHeight - DEFAULT_HEIGHT - 84,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  })
}

export default function PetAssistantDrawer({
  isOpen,
  onClose,
  onTokenConsumed,
  onSetMood,
}: PetAssistantDrawerProps) {
  const [persona, setPetPersona] = useActivePetPersona()
  const isFeiyu = persona.id === 'feiyu'

  const [provider, setProvider] = useState<ProviderType>(() => {
    return (localStorage.getItem('coreforge_active_provider') as ProviderType) || 'codex'
  })
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem(`coreforge_model_${provider}`) || PROVIDER_INFO[provider]?.defaultModel || 'deepseek-v4-pro'
  })
  const [selectedAgentId, setSelectedAgentId] = useState<string>('agent-408')
  const activeStudyAgent = STUDY_AGENTS.find(a => a.id === selectedAgentId) || STUDY_AGENTS[0]
  const isPsychologyMode = activeStudyAgent.id === 'agent-psychology'
  const [agents, setAgents] = useState<LocalAgentStatus[]>([])
  const [showConfig, setShowConfig] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

  // ── 窗口自由拖动、八向缩放与一键最大化状态 ───────────────────────────────
  const [rect, setRect] = useState<WindowRect>(getInitialWindowRect)
  const [isMaximized, setIsMaximized] = useState(false)
  const prevRectBeforeMaxRef = useRef<WindowRect | null>(null)
  const [isInteractingWindow, setIsInteractingWindow] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setRect(prev => clampWindowRect(prev))
      }
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  useEffect(() => {
    api.getLocalAgentStatus()
      .then(data => {
        if (data?.agents) setAgents(data.agents)
      })
      .catch(() => {})
  }, [])

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const cached = sessionStorage.getItem(CHAT_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached) as Message[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 自动修复此前因网络/流中断遗留的空白气泡，赋予可重载提示
          return parsed.map(m =>
            m.role === 'assistant' && !m.content && !m.error
              ? { ...m, error: '上次回复未完成，点击下方按钮可重新加载' }
              : m
          )
        }
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: buildWelcomeText(persona.id),
      },
    ]
  })
  const [loading, setLoading] = useState(false)
  const [activeGeneratingId, setActiveGeneratingId] = useState<string | null>(null)
  const [currentToolStatus, setCurrentToolStatus] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 缓存会话历史到 sessionStorage（避免收起再打开时丢失记录）
  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(messages.slice(-30)))
    } catch {
      // ignore
    }
  }, [messages])

  // 组件卸载时安全清理未完成的流请求
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // 当切换宠物且仍处于初始欢迎消息时，自动同步对应角色的欢迎开场白
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], content: buildWelcomeText(persona.id) }]
      }
      return prev
    })
  }, [persona.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, currentToolStatus])

  // ── 窗口标题栏拖动处理 ───────────────────────────────────────────────────
  const handleHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isMobile || isMaximized) return
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      if (target.closest('button, a, select, input, textarea, [data-no-drag="true"]')) {
        return
      }
      e.preventDefault()
      const startX = e.clientX
      const startY = e.clientY
      const startRect = { ...rect }
      setIsInteractingWindow(true)

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY
        const next = clampWindowRect({
          ...startRect,
          x: startRect.x + dx,
          y: startRect.y + dy,
        })
        setRect(next)
      }

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        setIsInteractingWindow(false)
        const finalRect = clampWindowRect({
          ...startRect,
          x: startRect.x + (ev.clientX - startX),
          y: startRect.y + (ev.clientY - startY),
        })
        try {
          localStorage.setItem(RECT_STORAGE_KEY, JSON.stringify(finalRect))
        } catch {
          // ignore
        }
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [isMobile, isMaximized, rect]
  )

  // ── 窗口八方向边缘/角落缩放处理 ──────────────────────────────────────────
  const handleResizePointerDown = useCallback(
    (dir: ResizeDirection, e: React.PointerEvent<HTMLDivElement>) => {
      if (isMobile || isMaximized) return
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      const startX = e.clientX
      const startY = e.clientY
      const startRect = { ...rect }
      setIsInteractingWindow(true)

      const computeResized = (clientX: number, clientY: number): WindowRect => {
        const dx = clientX - startX
        const dy = clientY - startY
        const vw = window.innerWidth
        const vh = window.innerHeight

        let newX = startRect.x
        let newY = startRect.y
        let newW = startRect.width
        let newH = startRect.height

        if (dir.includes('e')) {
          newW = Math.min(vw - startRect.x - 8, Math.max(MIN_WIDTH, startRect.width + dx))
        }
        if (dir.includes('s')) {
          newH = Math.min(vh - startRect.y - 8, Math.max(MIN_HEIGHT, startRect.height + dy))
        }
        if (dir.includes('w')) {
          const rightEdge = startRect.x + startRect.width
          const proposedW = startRect.width - dx
          const clampedW = Math.min(rightEdge - 8, Math.max(MIN_WIDTH, proposedW))
          newW = clampedW
          newX = rightEdge - clampedW
        }
        if (dir.includes('n')) {
          const bottomEdge = startRect.y + startRect.height
          const proposedH = startRect.height - dy
          const clampedH = Math.min(bottomEdge - 8, Math.max(MIN_HEIGHT, proposedH))
          newH = clampedH
          newY = bottomEdge - clampedH
        }

        return {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        }
      }

      const onMove = (ev: PointerEvent) => {
        setRect(computeResized(ev.clientX, ev.clientY))
      }

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        setIsInteractingWindow(false)
        const finalRect = computeResized(ev.clientX, ev.clientY)
        try {
          localStorage.setItem(RECT_STORAGE_KEY, JSON.stringify(finalRect))
        } catch {
          // ignore
        }
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [isMobile, isMaximized, rect]
  )

  const toggleMaximize = useCallback(() => {
    if (isMobile) return
    if (isMaximized) {
      setIsMaximized(false)
      if (prevRectBeforeMaxRef.current) {
        setRect(clampWindowRect(prevRectBeforeMaxRef.current))
      }
    } else {
      prevRectBeforeMaxRef.current = rect
      setIsMaximized(true)
    }
  }, [isMobile, isMaximized, rect])

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setLoading(false)
    setCurrentToolStatus(null)
    setActiveGeneratingId(null)
    onSetMood('idle')
  }, [onSetMood])

  const streamAssistantReply = async (params: {
    promptText: string
    assistantMsgId: string
    historyMessages: Message[]
    overrideProvider?: ProviderType
  }) => {
    const { promptText, assistantMsgId, historyMessages, overrideProvider } = params
    const activeProv = overrideProvider || provider
    const activeMdl = overrideProvider
      ? localStorage.getItem(`coreforge_model_${overrideProvider}`) || PROVIDER_INFO[overrideProvider].defaultModel
      : selectedModel

    const proxySubject = detectCrossSubjectProxy(promptText, activeStudyAgent.id)

    // 先清空目标助手消息的错误/旧正文并进入加载态
    setMessages(prev =>
      prev.map(m =>
        m.id === assistantMsgId
          ? {
              ...m,
              content: '',
              error: undefined,
              aborted: false,
              promptText,
              agentName: activeStudyAgent.name,
              agentIcon: activeStudyAgent.icon,
              isProxyReply: Boolean(proxySubject),
              proxySubject: proxySubject || undefined,
              modelLabel: formatUnifiedModelName(activeProv, activeMdl),
              toolCalls: [],
            }
          : m
      )
    )

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)
    setActiveGeneratingId(assistantMsgId)
    onSetMood('thinking')
    setCurrentToolStatus(
      isPsychologyMode
        ? isFeiyu
          ? '大肥鱼正放下大白米饭碗认真倾听你的心里话...'
          : '奶龙正在捧着热茶认真倾听你的心里话...'
        : `${activeStudyAgent.name}正在查阅知识库并推导...`
    )

    let watchdogTimer: ReturnType<typeof setTimeout> | null = null
    let isTimedOut = false
    const resetWatchdog = () => {
      if (watchdogTimer) clearTimeout(watchdogTimer)
      watchdogTimer = setTimeout(() => {
        isTimedOut = true
        controller.abort()
      }, 45000)
    }
    resetWatchdog()

    let producedAnyText = false
    let receivedError: string | null = null

    try {
      const isLocal = activeProv === 'codex' || activeProv === 'claude-code'
      const endpoint = '/api/local-agents/chat'
      const historyPayload = historyMessages
        .filter(m => m.id !== 'welcome' && m.id !== 'reset' && m.id !== assistantMsgId && m.content && !m.error)
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }))

      const body = {
        provider: activeProv,
        prompt: promptText,
        model: activeMdl || undefined,
        history: historyPayload,
        agentPrompt: `${activeStudyAgent.systemPrompt}${
          proxySubject ? `\n【跨科代答提示】：本题涉及${proxySubject}，当前由「${activeStudyAgent.name}」代答。` : ''
        }`,
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      resetWatchdog()

      if (!res.ok) {
        let errDetail = `服务响应异常 (HTTP ${res.status})`
        try {
          const errJson = await res.json()
          if (errJson?.message || errJson?.error) {
            errDetail = errJson.message || errJson.error
          }
        } catch {
          // ignore
        }
        throw new Error(errDetail)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('流式传输通道不可用')

      const decoder = new TextDecoder()
      let buffer = ''

      const processLine = (rawLine: string) => {
        const trimmed = rawLine.trim()
        if (!trimmed.startsWith('data:')) return
        const jsonStr = trimmed.slice(5).trim()
        if (!jsonStr || jsonStr === '[DONE]') return
        try {
          const event = JSON.parse(jsonStr)
          if (event.type === 'text' && event.content) {
            producedAnyText = true
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: m.content + event.content } : m
              )
            )
          } else if (event.type === 'error') {
            receivedError = event.content || event.error || '模型服务返回异常'
          } else if (event.type === 'status') {
            setCurrentToolStatus(event.content || '正在调用知识库...')
          } else if (event.type === 'tool_call') {
            setCurrentToolStatus(`调用工具: ${event.tool}`)
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
          } else if (event.type === 'points_updated') {
            window.dispatchEvent(new CustomEvent('user-points-updated', { detail: event }))
          }
        } catch {
          // 忽略非 JSON 心跳块
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        resetWatchdog()

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          processLine(line)
        }
      }

      if (buffer.trim()) {
        processLine(buffer)
      }

      if (receivedError && !producedAnyText) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, error: receivedError || '响应异常，请点击重新加载' }
              : m
          )
        )
        onSetMood('idle')
      } else if (!producedAnyText) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? { ...m, error: '当前通道暂未返回内容（可能网络波动），请点击重新加载或切换云端引擎' }
              : m
          )
        )
        onSetMood('idle')
      } else {
        onSetMood('happy')
        setTimeout(() => onSetMood('idle'), 2500)
      }
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError' || controller.signal.aborted
      if (isAbort && !isTimedOut) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  aborted: true,
                  error: m.content ? undefined : '已停止生成，可随时点击重新加载',
                }
              : m
          )
        )
      } else {
        const errMsg = isTimedOut
          ? '响应等待超时（超过 45 秒未返回数据），请点击重新加载重试'
          : err?.message || '网络连接波动，请点击重新加载'
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId ? { ...m, error: errMsg } : m
          )
        )
      }
      onSetMood('idle')
    } finally {
      if (watchdogTimer) clearTimeout(watchdogTimer)
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
        setLoading(false)
        setActiveGeneratingId(null)
        setCurrentToolStatus(null)
      }
    }
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? input).trim()
    if (!text || loading) return

    const now = Date.now()
    const userMsg: Message = {
      id: `user-${now}`,
      role: 'user',
      content: text,
    }
    const assistantMsgId = `assistant-${now}`
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      promptText: text,
      agentName: activeStudyAgent.name,
      agentIcon: activeStudyAgent.icon,
      modelLabel: formatUnifiedModelName(provider, selectedModel),
      toolCalls: [],
    }

    const nextHistory = [...messages, userMsg]
    setMessages([...nextHistory, assistantMsg])
    if (textToSend === undefined) {
      setInput('')
    }

    await streamAssistantReply({
      promptText: text,
      assistantMsgId,
      historyMessages: nextHistory,
    })
  }

  // 一键重新加载 / 重新生成某条助手消息（原地刷新，不堆砌重复提问气泡）
  const handleReloadMessage = async (assistantMsgId: string, overrideProvider?: ProviderType) => {
    if (loading) {
      handleStopGeneration()
    }
    const idx = messages.findIndex(m => m.id === assistantMsgId)
    if (idx === -1) return

    const targetMsg = messages[idx]
    let promptText = targetMsg.promptText || ''
    if (!promptText) {
      // 向前寻找最近一条用户提问作为回溯源
      for (let i = idx - 1; i >= 0; i--) {
        if (messages[i].role === 'user' && messages[i].content.trim()) {
          promptText = messages[i].content.trim()
          break
        }
      }
    }
    if (!promptText) return

    if (overrideProvider && overrideProvider !== provider) {
      handleProviderSelect(overrideProvider)
    }

    const priorHistory = messages.slice(0, idx)
    await streamAssistantReply({
      promptText,
      assistantMsgId,
      historyMessages: priorHistory,
      overrideProvider,
    })
  }

  const handleProviderSelect = (newProv: ProviderType) => {
    setProvider(newProv)
    localStorage.setItem('coreforge_active_provider', newProv)
    const provAgent = agents.find(a => a.provider === newProv)
    const available =
      provAgent?.models && provAgent.models.length > 0
        ? provAgent.models[0]
        : PROVIDER_INFO[newProv].defaultModel
    const saved = localStorage.getItem(`coreforge_model_${newProv}`) || available
    setSelectedModel(saved)
    setShowConfig(false)
  }

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSaveToNote = async (msg: Message) => {
    if (!msg.content) return
    const firstLine = msg.content
      .split('\n')[0]
      .replace(/^#+\s*/, '')
      .replace(/[<>:"/\\|?*]/g, '_')
      .substring(0, 30)
    const title = firstLine || `${persona.name}精析_${new Date().toLocaleDateString('zh-CN')}`
    const destPath = `wiki/AI伴学笔记/${title}.md`
    try {
      await api.createFile(destPath, msg.content, {
        title,
        tags: ['ai-study', `${persona.name}小助手`, provider],
        created: new Date().toISOString().split('T')[0],
      })
      setSavedId(msg.id)
      setTimeout(() => setSavedId(null), 3000)
    } catch (err: any) {
      alert(`保存失败: ${err.message}`)
    }
  }

  const clearChat = () => {
    handleStopGeneration()
    const resetList: Message[] = [
      {
        id: 'reset',
        role: 'assistant',
        content: '会话已重置。随时告诉我你需要查询或解析哪些考点！',
      },
    ]
    setMessages(resetList)
    try {
      sessionStorage.removeItem(CHAT_CACHE_KEY)
    } catch {
      // ignore
    }
  }

  const { user } = useAuth()

  if (!isOpen) return null

  const desktopStyle: React.CSSProperties | undefined = isMobile
    ? undefined
    : isMaximized
      ? {
          left: 'max(16px, calc(50vw - min(440px, 45vw)))',
          top: 'max(16px, 6vh)',
          width: 'min(880px, calc(100vw - 32px))',
          height: 'min(800px, calc(100vh - 32px))',
        }
      : {
          left: `${rect.x}px`,
          top: `${rect.y}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        }

  return (
    <>
      {isMobile && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] animate-in fade-in"
        />
      )}

      <div
        style={desktopStyle}
        className={`fixed z-50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border ${
          isFeiyu
            ? 'border-sky-200/90 dark:border-slate-800'
            : 'border-amber-200/90 dark:border-slate-800'
        } shadow-2xl flex flex-col overflow-hidden ${
          isInteractingWindow ? 'select-none' : 'transition-[box-shadow] duration-200'
        } ${
          isMobile
            ? 'inset-x-2 bottom-3.5 h-[72vh] max-h-[580px] rounded-3xl animate-in fade-in slide-in-from-bottom-5'
            : 'rounded-3xl animate-in fade-in duration-150'
        }`}
      >
        {/* ── 桌面端八方向自由拖拽缩放边缘与四角热区 ───────────────────────── */}
        {!isMobile && !isMaximized && (
          <>
            {/* 四条边 */}
            <div
              onPointerDown={e => handleResizePointerDown('n', e)}
              className="absolute top-0 inset-x-3 h-1.5 z-30 cursor-ns-resize"
            />
            <div
              onPointerDown={e => handleResizePointerDown('s', e)}
              className="absolute bottom-0 inset-x-3 h-1.5 z-30 cursor-ns-resize"
            />
            <div
              onPointerDown={e => handleResizePointerDown('w', e)}
              className="absolute left-0 inset-y-3 w-1.5 z-30 cursor-ew-resize"
            />
            <div
              onPointerDown={e => handleResizePointerDown('e', e)}
              className="absolute right-0 inset-y-3 w-1.5 z-30 cursor-ew-resize"
            />
            {/* 四个角 */}
            <div
              onPointerDown={e => handleResizePointerDown('nw', e)}
              className="absolute top-0 left-0 w-3.5 h-3.5 z-40 cursor-nwse-resize"
              title="拖拽调整窗口大小"
            />
            <div
              onPointerDown={e => handleResizePointerDown('ne', e)}
              className="absolute top-0 right-0 w-3.5 h-3.5 z-40 cursor-nesw-resize"
              title="拖拽调整窗口大小"
            />
            <div
              onPointerDown={e => handleResizePointerDown('sw', e)}
              className="absolute bottom-0 left-0 w-4 h-4 z-40 cursor-nesw-resize"
              title="拖拽调整窗口大小"
            />
            <div
              onPointerDown={e => handleResizePointerDown('se', e)}
              className="absolute bottom-0 right-0 w-5 h-5 z-40 cursor-nwse-resize flex items-end justify-end p-1 group"
              title="按住拖拽放大/缩小窗口"
            >
              <svg
                viewBox="0 0 10 10"
                className="w-2.5 h-2.5 text-slate-300 group-hover:text-slate-500 dark:text-slate-600 transition-colors pointer-events-none"
              >
                <path d="M9 1L1 9M9 5L5 9M9 8.5L8.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
          </>
        )}

        {/* ── 可自由拖动顶栏 Header（双击可快速放大/还原，永不竖排折行） ────── */}
        <div
          onPointerDown={handleHeaderPointerDown}
          onDoubleClick={toggleMaximize}
          className={`px-3 py-2 border-b flex items-center justify-between gap-1.5 shrink-0 select-none ${
            !isMobile && !isMaximized ? 'cursor-grab active:cursor-grabbing' : ''
          } ${
            isFeiyu
              ? 'border-sky-100 dark:border-slate-800/80 bg-gradient-to-r from-sky-400/15 via-blue-400/10 to-transparent'
              : 'border-amber-100 dark:border-slate-800/80 bg-gradient-to-r from-amber-400/15 via-orange-400/10 to-transparent'
          }`}
          title={!isMobile ? '按住空白处可自由拖动窗口 · 双击放大/还原' : undefined}
        >
          <div className="flex items-center gap-1.5 min-w-0 shrink-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                isFeiyu
                  ? 'bg-sky-100 dark:bg-sky-950 border-sky-300/80'
                  : 'bg-amber-100 dark:bg-amber-950 border-amber-300/80'
              }`}
            >
              <LuluAvatar
                petId={persona.id}
                size="xs"
                mood={loading ? 'thinking' : 'idle'}
                isSpeaking={loading}
                showAccessories={false}
              />
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs whitespace-nowrap">
                {persona.name}·随身聊
              </h3>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="在线就绪" />
            </div>
            {!isMobile && (
              <GripHorizontal className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 ml-0.5 shrink-0 hidden sm:block pointer-events-none" />
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0" data-no-drag="true">
            {/* 双宠快捷切换小胶囊 */}
            <div
              className="inline-flex items-center p-0.5 rounded-lg bg-white/85 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 whitespace-nowrap"
              role="group"
              aria-label="切换伴学宠物"
            >
              <button
                type="button"
                onClick={() => setPetPersona('nailong')}
                aria-pressed={!isFeiyu}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  !isFeiyu
                    ? 'bg-amber-400 text-amber-950 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="切换为奶龙"
              >
                🐲奶龙
              </button>
              <button
                type="button"
                onClick={() => setPetPersona('feiyu')}
                aria-pressed={isFeiyu}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isFeiyu
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
                title="切换为大肥鱼 (DeepSeek)"
              >
                🐟大肥鱼
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white/85 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-300 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              title="点击快速切换 AI 引擎"
            >
              <Bot className={`w-3 h-3 shrink-0 ${isFeiyu ? 'text-blue-600' : 'text-amber-500'}`} />
              <span className="max-w-[72px] truncate">{PROVIDER_INFO[provider]?.short || provider}</span>
              <ChevronDown className={`w-2.5 h-2.5 text-slate-400 shrink-0 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
            </button>

            {!isMobile && (
              <button
                type="button"
                onClick={toggleMaximize}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 transition-colors cursor-pointer"
                title={isMaximized ? '还原小窗尺寸' : '放大为大屏伴学窗口'}
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              type="button"
              onClick={clearChat}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-black/5 transition-colors cursor-pointer"
              title="清空并重置对话"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 transition-colors cursor-pointer"
              title="收起随身伴学窗"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 人设快捷切换条 */}
        <div
          className={`px-3 py-1.5 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 ${
            isFeiyu
              ? 'border-sky-100/80 dark:border-slate-800/80 bg-sky-50/35 dark:bg-slate-900/60'
              : 'border-amber-100/80 dark:border-slate-800/80 bg-amber-50/35 dark:bg-slate-900/60'
          }`}
        >
          {[
            ...STUDY_AGENTS.filter(a => a.id === 'agent-408' || a.id === 'agent-psychology'),
            ...STUDY_AGENTS.filter(a => a.id !== 'agent-408' && a.id !== 'agent-psychology'),
          ].map(agent => {
            const active = selectedAgentId === agent.id
            const label = agent.id === 'agent-psychology' ? '心理聊天师' : agent.name
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  setSelectedAgentId(agent.id)
                  if (messages.length <= 1) {
                    setMessages([
                      {
                        id: 'welcome',
                        role: 'assistant',
                        agentName: agent.name,
                        agentIcon: agent.icon,
                        content:
                          agent.id === 'agent-psychology'
                            ? isFeiyu
                              ? '呼噜噜~ 欢迎来到大肥鱼的深夜干饭情绪树洞！🐟🍚\n备考累了、错题多了或者心里焦虑的时候，别自己硬扛着内耗啦！坐下来跟本鱼分一碗热乎白米饭，把烦恼统统倒出来吧~ 💙'
                              : '呼噜噜~ 欢迎来到奶龙的秘密情绪树洞！🫧\n考研这条路有时候挺孤单也挺累的吧？不管今天是学不进去、错题一大堆，还是深夜焦虑失眠，都可以慢慢跟我说，奶龙的大肚皮一直为你敞开着哟~ 🐲💛'
                            : `已切换至「${agent.icon} ${agent.name} · ${agent.title}」！随时把你的问题发给我吧~`,
                      },
                    ])
                  }
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer border ${
                  active
                    ? agent.id === 'agent-psychology'
                      ? isFeiyu
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-500 shadow-xs'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300'
                }`}
              >
                <span>{agent.icon}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* 折叠引擎与导师选择卡 */}
        {showConfig && (
          <div
            className={`px-3.5 py-2.5 border-b shrink-0 animate-in fade-in slide-in-from-top-1 text-xs space-y-2 ${
              isFeiyu
                ? 'bg-sky-50/70 dark:bg-slate-950/80 border-sky-200/60 dark:border-slate-800'
                : 'bg-amber-50/70 dark:bg-slate-950/80 border-amber-200/60 dark:border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-2xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span>选择伴学引擎:</span>
                <span className={`text-2xs font-mono ${isFeiyu ? 'text-blue-700 dark:text-sky-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {formatUnifiedModelName(provider, selectedModel)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['antigravity', 'codex', 'claude-code', 'web'] as ProviderType[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleProviderSelect(p)}
                    className={`py-1 px-1 rounded-lg text-2xs font-semibold transition-all text-center truncate cursor-pointer ${
                      provider === p
                        ? isFeiyu
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'bg-amber-500 text-white shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {PROVIDER_INFO[p].short}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-2xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                当前值班导师 (涵盖政治/英语/规划):
              </div>
              <select
                value={selectedAgentId}
                onChange={e => setSelectedAgentId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-2xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {STUDY_AGENTS.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.icon} {agent.name} · {agent.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 对话消息滚动主区 */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 custom-scrollbar text-xs">
          {messages.map((m, idx) => {
            const isGeneratingThis = loading && activeGeneratingId === m.id
            const canReload =
              m.role === 'assistant' &&
              m.id !== 'welcome' &&
              m.id !== 'reset' &&
              Boolean(
                m.promptText ||
                  messages
                    .slice(0, idx)
                    .some(prevMsg => prevMsg.role === 'user' && prevMsg.content.trim())
              )

            return (
              <div
                key={m.id}
                className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {m.role === 'assistant' ? (
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 overflow-hidden ${
                      isFeiyu
                        ? 'bg-sky-100 dark:bg-sky-950 border-sky-300/80'
                        : 'bg-amber-100 dark:bg-amber-950 border-amber-300/80'
                    }`}
                  >
                    <PetChibiHead petId={persona.id} className="w-5 h-5" />
                  </div>
                ) : (
                  <DangoAvatar
                    seed={user?.username || user?.displayName}
                    size="sm"
                    className="mt-0.5 shadow-xs"
                    title={user?.displayName || user?.username || '我'}
                  />
                )}

                <div className={`space-y-1.5 max-w-[86%] ${m.role === 'user' ? 'items-end' : ''}`}>
                  {m.role === 'assistant' && (m.agentName || m.isProxyReply) && (
                    <div className="flex flex-wrap items-center gap-1 text-2xs px-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {m.agentIcon || '🤖'} {m.agentName || '研小核'}
                      </span>
                      {m.isProxyReply && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                          研小核（代答）
                        </span>
                      )}
                      {m.modelLabel && (
                        <span className="text-2xs text-slate-400 font-mono">{m.modelLabel}</span>
                      )}
                    </div>
                  )}

                  <div
                    className={`px-3 py-2 rounded-2xl leading-relaxed break-words ${
                      m.role === 'user'
                        ? isFeiyu
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xs font-medium text-xs'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-medium text-xs'
                        : m.error && !m.content
                          ? 'bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/70 text-rose-900 dark:text-rose-200 shadow-xs text-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 shadow-xs text-xs'
                    }`}
                  >
                    {m.role === 'assistant' && !m.content && isGeneratingThis ? (
                      <div className="space-y-1.5 py-0.5 min-w-[200px]">
                        <div className="flex items-center justify-between gap-2">
                          <div className={`flex items-center gap-1.5 text-2xs font-semibold ${isFeiyu ? 'text-blue-600' : 'text-amber-600'}`}>
                            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                            <span>{currentToolStatus || '正在检索知识库并推导...'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleStopGeneration}
                            className="px-1.5 py-0.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold shrink-0 cursor-pointer transition-colors"
                            title="停止本次生成"
                          >
                            停止
                          </button>
                        </div>
                        <div className={`w-full h-1 rounded-full overflow-hidden ${isFeiyu ? 'bg-sky-100' : 'bg-amber-100'}`}>
                          <div className={`h-full rounded-full animate-pulse w-2/3 ${isFeiyu ? 'bg-blue-600' : 'bg-amber-500'}`} />
                        </div>
                      </div>
                    ) : m.role === 'assistant' && !m.content ? (
                      /* 异常、中断或空回复状态：绝不显示空白死框，直接提供一键重新加载 */
                      <div className="space-y-2 py-0.5">
                        <div className="flex items-start gap-1.5 text-2xs text-rose-700 dark:text-rose-300">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                          <span>{m.error || '本次回复未成功加载，请点击下方重新加载'}</span>
                        </div>
                        {canReload && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleReloadMessage(m.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shadow-2xs cursor-pointer active:scale-95 transition-all ${
                                isFeiyu ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'
                              }`}
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>重新加载</span>
                            </button>
                            {provider !== 'web' && (
                              <button
                                type="button"
                                onClick={() => handleReloadMessage(m.id, 'web')}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-sky-300 cursor-pointer transition-all"
                              >
                                <span>☁️ 切换云端引擎重试</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <MarkdownRenderer content={m.content} />
                        {m.aborted && (
                          <div className="mt-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                            ⏹ 已手动停止生成
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* 助手消息底部工具栏：支持一键重新生成 / 复制 / 存入笔记 */}
                  {m.role === 'assistant' && m.content && !isGeneratingThis && m.id !== 'welcome' && m.id !== 'reset' && (
                    <div className="flex flex-wrap items-center gap-1.5 text-2xs text-slate-400 pl-1">
                      {canReload && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReloadMessage(m.id)}
                            className={`flex items-center gap-0.5 cursor-pointer transition-colors ${
                              isFeiyu ? 'hover:text-blue-600 dark:hover:text-sky-400' : 'hover:text-amber-600 dark:hover:text-amber-400'
                            }`}
                            title="重新请求并生成本条回复"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>重新生成</span>
                          </button>
                          <span>·</span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopy(m.content, m.id)}
                        className="flex items-center gap-0.5 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                            <span className="text-emerald-500">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>复制</span>
                          </>
                        )}
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => handleSaveToNote(m)}
                        className={`flex items-center gap-0.5 cursor-pointer ${
                          isFeiyu ? 'hover:text-blue-600 dark:hover:text-sky-400' : 'hover:text-amber-600 dark:hover:text-amber-400'
                        }`}
                      >
                        {savedId === m.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-500" />
                            <span className="text-emerald-500">已存入笔记</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-2.5 h-2.5" />
                            <span>存入笔记</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {messages.length <= 1 && (
            <div className="pt-2 space-y-1.5 animate-in fade-in">
              <div className="text-2xs font-bold text-slate-400 px-1 flex items-center gap-1">
                <Sparkles className={`w-3 h-3 ${isFeiyu ? 'text-blue-500' : 'text-amber-500'}`} />
                <span>{isPsychologyMode ? `想和${persona.name}聊聊什么？` : '点选快捷提问:'}</span>
              </div>
              <div className="flex flex-col gap-1">
                {(isPsychologyMode ? activeStudyAgent.quickPrompts : QUICK_PROMPTS).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(isPsychologyMode ? p : p.slice(2))}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl border text-slate-700 dark:text-slate-300 text-2xs transition-all cursor-pointer truncate ${
                      isFeiyu
                        ? 'bg-sky-50/60 dark:bg-slate-800/60 hover:bg-sky-100/60 dark:hover:bg-slate-800 border-sky-200/50 dark:border-slate-700/60'
                        : 'bg-amber-50/60 dark:bg-slate-800/60 hover:bg-amber-100/60 dark:hover:bg-slate-800 border-amber-200/50 dark:border-slate-700/60'
                    }`}
                  >
                    {isPsychologyMode ? `🫧 ${p}` : p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入条（生成中右侧自动切换为醒目「停止」按钮，随时可打断防卡死） */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 shrink-0">
          <div className="relative flex items-center">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={
                isPsychologyMode
                  ? `跟${persona.name}·心理聊天师说说心里话（Enter 发送）...`
                  : `向${persona.name}随时提问（Enter 发送）...`
              }
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (e.nativeEvent.isComposing || (e as any).keyCode === 229) return
                  if (!loading) {
                    handleSendMessage()
                  }
                }
              }}
              className={`w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-3 pr-11 text-xs text-slate-900 dark:text-slate-100 outline-none max-h-28 shadow-xs ${
                isFeiyu ? 'focus:border-blue-400' : 'focus:border-amber-400'
              }`}
            />
            {loading ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="absolute right-1.5 p-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-xs active:scale-95"
                title="停止生成（点击立即中断请求）"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!input.trim()}
                className={`absolute right-1.5 p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer shadow-xs active:scale-95 ${
                  isFeiyu ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'
                }`}
                title="发送提问"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
