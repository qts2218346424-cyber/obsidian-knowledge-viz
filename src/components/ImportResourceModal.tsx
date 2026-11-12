import { createPortal } from 'react-dom'
import { getAuthHeaders, getAuthTokenHeaders } from '../services/auth'
import { useAuth } from '../contexts/AuthContext'
import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  BookOpen,
  Upload,
  Sparkles,
  FileText,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Layers,
  FolderOpen,
  ArrowRight,
  Database,
  Camera,
  Lock,
  Globe,
  Eye,
  ExternalLink
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'
import {
  api,
  type BookItem,
  type BookScope,
  type PdfInspectResult,
  type ResourceDomain,
  type ScanTaskState
} from '../services/api'

const DOMAIN_OPTIONS: Array<{ value: ResourceDomain; label: string; shortLabel: string }> = [
  { value: 'math', label: '考研数学 (数一/二/三)', shortLabel: '考研数学' },
  { value: 'cs_408', label: '408 计算机学科综合', shortLabel: '408 综合' },
  { value: 'english', label: '考研英语 (英一/英二)', shortLabel: '考研英语' },
  { value: 'politics', label: '考研政治 (马原/史纲/思修/新思想)', shortLabel: '考研政治' },
  { value: 'general', label: '其他专业课 / 复试综合', shortLabel: '专业课/综合' },
]

const SUBJECT_OPTIONS_BY_DOMAIN: Record<ResourceDomain, Array<{ value: string; label: string }>> = {
  math: [
    { value: '高等数学', label: '高等数学 (微积分)' },
    { value: '线性代数', label: '线性代数' },
    { value: '概率论与数理统计', label: '概率论与数理统计' },
  ],
  cs_408: [
    { value: '数据结构', label: '数据结构' },
    { value: '计算机组成原理', label: '计算机组成原理' },
    { value: '操作系统', label: '操作系统' },
    { value: '计算机网络', label: '计算机网络' },
  ],
  english: [
    { value: '阅读理解', label: '阅读理解 (Part A)' },
    { value: '完形填空与新题型', label: '完形填空与新题型' },
    { value: '长难句与翻译', label: '长难句解析与翻译' },
    { value: '英语作文', label: '大小作文与模板' },
    { value: '核心词汇', label: '核心词汇与词根' },
  ],
  politics: [
    { value: '马克思主义基本原理', label: '马克思主义基本原理 (马原)' },
    { value: '毛泽东思想和中国特色社会主义理论体系', label: '毛中特概论' },
    { value: '习近平新时代中国特色社会主义思想', label: '习思想概论 (新思想)' },
    { value: '中国近现代史纲要', label: '中国近现代史纲要 (史纲)' },
    { value: '思想道德与法治', label: '思想道德与法治 (思修)' },
    { value: '形势与政策', label: '形势与政策 (时政)' },
  ],
  general: [
    { value: '专业课综合', label: '自命题专业课综合' },
    { value: '复试面试', label: '复试笔试与面试' },
    { value: '其他通用', label: '其他通用资料' },
  ],
}

function getDomainLabel(domain?: string): string {
  return DOMAIN_OPTIONS.find(d => d.value === domain)?.shortLabel || '考研数学'
}

function getDefaultSubjectForDomain(domain?: ResourceDomain): string {
  const list = domain ? SUBJECT_OPTIONS_BY_DOMAIN[domain] : undefined
  return list?.[0]?.value || '高等数学'
}

interface CustomQuestion {
  id: string
  domain: ResourceDomain
  subject: string
  chapter?: string
  type: 'choice' | 'blank'
  difficulty: '简单' | '中等' | '困难'
  question: string
  options?: { A: string; B: string; C: string; D: string }
  answer: string
  explanation: string
  tags: string[]
  importedAt?: string
}

interface ImportResourceModalProps {
  isOpen: boolean
  onClose: () => void
  onQuestionsUpdated?: () => void
  onBooksUpdated?: () => void
  defaultTab?: 'books' | 'import_quiz' | 'analytics'
}

