import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Save, Trash2, FileEdit, FilePlus, Upload,
  ChevronDown, ChevronRight, X, Loader2, AlertTriangle,
  FolderTree, Eye, Bold, Italic, Heading, List, Code,
  Link, Table, Hash, Sparkles, Wand2,
  Undo2, Copy, Check, Quote, Strikethrough, Minus, ListOrdered,
  Sigma, Target, Image as ImageIcon, PenTool, MoreHorizontal, FileText,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import 'highlight.js/styles/github-dark.css'
import 'katex/dist/katex.min.css'
import { api, type FileDetail, type IngestStatus, type IngestResult, type AttachmentResult } from '../services/api'
import { useVaultTree } from '../hooks/useVaultData'
import MarkdownRenderer from '../components/MarkdownRenderer'
import FileExplorer from '../components/FileExplorer'
import QuickPracticeModal from '../components/QuickPracticeModal'
import ObsidianSyncModal from '../components/ObsidianSyncModal'
import HandwritingModal from '../components/HandwritingModal'
import InteractiveAnnotationOverlay from '../components/InteractiveAnnotationOverlay'


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
  // 解析标准 Markdown 图片：![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />')
  // 解析 Obsidian 维基图片：![[filename.png]]
  html = html.replace(/!\[\[(.*?\.(?:png|jpg|jpeg|gif|webp|svg|bmp))\]\]/gi, '<img src="/api/vault/attachment?path=attachments/$1" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" />')
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
      case 'img': {
        const src = element.getAttribute('src') || ''
        const alt = element.getAttribute('alt') || '笔记插图'
        return src ? `![${alt}](${src})\n\n` : ''
      }
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
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [currentFile, setCurrentFile] = useState<FileDetail | null>(null)
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [tags, setTags] = useState('')
  const [title, setTitle] = useState('')
  const [showFm, setShowFm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [dirty, setDirty] = useState(false)
  const [showFiles, setShowFiles] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true)
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false)
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

  // Preview & Mode states
  const [showPreview, setShowPreview] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('mode') === 'preview' || params.get('from') === 'search'
    }
    return false
  })
  const [showModeNotice, setShowModeNotice] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('mode') === 'preview' || params.get('from') === 'search'
    }
    return false
  })
  const [editorMode, setEditorMode] = useState<'write' | 'markdown'>('write')
  const [richHtml, setRichHtml] = useState('')

  // AI Edit state
  const [showAiMenu, setShowAiMenu] = useState(false)
  const [aiEditing, setAiEditing] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiAction, setAiAction] = useState('')
  const [showAiResult, setShowAiResult] = useState(false)
  const [showMathMenu, setShowMathMenu] = useState(false)
  const [showMoreFormatTools, setShowMoreFormatTools] = useState(false)
  const [practiceModalOpen, setPracticeModalOpen] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const richEditorRef = useRef<HTMLDivElement>(null)
  const richEditorFocusedRef = useRef(false)
  const isComposingRef = useRef(false)
  const [obsidianSyncModalOpen, setObsidianSyncModalOpen] = useState(false)
  const [showHandwritingModal, setShowHandwritingModal] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isAnnotationActive, setIsAnnotationActive] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const paperDocumentRef = useRef<HTMLDivElement>(null)
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
      // 知识图谱节点指向尚未创建的考点笔记：提供高审美友好空状态与标准考纲模版引导
      const cleanName = decodeURIComponent(filePath).split(/[\\/]/).pop()?.replace(/\.md$/i, '') || filePath
      setCurrentFile(null)
      setTitle(cleanName)
      setNewFileName(cleanName)
      setTags('考研考点, 核心精读')
      
      const draftTemplate = `# ${cleanName}\n\n> 🎯 **考研大纲考点精读与真题归纳**\n> - 关联科目：考研核心统考学科\n> - 来源导航：知识图谱考纲节点推荐（草稿待归档）\n\n---\n\n## 一、 核心概念与大纲要求\n- 基本定义与核心理论推导背景；\n- 统考大纲对本考点的重点考察形式（选择题 / 综合应用大题）。\n\n## 二、 核心性质与定理推导\n1. 重点算法 / 逻辑结构：\n2. 关键时空复杂度分析：\n\n## 三、 历年统考真题考法与避坑指南\n- 陷阱剖析：易混淆概念与做题误区；\n- 阅卷采分点踩分提示。\n\n## 四、 双链延伸网络\n- 关联前置考点：[[考研核心讲义]]\n- 关联真题测验：[[做题中心错题本]]\n`
      
      setContent(draftTemplate)
      const nextHtml = markdownToRichHtml(draftTemplate)
      setRichHtml(nextHtml)
      if (richEditorRef.current) {
        richEditorRef.current.innerHTML = nextHtml
      }
      setOriginalContent('')
      setSaveMsg(`💡 考点笔记「${cleanName}」尚未收录，已自动加载考纲标准模版，点击「保存」即可一键入库！`)
    }
  }, [])

  // Check URL params for file to open (from search / graph / wikilinks)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const filePath = params.get('path') || params.get('file')
    const mode = params.get('mode')
    const fromSearch = params.get('from') === 'search' || mode === 'preview'
    if (filePath) {
      loadFile(filePath)
      if (fromSearch) {
        setShowPreview(true)
        setShowModeNotice(true)
      } else {
        setShowPreview(false)
        setShowModeNotice(false)
      }
      // Clean URL via React Router to keep location state consistent
      navigate('/editor', { replace: true })
    }
  }, [location.search, loadFile, navigate])

  // 监听 Obsidian 预览双链点击事件 [[笔记名]]，实现无缝跳转与即时创建（优先预览）
  useEffect(() => {
    const handleWikilink = (e: any) => {
      const target = e.detail?.target
      if (!target) return
      const cleanPath = target.endsWith('.md') ? target : (target + '.md')
      loadFile(cleanPath)
      setShowPreview(true)
      setShowModeNotice(true)
    }
    window.addEventListener('wikilink-clicked', handleWikilink)
    return () => window.removeEventListener('wikilink-clicked', handleWikilink)
  }, [loadFile])




  const handleSwitchToWriting = () => {
    setShowPreview(false)
    setShowModeNotice(false)
    setSaveMsg('已切换为写作模式，可直接编辑修改笔记')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const handleTogglePreview = () => {
    if (showPreview) {
      handleSwitchToWriting()
    } else {
      setShowPreview(true)
      setShowModeNotice(false)
    }
  }

  const handleFileClick = (filePath: string, options?: { mode?: 'preview' | 'write'; fromSearch?: boolean }) => {
    if (currentFile?.path === filePath) {
      if (options?.mode === 'preview' || options?.fromSearch) {
        setShowPreview(true)
        setShowModeNotice(true)
      }
      if (window.innerWidth < 768) setShowFiles(false)
      return
    }
    if (dirty && !window.confirm('当前笔记有未保存修改，切换后这些修改会丢失。继续切换吗？')) return
    loadFile(filePath)
    if (options?.mode === 'preview' || options?.fromSearch) {
      setShowPreview(true)
      setShowModeNotice(true)
    }
    if (window.innerWidth < 768) setShowFiles(false)
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

  const handleNewFile = (forceDialog = false) => {
    if (dirty && !window.confirm('当前笔记有未保存修改，新建后这些修改会丢失。继续新建吗？')) return
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const min = String(now.getMinutes()).padStart(2, '0')
    const defaultName = `考点速记_${month}${day}_${hour}${min}`

    setCurrentFile(null)
    setContent('')
    setRichHtml('')
    setOriginalContent('')
    setTags('')
    setTitle(defaultName)
    setNewFileName(defaultName)
    setNewFileFolder('wiki')
    setNewFilePath(`wiki/${defaultName}.md`)
    setNewTemplateKey('blank')
    setShowPreview(false)
    setShowModeNotice(false)

    // 移动端或快捷新建：直接进入即写状态，杜绝繁琐多层弹窗干扰
    if (forceDialog) {
      setShowNewDialog(true)
    } else {
      setShowNewDialog(false)
      setSaveMsg('✨ 已进入极速编辑态，直接输入标题与正文，点击右上角保存即可落盘')
      setTimeout(() => {
        const titleEl = document.querySelector('input[aria-label="笔记标题"]') as HTMLInputElement
        titleEl?.focus()
      }, 150)
      setTimeout(() => setSaveMsg(''), 4000)
    }
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

  // ─── 图片与手写插入处理 ──────────────────────────────────────────────────────────

  const insertImageToContent = (attachmentUrl: string, filename: string, alt = '笔记插图') => {
    const mdImg = `![${alt}](${attachmentUrl})`
    const htmlImg = `<p><img src="${attachmentUrl}" alt="${alt}" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" /></p>`

    if (editorMode === 'write') {
      richEditorRef.current?.focus()
      execRich('insertHTML', htmlImg)
      syncRichContent()
    } else {
      const el = ta()
      if (el) {
        insertBlock(el, mdImg, content, setContent)
      } else {
        setContent(prev => prev ? `${prev}\n\n${mdImg}\n` : `${mdImg}\n`)
      }
    }
    setSaveMsg('已成功插入图片')
  }

  const handlePasteEvent = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    let imageItem: DataTransferItem | null = null
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        imageItem = items[i]
        break
      }
    }

    if (imageItem) {
      e.preventDefault()
      const file = imageItem.getAsFile()
      if (!file) return

      try {
        setIsUploadingImage(true)
        setSaveMsg('正在上传剪贴板图片...')
        const res = await api.uploadAttachment(file, 'paste')
        insertImageToContent(res.url, res.filename, '截图')
      } catch (err: any) {
        setSaveMsg(`图片粘贴失败：${err.message}`)
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const handleEditorDrop = async (e: React.DragEvent) => {
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(f => f.type.startsWith('image/'))

    if (imageFiles.length > 0) {
      e.preventDefault()
      e.stopPropagation()
      try {
        setIsUploadingImage(true)
        setSaveMsg(`正在上传 ${imageFiles.length} 张图片...`)
        for (const img of imageFiles) {
          const res = await api.uploadAttachment(img, 'drop', img.name)
          insertImageToContent(res.url, res.filename, img.name.replace(/\.[^/.]+$/, ''))
        }
      } catch (err: any) {
        setSaveMsg(`图片上传失败：${err.message}`)
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setIsUploadingImage(true)
      setSaveMsg(`正在上传图片...`)
      for (const file of Array.from(files)) {
        const res = await api.uploadAttachment(file, 'photo', file.name)
        insertImageToContent(res.url, res.filename, file.name.replace(/\.[^/.]+$/, ''))
      }
    } catch (err: any) {
      setSaveMsg(`图片上传失败：${err.message}`)
    } finally {
      setIsUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  const handleHandwritingInsert = (attachment: AttachmentResult) => {
    insertImageToContent(attachment.url, attachment.filename, '手写草稿')
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
      className="h-full w-full max-w-full flex gap-0 overflow-x-hidden"
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* 移动端遮罩 Backdrop */}
      {showFiles && (
        <div
          className="fixed inset-0 bg-warm-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setShowFiles(false)}
        />
      )}

      {/* File Explorer Sidebar: 移动端为侧滑抽屉，桌面端保持经典侧边栏 */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#fbfbfc] shadow-xl transition-transform duration-200
        lg:static lg:z-auto lg:shadow-none lg:transition-all
        ${showFiles ? 'translate-x-0 lg:w-56' : '-translate-x-full lg:w-0'}
        overflow-hidden border-r border-cream-200 flex flex-col shrink-0
      `}>
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-cream-200 lg:hidden bg-cream-100/90 shrink-0">
          <span className="font-semibold text-xs text-warm-800 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-accent-orange" /> 笔记目录
          </span>
          <button
            onClick={() => setShowFiles(false)}
            className="p-1 rounded-lg text-warm-500 hover:text-warm-800 hover:bg-cream-200"
            title="关闭目录"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <FileExplorer tree={tree} onFileClick={handleFileClick} selectedPath={currentFile?.path} />
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden">
        {/* Top Toolbar: File operations (自适应防溢出，手机端超紧凑精致排版) */}
        <div className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 border-b border-slate-200/80 bg-white/95 shrink-0 max-w-full overflow-x-auto no-scrollbar">
          <button onClick={() => setShowFiles(!showFiles)}
            className={`p-1.5 rounded-lg text-xs transition-colors shrink-0 ${showFiles ? 'bg-cream-200 text-warm-600' : 'text-warm-500 hover:text-warm-700'}`}
            title={showFiles ? '隐藏文件列表' : '显示文件列表'}>
            <FolderTree className="w-4 h-4" />
          </button>
          <div className="w-px h-4 sm:h-5 bg-cream-200 shrink-0" />
          <button onClick={() => handleNewFile(false)}
            className="subframe-btn-black px-2 py-1 sm:px-2.5 sm:py-1.5 text-[11px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-xs"
            title="极速新建空白笔记，开箱即写">
            <FilePlus className="w-3.5 h-3.5" /> <span>新建</span>
          </button>
          <button onClick={() => setShowNewDialog(true)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shrink-0 cursor-pointer shadow-xs"
            title="选择学习卡片、错题复盘或灵感模板">
            <span>模板</span>
          </button>
          {/* Obsidian Sync Status Pill (只在电脑或平板宽屏展示) */}
          <button
            onClick={() => setObsidianSyncModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 transition-all cursor-pointer shadow-xs shrink-0"
            title="点击查看与本地 Obsidian 实时双向同步状态及文件夹"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-medium">Obsidian 同步</span>
            <span className="subframe-pill text-2xs">
              {typeof vaultStats?.totalNotes === 'number' ? `${vaultStats.totalNotes} 篇` : '就绪'}
            </span>
          </button>
          <button onClick={handleSave} disabled={saving || (!dirty && !!currentFile)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-2xs sm:text-xs bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 font-semibold shadow-xs cursor-pointer active:scale-95">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} 
            <span>保存</span>
          </button>
          {currentFile && (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              <button onClick={() => setShowRenameDialog(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs bg-slate-100 text-warm-700 hover:bg-slate-200 transition-colors">
                <FileEdit className="w-3.5 h-3.5" /> 重命名
              </button>
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs bg-slate-100 text-accent-rose hover:bg-accent-rose/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> 删除
              </button>
            </div>
          )}
          <div className="hidden sm:block w-px h-5 bg-cream-200 shrink-0" />
          {/* Import */}
          <div className="relative hidden sm:block shrink-0">
            <input ref={fileInputRef} type="file" multiple
              accept={ingestStatus?.supportedFormats?.join(',') || '.pdf,.docx,.xlsx,.pptx,.html,.csv'}
              onChange={handleImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={importing}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 disabled:opacity-40 transition-all cursor-pointer shadow-xs">
              {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              导入{importing && batchProgress ? ` (${batchProgress.done}/${batchProgress.total})` : ''}
            </button>
          </div>

          {/* Practice */}
          <button
            onClick={() => setPracticeModalOpen(true)}
            disabled={!currentFile && !content.trim()}
            className="subframe-btn-secondary px-3 py-1.5 text-xs font-medium hidden md:flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer shadow-xs"
            title="基于本篇笔记考点，立即生成 3 道测试题进行随堂真题测验"
          >
            <Target className="w-3.5 h-3.5 text-slate-700" /> <span>即学即练</span>
          </button>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
            {saveMsg && (
              <div className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md shrink-0 ${saveMsg.includes('失败') ? 'text-accent-rose bg-accent-rose/10' : 'text-accent-sage bg-accent-sage/10'}`}>
                {saveMsg}
              </div>
            )}
            {dirty && (
              <div className="text-[10px] sm:text-xs text-accent-amber flex items-center gap-0.5 sm:gap-1 shrink-0 px-1 py-0.5" title="有未保存的修改">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> <span className="hidden sm:inline">未保存</span>
              </div>
            )}
            <button
              onClick={handleTogglePreview}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-2xs sm:text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                showPreview
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs ring-2 ring-indigo-200 dark:ring-indigo-900'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
              title={showPreview ? '当前处于预览模式，如需修改请点击切换写作模式' : '切换为预览模式查看排版渲染'}
              aria-label={showPreview ? '切换为写作模式' : '切换为预览模式'}
            >
              {showPreview ? (
                <>
                  <FileEdit className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden sm:inline">切换写作模式</span>
                  <span className="sm:hidden">写作</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">预览模式</span>
                  <span className="sm:hidden">预览</span>
                </>
              )}
            </button>
            <button
              onClick={() => setMobileActionsOpen(true)}
              className="md:hidden p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 active:scale-95 transition-all shrink-0"
              title="更多笔记操作（重命名、删除、模板、导入、即学即练）"
              aria-label="更多操作"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 模式提示横幅：搜索跳转优先预览，提示用户如需修改请切换写作模式 */}
        {showPreview && showModeNotice && (
          <div className="relative z-20 flex items-center justify-between gap-2 px-2.5 sm:px-5 py-1.5 sm:py-2.5 bg-gradient-to-r from-indigo-50/95 via-sky-50/90 to-indigo-50/95 dark:from-indigo-950/70 dark:via-slate-900/80 dark:to-indigo-950/70 border-b border-indigo-200/80 dark:border-indigo-800/80 text-[11px] sm:text-xs text-indigo-900 dark:text-indigo-200 shadow-xs animate-fade-in max-w-full">
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
              <span className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-[9px] sm:text-[10px] font-bold shadow-2xs">
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                <span className="hidden sm:inline">已为您优先载入</span><strong className="text-indigo-700 dark:text-indigo-300 font-bold mx-0.5 sm:mx-1">预览模式</strong>。<span className="hidden sm:inline">如需编辑请</span>切换写作
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={handleSwitchToWriting}
                className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] sm:text-xs shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                title="立即切换至写作模式进行修改"
              >
                <FileEdit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">切换写作模式</span>
                <span className="sm:hidden">写作</span>
              </button>
              <button
                onClick={() => setShowModeNotice(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer shrink-0"
                title="关闭提示"
                aria-label="关闭提示"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Formatting Toolbar - 仅写作模式展示，手机端单行横滑，精致微缩防溢出 */}
        {!showPreview && (
        <div className="relative shrink-0 border-b border-cream-200 bg-white/90 max-w-full overflow-hidden">
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar max-w-full">
            <div className="mr-1 flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 shrink-0">
              <button
                onClick={() => switchEditorMode('write')}
                className={`rounded px-2 py-0.5 sm:px-2.5 sm:py-1 text-2xs sm:text-2xs transition-colors ${editorMode === 'write' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                富文本
              </button>
              <button
                onClick={() => switchEditorMode('markdown')}
                className={`rounded px-2 py-0.5 sm:px-2.5 sm:py-1 text-2xs sm:text-2xs transition-colors ${editorMode === 'markdown' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                源码
              </button>
            </div>

            {/* 就地手写批注放在工具栏内，不常驻浮在正文和预览按钮上 */}
            <button
              onClick={() => {
                if (editorMode !== 'write') switchEditorMode('write')
                setIsAnnotationActive(!isAnnotationActive)
              }}
              title="提笔批注"
              className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all shrink-0 border cursor-pointer ${
                isAnnotationActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'subframe-btn-secondary text-slate-700'
              }`}
            >
              <PenTool className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{isAnnotationActive ? '完成批注' : '提笔批注'}</span>
            </button>

            <button
              onClick={() => { setShowAiMenu(!showAiMenu); setShowMathMenu(false) }}
              disabled={!content.trim()}
              className="subframe-btn-black px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium flex items-center gap-1 sm:gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-40 shadow-xs"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>AI 润色</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAiMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* 常用核心组（保持精简清爽，不再 17 个图标挤成一团） */}
            <div className="flex items-center bg-slate-100/90 border border-slate-200/80 rounded-lg p-0.5 shrink-0 gap-0.5">
              <ToolBtn icon={Bold} label="粗体 (Ctrl+B)" onClick={fmt.bold} />
              <ToolBtn icon={Heading} label="二级章节标题" onClick={fmt.h2} suffix="2" />
              <ToolBtn icon={List} label="无序要点列表" onClick={fmt.list} />
              <ToolBtn
                icon={Sigma}
                label="插入数学公式"
                onClick={() => { setShowMathMenu(!showMathMenu); setShowAiMenu(false) }}
                className={showMathMenu ? 'bg-white text-indigo-700 font-bold shadow-xs' : ''}
              />
            </div>

            {/* 媒体与草稿纸组 */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => imageInputRef.current?.click()}
                title="插入真题插图或板书照片"
                className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-2xs sm:text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all border border-slate-200/80 cursor-pointer shadow-xs"
              >
                <ImageIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600" />
                <span>插图</span>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileSelect}
              />
              <button
                onClick={() => setShowHandwritingModal(true)}
                title="全屏手写演草纸与公式演算"
                className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-2xs sm:text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-all border border-slate-200/80 cursor-pointer shadow-xs"
              >
                <span>演草纸</span>
              </button>
            </div>

            {/* 可折叠工具抽屉按钮：收纳其余不常用排版图标 */}
            <button
              type="button"
              onClick={() => setShowMoreFormatTools(prev => !prev)}
              className={`ml-auto flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all shrink-0 border cursor-pointer ${
                showMoreFormatTools
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
              title={showMoreFormatTools ? '收起扩展排版工具' : '展开更多排版工具（斜体、标题、代码块、表格、双链等）'}
            >
              <span>{showMoreFormatTools ? '收起工具' : '更多排版'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showMoreFormatTools ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* 第二层：可折叠的扩展排版工具条 */}
          {showMoreFormatTools && (
            <div className="flex flex-wrap items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-slate-50/90 border-t border-slate-200/70 animate-fade-in">
              <div className="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 gap-0.5">
                <ToolBtn icon={Italic} label="斜体 (Ctrl+I)" onClick={fmt.italic} />
                <ToolBtn icon={Strikethrough} label="删除线" onClick={fmt.strike} />
              </div>
              <div className="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 gap-0.5">
                <ToolBtn icon={Heading} label="一级大标题" onClick={fmt.h1} suffix="1" />
                <ToolBtn icon={Heading} label="三级考点" onClick={fmt.h3} suffix="3" />
              </div>
              <div className="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 gap-0.5">
                <ToolBtn icon={ListOrdered} label="步骤有序列表" onClick={fmt.olist} />
                <ToolBtn icon={Quote} label="定理与名言引用" onClick={fmt.quote} />
                <ToolBtn icon={Code} label="408 核心算法代码块" onClick={fmt.code} />
              </div>
              <div className="flex items-center bg-white border border-slate-200/80 rounded-lg p-0.5 gap-0.5">
                <ToolBtn icon={Table} label="对比表格" onClick={fmt.table} />
                <ToolBtn icon={Hash} label="考点双链 [[...]]" onClick={fmt.wiki} />
                <ToolBtn icon={Link} label="超链接" onClick={fmt.link} />
                <ToolBtn icon={Minus} label="分隔线" onClick={fmt.hr} />
              </div>
            </div>
          )}

          {/* 独立挂载的数学公式菜单（不被横向滚动条裁剪，小屏宽度自适应） */}
          {showMathMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMathMenu(false)} />
              <div className="absolute left-2 sm:left-3 top-full mt-1 w-64 sm:w-68 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 animate-fade-in-up">
                <div className="px-2.5 py-1.5 border-b border-slate-100 text-2xs text-slate-600 font-bold flex items-center justify-between">
                  <span>LaTeX 数学公式速插</span>
                  <span className="text-2xs text-slate-900 font-normal">实时 KaTeX 渲染</span>
                </div>
                <div className="max-h-60 overflow-y-auto modal-scroll-contain py-1 space-y-0.5">
                  {mathSnippets.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInsertMath(m.snippet)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      <span className="font-semibold">{m.label}</span>
                      <span className="font-mono text-2xs text-slate-400">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 独立挂载的 AI 智能编辑菜单（小屏宽度自适应） */}
          {showAiMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAiMenu(false)} />
              <div className="absolute right-2 sm:right-3 top-full mt-1 w-56 sm:w-60 max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <span className="text-2xs font-bold text-slate-700">✨ AI 智能编辑助手</span>
                </div>
                {aiActions.map(action => (
                  <button
                    key={action.key}
                    onClick={() => handleAiEdit(action.key)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <action.icon className="w-4 h-4 text-slate-900 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{action.label}</div>
                      <div className="text-2xs text-slate-400">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        )}

        {/* 📱 移动端更多笔记管理与研学操作抽屉 (Bottom Sheet 精致紧凑化) */}
        {mobileActionsOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/45 backdrop-blur-xs modal-backdrop-contain"
            onClick={() => setMobileActionsOpen(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-t-2xl sm:rounded-t-3xl p-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl border-t border-slate-200 space-y-2.5 animate-sheet-up"
            >
              <div className="flex justify-center pb-0.5">
                <div className="w-9 h-1 rounded-full bg-slate-300" />
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900">笔记管理与 AI 研学工具</span>
                <button
                  onClick={() => setMobileActionsOpen(false)}
                  className="p-1 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setMobileActionsOpen(false); setPracticeModalOpen(true) }}
                  disabled={!currentFile && !content.trim()}
                  className="col-span-2 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] sm:text-xs font-bold shadow-xs disabled:opacity-40 active:scale-[0.99]"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>🎯 即学即练（根据当前笔记出 3 道真题）</span>
                </button>

                <button
                  onClick={() => { setMobileActionsOpen(false); setShowNewDialog(true) }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-800 active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                  <span>使用笔记模板</span>
                </button>

                <button
                  onClick={() => { setMobileActionsOpen(false); fileInputRef.current?.click() }}
                  disabled={importing}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-800 active:scale-95 disabled:opacity-40"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>导入外部文档</span>
                </button>

                <button
                  onClick={() => { setMobileActionsOpen(false); setObsidianSyncModalOpen(true) }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/70 text-[11px] sm:text-xs font-bold text-purple-800 active:scale-95"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>同步状态 ({typeof vaultStats?.totalNotes === 'number' ? vaultStats.totalNotes : 0} 篇)</span>
                </button>

                <button
                  onClick={() => { setMobileActionsOpen(false); setShowFiles(true) }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-800 active:scale-95"
                >
                  <FolderTree className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>知识库目录</span>
                </button>

                {currentFile && (
                  <>
                    <button
                      onClick={() => { setMobileActionsOpen(false); setShowRenameDialog(true) }}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-700 active:scale-95"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span>重命名笔记</span>
                    </button>
                    <button
                      onClick={() => { setMobileActionsOpen(false); setShowDeleteConfirm(true) }}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-[11px] sm:text-xs font-bold text-rose-600 active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>删除笔记</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Import status bar */}
        {ingestStatus && (
          <div className="hidden sm:flex px-4 py-1 border-b border-cream-200 bg-surface/30 text-2xs text-warm-400 items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${ingestStatus.installed ? 'bg-accent-sage' : 'bg-accent-amber'}`} />
            markitdown: {ingestStatus.installed ? `已安装 (${ingestStatus.pythonVersion})` : '未安装 — 拖拽文件到此处导入'}
            {importError && <span className="text-rose-400 ml-2">{importError}</span>}
          </div>
        )}

        {/* Editor + Preview */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Drag overlay */}
          {dragOver && (
            <div className="absolute inset-0 z-40 bg-accent-orange/10 border-2 border-dashed border-accent-orange rounded-lg flex items-center justify-center pointer-events-none">
              <div className="text-lg font-semibold text-accent-orange bg-cream-100/90 px-6 py-3 rounded-xl">
                松开导入文档
              </div>
            </div>
          )}

          {/* Editor Panel (Writing Mode) */}
          {!showPreview && (
            <div className="min-h-0 flex-1 flex flex-col overflow-hidden w-full max-w-full">
            {/* Note title */}
            <div className="border-b border-slate-200/80 bg-white px-3 py-2 sm:px-5 sm:py-3.5 max-w-full">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="输入笔记标题..."
                aria-label="笔记标题"
                className="w-full bg-transparent text-sm sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300"
              />
              <div className="mt-1 flex items-center justify-between gap-1.5 text-2xs sm:text-2xs text-slate-400 max-w-full min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  {currentFile ? (
                    <>
                      <span className="max-w-[140px] sm:max-w-[360px] truncate font-mono">{currentFile.path}</span>
                      <span>·</span>
                      <span className="shrink-0">{currentFile.wordCount} 字</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="hidden sm:inline">{currentFile.links.length} 条双链</span>
                    </>
                  ) : (
                    <span className="truncate">新笔记 · 保存后自动归档至知识库</span>
                  )}
                </div>
                {!currentFile && (
                  <button
                    type="button"
                    onClick={() => setShowFiles(true)}
                    className="lg:hidden text-2xs sm:text-2xs font-bold text-slate-900 shrink-0 flex items-center gap-1"
                  >
                    <FolderTree className="w-3 h-3" />
                    <span>选已有笔记</span>
                  </button>
                )}
              </div>
            </div>

            {/* Frontmatter editor */}
            <div className="border-b border-cream-200">
              <button onClick={() => setShowFm(!showFm)}
                className="w-full flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 text-xs text-warm-500 hover:text-warm-700 transition-colors">
                {showFm ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                笔记属性
              </button>
              {showFm && (
                <div className="px-3 sm:px-4 pb-2.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-2xs text-warm-400 w-10 sm:w-12 shrink-0">标签</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                      placeholder="用逗号分隔，例如：数据结构, 复习"
                      className="flex-1 bg-cream-200 border border-cream-300 rounded px-2 py-1 text-xs text-warm-700 outline-none focus:border-accent-orange" />
                  </div>
                </div>
              )}
            </div>

            {/* 图片上传中指示 */}
            {isUploadingImage && (
              <div className="absolute top-3 right-5 z-30 flex items-center gap-2 px-3 py-1 bg-accent-orange text-white text-xs font-bold rounded-full shadow-xl animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>图片上传中...</span>
              </div>
            )}

            {editorMode === 'write' ? (
              <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-100/70 dark:bg-slate-950/60 p-1 sm:p-4 md:p-6 flex flex-col items-center w-full max-w-full">
                {/* 讲义级交互纸张视窗 */}
                <div
                  ref={paperDocumentRef}
                  className="relative w-full max-w-4xl min-h-[85vh] bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-sm hover:shadow border border-slate-200/90 dark:border-slate-800 p-2.5 sm:p-6 md:p-10 transition-shadow max-w-full overflow-x-hidden"
                >
                  {/* 随页就地手写批注图层（完全覆盖于正文与插图之上，随页面滚动与自适应，智能笔直接书写） */}
                  <InteractiveAnnotationOverlay
                    notePath={currentFile?.path}
                    contentContainerRef={paperDocumentRef}
                    isAnnotationActive={isAnnotationActive}
                    onToggleAnnotation={setIsAnnotationActive}
                  />

                  {/* 富文本讲义正文与图片流 */}
                  <div
                    ref={richEditorRef}
                    key={currentFile?.path || 'new-note-writing'}
                    contentEditable={!isAnnotationActive}
                    suppressContentEditableWarning
                    onFocus={() => { richEditorFocusedRef.current = true }}
                    onBlur={() => { richEditorFocusedRef.current = false }}
                    onCompositionStart={() => { isComposingRef.current = true }}
                    onCompositionEnd={() => { isComposingRef.current = false; syncRichContent() }}
                    onInput={syncRichContent}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePasteEvent}
                    onDrop={handleEditorDrop}
                    onDragOver={(e) => { e.preventDefault() }}
                    dangerouslySetInnerHTML={{ __html: richHtml }}
                    data-placeholder={currentFile || showNewDialog ? '从这里开始写作与排版… (支持粘贴截图、拖拽图片、点击上方直接提笔手写批注)' : '点击上方「新建」或「打开已有笔记」开始写作…'}
                    className="rich-note-editor relative z-10 min-h-full text-[14px] sm:text-[16px] leading-relaxed sm:leading-8 text-warm-800 dark:text-slate-200 outline-none max-w-full break-words"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-1 overflow-hidden w-full max-w-full">
                <div className="hidden sm:block w-10 shrink-0 overflow-hidden border-r border-cream-200 bg-surface/50 select-none">
                  <div className="py-3 pr-2 text-right">
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i} className="font-mono text-2xs leading-relaxed text-warm-400" style={{ height: '1.625em' }}>
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
                  onPaste={handlePasteEvent}
                  onDrop={handleEditorDrop}
                  onDragOver={(e) => { e.preventDefault() }}
                  placeholder={currentFile || showNewDialog ? '从这里开始写作… (支持Ctrl+V粘贴截图、拖拽图片与手写插入)' : '点击上方「新建」或「打开已有笔记」开始写作…'}
                  className="flex-1 resize-none bg-transparent px-2.5 py-2.5 sm:px-4 sm:py-4 font-sans text-[13px] sm:text-[15px] leading-relaxed sm:leading-7 text-warm-700 outline-none placeholder:text-warm-300 max-w-full"
                  spellCheck
                />
              </div>
            )}
          </div>
        )}

          {/* Preview Panel — Professional Academic Markdown Rendering (Preview Mode) */}
          {showPreview && (
            <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden bg-slate-100/70 dark:bg-slate-950/60 p-1.5 sm:p-4 md:p-6 flex flex-col items-center">
              <div className="relative w-full max-w-4xl min-h-[85vh] bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-sm hover:shadow border border-slate-200/90 dark:border-slate-800 p-3 sm:p-7 md:p-10 transition-shadow max-w-full overflow-x-hidden">
                {/* 顶部标题栏与元数据 */}
                <div className="pb-3 sm:pb-4 mb-3 sm:mb-6 border-b border-slate-100 dark:border-slate-800 max-w-full">
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-2xs sm:text-2xs tracking-wider">
                          预览模式
                        </span>
                        <span className="text-2xs sm:text-2xs text-slate-400 font-mono truncate">
                          {currentFile?.path || '新笔记'}
                        </span>
                      </div>
                      <h1 className="text-base sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight break-words">
                        {title || currentFile?.title || '未命名笔记'}
                      </h1>
                    </div>
                    <button
                      onClick={handleSwitchToWriting}
                      className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[11px] sm:text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
                      title="点击切换到写作模式进行编辑修改"
                    >
                      <FileEdit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span className="hidden sm:inline">修改笔记</span>
                      <span className="sm:hidden">修改</span>
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
                    <span>{content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').replace(/\s+/g, '').length} 字</span>
                    {currentFile?.links && currentFile.links.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{currentFile.links.length} 条双链</span>
                      </>
                    )}
                    {tags && (
                      <div className="flex flex-wrap items-center gap-1 ml-auto">
                        {tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                          <span key={tag} className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Markdown 渲染正文：包含公式、高亮、维基双链与表格增强 */}
                <div className="preview-markdown-body max-w-full overflow-x-hidden break-words text-[14px] sm:text-base">
                  <MarkdownRenderer content={content} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New File Dialog */}
      {showNewDialog && createPortal(
        <div
          onClick={() => setShowNewDialog(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] animate-in fade-in duration-150 p-3 sm:p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-surface border border-cream-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-[min(94vw,30rem)] max-h-[90dvh] overflow-y-auto overscroll-contain shadow-xl space-y-3 sm:space-y-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-warm-900 flex items-center gap-2">
                  <span>创建一篇新笔记</span>
                  <span className="text-2xs sm:text-2xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    同步至 Obsidian
                  </span>
                </h3>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-warm-400">选择模板起点并命名，创建后可在本地 Obsidian 实时查看编辑。</p>
              </div>
              <button
                onClick={() => setShowNewDialog(false)}
                className="p-1 sm:p-1.5 rounded-xl hover:bg-cream-200 text-warm-400 hover:text-warm-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-3.5">
              <div>
                <label className="text-2xs sm:text-2xs font-semibold text-warm-500 mb-1 block">从模板开始</label>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {noteTemplates.map(template => (
                    <button
                      key={template.key}
                      type="button"
                      onClick={() => applyNewTemplate(template.key)}
                      className={`rounded-lg sm:rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 text-left transition-all cursor-pointer ${
                        newTemplateKey === template.key
                          ? 'border-accent-orange bg-accent-orange/10 ring-1 ring-accent-orange'
                          : 'border-cream-300 hover:border-cream-400 hover:bg-cream-100'
                      }`}
                    >
                      <span className="block text-2xs sm:text-xs font-semibold text-warm-800">{template.label}</span>
                      <span className="mt-0.5 block text-2xs sm:text-2xs leading-3.5 sm:leading-4 text-warm-400">{template.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-2xs sm:text-2xs font-semibold text-warm-600 mb-1 block">笔记名称</label>
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
                  className="w-full bg-white border-2 border-indigo-200 focus:border-accent-orange rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-warm-800 placeholder:text-warm-300 outline-none shadow-xs transition-all"
                />
              </div>

              <div>
                <label className="text-2xs sm:text-2xs font-semibold text-warm-600 mb-1 block">放入子文件夹（可选）</label>
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
                  className="w-full bg-white border-2 border-indigo-200 focus:border-accent-orange rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-warm-800 placeholder:text-warm-300 outline-none shadow-xs transition-all"
                />
              </div>

              {/* Obsidian Local Vault Path Realtime Banner */}
              <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-purple-50 border border-purple-200/80 text-2xs sm:text-xs text-purple-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-2xs sm:text-2xs text-purple-800">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isAdmin ? '落盘保存至本地 Obsidian：' : '保存至专属研学沙盒：'}</span>
                </div>
                <div className="font-mono text-2xs sm:text-2xs text-purple-700 break-all select-all font-semibold">
                  {isAdmin ? `${vaultStats?.vaultPath || 'E:\\考研\\408考研学习'}\\` : '专属沙盒 / '}
                  {newFilePath || `${newFileName || '未命名笔记'}.md`}
                </div>
              </div>

              <div className="flex gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowNewDialog(false)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold bg-cream-200 text-warm-600 hover:bg-cream-300 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-accent-orange text-white hover:bg-accent-orange/90 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? '正在同步…' : '创建并开始写作 ↵'}
                </button>
              </div>

              <p className="text-2xs sm:text-2xs text-warm-400 text-center">
                💡 提示：输入名称后直接按 Enter 回车键即可极速创建并开始写作
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && currentFile && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface border border-cream-300 rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-xl animate-scale-up">
            <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 确认删除</h3>
            <p className="text-xs text-warm-500 mb-1">将把文件移入回收站：</p>
            <p className="text-xs text-warm-700 font-mono bg-cream-200 rounded-xl px-2.5 py-2 mb-4 break-all">{currentFile.path}</p>
            <div className="flex gap-2.5">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-cream-200 text-warm-600 hover:bg-cream-300 transition-colors cursor-pointer">取消</button>
              <button onClick={handleDelete} className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-xs transition-colors cursor-pointer">删除</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rename Dialog */}
      {showRenameDialog && currentFile && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-surface border border-cream-300 rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-xl animate-scale-up">
            <h3 className="text-sm font-semibold text-warm-700 mb-4">重命名笔记</h3>
            <div className="space-y-3">
              <div><label className="text-2xs text-warm-500 mb-1 block">当前路径</label>
                <div className="text-xs text-warm-400 font-mono bg-cream-200 rounded-xl px-2.5 py-2 break-all">{currentFile.path}</div></div>
              <div><label className="text-2xs text-warm-500 mb-1 block">新路径</label>
                <input type="text" value={renamePath} onChange={e => setRenamePath(e.target.value)}
                  placeholder="new-folder/new-name.md" autoFocus
                  className="w-full bg-cream-200 border border-cream-300 rounded-xl px-3 py-2 text-sm text-warm-700 outline-none focus:border-accent-orange" /></div>
              <p className="text-2xs text-warm-400">重命名后会自动更新所有 [[wikilinks]]。</p>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setShowRenameDialog(false); setRenamePath('') }} className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-cream-200 text-warm-600 hover:bg-cream-300 transition-colors cursor-pointer">取消</button>
                <button onClick={handleRename} disabled={!renamePath} className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-accent-orange text-white hover:bg-accent-orange/90 shadow-xs transition-colors disabled:opacity-40 cursor-pointer">重命名</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* AI Edit Result Panel */}
      {showAiResult && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 animate-fade-in">
          <div className="bg-surface border border-cream-300 rounded-2xl w-full max-w-2xl max-h-[88dvh] shadow-xl flex flex-col animate-scale-up overflow-hidden">
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
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
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
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-t border-cream-200 bg-cream-100/50 shrink-0">
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
        </div>,
        document.body
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

      {/* 智能笔手写 / 演算草图白板 (支持平板压感) */}
      <HandwritingModal
        isOpen={showHandwritingModal}
        onClose={() => setShowHandwritingModal(false)}
        onInsert={handleHandwritingInsert}
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
      className={`p-1.5 rounded text-warm-500 hover:text-warm-700 hover:bg-cream-200 transition-colors relative shrink-0 ${className || ''}`}>
      <Icon className="w-3.5 h-3.5" />
      {suffix && <span className="absolute -bottom-0.5 -right-0.5 text-[8px] text-warm-400 font-bold">{suffix}</span>}
    </button>
  )
}
