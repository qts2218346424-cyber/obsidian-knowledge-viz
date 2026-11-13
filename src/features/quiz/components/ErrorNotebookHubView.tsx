import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  BookOpen,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  Printer,
  Search,
  Filter,
  Tag,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Play,
  Edit3,
  Save,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Clock,
  ArrowUpDown,
  TrendingUp,
  Plus,
  Eye,
  EyeOff,
  Download,
  Wand2,
  Loader2,
} from 'lucide-react'
import {
  api,
  type DetailedErrorQuestion,
  type ErrorNotebookStats,
} from '../../../services/api'
import type { ActiveQuizQuestion } from '../utils/questionTopics'
import { convertErrorToActiveQuestion } from '../utils/errorQuestions'
import MarkdownRenderer from '../../../components/MarkdownRenderer'

interface ErrorNotebookHubViewProps {
  onStartRetest: (questions: ActiveQuizQuestion[], title?: string) => void
  onAskAI?: (question: DetailedErrorQuestion) => void
  onGenerateVariants?: (question: DetailedErrorQuestion) => void | Promise<void>
  generatingVariantId?: string | null
}

const COMMON_SUBJECTS = [
  '全部',
  '高等数学',
  '线性代数',
  '概率统计',
  '数据结构',
  '计算机组成原理',
  '操作系统',
  '计算机网络',
]

const ERROR_REASON_OPTIONS = [
  '全部',
  '概念不清',
  '公式记错',
  '计算失误',
  '审题遗漏',
  '思路阻塞',
  '忽略定理前提',
]

function formatMathInline(raw?: string): string {
  const s = (raw || '').trim()
  if (!s) return ''
  if (s.includes('$')) return s
  if (/\\(?:frac|dfrac|tfrac|sqrt|int|iint|lim|sum|prod|pi|alpha|beta|gamma|theta|infty|ln|log|sin|cos|tan|cdot|times|le|ge|ne)/.test(s)) {
    return `$${s}$`
  }
  return s
}

