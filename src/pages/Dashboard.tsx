import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Clock,
  Compass,
  Cpu,
  FilePlus2,
  FileText,
  Flame,
  FolderOpen,
  GraduationCap,
  HeartPulse,
  Landmark,
  Link2,
  PenLine,
  Sigma,
  Sparkles,
  Tv,
} from 'lucide-react'
import { api, type FileListItem } from '../services/api'
import { useVaultHealth, useVaultStats } from '../hooks/useVaultData'
import { QUESTION_BANK } from '../data/questions'
import { MATH_QUESTION_BANK } from '../data/questions/math'

function getVaultName(vaultPath?: string) {
  if (!vaultPath) return '研核知识库'
  return vaultPath.split(/[\\/]/).filter(Boolean).pop() || '研核知识库'
}

function getTimeGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了，注意劳逸结合'
  if (hour < 11) return '早安，开启今日高效冲刺'
  if (hour < 14) return '午安，复盘上午核心考点'
  if (hour < 18) return '下午好，专注攻克高频真题'
  return '晚上好，梳理错题与今日总结'
}

function formatModifiedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '刚刚'

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
  iconBg: string
  to?: string
}

function MetricCard({ label, value, subtext, icon: Icon, iconBg, to }: MetricCardProps) {
  const inner = (
    <div className="bento-card bento-card-hover rounded-2xl p-3.5 sm:p-5 relative overflow-hidden group h-full flex flex-col justify-between active:scale-[0.99] transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">{label}</span>
        <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 ${iconBg}`}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      </div>
      <div>
        <div className="text-lg sm:text-2xl font-extrabold font-mono tracking-tight text-slate-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtext && <div className="mt-0.5 text-[10.5px] sm:text-[11px] font-medium text-slate-400 truncate">{subtext}</div>}
      </div>
    </div>
  )

  return to ? <Link to={to} className="block">{inner}</Link> : inner
}

export default function Dashboard() {
  const { stats, loading: statsLoading } = useVaultStats()
  const { report, loading: healthLoading } = useVaultHealth()
  const [recentFiles, setRecentFiles] = useState<FileListItem[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [mobileStationTab, setMobileStationTab] = useState<'cs' | 'math'>('cs')

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

  // 2026年12月19日 初试倒计时
  const daysToExam = Math.max(
    0,
    Math.ceil((new Date('2026-12-19T08:30:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  )

  const openQuickNote = () => {
    window.dispatchEvent(new CustomEvent('open-quick-note'))
  }

  if (!statsLoading && !hasConnectedVault) {
    return (
      <div className="mx-auto max-w-5xl">
        <section className="bento-card overflow-hidden rounded-3xl p-6 sm:p-10 shadow-xl relative">
          <div className="max-w-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="mt-5 fluid-hero-title font-bold text-slate-900">
              开启你的「408 + 考研数学」智能知识库
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              连接本地 Obsidian 知识库后，系统将自动索引 408 四门专业课笔记与高等数学/线性代数/概率论公式推导，开启全真题库训练与 AI 深度伴学。
            </p>
          </div>

          <div className="grid gap-3.5 mt-7 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
              <span className="text-xs font-bold text-indigo-600">01</span>
              <FolderOpen className="mt-2.5 h-5 w-5 text-slate-700" />
              <h2 className="mt-2 text-sm font-semibold text-slate-800">关联 Obsidian 笔记库</h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">纯本地 Markdown 存储，支持双链、公式与层级标签。</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
              <span className="text-xs font-bold text-indigo-600">02</span>
              <Sigma className="mt-2.5 h-5 w-5 text-slate-700" />
              <h2 className="mt-2 text-sm font-semibold text-slate-800">双核学科真题库</h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">集成 408 统考真题与数一/二/三题库，支持公式渲染与步骤推导。</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
              <span className="text-xs font-bold text-indigo-600">03</span>
              <Sparkles className="mt-2.5 h-5 w-5 text-slate-700" />
              <h2 className="mt-2 text-sm font-semibold text-slate-800">研考 AI 伴学导师</h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">基于你的笔记库精准检索，严谨推导数学步骤并诊断错因。</p>
            </div>
          </div>

          <div className="flex justify-end mt-7">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all active:scale-95"
            >
              配置知识库路径
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1520px] space-y-3.5 sm:space-y-6 animate-fade-in-up">
      {/* Hero Cockpit Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/85 bg-gradient-to-br from-white via-white to-indigo-50/50 p-4 sm:p-7 lg:p-8 shadow-[0_12px_36px_-8px_rgba(15,23,42,0.06)]">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-500/8 blur-3xl pointer-events-none" />
        <div className="absolute right-24 -bottom-16 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* ── 📱 Mobile Hero Cockpit ── */}
        <div className="md:hidden space-y-3">
          {/* Status & Exam Countdown Pill */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/90 border border-slate-200/70 px-2.5 py-1 min-w-0">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[130px]">{vaultName}</span>
            </div>

            <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-800 shrink-0">
              <CalendarClock className="h-3 w-3 text-amber-600" />
              <span>距 12.19 考研 </span>
              <span className="font-mono text-amber-600 text-xs">{daysToExam}</span>
              <span> 天</span>
            </div>
          </div>

          {/* Greeting */}
          <div>
            <h1 className="text-[18px] font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{getTimeGreeting()}</span>
              <span>⚡</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              已就绪 {stats?.totalNotes ?? 0} 篇笔记与 {totalQuestions} 道真题，随时开启沉浸训练
            </p>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/quiz"
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md shadow-slate-900/15 active:scale-[0.98] transition-all"
            >
              <Flame className="h-4 w-4 text-amber-400" />
              <span>开始今日刷题</span>
            </Link>
            <Link
              to="/chat"
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI 导师答疑</span>
            </Link>
          </div>

          {/* 4-Grid Quick Launch */}
          <div className="grid grid-cols-4 gap-2 pt-0.5">
            <Link
              to="/quiz?domain=cs_408"
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-slate-50/90 border border-slate-200/75 active:scale-95 transition-all"
            >
              <span className="text-lg mb-0.5">🖥️</span>
              <span className="text-[11px] font-bold text-slate-700">408真题</span>
            </Link>
            <Link
              to="/quiz?domain=math"
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-slate-50/90 border border-slate-200/75 active:scale-95 transition-all"
            >
              <span className="text-lg mb-0.5">📐</span>
              <span className="text-[11px] font-bold text-slate-700">考研数学</span>
            </Link>
            <Link
              to="/history"
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-rose-50/80 border border-rose-200/75 active:scale-95 transition-all"
            >
              <span className="text-lg mb-0.5">🏛️</span>
              <span className="text-[11px] font-bold text-rose-800">政治史纲</span>
            </Link>
            <button
              type="button"
              onClick={openQuickNote}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-lg mb-0.5">✏️</span>
              <span className="text-[11px] font-bold text-indigo-700">随手速记</span>
            </button>
          </div>
        </div>

        {/* ── 🖥️ Desktop Hero Cockpit ── */}
        <div className="hidden md:flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-3.5 py-1 text-xs font-medium text-slate-600 shadow-2xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>知识库在线 · </span>
                <span className="font-bold text-slate-900">{vaultName}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50/90 px-3 py-1 text-xs font-bold text-amber-800">
                <CalendarClock className="h-3.5 w-3.5 text-amber-600" />
                <span>距离 12月19日 考研初试还有</span>
                <span className="font-mono text-amber-600 text-sm">{daysToExam}</span>
                <span>天</span>
              </div>
            </div>

            <h1 className="mt-4 fluid-hero-title font-extrabold text-slate-900 flex items-center gap-2.5">
              <span>{getTimeGreeting()}</span>
              <span>⚡</span>
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              「408 计算机综合 + 考研数学」双核智能研学系统已就绪。推荐今日完成一组专项真题演练，或针对薄弱章节进行 AI 分步推导复盘。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-all active:scale-95"
            >
              <Flame className="h-4 w-4 text-amber-400" />
              <span>开始今日刷题</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/history"
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/85 hover:bg-rose-100/85 px-4 py-3 text-sm font-bold text-rose-700 transition-all active:scale-95"
            >
              <Landmark className="h-4 w-4 text-rose-600" />
              <span>政治史纲时空轴</span>
            </Link>

            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/80 px-4 py-3 text-sm font-bold text-indigo-700 transition-all active:scale-95"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>AI 伴学提问</span>
            </Link>

            <button
              type="button"
              onClick={openQuickNote}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 cursor-pointer active:scale-95"
            >
              <PenLine className="h-4 w-4 text-slate-600" />
              <span>随手记</span>
            </button>
          </div>
        </div>
      </section>

      {/* Onboarding Guide Quick Banner */}
      <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-purple-50/80 border border-indigo-200/80 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0 shadow-sm shadow-indigo-600/30">
            <Tv className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">新人研学指引与全景巡礼</h3>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700">新手必读</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
              带您 3 分钟掌握 408+考研数学双核图谱、真题错题归因与 SM-2 科学抗遗忘记忆法
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-user-guide'))}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-3 sm:px-4 py-2 text-xs font-bold transition-all shadow-sm shadow-indigo-600/20 shrink-0 cursor-pointer active:scale-95"
        >
          <span>播放巡礼与指南</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Real-time Cockpit Metrics Grid */}
      <section className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <MetricCard
          label="知识库笔记"
          value={stats?.totalNotes ?? 0}
          subtext={`累计 ${(stats?.totalWords ?? 0).toLocaleString()} 字`}
          icon={FileText}
          iconBg="bg-gradient-to-tr from-blue-600 to-indigo-600"
          to="/editor"
        />
        <MetricCard
          label="双链知识网络"
          value={stats?.totalLinks ?? 0}
          subtext="跨章节双向链接"
          icon={Link2}
          iconBg="bg-gradient-to-tr from-emerald-500 to-teal-600"
          to="/graph"
        />
        <MetricCard
          label="双核真题储备"
          value={`${totalQuestions} 题`}
          subtext="408 + 高数线代概率"
          icon={ClipboardList}
          iconBg="bg-gradient-to-tr from-indigo-500 to-violet-600"
          to="/quiz"
        />
        <MetricCard
          label="知识库健康度"
          value={`${healthScore} 分`}
          subtext={`${issueCount} 项结构建议`}
          icon={HeartPulse}
          iconBg="bg-gradient-to-tr from-rose-500 to-pink-600"
          to="/workflow"
        />
      </section>

      {/* Mobile Subject Station Segmented Control */}
      <div className="lg:hidden flex rounded-2xl bg-slate-200/60 p-1 border border-slate-200/80">
        <button
          onClick={() => setMobileStationTab('cs')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mobileStationTab === 'cs'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🖥️ 408 计算机四门
        </button>
        <button
          onClick={() => setMobileStationTab('math')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mobileStationTab === 'math'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📐 考研数学 (数一/二/三)
        </button>
      </div>

      {/* Dual-Core Battle Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* CS 408 Station */}
        <div className={`lg:col-span-6 bento-card bento-card-hover rounded-3xl p-4 sm:p-6 relative overflow-hidden ${
          mobileStationTab === 'math' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <Cpu className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">408 计算机综合舱</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                    统考四门
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">数据结构 · 组成原理 · 操作系统 · 计算机网络</p>
              </div>
            </div>
            <Link
              to="/quiz?domain=cs_408"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white transition-all active:scale-95 shadow-xs shrink-0"
            >
              刷 408 →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">数据结构</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">树图查找排序</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">系统底层</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">存储管线并发</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">真题储备</div>
              <div className="text-xs sm:text-sm font-bold text-blue-600 mt-0.5 truncate font-mono">{QUESTION_BANK.length} 题</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3.5 pt-1 text-xs text-slate-500">
            <span>支持考点讲义精读、代码追踪与错题闭环</span>
            <Link to="/study" className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 shrink-0">
              <span>看讲义</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Math Station */}
        <div className={`lg:col-span-6 bento-card bento-card-hover rounded-3xl p-4 sm:p-6 relative overflow-hidden ${
          mobileStationTab === 'cs' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <Sigma className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">考研数学作战舱</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    数一 · 数二 · 数三
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">高等数学 · 线性代数 · 概率论与数理统计</p>
              </div>
            </div>
            <Link
              to="/quiz?domain=math"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-bold text-white transition-all active:scale-95 shadow-xs shrink-0"
            >
              刷数学 →
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">微积分</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">极限中值积分</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">线代概率</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">特征值与分布</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">真题储备</div>
              <div className="text-xs sm:text-sm font-bold text-indigo-600 mt-0.5 truncate font-mono">{MATH_QUESTION_BANK.length} 题</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3.5 pt-1 text-xs text-slate-500">
            <span>全量 KaTeX 学术公式排版与严谨分步推导</span>
            <Link to="/chat" className="font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 shrink-0">
              <span>推导演算</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recent Notes & Study Tools */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Recent Notes Section */}
        <div className="bento-card min-w-0 rounded-3xl p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <span>最近更新笔记</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">无缝衔接上次阅读与手写批注</p>
            </div>
            <Link
              to="/editor"
              className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-colors"
            >
              <span>全部笔记</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {filesLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">正在加载最近笔记…</div>
            ) : recentFiles.length > 0 ? (
              recentFiles.map(file => (
                <Link
                  key={file.path}
                  to={`/editor?path=${encodeURIComponent(file.path)}`}
                  className="flex items-center gap-3 py-2.5 sm:py-3 rounded-xl px-1.5 sm:px-2 transition-colors hover:bg-slate-50 active:bg-slate-100 group"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] sm:text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {file.title || file.path.split('/').pop()}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{file.path}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
                    <span>{formatModifiedDate(file.modified)}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-400" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="text-xs text-slate-400">暂无最近笔记记录</div>
                <Link to="/editor" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                  <FilePlus2 className="h-3.5 w-3.5" />
                  <span>新建第一篇笔记</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Study Tools & Vault Health */}
        <div className="min-w-0 space-y-4 sm:space-y-6">
          {/* Quick Study Tools */}
          <div className="bento-card rounded-3xl p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Compass className="h-4 w-4 text-indigo-600" />
              <span>研学效率工具箱</span>
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/study"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 hover:bg-white hover:border-indigo-300 active:scale-[0.98] transition-all group"
              >
                <GraduationCap className="h-5 w-5 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">学习与闪卡</div>
                  <div className="text-[10px] text-slate-400 truncate">讲义精读与记忆</div>
                </div>
              </Link>
              <Link
                to="/graph"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 hover:bg-white hover:border-blue-300 active:scale-[0.98] transition-all group"
              >
                <span className="text-lg shrink-0">🕸️</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">知识图谱</div>
                  <div className="text-[10px] text-slate-400 truncate">考点拓扑可视化</div>
                </div>
              </Link>
              <Link
                to="/vocabulary"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 hover:bg-white hover:border-amber-300 active:scale-[0.98] transition-all group"
              >
                <span className="text-lg shrink-0">📖</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">考研英语词汇</div>
                  <div className="text-[10px] text-slate-400 truncate">高频大纲核心词</div>
                </div>
              </Link>
              <Link
                to="/pomodoro"
                className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 hover:bg-white hover:border-rose-300 active:scale-[0.98] transition-all group"
              >
                <span className="text-lg shrink-0">🍅</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">专注番茄钟</div>
                  <div className="text-[10px] text-slate-400 truncate">沉浸计时锁屏</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Vault Health Card */}
          <div className="bento-card rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-rose-500" />
                  <span>知识体系健康度</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">双链完整率与孤立节点实时诊断</p>
              </div>
              <span className={`text-lg sm:text-xl font-extrabold font-mono ${
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

            <div className="grid grid-cols-2 gap-2.5 mt-3.5">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400">孤立笔记</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">{stats?.orphanNotes ?? 0} 篇</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-400">悬空双链</div>
                <div className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">{stats?.danglingLinks ?? 0} 条</div>
              </div>
            </div>

            <Link
              to="/workflow"
              className="mt-3.5 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              <span>进入知识库整理工作流</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
