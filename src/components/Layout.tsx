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
  Coins,
} from 'lucide-react'
import { useVaultStats, useApiHealth } from '../hooks/useVaultData'
import { useVaultEvents } from '../hooks/useVaultEvents'
import DesktopPet from './Pet/DesktopPet'
import { useAuth } from '../contexts/AuthContext'
import UserManagementModal from './UserManagementModal'
import UserGuideModal from './UserGuideModal'
import CheckinModal from './CheckinModal'
import InteractiveTourGuide from './InteractiveTourGuide'
import { HelpCircle, Compass } from 'lucide-react'
import { LogOut, Users as UsersIcon, ShieldAlert as ShieldAlertIcon } from 'lucide-react'
import { prefetchRoute } from '../App'
import { useUIModalStore } from '../shared/store/useUIModalStore'

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
  { to: '/politics', label: '考研政治', shortLabel: '政治', icon: Landmark, emoji: '🏛️', badge: '史纲+1000题', desc: '全屏时空轴、肖秀荣1000题与考点收藏' },
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
  return `relative inline-flex items-center gap-1.5 rounded-lg px-2 2xl:px-2.5 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
    isActive
      ? 'bg-neutral-900 text-white shadow-xs'
      : 'text-neutral-600 hover:bg-neutral-100/90 hover:text-neutral-900'
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
  const { activeModals, openModal, closeModal } = useUIModalStore()
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [syncNotice, setSyncNotice] = useState<string | null>(null)
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)
  const { user, isAdmin, isStudent, logout, points, canCheckinToday } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userManagementOpen, setUserManagementOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [interactiveTourOpen, setInteractiveTourOpen] = useState(false)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [checkinTab, setCheckinTab] = useState<'checkin' | 'redeem' | 'recharge' | 'logs'>('checkin')

  const noteCount = stats?.totalNotes ?? null
  const connected = apiHealthy === true
  const vaultName = stats?.vaultPath.split(/[\\/]/).filter(Boolean).pop() || '研核知识库'

  useVaultEvents((event) => {
    const action = event.type === 'file-changed' ? '文件已更新' : event.type === 'file-added' ? '新笔记加入' : '文件已删除'
    setSyncNotice(`${action}：${event.path.split('/').pop()}`)
    setTimeout(() => setSyncNotice(null), 3000)
  })

  useEffect(() => {
    const onOpenQuickNote = () => openModal('quick-note')
    window.addEventListener('open-quick-note', onOpenQuickNote)
    const onOpenGuide = () => openModal('user-guide')
    window.addEventListener('open-user-guide', onOpenGuide)
    const onStartTour = () => setInteractiveTourOpen(true)
    window.addEventListener('start-interactive-tour', onStartTour)
    const onOpenCheckin = (e?: Event) => {
      const custom = e as CustomEvent<{ tab?: 'checkin' | 'redeem' | 'recharge' | 'logs' }>
      if (custom?.detail?.tab) {
        setCheckinTab(custom.detail.tab)
      } else {
        setCheckinTab('checkin')
      }
      openModal('checkin')
    }
    window.addEventListener('open-checkin-modal', onOpenCheckin)

    // 新用户首次登录智能唤起指引
    try {
      const dismissed = localStorage.getItem('coreforge_onboarding_dismissed')
      if (!dismissed) {
        const timer = setTimeout(() => openModal('user-guide'), 1200)
        return () => clearTimeout(timer)
      }
    } catch {}
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (activeModals['search']) {
          closeModal('search')
        } else {
          openModal('search')
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        if (activeModals['ai-assistant']) {
          closeModal('ai-assistant')
        } else {
          openModal('ai-assistant')
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('open-quick-note', onOpenQuickNote)
      window.removeEventListener('open-user-guide', onOpenGuide)
      window.removeEventListener('start-interactive-tour', onStartTour)
      window.removeEventListener('open-checkin-modal', onOpenCheckin)
    }
  }, [openModal, closeModal, activeModals])

  useEffect(() => {
    document.title = '研核'
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
        <div className="mx-auto flex h-13 sm:h-14 max-w-[1600px] items-center gap-2 2xl:gap-3 px-3 sm:px-5">
          {/* Logo & Subframe Pill */}
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2 rounded-xl outline-none group select-none shrink-0">
            <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center overflow-hidden rounded-lg bg-neutral-950 p-1 shadow-2xs ring-1 ring-neutral-900/10 transition-transform group-hover:scale-105 shrink-0">
              <img src="/favicon.svg" alt="研核图标" className="h-full w-full object-contain" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[14px] sm:text-[15px] font-bold tracking-tight text-neutral-900 whitespace-nowrap">
                研核
              </span>
              <div 
                className="hidden sm:inline-flex items-center gap-1.5 subframe-pill text-[10.5px] px-2 py-0.5"
                title={connected ? `知识库已连接：共 ${noteCount ?? 0} 篇笔记` : '知识库离线'}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="truncate max-w-[80px] 2xl:max-w-[110px] hidden md:inline">
                  {connected ? `${noteCount ?? ''} 篇在线` : '离线'}
                </span>
              </div>
            </div>
          </Link>

          {/* Subframe Pill Primary Navigation */}
          <nav className="ml-1 2xl:ml-3 hidden flex-1 items-center justify-center gap-0.5 2xl:gap-1 xl:flex shrink-0 min-w-0" aria-label="主导航">
            {primaryNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onPointerEnter={() => prefetchRoute(item.to)}
                onTouchStart={() => prefetchRoute(item.to)}
                className={({ isActive }) => navClass(isActive)}
                title={item.desc}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span className="whitespace-nowrap shrink-0">{item.label}</span>
                    {item.badge && (
                      <span className={`hidden 2xl:inline-block text-[9.5px] px-1.5 py-0.2 rounded-md font-medium tracking-tight whitespace-nowrap shrink-0 ${
                        isActive ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200/80'
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
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div className="absolute left-0 top-full z-50 mt-1.5 w-60 rounded-xl border border-neutral-200/90 bg-white/98 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-fade-in-up">
                    <p className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">研学辅助工具</p>
                    {moreNavItems.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onPointerEnter={() => prefetchRoute(item.to)}
                        onTouchStart={() => prefetchRoute(item.to)}
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap ${
                          isActive ? 'bg-neutral-100 font-semibold text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        <span className="text-sm shrink-0">{item.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-medium text-neutral-800">{item.label}</div>
                          {item.desc && <div className="text-[10px] text-neutral-400 truncate">{item.desc}</div>}
                        </div>
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          </nav>

          {/* Right Utility Toolbar (Subframe Style) */}
          <div className="ml-auto flex items-center gap-1.5 2xl:gap-2 shrink-0">
            {/* Subframe Search Pill Input Trigger */}
            <button
              onClick={() => {
                setSearchOpen(true)
                openModal('search')
              }}
              aria-label="全局检索"
              title="搜索知识库（快捷键 Ctrl+K）"
              className="subframe-search-pill cursor-pointer select-none h-8 px-2 sm:px-2.5 gap-1.5"
            >
              <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span className="hidden md:inline text-xs text-neutral-500 font-normal">搜索...</span>
              <kbd className="hidden lg:inline-flex items-center text-[9px] font-mono text-neutral-400 bg-neutral-200/70 border border-neutral-300/60 rounded px-1 py-0.2 shrink-0">
                Ctrl K
              </kbd>
            </button>

            {/* 随手记高频快捷操作 */}
            <button
              onClick={() => {
                setQuickNoteOpen(true)
                openModal('quick-note')
              }}
              aria-label="随手记"
              title="极速随手记入库"
              className="subframe-btn-secondary h-8 px-2 2xl:px-2.5 text-xs cursor-pointer select-none gap-1.5 shrink-0"
            >
              <PenLine className="h-3.5 w-3.5 text-neutral-600 shrink-0" />
              <span className="hidden sm:inline font-medium">随手记</span>
            </button>

            {/* 轻量辅助工具组（导入、指引、系统设置） */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  setImportModalOpen(true)
                  openModal('import-resource')
                }}
                aria-label="导入资料与题库"
                title="导入资料与题库 (PDF/教材/真题)"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-neutral-200/90 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                <Database className="h-3.5 w-3.5 shrink-0" />
              </button>

              <button
                onClick={() => {
                  setGuideOpen(true)
                  openModal('user-guide')
                }}
                aria-label="新手使用指引"
                title="查看研核全景使用指南与快捷键"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-neutral-200/90 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                <HelpCircle className="h-3.5 w-3.5 shrink-0" />
              </button>

              <Link
                to="/settings"
                aria-label="系统设置"
                title="全局系统设置"
                className="hidden xl:inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/90 bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 shadow-2xs cursor-pointer active:scale-95 transition-all"
              >
                <Settings className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </div>

            <div className="hidden sm:block h-3.5 w-[1px] bg-neutral-200/80 mx-0.5" />

            {/* AI 伴学积分胶囊与签到入口 */}
            {user && (
              <button
                onClick={() => {
                  setCheckinOpen(true)
                  openModal('checkin')
                }}
                className="relative inline-flex h-8 items-center gap-1.5 rounded-xl border border-amber-200/90 bg-amber-50/80 px-2 2xl:px-2.5 text-amber-900 shadow-2xs hover:bg-amber-100/90 transition-all cursor-pointer active:scale-95 shrink-0"
                title="AI 伴学积分中心 (点击每日签到领积分)"
              >
                <Coins className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-xs font-bold font-mono text-amber-950">
                  {points.toFixed(1)}
                </span>
                <span className="hidden 2xl:inline text-[11px] text-amber-700 font-medium">积分</span>
                {canCheckinToday && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </button>
            )}

            {/* User Profile (Subframe Round Avatar) */}
            {user && (
              <div className="relative shrink-0">
                <button
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-1.5 rounded-full p-0.5 border border-neutral-200/80 hover:ring-2 hover:ring-neutral-200 transition-all cursor-pointer active:scale-95"
                  title={`${user.displayName || user.username} (${user.role === 'admin' ? '管理员' : '编辑者'})`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white bg-emerald-600 shadow-2xs">
                    {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : user.username.slice(0, 1).toUpperCase()}
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-neutral-200/90 bg-white p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] animate-fade-in-up">
                      <div className="px-3 py-2 border-b border-neutral-100 mb-1">
                        <div className="text-xs font-semibold text-neutral-900 truncate">{user.displayName || user.username}</div>
                        <div className="text-[10px] text-neutral-400 font-mono truncate">@{user.username}</div>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/80">
                            {user.role === 'admin' ? '👑 超级管理员' : user.role === 'editor' ? '✍️ 研学编辑者' : '🎓 学生模式'}
                          </span>
                        </div>
                      </div>

                      <Link
                        to="/"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors cursor-pointer"
                      >
                        <Home className="h-3.5 w-3.5 text-neutral-500" />
                        <span>产品官网与下载中心</span>
                      </Link>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          setGuideOpen(true)
                          openModal('user-guide')
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors cursor-pointer"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-neutral-500" />
                        <span>新手指引全景手册</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          setInteractiveTourOpen(true)
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <Compass className="h-3.5 w-3.5 text-indigo-600" />
                        <span>开启新用户功能体验教程</span>
                      </button>

                      {/* 伴学积分与充值兑换入口 */}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          setCheckinTab('checkin')
                          setCheckinOpen(true)
                        }}
                        className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Coins className="h-3.5 w-3.5 text-amber-600" />
                          <span>伴学积分中心</span>
                        </div>
                        <span className="font-mono font-bold text-amber-900">{points.toFixed(1)} 分</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          setCheckinTab('redeem')
                          setCheckinOpen(true)
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <Coins className="h-3.5 w-3.5 text-indigo-600" />
                        <span>兑换优惠码 / 卡密</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          setCheckinTab('recharge')
                          setCheckinOpen(true)
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Coins className="h-3.5 w-3.5 text-emerald-600" />
                        <span>自主充值伴学积分</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            setUserManagementOpen(true)
                          }}
                          className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors cursor-pointer"
                        >
                          <UsersIcon className="h-3.5 w-3.5 text-neutral-500" />
                          <span>用户权限管理</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          logout()
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
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
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/90 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95 xl:hidden shadow-2xs cursor-pointer"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>
      <UserManagementModal isOpen={Boolean(userManagementOpen || activeModals['user-management'])} onClose={() => { setUserManagementOpen(false); closeModal('user-management') }} />
      <UserGuideModal
        isOpen={Boolean(guideOpen || activeModals['user-guide'])}
        onClose={() => { setGuideOpen(false); closeModal('user-guide') }}
        onStartInteractiveTour={() => {
          setGuideOpen(false)
          closeModal('user-guide')
          setInteractiveTourOpen(true)
        }}
      />
      <InteractiveTourGuide
        isOpen={interactiveTourOpen}
        onClose={() => setInteractiveTourOpen(false)}
      />
      <CheckinModal
        isOpen={Boolean(checkinOpen || activeModals['checkin'])}
        onClose={() => { setCheckinOpen(false); closeModal('checkin') }}
        defaultTab={checkinTab}
      />

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
                  className={`relative flex items-center justify-center w-12 h-7 rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-500 group-active:scale-95'
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
        {(searchOpen || activeModals['search']) && <SearchModal isOpen={true} onClose={() => { setSearchOpen(false); closeModal('search') }} />}
        {(assistantOpen || activeModals['ai-assistant']) && <AIAssistantModal isOpen={true} onClose={() => { setAssistantOpen(false); closeModal('ai-assistant') }} pagePath={location.pathname} />}
        {(importModalOpen || activeModals['import-resource']) && <ImportResourceModal isOpen={true} onClose={() => { setImportModalOpen(false); closeModal('import-resource') }} />}
        {(mobileModalOpen || activeModals['mobile-device']) && <MobileDeviceModal isOpen={true} onClose={() => { setMobileModalOpen(false); closeModal('mobile-device') }} />}
        {(quickNoteOpen || activeModals['quick-note']) && <QuickNoteDrawer isOpen={true} onClose={() => { setQuickNoteOpen(false); closeModal('quick-note') }} />}
      </Suspense>
    </div>
  )
}
