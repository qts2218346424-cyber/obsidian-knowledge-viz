import { useAuth } from '../../contexts/AuthContext'
import { memo, useRef, useEffect, useState } from 'react'
import {
  Send,
  Coins,
  Square,
  Loader2,
  Image as ImageIcon,
  Paperclip,
  FileCode,
  FileText,
  Sparkles,
  RefreshCw,
  X,
  BookOpen,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import type { StudyAgent } from '../../data/studyAgents'
import type { StudySkill } from '../../data/studySkills'
import type { FileDetail, LocalSkill } from '../../services/api'
import type { AttachedFile } from '../../pages/Chat'

interface ChatComposerDockProps {
  input: string
  onInputChange: (val: string) => void
  onSend: (overridePrompt?: string, forceInterrupt?: boolean) => void
  onStop: () => void
  isCurrentRunning: boolean
  runningStatus?: string
  activeAgent: StudyAgent
  studyTone: 'rigorous' | 'vivid' | 'exam'
  onStudyToneChange: (tone: 'rigorous' | 'vivid' | 'exam') => void
  promptsList: string[]
  promptLabel: string
  promptTopic: string | null
  isRefreshingPrompts: boolean
  onRefreshPrompts: () => void
  onOpenStepTutor: () => void
  onToggleNotePanel: () => void
  selectedNote: FileDetail | null
  onClearSelectedNote: () => void
  activeSkill: StudySkill | null
  onClearActiveSkill: () => void
  selectedLocalSkill: LocalSkill | null
  onClearLocalSkill: () => void
  stagedImages: string[]
  onRemoveStagedImage: (idx: number) => void
  onPreviewImage: (url: string) => void
  stagedFiles: AttachedFile[]
  onRemoveStagedFile: (idx: number) => void
  uploadingFile: boolean
  onAddImages: (files: FileList | File[]) => void
  onAddGeneralFiles: (files: FileList | File[]) => void
  hideQuickPrompts?: boolean
  messageWidthClass?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const ChatComposerDock = memo(function ChatComposerDock({
  input,
  onInputChange,
  onSend,
  onStop,
  isCurrentRunning,
  runningStatus,
  activeAgent,
  studyTone,
  onStudyToneChange,
  promptsList,
  promptLabel,
  promptTopic,
  isRefreshingPrompts,
  onRefreshPrompts,
  onOpenStepTutor,
  onToggleNotePanel,
  selectedNote,
  onClearSelectedNote,
  activeSkill,
  onClearActiveSkill,
  selectedLocalSkill,
  onClearLocalSkill,
  stagedImages,
  onRemoveStagedImage,
  onPreviewImage,
  stagedFiles,
  onRemoveStagedFile,
  uploadingFile,
  onAddImages,
  onAddGeneralFiles,
  hideQuickPrompts = false,
  messageWidthClass = 'max-w-5xl',
}: ChatComposerDockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docFileInputRef = useRef<HTMLInputElement>(null)
  const { points, isAdmin } = useAuth()
  const [isExpandedEditor, setIsExpandedEditor] = useState(false)

  // 自动调节 Textarea 高度，舒展自然呼吸感
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    if (isExpandedEditor) {
      el.style.height = '200px'
      return
    }
    el.style.height = 'auto'
    const nextHeight = Math.min(Math.max(el.scrollHeight, 44), 160)
    el.style.height = `${nextHeight}px`
  }, [input, isExpandedEditor])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isCurrentRunning) {
        if (input.trim() || stagedImages.length > 0 || stagedFiles.length > 0) {
          onSend(undefined, true)
        }
      } else {
        onSend()
      }
    }
  }

  const hasContextPills = Boolean(
    selectedNote ||
      activeSkill ||
      selectedLocalSkill ||
      stagedImages.length > 0 ||
      stagedFiles.length > 0 ||
      uploadingFile
  )

  return (
    <div className="shrink-0 bg-gradient-to-t from-white via-white to-slate-50/40 pt-1">
      <div className={`${messageWidthClass} mx-auto w-full px-2.5 sm:px-6 pb-2.5 sm:pb-4`}>
        {/* 1. 运行状态实时横幅 */}
        {runningStatus && (
          <div className="mb-2 px-3.5 py-1.5 rounded-xl bg-amber-50/95 border border-amber-200/80 flex items-center justify-between gap-2 text-[11px] text-amber-800 shadow-2xs">
            <div className="flex items-center gap-2 truncate">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-orange shrink-0" />
              <span className="truncate font-medium">{runningStatus}</span>
            </div>
            <button
              type="button"
              onClick={onStop}
              className="px-2.5 py-0.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold shrink-0 cursor-pointer flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>停止生成</span>
            </button>
          </div>
        )}

        {/* 2. 对话展开后的轻量发散追问条（初始欢迎态自动隐藏，彻底杜绝重复堆砌） */}
        {!hideQuickPrompts && promptsList.length > 0 && (
          <div className="mb-2 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap no-scrollbar py-0.5">
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <span>{activeAgent.icon}</span>
                <span className="hidden sm:inline">{promptLabel}</span>
              </span>
              {promptTopic && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200/60 font-medium hidden md:inline shrink-0">
                  {promptTopic}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onRefreshPrompts}
              disabled={isCurrentRunning || isRefreshingPrompts}
              className="px-2 py-1 rounded-full text-[10.5px] font-medium text-slate-500 hover:text-indigo-600 bg-white border border-slate-200/80 hover:border-indigo-300 transition-all shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
              title="换一组发散考点"
            >
              <RefreshCw
                className={`w-2.5 h-2.5 ${
                  isRefreshingPrompts ? 'animate-spin text-indigo-600' : ''
                }`}
              />
              <span>换一批</span>
            </button>

            {promptsList.map((qp, i) => (
              <button
                key={`${i}-${qp.slice(0, 8)}`}
                type="button"
                onClick={() => onSend(qp)}
                disabled={isCurrentRunning}
                title={`点击直接提问：${qp}`}
                className="px-2.5 py-1 rounded-full text-[11px] text-slate-600 bg-white border border-slate-200/80 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/40 transition-all shrink-0 truncate max-w-[240px] sm:max-w-xs cursor-pointer active:scale-95"
              >
                {qp}
              </button>
            ))}
          </div>
        )}

        {/* 3. 一体化居中悬浮输入舱 (Smart Composer Box) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => {
            if (e.target.files?.length) {
              onAddImages(e.target.files)
              e.target.value = ''
            }
          }}
        />
        <input
          ref={docFileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => {
            if (e.target.files?.length) {
              onAddGeneralFiles(e.target.files)
              e.target.value = ''
            }
          }}
        />

        <div
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault()
            if (e.dataTransfer?.files?.length) {
              onAddGeneralFiles(e.dataTransfer.files)
            }
          }}
          className="rounded-2xl border border-slate-200/95 bg-white focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm overflow-hidden"
        >
          {/* 3.1 顶部已挂载上下文胶囊条（笔记伴读、激活技能、待发图片/文件） */}
          {hasContextPills && (
            <div className="px-3.5 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {selectedNote && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <button
                    type="button"
                    onClick={onToggleNotePanel}
                    className="truncate max-w-[180px] sm:max-w-[260px] hover:underline cursor-pointer text-left"
                    title="点击在伴读面板中查看笔记原文"
                  >
                    伴读：《{selectedNote.title || selectedNote.path.split('/').pop()}》
                  </button>
                  <button
                    type="button"
                    onClick={onClearSelectedNote}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-amber-200/70 text-amber-600 hover:text-amber-900 cursor-pointer"
                    title="移除笔记关联"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {activeSkill && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>
                    专项：{activeSkill.shortName} ({activeSkill.command})
                  </span>
                  <button
                    type="button"
                    onClick={onClearActiveSkill}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-purple-200/70 text-purple-600 hover:text-purple-900 cursor-pointer"
                    title="取消专项技能"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {selectedLocalSkill && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate max-w-[180px]">
                    本机技能：{selectedLocalSkill.displayName}
                  </span>
                  <button
                    type="button"
                    onClick={onClearLocalSkill}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-indigo-200/70 text-indigo-600 hover:text-indigo-900 cursor-pointer"
                    title="取消本机技能"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {uploadingFile && (
                <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-medium px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 animate-pulse shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>正在解析文档...</span>
                </div>
              )}

              {stagedImages.map((imgUrl, idx) => (
                <div key={`img-${idx}`} className="relative group shrink-0">
                  <img
                    src={imgUrl}
                    alt={`预览 ${idx + 1}`}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-300 shadow-2xs cursor-pointer hover:opacity-90"
                    onClick={() => onPreviewImage(imgUrl)}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveStagedImage(idx)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xs cursor-pointer"
                    title="移除图片"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              {stagedFiles.map((file, idx) => (
                <div
                  key={`file-${idx}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs shadow-2xs shrink-0"
                >
                  {file.ext &&
                  [
                    '.c',
                    '.cpp',
                    '.h',
                    '.hpp',
                    '.py',
                    '.java',
                    '.js',
                    '.ts',
                    '.html',
                    '.css',
                    '.sql',
                  ].includes(file.ext) ? (
                    <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                  <span className="truncate max-w-[130px] font-medium">{file.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveStagedFile(idx)}
                    className="p-0.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"
                    title="移除文件"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 3.2 多行自适应输入区 */}
          <div className="relative px-4 pt-3 pb-1.5 flex items-start gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={e => {
                if (e.clipboardData?.files?.length) {
                  e.preventDefault()
                  onAddGeneralFiles(e.clipboardData.files)
                }
              }}
              placeholder={
                selectedNote
                  ? `围绕伴读笔记《${selectedNote.title || selectedNote.path.split('/').pop()}》向 ${activeAgent.name} 提问（留空直接发送即可精讲全篇）...`
                  : `向 ${activeAgent.name}（${activeAgent.title}）提问 408 / 数学考点，或直接粘贴代码与真题...`
              }
              rows={1}
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden resize-none leading-relaxed py-0.5"
            />
            {(input.length > 60 || isExpandedEditor) && (
              <button
                type="button"
                onClick={() => setIsExpandedEditor(prev => !prev)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title={isExpandedEditor ? '收起大编辑框' : '展开大编辑框（适合长代码/题目）'}
              >
                {isExpandedEditor ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* 3.3 输入舱底栏：统一轻量工具组 + 柔和语调与发送 */}
          <div className="px-3 pb-2.5 pt-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="上传题目截图或手写推导照片"
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline text-xs">传图</span>
              </button>

              <button
                type="button"
                onClick={() => docFileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="上传 C/C++ 代码、Markdown 或 PDF 讲义"
              >
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline text-xs">附件</span>
              </button>

              <button
                type="button"
                onClick={onToggleNotePanel}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  selectedNote
                    ? 'bg-amber-50 text-amber-800 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title="关联或伴读知识库中的笔记"
              >
                <BookOpen
                  className={`w-3.5 h-3.5 ${selectedNote ? 'text-amber-600' : 'text-slate-400'}`}
                />
                <span className="hidden sm:inline text-xs">
                  {selectedNote ? '切换笔记' : '引用笔记'}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenStepTutor}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-indigo-700 hover:bg-indigo-50/70 transition-colors cursor-pointer"
                title="开启考研启发式分步推导辅导 (CoT)"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>分步辅导</span>
              </button>

              <span className="hidden lg:inline-block w-px h-3.5 bg-slate-200 mx-1" />

              {/* 桌面端轻量语调切换组 */}
              <div className="hidden lg:flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-xl">
                {(
                  [
                    { key: 'rigorous', label: '严谨' },
                    { key: 'vivid', label: '直观' },
                    { key: 'exam', label: '冲刺' },
                  ] as const
                ).map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => onStudyToneChange(t.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      studyTone === t.key
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={`切换作答风格为：${t.label}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 右侧：清空输入 + 快捷键提示 + 发送/停止按钮 */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* 伴学积分余额与单次扣除提示 */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-checkin-modal'))}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                title="单次提问消耗 0.1 积分 · 每日签到免费领 1 积分"
              >
                <Coins className="w-3 h-3 text-amber-600" />
                <span className="font-mono font-bold">{points.toFixed(1)}</span>
                <span className="text-[10px] text-amber-700">分 (-0.1/次)</span>
              </button>
              {input.length > 0 && (
                <button
                  type="button"
                  onClick={() => onInputChange('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                  title="清空输入框"
                >
                  清空
                </button>
              )}

              <span className="hidden xl:inline text-[11px] text-slate-400 select-none">
                Enter 发送
              </span>

              {isCurrentRunning ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onStop}
                    className="h-8 px-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                    title="停止当前会话生成"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>停止</span>
                  </button>
                  {(input.trim() || stagedImages.length > 0 || stagedFiles.length > 0) && (
                    <button
                      type="button"
                      onClick={() => onSend(undefined, true)}
                      className="h-8 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                      title="打断当前回答并立即发送新问题"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>抢发</span>
                    </button>
                  )}
                </div>
              ) : (!isAdmin && points < 0.1) ? (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-checkin-modal'))}
                  className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer animate-pulse"
                  title="伴学积分不足（单次需 0.1 积分），点击每日签到免费领取"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>积分不足 · 去签到</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSend()}
                  disabled={
                    !input.trim() &&
                    !selectedNote &&
                    stagedImages.length === 0 &&
                    stagedFiles.length === 0
                  }
                  className="h-8 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>发送</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ChatComposerDock
