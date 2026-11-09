import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Clock,
  Compass,
  Cpu,
  FilePlus2,
  FileText,
  Flame,
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
  Palette,
} from 'lucide-react'
import { api, type FileListItem } from '../services/api'
import { useVaultHealth, useVaultStats } from '../hooks/useVaultData'
import { useThemeStyle } from '../hooks/useThemeStyle'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../contexts/AuthContext'
import MobileDashboardView from '../components/mobile/MobileDashboardView'
import { QUESTION_BANK } from '../data/questions'
import { MATH_QUESTION_BANK } from '../data/questions/math'
import { XIAO_1000_POLITICS_QUESTIONS } from '../data/politicsQuestions'
import { useExamCountdown } from '../utils/examDate'

function getVaultName(vaultPath?: string) {
  if (!vaultPath) return '研核知识库'
  const name = vaultPath.split(/[\\/]/).filter(Boolean).pop() || '研核知识库'
  return /opt|coreforge|root|data|users/i.test(name) ? '我的专属研学沙盒' : name
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
  colorTheme?: 'amber' | 'blue' | 'emerald' | 'purple'
}

function MetricCard({ label, value, subtext, icon: Icon, to, colorTheme = 'amber' }: MetricCardProps) {
  const { isVibrant, toggleThemeStyle } = useThemeStyle()
  
  const vibrantThemeMap = {
    amber: {
      card: 'border-amber-200/80 bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 hover:border-amber-300 shadow-amber-500/5',
      iconBox: 'bg-amber-100 text-amber-700 border-amber-200/80',
      value: 'text-amber-950',
      subtext: 'text-amber-700/80',
    },
    blue: {
      card: 'border-sky-200/80 bg-gradient-to-br from-sky-50/50 via-white to-blue-50/30 hover:border-sky-300 shadow-sky-500/5',
      iconBox: 'bg-sky-100 text-sky-700 border-sky-200/80',
      value: 'text-sky-950',
      subtext: 'text-sky-700/80',
    },
    emerald: {
      card: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 hover:border-emerald-300 shadow-emerald-500/5',
      iconBox: 'bg-emerald-100 text-emerald-700 border-emerald-200/80',
      value: 'text-emerald-950',
      subtext: 'text-emerald-700/80',
    },
    purple: {
      card: 'border-purple-200/80 bg-gradient-to-br from-purple-50/50 via-white to-violet-50/30 hover:border-purple-300 shadow-purple-500/5',
      iconBox: 'bg-purple-100 text-purple-700 border-purple-200/80',
      value: 'text-purple-950',
      subtext: 'text-purple-700/80',
    },
  }

  const v = isVibrant ? vibrantThemeMap[colorTheme] : null

  const inner = (
    <div className={`bento-card bento-card-hover rounded-xl p-4 sm:p-5 relative overflow-hidden group h-full flex flex-col justify-between active:scale-[0.99] transition-all ${
      v ? v.card : ''
    }`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className={`text-xs font-medium truncate ${isVibrant ? 'text-neutral-700 font-semibold' : 'text-neutral-500'}`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform ${
          v ? v.iconBox : 'bg-neutral-100 text-neutral-700 border border-neutral-200/80'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
          v ? v.value : 'text-neutral-900'
        }`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtext && <div className={`mt-1 text-[11px] font-normal truncate ${
          v ? v.subtext : 'text-neutral-400'
        }`}>{subtext}</div>}
      </div>
    </div>
  )

  return to ? <Link to={to} className="block">{inner}</Link> : inner
}

export default function Dashboard() {
  const { isMobile } = useIsMobile()
  const { user, points } = useAuth()
  const { isVibrant, toggleThemeStyle } = useThemeStyle()
  const { stats, loading: statsLoading, reload: reloadStats } = useVaultStats()
  const { report, loading: healthLoading, reload: reloadHealth } = useVaultHealth()
  const [recentFiles, setRecentFiles] = useState<FileListItem[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [activeMode, setActiveMode] = useState<'cs' | 'math' | 'politics' | 'english' | 'ai'>('cs')
  const [customCount, setCustomCount] = useState(0)

  const loadCustomCount = useCallback(() => {
    api.getCustomQuestions().then(res => {
      if (res && Array.isArray(res.questions)) {
        setCustomCount(res.questions.length)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    loadCustomCount()
    const handleUpdate = () => {
      reloadStats()
      reloadHealth()
      loadCustomCount()
      api.getFiles().then(files => {
        const latest = [...files]
          .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
          .slice(0, 6)
        setRecentFiles(latest)
      }).catch(() => {})
    }

    window.addEventListener('vault-notes-updated', handleUpdate)
    window.addEventListener('vault-stats-updated', handleUpdate)
    window.addEventListener('custom-questions-updated', handleUpdate)

    return () => {
      window.removeEventListener('vault-notes-updated', handleUpdate)
      window.removeEventListener('vault-stats-updated', handleUpdate)
      window.removeEventListener('custom-questions-updated', handleUpdate)
    }
  }, [loadCustomCount, reloadStats, reloadHealth])

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
  const totalQuestions = QUESTION_BANK.length + MATH_QUESTION_BANK.length + customCount

  // 考研初试统一倒计时
  const countdown = useExamCountdown()
  const daysToExam = countdown.days

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
      headline: '考研数学 智能推导研习室',
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
    politics: {
      headline: '考研政治 史纲时空大本营',
      subheadline: '全屏史纲时空轴 · 阿里 DataV 高精矢量中国地图 · 肖秀荣 1000 题精选',
      badge: (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          <span>当前激活：<strong>政治总攻舱</strong> — 1840~2024 近代史会议、真题考点收藏与发光地图</span>
        </>
      ),
      actionPrimary: '/politics',
      actionPrimaryLabel: '开启史纲时空大屏',
      actionSecondary: '/politics',
      actionSecondaryLabel: '刷肖秀荣精选题',
    },
    english: {
      headline: '考研英语 全题型研学中枢',
      subheadline: '大小作文高分模板 · AI 作文四维智能批改 · 历年真题精读与长难句透析',
      badge: (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
          <span>当前激活：<strong>英语总攻舱</strong> — 英语一/二双轨作文三段论、考研 20 分标准换算与大纲词库</span>
        </>
      ),
      actionPrimary: '/english',
      actionPrimaryLabel: '进入英语作战舱',
      actionSecondary: '/english',
      actionSecondaryLabel: 'AI 作文智能批改',
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
      actionSecondary: '/politics',
      actionSecondaryLabel: '考研政治史纲与1000题',
    },
  }

  const currentModeData = modeConfigs[activeMode]

  if (isMobile) {
    return (
      <MobileDashboardView
        stats={stats}
        statsLoading={statsLoading}
        healthScore={healthScore}
        totalQuestions={totalQuestions}
        csQuestionsCount={QUESTION_BANK.length}
        mathQuestionsCount={MATH_QUESTION_BANK.length}
        politicsQuestionsCount={XIAO_1000_POLITICS_QUESTIONS.length}
        user={user}
        points={points}
        onOpenCheckin={() => window.dispatchEvent(new CustomEvent('open-checkin-modal'))}
        onOpenQuickNote={() => window.dispatchEvent(new CustomEvent('open-quick-note'))}
      />
    )
  }

  return (
    <div className="mx-auto max-w-[1560px] space-y-6 animate-fade-in-up">
      {/* ── Subframe Screen 3 Floating Corner Pills Bar ── */}
      <div className="w-full flex items-center justify-between gap-3">
        {/* Top-Left Pill: Vault Logo + Review tasks left (Screen 3 8 pages left replica) */}
        <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-zinc-200/80">
          <Link to="/graph" className="p-1 rounded-lg hover:bg-zinc-100 transition-colors" title="进入全景知识图谱">
            <svg className="w-5 h-5 text-[#141416]" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="4" width="17" height="5.5" rx="1" fill="currentColor" />
              <path d="M4 12.2H14.5L4 22.5V12.2Z" fill="currentColor" />
              <circle cx="17.8" cy="17.8" r="3.4" fill="currentColor" />
            </svg>
          </Link>
          <Link
            to="/study"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#f3f3f5] hover:bg-[#e8e8ec] text-[12px] font-medium text-[#27272a] transition-colors"
            title="查看今日待温习的考研笔记"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3f3f46]" />
            <span>8 篇待复盘考点</span>
          </Link>
        </div>

        {/* Top-Center Pill: 考研初试真实动态倒计时 */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-rose-200/80 text-xs">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
          <span className="text-zinc-600 font-medium">{countdown.targetLabel} 倒计时</span>
          <span className="font-mono font-extrabold text-sm text-rose-600">{daysToExam} 天</span>
        </div>

        {/* Style Switcher Pill: 视觉风格鲜艳风 / 极简风一键切换 */}
        <button
          type="button"
          onClick={toggleThemeStyle}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
            isVibrant
              ? 'border-indigo-300 text-indigo-700 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-pink-50/90 hover:border-indigo-400'
              : 'border-zinc-200/80 text-zinc-700 bg-white hover:bg-zinc-50'
          }`}
          title={isVibrant ? '当前风格：鲜艳活力风（点击切换为经典黑白极简风）' : '当前风格：经典黑白极简风（点击切换为鲜艳活力风）'}
        >
          <Palette className={`w-3.5 h-3.5 ${isVibrant ? 'text-indigo-600 animate-pulse' : 'text-zinc-500'}`} />
          <span>{isVibrant ? '🎨 鲜艳风 (开启中)' : '极简风'}</span>
        </button>

        {/* Top-Right Pill: Multi-AI Connection Icons + Avatar (Screen 3 Connect to code replica) */}
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-zinc-200/80">
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg hover:bg-zinc-100 transition-colors text-[12px] font-medium text-[#18181b]"
            title="推理引擎已连接：Antigravity · Codex · Claude"
          >
            {/* Anthropic / Spark Icon */}
            <svg className="w-3.5 h-3.5 text-[#d97757]" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
              <path d="M8 1.5V14.5M1.5 8H14.5M3.4 3.4L12.6 12.6M12.6 3.4L3.4 12.6" />
            </svg>
            {/* Cube Codex Icon */}
            <svg className="w-3.5 h-3.5 text-zinc-700" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">
              <path d="M8 1.8L13.5 5V11L8 14.2L2.5 11V5L8 1.8Z" />
              <path d="M2.5 5L8 8.2L13.5 5M8 8.2V14.2" />
            </svg>
            {/* OpenAI Swirl Icon */}
            <svg className="w-3.5 h-3.5 text-zinc-700" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
              <circle cx="8" cy="8" r="5.5" />
              <circle cx="8" cy="8" r="2.2" />
            </svg>
            <span className="ml-0.5 hidden sm:inline">AI 伴学舱就绪</span>
          </Link>
          <div className="w-6 h-6 rounded-full bg-[#18181b] text-white text-[12px] font-medium flex items-center justify-center shadow-sm select-none">
            考
          </div>
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

                            {/* Tab 3: 考研政治 */}
              <button
                type="button"
                onClick={() => setActiveMode('politics')}
                className={`relative flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-[12px] text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === 'politics' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <Landmark className={`h-3.5 w-3.5 ${activeMode === 'politics' ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]' : ''}`} />
                <span>考研政治</span>
              </button>

              {/* Tab 4: 考研英语 */}
              <button
                type="button"
                onClick={() => setActiveMode('english')}
                className={`relative flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-[12px] text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                  activeMode === 'english' ? 'metal-tab-active' : 'metal-tab-inactive'
                }`}
              >
                <BookOpen className={`h-3.5 w-3.5 ${activeMode === 'english' ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]' : ''}`} />
                <span>考研英语</span>
              </button>

              {/* Tab 5: AI 伴学 */}
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
            className={`px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all active:scale-[0.99] inline-flex items-center gap-2 ${
              isVibrant
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20'
                : 'bg-[#1c1c1f] hover:bg-[#2a2a2e] shadow-[0_2px_6px_rgba(0,0,0,0.18)]'
            }`}
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
          value={statsLoading ? '...' : (stats?.totalNotes ?? 0)}
          subtext={`累计 ${(stats?.totalWords ?? 0).toLocaleString()} 字`}
          icon={FileText}
          to="/editor"
          colorTheme="amber"
        />
        <MetricCard
          label="双链知识网络"
          value={statsLoading ? '...' : (stats?.totalLinks ?? 0)}
          subtext="跨章节双向引用"
          icon={Link2}
          to="/graph"
          colorTheme="blue"
        />
        <MetricCard
          label="考研四核真题储备"
          value={`${totalQuestions} 题`}
          subtext="408 + 数学 + 政治1000题 + 英语"
          icon={ClipboardList}
          to="/quiz"
          colorTheme="emerald"
        />
        <MetricCard
          label="知识体系健康度"
          value={healthLoading ? '...' : `${healthScore} 分`}
          subtext={`${issueCount} 项结构优化建议`}
          icon={HeartPulse}
          to="/workflow"
          colorTheme="purple"
        />
      </section>

      {/* ── Subframe Project Showcase: Dual-Core Stations ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 408 Computer Science Station Card */}
        <div className={`bento-card bento-card-hover rounded-xl p-5 relative overflow-hidden group flex flex-col justify-between transition-all ${
          isVibrant ? 'border-blue-200/90 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 hover:border-blue-300 shadow-blue-500/5' : ''
        }`}>
          {/* Top Canvas Cover */}
          <div className={`rounded-lg p-4 border mb-4 transition-colors ${
            isVibrant
              ? 'bg-blue-50/80 border-blue-200/70 group-hover:bg-blue-100/70'
              : 'bg-neutral-100/70 border-neutral-200/60 group-hover:bg-neutral-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isVibrant
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-white border border-neutral-200/80 text-neutral-800 shadow-2xs'
                }`}>
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${isVibrant ? 'text-blue-950 font-bold' : 'text-neutral-900'}`}>
                    408 计算机学科专业基础
                  </h3>
                  <p className={`text-[11px] ${isVibrant ? 'text-blue-600/80' : 'text-neutral-400'}`}>
                    全国统考核心大纲
                  </p>
                </div>
              </div>
              <span className={isVibrant ? 'text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200' : 'subframe-pill text-[10.5px]'}>
                {QUESTION_BANK.length} 道真题
              </span>
            </div>

            {/* Micro Pillars Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-blue-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-blue-500' : 'text-neutral-400'}`}>数据结构</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-blue-900' : 'text-neutral-800'}`}>树/图/排序</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-blue-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-blue-500' : 'text-neutral-400'}`}>组成原理</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-blue-900' : 'text-neutral-800'}`}>指令/流水线</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-blue-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-blue-500' : 'text-neutral-400'}`}>操作系统</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-blue-900' : 'text-neutral-800'}`}>内存/进程</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-blue-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-blue-500' : 'text-neutral-400'}`}>计算机网络</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-blue-900' : 'text-neutral-800'}`}>TCP/IP协议</div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer - 优化排版防挤压换行 */}
          <div className="pt-3 border-t border-neutral-150/70 flex flex-col gap-2.5 mt-auto">
            <div className={`text-xs truncate ${isVibrant ? 'text-blue-800/80 font-medium' : 'text-neutral-500'}`} title="包含代码追踪、算法推演与错题归因">
              包含代码追踪、算法推演与错题归因
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/study"
                className="subframe-btn-secondary h-8 px-3 text-xs whitespace-nowrap shrink-0"
              >
                看讲义
              </Link>
              <Link
                to="/quiz?domain=cs_408"
                className={`h-8 flex-1 justify-center px-3 text-xs whitespace-nowrap font-semibold rounded-xl inline-flex items-center gap-1 transition-all active:scale-[0.98] ${
                  isVibrant
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/25'
                    : 'subframe-btn-black'
                }`}
              >
                <span>刷 408</span>
                <span className="font-sans">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Politics Station Card */}
        <div className={`bento-card bento-card-hover rounded-xl p-5 relative overflow-hidden group flex flex-col justify-between transition-all ${
          isVibrant ? 'border-rose-200/90 bg-gradient-to-br from-rose-50/50 via-white to-amber-50/30 hover:border-rose-300 shadow-rose-500/5' : ''
        }`}>
          <div className={`rounded-lg p-4 border mb-4 transition-colors ${
            isVibrant
              ? 'bg-rose-50/80 border-rose-200/70 group-hover:bg-rose-100/70'
              : 'bg-neutral-100/70 border-neutral-200/60 group-hover:bg-neutral-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isVibrant
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25'
                    : 'bg-white border border-neutral-200/80 text-neutral-800 shadow-2xs'
                }`}>
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${isVibrant ? 'text-rose-950 font-bold' : 'text-neutral-900'}`}>
                    考研政治 专项研习室
                  </h3>
                  <p className={`text-[11px] ${isVibrant ? 'text-rose-600/80' : 'text-neutral-400'}`}>
                    全屏史纲时空轴 · 肖秀荣精选真题
                  </p>
                </div>
              </div>
              <span className={isVibrant ? 'text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200' : 'subframe-pill text-[10.5px]'}>
                {XIAO_1000_POLITICS_QUESTIONS.length} 道真题精选
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-rose-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-rose-500' : 'text-neutral-400'}`}>全屏时空轴</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-rose-900' : 'text-neutral-800'}`}>发光地图·配图</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-rose-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-rose-500' : 'text-neutral-400'}`}>肖秀荣1000题</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-rose-900' : 'text-neutral-800'}`}>单选/多选判分</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-rose-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-rose-500' : 'text-neutral-400'}`}>考点收藏夹</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-rose-900' : 'text-neutral-800'}`}>遮罩背诵自测</div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer - 优化排版防挤压换行 */}
          <div className="pt-3 border-t border-neutral-150/70 flex flex-col gap-2.5 mt-auto">
            <div className={`text-xs truncate ${isVibrant ? 'text-rose-800/80 font-medium' : 'text-neutral-500'}`} title="全屏时空大地图 · 历次会议对比">
              全屏时空大地图 · 历次会议对比
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/politics"
                className="subframe-btn-secondary h-8 px-3 text-xs whitespace-nowrap shrink-0"
              >
                看时空轴
              </Link>
              <Link
                to="/politics"
                className={`h-8 flex-1 justify-center px-3 text-xs whitespace-nowrap font-semibold rounded-xl inline-flex items-center gap-1 transition-all active:scale-[0.98] ${
                  isVibrant
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-sm shadow-rose-500/25'
                    : 'subframe-btn-black'
                }`}
              >
                <span>刷政治真题</span>
                <span className="font-sans">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Math Station Card */}
        <div className={`bento-card bento-card-hover rounded-xl p-5 relative overflow-hidden group flex flex-col justify-between transition-all ${
          isVibrant ? 'border-purple-200/90 bg-gradient-to-br from-purple-50/50 via-white to-violet-50/30 hover:border-purple-300 shadow-purple-500/5' : ''
        }`}>
          {/* Top Canvas Cover */}
          <div className={`rounded-lg p-4 border mb-4 transition-colors ${
            isVibrant
              ? 'bg-purple-50/80 border-purple-200/70 group-hover:bg-purple-100/70'
              : 'bg-neutral-100/70 border-neutral-200/60 group-hover:bg-neutral-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isVibrant
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                    : 'bg-white border border-neutral-200/80 text-neutral-800 shadow-2xs'
                }`}>
                  <Sigma className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${isVibrant ? 'text-purple-950 font-bold' : 'text-neutral-900'}`}>
                    考研数学 专项研习室
                  </h3>
                  <p className={`text-[11px] ${isVibrant ? 'text-purple-600/80' : 'text-neutral-400'}`}>
                    数一 · 数二 · 数三
                  </p>
                </div>
              </div>
              <span className={isVibrant ? 'text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200' : 'subframe-pill text-[10.5px]'}>
                {MATH_QUESTION_BANK.length} 道真题
              </span>
            </div>

            {/* Micro Pillars Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-purple-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-purple-500' : 'text-neutral-400'}`}>高等数学 / 微积分</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-purple-900' : 'text-neutral-800'}`}>极限·导数·积分</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-purple-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-purple-500' : 'text-neutral-400'}`}>线性代数</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-purple-900' : 'text-neutral-800'}`}>矩阵·秩·特征值</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-purple-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-purple-500' : 'text-neutral-400'}`}>概率论与数理统计</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-purple-900' : 'text-neutral-800'}`}>大数定律·参数估计</div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer - 优化排版防挤压换行 */}
          <div className="pt-3 border-t border-neutral-150/70 flex flex-col gap-2.5 mt-auto">
            <div className={`text-xs truncate ${isVibrant ? 'text-purple-800/80 font-medium' : 'text-neutral-500'}`} title="全量 KaTeX 公式排版与严谨步骤推导">
              全量 KaTeX 公式排版与严谨步骤推导
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/chat"
                className="subframe-btn-secondary h-8 px-3 text-xs whitespace-nowrap shrink-0"
              >
                公式答疑
              </Link>
              <Link
                to="/quiz?domain=math"
                className={`h-8 flex-1 justify-center px-3 text-xs whitespace-nowrap font-semibold rounded-xl inline-flex items-center gap-1 transition-all active:scale-[0.98] ${
                  isVibrant
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm shadow-purple-500/25'
                    : 'subframe-btn-black'
                }`}
              >
                <span>刷数学</span>
                <span className="font-sans">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* English Station Card */}
        <div className={`bento-card bento-card-hover rounded-xl p-5 relative overflow-hidden group flex flex-col justify-between transition-all ${
          isVibrant ? 'border-emerald-200/90 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 hover:border-emerald-300 shadow-emerald-500/5' : ''
        }`}>
          <div className={`rounded-lg p-4 border mb-4 transition-colors ${
            isVibrant
              ? 'bg-emerald-50/80 border-emerald-200/70 group-hover:bg-emerald-100/70'
              : 'bg-neutral-100/70 border-neutral-200/60 group-hover:bg-neutral-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isVibrant
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                    : 'bg-white border border-neutral-200/80 text-neutral-800 shadow-2xs'
                }`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${isVibrant ? 'text-emerald-950 font-bold' : 'text-neutral-900'}`}>
                    考研英语 专项研习室
                  </h3>
                  <p className={`text-[11px] ${isVibrant ? 'text-emerald-600/80' : 'text-neutral-400'}`}>
                    大纲词库 · 高分作文 · AI批改
                  </p>
                </div>
              </div>
              <span className={isVibrant ? 'text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200' : 'subframe-pill text-[10.5px]'}>
                全套写作模板
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-emerald-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-emerald-500' : 'text-neutral-400'}`}>高分模板</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-emerald-900' : 'text-neutral-800'}`}>图画·图表·书信</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-emerald-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-emerald-500' : 'text-neutral-400'}`}>AI 智能批改</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-emerald-900' : 'text-neutral-800'}`}>10/20分·润色</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-emerald-100 shadow-2xs' : 'bg-white/90 border-neutral-200/50'
              }`}>
                <div className={`text-[10px] font-medium ${isVibrant ? 'text-emerald-500' : 'text-neutral-400'}`}>真题与词汇</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-emerald-900' : 'text-neutral-800'}`}>长难句·艾宾浩斯</div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer - 优化排版防挤压换行 */}
          <div className="pt-3 border-t border-neutral-150/70 flex flex-col gap-2.5 mt-auto">
            <div className={`text-xs truncate ${isVibrant ? 'text-emerald-800/80 font-medium' : 'text-neutral-500'}`} title="作文四维评分与词汇升级替换">
              作文四维评分与词汇升级替换
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/english"
                className="subframe-btn-secondary h-8 px-3 text-xs whitespace-nowrap shrink-0"
              >
                看模板
              </Link>
              <Link
                to="/english"
                className={`h-8 flex-1 justify-center px-3 text-xs whitespace-nowrap font-semibold rounded-xl inline-flex items-center gap-1 transition-all active:scale-[0.98] ${
                  isVibrant
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm shadow-emerald-500/25'
                    : 'subframe-btn-black'
                }`}
              >
                <span>去研习</span>
                <span className="font-sans">→</span>
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
          {/* 练题热力图 & 专注学习统计 (Practice Heatmap & Focus Statistics) */}
          <div className="bento-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                <Flame className="h-4 w-4 text-accent-orange" />
                <span>练题热力图 & 专注统计</span>
              </h2>
              <Link
                to="/study?tab=topology"
                className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 group"
              >
                <span>考点热力大纲</span>
                <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* 16周练题热力色块矩阵 (类似 GitHub 贡献热力网格) */}
            <div>
              <div className="flex items-center justify-between text-[10.5px] text-neutral-400 mb-2">
                <span>近 16 周刷题与复盘活跃度</span>
                <span className="flex items-center gap-1">
                  <span>少</span>
                  <span className="w-2 h-2 rounded-[2px] bg-neutral-100 border border-neutral-200" />
                  <span className="w-2 h-2 rounded-[2px] bg-amber-200" />
                  <span className="w-2 h-2 rounded-[2px] bg-amber-400" />
                  <span className="w-2 h-2 rounded-[2px] bg-orange-500" />
                  <span>多</span>
                </span>
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-1">
                {Array.from({ length: 112 }).map((_, i) => {
                  const intensity = (i * 17 + 23) % 11
                  const bg = intensity === 0
                    ? 'bg-neutral-100 border-neutral-200/60'
                    : intensity < 4
                      ? 'bg-amber-100 border-amber-200/80'
                      : intensity < 8
                        ? 'bg-amber-300 border-amber-400'
                        : 'bg-orange-500 border-orange-600 text-white'
                  return (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-[2px] border ${bg} transition-transform hover:scale-125 cursor-pointer`}
                      title={`做题活跃节点 · 累计完成模拟与复盘`}
                    />
                  )
                })}
              </div>
            </div>

            {/* 专注统计指标行 */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-100 text-center">
              <div className="bg-neutral-50/80 rounded-lg p-2 border border-neutral-200/50">
                <div className="text-[10px] text-neutral-400 font-medium">今日专注</div>
                <div className="text-xs font-bold font-mono text-neutral-800 mt-0.5">45 分钟</div>
              </div>
              <div className="bg-neutral-50/80 rounded-lg p-2 border border-neutral-200/50">
                <div className="text-[10px] text-neutral-400 font-medium">番茄钟</div>
                <div className="text-xs font-bold font-mono text-neutral-800 mt-0.5">3 轮完成</div>
              </div>
              <div className="bg-neutral-50/80 rounded-lg p-2 border border-neutral-200/50">
                <div className="text-[10px] text-neutral-400 font-medium">考点掌握度</div>
                <div className="text-xs font-bold font-mono text-accent-sage mt-0.5">82% 达标</div>
              </div>
            </div>
          </div>

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
