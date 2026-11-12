import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, Link, useLocation } from 'react-router-dom'
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
  ArrowLeft,
  Laptop, Search as IcSearch } from 'lucide-react'
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

  const location = useLocation()
  const fromPath = (location.state as any)?.from?.pathname || '/dashboard'

  // 如果已经处于登录态，直接跳转至原本目标路径或仪表盘
  if (isAuthenticated) {
    return <Navigate to={fromPath} replace />
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
      navigate(fromPath, { replace: true })
    } catch (err: any) {
      setError(err.message || '操作失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 subframe-landing-bg relative overflow-hidden font-sans text-slate-900">
      <div className="w-full max-w-[940px] relative z-10 animate-fade-in-up">
        {/* 返回官网与下载门户导航条 */}
        <div className="mb-4 flex items-center justify-between px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>返回产品官方首页与下载中心</span>
          </Link>
          <span className="text-2xs font-mono text-slate-600 bg-black/[0.04] px-2.5 py-0.5 rounded-full border border-black/[0.06]">
            v1.4.0 · Subframe UI
          </span>
        </div>

        {/* Subframe 标志性外框与卡片 */}
        <div className="rounded-2xl bg-slate-200 p-2 sm:p-3 shadow-[0_28px_70px_rgba(0,0,0,0.25)] border border-white/60 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
          {/* 左栏：核心登录与注册交互 */}
          <div className="lg:col-span-5 bg-slate-100 rounded-xl p-6 sm:p-7 flex flex-col justify-between text-left border border-white/70">
            <div>
              {/* Logo 标识 */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 28 28" fill="none">
                    <rect x="4" y="4" width="17" height="5.5" rx="1" fill="currentColor" />
                    <path d="M4 12.2H14.5L4 22.5V12.2Z" fill="currentColor" />
                    <circle cx="17.8" cy="17.8" r="3.4" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900">研核</span>
                </div>
              </div>

              {/* 标题 */}
              <h2 className="text-[22px] sm:text-[25px] leading-[1.18] tracking-[-0.03em] font-bold text-slate-900 mb-1">
                {isInitMode ? '初始化系统' : activeTab === 'register' ? '注册研学账号' : '登入研学空间'}
              </h2>
              <p className="text-xs text-slate-400 mb-5">
                408 计算机综合 & 考研数学 · 智能双核空间
              </p>

              {/* 错误提示 */}
              {error && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-700 animate-shake">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tab 切换 */}
              {!isInitMode && (
                <div className="mb-4 flex p-1 rounded-xl bg-slate-200 border border-black/[0.04]">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login')
                      setError(null)
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      activeTab === 'login'
                        ? 'bg-white text-slate-900 shadow-sm font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
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
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? 'bg-white text-slate-900 shadow-sm font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>注册新账号</span>
                  </button>
                </div>
              )}

              {/* 表单 */}
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      isInitMode
                        ? '管理员账号 (如 admin)'
                        : activeTab === 'register'
                        ? '用户名 (字母/数字，至少 3 位)'
                        : '请输入账号名称'
                    }
                    className="w-full py-2.5 px-3 rounded-lg bg-slate-200 text-slate-900 placeholder-slate-400 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                  />
                </div>

                {(isInitMode || activeTab === 'register') && (
                  <div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={isInitMode ? '显示昵称 (如：研核掌舵人)' : '显示昵称 (选填)'}
                      className="w-full py-2.5 px-3 rounded-lg bg-slate-200 text-slate-900 placeholder-slate-400 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                    />
                  </div>
                )}

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    autoComplete={activeTab === 'register' || isInitMode ? 'new-password' : 'current-password'}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="登录密码 (至少 6 位)"
                    className="w-full py-2.5 pl-3 pr-10 rounded-lg bg-slate-200 text-slate-900 placeholder-slate-400 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {!isInitMode && activeTab === 'register' && (
                  <div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      autoComplete="new-password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="请再次输入相同密码确认"
                      className="w-full py-2.5 px-3 rounded-lg bg-slate-200 text-slate-900 placeholder-slate-400 text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full mt-1 flex items-center justify-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] py-2.5 px-4 text-[13px] font-semibold text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span>正在处理...</span>
                  ) : (
                    <span>
                      {isInitMode
                        ? '创建管理员并登入'
                        : activeTab === 'register'
                        ? '完成注册并进入空间'
                        : '进入研学工作台'}
                    </span>
                  )}
                </button>
              </form>

              
            </div>

            <div className="pt-4 border-t border-slate-200 mt-4 text-2xs text-slate-400 leading-relaxed">
              自主注册账号默认具备只读学生研学权限，受防误删改保护。
            </div>
          </div>

          {/* 右栏：研学实景三栏画板缩略图 (Subframe Editor Preview) */}
          <div className="lg:col-span-7 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <div className="w-full bg-white rounded-xl shadow-[0_12px_34px_rgba(0,0,0,0.1)] border border-black/[0.08] overflow-hidden text-left select-none">
              <div className="h-8 px-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-2xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">Pages</span>
                  <span>Layers</span>
                  <span className="text-slate-900 font-semibold">+ 考点笔记</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <span>408 & 数学研学中枢</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-900 font-medium">双核驱动</span>
                </div>
              </div>

              <div className="grid grid-cols-12 h-[310px] bg-white text-2xs">
                {/* 笔记侧栏 */}
                <div className="col-span-4 border-r border-slate-200/80 p-2.5 bg-slate-50 flex flex-col gap-2">
                  <div className="px-2 py-1 rounded bg-white border border-slate-200 text-2xs text-slate-600 flex justify-between">
                    <span><IcSearch className="emoji-icon" aria-hidden="true" />检索知识点...</span>
                  </div>
                  <div className="space-y-1">
                    <div className="p-1.5 rounded border border-slate-200 bg-white font-medium text-slate-800 truncate">
                      408 错题归因本
                    </div>
                    <div className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 truncate">
                      泰勒展开与极值
                    </div>
                    <div className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 truncate">
                      SM-2 今日闪卡 (18)
                    </div>
                  </div>
                </div>

                {/* 画板区域 */}
                <div className="col-span-5 p-3 bg-white flex flex-col justify-between">
                  <div className="space-y-2 my-auto">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-2xs text-slate-600">
                      <div className="font-semibold text-slate-800 mb-0.5">高数定理 · Lagrange 中值定理</div>
                      <p className="text-slate-500 leading-relaxed">f(b) - f(a) = f&apos;(ξ)(b - a), ξ ∈ (a, b)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50/40 border-2 border-blue-500 text-2xs">
                      <div className="font-semibold text-slate-900 mb-0.5">408 计网 · TCP 拥塞避免</div>
                      <p className="text-slate-600">拥塞窗口 cwnd 线性递增 +1，超时触发乘法减半。</p>
                    </div>
                  </div>
                  <div className="text-2xs text-slate-400">已启用本地优先实时保存</div>
                </div>

                {/* 属性栏 */}
                <div className="col-span-3 border-l border-slate-200/80 p-2.5 bg-slate-50 text-2xs text-slate-600 space-y-2">
                  <div className="font-semibold text-slate-800 pb-1 border-b border-slate-200">研学统计</div>
                  <div>
                    <div className="text-slate-400">今日做题</div>
                    <div className="text-slate-800 font-bold">42 道</div>
                  </div>
                  <div>
                    <div className="text-slate-400">记忆闪卡</div>
                    <div className="text-slate-800 font-bold">128 张</div>
                  </div>
                  <div>
                    <div className="text-slate-400">倒计时</div>
                    <div className="text-indigo-600 font-bold font-mono">备考冲刺中</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部客户端下载指引 */}
        <div className="mt-4 text-center">
          <Link
            to="/#download"
            className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 transition-colors bg-white/60 px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs"
          >
            <Laptop className="h-3.5 w-3.5 text-slate-700" />
            <span>需要离线本地优先？前往官网一键下载 Windows 桌面端安装包</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
