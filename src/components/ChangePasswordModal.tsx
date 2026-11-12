import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles, Lightbulb as IcLightbulb } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import * as authService from '../services/auth'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { user, logout } = useAuth()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isOpen) return null

  // 计算密码强度
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '请输入密码', color: 'bg-slate-200' }
    if (pwd.length < 6) return { score: 1, label: '长度过短 (至少6位)', color: 'bg-rose-500' }
    let score = 1
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
    if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++
    if (score >= 4) return { score: 4, label: '高强度安全密码', color: 'bg-emerald-500' }
    if (score >= 3) return { score: 3, label: '中等强度', color: 'bg-amber-500' }
    return { score: 2, label: '常规可用', color: 'bg-indigo-500' }
  }

  const strength = getPasswordStrength(newPassword)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!oldPassword) {
      setError('请输入当前旧密码')
      return
    }
    if (!newPassword) {
      setError('请输入新密码')
      return
    }
    if (newPassword.length < 6) {
      setError('新密码长度不能少于 6 位字符')
      return
    }
    if (newPassword === oldPassword) {
      setError('新密码不能与旧密码相同')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致，请仔细核对')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authService.changePassword(
        oldPassword.trim(),
        newPassword.trim()
      )
      setSuccess(res.message || '密码修改成功！')
      
      // 2 秒后自动退出并引导至登录页
      setTimeout(async () => {
        onClose()
        await logout()
      }, 2000)
    } catch (err: any) {
      setError(err.message || '修改密码失败，请核对原密码是否正确')
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md max-h-[88dvh] rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">修改登录密码</h2>
              <p className="text-xs text-slate-500">
                更新当前账户安全密码，保障研学知识库隐私
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* 当前账户身份卡片 */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-400">当前登录账户</span>
              <p className="font-bold text-slate-900 text-sm">
                {user?.displayName || user?.username}{' '}
                <span className="text-xs text-slate-400 font-normal">(@{user?.username})</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-2xs font-semibold text-indigo-700 bg-white border border-indigo-200/80 px-2.5 py-0.5 rounded-full shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>{user?.role === 'admin' ? '超级管理员' : user?.role === 'editor' ? '助教编辑' : '学生账号'}</span>
            </span>
          </div>

          {/* 成功状态 */}
          {success ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">密码修改成功！</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                系统已安全更新您的加密凭据。为了您的账户安全，正在自动退出当前会话并前往登录页...
              </p>
              <button
                type="button"
                onClick={async () => {
                  onClose()
                  await logout()
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <span>立即重新登录</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 错误提示 */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* 原密码 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>当前原密码</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="请输入当前正在使用的原密码"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 新密码 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>新密码</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  {newPassword && (
                    <span className="text-2xs text-slate-400">
                      强度：<span className="font-semibold text-slate-700">{strength.label}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码 (至少 6 位字符)"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* 密码强度指示条 */}
                {newPassword && (
                  <div className="grid grid-cols-4 gap-1 pt-0.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          step <= strength.score ? strength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 确认新密码 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <span>确认新密码</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>正在更新密码...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>确认修改密码</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center border-t border-slate-100 mt-2">
                <span className="text-2xs text-slate-400">
                  <IcLightbulb className="emoji-icon" aria-hidden="true" />忘记当前旧密码？可在退出后于登录界面点击「忘记密码」，通过安全密保或专属救援码直接重置。
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
