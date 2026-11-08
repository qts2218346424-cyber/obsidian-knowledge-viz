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
  Palette,
  Bot,
} from 'lucide-react'
import { useVaultStats, useApiHealth } from '../hooks/useVaultData'
import { useThemeStyle } from '../hooks/useThemeStyle'
import { useIsMobile } from '../hooks/useIsMobile'
import { getExamCountdownDays } from '../utils/examDate'
import { useVaultEvents } from '../hooks/useVaultEvents'
import DesktopPet from './Pet/DesktopPet'
import { useAuth } from '../contexts/AuthContext'
import UserManagementModal from './UserManagementModal'
import UserGuideModal from './UserGuideModal'
import CheckinModal from './CheckinModal'
import ChangePasswordModal from './ChangePasswordModal'
import InteractiveTourGuide from './InteractiveTourGuide'
import { HelpCircle, Compass, KeyRound, History as HistoryIcon } from 'lucide-react'
import { LogOut, Users as UsersIcon, ShieldAlert as ShieldAlertIcon } from 'lucide-react'
import { prefetchRoute } from '../App'
import { useUIModalStore } from '../shared/store/useUIModalStore'

import SearchModal from './SearchModal'
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

const subjectSpecialties = [
  { to: '/quiz?subject=408', label: '408 计算机专项', badge: '核心大题', emoji: '💻', desc: '数据结构 · 计组 · 操作系统 · 计网' },
  { to: '/quiz?subject=math', label: '考研数学', badge: '数一/数二/数三', emoji: '📐', desc: '高等数学 · 线性代数 · 概率统计' },
  { to: '/politics', label: '考研政治', badge: '肖秀荣1000题', emoji: '🏛️', desc: '史纲时空轴 · 肖秀荣1000题 · 考点收藏' },
  { to: '/english', label: '考研英语', badge: '作文批改', emoji: '📖', desc: '真题精读 · 写作批改 · 核心词库' },
]

const primaryNavItems: NavItem[] = [
  { to: '/dashboard', label: '首页', shortLabel: '首页', icon: Home, emoji: '🏠', desc: '备考驾驶舱与每日概览' },
  { to: '/quiz', label: '做题中心', shortLabel: '做题', icon: ClipboardList, emoji: '📝', badge: '408+数学', desc: '真题精练、AI 组卷与错题本' },
  { to: '/politics', label: '考研政治', shortLabel: '政治', icon: Landmark, emoji: '🏛️', badge: '史纲+1000题', desc: '全屏时空轴、肖秀荣1000题与考点收藏' },
  { to: '/english', label: '考研英语', shortLabel: '英语', icon: BookOpen, emoji: '📖', badge: '作文批改+真题', desc: '写作模板、AI智能批改、历年真题精读与大纲词库' },
  { to: '/study', label: '学习中心', shortLabel: '讲义', icon: GraduationCap, emoji: '📚', desc: '讲义精读、闪卡记忆与掌握度' },
  { to: '/graph', label: '知识图谱', shortLabel: '图谱', icon: Network, emoji: '🕸️', desc: '全库双链网络可视化探索' },
  { to: '/editor', label: '笔记编辑', shortLabel: '笔记', icon: FileEdit, emoji: '✏️', desc: 'Markdown 写作与手写批注' },
  { to: '/chat', label: 'AI 伴学', shortLabel: '伴学', icon: MessageCircle, emoji: '💬', desc: '多智能体导师答疑与推导' },
]

