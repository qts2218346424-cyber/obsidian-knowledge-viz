import { useMemo, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar
} from 'recharts'
import { useVaultHealth, useVaultStats } from '../hooks/useVaultData'
import { api, type LintFixResult } from '../services/api'
import { healthData as mockHealth, noteDistribution as mockDist, activityData as mockActivity, topEntities as mockEntities } from '../data/mockData'
import { Loader2, RefreshCw, Wrench, Check, AlertTriangle } from 'lucide-react'

export default function Dashboard() {
  const { report, loading: healthLoading, error: healthError, reload: reloadHealth } = useVaultHealth()
  const { stats, loading: statsLoading, reload: reloadStats } = useVaultStats()

  const reload = () => { reloadHealth(); reloadStats() }

  const [fixResults, setFixResults] = useState<Record<string, LintFixResult>>({})
  const [fixing, setFixing] = useState<string | null>(null)

  const fixCategory = async (cat: string) => {
    setFixing(cat)
    try {
      const res = await api.lintFix(cat)
      setFixResults(prev => ({ ...prev, [cat]: res }))
      reloadHealth()
    } catch { /* ignore */ }
    finally { setFixing(null) }
  }

  const fixableCategories = ['link_integrity', 'metadata_coverage', 'tag_consistency', 'orphan_notes']

  // Map real data or fallback to mock
  const radarData = useMemo(() => {
    if (report?.categories) {
      return report.categories.map(c => ({
        metric: c.label,
        score: Math.round((c.score / c.maxScore) * 100),
        fullMark: 100,
      }))
    }
    return mockHealth
  }, [report])

  const overallScore = report?.overallScore ?? Math.round(
    mockHealth.reduce((sum, d) => sum + d.score, 0) / mockHealth.length
  )
  const scoreColor = overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444'
  const scoreLabel = overallScore >= 80 ? '健康' : overallScore >= 60 ? '一般' : '需关注'
  const isRealData = !!report

  // Note distribution from health categories
  const noteDistribution = useMemo(() => {
    if (report?.stats) {
      const { totalNotes, orphanNotes, danglingLinks } = report.stats
      const issueCount = report.categories.reduce(
        (s, c) => s + c.issues.filter(i => i.severity === 'warning' || i.severity === 'error').length, 0
      )
      const healthy = Math.max(0, totalNotes - orphanNotes - issueCount)
      return [
        { name: '健康笔记', value: healthy, color: '#10b981' },
        { name: '需要修复', value: issueCount, color: '#f59e0b' },
        { name: '孤立笔记', value: orphanNotes, color: '#ef4444' },
        { name: '断链引用', value: danglingLinks, color: '#8b5cf6' },
      ]
    }
    return mockDist
  }, [report])

  // Activity from stats
  const activityData = useMemo(() => {
    if (stats?.recentActivity && stats.recentActivity.length > 0) {
      return stats.recentActivity.map(d => ({
        day: d.date.split('-')[2],
        摄取: d.modified,
        查询: 0,
        研究: 0,
      }))
    }
    return mockActivity
  }, [stats])

  // Top tags as entities
  const topEntities = useMemo(() => {
    if (stats?.tagDistribution && stats.tagDistribution.length > 0) {
      return stats.tagDistribution.slice(0, 8).map(t => ({
        name: t.name,
        mentions: t.count,
      }))
    }
    return mockEntities
  }, [stats])

  const totalNotes = stats?.totalNotes ?? 188
  const totalLinks = stats?.totalLinks ?? 342
  const orphanNotes = stats?.orphanNotes ?? 23
  const totalTags = stats?.totalTags ?? 34

  return (
    <div className="space-y-5">
      {/* Top stat cards */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: '笔记总数', value: `${totalNotes}`, sub: isRealData ? '来自 Vault' : '示例数据', color: 'text-violet-400' },
          { label: '健康评分', value: `${overallScore}`, sub: scoreLabel, color: overallScore >= 80 ? 'text-emerald-400' : 'text-amber-400' },
          { label: '交叉引用', value: `${totalLinks}`, sub: stats ? `平均 ${stats.avgWordsPerNote} 字/篇` : '示例数据', color: 'text-cyan-400' },
          { label: '孤立笔记', value: `${orphanNotes}`, sub: stats ? `${stats.danglingLinks} 断链` : '示例数据', color: 'text-rose-400' },
          { label: '标签数', value: `${totalTags}`, sub: isRealData ? '已识别' : '示例数据', color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5">
            <div className="text-[11px] text-slate-500 mb-1.5">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-slate-600 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Loading / Status */}
      {(healthLoading || statsLoading) && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          加载健康数据...
        </div>
      )}
      {healthError && (
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
          API 未连接，显示示例数据。启动后端: npm run dev:all
          <button onClick={reload} className="ml-auto p-1 rounded hover:bg-amber-400/10">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Radar */}
        <Card title="Vault 健康雷达图" subtitle="8 维度综合评估">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="score"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie + Score */}
        <Card title="笔记状态分布" subtitle="按健康程度分类">
          <div className="flex items-center">
            <ResponsiveContainer width="55%" height={300}>
              <PieChart>
                <Pie
                  data={noteDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  dataKey="value"
                  stroke="none"
                  paddingAngle={3}
                >
                  {noteDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: 8,
                    color: '#e2e8f0',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 text-center">
              <div className="text-5xl font-bold" style={{ color: scoreColor }}>{overallScore}</div>
              <div className="text-xs text-slate-500 mt-1">综合健康分</div>
              <div className="mt-5 text-left space-y-2.5">
                {noteDistribution.map(d => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-slate-400 flex-1">{d.name}</span>
                    <span className="text-slate-200 font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity trend */}
      <Card title="30 天活动趋势" subtitle={isRealData ? '基于文件修改时间' : '示例数据'}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 8 }} />
            <Area type="monotone" dataKey="摄取" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="查询" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="研究" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Entity frequency */}
      <Card title={isRealData ? '高频标签 Top 8' : '高频实体 Top 8'} subtitle={isRealData ? '基于标签使用频率' : '示例数据'}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topEntities} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={{ stroke: '#1e293b' }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} width={90} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#e2e8f0', fontSize: 12 }}
            />
            <Bar dataKey="mentions" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Health Issues & Auto-Fix */}
      {report && report.categories.length > 0 && (
        <Card title="健康问题 & 自动修复" subtitle="点击修复按钮自动解决对应问题">
          <div className="grid grid-cols-2 gap-3">
            {report.categories.map(cat => {
              const isFixable = fixableCategories.includes(cat.name)
              const issueCount = cat.issues.length
              const fixResult = fixResults[cat.name]
              const scorePercent = Math.round((cat.score / cat.maxScore) * 100)

              return (
                <div key={cat.name} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-200">{cat.label}</span>
                    <span className={`text-xs font-bold ${scorePercent >= 80 ? 'text-emerald-400' : scorePercent >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {cat.score}/{cat.maxScore}
                    </span>
                  </div>

                  {issueCount > 0 && (
                    <div className="space-y-1 mb-2 max-h-20 overflow-auto">
                      {cat.issues.slice(0, 3).map((issue, i) => (
                        <div key={i} className="text-[10px] text-slate-500 flex items-start gap-1">
                          <AlertTriangle className={`w-2.5 h-2.5 mt-0.5 shrink-0 ${
                            issue.severity === 'error' ? 'text-rose-400' : issue.severity === 'warning' ? 'text-amber-400' : 'text-slate-500'
                          }`} />
                          <span className="truncate">{issue.message}</span>
                        </div>
                      ))}
                      {issueCount > 3 && (
                        <div className="text-[10px] text-slate-600">+{issueCount - 3} 更多问题</div>
                      )}
                    </div>
                  )}

                  {issueCount === 0 && (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 mb-2">
                      <Check className="w-3 h-3" /> 无问题
                    </div>
                  )}

                  {isFixable && issueCount > 0 && !fixResult && (
                    <button
                      onClick={() => fixCategory(cat.name)}
                      disabled={fixing === cat.name}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[11px] bg-violet-600/80 text-white hover:bg-violet-500 disabled:opacity-40 transition-colors"
                    >
                      {fixing === cat.name ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wrench className="w-3 h-3" />
                      )}
                      自动修复 ({issueCount})
                    </button>
                  )}

                  {fixResult && (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 rounded px-2 py-1">
                      <Check className="w-3 h-3" />
                      修复 {fixResult.fixed} 个，跳过 {fixResult.skipped} 个
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-200">{title}</div>
        {subtitle && <div className="text-[11px] text-slate-500 mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}
