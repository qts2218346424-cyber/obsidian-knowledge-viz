import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Save, Trash2, FileEdit, FilePlus, Upload,
  ChevronDown, ChevronRight, X, Loader2, AlertTriangle,
  FolderTree, Eye, Bold, Italic, Heading, List, Code,
  Link, Table, Hash, Sparkles, Wand2,
  Undo2, Copy, Check, Quote, Strikethrough, Minus, ListOrdered,
  Sigma, Target,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import 'highlight.js/styles/github-dark.css'
import { api, type FileDetail, type IngestStatus, type IngestResult } from '../services/api'
import { useVaultTree } from '../hooks/useVaultData'
import FileExplorer from '../components/FileExplorer'
import QuickPracticeModal from '../components/QuickPracticeModal'
import ObsidianSyncModal from '../components/ObsidianSyncModal'


type NoteTemplateKey = 'blank' | 'learning' | 'wrong-question' | 'idea'

const noteTemplates: Array<{
  key: NoteTemplateKey
  label: string
  description: string
  tags: string
  content: (title: string) => string
}> = [
  {
    key: 'blank',
    label: '空白笔记',
    description: '从一句话或一个想法开始',
    tags: '',
    content: (title) => title ? `# ${title}\n\n` : '',
  },
  {
    key: 'learning',
    label: '学习卡片',
    description: '适合概念、课程和复习',
    tags: '学习, 待整理',
    content: (title) => `# ${title || '学习卡片'}\n\n## 核心概念\n\n\n## 用自己的话解释\n\n\n## 例子\n\n\n## 还没理解\n\n\n## 关联笔记\n- [[]]\n`,
  },
  {
    key: 'wrong-question',
    label: '错题复盘',
    description: '记录错误、原因和下次提醒',
    tags: '错题, 复习',
    content: (title) => `# ${title || '错题复盘'}\n\n## 题目\n\n\n## 我的答案\n\n\n## 正确思路\n\n\n## 错因\n\n\n## 下次提醒\n`,
  },
  {
    key: 'idea',
    label: '灵感速记',
    description: '先记下来，再慢慢整理',
    tags: '灵感, 待整理',
    content: (title) => `# ${title || '灵感速记'}\n\n## 一句话\n\n\n## 细节\n\n\n## 下一步\n`,
  },
]

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

function insertSnippet(
  textarea: HTMLTextAreaElement,
  snippet: string,
  content: string,
  setContent: (v: string) => void,
) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = content.substring(start, end)
  let textToInsert = snippet
  let selectStartOffset = 0
  let selectLen = 0

  if (snippet.includes('${text}')) {
    const defaultPlaceholder = selected || 'f(x)'
    textToInsert = snippet.replace('${text}', defaultPlaceholder)
    selectStartOffset = snippet.indexOf('${text}')
    selectLen = defaultPlaceholder.length
  } else {
    selectStartOffset = 0
    selectLen = snippet.length
  }

  const newContent = content.substring(0, start) + textToInsert + content.substring(end)
  setContent(newContent)
  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(start + selectStartOffset, start + selectStartOffset + selectLen)
  }, 0)
}

