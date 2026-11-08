import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { useVaultGraph, useVaultHealth, useVaultStats } from '../hooks/useVaultData'
import { graphNodes as mockNodes, graphLinks as mockLinks, groupColors, groupLabels } from '../data/mockData'
import { api, type FileDetail } from '../services/api'
import { RefreshCw, Loader2, Search, X, FileText, Maximize2, RotateCcw, ZoomIn, ZoomOut, Eye } from 'lucide-react'

const allGroupColors: Record<string, string> = {
  ...groupColors,
  note: '#8B7355',
  orphan: '#f97316',
  project: '#7A9B6D',
  daily: '#E07A3A',
  reference: '#C4943D',
  area: '#7A9B6D',
  resource: '#D4856A',
  template: '#C48BA0',
}

const allGroupLabels: Record<string, string> = {
  ...groupLabels,
  note: '笔记',
  orphan: '孤立',
  project: '项目',
  daily: '日记',
  reference: '参考',
  area: '领域',
  resource: '资源',
  template: '模板',
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string
  label: string
  group: string
  r: number
  path: string
  tags: string[]
  linkCount: number
}

function formatLabel(label: string): string {
  if (label.length > 18) {
    return label.slice(0, 16) + '…'
  }
  return label
}

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const currentTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity)
  const fitViewRef = useRef<((animate?: boolean) => void) | null>(null)
  const updateLabelsRef = useRef<(() => void) | null>(null)

  const navigate = useNavigate()
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllLabels, setShowAllLabels] = useState(false)
  const [previewNode, setPreviewNode] = useState<FileDetail | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 })

  // Data hooks
  const { data, loading, error, reload } = useVaultGraph()
  const { report } = useVaultHealth()
  const { stats } = useVaultStats()

  // 考研研学知识拓扑：若用户笔记库节点少于 4 个（新账号），无缝展示官方考研核心大纲考点拓扑
  const isUsingCuratedSyllabus = !data || !data.nodes || data.nodes.length < 4

  const { nodes: rawNodes, links: rawLinks, groups } = useMemo(() => {
    if (data && data.nodes && data.nodes.length >= 4) {
      const grps = [...new Set(data.nodes.map(n => n.group))]
      return { nodes: data.nodes, links: data.links, groups: grps }
    }
    // 计算官方大纲节点连线度数
    const nodes = mockNodes.map(n => ({
      id: n.id,
      label: n.label,
      group: n.group,
      size: n.r,
      path: n.id,
      tags: ['考研核心考点', '408/数学大纲'],
      linkCount: mockLinks.filter(l => l.source === n.id || l.target === n.id).length,
    }))
    const links = mockLinks.map(l => ({ source: l.source, target: l.target, value: 1 }))
    return { nodes, links, groups: [...new Set(mockNodes.map(n => n.group))] }
  }, [data])

  const simNodes: SimNode[] = useMemo(() =>
    rawNodes.map(d => ({
      id: d.id,
      label: d.label,
      group: d.group,
      r: Math.max(5, Math.min(22, (d.size || 6))),
      path: d.path || d.id,
      tags: d.tags || [],
      linkCount: d.linkCount || 0,
    })),
    [rawNodes]
  )

  // Active node IDs based on search + group filter
  const activeNodeIds = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const hasGroupFilter = selectedGroups.size > 0
    return new Set(
      simNodes
        .filter(n => {
          if (hasGroupFilter && !selectedGroups.has(n.group)) return false
          if (q && !n.label.toLowerCase().includes(q) && !n.tags.some(t => t.toLowerCase().includes(q))) return false
          return true
        })
        .map(n => n.id)
    )
  }, [simNodes, searchQuery, selectedGroups])

  const hasFilter = searchQuery.trim().length > 0 || selectedGroups.size > 0

  // Keep refs in sync for D3 callbacks without forcing re-simulations
  const activeNodeIdsRef = useRef(activeNodeIds)
  activeNodeIdsRef.current = activeNodeIds

  const hasFilterRef = useRef(hasFilter)
  hasFilterRef.current = hasFilter

  const showAllLabelsRef = useRef(showAllLabels)
  showAllLabelsRef.current = showAllLabels

  const hoveredNodeRef = useRef<SimNode | null>(null)

  // ── Floating stats data ────────────────────────────────────────────────────
  const overallScore = report?.overallScore ?? 0
  const scoreColor = overallScore >= 80 ? 'text-accent-sage' : overallScore >= 60 ? 'text-accent-amber' : 'text-accent-rose'
  const orphanNotes = stats?.orphanNotes ?? 0

  // Resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        setDimensions({ width: Math.floor(width), height: Math.floor(height) })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // D3 force simulation
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const { width, height } = dimensions

    const nodes: SimNode[] = simNodes.map(d => ({ ...d }))
    const links = rawLinks.map(d => ({ ...d }))

    // Build fast lookup map for 1-hop connected neighbors
    const neighborMap = new Map<string, Set<string>>()
    links.forEach((l: any) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source
      const t = typeof l.target === 'object' ? l.target.id : l.target
      if (!neighborMap.has(s)) neighborMap.set(s, new Set())
      if (!neighborMap.has(t)) neighborMap.set(t, new Set())
      neighborMap.get(s)!.add(t)
      neighborMap.get(t)!.add(s)
    })

    // 考研学科图谱力学优化：增强排斥力与碰撞气囊，彻底消除节点标签互相遮挡
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance((d: any) => {
        const linksSum = ((d.source as SimNode).linkCount || 1) + ((d.target as SimNode).linkCount || 1)
        return Math.max(90, 140 - Math.min(35, linksSum * 3))
      }).strength(0.48))
      .force('charge', d3.forceManyBody().strength((d: any) => {
        const count = (d as SimNode).linkCount || 1
        return -220 - Math.min(180, count * 12)
      }).distanceMax(650))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.06))
      .force('x', d3.forceX(width / 2).strength(0.025))
      .force('y', d3.forceY(height / 2).strength(0.025))
      .force('collision', d3.forceCollide<SimNode>().radius(d => {
        const labelLen = d.label ? d.label.length : 4
        return Math.max(d.r + 24, labelLen * 5.2 + 8)
      }).strength(0.85))

    const g = svg.append('g')

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        currentTransformRef.current = event.transform
        g.attr('transform', event.transform)
        updateLabels(event.transform.k)
      })

    svg.call(zoom)
    zoomRef.current = zoom

    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#D4B896')
      .attr('stroke-width', 1.4)
      .attr('stroke-opacity', 0.35)

    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    // 单击节点：呼出右侧知识卡片与考点预览抽屉 (兼顾拖拽防误触)
    node.on('click', (event, d) => {
      event.stopPropagation()
      if (d.path) {
        setPreviewLoading(true)
        api.getFile(d.path)
          .then(note => setPreviewNode(note))
          .catch(() => {})
          .finally(() => setPreviewLoading(false))
      }
    })

    // 双击节点：快速沉浸进入知识库编辑器进行编辑
    node.on('dblclick', (event, d) => {
      event.stopPropagation()
      if (d.path) {
        navigate(`/editor?path=${encodeURIComponent(d.path)}`)
      }
    })

    // Node outer glow
    node.append('circle')
      .attr('r', (d: SimNode) => d.r + 4)
      .attr('fill', (d: SimNode) => allGroupColors[d.group] || '#8B7355')
      .attr('opacity', 0.15)
      .attr('class', 'node-glow')

    // Node core circle
    node.append('circle')
      .attr('r', (d: SimNode) => d.r)
      .attr('fill', (d: SimNode) => allGroupColors[d.group] || '#8B7355')
      .attr('stroke', '#FFFBF5')
      .attr('stroke-width', 2.2)
      .attr('opacity', 0.92)
      .attr('class', 'node-circle')

    // Node label with crisp halo (考研学科高清晰度文字，强化白底描边与层次)
    node.append('text')
      .attr('class', 'node-label select-none')
      .text((d: SimNode) => formatLabel(d.label))
      .attr('dy', (d: SimNode) => d.r + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0f172a')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 4)
      .attr('stroke-linejoin', 'round')
      .attr('paint-order', 'stroke fill')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial')
      .attr('pointer-events', 'none')

    // Dynamic Label Visibility (LOD) logic
    const updateLabels = (currentK?: number) => {
      const k = currentK ?? (currentTransformRef.current?.k || 1)
      const hNode = hoveredNodeRef.current
      const neighbors = hNode ? (neighborMap.get(hNode.id) || new Set()) : new Set()

      node.selectAll<SVGTextElement, SimNode>('text.node-label')
        .style('display', function (d) {
          // If hovered or direct neighbor of hovered node, always display
          if (hNode && (d.id === hNode.id || neighbors.has(d.id))) return 'inline'
          // If matching active search or group filter, always display
          if (hasFilterRef.current && activeNodeIdsRef.current.has(d.id)) return 'inline'
          // If user enabled 'show all labels', show all
          if (showAllLabelsRef.current) return 'inline'

          // Multi-level zoom LOD
          if (k >= 1.6) return 'inline'
          if (k >= 1.1) return (d.linkCount >= 1 || d.r >= 6) ? 'inline' : 'none'
          if (k >= 0.75) return (d.linkCount >= 2 || d.r >= 7) ? 'inline' : 'none'
          return (d.linkCount >= 4 || d.r >= 9) ? 'inline' : 'none'
        })
    }
    updateLabelsRef.current = updateLabels

    // Hover interactions: 1-hop neighbor highlighting & label activation
    node.on('mouseenter', function (_event, d) {
      setHoveredNode(d)
      hoveredNodeRef.current = d
      const neighbors = neighborMap.get(d.id) || new Set<string>()

      d3.select(this).select('.node-circle')
        .transition().duration(120)
        .attr('r', d.r + 3)
        .attr('opacity', 1)
      d3.select(this).select('.node-glow')
        .transition().duration(120)
        .attr('r', d.r + 9)
        .attr('opacity', 0.4)

      // Highlight active node & neighbors, dim non-neighbors
      node.transition().duration(120)
        .style('opacity', n => (n.id === d.id || neighbors.has(n.id) ? 1 : 0.15))

      // Highlight connected links
      link.transition().duration(120)
        .attr('stroke-opacity', (l: any) => {
          const sId = l.source.id || l.source
          const tId = l.target.id || l.target
          return sId === d.id || tId === d.id ? 0.95 : 0.04
        })
        .attr('stroke-width', (l: any) => {
          const sId = l.source.id || l.source
          const tId = l.target.id || l.target
          return sId === d.id || tId === d.id ? 2.5 : 1
        })
        .attr('stroke', (l: any) => {
          const sId = l.source.id || l.source
          const tId = l.target.id || l.target
          return sId === d.id || tId === d.id ? (allGroupColors[d.group] || '#8B7355') : '#D4B896'
        })

      updateLabels()
    }).on('mouseleave', function (_event, d) {
      setHoveredNode(null)
      hoveredNodeRef.current = null

      d3.select(this).select('.node-circle')
        .transition().duration(120)
        .attr('r', d.r)
        .attr('opacity', 0.92)
      d3.select(this).select('.node-glow')
        .transition().duration(120)
        .attr('r', d.r + 4)
        .attr('opacity', 0.15)

      // Restore opacity based on search/group filter
      node.transition().duration(120)
        .style('opacity', n => {
          if (!hasFilterRef.current) return 1
          return activeNodeIdsRef.current.has(n.id) ? 1 : 0.08
        })

      link.transition().duration(120)
        .attr('stroke-opacity', (l: any) => {
          if (!hasFilterRef.current) return 0.35
          const sActive = activeNodeIdsRef.current.has(l.source.id || l.source)
          const tActive = activeNodeIdsRef.current.has(l.target.id || l.target)
          return (sActive && tActive) ? 0.6 : 0.03
        })
        .attr('stroke-width', 1.4)
        .attr('stroke', '#D4B896')

      updateLabels()
    })

    // Free 2D coordinate tick: NO BOUNDARY CLAMPING!
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d: SimNode) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    // True Fit View: calculates bounding box and smooth-centers graph in canvas
    const fitView = (animate = true) => {
      if (!svgRef.current || nodes.length === 0) return
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      for (const d of nodes) {
        if (d.x == null || d.y == null || !isFinite(d.x) || !isFinite(d.y)) continue
        if (d.x - d.r < minX) minX = d.x - d.r
        if (d.x + d.r > maxX) maxX = d.x + d.r
        if (d.y - d.r < minY) minY = d.y - d.r
        if (d.y + d.r > maxY) maxY = d.y + d.r
      }
      if (!isFinite(minX) || !isFinite(maxX) || maxX <= minX) return

      const graphWidth = maxX - minX
      const graphHeight = maxY - minY
      const midX = (minX + maxX) / 2
      const midY = (minY + maxY) / 2

      const pad = 60
      const availW = Math.max(120, width - pad * 2)
      const availH = Math.max(120, height - pad * 2)

      const scale = Math.max(0.12, Math.min(1.2, Math.min(availW / graphWidth, availH / graphHeight)))
      const tx = width / 2 - scale * midX
      const ty = height / 2 - scale * midY

      const t = d3.zoomIdentity.translate(tx, ty).scale(scale)
      currentTransformRef.current = t

      if (animate) {
        svg.transition().duration(550).ease(d3.easeCubicOut).call(zoom.transform, t)
      } else {
        svg.call(zoom.transform, t)
      }
      updateLabels(scale)
    }

    fitViewRef.current = fitView

    // Pre-warm initial ticks so nodes enter with a calm settling motion
    simulation.alpha(1)
    for (let i = 0; i < 45; ++i) {
      simulation.tick()
    }
    fitView(false)
    updateLabels()

    // Auto-fit smoothly once after layout stabilizes
    const timer = setTimeout(() => {
      fitView(true)
    }, 600)

    return () => {
      clearTimeout(timer)
      simulation.stop()
      zoomRef.current = null
      fitViewRef.current = null
      updateLabelsRef.current = null
    }
  }, [dimensions, simNodes, rawLinks, navigate])

  // Update node/link opacity and refresh labels when search, filter or label visibility changes
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)

    svg.selectAll<SVGGElement, SimNode>('.node')
      .transition().duration(200)
      .style('opacity', d => {
        if (!hasFilter) return 1
        return activeNodeIds.has(d.id) ? 1 : 0.08
      })

    svg.selectAll<SVGLineElement, any>('line')
      .transition().duration(200)
      .attr('stroke-opacity', (l: any) => {
        if (!hasFilter) return 0.35
        const sActive = activeNodeIds.has(l.source.id || l.source)
        const tActive = activeNodeIds.has(l.target.id || l.target)
        return (sActive && tActive) ? 0.6 : 0.03
      })

    updateLabelsRef.current?.()
  }, [activeNodeIds, hasFilter, showAllLabels])

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const totalNodes = rawNodes.length
  const isRealData = Boolean(data)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGroups(new Set())
  }

  const resetView = () => {
    fitViewRef.current?.(true)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-0 md:gap-3">
      {/* 📱 移动端极简状态条（释放 92% 满屏画布空间） */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 bg-white border-b border-slate-200/80 text-xs shrink-0">
        <div className="flex items-center gap-2 font-medium text-slate-600">
          <span className="font-bold text-slate-900">{totalNodes} 节点</span>
          <span className="text-slate-300">·</span>
          <span className="text-emerald-600 font-semibold">{rawLinks.length} 双链</span>
          <span className="text-slate-300">·</span>
          <span className="text-rose-500">{orphanNotes} 孤立</span>
        </div>
        <div className="flex items-center gap-1.5">
          {hasFilter && (
            <button onClick={clearFilters} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
              重置
            </button>
          )}
          <button onClick={reload} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 active:scale-95" aria-label="刷新图谱">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 🖥️ 桌面端顶部双轨角落胶囊 (Subframe Screen 3 Corner Pills) */}
      <div className="hidden md:flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200/80 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-neutral-800">全景双链知识网络</span>
            <span className="text-neutral-300">|</span>
            <span className="text-[11px] text-neutral-500 font-mono">D3.js 动力拓扑</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200/80 text-xs text-neutral-600 font-medium">
            <span>双击节点：右侧属性检查器</span>
          </div>
        </div>
      </div>

      {/* 🖥️ 桌面端 Header (Subframe Team Header Bar) */}
      <div className="hidden md:flex flex-col justify-between gap-3 shrink-0 lg:flex-row lg:items-center bg-white rounded-[16px] border border-black/[0.08] p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">考研全库拓扑知识图谱</h1>
            {isRealData && (
              <span className="rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[10px] font-mono font-medium text-neutral-700">实时网络</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">
            从笔记双向链接构建拓扑知识网络。支持平移缩放、智能标签分级、单击跳至编辑、双击检查器透视。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={resetView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium cursor-pointer shadow-xs transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            适配全景
          </button>
          <button
            onClick={() => setShowAllLabels(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer ${
              showAllLabels
                ? 'bg-neutral-900 text-white font-semibold'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {showAllLabels ? '全部标签' : '智能标签'}
          </button>
          <button
            onClick={clearFilters}
            disabled={!hasFilter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            清除筛选
          </button>
          <button
            onClick={reload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            重新构建
          </button>
        </div>
      </div>

      {/* 🖥️ 桌面端 Metrics Row */}
      <div className="hidden md:grid grid-cols-4 gap-2.5 shrink-0">
        <GraphMetric label="节点总数" value={totalNodes} color="text-neutral-900" />
        <GraphMetric label="双向连接" value={rawLinks.length} color="text-emerald-600" />
        <GraphMetric label="孤立笔记" value={orphanNotes} color="text-rose-500" />
        <GraphMetric label="健康度" value={overallScore || '—'} color={scoreColor} suffix={overallScore ? '/100' : undefined} />
      </div>

      {/* Main Workspace Row */}
      <div className="flex flex-1 min-h-0 gap-3">
        {/* Graph Canvas Area */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-warm-500 px-2 mb-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              加载图谱数据...
            </div>
          )}
          {isUsingCuratedSyllabus && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50/90 to-amber-50/80 border border-indigo-200/90 text-xs mb-2">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  考研双核大纲考点拓扑
                </span>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="text-slate-600 hidden sm:inline">
                  涵盖 408 计算机与考研数学 42 个高频考点。在笔记中使用 <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-600 font-mono text-[11px]">[[双链]]</code> 即可点亮个人知识网络。
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/study"
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs transition-colors"
                >
                  浏览考研讲义 →
                </Link>
                <Link
                  to="/editor"
                  className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-lg shadow-2xs transition-colors"
                >
                  + 新建考研笔记
                </Link>
              </div>
            </div>
          )}

          <div
            ref={containerRef}
            className="relative flex-1 min-h-0 overflow-hidden sm:rounded-xl sm:border sm:border-neutral-200/80 bg-neutral-50/50 shadow-xs select-none"
          >
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="block h-full w-full" />

            {/* 新账号或单节点空状态引导 */}
            {totalNodes <= 1 && rawLinks.length === 0 && !loading && (
              <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                <div className="pointer-events-auto max-w-sm rounded-2xl bg-white/95 backdrop-blur-md p-6 border border-zinc-200/90 shadow-xl text-center space-y-3 animate-fade-in-up">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 font-bold">
                    🌐
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">图谱网络待点亮</h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      当前账号仅有基础根节点。在【笔记中心】使用 <code>[[知识点]]</code> 创建双向链接，或查阅【讲义中心】，系统将实时交织出考研考点双链拓扑网。
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <Link
                      to="/editor"
                      className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      新建双链笔记
                    </Link>
                    <Link
                      to="/study"
                      className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors"
                    >
                      查阅核心讲义
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Floating on-canvas controls (top-left) */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 rounded-lg border border-neutral-200/80 bg-white/95 p-1 shadow-xs backdrop-blur-md">
              <button
                onClick={() => {
                  if (!svgRef.current || !zoomRef.current) return
                  d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 1.3)
                }}
                title="放大"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-warm-600 hover:bg-cream-100 hover:text-warm-900 transition-colors"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (!svgRef.current || !zoomRef.current) return
                  d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 0.77)
                }}
                title="缩小"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-warm-600 hover:bg-cream-100 hover:text-warm-900 transition-colors"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={resetView}
                title="适配全景"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-warm-600 hover:bg-cream-100 hover:text-warm-900 transition-colors"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <div className="my-0.5 h-px bg-cream-200" />
              <button
                onClick={() => setShowAllLabels(prev => !prev)}
                title={showAllLabels ? '当前：全部标签（点击切回智能模式）' : '当前：智能标签（点击显示全部标签）'}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  showAllLabels ? 'bg-accent-orange/15 text-accent-orange font-bold' : 'text-warm-600 hover:bg-cream-100'
                }`}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>

            {/* Search + filter indicator (top-right) */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索节点或标签..."
                  className="w-48 pl-8 pr-7 py-1.5 bg-surface/90 backdrop-blur-md border border-cream-200 rounded-xl text-xs text-warm-700 placeholder-warm-400 outline-none focus:border-accent-orange transition-colors shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-warm-400 hover:text-warm-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Match Badge (top-center) */}
            {hasFilter && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md border border-cream-200 text-[11px] text-warm-600 shadow-sm">
                匹配 <span className="font-semibold text-accent-orange">{activeNodeIds.size}</span> / {totalNodes} 节点
              </div>
            )}

            {/* Empty vault guide */}
            {data && data.nodes.length === 0 && !loading && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-sm rounded-2xl border border-cream-200 bg-surface/95 p-6 text-center shadow-xl backdrop-blur-sm">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-orange/12 text-accent-orange">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-warm-800">知识库还没有可连接的笔记</h2>
                  <p className="mt-2 text-xs leading-5 text-warm-500">先创建一篇笔记，或回到设置连接正确的 Obsidian Vault，图谱会在这里自动生成。</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Link to="/editor" className="rounded-xl bg-accent-orange px-3 py-2 text-xs font-medium text-white">创建笔记</Link>
                    <Link to="/settings" className="rounded-xl border border-cream-300 px-3 py-2 text-xs font-medium text-warm-600">检查连接</Link>
                  </div>
                </div>
              </div>
            )}

            {/* Hover tooltip (floating bottom-right) */}
            {hoveredNode && (
              <div className="absolute bottom-16 right-3 z-10 bg-surface/95 border border-cream-300 rounded-xl px-4 py-3 backdrop-blur-sm shadow-xl max-w-xs animate-fade-in">
                <div className="text-sm font-semibold text-warm-800 mb-1">{hoveredNode.label}</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: allGroupColors[hoveredNode.group] || '#8B7355' }} />
                  <span className="text-xs text-warm-600">{allGroupLabels[hoveredNode.group] || hoveredNode.group}</span>
                </div>
                {hoveredNode.path && (
                  <div className="text-[10px] text-warm-400 mt-1 font-mono truncate">{hoveredNode.path}</div>
                )}
                {hoveredNode.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {hoveredNode.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-cream-200 text-warm-600">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-warm-400 mt-1.5">连接数: {hoveredNode.linkCount}</div>
                <div className="text-[10px] text-accent-orange mt-1">单击跳转编辑 · 双击右侧预览</div>
              </div>
            )}

            {/* Category Filter Chips (bottom-left, 手机端单行横滑) */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 flex items-center sm:flex-wrap gap-1.5 sm:max-w-[70%] overflow-x-auto no-scrollbar">
              {groups.map(key => {
                const isActive = selectedGroups.size === 0 || selectedGroups.has(key)
                return (
                  <button
                    key={key}
                    onClick={() => toggleGroup(key)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] transition-all backdrop-blur-sm shadow-sm ${
                      isActive
                        ? 'bg-cream-200/90 text-warm-800 font-medium'
                        : 'bg-cream-100/80 text-warm-400 hover:text-warm-600 opacity-50'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: allGroupColors[key] || '#8B7355' }} />
                    {allGroupLabels[key] || key}
                  </button>
                )
              })}
              {selectedGroups.size > 0 && (
                <button
                  onClick={() => setSelectedGroups(new Set())}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] text-warm-500 hover:text-warm-700 transition-colors bg-cream-200/90 backdrop-blur-sm shadow-sm"
                >
                  <X className="w-3 h-3" /> 重置分组
                </button>
              )}
            </div>

            {/* Helper tips (bottom-center, 桌面端显示以免与手机底部分类条重叠) */}
            {!hasFilter && !hoveredNode && (
              <div className="hidden lg:block absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/85 backdrop-blur-sm border border-slate-200/80 text-[10px] text-slate-500 shadow-2xs pointer-events-none">
                滚轮缩放 · 拖拽画布/节点 · 单击跳至编辑 · 双击右侧预览
              </div>
            )}
          </div>
        </div>

        {/* Right Node Inspector (Subframe Screen 2 Node Inspector) */}
        {(previewNode || previewLoading) && (
          <div className="fixed inset-x-3 bottom-16 top-24 z-40 md:static md:w-80 md:inset-auto md:z-auto shrink-0 h-auto md:h-full flex flex-col rounded-[16px] border border-black/[0.08] bg-white p-4 shadow-xl md:shadow-xs overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-neutral-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-400 font-mono">NODE INSPECTOR</span>
              </div>
              <button
                onClick={() => setPreviewNode(null)}
                className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {previewLoading && (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-neutral-900 animate-spin" />
              </div>
            )}
            {previewNode && !previewLoading && (
              <div className="flex-1 flex flex-col min-h-0 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 truncate">
                    {previewNode.title}
                  </h3>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">{previewNode.path}</div>
                </div>

                {/* 字段属性网格 (Inspector Grid) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-neutral-50/80 border border-neutral-200/80">
                    <div className="text-[10px] text-neutral-400 font-medium">双链拓扑度</div>
                    <div className="font-bold font-mono text-neutral-900 mt-0.5">{previewNode.links.length} Degree</div>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-50/80 border border-neutral-200/80">
                    <div className="text-[10px] text-neutral-400 font-medium">总词字数</div>
                    <div className="font-bold font-mono text-neutral-900 mt-0.5">{previewNode.wordCount} 字</div>
                  </div>
                </div>

                {previewNode.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {previewNode.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 font-medium">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap pr-1 border-t border-neutral-100 pt-2 font-mono">
                  {previewNode.content.substring(0, 1500)}
                  {previewNode.content.length > 1500 && (
                    <div className="mt-2 text-neutral-400 italic text-[11px]">... (内容较长，点击下方按钮在完整编辑器中阅读)</div>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      navigate(`/editor?path=${encodeURIComponent(previewNode.path)}`)
                      setPreviewNode(null)
                    }}
                    className="w-full py-2.5 rounded-[10px] bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>在编辑器中打开沉浸研读</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function GraphMetric({ label, value, color, suffix }: {
  label: string
  value: number | string
  color: string
  suffix?: string
}) {
  return (
    <div className="rounded-[14px] border border-black/[0.08] bg-white px-3.5 py-2.5 shadow-xs">
      <div className="text-[11px] font-medium text-neutral-400">{label}</div>
      <div className={`mt-0.5 text-lg font-bold font-mono ${color}`}>
        {value}
        {suffix && <span className="ml-1 text-[10px] font-normal text-neutral-400 font-sans">{suffix}</span>}
      </div>
    </div>
  )
}
