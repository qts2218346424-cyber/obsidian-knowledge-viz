import { api } from '../services/api'
import { DEFAULT_PROJECT_ID } from '../services/ai-workspace'

/**
 * 落地页免登录试玩状态持久化与注册后资产继承桥接器
 * 解决痛点：
 * 1. 内嵌试玩视窗 <-> 全屏试玩视窗切换时，问答、草稿、判分与升格进度 100% 无缝保留；
 * 2. 访客完成注册或登录后，自动将试玩期间产生的 AI 导师问答、做题错因与作文润色沉淀为个人空间的真实首篇笔记、AI 历史会话与错题记录。
 */

const STORAGE_KEY = 'coreforge_landing_trial_bridge_v1'
const CHANGE_EVENT = 'coreforge-trial-bridge-updated'

export interface PersistedDemoMessage {
  id: string
  role: 'user' | 'assistant'
  agentName?: string
  agentIcon?: string
  toolTrace?: string
  content: string
  noteRef?: { path: string; excerpt: string }
  peerReply?: { agentName: string; agentIcon: string; content: string }
  savedToReview?: boolean
  createdAt?: string
}

export interface PersistedMathAnswer {
  questionId: string
  tag: string
  title: string
  stem: string
  selectedOpt: 'A' | 'B' | 'C' | 'D' | null
  correctOpt: 'A' | 'B' | 'C' | 'D'
  submitted: boolean
  explanation: string
  trap: string
}

export interface TrialBridgeState {
  // 1. AI 导师试玩状态
  aiAgentId: '408' | 'math' | 'english' | 'politics'
  aiTone: 'rigorous' | 'exam' | 'followup'
  aiDualMode: boolean
  aiMessages: PersistedDemoMessage[]

  // 2. 考研数学试玩状态
  mathSubTab: 'taylor' | 'eigen' | 'quiz'
  mathQIdx: number
  mathAnswers: Record<string, PersistedMathAnswer>
  mathScratchpadDataUrl?: string

  // 3. 考研英语试玩状态
  englishSampleIdx: number
  englishUpgradedBySample: Record<string, Record<string, boolean>>
  englishInteracted: boolean

  // 4. 考研政治史纲试玩状态
  politicsNodeIdx: number
  politicsInteracted: boolean

  // 5. Bento 闪卡试玩标记
  flashcardRatedItems: Array<{
    subject: string
    question: string
    answer: string
    rating: string
  }>

  // 已执行过继承的用户 ID 列表（防止同一账号重复写入）
  inheritedUserIds: string[]
  updatedAt: number
}

const DEFAULT_BRIDGE_STATE: TrialBridgeState = {
  aiAgentId: '408',
  aiTone: 'rigorous',
  aiDualMode: false,
  aiMessages: [],
  mathSubTab: 'taylor',
  mathQIdx: 0,
  mathAnswers: {},
  mathScratchpadDataUrl: undefined,
  englishSampleIdx: 0,
  englishUpgradedBySample: { eng1: { t1: true } },
  englishInteracted: false,
  politicsNodeIdx: 0,
  politicsInteracted: false,
  flashcardRatedItems: [],
  inheritedUserIds: [],
  updatedAt: Date.now(),
}

export function loadTrialBridgeState(): TrialBridgeState {
  if (typeof window === 'undefined') return DEFAULT_BRIDGE_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_BRIDGE_STATE
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_BRIDGE_STATE,
      ...parsed,
      mathAnswers: parsed.mathAnswers || {},
      englishUpgradedBySample: parsed.englishUpgradedBySample || { eng1: { t1: true } },
      flashcardRatedItems: Array.isArray(parsed.flashcardRatedItems) ? parsed.flashcardRatedItems : [],
      inheritedUserIds: Array.isArray(parsed.inheritedUserIds) ? parsed.inheritedUserIds : [],
    }
  } catch {
    return DEFAULT_BRIDGE_STATE
  }
}

