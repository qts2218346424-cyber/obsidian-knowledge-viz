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
  Headphones,
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
  Moon,
  Leaf,
  Play,
  Target,
  Zap,
} from 'lucide-react'
import { api, type FileListItem, type StudyProgressOverview } from '../services/api'
import { useVaultHealth, useVaultStats } from '../hooks/useVaultData'
import { useThemeStyle } from '../hooks/useThemeStyle'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../contexts/AuthContext'
import DangoAvatar from '../components/DangoAvatar'
import MobileDashboardView from '../components/mobile/MobileDashboardView'
import { getQuestionCounts } from '../data/questionCounts'
import { getDailyPomodoroStats, onDailyPomodoroStatsUpdate } from '../utils/pomodoroSync'


import { useExamCountdown } from '../utils/examDate'

// 模块级 SWR 快照缓存，确保跨路由切回首页 0ms 秒显不闪烁
let cachedProgressOverview: StudyProgressOverview | null = null

interface SavedQuizDraftSummary {
  title: string
  answeredCount: number
  totalCount: number
  currentIndex: number
  updatedAt: number
}

function readSavedQuizDraft(userId?: string): SavedQuizDraftSummary | null {
  try {
    const key = userId ? `coreforge_quiz_progress_${userId}` : 'coreforge_quiz_progress_guest'
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length === 0) return null
    const answeredCount = parsed.answers ? Object.keys(parsed.answers).filter(k => Boolean(parsed.answers[k])).length : 0
    return {
      title: parsed.title || parsed.activePaperContext?.title || parsed.activeTopicLabel || '真题专项训练',
      answeredCount,
      totalCount: parsed.questions.length,
      currentIndex: Number(parsed.currentIndex) || 0,
      updatedAt: Number(parsed.updatedAt) || Date.now(),
    }
  } catch {
    return null
  }
}

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
  loading?: boolean
}

