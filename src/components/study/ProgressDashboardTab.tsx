import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import {
  Target, Flame, CheckCircle2, AlertTriangle, BookOpen, Brain,
  Layers, ArrowRight, RefreshCw, Loader2, SlidersHorizontal,
  Plus, Trash2, Check, Sparkles, Clock, Award, TrendingUp,
  FileCheck2, XCircle, Compass, GraduationCap,
} from 'lucide-react'
import {
  api,
  type StudyProgressOverview,
  type StudyStage,
  type StudyDailyTask,
  type StudyGoalsConfig,
  type ReviewDueData,
} from '../../services/api'
import { useExamCountdown } from '../../utils/examDate'

type StudyTabKey = 'graph' | 'topology' | 'mastery' | 'flashcards' | 'handouts' | 'pdfs' | 'coursewares' | 'progress'

interface ProgressDashboardTabProps {
  onSwitchTab: (tab: StudyTabKey) => void
}

const STAGE_OPTIONS: Array<{ value: StudyStage; label: string; colorClass: string; barPct: number }> = [
  { value: 'not_started', label: '待启动', colorClass: 'bg-neutral-100 text-neutral-500 border-neutral-200', barPct: 5 },
  { value: 'foundation', label: '一轮基础', colorClass: 'bg-sky-50 text-sky-700 border-sky-200', barPct: 35 },
  { value: 'reinforcement', label: '二轮强化', colorClass: 'bg-amber-50 text-amber-700 border-amber-200', barPct: 65 },
  { value: 'sprint', label: '真题冲刺', colorClass: 'bg-orange-50 text-orange-700 border-orange-200', barPct: 85 },
  { value: 'mock', label: '模考保持', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', barPct: 95 },
]

const DOMAIN_THEME: Record<'cs_408' | 'math' | 'english' | 'politics', {
  badge: string
  accent: string
  bar: string
  primaryBtnLabel: string
  primaryRoute: string
  secondaryBtnLabel: string
  secondaryAction: { type: 'tab' | 'route'; target: string }
}> = {
  cs_408: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    accent: 'text-blue-600',
    bar: 'bg-blue-500',
    primaryBtnLabel: '408 专项练题',
    primaryRoute: '/quiz?domain=cs_408',
    secondaryBtnLabel: '考纲热力图',
    secondaryAction: { type: 'tab', target: 'topology' },
  },
  math: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accent: 'text-indigo-600',
    bar: 'bg-indigo-500',
    primaryBtnLabel: '数学刷题冲刺',
    primaryRoute: '/quiz?domain=math',
    secondaryBtnLabel: '核心讲义',
    secondaryAction: { type: 'tab', target: 'handouts' },
  },
  english: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    accent: 'text-purple-600',
    bar: 'bg-purple-500',
    primaryBtnLabel: '英语作战舱',
    primaryRoute: '/english',
    secondaryBtnLabel: '考研背词',
    secondaryAction: { type: 'route', target: '/vocabulary' },
  },
  politics: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    accent: 'text-rose-600',
    bar: 'bg-rose-500',
    primaryBtnLabel: '史纲时空舱',
    primaryRoute: '/politics',
    secondaryBtnLabel: '政治闪卡',
    secondaryAction: { type: 'tab', target: 'flashcards' },
  },
}

