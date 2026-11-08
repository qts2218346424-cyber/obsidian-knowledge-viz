import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  PenTool,
  Highlighter,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  MousePointer,
  Check,
  Palette,
  Eye,
  EyeOff,
  CloudCheck,
  Loader2,
} from 'lucide-react'
import { api, type HandwritingStroke, type HandwritingPoint } from '../services/api'

interface InteractiveAnnotationOverlayProps {
  notePath?: string
  contentContainerRef: React.RefObject<HTMLDivElement | null>
  isAnnotationActive: boolean
  onToggleAnnotation: (active: boolean) => void
}

const COLORS = [
  { label: '墨黑', value: '#1e293b' },
  { label: '批注红', value: '#dc2626' },
  { label: '荧光黄', value: '#eab308' },
  { label: '重点蓝', value: '#2563eb' },
  { label: '笔记绿', value: '#16a34a' },
  { label: '强调紫', value: '#9333ea' },
]

const SIZES = [
  { label: '细', value: 2 },
  { label: '中', value: 3.5 },
  { label: '粗', value: 7 },
]

export default function InteractiveAnnotationOverlay({
  notePath,
  contentContainerRef,
  isAnnotationActive,
  onToggleAnnotation,
}: InteractiveAnnotationOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // 笔刷设置
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen')
  const [currentColor, setCurrentColor] = useState<string>('#dc2626') // 默认讲义批注红色
  const [currentSize, setCurrentSize] = useState<number>(3)
  const [strokesVisible, setStrokesVisible] = useState<boolean>(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // 笔迹数据
  const strokesRef = useRef<HandwritingStroke[]>([])
  const redoStackRef = useRef<HandwritingStroke[]>([])
  const currentStrokeRef = useRef<HandwritingStroke | null>(null)
  const isDrawingRef = useRef<boolean>(false)
  const saveTimerRef = useRef<number | null>(null)

  // 强制刷新状态（用于撤销/重做按钮可用性）
  const [, setTick] = useState(0)
  const forceUpdate = () => setTick(t => t + 1)

  // 1. 同步画布尺寸与文档真实内容尺寸 (scrollHeight / scrollWidth)
  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current
    const container = contentContainerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const width = Math.max(300, container.scrollWidth, container.clientWidth)
    const height = Math.max(400, container.scrollHeight, container.clientHeight)

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      redrawStrokes()
    }
  }, [contentContainerRef])

  // 监听容器大小和变动
  useEffect(() => {
    syncCanvasSize()

    const container = contentContainerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      syncCanvasSize()
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [contentContainerRef, syncCanvasSize])

  // 2. 加载当前笔记的笔迹图层
  useEffect(() => {
    if (!notePath) {
      strokesRef.current = []
      redoStackRef.current = []
      redrawStrokes()
      return
    }

    let isMounted = true
    api.getStrokes(notePath)
      .then(res => {
        if (!isMounted) return
        strokesRef.current = res.strokes || []
        redoStackRef.current = []
        redrawStrokes()
        forceUpdate()
      })
      .catch(() => {
        if (!isMounted) return
        strokesRef.current = []
        redoStackRef.current = []
        redrawStrokes()
      })

    return () => {
      isMounted = false
    }
  }, [notePath])

  // 3. 自动持久化笔迹（防抖保存）
  const scheduleSave = useCallback(() => {
    if (!notePath) return
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
    }

    setSaveStatus('saving')
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        await api.saveStrokes(notePath, strokesRef.current)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (err) {
        console.warn('保存笔迹失败:', err)
        setSaveStatus('idle')
      }
    }, 800)
  }, [notePath])

  // 4. 重绘所有手写笔迹
  const redrawStrokes = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!strokesVisible) return

    for (const stroke of strokesRef.current) {
      drawSingleStroke(ctx, stroke, dpr)
    }

    if (currentStrokeRef.current) {
      drawSingleStroke(ctx, currentStrokeRef.current, dpr)
    }
  }, [strokesVisible])

  // 单条贝塞尔平滑笔画绘制
  const drawSingleStroke = (ctx: CanvasRenderingContext2D, stroke: HandwritingStroke, dpr: number) => {
    const { points, color, size, tool } = stroke
    if (!points || points.length === 0) return

    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = size * 4 * dpr
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.globalAlpha = 0.38 // 半透明荧光笔，高亮透出底层文字
      ctx.lineWidth = size * 3.8 * dpr
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.globalAlpha = 0.95
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

    // 二次贝塞尔曲线平滑处理
    ctx.beginPath()
    ctx.moveTo(points[0].x * dpr, points[0].y * dpr)

    for (let i = 1; i < points.length - 1; i++) {
      const curr = points[i]
      const next = points[i + 1]
      const midX = (curr.x + next.x) / 2
      const midY = (curr.y + next.y) / 2

      if (tool === 'pen' && curr.pressure && curr.pressure > 0) {
        ctx.lineWidth = Math.max(1.5, size * dpr * (0.6 + curr.pressure * 0.8))
      }

      ctx.quadraticCurveTo(curr.x * dpr, curr.y * dpr, midX * dpr, midY * dpr)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(midX * dpr, midY * dpr)
    }

    const last = points[points.length - 1]
    ctx.lineTo(last.x * dpr, last.y * dpr)
    ctx.stroke()
    ctx.restore()
  }

  // 5. 坐标获取：相对容器的内容真实绝对坐标
  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>): HandwritingPoint => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    }
  }

  // 6. 指针书写事件处理
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isAnnotationActive) return
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.setPointerCapture(e.pointerId)
    isDrawingRef.current = true

    const pos = getCanvasPos(e)
    const newStroke: HandwritingStroke = {
      points: [pos],
      color: currentColor,
      size: currentSize,
      tool: currentTool,
    }

    currentStrokeRef.current = newStroke
    redoStackRef.current = []
    redrawStrokes()
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return
    const pos = getCanvasPos(e)
    currentStrokeRef.current.points.push(pos)
    redrawStrokes()
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
      redrawStrokes()
      forceUpdate()
      scheduleSave()
    }
  }

  // 7. 撤销 / 重做 / 清屏
  const handleUndo = () => {
    if (strokesRef.current.length === 0) return
    const popped = strokesRef.current.pop()!
    redoStackRef.current.push(popped)
    redrawStrokes()
    forceUpdate()
    scheduleSave()
  }

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return
    const popped = redoStackRef.current.pop()!
    strokesRef.current.push(popped)
    redrawStrokes()
    forceUpdate()
    scheduleSave()
  }

  const handleClear = () => {
    if (strokesRef.current.length === 0) return
    if (window.confirm('确定要清除本篇笔记的所有手写批注吗？')) {
      strokesRef.current = []
      redoStackRef.current = []
      redrawStrokes()
      forceUpdate()
      scheduleSave()
    }
  }

  return (
    <>
      {/* 随页透明手写画布 (定位覆盖于内容区上方) */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          touchAction: isAnnotationActive ? 'none' : 'auto',
          pointerEvents: isAnnotationActive ? 'auto' : 'none',
          zIndex: 15,
        }}
        className={`w-full h-full block ${isAnnotationActive ? 'cursor-crosshair' : 'cursor-auto'}`}
      />

      {/* 吸顶/悬浮批注控制胶囊栏 (GoodNotes 级随页笔控栏) */}
      <div className="sticky top-2 z-30 mx-auto w-fit max-w-[94%] flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl text-xs select-none transition-all animate-fade-in-down">
        {/* 模式总开关：光标编辑/滑动 ⇄ 就地手写批注 */}
        <button
          onClick={() => onToggleAnnotation(!isAnnotationActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs ${
            isAnnotationActive
              ? 'bg-gradient-to-r from-accent-orange to-amber-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
          title={isAnnotationActive ? '切换为打字与滚动模式' : '提笔在当前页面任意处就地批注'}
        >
          {isAnnotationActive ? (
            <>
              <PenTool className="w-4 h-4 animate-bounce" />
              <span>就地手写中</span>
            </>
          ) : (
            <>
              <MousePointer className="w-4 h-4 text-slate-500" />
              <span>提笔批注</span>
            </>
          )}
        </button>

        {isAnnotationActive && (
          <>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

            {/* 工具选择：钢笔 / 荧光高亮笔 / 橡皮擦 */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setCurrentTool('pen')}
                className={`p-1.5 rounded-lg transition-all ${
                  currentTool === 'pen'
                    ? 'bg-white dark:bg-slate-900 text-accent-orange shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="钢笔 (就地手写推导与字迹批注)"
              >
                <PenTool className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentTool('highlighter')}
                className={`p-1.5 rounded-lg transition-all ${
                  currentTool === 'highlighter'
                    ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="荧光高亮笔 (就地划讲义重点，透出文字)"
              >
                <Highlighter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentTool('eraser')}
                className={`p-1.5 rounded-lg transition-all ${
                  currentTool === 'eraser'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="橡皮擦"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 笔刷颜色 */}
            {currentTool !== 'eraser' && (
              <div className="flex items-center gap-1 px-1.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCurrentColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      currentColor === c.value
                        ? 'scale-125 ring-2 ring-accent-orange border-2 border-white'
                        : 'hover:scale-110 opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* 笔画粗细 */}
            <div className="flex items-center gap-0.5 px-1 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              {SIZES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setCurrentSize(s.value)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    currentSize === s.value
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* 撤销 / 重做 */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={strokesRef.current.length === 0}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none"
                title="撤销笔画"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStackRef.current.length === 0}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none"
                title="重做笔画"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClear}
                disabled={strokesRef.current.length === 0}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-30 disabled:pointer-events-none"
                title="清除本页所有手写笔迹"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* 笔迹显隐与保存状态 */}
        <div className="flex items-center gap-1.5 ml-1 pl-1 border-l border-slate-200 dark:border-slate-700">
          <button
            onClick={() => {
              setStrokesVisible(!strokesVisible)
              setTimeout(redrawStrokes, 10)
            }}
            className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
            title={strokesVisible ? '临时隐藏手写笔迹' : '显示手写笔迹'}
          >
            {strokesVisible ? <Eye className="w-3.5 h-3.5 text-accent-orange" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-[10px] text-amber-500 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">同步中</span>
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-500">
              <Check className="w-3 h-3" />
              <span className="hidden sm:inline">已存</span>
            </span>
          )}
        </div>
      </div>
    </>
  )
}