export function updateTrialBridgeState(
  updater: Partial<TrialBridgeState> | ((prev: TrialBridgeState) => Partial<TrialBridgeState>)
): TrialBridgeState {
  const prev = loadTrialBridgeState()
  const patch = typeof updater === 'function' ? updater(prev) : updater
  const next: TrialBridgeState = {
    ...prev,
    ...patch,
    updatedAt: Date.now(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }))
  } catch {
    // 忽略隐私模式配额限制
  }
  return next
}

export function subscribeTrialBridge(listener: (state: TrialBridgeState) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: Event) => {
    const custom = e as CustomEvent<TrialBridgeState>
    listener(custom.detail || loadTrialBridgeState())
  }
  window.addEventListener(CHANGE_EVENT, handler)
  return () => window.removeEventListener(CHANGE_EVENT, handler)
}

export interface TrialActivitySummary {
  aiTurnsCount: number
  savedReviewCount: number
  mathSubmittedCount: number
  englishInteracted: boolean
  flashcardRatedCount: number
  totalFootprints: number
}

/**
 * 统计访客在落地页试玩期间产生的有效学习足迹数量，用于实时展示「注册即可保留 N 项试玩成果」
 */
export function getTrialActivitySummary(state: TrialBridgeState = loadTrialBridgeState()): TrialActivitySummary {
  const userMsgs = state.aiMessages.filter((m) => m.role === 'user')
  const savedReviews = state.aiMessages.filter((m) => m.savedToReview)
  const mathSubmitted = Object.values(state.mathAnswers).filter((a) => a.submitted)
  const flashcardRatedCount = state.flashcardRatedItems.length

  const totalFootprints =
    userMsgs.length +
    savedReviews.length +
    mathSubmitted.length +
    (state.englishInteracted ? 1 : 0) +
    flashcardRatedCount

  return {
    aiTurnsCount: userMsgs.length,
    savedReviewCount: savedReviews.length,
    mathSubmittedCount: mathSubmitted.length,
    englishInteracted: state.englishInteracted,
    flashcardRatedCount,
    totalFootprints,
  }
}

export interface InheritResult {
  inherited: boolean
  notesCreated: number
  errorsSaved: number
  conversationsSynced: number
  notePath?: string
}

/**
 * 在用户完成注册或登录时调用：将试玩足迹自动沉淀至当前账号的个人笔记库、错题本与 AI 会话历史
 */
