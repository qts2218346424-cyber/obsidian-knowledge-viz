import { useMemo, useState, useCallback, useRef } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  type Node, type Edge, type NodeTypes, Handle, Position
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import {
  FileInput, Cog, Search, Link, Binary, CheckCircle,
  Lightbulb, Globe, Puzzle, Archive,
  FolderSearch, ShieldCheck, FileText, Wrench,
  Upload, Play, Loader2, AlertTriangle, Check
} from 'lucide-react'
import { api, type IngestResult, type ResearchGap, type LintFixResult } from '../services/api'
import { useVaultHealth } from '../hooks/useVaultData'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PipelineStep {
  id: string
  label: string
  desc: string
  icon: string
  status: 'done' | 'active' | 'pending'
  detail?: string
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  FileInput, Cog, Search, Link, Binary, CheckCircle,
  Lightbulb, Globe, Puzzle, Archive,
  FolderSearch, ShieldCheck, FileText, Wrench,
}

// ─── Step Node ────────────────────────────────────────────────────────────────

const statusStyles = {
  done: {
    bg: 'bg-accent-sage/10', border: 'border-accent-sage/30',
    iconBg: 'bg-accent-sage/15', iconColor: 'text-accent-sage',
    labelColor: 'text-accent-sage',
    badge: 'bg-accent-sage/10 text-accent-sage border-accent-sage/20',
    badgeText: '已完成', glow: 'shadow-accent-sage/10',
  },
  active: {
    bg: 'bg-accent-orange/10', border: 'border-accent-orange/30',
    iconBg: 'bg-accent-orange/15', iconColor: 'text-accent-orange',
    labelColor: 'text-accent-orange',
    badge: 'bg-accent-orange/10 text-accent-orange border-accent-orange/30',
    badgeText: '进行中', glow: 'shadow-accent-orange/20 shadow-lg',
  },
  pending: {
    bg: 'bg-cream-200/50', border: 'border-cream-300/40',
    iconBg: 'bg-cream-200', iconColor: 'text-warm-400',
    labelColor: 'text-warm-400',
    badge: '', badgeText: '', glow: '',
  },
}

