import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { useVaultGraph, useVaultHealth, useVaultStats } from '../hooks/useVaultData'
import { graphNodes as mockNodes, graphLinks as mockLinks, groupColors, groupLabels } from '../data/mockData'
import { api, type FileDetail } from '../services/api'
import {
  RefreshCw, Loader2, Search, X, FileText, Maximize2, RotateCcw,
  ZoomIn, ZoomOut, Eye, Flame, Play, ShieldAlert, Sparkles, CheckCircle2, Activity,
  HelpCircle, BookOpen, Compass, ExternalLink, ArrowRight, Lightbulb, Network
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

// 判定是否为系统内部架构/说明文档节点（普通考生默认不关心内部技术架构）
const INTERNAL_ARCH_REGEX = /(obsidian|wikilink|rag检索|vault健康|embedding|zettelkasten|\bpara\b|\blyt\b|\bmoc\b|文档摄取|知识库建设|\bmcp\b|claude\s*api|使用手册)/i

function isInternalArchNode(node: { label?: string; id?: string; path?: string }): boolean {
  const text = `${node.label || ''} ${node.id || ''} ${node.path || ''}`
  return INTERNAL_ARCH_REGEX.test(text)
}

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const simulationRef = useRef<d3.Simulation<SimNode, any> | null>(null)
  const currentTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity)
  const fitViewRef = useRef<((animate?: boolean, targetIds?: Set<string>) => void) | null>(null)
  const updateLabelsRef = useRef<(() => void) | null>(null)

  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [masteryFilter, setMasteryFilter] = useState<'all' | 'mastered' | 'moderate' | 'critical'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllLabels, setShowAllLabels] = useState(false)
  const [previewNode, setPreviewNode] = useState<FileDetail | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 })
  const dimensionsRef = useRef(dimensions)
  dimensionsRef.current = dimensions

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

  // 📖 色谱图与知识图谱专用使用说明弹窗状态
  const [showGuideModal, setShowGuideModal] = useState(false)

  // Data hooks
  const { data, loading, error, reload } = useVaultGraph()
  const { report } = useVaultHealth()
  const { stats } = useVaultStats()

  // 仅当在管理员设置中主动开启才显示系统内部架构文档节点；默认只向考生展示考试知识点图谱
  const showArchInGraph = useMemo(() => {
    try {
      return localStorage.getItem('coreforge_graph_show_arch') === 'true'
    } catch {
      return false
    }
  }, [])

  const filteredVaultData = useMemo(() => {
    if (!data || !data.nodes) return null
    if (showArchInGraph) return data
    const examNodes = data.nodes.filter(n => !isInternalArchNode(n))
    const validIds = new Set(examNodes.map(n => n.id))
    const examLinks = (data.links || []).filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as any)?.id
      const t = typeof l.target === 'string' ? l.target : (l.target as any)?.id
      return validIds.has(s) && validIds.has(t)
    })
    return { nodes: examNodes, links: examLinks }
  }, [data, showArchInGraph])

  // 考研研学知识拓扑：若过滤内部架构文档后的考试笔记节点少于 4 个，无缝展示官方考研核心大纲考点拓扑
  const isUsingCuratedSyllabus = !filteredVaultData || !filteredVaultData.nodes || filteredVaultData.nodes.length < 4

  const { nodes: rawNodes, links: rawLinks, groups } = useMemo(() => {
    if (filteredVaultData && filteredVaultData.nodes && filteredVaultData.nodes.length >= 4) {
      const grps = [...new Set(filteredVaultData.nodes.map(n => n.group))]
      return { nodes: filteredVaultData.nodes, links: filteredVaultData.links, groups: grps }
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
  }, [filteredVaultData])

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

  // Active node IDs based on search + group filter + mastery filter
  const activeNodeIds = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const hasGroupFilter = selectedGroups.size > 0
    const hasMasteryFilter = viewMode === 'mastery' && masteryFilter !== 'all'
    return new Set(
      simNodes
        .filter(n => {
          if (hasGroupFilter && !selectedGroups.has(n.group)) return false
          if (hasMasteryFilter) {
            const mp = getNodeMastery(n.id, n.label)
            if (masteryFilter === 'critical' && mp.rate >= 50) return false
            if (masteryFilter === 'moderate' && (mp.rate < 50 || mp.rate >= 80)) return false
            if (masteryFilter === 'mastered' && mp.rate < 80) return false
          }
          if (q && !n.label.toLowerCase().includes(q) && !n.tags.some(t => t.toLowerCase().includes(q))) return false
          return true
        })
        .map(n => n.id)
    )
  }, [simNodes, searchQuery, selectedGroups, viewMode, masteryFilter])

  const hasFilter = searchQuery.trim().length > 0 || selectedGroups.size > 0 || (viewMode === 'mastery' && masteryFilter !== 'all')

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

  // 掌握度统计概况 (基于节点掌握度计算，未练习节点单独统计)
  const masterySummary = useMemo(() => {
    let criticalCount = 0
    let moderateCount = 0
    let masteredCount = 0
    let unpracticedCount = 0
    simNodes.forEach(node => {
      const mp = getNodeMastery(node.id, node.label)
      if (mp.totalAttempts === 0) unpracticedCount++
      else if (mp.rate < 50) criticalCount++
      else if (mp.rate < 80) moderateCount++
      else masteredCount++
    })
    return { criticalCount, moderateCount, masteredCount, unpracticedCount, total: simNodes.length }
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

  // 获取节点视觉样式 (热力模式下：已练习点亮红/黄/绿；未练习保留学科星系色 + 虚线星环，拒绝死灰一团)
  const getNodeVisualStyle = (d: SimNode, currentViewMode: 'topology' | 'mastery') => {
    const groupColor = allGroupColors[d.group] || '#6366f1'
    if (currentViewMode === 'mastery') {
      const mp = getNodeMastery(d.id, d.label)
      if (mp.totalAttempts === 0) {
        return {
          color: groupColor,
          isUnpracticed: true,
          isCritical: false,
          coreOpacity: 0.76,
          glowOpacity: 0.14,
          strokeColor: '#ffffff',
          strokeDasharray: '3 2',
        }
      }
      if (mp.rate >= 80) {
        return {
          color: '#10b981',
          isUnpracticed: false,
          isCritical: false,
          coreOpacity: 0.96,
          glowOpacity: 0.28,
          strokeColor: '#FFFBF5',
          strokeDasharray: 'none',
        }
      }
      if (mp.rate >= 50) {
        return {
          color: '#f59e0b',
          isUnpracticed: false,
          isCritical: false,
          coreOpacity: 0.96,
          glowOpacity: 0.28,
          strokeColor: '#FFFBF5',
          strokeDasharray: 'none',
        }
      }
      return {
        color: '#ef4444',
        isUnpracticed: false,
        isCritical: true,
        coreOpacity: 0.98,
        glowOpacity: 0.34,
        strokeColor: '#FFFBF5',
        strokeDasharray: 'none',
      }
    }
    return {
      color: groupColor,
      isUnpracticed: false,
      isCritical: false,
      coreOpacity: 0.95,
      glowOpacity: 0.22,
      strokeColor: '#FFFBF5',
      strokeDasharray: 'none',
    }
  }

  // D3 force simulation (仅在节点/连线数据变化时重建，切换视图或缩放窗口时平滑过渡不闪烁)
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    const { width: initW, height: initH } = dimensionsRef.current

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

    // 考研学科图谱力学配置：保持流体弹性与舒适收敛速度，既有灵动物理感又能稳稳停驻点击
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .alphaDecay(0.025)
      .velocityDecay(0.35)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance((d: any) => {
        const linksSum = ((d.source as SimNode).linkCount || 1) + ((d.target as SimNode).linkCount || 1)
        return Math.max(95, 145 - Math.min(35, linksSum * 3))
      }).strength(0.45))
      .force('charge', d3.forceManyBody().strength((d: any) => {
        const count = (d as SimNode).linkCount || 1
        return -260 - Math.min(200, count * 14)
      }).distanceMax(700))
      .force('center', d3.forceCenter(initW / 2, initH / 2).strength(0.05))
      .force('x', d3.forceX(initW / 2).strength(0.022))
      .force('y', d3.forceY(initH / 2).strength(0.022))
      .force('collision', d3.forceCollide<SimNode>().radius(d => {
        const labelLen = Math.min(16, d.label ? d.label.length : 4)
        return Math.max(d.r + 26, labelLen * 6.2 + 12)
      }).strength(0.88))

    simulationRef.current = simulation

    // 精致浅点阵画布底纹
    const defs = svg.append('defs')
    const dotPattern = defs.append('pattern')
      .attr('id', 'graph-dot-grid')
      .attr('width', 24)
      .attr('height', 24)
      .attr('patternUnits', 'userSpaceOnUse')
    dotPattern.append('circle')
      .attr('cx', 12)
      .attr('cy', 12)
      .attr('r', 1)
      .attr('fill', '#cbd5e1')
      .attr('opacity', 0.45)

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#graph-dot-grid)')
      .style('pointer-events', 'none')

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
      .attr('stroke', '#CBD5E1')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.45)
      .attr('stroke-linecap', 'round')

    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'grab')
      .call(
        (() => {
          let isDraggingSim = false
          return d3.drag<SVGGElement, SimNode>()
            .clickDistance(5)
            .on('start', function (_event, d) {
              isDraggingSim = false
              d3.select(this).style('cursor', 'grabbing')
              d.fx = d.x
              d.fy = d.y
            })
            .on('drag', (event, d) => {
              // 注意：d3-drag 在 drag 回调期间 event.active === 1，不能用 !event.active 判断
              if (!isDraggingSim) {
                isDraggingSim = true
                simulation.alphaTarget(0.35).restart()
              }
              d.fx = event.x
              d.fy = event.y
            })
            .on('end', function (event, d) {
              d3.select(this).style('cursor', 'grab')
              if (isDraggingSim && !event.active) {
                simulation.alphaTarget(0)
              }
              isDraggingSim = false
              d.fx = null
              d.fy = null
            })
        })()
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
        navigateRef.current(`/editor?path=${encodeURIComponent(d.path)}`)
      }
    })

    // 🔥 高危薄弱考点呼吸脉冲光晕 (仅在掌握度热力图模式且已练习薄弱时展示)
    node.each(function (d: SimNode) {
      const el = d3.select(this)
      const mp = getNodeMastery(d.id, d.label)
      const isCritical = mp.totalAttempts > 0 && mp.rate < 50

      if (isCritical) {
        const pulse = el.append('circle')
          .attr('r', d.r + 10)
          .attr('fill', '#ef4444')
          .attr('opacity', 0.25)
          .attr('class', 'critical-pulse')
          .style('display', viewModeRef.current === 'mastery' ? 'inline' : 'none')

        pulse.append('animate')
          .attr('attributeName', 'r')
          .attr('values', `${d.r + 6};${d.r + 16};${d.r + 6}`)
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite')

        pulse.append('animate')
          .attr('attributeName', 'opacity')
          .attr('values', '0.35;0.08;0.35')
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite')
      }
    })

    // Node outer glow
    node.append('circle')
      .attr('r', (d: SimNode) => d.r + 5)
      .attr('fill', (d: SimNode) => getNodeVisualStyle(d, viewModeRef.current).color)
      .attr('opacity', (d: SimNode) => getNodeVisualStyle(d, viewModeRef.current).glowOpacity)
      .attr('class', 'node-glow')

    // Node core circle
    node.append('circle')
      .attr('r', (d: SimNode) => d.r)
      .attr('fill', (d: SimNode) => getNodeVisualStyle(d, viewModeRef.current).color)
      .attr('stroke', (d: SimNode) => getNodeVisualStyle(d, viewModeRef.current).strokeColor)
      .attr('stroke-width', 2.2)
      .attr('stroke-dasharray', (d: SimNode) => getNodeVisualStyle(d, viewModeRef.current).strokeDasharray)
      .attr('opacity', (d: SimNode) => getNodeVisualStyle(d, viewModeRef.current).coreOpacity)
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
          if (k >= 1.45) return 'inline'
          if (k >= 0.95) return (d.linkCount >= 1 || d.r >= 6) ? 'inline' : 'none'
          if (k >= 0.65) return (d.linkCount >= 2 || d.r >= 7) ? 'inline' : 'none'
          return (d.linkCount >= 3 || d.r >= 9) ? 'inline' : 'none'
        })
    }
    updateLabelsRef.current = updateLabels

    // Hover interactions: 1-hop neighbor highlighting & label activation
    node.on('mouseenter', function (_event, d) {
      setHoveredNode(d)
      hoveredNodeRef.current = d
      const neighbors = neighborMap.get(d.id) || new Set<string>()
      const style = getNodeVisualStyle(d, viewModeRef.current)

      d3.select(this).select('.node-circle')
        .transition().duration(140)
        .attr('r', d.r + 3.5)
        .attr('opacity', 1)
      d3.select(this).select('.node-glow')
        .transition().duration(140)
        .attr('r', d.r + 11)
        .attr('opacity', 0.42)

      // Highlight active node & neighbors, dim non-neighbors
      node.transition().duration(140)
        .style('opacity', n => (n.id === d.id || neighbors.has(n.id) ? 1 : 0.16))

      // Highlight connected links
      link.transition().duration(140)
        .attr('stroke-opacity', (l: any) => {
          const sId = l.source.id || l.source
          const tId = l.target.id || l.target
          return sId === d.id || tId === d.id ? 0.92 : 0.05
        })
        .attr('stroke-width', (l: any) => {
          const sId = l.source.id || l.source
          const tId = l.target.id || l.target
          return sId === d.id || tId === d.id ? 2.6 : 1.1
        })
        .attr('stroke', (l: any) => {
          const sId = l.source.id || l.source
          const tId = l.target.id || l.target
          return sId === d.id || tId === d.id ? style.color : '#CBD5E1'
        })

      updateLabels()
    }).on('mouseleave', function (_event, d) {
      setHoveredNode(null)
      hoveredNodeRef.current = null
      const style = getNodeVisualStyle(d, viewModeRef.current)

      d3.select(this).select('.node-circle')
        .transition().duration(140)
        .attr('r', d.r)
        .attr('opacity', style.coreOpacity)
      d3.select(this).select('.node-glow')
        .transition().duration(140)
        .attr('r', d.r + 5)
        .attr('opacity', style.glowOpacity)

      // Restore opacity based on search/group/mastery filter
      node.transition().duration(140)
        .style('opacity', n => {
          if (!hasFilterRef.current) return 1
          return activeNodeIdsRef.current.has(n.id) ? 1 : 0.05
        })
        .style('pointer-events', n => {
          if (!hasFilterRef.current) return 'auto'
          return activeNodeIdsRef.current.has(n.id) ? 'auto' : 'none'
        })

      link.transition().duration(140)
        .attr('stroke-opacity', (l: any) => {
          if (!hasFilterRef.current) return 0.45
          const sActive = activeNodeIdsRef.current.has(l.source.id || l.source)
          const tActive = activeNodeIdsRef.current.has(l.target.id || l.target)
          return (sActive && tActive) ? 0.78 : 0.025
        })
        .attr('stroke-width', (l: any) => {
          if (!hasFilterRef.current) return 1.5
          const sActive = activeNodeIdsRef.current.has(l.source.id || l.source)
          const tActive = activeNodeIdsRef.current.has(l.target.id || l.target)
          return (sActive && tActive) ? 2 : 1
        })
        .attr('stroke', '#CBD5E1')

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

    // True Fit View: calculates bounding box (full or filtered subset) and smooth-centers graph in canvas
    const fitView = (animate = true, targetIds?: Set<string>) => {
      if (!svgRef.current || nodes.length === 0) return
      const targetNodes = targetIds && targetIds.size > 0
        ? nodes.filter(d => targetIds.has(d.id))
        : nodes
      if (targetNodes.length === 0) return

      const { width: curW, height: curH } = dimensionsRef.current
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      for (const d of targetNodes) {
        if (d.x == null || d.y == null || !isFinite(d.x) || !isFinite(d.y)) continue
        if (d.x - d.r < minX) minX = d.x - d.r
        if (d.x + d.r > maxX) maxX = d.x + d.r
        if (d.y - d.r < minY) minY = d.y - d.r
        if (d.y + d.r > maxY) maxY = d.y + d.r
      }
      if (!isFinite(minX) || !isFinite(maxX)) return

      const graphWidth = Math.max(220, maxX - minX)
      const graphHeight = Math.max(180, maxY - minY)
      const midX = (minX + maxX) / 2
      const midY = (minY + maxY) / 2

      const pad = 64
      const availW = Math.max(120, curW - pad * 2)
      const availH = Math.max(120, curH - pad * 2)

      const maxScale = targetIds && targetIds.size > 0 ? 1.45 : 1.25
      const scale = Math.max(0.15, Math.min(maxScale, Math.min(availW / graphWidth, availH / graphHeight)))
      const tx = curW / 2 - scale * midX
      const ty = curH / 2 - scale * midY

      const t = d3.zoomIdentity.translate(tx, ty).scale(scale)
      currentTransformRef.current = t

      if (animate) {
        svg.transition().duration(500).ease(d3.easeCubicOut).call(zoom.transform, t)
      } else {
        svg.call(zoom.transform, t)
      }
      updateLabels(scale)
    }

    fitViewRef.current = fitView

    // 轻度预热 35 步：避免初始团簇重合，同时保留充沛能量让星系动态舒展收敛
    simulation.alpha(1)
    for (let i = 0; i < 35; ++i) {
      simulation.tick()
    }
    link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y)
    node.attr('transform', (d: SimNode) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    fitView(false)
    updateLabels()

    // 保持力导向引擎活水运转，约 650ms 后平滑居中聚焦
    simulation.alpha(0.45).restart()
    const fitTimer = setTimeout(() => {
      fitView(true)
    }, 650)

    return () => {
      clearTimeout(fitTimer)
      simulation.stop()
      simulationRef.current = null
      zoomRef.current = null
      fitViewRef.current = null
      updateLabelsRef.current = null
    }
  }, [simNodes, rawLinks])

  // 窗口/容器尺寸变化时温和调整力中心并自适应视图，不销毁重算节点坐标
  useEffect(() => {
    const sim = simulationRef.current
    if (!sim) return
    const { width, height } = dimensions
    sim.force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
    sim.force('x', d3.forceX(width / 2).strength(0.022))
    sim.force('y', d3.forceY(height / 2).strength(0.022))
    fitViewRef.current?.(false)
  }, [dimensions])

  // 切换【热力图 / 拓扑图】时原地平滑过渡配色与脉冲光晕，不破坏当前力学位置与缩放
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)

    svg.selectAll<SVGCircleElement, SimNode>('.node-circle')
      .transition().duration(260)
      .attr('fill', d => getNodeVisualStyle(d, viewMode).color)
      .attr('stroke', d => getNodeVisualStyle(d, viewMode).strokeColor)
      .attr('stroke-dasharray', d => getNodeVisualStyle(d, viewMode).strokeDasharray)
      .attr('opacity', d => getNodeVisualStyle(d, viewMode).coreOpacity)

    svg.selectAll<SVGCircleElement, SimNode>('.node-glow')
      .transition().duration(260)
      .attr('fill', d => getNodeVisualStyle(d, viewMode).color)
      .attr('opacity', d => getNodeVisualStyle(d, viewMode).glowOpacity)

    svg.selectAll<SVGCircleElement, SimNode>('.critical-pulse')
      .style('display', d => {
        if (viewMode !== 'mastery') return 'none'
        if (hasFilterRef.current && !activeNodeIdsRef.current.has(d.id)) return 'none'
        return 'inline'
      })
  }, [viewMode])

  const hadFilterRef = useRef(false)

  // Update node/link opacity, pointer-events, pulses and camera focus when search/group/mastery filter changes
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)

    svg.selectAll<SVGGElement, SimNode>('.node')
      .style('pointer-events', d => {
        if (!hasFilter) return 'auto'
        return activeNodeIds.has(d.id) ? 'auto' : 'none'
      })
      .transition().duration(220)
      .style('opacity', d => {
        if (!hasFilter) return 1
        return activeNodeIds.has(d.id) ? 1 : 0.05
      })

    svg.selectAll<SVGCircleElement, SimNode>('.node-circle')
      .transition().duration(220)
      .attr('r', d => {
        if (!hasFilter) return d.r
        return activeNodeIds.has(d.id) ? d.r + 2 : Math.max(4, d.r * 0.85)
      })

    svg.selectAll<SVGCircleElement, SimNode>('.critical-pulse')
      .style('display', d => {
        if (viewMode !== 'mastery') return 'none'
        if (hasFilter && !activeNodeIds.has(d.id)) return 'none'
        return 'inline'
      })

    svg.selectAll<SVGLineElement, any>('line')
      .transition().duration(220)
      .attr('stroke-opacity', (l: any) => {
        if (!hasFilter) return 0.45
        const sActive = activeNodeIds.has(l.source.id || l.source)
        const tActive = activeNodeIds.has(l.target.id || l.target)
        return (sActive && tActive) ? 0.78 : 0.025
      })
      .attr('stroke-width', (l: any) => {
        if (!hasFilter) return 1.5
        const sActive = activeNodeIds.has(l.source.id || l.source)
        const tActive = activeNodeIds.has(l.target.id || l.target)
        return (sActive && tActive) ? 2 : 1
      })

    updateLabelsRef.current?.()

    if (hasFilter) {
      hadFilterRef.current = true
      if (activeNodeIds.size > 0 && !searchQuery.trim()) {
        fitViewRef.current?.(true, activeNodeIds)
      }
    } else if (hadFilterRef.current) {
      hadFilterRef.current = false
      fitViewRef.current?.(true)
    }
  }, [activeNodeIds, hasFilter, showAllLabels, viewMode, searchQuery])

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const toggleMasteryFilter = (tier: 'all' | 'mastered' | 'moderate' | 'critical') => {
    setMasteryFilter(prev => (prev === tier ? 'all' : tier))
  }

  const totalNodes = rawNodes.length
  const isRealData = Boolean(data)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedGroups(new Set())
    setMasteryFilter('all')
  }

  const resetView = () => {
    fitViewRef.current?.(true)
  }

  const reheatSimulation = () => {
    simulationRef.current?.alpha(0.65).restart()
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
            className={`px-2 py-0.5 rounded-full text-2xs font-bold flex items-center gap-1 ${
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
          <button
            onClick={() => setShowGuideModal(true)}
            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 active:scale-95"
            aria-label="色谱图与图谱说明"
            title="查看色谱图与图谱使用说明"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
          {hasFilter && (
            <button onClick={clearFilters} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-2xs font-semibold">
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
          <div className="flex items-center p-1 bg-white border border-slate-200/80 rounded-full shadow-xs">
            <button
              onClick={() => setViewMode('mastery')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'mastery'
                  ? 'bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>考点掌握度热力图 (Mastery Graph)</span>
              <span className="text-2xs bg-white/20 px-1.5 py-0.2 rounded-full">提分导航仪</span>
            </button>

            <button
              onClick={() => setViewMode('topology')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'topology'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>知识双链拓扑图</span>
            </button>
          </div>

          {/* 色谱图与图谱专用使用说明胶囊 */}
          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
            title="查看色谱图与知识图谱的功能作用与使用说明"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span>色谱与图谱说明</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'mastery' ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>单击红色薄弱考点，立即进入【提分急救舱】</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs text-slate-600 font-medium">
              <span>双击节点：右侧属性检查器</span>
            </div>
          )}
        </div>
      </div>

      {/* 🖥️ 桌面端 Header */}
      <div className="hidden md:flex flex-col justify-between gap-3 shrink-0 lg:flex-row lg:items-center bg-white rounded-2xl border border-black/[0.08] p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
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
              <span className="rounded-full bg-rose-100 border border-rose-200 px-2.5 py-0.5 text-2xs font-bold text-rose-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                提分急救导航模式已激活
              </span>
            ) : isRealData && (
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-2xs font-mono font-medium text-slate-700">实时网络</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {viewMode === 'mastery'
              ? '实时映射做题中心作答战况：绿色稳固攻克(>80%)、黄色中度掌握(50%~80%)、红色高危薄弱(<50%呼吸闪烁)。点击薄弱考点直通常规仿真课件与真题急救。'
              : '从笔记双向链接构建拓扑知识网络。支持平移缩放、智能标签分级、单击跳至编辑、双击检查器透视。'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={resetView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer shadow-xs transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            适配全景
          </button>
          <button
            onClick={() => setShowAllLabels(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer ${
              showAllLabels
                ? 'bg-slate-900 text-white font-semibold'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {showAllLabels ? '全部标签' : '智能标签'}
          </button>
          <button
            onClick={clearFilters}
            disabled={!hasFilter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            清除筛选
          </button>
          <button
            onClick={reload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            重新构建
          </button>
        </div>
      </div>

      {/* 🖥️ 桌面端 Metrics Row (自适应拓扑与掌握度；点击可直接筛选对应考点等级) */}
      <div className="hidden md:grid grid-cols-4 gap-2.5 shrink-0">
        {viewMode === 'mastery' ? (
          <>
            <GraphMetric
              label="收录核心考点 (点击查看全部)"
              value={totalNodes}
              color="text-slate-900"
              active={masteryFilter === 'all'}
              activeRingClass="border-slate-900 ring-1 ring-slate-900/15 bg-slate-50/70"
              onClick={() => setMasteryFilter('all')}
            />
            <GraphMetric
              label="稳固攻克 (≥80% · 点击筛选)"
              value={masterySummary.masteredCount}
              color="text-emerald-600"
              active={masteryFilter === 'mastered'}
              activeRingClass="border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50"
              onClick={() => toggleMasteryFilter('mastered')}
            />
            <GraphMetric
              label="进阶巩固 (50~80% · 点击筛选)"
              value={masterySummary.moderateCount}
              color="text-amber-500"
              active={masteryFilter === 'moderate'}
              activeRingClass="border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50"
              onClick={() => toggleMasteryFilter('moderate')}
            />
            <GraphMetric
              label="薄弱高危 (<50% · 点击筛选)"
              value={masterySummary.criticalCount}
              color="text-rose-500"
              active={masteryFilter === 'critical'}
              activeRingClass="border-rose-500 ring-2 ring-rose-500/25 bg-rose-50/60"
              onClick={() => toggleMasteryFilter('critical')}
            />
          </>
        ) : (
          <>
            <GraphMetric label="节点总数" value={totalNodes} color="text-slate-900" />
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
                  className="text-2xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs transition-colors flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>AVL树仿真课件</span>
                </button>
                <Link
                  to="/quiz"
                  className="text-2xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 px-2.5 py-1 rounded-lg shadow-xs transition-colors"
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
                  涵盖 408 计算机与考研数学高频考点。在笔记中使用 <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-600 font-mono text-2xs">[[双链]]</code> 即可点亮个人知识网络。
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/study"
                  className="text-2xs font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs transition-colors"
                >
                  浏览考研讲义 →
                </Link>
                <Link
                  to="/editor"
                  className="text-2xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-lg shadow-xs transition-colors"
                >
                  + 新建考研笔记
                </Link>
              </div>
            </div>
          )}

          <div
            ref={containerRef}
            className="relative flex-1 min-h-[420px] md:min-h-[500px] overflow-hidden sm:rounded-xl sm:border sm:border-slate-200/80 bg-slate-50/50 shadow-xs select-none"
          >
            <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="block h-full w-full touch-none select-none" style={{ touchAction: 'none' }} />

            {/* Floating on-canvas controls (top-left) */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 rounded-lg border border-slate-200/80 bg-white/95 p-1 shadow-xs backdrop-blur-md">
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
              <button
                onClick={reheatSimulation}
                title="物理散开重排（拨动图谱星系）"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-warm-600 hover:bg-cream-100 hover:text-indigo-600 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
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
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-surface/90 backdrop-blur-md border border-cream-200 text-2xs text-warm-600 shadow-sm">
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
                    const isUnpracticed = mp.totalAttempts === 0
                    const isCritical = !isUnpracticed && mp.rate < 50
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-500">掌握度：</span>
                          {isUnpracticed ? (
                            <span className="text-indigo-600 font-semibold">待点亮（{allGroupLabels[hoveredNode.group] || hoveredNode.group}）</span>
                          ) : (
                            <span className={isCritical ? 'text-rose-600 font-bold' : mp.rate < 80 ? 'text-amber-600' : 'text-emerald-600'}>
                              {mp.rate}% ({isCritical ? '薄弱高危' : mp.rate < 80 ? '进阶巩固' : '稳固攻克'})
                            </span>
                          )}
                        </div>
                        <div className="text-2xs text-slate-500">{mp.recentStatus}</div>
                        <div className={`text-2xs font-medium pt-1 border-t border-slate-100 flex items-center gap-1 ${isUnpracticed ? 'text-indigo-600' : 'text-rose-600'}`}>
                          <Flame className="w-3 h-3" />
                          <span>{isUnpracticed ? '点击开启诊断 · 做 3 题点亮掌握度' : '点击呼出【提分急救舱】'}</span>
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
                      <div className="text-2xs text-slate-400 mt-1 font-mono truncate">{hoveredNode.path}</div>
                    )}
                    <div className="text-2xs text-slate-400 mt-1.5">双链拓扑度: {hoveredNode.linkCount}</div>
                    <div className="text-2xs text-indigo-600 mt-1 font-medium">单击右侧检查 · 双击沉浸编辑</div>
                  </>
                )}
              </div>
            )}

            {/* Bottom Floating Legend / Interactive Filters */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 flex items-center sm:flex-wrap gap-1.5 sm:max-w-[76%] overflow-x-auto no-scrollbar">
              {viewMode === 'mastery' ? (
                // 热力图可点击分级筛选栏
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-md text-xs font-medium text-slate-700 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setMasteryFilter('all')}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      masteryFilter === 'all'
                        ? 'bg-slate-900 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    全部 ({totalNodes})
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMasteryFilter('mastered')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      masteryFilter === 'mastered'
                        ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                        : 'hover:bg-emerald-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${masteryFilter === 'mastered' ? 'bg-white' : 'bg-emerald-500'}`} />
                    <span>稳固攻克 ({masterySummary.masteredCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMasteryFilter('moderate')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      masteryFilter === 'moderate'
                        ? 'bg-amber-500 text-white font-bold shadow-2xs'
                        : 'hover:bg-amber-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${masteryFilter === 'moderate' ? 'bg-white' : 'bg-amber-500'}`} />
                    <span>进阶普通 ({masterySummary.moderateCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMasteryFilter('critical')}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      masteryFilter === 'critical'
                        ? 'bg-rose-600 text-white font-bold shadow-2xs'
                        : 'hover:bg-rose-50 text-rose-600 font-bold'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${masteryFilter === 'critical' ? 'bg-white' : 'bg-rose-500 animate-ping'}`} />
                    <span>危机高危 ({masterySummary.criticalCount})</span>
                  </button>
                </div>
              ) : (
                // 拓扑学科分组可点击筛选栏
                <div className="flex items-center sm:flex-wrap gap-1.5 px-2 py-1.5 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-md">
                  {selectedGroups.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedGroups(new Set())}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-2xs font-bold shadow-2xs cursor-pointer"
                    >
                      全部
                    </button>
                  )}
                  {groups.map(key => {
                    const isExplicitSelected = selectedGroups.has(key)
                    const isActive = selectedGroups.size === 0 || isExplicitSelected
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => toggleGroup(key)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs transition-all cursor-pointer ${
                          isExplicitSelected
                            ? 'bg-slate-900 text-white font-bold shadow-sm ring-1 ring-slate-900/20'
                            : isActive
                              ? 'bg-slate-100/90 text-slate-700 hover:bg-slate-200/80 font-medium'
                              : 'bg-slate-100/60 text-slate-400 hover:text-slate-600 opacity-45'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: allGroupColors[key] || '#8B7355' }} />
                        <span>{allGroupLabels[key] || key}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Node Inspector (拓扑模式下的右侧抽屉) */}
        {viewMode === 'topology' && (previewNode || previewLoading) && (
          <div className="fixed inset-x-3 bottom-16 top-24 z-40 md:static md:w-80 md:inset-auto md:z-auto shrink-0 h-auto md:h-full flex flex-col rounded-2xl border border-black/[0.08] bg-white p-4 shadow-xl md:shadow-xs overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-2xs font-bold tracking-wider uppercase text-slate-400 font-mono">NODE INSPECTOR</span>
              </div>
              <button
                onClick={() => setPreviewNode(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {previewLoading && (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-slate-900 animate-spin" />
              </div>
            )}
            {previewNode && !previewLoading && (
              <div className="flex-1 flex flex-col min-h-0 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {previewNode.title}
                  </h3>
                  <div className="text-2xs text-slate-400 font-mono mt-0.5 truncate">{previewNode.path}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-200/80">
                    <div className="text-2xs text-slate-400 font-medium">双链拓扑度</div>
                    <div className="font-bold font-mono text-slate-900 mt-0.5">{previewNode.links.length} Degree</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50/80 border border-slate-200/80">
                    <div className="text-2xs text-slate-400 font-medium">总词字数</div>
                    <div className="font-bold font-mono text-slate-900 mt-0.5">{previewNode.wordCount} 字</div>
                  </div>
                </div>

                {previewNode.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {previewNode.tags.map(tag => (
                      <span key={tag} className="text-2xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto text-xs text-slate-600 leading-relaxed whitespace-pre-wrap pr-1 border-t border-slate-100 pt-2 font-mono">
                  {previewNode.content.substring(0, 1500)}
                  {previewNode.content.length > 1500 && (
                    <div className="mt-2 text-slate-400 italic text-2xs">... (内容较长，点击下方按钮在完整编辑器中阅读)</div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      navigate(`/editor?path=${encodeURIComponent(previewNode.path)}`)
                      setPreviewNode(null)
                    }}
                    className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

      {/* 📖 色谱图与知识图谱专项使用说明 Modal */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-sm animate-fade-in font-sans"
          onClick={() => setShowGuideModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white border border-neutral-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-neutral-900"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5 bg-neutral-50/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-neutral-900 text-white shadow-2xs">
                  <Flame className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    考点色谱图与知识图谱 · 核心作用与使用说明
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    一分钟掌握红黄绿三级提分色谱、双链星系与提分急救舱的交互秘籍
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 内容区 */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-neutral-700 leading-relaxed">
              {/* 板块 1: 考点掌握度热力色谱图 */}
              <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-rose-900 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <span>一、考点掌握度热力色谱图 (Mastery Spectrum)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    提分导航
                  </span>
                </div>
                <p className="text-neutral-600">
                  <b>核心作用</b>：打破静态死记大纲，根据您的全真做题战绩与闪卡自评，将 408 与考研数学考点动态渲染为红、黄、绿三级色谱，一目了然识别知识漏洞。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-emerald-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>稳固攻克 (≥80%)</span>
                    </div>
                    <span className="text-[10.5px] text-neutral-500 mt-1">真题高正确率，已建立深层记忆，维持日常低频复盘即可。</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-amber-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>巩固掌握 (50%~80%)</span>
                    </div>
                    <span className="text-[10.5px] text-neutral-500 mt-1">概念基本理解，但真题演算易卡壳或粗心计算错误。</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-rose-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span>高危薄弱 (&lt;50%)</span>
                    </div>
                    <span className="text-[10.5px] text-neutral-500 mt-1">带<b>呼吸脉冲光晕</b>！错题集中区，提分最快的重点攻坚目标。</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-rose-100 text-[11px] text-neutral-600 space-y-1">
                  <div className="font-bold text-rose-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>提分急救舱实战操作技巧：</span>
                  </div>
                  <div>• <b>单击考点节点</b>：立刻呼出【考点诊断与提分急救舱】；</div>
                  <div>• <b>查看错题档案</b>：回溯曾在该考点因何种原因做错（概念混淆/计算疏漏）；</div>
                  <div>• <b>开启 5 题靶向速测</b>：急救舱直接为你抽取同考点变式题，做完立即出分并回写色谱；</div>
                  <div>• <b>算法仿真课件联动</b>：针对红黑树、LRU页面置换、TCP握手等抽象原理，直接一键打开交互动画单步演练。</div>
                </div>
              </div>

              {/* 板块 2: 全库双链知识拓扑图谱 */}
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-purple-900 flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-purple-600" />
                    <span>二、全库双链知识拓扑图谱 (Knowledge Graph)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    D3拓扑星系
                  </span>
                </div>
                <p className="text-neutral-600">
                  <b>核心作用</b>：基于 D3 物理力导向引擎，将本地 Obsidian 笔记中通过 <code className="px-1 py-0.2 rounded bg-white font-mono text-purple-800 border border-purple-200">[[双链]]</code> 建立的网状关联全面可视化。
                </p>
                <div className="space-y-1.5 text-[11px] text-neutral-600 pl-1">
                  <div>• <b>节点半径大小</b>：节点越大，说明该笔记在知识库中的出入度引用频次越高，是跨章节的核心枢纽；</div>
                  <div>• <b>孤立节点排查 (Orphan Notes)</b>：带橙色警示边框的节点，代表尚未建立任何关联，二轮复习时应利用双链将其织入知识体系；</div>
                  <div>• <b>双击节点唤出抽屉</b>：双击任意考点，右侧滑出属性检查器，无需跳出即可浏览 Markdown 讲义正文与目录大纲；</div>
                  <div>• <b>画布漫游</b>：滚轮平滑缩放、拖拽平移，点击顶部「适配全景」一键智能居中。</div>
                </div>
              </div>
            </div>

            {/* 底部按钮栏 */}
            <div className="border-t border-neutral-100 px-5 py-3 bg-neutral-50/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowGuideModal(false)
                  window.dispatchEvent(
                    new CustomEvent('open-user-guide', {
                      detail: { tab: 'doc', category: 'spectrum_graph', featureId: 'mastery-spectrum' }
                    })
                  )
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>在系统手册中查阅所有 22 项小功能说明字典 →</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GraphMetric({
  label,
  value,
  color,
  suffix,
  onClick,
  active,
  activeRingClass,
}: {
  label: string
  value: number | string
  color: string
  suffix?: string
  onClick?: () => void
  active?: boolean
  activeRingClass?: string
}) {
  const interactiveCls = onClick
    ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm active:scale-[0.99] transition-all text-left'
    : ''
  const ringCls = active && activeRingClass ? activeRingClass : 'border-black/[0.08] bg-white'
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
      className={`rounded-2xl border p-3.5 sm:p-4 shadow-xs ${ringCls} ${interactiveCls}`}
    >
      <div className="text-2xs font-medium text-slate-500">{label}</div>
      <div className={`mt-1 font-mono text-xl sm:text-2xl font-bold tracking-tight ${color}`}>
        {value}
        {suffix && <span className="text-xs font-normal text-slate-400">{suffix}</span>}
      </div>
    </div>
  )
}
