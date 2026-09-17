import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import {
  BookOpen, FileText, Code2, XCircle,
  Plus, Search, Target, Clock,
  Download, RefreshCw, Loader2, ChevronRight,
  Check, ThumbsUp, ThumbsDown, Minus, ArrowRight
} from 'lucide-react'
import { api, type BookItem, type DailyReviewData, type SubjectStats } from '../services/api'
import { CURATED_HANDOUTS, type HandoutItem } from '../data/handoutsData'
import { INTERACTIVE_COURSEWARES, type InteractiveCoursewareItem } from '../data/interactiveCourseware'
import HandoutReaderModal from '../components/HandoutReaderModal'
import PdfViewerModal from '../components/PdfViewerModal'
import CoursewareViewerModal from '../components/CoursewareViewerModal'
import QuickPracticeModal from '../components/QuickPracticeModal'
import ImportResourceModal from '../components/ImportResourceModal'

type Tab = 'handouts' | 'pdfs' | 'coursewares' | 'errors' | 'progress'

// Palette for charts
const colorPalette = [
  '#f97316', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6',
  '#06b6d4', '#f59e0b', '#6366f1', '#14b8a6', '#84cc16',
]

export default function Study() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('handouts')

  // Subject filtering
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Backend books & materials
  const [books, setBooks] = useState<BookItem[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)

  // Modals state
  const [activeHandout, setActiveHandout] = useState<HandoutItem | null>(null)
  const [activePdf, setActivePdf] = useState<BookItem | null>(null)
  const [activeCourseware, setActiveCourseware] = useState<InteractiveCoursewareItem | null>(null)
  const [importModalOpen, setImportModalOpen] = useState(false)

  // Quick Practice Modal state
  const [practiceModalOpen, setPracticeModalOpen] = useState(false)
  const [practiceNote, setPracticeNote] = useState<{ title: string; content: string; path?: string }>({
    title: '', content: '', path: ''
  })

  // Load books list from server
  const loadMaterials = useCallback(async () => {
    setLoadingBooks(true)
    try {
      const res = await api.getBooks()
      if (res.books) {
        setBooks(res.books)
      }
    } catch (err) {
      console.warn('Failed to load books from server:', err)
    } finally {
      setLoadingBooks(false)
    }
  }, [])

  useEffect(() => {
    loadMaterials()
  }, [loadMaterials])

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
          subject: b.domain === 'cs_408' ? '综合' : '高等数学',
          readTime: '15 分钟',
          difficulty: '核心考点',
          tags: [b.domain === 'cs_408' ? '408' : '数学', b.category],
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
        if (['数据结构', '计算机组成原理', '操作系统', '计算机网络', '高等数学', '线性代数', '概率论'].includes(subjectFilter)) {
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
        if (['数据结构', '计算机组成原理', '操作系统', '计算机网络', '高等数学', '线性代数', '概率论'].includes(subjectFilter)) {
          if (c.subject !== subjectFilter) return false
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
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Top Banner / Hero */}
      <div className="bg-surface border border-cream-200 rounded-2xl p-5 shadow-xs shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-accent-orange/15 text-warm-800 border border-accent-orange/20">
              COREFORGE 研学中心
            </span>
            <span className="text-xs text-warm-400">
              408 计算机统考 & 考研数学权威教研库
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-bold text-warm-800 mt-1.5 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-orange" />
            讲义 · 权威教材 · 交互课件研学工作台
          </h1>
          <p className="text-xs text-warm-500 mt-1 max-w-2xl">
            已屏蔽 Obsidian 底层碎片流水文件。直接精读核心讲义、PDF 电子参考书与直观的 HTML 交互仿真课件，即学即练。
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-orange text-white font-semibold text-xs hover:bg-accent-orange/90 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            导入教材 / PDF / 讲义
          </button>
          <button
            onClick={loadMaterials}
            disabled={loadingBooks}
            className="p-2 rounded-xl bg-cream-200 text-warm-500 hover:text-warm-700 hover:bg-cream-300 transition-colors disabled:opacity-50"
            title="刷新资料库"
          >
            <RefreshCw className={`w-4 h-4 ${loadingBooks ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs & Search & Filter Bar */}
      <div className="bg-surface border border-cream-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Navigation tabs */}
        <div className="flex items-center gap-1.5">
          {[
            { key: 'handouts' as Tab, label: '📖 精编核心讲义', count: allHandouts.length },
            { key: 'pdfs' as Tab, label: '📑 PDF 电子教材与真题', count: pdfBooks.length },
            { key: 'coursewares' as Tab, label: '🌐 HTML 交互仿真课件', count: INTERACTIVE_COURSEWARES.length },
            { key: 'errors' as Tab, label: '📝 每日错题强化', count: null },
            { key: 'progress' as Tab, label: '📊 科目研学进度', count: null },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                tab === t.key
                  ? 'bg-accent-orange/15 text-warm-800 shadow-2xs'
                  : 'text-warm-500 hover:text-warm-800 hover:bg-cream-200'
              }`}
            >
              {t.label}
              {t.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  tab === t.key ? 'bg-accent-orange/25 text-warm-800' : 'bg-cream-300 text-warm-400'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right Filter & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              type="text"
              placeholder="搜索讲义/课件/关键词..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-cream-100 border border-cream-200 rounded-lg text-warm-800 placeholder-warm-400 focus:outline-hidden focus:border-accent-orange transition-colors"
            />
          </div>

          {/* Subject Pills Dropdown/Selector */}
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="text-xs bg-cream-100 border border-cream-200 rounded-lg px-2.5 py-1.5 text-warm-700 focus:outline-hidden focus:border-accent-orange"
          >
            <option value="all">全部学科</option>
            <option value="cs_408">408 计算机综合</option>
            <option value="数据结构">408 · 数据结构</option>
            <option value="计算机组成原理">408 · 计组与流水线</option>
            <option value="操作系统">408 · 操作系统与内存</option>
            <option value="计算机网络">408 · 计算机网络</option>
            <option value="math">考研数学综合</option>
            <option value="高等数学">数学 · 高等数学</option>
            <option value="线性代数">数学 · 线性代数</option>
            <option value="概率论">数学 · 概率论与数理统计</option>
          </select>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* TAB 1: 核心讲义精读 */}
        {tab === 'handouts' && (
          <div className="space-y-4">
            {filteredHandouts.length === 0 ? (
              <div className="text-center py-16 text-warm-400 space-y-3">
                <FileText className="w-12 h-12 mx-auto opacity-30" />
                <div className="text-sm">未找到匹配的讲义资料</div>
                <button
                  onClick={() => { setSubjectFilter('all'); setSearchQuery('') }}
                  className="text-xs text-accent-orange hover:underline"
                >
                  重置筛选条件
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHandouts.map(handout => {
                  const isCs = handout.domain === 'cs_408'
                  return (
                    <div
                      key={handout.id}
                      onClick={() => handleOpenHandout(handout)}
                      className="bg-surface border border-cream-200 hover:border-accent-orange/40 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top tags */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isCs
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            }`}>
                              {isCs ? '408 计算机' : '考研数学'} · {handout.subject}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">
                              {handout.difficulty}
                            </span>
                          </div>
                          <span className="text-[11px] text-warm-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {handout.readTime}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm md:text-base font-bold text-warm-800 group-hover:text-accent-orange transition-colors leading-snug">
                          {handout.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-xs text-warm-500 mt-2 line-clamp-2 leading-relaxed">
                          {handout.summary}
                        </p>

                        {/* Key theorems preview */}
                        {handout.keyTheorems && handout.keyTheorems.length > 0 && (
                          <div className="mt-3 p-2.5 rounded-xl bg-cream-100/60 border border-cream-200/70 space-y-1">
                            {handout.keyTheorems.slice(0, 2).map((th, i) => (
                              <div key={i} className="text-[11px] text-warm-600 truncate flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-orange shrink-0" />
                                <span className="truncate">{th}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom actions */}
                      <div className="mt-4 pt-3 border-t border-cream-200/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {handout.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[10px] text-warm-400 bg-cream-200/60 px-1.5 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePracticeHandout(handout)
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 transition-colors shrink-0"
                            title="针对本讲义即刻生成 3 道真题测试"
                          >
                            <Target className="w-3 h-3" />
                            即练
                          </button>
                          <span className="text-xs font-semibold text-accent-orange group-hover:translate-x-0.5 transition-transform flex items-center">
                            精读 <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PDF 核心教材专架 */}
        {tab === 'pdfs' && (
          <div className="space-y-4">
            {filteredPdfs.length === 0 ? (
              <div className="text-center py-16 text-warm-400 space-y-3 bg-surface border border-cream-200 rounded-2xl">
                <FileText className="w-12 h-12 mx-auto opacity-30 text-rose-400" />
                <div className="text-sm font-medium">暂无匹配的 PDF 电子教材或真题卷</div>
                <p className="text-xs text-warm-400 max-w-sm mx-auto">
                  点击右上角「导入教材/PDF」上传你的 408 全书、真题试卷或李林数学讲义，即可在此内嵌原生沉浸阅读！
                </p>
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-accent-orange text-white text-xs font-semibold hover:bg-accent-orange/90 transition-colors shadow-xs"
                >
                  立即导入手头 PDF
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPdfs.map(book => {
                  const sizeMb = (book.size / (1024 * 1024)).toFixed(2)
                  const isCs = book.domain === 'cs_408'
                  return (
                    <div
                      key={book.id}
                      onClick={() => setActivePdf(book)}
                      className="bg-surface border border-cream-200 hover:border-red-400/40 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                            PDF 电子教材
                          </span>
                          <span className="text-[11px] text-warm-400">
                            {sizeMb} MB
                          </span>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-200 shrink-0 group-hover:scale-105 transition-transform">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-warm-800 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                              {book.name}
                            </h3>
                            <div className="text-[11px] text-warm-400 mt-1">
                              {isCs ? '408 计算机' : '考研数学'} · {book.category}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-cream-200/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-warm-400">
                          {new Date(book.lastModified).toLocaleDateString('zh-CN')}
                        </span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/books/raw?path=${encodeURIComponent(book.relativePath)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            download={book.name}
                            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-cream-200 transition-colors"
                            title="下载至本地"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <span className="font-semibold text-red-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            内嵌阅读 <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HTML 交互仿真课件 */}
        {tab === 'coursewares' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCoursewares.map(item => {
                const isCs = item.domain === 'cs_408'
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveCourseware(item)}
                    className="bg-surface border border-cream-200 hover:border-cyan-400/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                          {isCs ? '408 计算机' : '考研数学'} · {item.subject}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">
                          {item.difficulty}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 shrink-0 group-hover:scale-105 transition-transform">
                          <Code2 className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-warm-800 group-hover:text-cyan-600 transition-colors leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs text-warm-500 mt-2 line-clamp-2 leading-relaxed">
                            {item.summary}
                          </p>
                        </div>
                      </div>

                      {/* Learning takeaways */}
                      <div className="mt-3 p-2.5 rounded-xl bg-cream-100/60 border border-cream-200/70 space-y-1">
                        {item.learningPoints.slice(0, 2).map((pt, i) => (
                          <div key={i} className="text-[11px] text-warm-600 truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                            <span className="truncate">{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-cream-200/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] text-warm-400 bg-cream-200/60 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <span className="font-semibold text-cyan-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        进入仿真 <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 4: 每日错题强化 */}
        {tab === 'errors' && <DailyErrorTab />}

        {/* TAB 5: 科目研学进度 */}
        {tab === 'progress' && <ProgressTab />}
      </div>

      {/* Modals */}
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
          setActivePdf(null)
          setImportModalOpen(true)
        }}
      />

      <CoursewareViewerModal
        isOpen={!!activeCourseware}
        onClose={() => setActiveCourseware(null)}
        item={activeCourseware}
        onPractice={(item) => {
          setActiveCourseware(null)
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
      />
    </div>
  )
}

// ─── Daily Error Tab ──────────────────────────────────────────────────────────

function DailyErrorTab() {
  const [data, setData] = useState<DailyReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    api.getDailyReview()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleResult = async (result: 'mastered' | 'easy' | 'hard') => {
    if (!data || currentIdx >= data.dueQuestions.length) return
    const q = data.dueQuestions[currentIdx]
    const date = q._sourceFile?.replace('.md', '') || data.date

    setReviewing(true)
    try {
      await api.markReviewComplete(date, currentIdx, result)
    } catch { /* ignore */ }

    if (currentIdx < data.dueQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setShowAnswer(false)
    } else {
      setCurrentIdx(0)
      setShowAnswer(false)
      await loadData()
    }
    setReviewing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-warm-500 py-12 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> 正在调取今日错题数据...
      </div>
    )
  }

  if (!data || data.dueQuestions.length === 0) {
    return (
      <div className="bg-surface border border-cream-200 rounded-2xl text-center py-16 space-y-4 max-w-xl mx-auto">
        <Check className="w-12 h-12 mx-auto text-accent-sage/40" />
        <div className="text-base font-bold text-warm-800">太棒了！今日没有待复习的错题</div>
        <div className="text-xs text-warm-400">
          错题库共收录 {data?.stats.totalQuestions || 0} 道考研错题，已彻底掌握 {data?.stats.masteredCount || 0} 道
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-cream-200 text-xs font-semibold text-warm-600 hover:bg-cream-300 transition-colors"
        >
          刷新检查
        </button>
      </div>
    )
  }

  const currentQ = data.dueQuestions[currentIdx]
  const stats = data.stats

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-surface border border-cream-200 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-warm-400">今日待复习</div>
          <div className="text-xl font-bold text-accent-amber">{stats.dueCount}</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-warm-400">总错题数</div>
          <div className="text-xl font-bold text-warm-800">{stats.totalQuestions}</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-warm-400">已掌握</div>
          <div className="text-xl font-bold text-accent-sage">{stats.masteredCount}</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl px-4 py-3 text-center">
          <div className="text-xs text-warm-400">当前题号</div>
          <div className="text-xl font-bold text-accent-orange">
            {currentIdx + 1}/{data.dueQuestions.length}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-cream-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-warm-500 font-semibold">
              错题复盘 {currentIdx + 1} / {data.dueQuestions.length}
            </span>
            {currentQ.source && (
              <span className="ml-auto text-[10px] text-warm-400 truncate max-w-[200px]">
                来源: {currentQ.source}
              </span>
            )}
          </div>
          <div className="text-base text-warm-800 font-medium leading-relaxed">
            {currentQ.question}
          </div>
          {currentQ.userAnswer && (
            <div className="px-3 py-2 bg-rose-500/5 border border-rose-500/10 rounded-lg">
              <span className="text-[10px] text-rose-500 block mb-1">你记录的错误解答：</span>
              <span className="text-xs text-rose-700">{currentQ.userAnswer}</span>
            </div>
          )}
        </div>

        {showAnswer ? (
          <div className="border-t border-cream-200 bg-cream-100/50 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent-sage" />
              <span className="text-xs text-accent-sage font-bold">正确答案与推导</span>
            </div>
            <div className="text-sm text-warm-800 leading-relaxed font-semibold">{currentQ.correctAnswer}</div>
            {currentQ.explanation && (
              <div className="mt-2 px-3.5 py-2.5 bg-cream-200/60 rounded-xl">
                <span className="text-[10px] text-warm-400 block mb-1">名师解析与考点归因：</span>
                <span className="text-xs text-warm-700 leading-relaxed">{currentQ.explanation}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="border-t border-cream-200 p-4 text-center">
            <button
              onClick={() => setShowAnswer(true)}
              className="text-sm font-semibold text-accent-orange hover:text-accent-orange/80 transition-colors"
            >
              点击查看正确答案与解析
            </button>
          </div>
        )}
      </div>

      {showAnswer && (
        <div className="flex gap-3">
          <button
            onClick={() => handleResult('hard')}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm font-semibold hover:bg-accent-rose/20 transition-colors disabled:opacity-50"
          >
            <ThumbsDown className="w-4 h-4" /> 仍有疑惑 (留存)
          </button>
          <button
            onClick={() => handleResult('easy')}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-sm font-semibold hover:bg-accent-amber/20 transition-colors disabled:opacity-50"
          >
            <Minus className="w-4 h-4" /> 稍加思索 (3天后)
          </button>
          <button
            onClick={() => handleResult('mastered')}
            disabled={reviewing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-sage/10 border border-accent-sage/20 text-accent-sage text-sm font-semibold hover:bg-accent-sage/20 transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="w-4 h-4" /> 完全掌握 (归档)
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Progress Tab ─────────────────────────────────────────────────────────────

function ProgressTab() {
  const [stats, setStats] = useState<SubjectStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getReviewDue()
      .then(data => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-warm-500 py-12 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> 统计学科备考进度...
      </div>
    )
  }

  const chartData = [
    { name: '408 · 数据结构', 核心讲义: 4, 习题数: 36 },
    { name: '408 · 计组与流水线', 核心讲义: 3, 习题数: 28 },
    { name: '408 · 操作系统', 核心讲义: 3, 习题数: 30 },
    { name: '408 · 计算机网络', 核心讲义: 3, 习题数: 25 },
    { name: '数学 · 高等数学', 核心讲义: 5, 习题数: 45 },
    { name: '数学 · 线性代数', 核心讲义: 3, 习题数: 24 },
    { name: '数学 · 概率论', 核心讲义: 2, 习题数: 18 },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface border border-cream-200 rounded-xl p-4">
          <div className="text-xs text-warm-400">权威讲义库</div>
          <div className="text-2xl font-bold text-warm-800 mt-1">{CURATED_HANDOUTS.length} <span className="text-xs font-normal text-warm-400">篇精析</span></div>
          <div className="text-[10px] text-accent-orange mt-1">覆盖 408 与 考研数学全科</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl p-4">
          <div className="text-xs text-warm-400">交互仿真课件</div>
          <div className="text-2xl font-bold text-cyan-600 mt-1">{INTERACTIVE_COURSEWARES.length} <span className="text-xs font-normal text-warm-400">个互动课件</span></div>
          <div className="text-[10px] text-warm-400 mt-1">含 CPU 流水线、页面置换、泰勒</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl p-4">
          <div className="text-xs text-warm-400">考研真题与题库</div>
          <div className="text-2xl font-bold text-accent-sage mt-1">200+ <span className="text-xs font-normal text-warm-400">道统考真题</span></div>
          <div className="text-[10px] text-warm-400 mt-1">支持随时随堂一键即练</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl p-4">
          <div className="text-xs text-warm-400">AI 伴学引擎</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">双核 <span className="text-xs font-normal text-warm-400">+ 噜噜</span></div>
          <div className="text-[10px] text-warm-400 mt-1">Claude Code / Codex / DeepSeek</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface border border-cream-200 rounded-2xl p-5 shadow-xs">
        <div className="text-xs font-bold text-warm-700 mb-4">408 与 考研数学各科讲义与真题覆盖分布</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
            <XAxis dataKey="name" tick={{ fill: '#8b7e74', fontSize: 11 }} axisLine={{ stroke: '#d4c8ba' }} />
            <YAxis tick={{ fill: '#8b7e74', fontSize: 11 }} axisLine={{ stroke: '#d4c8ba' }} />
            <Tooltip
              contentStyle={{ background: '#FFFBF5', border: '1px solid #d4c8ba', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#3d3530' }}
            />
            <Bar dataKey="核心讲义" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={colorPalette[i % colorPalette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {stats.length > 0 && (
        <div className="bg-surface border border-cream-200 rounded-xl px-5 py-3 flex items-center justify-between text-xs text-warm-500">
          <span>底层知识库关联笔记：共 {stats.reduce((acc, s) => acc + s.totalNotes, 0)} 篇（已自动整理为讲义支撑索引）</span>
          <span>词汇量统计：{stats.reduce((acc, s) => acc + s.totalWords, 0).toLocaleString()} 字</span>
        </div>
      )}
    </div>
  )
}
