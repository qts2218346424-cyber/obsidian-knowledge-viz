import { createPortal } from 'react-dom'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
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

interface TocItem {
  index: number
  level: number
  text: string
  id: string
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
  const [activeHeadingId, setActiveHeadingId] = useState<string>('')

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const markdownBodyRef = useRef<HTMLDivElement>(null)
  const activeTocItemRef = useRef<HTMLDivElement>(null)

  // Parse Table of Contents from markdown headings (安全过滤代码块与数学块)
  const toc = useMemo<TocItem[]>(() => {
    if (!handout?.content) return []
    const lines = handout.content.split('\n')
    const items: TocItem[] = []
    let inCodeBlock = false
    let inMathBlock = false

    for (const line of lines) {
      const trimmed = line.trim()
      // 代码块检测
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock
        continue
      }
      if (inCodeBlock) continue

      // 独立公式块检测
      if (trimmed.startsWith('$$')) {
        inMathBlock = !inMathBlock
        continue
      }
      if (inMathBlock) continue

      const match = line.match(/^(#{1,3})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const rawText = match[2].trim()
        const text = rawText.replace(/\*\*/g, '').replace(/`/g, '')
        const id = 'heading-' + encodeURIComponent(text)
        items.push({ index: items.length, level, text, id })
      }
    }
    return items
  }, [handout?.content])

  // 平滑跳转到对应小节（具备 ID 精确、文本包含、序号兜底三级稳健机制）
  const scrollToHeading = useCallback((item: TocItem) => {
    setActiveHeadingId(item.id)

    const container = scrollContainerRef.current
    if (!container) return

    // 1. 尝试直接通过 ID 查找
    let target: HTMLElement | null = null
    try {
      target = document.getElementById(item.id)
    } catch {
      target = null
    }

    // 2. 如果 ID 未能直接命中，在 markdownBodyRef 内部搜索所有标题标签
    if (!target && markdownBodyRef.current) {
      const headings = Array.from(
        markdownBodyRef.current.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')
      )

      const cleanStr = (s: string) =>
        s.replace(/[\s\$\\\*\`\[\]\(\)（）\.,，。、:：!！?？\-_]/g, '').toLowerCase()

      const targetClean = cleanStr(item.text)

      // a. 优先按清洗后的核心文本模糊匹配
      target = headings.find((h) => {
        const hClean = cleanStr(h.textContent || '')
        return hClean.includes(targetClean) || targetClean.includes(hClean)
      }) || null

      // b. 若因公式符号或 Markdown 特殊语法仍未命中，采用大纲项序号绝对兜底
      if (!target && headings[item.index]) {
        target = headings[item.index]
      }
    }

    // 3. 执行平滑精准滚动并加入聚焦光晕
    if (target) {
      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      // 预留 24px 呼吸间距，防止紧贴顶栏
      const targetScrollTop = container.scrollTop + (targetRect.top - containerRect.top) - 24

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      })

      // 视觉聚焦动效：短暂高亮微闪，让用户清晰确认定位位置
      target.classList.remove('heading-target-pulse')
      void target.offsetWidth // 触发重绘
      target.classList.add('heading-target-pulse')
      setTimeout(() => {
        target?.classList.remove('heading-target-pulse')
      }, 1800)
    }

    // 移动端点击后自动关闭大纲抽屉
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowToc(false)
    }
  }, [])

  // 监听右侧正文滚动，自动联动高亮左侧大纲对应章节
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !markdownBodyRef.current || toc.length === 0) return

    const handleScroll = () => {
      const headings = Array.from(
        markdownBodyRef.current?.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6') || []
      )
      if (headings.length === 0) return

      const containerRect = container.getBoundingClientRect()
      let currentActiveId = ''

      for (let i = 0; i < headings.length; i++) {
        const h = headings[i]
        const hRect = h.getBoundingClientRect()
        // 标题处于视口顶部舒适阅读区域时视为当前活动章节
        if (hRect.top - containerRect.top <= 140) {
          const matchedItem = toc[i]
          if (matchedItem) {
            currentActiveId = matchedItem.id
          }
        } else {
          break
        }
      }

      if (currentActiveId) {
        setActiveHeadingId(currentActiveId)
      } else if (container.scrollTop < 60 && toc[0]) {
        setActiveHeadingId(toc[0].id)
      }
    }

    let rafId: number
    const onScrollThrottled = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(handleScroll)
    }

    container.addEventListener('scroll', onScrollThrottled, { passive: true })
    handleScroll() // 初始化检测

    return () => {
      container.removeEventListener('scroll', onScrollThrottled)
      cancelAnimationFrame(rafId)
    }
  }, [toc])

  if (!isOpen || !handout) return null

  const domainColor = handout.domain === 'cs_408'
    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    : handout.domain === 'politics' ? 'bg-red-500/10 text-red-400 border-red-500/20' : handout.domain === 'english' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : handout.domain === 'general' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs modal-backdrop-contain">
      {/* 注入微动效 CSS，支持定位目标高亮发光 */}
      <style>{`
        @keyframes headingPulse {
          0% {
            background-color: rgba(249, 115, 22, 0.28);
            box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.25);
            border-radius: 8px;
          }
          50% {
            background-color: rgba(249, 115, 22, 0.16);
            box-shadow: 0 0 0 6px rgba(249, 115, 22, 0.12);
            border-radius: 8px;
          }
          100% {
            background-color: transparent;
            box-shadow: none;
          }
        }
        .heading-target-pulse {
          animation: headingPulse 1.6s ease-out forwards;
        }
      `}</style>

      <div className="dark bg-[#0e121d] border-0 sm:border border-white/10 rounded-none sm:rounded-2xl w-full max-w-6xl h-dvh sm:h-[92dvh] flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden text-slate-100 ring-1 ring-white/10">
        {/* Header */}
        <div className="px-3.5 py-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4 border-b border-white/10 flex items-center justify-between gap-2 bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`px-1.5 sm:px-2 py-0.5 rounded text-2xs sm:text-2xs font-semibold border ${domainColor} truncate max-w-[130px] sm:max-w-none`}>
                  {handout.domain === 'cs_408' ? '408' : handout.domain === 'politics' ? '政治' : handout.domain === 'english' ? '英语' : handout.domain === 'general' ? '专业课' : '数学'} · {handout.subject}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-2xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
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
              <div className="fixed inset-y-0 left-0 z-30 w-72 bg-[#121622] border-r border-white/10 p-4 overflow-y-auto md:static md:w-64 md:z-auto shrink-0 space-y-1 shadow-xl md:shadow-none animate-in slide-in-from-left duration-200">
                <div className="flex items-center justify-between mb-2.5 px-2">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <List className="w-3.5 h-3.5 text-orange-400" />
                    讲义大纲索引
                  </span>
                  <button
                    onClick={() => setShowToc(false)}
                    className="md:hidden text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-white/10"
                  >
                    关闭
                  </button>
                </div>
                {toc.map((item) => {
                  const isActive = activeHeadingId === item.id
                  return (
                    <div
                      key={item.index}
                      ref={isActive ? activeTocItemRef : undefined}
                      className={`text-xs py-2 px-2.5 rounded-lg cursor-pointer transition-all truncate active:scale-98 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-orange-500/20 text-orange-300 font-semibold border-l-2 border-orange-500 shadow-xs'
                          : item.level === 1
                          ? 'font-bold text-white hover:bg-white/10'
                          : item.level === 2
                          ? 'pl-4 text-slate-300 hover:bg-white/10'
                          : 'pl-6 text-slate-400 hover:bg-white/10'
                      }`}
                      onClick={() => scrollToHeading(item)}
                      title={item.text}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 animate-pulse" />
                      )}
                      <span className="truncate">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Main Reading Text - 移动端全宽舒适字号 */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-8 sm:py-6 space-y-5 pb-16 sm:pb-6 scroll-smooth"
          >
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
                    <div key={i} className="text-2xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-orange-400 font-bold">•</span>
                      <span>{th}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Markdown rendered content */}
            <div
              ref={markdownBodyRef}
              className="prose prose-invert max-w-none text-slate-100 prose-p:leading-[1.75] prose-pre:bg-[#080b12] prose-pre:border prose-pre:border-white/10 prose-headings:text-white prose-a:text-indigo-400 academic-body leading-[1.75]"
            >
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
            <span className="text-2xs text-slate-500">
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
