import { useState, useMemo } from 'react'
import {
  Wrench,
  Search,
  FileText,
  Edit3,
  BarChart2,
  Share2,
  FolderTree,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Terminal,
  Globe,
  ChevronDown,
  Copy,
  Check,
  Brain,
  ShieldCheck,
  Code2,
  Zap,
} from 'lucide-react'

export interface ToolCallInfo {
  tool: string
  input: Record<string, any>
  output?: string
  success?: boolean
}

interface ToolCallCardProps {
  toolCall: ToolCallInfo
  defaultExpanded?: boolean
}

/**
 * 工具中文名称与图标映射定义
 */
function getToolMeta(toolName: string) {
  const name = (toolName || '').toLowerCase()

  if (name.includes('search_notes') || name.includes('search_web')) {
    return {
      title: name.includes('web') ? '全网实时检索' : '检索笔记知识库',
      icon: Search,
      badgeColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    }
  }
  if (name.includes('read_note') || name.includes('read_url')) {
    return {
      title: name.includes('url') ? '读取网页内容' : '读取知识库笔记',
      icon: FileText,
      badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    }
  }
  if (name.includes('write_note') || name.includes('save_note')) {
    return {
      title: '写入知识库笔记',
      icon: Edit3,
      badgeColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    }
  }
  if (name.includes('vault_stats')) {
    return {
      title: '获取图谱统计数据',
      icon: BarChart2,
      badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    }
  }
  if (name.includes('note_graph')) {
    return {
      title: '构建笔记关联图谱',
      icon: Share2,
      badgeColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    }
  }
  if (name.includes('notes_tree') || name.includes('list_tree')) {
    return {
      title: '遍历笔记目录树',
      icon: FolderTree,
      badgeColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    }
  }
  if (name.includes('create_error_note')) {
    return {
      title: '沉淀错题记录本',
      icon: AlertTriangle,
      badgeColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    }
  }
  if (name.includes('command') || name.includes('bash') || name.includes('terminal')) {
    return {
      title: '执行系统命令',
      icon: Terminal,
      badgeColor: 'text-slate-600 bg-slate-500/10 border-slate-500/20',
    }
  }
  if (name.includes('claude_critic')) {
    return {
      title: '批评家独立研审',
      icon: Brain,
      badgeColor: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20',
    }
  }
  if (name.includes('workbuddy_auditor')) {
    return {
      title: '审计官合规审查',
      icon: ShieldCheck,
      badgeColor: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    }
  }
  if (name.includes('qoder_specialist')) {
    return {
      title: '算法特派员攻坚',
      icon: Code2,
      badgeColor: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20',
    }
  }
  if (name.includes('codex_worker')) {
    return {
      title: '执行员并行求解',
      icon: Zap,
      badgeColor: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    }
  }

  return {
    title: `调用工具: ${toolName}`,
    icon: Wrench,
    badgeColor: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  }
}

/**
 * 提取常用工具入参关键信息预览
 */
function getSummary(input: Record<string, any>): string {
  if (!input || typeof input !== 'object') return ''
  if (input.query) return `"${input.query}"`
  if (input.path) return `"${input.path}"`
  if (input.title) return `"${input.title}"`
  if (input.command) return `"${input.command}"`
  if (input.url) return `"${input.url}"`
  if (input.prompt) return `"${input.prompt.slice(0, 30)}..."`

  const keys = Object.keys(input)
  if (keys.length === 0) return ''
  const firstKey = keys[0]
  const val = String(input[firstKey])
  return `${firstKey}: "${val.length > 25 ? val.slice(0, 25) + '...' : val}"`
}

/**
 * 顶级智能体工具调用折叠卡片组件 (Agent-Grade Tool Call Card)
 */
export function ToolCallCard({ toolCall, defaultExpanded = false }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [copiedInput, setCopiedInput] = useState(false)
  const [copiedOutput, setCopiedOutput] = useState(false)

  const meta = useMemo(() => getToolMeta(toolCall.tool), [toolCall.tool])
  const summary = useMemo(() => getSummary(toolCall.input), [toolCall.input])
  const IconComponent = meta.icon

  const formattedInput = useMemo(() => {
    try {
      return JSON.stringify(toolCall.input || {}, null, 2)
    } catch {
      return String(toolCall.input || '')
    }
  }, [toolCall.input])

  const copyInput = () => {
    navigator.clipboard.writeText(formattedInput)
    setCopiedInput(true)
    setTimeout(() => setCopiedInput(false), 1800)
  }

  const copyOutput = () => {
    if (!toolCall.output) return
    navigator.clipboard.writeText(toolCall.output)
    setCopiedOutput(true)
    setTimeout(() => setCopiedOutput(false), 1800)
  }

  const isRunning = toolCall.success === undefined
  const isSuccess = toolCall.success === true
  const isFailed = toolCall.success === false

  return (
    <div className="my-2 rounded-xl border border-cream-300/80 dark:border-slate-800 bg-surface dark:bg-slate-900/90 shadow-2xs overflow-hidden transition-all text-xs">
      {/* 头部点击栏 */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-cream-100/50 hover:bg-cream-200/50 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-colors select-none cursor-pointer text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* 工具图标 */}
          <div className={`p-1.5 rounded-lg border shrink-0 ${meta.badgeColor}`}>
            <IconComponent className="w-3.5 h-3.5" />
          </div>

          {/* 工具名称与摘要 */}
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-warm-900 dark:text-slate-100 truncate">
              {meta.title}
            </span>
            <span className="text-[10px] text-warm-400 dark:text-slate-500 font-mono hidden sm:inline">
              ({toolCall.tool})
            </span>
            {summary && (
              <span className="text-[11px] text-warm-500 dark:text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs bg-cream-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                {summary}
              </span>
            )}
          </div>
        </div>

        {/* 右侧状态微标与展开箭头 */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {isRunning && (
            <span className="flex items-center gap-1 text-[10px] text-accent-orange font-medium bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>调用中...</span>
            </span>
          )}
          {isSuccess && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>已完成</span>
            </span>
          )}
          {isFailed && (
            <span className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span>执行失败</span>
            </span>
          )}

          <ChevronDown
            className={`w-3.5 h-3.5 text-warm-400 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* 展开的详情面板 */}
      {expanded && (
        <div className="p-3 border-t border-cream-200 dark:border-slate-800 space-y-2.5 bg-cream-50/40 dark:bg-slate-950/40">
          {/* 输入参数模块 */}
          <div>
            <div className="flex items-center justify-between mb-1 text-[11px] font-medium text-warm-500 dark:text-slate-400">
              <span>调用入参 (Parameters):</span>
              <button
                type="button"
                onClick={copyInput}
                className="hover:text-warm-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="复制参数 JSON"
              >
                {copiedInput ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>复制参数</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-[#0d1117] text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-48 border border-slate-800">
              <code>{formattedInput}</code>
            </pre>
          </div>

          {/* 执行结果模块 */}
          {toolCall.output !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-1 text-[11px] font-medium text-warm-500 dark:text-slate-400">
                <span>执行返回 (Output):</span>
                <button
                  type="button"
                  onClick={copyOutput}
                  className="hover:text-warm-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  title="复制返回结果"
                >
                  {copiedOutput ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>复制结果</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-2.5 rounded-lg bg-[#0d1117] text-slate-200 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-56 border border-slate-800 whitespace-pre-wrap">
                <code>{toolCall.output || '(无文本输出)'}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ToolCallCard
