import { authService } from '../services/auth'
import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import { lazyWithRetry } from '../utils/lazyWithRetry'
import ChunkErrorBoundary from '../components/ChunkErrorBoundary'
import SuspenseTimeoutFallback from '../components/ui/SuspenseTimeoutFallback'
import { useSearchParams } from 'react-router-dom'
import {
  BookOpen,
  FileEdit,
  Sparkles,
  ScrollText,
  Copy,
  Check,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Share2,
  RefreshCw,
  Send,
  SlidersHorizontal,
  Flame,
  ChevronRight,
  ChevronDown,
  Volume2,
  BarChart2,
  Camera,
  Image as ImageIcon,
  X,
} from 'lucide-react'
import {
  ESSAY_TEMPLATES,
  ESSAY_GOLDEN_SENTENCES,
  ENGLISH_PAST_PAPERS,
  PAST_ESSAY_PROMPTS,
  type PastEssayPrompt,
  type EssayTemplate,
  type GoldenSentence,
  type PastPaperReading,
  type EssayCategory,
  type EnglishExamType,
} from '../data/englishData'
import { gradeEssayLocally, type EssayGradingResult } from '../services/essayGrading'
import VocabTab from '../components/study/VocabTab'
import WordBrowser from '../components/vocab/WordBrowser'
import VocabStats from '../components/vocab/VocabStats'
const WordRelations = lazyWithRetry(() => import('../components/vocab/WordRelations'), 'wordRelations')
import DailyReadingTab from '../components/english/DailyReadingTab'
import EnglishPracticeView from '../components/english/EnglishPracticeView'
import EnglishFullPaperView from '../components/english/EnglishFullPaperView'

type EnglishMainTab = 'practice' | 'papers' | 'dailyReading' | 'grading' | 'templates' | 'vocab'

