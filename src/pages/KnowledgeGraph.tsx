import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { useVaultGraph, useVaultHealth, useVaultStats } from '../hooks/useVaultData'
import { graphNodes as mockNodes, graphLinks as mockLinks, groupColors, groupLabels } from '../data/mockData'
import { api, type FileDetail } from '../services/api'
import { RefreshCw, Loader2, Search, X, Heart, FileText, Link2, AlertCircle, Tag } from 'lucide-react'

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

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [previewNode, setPreviewNode] = useState<FileDetail | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 })
  const [showStats, setShowStats] = useState(true)

  // Data hooks (merged from Dashboard)
  const { data, loading, error, reload } = useVaultGraph()
  const { report } = useVaultHealth()
  const { stats } = useVaultStats()

  // Use real data if available, else fallback to mock
  const { nodes: rawNodes, links: rawLinks, groups } = useMemo(() => {
    if (data && data.nodes.length > 0) {
      const groups = [...new Set(data.nodes.map(n => n.group))]
      return { nodes: data.nodes, links: data.links, groups }
    }
    const nodes = mockNodes.map(n => ({
      id: n.id, label: n.label, group: n.group, size: n.r,
      path: n.id, tags: [], linkCount: 0,
    }))
    const links = mockLinks.map(l => ({ source: l.source, target: l.target, value: 1 }))
    return { nodes, links, groups: [...new Set(mockNodes.map(n => n.group))] }
  }, [data])

  const simNodes: SimNode[] = useMemo(() =>
    rawNodes.map(d => ({
      id: d.id,
      label: d.label,
      group: d.group,
      r: d.size || 6,
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
    return new Set(simNodes.filter(n => {
      if (hasGroupFilter && !selectedGroups.has(n.group)) return false
      if (q && !n.label.toLowerCase().includes(q) && !n.tags.some(t => t.toLowerCase().includes(q))) return false
      return true
    }).map(n => n.id))
  }, [simNodes, searchQuery, selectedGroups])

  const hasFilter = searchQuery.trim().length > 0 || selectedGroups.size > 0

  // ── Floating stats data (from Dashboard) ────────────────────────────────────
  const overallScore = report?.overallScore ?? 0
  const scoreColor = overallScore >= 80 ? 'text-accent-sage' : overallScore >= 60 ? 'text-accent-amber' : 'text-accent-rose'
  const totalNotes = stats?.totalNotes ?? 0
  const totalLinks = stats?.totalLinks ?? 0
  const orphanNotes = stats?.orphanNotes ?? 0
  const totalTags = stats?.totalTags ?? 0

  // Resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setDimensions({ width: Math.max(400, width), height: Math.max(400, height) })
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

    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius(d => d.r + 8))

    const g = svg.append('g')

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => g.attr('transform', event.transform))
    svg.call(zoom)

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#D4B896')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.4)

    const node = g.append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x; d.fy = d.y
          })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null; d.fy = null
          })
      )

    // Click to navigate
    node.on('click', (_event, d) => {
      if (d.path) {
        navigate(`/editor?path=${encodeURIComponent(d.path)}`)
      }
    })

    // Double-click to preview
    node.on('dblclick', (event, d) => {
      event.stopPropagation()
      if (d.path) {
        setPreviewLoading(true)
        api.getFile(d.path)
          .then(note => setPreviewNode(note))
          .catch(() => {})
          .finally(() => setPreviewLoading(false))
      }
    })

    node.append('circle')
      .attr('r', (d: SimNode) => d.r + 4)
      .attr('fill', (d: SimNode) => allGroupColors[d.group] || '#8B7355')
      .attr('opacity', 0.15)
      .attr('class', 'node-glow')

    node.append('circle')
      .attr('r', (d: SimNode) => d.r)
      .attr('fill', (d: SimNode) => allGroupColors[d.group] || '#8B7355')
      .attr('stroke', '#FFFBF5')
      .attr('stroke-width', 2.5)
      .attr('opacity', 0.9)
      .attr('class', 'node-circle')

    node.append('text')
      .text((d: SimNode) => d.label)
      .attr('dy', (d: SimNode) => d.r + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#8B7355')
      .attr('font-size', '10px')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('pointer-events', 'none')

    node.on('mouseenter', function (_event, d) {
      setHoveredNode(d)
      d3.select(this).select('.node-circle')
        .transition().duration(150)
        .attr('r', d.r + 3)
        .attr('opacity', 1)
      d3.select(this).select('.node-glow')
        .transition().duration(150)
        .attr('r', d.r + 8)
        .attr('opacity', 0.3)
      const color = allGroupColors[d.group] || '#8B7355'
      link.attr('stroke-opacity', (l: any) =>
        l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.1
      ).attr('stroke-width', (l: any) =>
        l.source.id === d.id || l.target.id === d.id ? 2.5 : 1
      ).attr('stroke', (l: any) =>
        l.source.id === d.id || l.target.id === d.id ? color : '#D4B896'
      )
    }).on('mouseleave', function (_event, d) {
      setHoveredNode(null)
      d3.select(this).select('.node-circle')
        .transition().duration(150)
        .attr('r', d.r)
        .attr('opacity', 0.9)
      d3.select(this).select('.node-glow')
        .transition().duration(150)
        .attr('r', d.r + 4)
        .attr('opacity', 0.15)
      link.attr('stroke-opacity', 0.4).attr('stroke-width', 1.5).attr('stroke', '#D4B896')
    })

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)
      node.attr('transform', (d: SimNode) => `translate(${d.x},${d.y})`)
    })

    return () => { simulation.stop() }
  }, [dimensions, simNodes, rawLinks, navigate])

  // Update node/link opacity based on search + group filter
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
        if (!hasFilter) return 0.4
        const sActive = activeNodeIds.has(l.source.id || l.source)
        const tActive = activeNodeIds.has(l.target.id || l.target)
        return (sActive && tActive) ? 0.6 : 0.03
      })
  }, [activeNodeIds, hasFilter])

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const totalNodes = rawNodes.length
  const isRealData = data && data.nodes.length > 0

  return (
    <div className="h-full flex gap-4">
      {/* Main graph area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-warm-500 px-2 mb-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            加载图谱数据...
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-accent-amber bg-accent-amber/10 border border-accent-amber/20 rounded-lg px-3 py-2 mb-2">
            API 未连接，显示示例数据。
          </div>
        )}

        {/* Graph container (fills remaining space) */}
        <div ref={containerRef} className="flex-1 relative bg-cream-100 rounded-2xl border border-cream-200 overflow-hidden" style={{ minHeight: 500 }}>
          <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="block" />

          {/* ── Floating Stats Panel (top-left) ──────────────────────────────── */}
          <div className={`absolute top-4 left-4 transition-all duration-300 ${showStats ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="bg-surface/90 backdrop-blur-md border border-cream-200 rounded-2xl p-4 shadow-lg w-64">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-warm-600 uppercase tracking-wider">Vault 概览</h3>
                <button
                  onClick={() => setShowStats(false)}
                  className="p-1 rounded hover:bg-cream-200 text-warm-400 hover:text-warm-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Health Score */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-cream-200">
                <div className={`text-3xl font-bold ${scoreColor}`}>
                  {overallScore || '—'}
                </div>
                <div>
                  <div className="text-[10px] text-warm-400">健康评分</div>
                  <div className={`text-xs font-medium ${scoreColor}`}>
                    {overallScore >= 80 ? '优秀' : overallScore >= 60 ? '一般' : '需关注'}
                  </div>
                </div>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-2 gap-2">
                <StatItem icon={FileText} label="笔记" value={totalNotes} color="text-accent-orange" />
                <StatItem icon={Link2} label="引用" value={totalLinks} color="text-accent-sage" />
                <StatItem icon={AlertCircle} label="孤立" value={orphanNotes} color="text-accent-rose" />
                <StatItem icon={Tag} label="标签" value={totalTags} color="text-accent-amber" />
              </div>

              {/* Graph info */}
              <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between text-[10px] text-warm-400">
                <span>节点 {totalNodes} · 边 {rawLinks.length}</span>
                <span>{isRealData ? '来自 Vault' : '示例数据'}</span>
              </div>
            </div>
          </div>

          {/* Toggle stats button (when hidden) */}
          {!showStats && (
            <button
              onClick={() => setShowStats(true)}
              className="absolute top-4 left-4 p-2 bg-surface/90 backdrop-blur-md border border-cream-200 rounded-xl shadow-md hover:bg-cream-100 transition-colors"
              title="显示统计面板"
            >
              <Heart className="w-4 h-4 text-accent-orange" />
            </button>
          )}

          {/* Search + controls (top-right) */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索节点..."
                className="w-48 pl-8 pr-7 py-2 bg-surface/90 backdrop-blur-md border border-cream-200 rounded-xl text-xs text-warm-700 placeholder-warm-400 outline-none focus:border-accent-orange transition-colors"
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
            <button
              onClick={reload}
              className="p-2 rounded-xl bg-surface/90 backdrop-blur-md border border-cream-200 text-warm-500 hover:text-warm-700 transition-colors"
              title="刷新数据"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Info text (top-center, when filter active) */}
          {hasFilter && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur-md border border-cream-200 text-[11px] text-warm-500 shadow-sm">
              {activeNodeIds.size} / {totalNodes} 节点匹配
            </div>
          )}

          {/* Hover tooltip (bottom-right area) */}
          {hoveredNode && (
            <div className="absolute bottom-20 right-4 bg-surface/95 border border-cream-300 rounded-xl px-4 py-3 backdrop-blur-sm shadow-xl max-w-xs">
              <div className="text-sm font-semibold text-warm-800 mb-1">{hoveredNode.label}</div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: allGroupColors[hoveredNode.group] || '#8B7355' }} />
                <span className="text-xs text-warm-500">{allGroupLabels[hoveredNode.group] || hoveredNode.group}</span>
              </div>
              {hoveredNode.path && (
                <div className="text-[10px] text-warm-400 mt-1 font-mono truncate">{hoveredNode.path}</div>
              )}
              {hoveredNode.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {hoveredNode.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-cream-200 text-warm-500">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="text-[10px] text-warm-400 mt-1">引用数: {hoveredNode.linkCount}</div>
              <div className="text-[10px] text-accent-orange mt-1.5">单击跳转编辑 · 双击预览</div>
            </div>
          )}

          {/* Legend (bottom-left, multi-select) */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {groups.map(key => {
              const isActive = selectedGroups.size === 0 || selectedGroups.has(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleGroup(key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all backdrop-blur-sm ${
                    isActive
                      ? 'bg-cream-200/90 text-warm-800'
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
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-warm-400 hover:text-warm-600 transition-colors bg-cream-200/90 backdrop-blur-sm"
              >
                <X className="w-3 h-3" /> 清除过滤
              </button>
            )}
          </div>

          {/* Helper text (bottom-center) */}
          {!hasFilter && !hoveredNode && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cream-200/80 backdrop-blur-sm text-[10px] text-warm-400">
              拖拽移动 · 滚轮缩放 · 单击跳转 · 双击预览
            </div>
          )}
        </div>
      </div>

      {/* Preview panel */}
      {(previewNode || previewLoading) && (
        <div className="w-80 shrink-0 bg-surface border border-cream-200 rounded-xl p-4 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-warm-700 truncate flex-1">
              {previewLoading ? '加载中...' : previewNode?.title}
            </h3>
            <button
              onClick={() => setPreviewNode(null)}
              className="p-1 rounded hover:bg-cream-200 text-warm-400 hover:text-warm-600 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {previewLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-accent-orange animate-spin" />
            </div>
          )}
          {previewNode && !previewLoading && (
            <>
              <div className="text-[11px] text-warm-400 font-mono mb-3">{previewNode.path}</div>
              {previewNode.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {previewNode.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-accent-orange/15 text-accent-orange">#{tag}</span>
                  ))}
                </div>
              )}
              <div className="text-xs text-warm-400 mb-2">
                {previewNode.wordCount} words · {previewNode.links.length} links
              </div>
              <div className="text-xs text-warm-500 leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-auto">
                {previewNode.content.substring(0, 2000)}
                {previewNode.content.length > 2000 && (
                  <div className="mt-2 text-warm-400 italic">... (点击节点跳转到编辑器查看完整内容)</div>
                )}
              </div>
              <button
                onClick={() => {
                  navigate(`/editor?path=${encodeURIComponent(previewNode.path)}`)
                  setPreviewNode(null)
                }}
                className="mt-3 w-full py-2 rounded-lg bg-accent-orange text-white text-xs hover:bg-accent-orange/90 transition-colors"
              >
                在编辑器中打开
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Stat item sub-component ────────────────────────────────────────────────────

function StatItem({ icon: Icon, label, value, color }: {
  icon: typeof FileText
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-cream-100/60 rounded-xl px-3 py-2">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className={`w-3 h-3 ${color}`} />
        <span className="text-[10px] text-warm-400">{label}</span>
      </div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
    </div>
  )
}
