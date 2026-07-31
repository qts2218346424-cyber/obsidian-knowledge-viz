import { useMemo, useState } from 'react'
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, Search, X } from 'lucide-react'
import type { TreeNode } from '../services/api'

interface FileExplorerProps {
  tree: TreeNode[]
  onFileClick: (path: string) => void
  selectedPath?: string
}

export default function FileExplorer({ tree, onFileClick, selectedPath }: FileExplorerProps) {
  const [query, setQuery] = useState('')
  const filteredTree = useMemo(() => filterTree(tree, query), [tree, query])

  if (tree.length === 0) {
    return (
      <div className="h-full bg-surface border border-cream-200 rounded-xl p-4 flex items-center justify-center">
        <p className="text-xs text-warm-400 text-center">
          未连接到 Vault<br />
          <span className="text-[10px]">启动后端以加载文件</span>
        </p>
      </div>
    )
  }

  return (
    <div className="h-full bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col">
      <div className="border-b border-cream-200">
        <div className="px-3 py-2.5 text-xs font-medium text-warm-600 flex items-center gap-2">
          <FolderOpen className="w-3.5 h-3.5 text-accent-orange" />
          Vault 文件
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
          <TreeNodeItem key={node.path} node={node} depth={0} onFileClick={onFileClick} selectedPath={selectedPath} />
        )) : (
          <p className="px-3 py-6 text-center text-xs leading-5 text-warm-400">没有找到匹配的笔记</p>
        )}
      </div>
    </div>
  )
}

function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return nodes

  return nodes.flatMap(node => {
    if (node.type === 'file') {
      return node.name.toLowerCase().includes(normalized) || node.path.toLowerCase().includes(normalized) ? [node] : []
    }

    const children = node.children ? filterTree(node.children, normalized) : []
    return node.name.toLowerCase().includes(normalized) || children.length > 0
      ? [{ ...node, children }]
      : []
  })
}

function TreeNodeItem({
  node,
  depth,
  onFileClick,
  selectedPath,
}: {
  node: TreeNode
  depth: number
  onFileClick: (path: string) => void
  selectedPath?: string
}) {
  const [expanded, setExpanded] = useState(depth < 1)

  if (node.type === 'file') {
    return (
      <button
        onClick={() => onFileClick(node.path)}
        className={`w-full flex items-center gap-1.5 rounded px-2 py-1 text-left text-xs transition-colors ${
          selectedPath === node.path
            ? 'bg-accent-orange/12 font-medium text-accent-orange'
            : 'text-warm-500 hover:bg-cream-200/50 hover:text-warm-700'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <FileText className="w-3 h-3 text-warm-400 shrink-0" />
        <span className="truncate">{node.name}</span>
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-warm-600 hover:bg-cream-200/50 transition-colors text-left"
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
            <TreeNodeItem key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} selectedPath={selectedPath} />
          ))}
        </div>
      )}
    </div>
  )
}
