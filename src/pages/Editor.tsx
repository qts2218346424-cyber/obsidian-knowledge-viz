import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Save, Trash2, FileEdit, FilePlus, Upload,
  ChevronDown, ChevronRight, X, Loader2, AlertTriangle,
  FolderTree, Eye, Bold, Italic, Heading, List, Code,
  Link, Table, Hash
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { api, type FileDetail, type IngestStatus, type IngestResult } from '../services/api'
import { useVaultTree } from '../hooks/useVaultData'
import FileExplorer from '../components/FileExplorer'

// ─── Toolbar Helpers ──────────────────────────────────────────────────────────

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  content: string,
  setContent: (v: string) => void,
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.substring(start, end)
  const replacement = before + (selected || 'text') + after
  const newContent = content.substring(0, start) + replacement + content.substring(end)
  setContent(newContent)
  // Set cursor position after the inserted text
  setTimeout(() => {
    textarea.focus()
    const cursorPos = start + before.length + (selected || 'text').length
    textarea.setSelectionRange(cursorPos, cursorPos)
  }, 0)
}

function insertAtLine(
  textarea: HTMLTextAreaElement,
  prefix: string,
  content: string,
  setContent: (v: string) => void,
) {
  const start = textarea.selectionStart
  // Find the beginning of the current line
  const lineStart = content.lastIndexOf('\n', start - 1) + 1
  const newContent = content.substring(0, lineStart) + prefix + content.substring(lineStart)
  setContent(newContent)
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + prefix.length, start + prefix.length)
  }, 0)
}