export default function ImportResourceModal({
  isOpen,
  onClose,
  onQuestionsUpdated,
  onBooksUpdated,
  defaultTab = 'books',
}: ImportResourceModalProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isLoggedIn = Boolean(user)
  const [activeTab, setActiveTab] = useState<'books' | 'import_quiz' | 'analytics'>(defaultTab)
  const [scopeFilter, setScopeFilter] = useState<'all' | BookScope>('all')
  const [domainFilter, setDomainFilter] = useState<'all' | ResourceDomain>('all')
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Books shelf state
  const [books, setBooks] = useState<BookItem[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null)
  const [, setBookContent] = useState<string>('')
  const [readingBook, setReadingBook] = useState(false)
  const [uploadDomain, setUploadDomain] = useState<ResourceDomain>('math')
  const [uploadCategory, setUploadCategory] = useState<string>('经典教材')
  const [isUploading, setIsUploading] = useState(false)
  const [renamingBook, setRenamingBook] = useState<BookItem | null>(null)
  const [newBookName, setNewBookName] = useState<string>('')
  const [isRenaming, setIsRenaming] = useState(false)
  const [isSuggestingName, setIsSuggestingName] = useState(false)

  // AI Extraction from Book
  const [extractSnippet, setExtractSnippet] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractResult, setExtractResult] = useState<{ note?: any; questions?: any[] } | null>(null)
  const [autoExtractStatus, setAutoExtractStatus] = useState<'idle' | 'analyzing' | 'done' | 'error'>('idle')
  const [autoExtractStep, setAutoExtractStep] = useState<string>('')
  const [autoExtractResult, setAutoExtractResult] = useState<{
    note?: any
    questions?: any[]
    savedNotePath?: string
    questionsCount?: number
    subject?: string
    isScannedImageOnly?: boolean
    warningMessage?: string
    scannedPageRange?: string
    totalPages?: number
  } | null>(null)
  const [uploadActionMode, setUploadActionMode] = useState<'scan_and_keep' | 'keep_only'>('scan_and_keep')
  const [scanExtractMode, setScanExtractMode] = useState<'question' | 'dual' | 'concept'>('question')
  const [pageRangeInput, setPageRangeInput] = useState('')
  const [activeScanTask, setActiveScanTask] = useState<ScanTaskState | null>(null)
  const [inspectInfo, setInspectInfo] = useState<PdfInspectResult | null>(null)
  const [inspectingBook, setInspectingBook] = useState(false)
  const scanPollTimerRef = useRef<number | null>(null)

  // Quiz Import state
  const [rawQuestionText, setRawQuestionText] = useState('')
  const [importDomain, setImportDomain] = useState<ResourceDomain>('math')
  const [importSubject, setImportSubject] = useState('高等数学')
  const [isParsingText, setIsParsingText] = useState(false)
  const [parsedPreviewQuestions, setParsedPreviewQuestions] = useState<CustomQuestion[]>([])
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([])
  const [, setLoadingCustom] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [importSubTab, setImportSubTab] = useState<'smart_text' | 'json' | 'manage'>('smart_text')
  const [importFeedback, setImportFeedback] = useState<string | null>(null)

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // OCR Image state
  const [pastedImage, setPastedImage] = useState<string | null>(null)
  const [isParsingOcr, setIsParsingOcr] = useState(false)

  const stopScanPolling = () => {
    if (scanPollTimerRef.current !== null) {
      window.clearInterval(scanPollTimerRef.current)
      scanPollTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      stopScanPolling()
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setUploadError(null)
      loadBooks()
      loadCustomQuestions()
      // 若有未完成或刚完成的后台扫描任务，自动恢复进度显示
      if (isLoggedIn) {
        api.getBookScanTasks().then(res => {
          const running = res.tasks?.find(t => t.status === 'queued' || t.status === 'extracting' || t.status === 'scanning' || t.status === 'saving')
          if (running) {
            startPollingScanTask(running.taskId, running.bookName)
          }
        }).catch(() => {})
      }
    } else {
      stopScanPolling()
    }
  }, [isOpen, user?.id])

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  // ===== Data Fetching =====

  const loadBooks = async () => {
    setLoadingBooks(true)
    try {
      const res = await fetch('/api/books/list', { headers: getAuthHeaders() })
      const text = await res.text()
      try {
        const data = JSON.parse(text)
        if (data.books) {
          setBooks(data.books)
        }
      } catch {
        console.error('Books response is not valid JSON:', text.slice(0, 100))
      }
    } catch (err) {
      console.error('Failed to fetch books:', err)
    } finally {
      setLoadingBooks(false)
    }
  }

  const loadCustomQuestions = async () => {
    setLoadingCustom(true)
    try {
      const data = await api.getCustomQuestions()
      if (data && Array.isArray(data.questions)) {
        setCustomQuestions(data.questions)
      }
    } catch (err) {
      console.error('Failed to fetch custom questions:', err)
    } finally {
      setLoadingCustom(false)
    }
  }

  // ===== Book Actions =====

  const parsePageRange = (raw: string): { startPage?: number; endPage?: number } => {
    const cleaned = raw.trim().replace(/[～~至]/g, '-')
    if (!cleaned) return {}
    const rangeMatch = cleaned.match(/^(\d+)\s*-\s*(\d+)$/)
    if (rangeMatch) {
      const s = parseInt(rangeMatch[1], 10)
      const e = parseInt(rangeMatch[2], 10)
      if (s >= 1 && e >= s) return { startPage: s, endPage: e }
    }
    const singleMatch = cleaned.match(/^(\d+)$/)
    if (singleMatch) {
      const p = parseInt(singleMatch[1], 10)
      if (p >= 1) return { startPage: p, endPage: p }
    }
    return {}
  }

  const startPollingScanTask = (taskId: string, bookName?: string) => {
    stopScanPolling()
    setAutoExtractStatus('analyzing')

    const pollOnce = async () => {
      try {
        const res = await api.getBookScanStatus(taskId)
        const task = res.task
        if (!task) return
        setActiveScanTask(task)
        setAutoExtractStep(task.stepMessage)

        if (task.status === 'completed') {
          stopScanPolling()
          setAutoExtractResult({
            note: task.note,
            questions: task.previewQuestions || [],
            savedNotePath: task.savedNotePath,
            questionsCount: task.extractedQuestionsCount,
            subject: task.subject,
            isScannedImageOnly: task.isScannedImageOnly,
            warningMessage: task.warningMessage,
            scannedPageRange: task.scannedPageRange,
            totalPages: task.totalPages
          })
          setAutoExtractStatus('done')
          if (task.isScannedImageOnly) {
            setImportFeedback(
              `资料《${task.bookName || bookName || 'PDF'}》原文件已保留可随时预览；检测到该文件为纯图片扫描版（不含内嵌文字层），请见右侧说明。`
            )
          } else {
            setImportFeedback(
              `🎉 资料《${task.bookName || bookName || '教材'}》全卷扫描完成！共提取并导入 ${task.extractedQuestionsCount} 道题目进入题库！`
            )
          }
          loadBooks()
          loadCustomQuestions()
          onQuestionsUpdated?.()
          window.dispatchEvent(new CustomEvent('custom-questions-updated'))
          window.dispatchEvent(new CustomEvent('vault-updated'))
        } else if (task.status === 'error') {
          stopScanPolling()
          setAutoExtractStatus('error')
          setUploadError(task.error || task.stepMessage || '全卷扫描失败')
        }
      } catch (err: any) {
        console.warn('Scan status poll error:', err?.message)
      }
    }

    void pollOnce()
    scanPollTimerRef.current = window.setInterval(() => {
      void pollOnce()
    }, 1500)
  }

  const handleAutoExtract = async (
    relativePath: string,
    domain?: ResourceDomain,
    bookName?: string,
    scope?: BookScope,
    modeOverride?: 'question' | 'dual' | 'concept'
  ) => {
    setUploadError(null)
    setAutoExtractStatus('analyzing')
    setAutoExtractStep('正在提交后台全卷分片扫描任务（保留原 PDF 预览）...')
    setAutoExtractResult(null)
    setActiveScanTask(null)

    const { startPage, endPage } = parsePageRange(pageRangeInput)
    const effectiveMode = modeOverride || scanExtractMode

    try {
      const startRes = await api.startBookScan({
        relativePath,
        scope,
        domain: domain || uploadDomain,
        mode: effectiveMode,
        startPage,
        endPage,
        maxChunks: 24
      })
      if (startRes.success && startRes.task) {
        setActiveScanTask(startRes.task)
        setAutoExtractStep(startRes.task.stepMessage)
        startPollingScanTask(startRes.task.taskId, bookName)
      } else {
        setAutoExtractStatus('error')
        setUploadError('未能成功创建扫描任务')
      }
    } catch (err: any) {
      setAutoExtractStatus('error')
      setUploadError('启动扫描任务失败: ' + (err.message || String(err)))
    }
  }

  const handleDeleteBook = async (book: BookItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const confirmDelete = window.confirm(
      `确定要永久删除参考资料《${book.name}》吗？\n删除后该文件将从${book.scope === 'shared' ? '系统公共资料库' : '您的个人参考资料库'}中彻底移除。`
    )
    if (!confirmDelete) return

    try {
      const res = await fetch('/api/books/delete', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ relativePath: book.relativePath, scope: book.scope }),
      })
      const data = await res.json()
      if (data.success) {
        if (selectedBook?.id === book.id || selectedBook?.relativePath === book.relativePath) {
          setSelectedBook(null)
          setAutoExtractResult(null)
          setAutoExtractStatus('idle')
        }
        await loadBooks()
        onBooksUpdated?.()
        window.dispatchEvent(new CustomEvent('vault-updated'))
      } else {
        alert(data.error || '删除失败，请稍后重试')
      }
    } catch (err: any) {
      alert('删除异常: ' + (err.message || String(err)))
    }
  }

  const handleOpenRename = (book: BookItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setRenamingBook(book)
    setNewBookName(book.name)
  }

  const handleConfirmRename = async () => {
    if (!renamingBook || !newBookName.trim()) return
    setIsRenaming(true)
    try {
      const res = await fetch('/api/books/rename', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          relativePath: renamingBook.relativePath,
          scope: renamingBook.scope,
          newName: newBookName.trim()
        })
      })
      const data = await res.json()
      if (data.success) {
        if (selectedBook && (selectedBook.id === renamingBook.id || selectedBook.relativePath === renamingBook.relativePath)) {
          setSelectedBook({
            ...selectedBook,
            name: data.newName || newBookName.trim(),
            relativePath: data.newRelativePath || selectedBook.relativePath
          })
        }
        setRenamingBook(null)
        await loadBooks()
        onBooksUpdated?.()
        window.dispatchEvent(new CustomEvent('vault-updated'))
      } else {
        alert(data.error || '重命名失败')
      }
    } catch (err: any) {
      alert('重命名异常: ' + (err.message || String(err)))
    } finally {
      setIsRenaming(false)
    }
  }

  const handleSuggestName = async () => {
    if (!renamingBook) return
    setIsSuggestingName(true)
    try {
      const res = await fetch('/api/books/suggest-name', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ relativePath: renamingBook.relativePath, scope: renamingBook.scope })
      })
      const data = await res.json()
      if (data.success && data.suggestedName) {
        setNewBookName(data.suggestedName)
      } else {
        alert(data.error || '未能提炼出建议书名')
      }
    } catch (err: any) {
      alert('获取建议书名异常: ' + (err.message || String(err)))
    } finally {
      setIsSuggestingName(false)
    }
  }

  const handleQuickCleanName = () => {
    if (!newBookName) return
    const dotIdx = newBookName.lastIndexOf('.')
    const ext = dotIdx !== -1 ? newBookName.slice(dotIdx) : ''
    const base = dotIdx !== -1 ? newBookName.slice(0, dotIdx) : newBookName
    const cleaned = base
      .replace(/_\d+_\d+$/, '')
      .replace(/^[0-9a-f]{16,}_?/i, '')
      .replace(/^(\d{10,}_\w+)/, '')
      .replace(/^[0-9]+[_\s-]+/, '')
      .trim()
    setNewBookName(`${cleaned || base}${ext}`)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    if (!isLoggedIn) {
      setUploadError('请先登录账号后再导入资料（管理员导入全员共享，普通用户导入个人独享）')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size === 0) {
      setUploadError('所选文件大小为 0 字节（手机系统可能尚未把云盘文件下载到本地），请确保文件已下载完成后重试')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('domain', uploadDomain)
    formData.append('category', uploadCategory)
    formData.append('file', file)

    try {
      const res = await fetch('/api/books/upload', {
        method: 'POST',
        // 注意：FormData 上传严禁手动设置 Content-Type: application/json，必须由浏览器自动附带 multipart boundary
        headers: getAuthTokenHeaders(),
        body: formData,
      })
      if (res.status === 413) {
        throw new Error('文件体积超过网关限制（HTTP 413），若通过反向代理访问请在 Nginx 中调大 client_max_body_size')
      }
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('auth-unauthorized'))
      }
      const text = await res.text()
      let data: any = {}
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(res.ok ? '服务解析异常，返回非标准格式' : `服务端响应异常 (HTTP ${res.status}): ${text.slice(0, 120)}`)
      }

      if (data.success) {
        const uploadedScope: BookScope = data.file?.scope || (isAdmin ? 'shared' : 'personal')
        const keepOnly = uploadActionMode === 'keep_only'
        setImportFeedback(
          keepOnly
            ? `资料《${file.name}》已成功保存至${uploadedScope === 'shared' ? '【全员共享资料库】' : '【个人独享资料库】'}，可直接在线预览原 PDF 或随时点击扫描入题库！`
            : `资料《${file.name}》已保存原 PDF 至${uploadedScope === 'shared' ? '【全员共享资料库】' : '【个人独享资料库】'}！正在后台排队全卷扫描提取题目...`
        )
        loadBooks()
        onBooksUpdated?.()
        window.dispatchEvent(new CustomEvent('vault-updated'))
        if (data.file?.relativePath) {
          const uploadedBook: BookItem = {
            id: data.file.id || `${uploadedScope}:${data.file.relativePath}`,
            name: data.file.name,
            relativePath: data.file.relativePath,
            fullPath: '',
            domain: uploadDomain,
            category: uploadCategory,
            size: data.file.size,
            ext: '.' + (data.file.name.split('.').pop() || 'pdf'),
            lastModified: new Date().toISOString(),
            isTextReadable: true,
            scope: uploadedScope,
            canManage: true,
            ownerName: data.file.ownerName
          }
          setSelectedBook(uploadedBook)
          setPageRangeInput('')
          if (uploadActionMode === 'scan_and_keep') {
            const preferredMode = (uploadCategory === '真题' || uploadCategory === '模拟题') ? 'question' : scanExtractMode
            await handleAutoExtract(data.file.relativePath, uploadDomain, data.file.name, uploadedScope, preferredMode)
          } else {
            // 仅保存原 PDF 预览时，探测一次元信息（页数、是否扫描件）
            setInspectingBook(true)
            api.inspectBook(data.file.relativePath, uploadedScope)
              .then(info => setInspectInfo(info))
              .catch(() => setInspectInfo(null))
              .finally(() => setInspectingBook(false))
          }
        }
      } else {
        setUploadError(data.error || '上传失败，请稍后重试')
      }
    } catch (err: any) {
      setUploadError('上传异常: ' + (err.message || String(err)))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleReadBook = async (book: BookItem) => {
    setSelectedBook(book)
    setExtractResult(null)
    setInspectInfo(null)
    setReadingBook(true)
    setInspectingBook(true)
    api.inspectBook(book.relativePath, book.scope)
      .then(info => setInspectInfo(info))
      .catch(() => setInspectInfo(null))
      .finally(() => setInspectingBook(false))
    try {
      const res = await fetch('/api/books/read', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ relativePath: book.relativePath, scope: book.scope }),
      })
      const data = await res.json()
      if (data.content) {
        setBookContent(data.content)
        setExtractSnippet(data.content.slice(0, 3000))
      }
    } catch (err) {
      console.error('Read error:', err)
    } finally {
      setReadingBook(false)
    }
  }

  const handleAIExtract = async () => {
    if (!extractSnippet.trim()) {
      alert('请输入或选择需要提炼的核心章节文本')
      return
    }
    setIsExtracting(true)
    setExtractResult(null)
    try {
      const res = await fetch('/api/books/extract-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          text: extractSnippet,
          bookName: selectedBook?.name || '考研参考资料',
          domain: selectedBook?.domain || uploadDomain,
          subject: getDefaultSubjectForDomain(selectedBook?.domain || uploadDomain),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setExtractResult({
          note: data.note,
          questions: data.questions,
        })
        if (data.questions && data.questions.length > 0) {
          // Auto append to custom questions
          await api.saveCustomQuestions(data.questions)
          await loadCustomQuestions()
          onQuestionsUpdated?.()
          window.dispatchEvent(new CustomEvent('custom-questions-updated'))
        }
      } else {
        alert(data.error || '提炼失败')
      }
    } catch (err: any) {
      alert('AI 提炼异常: ' + err.message)
    } finally {
      setIsExtracting(false)
    }
  }

  // ===== Quiz Ingestion Actions =====

  const handleSmartTextParse = async () => {
    if (!rawQuestionText.trim()) {
      alert('请先在输入框粘贴题目内容')
      return
    }
    setIsParsingText(true)
    try {
      const res = await fetch('/api/quiz/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          text: rawQuestionText,
          domain: importDomain,
          subject: importSubject,
        }),
      })
      const data = await res.json()
      if (data.questions && Array.isArray(data.questions)) {
        setParsedPreviewQuestions(data.questions)
      } else {
        alert(data.error || '解析失败，请检查文本格式')
      }
    } catch (err: any) {
      alert('解析异常: ' + err.message)
    } finally {
      setIsParsingText(false)
    }
  }

  const handleImagePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          e.preventDefault()
          const reader = new FileReader()
          reader.onload = (loadEvent) => {
            const base64 = loadEvent.target?.result as string
            setPastedImage(base64)
          }
          reader.readAsDataURL(file)
          break
        }
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string
        setPastedImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOcrParse = async () => {
    if (!pastedImage) {
      alert('请先通过 Ctrl + V 粘贴截图或上传题目图片')
      return
    }
    setIsParsingOcr(true)
    try {
      const res = await fetch('/api/quiz/parse-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          image: pastedImage,
          text: rawQuestionText.trim() || undefined,
          domain: importDomain,
          subject: importSubject,
        }),
      })
      const data = await res.json()
      if (data.questions && Array.isArray(data.questions)) {
        setParsedPreviewQuestions(data.questions)
        if (data.offline) {
          setImportFeedback('当前处于离线模式，已为您生成高保真考研题目模板，支持直接编辑保存。')
        }
      } else {
        alert(data.error || '图片识别失败，请确保截图清晰包含考研题干与公式')
      }
    } catch (err: any) {
      alert('OCR 识别异常: ' + err.message)
    } finally {
      setIsParsingOcr(false)
    }
  }

  const handleCommitParsedQuestions = async () => {
    if (parsedPreviewQuestions.length === 0) return
    try {
      const count = parsedPreviewQuestions.length
      const data = await api.saveCustomQuestions(parsedPreviewQuestions)
      if (data.success) {
        setImportFeedback(`成功导入 ${count} 道题目进入做题中心！`)
        setParsedPreviewQuestions([])
        setRawQuestionText('')
        await loadCustomQuestions()
        onQuestionsUpdated?.()
        window.dispatchEvent(new CustomEvent('custom-questions-updated'))
        window.dispatchEvent(new CustomEvent('vault-notes-updated'))
      }
    } catch (err: any) {
      alert('导入失败: ' + err.message)
    }
  }

  const handleJsonImport = async () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const list = Array.isArray(parsed) ? parsed : [parsed]
      const data = await api.saveCustomQuestions(list)
      if (data.success) {
        setImportFeedback(`成功批量导入 ${list.length} 道 JSON 题目！`)
        setJsonInput('')
        await loadCustomQuestions()
        onQuestionsUpdated?.()
        window.dispatchEvent(new CustomEvent('custom-questions-updated'))
        window.dispatchEvent(new CustomEvent('vault-notes-updated'))
      }
    } catch (err: any) {
      alert('JSON 格式有误: ' + err.message)
    }
  }
  const handleDeleteCustomQuestion = async (id: string) => {
    if (!confirm('确定要删除这道自定义题目吗？')) return
    try {
      await api.deleteCustomQuestion(id)
      await loadCustomQuestions()
      onQuestionsUpdated?.()
      window.dispatchEvent(new CustomEvent('custom-questions-updated'))
      window.dispatchEvent(new CustomEvent('vault-notes-updated'))
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  if (!isOpen) return null

  const filteredModalBooks = books.filter(b => {
    if (scopeFilter !== 'all' && (b.scope || 'shared') !== scopeFilter) return false
    if (domainFilter !== 'all' && b.domain !== domainFilter) return false
    return true
  })

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/70 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-5xl h-[92dvh] sm:h-[88vh] rounded-2xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/70 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20">
              <Database className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span className="truncate">智能资料与题库导入中心</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 hidden sm:inline">
                  学练一体 · 考研研学大脑
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {isAdmin
                  ? '系统管理员模式：导入资料将存入全员共享公共库'
                  : isLoggedIn
                    ? '个人研学模式：您导入的资料仅个人独享，同时可阅览管理员共享资料'
                    : '请登录后上传个人独享资料（未登录仅可浏览共享资料）'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 border-b border-slate-200/70 bg-white overflow-x-auto whitespace-nowrap no-scrollbar">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'books'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>📚 参考书与教材书架 ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('import_quiz')}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'import_quiz'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>📥 智能导入题库 ({customQuestions.length} 道)</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>📊 学情画像与薄弱点诊断</span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        {importFeedback && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-2 bg-emerald-50 border-b border-emerald-100 text-emerald-800 text-xs font-medium">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="break-words">{importFeedback}</span>
            </div>
            <button
              onClick={() => setImportFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 underline ml-4 shrink-0"
            >
              关闭
            </button>
          </div>
        )}

        {/* Inline Error Banner (移动端友好提示，不依赖原生 alert) */}
        {uploadError && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-medium">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span className="break-words">{uploadError}</span>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-rose-700 hover:text-rose-900 underline ml-4 shrink-0"
            >
              关闭
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 bg-slate-50/50">

          {/* ===== TAB 1: BOOKS & TEXTBOOKS SHELF ===== */}
          {activeTab === 'books' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Left Column: Book List & Upload */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* Upload Card */}
                <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-indigo-600" />
                      导入新参考书 / 历年真题
                    </span>
                    <span className="text-[10px] text-slate-400">支持 PDF, Markdown, TXT</span>
                  </div>

                  {/* 存储空间归属提示 */}
                  <div className={`mb-3 px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 border ${
                    isAdmin
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                      : isLoggedIn
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200/80'
                        : 'bg-amber-50 text-amber-800 border-amber-200/80'
                  }`}>
                    {isAdmin ? (
                      <>
                        <Globe className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>管理员上传将存入 <strong>全员公共资料库</strong>，所有用户共享可见</span>
                      </>
                    ) : isLoggedIn ? (
                      <>
                        <Lock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>您的上传将存入 <strong>个人独享空间</strong>，仅您自己可见与管理</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span>请先登录后上传属于您个人的资料</span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">所属学科</label>
                      <select
                        value={uploadDomain}
                        onChange={e => setUploadDomain(e.target.value as ResourceDomain)}
                        className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {DOMAIN_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">资料类别</label>
                      <select
                        value={uploadCategory}
                        onChange={e => setUploadCategory(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="经典教材">经典教材</option>
                        <option value="辅导讲义">辅导讲义/精讲</option>
                        <option value="真题">历年真题</option>
                        <option value="模拟题">模拟测试卷</option>
                        <option value="背诵手册">背诵手册/核心词汇</option>
                        <option value="作文模板">作文模板/专题汇编</option>
                        <option value="错题笔记">错题集/复盘笔记</option>
                        <option value="交互课件">交互仿真课件</option>
                      </select>
                    </div>
                  </div>

                  {/* 上传后处理模式选择：保留原PDF预览 vs 自动全卷扫描入题库 */}
                  <div className="mb-3 rounded-lg bg-slate-50 border border-slate-200/80 p-2 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-700">导入处理方式（原文件均会保留在书架）</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setUploadActionMode('scan_and_keep')}
                        className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                          uploadActionMode === 'scan_and_keep'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="font-semibold">✨ 保留原件 + 全卷扫题</div>
                        <div className={`text-[10px] mt-0.5 ${uploadActionMode === 'scan_and_keep' ? 'text-indigo-100' : 'text-slate-400'}`}>
                          自动排队识别全卷题目入库
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadActionMode('keep_only')}
                        className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                          uploadActionMode === 'keep_only'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="font-semibold">📄 仅保存原 PDF 预览</div>
                        <div className={`text-[10px] mt-0.5 ${uploadActionMode === 'keep_only' ? 'text-emerald-100' : 'text-slate-400'}`}>
                          秒传留存，稍后按需再扫
                        </div>
                      </button>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="application/pdf,.pdf,text/markdown,.md,.markdown,text/plain,.txt,text/html,.html,.htm,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  />

                  <button
                    onClick={() => {
                      setUploadError(null)
                      if (!isLoggedIn) {
                        setUploadError('请先登录账号后再导入资料（管理员导入全员共享，普通用户导入个人独享）')
                        return
                      }
                      fileInputRef.current?.click()
                    }}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-blue-500 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>正在归档导入中...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>{isAdmin ? '选择文件上传至全员共享资料库' : '选择文件上传至个人独享资料库'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Books List */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2.5 gap-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FolderOpen className="h-4 w-4 text-slate-500" />
                      当前可阅览参考书库 ({filteredModalBooks.length})
                    </span>
                    <button
                      onClick={loadBooks}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      刷新
                    </button>
                  </div>

                  {!isAdmin && isLoggedIn && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      {([
                        { id: 'all', label: `全部 (${books.length})` },
                        { id: 'personal', label: `🔒 个人独享 (${books.filter(b => b.scope === 'personal').length})` },
                        { id: 'shared', label: `🌐 全员共享 (${books.filter(b => (b.scope || 'shared') === 'shared').length})` },
                      ] as const).map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setScopeFilter(f.id)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                            scopeFilter === f.id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 学科快速筛选 */}
                  <div className="flex flex-wrap items-center gap-1 mb-3">
                    <button
                      type="button"
                      onClick={() => setDomainFilter('all')}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                        domainFilter === 'all'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      全学科
                    </button>
                    {DOMAIN_OPTIONS.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDomainFilter(d.value)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                          domainFilter === d.value
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d.shortLabel}
                      </button>
                    ))}
                  </div>

                  {loadingBooks ? (
                    <div className="py-8 text-center text-xs text-slate-400">正在扫描资料库...</div>
                  ) : filteredModalBooks.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      暂无匹配参考书文件，点击上方按钮上传你的考研教材与真题 PDF / Markdown
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                      {filteredModalBooks.map(b => (
                        <div
                          key={b.id}
                          onClick={() => handleReadBook(b)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedBook?.id === b.id
                              ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                              : 'border-slate-100 hover:border-slate-300 bg-slate-50/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                              <span className="text-xs font-semibold text-slate-800 truncate" title={b.name}>
                                {b.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                b.scope === 'personal'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {b.scope === 'personal' ? '🔒 独享' : '🌐 共享'}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-200/60 text-slate-600">
                                {b.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                            <span>{getDomainLabel(b.domain)} · {b.ext.toUpperCase()}</span>
                            <span>{(b.size / 1024).toFixed(1)} KB</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-slate-200/50">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedBook(b)
                                handleAutoExtract(b.relativePath, b.domain, b.name, b.scope)
                              }}
                              disabled={autoExtractStatus === 'analyzing'}
                              className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className="h-3 w-3 text-amber-500" />
                              <span>全卷扫题入库</span>
                            </button>
                            <a
                              href={api.getBookRawUrl(b.relativePath, b.scope)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-all"
                              title="新窗口预览或下载原文件"
                            >
                              <Eye className="h-3 w-3" />
                              <span>原件预览</span>
                            </a>
                            <span className="text-[10px] text-slate-400 ml-auto">
                              {b.extractedInfo?.questionCount ? `已导 ${b.extractedInfo.questionCount} 题` : (b.isTextReadable ? '已就绪' : '可预览')}
                            </span>
                            {b.canManage !== false && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenRename(b, e)}
                                  className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors ml-1 cursor-pointer"
                                  title="修改/重命名教材名称"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteBook(b, e)}
                                  className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-0.5 cursor-pointer"
                                  title="删除此教材"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Book Details & AI Concept/Quiz Extraction */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-900 truncate">
                        {selectedBook ? `《${selectedBook.name}》· 智能考点与真题提炼` : '选择参考书进行 AI 智能提炼'}
                      </span>
                    </div>
                    {selectedBook && (
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={api.getBookRawUrl(selectedBook.relativePath, selectedBook.scope)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition-colors"
                          title="新窗口打开原 PDF 预览或下载"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>原件预览 / 下载</span>
                        </a>
                        {selectedBook.canManage !== false && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenRename(selectedBook, e)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-medium transition-colors cursor-pointer"
                            title="修改此教材名称"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>重命名</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleAutoExtract(selectedBook.relativePath, selectedBook.domain, selectedBook.name, selectedBook.scope)}
                          disabled={autoExtractStatus === 'analyzing'}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-xs hover:from-indigo-500 hover:to-purple-500 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                          <span>全卷扫描导入题库</span>
                        </button>
                        {selectedBook.canManage !== false && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteBook(selectedBook, e)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                            title="删除此教材"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>删除</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 选中资料的页码探测与扫描配置栏 */}
                  {selectedBook && (
                    <div className="mb-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2 text-slate-600">
                          {inspectingBook ? (
                            <span className="flex items-center gap-1 text-slate-400">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              正在探测文件页数与文字层...
                            </span>
                          ) : inspectInfo?.success ? (
                            <>
                              <span className="font-semibold text-slate-800">共 {inspectInfo.totalPages} 页</span>
                              {inspectInfo.isScannedImageOnly ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                                  ⚠️ 纯图片扫描版（无文字层）
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                                  ✓ 含可提取文字层，支持全卷分片提题
                                </span>
                              )}
                            </>
                          ) : (
                            <span>原文件保留在书架，支持预览与题库提取双模式</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 mb-1">扫描模式</label>
                          <select
                            value={scanExtractMode}
                            onChange={e => setScanExtractMode(e.target.value as 'question' | 'dual' | 'concept')}
                            className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="question">🎯 真题/解析册全量提题（有多少提多少）</option>
                            <option value="dual">📚 双轨精炼（提题 + 考点笔记同步生成）</option>
                            <option value="concept">📝 讲义梳理（重点整理笔记 + 少量例题）</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 mb-1">
                            页码范围（可选，如 1-30，留空自动整卷扫描）
                          </label>
                          <input
                            type="text"
                            value={pageRangeInput}
                            onChange={e => setPageRangeInput(e.target.value)}
                            placeholder="例如：1-40（留空则从第1页自动扫完）"
                            className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {autoExtractStatus === 'analyzing' ? (
                    <div className="py-8 px-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 border border-indigo-100/80 flex flex-col items-center justify-center text-center gap-3 my-3">
                      <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/25">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {activeScanTask?.stepMessage || autoExtractStep || '后台排队正在全卷分片解析中...'}
                      </div>
                      {activeScanTask && (
                        <div className="w-full max-w-md space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                            <span>
                              进度：{activeScanTask.progress}%
                              {activeScanTask.totalChunks > 0 ? `（分片 ${activeScanTask.currentChunk}/${activeScanTask.totalChunks}）` : ''}
                            </span>
                            <span className="text-indigo-700 font-semibold">
                              已入库 {activeScanTask.extractedQuestionsCount} 道题
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-indigo-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                              style={{ width: `${Math.max(4, activeScanTask.progress)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
                        任务已在云端后台队列安全执行，每扫完一片会实时增量写入题库，支持先预览原 PDF 或切出等待完成。
                      </p>
                    </div>
                  ) : autoExtractStatus === 'done' && autoExtractResult ? (
                    <div className={`mb-4 p-4 rounded-xl border animate-in fade-in ${
                      autoExtractResult.isScannedImageOnly
                        ? 'bg-amber-50/80 border-amber-200'
                        : 'bg-emerald-50/70 border-emerald-200/80'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${
                          autoExtractResult.isScannedImageOnly ? 'text-amber-900' : 'text-emerald-900'
                        }`}>
                          {autoExtractResult.isScannedImageOnly
                            ? <AlertCircle className="h-4 w-4 text-amber-600" />
                            : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                          {autoExtractResult.isScannedImageOnly
                            ? '原 PDF 已保留，当前文件为纯图片扫描版'
                            : '全卷扫描已完成，已归纳进知识库与后台题库！'}
                        </span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          autoExtractResult.isScannedImageOnly
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {autoExtractResult.isScannedImageOnly
                            ? `共 ${autoExtractResult.totalPages || 0} 页`
                            : `扫过第 ${autoExtractResult.scannedPageRange || '1'} 页 · 录入 ${autoExtractResult.questionsCount || 0} 道题`}
                        </span>
                      </div>

                      {autoExtractResult.warningMessage && (
                        <div className="mb-3 p-2.5 rounded-lg bg-white/90 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                          {autoExtractResult.warningMessage}
                        </div>
                      )}

                      {autoExtractResult.savedNotePath && (
                        <div className="mb-3 p-3 rounded-lg bg-white border border-emerald-100 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-indigo-700">📚 知识库笔记：{autoExtractResult.note?.title}</span>
                            <span className="text-[10px] text-emerald-600 font-medium">✓ 已写入 Obsidian</span>
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded">
                            {autoExtractResult.savedNotePath}
                          </div>
                        </div>
                      )}

                      {autoExtractResult.questions && autoExtractResult.questions.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                            <span>🎯 自动命制并归入题库真题：</span>
                            <span className="text-indigo-600 font-normal">做题中心随时可刷</span>
                          </div>
                          {autoExtractResult.questions.map((q, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-white border border-slate-100 text-xs shadow-2xs">
                              <div className="font-medium text-slate-800 mb-1">
                                {idx + 1}. <MarkdownRenderer content={q.question} />
                              </div>
                              {q.options && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 my-2 text-[11px] text-slate-600 bg-slate-50/70 p-2 rounded">
                                  {Object.entries(q.options).map(([k, v]) => (
                                    <div key={k} className="min-w-0 overflow-x-auto flex items-start gap-1">
                                      <span className="font-semibold shrink-0">{k}.</span>
                                      <div className="min-w-0 flex-1">
                                        <MarkdownRenderer content={String(v)} inline />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-50">
                                <div className="flex items-center gap-1 min-w-0 overflow-x-auto">
                                  <span className="shrink-0">正确答案：</span>
                                  <span className="font-bold text-emerald-600">
                                    <MarkdownRenderer
                                      content={
                                        String(q.answer || '').includes('$') || !/\\/.test(String(q.answer || ''))
                                          ? String(q.answer || '')
                                          : `$${q.answer}$`
                                      }
                                      inline
                                    />
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[260px]">考点：{(q.tags || []).join('、')}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {readingBook ? (
                    <div className="py-16 text-center text-xs text-slate-400">正在读取教材大纲与核心考点...</div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-slate-700">
                            从参考书中选取或微调章节文本片段（或直接点击上方一键全自动分析）：
                          </label>
                          <span className="text-[10px] text-slate-400">{extractSnippet.length} 字</span>
                        </div>
                        <textarea
                          rows={5}
                          value={extractSnippet}
                          onChange={e => setExtractSnippet(e.target.value)}
                          placeholder="在此粘贴该教材或讲义中的定义、定理或例题文本（如：泰勒公式在求未定式极限中的应用、红黑树插入旋转条件等）..."
                          className="w-full text-xs font-mono rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleAIExtract}
                          disabled={isExtracting || !extractSnippet.trim()}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isExtracting ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>AI 正在提炼考点并命制考研真题...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              <span>提炼指定片段知识库笔记 & 生成配套真题</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Extraction Result Showcase */}
                      {extractResult && (
                        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 animate-in fade-in">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              知识库沉淀与生成习题成功！
                            </span>
                            <span className="text-[11px] text-slate-500">
                              已生成笔记并入库 {extractResult.questions?.length || 0} 道题
                            </span>
                          </div>

                          {extractResult.note && (
                            <div className="mb-3 p-3 rounded-lg bg-white border border-slate-200 text-xs">
                              <span className="font-semibold text-indigo-600">已沉淀笔记路径：</span>
                              <code className="ml-2 font-mono text-slate-700">{extractResult.note.suggestedPath}</code>
                            </div>
                          )}

                          {extractResult.questions && extractResult.questions.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[11px] font-semibold text-slate-700">配套生成试题预览：</span>
                              {extractResult.questions.map((q, idx) => (
                                <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-100 text-xs">
                                  <div className="font-medium text-slate-800 mb-1">
                                    {idx + 1}. <MarkdownRenderer content={q.question} />
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1 min-w-0 overflow-x-auto">
                                    <span className="shrink-0">答案：</span>
                                    <span className="font-bold text-emerald-600">
                                      <MarkdownRenderer
                                        content={
                                          String(q.answer || '').includes('$') || !/\\/.test(String(q.answer || ''))
                                            ? String(q.answer || '')
                                            : `$${q.answer}$`
                                        }
                                        inline
                                      />
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB 2: IMPORT QUIZ QUESTIONS ===== */}
          {activeTab === 'import_quiz' && (
            <div className="flex flex-col gap-4">
              {/* Sub-tabs for Quiz import */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto whitespace-nowrap no-scrollbar">
                <button
                  onClick={() => setImportSubTab('smart_text')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    importSubTab === 'smart_text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📸 截图/拍照 OCR 导题 & 文本录入</span>
                </button>
                <button
                  onClick={() => setImportSubTab('json')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    importSubTab === 'json'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  📦 JSON 批量导入
                </button>
                <button
                  onClick={() => setImportSubTab('manage')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    importSubTab === 'manage'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  🗂️ 已导入题库管理 ({customQuestions.length})
                </button>
              </div>

              {/* Sub-tab 1: Smart Text Parse */}
              {importSubTab === 'smart_text' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">学科领域</label>
                        <select
                          value={importDomain}
                          onChange={e => {
                            const d = e.target.value as ResourceDomain
                            setImportDomain(d)
                            setImportSubject(getDefaultSubjectForDomain(d))
                          }}
                          className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white"
                        >
                          {DOMAIN_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">科目章节</label>
                        <select
                          value={importSubject}
                          onChange={e => setImportSubject(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white"
                        >
                          {(SUBJECT_OPTIONS_BY_DOMAIN[importDomain] || SUBJECT_OPTIONS_BY_DOMAIN.math).map(sub => (
                            <option key={sub.value} value={sub.value}>{sub.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* OCR 截图与照片导入专属交互区 */}
                    <div
                      onPaste={handleImagePaste}
                      className="rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-4 transition-all"
                    >
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />

                      {pastedImage ? (
                        <div className="space-y-3">
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-56 group">
                            <img
                              src={pastedImage}
                              alt="待识别考研题目截图"
                              className="max-h-56 w-auto object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setPastedImage(null)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white text-xs transition-colors cursor-pointer"
                              title="移除此图片"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs font-mono">
                              📸 已捕获考研真题/公式截图
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleOcrParse}
                              disabled={isParsingOcr}
                              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {isParsingOcr ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  <span>视觉模型正在 OCR 识别数学公式与 408 图表...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>一键提取题目并转 KaTeX LaTeX 公式</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => imageInputRef.current?.click()}
                              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                            >
                              重新选择
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => imageInputRef.current?.click()}
                          className="flex flex-col items-center justify-center py-4 cursor-pointer text-center group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Camera className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                            <span>点击上传考研试卷照片，或在此处按下</span>
                            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono text-[10px] text-indigo-600 font-bold shadow-2xs">Ctrl + V</kbd>
                            <span>直接粘贴截图</span>
                          </span>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                            支持考研数学复杂公式、408 计算机图表、考研英语阅读与长难句、考研政治真题与肖1000题截图识别
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-800">
                          粘贴题目文本（或配合截图补充说明）：
                        </label>
                        <span className="text-[10px] text-slate-400">支持一题或多题批量</span>
                      </div>
                      <textarea
                        rows={6}
                        onPaste={handleImagePaste}
                        value={rawQuestionText}
                        onChange={e => setRawQuestionText(e.target.value)}
                        placeholder={`支持直接粘贴纯文本题干，亦可在上方使用 Ctrl + V 粘贴公式截图：
1. 设随机变量 X ~ N(0, 1)，Y = 2X + 1，则 D(Y) 等于（ ）
A. 1
B. 2
C. 4
D. 5
答案：C
解析：根据方差性质 D(aX + b) = a^2 D(X)，D(Y) = 4 D(X) = 4*1 = 4。`}
                        className="w-full text-xs font-mono rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                      />
                    </div>

                    <button
                      onClick={handleSmartTextParse}
                      disabled={isParsingText || !rawQuestionText.trim()}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isParsingText ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>AI 正在规范化解析并生成 LaTeX 公式...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          <span>仅对文本输入框执行 AI 格式化识别</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Parsed Preview */}
                  <div className="lg:col-span-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        解析题目预览 ({parsedPreviewQuestions.length})
                      </span>
                      {parsedPreviewQuestions.length > 0 && (
                        <button
                          onClick={handleCommitParsedQuestions}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs shadow-sm hover:bg-emerald-500 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>确认存入做题中心</span>
                        </button>
                      )}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 h-[440px] overflow-y-auto space-y-4">
                      {parsedPreviewQuestions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400">
                          <FileText className="h-8 w-8 text-slate-300 mb-2" />
                          在左侧粘贴题目后点击「AI 智能格式化识别解析」，将在此处生成高质量的公式卡片预览
                        </div>
                      ) : (
                        parsedPreviewQuestions.map((q, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                                {q.subject}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {q.difficulty}
                              </span>
                            </div>

                            <div className="text-xs font-medium text-slate-900 mb-3 min-w-0 max-w-full overflow-x-auto py-0.5 space-y-1">
                              <div className="font-bold text-slate-700">第 {idx + 1} 题：</div>
                              <MarkdownRenderer content={q.question} />
                            </div>

                            {q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                {Object.entries(q.options).map(([k, v]) => (
                                  <div
                                    key={k}
                                    className={`p-2 rounded-lg text-xs border flex items-start gap-1.5 min-w-0 overflow-x-auto ${
                                      k === q.answer
                                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold'
                                        : 'border-slate-200 bg-white text-slate-700'
                                    }`}
                                  >
                                    <span className="font-bold shrink-0">{k}.</span>
                                    <div className="min-w-0 flex-1">
                                      <MarkdownRenderer content={String(v)} inline />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="p-2 rounded-lg bg-white border border-slate-100 text-[11px] text-slate-600">
                              <span className="font-bold text-slate-800">标准解析：</span>
                              <MarkdownRenderer content={q.explanation} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: JSON Import */}
              {importSubTab === 'json' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      粘贴标准 JSON 格式题目数组：
                    </label>
                    <button
                      onClick={() => {
                        const templates: Record<ResourceDomain, any[]> = {
                          math: [
                            {
                              domain: 'math',
                              subject: '高等数学',
                              chapter: '一元微积分',
                              type: 'choice',
                              difficulty: '中等',
                              question: '设 $f(x) = \\int_0^x (t-1)e^t dt$，则 $f(x)$ 的极小值点为（ ）',
                              options: { A: '$x = 0$', B: '$x = 1$', C: '$x = -1$', D: '不存在' },
                              answer: 'B',
                              explanation: '变上限积分求导得 $f\'(x) = (x-1)e^x$。令 $f\'(x) = 0$ 得驻点 $x = 1$。当 $x < 1$ 时 $f\'(x) < 0$，当 $x > 1$ 时 $f\'(x) > 0$，故 $x = 1$ 为极小值点。',
                              tags: ['极值', '变上限积分']
                            }
                          ],
                          cs_408: [
                            {
                              domain: 'cs_408',
                              subject: '数据结构',
                              chapter: '栈与队列',
                              type: 'choice',
                              difficulty: '中等',
                              question: '若进栈序列为 1, 2, 3, 4，且进栈和出栈可以穿插进行，则不可能的输出序列是（ ）',
                              options: { A: '1, 4, 3, 2', B: '2, 3, 4, 1', C: '3, 1, 4, 2', D: '4, 3, 2, 1' },
                              answer: 'C',
                              explanation: '若先输出 3，则 1 和 2 必在栈中，且 2 在 1 上方，2 必须先于 1 出栈，故 3, 1, 4, 2 不可能出现。',
                              tags: ['栈', '出栈序列']
                            }
                          ],
                          english: [
                            {
                              domain: 'english',
                              subject: '阅读理解',
                              chapter: '主旨与细节推理',
                              type: 'choice',
                              difficulty: '中等',
                              question: 'According to the passage, the author\'s attitude toward remote work is mainly ________.',
                              options: { A: 'enthusiastic', B: 'cautious', C: 'indifferent', D: 'skeptical' },
                              answer: 'B',
                              explanation: '原文先肯定了远程办公的灵活性，随后指出其在团队协作与职业边界上的潜在隐忧，整体态度偏向审慎（cautious）。',
                              tags: ['态度题', '阅读理解']
                            }
                          ],
                          politics: [
                            {
                              domain: 'politics',
                              subject: '马克思主义基本原理',
                              chapter: '唯物辩证法',
                              type: 'choice',
                              difficulty: '中等',
                              question: '“扬弃”是辩证否定观的核心范畴，它的准确含义是指（ ）',
                              options: { A: '全盘抛弃旧事物', B: '绝对保留旧事物', C: '既克服又保留', D: '单纯的形式改变' },
                              answer: 'C',
                              explanation: '辩证的否定是事物发展的环节与联系的环节，实质是“扬弃”，即新事物对旧事物既批判又继承、既克服其消极因素又保留其积极因素。',
                              tags: ['辩证否定观', '马原']
                            }
                          ],
                          general: [
                            {
                              domain: 'general',
                              subject: '专业课综合',
                              chapter: '核心概念',
                              type: 'choice',
                              difficulty: '中等',
                              question: '关于该专业课核心研究方法，下列表述最为准确的是（ ）',
                              options: { A: '选项A内容', B: '选项B内容', C: '选项C内容', D: '选项D内容' },
                              answer: 'A',
                              explanation: '结合专业课核心理论框架进行对比分析即可得出正确答案 A。',
                              tags: ['专业课', '核心概念']
                            }
                          ]
                        }
                        setJsonInput(JSON.stringify(templates[importDomain] || templates.math, null, 2))
                      }}
                      className="text-xs text-indigo-600 hover:underline cursor-pointer"
                    >
                      填入示例模板
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={jsonInput}
                    onChange={e => setJsonInput(e.target.value)}
                    placeholder="[ { ... } ]"
                    className="w-full text-xs font-mono rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleJsonImport}
                      disabled={!jsonInput.trim()}
                      className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      确认导入 JSON 题库
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Manage Custom Questions */}
              {importSubTab === 'manage' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      已导入的自定义题库列表（共 {customQuestions.length} 道题目）：
                    </span>
                    <button
                      onClick={loadCustomQuestions}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      刷新
                    </button>
                  </div>

                  {customQuestions.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400">
                      尚未导入任何自定义题目。可在「智能文本识别导入」中添加您的个人习题。
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {customQuestions.map(q => (
                        <div key={q.id} className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-2xs min-w-0 max-w-full overflow-hidden">
                          <div className="flex items-start justify-between gap-2 sm:gap-3 min-w-0">
                            <div className="flex-1 min-w-0 max-w-full">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {q.subject}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {q.difficulty}
                                </span>
                                {q.chapter && (
                                  <span className="text-[10px] text-slate-400">章节: {q.chapter}</span>
                                )}
                              </div>
                              <div className="text-xs font-semibold text-slate-900 mb-2 min-w-0 max-w-full overflow-x-auto">
                                <MarkdownRenderer content={q.question} />
                              </div>
                              <div className="text-[11px] text-slate-500 min-w-0 overflow-x-auto flex items-center gap-1">
                                <span className="shrink-0">答案：</span>
                                <span className="font-bold text-emerald-600">
                                  <MarkdownRenderer
                                    content={
                                      String(q.answer || '').includes('$') || !/\\/.test(String(q.answer || ''))
                                        ? String(q.answer || '')
                                        : `$${q.answer}$`
                                    }
                                    inline
                                  />
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteCustomQuestion(q.id)}
                              className="p-1.5 shrink-0 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="删除此题"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===== TAB 3: STUDENT ANALYTICS & WEAKNESS RADAR ===== */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Four-Dimensional Error Analysis */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                <span className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  错因四维画像诊断
                </span>
                <p className="text-[11px] text-slate-500 mb-4">基于您在刷题训练中的即时错因标记</p>

                <div className="space-y-3 flex-1 flex flex-col justify-center">
                  {[
                    { label: '概念不清', pct: 45, color: 'bg-rose-500', desc: '混淆定理前提或适用边界' },
                    { label: '公式记错', pct: 25, color: 'bg-amber-500', desc: '系数、负号或余项记忆偏差' },
                    { label: '计算失误', pct: 20, color: 'bg-blue-500', desc: '代数化简或行列式展开算错' },
                    { label: '审题疏忽', pct: 10, color: 'bg-emerald-500', desc: '漏看正定/可逆/无向图条件' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{item.label}</span>
                        <span className="font-bold text-slate-900">{item.pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Weak Knowledge Points */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
                <span className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-rose-500" />
                  薄弱考点热力预警
                </span>
                <p className="text-[11px] text-slate-500 mb-4">建议在进入冲刺前重点攻坚的板块</p>

                <div className="space-y-2.5 flex-1">
                  {[
                    { tag: '多元微积分 · 偏导存在与可微性', sub: '考研数学', rate: '错误率 68%' },
                    { tag: '实对称矩阵 · 正交相似对角化', sub: '考研数学', rate: '错误率 55%' },
                    { tag: '计算机组成 · Cache主存地址映射', sub: '408 计组', rate: '错误率 50%' },
                    { tag: '操作系统 · 虚拟内存两级分页转换', sub: '408 操作系统', rate: '错误率 45%' },
                  ].map((w, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800">{w.tag}</span>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                          {w.rate}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{w.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: AI Learning Companion Plan */}
              <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-blue-50/40 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    AI 研考伴学今日突破建议
                  </span>
                  <p className="text-[11px] text-indigo-700/80 mb-4">
                    根据你的错题沉淀和知识库吸收情况定制
                  </p>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="p-2.5 rounded-lg bg-white/90 border border-indigo-100/80">
                      <div className="font-semibold text-indigo-900 mb-1">1. 回溯复习笔记</div>
                      <p className="text-[11px] text-slate-600">
                        查阅知识库中的《[[高等数学/偏导数与全微分]]》，重温判定充要条件反例。
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/90 border border-indigo-100/80">
                      <div className="font-semibold text-indigo-900 mb-1">2. 举一反三变式训练</div>
                      <p className="text-[11px] text-slate-600">
                        利用做题中心的「AI 变式题」功能，针对昨日做错的方差和线性变换完成 3 道巩固题。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-100">
                  <button
                    onClick={() => {
                      onClose()
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
                  >
                    <span>进入做题中心开启攻坚</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 修改教材/资料名称弹窗 */}
      {renamingBook && (
        <div
          onClick={() => setRenamingBook(null)}
          className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-200">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">修改教材 / 资料名称</h3>
                  <p className="text-[11px] text-slate-400">重命名后将同步更新磁盘文件名与知识库关联</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRenamingBook(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  原文件名
                </label>
                <div className="text-xs font-mono text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 break-all select-all">
                  {renamingBook.name}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    新文件名
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleQuickCleanName}
                      className="text-[11px] text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-amber-200/60"
                      title="快速去除随机长哈希与时间戳后缀"
                    >
                      🧹 一键去杂乱后缀
                    </button>
                    <button
                      type="button"
                      onClick={handleSuggestName}
                      disabled={isSuggestingName}
                      className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-indigo-200/60 disabled:opacity-50"
                      title="让 AI 读取前言目录提炼标准书名"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{isSuggestingName ? 'AI 识别中...' : 'AI 智能识名'}</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={newBookName}
                  onChange={e => setNewBookName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleConfirmRename()
                  }}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="请输入清晰的教材名称（例如：高等数学第七版上册.pdf）"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRenamingBook(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRename}
                  disabled={isRenaming || !newBookName.trim()}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isRenaming ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>重命名中...</span>
                    </>
                  ) : (
                    <span>保存修改</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
