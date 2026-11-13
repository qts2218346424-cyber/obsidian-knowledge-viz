import { useState, useEffect, Component, lazy, Suspense, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  BarChart3,
  Network,
  Upload,
  Headphones,
  Palette,
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle2,
  Copy,
  ArrowRight,
} from 'lucide-react'
import VocabTab from '../components/study/VocabTab'
import WordBrowser from '../components/vocab/WordBrowser'
import VocabStats from '../components/vocab/VocabStats'
const WordRelations = lazy(() => import('../components/vocab/WordRelations'))
import ImportPanel from '../components/vocab/ImportPanel'

// 词汇 5 级掌握度色谱数据 (Subframe Screen 4 Swatches Replica)
const VOCAB_SWATCH_LEVELS = [
  { level: 'Level 50', name: '生词录入 · 未背', hex: '#f4f4f5', desc: '刚从真题长难句或大纲中提取，尚未形成记忆痕迹', example: 'ephemeral · 短暂的' },
  { level: 'Level 200', name: '初次认知 · 模糊', hex: '#e4e4e7', desc: '艾宾浩斯第 1 天复习，能模糊辨识词性与常见词根', example: 'ambiguous · 模棱两可的' },
  { level: 'Level 400', name: '词根联想 · 熟悉', hex: '#a1a1aa', desc: '掌握词缀派生，在真题阅读上下文可自主推导词义', example: 'comprehensive · 全面的' },
  { level: 'Level 700', name: '熟练掌握 · 秒杀', hex: '#52525b', desc: '熟记熟词生义与常见考法，听辨与写作皆能自如运用', example: 'arbitrary · 武断的/专断的' },
  { level: 'Level 950', name: '绝对斩词 · 永久', hex: '#18181b', desc: '连续 5 次以上正确复述，已完全固化为长期本能记忆', example: 'paradox · 悖论' },
]

// 英语常考词根词缀矩阵
const ROOT_AFFIX_SWATCHES = [
  { hex: '#faf5ff', textHex: '#9333ea', name: 'spec / spect', meaning: '看、注视', words: 'inspect, perspective, retrospect' },
  { hex: '#f3e8ff', textHex: '#7e22ce', name: 'dict / dic', meaning: '说、指示', words: 'predict, contradict, dictate' },
  { hex: '#e9d5ff', textHex: '#6b21a8', name: 'tract', meaning: '拉、引', words: 'abstract, attract, distract' },
  { hex: '#d8b4fe', textHex: '#581c87', name: 'vert / vers', meaning: '转、变', words: 'divert, inverse, reverse' },
  { hex: '#c084fc', textHex: '#3b0764', name: 'gen / gener', meaning: '出生、种族', words: 'generate, homogeneous, genuine' },
  { hex: '#a855f7', textHex: '#ffffff', name: 'chron', meaning: '时间', words: 'chronicle, synchronous, chronic' },
  { hex: '#9333ea', textHex: '#ffffff', name: 'cogn / gnos', meaning: '知道、认识', words: 'recognize, diagnose, cognizant' },
]

