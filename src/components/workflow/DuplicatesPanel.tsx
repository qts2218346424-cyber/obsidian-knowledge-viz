import { useState } from 'react'
import {
  Search, GitMerge, Loader2, Check, AlertTriangle, RefreshCw,
} from 'lucide-react'
import { api } from '../../services/api'

interface DuplicatePair {
  fileA: string
  fileB: string
  similarity: number
  matchType: 'prefix' | 'jaccard' | 'title'
  longerFile: string
  shorterFile: string
}

interface MergeResult {
  keepFile: string
  mergedFile: string
  success: boolean
  appendedChars: number
  error?: string
}

const matchLabels: Record<string, string> = {
  prefix: '前缀匹配',
  jaccard: '词集相似',
  title: '文件名相似',
}

export default function DuplicatesPanel() {
  const [pairs, setPairs] = useState<DuplicatePair[]>([])
  const [scanning, setScanning] = useState(false)
  const [merging, setMerging] = useState(false)
  const [mode, setMode] = useState<'auto' | 'ai'>('auto')
  const [results, setResults] = useState<MergeResult[]>([])
  const [error, setError] = useState('')
  const [selectedPairs, setSelectedPairs] = useState<Set<number>>(new Set())

  const handleScan = async () => {
    setScanning(true)
    setError('')
    setResults([])
    setSelectedPairs(new Set())
    try {
      const res = await api.getDuplicates()
      setPairs(res.pairs)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  const toggleSelect = (index: number) => {
    setSelectedPairs(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const selectAll = () => {
    if (selectedPairs.size === pairs.length) {
      setSelectedPairs(new Set())
    } else {
      setSelectedPairs(new Set(pairs.map((_, i) => i)))
    }
  }

  const handleMerge = async (indices: number[]) => {
    setMerging(true)
    setError('')
    try {
      const mergePairs = indices.map(i => ({
        keepFile: pairs[i].longerFile,
        mergeFile: pairs[i].shorterFile,
        mode,
      }))
      const res = await api.mergeDuplicates(mergePairs)
      setResults(res.results)
      await handleScan()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setMerging(false)
    }
  }

  const handleMergeOne = (index: number) => handleMerge([index])

  const handleMergeSelected = () => {
    if (selectedPairs.size === 0) return
    handleMerge(Array.from(selectedPairs))
  }

  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length

  return (
    <div className="bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-cream-200 flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="text-sm font-semibold text-warm-700">重复内容检测</div>
          <div className="text-[11px] text-warm-400 mt-0.5">扫描重复笔记并智能合并</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={mode}
            onChange={e => setMode(e.target.value as 'auto' | 'ai')}
            className="bg-cream-200 border border-cream-300 rounded-lg px-2 py-1.5 text-xs text-warm-600 outline-none"
          >
            <option value="auto">自动合并</option>
            <option value="ai">AI 辅助</option>
          </select>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
          >
            {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {scanning ? '扫描中...' : '扫描重复'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {pairs.length === 0 && !scanning && (
          <div className="text-center py-8 text-xs text-warm-400">
            点击"扫描重复"开始检测
          </div>
        )}

        {pairs.length > 0 && (
          <>
            {/* Batch controls */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={selectAll}
                className="text-[10px] text-warm-500 hover:text-warm-700 transition-colors"
              >
                {selectedPairs.size === pairs.length ? '取消全选' : '全选'}
              </button>
              {selectedPairs.size > 0 && (
                <button
                  onClick={handleMergeSelected}
                  disabled={merging}
                  className="flex items-center gap-1 px-3 py-1 rounded text-[10px] bg-accent-orange text-white hover:bg-accent-orange/90 disabled:opacity-40 transition-colors"
                >
                  {merging ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <GitMerge className="w-2.5 h-2.5" />}
                  合并选中 ({selectedPairs.size})
                </button>
              )}
              <span className="text-[10px] text-warm-400 ml-auto">
                发现 {pairs.length} 对重复
              </span>
            </div>

            {/* Pair list */}
            {pairs.map((pair, i) => (
              <div key={i} className="bg-cream-100/50 border border-cream-200 rounded-lg p-3 hover:border-cream-300 transition-colors">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPairs.has(i)}
                    onChange={() => toggleSelect(i)}
                    className="mt-0.5 accent-accent-orange"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[11px] font-medium text-warm-700 truncate">
                        {pair.fileA.split('/').pop()?.replace('.md', '')}
                      </span>
                      <RefreshCw className="w-2.5 h-2.5 text-warm-400 shrink-0" />
                      <span className="text-[11px] font-medium text-warm-700 truncate">
                        {pair.fileB.split('/').pop()?.replace('.md', '')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] bg-accent-orange/10 text-accent-orange px-1.5 py-0.5 rounded">
                        {Math.round(pair.similarity * 100)}% 相似
                      </span>
                      <span className="text-[10px] bg-cream-200 text-warm-500 px-1.5 py-0.5 rounded">
                        {matchLabels[pair.matchType] || pair.matchType}
                      </span>
                      <span className="text-[10px] text-accent-sage">
                        保留: {pair.longerFile.split('/').pop()?.replace('.md', '')}
                      </span>
                    </div>
                    <div className="text-[10px] text-warm-400 mt-1 flex items-center gap-1">
                      {pair.fileA} / {pair.fileB}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMergeOne(i)}
                    disabled={merging}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] bg-accent-sage/80 text-white hover:bg-accent-sage disabled:opacity-40 transition-colors shrink-0"
                  >
                    {merging ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <GitMerge className="w-2.5 h-2.5" />}
                    合并
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-3 pt-3 border-t border-cream-200">
            <div className="text-[11px] font-medium text-warm-600 mb-1.5 flex items-center gap-1.5">
              {successCount > 0 && <Check className="w-3 h-3 text-accent-sage" />}
              {failCount > 0 && <AlertTriangle className="w-3 h-3 text-rose-400" />}
              合并结果: {successCount} 成功, {failCount} 失败
            </div>
            <div className="space-y-0.5">
              {results.map((r, i) => (
                <div key={i} className={`text-[10px] flex items-center gap-1 ${r.success ? 'text-accent-sage' : 'text-rose-400'}`}>
                  {r.success ? <Check className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                  {r.mergedFile}
                  {r.success && ` (+${r.appendedChars} 字符)`}
                  {r.error && ` - ${r.error}`}
                </div>
              ))}
            </div>
          </div>
        )}
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
