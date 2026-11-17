import { createPortal } from 'react-dom'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
  Layers,
  ArrowRight,
  Database,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Network,
  ListTree,
  BookmarkCheck,
  Check,
  AlertCircle
} from 'lucide-react'
import MarkdownRenderer from '../MarkdownRenderer'
import {
  api,
  type BookItem,
  type BookOutlineResult,
  type DeepExtractResult,
  type ScanTaskState
} from '../../services/api'

interface BookExtractModalProps {
  book: BookItem
  onClose: () => void
  onSuccess: () => void
}

function parsePageRangeText(raw: string): { startPage?: number; endPage?: number } {
  const cleaned = raw.trim().replace(/[～~至]/g, '-')
  if (!cleaned) return {}
  const rangeMatch = cleaned.match(/^(\d+)\s*-\s*(\d+)$/)
  if (rangeMatch) {
    const s = parseInt(rangeMatch[1], 10)
    const e = parseInt(rangeMatch[2], 10)
    if (s >= 1 && e >= s) return { startPage: s, endPage: e }
  }
  const singleMatch = cleaned.match(/^(\d+)$/)
  if (singleMatch) {
    const p = parseInt(singleMatch[1], 10)
    if (p >= 1) return { startPage: p, endPage: p }
  }
  return {}
}

function isMultiChoiceQ(q: any): boolean {
  if (q?.type === 'multiple') return true
  if (q?.options && Object.keys(q.options).length > 0) {
    const ans = String(q?.answer || '').trim()
    if (/^[A-Fa-f](?:[\s,，、/]*[A-Fa-f])+$/.test(ans)) {
      const letters = new Set(ans.toUpperCase().match(/[A-F]/g) || [])
      if (letters.size >= 2) return true
    }
  }
  return false
}

