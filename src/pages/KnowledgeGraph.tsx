import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { useVaultGraph, useVaultHealth, useVaultStats } from '../hooks/useVaultData'
import { graphNodes as mockNodes, graphLinks as mockLinks, groupColors, groupLabels } from '../data/mockData'
import { api, type FileDetail } from '../services/api'
import {
  RefreshCw, Loader2, Search, X, FileText, Maximize2, RotateCcw,
  ZoomIn, ZoomOut, Eye, Flame, Play, ShieldAlert, Sparkles, CheckCircle2, Activity
} from 'lucide-react'
import CoursewareViewerModal from '../components/CoursewareViewerModal'
import MasteryRescueModal from '../components/MasteryRescueModal'
import { INTERACTIVE_COURSEWARES, type InteractiveCoursewareItem } from '../data/interactiveCourseware'
import { getNodeMastery, type MasteryPoint } from '../data/masteryData'

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

  // 🚀 核心视图模式：'topology'（双链拓扑）与 'mastery'（考点掌握度热力图）
  const [viewMode, setViewMode] = useState<'topology' | 'mastery'>('mastery')
  const viewModeRef = useRef<'topology' | 'mastery'>('mastery')
  viewModeRef.current = viewMode

  // 🏥 考点诊断与提分急救舱状态
  const [activeMasteryPoint, setActiveMasteryPoint] = useState<MasteryPoint | null>(null)
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false)

  // 🔬 仿真课件查看器弹窗状态
  const [activeCourseware, setActiveCourseware] = useState<InteractiveCoursewareItem | null>(null)
  const [isCoursewareOpen, setIsCoursewareOpen] = useState(false)

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

  // 掌握度统计概况 (基于节点掌握度计算)
  const masterySummary = useMemo(() => {
    let criticalCount = 0
    let moderateCount = 0
    let masteredCount = 0
    simNodes.forEach(node => {
      const mp = getNodeMastery(node.id, node.label)
      if (mp.rate < 50) criticalCount++
      else if (mp.rate < 80) moderateCount++
      else masteredCount++
    })
    return { criticalCount, moderateCount, masteredCount, total: simNodes.length }
  }, [simNodes])

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

  // 获取节点填充主色 (支持拓扑色彩与掌握度热力三色动态映射)
  const getNodeColor = (d: SimNode, currentViewMode: 'topology' | 'mastery') => {
    if (currentViewMode === 'mastery') {
      const mp = getNodeMastery(d.id, d.label)
      if (mp.rate >= 80) return '#10b981' // 翡翠绿 (稳固攻克)
      if (mp.rate >= 50) return '#f59e0b' // 暖橙黄 (进阶巩固)
      return '#ef4444' // 正气红 (薄弱高危)
    }
    return allGroupColors[d.group] || '#8B7355'
  }

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

    // 单击节点：若处于【考点掌握度热力图】模式，呼出【考点诊断与提分急救舱】；若在拓扑模式，呼出右侧笔记检查器
    node.on('click', (event, d) => {
      event.stopPropagation()
      if (viewModeRef.current === 'mastery') {
        const mp = getNodeMastery(d.id, d.label)
        setActiveMasteryPoint(mp)
        setIsRescueModalOpen(true)
        return
      }

      // 拓扑模式：展示笔记详情
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

    // 🔥 高危薄弱考点呼吸脉冲光晕 (仅在掌握度热力图模式下生效)
    node.each(function (d: SimNode) {
      const el = d3.select(this)
      const mp = getNodeMastery(d.id, d.label)
      const isCritical = mp.rate < 50

      if (isCritical) {
        el.append('circle')
          .attr('r', d.r + 10)
          .attr('fill', '#ef4444')
          .attr('opacity', 0.25)
          .attr('class', 'critical-pulse')
          .append('animate')
          .attr('attributeName', 'r')
          .attr('values', `${d.r + 6};${d.r + 15};${d.r + 6}`)
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite')

        el.select('.critical-pulse')
          .append('animate')
          .attr('attributeName', 'opacity')
          .attr('values', '0.35;0.08;0.35')
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite')
      }
    })

    // Node outer glow
    node.append('circle')
      .attr('r', (d: SimNode) => d.r + 4)
      .attr('fill', (d: SimNode) => getNodeColor(d, viewModeRef.current))
      .attr('opacity', 0.18)
      .attr('class', 'node-glow')

    // Node core circle
    node.append('circle')
      .attr('r', (d: SimNode) => d.r)
      .attr('fill', (d: SimNode) => getNodeColor(d, viewModeRef.current))
      .attr('stroke', '#FFFBF5')
      .attr('stroke-width', 2.2)
      .attr('opacity', 0.94)
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
          return sId === d.id || tId === d.id ? getNodeColor(d, viewModeRef.current) : '#D4B896'
        })

      updateLabels()
    }).on('mouseleave', function (_event, d) {
      setHoveredNode(null)
      hoveredNodeRef.current = null

      d3.select(this).select('.node-circle')
        .transition().duration(120)
        .attr('r', d.r)
        .attr('opacity', 0.94)
      d3.select(this).select('.node-glow')
        .transition().duration(120)
        .attr('r', d.r + 4)
        .attr('opacity', 0.18)

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

    // Free 2D coordinate tick
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
  }, [dimensions, simNodes, rawLinks, navigate, viewMode])

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

  // 启动仿真课件处理函数
  const handleOpenCourseware = (coursewareId: string) => {
    const item = INTERACTIVE_COURSEWARES.find(cw => cw.id === coursewareId) ||
                 INTERACTIVE_COURSEWARES.find(cw => cw.id === 'cw-avl-tree') ||
                 INTERACTIVE_COURSEWARES[0]
    if (item) {
      setActiveCourseware(item)
      setIsCoursewareOpen(true)
    }
  }

  // 靶向刷 3 道题处理函数
  const handlePracticePoint = (point: MasteryPoint) => {
    setIsRescueModalOpen(false)
    navigate(`/quiz?subject=${encodeURIComponent(point.practiceSubject)}&keyword=${encodeURIComponent(point.practiceKeyword)}&quick3=true`)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-0 md:gap-3">
      {/* 📱 移动端极简状态条 */}
      <div className="flex md:hidden items-center justify-between px-3 py-2 bg-white border-b border-slate-200/80 text-xs shrink-0">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <button
            onClick={() => setViewMode(prev => prev === 'mastery' ? 'topology' : 'mastery')}
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
              viewMode === 'mastery'
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {viewMode === 'mastery' ? '🔥 热力图' : '🕸️ 拓扑图'}
          </button>
          <span className="text-slate-300">·</span>
          <span className="font-bold text-slate-900">{totalNodes} 考点</span>
          {viewMode === 'mastery' && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-rose-500 font-bold">{masterySummary.criticalCount} 薄弱</span>
            </>
          )}
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

      {/* 🖥️ 桌面端顶部双轨胶囊与视图模式切换器 */}
      <div className="hidden md:flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* 模式切换双联胶囊 */}
          <div className="flex items-center p-1 bg-white border border-neutral-200/80 rounded-full shadow-xs">
            <button
              onClick={() => setViewMode('mastery')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'mastery'
                  ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>考点掌握度热力图 (Mastery Graph)</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">提分导航仪</span>
            </button>

            <button
              onClick={() => setViewMode('topology')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'topology'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <span>知识双链拓扑图</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'mastery' ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>单击红色薄弱考点，立即进入【提分急救舱】</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200/80 text-xs text-neutral-600 font-medium">
              <span>双击节点：右侧属性检查器</span>
            </div>
          )}
        </div>
      </div>

      {/* 🖥️ 桌面端 Header */}
      <div className="hidden md:flex flex-col justify-between gap-3 shrink-0 lg:flex-row lg:items-center bg-white rounded-[16px] border border-black/[0.08] p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
              {viewMode === 'mastery' ? (
                <>
                  <span className="text-rose-500">🔥</span>
                  <span>考研考点掌握度热力图</span>
                </>
              ) : (
                <span>考研全库拓扑知识图谱</span>
              )}
            </h1>
            {viewMode === 'mastery' ? (
              <span className="rounded-full bg-rose-100 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                提分急救导航模式已激活
              </span>
            ) : isRealData && (
              <span className="rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[10px] font-mono font-medium text-neutral-700">实时网络</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-neutral-500">
            {viewMode === 'mastery'
              ? '实时映射做题中心作答战况：绿色稳固攻克(>80%)、黄色中度掌握(50%~80%)、红色高危薄弱(<50%呼吸闪烁)。点击薄弱考点直通常规仿真课件与真题急救。'
              : '从笔记双向链接构建拓扑知识网络。支持平移缩放、智能标签分级、单击跳至编辑、双击检查器透视。'}
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

      {/* 🖥️ 桌面端 Metrics Row (自适应拓扑与掌握度) */}
      <div className="hidden md:grid grid-cols-4 gap-2.5 shrink-0">
        {viewMode === 'mastery' ? (
          <>
            <GraphMetric label="收录核心考点" value={totalNodes} color="text-neutral-900" />
            <GraphMetric label="稳固攻克 (≥80%)" value={masterySummary.masteredCount} color="text-emerald-600" />
            <GraphMetric label="进阶巩固 (50~80%)" value={masterySummary.moderateCount} color="text-amber-500" />
            <GraphMetric label="薄弱高危 (<50%)" value={masterySummary.criticalCount} color="text-rose-500" />
          </>
        ) : (
          <>
            <GraphMetric label="节点总数" value={totalNodes} color="text-neutral-900" />
            <GraphMetric label="双向连接" value={rawLinks.length} color="text-emerald-600" />
            <GraphMetric label="孤立笔记" value={orphanNotes} color="text-rose-500" />
            <GraphMetric label="健康度" value={overallScore || '—'} color={scoreColor} suffix={overallScore ? '/100' : undefined} />
          </>
        )}
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

          {viewMode === 'mastery' && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-50/90 via-amber-50/80 to-emerald-50/80 border border-rose-200/90 text-xs mb-2">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="font-extrabold text-rose-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  提分急救舱就绪
                </span>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="text-slate-600 hidden sm:inline">
                  红点呼吸闪烁代表做题失分率高（近 3 次做错 2 次以上）。点击红色节点直接唤起：<strong>[看仿真课件]</strong> 与 <strong>[刷 3 道同类题]</strong>！
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenCourseware('cw-avl-tree')}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>AVL树仿真课件</span>
                </button>
                <Link
                  to="/quiz"
                  className="text-[11px] font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 px-2.5 py-1 rounded-lg shadow-2xs transition-colors"
                >
                  前往做题中心 →
                </Link>
              </div>
            </div>
          )}

          {isUsingCuratedSyllabus && viewMode === 'topology' && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-50/90 to-amber-50/80 border border-indigo-200/90 text-xs mb-2">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  考研双核大纲考点拓扑
                </span>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="text-slate-600 hidden sm:inline">
                  涵盖 408 计算机与考研数学高频考点。在笔记中使用 <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-600 font-mono text-[11px]">[[双链]]</code> 即可点亮个人知识网络。
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
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="block h-full w-full touch-none select-none" style={{ touchAction: 'none' }} />

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
                  placeholder="搜索考点或标签..."
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
                匹配 <span className="font-semibold text-accent-orange">{activeNodeIds.size}</span> / {totalNodes} 考点
              </div>
            )}

            {/* Hover tooltip (floating bottom-right) */}
            {hoveredNode && (
              <div className="absolute bottom-16 right-3 z-10 bg-white/95 border border-slate-200 rounded-xl px-4 py-3 backdrop-blur-md shadow-xl max-w-xs animate-fade-in">
                <div className="text-sm font-bold text-slate-900 mb-1">{hoveredNode.label}</div>
                {viewMode === 'mastery' ? (
                  (() => {
                    const mp = getNodeMastery(hoveredNode.id, hoveredNode.label)
                    const isCritical = mp.rate < 50
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-500">掌握度：</span>
                          <span className={isCritical ? 'text-rose-600 font-bold' : mp.rate < 80 ? 'text-amber-600' : 'text-emerald-600'}>
                            {mp.rate}% ({isCritical ? '薄弱高危' : mp.rate < 80 ? '进阶巩固' : '稳固攻克'})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{mp.recentStatus}</div>
                        <div className="text-[10px] text-rose-600 font-medium pt-1 border-t border-slate-100 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          <span>点击呼出【提分急救舱】</span>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: allGroupColors[hoveredNode.group] || '#8B7355' }} />
                      <span className="text-xs text-slate-600">{allGroupLabels[hoveredNode.group] || hoveredNode.group}</span>
                    </div>
                    {hoveredNode.path && (
                      <div className="text-[10px] text-slate-400 mt-1 font-mono truncate">{hoveredNode.path}</div>
                    )}
                    <div className="text-[10px] text-slate-400 mt-1.5">双链拓扑度: {hoveredNode.linkCount}</div>
                    <div className="text-[10px] text-indigo-600 mt-1 font-medium">单击右侧检查 · 双击沉浸编辑</div>
                  </>
                )}
              </div>
            )}

            {/* Bottom Floating Legend / Filters */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 flex items-center sm:flex-wrap gap-1.5 sm:max-w-[70%] overflow-x-auto no-scrollbar">
              {viewMode === 'mastery' ? (
                // 热力图三色图例
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200/80 shadow-xs backdrop-blur-md text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>稳固攻克 (≥80%)</span>
                  </div>
                  <span className="text-slate-300">·</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>进阶巩固 (50%~80%)</span>
                  </div>
                  <span className="text-slate-300">·</span>
                  <div className="flex items-center gap-1 text-rose-600 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>薄弱高危 (&lt;50% 呼吸闪烁)</span>
                  </div>
                </div>
              ) : (
                // 传统学科分组
                groups.map(key => {
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
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Node Inspector (拓扑模式下的右侧抽屉) */}
        {viewMode === 'topology' && (previewNode || previewLoading) && (
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

      {/* 🏥 考点诊断与提分急救舱 Modal */}
      <MasteryRescueModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
        point={activeMasteryPoint}
        onOpenCourseware={handleOpenCourseware}
        onPractice={handlePracticePoint}
      />

      {/* 🔬 交互仿真课件查看器 Modal */}
      <CoursewareViewerModal
        isOpen={isCoursewareOpen}
        onClose={() => setIsCoursewareOpen(false)}
        item={activeCourseware}
      />
    </div>
  )
}

function GraphMetric({
  label,
  value,
  color,
  suffix,
}: {
  label: string
  value: number | string
  color: string
  suffix?: string
}) {
  return (
    <div className="rounded-[16px] border border-black/[0.08] bg-white p-3.5 sm:p-4 shadow-xs">
      <div className="text-[11px] font-medium text-neutral-500">{label}</div>
      <div className={`mt-1 font-mono text-xl sm:text-2xl font-bold tracking-tight ${color}`}>
        {value}
        {suffix && <span className="text-xs font-normal text-neutral-400">{suffix}</span>}
      </div>
    </div>
  )
}
