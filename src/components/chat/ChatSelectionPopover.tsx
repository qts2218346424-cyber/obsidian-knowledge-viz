import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Target, Lightbulb, AlertTriangle, Layers } from 'lucide-react'

interface ChatSelectionPopoverProps {
  containerRef: React.RefObject<HTMLElement | null>
  isStreaming?: boolean
  onQuoteFollowUp: (selectedText: string) => void
  onExplainVividly: (selectedText: string) => void
  onAnalyzePitfall: (selectedText: string) => void
  onCreateFlashcardFromSelection: (selectedText: string) => void
}

interface PopoverPos {
  top: number
  left: number
  text: string
}

/**
 * 伴学对话流「划词即追问」浮动微工具条
 * 当用户在导师解析中划选任意不懂的步骤、公式或概念（2~320字）时，
 * 自动在选区正上方浮现靶向追问、直观举例、易错辨析与一键制卡按钮。
 */
export default function ChatSelectionPopover({
  containerRef,
  isStreaming = false,
  onQuoteFollowUp,
  onExplainVividly,
  onAnalyzePitfall,
  onCreateFlashcardFromSelection,
}: ChatSelectionPopoverProps) {
  const [pos, setPos] = useState<PopoverPos | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const clearPopover = useCallback(() => {
    setPos(null)
  }, [])

  const updateSelection = useCallback(() => {
    if (isStreaming) {
      setPos(null)
      return
    }
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setPos(null)
      return
    }

    const rawText = sel.toString().trim()
    if (rawText.length < 2 || rawText.length > 360) {
      setPos(null)
      return
    }

    const container = containerRef.current
    const anchorNode = sel.anchorNode
    const focusNode = sel.focusNode
    if (!container || !anchorNode || !focusNode) {
      setPos(null)
      return
    }

    // 仅在聊天消息容器内部划词时激活，且排除输入框/按钮内部
    if (!container.contains(anchorNode) || !container.contains(focusNode)) {
      setPos(null)
      return
    }
    const parentEl = anchorNode instanceof HTMLElement ? anchorNode : anchorNode.parentElement
    if (parentEl?.closest('textarea, input, button')) {
      setPos(null)
      return
    }

    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      setPos(null)
      return
    }

    const vw = window.innerWidth
    const halfWidth = 168
    const clampedLeft = Math.max(halfWidth + 12, Math.min(vw - halfWidth - 12, rect.left + rect.width / 2))
    const targetTop = rect.top > 64 ? rect.top - 46 : rect.bottom + 10

    setPos({
      top: targetTop,
      left: clampedLeft,
      text: rawText,
    })
  }, [containerRef, isStreaming])

  useEffect(() => {
    const handleMouseUp = () => {
      // 延迟一帧等待浏览器完成选区收敛
      requestAnimationFrame(updateSelection)
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
        return
      }
      setPos(null)
    }

    const container = containerRef.current
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)
    container?.addEventListener('scroll', clearPopover, { passive: true })

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
      container?.removeEventListener('scroll', clearPopover)
    }
  }, [containerRef, updateSelection, clearPopover])

  if (!pos) return null

  const runAndClear = (fn: (t: string) => void) => {
    const text = pos.text
    window.getSelection()?.removeAllRanges()
    setPos(null)
    fn(text)
  }

  const node = (
    <div
      ref={popoverRef}
      style={{
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={e => e.preventDefault()}
      className="fixed z-50 inline-flex items-center gap-0.5 p-1 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-md animate-fade-in-up select-none"
    >
      <button
        type="button"
        onClick={() => runAndClear(onQuoteFollowUp)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-semibold text-amber-300 hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
        title="引用此片段进入追问模式，针对性深挖卡壳细节"
      >
        <Target className="w-3 h-3" />
        <span>引用追问</span>
      </button>

      <span className="w-px h-3.5 bg-white/15" />

      <button
        type="button"
        onClick={() => runAndClear(onExplainVividly)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-medium text-sky-200 hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
        title="让导师用直观比喻或最简算例解释这段内容"
      >
        <Lightbulb className="w-3 h-3" />
        <span>举例秒懂</span>
      </button>

      <button
        type="button"
        onClick={() => runAndClear(onAnalyzePitfall)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-medium text-rose-200 hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
        title="剖析这个概念在真题中最容易踩的命题陷阱"
      >
        <AlertTriangle className="w-3 h-3" />
        <span>易错辨析</span>
      </button>

      <span className="w-px h-3.5 bg-white/15" />

      <button
        type="button"
        onClick={() => runAndClear(onCreateFlashcardFromSelection)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-medium text-emerald-300 hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
        title="将选中内容一键提炼为艾宾浩斯记忆闪卡"
      >
        <Layers className="w-3 h-3" />
        <span>制闪卡</span>
      </button>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node
}
