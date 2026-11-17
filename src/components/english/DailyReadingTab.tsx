import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Maximize2,
  Minimize2,
  Minus,
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  Flame,
  Volume2,
  FileText,
  Eye,
  EyeOff,
  PlusCircle,
  X,
  Loader2,
  BookOpen,
  Trash2,
} from 'lucide-react'
import {
  DAILY_READING_ARTICLES,
  type DailyReadingArticle,
  type ReadingSentence,
  type ReadingParagraph,
  analyzeSentenceGrammarTree,
} from '../../data/dailyReadingData'
import { api, type BookItem } from '../../services/api'
import { authService } from '../../services/auth'
import MarkdownRenderer from '../MarkdownRenderer'
import WordLookupPopover, {
  useEnglishWordLookup,
  saveWordToEbbinghaus,
  speakEnglishText,
  generateLemmaCandidates,
} from './WordLookupPopover'

const STORAGE_KEY_READING_CHECKIN = 'coreforge_english_reading_checkin_v1'
const STORAGE_KEY_SAVED_WORDS = 'coreforge_english_saved_reading_words_v1'
const STORAGE_KEY_CUSTOM_ARTICLES = 'coreforge_english_custom_articles_v1'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

/**
 * 将用户粘贴的任意英文段落精准切分为结构化段落与句子，生成可挂载至左侧主阅读器的动态 Article
 */
