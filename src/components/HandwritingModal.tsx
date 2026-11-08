import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  X,
  Check,
  RotateCcw,
  RotateCw,
  Trash2,
  Maximize2,
  Minimize2,
  PenTool,
  Highlighter,
  Eraser,
  Grid,
  Sparkles,
  Layers,
  Palette,
  Loader2,
} from 'lucide-react'
import { api, type AttachmentResult } from '../services/api'

interface Point {
  x: number
  y: number
  pressure: number
}

interface Stroke {
  points: Point[]
  color: string
  size: number
  tool: 'pen' | 'highlighter' | 'eraser'
}

interface HandwritingModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (attachment: AttachmentResult) => void
}

type BackgroundGrid = 'dots' | 'grid' | 'ruled' | 'blank'

const COLORS = [
  { label: '墨黑', value: '#1e293b' },
  { label: '深蓝', value: '#2563eb' },
  { label: '朱红', value: '#dc2626' },
  { label: '翡翠绿', value: '#16a34a' },
  { label: '琥珀橙', value: '#ea580c' },
  { label: '荧光黄', value: '#eab308' },
  { label: '紫罗兰', value: '#9333ea' },
  { label: '纯白', value: '#ffffff' },
]

const SIZES = [
  { label: '细', value: 2 },
  { label: '中', value: 4 },
  { label: '粗', value: 8 },
  { label: '特粗', value: 16 },
]

