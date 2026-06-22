import { useMemo, useState, useCallback, useRef } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Globe, Search, FolderTree, Sparkles, Download, Play,
  Loader2, AlertTriangle, Check, ExternalLink, Tag,
  GitMerge, ArrowRightLeft, Plus, Link2, FileText,
  Brain, Network, Save, Send, MessageSquare, Lightbulb,
  FolderOpen,
} from 'lucide-react'
import {
  api,
  type DefuddleResult, type QueryResult, type FoldResult, type ThinkResult, type FoldSuggestion,
} from '../../services/api'
import {
  type PipelineStep, nodeTypes,
  getLayoutedElements, delay,
} from './shared'

// ─── Defuddle Panel (网页抓取) ───────────────────────────────────────────────

const initialDefuddleSteps: PipelineStep[] = [
  { id: '1', label: '输入 URL', desc: '粘贴网页链接', icon: 'Globe', status: 'pending' },
  { id: '2', label: '抓取内容', desc: '获取并清理网页文本', icon: 'Download', status: 'pending' },
  { id: '3', label: 'AI 整理', desc: '提取知识点生成结构化笔记', icon: 'Sparkles', status: 'pending' },
  { id: '4', label: '生成元数据', desc: '自动标签和摘要', icon: 'Tag', status: 'pending' },
  { id: '5', label: '写入 Vault', desc: '保存为 Markdown 笔记', icon: 'Save', status: 'pending' },
]

