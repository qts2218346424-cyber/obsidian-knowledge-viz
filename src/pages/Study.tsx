import MarkdownRenderer from '../components/MarkdownRenderer'

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'

import { createPortal } from 'react-dom'

import { useNavigate, useSearchParams } from 'react-router-dom'

import {

  BookOpen, FileText, Code2, XCircle,

  Plus, Search, Target, Clock,

  Download, RefreshCw, Loader2, ChevronRight,

  Check, ThumbsUp, ThumbsDown, Minus, ArrowRight, Trash2, Sparkles, Edit3, ExternalLink

} from 'lucide-react'

import { api, type BookItem, type DailyReviewData } from '../services/api'

import { getAuthHeaders } from '../services/auth'

import { useAuth } from '../contexts/AuthContext'

import { CURATED_HANDOUTS, type HandoutItem } from '../data/handoutsData'

import { INTERACTIVE_COURSEWARES, type InteractiveCoursewareItem } from '../data/interactiveCourseware'

import { CheckCircle2, Database, Layers, ListChecks } from 'lucide-react'



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

const KnowledgeGraph = lazy(() => import('./KnowledgeGraph'))



// 内存级缓存，避免切页时出现空白等待

let cachedBooksList: BookItem[] | null = null



type Tab = 'graph' | 'topology' | 'mastery' | 'flashcards' | 'handouts' | 'pdfs' | 'coursewares' | 'errors' | 'progress'





// ── Subframe Screen 4 Replica: 考点掌握度状态色谱 (Mastery Palette) ──

const CS_408_SWATCHES = [

  { name: '二叉树遍历', stage: 'Gray 50', hex: '#F9FAFB', desc: '先序中序后序与线索化', border: true },

  { name: 'AVL/红黑树', stage: 'Gray 100', hex: '#F3F4F6', desc: '平衡旋转与插入调整', border: true },

  { name: 'Dijkstra算法', stage: 'Gray 200', hex: '#E5E7EB', desc: '单源最短路与贪心推演', border: false },

  { name: 'IEEE754浮点', stage: 'Gray 300', hex: '#BFC4CD', desc: '阶码尾数与规格化移码', border: false },

  { name: '流水线冒险', stage: 'Gray 400', hex: '#9CA3AF', desc: '结构/数据/控制冲突与转发', border: false },

  { name: '虚拟页式存储', stage: 'Gray 500', hex: '#6B7280', desc: '快表TLB命中率与多级页表', border: false },

  { name: 'PV信号量机制', stage: 'Gray 600', hex: '#4B5563', desc: '生产者消费者与哲学家就餐', border: false },

  { name: 'TCP拥塞控制', stage: 'Gray 700', hex: '#374151', desc: '慢开始/拥塞避免/快重传', border: false },

  { name: 'BGP/OSPF路由', stage: 'Gray 800', hex: '#1F2937', desc: '距离向量与链路状态算法', border: false },

  { name: '快速排序手撕', stage: 'Gray 900', hex: '#111827', desc: '双向划分与时间复杂度证明', border: false },

  { name: '408真题压轴', stage: 'Gray 950', hex: '#030712', desc: '软硬件协同综合应用大题', border: false },

]



const MATH_SWATCHES = [

  { name: '等价无穷小代换', stage: 'Violet 50', hex: '#F1EEFF', desc: '常见8组泰勒前置代换', border: false },

  { name: '洛必达与导数定义', stage: 'Violet 100', hex: '#E6E1FF', desc: '未定式极限判定法则', border: false },

  { name: '泰勒展开8大公式', stage: 'Violet 200', hex: '#D2CBFF', desc: '高阶无穷小精确截断展开', border: false },

  { name: '拉格朗日中值定理', stage: 'Violet 300', hex: '#B7ACFF', desc: '单调性与根的存在性证明', border: false },

  { name: '柯西中值与积分中值', stage: 'Violet 400', hex: '#9C8CFF', desc: '构造辅助函数的经典法门', border: false },

  { name: '反常积分审敛法', stage: 'Violet 500', hex: '#8470FF', desc: 'p级数对比判别法与极限法', border: false },

  { name: '多元微积分黑塞矩阵', stage: 'Violet 600', hex: '#755FF8', desc: '二次型正定与极值充分条件', border: false },

  { name: '伴随矩阵公式群', stage: 'Violet 700', hex: '#5D47DE', desc: '特征多项式与反矩阵乘积', border: false },

  { name: '特征值正交对角化', stage: 'Violet 800', hex: '#4634B1', desc: '实对称矩阵正交相似对角化', border: false },

  { name: '大数定律中心极限', stage: 'Violet 900', hex: '#2F227C', desc: '切比雪夫/辛钦/独立同分布', border: false },

  { name: '数一二三压轴精通', stage: 'Violet 950', hex: '#1C1357', desc: '微积分构造与矩阵方程秒杀', border: false },

]



