import { createPortal } from 'react-dom'
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  X,
  BookOpen,
  Target,
  CheckCircle2,
  List,
  Sparkles,
  Edit3,
  Eye,
  EyeOff,
  Type
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

type PaperThemeMode = 'auto' | 'light' | 'sepia' | 'dark'
type EffectivePaperSkin = 'light' | 'sepia' | 'dark'
type ReaderFontSize = 'compact' | 'comfortable' | 'large'

interface ParsedFrontmatter {
  cleanContent: string
  metaTags: string[]
  updated?: string
}

/**
 * 剥离顶部 YAML Frontmatter 并提取轻量元数据徽章，防止将 --- title/tags --- 渲染为杂乱分割线正文
 */
function stripAndParseFrontmatter(raw: string): ParsedFrontmatter {
  if (!raw) return { cleanContent: '', metaTags: [] }
  const normalized = raw.replace(/^\uFEFF/, '')
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) {
    return { cleanContent: normalized, metaTags: [] }
  }

  const yamlBlock = match[1]
  const cleanContent = normalized.slice(match[0].length).trimStart()
  const metaTags: string[] = []
  let updated: string | undefined

  const lines = yamlBlock.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    const tagArrMatch = trimmed.match(/^tags\s*:\s*\[([^\]]*)\]/i)
    if (tagArrMatch) {
      tagArrMatch[1]
        .split(',')
        .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
        .forEach(t => metaTags.push(t))
      continue
    }
    const updatedMatch = trimmed.match(/^(?:updated|date|lastModified)\s*:\s*(.+)$/i)
    if (updatedMatch) {
      updated = updatedMatch[1].trim().replace(/^['"]|['"]$/g, '')
    }
  }

  return { cleanContent, metaTags, updated }
}

function detectGlobalSkin(): EffectivePaperSkin {
  if (typeof document === 'undefined') return 'light'
  const cls = document.documentElement.classList
  if (cls.contains('dark') || cls.contains('theme-dark')) return 'dark'
  if (cls.contains('theme-eyecare')) return 'sepia'
  return 'light'
}

