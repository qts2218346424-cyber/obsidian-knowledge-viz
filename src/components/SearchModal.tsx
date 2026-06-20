import { useState, useEffect, useRef, useCallback } from 'react'
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

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setResults([])
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const files = await api.getFiles(q.trim())
      setResults(files.slice(0, 15))
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
    debounceRef.current = setTimeout(() => doSearch(value), 250)
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

  // Scroll selected into view
  useEffect(() => {
    const el = document.getElementById(`search-result-${selected}`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索笔记... (标题、标签、内容)"
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
          />
          {loading && <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin" />}
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-auto">
          {results.length === 0 && query.trim() && !loading && (
            <div className="px-4 py-8 text-center text-xs text-slate-500">
              未找到匹配 "{query}" 的笔记
            </div>
          )}
          {results.length === 0 && !query.trim() && (
            <div className="px-4 py-8 text-center text-xs text-slate-500">
              输入关键词搜索你的知识库
            </div>
          )}
          {results.map((file, i) => (
            <button
              key={file.path}
              id={`search-result-${i}`}
              onClick={() => handleOpen(file.path)}
              onMouseEnter={() => setSelected(i)}
              className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                selected === i ? 'bg-violet-500/15 border-l-2 border-violet-500' : 'border-l-2 border-transparent hover:bg-slate-800/50'
              }`}
            >
              <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${selected === i ? 'text-violet-400' : 'text-slate-600'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate ${selected === i ? 'text-slate-100' : 'text-slate-300'}`}>
                    {highlightMatch(file.title, query)}
                  </span>
                  <span className="text-[10px] text-slate-600 shrink-0">{file.wordCount}w</span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{file.path}</div>
                {file.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {file.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-500">#{tag}</span>
                    ))}
                  </div>
                )}
                {file.snippet && (
                  <div className="text-[10px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {highlightMatch(file.snippet, query)}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-800 flex items-center gap-4 text-[10px] text-slate-600">
            <span>↑↓ 导航</span>
            <span>Enter 打开</span>
            <span>Esc 关闭</span>
            <span className="ml-auto">{results.length} results</span>
          </div>
        )}
      </div>
    </div>
  )
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
          <span className="text-violet-400 font-semibold">{text.substring(idx, idx + term.length)}</span>
          {text.substring(idx + term.length)}
        </>
      )
      break
    }
  }
  return result
}