export default function English() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<EnglishMainTab>('practice')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'papers' || tab === 'practice' || tab === 'dailyReading' || tab === 'grading' || tab === 'templates' || tab === 'vocab') {
      setActiveTab(tab)
    }
  }, [searchParams])

  // -------------------------------------------------------------
  // 1. 词汇子选项卡
  // -------------------------------------------------------------
  const [vocabSubTab, setVocabSubTab] = useState<'review' | 'browse' | 'stats' | 'relations'>('review')

  // -------------------------------------------------------------
  // 2. 作文模板状态
  // -------------------------------------------------------------
  const [templateFilterExam, setTemplateFilterExam] = useState<EnglishExamType | 'all'>('all')
  const [templateFilterCategory, setTemplateFilterCategory] = useState<EssayCategory | 'all'>('all')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(ESSAY_TEMPLATES[0].id)
  const [copiedSectionIdx, setCopiedSectionIdx] = useState<number | null>(null)
  const [copiedFullTemplate, setCopiedFullTemplate] = useState(false)

  // -------------------------------------------------------------
  // 3. 万能金句筛选
  // -------------------------------------------------------------
  const [goldenSearch, setGoldenSearch] = useState('')
  const [goldenCategory, setGoldenCategory] = useState<string>('all')
  const [copiedSentenceId, setCopiedSentenceId] = useState<string | null>(null)

  // -------------------------------------------------------------
  // 4. 历年真题精读状态
  // -------------------------------------------------------------
  const [selectedPaperId, setSelectedPaperId] = useState<string>(ENGLISH_PAST_PAPERS[0].id)
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<{ p: number; s: number } | null>(null)
  const [showHardGrammarOnly, setShowHardGrammarOnly] = useState(false)
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({})

  // -------------------------------------------------------------
  // 5. 作文智能批改状态
  // -------------------------------------------------------------
  const [gradingEssayType, setGradingEssayType] = useState<'big_essay' | 'small_essay'>('big_essay')
  const [essayInput, setEssayInput] = useState<string>(
    'As is vividly depicted in the cartoon, two individuals are standing at a crossroads. One is staring at his phone, while the other is looking at the distant future. This picture is very important because it shows modern technology problems. Many people lose their minds in smartphones. I think it is very good if government can help us make better rules.'
  )
  const [gradingResult, setGradingResult] = useState<EssayGradingResult | null>(null)
  const [isGrading, setIsGrading] = useState(false)

  // -------------------------------------------------------------
  // 5.1 历年真题题库速选与墨卷 AI 批改状态
  // -------------------------------------------------------------
  const [selectedPromptId, setSelectedPromptId] = useState<string>(PAST_ESSAY_PROMPTS[0].id)
  const activePrompt = useMemo(() => {
    return PAST_ESSAY_PROMPTS.find((p) => p.id === selectedPromptId) || PAST_ESSAY_PROMPTS[0]
  }, [selectedPromptId])

  const [activeGradingEngine, setActiveGradingEngine] = useState<'local' | 'mojuan'>('local')
  const [isMojuanGrading, setIsMojuanGrading] = useState(false)
  const [mojuanStreamingText, setMojuanStreamingText] = useState('')
  const [mojuanError, setMojuanError] = useState<string | null>(null)
  const [mojuanStatusNotice, setMojuanStatusNotice] = useState<string | null>(null)

  // -------------------------------------------------------------
  // 5.2 拍照/截图答题卡 OCR 识别与考研大纲多维批改状态
  // -------------------------------------------------------------
  const [handwritingImage, setHandwritingImage] = useState<string | null>(null)
  const [isOcrExtracting, setIsOcrExtracting] = useState(false)
  const handwritingInputRef = useRef<HTMLInputElement>(null)
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false)
  const [aiEssayEvaluation, setAiEssayEvaluation] = useState<any | null>(null)

  const handleHandwritingPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          e.preventDefault()
          const reader = new FileReader()
          reader.onload = (loadEvent) => {
            const base64 = loadEvent.target?.result as string
            setHandwritingImage(base64)
          }
          reader.readAsDataURL(file)
          break
        }
      }
    }
  }

  const handleHandwritingFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        const base64 = loadEvent.target?.result as string
        setHandwritingImage(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleOcrExtractHandwriting = async () => {
    if (!handwritingImage) return
    setIsOcrExtracting(true)
    try {
      const res = await fetch('/api/english/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({
          image: handwritingImage,
          essayType: gradingEssayType,
          questionPrompt: activePrompt.promptZh,
        }),
      })
      const data = await res.json()
      if (data.extractedText) {
        setEssayInput(data.extractedText)
        setAiEssayEvaluation(data)
      } else {
        alert(data.error || '图片文本识别失败，请确保图片清晰包含手写英文作文')
      }
    } catch (err: any) {
      alert('手写答题卡识别异常: ' + err.message)
    } finally {
      setIsOcrExtracting(false)
    }
  }

  const handleStartAiGrading = async () => {
    if (!essayInput.trim()) {
      alert('请先输入或粘贴英文作文草稿')
      return
    }
    setIsGrading(true)
    try {
      const res = await fetch('/api/english/grade-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeaders() },
        body: JSON.stringify({
          essayText: essayInput,
          essayType: gradingEssayType,
          questionPrompt: `${activePrompt.title}: ${activePrompt.promptZh}`,
          image: handwritingImage || undefined,
        }),
      })
      const data = await res.json()
      if (data.totalScore !== undefined) {
        setAiEssayEvaluation(data)
      } else {
        alert(data.error || 'AI 阅卷评估返回异常')
      }
    } catch (err: any) {
      const localFallback = gradeEssayLocally(essayInput, gradingEssayType)
      setGradingResult(localFallback)
      alert('网络波动，已自动为您启用本地离线规则引擎进行诊断：' + err.message)
    } finally {
      setIsGrading(false)
    }
  }

  // 墨卷导师 AI 流式批改 (复用 /api/local-agents/chat)
  const handleStartMojuanGrading = async () => {
    if (!essayInput.trim()) return
    setIsMojuanGrading(true)
    setActiveGradingEngine('mojuan')
    setMojuanStreamingText('')
    setMojuanError(null)
    setMojuanStatusNotice('墨卷导师正在审阅考题与您的作答，推演多维诊断...')

    const maxScore = gradingEssayType === 'big_essay' ? 20 : 10
    const promptMessage = `【考研英语作文 AI 多维批改请求】
真题背景与题目：
- 题目标题：${activePrompt.title} (${activePrompt.subType})
- 官方要求：${activePrompt.promptZh}
- 图画/图表核心要素：${activePrompt.visualDescription}
- 目标满分制：${maxScore} 分制 (${gradingEssayType === 'big_essay' ? '大作文' : '小作文'})

考生作答文本如下：
"""
${essayInput.trim()}
"""

请你作为【墨卷（政治/英语双科领航导师）】，按照全国考研英语大纲官方评阅标准进行深度多维诊断：
1. 【考研官方得分评估】给出建议总得分（${maxScore}分制，如 17.5 / ${maxScore}），并拆分四项小分：切题与立意(25%)、框架结构与衔接(25%)、句法精准度(25%)、高级闪光词汇(25%)，给出所在档次（一档优秀/二档良好/三档及格）与一句话核心点评；
2. 【逐句排雷与语法抓虫】逐句指出考生句子中的语法缺陷、主谓不一致、介词冠词搭配不当、或过于口语化的句子，并给出地道修正；
3. 【平庸词升级矩阵】挑选 3-5 个初级词汇（如 important, good, many 等），给出考研一档闪光升级词汇与例句示范；
4. 【墨卷一档高分重构示范范文】根据本题立意，给出 1 篇辞藻优美、衔接自如、符合考研大纲要求的满分示范范文。`

    try {
      const res = await fetch('/api/local-agents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({
          message: promptMessage,
          agentId: 'mojuan',
          history: [],
          projectName: '考研英语研学中枢 · 作文批改舱',
          pageContext: '考研英语作文 AI 深度批改 (墨卷导师)',
        }),
      })

      if (!res.ok) {
        if (res.status === 402) {
          throw new Error('伴学积分不足（单次批改消耗 0.1 积分），请签到领积分或联系管理员。')
        }
        throw new Error(`服务连接异常 (HTTP ${res.status})`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('流式读取不可用')
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const rawData = trimmed.replace(/^data:\s*/, '')
          try {
            const data = JSON.parse(rawData)
            if (data.type === 'delta' && data.text) {
              accumulated += data.text
              setMojuanStreamingText(accumulated)
            } else if (data.type === 'points_updated') {
              if (data.deducted > 0) {
                setMojuanStatusNotice(`批改完成，已扣除 ${data.deducted} 伴学积分 (剩余 ${data.remainingPoints?.toFixed(1)} 分)`)
              } else {
                setMojuanStatusNotice('由于本次返回未达标或超时，系统已自动保留您的伴学积分，未扣除费用。')
              }
            } else if (data.type === 'error') {
              setMojuanError(data.message || '批改过程遇到异常')
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setMojuanError(err.message || '网络连接超时，已为您免除积分扣除，请重试。')
    } finally {
      setIsMojuanGrading(false)
    }
  }

  // 载入选中的真题题干与示例
  const handleSelectPrompt = (prompt: PastEssayPrompt) => {
    setSelectedPromptId(prompt.id)
    setGradingEssayType(prompt.category)
    if (prompt.sampleDraft) {
      setEssayInput(prompt.sampleDraft)
    }
  }

  const activeTemplate = useMemo(() => {
    return ESSAY_TEMPLATES.find((t) => t.id === selectedTemplateId) || ESSAY_TEMPLATES[0]
  }, [selectedTemplateId])

  const filteredTemplates = useMemo(() => {
    return ESSAY_TEMPLATES.filter((t) => {
      if (templateFilterExam !== 'all' && t.examType !== templateFilterExam && t.examType !== 'both') return false
      if (templateFilterCategory !== 'all' && t.category !== templateFilterCategory) return false
      return true
    })
  }, [templateFilterExam, templateFilterCategory])

  const filteredGoldenSentences = useMemo(() => {
    return ESSAY_GOLDEN_SENTENCES.filter((g) => {
      if (goldenCategory !== 'all' && g.category !== goldenCategory) return false
      if (
        goldenSearch &&
        !g.sentence.toLowerCase().includes(goldenSearch.toLowerCase()) &&
        !g.translation.includes(goldenSearch)
      ) {
        return false
      }
      return true
    })
  }, [goldenCategory, goldenSearch])

  const activePaper = useMemo(() => {
    return ENGLISH_PAST_PAPERS.find((p) => p.id === selectedPaperId) || ENGLISH_PAST_PAPERS[0]
  }, [selectedPaperId])

  // 执行批改
  const handleStartGrading = () => {
    if (!essayInput.trim()) return
    setIsGrading(true)
    setTimeout(() => {
      const res = gradeEssayLocally(essayInput, gradingEssayType)
      setGradingResult(res)
      setIsGrading(false)
    }, 400)
  }

  // 拷贝段落
  const handleCopySection = (text: string, idx: number) => {
    navigator.clipboard?.writeText?.(text)
    setCopiedSectionIdx(idx)
    setTimeout(() => setCopiedSectionIdx(null), 2000)
  }

  // 拷贝全篇模板
  const handleCopyFullTemplate = (t: EssayTemplate) => {
    const full = t.structure.map((s) => s.templateText).join('\n\n')
    navigator.clipboard?.writeText?.(full)
    setCopiedFullTemplate(true)
    setTimeout(() => setCopiedFullTemplate(false), 2000)
  }

  // 拷贝金句
  const handleCopySentence = (text: string, id: string) => {
    navigator.clipboard?.writeText?.(text)
    setCopiedSentenceId(id)
    setTimeout(() => setCopiedSentenceId(null), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto w-full min-w-0 space-y-5 sm:space-y-6 pb-28 sm:pb-16 animate-fade-in font-sans">
      {/* ── 顶部头图看板 ── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 p-4 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-semibold text-indigo-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" style={{ animationDuration: '6s' }} />
              <span className="sm:hidden">英语一 / 英语二研学总攻</span>
              <span className="hidden sm:inline">2026/2027 考研英语总攻作战舱 · 英语一 & 英语二双轨适配</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <span>考研英语 · 全题型研学中枢</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-900 text-white">
                ENGLISH MASTER
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              汇聚真题分题型刷题（完型·传统阅读·新题型·翻译）、历年官方真题套卷全真模考、大纲词汇艾宾浩斯复盘、万能高分作文模板与 AI 智能多维度精批。
            </p>
          </div>

          {/* 快捷数据统计徽章 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-center">
            <div
              onClick={() => setActiveTab('vocab')}
              className={`rounded-2xl border p-3 shadow-2xs cursor-pointer transition-all active:scale-95 ${
                activeTab === 'vocab'
                  ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/30'
                  : 'border-slate-200/80 bg-white/90 hover:border-indigo-300 hover:bg-indigo-50/20'
              }`}
            >
              <div className="text-[10px] font-semibold text-indigo-600 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>核心词汇打卡</span>
              </div>
              <div className="text-base font-black font-mono text-indigo-700 mt-0.5">2000+ 真题词</div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-400">分题型题库</div>
              <div className="text-base font-black font-mono text-indigo-600 mt-0.5">完型·阅读·新题</div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-400">历年真题套卷</div>
              <div className="text-base font-black font-mono text-emerald-600 mt-0.5">全真模考</div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs">
              <div className="text-[10px] font-semibold text-slate-400">AI 智能批改</div>
              <div className="text-base font-black font-mono text-rose-600 mt-0.5">~1.2s 极速精批</div>
            </div>
          </div>
        </div>

        {/* 主功能导航切换药丸 */}
        <div className="mt-5 sm:mt-6 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar border-t border-slate-200/60 pt-3 sm:pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('vocab')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'vocab'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 ring-1 ring-amber-400/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="sm:hidden">背单词</span>
            <span className="hidden sm:inline">核心词汇背单词 (艾宾浩斯)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black">
              每日必刷
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 ring-1 ring-indigo-500/20'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="sm:hidden">分题型刷题</span>
            <span className="hidden sm:inline">分题型刷题 (完型/阅读/新题型)</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black">
              专项突破
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('papers')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'papers'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="sm:hidden">真题套卷</span>
            <span className="hidden sm:inline">历年真题套卷模考</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">180分钟</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dailyReading')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'dailyReading'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="sm:hidden">每日精读</span>
            <span className="hidden sm:inline">每日文献精读 (AI伴读)</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black">
              外刊题源
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('grading')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'grading'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 ring-1 ring-indigo-500/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="sm:hidden">作文批改</span>
            <span className="hidden sm:inline">作文批改舱 (20分制)</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black">
              墨卷AI精批
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">高分模板</span>
            <span className="hidden sm:inline">作文高分模板库</span>
            <span className="hidden sm:inline text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">大小作文</span>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          板块 -1: 考研英语分题型专项刷题 (完形填空 / 传统阅读 / 新题型 / 翻译)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'practice' && (
        <EnglishPracticeView onGoToPapers={() => setActiveTab('papers')} />
      )}

      {/* ─────────────────────────────────────────────────────────────
          板块 0: 每日文献精读 (AI长难句拆解 + 考研AI伴读导师)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'dailyReading' && <DailyReadingTab />}

      {/* ─────────────────────────────────────────────────────────────
          板块 1: 作文高分模板库 & 万能金句
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* 筛选控制器 */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>科目筛选:</span>
              </span>
              {(['all', 'english_1', 'english_2'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTemplateFilterExam(mode)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    templateFilterExam === mode
                      ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {mode === 'all' ? '全部卷别' : mode === 'english_1' ? '英语一专属' : '英语二专属'}
                </button>
              ))}

              <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

              <span className="font-bold text-slate-400 mr-1 hidden sm:inline">题型类型:</span>
              {(['all', 'small_letter', 'small_notice', 'big_picture', 'big_chart'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTemplateFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    templateFilterCategory === cat
                      ? 'bg-slate-900 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all'
                    ? '全部题型'
                    : cat === 'small_letter'
                    ? '应用文 · 书信'
                    : cat === 'small_notice'
                    ? '应用文 · 告示通知'
                    : cat === 'big_picture'
                    ? '图画议论文 (英一)'
                    : '图表分析文 (英二)'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleCopyFullTemplate(activeTemplate)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ml-auto"
            >
              {copiedFullTemplate ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFullTemplate ? '已复制全篇模板！' : '一键复制全篇模板'}</span>
            </button>
          </div>

          {/* 模板主工作台 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 左侧：模板目录列表 (4列) */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs font-bold text-slate-400 px-1">可选范式模板 ({filteredTemplates.length})</div>
              <div className="space-y-2.5 max-h-[700px] overflow-y-auto no-scrollbar pr-1">
                {filteredTemplates.map((item) => {
                  const isSelected = item.id === selectedTemplateId
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTemplateId(item.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200/90 bg-white/70 hover:bg-white hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {item.typeLabel}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.examType === 'both' ? '英一/英二通用' : item.examType === 'english_1' ? '英语(一)' : '英语(二)'}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>含 {item.structure.length} 个结构段落</span>
                        <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                          <span>查看详情</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 右侧：当前模板深度拆解与填空指引 (8列) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      {activeTemplate.typeLabel} · 核心高分模板
                    </span>
                    <span className="text-xs text-slate-400">
                      适用话题：<strong className="text-slate-700">{activeTemplate.topic}</strong>
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-2">{activeTemplate.title}</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{activeTemplate.description}</p>
                </div>

                {/* 逐段拆解 */}
                <div className="space-y-4">
                  {activeTemplate.structure.map((sec, idx) => (
                    <div
                      key={sec.sectionName}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:p-5 space-y-3 hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{sec.sectionName}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopySection(sec.templateText, idx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          {copiedSectionIdx === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSectionIdx === idx ? '已复制' : '复制本段'}</span>
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/70 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
                        {sec.templateText}
                      </div>

                      <div className="text-[11px] text-slate-500 leading-relaxed bg-amber-50/60 border border-amber-200/50 rounded-xl p-3">
                        <div className="font-semibold text-amber-900 mb-0.5">💡 译文与逻辑解析:</div>
                        <p>{sec.translation}</p>
                        {sec.placeholderHints.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-amber-200/40 text-[10.5px] text-amber-800">
                            <strong>填空与替换建议:</strong>
                            <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                              {sec.placeholderHints.map((hint, hIdx) => (
                                <li key={hIdx}>{hint}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 亮点高分短语词汇 */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <div className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>本篇核心闪光表达与连词:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTemplate.highlightPhrases.map((phrase, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-xs font-mono font-medium text-indigo-700 shadow-2xs"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 下方：万能高分金句速查库 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>万能高分句型库 (即查即背即拷)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">覆盖首段名言引出、图表极值分析、深度归因与结尾倒装升华句</p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="检索金句/语法结构..."
                      value={goldenSearch}
                      onChange={(e) => setGoldenSearch(e.target.value)}
                      className="h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none w-44 sm:w-56"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs pb-1">
                  {(['all', 'opening', 'data_analysis', 'cause_effect', 'solution', 'conclusion'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGoldenCategory(c)}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                        goldenCategory === c
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c === 'all'
                        ? '全部金句'
                        : c === 'opening'
                        ? '首段引出'
                        : c === 'data_analysis'
                        ? '数据描摹'
                        : c === 'cause_effect'
                        ? '多维归因'
                        : c === 'solution'
                        ? '对策建议'
                        : '升华尾句'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto no-scrollbar">
                  {filteredGoldenSentences.map((g) => (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-2 group shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                          <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {g.categoryLabel}
                          </span>
                          <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                            {g.difficulty}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-medium text-slate-900 leading-snug">{g.sentence}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{g.translation}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[200px]">亮点：{g.grammarHighlight}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySentence(g.sentence, g.id)}
                          className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedSentenceId === g.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSentenceId === g.id ? '已复制' : '复制'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

            {/* ─────────────────────────────────────────────────────────────
          板块 2: AI 作文智能批改舱 (大/小作文 20分制 · 墨卷双核引擎)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'grading' && (
        <div className="space-y-6">
          {/* 顶栏：历年真题写作精选题库快捷选取栏 */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-2xs">
                  🎯
                </span>
                <span className="text-xs font-black text-slate-900 tracking-tight">考研英语历年真题作文题库速选</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">· 点击即可载入真题题干、图意要求与参考草稿</span>
              </div>
              <span className="text-[11px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                英语一 / 英语二 双轨图文真题
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {PAST_ESSAY_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedPromptId === prompt.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">
                    {prompt.year} {prompt.examType === 'english_1' ? '英一' : prompt.examType === 'english_2' ? '英二' : '通用'}
                  </span>
                  <span>{prompt.subType}</span>
                </button>
              ))}
            </div>

            {/* 当前选中考题的要求展示卡片 */}
            <div className="rounded-2xl border border-indigo-100/80 bg-indigo-50/30 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <span className="text-base">📌</span>
                  <span>{activePrompt.title}</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                  {activePrompt.category === 'big_essay' ? '大作文 (满分 20 分)' : '小作文 (满分 10 分)'}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-mono leading-relaxed bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                {activePrompt.promptZh}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-1 text-xs">
                <div className="md:col-span-7 text-[11px] text-slate-600">
                  <strong className="text-slate-800">🖼️ 图画/图表核心要点：</strong>
                  <span>{activePrompt.visualDescription}</span>
                </div>
                <div className="md:col-span-5 text-[11px] flex flex-wrap items-center gap-1">
                  <strong className="text-indigo-900 shrink-0">✨ 推荐闪光词：</strong>
                  {activePrompt.recommendedKeywords.slice(0, 3).map((kw, kwIdx) => (
                    <span key={kwIdx} className="px-1.5 py-0.2 rounded bg-white border border-indigo-200 text-indigo-700 font-mono text-[10px]">
                      {kw.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 下部左右分栏工作台 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 左侧：输入工作台 (6列) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-6 shadow-xs space-y-3.5 sm:space-y-4">
                <input
                  type="file"
                  ref={handwritingInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleHandwritingFile}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      ✍️
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">英语写作作答区</h2>
                      <p className="text-[11px] text-slate-400">支持键盘打字、Ctrl+V 粘贴手写试卷识别或载入草稿</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
                    <button
                      type="button"
                      onClick={() => setGradingEssayType('big_essay')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        gradingEssayType === 'big_essay' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      大作文 (20分)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGradingEssayType('small_essay')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        gradingEssayType === 'small_essay' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      小作文 (10分)
                    </button>
                  </div>
                </div>

                {/* 拍照/截图 OCR 答题卡图片捕获展示条 */}
                {handwritingImage && (
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-3 flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={handwritingImage}
                        alt="手写作文预览"
                        className="w-12 h-12 object-cover rounded-xl border border-indigo-200 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                          <span>已捕获手写作文图片</span>
                          <span className="text-[10px] text-indigo-600 bg-white px-1.5 py-0.2 rounded font-mono">OCR就绪</span>
                        </div>
                        <p className="text-[11px] text-indigo-600/80 truncate">
                          可一键识别将文字填入下方输入框，或直接提交 AI 综合批改
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleOcrExtractHandwriting}
                        disabled={isOcrExtracting}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-500 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isOcrExtracting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        <span>{isOcrExtracting ? '识别中...' : '提取文字'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHandwritingImage(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="移除此图片"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    rows={12}
                    onPaste={handleHandwritingPaste}
                    value={essayInput}
                    onChange={(e) => setEssayInput(e.target.value)}
                    placeholder="请在此输入或粘贴您的考研英语作文作答文本...（支持直接按 Ctrl + V 粘贴手写作文截图）"
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-xs sm:text-sm font-mono leading-relaxed outline-none resize-none text-slate-800"
                  />
                  <div className="absolute right-3 bottom-3 text-[11px] font-mono text-slate-400 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    当前: {(essayInput.match(/[a-zA-Z]+/g) || []).length} 词 · {essayInput.split(/\n+/).filter(Boolean).length} 段
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handwritingInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-xs text-indigo-700 cursor-pointer font-bold flex items-center gap-1 shadow-2xs transition-colors"
                      title="上传手写答题卡照片进行识别"
                    >
                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                      <span>拍照/上传手写</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTemplateDrawerOpen(!templateDrawerOpen)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-medium flex items-center gap-1"
                    >
                      <ScrollText className="w-3.5 h-3.5 text-amber-500" />
                      <span>{templateDrawerOpen ? '收起模板' : '速查万能模板'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => activePrompt.sampleDraft && setEssayInput(activePrompt.sampleDraft)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                    >
                      载入草稿
                    </button>
                    <button
                      type="button"
                      onClick={() => setEssayInput('')}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer font-medium"
                    >
                      清空
                    </button>
                  </div>

                  {/* 多核智能批改入口 */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isGrading || isMojuanGrading || !essayInput.trim()}
                      onClick={handleStartAiGrading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
                      title="调用全国考研英语大纲官方评阅标准，输出档次分、逐句纠错、闪光升级与满分范文"
                    >
                      {isGrading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>阅卷专家采点评分中...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>AI 五档深度批改 (推荐)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 万能模板速背抽屉 (可随手展开) */}
                {templateDrawerOpen && (
                  <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-4 space-y-3 animate-fade-in text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 flex items-center gap-1.5">
                        <ScrollText className="w-4 h-4 text-amber-600" />
                        <span>考研英语写作万能高分模板背诵舱</span>
                      </span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono">
                        点击一键套用
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ESSAY_TEMPLATES.slice(0, 3).map((tpl) => (
                        <div key={tpl.id} className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{tpl.title}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const full = tpl.structure.map(s => s.templateText).join('\n\n')
                                setEssayInput(full)
                                setTemplateDrawerOpen(false)
                              }}
                              className="text-[11px] text-indigo-600 hover:underline font-bold cursor-pointer"
                            >
                              套用此模板 →
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500">{tpl.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 状态与扣费兜底安全提示 */}
                {mojuanStatusNotice && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-[11px] text-indigo-800 flex items-center justify-between">
                    <span>💡 {mojuanStatusNotice}</span>
                    <button
                      type="button"
                      onClick={() => setMojuanStatusNotice(null)}
                      className="text-indigo-400 hover:text-indigo-700 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {mojuanError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-center justify-between">
                    <span>⚠️ {mojuanError}</span>
                    <button
                      type="button"
                      onClick={() => setMojuanError(null)}
                      className="text-rose-400 hover:text-rose-700 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* 批改报告：词汇升级与语法排雷 (当有本地诊断结果时) */}
              {gradingResult && activeGradingEngine === 'local' && (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      <span>词汇升级与平庸词替换指南 ({gradingResult.vocabularyUpgrades.length})</span>
                    </h3>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                      一档词汇提分策略
                    </span>
                  </div>

                  {gradingResult.vocabularyUpgrades.length > 0 ? (
                    <div className="space-y-2.5">
                      {gradingResult.vocabularyUpgrades.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="line-through text-slate-400 font-mono font-medium">{item.original}</span>
                            <ArrowRight className="w-3 h-3 text-indigo-400" />
                            <div className="flex flex-wrap gap-1">
                              {item.suggested.map((sug, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 font-bold font-mono text-[11px]"
                                >
                                  {sug}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600">{item.reason}</p>
                          <div className="text-[10.5px] font-mono text-indigo-800 bg-white/70 p-2 rounded-lg border border-indigo-100">
                            示例：{item.exampleSentence}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">
                      🎉 暂未检测到初级平庸词，选用表现良好！
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 右侧：多维诊断报告面板 (6列) */}
            <div className="lg:col-span-6 space-y-4">
              {/* 分支 0：AI 五档官方阅卷专家深度精批结果 */}
              {aiEssayEvaluation ? (
                <div className="space-y-4 animate-fade-in">
                  {/* 档次总分大奖章 */}
                  <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-300" />
                        <span>考研英语大纲官方阅卷评估</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold">
                        {aiEssayEvaluation.tier}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2.5">
                      <span className="text-5xl font-black font-mono text-amber-300">
                        {aiEssayEvaluation.totalScore}
                      </span>
                      <span className="text-xl text-slate-400 font-mono">/ {aiEssayEvaluation.maxScore} 分</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                      <div className="p-2 rounded-xl bg-white/5">
                        <div className="text-[10px] text-slate-400">总字数统计</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">{aiEssayEvaluation.wordCount} 词</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5">
                        <div className="text-[10px] text-slate-400">平均句长</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">{aiEssayEvaluation.avgWordsPerSentence} 词</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5">
                        <div className="text-[10px] text-slate-400">评分标准制</div>
                        <div className="text-sm font-bold font-mono text-emerald-300 mt-0.5">全国统考五档制</div>
                      </div>
                    </div>
                  </div>

                  {/* 四维阅卷雷达分项 */}
                  {aiEssayEvaluation.dimensions && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>考研英语写作四维阅卷细分</span>
                      </h3>
                      <div className="space-y-3">
                        {aiEssayEvaluation.dimensions.map((dim: any, idx: number) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700">{dim.dimension}</span>
                              <span className="font-mono font-bold text-indigo-600">{dim.score} / 100</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${dim.score}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-snug">{dim.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 逐句排雷与语法纠错红线对比 */}
                  {aiEssayEvaluation.sentenceDiagnostics && aiEssayEvaluation.sentenceDiagnostics.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>逐句语法排雷与红线纠错对比 ({aiEssayEvaluation.sentenceDiagnostics.length})</span>
                      </h3>
                      <div className="space-y-3">
                        {aiEssayEvaluation.sentenceDiagnostics.map((diag: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/20 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                                {diag.errorType || '语法与语用规范'}
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-white border border-rose-200/80 text-rose-700 font-mono line-through leading-relaxed">
                              {diag.original}
                            </div>
                            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-semibold leading-relaxed">
                              ✓ {diag.corrected}
                            </div>
                            <p className="text-[11px] text-slate-600">{diag.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 闪光句型替换推荐 */}
                  {aiEssayEvaluation.sparkleUpgrades && aiEssayEvaluation.sparkleUpgrades.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>替换为高分闪光句型 (倒装/强调/无灵主语)</span>
                      </h3>
                      <div className="space-y-3">
                        {aiEssayEvaluation.sparkleUpgrades.map((item: any, idx: number) => (
                          <div key={idx} className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/20 text-xs space-y-2">
                            <div className="text-[11px] text-slate-400 font-mono line-through">{item.original}</div>
                            <div className="text-xs text-amber-950 font-bold font-mono bg-white p-2.5 rounded-xl border border-amber-200 leading-relaxed">
                              ✨ {item.upgrade}
                            </div>
                            <p className="text-[11px] text-amber-800/90 leading-relaxed">{item.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 基于原意的一档满分示范范文 (双语对照) */}
                  {aiEssayEvaluation.polishedVersion && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>基于您的立意重构的一档满分范文</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText?.(aiEssayEvaluation.polishedVersion)
                            alert('已复制满分范文！')
                          }}
                          className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>复制范文</span>
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {aiEssayEvaluation.polishedVersion}
                      </div>

                      {aiEssayEvaluation.translation && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                          <span className="font-bold text-slate-800 block mb-1">地道中文参考译文：</span>
                          {aiEssayEvaluation.translation}
                        </div>
                      )}

                      {aiEssayEvaluation.flashcardsVocab && aiEssayEvaluation.flashcardsVocab.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-700 block mb-1.5">📚 本文核心高频闪光词卡：</span>
                          <div className="flex flex-wrap gap-1.5">
                            {aiEssayEvaluation.flashcardsVocab.map((v: any, vIdx: number) => (
                              <span key={vIdx} className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-mono">
                                <strong>{v.word}</strong>: {v.meaning}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : activeGradingEngine === 'mojuan' && (isMojuanGrading || mojuanStreamingText) ? (
                <div className="rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                        墨
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>墨卷导师 · 考研官方 20 分制深度精批</span>
                          {isMojuanGrading && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-mono animate-pulse">
                              <Sparkles className="w-2.5 h-2.5" /> 逐维推演中
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-indigo-300">政治/英语双科领航导师 · 阅卷采分点严审</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText?.(mojuanStreamingText)
                        alert('已复制墨卷导师批改全案！')
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>复制全案</span>
                    </button>
                  </div>

                  {/* 墨卷流式推演输出视窗 */}
                  <div className="rounded-2xl bg-black/40 border border-white/10 p-4 max-h-[560px] overflow-y-auto no-scrollbar space-y-3 font-sans">
                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                      {mojuanStreamingText || '墨卷导师正在建立采分点矩阵，请稍候...'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-300">
                    <span>💡 批改标准：严格对标考研英语大纲 4 大阅卷维度</span>
                    <button
                      type="button"
                      disabled={isMojuanGrading}
                      onClick={handleStartMojuanGrading}
                      className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      重新批改
                    </button>
                  </div>
                </div>
              ) : gradingResult ? (
                /* 分支 2：本地秒级诊断报告 */
                <>
                  <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                        EXAM EVALUATION REPORT
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-xs font-bold">
                        {gradingResult.tierLevel}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-amber-300">
                        {gradingResult.overallScore}
                      </span>
                      <span className="text-lg text-slate-400 font-mono">/ {gradingResult.maxScore} 分</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      {gradingResult.tierFeedback}
                    </p>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400">总字数</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {gradingResult.statistics.wordCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">复合句比</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {gradingResult.statistics.complexSentenceRatio}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">词汇丰富度</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {gradingResult.statistics.typeTokenRatio}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">平均句长</div>
                        <div className="text-sm font-bold font-mono text-white mt-0.5">
                          {gradingResult.statistics.avgWordsPerSentence} 词
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 四维细分 */}
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>考研四维阅卷维度细分</span>
                    </h3>

                    <div className="space-y-3">
                      {gradingResult.dimensionScores.map((dim) => (
                        <div key={dim.dimension} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">{dim.dimension}</span>
                            <span className="font-mono font-bold text-indigo-600">{dim.score} / 100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">{dim.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 示范版 */}
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>AI 智能升级示范全文 (一档范文)</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText?.(gradingResult.polishedVersion)
                          alert('已复制 AI 润色范文！')
                        }}
                        className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>复制范文</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {gradingResult.polishedVersion}
                    </div>
                  </div>
                </>
              ) : (
                /* 空态提示卡 */
                <div className="h-full min-h-[420px] rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 text-xl shadow-2xs">
                    📝
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">等待提交作文进行批改</h3>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    在左侧选择历年真题或输入作答，点击“本地秒级诊断”或“呼叫墨卷导师精批”，系统将即时生成 20 分制雷达评分与名师润色范文。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          板块 3: 历年真题套卷全真模考舱与精析
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'papers' && (
        <EnglishFullPaperView
          onGoToPractice={() => setActiveTab('practice')}
          onGoToEssayGrading={() => setActiveTab('grading')}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          板块 4: 大纲核心背单词中心 (聚合现有 2000+ 词汇与掌握度色谱)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'vocab' && (
        <div className="space-y-5">
          {/* 子导航 */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { key: 'review', label: '艾宾浩斯真题刷词' },
              { key: 'browse', label: '2000+大纲词库' },
              { key: 'stats', label: '记忆掌握度统计' },
              { key: 'relations', label: '词根词缀图谱' },
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setVocabSubTab(st.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  vocabSubTab === st.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            {vocabSubTab === 'review' && <VocabTab />}
            {vocabSubTab === 'browse' && <WordBrowser />}
            {vocabSubTab === 'stats' && <VocabStats />}
            {vocabSubTab === 'relations' && (
              <ChunkErrorBoundary title="词根词缀衍生树加载失败">
                <Suspense fallback={<SuspenseTimeoutFallback label="正在装载词根词缀衍生树..." />}>
                  <WordRelations />
                </Suspense>
              </ChunkErrorBoundary>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
