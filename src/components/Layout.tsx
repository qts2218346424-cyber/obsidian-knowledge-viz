import { useEffect, useState, lazy, Suspense, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  AlertCircle,
  BookOpen,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  ChevronRight,
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
  Headphones,
  Moon,
  Leaf,
  Cpu,
  Calculator,
} from 'lucide-react'
import { useVaultStats, useApiHealth } from '../hooks/useVaultData'
import { useThemeStyle } from '../hooks/useThemeStyle'
import { useIsMobile } from '../hooks/useIsMobile'
import { useExamCountdown } from '../utils/examDate'
import { useVaultEvents } from '../hooks/useVaultEvents'
import DesktopPet from './Pet/DesktopPet'
import { useAuth } from '../contexts/AuthContext'
import DangoAvatar, { DangoColorPicker } from './DangoAvatar'
import { HelpCircle, Compass, KeyRound, History as HistoryIcon } from 'lucide-react'
import { LogOut, Users as UsersIcon, ShieldAlert as ShieldAlertIcon } from 'lucide-react'
import { prefetchRoute } from '../app/routes'
import { useUIModalStore } from '../shared/store/useUIModalStore'

import SearchModal from './SearchModal'
// 低频弹窗改为按需加载 + 打开时才挂载，减少 Layout 首屏 JS 与常驻渲染开销
const UserManagementModal = lazy(() => import('./UserManagementModal'))
const UserGuideModal = lazy(() => import('./UserGuideModal'))
const CheckinModal = lazy(() => import('./CheckinModal'))
const ChangePasswordModal = lazy(() => import('./ChangePasswordModal'))
const InteractiveTourGuide = lazy(() => import('./InteractiveTourGuide'))
const AIAssistantModal = lazy(() => import('./AIAssistantModal'))
const ImportResourceModal = lazy(() => import('./ImportResourceModal'))
const MobileDeviceModal = lazy(() => import('./MobileDeviceModal'))
const QuickNoteDrawer = lazy(() => import('./QuickNoteDrawer'))

interface NavItem {
  to: string
  label: string
  shortLabel?: string
  icon: any
  iconBg?: string
  iconColor?: string
  badge?: string
  desc?: string
}