function buildDynamicArticleFromText(
  rawText: string,
  customTitle?: string
): DailyReadingArticle {
  const cleaned = rawText.replace(/\r\n/g, '\n').trim()
  const rawParas = cleaned
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  let globalSentenceIdx = 1
  const paragraphs: ReadingParagraph[] = rawParas.map((paraEn, idx) => {
    // 保护常见缩写点号后按句末标点切句
    const protectedText = paraEn.replace(
      /\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|U\.S|U\.K)\./gi,
      '$1∯'
    )
    const rawSentences = protectedText
      .split(/(?<=[.!?])\s+(?=[A-Z"“'])/)
      .map((s) => s.replace(/∯/g, '.').trim())
      .filter(Boolean)

    const sentenceList = rawSentences.length > 0 ? rawSentences : [paraEn]
    const sentences: ReadingSentence[] = sentenceList.map((senEn) => {
      const wordsInSen = senEn.match(/[a-zA-Z'-]+/g) || []
      const hasComplexConnector =
        /\b(which|that|although|though|whereas|while|despite|because|whether|whereby|through which|in which)\b/i.test(
          senEn
        )
      const isHard = wordsInSen.length >= 22 || (wordsInSen.length >= 16 && hasComplexConnector)
      const sObj: ReadingSentence = {
        sentenceIndex: globalSentenceIdx++,
        en: senEn,
        zh: '（点击右侧 AI 伴读获取逐句精译与命题剖析，或点击任意单词即点即查）',
        isHardLongSentence: isHard,
        treeAnalysis: isHard ? analyzeSentenceGrammarTree(senEn) : undefined,
      }
      return sObj
    })

    return {
      index: idx + 1,
      en: paraEn,
      zh: '',
      corePoint: `自选外刊第 ${idx + 1} 段（共 ${sentences.length} 句）`,
      sentences,
    }
  })

  const totalWords = (cleaned.match(/[a-zA-Z'-]+/g) || []).length
  const firstSentenceWords = (paragraphs[0]?.sentences[0]?.en || 'Custom Reading Passage')
    .split(/\s+/)
    .slice(0, 9)
    .join(' ')
  const derivedTitle =
    customTitle?.trim() ||
    (firstSentenceWords.length > 56 ? firstSentenceWords.slice(0, 56) + '...' : firstSentenceWords)

  return {
    id: `custom_art_${Date.now()}`,
    title: derivedTitle,
    sourceJournal: 'The Economist',
    sourceDate: '自选外刊精读 · 实时导入',
    topicCategory: '文化社会',
    lexileLevel: totalWords > 260 ? '1280L' : '1180L',
    wordCount: totalWords,
    recommendedMinutes: Math.max(5, Math.round(totalWords / 35)),
    examRelevance: '用户自选外刊源文 · 支持即点即查与流式 AI 长难句精析',
    abstractZh: '正在为您流式生成本篇自选外刊的中文核心导读、考研生词提取与长难句剖析...',
    authorAttitude: '结合上下文动态研判中',
    keyVocab: [],
    paragraphs,
    mockQuestions: [],
  }
}

export default function DailyReadingTab() {
  // 自定义导入的外刊文章列表（持久化保存）
  const [customArticles, setCustomArticles] = useState<DailyReadingArticle[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_ARTICLES)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const allArticles = useMemo(
    () => [...customArticles, ...DAILY_READING_ARTICLES],
    [customArticles]
  )

  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    () => allArticles[0]?.id || DAILY_READING_ARTICLES[0].id
  )

  // 自定义贴入抽屉状态与英语书架讲义导入支持
  const [isCustomDrawerOpen, setIsCustomDrawerOpen] = useState(false)
  const [customTitleInput, setCustomTitleInput] = useState('')
  const [customInputText, setCustomInputText] = useState('')
  const [englishTextBooks, setEnglishTextBooks] = useState<BookItem[]>([])
  const [loadingBookSnippet, setLoadingBookSnippet] = useState<string | null>(null)

  // 阅读交互状态
  const [activeSentence, setActiveSentence] = useState<ReadingSentence | null>(null)
  const [showBilingual, setShowBilingual] = useState(true)
  const [highlightHardOnly, setHighlightHardOnly] = useState(false)
  const [mobileCompanionOpen, setMobileCompanionOpen] = useState(false)
  const [windowMode, setWindowMode] = useState<'half' | 'full' | 'minimized'>('half')
  const [sideTab, setSideTab] = useState<'companion' | 'vocab' | 'quiz'>('companion')

  // AI 伴读流式对话记录
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content:
        '👋 你好！我是你的 **考研英语文献精读 AI 伴读导师**。\n\n你可以点击左侧任意英文单词**即点即查并写入艾宾浩斯生词库**，点击任意句子进行长难句主干解剖，或者点击顶栏 **「贴入自选外刊」** 导入你自己的英文材料进行流式深度精读！',
      timestamp: '刚刚',
    },
  ])
  const [inputQuestion, setInputQuestion] = useState('')
  const [isAiReplying, setIsAiReplying] = useState(false)
  const [vocabToast, setVocabToast] = useState<string | null>(null)
  const chatBottomRef = useRef<HTMLDivElement | null>(null)

  // 配套测试题作答状态
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({})
  const [showAnalysis, setShowAnalysis] = useState<Record<string, boolean>>({})

  // 打卡状态与生词收藏持久化
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

  // 正文即点即查 Hook
  const {
    lookupState,
    closeLookup,
    handleWordLookupClick,
    handleWordLookupDoubleClick,
  } = useEnglishWordLookup()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_ARTICLES, JSON.stringify(customArticles))
    } catch {
      // ignore
    }
  }, [customArticles])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_READING_CHECKIN, JSON.stringify(checkinMap))
    } catch {
      // ignore
    }
  }, [checkinMap])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_WORDS, JSON.stringify(savedWords))
    } catch {
      // ignore
    }
  }, [savedWords])

  // 监听来自 WordLookupPopover 的生词收藏广播，保持计数与星标同步
  useEffect(() => {
    const onSaved = (ev: Event) => {
      const word = (ev as CustomEvent<{ word?: string }>).detail?.word
      if (word) {
        setSavedWords((prev) => ({ ...prev, [word]: true, [word.toLowerCase()]: true }))
      }
    }
    window.addEventListener('english-vocab-saved', onSaved)
    return () => window.removeEventListener('english-vocab-saved', onSaved)
  }, [])

  // 当打开自定义贴入抽屉时，加载已上传的可读英语讲义供一键导入段落
  useEffect(() => {
    if (!isCustomDrawerOpen) return
    api
      .getBooks()
      .then((res) => {
        const list = (res.books || []).filter(
          (b) => b.domain === 'english' && (b.isTextReadable || !b.isPdf)
        )
        setEnglishTextBooks(list.slice(0, 8))
      })
      .catch(() => {})
  }, [isCustomDrawerOpen])

  const currentArticle = useMemo(() => {
    return allArticles.find((a) => a.id === selectedArticleId) || allArticles[0]
  }, [allArticles, selectedArticleId])

  const isCurrentCustom = currentArticle.id.startsWith('custom_art_')

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // 为动态外刊从本地大纲词库扫描提取真实出现在该篇正文中的核心考研词汇（杜绝任何旧文章词表串台！）
  const populateVocabFromLocalPool = useCallback(async (articleId: string, fullText: string) => {
    try {
      const mod = await import('@shared/data/vocabulary')
      const pool = (mod.VOCAB_POOL || []) as Array<{
        word: string
        phonetic: string
        definition: string
        frequency?: string
      }>
      const poolMap = new Map(pool.map((item) => [item.word.toLowerCase(), item]))
      const rawTokens = fullText.match(/[a-zA-Z]{4,}/g) || []
      const seen = new Set<string>()
      const matchedVocab: DailyReadingArticle['keyVocab'] = []

      for (const tok of rawTokens) {
        const cands = generateLemmaCandidates(tok)
        for (const cand of cands) {
          const hit = poolMap.get(cand)
          if (hit && !seen.has(hit.word.toLowerCase())) {
            seen.add(hit.word.toLowerCase())
            matchedVocab.push({
              word: hit.word,
              phonetic: hit.phonetic || '',
              meaning: hit.definition,
              isKaoYanCrucial: hit.frequency === '高频',
            })
            break
          }
        }
        if (matchedVocab.length >= 15) break
      }

      if (matchedVocab.length > 0) {
        setCustomArticles((prev) =>
          prev.map((a) => (a.id === articleId ? { ...a, keyVocab: matchedVocab } : a))
        )
      }
    } catch {
      // ignore
    }
  }, [])

  // 核心流式 SSE AI 伴读引擎（调用 /api/local-agents/chat，彻底废除 2.5s 硬编码超时与旧文章串台回退！）
  const streamAiCompanionResponse = useCallback(
    async (
      userDisplayText: string,
      systemPromptText: string,
      targetArticle: DailyReadingArticle,
      onCompleteText?: (finalText: string) => void
    ) => {
      if (isAiReplying) return
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const userMsgId = `u-${Date.now()}`
      const assistantMsgId = `a-${Date.now() + 1}`

      setChatMessages((prev) => [
        ...prev,
        { id: userMsgId, role: 'user', content: userDisplayText, timestamp: nowStr },
        { id: assistantMsgId, role: 'assistant', content: '', timestamp: nowStr },
      ])
      setIsAiReplying(true)

      const fullArticleContent = targetArticle.paragraphs.map((p) => p.en).join('\n\n')
      const finalMessage = `【考研英语外刊精读真实原文上下文】
篇目：《${targetArticle.title}》
当前聚焦句：${activeSentence ? activeSentence.en : '通读全篇'}

【英文原文全文】：
"""
${fullArticleContent.slice(0, 4500)}
"""

【学生指令/提问】：
${systemPromptText}

请以考研英语阅卷组名师与外刊精读导师身份，严格基于上方提供的【英文原文全文】（严禁脱离本文编造无关内容），用清晰结构化的简体中文给出深度精析。`

      try {
        const res = await fetch('/api/local-agents/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders(),
          },
          body: JSON.stringify({
            message: finalMessage,
            agentId: 'mojuan',
            history: chatMessages
              .slice(-4)
              .filter((m) => m.content.trim().length > 0)
              .map((m) => ({ role: m.role, content: m.content })),
            projectName: '考研英语研学中枢 · 每日外刊精读',
            pageContext: '外刊精读流式导读、生词提取与长难句语法精析',
          }),
        })

        if (!res.ok) {
          if (res.status === 402) {
            throw new Error('伴学积分不足（单次精析消耗 0.1 积分），请签到领取积分后重试。')
          }
          throw new Error(`AI 伴读服务响应异常 (HTTP ${res.status})`)
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('流式读取器不可用')
        const decoder = new TextDecoder()
        let buffer = ''
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const chunks = buffer.split('\n\n')
          buffer = chunks.pop() || ''

          for (const chunk of chunks) {
            const trimmed = chunk.trim()
            if (!trimmed.startsWith('data:')) continue
            try {
              const payload = JSON.parse(trimmed.replace(/^data:\s*/, ''))
              if (payload.type === 'delta' && payload.text) {
                accumulated += payload.text
                setChatMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulated } : m
                  )
                )
              } else if (payload.type === 'error') {
                throw new Error(payload.message || 'AI 流式输出中断')
              }
            } catch (innerErr: any) {
              if (innerErr?.message && !innerErr.message.includes('JSON')) {
                throw innerErr
              }
            }
          }
        }

        if (accumulated.trim()) {
          onCompleteText?.(accumulated)
        } else {
          setChatMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: '⚠️ AI 未返回有效文本，请稍后点击重试。' }
                : m
            )
          )
        }
      } catch (err: any) {
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: `⚠️ AI 伴读请求未能完成：${err?.message || '网络连接异常'}。\n\n💡 您仍可直接点击左侧任意英文单词呼出**即点即查词典**，或点击长难句查看本地语法骨架树！`,
                }
              : m
          )
        )
      } finally {
        setIsAiReplying(false)
      }
    },
    [activeSentence, chatMessages, isAiReplying]
  )

  const handleSelectArticle = (art: DailyReadingArticle) => {
    setSelectedArticleId(art.id)
    setActiveSentence(null)
    setUserAnswers({})
    setShowAnalysis({})
    setIsCustomDrawerOpen(false)
    setChatMessages([
      {
        id: `init-${art.id}-${Date.now()}`,
        role: 'assistant',
        content: `📖 已切换至精读文献 **《${art.title}》**！\n\n点击左侧任意单词可即点即查入库艾宾浩斯，点击任意句子可聚焦拆解语法骨架，或在下方发起流式提问。`,
        timestamp: '刚刚',
      },
    ])
  }

  const handleDeleteCustomArticle = (artId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const remaining = customArticles.filter((a) => a.id !== artId)
    setCustomArticles(remaining)
    if (selectedArticleId === artId) {
      setSelectedArticleId(remaining[0]?.id || DAILY_READING_ARTICLES[0].id)
    }
  }

  // 从用户已上传的英语讲义/资料中读取英文段落填入自选输入框
  const handleImportFromBook = async (book: BookItem) => {
    setLoadingBookSnippet(book.id)
    try {
      const res = await api.readBook(book.relativePath, book.scope)
      const raw = (res.content || '').trim()
      // 提取其中英文占比较高的连续段落
      const blocks = raw
        .split(/\n{2,}/)
        .map((b) => b.replace(/^[#>*\-\s]+/gm, '').trim())
        .filter((b) => (b.match(/[a-zA-Z]{3,}/g) || []).length >= 18)
      const snippet = blocks.slice(0, 4).join('\n\n') || raw.slice(0, 1500)
      setCustomTitleInput(book.name.replace(/\.[^.]+$/, ''))
      setCustomInputText(snippet)
    } catch (err: any) {
      alert('读取讲义文本失败：' + (err?.message || '请确认该文档支持文本读取'))
    } finally {
      setLoadingBookSnippet(null)
    }
  }

  // 挂载用户贴入的自选外刊至左侧主阅读器，并立即启动流式 AI 导读 + 核心生词 + 长难句精析
  const handleMountCustomArticleAndAnalyze = async () => {
    const trimmed = customInputText.trim()
    if (!trimmed) return
    const englishWordCount = (trimmed.match(/[a-zA-Z]+/g) || []).length
    if (englishWordCount < 8) {
      alert('请粘贴至少包含一个完整英文句子的外刊或真题段落。')
      return
    }

    const dynamicArt = buildDynamicArticleFromText(trimmed, customTitleInput)
    setCustomArticles((prev) => [dynamicArt, ...prev.slice(0, 9)])
    setSelectedArticleId(dynamicArt.id)
    setActiveSentence(null)
    setIsCustomDrawerOpen(false)
    setSideTab('companion')
    setCustomInputText('')
    setCustomTitleInput('')

    // 1. 立即用本地 2000+ 大纲词库扫描这篇新外刊提取真实生词
    populateVocabFromLocalPool(dynamicArt.id, trimmed)

    // 2. 启动流式 SSE 深度导读与长难句精析，并在完成后回填导读摘要
    await streamAiCompanionResponse(
      `📖 已载入自选外刊《${dynamicArt.title}》，请生成全文导读、核心考研生词与长难句精析`,
      `请针对我刚贴入的这篇英文外刊完成以下三项深度精析：
1. **【全文主旨导读与作者态度】**：用 2~3 句话精准概括本文核心论点、行文脉络及作者态度倾向；
2. **【考研核心生词与熟词生义】**：提取文中 5~8 个最具考研命题价值的高级词汇或熟词生义短语（给出音标、在本文中的精准词义及记忆法）；
3. **【重点长难句语法树与译文对照】**：挑选文中结构最复杂的 2~3 个长难句，拆解【主句主干】与【修饰从句】，并给出地道流畅的中文参考译文。`,
      dynamicArt,
      (finalText) => {
        // 提取首段导读更新到顶部文章摘要栏
        const summaryClean = finalText
          .replace(/[#*>`]/g, '')
          .split('\n')
          .map((l) => l.trim())
          .find((l) => l.length >= 24 && !l.startsWith('1.') && !l.includes('全文主旨导读'))
        if (summaryClean) {
          setCustomArticles((prev) =>
            prev.map((a) =>
              a.id === dynamicArt.id
                ? {
                    ...a,
                    abstractZh:
                      summaryClean.length > 160
                        ? summaryClean.slice(0, 158) + '...'
                        : summaryClean,
                    authorAttitude: 'AI 已完成全文精析（详见右侧伴读面板）',
                  }
                : a
            )
          )
        }
      }
    )
  }

  const toggleCheckin = () => {
    setCheckinMap((prev) => ({
      ...prev,
      [currentArticle.id]: !prev[currentArticle.id],
    }))
  }

  // 修复侧边栏生词“假收藏”：同步真实写入后端艾宾浩斯背单词词库！
  const handleRealSaveSideWord = async (v: {
    word: string
    phonetic: string
    meaning: string
    familiarMeaningDifferent?: string
  }) => {
    const alreadySaved = Boolean(savedWords[v.word] || savedWords[v.word.toLowerCase()])
    setSavedWords((prev) => ({
      ...prev,
      [v.word]: true,
      [v.word.toLowerCase()]: true,
    }))

    try {
      // 从当前文章中寻找包含该词的原句作为真实记忆例句
      let exampleSentence = ''
      for (const p of currentArticle.paragraphs) {
        const hitSen = p.sentences.find((s) =>
          s.en.toLowerCase().includes(v.word.toLowerCase())
        )
        if (hitSen) {
          exampleSentence = hitSen.en
          break
        }
      }

      await saveWordToEbbinghaus({
        word: v.word,
        phonetic: v.phonetic,
        definition: v.familiarMeaningDifferent
          ? `${v.meaning}（${v.familiarMeaningDifferent}）`
          : v.meaning,
        example: exampleSentence || `From "${currentArticle.title}"`,
      })

      setVocabToast(
        alreadySaved
          ? `「${v.word}」已更新同步至艾宾浩斯复习库`
          : `⭐「${v.word}」已真实加入艾宾浩斯背单词队列！`
      )
      setTimeout(() => setVocabToast(null), 2600)
    } catch (err: any) {
      setVocabToast(err?.message || '同步词库失败，已暂存本地')
      setTimeout(() => setVocabToast(null), 2600)
    }
  }

  // 发送伴读提问（全面走流式 /api/local-agents/chat，零硬编码短超时，零跨篇串台）
  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuestion).trim()
    if (!q || isAiReplying) return
    setInputQuestion('')
    await streamAiCompanionResponse(q, q, currentArticle)
  }

  const handleSentenceClick = (sen: ReadingSentence) => {
    setActiveSentence(sen)
    if (sen.isHardLongSentence && sideTab === 'companion') {
      const analysis = sen.treeAnalysis || analyzeSentenceGrammarTree(sen.en)
      const zhLine =
        sen.zh && !sen.zh.startsWith('（点击右侧')
          ? `\n💡 **译文参考**：${sen.zh}`
          : ''
      setChatMessages((prev) => [
        ...prev,
        {
          id: `sen-${Date.now()}`,
          role: 'assistant',
          content: `🔍 **【长难句结构速览】**\n> *"${sen.en}"*\n\n🌳 **主句主干**：${analysis.mainTrunk}\n📌 **从句层级**：${analysis.clauseInfo}${zhLine}`,
          timestamp: '刚刚',
        },
      ])
    }
  }

  const totalCheckedIn = Object.values(checkinMap).filter(Boolean).length
  // 去重统计真实已收藏单词数（避免大小写重复计数）
  const totalSavedWordsCount = useMemo(() => {
    const uniqueLower = new Set(
      Object.entries(savedWords)
        .filter(([, val]) => Boolean(val))
        .map(([k]) => k.toLowerCase())
    )
    return uniqueLower.size
  }, [savedWords])

  const renderCompanionCard = (isModal = false) => {
    return (
      <div
        className={`space-y-4 ${
          isModal
            ? ''
            : 'bento-card rounded-3xl p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs'
        }`}
      >
        {!isModal && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-3 w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div className="flex flex-col min-w-0">
                <div className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">考研英语 AI 伴读导师</span>
                </div>
                <span className="text-2xs text-slate-400 truncate">
                  流式深度精析 · 真实同步艾宾浩斯词库
                </span>
              </div>
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setSideTab('companion')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  sideTab === 'companion'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                伴读对话
              </button>
              <button
                type="button"
                onClick={() => setSideTab('vocab')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  sideTab === 'vocab'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                生词({currentArticle.keyVocab.length})
              </button>
              {currentArticle.mockQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSideTab('quiz')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sideTab === 'quiz'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  模考
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: AI 伴读流式对话流 */}
        {sideTab === 'companion' && (
          <div className="space-y-3">
            <div
              className={`${
                isModal
                  ? 'space-y-3 p-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs'
                  : 'h-[390px] overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs no-scrollbar'
              }`}
            >
              {chatMessages.map((msg) => {
                const isUser = msg.role === 'user'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div
                      className={`max-w-[94%] p-3 rounded-2xl leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none whitespace-pre-wrap'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 shadow-xs rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        msg.content
                      ) : msg.content ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-300 animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>正在结合当前外刊原文推演...</span>
                        </span>
                      )}
                    </div>
                    <span className="text-2xs text-slate-400 font-mono px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                )
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* 快捷提问探针 */}
            <div className="space-y-1.5">
              <div className="text-2xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>针对本篇外刊一键提问：</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '总结本文核心论点与作者态度',
                  '提取本文考研熟词生义清单',
                  '预测本篇真题同义替换命题点',
                  activeSentence
                    ? `深度拆解并翻译当前选中的第 ${activeSentence.sentenceIndex} 句`
                    : '挑选本文最难长难句做语法树拆解',
                ].map((promptText) => (
                  <button
                    key={promptText}
                    type="button"
                    disabled={isAiReplying}
                    onClick={() => handleSendMessage(promptText)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 text-2xs font-bold transition-all cursor-pointer disabled:opacity-50"
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
                placeholder="向 AI 伴读提问本篇词汇、语法或翻译..."
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isAiReplying}
                className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: 生词与熟词生义速查本（真实接入艾宾浩斯复习词库） */}
        {sideTab === 'vocab' && (
          <div className={`space-y-3 ${isModal ? '' : 'max-h-[460px] overflow-y-auto no-scrollbar'}`}>
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              点击右侧收藏按钮，生词将**真实写入艾宾浩斯背单词词库**并进入今日复习队列（同时您也可直接点击左侧英文正文任意单词即点即查）：
            </div>

            {vocabToast && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-fade-in">
                {vocabToast}
              </div>
            )}

            {currentArticle.keyVocab.length > 0 ? (
              <div className="space-y-2">
                {currentArticle.keyVocab.map((v) => {
                  const isSaved = Boolean(savedWords[v.word] || savedWords[v.word.toLowerCase()])
                  return (
                    <div
                      key={v.word}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black font-serif text-slate-900 dark:text-slate-100">
                            {v.word}
                          </span>
                          <span className="text-2xs font-mono text-slate-400">{v.phonetic}</span>
                          {v.isKaoYanCrucial && (
                            <span className="px-1.5 py-0.2 rounded text-2xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300">
                              核心考词
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                          {v.meaning}
                        </div>
                        {v.familiarMeaningDifferent && (
                          <div className="text-2xs font-bold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800/60">
                            {v.familiarMeaningDifferent}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => speakEnglishText(v.word, 'en-US')}
                          className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
                          title="美音朗读"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRealSaveSideWord(v)}
                          className={`p-1.5 rounded-xl transition-all cursor-pointer border ${
                            isSaved
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                              : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-600 border-slate-200 dark:border-slate-700'
                          }`}
                          title={isSaved ? '已同步至艾宾浩斯词库' : '加入艾宾浩斯背单词词库'}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                可直接点击左侧外刊正文任意英文单词即点即查并收藏入库，或在伴读对话点击「提取本文考研熟词生义清单」。
              </div>
            )}
          </div>
        )}

        {/* TAB 3: 真题级配套模考题 */}
        {sideTab === 'quiz' && currentArticle.mockQuestions.length > 0 && (
          <div className={`space-y-4 ${isModal ? '' : 'max-h-[460px] overflow-y-auto no-scrollbar'}`}>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              基于本篇外刊命制的考研真题同源模考题 (共 {currentArticle.mockQuestions.length} 题)：
            </div>
            {currentArticle.mockQuestions.map((q, idx) => {
              const chosen = userAnswers[q.id]
              const isSubmitted = Boolean(chosen)
              const isCorrect = chosen === q.answer

              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span>
                      第 {idx + 1} 题 · {q.type}
                    </span>
                    {isSubmitted && (
                      <span className={`font-black ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isCorrect ? '✓ 回答正确' : `✗ 回答错误 (答案: ${q.answer})`}
                      </span>
                    )}
                  </div>

                  <div className="font-serif text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {q.stem}
                  </div>

                  <div className="space-y-1.5">
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
                          className={`w-full text-left p-2.5 rounded-xl font-serif text-[13.5px] border transition-all cursor-pointer flex items-center gap-2 ${
                            isPicked
                              ? isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-950 dark:text-emerald-100 font-bold'
                                : 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 text-rose-950 dark:text-rose-100 font-bold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center shrink-0">
                            {optKey}
                          </span>
                          <span className="leading-relaxed">{q.options[optKey]}</span>
                        </button>
                      )
                    })}
                  </div>

                  {showAnalysis[q.id] && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        📋 考研真题命题解析：
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {q.analysis}
                      </p>
                      <div className="text-2xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-lg">
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
    )
  }

  return (
    <div className="space-y-4 animate-fade-in-up text-slate-900 dark:text-slate-100">
      <WordLookupPopover state={lookupState} onClose={closeLookup} />

      {/* ── 顶部仪表盘：外刊源刊档案与今日精读打卡 ── */}
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-2xs font-black shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isCurrentCustom ? '自选外刊动态精读舱' : '考研外刊真题同源精读'}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-2xs font-mono font-bold">
                {isCurrentCustom ? 'Custom Source' : currentArticle.sourceJournal}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-2xs font-mono">
                蓝思难度 {currentArticle.lexileLevel}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-2xs font-mono">
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

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs text-slate-400">已打卡文献</div>
                <div className="text-base font-black text-amber-300">
                  {totalCheckedIn} / {allArticles.length}
                </div>
              </div>
              <div className="w-px h-7 bg-white/10" />
              <div className="text-center">
                <div className="text-xs text-slate-400">入库生词</div>
                <div className="text-base font-black text-sky-300">{totalSavedWordsCount} 词</div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleCheckin}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95 ${
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

      {/* ── 筛选栏：内置与自选文献切换、贴入自选外刊、中英对照开关 ── */}
      <div className="bento-card rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 bg-white/95 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {/* 用户自定义导入的外刊胶囊 */}
          {customArticles.map((art) => {
            const isSelected = art.id === currentArticle.id && !isCustomDrawerOpen
            return (
              <div
                key={art.id}
                onClick={() => handleSelectArticle(art)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                }`}
              >
                <span>📝</span>
                <span className="max-w-[130px] truncate">{art.title}</span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteCustomArticle(art.id, e)}
                  className="p-0.5 rounded hover:bg-black/15 opacity-75 hover:opacity-100 cursor-pointer"
                  title="移除此自选篇章"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )
          })}

          {/* 内置权威外刊列表 */}
          {DAILY_READING_ARTICLES.map((art) => {
            const isSelected = art.id === currentArticle.id && !isCustomDrawerOpen
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => handleSelectArticle(art)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                <span>
                  {art.sourceJournal === 'The Economist'
                    ? '📊'
                    : art.sourceJournal === 'Harvard Business Review'
                    ? '💼'
                    : '🧠'}
                </span>
                <span>{art.topicCategory}</span>
                <span className="opacity-70 text-2xs font-mono">
                  ({art.sourceJournal.split(' ')[0]})
                </span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setIsCustomDrawerOpen((v) => !v)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              isCustomDrawerOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
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
            onClick={() => setMobileCompanionOpen(true)}
            className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI 伴读</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBilingual((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
              showBilingual
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            }`}
          >
            {showBilingual ? (
              <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="sm:hidden">{showBilingual ? '中英' : '纯英'}</span>
            <span className="hidden sm:inline">{showBilingual ? '中英对照' : '纯英沉浸'}</span>
          </button>

          <button
            type="button"
            onClick={() => setHighlightHardOnly((v) => !v)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
              highlightHardOnly
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">长难句</span>
            <span className="hidden sm:inline">只看长难句</span>
          </button>
        </div>
      </div>

      {/* ── 自定义外刊输入与讲义段落导入抽屉 ── */}
      {isCustomDrawerOpen && (
        <div className="bento-card rounded-3xl p-5 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/70 space-y-3.5 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                贴入自选英文外刊 / 从已上传英语讲义导入段落
              </h3>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">
              载入后将挂载至左侧主阅读器（支持逐句聚焦、点词即查入库与流式 AI 全文精析）
            </span>
          </div>

          {/* 若书架中有已上传的英语讲义，支持一键抽取段落 */}
          {englishTextBooks.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>从书架英语讲义导入：</span>
              </span>
              {englishTextBooks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  disabled={loadingBookSnippet === b.id}
                  onClick={() => handleImportFromBook(b)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {loadingBookSnippet === b.id ? '读取中...' : `📄 ${b.name}`}
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={customTitleInput}
            onChange={(e) => setCustomTitleInput(e.target.value)}
            placeholder="可选：输入外刊标题（留空将自动取首句提炼标题）..."
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <textarea
            rows={5}
            value={customInputText}
            onChange={(e) => setCustomInputText(e.target.value)}
            placeholder="请在此粘贴任意英文外刊段落或真题原文（如 The Economist, The Guardian, Scientific American 等），点击下方按钮直接载入左侧主精读阅读器..."
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-serif text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              已输入 {(customInputText.match(/[a-zA-Z]+/g) || []).length} 个英文词
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustomDrawerOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                收起
              </button>
              <button
                type="button"
                disabled={!customInputText.trim() || isAiReplying}
                onClick={handleMountCustomArticleAndAnalyze}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>载入左侧主阅读器并流式精析</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 主体双栏：左侧段落句句精读（支持点词即查） + 右侧 AI 伴读导师舱 ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        <div
          onClick={handleWordLookupClick}
          onDoubleClick={handleWordLookupDoubleClick}
          className="md:col-span-7 space-y-4"
        >
          {currentArticle.paragraphs.map((p) => {
            return (
              <div
                key={p.index}
                className="bento-card rounded-3xl p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-indigo-600 text-white text-2xs font-black flex items-center justify-center">
                      P{p.index}
                    </span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">
                      {p.corePoint}
                    </span>
                  </div>
                  {p.examTrapAlert && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-2xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>题眼探针</span>
                    </span>
                  )}
                </div>

                {/* 句句学术衬线精读区 */}
                <div className="space-y-3.5 font-serif">
                  {p.sentences.map((sen) => {
                    const isSelected =
                      activeSentence?.sentenceIndex === sen.sentenceIndex &&
                      activeSentence?.en === sen.en
                    const isHard = sen.isHardLongSentence

                    if (highlightHardOnly && !isHard) {
                      return null
                    }

                    return (
                      <div
                        key={sen.sentenceIndex}
                        onClick={() => handleSentenceClick(sen)}
                        className={`p-3.5 rounded-2xl transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-amber-50/80 dark:bg-amber-950/35 border-amber-400 dark:border-amber-600 shadow-xs'
                            : isHard
                            ? 'bg-slate-50/70 dark:bg-slate-800/45 border-slate-200/90 dark:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                            : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="text-[15.5px] sm:text-[16.5px] text-slate-900 dark:text-slate-100 leading-[1.85] tracking-[0.01em] font-normal flex items-start gap-2">
                          {isHard && (
                            <span className="mt-1 shrink-0 px-1.5 py-0.2 rounded text-2xs font-sans font-bold bg-amber-500 text-slate-950">
                              长难句
                            </span>
                          )}
                          <span className={`${isSelected ? 'font-medium' : ''} select-text`}>
                            {sen.en}
                          </span>
                        </div>

                        {showBilingual && sen.zh && (
                          <div className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 font-sans leading-relaxed">
                            {sen.zh}
                          </div>
                        )}

                        {isSelected && sen.treeAnalysis && (
                          <div
                            data-no-word-lookup="true"
                            className="mt-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-amber-700 text-xs font-sans space-y-1.5 shadow-xs"
                          >
                            <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>语法树骨架层次解析：</span>
                            </div>
                            <div className="text-slate-800 dark:text-slate-100 font-serif text-xs bg-amber-50/60 dark:bg-amber-950/40 p-2 rounded-lg">
                              {sen.treeAnalysis.mainTrunk}
                            </div>
                            <div className="text-slate-600 dark:text-slate-300">
                              <strong className="text-indigo-700 dark:text-indigo-300">
                                从句层级：
                              </strong>{' '}
                              {sen.treeAnalysis.clauseInfo}
                            </div>
                            <div className="text-slate-600 dark:text-slate-300">
                              <strong className="text-slate-800 dark:text-slate-200">
                                修饰成分：
                              </strong>{' '}
                              {sen.treeAnalysis.modifierInfo}
                            </div>
                            {sen.kaoyanNote && (
                              <div className="text-rose-700 dark:text-rose-300 pt-1 border-t border-slate-100 dark:border-slate-800 font-medium">
                                💡 {sen.kaoyanNote}
                              </div>
                            )}

                            <button
                              type="button"
                              disabled={isAiReplying}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSendMessage(
                                  `请对当前这个长难句做深入语法树解剖、精准翻译与考研同义替换推演：\n"${sen.en}"`
                                )
                                setSideTab('companion')
                                setMobileCompanionOpen(true)
                              }}
                              className="mt-2 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
                            >
                              <Bot className="w-3.5 h-3.5" />
                              <span>呼出 AI 伴读：流式精讲此句与中文精译 →</span>
                            </button>
                          </div>
                        )}

                        {sen.keyWords && sen.keyWords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 font-sans">
                            {sen.keyWords.map((kw, i) => (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-medium border ${
                                  kw.isFamiliarDifferent
                                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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

        {/* 右侧：AI 伴读导师工作舱 */}
        <div className="hidden md:block md:col-span-5 space-y-3.5 sticky top-20">
          {renderCompanionCard(false)}
        </div>
      </div>

      {/* 移动端常驻灵动 AI 伴读悬浮胶囊 */}
      {(!mobileCompanionOpen || windowMode === 'minimized') && (
        <div className="md:hidden fixed right-3 bottom-20 z-40 animate-fade-in">
          <button
            type="button"
            onClick={() => {
              setMobileCompanionOpen(true)
              setWindowMode('half')
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-[0_4px_24px_rgba(79,70,229,0.45)] border border-indigo-400/50 active:scale-95 transition-all cursor-pointer"
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <Bot className="w-4 h-4 text-white" />
            <span className="text-xs font-black">AI 伴读</span>
            {activeSentence && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-2xs font-black">
                第{activeSentence.sentenceIndex}句
              </span>
            )}
          </button>
        </div>
      )}

      {/* 移动端 AI 伴读抽屉 */}
      {mobileCompanionOpen &&
        windowMode !== 'minimized' &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex flex-col justify-end md:hidden bg-slate-950/45 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setWindowMode('minimized')}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-xl border-t border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-out overflow-hidden ${
                windowMode === 'full' ? 'h-[92dvh]' : 'h-[58dvh]'
              }`}
            >
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/90 dark:bg-slate-800/80 rounded-t-3xl">
                <div className="flex items-center gap-2 min-w-0">
                  <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                    考研英语 AI 伴读
                  </span>
                  {activeSentence && (
                    <span className="text-2xs text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-full font-mono shrink-0">
                      第{activeSentence.sentenceIndex}句
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setWindowMode('minimized')}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all cursor-pointer"
                    aria-label="最小化伴读"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setWindowMode(windowMode === 'full' ? 'half' : 'full')}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all cursor-pointer"
                    aria-label="切换全屏"
                  >
                    {windowMode === 'full' ? (
                      <Minimize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileCompanionOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
                    aria-label="关闭伴读"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
                <div className="inline-flex w-full rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setSideTab('companion')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                      sideTab === 'companion'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-extrabold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    伴读对话
                  </button>
                  <button
                    type="button"
                    onClick={() => setSideTab('vocab')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                      sideTab === 'vocab'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-extrabold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    生词({currentArticle.keyVocab.length})
                  </button>
                  {currentArticle.mockQuestions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSideTab('quiz')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                        sideTab === 'quiz'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-extrabold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      真题模考
                    </button>
                  )}
                </div>
              </div>

              <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 space-y-3"
                style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
              >
                {renderCompanionCard(true)}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
