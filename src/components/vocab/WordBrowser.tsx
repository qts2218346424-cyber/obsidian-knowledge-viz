import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, Filter, ChevronLeft, ChevronRight, Plus, Check,
  TrendingUp, BookOpen, Circle, Volume2, Loader2,
  ChevronDown, ChevronUp, Star,
} from 'lucide-react'
import { api, type VocabBrowseData, type VocabBrowseItem } from '../../services/api'
import WarmButton from '../ui/WarmButton'

// ===== Helpers =====

type SortKey = 'alpha' | 'frequency' | 'unit' | 'reviews'
const sortLabels: Record<SortKey, string> = {
  alpha: '字母', frequency: '词频', unit: 'Unit', reviews: '复习次数',
}

const freqColor: Record<string, string> = {
  '高频': 'bg-accent-orange/10 text-accent-orange',
  '中频': 'bg-accent-amber/10 text-accent-amber',
  '低频': 'bg-accent-sage/10 text-accent-sage',
}

function StatusIcon({ item }: { item: VocabBrowseItem }) {
  const p = item.progress
  if (!p) return <Circle size={14} className="text-warm-300" />
  if (p.reviews >= 5) return <Check size={14} className="text-accent-sage" />
  if (p.reviews > 0) return <TrendingUp size={14} className="text-accent-amber" />
  return <BookOpen size={14} className="text-accent-orange" />
}

function statusLabel(item: VocabBrowseItem) {
  const p = item.progress
  if (!p) return '未添加'
  if (p.reviews >= 5) return '已掌握'
  if (p.reviews > 0) return '学习中'
  return '新词'
}

// ===== Component =====

