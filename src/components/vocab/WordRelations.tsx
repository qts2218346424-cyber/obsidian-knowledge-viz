import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
  type Node, type Edge, type NodeTypes, Handle, Position,
  useNodesState, useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { Search, Network, Loader2, X, BookOpen, ChevronRight } from 'lucide-react'
import { api, type VocabRelationsData, type VocabRootEntry } from '../../services/api'

// ─── Custom Nodes ────────────────────────────────────────────────────────────

function RootNode({ data }: { data: any }) {
  return (
    <div className="px-5 py-3 rounded-xl border border-accent-orange/40 bg-gradient-to-br from-accent-orange/20 to-accent-orange/10 min-w-[160px] text-center">
      <Handle type="target" position={Position.Top} className="!bg-accent-orange/40 !w-2 !h-2 !border-0" />
      <div className="text-base font-semibold text-accent-orange">{data.label}</div>
      <div className="text-xs text-warm-500 mt-1">{data.meaning}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-accent-orange/40 !w-2 !h-2 !border-0" />
    </div>
  )
}

const freqStyles: Record<string, { bg: string; border: string; text: string }> = {
  高频: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
  中频: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700' },
  低频: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-700' },
}

function WordNode({ data }: { data: any }) {
  const s = freqStyles[data.frequency] || freqStyles['低频']
  return (
    <div className={`px-3 py-2 rounded-lg border ${s.bg} ${s.border} min-w-[130px] cursor-pointer transition-all hover:scale-105`}>
      <Handle type="target" position={Position.Top} className="!bg-cream-300 !w-2 !h-2 !border-0" />
      <div className={`text-sm font-medium ${s.text}`}>{data.word}</div>
      <div className="text-[11px] text-warm-400 mt-0.5 truncate max-w-[150px]">{data.definition}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-cream-300 !w-2 !h-2 !border-0" />
    </div>
  )
}

const nodeTypes: NodeTypes = { rootNode: RootNode, wordNode: WordNode }

// ─── Dagre Layout ────────────────────────────────────────────────────────────

