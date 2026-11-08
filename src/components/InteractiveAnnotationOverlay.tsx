import React, { useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  GripVertical,
  Minimize2,
  ChevronDown,
  X,
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

  // 移动端/窄屏设备识别
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 640 : false
  })

  // 极简折叠模式（折叠为边角微型药丸，彻底解决遮挡视野问题）
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  // 移动端调色盘弹出选择面板
  const [showColorPalette, setShowColorPalette] = useState<boolean>(false)

  // 书写状态（落笔书写时工具栏自动半透明避让视野，抬笔恢复）
  const [isWriting, setIsWriting] = useState<boolean>(false)

  // 浮动与拖拽控制胶囊栏状态
  const toolbarRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 100, y: 84 }
    const mobile = window.innerWidth < 640
    try {
      const saved = localStorage.getItem('interactive_annotation_toolbar_position')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          const safeX = Math.max(8, Math.min(window.innerWidth - (mobile ? 100 : 160), parsed.x))
          const safeY = Math.max(8, Math.min(window.innerHeight - 50, parsed.y))
          return { x: safeX, y: safeY }
        }
      }
    } catch {
      // 容错处理
    }
    // 默认位置：停靠于右下角安全区，彻底消除对编辑器右上角「预览」「写作」按钮与顶栏操作的遮挡
    if (mobile) {
      return {
        x: Math.max(8, window.innerWidth - 130),
        y: Math.max(60, window.innerHeight - 80),
      }
    }
    return {
      x: Math.max(16, window.innerWidth - 220),
      y: Math.max(60, window.innerHeight - 90),
    }
  })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)

  // 视窗大小变化时自适应安全边界与移动端状态
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640
      setIsMobile(mobile)

      setPosition(prev => {
        const barWidth = toolbarRef.current?.offsetWidth || (mobile ? 280 : 380)
        const barHeight = toolbarRef.current?.offsetHeight || 44
        const safeX = Math.max(8, Math.min(window.innerWidth - barWidth - 8, prev.x))
        const safeY = Math.max(8, Math.min(window.innerHeight - barHeight - 8, prev.y))
        if (safeX !== prev.x || safeY !== prev.y) {
          return { x: safeX, y: safeY }
        }
        return prev
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 展开批注工具栏时，若右侧超出屏幕边缘则平滑向左自适应收拢
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!toolbarRef.current) return
      const rect = toolbarRef.current.getBoundingClientRect()
      if (rect.right > window.innerWidth - 8) {
        setPosition(prev => ({
          x: Math.max(8, window.innerWidth - rect.width - 12),
          y: prev.y,
        }))
      }
    }, 40)
    return () => clearTimeout(timer)
  }, [isAnnotationActive, isCollapsed, showColorPalette])

  // 拖拽控制器
  const startDrag = (clientX: number, clientY: number) => {
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      originX: position.x,
      originY: position.y,
    }
    setIsDragging(true)

    const onPointerMove = (e: PointerEvent) => {
      if (!dragStartRef.current) return
      const dx = e.clientX - dragStartRef.current.startX
      const dy = e.clientY - dragStartRef.current.startY

      const barWidth = toolbarRef.current?.offsetWidth || 160
      const barHeight = toolbarRef.current?.offsetHeight || 44

      const newX = Math.max(6, Math.min(window.innerWidth - barWidth - 6, dragStartRef.current.originX + dx))
      const newY = Math.max(6, Math.min(window.innerHeight - barHeight - 6, dragStartRef.current.originY + dy))

      setPosition({ x: newX, y: newY })
    }

    const onPointerUp = () => {
      dragStartRef.current = null
      setIsDragging(false)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)

      setPosition(finalPos => {
        try {
          localStorage.setItem('interactive_annotation_toolbar_position', JSON.stringify(finalPos))
        } catch {
          // 容错处理
        }
        return finalPos
      })
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  // 双击手柄一键恢复默认位置
  const handleResetPosition = () => {
    const defaultPos = isMobile
      ? { x: Math.max(8, window.innerWidth - (toolbarRef.current?.offsetWidth || 180) - 12), y: Math.max(60, window.innerHeight - 80) }
      : { x: Math.max(16, window.innerWidth - (isAnnotationActive ? 440 : 180) - 16), y: Math.max(60, window.innerHeight - 90) }
    setPosition(defaultPos)
    try {
      localStorage.removeItem('interactive_annotation_toolbar_position')
    } catch {
      // 容错处理
    }
  }

  // 明确关闭批注模式（手机与桌面一键安全退出）
  const handleCloseAnnotation = () => {
    onToggleAnnotation(false)
    setShowColorPalette(false)
    setIsWriting(false)
  }

  const handleToolbarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    // 点击按钮或可交互组件时不触发拖动，保持按钮顺畅点击
    if (target.closest('button, input, select, textarea, [role="button"]')) {
      return
    }
    startDrag(e.clientX, e.clientY)
  }

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
    setIsWriting(true) // 书写时自动半透明，彻底避让视野

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
    setIsWriting(false) // 抬笔恢复透明度
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

      {/* 随心拖拽批注控制胶囊栏（彻底脱离笔记文档流，解决遮挡视野与移动端关闭困难问题） */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={toolbarRef}
            onPointerDown={handleToolbarPointerDown}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 9999,
              touchAction: 'none',
            }}
            className={`w-fit max-w-[98vw] flex items-center gap-1.5 px-2 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl text-xs select-none transition-[opacity,box-shadow] duration-200 ${
              isWriting ? 'opacity-20 pointer-events-none' : 'opacity-100'
            } ${isDragging ? 'shadow-2xl ring-2 ring-accent-orange/50 cursor-grabbing' : 'hover:shadow-2xl'}`}
          >
            {/* 拖动手柄 */}
            <div
              onPointerDown={(e) => {
                e.stopPropagation()
                startDrag(e.clientX, e.clientY)
              }}
              onDoubleClick={handleResetPosition}
              className="flex items-center justify-center p-1 -ml-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
              title="按住拖动位置 (双击恢复默认位置)"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* 状态 A：极简收缩模式（折叠为边角微型胶囊，彻底不挡视野） */}
            {isCollapsed ? (
              <div className="flex items-center gap-1.5">
                {isAnnotationActive ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsCollapsed(false)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/20 active:scale-95 transition-all touch-manipulation"
                      title="展开手写工具栏"
                    >
                      <PenTool className="w-3.5 h-3.5 animate-pulse" />
                      <span>展开工具</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseAnnotation}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold shadow-xs transition-all touch-manipulation"
                      title="完成并退出批注模式"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>完成</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCollapsed(false)
                      onToggleAnnotation(true)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-accent-orange hover:text-white text-slate-700 dark:text-slate-200 font-semibold transition-all touch-manipulation"
                    title="展开提笔批注"
                  >
                    <MousePointer className="w-3.5 h-3.5 text-accent-orange" />
                    <span>提笔批注</span>
                  </button>
                )}
              </div>
            ) : (
              /* 状态 B：完整操作栏 */
              <>
                {/* 模式总开关：未激活时显示提笔批注，激活时显示醒目的【✓ 完成】退出按钮 */}
                {!isAnnotationActive ? (
                  <button
                    type="button"
                    onClick={() => onToggleAnnotation(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-accent-orange hover:text-white transition-all shadow-xs touch-manipulation"
                    title="提笔在当前页面任意处就地批注"
                  >
                    <MousePointer className="w-4 h-4 text-accent-orange" />
                    <span>提笔批注</span>
                  </button>
                ) : (
                  /* 激活批注时：最左侧为高亮显眼的【✓ 完成批注】大按钮，手机端一眼即可看见并轻触退出！ */
                  <button
                    type="button"
                    onClick={handleCloseAnnotation}
                    className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm transition-all touch-manipulation shrink-0"
                    title="完成手写批注，立即退出并恢复打字与页面滚动"
                  >
                    <Check className="w-4 h-4" />
                    <span>完成退出</span>
                  </button>
                )}

                {/* 激活批注后的工具集 */}
                {isAnnotationActive && (
                  <>
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />

                    {/* 工具选择：钢笔 / 荧光高亮笔 / 橡皮擦 */}
                    <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setCurrentTool('pen')}
                        className={`p-1.5 rounded-lg transition-all touch-manipulation ${
                          currentTool === 'pen'
                            ? 'bg-white dark:bg-slate-900 text-accent-orange shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="钢笔 (就地手写推导与字迹批注)"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentTool('highlighter')}
                        className={`p-1.5 rounded-lg transition-all touch-manipulation ${
                          currentTool === 'highlighter'
                            ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="荧光高亮笔 (就地划讲义重点，透出文字)"
                      >
                        <Highlighter className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentTool('eraser')}
                        className={`p-1.5 rounded-lg transition-all touch-manipulation ${
                          currentTool === 'eraser'
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="橡皮擦"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 颜色与粗细：移动端采用紧凑下拉弹层，桌面端平铺 */}
                    {isMobile ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowColorPalette(!showColorPalette)}
                          className="flex items-center gap-1 px-1.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 touch-manipulation"
                          title="选择颜色与粗细"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: currentColor }}
                          />
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {/* 移动端调色浮层 */}
                        {showColorPalette && (
                          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2 z-50 animate-fade-in-down w-44">
                            <div className="text-[10px] font-semibold text-slate-400">批注颜色</div>
                            <div className="grid grid-cols-6 gap-1">
                              {COLORS.map(c => (
                                <button
                                  key={c.value}
                                  type="button"
                                  onClick={() => {
                                    setCurrentColor(c.value)
                                    setShowColorPalette(false)
                                  }}
                                  style={{ backgroundColor: c.value }}
                                  className={`w-6 h-6 rounded-full transition-transform touch-manipulation ${
                                    currentColor === c.value
                                      ? 'scale-110 ring-2 ring-accent-orange border-2 border-white'
                                      : 'opacity-85 hover:opacity-100'
                                  }`}
                                  title={c.label}
                                />
                              ))}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                              笔画粗细
                            </div>
                            <div className="flex gap-1">
                              {SIZES.map(s => (
                                <button
                                  key={s.value}
                                  type="button"
                                  onClick={() => {
                                    setCurrentSize(s.value)
                                    setShowColorPalette(false)
                                  }}
                                  className={`flex-1 py-1 rounded text-[11px] font-medium touch-manipulation ${
                                    currentSize === s.value
                                      ? 'bg-accent-orange text-white font-bold'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* 桌面端：平铺笔刷颜色 */}
                        {currentTool !== 'eraser' && (
                          <div className="flex items-center gap-1 px-1.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                            {COLORS.map(c => (
                              <button
                                key={c.value}
                                type="button"
                                onClick={() => setCurrentColor(c.value)}
                                style={{ backgroundColor: c.value }}
                                title={c.label}
                                className={`w-4 h-4 rounded-full transition-transform touch-manipulation ${
                                  currentColor === c.value
                                    ? 'scale-125 ring-2 ring-accent-orange border-2 border-white'
                                    : 'hover:scale-110 opacity-80 hover:opacity-100'
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* 桌面端：平铺笔画粗细 */}
                        <div className="flex items-center gap-0.5 px-1 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                          {SIZES.map(s => (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => setCurrentSize(s.value)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors touch-manipulation ${
                                currentSize === s.value
                                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-2xs'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* 撤销 / 重做 / 清屏 */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={strokesRef.current.length === 0}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none touch-manipulation"
                        title="撤销笔画"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      {!isMobile && (
                        <button
                          type="button"
                          onClick={handleRedo}
                          disabled={redoStackRef.current.length === 0}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none touch-manipulation"
                          title="重做笔画"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleClear}
                        disabled={strokesRef.current.length === 0}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-30 disabled:pointer-events-none touch-manipulation"
                        title="清除本页所有手写笔迹"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}

                {/* 笔迹显隐与保存状态 */}
                <div className="flex items-center gap-1 ml-0.5 pl-1 border-l border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setStrokesVisible(!strokesVisible)
                      setTimeout(redrawStrokes, 10)
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
                    title={strokesVisible ? '临时隐藏手写笔迹' : '显示手写笔迹'}
                  >
                    {strokesVisible ? (
                      <Eye className="w-3.5 h-3.5 text-accent-orange" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
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

                {/* 折叠最小化按钮（一键收缩为微型浮标，彻底不挡视野） */}
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation ml-0.5"
                  title="最小化收起工具栏 (彻底消除遮挡)"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                {/* 移动端常驻关闭小叉叉（额外退出快捷方式） */}
                {isAnnotationActive && (
                  <button
                    type="button"
                    onClick={handleCloseAnnotation}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors touch-manipulation"
                    title="退出批注模式"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>,
          document.body
        )}
    </>
  )
}
