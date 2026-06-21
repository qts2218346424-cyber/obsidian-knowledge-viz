import { useState, useEffect, useRef } from 'react'
import {
  Search, Tag, Edit2, Trash2, GitMerge, Loader2, Check,
  ChevronDown, ChevronRight, AlertTriangle,
} from 'lucide-react'
import { api } from '../../services/api'

interface TagInfo {
  name: string
  count: number
  files: string[]
}

export default function TagManager() {
  const [tags, setTags] = useState<TagInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [results, setResults] = useState<Record<string, string>>({})
  const renameInputs = useRef<Record<string, string>>({})
  const mergeInputs = useRef<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const loadTags = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.getVaultTags()
      setTags(res.tags)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTags() }, [])

  const toggleExpand = (name: string) => {
    setExpanded(prev => prev === name ? null : name)
    setResults({})
    setConfirmDelete(null)
  }

  const handleRename = async (oldTag: string) => {
    const newTag = (renameInputs.current[oldTag] || '').trim()
    if (!newTag || newTag === oldTag) return
    setResults(prev => ({ ...prev, [oldTag]: 'renaming' }))
    try {
      const res = await api.renameTag(oldTag, newTag)
      setResults(prev => ({ ...prev, [oldTag]: `重命名成功: ${res.filesUpdated} 个文件已更新` }))
      await loadTags()
    } catch (err: any) {
      setResults(prev => ({ ...prev, [oldTag]: `失败: ${err.message}` }))
    }
  }

  const handleMerge = async (keepTag: string) => {
    const mergeTag = (mergeInputs.current[keepTag] || '').trim()
    if (!mergeTag || mergeTag === keepTag) return
    setResults(prev => ({ ...prev, [keepTag]: 'merging' }))
    try {
      const res = await api.mergeTags(keepTag, mergeTag)
      setResults(prev => ({ ...prev, [keepTag]: `合并成功: ${res.filesUpdated} 个文件已更新` }))
      setExpanded(null)
      await loadTags()
    } catch (err: any) {
      setResults(prev => ({ ...prev, [keepTag]: `失败: ${err.message}` }))
    }
  }

  const handleDelete = async (tag: string) => {
    if (confirmDelete !== tag) {
      setConfirmDelete(tag)
      return
    }
    setResults(prev => ({ ...prev, [tag]: 'deleting' }))
    try {
      const res = await api.deleteTag(tag)
      setResults(prev => ({ ...prev, [tag]: `删除成功: ${res.filesUpdated} 个文件已更新` }))
      setExpanded(null)
      await loadTags()
    } catch (err: any) {
      setResults(prev => ({ ...prev, [tag]: `失败: ${err.message}` }))
    }
    setConfirmDelete(null)
  }

  return (
    <div className="bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-cream-200 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="text-sm font-semibold text-warm-700">标签管理</div>
          <div className="text-[11px] text-warm-400 mt-0.5">搜索、重命名、合并、删除标签</div>
        </div>
        <span className="text-[11px] text-warm-400">{tags.length} 个标签</span>
      </div>

      {/* Search */}
      <div className="px-5 py-3 border-b border-cream-200 bg-surface/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索标签..."
            className="w-full bg-cream-200 border border-cream-300 rounded-lg pl-9 pr-3 py-2 text-xs text-warm-700 outline-none focus:border-accent-orange"
          />
        </div>
      </div>

      {/* Tag list */}
      <div className="flex-1 overflow-auto p-3 space-y-1">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-warm-400" />
          </div>
        )}

        {!loading && filteredTags.length === 0 && (
          <div className="text-center py-8 text-xs text-warm-400">
            {tags.length === 0 ? '暂无标签' : '没有匹配的标签'}
          </div>
        )}

        {filteredTags.map(tag => (
          <div key={tag.name} className="bg-cream-100/50 border border-cream-200 rounded-lg overflow-hidden">
            {/* Tag row */}
            <button
              onClick={() => toggleExpand(tag.name)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-cream-200/50 transition-colors text-left"
            >
              {expanded === tag.name
                ? <ChevronDown className="w-3 h-3 text-warm-400 shrink-0" />
                : <ChevronRight className="w-3 h-3 text-warm-400 shrink-0" />
              }
              <Tag className="w-3 h-3 text-accent-orange shrink-0" />
              <span className="text-xs text-warm-700 font-medium flex-1">#{tag.name}</span>
              <span className="text-[10px] bg-cream-200 text-warm-500 px-1.5 py-0.5 rounded-full shrink-0">
                {tag.count}
              </span>
            </button>

            {/* Expanded operations */}
            {expanded === tag.name && (
              <div className="px-3 pb-3 pt-1 border-t border-cream-200 space-y-2.5">
                {/* Affected files */}
                <div>
                  <div className="text-[10px] text-warm-400 mb-1">使用该标签的文件:</div>
                  <div className="max-h-24 overflow-auto space-y-0.5">
                    {tag.files.map(f => (
                      <div key={f} className="text-[10px] text-warm-500 pl-2 border-l border-cream-300">
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rename */}
                <div>
                  <div className="text-[10px] text-warm-400 mb-1 flex items-center gap-1">
                    <Edit2 className="w-2.5 h-2.5" /> 重命名
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      defaultValue={tag.name}
                      onChange={e => { renameInputs.current[tag.name] = e.target.value }}
                      className="flex-1 bg-cream-200 border border-cream-300 rounded px-2 py-1 text-[11px] text-warm-700 outline-none focus:border-accent-orange"
                      placeholder="新标签名"
                    />
                    <button
                      onClick={() => handleRename(tag.name)}
                      className="px-2.5 py-1 rounded text-[10px] bg-accent-orange text-white hover:bg-accent-orange/90 transition-colors"
                    >
                      重命名
                    </button>
                  </div>
                </div>

                {/* Merge */}
                <div>
                  <div className="text-[10px] text-warm-400 mb-1 flex items-center gap-1">
                    <GitMerge className="w-2.5 h-2.5" /> 合并到
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      onChange={e => { mergeInputs.current[tag.name] = e.target.value }}
                      className="flex-1 bg-cream-200 border border-cream-300 rounded px-2 py-1 text-[11px] text-warm-700 outline-none focus:border-accent-orange"
                      placeholder="目标标签名"
                    />
                    <button
                      onClick={() => handleMerge(tag.name)}
                      className="px-2.5 py-1 rounded text-[10px] bg-accent-sage/80 text-white hover:bg-accent-sage transition-colors"
                    >
                      合并
                    </button>
                  </div>
                </div>

                {/* Delete */}
                <div className="pt-1.5 border-t border-cream-200">
                  <button
                    onClick={() => handleDelete(tag.name)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] transition-colors ${
                      confirmDelete === tag.name
                        ? 'bg-red-500 text-white'
                        : 'bg-rose-50 text-rose-400 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    {confirmDelete === tag.name ? '确认删除?' : '删除标签'}
                  </button>
                </div>

                {/* Result */}
                {results[tag.name] && (
                  <div className={`text-[10px] flex items-center gap-1 ${
                    results[tag.name].includes('成功') ? 'text-accent-sage' :
                    results[tag.name].includes('失败') ? 'text-rose-400' : 'text-warm-400'
                  }`}>
                    {results[tag.name].includes('ing') ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    ) : results[tag.name].includes('成功') ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : (
                      <AlertTriangle className="w-2.5 h-2.5" />
                    )}
                    {results[tag.name]}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="px-5 py-3 border-t border-cream-200 bg-rose-50/50 flex items-center gap-2 text-xs text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}
