import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'
import { Network, LayoutDashboard, Workflow, MessageCircle, BookOpen, ExternalLink, FileEdit, GraduationCap, Search } from 'lucide-react'
import { useVaultStats, useApiHealth } from '../hooks/useVaultData'
import SearchModal from './SearchModal'

const navItems = [
  { to: '/graph', label: '知识图谱', icon: Network },
  { to: '/dashboard', label: 'Vault 仪表盘', icon: LayoutDashboard },
  { to: '/workflow', label: '工作流', icon: Workflow },
  { to: '/editor', label: '笔记编辑', icon: FileEdit },
  { to: '/study', label: '学习中心', icon: GraduationCap },
  { to: '/chat', label: 'AI 聊天', icon: MessageCircle },
]

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const currentPage = navItems.find(n => location.pathname.startsWith(n.to))
  const apiHealthy = useApiHealth()
  const { stats } = useVaultStats()
  const [searchOpen, setSearchOpen] = useState(false)

  const noteCount = stats?.totalNotes ?? null
  const connected = apiHealthy === true

  // Global Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              KV
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100 leading-tight">Knowledge Viz</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Obsidian + Web 可视化</p>
            </div>
          </div>
        </div>

        {/* Search trigger */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 bg-slate-900 border border-slate-800 hover:text-slate-300 hover:border-slate-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            搜索笔记...
            <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-600 font-mono">Ctrl+K</kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 shrink-0 opacity-70 group-hover:opacity-100" />
              <span>{item.label}</span>
              {item.to === '/study' && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                  NEW
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-800 space-y-2">
          <a
            href="https://github.com/AgriciDaniel/claude-obsidian"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            claude-obsidian
          </a>
          <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-slate-600">
            <BookOpen className="w-3.5 h-3.5" />
            {noteCount !== null ? `${noteCount} notes indexed` : '未连接'}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm flex items-center px-6">
          <h2 className="text-sm font-medium text-slate-200">
            {currentPage?.label || 'Overview'}
          </h2>
          <div className="ml-auto flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
              connected
                ? 'bg-slate-800/60 border-slate-700/50 text-slate-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {connected ? 'Vault Connected' : 'API Offline'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
