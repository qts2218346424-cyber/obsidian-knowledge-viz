import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  FilePlus2,
  FileText,
  FolderOpen,
  HeartPulse,
  Link2,
  Sparkles,
  ClipboardList,
  Flame,
  Sigma,
  Cpu,
  Compass,
  Clock,
} from 'lucide-react'
import { api, type FileListItem } from '../services/api'
import { useVaultHealth, useVaultStats } from '../hooks/useVaultData'
import { QUESTION_BANK } from '../data/questions'
import { MATH_QUESTION_BANK } from '../data/questions/math'

function getVaultName(vaultPath?: string) {
  if (!vaultPath) return '你的知识库'
  return vaultPath.split(/[\\/]/).filter(Boolean).pop() || '你的知识库'
}

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，注意劳逸结合'
  if (hour < 11) return '早安，今天也是高能冲刺的一天'
  if (hour < 14) return '午安，复盘一下上午的知识点吧'
  if (hour < 18) return '下午好，保持专注，攻克难题'
  return '晚上好，梳理错题与今日总结'
}

function formatModifiedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '未知时间'

  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

interface MetricCardProps {
  label: string
  value: number | string
  subtext?: string
  icon: any
  glowClass: string
  gradientIcon: string
}

function MetricCard({ label, value, subtext, icon: Icon, glowClass, gradientIcon }: MetricCardProps) {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-20 blur-xl pointer-events-none group-hover:opacity-35 transition-opacity ${glowClass}`} />
      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-600">{label}</span>
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105 ${gradientIcon}`}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      </div>
      <div className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight text-slate-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtext && <div className="mt-1 text-[11px] font-medium text-slate-500 truncate">{subtext}</div>}
    </div>
  )
}


