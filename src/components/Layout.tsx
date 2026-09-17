import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  AlertCircle,
  BookOpen,
  ClipboardList,
  ChevronDown,
  FileEdit,
  GraduationCap,
  Home,
  Languages,
  MessageCircle,
  MoreHorizontal,
  Music,
  Network,
  Search,
  Settings,
  Timer,

  Workflow,
  X,
  Database,
  Smartphone,
} from 'lucide-react'
import { useVaultStats, useApiHealth } from '../hooks/useVaultData'
import { useVaultEvents } from '../hooks/useVaultEvents'
import SearchModal from './SearchModal'
import AIAssistantModal from './AIAssistantModal'
import ImportResourceModal from './ImportResourceModal'
import MobileDeviceModal from './MobileDeviceModal'
import DesktopPet from './Pet/DesktopPet'


interface NavItem {
  to: string
  label: string
  icon: any
  emoji: string
  badge?: string
  desc?: string
}

const primaryNavItems: NavItem[] = [
  { to: '/dashboard', label: '首页', icon: Home, emoji: '🏠' },
  { to: '/quiz', label: '做题中心', icon: ClipboardList, emoji: '📝', badge: '408+数学' },
  { to: '/study', label: '学习中心', icon: GraduationCap, emoji: '📚' },
  { to: '/graph', label: '知识图谱', icon: Network, emoji: '🕸️' },
  { to: '/editor', label: '笔记编辑', icon: FileEdit, emoji: '✏️' },
  { to: '/chat', label: 'AI 伴学', icon: MessageCircle, emoji: '💬' },
]

const moreNavItems: NavItem[] = [
  { to: '/workflow', label: '知识库整理', icon: Workflow, emoji: '🧭', desc: 'Lint、标签治理与结构优化' },
  { to: '/vocabulary', label: '考研英语词汇', icon: Languages, emoji: '📖', desc: '核心高频大纲词汇复盘' },
  { to: '/pomodoro', label: '专注番茄钟', icon: Timer, emoji: '🍅', desc: '心流沉浸与时间切片' },
  { to: '/music', label: '声学专注氛围', icon: Music, emoji: '🎵', desc: '双耳节拍与白噪音音频' },
  { to: '/settings', label: '全局系统设置', icon: Settings, emoji: '⚙️', desc: '知识库路径与 AI 服务模型' },
]

const allNavItems = [...primaryNavItems, ...moreNavItems]

interface LayoutProps {
  children: ReactNode
}

