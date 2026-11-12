import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
      {/* ── 1. 考研倒计时核心看板 (Apple iOS 18 优雅深空高定卡片) ── */}
      <section className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 sm:p-5 shadow-xs border border-indigo-900/40">
        <div className="space-y-3">
          {/* 顶栏：问候 + 积分与打卡 */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-2xs text-amber-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {greeting}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white mt-0.5 truncate">
                {user?.displayName || user?.username || '考研上岸人'}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleThemeStyle}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-900/90 border border-sky-400/50 text-sky-300'
                    : isEyecare
                    ? 'bg-emerald-900/40 border border-emerald-400/50 text-emerald-200'
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
          <div className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-between gap-2.5">
            <div>
              <div className="text-2xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>{countdown.targetLabel}</span>
              </div>
              <p className="text-2xs text-slate-400 mt-0.5 font-medium">{countdown.displayDate} 政治统考开考</p>
            </div>
            <div className="flex items-baseline gap-1 text-right">
              <span className="text-2xs text-amber-300 font-bold">倒计时</span>
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-300">
                {countdownDays}
              </span>
              <span className="text-xs font-bold text-amber-300">天</span>
            </div>
          </div>

          {/* 每日真题冲刺进度条 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-2xs">
              <span className="text-slate-300 font-medium">今日真题自测进度</span>
              <span className="font-mono font-bold text-amber-300">{doneCount} / {dailyGoal} 题 ({progressPct}%)</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. 四核备考专区 (2x2 紧凑原生感卡片，彻底消除拥挤截断) ── */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>核心统考专区</span>
          </div>
          <span className="text-2xs text-slate-500 font-mono">题池储备 {totalQuestions} 道</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* 408 计算机专区 */}
          <Link
            to="/quiz?domain=cs_408"
            className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between ${
              isVibrant
                ? 'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/60 border-blue-200/90 shadow-blue-500/10'
                : 'bg-white border-slate-200/90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" />
                </span>
                <span className="text-2xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md font-mono">
                  {csQuestionsCount} 题
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">408 统考</h3>
              <p className="text-2xs text-slate-500 mt-0.5 truncate">数构·计组·OS·网络</p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-blue-600 font-semibold">
              <span>刷 408 真题</span>
              <span className="font-mono">→</span>
            </div>
          </Link>

          {/* 考研数学专区 */}
          <Link
            to="/quiz?domain=math"
            className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between ${
              isVibrant
                ? 'bg-gradient-to-br from-purple-50/90 via-white to-violet-50/60 border-purple-200/90 shadow-purple-500/10'
                : 'bg-white border-slate-200/90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Sigma className="w-4 h-4" />
                </span>
                <span className="text-2xs font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md">
                  KaTeX公式
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">考研数学</h3>
              <p className="text-2xs text-slate-500 mt-0.5 truncate">高数·线代·概率论</p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-amber-700 font-semibold">
              <span>公式推导演练</span>
              <span className="font-mono">→</span>
            </div>
          </Link>

          {/* 考研政治专区 */}
          <Link
            to="/politics"
            className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between ${
              isVibrant
                ? 'bg-gradient-to-br from-rose-50/90 via-white to-amber-50/60 border-rose-200/90 shadow-rose-500/10'
                : 'bg-white border-slate-200/90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4" />
                </span>
                <span className="text-2xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-md">
                  时空编年
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">考研政治</h3>
              <p className="text-2xs text-slate-500 mt-0.5 truncate">史纲时空轴·1000题</p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-rose-600 font-semibold">
              <span>速记与背诵</span>
              <span className="font-mono">→</span>
            </div>
          </Link>

          {/* 考研英语专区 */}
          <Link
            to="/english"
            className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between ${
              isVibrant
                ? 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border-emerald-200/90 shadow-emerald-500/10'
                : 'bg-white border-slate-200/90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </span>
                <span className="text-2xs font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md">
                  AI 批改
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">考研英语</h3>
              <p className="text-2xs text-slate-500 mt-0.5 truncate">写作模板·真题研读</p>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-purple-600 font-semibold">
              <span>作文批改舱</span>
              <span className="font-mono">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 2.5 AI 伴学工作舱 (首屏吸睛直达) ── */}
      <section className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white truncate">AI 伴学</h4>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-2xs font-black shrink-0">
                在线伴读
              </span>
            </div>
            <p className="text-2xs text-slate-300 mt-0.5 truncate">多智能体答疑 · 严谨推导数学与408错因</p>
          </div>
        </div>
        <Link
          to="/chat"
          className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[11px] sm:text-xs font-black shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          立即伴学 →
        </Link>
      </section>

      {/* ── 3. 今日提分直通卡 (考点掌握度热力图 & 10题速测) ── */}
      <section className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-indigo-50 border border-rose-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900">考点急救与提分直通</span>
          </div>
          <span className="text-2xs text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded-full">
            热力导航
          </span>
        </div>

        <p className="text-2xs text-slate-600 leading-relaxed">
          红点呼吸闪烁代表高频失分薄弱点（做对率&lt;50%）。点击直通仿真课件单步推演与 3 道真题急救特训。
        </p>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => navigate('/graph')}
            className="flex-1 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-2xs sm:text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>查阅掌握度热力图</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/quiz?mode=practice&count=10')}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-white border border-slate-200 text-slate-800 text-2xs sm:text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            抽 10 题速练
          </button>
        </div>
      </section>

      {/* ── 4. 常用工具矩阵 ── */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="text-xs font-extrabold text-slate-700">常用功能入口</div>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="inline-flex items-center gap-1 text-2xs text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            <Settings className="w-3 h-3" />
            <span>系统设置</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* 错题本直达 */}
          <Link
            to="/quiz?tab=errors"
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 text-left"
          >
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-2xs sm:text-xs font-bold text-slate-800">错题本</div>
              <div className="text-2xs text-slate-400 truncate">艾宾浩斯·组卷重练</div>
            </div>
          </Link>

          {/* 知识图谱 */}
          <Link
            to="/graph"
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 text-left"
          >
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Network className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-2xs sm:text-xs font-bold text-slate-800">知识图谱</div>
              <div className="text-2xs text-slate-400 truncate">全库双链网络拓扑</div>
            </div>
          </Link>

          {/* 研学中心 */}
          <Link
            to="/study"
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 text-left"
          >
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-2xs sm:text-xs font-bold text-slate-800">研学中心</div>
              <div className="text-2xs text-slate-400 truncate">大纲讲义与课件</div>
            </div>
          </Link>

          {/* 随手记 */}
          <button
            type="button"
            onClick={onOpenQuickNote}
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer text-left"
          >
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileEdit className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-2xs sm:text-xs font-bold text-slate-800">随手记</div>
              <div className="text-2xs text-slate-400 truncate">双链考点备忘</div>
            </div>
          </button>

          {/* 番茄专注 */}
          <Link
            to="/pomodoro"
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 text-left"
          >
            <span className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <Timer className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-2xs sm:text-xs font-bold text-slate-800">番茄专注</div>
              <div className="text-2xs text-slate-400 truncate">深度沉浸学习</div>
            </div>
          </Link>

          {/* 白噪音 */}
          <Link
            to="/music"
            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 text-left"
          >
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Music className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-2xs sm:text-xs font-bold text-slate-800">白噪音</div>
              <div className="text-2xs text-slate-400 truncate">自习室与雨声</div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
