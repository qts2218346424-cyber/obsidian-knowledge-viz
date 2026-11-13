import { createPortal } from 'react-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Compass,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Minimize2,
  Maximize2,
  BookOpen,
  ArrowRight,
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
      '左侧展示你本地 Obsidian 知识库的全部文件夹与笔记。按学科专题分类折叠展开，支持搜索笔记，悬停在目录上还能直接进行新建操作。',
    checklist: [
      '点击文件夹可展开或收起子分类，点击笔记即可打开查看',
      '在顶部搜索框输入文字可秒速过滤匹配的笔记',
      '悬停在任意文件夹节点，点击右侧图标可直接在其中新建笔记或子目录',
    ],
    tips: ['手机端可在左下角点击抽屉按钮随时滑出或隐藏目录树，不占写作视窗。'],
    targetSelector: '[data-tour="editor-file-tree"]',
    pointerLabel: '左侧笔记目录树（点击笔记立即查看）',
  },
  {
    id: 2,
    title: '新建目录与笔记 · 灵活指定保存位置',
    badge: '第 2 步 · 组织归类',
    summary:
      '彻底解决了过去无法新建目录的痛点！点击「新建」极速开启笔记；点击「新建目录」可输入单级或多级路径（如“408数据结构/树”），还能在标题下方随心切换存放目录。',
    checklist: [
      '点击顶栏「新建目录」，输入目录名，支持一键创建多级嵌套文件夹',
      '点击「新建」开箱即写，标题下方会出现「存放目录」选择框，可自由挑选归档位置',
      '也可以点击「模板」选择“学习卡片”、“错题复盘”或“灵感速记”起点模版',
    ],
    tips: ['输入笔记标题和正文后，直接按 Ctrl+S 即可瞬间落盘保存到目标目录。'],
    targetSelector: '[data-tour="editor-new-actions"]',
    pointerLabel: '极速新建笔记与多级目录入口',
    actionLabel: '弹出新建目录窗口试试',
    actionType: 'open_new_folder',
  },
  {
    id: 3,
    title: '优先预览模式 · 防误触与高品质排版',
    badge: '第 3 步 · 阅读与写作',
    summary:
      '在目录树点击已有笔记，系统会优先为您载入高品质学术预览模式，文字、公式、表格、代码高亮一目了然，避免翻阅时手滑改乱；需要编辑时一键切换即可！',
    checklist: [
      '点击已有笔记默认进入「预览模式」，顶部展示模式提示横幅',
      '如需修改，点击横幅中的「切换写作模式」或右上方「修改笔记」按钮',
      '随时可点击右上角的眼睛/编辑图标在「预览」与「写作」之间无缝切换',
    ],
    tips: ['新建笔记时系统会自动直接进入写作状态，无需额外切换。'],
    targetSelector: '[data-tour="editor-preview-toggle"]',
    pointerLabel: '预览模式 / 切换写作模式核心按钮',
    actionLabel: '切换预览与写作模式',
    actionType: 'toggle_preview',
  },
  {
    id: 4,
    title: '富文本与源码双模式 · 打字流畅不丢失',
    badge: '第 4 步 · 顺畅打字',
    summary:
      '彻底修复了打字被重置的问题！写作模式下默认开启富文本，像 Word 一样直观打字、选区加粗、回车分段，输入法打字流畅；习惯 Markdown 的同学也能一键切到源码模式。',
    checklist: [
      '处于「富文本」时，直接在纸张上敲字、换行、粘贴文字，输入顺滑不卡顿',
      '支持键盘快捷键：Ctrl+B 粗体、Ctrl+I 斜体、Ctrl+1/2/3 设置大中小标题、Tab 缩进',
      '点击工具栏左上角的「源码」按钮，可随时查看并编辑底层的原生 Markdown 代码',
    ],
    tips: ['空白笔记时，点击纸张中下部任意空白区域，光标会自动吸附聚焦到末尾。'],
    targetSelector: '[data-tour="editor-mode-switcher"]',
    pointerLabel: '富文本与 Markdown 源码双向切换',
    actionLabel: '切换富文本与源码',
    actionType: 'switch_mode',
  },
  {
    id: 5,
    title: 'LaTeX 数学公式、插图与随页手写批注',
    badge: '第 5 步 · 考研排版利器',
    summary:
      '针对考研数学与 408 专门打造：点击 Σ 菜单秒插定积分/矩阵等公式；支持剪贴板截图直接 Ctrl+V 上传；还能直接在讲义页面上提笔画重点！',
    checklist: [
      '点击工具栏 Σ 按钮，弹出常用考研高数与线代公式模版，点击一键插入',
      '用截图软件截好题目或板书后，直接按 Ctrl+V 即可秒速上传并插入笔记',
      '点击「提笔批注」，正文上方会覆上透明画层，用钢笔或荧光笔勾画重点，随滚动保存',
      '点击「演草纸」可打开全屏草稿白板，平板支持触控笔压感演算',
    ],
    tips: ['公式在行内用 $...$ 包裹，居中大公式块用 $$...$$ 包裹，实时渲染 KaTeX 印刷级效果。'],
    targetSelector: '[data-tour="editor-format-tools"]',
    pointerLabel: '公式、插图、演草纸与就地手写批注工具栏',
    actionLabel: '弹出数学公式速插菜单',
    actionType: 'open_math',
  },
  {
    id: 6,
    title: '即学即练 & AI 润色 · 知识闭环吸收',
    badge: '第 6 步 · 提分巩固',
    summary:
      '做笔记不仅是记下来，更要真掌握！点击「即学即练」让系统根据当前笔记考点生成 3 道测验真题，写完立刻自检；AI 助手还能帮你梳理结构或生成摘要。',
    checklist: [
      '笔记梳理完成后，点击顶栏「即学即练」按钮，当场练习配套真题并核对解析',
      '点击工具栏「AI 润色」下拉菜单，可选择“润色表达”、“精简要点”、“整理结构”或“生成摘要”',
      '在笔记中键入 [[相关笔记名]] 可生成维基双链，点击可直接无缝穿透跳转',
    ],
    tips: ['如果双链指向的考点笔记尚未创建，点击后系统会自动为你生成大纲标准草稿！'],
    targetSelector: '[data-tour="editor-practice-ai"]',
    pointerLabel: '即学即练真题测验与 AI 润色助手',
  },
  {
    id: 7,
    title: '本地 Obsidian 实时双向同步 · 数据安全可控',
    badge: '第 7 步 · 本地落盘',
    summary:
      '你的所有笔记全部保存在自己电脑硬盘的 Obsidian 目录中。本系统与电脑上的 Obsidian 软件共用同一个知识库，一边保存另一边实时刷新，随时可带走。',
    checklist: [
      '观察顶栏的「Obsidian 同步」绿色呼吸指示胶囊，显示当前知识库总篇数',
      '点击该胶囊可查看本地物理存储路径以及双向同步状态说明',
      '所有笔记纯文本 Markdown 存储，杜绝任何商业格式锁定，安全放心',
    ],
    tips: ['随时点击顶栏的「使用手册」可查看图文并茂的完整操作说明书。'],
    targetSelector: '[data-tour="editor-sync-pill"]',
    pointerLabel: 'Obsidian 本地双向同步就绪状态',
    actionLabel: '查看完整使用手册',
    actionType: 'open_manual',
  },
]

