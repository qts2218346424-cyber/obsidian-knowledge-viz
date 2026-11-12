import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, Search, X, BookOpen, FileCode } from 'lucide-react'
import { api, type TreeNode } from '../services/api'

interface FileExplorerProps {
  tree: TreeNode[]
  onFileClick: (path: string, options?: { mode?: 'preview' | 'write'; fromSearch?: boolean }) => void
  selectedPath?: string
}

export default function FileExplorer({ tree, onFileClick, selectedPath }: FileExplorerProps) {
  const [query, setQuery] = useState('')
  const [remoteMatchedPaths, setRemoteMatchedPaths] = useState<Set<string> | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setRemoteMatchedPaths(null)
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const files = await api.getFiles(trimmed)
        if (!cancelled) {
          setRemoteMatchedPaths(new Set(files.map(f => f.path)))
        }
      } catch {
        if (!cancelled) setRemoteMatchedPaths(null)
      }
    }, 220)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  const filteredTree = useMemo(() => filterTree(tree, query, remoteMatchedPaths), [tree, query, remoteMatchedPaths])

  if (tree.length === 0) {
    return (
      <div className="h-full bg-surface border border-cream-200 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 select-none">
        <FolderOpen className="w-7 h-7 text-warm-400/50" />
        <div className="text-xs font-bold text-warm-700">暂无个人考研笔记</div>
        <p className="text-2xs text-warm-400 leading-relaxed max-w-[150px]">
          点击上方「+ 新建笔记」或从考研讲义一键摘录，即可开始构建专属笔记库
        </p>
      </div>
    )
  }

  return (
    <div className="h-full bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col">
      <div className="border-b border-cream-200">
        <div className="px-3 py-2.5 text-xs font-medium text-warm-600 flex items-center gap-2">
          <FolderOpen className="w-3.5 h-3.5 text-accent-orange" />
          考研笔记目录
        </div>
        <div className="px-2 pb-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-cream-200 bg-cream-100 px-2 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-warm-400" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="搜索笔记"
              aria-label="搜索笔记"
              className="min-w-0 flex-1 bg-transparent text-xs text-warm-700 outline-none placeholder:text-warm-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="清除搜索" className="text-warm-400 hover:text-warm-700">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {filteredTree.length > 0 ? filteredTree.map(node => (
          <TreeNodeItem key={node.path} node={node} depth={0} onFileClick={onFileClick} selectedPath={selectedPath} isSearching={Boolean(query.trim())} />
        )) : (
          <p className="px-3 py-6 text-center text-xs leading-5 text-warm-400">没有找到匹配的笔记</p>
        )}
      </div>
    </div>
  )
}

function filterTree(nodes: TreeNode[], query: string, remoteMatchedPaths?: Set<string> | null): TreeNode[] {
  const rawQuery = query.trim().toLowerCase()
  if (!rawQuery) return nodes

  // 支持用户输入 #标签 或纯标签名搜索，结合后端 /api/files 全文与标签匹配结果进行多维过滤
  const cleanTag = rawQuery.startsWith('#') ? rawQuery.slice(1).trim() : rawQuery

  return nodes.flatMap(node => {
    if (node.type === 'file') {
      const nameMatch = node.name.toLowerCase().includes(rawQuery) || node.name.toLowerCase().includes(cleanTag)
      const pathMatch = node.path.toLowerCase().includes(rawQuery) || node.path.toLowerCase().includes(cleanTag)
      const remoteMatch = remoteMatchedPaths ? remoteMatchedPaths.has(node.path) : false
      const tagMatch = Array.isArray((node as any).tags) && (node as any).tags.some((t: string) =>
        t.toLowerCase().includes(cleanTag) || t.toLowerCase().includes(rawQuery)
      )
      return (nameMatch || pathMatch || tagMatch || remoteMatch) ? [node] : []
    }

    const children = node.children ? filterTree(node.children, rawQuery, remoteMatchedPaths) : []
    return node.name.toLowerCase().includes(rawQuery) || children.length > 0
      ? [{ ...node, children }]
      : []
  })
}

function TreeNodeItem({
  node,
  depth,
  onFileClick,
  selectedPath,
  isSearching,
}: {
  node: TreeNode
  depth: number
  onFileClick: (path: string, options?: { mode?: 'preview' | 'write'; fromSearch?: boolean }) => void
  selectedPath?: string
  isSearching?: boolean
}) {
  const [expanded, setExpanded] = useState(depth < 1)

  if (node.type === 'file') {
    const ext = node.ext || (node.path.includes('.') ? `.${node.path.split('.').pop()?.toLowerCase()}` : '.md')
    const isPdf = ext === '.pdf'
    const isHtml = ext === '.html' || ext === '.htm'

    return (
      <button
        onClick={() => {
          if (isPdf || isHtml) {
            window.open(`/api/books/raw?path=${encodeURIComponent(node.path)}`, '_blank')
          }
          onFileClick(node.path, { mode: isSearching ? 'preview' : undefined, fromSearch: Boolean(isSearching) })
        }}
        title={isPdf ? `${node.name} (PDF 参考资料 - 点击在新标签页预览)` : isHtml ? `${node.name} (交互仿真课件 - 点击在新标签页打开)` : node.name}
        className={`w-full flex items-center gap-1.5 rounded px-2 py-2.5 sm:py-1 text-left text-xs transition-colors cursor-pointer ${
          selectedPath === node.path
            ? 'bg-accent-orange/12 font-medium text-accent-orange'
            : 'text-warm-500 hover:bg-cream-200/50 hover:text-warm-700'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isPdf ? (
          <BookOpen className="w-3 h-3 text-red-500 shrink-0" />
        ) : isHtml ? (
          <FileCode className="w-3 h-3 text-sky-500 shrink-0" />
        ) : (
          <FileText className="w-3 h-3 text-warm-400 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
        {isPdf && (
          <span className="ml-auto text-2xs px-1 rounded bg-red-100 text-red-600 font-mono scale-90">PDF</span>
        )}
        {isHtml && (
          <span className="ml-auto text-2xs px-1 rounded bg-sky-100 text-sky-600 font-mono scale-90">课件</span>
        )}
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-1.5 px-2 py-2.5 sm:py-1 rounded text-xs text-warm-600 hover:bg-cream-200/50 transition-colors text-left"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {expanded ? (
          <ChevronDown className="w-3 h-3 text-warm-400 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-warm-400 shrink-0" />
        )}
        {expanded ? (
          <FolderOpen className="w-3 h-3 text-accent-amber shrink-0" />
        ) : (
          <Folder className="w-3 h-3 text-accent-amber shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {expanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNodeItem key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} selectedPath={selectedPath} isSearching={isSearching} />
          ))}
        </div>
      )}
    </div>
  )
}
