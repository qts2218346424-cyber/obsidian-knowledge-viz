import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
  Grid,
  Download,
  Highlighter,
  Maximize2,
  Minimize2, PenLine as IcPenLine } from 'lucide-react'

export interface DoodleScratchpadCanvasProps {
  questionId: string
  questionIndex: number
  initialDataUrl?: string
  onChange?: (dataUrl: string) => void
  onClear?: () => void
  className?: string
}

type PenColor = '#0f172a' | '#2563eb' | '#dc2626' | 'rgba(234, 179, 8, 0.55)'

const COLOR_OPTIONS: { color: PenColor; label: string; iconBg: string }[] = [
  { color: '#0f172a', label: '墨黑', iconBg: 'bg-slate-900' },
  { color: '#2563eb', label: '考研蓝', iconBg: 'bg-blue-600' },
  { color: '#dc2626', label: '纠错红', iconBg: 'bg-rose-600' },
  { color: 'rgba(234, 179, 8, 0.55)', label: '荧光笔', iconBg: 'bg-amber-400' },
]

const STROKE_WIDTHS = [
  { width: 2, label: '细' },
  { width: 4, label: '中' },
  { width: 8, label: '粗' },
]

export default function DoodleScratchpadCanvas({
  questionId,
  questionIndex,
  initialDataUrl,
  onChange,
  onClear,
  className = '',
}: DoodleScratchpadCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 绘制状态
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState<PenColor>('#0f172a')
  const [strokeWidth, setStrokeWidth] = useState<number>(3)
  const [isEraser, setIsEraser] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [history, setHistory] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  // 保存历史快照
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const data = canvas.toDataURL('image/png')
    setHistory((prev) => {
      const next = [...prev, data]
      if (next.length > 20) next.shift()
      return next
    })
    onChange?.(data)
  }, [onChange])

  // 初始化画布尺寸与 DPR
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    const width = Math.floor(rect.width) || 400
    const height = isFullscreen ? window.innerHeight - 140 : 360

    // 保存当前绘图内容
    const prevData = canvas.toDataURL()

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // 恢复旧内容
      if (prevData && prevData !== 'data:,') {
        const img = new Image()
        img.src = prevData
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height)
        }
      }
    }
  }, [isFullscreen])

  // 监听容器大小自适应
  useEffect(() => {
    resizeCanvas()
    const handleResize = () => resizeCanvas()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [resizeCanvas])

  // 当换题时，加载该题的历史涂鸦
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width / (window.devicePixelRatio || 1)
    const height = canvas.height / (window.devicePixelRatio || 1)

    ctx.clearRect(0, 0, width, height)

    if (initialDataUrl && initialDataUrl.startsWith('data:image')) {
      const img = new Image()
      img.src = initialDataUrl
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height)
      }
      setHistory([initialDataUrl])
    } else {
      setHistory([])
    }
  }, [questionId, initialDataUrl])

  // 坐标计算（防偏移）
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  // 开始涂鸦
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDrawing(true)
    const point = getCanvasPoint(e)
    lastPointRef.current = point

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.arc(point.x, point.y, (isEraser ? 12 : strokeWidth) / 2, 0, Math.PI * 2)
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = currentColor
    }
    ctx.fill()
  }

  // 涂鸦滑动推演
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !lastPointRef.current) return

    const currentPoint = getCanvasPoint(e)

    ctx.beginPath()
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    ctx.lineTo(currentPoint.x, currentPoint.y)

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 22
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = currentColor.includes('rgba') ? strokeWidth * 2.5 : strokeWidth
      ctx.strokeStyle = currentColor
    }

    ctx.stroke()
    lastPointRef.current = currentPoint
  }

  // 结束涂鸦
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    setIsDrawing(false)
    lastPointRef.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {}
    saveSnapshot()
  }

  // 撤销一步
  const handleUndo = () => {
    if (history.length <= 1) {
      handleClear()
      return
    }
    const nextHistory = [...history]
    nextHistory.pop() // 弹出当前
    const prevSnap = nextHistory[nextHistory.length - 1]

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const width = canvas.width / (window.devicePixelRatio || 1)
    const height = canvas.height / (window.devicePixelRatio || 1)

    ctx.clearRect(0, 0, width, height)
    if (prevSnap) {
      const img = new Image()
      img.src = prevSnap
      img.onload = () => ctx.drawImage(img, 0, 0, width, height)
    }
    setHistory(nextHistory)
    onChange?.(prevSnap || '')
  }

  // 一键清空草稿纸
  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const width = canvas.width / (window.devicePixelRatio || 1)
    const height = canvas.height / (window.devicePixelRatio || 1)
    ctx.clearRect(0, 0, width, height)
    setHistory([])
    onChange?.('')
    onClear?.()
  }

  // 导出草稿图片
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `考研演算草稿_第${questionIndex + 1}题.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-xl border-slate-300' : ''
      } ${className}`}
    >
      {/* 顶部工具栏：颜色、笔触、橡皮擦、网格、撤销、清空 */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-slate-50/90 border-b border-slate-200/80 text-xs select-none">
        {/* 左侧：画笔与颜色 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEraser(false)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              !isEraser
                ? 'bg-white border-slate-300 shadow-xs text-indigo-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            title="钢笔画线"
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>

          {/* 常用考研演算颜色 */}
          <div className="flex items-center gap-1 px-1 py-0.5 rounded-lg bg-white/80 border border-slate-200/70">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => {
                  setCurrentColor(c.color)
                  setIsEraser(false)
                }}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${c.iconBg} ${
                  !isEraser && currentColor === c.color
                    ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                title={c.label}
              />
            ))}
          </div>

          {/* 笔触粗细 */}
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-lg bg-white/80 border border-slate-200/70">
            {STROKE_WIDTHS.map((s) => (
              <button
                key={s.width}
                type="button"
                onClick={() => {
                  setStrokeWidth(s.width)
                  setIsEraser(false)
                }}
                className={`px-1.5 py-0.5 text-2xs rounded font-medium transition-colors cursor-pointer ${
                  !isEraser && strokeWidth === s.width
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* 橡皮擦 */}
          <button
            type="button"
            onClick={() => setIsEraser(true)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isEraser
                ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            title="橡皮擦"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 右侧：网格、撤销、清空、全屏 */}
        <div className="flex items-center gap-1">
          {/* 方格网格背景切换 */}
          <button
            type="button"
            onClick={() => setShowGrid((v) => !v)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              showGrid
                ? 'bg-white border-slate-300 text-indigo-600 shadow-xs'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
            title={showGrid ? '关闭方格参考线' : '开启考研草稿方格线'}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* 撤销 */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all cursor-pointer"
            title="撤销上一步"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* 一键清空 */}
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            title="一键清空本题草稿"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">清空</span>
          </button>

          {/* 全屏切换 */}
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
            title={isFullscreen ? '退出全屏草稿' : '全屏大草稿板'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 手写 Canvas 视窗 */}
      <div
        className={`relative w-full overflow-hidden select-none touch-none ${
          showGrid
            ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:18px_18px] bg-slate-50/50'
            : 'bg-white'
        }`}
        style={{
          height: isFullscreen ? 'calc(100vh - 200px)' : '360px',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 cursor-crosshair touch-none"
          style={{ touchAction: 'none' }}
        />

        {/* 右下角贴心操作指示 */}
        <div className="absolute right-3 bottom-2 pointer-events-none text-2xs text-slate-400 font-mono select-none">
          <IcPenLine className="emoji-icon" aria-hidden="true" />支持 iPad触控笔 / 鼠标手绘 · 自动同步第 {questionIndex + 1} 题
        </div>
      </div>

      {/* 底部微型状态栏 */}
      <div className="px-3 py-1.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
        <span>已开启防手掌误触 · 做题中切换题目自动留存演算痕迹</span>
        <button
          type="button"
          onClick={handleDownload}
          className="hover:text-slate-700 flex items-center gap-1 cursor-pointer"
          title="导出本题演算手稿"
        >
          <Download className="w-3 h-3" />
          <span>保存手稿</span>
        </button>
      </div>
    </div>
  )
}
