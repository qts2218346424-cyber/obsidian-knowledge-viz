import { createPortal } from 'react-dom'
import { useState, useMemo } from 'react'
import {
  X, BookOpen, Clock, Target, CheckCircle2,
  List, Sparkles, Edit3
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'
import type { HandoutItem } from '../data/handoutsData'

interface HandoutReaderModalProps {
  isOpen: boolean
  onClose: () => void
  handout: HandoutItem | null
  onPractice: (handout: HandoutItem) => void
  onAskAI: (handout: HandoutItem) => void
}

export default function HandoutReaderModal({
  isOpen,
  onClose,
  handout,
  onPractice,
  onAskAI,
}: HandoutReaderModalProps) {
  const [showToc, setShowToc] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024)
  const [isMastered, setIsMastered] = useState(false)

  // Parse Table of Contents from markdown headings
  const toc = useMemo(() => {
    if (!handout?.content) return []
    const lines = handout.content.split('\n')
    const items: { level: number; text: string; id: string }[] = []
    for (const line of lines) {
      const match = line.match(/^(#{1,3})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim().replace(/\*\*/g, '').replace(/`/g, '')
        const id = 'heading-' + encodeURIComponent(text)
        items.push({ level, text, id })
      }
    }
    return items
  }, [handout?.content])

  if (!isOpen || !handout) return null

  const domainColor = handout.domain === 'cs_408'
    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs modal-backdrop-contain">
      <div className="dark bg-[#0e121d] border-0 sm:border border-white/10 rounded-none sm:rounded-2xl w-full max-w-6xl h-dvh sm:h-[92dvh] flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden text-slate-100 ring-1 ring-white/10">
        {/* Header */}
        <div className="px-3.5 py-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 border-b border-white/10 flex items-center justify-between gap-2 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold border ${domainColor} truncate max-w-[130px] sm:max-w-none`}>
                  {handout.domain === 'cs_408' ? '408' : '数学'} · {handout.subject}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {handout.difficulty}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
                {handout.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onPractice(handout)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 text-xs font-semibold transition-all active:scale-95"
              title="根据本讲义核心考点，立即生成随堂测验"
            >
              <Target className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">随堂即练</span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-quick-note'))
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all active:scale-95"
              title="为本篇讲义呼出侧边栏随手批注，心得将同步归档进知识库"
            >
              <Edit3 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">随手批注</span>
            </button>
            <button
              onClick={() => onAskAI(handout)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all active:scale-95"
              title="呼叫 AI 伴学助手深度讲透重难点"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">噜噜伴学</span>
            </button>
            <button
              onClick={() => setShowToc(!showToc)}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                showToc ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-slate-400 border-white/10 hover:bg-white/5'
              }`}
              title="展开/收起目录大纲"
              aria-label="目录"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/15 transition-colors"
              aria-label="关闭讲义"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Table of Contents Sidebar - 移动端抽屉遮罩，桌面端左侧静止 */}
          {showToc && toc.length > 0 && (
            <>
              <div
                className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-xs"
                onClick={() => setShowToc(false)}
              />
              <div className="fixed inset-y-0 left-0 z-30 w-72 bg-[#121622] border-r border-white/10 p-4 overflow-y-auto md:static md:w-64 md:z-auto shrink-0 space-y-1 shadow-2xl md:shadow-none animate-in slide-in-from-left duration-200">
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    讲义大纲索引
                  </span>
                  <button
                    onClick={() => setShowToc(false)}
                    className="md:hidden text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-white/10"
                  >
                    关闭
                  </button>
                </div>
                {toc.map((item, idx) => (
                  <div
                    key={idx}
                    className={`text-xs py-2 px-2.5 rounded-lg cursor-pointer transition-colors truncate active:scale-98 ${
                      item.level === 1 ? 'font-bold text-white hover:bg-white/10' :
                      item.level === 2 ? 'pl-4 text-slate-300 hover:bg-white/10' :
                      'pl-6 text-slate-400 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      const el = document.getElementById(item.id)
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                      if (window.innerWidth < 768) setShowToc(false)
                    }}
                    title={item.text}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Main Reading Text - 移动端全宽舒适字号 */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-8 sm:py-6 space-y-5 pb-16 sm:pb-6">
            {/* Quick summary card */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 考点精要速览
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {handout.summary}
              </p>
              {handout.keyTheorems && handout.keyTheorems.length > 0 && (
                <div className="pt-2 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {handout.keyTheorems.map((th, i) => (
                    <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                      <span className="text-orange-400 font-bold">•</span>
                      <span>{th}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Markdown rendered content */}
            <div className="prose prose-invert max-w-none text-slate-100 prose-p:leading-[1.75] prose-pre:bg-[#080b12] prose-pre:border prose-pre:border-white/10 prose-headings:text-white prose-a:text-indigo-400 academic-body leading-[1.75]">
              <MarkdownRenderer content={handout.content} className="text-slate-100" />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMastered(!isMastered)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                isMastered
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isMastered ? '已标记为掌握' : '标记已掌握'}
            </button>
            <span className="text-[11px] text-slate-500">
              支持 KaTeX 数学公式与 GFM 代码高亮渲染
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onPractice(handout)}
              className="px-4 py-1.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1"
            >
              <Target className="w-3.5 h-3.5" />
              开始本篇随堂测验
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