export default function Dashboard() {
  const { stats, loading: statsLoading } = useVaultStats()
  const { report, loading: healthLoading } = useVaultHealth()
  const [recentFiles, setRecentFiles] = useState<FileListItem[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [mobileStationTab, setMobileStationTab] = useState<'math' | 'cs'>('math')

  useEffect(() => {
    let cancelled = false
    api.getFiles()
      .then((files) => {
        if (cancelled) return
        const latest = [...files]
          .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
          .slice(0, 6)
        setRecentFiles(latest)
      })
      .catch(() => {
        if (!cancelled) setRecentFiles([])
      })
      .finally(() => {
        if (!cancelled) setFilesLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const vaultName = getVaultName(stats?.vaultPath)
  const healthScore = report?.overallScore ?? 0
  const issueCount = useMemo(
    () => report?.categories.reduce((total, category) => total + category.issues.length, 0) ?? 0,
    [report],
  )
  const hasConnectedVault = Boolean(stats?.connected && stats.totalNotes > 0)
  const totalQuestions = QUESTION_BANK.length + MATH_QUESTION_BANK.length

  if (!statsLoading && !hasConnectedVault) {
    return (
      <div className="mx-auto max-w-5xl">
        <section className="glass-panel overflow-hidden rounded-3xl p-8 sm:p-10 shadow-xl relative">
          <div className="max-w-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent-orange to-indigo-600 text-white shadow-lg shadow-accent-orange/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              开启你的「408 + 考研数学」知识体系
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              连接本地 Obsidian 知识库后，系统将自动索引 408 四门专业课笔记、高等数学/线性代数/概率论公式推导，开启全真题库训练与 AI 深度伴学。
            </p>
          </div>

          <div className="grid gap-4 mt-8 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-sm">
              <span className="text-xs font-bold text-accent-orange">01</span>
              <FolderOpen className="mt-3 h-5 w-5 text-slate-700" />
              <h2 className="mt-2 text-sm font-semibold text-slate-800">关联 Obsidian Vault</h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">纯本地 Markdown 存储，支持双链、公式与层级标签。</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-sm">
              <span className="text-xs font-bold text-accent-orange">02</span>
              <Sigma className="mt-3 h-5 w-5 text-slate-700" />
              <h2 className="mt-2 text-sm font-semibold text-slate-800">双核学科真题库</h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">集成 408 统考真题与数一/二/三题库，支持 LaTeX 与步骤推导。</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-sm">
              <span className="text-xs font-bold text-accent-orange">03</span>
              <Sparkles className="mt-3 h-5 w-5 text-slate-700" />
              <h2 className="mt-2 text-sm font-semibold text-slate-800">研考 AI 伴学导师</h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">基于你的笔记库精准检索，严谨推导数学步骤并诊断错因。</p>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-orange to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-orange/25 transition-all hover:scale-[1.02] hover:shadow-xl"
            >
              配置本地知识库
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1520px] space-y-3.5 sm:space-y-7 animate-fade-in-up">
      {/* Aurora Hero Cockpit Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white/90 via-white/80 to-accent-peach/25 p-4 sm:p-7 lg:p-9 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 h-48 w-48 rounded-full bg-accent-orange/15 blur-3xl pointer-events-none" />

        {/* ── 📱 Mobile Compact Cockpit (专为手机小屏定制，拒绝长屏废话) ── */}
        <div className="md:hidden space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold text-slate-700 truncate max-w-40">{vaultName}</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
              408+数学 双核研学
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>{getTimeGreeting().split('，')[0]}</span>
              <span>⚡</span>
            </h1>
            <span className="text-[11px] text-slate-400 font-medium font-mono">今日冲刺</span>
          </div>

          {/* Quick Action Pair */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <Link
              to="/quiz"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent-orange to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-accent-orange/20 active:scale-95 transition-all"
            >
              <Flame className="h-4 w-4" />
              <span>开始刷题</span>
            </Link>
            <Link
              to="/chat"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/95 py-2.5 text-xs font-bold text-slate-700 shadow-2xs active:scale-95 transition-all hover:text-indigo-600"
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>AI 伴学</span>
            </Link>
          </div>

          {/* 4-Grid Quick Launch (金刚区高频入口) */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <Link to="/quiz" className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs active:scale-95 transition-all">
              <span className="text-base mb-0.5">🖥️</span>
              <span className="text-[10px] font-semibold text-slate-700">408真题</span>
            </Link>
            <Link to="/quiz" className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs active:scale-95 transition-all">
              <span className="text-base mb-0.5">📐</span>
              <span className="text-[10px] font-semibold text-slate-700">考研数学</span>
            </Link>
            <Link to="/graph" className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs active:scale-95 transition-all">
              <span className="text-base mb-0.5">🕸️</span>
              <span className="text-[10px] font-semibold text-slate-700">知识图谱</span>
            </Link>
            <Link to="/editor" className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-white/70 border border-slate-200/70 shadow-2xs active:scale-95 transition-all">
              <span className="text-base mb-0.5">✏️</span>
              <span className="text-[10px] font-semibold text-slate-700">速记笔记</span>
            </Link>
          </div>
        </div>

        {/* ── 🖥️ Desktop Aurora Cockpit Banner (宽屏沉浸展示) ── */}
        <div className="hidden md:flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>知识系统运行中 · </span>
              <span className="font-semibold text-slate-900">{vaultName}</span>
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <span>{getTimeGreeting()}</span>
              <span className="text-xl">⚡</span>
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              「408 计算机综合 + 考研数学」双核智能学习系统已就绪。今天推荐完成一组高数真题演练，或针对近期错题进行 AI 分步推导复盘。
            </p>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-orange via-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-orange/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-accent-orange/35"
            >
              <Flame className="h-4 w-4 animate-bounce-gentle" />
              <span>开始今日刷题</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-400/40 hover:bg-white hover:text-indigo-600"
            >
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <span>AI 伴学提问</span>
            </Link>

            <Link
              to="/editor"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-accent-orange/40 hover:bg-white hover:text-accent-orange"
            >
              <FilePlus2 className="h-4 w-4 text-accent-orange" />
              <span>新建笔记</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 📱 Mobile Subject Station Segmented Control (小屏学科切换器，省去整屏翻滚) ── */}
      <div className="lg:hidden flex rounded-2xl bg-slate-100/90 p-1 border border-slate-200/80">
        <button
          onClick={() => setMobileStationTab('math')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mobileStationTab === 'math'
              ? 'bg-white text-pink-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📐 考研数学 (数一/二/三)
        </button>
        <button
          onClick={() => setMobileStationTab('cs')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mobileStationTab === 'cs'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🖥️ 408 计算机 (统考四门)
        </button>
      </div>

      {/* Dual-Core Battle Stations (双核学科作战舱 - 电脑双栏 / 手机Tab单栏) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Math Station - Bento Span 6 */}
        <div className={`lg:col-span-6 glass-panel glass-panel-hover rounded-3xl p-5 sm:p-7 relative overflow-hidden border border-pink-100/70 group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          mobileStationTab === 'cs' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-gradient-to-br from-pink-500/15 to-indigo-500/20 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-pink-500/25 shrink-0">
                <Sigma className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">考研数学作战舱</h2>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-pink-100/90 text-pink-800 border border-pink-200/80 shadow-2xs">
                    数一 · 数二 · 数三
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">高等数学 · 线性代数 · 概率统计</p>
              </div>
            </div>
            <Link
              to="/quiz"
              className="rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200/80 px-3 py-1.5 text-xs font-semibold text-pink-700 transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
            >
              去刷题 →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 sm:mt-5 py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl bg-slate-50/90 border border-slate-200/70">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">高数核心</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">泰勒与中值</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">线代矩阵</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">相似二次型</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">公式排版</div>
              <div className="text-xs sm:text-sm font-bold text-pink-700 mt-0.5 truncate font-mono">KaTeX 全渲染</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 sm:mt-4 pt-1 sm:pt-2 text-xs text-slate-600">
            <span className="text-[11px] sm:text-xs">✨ 分步严谨推导与反例辨析</span>
            <Link to="/quiz" className="font-semibold text-pink-700 hover:text-pink-800 flex items-center gap-1 transition-transform hover:translate-x-0.5 text-xs">
              <span>立即练习</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* CS 408 Station - Bento Span 6 */}
        <div className={`lg:col-span-6 glass-panel glass-panel-hover rounded-3xl p-5 sm:p-7 relative overflow-hidden border border-blue-100/70 group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          mobileStationTab === 'math' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-gradient-to-br from-blue-500/15 to-teal-500/20 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
                <Cpu className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">408 计算机综合舱</h2>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100/90 text-blue-800 border border-blue-200/80 shadow-2xs">
                    统考专业课
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">数据结构 · 组成原理 · 操作系统 · 计网</p>
              </div>
            </div>
            <Link
              to="/quiz"
              className="rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
            >
              去做题 →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 sm:mt-5 py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl bg-slate-50/90 border border-slate-200/70">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">数据结构</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">树图排序查找</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">硬件底层</div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">CPU存储总线</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">题库储备</div>
              <div className="text-xs sm:text-sm font-bold text-blue-700 mt-0.5 truncate font-mono">{QUESTION_BANK.length} 道真题</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 sm:mt-4 pt-1 sm:pt-2 text-xs text-slate-600">
            <span className="text-[11px] sm:text-xs">✨ 算法闪卡与错题闭环复盘</span>
            <Link to="/quiz" className="font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition-transform hover:translate-x-0.5 text-xs">
              <span>专项突破</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Cockpit Metrics Grid - Bento 4 Grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="知识库笔记"
          value={stats?.totalNotes ?? 0}
          subtext={`关联词数 ${(stats?.totalWords ?? 0).toLocaleString()} 字`}
          icon={FileText}
          glowClass="bg-accent-orange"
          gradientIcon="bg-gradient-to-tr from-accent-orange to-amber-500"
        />
        <MetricCard
          label="双链拓扑连接"
          value={stats?.totalLinks ?? 0}
          subtext="跨笔记双向链接关联"
          icon={Link2}
          glowClass="bg-emerald-500"
          gradientIcon="bg-gradient-to-tr from-emerald-500 to-teal-600"
        />
        <MetricCard
          label="考研双核题库"
          value={`${totalQuestions} 题`}
          subtext="408真题 + 高数线代概率"
          icon={ClipboardList}
          glowClass="bg-indigo-500"
          gradientIcon="bg-gradient-to-tr from-indigo-500 to-purple-600"
        />
        <MetricCard
          label="知识库健康评分"
          value={`${healthScore} 分`}
          subtext={`${issueCount} 项优化建议`}
          icon={HeartPulse}
          glowClass="bg-pink-500"
          gradientIcon="bg-gradient-to-tr from-rose-500 to-pink-600"
        />
      </section>


      {/* Main Content Split: Recent Notes & Study Actions */}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Recent Notes Section */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent-orange" />
                <span>最近编辑笔记</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">无缝继续你的知识沉淀与解题梳理</p>
            </div>
            <Link
              to="/editor"
              className="text-xs font-semibold text-accent-orange hover:opacity-80 transition-opacity"
            >
              打开编辑器 →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {filesLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">正在检索最近文件…</div>
            ) : recentFiles.length > 0 ? (
              recentFiles.map(file => (
                <Link
                  key={file.path}
                  to={`/editor?path=${encodeURIComponent(file.path)}`}
                  className="flex items-center gap-3.5 py-3 rounded-xl px-2 transition-all hover:bg-slate-50 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-accent-orange/10 group-hover:text-accent-orange transition-colors shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800 truncate group-hover:text-accent-orange transition-colors">
                      {file.title || file.path.split('/').pop()}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{file.path}</div>
                  </div>
                  <div className="text-xs font-mono text-slate-400 shrink-0">
                    {formatModifiedDate(file.modified)}
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                暂无历史笔记，点击上方“新建笔记”即可开始
              </div>
            )}
          </div>
        </div>

        {/* Study Pathways & Quick Hub */}
        <div className="space-y-6">
          {/* Health & Knowledge Health */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-rose-500" />
                  <span>知识库健康指标</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">自动化结构诊断与关系紧密度</p>
              </div>
              <span className={`text-xl font-bold ${
                healthScore >= 80 ? 'text-emerald-600' : healthScore >= 60 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {healthLoading ? '...' : `${healthScore}%`}
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  healthScore >= 80 ? 'bg-emerald-500' : healthScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, healthScore))}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400">孤立笔记</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">{stats?.orphanNotes ?? 0} 篇</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-400">待检查链接</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">{stats?.danglingLinks ?? 0} 条</div>
              </div>
            </div>

            <Link
              to="/workflow"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-orange hover:underline"
            >
              <span>一键进入智能整理工作流</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Quick Study Tools */}
          <div className="glass-panel rounded-3xl p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Compass className="h-4 w-4 text-indigo-500" />
              <span>研考专项工具箱</span>
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/graph"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-indigo-200 transition-all text-left group"
              >
                <span className="text-lg">🕸️</span>
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600">3D 图谱</div>
                  <div className="text-[10px] text-slate-400">知识关联全景</div>
                </div>
              </Link>
              <Link
                to="/vocabulary"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-amber-200 transition-all text-left group"
              >
                <span className="text-lg">📖</span>
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-amber-600">考研英语词汇</div>
                  <div className="text-[10px] text-slate-400">大纲高频核心词</div>
                </div>
              </Link>
              <Link
                to="/pomodoro"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-rose-200 transition-all text-left group"
              >
                <span className="text-lg">🍅</span>
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-rose-600">专注番茄钟</div>
                  <div className="text-[10px] text-slate-400">心流时间管理</div>
                </div>
              </Link>
              <Link
                to="/music"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-teal-200 transition-all text-left group"
              >
                <span className="text-lg">🎵</span>
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-teal-600">专注声学背景</div>
                  <div className="text-[10px] text-slate-400">双耳节拍与白噪音</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