export default function HandoutReaderModal({
  isOpen,
  onClose,
  handout,
  onPractice,
  onAskAI,
}: HandoutReaderModalProps) {
  const [showToc, setShowToc] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024)
  const [isMastered, setIsMastered] = useState(false)
  const [activeHeadingId, setActiveHeadingId] = useState<string>('')

  // 阅读器纸张底色切换（默认 'auto' 跟随全局四大主题）与字号调节
  const [paperTheme, setPaperTheme] = useState<PaperThemeMode>('auto')
  const [globalSkin, setGlobalSkin] = useState<EffectivePaperSkin>(() => detectGlobalSkin())
  const [fontSize, setFontSize] = useState<ReaderFontSize>('comfortable')

  // 核心词挖空背诵模式状态
  const [clozeMode, setClozeMode] = useState<boolean>(false)
  const [revealedCount, setRevealedCount] = useState<number>(0)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const markdownBodyRef = useRef<HTMLDivElement>(null)
  const activeTocItemRef = useRef<HTMLDivElement>(null)

  // 实时监听全局主题切换（如顶栏切换白昼/护眼/暗黑四大主题时自动同步）
  useEffect(() => {
    if (typeof document === 'undefined') return
    setGlobalSkin(detectGlobalSkin())
    const observer = new MutationObserver(() => {
      setGlobalSkin(detectGlobalSkin())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  const effectiveSkin: EffectivePaperSkin = paperTheme === 'auto' ? globalSkin : paperTheme

  // 剥离 YAML Frontmatter 后的干净正文
  const { cleanContent, metaTags, updated } = useMemo(
    () => stripAndParseFrontmatter(handout?.content || ''),
    [handout?.content]
  )

  // 切换讲义或关闭挖空模式时重置已显影词条状态
  useEffect(() => {
    setRevealedCount(0)
    if (!markdownBodyRef.current) return
    markdownBodyRef.current
      .querySelectorAll('.cloze-revealed')
      .forEach(el => el.classList.remove('cloze-revealed'))
  }, [handout?.id, clozeMode])

  // Parse Table of Contents from cleaned markdown headings (安全过滤代码块与数学块)
  const toc = useMemo<TocItem[]>(() => {
    if (!cleanContent) return []
    const lines = cleanContent.split('\n')
    const items: TocItem[] = []
    let inCodeBlock = false
    let inMathBlock = false

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock
        continue
      }
      if (inCodeBlock) continue

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
  }, [cleanContent])

  // 平滑跳转到对应小节（具备 ID 精确、文本包含、序号兜底三级稳健机制）
  const scrollToHeading = useCallback((item: TocItem) => {
    setActiveHeadingId(item.id)

    const container = scrollContainerRef.current
    if (!container) return

    let target: HTMLElement | null = null
    try {
      target = document.getElementById(item.id)
    } catch {
      target = null
    }

    if (!target && markdownBodyRef.current) {
      const headings = Array.from(
        markdownBodyRef.current.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')
      )

      const cleanStr = (s: string) =>
        s.replace(/[\s\$\\\*\`\[\]\(\)（）\.,，。、:：!！?？\-_]/g, '').toLowerCase()

      const targetClean = cleanStr(item.text)

      target =
        headings.find(h => {
          const hClean = cleanStr(h.textContent || '')
          return hClean.includes(targetClean) || targetClean.includes(hClean)
        }) || null

      if (!target && headings[item.index]) {
        target = headings[item.index]
      }
    }

    if (target) {
      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const targetScrollTop = container.scrollTop + (targetRect.top - containerRect.top) - 24

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      })

      target.classList.remove('heading-target-pulse')
      void target.offsetWidth
      target.classList.add('heading-target-pulse')
      setTimeout(() => {
        target?.classList.remove('heading-target-pulse')
      }, 1800)
    }

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
    handleScroll()

    return () => {
      container.removeEventListener('scroll', onScrollThrottled)
      cancelAnimationFrame(rafId)
    }
  }, [toc])

  // 事件委托：挖空背诵模式下点击核心加粗词切换显影/遮盖
  const handleMarkdownBodyClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!clozeMode) return
      const target = e.target as HTMLElement | null
      const strongEl = target?.closest('strong')
      if (strongEl && markdownBodyRef.current?.contains(strongEl)) {
        e.stopPropagation()
        strongEl.classList.toggle('cloze-revealed')
        const count = markdownBodyRef.current.querySelectorAll('strong.cloze-revealed').length
        setRevealedCount(count)
      }
    },
    [clozeMode]
  )

  const handleRevealAllCloze = () => {
    if (!markdownBodyRef.current) return
    const allStrong = markdownBodyRef.current.querySelectorAll('strong')
    allStrong.forEach(el => el.classList.add('cloze-revealed'))
    setRevealedCount(allStrong.length)
  }

  const handleResetAllCloze = () => {
    if (!markdownBodyRef.current) return
    markdownBodyRef.current
      .querySelectorAll('strong.cloze-revealed')
      .forEach(el => el.classList.remove('cloze-revealed'))
    setRevealedCount(0)
  }

  if (!isOpen || !handout) return null

  const isDark = effectiveSkin === 'dark'
  const isSepia = effectiveSkin === 'sepia'

  // 三大纸张皮肤样式映射
  const shellStyles = isDark
    ? 'dark bg-[#0e121d] text-slate-100 border-white/10 ring-white/10'
    : isSepia
      ? 'bg-[#f3f7ef] text-[#223127] border-[#cfe0c8] ring-[#cfe0c8]/60'
      : 'bg-white text-slate-800 border-slate-200/90 ring-slate-200/60'

  const headerFooterStyles = isDark
    ? 'border-white/10 bg-white/[0.02]'
    : isSepia
      ? 'border-[#d6e4d0] bg-[#eaf1e4]/85'
      : 'border-slate-200/80 bg-slate-50/80'

  const sidebarStyles = isDark
    ? 'bg-[#121622] border-white/10'
    : isSepia
      ? 'bg-[#eaf2e5] border-[#d2e1cc]'
      : 'bg-slate-50/95 border-slate-200/85'

  const summaryCardStyles = isDark
    ? 'bg-white/[0.03] border-white/10 text-slate-300'
    : isSepia
      ? 'bg-[#e5efe0]/75 border-[#c7dac0] text-[#2e4033]'
      : 'bg-amber-50/55 border-amber-200/70 text-slate-700'

  const fontSizeStyles =
    fontSize === 'compact'
      ? 'text-[13.5px] leading-[1.7]'
      : fontSize === 'large'
        ? 'text-[16.5px] sm:text-[17.5px] leading-[1.9]'
        : 'text-[15px] leading-[1.8]'

  const domainColor =
    handout.domain === 'cs_408'
      ? isDark
        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
        : 'bg-blue-50 text-blue-700 border-blue-200'
      : handout.domain === 'politics'
        ? isDark
          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
          : 'bg-rose-50 text-rose-700 border-rose-200'
        : handout.domain === 'english'
          ? isDark
            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          : handout.domain === 'general'
            ? isDark
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : 'bg-amber-50 text-amber-700 border-amber-200'
            : isDark
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'

  const displayTags = Array.from(new Set([...(handout.tags || []), ...metaTags])).slice(0, 6)

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs modal-backdrop-contain">
      {/* 定位高亮动效 + 核心词挖空背诵作用域毛玻璃样式 */}
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
        .handout-cloze-active strong {
          position: relative;
          display: inline;
          border-radius: 5px;
          padding: 1px 5px;
          margin: 0 1px;
          cursor: pointer;
          transition: filter 0.18s ease, background-color 0.18s ease, color 0.18s ease;
        }
        .handout-cloze-active strong:not(.cloze-revealed) {
          color: transparent !important;
          background: rgba(99, 102, 241, 0.22);
          border-bottom: 1.5px dashed rgba(99, 102, 241, 0.55);
          filter: blur(5px);
          user-select: none;
        }
        .handout-cloze-active strong:not(.cloze-revealed) * {
          opacity: 0 !important;
        }
        .handout-cloze-active strong:not(.cloze-revealed):hover {
          color: inherit !important;
          filter: blur(0);
          background: rgba(245, 158, 11, 0.2);
        }
        .handout-cloze-active strong:not(.cloze-revealed):hover * {
          opacity: 1 !important;
        }
        .handout-cloze-active strong.cloze-revealed {
          background: rgba(16, 185, 129, 0.16);
          border-bottom: 1.5px solid rgba(16, 185, 129, 0.55);
          filter: none;
        }
      `}</style>

      <div
        className={`${shellStyles} border-0 sm:border rounded-none sm:rounded-2xl w-full max-w-6xl h-dvh sm:h-[92dvh] flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.45)] overflow-hidden ring-1 transition-colors duration-200`}
      >
        {/* Header */}
        <div
          className={`px-3.5 py-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-3.5 border-b ${headerFooterStyles} flex flex-col gap-2 shrink-0`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div
                className={`p-1.5 sm:p-2 rounded-xl border shrink-0 ${
                  isDark
                    ? 'bg-orange-500/15 text-orange-400 border-orange-500/25'
                    : isSepia
                      ? 'bg-[#dcead5] text-[#255c3c] border-[#bdd4b3]'
                      : 'bg-orange-50 text-orange-600 border-orange-200'
                }`}
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded text-2xs font-semibold border ${domainColor} truncate max-w-[150px] sm:max-w-none`}>
                    {handout.domain === 'cs_408'
                      ? '408'
                      : handout.domain === 'politics'
                        ? '政治'
                        : handout.domain === 'english'
                          ? '英语'
                          : handout.domain === 'general'
                            ? '专业课'
                            : '数学'}{' '}
                    · {handout.subject}
                  </span>
                  <span
                    className={`hidden sm:inline-block px-2 py-0.5 rounded text-2xs font-medium border ${
                      isDark
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {handout.difficulty}
                  </span>
                  {updated && (
                    <span className={`hidden md:inline text-2xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      更新于 {updated}
                    </span>
                  )}
                </div>
                <h2 className={`text-sm sm:text-base font-bold mt-0.5 truncate ${isDark ? 'text-white' : isSepia ? 'text-[#1c2b21]' : 'text-slate-900'}`}>
                  {handout.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* 🙈 核心词挖空背诵模式开关 */}
              <button
                type="button"
                onClick={() => setClozeMode(prev => !prev)}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  clozeMode
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : isDark
                      ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/15'
                      : isSepia
                        ? 'bg-white/75 hover:bg-white text-[#254632] border-[#c4d8bc]'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="开启后将遮盖讲义中的加粗核心概念词，悬停透视、点击显影，专治政治与 408 背诵"
              >
                {clozeMode ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 shrink-0" />}
                <span>{clozeMode ? '退出挖空' : '🙈 挖空背诵'}</span>
              </button>

              <button
                onClick={() => onPractice(handout)}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border-orange-500/30'
                    : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                }`}
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
                className={`hidden sm:flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}
                title="为本篇讲义呼出侧边栏随手批注，心得将同步归档进知识库"
              >
                <Edit3 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">随手批注</span>
              </button>

              <button
                onClick={() => onAskAI(handout)}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  isDark
                    ? 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-500/30'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                }`}
                title="呼叫 AI 伴学助手深度讲透重难点"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">噜噜伴学</span>
              </button>

              <button
                onClick={() => setShowToc(!showToc)}
                className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                  showToc
                    ? isDark
                      ? 'bg-white/15 text-white border-white/25'
                      : 'bg-slate-200/80 text-slate-900 border-slate-300'
                    : isDark
                      ? 'bg-transparent text-slate-400 border-white/10 hover:bg-white/5'
                      : 'bg-white/70 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="展开/收起目录大纲"
                aria-label="目录"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/15'
                    : 'bg-slate-200/60 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
                aria-label="关闭讲义"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* 第二行轻量阅读偏好工具栏：三色护眼纸张切换胶囊 + 字号大小调节 + 挖空背诵控制 */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-current/10 text-xs">
            {/* 纸张皮肤快捷胶囊 */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <span className={`text-[11px] mr-1 hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                阅读底色:
              </span>
              {(
                [
                  { key: 'auto', label: '🔄 跟随主题' },
                  { key: 'light', label: '☀️ 白昼' },
                  { key: 'sepia', label: '🌿 豆沙护眼' },
                  { key: 'dark', label: '🌙 暗夜' },
                ] as const
              ).map(opt => {
                const active = paperTheme === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPaperTheme(opt.key)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer shrink-0 border ${
                      active
                        ? isDark
                          ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/50 shadow-2xs'
                          : isSepia
                            ? 'bg-[#2d6a4f] text-white border-[#2d6a4f] shadow-2xs'
                            : 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : isDark
                          ? 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                          : 'bg-white/80 text-slate-600 border-slate-200/90 hover:bg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* 挖空背诵辅助快捷控制 */}
              {clozeMode && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-[11px]">
                  <span className={isDark ? 'text-indigo-200' : 'text-indigo-800'}>
                    悬停透视 · 点击词条显影 {revealedCount > 0 ? `(已显 ${revealedCount} 处)` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={handleRevealAllCloze}
                    className="underline font-semibold text-indigo-500 hover:text-indigo-400 cursor-pointer ml-1"
                  >
                    全显
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAllCloze}
                    className="underline font-semibold text-amber-600 hover:text-amber-500 cursor-pointer"
                  >
                    重遮
                  </button>
                </div>
              )}

              {/* 字号大小调节 */}
              <div
                className={`inline-flex items-center rounded-full p-0.5 border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200'
                }`}
              >
                <Type className={`w-3.5 h-3.5 ml-2 mr-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                {(
                  [
                    { key: 'compact', label: '紧凑' },
                    { key: 'comfortable', label: '舒适' },
                    { key: 'large', label: '大字' },
                  ] as const
                ).map(sz => (
                  <button
                    key={sz.key}
                    type="button"
                    onClick={() => setFontSize(sz.key)}
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                      fontSize === sz.key
                        ? isDark
                          ? 'bg-white/20 text-white font-bold'
                          : isSepia
                            ? 'bg-[#2d6a4f] text-white font-bold'
                            : 'bg-slate-900 text-white font-bold'
                        : isDark
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Table of Contents Sidebar */}
          {showToc && toc.length > 0 && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-xs"
                onClick={() => setShowToc(false)}
              />
              <div
                className={`fixed inset-y-0 left-0 z-30 w-72 border-r ${sidebarStyles} p-4 overflow-y-auto md:static md:w-64 md:z-auto shrink-0 space-y-1 shadow-xl md:shadow-none animate-in slide-in-from-left duration-200`}
              >
                <div className="flex items-center justify-between mb-2.5 px-2">
                  <span className={`text-2xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <List className="w-3.5 h-3.5 text-orange-500" />
                    讲义大纲索引
                  </span>
                  <button
                    onClick={() => setShowToc(false)}
                    className={`md:hidden text-xs px-2 py-0.5 rounded cursor-pointer ${
                      isDark ? 'text-slate-400 hover:text-white bg-white/10' : 'text-slate-600 bg-slate-200/70'
                    }`}
                  >
                    关闭
                  </button>
                </div>
                {toc.map(item => {
                  const isActive = activeHeadingId === item.id
                  return (
                    <div
                      key={item.index}
                      ref={isActive ? activeTocItemRef : undefined}
                      className={`text-xs py-2 px-2.5 rounded-lg cursor-pointer transition-all truncate active:scale-98 flex items-center gap-1.5 ${
                        isActive
                          ? isDark
                            ? 'bg-orange-500/20 text-orange-300 font-semibold border-l-2 border-orange-500 shadow-xs'
                            : isSepia
                              ? 'bg-[#cfe3c6] text-[#1b4332] font-bold border-l-2 border-[#2d6a4f]'
                              : 'bg-orange-50 text-orange-700 font-bold border-l-2 border-orange-500 shadow-2xs'
                          : item.level === 1
                            ? isDark
                              ? 'font-bold text-white hover:bg-white/10'
                              : 'font-bold text-slate-900 hover:bg-black/5'
                            : item.level === 2
                              ? isDark
                                ? 'pl-4 text-slate-300 hover:bg-white/10'
                                : 'pl-4 text-slate-700 hover:bg-black/5'
                              : isDark
                                ? 'pl-6 text-slate-400 hover:bg-white/10'
                                : 'pl-6 text-slate-500 hover:bg-black/5'
                      }`}
                      onClick={() => scrollToHeading(item)}
                      title={item.text}
                    >
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 animate-pulse" />
                      )}
                      <span className="truncate">{item.text}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Main Reading Text */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-8 sm:py-6 space-y-5 pb-16 sm:pb-6 scroll-smooth"
          >
            {/* Quick summary & stripped frontmatter tags card */}
            <div className={`p-4 rounded-xl border ${summaryCardStyles} space-y-2`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-orange-400' : isSepia ? 'text-[#2d6a4f]' : 'text-orange-600'}`}>
                  <Sparkles className="w-3.5 h-3.5" /> 考点精要速览
                </div>
                {displayTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {displayTags.map(tag => (
                      <span
                        key={tag}
                        className={`px-2 py-0.2 rounded-full text-[10.5px] font-medium ${
                          isDark
                            ? 'bg-white/10 text-slate-300'
                            : isSepia
                              ? 'bg-[#d5e6cd] text-[#234731]'
                              : 'bg-white/90 text-slate-600 border border-amber-200/70'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs leading-relaxed">
                {handout.summary}
              </p>
              {handout.keyTheorems && handout.keyTheorems.length > 0 && (
                <div className={`pt-2 border-t grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 ${isDark ? 'border-white/10' : 'border-current/10'}`}>
                  {handout.keyTheorems.map((th, i) => (
                    <div key={i} className={`text-2xs flex items-start gap-1.5 ${isDark ? 'text-slate-400' : 'opacity-85'}`}>
                      <span className="text-orange-500 font-bold">•</span>
                      <span>{th}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Markdown rendered content (已自动剥离 YAML Frontmatter，支持挖空背诵与字号调节) */}
            <div
              ref={markdownBodyRef}
              onClick={handleMarkdownBodyClick}
              className={`prose max-w-none academic-body ${fontSizeStyles} ${
                clozeMode ? 'handout-cloze-active' : ''
              } ${
                isDark
                  ? 'prose-invert text-slate-100 prose-pre:bg-[#080b12] prose-pre:border prose-pre:border-white/10 prose-headings:text-white prose-a:text-indigo-400'
                  : isSepia
                    ? 'text-[#223127] prose-headings:text-[#16241b] prose-strong:text-[#183928] prose-pre:bg-[#e5efe0] prose-pre:text-[#1e2f23] prose-pre:border prose-pre:border-[#c8dcc0] prose-a:text-[#2d6a4f]'
                    : 'text-slate-800 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-a:text-indigo-600'
              }`}
            >
              <MarkdownRenderer
                content={cleanContent}
                className={isDark ? 'text-slate-100' : isSepia ? 'text-[#223127]' : 'text-slate-800'}
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className={`px-4 sm:px-6 py-3 border-t ${headerFooterStyles} flex flex-wrap items-center justify-between gap-2 text-xs`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMastered(!isMastered)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                isMastered
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 font-semibold'
                  : isDark
                    ? 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                    : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isMastered ? '已标记为掌握' : '标记已掌握'}
            </button>
            <span className={`hidden sm:inline text-2xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              支持 KaTeX 公式、三色护眼纸张与核心词挖空自测
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onPractice(handout)}
              className="px-4 py-1.5 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
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
