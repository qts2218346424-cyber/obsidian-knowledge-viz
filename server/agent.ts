import Anthropic from '@anthropic-ai/sdk'
import { scanVault, getFile, getTree, createFile, updateFile, type VaultNote } from './vault-parser.js'
import type { AiClient, AiMessageCreateParams } from './ai-client.js'

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
    name: 'create_error_note',
    description: '在知识库错题本(wiki/03-真题与错题/)中归档一道错题及其解析和错因分析',
    input_schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: '科目，如 高等数学、线性代数、概率论、数据结构、操作系统等' },
        title: { type: 'string', description: '错题简短标题或核心考点' },
        question: { type: 'string', description: '完整题目题干与选项' },
        errorReason: { type: 'string', description: '错因分析或诊断，如 概念不清/公式记错/计算失误/审题疏忽' },
        solution: { type: 'string', description: '正确解法、分步推导与防错提醒' },
      },
      required: ['subject', 'title', 'question', 'solution'],
    },
  },
  {
    name: 'organize_vault',
    description: '扫描知识库结构并输出知识体系健康度、孤立笔记与重构建议',
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
      case 'create_error_note': {
        const domain = (input.subject?.includes('数学') || input.subject?.includes('数') || input.subject?.includes('代') || input.subject?.includes('率')) ? 'math' : 'cs_408'
        const subFolder = domain === 'math' ? '数学错题本' : '408错题本'
        const now = new Date()
        const dateStr = now.toISOString().split('T')[0]
        const safeTitle = (input.title || '错题').replace(/[\\/:*?"<>|]/g, '_')
        const targetPath = `wiki/03-真题与错题/${subFolder}/${dateStr}-${safeTitle}-${Date.now().toString().slice(-4)}.md`
        const content = `# ❌ 错题复盘：${input.title}

## 1. 题目
* **科目**：${input.subject}
* **归档时间**：${dateStr}

### 题干：
${input.question}

## 2. 错因诊断
> [!CAUTION]
> 诊断分析：${input.errorReason || '概念不清'}

## 3. 正确解法与严谨推导
${input.solution}

## 4. 关联考点
- [ ] 对应考点：[[${input.subject}]]
`
        try {
          createFile(vaultPath, targetPath, content, {
            type: 'error_log',
            domain,
            subject: input.subject,
            error_type: input.errorReason || '概念不清',
            status: 'active',
            tags: ['错题', domain, input.subject]
          })
        } catch {
          updateFile(vaultPath, targetPath, content)
        }
        return { toolName, input, output: `错题已成功归档到知识库: ${targetPath}`, success: true }
      }
      case 'organize_vault': {
        const notes = getNotes(vaultPath)
        const unlinked = notes.filter(n => (n.links?.length || 0) === 0 && (n.backlinks?.length || 0) === 0).map(n => n.title).slice(0, 5)
        const shortNotes = notes.filter(n => n.wordCount < 100).map(n => n.title).slice(0, 5)
        return {
          toolName,
          input,
          output: `知识库结构分析完成：
- 笔记总数：${notes.length} 篇
- 孤立无链接笔记：${unlinked.length > 0 ? unlinked.join(', ') : '无'}
- 篇幅过短待补充笔记：${shortNotes.length > 0 ? shortNotes.join(', ') : '无'}
建议：为孤立笔记补充双向链接 [[...]]，将重要错题笔记与核心定理笔记双向互联。`,
          success: true
        }
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
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error' | 'usage'
  content?: string
  tool?: string
  input?: Record<string, any>
  output?: string
  success?: boolean
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

const SYSTEM_PROMPT = `你是 CoreForge 研核「研小核」考研智能伴学桌宠兼知识库管家（具备类似 Obsidian Claudian 的全自主 Agent 笔记管理能力）。
你不仅能与学生亲切交流、答疑解惑、督促复习，还可以使用管理工具直接查询、管理和更新用户的本地 Obsidian Vault 知识库（408计算机与考研数学）。

你的核心能力工具箱：
1. **read_file** — 查看指定笔记的完整 Markdown 内容
2. **write_file** — 创建新笔记或更新已有笔记（严格采用标准 Markdown 格式，规范使用 KaTeX LaTeX $...$ 或 $$...$$ 表达公式）
3. **search_notes** — 在知识库中根据考点或关键词精准检索
4. **list_files** — 浏览整个知识库的文件与目录结构
5. **get_stats** — 获取知识库全局统计信息（笔记数、标签分布、词数等）
6. **create_error_note** — 一键将错题、解析与四维错因诊断归档至 wiki/03-真题与错题/
7. **organize_vault** — 诊断知识库健康度并给出分类、双链与重构建议

操作准则：
- 当用户要求修改或补充某篇笔记时，先使用 read_file 查看原内容，再调用 write_file 写回
- 创建笔记时注意关联到对应的学科分支（如 01-考研数学/高等数学 或 02-408计算机）
- 语气热情、亲和、严谨，做懂学生的专属考研伙伴！`

export async function* runAgentLoop(
  anthropic: AiClient,
  model: string,
  messages: { role: 'user' | 'assistant'; content: any }[],
  vaultPath: string,
): AsyncGenerator<AgentEvent> {
  const systemPrompt = SYSTEM_PROMPT

  // Convert tool definitions to Anthropic format
  const tools: NonNullable<AiMessageCreateParams['tools']> = AGENT_TOOLS.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }))

  let conversationMessages = [...messages]
  const maxIterations = 12 // Allow multi-step research without allowing unbounded loops
  let lastToolSignature = ''
  let repeatedToolBatchCount = 0

  const finishWithCollectedContext = async function* () {
    const finalResponse = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: `${systemPrompt}

你已经收集到足够的知识库信息。现在停止调用工具，直接基于已经返回的工具结果给用户一个完整、简洁、可执行的总结。
如果信息不完整，请明确说明已经确认的内容和还需要补充的内容。不要再次调用工具。`,
      messages: conversationMessages as Anthropic.MessageParam[],
    })
    const finalText = finalResponse.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim()
    if (finalText) yield { type: 'text' as const, content: finalText }
    yield { type: 'done' as const }
  }

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: conversationMessages as Anthropic.MessageParam[],
        tools: tools.length > 0 ? tools : undefined,
      })

      if ((response as any).usage) {
        const u = (response as any).usage
        yield {
          type: 'usage',
          usage: {
            prompt_tokens: Number(u.prompt_tokens || u.input_tokens || 0),
            completion_tokens: Number(u.completion_tokens || u.output_tokens || 0),
            total_tokens: Number(u.total_tokens || ((u.prompt_tokens || u.input_tokens || 0) + (u.completion_tokens || u.output_tokens || 0))),
          }
        }
      }

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

      const toolSignature = toolCalls
        .map(call => `${call.name}:${JSON.stringify(call.input || {})}`)
        .join('|')
      if (toolSignature && toolSignature === lastToolSignature) {
        repeatedToolBatchCount += 1
      } else {
        lastToolSignature = toolSignature
        repeatedToolBatchCount = 1
      }

      // Some OpenAI-compatible models repeat the same tool batch after receiving
      // valid results. Stop the loop and ask for a final answer instead of
      // showing the user an iteration-limit message.
      if (repeatedToolBatchCount >= 2) {
        try {
          for await (const event of finishWithCollectedContext()) yield event
        } catch (finalErr: any) {
          yield { type: 'error', content: finalErr.message }
        }
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

  try {
    for await (const event of finishWithCollectedContext()) yield event
  } catch (finalErr: any) {
    yield { type: 'error', content: finalErr.message }
  }
}
