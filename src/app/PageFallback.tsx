/**
 * 路由切换 / 懒加载占位：骨架屏代替单行提示，减少切页时的布局跳动与"闪一下"的廉价感。
 */
export default function PageFallback() {
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
      <span className="sr-only">正在加载研学空间...</span>
    </div>
  )
}
