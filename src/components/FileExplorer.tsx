import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, Search, X, BookOpen, FileCode, FolderPlus, FilePlus } from 'lucide-react'
import { api, type TreeNode } from '../services/api'

interface FileExplorerProps {
  tree: TreeNode[]
  onFileClick: (path: string, options?: { mode?: 'preview' | 'write'; fromSearch?: boolean }) => void
  selectedPath?: string
  selectedFolder?: string
  onSelectFolder?: (folderPath: string) => void
  onCreateNoteInFolder?: (folderPath: string) => void
  onCreateFolder?: (parentFolderPath: string) => void
}

export default function FileExplorer({
  tree,
  onFileClick,
  selectedPath,
  selectedFolder = '',
  onSelectFolder,
  onCreateNoteInFolder,
  onCreateFolder,
}: FileExplorerProps) {
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
      <div className="h-full bg-surface border border-cream-200 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2.5 select-none">
        <FolderOpen className="w-7 h-7 text-warm-400/50" />
        <div className="text-xs font-bold text-warm-700">暂无个人考研笔记</div>
        <p className="text-2xs text-warm-400 leading-relaxed max-w-[160px]">
          点击下方按钮新建目录或笔记，即可开始构建专属笔记库
        </p>
        {(onCreateFolder || onCreateNoteInFolder) && (
          <div className="flex items-center gap-1.5 pt-1">
            {onCreateFolder && (
              <button
                type="button"
                onClick={() => onCreateFolder('')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-2xs font-semibold bg-cream-100 hover:bg-cream-200 text-warm-700 border border-cream-300 cursor-pointer"
              >
                <FolderPlus className="w-3 h-3" /> 新建目录
              </button>
            )}
            {onCreateNoteInFolder && (
              <button
                type="button"
                onClick={() => onCreateNoteInFolder('')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-2xs font-semibold bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
              >
                <FilePlus className="w-3 h-3" /> 新建笔记
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full bg-surface border border-cream-200 rounded-xl overflow-hidden flex flex-col">
      <div className="border-b border-cream-200">
        <div className="px-3 py-2 text-xs font-medium text-warm-600 flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => onSelectFolder?.('')}
            title="点击回到根目录"
            className="flex items-center gap-1.5 min-w-0 truncate hover:text-warm-900 transition-colors cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-accent-orange shrink-0" />
            <span className="truncate">考研笔记目录</span>
          </button>
          {(onCreateFolder || onCreateNoteInFolder) && (
            <div className="flex items-center gap-1 shrink-0">
              {onCreateNoteInFolder && (
                <button
                  type="button"
                  onClick={() => onCreateNoteInFolder(selectedFolder)}
                  title={selectedFolder ? `在「${selectedFolder}」下新建笔记` : '在根目录新建笔记'}
                  aria-label="在当前目录新建笔记"
                  className="p-1 rounded-md text-warm-500 hover:text-warm-900 hover:bg-cream-200 transition-colors cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
              )}
              {onCreateFolder && (
                <button
                  type="button"
                  onClick={() => onCreateFolder(selectedFolder)}
                  title={selectedFolder ? `在「${selectedFolder}」下新建子目录` : '在根目录新建目录'}
                  aria-label="新建目录"
                  className="p-1 rounded-md text-warm-500 hover:text-warm-900 hover:bg-cream-200 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
        {onSelectFolder && selectedFolder && (
          <div className="px-2.5 pb-1.5 flex items-center justify-between gap-1 text-[10px] text-warm-500">
            <span className="truncate font-mono bg-cream-100 px-1.5 py-0.5 rounded border border-cream-200" title={`当前选中目录：${selectedFolder}`}>
              📁 {selectedFolder}
            </span>
            <button
              type="button"
              onClick={() => onSelectFolder('')}
              className="shrink-0 text-warm-400 hover:text-warm-700 px-1 cursor-pointer"
              title="切回根目录"
            >
              根目录
            </button>
          </div>
        )}
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
          <TreeNodeItem
            key={node.path}
            node={node}
            depth={0}
            onFileClick={onFileClick}
            selectedPath={selectedPath}
            selectedFolder={selectedFolder}
            onSelectFolder={onSelectFolder}
            onCreateNoteInFolder={onCreateNoteInFolder}
            onCreateFolder={onCreateFolder}
            isSearching={Boolean(query.trim())}
          />
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
  selectedFolder,
  onSelectFolder,
  onCreateNoteInFolder,
  onCreateFolder,
  isSearching,
}: {
  node: TreeNode
  depth: number
  onFileClick: (path: string, options?: { mode?: 'preview' | 'write'; fromSearch?: boolean }) => void
  selectedPath?: string
  selectedFolder?: string
  onSelectFolder?: (folderPath: string) => void
  onCreateNoteInFolder?: (folderPath: string) => void
  onCreateFolder?: (parentFolderPath: string) => void
  isSearching?: boolean
}) {
  const [expanded, setExpanded] = useState(depth < 1)

  useEffect(() => {
    if (isSearching) {
      setExpanded(true)
      return
    }
    if (node.type === 'folder' && selectedFolder && (selectedFolder === node.path || selectedFolder.startsWith(`${node.path}/`))) {
      setExpanded(true)
    }
  }, [isSearching, selectedFolder, node.path, node.type])

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
          onFileClick(node.path, { mode: 'preview', fromSearch: Boolean(isSearching) })
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

  const isFolderSelected = selectedFolder === node.path

  return (
    <div>
      <div
        className={`group flex items-center rounded transition-colors ${
          isFolderSelected
            ? 'bg-amber-50/90 text-warm-900 font-medium'
            : 'text-warm-600 hover:bg-cream-200/50'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setExpanded(!expanded)
            onSelectFolder?.(node.path)
          }}
          className="flex-1 min-w-0 flex items-center gap-1.5 px-2 py-2.5 sm:py-1 text-xs text-left cursor-pointer"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          title={node.path}
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
        {(onCreateNoteInFolder || onCreateFolder) && (
          <div className={`flex items-center gap-0.5 pr-1 shrink-0 transition-opacity ${
            isFolderSelected ? 'opacity-100' : 'opacity-80 sm:opacity-0 sm:group-hover:opacity-100'
          }`}>
            {onCreateNoteInFolder && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(true)
                  onSelectFolder?.(node.path)
                  onCreateNoteInFolder(node.path)
                }}
                title={`在「${node.name}」目录下新建笔记`}
                aria-label={`在 ${node.name} 目录下新建笔记`}
                className="p-1 rounded text-warm-400 hover:text-warm-900 hover:bg-cream-200 cursor-pointer"
              >
                <FilePlus className="w-3 h-3" />
              </button>
            )}
            {onCreateFolder && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(true)
                  onSelectFolder?.(node.path)
                  onCreateFolder(node.path)
                }}
                title={`在「${node.name}」下新建子目录`}
                aria-label={`在 ${node.name} 下新建子目录`}
                className="p-1 rounded text-warm-400 hover:text-warm-900 hover:bg-cream-200 cursor-pointer"
              >
                <FolderPlus className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
      {expanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              selectedPath={selectedPath}
              selectedFolder={selectedFolder}
              onSelectFolder={onSelectFolder}
              onCreateNoteInFolder={onCreateNoteInFolder}
              onCreateFolder={onCreateFolder}
              isSearching={isSearching}
            />
          ))}
        </div>
      )}
    </div>
  )
}
