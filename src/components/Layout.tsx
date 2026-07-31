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

const navGroups = [
  {
    label: '知识工作',
    items: [
      { to: '/dashboard', label: '首页', icon: Home, emoji: '🏠' },
      { to: '/graph', label: '图谱', icon: Network, emoji: '🕸️' },
      { to: '/editor', label: '编辑', icon: FileEdit, emoji: '✏️' },
      { to: '/workflow', label: '整理', icon: Workflow, emoji: '🧭' },
      { to: '/chat', label: 'AI 对话', icon: MessageCircle, emoji: '💬' },
    ],
  },
  {
    label: '学习工具',
    items: [
      { to: '/study', label: '学习中心', icon: GraduationCap, emoji: '📚' },
      { to: '/quiz', label: '在线做题', icon: ClipboardList, emoji: '📝' },
      { to: '/vocabulary', label: '背单词', icon: Languages, emoji: '📖' },
      { to: '/pomodoro', label: '番茄钟', icon: Timer, emoji: '🍅' },
      { to: '/music', label: '专注音乐', icon: Music, emoji: '🎵' },
    ],
  },
  {
    label: '系统',
    items: [
      { to: '/settings', label: '设置', icon: Settings, emoji: '⚙️' },
    ],
  },
]

const allNavItems = navGroups.flatMap(group => group.items)
const primaryNavItems = allNavItems.filter(item =>
  ['/dashboard', '/editor', '/workflow', '/study'].includes(item.to)
)
const moreNavItems = allNavItems.filter(item => !primaryNavItems.some(primary => primary.to === item.to))

interface LayoutProps {
  children: ReactNode
}

function navClass(isActive: boolean) {
  return `inline-flex items-center rounded-full px-3 py-1.5 text-[13px] transition-colors ${
    isActive
      ? 'bg-slate-100 font-medium text-warm-900'
      : 'text-warm-500 hover:bg-slate-100/80 hover:text-warm-900'
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
  const vaultName = stats?.vaultPath.split(/[\\/]/).filter(Boolean).pop() || '本地知识系统'

  useVaultEvents((event) => {
    const action = event.type === 'file-changed' ? '文件已更新' : event.type === 'file-added' ? '新文件已加入' : '文件已删除'
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
    document.title = `${currentPage?.label || '首页'} · ${vaultName} | Knowledge Viz`
    setMobileNavOpen(false)
    setMoreOpen(false)
  }, [currentPage?.label, vaultName])

  return (
    <div className="min-h-screen bg-cream-50 text-warm-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
          <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/50">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-warm-900 text-[10px] font-semibold tracking-tight text-white">KV</span>
            <span className="hidden text-[14px] font-semibold tracking-[-0.02em] text-warm-900 sm:inline">Knowledge Viz</span>
          </Link>

          <nav className="ml-4 hidden flex-1 items-center justify-center gap-0.5 xl:flex" aria-label="主导航">
            {primaryNavItems.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => navClass(isActive)}>
                {item.label}
              </NavLink>
            ))}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(previous => !previous)}
                className={navClass(moreOpen || moreNavItems.some(item => item.to === location.pathname))}
                aria-expanded={moreOpen}
              >
                更多
                <ChevronDown className={`ml-1 h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
                  <p className="px-3 pb-1.5 pt-1 text-[10px] font-medium tracking-wide text-warm-400">扩展工具</p>
                  {moreNavItems.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-slate-100 font-medium text-warm-900' : 'text-warm-600 hover:bg-slate-100'}`}
                    >
                      <item.icon className="h-4 w-4 text-warm-400" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="搜索知识"
              title="搜索知识（Ctrl+K）"
              className="inline-flex h-8 items-center gap-2 rounded-full px-2.5 text-warm-500 transition-colors hover:bg-slate-100 hover:text-warm-900 sm:px-3"
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-xs lg:inline">搜索</span>
              <kbd className="hidden rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-warm-400 2xl:inline">Ctrl K</kbd>
            </button>
            <div className="hidden items-center gap-2 rounded-full px-2.5 py-1.5 text-xs text-warm-500 sm:flex" title={vaultName}>
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-accent-sage' : 'bg-accent-rose'}`} />
              <span className="hidden max-w-28 truncate md:inline">{connected ? '已连接' : apiHealthy === null ? '连接中' : '离线'}</span>
            </div>
            <Link to="/settings" aria-label="设置" title="设置" className="hidden h-8 w-8 items-center justify-center rounded-full text-warm-500 transition-colors hover:bg-slate-100 hover:text-warm-900 sm:inline-flex">
              <Settings className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setMobileNavOpen(previous => !previous)}
              aria-label={mobileNavOpen ? '关闭导航' : '打开导航'}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-warm-600 transition-colors hover:bg-slate-100 xl:hidden"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-slate-200/80 bg-white px-4 pb-4 pt-3 xl:hidden">
            <div className="mx-auto max-w-[1440px]">
              {navGroups.map(group => (
                <div key={group.label} className="mb-4 last:mb-0">
                  <p className="mb-1.5 px-2 text-[11px] font-medium text-warm-400">{group.label}</p>
                  <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                    {group.items.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileNavOpen(false)}
                        className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${isActive ? 'bg-slate-100 font-medium text-warm-900' : 'text-warm-600 hover:bg-slate-100'}`}
                      >
                        <item.icon className="h-4 w-4 text-warm-400" />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 border-t border-slate-200 pt-3 text-xs text-warm-400">
                <BookOpen className="h-3.5 w-3.5" />
                {noteCount !== null ? `${noteCount} 篇笔记 · ${vaultName}` : '尚未读取笔记'}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-[1600px]">
        {syncNotice && (
          <div className="fixed right-5 top-[4.5rem] z-30 flex items-center gap-2 rounded-full border border-accent-sage/20 bg-white/90 px-4 py-2 text-xs text-accent-sage shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <AlertCircle className="h-3.5 w-3.5" />
            {syncNotice}
          </div>
        )}
        <div className="min-w-0 px-4 py-7 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>

      {!assistantOpen && (
        <button
          onClick={() => setAssistantOpen(true)}
          aria-label="打开 AI 助手"
          title="打开 AI 助手（Ctrl/⌘ + Shift + A）"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-warm-900 px-4 py-3 text-xs font-medium text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] transition-transform hover:-translate-y-0.5 hover:bg-warm-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/60"
        >
          <Sparkles className="h-4 w-4 text-accent-orange" />
          <span className="hidden sm:inline">问 AI</span>
        </button>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <AIAssistantModal isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} pagePath={location.pathname} />
    </div>
  )
}
