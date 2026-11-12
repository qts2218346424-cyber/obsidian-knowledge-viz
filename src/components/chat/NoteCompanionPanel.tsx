import { memo, useState, useEffect } from 'react'
import {
  FolderTree,
  BookOpen,
  X,
  Sparkles,
  Target,
  ListChecks,
  FileText,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import FileExplorer from '../FileExplorer'
import MarkdownRenderer from '../MarkdownRenderer'
import type { TreeNode, FileDetail } from '../../services/api'

interface NoteCompanionPanelProps {
  tree: TreeNode[]
  selectedNote: FileDetail | null
  onSelectNotePath: (path: string) => void
  onClearSelectedNote: () => void
  onQuickActionWithNote: (actionPrompt: string) => void
  onClosePanel: () => void
}

export const NoteCompanionPanel = memo(function NoteCompanionPanel({
  tree,
  selectedNote,
  onSelectNotePath,
  onClearSelectedNote,
  onQuickActionWithNote,
  onClosePanel,
}: NoteCompanionPanelProps) {
  const [activeTab, setActiveTab] = useState<'tree' | 'preview' | 'inspector'>('tree')

  // 当新选中一篇笔记时，自动切到「伴读预览」方便边看边问
  useEffect(() => {
    if (selectedNote) {
      setActiveTab('preview')
    }
  }, [selectedNote?.path])

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200/80 md:border md:rounded-xl overflow-hidden complex-panel-contain shadow-xs">
      {/* 顶部模式切换栏 */}
      <div className="px-2.5 py-2 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between gap-1.5 shrink-0">
        <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`flex-1 py-1 px-2 rounded-md text-2xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'tree'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-slate-700 shrink-0" />
            <span className="truncate">目录检索</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-1 px-2 rounded-md text-2xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-700 shrink-0" />
            <span className="truncate">伴读预览</span>
            {selectedNote && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inspector')}
            className={`flex-1 py-1 px-2 rounded-md text-2xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'inspector'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="font-mono text-xs">⚙️</span>
            <span className="truncate">参数检查</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClosePanel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title="收起知识库伴读栏"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 主体内容区：分支 1 目录检索 */}
      {activeTab === 'tree' && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {selectedNote && (
            <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 text-2xs text-slate-900 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="flex items-center gap-1.5 truncate font-semibold hover:underline cursor-pointer min-w-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">伴读中：{selectedNote.title || selectedNote.path}</span>
              </button>
              <button
                type="button"
                onClick={onClearSelectedNote}
                className="text-slate-400 hover:text-slate-800 shrink-0 cursor-pointer"
                title="取消关联该笔记"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <FileExplorer
              tree={tree}
              selectedPath={selectedNote?.path}
              onFileClick={path => onSelectNotePath(path)}
            />
          </div>
        </div>
      )}

      {/* 主体内容区：分支 2 考点参数检查器 (Subframe Screen 2 Inspector Replica) */}
      {activeTab === 'inspector' && (
        <div className="flex-1 min-h-0 flex flex-col p-3.5 bg-slate-50 overflow-y-auto space-y-3.5 text-2xs text-slate-600">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-semibold text-xs text-slate-900">Note Inspector (考点参数)</span>
            <span className="subframe-pill text-2xs">Subframe Spec</span>
          </div>

          <div>
            <div className="text-slate-400 text-2xs uppercase font-semibold mb-1">Hierarchy · 学科层级</div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 rounded bg-white border border-slate-200 truncate">
                <span className="text-2xs text-slate-400 block">主干学科</span>
                <span className="font-medium text-slate-900">{selectedNote?.path?.includes('408') ? '408 统考' : selectedNote?.path?.includes('数学') ? '考研数学' : '通识学科'}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200 truncate">
                <span className="text-2xs text-slate-400 block">分类目录</span>
                <span className="font-medium text-slate-900">{selectedNote?.path?.split('/')[1] || '专业课笔记'}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-2xs uppercase font-semibold mb-1">Exam Meta · 考纲定位</div>
            <div className="p-2 rounded bg-white border border-slate-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">考查频次</span>
                <span className="font-bold text-slate-900 font-mono">近 5 年 4 考 (高频)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">典型题型</span>
                <span className="font-medium text-slate-800">综合大题 · 13 分</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-2xs uppercase font-semibold mb-1">Status · 掌握度与复习</div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 rounded bg-white border border-slate-200 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-900 font-medium">已温习 3 次</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-slate-900 font-medium">错误率 15%</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-slate-400 text-2xs uppercase font-semibold mb-1">Wikilinks · 双链知识拓扑</div>
            <div className="p-2 rounded bg-white border border-slate-200 flex flex-wrap gap-1">
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs">[[核心定理]]</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs">[[真题陷阱]]</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs">[[快速排序]]</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onQuickActionWithNote('请结合此笔记的参数与考点，生成 3 道经典真题测验我：')}
            className="w-full mt-2 py-2 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-medium shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>基于参数即刻出题</span>
          </button>
        </div>
      )}

      {/* 主体内容区：分支 3 伴读笔记原文与发问 */}
      {activeTab === 'preview' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {selectedNote ? (
            <>
              {/* 笔记标题与一键伴学操作面板 */}
              <div className="p-2.5 border-b border-slate-200 bg-slate-50/70 space-y-2 shrink-0">
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tree')}
                    className="inline-flex items-center gap-1 text-2xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>换一篇</span>
                  </button>
                  <span className="subframe-pill text-2xs">
                    已挂载至 AI 上下文
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate" title={selectedNote.title || selectedNote.path}>
                      📄 {selectedNote.title || selectedNote.path.split('/').pop()}
                    </h4>
                    <p className="text-2xs text-slate-400 font-mono truncate mt-0.5">
                      {selectedNote.path}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClearSelectedNote}
                    className="text-2xs text-slate-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                    title="解除此笔记挂载"
                  >
                    解除挂载
                  </button>
                </div>

                {/* 3 个一键针对该笔记发问的快捷按钮 */}
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      onQuickActionWithNote(
                        `请结合当前挂载的知识库笔记《${selectedNote.title || selectedNote.path}》，为我深度精讲其中的核心考点、底层原理与统考命题陷阱。`
                      )
                    }
                    className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-2xs font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3 h-3 text-slate-700" />
                    <span>考点精讲</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onQuickActionWithNote(
                        `请依据当前挂载的知识库笔记《${selectedNote.title || selectedNote.path}》，现场命制 3 道考研真题难度的随堂测试题（附详细解析）。`
                      )
                    }
                    className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-2xs font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Target className="w-3 h-3 text-slate-700" />
                    <span>考我3道题</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onQuickActionWithNote(
                        `请帮我把当前挂载的知识库笔记《${selectedNote.title || selectedNote.path}》提炼为结构化考前背诵大纲、对比表格与速记口诀。`
                      )
                    }
                    className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-2xs font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <ListChecks className="w-3 h-3 text-slate-700" />
                    <span>提炼口诀</span>
                  </button>
                </div>
              </div>

              {/* 笔记正文 Markdown 渲染 */}
              <div className="flex-1 overflow-y-auto p-4 text-xs leading-relaxed text-slate-800 font-sans">
                <MarkdownRenderer content={selectedNote.content} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">尚未选择伴读笔记</p>
              <button
                type="button"
                onClick={() => setActiveTab('tree')}
                className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-2xs font-medium hover:bg-black transition-colors"
              >
                从目录中选择一篇笔记 →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default NoteCompanionPanel
