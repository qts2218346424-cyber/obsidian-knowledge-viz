import { useState, Component, type ReactNode } from 'react'
import { BookOpen, BarChart3, Network, Upload, Headphones } from 'lucide-react'
import VocabTab from '../components/study/VocabTab'
import WordBrowser from '../components/vocab/WordBrowser'
import VocabStats from '../components/vocab/VocabStats'
import WordRelations from '../components/vocab/WordRelations'
import ImportPanel from '../components/vocab/ImportPanel'

// Error boundary to catch runtime errors in tab content
interface EBState { hasError: boolean; error: string }
class TabErrorBoundary extends Component<{ children: ReactNode; onReset?: () => void }, EBState> {
  state: EBState = { hasError: false, error: '' }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  componentDidCatch(error: Error) {
    console.error('[Vocabulary Tab Error]', error)
  }
  componentDidUpdate(prev: { children: ReactNode }) {
    if (prev.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: '' })
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500 text-sm mb-2">组件渲染出错</p>
          <p className="text-warm-400 text-xs">{this.state.error}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: '' })}
            className="mt-3 px-4 py-1.5 bg-cream-200 rounded-lg text-xs text-warm-600 hover:bg-cream-300"
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

type Tab = 'review' | 'browse' | 'stats' | 'relations' | 'import'

const tabs: { key: Tab; label: string; icon: typeof BookOpen }[] = [
  { key: 'review', label: '复习', icon: Headphones },
  { key: 'browse', label: '词库', icon: BookOpen },
  { key: 'stats', label: '统计', icon: BarChart3 },
  { key: 'relations', label: '关系图', icon: Network },
  { key: 'import', label: '导入', icon: Upload },
]

export default function Vocabulary() {
  const [tab, setTab] = useState<Tab>('review')

  return (
    <div className="max-w-5xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">📖 背单词</h1>
          <p className="text-sm text-warm-500 mt-1">语境记忆 · 间隔重复 · 核心词库</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-warm-400">
          <span className="px-2 py-1 rounded-full bg-cream-200">2000+ 词</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-cream-200 pb-3 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === t.key
                ? 'bg-accent-orange/15 text-warm-800 border border-accent-orange/30'
                : 'bg-cream-200 text-warm-500 hover:text-warm-700 hover:bg-cream-300 border border-transparent'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={tab === 'relations' ? 'h-[calc(100vh-220px)]' : ''}>
        <TabErrorBoundary>
          {tab === 'review' && <VocabTab />}
          {tab === 'browse' && <WordBrowser />}
          {tab === 'stats' && <VocabStats />}
          {tab === 'relations' && <WordRelations />}
          {tab === 'import' && <ImportPanel />}
        </TabErrorBoundary>
      </div>
    </div>
  )
}
