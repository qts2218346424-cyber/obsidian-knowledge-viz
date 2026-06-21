import { useState, useEffect } from 'react'
import { BookOpen, Check, TrendingUp, Plus, Award, Loader2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { api, type VocabStatsData } from '../../services/api'

const COLORS = {
  mastered: '#87A878',
  learning: '#D4A373',
  new: '#E8915A',
  notAdded: '#d4c8ba',
}

const FREQ_LABELS: Record<string, string> = { high: '高频', mid: '中频', low: '低频' }

const tooltipStyle = {
  contentStyle: {
    background: '#FFFBF5',
    border: '1px solid #d4c8ba',
    borderRadius: 8,
    fontSize: 12,
  },
}

const axisProps = {
  tick: { fill: '#8b7355', fontSize: 12 },
  axisLine: { stroke: '#d4c8ba' },
}

function MasteryRing({ pct }: { pct: number }) {
  const r = 60
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx={80} cy={80} r={r} fill="none" stroke="#e8dfd4" strokeWidth={12} />
        <circle
          cx={80} cy={80} r={r} fill="none"
          stroke={COLORS.mastered} strokeWidth={12}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x={80} y={76} textAnchor="middle" fill="#5c4a32" fontSize={28} fontWeight={700}>
          {pct.toFixed(1)}%
        </text>
        <text x={80} y={98} textAnchor="middle" fill="#8b7355" fontSize={12}>
          掌握率
        </text>
      </svg>
      <span className="text-sm text-warm-500 font-medium">总体掌握率</span>
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: number; icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-surface border border-cream-200 rounded-xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-warm-400">{label}</p>
        <p className="text-xl font-bold text-warm-800">{value.toLocaleString()}</p>
      </div>
    </div>
  )
}

function FrequencyBars({ data }: { data: VocabStatsData['frequencyDistribution'] }) {
  const entries = Object.entries(data)

  return (
    <div className="space-y-4">
      {entries.map(([key, val]) => {
        const total = val.total || 1
        const segments = [
          { label: '已掌握', value: val.mastered, color: COLORS.mastered },
          { label: '学习中', value: val.learning, color: COLORS.learning },
          { label: '新词', value: val.newWords, color: COLORS.new },
          { label: '未添加', value: val.notAdded, color: COLORS.notAdded },
        ]

        return (
          <div key={key}>
            <div className="flex justify-between text-xs text-warm-500 mb-1">
              <span>{FREQ_LABELS[key] ?? key}</span>
              <span>{val.total} 词</span>
            </div>
            <div className="flex h-5 rounded-md overflow-hidden bg-cream-100">
              {segments.filter(s => s.value > 0).map((seg) => (
                <div
                  key={seg.label}
                  title={`${seg.label}: ${seg.value}`}
                  style={{ width: `${(seg.value / total) * 100}%`, background: seg.color }}
                  className="transition-all duration-300"
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function VocabStats() {
  const [data, setData] = useState<VocabStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getVocabStats()
      .then(setData)
      .catch((err) => setError(err.message || '加载失败'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-warm-400" size={32} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 text-red-500 text-sm">
        {error ?? '数据加载异常'}
      </div>
    )
  }

  const { unitProgress, frequencyDistribution, overall } = data

  const pieData = Object.entries(frequencyDistribution).map(([key, val]) => ({
    name: FREQ_LABELS[key] ?? key,
    mastered: val.mastered,
    notMastered: val.total - val.mastered,
  }))

  const pieColors = [COLORS.mastered, '#e8dfd4']

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="总词数" value={overall.total} icon={BookOpen} color="#8b7355" />
        <StatCard label="已掌握" value={overall.mastered} icon={Check} color={COLORS.mastered} />
        <StatCard label="学习中" value={overall.learning} icon={TrendingUp} color={COLORS.learning} />
        <StatCard label="未添加" value={overall.notAdded} icon={Plus} color="#c4956a" />
      </div>

      {/* Mastery ring + pie chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-cream-200 rounded-xl p-5 flex items-center justify-center">
          <MasteryRing pct={overall.masteredPct} />
        </div>

        <div className="bg-surface border border-cream-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-warm-700 mb-3 flex items-center gap-2">
            <Award size={16} className="text-warm-400" />
            词频分布
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="mastered"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={pieColors[0]} />
                ))}
              </Pie>
              <Pie
                data={pieData}
                dataKey="notMastered"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={82}
                outerRadius={95}
                paddingAngle={3}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={pieColors[1]} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-warm-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Unit progress bar chart */}
      <div className="bg-surface border border-cream-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-warm-700 mb-4">单元进度</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={unitProgress} barCategoryGap="18%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd4" vertical={false} />
            <XAxis dataKey="unit" {...axisProps} tickFormatter={(v) => `U${v}`} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Legend
              formatter={(value: string) => (
                <span className="text-xs text-warm-600">{value}</span>
              )}
            />
            <Bar dataKey="mastered" name="已掌握" stackId="a" fill={COLORS.mastered} radius={[0, 0, 0, 0]} />
            <Bar dataKey="learning" name="学习中" stackId="a" fill={COLORS.learning} radius={[0, 0, 0, 0]} />
            <Bar dataKey="newWords" name="新词" stackId="a" fill={COLORS.new} radius={[0, 0, 0, 0]} />
            <Bar dataKey="notAdded" name="未添加" stackId="a" fill={COLORS.notAdded} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Frequency detail bars */}
      <div className="bg-surface border border-cream-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-warm-700 mb-4">词频详细分布</h3>
        <FrequencyBars data={frequencyDistribution} />

        <div className="flex flex-wrap gap-4 mt-4 text-xs text-warm-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ background: COLORS.mastered }} /> 已掌握
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ background: COLORS.learning }} /> 学习中
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ background: COLORS.new }} /> 新词
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded" style={{ background: COLORS.notAdded }} /> 未添加
          </span>
        </div>
      </div>
    </div>
  )
}
