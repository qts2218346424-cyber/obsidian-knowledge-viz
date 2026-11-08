import { useState, useRef, useEffect } from 'react'
import {
  X, Sparkles, Image as ImageIcon, Camera, Check, Loader2,
  FileText, Bookmark, Target, AlertCircle, ArrowUpRight,
  Bold, List, Sigma, CheckSquare
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

interface QuickNoteDrawerProps {
  isOpen: boolean
  onClose: () => void
  onNoteCreated?: (path: string, title: string) => void
}

const PRESET_TAGS = [
  { label: '408 · 计算机', value: '408, 计算机', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: '数学 · 高数', value: '考研数学, 高等数学', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: '数学 · 线代', value: '考研数学, 线性代数', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { label: '错题复盘', value: '错题, 待重做', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: '核心考点', value: '核心考点, 必背', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: '灵感速记', value: '灵感, 待整理', color: 'bg-purple-50 text-purple-700 border-purple-200' },
]

export default function QuickNoteDrawer({ isOpen, onClose, onNoteCreated }: QuickNoteDrawerProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTag, setSelectedTag] = useState('408, 计算机')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [successPath, setSuccessPath] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 当打开时自动初始化默认标题和聚焦
  useEffect(() => {
    if (isOpen) {
      const now = new Date()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hour = String(now.getHours()).padStart(2, '0')
      const min = String(now.getMinutes()).padStart(2, '0')
      setTitle(`考点速记_${month}${day}_${hour}${min}`)
      setContent('')
      setErrorMsg(null)
      setSuccessPath(null)

      setTimeout(() => {
        textareaRef.current?.focus()
      }, 150)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleInsertSnippet = (snippet: string) => {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = content.substring(start, end)
    const replacement = snippet.includes('${text}')
      ? snippet.replace('${text}', selected || '内容')
      : snippet
    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      el.focus()
      const newPos = start + replacement.length
      el.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]

    setUploadingImage(true)
    setErrorMsg(null)
    try {
      const res = await api.uploadAttachment(file, 'mobile_quick')
      const imgMd = `\n![${file.name.replace(/\.[^.]+$/, '')}](${res.url})\n`
      setContent(prev => prev ? `${prev}${imgMd}` : imgMd)
    } catch (err: any) {
      setErrorMsg(`插图上传失败: ${err.message}`)
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async (openFullEditor = false) => {
    const finalTitle = title.trim() || '未命名速记'
    const finalContent = content.trim()
    if (!finalContent && !uploadingImage) {
      setErrorMsg('请填写速记内容后再保存')
      return
    }

    setSaving(true)
    setErrorMsg(null)

    // 清理非法文件名字符
    const safeTitle = finalTitle.replace(/[/\\?%*:|"<>]/g, '_')
    const filePath = `wiki/${safeTitle}.md`

    try {
      const tagsArray = selectedTag
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const frontmatter: Record<string, unknown> = {
        title: finalTitle,
        tags: tagsArray,
        created: new Date().toISOString(),
        quick_note: true,
      }

      const noteText = `# ${finalTitle}\n\n${finalContent}`
      await api.createFile(filePath, noteText, frontmatter)

      setSuccessPath(filePath)
      // 派发全局笔记更新事件，让顶栏和仪表盘立即同步最新笔记数
      window.dispatchEvent(new CustomEvent('vault-notes-updated'))
      if (onNoteCreated) {
        onNoteCreated(filePath, finalTitle)
      }

      if (openFullEditor) {
        onClose()
        navigate(`/editor?path=${encodeURIComponent(filePath)}`)
      }
    } catch (err: any) {
      setErrorMsg(err.message || '保存失败，请检查网络或知识库连接')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-950/50 backdrop-blur-xs p-0 sm:p-4 modal-backdrop-contain">
      {/* 遮罩背景点击关闭 */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* 抽屉卡片主体 */}
      <div
        onClick={e => e.stopPropagation()}
        className="relative z-10 w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col max-h-[92dvh] animate-sheet-up overflow-hidden"
      >
        {/* 顶部手柄（手机端） */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* 顶栏 Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  随手记 · 极速入库
                </h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  即时同步 Obsidian
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                开箱即写，自动归纳至本地知识库并点亮知识图谱
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
            title="关闭速记"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容区 */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3.5 min-h-0">
          {/* 标题输入 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">速记标题</label>
              <button
                type="button"
                onClick={() => {
                  const now = new Date()
                  const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
                  setTitle(`考点随手记_${time}`)
                }}
                className="text-[10px] text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                重置为当前时间
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="请输入标题，例如：TCP拥塞控制四阶段"
              className="w-full text-sm font-medium bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none transition-all"
            />
          </div>

          {/* 快捷科目分类胶囊 */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">学科与类型标签</label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {PRESET_TAGS.map((t, idx) => {
                const active = selectedTag === t.value
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedTag(t.value)}
                    className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : `${t.color} hover:opacity-80`
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 正文输入 */}
          <div className="flex flex-col flex-1 min-h-[140px]">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">核心笔记正文</label>
              <span className="text-[10px] text-slate-400">支持 Markdown 与 LaTeX 公式</span>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="记录考点、推导心得、错因警示或随堂灵感...&#10;&#10;例如：&#10;- 快重传判定条件：收到 3 个重复 ACK&#10;- 拥塞窗口调整：ssthresh = cwnd / 2，cwnd = ssthresh"
              className="w-full flex-1 min-h-[140px] sm:min-h-[180px] p-3 text-sm leading-relaxed bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-slate-800 placeholder:text-slate-400 outline-none resize-none transition-all font-sans"
            />
          </div>

          {/* 快捷排版辅助按钮条 */}
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 text-slate-600">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handleInsertSnippet('**${text}**')}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors text-xs font-bold"
                title="加粗"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet('\n- ')}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors text-xs"
                title="无序列表"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet('\n- [ ] ')}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors text-xs"
                title="待办复习项"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSnippet(' $${text}$ ')}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors text-xs font-semibold"
                title="插入数学公式"
              >
                <Sigma className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 图片/拍照上传 */}
            <div className="flex items-center gap-1 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="手机拍照或相册插图"
              >
                {uploadingImage ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>{uploadingImage ? '上传中...' : '拍照 / 插图'}</span>
              </button>
            </div>
          </div>

          {/* 错误或成功提示 */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successPath && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2.5 animate-in fade-in shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>🎉 极速保存成功！已安全落盘至 Obsidian 知识库。</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    navigate(`/editor?path=${encodeURIComponent(successPath)}`)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>立即在编辑器查看该笔记</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('')
                    setContent('')
                    setSuccessPath(null)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 font-medium text-xs hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  继续记录
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 text-xs"
                >
                  关闭
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作条 */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving || !content.trim()}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 transition-colors disabled:opacity-40 cursor-pointer"
            title="保存并跳转到完整版富文本编辑器"
          >
            <span>完整编辑</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving || !content.trim()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在入库...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>⚡ 一键存入知识库</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