function insertBlock(
  textarea: HTMLTextAreaElement,
  block: string,
  content: string,
  setContent: (v: string) => void,
) {
  const start = textarea.selectionStart
  const before = content.substring(0, start)
  const after = content.substring(start)
  const needNewline = before.length > 0 && !before.endsWith('\n\n')
    ? before.endsWith('\n') ? '\n' : '\n\n'
    : ''
  const newContent = before + needNewline + block + '\n' + after
  setContent(newContent)
  setTimeout(() => {
    textarea.focus()
  }, 0)
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Editor() {
  const [currentFile, setCurrentFile] = useState<FileDetail | null>(null)
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [tags, setTags] = useState('')
  const [title, setTitle] = useState('')
  const [showFm, setShowFm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [dirty, setDirty] = useState(false)
  const [showFiles, setShowFiles] = useState(true)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [newFilePath, setNewFilePath] = useState('')
  const [newFileName, setNewFileName] = useState('')
  const [renamePath, setRenamePath] = useState('')

  // Import state
  const [ingestStatus, setIngestStatus] = useState<IngestStatus | null>(null)
  const [importing, setImporting] = useState(false)
  const [, setImportResult] = useState<IngestResult | null>(null)
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag & drop
  const [dragOver, setDragOver] = useState(false)
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null)

  // Preview
  const [showPreview, setShowPreview] = useState(true)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { tree } = useVaultTree()

  // Load ingest status
  useEffect(() => {
    api.getIngestStatus().then(setIngestStatus).catch(() => {})
  }, [])

  // Track dirty state
  useEffect(() => {
    setDirty(content !== originalContent || tags !== (currentFile?.tags.join(', ') || '') || title !== (currentFile?.title || ''))
  }, [content, originalContent, tags, title, currentFile])

  // Check URL params for file to open (from graph click)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const filePath = params.get('path')
    if (filePath) {
      loadFile(filePath)
      // Clean URL
      window.history.replaceState({}, '', '/editor')
    }
  }, [])

  const loadFile = useCallback(async (filePath: string) => {
    try {
      const note = await api.getFile(filePath)
      setCurrentFile(note)
      setContent(note.content)
      setOriginalContent(note.content)
      setTags(note.tags.join(', '))
      setTitle(note.title)
      setSaveMsg('')
      setImportResult(null)
    } catch {
      setSaveMsg('Failed to load file')
    }
  }, [])

  const handleFileClick = (filePath: string) => {
    loadFile(filePath)
  }

  const handleSave = async () => {
    if (!currentFile) {
      if (!newFilePath) return
      setSaving(true)
      try {
        const fm = buildFrontmatter()
        const note = await api.createFile(newFilePath, content, fm)
        setCurrentFile(note)
        setOriginalContent(content)
        setSaveMsg('Created!')
        setShowNewDialog(false)
        setNewFilePath('')
        setNewFileName('')
      } catch (err: any) {
        setSaveMsg(`Error: ${err.message}`)
      } finally {
        setSaving(false)
      }
      return
    }

    setSaving(true)
    try {
      const fm = buildFrontmatter()
      const note = await api.updateFile(currentFile.path, content, fm)
      setCurrentFile(note)
      setOriginalContent(content)
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 2000)
    } catch (err: any) {
      setSaveMsg(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!currentFile) return
    try {
      await api.deleteFile(currentFile.path)
      setCurrentFile(null)
      setContent('')
      setOriginalContent('')
      setTags('')
      setTitle('')
      setSaveMsg('已移入回收站')
      setShowDeleteConfirm(false)
    } catch (err: any) {
      setSaveMsg(`Delete error: ${err.message}`)
    }
  }

  const handleRename = async () => {
    if (!currentFile || !renamePath) return
    try {
      const result = await api.renameFile(currentFile.path, renamePath)
      setSaveMsg(`Renamed! ${result.linksUpdated > 0 ? `Updated ${result.linksUpdated} links.` : ''}`)
      await loadFile(result.newPath)
      setShowRenameDialog(false)
      setRenamePath('')
    } catch (err: any) {
      setSaveMsg(`Rename error: ${err.message}`)
    }
  }

  const handleImportFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    setImporting(true)
    setImportError('')
    setImportResult(null)
    setBatchProgress({ done: 0, total: fileArray.length })

    const results = await Promise.allSettled(
      fileArray.map(async (file) => {
        const result = await api.uploadFile(file)
        setBatchProgress(prev => prev ? { ...prev, done: prev.done + 1 } : null)
        return result
      })
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').map(r => (r as PromiseFulfilledResult<IngestResult>).value)
    const failed = results.filter(r => r.status === 'rejected').length

    if (succeeded.length > 0) {
      setImportResult(succeeded[0])
      await loadFile(succeeded[0].markdownPath)
      setSaveMsg(`导入完成: ${succeeded.length} 成功${failed > 0 ? `, ${failed} 失败` : ''}`)
    } else {
      setImportError('All imports failed')
    }

    setImporting(false)
    setBatchProgress(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleImportFiles(e.target.files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleImportFiles(e.dataTransfer.files)
    }
  }

  const handleNewFile = () => {
    setCurrentFile(null)
    setContent('# New Note\n\nStart writing here...\n')
    setOriginalContent('')
    setTags('')
    setTitle('')
    setShowNewDialog(true)
    setNewFilePath('')
    setNewFileName('')
    setSaveMsg('')
  }

  const buildFrontmatter = (): Record<string, unknown> => {
    const fm: Record<string, unknown> = {}
    if (title) fm.title = title
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
    if (tagList.length > 0) fm.tags = tagList
    return fm
  }

  // ─── Formatting Actions ─────────────────────────────────────────────────────

  const ta = () => textareaRef.current
  const fmt = {
    bold: () => ta() && insertAtCursor(ta()!, '**', '**', content, setContent),
    italic: () => ta() && insertAtCursor(ta()!, '*', '*', content, setContent),
    h1: () => ta() && insertAtLine(ta()!, '# ', content, setContent),
    h2: () => ta() && insertAtLine(ta()!, '## ', content, setContent),
    h3: () => ta() && insertAtLine(ta()!, '### ', content, setContent),
    list: () => ta() && insertAtLine(ta()!, '- ', content, setContent),
    code: () => ta() && insertBlock(ta()!, '```\ncode here\n```', content, setContent),
    link: () => ta() && insertAtCursor(ta()!, '[', '](url)', content, setContent),
    wiki: () => ta() && insertAtCursor(ta()!, '[[', ']]', content, setContent),
    table: () => ta() && insertBlock(ta()!, '| Col 1 | Col 2 | Col 3 |\n|-------|-------|-------|\n| cell  | cell  | cell  |', content, setContent),
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault(); handleSave()
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault(); fmt.bold()
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault(); fmt.italic()
    } else if ((e.ctrlKey || e.metaKey) && e.key === '1') {
      e.preventDefault(); fmt.h1()
    } else if ((e.ctrlKey || e.metaKey) && e.key === '2') {
      e.preventDefault(); fmt.h2()
    } else if ((e.ctrlKey || e.metaKey) && e.key === '3') {
      e.preventDefault(); fmt.h3()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const el = ta()
      if (el) {
        const start = el.selectionStart
        const newContent = content.substring(0, start) + '  ' + content.substring(el.selectionEnd)
        setContent(newContent)
        setTimeout(() => { el.selectionStart = el.selectionEnd = start + 2 }, 0)
      }
    }
  }

  // Line numbers
  const lineCount = content.split('\n').length

  return (
    <div
      className="h-full flex gap-0"
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* File Explorer Sidebar */}
      <div className={`shrink-0 transition-all duration-200 ${showFiles ? 'w-56' : 'w-0'} overflow-hidden border-r border-slate-800`}>
        <FileExplorer tree={tree} onFileClick={handleFileClick} />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar: File operations */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <button onClick={() => setShowFiles(!showFiles)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${showFiles ? 'bg-slate-800 text-slate-300' : 'text-slate-500 hover:text-slate-300'}`}
            title="Toggle file explorer">
            <FolderTree className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-slate-800" />
          <button onClick={handleNewFile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
            <FilePlus className="w-3.5 h-3.5" /> 新建
          </button>
          <button onClick={handleSave} disabled={saving || (!dirty && !!currentFile)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} 保存
          </button>
          {currentFile && (
            <>
              <button onClick={() => setShowRenameDialog(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
                <FileEdit className="w-3.5 h-3.5" /> 重命名
              </button>
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> 删除
              </button>
            </>
          )}
          <div className="w-px h-5 bg-slate-800" />
          {/* Import */}
          <div className="relative">
            <input ref={fileInputRef} type="file" multiple
              accept={ingestStatus?.supportedFormats?.join(',') || '.pdf,.docx,.xlsx,.pptx,.html,.csv'}
              onChange={handleImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={importing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-40 transition-colors">
              {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              导入{importing && batchProgress ? ` (${batchProgress.done}/${batchProgress.total})` : ''}
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {saveMsg && (
              <div className={`text-xs px-2 py-1 rounded-lg ${saveMsg.startsWith('Error') || saveMsg.includes('error') ? 'text-rose-400 bg-rose-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                {saveMsg}
              </div>
            )}
            {dirty && (
              <div className="text-xs text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 未保存
              </div>
            )}
            <button onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${showPreview ? 'bg-slate-800 text-slate-300' : 'text-slate-500 hover:text-slate-300'}`}>
              <Eye className="w-3.5 h-3.5" /> 预览
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-slate-800 bg-slate-900/50 shrink-0">
          <ToolBtn icon={Bold} label="粗体 (Ctrl+B)" onClick={fmt.bold} />
          <ToolBtn icon={Italic} label="斜体 (Ctrl+I)" onClick={fmt.italic} />
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <ToolBtn icon={Heading} label="H1 (Ctrl+1)" onClick={fmt.h1} />
          <ToolBtn icon={Heading} label="H2 (Ctrl+2)" onClick={fmt.h2} className="!text-[10px]" suffix="2" />
          <ToolBtn icon={Heading} label="H3 (Ctrl+3)" onClick={fmt.h3} className="!text-[9px]" suffix="3" />
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <ToolBtn icon={List} label="无序列表" onClick={fmt.list} />
          <ToolBtn icon={Code} label="代码块" onClick={fmt.code} />
          <ToolBtn icon={Link} label="链接" onClick={fmt.link} />
          <ToolBtn icon={Hash} label="Wiki链接" onClick={fmt.wiki} />
          <ToolBtn icon={Table} label="表格" onClick={fmt.table} />
        </div>

        {/* Import status bar */}
        {ingestStatus && (
          <div className="px-4 py-1 border-b border-slate-800 bg-slate-900/30 text-[10px] text-slate-500 flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${ingestStatus.installed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            markitdown: {ingestStatus.installed ? `已安装 (${ingestStatus.pythonVersion})` : '未安装 — 拖拽文件到此处导入'}
            {importError && <span className="text-rose-400 ml-2">{importError}</span>}
          </div>
        )}

        {/* Editor + Preview */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Drag overlay */}
          {dragOver && (
            <div className="absolute inset-0 z-40 bg-violet-500/10 border-2 border-dashed border-violet-500 rounded-lg flex items-center justify-center pointer-events-none">
              <div className="text-lg font-semibold text-violet-400 bg-slate-900/90 px-6 py-3 rounded-xl">
                松开导入文档
              </div>
            </div>
          )}

          {/* Editor Panel with line numbers */}
          <div className={`flex-1 flex flex-col overflow-hidden ${showPreview ? 'border-r border-slate-800' : ''}`}>
            {currentFile && (
              <div className="px-4 py-1.5 border-b border-slate-800 bg-slate-900/30 flex items-center gap-3 text-[11px] text-slate-500">
                <span className="font-mono text-slate-400">{currentFile.path}</span>
                <span>{currentFile.wordCount} words</span>
                <span>{currentFile.links.length} links</span>
                <span>{new Date(currentFile.modified).toLocaleDateString('zh-CN')}</span>
              </div>
            )}

            {/* Frontmatter editor */}
            <div className="border-b border-slate-800">
              <button onClick={() => setShowFm(!showFm)}
                className="w-full flex items-center gap-2 px-4 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
                {showFm ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                Frontmatter
              </button>
              {showFm && (
                <div className="px-4 pb-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-500 w-12 shrink-0">Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-violet-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-500 w-12 shrink-0">Tags</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-violet-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Textarea with line numbers */}
            <div className="flex-1 flex overflow-hidden">
              {/* Line numbers */}
              <div className="w-10 shrink-0 bg-slate-900/50 border-r border-slate-800 overflow-hidden select-none">
                <div className="py-3 pr-2 text-right">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i} className="text-[11px] leading-relaxed text-slate-600 font-mono" style={{ height: '1.625em' }}>
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={showNewDialog ? 'Enter content for new note...' : 'Select a file from the sidebar to edit, or create a new one...'}
                className="flex-1 bg-transparent text-sm text-slate-200 py-3 px-4 resize-none outline-none font-mono leading-relaxed placeholder-slate-600"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Preview Panel — Professional Markdown Rendering */}
          {showPreview && (
            <div className="w-[45%] overflow-auto p-5 bg-slate-950">
              <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-3">Preview</div>
              <div className="md-preview">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-slate-100 mt-6 mb-3 pb-2 border-b border-slate-800">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold text-slate-200 mt-5 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold text-slate-200 mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-sm text-slate-300 leading-relaxed my-2">{children}</p>,
                    strong: ({ children }) => <strong className="text-slate-100 font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-slate-300 italic">{children}</em>,
                    code: ({ className, children, ...props }) => {
                      const isInline = !className
                      return isInline
                        ? <code className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                        : <code className={className} {...props}>{children}</code>
                    },
                    pre: ({ children }) => <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 my-3 overflow-x-auto text-xs">{children}</pre>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-violet-500 pl-3 text-slate-400 italic my-2">{children}</blockquote>,
                    ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm text-slate-300">{children}</li>,
                    a: ({ href, children }) => <a href={href} className="text-violet-400 hover:text-violet-300 underline">{children}</a>,
                    hr: () => <hr className="border-slate-700 my-4" />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="min-w-full border border-slate-700 rounded text-xs">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-slate-800">{children}</thead>,
                    th: ({ children }) => <th className="px-3 py-2 text-left text-slate-300 font-semibold border-b border-slate-700">{children}</th>,
                    td: ({ children }) => <td className="px-3 py-2 text-slate-400 border-b border-slate-800">{children}</td>,
                    img: ({ src, alt }) => <img src={src} alt={alt} className="rounded-lg max-w-full my-3" />,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New File Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200">新建笔记</h3>
              <button onClick={() => setShowNewDialog(false)} className="p-1 rounded hover:bg-slate-800 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">文件名</label>
                <input type="text" value={newFileName}
                  onChange={e => { setNewFileName(e.target.value); setNewFilePath(e.target.value ? `${e.target.value}.md` : '') }}
                  placeholder="My New Note" autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">路径</label>
                <input type="text" value={newFilePath} onChange={e => setNewFilePath(e.target.value)}
                  placeholder="folder/note.md"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowNewDialog(false)} className="flex-1 px-3 py-2 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700">取消</button>
                <button onClick={handleSave} disabled={!newFilePath || saving}
                  className="flex-1 px-3 py-2 rounded-lg text-xs bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40">{saving ? 'Creating...' : 'Create'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && currentFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 确认删除</h3>
            <p className="text-xs text-slate-400 mb-1">将把文件移入回收站：</p>
            <p className="text-xs text-slate-200 font-mono bg-slate-800 rounded px-2 py-1.5 mb-4">{currentFile.path}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-3 py-2 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700">取消</button>
              <button onClick={handleDelete} className="flex-1 px-3 py-2 rounded-lg text-xs bg-rose-600 text-white hover:bg-rose-500">删除</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {showRenameDialog && currentFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">重命名笔记</h3>
            <div className="space-y-3">
              <div><label className="text-[11px] text-slate-400 mb-1 block">当前路径</label>
                <div className="text-xs text-slate-500 font-mono bg-slate-800 rounded px-2 py-1.5">{currentFile.path}</div></div>
              <div><label className="text-[11px] text-slate-400 mb-1 block">新路径</label>
                <input type="text" value={renamePath} onChange={e => setRenamePath(e.target.value)}
                  placeholder="new-folder/new-name.md" autoFocus
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500" /></div>
              <p className="text-[10px] text-slate-500">重命名后会自动更新所有 [[wikilinks]]。</p>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowRenameDialog(false); setRenamePath('') }} className="flex-1 px-3 py-2 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700">取消</button>
                <button onClick={handleRename} disabled={!renamePath} className="flex-1 px-3 py-2 rounded-lg text-xs bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40">重命名</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolBtn({ icon: Icon, label, onClick, className, suffix }: {
  icon: React.FC<{ className?: string }>; label: string; onClick: () => void; className?: string; suffix?: string
}) {
  return (
    <button onClick={onClick} title={label}
      className={`p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative ${className || ''}`}>
      <Icon className="w-3.5 h-3.5" />
      {suffix && <span className="absolute -bottom-0.5 -right-0.5 text-[8px] text-slate-500 font-bold">{suffix}</span>}
    </button>
  )
}