const subjectSpecialties = [
  { to: '/quiz?domain=cs_408', label: '408 计算机', badge: '核心大题', icon: Cpu, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', desc: '数构 · 计组 · OS · 网络' },
  { to: '/quiz?domain=math', label: '考研数学', badge: '数一/二/三', icon: Calculator, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', desc: '高数 · 线代 · 概率论' },
  { to: '/politics', label: '考研政治', badge: '史纲千题', icon: Landmark, iconBg: 'bg-rose-50', iconColor: 'text-rose-600', desc: '时空编年 · 肖秀荣1000题' },
  { to: '/english', label: '考研英语', badge: '作文批改', icon: BookOpen, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', desc: '真题精读 · 作文批改 · 词库' },
]

const primaryNavItems: NavItem[] = [
  { to: '/dashboard', label: '首页', shortLabel: '首页', icon: Home, iconBg: 'bg-slate-100', iconColor: 'text-slate-700', desc: '备考概览与每日计划' },
  { to: '/quiz', label: '刷题中心', shortLabel: '刷题', icon: ClipboardList, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', badge: '真题+错题', desc: '真题试卷、自由组卷与错题本' },
  { to: '/study', label: '研学中心', shortLabel: '研学', icon: GraduationCap, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', desc: '核心讲义、闪卡与仿真课件' },
  { to: '/vocabulary', label: '考研背词', shortLabel: '单词', icon: Headphones, iconBg: 'bg-sky-50', iconColor: 'text-sky-600', badge: '2000+词汇', desc: '大纲词库与艾宾浩斯复盘' },
  { to: '/english', label: '考研英语', shortLabel: '英语', icon: BookOpen, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', badge: '作文批改', desc: '真题精读与写作智能批改' },
  { to: '/politics', label: '考研政治', shortLabel: '政治', icon: Landmark, iconBg: 'bg-rose-50', iconColor: 'text-rose-600', badge: '史纲千题', desc: '史纲时空轴与千题库训练' },
  { to: '/graph', label: '知识图谱', shortLabel: '图谱', icon: Network, iconBg: 'bg-violet-50', iconColor: 'text-violet-600', desc: '双链考点网络可视化' },
  { to: '/editor', label: '笔记编辑', shortLabel: '笔记', icon: FileEdit, iconBg: 'bg-teal-50', iconColor: 'text-teal-600', desc: 'Markdown 写作与公式批注' },
  { to: '/chat', label: 'AI 伴学', shortLabel: '伴学', icon: MessageCircle, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', desc: '智能体导师答疑与推导' },
]

const moreNavItems: NavItem[] = [
  { to: '/workflow', label: '知识整理', shortLabel: '整理', icon: Workflow, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', desc: '质检、标签治理与结构优化' },
  { to: '/pomodoro', label: '番茄专注', shortLabel: '专注', icon: Timer, iconBg: 'bg-orange-50', iconColor: 'text-orange-600', desc: '心流计时与专注统计' },
  { to: '/music', label: '白噪音', shortLabel: '白噪音', icon: Music, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', desc: '双耳节拍与沉浸自习音景' },
  { to: '/settings', label: '系统设置', shortLabel: '设置', icon: Settings, iconBg: 'bg-slate-100', iconColor: 'text-slate-600', desc: '知识库路径与模型配置' },
]

const allNavItems = [...primaryNavItems, ...moreNavItems]

interface LayoutProps {
  children: ReactNode
}

function navClass(isActive: boolean) {
  return `relative inline-flex items-center gap-1 xl:gap-1.5 rounded-lg px-1.5 xl:px-2 2xl:px-2.5 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
    isActive
      ? 'bg-slate-900 text-white shadow-xs'
      : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
  }`
}

export default function Layout({ children }: LayoutProps) {
  const {
    themeStyle,
    isVibrant,
    isMinimal,
    isEyecare,
    isDark,
    currentThemeMeta,
    themeConfigs,
    toggleThemeStyle,
    setThemeStyle,
  } = useThemeStyle()
  const { isMobile } = useIsMobile()
  const countdown = useExamCountdown()
  const location = useLocation()
  const currentPage = allNavItems.find(item => location.pathname === item.to)
  const isFullHeightPage = ['/chat', '/editor', '/graph'].includes(location.pathname)
  const apiHealthy = useApiHealth()
  const { stats, reload: reloadStats } = useVaultStats()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileSubjectOpen, setMobileSubjectOpen] = useState(false)
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const { activeModals, openModal, closeModal } = useUIModalStore()
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantLaunchState, setAssistantLaunchState] = useState<{
    contextPrompt?: string | null
    defaultInput?: string | null
    triggerKey?: number
  }>({})
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [syncNotice, setSyncNotice] = useState<string | null>(null)
  const [quickNoteOpen, setQuickNoteOpen] = useState(false)
  const { user, isAdmin, isStudent, logout, points, canCheckinToday } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false)
  const [userManagementOpen, setUserManagementOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guideOptions, setGuideOptions] = useState<{
    tab?: 'tour' | 'doc'
    category?: string
    featureId?: string
  }>({})
  const [interactiveTourOpen, setInteractiveTourOpen] = useState(false)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [checkinTab, setCheckinTab] = useState<'checkin' | 'redeem' | 'recharge' | 'logs'>('checkin')

  const noteCount = stats?.totalNotes ?? null
  const connected = apiHealthy === true
  const rawVaultName = stats?.vaultPath?.split(/[\\/]/).filter(Boolean).pop() || '研核知识库'
  const vaultName = /opt|coreforge|root|data|users/i.test(rawVaultName) ? '我的专属研学沙盒' : rawVaultName

  useVaultEvents((event) => {
    const action = event.type === 'file-changed' ? '文件已更新' : event.type === 'file-added' ? '新笔记加入' : '文件已删除'
    setSyncNotice(`${action}：${event.path.split('/').pop()}`)
    setTimeout(() => setSyncNotice(null), 3000)
    reloadStats()
  })

  useEffect(() => {
    const onOpenQuickNote = () => openModal('quick-note')
    window.addEventListener('open-quick-note', onOpenQuickNote)
    const onOpenGuide = (e?: Event) => {
      const custom = e as CustomEvent<{ tab?: 'tour' | 'doc'; category?: string; featureId?: string }>
      if (custom?.detail) {
        setGuideOptions(custom.detail)
      } else {
        setGuideOptions({})
      }
      setGuideOpen(true)
      openModal('user-guide')
    }
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
    const onOpenAiAssistant = (e: Event) => {
      const custom = e as CustomEvent<{ contextPrompt?: string; defaultInput?: string }>
      if (custom?.detail) {
        setAssistantLaunchState({
          contextPrompt: custom.detail.contextPrompt ?? null,
          defaultInput: custom.detail.defaultInput ?? null,
          triggerKey: Date.now(),
        })
      }
      setAssistantOpen(true)
      openModal('ai-assistant')
    }
    window.addEventListener('open-ai-assistant', onOpenAiAssistant)
    const onNotesUpdated = () => {
      reloadStats()
    }
    window.addEventListener('vault-notes-updated', onNotesUpdated)
    window.addEventListener('vault-stats-updated', onNotesUpdated)

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
        if (activeModals['ai-assistant'] || assistantOpen) {
          setAssistantOpen(false)
          closeModal('ai-assistant')
        } else {
          setAssistantOpen(true)
          openModal('ai-assistant')
        }
      }
      if (!event.defaultPrevented && (event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'j') {
        event.preventDefault()
        if (activeModals['ai-assistant'] || assistantOpen) {
          setAssistantOpen(false)
          closeModal('ai-assistant')
        } else {
          setAssistantOpen(true)
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
      window.removeEventListener('open-ai-assistant', onOpenAiAssistant)
      window.removeEventListener('vault-notes-updated', onNotesUpdated)
      window.removeEventListener('vault-stats-updated', onNotesUpdated)
    }
  }, [openModal, closeModal, activeModals, assistantOpen])

  // 新用户首次登录自动唤起指引：每个浏览器会话最多自动弹出一次。
  // 单独放在只运行一次的 effect 里——上面的 effect 依赖 activeModals，
  // 关闭弹窗会让它重跑，旧写法因此会在关闭后再次自动弹出。
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      const dismissed = localStorage.getItem('coreforge_onboarding_dismissed')
      const shownThisSession = sessionStorage.getItem('coreforge_onboarding_autoshown')
      if (!dismissed && !shownThisSession) {
        timer = setTimeout(() => {
          try {
            sessionStorage.setItem('coreforge_onboarding_autoshown', '1')
          } catch {}
          openModal('user-guide')
        }, 1200)
      }
    } catch {}
    return () => {
      if (timer) clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setMobileSubjectOpen(false)
    setMoreOpen(false)
    setUserMenuOpen(false)
    setMobileUserMenuOpen(false)

    // 核心研学空间后台闲时预取 (Idle Route Prefetching)
    // 利用空闲网络带宽提前将「做题中心」与「学习中心」缓存到浏览器，消除点击等待
    const ric = (window as any).requestIdleCallback as undefined | ((cb: (d: { timeRemaining: () => number }) => void, opts?: { timeout: number }) => number)
    const runPrefetch = (deadline?: { timeRemaining: () => number }) => {
      prefetchRoute('/quiz')
      prefetchRoute('/study')
      if (!deadline || deadline.timeRemaining() > 10) {
        prefetchRoute('/editor')
      }
    }
    // 修复：原实现无法区分 requestIdleCallback 与 setTimeout 的句柄，清理时可能调用错误的取消函数
    const idleId = ric ? ric(runPrefetch, { timeout: 2000 }) : null
    const timeoutId = ric ? null : setTimeout(() => runPrefetch(), 700)

    return () => {
      if (idleId !== null) (window as any).cancelIdleCallback?.(idleId)
      if (timeoutId !== null) clearTimeout(timeoutId)
    }
  }, [currentPage?.label, vaultName, location.pathname])

  const isSubjectActive =
    ['/politics', '/english'].includes(location.pathname) ||
    location.search.includes('domain=') ||
    location.search.includes('subject=')

  const mobileBottomTabs = [
    { to: '/dashboard', label: '首页', icon: Home },
    { to: '/study', label: '研学', icon: GraduationCap },
    { to: '/chat', label: 'AI伴学', icon: Bot, isCenter: true },
    { to: '__subject__', label: '专项', icon: BookOpen, isSubject: true },
    { to: '__tools__', label: '全部', icon: LayoutGrid, isAction: true },
  ]

  /** 桌面端与移动端顶栏头像菜单共用的个人账号操作卡片 */
  const renderUserMenuCard = (closeMenu: () => void) => {
    if (!user) return null
    return (
      <>
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-1.5 space-y-2">
          <div className="flex items-center gap-2.5">
            <DangoAvatar seed={user.username || user.displayName} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{user.displayName || user.username}</div>
              <div className="text-2xs text-slate-400 font-mono truncate">@{user.username}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-slate-200/80 shadow-xs">
              {user.role === 'admin' ? '👑 超级管理员' : '🎓 考研研学者'}
            </span>
            <span className="text-2xs font-mono text-amber-700">⚡ {points.toFixed(1)}分</span>
          </div>
          <div className="pt-1 border-t border-slate-200/60">
            <div className="text-[10px] font-semibold text-slate-400 mb-1.5">团子头像颜色</div>
            <DangoColorPicker seed={user.username || user.displayName} compact />
          </div>
        </div>

        <div className="px-2.5 pt-1.5 pb-0.5 text-2xs font-bold text-slate-400 uppercase tracking-wider">
          账号与系统
        </div>
        <div className="space-y-0.5">
          <Link
            to="/settings"
            onClick={closeMenu}
            className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-medium">全局系统设置</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              closeMenu()
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
                closeMenu()
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
              closeMenu()
              logout()
            }}
            className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>退出登录</span>
          </button>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-dvh aurora-mesh w-full max-w-full overflow-x-clip text-slate-900 selection:bg-accent-orange/20 selection:text-accent-orange font-sans antialiased relative">
      {/* Top Global Header */}
      <header className="sticky top-0 z-40 bg-white/90 glass-header border-b border-slate-200/80 pt-[env(safe-area-inset-top,0px)]">
        {/* ── 📱 移动端专属精炼 Header (精致轻盈防挤压) ── */}
        <div className="flex md:hidden w-full h-11 items-center justify-between gap-1.5 px-2.5 max-w-full">
          {/* 左侧：Logo + 考研倒计时金牌 */}
          <div className="flex items-center gap-1.5 select-none shrink-0 min-w-0">
            <Link to="/dashboard" className="flex items-center gap-1 shrink-0 active:scale-95 transition-transform">
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-md shadow-xs ring-1 ring-rose-200/70 shrink-0">
                <img src="/icon-192.png?v=dango" alt="研核" className="h-full w-full object-cover" />
              </div>
              <span className="text-[13px] font-extrabold tracking-tight text-slate-900">
                研核
              </span>
            </Link>
            <div 
              className={`inline-flex items-center gap-0.5 text-2xs font-mono font-bold px-1.5 py-0.2 rounded-full border shadow-xs shrink-0 transition-colors ${
                isEyecare
                  ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300/80'
                  : isMinimal
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-300'
                  : isDark
                  ? 'bg-sky-950/70 text-sky-200 border-sky-800/60'
                  : 'bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 text-amber-900 border-amber-300/80'
              }`}
              title={`${countdown.targetLabel}：剩余 ${countdown.days} 天`}
            >
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${
                isEyecare ? 'bg-emerald-600' : isMinimal ? 'bg-zinc-700' : isDark ? 'bg-sky-400' : 'bg-amber-500'
              }`} />
              <span className={`font-sans text-2xs font-medium ${
                isEyecare ? 'text-emerald-800' : isMinimal ? 'text-zinc-600' : isDark ? 'text-sky-300' : 'text-amber-800'
              }`}>考研</span>
              <span>{countdown.days}天</span>
            </div>
          </div>

          {/* 右侧：精炼高效工具组 (随手记 + 积分打卡 + 全局搜索) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 顶栏快速随手记笔记胶囊 */}
            <button
              type="button"
              onClick={() => {
                setQuickNoteOpen(true)
                openModal('quick-note')
              }}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-white text-2xs font-extrabold shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer ${
                isEyecare
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-900/10'
                  : isMinimal
                  ? 'bg-zinc-900 hover:bg-black text-white'
                  : isDark
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              title="随手记笔记 · 极速入库 (支持拍照、LaTeX公式与快捷标签)"
            >
              <PenLine className="w-3 h-3" />
              <span>随手记</span>
            </button>

            {/* 手机端顶栏使用手册快捷按钮 */}
            <button
              type="button"
              onClick={() => {
                setGuideOptions({ tab: 'doc' })
                setGuideOpen(true)
                openModal('user-guide')
              }}
              className={`w-7 h-7 inline-flex items-center justify-center rounded-lg active:scale-95 transition-all shrink-0 cursor-pointer ${
                isEyecare
                  ? 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/70'
                  : isMinimal
                  ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-indigo-600'
              }`}
              title="使用手册与操作说明"
              aria-label="使用手册"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCheckinTab('checkin')
                setCheckinOpen(true)
              }}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border text-2xs font-bold shadow-xs active:scale-95 cursor-pointer shrink-0 transition-colors ${
                isEyecare
                  ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-900'
                  : isMinimal
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-800'
                  : isDark
                  ? 'bg-slate-800/80 border-slate-700 text-sky-300'
                  : 'bg-amber-50 border-amber-200/90 text-amber-800'
              }`}
              title="签到打卡领积分"
            >
              <Coins className={`w-3 h-3 ${
                isEyecare ? 'text-emerald-700' : isMinimal ? 'text-zinc-700' : isDark ? 'text-sky-400' : 'text-amber-600'
              }`} />
              <span className="font-mono">{points.toFixed(1)}</span>
            </button>

            <button
              type="button"
              data-tour="btn-mobile-search"
              onClick={() => {
                setSearchOpen(true)
                openModal('search')
              }}
              aria-label="搜索"
              title="全站搜索"
              className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 active:scale-95 cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {user && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileUserMenuOpen(prev => !prev)}
                  aria-label="打开个人账号菜单"
                  title={`${user.displayName || user.username} · 个人账号与退出登录`}
                  className="flex h-7 w-7 items-center justify-center rounded-full shadow-xs active:scale-95 transition-transform cursor-pointer"
                >
                  <DangoAvatar seed={user.username || user.displayName} size="md" />
                </button>
                {mobileUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMobileUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1.5 w-60 rounded-2xl border border-slate-200/90 bg-white/98 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl animate-fade-in-up text-slate-800">
                      {renderUserMenuCard(() => setMobileUserMenuOpen(false))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 💻 平板与桌面端专属全景 Header (保持原电脑端多栏工作台架构) ── */}
        <div className="hidden md:flex mx-auto h-13 sm:h-14 max-w-[1600px] items-center gap-1.5 lg:gap-2 2xl:gap-3 px-2.5 sm:px-4 2xl:px-5">
          {/* Logo & Subframe Pill */}
          <Link to="/dashboard" className="flex min-w-0 items-center gap-1.5 sm:gap-2 rounded-xl outline-none group select-none shrink-0">
            <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center overflow-hidden rounded-lg shadow-xs ring-1 ring-rose-200/70 transition-transform group-hover:scale-105 shrink-0">
              <img src="/icon-192.png?v=dango" alt="研核图标" className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm sm:text-[15px] font-bold tracking-tight text-slate-900 whitespace-nowrap">
                研核
              </span>
              <div 
                className="hidden xl:inline-flex items-center gap-1.5 subframe-pill text-2xs px-2 py-0.5"
                title={connected ? `知识库已连接：共 ${noteCount ?? 0} 篇笔记` : '知识库离线'}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className="truncate max-w-[80px] 2xl:max-w-[110px]">
                  {connected ? `${noteCount ?? ''} 篇在线` : '离线'}
                </span>
              </div>
            </div>
          </Link>

          {/* ── 5 核心模块主导航 (Linear / Notion 极简克制呼吸感) ── */}
          <nav className="ml-1 lg:ml-2 2xl:ml-3 mr-1 lg:mr-2 2xl:mr-4 hidden flex-1 items-center justify-center gap-1 xl:gap-1.5 2xl:gap-2 md:flex min-w-0" aria-label="主导航">
            {/* 1. 总览 */}
            <NavLink
              to="/dashboard"
              data-tour="nav-dashboard"
              onPointerEnter={() => prefetchRoute('/dashboard')}
              className={({ isActive }) => navClass(isActive)}
              title="备考驾驶舱与每日概览"
            >
              {({ isActive }) => (
                <>
                  <Home className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap font-medium">总览</span>
                </>
              )}
            </NavLink>

            {/* 2. 刷题中心 */}
            <NavLink
              to="/quiz"
              data-tour="nav-quiz"
              onPointerEnter={() => prefetchRoute('/quiz')}
              className={({ isActive }) => navClass(isActive && !['/politics', '/english'].includes(location.pathname))}
              title="真题试卷、自由组卷与错题本"
            >
              {({ isActive }) => (
                <>
                  <ClipboardList className={`h-3.5 w-3.5 shrink-0 ${isActive && !['/politics', '/english'].includes(location.pathname) ? 'text-white' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap font-medium">
                    <span className="inline lg:hidden">刷题</span>
                    <span className="hidden lg:inline">刷题中心</span>
                  </span>
                </>
              )}
            </NavLink>

            {/* 3. 学科专项 */}
            <div className="relative shrink-0" onMouseLeave={() => setSubjectMenuOpen(false)}>
              <button
                type="button"
                data-tour="nav-subjects"
                onClick={() => setSubjectMenuOpen(prev => !prev)}
                onMouseEnter={() => setSubjectMenuOpen(true)}
                className={navClass(
                  subjectMenuOpen ||
                  ['/politics', '/english'].includes(location.pathname) ||
                  location.search.includes('subject=')
                )}
                aria-expanded={subjectMenuOpen}
              >
                <BookOpen className={`h-3.5 w-3.5 shrink-0 ${
                  subjectMenuOpen || ['/politics', '/english'].includes(location.pathname) || location.search.includes('subject=')
                    ? 'text-white'
                    : 'text-slate-400'
                }`} />
                <span className="whitespace-nowrap font-medium">
                  <span className="inline lg:hidden">专项</span>
                  <span className="hidden lg:inline">学科专项</span>
                </span>
                <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${subjectMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {subjectMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSubjectMenuOpen(false)} />
                  <div
                    onMouseEnter={() => setSubjectMenuOpen(true)}
                    className="absolute left-1/2 -translate-x-1/2 top-full z-50 mt-1.5 w-64 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-xl animate-fade-in-up"
                  >
                    <div className="px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>考研统考专项</span>
                      <span className="text-2xs text-indigo-500 font-mono">4 大科目</span>
                    </div>
                    <div className="space-y-1 mt-1">
                      {subjectSpecialties.map(sub => {
                        const isSubActive =
                          (sub.to === '/politics' && location.pathname === '/politics') ||
                          (sub.to === '/english' && location.pathname === '/english') ||
                          (location.pathname === '/quiz' && sub.to.includes(location.search) && location.search.length > 0)
                        const SubIcon = sub.icon
                        return (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            onClick={() => setSubjectMenuOpen(false)}
                            className={`flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                              isSubActive
                                ? 'bg-indigo-50/80 text-indigo-900 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg ${sub.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                              <SubIcon className={`w-3.5 h-3.5 ${sub.iconColor}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-800 text-xs">{sub.label}</span>
                                {sub.badge && (
                                   <span className="text-2xs px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60 font-mono">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-2xs text-slate-400 truncate mt-0.5">{sub.desc}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4. 研学中心 */}
            <NavLink
              to="/study"
              data-tour="nav-study"
              onPointerEnter={() => prefetchRoute('/study')}
              className={({ isActive }) => navClass(isActive)}
              title="核心讲义、闪卡记忆、掌握度与仿真课件"
            >
              {({ isActive }) => (
                <>
                  <GraduationCap className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap font-medium">
                    <span className="inline lg:hidden">研学</span>
                    <span className="hidden lg:inline">研学中心</span>
                  </span>
                </>
              )}
            </NavLink>

            {/* 5. AI 伴学 */}
            <NavLink
              to="/chat"
              data-tour="nav-chat"
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

          {/* ── 右侧极简工具矩阵：视觉风格、搜索 ⌘K、使用手册、算力积分与更多功能 ── */}
          <div className="ml-auto flex items-center gap-1.5 xl:gap-2 shrink-0">

            {/* 0.1 视觉风格一键切换胶囊 (鲜艳风 / 极简风 / 护眼风 / 黑夜风) */}
            <button
              type="button"
              data-tour="btn-theme"
              onClick={toggleThemeStyle}
              className={`inline-flex items-center gap-1.5 h-8 px-2 xl:px-2.5 rounded-xl border text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95 shrink-0 ${
                isDark
                  ? 'border-sky-500/40 bg-slate-900/90 text-sky-400 hover:border-sky-400 shadow-sky-500/20'
                  : isEyecare
                  ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 text-emerald-800 hover:border-emerald-400 shadow-emerald-500/10'
                  : isVibrant
                  ? 'border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-indigo-700 hover:border-indigo-300 shadow-indigo-500/10'
                  : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-600 hover:text-slate-900'
              }`}
              title={`当前风格：${currentThemeMeta.name}（点击循环切换为下一模式）`}
            >
              {isDark ? (
                <Moon className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
              ) : isEyecare ? (
                <Leaf className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              ) : isVibrant ? (
                <Palette className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
              ) : (
                <Palette className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span className="hidden xl:inline">{currentThemeMeta.shortName}</span>
            </button>

            {/* 1. 全局快捷搜索框 ⌘K */}
            <button
              type="button"
              data-tour="btn-search"
              onClick={() => {
                setSearchOpen(true)
                openModal('search')
              }}
              aria-label="全局检索"
              title="全局搜索知识库与真题（快捷键 Ctrl+K / ⌘K）"
              className="inline-flex items-center gap-1.5 xl:gap-2 h-8 px-2 xl:px-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800 text-xs shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="hidden xl:inline font-normal">搜索...</span>
              <kbd className="hidden xl:inline-flex items-center text-2xs font-mono text-slate-400 bg-white border border-slate-200/90 rounded px-1.5 py-0.5 shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* 1.5 使用手册快捷入口 */}
            <button
              type="button"
              data-tour="btn-guide"
              onClick={() => {
                setGuideOptions({ tab: 'doc' })
                setGuideOpen(true)
                openModal('user-guide')
              }}
              className="hidden 2xl:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white hover:border-indigo-300 text-slate-600 hover:text-indigo-700 text-xs font-medium shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
              title="打开全功能通俗使用手册与新手导览"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>手册</span>
            </button>

            {/* 2. 算力伴学积分胶囊 */}
            {user && (
              <button
                type="button"
                onClick={() => {
                  setCheckinOpen(true)
                  openModal('checkin')
                }}
                className="relative inline-flex h-8 items-center gap-1 xl:gap-1.5 rounded-xl border border-amber-200/70 bg-gradient-to-r from-amber-50/90 to-amber-100/50 px-2 xl:px-2.5 text-amber-900 shadow-xs hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer active:scale-95 shrink-0"
                title={`伴学算力中心：当前可用 ${points.toFixed(1)} 算力点数 · 点击签到打卡或查看消费明细`}
              >
                <Coins className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-xs font-bold font-mono text-amber-950">
                  {points.toFixed(1)}
                </span>
                <span className="text-2xs text-amber-700 font-medium hidden xl:inline">算力</span>
                {canCheckinToday && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </button>
            )}

            {/* 3. 更多功能下拉菜单集合 (研学快捷动作、导入、图谱、编辑器、工作流与新手指引) */}
            <div className="relative shrink-0">
              <button
                type="button"
                data-tour="btn-more"
                onClick={() => {
                  setMoreOpen(prev => !prev)
                  setUserMenuOpen(false)
                }}
                className={`inline-flex items-center gap-1 xl:gap-1.5 h-8 px-2 xl:px-2.5 rounded-xl border text-xs font-medium shadow-xs transition-all cursor-pointer active:scale-95 shrink-0 ${
                  moreOpen
                    ? 'border-indigo-300 bg-indigo-50/90 text-indigo-700 shadow-indigo-500/10'
                    : 'border-slate-200/80 bg-slate-50/80 hover:bg-white hover:border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
                title="更多功能与研学工具集"
                aria-expanded={moreOpen}
              >
                <LayoutGrid className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span className="hidden xl:inline font-medium">更多功能</span>
                <ChevronDown className={`h-3 w-3 shrink-0 text-slate-400 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-2xl border border-slate-200/90 bg-white/98 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl animate-fade-in-up text-slate-800">
                    {/* 功能集合小标题 */}
                    <div className="px-2.5 py-1 text-2xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>研学百宝箱</span>
                      <span className="text-2xs text-indigo-600 font-medium px-1.5 py-0.2 rounded-full bg-indigo-50 border border-indigo-100">
                        实用工具与工作流
                      </span>
                    </div>

                    {/* 分组 1: 研学快捷动作 */}
                    <div className="space-y-0.5 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMoreOpen(false)
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
                          setMoreOpen(false)
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
                        onClick={() => setMoreOpen(false)}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Network className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="font-medium">知识图谱网络</span>
                      </Link>

                      <Link
                        to="/editor"
                        onClick={() => setMoreOpen(false)}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <FileEdit className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="font-medium">Markdown 笔记编辑器</span>
                      </Link>

                      <Link
                        to="/workflow"
                        onClick={() => setMoreOpen(false)}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Workflow className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="font-medium">知识库整理工作流</span>
                      </Link>
                    </div>

                    {/* 分组 2: 界面与偏好 */}
                    <div className="px-2.5 pt-2 pb-0.5 text-2xs font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                      界面与偏好
                    </div>
                    <div className="space-y-0.5">
                      <div className="rounded-xl p-1.5 bg-slate-50/70 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-700/50 space-y-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            toggleThemeStyle()
                          }}
                          className="w-full flex items-center justify-between rounded-lg px-1.5 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="点击循环切换视觉风格"
                        >
                          <div className="flex items-center gap-2">
                            {isDark ? (
                              <Moon className="h-3.5 w-3.5 text-sky-400" />
                            ) : isEyecare ? (
                              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                            ) : isVibrant ? (
                              <Palette className="h-3.5 w-3.5 text-indigo-600" />
                            ) : (
                              <Palette className="h-3.5 w-3.5 text-slate-500" />
                            )}
                            <span className="font-medium">视觉风格</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${
                            isDark
                              ? 'bg-slate-900 border-sky-500/40 text-sky-300'
                              : isEyecare
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : isVibrant
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}>
                            <span>{currentThemeMeta.icon}</span>
                            <span>{currentThemeMeta.name}</span>
                          </span>
                        </button>

                        {/* 4 风格快捷网格切换按钮 */}
                        <div className="grid grid-cols-4 gap-1">
                          {(['vibrant', 'minimal', 'eyecare', 'dark'] as const).map(styleKey => {
                            const meta = themeConfigs[styleKey]
                            const isActive = themeStyle === styleKey
                            return (
                              <button
                                key={styleKey}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setThemeStyle(styleKey)
                                }}
                                className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
                                  isActive
                                    ? styleKey === 'dark'
                                      ? 'bg-slate-900 border-sky-400 text-sky-300 shadow-2xs font-bold scale-[1.02]'
                                      : styleKey === 'eyecare'
                                      ? 'bg-emerald-100/90 border-emerald-400 text-emerald-800 shadow-2xs font-bold scale-[1.02]'
                                      : styleKey === 'vibrant'
                                      ? 'bg-indigo-100/90 border-indigo-400 text-indigo-800 shadow-2xs font-bold scale-[1.02]'
                                      : 'bg-slate-200 border-slate-400 text-slate-900 shadow-2xs font-bold scale-[1.02]'
                                    : 'bg-white/90 border-slate-200/80 text-slate-600 hover:bg-white hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                                }`}
                                title={meta.description}
                              >
                                <span className="text-xs leading-none mb-0.5">{meta.icon}</span>
                                <span className="leading-none text-[9px] font-medium">{meta.shortName}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreOpen(false)
                          setGuideOptions({ tab: 'doc' })
                          setGuideOpen(true)
                          openModal('user-guide')
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                        <span className="font-medium">全功能使用手册</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMoreOpen(false)
                          setInteractiveTourOpen(true)
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Compass className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="font-medium">开启手把手细致导览</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4. 用户头像与个人账号菜单 (设置、改密、管理与退出) */}
            {user && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(prev => !prev)
                    setMoreOpen(false)
                  }}
                  className="flex items-center gap-1.5 rounded-full p-0.5 border border-slate-200/90 hover:ring-2 hover:ring-indigo-100 transition-all cursor-pointer active:scale-95"
                  title={`${user.displayName || user.username} (${user.role === 'admin' ? '👑 超级管理员' : '🎓 考研研学者'}) · 点击展开设置与个人中心`}
                >
                  <DangoAvatar seed={user.username || user.displayName} size="md" className="shadow-xs" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1.5 w-60 rounded-2xl border border-slate-200/90 bg-white/98 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl animate-fade-in-up text-slate-800">
                      {renderUserMenuCard(() => setUserMenuOpen(false))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile App Center Sheet Trigger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="打开全站工具抽屉"
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 active:scale-95 xl:hidden shadow-xs cursor-pointer"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>
      <Suspense fallback={null}>
        {changePasswordOpen && (
          <ChangePasswordModal isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
        )}
        {Boolean(userManagementOpen || activeModals['user-management']) && (
          <UserManagementModal isOpen={Boolean(userManagementOpen || activeModals['user-management'])} onClose={() => { setUserManagementOpen(false); closeModal('user-management') }} />
        )}
        {Boolean(guideOpen || activeModals['user-guide']) && (
          <UserGuideModal
            isOpen={Boolean(guideOpen || activeModals['user-guide'])}
            onClose={() => {
              setGuideOpen(false)
              closeModal('user-guide')
              setGuideOptions({})
            }}
            initialTab={guideOptions.tab}
            initialCategory={guideOptions.category}
            initialFeatureId={guideOptions.featureId}
            onStartInteractiveTour={() => {
              setGuideOpen(false)
              closeModal('user-guide')
              setInteractiveTourOpen(true)
            }}
          />
        )}
        {interactiveTourOpen && (
          <InteractiveTourGuide
            isOpen={interactiveTourOpen}
            onClose={() => setInteractiveTourOpen(false)}
          />
        )}
        {Boolean(checkinOpen || activeModals['checkin']) && (
          <CheckinModal
            isOpen={Boolean(checkinOpen || activeModals['checkin'])}
            onClose={() => { setCheckinOpen(false); closeModal('checkin') }}
            defaultTab={checkinTab}
          />
        )}
      </Suspense>

      {/* Mobile Full-Featured Bottom Sheet Navigation */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end xl:hidden bg-slate-950/45 backdrop-blur-xs modal-backdrop-contain"
          onClick={() => setMobileNavOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl shadow-xl border-t border-slate-200/80 max-h-[86dvh] flex flex-col animate-sheet-up overflow-hidden"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            {/* Sheet Header */}
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-extrabold text-slate-900">全站导航与工具箱</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-2xs font-medium text-slate-600">
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
              {/* Mobile Account Summary & Logout Card */}
              {user && (
                <div className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 border border-slate-200/80 p-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <DangoAvatar seed={user.username || user.displayName} size="lg" className="shadow-xs" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">{user.displayName || user.username}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white text-indigo-700 border border-slate-200/80 shrink-0">
                          {user.role === 'admin' ? '管理员' : '研学者'}
                        </span>
                      </div>
                      <div className="text-2xs text-slate-400 font-mono truncate">@{user.username} · ⚡ {points.toFixed(1)}分</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileNavOpen(false)
                        setChangePasswordOpen(true)
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-2xs font-semibold text-slate-700 active:scale-95 transition-transform cursor-pointer"
                    >
                      改密
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileNavOpen(false)
                        logout()
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200/80 text-2xs font-bold text-rose-600 active:scale-95 transition-transform cursor-pointer"
                    >
                      <LogOut className="h-3 w-3" />
                      <span>退出登录</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions Bar */}
              <div className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
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
                {isAdmin && (
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
                )}
              </div>

              {/* 帮助与导览 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false)
                    setGuideOptions({ tab: 'doc' })
                    setGuideOpen(true)
                    openModal('user-guide')
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs font-bold text-slate-700 active:scale-95 transition-transform cursor-pointer"
                >
                  <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                  <span>使用手册</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false)
                    setInteractiveTourOpen(true)
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 px-3 py-2 text-xs font-bold text-indigo-700 active:scale-95 transition-transform cursor-pointer"
                >
                  <Compass className="h-3.5 w-3.5 text-indigo-600" />
                  <span>细致导览</span>
                </button>
              </div>

              {/* Core Modules */}
              <div>
                <div className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">核心研学</div>
                <div className="grid grid-cols-2 gap-2">
                  {primaryNavItems.map(item => {
                    const ItemIcon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onPointerEnter={() => prefetchRoute(item.to)}
                        onTouchStart={() => prefetchRoute(item.to)}
                        onClick={() => setMobileNavOpen(false)}
                        className={({ isActive }) => `flex items-center gap-2.5 rounded-xl border p-2.5 transition-all active:scale-[0.98] ${
                          isActive
                            ? 'border-indigo-500/40 bg-indigo-50/80 text-indigo-900 shadow-xs'
                            : 'border-slate-200/80 bg-slate-50/50 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className={`w-7.5 h-7.5 rounded-lg ${item.iconBg || 'bg-slate-100'} flex items-center justify-center shrink-0`}>
                          <ItemIcon className={`w-3.5 h-3.5 ${item.iconColor || 'text-slate-600'}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{item.label}</div>
                          {item.desc && <div className="text-2xs text-slate-400 truncate mt-0.5">{item.desc}</div>}
                        </div>
                      </NavLink>
                    )
                  })}
                </div>
              </div>

              {/* Utility Modules */}
              <div>
                <div className="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">效率工具</div>
                <div className="grid grid-cols-2 gap-2">
                  {moreNavItems.map(item => {
                    const ItemIcon = item.icon
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onPointerEnter={() => prefetchRoute(item.to)}
                        onTouchStart={() => prefetchRoute(item.to)}
                        onClick={() => setMobileNavOpen(false)}
                        className={({ isActive }) => `flex items-center gap-2.5 rounded-xl border p-2.5 transition-all active:scale-[0.98] ${
                          isActive
                            ? 'border-indigo-500/40 bg-indigo-50/80 text-indigo-900 shadow-xs'
                            : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-7.5 h-7.5 rounded-lg ${item.iconBg || 'bg-slate-100'} flex items-center justify-center shrink-0`}>
                          <ItemIcon className={`w-3.5 h-3.5 ${item.iconColor || 'text-slate-600'}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{item.label}</div>
                          {item.desc && <div className="text-2xs text-slate-400 truncate mt-0.5">{item.desc}</div>}
                        </div>
                      </NavLink>
                    )
                  })}
                </div>
              </div>

              {/* Vault Info Footer */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200/70 px-3.5 py-2.5 text-2xs text-slate-500">
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
      <main className={`mx-auto max-w-[1600px] w-full min-w-0 max-w-full overflow-x-clip ${
        isFullHeightPage
          ? 'h-[calc(100dvh-2.75rem-env(safe-area-inset-top,0px))] sm:h-[calc(100dvh-3.5rem-env(safe-area-inset-top,0px))] overflow-hidden flex flex-col pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] xl:pb-0'
          : 'min-h-[calc(100dvh-2.75rem)] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] xl:pb-32'
      }`}>
        {syncNotice && (
          <div className="fixed right-3 sm:right-5 top-[3.5rem] sm:top-[4rem] z-30 flex items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-3 py-1 sm:px-3.5 sm:py-1.5 text-2xs sm:text-xs font-medium text-emerald-700 shadow-xl backdrop-blur-xl animate-fade-in-up">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-[240px]">{syncNotice}</span>
          </div>
        )}
        <div className={`min-w-0 w-full max-w-full overflow-x-clip ${
          isFullHeightPage
            ? 'flex-1 h-full min-h-0 p-0 sm:px-4 sm:py-2.5 overflow-hidden flex flex-col'
            : 'px-2.5 py-2.5 sm:px-6 sm:py-6 lg:px-8 lg:py-7'
        }`}>
          {children}
        </div>
      </main>

      {/* ── 📱 移动端专属吸底 TabBar 导航 (精致微缩，高审美与原生触感) ── */}
      <nav
        aria-label="移动端底部导航"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200/90 px-1 pt-0.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(15,23,42,0.05)] backdrop-blur-2xl pb-[max(0.35rem,env(safe-area-inset-bottom))]"
      >
        {mobileBottomTabs.map(tab => {
          if ((tab as any).isAction) {
            return (
              <button
                key={tab.label}
                type="button"
                data-tour="nav-mobile-all"
                onClick={() => setMobileNavOpen(true)}
                className="flex flex-col items-center justify-center flex-1 py-0.5 select-none group cursor-pointer"
                title="打开全站所有功能矩阵"
              >
                <div className="relative flex items-center justify-center w-9.5 h-6 rounded-lg bg-slate-100 text-slate-700 group-active:scale-95 transition-transform">
                  <tab.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-2xs tracking-tight mt-0.5 text-slate-700 font-bold">
                  {tab.label}
                </span>
              </button>
            )
          }

          if ((tab as any).isSubject) {
            const active = isSubjectActive || mobileSubjectOpen
            return (
              <button
                key={tab.label}
                type="button"
                data-tour="nav-mobile-vocab"
                onClick={() => setMobileSubjectOpen(prev => !prev)}
                className="flex flex-col items-center justify-center flex-1 py-0.5 select-none group cursor-pointer"
                title="考研学科专攻：408、数学、政治、英语"
                aria-expanded={mobileSubjectOpen}
              >
                <div
                  className={`relative flex items-center justify-center w-9.5 h-6 rounded-lg transition-all duration-150 ${
                    active
                      ? isEyecare
                        ? 'bg-emerald-700 text-white shadow-xs scale-105'
                        : isMinimal
                        ? 'bg-zinc-900 text-white shadow-xs scale-105'
                        : isDark
                        ? 'bg-sky-600 text-white shadow-xs scale-105'
                        : isVibrant
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs scale-105'
                        : 'bg-slate-900 text-white shadow-xs scale-105'
                      : 'text-slate-500 group-active:scale-95 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                </div>
                <span
                  className={`text-2xs tracking-tight mt-0.5 transition-colors flex items-center gap-0.5 ${
                    active ? (isEyecare ? 'text-emerald-900 font-extrabold' : isDark ? 'text-sky-300 font-extrabold' : 'text-slate-900 font-extrabold') : 'text-slate-500 font-medium'
                  }`}
                >
                  <span>{tab.label}</span>
                  <ChevronUp className={`w-2 h-2 transition-transform duration-200 ${mobileSubjectOpen ? 'rotate-180' : ''}`} />
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
                className="flex flex-col items-center justify-center flex-1 py-0.5 select-none group cursor-pointer relative -top-1.5"
                title="进入考研 AI 伴学导师"
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`relative flex items-center justify-center w-10.5 h-8.5 rounded-xl transition-all duration-200 shadow-sm ${
                        isActive
                          ? isEyecare
                            ? 'bg-gradient-to-tr from-emerald-600 via-teal-700 to-emerald-600 text-white ring-2 ring-emerald-400 scale-105'
                            : isMinimal
                            ? 'bg-zinc-900 text-white ring-2 ring-zinc-400 scale-105'
                            : isDark
                            ? 'bg-gradient-to-tr from-sky-600 via-indigo-700 to-sky-600 text-white ring-2 ring-sky-400 scale-105'
                            : 'bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white ring-2 ring-indigo-400 scale-105'
                          : isEyecare
                          ? 'bg-gradient-to-tr from-[#1b4332] to-[#2d6a4f] text-emerald-200 border border-emerald-500/40 group-active:scale-95'
                          : isMinimal
                          ? 'bg-zinc-900 text-zinc-200 border border-zinc-700 group-active:scale-95'
                          : isDark
                          ? 'bg-gradient-to-tr from-[#0b0f19] to-slate-900 text-sky-300 border border-sky-800/40 group-active:scale-95'
                          : 'bg-gradient-to-tr from-slate-900 to-indigo-950 text-amber-300 border border-indigo-400/40 group-active:scale-95'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isEyecare ? 'bg-emerald-400' : isMinimal ? 'bg-zinc-300' : isDark ? 'bg-sky-400' : 'bg-amber-400'
                        }`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          isEyecare ? 'bg-emerald-400' : isMinimal ? 'bg-zinc-300' : isDark ? 'bg-sky-400' : 'bg-amber-400'
                        }`} />
                      </span>
                    </div>
                    <span
                      className={`text-2xs tracking-tight mt-0.5 transition-colors font-black ${
                        isActive
                          ? isEyecare
                            ? 'text-emerald-700'
                            : isMinimal
                            ? 'text-zinc-900'
                            : isDark
                            ? 'text-sky-400'
                            : 'text-indigo-600'
                          : isEyecare
                          ? 'text-[#243329]'
                          : isMinimal
                          ? 'text-zinc-800'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-800'
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
              data-tour={
                tab.to === '/dashboard'
                  ? 'nav-mobile-home'
                  : tab.to === '/quiz'
                    ? 'nav-mobile-quiz'
                    : tab.to === '/study'
                      ? 'nav-mobile-study'
                      : undefined
              }
              onPointerEnter={() => prefetchRoute(tab.to)}
              onTouchStart={() => prefetchRoute(tab.to)}
              className="flex flex-col items-center justify-center flex-1 py-0.5 select-none group cursor-pointer"
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative flex items-center justify-center w-9.5 h-6 rounded-lg transition-all duration-150 ${
                      isActive
                        ? isEyecare
                          ? 'bg-emerald-700 text-white shadow-xs scale-105'
                          : isMinimal
                          ? 'bg-zinc-900 text-white shadow-xs scale-105'
                          : isDark
                          ? 'bg-sky-600 text-white shadow-xs scale-105'
                          : 'bg-slate-900 text-white shadow-xs scale-105'
                        : 'text-slate-500 group-active:scale-95'
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                  </div>
                  <span
                    className={`text-2xs tracking-tight mt-0.5 transition-colors ${
                      isActive
                        ? isEyecare
                          ? 'text-emerald-900 font-extrabold'
                          : isDark
                          ? 'text-sky-300 font-extrabold'
                          : 'text-slate-900 font-extrabold'
                        : 'text-slate-500 font-medium'
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

      {/* ── 📱 移动端专属学科专攻上浮抽屉 (4大专项选择，与网页端学科专攻同步) ── */}
      {mobileSubjectOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileSubjectOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white/95 border-t border-slate-200/90 p-4 pb-[max(1.2rem,env(safe-area-inset-bottom))] shadow-xl backdrop-blur-2xl animate-slide-up space-y-3"
            role="dialog"
            aria-modal="true"
            aria-label="选择考研学科专攻"
          >
            {/* 顶栏拖拽条与标题 */}
            <div className="flex flex-col items-center gap-1.5 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
              <div className="w-full flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🎓</span>
                  <span className="text-sm font-extrabold text-slate-900">考研学科专攻</span>
                  <span className="text-2xs px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-bold font-mono">
                    4 大专项
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSubjectOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 active:scale-95 cursor-pointer"
                  aria-label="关闭学科专攻选择"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4 大学科卡片列表 */}
            <div className="grid grid-cols-1 gap-2">
              {subjectSpecialties.map(sub => {
                const isSubActive =
                  (sub.to === '/politics' && location.pathname === '/politics') ||
                  (sub.to === '/english' && location.pathname === '/english') ||
                  (location.pathname === '/quiz' && sub.to.includes('?') && location.search.includes(sub.to.split('?')[1]))
                const SubIcon = sub.icon

                return (
                  <Link
                    key={sub.to}
                    to={sub.to}
                    onClick={() => setMobileSubjectOpen(false)}
                    className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all active:scale-[0.98] cursor-pointer ${
                      isSubActive
                        ? isDark
                          ? 'bg-sky-950/50 border-sky-500/50 text-sky-200 shadow-sm shadow-sky-500/10'
                          : isEyecare
                          ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950 shadow-sm shadow-emerald-500/10'
                          : isVibrant
                          ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-300 shadow-sm shadow-indigo-500/10'
                          : 'bg-indigo-50/80 border-indigo-200/90 text-indigo-950 font-bold'
                        : isDark
                          ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-200'
                          : isEyecare
                          ? 'bg-[#fafbf8] hover:bg-[#ebf1e8] border-[#e2e9df] text-[#243329]'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${sub.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <SubIcon className={`w-4 h-4 ${sub.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`text-xs font-bold ${isSubActive ? 'text-indigo-900 font-extrabold' : 'text-slate-900'}`}>
                          {sub.label}
                        </span>
                        {sub.badge && (
                          <span className={`text-2xs px-1.5 py-0.2 rounded-md font-medium font-mono ${
                            isSubActive
                              ? 'bg-indigo-100 text-indigo-700 font-bold'
                              : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                          }`}>
                            {sub.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-2xs text-slate-500 truncate mt-0.5">
                        {sub.desc}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </Link>
                )
              })}
            </div>

            {/* 快捷取消按钮 */}
            <button
              type="button"
              onClick={() => setMobileSubjectOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center active:scale-98 transition-all cursor-pointer"
            >
              取消
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Floating Desktop Companion Pet */}
      {location.pathname !== '/chat' && <DesktopPet />}

      <Suspense fallback={null}>
        {(searchOpen || activeModals['search']) && <SearchModal isOpen={true} onClose={() => { setSearchOpen(false); closeModal('search') }} />}
        {(assistantOpen || activeModals['ai-assistant']) && (
          <AIAssistantModal
            isOpen={true}
            onClose={() => {
              setAssistantOpen(false)
              closeModal('ai-assistant')
            }}
            pagePath={location.pathname}
            initialContextPrompt={assistantLaunchState.contextPrompt}
            initialDefaultInput={assistantLaunchState.defaultInput}
            initialTriggerKey={assistantLaunchState.triggerKey}
          />
        )}
        {(importModalOpen || activeModals['import-resource']) && <ImportResourceModal isOpen={true} onClose={() => { setImportModalOpen(false); closeModal('import-resource') }} />}
        {isAdmin && (mobileModalOpen || activeModals['mobile-device']) && <MobileDeviceModal isOpen={true} onClose={() => { setMobileModalOpen(false); closeModal('mobile-device') }} />}
        {(quickNoteOpen || activeModals['quick-note']) && <QuickNoteDrawer isOpen={true} onClose={() => { setQuickNoteOpen(false); closeModal('quick-note') }} />}
      </Suspense>
    </div>
  )
}
