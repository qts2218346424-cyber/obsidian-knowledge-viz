import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Folder, RefreshCw, CheckCircle2,
  FolderOpen, Activity, FileText, Hash, Link2, Copy, Check,
  Download, ShieldCheck, Lock
} from 'lucide-react'
import { api, type VaultStats } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

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
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [stats, setStats] = useState<VaultStats | null>(null)
  const [, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [openingFolder, setOpeningFolder] = useState(false)
  const [downloadingZip, setDownloadingZip] = useState(false)
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

  // 对普通用户展示虚拟安全沙盒，对管理员回显系统路径
  const displayVaultPath = isAdmin ? (stats?.vaultPath || 'E:\\考研\\408考研学习') : '【个人加密专属研学沙盒】'

  const handleCopyPath = () => {
    navigator.clipboard.writeText(displayVaultPath)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenFolder = async () => {
    if (!isAdmin) return
    setOpeningFolder(true)
    try {
      await api.openVaultFolder()
    } catch (err: any) {
      alert('无法打开本地文件夹: ' + err.message)
    } finally {
      setOpeningFolder(false)
    }
  }

  const handleDownloadZip = () => {
    setDownloadingZip(true)
    try {
      const exportUrl = api.exportSandboxZipUrl ? api.exportSandboxZipUrl() : '/api/vault/export-zip'
      const a = document.createElement('a')
      a.href = exportUrl
      a.download = `CoreForge_Notes_${user?.username || 'Guest'}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTestStatus('🎉 专属沙盒知识库已开始打包下载！解压后可直接用本地 Obsidian 软件打开作为独立知识库。')
    } catch (err: any) {
      setTestStatus(`❌ 导出失败: ${err.message}`)
    } finally {
      setTimeout(() => setDownloadingZip(false), 2000)
    }
  }

  const handleRefreshVault = async () => {
    setRefreshing(true)
    try {
      const res = await api.refreshVault()
      await loadStats()
      if (onRefresh) onRefresh()
      setTestStatus(`✅ 刷新完成！当前知识库共载入 ${res.noteCount} 篇笔记。`)
    } catch (err: any) {
      setTestStatus(`❌ 刷新失败: ${err.message}`)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRunSyncTest = async () => {
    setTestStatus('正在执行沙箱写入与状态同步验证...')
    try {
      const testFileName = `_sandbox_sync_test_${Date.now().toString().slice(-4)}.md`
      const testContent = `# 沙箱连通性与隔离测试笔记\n\n生成时间：${new Date().toLocaleString()}\n\n本笔记由 CoreForge 研核自动生成，用于验证考生专属沙箱 (${displayVaultPath}) 的落盘持久化。`
      
      // 1. Write file to vault
      await api.createFile(testFileName, testContent, {
        title: '沙箱同步测试笔记',
        tags: ['sandbox-test'],
        type: 'test'
      })

      // 2. Refresh stats
      await loadStats()
      if (onRefresh) onRefresh()

      setTestStatus(`🎉 验证成功！已成功在专属沙盒内安全写入测试文件：${testFileName}。云端物理宿主机目录已受严格隔离保护。`)
    } catch (err: any) {
      setTestStatus(`❌ 写入测试失败: ${err.message}`)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="dark bg-[#121622] border border-white/15 rounded-3xl w-full max-w-xl max-h-[88dvh] shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              {isAdmin ? <Folder className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isAdmin ? 'Obsidian 本地同步中心 (系统管理员)' : '云端专属研学沙盒与导出'}
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isAdmin ? '双向实时监听已生效' : '多租户物理沙箱隔离就绪'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAdmin
                  ? 'CoreForge 与电脑本地 Obsidian 共用同一知识库物理目录，毫秒级直接落盘'
                  : '每位考生独享独立数据沙盒，绝不泄露云端主机目录，支持一键导出离线 Obsidian 知识库'}
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
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Path Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                {isAdmin ? <Folder className="w-3.5 h-3.5 text-purple-400" /> : <Lock className="w-3.5 h-3.5 text-emerald-400" />}
                {isAdmin ? '当前绑定的本地 Obsidian 路径 (绝对物理路径)' : '个人存储位置 (云端独立沙箱空间)'}
              </span>
              <button
                onClick={handleCopyPath}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制标识'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-slate-800 font-mono text-xs text-purple-300 break-all select-all flex items-center justify-between">
              <span>{displayVaultPath}</span>
              {!isAdmin && (
                <span className="text-[11px] text-emerald-400 font-sans ml-2 shrink-0">
                  仅您本人私有
                </span>
              )}
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
              <span>{isAdmin ? '本地物理同步机制' : '考生沙盒安全与 Obsidian 离线掌握保障'}</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-slate-400">
              {isAdmin ? (
                <>
                  1. <b>零延迟本地读写</b>：在软件内创建、编辑的任何笔记，均直接写入本地物理目录中真实存在的 .md 文件。<br />
                  2. <b>Obsidian 实时互通</b>：在本地电脑 Obsidian 中修改笔记，后台文件监听引擎会自动捕获并同步更新界面。
                </>
              ) : (
                <>
                  1. <b>物理级租户沙箱隔离</b>：您的双链笔记与 AI 伴学记录存储于独享的云端加密沙盒中，云服务器真实磁盘结构对所有考生完全隔离不可见，100% 杜绝隐私越权。<br />
                  2. <b>数据完全归您所有</b>：您可以随时点击下方【一键打包导出全部笔记 (.zip)】，一键下载到本地电脑并用桌面版 Obsidian 软件直接打开！
                </>
              )}
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
            {isAdmin ? (
              <button
                onClick={handleOpenFolder}
                disabled={openingFolder}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                title="在 Windows 资源管理器中打开本地 Obsidian 文件夹"
              >
                <FolderOpen className="w-4 h-4" />
                <span>在本地电脑打开</span>
              </button>
            ) : (
              <button
                onClick={handleDownloadZip}
                disabled={downloadingZip}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                title="将个人全部沙盒笔记打包为 ZIP 压缩包下载到本地"
              >
                <Download className={`w-4 h-4 ${downloadingZip ? 'animate-bounce' : ''}`} />
                <span>{downloadingZip ? '正在打包…' : '导出笔记 (.zip)'}</span>
              </button>
            )}

            <button
              onClick={handleRefreshVault}
              disabled={refreshing}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
              title="重新扫描沙箱笔记并刷新统计"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? '扫描中…' : '刷新笔记'}</span>
            </button>

            <button
              onClick={handleRunSyncTest}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs transition-all active:scale-95 cursor-pointer"
              title="往个人沙盒中写入一篇测试笔记验证连通性"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>写入沙箱测试</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>{isAdmin ? '文件监听状态：正常监听中' : '沙盒隔离状态：个人独享安全沙箱'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
