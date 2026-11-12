import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { lazyWithRetry } from '../utils/lazyWithRetry'
import ChunkErrorBoundary from '../components/ChunkErrorBoundary'
import SuspenseTimeoutFallback from '../components/ui/SuspenseTimeoutFallback'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Code2, XCircle, Plus, Search, RefreshCw, Loader2, Sparkles, Edit3, Network, Flame, Layers, FileText, Target } from 'lucide-react'
import { api, type BookItem } from '../services/api'
import { getAuthHeaders } from '../services/auth'
import { useAuth } from '../contexts/AuthContext'
import { CURATED_HANDOUTS, type HandoutItem } from '../data/handoutsData'
import { INTERACTIVE_COURSEWARES, type InteractiveCoursewareItem } from '../data/interactiveCourseware'



// 重型弹窗与深层视图按需懒加载，将初始页面体积降低 70%+，实现点击秒开

const HandoutReaderModal = lazy(() => import('../components/HandoutReaderModal'))

const PdfViewerModal = lazy(() => import('../components/PdfViewerModal'))

const CoursewareViewerModal = lazy(() => import('../components/CoursewareViewerModal'))

const QuickPracticeModal = lazy(() => import('../components/QuickPracticeModal'))

const ImportResourceModal = lazy(() => import('../components/ImportResourceModal'))

const StepTutorModal = lazy(() => import('../components/study/StepTutorModal'))

const BookExtractModal = lazy(() => import('../components/study/BookExtractModal').then(m => ({ default: m.BookExtractModal })))

const MasteryTopologyView = lazy(() => import('../components/study/MasteryTopologyView'))

const FlashcardsTab = lazy(() => import('../components/study/FlashcardsTab'))

const ProgressDashboardTab = lazy(() => import('../components/study/ProgressDashboardTab'))

const loadKnowledgeGraph = () => import('./KnowledgeGraph')
const KnowledgeGraph = lazyWithRetry(loadKnowledgeGraph, 'knowledgeGraph')
import MasteryPaletteSection from '../features/study/components/MasteryPaletteSection'
import PdfShelfTab from '../features/study/components/PdfShelfTab'
import CoursewaresTab from '../features/study/components/CoursewaresTab'
import HandoutsTab from '../features/study/components/HandoutsTab'

// 内存级缓存，避免切页时出现空白等待

let cachedBooksList: BookItem[] | null = null



type Tab = 'graph' | 'topology' | 'mastery' | 'flashcards' | 'handouts' | 'pdfs' | 'coursewares' | 'progress'









// 格式化错题与题目文本（若选项与题干混在同一行，智能换行与规整排版，支持 A-D 与 (A)-(D)）

