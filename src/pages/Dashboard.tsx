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
  Search,
  Code2,
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
  to?: string
}

function MetricCard({ label, value, subtext, icon: Icon, to }: MetricCardProps) {
  const inner = (
    <div className="bento-card bento-card-hover rounded-xl p-4 sm:p-5 relative overflow-hidden group h-full flex flex-col justify-between active:scale-[0.99] transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-medium text-neutral-500 truncate">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-100 text-neutral-700 border border-neutral-200/80 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtext && <div className="mt-1 text-[11px] font-normal text-neutral-400 truncate">{subtext}</div>}
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
  const [searchFilter, setSearchFilter] = useState('')
  const [activeMode, setActiveMode] = useState<'cs' | 'math' | 'ai'>('cs')

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

  const filteredRecentFiles = useMemo(() => {
    if (!searchFilter.trim()) return recentFiles
    const q = searchFilter.toLowerCase()
    return recentFiles.filter(f => (f.title || f.path).toLowerCase().includes(q))
  }, [recentFiles, searchFilter])

  // Subframe 3D Metallic Switcher 模式配置
  const modeConfigs = {
    cs: {
      headline: '408 计算机学科专业基础',
      subheadline: '统考四门数据结构 · 组成原理 · 操作系统 · 计算机网络',
      badge: (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span>当前激活：<strong>408 统考舱</strong> — 已就绪 {QUESTION_BANK.length} 道真题演练与算法推演</span>
        </>
      ),
      actionPrimary: '/quiz?domain=cs_408',
      actionPrimaryLabel: '开始 408 真题训练',
      actionSecondary: '/study',
      actionSecondaryLabel: '查阅专业课讲义',
    },
    math: {
      headline: '考研数学 智能推导作战舱',
      subheadline: '高等数学 / 微积分 · 线性代数 · 概率论与数理统计',
      badge: (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
          <span>当前激活：<strong>考研数学舱</strong> — KaTeX 学术级公式排版与步骤推导（{MATH_QUESTION_BANK.length} 题）</span>
        </>
      ),
      actionPrimary: '/quiz?domain=math',
      actionPrimaryLabel: '开始数学高频冲刺',
      actionSecondary: '/chat',
      actionSecondaryLabel: 'AI 严谨公式分步推导',
    },
    ai: {
      headline: '研考 AI 导师多智能体伴学',
      subheadline: '基于本地知识库的精准检索增强 (RAG) 与错题归因推理',
      badge: (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>当前激活：<strong>AI 伴学中心</strong> — 多智能体协同答疑、思维链推导与知识图谱溯源</span>
        </>
      ),
      actionPrimary: '/chat',
      actionPrimaryLabel: '进入 AI 导师答疑',
      actionSecondary: '/history',
      actionSecondaryLabel: '浏览政治史纲时空轴',
    },
  }

  const currentModeData = modeConfigs[activeMode]

  if (!statsLoading && !hasConnectedVault) {
    return (
      <div className="mx-auto max-w-4xl py-6">
        <section className="bento-card overflow-hidden rounded-2xl p-6 sm:p-10 shadow-xs relative">
          <div className="max-w-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              开启你的「408 + 考研数学」智能知识库
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-500">
              连接本地 Obsidian 知识库后，系统将自动索引 408 四门专业课笔记与高等数学/线性代数/概率论公式推导，开启全真题库训练与 AI 深度伴学。
            </p>
          </div>

          <div className="grid gap-3 mt-6 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-4">
              <span className="text-xs font-mono font-semibold text-neutral-500">01</span>
              <FolderOpen className="mt-2 h-4 w-4 text-neutral-700" />
              <h2 className="mt-1.5 text-xs sm:text-sm font-semibold text-neutral-900">关联 Obsidian 笔记库</h2>
              <p className="mt-1 text-xs text-neutral-500 leading-relaxed">纯本地 Markdown 存储，支持双链、公式与层级标签。</p>
            </div>
            <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-4">
              <span className="text-xs font-mono font-semibold text-neutral-500">02</span>
              <Sigma className="mt-2 h-4 w-4 text-neutral-700" />
              <h2 className="mt-1.5 text-xs sm:text-sm font-semibold text-neutral-900">双核学科真题库</h2>
              <p className="mt-1 text-xs text-neutral-500 leading-relaxed">集成 408 统考真题与数学题库，支持公式渲染与分步推导。</p>
            </div>
            <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-4">
              <span className="text-xs font-mono font-semibold text-neutral-500">03</span>
              <Sparkles className="mt-2 h-4 w-4 text-neutral-700" />
              <h2 className="mt-1.5 text-xs sm:text-sm font-semibold text-neutral-900">研考 AI 伴学导师</h2>
              <p className="mt-1 text-xs text-neutral-500 leading-relaxed">基于笔记库精准检索，严谨推导数学步骤并诊断错因。</p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Link
              to="/settings"
              className="px-4 py-2 rounded-[10px] bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-xs font-medium shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-all active:scale-[0.99] inline-flex items-center gap-2"
            >
              配置知识库路径
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1560px] space-y-6 animate-fade-in-up">
      {/* ── Subframe Top Workspace Status Bar ── */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-900 text-sm tracking-tight">{vaultName}</span>
          <span className="text-neutral-300">/</span>
          <span className="subframe-pill text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            双核知识网络就绪
          </span>
          <span className="hidden sm:inline-flex subframe-pill text-[11px] font-mono">
            距 12.19 初试还有 {daysToExam} 天
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-neutral-400">{getTimeGreeting()}</span>
          <button
            type="button"
            onClick={openQuickNote}
            className="subframe-btn-secondary h-7 px-2.5 text-xs font-medium cursor-pointer"
          >
            <PenLine className="h-3 w-3 text-neutral-500" />
            <span>随手速记</span>
          </button>
        </div>
      </div>

      {/* ── Subframe Hero Studio Section with 3D Metallic Hardware Switcher ── */}
      <section className="relative overflow-hidden rounded-2xl subframe-bg border border-black/10 py-10 sm:py-14 px-4 sm:px-8 text-center flex flex-col items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        
        {/* 3D Metallic Chrome Hardware Pill Switcher (Exact Replica from Subframe UI) */}
        <div className="relative mb-7 select-none">
          <div className="metallic-ambient-glow" />

          <div className="metallic-housing relative z-10 scale-95 sm:scale-100">
            <div className="metallic-bezel flex items-center gap-1 sm:gap-2">

              {/* Tab 1: 408 计算机 */}
              <button
                type="button"
                onClick={() => setActiveMode('cs')}
                className={`relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-[12px] text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === 'cs' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <Cpu className={`h-3.5 w-3.5 ${activeMode === 'cs' ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]' : ''}`} />
                <span>408 计算机</span>
              </button>

              {/* Tab 2: 考研数学 */}
              <button
                type="button"
                onClick={() => setActiveMode('math')}
                className={`relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-[12px] text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === 'math' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <Sigma className={`h-3.5 w-3.5 ${activeMode === 'math' ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]' : ''}`} />
                <span>考研数学</span>
              </button>

              {/* Tab 3: AI 伴学 */}
              <button
                type="button"
                onClick={() => setActiveMode('ai')}
                className={`relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-[12px] text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === 'ai' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <Sparkles className={`h-3.5 w-3.5 ${activeMode === 'ai' ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]' : ''}`} />
                <span>AI 伴学</span>
              </button>

            </div>
          </div>
        </div>

        {/* Hero Headline & Subtitle */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171719] mb-3 transition-all duration-300">
          {currentModeData.headline}
        </h1>

        <p className="text-sm sm:text-base md:text-lg font-normal tracking-tight text-[#6e7178] max-w-[680px] mb-6 transition-all duration-300">
          {currentModeData.subheadline}
        </p>

        {/* Dynamic Mode Live Status Pill */}
        <div className="mb-7 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.04] border border-black/[0.06] text-xs text-[#52525b] shadow-2xs">
          {currentModeData.badge}
        </div>

        {/* Subframe CTA Button Pair */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={currentModeData.actionPrimary}
            className="px-5 py-2.5 rounded-[10px] bg-[#1c1c1f] hover:bg-[#2a2a2e] text-white text-xs sm:text-sm font-medium shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-all active:scale-[0.99] inline-flex items-center gap-2"
          >
            <Flame className="h-4 w-4 text-amber-400" />
            <span>{currentModeData.actionPrimaryLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            to={currentModeData.actionSecondary}
            className="px-5 py-2.5 rounded-[10px] bg-[#e3e4e7] hover:bg-[#d8d9dd] text-[#18181b] text-xs sm:text-sm font-medium border border-black/[0.05] transition-all active:scale-[0.99] inline-flex items-center gap-2"
          >
            <span>{currentModeData.actionSecondaryLabel}</span>
          </Link>
        </div>

      </section>

      {/* ── Subframe Metric Grid ── */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <MetricCard
          label="知识库笔记"
          value={stats?.totalNotes ?? 0}
          subtext={`累计 ${(stats?.totalWords ?? 0).toLocaleString()} 字`}
          icon={FileText}
          to="/editor"
        />
        <MetricCard
          label="双链知识网络"
          value={stats?.totalLinks ?? 0}
          subtext="跨章节双向引用"
          icon={Link2}
          to="/graph"
        />
        <MetricCard
          label="双核真题储备"
          value={`${totalQuestions} 题`}
          subtext="408 + 高数线代概率"
          icon={ClipboardList}
          to="/quiz"
        />
        <MetricCard
          label="知识体系健康度"
          value={`${healthScore} 分`}
          subtext={`${issueCount} 项结构优化建议`}
          icon={HeartPulse}
          to="/workflow"
        />
      </section>

      {/* ── Subframe Project Showcase: Dual-Core Stations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 408 Computer Science Station Card */}
        <div className="bento-card bento-card-hover rounded-xl p-5 relative overflow-hidden group">
          {/* Top Canvas Cover */}
          <div className="rounded-lg bg-neutral-100/70 p-4 border border-neutral-200/60 mb-4 transition-colors group-hover:bg-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-800 shadow-2xs">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">408 计算机学科专业基础</h3>
                  <p className="text-[11px] text-neutral-400">全国统考核心大纲</p>
                </div>
              </div>
              <span className="subframe-pill text-[10.5px]">
                {QUESTION_BANK.length} 道真题
              </span>
            </div>

            {/* Micro Pillars Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white/90 rounded-md py-2 px-1 border border-neutral-200/50">
                <div className="text-[10px] text-neutral-400 font-medium">数据结构</div>
                <div className="text-xs font-semibold text-neutral-800 mt-0.5">树/图/排序</div>
              </div>
              <div className="bg-white/90 rounded-md py-2 px-1 border border-neutral-200/50">
                <div className="text-[10px] text-neutral-400 font-medium">组成原理</div>
                <div className="text-xs font-semibold text-neutral-800 mt-0.5">指令/流水线</div>
              </div>
              <div className="bg-white/90 rounded-md py-2 px-1 border border-neutral-200/50">
                <div className="text-[10px] text-neutral-400 font-medium">操作系统</div>
                <div className="text-xs font-semibold text-neutral-800 mt-0.5">内存/进程</div>
              </div>
              <div className="bg-white/90 rounded-md py-2 px-1 border border-neutral-200/50">
                <div className="text-[10px] text-neutral-400 font-medium">计算机网络</div>
                <div className="text-xs font-semibold text-neutral-800 mt-0.5">TCP/IP协议</div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              包含代码追踪、算法推演与错题归因
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/study"
                className="subframe-btn-secondary h-7 px-2.5 text-[11px]"
              >
                看讲义
              </Link>
              <Link
                to="/quiz?domain=cs_408"
                className="subframe-btn-black h-7 px-2.5 text-[11px]"
              >
                刷 408 →
              </Link>
            </div>
          </div>
        </div>

        {/* Math Station Card */}
        <div className="bento-card bento-card-hover rounded-xl p-5 relative overflow-hidden group">
          {/* Top Canvas Cover */}
          <div className="rounded-lg bg-neutral-100/70 p-4 border border-neutral-200/60 mb-4 transition-colors group-hover:bg-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-800 shadow-2xs">
                  <Sigma className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">考研数学 作战舱</h3>
                  <p className="text-[11px] text-neutral-400">数一 · 数二 · 数三</p>
                </div>
              </div>
              <span className="subframe-pill text-[10.5px]">
                {MATH_QUESTION_BANK.length} 道真题
              </span>
            </div>

            {/* Micro Pillars Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/90 rounded-md py-2 px-1 border border-neutral-200/50">
                <div className="text-[10px] text-neutral-400 font-medium">高等数学 / 微积分</div>
                <div className="text-xs font-semibold text-neutral-800 mt-0.5">极限·导数·积分</div>
              </div>
              <div className="bg-white/90 rounded-md py-2 px-1 border border-neutral-200/50">
                <div className="text-[10px] text-neutral-400 font-medium">线性代数</div>
                <div className="text-xs font-semibold text-neutral-800 mt-0.5">矩阵·秩·特征值</div>
              </div>
              <div className="bg-white/90 rounded-md py-2 px-1 border border-neutral-200/50">
                <div className="text-[10px] text-neutral-400 font-medium">概率论与数理统计</div>
                <div className="text-xs font-semibold text-neutral-800 mt-0.5">大数定律·参数估计</div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              全量 KaTeX 公式排版与严谨步骤推导
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/chat"
                className="subframe-btn-secondary h-7 px-2.5 text-[11px]"
              >
                公式答疑
              </Link>
              <Link
                to="/quiz?domain=math"
                className="subframe-btn-black h-7 px-2.5 text-[11px]"
              >
                刷数学 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Subframe Recent Notes & Tools Split ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Recent Notes Table/List */}
        <div className="bento-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-600" />
              <h2 className="text-sm font-semibold text-neutral-900">最近更新笔记</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* Inline Filter Input */}
              <div className="relative">
                <Search className="h-3 w-3 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="过滤笔记..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="h-7 pl-7 pr-2.5 text-xs bg-neutral-100 hover:bg-neutral-200/60 focus:bg-white border border-transparent focus:border-neutral-300 rounded-md transition-all outline-none text-neutral-800 w-28 sm:w-36"
                />
              </div>
              <Link
                to="/editor"
                className="text-xs font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5"
              >
                <span>全部</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-neutral-100">
            {filesLoading ? (
              <div className="py-8 text-center text-xs text-neutral-400">正在加载最近笔记…</div>
            ) : filteredRecentFiles.length > 0 ? (
              filteredRecentFiles.map(file => (
                <Link
                  key={file.path}
                  to={`/editor?path=${encodeURIComponent(file.path)}`}
                  className="flex items-center gap-3 py-2.5 rounded-lg px-2 transition-colors hover:bg-neutral-50 group"
                >
                  <div className="w-7 h-7 rounded-md bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-500 group-hover:text-neutral-900 transition-colors shrink-0">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-neutral-800 truncate group-hover:text-neutral-900">
                      {file.title || file.path.split('/').pop()}
                    </div>
                    <div className="text-[10.5px] text-neutral-400 truncate mt-0.5 font-mono">{file.path}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 shrink-0">
                    <span>{formatModifiedDate(file.modified)}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-600" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="text-xs text-neutral-400">暂无匹配笔记</div>
                <Link to="/editor" className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 underline underline-offset-2">
                  <FilePlus2 className="h-3.5 w-3.5" />
                  <span>新建笔记</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tools & Health */}
        <div className="space-y-4">
          {/* Quick Tools Grid */}
          <div className="bento-card rounded-xl p-5">
            <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <Compass className="h-4 w-4 text-neutral-600" />
              <span>研学效率工具箱</span>
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/study"
                className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition-all group"
              >
                <div className="w-8 h-8 rounded-md bg-white border border-neutral-200/70 flex items-center justify-center text-neutral-700 shrink-0">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-neutral-800 truncate">学习与闪卡</div>
                  <div className="text-[10px] text-neutral-400 truncate">讲义精读与记忆</div>
                </div>
              </Link>
              <Link
                to="/graph"
                className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition-all group"
              >
                <div className="w-8 h-8 rounded-md bg-white border border-neutral-200/70 flex items-center justify-center text-neutral-700 shrink-0">
                  <Link2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-neutral-800 truncate">知识图谱</div>
                  <div className="text-[10px] text-neutral-400 truncate">考点拓扑可视化</div>
                </div>
              </Link>
              <Link
                to="/vocabulary"
                className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition-all group"
              >
                <div className="w-8 h-8 rounded-md bg-white border border-neutral-200/70 flex items-center justify-center text-neutral-700 shrink-0">
                  <span className="text-xs font-serif font-bold">En</span>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-neutral-800 truncate">考研英语词汇</div>
                  <div className="text-[10px] text-neutral-400 truncate">高频核心大纲词</div>
                </div>
              </Link>
              <Link
                to="/pomodoro"
                className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-200/80 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition-all group"
              >
                <div className="w-8 h-8 rounded-md bg-white border border-neutral-200/70 flex items-center justify-center text-neutral-700 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-neutral-800 truncate">专注番茄钟</div>
                  <div className="text-[10px] text-neutral-400 truncate">心流计时切片</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Vault Health Overview */}
          <div className="bento-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-neutral-600" />
                  <span>知识体系健康度</span>
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5">双链完整率与孤立节点诊断</p>
              </div>
              <span className="text-lg font-bold font-mono text-neutral-900">
                {healthLoading ? '...' : `${healthScore}%`}
              </span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all duration-500"
                style={{ width: `${Math.max(5, Math.min(100, healthScore))}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-center">
              <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/60">
                <div className="text-[10px] text-neutral-400">孤立笔记</div>
                <div className="text-xs font-bold font-mono text-neutral-800 mt-0.5">{stats?.orphanNotes ?? 0} 篇</div>
              </div>
              <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-200/60">
                <div className="text-[10px] text-neutral-400">悬空双链</div>
                <div className="text-xs font-bold font-mono text-neutral-800 mt-0.5">{stats?.danglingLinks ?? 0} 条</div>
              </div>
            </div>

            <Link
              to="/workflow"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-neutral-700 hover:text-neutral-900"
            >
              <span>进入知识库整理工作流</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
