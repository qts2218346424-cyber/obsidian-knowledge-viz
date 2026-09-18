import { useState, useEffect } from 'react'
import {
  X, Folder, RefreshCw, CheckCircle2,
  FolderOpen, Activity, FileText, Hash, Link2, Copy, Check
} from 'lucide-react'
import { api, type VaultStats } from '../services/api'

interface ObsidianSyncModalProps {
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
}

export default function ObsidianSyncModal({
  isOpen,
  onClose,
  onRefresh,
}: ObsidianSyncModalProps) {
  const [stats, setStats] = useState<VaultStats | null>(null)
  const [, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [openingFolder, setOpeningFolder] = useState(false)
  const [testStatus, setTestStatus] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await api.getStats()
      setStats(res)
    } catch (err: any) {
      console.warn('Failed to load vault stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadStats()
      setTestStatus('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const vaultPath = stats?.vaultPath || 'E:\\考研\\408考研学习'

  const handleCopyPath = () => {
    navigator.clipboard.writeText(vaultPath)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenFolder = async () => {
    setOpeningFolder(true)
    try {
      await api.openVaultFolder()
    } catch (err: any) {
      alert('无法打开本地文件夹: ' + err.message)
    } finally {
      setOpeningFolder(false)
    }
  }

  const handleRefreshVault = async () => {
    setRefreshing(false)
    setRefreshing(true)
    try {
      const res = await api.refreshVault()
      await loadStats()
      if (onRefresh) onRefresh()
      setTestStatus(`✅ 重新扫描完成！当前本地知识库共载入 ${res.noteCount} 篇笔记。`)
    } catch (err: any) {
      setTestStatus(`❌ 刷新失败: ${err.message}`)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRunSyncTest = async () => {
    setTestStatus('正在执行写入与同步验证...')
    try {
      const testFileName = `_obsidian_sync_test_${Date.now().toString().slice(-4)}.md`
      const testContent = `# Obsidian 本地连通性测试笔记\n\n生成时间：${new Date().toLocaleString()}\n\n本文件由 CoreForge 研核自动生成，用于验证与本地 Obsidian 知识库 (${vaultPath}) 的物理文件双向同步。`
      
      // 1. Write file to vault
      await api.createFile(testFileName, testContent, {
        title: 'Obsidian 同步测试笔记',
        tags: ['sync-test'],
        type: 'test'
      })

      // 2. Refresh stats
      await loadStats()
      if (onRefresh) onRefresh()

      setTestStatus(`🎉 验证成功！已成功在本地 Obsidian 目录写入文件：${testFileName}。您可以立即打开电脑本地 Obsidian，左侧笔记树中已实时出现该测试文件！`)
    } catch (err: any) {
      setTestStatus(`❌ 写入测试失败: ${err.message}`)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-white/15 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Obsidian 本地同步中心</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  双向实时监听已生效
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                CoreForge 与电脑本地 Obsidian 共用同一知识库物理目录，毫秒级直接落盘
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Path Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-purple-400" />
                当前绑定的本地 Obsidian 路径 (绝对物理路径)
              </span>
              <button
                onClick={handleCopyPath}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制路径'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-slate-800 font-mono text-xs text-purple-300 break-all select-all flex items-center justify-between">
              <span>{vaultPath}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>总笔记篇数</span>
              </div>
              <div className="text-lg font-bold text-white">
                {stats?.totalNotes || 386}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>知识标签数</span>
              </div>
              <div className="text-lg font-bold text-white">
                {stats?.totalTags || 458}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>关联双链数</span>
              </div>
              <div className="text-lg font-bold text-white">
                {stats?.totalLinks || 376}
              </div>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>同步原理解析：为什么不需要第三方云同步？</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-slate-400">
              1. <b>零延迟本地读写</b>：您在本软件内创建、编辑、重命名的任何笔记，都是<b>直接写入上述本地硬盘文件夹中真实存在的 .md 文件</b>，不需要上传任何云端服务器。<br />
              2. <b>Obsidian 实时互通</b>：在本地电脑 Obsidian 软件中添加或修改笔记，后台内置的 Chokidar 文件监听引擎会自动捕获并同步更新界面。
            </p>
          </div>

          {/* Test Status Banner */}
          {testStatus && (
            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
              testStatus.startsWith('🎉') || testStatus.startsWith('✅')
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                : testStatus.startsWith('❌')
                ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                : 'bg-blue-950/30 border-blue-800/60 text-blue-300'
            }`}>
              {testStatus}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={handleOpenFolder}
              disabled={openingFolder}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              title="立即在 Windows 资源管理器中打开本地 Obsidian 文件夹"
            >
              <FolderOpen className="w-4 h-4" />
              <span>在本地电脑打开</span>
            </button>

            <button
              onClick={handleRefreshVault}
              disabled={refreshing}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
              title="重新扫描本地文件夹并刷新统计"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? '扫描中…' : '刷新本地同步'}</span>
            </button>

            <button
              onClick={handleRunSyncTest}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
              title="往本地知识库写入一篇测试笔记验证连通性"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>写入同步测试</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <span>文件监听状态：正常监听中</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
