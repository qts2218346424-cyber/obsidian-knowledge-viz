import Anthropic from '@anthropic-ai/sdk'

export type AiProvider = 'anthropic' | 'openai-compatible'

export interface AiConfig {
  apiKey: string
  baseURL: string
  model?: string
  provider?: AiProvider
  apiFormat?: 'anthropic' | 'openai'
}

export interface AiTextBlock {
  type: 'text'
  text: string
}

export interface AiToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

export type AiContentBlock = AiTextBlock | AiToolUseBlock

export interface AiMessageCreateParams {
  model: string
  max_tokens: number
  system?: string
  messages: Array<{ role: 'user' | 'assistant'; content: any }>
  tools?: Array<{
    name: string
    description?: string
    input_schema: Record<string, unknown>
  }>
}

export interface AiUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface AiClient {
  messages: {
    create(params: AiMessageCreateParams): Promise<{ content: AiContentBlock[]; usage?: AiUsage }>
  }
}


function resolveProvider(config: AiConfig): AiProvider {
  if (config.provider) return config.provider
  if (config.apiFormat === 'openai') return 'openai-compatible'
  return 'anthropic'
}

function resolveOpenAIChatURL(baseURL: string): string {
  const normalized = baseURL.replace(/\/+$/, '')
  if (normalized.endsWith('/chat/completions')) return normalized
  if (/\/v\d+$/.test(normalized)) return `${normalized}/chat/completions`
  return `${normalized}/v1/chat/completions`
}

function normalizeOpenAIContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map(part => typeof part === 'string' ? part : part?.text || '')
      .join('')
  }
  return ''
}

function normalizeToolResultContent(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return normalizeOpenAIContent(content)
  if (content && typeof content === 'object') {
    const value = content as { text?: unknown; content?: unknown }
    if (typeof value.text === 'string') return value.text
    if (typeof value.content === 'string') return value.content
  }
  return String(content ?? '')
}

function convertOpenAIMessages(messages: AiMessageCreateParams['messages']): Array<Record<string, unknown>> {
  const converted: Array<Record<string, unknown>> = []

  for (const message of messages) {
    if (!Array.isArray(message.content)) {
      converted.push({
        role: message.role,
        content: normalizeOpenAIContent(message.content),
      })
      continue
    }

    const blocks = message.content as Array<Record<string, any>>
    const text = blocks
      .filter(block => block?.type === 'text')
      .map(block => String(block.text || ''))
      .join('')
    const toolUses = blocks.filter(block => block?.type === 'tool_use')
    const toolResults = blocks.filter(block => block?.type === 'tool_result')

    if (message.role === 'assistant' && toolUses.length > 0) {
      converted.push({
        role: 'assistant',
        content: text || null,
        tool_calls: toolUses.map(block => ({
          id: String(block.id || `call_${Date.now()}`),
          type: 'function',
          function: {
            name: String(block.name || ''),
            arguments: JSON.stringify(block.input || {}),
          },
        })),
      })
      continue
    }

    if (message.role === 'user' && toolResults.length > 0) {
      for (const block of toolResults) {
        converted.push({
          role: 'tool',
          tool_call_id: String(block.tool_use_id || ''),
          content: normalizeToolResultContent(block.content),
        })
      }
      if (text) converted.push({ role: 'user', content: text })
      continue
    }

    converted.push({
      role: message.role,
      content: text || normalizeOpenAIContent(message.content),
    })
  }

  return converted
}

export class OpenAICompatibleClient implements AiClient {
  messages = {
    create: async (params: AiMessageCreateParams) => {
      const messages: Array<Record<string, unknown>> = []
      if (params.system) messages.push({ role: 'system', content: params.system })
      messages.push(...convertOpenAIMessages(params.messages))

      const body: Record<string, unknown> = {
        model: params.model,
        messages,
        max_tokens: params.max_tokens,
      }

      if (params.tools?.length) {
        body.tools = params.tools.map(tool => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description || '',
            parameters: tool.input_schema,
          },
        }))
        body.tool_choice = 'auto'
      }

      const response = await fetch(resolveOpenAIChatURL(this.baseURL), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const raw = await response.text()
      let data: any = {}
      try { data = raw ? JSON.parse(raw) : {} } catch { /* keep raw error */ }
      if (!response.ok) {
        const message = data?.error?.message || raw || `HTTP ${response.status}`
        const error = new Error(message) as Error & { status?: number }
        error.status = response.status
        throw error
      }

      const choice = data?.choices?.[0]?.message
      const content: AiContentBlock[] = []
      const text = normalizeOpenAIContent(choice?.content)
      if (text) content.push({ type: 'text', text })

      for (const toolCall of choice?.tool_calls || []) {
        let input: Record<string, unknown> = {}
        try {
          input = JSON.parse(toolCall.function?.arguments || '{}')
        } catch {
          input = {}
        }
        content.push({
          type: 'tool_use',
          id: toolCall.id || `call_${Date.now()}`,
          name: toolCall.function?.name || '',
          input,
        })
      }

      const usage: AiUsage | undefined = data?.usage ? {
        prompt_tokens: Number(data.usage.prompt_tokens || 0),
        completion_tokens: Number(data.usage.completion_tokens || 0),
        total_tokens: Number(data.usage.total_tokens || ((data.usage.prompt_tokens || 0) + (data.usage.completion_tokens || 0))),
      } : undefined

      return { content, usage }
    },
  }


  constructor(
    private readonly apiKey: string,
    private readonly baseURL: string,
  ) {}
}

export function createAiClient(config: AiConfig): AiClient {
  if (resolveProvider(config) === 'openai-compatible') {
    return new OpenAICompatibleClient(config.apiKey, config.baseURL)
  }

  const client = new Anthropic({ apiKey: config.apiKey, baseURL: config.baseURL })
  return client as unknown as AiClient
}

export function getAiProvider(config?: AiConfig): AiProvider | null {
  return config ? resolveProvider(config) : null
}
