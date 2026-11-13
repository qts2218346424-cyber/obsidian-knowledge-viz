import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Search, Wrench,
  Upload, Play, Loader2, AlertTriangle, Check,
  FileText, FolderUp, Sparkles, CheckCircle2, RotateCcw,
  Layers, ArrowRight
} from 'lucide-react'
import { api, type IngestResult, type IngestStatus, type ResearchGap, type LintFixResult } from '../services/api'
import { useVaultHealth } from '../hooks/useVaultData'
import { DefuddlePanel, QueryPanel, FoldPanel, ThinkPanel } from '../components/workflow/SkillPanels'
import TagManager from '../components/workflow/TagManager'
import DuplicatesPanel from '../components/workflow/DuplicatesPanel'
import {
  type PipelineStep, nodeTypes, getLayoutedElements, delay,
} from '../components/workflow/shared'

// ─── Ingestion Pipeline ───────────────────────────────────────────────────────

const initialIngestionSteps: PipelineStep[] = [
  { id: '1', label: '文档输入', desc: '选择并上传文档', icon: 'FileInput', status: 'pending' },
  { id: '2', label: 'MarkItDown 转换', desc: '微软多格式 Markdown 解析与智能保底', icon: 'Cog', status: 'pending' },
  { id: '3', label: 'AI 自组织整理', desc: '自组织第二大脑架构 (claude-obsidian)', icon: 'Search', status: 'pending' },
  { id: '4', label: '知识图谱织网', desc: '全库匹配自动建立 [[Wikilinks]]', icon: 'Link', status: 'pending' },
  { id: '5', label: 'MOC 内容地图挂载', desc: '自动挂载入学科 _index.md 索引树', icon: 'Binary', status: 'pending' },
  { id: '6', label: '写入知识库 & 题库', desc: '标准 Markdown 落盘并沉淀考研真题', icon: 'CheckCircle', status: 'pending' },
]

