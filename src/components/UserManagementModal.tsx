import { useState, useEffect } from 'react'
import {
  X,
  Coins,
  PlusCircle,
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
} from 'lucide-react'
import type { UserProfile, UserRole } from '../types/auth'
import * as authService from '../services/auth'
import { useAuth } from '../contexts/AuthContext'

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const { user: currentUser } = useAuth()
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

  useEffect(() => {
    if (isOpen) {
      setError(null)
      setSuccess(null)
      setIsAdding(false)
      fetchUsers()
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
        setSuccess(`成功为用户分配积分 (${amount > 0 ? '+' : ''}${amount})，当前余额: ${res.points.toFixed(1)}`)
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

  function getRoleBadge(role: UserRole) {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="h-3 w-3" /> 超级管理员
          </span>
        )
      case 'editor':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Edit3 className="h-3 w-3" /> 研学编辑者
          </span>
        )
      case 'student':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <GraduationCap className="h-3 w-3" /> 学生只读
          </span>
        )
    }
  }

  function getRoleName(role: UserRole) {
    if (role === 'admin') return '超级管理员'
    if (role === 'editor') return '研学编辑者'
    return '学生只读'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">多用户与权限管理</h3>
              <p className="text-xs text-slate-500">分配管理员、编辑者与学生只读访问权限</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Banner */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            <Check className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            已注册账号 ({users.length})
          </span>
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

        {/* Add User Drawer */}
        {isAdding && (
          <div className="mx-6 my-3 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <UserPlus className="h-4 w-4" /> 新建成员账号
              </span>
              <button
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
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
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 shadow-sm"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        )}

        {/* User List */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">正在载入用户数据...</div>
          ) : (
            users.map((u) => {
              const isSelf = currentUser?.id === u.id
              const isResetting = resettingUserId === u.id

              return (
                <div
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-700 font-bold text-sm shrink-0">
                      {u.displayName ? u.displayName.slice(0, 1).toUpperCase() : u.username.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{u.displayName || u.username}</span>
                        <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                        {isSelf && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-medium">
                            当前账号
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {getRoleBadge(u.role)}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Coins className="h-3 w-3 text-amber-600" />
                          {(u.points ?? 5.0).toFixed(1)} 积分
                        </span>
                        <span className="text-[10px] text-slate-400">
                          创建于 {new Date(u.createdAt || '').toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Role Dropdown */}
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

                    {/* Grant Points Button */}
                    <button
                      onClick={() => {
                        setGrantingUserId(grantingUserId === u.id ? null : u.id)
                        setResettingUserId(null)
                        setGrantAmountText('10')
                        setGrantRemarkText('')
                      }}
                      title="为用户分配/充值伴学积分"
                      className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                    >
                      <Coins className="h-4 w-4" />
                    </button>

                    {/* Reset Password Button */}
                    <button
                      onClick={() => {
                        setResettingUserId(isResetting ? null : u.id)
                        setResetPasswordText('')
                      }}
                      title="重置密码"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>

                    {/* Delete User */}
                    {!isSelf && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        title="删除账号"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Reset Password Popover */}
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
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setResettingUserId(null)}
                        className="px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 text-xs"
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

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            <span>学生只读账号进入笔记编辑或结构整理时将自动开启防篡改只读锁</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-medium text-slate-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