const moreNavItems: NavItem[] = [
  { to: '/workflow', label: '知识库整理', shortLabel: '整理', icon: Workflow, emoji: '🧭', desc: '质检、标签治理与结构优化' },
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
  const { isVibrant, toggleThemeStyle } = useThemeStyle()
  const { isMobile } = useIsMobile()
  const countdownDays = getExamCountdownDays()
  const location = useLocation()
  const currentPage = allNavItems.find(item => location.pathname === item.to)
  const isFullHeightPage = ['/chat', '/editor', '/graph'].includes(location.pathname)
  const apiHealthy = useApiHealth()
  const { stats, reload: reloadStats } = useVaultStats()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false)
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
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
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
    reloadStats()
  })

  useEffect(() => {
    const onOpenQuickNote = () => openModal('quick-note')
    window.addEventListener('open-quick-note', onOpenQuickNote)
    const onOpenGuide = () => openModal('user-guide')
    window.addEventListener('open-user-guide', onOpenGuide)
    const onStartTour = () => setInteractiveTourOpen(true)
    window.addEventListener('start-interactive-tour', onStartTour)
    const onOpenChangePassword = () => setChangePasswordOpen(true)
    window.addEventListener('open-change-password-modal', onOpenChangePassword)
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
    const onNotesUpdated = () => {
      reloadStats()
    }
    window.addEventListener('vault-notes-updated', onNotesUpdated)
    window.addEventListener('vault-stats-updated', onNotesUpdated)

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
        setSearchOpen(prev => !prev)
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
      window.removeEventListener('open-change-password-modal', onOpenChangePassword)
      window.removeEventListener('open-checkin-modal', onOpenCheckin)
      window.removeEventListener('vault-notes-updated', onNotesUpdated)
      window.removeEventListener('vault-stats-updated', onNotesUpdated)
    }
  }, [openModal, closeModal, activeModals])

  useEffect(() => {
    const ROUTE_PAGE_TITLES: Record<string, string> = {
      '/dashboard': '备考驾驶舱 · 研核 CoreForge',
      '/quiz': '做题中心 · 研核 CoreForge',
      '/politics': '考研政治 · 研核 CoreForge',
      '/history': '考研政治 · 研核 CoreForge',
      '/english': '考研英语 · 研核 CoreForge',
      '/vocabulary': '考研英语 · 研核 CoreForge',
      '/study': '学习中心 · 研核 CoreForge',
      '/learn': '学习中心 · 研核 CoreForge',
      '/graph': '知识图谱 · 研核 CoreForge',
      '/editor': '笔记编辑 · 研核 CoreForge',
      '/chat': 'AI 伴学导师 · 研核 CoreForge',
      '/pomodoro': '专注番茄钟 · 研核 CoreForge',
      '/workflow': '知识库整理 · 研核 CoreForge',
      '/music': '声学专注氛围 · 研核 CoreForge',
      '/settings': '系统与账号设置 · 研核 CoreForge',
    }
    document.title = ROUTE_PAGE_TITLES[location.pathname] || (currentPage ? `${currentPage.label} · 研核 CoreForge` : '研核 CoreForge')
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
    { to: '/quiz', label: '做题', icon: ClipboardList },
    { to: '/chat', label: 'AI伴学', icon: Bot, isCenter: true },
    { to: '/politics', label: '政治', icon: Landmark },
    { to: '__tools__', label: '全部功能', icon: LayoutGrid, isAction: true },
  ]

  return (
    <div className="min-h-dvh aurora-mesh w-full max-w-full text-slate-900 selection:bg-accent-orange/20 selection:text-accent-orange font-sans antialiased relative">
      {/* Top Global Header */}
      <header className="sticky top-0 z-40 bg-white/90 glass-header border-b border-slate-200/80 pt-[env(safe-area-inset-top,0px)]">
        {/* ── 📱 移动端专属精炼 Header (防挤压、高审美、大单手热区) ── */}
        <div className="flex md:hidden w-full h-12 items-center justify-between gap-1.5 px-3 max-w-full">
          {/* 左侧：Logo + 考研倒计时金牌 */}
          <Link to="/dashboard" className="flex items-center gap-1.5 select-none shrink min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 p-1 shadow-2xs shrink-0">
              <img src="/favicon.svg" alt="研核" className="h-full w-full object-contain" />
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[13.5px] font-extrabold tracking-tight text-neutral-900 truncate">
                研核
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-300/80 shadow-2xs shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {countdownDays}天
              </span>
            </div>
          </Link>

          {/* 右侧：精炼工具胶囊阵列 (直达 AI 伴学 + 全站功能入口) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* 顶栏快速进入 AI 伴学胶囊 */}
            <Link
              to="/chat"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-extrabold shadow-2xs active:scale-95 transition-all shrink-0"
              title="一键进入 AI 伴学导师"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>伴学</span>
            </Link>

            <button
              type="button"
              onClick={toggleThemeStyle}
              className={`h-8 px-2 rounded-xl flex items-center gap-1 text-[11px] font-bold shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0 ${
                isVibrant
                  ? 'bg-gradient-to-r from-pink-500/15 to-indigo-500/15 border border-indigo-300 text-indigo-700'
                  : 'bg-slate-100 border border-slate-200 text-slate-600'
              }`}
              title={isVibrant ? '当前鲜艳风（点击切回极简）' : '当前极简风（点击切鲜艳）'}
            >
              <Palette className={`w-3.5 h-3.5 ${isVibrant ? 'text-indigo-600 animate-pulse' : 'text-slate-500'}`} />
              <span>{isVibrant ? '鲜艳' : '极简'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCheckinTab('checkin')
                setCheckinOpen(true)
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-800 text-[11px] font-bold shadow-2xs active:scale-95 cursor-pointer"
              title="签到打卡领积分"
            >
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-mono">{points.toFixed(1)}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchOpen(true)
                openModal('search')
              }}
              aria-label="搜索"
              className="w-8 h-8 inline-flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 active:scale-95 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="全站功能与工具箱"
              title="查看全站所有功能矩阵"
              className="h-8 px-2 inline-flex items-center justify-center gap-1 rounded-xl bg-neutral-900 text-white shadow-xs active:scale-95 cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">功能</span>
            </button>
          </div>
        </div>

        {/* ── 💻 平板与桌面端专属全景 Header (保持原电脑端多栏工作台架构) ── */}
        <div className="hidden md:flex mx-auto h-13 sm:h-14 max-w-[1600px] items-center gap-2 2xl:gap-3 px-3 sm:px-5">
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

          {/* ── 5 核心模块主导航 (Linear / Notion 极简克制呼吸感) ── */}
          <nav className="ml-1 2xl:ml-3 mr-3 2xl:mr-6 hidden flex-1 items-center justify-center gap-1.5 md:flex shrink-0 min-w-0" aria-label="主导航">
            {/* 1. 总览 */}
            <NavLink
              to="/dashboard"
              onPointerEnter={() => prefetchRoute('/dashboard')}
              className={({ isActive }) => navClass(isActive)}
              title="备考驾驶舱与每日概览"
            >
              {({ isActive }) => (
                <>
                  <Home className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span className="whitespace-nowrap font-medium">总览</span>
                </>
              )}
            </NavLink>

            {/* 2. 题库与模考 */}
            <NavLink
              to="/quiz"
              onPointerEnter={() => prefetchRoute('/quiz')}
              className={({ isActive }) => navClass(isActive && !['/politics', '/english'].includes(location.pathname))}
              title="真题精练、AI 组卷与错题本"
            >
              {({ isActive }) => (
                <>
                  <ClipboardList className={`h-3.5 w-3.5 shrink-0 ${isActive && !['/politics', '/english'].includes(location.pathname) ? 'text-white' : 'text-neutral-400'}`} />
                  <span className="whitespace-nowrap font-medium">题库与模考</span>
                </>
              )}
            </NavLink>

            {/* 3. 学科专攻 (408 / 考研数学 / 考研政治 / 考研英语 精准下拉) */}
            <div className="relative shrink-0" onMouseLeave={() => setSubjectMenuOpen(false)}>
              <button
                type="button"
                onClick={() => setSubjectMenuOpen(prev => !prev)}
                onMouseEnter={() => setSubjectMenuOpen(true)}
                className={navClass(
                  subjectMenuOpen ||
                  ['/politics', '/english'].includes(location.pathname) ||
                  location.search.includes('subject=')
                )}
                aria-expanded={subjectMenuOpen}
              >
                <GraduationCap className={`h-3.5 w-3.5 shrink-0 ${
                  subjectMenuOpen || ['/politics', '/english'].includes(location.pathname) || location.search.includes('subject=')
                    ? 'text-white'
                    : 'text-neutral-400'
                }`} />
                <span className="whitespace-nowrap font-medium">学科专攻</span>
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${subjectMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {subjectMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSubjectMenuOpen(false)} />
                  <div
                    onMouseEnter={() => setSubjectMenuOpen(true)}
                    className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-1.5 w-64 rounded-2xl border border-neutral-200/80 bg-white/95 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-fade-in-up"
                  >
                    <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                      <span>考研核心科目专区</span>
                      <span className="text-[9px] text-indigo-500 font-mono">4 大专项</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {subjectSpecialties.map(sub => {
                        const isSubActive =
                          (sub.to === '/politics' && location.pathname === '/politics') ||
                          (sub.to === '/english' && location.pathname === '/english') ||
                          (location.pathname === '/quiz' && sub.to.includes(location.search) && location.search.length > 0)
                        return (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => setSubjectMenuOpen(false)}
                            className={`flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                              isSubActive
                                ? 'bg-indigo-50/80 text-indigo-900 font-semibold'
                                : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                            }`}
                          >
                            <span className="text-base shrink-0 mt-0.5">{sub.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-neutral-800 text-xs">{sub.label}</span>
                                {sub.badge && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60 font-mono">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-neutral-400 truncate mt-0.5">{sub.desc}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4. 讲义与闪卡 */}
            <NavLink
              to="/study"
              onPointerEnter={() => prefetchRoute('/study')}
              className={({ isActive }) => navClass(isActive)}
              title="讲义精读、闪卡记忆、掌握度与仿真课件"
            >
              {({ isActive }) => (
                <>
                  <BookOpen className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span className="whitespace-nowrap font-medium">讲义与闪卡</span>
                </>
              )}
            </NavLink>

            {/* 5. AI 伴学 */}
            <NavLink
              to="/chat"
              onPointerEnter={() => prefetchRoute('/chat')}
              className={({ isActive }) => navClass(isActive)}
              title="多智能体导师答疑与推导"
            >
              {({ isActive }) => (
                <>
                  <Sparkles className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-amber-400 animate-pulse'}`} />
                  <span className="whitespace-nowrap font-medium">AI 伴学</span>
                </>
              )}
            </NavLink>
          </nav>

          {/* ── 右侧极简 3 核心组件：AI 伴学直达、搜索 ⌘K、算力胶囊与用户矩阵头像 ── */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* 0. 常驻 AI 伴学导师专属高亮胶囊 */}
            <Link
              to="/chat"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-xs hover:shadow-indigo-500/25 active:scale-95 transition-all shrink-0 cursor-pointer"
              title="考研 AI 伴学导师 · 随时答疑解惑、分步推导定理"
            >
              <Bot className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>AI 伴学导师</span>
            </Link>

            {/* 0.1 视觉风格一键切换胶囊 (鲜艳风 / 极简风) */}
            <button
              type="button"
              onClick={toggleThemeStyle}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0 ${
                isVibrant
                  ? 'border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-indigo-700 hover:border-indigo-300 shadow-indigo-500/10'
                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600 hover:text-slate-900'
              }`}
              title={isVibrant ? '当前风格：鲜艳活力风（点击切换为黑白极简风）' : '当前风格：经典极简风（点击切换为鲜艳活力风）'}
            >
              <Palette className={`h-3.5 w-3.5 ${isVibrant ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">{isVibrant ? '🎨 鲜艳风' : '极简风'}</span>
            </button>

            {/* 1. 全局快捷搜索框 ⌘K */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true)
                openModal('search')
              }}
              aria-label="全局检索"
              title="全局搜索知识库与真题（快捷键 Ctrl+K / ⌘K）"
              className="inline-flex items-center gap-2 h-8 px-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline font-normal">搜索...</span>
              <kbd className="inline-flex items-center text-[9px] font-mono text-slate-400 bg-white border border-slate-200/90 rounded px-1.5 py-0.5 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* 2. 算力伴学积分胶囊 */}
            {user && (
              <button
                type="button"
                onClick={() => {
                  setCheckinOpen(true)
                  openModal('checkin')
                }}
                className="relative inline-flex h-8 items-center gap-1.5 rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50/90 to-amber-100/50 px-2.5 text-amber-900 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
                title={`伴学算力中心：当前可用 ${points.toFixed(1)} 算力点数 · 点击签到打卡或查看消费明细`}
              >
                <Coins className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-xs font-bold font-mono text-amber-950">
                  {points.toFixed(1)}
                </span>
                <span className="text-[10px] text-amber-700 font-medium hidden sm:inline">算力</span>
                {canCheckinToday && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </button>
            )}

            {/* 3. 用户头像与多维矩阵下拉菜单 (集成设置、主题、随手记、导入等) */}
            {user && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(prev => !prev)}
                  className="flex items-center gap-1.5 rounded-full p-0.5 border border-slate-200/90 hover:ring-2 hover:ring-indigo-100 transition-all cursor-pointer active:scale-95"
                  title={`${user.displayName || user.username} (${user.role === 'admin' ? '👑 超级管理员' : '🎓 考研研学者'}) · 点击展开设置与工具矩阵`}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white bg-indigo-600 shadow-2xs">
                    {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : user.username.slice(0, 1).toUpperCase()}
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-2xl border border-slate-200/90 bg-white/98 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl animate-fade-in-up text-slate-800">
                      {/* 用户基础信息卡片 */}
                      <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 mb-1.5">
                        <div className="text-xs font-bold text-slate-900 truncate">{user.displayName || user.username}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">@{user.username}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-slate-200/80 shadow-2xs">
                            {user.role === 'admin' ? '👑 超级管理员' : '🎓 考研研学者'}
                          </span>
                          <span className="text-[10px] font-mono text-amber-700">⚡ {points.toFixed(1)}分</span>
                        </div>
                      </div>

                      {/* 分组 1: 研学快捷工具 */}
                      <div className="px-2.5 pt-1.5 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        研学快捷动作
                      </div>
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            setQuickNoteOpen(true)
                            openModal('quick-note')
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <PenLine className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-medium">极速随手记</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            setImportModalOpen(true)
                            openModal('import-resource')
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Database className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-medium">导入资料与题库 (PDF/真题)</span>
                        </button>

                        <Link
                          to="/graph"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Network className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-medium">知识图谱网络</span>
                        </Link>

                        <Link
                          to="/editor"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <FileEdit className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-medium">Markdown 笔记编辑器</span>
                        </Link>

                        <Link
                          to="/workflow"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Workflow className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-medium">知识库整理工作流</span>
                        </Link>
                      </div>

                      {/* 分组 2: 界面与主题偏好 */}
                      <div className="px-2.5 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                        界面与偏好
                      </div>
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            toggleThemeStyle()
                          }}
                          className="w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Palette className={`h-3.5 w-3.5 ${isVibrant ? 'text-indigo-600' : 'text-slate-500'}`} />
                            <span className="font-medium">视觉风格</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                            {isVibrant ? '鲜艳活力' : '经典极简'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            setGuideOpen(true)
                            openModal('user-guide')
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-medium">新手指引全景手册</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            setInteractiveTourOpen(true)
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Compass className="h-3.5 w-3.5 text-indigo-500" />
                          <span className="font-medium">开启交互式新功能导览</span>
                        </button>
                      </div>

                      {/* 分组 3: 账号与系统设置 */}
                      <div className="px-2.5 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                        账号与系统
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Settings className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-medium">全局系统设置</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            setChangePasswordOpen(true)
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                          <span className="font-medium">修改登录密码</span>
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false)
                              setUserManagementOpen(true)
                            }}
                            className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <UsersIcon className="h-3.5 w-3.5 text-indigo-600" />
                            <span className="font-medium">用户权限管理</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            logout()
                          }}
                          className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>退出登录</span>
                        </button>
                      </div>
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
      <ChangePasswordModal isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
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
      <main className={`mx-auto max-w-[1600px] w-full min-w-0 ${
        isFullHeightPage
          ? 'h-[calc(100dvh-3.25rem-env(safe-area-inset-top,0px))] sm:h-[calc(100dvh-3.5rem-env(safe-area-inset-top,0px))] overflow-hidden flex flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] xl:pb-0'
          : 'min-h-[calc(100dvh-3.25rem)] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] xl:pb-8'
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

      {/* ── 📱 移动端专属吸底 TabBar 导航 (5大考研核心专区，原生级手势与触控响应) ── */}
      <nav
        aria-label="移动端底部导航"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200/90 px-1.5 pt-1 flex items-center justify-around shadow-[0_-4px_24px_rgba(15,23,42,0.06)] backdrop-blur-2xl pb-[max(0.45rem,env(safe-area-inset-bottom))]"
      >
        {mobileBottomTabs.map(tab => {
          if ((tab as any).isAction) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="flex flex-col items-center justify-center flex-1 py-1 select-none group cursor-pointer"
                title="打开全站所有功能矩阵"
              >
                <div className="relative flex items-center justify-center w-11 h-7 rounded-xl bg-slate-100 text-slate-700 group-active:scale-95 transition-transform">
                  <tab.icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 text-slate-700 font-extrabold">
                  {tab.label}
                </span>
              </button>
            )
          }

          if ((tab as any).isCenter) {
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                onPointerEnter={() => prefetchRoute(tab.to)}
                onTouchStart={() => prefetchRoute(tab.to)}
                className="flex flex-col items-center justify-center flex-1 py-1 select-none group cursor-pointer relative -top-2"
                title="进入考研 AI 伴学导师"
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`relative flex items-center justify-center w-12 h-10 rounded-2xl transition-all duration-200 shadow-md ${
                        isActive
                          ? 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white ring-2 ring-indigo-400 scale-105'
                          : 'bg-gradient-to-tr from-slate-900 to-indigo-950 text-amber-300 border border-indigo-400/40 group-active:scale-95'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                      </span>
                    </div>
                    <span
                      className={`text-[10px] tracking-tight mt-0.5 transition-colors font-black ${
                        isActive ? 'text-indigo-600' : 'text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          }

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              onPointerEnter={() => prefetchRoute(tab.to)}
              onTouchStart={() => prefetchRoute(tab.to)}
              className="flex flex-col items-center justify-center flex-1 py-1 select-none group cursor-pointer"
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative flex items-center justify-center w-11 h-7 rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-xs scale-105'
                        : 'text-neutral-500 group-active:scale-95'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-[10.5px] tracking-tight mt-0.5 transition-colors ${
                      isActive ? 'text-neutral-900 font-extrabold' : 'text-neutral-500 font-medium'
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          )
        })}
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
