import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Terminal,
  Loader2,
} from 'lucide-react'

type DoctorReport = Awaited<ReturnType<typeof api.getSystemDoctor>>

export default function SystemDoctorCard() {
  const [report, setReport] = useState<DoctorReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  const runCheck = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getSystemDoctor()
      setReport(data)
    } catch (err: any) {
      setError(err?.message || '环境体检接口暂不可用，请确认本地服务正在运行')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    runCheck()
  }, [runCheck])

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 1800)
  }

  return (
    <section className="bento-card bg-white border border-slate-200/80 rounded-xl shadow-xs p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-semibold text-slate-800">本地智能体与环境一键体检 (System Doctor)</span>
          {report && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                report.status === 'healthy'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              已就绪 {report.summary.passed}/{report.summary.total}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={runCheck}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 transition-colors cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {loading ? '扫描中…' : '重新体检'}
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        自动探测当前电脑的 Node.js 运行时、Obsidian 本地知识库、云端 API 兜底以及 Claude Code / Antigravity / Codex / Ollama 等本地智能体。缺失项均附带一键复制指引，未配置 AI 时离线刷题与图谱仍可 100% 正常运行。
      </p>

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 mb-3">
          {error}
        </div>
      )}

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {report.checks.map((item) => {
            const isPassed = item.status === 'passed'
            const isFailed = item.status === 'failed'
            return (
              <div
                key={item.key}
                className={`p-3 rounded-xl border transition-colors ${
                  isPassed
                    ? 'bg-emerald-50/40 border-emerald-200/70'
                    : isFailed
                      ? 'bg-rose-50/40 border-rose-200/70'
                      : 'bg-slate-50/80 border-slate-200/80'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isFailed ? (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate">{item.title}</span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                          isPassed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200/80 text-slate-600'
                        }`}
                      >
                        {isPassed ? '已就绪' : '可选/待配置'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 break-all leading-relaxed">
                      {item.detail}
                    </p>
                    {item.fixCommand && (
                      <div className="mt-2 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Terminal className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate select-all">{item.fixCommand}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.key, item.fixCommand!)}
                          className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[10px] text-white transition-colors cursor-pointer"
                          title="复制配置指引或命令"
                        >
                          {copiedKey === item.key ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              复制
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