export default function ErrorNotebookHubView({
  onStartRetest,
  onAskAI,
  onGenerateVariants,
  generatingVariantId,
}: ErrorNotebookHubViewProps) {
  // 数据与加载态
  const [stats, setStats] = useState<ErrorNotebookStats | null>(null)
  const [errors, setErrors] = useState<DetailedErrorQuestion[]>([])
  const [localGeneratingId, setLocalGeneratingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // 筛选与搜索
  const [subjectFilter, setSubjectFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'mastered'>('active')
  const [errorTypeFilter, setErrorTypeFilter] = useState('全部')
  const [searchKw, setSearchKw] = useState('')
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'reviews_asc'>('date_desc')

  // 批量与交互状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set())
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [notesInput, setNotesInput] = useState('')
  const [batchLoading, setBatchLoading] = useState(false)

  // 卡片内现场即时测试状态
  const [inPlaceTests, setInPlaceTests] = useState<
    Record<string, { selectedOption: string | null; isSubmitted: boolean; isCorrect: boolean }>
  >({})

  // 打印导出模态
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [printMode, setPrintMode] = useState<'blank' | 'full'>('blank')

  // 遮挡答案速刷模式
  const [blindMode, setBlindMode] = useState(false)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())

  // 手动 / AI 快捷录入新错题弹窗
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addTab, setAddTab] = useState<'manual' | 'ai_text'>('manual')
  const [rawPasteText, setRawPasteText] = useState('')
  const [aiParsing, setAiParsing] = useState(false)
  const [savingManual, setSavingManual] = useState(false)
  const [newForm, setNewForm] = useState({
    subject: '高等数学',
    chapter: '',
    question: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    userAnswer: '',
    correctAnswer: '',
    errorType: '概念不清',
    explanation: '',
    notes: '',
  })

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, listRes] = await Promise.all([
        api.getErrorNotebookStats().catch(() => null),
        api.getErrorNotebookList({
          subject: subjectFilter !== '全部' ? subjectFilter : undefined,
          status: statusFilter,
          errorType: errorTypeFilter !== '全部' ? errorTypeFilter : undefined,
        }).catch(() => null),
      ])

      if (statsRes?.stats) {
        setStats(statsRes.stats)
      }
      if (listRes?.errors) {
        setErrors(listRes.errors)
      }
    } catch (err: any) {
      console.error('加载错题数据失败:', err)
    } finally {
      setLoading(false)
    }
  }, [subjectFilter, statusFilter, errorTypeFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 扫描同步 Vault 错题
  const handleSyncVault = async () => {
    setSyncing(true)
    try {
      const res = await api.syncVaultErrors()
      if (res.success) {
        showToast(`✅ 成功从知识库同步扫描，激活导入 ${res.importedCount} 道错题！`)
        await loadData()
      }
    } catch (err: any) {
      showToast('❌ 同步知识库失败，请稍后重试')
    } finally {
      setSyncing(false)
    }
  }

  // 切换单个错题掌握状态
  const handleToggleStatus = async (item: DetailedErrorQuestion) => {
    const newStatus = item.status === 'mastered' ? 'active' : 'mastered'
    try {
      await api.updateErrorNotebookQuestion(item.id, { status: newStatus })
      setErrors((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, status: newStatus } : e))
      )
      // 刷新数据概况
      api.getErrorNotebookStats().then((res) => res?.stats && setStats(res.stats))
      showToast(
        newStatus === 'mastered'
          ? '🎉 太棒了！本题已斩杀标记为【彻底掌握】！'
          : '🔄 已重置为【待攻克】，随时可以重新练习'
      )
    } catch {
      showToast('❌ 更新状态失败')
    }
  }

  // 修改单个错题错因分类
  const handleChangeErrorType = async (item: DetailedErrorQuestion, newType: string) => {
    try {
      await api.updateErrorNotebookQuestion(item.id, { errorType: newType })
      setErrors((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, errorType: newType } : e))
      )
      api.getErrorNotebookStats().then((res) => res?.stats && setStats(res.stats))
      showToast(`已更新错因分类为「${newType}」`)
    } catch {
      showToast('❌ 修改错因失败')
    }
  }

  // 保存心得笔记
  const handleSaveNotes = async (id: string) => {
    try {
      await api.updateErrorNotebookQuestion(id, { notes: notesInput })
      setErrors((prev) =>
        prev.map((e) => (e.id === id ? { ...e, notes: notesInput } : e))
      )
      setEditingNotesId(null)
      showToast('✅ 错题反思心得已保存并同步')
    } catch {
      showToast('❌ 保存失败')
    }
  }

  // 删除单题
  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('确定要将此错题从错题本中移除吗？')) return
    try {
      await api.deleteErrorNotebookQuestion(id)
      setErrors((prev) => prev.filter((e) => e.id !== id))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      api.getErrorNotebookStats().then((res) => res?.stats && setStats(res.stats))
      showToast('已从错题本移除')
    } catch {
      showToast('❌ 删除失败')
    }
  }

  // 批量操作
  const handleBatchAction = async (action: 'mastered' | 'active' | 'delete') => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    if (action === 'delete') {
      if (!window.confirm(`确定要批量删除已选中的 ${ids.length} 道错题吗？`)) return
    }

    setBatchLoading(true)
    try {
      if (action === 'delete') {
        await api.batchUpdateErrorNotebook({ ids, action: 'delete' })
        setErrors((prev) => prev.filter((e) => !selectedIds.has(e.id)))
        showToast(`已批量移除 ${ids.length} 道错题`)
      } else {
        await api.batchUpdateErrorNotebook({
          ids,
          action: 'update_status',
          status: action,
        })
        setErrors((prev) =>
          prev.map((e) => (selectedIds.has(e.id) ? { ...e, status: action } : e))
        )
        showToast(
          action === 'mastered'
            ? `🎉 已成功将 ${ids.length} 道错题批量标记为【已掌握】！`
            : `🔄 已重置 ${ids.length} 道错题为【待攻克】！`
        )
      }
      setSelectedIds(new Set())
      api.getErrorNotebookStats().then((res) => res?.stats && setStats(res.stats))
    } catch {
      showToast('❌ 批量操作失败')
    } finally {
      setBatchLoading(false)
    }
  }

  // 卡片内现场测试作答
  const handleInPlaceOptionClick = (id: string, optKey: string) => {
    setInPlaceTests((prev) => ({
      ...prev,
      [id]: { selectedOption: optKey, isSubmitted: false, isCorrect: false },
    }))
  }

  const handleInPlaceSubmit = (item: DetailedErrorQuestion) => {
    const currentTest = inPlaceTests[item.id]
    if (!currentTest?.selectedOption) return

    const isCorrect =
      currentTest.selectedOption.trim().toUpperCase() ===
      item.correctAnswer.trim().toUpperCase()

    setInPlaceTests((prev) => ({
      ...prev,
      [item.id]: {
        selectedOption: currentTest.selectedOption,
        isSubmitted: true,
        isCorrect,
      },
    }))

    if (isCorrect) {
      showToast('🎉 太厉害了！现场重测回答正确，建议顺手斩杀标记掌握！')
    } else {
      showToast('❌ 依然回答错误，不要灰心，查看解析强化薄弱点！')
    }
  }

  // 过滤后的错题列表
  const filteredErrors = useMemo(() => {
    let list = [...errors]
    if (searchKw.trim()) {
      const kw = searchKw.trim().toLowerCase()
      list = list.filter(
        (e) =>
          e.question.toLowerCase().includes(kw) ||
          e.explanation.toLowerCase().includes(kw) ||
          (e.notes && e.notes.toLowerCase().includes(kw)) ||
          e.subject.toLowerCase().includes(kw) ||
          e.chapter.toLowerCase().includes(kw)
      )
    }

    if (sortBy === 'date_desc') {
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    } else if (sortBy === 'date_asc') {
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    } else if (sortBy === 'reviews_asc') {
      list.sort((a, b) => (a.sm2?.reviewCount || 0) - (b.sm2?.reviewCount || 0))
    }
    return list
  }, [errors, searchKw, sortBy])

  // 发起重测（全部当前筛选题目 或 选中的题目）
  const handleLaunchRetest = (targetQuestions: DetailedErrorQuestion[], title?: string) => {
    if (targetQuestions.length === 0) {
      showToast('暂无符合条件的错题可供重练')
      return
    }
    const converted = targetQuestions.map(convertErrorToActiveQuestion)
    onStartRetest(converted, title || '📕 错题靶向突击重练卷')
  }

  // 全选/反选
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredErrors.length && filteredErrors.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredErrors.map((e) => e.id)))
    }
  }

  // 展开/收起全部解析
  const handleToggleExpandAll = () => {
    if (expandedCardIds.size === filteredErrors.length && filteredErrors.length > 0) {
      setExpandedCardIds(new Set())
    } else {
      setExpandedCardIds(new Set(filteredErrors.map((e) => e.id)))
    }
  }

  // AI 从粘贴文本中解析提取题目填充表单
  const handleAiParseToForm = async () => {
    if (!rawPasteText.trim() || rawPasteText.trim().length < 5) {
      showToast('请先粘贴需要提取的错题文本内容')
      return
    }
    setAiParsing(true)
    try {
      const domain = ['高等数学', '线性代数', '概率统计'].includes(newForm.subject) ? 'math' : 'cs_408'
      const res = await api.parseQuizText({
        text: rawPasteText.trim(),
        domain,
        subject: newForm.subject,
      })
      const firstQ = res?.questions?.[0]
      if (!firstQ) {
        showToast('未能解析出有效题目结构，请检查粘贴文本或改用手动填写')
        return
      }
      setNewForm((prev) => ({
        ...prev,
        subject: firstQ.subject || prev.subject,
        chapter: firstQ.chapter || prev.chapter,
        question: firstQ.question || '',
        optA: firstQ.options?.A || '',
        optB: firstQ.options?.B || '',
        optC: firstQ.options?.C || '',
        optD: firstQ.options?.D || '',
        correctAnswer: firstQ.answer || '',
        explanation: firstQ.explanation || '',
      }))
      setAddTab('manual')
      showToast('✨ AI 已自动提炼出题干、选项与解析！请补充「你的错答」后保存')
    } catch (err: any) {
      showToast(`❌ AI 解析失败: ${err?.message || '请检查 AI 模型配置'}`)
    } finally {
      setAiParsing(false)
    }
  }

  // 保存手动/解析录入的错题
  const handleSaveNewError = async () => {
    if (!newForm.question.trim() || !newForm.correctAnswer.trim()) {
      showToast('请至少填写【题干内容】与【标准答案】')
      return
    }
    setSavingManual(true)
    try {
      const hasOpts = Boolean(newForm.optA.trim() || newForm.optB.trim())
      const options = hasOpts
        ? {
            A: newForm.optA.trim(),
            B: newForm.optB.trim(),
            C: newForm.optC.trim(),
            D: newForm.optD.trim(),
          }
        : undefined
      const domain = ['高等数学', '线性代数', '概率统计'].includes(newForm.subject) ? 'math' : 'cs_408'
      await api.saveErrorQuestion({
        question: {
          id: `manual-${Date.now()}`,
          domain,
          subject: newForm.subject,
          chapter: newForm.chapter.trim() || '手工录入专题',
          type: hasOpts ? 'choice' : 'blank',
          difficulty: '中等',
          question: newForm.question.trim(),
          options,
          answer: newForm.correctAnswer.trim(),
          explanation: newForm.explanation.trim() || '暂未填写详细解析，可后续补充或呼出 AI 答疑。',
        },
        userAnswer: newForm.userAnswer.trim() || '未记录',
        errorType: newForm.errorType,
        notes: newForm.notes.trim(),
      })
      window.dispatchEvent(new CustomEvent('daily-errors-updated'))
      setAddModalOpen(false)
      setRawPasteText('')
      setNewForm({
        subject: '高等数学',
        chapter: '',
        question: '',
        optA: '',
        optB: '',
        optC: '',
        optD: '',
        userAnswer: '',
        correctAnswer: '',
        errorType: '概念不清',
        explanation: '',
        notes: '',
      })
      showToast('🎉 新错题已成功录入错题攻克中心并同步 Obsidian！')
      await loadData()
    } catch (err: any) {
      showToast(`❌ 保存失败: ${err?.message || '未知错误'}`)
    } finally {
      setSavingManual(false)
    }
  }

  // 导出为 Markdown 文件下载
  const handleExportMarkdown = () => {
    const targetList =
      selectedIds.size > 0
        ? filteredErrors.filter((e) => selectedIds.has(e.id))
        : filteredErrors
    if (targetList.length === 0) {
      showToast('当前没有可导出的错题')
      return
    }
    const today = new Date().toISOString().split('T')[0]
    const mdLines = [
      `# 考研错题攻克精编清册 (${today})`,
      `> 筛选条件：科目=${subjectFilter} | 状态=${statusFilter} | 错因=${errorTypeFilter} | 共 ${targetList.length} 题\n`,
    ]
    targetList.forEach((q, idx) => {
      mdLines.push(`## ${idx + 1}. [${q.subject}${q.chapter ? ` · ${q.chapter}` : ''}] (${q.errorType || '概念不清'})`)
      mdLines.push(`**题干**：\n${q.question}\n`)
      if (q.options && Object.keys(q.options).length > 0) {
        Object.entries(q.options).forEach(([k, v]) => {
          mdLines.push(`- **${k}**. ${v}`)
        })
        mdLines.push('')
      }
      mdLines.push(`- ❌ **当时作答**：\`${q.userAnswer || '未作答'}\``)
      mdLines.push(`- ✅ **标准答案**：\`${q.correctAnswer}\``)
      if (q.explanation) mdLines.push(`\n**标准解析**：\n${q.explanation}`)
      if (q.notes) mdLines.push(`\n> 💡 **避坑反思**：${q.notes}`)
      mdLines.push('\n---\n')
    })

    const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `错题清册-${subjectFilter}-${today}.md`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`✅ 已导出 ${targetList.length} 道错题为 Markdown 清册`)
  }

  const activeCount = stats?.active ?? errors.filter((e) => e.status !== 'mastered').length
  const masteredCount = stats?.mastered ?? errors.filter((e) => e.status === 'mastered').length
  const totalCount = stats?.total ?? errors.length
  const dueCount = stats?.dueToday ?? 0
  const masteryPercentage =
    totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* 消息 Toast 浮动条 */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-neutral-900/95 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium backdrop-blur-md border border-neutral-700 animate-in fade-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── 模块 1：全景数据看板 (Hero KPI Matrix) ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {/* KPI 1: 待攻克错题 */}
        <div className="bento-card rounded-2xl border border-rose-200/90 bg-gradient-to-br from-rose-50/70 via-white to-orange-50/40 p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-rose-600 mb-1">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              🔥 待攻克错题
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
              急需歼灭
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
              {activeCount}
            </span>
            <span className="text-xs text-slate-500">道考点薄弱题</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>错题消灭进度</span>
              <strong className="text-rose-600 font-mono">{masteryPercentage}%</strong>
            </div>
            <div className="h-2 w-full bg-rose-100/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: 已斩杀掌握 */}
        <div className="bento-card rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 mb-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              🏆 已斩杀彻底掌握
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              战绩硕果
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
              {masteredCount}
            </span>
            <span className="text-xs text-slate-500">道已彻底攻克</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
            连续重练通过，知识漏洞已被补全。
          </p>
        </div>

        {/* KPI 3: 今日艾宾浩斯复盘 */}
        <div className="bento-card rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/40 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-600 mb-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              ⏰ 今日到期复盘
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              艾宾浩斯
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
              {dueCount}
            </span>
            <span className="text-xs text-slate-500">道题目临界巩固</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
            按科学记忆周期提示，今日强化效果翻倍。
          </p>
        </div>

        {/* KPI 4: 错因诊断分布 */}
        <div className="bento-card rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              📊 错因病灶画像
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              总收录 {totalCount} 题
            </span>
          </div>
          <div className="space-y-1.5 my-auto py-1">
            {stats &&
              Object.entries(stats.errorTypeBreakdown)
                .slice(0, 3)
                .map(([type, count]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setErrorTypeFilter(errorTypeFilter === type ? '全部' : type)}
                    className={`w-full flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                      errorTypeFilter === type
                        ? 'bg-rose-50 text-rose-700 font-bold'
                        : 'hover:bg-slate-50'
                    }`}
                    title={`点击筛选错因为「${type}」的错题`}
                  >
                    <span className="text-slate-600 truncate max-w-[120px]">{type}</span>
                    <span className="font-mono font-bold text-slate-800">{count} 题</span>
                  </button>
                ))}
            {(!stats || Object.keys(stats.errorTypeBreakdown).length === 0) && (
              <div className="text-[11px] text-slate-400">暂无错因分类数据</div>
            )}
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              onClick={handleSyncVault}
              disabled={syncing}
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? '正在扫描...' : '扫描同步知识库'}</span>
            </button>
            <span className="text-[10px] text-slate-400">点击错因可快筛</span>
          </div>
        </div>
      </div>

      {/* ── 模块 2：核心攻克指挥台 (Action Command Bar) ── */}
      <div className="bento-card rounded-2xl border border-neutral-200/85 bg-white p-3.5 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* 一键今日错题重测 */}
          <button
            type="button"
            onClick={() => {
              const dueOrActive = errors.filter((e) => e.status !== 'mastered')
              handleLaunchRetest(dueOrActive.slice(0, 15), '⚡ 今日待攻克错题突击卷')
            }}
            disabled={activeCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-neutral-900 hover:bg-black text-white shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>⚡ 今日错题重测 (前 15 题)</span>
          </button>

          {/* 筛选组卷重做 */}
          <button
            type="button"
            onClick={() => handleLaunchRetest(filteredErrors, '🎯 专项筛选错题攻克卷')}
            disabled={filteredErrors.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4 text-indigo-600" />
            <span>🎯 组装重测卷 ({filteredErrors.length} 题)</span>
          </button>

          {/* 手动 / AI 快捷录入新错题 */}
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
            title="录入纸质练习册或外部截取的错题，支持 AI 一键解析提炼"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>➕ 录入新错题</span>
          </button>

          {/* 打印排版导出 */}
          <button
            type="button"
            onClick={() => setPrintModalOpen(true)}
            disabled={filteredErrors.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="生成排版美观的高清试卷或精讲错题集，支持离线打印或存为 PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>🖨️ 打印刷题纸</span>
          </button>

          {/* 导出 Markdown 清册 */}
          <button
            type="button"
            onClick={handleExportMarkdown}
            disabled={filteredErrors.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="导出精编 Markdown 错题清册，方便离线归档或打印分享"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>导出 MD</span>
          </button>
        </div>

        {/* 快速视图控制 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setBlindMode((v) => !v)
              setRevealedIds(new Set())
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
              blindMode
                ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
            title="开启后默认遮挡正确答案与错选标识，适合背题速刷检验记忆"
          >
            {blindMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{blindMode ? '遮挡速刷中' : '遮挡速刷模式'}</span>
          </button>

          <button
            onClick={handleToggleExpandAll}
            className="text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer"
          >
            {expandedCardIds.size === filteredErrors.length && filteredErrors.length > 0
              ? '折叠全部解析'
              : '展开全部解析'}
          </button>
          <button
            onClick={handleToggleSelectAll}
            className="text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer"
          >
            {selectedIds.size === filteredErrors.length && filteredErrors.length > 0
              ? '取消全选'
              : '一键全选'}
          </button>
        </div>
      </div>

      {/* ── 模块 3：专业多维检索与筛选过滤矩阵 ── */}
      <div className="bento-card rounded-2xl border border-neutral-200/85 bg-white p-4 shadow-xs space-y-3.5">
        {/* 学科筛选 Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> 科目:
          </span>
          {COMMON_SUBJECTS.map((subj) => {
            const active = subjectFilter === subj
            return (
              <button
                key={subj}
                type="button"
                onClick={() => setSubjectFilter(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-neutral-900 text-white font-bold shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/70 hover:bg-slate-100'
                }`}
              >
                {subj}
              </button>
            )
          })}
        </div>

        {/* 状态与错因混合筛选栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {/* 掌握度状态 */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/80 text-xs">
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔥 待攻克 ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('mastered')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'mastered'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✅ 已斩杀 ({masteredCount})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部 ({totalCount})
              </button>
            </div>

            {/* 错因下拉筛选 */}
            <div className="flex items-center gap-1.5 text-xs">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={errorTypeFilter}
                onChange={(e) => setErrorTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-400 cursor-pointer"
              >
                {ERROR_REASON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    错因: {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* 排序方式 */}
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="date_desc">最近错题优先</option>
                <option value="date_asc">最早错题优先</option>
                <option value="reviews_asc">复习次数少优先</option>
              </select>
            </div>
          </div>

          {/* 实时搜索 */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              placeholder="搜索题干、考点、反思心得..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-400 transition-colors"
            />
            {searchKw && (
              <button
                onClick={() => setSearchKw('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 模块 4：批量操作浮动工具坞 (Batch Floating Dock) ── */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-40 bento-card rounded-2xl border-2 border-indigo-400 bg-neutral-900 text-white p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>已勾选 {selectedIds.size} 道错题</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const selectedList = errors.filter((e) => selectedIds.has(e.id))
                handleLaunchRetest(selectedList, `🎯 选定 ${selectedIds.size} 题专属重练卷`)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-neutral-900 hover:bg-amber-300 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>以此组卷重做</span>
            </button>

            <button
              onClick={() => handleBatchAction('mastered')}
              disabled={batchLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>标记已斩杀</span>
            </button>

            <button
              onClick={() => handleBatchAction('active')}
              disabled={batchLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-slate-200 border border-neutral-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置待攻克</span>
            </button>

            <button
              onClick={() => handleBatchAction('delete')}
              disabled={batchLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/30 text-rose-300 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批量移除</span>
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              取消勾选
            </button>
          </div>
        </div>
      )}

      {/* ── 模块 5：错题列表展现与沉浸卡片 ── */}
      {loading ? (
        <div className="bento-card rounded-2xl border border-neutral-200/80 bg-white p-12 text-center text-xs text-slate-500 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
          <p>正在从知识库调取错题全量病灶档案...</p>
        </div>
      ) : filteredErrors.length === 0 ? (
        /* 空状态与激励 */
        <div className="bento-card rounded-2xl border border-neutral-200/80 bg-white p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto shadow-xs border border-emerald-100">
            🎉
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {statusFilter === 'active'
                ? '太棒了！当前分类下暂无待攻克的错题！'
                : '没有找到符合条件的错题记录'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              做题时答错的题目会自动沉淀在此处。坚持每日复盘，消灭盲区！
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-black text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> 录入新错题
            </button>
            <button
              type="button"
              onClick={handleSyncVault}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              从 Obsidian 扫描已有错题
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredErrors.map((item, idx) => {
            const isSelected = selectedIds.has(item.id)
            const isExpanded = expandedCardIds.has(item.id)
            const isMastered = item.status === 'mastered'
            const isEditingNotes = editingNotesId === item.id
            const testState = inPlaceTests[item.id]
            const options = item.options || {}
            const hasOptions = Object.keys(options).length > 0
            const isBlindHidden = blindMode && !revealedIds.has(item.id) && !testState

            return (
              <div
                key={item.id}
                className={`bento-card rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50/20 shadow-md ring-2 ring-indigo-200'
                    : isMastered
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : 'border-neutral-200/90 bg-white shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* 卡片头部 */}
                <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* 勾选框 */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const next = new Set(selectedIds)
                        if (e.target.checked) next.add(item.id)
                        else next.delete(item.id)
                        setSelectedIds(next)
                      }}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />

                    {/* 序号与学科 */}
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
                      {item.subject}
                    </span>
                    {item.chapter && (
                      <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {item.chapter}
                      </span>
                    )}

                    {/* 错因分类可原地切换胶囊 */}
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                      <Tag className="w-3 h-3 shrink-0" />
                      <select
                        value={item.errorType || '概念不清'}
                        onChange={(e) => handleChangeErrorType(item, e.target.value)}
                        className="bg-transparent outline-none cursor-pointer font-semibold text-rose-600"
                        title="点击即可重新归因本题错因"
                      >
                        {ERROR_REASON_OPTIONS.filter((r) => r !== '全部').map((r) => (
                          <option key={r} value={r} className="text-slate-800 bg-white">
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 状态指示 */}
                    {isMastered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> 已斩杀掌握
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700">
                        <Flame className="w-3 h-3 text-amber-600" /> 待攻克
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" /> {item.createdAt}
                    </span>
                    {item.sm2 && item.sm2.reviewCount > 0 && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        复盘 {item.sm2.reviewCount} 次
                      </span>
                    )}
                  </div>
                </div>

                {/* 题干内容 */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed quiz-stem-scroll">
                    <MarkdownRenderer content={item.question} />
                  </div>

                  {/* 选项区 / 现场重测作答交互 */}
                  {hasOptions && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {Object.entries(options).map(([optKey, optText]) => {
                        const isUserAnswer =
                          item.userAnswer?.trim().toUpperCase() === optKey.toUpperCase()
                        const isCorrectAnswer =
                          item.correctAnswer?.trim().toUpperCase() === optKey.toUpperCase()
                        const isTestedOption = testState?.selectedOption === optKey

                        // 如果正在进行现场重测
                        if (testState && !testState.isSubmitted) {
                          return (
                            <button
                              key={optKey}
                              type="button"
                              onClick={() => handleInPlaceOptionClick(item.id, optKey)}
                              className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-2 cursor-pointer ${
                                isTestedOption
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500 font-bold'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center font-bold text-[11px] shrink-0">
                                {optKey}
                              </span>
                              <span className="flex-1 leading-snug">
                                <MarkdownRenderer content={formatMathInline(optText)} inline />
                              </span>
                            </button>
                          )
                        }

                        // 如果现场重测已提交
                        if (testState && testState.isSubmitted) {
                          const optCorrect = isCorrectAnswer
                          const optWrongChoice = isTestedOption && !isCorrectAnswer
                          return (
                            <div
                              key={optKey}
                              className={`p-3 rounded-xl border text-left text-xs font-medium flex items-start gap-2 ${
                                optCorrect
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold'
                                  : optWrongChoice
                                  ? 'border-rose-300 bg-rose-50 text-rose-900 line-through'
                                  : 'border-slate-200 bg-slate-50/50 text-slate-500'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-md bg-white border flex items-center justify-center font-bold text-[11px] shrink-0">
                                {optKey}
                              </span>
                              <span className="flex-1 leading-snug">
                                <MarkdownRenderer content={formatMathInline(optText)} inline />
                              </span>
                              {optCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                            </div>
                          )
                        }

                        // 遮挡速刷模式：隐藏对错标识
                        if (isBlindHidden) {
                          return (
                            <div
                              key={optKey}
                              className="p-2.5 sm:p-3 rounded-xl border border-slate-200/80 bg-white text-slate-700 text-xs flex items-start gap-2"
                            >
                              <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                                {optKey}
                              </span>
                              <div className="flex-1 min-w-0 leading-snug">
                                <MarkdownRenderer content={formatMathInline(optText)} inline />
                              </div>
                            </div>
                          )
                        }

                        // 默认展示态（标红用户当时的错误作答，标绿正确答案）
                        return (
                          <div
                            key={optKey}
                            className={`p-2.5 sm:p-3 rounded-xl border text-xs flex items-start gap-2 transition-colors ${
                              isCorrectAnswer
                                ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-bold'
                                : isUserAnswer
                                ? 'border-rose-300 bg-rose-50/70 text-rose-900 font-medium'
                                : 'border-slate-200/80 bg-white text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                isCorrectAnswer
                                  ? 'bg-emerald-600 text-white'
                                  : isUserAnswer
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {optKey}
                            </span>
                            <div className="flex-1 min-w-0 leading-snug">
                              <MarkdownRenderer content={formatMathInline(optText)} inline />
                            </div>
                            {isCorrectAnswer && (
                              <span className="text-[10px] text-emerald-700 font-bold shrink-0">
                                标准答案
                              </span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span className="text-[10px] text-rose-600 font-bold shrink-0">
                                当时错选
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* 遮挡速刷模式揭晓答案引导条 */}
                  {isBlindHidden && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
                      <span className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                        遮挡速刷中，请先在脑中推演思路后再核对答案
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRevealedIds((prev) => new Set(prev).add(item.id))
                          setExpandedCardIds((prev) => new Set(prev).add(item.id))
                        }}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" /> 揭晓答案与解析
                      </button>
                    </div>
                  )}

                  {/* 现场重测提交控制条 */}
                  {testState && !testState.isSubmitted && (
                    <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
                      <span className="text-xs text-indigo-700 font-medium">
                        已进入现场重测模式，请选择答案后提交检验：
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleInPlaceSubmit(item)}
                          disabled={!testState.selectedOption}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                          提交检验
                        </button>
                        <button
                          onClick={() =>
                            setInPlaceTests((prev) => {
                              const next = { ...prev }
                              delete next[item.id]
                              return next
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium cursor-pointer"
                        >
                          退出测试
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 作答对照条 (仅非选择题或直接对比，遮挡模式下隐去答案) */}
                  {!hasOptions && !isBlindHidden && (
                    <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="text-rose-600 font-semibold flex items-center gap-1">
                        <span>你的作答:</span>
                        <code className="bg-white px-2 py-0.5 rounded border border-rose-200 font-mono">
                          {item.userAnswer || '未填写'}
                        </code>
                      </div>
                      <div className="text-emerald-700 font-bold flex items-center gap-1">
                        <span>标准正确答案:</span>
                        <code className="bg-white px-2 py-0.5 rounded border border-emerald-200 font-mono">
                          {item.correctAnswer}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* 详尽解析推导展开区 */}
                  {isExpanded && !isBlindHidden && (
                    <div className="space-y-3 pt-2 animate-in fade-in">
                      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                          <span>分步推导解析与考点精析：</span>
                        </div>
                        <MarkdownRenderer content={item.explanation || '暂无详细步骤解析'} />
                      </div>

                      {/* 错因反思随笔区 */}
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                            <span>避坑心得与错因反思笔记</span>
                          </span>
                          {!isEditingNotes && (
                            <button
                              onClick={() => {
                                setEditingNotesId(item.id)
                                setNotesInput(item.notes || '')
                              }}
                              className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" /> 编辑随笔
                            </button>
                          )}
                        </div>

                        {isEditingNotes ? (
                          <div className="space-y-2">
                            <textarea
                              value={notesInput}
                              onChange={(e) => setNotesInput(e.target.value)}
                              placeholder="写下本题犯错的思维障碍（如：没有考虑到除数不能为0、极限未化简直接套公式...）"
                              rows={3}
                              className="w-full text-xs bg-white border border-amber-300 rounded-xl p-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleSaveNotes(item.id)}
                                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Save className="w-3 h-3" /> 保存笔记
                              </button>
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium cursor-pointer"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-900/90 leading-relaxed">
                            {item.notes ? (
                              <span className="font-medium">{item.notes}</span>
                            ) : (
                              <span className="text-amber-700/60 italic">
                                暂未记录反思心得。点击上方「编辑随笔」记录避坑要点。
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 卡片底栏操作区 */}
                <div className="px-4 sm:px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* 展开/收起解析按钮 */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = new Set(expandedCardIds)
                        if (isExpanded) next.delete(item.id)
                        else next.add(item.id)
                        setExpandedCardIds(next)
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/80 transition-all cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" /> 收起解析
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" /> 查看解析 & 反思
                        </>
                      )}
                    </button>

                    {/* 现场重做测试按钮 */}
                    {!testState && hasOptions && (
                      <button
                        type="button"
                        onClick={() =>
                          setInPlaceTests((prev) => ({
                            ...prev,
                            [item.id]: {
                              selectedOption: null,
                              isSubmitted: false,
                              isCorrect: false,
                            },
                          }))
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-indigo-600" />
                        <span>现场重测</span>
                      </button>
                    )}

                    {/* 追问 AI */}
                    {onAskAI && (
                      <button
                        type="button"
                        onClick={() => onAskAI(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer"
                        title="唤起双核 AI 伴学助手深度启发指导"
                      >
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span>AI 深度答疑</span>
                      </button>
                    )}

                    {/* 变式题强化 */}
                    {onGenerateVariants && (() => {
                      const isGeneratingThis =
                        (generatingVariantId && (generatingVariantId === item.id || generatingVariantId === `err-${item.id}`)) ||
                        localGeneratingId === item.id
                      return (
                        <button
                          type="button"
                          disabled={Boolean(isGeneratingThis)}
                          onClick={async () => {
                            if (isGeneratingThis) return
                            setLocalGeneratingId(item.id)
                            try {
                              await onGenerateVariants(item)
                            } finally {
                              setLocalGeneratingId(null)
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            isGeneratingThis
                              ? 'bg-sky-100 text-sky-800 border-sky-300 cursor-wait shadow-xs'
                              : 'text-sky-700 bg-sky-50 hover:bg-sky-100 border-sky-200 cursor-pointer active:scale-95'
                          }`}
                          title={isGeneratingThis ? 'AI 正在深度命制变式题...' : '基于此题考点让 AI 变异生成新考法'}
                        >
                          {isGeneratingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                              <span>AI 命制中...</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3 text-sky-600" />
                              <span>生成变式题</span>
                            </>
                          )}
                        </button>
                      )
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 斩杀 / 重置掌握按钮 */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isMastered
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          : 'bg-neutral-900 hover:bg-black text-white shadow-2xs'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isMastered ? '已掌握 (点击重置)' : '斩杀标记已掌握'}</span>
                    </button>

                    {/* 移除 */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="从错题本移除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── 模块 6：专业排版打印 / 导出做题卷模态弹窗 ── */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* 弹窗顶栏 */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  错题打印与导出专用排版
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono">
                  共 {filteredErrors.length} 道
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 模式切换 */}
                <div className="inline-flex rounded-xl p-1 bg-slate-200 text-xs">
                  <button
                    onClick={() => setPrintMode('blank')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      printMode === 'blank'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    📄 空白重测卷 (无答案留白)
                  </button>
                  <button
                    onClick={() => setPrintMode('full')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      printMode === 'full'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    📖 全解复盘集 (含名师推导)
                  </button>
                </div>

                <button
                  onClick={() => setPrintModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 试卷排版预览视窗 */}
            <div
              id="printable-quiz-paper"
              className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-slate-900 font-sans"
            >
              {/* 试卷大标题头 */}
              <div className="text-center pb-4 border-b-2 border-slate-900 space-y-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-slate-900">
                  2026 考研错题靶向突击训练重测卷
                </h1>
                <div className="text-xs text-slate-600 flex items-center justify-center gap-6">
                  <span>科目：{subjectFilter === '全部' ? '综合强化' : subjectFilter}</span>
                  <span>题目数量：{filteredErrors.length} 题</span>
                  <span>生成日期：{new Date().toISOString().split('T')[0]}</span>
                  <span>模式：{printMode === 'blank' ? '闭卷作答测验' : '详尽复盘研读'}</span>
                </div>
                <div className="flex items-center justify-center gap-8 text-xs pt-1 text-slate-500 font-serif">
                  <span>姓名：____________</span>
                  <span>得分：____________</span>
                  <span>用时：____________</span>
                </div>
              </div>

              {/* 试卷题目列表 */}
              <div className="space-y-6">
                {filteredErrors.map((q, index) => {
                  const opts = q.options || {}
                  const hasOpts = Object.keys(opts).length > 0
                  return (
                    <div
                      key={q.id}
                      className="space-y-3 pb-5 border-b border-dashed border-slate-200 break-inside-avoid"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-sm sm:text-base font-mono shrink-0">
                          {index + 1}.
                        </span>
                        <div className="text-sm sm:text-base leading-relaxed flex-1">
                          <MarkdownRenderer content={q.question} />
                        </div>
                      </div>

                      {/* 选项区 */}
                      {hasOpts && (
                        <div className="grid grid-cols-2 gap-2 pl-6 text-xs sm:text-sm">
                          {Object.entries(opts).map(([k, v]) => (
                            <div key={k} className="flex items-start gap-1.5">
                              <span className="font-bold">({k})</span>
                              <span>
                                <MarkdownRenderer content={formatMathInline(v)} inline />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 空白卷：留白草稿作答区 */}
                      {printMode === 'blank' && (
                        <div className="pl-6 pt-2">
                          <div className="h-20 sm:h-24 border border-dashed border-slate-300 rounded-lg p-2 text-[10px] text-slate-400">
                            【作答与草稿区域】：
                          </div>
                        </div>
                      )}

                      {/* 全解卷：展示答案与推导 */}
                      {printMode === 'full' && (
                        <div className="pl-6 pt-2 space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="font-bold text-emerald-700">
                            【参考答案】：{q.correctAnswer}
                            <span className="text-rose-600 ml-4 font-normal">
                              (当时作答: {q.userAnswer || '未填写'})
                            </span>
                            <span className="text-slate-500 ml-4 font-normal">
                              [诊断: {q.errorType || '概念不清'}]
                            </span>
                          </div>
                          <div className="text-slate-800">
                            <span className="font-semibold">【分步解析】：</span>
                            <MarkdownRenderer content={q.explanation || '详见教材通法'} />
                          </div>
                          {q.notes && (
                            <div className="text-amber-800 italic">
                              <span className="font-semibold">【个人反思】：</span>
                              {q.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 空白卷卷末：附录参考答案 */}
              {printMode === 'blank' && (
                <div className="pt-8 border-t-2 border-slate-900 break-before-page space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    附录：本试卷参考答案与速查表
                  </h3>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 text-xs">
                    {filteredErrors.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-1.5 border border-slate-200 rounded text-center"
                      >
                        <span className="font-mono text-slate-400 block text-[10px]">
                          #{idx + 1}
                        </span>
                        <strong className="font-mono text-slate-800">
                          {q.correctAnswer}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 弹窗底栏操作 */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                💡 提示：点击“直接打印”，浏览器将弹出打印窗口，可选择纸张大小或另存为 PDF。
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>直接打印试卷 / 存为 PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 打印专用媒体样式：隔离弹窗以外的所有元素，确保输出纯净 A4 试卷排版 */}
      {printModalOpen && (
        <style>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #printable-quiz-paper, #printable-quiz-paper * {
              visibility: visible !important;
            }
            #printable-quiz-paper {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              overflow: visible !important;
              max-height: none !important;
            }
          }
        `}</style>
      )}

      {/* ── 模块 7：手动 / AI 智能录入新错题模态弹窗 ── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* 顶栏 */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  录入纸质 / 外部错题至攻克中心
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 录入模式切换 */}
            <div className="px-5 pt-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setAddTab('manual')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  addTab === 'manual'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ✍️ 手工表单填报
              </button>
              <button
                type="button"
                onClick={() => setAddTab('ai_text')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                  addTab === 'ai_text'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>✨ AI 文本一键提取结构</span>
              </button>
            </div>

            {/* 主体内容区 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {addTab === 'ai_text' ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900 leading-relaxed">
                    直接粘贴来自题库网页、PDF 资料或学习笔记的题目原文（包含题干、选项或答案解析），AI 将自动为你结构化提炼并回填到表单中！
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 shrink-0">目标科目：</span>
                    <select
                      value={newForm.subject}
                      onChange={(e) => setNewForm((f) => ({ ...f, subject: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-none"
                    >
                      {COMMON_SUBJECTS.filter((s) => s !== '全部').map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={rawPasteText}
                    onChange={(e) => setRawPasteText(e.target.value)}
                    rows={8}
                    placeholder="在此粘贴整段题目文本，例如：\n已知函数 f(x) 在 x=0 处连续，且 lim_{x->0} f(x)/x = 2，则...\nA. f(0)=0  B. f'(0)=2 ..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-slate-800 outline-none focus:border-indigo-400 leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={handleAiParseToForm}
                    disabled={aiParsing}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                  >
                    <Wand2 className={`w-4 h-4 ${aiParsing ? 'animate-spin' : ''}`} />
                    <span>{aiParsing ? 'AI 正在智能提取结构化字段...' : '✨ 开始 AI 智能提取并填入表单'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">所属科目</label>
                      <select
                        value={newForm.subject}
                        onChange={(e) => setNewForm((f) => ({ ...f, subject: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 outline-none focus:border-indigo-400"
                      >
                        {COMMON_SUBJECTS.filter((s) => s !== '全部').map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">章节 / 考点 (选填)</label>
                      <input
                        type="text"
                        value={newForm.chapter}
                        onChange={(e) => setNewForm((f) => ({ ...f, chapter: e.target.value }))}
                        placeholder="如：中值定理 / 树与二叉树"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">错因诊断分类</label>
                      <select
                        value={newForm.errorType}
                        onChange={(e) => setNewForm((f) => ({ ...f, errorType: e.target.value }))}
                        className="w-full bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-2 text-rose-700 font-semibold outline-none"
                      >
                        {ERROR_REASON_OPTIONS.filter((r) => r !== '全部').map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      题干内容 * <span className="text-slate-400 font-normal">(支持 Markdown 与 $LaTeX$ 公式)</span>
                    </label>
                    <textarea
                      value={newForm.question}
                      onChange={(e) => setNewForm((f) => ({ ...f, question: e.target.value }))}
                      rows={3}
                      placeholder="输入错题题干内容..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-indigo-400"
                    />
                  </div>

                  {/* 选项区域 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map((k) => {
                      const fieldKey = `opt${k}` as 'optA' | 'optB' | 'optC' | 'optD'
                      return (
                        <div key={k} className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                            {k}
                          </span>
                          <input
                            type="text"
                            value={newForm[fieldKey]}
                            onChange={(e) =>
                              setNewForm((f) => ({ ...f, [fieldKey]: e.target.value }))
                            }
                            placeholder={`选项 ${k}（填空/大题可留空）`}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 outline-none focus:border-indigo-400"
                          />
                        </div>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-rose-600 mb-1">当时错误作答</label>
                      <input
                        type="text"
                        value={newForm.userAnswer}
                        onChange={(e) => setNewForm((f) => ({ ...f, userAnswer: e.target.value }))}
                        placeholder="如：A 或 错解结果"
                        className="w-full bg-rose-50/40 border border-rose-200 rounded-xl px-2.5 py-2 text-slate-800 outline-none focus:border-rose-400"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-emerald-700 mb-1">标准正确答案 *</label>
                      <input
                        type="text"
                        value={newForm.correctAnswer}
                        onChange={(e) => setNewForm((f) => ({ ...f, correctAnswer: e.target.value }))}
                        placeholder="如：B 或 正确表达式"
                        className="w-full bg-emerald-50/40 border border-emerald-200 rounded-xl px-2.5 py-2 text-slate-800 outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">标准解析与步骤推导</label>
                    <textarea
                      value={newForm.explanation}
                      onChange={(e) => setNewForm((f) => ({ ...f, explanation: e.target.value }))}
                      rows={3}
                      placeholder="输入核心解析思路或公式推导..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-amber-800 mb-1">个人避坑反思心得</label>
                    <textarea
                      value={newForm.notes}
                      onChange={(e) => setNewForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={2}
                      placeholder="记录为什么会做错、下次遇到同类题注意什么..."
                      className="w-full bg-amber-50/40 border border-amber-200 rounded-xl p-2.5 text-slate-800 outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 底栏 */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              {addTab === 'manual' && (
                <button
                  type="button"
                  onClick={handleSaveNewError}
                  disabled={savingManual}
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingManual ? '保存中...' : '保存收录至错题攻克中心'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
