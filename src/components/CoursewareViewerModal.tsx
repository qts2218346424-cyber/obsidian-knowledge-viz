import { useState } from 'react'
import {
  X, Code2, Target, Maximize2, Minimize2, CheckCircle, Info
} from 'lucide-react'
import type { InteractiveCoursewareItem } from '../data/interactiveCourseware'

interface CoursewareViewerModalProps {
  isOpen: boolean
  onClose: () => void
  item: InteractiveCoursewareItem | null
  onPractice?: (item: InteractiveCoursewareItem) => void
}

export default function CoursewareViewerModal({
  isOpen,
  onClose,
  item,
  onPractice,
}: CoursewareViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!isOpen || !item) return null

  const srcUrl = item.rawPath ? `/api/books/raw?path=${encodeURIComponent(item.rawPath)}` : undefined

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`bg-[#121622] border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[92vh]'
      }`}>
        {/* Header Bar */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between gap-4 bg-white/[0.03]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                  {item.domain === 'cs_408' ? '408 计算机' : '考研数学'} · {item.subject}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {item.difficulty}
                </span>
                <span className="text-xs text-slate-400 truncate hidden md:inline">
                  交互仿真课件
                </span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5 truncate max-w-xl">
                {item.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onPractice && (
              <button
                onClick={() => onPractice(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 text-xs font-semibold transition-all active:scale-95"
              >
                <Target className="w-3.5 h-3.5" />
                随堂真题测试
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              title={isFullscreen ? '退出全屏' : '全屏模式'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Split between iframe simulation and learning points */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 h-full bg-[#0a0d14] relative">
            {srcUrl ? (
              <iframe
                src={srcUrl}
                title={item.title}
                className="w-full h-full border-0"
              />
            ) : item.embedHtml ? (
              <iframe
                srcDoc={item.embedHtml}
                title={item.title}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                课件内容加载失败
              </div>
            )}
          </div>

          {/* Right sidebar: Key takeaways & pointers */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-white/[0.02] p-5 overflow-y-auto space-y-4 shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <Info className="w-4 h-4" />
              课件要点与考研精讲
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {item.summary}
            </p>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-[11px] font-bold text-slate-400 uppercase">核心研学收获</div>
              {item.learningPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="text-[11px] text-slate-400 mb-2">掌握度自测：</div>
              <button
                onClick={() => onPractice?.(item)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Target className="w-4 h-4" />
                即刻检验直观理解 (3道随堂题)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