export function DefuddlePanel() {
  const [steps, setSteps] = useState<PipelineStep[]>(initialDefuddleSteps)
  const [running, setRunning] = useState(false)
  const [url, setUrl] = useState('')
  const [folder, setFolder] = useState('Web-Clippings')
  const [result, setResult] = useState<DefuddleResult | null>(null)
  const [error, setError] = useState('')

  const updateStep = useCallback((id: string, patch: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const handleDefuddle = async () => {
    if (!url.trim()) return
    setRunning(true)
    setError('')
    setResult(null)
    setSteps(initialDefuddleSteps)

    try {
      updateStep('1', { status: 'active' })
      await delay(400)
      updateStep('1', { status: 'done', detail: new URL(url).hostname })

      // Mark steps 2 and 3 as active to show progress during the API call
      updateStep('2', { status: 'active' })
      await delay(300)
      updateStep('3', { status: 'active' })

      const res = await api.defuddle(url.trim(), folder || undefined)

      // Only mark steps as done after successful API response
      updateStep('2', { status: 'done', detail: '内容已抓取' })
      updateStep('3', { status: 'done', detail: `${res.wordCount} words` })
      await delay(200)

      updateStep('4', { status: 'done', detail: res.tags.join(', ') || '已生成' })
      await delay(200)

      updateStep('5', { status: 'done', detail: res.filePath })
      setResult(res)
    } catch (err: any) {
      setError(err.message)
      // Revert all non-done steps (from step 2 onwards) to pending
      setSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'pending' as const } : s))
    } finally {
      setRunning(false)
    }
  }

  const { nodes, edges } = useMemo(() => getLayoutedElements(steps), [steps])

  return (
    <div className="bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-cream-200 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="text-sm font-semibold text-warm-700">Defuddle 网页抓取</div>
          <div className="text-[11px] text-warm-400 mt-0.5">粘贴 URL → 抓取 → AI 整理 → 写入 Vault</div>
        </div>
        <button
          onClick={handleDefuddle}
          disabled={running || !url.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {running ? '抓取中...' : '开始抓取'}
        </button>
      </div>

      {/* URL & Folder input */}
      <div className="px-5 py-3 border-b border-cream-200 bg-surface/50 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="粘贴网页 URL..."
              className="w-full bg-cream-200 border border-cream-300 rounded-lg pl-9 pr-3 py-2 text-xs text-warm-700 outline-none focus:border-accent-orange"
              onKeyDown={e => e.key === 'Enter' && handleDefuddle()}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <FolderTree className="w-3.5 h-3.5 text-warm-400" />
          <input
            type="text"
            value={folder}
            onChange={e => setFolder(e.target.value)}
            placeholder="保存目录"
            className="bg-cream-200 border border-cream-300 rounded-lg px-3 py-1.5 text-xs text-warm-700 outline-none focus:border-accent-orange w-48"
          />
          <span className="text-[10px] text-warm-400">默认: Web-Clippings</span>
        </div>
      </div>

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
            抓取完成: {result.title}
          </div>
          <div className="text-[11px] text-warm-500 space-x-4 mb-2">
            <span>{result.wordCount} words</span>
            <span>{result.tags.length} tags</span>
            <span className="text-warm-400">{result.filePath}</span>
          </div>
          {result.tags.length > 0 && (
            <div className="flex gap-1 mb-2 flex-wrap">
              {result.tags.map(t => (
                <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-accent-sage/10 text-accent-sage border border-accent-sage/20">{t}</span>
              ))}
            </div>
          )}
          <div className="text-[10px] text-warm-400 bg-cream-200 rounded p-2 max-h-24 overflow-auto">{result.preview}</div>
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

// ─── Query Panel (智能查询) ──────────────────────────────────────────────────

const initialQuerySteps: PipelineStep[] = [
  { id: '1', label: '输入查询', desc: '描述你要查找的内容', icon: 'MessageSquare', status: 'pending' },
  { id: '2', label: '搜索 Vault', desc: '多字段加权搜索', icon: 'Search', status: 'pending' },
  { id: '3', label: 'AI 分析', desc: '综合笔记内容生成洞察', icon: 'Brain', status: 'pending' },
  { id: '4', label: '生成结果', desc: '返回排序后的笔记列表', icon: 'FileText', status: 'pending' },
]

export function QueryPanel() {
  const [steps, setSteps] = useState<PipelineStep[]>(initialQuerySteps)
  const [running, setRunning] = useState(false)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState('')

  const updateStep = useCallback((id: string, patch: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const handleQuery = async () => {
    if (!query.trim()) return
    setRunning(true)
    setError('')
    setResult(null)
    setSteps(initialQuerySteps)

    try {
      updateStep('1', { status: 'active' })
      await delay(300)
      updateStep('1', { status: 'done', detail: query.slice(0, 30) })

      updateStep('2', { status: 'active' })
      await delay(400)

      const res = await api.query(query.trim())
      updateStep('2', { status: 'done', detail: `${res.results.length} 条匹配` })
      await delay(200)

      updateStep('3', { status: 'done', detail: 'AI 洞察已生成' })
      await delay(200)

      updateStep('4', { status: 'done', detail: `${res.relatedTopics.length} 个相关话题` })
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
          <div className="text-sm font-semibold text-warm-700">智能查询</div>
          <div className="text-[11px] text-warm-400 mt-0.5">输入问题 → 搜索 → AI 分析 → 知识洞察</div>
        </div>
        <button
          onClick={handleQuery}
          disabled={running || !query.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {running ? '查询中...' : '查询'}
        </button>
      </div>

      {/* Query input */}
      <div className="px-5 py-3 border-b border-cream-200 bg-surface/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="输入你要查询的知识点，如：TCP 三次握手 / 二叉树遍历 / 进程调度..."
            className="w-full bg-cream-200 border border-cream-300 rounded-lg pl-9 pr-3 py-2 text-xs text-warm-700 outline-none focus:border-accent-orange"
            onKeyDown={e => e.key === 'Enter' && handleQuery()}
          />
        </div>
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

        {/* Results sidebar */}
        {result && (
          <div className="w-72 shrink-0 border-l border-cream-200 overflow-auto bg-cream-100/50">
            {/* Insights */}
            {result.insights && (
              <div className="p-3 border-b border-cream-200">
                <div className="flex items-center gap-1.5 text-xs font-medium text-warm-600 mb-1.5">
                  <Brain className="w-3.5 h-3.5" /> AI 洞察
                </div>
                <div className="text-[11px] text-warm-500 leading-relaxed">{result.insights}</div>
              </div>
            )}

            {/* Related topics */}
            {result.relatedTopics.length > 0 && (
              <div className="p-3 border-b border-cream-200">
                <div className="flex items-center gap-1.5 text-xs font-medium text-warm-600 mb-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> 相关话题
                </div>
                <div className="flex flex-wrap gap-1">
                  {result.relatedTopics.map(t => (
                    <button
                      key={t}
                      onClick={() => { setQuery(t); setResult(null) }}
                      className="px-2 py-0.5 rounded text-[10px] bg-accent-amber/10 text-accent-amber border border-accent-amber/20 hover:bg-accent-amber/20 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results list */}
            <div className="p-2 space-y-1.5">
              <div className="text-[10px] text-warm-400 px-1">匹配笔记 ({result.results.length})</div>
              {result.results.map(r => (
                <div key={r.path} className="bg-surface border border-cream-200 rounded-lg p-2.5 hover:border-cream-300 transition-colors">
                  <div className="text-[11px] font-medium text-warm-700 mb-0.5">{r.title}</div>
                  <div className="text-[10px] text-warm-400 mb-1">{r.path}</div>
                  <div className="text-[10px] text-warm-500 line-clamp-2">{r.snippet.slice(0, 100)}...</div>
                  {r.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {r.tags.slice(0, 3).map(t => (
                        <span key={t} className="px-1 py-0 rounded text-[9px] bg-cream-200 text-warm-400">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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

// ─── Fold Panel (笔记整理) ───────────────────────────────────────────────────

const initialFoldSteps: PipelineStep[] = [
  { id: '1', label: '扫描笔记', desc: '遍历 Vault 中的笔记和目录', icon: 'FolderTree', status: 'pending' },
  { id: '2', label: '结构分析', desc: 'AI 分析目录结构和笔记关系', icon: 'Network', status: 'pending' },
  { id: '3', label: '生成建议', desc: '移动/合并/标签/链接等建议', icon: 'Sparkles', status: 'pending' },
  { id: '4', label: '新结构预览', desc: '展示建议的目录结构', icon: 'GitMerge', status: 'pending' },
]

const suggestionIcons: Record<string, React.FC<{ className?: string }>> = {
  move: ArrowRightLeft,
  merge: GitMerge,
  tag: Tag,
  link: Link2,
  create: Plus,
}
const suggestionLabels: Record<string, string> = {
  move: '移动',
  merge: '合并',
  tag: '标签',
  link: '链接',
  create: '创建',
}

export function FoldPanel() {
  const [steps, setSteps] = useState<PipelineStep[]>(initialFoldSteps)
  const [running, setRunning] = useState(false)
  const [folder, setFolder] = useState('')
  const [result, setResult] = useState<FoldResult | null>(null)
  const [error, setError] = useState('')
  // Fold apply state
  const [applyingAll, setApplyingAll] = useState(false)
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null)
  const [applyResults, setApplyResults] = useState<Record<number, { success: boolean; error?: string }>>({})
  // Auto-reorganize state
  const [reorganizing, setReorganizing] = useState(false)
  const [reorgMoves, setReorgMoves] = useState<Array<{ file: string; currentFolder: string; proposedFolder: string; reason: string }>>([])
  const [reorgResult, setReorgResult] = useState<string | null>(null)

  const updateStep = useCallback((id: string, patch: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const handleAnalyze = async () => {
    setRunning(true)
    setError('')
    setResult(null)
    setSteps(initialFoldSteps)
    setApplyResults({})
    setReorgMoves([])
    setReorgResult(null)

    try {
      updateStep('1', { status: 'active' })
      await delay(500)
      updateStep('1', { status: 'done' })

      updateStep('2', { status: 'active' })
      const res = await api.fold(folder || undefined)

      updateStep('2', { status: 'done', detail: `${res.totalNotes} 笔记, ${res.totalFolders} 目录` })
      await delay(200)

      updateStep('3', { status: 'done', detail: `${res.suggestions.length} 条建议` })
      await delay(200)

      updateStep('4', { status: 'done', detail: `${res.proposedStructure.length} 个建议目录` })
      setResult(res)
    } catch (err: any) {
      setError(err.message)
      setSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'pending' as const } : s))
    } finally {
      setRunning(false)
    }
  }

  const handleApplyAll = async () => {
    if (!result?.suggestions?.length) return
    setApplyingAll(true)
    try {
      const res = await api.foldApply(result.suggestions)
      const newResults: Record<number, { success: boolean; error?: string }> = {}
      res.results.forEach((r, i) => { newResults[i] = { success: r.success, error: r.error } })
      setApplyResults(newResults)
    } catch (err: any) {
      setError('执行失败: ' + err.message)
    } finally {
      setApplyingAll(false)
    }
  }

  const handleApplyOne = async (index: number) => {
    if (!result?.suggestions) return
    setApplyingIndex(index)
    try {
      const res = await api.foldApply([result.suggestions[index]])
      setApplyResults(prev => ({
        ...prev,
        [index]: { success: res.results[0]?.success ?? false, error: res.results[0]?.error },
      }))
    } catch (err: any) {
      setApplyResults(prev => ({ ...prev, [index]: { success: false, error: err.message } }))
    } finally {
      setApplyingIndex(null)
    }
  }

  const handleReorganize = async (mode: 'preview' | 'execute') => {
    setReorganizing(true)
    setError('')
    try {
      const res = await api.reorganize(mode, folder || undefined)
      setReorgMoves(res.proposedMoves || [])
      if (mode === 'execute' && res.executionResults) {
        const { succeeded, failed } = res.executionResults.summary
        setReorgResult(`完成: ${succeeded} 成功, ${failed} 失败`)
      }
    } catch (err: any) {
      setError('自动分类失败: ' + err.message)
    } finally {
      setReorganizing(false)
    }
  }

  const { nodes, edges } = useMemo(() => getLayoutedElements(steps), [steps])

  return (
    <div className="bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-cream-200 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="text-sm font-semibold text-warm-700">笔记整理 (Fold)</div>
          <div className="text-[11px] text-warm-400 mt-0.5">AI 分析笔记结构 → 整理建议 → 优化分类</div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {running ? '分析中...' : '开始分析'}
        </button>
        <button
          onClick={() => handleReorganize('preview')}
          disabled={reorganizing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-cream-200 text-warm-600 hover:bg-cream-300 disabled:opacity-40 transition-colors"
        >
          {reorganizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderOpen className="w-3.5 h-3.5" />}
          自动分类
        </button>
      </div>

      {/* Folder filter */}
      <div className="px-5 py-3 border-b border-cream-200 bg-surface/50 flex items-center gap-2">
        <FolderTree className="w-3.5 h-3.5 text-warm-400" />
        <input
          type="text"
          value={folder}
          onChange={e => setFolder(e.target.value)}
          placeholder="指定目录（留空分析整个 Vault）"
          className="bg-cream-200 border border-cream-300 rounded-lg px-3 py-1.5 text-xs text-warm-700 outline-none focus:border-accent-orange flex-1"
        />
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

        {/* Suggestions sidebar */}
        {result && (
          <div className="w-80 shrink-0 border-l border-cream-200 overflow-auto bg-cream-100/50">
            {/* Analysis */}
            {result.analysis && (
              <div className="p-3 border-b border-cream-200">
                <div className="flex items-center gap-1.5 text-xs font-medium text-warm-600 mb-1.5">
                  <Brain className="w-3.5 h-3.5" /> 结构分析
                </div>
                <div className="text-[11px] text-warm-500 leading-relaxed">{result.analysis}</div>
                <div className="text-[10px] text-warm-400 mt-1.5">
                  {result.totalNotes} 篇笔记 · {result.totalFolders} 个目录
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div className="p-2 space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-warm-400">整理建议 ({result.suggestions.length})</span>
                {result.suggestions.length > 0 && (
                  <button
                    onClick={handleApplyAll}
                    disabled={applyingAll}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
                  >
                    {applyingAll ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5" />}
                    全部执行
                  </button>
                )}
              </div>
              {result.suggestions.map((s, i) => {
                const Icon = suggestionIcons[s.type] || Plus
                const applied = applyResults[i]
                return (
                  <div key={i} className="bg-surface border border-cream-200 rounded-lg p-2.5 hover:border-cream-300 transition-colors">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3 h-3 text-accent-orange" />
                      <span className="text-[10px] font-medium text-accent-orange bg-accent-orange/10 px-1.5 py-0.5 rounded">{suggestionLabels[s.type] || s.type}</span>
                      <span className="text-[11px] font-medium text-warm-700">{s.description}</span>
                    </div>
                    <div className="text-[10px] text-warm-500">{s.reason}</div>
                    {s.from && (
                      <div className="text-[10px] text-warm-400 mt-1 flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" /> {s.from}
                        {s.to && <><ArrowRightLeft className="w-2.5 h-2.5 mx-1" /> {s.to}</>}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-cream-100">
                      <button
                        onClick={() => handleApplyOne(i)}
                        disabled={applyingIndex === i || !!applied}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ${
                          applied?.success
                            ? 'bg-accent-sage/10 text-accent-sage'
                            : 'bg-cream-200 text-warm-600 hover:bg-cream-300'
                        } disabled:opacity-40`}
                      >
                        {applyingIndex === i ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          : applied?.success ? <Check className="w-2.5 h-2.5" />
                          : <Play className="w-2.5 h-2.5" />}
                        {applied?.success ? '已执行' : '执行'}
                      </button>
                      {applied?.error && <span className="text-[9px] text-rose-400">{applied.error}</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Proposed structure */}
            {result.proposedStructure.length > 0 && (
              <div className="p-3 border-t border-cream-200">
                <div className="flex items-center gap-1.5 text-xs font-medium text-warm-600 mb-1.5">
                  <GitMerge className="w-3.5 h-3.5" /> 建议目录结构
                </div>
                <div className="space-y-0.5">
                  {result.proposedStructure.map((dir, i) => (
                    <div key={i} className="text-[10px] text-warm-500 pl-2 border-l border-cream-300">{dir}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Reorganize moves */}
            {reorgMoves.length > 0 && (
              <div className="p-3 border-t border-cream-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-warm-600 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5" /> 自动分类建议
                  </span>
                  <button
                    onClick={() => handleReorganize('execute')}
                    disabled={reorganizing}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
                  >
                    {reorganizing ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5" />}
                    执行移动
                  </button>
                </div>
                <div className="space-y-1 max-h-32 overflow-auto">
                  {reorgMoves.map((m, i) => (
                    <div key={i} className="text-[10px] text-warm-500 bg-cream-100 rounded p-1.5">
                      <div className="font-medium text-warm-600">{m.file.split('/').pop()}</div>
                      <div>{m.currentFolder} → <span className="text-accent-sage">{m.proposedFolder}</span></div>
                      <div className="text-warm-400">{m.reason}</div>
                    </div>
                  ))}
                </div>
                {reorgResult && (
                  <div className="text-[10px] text-accent-sage mt-1.5">{reorgResult}</div>
                )}
              </div>
            )}
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

// ─── Think Panel (思维画布) ──────────────────────────────────────────────────

const initialThinkSteps: PipelineStep[] = [
  { id: '1', label: '输入主题', desc: '描述你要探索的主题', icon: 'MessageSquare', status: 'pending' },
  { id: '2', label: '知识检索', desc: '从 Vault 查找相关笔记', icon: 'Search', status: 'pending' },
  { id: '3', label: 'AI 生成', desc: '构建思维导图结构', icon: 'Brain', status: 'pending' },
  { id: '4', label: '画布渲染', desc: '可视化交互式思维导图', icon: 'Network', status: 'pending' },
]

export function ThinkPanel() {
  const [steps, setSteps] = useState<PipelineStep[]>(initialThinkSteps)
  const [running, setRunning] = useState(false)
  const [topic, setTopic] = useState('')
  const [depth, setDepth] = useState(2)
  const [result, setResult] = useState<ThinkResult | null>(null)
  const [error, setError] = useState('')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const updateStep = useCallback((id: string, patch: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const handleThink = async () => {
    if (!topic.trim()) return
    setRunning(true)
    setError('')
    setResult(null)
    setSelectedNode(null)
    setSteps(initialThinkSteps)

    try {
      updateStep('1', { status: 'active' })
      await delay(300)
      updateStep('1', { status: 'done', detail: topic.slice(0, 20) })

      updateStep('2', { status: 'active' })
      await delay(500)
      updateStep('2', { status: 'done', detail: '知识库已检索' })

      updateStep('3', { status: 'active' })
      const res = await api.think(topic.trim(), depth)
      updateStep('3', { status: 'done', detail: `${res.branches?.length || 0} 个分支` })
      await delay(200)

      updateStep('4', { status: 'done' })
      setResult(res)
    } catch (err: any) {
      setError(err.message)
      setSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'pending' as const } : s))
    } finally {
      setRunning(false)
    }
  }

  const handleSaveCanvas = async () => {
    if (!result?.canvas) return
    try {
      const canvasJson = JSON.stringify(result.canvas, null, 2)
      await api.createFile(`Canvas/${topic.replace(/\s+/g, '-')}.canvas`, canvasJson, { type: 'canvas' })
      setError('')
    } catch (err: any) {
      setError('保存 Canvas 失败: ' + err.message)
    }
  }

  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => getLayoutedElements(steps), [steps])

  // Calculate mindmap stats
  const totalNodes = result
    ? 1 + (result.branches?.length || 0) + (result.branches?.reduce((s, b) => s + (b.children?.length || 0), 0) || 0)
    : 0

  return (
    <div className="bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-cream-200 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="text-sm font-semibold text-warm-700">思维画布 (Think)</div>
          <div className="text-[11px] text-warm-400 mt-0.5">输入主题 → AI 生成思维导图 → 可视化探索</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={depth}
            onChange={e => setDepth(Number(e.target.value))}
            className="bg-cream-200 border border-cream-300 rounded-lg px-2 py-1.5 text-xs text-warm-600 outline-none"
          >
            <option value={1}>浅层</option>
            <option value={2}>标准</option>
            <option value={3}>深层</option>
          </select>
          <button
            onClick={handleThink}
            disabled={running || !topic.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {running ? '生成中...' : '生成'}
          </button>
        </div>
      </div>

      {/* Topic input */}
      <div className="px-5 py-3 border-b border-cream-200 bg-surface/50">
        <div className="relative">
          <Brain className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="输入探索主题，如：操作系统内存管理 / TCP/IP 协议栈 / 数据结构..."
            className="w-full bg-cream-200 border border-cream-300 rounded-lg pl-9 pr-3 py-2 text-xs text-warm-700 outline-none focus:border-accent-orange"
            onKeyDown={e => e.key === 'Enter' && handleThink()}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Flow or Mindmap */}
        <div className="flex-1" style={{ minHeight: 300 }}>
          {!result ? (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
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
            </ReactFlow>
          ) : (
            <div className="h-full overflow-auto bg-cream-100 p-4">
              {/* Mindmap visual */}
              <div className="flex flex-col items-center gap-4">
                {/* Summary */}
                {result.summary && (
                  <div className="text-[11px] text-warm-500 bg-surface border border-cream-200 rounded-lg px-3 py-1.5 max-w-md text-center">
                    {result.summary}
                  </div>
                )}

                {/* Center node */}
                <button
                  onClick={() => setSelectedNode('root')}
                  className={`px-5 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    selectedNode === 'root'
                      ? 'border-accent-orange bg-accent-orange/15 text-accent-orange scale-105'
                      : 'border-accent-orange/30 bg-accent-orange/10 text-warm-700 hover:scale-102'
                  }`}
                >
                  {result.center?.label || topic}
                </button>

                {/* Connection lines visual */}
                <div className="w-px h-6 bg-cream-300" />

                {/* Branches */}
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                  {result.branches?.map(branch => (
                    <div key={branch.id} className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => setSelectedNode(branch.id)}
                        className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                          selectedNode === branch.id
                            ? 'border-accent-sage bg-accent-sage/15 text-accent-sage scale-105'
                            : 'border-cream-300 bg-surface text-warm-600 hover:border-warm-400'
                        }`}
                        style={{ borderColor: selectedNode === branch.id ? undefined : branch.color + '40' }}
                      >
                        {branch.label}
                      </button>

                      {/* Children */}
                      {branch.children && branch.children.length > 0 && (
                        <>
                          <div className="w-px h-3 bg-cream-300" />
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {branch.children.map(child => (
                              <button
                                key={child.id}
                                onClick={() => setSelectedNode(child.id)}
                                className={`px-2.5 py-1 rounded-md border text-[10px] transition-all ${
                                  selectedNode === child.id
                                    ? 'border-warm-500 bg-warm-50 text-warm-700 scale-105'
                                    : 'border-cream-300 bg-cream-200/50 text-warm-500 hover:border-warm-400'
                                }`}
                              >
                                {child.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Connections */}
                {result.connections?.length > 0 && (
                  <div className="mt-4 w-full max-w-lg">
                    <div className="text-[10px] text-warm-400 mb-2 text-center">跨分支关联</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {result.connections.map((c, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent-amber/5 border border-accent-amber/15 text-[10px] text-warm-500">
                          <span className="text-accent-amber">{c.from}</span>
                          <Link2 className="w-2.5 h-2.5" />
                          <span className="text-accent-amber">{c.to}</span>
                          {c.label && <span className="text-warm-400 ml-1">({c.label})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats & Save */}
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-[10px] text-warm-400">{totalNodes} 个节点 · {result.branches?.length || 0} 个分支 · {result.connections?.length || 0} 个关联</span>
                  {result.canvas && (
                    <button
                      onClick={handleSaveCanvas}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] bg-accent-sage/10 text-accent-sage border border-accent-sage/20 hover:bg-accent-sage/20 transition-colors"
                    >
                      <Save className="w-3 h-3" /> 保存为 Canvas
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Node detail */}
        {result && selectedNode && (
          <div className="w-64 shrink-0 border-l border-cream-200 overflow-auto bg-cream-100/50 p-3">
            <div className="text-xs font-medium text-warm-600 mb-2 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" /> 节点详情
            </div>
            {selectedNode === 'root' && (
              <div>
                <div className="text-sm font-bold text-warm-700 mb-1">{result.center?.label}</div>
                <div className="text-[11px] text-warm-500">中心主题，共 {result.branches?.length || 0} 个分支</div>
                {result.summary && <div className="text-[11px] text-warm-500 mt-2">{result.summary}</div>}
              </div>
            )}
            {result.branches?.map(b => {
              if (b.id === selectedNode) {
                return (
                  <div key={b.id}>
                    <div className="text-sm font-bold text-warm-700 mb-1">{b.label}</div>
                    <div className="text-[11px] text-warm-500">{b.children?.length || 0} 个子节点</div>
                    {b.children?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {b.children.map(c => (
                          <div key={c.id} className="text-[10px] text-warm-500 pl-2 border-l border-cream-300">
                            {c.label}
                            {c.note && <span className="text-warm-400"> → {c.note}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              return null
            })}
            {result.branches?.flatMap(b => b.children || []).map(c => {
              if (c.id === selectedNode) {
                return (
                  <div key={c.id}>
                    <div className="text-sm font-bold text-warm-700 mb-1">{c.label}</div>
                    {c.note && <div className="text-[11px] text-warm-500">关联笔记: {c.note}</div>}
                  </div>
                )
              }
              return null
            })}
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
