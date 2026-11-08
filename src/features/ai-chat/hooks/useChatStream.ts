import { useState, useRef, useCallback } from 'react'

export interface StreamMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: number
  agentId?: string
  model?: string
  toolCalls?: Array<{
    tool?: string
    name?: string
    input?: Record<string, unknown>
    args?: Record<string, unknown>
    output?: unknown
    result?: unknown
    success?: boolean
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface SendMessageOptions {
  message: string
  messages: StreamMessage[]
  agentId?: string
  systemPrompt?: string
  provider?: string
  model?: string
  cwd?: string
  skills?: string[]
  onChunk?: (delta: string, full: string) => void
  onToolCall?: (toolCall: any) => void
  onFinished?: (completeText: string) => void
  onError?: (err: Error) => void
}

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
    }
  }, [])

  const sendStreamMessage = useCallback(async (options: SendMessageOptions): Promise<string> => {
    abortStream()
    const controller = new AbortController()
    abortControllerRef.current = controller
    setIsStreaming(true)

    let fullText = ''

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('coreforge_token') || ''}`,
        },
        body: JSON.stringify({
          message: options.message,
          history: options.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          agentId: options.agentId,
          systemPrompt: options.systemPrompt,
          provider: options.provider,
          model: options.model,
          cwd: options.cwd,
          skills: options.skills,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`AI 服务响应异常: HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('当前环境不支持流式响应 Reader')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data:')) continue

          const jsonStr = trimmed.slice(5).trim()
          if (jsonStr === '[DONE]') continue

          try {
            const data = JSON.parse(jsonStr)
            if (data.type === 'points_updated' && typeof data.points === 'number') {
              window.dispatchEvent(new CustomEvent('points-updated', { detail: { points: data.points } }))
            }
            if (data.delta || data.text) {
              const delta = data.delta || data.text
              fullText += delta
              options.onChunk?.(delta, fullText)
            }
            if (data.toolCall) {
              options.onToolCall?.(data.toolCall)
            }
          } catch {
            // 忽略非 JSON 帧
          }
        }
      }

      options.onFinished?.(fullText)
      return fullText
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return fullText
      }
      options.onError?.(err)
      throw err
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [abortStream])

  return {
    isStreaming,
    sendStreamMessage,
    abortStream,
  }
}

export default useChatStream