export const BookExtractModal: React.FC<BookExtractModalProps> = ({
  book,
  onClose,
  onSuccess
}) => {
  const isQuestionBook =
    book.name.includes('题') ||
    book.name.includes('做题本') ||
    book.name.includes('880') ||
    book.name.includes('1000') ||
    book.name.includes('真题') ||
    book.category === '历年真题' ||
    book.category === '真题' ||
    book.category === '模拟题卷' ||
    book.category === '模拟题'

  const [mode, setMode] = useState<'concept' | 'question' | 'dual'>(
    isQuestionBook ? 'question' : 'dual'
  )

  // 大纲与页码范围状态
  const [loadingOutline, setLoadingOutline] = useState(true)
  const [outlineData, setOutlineData] = useState<BookOutlineResult | null>(null)
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([])
  const [expandedChapterIds, setExpandedChapterIds] = useState<Record<string, boolean>>({})
  const [pageRangeInput, setPageRangeInput] = useState<string>('')

  // 真实执行与后台扫描轮询状态
  const [extracting, setExtracting] = useState(false)
  const [extractProgressStep, setExtractProgressStep] = useState<string>('')
  const [scanTask, setScanTask] = useState<ScanTaskState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollTimerRef = useRef<number | null>(null)

  // 真实拆解成果
  const [deepResult, setDeepResult] = useState<DeepExtractResult | null>(null)
  const [scanSummaryWarning, setScanSummaryWarning] = useState<string | null>(null)
  const [activeResultTab, setActiveResultTab] = useState<'notes' | 'questions' | 'outline'>('notes')
  const [selectedNoteIndex, setSelectedNoteIndex] = useState<number>(0)
  const [expandedPassages, setExpandedPassages] = useState<Record<number, boolean>>({})

  const stopPolling = () => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  // 初始化加载全书章节目录树
  useEffect(() => {
    let isMounted = true
    const fetchOutline = async () => {
      setLoadingOutline(true)
      setError(null)
      try {
        const data = await api.getBookOutline(book.relativePath, book.scope)
        if (isMounted && data && data.success) {
          setOutlineData(data)
          const allIds = data.chapters.map(c => c.id)
          setSelectedChapterIds(allIds)
          if (data.chapters.length > 0) {
            setExpandedChapterIds({ [data.chapters[0].id]: true })
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to get book outline:', err)
          setError(err.message || '获取书籍章节架构大纲失败')
        }
      } finally {
        if (isMounted) {
          setLoadingOutline(false)
        }
      }
    }

    fetchOutline()
    return () => {
      isMounted = false
    }
  }, [book.relativePath, book.scope])

  // 根据勾选章节计算对应的真实原书页码跨度（1-based）
  const selectedChapterPageSpan = useMemo<{ startPage?: number; endPage?: number }>(() => {
    if (!outlineData || selectedChapterIds.length === 0) return {}
    const picked = outlineData.chapters.filter(c => selectedChapterIds.includes(c.id))
    let minStart = Infinity
    let maxEnd = -Infinity
    for (const ch of picked) {
      if (typeof ch.startPage === 'number') {
        minStart = Math.min(minStart, ch.startPage + 1)
        const chEnd = typeof ch.endPage === 'number' ? ch.endPage + 1 : ch.startPage + 1
        maxEnd = Math.max(maxEnd, chEnd)
      }
    }
    if (Number.isFinite(minStart) && Number.isFinite(maxEnd) && maxEnd >= minStart) {
      return { startPage: minStart, endPage: maxEnd }
    }
    return {}
  }, [outlineData, selectedChapterIds])

  const handleToggleChapter = (id: string) => {
    setSelectedChapterIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (!outlineData) return
    if (selectedChapterIds.length === outlineData.chapters.length) {
      setSelectedChapterIds([])
    } else {
      setSelectedChapterIds(outlineData.chapters.map(c => c.id))
    }
  }

  const toggleExpandChapter = (id: string) => {
    setExpandedChapterIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // 启动真实深度拆解与后台分片扫描轮询
  const handleStartDeepExtract = async () => {
    const manualRange = parsePageRangeText(pageRangeInput)
    const hasManualRange = Boolean(manualRange.startPage)

    if (!hasManualRange && outlineData && outlineData.chapters.length > 0 && selectedChapterIds.length === 0) {
      setError('请至少勾选一个需要拆解的章节，或在下方填写需要扫描的页码范围')
      return
    }

    stopPolling()
    setExtracting(true)
    setError(null)
    setScanTask(null)
    setScanSummaryWarning(null)

    const effectiveDomain = outlineData?.domain || book.domain
    const effectiveSubject = outlineData?.subject

    // 计算有效的扫描页码区间（手动填写优先；若未全选全部章节则使用所选章节页码跨度）
    const isPartialChapters =
      Boolean(outlineData && outlineData.chapters.length > 0 && selectedChapterIds.length < outlineData.chapters.length)
    const effectiveStartPage = manualRange.startPage ?? (isPartialChapters ? selectedChapterPageSpan.startPage : undefined)
    const effectiveEndPage = manualRange.endPage ?? (isPartialChapters ? selectedChapterPageSpan.endPage : undefined)

    try {
      let baseDeepRes: DeepExtractResult | null = null

      // 1. 若为笔记拆解或双轨模式，先调用真实的 /api/books/deep-extract 提取原书章节笔记体系与课后原题
      if (mode === 'concept' || mode === 'dual') {
        setExtractProgressStep('正在读取原书章节正文与书签结构，生成 Obsidian 章节笔记与双向链接星图...')
        const res = await api.deepExtractBook({
          relativePath: book.relativePath,
          scope: book.scope,
          domain: effectiveDomain,
          subject: effectiveSubject,
          selectedChapterIds: selectedChapterIds.length > 0 ? selectedChapterIds : undefined,
          mode
        })
        if (res && res.success) {
          baseDeepRes = res
        }
      }

      // 2. 若仅需章节讲义拆解（concept）且未指定页码扫描范围，直接展示真实的 deep-extract 结果
      if (mode === 'concept' && !hasManualRange && baseDeepRes) {
        setDeepResult(baseDeepRes)
        setActiveResultTab('notes')
        setSelectedNoteIndex(0)
        setExtracting(false)
        onSuccess()
        window.dispatchEvent(new CustomEvent('vault-updated'))
        if (baseDeepRes.totalQuestionsCount > 0) {
          window.dispatchEvent(new CustomEvent('custom-questions-updated'))
        }
        return
      }

      // 3. 当需要提取真题（question / dual）或指定了页码范围时，若原书结构化提取未覆盖或需 AI 全卷分片深扫，启动真实 /api/books/scan-start 并轮询 /api/books/scan-status/:taskId
      const shouldRunScanQueue =
        mode === 'question' ||
        hasManualRange ||
        (mode === 'dual' && (!baseDeepRes || baseDeepRes.totalQuestionsCount === 0))

      if (!shouldRunScanQueue && baseDeepRes) {
        setDeepResult(baseDeepRes)
        setActiveResultTab(baseDeepRes.notes.length > 0 ? 'notes' : 'questions')
        setSelectedNoteIndex(0)
        setExtracting(false)
        onSuccess()
        window.dispatchEvent(new CustomEvent('vault-updated'))
        window.dispatchEvent(new CustomEvent('custom-questions-updated'))
        return
      }

      setExtractProgressStep('正在提交后台分片扫描任务，逐页提取真实原题与解析...')
      const startRes = await api.startBookScan({
        relativePath: book.relativePath,
        scope: book.scope,
        domain: effectiveDomain,
        subject: effectiveSubject,
        mode,
        startPage: effectiveStartPage,
        endPage: effectiveEndPage,
        maxChunks: 24
      })

      if (!startRes.success || !startRes.task) {
        if (baseDeepRes) {
          setDeepResult(baseDeepRes)
          setActiveResultTab('notes')
          setExtracting(false)
          onSuccess()
          return
        }
        throw new Error('未能启动后台扫描任务')
      }

      setScanTask(startRes.task)
      setExtractProgressStep(startRes.task.stepMessage)
      const taskId = startRes.task.taskId

      const pollOnce = async () => {
        try {
          const statusRes = await api.getBookScanStatus(taskId)
          const t = statusRes.task
          if (!t) return
          setScanTask(t)
          setExtractProgressStep(t.stepMessage)

          if (t.status === 'completed') {
            stopPolling()
            const scannedQuestions = Array.isArray(t.previewQuestions) ? t.previewQuestions : []
            const mergedQuestions = [
              ...(baseDeepRes?.questions || []),
              ...scannedQuestions
            ]
            const totalQCount = (baseDeepRes?.totalQuestionsCount || 0) + (t.extractedQuestionsCount || 0)

            const mergedNotes = [...(baseDeepRes?.notes || [])]
            if (t.savedNotePath && t.note?.title && !mergedNotes.some(n => n.path === t.savedNotePath)) {
              mergedNotes.push({
                title: t.note.title,
                path: t.savedNotePath,
                chapterTitle: t.scannedPageRange ? `第 ${t.scannedPageRange} 页扫描归纳` : '全卷扫描考点归纳'
              })
            }

            if (t.warningMessage) {
              setScanSummaryWarning(t.warningMessage)
            }

            const finalResult: DeepExtractResult = {
              success: true,
              bookName: baseDeepRes?.bookName || t.bookName || book.name,
              chaptersCount: baseDeepRes?.chaptersCount || (mergedNotes.length > 0 ? mergedNotes.length : 1),
              totalQuestionsCount: totalQCount,
              indexNoteTitle: baseDeepRes?.indexNoteTitle || t.note?.title || `${book.name} 扫描归档`,
              indexNotePath: baseDeepRes?.indexNotePath || t.savedNotePath || '',
              notes: mergedNotes,
              questions: mergedQuestions,
              domain: t.domain || effectiveDomain,
              subject: t.subject || effectiveSubject || '综合科目'
            }

            setDeepResult(finalResult)
            setActiveResultTab(
              mode === 'question' || (mergedNotes.length === 0 && !baseDeepRes?.indexNotePath)
                ? 'questions'
                : 'notes'
            )
            setSelectedNoteIndex(0)
            setExtracting(false)
            onSuccess()
            window.dispatchEvent(new CustomEvent('custom-questions-updated'))
            window.dispatchEvent(new CustomEvent('vault-updated'))
          } else if (t.status === 'error') {
            stopPolling()
            if (baseDeepRes) {
              setDeepResult(baseDeepRes)
              setScanSummaryWarning(`章节笔记已生成，但后台题库分片扫描中断：${t.error || t.stepMessage}`)
              setExtracting(false)
              onSuccess()
            } else {
              setError(t.error || t.stepMessage || '后台扫描任务执行失败')
              setExtracting(false)
            }
          }
        } catch (pollErr: any) {
          console.warn('Poll book scan status warning:', pollErr?.message)
        }
      }

      await pollOnce()
      pollTimerRef.current = window.setInterval(() => {
        void pollOnce()
      }, 1500)
    } catch (err: any) {
      stopPolling()
      setError(err.message || '深度提取失败，请检查服务状态后重试')
      setExtracting(false)
    }
  }

  // 渲染右侧选中的笔记预览
  const renderSelectedNote = () => {
    if (!deepResult) return null

    if (selectedNoteIndex === 0 && deepResult.indexNotePath) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cream-100">
            <div>
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700">
                图谱总览笔记
              </span>
              <h5 className="font-bold text-warm-900 text-sm mt-1">
                {deepResult.indexNoteTitle}
              </h5>
            </div>
            <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> 已持久化入库
            </span>
          </div>
          <div className="text-xs text-warm-500 bg-cream-50 p-2.5 rounded-lg border border-cream-200 font-mono break-all">
            存入路径：<span className="text-cyan-700">{deepResult.indexNotePath}</span>
          </div>
          <div className="text-xs text-warm-700 leading-relaxed space-y-2">
            <p>
              该笔记作为 <b>《{deepResult.bookName}》</b> 在知识图谱中的中心主节点，连接本书已拆解的{' '}
              <b>{deepResult.notes.length} 篇章节笔记</b>。
            </p>
            {deepResult.notes.length > 0 && (
              <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-900 text-xs">
                <div className="font-bold mb-1">🔗 双向链接星图导航预览：</div>
                <ul className="list-disc pl-4 space-y-1">
                  {deepResult.notes.map(n => (
                    <li key={n.path}>
                      <code>[[{n.title}]]</code>（{n.chapterTitle}）
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )
    }

    const effectiveIdx = deepResult.indexNotePath ? selectedNoteIndex - 1 : selectedNoteIndex
    const currentNote = deepResult.notes[effectiveIdx]
    if (!currentNote) {
      return (
        <div className="py-10 text-center text-xs text-warm-400">
          本次任务以题库扫描为主，请点击上方「录入的考研真题」标签页查看提取结果。
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-cream-100">
          <div>
            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700">
              章节深度精解
            </span>
            <h5 className="font-bold text-warm-900 text-sm mt-1">
              {currentNote.title}
            </h5>
          </div>
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> 已持久化入库
          </span>
        </div>
        <div className="text-xs text-warm-500 bg-cream-50 p-2.5 rounded-lg border border-cream-200 font-mono break-all">
          存入路径：<span className="text-cyan-700">{currentNote.path}</span>
        </div>
        <div className="text-xs text-warm-700 leading-relaxed space-y-2">
          <p>
            <b>归属范围</b>：{currentNote.chapterTitle}
          </p>
          <p>
            笔记内容提取自原书对应章节的真实文本结构与考点脉络，并已自动写入个人/公共知识库。
          </p>
          <div className="p-2.5 rounded-lg bg-cream-50 border border-cream-200 text-warm-600 text-xs">
            💡 可直接在系统的 <b>全景图谱视图</b> 与 <b>记忆闪卡中心</b> 中打开此笔记复习。
          </div>
        </div>
      </div>
    )
  }

  const totalNotesGenerated = deepResult
    ? deepResult.notes.length + (deepResult.indexNotePath ? 1 : 0)
    : 0

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-cream-200 w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-cream-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-600 border border-cyan-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-warm-900 text-base">
                  全书章节拆解与后台分片提题工作台
                </h3>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                  {book.domain === 'cs_408'
                    ? '408 计算机统考'
                    : book.domain === 'english'
                      ? '考研英语'
                      : book.domain === 'politics'
                        ? '考研政治'
                        : book.domain === 'general'
                          ? '专业课/综合'
                          : '全国统考数学'}
                </span>
                {outlineData && (
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    学科：{outlineData.subject}
                  </span>
                )}
              </div>
              <p className="text-xs text-warm-500 truncate max-w-xl mt-0.5">
                当前资料：<span className="font-medium text-warm-800">{book.name}</span>
                <span className="ml-2 text-warm-400">({(book.size / 1024 / 1024).toFixed(2)} MB)</span>
                {outlineData?.totalPages ? (
                  <span className="ml-2 text-slate-600 font-mono">共 {outlineData.totalPages} 页</span>
                ) : null}
                {outlineData && (
                  <span className="ml-2 text-cyan-700 font-medium">
                    · 识别出 {outlineData.totalChapters} 个章节
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopPolling()
              onClose()
            }}
            className="p-2 rounded-xl text-warm-400 hover:text-warm-700 hover:bg-cream-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 主体交互区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!deepResult ? (
            <>
              {/* 1. 解析模式选择 */}
              <div>
                <label className="block text-xs font-bold text-warm-700 mb-2 uppercase tracking-wider">
                  1. 选择提取与入库模式
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div
                    onClick={() => !extracting && setMode('concept')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mode === 'concept'
                        ? 'bg-cyan-500/10 border-cyan-500 shadow-sm'
                        : 'border-cream-200 bg-surface hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <BookOpen className={`w-4 h-4 ${mode === 'concept' ? 'text-cyan-600' : 'text-warm-500'}`} />
                      <span className={`text-sm font-bold ${mode === 'concept' ? 'text-cyan-900' : 'text-warm-800'}`}>
                        章节讲义笔记拆解
                      </span>
                    </div>
                    <p className="text-xs text-warm-500 leading-relaxed">
                      按原书章节结构生成独立的 <b>Obsidian 章节笔记</b> 与全书星图总览双向链接。
                    </p>
                  </div>

                  <div
                    onClick={() => !extracting && setMode('question')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mode === 'question'
                        ? 'bg-amber-500/10 border-amber-500 shadow-sm'
                        : 'border-cream-200 bg-surface hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <HelpCircle className={`w-4 h-4 ${mode === 'question' ? 'text-amber-600' : 'text-warm-500'}`} />
                      <span className={`text-sm font-bold ${mode === 'question' ? 'text-amber-900' : 'text-warm-800'}`}>
                        全卷分片真实扫题
                      </span>
                    </div>
                    <p className="text-xs text-warm-500 leading-relaxed">
                      启动后台分片扫描队列，按页提取原卷真实单选/多选/阅读/大题并实时增量写入题库。
                    </p>
                  </div>

                  <div
                    onClick={() => !extracting && setMode('dual')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mode === 'dual'
                        ? 'bg-purple-500/10 border-purple-500 shadow-sm'
                        : 'border-cream-200 bg-surface hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Layers className={`w-4 h-4 ${mode === 'dual' ? 'text-purple-600' : 'text-warm-500'}`} />
                      <span className={`text-sm font-bold ${mode === 'dual' ? 'text-purple-900' : 'text-warm-800'}`}>
                        笔记 + 题库双轨提取 (推荐)
                      </span>
                    </div>
                    <p className="text-xs text-warm-500 leading-relaxed">
                      既按所选章节构建知识图谱 Markdown 笔记，又对选定页码范围执行真实原题提取入库。
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. 章节目录树与起止页码范围选择 */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-bold text-warm-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTree className="w-3.5 h-3.5 text-cyan-600" />
                    <span>2. 选择目标章节与页码范围 (已选 {selectedChapterIds.length} / {outlineData?.chapters.length || 0} 章)</span>
                  </label>
                  {outlineData && outlineData.chapters.length > 0 && (
                    <button
                      type="button"
                      disabled={extracting}
                      onClick={handleSelectAll}
                      className="text-xs text-cyan-600 hover:text-cyan-800 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {selectedChapterIds.length === outlineData.chapters.length ? (
                        <>
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>取消全选</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-3.5 h-3.5" />
                          <span>全选所有章节</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {loadingOutline ? (
                  <div className="p-8 rounded-xl bg-cream-50 border border-cream-200 flex flex-col items-center justify-center text-warm-500 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                    <span className="text-xs font-medium">正在读取原书目录书签与真实页码跨度...</span>
                  </div>
                ) : outlineData && outlineData.chapters.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {outlineData.chapters.map(ch => {
                      const isSelected = selectedChapterIds.includes(ch.id)
                      const isExpanded = !!expandedChapterIds[ch.id]

                      return (
                        <div
                          key={ch.id}
                          className={`rounded-xl border transition-all ${
                            isSelected
                              ? 'border-cyan-500/40 bg-cyan-50/20'
                              : 'border-cream-200 bg-surface opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <button
                                type="button"
                                disabled={extracting}
                                onClick={() => handleToggleChapter(ch.id)}
                                className="text-cyan-600 hover:text-cyan-700 shrink-0 cursor-pointer"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-cyan-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-warm-300" />
                                )}
                              </button>
                              <div
                                onClick={() => !extracting && handleToggleChapter(ch.id)}
                                className="cursor-pointer flex-1 min-w-0"
                              >
                                <span className="font-semibold text-xs text-warm-900 block truncate">
                                  {ch.title}
                                </span>
                                <div className="text-2xs text-warm-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                                  {ch.startPage !== undefined && (
                                    <span className="font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                                      原书第 {ch.startPage + 1} ~ {(ch.endPage ?? ch.startPage) + 1} 页 ({ch.pageCount || 1} 页)
                                    </span>
                                  )}
                                  <span>{ch.subSections.length} 个小节脉络</span>
                                  {ch.exercisePagesCount !== undefined && ch.exercisePagesCount > 0 && (
                                    <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                      🎯 检测到 {ch.exercisePagesCount} 页习题区
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {ch.startPage !== undefined && (
                                <button
                                  type="button"
                                  disabled={extracting}
                                  onClick={() =>
                                    setPageRangeInput(`${ch.startPage! + 1}-${(ch.endPage ?? ch.startPage!) + 1}`)
                                  }
                                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-cyan-100 text-slate-600 hover:text-cyan-800 font-mono cursor-pointer transition-colors"
                                  title="将该章起止页码填入下方精确扫描框"
                                >
                                  填入页码
                                </button>
                              )}
                              {ch.subSections.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpandChapter(ch.id)}
                                  className="text-warm-400 hover:text-warm-700 p-1 rounded-lg text-xs flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span className="text-2xs">{isExpanded ? '收起' : '小节'}</span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {isExpanded && ch.subSections.length > 0 && (
                            <div className="px-4 pb-3 pt-1 border-t border-cream-100 bg-white/40">
                              <div className="text-2xs text-warm-600 space-y-1">
                                {ch.subSections.map((sub, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-1.5">
                                    <span className="text-cyan-500 font-mono">•</span>
                                    <span className="leading-relaxed">{sub}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>该资料未内嵌多级书签目录，您可以直接在下方指定起止页码范围或直接启动整卷扫描。</span>
                  </div>
                )}

                {/* 精确页码范围配置栏 */}
                <div className="mt-3 p-3 rounded-xl bg-cream-50 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-warm-800 flex items-center gap-1.5">
                      <BookmarkCheck className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span>指定扫描起止页码范围（可选）</span>
                    </div>
                    <p className="text-[11px] text-warm-500">
                      {selectedChapterPageSpan.startPage
                        ? `当前勾选章节对应原书第 ${selectedChapterPageSpan.startPage}~${selectedChapterPageSpan.endPage} 页；也可手动填写特定页码区间`
                        : '留空将按所选章节或从第 1 页起自动分片扫描原件'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={pageRangeInput}
                      disabled={extracting}
                      onChange={e => setPageRangeInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (e.nativeEvent.isComposing || (e as any).keyCode === 229) return
                          void handleStartDeepExtract()
                        }
                      }}
                      placeholder={
                        selectedChapterPageSpan.startPage
                          ? `例如 ${selectedChapterPageSpan.startPage}-${selectedChapterPageSpan.endPage}`
                          : '例如 1-35（留空扫所选范围）'
                      }
                      className="w-48 text-xs font-mono rounded-lg border border-cream-300 px-3 py-1.5 bg-white text-warm-900 focus:outline-none focus:border-cyan-500"
                    />
                    {pageRangeInput && !extracting && (
                      <button
                        type="button"
                        onClick={() => setPageRangeInput('')}
                        className="text-xs text-warm-400 hover:text-warm-700 cursor-pointer"
                      >
                        清空
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 真实后台分片扫描实时进度条 */}
              {extracting && (
                <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-cyan-900 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-600 shrink-0" />
                      <span>{scanTask?.stepMessage || extractProgressStep || '正在执行真实解析任务...'}</span>
                    </span>
                    {scanTask && (
                      <span className="font-mono font-bold text-cyan-700 shrink-0">
                        {scanTask.progress}% · 已提取 {scanTask.extractedQuestionsCount} 题
                      </span>
                    )}
                  </div>
                  {scanTask && (
                    <>
                      <progress value={Math.max(4, scanTask.progress)} max={100} className="sr-only">
                        {scanTask.progress}%
                      </progress>
                      <div
                        role="progressbar"
                        aria-valuenow={scanTask.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="书籍深度提取进度"
                        className="w-full h-2 rounded-full bg-cyan-100 overflow-hidden"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-300 rounded-full"
                          style={{ width: `${Math.max(4, scanTask.progress)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-cyan-800/80">
                        <span>
                          {scanTask.totalChunks > 0
                            ? `分片进度：${scanTask.currentChunk} / ${scanTask.totalChunks}${scanTask.currentPageRange ? `（当前页码 ${scanTask.currentPageRange}）` : ''}`
                            : '正在准备文档分片队列...'}
                        </span>
                        <span>每完成一片自动持久化入库</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          ) : (
            /* 3. 真实提取成果展示面板 */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-green-900">
                      资料深度拆解与题库提取已完成
                    </h4>
                    <p className="text-xs text-green-700 mt-0.5">
                      本次共生成 <b>{totalNotesGenerated} 篇知识库笔记</b>，并实际提取录入{' '}
                      <b>{deepResult.totalQuestionsCount} 道原书/试卷题目</b> 至做题中心。
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-green-800 bg-white/60 px-2.5 py-1 rounded-lg border border-green-500/20">
                    覆盖 {deepResult.chaptersCount} 个单元
                  </span>
                </div>
              </div>

              {scanSummaryWarning && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{scanSummaryWarning}</span>
                </div>
              )}

              {/* 结果切换 Tab */}
              <div className="flex flex-wrap items-center gap-2 border-b border-cream-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveResultTab('notes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeResultTab === 'notes'
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'text-warm-600 hover:bg-cream-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>生成的知识库笔记 ({totalNotesGenerated} 篇)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab('questions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeResultTab === 'questions'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-warm-600 hover:bg-cream-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>提取的真实试题 ({deepResult.totalQuestionsCount} 题)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab('outline')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeResultTab === 'outline'
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'text-warm-600 hover:bg-cream-100'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>原书章节大纲索引</span>
                </button>
              </div>

              {/* Tab 1: 知识库笔记列表与预览 */}
              {activeResultTab === 'notes' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="border border-cream-200 rounded-xl overflow-hidden bg-cream-50/50 flex flex-col max-h-80">
                    <div className="p-2.5 border-b border-cream-200 text-xs font-bold text-warm-700 bg-cream-100/50">
                      生成的笔记文件列表：
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                      {deepResult.indexNotePath && (
                        <button
                          type="button"
                          onClick={() => setSelectedNoteIndex(0)}
                          className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-start gap-2 cursor-pointer ${
                            selectedNoteIndex === 0
                              ? 'bg-cyan-500 text-white font-bold shadow-sm'
                              : 'hover:bg-cream-200 text-warm-800'
                          }`}
                        >
                          <Network className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate">{deepResult.indexNoteTitle}</div>
                            <div className={`text-2xs ${selectedNoteIndex === 0 ? 'text-cyan-100' : 'text-warm-400'}`}>
                              🌟 全书考点知识图谱总览
                            </div>
                          </div>
                        </button>
                      )}

                      {deepResult.notes.map((n, idx) => {
                        const noteIdx = deepResult.indexNotePath ? idx + 1 : idx
                        const isCurrent = selectedNoteIndex === noteIdx
                        return (
                          <button
                            key={n.path}
                            type="button"
                            onClick={() => setSelectedNoteIndex(noteIdx)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-start gap-2 cursor-pointer ${
                              isCurrent
                                ? 'bg-cyan-500 text-white font-bold shadow-sm'
                                : 'hover:bg-cream-200 text-warm-800'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate">{n.title}</div>
                              <div className={`text-2xs truncate ${isCurrent ? 'text-cyan-100' : 'text-warm-400'}`}>
                                {n.chapterTitle}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="md:col-span-2 border border-cream-200 rounded-xl p-4 bg-surface flex flex-col max-h-80 overflow-y-auto">
                    {renderSelectedNote()}
                  </div>
                </div>
              )}

              {/* Tab 2: 录入的真实试题池 */}
              {activeResultTab === 'questions' && (
                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {deepResult.questions.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-cream-50 border border-cream-200 text-xs text-warm-500 space-y-1.5">
                      <div>所选章节或页码区间内未检测到标准化习题（可能为纯概念讲义或扫描图片页）。</div>
                      {deepResult.totalQuestionsCount > 0 && (
                        <div className="text-emerald-700 font-semibold">
                          已有 {deepResult.totalQuestionsCount} 道题目直接写入后台题库，可前往做题中心查看。
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
                        <span>
                          已入库 <b>{deepResult.totalQuestionsCount} 道真实题目</b>（下方展示预览样本 {deepResult.questions.length} 题）。
                        </span>
                        <span className="font-mono font-bold text-amber-700">
                          存储：custom-questions.json
                        </span>
                      </div>

                      {deepResult.questions.map((q, idx) => {
                        const isMulti = isMultiChoiceQ(q)
                        const ansUpper = String(q.answer || '').trim().toUpperCase()
                        return (
                          <div
                            key={q.id || idx}
                            className="p-3.5 rounded-xl border border-cream-200 bg-surface space-y-2 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded font-bold text-2xs ${
                                    isMulti
                                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                      : 'bg-amber-500/10 text-amber-700'
                                  }`}
                                >
                                  第 {idx + 1} 题 ·{' '}
                                  {isMulti
                                    ? '【多选题】'
                                    : q.type === 'choice'
                                      ? '单选题'
                                      : q.type === 'blank'
                                        ? '填空题'
                                        : '分析/解答题'}{' '}
                                  ({q.difficulty || '中等'})
                                </span>
                                <span className="text-2xs font-semibold text-warm-600 bg-cream-100 px-2 py-0.5 rounded">
                                  {q.chapter || deepResult.subject}
                                </span>
                              </div>
                              <span className="text-2xs text-warm-400 font-mono">
                                来源: {deepResult.bookName}
                              </span>
                            </div>

                            {q.passage && (
                              <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedPassages(prev => ({ ...prev, [idx]: !prev[idx] }))
                                  }
                                  className="w-full px-2.5 py-1.5 flex items-center justify-between text-left text-2xs font-semibold text-indigo-700 cursor-pointer"
                                >
                                  <span>📖 关联阅读短文 / 分析材料</span>
                                  {expandedPassages[idx] ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                {expandedPassages[idx] && (
                                  <div className="px-3 py-2 border-t border-indigo-100 bg-white text-xs text-slate-700 max-h-44 overflow-y-auto leading-relaxed">
                                    <MarkdownRenderer content={String(q.passage)} />
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="font-semibold text-warm-900 leading-snug">
                              <MarkdownRenderer content={String(q.question || '')} />
                            </div>

                            {q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-1 text-2xs text-warm-700">
                                {Object.entries(q.options).map(([k, v]) => {
                                  const isOptCorrect = isMulti
                                    ? ansUpper.includes(k.toUpperCase())
                                    : ansUpper === k.toUpperCase()
                                  return (
                                    <div
                                      key={k}
                                      className={`flex items-start gap-1 p-1.5 rounded ${
                                        isOptCorrect
                                          ? 'text-green-800 font-bold bg-green-50 border border-green-200'
                                          : 'bg-cream-50/60'
                                      }`}
                                    >
                                      <span className="font-mono shrink-0">{k}.</span>
                                      <div className="min-w-0 flex-1">
                                        <MarkdownRenderer content={String(v)} inline />
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            <div className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/15 text-2xs text-green-900 leading-relaxed">
                              <b>【参考答案与解析】</b>: <span className="font-bold text-green-700">{q.answer}</span>
                              <div className="mt-1 text-green-800">
                                <MarkdownRenderer content={String(q.explanation || '')} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )}

              {/* Tab 3: 全书原始大纲索引 */}
              {activeResultTab === 'outline' && (
                <div className="max-h-80 overflow-y-auto p-4 rounded-xl bg-surface border border-cream-200 font-mono text-xs leading-relaxed text-warm-800 whitespace-pre-wrap">
                  {outlineData?.fullOutline || '暂无全书纯文本大纲'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="px-6 py-3.5 border-t border-cream-200 bg-cream-50/70 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-warm-500">
            {extracting && (
              <span className="flex items-center gap-2 text-cyan-700 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span className="truncate max-w-md">{scanTask?.stepMessage || extractProgressStep}</span>
              </span>
            )}
            {!extracting && !deepResult && (
              <span>
                按原书真实内容提取章节笔记与原题，支持指定页码区间精准分片扫描
              </span>
            )}
            {deepResult && (
              <span className="text-green-600 font-semibold">
                已同步保存至知识库与自定义题库！
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            {!deepResult ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    stopPolling()
                    onClose()
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-warm-600 hover:bg-cream-200 transition-colors cursor-pointer"
                >
                  {extracting ? '后台继续并关闭窗口' : '取消'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleStartDeepExtract()}
                  disabled={
                    extracting ||
                    loadingOutline ||
                    (!pageRangeInput.trim() && Boolean(outlineData?.chapters.length) && selectedChapterIds.length === 0)
                  }
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>正在真实扫描与入库...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {pageRangeInput.trim()
                          ? `开始指定页码深度提取 (${pageRangeInput.trim()})`
                          : outlineData && outlineData.chapters.length > 0
                            ? `开始真实深度提取 (${selectedChapterIds.length} 章)`
                            : '开始全卷深度提取'}
                      </span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-warm-600 hover:bg-cream-200 transition-colors cursor-pointer"
                >
                  完成并关闭
                </button>
                <a
                  href="/quiz"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>立即前往做题中心刷题</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
