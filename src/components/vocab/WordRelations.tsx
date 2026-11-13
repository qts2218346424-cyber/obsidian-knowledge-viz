import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Search,
  Network,
  Loader2,
  X,
  BookOpen,
  ChevronRight,
  List,
  Maximize2,
  Focus,
  ChevronDown,
} from 'lucide-react'
import { api, type VocabRelationsData, type VocabRootEntry } from '../../services/api'

// ─── 节点样式与自定义节点 ──────────────────────────────────────────────────────

function RootNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-2.5 rounded-2xl border-2 border-orange-400/70 bg-gradient-to-br from-orange-50 via-amber-50 to-white shadow-sm min-w-[170px] max-w-[210px] text-center">
      <Handle type="target" position={Position.Top} className="!bg-orange-400 !w-2 !h-2 !border-0" />
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-base font-bold font-mono text-orange-700">{data.label}</span>
        {data.count != null && (
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold">
            {data.count}词
          </span>
        )}
      </div>
      <div className="text-xs text-slate-600 mt-0.5 truncate">{data.meaning}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-orange-400 !w-2 !h-2 !border-0" />
    </div>
  )
}

const freqStyles: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  高频: {
    bg: 'bg-orange-50/90',
    border: 'border-orange-300',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-700',
  },
  中频: {
    bg: 'bg-amber-50/90',
    border: 'border-amber-300',
    text: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-700',
  },
  低频: {
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-700',
  },
}