export async function inheritTrialDataToUserWorkspace(userId?: string): Promise<InheritResult> {
  if (!userId) {
    return { inherited: false, notesCreated: 0, errorsSaved: 0, conversationsSynced: 0 }
  }

  const state = loadTrialBridgeState()
  if (state.inheritedUserIds.includes(userId)) {
    return { inherited: false, notesCreated: 0, errorsSaved: 0, conversationsSynced: 0 }
  }

  const summary = getTrialActivitySummary(state)
  if (summary.totalFootprints === 0) {
    return { inherited: false, notesCreated: 0, errorsSaved: 0, conversationsSynced: 0 }
  }

  let notesCreated = 0
  let errorsSaved = 0
  let conversationsSynced = 0
  let createdNotePath: string | undefined

  const agentIdMap: Record<string, string> = {
    '408': '408-master',
    math: 'tang-shuo-math',
    english: 'english-mentor',
    politics: 'politics-mentor',
  }

  // 1. 同步 AI 导师试玩会话至个人对话历史（本地 + 云端 SQLite）
  const hasUserQuestion = state.aiMessages.some((m) => m.role === 'user')
  if (hasUserQuestion) {
    try {
      const firstUserMsg = state.aiMessages.find((m) => m.role === 'user')
      const convTitle = `试玩留存：${(firstUserMsg?.content || '考研核心考点答疑').slice(0, 22)}`
      const convId = `trial-conv-${Date.now()}`
      const nowIso = new Date().toISOString()

      const newConv = {
        id: convId,
        projectId: DEFAULT_PROJECT_ID,
        title: convTitle,
        agentId: agentIdMap[state.aiAgentId] || '408-master',
        createdAt: nowIso,
        messages: state.aiMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          agentName: m.agentName,
          agentIcon: m.agentIcon,
          toolCalls: [],
          citedNotes: m.noteRef
            ? [
                {
                  title: m.noteRef.path.split('/').pop()?.replace(/\.md$/, '') || '关联考点笔记',
                  path: m.noteRef.path,
                  excerpt: m.noteRef.excerpt,
                  tags: ['试玩留存'],
                },
              ]
            : undefined,
          isDual: Boolean(m.peerReply),
          peerResponse: m.peerReply
            ? {
                agentName: m.peerReply.agentName,
                agentIcon: m.peerReply.agentIcon,
                provider: 'antigravity' as const,
                model: 'deepseek-v4-flash',
                content: m.peerReply.content,
              }
            : undefined,
          timestamp: m.createdAt || nowIso,
        })),
      }

      const storageKey = `coreforge_study_conversations_${userId}`
      let existingConvs: any[] = []
      try {
        existingConvs = await api.getAiConversations()
      } catch {
        try {
          const localRaw = localStorage.getItem(storageKey)
          if (localRaw) existingConvs = JSON.parse(localRaw)
        } catch {
          existingConvs = []
        }
      }

      const merged = [newConv, ...(Array.isArray(existingConvs) ? existingConvs : [])].slice(0, 40)
      try {
        localStorage.setItem(storageKey, JSON.stringify(merged))
      } catch {}
      await api.saveAiConversations(merged).catch(() => {})
      conversationsSynced = 1
    } catch {
      // 容错不阻塞主流程
    }
  }

  // 2. 将试玩期间做错或提交的真题、标记待复习的问答及生疏闪卡导入个人错题本
  const mathSubmittedList = Object.values(state.mathAnswers).filter((a) => a.submitted)
  for (const ans of mathSubmittedList) {
    try {
      const isWrong = ans.selectedOpt !== ans.correctOpt
      await api.saveErrorQuestion({
        question: {
          id: `trial-math-${ans.questionId}`,
          domain: 'math',
          subject: '考研数学',
          chapter: ans.tag,
          question: `${ans.title}\n${ans.stem}`,
          answer: ans.correctOpt,
          explanation: `${ans.explanation}\n\n【易错警示】${ans.trap}`,
        },
        userAnswer: ans.selectedOpt || '未选',
        errorType: isWrong ? '概念不清' : '重点复盘',
        notes: isWrong
          ? '来自首页免登录试玩实验室错题自动留存，建议结合泰勒/特征值仿真课件复盘。'
          : '来自首页试玩实验室重点真题留存。',
      })
      errorsSaved += 1
    } catch {
      // 忽略单条异常
    }
  }

  // AI 试玩中被点击「存入错题复习队列」的卡片也同步入错题本
  const savedAiReviews = state.aiMessages.filter((m) => m.role === 'assistant' && m.savedToReview)
  for (let i = 0; i < savedAiReviews.length; i++) {
    const msg = savedAiReviews[i]
    const msgIndex = state.aiMessages.findIndex((x) => x.id === msg.id)
    const prevQuestion =
      msgIndex > 0 && state.aiMessages[msgIndex - 1]?.role === 'user'
        ? state.aiMessages[msgIndex - 1].content
        : '首页 AI 导师重点考点追问'
    try {
      await api.saveErrorQuestion({
        question: {
          id: `trial-ai-review-${Date.now()}-${i}`,
          domain: state.aiAgentId === 'math' ? 'math' : 'cs_408',
          subject: msg.agentName || 'AI 导师重点归纳',
          chapter: '试玩重难点留存',
          question: prevQuestion,
          answer: '见核心推导解析',
          explanation: msg.content,
        },
        userAnswer: '加入待复习队列',
        errorType: '重点复盘',
        notes: msg.noteRef ? `关联知识库路径：${msg.noteRef.path}` : '来自首页 AI 导师试玩收藏',
      })
      errorsSaved += 1
    } catch {}
  }

  // Bento 闪卡中被打标为「生疏」或「模糊」的卡片同样写入每日复习错题记录
  for (const fc of state.flashcardRatedItems) {
    if (fc.rating.includes('生疏') || fc.rating.includes('模糊')) {
      try {
        await api.addErrorLog({
          question: `[${fc.subject}] ${fc.question}`,
          userAnswer: fc.rating,
          correctAnswer: '核心解析复盘',
          explanation: fc.answer,
        })
        errorsSaved += 1
      } catch {}
    }
  }

  // 3. 自动生成首篇专属 Markdown 双链研学笔记，写入用户私有知识库沙盒
  const sections: string[] = [
    `# 我的首篇研核试玩留存笔记`,
    ``,
    `> 本文档由 **CoreForge 研核** 在您注册/登录时自动从首页试玩实验室无缝继承生成，支持随时编辑、添加双链或导出为本地标准 Markdown 文件。`,
    ``,
  ]

  if (hasUserQuestion) {
    sections.push(`## 一、AI 导师答疑推演记录`)
    for (const m of state.aiMessages) {
      if (m.id.startsWith('init-welcome') || m.id.startsWith('welcome-')) continue
      if (m.role === 'user') {
        sections.push(`\n### 提问：${m.content}`)
      } else {
        sections.push(`\n**${m.agentName || '专属导师'}解答：**\n\n${m.content}`)
        if (m.peerReply) {
          sections.push(`\n> **${m.peerReply.agentName}**：${m.peerReply.content}`)
        }
      }
    }
    sections.push(``)
  }

  if (mathSubmittedList.length > 0) {
    sections.push(`## 二、考研数学真题试玩复盘`)
    for (const ans of mathSubmittedList) {
      const statusText =
        ans.selectedOpt === ans.correctOpt
          ? `回答正确（所选：${ans.selectedOpt}）`
          : `待强化（误选：${ans.selectedOpt}，标准答案：${ans.correctOpt}）`
      sections.push(`\n### ${ans.title}`)
      sections.push(`- **考点模块**：${ans.tag}`)
      sections.push(`- **作答状态**：${statusText}`)
      sections.push(`- **核心分步推导**：\n${ans.explanation}`)
      sections.push(`- **考场防坑提醒**：${ans.trap}\n`)
    }
  }

  if (state.flashcardRatedItems.length > 0) {
    sections.push(`## 三、艾宾浩斯记忆闪卡初测记录`)
    for (const item of state.flashcardRatedItems) {
      sections.push(`- **[${item.subject}]** ${item.question}`)
      sections.push(`  - 自评熟练度：${item.rating}`)
      sections.push(`  - 核心要点：${item.answer}`)
    }
    sections.push(``)
  }

  if (state.englishInteracted) {
    sections.push(`## 四、考研英语一档高分表达升格摘录`)
    sections.push(`- \`many people lose their minds in\` → **\`a multitude of contemporaries succumb to digital distraction from\`**`)
    sections.push(`- \`I think\` → **\`I harbor the firm conviction that\`**`)
    sections.push(`- \`very good\` → **\`of paramount significance\`**`)
    sections.push(`- \`help us make better rules\` → **\`formulate constructive initiatives\`**\n`)
  }

  if (sections.length > 4) {
    const targetPath = '00-试玩留存笔记/首篇研学试玩精华.md'
    const markdownBody = sections.join('\n')
    const frontmatter = {
      title: '首篇研学试玩精华',
      tags: ['试玩留存', '考研复盘'],
      created: new Date().toISOString().slice(0, 10),
    }
    try {
      await api.createFile(targetPath, markdownBody, frontmatter)
      notesCreated = 1
      createdNotePath = targetPath
    } catch {
      try {
        await api.updateFile(targetPath, markdownBody, frontmatter)
        notesCreated = 1
        createdNotePath = targetPath
      } catch {}
    }
  }

  // 标记当前账号已完成继承
  updateTrialBridgeState((prev) => ({
    inheritedUserIds: Array.from(new Set([...prev.inheritedUserIds, userId])),
  }))

  return {
    inherited: notesCreated > 0 || errorsSaved > 0 || conversationsSynced > 0,
    notesCreated,
    errorsSaved,
    conversationsSynced,
    notePath: createdNotePath,
  }
}