// 词汇掌握度色谱组件
function VocabMasteryPalette() {
  const [copiedWord, setCopiedWord] = useState<string | null>(null)

  const handleCopy = (word: string) => {
    navigator.clipboard?.writeText?.(word)
    setCopiedWord(word)
    setTimeout(() => setCopiedWord(null), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      {/* 顶部操作条 */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-xs border border-slate-200/80 text-xs font-semibold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>词汇认知深度色谱 · 5 阶梯度模型</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400 font-mono text-2xs">2026 研考词库</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
            艾宾浩斯 24h 追踪
          </div>
        </div>
      </div>

      {/* 阶度卡片网格 */}
      <div className="bg-white rounded-2xl border border-black/[0.08] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">记忆深度梯度 (Retention Gradient)</h3>
            <p className="text-xs text-slate-500 mt-0.5">从初识模糊到长期永久记忆的认知阶跃轨迹</p>
          </div>
          <span className="text-2xs font-mono text-slate-400">LEVEL 50 ~ 950</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {VOCAB_SWATCH_LEVELS.map((item, idx) => (
            <div
              key={item.level}
              onClick={() => handleCopy(item.example)}
              className="group p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-900 transition-all cursor-pointer bg-slate-50/50 hover:bg-white shadow-xs hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-2xs font-mono font-semibold text-slate-400">{item.level}</span>
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shadow-inner group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: item.hex }}
                  />
                </div>
                <div className="text-xs font-bold text-slate-900">{item.name}</div>
                <p className="text-2xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-2xs font-mono text-slate-600 flex items-center justify-between">
                <span className="truncate">{item.example}</span>
                <Copy className="h-3 w-3 text-slate-400 group-hover:text-slate-900 shrink-0" />
              </div>
            </div>
          ))}
        </div>
        {copiedWord && (
          <div className="text-center text-xs text-emerald-600 font-medium">
            ✅ 已复制示例单词: {copiedWord}
          </div>
        )}
      </div>

      {/* 词根词缀高频谱系 */}
      <div className="bg-white rounded-2xl border border-black/[0.08] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">核心高频词根族谱 (Root Family Swatches)</h3>
            <p className="text-xs text-slate-500 mt-0.5">考研真题命题率最高的前缀、词根与衍生词群</p>
          </div>
          <span className="text-2xs font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            紫罗兰考点系
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {ROOT_AFFIX_SWATCHES.map(root => (
            <div
              key={root.name}
              className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-purple-300 transition-all shadow-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900">{root.name}</span>
                <span className="text-2xs font-medium text-purple-700 bg-purple-100/70 px-1.5 py-0.2 rounded">
                  {root.meaning}
                </span>
              </div>
              <div className="text-2xs font-mono text-slate-500 leading-snug">
                {root.words}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Error boundary
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
            className="mt-3 px-4 py-1.5 bg-slate-900 rounded-lg text-xs font-semibold text-white hover:bg-slate-800"
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

type Tab = 'review' | 'palette' | 'browse' | 'stats' | 'relations' | 'import'

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: 'review', label: '真题刷词', icon: Headphones },
  { key: 'palette', label: '词汇色谱', icon: Palette },
  { key: 'browse', label: '大纲词库', icon: BookOpen },
  { key: 'stats', label: '记忆统计', icon: BarChart3 },
  { key: 'relations', label: '词根图谱', icon: Network },
  { key: 'import', label: '词表导入', icon: Upload },
]

export default function Vocabulary() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTabParam = searchParams.get('tab') as Tab | null
  const [tab, setTab] = useState<Tab>(
    initialTabParam && ['review', 'palette', 'browse', 'stats', 'relations', 'import'].includes(initialTabParam)
      ? initialTabParam
      : 'review'
  )

  useEffect(() => {
    const paramTab = searchParams.get('tab') as Tab | null
    if (paramTab && ['review', 'palette', 'browse', 'stats', 'relations', 'import'].includes(paramTab)) {
      setTab(paramTab)
    }
  }, [searchParams])

  const handleSelectTab = (nextTab: Tab) => {
    setTab(nextTab)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', nextTab)
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in-up pb-10">
      {/* 顶部双轨角落胶囊 (Subframe Screen 3 Corner Pills) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-800">考研英语词汇中心</span>
            <span className="text-slate-300">|</span>
            <span className="text-2xs text-slate-500 font-mono">2000+ 核心真题词</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs text-slate-600 font-medium">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>艾宾浩斯智能间隔</span>
          </div>
        </div>
      </div>

      {/* 工作区团队头 (Subframe Team Header Bar) */}
      <div className="bg-white rounded-2xl border border-black/[0.08] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              考研英语 · 核心词汇复盘工作区
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-2xs font-mono font-medium">
              VOCABULARY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            历年真题真题语境浸润 · 艾宾浩斯动态推迟 · 词根词缀衍生知识图谱
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="text-2xs text-slate-400 uppercase tracking-wider font-semibold">今日推荐</div>
            <div className="text-sm font-bold font-mono text-slate-900">20 词 / 组</div>
          </div>
        </div>
      </div>

      {/* 现代极简药丸导航条 (Subframe Flow Nav Bar) */}
      <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap no-scrollbar pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => handleSelectTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer active:scale-98 shadow-xs ${
              tab === t.key
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <t.icon className="w-3.5 h-3.5 shrink-0" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 页面内容区 */}
      <div className={tab === 'relations' ? 'h-[72dvh] min-h-[500px] md:h-[calc(100dvh-270px)] md:min-h-[560px]' : ''}>
        <TabErrorBoundary>
          {tab === 'review' && <VocabTab />}
          {tab === 'palette' && <VocabMasteryPalette />}
          {tab === 'browse' && <WordBrowser />}
          {tab === 'stats' && <VocabStats />}
          {tab === 'relations' && (
            <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">正在装载词根词缀衍生树...</div>}>
              <WordRelations />
            </Suspense>
          )}
          {tab === 'import' && <ImportPanel />}
        </TabErrorBoundary>
      </div>
    </div>
  )
}
