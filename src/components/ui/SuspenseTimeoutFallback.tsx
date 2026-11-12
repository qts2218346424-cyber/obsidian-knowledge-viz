import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'

interface SuspenseTimeoutFallbackProps {
  label?: string
  timeoutMs?: number
  className?: string
  onRetry?: () => void
}

/**
 * 带 15 秒超时保护的加载占位组件：
 * 超时后自动提示并提供「重试」按钮，避免页面长期卡在「准备中 / 正在装载...」。
 */
export default function SuspenseTimeoutFallback({
  label = '准备中…',
  timeoutMs = 15000,
  className = 'py-12',
  onRetry,
}: SuspenseTimeoutFallbackProps) {
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    setTimedOut(false)
    const timer = window.setTimeout(() => setTimedOut(true), timeoutMs)
    return () => window.clearTimeout(timer)
  }, [timeoutMs])

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-center px-4 ${className}`}>
      {!timedOut ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="text-xs text-slate-400 font-medium">{label}</span>
        </>
      ) : (
        <>
          <span className="text-xs text-amber-600 font-semibold">
            加载超时（超过 {Math.round(timeoutMs / 1000)} 秒），请检查网络或重试
          </span>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重试</span>
          </button>
        </>
      )}
    </div>
  )
}
