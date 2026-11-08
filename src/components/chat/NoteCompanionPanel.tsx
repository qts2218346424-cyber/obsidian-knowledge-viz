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
  const [activeTab, setActiveTab] = useState<'tree' | 'preview'>('tree')

  // 当新选中一篇笔记时，自动切到「伴读预览」方便边看边问
  useEffect(() => {
    if (selectedNote) {
      setActiveTab('preview')
    }
  }, [selectedNote?.path])

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200/90 md:border md:rounded-2xl overflow-hidden complex-panel-contain shadow-2xs">
      {/* 顶部模式切换栏 */}
      <div className="px-2.5 py-2 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between gap-1.5 shrink-0">
        <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-xl flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'tree'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="truncate">目录检索</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">伴读预览</span>
            {selectedNote && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={onClosePanel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
          title="收起知识库伴读栏"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 主体内容区 */}
      {activeTab === 'tree' ? (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {selectedNote && (
            <div className="px-3 py-1.5 bg-amber-50/90 border-b border-amber-200/70 flex items-center justify-between gap-2 text-[11px] text-amber-900 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="flex items-center gap-1.5 truncate font-semibold hover:underline cursor-pointer min-w-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">伴读中：{selectedNote.title || selectedNote.path}</span>
              </button>
              <button
                type="button"
                onClick={onClearSelectedNote}
                className="text-amber-500 hover:text-amber-800 shrink-0 cursor-pointer"
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
      ) : (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {selectedNote ? (
            <>
              {/* 笔记标题与一键伴学操作面板 */}
              <div className="p-2.5 border-b border-slate-100 bg-gradient-to-b from-amber-50/50 to-white space-y-2 shrink-0">
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tree')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>换一篇</span>
                  </button>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold">
                    已挂载至 AI 上下文
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate" title={selectedNote.title || selectedNote.path}>
                      📄 {selectedNote.title || selectedNote.path.split('/').pop()}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                      {selectedNote.path}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClearSelectedNote}
                    className="text-[10px] text-slate-400 hover:text-red-500 px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
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
                    className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-indigo-50/90 hover:bg-indigo-100/90 border border-indigo-200/70 text-indigo-700 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>考点精讲</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onQuickActionWithNote(
                        `请依据当前挂载的知识库笔记《${selectedNote.title || selectedNote.path}》，现场命制 3 道考研真题难度的随堂测试题（附详细解析）。`
                      )
                    }
                    className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-orange-50/90 hover:bg-orange-100/90 border border-orange-200/70 text-orange-700 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <Target className="w-3 h-3 text-orange-600" />
                    <span>考我3道题</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onQuickActionWithNote(
                        `请帮我把当前挂载的知识库笔记《${selectedNote.title || selectedNote.path}》提炼为结构化考前背诵大纲、对比表格与速记口诀。`
                      )
                    }
                    className="flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/70 text-emerald-700 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <ListChecks className="w-3 h-3 text-emerald-600" />
                    <span>提炼口诀</span>
                  </button>
                </div>
              </div>

              {/* 笔记正文对照阅读区 */}
              <div className="flex-1 overflow-y-auto p-3 text-xs leading-relaxed bg-white">
                <MarkdownRenderer content={selectedNote.content} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-5 text-center">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">尚未选择伴读笔记</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                在目录中点击任意笔记，即可在此处对照阅读原文，并自动作为 AI 伴学上下文！
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('tree')}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
              >
                去目录选择笔记
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

export default NoteCompanionPanel