function WordNode({ data }: { data: any }) {
  const s = freqStyles[data.frequency] || freqStyles['低频']
  const highlighted = Boolean(data.highlighted)
  return (
    <div
      className={`px-3 py-2 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-sm ${s.bg} ${
        highlighted
          ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-[1.03]'
          : `${s.border} hover:scale-[1.02]`
      }`}
      style={{ width: 156, minHeight: 62 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-400/70 !w-1.5 !h-1.5 !border-0" />
      <div className="flex items-center justify-between gap-1">
        <span className={`text-sm font-bold truncate ${s.text}`}>{data.word}</span>
        {data.frequency && (
          <span className={`text-[10px] px-1 py-0.2 rounded font-semibold shrink-0 ${s.badge}`}>
            {data.frequency}
          </span>
        )}
      </div>
      <div className="text-[11px] text-slate-600 mt-1 truncate leading-snug">{data.definition}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400/70 !w-1.5 !h-1.5 !border-0" />
    </div>
  )
}

const nodeTypes: NodeTypes = { rootNode: RootNode, wordNode: WordNode }

// ─── 响应式多层树状谱系布局（彻底解决单排横向溢出与节点缩成像素点） ───────────

interface LayoutResult {
  nodes: Node[]
  edges: Edge[]
  rootCenterX: number
  graphWidth: number
  graphHeight: number
}

function buildTreeLayout(
  root: VocabRootEntry,
  cols: number,
  highlightQuery: string
): LayoutResult {
  const cardW = 156
  const cardH = 64
  const gapX = cols <= 2 ? 16 : 24
  const gapY = 26
  const rootW = 190
  const rootH = 66
  const topPadding = 16

  const words = root.words
  const actualCols = Math.max(1, Math.min(cols, words.length || 1))
  const totalGridW = actualCols * cardW + (actualCols - 1) * gapX
  const canvasW = Math.max(totalGridW, rootW)
  const startX = (canvasW - totalGridW) / 2
  const rootX = (canvasW - rootW) / 2
  const rootY = 24
  const firstRowY = rootY + rootH + 42

  const q = highlightQuery.trim().toLowerCase()
  const rootId = `root-${root.root}`

  const nodes: Node[] = [
    {
      id: rootId,
      type: 'rootNode',
      position: { x: rootX, y: rootY },
      data: { label: root.root, meaning: root.meaning, count: words.length },
    },
    ...words.map((w, i) => {
      const row = Math.floor(i / actualCols)
      const col = i % actualCols
      // 最后一行如果未满，居中对齐
      const itemsInThisRow =
        row === Math.floor((words.length - 1) / actualCols)
          ? words.length - row * actualCols
          : actualCols
      const rowW = itemsInThisRow * cardW + (itemsInThisRow - 1) * gapX
      const rowOffsetX = (canvasW - rowW) / 2
      const x = itemsInThisRow < actualCols ? rowOffsetX + col * (cardW + gapX) : startX + col * (cardW + gapX)
      const y = firstRowY + row * (cardH + gapY)
      const isMatch = Boolean(q && w.word.toLowerCase().includes(q))

      return {
        id: `word-${i}`,
        type: 'wordNode' as const,
        position: { x, y },
        data: {
          word: w.word,
          definition: w.definition,
          frequency: w.frequency,
          unit: w.unit,
          highlighted: isMatch,
        },
      }
    }),
  ]

  // 连线策略：
  // 1) 当词数 <= 6 且 <= 2 排时，全部直接从词根连向各个单词，呈现简洁放射树
  // 2) 当词数较多时，词根连向第一排各列主枝，同列向下级联递进，避免几十条连线挤成一团黑线
  const edges: Edge[] = []
  if (words.length <= actualCols * 2 && words.length <= 6) {
    words.forEach((_, i) => {
      edges.push({
        id: `e-root-${i}`,
        source: rootId,
        target: `word-${i}`,
        type: 'smoothstep',
        style: { stroke: '#e2a36b', strokeWidth: 1.6 },
      })
    })
  } else {
    words.forEach((_, i) => {
      const row = Math.floor(i / actualCols)
      if (row === 0) {
        edges.push({
          id: `e-root-${i}`,
          source: rootId,
          target: `word-${i}`,
          type: 'smoothstep',
          style: { stroke: '#ea580c', strokeWidth: 1.75, opacity: 0.7 },
        })
      } else {
        const parentIdx = i - actualCols
        edges.push({
          id: `e-chain-${parentIdx}-${i}`,
          source: `word-${parentIdx}`,
          target: `word-${i}`,
          type: 'straight',
          style: { stroke: '#d6c2ab', strokeWidth: 1.4, strokeDasharray: '4 3' },
        })
      }
    })
  }

  const totalRows = Math.ceil(words.length / actualCols)
  const graphHeight = firstRowY + Math.max(1, totalRows) * (cardH + gapY)

  return {
    nodes,
    edges,
    rootCenterX: canvasW / 2,
    graphWidth: canvasW,
    graphHeight,
  }
}

// ─── 视口自动聚焦控制器 ──────────────────────────────────────────────────────

function ViewportSync({
  rootKey,
  wordCount,
  rootCenterX,
  isCompact,
  focusTrigger,
  fitAllTrigger,
}: {
  rootKey: string
  wordCount: number
  rootCenterX: number
  isCompact: boolean
  focusTrigger: number
  fitAllTrigger: number
}) {
  const { fitView, setCenter } = useReactFlow()

  // 切换词根或点击「聚焦顶部」时：词少则全图 fitView，词多则舒适缩放聚焦上半部分防止蚂蚁字
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (wordCount <= 8) {
        fitView({ padding: 0.16, maxZoom: 1.05, duration: 220 })
      } else {
        const zoom = isCompact ? 0.9 : 0.96
        const centerY = isCompact ? 205 : 240
        setCenter(rootCenterX, centerY, { zoom, duration: 220 })
      }
    }, 60)
    return () => window.clearTimeout(timer)
  }, [rootKey, wordCount, rootCenterX, isCompact, focusTrigger, fitView, setCenter])

  // 手动点击「概览全图」
  useEffect(() => {
    if (fitAllTrigger === 0) return
    fitView({ padding: 0.15, minZoom: 0.15, maxZoom: 1.05, duration: 260 })
  }, [fitAllTrigger, fitView])

  return null
}

// ─── 主组件内部实现 ──────────────────────────────────────────────────────────

