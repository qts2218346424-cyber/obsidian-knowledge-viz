import { createPortal } from 'react-dom'
import { useState, useEffect, useCallback } from 'react'
import {
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Minimize2,
  Maximize2,
  BookOpen,
  ArrowRight,
  ListChecks,
} from 'lucide-react'

export interface EditorTourStep {
  id: number
  title: string
  badge: string
  summary: string
  checklist: string[]
  tips: string[]
  targetSelector: string
  pointerLabel: string
  actionLabel?: string
  actionType?: 'toggle_preview' | 'switch_mode' | 'open_new_folder' | 'open_manual' | 'open_math'
}

export const EDITOR_TOUR_STEPS: EditorTourStep[] = [
  {
    id: 1,
    title: '知识库目录树 · 章节与层级清晰掌控',
    badge: '第 1 步 · 目录浏览',
    summary:
      '左侧展示你本地 Obsidian 知识库的全部文件夹与笔记。支持按学科专题折叠展开、即时过滤检索，悬停任意目录右侧还可一键新建子笔记。',
    checklist: [
      '点击文件夹可展开或收起子分类，点击任意笔记立即载入阅读',
      '在目录顶部的搜索框输入关键词可秒速筛选匹配文档',
      '悬停任意文件夹节点，点击右侧快捷图标可直接在此目录下新建',
    ],
    tips: ['手机端点击左下角目录按钮可随时侧滑唤出或收起目录树，把屏幕全留给正文。'],
    targetSelector: '[data-tour="editor-file-tree"]',
    pointerLabel: '左侧笔记目录树（点击笔记立即阅读）',
  },
  {
    id: 2,
    title: '新建多级目录与笔记 · 自由归档',
    badge: '第 2 步 · 组织归类',
    summary:
      '点击「新建」秒开空白纸张开写；点击「新建目录」可输入单级或多级路径（如“408数据结构/平衡树”），并在标题下方随时切换存放位置。',
    checklist: [
      '点击顶栏「新建目录」，支持一键创建多级嵌套学科文件夹',
      '点击「新建」开启新笔记，在标题下方「存放目录」下拉框自由指定归档处',
      '点击「模板」可快速套用“学习卡片”、“错题复盘”或“灵感速记”标准框架',
    ],
    tips: ['敲完笔记直接按 Ctrl+S（Mac 按 ⌘S）即可毫秒级落盘保存至目标目录。'],
    targetSelector: '[data-tour="editor-new-actions"]',
    pointerLabel: '极速新建笔记与多级目录入口',
    actionLabel: '弹出新建目录窗口试试',
    actionType: 'open_new_folder',
  },
  {
    id: 3,
    title: '默认优先预览 · 防误触学术排版',
    badge: '第 3 步 · 纯净阅读',
    summary:
      '点击已有笔记时，系统默认载入印刷级学术预览模式，文字、KaTeX 公式、代码块与表格清晰舒展，彻底防止翻阅讲义时手滑改乱！',
    checklist: [
      '点击已有笔记默认处于「预览模式」，顶部显示柔和状态提示条',
      '需要编辑时，点击提示条「切换写作模式」或右上角「修改笔记」即可落笔',
      '随时点击右上角预览/编辑切换按钮，在阅读与创作间无缝穿梭',
    ],
    tips: ['点击「新建」创建新笔记时会自动直接进入写作态，省去多余点击。'],
    targetSelector: '[data-tour="editor-preview-toggle"]',
    pointerLabel: '预览阅读 / 写作模式一键切换按钮',
    actionLabel: '切换预览与写作状态试试',
    actionType: 'toggle_preview',
  },
  {
    id: 4,
    title: '富文本与源码双模 · 中文打字丝滑流畅',
    badge: '第 4 步 · 双模写作',
    summary:
      '写作模式下默认开启直观「富文本」，像办公文档一样顺畅敲字、选区加粗与分段；偏爱极客手感也可一键切到带行号的原生「Markdown 源码」。',
    checklist: [
      '在「富文本」视图直接敲字换行，完美兼容中文输入法连续输入',
      '熟记排版加速键：Ctrl+B 粗体、Ctrl+I 斜体、Ctrl+1/2/3 各级标题、Tab 缩进',
      '点击工具栏左上角「源码」按钮，随时查看或精修底层 Markdown 语法',
    ],
    tips: ['面对空白纸张时，点击中下部任意空白处光标都会自动聚焦吸附至文末。'],
    targetSelector: '[data-tour="editor-mode-switcher"]',
    pointerLabel: '富文本与 Markdown 源码双向切换器',
    actionLabel: '切换富文本与源码视图',
    actionType: 'switch_mode',
  },
  {
    id: 5,
    title: 'Σ 考研公式速插 · 截图粘贴 · 随页批注',
    badge: '第 5 步 · 硬核排版',
    summary:
      '专为考研高数线代与 408 打造：点击 Σ 秒插定积分、极限、分块矩阵等公式模板；截图后直接 Ctrl+V 上传入文；更支持提笔在纸面上圈画重点！',
    checklist: [
      '点击工具栏 Σ 图标，从考研高频数学公式菜单一键插入 LaTeX 表达式',
      '截好真题配图或板书后，在编辑区直接按 Ctrl+V 秒速上传嵌入',
      '点击「提笔批注」拉起随页透明画层，用钢笔或荧光笔勾画关键推导条件',
      '点击「演草纸」唤出全屏白板，尽情列竖式或画二叉树草图',
    ],
    tips: ['行内公式用 $...$ 包裹，独立居中大公式块用 $$...$$ 包裹，实时 KaTeX 渲染。'],
    targetSelector: '[data-tour="editor-format-tools"]',
    pointerLabel: 'Σ 公式速插、插图、演草白板与随页批注栏',
    actionLabel: '展开 Σ 考研数学公式菜单',
    actionType: 'open_math',
  },
  {
    id: 6,
    title: '即学即练 3 题自检 & 双链知识织网',
    badge: '第 6 步 · 闭环吸收',
    summary:
      '记完笔记不测等于白记！点击顶栏「即学即练」让系统针对当前笔记生成 3 道配套真题当场检验；输入 [[考点名]] 更能把零散章节织成知识星网。',
    checklist: [
      '总结完核心定理后点击「即学即练」，当场完成 3 道靶向真题巩固',
      '点击工具栏「AI 润色」，让导师帮忙提炼摘要、梳理层级或精简表达',
      '正文中输入 [[关联笔记名]] 建立维基双链，预览态点击即可瞬间穿透跳转',
    ],
    tips: ['若点击的双链考点笔记尚未创建，系统会自动为你注入考纲标准模板草稿！'],
    targetSelector: '[data-tour="editor-practice-ai"]',
    pointerLabel: '即学即练真题测验与 AI 润色助手',
  },
  {
    id: 7,
    title: 'Obsidian 本地双向实时同步 · 资产永固',
    badge: '第 7 步 · 本地主权',
    summary:
      '所有笔记均以标准纯文本 .md 存储于你的独立目录中，与桌面 Obsidian 软件双向毫秒级监听同步——在这边保存那边立刻刷新，数据永远属于你自己！',
    checklist: [
      '查看顶栏「Obsidian 同步」绿色呼吸胶囊，实时展示知识库文档总数',
      '点击该同步胶囊可查看物理存储路径与一键导出备份说明',
      '导览圆满完成！随时可点顶栏「使用手册」查阅更多进阶排版技巧',
    ],
    tips: ['建议每周搭配「知识整理工作流」体检一次断链与标签，让图谱保持清爽。'],
    targetSelector: '[data-tour="editor-sync-pill"]',
    pointerLabel: 'Obsidian 本地双向同步状态胶囊',
    actionLabel: '打开笔记系统完整图文手册',
    actionType: 'open_manual',
  },
]