export default function HandwritingModal({
  isOpen,
  onClose,
  onInsert,
}: HandwritingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // 笔刷状态
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen')
  const [currentColor, setCurrentColor] = useState<string>('#1e293b')
  const [currentSize, setCurrentSize] = useState<number>(3)
  const [backgroundGrid, setBackgroundGrid] = useState<BackgroundGrid>('dots')
  const [keepBackgroundOnExport, setKeepBackgroundOnExport] = useState<boolean>(true)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // 历史笔迹记录（支持撤销/重做）
  const strokesRef = useRef<Stroke[]>([])
  const redoStackRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Stroke | null>(null)
  const isDrawingRef = useRef<boolean>(false)

  // 强制触发重渲染以更新撤销/重做按钮状态
  const [, setTick] = useState(0)
  const updateUi = () => setTick(t => t + 1)

  // 动态尺寸与高分屏 Retina 支持
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const width = Math.max(300, Math.floor(rect.width))
    const height = Math.max(260, Math.floor(rect.height))

    // 只有尺寸变化时才重置
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      redrawAll()
    }
  }, [backgroundGrid])

  useEffect(() => {
    if (isOpen) {
      // 延迟确保弹窗布局计算完成
      const timer = setTimeout(() => {
        resizeCanvas()
      }, 50)
      window.addEventListener('resize', resizeCanvas)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', resizeCanvas)
      }
    }
  }, [isOpen, resizeCanvas])

  // 绘制纸张背景网格
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => {
    ctx.save()
    ctx.fillStyle = '#fbfbf7' // 模拟真实护眼羊皮纸浅底
    ctx.fillRect(0, 0, width, height)

    if (backgroundGrid === 'dots') {
      ctx.fillStyle = '#cbd5e1'
      const step = 20 * dpr
      for (let x = step; x < width; x += step) {
        for (let y = step; y < height; y += step) {
          ctx.beginPath()
          ctx.arc(x, y, 1.2 * dpr, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (backgroundGrid === 'grid') {
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.65)'
      ctx.lineWidth = 1 * dpr
      const step = 24 * dpr
      ctx.beginPath()
      for (let x = step; x < width; x += step) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = step; y < height; y += step) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()
    } else if (backgroundGrid === 'ruled') {
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.8)'
      ctx.lineWidth = 1 * dpr
      const step = 28 * dpr
      ctx.beginPath()
      for (let y = step; y < height; y += step) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()
    }
    ctx.restore()
  }

  // 重绘所有笔迹
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawBackground(ctx, canvas.width, canvas.height, dpr)

    for (const stroke of strokesRef.current) {
      renderStroke(ctx, stroke, dpr)
    }

    if (currentStrokeRef.current) {
      renderStroke(ctx, currentStrokeRef.current, dpr)
    }
  }, [backgroundGrid])

  // 单个笔迹贝塞尔平滑渲染
  const renderStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke, dpr: number) => {
    const { points, color, size, tool } = stroke
    if (points.length === 0) return

    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'eraser') {
      ctx.strokeStyle = '#fbfbf7' // 擦除模式采用背景色保底
      ctx.lineWidth = size * 3 * dpr
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color
      ctx.globalAlpha = 0.35
      ctx.lineWidth = size * 3.5 * dpr
    } else {
      ctx.strokeStyle = color
      ctx.globalAlpha = 1.0
      ctx.lineWidth = size * dpr
    }

    if (points.length === 1) {
      const p = points[0]
      ctx.beginPath()
      const radius = Math.max(1, (ctx.lineWidth / 2) * (p.pressure || 1))
      ctx.arc(p.x * dpr, p.y * dpr, radius, 0, Math.PI * 2)
      ctx.fillStyle = ctx.strokeStyle
      ctx.fill()
      ctx.restore()
      return
    }

    // 中点二次贝塞尔平滑曲线
    ctx.beginPath()
    ctx.moveTo(points[0].x * dpr, points[0].y * dpr)

    for (let i = 1; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const midX = (current.x + next.x) / 2
      const midY = (current.y + next.y) / 2

      // 动态压感粗细微调
      if (tool === 'pen' && current.pressure > 0) {
        ctx.lineWidth = Math.max(1.5, size * dpr * (0.6 + current.pressure * 0.8))
      }

      ctx.quadraticCurveTo(current.x * dpr, current.y * dpr, midX * dpr, midY * dpr)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(midX * dpr, midY * dpr)
    }

    const last = points[points.length - 1]
    ctx.lineTo(last.x * dpr, last.y * dpr)
    ctx.stroke()
    ctx.restore()
  }

  // 获取 PointerEvent 相对坐标
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    }
  }

  // 指针事件处理（兼容平板智能笔与触屏手指）
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)

    isDrawingRef.current = true
    const pos = getPointerPos(e)
    const newStroke: Stroke = {
      points: [pos],
      color: currentColor,
      size: currentSize,
      tool: currentTool,
    }

    currentStrokeRef.current = newStroke
    redoStackRef.current = [] // 新笔画产生，清空重做栈
    redrawAll()
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return
    const pos = getPointerPos(e)
    currentStrokeRef.current.points.push(pos)
    redrawAll()
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    const canvas = canvasRef.current
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId)
    }

    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      strokesRef.current.push(currentStrokeRef.current)
      currentStrokeRef.current = null
      redrawAll()
      updateUi()
    }
  }

  // 撤销 / 重做
  const handleUndo = () => {
    if (strokesRef.current.length === 0) return
    const popped = strokesRef.current.pop()!
    redoStackRef.current.push(popped)
    redrawAll()
    updateUi()
  }

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return
    const popped = redoStackRef.current.pop()!
    strokesRef.current.push(popped)
    redrawAll()
    updateUi()
  }

  const handleClear = () => {
    if (strokesRef.current.length === 0) return
    if (window.confirm('确定要清空当前所有手写笔迹吗？')) {
      strokesRef.current = []
      redoStackRef.current = []
      redrawAll()
      updateUi()
    }
  }

  // 计算有效笔画的外接矩形并裁剪导出
  const exportHandwritingBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current
      if (!canvas || strokesRef.current.length === 0) {
        resolve(null)
        return
      }

      const dpr = window.devicePixelRatio || 1

      // 1. 查找所有笔画的极值点
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      for (const stroke of strokesRef.current) {
        const extra = stroke.size * 2
        for (const pt of stroke.points) {
          minX = Math.min(minX, pt.x - extra)
          minY = Math.min(minY, pt.y - extra)
          maxX = Math.max(maxX, pt.x + extra)
          maxY = Math.max(maxY, pt.y + extra)
        }
      }

      // 添加安全内边距
      const padding = 20
      minX = Math.max(0, Math.floor(minX - padding))
      minY = Math.max(0, Math.floor(minY - padding))
      maxX = Math.min(canvas.width / dpr, Math.ceil(maxX + padding))
      maxY = Math.min(canvas.height / dpr, Math.ceil(maxY + padding))

      const cropWidth = Math.max(80, Math.floor((maxX - minX) * dpr))
      const cropHeight = Math.max(60, Math.floor((maxY - minY) * dpr))

      // 2. 创建临时裁剪画布
      const cropCanvas = document.createElement('canvas')
      cropCanvas.width = cropWidth
      cropCanvas.height = cropHeight
      const cropCtx = cropCanvas.getContext('2d')

      if (!cropCtx) {
        resolve(null)
        return
      }

      // 3. 是否保留背景底纹
      if (keepBackgroundOnExport) {
        cropCtx.save()
        cropCtx.translate(-minX * dpr, -minY * dpr)
        drawBackground(cropCtx, canvas.width, canvas.height, dpr)
        cropCtx.restore()
      }

      // 4. 将源画布相应区域绘制到裁剪画布上
      cropCtx.drawImage(
        canvas,
        minX * dpr,
        minY * dpr,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      )

      cropCanvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png')
    })
  }

  // 提交并插入到笔记
  const handleSaveAndInsert = async () => {
    if (strokesRef.current.length === 0) {
      alert('请先书写或绘制草图后再插入！')
      return
    }

    try {
      setSaving(true)
      const blob = await exportHandwritingBlob()
      if (!blob) {
        alert('生成手写图像失败，请重试')
        return
      }

      const now = new Date()
      const timeStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
      const filename = `handwriting-${timeStr}.png`

      const result = await api.uploadAttachment(blob, 'handwriting', filename)
      onInsert(result)
      onClose()
    } catch (err: any) {
      alert(`插入失败：${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-5xl h-[88vh] max-h-[850px]'
        }`}
      >
        {/* 顶部标题与主要操作栏 */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-accent-orange font-bold">
              <PenTool className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                智能笔手写 / 演算白板
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-normal">
                  平板触屏压感适配
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                支持触控笔压感、平滑贝塞尔笔迹、数学推导与草图绘制，一键裁剪插入笔记
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 撤销 / 重做 */}
            <button
              onClick={handleUndo}
              disabled={strokesRef.current.length === 0}
              title="撤销 (Undo)"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStackRef.current.length === 0}
              title="重做 (Redo)"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-xs flex items-center gap-1"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              title="清空画板"
              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* 全屏切换 */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? '退出全屏' : '全屏手写'}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* 关闭 */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 笔刷与画板工具栏（专为平板触控优化的横排控制栏） */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs shrink-0">
          {/* 工具切换：钢笔 / 马克笔 / 橡皮擦 */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              onClick={() => setCurrentTool('pen')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                currentTool === 'pen'
                  ? 'bg-accent-orange text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>钢笔</span>
            </button>
            <button
              onClick={() => setCurrentTool('highlighter')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                currentTool === 'highlighter'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span>马克笔</span>
            </button>
            <button
              onClick={() => setCurrentTool('eraser')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                currentTool === 'eraser'
                  ? 'bg-slate-800 text-white dark:bg-slate-600 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>橡皮擦</span>
            </button>
          </div>

          {/* 颜色选择器 */}
          {currentTool !== 'eraser' && (
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCurrentColor(c.value)}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                  className={`w-5 h-5 rounded-full border transition-transform ${
                    currentColor === c.value
                      ? 'scale-125 ring-2 ring-accent-orange border-white shadow-xs'
                      : 'border-slate-300 dark:border-slate-600 hover:scale-110'
                  }`}
                />
              ))}
            </div>
          )}

          {/* 笔画粗细 */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setCurrentSize(s.value)}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                  currentSize === s.value
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* 底纹选择 */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
              <Grid className="w-3 h-3" />
              底纹:
            </span>
            {(['dots', 'grid', 'ruled', 'blank'] as BackgroundGrid[]).map((mode) => {
              const labelMap = { dots: '点阵', grid: '网格', ruled: '横线', blank: '纯白' }
              return (
                <button
                  key={mode}
                  onClick={() => setBackgroundGrid(mode)}
                  className={`px-1.5 py-0.5 rounded text-[11px] ${
                    backgroundGrid === mode
                      ? 'bg-orange-100 dark:bg-orange-950/40 text-accent-orange font-bold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {labelMap[mode]}
                </button>
              )
            })}
          </div>

          {/* 导出设置：保留底纹与完成插入按钮 */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepBackgroundOnExport}
                onChange={(e) => setKeepBackgroundOnExport(e.target.checked)}
                className="rounded text-accent-orange focus:ring-0"
              />
              保留稿纸底纹
            </label>

            <button
              onClick={handleSaveAndInsert}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent-orange hover:bg-orange-600 text-white font-bold shadow-md hover:shadow-lg transition-all text-xs disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>处理中...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>插入当前笔记</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 手写主画布容器（启用 touch-action: none 确保平板压感笔顺滑防浏览器滚动） */}
        <div
          ref={containerRef}
          className="relative flex-1 w-full h-full overflow-hidden bg-[#fbfbf7] cursor-crosshair"
          style={{ touchAction: 'none' }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="w-full h-full block"
          />

          {/* 提示浮层：没有笔画时显示轻量引导 */}
          {strokesRef.current.length === 0 && !isDrawingRef.current && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="text-center space-y-1">
                <PenTool className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-500">
                  在此处提笔书写公式、演算草图或答题推导
                </p>
                <p className="text-xs text-slate-400">
                  支持触控笔压感、双指防误触，完成后点击右上角“插入当前笔记”
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
