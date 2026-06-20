import { useState } from 'react'
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from 'lucide-react'
import type { TreeNode } from '../services/api'

interface FileExplorerProps {
  tree: TreeNode[]
  onFileClick: (path: string) => void
}

export default function FileExplorer({ tree, onFileClick }: FileExplorerProps) {
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
      <div className="px-3 py-2.5 border-b border-cream-200 text-xs font-medium text-warm-600 flex items-center gap-2">
        <FolderOpen className="w-3.5 h-3.5 text-accent-orange" />
        Vault 文件
      </div>
      <div className="flex-1 overflow-auto p-2">
        {tree.map(node => (
          <TreeNodeItem key={node.path} node={node} depth={0} onFileClick={onFileClick} />
        ))}
      </div>
    </div>
  )
}

function TreeNodeItem({
  node,
  depth,
  onFileClick,
}: {
  node: TreeNode
  depth: number
  onFileClick: (path: string) => void
}) {
  const [expanded, setExpanded] = useState(depth < 1)

  if (node.type === 'file') {
    return (
      <button
        onClick={() => onFileClick(node.path)}
        className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-warm-500 hover:text-warm-700 hover:bg-cream-200/50 transition-colors text-left"
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
            <TreeNodeItem key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} />
          ))}
        </div>
      )}
    </div>
  )
}
