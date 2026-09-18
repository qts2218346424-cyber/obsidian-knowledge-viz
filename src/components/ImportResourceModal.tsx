import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  BookOpen,
  Upload,
  Sparkles,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Layers,
  FolderOpen,
  ArrowRight,
  Database
} from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

interface BookItem {
  id: string
  name: string
  relativePath: string
  fullPath: string
  domain: 'cs_408' | 'math'
  category: string
  size: number
  ext: string
  lastModified: string
  isTextReadable: boolean
}

interface CustomQuestion {
  id: string
  domain: 'cs_408' | 'math'
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
  defaultTab?: 'books' | 'import_quiz' | 'analytics'
}

export default function ImportResourceModal({
  isOpen,
  onClose,
  onQuestionsUpdated,
  defaultTab = 'books',
}: ImportResourceModalProps) {
  const [activeTab, setActiveTab] = useState<'books' | 'import_quiz' | 'analytics'>(defaultTab)

  // Books shelf state
  const [books, setBooks] = useState<BookItem[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null)
  const [, setBookContent] = useState<string>('')
  const [readingBook, setReadingBook] = useState(false)
  const [uploadDomain, setUploadDomain] = useState<'math' | 'cs_408'>('math')
  const [uploadCategory, setUploadCategory] = useState<string>('教材')
  const [isUploading, setIsUploading] = useState(false)

  // AI Extraction from Book
  const [extractSnippet, setExtractSnippet] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractResult, setExtractResult] = useState<{ note?: any; questions?: any[] } | null>(null)

  // Quiz Import state
  const [rawQuestionText, setRawQuestionText] = useState('')
  const [importDomain, setImportDomain] = useState<'math' | 'cs_408'>('math')
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

  useEffect(() => {
    if (isOpen) {
      loadBooks()
      loadCustomQuestions()
    }
  }, [isOpen])

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  // ===== Data Fetching =====

  const loadBooks = async () => {
    setLoadingBooks(true)
    try {
      const res = await fetch('/api/books/list')
      const data = await res.json()
      if (data.books) {
        setBooks(data.books)
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
      const res = await fetch('/api/quiz/custom')
      const data = await res.json()
      if (data.questions) {
        setCustomQuestions(data.questions)
      }
    } catch (err) {
      console.error('Failed to fetch custom questions:', err)
    } finally {
      setLoadingCustom(false)
    }
  }

  // ===== Book Actions =====

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('domain', uploadDomain)
    formData.append('category', uploadCategory)
    formData.append('file', file)

    try {
      const res = await fetch('/api/books/upload', {
        method: 'POST',
        body: formData,
      })
      const text = await res.text()
      let data: any = {}
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error(res.ok ? '服务解析异常' : `后端响应异常 (HTTP ${res.status}): ${text.slice(0, 120)}`)
      }

      if (data.success) {
        setImportFeedback(`资料《${file.name}》已成功导入并归档至 raw-sources！`)
        loadBooks()
      } else {
        alert(data.error || '上传失败')
      }
    } catch (err: any) {
      alert('上传异常: ' + err.message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleReadBook = async (book: BookItem) => {
    setSelectedBook(book)
    setExtractResult(null)
    if (!book.isTextReadable) {
      setBookContent('')
      return
    }
    setReadingBook(true)
    try {
      const res = await fetch('/api/books/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativePath: book.relativePath }),
      })
      const data = await res.json()
      if (data.content) {
        setBookContent(data.content)
        setExtractSnippet(data.content.slice(0, 2000))
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractSnippet,
          bookName: selectedBook?.name || '考研参考资料',
          domain: selectedBook?.domain || uploadDomain,
          subject: selectedBook?.domain === 'cs_408' ? '数据结构' : '高等数学',
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
          await fetch('/api/quiz/custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: data.questions }),
          })
          loadCustomQuestions()
          onQuestionsUpdated?.()
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
        headers: { 'Content-Type': 'application/json' },
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

  const handleCommitParsedQuestions = async () => {
    if (parsedPreviewQuestions.length === 0) return
    try {
      const res = await fetch('/api/quiz/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsedPreviewQuestions }),
      })
      const data = await res.json()
      if (data.success) {
        setImportFeedback(`成功导入 ${parsedPreviewQuestions.length} 道题目进入做题中心！`)
        setParsedPreviewQuestions([])
        setRawQuestionText('')
        loadCustomQuestions()
        onQuestionsUpdated?.()
      }
    } catch (err: any) {
      alert('导入失败: ' + err.message)
    }
  }

  const handleJsonImport = async () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const list = Array.isArray(parsed) ? parsed : [parsed]
      const res = await fetch('/api/quiz/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: list }),
      })
      const data = await res.json()
      if (data.success) {
        setImportFeedback(`成功批量导入 ${list.length} 道 JSON 题目！`)
        setJsonInput('')
        loadCustomQuestions()
        onQuestionsUpdated?.()
      }
    } catch (err: any) {
      alert('JSON 格式有误: ' + err.message)
    }
  }

  const handleDeleteCustomQuestion = async (id: string) => {
    if (!confirm('确定要删除这道自定义题目吗？')) return
    try {
      await fetch(`/api/quiz/custom/${id}`, { method: 'DELETE' })
      loadCustomQuestions()
      onQuestionsUpdated?.()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-5xl h-[88vh] rounded-2xl bg-white border border-slate-200/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                智能资料与题库导入中心
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  学练一体 · 考研研学大脑
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                导入手头教材参考书（PDF/MD）、智能批量入库真题习题、沉淀个人学情画像
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200/70 bg-white">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
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
            className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'import_quiz'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>📥 智能导入题库 ({customQuestions.length} 道已导入)</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold border-b-2 transition-colors ${
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
          <div className="flex items-center justify-between px-6 py-2 bg-emerald-50 border-b border-emerald-100 text-emerald-800 text-xs font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{importFeedback}</span>
            </div>
            <button
              onClick={() => setImportFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 underline ml-4"
            >
              关闭
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

          {/* ===== TAB 1: BOOKS & TEXTBOOKS SHELF ===== */}
          {activeTab === 'books' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Book List & Upload */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* Upload Card */}
                <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Upload className="h-4 w-4 text-indigo-600" />
                      导入新参考书 / 历年真题
                    </span>
                    <span className="text-[10px] text-slate-400">支持 PDF, Markdown, TXT</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">所属学科</label>
                      <select
                        value={uploadDomain}
                        onChange={e => setUploadDomain(e.target.value as any)}
                        className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="math">考研数学 (数一/二/三)</option>
                        <option value="cs_408">408 计算机学科综合</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">资料类别</label>
                      <select
                        value={uploadCategory}
                        onChange={e => setUploadCategory(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="教材">经典教材</option>
                        <option value="真题">历年真题</option>
                        <option value="辅导讲义">辅导讲义/精讲</option>
                        <option value="模拟题">模拟测试卷</option>
                      </select>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.md,.txt,.markdown"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
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
                        <span>选择文件上传至 raw-sources</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Books List */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FolderOpen className="h-4 w-4 text-slate-500" />
                      当前已归档参考书库 ({books.length})
                    </span>
                    <button
                      onClick={loadBooks}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      刷新
                    </button>
                  </div>

                  {loadingBooks ? (
                    <div className="py-8 text-center text-xs text-slate-400">正在扫描资料库...</div>
                  ) : books.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      暂无参考书文件，点击上方按钮上传你的考研教材与真题 PDF / Markdown
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                      {books.map(b => (
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
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {b.name}
                              </span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-200/60 text-slate-600 shrink-0">
                              {b.category}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                            <span>{b.domain === 'cs_408' ? '408 综合' : '考研数学'} · {b.ext.toUpperCase()}</span>
                            <span>{(b.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Book Details & AI Concept/Quiz Extraction */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm flex-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-bold text-slate-900">
                        {selectedBook ? `《${selectedBook.name}》· 智能考点与真题提炼` : '选择参考书进行 AI 智能提炼'}
                      </span>
                    </div>
                    {selectedBook && (
                      <span className="text-xs text-slate-400">{selectedBook.relativePath}</span>
                    )}
                  </div>

                  {readingBook ? (
                    <div className="py-16 text-center text-xs text-slate-400">正在读取文本...</div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-slate-700">
                            从参考书中选取或粘贴核心章节/定理片段（AI 将自动提取为规范笔记并生成真题）：
                          </label>
                          <span className="text-[10px] text-slate-400">{extractSnippet.length} 字</span>
                        </div>
                        <textarea
                          rows={6}
                          value={extractSnippet}
                          onChange={e => setExtractSnippet(e.target.value)}
                          placeholder="在此粘贴该教材或讲义中的定义、定理或例题文本（如：泰勒公式在求未定式极限中的应用、红黑树插入旋转条件等）..."
                          className="w-full text-xs font-mono rounded-xl border border-slate-200 p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end">
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
                              <span>一键提炼知识库笔记 & 生成配套真题</span>
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
                                  <div className="text-[11px] text-slate-500">
                                    答案：<span className="font-bold text-emerald-600">{q.answer}</span>
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
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setImportSubTab('smart_text')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    importSubTab === 'smart_text'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ⚡ 智能文本识别导入 (推荐)
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
                            const d = e.target.value as any
                            setImportDomain(d)
                            setImportSubject(d === 'math' ? '高等数学' : '数据结构')
                          }}
                          className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white"
                        >
                          <option value="math">考研数学 (数一/二/三)</option>
                          <option value="cs_408">408 计算机综合</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">科目章节</label>
                        <select
                          value={importSubject}
                          onChange={e => setImportSubject(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white"
                        >
                          {importDomain === 'math' ? (
                            <>
                              <option value="高等数学">高等数学 (微积分)</option>
                              <option value="线性代数">线性代数</option>
                              <option value="概率论与数理统计">概率论与数理统计</option>
                            </>
                          ) : (
                            <>
                              <option value="数据结构">数据结构</option>
                              <option value="计算机组成原理">计算机组成原理</option>
                              <option value="操作系统">操作系统</option>
                              <option value="计算机网络">计算机网络</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-800">
                          粘贴题目文本（支持任意来源，带选项、答案与解析）：
                        </label>
                        <span className="text-[10px] text-slate-400">支持一题或多题批量</span>
                      </div>
                      <textarea
                        rows={12}
                        value={rawQuestionText}
                        onChange={e => setRawQuestionText(e.target.value)}
                        placeholder={`示例：
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
                          <Sparkles className="h-4 w-4" />
                          <span>AI 智能格式化识别解析</span>
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

                            <div className="text-xs font-medium text-slate-900 mb-3">
                              {idx + 1}. <MarkdownRenderer content={q.question} />
                            </div>

                            {q.options && (
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                {Object.entries(q.options).map(([k, v]) => (
                                  <div
                                    key={k}
                                    className={`p-2 rounded-lg text-xs border ${
                                      k === q.answer
                                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold'
                                        : 'border-slate-200 bg-white text-slate-700'
                                    }`}
                                  >
                                    <span className="font-bold mr-1.5">{k}.</span>
                                    <MarkdownRenderer content={v} />
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
                        const template = [
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
                        ]
                        setJsonInput(JSON.stringify(template, null, 2))
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
                        <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
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
                              <div className="text-xs font-semibold text-slate-900 mb-2">
                                <MarkdownRenderer content={q.question} />
                              </div>
                              <div className="text-[11px] text-slate-500">
                                答案：<span className="font-bold text-emerald-600">{q.answer}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteCustomQuestion(q.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
    </div>
  )
}
