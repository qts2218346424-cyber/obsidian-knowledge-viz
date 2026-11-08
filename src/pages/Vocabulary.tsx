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
          <p className="text-slate-400 text-xs">{this.state.error}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: '' })}
            className="mt-3 px-4 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200"
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
  { key: 'review', label: '高频复习', icon: Headphones },
  { key: 'browse', label: '大纲词库', icon: BookOpen },
  { key: 'stats', label: '记忆统计', icon: BarChart3 },
  { key: 'relations', label: '词根图谱', icon: Network },
  { key: 'import', label: '词表导入', icon: Upload },
]

export default function Vocabulary() {
  const [tab, setTab] = useState<Tab>('review')

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="bento-card rounded-3xl p-4 sm:p-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="fluid-section-title font-extrabold text-slate-900 flex items-center gap-2">
            <span>📖 考研英语核心词汇</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">真题语境记忆 · 艾宾浩斯间隔重复 · 词根派生网络</p>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 font-bold text-indigo-700">
            2000+ 核心词
          </span>
        </div>
      </div>

      {/* Tab bar - 手机端单行丝滑横滑，杜绝横向撑爆屏幕 */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto whitespace-nowrap no-scrollbar border-b border-slate-200/80 pb-2.5">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer active:scale-95 ${
              tab === t.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <t.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={tab === 'relations' ? 'h-[calc(100dvh-250px)]' : ''}>
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