function IngestionPanel() {
  const [steps, setSteps] = useState<PipelineStep[]>(initialIngestionSteps)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [ingestStatus, setIngestStatus] = useState<IngestStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 挂载时加载后端摄取引擎健康状态，让用户明确知晓服务是否正常就绪
  useEffect(() => {
    let mounted = true
    api.getIngestStatus()
      .then(res => {
        if (mounted) setIngestStatus(res)
      })
      .catch(() => {
        if (mounted) {
          setIngestStatus({
            installed: false,
            supportedFormats: ['.pdf', '.docx', '.xlsx', '.pptx', '.txt', '.md', '.png', '.jpg'],
          })
        }
      })
      .finally(() => {
        if (mounted) setStatusLoading(false)
      })
    return () => { mounted = false }
  }, [])

  const updateStep = useCallback((id: string, patch: Partial<PipelineStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [])

  const resetSteps = () => {
    setSteps(initialIngestionSteps)
    setResult(null)
    setError('')
  }

  const processFile = async (file: File) => {
    if (!file) return

    setRunning(true)
    setError('')
    setResult(null)
    resetSteps()

    try {
      // Step 1: Document input
      updateStep('1', { status: 'active', desc: '正在读取文件...' })
      await delay(350)
      updateStep('1', { status: 'done', detail: file.name, desc: `${(file.size / 1024).toFixed(1)} KB` })

      // Step 2: MarkItDown parsing
      updateStep('2', { status: 'active', desc: '微软 MarkItDown 多格式解析中...' })

      const res = await api.uploadFile(file)

      updateStep('2', {
        status: 'done',
        detail: res.method === 'microsoft_markitdown' ? 'MarkItDown 结构化解析完成' : 'MarkItDown + 多级保底',
        desc: 'Markdown 生成完成',
      })
      await delay(250)

      updateStep('3', {
        status: 'done',
        detail: `${res.subject || '知识提炼完成'} · 提炼 ${res.entities?.length || 0} 个核心概念`,
        desc: '知识提炼与领域分类',
      })
      await delay(250)

      updateStep('4', {
        status: 'done',
        detail: `${res.wikilinks} 条 [[双链]] 自动织网`,
        desc: '全库拓扑建立完毕',
      })
      await delay(250)

      updateStep('5', {
        status: 'done',
        detail: res.mocPath ? `已挂载 MOC: ${res.mocPath}` : '已完成学科分类归档',
        desc: '内容地图索引树挂载',
      })
      await delay(250)

      updateStep('6', {
        status: 'done',
        detail: `${res.markdownPath} · 沉淀 ${res.questionsCount || 0} 道做题库真题`,
        desc: '落盘成功并沉淀考点真题',
      })

      setResult(res)
    } catch (err: any) {
      const msg = err.message === 'Internal Server Error'
        ? '文档解析或写入异常：请确认上传格式在支持列表内（PDF, Word, Excel, Markdown等）且服务正常'
        : err.message
      setError(msg)
      setSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'pending', desc: '处理中断' } : s))
    } finally {
      setRunning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  // 拖拽上传支持
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!running) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (running) return
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const { nodes, edges } = useMemo(() => getLayoutedElements(steps), [steps])

  const supportedFormatsDisplay = ingestStatus?.supportedFormats?.length
    ? ['PDF', 'Word (.docx)', 'Markdown', 'Excel (.xlsx)', 'PPT (.pptx)', '图片 (OCR)', 'EPUB', 'TXT']
    : ['PDF', 'Word', 'Markdown', 'Excel', 'PPT', '图片', 'TXT']

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col h-full shadow-xs">
      {/* 顶部标题与引擎状态条 */}
      <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between gap-3 flex-wrap bg-slate-50/50">
        <div className="flex-1 min-w-[280px]">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2 flex-wrap">
            <span>文档摄取 Pipeline</span>
            <span className="inline-flex items-center gap-1.5 text-2xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>MarkItDown + claude-obsidian 第二大脑织网</span>
            </span>
            {statusLoading ? (
              <span className="text-2xs text-slate-400">检测引擎中...</span>
            ) : ingestStatus?.installed ? (
              <span className="text-2xs text-slate-500 font-mono">Python 就绪</span>
            ) : (
              <span className="text-2xs text-amber-600">多级纯文本保底就绪</span>
            )}
          </div>
          <div className="text-2xs text-slate-500 mt-1 leading-relaxed">
            上传任意课件/真题/讲义 → 微软 MarkItDown 转换为 Markdown → AI 核心考点提炼与 [[双向链接]] 织网 → 挂载学科 MOC 并沉淀真题
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.pptx,.html,.htm,.txt,.md,.markdown,.csv,.epub,.odt,.rtf,.json,.xml,.jpg,.jpeg,.png"
            onChange={handleUpload}
            className="hidden"
          />
          {result && (
            <button
              type="button"
              onClick={resetSteps}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>摄取新文档</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-xs cursor-pointer active:scale-98"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{running ? '正在转换与整理...' : '选择文件'}</span>
          </button>
        </div>
      </div>

      {/* 状态区分引导区：当没有正在运行的任务且未生成结果时，展示大型拖放上传引导与空状态解释，彻底消除“分不清是没有数据还是没加载出来” */}
      {!running && !result && (
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99] shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white shadow-2xs'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
            }`}>
              <FolderUp className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-2">
                <span>当前暂无运行中的摄取任务</span>
                <span className="text-2xs font-normal text-slate-400">· 待命中</span>
              </div>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                将考研真题、讲义课件或教材拖拽至此处，或点击直接选择文件。系统将启动全自动 6 步流水线，一键归类并沉淀知识网。
              </p>
            </div>

            {/* 支持格式标签胶囊 */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 max-w-xl">
              <span className="text-2xs text-slate-400 font-medium">支持格式:</span>
              {supportedFormatsDisplay.map(fmt => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded-md text-2xs bg-slate-100/90 text-slate-600 border border-slate-200/70 font-mono"
                >
                  {fmt}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 text-2xs text-slate-400 pt-1 border-t border-slate-100 mt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>自动提炼核心概念</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>全库 [[双向链接]] 织网</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>沉淀做题中心真题</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 运行中高亮提示条 */}
      {running && (
        <div className="px-5 py-3 border-b border-amber-200/80 bg-amber-50/70 flex items-center justify-between text-xs text-amber-900 animate-pulse">
          <div className="flex items-center gap-2 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>摄取任务执行中：MarkItDown 正在流式解析与 AI 知识库织网，请稍候...</span>
          </div>
          <span className="text-2xs text-amber-700 font-mono">Pipeline Running</span>
        </div>
      )}

      {/* 自动化 6 步流水线画布展示区 */}
      <div className="flex flex-col flex-1 overflow-hidden border-t border-slate-200/80">
        <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-2xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>摄取流程画布 ({running ? '执行中高亮' : result ? '入库完成' : '待处理阶段预览'})</span>
          </div>
          <span className="text-slate-400 font-mono">Dagre Topology · 6 Steps Flow</span>
        </div>

        <div className="flex flex-1 overflow-hidden">
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
              className="!bg-slate-50"
            >
              <Background color="#CBD5E1" gap={22} size={1} />
              <Controls className="!bg-white !border-slate-200/80 !rounded-xl !shadow-xs" showInteractive={false} />
              <MiniMap nodeColor="#94A3B8" maskColor="rgba(248,250,252,0.85)" className="!bg-white !border-slate-200/80 !rounded-xl !shadow-xs" />
            </ReactFlow>
          </div>
        </div>
      </div>

      {/* 摄取成功成果报告展示卡片 */}
      {result && (
        <div className="px-5 py-4 border-t border-emerald-200/80 bg-emerald-50/40 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>知识库自动整理入库成功: {result.originalName}</span>
            </div>
            <span className="text-2xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {result.domain === 'cs_408' ? '408 统考' : result.domain === 'math' ? '考研数学' : '核心知识库'} · {result.subject || '全学科'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-emerald-200/80 text-xs space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-700 font-medium">
              <span>📄 归档路径: <span className="font-mono text-indigo-700 font-semibold">{result.markdownPath}</span></span>
              <span className="font-mono text-slate-500">{result.wordCount} 字</span>
            </div>
            {result.mocPath && (
              <div className="text-2xs text-slate-500">
                🗺️ 已自动挂载学科 MOC: <span className="font-mono text-slate-700 font-medium">{result.mocPath}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-2xs">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                🔗 {result.wikilinks} 条 [[双向链接]] 建立
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                🎯 沉淀 {result.questionsCount || 0} 道做题中心题目
              </span>
              {result.tags?.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                  🏷️ {result.tags.join(', ')}
                </span>
              )}
            </div>
          </div>

          <div className="text-2xs text-slate-600 font-mono bg-white rounded-xl p-3 max-h-32 overflow-auto border border-emerald-200/60 whitespace-pre-wrap leading-relaxed shadow-2xs">
            {result.preview}
          </div>
        </div>
      )}

      {error && (
        <div className="px-5 py-3 border-t border-rose-200/80 bg-rose-50/90 flex items-center gap-2 text-xs text-rose-700">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

// ─── Research Pipeline ────────────────────────────────────────────────────────

const initialResearchSteps: PipelineStep[] = [
  { id: '1', label: '发现缺口', desc: '从知识库体检报告中查找知识空白', icon: 'Lightbulb', status: 'pending' },
  { id: '2', label: '选择话题', desc: '选择需要补充学习的知识点', icon: 'Globe', status: 'pending' },
  { id: '3', label: 'AI 生成笔记', desc: '结合个人笔记生成结构化内容', icon: 'Puzzle', status: 'pending' },
  { id: '4', label: '知识归档', desc: '写入知识库目录并建立关联链接', icon: 'Archive', status: 'pending' },
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
    <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col h-full shadow-xs">
      <div className="px-5 py-4 border-b border-slate-200/80 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-warm-700">自动研究工作流</div>
          <div className="text-2xs text-warm-400 mt-0.5">发现知识缺口 → AI 生成结构化笔记</div>
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
        <div className="px-5 py-3 border-b border-slate-200/80 bg-white/50">
          <div className="text-2xs text-warm-500 mb-2">选择知识缺口或输入自定义话题:</div>
          <div className="flex flex-wrap gap-2">
            {gaps.map(g => (
              <button
                key={g.topic}
                onClick={() => { setSelectedGap(g.topic); setCustomTopic('') }}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                  selectedGap === g.topic
                    ? 'bg-accent-orange/15 text-accent-orange border-accent-orange/30'
                    : 'bg-cream-200 text-warm-500 border-slate-200/80 hover:border-warm-400'
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
              className="w-full bg-cream-200 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-warm-700 outline-none focus:border-accent-orange"
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1" style={{ minHeight: 360 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={true}
            nodesConnectable={false}
            className="!bg-slate-50"
          >
            <Background color="#E8D5BC" gap={20} />
            <Controls className="!bg-white !border-slate-200/80 !rounded-lg" showInteractive={false} />
            <MiniMap nodeColor="#D4B896" maskColor="rgba(255,251,245,0.8)" className="!bg-white !border-slate-200/80 !rounded-lg" />
          </ReactFlow>
        </div>
      </div>

      {result && (
        <div className="px-5 py-3 border-t border-slate-200/80 bg-accent-sage/5">
          <div className="flex items-center gap-2 text-xs text-accent-sage mb-2">
            <Check className="w-4 h-4" />
            研究完成: {result.topic}
          </div>
          <div className="text-2xs text-warm-500 mb-2">
            路径: {result.path} | {result.wordCount} words
          </div>
          <div className="text-2xs text-warm-400 bg-cream-200 rounded p-2 max-h-24 overflow-auto">
            {result.preview}
          </div>
        </div>
      )}

      {error && (
        <div className="px-5 py-3 border-t border-slate-200/80 bg-rose-50/50 flex items-center gap-2 text-xs text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Lint Pipeline ────────────────────────────────────────────────────────────

const initialLintSteps: PipelineStep[] = [
  { id: '1', label: '扫描笔记库', desc: '梳理全部笔记与讲义文件', icon: 'FolderSearch', status: 'pending' },
  { id: '2', label: '8 项体检', desc: '检查孤立笔记、失效链接、重复内容等', icon: 'ShieldCheck', status: 'pending' },
  { id: '3', label: '生成报告', desc: '按重要程度列出改进清单', icon: 'FileText', status: 'pending' },
  { id: '4', label: '自动修复', desc: '选择类别一键整理修复', icon: 'Wrench', status: 'pending' },
]

function LintPanel() {
  const [steps, setSteps] = useState<PipelineStep[]>(initialLintSteps)
  const [running, setRunning] = useState(false)
  const [fixing, setFixing] = useState<string | null>(null)
  const [fixResults, setFixResults] = useState<Record<string, LintFixResult>>({})
  const [error, setError] = useState('')
  const { report, reload: reloadHealth } = useVaultHealth()
  const [schedule, setSchedule] = useState<{
    enabled: boolean; intervalMinutes: number; autoApplySafe: boolean;
    safeCategories: string[]; lastRun: string | null; schedulerStatus: string
  } | null>(null)
  const [scheduleLoading, setScheduleLoading] = useState(false)

  const loadSchedule = async () => {
    try {
      const res = await api.getScheduleStatus()
      setSchedule(res)
    } catch { /* ignore */ }
  }

  useEffect(() => { loadSchedule() }, [])

  const handleScheduleToggle = async (enabled: boolean) => {
    setScheduleLoading(true)
    try {
      await api.updateScheduleConfig({ enabled })
      await loadSchedule()
    } catch { /* ignore */ }
    setScheduleLoading(false)
  }

  const handleRunNow = async () => {
    setScheduleLoading(true)
    try {
      await api.runScheduleNow()
      await reloadHealth()
      window.dispatchEvent(new CustomEvent('vault-stats-updated'))
      await loadSchedule()
    } catch { /* ignore */ }
    setScheduleLoading(false)
  }

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
      window.dispatchEvent(new CustomEvent('vault-stats-updated'))
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
      window.dispatchEvent(new CustomEvent('vault-stats-updated'))
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
    <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-200/80 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-warm-700">知识库全面体检</div>
          <div className="text-2xs text-warm-400 mt-0.5">扫描 → 检查 → 报告 → 自动修复</div>
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
            className="!bg-slate-50"
          >
            <Background color="#E8D5BC" gap={20} />
            <Controls className="!bg-white !border-slate-200/80 !rounded-lg" showInteractive={false} />
            <MiniMap nodeColor="#D4B896" maskColor="rgba(255,251,245,0.8)" className="!bg-white !border-slate-200/80 !rounded-lg" />
          </ReactFlow>
        </div>

        {/* Issues sidebar */}
        {report && steps[2].status === 'done' && (
          <div className="w-72 shrink-0 border-l border-slate-200/80 overflow-auto bg-slate-50/50">
            <div className="px-3 py-2 text-xs font-medium text-warm-600 border-b border-slate-200/80">
              健康评分: <span className={`font-bold ${report.overallScore >= 80 ? 'text-accent-sage' : report.overallScore >= 60 ? 'text-accent-amber' : 'text-rose-400'}`}>{report.overallScore}</span>
            </div>
            <div className="p-2 space-y-2">
              {report.categories.map(cat => {
                const issueCount = cat.issues.length
                const isFixable = fixableCategories.includes(cat.name)
                const fixResult = fixResults[cat.name]

                return (
                  <div key={cat.name} className="bg-white border border-slate-200/80 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xs font-medium text-warm-600">{cat.label}</span>
                      <span className="text-2xs text-warm-400">{cat.score}/{cat.maxScore}</span>
                    </div>
                    {issueCount > 0 && (
                      <div className="text-2xs text-warm-400 mb-1.5">{issueCount} 个问题</div>
                    )}
                    {isFixable && issueCount > 0 && !fixResult && (
                      <button
                        onClick={() => handleFix(cat.name)}
                        disabled={fixing === cat.name}
                        className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-2xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
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
                      <div className="text-2xs text-accent-sage flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        修复 {fixResult.fixed}, 跳过 {fixResult.skipped}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Schedule control */}
            <div className="p-3 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-warm-600">定时整理</span>
                <button
                  onClick={() => handleScheduleToggle(!schedule?.enabled)}
                  disabled={scheduleLoading}
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    schedule?.enabled ? 'bg-accent-sage' : 'bg-cream-300'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${
                    schedule?.enabled ? 'left-4.5' : 'left-0.5'
                  }`} />
                </button>
              </div>
              {schedule?.enabled && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-2xs text-warm-400">间隔:</span>
                    <input
                      type="number"
                      value={schedule.intervalMinutes}
                      min={5}
                      onChange={async (e) => {
                        const v = Math.max(5, parseInt(e.target.value) || 60)
                        await api.updateScheduleConfig({ intervalMinutes: v })
                        await loadSchedule()
                      }}
                      className="w-14 bg-cream-200 border border-slate-200/80 rounded px-1.5 py-0.5 text-2xs text-warm-600 outline-none"
                    />
                    <span className="text-2xs text-warm-400">分钟</span>
                  </div>
                  <button
                    onClick={handleRunNow}
                    disabled={scheduleLoading}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded text-2xs bg-accent-orange/10 text-accent-orange hover:bg-accent-orange/20 transition-colors"
                  >
                    {scheduleLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
                    立即执行
                  </button>
                  {schedule.lastRun && (
                    <div className="text-2xs text-warm-400">
                      上次: {new Date(schedule.lastRun).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-5 py-3 border-t border-slate-200/80 bg-rose-50/50 flex items-center gap-2 text-xs text-rose-400">
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
      <div className="flex gap-2 shrink-0 flex-wrap">
        {[
          { key: 'ingestion', label: '文档摄取' },
          { key: 'research', label: '自动研究' },
          { key: 'lint', label: '健康检查' },
          { key: 'defuddle', label: '网页抓取' },
          { key: 'query', label: '智能查询' },
          { key: 'fold', label: '笔记整理' },
          { key: 'think', label: '思维画布' },
          { key: 'tags', label: '标签管理' },
          { key: 'duplicates', label: '重复检测' },
        ].map(p => (
          <button
            key={p.key}
            onClick={() => setActivePipeline(p.key)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activePipeline === p.key
                ? 'bg-slate-900 text-white shadow-xs border border-slate-900'
                : 'subframe-btn-secondary text-slate-600 hover:text-slate-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Active pipeline */}
      <div className="flex-1 min-h-[520px] flex flex-col">
        {activePipeline === 'ingestion' && <IngestionPanel />}
        {activePipeline === 'research' && <ResearchPanel />}
        {activePipeline === 'lint' && <LintPanel />}
        {activePipeline === 'defuddle' && <DefuddlePanel />}
        {activePipeline === 'query' && <QueryPanel />}
        {activePipeline === 'fold' && <FoldPanel />}
        {activePipeline === 'think' && <ThinkPanel />}
        {activePipeline === 'tags' && <TagManager />}
        {activePipeline === 'duplicates' && <DuplicatesPanel />}
      </div>
    </div>
  )
}
