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
  Sparkles,
  Timer,
  Workflow,
  X,
} from 'lucide-react'
import { useVaultStats, useApiHealth } from '../hooks/useVaultData'
import { useVaultEvents } from '../hooks/useVaultEvents'
import SearchModal from './SearchModal'
import AIAssistantModal from './AIAssistantModal'

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

      {/* Main Content Area */}
      <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-[1600px]">
        {syncNotice && (
          <div className="fixed right-5 top-[4.5rem] z-30 flex items-center gap-2 rounded-full border border-accent-sage/30 bg-white/95 px-4 py-2 text-xs font-medium text-accent-sage shadow-[0_12px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl animate-fade-in-up">
            <AlertCircle className="h-3.5 w-3.5" />
            {syncNotice}
          </div>
        )}
        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      {/* Floating AI Copilot Trigger */}
      {!assistantOpen && (
        <button
          onClick={() => setAssistantOpen(true)}
          aria-label="打开研考 AI 伴学助手"
          title="打开研考 AI 伴学助手（Ctrl/⌘ + Shift + A）"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-white/25 px-4 py-3 text-xs font-semibold text-white shadow-[0_16px_35px_rgba(15,23,42,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_45px_rgba(99,102,241,0.4)] group"
        >
          <div className="relative">
            <Sparkles className="h-4 w-4 text-accent-orange animate-pulse-soft" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
          </div>
          <span>研考 AI 伴学</span>
          <kbd className="hidden rounded bg-white/15 px-1.5 py-0.5 font-mono text-[9px] text-white/80 sm:inline">Ctrl+Shift+A</kbd>
        </button>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AIAssistantModal isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} pagePath={location.pathname} />
    </div>
  )
}
