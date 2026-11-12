import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'

interface LoadingStateProps {
  /** 加载中显示的文案 */
  label?: string
  /** 超过该毫秒数仍未完成时，提示加载较慢并给出重试入口 */
  slowAfterMs?: number
  /** 自定义重试；默认整页刷新 */
  onRetry?: () => void
  className?: string
}

/**
 * 统一的加载占位：转圈 + 文案；超时后显示「加载较慢」与重试按钮，
 * 避免用户面对一个永远转下去的 spinner 却不知道该做什么。
 */
export default function LoadingState({
  label = '正在加载…',
  slowAfterMs = 12000,
  onRetry,
  className = '',
}: LoadingStateProps) {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), slowAfterMs)
    return () => window.clearTimeout(t)
  }, [slowAfterMs])

  return (
    <div
      className={`flex flex-col items-center justify-center h-full gap-3 text-slate-500 dark:text-slate-400 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      <span className="text-xs font-medium">{slow ? '加载时间比平时长' : label}</span>
      {slow && (
        <button
          type="button"
          onClick={onRetry ?? (() => window.location.reload())}
          className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          重新加载
        </button>
      )}
    </div>
  )
}
