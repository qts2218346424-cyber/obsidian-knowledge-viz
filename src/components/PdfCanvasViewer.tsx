import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Bookmark,
  List,
  Loader2,
  AlertCircle,
  RotateCcw,
  LayoutGrid,
  FileText,
  Smartphone,
  Search,
  Copy,
  Check,
  Sparkles,
  X
} from 'lucide-react'

// 初始化 PDF.js Worker 路径：优先使用 Vite 模块化解析的 pdf.worker.min.mjs，回退兼容静态目录
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  }
}

export interface PdfCanvasViewerProps {
  url: string
  title?: string
  initialPage?: number
  className?: string
  onPageChange?: (page: number, total: number) => void
}

interface OutlineItem {
  title: string
  pageNumber: number
  items?: OutlineItem[]
}

interface DocSearchHit {
  page: number
  count: number
  snippet: string
}

/**
 * 将 PDF.js getTextContent() 提取的碎片化文本项智能重排为清晰易读的段落文本
 */
function extractCleanPageText(textContent: any): string {
  const items = Array.isArray(textContent?.items) ? textContent.items : []
  if (items.length === 0) return ''

  const chunks: string[] = []
  let lastY: number | null = null
  let lastEndChar = ''

  for (const rawItem of items) {
    if (!rawItem || typeof rawItem.str !== 'string') continue
    const str = rawItem.str
    const y = Array.isArray(rawItem.transform) ? Number(rawItem.transform[5]) : null

    if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
      chunks.push('\n')
      lastEndChar = '\n'
    } else if (
      str.length > 0 &&
      lastEndChar &&
      lastEndChar !== '\n' &&
      lastEndChar !== ' ' &&
      /[A-Za-z0-9]$/.test(lastEndChar) &&
      /^[A-Za-z0-9]/.test(str)
    ) {
      chunks.push(' ')
    }

    chunks.push(str)
    if (rawItem.hasEOL) {
      chunks.push('\n')
      lastEndChar = '\n'
    } else if (str.length > 0) {
      lastEndChar = str[str.length - 1]
    }

    if (y !== null && str.trim().length > 0) {
      lastY = y
    }
  }

  return chunks
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function PdfCanvasViewer({
  url,
  title,
  initialPage = 1,
  className = '',
  onPageChange,
}: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<any>(null)
  const pageTextCacheRef = useRef<Map<number, string>>(new Map())
  const textBodyRef = useRef<HTMLDivElement>(null)
  const searchAbortRef = useRef<boolean>(false)

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [scale, setScale] = useState<number>(1.0)
  const [fitMode, setFitMode] = useState<'width' | 'page' | 'custom'>('width')
  const [rotation, setRotation] = useState<number>(0)
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const [showOutline, setShowOutline] = useState<boolean>(false)

  const [loading, setLoading] = useState<boolean>(true)
  const [loadingProgress, setLoadingProgress] = useState<number>(0)
  const [loadedBytes, setLoadedBytes] = useState<number>(0)
  const [loadingElapsed, setLoadingElapsed] = useState<number>(0)
  const [rendering, setRendering] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [pageInput, setPageInput] = useState<string>(String(initialPage))

  // 当前页高清文字提取层、双栏伴读、页内搜词与复制反馈状态
  const [currentPageText, setCurrentPageText] = useState<string>('')
  const [extractingText, setExtractingText] = useState<boolean>(false)
  const [showTextDrawer, setShowTextDrawer] = useState<boolean>(false)
  const [selectedSnippet, setSelectedSnippet] = useState<string>('')
  const [copiedPage, setCopiedPage] = useState<boolean>(false)

  const [showSearchBar, setShowSearchBar] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchingDoc, setSearchingDoc] = useState<boolean>(false)
  const [docSearchHits, setDocSearchHits] = useState<DocSearchHit[]>([])
  const [searchedPagesCount, setSearchedPagesCount] = useState<number>(0)

  useEffect(() => {
    if (!loading) {
      setLoadingElapsed(0)
      return
    }
    const timer = setInterval(() => setLoadingElapsed(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [loading])

  // 1. 加载 PDF 文档
  useEffect(() => {
    let isCancelled = false
    searchAbortRef.current = true
    pageTextCacheRef.current.clear()
    setLoading(true)
    setErrorMsg('')
    setLoadingProgress(0)
    setLoadedBytes(0)
    setLoadingElapsed(0)
    setPdfDoc(null)
    setOutline([])
    setCurrentPageText('')
    setDocSearchHits([])
    setSearchedPagesCount(0)

    const loadingTask = pdfjsLib.getDocument({
      url,
      cMapUrl: '/cmaps/',
      cMapPacked: true,
      disableAutoFetch: true, // 禁止后台全量贪婪预取，仅按需拉取当前浏览页分片
      disableStream: false,
      rangeChunkSize: 65536,
      isEvalSupported: false,
    })

    loadingTask.onProgress = (progressData: { loaded: number; total: number }) => {
      if (progressData.loaded > 0) {
        setLoadedBytes(progressData.loaded)
      }
      if (progressData.total > 0) {
        const percent = Math.min(100, Math.round((progressData.loaded / progressData.total) * 100))
        setLoadingProgress(percent)
      }
    }

    loadingTask.promise
      .then(async doc => {
        if (isCancelled) return
        setPdfDoc(doc)
        setTotalPages(doc.numPages)
        setLoading(false)

        // 提取目录大纲（若存在）
        try {
          const rawOutline = await doc.getOutline()
          if (rawOutline && rawOutline.length > 0) {
            const parsedOutline = await Promise.all(
              rawOutline.map(async item => {
                let pageNumber = 1
                if (typeof item.dest === 'string') {
                  const dest = await doc.getDestination(item.dest)
                  if (dest && dest[0]) {
                    const pageIndex = await doc.getPageIndex(dest[0])
                    pageNumber = pageIndex + 1
                  }
                } else if (Array.isArray(item.dest) && item.dest[0]) {
                  const pageIndex = await doc.getPageIndex(item.dest[0])
                  pageNumber = pageIndex + 1
                }
                return {
                  title: item.title,
                  pageNumber,
                }
              })
            )
            setOutline(parsedOutline)
          }
        } catch {
          // 忽略目录提取非致命错误
        }
      })
      .catch(err => {
        if (isCancelled) return
        console.error('[PdfCanvasViewer Load Error]:', err)
        setErrorMsg(err.message || '加载 PDF 文档失败，请检查网络或文件权限')
        setLoading(false)
      })

    return () => {
      isCancelled = true
      searchAbortRef.current = true
      try {
        loadingTask.destroy()
      } catch {}
    }
  }, [url])

  // 2. 页面与缩放变更时，通知外部
  useEffect(() => {
    if (totalPages > 0) {
      onPageChange?.(currentPage, totalPages)
      setPageInput(String(currentPage))
      setSelectedSnippet('')
    }
  }, [currentPage, totalPages, onPageChange])

  // 3. 计算适合宽度的自适应缩放比
  const computeFitScale = useCallback(
    async (page: PDFPageProxy): Promise<number> => {
      const container = containerRef.current
      if (!container) return 1.0

      const unscaledViewport = page.getViewport({ scale: 1.0, rotation })
      const containerWidth = Math.max(180, container.clientWidth - (window.innerWidth < 768 ? 16 : 48))
      const containerHeight = Math.max(180, container.clientHeight - (window.innerWidth < 768 ? 16 : 48))

      if (fitMode === 'page') {
        const scaleW = containerWidth / unscaledViewport.width
        const scaleH = containerHeight / unscaledViewport.height
        return Math.min(scaleW, scaleH, 2.5)
      }

      const targetScale = containerWidth / unscaledViewport.width
      return Math.min(Math.max(targetScale, 0.4), 3.0)
    },
    [fitMode, rotation]
  )

  // 4. 执行渲染当前页至 Canvas + 同步提取当前页高清重排文本
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || currentPage < 1 || currentPage > pdfDoc.numPages) return
    const canvas = canvasRef.current
    if (!canvas) return

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel()
      } catch {}
    }

    setRendering(true)
    const targetPageNum = currentPage
    try {
      const page = await pdfDoc.getPage(targetPageNum)

      // 同步提取当前页文字内容（命中缓存则秒回）
      if (pageTextCacheRef.current.has(targetPageNum)) {
        setCurrentPageText(pageTextCacheRef.current.get(targetPageNum) || '')
        setExtractingText(false)
      } else {
        setExtractingText(true)
        page
          .getTextContent()
          .then(tc => {
            const cleaned = extractCleanPageText(tc)
            pageTextCacheRef.current.set(targetPageNum, cleaned)
            setCurrentPageText(prev => (targetPageNum === currentPage ? cleaned : prev))
          })
          .catch(() => {
            if (targetPageNum === currentPage) setCurrentPageText('')
          })
          .finally(() => {
            if (targetPageNum === currentPage) setExtractingText(false)
          })
      }

      let activeScale = scale
      if (fitMode === 'width' || fitMode === 'page') {
        activeScale = await computeFitScale(page)
      }

      const viewport = page.getViewport({ scale: activeScale, rotation })
      const dpr = window.devicePixelRatio || 1

      canvas.width = Math.floor(viewport.width * dpr)
      canvas.height = Math.floor(viewport.height * dpr)
      canvas.style.width = `${Math.floor(viewport.width)}px`
      canvas.style.height = `${Math.floor(viewport.height)}px`

      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) return

      ctx.save()
      ctx.scale(dpr, dpr)

      const renderContext = {
        canvasContext: ctx,
        viewport,
      }

      const task = page.render(renderContext)
      renderTaskRef.current = task

      await task.promise
      ctx.restore()
      setRendering(false)

      // 智能轻量预热相邻下一页
      if (targetPageNum < pdfDoc.numPages) {
        setTimeout(() => {
          pdfDoc.getPage(targetPageNum + 1).catch(() => {})
        }, 80)
      }
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('[PdfCanvasViewer Render Error]:', err)
      }
      setRendering(false)
    }
  }, [pdfDoc, currentPage, scale, fitMode, rotation, computeFitScale])

  useEffect(() => {
    renderCurrentPage()
  }, [renderCurrentPage])

  // 当双栏伴读抽屉或目录抽屉展开/收起时，触发自适应重绘让画布适配新宽度
  useEffect(() => {
    if (fitMode === 'custom') return
    const timer = setTimeout(() => {
      renderCurrentPage()
    }, 60)
    return () => clearTimeout(timer)
  }, [showTextDrawer, showOutline, fitMode, renderCurrentPage])

  // 监听容器尺寸变化自动重绘自适应宽度
  useEffect(() => {
    const container = containerRef.current
    if (!container || fitMode === 'custom') return

    let resizeTimer: any = null
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        renderCurrentPage()
      }, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [fitMode, renderCurrentPage])

  // 计算当前页关键词命中数与高亮片段
  const { currentPageMatchCount, highlightedNodes } = useMemo(() => {
    const q = searchQuery.trim()
    if (!currentPageText) {
      return { currentPageMatchCount: 0, highlightedNodes: null }
    }
    if (!q) {
      return { currentPageMatchCount: 0, highlightedNodes: currentPageText }
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped})`, 'gi')
    const parts = currentPageText.split(regex)
    let count = 0
    const nodes = parts.map((part, idx) => {
      if (part.toLowerCase() === q.toLowerCase()) {
        count++
        return (
          <mark
            key={idx}
            data-pdf-match={count === 1 ? 'first' : undefined}
            className="bg-amber-400 text-slate-950 font-bold px-0.5 rounded-xs shadow-xs"
          >
            {part}
          </mark>
        )
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>
    })

    return { currentPageMatchCount: count, highlightedNodes: nodes }
  }, [currentPageText, searchQuery])

  // 搜索词在当前页有命中且伴读抽屉打开时，自动滚动到首处高亮
  useEffect(() => {
    if (!showTextDrawer || currentPageMatchCount === 0 || !textBodyRef.current) return
    const firstMark = textBodyRef.current.querySelector('[data-pdf-match="first"]')
    if (firstMark && typeof firstMark.scrollIntoView === 'function') {
      firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [showTextDrawer, currentPageMatchCount, currentPage, searchQuery])

  // 执行跨页关键词搜索（优先读取已加载页缓存，并按需扫描全书）
  const handleRunDocumentSearch = useCallback(async () => {
    const q = searchQuery.trim()
    if (!pdfDoc || !q) {
      setDocSearchHits([])
      return
    }
    searchAbortRef.current = false
    setSearchingDoc(true)
    setDocSearchHits([])
    setSearchedPagesCount(0)
    if (!showTextDrawer) {
      setShowTextDrawer(true)
    }

    const lowerQ = q.toLowerCase()
    const hits: DocSearchHit[] = []
    const maxScanPages = Math.min(pdfDoc.numPages, 160)

    try {
      for (let p = 1; p <= maxScanPages; p++) {
        if (searchAbortRef.current) break
        let pageText = pageTextCacheRef.current.get(p)
        if (pageText === undefined) {
          try {
            const page = await pdfDoc.getPage(p)
            const tc = await page.getTextContent()
            pageText = extractCleanPageText(tc)
            pageTextCacheRef.current.set(p, pageText)
          } catch {
            pageText = ''
          }
        }
        setSearchedPagesCount(p)

        if (pageText) {
          const lowerText = pageText.toLowerCase()
          let idx = lowerText.indexOf(lowerQ)
          if (idx !== -1) {
            let matchCount = 0
            let pos = idx
            while (pos !== -1) {
              matchCount++
              pos = lowerText.indexOf(lowerQ, pos + lowerQ.length)
            }
            const start = Math.max(0, idx - 22)
            const end = Math.min(pageText.length, idx + q.length + 34)
            const snippet =
              (start > 0 ? '...' : '') +
              pageText.slice(start, end).replace(/\s+/g, ' ') +
              (end < pageText.length ? '...' : '')
            hits.push({ page: p, count: matchCount, snippet })
            setDocSearchHits([...hits])
          }
        }
      }
    } finally {
      setSearchingDoc(false)
    }
  }, [pdfDoc, searchQuery, showTextDrawer])

  // 复制本页文字
  const handleCopyCurrentPageText = useCallback(async () => {
    const textToCopy = currentPageText.trim()
    if (!textToCopy) {
      setShowTextDrawer(true)
      return
    }
    try {
      await navigator.clipboard.writeText(textToCopy)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = textToCopy
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiedPage(true)
    setTimeout(() => setCopiedPage(false), 2000)
  }, [currentPageText])

  // 一键唤起全局 AI 导师伴读精析本页（或选中片段）
  const handleAskAiForPage = useCallback(
    (customSnippet?: string) => {
      const targetSnippet = (customSnippet || '').trim()
      const contextBody = targetSnippet
        ? `【用户在第 ${currentPage} 页划选的重点片段】：\n${targetSnippet}\n\n【本页完整上下文参考】：\n${(currentPageText || '').slice(0, 4500)}`
        : `【第 ${currentPage} 页提取原文内容】：\n${(
            currentPageText ||
            '（当前页未检测到内嵌文字层，可能为纯图片扫描页或公式图表，请结合教材章节与页码辅助精析）'
          ).slice(0, 6000)}`

      const contextPrompt = [
        `【当前伴读 PDF 资料】：《${title || '考研核心教材/讲义'}》（第 ${currentPage} 页 / 共 ${totalPages || 1} 页）`,
        contextBody,
      ].join('\n\n')

      const defaultInput = targetSnippet
        ? '请帮我深度解析这段划选内容的推导逻辑、核心考点与易错陷阱'
        : '请帮我梳理这一页的核心考点并提取重点例题'

      window.dispatchEvent(
        new CustomEvent('open-ai-assistant', {
          detail: {
            contextPrompt,
            defaultInput,
            mode: 'followup',
          },
        })
      )
    },
    [currentPage, totalPages, currentPageText, title]
  )

  // 监听右侧文本面板划词选中状态
  const handleTextSelectionCheck = () => {
    if (typeof window === 'undefined') return
    const sel = window.getSelection()?.toString().trim() || ''
    setSelectedSnippet(sel.length >= 2 ? sel.slice(0, 1200) : '')
  }

  // 翻页与跳转逻辑
  const goToPage = (p: number) => {
    if (!pdfDoc) return
    const target = Math.max(1, Math.min(p, totalPages))
    setCurrentPage(target)
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevPage = () => goToPage(currentPage - 1)
  const handleNextPage = () => goToPage(currentPage + 1)

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = parseInt(pageInput, 10)
    if (!Number.isNaN(p)) {
      goToPage(p)
    } else {
      setPageInput(String(currentPage))
    }
  }

  const handleZoom = (delta: number) => {
    setFitMode('custom')
    setScale(prev => Math.min(Math.max(prev + delta, 0.4), 3.0))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  return (
    <div className={`flex flex-col h-full bg-slate-100 dark:bg-[#16181f] text-slate-800 dark:text-slate-200 select-none overflow-hidden relative ${className}`}>
      {/* 顶部现代化多端适配阅读与伴读控制栏 */}
      <div className="px-2.5 sm:px-4 py-2 bg-white dark:bg-[#1b1e28] border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0 z-20">
        {/* 左侧：目录抽屉与标题 */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {outline.length > 0 && (
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                showOutline
                  ? 'bg-indigo-50 dark:bg-cyan-500/20 text-indigo-700 dark:text-cyan-300 border-indigo-200 dark:border-cyan-500/40'
                  : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
              }`}
              title="大纲目录"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">大纲</span>
            </button>
          )}

          {title && (
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[220px] xl:max-w-xs" title={title}>
              {title}
            </span>
          )}
        </div>

        {/* 中间：翻页控制与页码指示 */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/90 dark:bg-black/30 px-2 sm:px-2.5 py-1 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="上一页"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.nativeEvent.isComposing || (e as any).keyCode === 229)) {
                  e.preventDefault()
                }
              }}
              onBlur={() => setPageInput(String(currentPage))}
              className="w-9 sm:w-11 text-center text-xs font-mono font-bold bg-white dark:bg-white/10 border border-slate-300 dark:border-white/15 focus:border-indigo-500 dark:focus:border-cyan-400 rounded-md py-0.5 outline-hidden text-slate-900 dark:text-white"
            />
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">/ {totalPages || '—'}</span>
          </form>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || loading}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="下一页"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 右侧：划词复制伴读抽屉 + 页内搜词 + 复制本页 + AI 精析 + 缩放旋转 */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          {/* 1. 本页文本 / 划词复制（双栏伴读开关） */}
          <button
            type="button"
            onClick={() => setShowTextDrawer(prev => !prev)}
            disabled={loading}
            className={`px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              showTextDrawer
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40 shadow-xs'
                : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10'
            }`}
            title="开启双栏伴读文本层，自由划词复制公式与题干"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden md:inline">📝 本页文本 / 划词复制</span>
            <span className="md:hidden">划词文本</span>
          </button>

          {/* 2. 页内搜词开关 */}
          <button
            type="button"
            onClick={() => {
              setShowSearchBar(prev => {
                const next = !prev
                if (next && !showTextDrawer) setShowTextDrawer(true)
                return next
              })
            }}
            disabled={loading}
            className={`px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              showSearchBar
                ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10'
            }`}
            title="在本页及已加载页面中搜索关键词并高亮定位"
          >
            <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden lg:inline">🔍 页内搜词</span>
          </button>

          {/* 3. 复制本页文字 */}
          <button
            type="button"
            onClick={handleCopyCurrentPageText}
            disabled={loading}
            className={`px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              copiedPage
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10'
            }`}
            title="一键复制当前页提取的全部文字"
          >
            {copiedPage ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span className="hidden lg:inline">{copiedPage ? '已复制本页' : '📋 复制本页文字'}</span>
          </button>

          {/* 4. AI 精析本页 */}
          <button
            type="button"
            onClick={() => handleAskAiForPage()}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-400/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            title="携带本页提取文本唤起全局 AI 导师伴读精析"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>🤖 AI 精析本页</span>
          </button>

          <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-white/10 mx-0.5" />

          <button
            type="button"
            onClick={() => handleZoom(-0.15)}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors hidden sm:flex cursor-pointer"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleZoom(0.15)}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors hidden sm:flex cursor-pointer"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setFitMode(prev => (prev === 'width' ? 'page' : 'width'))}
            disabled={loading}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl border text-xs font-medium transition-colors hidden md:flex items-center gap-1 cursor-pointer ${
              fitMode === 'width'
                ? 'bg-indigo-50 dark:bg-cyan-500/15 text-indigo-700 dark:text-cyan-300 border-indigo-200 dark:border-cyan-500/30'
                : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
            }`}
            title={fitMode === 'width' ? '切换为适应整页' : '切换为适应页面宽度'}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{fitMode === 'width' ? '自适应宽' : '适合整页'}</span>
          </button>

          <button
            type="button"
            onClick={handleRotate}
            disabled={loading}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors hidden sm:flex cursor-pointer"
            title="顺时针旋转 90 度"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 页内与跨页关键词检索浮动工具条 */}
      {showSearchBar && (
        <div className="px-3 sm:px-5 py-2 bg-slate-50 dark:bg-[#1e2230] border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2 z-20 animate-in fade-in duration-150">
          <div className="relative flex-1 min-w-[200px] max-w-md flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (e.nativeEvent.isComposing || (e as any).keyCode === 229) return
                  void handleRunDocumentSearch()
                }
              }}
              placeholder="输入关键词高亮本页，按回车检索全书页码..."
              autoFocus
              className="w-full pl-8 pr-7 py-1 text-xs rounded-lg bg-white dark:bg-black/35 border border-slate-300 dark:border-white/15 focus:border-indigo-500 dark:focus:border-amber-400 text-slate-900 dark:text-white placeholder-slate-400 outline-hidden select-text"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  searchAbortRef.current = true
                  setSearchQuery('')
                  setDocSearchHits([])
                }}
                className="absolute right-2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                title="清空搜索词"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => void handleRunDocumentSearch()}
            disabled={!searchQuery.trim() || searchingDoc}
            className="px-3 py-1 rounded-lg bg-indigo-600 dark:bg-amber-500 hover:bg-indigo-500 dark:hover:bg-amber-400 disabled:opacity-40 text-white dark:text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            {searchingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{searchingDoc ? `扫描中 (${searchedPagesCount}/${totalPages})` : '全书检索定位'}</span>
          </button>

          {searchQuery.trim() && (
            <span className="text-xs text-indigo-700 dark:text-amber-300 font-medium">
              本页命中 <strong>{currentPageMatchCount}</strong> 处
              {docSearchHits.length > 0 && ` · 全书命中 ${docSearchHits.length} 页`}
            </span>
          )}

          {/* 命中页码快捷跳转胶囊流 */}
          {docSearchHits.length > 0 && (
            <div className="w-full flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">点击跳转命中页：</span>
              {docSearchHits.map(hit => (
                <button
                  key={hit.page}
                  type="button"
                  onClick={() => {
                    goToPage(hit.page)
                    if (!showTextDrawer) setShowTextDrawer(true)
                  }}
                  title={hit.snippet}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 transition-colors cursor-pointer border ${
                    currentPage === hit.page
                      ? 'bg-indigo-600 dark:bg-amber-400 text-white dark:text-slate-950 border-indigo-600 dark:border-amber-300 font-bold'
                      : 'bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-700 dark:text-amber-200 border-slate-200 dark:border-white/10'
                  }`}
                >
                  P.{hit.page} ({hit.count})
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSearchBar(false)}
            className="ml-auto p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/10 cursor-pointer"
            title="收起搜索栏"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 主视口工作区（左侧目录 + 中间 Canvas 画布 + 右侧双栏可划词复制文本抽屉） */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 左侧可折叠目录抽屉 */}
        {showOutline && outline.length > 0 && (
          <div className="w-64 sm:w-72 bg-white dark:bg-[#191c26] border-r border-slate-200 dark:border-white/10 p-3 overflow-y-auto space-y-1 shrink-0 z-10 animate-in slide-in-from-left duration-200">
            <div className="text-xs font-bold text-indigo-700 dark:text-cyan-400 mb-2 flex items-center gap-1.5 px-2">
              <Bookmark className="w-3.5 h-3.5" />
              文档目录大纲索引
            </div>
            {outline.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  goToPage(item.pageNumber)
                  if (window.innerWidth < 768) setShowOutline(false)
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                  currentPage === item.pageNumber
                    ? 'bg-indigo-50 dark:bg-cyan-500/20 text-indigo-700 dark:text-cyan-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="truncate">{item.title}</span>
                <span className="text-[10px] font-mono opacity-60 shrink-0">P.{item.pageNumber}</span>
              </button>
            ))}
          </div>
        )}

        {/* PDF 画布视口区域 */}
        <div
          ref={containerRef}
          className="flex-1 h-full overflow-auto bg-slate-200/70 dark:bg-[#12141a] flex items-start justify-center p-2 sm:p-5 relative"
        >
          {loading && (() => {
            const displayPct = loadingProgress > 0
              ? loadingProgress
              : Math.min(92, 12 + loadingElapsed * 3)
            const loadedMB = (loadedBytes / (1024 * 1024)).toFixed(2)
            const stepIdx = loadingElapsed < 3 ? 0 : loadingProgress < 80 && loadingElapsed < 15 ? 1 : 2
            const stepText =
              stepIdx === 0
                ? '第 1/3 步：正在连接讲义资料库...'
                : stepIdx === 1
                  ? `第 2/3 步：正在按页拉取讲义内容${loadedBytes > 0 ? `（已接收 ${loadedMB} MB）` : ''}...`
                  : `第 3/3 步：正在解析目录大纲与生成清晰页面（已用时 ${loadingElapsed} 秒）...`
            return (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-100/85 dark:bg-[#13151c]/85 p-4 backdrop-blur-xs">
                <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4 text-slate-700 dark:text-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Loader2 className="w-5 h-5 text-indigo-600 dark:text-cyan-400 animate-spin shrink-0" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">正在装载 PDF 讲义</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-700 dark:text-cyan-300 shrink-0">{displayPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${displayPct}%` }}
                    />
                  </div>
                  <div className="text-xs text-indigo-700 dark:text-cyan-300 font-medium">{stepText}</div>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-white/10">
                    <span className={stepIdx === 0 ? 'text-indigo-700 dark:text-cyan-300 font-semibold' : 'text-emerald-600 dark:text-emerald-400'}>① 连接资料库</span>
                    <span className={stepIdx === 1 ? 'text-indigo-700 dark:text-cyan-300 font-semibold' : stepIdx > 1 ? 'text-emerald-600 dark:text-emerald-400' : ''}>② 按页加载</span>
                    <span className={stepIdx >= 2 ? 'text-indigo-700 dark:text-cyan-300 font-semibold' : ''}>③ 渲染首屏</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-xl">
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span>已启用按页加载模式，大文件无需下载整本即可先看首屏</span>
                  </div>
                </div>
              </div>
            )
          })()}

          {errorMsg && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#13151c] text-slate-700 dark:text-slate-300 p-6 text-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">讲义文档加载受阻</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">{errorMsg}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-xl bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  重新加载
                </button>
              </div>
            </div>
          )}

          {/* 核心高保真 Canvas 渲染容器 */}
          <div className="relative inline-block my-auto shadow-[0_8px_30px_rgba(15,23,42,0.14)] dark:shadow-[0_12px_45px_rgba(0,0,0,0.85)] border border-slate-300/80 dark:border-white/10 rounded-sm overflow-hidden bg-white">
            <canvas ref={canvasRef} className="block" />
            {rendering && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 dark:bg-black/60 backdrop-blur-xs rounded-md text-[10px] text-indigo-700 dark:text-cyan-300 flex items-center gap-1 border border-slate-200 dark:border-white/10 shadow-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>渲染中</span>
              </div>
            )}
          </div>
        </div>

        {/* 右侧双栏伴读：本页高清文字提取与自由划词复制抽屉 */}
        {showTextDrawer && (
          <div className="absolute inset-y-0 right-0 w-full sm:w-96 lg:static lg:w-[390px] xl:w-[440px] bg-white dark:bg-[#191d28] border-l border-slate-200 dark:border-white/10 flex flex-col shrink-0 z-25 shadow-2xl lg:shadow-none select-text">
            <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1e2330] flex items-center justify-between gap-2 select-none">
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>第 {currentPage} 页 · 清晰重排文本层</span>
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                  支持鼠标自由划词复制题干/公式，或选中片段直接追问 AI
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyCurrentPageText}
                  disabled={!currentPageText.trim()}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 border border-slate-200 dark:border-transparent disabled:opacity-40 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                  title="复制整页文本"
                >
                  {copiedPage ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPage ? '已复制' : '复制'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowTextDrawer(false)}
                  className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/10 cursor-pointer"
                  title="关闭本页文本伴读栏"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 划词选中快捷追问 AI 工具条 */}
            {selectedSnippet && (
              <div className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/80 border-b border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between gap-2 select-none animate-in fade-in">
                <span className="text-[11px] text-indigo-800 dark:text-indigo-200 truncate">
                  已划选 {selectedSnippet.length} 字：「{selectedSnippet.slice(0, 28)}...」
                </span>
                <button
                  type="button"
                  onClick={() => handleAskAiForPage(selectedSnippet)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white text-[11px] font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>问 AI 选中处</span>
                </button>
              </div>
            )}

            {/* 正文自由划词复制区 */}
            <div
              ref={textBodyRef}
              onMouseUp={handleTextSelectionCheck}
              onKeyUp={handleTextSelectionCheck}
              className="flex-1 overflow-y-auto p-4 select-text cursor-text"
            >
              {extractingText ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-cyan-400" />
                  <span>正在提取第 {currentPage} 页内嵌文字层...</span>
                </div>
              ) : currentPageText ? (
                <div className="text-[13px] leading-[1.85] text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words font-sans selection:bg-emerald-500/25 dark:selection:bg-cyan-500/35">
                  {highlightedNodes}
                </div>
              ) : (
                <div className="py-10 px-3 text-center space-y-2.5 text-xs text-slate-500 dark:text-slate-400 select-none">
                  <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                  <div className="font-semibold text-slate-800 dark:text-slate-200">当前页未检测到内嵌可复制文字层</div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                    该页可能为纯图片扫描件或封面插图。您仍可点击顶部「🤖 AI 精析本页」结合章节上下文伴读，或使用题库导入中心的「📸 截图 OCR 识题」提取公式。
                  </p>
                </div>
              )}
            </div>

            <div className="px-3.5 py-2 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161922] flex items-center justify-between gap-2 select-none">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                共提取 {currentPageText.length} 字符
              </span>
              <button
                type="button"
                onClick={() => handleAskAiForPage()}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>AI 提炼本页考点与例题</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