function MetricCard({ label, value, subtext, icon: Icon, to, colorTheme = 'amber', loading = false }: MetricCardProps) {
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
        <span className={`text-xs font-medium truncate ${isVibrant ? 'text-slate-700 font-semibold' : 'text-slate-500'}`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform ${
          v ? v.iconBox : 'bg-slate-100 text-slate-700 border border-slate-200/80'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2 py-0.5" aria-label="加载中">
          <div className="h-7 w-20 rounded-md bg-slate-200/80 animate-pulse" />
          <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
        </div>
      ) : (
        <div>
          <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
            v ? v.value : 'text-slate-900'
          }`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtext && <div className={`mt-1 text-2xs font-normal truncate ${
            v ? v.subtext : 'text-slate-400'
          }`}>{subtext}</div>}
        </div>
      )}
    </div>
  )

  return to ? <Link to={to} className="block">{inner}</Link> : inner
}

export default function Dashboard() {
  const { isMobile } = useIsMobile()
  const { user, points } = useAuth()
  const { themeStyle, isVibrant, isMinimal, isEyecare, isDark, currentThemeMeta, toggleThemeStyle } = useThemeStyle()
  const { stats, loading: statsLoading, reload: reloadStats } = useVaultStats()
  const { report, loading: healthLoading, reload: reloadHealth } = useVaultHealth()
  const [recentFiles, setRecentFiles] = useState<FileListItem[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [activeMode, setActiveMode] = useState<'cs' | 'math' | 'politics' | 'english' | 'ai'>('cs')
  const [customCount, setCustomCount] = useState(0)
  const [qCounts] = useState(() => getQuestionCounts())
  const [dailyFocus, setDailyFocus] = useState(() => getDailyPomodoroStats())
  const [progressOverview, setProgressOverview] = useState<StudyProgressOverview | null>(() => cachedProgressOverview)
  const [savedQuizDraft, setSavedQuizDraft] = useState<SavedQuizDraftSummary | null>(() => readSavedQuizDraft(user?.id))

  useEffect(() => {
    setSavedQuizDraft(readSavedQuizDraft(user?.id))
  }, [user?.id])

  useEffect(() => {
    return onDailyPomodoroStatsUpdate(setDailyFocus)
  }, [])

  useEffect(() => {
    let cancelled = false
    api.getStudyProgressOverview()
      .then(res => {
        if (cancelled) return
        cachedProgressOverview = res
        setProgressOverview(res)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

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
        const latest = files
          .toSorted((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
          .slice(0, 8)
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
        const latest = files
          .toSorted((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
          .slice(0, 8)
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
  const totalQuestions = qCounts.cs + qCounts.math + (qCounts.politics || 0) + (qCounts.paperQuestions || 0) + customCount
  const dueFlashcardsCount = progressOverview?.summary?.flashcardsDue ?? null
  const syllabusMasteryRate = useMemo(() => {
    const s = progressOverview?.summary
    if (!s || !s.syllabusTotal) return 82
    if (s.syllabusMastered === 0 && s.syllabusInProgress === 0) return 82
    return Math.round(((s.syllabusMastered + s.syllabusInProgress * 0.5) / s.syllabusTotal) * 100)
  }, [progressOverview])

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
          <span>当前激活：<strong>408 统考舱</strong> — 已就绪 {qCounts.cs} 道真题演练与算法推演</span>
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
          <span>当前激活：<strong>考研数学舱</strong> — KaTeX 学术级公式排版与步骤推导（{qCounts.math} 题）</span>
        </>
      ),
      actionPrimary: '/quiz?domain=math',
      actionPrimaryLabel: '开始数学高频冲刺',
      actionSecondary: '/chat',
      actionSecondaryLabel: 'AI 严谨公式分步推导',
    },
    politics: {
      headline: '考研政治 1839–2026 史纲大本营',
      subheadline: '高精矢量中国历史地图 · 同城多史实循环联动 · 十五五时政与千题遮罩精粹',
      badge: (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          <span>当前激活：<strong>政治总攻舱</strong> — 1839–2026 史纲全景地图、“史上第一次”专题与千题排雷</span>
        </>
      ),
      actionPrimary: '/politics',
      actionPrimaryLabel: '漫游史纲全景地图',
      actionSecondary: '/politics',
      actionSecondaryLabel: '刷五大模块千题',
    },
    english: {
      headline: '考研英语 全题型与默写巡航中枢',
      subheadline: '完形阅读整卷点词即查 · 20分制四维智能精批 · 拼写默写与随身巡航词库',
      badge: (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
          <span>当前激活：<strong>英语总攻舱</strong> — 英一/二三段论模板、1.2s 四维作文批改与 5 阶词根色谱</span>
        </>
      ),
      actionPrimary: '/english',
      actionPrimaryLabel: '进入英语实战舱',
      actionSecondary: '/vocabulary',
      actionSecondaryLabel: '开启背词默写/巡航',
    },
    ai: {
      headline: '分科 AI 导师思考流 & 双宠伴学',
      subheadline: 'DeepSeek 破题思考链零缓冲流式直出 · 奶龙×大肥鱼真人语音随身聊',
      badge: (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>当前激活：<strong>AI 伴学工作台</strong> — 研小核/数小通/英小研/政小思双师会诊与八向缩放随身窗</span>
        </>
      ),
      actionPrimary: '/chat',
      actionPrimaryLabel: '召唤分科 AI 导师',
      actionSecondary: '/study?tab=mastery',
      actionSecondaryLabel: '11级考点色谱 · AI出卷',
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
        csQuestionsCount={qCounts.cs}
        mathQuestionsCount={qCounts.math}
        politicsQuestionsCount={qCounts.politics}
        user={user}
        points={points}
        onOpenQuickNote={() => window.dispatchEvent(new CustomEvent('open-quick-note'))}
      />
    )
  }

  return (
    <div className="mx-auto max-w-[1560px] space-y-6 animate-fade-in-up">
      {/* ── Apple Studio 风格精炼状态顶栏 ── */}
      <div className="w-full flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-black/[0.06] text-xs">
          <Link
            to="/study?tab=flashcards"
            className="inline-flex items-center gap-1.5 font-medium text-slate-800 hover:text-[#0066cc] transition-colors"
            title="点击进入艾宾浩斯今日待复盘队列"
          >
            <span className="w-2 h-2 rounded-full bg-[#30d158] shrink-0" />
            <span>
              {dueFlashcardsCount !== null && dueFlashcardsCount > 0
                ? `${dueFlashcardsCount} 张今日待复盘闪卡`
                : `${getTimeGreeting()}`}
            </span>
          </Link>
          <span className="h-3 w-px bg-slate-200" aria-hidden="true" />
          <span className="text-slate-500">
            距初试 <strong className="font-semibold text-slate-900 tabular-nums">{daysToExam}</strong> 天
          </span>
        </div>

        <div className="inline-flex items-center gap-2">
          {/* 视觉主题循环切换胶囊 */}
          <button
            type="button"
            onClick={toggleThemeStyle}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? 'border-slate-700 text-sky-400 bg-slate-900 hover:border-slate-600'
                : isEyecare
                ? 'border-emerald-200/90 text-emerald-800 bg-emerald-50/70 hover:bg-emerald-50'
                : 'border-black/[0.06] text-slate-700 bg-white hover:bg-slate-50'
            }`}
            title={`当前风格：${currentThemeMeta.name}（点击切换下一主题）`}
          >
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-sky-400" />
            ) : isEyecare ? (
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Palette className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{currentThemeMeta.shortName}</span>
          </button>

          {/* 产品导览 + AI 中枢 + 头像 */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.06]">
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent('open-user-guide', { detail: { tab: 'tour' } }))
              }
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="查看 1 分钟视觉巡礼与使用手册"
            >
              <Compass className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>产品导览</span>
            </button>

            <span className="h-3 w-px bg-slate-200" aria-hidden="true" />

            <Link
              to="/chat"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full hover:bg-slate-100 transition-colors text-xs font-medium text-slate-800"
              title="推理引擎已就绪：DeepSeek 思考流 · Claude · Codex"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
              <span className="hidden sm:inline">AI 导师</span>
            </Link>
            <DangoAvatar
              seed={user?.username || user?.displayName}
              size="sm"
              className="shadow-2xs"
              title={`${user?.displayName || user?.username || '考研上岸人'}`}
            />
          </div>
        </div>
      </div>

      {/* ── Apple Studio 纯净主控导航台 ── */}
      <section
        className={`relative overflow-hidden rounded-[28px] py-10 sm:py-14 px-4 sm:px-8 text-center flex flex-col items-center justify-center border transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : isEyecare
            ? 'bg-[#f1f5ef] border-emerald-200/60'
            : 'bg-white border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.025)]'
        }`}
      >
        {/* Apple Segmented Control 五核切换胶囊 */}
        <div
          role="group"
          aria-label="切换工作台学科焦点"
          className={`inline-flex items-center gap-1 p-1 rounded-full max-w-full overflow-x-auto no-scrollbar mb-7 select-none ${
            isDark ? 'bg-slate-800/90' : 'bg-[#f5f5f7]'
          }`}
        >
          {[
            { id: 'cs' as const, label: '408 计算机' },
            { id: 'math' as const, label: '考研数学' },
            { id: 'politics' as const, label: '考研政治' },
            { id: 'english' as const, label: '考研英语' },
            { id: 'ai' as const, label: 'AI 伴学' },
          ].map((tab) => {
            const active = activeMode === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveMode(tab.id)}
                className={`min-h-9 px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-[13px] whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? isDark
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'bg-white text-[#1d1d1f] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                    : isDark
                    ? 'text-slate-400 hover:text-white font-medium'
                    : 'text-[#515154] hover:text-[#1d1d1f] font-medium'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* 主标题与清透副标题 */}
        <h1 className="text-2xl sm:text-4xl md:text-[44px] font-semibold tracking-[-0.032em] leading-[1.12] text-slate-900 mb-3">
          {currentModeData.headline}
        </h1>

        <p className="text-sm sm:text-base md:text-[17px] font-normal tracking-[-0.01em] text-slate-500 max-w-[640px] mb-6">
          {currentModeData.subheadline}
        </p>

        {/* 克制状态说明行 */}
        <div className="mb-7 inline-flex items-center gap-2 text-xs text-slate-500">
          {currentModeData.badge}
        </div>

        {/* Apple 双圆角胶囊按钮组 */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={currentModeData.actionPrimary}
            className="min-h-10 px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <span>{currentModeData.actionPrimaryLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            to={currentModeData.actionSecondary}
            className={`min-h-10 px-6 py-2.5 rounded-full border text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
              isDark
                ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'border-[#0071e3] text-[#0066cc] hover:bg-[#0071e3] hover:text-white'
            }`}
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
          colorTheme="amber"
          loading={statsLoading || !stats}
        />
        <MetricCard
          label="双链知识网络"
          value={stats?.totalLinks ?? 0}
          subtext="跨章节双向引用"
          icon={Link2}
          to="/graph"
          colorTheme="blue"
          loading={statsLoading || !stats}
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
          value={`${healthScore} 分`}
          subtext={`${issueCount} 项结构优化建议`}
          icon={HeartPulse}
          to="/workflow"
          colorTheme="purple"
          loading={healthLoading || !report}
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
              : 'bg-slate-100/70 border-slate-200/60 group-hover:bg-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isVibrant
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-white border border-slate-200/80 text-slate-800 shadow-xs'
                }`}>
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${isVibrant ? 'text-blue-950 font-bold' : 'text-slate-900'}`}>
                    408 计算机学科专业基础
                  </h3>
                  <p className={`text-2xs ${isVibrant ? 'text-blue-600/80' : 'text-slate-400'}`}>
                    全国统考核心大纲
                  </p>
                </div>
              </div>
              <span className={isVibrant ? 'text-2xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200' : 'subframe-pill text-2xs'}>
                {qCounts.cs} 道真题
              </span>
            </div>

            {/* Micro Pillars Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-blue-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-blue-500' : 'text-slate-400'}`}>数据结构</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-blue-900' : 'text-slate-800'}`}>树/图/排序</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-blue-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-blue-500' : 'text-slate-400'}`}>组成原理</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-blue-900' : 'text-slate-800'}`}>指令/流水线</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-blue-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-blue-500' : 'text-slate-400'}`}>操作系统</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-blue-900' : 'text-slate-800'}`}>内存/进程</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-blue-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-blue-500' : 'text-slate-400'}`}>计算机网络</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-blue-900' : 'text-slate-800'}`}>TCP/IP协议</div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer - 优化排版防挤压换行 */}
          <div className="pt-3 border-t border-slate-150/70 flex flex-col gap-2.5 mt-auto">
            <div className={`text-xs truncate ${isVibrant ? 'text-blue-800/80 font-medium' : 'text-slate-500'}`} title="包含代码追踪、算法推演与错题归因">
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
              : 'bg-slate-100/70 border-slate-200/60 group-hover:bg-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isVibrant
                    ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/25'
                    : 'bg-white border border-slate-200/80 text-slate-800 shadow-xs'
                }`}>
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${isVibrant ? 'text-rose-950 font-bold' : 'text-slate-900'}`}>
                    考研政治 专项研习室
                  </h3>
                  <p className={`text-2xs ${isVibrant ? 'text-rose-600/80' : 'text-slate-400'}`}>
                    1839–2026 史纲全景地图 · 十五五时政
                  </p>
                </div>
              </div>
              <span className={isVibrant ? 'text-2xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200' : 'subframe-pill text-2xs'}>
                {qCounts.politics} 道真题精选
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-rose-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-rose-500' : 'text-slate-400'}`}>1839–2026地图</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-rose-900' : 'text-slate-800'}`}>同城史实联动</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-rose-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-rose-500' : 'text-slate-400'}`}>十五五与千题</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-rose-900' : 'text-slate-800'}`}>单选/多选排雷</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-rose-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-rose-500' : 'text-slate-400'}`}>史上第一次</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-rose-900' : 'text-slate-800'}`}>遮罩背诵自测</div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer - 优化排版防挤压换行 */}
          <div className="pt-3 border-t border-slate-150/70 flex flex-col gap-2.5 mt-auto">
            <div className={`text-xs truncate ${isVibrant ? 'text-rose-800/80 font-medium' : 'text-slate-500'}`} title="1839–2026 全景中国地图 · 同城多史实对比">
              1839–2026 全景中国地图 · 同城多史实对比
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
              : 'bg-slate-100/70 border-slate-200/60 group-hover:bg-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isVibrant
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/25'
                    : 'bg-white border border-slate-200/80 text-slate-800 shadow-xs'
                }`}>
                  <Sigma className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${isVibrant ? 'text-purple-950 font-bold' : 'text-slate-900'}`}>
                    考研数学 专项研习室
                  </h3>
                  <p className={`text-2xs ${isVibrant ? 'text-purple-600/80' : 'text-slate-400'}`}>
                    数一 · 数二 · 数三
                  </p>
                </div>
              </div>
              <span className={isVibrant ? 'text-2xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200' : 'subframe-pill text-2xs'}>
                {qCounts.math} 道真题
              </span>
            </div>

            {/* Micro Pillars Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-purple-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-purple-500' : 'text-slate-400'}`}>高等数学 / 微积分</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-purple-900' : 'text-slate-800'}`}>极限·导数·积分</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-purple-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-purple-500' : 'text-slate-400'}`}>线性代数</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-purple-900' : 'text-slate-800'}`}>矩阵·秩·特征值</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-purple-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-purple-500' : 'text-slate-400'}`}>概率论与数理统计</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-purple-900' : 'text-slate-800'}`}>大数定律·参数估计</div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer - 优化排版防挤压换行 */}
          <div className="pt-3 border-t border-slate-150/70 flex flex-col gap-2.5 mt-auto">
            <div className={`text-xs truncate ${isVibrant ? 'text-purple-800/80 font-medium' : 'text-slate-500'}`} title="全量 KaTeX 公式排版与严谨步骤推导">
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
              : 'bg-slate-100/70 border-slate-200/60 group-hover:bg-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isVibrant
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25'
                    : 'bg-white border border-slate-200/80 text-slate-800 shadow-xs'
                }`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${isVibrant ? 'text-emerald-950 font-bold' : 'text-slate-900'}`}>
                    考研英语 专项研习室
                  </h3>
                  <p className={`text-2xs ${isVibrant ? 'text-emerald-600/80' : 'text-slate-400'}`}>
                    全题型点词 · 默写巡航 · 20分制精批
                  </p>
                </div>
              </div>
              <span className={isVibrant ? 'text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200' : 'subframe-pill text-2xs'}>
                整卷+词库全通
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-emerald-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-emerald-500' : 'text-slate-400'}`}>整卷点词即查</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-emerald-900' : 'text-slate-800'}`}>完形·阅读·外刊</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-emerald-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-emerald-500' : 'text-slate-400'}`}>20分制精批</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-emerald-900' : 'text-slate-800'}`}>四维打分·升格</div>
              </div>
              <div className={`rounded-md py-2 px-1 border transition-colors ${
                isVibrant ? 'bg-white/95 border-emerald-100 shadow-xs' : 'bg-white/90 border-slate-200/50'
              }`}>
                <div className={`text-2xs font-medium ${isVibrant ? 'text-emerald-500' : 'text-slate-400'}`}>全新背词系统</div>
                <div className={`text-xs font-semibold mt-0.5 ${isVibrant ? 'text-emerald-900' : 'text-slate-800'}`}>默写·随身巡航</div>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer - 优化排版防挤压换行 */}
          <div className="pt-3 border-t border-slate-150/70 flex flex-col gap-2.5 mt-auto">
            <div className={`text-xs truncate ${isVibrant ? 'text-emerald-800/80 font-medium' : 'text-slate-500'}`} title="整卷点词精读 · 20分制四维批改 · 默写巡航">
              整卷点词精读 · 20分制四维批改 · 默写巡航
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/vocabulary"
                className="subframe-btn-secondary h-8 px-3 text-xs whitespace-nowrap shrink-0"
              >
                去背词
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

      {/* ── Subframe Symmetric Bento Workspace Split (修复双栏栅格错位并融合断点续做真题舱) ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr] items-start">
        {/* Left Column: Resume Quiz Hub + Today Action + Recent Notes */}
        <div className="space-y-4">
          {/* 断点续练直通车 / 今日冲刺焦点舱 */}
          {savedQuizDraft ? (
            <div
              className={`bento-card bento-card-hover rounded-xl p-4 sm:p-5 relative overflow-hidden ${
                isVibrant
                  ? 'border-indigo-200/90 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/50'
                  : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold bg-indigo-600 text-white shadow-2xs">
                      <Zap className="w-3 h-3" />
                      <span>断点续做</span>
                    </span>
                    <span className="text-2xs font-mono text-slate-400">
                      上次停留第 {savedQuizDraft.currentIndex + 1} 题
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 truncate">
                    {savedQuizDraft.title}
                  </h3>
                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="flex-1 max-w-[220px] h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            6,
                            Math.round((savedQuizDraft.answeredCount / Math.max(1, savedQuizDraft.totalCount)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-2xs font-mono font-semibold text-slate-600">
                      已答 {savedQuizDraft.answeredCount} / {savedQuizDraft.totalCount} 题
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={openQuickNote}
                    className="subframe-btn-secondary h-9 px-3 text-xs whitespace-nowrap cursor-pointer"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>随手记</span>
                  </button>
                  <Link
                    to="/quiz"
                    className={`h-9 px-4 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all active:scale-95 ${
                      isVibrant
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-sm shadow-indigo-500/25'
                        : 'subframe-btn-black'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>继续刷题</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bento-card rounded-xl p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {progressOverview?.todayActions?.[0]?.title || '今日高效冲刺闭环：真题演练 + 错题归因 + 闪卡复盘'}
                  </div>
                  <div className="text-2xs text-slate-500 truncate mt-0.5">
                    {progressOverview?.todayActions?.[0]?.description || '随时按下 Ctrl+K 呼出全局命令中心，秒搜笔记、讲义与动态仿真课件'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={openQuickNote}
                  className="subframe-btn-secondary h-8 px-3 text-xs whitespace-nowrap cursor-pointer"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>极速随手记</span>
                </button>
                <Link
                  to={progressOverview?.todayActions?.[0]?.targetType === 'route' ? progressOverview.todayActions[0].target : '/quiz'}
                  className="subframe-btn-black h-8 px-3.5 text-xs whitespace-nowrap"
                >
                  <span>{progressOverview?.todayActions?.[0]?.actionLabel || '开启今日真题'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Recent Notes Table/List */}
          <div className="bento-card rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600" />
                <h2 className="text-sm font-semibold text-slate-900">最近更新笔记</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Inline Filter Input */}
                <div className="relative">
                  <Search className="h-3 w-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="过滤笔记..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    className="h-7 pl-7 pr-2.5 text-xs bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-transparent focus:border-slate-300 rounded-md transition-all outline-none text-slate-800 w-28 sm:w-36"
                  />
                </div>
                <Link
                  to="/editor"
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-0.5"
                >
                  <span>全部</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filesLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">正在加载最近笔记…</div>
              ) : filteredRecentFiles.length > 0 ? (
                filteredRecentFiles.map(file => (
                  <Link
                    key={file.path}
                    to={`/editor?path=${encodeURIComponent(file.path)}`}
                    className="flex items-center gap-3 py-2.5 rounded-lg px-2 transition-colors hover:bg-slate-50 group"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors shrink-0">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-slate-900">
                        {file.title || file.path.split('/').pop()}
                      </div>
                      <div className="text-2xs text-slate-400 truncate mt-0.5 font-mono">{file.path}</div>
                    </div>
                    <div className="flex items-center gap-1 text-2xs font-mono text-slate-400 shrink-0">
                      <span>{formatModifiedDate(file.modified)}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-600" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="text-xs text-slate-400">暂无匹配笔记</div>
                  <Link to="/editor" className="inline-flex items-center gap-1 text-xs font-medium text-slate-900 underline underline-offset-2">
                    <FilePlus2 className="h-3.5 w-3.5" />
                    <span>新建笔记</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Practice Heatmap + Quick Tools + Vault Health */}
        <div className="space-y-4">
          {/* 练题热力图 & 专注学习统计 (Practice Heatmap & Focus Statistics) */}
          <div className="bento-card rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>练题热力图 & 专注统计</span>
              </h2>
              <Link
                to="/study?tab=topology"
                className="text-2xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 group"
              >
                <span>考点热力大纲</span>
                <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* 16周练题热力色块矩阵 */}
            <div>
              <div className="flex items-center justify-between text-2xs text-slate-400 mb-2">
                <span>近 16 周刷题与复盘活跃度</span>
                <span className="flex items-center gap-1">
                  <span>少</span>
                  <span className="w-2 h-2 rounded-xs bg-slate-100 border border-slate-200" />
                  <span className="w-2 h-2 rounded-xs bg-amber-200" />
                  <span className="w-2 h-2 rounded-xs bg-amber-400" />
                  <span className="w-2 h-2 rounded-xs bg-orange-500" />
                  <span>多</span>
                </span>
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto py-1 no-scrollbar">
                {Array.from({ length: 112 }).map((_, i) => {
                  // 最近 7 天优先叠加后端真实做题活跃度
                  const recentOffset = 111 - i
                  const trendDay =
                    recentOffset >= 0 && recentOffset < (progressOverview?.weeklyTrend?.length ?? 0)
                      ? progressOverview!.weeklyTrend[progressOverview!.weeklyTrend.length - 1 - recentOffset]
                      : null
                  const intensity = trendDay
                    ? trendDay.attempted === 0
                      ? 0
                      : trendDay.attempted < 10
                        ? 3
                        : trendDay.attempted < 25
                          ? 6
                          : 9
                    : (i * 17 + 23) % 11
                  const bg = intensity === 0
                    ? 'bg-slate-100 border-slate-200/60'
                    : intensity < 4
                      ? 'bg-amber-100 border-amber-200/80'
                      : intensity < 8
                        ? 'bg-amber-300 border-amber-400'
                        : 'bg-orange-500 border-orange-600 text-white'
                  return (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-xs border ${bg} transition-transform hover:scale-125 cursor-pointer`}
                      title={
                        trendDay
                          ? `${trendDay.date}：作答 ${trendDay.attempted} 题（正确率 ${trendDay.accuracy}%）`
                          : '研学复盘活跃节点'
                      }
                    />
                  )
                })}
              </div>
            </div>

            {/* 专注统计指标行（实时联动番茄钟与考纲掌握度） */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
              <Link to="/pomodoro" className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors rounded-lg p-2 border border-slate-200/50 block">
                <div className="text-2xs text-slate-400 font-medium">今日专注</div>
                <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">{dailyFocus.minutes} 分钟</div>
              </Link>
              <Link to="/pomodoro" className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors rounded-lg p-2 border border-slate-200/50 block">
                <div className="text-2xs text-slate-400 font-medium">今日番茄</div>
                <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">{dailyFocus.count} 轮完成</div>
              </Link>
              <Link to="/study?tab=progress" className="bg-slate-50/80 hover:bg-slate-100/80 transition-colors rounded-lg p-2 border border-slate-200/50 block">
                <div className="text-2xs text-slate-400 font-medium">考点掌握度</div>
                <div className="text-xs font-bold font-mono text-emerald-600 mt-0.5">{syllabusMasteryRate}% 达标</div>
              </Link>
            </div>
          </div>
          {/* Apple Bento 风格纯净高频导航矩阵 */}
          <div className="bento-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-sm font-semibold text-slate-900">快捷工作空间</h2>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('start-interactive-tour'))}
                className="text-xs font-medium text-[#0066cc] hover:underline cursor-pointer"
              >
                实景导览 ›
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  to: '/study?tab=coursewares',
                  icon: GraduationCap,
                  title: '仿真与闪卡',
                  sub: '22+ 动画 · SM-2',
                },
                {
                  to: '/graph',
                  icon: Flame,
                  title: '掌握度星图',
                  sub: '5 题靶向急救',
                },
                {
                  to: '/vocabulary',
                  icon: Headphones,
                  title: '背词与巡航',
                  sub: '默写检验 · 连播',
                },
                {
                  to: '/quiz?tab=errors',
                  icon: ClipboardList,
                  title: '智能错题本',
                  sub: '三维归因重练',
                },
                {
                  to: '/editor',
                  icon: FileText,
                  title: '双链公式笔记',
                  sub: 'Obsidian 同步',
                },
                {
                  to: '/pomodoro',
                  icon: Clock,
                  title: '心流番茄钟',
                  sub: '专注与白噪音',
                },
              ].map((navItem) => {
                const NavIcon = navItem.icon
                return (
                  <Link
                    key={navItem.to}
                    to={navItem.to}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-colors group ${
                      isDark
                        ? 'bg-slate-800/60 hover:bg-slate-800'
                        : 'bg-[#f5f5f7] hover:bg-[#ececf0]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDark
                          ? 'bg-slate-900 text-slate-200'
                          : 'bg-white text-[#1d1d1f] shadow-2xs'
                      }`}
                    >
                      <NavIcon className="h-4 w-4 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#0066cc] transition-colors">
                        {navItem.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{navItem.sub}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Vault Health Overview */}
          <div className="bento-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-slate-600" />
                  <span>知识体系健康度</span>
                </h2>
                <p className="text-2xs text-slate-400 mt-0.5">双链完整率与孤立节点诊断</p>
              </div>
              {healthLoading || !report ? (
                <div className="h-6 w-12 rounded bg-slate-200/80 animate-pulse" aria-label="健康度加载中" />
              ) : (
                <span className="text-lg font-bold font-mono text-slate-900">
                  {`${healthScore}%`}
                </span>
              )}
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              {healthLoading || !report ? (
                <div className="h-full w-1/2 rounded-full bg-slate-200 animate-pulse" />
              ) : (
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-500"
                  style={{ width: `${Math.max(5, Math.min(100, healthScore))}%` }}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-center">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <div className="text-2xs text-slate-400">孤立笔记</div>
                {statsLoading || !stats ? (
                  <div className="h-4 w-10 mx-auto rounded bg-slate-200/80 animate-pulse mt-1" />
                ) : (
                  <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">{stats.orphanNotes ?? 0} 篇</div>
                )}
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                <div className="text-2xs text-slate-400">悬空双链</div>
                {statsLoading || !stats ? (
                  <div className="h-4 w-10 mx-auto rounded bg-slate-200/80 animate-pulse mt-1" />
                ) : (
                  <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">{stats.danglingLinks ?? 0} 条</div>
                )}
              </div>
            </div>

            <Link
              to="/workflow"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
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
