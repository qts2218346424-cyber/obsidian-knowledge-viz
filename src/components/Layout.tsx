import { useEffect, useState, lazy, Suspense, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  AlertCircle,
  BookOpen,
  ClipboardList,
  ChevronDown,
  FileEdit,
  GraduationCap,
  Home,
  Landmark,
  Languages,
  LayoutGrid,
  MessageCircle,
  Music,
  Network,
  PenLine,
  Search,
  Settings,
  Timer,
  Workflow,
  X,
  Database,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import { useVaultStats, useApiHealth } from '../hooks/useVaultData'
import { useVaultEvents } from '../hooks/useVaultEvents'
import DesktopPet from './Pet/DesktopPet'
import { useAuth } from '../contexts/AuthContext'
import UserManagementModal from './UserManagementModal'
import UserGuideModal from './UserGuideModal'
import { HelpCircle } from 'lucide-react'
import { LogOut, Users as UsersIcon, ShieldAlert as ShieldAlertIcon } from 'lucide-react'
import { prefetchRoute } from '../App'

const SearchModal = lazy(() => import('./SearchModal'))
const AIAssistantModal = lazy(() => import('./AIAssistantModal'))
const ImportResourceModal = lazy(() => import('./ImportResourceModal'))
const MobileDeviceModal = lazy(() => import('./MobileDeviceModal'))
const QuickNoteDrawer = lazy(() => import('./QuickNoteDrawer'))

interface NavItem {
  to: string
  label: string
  shortLabel?: string
  icon: any
  emoji: string
  badge?: string
  desc?: string
}

const primaryNavItems: NavItem[] = [
  { to: '/dashboard', label: '首页', shortLabel: '首页', icon: Home, emoji: '🏠', desc: '备考驾驶舱与每日概览' },
  { to: '/quiz', label: '做题中心', shortLabel: '刷题', icon: ClipboardList, emoji: '📝', badge: '408+数学', desc: '真题精练、AI 组卷与错题本' },
  { to: '/history', label: '政治史纲', shortLabel: '史纲', icon: Landmark, emoji: '🏛️', badge: '时空轴', desc: '拖动时间轴看历年事件与政治会议' },
  { to: '/study', label: '学习中心', shortLabel: '学习', icon: GraduationCap, emoji: '📚', desc: '讲义精读、闪卡记忆与掌握度' },
  { to: '/graph', label: '知识图谱', shortLabel: '图谱', icon: Network, emoji: '🕸️', desc: '全库双链网络可视化探索' },
  { to: '/editor', label: '笔记编辑', shortLabel: '笔记', icon: FileEdit, emoji: '✏️', desc: 'Markdown 写作与手写批注' },
  { to: '/chat', label: 'AI 伴学', shortLabel: '伴学', icon: MessageCircle, emoji: '💬', desc: '多智能体导师答疑与推导' },
]

const moreNavItems: NavItem[] = [
  { to: '/workflow', label: '知识库整理', shortLabel: '整理', icon: Workflow, emoji: '🧭', desc: '质检、标签治理与结构优化' },
  { to: '/vocabulary', label: '考研英语词汇', shortLabel: '词汇', icon: Languages, emoji: '📖', desc: '核心高频大纲词汇复盘' },
  { to: '/pomodoro', label: '专注番茄钟', shortLabel: '番茄钟', icon: Timer, emoji: '🍅', desc: '心流沉浸与时间切片' },
  { to: '/music', label: '声学专注氛围', shortLabel: '白噪音', icon: Music, emoji: '🎵', desc: '双耳节拍与白噪音音频' },
  { to: '/settings', label: '全局系统设置', shortLabel: '设置', icon: Settings, emoji: '⚙️', desc: '知识库路径与 AI 服务模型' },
]

const allNavItems = [...primaryNavItems, ...moreNavItems]

interface LayoutProps {
  children: ReactNode
}

function navClass(isActive: boolean) {
  return `relative inline-flex items-center gap-1.5 rounded-xl px-2.5 2xl:px-3 py-1.5 text-[13px] font-medium transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange ${
    isActive
      ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20'
      : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
  }`
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const currentPage = allNavItems.find(item => location.pathname === item.to)
  const isFullHeightPage = ['/chat', '/editor', '/graph'].includes(location.pathname)
  const apiHealthy = useApiHealth()
  const { stats } = useVaultStats()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [syncNotice, setSyncNotice] = useState<string | null>(null)
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)
  const { user, isAdmin, isStudent, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userManagementOpen, setUserManagementOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  const noteCount = stats?.totalNotes ?? null
  const connected = apiHealthy === true
  const vaultName = stats?.vaultPath.split(/[\\/]/).filter(Boolean).pop() || '研核知识库'

  useVaultEvents((event) => {
    const action = event.type === 'file-changed' ? '文件已更新' : event.type === 'file-added' ? '新笔记加入' : '文件已删除'
    setSyncNotice(`${action}：${event.path.split('/').pop()}`)
    setTimeout(() => setSyncNotice(null), 3000)
  })

  useEffect(() => {
    const onOpenQuickNote = () => setQuickNoteOpen(true)
    window.addEventListener('open-quick-note', onOpenQuickNote)
    const onOpenGuide = () => setGuideOpen(true)
    window.addEventListener('open-user-guide', onOpenGuide)

    // 新用户首次登录智能唤起指引
    try {
      const dismissed = localStorage.getItem('coreforge_onboarding_dismissed')
      if (!dismissed) {
        const timer = setTimeout(() => setGuideOpen(true), 1200)
        return () => clearTimeout(timer)
      }
    } catch {}
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(previous => !previous)
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        setAssistantOpen(previous => !previous)
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('open-quick-note', onOpenQuickNote)
      window.removeEventListener('open-user-guide', onOpenGuide)
    }
  }, [])

  useEffect(() => {
    document.title = `${currentPage?.label || '首页'} · ${vaultName} | CoreForge 研核 (408 + 考研数学)`
    setMobileNavOpen(false)
    setMoreOpen(false)

    // 核心研学空间后台闲时预取 (Idle Route Prefetching)
    // 利用空闲网络带宽提前将「做题中心」与「学习中心」缓存到浏览器，消除点击等待
    const idleHandler =
      (window as any).requestIdleCallback?.((deadline: any) => {
        prefetchRoute('/quiz')
        prefetchRoute('/study')
        if (deadline.timeRemaining() > 10) {
          prefetchRoute('/editor')
        }
      }) ??
      setTimeout(() => {
        prefetchRoute('/quiz')
        prefetchRoute('/study')
      }, 700)

    return () => {
      if ((window as any).cancelIdleCallback && typeof idleHandler === 'number') {
        ;(window as any).cancelIdleCallback(idleHandler)
      } else {
        clearTimeout(idleHandler)
      }
    }
  }, [currentPage?.label, vaultName, location.pathname])

  const mobileBottomTabs = [
    { to: '/dashboard', label: '首页', icon: Home },
    { to: '/quiz', label: '刷题', icon: ClipboardList },
    { to: '/study', label: '学习', icon: GraduationCap },
    { to: '/editor', label: '笔记', icon: FileEdit },
    { to: '/chat', label: '伴学', icon: MessageCircle },
  ]

  return (
    <div className="min-h-dvh aurora-mesh text-slate-900 selection:bg-accent-orange/20 selection:text-accent-orange font-sans antialiased">
      {/* Top Global Header */}
      <header className="sticky top-0 z-40 bg-white/90 glass-header border-b border-slate-200/80 pt-[env(safe-area-inset-top,0px)]">
        <div className="mx-auto flex h-13 sm:h-14 max-w-[1520px] items-center gap-2 sm:gap-3 px-3 sm:px-6">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2 sm:gap-2.5 rounded-xl outline-none group select-none">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-slate-950 p-1 shadow-sm shadow-indigo-500/20 ring-1 ring-slate-900/10 transition-all group-hover:scale-105 shrink-0">
              <img src="/favicon.svg" alt="研核图标" className="h-full w-full object-contain" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[15px] font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                CoreForge
              </span>
              <span className="text-xs font-bold text-indigo-600 whitespace-nowrap">研核</span>
              {currentPage && currentPage.to !== '/dashboard' ? (
                <span className="xl:hidden inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 truncate max-w-[96px]">
                  {currentPage.shortLabel || currentPage.label}
                </span>
              ) : (
                <span className="hidden sm:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/70 whitespace-nowrap shrink-0">
                  408+数学 双核
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Primary Navigation */}
          <nav className="ml-2 2xl:ml-4 hidden flex-1 items-center justify-center gap-0.5 2xl:gap-1 xl:flex shrink-0 min-w-0" aria-label="主导航">
            {primaryNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onPointerEnter={() => prefetchRoute(item.to)}
                onTouchStart={() => prefetchRoute(item.to)}
                className={({ isActive }) => navClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap shrink-0">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${
                        isActive ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* More Tools Dropdown */}
            <div className="relative ml-0.5 shrink-0">
              <button
                onClick={() => setMoreOpen(previous => !previous)}
                className={navClass(moreOpen || moreNavItems.some(item => item.to === location.pathname))}
                aria-expanded={moreOpen}
              >
                <span className="whitespace-nowrap shrink-0">更多工具</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200/80 bg-white/98 p-2 shadow-[0_20px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl animate-fade-in-up">
                    <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">研学辅助工具</p>
                    {moreNavItems.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onPointerEnter={() => prefetchRoute(item.to)}
                        onTouchStart={() => prefetchRoute(item.to)}
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-xs transition-colors whitespace-nowrap ${
                          isActive ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base shrink-0">{item.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-800">{item.label}</div>
                          {item.desc && <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>}
                        </div>
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right Utility Toolbar */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* User Guide Showcase Trigger */}
            <button
              onClick={() => setGuideOpen(true)}
              aria-label="新手使用指引"
              title="查看研核全景使用指南与视频巡礼"
              className="inline-flex h-10 w-10 sm:h-8 sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200/80 sm:px-2.5 text-indigo-700 text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 shadow-2xs"
            >
              <HelpCircle className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">新手指引</span>
            </button>
            <button
              onClick={() => setQuickNoteOpen(true)}
              aria-label="随手记"
              title="极速随手记入库"
              className="inline-flex h-10 w-10 sm:h-8 sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-indigo-50/90 hover:bg-indigo-100/90 border border-indigo-200/80 sm:px-2.5 text-indigo-700 text-xs font-semibold transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <PenLine className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">随手记</span>
            </button>

            <button
              onClick={() => setMobileModalOpen(true)}
              aria-label="多端连线"
              title="手机/平板连线 (扫码/PWA)"
              className="hidden lg:inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 px-2.5 text-emerald-700 text-xs font-semibold hover:bg-emerald-100/80 transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
            >
              <Smartphone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="hidden 2xl:inline">多端连线</span>
            </button>

            <button
              onClick={() => setImportModalOpen(true)}
              aria-label="导入资料与题库"
              title="导入资料与题库 (PDF/教材/真题)"
              className="hidden lg:inline-flex h-8 items-center gap-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 px-2.5 text-slate-700 text-xs font-semibold hover:bg-slate-200/70 transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
            >
              <Database className="h-3.5 w-3.5 text-slate-600 shrink-0" />
              <span className="hidden 2xl:inline">导入资料</span>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              aria-label="全局检索"
              title="搜索知识库（Ctrl+K）"
              className="inline-flex h-10 w-10 sm:h-8 sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 sm:px-2.5 2xl:px-3 text-slate-600 transition-all hover:border-indigo-300 hover:bg-white hover:text-slate-900 shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
            >
              <Search className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-slate-500 shrink-0" />
              <span className="hidden 2xl:inline text-xs text-slate-600">搜索知识...</span>
              <kbd className="hidden rounded bg-slate-100 border border-slate-200/90 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-500 md:inline shrink-0">Ctrl K</kbd>
            </button>

            {/* Live Vault Status Beacon (Desktop) */}
            <div className="hidden items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs text-slate-600 shadow-2xs md:flex whitespace-nowrap shrink-0" title={vaultName}>
              <span className="relative flex h-2 w-2 shrink-0">
                {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </span>
              <span className="hidden max-w-28 truncate font-medium text-[11px] text-slate-700 2xl:inline">
                {connected ? `${noteCount ?? ''} 篇在线` : '离线'}
              </span>
            </div>

            <Link
              to="/settings"
              aria-label="系统设置"
              title="系统设置"
              className="hidden h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 shadow-2xs xl:inline-flex cursor-pointer active:scale-95 shrink-0"
            >
              <Settings className="h-4 w-4 shrink-0" />
            </Link>

            {/* User Profile & Role Dropdown */}
            {user && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/90 px-2 text-slate-700 shadow-2xs hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
                  title={`${user.displayName || user.username} (${user.role === 'admin' ? '管理员' : user.role === 'editor' ? '助教编辑' : '学生只读'})`}
                >
                  <div className={`flex h-5 w-5 items-center justify-center rounded-lg text-[10px] font-bold text-white ${
                    user.role === 'admin' ? 'bg-indigo-600' : user.role === 'editor' ? 'bg-amber-600' : 'bg-emerald-600'
                  }`}>
                    {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : user.username.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold max-w-[80px] truncate text-slate-800">
                    {user.displayName || user.username}
                  </span>
                  <span className={`hidden md:inline-flex text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    user.role === 'admin'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : user.role === 'editor'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {user.role === 'admin' ? '管理员' : user.role === 'editor' ? '编辑者' : '只读'}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl animate-fade-in-up">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{user.displayName || user.username}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">@{user.username}</div>
                        <div className="mt-1.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            user.role === 'admin'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : user.role === 'editor'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {user.role === 'admin' ? '👑 超级管理员' : user.role === 'editor' ? '✍️ 研学编辑者' : '🎓 学生只读模式'}
                          </span>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            setUserManagementOpen(true)
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
                        >
                          <UsersIcon className="h-4 w-4" />
                          <span>多用户权限管理</span>
                        </button>
                      )}

                      {/* 空间与沙箱归属状态指示 */}
                      <div className="px-3 py-2 my-1 rounded-xl bg-slate-50/90 border border-slate-200/80 text-[10px] space-y-1.5">
                        <div className="flex items-center justify-between text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700">📁 笔记工作空间</span>
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200">● 系统核心主库 (本地同步)</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">● 个人独立沙箱</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700">🧠 专属 AI 记忆</span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-200">
                            {isAdmin ? '● 全局导师 agent.md' : '● 私人独立 agent.md'}
                          </span>
                        </div>
                      </div>

                      {isStudent && (
                        <div className="px-3 py-1.5 my-1 rounded-xl bg-amber-50/80 border border-amber-200/60 text-[10px] text-amber-800 flex items-center gap-1.5">
                          <ShieldAlertIcon className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                          <span>公共考研核心库开启防篡改只读守卫</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>退出当前账号</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile App Center Sheet Trigger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="打开全站工具抽屉"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 transition-all hover:bg-slate-50 active:scale-95 xl:hidden shadow-2xs cursor-pointer"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </button>
          </div>
        </div>
      </header>
      <UserManagementModal isOpen={userManagementOpen} onClose={() => setUserManagementOpen(false)} />
      <UserGuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* Mobile Full-Featured Bottom Sheet Navigation */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end xl:hidden bg-slate-950/45 backdrop-blur-xs modal-backdrop-contain"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl shadow-2xl border-t border-slate-200/80 max-h-[86dvh] flex flex-col animate-sheet-up overflow-hidden"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Sheet Header */}
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-extrabold text-slate-900">全站导航与工具箱</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                  <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {noteCount !== null ? `${noteCount} 篇笔记` : '连接中'}
                </span>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 active:scale-95"
                aria-label="关闭菜单"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Sheet Content */}
            <div className="p-4 overflow-y-auto modal-scroll-contain space-y-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {/* Quick Actions Bar */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setMobileNavOpen(false)
                    setQuickNoteOpen(true)
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-indigo-50/90 border border-indigo-200/70 p-3 text-indigo-700 active:scale-95 transition-transform"
                >
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold">随手速记</span>
                </button>
                <button
                  onClick={() => {
                    setMobileNavOpen(false)
                    setImportModalOpen(true)
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-blue-50/80 border border-blue-200/70 p-3 text-blue-700 active:scale-95 transition-transform"
                >
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold">导入资料</span>
                </button>
                <button
                  onClick={() => {
                    setMobileNavOpen(false)
                    setMobileModalOpen(true)
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 p-3 text-emerald-700 active:scale-95 transition-transform"
                >
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold">多端扫码</span>
                </button>
              </div>

              {/* Core Modules */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">核心研学空间</div>
                <div className="grid grid-cols-2 gap-2">
                  {primaryNavItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onPointerEnter={() => prefetchRoute(item.to)}
                      onTouchStart={() => prefetchRoute(item.to)}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) => `flex items-center gap-2.5 rounded-2xl border p-3 transition-all active:scale-[0.98] ${
                        isActive
                          ? 'border-indigo-500/40 bg-indigo-50/80 text-indigo-900 shadow-2xs'
                          : 'border-slate-200/80 bg-slate-50/50 text-slate-700 hover:bg-slate-100/70'
                      }`}
                    >
                      <span className="text-lg shrink-0">{item.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{item.label}</div>
                        {item.desc && <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</div>}
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Utility Modules */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">效率工具与系统</div>
                <div className="grid grid-cols-2 gap-2">
                  {moreNavItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onPointerEnter={() => prefetchRoute(item.to)}
                      onTouchStart={() => prefetchRoute(item.to)}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) => `flex items-center gap-2.5 rounded-2xl border p-3 transition-all active:scale-[0.98] ${
                        isActive
                          ? 'border-indigo-500/40 bg-indigo-50/80 text-indigo-900 shadow-2xs'
                          : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg shrink-0">{item.emoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{item.label}</div>
                        {item.desc && <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</div>}
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>

              {/* Vault Info Footer */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200/70 px-3.5 py-2.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 truncate">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">当前库：{vaultName}</span>
                </span>
                <span className="text-emerald-600 font-semibold shrink-0">实时同步中</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`mx-auto max-w-[1600px] ${
        isFullHeightPage
          ? 'h-[calc(100dvh-3.25rem-env(safe-area-inset-top,0px))] sm:h-[calc(100dvh-3.5rem-env(safe-area-inset-top,0px))] overflow-hidden flex flex-col pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] xl:pb-0'
          : 'min-h-[calc(100dvh-3.25rem)] pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] xl:pb-8'
      }`}>
        {syncNotice && (
          <div className="fixed right-3 sm:right-5 top-[4rem] z-30 flex items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-3.5 py-1.5 text-xs font-medium text-emerald-700 shadow-lg backdrop-blur-xl animate-fade-in-up">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[240px]">{syncNotice}</span>
          </div>
        )}
        <div className={`min-w-0 ${
          isFullHeightPage
            ? 'flex-1 h-full min-h-0 p-0 sm:px-4 sm:py-2.5 overflow-hidden flex flex-col'
            : 'px-3.5 py-3.5 sm:px-6 sm:py-6 lg:px-8 lg:py-7'
        }`}>
          {children}
        </div>
      </main>

      {/* Mobile Native-Grade Bottom Tab Bar */}
      <nav
        aria-label="移动端底部导航"
        className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 border-t border-slate-200/85 px-1.5 pt-1 flex items-center justify-around shadow-[0_-4px_24px_rgba(15,23,42,0.05)] backdrop-blur-2xl pb-[max(0.4rem,env(safe-area-inset-bottom))]"
      >
        {mobileBottomTabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            onPointerEnter={() => prefetchRoute(tab.to)}
            onTouchStart={() => prefetchRoute(tab.to)}
            className="flex flex-col items-center justify-center flex-1 min-w-[56px] py-0.5 select-none group cursor-pointer"
          >
            {({ isActive }) => (
              <>
                <div
                  className={`relative flex items-center justify-center w-12 h-7 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 group-active:scale-90'
                  }`}
                >
                  <tab.icon className="h-[18px] w-[18px]" />
                </div>
                <span
                  className={`text-[10.5px] tracking-tight mt-0.5 transition-colors ${
                    isActive ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'
                  }`}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Floating Desktop Companion Pet */}
      {location.pathname !== '/chat' && <DesktopPet />}

      <Suspense fallback={null}>
        {searchOpen && <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
        {assistantOpen && <AIAssistantModal isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} pagePath={location.pathname} />}
        {importModalOpen && <ImportResourceModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />}
        {mobileModalOpen && <MobileDeviceModal isOpen={mobileModalOpen} onClose={() => setMobileModalOpen(false)} />}
        {quickNoteOpen && <QuickNoteDrawer isOpen={quickNoteOpen} onClose={() => setQuickNoteOpen(false)} />}
      </Suspense>
    </div>
  )
}