export default function ProgressDashboardTab({ onSwitchTab }: ProgressDashboardTabProps) {
  const navigate = useNavigate()
  const countdown = useExamCountdown()

  const [data, setData] = useState<StudyProgressOverview | null>(null)
  const [vaultReviewStats, setVaultReviewStats] = useState<ReviewDueData['stats']>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // 目标配置弹窗/折叠面板
  const [editingGoals, setEditingGoals] = useState(false)
  const [savingGoals, setSavingGoals] = useState(false)
  const [goalDraft, setGoalDraft] = useState<StudyGoalsConfig | null>(null)

  // 今日自主待办新增
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDomain, setNewTaskDomain] = useState<StudyDailyTask['domain']>('cs_408')
  const [savingTask, setSavingTask] = useState(false)

  const loadOverview = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setErrorMsg(null)

    try {
      const [overviewRes, reviewRes] = await Promise.all([
        api.getStudyProgressOverview(),
        api.getReviewDue().catch(() => ({ reviewQueue: [], stats: [] })),
      ])
      setData(overviewRes)
      setGoalDraft(overviewRes.goals)
      setVaultReviewStats(reviewRes.stats || [])
    } catch (err: any) {
      setErrorMsg(err?.message || '加载研学进度失败，请稍后重试')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadOverview(false)
  }, [loadOverview])

  const executeAction = (targetType: 'tab' | 'route', target: string) => {
    if (targetType === 'tab') {
      onSwitchTab(target as StudyTabKey)
    } else {
      navigate(target)
    }
  }

  const handleSaveGoals = async () => {
    if (!goalDraft) return
    setSavingGoals(true)
    try {
      const res = await api.updateStudyProgressGoals({
        targetSchool: goalDraft.targetSchool,
        targetTotalScore: goalDraft.targetTotalScore,
        weeklyQuestionGoal: goalDraft.weeklyQuestionGoal,
        dailyVocabGoal: goalDraft.dailyVocabGoal,
        subjectGoals: goalDraft.subjectGoals,
      })
      setData(prev => (prev ? { ...prev, goals: res.goals } : prev))
      setGoalDraft(res.goals)
      setEditingGoals(false)
      loadOverview(true)
    } catch (err: any) {
      alert('保存备考目标失败：' + (err?.message || '未知错误'))
    } finally {
      setSavingGoals(false)
    }
  }

  const handleChangeStage = async (
    subjectKey: 'cs_408' | 'math' | 'english' | 'politics',
    stage: StudyStage
  ) => {
    if (!data) return
    const nextSubjectGoals = {
      ...data.goals.subjectGoals,
      [subjectKey]: {
        ...data.goals.subjectGoals[subjectKey],
        stage,
      },
    }
    // 乐观更新
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        goals: { ...prev.goals, subjectGoals: nextSubjectGoals },
        subjects: prev.subjects.map(s => (s.key === subjectKey ? { ...s, stage } : s)),
      }
    })
    try {
      await api.updateStudyProgressGoals({ subjectGoals: nextSubjectGoals })
    } catch {
      loadOverview(true)
    }
  }

  const handleToggleDailyTask = async (taskId: string) => {
    if (!data) return
    const nextTasks = data.goals.dailyTasks.map(t =>
      t.id === taskId ? { ...t, done: !t.done } : t
    )
    setData(prev => (prev ? { ...prev, goals: { ...prev.goals, dailyTasks: nextTasks } } : prev))
    try {
      await api.updateStudyProgressGoals({ dailyTasks: nextTasks })
    } catch {
      loadOverview(true)
    }
  }

  const handleAddDailyTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data || !newTaskTitle.trim() || savingTask) return
    setSavingTask(true)
    const today = data.today || new Date().toISOString().slice(0, 10)
    const nextTasks: StudyDailyTask[] = [
      ...data.goals.dailyTasks,
      {
        id: `task-${Date.now()}`,
        title: newTaskTitle.trim(),
        domain: newTaskDomain,
        done: false,
        date: today,
      },
    ]
    setNewTaskTitle('')
    setData(prev => (prev ? { ...prev, goals: { ...prev.goals, dailyTasks: nextTasks } } : prev))
    try {
      await api.updateStudyProgressGoals({ dailyTasks: nextTasks })
    } finally {
      setSavingTask(false)
    }
  }

  const handleDeleteDailyTask = async (taskId: string) => {
    if (!data) return
    const nextTasks = data.goals.dailyTasks.filter(t => t.id !== taskId)
    setData(prev => (prev ? { ...prev, goals: { ...prev.goals, dailyTasks: nextTasks } } : prev))
    try {
      await api.updateStudyProgressGoals({ dailyTasks: nextTasks })
    } catch {
      loadOverview(true)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-sm text-warm-500">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-800" />
        <span>正在聚合做题战绩、错题本、闪卡与考纲掌握度...</span>
      </div>
    )
  }

  if (errorMsg || !data) {
    return (
      <div className="bg-surface border border-neutral-200/80 rounded-2xl p-8 text-center space-y-3 max-w-lg mx-auto">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <div className="text-sm font-semibold text-neutral-800">{errorMsg || '暂无进度数据'}</div>
        <button
          type="button"
          onClick={() => loadOverview(false)}
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium cursor-pointer"
        >
          重新加载
        </button>
      </div>
    )
  }

  const { summary, weeklyTrend, errorTypeDistribution, subjects, weakestNodes, recentErrors, todayActions, goals } = data

  const weeklyProgressPct = Math.min(100, Math.round((summary.weeklyQuestionsDone / Math.max(1, goals.weeklyQuestionGoal)) * 100))
  const errorMasteryPct = summary.errorTotal > 0 ? Math.round((summary.errorMastered / summary.errorTotal) * 100) : 100
  const syllabusMasteryPct = summary.syllabusTotal > 0 ? Math.round((summary.syllabusMastered / summary.syllabusTotal) * 100) : 0
  const booksExtractPct = summary.booksTotal > 0 ? Math.round((summary.booksExtracted / summary.booksTotal) * 100) : 0
  const hasWeeklyPractice = weeklyTrend.some(d => d.attempted > 0)
  const completedTasksCount = goals.dailyTasks.filter(t => t.done).length
  const totalNotesCount = vaultReviewStats.reduce((acc, s) => acc + s.totalNotes, 0)
  const totalWordsCount = vaultReviewStats.reduce((acc, s) => acc + s.totalWords, 0)

  const priorityBadge = (p: 'urgent' | 'recommended' | 'advance') => {
    if (p === 'urgent') return { label: '优先处理', cls: 'bg-rose-50 text-rose-700 border-rose-200' }
    if (p === 'recommended') return { label: '每日必做', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
    return { label: '进阶沉淀', cls: 'bg-sky-50 text-sky-700 border-sky-200' }
  }

  return (
    <div className="space-y-5 pb-10 animate-fade-in">
      {/* 1. 顶部备考驾驶舱横幅（目标 + 倒计时 + 连续活跃 + 设定目标） */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-900 text-white">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{goals.targetSchool}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <Clock className="w-3 h-3" />
                <span>距考研初试仅 {countdown.days} 天</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Flame className="w-3 h-3" />
                <span>连续活跃 {summary.streakDays} 天</span>
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-0.5">
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                个人研学诊断与备考推进中心
              </h2>
              <span className="text-xs text-neutral-500">
                目标总分 <strong className="text-neutral-900 font-mono">{goals.targetTotalScore}</strong> 分 · 累计刷题{' '}
                <strong className="text-neutral-900 font-mono">{summary.totalQuestionsAttempted}</strong> 题（共 {summary.totalQuizSessions} 场 · {summary.totalTimeMinutes} 分钟）
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setEditingGoals(v => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{editingGoals ? '收起目标设置' : '设定备考目标'}</span>
            </button>
            <button
              type="button"
              onClick={() => loadOverview(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>刷新数据</span>
            </button>
          </div>
        </div>

        {/* 可折叠目标编辑区 */}
        {editingGoals && goalDraft && (
          <div className="mt-4 pt-4 border-t border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-neutral-50/70 rounded-xl p-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">目标院校与专业</label>
              <input
                type="text"
                value={goalDraft.targetSchool}
                onChange={e => setGoalDraft({ ...goalDraft, targetSchool: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">初试目标总分</label>
              <input
                type="number"
                min={100}
                max={500}
                value={goalDraft.targetTotalScore}
                onChange={e => setGoalDraft({ ...goalDraft, targetTotalScore: Number(e.target.value) || 380 })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">每周刷题量目标（题）</label>
              <input
                type="number"
                min={10}
                max={1000}
                value={goalDraft.weeklyQuestionGoal}
                onChange={e => setGoalDraft({ ...goalDraft, weeklyQuestionGoal: Number(e.target.value) || 100 })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 mb-1">每日背词目标（词）</label>
              <input
                type="number"
                min={5}
                max={300}
                value={goalDraft.dailyVocabGoal}
                onChange={e => setGoalDraft({ ...goalDraft, dailyVocabGoal: Number(e.target.value) || 30 })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 outline-none focus:border-neutral-900"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {([
                { key: 'cs_408', label: '408 目标分 (满分150)', max: 150 },
                { key: 'math', label: '数学目标分 (满分150)', max: 150 },
                { key: 'english', label: '英语目标分 (满分100)', max: 100 },
                { key: 'politics', label: '政治目标分 (满分100)', max: 100 },
              ] as const).map(item => (
                <div key={item.key}>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">{item.label}</label>
                  <input
                    type="number"
                    min={0}
                    max={item.max}
                    value={goalDraft.subjectGoals[item.key].targetScore}
                    onChange={e =>
                      setGoalDraft({
                        ...goalDraft,
                        subjectGoals: {
                          ...goalDraft.subjectGoals,
                          [item.key]: {
                            ...goalDraft.subjectGoals[item.key],
                            targetScore: Math.min(item.max, Math.max(0, Number(e.target.value) || 0)),
                          },
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 outline-none focus:border-neutral-900"
                  />
                </div>
              ))}
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setGoalDraft(goals)
                  setEditingGoals(false)
                }}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveGoals}
                disabled={savingGoals}
                className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-black cursor-pointer disabled:opacity-50"
              >
                {savingGoals ? '保存中...' : '保存个人研学目标'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. 四大核心真实 KPI 指标卡（全部可点击直达行动） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* KPI 1: 本周刷题与综合正确率 */}
        <button
          type="button"
          onClick={() => navigate('/quiz')}
          className="text-left bg-white border border-neutral-200/80 hover:border-blue-400 rounded-2xl p-4 shadow-2xs transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">本周刷题进度</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Target className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-neutral-900">
              {summary.weeklyQuestionsDone}
              <span className="text-xs font-normal text-neutral-400 ml-1">/ {goals.weeklyQuestionGoal} 题</span>
            </div>
            <span className="text-xs font-semibold text-blue-600">
              正确率 {summary.overallAccuracy}%
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${weeklyProgressPct}%` }} />
          </div>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>累计答对 {summary.totalCorrect} 题</span>
            <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
              去刷题 <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* KPI 2: 错题本待攻克与消灭率 */}
        <button
          type="button"
          onClick={() => navigate('/quiz?tab=errors')}
          className="text-left bg-white border border-neutral-200/80 hover:border-rose-400 rounded-2xl p-4 shadow-2xs transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">错题本攻坚状态</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-neutral-900">
              {summary.errorPending}
              <span className="text-xs font-normal text-neutral-400 ml-1">道待攻克</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              消灭率 {errorMasteryPct}%
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${errorMasteryPct}%` }} />
          </div>
          <div className="mt-2 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>已掌握 {summary.errorMastered} / 总收录 {summary.errorTotal}</span>
            <span className="text-rose-600 font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
              去改错 <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </button>

        {/* KPI 3: 易忘闪卡 & 英语词汇 */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">记忆闪卡 & 考研词汇</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Brain className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-neutral-900">
              {summary.flashcardsDue}
              <span className="text-xs font-normal text-neutral-400 ml-1">张闪卡到期</span>
            </div>
            <span className="text-xs font-semibold text-purple-600">
              词汇待背 {summary.vocabDueToday}
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-neutral-500">
            <span>易忘标记 {summary.flashcardsForgotten} 张</span>
            <span>·</span>
            <span>单词已掌握 {summary.vocabMastered}/{summary.vocabPoolTotal}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => onSwitchTab('flashcards')}
              className="text-[11px] font-semibold text-purple-600 hover:underline cursor-pointer"
            >
              背诵闪卡 →
            </button>
            <button
              type="button"
              onClick={() => navigate('/vocabulary')}
              className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              去背单词 →
            </button>
          </div>
        </div>

        {/* KPI 4: 考纲绿灯 & 资料解析沉淀 */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-medium">考纲点亮 & 资料消化</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-neutral-900">
              {summary.syllabusMastered}
              <span className="text-xs font-normal text-neutral-400 ml-1">/ {summary.syllabusTotal} 绿灯</span>
            </div>
            <span className="text-xs font-semibold text-amber-600">
              资料解析 {booksExtractPct}%
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${syllabusMasteryPct}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-neutral-500">
            <button
              type="button"
              onClick={() => onSwitchTab('topology')}
              className="font-semibold text-amber-700 hover:underline cursor-pointer"
            >
              热力图 ({summary.syllabusInProgress} 巩固中)
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab('pdfs')}
              className="font-semibold text-neutral-700 hover:underline cursor-pointer"
            >
              教材 {summary.booksExtracted}/{summary.booksTotal}
            </button>
          </div>
        </div>
      </div>

      {/* 3. 今日智能行动队列 + 今日备考打卡清单 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 左：智能今日行动建议 (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900">系统诊断 · 今日最值得推进的事项</h3>
            </div>
            <span className="text-[11px] text-neutral-400">基于真实数据实时排序</span>
          </div>

          {todayActions.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
              <div>今日各项到期任务已全部清空，去做题中心冲刺一套真题巩固手感吧！</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayActions.map(act => {
                const badge = priorityBadge(act.priority)
                return (
                  <div
                    key={act.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border border-neutral-200/70 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                          {act.title}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">{act.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => executeAction(act.targetType, act.target)}
                      className="shrink-0 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      <span>{act.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 右：今日自主备考打卡清单 (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-neutral-900">今日备考任务清单</h3>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-600">
                {completedTasksCount}/{goals.dailyTasks.length} 已完成
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {goals.dailyTasks.length === 0 && (
                <div className="text-xs text-neutral-400 py-6 text-center">
                  暂无今日任务，在下方添加一条今天的备考计划吧
                </div>
              )}
              {goals.dailyTasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${
                    task.done
                      ? 'bg-emerald-50/50 border-emerald-200/70 text-neutral-400'
                      : 'bg-neutral-50/60 border-neutral-200/70 text-neutral-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleDailyTask(task.id)}
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                      task.done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-white border-neutral-300 hover:border-neutral-500'
                    }`}
                  >
                    {task.done && <Check className="w-3 h-3" />}
                  </button>
                  <span className={`text-xs flex-1 leading-snug ${task.done ? 'line-through' : 'font-medium'}`}>
                    {task.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteDailyTask(task.id)}
                    className="p-1 text-neutral-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                    title="移除该任务"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddDailyTask} className="flex items-center gap-1.5 pt-2 border-t border-neutral-100">
            <select
              value={newTaskDomain}
              onChange={e => setNewTaskDomain(e.target.value as StudyDailyTask['domain'])}
              className="px-2 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-[11px] text-neutral-700 outline-none"
            >
              <option value="cs_408">408</option>
              <option value="math">数学</option>
              <option value="english">英语</option>
              <option value="politics">政治</option>
              <option value="general">综合</option>
            </select>
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="新增今日打卡计划（如：高数不定积分 15 题）..."
              className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim() || savingTask}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium inline-flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加</span>
            </button>
          </form>
        </div>
      </div>

      {/* 4. 四大学科全维备考推进看板（408 / 数学 / 英语 / 政治） */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-700" />
            <h3 className="text-sm font-bold text-neutral-900">四科备考阶段与真实战绩推进</h3>
          </div>
          <span className="text-[11px] text-neutral-400">可随时切换各科当前复习轮次，自动云端同步</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {subjects.map(subj => {
            const theme = DOMAIN_THEME[subj.key]
            const stageObj = STAGE_OPTIONS.find(st => st.value === subj.stage) || STAGE_OPTIONS[0]
            const booksPct = subj.booksTotal > 0 ? Math.round((subj.booksExtracted / subj.booksTotal) * 100) : 0

            return (
              <div
                key={subj.key}
                className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-3.5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${theme.badge}`}>
                          {subj.name}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          目标 {subj.targetScore} / {subj.maxScore} 分
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">{subj.subtitle}</div>
                    </div>

                    <select
                      value={subj.stage}
                      onChange={e => handleChangeStage(subj.key, e.target.value as StudyStage)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border outline-none cursor-pointer ${stageObj.colorClass}`}
                    >
                      {STAGE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          阶段：{opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 阶段进度条 */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>当前阶段：{stageObj.label}</span>
                      <span className="font-mono">
                        {subj.accuracy !== null ? `刷题正确率 ${subj.accuracy}%` : '暂无刷题记录'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${theme.bar}`}
                        style={{ width: `${stageObj.barPct}%` }}
                      />
                    </div>
                  </div>

                  {/* 真实分科指标网格 */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-neutral-50/80 rounded-xl p-2.5 border border-neutral-100">
                    <div>
                      <div className="text-[10px] text-neutral-400">已刷真题</div>
                      <div className="text-sm font-bold font-mono text-neutral-800">{subj.attemptedQuestions}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400">待改错题</div>
                      <div className={`text-sm font-bold font-mono ${subj.errorsPending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {subj.errorsPending}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400">
                        {subj.mastery ? '考纲绿灯' : '资料解析'}
                      </div>
                      <div className="text-sm font-bold font-mono text-neutral-800">
                        {subj.mastery
                          ? `${subj.mastery.green}/${subj.mastery.total}`
                          : `${subj.booksExtracted}/${subj.booksTotal} (${booksPct}%)`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 学科快捷行动按钮 */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => executeAction(theme.secondaryAction.type, theme.secondaryAction.target)}
                    className="text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                  >
                    {theme.secondaryBtnLabel} →
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(theme.primaryRoute)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>{theme.primaryBtnLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. 近 7 天真实刷题曲线 + 错因诊断分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-neutral-900">近 7 天真实刷题与答对趋势</h3>
            </div>
            <span className="text-[11px] text-neutral-400">来自做题中心真实提交记录</span>
          </div>

          {hasWeeklyPractice ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={weeklyTrend} barCategoryGap="24%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece6" />
                <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#e4e4e7' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={{ stroke: '#e4e4e7' }} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 10, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="attempted" name="做题总数" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                <Bar dataKey="correct" name="答对题数" fill="#10b981" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[230px] flex flex-col items-center justify-center text-center bg-neutral-50/70 rounded-xl border border-dashed border-neutral-200 px-4 space-y-2.5">
              <BookOpen className="w-8 h-8 text-neutral-300" />
              <div className="text-xs font-medium text-neutral-600">近 7 天暂无提交的做题记录</div>
              <div className="text-[11px] text-neutral-400 max-w-sm">
                完成一次练习交卷后，这里会自动绘制你的每日刷题量与正确率真实曲线。
              </div>
              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium cursor-pointer hover:bg-black transition-colors"
              >
                立即去做一组题 →
              </button>
            </div>
          )}
        </div>

        {/* 右：高频错因诊断 & 题库资源统计 */}
        <div className="lg:col-span-5 bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-neutral-900">高频错因归因诊断</h3>
              </div>
              <span className="text-[11px] text-neutral-400">总计 {summary.errorTotal} 道错题</span>
            </div>

            <div className="space-y-2.5">
              {errorTypeDistribution.map(item => {
                const maxCnt = Math.max(1, ...errorTypeDistribution.map(d => d.count))
                const pct = Math.round((item.count / maxCnt) * 100)
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-700">{item.name}</span>
                      <span className="font-mono text-neutral-500">{item.count} 题</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500/85 rounded-full transition-all"
                        style={{ width: `${item.count > 0 ? Math.max(8, pct) : 0}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="text-[10px] text-neutral-400">个人导入自定义题库</div>
              <div className="text-base font-bold font-mono text-neutral-800 mt-0.5">
                {summary.customQuestionsTotal} <span className="text-[11px] font-normal text-neutral-400">题</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="text-[10px] text-neutral-400">已解析教材与讲义</div>
              <div className="text-base font-bold font-mono text-neutral-800 mt-0.5">
                {summary.booksExtracted} <span className="text-[11px] font-normal text-neutral-400">/ {summary.booksTotal} 份</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. 薄弱考点急诊室 & 待攻克错题直通车 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 薄弱考点雷达 */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900">急需突破的薄弱考点 Top 6</h3>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('topology')}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 cursor-pointer"
            >
              查看完整热力图 →
            </button>
          </div>

          {weakestNodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              暂无薄弱红/黄灯考点记录。去完成刷题或点击热力图标记你的薄弱项吧！
            </div>
          ) : (
            <div className="space-y-2">
              {weakestNodes.map(node => (
                <div
                  key={node.syllabusId}
                  className="p-3 rounded-xl border border-neutral-200/70 bg-neutral-50/50 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          node.status === 'red' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                      />
                      <span className="text-[11px] font-semibold text-neutral-500">{node.subject}</span>
                      <span className="text-xs font-bold text-neutral-800 truncate">{node.topic}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 pl-3.5">
                      掌握度 {node.score} 分 · 练习 {node.attempted} 次（错 {node.wrongCount} 次）
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/chat?prompt=${encodeURIComponent(
                          `我在「${node.topic}」（${node.subject}）当前掌握度只有 ${node.score} 分，请帮我系统精讲核心概念与必考题型，并出 2 道随堂检测题。`
                        )}`
                      )
                    }
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold cursor-pointer"
                  >
                    AI 靶向精讲
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 待攻克错题直通车 */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-neutral-900">近期未掌握错题</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/quiz?tab=errors')}
              className="text-xs font-medium text-rose-600 hover:underline cursor-pointer"
            >
              进入错题攻克中心 →
            </button>
          </div>

          {recentErrors.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              当前暂无待攻克错题，保持良好的复习习惯！
            </div>
          ) : (
            <div className="space-y-2">
              {recentErrors.map(err => (
                <div
                  key={err.id}
                  onClick={() => navigate('/quiz?tab=errors')}
                  className="p-3 rounded-xl border border-neutral-200/70 bg-neutral-50/50 hover:bg-white hover:border-rose-300 transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-neutral-700">
                      {err.subject}
                      {err.chapter ? ` · ${err.chapter}` : ''}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-semibold">
                      {err.errorType}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-600 line-clamp-2">{err.question}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 7. 底层知识库沉淀底栏 */}
      {totalNotesCount > 0 && (
        <div className="bg-surface border border-neutral-200/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
          <span>底层知识库沉淀：{totalNotesCount} 篇笔记（约 {totalWordsCount.toLocaleString()} 字）</span>
          <button
            type="button"
            onClick={() => onSwitchTab('graph')}
            className="text-neutral-700 font-medium hover:underline cursor-pointer"
          >
            在全景知识图谱中查看 →
          </button>
        </div>
      )}
    </div>
  )
}
