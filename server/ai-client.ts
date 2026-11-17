import Anthropic from '@anthropic-ai/sdk'

export type AiProvider = 'anthropic' | 'openai-compatible'

export interface CloudEndpoint {
  id: string
  name: string
  apiFormat: 'anthropic' | 'openai'
  baseURL: string
  apiKey: string
  models: string[]
  defaultModel?: string
}

export interface AiConfig {
  apiKey: string
  baseURL: string
  model?: string
  models?: string[]
  provider?: AiProvider
  apiFormat?: 'anthropic' | 'openai'
  endpoints?: CloudEndpoint[]
  activeEndpointId?: string
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

export interface AiStreamChunk {
  type: 'text_delta' | 'final'
  text?: string
  content?: AiContentBlock[]
  usage?: AiUsage
}

export interface AiClient {
  messages: {
    create(params: AiMessageCreateParams): Promise<{ content: AiContentBlock[]; usage?: AiUsage }>
    createStream?(params: AiMessageCreateParams): AsyncGenerator<AiStreamChunk>
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

    const imageBlocks = blocks.filter(block => block?.type === 'image')
    if (message.role === 'user' && imageBlocks.length > 0) {
      const parts: Array<Record<string, any>> = []
      if (text) {
        parts.push({ type: 'text', text })
      }
      for (const img of imageBlocks) {
        if (img.source?.type === 'base64' && img.source?.data) {
          const mediaType = img.source.media_type || 'image/jpeg'
          parts.push({
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${img.source.data}` },
          })
        } else if (img.source?.url) {
          parts.push({
            type: 'image_url',
            image_url: { url: img.source.url },
          })
        }
      }
      converted.push({
        role: 'user',
        content: parts,
      })
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

      let response = await fetch(resolveOpenAIChatURL(this.baseURL), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      let raw = await response.text()
      let data: any = {}
      try { data = raw ? JSON.parse(raw) : {} } catch { /* keep raw error */ }

      // 智能多模态视觉容错降级：若底层模型不支持 image_url 导致 400，自动剥离图片转换为纯文本优雅重试
      const hasImageParts = messages.some(m => Array.isArray(m.content) && (m.content as any[]).some(p => p.type === 'image_url'))
      if (!response.ok && hasImageParts) {
        const errMsg = String(data?.error?.message || raw || '').toLowerCase()
        if (response.status === 400 || errMsg.includes('image') || errMsg.includes('multimodal') || errMsg.includes('vision') || errMsg.includes('unsupported')) {
          console.warn('[OpenAICompatibleClient] Model does not support image_url, falling back to text-only mode...')
          const sanitizedMessages = messages.map(m => {
            if (!Array.isArray(m.content)) return m
            const textParts = (m.content as any[])
              .filter(p => p.type === 'text')
              .map(p => p.text || '')
              .join(' ')
            return {
              ...m,
              content: textParts ? `[已上传题目图片附件]
${textParts}` : '[已上传考研真题/手写笔记图片附件]',
            }
          })

          const fallbackBody = {
            ...body,
            messages: sanitizedMessages,
          }

          response = await fetch(resolveOpenAIChatURL(this.baseURL), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fallbackBody),
          })

          raw = await response.text()
          try { data = raw ? JSON.parse(raw) : {} } catch { /* keep raw error */ }
        }
      }

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
    createStream: (params: AiMessageCreateParams) => this.streamInternal(params),
  }

  private async *streamInternal(params: AiMessageCreateParams): AsyncGenerator<AiStreamChunk> {
      const messages: Array<Record<string, unknown>> = []
      if (params.system) messages.push({ role: 'system', content: params.system })
      messages.push(...convertOpenAIMessages(params.messages))

      const hasImageParts = messages.some(
        m => Array.isArray(m.content) && (m.content as any[]).some(p => p.type === 'image_url')
      )
      // 含图片附件时复用 create() 内置的多模态降级重试逻辑
      if (hasImageParts) {
        const fallbackRes = await this.messages.create(params)
        for (const blk of fallbackRes.content) {
          if (blk.type === 'text' && blk.text) {
            yield { type: 'text_delta', text: blk.text }
          }
        }
        yield { type: 'final', content: fallbackRes.content, usage: fallbackRes.usage }
        return
      }

      const body: Record<string, unknown> = {
        model: params.model,
        messages,
        max_tokens: params.max_tokens,
        stream: true,
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

      if (!response.ok || !response.body) {
        const raw = await response.text().catch(() => '')
        let data: any = {}
        try { data = raw ? JSON.parse(raw) : {} } catch {}
        const message = data?.error?.message || raw || `HTTP ${response.status}`
        const error = new Error(message) as Error & { status?: number }
        error.status = response.status
        throw error
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('event-stream')) {
        const data: any = await response.json()
        const choice = data?.choices?.[0]?.message
        const content: AiContentBlock[] = []
        const text = normalizeOpenAIContent(choice?.content)
        if (text) {
          yield { type: 'text_delta', text }
          content.push({ type: 'text', text })
        }
        for (const toolCall of choice?.tool_calls || []) {
          let input: Record<string, unknown> = {}
          try { input = JSON.parse(toolCall.function?.arguments || '{}') } catch {}
          content.push({
            type: 'tool_use',
            id: toolCall.id || `call_${Date.now()}`,
            name: toolCall.function?.name || '',
            input,
          })
        }
        yield { type: 'final', content }
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullText = ''
      const toolCallsAccum = new Map<number, { id: string; name: string; args: string }>()
      let usage: AiUsage | undefined

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const rawLine of lines) {
          const line = rawLine.trim()
          if (!line.startsWith('data:')) continue
          const payload = line.slice(5).trim()
          if (!payload || payload === '[DONE]') continue
          try {
            const parsed = JSON.parse(payload)
            if (parsed?.usage) {
              usage = {
                prompt_tokens: Number(parsed.usage.prompt_tokens || 0),
                completion_tokens: Number(parsed.usage.completion_tokens || 0),
                total_tokens: Number(
                  parsed.usage.total_tokens ||
                    (Number(parsed.usage.prompt_tokens || 0) + Number(parsed.usage.completion_tokens || 0))
                ),
              }
            }
            const delta = parsed?.choices?.[0]?.delta
            if (!delta) continue
            if (typeof delta.content === 'string' && delta.content.length > 0) {
              fullText += delta.content
              yield { type: 'text_delta', text: delta.content }
            }
            if (Array.isArray(delta.tool_calls)) {
              for (const tc of delta.tool_calls) {
                const idx = typeof tc.index === 'number' ? tc.index : 0
                const cur = toolCallsAccum.get(idx) || { id: '', name: '', args: '' }
                if (tc.id) cur.id = tc.id
                if (tc.function?.name) cur.name += tc.function.name
                if (tc.function?.arguments) cur.args += tc.function.arguments
                toolCallsAccum.set(idx, cur)
              }
            }
          } catch {}
        }
      }

      const finalBlocks: AiContentBlock[] = []
      if (fullText) finalBlocks.push({ type: 'text', text: fullText })
      for (const [, tc] of toolCallsAccum) {
        if (!tc.name) continue
        let input: Record<string, unknown> = {}
        try { input = JSON.parse(tc.args || '{}') } catch {}
        finalBlocks.push({
          type: 'tool_use',
          id: tc.id || `call_${Date.now()}`,
          name: tc.name,
          input,
        })
      }
      yield { type: 'final', content: finalBlocks, usage }
  }

  constructor(
    private readonly apiKey: string,
    private readonly baseURL: string,
  ) {}
}

function normalizeAnthropicResponseContent(rawContent: any[]): AiContentBlock[] {
  if (!Array.isArray(rawContent)) return []
  const textBlocks: any[] = []
  const otherBlocks: any[] = []
  const thinkingTexts: string[] = []

  for (const b of rawContent) {
    if (b?.type === 'text') {
      textBlocks.push(b)
    } else {
      if (b?.type === 'thinking' && (b.thinking || b.text)) {
        thinkingTexts.push(String(b.thinking || b.text))
      }
      otherBlocks.push(b)
    }
  }

  // 确保 text 块排在数组首位，彻底消除 DeepSeek Anthropic 协议将 thinking 块置于 content[0] 导致业务侧取空的问题
  if (textBlocks.length > 0) {
    return [...textBlocks, ...otherBlocks] as AiContentBlock[]
  }
  const hasToolUse = otherBlocks.some(b => b?.type === 'tool_use')
  if (!hasToolUse && thinkingTexts.length > 0) {
    return [{ type: 'text', text: thinkingTexts.join('\n\n') }, ...otherBlocks] as AiContentBlock[]
  }
  return otherBlocks as AiContentBlock[]
}

export function createAiClient(config: AiConfig): AiClient {
  if (resolveProvider(config) === 'openai-compatible') {
    const oai = new OpenAICompatibleClient(config.apiKey, config.baseURL)
    return oai
  }

  const rawClient = new Anthropic({ apiKey: config.apiKey, baseURL: config.baseURL })
  return {
    messages: {
      async create(params: AiMessageCreateParams) {
        const res = await rawClient.messages.create(params as any)
        const normalizedContent = normalizeAnthropicResponseContent((res as any).content || [])
        const u = (res as any).usage
        const usage: AiUsage | undefined = u
          ? {
              prompt_tokens: Number(u.input_tokens || u.prompt_tokens || 0),
              completion_tokens: Number(u.output_tokens || u.completion_tokens || 0),
              total_tokens: Number(
                u.total_tokens || (Number(u.input_tokens || 0) + Number(u.output_tokens || 0))
              ),
            }
          : undefined
        return { content: normalizedContent, usage }
      },
      async *createStream(params: AiMessageCreateParams): AsyncGenerator<AiStreamChunk> {
        const stream = rawClient.messages.stream(params as any)
        for await (const event of stream as any) {
          if (
            event?.type === 'content_block_delta' &&
            event?.delta?.type === 'text_delta' &&
            typeof event.delta.text === 'string' &&
            event.delta.text.length > 0
          ) {
            yield { type: 'text_delta', text: event.delta.text }
          }
        }
        const finalMsg: any = await stream.finalMessage()
        const normalizedContent = normalizeAnthropicResponseContent(finalMsg?.content || [])
        const u = finalMsg?.usage
        const usage: AiUsage | undefined = u
          ? {
              prompt_tokens: Number(u.input_tokens || u.prompt_tokens || 0),
              completion_tokens: Number(u.output_tokens || u.completion_tokens || 0),
              total_tokens: Number(
                u.total_tokens || (Number(u.input_tokens || 0) + Number(u.output_tokens || 0))
              ),
            }
          : undefined
        yield { type: 'final', content: normalizedContent, usage }
      },
    },
  }
}

export function getAiProvider(config?: AiConfig): AiProvider | null {
  return config ? resolveProvider(config) : null
}
