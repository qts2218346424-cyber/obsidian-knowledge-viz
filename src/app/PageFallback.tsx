/**
 * 路由切换 / 懒加载占位：骨架屏代替单行提示，减少切页时的布局跳动与"闪一下"的廉价感。
 */
import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function PageFallback() {
  // 超过 12 秒仍未加载完成：给出明确提示和重试入口，而不是无限骨架屏
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setSlow(true), 12000)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8" role="status" aria-live="polite" aria-label="正在加载">
      <div className="space-y-4 animate-pulse">
        <div className="h-7 w-48 rounded-lg bg-slate-200/80 dark:bg-slate-700/60" />
        <div className="h-4 w-80 max-w-full rounded-md bg-slate-200/60 dark:bg-slate-700/40" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
        <div className="h-64 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50" />
      </div>
      {slow && (
        <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>加载时间比平时长，可能是网络较慢</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重新加载
          </button>
        </div>
      )}
      <span className="sr-only">正在加载…</span>
    </div>
  )
}
