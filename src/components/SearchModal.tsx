import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search, X, FileText, Loader2 } from 'lucide-react'
import { api, type FileListItem } from '../services/api'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FileListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }, [isOpen])

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const files = await api.getFiles(q.trim())
      setResults(files.slice(0, 20))
      setSelected(0)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 220)
  }

  const handleOpen = (path: string) => {
    navigate(`/editor?path=${encodeURIComponent(path)}`)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selected]) {
      e.preventDefault()
      handleOpen(results[selected].path)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    const el = document.getElementById(`search-result-${selected}`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-[12dvh] px-3 sm:px-4 modal-backdrop-contain"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索知识库笔记（标题、考点、标签）..."
            className="flex-1 bg-transparent text-base sm:text-sm text-slate-800 placeholder-slate-400 outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />}
          <button
            onClick={onClose}
            className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 shrink-0 cursor-pointer"
            aria-label="关闭搜索"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[62dvh] sm:max-h-88 overflow-y-auto modal-scroll-contain">
          {results.length === 0 && query.trim() && !loading && (
            <div className="px-4 py-8 text-center text-xs text-slate-500 space-y-3">
              <p className="font-semibold text-slate-700">未在个人笔记中找到匹配「{query}」的篇章</p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-[11px] text-slate-600 inline-block text-left max-w-sm">
                <span className="font-bold text-slate-800">🔍 检索范围提示：</span>
                <p className="mt-1 text-slate-500 leading-relaxed">此处检索您当前绑定的个人 Obsidian 笔记库（不覆盖公共讲义与 408/数学真题库）。</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { navigate('/study'); onClose() }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold cursor-pointer transition-colors"
                  >
                    前往【讲义中心】查阅 →
                  </button>
                  <button
                    type="button"
                    onClick={() => { navigate('/quiz'); onClose() }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold cursor-pointer transition-colors"
                  >
                    前往【做题中心】搜索 →
                  </button>
                </div>
              </div>
            </div>
          )}
          {results.length === 0 && !query.trim() && (
            <div className="px-4 py-10 text-center space-y-2">
              <div className="text-xs font-medium text-slate-500">输入关键词快速直达任意笔记</div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {['数据结构', '操作系统', '计算机网络', '泰勒公式', '特征值'].map(kw => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleInput(kw)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
          {results.map((file, i) => (
            <button
              key={file.path}
              id={`search-result-${i}`}
              onClick={() => handleOpen(file.path)}
              onMouseEnter={() => setSelected(i)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-slate-50 last:border-b-0 cursor-pointer ${
                selected === i ? 'bg-indigo-50/70 border-l-3 border-l-indigo-600' : 'border-l-3 border-l-transparent hover:bg-slate-50'
              }`}
            >
              <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${selected === i ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold truncate ${selected === i ? 'text-slate-900' : 'text-slate-700'}`}>
                    {highlightMatch(file.title, query)}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">{file.wordCount} 字</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{file.path}</div>
                {file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {file.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">#{tag}</span>
                    ))}
                  </div>
                )}
                {file.snippet && (
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {highlightMatch(file.snippet, query)}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 flex items-center gap-4 text-[11px] text-slate-400">
            <span className="hidden sm:inline">↑↓ 选择</span>
            <span className="hidden sm:inline">回车打开</span>
            <span>点击条目直达笔记</span>
            <span className="ml-auto font-medium text-slate-500">共 {results.length} 条结果</span>
          </div>
        )}
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  let result: React.ReactNode = text

  for (const term of terms) {
    const lower = text.toLowerCase()
    const idx = lower.indexOf(term)
    if (idx >= 0) {
      result = (
        <>
          {text.substring(0, idx)}
          <span className="text-indigo-600 font-bold bg-indigo-50 px-0.5 rounded">{text.substring(idx, idx + term.length)}</span>
          {text.substring(idx + term.length)}
        </>
      )
      break
    }
  }
  return result
}
