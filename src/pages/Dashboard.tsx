import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  FilePlus2,
  FileText,
  FolderOpen,
  HeartPulse,
  Link2,
  MessageCircle,
  Search,
  Sparkles,
  Tags,
  TriangleAlert,
  Wrench,
} from 'lucide-react'
import { api, type FileListItem } from '../services/api'
import { useVaultHealth, useVaultStats } from '../hooks/useVaultData'

function getVaultName(vaultPath?: string) {
  if (!vaultPath) return '你的知识库'
  return vaultPath.split(/[\\/]/).filter(Boolean).pop() || '你的知识库'
}

function formatModifiedDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '未知时间'

  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

interface MetricCardProps {
  label: string
  value: number
  icon: typeof FileText
  tone: 'orange' | 'sage' | 'amber' | 'rose'
}

function MetricCard({ label, value, icon: Icon, tone }: MetricCardProps) {
  const tones = {
    orange: 'bg-accent-orange/12 text-accent-orange',
    sage: 'bg-accent-sage/12 text-accent-sage',
    amber: 'bg-accent-amber/12 text-accent-amber',
    rose: 'bg-accent-rose/12 text-accent-rose',
  }

  return (
    <div className="rounded-2xl border border-cream-200 bg-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
      <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-warm-800">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-warm-400">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const { stats, loading: statsLoading } = useVaultStats()
  const { report, loading: healthLoading } = useVaultHealth()
  const [recentFiles, setRecentFiles] = useState<FileListItem[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [quickStartDismissed, setQuickStartDismissed] = useState(false)

  useEffect(() => {
    setQuickStartDismissed(window.localStorage.getItem('knowledge-viz-quick-start-dismissed') === 'true')
  }, [])

  useEffect(() => {
    let cancelled = false

    api.getFiles()
      .then((files) => {
        if (cancelled) return
        const latest = [...files]
          .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
          .slice(0, 5)
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
  const healthTone = healthScore >= 80
    ? 'text-accent-sage'
    : healthScore >= 60 ? 'text-accent-amber' : 'text-accent-rose'

  if (!statsLoading && !hasConnectedVault) {
    return (
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-3xl border border-cream-200 bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
          <div className="border-b border-cream-200 bg-gradient-to-br from-accent-peach/15 via-surface to-accent-sage/10 px-7 py-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-orange text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-warm-800">从你的第一个知识库开始</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-warm-500">
              连接 Obsidian Vault 后，这里会展示笔记动态、知识关联和待整理事项，帮助你把资料变成可持续使用的知识系统。
            </p>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
              <span className="text-xs font-medium text-accent-orange">01</span>
              <FolderOpen className="mt-4 h-5 w-5 text-warm-600" />
              <h2 className="mt-3 font-medium text-warm-800">连接知识库</h2>
              <p className="mt-1 text-xs leading-5 text-warm-500">选择本地 Obsidian Vault，内容始终保留在你的电脑上。</p>
            </div>
            <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
              <span className="text-xs font-medium text-accent-orange">02</span>
              <Link2 className="mt-4 h-5 w-5 text-warm-600" />
              <h2 className="mt-3 font-medium text-warm-800">查看知识关联</h2>
              <p className="mt-1 text-xs leading-5 text-warm-500">用图谱与健康检查发现孤立笔记、断链和结构问题。</p>
            </div>
            <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5">
              <span className="text-xs font-medium text-accent-orange">03</span>
              <FilePlus2 className="mt-4 h-5 w-5 text-warm-600" />
              <h2 className="mt-3 font-medium text-warm-800">开始沉淀知识</h2>
              <p className="mt-1 text-xs leading-5 text-warm-500">创建、编辑与整理笔记，让每次记录都能被再次找到。</p>
            </div>
          </div>

          <div className="flex justify-end px-6 pb-6">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-orange px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#0077ed]"
            >
              连接知识库
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-cream-200 bg-gradient-to-br from-surface via-surface to-accent-peach/15 px-6 py-7 shadow-[0_18px_50px_rgba(0,0,0,0.08)] sm:px-8">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent-sage/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cream-200 bg-surface/80 px-3 py-1 text-xs text-warm-500">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-sage" />
              已连接 · {vaultName}
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-warm-800">今天从哪里开始？</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-warm-500">
              快速记录灵感、查找已有知识，或花几分钟让知识库更清晰。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/editor" className="inline-flex items-center gap-2 rounded-xl bg-accent-orange px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#0077ed]">
              <FilePlus2 className="h-4 w-4" />
              新建笔记
            </Link>
            <Link to="/graph" className="inline-flex items-center gap-2 rounded-xl border border-cream-300 bg-surface px-4 py-2.5 text-sm font-medium text-warm-600 transition-colors hover:bg-cream-100">
              <Search className="h-4 w-4" />
              浏览知识
            </Link>
            <Link to="/workflow" className="inline-flex items-center gap-2 rounded-xl border border-cream-300 bg-surface px-4 py-2.5 text-sm font-medium text-warm-600 transition-colors hover:bg-cream-100">
              <Wrench className="h-4 w-4" />
              整理知识库
            </Link>
          </div>
        </div>
      </section>

      {!quickStartDismissed && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(0,0,0,0.06)] sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent-orange" />
                <h2 className="text-base font-semibold tracking-tight text-warm-900">3 分钟上手 Knowledge Viz</h2>
              </div>
              <p className="mt-1 text-sm text-warm-500">不用先学习复杂概念，按这条路径就能开始使用。</p>
            </div>
            <button
              onClick={() => {
                window.localStorage.setItem('knowledge-viz-quick-start-dismissed', 'true')
                setQuickStartDismissed(true)
              }}
              className="self-start text-xs text-warm-400 transition-colors hover:text-warm-700"
            >
              以后再看
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <QuickStartStep
              index="01"
              title="写一条笔记"
              description="先记录，不必先设计完美结构。"
              to="/editor"
              icon={FilePlus2}
              done={Boolean(stats?.totalNotes)}
            />
            <QuickStartStep
              index="02"
              title="搜索已有知识"
              description="用关键词找到相关内容和上下文。"
              to="/graph"
              icon={Search}
              done={Boolean(stats?.totalLinks)}
            />
            <QuickStartStep
              index="03"
              title="问 AI 一个问题"
              description="让 AI 基于你的 Vault 回答，而不是空泛聊天。"
              to="/chat"
              icon={MessageCircle}
              done={false}
            />
            <QuickStartStep
              index="04"
              title="整理一个问题"
              description="从孤立笔记或断链开始，逐步变清晰。"
              to="/workflow"
              icon={Wrench}
              done={Boolean(stats && stats.orphanNotes === 0 && stats.danglingLinks === 0)}
            />
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="篇笔记" value={stats?.totalNotes ?? 0} icon={FileText} tone="orange" />
        <MetricCard label="条关联" value={stats?.totalLinks ?? 0} icon={Link2} tone="sage" />
        <MetricCard label="个标签" value={stats?.totalTags ?? 0} icon={Tags} tone="amber" />
        <MetricCard label="个待处理事项" value={issueCount} icon={TriangleAlert} tone="rose" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-cream-200 bg-surface p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-accent-rose" />
                <h2 className="text-sm font-semibold text-warm-700">知识库健康度</h2>
              </div>
              <p className="mt-1 text-xs text-warm-400">通过连接、标签和结构情况，快速找到值得优先整理的内容。</p>
            </div>
            <span className={`text-2xl font-semibold ${healthTone}`}>{healthLoading ? '—' : healthScore}</span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-cream-100">
            <div
              className={`h-full rounded-full transition-all ${healthScore >= 80 ? 'bg-accent-sage' : healthScore >= 60 ? 'bg-accent-amber' : 'bg-accent-rose'}`}
              style={{ width: `${Math.max(0, Math.min(100, healthScore))}%` }}
            />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-cream-50 p-3">
              <p className="text-lg font-semibold text-warm-700">{stats?.orphanNotes ?? 0}</p>
              <p className="mt-0.5 text-xs text-warm-400">篇孤立笔记</p>
            </div>
            <div className="rounded-xl bg-cream-50 p-3">
              <p className="text-lg font-semibold text-warm-700">{stats?.danglingLinks ?? 0}</p>
              <p className="mt-0.5 text-xs text-warm-400">条待检查链接</p>
            </div>
          </div>
          <Link to="/workflow" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-orange hover:text-[#0077ed]">
            查看整理建议
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-cream-200 bg-surface p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-amber" />
            <h2 className="text-sm font-semibold text-warm-700">下一步建议</h2>
          </div>
          <div className="mt-4 space-y-3">
            <Link to="/workflow" className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-cream-50">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-orange/12 text-xs font-semibold text-accent-orange">1</span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-warm-700">连接孤立笔记</span>
                <span className="mt-0.5 block text-xs leading-5 text-warm-400">让 {stats?.orphanNotes ?? 0} 篇笔记进入你的知识网络。</span>
              </span>
              <ArrowRight className="mt-1 ml-auto h-4 w-4 shrink-0 text-warm-300 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/graph" className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-cream-50">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-sage/12 text-xs font-semibold text-accent-sage">2</span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-warm-700">探索知识图谱</span>
                <span className="mt-0.5 block text-xs leading-5 text-warm-400">发现已有主题之间的连接和空白区域。</span>
              </span>
              <ArrowRight className="mt-1 ml-auto h-4 w-4 shrink-0 text-warm-300 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/editor" className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-cream-50">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-amber/12 text-xs font-semibold text-accent-amber">3</span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-warm-700">写下一条新想法</span>
                <span className="mt-0.5 block text-xs leading-5 text-warm-400">把零散灵感沉淀为可搜索、可关联的笔记。</span>
              </span>
              <ArrowRight className="mt-1 ml-auto h-4 w-4 shrink-0 text-warm-300 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-cream-200 bg-surface p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-warm-700">最近修改</h2>
            <p className="mt-1 text-xs text-warm-400">继续你最近沉淀的内容。</p>
          </div>
          <Link to="/editor" className="text-xs font-medium text-accent-orange hover:text-[#0077ed]">打开笔记编辑器</Link>
        </div>

        <div className="mt-4 divide-y divide-cream-100">
          {filesLoading ? (
            <p className="py-8 text-center text-sm text-warm-400">正在读取笔记…</p>
          ) : recentFiles.length > 0 ? recentFiles.map((file) => (
            <Link
              key={file.path}
              to={`/editor?path=${encodeURIComponent(file.path)}`}
              className="flex items-center gap-3 py-3 transition-colors hover:bg-cream-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-warm-500">
                <FileText className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-warm-700">{file.title || file.path}</span>
                <span className="mt-0.5 block truncate text-xs text-warm-400">{file.path}</span>
              </span>
              <span className="shrink-0 text-xs text-warm-400">{formatModifiedDate(file.modified)}</span>
            </Link>
          )) : (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-5 w-5 text-accent-sage" />
              <p className="mt-2 text-sm text-warm-500">还没有可显示的笔记</p>
              <Link to="/editor" className="mt-2 inline-flex text-sm font-medium text-accent-orange">创建第一篇笔记</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function QuickStartStep({
  index,
  title,
  description,
  to,
  icon: Icon,
  done,
}: {
  index: string
  title: string
  description: string
  to: string
  icon: typeof FileText
  done: boolean
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-slate-200 bg-cream-50 p-4 transition-all hover:-translate-y-0.5 hover:border-accent-orange/40 hover:bg-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.14em] text-warm-400">{index}</span>
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-accent-sage" />
        ) : (
          <Icon className="h-4 w-4 text-accent-orange transition-transform group-hover:scale-110" />
        )}
      </div>
      <h3 className="mt-5 text-sm font-semibold text-warm-900">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-warm-500">{description}</p>
      <span className="mt-4 inline-flex text-xs font-medium text-accent-orange">{done ? '已完成 · 再次打开' : '开始体验 →'}</span>
    </Link>
  )
}