export default function WordBrowser() {
  // State
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [unit, setUnit] = useState(0)
  const [frequency, setFrequency] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<SortKey>('alpha')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<VocabBrowseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [addingBatch, setAddingBatch] = useState(false)
  const [addedWords, setAddedWords] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const size = 50

  // Debounce search
  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [debounced, unit, frequency, status, sort])

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.getAllVocab({
        page, size,
        ...(unit && { unit }),
        ...(frequency && { frequency }),
        ...(status && { status }),
        ...(debounced && { search: debounced }),
      })
      setData(result)
    } catch (e: any) {
      setError(e.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }, [page, debounced, unit, frequency, status])

  useEffect(() => { fetchData() }, [fetchData])

  // Add single word
  const addWord = async (item: VocabBrowseItem) => {
    try {
      await api.addVocabulary([{ word: item.word, definition: item.definition, phonetic: item.phonetic, example: item.example }])
      setAddedWords(prev => new Set(prev).add(item.word))
      fetchData()
    } catch { /* silent */ }
  }

  // Batch add current page
  const batchAdd = async () => {
    if (!data?.words.length) return
    setAddingBatch(true)
    try {
      const items = data.words.map(w => ({
        word: w.word, definition: w.definition, phonetic: w.phonetic, example: w.example,
      }))
      await api.addVocabulary(items)
      setAddedWords(prev => {
        const next = new Set(prev)
        data.words.forEach(w => next.add(w.word))
        return next
      })
      fetchData()
    } catch { /* silent */ }
    finally { setAddingBatch(false) }
  }

  const totalPages = data ? Math.ceil(data.total / size) : 0
  const stats = data?.stats

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      {stats && (
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-surface border border-cream-200 text-warm-600">
            共 <b className="text-warm-800">{stats.total}</b> 词
          </span>
          <span className="px-3 py-1.5 rounded-full bg-accent-sage/10 text-accent-sage">
            已掌握 <b>{stats.mastered}</b>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-accent-amber/10 text-accent-amber">
            学习中 <b>{stats.learning}</b>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-accent-orange/10 text-accent-orange">
            新词 <b>{stats.newWords}</b>
          </span>
          <span className="px-3 py-1.5 rounded-full bg-warm-100 text-warm-400">
            未添加 <b>{stats.notAdded}</b>
          </span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索单词或释义..."
          className="w-full pl-9 pr-4 py-2.5 bg-surface border border-cream-200 rounded-lg text-sm text-warm-700 placeholder-warm-400 outline-none focus:border-accent-orange transition-colors"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-warm-400" />

        <select value={unit} onChange={e => setUnit(Number(e.target.value))}
          className="px-2 py-1.5 bg-surface border border-cream-200 rounded-lg text-xs text-warm-700 outline-none focus:border-accent-orange">
          <option value={0}>全部 Unit</option>
          {Array.from({ length: 40 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Unit {i + 1}</option>
          ))}
        </select>

        <select value={frequency} onChange={e => setFrequency(e.target.value)}
          className="px-2 py-1.5 bg-surface border border-cream-200 rounded-lg text-xs text-warm-700 outline-none focus:border-accent-orange">
          <option value="">全部词频</option>
          <option value="高频">高频</option>
          <option value="中频">中频</option>
          <option value="低频">低频</option>
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-2 py-1.5 bg-surface border border-cream-200 rounded-lg text-xs text-warm-700 outline-none focus:border-accent-orange">
          <option value="">全部状态</option>
          <option value="mastered">已掌握</option>
          <option value="learning">学习中</option>
          <option value="new">新词</option>
          <option value="notAdded">未添加</option>
        </select>

        <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
          className="px-2 py-1.5 bg-surface border border-cream-200 rounded-lg text-xs text-warm-700 outline-none focus:border-accent-orange">
          {Object.entries(sortLabels).map(([k, v]) => (
            <option key={k} value={k}>排序: {v}</option>
          ))}
        </select>

        <div className="ml-auto">
          <WarmButton variant="secondary" size="sm" onClick={batchAdd} disabled={addingBatch || !data?.words.length}>
            {addingBatch ? <Loader2 size={14} className="animate-spin inline mr-1" /> : <Plus size={14} className="inline mr-1" />}
            添加本页到学习列表
          </WarmButton>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Word List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-warm-400" />
          </div>
        ) : data?.words.length === 0 ? (
          <div className="text-center py-12 text-warm-400 text-sm">没有找到匹配的单词</div>
        ) : (
          data?.words.map(item => {
            const isExpanded = expanded === item.word
            const isAdded = addedWords.has(item.word) || item.progress !== null
            return (
              <div key={item.word} className="bg-surface border border-cream-200 rounded-xl transition-all">
                {/* Row Header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-cream-50 rounded-xl transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : item.word)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-warm-800 text-sm">{item.word}</span>
                      {item.phonetic && (
                        <span className="text-xs text-warm-400">{item.phonetic}</span>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); /* could play audio */ }}
                        className="text-warm-300 hover:text-accent-orange transition-colors"
                      >
                        <Volume2 size={13} />
                      </button>
                      {freqColor[item.frequency] && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${freqColor[item.frequency]}`}>
                          {item.frequency}
                        </span>
                      )}
                      <StatusIcon item={item} />
                      <span className="text-[10px] text-warm-400">U{item.unit}</span>
                    </div>
                    <p className="text-xs text-warm-500 mt-0.5 truncate">{item.definition}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!isAdded && (
                      <button
                        onClick={e => { e.stopPropagation(); addWord(item) }}
                        className="p-1.5 rounded-lg hover:bg-accent-orange/10 text-warm-400 hover:text-accent-orange transition-colors"
                        title="添加到学习列表"
                      >
                        <Plus size={15} />
                      </button>
                    )}
                    {isAdded && (
                      <Check size={15} className="text-accent-sage" />
                    )}
                    {isExpanded
                      ? <ChevronUp size={16} className="text-warm-400" />
                      : <ChevronDown size={16} className="text-warm-400" />
                    }
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-cream-100 space-y-2">
                    <p className="text-sm text-warm-700 leading-relaxed">{item.definition}</p>
                    {item.example && (
                      <div className="bg-cream-50 rounded-lg p-3 space-y-1">
                        <p className="text-xs text-warm-700 italic">{item.example}</p>
                        {item.exampleCn && (
                          <p className="text-xs text-warm-500">{item.exampleCn}</p>
                        )}
                      </div>
                    )}
                    {item.roots && (
                      <div className="flex items-start gap-2 text-xs">
                        <Star size={13} className="text-accent-amber mt-0.5 shrink-0" />
                        <div>
                          <span className="text-warm-500">词根: </span>
                          <span className="text-warm-700">{item.roots}</span>
                        </div>
                      </div>
                    )}
                    {item.synonyms && (
                      <div className="flex items-start gap-2 text-xs">
                        <BookOpen size={13} className="text-accent-sage mt-0.5 shrink-0" />
                        <div>
                          <span className="text-warm-500">近义词: </span>
                          <span className="text-warm-700">{item.synonyms}</span>
                        </div>
                      </div>
                    )}
                    {item.progress && (
                      <div className="flex gap-4 text-[11px] text-warm-400 pt-1">
                        <span>状态: {statusLabel(item)}</span>
                        <span>复习: {item.progress.reviews} 次</span>
                        {item.progress.nextReview && <span>下次复习: {item.progress.nextReview}</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <WarmButton
            variant="ghost" size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={16} /> 上一页
          </WarmButton>
          <span className="text-xs text-warm-500 min-w-[80px] text-center">
            第 {page} / {totalPages} 页
          </span>
          <WarmButton
            variant="ghost" size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            下一页 <ChevronRight size={16} />
          </WarmButton>
        </div>
      )}

      {/* Total hint */}
      {data && (
        <p className="text-center text-[11px] text-warm-300">
          显示第 {(page - 1) * size + 1}-{Math.min(page * size, data.total)} 条，共 {data.total} 条
        </p>
      )}
    </div>
  )
}
