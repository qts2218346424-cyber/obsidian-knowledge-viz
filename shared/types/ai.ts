/**
 * AI 智能体、流式传输与技能类型定义
 */
export interface StudyAgent {
  id: string
  name: string
  role: string
  avatar: string
  systemPrompt: string
  subject?: string
  temperature?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  agentId?: string
  model?: string
  toolCalls?: Array<{
    name: string
    args: Record<string, unknown>
    result?: unknown
  }>
  isStreaming?: boolean
  error?: string
}

export interface AISkill {
  id: string
  name: string
  description: string
  icon?: string
  promptTemplate: string
  category: string
}