function MasteryPaletteSection({ onSelectTopic }: { onSelectTopic: (topic: string) => void }) {

  const [copiedTopic, setCopiedTopic] = useState<string | null>(null)



  const handleCopyTopic = (topic: string, hex: string) => {

    navigator.clipboard?.writeText?.(topic)

    setCopiedTopic(topic)

    setTimeout(() => setCopiedTopic(null), 2500)

  }



  return (

    <div className="space-y-4 pb-28 sm:pb-8 animate-fade-in-up w-full min-w-0">

      {/* Top Floating Action Bar (Subframe Screen 4 Replica) */}

      <div className="flex flex-wrap items-center justify-between gap-2 py-1">

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white shadow-xs border border-zinc-200/70 text-xs font-semibold text-[#18181b]">

          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

          <span>考研考点掌握度状态色谱 (Mastery Palette)</span>

        </div>



        <div className="flex items-center gap-2">

          <div className="inline-flex items-center bg-white rounded-xl p-0.5 shadow-xs border border-zinc-200/70 text-xs font-medium text-[#27272a]">

            <button

              type="button"

              onClick={() => alert('已将当前 22 个核心考点掌握度进度导出为本地配置 JSON')}

              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"

            >

              <span>导出进度</span>

            </button>

            <button

              type="button"

              onClick={() => alert('已从本地知识库同步最新考点状态')}

              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"

            >

              <span>同步 Vault</span>

            </button>

          </div>



          <a

            href="/chat"

            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white shadow-xs text-xs font-medium hover:bg-black transition-colors"

          >

            <Sparkles className="w-3.5 h-3.5" />

            <span>Ask AI: 生成自测卷</span>

          </a>

        </div>

      </div>



      {copiedTopic && (

        <div className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium shadow-lg border border-neutral-800 flex items-center gap-2 animate-in fade-in">

          <Check className="w-3.5 h-3.5 text-emerald-400" />

          <span>已就绪考点「{copiedTopic}」，可直接前往做题中心或向 AI 导师提问</span>

        </div>

      )}



      {/* 408 Gray Palette Card (Screen 4 Exact Replica) */}

      <div className="bg-white rounded-2xl border border-zinc-200/70 p-5 sm:p-6 shadow-xs">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-sm sm:text-base font-semibold text-[#18181b] flex items-center gap-2">

              <span>🖥️ 408 计算机学科专业基础 · 掌握度阶度</span>

            </h2>

            <p className="text-xs text-zinc-400 mt-0.5">从初识概念 (Gray 50) 到压轴综合大题手撕精通 (Gray 950)</p>

          </div>

          <span className="subframe-pill text-[11px]">11 级阶度</span>

        </div>



        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-y-6 gap-x-3 justify-items-center">

          {CS_408_SWATCHES.map((item, idx) => (

            <button

              key={idx}

              type="button"

              onClick={() => handleCopyTopic(item.name, item.hex)}

              className="group flex flex-col items-center focus:outline-none cursor-pointer text-center max-w-[84px]"

              title={`点击考查「${item.name}」：${item.desc}`}

            >

              <div

                className={`w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full mb-2 transition-transform group-hover:scale-105 shadow-xs flex items-center justify-center text-[10px] font-mono ${

                  item.border ? 'border border-zinc-200/90' : ''

                }`}

                style={{ backgroundColor: item.hex }}

              />

              <div className="text-[11px] font-semibold text-[#18181b] leading-tight group-hover:text-black line-clamp-1">

                {item.name}

              </div>

              <div className="text-[10px] text-[#8e9196] font-mono mt-0.5">

                {item.stage}

              </div>

            </button>

          ))}



          {/* Add custom topic button */}

          <button

            type="button"

            onClick={() => {

              const name = prompt('输入你想攻坚的 408 自定义考点名称:')

              if (name) alert(`已成功将「${name}」添加至 408 色谱掌握度跟踪器`)

            }}

            className="group flex flex-col items-center justify-start focus:outline-none cursor-pointer text-center"

            title="添加自建 408 考点"

          >

            <div className="w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full border border-dashed border-zinc-300 group-hover:border-zinc-400 group-hover:bg-zinc-50 flex items-center justify-center text-zinc-500 text-lg transition-colors mb-2">

              +

            </div>

            <div className="text-[11px] font-medium text-zinc-500">自建考点</div>

          </button>

        </div>

      </div>



      {/* Math Violet Palette Card (Screen 4 Exact Replica) */}

      <div className="bg-white rounded-2xl border border-zinc-200/70 p-5 sm:p-6 shadow-xs">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-sm sm:text-base font-semibold text-[#18181b] flex items-center gap-2">

              <span>📐 考研数学 · 核心公式与定理掌握度色谱</span>

            </h2>

            <p className="text-xs text-zinc-400 mt-0.5">从公式初识 (Violet 50) 到压轴中值构造与证明秒杀 (Violet 950)</p>

          </div>

          <span className="subframe-pill text-[11px]">11 级阶度</span>

        </div>



        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-y-6 gap-x-3 justify-items-center">

          {MATH_SWATCHES.map((item, idx) => (

            <button

              key={idx}

              type="button"

              onClick={() => handleCopyTopic(item.name, item.hex)}

              className="group flex flex-col items-center focus:outline-none cursor-pointer text-center max-w-[84px]"

              title={`点击考查「${item.name}」：${item.desc}`}

            >

              <div

                className="w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full mb-2 transition-transform group-hover:scale-105 shadow-xs flex items-center justify-center text-[10px] font-mono"

                style={{ backgroundColor: item.hex }}

              />

              <div className="text-[11px] font-semibold text-[#18181b] leading-tight group-hover:text-black line-clamp-1">

                {item.name}

              </div>

              <div className="text-[10px] text-[#8e9196] font-mono mt-0.5">

                {item.stage}

              </div>

            </button>

          ))}



          {/* Add custom topic button */}

          <button

            type="button"

            onClick={() => {

              const name = prompt('输入你想攻坚的数学公式或定理名称:')

              if (name) alert(`已成功将「${name}」添加至考研数学色谱跟踪器`)

            }}

            className="group flex flex-col items-center justify-start focus:outline-none cursor-pointer text-center"

            title="添加自建数学考点"

          >

            <div className="w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full border border-dashed border-zinc-300 group-hover:border-zinc-400 group-hover:bg-zinc-50 flex items-center justify-center text-zinc-500 text-lg transition-colors mb-2">

              +

            </div>

            <div className="text-[11px] font-medium text-zinc-500">自建定理</div>

          </button>

        </div>

      </div>

    </div>

  )

}





// 格式化错题与题目文本（若选项与题干混在同一行，智能换行与规整排版，支持 A-D 与 (A)-(D)）
function formatQuestionContent(raw?: string): string {
  if (!raw) return ''
  let text = raw.trim()
  // 1. 若题干冒号后面紧随 A. 或 (A) 选项，插入双换行
  text = text.replace(/([：:])\s*([A-D][.、\s]|\([A-D]\))/g, '$1\n\n$2')
  // 2. 将混排在一行内的 A. B. C. D. 选项拆分为独立换行行
  text = text.replace(/([^\n])\s+([A-D][.、]|\([A-D]\))\s*/g, '$1\n\n$2 ')
  return text
}

export default function Study() {

  const { user } = useAuth()

  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  const initialTab = (searchParams.get('tab') as Tab) || 'handouts'

  const [tab, setTab] = useState<Tab>(

    ['topology', 'mastery', 'flashcards', 'handouts', 'pdfs', 'coursewares', 'errors', 'progress'].includes(initialTab)

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

    if (tabParam && ['graph', 'topology', 'mastery', 'flashcards', 'handouts', 'pdfs', 'coursewares', 'errors', 'progress'].includes(tabParam)) {

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

      <div className="bg-surface border border-neutral-200/80 rounded-xl p-3 sm:p-5 shadow-2xs shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">

        <div className="min-w-0">

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">

            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-accent-orange/15 text-warm-800 border border-accent-orange/20 whitespace-nowrap leading-tight">

              COREFORGE 研学中心

            </span>

            <span className="text-[10.5px] sm:text-xs text-warm-400 whitespace-nowrap leading-tight">

              408 统考 & 考研数学权威教研

            </span>

          </div>

          <h1 className="text-sm sm:text-lg md:text-xl font-bold text-warm-800 mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2 leading-snug">

            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-accent-orange shrink-0" />

            <span className="truncate">讲义 · 教材 · 交互课件工作台</span>

          </h1>

          <p className="text-xs text-warm-500 mt-1 max-w-2xl hidden sm:block">

            精选官方核心讲义、PDF 电子参考书与直观的 HTML 交互仿真课件，即学即练。

          </p>

        </div>



        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-auto justify-end">

          {/* 桌面端专属切换条：讲义列表 vs 全景图谱（移动端下方已有全量 TabBar，避免顶部挤压超出格子） */}

          <div className="hidden md:inline-flex items-center rounded-xl bg-neutral-100 p-1 border border-neutral-200/80 shadow-2xs">

            <button

              type="button"

              onClick={() => handleTabChange('handouts')}

              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${

                tab !== 'graph'

                  ? 'bg-white text-neutral-900 shadow-2xs'

                  : 'text-neutral-500 hover:text-neutral-900'

              }`}

            >

              <span>📖 讲义精读列表</span>

            </button>

            <button

              type="button"

              onClick={() => handleTabChange('graph')}

              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${

                tab === 'graph'

                  ? 'bg-neutral-900 text-white shadow-2xs'

                  : 'text-neutral-500 hover:text-neutral-900'

              }`}

            >

              <span>🕸️ 全景知识图谱</span>

            </button>

          </div>



          <button

            type="button"

            onClick={() => window.dispatchEvent(new CustomEvent('open-quick-note'))}

            className="subframe-btn-secondary h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-xs font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1 leading-none shrink-0"

            title="一键呼出考点批注，随时记下心得并归档进知识库"

          >

            <Edit3 className="w-3.5 h-3.5 text-neutral-600 shrink-0" />

            <span className="hidden xs:inline">考点批注</span>

            <span className="xs:hidden">批注</span>

          </button>

          <button

            type="button"

            onClick={() => setImportModalOpen(true)}

            className="subframe-btn-black h-7 sm:h-8 px-2 sm:px-3.5 text-[11px] sm:text-xs font-medium cursor-pointer whitespace-nowrap flex items-center gap-1 leading-none shrink-0"

          >

            <Plus className="w-3.5 h-3.5 shrink-0" />

            <span>导入资料</span>

          </button>

          <button

            type="button"

            onClick={loadMaterials}

            disabled={loadingBooks}

            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-neutral-200/90 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"

            title="刷新资料库"

          >

            <RefreshCw className={`w-3.5 h-3.5 ${loadingBooks ? 'animate-spin' : ''}`} />

          </button>

        </div>

      </div>



      {/* Subframe Navigation Tabs & Search Bar */}

      <div className="bento-card rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2 sm:gap-3 shrink-0">

        {/* Navigation tabs - Subframe Pill Design (自适应移动端标签，防止徽标撑破格子) */}

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 scroll-smooth shrink-0">

          {[

            { key: 'graph' as Tab, label: '🕸️ 全景知识图谱', shortLabel: '🕸️ 知识图谱', count: null },

            { key: 'handouts' as Tab, label: '📖 核心讲义', shortLabel: '📖 讲义', count: allHandouts.length },

            { key: 'topology' as Tab, label: '🔥 考点掌握度热力图', shortLabel: '🔥 掌握度', count: null },

            { key: 'mastery' as Tab, label: '🎨 考点色谱', shortLabel: '🎨 色谱', count: 22 },

            { key: 'flashcards' as Tab, label: '🎴 易忘闪卡', shortLabel: '🎴 闪卡', count: null },

            { key: 'pdfs' as Tab, label: '📑 PDF 教材与真题', shortLabel: '📑 教材真题', count: pdfBooks.length },

            { key: 'coursewares' as Tab, label: '🌐 仿真课件', shortLabel: '🌐 课件', count: INTERACTIVE_COURSEWARES.length },

            { key: 'errors' as Tab, label: '📝 每日错题', shortLabel: '📝 错题', count: null },

            { key: 'progress' as Tab, label: '📊 研学进度', shortLabel: '📊 进度', count: null },

          ].map(t => (

            <button

              key={t.key}

              onClick={() => handleTabChange(t.key)}

              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer active:scale-95 leading-normal ${

                tab === t.key

                  ? 'bg-neutral-900 text-white shadow-xs font-semibold'

                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'

              }`}

            >

              <span className="hidden sm:inline">{t.label}</span>

              <span className="sm:hidden">{t.shortLabel}</span>

              {t.count !== null && (

                <span className={`text-[9.5px] px-1.5 py-0.5 rounded-md font-mono leading-none inline-flex items-center justify-center shrink-0 ${

                  tab === t.key ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-500 border border-neutral-200/60'

                }`}>

                  {t.count}

                </span>

              )}

            </button>

          ))}

        </div>



        {/* Right Filter & Search */}

        <div className="flex items-center gap-1.5 sm:gap-2 w-full xl:w-auto pt-1 xl:pt-0 border-t xl:border-t-0 border-neutral-200/60">

          {/* Search box */}

          <div className="relative flex-1 xl:w-44">

            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />

            <input

              type="text"

              placeholder="搜索资料/考点..."

              value={searchQuery}

              onChange={e => setSearchQuery(e.target.value)}

              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-300 rounded-lg text-neutral-800 placeholder-neutral-400 outline-none transition-all"

            />

          </div>



          {/* Subject Selector */}

          <select

            value={subjectFilter}

            onChange={e => setSubjectFilter(e.target.value)}

            className="text-xs bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white border border-transparent focus:border-neutral-300 rounded-lg px-2.5 py-1.5 text-neutral-700 outline-none shrink-0 transition-all cursor-pointer"

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

            <div className="flex-1 w-full bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-xs relative min-h-[680px] h-[calc(100vh-240px)] flex flex-col animate-fade-in">

              <div className="px-4 py-2 bg-neutral-50/90 border-b border-neutral-200/80 flex items-center justify-between text-xs text-neutral-600 shrink-0">

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

                  <span className="font-semibold text-neutral-800">全景考研知识双链网络图谱 (D3 物理力导向拓扑)</span>

                  <span className="hidden sm:inline text-neutral-400">· 支持拖拽节点、缩放探索与点击打开关联讲义</span>

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

                    className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-medium transition-colors"

                  >

                    返回讲义精读 →

                  </button>

                </div>

              </div>

              <div className="flex-1 relative w-full h-full overflow-hidden">

                <Suspense fallback={

                  <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-500">

                    <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />

                    <span className="text-xs font-medium">正在装载考研知识双链拓扑...</span>

                  </div>

                }>

                  <KnowledgeGraph />

                </Suspense>

              </div>

            </div>

          )}



          {tab === 'topology' && <MasteryTopologyView />}



          {/* TAB 0.2: Subframe Screen 4 考点掌握度状态色谱 */}

          {tab === 'mastery' && <MasteryPaletteSection onSelectTopic={(topic) => { navigate(`/chat?prompt=${encodeURIComponent('请深度剖析考点：' + topic)}`) }} />}



          {/* TAB 0.5: 408 易忘考点记忆闪卡与极速背诵 */}

          {tab === 'flashcards' && <FlashcardsTab />}

        </Suspense>



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
                  const isPol = handout.domain === 'politics'
                  const isEng = handout.domain === 'english'
                  const isGen = handout.domain === 'general'

                  return (

                    <div

                      key={handout.id}

                      onClick={() => handleOpenHandout(handout)}

                      className="bg-surface border border-cream-200 hover:border-neutral-900 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between group"

                    >

                      <div>

                        {/* Top tags */}

                        <div className="flex items-center justify-between gap-2 mb-2.5">

                          <div className="flex items-center gap-1.5">

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${

                              isCs

                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'

                                : isPol
                                  ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                  : isEng
                                    ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                                    : isGen
                                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                      : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'

                            }`}>

                              {isCs ? '408 计算机' : isPol ? '考研政治' : isEng ? '考研英语' : isGen ? '专业课/综合' : '考研数学'} · {handout.subject}

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

          <div className="space-y-5">

            {/* 智能解析与知识库/题库归类总控条 */}

            <div className="bento-card rounded-xl border border-neutral-200/80 bg-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">

              <div className="flex items-center gap-3.5">

                <div className="p-2.5 rounded-lg bg-neutral-900 text-white shrink-0 shadow-xs">

                  <Database className="w-5 h-5" />

                </div>

                <div>

                  <div className="flex items-center gap-2">

                    <h3 className="text-sm sm:text-base font-bold text-neutral-900">

                      AI 讲义 & 题目自动解析归类引擎

                    </h3>

                    <span className="subframe-pill text-[10px]">

                      双轨深度整合

                    </span>

                  </div>

                  <p className="text-xs text-neutral-500 mt-1">

                    全自动研读 PDF 讲义：提取知识点精讲归入知识图谱，抽取真题与解析批量注入题库。

                  </p>

                </div>

              </div>



              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">

                <button

                  type="button"

                  onClick={handleBatchExtractAll}

                  disabled={batchExtracting || books.length === 0}

                  className="subframe-btn-black px-4 py-2 flex items-center gap-2 disabled:opacity-50 cursor-pointer text-xs font-medium"

                  title="全自动将当前所有教材与真题卷排队解析入库"

                >

                  {batchExtracting ? (

                    <>

                      <Loader2 className="w-3.5 h-3.5 animate-spin" />

                      <span>正在批量排队解析...</span>

                    </>

                  ) : (

                    <>

                      <Sparkles className="w-3.5 h-3.5" />

                      <span>⚡ 一键批量自动解析全部资料</span>

                    </>

                  )}

                </button>

                <a

                  href="/quiz"

                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-warm-700 bg-surface border border-cream-200 hover:border-amber-400 hover:text-amber-700 transition-colors flex items-center gap-1.5"

                >

                  <span>前往做题中心</span>

                  <ArrowRight className="w-3.5 h-3.5" />

                </a>

              </div>

            </div>



            {batchResultMsg && (

              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-800 flex items-center justify-between animate-fadeIn">

                <div className="flex items-center gap-2">

                  <CheckCircle2 className="w-4 h-4 text-green-600" />

                  <span>{batchResultMsg}</span>

                </div>

                <button

                  type="button"

                  onClick={() => setBatchResultMsg(null)}

                  className="text-warm-400 hover:text-warm-600 text-xs"

                >

                  关闭

                </button>

              </div>

            )}



            {filteredPdfs.length === 0 ? (

              <div className="text-center py-16 text-warm-400 space-y-3 bg-surface border border-neutral-200/80 rounded-xl">

                <FileText className="w-12 h-12 mx-auto opacity-30 text-rose-400" />

                <div className="text-sm font-medium">暂无匹配的 PDF 电子教材或真题卷</div>

                <p className="text-xs text-warm-400 max-w-sm mx-auto">

                  点击右上角「导入教材/PDF」上传你的 408 全书、真题试卷或李林数学讲义，即可在此内嵌原生沉浸阅读与自动解析！

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

                  const isExtracted = book.extractedInfo?.isExtracted

                  return (

                    <div

                      key={book.id}

                      onClick={() => setActivePdf(book)}

                      className={`bg-surface border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-md flex flex-col justify-between group ${

                        isExtracted

                          ? 'border-green-500/30 hover:border-green-500/60'

                          : 'border-cream-200 hover:border-cyan-400/50'

                      }`}

                    >

                      <div>

                        <div className="flex items-center justify-between gap-2 mb-2.5">

                          <div className="flex items-center gap-1.5 flex-wrap">

                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">

                              PDF 电子教材

                            </span>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${

                              book.scope === 'personal'

                                ? 'bg-indigo-500/10 text-indigo-700 border-indigo-500/25'

                                : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25'

                            }`}>

                              {book.scope === 'personal' ? '🔒 个人独享' : '🌐 全员共享'}

                            </span>

                          </div>

                          <span className="text-[11px] text-warm-400 shrink-0">

                            {sizeMb} MB

                          </span>

                        </div>



                        {/* 归类沉淀状态指示 */}

                        <div className="mb-3">

                          {isExtracted ? (

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-700 border border-green-500/20">

                              <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />

                              <span>已归类知识库 & 题库 (+{book.extractedInfo?.questionCount || 0}题)</span>

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 border border-amber-500/20">

                              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />

                              <span>待智能解析与归类</span>

                            </span>

                          )}

                        </div>



                        <div className="flex items-start gap-3">

                          <div className={`p-2.5 rounded-xl border shrink-0 group-hover:scale-105 transition-transform ${

                            isExtracted ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'

                          }`}>

                            <FileText className="w-6 h-6" />

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-1">

                              <h3 className="text-sm font-bold text-warm-800 group-hover:text-neutral-900 transition-colors leading-snug line-clamp-2">

                                {book.name}

                              </h3>

                              {book.canManage !== false && (

                                <button

                                  type="button"

                                  onClick={e => handleOpenRename(book, e)}

                                  className="p-1 rounded-md text-warm-400 hover:text-amber-600 hover:bg-amber-50 transition-all opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"

                                  title="修改教材名称"

                                >

                                  <Edit3 className="w-3.5 h-3.5" />

                                </button>

                              )}

                            </div>

                            <div className="text-[11px] text-warm-400 mt-1">

                              {isCs
                                ? '408 计算机'
                                : book.domain === 'english'
                                  ? '考研英语'
                                  : book.domain === 'politics'
                                    ? '考研政治'
                                    : book.domain === 'general'
                                      ? '专业课/综合'
                                      : '考研数学'} · {book.category}

                            </div>

                          </div>

                        </div>

                      </div>



                      <div className="mt-5 pt-3 border-t border-cream-200/60 flex items-center justify-between text-xs">

                        <span className="text-[11px] text-warm-400">

                          {new Date(book.lastModified).toLocaleDateString('zh-CN')}

                        </span>

                        <div className="flex items-center gap-1.5">

                          {/* 核心新增：一键智能解析归类按钮 */}

                          <button

                            type="button"

                            onClick={e => {

                              e.stopPropagation()

                              setExtractingBook(book)

                            }}

                            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer ${

                              isExtracted

                                ? 'bg-cream-100 hover:bg-cyan-50 text-warm-700 hover:text-cyan-700 border border-cream-300'

                                : 'subframe-btn-black'

                            }`}

                            title="AI 智能解析知识点归入知识库，抽取题目存入题库"

                          >

                            <Sparkles className="w-3.5 h-3.5" />

                            <span>{isExtracted ? '重新解析' : '智能解析入库'}</span>

                          </button>



                          {book.canManage !== false && (

                            <>

                              <button

                                type="button"

                                onClick={e => handleOpenRename(book, e)}

                                className="p-1.5 rounded-lg text-warm-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"

                                title="修改/重命名教材名称"

                              >

                                <Edit3 className="w-3.5 h-3.5" />

                              </button>

                              <button

                                type="button"

                                onClick={e => handleDeleteBook(book, e)}

                                className="p-1.5 rounded-lg text-warm-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"

                                title="删除该教材文件"

                              >

                                <Trash2 className="w-3.5 h-3.5" />

                              </button>

                            </>

                          )}

                          <a

                            href={api.getBookRawUrl(book.relativePath, book.scope)}

                            target="_blank"

                            rel="noreferrer"

                            onClick={e => e.stopPropagation()}

                            download={book.name}

                            className="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-cream-200 transition-colors"

                            title="下载至本地"

                          >

                            <Download className="w-3.5 h-3.5" />

                          </a>

                          <a

                            href={`/pdf-reader?path=${encodeURIComponent(book.relativePath)}&scope=${encodeURIComponent(book.scope || 'shared')}&name=${encodeURIComponent(book.name)}`}

                            target="_blank"

                            rel="noreferrer"

                            onClick={e => e.stopPropagation()}

                            className="p-1.5 rounded-lg text-warm-400 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"

                            title="新标签页独立全屏阅读 (纯 Web 渲染，绝无白屏)"

                          >

                            <ExternalLink className="w-3.5 h-3.5 text-cyan-600" />

                          </a>

                          <span className="font-semibold text-red-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ml-1">

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">

              {filteredCoursewares.map(item => {

                const isCs = item.domain === 'cs_408'

                const isPol = item.domain === 'politics'

                const emojiMatch = item.title.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u)

                const iconEmoji = emojiMatch ? emojiMatch[0] : isPol ? '🏛️' : isCs ? '💻' : '📐'

                const cleanTitle = emojiMatch ? item.title.slice(emojiMatch[0].length).trim() : item.title



                return (

                  <div

                    key={item.id}

                    onClick={() => {

                      setActiveCourseware(item)

                      const newParams = new URLSearchParams(searchParams)

                      newParams.set('tab', 'coursewares')

                      newParams.set('cw', item.id)

                      setSearchParams(newParams, { replace: true })

                    }}

                    className="bento-card rounded-xl border border-neutral-200/80 bg-white p-5 cursor-pointer transition-all duration-200 hover:border-neutral-900 hover:shadow-xs active:scale-[0.99] flex flex-col justify-between group"

                  >



                    <div>

                      <div className="flex items-center justify-between gap-2 mb-3">

                        <span

                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${

                            isPol

                              ? 'bg-rose-500/10 text-rose-700 border-rose-500/25'

                              : isCs

                              ? 'bg-cyan-500/10 text-cyan-700 border-cyan-500/25'

                              : 'bg-purple-500/10 text-purple-700 border-purple-500/25'

                          }`}

                        >

                          {isPol ? '考研政治' : isCs ? '408 计算机' : '考研数学'} · {item.subject}

                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">

                          {item.difficulty}

                        </span>

                      </div>



                      <div className="flex items-start gap-3">

                        <div

                          className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform text-neutral-800" 

                        >

                          {iconEmoji}

                        </div>

                        <div className="min-w-0 flex-1">

                          <h3 className="text-sm font-bold text-warm-900 group-hover:text-neutral-900 transition-colors leading-snug">

                            {cleanTitle}

                          </h3>

                          <p className="text-xs text-warm-500 mt-1.5 line-clamp-2 leading-relaxed">

                            {item.summary}

                          </p>

                        </div>

                      </div>



                      {/* 核心收获预览 */}

                      <div className="mt-3.5 p-2.5 rounded-xl bg-cream-100/75 border border-cream-200/80 space-y-1.5">

                        {item.learningPoints.slice(0, 2).map((pt, i) => (

                          <div key={i} className="text-[11px] text-warm-600 flex items-center gap-1.5">

                            <span

                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${

                                isCs ? 'bg-cyan-500' : 'bg-orange-500'

                              }`}

                            />

                            <span className="truncate">{pt}</span>

                          </div>

                        ))}

                      </div>

                    </div>



                    <div className="mt-4 pt-3 border-t border-cream-200/70 flex items-center justify-between gap-2 text-xs">

                      <div className="flex items-center gap-1 min-w-0 overflow-hidden">

                        {item.tags.slice(0, 3).map((tag, idx) => (

                          <span

                            key={idx}

                            className="text-[10px] text-warm-500 bg-cream-200/60 px-1.5 py-0.5 rounded truncate"

                          >

                            #{tag}

                          </span>

                        ))}

                      </div>



                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-600 text-cyan-700 group-hover:text-white font-bold text-[11px] flex items-center gap-1 shrink-0 transition-all">

                        进入仿真 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />

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

            className="bg-white rounded-2xl border border-cream-300 shadow-2xl w-full max-w-md max-h-[88dvh] overflow-y-auto overscroll-contain p-5 sm:p-6 animate-scale-up"

            style={{ WebkitOverflowScrolling: 'touch' }}

          >

            <div className="flex items-center justify-between border-b border-cream-200 pb-3 mb-4">

              <div className="flex items-center gap-2.5">

                <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-200">

                  <Edit3 className="w-4 h-4" />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-warm-800">修改教材 / 资料名称</h3>

                  <p className="text-[11px] text-warm-400">重命名后将同步更新磁盘文件名与知识库关联</p>

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

                      className="text-[11px] text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"

                      title="快速去除随机长哈希与时间戳后缀"

                    >

                      🧹 一键去杂乱后缀

                    </button>

                    <button

                      type="button"

                      onClick={handleSuggestName}

                      disabled={isSuggestingName}

                      className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"

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

                <p className="text-[10px] text-warm-400 mt-1">

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



// ─── Daily Error Tab ──────────────────────────────────────────────────────────



function DailyErrorTab() {
  const navigate = useNavigate()
  const [data, setData] = useState<DailyReviewData | null>(null)

  const [loading, setLoading] = useState(true)

  const [currentIdx, setCurrentIdx] = useState(0)

  const [showAnswer, setShowAnswer] = useState(false)

  const [reviewing, setReviewing] = useState(false)

  const [tutorOpen, setTutorOpen] = useState(false)



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

      <div className="bg-surface border border-neutral-200/80 rounded-xl text-center py-16 space-y-4 max-w-xl mx-auto">

        <Check className="w-12 h-12 mx-auto text-accent-sage/40" />

        <div className="text-base font-bold text-warm-800">太棒了！今日没有待复习的错题</div>

        <div className="text-xs text-warm-400">

          错题库共收录 {data?.stats.totalQuestions || 0} 道考研错题，已彻底掌握 {data?.stats.masteredCount || 0} 道

        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            onClick={() => navigate('/quiz?tab=errors')}
            className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
          >
            📕 打开新版错题攻克中心
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-cream-200 text-xs font-semibold text-warm-600 hover:bg-cream-300 transition-colors cursor-pointer"
          >
            刷新检查
          </button>
        </div>

      </div>

    )

  }



  const currentQ = data.dueQuestions[currentIdx]

  const stats = data.stats



  return (

    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs">
        <span className="text-rose-800 font-medium">
          💡 想要按科目/错因检索、组卷重练、现场做题验证或打印刷题纸？
        </span>
        <button
          type="button"
          onClick={() => navigate('/quiz?tab=errors')}
          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer shrink-0"
        >
          📕 进入新版错题攻克中心 →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">

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



      <div className="bg-surface border border-neutral-200/80 rounded-xl overflow-hidden shadow-xs">

        <div className="p-6 space-y-4">

          <div className="flex flex-wrap items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-500" />
            <span className="text-xs text-warm-500 font-semibold">
              错题复盘 {currentIdx + 1} / {data.dueQuestions.length}
            </span>
            {(currentQ as any).subject && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                {(currentQ as any).subject}
              </span>
            )}
            {(currentQ as any).errorType && (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200/70 text-[10px] font-semibold">
                {(currentQ as any).errorType}
              </span>
            )}
            {currentQ.source && (
              <span className="ml-auto text-[10px] text-warm-400 truncate max-w-[200px]">
                来源: {currentQ.source}
              </span>
            )}
          </div>

          <div className="text-sm sm:text-base text-warm-800 font-medium leading-relaxed">
            <MarkdownRenderer content={formatQuestionContent(currentQ.question)} />
          </div>

          {(currentQ as any).options && Object.keys((currentQ as any).options).length > 0 && (
            <div className="space-y-1.5 pt-1">
              {Object.entries((currentQ as any).options as Record<string, string>).map(([optKey, optVal]) => {
                const isWrongPick = currentQ.userAnswer?.trim().toUpperCase() === optKey.toUpperCase()
                const isRightAns = showAnswer && currentQ.correctAnswer?.trim().toUpperCase() === optKey.toUpperCase()
                return (
                  <div
                    key={optKey}
                    className={`flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${
                      isRightAns
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : isWrongPick
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : 'bg-neutral-50/70 border-neutral-200/70 text-warm-700'
                    }`}
                  >
                    <span className="font-bold shrink-0">{optKey}.</span>
                    <div className="flex-1 min-w-0">
                      <MarkdownRenderer content={String(optVal)} inline />
                    </div>
                    {isWrongPick && (
                      <span className="text-[10px] text-rose-600 font-semibold shrink-0">当时误选</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {currentQ.userAnswer && (
            <div className="px-3 py-2 bg-rose-500/5 border border-rose-500/15 rounded-lg">
              <span className="text-[10px] text-rose-500 font-semibold block mb-1">当时错误作答 / 选项：</span>
              <div className="text-xs text-rose-700">
                <MarkdownRenderer content={currentQ.userAnswer} inline />
              </div>
            </div>
          )}

          {(currentQ as any).notes && (
            <div className="px-3 py-2 bg-amber-50/80 border border-amber-200/80 rounded-lg">
              <span className="text-[10px] text-amber-700 font-semibold block mb-1">错因反思原文：</span>
              <div className="text-xs text-amber-900 leading-relaxed whitespace-pre-wrap">
                {(currentQ as any).notes}
              </div>
            </div>
          )}

        </div>



        {showAnswer ? (

          <div className="border-t border-cream-200 bg-cream-100/50 p-6 space-y-3">

            <div className="flex items-center gap-2">

              <Check className="w-4 h-4 text-accent-sage" />

              <span className="text-xs text-accent-sage font-bold">正确答案与推导</span>

            </div>

            <div className="text-sm text-warm-800 leading-relaxed font-semibold">

              <MarkdownRenderer content={currentQ.correctAnswer} inline />

            </div>

            {currentQ.explanation && (

              <div className="mt-2 px-3.5 py-2.5 bg-cream-200/60 rounded-xl">

                <span className="text-[10px] text-warm-400 block mb-1">名师解析与考点归因：</span>

                <div className="text-xs text-warm-700 leading-relaxed">

                  <MarkdownRenderer content={currentQ.explanation} />

                </div>

              </div>

            )}

          </div>

        ) : (

          <div className="border-t border-cream-200 p-4 flex items-center justify-center gap-4 bg-cream-50/50">

            <button

              onClick={() => setTutorOpen(true)}

              className="px-4 py-2 rounded-xl bg-accent-orange/10 hover:bg-accent-orange/20 text-accent-orange text-xs font-bold flex items-center gap-1.5 transition-colors"

            >

              <Sparkles className="w-3.5 h-3.5" />

              💡 AI 启发式分步辅导 (切入点/挑刺)

            </button>

            <button

              onClick={() => setShowAnswer(true)}

              className="px-4 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-warm-700 text-xs font-semibold transition-colors"

            >

              点击查看正确答案与解析

            </button>

          </div>

        )}

      </div>



      <StepTutorModal

        isOpen={tutorOpen}

        onClose={() => setTutorOpen(false)}

        initialQuestion={currentQ.question}

        initialOptions=""

      />



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

