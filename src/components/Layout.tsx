import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'
import { Network, Workflow, MessageCircle, BookOpen, ExternalLink, FileEdit, GraduationCap, Search, Settings, AlertCircle, Music, ClipboardList, Languages, Timer } from 'lucide-react'
import { useVaultStats, useApiHealth } from '../hooks/useVaultData'
import { useVaultEvents } from '../hooks/useVaultEvents'
import SearchModal from './SearchModal'
import { getDailyQuote } from '../data/quotes'

const navItems = [
  { to: '/graph', label: '知识库', icon: Network, emoji: '🧠' },
  { to: '/workflow', label: '工作流', icon: Workflow, emoji: '⚙️' },
  { to: '/editor', label: '笔记编辑', icon: FileEdit, emoji: '✏️' },
  { to: '/study', label: '学习中心', icon: GraduationCap, emoji: '📚' },
  { to: '/quiz', label: '在线做题', icon: ClipboardList, emoji: '📝' },
  { to: '/vocabulary', label: '背单词', icon: Languages, emoji: '📖' },
  { to: '/music', label: '音乐', icon: Music, emoji: '🎵' },
  { to: '/pomodoro', label: '番茄钟', icon: Timer, emoji: '🍅' },
  { to: '/chat', label: 'AI 聊天', icon: MessageCircle, emoji: '💬' },
  { to: '/settings', label: '设置', icon: Settings, emoji: '⚙️' },
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
  const [syncNotice, setSyncNotice] = useState<string | null>(null)
  const [quote] = useState(getDailyQuote)

  const noteCount = stats?.totalNotes ?? null
  const connected = apiHealthy === true

  // SSE vault events for bidirectional sync
  useVaultEvents((event) => {
    setSyncNotice(`${event.type === 'file-changed' ? '文件已更新' : event.type === 'file-added' ? '新文件' : '文件已删除'}: ${event.path.split('/').pop()}`)
    setTimeout(() => setSyncNotice(null), 3000)
  })

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
    <div className="flex min-h-screen bg-cream-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-cream-200 bg-cream-100 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent-orange to-accent-peach flex items-center justify-center text-white font-bold text-sm shadow-sm">
              KV
            </div>
            <div>
              <h1 className="text-sm font-bold text-warm-800 leading-tight">Knowledge Viz</h1>
              <p className="text-[11px] text-warm-400 mt-0.5">知识库助手</p>
            </div>
          </div>
        </div>

        {/* Daily Quote */}
        <div className="px-4 pt-3 pb-1">
          <div className="px-3 py-2.5 rounded-xl bg-accent-peach/10 border border-accent-peach/20">
            <p className="text-[11px] text-warm-600 leading-relaxed">{quote}</p>
          </div>
        </div>

        {/* Search trigger */}
        <div className="px-3 pt-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-warm-400 bg-surface border border-cream-200 hover:text-warm-600 hover:border-cream-300 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            搜索笔记...
            <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-cream-200 text-warm-400 font-mono">Ctrl+K</kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-accent-orange/15 text-warm-800 font-medium shadow-sm'
                    : 'text-warm-500 hover:text-warm-700 hover:bg-cream-200/60'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0 opacity-70 group-hover:opacity-100" />
              <span>{item.label}</span>
              {item.to === '/vocabulary' && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-accent-orange/20 text-accent-orange border border-accent-orange/20">
                  NEW
                </span>
              )}
              {item.to === '/quiz' && (
                <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-accent-orange/20 text-accent-orange border border-accent-orange/20">
                  NEW
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-cream-200 space-y-2">
          <a
            href="https://github.com/qts2218346424-cyber/obsidian-knowledge-viz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-warm-400 hover:text-warm-600 hover:bg-cream-200/60 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            GitHub 仓库
          </a>
          <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-warm-400">
            <BookOpen className="w-3.5 h-3.5" />
            {noteCount !== null ? `${noteCount} 篇笔记` : '未连接'}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 border-b border-cream-200 bg-surface/80 backdrop-blur-sm flex items-center px-6">
          <h2 className="text-sm font-medium text-warm-700">
            {currentPage?.emoji} {currentPage?.label || '首页'}
          </h2>
          <div className="ml-auto flex items-center gap-3">
            {/* Sync notification */}
            {syncNotice && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-sage/10 border border-accent-sage/20 text-[11px] text-accent-sage animate-pulse">
                <AlertCircle className="w-3 h-3" />
                {syncNotice}
              </div>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              connected
                ? 'bg-cream-100 border-cream-200 text-warm-500'
                : 'bg-accent-rose/10 border-accent-rose/20 text-accent-rose'
            }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-accent-sage animate-pulse' : 'bg-accent-rose'}`} />
              {connected ? '已连接' : '离线'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6 pb-24 animate-fade-in-up">
          {children}
        </div>
      </main>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
