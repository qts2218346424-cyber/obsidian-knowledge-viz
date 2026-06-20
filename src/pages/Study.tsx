import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'
import {
  GraduationCap, BookOpen, Clock, RefreshCw, Loader2,
  ChevronLeft, ChevronRight, RotateCcw, AlertTriangle, TrendingUp
} from 'lucide-react'
import { api, type Flashcard, type FlashcardResult, type ReviewDueData, type SubjectStats, type FileListItem } from '../services/api'

type Tab = 'flashcards' | 'review' | 'progress'

const subjectColors: Record<string, string> = {
  '数据结构': '#8b5cf6',
  '计算机组成': '#06b6d4',
  '计算机网络': '#f59e0b',
  '操作系统': '#10b981',
  '其他': '#64748b',
}

export default function Study() {
  const [tab, setTab] = useState<Tab>('flashcards')

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { key: 'flashcards' as Tab, label: '复习卡片', icon: BookOpen },
          { key: 'review' as Tab, label: '复习提醒', icon: Clock },
          { key: 'progress' as Tab, label: '科目进度', icon: TrendingUp },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              tab === t.key
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-600">
          <GraduationCap className="w-3.5 h-3.5" />
          408 考研学习中心
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {tab === 'flashcards' && <FlashcardTab />}
        {tab === 'review' && <ReviewTab />}
        {tab === 'progress' && <ProgressTab />}
      </div>
    </div>
  )
}

// ─── Flashcard Tab ────────────────────────────────────────────────────────────