interface EditorTourGuideProps {
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
  isCurrentPreview,
  currentEditorMode,
}: EditorTourGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)

  const step = EDITOR_TOUR_STEPS[currentStepIndex] || EDITOR_TOUR_STEPS[0]
  const isLastStep = currentStepIndex === EDITOR_TOUR_STEPS.length - 1

  // 追踪当前步骤目标元素位置
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

  if (!isOpen) return null

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStepIndex((prev) => prev + 1)
      setActionFeedback(null)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
      setActionFeedback(null)
    }
  }

  const handleComplete = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    } catch {}
    onClose()
  }

  const handlePerformAction = () => {
    switch (step.actionType) {
      case 'toggle_preview':
        onTogglePreview?.()
        setActionFeedback('已为您切换预览/写作状态，观察顶栏与纸张布局变化。')
        break
      case 'switch_mode':
        onSwitchEditorMode?.(currentEditorMode === 'write' ? 'markdown' : 'write')
        setActionFeedback('已切换富文本与源码模式，可以在两种视图间自由选择。')
        break
      case 'open_new_folder':
        onOpenNewFolderModal?.()
        setActionFeedback('已打开新建目录窗口，可以试着创建一级或多级目录。')
        break
      case 'open_math':
        onOpenMathMenu?.()
        setActionFeedback('已为您展开 LaTeX 数学公式速插菜单。')
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

  // 聚光指示层
  const spotlightOverlay =
    spotlightRect && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[70] pointer-events-none">
            {/* 目标高亮聚焦环 */}
            <div
              className="fixed rounded-xl ring-2 ring-indigo-500 ring-offset-2 ring-offset-white/80 bg-indigo-500/10 shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-all duration-200 animate-pulse"
              style={{
                top: Math.max(4, spotlightRect.top - 3),
                left: Math.max(4, spotlightRect.left - 3),
                width: spotlightRect.width + 6,
                height: spotlightRect.height + 6,
              }}
            />
            {/* 指向标签 */}
            {step.pointerLabel && (
              <div
                className="fixed px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-indigo-400/50 transition-all duration-200 max-w-[calc(100vw-16px)] truncate"
                style={{
                  top:
                    spotlightRect.bottom + 36 < window.innerHeight
                      ? spotlightRect.bottom + 8
                      : Math.max(8, spotlightRect.top - 32),
                  left: Math.min(
                    Math.max(8, spotlightRect.left),
                    Math.max(8, window.innerWidth - 240)
                  ),
                }}
              >
                <Compass className="w-3 h-3 text-amber-400 shrink-0" />
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
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all cursor-pointer font-sans text-xs border border-slate-700 active:scale-95"
          title="展开笔记功能导览"
        >
          <Compass className="h-4 w-4 text-amber-400 animate-spin-slow" />
          <span className="font-semibold">
            笔记导览 ({currentStepIndex + 1}/{EDITOR_TOUR_STEPS.length})
          </span>
          <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </aside>
    )
  }

  const modalContent = (
    <>
      {spotlightOverlay}
      <aside
        aria-label="笔记系统手把手功能导览"
        className="fixed z-[75] bottom-3 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[410px] rounded-2xl bg-white/98 backdrop-blur-md border border-slate-200/90 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.25)] overflow-hidden animate-fade-in font-sans text-slate-900 flex flex-col max-h-[85vh]"
      >
        {/* 头部标题与控制按钮 */}
        <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2.5 bg-slate-50/95 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs shrink-0">
              <Compass className="h-3.5 w-3.5 text-amber-300" />
            </span>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">
                笔记系统导览 · 第 {step.id}/{EDITOR_TOUR_STEPS.length} 步
              </span>
            </div>
          </div>

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
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
              title="查阅详细图文使用手册"
            >
              <BookOpen className="w-3 h-3" />
              <span>使用手册</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="最小化为边角浮标"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleComplete}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="退出导览"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 步骤主体内容 */}
        <div className="p-3.5 sm:p-4 space-y-3 overflow-y-auto overscroll-contain">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                {step.badge}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {step.title}
            </h4>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">{step.summary}</p>
          </div>

          {/* 重点要领清单 */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="text-2xs font-bold text-slate-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>核心要领与技巧：</span>
            </div>
            <div className="space-y-1 pl-1">
              {step.checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 顺手小窍门 */}
          {step.tips.length > 0 && (
            <div className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/70 p-2 rounded-lg flex items-start gap-1.5 leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">贴心小提示：</span>
                {step.tips.map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* 快捷操作反馈提示 */}
          {actionFeedback && (
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-2xs font-medium animate-fade-in flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{actionFeedback}</span>
            </div>
          )}
        </div>

        {/* 底部导航与快捷体验动作栏 */}
        <div className="border-t border-slate-100 p-3 bg-slate-50/90 flex flex-col gap-2 shrink-0">
          {step.actionLabel && (
            <button
              type="button"
              onClick={handlePerformAction}
              className="w-full py-1.5 px-3 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{step.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 inline mr-0.5" />
              <span>上一步</span>
            </button>

            {/* 步骤小圆点 */}
            <div className="flex items-center gap-1">
              {EDITOR_TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.id}
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
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span>{isLastStep ? '完成导览 ✓' : '下一步'}</span>
              {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
