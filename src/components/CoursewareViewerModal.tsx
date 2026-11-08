import { createPortal } from 'react-dom'
import { useState, useMemo, useEffect } from 'react'
import {
  X,
  Code2,
  Target,
  Maximize2,
  Minimize2,
  CheckCircle,
  BookOpen,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import type { InteractiveCoursewareItem } from '../data/interactiveCourseware'

interface CoursewareViewerModalProps {
  isOpen: boolean
  onClose: () => void
  item: InteractiveCoursewareItem | null
  onPractice?: (item: InteractiveCoursewareItem) => void
}

/**
 * 为内嵌交互仿真课件注入全平台响应式布局与 Resize 自适应重绘补丁，
 * 彻底解决窄屏/移动端双栏挤压、画布高度塌陷、表格横向裁切与首帧空白问题。
 */
function enhanceCoursewareHtml(rawHtml: string): string {
  const hasViewport = /name=["']viewport["']/i.test(rawHtml)
  const viewportMeta = hasViewport
    ? ''
    : '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">'

  const patchCss = `
<style id="coreforge-cw-responsive-patch">
  html {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.4); }
  ::-webkit-scrollbar-thumb { background: rgba(100, 116, 139, 0.45); border-radius: 999px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.65); }

  .canvas-panel canvas,
  .sim-panel canvas,
  .canvas-panel svg,
  .sim-panel svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* 中等屏幕适度收窄左侧控制面板，释放更多画布视野 */
  @media (max-width: 1060px) and (min-width: 781px) {
    body { padding: 12px !important; }
    .layout {
      grid-template-columns: 256px minmax(0, 1fr) !important;
      gap: 10px !important;
    }
  }

  /* 手机与平板竖屏：上下流式排布，仿真画布置顶首屏呈现，控制栏紧随其下 */
  @media (max-width: 780px) {
    html, body {
      height: auto !important;
      min-height: 100dvh !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      padding: 10px !important;
      -webkit-overflow-scrolling: touch;
    }
    header {
      flex-wrap: wrap !important;
      gap: 6px !important;
      padding-bottom: 8px !important;
      margin-bottom: 10px !important;
    }
    header h1 {
      font-size: 14px !important;
      line-height: 1.35 !important;
    }
    .layout {
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
      flex: none !important;
      height: auto !important;
      min-height: 0 !important;
    }
    .layout > .canvas-panel {
      order: -1 !important;
      width: 100% !important;
      height: 310px !important;
      min-height: 310px !important;
      flex: none !important;
    }
    .layout > .sim-panel {
      order: -1 !important;
      width: 100% !important;
      min-height: 290px !important;
      max-height: none !important;
      height: auto !important;
      flex: none !important;
      padding: 12px !important;
      overflow-x: auto !important;
    }
    .layout > .sim-panel canvas {
      height: 270px !important;
      min-height: 270px !important;
    }
    .layout > .panel:first-child {
      width: 100% !important;
      max-height: none !important;
      overflow: visible !important;
      padding: 12px !important;
    }
    button {
      min-height: 36px;
      touch-action: manipulation;
    }
    input[type="text"],
    input[type="number"],
    select {
      font-size: 14px !important;
    }
    table {
      font-size: 11px !important;
    }
  }
</style>`

  const patchScript = `
<script>
(function() {
  function fireResize() {
    try { window.dispatchEvent(new Event('resize')); } catch (e) {}
  }
  window.addEventListener('load', function() {
    setTimeout(fireResize, 40);
    setTimeout(fireResize, 180);
    setTimeout(fireResize, 450);
  });
  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function() { fireResize(); });
    document.addEventListener('DOMContentLoaded', function() {
      var targets = document.querySelectorAll('.canvas-panel, .sim-panel, .layout');
      targets.forEach(function(el) { ro.observe(el); });
    });
  }
})();
</script>`

  let out = rawHtml
  if (out.includes('</head>')) {
    out = out.replace('</head>', `${viewportMeta}\n${patchCss}\n</head>`)
  } else {
    out = `${viewportMeta}\n${patchCss}\n${out}`
  }

  if (out.includes('</body>')) {
    out = out.replace('</body>', `${patchScript}\n</body>`)
  } else {
    out = `${out}\n${patchScript}`
  }
  return out
}

export default function CoursewareViewerModal({
  isOpen,
  onClose,
  item,
  onPractice,
}: CoursewareViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [asyncHtml, setAsyncHtml] = useState<string>('')
  const [isLoadingHtml, setIsLoadingHtml] = useState<boolean>(false)

  // 每次切换打开新课件时重置状态，默认将 100% 视野留给交互画布
  useEffect(() => {
    if (isOpen && item) {
      setShowGuide(false)
      setReloadKey(k => k + 1)
      setAsyncHtml('')
      if (item.embedHtml) {
        setAsyncHtml(item.embedHtml)
      } else if (item.loadHtml) {
        setIsLoadingHtml(true)
        item.loadHtml()
          .then(html => setAsyncHtml(html))
          .catch(err => console.error('加载课件失败:', err))
          .finally(() => setIsLoadingHtml(false))
      }
    }
  }, [isOpen, item?.id])

  const enhancedHtml = useMemo(() => {
    const raw = item?.embedHtml || asyncHtml
    if (!raw) return ''
    return enhanceCoursewareHtml(raw)
  }, [item?.embedHtml, asyncHtml])

  if (!isOpen || !item) return null

  const srcUrl = item.rawPath ? `/api/books/raw?path=${encodeURIComponent(item.rawPath)}` : undefined

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`dark bg-[#0a0e17] border-0 sm:border sm:border-white/10 flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-dvh rounded-none'
            : 'w-full h-dvh sm:w-[94vw] sm:h-[90vh] sm:max-w-[1720px] sm:rounded-2xl ring-1 ring-white/10'
        }`}
      >
        {/* 顶部沉浸式工具栏 */}
        <div className="px-3 sm:px-5 py-2.5 border-b border-white/10 flex items-center justify-between gap-2 bg-[#121829]/95 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shrink-0">
              <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                  {item.domain === 'cs_408' ? '408 计算机' : item.domain === 'politics' ? '考研政治' : '考研数学'} · {item.subject}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/25 hidden xs:inline-block">
                  {item.difficulty}
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate max-w-[200px] xs:max-w-[260px] sm:max-w-xl">
                {item.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 重置仿真按钮 */}
            <button
              type="button"
              onClick={() => setReloadKey(k => k + 1)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors cursor-pointer"
              title="重新加载并复位课件状态"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">复位</span>
            </button>

            {/* 考点精讲抽屉开关 */}
            <button
              type="button"
              onClick={() => setShowGuide(v => !v)}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                showGuide
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/50 shadow-sm shadow-cyan-500/20'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/25'
              }`}
              title="查看本课件核心考研要点与秒杀结论"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>考点精讲</span>
            </button>

            {/* 随堂真题测验 */}
            {onPractice && (
              <button
                type="button"
                onClick={() => onPractice(item)}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-amber-300 border border-amber-500/35 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <Target className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">真题自测</span>
              </button>
            )}

            {/* 桌面端全屏按钮 */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? '退出全屏' : '全屏沉浸模式'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer"
              title="关闭仿真实验室"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* 主体区：100% 释放仿真画布视野 + 按需呼出考点精讲面板 */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 h-full bg-[#0b0f19] relative overflow-hidden">
            {isLoadingHtml ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono tracking-wider text-slate-400">正在按需装载交互课件核心仿真引擎...</span>
              </div>
            ) : srcUrl ? (
              <iframe
                key={`${item.id}-${reloadKey}`}
                src={srcUrl}
                title={item.title}
                className="w-full h-full border-0 block"
              />
            ) : enhancedHtml ? (
              <iframe
                key={`${item.id}-${reloadKey}`}
                srcDoc={enhancedHtml}
                title={item.title}
                className="w-full h-full border-0 block"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                课件内容加载失败
              </div>
            )}
          </div>

          {/* 考点精讲面板：桌面端右侧停靠栏 / 手机端底部弹出半屏毛玻璃抽屉 */}
          {showGuide && (
            <>
              <div
                onClick={() => setShowGuide(false)}
                className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-[2px] z-20"
              />
              <div className="fixed md:static inset-x-0 bottom-0 max-h-[72dvh] md:max-h-none md:w-80 lg:w-88 z-30 md:z-auto rounded-t-2xl md:rounded-none border-t md:border-t-0 md:border-l border-white/15 bg-[#13192b]/98 backdrop-blur-xl p-5 overflow-y-auto space-y-4 shrink-0 shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-right duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                    课件要点与考研命题精讲
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuide(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/8">
                  {item.summary}
                </p>

                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    核心研学收获与考场结论
                  </div>
                  {item.learningPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {onPractice && (
                  <div className="pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setShowGuide(false)
                        onPractice(item)
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 cursor-pointer"
                    >
                      <Target className="w-4 h-4" />
                      即刻检验直观理解 (3道随堂真题)
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
