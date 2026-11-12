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
import type { AttachedFile } from '../../features/ai-chat/types'

interface ChatComposerDockProps {
  input: string
  onInputChange: (val: string) => void
  onSend: (overridePrompt?: string, forceInterrupt?: boolean) => void
  onStop: () => void
  isCurrentRunning: boolean
  runningStatus?: string
  activeAgent: StudyAgent
  studyTone: 'rigorous' | 'vivid' | 'exam' | 'followup'
  onStudyToneChange: (tone: 'rigorous' | 'vivid' | 'exam' | 'followup') => void
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

  // 自动调节 Textarea 高度：移动端 26px 极简紧凑启动，根据实际打字动态长高与即时收缩归位
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    if (isExpandedEditor) {
      el.style.height = '180px'
      return
    }
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const minHeight = isMobile ? 20 : 28
    const maxHeight = isMobile ? 110 : 150

    // 当输入为空或空白字符时，瞬间强制重置归位为极简单行高度，杜绝多余高度滞留
    if (!input || !input.trim()) {
      el.style.height = `${minHeight}px`
      return
    }

    // 动态重置高度为 auto 后，根据实际文本内容精确测量 scrollHeight，随着字数增加自动长高，随着文字删除自动收缩
    el.style.height = 'auto'
    const scrollH = el.scrollHeight
    const nextHeight = Math.min(Math.max(scrollH, minHeight), maxHeight)
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
    <div className="shrink-0 bg-gradient-to-t from-white via-white to-slate-50/40 pt-0 sm:pt-1">
      <div className={`${messageWidthClass} mx-auto w-full px-1.5 sm:px-6 pb-0.5 sm:pb-2.5`}>
        {/* 1. 运行状态实时横幅 */}
        {runningStatus && (
          <div className="mb-2 px-3.5 py-1.5 rounded-xl bg-amber-50/95 border border-amber-200/80 flex items-center justify-between gap-2 text-2xs text-amber-800 shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-orange shrink-0" />
              <span className="truncate font-medium">{runningStatus}</span>
            </div>
            <button
              type="button"
              onClick={onStop}
              className="px-2.5 py-0.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-2xs font-bold shrink-0 cursor-pointer flex items-center gap-1 transition-colors shadow-xs"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>停止生成</span>
            </button>
          </div>
        )}

