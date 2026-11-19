import { useState } from 'react'
import { api } from '../services/api'
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  FolderCheck,
  Cpu,
  KeyRound,
  ArrowRight,
  Loader2,
  HardDrive,
  ShieldCheck,
} from 'lucide-react'

type DiscoveryReport = Awaited<ReturnType<typeof api.autoDiscover>>

export default function AutoDiscoveryCard({ onApplied }: { onApplied?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [report, setReport] = useState<DiscoveryReport | null>(null)
  const [selectedVaultPath, setSelectedVaultPath] = useState<string>('')
  const [applyAi, setApplyAi] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  const handleDiscover = async () => {
    setLoading(true)
    setError('')
    setSuccessMessage('')
    try {
      const data = await api.autoDiscover()
      setReport(data)
      const rec = data.recommendedVault?.path || data.vaults?.[0]?.path || ''
      setSelectedVaultPath(rec)
    } catch (err: any) {
      setError(err?.message || '自动探测失败，请确认本地服务已启动')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!selectedVaultPath) return
    setApplying(true)
    setError('')
    try {
      const res = await api.autoApplyDiscovered({
        vaultPath: selectedVaultPath,
        applyExtractedAi: applyAi && Boolean(report?.extractedCredentials),
      })
      setSuccessMessage(res.message || '已自动完成电脑环境适配并应用配置！')
      onApplied?.()
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (err: any) {
      setError(err?.message || '配置应用失败')
    } finally {
      setApplying(false)
    }
  }

  return (
    <section className="bento-card bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border border-indigo-200/80 rounded-2xl shadow-xs p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100/80 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">全自动电脑探测与一键装配 (Auto-Discovery)</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                小白神器
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              无需手动查找文件夹路径或配置端口，脚本自动扫描电脑已安装的 Obsidian 知识库与本地智能体
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDiscover}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>{loading ? '全盘扫描中…' : '智能探测我的电脑'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 探测报告结果 */}
      {report && (
        <div className="space-y-4 animate-in fade-in">
          {/* 1. 扫描到的知识库列表 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FolderCheck className="w-4 h-4 text-emerald-600" />
                <span>扫描到的本地 Obsidian 知识库 (共 {report.vaults.length} 个)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">点击选择你想要绑定的知识库：</span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {report.vaults.map((vault) => {
                const isSelected = selectedVaultPath === vault.path
                return (
                  <div
                    key={vault.id}
                    onClick={() => setSelectedVaultPath(vault.path)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 shadow-2xs'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="truncate">
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="truncate">{vault.name}</span>
                          {vault.isOpen && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-medium shrink-0">
                              Obsidian 正在使用
                            </span>
                          )}
                          {vault.isRecommended && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-medium shrink-0">
                              推荐首选
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">{vault.path}</p>
                      </div>
                    </div>
                    {typeof vault.noteCount === 'number' && (
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        {vault.noteCount} 篇笔记
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. 识别到的智能体与已扫描到的 AI 凭证 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <span>就绪的本地智能体</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {report.agents.filter(a => a.available).length > 0 ? (
                  report.agents.filter(a => a.available).map(a => (
                    <span
                      key={a.provider}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold"
                    >
                      ✓ {a.provider}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-[11px]">未检测到 CLI 智能体（使用云端 API）</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>Obsidian 插件 AI 密钥</span>
                </span>
                {report.extractedCredentials && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-indigo-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={applyAi}
                      onChange={(e) => setApplyAi(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>一键复用</span>
                  </label>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {report.extractedCredentials
                  ? `从插件 [${report.extractedCredentials.sourcePlugin}] 提取到 ${report.extractedCredentials.model || 'AI'} 密钥`
                  : '未在知识库插件中检测到旧密钥，保留当前配置'}
              </p>
            </div>
          </div>

          {/* 3. 一键应用大按钮 */}
          <div className="pt-1 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>配置完成后系统将自动热更新，无需重启即可开始做题与伴读。</span>
            </div>
            <button
              type="button"
              onClick={handleApply}
              disabled={applying || !selectedVaultPath}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>{applying ? '正在自动装配…' : '🚀 一键应用选中的配置'}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