export default function Study() {

  const { user } = useAuth()

  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  const initialTab = (searchParams.get('tab') as Tab) || 'handouts'

  const [tab, setTab] = useState<Tab>(

    ['topology', 'mastery', 'flashcards', 'handouts', 'pdfs', 'coursewares', 'progress'].includes(initialTab)

      ? initialTab

      : 'handouts'

  )



  const handleTabChange = useCallback((newTab: Tab) => {

    setTab(newTab)

    const newParams = new URLSearchParams(searchParams)

    newParams.set('tab', newTab)

    if (newTab !== 'coursewares') {

      newParams.delete('cw')

      newParams.delete('courseware')

    }

    setSearchParams(newParams, { replace: true })

  }, [searchParams, setSearchParams])



  // Subject filtering

  const [subjectFilter, setSubjectFilter] = useState<string>('all')

  const [searchQuery, setSearchQuery] = useState('')



  // Backend books & materials (优先利用内存缓存即时渲染，消除白屏等待)

  const [books, setBooks] = useState<BookItem[]>(() => cachedBooksList || [])

  const [loadingBooks, setLoadingBooks] = useState(() => !cachedBooksList)



  // Modals state

  const [activeHandout, setActiveHandout] = useState<HandoutItem | null>(null)

  const [activePdf, setActivePdf] = useState<BookItem | null>(null)

  const [activeCourseware, setActiveCourseware] = useState<InteractiveCoursewareItem | null>(null)

  const [importModalOpen, setImportModalOpen] = useState(false)

  const [extractingBook, setExtractingBook] = useState<BookItem | null>(null)

  const [batchExtracting, setBatchExtracting] = useState(false)

  const [batchResultMsg, setBatchResultMsg] = useState<string | null>(null)



  const handleBatchExtractAll = async () => {

    if (books.length === 0) return

    setBatchExtracting(true)

    setBatchResultMsg(null)

    try {

      const items = books.map(b => ({

        relativePath: b.relativePath,

        scope: b.scope,

        mode: (b.name.includes('题') || b.name.includes('880') || b.category === '历年真题') ? 'question' as const : 'concept' as const

      }))

      const res = await api.batchAutoExtractBooks(items)

      if (res.success) {

        setBatchResultMsg(
          res.queued
            ? `🎉 已将 ${res.count} 本教材/真题加入后台全卷队列扫描，结果将陆续沉淀至知识库与题库！`
            : `🎉 成功批量解析归类 ${res.count} 本教材/真题至知识库与题库！`
        )

        loadMaterials()

      }

    } catch (err: any) {

      setBatchResultMsg(`批量解析异常: ${err.message}`)

    } finally {

      setBatchExtracting(false)

    }

  }



  // Quick Practice Modal state

  const [practiceModalOpen, setPracticeModalOpen] = useState(false)

  const [practiceNote, setPracticeNote] = useState<{ title: string; content: string; path?: string }>({

    title: '', content: '', path: ''

  })



  // Load books list from server

  const loadMaterials = useCallback(async () => {

    if (!cachedBooksList) setLoadingBooks(true)

    try {

      const res = await api.getBooks()

      if (res.books) {

        setBooks(res.books)

        cachedBooksList = res.books

      }

    } catch (err) {

      console.warn('Failed to load books from server:', err)

    } finally {

      setLoadingBooks(false)

    }

  }, [])



  const handleDeleteBook = async (book: BookItem, e?: React.MouseEvent) => {

    e?.stopPropagation()

    const confirmDelete = window.confirm(`确定要永久删除参考资料《${book.name}》吗？\n删除后该文件将从归档库彻底移除。`)

    if (!confirmDelete) return



    try {

      const res = await fetch('/api/books/delete', {

        method: 'DELETE',

        headers: getAuthHeaders(),

        body: JSON.stringify({ relativePath: book.relativePath, scope: book.scope }),

      })

      const data = await res.json()

      if (data.success) {

        setBooks(prev => prev.filter(b => b.id !== book.id))

        cachedBooksList = null

        loadMaterials()

      } else {

        alert(data.error || '删除失败，请稍后重试')

      }

    } catch (err: any) {

      alert('删除异常: ' + (err.message || String(err)))

    }

  }



  // Rename book state & handlers

  const [renamingBook, setRenamingBook] = useState<BookItem | null>(null)

  const [newBookName, setNewBookName] = useState<string>('')

  const [isRenaming, setIsRenaming] = useState(false)

  const [isSuggestingName, setIsSuggestingName] = useState(false)



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

        setRenamingBook(null)

        loadMaterials()

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



  useEffect(() => {

    cachedBooksList = null

    loadMaterials()

  }, [loadMaterials, user?.id])



  // 支持通过 URL searchParams 直达指定 Tab 与指定仿真课件 (例如 /study?tab=coursewares&cw=cw-history-timeline)

  useEffect(() => {

    const tabParam = searchParams.get('tab') as Tab

    if (tabParam && ['graph', 'topology', 'mastery', 'flashcards', 'handouts', 'pdfs', 'coursewares', 'progress'].includes(tabParam)) {

      setTab(tabParam)

    }

    const cwParam = searchParams.get('cw') || searchParams.get('courseware')

    if (cwParam) {

      const targetCw = INTERACTIVE_COURSEWARES.find(c => c.id === cwParam)

      if (targetCw) {

        setActiveCourseware(targetCw)

      }

    }

  }, [searchParams])



  // Separate PDF books

  const pdfBooks = useMemo(() => {

    return books.filter(b => b.ext === '.pdf' || b.isPdf)

  }, [books])



  // Custom user handouts from raw-sources/ or uploaded

  const customHandouts = useMemo(() => {

    return books.filter(b => b.ext === '.md' && !b.isPdf && !b.isHtml)

  }, [books])



  // Combined handouts list

  const allHandouts = useMemo(() => {

    const list: HandoutItem[] = [...CURATED_HANDOUTS]

    // Add custom handouts from raw-sources if any

    customHandouts.forEach(b => {

      if (!list.some(h => h.id === b.relativePath)) {

        list.push({

          id: b.relativePath,

          title: b.name.replace(/\.md$/, ''),

          domain: b.domain,

          subject: b.domain === 'cs_408'
            ? '综合'
            : b.domain === 'english'
              ? '考研英语'
              : b.domain === 'politics'
                ? '考研政治'
                : b.domain === 'general'
                  ? '专业课综合'
                  : '高等数学',

          readTime: '15 分钟',

          difficulty: '核心考点',

          tags: [
            b.domain === 'cs_408'
              ? '408'
              : b.domain === 'english'
                ? '英语'
                : b.domain === 'politics'
                  ? '政治'
                  : b.domain === 'general'
                    ? '专业课'
                    : '数学',
            b.category,
          ],

          summary: `用户导入讲义：《${b.name}》，归档于 ${b.relativePath}`,

          keyTheorems: ['来自用户知识库自定义讲义', '支持即刻随堂测验与大模型精析'],

          content: '', // loaded on demand

        })

      }

    })

    return list

  }, [customHandouts])



  // Filtered Handouts

  const filteredHandouts = useMemo(() => {

    return allHandouts.filter(h => {

      // Subject filter

      if (subjectFilter !== 'all') {

        if (subjectFilter === 'cs_408' && h.domain !== 'cs_408') return false

        if (subjectFilter === 'math' && h.domain !== 'math') return false

        if (subjectFilter === 'politics' && h.domain !== 'politics') return false

        if (subjectFilter === 'english' && h.domain !== 'english') return false

        if (subjectFilter === 'general' && h.domain !== 'general') return false

        if (['数据结构', '计算机组成原理', '操作系统', '计算机网络', '高等数学', '线性代数', '概率论', '马克思主义基本原理', '马克思著作', '时事政治'].includes(subjectFilter)) {

          if (h.subject !== subjectFilter) return false

        }

      }

      // Search query

      if (searchQuery.trim()) {

        const q = searchQuery.toLowerCase()

        const titleMatch = h.title.toLowerCase().includes(q)

        const summaryMatch = h.summary.toLowerCase().includes(q)

        const tagsMatch = h.tags.some(t => t.toLowerCase().includes(q))

        if (!titleMatch && !summaryMatch && !tagsMatch) return false

      }

      return true

    })

  }, [allHandouts, subjectFilter, searchQuery])



  // Filtered PDFs

  const filteredPdfs = useMemo(() => {

    return pdfBooks.filter(b => {

      if (subjectFilter !== 'all') {

        if (subjectFilter === 'cs_408' && b.domain !== 'cs_408') return false

        if (subjectFilter === 'math' && b.domain !== 'math') return false

        if (subjectFilter === 'english' && b.domain !== 'english') return false

        if (subjectFilter === 'politics' && b.domain !== 'politics') return false

        if (subjectFilter === 'general' && b.domain !== 'general') return false

      }

      if (searchQuery.trim()) {

        const q = searchQuery.toLowerCase()

        return b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)

      }

      return true

    })

  }, [pdfBooks, subjectFilter, searchQuery])



  // Filtered Coursewares

  const filteredCoursewares = useMemo(() => {

    return INTERACTIVE_COURSEWARES.filter(c => {

      if (subjectFilter !== 'all') {

        if (subjectFilter === 'cs_408' && c.domain !== 'cs_408') return false

        if (subjectFilter === 'math' && c.domain !== 'math') return false

        if (subjectFilter === 'politics' && c.domain !== 'politics') return false

        if (['数据结构', '计算机组成原理', '操作系统', '计算机网络', '高等数学', '线性代数', '概率论', '政治史纲', '马克思主义基本原理', '时事政治'].includes(subjectFilter)) {

          if (!c.subject.includes(subjectFilter)) return false

        }

      }

      if (searchQuery.trim()) {

        const q = searchQuery.toLowerCase()

        return c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)

      }

      return true

    })

  }, [subjectFilter, searchQuery])



  // Handle open Handout

  const handleOpenHandout = async (handout: HandoutItem) => {

    if (handout.content) {

      setActiveHandout(handout)

    } else {

      // Custom handout, load content from server

      try {

        const res = await api.readBook(handout.id)

        setActiveHandout({

          ...handout,

          content: res.content || '未找到讲义正文内容'

        })

      } catch (err: any) {

        alert('读取讲义失败: ' + err.message)

      }

    }

  }



  // Handle Quick Practice for a Handout

  const handleResetHandoutFilters = useCallback(() => {
    setSubjectFilter('all')
    setSearchQuery('')
  }, [])

  const handleOpenCourseware = (item: InteractiveCoursewareItem) => {
    setActiveCourseware(item)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', 'coursewares')
    newParams.set('cw', item.id)
    setSearchParams(newParams, { replace: true })
  }

  const handlePracticeHandout = (handout: HandoutItem) => {

    setActiveHandout(null)

    setPracticeNote({

      title: handout.title,

      content: handout.content || handout.summary,

      path: handout.id

    })

    setPracticeModalOpen(true)

  }



  // Handle Ask AI about Handout

  const handleAskAI = (handout: HandoutItem) => {

    setActiveHandout(null)

    const prompt = `请深度剖析讲义《${handout.title}》的核心考点与真题常见命题陷阱，重点讲解：\n${handout.keyTheorems.join('\n')}`

    sessionStorage.setItem('prefilled_chat_prompt', prompt)

    navigate('/chat')

  }



  return (

    <div className="min-h-full xl:h-full flex flex-col gap-3 sm:gap-4 overflow-visible xl:overflow-hidden pb-4 xl:pb-0">

      {/* Top Banner / Hero - 响应式智能收拢 (严防手机端文字折行溢出格子) */}

      <div className="bg-surface border border-slate-200/80 rounded-xl p-3 sm:p-5 shadow-xs shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">

        <div className="min-w-0">

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">

            <span className="px-2 py-0.5 rounded-md text-2xs sm:text-2xs font-bold bg-accent-orange/15 text-warm-800 border border-accent-orange/20 whitespace-nowrap leading-tight">

              研学中心

            </span>

            <span className="text-2xs sm:text-xs text-warm-400 whitespace-nowrap leading-tight">

              408 统考与考研数学教研

            </span>

          </div>

          <h1 className="text-sm sm:text-lg md:text-xl font-bold text-warm-800 mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2 leading-snug">

            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-accent-orange shrink-0" />

            <span className="truncate">讲义与仿真课件工作台</span>

          </h1>

          <p className="text-xs text-warm-500 mt-1 max-w-2xl hidden sm:block">

            精选核心讲义、真题教材与交互式仿真课件，即学即练。

          </p>

        </div>



        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-auto justify-end">

          {/* 桌面端专属切换条 */}

          <div className="hidden md:inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-xs">

            <button

              type="button"

              onClick={() => handleTabChange('handouts')}

              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${

                tab !== 'graph'

                  ? 'bg-white text-slate-900 shadow-xs'

                  : 'text-slate-500 hover:text-slate-900'

              }`}

            >

              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>讲义列表</span>

            </button>

            <button

              type="button"

              onClick={() => handleTabChange('graph')}

              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${

                tab === 'graph'

                  ? 'bg-slate-900 text-white shadow-xs'

                  : 'text-slate-500 hover:text-slate-900'

              }`}

            >

              <Network className="w-3.5 h-3.5 shrink-0" />
              <span>全景图谱</span>

            </button>

          </div>



          <button

            type="button"

            onClick={() => window.dispatchEvent(new CustomEvent('open-quick-note'))}

            className="subframe-btn-secondary h-7 sm:h-8 px-2 sm:px-3 text-2xs sm:text-xs font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1 leading-none shrink-0"

            title="一键呼出随手记，记录心得并归档"

          >

            <Edit3 className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            <span className="hidden xs:inline">记批注</span>

            <span className="xs:hidden">批注</span>

          </button>

          <button

            type="button"

            onClick={() => setImportModalOpen(true)}

            className="subframe-btn-black h-7 sm:h-8 px-2 sm:px-3.5 text-2xs sm:text-xs font-medium cursor-pointer whitespace-nowrap flex items-center gap-1 leading-none shrink-0"

          >

            <Plus className="w-3.5 h-3.5 shrink-0" />

            <span>导入</span>

          </button>

          <button

            type="button"

            onClick={loadMaterials}

            disabled={loadingBooks}

            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-slate-200/90 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer shadow-xs"

            title="刷新资料库"

          >

            <RefreshCw className={`w-3.5 h-3.5 ${loadingBooks ? 'animate-spin' : ''}`} />

          </button>

        </div>

      </div>



      {/* Subframe Navigation Tabs & Search Bar */}

      <div className="bento-card rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2 sm:gap-3 shrink-0">

        {/* Navigation tabs - 简洁矢量图标 + 统一4字规范 */}

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 scroll-smooth shrink-0">

          {[

            { key: 'graph' as Tab, icon: Network, label: '全景图谱', shortLabel: '图谱', count: null },

            { key: 'handouts' as Tab, icon: BookOpen, label: '核心讲义', shortLabel: '讲义', count: filteredHandouts.length },

            { key: 'topology' as Tab, icon: Flame, label: '掌握热力', shortLabel: '热力', count: null },

            { key: 'mastery' as Tab, icon: Layers, label: '考点色谱', shortLabel: '色谱', count: 22 },

            { key: 'flashcards' as Tab, icon: Sparkles, label: '记忆闪卡', shortLabel: '闪卡', count: null },

            { key: 'pdfs' as Tab, icon: FileText, label: '真题教材', shortLabel: '教材', count: filteredPdfs.length },

            { key: 'coursewares' as Tab, icon: Code2, label: '仿真课件', shortLabel: '课件', count: INTERACTIVE_COURSEWARES.length },

            { key: 'progress' as Tab, icon: Target, label: '研学进度', shortLabel: '进度', count: null },

          ].map(t => {
            const TabIcon = t.icon
            return (
              <button

                key={t.key}

                onClick={() => handleTabChange(t.key)}

                onMouseEnter={() => {
                  if (t.key === 'graph') loadKnowledgeGraph().catch(() => {})
                }}

                onFocus={() => {
                  if (t.key === 'graph') loadKnowledgeGraph().catch(() => {})
                }}

                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-95 leading-normal ${

                  tab === t.key

                    ? 'bg-slate-900 text-white shadow-xs font-semibold'

                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'

                }`}

              >

                <TabIcon className={`w-3.5 h-3.5 shrink-0 ${tab === t.key ? 'text-white' : 'text-slate-400'}`} />

                <span className="hidden sm:inline">{t.label}</span>

                <span className="sm:hidden">{t.shortLabel}</span>

                {t.count !== null && (

                  <span className={`text-2xs px-1.5 py-0.5 rounded-md font-mono leading-none inline-flex items-center justify-center shrink-0 ${

                    tab === t.key ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500 border border-slate-200/60'

                  }`}>

                    {t.count}

                  </span>

                )}

              </button>
            )
          })}

        </div>



        {/* Right Filter & Search */}

        <div className="flex items-center gap-1.5 sm:gap-2 w-full xl:w-auto pt-1 xl:pt-0 border-t xl:border-t-0 border-slate-200/60">

          {/* Search box */}

          <div className="relative flex-1 xl:w-44">

            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />

            <input

              type="text"

              placeholder="搜索资料/考点..."

              value={searchQuery}

              onChange={e => setSearchQuery(e.target.value)}

              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 outline-none transition-all"

            />

          </div>



          {/* Subject Selector */}

          <select

            value={subjectFilter}

            onChange={e => setSubjectFilter(e.target.value)}

            className="text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none shrink-0 transition-all cursor-pointer"

          >

            <option value="all">全部学科</option>

            <option value="cs_408">408 计算机</option>

            <option value="数据结构">数据结构</option>

            <option value="计算机组成原理">计组与流水线</option>

            <option value="操作系统">操作系统</option>

            <option value="计算机网络">计算机网络</option>

            <option value="math">考研数学</option>

            <option value="高等数学">高等数学</option>

            <option value="线性代数">线性代数</option>

            <option value="概率论">概率统计</option>

            <option value="politics">考研政治</option>

            <option value="政治史纲">政治史纲</option>

            <option value="马克思主义基本原理">马克思主义基本原理</option>

            <option value="马克思著作">马克思经典著作</option>

            <option value="时事政治">时事政治</option>

            <option value="english">考研英语</option>

            <option value="general">其他考研资料</option>

          </select>

        </div>

      </div>



      {/* Main Tab Content */}

      <div className="flex-1 overflow-visible xl:overflow-y-auto pr-0 sm:pr-1 min-h-0">

        <Suspense fallback={<div className="py-12 flex justify-center text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin mr-2 text-indigo-500" />正在按需渲染视图...</div>}>

          {/* TAB 0: 考点知识拓扑与掌握度热力分布 */}

          {tab === 'graph' && (

            <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs relative min-h-[680px] h-[calc(100vh-240px)] flex flex-col animate-fade-in">

              <div className="px-4 py-2 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600 shrink-0">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                  <span className="font-semibold text-slate-800">全景考研知识双链网络图谱 (D3 物理力导向拓扑)</span>

                  <span className="hidden sm:inline text-slate-400">· 支持拖拽节点、缩放探索与点击打开关联讲义</span>

                </div>

                <div className="flex items-center gap-2">

                  <button

                    type="button"

                    onClick={() => window.dispatchEvent(new CustomEvent('open-quick-note'))}

                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-medium transition-colors"

                  >

                    <Edit3 className="w-3 h-3" />

                    <span>针对此考点批注</span>

                  </button>

                  <button

                    type="button"

                    onClick={() => handleTabChange('handouts')}

                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors"

                  >

                    返回讲义精读 →

                  </button>

                </div>

              </div>

              <div className="flex-1 relative w-full h-full overflow-hidden">

                <ChunkErrorBoundary title="知识图谱加载失败" className="h-full w-full">
                  <Suspense fallback={<SuspenseTimeoutFallback label="正在装载考研知识双链拓扑..." className="h-full" />}>
                    <KnowledgeGraph
                      externalSubjectFilter={subjectFilter}
                      externalSearchQuery={searchQuery}
                      onClearExternalFilters={() => {
                        setSubjectFilter('all')
                        setSearchQuery('')
                      }}
                    />
                  </Suspense>
                </ChunkErrorBoundary>

              </div>

            </div>

          )}



          {tab === 'topology' && (
            <MasteryTopologyView
              externalSubjectFilter={subjectFilter}
              externalSearchQuery={searchQuery}
            />
          )}



          {/* TAB 0.2: Subframe Screen 4 考点掌握度状态色谱 */}

          {tab === 'mastery' && <MasteryPaletteSection onSelectTopic={(topic) => { navigate(`/chat?prompt=${encodeURIComponent('请深度剖析考点：' + topic)}`) }} />}



          {/* TAB 0.5: 408 易忘考点记忆闪卡与极速背诵 */}

          {tab === 'flashcards' && <FlashcardsTab />}

        </Suspense>



        {/* TAB 1: 核心讲义精读 */}

        {tab === 'handouts' && (
          <HandoutsTab filteredHandouts={filteredHandouts} onResetFilters={handleResetHandoutFilters} handleOpenHandout={handleOpenHandout} handlePracticeHandout={handlePracticeHandout} />
        )}



        {/* TAB 2: PDF 核心教材专架 */}

        {tab === 'pdfs' && (
          <PdfShelfTab books={books} filteredPdfs={filteredPdfs} batchExtracting={batchExtracting} batchResultMsg={batchResultMsg} handleBatchExtractAll={handleBatchExtractAll} handleDeleteBook={handleDeleteBook} handleOpenRename={handleOpenRename} setActivePdf={setActivePdf} setBatchResultMsg={setBatchResultMsg} setExtractingBook={setExtractingBook} setImportModalOpen={setImportModalOpen} />
        )}



        {/* TAB 3: HTML 交互仿真课件 */}

        {tab === 'coursewares' && (
          <CoursewaresTab filteredCoursewares={filteredCoursewares} onOpenCourseware={handleOpenCourseware} />
        )}



        {/* TAB 4: 科目研学进度 */}

        {tab === 'progress' && (

          <Suspense fallback={<div className="py-12 flex justify-center text-xs text-slate-400"><Loader2 className="w-4 h-4 animate-spin mr-2 text-neutral-700" />正在装载研学进度诊断中心...</div>}>

            <ProgressDashboardTab onSwitchTab={handleTabChange} />

          </Suspense>

        )}

      </div>



      {/* Modals 异步懒加载容器 */}

      <Suspense fallback={null}>

        <HandoutReaderModal

          isOpen={!!activeHandout}

          onClose={() => setActiveHandout(null)}

          handout={activeHandout}

          onPractice={handlePracticeHandout}

          onAskAI={handleAskAI}

        />



        <PdfViewerModal

          isOpen={!!activePdf}

          onClose={() => setActivePdf(null)}

          book={activePdf}

          onExtractAi={() => {

            const current = activePdf

            setActivePdf(null)

            if (current) setExtractingBook(current)

          }}

        />



        {extractingBook && (

          <BookExtractModal

            book={extractingBook}

            onClose={() => setExtractingBook(null)}

            onSuccess={() => {

              loadMaterials()

            }}

          />

        )}



        <CoursewareViewerModal

          isOpen={!!activeCourseware}

          onClose={() => {

            setActiveCourseware(null)

            if (searchParams.has('cw') || searchParams.has('courseware')) {

              const newParams = new URLSearchParams(searchParams)

              newParams.delete('cw')

              newParams.delete('courseware')

              setSearchParams(newParams, { replace: true })

            }

          }}

          item={activeCourseware}

          onPractice={(item) => {

            setActiveCourseware(null)

            if (searchParams.has('cw') || searchParams.has('courseware')) {

              const newParams = new URLSearchParams(searchParams)

              newParams.delete('cw')

              newParams.delete('courseware')

              setSearchParams(newParams, { replace: true })

            }

            setPracticeNote({

              title: item.title,

              content: item.summary + '\n' + item.learningPoints.join('\n'),

              path: item.id

            })

            setPracticeModalOpen(true)

          }}

        />



        <QuickPracticeModal

          isOpen={practiceModalOpen}

          onClose={() => setPracticeModalOpen(false)}

          noteTitle={practiceNote.title}

          noteContent={practiceNote.content}

          notePath={practiceNote.path}

        />



        <ImportResourceModal

          isOpen={importModalOpen}

          onClose={() => {

            setImportModalOpen(false)

            loadMaterials()

          }}

          onQuestionsUpdated={loadMaterials}

          onBooksUpdated={loadMaterials}

        />

      </Suspense>



      {/* 修改教材/资料名称弹窗 */}

      {renamingBook && createPortal(

        <div

          onClick={() => setRenamingBook(null)}

          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"

        >

          <div

            onClick={e => e.stopPropagation()}

            className="bg-white rounded-2xl border border-cream-300 shadow-xl w-full max-w-md max-h-[88dvh] overflow-y-auto overscroll-contain p-5 sm:p-6 animate-scale-up"

            style={{ WebkitOverflowScrolling: 'touch' }}

          >

            <div className="flex items-center justify-between border-b border-cream-200 pb-3 mb-4">

              <div className="flex items-center gap-2.5">

                <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-200">

                  <Edit3 className="w-4 h-4" />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-warm-800">修改教材 / 资料名称</h3>

                  <p className="text-2xs text-warm-400">重命名后将同步更新磁盘文件名与知识库关联</p>

                </div>

              </div>

              <button

                type="button"

                onClick={() => setRenamingBook(null)}

                className="p-1 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-cream-100 cursor-pointer"

              >

                <XCircle className="w-4 h-4" />

              </button>

            </div>



            <div className="space-y-4">

              <div>

                <label className="block text-xs font-semibold text-warm-600 mb-1.5">

                  原文件名

                </label>

                <div className="text-xs font-mono text-warm-500 bg-cream-100/80 p-2.5 rounded-xl border border-cream-200 break-all select-all">

                  {renamingBook.name}

                </div>

              </div>



              <div>

                <div className="flex items-center justify-between mb-1.5">

                  <label className="text-xs font-semibold text-warm-700">

                    新文件名

                  </label>

                  <div className="flex items-center gap-2">

                    <button

                      type="button"

                      onClick={handleQuickCleanName}

                      className="text-2xs text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"

                      title="快速去除随机长哈希与时间戳后缀"

                    >

                      🧹 一键去杂乱后缀

                    </button>

                    <button

                      type="button"

                      onClick={handleSuggestName}

                      disabled={isSuggestingName}

                      className="flex items-center gap-1 text-2xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"

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

                    if (e.key === 'Escape') setRenamingBook(null)

                  }}

                  autoFocus

                  placeholder="请输入规范书名，例如：2026操作系统高分笔记.pdf"

                  className="w-full text-xs bg-cream-50 border border-cream-300 focus:border-accent-orange focus:ring-1 focus:ring-accent-orange rounded-xl p-2.5 outline-hidden text-warm-800"

                />

                <p className="text-2xs text-warm-400 mt-1">

                  提示：如未填写扩展名，系统将自动保持原扩展名（{renamingBook.ext}）

                </p>

              </div>



              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-cream-200/60">

                <button

                  type="button"

                  onClick={() => setRenamingBook(null)}

                  disabled={isRenaming}

                  className="px-3.5 py-1.5 rounded-xl border border-cream-300 text-warm-600 hover:bg-cream-100 text-xs font-medium cursor-pointer"

                >

                  取消

                </button>

                <button

                  type="button"

                  onClick={handleConfirmRename}

                  disabled={isRenaming || !newBookName.trim() || newBookName.trim() === renamingBook.name}

                  className="px-4 py-1.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"

                >

                  {isRenaming && <Loader2 className="w-3.5 h-3.5 animate-spin" />}

                  <span>{isRenaming ? '保存中...' : '确认重命名'}</span>

                </button>

              </div>

            </div>

          </div>

        </div>,

        document.body

      )}

    </div>

  )

}
