import { useState, useEffect } from 'react'
import {
  X,
  Coins,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Clock,
  ShieldAlert,
  HelpCircle,
  Award,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import * as authService from '../services/auth'
import type { PointLogItem } from '../types/auth'

interface CheckinModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CheckinModal({ isOpen, onClose }: CheckinModalProps) {
  const { points, canCheckinToday, checkin, refreshPoints } = useAuth()
  const [logs, setLogs] = useState<PointLogItem[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchPointLogs = async () => {
    try {
      setLoadingLogs(true)
      const data = await authService.getUserPoints()
      setLogs(data.logs || [])
    } catch {
      // ignore
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setMessage(null)
      fetchPointLogs()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleDoCheckin = async () => {
    if (isSubmitting || !canCheckinToday) return
    setIsSubmitting(true)
    setMessage(null)
    try {
      const res = await checkin()
      if (res.success) {
        setMessage({ type: 'success', text: res.message || '签到成功！已获得 1 积分' })
        fetchPointLogs()
      } else {
        setMessage({ type: 'error', text: res.message || '今日已签到' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '签到失败，请稍后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-indigo-700 p-5 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              研学激励中心
            </span>
          </div>

          <h2 className="text-lg font-bold">每日签到 · 领伴学积分</h2>
          <p className="text-xs text-amber-100/90 mt-0.5">
            单次 AI 伴学提问消耗 0.1 积分，签到 1 次可免费畅聊 10 次！
          </p>

          {/* Current Balance Card */}
          <div className="mt-4 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-white/80 font-medium">当前伴学积分余额</div>
              <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1 mt-0.5">
                <span>{points.toFixed(1)}</span>
                <span className="text-xs font-normal text-amber-200">积分</span>
              </div>
            </div>

            <button
              onClick={handleDoCheckin}
              disabled={!canCheckinToday || isSubmitting}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                canCheckinToday
                  ? 'bg-white text-amber-700 hover:bg-amber-50 shadow-white/20 animate-pulse'
                  : 'bg-white/20 text-white/70 cursor-not-allowed shadow-none'
              }`}
            >
              {canCheckinToday ? (
                <>
                  <CalendarCheck className="h-4 w-4 text-amber-600" />
                  <span>{isSubmitting ? '正在签到...' : '立即签到 +1'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <span>今日已签到</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-b border-emerald-100'
                : 'bg-rose-50 text-rose-700 border-b border-rose-100'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Rule Explanations */}
        <div className="px-5 py-3 bg-amber-50/50 border-b border-slate-100 text-[11px] text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800 flex items-center gap-1">
            <Coins className="h-3.5 w-3.5 text-amber-600" /> 伴学积分机制规则：
          </div>
          <p>• 每日签到：北京时间每日 00:00 刷新，每天可免费领取 <strong>1.0 积分</strong>。</p>
          <p>• 伴学扣费：向 AI 研学导师发起单次考点深度解答、真题追问消耗 <strong>0.1 积分</strong>。</p>
          <p>• 额度支持：若备考刷题积分不足，可联系超级管理员在用户管理面板直接分配充值。</p>
        </div>

        {/* Recent Transactions List */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>最近积分明细</span>
            <span className="text-[10px] text-slate-400 font-normal">展示最近变动流水</span>
          </div>

          {loadingLogs ? (
            <div className="py-8 text-center text-xs text-slate-400">正在查询明细...</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              暂无积分流水，点击上方按钮开启每日研学签到吧！
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const isPlus = log.amount > 0
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isPlus
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {isPlus ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">
                          {log.remark || (log.type === 'checkin' ? '每日签到奖励' : 'AI 伴学提问消耗')}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-bold font-mono text-xs ${
                          isPlus ? 'text-emerald-600' : 'text-slate-700'
                        }`}
                      >
                        {isPlus ? `+${log.amount.toFixed(1)}` : log.amount.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        余额: {log.balanceAfter.toFixed(1)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-200/80 text-slate-700 font-semibold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