function WordRelationsInner() {
  const [relationsData, setRelationsData] = useState<VocabRelationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [graphSearch, setGraphSearch] = useState('')
  const [selectedRoot, setSelectedRoot] = useState<VocabRootEntry | null>(null)
  const [selectedWord, setSelectedWord] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph')
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [focusTrigger, setFocusTrigger] = useState(0)
  const [fitAllTrigger, setFitAllTrigger] = useState(0)
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  )
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [layoutMeta, setLayoutMeta] = useState({ rootCenterX: 170 })
  const pillContainerRef = useRef<HTMLDivElement | null>(null)

  // 监听视口宽度变化以适配 2 列 / 3 列
  useEffect(() => {
    const onResize = () => {
      setIsCompact(window.innerWidth < 640)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 获取词根关系数据
  useEffect(() => {
    setLoading(true)
    api
      .getVocabRelations()
      .then((data) => {
        setRelationsData(data)
        if (data.roots.length > 0 && !selectedRoot) {
          setSelectedRoot(data.roots[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // 选中的词根、视口列数或搜索高亮变化时重建图谱
  useEffect(() => {
    if (!selectedRoot) return
    const cols = isCompact ? 2 : 3
    const { nodes: n, edges: e, rootCenterX } = buildTreeLayout(selectedRoot, cols, graphSearch)
    setNodes(n)
    setEdges(e)
    setLayoutMeta({ rootCenterX })
    setSelectedWord(null)
  }, [selectedRoot, isCompact, graphSearch, setNodes, setEdges])

  // 节点点击处理
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'wordNode') {
      setSelectedWord(node.data)
    }
  }, [])

  // 词根目录过滤（移动端抽屉与桌面侧边栏共用）
  const filteredRoots = useMemo(() => {
    if (!relationsData) return []
    const q = sidebarSearch.trim().toLowerCase()
    if (!q) return relationsData.roots
    return relationsData.roots.filter(
      (r) =>
        r.root.toLowerCase().includes(q) ||
        r.meaning.toLowerCase().includes(q) ||
        r.words.some((w) => w.word.toLowerCase().includes(q))
    )
  }, [relationsData, sidebarSearch])

  // 顶部搜索：同时匹配词根、释义或衍生词
  const handleGraphSearch = useCallback(
    (value: string) => {
      setGraphSearch(value)
      if (!relationsData || !value.trim()) return
      const q = value.trim().toLowerCase()
      const exactRoot = relationsData.roots.find((r) => r.root.toLowerCase() === q)
      const match =
        exactRoot ||
        relationsData.roots.find(
          (r) =>
            r.root.toLowerCase().includes(q) ||
            r.meaning.toLowerCase().includes(q) ||
            r.words.some((w) => w.word.toLowerCase().includes(q))
        )
      if (match) {
        setSelectedRoot(match)
        const matchedWord = match.words.find((w) => w.word.toLowerCase().includes(q))
        if (matchedWord && match.root.toLowerCase() !== q) {
          setSelectedWord(matchedWord)
        }
      }
    },
    [relationsData]
  )

  const handleSelectRoot = (r: VocabRootEntry) => {
    setSelectedRoot(r)
    setMobileDrawerOpen(false)
    setSelectedWord(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[360px] text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-orange-500" />
        正在整理考研词根词缀图谱...
      </div>
    )
  }

  if (!relationsData || relationsData.roots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-slate-400 gap-2">
        <Network className="w-8 h-8 opacity-40" />
        <p className="text-sm">暂无词根关系数据</p>
      </div>
    )
  }

  const freqRank: Record<string, number> = { 高频: 0, 中频: 1, 低频: 2 }
  const sortedWords = selectedRoot
    ? [...selectedRoot.words].sort(
        (a, b) => (freqRank[a.frequency] ?? 3) - (freqRank[b.frequency] ?? 3)
      )
    : []

  return (
    <div className="relative flex flex-col md:flex-row h-full w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      {/* ── 桌面端左侧词根列表（< md 彻底隐藏，不抢占手机宽度） ── */}
      <div className="hidden md:flex md:w-[240px] lg:w-[260px] shrink-0 h-full border-r border-slate-200 bg-slate-50/40 flex-col">
        <div className="p-3 border-b border-slate-200/80 bg-white">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="筛选词根或词义..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-400 placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredRoots.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">无匹配词根</div>
          ) : (
            filteredRoots.map((r) => {
              const active = selectedRoot?.root === r.root
              return (
                <button
                  key={r.root}
                  type="button"
                  onClick={() => handleSelectRoot(r)}
                  className={`w-full text-left px-3 py-2.5 border-b border-slate-100 transition-colors flex items-center gap-2 cursor-pointer ${
                    active ? 'bg-orange-50' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      active ? 'text-orange-600' : 'text-slate-300'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-mono font-semibold truncate ${
                          active ? 'text-orange-700' : 'text-slate-800'
                        }`}
                      >
                        {r.root}
                      </span>
                      <span className="text-xs text-slate-500 truncate">({r.meaning})</span>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full border shrink-0 font-mono ${
                      active
                        ? 'bg-orange-100 text-orange-700 border-orange-200 font-semibold'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {r.words.length}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── 右侧/移动端全宽主内容区 ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* 顶部工具栏（手机端双层紧凑布局，桌面端单行对齐） */}
        <div className="px-2.5 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-white space-y-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* 移动端词根全量抽屉入口按钮 */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold shrink-0 cursor-pointer active:scale-95"
            >
              <span className="font-mono">{selectedRoot?.root}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* 搜索框 */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜词根或单词..."
                value={graphSearch}
                onChange={(e) => handleGraphSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-400 placeholder:text-slate-400"
              />
              {graphSearch && (
                <button
                  type="button"
                  onClick={() => setGraphSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 桌面端当前词根摘要 */}
            {selectedRoot && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-mono font-bold text-slate-900">{selectedRoot.root}</span>
                <span className="text-slate-400">({selectedRoot.meaning})</span>
                <span className="text-slate-300">·</span>
                <span className="font-medium text-orange-600">{selectedRoot.words.length} 词</span>
              </div>
            )}

            {/* 图谱 / 清单 切换开关 */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('graph')}
                className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'graph'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>图谱</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>清单</span>
              </button>
            </div>
          </div>

          {/* 移动端横向快捷词根切换胶囊条 */}
          <div
            ref={pillContainerRef}
            className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
          >
            {relationsData.roots.slice(0, 20).map((r) => {
              const active = selectedRoot?.root === r.root
              return (
                <button
                  key={r.root}
                  type="button"
                  onClick={() => handleSelectRoot(r)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs shrink-0 whitespace-nowrap transition-all cursor-pointer border ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono">{r.root}</span>
                  <span className={`text-[11px] ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                    {r.meaning}
                  </span>
                  <span
                    className={`text-[10px] px-1 rounded-full font-mono ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {r.words.length}
                  </span>
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs shrink-0 whitespace-nowrap bg-orange-50 text-orange-700 border border-orange-200 font-medium cursor-pointer"
            >
              全部 {relationsData.roots.length} 个 →
            </button>
          </div>
        </div>

        {/* 当前词根精简状态条（移动端清晰呈现当前词根含义与总词数） */}
        {selectedRoot && (
          <div className="px-3 py-1.5 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="font-mono font-bold text-orange-700">{selectedRoot.root}</span>
              <span className="text-slate-600 truncate">({selectedRoot.meaning})</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 shrink-0">{selectedRoot.words.length} 个衍生词</span>
            </div>
            {viewMode === 'graph' && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setFocusTrigger((v) => v + 1)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  title="聚焦词根顶部视图"
                >
                  <Focus className="w-3 h-3 text-orange-600" />
                  <span>聚焦</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFitAllTrigger((v) => v + 1)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  title="缩放显示完整衍生树"
                >
                  <Maximize2 className="w-3 h-3 text-slate-500" />
                  <span>全图</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 主视图区：交互图谱 OR 词族清单 */}
        <div className="flex-1 relative min-h-0 flex flex-col">
          {viewMode === 'graph' ? (
            <div className="flex-1 relative min-h-0">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                minZoom={0.15}
                maxZoom={1.6}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                nodesConnectable={false}
                panOnDrag={true}
                zoomOnPinch={true}
                className="!bg-[#fffcf7]"
              >
                <Background color="#eadccf" gap={20} />
                <Controls
                  className="!hidden sm:!flex !bg-white !border-slate-200 !rounded-lg !shadow-xs"
                  position="bottom-left"
                  showInteractive={false}
                />
                <MiniMap
                  nodeColor="#e2a36b"
                  maskColor="rgba(255,251,245,0.8)"
                  className="!hidden md:!block !bg-white !border-slate-200 !rounded-lg !shadow-xs"
                />
                {selectedRoot && (
                  <ViewportSync
                    rootKey={selectedRoot.root}
                    wordCount={selectedRoot.words.length}
                    rootCenterX={layoutMeta.rootCenterX}
                    isCompact={isCompact}
                    focusTrigger={focusTrigger}
                    fitAllTrigger={fitAllTrigger}
                  />
                )}
              </ReactFlow>
            </div>
          ) : (
            /* ── 词族清单视图（极高信息密度、零缩放压力、按考频排序） ── */
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#fffcf7]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {sortedWords.map((w) => {
                  const s = freqStyles[w.frequency] || freqStyles['低频']
                  const isMatch = Boolean(
                    graphSearch.trim() &&
                      w.word.toLowerCase().includes(graphSearch.trim().toLowerCase())
                  )
                  return (
                    <div
                      key={w.word}
                      onClick={() => setSelectedWord(w)}
                      className={`p-3 rounded-xl border bg-white transition-all cursor-pointer shadow-xs hover:shadow-sm ${
                        isMatch
                          ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                          : 'border-slate-200/80 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{w.word}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-mono text-slate-400">U{w.unit}</span>
                          {w.frequency && (
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${s.badge}`}>
                              {w.frequency}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                        {w.definition}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 单词详情浮窗（图谱/清单共用；移动端居中弹出避开底部导航遮挡，桌面端右下角浮卡） */}
          {selectedWord && (
            <div
              className="absolute inset-0 sm:inset-auto sm:right-4 sm:bottom-4 sm:w-72 z-20 flex items-center justify-center p-4 sm:p-0 bg-slate-900/20 sm:bg-transparent backdrop-blur-[1px] sm:backdrop-blur-none"
              onClick={() => setSelectedWord(null)}
            >
              <div
                className="w-full max-w-[310px] sm:max-w-none bg-white border border-slate-200 rounded-2xl p-4 shadow-xl animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base font-bold text-slate-900 truncate">
                      {selectedWord.word}
                    </span>
                    {selectedWord.frequency && (
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                          selectedWord.frequency === '高频'
                            ? 'bg-orange-100 text-orange-700'
                            : selectedWord.frequency === '中频'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {selectedWord.frequency}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedWord(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="关闭单词详情"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="leading-relaxed">
                    <span className="text-slate-400">核心释义：</span>
                    <span className="text-slate-900 font-medium">{selectedWord.definition}</span>
                  </p>
                  {selectedRoot && (
                    <p>
                      <span className="text-slate-400">所属词根：</span>
                      <span className="font-mono font-semibold text-orange-700">
                        {selectedRoot.root} ({selectedRoot.meaning})
                      </span>
                    </p>
                  )}
                  {selectedWord.unit != null && (
                    <p>
                      <span className="text-slate-400">大纲单元：</span>
                      <span className="font-mono text-slate-700">Unit {selectedWord.unit}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 移动端「全部词根」抽屉面板 ── */}
      {mobileDrawerOpen && (
        <div className="md:hidden absolute inset-0 z-30 bg-white flex flex-col animate-fade-in">
          <div className="px-3 py-2.5 border-b border-slate-200 flex items-center justify-between gap-2 bg-slate-50">
            <span className="text-sm font-bold text-slate-900">
              选择词根词缀（共 {relationsData.roots.length} 族）
            </span>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 cursor-pointer"
              aria-label="关闭词根目录"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2.5 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="输入词根、中文含义或单词筛选..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredRoots.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">没有匹配的词根</div>
            ) : (
              filteredRoots.map((r) => {
                const active = selectedRoot?.root === r.root
                return (
                  <button
                    key={r.root}
                    type="button"
                    onClick={() => handleSelectRoot(r)}
                    className={`w-full px-3.5 py-3 text-left flex items-center justify-between gap-3 cursor-pointer ${
                      active ? 'bg-orange-50' : 'active:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`font-mono text-sm font-bold ${
                          active ? 'text-orange-700' : 'text-slate-900'
                        }`}
                      >
                        {r.root}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{r.meaning}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono shrink-0 ${
                        active
                          ? 'bg-orange-600 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {r.words.length} 词
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function WordRelations() {
  return (
    <ReactFlowProvider>
      <WordRelationsInner />
    </ReactFlowProvider>
  )
}
