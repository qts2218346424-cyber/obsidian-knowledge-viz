import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  UserPlus,
  LogIn,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { isAuthenticated, initialized, login, register, initAdmin, isLoading } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 如果已经处于登录态，直接跳转至仪表盘
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const isInitMode = !initialized

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError('请输入账号名称')
      return
    }
    if (username.trim().length < 3) {
      setError('账号名称长度至少需要 3 个字符')
      return
    }
    if (!password) {
      setError('请输入密码')
      return
    }
    if (password.length < 6) {
      setError('密码长度至少需要 6 个字符')
      return
    }

    if (!isInitMode && activeTab === 'register') {
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致，请核对')
        return
      }
    }

    setSubmitting(true)
    try {
      if (isInitMode) {
        await initAdmin(username.trim(), password, displayName.trim() || undefined)
      } else if (activeTab === 'register') {
        await register(username.trim(), password, displayName.trim() || undefined)
      } else {
        await login(username.trim(), password)
      }
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || '操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 relative overflow-hidden font-sans">
      {/* 背景动态装饰微光 */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* 系统品牌 LOGO 与名称 */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-xl shadow-indigo-500/10 p-2.5 mb-4 group transition-transform hover:scale-105">
            <img src="/favicon.svg" alt="研核图标" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            CoreForge <span className="text-indigo-400">研核</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            408 & 考研数学 · 知识库智能研学空间
          </p>
        </div>

        {/* 核心登录/注册卡片 */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-black/40">
          {/* 首航初始化管理员专属标头 */}
          {isInitMode ? (
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  初始化超级管理员
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  检测到系统首次启动，请创建掌舵管理员账户
                </p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                首航配置
              </span>
            </div>
          ) : (
            /* 已有用户时的 登录 / 注册 Tab 切换栏 */
            <div className="mb-6 flex p-1 rounded-2xl bg-slate-950/60 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login')
                  setError(null)
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>账户登录</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register')
                  setError(null)
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>注册研学账号</span>
              </button>
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 用户名 */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                账号名称
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    isInitMode
                      ? '如：admin'
                      : activeTab === 'register'
                      ? '支持字母与数字，至少 3 位'
                      : '请输入用户名'
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* 昵称输入（注册模式或首次初始化可见） */}
            {(isInitMode || activeTab === 'register') && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  显示昵称（选填）
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={isInitMode ? '如：研核掌舵人' : '如：考研学子小明'}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* 密码 */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                登录密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位密码"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 注册模式下的确认密码 */}
            {!isInitMode && activeTab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  确认密码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入相同密码"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>
                    {isInitMode
                      ? '正在创建管理员...'
                      : activeTab === 'register'
                      ? '正在注册账号...'
                      : '正在登录验证...'}
                  </span>
                </>
              ) : (
                <>
                  {isInitMode ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>创建管理员并进入系统</span>
                    </>
                  ) : activeTab === 'register' ? (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>注册并直接登入</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>进入研学空间</span>
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* 权限说明 */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-start gap-2.5 text-slate-400 text-xs leading-relaxed">
              <BookOpen className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-300">
                  {activeTab === 'register' ? '自主注册须知：' : '多用户权限规则：'}
                </p>
                {activeTab === 'register' ? (
                  <p className="mt-1 text-slate-400 text-[11px]">
                    自主注册的账户将自动获得 <strong className="text-emerald-300">学生只读 (Student)</strong> 权限，可立即查阅笔记、图谱并进行真题自测与闪卡复习。如需参与笔记协作，可联系管理员升级为编辑者。
                  </p>
                ) : (
                  <ul className="mt-1 space-y-0.5 list-disc list-inside text-slate-400 text-[11px]">
                    <li><strong className="text-indigo-300">超级管理员</strong>：具有全权读写、用户开户与知识库设置权限。</li>
                    <li><strong className="text-emerald-300">学生只读</strong>：可研学做题，受系统防误删改保护。</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
