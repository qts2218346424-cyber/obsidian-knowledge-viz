import type { ProviderType } from '../../components/chat/ChatStudioHeader'

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

export interface AgentMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: string[]
  files?: AttachedFile[]
  agentName?: string
  agentIcon?: string
  provider?: ProviderType
  model?: string
  toolCalls: ToolCallInfo[]
  citedNotes?: { title: string; path: string; excerpt: string; tags: string[] }[]
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
