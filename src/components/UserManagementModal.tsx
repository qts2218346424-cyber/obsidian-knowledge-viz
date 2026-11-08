import { useState, useEffect } from 'react'
import {
  X,
  Coins,
  Ticket,
  Users,
  UserPlus,
  ShieldAlert,
  Trash2,
  KeyRound,
  ShieldCheck,
  GraduationCap,
  Edit3,
  Check,
  AlertCircle,
  Copy,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import type { UserProfile, UserRole, CouponCodeItem } from '../types/auth'
import * as authService from '../services/auth'
import { useAuth } from '../contexts/AuthContext'

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<'users' | 'coupons'>('users')

  // 用户状态
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 新建用户表单状态
  const [isAdding, setIsAdding] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newDisplayName, setNewDisplayName] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('student')

  // 重置密码状态
  const [resettingUserId, setResettingUserId] = useState<string | null>(null)
  const [resetPasswordText, setResetPasswordText] = useState('')

  // 伴学积分分配状态
  const [grantingUserId, setGrantingUserId] = useState<string | null>(null)
  const [grantAmountText, setGrantAmountText] = useState('10')
  const [grantRemarkText, setGrantRemarkText] = useState('')
  const [isGranting, setIsGranting] = useState(false)

  // 优惠码管理状态
  const [coupons, setCoupons] = useState<CouponCodeItem[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(false)
  const [isAddingCoupon, setIsAddingCoupon] = useState(false)
  const [couponPoints, setCouponPoints] = useState('10')
  const [couponCount, setCouponCount] = useState('1')
  const [couponMaxUses, setCouponMaxUses] = useState('1')
  const [couponCustomCode, setCouponCustomCode] = useState('')
  const [couponDescription, setCouponDescription] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await authService.listUsers()
      setUsers(res.users)
    } catch (err: any) {
      setError(err.message || '获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true)
      const res = await authService.adminListCoupons()
      setCoupons(res.coupons)
    } catch (err: any) {
      setError(err.message || '获取优惠码列表失败')
    } finally {
      setLoadingCoupons(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setError(null)
      setSuccess(null)
      setIsAdding(false)
      setGrantingUserId(null)
      setResettingUserId(null)
      fetchUsers()
      fetchCoupons()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await authService.createUser({
        username: newUsername.trim(),
        password: newPassword,
        displayName: newDisplayName.trim() || undefined,
        role: newRole,
      })
      setSuccess(`成功创建用户 "${newUsername.trim()}"！`)
      setIsAdding(false)
      setNewUsername('')
      setNewPassword('')
      setNewDisplayName('')
      setNewRole('student')
      fetchUsers()
    } catch (err: any) {
      setError(err.message || '创建用户失败')
    }
  }

  const handleRoleChange = async (targetUser: UserProfile, role: UserRole) => {
    setError(null)
    try {
      await authService.updateUser(targetUser.id, { role })
      setSuccess(`已将 "${targetUser.username}" 角色调整为 [${getRoleName(role)}]`)
      fetchUsers()
    } catch (err: any) {
      setError(err.message || '更新角色失败')
    }
  }

  const handleGrantPoints = async (userId: string) => {
    const amount = Number(grantAmountText)
    if (isNaN(amount) || amount === 0) {
      setError('请输入有效的积分调整数值（如 +10、+50 或 -5）')
      return
    }
    setError(null)
    setIsGranting(true)
    try {
      const res = await authService.adminGrantPoints(
        userId,
        amount,
        grantRemarkText.trim() || undefined
      )
      if (res.success) {
        setSuccess(`成功为用户分配积分 (${amount > 0 ? '+' : ''}${amount})，最新余额: ${res.points.toFixed(1)}`)
        setGrantingUserId(null)
        setGrantAmountText('10')
        setGrantRemarkText('')
        fetchUsers()
      }
    } catch (err: any) {
      setError(err.message || '分配积分失败')
    } finally {
      setIsGranting(false)
    }
  }

  const handleResetPassword = async (userId: string) => {
    if (!resetPasswordText || resetPasswordText.length < 6) {
      setError('新密码长度至少需要 6 个字符')
      return
    }
    setError(null)
    try {
      await authService.updateUser(userId, { resetPassword: resetPasswordText })
      setSuccess('已成功重置该用户密码！')
      setResettingUserId(null)
      setResetPasswordText('')
    } catch (err: any) {
      setError(err.message || '重置密码失败')
    }
  }

  const handleDeleteUser = async (targetUser: UserProfile) => {
    if (!confirm(`确定要注销并删除用户 "${targetUser.username}" 吗？此操作不可撤销。`)) {
      return
    }
    setError(null)
    try {
      await authService.deleteUser(targetUser.id)
      setSuccess(`已成功删除用户 "${targetUser.username}"`)
      fetchUsers()
    } catch (err: any) {
      setError(err.message || '删除用户失败')
    }
  }

  const handleCreateCoupons = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await authService.adminCreateCoupons({
        points: Number(couponPoints),
        count: Number(couponCount),
        maxUses: Number(couponMaxUses),
        description: couponDescription.trim() || undefined,
        customCode: couponCustomCode.trim() || undefined,
      })
      setSuccess(res.message || '成功生成优惠码！')
      setIsAddingCoupon(false)
      setCouponCustomCode('')
      setCouponDescription('')
      fetchCoupons()
    } catch (err: any) {
      setError(err.message || '生成优惠码失败')
    }
  }

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`确定要删除作废优惠码 [${code}] 吗？`)) return
    setError(null)
    try {
      const res = await authService.adminDeleteCoupon(code)
      setSuccess(res.message)
      fetchCoupons()
    } catch (err: any) {
      setError(err.message || '删除失败')
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  function getRoleBadge(role: UserRole) {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-3 w-3" /> 超级管理员
          </span>
        )
      case 'editor':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
            <Edit3 className="h-3 w-3" /> 研学助教
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
            <GraduationCap className="h-3 w-3" /> 学生只读
          </span>
        )
    }
  }

  function getRoleName(role: UserRole) {
    if (role === 'admin') return '超级管理员'
    if (role === 'editor') return '研学编辑'
    return '学生只读'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-4xl rounded-2xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">系统用户与积分总控中心</h2>
              <p className="text-xs text-slate-500">
                管理考生账号角色、权限沙箱、伴学积分分配与优惠兑换码发行
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200/80 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>成员账号与积分分配 ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'coupons'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="h-4 w-4 text-amber-600" />
            <span>优惠兑换码发行与管理 ({coupons.length})</span>
          </button>
        </div>

        {/* Global Feedback Alert */}
        {error && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700 animate-fade-in">
            <Check className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* TAB 1: 用户管理与积分分配 */}
        {activeTab === 'users' && (
          <>
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-600">系统成员列表</span>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>新增账号</span>
                </button>
              )}
            </div>

            {/* 新增用户抽屉 */}
            {isAdding && (
              <div className="mx-6 my-3 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4" /> 新建成员账号
                  </span>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    取消
                  </button>
                </div>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">用户名 *</label>
                    <input
                      type="text"
                      required
                      placeholder="登录用户名（唯一）"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">初始密码 *</label>
                    <input
                      type="password"
                      required
                      placeholder="至少 6 位密码"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">显示昵称</label>
                    <input
                      type="text"
                      placeholder="如：张三同学"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">角色权限 *</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="student">🎓 学生只读（可做题刷题/禁止修改知识库）</option>
                      <option value="editor">✍️ 研学编辑（可读写编辑笔记）</option>
                      <option value="admin">👑 超级管理员（全权控制）</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-sm cursor-pointer"
                    >
                      确认添加
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 用户列表 */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">正在载入用户数据...</div>
              ) : (
                users.map((u) => {
                  const isSelf = currentUser?.id === u.id
                  const isResetting = resettingUserId === u.id
                  const isGrantingThis = grantingUserId === u.id

                  return (
                    <div
                      key={u.id}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/60 shadow-2xs transition-all space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-700 font-bold text-sm shrink-0">
                            {u.displayName ? u.displayName.slice(0, 1).toUpperCase() : u.username.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">{u.displayName || u.username}</span>
                              <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-medium">
                                  当前账号
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-2 flex-wrap">
                              {getRoleBadge(u.role)}
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                <Coins className="h-3 w-3 text-amber-600" />
                                {(u.points ?? 5.0).toFixed(1)} 积分
                              </span>
                              <span className="text-[10px] text-slate-400">
                                创建于 {new Date(u.createdAt || '').toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 操作栏 */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* 角色调整 */}
                          <select
                            value={u.role}
                            disabled={isSelf}
                            onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                            className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                          >
                            <option value="student">学生只读</option>
                            <option value="editor">研学编辑</option>
                            <option value="admin">超级管理员</option>
                          </select>

                          {/* 分配积分按钮 */}
                          <button
                            onClick={() => {
                              setGrantingUserId(isGrantingThis ? null : u.id)
                              setResettingUserId(null)
                              setGrantAmountText('10')
                              setGrantRemarkText('')
                            }}
                            title="为用户分配/充值伴学积分"
                            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              isGrantingThis
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            <Coins className="h-3.5 w-3.5 text-amber-600" />
                            <span>分配积分</span>
                          </button>

                          {/* 重置密码按钮 */}
                          <button
                            onClick={() => {
                              setResettingUserId(isResetting ? null : u.id)
                              setGrantingUserId(null)
                              setResetPasswordText('')
                            }}
                            title="重置密码"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>

                          {/* 删除账号 */}
                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="删除账号"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 修复：分配积分内联面板 */}
                      {isGrantingThis && (
                        <div className="w-full pt-3 mt-1 border-t border-amber-200 bg-amber-50/70 p-3 rounded-xl space-y-2.5 animate-fade-in">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                            <span className="flex items-center gap-1.5">
                              <Coins className="h-4 w-4 text-amber-600" />
                              为「{u.displayName || u.username}」分配伴学积分
                            </span>
                            <span className="text-[11px] font-mono font-bold text-amber-800">
                              当前剩余: {(u.points ?? 5.0).toFixed(1)} 积分
                            </span>
                          </div>

                          {/* 快捷增减数值 */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-amber-800 font-medium">快捷调整:</span>
                            {[10, 20, 50, 100, -10, -50].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setGrantAmountText(String(num))}
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 cursor-pointer transition-colors shadow-2xs"
                              >
                                {num > 0 ? `+${num}` : num}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <div className="w-full sm:w-36 flex items-center rounded-lg border border-amber-300 bg-white px-2 py-1 shadow-2xs">
                              <span className="text-xs text-amber-700 font-bold mr-1">额度:</span>
                              <input
                                type="number"
                                step="0.1"
                                placeholder="如 +10"
                                value={grantAmountText}
                                onChange={(e) => setGrantAmountText(e.target.value)}
                                className="w-full text-xs font-mono font-bold text-slate-800 focus:outline-none"
                              />
                            </div>

                            <input
                              type="text"
                              placeholder="调整原因/充值备注 (例如: 模拟考优秀赠送)"
                              value={grantRemarkText}
                              onChange={(e) => setGrantRemarkText(e.target.value)}
                              className="flex-1 w-full rounded-lg border border-amber-300 bg-white px-3 py-1 text-xs text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
                            />

                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <button
                                onClick={() => handleGrantPoints(u.id)}
                                disabled={isGranting}
                                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                              >
                                {isGranting ? '提交中...' : '确认分配'}
                              </button>
                              <button
                                onClick={() => setGrantingUserId(null)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs hover:bg-slate-50 cursor-pointer"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 重置密码内联面板 */}
                      {isResetting && (
                        <div className="w-full mt-2 pt-2 border-t border-slate-200 flex items-center gap-2 animate-fade-in">
                          <input
                            type="password"
                            placeholder="输入新密码 (≥6位)"
                            value={resetPasswordText}
                            onChange={(e) => setResetPasswordText(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleResetPassword(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 cursor-pointer"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setResettingUserId(null)}
                            className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                          >
                            取消
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}

        {/* TAB 2: 优惠兑换码发行与管理 */}
        {activeTab === 'coupons' && (
          <>
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-600">优惠兑换码列表</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchCoupons}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer"
                  title="刷新列表"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                {!isAddingCoupon && (
                  <button
                    onClick={() => setIsAddingCoupon(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500 transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>发行新优惠码</span>
                  </button>
                )}
              </div>
            </div>

            {/* 新建/批量生成优惠码抽屉 */}
            {isAddingCoupon && (
              <div className="mx-6 my-3 p-4 rounded-xl border border-amber-200 bg-amber-50/50 animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Ticket className="h-4 w-4 text-amber-600" /> 发行研学伴学优惠兑换码
                  </span>
                  <button
                    onClick={() => setIsAddingCoupon(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    取消
                  </button>
                </div>

                <form onSubmit={handleCreateCoupons} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">每张积分面额 *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="如 10"
                      value={couponPoints}
                      onChange={(e) => setCouponPoints(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">批量生成张数 *</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={couponCount}
                      onChange={(e) => setCouponCount(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">单码可兑换人数 *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={couponMaxUses}
                      onChange={(e) => setCouponMaxUses(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 mb-1 font-medium">自定义券码 (单张时选填，留空则自动生成)</label>
                    <input
                      type="text"
                      placeholder="如：KAOYAN-2026-WIN"
                      value={couponCustomCode}
                      onChange={(e) => setCouponCustomCode(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 font-mono uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">活动备注/说明</label>
                    <input
                      type="text"
                      placeholder="如：考研冲刺赠礼"
                      value={couponDescription}
                      onChange={(e) => setCouponDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingCoupon(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-500 shadow-sm cursor-pointer"
                    >
                      立即批量生成
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 优惠码列表 */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2.5">
              {loadingCoupons ? (
                <div className="py-12 text-center text-xs text-slate-400">正在载入优惠码数据...</div>
              ) : coupons.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  暂无优惠码，点击上方按钮一键发行！
                </div>
              ) : (
                coupons.map((coupon) => {
                  const isExhausted = coupon.usedCount >= coupon.maxUses
                  return (
                    <div
                      key={coupon.code}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/60 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isExhausted
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <Ticket className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-slate-900 tracking-wider">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(coupon.code)}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                              title="复制兑换码"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                            {isExhausted ? (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500">
                                已用尽
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                有效
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                            <span>面额: <strong>+{coupon.points.toFixed(1)} 积分</strong></span>
                            <span>•</span>
                            <span>已兑: {coupon.usedCount} / {coupon.maxUses} 次</span>
                            {coupon.description && (
                              <>
                                <span>•</span>
                                <span className="text-slate-600">{coupon.description}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleCopyCode(coupon.code)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copiedCode === coupon.code ? '已复制' : '复制卡密'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.code)}
                          title="作废删除"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            <span>分配的积分与兑换码秒级入账，支持考生在 AI 伴学中畅聊与调用导师模型</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  )
}
