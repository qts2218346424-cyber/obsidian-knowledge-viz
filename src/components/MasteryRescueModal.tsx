import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Play, BookOpen, X, Flame } from 'lucide-react'
import type { MasteryPoint } from '../data/masteryData'

interface MasteryRescueModalProps {
  isOpen: boolean
  onClose: () => void
  point: MasteryPoint | null
  onOpenCourseware?: (coursewareId: string) => void
  onPractice?: (point: MasteryPoint) => void
  onOpenNote?: (path: string) => void
}

export default function MasteryRescueModal({
  isOpen,
  onClose,
  point,
  onOpenCourseware,
  onPractice,
  onOpenNote,
}: MasteryRescueModalProps) {
  if (!isOpen || !point) return null

  const isCritical = point.rate < 50
  const isModerate = point.rate >= 50 && point.rate < 80
  const isMastered = point.rate >= 80

  const statusBadge = isCritical ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 animate-pulse">
      <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
      高危薄弱考点 (极易失分)
    </span>
  ) : isModerate ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
      <span className="w-2 h-2 rounded-full bg-amber-500" />
      进阶巩固考点 (尚存漏洞)
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      稳固攻克考点 (状态优秀)
    </span>
  )

  const themeGradient = isCritical
    ? 'from-rose-500/10 via-rose-50/50 to-orange-50/40 border-rose-200'
    : isModerate
    ? 'from-amber-500/10 via-amber-50/50 to-yellow-50/40 border-amber-200'
    : 'from-emerald-500/10 via-emerald-50/50 to-teal-50/40 border-emerald-200'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-xl rounded-2xl bg-white border ${themeGradient} shadow-2xl overflow-hidden flex flex-col max-h-[88dvh]`}>
        {/* 顶部 Banner 状态条 */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isCritical ? 'bg-gradient-to-r from-rose-50 via-white to-rose-50/30 border-rose-100' :
          isModerate ? 'bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border-amber-100' :
          'bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 border-emerald-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
              isCritical ? 'bg-rose-500 text-white' :
              isModerate ? 'bg-amber-500 text-white' :
              'bg-emerald-600 text-white'
            }`}>
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
                  MASTERY DIAGNOSIS
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-slate-600">{point.subject}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {point.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {statusBadge}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="关闭诊断舱"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 诊断内容滚动区 */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* 掌握度仪表盘卡片 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-500">考点掌握指数</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-3xl font-extrabold font-mono tracking-tight ${
                  isCritical ? 'text-rose-600' : isModerate ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {point.rate}%
                </span>
                <span className="text-xs font-medium text-slate-500">
                  ({point.recentStatus})
                </span>
              </div>
            </div>

            {/* 掌握度分级柱条 */}
            <div className="w-36 flex flex-col gap-1">
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 ${
                    isCritical ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(8, point.rate)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>薄弱 (0%)</span>
                <span>稳固 (100%)</span>
              </div>
            </div>
          </div>

          {/* AI 考点病灶诊断与真题丢分剖析 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <ShieldAlert className={`w-4 h-4 ${isCritical ? 'text-rose-500' : 'text-amber-500'}`} />
              <span>考研阅卷病灶诊断与失分诱因</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150">
              {point.weakReason}
            </p>
          </div>

          {/* 提分急救方案动作卡片 */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>提分急救直通车 (针对性专项突破)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 急救动作 1：看动态仿真课件 */}
              <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-3.5 flex flex-col justify-between hover:border-indigo-300 transition-all shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                      动作一 · 算法/原理具象化
                    </span>
                    <Play className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">
                    {point.coursewareId ? '动态仿真实验室单步推演' : '知识拓扑交互推演'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    通过交互式仿真视窗单步运行，实时观测指针跳变、状态机迁移与内存结构。
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (point.coursewareId && onOpenCourseware) {
                      onOpenCourseware(point.coursewareId)
                    } else if (onOpenCourseware) {
                      onOpenCourseware('cw-avl-tree')
                    }
                  }}
                  className="mt-3 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>立即启动仿真课件</span>
                </button>
              </div>

              {/* 急救动作 2：靶向刷 3 道同类真题 */}
              <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50/70 to-white p-3.5 flex flex-col justify-between hover:border-rose-300 transition-all shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                      动作二 · 真实考场踩分实战
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">
                    锁定该考点 3 道经典真题
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    直通做题中心，自动聚焦【{point.practiceKeyword}】真题靶向特训，做完即刻消除薄弱标红。
                  </p>
                </div>
                <button
                  onClick={() => onPractice && onPractice(point)}
                  className="mt-3 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>刷 3 道同类考题 →</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 底部辅助操作条 */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            提示：完成专项刷题并答对后，图谱节点将自动由红转黄、由黄变绿。
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors"
          >
            返回图谱
          </button>
        </div>
      </div>
    </div>
  )
}