const mathSnippets = [
  { label: '行内公式 $...$', snippet: '$${text}$', desc: '行内公式' },
  { label: '块级公式 $$...$$', snippet: '$$\n${text}\n$$', desc: '独立公式块' },
  { label: '定积分', snippet: '\\int_{a}^{b} f(x) \\, dx', desc: '\\int' },
  { label: '求极限', snippet: '\\lim_{x \\to 0} \\frac{f(x)}{g(x)}', desc: '\\lim' },
  { label: '求和号', snippet: '\\sum_{i=1}^{n} a_i', desc: '\\sum' },
  { label: '分式', snippet: '\\frac{分子}{分母}', desc: '\\frac{a}{b}' },
  { label: '开方', snippet: '\\sqrt{x}', desc: '\\sqrt{}' },
  { label: '矩阵 (2×2)', snippet: '\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}', desc: 'pmatrix' },
  { label: '偏导数', snippet: '\\frac{\\partial f}{\\partial x}', desc: '\\partial' },
  { label: '特征值', snippet: 'A\\mathbf{x} = \\lambda\\mathbf{x}', desc: 'Ax = λx' },
]

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function inlineMarkdownToHtml(value: string) {
  let html = escapeHtml(value)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  html = html.replace(/\[\[([^\]]+)\]\]/g, '<span class="wiki-link">[[$1]]</span>')
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  html = html.replace(/(^|[^\*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
  html = html.replace(/(^|[^_])_([^_]+)_(?!_)/g, '$1<em>$2</em>')
  return html
}

function markdownToRichHtml(markdown: string) {
  const lines = markdown.replace(/^---\n[\s\S]*?\n---\n?/, '').split(/\r?\n/)
  const html: string[] = []
  let inCode = false
  let codeBuffer: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`)
      listType = null
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`)
        codeBuffer = []
        inCode = false
      } else {
        closeList()
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeBuffer.push(line)
      continue
    }
    if (!line.trim()) {
      closeList()
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      closeList()
      html.push(`<h${heading[1].length}>${inlineMarkdownToHtml(heading[2])}</h${heading[1].length}>`)
      continue
    }
    const unordered = line.match(/^\s*[-*]\s+(.+)$/)
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/)
    if (unordered || ordered) {
      const nextType = unordered ? 'ul' : 'ol'
      if (listType !== nextType) {
        closeList()
        listType = nextType
        html.push(`<${nextType}>`)
      }
      html.push(`<li>${inlineMarkdownToHtml((unordered || ordered)![1])}</li>`)
      continue
    }
    if (/^\s*>\s?/.test(line)) {
      closeList()
      html.push(`<blockquote>${inlineMarkdownToHtml(line.replace(/^\s*>\s?/, ''))}</blockquote>`)
      continue
    }
    if (/^\s*---+\s*$/.test(line)) {
      closeList()
      html.push('<hr />')
      continue
    }
    closeList()
    html.push(`<p>${inlineMarkdownToHtml(line)}</p>`)
  }

  if (inCode) html.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`)
  closeList()
  return html.join('')
}

function htmlToMarkdown(html: string) {
  if (typeof document === 'undefined') return html
  const root = document.createElement('div')
  root.innerHTML = html

  const render = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || ''
    if (node.nodeType !== Node.ELEMENT_NODE) return ''
    const element = node as HTMLElement
    const children = Array.from(element.childNodes).map(render).join('')
    switch (element.tagName.toLowerCase()) {
      case 'strong':
      case 'b':
        return `**${children}**`
      case 'em':
      case 'i':
        return `*${children}*`
      case 'del':
      case 's':
        return `~~${children}~~`
      case 'code':
        return element.parentElement?.tagName.toLowerCase() === 'pre' ? children : `\`${children}\``
      case 'pre':
        return `\`\`\`\n${element.textContent || ''}\n\`\`\`
`
      case 'br':
        return '\n'
      case 'h1':
        return `# ${children}\n\n`
      case 'h2':
        return `## ${children}\n\n`
      case 'h3':
        return `### ${children}\n\n`
      case 'blockquote':
        return `${children.split('\n').filter(Boolean).map(line => `> ${line}`).join('\n')}\n\n`
      case 'hr':
        return '---\n\n'
      case 'a': {
        const href = element.getAttribute('href') || ''
        return href ? `[${children}](${href})` : children
      }
      case 'li':
        return children
      case 'ul':
        return `${Array.from(element.children).map(item => `- ${render(item)}`).join('\n')}\n\n`
      case 'ol':
        return `${Array.from(element.children).map((item, index) => `${index + 1}. ${render(item)}`).join('\n')}\n\n`
      case 'p':
      case 'div':
        return `${children}\n\n`
      default:
        return children
    }
  }

  return Array.from(root.childNodes).map(render).join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
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
  const [newFileFolder, setNewFileFolder] = useState('')
  const [newTemplateKey, setNewTemplateKey] = useState<NoteTemplateKey>('blank')
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
  const [showPreview, setShowPreview] = useState(false)
  const [editorMode, setEditorMode] = useState<'write' | 'markdown'>('write')
  const [richHtml, setRichHtml] = useState('')

  // AI Edit state
  const [showAiMenu, setShowAiMenu] = useState(false)
  const [aiEditing, setAiEditing] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiAction, setAiAction] = useState('')
  const [showAiResult, setShowAiResult] = useState(false)
  const [showMathMenu, setShowMathMenu] = useState(false)
  const [practiceModalOpen, setPracticeModalOpen] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const richEditorRef = useRef<HTMLDivElement>(null)
  const richEditorFocusedRef = useRef(false)
  const isComposingRef = useRef(false)
  const [obsidianSyncModalOpen, setObsidianSyncModalOpen] = useState(false)
  const [vaultStats, setVaultStats] = useState<{ totalNotes: number; vaultPath: string } | null>(null)
  const { tree, reload: reloadTree } = useVaultTree()

  // Load ingest status & vault stats
  useEffect(() => {
    api.getIngestStatus().then(setIngestStatus).catch(() => {})
    api.getStats().then(s => setVaultStats({ totalNotes: s.totalNotes, vaultPath: s.vaultPath })).catch(() => {})
  }, [])

  // Track dirty state
  useEffect(() => {
    setDirty(content !== originalContent || tags !== (currentFile?.tags.join(', ') || '') || title !== (currentFile?.title || ''))
  }, [content, originalContent, tags, title, currentFile])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

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
      const nextHtml = markdownToRichHtml(note.content)
      setRichHtml(nextHtml)
      if (richEditorRef.current) {
        richEditorRef.current.innerHTML = nextHtml
      }
      setOriginalContent(note.content)
      setTags(note.tags.join(', '))
      setTitle(note.title)
      setSaveMsg('')
      setImportResult(null)
      setShowNewDialog(false)
    } catch {
      setSaveMsg('加载笔记失败')
    }
  }, [])

  const handleFileClick = (filePath: string) => {
    if (currentFile?.path === filePath) return
    if (dirty && !window.confirm('当前笔记有未保存修改，切换后这些修改会丢失。继续切换吗？')) return
    loadFile(filePath)
  }

  const handleSave = async () => {
    if (!currentFile) {
      let finalName = newFileName.trim()
      if (!finalName) {
        const now = new Date()
        const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
        finalName = `未命名笔记_${timeStr}`
      }
      if (!finalName.endsWith('.md')) finalName += '.md'
      const finalPath = newFileFolder.trim()
        ? `${newFileFolder.replace(/[\\/]+$/, '')}/${finalName}`
        : finalName

      setSaving(true)
      try {
        const fm = buildFrontmatter()
        const note = await api.createFile(finalPath, content, fm)
        setCurrentFile(note)
        setOriginalContent(content)
        setSaveMsg(`✅ 已同步至本地 Obsidian：${note.path}`)
        setShowNewDialog(false)
        setNewFilePath('')
        setNewFileName('')
        setNewFileFolder('')
        setNewTemplateKey('blank')
        await reloadTree()
        api.getStats().then(s => setVaultStats({ totalNotes: s.totalNotes, vaultPath: s.vaultPath })).catch(() => {})
        setTimeout(() => setSaveMsg(''), 3500)
      } catch (err: any) {
        setSaveMsg(`保存失败：${err.message}`)
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
      setSaveMsg(`✅ 已同步保存至本地 Obsidian：${note.path}`)
      setTimeout(() => setSaveMsg(''), 3500)
    } catch (err: any) {
      setSaveMsg(`保存失败：${err.message}`)
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
      setSaveMsg(`删除失败：${err.message}`)
    }
  }

  const handleRename = async () => {
    if (!currentFile || !renamePath) return
    try {
      const result = await api.renameFile(currentFile.path, renamePath)
      setSaveMsg(`已重命名${result.linksUpdated > 0 ? `，同步更新 ${result.linksUpdated} 条链接` : ''}`)
      await loadFile(result.newPath)
      await reloadTree()
      setShowRenameDialog(false)
      setRenamePath('')
    } catch (err: any) {
      setSaveMsg(`重命名失败：${err.message}`)
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
      setSaveMsg(`导入完成：${succeeded.length} 个成功${failed > 0 ? `，${failed} 个失败` : ''}`)
    } else {
      setImportError('导入失败，请检查文件格式或服务状态')
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
    if (dirty && !window.confirm('当前笔记有未保存修改，新建后这些修改会丢失。继续新建吗？')) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
    const defaultName = `未命名笔记_${timeStr}`
    setCurrentFile(null)
    setContent('')
    setRichHtml('')
    setOriginalContent('')
    setTags('')
    setTitle(defaultName)
    setNewFileName(defaultName)
    setNewFileFolder('')
    setNewFilePath(`${defaultName}.md`)
    setNewTemplateKey('blank')
    setShowNewDialog(true)
    setSaveMsg('')
    setShowPreview(false)
  }

  const applyNewTemplate = (key: NoteTemplateKey, nextTitle = newFileName) => {
    const template = noteTemplates.find(item => item.key === key) || noteTemplates[0]
    setNewTemplateKey(key)
    setTags(template.tags)
    const nextContent = template.content(nextTitle)
    setContent(nextContent)
    const nextHtml = markdownToRichHtml(nextContent)
    setRichHtml(nextHtml)
    if (richEditorRef.current) {
      richEditorRef.current.innerHTML = nextHtml
    }
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
  const syncRichContent = () => {
    if (isComposingRef.current) return
    const html = richEditorRef.current?.innerHTML || ''
    setContent(htmlToMarkdown(html))
  }
  const execRich = (command: string, value?: string) => {
    richEditorRef.current?.focus()
    document.execCommand(command, false, value)
    syncRichContent()
  }
  const switchEditorMode = (nextMode: 'write' | 'markdown') => {
    if (nextMode === editorMode) return
    if (nextMode === 'write') {
      const nextHtml = markdownToRichHtml(content)
      setRichHtml(nextHtml)
      setEditorMode('write')
      window.setTimeout(() => {
        if (richEditorRef.current) richEditorRef.current.innerHTML = nextHtml
      }, 0)
      return
    }
    syncRichContent()
    setEditorMode('markdown')
  }
  const fmt = {
    bold: () => editorMode === 'write' ? execRich('bold') : ta() && insertAtCursor(ta()!, '**', '**', content, setContent),
    italic: () => editorMode === 'write' ? execRich('italic') : ta() && insertAtCursor(ta()!, '*', '*', content, setContent),
    strike: () => editorMode === 'write' ? execRich('strikeThrough') : ta() && insertAtCursor(ta()!, '~~', '~~', content, setContent),
    h1: () => editorMode === 'write' ? execRich('formatBlock', '<h1>') : ta() && insertAtLine(ta()!, '# ', content, setContent),
    h2: () => editorMode === 'write' ? execRich('formatBlock', '<h2>') : ta() && insertAtLine(ta()!, '## ', content, setContent),
    h3: () => editorMode === 'write' ? execRich('formatBlock', '<h3>') : ta() && insertAtLine(ta()!, '### ', content, setContent),
    list: () => editorMode === 'write' ? execRich('insertUnorderedList') : ta() && insertAtLine(ta()!, '- ', content, setContent),
    olist: () => editorMode === 'write' ? execRich('insertOrderedList') : ta() && insertAtLine(ta()!, '1. ', content, setContent),
    quote: () => editorMode === 'write' ? execRich('formatBlock', '<blockquote>') : ta() && insertAtLine(ta()!, '> ', content, setContent),
    hr: () => editorMode === 'write' ? execRich('insertHorizontalRule') : ta() && insertBlock(ta()!, '---', content, setContent),
    code: () => editorMode === 'write' ? execRich('formatBlock', '<pre>') : ta() && insertBlock(ta()!, '```\ncode here\n```', content, setContent),
    link: () => editorMode === 'write'
      ? execRich('createLink', window.prompt('链接地址', 'https://') || 'https://')
      : ta() && insertAtCursor(ta()!, '[', '](url)', content, setContent),
    wiki: () => editorMode === 'write' ? execRich('insertText', '[[]]') : ta() && insertAtCursor(ta()!, '[[', ']]', content, setContent),
    table: () => editorMode === 'write'
      ? execRich('insertHTML', '<table><tbody><tr><td>内容</td><td>补充说明</td></tr></tbody></table>')
      : ta() && insertBlock(ta()!, '| Col 1 | Col 2 | Col 3 |\n|-------|-------|-------|\n| cell  | cell  | cell  |', content, setContent),
  }

  const handleInsertMath = (snippet: string) => {
    setShowMathMenu(false)
    if (editorMode === 'write') {
      execRich('insertText', snippet.replace('${text}', 'f(x)'))
    } else {
      const el = ta()
      if (el) insertSnippet(el, snippet, content, setContent)
    }
  }

  // ─── AI Edit Actions ──────────────────────────────────────────────────────────

  const aiActions = [
    { key: 'polish', label: '润色优化', desc: '改善表达，使文字更流畅', icon: Wand2 },
    { key: 'simplify', label: '简化内容', desc: '精简冗余，保留核心', icon: Minus },
    { key: 'expand', label: '扩展补充', desc: '丰富细节，补充说明', icon: Sparkles },
    { key: 'structure', label: '整理结构', desc: '优化排版和层级结构', icon: ListOrdered },
    { key: 'grammar', label: '修正语法', desc: '修复错别字和语法问题', icon: Check },
    { key: 'summary', label: '生成摘要', desc: '为笔记生成概要', icon: Quote },
  ]

  const handleAiEdit = async (actionKey: string) => {
    const action = aiActions.find(a => a.key === actionKey)
    if (!action || !content.trim()) return
    setShowAiMenu(false)
    setAiEditing(true)
    setAiAction(action.label)
    setShowAiResult(true)
    setAiResult('')

    const prompts: Record<string, string> = {
      polish: '请润色以下Markdown笔记，改善文字表达使其更流畅、更专业，保持Markdown格式不变：',
      simplify: '请简化以下Markdown笔记，去除冗余内容，保留核心要点，保持Markdown格式：',
      expand: '请扩展以下Markdown笔记，补充更多细节和说明，保持Markdown格式：',
      structure: '请重新整理以下Markdown笔记的结构和排版，优化层级关系和列表组织：',
      grammar: '请修正以下Markdown笔记中的错别字、语法问题和标点符号：',
      summary: '请为以下Markdown笔记生成一段简洁的摘要，放在笔记最前面（用 > 引用格式）：',
    }

    try {
      const response = await api.sendMessage(`${prompts[actionKey] || prompts.polish}\n\n${content}`)
      setAiResult(response.reply || 'AI 暂时没有返回结果')
    } catch (error: any) {
      setAiResult(`AI 编辑失败：${error?.message || '请检查 AI 服务连接'}`)
    } finally {
      setAiEditing(false)
    }
  }

  const applyAiResult = () => {
    if (aiResult && !aiResult.startsWith('AI 编辑失败：')) {
      setContent(aiResult)
      setRichHtml(markdownToRichHtml(aiResult))
      setShowAiResult(false)
      setAiResult('')
      setSaveMsg('AI 编辑已应用')
      setTimeout(() => setSaveMsg(''), 2000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
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
      <div className={`shrink-0 transition-all duration-200 ${showFiles ? 'w-56' : 'w-0'} overflow-hidden border-r border-cream-200`}>
        <FileExplorer tree={tree} onFileClick={handleFileClick} selectedPath={currentFile?.path} />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar: File operations */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-cream-200 bg-cream-100/80 shrink-0">
          <button onClick={() => setShowFiles(!showFiles)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${showFiles ? 'bg-cream-200 text-warm-600' : 'text-warm-400 hover:text-warm-600'}`}
            title={showFiles ? '隐藏文件列表' : '显示文件列表'}>
            <FolderTree className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-cream-200" />
          <button onClick={handleNewFile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 text-warm-700 hover:bg-slate-200 transition-colors">
            <FilePlus className="w-3.5 h-3.5" /> 新建
          </button>
          {/* Obsidian Sync Status Pill */}
          <button
            onClick={() => setObsidianSyncModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-purple-700 transition-all cursor-pointer shadow-2xs"
            title="点击查看与本地 Obsidian 实时双向同步状态及文件夹"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-medium">Obsidian 同步</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-200/60 font-mono text-purple-800">
              {vaultStats?.totalNotes || 386} 篇
            </span>
          </button>
          <button onClick={handleSave} disabled={saving || (!dirty && !!currentFile)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} 保存
          </button>
          {currentFile && (
            <>
              <button onClick={() => setShowRenameDialog(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 text-warm-700 hover:bg-slate-200 transition-colors">
                <FileEdit className="w-3.5 h-3.5" /> 重命名
              </button>
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 text-accent-rose hover:bg-accent-rose/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> 删除
              </button>
            </>
          )}
          <div className="w-px h-5 bg-cream-200" />
          {/* Import */}
          <div className="relative">
            <input ref={fileInputRef} type="file" multiple
              accept={ingestStatus?.supportedFormats?.join(',') || '.pdf,.docx,.xlsx,.pptx,.html,.csv'}
              onChange={handleImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={importing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors">
              {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              导入{importing && batchProgress ? ` (${batchProgress.done}/${batchProgress.total})` : ''}
            </button>
          </div>

          {/* Practice */}
          <button
            onClick={() => setPracticeModalOpen(true)}
            disabled={!currentFile && !content.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="基于本篇笔记考点，立即生成 3 道测试题进行随堂真题测验"
          >
            <Target className="w-3.5 h-3.5" /> 🎯 即学即练
          </button>

          <div className="ml-auto flex items-center gap-2">
            {saveMsg && (
              <div className={`text-xs px-2 py-1 rounded-lg ${saveMsg.includes('失败') ? 'text-accent-rose bg-accent-rose/10' : 'text-accent-sage bg-accent-sage/10'}`}>
                {saveMsg}
              </div>
            )}
            {dirty && (
              <div className="text-xs text-accent-amber flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 未保存
              </div>
            )}
            <button onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${showPreview ? 'bg-cream-200 text-warm-600' : 'text-warm-400 hover:text-warm-600'}`}>
              <Eye className="w-3.5 h-3.5" /> 预览
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-cream-200 bg-surface/50 shrink-0 flex-wrap">
          <div className="mr-2 flex items-center rounded-lg border border-cream-300 bg-cream-100 p-0.5">
            <button
              onClick={() => switchEditorMode('write')}
              className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${editorMode === 'write' ? 'bg-white font-medium text-warm-800 shadow-sm' : 'text-warm-400 hover:text-warm-700'}`}
            >
              写作
            </button>
            <button
              onClick={() => switchEditorMode('markdown')}
              className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${editorMode === 'markdown' ? 'bg-white font-medium text-warm-800 shadow-sm' : 'text-warm-400 hover:text-warm-700'}`}
            >
              Markdown
            </button>
          </div>
          <ToolBtn icon={Bold} label="粗体 (Ctrl+B)" onClick={fmt.bold} />
          <ToolBtn icon={Italic} label="斜体 (Ctrl+I)" onClick={fmt.italic} />
          <ToolBtn icon={Strikethrough} label="删除线" onClick={fmt.strike} />
          <div className="w-px h-4 bg-cream-300 mx-1" />
          <ToolBtn icon={Heading} label="H1 (Ctrl+1)" onClick={fmt.h1} />
          <ToolBtn icon={Heading} label="H2 (Ctrl+2)" onClick={fmt.h2} className="!text-[10px]" suffix="2" />
          <ToolBtn icon={Heading} label="H3 (Ctrl+3)" onClick={fmt.h3} className="!text-[9px]" suffix="3" />
          <div className="w-px h-4 bg-cream-300 mx-1" />
          <ToolBtn icon={List} label="无序列表" onClick={fmt.list} />
          <ToolBtn icon={ListOrdered} label="有序列表" onClick={fmt.olist} />
          <ToolBtn icon={Quote} label="引用" onClick={fmt.quote} />
          <ToolBtn icon={Code} label="代码块" onClick={fmt.code} />
          <ToolBtn icon={Link} label="链接" onClick={fmt.link} />
          <ToolBtn icon={Hash} label="Wiki链接" onClick={fmt.wiki} />
          <ToolBtn icon={Table} label="表格" onClick={fmt.table} />
          <ToolBtn icon={Minus} label="分隔线" onClick={fmt.hr} />

          {/* Math Quick Formula Dropdown */}
          <div className="relative">
            <ToolBtn
              icon={Sigma}
              label="插入数学公式 (LaTeX / KaTeX)"
              onClick={() => setShowMathMenu(!showMathMenu)}
              className={showMathMenu ? 'bg-cream-200 text-accent-orange' : ''}
            />
            {showMathMenu && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-surface border border-cream-300 rounded-xl shadow-xl z-50 p-1.5 animate-fade-in-up">
                <div className="px-2.5 py-1.5 border-b border-cream-200 text-[10px] text-warm-500 font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>LaTeX 数学公式速插</span>
                  <span className="text-[9px] text-warm-400 font-normal">支持 KaTeX</span>
                </div>
                <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                  {mathSnippets.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInsertMath(m.snippet)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs text-warm-700 hover:bg-cream-100 hover:text-accent-orange transition-colors"
                    >
                      <span className="font-medium">{m.label}</span>
                      <span className="font-mono text-[10px] text-warm-400">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Edit Button */}
          <div className="ml-auto relative">
            <button
              onClick={() => setShowAiMenu(!showAiMenu)}
              disabled={!content.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-accent-orange to-accent-peach text-white hover:opacity-90 disabled:opacity-40 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI 编辑
              <ChevronDown className={`w-3 h-3 transition-transform ${showAiMenu ? 'rotate-180' : ''}`} />
            </button>

            {showAiMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-surface border border-cream-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                <div className="px-3 py-2 border-b border-cream-200 bg-cream-100/50">
                  <span className="text-[10px] text-warm-500 uppercase tracking-wider">AI 智能编辑</span>
                </div>
                {aiActions.map(action => (
                  <button
                    key={action.key}
                    onClick={() => handleAiEdit(action.key)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-cream-100 transition-colors"
                  >
                    <action.icon className="w-4 h-4 text-accent-orange shrink-0" />
                    <div>
                      <div className="text-xs font-medium text-warm-700">{action.label}</div>
                      <div className="text-[10px] text-warm-400">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Import status bar */}
        {ingestStatus && (
          <div className="px-4 py-1 border-b border-cream-200 bg-surface/30 text-[10px] text-warm-400 flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${ingestStatus.installed ? 'bg-accent-sage' : 'bg-accent-amber'}`} />
            markitdown: {ingestStatus.installed ? `已安装 (${ingestStatus.pythonVersion})` : '未安装 — 拖拽文件到此处导入'}
            {importError && <span className="text-rose-400 ml-2">{importError}</span>}
          </div>
        )}

        {/* Editor + Preview */}
        <div className="flex flex-1 flex-col overflow-hidden relative lg:flex-row">
          {/* Drag overlay */}
          {dragOver && (
            <div className="absolute inset-0 z-40 bg-accent-orange/10 border-2 border-dashed border-accent-orange rounded-lg flex items-center justify-center pointer-events-none">
              <div className="text-lg font-semibold text-accent-orange bg-cream-100/90 px-6 py-3 rounded-xl">
                松开导入文档
              </div>
            </div>
          )}

          {/* Editor Panel with line numbers */}
          <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${showPreview ? 'border-b border-cream-200 lg:border-b-0 lg:border-r' : ''}`}>
            {/* Note title */}
            <div className="border-b border-cream-200 bg-surface px-5 py-4">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="无标题笔记"
                aria-label="笔记标题"
                className="w-full bg-transparent text-xl font-semibold tracking-tight text-warm-900 outline-none placeholder:text-warm-300"
              />
              <div className="mt-2 flex items-center gap-2 text-[11px] text-warm-400">
                {currentFile ? (
                  <>
                    <span className="max-w-[60%] truncate font-mono">{currentFile.path}</span>
                    <span>·</span>
                    <span>{currentFile.wordCount} 字</span>
                    <span>·</span>
                    <span>{currentFile.links.length} 条链接</span>
                  </>
                ) : (
                  <span>新笔记 · 写下你的想法，保存后会进入 Vault</span>
                )}
              </div>
            </div>

            {/* Frontmatter editor */}
            <div className="border-b border-cream-200">
              <button onClick={() => setShowFm(!showFm)}
                className="w-full flex items-center gap-2 px-4 py-1.5 text-xs text-warm-500 hover:text-warm-700 transition-colors">
                {showFm ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                笔记属性
              </button>
              {showFm && (
                <div className="px-4 pb-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-warm-400 w-12 shrink-0">标签</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                      placeholder="用逗号分隔，例如：数据结构, 复习"
                      className="flex-1 bg-cream-200 border border-cream-300 rounded px-2 py-1 text-xs text-warm-700 outline-none focus:border-accent-orange" />
                  </div>
                </div>
              )}
            </div>

            {editorMode === 'write' ? (
              <div className="flex-1 overflow-y-auto bg-white px-5 py-5">
                <div
                  ref={richEditorRef}
                  key={currentFile?.path || 'new-note-writing'}
                  contentEditable
                  suppressContentEditableWarning
                  onFocus={() => { richEditorFocusedRef.current = true }}
                  onBlur={() => { richEditorFocusedRef.current = false }}
                  onCompositionStart={() => { isComposingRef.current = true }}
                  onCompositionEnd={() => { isComposingRef.current = false; syncRichContent() }}
                  onInput={syncRichContent}
                  onKeyDown={handleKeyDown}
                  dangerouslySetInnerHTML={{ __html: richHtml }}
                  data-placeholder={currentFile || showNewDialog ? '从这里开始写作…' : '从左侧选择一篇笔记，或点击“新建”开始写作…'}
                  className="rich-note-editor min-h-full text-[16px] leading-8 text-warm-700 outline-none"
                />
              </div>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                <div className="w-10 shrink-0 overflow-hidden border-r border-cream-200 bg-surface/50 select-none">
                  <div className="py-3 pr-2 text-right">
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i} className="font-mono text-[11px] leading-relaxed text-warm-400" style={{ height: '1.625em' }}>
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
                  placeholder={currentFile || showNewDialog ? '从这里开始写作…' : '从左侧选择一篇笔记，或点击“新建”开始写作…'}
                  className="flex-1 resize-none bg-transparent px-4 py-4 font-sans text-[15px] leading-7 text-warm-700 outline-none placeholder:text-warm-300"
                  spellCheck
                />
              </div>
            )}
          </div>

          {/* Preview Panel — Professional Markdown Rendering */}
          {showPreview && (
            <div className="max-h-[45%] w-full overflow-auto bg-cream-100 p-5 lg:max-h-none lg:w-[45%]">
              <div className="mb-3 text-[10px] uppercase tracking-wider text-warm-400">实时预览</div>
              <div className="md-preview">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeHighlight, rehypeKatex]}
                  components={{
                    h1: ({ children }) => <h1 className="text-xl font-bold text-warm-800 mt-6 mb-3 pb-2 border-b border-cream-200">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold text-warm-700 mt-5 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold text-warm-700 mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-sm text-warm-600 leading-relaxed my-2">{children}</p>,
                    strong: ({ children }) => <strong className="text-warm-800 font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-warm-600 italic">{children}</em>,
                    code: ({ className, children, ...props }) => {
                      const isInline = !className
                      return isInline
                        ? <code className="bg-cream-200 text-accent-sage px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                        : <code className={className} {...props}>{children}</code>
                    },
                    pre: ({ children }) => <pre className="bg-cream-100 border border-cream-200 rounded-lg p-4 my-3 overflow-x-auto text-xs">{children}</pre>,
                    blockquote: ({ children }) => <blockquote className="border-l-2 border-accent-orange pl-3 text-warm-500 italic my-2">{children}</blockquote>,
                    ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm text-warm-600">{children}</li>,
                    a: ({ href, children }) => <a href={href} className="text-accent-orange hover:text-accent-orange/80 underline">{children}</a>,
                    hr: () => <hr className="border-cream-300 my-4" />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="min-w-full border border-cream-300 rounded text-xs">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-cream-200">{children}</thead>,
                    th: ({ children }) => <th className="px-3 py-2 text-left text-warm-600 font-semibold border-b border-cream-300">{children}</th>,
                    td: ({ children }) => <td className="px-3 py-2 text-warm-500 border-b border-cream-200">{children}</td>,
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
        <div
          onClick={() => setShowNewDialog(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] animate-in fade-in duration-150 p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-surface border border-cream-300 rounded-3xl p-6 w-[min(94vw,32rem)] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold tracking-tight text-warm-900 flex items-center gap-2">
                  <span>创建一篇新笔记</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    同步至 Obsidian
                  </span>
                </h3>
                <p className="mt-1 text-xs text-warm-400">选择模板起点并命名，创建后可在本地 Obsidian 实时查看编辑。</p>
              </div>
              <button
                onClick={() => setShowNewDialog(false)}
                className="p-1.5 rounded-xl hover:bg-cream-200 text-warm-400 hover:text-warm-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-warm-500 mb-1.5 block">从模板开始</label>
                <div className="grid grid-cols-2 gap-2">
                  {noteTemplates.map(template => (
                    <button
                      key={template.key}
                      type="button"
                      onClick={() => applyNewTemplate(template.key)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer ${
                        newTemplateKey === template.key
                          ? 'border-accent-orange bg-accent-orange/10 ring-1 ring-accent-orange'
                          : 'border-cream-300 hover:border-cream-400 hover:bg-cream-100'
                      }`}
                    >
                      <span className="block text-xs font-semibold text-warm-800">{template.label}</span>
                      <span className="mt-0.5 block text-[10px] leading-4 text-warm-400">{template.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-warm-600 mb-1 block">笔记名称</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={e => {
                    const value = e.target.value
                    setNewFileName(value)
                    setTitle(value)
                    setNewFilePath(value ? `${newFileFolder ? `${newFileFolder.replace(/[\\/]+$/, '')}/` : ''}${value}.md` : '')
                    if (newTemplateKey !== 'blank') {
                      const template = noteTemplates.find(item => item.key === newTemplateKey)
                      if (template) {
                        const nextContent = template.content(value)
                        setContent(nextContent)
                      }
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSave()
                    } else if (e.key === 'Escape') {
                      setShowNewDialog(false)
                    }
                  }}
                  placeholder="例如：二叉树遍历 (留空默认为未命名笔记)"
                  autoFocus
                  className="w-full bg-white border-2 border-indigo-200 focus:border-accent-orange rounded-xl px-3.5 py-2.5 text-sm font-medium text-warm-800 placeholder:text-warm-300 outline-none shadow-2xs transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-warm-600 mb-1 block">放入子文件夹（可选）</label>
                <input
                  type="text"
                  value={newFileFolder}
                  onChange={e => {
                    const value = e.target.value
                    setNewFileFolder(value)
                    setNewFilePath(newFileName ? `${value.replace(/[\\/]+$/, '') ? `${value.replace(/[\\/]+$/, '')}/` : ''}${newFileName}.md` : '')
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSave()
                    } else if (e.key === 'Escape') {
                      setShowNewDialog(false)
                    }
                  }}
                  placeholder="例如：课程笔记 或 专题复习 (留空存放在根目录)"
                  className="w-full bg-white border-2 border-indigo-200 focus:border-accent-orange rounded-xl px-3.5 py-2.5 text-sm font-medium text-warm-800 placeholder:text-warm-300 outline-none shadow-2xs transition-all"
                />
              </div>

              {/* Obsidian Local Vault Path Realtime Banner */}
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200/80 text-xs text-purple-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-[11px] text-purple-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>将实时落盘保存至本地 Obsidian 目录：</span>
                </div>
                <div className="font-mono text-[11px] text-purple-700 break-all select-all font-semibold">
                  {vaultStats?.vaultPath || 'E:\\考研\\408考研学习'}\{newFilePath || `${newFileName || '未命名笔记'}.md`}
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewDialog(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-cream-200 text-warm-600 hover:bg-cream-300 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-accent-orange text-white hover:bg-accent-orange/90 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? '正在同步落盘…' : '创建并开始写作 ↵'}
                </button>
              </div>

              <p className="text-[10px] text-warm-400 text-center">
                💡 提示：输入名称后直接按 Enter 回车键即可极速创建并开始写作
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && currentFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-surface border border-cream-300 rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 确认删除</h3>
            <p className="text-xs text-warm-500 mb-1">将把文件移入回收站：</p>
            <p className="text-xs text-warm-700 font-mono bg-cream-200 rounded px-2 py-1.5 mb-4">{currentFile.path}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-3 py-2 rounded-lg text-xs bg-cream-200 text-warm-600 hover:bg-cream-300">取消</button>
              <button onClick={handleDelete} className="flex-1 px-3 py-2 rounded-lg text-xs bg-rose-600 text-white hover:bg-rose-500">删除</button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {showRenameDialog && currentFile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-surface border border-cream-300 rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-sm font-semibold text-warm-700 mb-4">重命名笔记</h3>
            <div className="space-y-3">
              <div><label className="text-[11px] text-warm-500 mb-1 block">当前路径</label>
                <div className="text-xs text-warm-400 font-mono bg-cream-200 rounded px-2 py-1.5">{currentFile.path}</div></div>
              <div><label className="text-[11px] text-warm-500 mb-1 block">新路径</label>
                <input type="text" value={renamePath} onChange={e => setRenamePath(e.target.value)}
                  placeholder="new-folder/new-name.md" autoFocus
                  className="w-full bg-cream-200 border border-cream-300 rounded-lg px-3 py-2 text-sm text-warm-700 outline-none focus:border-accent-orange" /></div>
              <p className="text-[10px] text-warm-400">重命名后会自动更新所有 [[wikilinks]]。</p>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowRenameDialog(false); setRenamePath('') }} className="flex-1 px-3 py-2 rounded-lg text-xs bg-cream-200 text-warm-600 hover:bg-cream-300">取消</button>
                <button onClick={handleRename} disabled={!renamePath} className="flex-1 px-3 py-2 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40">重命名</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Edit Result Panel */}
      {showAiResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-surface border border-cream-300 rounded-2xl w-[600px] max-h-[80vh] shadow-2xl flex flex-col animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-orange" />
                <h3 className="text-sm font-semibold text-warm-700">AI {aiAction}</h3>
              </div>
              <button onClick={() => { setShowAiResult(false); setAiResult(''); setAiAction('') }}
                className="p-1 rounded hover:bg-cream-200 text-warm-400"><X className="w-4 h-4" /></button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {aiEditing ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-6 h-6 text-accent-orange animate-spin" />
                  <span className="text-sm text-warm-500">AI 正在{aiAction}...</span>
                  <span className="text-xs text-warm-400">请稍候，正在处理笔记内容</span>
                </div>
              ) : (
                <div className="md-preview">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeHighlight, rehypeKatex]}
                    components={{
                      h1: ({ children }) => <h1 className="text-lg font-bold text-warm-800 mt-4 mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold text-warm-700 mt-3 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold text-warm-700 mt-3 mb-1">{children}</h3>,
                      p: ({ children }) => <p className="text-sm text-warm-600 leading-relaxed my-2">{children}</p>,
                      code: ({ className, children, ...props }) => {
                        const isInline = !className
                        return isInline
                          ? <code className="bg-cream-200 text-accent-sage px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                          : <code className={className} {...props}>{children}</code>
                      },
                      pre: ({ children }) => <pre className="bg-cream-100 border border-cream-200 rounded-lg p-3 my-2 overflow-x-auto text-xs">{children}</pre>,
                      ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm text-warm-600">{children}</li>,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-accent-orange pl-3 text-warm-500 italic my-2">{children}</blockquote>,
                    }}
                  >
                    {aiResult}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Footer */}
            {!aiEditing && aiResult && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-cream-200 bg-cream-100/50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(aiResult) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-cream-200 text-warm-600 hover:bg-cream-300 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" /> 复制
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setShowAiResult(false); setAiResult(''); setAiAction('') }}
                    className="px-4 py-1.5 rounded-lg text-xs bg-cream-200 text-warm-600 hover:bg-cream-300 transition-colors">
                    取消
                  </button>
                  <button onClick={applyAiResult}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 transition-colors">
                    <Undo2 className="w-3.5 h-3.5" /> 应用到编辑器
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Practice Modal */}
      <QuickPracticeModal
        isOpen={practiceModalOpen}
        onClose={() => setPracticeModalOpen(false)}
        noteTitle={currentFile?.title || title || '当前考研笔记'}
        noteContent={content}
        notePath={currentFile?.path}
      />

      {/* Obsidian Sync Verification Modal */}
      <ObsidianSyncModal
        isOpen={obsidianSyncModalOpen}
        onClose={() => setObsidianSyncModalOpen(false)}
        onRefresh={() => {
          reloadTree()
          api.getStats().then(s => setVaultStats({ totalNotes: s.totalNotes, vaultPath: s.vaultPath })).catch(() => {})
        }}
      />
    </div>
  )
}


// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolBtn({ icon: Icon, label, onClick, className, suffix }: {
  icon: React.FC<{ className?: string }>; label: string; onClick: () => void; className?: string; suffix?: string
}) {
  return (
    <button onClick={onClick} title={label}
      className={`p-1.5 rounded text-warm-500 hover:text-warm-700 hover:bg-cream-200 transition-colors relative ${className || ''}`}>
      <Icon className="w-3.5 h-3.5" />
      {suffix && <span className="absolute -bottom-0.5 -right-0.5 text-[8px] text-warm-400 font-bold">{suffix}</span>}
    </button>
  )
}
