import Anthropic from '@anthropic-ai/sdk'
import { scanVault, getFile, getTree, createFile, updateFile, type VaultNote } from './vault-parser.js'

// ===== Tool Definitions =====

export interface AgentTool {
  name: string
  description: string
  input_schema: Record<string, any>
}

export const AGENT_TOOLS: AgentTool[] = [
  {
    name: 'read_file',
    description: '读取 vault 中的笔记文件内容',
    input_schema: {
      type: 'object',
      properties: { path: { type: 'string', description: '笔记的相对路径' } },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: '创建或更新 vault 中的笔记文件',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '笔记的相对路径' },
        content: { type: 'string', description: 'Markdown 内容' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'search_notes',
    description: '搜索知识库中的笔记，返回匹配结果',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string', description: '搜索关键词' } },
      required: ['query'],
    },
  },
  {
    name: 'list_files',
    description: '列出 vault 中的目录结构',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_stats',
    description: '获取 vault 的统计信息（笔记数、标签数、字数等）',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
]

// ===== Tool Execution =====

export interface ToolResult {
  toolName: string
  input: Record<string, any>
  output: string
  success: boolean
}

let cachedNotes: VaultNote[] | null = null
let cacheTime = 0

function getNotes(vaultPath: string): VaultNote[] {
  const now = Date.now()
  if (cachedNotes && now - cacheTime < 10000) return cachedNotes
  cachedNotes = scanVault(vaultPath)
  cacheTime = now
  return cachedNotes
}

export function executeTool(toolName: string, input: Record<string, any>, vaultPath: string): ToolResult {
  try {
    switch (toolName) {
      case 'read_file': {
        const note = getFile(vaultPath, input.path)
        if (!note) return { toolName, input, output: `文件未找到: ${input.path}`, success: false }
        return {
          toolName, input,
          output: `标题: ${note.title}\n路径: ${note.path}\n标签: ${note.tags.join(', ')}\n\n${note.content.substring(0, 4000)}`,
          success: true,
        }
      }
      case 'write_file': {
        try {
          updateFile(vaultPath, input.path, input.content)
        } catch {
          createFile(vaultPath, input.path, input.content)
        }
        return { toolName, input, output: `文件已保存: ${input.path}`, success: true }
      }
      case 'search_notes': {
        const notes = getNotes(vaultPath)
        const query = input.query.toLowerCase()
        const tokens = query.split(/\s+/).filter(Boolean)
        const results = notes
          .map(note => {
            let score = 0
            const titleLower = note.title.toLowerCase()
            const contentLower = note.content.toLowerCase()
            for (const t of tokens) {
              if (titleLower.includes(t)) score += 5
              if (contentLower.includes(t)) score += 1
            }
            return { note, score }
          })
          .filter(r => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)

        if (results.length === 0) {
          return { toolName, input, output: '未找到匹配的笔记', success: true }
        }
        const output = results.map(r =>
          `- **${r.note.title}** (${r.note.path}) [${r.note.wordCount}字] 标签: ${r.note.tags.slice(0, 3).join(', ')}`
        ).join('\n')
        return { toolName, input, output: `找到 ${results.length} 个结果:\n${output}`, success: true }
      }
      case 'list_files': {
        const tree = getTree(vaultPath)
        function flattenTree(nodes: any[], prefix = ''): string[] {
          const lines: string[] = []
          for (const node of nodes) {
            const icon = node.type === 'folder' ? '📁' : '📄'
            lines.push(`${prefix}${icon} ${node.name}`)
            if (node.children) lines.push(...flattenTree(node.children, prefix + '  '))
          }
          return lines
        }
        const output = flattenTree(tree).slice(0, 100).join('\n')
        return { toolName, input, output, success: true }
      }
      case 'get_stats': {
        const notes = getNotes(vaultPath)
        const totalWords = notes.reduce((sum, n) => sum + n.wordCount, 0)
        const allTags = new Set(notes.flatMap(n => n.tags))
        const output = `笔记总数: ${notes.length}\n总字数: ${totalWords}\n标签数: ${allTags.size}\n平均每篇: ${Math.round(totalWords / Math.max(notes.length, 1))} 字`
        return { toolName, input, output, success: true }
      }
      default:
        return { toolName, input, output: `未知工具: ${toolName}`, success: false }
    }
  } catch (err: any) {
    return { toolName, input, output: `工具执行错误: ${err.message}`, success: false }
  }
}

// ===== Agent Loop =====

export interface AgentEvent {
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error'
  content?: string
  tool?: string
  input?: Record<string, any>
  output?: string
  success?: boolean
}

const SYSTEM_PROMPT = `你是 Knowledge Viz 知识库 AI 助手，一个专门为 Obsidian 知识库服务的智能代理。

你的能力：
1. **读取笔记** — 使用 read_file 工具查看任何笔记的内容
2. **写入笔记** — 使用 write_file 工具创建新笔记或更新现有笔记
3. **搜索笔记** — 使用 search_notes 工具在知识库中搜索相关内容
4. **浏览目录** — 使用 list_files 工具查看 vault 的文件结构
5. **查看统计** — 使用 get_stats 工具获取知识库统计信息

规则：
- 操作文件前先用 read_file 确认内容
- 创建笔记时使用 Markdown 格式，包含 YAML frontmatter
- 搜索时优先使用关键词，不要用完整句子搜索
- 回答使用中文，简洁准确
- 当用户要求修改笔记时，先读取原内容，修改后写回
- 每次操作后简要告知用户结果

请主动使用工具来帮助用户完成任务，不要只是建议用户自己操作。`

export async function* runAgentLoop(
  anthropic: Anthropic,
  model: string,
  messages: { role: 'user' | 'assistant'; content: any }[],
  vaultPath: string,
): AsyncGenerator<AgentEvent> {
  const systemPrompt = SYSTEM_PROMPT

  // Convert tool definitions to Anthropic format
  const tools: Anthropic.Tool[] = AGENT_TOOLS.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema as Anthropic.Tool.InputSchema,
  }))

  let conversationMessages = [...messages]
  let maxIterations = 10 // Prevent infinite loops

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: conversationMessages as Anthropic.MessageParam[],
        tools: tools.length > 0 ? tools : undefined,
      })

      // Process response blocks
      let hasToolUse = false
      const textParts: string[] = []
      const toolCalls: { id: string; name: string; input: Record<string, any> }[] = []

      for (const block of response.content) {
        if (block.type === 'text') {
          textParts.push(block.text)
        } else if (block.type === 'tool_use') {
          hasToolUse = true
          toolCalls.push({
            id: block.id,
            name: block.name,
            input: block.input as Record<string, any>,
          })
        }
      }

      // Emit text
      if (textParts.length > 0) {
        yield { type: 'text', content: textParts.join('\n') }
      }

      // If no tool use, we're done
      if (!hasToolUse) {
        yield { type: 'done' }
        return
      }

      // Execute tools and emit events
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const call of toolCalls) {
        yield { type: 'tool_call', tool: call.name, input: call.input }

        const result = executeTool(call.name, call.input, vaultPath)
        yield { type: 'tool_result', tool: call.name, output: result.output, success: result.success }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: call.id,
          content: result.output,
          is_error: !result.success,
        })
      }

      // Append assistant response and tool results to conversation
      conversationMessages.push({
        role: 'assistant',
        content: response.content as any,
      })
      conversationMessages.push({
        role: 'user',
        content: toolResults,
      })

    } catch (err: any) {
      // If tool use is not supported by this model, fall back to text-based approach
      if (err.message?.includes('tool') || err.message?.includes('tools')) {
        // Retry without tools
        try {
          const fallbackResponse = await anthropic.messages.create({
            model,
            max_tokens: 2048,
            system: systemPrompt + '\n\n注意：工具调用不可用，请直接基于你的知识回答用户的问题。如果用户需要操作文件，请给出具体的操作建议。',
            messages: messages as Anthropic.MessageParam[],
          })

          if (fallbackResponse.content[0].type === 'text') {
            yield { type: 'text', content: fallbackResponse.content[0].text }
          }
          yield { type: 'done' }
          return
        } catch (fallbackErr: any) {
          yield { type: 'error', content: fallbackErr.message }
          return
        }
      }

      yield { type: 'error', content: err.message }
      return
    }
  }

  yield { type: 'text', content: '\n\n(已达到最大交互轮次)' }
  yield { type: 'done' }
}
