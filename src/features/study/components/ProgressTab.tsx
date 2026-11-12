import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import { Loader2 } from 'lucide-react'
import { api, type SubjectStats } from '../../../services/api'
import { CURATED_HANDOUTS } from '../../../data/handoutsData'
import { INTERACTIVE_COURSEWARES } from '../../../data/interactiveCourseware'
import { colorPalette } from '../utils'

// ─── Progress Tab ─────────────────────────────────────────────────────────────

export default function ProgressTab() {
  const [stats, setStats] = useState<SubjectStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getReviewDue()
      .then(data => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-warm-500 py-12 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> 统计学科备考进度...
      </div>
    )
  }

  const chartData = [
    { name: '408 · 数据结构', 核心讲义: 4, 习题数: 36 },
    { name: '408 · 计组与流水线', 核心讲义: 3, 习题数: 28 },
    { name: '408 · 操作系统', 核心讲义: 3, 习题数: 30 },
    { name: '408 · 计算机网络', 核心讲义: 3, 习题数: 25 },
    { name: '数学 · 高等数学', 核心讲义: 5, 习题数: 45 },
    { name: '数学 · 线性代数', 核心讲义: 3, 习题数: 24 },
    { name: '数学 · 概率论', 核心讲义: 2, 习题数: 18 },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-surface border border-cream-200 rounded-xl p-4">
          <div className="text-xs text-warm-400">权威讲义库</div>
          <div className="text-2xl font-bold text-warm-800 mt-1">{CURATED_HANDOUTS.length} <span className="text-xs font-normal text-warm-400">篇精析</span></div>
          <div className="text-[10px] text-accent-orange mt-1">覆盖 408 与 考研数学全科</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl p-4">
          <div className="text-xs text-warm-400">交互仿真课件</div>
          <div className="text-2xl font-bold text-cyan-600 mt-1">{INTERACTIVE_COURSEWARES.length} <span className="text-xs font-normal text-warm-400">个互动课件</span></div>
          <div className="text-[10px] text-warm-400 mt-1">含 史纲时空轴、CPU流水线、页面置换</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl p-4">
          <div className="text-xs text-warm-400">考研真题与题库</div>
          <div className="text-2xl font-bold text-accent-sage mt-1">167 <span className="text-xs font-normal text-warm-400">道统考真题精选</span></div>
          <div className="text-[10px] text-warm-400 mt-1">支持随时随堂一键即练</div>
        </div>
        <div className="bg-surface border border-cream-200 rounded-xl p-4">
          <div className="text-xs text-warm-400">AI 伴学引擎</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">双核 <span className="text-xs font-normal text-warm-400">+ 噜噜</span></div>
          <div className="text-[10px] text-warm-400 mt-1">Claude Code / Codex / DeepSeek</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-surface border border-neutral-200/80 rounded-xl p-5 shadow-xs">
        <div className="text-xs font-bold text-warm-700 mb-4">408 与 考研数学各科讲义与真题覆盖分布</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0e8dc" />
            <XAxis dataKey="name" tick={{ fill: '#8b7e74', fontSize: 11 }} axisLine={{ stroke: '#d4c8ba' }} />
            <YAxis tick={{ fill: '#8b7e74', fontSize: 11 }} axisLine={{ stroke: '#d4c8ba' }} />
            <Tooltip
              contentStyle={{ background: '#FFFBF5', border: '1px solid #d4c8ba', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#3d3530' }}
            />
            <Bar dataKey="核心讲义" radius={[6, 6, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={colorPalette[i % colorPalette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {stats.length > 0 && (
        <div className="bg-surface border border-cream-200 rounded-xl px-5 py-3 flex items-center justify-between text-xs text-warm-500">
          <span>底层知识库关联笔记：共 {stats.reduce((acc, s) => acc + s.totalNotes, 0)} 篇（已自动整理为讲义支撑索引）</span>
          <span>词汇量统计：{stats.reduce((acc, s) => acc + s.totalWords, 0).toLocaleString()} 字</span>
        </div>
      )}
    </div>
  )
}
