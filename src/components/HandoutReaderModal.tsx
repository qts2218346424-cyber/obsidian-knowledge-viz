import { useState, useMemo } from 'react'
import {
  X, BookOpen, Clock, Target, CheckCircle2,
  List, Sparkles
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
  const [showToc, setShowToc] = useState(true)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-white/10 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${domainColor}`}>
                  {handout.domain === 'cs_408' ? '408 计算机' : '考研数学'} · {handout.subject}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {handout.difficulty}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {handout.readTime}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1 truncate max-w-xl">
                {handout.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onPractice(handout)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 text-xs font-semibold transition-all shadow-sm active:scale-95"
              title="根据本讲义核心考点，立即生成随堂测验"
            >
              <Target className="w-3.5 h-3.5" />
              随堂即练
            </button>
            <button
              onClick={() => onAskAI(handout)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all active:scale-95"
              title="呼叫 AI 伴学助手深度讲透重难点"
            >
              <Sparkles className="w-3.5 h-3.5" />
              噜噜伴学
            </button>
            <button
              onClick={() => setShowToc(!showToc)}
              className={`p-2 rounded-xl border text-xs transition-colors ${
                showToc ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-slate-400 border-white/10 hover:bg-white/5'
              }`}
              title="展开/收起目录大纲"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Table of Contents Sidebar */}
          {showToc && toc.length > 0 && (
            <div className="w-64 border-r border-white/10 bg-black/20 p-4 overflow-y-auto shrink-0 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                讲义大纲索引
              </div>
              {toc.map((item, idx) => (
                <div
                  key={idx}
                  className={`text-xs py-1.5 px-2 rounded-lg cursor-pointer transition-colors truncate ${
                    item.level === 1 ? 'font-bold text-white hover:bg-white/5' :
                    item.level === 2 ? 'pl-4 text-slate-300 hover:bg-white/5' :
                    'pl-6 text-slate-400 hover:bg-white/5'
                  }`}
                  onClick={() => {
                    const el = document.getElementById(item.id)
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}
                  title={item.text}
                >
                  {item.text}
                </div>
              ))}
            </div>
          )}

          {/* Main Reading Text */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
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
            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#0c0f17] prose-pre:border prose-pre:border-white/10 prose-headings:text-white prose-a:text-orange-400">
              <MarkdownRenderer content={handout.content} />
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
}
