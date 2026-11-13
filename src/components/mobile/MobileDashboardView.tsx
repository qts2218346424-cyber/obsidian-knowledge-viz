import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DangoAvatar from '../DangoAvatar'
import {
  Flame,
  ArrowRight,
  ClipboardList,
  Landmark,
  BookOpen,
  GraduationCap,
  Sparkles,
  Compass,
  FileEdit,
  Timer,
  Music,
  Coins,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  BookmarkCheck,
  CheckCircle2,
  Calendar,
  Network,
  Activity,
  ShieldAlert,
  Palette,
  Moon,
  Leaf,
  Target,
  Cpu,
  Sigma,
  Bot,
  Settings,
} from 'lucide-react'
import { useExamCountdown } from '../../utils/examDate'
import { useThemeStyle } from '../../hooks/useThemeStyle'

interface MobileDashboardViewProps {
  stats: { totalNotes: number; totalLinks: number; totalWords: number } | null
  statsLoading: boolean
  healthScore: number
  totalQuestions: number
  csQuestionsCount: number
  mathQuestionsCount: number
  politicsQuestionsCount: number
  user: any
  points: number
  onOpenCheckin: () => void
  onOpenQuickNote: () => void
}

export default function MobileDashboardView({
  stats,
  statsLoading,
  healthScore,
  totalQuestions,
  csQuestionsCount,
  mathQuestionsCount,
  politicsQuestionsCount,
  user,
  points,
  onOpenCheckin,
  onOpenQuickNote,
}: MobileDashboardViewProps) {
  const navigate = useNavigate()
  const countdown = useExamCountdown()
  const countdownDays = countdown.days
  const { themeStyle, isVibrant, isMinimal, isEyecare, isDark, currentThemeMeta, toggleThemeStyle } = useThemeStyle()

  // 问候语
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了，注意劳逸结合'
    if (hour < 11) return '早安，开启今日高效复盘'
    if (hour < 14) return '午安，攻克核心考点'
    if (hour < 18) return '下午好，专注高频真题'
    return '晚上好，梳理错题与今日收获'
  }, [])

  // ── 🎨 全局风格沉浸式样式映射体系 (Theme Style Palette Mapping) ──
  const themePalette = useMemo(() => {
    if (isEyecare) {
      return {
        // 倒计时核心看板 (温润高定竹韵墨绿)
        countdownCard: 'bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#1e4634] text-white border-emerald-600/40 shadow-emerald-950/15',
        greetingDot: 'bg-emerald-300',
        greetingText: 'text-emerald-200',
        countdownBox: 'bg-white/10 border-white/15',
        calendarIcon: 'text-emerald-300',
        countdownNum: 'text-emerald-300',
        countdownUnit: 'text-emerald-200',
        progressText: 'text-emerald-200 font-bold',
        progressBar: 'bg-gradient-to-r from-emerald-300 to-teal-300',

        // 核心统考专区标题
        targetIcon: 'text-emerald-700',
        sectionTitle: 'text-[#243329]',

        // 四门统考卡片 (温润草木纸质风)
        csCard: 'bg-[#fafbf8] border-[#e2e9df] hover:border-emerald-300 shadow-emerald-900/5',
        csIconBox: 'bg-emerald-100/70 text-emerald-800 border border-emerald-200/60',
        csBadge: 'text-emerald-800 bg-emerald-100/70',
        csActionText: 'text-emerald-800',

        mathCard: 'bg-[#fafbf8] border-[#e2e9df] hover:border-teal-300 shadow-teal-900/5',
        mathIconBox: 'bg-teal-100/70 text-teal-800 border border-teal-200/60',
        mathBadge: 'text-teal-800 bg-teal-100/70',
        mathActionText: 'text-teal-800',

        politicsCard: 'bg-[#fafbf8] border-[#e2e9df] hover:border-lime-300 shadow-lime-900/5',
        politicsIconBox: 'bg-lime-100/70 text-emerald-900 border border-lime-200/60',
        politicsBadge: 'text-emerald-900 bg-lime-100/70',
        politicsActionText: 'text-emerald-800',

        englishCard: 'bg-[#fafbf8] border-[#e2e9df] hover:border-green-300 shadow-green-900/5',
        englishIconBox: 'bg-green-100/70 text-green-800 border border-green-200/60',
        englishBadge: 'text-green-800 bg-green-100/70',
        englishActionText: 'text-green-800',

        cardTitle: 'text-[#243329]',
        cardDesc: 'text-[#6e8274]',
        cardBorderTop: 'border-[#e2e9df]',

        // AI 伴学舱
        aiCabin: 'bg-gradient-to-r from-[#18392b] via-[#24523e] to-[#1b4332] text-white border-emerald-600/40 shadow-emerald-950/15',
        aiIconBox: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-900/20',
        aiBadge: 'bg-emerald-300 text-emerald-950 font-black',
        aiButton: 'bg-gradient-to-r from-emerald-300 to-teal-200 text-emerald-950 shadow-emerald-900/20',

        // 今日提分直通卡
        quickCard: 'bg-gradient-to-r from-emerald-50/80 via-teal-50/70 to-green-50/80 border-emerald-200/80',
        quickDot: 'bg-emerald-600',
        quickTitle: 'text-emerald-950',
        quickBadge: 'text-emerald-800 bg-emerald-100/90',
        quickDesc: 'text-[#4a5d50]',
        quickBtnPrimary: 'bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-900/10',
        quickBtnSecondary: 'bg-[#fafbf8] border-emerald-200/90 text-emerald-900 hover:bg-emerald-50',

        // 常用工具
        toolsTitle: 'text-[#243329]',
        toolsSettings: 'text-emerald-700 hover:text-emerald-800',
        toolCard: 'bg-[#fafbf8] border-[#e2e9df] hover:bg-emerald-50/30',
        toolTitle: 'text-[#243329]',
        toolDesc: 'text-[#6e8274]',
        toolIcons: {
          error: 'bg-emerald-100/70 text-emerald-800',
          graph: 'bg-teal-100/70 text-teal-800',
          study: 'bg-green-100/70 text-green-800',
          note: 'bg-lime-100/70 text-emerald-900',
          pomodoro: 'bg-emerald-100/70 text-emerald-800',
          noise: 'bg-teal-100/70 text-teal-800',
        },
      }
    }

    if (isMinimal) {
      return {
        countdownCard: 'bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-900 text-white border-zinc-700/60 shadow-xs',
        greetingDot: 'bg-zinc-400',
        greetingText: 'text-zinc-300',
        countdownBox: 'bg-white/10 border-white/15',
        calendarIcon: 'text-zinc-300',
        countdownNum: 'text-white',
        countdownUnit: 'text-zinc-300',
        progressText: 'text-zinc-200 font-bold',
        progressBar: 'bg-gradient-to-r from-zinc-200 to-neutral-400',

        targetIcon: 'text-zinc-700',
        sectionTitle: 'text-zinc-900',

        csCard: 'bg-white border-zinc-200 hover:border-zinc-300',
        csIconBox: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
        csBadge: 'text-zinc-700 bg-zinc-100',
        csActionText: 'text-zinc-800 hover:text-black',

        mathCard: 'bg-white border-zinc-200 hover:border-zinc-300',
        mathIconBox: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
        mathBadge: 'text-zinc-700 bg-zinc-100',
        mathActionText: 'text-zinc-800 hover:text-black',

        politicsCard: 'bg-white border-zinc-200 hover:border-zinc-300',
        politicsIconBox: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
        politicsBadge: 'text-zinc-700 bg-zinc-100',
        politicsActionText: 'text-zinc-800 hover:text-black',

        englishCard: 'bg-white border-zinc-200 hover:border-zinc-300',
        englishIconBox: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
        englishBadge: 'text-zinc-700 bg-zinc-100',
        englishActionText: 'text-zinc-800 hover:text-black',

        cardTitle: 'text-zinc-900',
        cardDesc: 'text-zinc-500',
        cardBorderTop: 'border-zinc-100',

        aiCabin: 'bg-zinc-900 text-white border-zinc-700/60 shadow-xs',
        aiIconBox: 'bg-zinc-800 text-zinc-100 border border-zinc-700',
        aiBadge: 'bg-zinc-200 text-zinc-900 font-black',
        aiButton: 'bg-white text-zinc-950 hover:bg-zinc-100',

        quickCard: 'bg-zinc-50/90 border-zinc-200',
        quickDot: 'bg-zinc-700',
        quickTitle: 'text-zinc-900',
        quickBadge: 'text-zinc-700 bg-zinc-200',
        quickDesc: 'text-zinc-600',
        quickBtnPrimary: 'bg-zinc-900 text-white hover:bg-black',
        quickBtnSecondary: 'bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50',

        toolsTitle: 'text-zinc-900',
        toolsSettings: 'text-zinc-700 hover:text-zinc-900',
        toolCard: 'bg-white border-zinc-200 hover:bg-zinc-50',
        toolTitle: 'text-zinc-900',
        toolDesc: 'text-zinc-500',
        toolIcons: {
          error: 'bg-zinc-100 text-zinc-800',
          graph: 'bg-zinc-100 text-zinc-800',
          study: 'bg-zinc-100 text-zinc-800',
          note: 'bg-zinc-100 text-zinc-800',
          pomodoro: 'bg-zinc-100 text-zinc-800',
          noise: 'bg-zinc-100 text-zinc-800',
        },
      }
    }

    if (isDark) {
      return {
        countdownCard: 'bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#0f172a] text-white border-sky-900/40 shadow-xs',
        greetingDot: 'bg-sky-400',
        greetingText: 'text-sky-300',
        countdownBox: 'bg-white/[0.06] border-white/10',
        calendarIcon: 'text-sky-400',
        countdownNum: 'text-sky-300',
        countdownUnit: 'text-sky-300',
        progressText: 'text-sky-300 font-bold',
        progressBar: 'bg-gradient-to-r from-sky-400 to-cyan-400',

        targetIcon: 'text-sky-400',
        sectionTitle: 'text-slate-100',

        csCard: 'bg-[#131926] border-slate-800/90 hover:border-sky-500/40',
        csIconBox: 'bg-sky-950/70 text-sky-400 border border-sky-800/50',
        csBadge: 'text-sky-300 bg-sky-950/70 border border-sky-800/40',
        csActionText: 'text-sky-400',

        mathCard: 'bg-[#131926] border-slate-800/90 hover:border-amber-500/40',
        mathIconBox: 'bg-amber-950/70 text-amber-400 border border-amber-800/50',
        mathBadge: 'text-amber-300 bg-amber-950/70 border border-amber-800/40',
        mathActionText: 'text-amber-400',

        politicsCard: 'bg-[#131926] border-slate-800/90 hover:border-rose-500/40',
        politicsIconBox: 'bg-rose-950/70 text-rose-400 border border-rose-800/50',
        politicsBadge: 'text-rose-300 bg-rose-950/70 border border-rose-800/40',
        politicsActionText: 'text-rose-400',

        englishCard: 'bg-[#131926] border-slate-800/90 hover:border-teal-500/40',
        englishIconBox: 'bg-teal-950/70 text-teal-400 border border-teal-800/50',
        englishBadge: 'text-teal-300 bg-teal-950/70 border border-teal-800/40',
        englishActionText: 'text-teal-400',

        cardTitle: 'text-slate-100',
        cardDesc: 'text-slate-400',
        cardBorderTop: 'border-slate-800',

        aiCabin: 'bg-gradient-to-r from-[#0d131f] via-[#131d31] to-[#0f172a] text-white border-sky-800/40 shadow-xs',
        aiIconBox: 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-sky-900/30',
        aiBadge: 'bg-sky-400 text-slate-950 font-black',
        aiButton: 'bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 font-black',

        quickCard: 'bg-[#131926] border-slate-800 text-slate-200',
        quickDot: 'bg-sky-400',
        quickTitle: 'text-slate-100',
        quickBadge: 'text-sky-300 bg-sky-950/80 border border-sky-800/40',
        quickDesc: 'text-slate-300',
        quickBtnPrimary: 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500',
        quickBtnSecondary: 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-800',

        toolsTitle: 'text-slate-100',
        toolsSettings: 'text-sky-400 hover:text-sky-300',
        toolCard: 'bg-[#131926] border-slate-800/90 hover:bg-[#1a2234]',
        toolTitle: 'text-slate-100',
        toolDesc: 'text-slate-400',
        toolIcons: {
          error: 'bg-rose-950/60 text-rose-400',
          graph: 'bg-indigo-950/60 text-indigo-400',
          study: 'bg-blue-950/60 text-blue-400',
          note: 'bg-amber-950/60 text-amber-400',
          pomodoro: 'bg-red-950/60 text-red-400',
          noise: 'bg-teal-950/60 text-teal-400',
        },
      }
    }

    // 默认鲜艳风 (vibrant)
    return {
      countdownCard: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-900/40 shadow-xs',
      greetingDot: 'bg-amber-400',
      greetingText: 'text-amber-300',
      countdownBox: 'bg-white/[0.07] border-white/10',
      calendarIcon: 'text-amber-400',
      countdownNum: 'text-amber-300',
      countdownUnit: 'text-amber-300',
      progressText: 'text-amber-300 font-bold',
      progressBar: 'bg-gradient-to-r from-amber-400 to-amber-500',

      targetIcon: 'text-rose-500',
      sectionTitle: 'text-slate-900',

      csCard: 'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 border-blue-200/90 shadow-blue-500/10',
      csIconBox: 'bg-blue-50 text-blue-600',
      csBadge: 'text-blue-700 bg-blue-50',
      csActionText: 'text-blue-600',

      mathCard: 'bg-gradient-to-br from-purple-50/90 via-white to-violet-50/60 border-purple-200/90 shadow-purple-500/10',
      mathIconBox: 'bg-amber-50 text-amber-600',
      mathBadge: 'text-amber-800 bg-amber-50',
      mathActionText: 'text-amber-700',

      politicsCard: 'bg-gradient-to-br from-rose-50/90 via-white to-amber-50/60 border-rose-200/90 shadow-rose-500/10',
      politicsIconBox: 'bg-rose-50 text-rose-600',
      politicsBadge: 'text-rose-700 bg-rose-50',
      politicsActionText: 'text-rose-600',

      englishCard: 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border-emerald-200/90 shadow-emerald-500/10',
      englishIconBox: 'bg-purple-50 text-purple-600',
      englishBadge: 'text-purple-700 bg-purple-50',
      englishActionText: 'text-purple-600',

      cardTitle: 'text-slate-900',
      cardDesc: 'text-slate-500',
      cardBorderTop: 'border-slate-100',

      aiCabin: 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white border-indigo-500/30 shadow-xs',
      aiIconBox: 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-2xs',
      aiBadge: 'bg-amber-400 text-slate-950 font-black',
      aiButton: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black',

      quickCard: 'bg-gradient-to-r from-rose-50 via-amber-50 to-indigo-50 border-rose-200/80',
      quickDot: 'bg-rose-500',
      quickTitle: 'text-slate-900',
      quickBadge: 'text-rose-700 bg-rose-100',
      quickDesc: 'text-slate-600',
      quickBtnPrimary: 'bg-gradient-to-r from-rose-600 to-amber-600 text-white hover:from-rose-500 hover:to-amber-500',
      quickBtnSecondary: 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50',

      toolsTitle: 'text-slate-700',
      toolsSettings: 'text-indigo-600 hover:underline',
      toolCard: 'bg-white border-slate-200/80 hover:bg-slate-50',
      toolTitle: 'text-slate-800',
      toolDesc: 'text-slate-400',
      toolIcons: {
        error: 'bg-rose-50 text-rose-600',
        graph: 'bg-indigo-50 text-indigo-600',
        study: 'bg-blue-50 text-blue-600',
        note: 'bg-amber-50 text-amber-600',
        pomodoro: 'bg-red-50 text-red-500',
        noise: 'bg-teal-50 text-teal-600',
      },
    }
  }, [isEyecare, isMinimal, isDark])

  // 今日目标自测完成进度（保存在本地）
  const [dailyGoal] = useState(20)
  const [doneCount] = useState(() => {
    try {
      const answers = localStorage.getItem('coreforge_quiz_answers')
      return answers ? Object.keys(JSON.parse(answers)).length : 6
    } catch {
      return 6
    }
  })
  const progressPct = Math.min(100, Math.round((doneCount / dailyGoal) * 100))

  return (
    <div className="space-y-2.5 pb-16 w-full min-w-0 font-sans">
      {/* ── 1. 考研倒计时核心看板 (多风格沉浸式高定卡片) ── */}
      <section className={`relative overflow-hidden rounded-xl sm:rounded-2xl text-white p-3.5 sm:p-5 shadow-xs border transition-all duration-300 ${themePalette.countdownCard}`}>
        <div className="space-y-3">
          {/* 顶栏：问候 + 视觉风格切换按钮 */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <DangoAvatar seed={user?.username || user?.displayName} size="lg" className="shadow-sm" />
              <div className="min-w-0">
                <span className={`text-2xs font-bold flex items-center gap-1.5 ${themePalette.greetingText}`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${themePalette.greetingDot}`} />
                  {greeting}
                </span>
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white mt-0.5 truncate">
                  {user?.displayName || user?.username || '考研上岸人'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleThemeStyle}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/90 border border-sky-400/50 text-sky-300'
                    : isEyecare
                    ? 'bg-emerald-950/60 border border-emerald-400/50 text-emerald-200'
                    : isVibrant
                    ? 'bg-gradient-to-r from-pink-500/25 via-purple-500/25 to-indigo-500/25 border border-indigo-400/50 text-indigo-200'
                    : 'bg-white/10 hover:bg-white/15 border border-white/20 text-slate-300'
                }`}
                title={`当前为${currentThemeMeta.name}，点击切换视觉风格`}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-sky-300" />
                ) : isEyecare ? (
                  <Leaf className="w-3.5 h-3.5 text-emerald-300" />
                ) : isVibrant ? (
                  <Palette className="w-3.5 h-3.5 text-pink-400" />
                ) : (
                  <Palette className="w-3.5 h-3.5 text-slate-300" />
                )}
                <span>{currentThemeMeta.shortName}</span>
              </button>
            </div>
          </div>

          {/* 倒计时主展示区 */}
          <div className={`p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border flex items-center justify-between gap-2.5 transition-colors ${themePalette.countdownBox}`}>
            <div>
              <div className="text-2xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                <Calendar className={`w-3 h-3 ${themePalette.calendarIcon}`} />
                <span>{countdown.targetLabel}</span>
              </div>
              <p className="text-2xs text-slate-300/80 mt-0.5 font-medium">{countdown.displayDate} 政治统考开考</p>
            </div>
            <div className="flex items-baseline gap-1 text-right">
              <span className={`text-2xs font-bold ${themePalette.countdownUnit}`}>倒计时</span>
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${themePalette.countdownNum}`}>
                {countdownDays}
              </span>
              <span className={`text-xs font-bold ${themePalette.countdownUnit}`}>天</span>
            </div>
          </div>

          {/* 每日真题冲刺进度条 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-2xs">
              <span className="text-slate-200/90 font-medium">今日真题自测进度</span>
              <span className={`font-mono ${themePalette.progressText}`}>{doneCount} / {dailyGoal} 题 ({progressPct}%)</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${themePalette.progressBar}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. 四核备考专区 (2x2 紧凑原生感卡片，全主题自适应) ── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className={`text-xs font-black flex items-center gap-1.5 ${themePalette.sectionTitle}`}>
            <Target className={`w-3.5 h-3.5 shrink-0 ${themePalette.targetIcon}`} />
            <span>核心统考专区</span>
          </div>
          <span className="text-2xs text-slate-400 dark:text-slate-500 font-mono">题池储备 {totalQuestions} 道</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* 408 计算机专区 */}
          <Link
            to="/quiz?domain=cs_408"
            className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between ${themePalette.csCard}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${themePalette.csIconBox}`}>
                  <Cpu className="w-4 h-4" />
                </span>
                <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-md font-mono ${themePalette.csBadge}`}>
                  {csQuestionsCount} 题
                </span>
              </div>
              <h3 className={`text-xs font-bold ${themePalette.cardTitle}`}>408 统考</h3>
              <p className={`text-2xs mt-0.5 truncate ${themePalette.cardDesc}`}>数构·计组·OS·网络</p>
            </div>
            <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-2xs font-semibold ${themePalette.cardBorderTop} ${themePalette.csActionText}`}>
              <span>刷 408 真题</span>
              <span className="font-mono">→</span>
            </div>
          </Link>

          {/* 考研数学专区 */}
          <Link
            to="/quiz?domain=math"
            className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between ${themePalette.mathCard}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${themePalette.mathIconBox}`}>
                  <Sigma className="w-4 h-4" />
                </span>
                <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-md ${themePalette.mathBadge}`}>
                  KaTeX公式
                </span>
              </div>
              <h3 className={`text-xs font-bold ${themePalette.cardTitle}`}>考研数学</h3>
              <p className={`text-2xs mt-0.5 truncate ${themePalette.cardDesc}`}>高数·线代·概率论</p>
            </div>
            <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-2xs font-semibold ${themePalette.cardBorderTop} ${themePalette.mathActionText}`}>
              <span>公式推导演练</span>
              <span className="font-mono">→</span>
            </div>
          </Link>

          {/* 考研政治专区 */}
          <Link
            to="/politics"
            className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between ${themePalette.politicsCard}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${themePalette.politicsIconBox}`}>
                  <Landmark className="w-4 h-4" />
                </span>
                <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-md ${themePalette.politicsBadge}`}>
                  时空编年
                </span>
              </div>
              <h3 className={`text-xs font-bold ${themePalette.cardTitle}`}>考研政治</h3>
              <p className={`text-2xs mt-0.5 truncate ${themePalette.cardDesc}`}>史纲时空轴·1000题</p>
            </div>
            <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-2xs font-semibold ${themePalette.cardBorderTop} ${themePalette.politicsActionText}`}>
              <span>速记与背诵</span>
              <span className="font-mono">→</span>
            </div>
          </Link>

          {/* 考研英语专区 */}
          <Link
            to="/english"
            className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between ${themePalette.englishCard}`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${themePalette.englishIconBox}`}>
                  <BookOpen className="w-4 h-4" />
                </span>
                <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-md ${themePalette.englishBadge}`}>
                  AI 批改
                </span>
              </div>
              <h3 className={`text-xs font-bold ${themePalette.cardTitle}`}>考研英语</h3>
              <p className={`text-2xs mt-0.5 truncate ${themePalette.cardDesc}`}>写作模板·真题研读</p>
            </div>
            <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-2xs font-semibold ${themePalette.cardBorderTop} ${themePalette.englishActionText}`}>
              <span>作文批改舱</span>
              <span className="font-mono">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 2.5 AI 伴学工作舱 (全主题自适应吸睛直达) ── */}
      <section className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border flex items-center justify-between gap-2 transition-all duration-300 ${themePalette.aiCabin}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${themePalette.aiIconBox}`}>
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white truncate">AI 伴学</h4>
              <span className={`px-1.5 py-0.2 rounded-full text-2xs font-black shrink-0 ${themePalette.aiBadge}`}>
                在线伴读
              </span>
            </div>
            <p className="text-2xs text-slate-200/90 mt-0.5 truncate">多智能体答疑 · 严谨推导数学与408错因</p>
          </div>
        </div>
        <Link
          to="/chat"
          className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer ${themePalette.aiButton}`}
        >
          立即伴学 →
        </Link>
      </section>

      {/* ── 3. 今日提分直通卡 (全主题考点掌握度热力图 & 10题速测) ── */}
      <section className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border space-y-2 transition-all duration-300 ${themePalette.quickCard}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full animate-pulse ${themePalette.quickDot}`} />
            <span className={`text-xs font-bold ${themePalette.quickTitle}`}>考点急救与提分直通</span>
          </div>
          <span className={`text-2xs font-bold px-2 py-0.5 rounded-full ${themePalette.quickBadge}`}>
            热力导航
          </span>
        </div>

        <p className={`text-2xs leading-relaxed ${themePalette.quickDesc}`}>
          红点呼吸闪烁代表高频失分薄弱点（做对率&lt;50%）。点击直通仿真课件单步推演与 3 道真题急救特训。
        </p>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => navigate('/graph')}
            className={`flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-2xs sm:text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer ${themePalette.quickBtnPrimary}`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>查阅掌握度热力图</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/quiz?mode=practice&count=10')}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-2xs sm:text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs whitespace-nowrap ${themePalette.quickBtnSecondary}`}
          >
            抽 10 题速练
          </button>
        </div>
      </section>

      {/* ── 4. 常用工具矩阵 (全主题自适应图标与文字) ── */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <div className={`text-xs font-extrabold ${themePalette.toolsTitle}`}>常用功能入口</div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className={`inline-flex items-center gap-1 text-2xs font-bold cursor-pointer transition-colors ${themePalette.toolsSettings}`}
          >
            <Settings className="w-3 h-3" />
            <span>系统设置</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* 错题本直达 */}
          <Link
            to="/quiz?tab=errors"
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-xs active:scale-95 transition-all flex items-center gap-2 text-left ${themePalette.toolCard}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${themePalette.toolIcons.error}`}>
              <Flame className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className={`text-2xs sm:text-xs font-bold ${themePalette.toolTitle}`}>错题本</div>
              <div className={`text-2xs truncate ${themePalette.toolDesc}`}>艾宾浩斯·组卷重练</div>
            </div>
          </Link>

          {/* 知识图谱 */}
          <Link
            to="/graph"
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-xs active:scale-95 transition-all flex items-center gap-2 text-left ${themePalette.toolCard}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${themePalette.toolIcons.graph}`}>
              <Network className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className={`text-2xs sm:text-xs font-bold ${themePalette.toolTitle}`}>知识图谱</div>
              <div className={`text-2xs truncate ${themePalette.toolDesc}`}>全库双链网络拓扑</div>
            </div>
          </Link>

          {/* 研学中心 */}
          <Link
            to="/study"
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-xs active:scale-95 transition-all flex items-center gap-2 text-left ${themePalette.toolCard}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${themePalette.toolIcons.study}`}>
              <GraduationCap className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className={`text-2xs sm:text-xs font-bold ${themePalette.toolTitle}`}>研学中心</div>
              <div className={`text-2xs truncate ${themePalette.toolDesc}`}>大纲讲义与课件</div>
            </div>
          </Link>

          {/* 随手记 */}
          <button
            type="button"
            onClick={onOpenQuickNote}
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-xs active:scale-95 transition-all flex items-center gap-2 cursor-pointer text-left ${themePalette.toolCard}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${themePalette.toolIcons.note}`}>
              <FileEdit className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className={`text-2xs sm:text-xs font-bold ${themePalette.toolTitle}`}>随手记</div>
              <div className={`text-2xs truncate ${themePalette.toolDesc}`}>双链考点备忘</div>
            </div>
          </button>

          {/* 番茄专注 */}
          <Link
            to="/pomodoro"
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-xs active:scale-95 transition-all flex items-center gap-2 text-left ${themePalette.toolCard}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${themePalette.toolIcons.pomodoro}`}>
              <Timer className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className={`text-2xs sm:text-xs font-bold ${themePalette.toolTitle}`}>番茄专注</div>
              <div className={`text-2xs truncate ${themePalette.toolDesc}`}>深度沉浸学习</div>
            </div>
          </Link>

          {/* 白噪音 */}
          <Link
            to="/music"
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-xs active:scale-95 transition-all flex items-center gap-2 text-left ${themePalette.toolCard}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${themePalette.toolIcons.noise}`}>
              <Music className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className={`text-2xs sm:text-xs font-bold ${themePalette.toolTitle}`}>白噪音</div>
              <div className={`text-2xs truncate ${themePalette.toolDesc}`}>自习室与雨声</div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