function navClass(isActive: boolean) {
  return `relative inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all duration-200 ${
    isActive
      ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/25'
      : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
  }`
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const currentPage = allNavItems.find(item => location.pathname === item.to)
  const apiHealthy = useApiHealth()
  const { stats } = useVaultStats()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [syncNotice, setSyncNotice] = useState<string | null>(null)

  const noteCount = stats?.totalNotes ?? null
  const connected = apiHealthy === true
  const vaultName = stats?.vaultPath.split(/[\\/]/).filter(Boolean).pop() || '本地知识库'

  useVaultEvents((event) => {
    const action = event.type === 'file-changed' ? '文件已更新' : event.type === 'file-added' ? '新笔记加入' : '文件已删除'
    setSyncNotice(`${action}：${event.path.split('/').pop()}`)
    setTimeout(() => setSyncNotice(null), 3000)
  })

  useEffect(() => {
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
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    document.title = `${currentPage?.label || '首页'} · ${vaultName} | CoreForge 研核 (408 + 考研数学)`
    setMobileNavOpen(false)
    setMoreOpen(false)
  }, [currentPage?.label, vaultName])

  return (
    <div className="min-h-screen aurora-mesh text-slate-900 selection:bg-accent-orange/20 selection:text-accent-orange font-sans antialiased">
      <header className="glass-header sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-[1520px] items-center gap-3 px-4 sm:px-6">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5 rounded-xl outline-none group">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-slate-950 p-1 shadow-md shadow-indigo-500/20 ring-1 ring-white/20 transition-all group-hover:scale-105 group-hover:ring-indigo-400">
              <img src="/favicon.svg" alt="CoreForge Logo" className="h-full w-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14.5px] font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                CoreForge
                <span className="text-[11px] font-semibold text-indigo-600">研核</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                  408+数学 双核
                </span>
              </span>
            </div>
          </Link>

          {/* Primary Navigation */}
          <nav className="ml-4 hidden flex-1 items-center justify-center gap-1 xl:flex" aria-label="主导航">
            {primaryNavItems.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => navClass(isActive)}>
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                        isActive ? 'bg-accent-orange text-white' : 'bg-accent-orange/15 text-accent-orange'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* More Tools Dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setMoreOpen(previous => !previous)}
                className={navClass(moreOpen || moreNavItems.some(item => item.to === location.pathname))}
                aria-expanded={moreOpen}
              >
                <span>更多工具</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_20px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl animate-fade-in-up">
                  <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">研学辅助工具</p>
                  {moreNavItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-xs transition-colors ${
                        isActive ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">{item.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800">{item.label}</div>
                        {item.desc && <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>}
                      </div>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right utility toolbar */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setMobileModalOpen(true)}
              aria-label="手机/平板连线"
              title="手机/平板连线 (局域网扫码/PWA/APK)"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 px-2.5 text-emerald-700 text-xs font-semibold shadow-2xs hover:from-emerald-500/20 hover:to-teal-500/20 transition-all cursor-pointer"
            >
              <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">手机/平板</span>
            </button>

            <button
              onClick={() => setImportModalOpen(true)}
              aria-label="导入资料与题库"
              title="导入资料与题库 (PDF/教材/真题/学情)"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 px-2.5 text-indigo-700 text-xs font-semibold shadow-2xs hover:from-indigo-100 hover:to-blue-100 transition-all cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">导入资料/题库</span>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              aria-label="搜索知识"
              title="搜索知识（Ctrl+K）"
              className="inline-flex h-8 items-center gap-2 rounded-xl border border-slate-200/90 bg-white/80 px-3 text-slate-500 transition-all hover:border-accent-orange/40 hover:bg-white hover:text-slate-900 shadow-sm"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden text-xs lg:inline">全局检索...</span>
              <kbd className="hidden rounded bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 font-mono text-[9px] text-slate-500 2xl:inline">Ctrl K</kbd>
            </button>

            {/* Live Vault Status Beacon */}
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs text-slate-600 shadow-sm sm:flex backdrop-blur-sm" title={vaultName}>
              <span className="relative flex h-2 w-2">
                {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </span>
              <span className="hidden max-w-32 truncate font-medium text-[11px] md:inline">
                {connected ? vaultName : '未连接知识库'}
              </span>
            </div>

            <Link
              to="/settings"
              aria-label="设置"
              title="系统设置"
              className="hidden h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 shadow-sm sm:inline-flex"
            >
              <Settings className="h-4 w-4" />
            </Link>

            <button
              onClick={() => setMobileNavOpen(previous => !previous)}
              aria-label={mobileNavOpen ? '关闭导航' : '打开导航'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 transition-colors hover:bg-slate-100 xl:hidden"
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sheet */}
        {mobileNavOpen && (
          <div className="border-t border-slate-200/80 bg-white/95 px-4 pb-4 pt-3 xl:hidden backdrop-blur-xl">
            <div className="mx-auto max-w-[1520px]">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {allNavItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) => `flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs transition-colors ${
                      isActive
                        ? 'border-accent-orange/40 bg-accent-orange/10 font-semibold text-accent-orange'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-slate-200 mt-3 pt-3 text-xs text-slate-400">
                <BookOpen className="h-3.5 w-3.5" />
                {noteCount !== null ? `${noteCount} 篇笔记已连接 · ${vaultName}` : '等待连接 Vault'}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area with safe area for mobile bottom dock */}
      <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-[1600px] pb-16 xl:pb-0">
        {syncNotice && (
          <div className="fixed right-5 top-[4.5rem] z-30 flex items-center gap-2 rounded-full border border-accent-sage/30 bg-white/95 px-4 py-2 text-xs font-medium text-accent-sage shadow-[0_12px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl animate-fade-in-up">
            <AlertCircle className="h-3.5 w-3.5" />
            {syncNotice}
          </div>
        )}
        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar (Dock) */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200/80 px-2 py-1 flex items-center justify-around shadow-[0_-4px_25px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors ${
            isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="h-5 w-5 mb-0.5" />
          <span>首页</span>
        </NavLink>
        <NavLink
          to="/quiz"
          className={({ isActive }) => `flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors ${
            isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="h-5 w-5 mb-0.5" />
          <span>刷题</span>
        </NavLink>
        <NavLink
          to="/study"
          className={({ isActive }) => `flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors ${
            isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="h-5 w-5 mb-0.5" />
          <span>学习</span>
        </NavLink>
        <NavLink
          to="/chat"
          className={({ isActive }) => `flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors ${
            isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="h-5 w-5 mb-0.5" />
          <span>伴学</span>
        </NavLink>
        <button
          onClick={() => setMobileModalOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <Smartphone className="h-5 w-5 mb-0.5" />
          <span>连线</span>
        </button>
      </nav>

      {/* Floating Desktop Companion Pet 「研小核」 */}
      <DesktopPet />

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AIAssistantModal isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} pagePath={location.pathname} />
      <ImportResourceModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />
      <MobileDeviceModal isOpen={mobileModalOpen} onClose={() => setMobileModalOpen(false)} />
    </div>
  )
}
