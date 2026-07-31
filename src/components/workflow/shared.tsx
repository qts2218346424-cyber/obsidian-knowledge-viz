import { useMemo } from 'react'
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
  Download, Tag, GitMerge, ArrowRightLeft, Plus, Link2,
  Brain, Network, Save, Send, MessageSquare,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PipelineStep {
  id: string
  label: string
  desc: string
  icon: string
  status: 'done' | 'active' | 'pending'
  detail?: string
}

// ─── Icon Map ─────────────────────────────────────────────────────────────────

export const iconMap: Record<string, React.FC<{ className?: string }>> = {
  FileInput, Cog, Search, Link, Binary, CheckCircle,
  Lightbulb, Globe, Puzzle, Archive,
  FolderSearch, ShieldCheck, FileText, Wrench,
  Download, Tag, GitMerge, ArrowRightLeft, Plus, Link2,
  Brain, Network, Save, Send, MessageSquare,
}

// ─── Status Styles ────────────────────────────────────────────────────────────

export const statusStyles = {
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

// ─── Step Node ────────────────────────────────────────────────────────────────

export function StepNode({ data }: { data: any }) {
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

export const nodeTypes: NodeTypes = { stepNode: StepNode }

// ─── Dagre Layout ─────────────────────────────────────────────────────────────

export function getLayoutedElements(steps: PipelineStep[]) {
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

export const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

// ─── Flow Wrapper (reusable) ──────────────────────────────────────────────────

export function PipelineFlow({ steps, minHeight = 340 }: { steps: PipelineStep[]; minHeight?: number }) {
  const { nodes, edges } = useMemo(() => getLayoutedElements(steps), [steps])

  return (
    <div className="flex-1" style={{ minHeight }}>
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
  )
}