        {/* 2. 对话展开后的轻量发散追问条（移动端微缩紧凑） */}
        {!hideQuickPrompts && promptsList.length > 0 && (
          <div className="mb-0.5 sm:mb-1.5 flex items-center gap-1 sm:gap-1.5 overflow-x-auto whitespace-nowrap no-scrollbar py-0.2 sm:py-0.5">
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-2xs font-semibold text-slate-500 flex items-center gap-1">
                <span>{activeAgent.icon}</span>
                <span className="hidden sm:inline">{promptLabel}</span>
              </span>
              {promptTopic && (
                <span className="text-2xs px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200/60 font-medium hidden md:inline shrink-0">
                  {promptTopic}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onRefreshPrompts}
              disabled={isCurrentRunning || isRefreshingPrompts}
              className="px-2 py-1 rounded-full text-2xs font-medium text-slate-500 hover:text-indigo-600 bg-white border border-slate-200/80 hover:border-indigo-300 transition-all shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
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
                className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-2xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all shrink-0 truncate max-w-[200px] sm:max-w-xs cursor-pointer active:scale-95 shadow-xs"
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
        {/* 显式支持文档/讲义/代码文件，确保在 Android/iOS 系统上准确弹出【文件管理/文档】而非纯相册 */}
        <input
          ref={docFileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md,.markdown,.c,.cpp,.h,.hpp,.java,.py,.json,.csv,.zip,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
          className="rounded-2xl border border-slate-200/70 bg-white focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          {/* 3.1 顶部已挂载上下文胶囊条（笔记伴读、激活技能、待发图片/文件） */}
          {hasContextPills && (
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
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
                    自带技能：{selectedLocalSkill.displayName}
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
                    className="w-10 h-10 object-cover rounded-lg border border-slate-300 shadow-xs cursor-pointer hover:opacity-90"
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs shadow-xs shrink-0"
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
                  <span className="text-2xs text-slate-400 font-mono">
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

          {/* 3.2 多行自适应输入区 (超轻量微缩自适应：打字字体缩小，纵向高度更低) */}
          <div className="relative px-2 sm:px-3 pt-0.5 sm:pt-1.5 pb-0 flex items-start gap-1 sm:gap-1.5">
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
                studyTone === 'followup'
                  ? '🎯 追问模式：输入您的具体疑问、卡壳细节或推导困惑（AI针对性解答，拒绝笼统套话）...'
                  : selectedNote
                  ? `围绕《${selectedNote.title || selectedNote.path.split('/').pop()}》提问...`
                  : `向 ${activeAgent.name} 提问，或粘贴题目...`
              }
              rows={1}
              className="flex-1 bg-transparent border-none text-2xs sm:text-xs text-slate-800 placeholder-slate-400 placeholder:text-2xs sm:placeholder:text-xs focus:outline-hidden resize-none leading-[1.38] sm:leading-[1.45] py-0 tracking-tight"
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

          {/* 3.3 输入舱底栏：统一轻量工具组 + 柔和语调与发送 (轻量微缩贴底) */}
          <div className="px-1.5 sm:px-3 pb-0.5 sm:pb-1.5 pt-0.5 flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-0.5 sm:gap-1 shrink min-w-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded-md sm:rounded-xl text-2xs sm:text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="上传题目截图或手写推导照片"
              >
                <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                <span className="text-2xs sm:text-xs">传图</span>
              </button>

              <button
                type="button"
                onClick={() => docFileInputRef.current?.click()}
                className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded-md sm:rounded-xl text-2xs sm:text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="上传 PDF 讲义、Word、Markdown 文档或代码文件"
              >
                <Paperclip className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                <span className="text-2xs sm:text-xs font-bold text-indigo-700 sm:font-medium sm:text-slate-600">文件</span>
              </button>

              <button
                type="button"
                onClick={onToggleNotePanel}
                className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded-md sm:rounded-xl text-2xs sm:text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedNote
                    ? 'bg-amber-50 text-amber-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="关联或伴读知识库中的笔记"
              >
                <BookOpen
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${selectedNote ? 'text-amber-600' : 'text-slate-500'}`}
                />
                <span className="hidden xs:inline text-2xs sm:text-xs">
                  {selectedNote ? '换笔记' : '笔记'}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenStepTutor}
                className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1.5 rounded-md sm:rounded-xl text-2xs sm:text-xs font-medium text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/70 transition-colors cursor-pointer shrink-0"
                title="开启考研启发式分步推导辅导 (CoT)"
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">分步辅导</span>
              </button>

              <span className="hidden lg:inline-block w-px h-3.5 bg-slate-200 mx-1" />

              {/* 桌面端轻量语调切换组 */}
              <div className="hidden lg:flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-xl">
                {(
                  [
                    { key: 'rigorous', label: '严谨' },
                    { key: 'vivid', label: '直观' },
                    { key: 'exam', label: '冲刺' },
                    { key: 'followup', label: '🎯追问' },
                  ] as const
                ).map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => onStudyToneChange(t.key)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-2xs font-medium transition-all cursor-pointer ${
                      studyTone === t.key
                        ? t.key === 'followup'
                          ? 'bg-amber-500 text-white shadow-xs font-bold'
                          : 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={t.key === 'followup' ? '切换为：🎯追问模式（针对性解答疑问，拒绝笼统套话）' : `切换作答风格为：${t.label}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 右侧：清空输入 + 快捷键提示 + 发送/停止按钮 (移动端不折行) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* 伴学积分余额 */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-checkin-modal'))}
                className="inline-flex items-center gap-0.5 text-2xs sm:text-2xs px-1 sm:px-2 py-0.5 rounded-md border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                title="单次提问消耗 0.1 积分 · 每日签到免费领 1 积分"
              >
                <Coins className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
                <span className="font-mono font-bold">{points.toFixed(1)}</span>
                <span className="hidden sm:inline text-2xs text-amber-700">分 (-0.1/次)</span>
              </button>
              {input.length > 0 && (
                <button
                  type="button"
                  onClick={() => onInputChange('')}
                  className="text-2xs sm:text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5 rounded hover:bg-slate-100 cursor-pointer"
                  title="清空输入框"
                >
                  清空
                </button>
              )}

              <span className="hidden xl:inline text-2xs text-slate-400 select-none">
                Enter 发送
              </span>

              {isCurrentRunning ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onStop}
                    className="h-6 sm:h-8 px-2 sm:px-3.5 rounded-md sm:rounded-xl bg-red-500 hover:bg-red-600 text-white text-2xs sm:text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-0.5 sm:gap-1"
                    title="停止当前会话生成"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>停止</span>
                  </button>
                  {(input.trim() || stagedImages.length > 0 || stagedFiles.length > 0) && (
                    <button
                      type="button"
                      onClick={() => onSend(undefined, true)}
                      className="h-6 sm:h-8 px-2 sm:px-4 rounded-md sm:rounded-lg bg-slate-900 hover:bg-black text-white text-2xs sm:text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-0.5 sm:gap-1"
                      title="打断当前回答并立即发送新问题"
                    >
                      <Send className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                      <span>抢发</span>
                    </button>
                  )}
                </div>
              ) : (!isAdmin && points < 0.1) ? (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-checkin-modal'))}
                  className="h-6 sm:h-8 px-2 sm:px-3 rounded-md sm:rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-2xs sm:text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer animate-pulse"
                  title="伴学积分不足（单次需 0.1 积分），点击每日签到免费领取"
                >
                  <Coins className="w-3 h-3" />
                  <span>领分</span>
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
                  className="h-6.5 sm:h-8 px-2.5 sm:px-4 rounded-md sm:rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-2xs sm:text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-95 flex items-center gap-1"
                >
                  <Send className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
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