function buildLayout(root: VocabRootEntry): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 60 })

  const rootId = `root-${root.root}`
  g.setNode(rootId, { width: 180, height: 70 })

  root.words.forEach((w, i) => {
    g.setNode(`word-${i}`, { width: 160, height: 55 })
    g.setEdge(rootId, `word-${i}`)
  })

  dagre.layout(g)

  const rootPos = g.node(rootId)
  const nodes: Node[] = [
    {
      id: rootId,
      type: 'rootNode',
      position: { x: (rootPos.x || 0) - 90, y: (rootPos.y || 0) - 35 },
      data: { label: root.root, meaning: `(${root.meaning})` },
    },
    ...root.words.map((w, i) => {
      const pos = g.node(`word-${i}`)
      return {
        id: `word-${i}`,
        type: 'wordNode' as const,
        position: { x: (pos.x || 0) - 80, y: (pos.y || 0) - 28 },
        data: { word: w.word, definition: w.definition, frequency: w.frequency, unit: w.unit },
      }
    }),
  ]

  const edges: Edge[] = root.words.map((_, i) => ({
    id: `e-root-${i}`,
    source: rootId,
    target: `word-${i}`,
    type: 'smoothstep',
    style: { stroke: '#D4B896', strokeWidth: 1.5 },
  }))

  return { nodes, edges }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WordRelations() {
  const [relationsData, setRelationsData] = useState<VocabRelationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [graphSearch, setGraphSearch] = useState('')
  const [selectedRoot, setSelectedRoot] = useState<VocabRootEntry | null>(null)
  const [selectedWord, setSelectedWord] = useState<any>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Fetch data
  useEffect(() => {
    setLoading(true)
    api.getVocabRelations()
      .then(data => {
        setRelationsData(data)
        if (data.roots.length > 0 && !selectedRoot) {
          setSelectedRoot(data.roots[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Build graph when root selection changes
  useEffect(() => {
    if (!selectedRoot) return
    const { nodes: n, edges: e } = buildLayout(selectedRoot)
    setNodes(n)
    setEdges(e)
    setSelectedWord(null)
  }, [selectedRoot, setNodes, setEdges])

  // Node click handler
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'wordNode') {
      setSelectedWord(node.data)
    }
  }, [])

  // Filtered root list
  const filteredRoots = useMemo(() => {
    if (!relationsData) return []
    const q = sidebarSearch.trim().toLowerCase()
    if (!q) return relationsData.roots
    return relationsData.roots.filter(
      r => r.root.toLowerCase().includes(q) || r.meaning.toLowerCase().includes(q)
    )
  }, [relationsData, sidebarSearch])

  // Graph search — find a root matching the search term and switch to it
  const handleGraphSearch = useCallback((value: string) => {
    setGraphSearch(value)
    if (!relationsData || !value.trim()) return
    const q = value.trim().toLowerCase()
    const match = relationsData.roots.find(
      r => r.root.toLowerCase().includes(q) ||
        r.words.some(w => w.word.toLowerCase().includes(q))
    )
    if (match) setSelectedRoot(match)
  }, [relationsData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-warm-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        加载词根关系...
      </div>
    )
  }

  if (!relationsData || relationsData.roots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-warm-400 gap-2">
        <Network className="w-8 h-8 opacity-40" />
        <p className="text-sm">暂无词根关系数据</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* ── Left Sidebar ── */}
      <div className="w-[250px] shrink-0 border-r border-cream-200 bg-surface flex flex-col">
        <div className="p-3 border-b border-cream-200">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
            <input
              type="text"
              placeholder="搜索词根..."
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-cream-200 bg-cream-50 focus:outline-none focus:border-accent-orange/40 placeholder:text-warm-300"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredRoots.length === 0 ? (
            <div className="p-4 text-center text-sm text-warm-400">无匹配词根</div>
          ) : (
            filteredRoots.map(r => {
              const active = selectedRoot?.root === r.root
              return (
                <button
                  key={r.root}
                  onClick={() => setSelectedRoot(r)}
                  className={`w-full text-left px-3 py-2.5 border-b border-cream-100 transition-colors flex items-center gap-2 ${
                    active ? 'bg-accent-orange/15' : 'hover:bg-cream-100'
                  }`}
                >
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${active ? 'text-accent-orange' : 'text-warm-300'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-medium ${active ? 'text-accent-orange' : 'text-warm-700'}`}>
                        {r.root}
                      </span>
                      <span className="text-[10px] text-warm-400">({r.meaning})</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 ${
                    active
                      ? 'bg-accent-orange/10 text-accent-orange border-accent-orange/30'
                      : 'bg-cream-100 text-warm-400 border-cream-200'
                  }`}>
                    {r.words.length}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Right Graph Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search bar */}
        <div className="px-4 py-2 border-b border-cream-200 bg-surface flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
            <input
              type="text"
              placeholder="搜索词根或单词..."
              value={graphSearch}
              onChange={e => handleGraphSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-cream-200 bg-cream-50 focus:outline-none focus:border-accent-orange/40 placeholder:text-warm-300"
            />
          </div>
          {selectedRoot && (
            <div className="flex items-center gap-1.5 text-sm text-warm-500">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{selectedRoot.root}</span>
              <span className="text-warm-300">({selectedRoot.meaning})</span>
              <span className="text-warm-300">·</span>
              <span className="text-warm-400">{selectedRoot.words.length} 个单词</span>
            </div>
          )}
        </div>

        {/* Graph */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
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

          {/* ── Detail Panel ── */}
          {selectedWord && (
            <div className="absolute bottom-4 right-4 w-64 bg-surface border border-cream-200 rounded-xl p-4 z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-warm-700">{selectedWord.word}</span>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="text-warm-400 hover:text-warm-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-warm-500">
                <p><span className="text-warm-400">释义：</span>{selectedWord.definition}</p>
                {selectedWord.unit != null && (
                  <p><span className="text-warm-400">单元：</span>Unit {selectedWord.unit}</p>
                )}
                {selectedWord.frequency && (
                  <p>
                    <span className="text-warm-400">频率：</span>
                    <span className={
                      selectedWord.frequency === '高频' ? 'text-orange-600' :
                      selectedWord.frequency === '中频' ? 'text-amber-600' : 'text-emerald-600'
                    }>
                      {selectedWord.frequency}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
