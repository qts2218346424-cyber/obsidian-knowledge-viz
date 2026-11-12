import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  Bookmark,
  List,
  Loader2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  LayoutGrid,
  FileText,
  Smartphone
} from 'lucide-react'

// 初始化 PDF.js Worker 路径，优先本地静态文件，保证内网与离线环境 100% 稳定
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
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
  const [rendering, setRendering] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [pageInput, setPageInput] = useState<string>(String(initialPage))

  // 1. 加载 PDF 文档
  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setErrorMsg('')
    setLoadingProgress(0)
    setPdfDoc(null)
    setOutline([])

    const loadingTask = pdfjsLib.getDocument({
      url,
      cMapUrl: '/cmaps/',
      cMapPacked: true,
      disableAutoFetch: true, // 核心优化：禁止后台全量贪婪预取，仅按需拉取当前浏览页的分片
      disableStream: false, // 启用浏览器分片流式管道
      rangeChunkSize: 65536, // 64KB 标准分片尺寸，毫秒级按需拉取
      isEvalSupported: false,
    })

    loadingTask.onProgress = (progressData: { loaded: number; total: number }) => {
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
    }
  }, [currentPage, totalPages, onPageChange])

  // 3. 计算适合宽度的自适应缩放比
  const computeFitScale = useCallback(
    async (page: PDFPageProxy): Promise<number> => {
      const container = containerRef.current
      if (!container) return 1.0

      const unscaledViewport = page.getViewport({ scale: 1.0, rotation })
      const containerWidth = container.clientWidth - (window.innerWidth < 768 ? 16 : 48)
      const containerHeight = container.clientHeight - (window.innerWidth < 768 ? 16 : 48)

      if (fitMode === 'page') {
        const scaleW = containerWidth / unscaledViewport.width
        const scaleH = containerHeight / unscaledViewport.height
        return Math.min(scaleW, scaleH, 2.5)
      }

      // 默认 'width' 自适应容器宽度
      const targetScale = containerWidth / unscaledViewport.width
      // 限制缩放区间，移动端屏幕较窄时确保清晰可读
      return Math.min(Math.max(targetScale, 0.4), 3.0)
    },
    [fitMode, rotation]
  )

  // 4. 执行渲染当前页至 Canvas
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
    try {
      const page = await pdfDoc.getPage(currentPage)

      let activeScale = scale
      if (fitMode === 'width' || fitMode === 'page') {
        activeScale = await computeFitScale(page)
      }

      const viewport = page.getViewport({ scale: activeScale, rotation })
      const dpr = window.devicePixelRatio || 1

      // 提升 Canvas 物理分辨率，防止高清视网膜屏幕与手机端公式文字模糊
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

      // 智能轻量预热相邻下一页，确保点击下一页秒切，且绝不贪婪预取全书
      if (currentPage < pdfDoc.numPages) {
        setTimeout(() => {
          pdfDoc.getPage(currentPage + 1).catch(() => {})
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

  // 监听容器尺寸变化（如旋转屏幕、窗口缩放）自动重绘自适应宽度
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
    <div className={`flex flex-col h-full bg-[#16181f] text-slate-200 select-none overflow-hidden relative ${className}`}>
      {/* 顶部现代化多端适配阅读控制栏 */}
      <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-[#1b1e28] border-b border-white/10 flex items-center justify-between gap-2 shrink-0 z-20">
        {/* 左侧：目录抽屉与快速信息 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {outline.length > 0 && (
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className={`p-1.5 sm:p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                showOutline
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
              title="大纲目录"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">大纲</span>
            </button>
          )}

          {title && (
            <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-md" title={title}>
              {title}
            </span>
          )}
        </div>

        {/* 中间：翻页控制与页码指示 */}
        <div className="flex items-center gap-1 sm:gap-2 bg-black/30 px-2 sm:px-3 py-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="上一页"
          >
            <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <input
              type="text"
              value={pageInput}
              onChange={e => setPageInput(e.target.value)}
              onBlur={() => setPageInput(String(currentPage))}
              className="w-9 sm:w-12 text-center text-xs font-mono font-bold bg-white/10 border border-white/15 focus:border-cyan-400 rounded-md py-0.5 outline-hidden text-white"
            />
            <span className="text-xs font-mono text-slate-400">/ {totalPages || '—'}</span>
          </form>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || loading}
            className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="下一页"
          >
            <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>

        {/* 右侧：缩放与视口适应控制 */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => handleZoom(-0.15)}
            disabled={loading}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors hidden xs:flex cursor-pointer"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleZoom(0.15)}
            disabled={loading}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors hidden xs:flex cursor-pointer"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setFitMode(prev => (prev === 'width' ? 'page' : 'width'))}
            disabled={loading}
            className={`p-1.5 sm:p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              fitMode === 'width'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
            title={fitMode === 'width' ? '切换为适应整页' : '切换为适应页面宽度'}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{fitMode === 'width' ? '自适应宽' : '适合整页'}</span>
          </button>

          <button
            type="button"
            onClick={handleRotate}
            disabled={loading}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors hidden sm:flex cursor-pointer"
            title="顺时针旋转 90 度"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 主视口工作区 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 左侧可折叠目录抽屉 */}
        {showOutline && outline.length > 0 && (
          <div className="w-64 sm:w-72 bg-[#191c26] border-r border-white/10 p-3 overflow-y-auto space-y-1 shrink-0 z-10 animate-in slide-in-from-left duration-200">
            <div className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-1.5 px-2">
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
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
          className="flex-1 h-full overflow-auto bg-[#12141a] flex items-start justify-center p-2 sm:p-5 relative"
        >
          {loading && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#13151c]/90 text-slate-300 gap-3 backdrop-blur-xs">
              <Loader2 className="w-9 h-9 text-cyan-400 animate-spin" />
              <div className="text-sm font-semibold tracking-wide">
                正在通过纯前端 Canvas 引擎装载 PDF 讲义...
              </div>
              {loadingProgress > 0 && (
                <div className="w-56 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-200"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              )}
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                全平台 Canvas 动态光栅化渲染 · 完美支持手机与各端电脑
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#13151c] text-slate-300 p-6 text-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">讲义文档加载受阻</h3>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">{errorMsg}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  重新加载
                </button>
              </div>
            </div>
          )}

          {/* 核心高保真 Canvas 渲染容器 */}
          <div className="relative inline-block my-auto shadow-[0_12px_45px_rgba(0,0,0,0.85)] border border-white/10 rounded-sm overflow-hidden bg-white">
            <canvas ref={canvasRef} className="block" />
            {rendering && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-xs rounded-md text-[10px] text-cyan-300 flex items-center gap-1 border border-white/10">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>渲染中</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
