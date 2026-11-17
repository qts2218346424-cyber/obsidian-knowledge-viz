import type { ProviderType } from '../../components/chat/ChatStudioHeader'

/** AI 伴学导师五大教学风格：严谨推导 / 通俗直观 / 考场冲刺 / 苏格拉底启发导学 / 靶向追问 */
export type StudyTone = 'rigorous' | 'vivid' | 'exam' | 'socratic' | 'followup'

/** AI 对话页面共享类型（自 pages/Chat.tsx 拆出） */

export interface ToolCallInfo {
  tool: string
  input: Record<string, any>
  output?: string
  success?: boolean
}

export interface PeerAgentResponse {
  agentName: string
  agentIcon: string
  provider: ProviderType
  model: string
  content: string
  streaming?: boolean
  error?: string
}

export interface AttachedFile {
  name: string
  size: number
  content: string
  ext?: string
}

export interface ContextEnrichmentMeta {
  profileApplied?: boolean
  targetExam?: string
  matchedWeakPoints?: string[]
  relatedErrorsCount?: number
}

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  quotedText?: string
  images?: string[]
  files?: AttachedFile[]
  agentName?: string
  agentIcon?: string
  provider?: ProviderType
  model?: string
  toolCalls: ToolCallInfo[]
  citedNotes?: { title: string; path: string; excerpt?: string; tags?: string[] }[]
  contextEnrichment?: ContextEnrichmentMeta
  timestamp: Date
  streaming?: boolean
  error?: string
  isDual?: boolean
  peerResponse?: PeerAgentResponse
}

export interface Conversation {
  id: string
  projectId?: string
  title: string
  messages: AgentMessage[]
  createdAt: Date
  provider?: ProviderType
  model?: string
  agentId?: string
}