function StepNode({ data }: { data: any }) {
  const s = statusStyles[data.status as keyof typeof statusStyles]
  const IconComp = iconMap[data.icon] || Cog

  return (
    <div className={`px-4 py-3 rounded-xl border ${s.bg} ${s.border} ${s.glow} min-w-[200px] transition-all`}>
      <Handle type="target" position={Position.Top} className="!bg-cream-300 !w-2 !h-2 !border-0" />
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}>
          <IconComp className={`w-4 h-4 ${s.iconColor}`} />
        </div>
        <div>
          <div className={`text-sm font-medium ${s.labelColor}`}>{data.label}</div>
          <div className="text-[11px] text-warm-400 mt-0.5">{data.desc}</div>
        </div>
      </div>
      {data.status === 'active' && (
        <div className={`inline-flex mt-2 px-2 py-0.5 rounded-md border text-[10px] ${s.badge}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse mr-1.5 mt-1" />
          {s.badgeText}
        </div>
      )}
      {data.status === 'done' && data.detail && (
        <div className="mt-2 text-[10px] text-accent-sage/80">{data.detail}</div>
      )}
      {data.status === 'done' && !data.detail && (
        <div className={`inline-flex mt-2 px-2 py-0.5 rounded-md border text-[10px] ${s.badge}`}>
          {s.badgeText}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-cream-300 !w-2 !h-2 !border-0" />
    </div>
  )
}

const nodeTypes: NodeTypes = { stepNode: StepNode }

// ─── Dagre Layout ─────────────────────────────────────────────────────────────

function getLayoutedElements(steps: PipelineStep[]) {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 70 })

  const nodeWidth = 240
  const nodeHeight = 90

  steps.forEach(step => g.setNode(step.id, { width: nodeWidth, height: nodeHeight }))
  for (let i = 0; i < steps.length - 1; i++) {
    g.setEdge(steps[i].id, steps[i + 1].id)
  }

  dagre.layout(g)

  const nodes: Node[] = steps.map(step => {
    const pos = g.node(step.id)
    return {
      id: step.id,
      type: 'stepNode',
      position: { x: (pos.x || 0) - nodeWidth / 2, y: (pos.y || 0) - nodeHeight / 2 },
      data: { ...step },
    }
  })

  const edges: Edge[] = []
  for (let i = 0; i < steps.length - 1; i++) {
    edges.push({
      id: `e-${steps[i].id}-${steps[i + 1].id}`,
      source: steps[i].id,
      target: steps[i + 1].id,
      type: 'smoothstep',
      style: {
        stroke: steps[i].status === 'done' ? '#7A9B6D' : '#D4B896',
        strokeWidth: steps[i].status === 'done' ? 2 : 1.5,
      },
      animated: steps[i + 1].status === 'active',
    })
  }

  return { nodes, edges }
}

// ─── Delay helper ─────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── Ingestion Pipeline ───────────────────────────────────────────────────────

const initialIngestionSteps: PipelineStep[] = [
  { id: '1', label: '文档输入', desc: '选择并上传文件', icon: 'FileInput', status: 'pending' },
  { id: '2', label: '解析 & 转换', desc: 'markitdown 转 Markdown', icon: 'Cog', status: 'pending' },
  { id: '3', label: 'AI 实体抽取', desc: 'LLM 提取关键实体和标签', icon: 'Search', status: 'pending' },
  { id: '4', label: '交叉引用', desc: '匹配已有笔记生成 Wikilinks', icon: 'Link', status: 'pending' },
  { id: '5', label: '标签生成', desc: 'AI 分类标签', icon: 'Binary', status: 'pending' },
  { id: '6', label: '写入 Wiki', desc: '生成 Markdown 文件到 Vault', icon: 'CheckCircle', status: 'pending' },
]

function IngestionPanel() {
  const [steps, setSteps] = useState<PipelineStep[]>(initialIngestionSteps)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateStep = useCallback((id: string, patch: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const resetSteps = () => {
    setSteps(initialIngestionSteps)
    setResult(null)
    setError('')
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setRunning(true)
    setError('')
    setResult(null)
    resetSteps()

    try {
      // Step 1: Document input
      updateStep('1', { status: 'active' })
      await delay(500)
      updateStep('1', { status: 'done', detail: file.name })

      // Step 2-6: Backend handles everything in one call
      updateStep('2', { status: 'active' })

      const res = await api.uploadFile(file)

      // Mark remaining steps as done based on result
      updateStep('2', { status: 'done', detail: 'markitdown 转换完成' })
      await delay(200)

      updateStep('3', { status: 'done', detail: `${res.entities.length} 个实体` })
      await delay(200)

      updateStep('4', { status: 'done', detail: `${res.wikilinks} 条交叉引用` })
      await delay(200)

      updateStep('5', { status: 'done', detail: res.tags.join(', ') || '已生成' })
      await delay(200)

      updateStep('6', { status: 'done', detail: res.markdownPath })

      setResult(res)
    } catch (err: any) {
      setError(err.message)
      // Mark current active step as failed
      setSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'pending', desc: 'Failed' } : s))
    } finally {
      setRunning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const { nodes, edges } = useMemo(() => getLayoutedElements(steps), [steps])

  return (
    <div className="bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-cream-200 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-warm-700">文档摄取 Pipeline</div>
          <div className="text-[11px] text-warm-400 mt-0.5">上传文档 → markitdown 转换 → AI 抽取 → 写入 Vault</div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.xlsx,.pptx,.html,.csv,.epub,.odt,.rtf,.json,.xml,.jpg,.jpeg,.png"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {running ? '处理中...' : '选择文件'}
        </button>
      </div>

      <div className="flex-1" style={{ minHeight: 380 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={true}
          nodesConnectable={false}
          className="!bg-cream-100"
        >
          <Background color="#E8D5BC" gap={20} />
          <Controls className="!bg-surface !border-cream-300 !rounded-lg" showInteractive={false} />
          <MiniMap nodeColor="#D4B896" maskColor="rgba(255,251,245,0.8)" className="!bg-surface !border-cream-200 !rounded-lg" />
        </ReactFlow>
      </div>

      {/* Result panel */}
      {result && (
        <div className="px-5 py-3 border-t border-cream-200 bg-accent-sage/5">
          <div className="flex items-center gap-2 text-xs text-accent-sage mb-2">
            <Check className="w-4 h-4" />
            摄取完成: {result.originalName} → {result.markdownPath}
          </div>
          <div className="text-[11px] text-warm-500 space-x-4">
            <span>{result.wordCount} words</span>
            <span>{result.entities.length} entities</span>
            <span>{result.tags.length} tags</span>
            <span>{result.wikilinks} wikilinks</span>
          </div>
          <div className="mt-2 text-[10px] text-warm-400 bg-cream-200 rounded p-2 max-h-24 overflow-auto">
            {result.preview}
          </div>
        </div>
      )}

      {error && (
        <div className="px-5 py-3 border-t border-cream-200 bg-rose-50/50 flex items-center gap-2 text-xs text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Research Pipeline ────────────────────────────────────────────────────────

const initialResearchSteps: PipelineStep[] = [
  { id: '1', label: '发现缺口', desc: '从 Vault 健康检查获取知识空白', icon: 'Lightbulb', status: 'pending' },
  { id: '2', label: '选择话题', desc: '用户选择要研究的知识缺口', icon: 'Globe', status: 'pending' },
  { id: '3', label: 'AI 生成笔记', desc: '基于 Vault 上下文生成结构化内容', icon: 'Puzzle', status: 'pending' },
  { id: '4', label: '知识归档', desc: '写入 Research/ 目录并建立引用', icon: 'Archive', status: 'pending' },
]

function ResearchPanel() {
  const [steps, setSteps] = useState<PipelineStep[]>(initialResearchSteps)
  const [running, setRunning] = useState(false)
  const [gaps, setGaps] = useState<ResearchGap[]>([])
  const [selectedGap, setSelectedGap] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [result, setResult] = useState<{ topic: string; path: string; wordCount: number; preview: string } | null>(null)
  const [error, setError] = useState('')
  const [gapsLoading, setGapsLoading] = useState(false)

  const updateStep = useCallback((id: string, patch: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const loadGaps = async () => {
    setGapsLoading(true)
    updateStep('1', { status: 'active' })
    try {
      const res = await api.getResearchGaps()
      setGaps(res.gaps)
      updateStep('1', { status: 'done', detail: `${res.gaps.length} 个缺口` })
    } catch {
      updateStep('1', { status: 'done', detail: '无法获取缺口' })
    } finally {
      setGapsLoading(false)
    }
  }

  const startResearch = async () => {
    const topic = customTopic.trim() || selectedGap
    if (!topic) return

    setRunning(true)
    setError('')
    setResult(null)

    // Reset steps 2-4
    setSteps(prev => prev.map(s => {
      if (s.id === '1') return { ...s, status: 'done' as const }
      return { ...s, status: 'pending' as const, detail: undefined }
    }))

    try {
      updateStep('2', { status: 'active' })
      await delay(300)
      updateStep('2', { status: 'done', detail: topic })

      updateStep('3', { status: 'active' })
      const res = await api.research(topic)
      updateStep('3', { status: 'done', detail: `${res.wordCount} words` })

      updateStep('4', { status: 'active' })
      await delay(300)
      updateStep('4', { status: 'done', detail: res.path })

      setResult(res)
    } catch (err: any) {
      setError(err.message)
      setSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'pending' as const } : s))
    } finally {
      setRunning(false)
    }
  }

  const { nodes, edges } = useMemo(() => getLayoutedElements(steps), [steps])

  return (
    <div className="bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-cream-200 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-warm-700">自动研究工作流</div>
          <div className="text-[11px] text-warm-400 mt-0.5">发现知识缺口 → AI 生成结构化笔记</div>
        </div>
        <button
          onClick={loadGaps}
          disabled={gapsLoading || running}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-cream-200 text-warm-600 hover:bg-cream-300 disabled:opacity-40 transition-colors"
        >
          {gapsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          发现缺口
        </button>
        <button
          onClick={startResearch}
          disabled={running || (!selectedGap && !customTopic.trim())}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {running ? '生成中...' : '开始研究'}
        </button>
      </div>

      {/* Gap selector */}
      {gaps.length > 0 && !running && (
        <div className="px-5 py-3 border-b border-cream-200 bg-surface/50">
          <div className="text-[11px] text-warm-500 mb-2">选择知识缺口或输入自定义话题:</div>
          <div className="flex flex-wrap gap-2">
            {gaps.map(g => (
              <button
                key={g.topic}
                onClick={() => { setSelectedGap(g.topic); setCustomTopic('') }}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                  selectedGap === g.topic
                    ? 'bg-accent-orange/15 text-accent-orange border-accent-orange/30'
                    : 'bg-cream-200 text-warm-500 border-cream-300 hover:border-warm-400'
                }`}
              >
                {g.topic} <span className="text-warm-400">({g.references})</span>
              </button>
            ))}
          </div>
          <div className="mt-2">
            <input
              type="text"
              value={customTopic}
              onChange={e => { setCustomTopic(e.target.value); setSelectedGap('') }}
              placeholder="或输入自定义研究话题..."
              className="w-full bg-cream-200 border border-cream-300 rounded-lg px-3 py-1.5 text-xs text-warm-700 outline-none focus:border-accent-orange"
            />
          </div>
        </div>
      )}

      <div className="flex-1" style={{ minHeight: 340 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={true}
          nodesConnectable={false}
          className="!bg-cream-100"
        >
          <Background color="#E8D5BC" gap={20} />
          <Controls className="!bg-surface !border-cream-300 !rounded-lg" showInteractive={false} />
          <MiniMap nodeColor="#D4B896" maskColor="rgba(255,251,245,0.8)" className="!bg-surface !border-cream-200 !rounded-lg" />
        </ReactFlow>
      </div>

      {result && (
        <div className="px-5 py-3 border-t border-cream-200 bg-accent-sage/5">
          <div className="flex items-center gap-2 text-xs text-accent-sage mb-2">
            <Check className="w-4 h-4" />
            研究完成: {result.topic}
          </div>
          <div className="text-[11px] text-warm-500 mb-2">
            路径: {result.path} | {result.wordCount} words
          </div>
          <div className="text-[10px] text-warm-400 bg-cream-200 rounded p-2 max-h-24 overflow-auto">
            {result.preview}
          </div>
        </div>
      )}

      {error && (
        <div className="px-5 py-3 border-t border-cream-200 bg-rose-50/50 flex items-center gap-2 text-xs text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Lint Pipeline ────────────────────────────────────────────────────────────

const initialLintSteps: PipelineStep[] = [
  { id: '1', label: '扫描 Vault', desc: '遍历所有 Markdown 文件', icon: 'FolderSearch', status: 'pending' },
  { id: '2', label: '8 类检查', desc: '孤立笔记/断链/重复/元数据等', icon: 'ShieldCheck', status: 'pending' },
  { id: '3', label: '生成报告', desc: '按严重程度列出问题清单', icon: 'FileText', status: 'pending' },
  { id: '4', label: '自动修复', desc: '选择类别一键修复', icon: 'Wrench', status: 'pending' },
]

function LintPanel() {
  const [steps, setSteps] = useState<PipelineStep[]>(initialLintSteps)
  const [running, setRunning] = useState(false)
  const [fixing, setFixing] = useState<string | null>(null)
  const [fixResults, setFixResults] = useState<Record<string, LintFixResult>>({})
  const [error, setError] = useState('')
  const { report, reload: reloadHealth } = useVaultHealth()

  const updateStep = useCallback((id: string, patch: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const runScan = async () => {
    setRunning(true)
    setError('')
    setFixResults({})
    setSteps(initialLintSteps)

    try {
      updateStep('1', { status: 'active' })
      await delay(400)
      updateStep('1', { status: 'done' })

      updateStep('2', { status: 'active' })
      await reloadHealth()
      await delay(400)
      updateStep('2', { status: 'done' })

      updateStep('3', { status: 'active' })
      await delay(300)
      if (report) {
        const issueCount = report.categories.reduce((s, c) => s + c.issues.length, 0)
        updateStep('3', { status: 'done', detail: `${issueCount} 个问题` })
      } else {
        updateStep('3', { status: 'done' })
      }

      updateStep('4', { status: 'active', desc: '点击修复按钮开始' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  const handleFix = async (category: string) => {
    setFixing(category)
    try {
      const res = await api.lintFix(category)
      setFixResults(prev => ({ ...prev, [category]: res }))
      await reloadHealth()
      updateStep('4', { status: 'done', detail: `修复了 ${res.fixed} 个问题` })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setFixing(null)
    }
  }

  const { nodes, edges } = useMemo(() => getLayoutedElements(steps), [steps])

  const fixableCategories = ['link_integrity', 'metadata_coverage', 'tag_consistency', 'orphan_notes']
  const categoryLabels: Record<string, string> = {
    link_integrity: '修复断链',
    metadata_coverage: '补全元数据',
    tag_consistency: '合并标签',
    orphan_notes: '修复孤立笔记',
  }

  return (
    <div className="bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-cream-200 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-warm-700">Vault 健康检查</div>
          <div className="text-[11px] text-warm-400 mt-0.5">扫描 → 检查 → 报告 → 自动修复</div>
        </div>
        <button
          onClick={runScan}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {running ? '扫描中...' : '开始扫描'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Flow */}
        <div className="flex-1" style={{ minHeight: 300 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={true}
            nodesConnectable={false}
            className="!bg-cream-100"
          >
            <Background color="#E8D5BC" gap={20} />
            <Controls className="!bg-surface !border-cream-300 !rounded-lg" showInteractive={false} />
            <MiniMap nodeColor="#D4B896" maskColor="rgba(255,251,245,0.8)" className="!bg-surface !border-cream-200 !rounded-lg" />
          </ReactFlow>
        </div>

        {/* Issues sidebar */}
        {report && steps[2].status === 'done' && (
          <div className="w-72 shrink-0 border-l border-cream-200 overflow-auto bg-cream-100/50">
            <div className="px-3 py-2 text-xs font-medium text-warm-600 border-b border-cream-200">
              健康评分: <span className={`font-bold ${report.overallScore >= 80 ? 'text-accent-sage' : report.overallScore >= 60 ? 'text-accent-amber' : 'text-rose-400'}`}>{report.overallScore}</span>
            </div>
            <div className="p-2 space-y-2">
              {report.categories.map(cat => {
                const issueCount = cat.issues.length
                const isFixable = fixableCategories.includes(cat.name)
                const fixResult = fixResults[cat.name]

                return (
                  <div key={cat.name} className="bg-surface border border-cream-200 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-warm-600">{cat.label}</span>
                      <span className="text-[10px] text-warm-400">{cat.score}/{cat.maxScore}</span>
                    </div>
                    {issueCount > 0 && (
                      <div className="text-[10px] text-warm-400 mb-1.5">{issueCount} 个问题</div>
                    )}
                    {isFixable && issueCount > 0 && !fixResult && (
                      <button
                        onClick={() => handleFix(cat.name)}
                        disabled={fixing === cat.name}
                        className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-[10px] bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
                      >
                        {fixing === cat.name ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Wrench className="w-3 h-3" />
                        )}
                        {categoryLabels[cat.name]}
                      </button>
                    )}
                    {fixResult && (
                      <div className="text-[10px] text-accent-sage flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        修复 {fixResult.fixed}, 跳过 {fixResult.skipped}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-5 py-3 border-t border-cream-200 bg-rose-50/50 flex items-center gap-2 text-xs text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Workflow() {
  const [activePipeline, setActivePipeline] = useState('ingestion')

  return (
    <div className="space-y-5 h-full flex flex-col">
      {/* Pipeline selector */}
      <div className="flex gap-2 shrink-0">
        {[
          { key: 'ingestion', label: '文档摄取' },
          { key: 'research', label: '自动研究' },
          { key: 'lint', label: '健康检查' },
        ].map(p => (
          <button
            key={p.key}
            onClick={() => setActivePipeline(p.key)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              activePipeline === p.key
                ? 'bg-cream-200 text-warm-800 border border-cream-300'
                : 'bg-surface text-warm-400 border border-cream-200 hover:text-warm-600 hover:border-cream-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Active pipeline */}
      <div className="flex-1" style={{ minHeight: 480 }}>
        {activePipeline === 'ingestion' && <IngestionPanel />}
        {activePipeline === 'research' && <ResearchPanel />}
        {activePipeline === 'lint' && <LintPanel />}
      </div>
    </div>
  )
}