function FlashcardTab() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<FileListItem[]>([])
  const [selectedFile, setSelectedFile] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<FlashcardResult | null>(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    api.getFiles().then(setFiles).catch(() => {})
  }, [])

  const filteredFiles = files.filter(f =>
    !searchQuery || f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.path.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50)

  const generateCards = async () => {
    if (!selectedFile) return
    setLoading(true)
    setResult(null)
    setCardIndex(0)
    setFlipped(false)
    try {
      const res = await api.generateFlashcards(selectedFile)
      setResult(res)
    } catch {
      setResult({ flashcards: [{ q: '生成失败', a: '请检查后端 AI 服务是否正常运行' }], notePath: selectedFile, noteTitle: '错误' })
    } finally {
      setLoading(false)
    }
  }

  const currentCard: Flashcard | null = result?.flashcards[cardIndex] || null
  const totalCards = result?.flashcards.length || 0

  const nextCard = () => {
    if (cardIndex < totalCards - 1) { setCardIndex(cardIndex + 1); setFlipped(false) }
  }
  const prevCard = () => {
    if (cardIndex > 0) { setCardIndex(cardIndex - 1); setFlipped(false) }
  }
  const resetCards = () => { setCardIndex(0); setFlipped(false) }

  return (
    <div className="flex gap-6 h-full">
      {/* Note selector */}
      <div className="w-64 shrink-0 flex flex-col gap-3">
        <div className="text-xs text-slate-400 font-medium">选择笔记生成卡片</div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索笔记..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-violet-500"
        />
        <div className="flex-1 overflow-auto space-y-1 max-h-[60vh]">
          {filteredFiles.map(f => (
            <button
              key={f.path}
              onClick={() => setSelectedFile(f.path)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                selectedFile === f.path
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className="font-medium truncate">{f.title}</div>
              <div className="text-[10px] text-slate-600 mt-0.5 truncate">{f.path}</div>
            </button>
          ))}
        </div>
        <button
          onClick={generateCards}
          disabled={!selectedFile || loading}
          className="w-full py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
          {loading ? '生成中...' : '生成复习卡片'}
        </button>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {!result && !loading && (
          <div className="text-center text-slate-600">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <div className="text-sm">选择左侧笔记，点击"生成复习卡片"</div>
            <div className="text-xs mt-1">AI 将根据笔记内容生成 8 张问答卡片</div>
          </div>
        )}

        {loading && (
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
            <div className="text-sm text-slate-400">AI 正在分析笔记内容...</div>
          </div>
        )}

        {result && currentCard && (
          <div className="w-full max-w-lg">
            {/* Card info */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-slate-500">
                {result.noteTitle} — 卡片 {cardIndex + 1} / {totalCards}
              </div>
              <button onClick={resetCards} className="p-1 rounded text-slate-500 hover:text-slate-300" title="重置">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Flashcard */}
            <div
              onClick={() => setFlipped(!flipped)}
              className="relative cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              <div
                className="transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
                }}
              >
                {/* Front (Question) */}
                <div
                  className="absolute inset-0 bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center"
                  style={{ backfaceVisibility: 'hidden', minHeight: 280 }}
                >
                  <div className="text-[10px] text-violet-400 uppercase tracking-wider mb-4">问题</div>
                  <div className="text-lg text-slate-100 text-center leading-relaxed font-medium">
                    {currentCard.q}
                  </div>
                  <div className="absolute bottom-4 text-[10px] text-slate-600">点击翻转查看答案</div>
                </div>

                {/* Back (Answer) */}
                <div
                  className="bg-slate-800 border border-violet-500/30 rounded-2xl p-8 flex flex-col items-center justify-center"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', minHeight: 280 }}
                >
                  <div className="text-[10px] text-emerald-400 uppercase tracking-wider mb-4">答案</div>
                  <div className="text-sm text-slate-200 text-center leading-relaxed whitespace-pre-wrap">
                    {currentCard.a}
                  </div>
                  <div className="absolute bottom-4 text-[10px] text-slate-600">点击翻回问题</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prevCard}
                disabled={cardIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> 上一张
              </button>
              <div className="flex gap-1">
                {result.flashcards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCardIndex(i); setFlipped(false) }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === cardIndex ? 'bg-violet-500' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextCard}
                disabled={cardIndex === totalCards - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                下一张 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Open in editor */}
            <button
              onClick={() => navigate(`/editor?path=${encodeURIComponent(result.notePath)}`)}
              className="mt-4 w-full py-2 rounded-lg text-xs text-slate-400 bg-slate-900 border border-slate-800 hover:text-slate-200 hover:border-slate-700 transition-colors"
            >
              在编辑器中打开原笔记
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Review Tab ───────────────────────────────────────────────────────────────

function ReviewTab() {
  const navigate = useNavigate()
  const [data, setData] = useState<ReviewDueData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    api.getReviewDue()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const priorityColors = {
    high: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  }

  const priorityLabels = { high: '紧急', medium: '一般', low: '建议' }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400 py-8 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> 分析复习状态...
      </div>
    )
  }

  if (!data || data.reviewQueue.length === 0) {
    return (
      <div className="text-center text-slate-600 py-12">
        <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <div className="text-sm">暂无复习数据</div>
        <button onClick={load} className="mt-3 text-xs text-violet-400 hover:text-violet-300">刷新</button>
      </div>
    )
  }

  const totalDue = data.reviewQueue.reduce((sum, s) => sum + s.dueCount, 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3">
          <div className="text-xs text-slate-500">待复习笔记</div>
          <div className="text-2xl font-bold text-amber-400">{totalDue}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3">
          <div className="text-xs text-slate-500">涉及科目</div>
          <div className="text-2xl font-bold text-violet-400">{data.reviewQueue.filter(s => s.dueCount > 0).length}</div>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="刷新"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Per-subject review lists */}
      {data.reviewQueue.map(subject => (
        <div key={subject.subject} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-800">
            <div className="w-3 h-3 rounded-full" style={{ background: subjectColors[subject.subject] || '#64748b' }} />
            <span className="text-sm font-medium text-slate-200">{subject.subject}</span>
            <span className="text-xs text-slate-500">{subject.totalNotes} 篇笔记</span>
            {subject.dueCount > 0 ? (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                {subject.dueCount} 篇待复习
              </span>
            ) : (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                全部已复习
              </span>
            )}
          </div>

          {subject.dueCount > 0 ? (
            <div className="divide-y divide-slate-800">
              {subject.dueNotes.map(note => (
                <button
                  key={note.path}
                  onClick={() => navigate(`/editor?path=${encodeURIComponent(note.path)}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200 truncate">{note.title}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5 truncate">{note.path}</div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${priorityColors[note.priority]}`}>
                      {priorityLabels[note.priority]}
                    </span>
                    <span className="text-[10px] text-slate-500">{note.daysSinceModified} 天前</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-5 py-4 text-xs text-emerald-400/60">该科目所有笔记均在 3 天内更新过</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Progress Tab ─────────────────────────────────────────────────────────────

function ProgressTab() {
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
      <div className="flex items-center gap-2 text-sm text-slate-400 py-8 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> 统计科目进度...
      </div>
    )
  }

  if (stats.length === 0) {
    return <div className="text-center text-slate-600 py-12 text-sm">暂无科目数据</div>
  }

  const chartData = stats.map(s => ({
    name: s.subject,
    笔记数: s.totalNotes,
    字数: Math.round(s.totalWords / 100) * 100,
  }))

  const totalNotes = stats.reduce((sum, s) => sum + s.totalNotes, 0)
  const totalWords = stats.reduce((sum, s) => sum + s.totalWords, 0)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.subject} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: subjectColors[s.subject] || '#64748b' }} />
              <span className="text-xs text-slate-400">{s.subject}</span>
            </div>
            <div className="text-xl font-bold text-slate-100">{s.totalNotes}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              {s.totalWords.toLocaleString()} 字
              {s.lastModified && ` · ${new Date(s.lastModified).toLocaleDateString('zh-CN')}`}
            </div>
          </div>
        ))}
      </div>

      {/* Total summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 flex items-center gap-6">
        <div>
          <span className="text-xs text-slate-500">总笔记数</span>
          <span className="text-lg font-bold text-slate-100 ml-2">{totalNotes}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500">总字数</span>
          <span className="text-lg font-bold text-slate-100 ml-2">{totalWords.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500">平均每篇</span>
          <span className="text-lg font-bold text-slate-100 ml-2">{totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0}</span>
          <span className="text-xs text-slate-500 ml-1">字</span>
        </div>
      </div>

      {/* Bar chart: note count */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="text-xs text-slate-400 mb-4 font-medium">各科笔记数量对比</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#94a3b8' }}
            />
            <Bar dataKey="笔记数" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={subjectColors[entry.name] || '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart: word count */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="text-xs text-slate-400 mb-4 font-medium">各科字数对比（百字）</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#94a3b8' }}
            />
            <Bar dataKey="字数" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={subjectColors[entry.name] || '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
