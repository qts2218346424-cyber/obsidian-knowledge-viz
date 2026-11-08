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
} from 'lucide-react'
import { getExamCountdownDays, EXAM_TARGET_LABEL } from '../../utils/examDate'

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
  const countdownDays = getExamCountdownDays()

  // 问候语
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了，注意劳逸结合 🌙'
    if (hour < 11) return '早安，开启今日高效冲刺 🌅'
    if (hour < 14) return '午安，复盘上午核心考点 ☀️'
    if (hour < 18) return '下午好，攻克高频真题 ☕'
    return '晚上好，梳理错题与今日总结 🌌'
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
    <div className="space-y-4 pb-20 animate-fade-in">
      {/* ── 1. 考研倒计时沉浸看板 (Mobile Hero Card) ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#1a2035] to-[#0f172a] text-white p-5 shadow-xl border border-white/10">
        {/* 背景金辉光晕 */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* 顶栏：问候 + 积分胶囊 */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                {greeting}
              </p>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5 truncate">
                {user?.displayName || user?.username || '考研上岸人'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenCheckin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{points.toFixed(1)} 积分</span>
            </button>
          </div>

          {/* 倒计时大号数字条 */}
          <div className="p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{EXAM_TARGET_LABEL}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">2026年12月19日 政治开考</p>
            </div>
            <div className="flex items-baseline gap-1 text-right">
              <span className="text-[11px] text-amber-300 font-bold">倒计时</span>
              <span className="text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                {countdownDays}
              </span>
              <span className="text-sm font-bold text-amber-300">天</span>
            </div>
          </div>

          {/* 每日冲刺进度条 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">今日真题冲刺进度</span>
              <span className="font-mono font-bold text-amber-300">{doneCount} / {dailyGoal} 题 ({progressPct}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. 考研四科大金刚区 (Mobile 4-Core Matrix) ── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <span className="text-base">🚀</span>
            <span>四核备考作战专区</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">共 {totalQuestions} 道实战真题</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 408 计算机专区 */}
          <Link
            to="/quiz?domain=cs_408"
            className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base shadow-2xs">
                💻
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">408 统考</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">数构·计组·OS·网络</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{csQuestionsCount} 题</span>
              <span className="text-slate-400 font-semibold group-hover:translate-x-0.5 transition-transform">刷题 →</span>
            </div>
          </Link>

          {/* 考研数学专区 */}
          <Link
            to="/quiz?domain=math"
            className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base shadow-2xs">
                📐
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">考研数学</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">高数·线代·概率论</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">KaTeX 公式推导</span>
              <span className="text-slate-400 font-semibold group-hover:translate-x-0.5 transition-transform">演练 →</span>
            </div>
          </Link>

          {/* 考研政治专区 */}
          <Link
            to="/politics"
            className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-base shadow-2xs">
                🏛️
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">考研政治</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">史纲时空轴·1000题</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">肖秀荣精选题</span>
              <span className="text-slate-400 font-semibold group-hover:translate-x-0.5 transition-transform">背诵 →</span>
            </div>
          </Link>

          {/* 考研英语专区 */}
          <Link
            to="/english"
            className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md active:scale-98 transition-all flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-base shadow-2xs">
                📖
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">考研英语</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">作文模板·AI批改</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">英语一/二双轨</span>
              <span className="text-slate-400 font-semibold group-hover:translate-x-0.5 transition-transform">精练 →</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 3. 今日推荐极速行动流 (Quick Action Flow) ── */}
      <section className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-orange animate-pulse" />
            <span className="text-xs font-black text-slate-900">今日极速突破推荐</span>
          </div>
          <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">每日精练</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          根据考研大纲高频考点，智能抽取 10 道 408 核心真题与数学解析，随时随地开启 15 分钟高能速测。
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => navigate('/quiz?mode=practice&count=10')}
            className="flex-1 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>抽 10 题开始速测</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/politics')}
            className="px-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            刷政治
          </button>
        </div>
      </section>

      {/* ── 4. 移动端快捷工具金刚区 (Mobile Tool Pills) ── */}
      <section className="space-y-2">
        <div className="text-xs font-extrabold text-slate-700 px-1">研学辅助工具箱</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            type="button"
            onClick={onOpenQuickNote}
            className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
              ✍️
            </div>
            <span className="text-[11px] font-bold text-slate-800">随手速记</span>
          </button>

          <Link
            to="/pomodoro"
            className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all flex flex-col items-center gap-1.5"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-bold">
              🍅
            </div>
            <span className="text-[11px] font-bold text-slate-800">番茄专注</span>
          </Link>

          <Link
            to="/music"
            className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all flex flex-col items-center gap-1.5"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
              🎵
            </div>
            <span className="text-[11px] font-bold text-slate-800">白噪音</span>
          </Link>

          <Link
            to="/graph"
            className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all flex flex-col items-center gap-1.5"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
              🕸️
            </div>
            <span className="text-[11px] font-bold text-slate-800">考研图谱</span>
          </Link>
        </div>
      </section>

      {/* ── 5. AI 伴学导师直通卡 ── */}
      <section className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
            🤖
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">考研 AI 伴学导师</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">多智能体分步推导 · 单次仅 0.1 积分</p>
          </div>
        </div>
        <Link
          to="/chat"
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          立即提问
        </Link>
      </section>
    </div>
  )
}
