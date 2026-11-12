import { createPortal } from 'react-dom'
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
  Ticket,
  Zap,
  CreditCard,
  History,
  ArrowRight,
  Gift,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import * as authService from '../services/auth'
import type { PointLogItem } from '../types/auth'

interface CheckinModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'checkin' | 'redeem' | 'recharge' | 'logs'
}

export default function CheckinModal({ isOpen, onClose, defaultTab = 'checkin' }: CheckinModalProps) {
  const { points, canCheckinToday, checkin, redeemCoupon, recharge, refreshPoints, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState<'checkin' | 'redeem' | 'recharge' | 'logs'>(() => {
    if (!isAdmin && defaultTab === 'recharge') return 'checkin'
    return defaultTab
  })

  const [logs, setLogs] = useState<PointLogItem[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 优惠码兑换表单
  const [couponCodeInput, setCouponCodeInput] = useState('')

  // 自主充值表单
  const [selectedPlanAmount, setSelectedPlanAmount] = useState<number>(50)
  const [customAmountText, setCustomAmountText] = useState<string>('')
  const [rechargeSuccess, setRechargeSuccess] = useState<boolean>(false)

  const rechargePlans = [
    {
      amount: 10,
      title: '新手体验包',
      desc: '可向 AI 导师提问 100 次',
      tag: '入门轻享',
      popular: false,
    },
    {
      amount: 50,
      title: '冲刺提分包',
      desc: '可向 AI 导师提问 500 次',
      tag: '🔥 85% 研友推荐',
      popular: true,
    },
    {
      amount: 100,
      title: '研考无忧包',
      desc: '可向 AI 导师提问 1000 次',
      tag: '强化全覆盖',
      popular: false,
    },
    {
      amount: 200,
      title: '极客研霸包',
      desc: '可向 AI 导师提问 2000 次',
      tag: '双师对比畅聊',
      popular: false,
    },
  ]

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
      setCouponCodeInput('')
      setRechargeSuccess(false)
      fetchPointLogs()
      if (!isAdmin && defaultTab === 'recharge') {
        setActiveTab('checkin')
      } else {
        setActiveTab(defaultTab)
      }
    }
  }, [isOpen, defaultTab, isAdmin])

  if (!isOpen) return null

  // 每日签到
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

  // 优惠码兑换
  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = couponCodeInput.trim()
    if (!code) {
      setMessage({ type: 'error', text: '请输入优惠兑换码' })
      return
    }
    setIsSubmitting(true)
    setMessage(null)
    try {
      const res = await redeemCoupon(code)
      if (res.success) {
        setMessage({ type: 'success', text: res.message })
        setCouponCodeInput('')
        fetchPointLogs()
      } else {
        setMessage({ type: 'error', text: res.message || '兑换失败，请检查券码' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '兑换异常，请稍后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 自主充值
  const handleRechargePoints = async () => {
    if (!isAdmin) {
      setMessage({ type: 'error', text: '自主充值功能已暂时关闭，如需增加积分请联系管理员获取兑换码' })
      return
    }

    const amount = customAmountText.trim()
      ? Number(customAmountText)
      : selectedPlanAmount

    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: '请选择或输入有效的充值积分数量' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)
    try {
      const res = await recharge(amount, '研学充值(管理员测试)')
      if (res.success) {
        setMessage({ type: 'success', text: res.message })
        setRechargeSuccess(true)
        setCustomAmountText('')
        fetchPointLogs()
      } else {
        setMessage({ type: 'error', text: res.message || '充值失败' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '充值服务异常，请稍后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Banner */}
        <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-indigo-700 p-5 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              CoreForge 研学激励与算力中心
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">伴学积分与兑换打卡</h2>
          <p className="text-xs text-amber-100/90 mt-0.5">
            单次 AI 导师深度问答消耗 0.1 积分 · 每日签到免费送 1 积分
          </p>

          {/* Current Balance Card */}
          <div className="mt-4 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-white/80 font-medium">当前伴学积分余额</div>
              <div className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1 mt-0.5">
                <span>{points.toFixed(1)}</span>
                <span className="text-xs font-normal text-amber-200">积分</span>
                <span className="text-[11px] text-white/60 ml-2 font-normal">
                  (约可向导师提问 {Math.round(points * 10)} 次)
                </span>
              </div>
            </div>

            {canCheckinToday ? (
              <button
                onClick={handleDoCheckin}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 bg-white text-amber-700 hover:bg-amber-50 shadow-white/20 animate-pulse"
              >
                <CalendarCheck className="h-4 w-4 text-amber-600" />
                <span>{isSubmitting ? '签到中...' : '签到 +1'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 text-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>今日已签</span>
              </div>
            )}
          </div>
        </div>

        {/* Global Feedback Alert */}
        {message && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-b border-emerald-100 animate-fade-in'
                : 'bg-rose-50 text-rose-700 border-b border-rose-100 animate-shake'
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-600 shrink-0">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'checkin'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>每日签到</span>
          </button>

          <button
            onClick={() => setActiveTab('redeem')}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'redeem'
                ? 'border-indigo-600 text-indigo-800 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Ticket className="h-3.5 w-3.5 text-indigo-600" />
            <span>优惠码兑换</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('recharge')}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === 'recharge'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              <span>自主充值 (管理)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-slate-800 text-slate-900 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>收支明细</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* 1. 每日签到面板 */}
          {activeTab === 'checkin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">坚持每日研学打卡 · 轻松领取 1 积分</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    每日签到赠送 1.0 积分，相当于每天赠送 10 次专业课/数学深度伴学问答！
                  </p>
                </div>

                <div>
                  <button
                    onClick={handleDoCheckin}
                    disabled={!canCheckinToday || isSubmitting}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      canCheckinToday
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {canCheckinToday ? (
                      <>
                        <CalendarCheck className="h-4 w-4" />
                        <span>{isSubmitting ? '正在签到...' : '立即打卡签到 (+1.0 积分)'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>今日已完成打卡 (明日 00:00 刷新)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 规则卡片 */}
              <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/60 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-amber-600" /> 伴学积分机制说明
                </div>
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <p>• <strong>单次提问消耗</strong>：向 408 导师/考研数学导师发起提问扣除 <strong>0.1 积分</strong>。</p>
                  <p>• <strong>每日打卡刷新</strong>：北京时间每日 00:00 自动刷新打卡资格，每日限领 1 次。</p>
                  <p>• <strong>额度用尽解决</strong>：可参与每日签到领分，或在「优惠码兑换」输入卡密券码，如需更多额度请联系管理员。</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. 优惠码兑换面板 */}
          {activeTab === 'redeem' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/90 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                  <Ticket className="h-4 w-4 text-indigo-600" />
                  <span>输入优惠兑换码 / 研学充值卡密</span>
                </div>
                <p className="text-xs text-slate-600">
                  如果您收到了管理员发放的兑换码、答疑券或备考活动礼包码，请在下方直接兑换：
                </p>

                <form onSubmit={handleRedeemCoupon} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="例如：CF-A8K2-9XP3 或 KAOYAN-2026-WIN"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider text-slate-900 uppercase focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !couponCodeInput.trim()}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Gift className="h-4 w-4" />
                    <span>{isSubmitting ? '正在核销兑换...' : '立即兑换到账'}</span>
                  </button>
                </form>
              </div>

              <div className="rounded-xl border border-slate-200/80 p-3 bg-slate-50/60 text-[11px] text-slate-500 space-y-1">
                <p>💡 提示：优惠码大小写不敏感，系统会自动为您转为大写。单次券核销后即作废，多次券每个账号仅限使用一次。</p>
              </div>
            </div>
          )}

          {/* 3. 自主充值面板 */}
          {activeTab === 'recharge' && (
            !isAdmin ? (
              <div className="py-10 px-4 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-xs">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">自主充值通道已暂时关闭</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  系统已暂时关闭普通学员的自主充值通道。如需补充伴学积分，请参与每日签到打卡领分，或联系管理员获取专属卡密兑换码。
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('checkin')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    前往每日打卡签到
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>自主充值通道已对普通学员关闭，当前仅超级管理员可见并作为调试测试使用。</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">选择研学充值套餐 (管理员测试)</span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                    ⚡ 管理员调试通道
                  </span>
                </div>

                {/* 充值套餐卡片网格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rechargePlans.map((plan) => {
                    const isSelected = selectedPlanAmount === plan.amount && !customAmountText
                    return (
                      <div
                        key={plan.amount}
                        onClick={() => {
                          setSelectedPlanAmount(plan.amount)
                          setCustomAmountText('')
                        }}
                        className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                            : 'border-slate-200/80 bg-white hover:border-emerald-200 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{plan.title}</span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                            {plan.tag}
                          </span>
                        </div>
                        <div className="text-xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                          <span>+{plan.amount}</span>
                          <span className="text-xs font-normal text-slate-500">积分</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{plan.desc}</p>
                      </div>
                    )
                  })}
                </div>

                {/* 自定义充值额度 */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="text-xs font-bold text-slate-700">自定义充值积分数量</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="输入需要补充的积分数 (如 30)"
                      value={customAmountText}
                      onChange={(e) => setCustomAmountText(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleRechargePoints}
                      disabled={isSubmitting}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isSubmitting ? '正在到账...' : '立即确认充值'}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5 text-amber-700" /> 研学公益与个人 API 额度支持：
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    本系统调用个人部署的 DeepSeek / Claude 高性能大模型 API。考研期间为保障每一位同学能够充足刷题答疑，支持自主充值快速补充算力，祝各位研友一战成硕！
                  </p>
                </div>
              </div>
            )
          )}

          {/* 4. 收支明细面板 */}
          {activeTab === 'logs' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="font-bold text-slate-800">全部收支记录 ({logs.length})</span>
                <button
                  onClick={fetchPointLogs}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <History className="h-3 w-3" /> 刷新
                </button>
              </div>

              {loadingLogs ? (
                <div className="py-12 text-center text-xs text-slate-400">正在查询明细...</div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  暂无变动明细，打卡签到或兑换优惠码即可查看流水！
                </div>
              ) : (
                logs.map((log) => {
                  const isPlus = log.amount > 0
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors text-xs"
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
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="text-[11px]">积分与卡密全站实时同步生效</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}