export interface EditorTourGuideProps {
  isOpen: boolean
  onClose: () => void
  onTogglePreview?: () => void
  onSwitchEditorMode?: (mode: 'write' | 'markdown') => void
  onOpenNewFolderModal?: () => void
  onOpenMathMenu?: () => void
  isCurrentPreview?: boolean
  currentEditorMode?: 'write' | 'markdown'
}

const TOUR_STORAGE_KEY = 'coreforge_editor_tour_dismissed'

export default function EditorTourGuide({
  isOpen,
  onClose,
  onTogglePreview,
  onSwitchEditorMode,
  onOpenNewFolderModal,
  onOpenMathMenu,
  currentEditorMode,
}: EditorTourGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showStepList, setShowStepList] = useState(false)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const step = EDITOR_TOUR_STEPS[currentStepIndex] || EDITOR_TOUR_STEPS[0]
  const isLastStep = currentStepIndex === EDITOR_TOUR_STEPS.length - 1

  const updateSpotlight = useCallback(() => {
    if (!isOpen || isMinimized || !step.targetSelector) {
      setSpotlightRect(null)
      return
    }
    const el = document.querySelector(step.targetSelector) as HTMLElement | null
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setSpotlightRect(rect)
        return
      }
    }
    setSpotlightRect(null)
  }, [isOpen, isMinimized, step.targetSelector])

  useEffect(() => {
    updateSpotlight()
    const timer = setTimeout(updateSpotlight, 150)
    window.addEventListener('resize', updateSpotlight)
    window.addEventListener('scroll', updateSpotlight, true)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateSpotlight)
      window.removeEventListener('scroll', updateSpotlight, true)
    }
  }, [updateSpotlight, currentStepIndex])

  // 支持左右方向键翻步（避开编辑器打字焦点）
  useEffect(() => {
    if (!isOpen || isMinimized) return
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (e.target as HTMLElement | null)?.isContentEditable
      ) {
        return
      }
      if (e.key === 'ArrowRight' && currentStepIndex < EDITOR_TOUR_STEPS.length - 1) {
        setCurrentStepIndex((p) => p + 1)
        setActionFeedback(null)
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        setCurrentStepIndex((p) => p - 1)
        setActionFeedback(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, isMinimized, currentStepIndex])

  if (!isOpen) return null

  const handleComplete = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    } catch {}
    onClose()
  }

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStepIndex((prev) => prev + 1)
      setActionFeedback(null)
      setShowStepList(false)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
      setActionFeedback(null)
      setShowStepList(false)
    }
  }

  const handlePerformAction = () => {
    switch (step.actionType) {
      case 'toggle_preview':
        onTogglePreview?.()
        setActionFeedback('已切换预览/写作模式，观察顶栏与纸张排版变化！')
        break
      case 'switch_mode':
        onSwitchEditorMode?.(currentEditorMode === 'write' ? 'markdown' : 'write')
        setActionFeedback('已切换富文本与 Markdown 源码视图，两种模式内容实时互通。')
        break
      case 'open_new_folder':
        onOpenNewFolderModal?.()
        setActionFeedback('已唤起新建目录窗口，可输入单级或多级学科路径。')
        break
      case 'open_math':
        onOpenMathMenu?.()
        setActionFeedback('已展开 Σ 考研数学公式速插面板，点击即可插入。')
        break
      case 'open_manual':
        window.dispatchEvent(
          new CustomEvent('open-user-guide', {
            detail: { tab: 'doc', category: 'system_collab', featureId: 'markdown-editor' },
          })
        )
        onClose()
        break
      default:
        break
    }
  }

  // 聚光指示层 2.0：柔光镂空遮罩 + 流光框
  const spotlightOverlay =
    spotlightRect && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[70] pointer-events-none">
            <svg className="fixed inset-0 w-full h-full" aria-hidden="true">
              <defs>
                <mask id="coreforge-editor-tour-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={Math.max(2, spotlightRect.left - 6)}
                    y={Math.max(2, spotlightRect.top - 6)}
                    width={spotlightRect.width + 12}
                    height={spotlightRect.height + 12}
                    rx="14"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(15, 23, 42, 0.16)"
                mask="url(#coreforge-editor-tour-mask)"
              />
            </svg>

            <div
              className="fixed rounded-2xl ring-2 ring-indigo-500 ring-offset-2 ring-offset-white/90 bg-indigo-500/10 shadow-[0_0_26px_rgba(99,102,241,0.45)] transition-all duration-200"
              style={{
                top: Math.max(2, spotlightRect.top - 5),
                left: Math.max(2, spotlightRect.left - 5),
                width: spotlightRect.width + 10,
                height: spotlightRect.height + 10,
              }}
            />

            {step.pointerLabel && (
              <div
                className="fixed px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-[11px] font-bold shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-indigo-400/50 transition-all duration-200 max-w-[calc(100vw-16px)] truncate"
                style={{
                  top:
                    spotlightRect.bottom + 40 < window.innerHeight
                      ? spotlightRect.bottom + 10
                      : Math.max(8, spotlightRect.top - 36),
                  left: Math.min(
                    Math.max(8, spotlightRect.left),
                    Math.max(8, window.innerWidth - 245)
                  ),
                }}
              >
                <Compass className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
                <span className="truncate">{step.pointerLabel}</span>
              </div>
            )}
          </div>,
          document.body
        )
      : null

  if (isMinimized) {
    return (
      <aside
        aria-label="笔记导览微型胶囊"
        className="fixed z-[75] bottom-4 right-4 sm:bottom-6 sm:right-6 animate-fade-in"
      >
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl hover:opacity-95 transition-all cursor-pointer font-sans text-xs border border-indigo-400/40 active:scale-95"
          title="展开笔记系统导览"
        >
          <img
            src="/pets/nailong_wave.webp"
            alt="笔记导览"
            className="w-5 h-5 rounded-full bg-white/90 object-contain shrink-0"
          />
          <span className="font-bold">
            笔记导览 ({currentStepIndex + 1}/{EDITOR_TOUR_STEPS.length})
          </span>
          <Maximize2 className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
        </button>
      </aside>
    )
  }

  const modalContent = (
    <>
      {spotlightOverlay}
      <aside
        aria-label="笔记系统手把手功能导览"
        className="fixed z-[75] bottom-3 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[420px] rounded-2xl sm:rounded-3xl bg-white/98 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.28)] overflow-hidden animate-fade-in font-sans text-slate-900 flex flex-col max-h-[85vh]"
      >
        {/* 头部标题与控制栏 */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <button
            type="button"
            onClick={() => setShowStepList((v) => !v)}
            className="flex items-center gap-2 min-w-0 hover:opacity-90 cursor-pointer text-left"
            title="点击展开 7 步目录"
          >
            <img
              src="/pets/nailong_focus.webp"
              alt="笔记助手"
              className="h-6 w-6 rounded-lg bg-white/95 p-0.5 object-contain shrink-0 ring-1 ring-amber-300/60"
            />
            <span className="text-xs font-extrabold text-white truncate flex items-center gap-1">
              <span>
                笔记专属导览 · 第 {step.id}/{EDITOR_TOUR_STEPS.length} 步
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-amber-300 transition-transform ${
                  showStepList ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </span>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('open-user-guide', {
                    detail: { tab: 'doc', category: 'system_collab', featureId: 'markdown-editor' },
                  })
                )
                onClose()
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold text-amber-200 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="查阅详细图文使用手册"
            >
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              <span>手册</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="收起为边角胶囊"
              aria-label="收起为边角胶囊"
            >
              <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleComplete}
              className="p-1 rounded-lg text-slate-300 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="退出笔记导览"
              aria-label="退出笔记导览"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 进度细条 */}
        <div className="h-1 w-full bg-slate-100 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${Math.round(((currentStepIndex + 1) / EDITOR_TOUR_STEPS.length) * 100)}%` }}
          />
        </div>

        {/* 可展开步骤目录 */}
        {showStepList && (
          <div className="border-b border-slate-200 bg-slate-50 p-2.5 space-y-1 max-h-48 overflow-y-auto overscroll-contain">
            <div className="px-1 pb-1 text-[10.5px] font-bold text-slate-500 flex items-center gap-1">
              <ListChecks className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>快速跳至任意步骤：</span>
            </div>
            {EDITOR_TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setCurrentStepIndex(idx)
                  setActionFeedback(null)
                  setShowStepList(false)
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between gap-2 cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200/70'
                }`}
              >
                <span className="truncate">
                  0{s.id} · {s.title}
                </span>
                <ArrowRight className="w-3 h-3 opacity-50 shrink-0" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}

        {/* 步骤主体内容 */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto overscroll-contain">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-md text-2xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-1">
              {step.badge}
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {step.title}
            </h4>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">{step.summary}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
            <div className="text-2xs font-extrabold text-slate-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span>核心操作要领：</span>
            </div>
            <div className="space-y-1.5 pl-0.5">
              {step.checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {step.tips.length > 0 && (
            <div className="text-[11px] text-amber-900 bg-amber-50/75 border border-amber-200/70 p-2.5 rounded-xl flex items-start gap-1.5 leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-extrabold">提效锦囊：</span>
                {step.tips.map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {actionFeedback && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-2xs font-semibold animate-fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{actionFeedback}</span>
            </div>
          )}
        </div>

        {/* 底部导航与快捷动作栏 */}
        <div className="border-t border-slate-100 p-3 bg-slate-50/90 flex flex-col gap-2 shrink-0">
          {step.actionLabel && (
            <button
              type="button"
              onClick={handlePerformAction}
              className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>{step.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" aria-hidden="true" />
              <span>上一步</span>
            </button>

            <div className="flex items-center gap-1">
              {EDITOR_TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setCurrentStepIndex(idx)
                    setActionFeedback(null)
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? 'w-5 bg-indigo-600'
                      : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={s.title}
                  aria-label={`跳至第 ${s.id} 步：${s.title}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>{isLastStep ? '完成导览 ✓' : '下一步'}</span>
              {!isLastStep && <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
