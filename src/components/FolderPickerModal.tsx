import { useState, useEffect, useCallback } from 'react'
import { Folder, FolderOpen, HardDrive, ArrowUp, X, Loader2, AlertCircle, ChevronRight, Monitor } from 'lucide-react'
import { api } from '../services/api'

declare global {
  interface Window {
    electronAPI?: {
      platform: string
      selectFolder: () => Promise<string | null>
    }
  }
}

export interface FsEntry {
  name: string
  path: string
}

interface FolderPickerModalProps {
  onSelect: (path: string) => void
  onClose: () => void
  title?: string
  initialPath?: string
}

export default function FolderPickerModal({
  onSelect,
  onClose,
  title = '选择文件夹',
  initialPath,
}: FolderPickerModalProps) {
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined)
  const [parent, setParent] = useState<string | null>(null)
  const [entries, setEntries] = useState<FsEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const hasElectronNativePicker = typeof window !== 'undefined' && !!window.electronAPI?.selectFolder

  const browse = useCallback(async (dirPath?: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.fsBrowse(dirPath)
      setCurrentPath(data.current || undefined)
      setParent(data.parent || null)
      setEntries(data.entries || [])
    } catch (err: any) {
      setError(err.message || '浏览失败')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // 若提供了 initialPath，先尝试加载它，失败则回退到根驱动器
    if (initialPath && initialPath.trim()) {
      browse(initialPath.trim()).catch(() => browse())
    } else {
      browse()
    }
  }, [browse, initialPath])

  // 原生系统选择对话框
  const handleNativeSelect = async () => {
    if (!window.electronAPI?.selectFolder) return
    try {
      const chosen = await window.electronAPI.selectFolder()
      if (chosen) {
        onSelect(chosen)
      }
    } catch (e: any) {
      setError(`调用系统文件选择器失败: ${e.message || e}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-cream-200 rounded-2xl w-full max-w-[500px] max-h-[85vh] sm:max-h-[540px] flex flex-col shadow-2xl overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-cream-200 bg-cream-50/70">
          <div className="flex items-center gap-2 min-w-0">
            <Folder className="w-4 h-4 text-accent-orange shrink-0" />
            <span className="text-sm font-semibold text-warm-800 truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasElectronNativePicker && (
              <button
                type="button"
                onClick={handleNativeSelect}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-warm-600 bg-cream-200/80 hover:bg-cream-300 rounded-lg transition-colors"
                title="打开系统原生文件夹选择对话框"
              >
                <Monitor className="w-3.5 h-3.5 text-warm-500" />
                <span>系统选择器</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-cream-200/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 当前路径面包屑与上级导航 */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-cream-100/60 border-b border-cream-200 text-xs">
          {parent ? (
            <button
              onClick={() => browse(parent)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-cream-200/70 hover:bg-cream-300 text-accent-orange font-medium shrink-0 transition-colors"
              title="返回上一级目录"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>上级</span>
            </button>
          ) : (
            <button
              onClick={() => browse()}
              className="flex items-center gap-1 px-2 py-1 rounded bg-cream-200/70 hover:bg-cream-300 text-warm-600 font-medium shrink-0 transition-colors"
              title="所有磁盘根目录"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>此电脑</span>
            </button>
          )}
          <span
            className="text-warm-500 truncate flex-1 font-mono text-[11px] select-all"
            title={currentPath || '根目录'}
          >
            {currentPath || '此电脑 (磁盘驱动器列表)'}
          </span>
        </div>

        {/* 目录列表 */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 divide-y divide-cream-100/60">
          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-warm-500 py-12">
              <Loader2 className="w-4 h-4 animate-spin text-accent-orange" />
              <span>加载目录中...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50/60 rounded-xl px-3 py-2.5 my-2 border border-red-200/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="text-center text-warm-400 text-xs py-12">
              当前目录下没有子文件夹
            </div>
          )}

          {!loading &&
            entries.map((entry) => {
              const isDrive = /^[A-Z]:\\?$/i.test(entry.path)
              return (
                <button
                  key={entry.path}
                  onClick={() => browse(entry.path)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-cream-100 active:bg-cream-200/80 transition-colors text-left group"
                >
                  {isDrive ? (
                    <HardDrive className="w-4 h-4 text-warm-500 shrink-0 group-hover:text-accent-orange transition-colors" />
                  ) : (
                    <FolderOpen className="w-4 h-4 text-accent-orange/70 shrink-0 group-hover:text-accent-orange transition-colors" />
                  )}
                  <span className="text-xs sm:text-sm font-medium text-warm-700 flex-1 truncate group-hover:text-warm-900">
                    {entry.name}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-warm-300 group-hover:text-warm-600 transition-colors shrink-0" />
                </button>
              )
            })}
        </div>

        {/* 底部操作栏 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 sm:px-5 py-3 border-t border-cream-200 bg-cream-50/60">
          <div className="text-[11px] text-warm-500 truncate flex-1">
            {currentPath ? (
              <span>当前选中: <strong className="font-mono text-warm-700">{currentPath}</strong></span>
            ) : (
              <span>请选择磁盘或目标文件夹</span>
            )}
          </div>
          <div className="flex items-center gap-2 justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs text-warm-500 hover:text-warm-700 hover:bg-cream-200/50 transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => currentPath && onSelect(currentPath)}
              disabled={!currentPath}
              className="px-4 py-1.5 rounded-xl bg-accent-orange text-white text-xs font-medium hover:bg-accent-orange/90 active:scale-95 transition-all shadow-sm shadow-accent-orange/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              选择此文件夹
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
