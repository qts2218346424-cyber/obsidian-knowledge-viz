import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  BookOpen,
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  Flame,
  Volume2,
  Layers,
  FileText,
  Clock,
  TrendingUp,
  RefreshCw,
  Eye,
  EyeOff,
  PlusCircle,
  Copy,
  Check,
  MessageSquare,
  Award,
} from 'lucide-react'
import {
  DAILY_READING_ARTICLES,
  type DailyReadingArticle,
  type ReadingSentence,
  type SourceJournal,
  type ReadingTopicCategory,
  generateAiCompanionReply,
  analyzeSentenceGrammarTree,
} from '../../data/dailyReadingData'
import { api } from '../../services/api'

const STORAGE_KEY_READING_CHECKIN = 'coreforge_english_reading_checkin_v1'
const STORAGE_KEY_SAVED_WORDS = 'coreforge_english_saved_reading_words_v1'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function DailyReadingTab() {
  // 1. 当前选中的文献
  const [selectedArticleId, setSelectedArticleId] = useState<string>(DAILY_READING_ARTICLES[0].id)
  const [categoryFilter, setCategoryFilter] = useState<ReadingTopicCategory | 'all'>('all')
  const [journalFilter, setJournalFilter] = useState<SourceJournal | 'all'>('all')

  // 2. 自定义输入/粘贴文献模式
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [customInputText, setCustomInputText] = useState('')

  // 3. 句子交互状态：当前点击的句子与高亮
  const [activeSentence, setActiveSentence] = useState<ReadingSentence | null>(null)
  const [showBilingual, setShowBilingual] = useState(true)
  const [highlightHardOnly, setHighlightHardOnly] = useState(false)

  // 4. 右侧 AI 伴读侧边栏选项卡：'companion' | 'vocab' | 'quiz'
  const [sideTab, setSideTab] = useState<'companion' | 'vocab' | 'quiz'>('companion')

  // 5. AI 伴读对话记录
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content:
        '👋 你好！我是你的 **考研英语文献精读 AI 伴读导师**。\n\n本篇选自英国著名严肃外刊，文章包含多处考研真题级别的复杂从句与熟词生义。你可以随时点击左侧任意句子让我为你进行长难句解剖，或者直接在下方点击快捷问答！',
      timestamp: '刚刚',
    },
  ])
  const [inputQuestion, setInputQuestion] = useState('')
  const [isAiReplying, setIsAiReplying] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement | null>(null)

  // 6. 配套测试题作答状态
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({})
  const [showAnalysis, setShowAnalysis] = useState<Record<string, boolean>>({})

  // 7. 打卡状态与生词收藏持久化
  const [checkinMap, setCheckinMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_READING_CHECKIN)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  const [savedWords, setSavedWords] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED_WORDS)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_READING_CHECKIN, JSON.stringify(checkinMap))
    } catch {}
  }, [checkinMap])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_WORDS, JSON.stringify(savedWords))
    } catch {}
  }, [savedWords])

  // 当前文献实体
  const currentArticle = useMemo(() => {
    return DAILY_READING_ARTICLES.find((a) => a.id === selectedArticleId) || DAILY_READING_ARTICLES[0]
  }, [selectedArticleId])

  // 筛选文章列表
  const filteredArticles = useMemo(() => {
    return DAILY_READING_ARTICLES.filter((a) => {
      if (categoryFilter !== 'all' && a.topicCategory !== categoryFilter) return false
      if (journalFilter !== 'all' && a.sourceJournal !== journalFilter) return false
      return true
    })
  }, [categoryFilter, journalFilter])

  // 自动滚动聊天到底部
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // 切换文章时重置部分状态
  const handleSelectArticle = (art: DailyReadingArticle) => {
    setSelectedArticleId(art.id)
    setActiveSentence(null)
    setUserAnswers({})
    setShowAnalysis({})
    setIsCustomMode(false)
    setChatMessages([
      {
        id: `init-${art.id}-${Date.now()}`,
        role: 'assistant',
        content: `📖 切换至精读文献 **《${art.title}》**！\n\n本篇来自 **${art.sourceJournal}**，蓝思难度 **${art.lexileLevel}**。建议先通读抓取核心论点，遇到长难句点击即可呼出语法树拆解。`,
        timestamp: '刚刚',
      },
    ])
  }

  // 切换打卡
  const toggleCheckin = () => {
    setCheckinMap((prev) => ({
      ...prev,
      [currentArticle.id]: !prev[currentArticle.id],
    }))
  }

  // 收藏生词
  const toggleSaveWord = (word: string) => {
    setSavedWords((prev) => ({
      ...prev,
      [word]: !prev[word],
    }))
  }

  // 发送 AI 伴读消息
  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuestion).trim()
    if (!q || isAiReplying) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatMessages((prev) => [...prev, userMsg])
    setInputQuestion('')
    setIsAiReplying(true)

    // 快捷探针直接调用名师启发式知识库（极速秒回），自定义提问优先尝试远程 AI 并设 2 秒超时
    const isQuickPrompt = [
      '总结核心论点与作者态度',
      '提炼考研熟词生义清单',
      '预测这篇出题的同义替换点',
      '解析当前选中的长难句',
    ].includes(q)

    if (isQuickPrompt) {
      setTimeout(() => {
        const replyText = generateAiCompanionReply(q, currentArticle, undefined, activeSentence?.en)
        setChatMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
        setIsAiReplying(false)
      }, 350)
      return
    }

    // 远程 AI 接口调用（带 2.5 秒超时控制）
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 2500)
      )

      const apiCall = api.sendMessage(
        `【考研英语文献伴读上下文】
文章标题：《${currentArticle.title}》
外刊来源：${currentArticle.sourceJournal}
当前焦点长难句：${activeSentence ? activeSentence.en : '全文阅读中'}
学生提问：${q}
请以考研英语阅卷组名师兼伴读导师身份，给出深入浅出、切中考研命题点与长难句语法的详细中文解答。`,
        chatMessages.slice(-4).map((m) => ({ role: m.role, content: m.content }))
      )

      const response = await Promise.race([apiCall, timeoutPromise])

      if (response && response.reply) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: response.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
        setIsAiReplying(false)
        return
      }
    } catch {
      // 优雅降级至本地专属考研伴读知识库
    }

    setTimeout(() => {
      const replyText = generateAiCompanionReply(q, currentArticle, undefined, activeSentence?.en)
      setChatMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsAiReplying(false)
    }, 400)
  }

  // 点击句子高亮并触发 AI 解构
  const handleSentenceClick = (sen: ReadingSentence) => {
    setActiveSentence(sen)
    // 自动在 AI 对话中加入提示
    if (sen.isHardLongSentence && sideTab === 'companion') {
      const analysis = sen.treeAnalysis || analyzeSentenceGrammarTree(sen.en)
      setChatMessages((prev) => [
        ...prev,
        {
          id: `sen-${Date.now()}`,
          role: 'assistant',
          content: `🔍 **【长难句解构提示】**\n> *"${sen.en}"*\n\n🌳 **主干骨架**：${analysis.mainTrunk}\n📌 **从句解析**：${analysis.clauseInfo}\n💡 **译文参考**：${sen.zh}`,
          timestamp: '刚刚',
        },
      ])
    }
  }

  // 统计指标
  const totalCheckedIn = Object.values(checkinMap).filter(Boolean).length
  const totalSavedWordsCount = Object.values(savedWords).filter(Boolean).length

  return (
    <div className="space-y-4 animate-fade-in-up text-slate-900">
      {/* ── 顶部仪表盘：外刊源刊档案与今日精读打卡 ── */}
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>考研外刊真题同源精读</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-mono font-bold">
                {currentArticle.sourceJournal}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono">
                蓝思难度 {currentArticle.lexileLevel}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                约 {currentArticle.wordCount} 词 · 建议 {currentArticle.recommendedMinutes} 分钟
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
              📰 {currentArticle.title}
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-w-4xl">
              {currentArticle.abstractZh}
            </p>
          </div>

          {/* 打卡与数据统计徽章 */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs text-slate-400">已打卡文献</div>
                <div className="text-base font-black text-amber-300">{totalCheckedIn} / {DAILY_READING_ARTICLES.length}</div>
              </div>
              <div className="w-px h-7 bg-white/10" />
              <div className="text-center">
                <div className="text-xs text-slate-400">生词收藏</div>
                <div className="text-base font-black text-sky-300">{totalSavedWordsCount} 词</div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleCheckin}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer active:scale-95 ${
                checkinMap[currentArticle.id]
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-400/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{checkinMap[currentArticle.id] ? '今日已打卡' : '完成精读打卡'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 筛选栏：主题选择、中英对照开关、长难句过滤、自定义输入 ── */}
      <div className="bento-card rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 bg-white/90 border border-slate-200/80 shadow-2xs">
        {/* 文献切换药丸列表 */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {DAILY_READING_ARTICLES.map((art) => {
            const isSelected = art.id === currentArticle.id && !isCustomMode
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => handleSelectArticle(art)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{art.sourceJournal === 'The Economist' ? '📊' : art.sourceJournal === 'Harvard Business Review' ? '💼' : '🧠'}</span>
                <span>{art.topicCategory}</span>
                <span className="opacity-70 text-[11px] font-mono">({art.sourceJournal.split(' ')[0]})</span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setIsCustomMode((v) => !v)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              isCustomMode
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>贴入自选外刊</span>
          </button>
        </div>

        {/* 视图调节工具 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBilingual((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              showBilingual
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            {showBilingual ? <Eye className="w-3.5 h-3.5 text-indigo-600" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showBilingual ? '中英对照' : '纯英文沉浸'}</span>
          </button>

          <button
            type="button"
            onClick={() => setHighlightHardOnly((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              highlightHardOnly
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>高亮长难句</span>
          </button>
        </div>
      </div>

      {/* ── 自定义外刊输入抽屉 ── */}
      {isCustomMode && (
        <div className="bento-card rounded-3xl p-4 sm:p-5 bg-indigo-50/50 border border-indigo-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900">贴入自定义英文文献或长难句段落</h3>
            </div>
            <span className="text-xs text-indigo-600 font-medium">AI 伴读引擎将自动进行长难句语法树拆解与命题点挖掘</span>
          </div>
          <textarea
            rows={4}
            value={customInputText}
            onChange={(e) => setCustomInputText(e.target.value)}
            placeholder="请在此粘贴任意英文段落（例如来自《经济学人》、《卫报》、历年模拟题），点击开始精读..."
            className="w-full p-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (customInputText.trim()) {
                  handleSendMessage(`请对以下这段英文进行长难句语法树拆解并标出考研重点生词：\n\n"${customInputText.trim()}"`)
                  setSideTab('companion')
                }
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
            >
              让 AI 伴读精析此段
            </button>
          </div>
        </div>
      )}

      {/* ── 主体双栏：左侧段落句句精读 + 右侧 AI 伴读导师舱 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* 左侧：文献段落交互区 (7列) */}
        <div className="lg:col-span-7 space-y-4">
          {currentArticle.paragraphs.map((p) => {
            return (
              <div
                key={p.index}
                className="bento-card rounded-3xl p-4 sm:p-6 bg-white border border-slate-200/90 shadow-sm space-y-3 transition-all hover:border-slate-300"
              >
                {/* 段首主旨徽章 */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                      P{p.index}
                    </span>
                    <span className="font-extrabold text-slate-700">段落核心：{p.corePoint}</span>
                  </div>
                  {p.examTrapAlert && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>题眼探针</span>
                    </span>
                  )}
                </div>

                {/* 句句精读区 */}
                <div className="space-y-3 font-serif">
                  {p.sentences.map((sen) => {
                    const isSelected = activeSentence?.sentenceIndex === sen.sentenceIndex && activeSentence?.en === sen.en
                    const isHard = sen.isHardLongSentence

                    if (highlightHardOnly && !isHard) {
                      return null
                    }

                    return (
                      <div
                        key={sen.sentenceIndex}
                        onClick={() => handleSentenceClick(sen)}
                        className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-400 shadow-sm'
                            : isHard
                            ? 'bg-slate-50/70 border-slate-200/90 hover:bg-slate-100/70'
                            : 'bg-transparent border-transparent hover:bg-slate-50'
                        }`}
                      >
                        {/* 英文原句 */}
                        <div className="text-[14px] sm:text-[15px] text-slate-900 leading-relaxed font-normal flex items-start gap-2">
                          {isHard && (
                            <span className="mt-0.5 shrink-0 px-1.5 py-0.2 rounded text-[10px] font-sans font-bold bg-amber-500 text-white">
                              长难句
                            </span>
                          )}
                          <span className={`${isSelected ? 'font-medium text-slate-950' : ''}`}>
                            {sen.en}
                          </span>
                        </div>

                        {/* 中文翻译对照 */}
                        {showBilingual && (
                          <div className="text-xs sm:text-[13px] text-slate-500 mt-1.5 font-sans leading-relaxed">
                            {sen.zh}
                          </div>
                        )}

                        {/* 若当前句子为长难句且被激活，展现语法树卡片 */}
                        {isSelected && sen.treeAnalysis && (
                          <div className="mt-3 p-3 rounded-xl bg-white border border-amber-300/80 text-xs font-sans space-y-1.5 shadow-xs">
                            <div className="font-bold text-amber-800 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>AI 语法树骨架解析：</span>
                            </div>
                            <div className="text-slate-800 font-mono text-[11.5px] bg-amber-50/60 p-2 rounded-lg">
                              {sen.treeAnalysis.mainTrunk}
                            </div>
                            <div className="text-slate-600">
                              <strong className="text-indigo-700">从句层级：</strong> {sen.treeAnalysis.clauseInfo}
                            </div>
                            <div className="text-slate-600">
                              <strong className="text-slate-700">修饰成分：</strong> {sen.treeAnalysis.modifierInfo}
                            </div>
                            {sen.kaoyanNote && (
                              <div className="text-rose-700 pt-1 border-t border-slate-100 font-medium">
                                💡 {sen.kaoyanNote}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 句子包含的考研核心生词标签 */}
                        {sen.keyWords && sen.keyWords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 font-sans">
                            {sen.keyWords.map((kw, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-medium border ${
                                  kw.isFamiliarDifferent
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <strong className="font-bold">{kw.word}</strong>
                                <span>{kw.meaning}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* 右侧：AI 伴读导师工作舱 (5列) */}
        <div className="lg:col-span-5 space-y-3.5 sticky top-20">
          <div className="bento-card rounded-3xl p-4 sm:p-5 bg-white border border-slate-200/90 shadow-md space-y-4">
            {/* 伴读舱顶部切换头 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div className="flex flex-col">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
                    <span>考研英语 AI 伴读导师</span>
                  </div>
                  <span className="text-[10px] text-slate-400">实时交互 · 答疑长难句与同义替换</span>
                </div>
              </div>

              {/* 右侧小切页 */}
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSideTab('companion')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sideTab === 'companion' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  伴读对话
                </button>
                <button
                  type="button"
                  onClick={() => setSideTab('vocab')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sideTab === 'vocab' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  生词速查
                </button>
                <button
                  type="button"
                  onClick={() => setSideTab('quiz')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sideTab === 'quiz' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  真题模考
                </button>
              </div>
            </div>

            {/* TAB 1: AI 伴读对话互动流 */}
            {sideTab === 'companion' && (
              <div className="space-y-3">
                {/* 对话消息区 */}
                <div className="h-[360px] overflow-y-auto space-y-3 p-2 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs no-scrollbar">
                  {chatMessages.map((msg) => {
                    const isUser = msg.role === 'user'
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div
                          className={`max-w-[90%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? 'bg-slate-900 text-white rounded-tr-none'
                              : 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[9.5px] text-slate-400 font-mono px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    )
                  })}
                  {isAiReplying && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200/80 text-xs text-indigo-600 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>考研英语 AI 伴读导师正在解析长难句与命题点...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* 快捷提问提词器 */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>伴读快捷探针：</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '总结核心论点与作者态度',
                      '提炼考研熟词生义清单',
                      '预测这篇出题的同义替换点',
                      '解析当前选中的长难句',
                    ].map((promptText) => (
                      <button
                        key={promptText}
                        type="button"
                        onClick={() => handleSendMessage(promptText)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 消息输入框 */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex items-center gap-2 pt-1"
                >
                  <input
                    type="text"
                    value={inputQuestion}
                    onChange={(e) => setInputQuestion(e.target.value)}
                    placeholder="向 AI 伴读提问（如：这段为什么用这个词？怎么同义替换？）..."
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuestion.trim() || isAiReplying}
                    className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: 生词与熟词生义速查本 */}
            {sideTab === 'vocab' && (
              <div className="space-y-3 max-h-[460px] overflow-y-auto no-scrollbar">
                <div className="text-xs text-slate-500">
                  收录本篇文献中出现的考研核心真题词汇与熟词生义警告，点击右侧可一键加入生词本：
                </div>
                <div className="space-y-2">
                  {currentArticle.keyVocab.map((v) => {
                    const isSaved = savedWords[v.word]
                    return (
                      <div
                        key={v.word}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">{v.word}</span>
                            <span className="text-[11px] font-mono text-slate-400">{v.phonetic}</span>
                            {v.isKaoYanCrucial && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/15 text-amber-800">
                                核心考词
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-700 leading-relaxed">{v.meaning}</div>
                          {v.familiarMeaningDifferent && (
                            <div className="text-[11px] font-bold text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                              {v.familiarMeaningDifferent}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleSaveWord(v.word)}
                          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                            isSaved
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-white text-slate-400 hover:text-slate-700 border border-slate-200'
                          }`}
                          title={isSaved ? '已收藏在生词本' : '加入生词本'}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: 真题级配套模考题 */}
            {sideTab === 'quiz' && (
              <div className="space-y-4 max-h-[460px] overflow-y-auto no-scrollbar">
                <div className="text-xs font-bold text-slate-500">
                  基于本篇外刊命制的考研真题同源模考题 (共 {currentArticle.mockQuestions.length} 题)：
                </div>
                {currentArticle.mockQuestions.map((q, idx) => {
                  const chosen = userAnswers[q.id]
                  const isSubmitted = Boolean(chosen)
                  const isCorrect = chosen === q.answer

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>第 {idx + 1} 题 · {q.type}</span>
                        {isSubmitted && (
                          <span className={`font-black ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isCorrect ? '✓ 回答正确' : `✗ 回答错误 (正确答案: ${q.answer})`}
                          </span>
                        )}
                      </div>

                      <div className="text-xs sm:text-[13px] font-extrabold text-slate-900 leading-snug">
                        {q.stem}
                      </div>

                      {/* 选项组 */}
                      <div className="space-y-1.5 font-sans">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                          const isPicked = chosen === optKey
                          return (
                            <button
                              key={optKey}
                              type="button"
                              onClick={() => {
                                setUserAnswers((prev) => ({ ...prev, [q.id]: optKey }))
                                setShowAnalysis((prev) => ({ ...prev, [q.id]: true }))
                              }}
                              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-2 ${
                                isPicked
                                  ? isCorrect
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                    : 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                                {optKey}
                              </span>
                              <span className="leading-relaxed">{q.options[optKey]}</span>
                            </button>
                          )
                        })}
                      </div>

                      {/* 考研名师解析与同义替换 */}
                      {showAnalysis[q.id] && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5">
                          <div className="font-bold text-slate-800">📋 考研真题命题解析：</div>
                          <p className="text-slate-600 leading-relaxed">{q.analysis}</p>
                          <div className="text-[11px] font-bold text-indigo-700 bg-indigo-50 p-2 rounded-lg">
                            🔍 考点同义替换还原：{q.paraphrasePoint}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
