import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Volume2,
  Star,
  Check,
  Sparkles,
  X,
  Loader2,
  BookOpen,
  Quote,
} from 'lucide-react'
import { api } from '../../services/api'
import { authService } from '../../services/auth'

const SAVED_WORDS_STORAGE_KEY = 'coreforge_english_saved_reading_words_v1'

export interface LocalVocabEntry {
  word: string
  phonetic: string
  definition: string
  example?: string
  exampleCn?: string
  frequency?: string
  roots?: string
  synonyms?: string
}

export interface WordLookupState {
  surfaceWord: string
  contextSentence: string
  anchorRect: {
    top: number
    bottom: number
    left: number
    right: number
    width: number
    height: number
  }
}

export interface SaveVocabPayload {
  word: string
  phonetic?: string
  definition: string
  example?: string
  exampleCn?: string
}

// ── 模块级异步大纲词库单例缓存（按需懒加载，零首屏同步体积负担） ──
let vocabMapPromise: Promise<Map<string, LocalVocabEntry>> | null = null

function loadLocalVocabMap(): Promise<Map<string, LocalVocabEntry>> {
  if (!vocabMapPromise) {
    vocabMapPromise = import('@shared/data/vocabulary')
      .then((mod) => {
        const pool = (mod.VOCAB_POOL || []) as LocalVocabEntry[]
        const map = new Map<string, LocalVocabEntry>()
        for (const item of pool) {
          if (item.word) {
            map.set(item.word.trim().toLowerCase(), item)
          }
        }
        return map
      })
      .catch(() => new Map<string, LocalVocabEntry>())
  }
  return vocabMapPromise
}

// 常见不规则动词/名词复数还原表
const IRREGULAR_LEMMAS: Record<string, string> = {
  arose: 'arise',
  arisen: 'arise',
  awoke: 'awake',
  awoken: 'awake',
  bore: 'bear',
  borne: 'bear',
  born: 'bear',
  became: 'become',
  began: 'begin',
  begun: 'begin',
  bent: 'bend',
  bound: 'bind',
  blew: 'blow',
  blown: 'blow',
  broke: 'break',
  broken: 'break',
  bred: 'breed',
  brought: 'bring',
  built: 'build',
  bought: 'buy',
  caught: 'catch',
  chose: 'choose',
  chosen: 'choose',
  clung: 'cling',
  dealt: 'deal',
  dug: 'dig',
  drew: 'draw',
  drawn: 'draw',
  drove: 'drive',
  driven: 'drive',
  fell: 'fall',
  fallen: 'fall',
  fed: 'feed',
  felt: 'feel',
  fought: 'fight',
  found: 'find',
  fled: 'flee',
  flew: 'fly',
  flown: 'fly',
  forbade: 'forbid',
  forbidden: 'forbid',
  forgot: 'forget',
  forgotten: 'forget',
  forgave: 'forgive',
  forgiven: 'forgive',
  froze: 'freeze',
  frozen: 'freeze',
  gave: 'give',
  given: 'give',
  grew: 'grow',
  grown: 'grow',
  hung: 'hang',
  heard: 'hear',
  hid: 'hide',
  hidden: 'hide',
  held: 'hold',
  kept: 'keep',
  knew: 'know',
  known: 'know',
  laid: 'lay',
  led: 'lead',
  leapt: 'leap',
  learnt: 'learn',
  left: 'leave',
  lent: 'lend',
  lost: 'lose',
  meant: 'mean',
  met: 'meet',
  mistook: 'mistake',
  mistaken: 'mistake',
  overcame: 'overcome',
  paid: 'pay',
  proved: 'prove',
  proven: 'prove',
  rode: 'ride',
  ridden: 'ride',
  rang: 'ring',
  rung: 'ring',
  rose: 'rise',
  risen: 'rise',
  sang: 'sing',
  sung: 'sing',
  sank: 'sink',
  sunk: 'sink',
  sought: 'seek',
  sold: 'sell',
  sent: 'send',
  shook: 'shake',
  shaken: 'shake',
  shone: 'shine',
  shot: 'shoot',
  showed: 'show',
  shown: 'show',
  shrank: 'shrink',
  shrunk: 'shrink',
  slept: 'sleep',
  slid: 'slide',
  spoke: 'speak',
  spoken: 'speak',
  spent: 'spend',
  spread: 'spread',
  sprang: 'spring',
  sprung: 'spring',
  stood: 'stand',
  stole: 'steal',
  stolen: 'steal',
  stuck: 'stick',
  struck: 'strike',
  striven: 'strive',
  strove: 'strive',
  swore: 'swear',
  sworn: 'swear',
  swept: 'sweep',
  swelled: 'swell',
  swollen: 'swell',
  took: 'take',
  taken: 'take',
  taught: 'teach',
  tore: 'tear',
  torn: 'tear',
  told: 'tell',
  thought: 'think',
  threw: 'throw',
  thrown: 'throw',
  trod: 'tread',
  trodden: 'tread',
  underwent: 'undergo',
  undergone: 'undergo',
  understood: 'understand',
  undertook: 'undertake',
  undertaken: 'undertake',
  woke: 'wake',
  woken: 'wake',
  wore: 'wear',
  worn: 'wear',
  wove: 'weave',
  woven: 'weave',
  wept: 'weep',
  won: 'win',
  withdrew: 'withdraw',
  withdrawn: 'withdraw',
  wrote: 'write',
  written: 'write',
  phenomena: 'phenomenon',
  criteria: 'criterion',
  analyses: 'analysis',
  crises: 'crisis',
  hypotheses: 'hypothesis',
  theses: 'thesis',
  stimuli: 'stimulus',
  media: 'medium',
  curricula: 'curriculum',
  strata: 'stratum',
}

// 单击时自动忽略的高频基础功能虚词（双击选中时仍可查询）
const CLICK_IGNORE_STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can',
  'had', 'her', 'was', 'one', 'our', 'out', 'has', 'his', 'how', 'its',
  'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'did', 'get',
  'let', 'put', 'say', 'she', 'too', 'use', 'with', 'that', 'this', 'from',
  'have', 'they', 'were', 'been', 'their', 'what', 'when', 'where', 'which',
  'while', 'into', 'than', 'then', 'them', 'some', 'such', 'only', 'over',
  'also', 'more', 'most', 'very', 'will', 'would', 'could', 'should', 'about',
  'after', 'other', 'there', 'these', 'those', 'your', 'just', 'like', 'make',
  'made', 'many', 'much', 'even', 'back', 'well', 'down', 'work', 'first',
  'does', 'done', 'each', 'both', 'same', 'upon', 'onto', 'unto',
])

export function generateLemmaCandidates(rawWord: string): string[] {
  const lower = rawWord.toLowerCase().replace(/^['-]+|['-]+$/g, '')
  const candidates: string[] = []
  const pushUnique = (w: string) => {
    if (w && w.length >= 2 && !candidates.includes(w)) {
      candidates.push(w)
    }
  }

  pushUnique(lower)
  if (IRREGULAR_LEMMAS[lower]) {
    pushUnique(IRREGULAR_LEMMAS[lower])
  }

  // 所有格剥离
  if (lower.endsWith("'s") || lower.endsWith('’s')) {
    pushUnique(lower.slice(0, -2))
  }

  // 名词复数与三单词尾
  if (lower.endsWith('ies') && lower.length > 4) {
    pushUnique(lower.slice(0, -3) + 'y')
  }
  if (lower.endsWith('ves') && lower.length > 4) {
    pushUnique(lower.slice(0, -3) + 'f')
    pushUnique(lower.slice(0, -3) + 'fe')
  }
  if (lower.endsWith('es') && lower.length > 4) {
    pushUnique(lower.slice(0, -2))
    pushUnique(lower.slice(0, -1))
  }
  if (lower.endsWith('s') && !lower.endsWith('ss') && !lower.endsWith('us') && !lower.endsWith('is') && lower.length > 3) {
    pushUnique(lower.slice(0, -1))
  }

  // 过去式与过去分词 -ed
  if (lower.endsWith('ied') && lower.length > 4) {
    pushUnique(lower.slice(0, -3) + 'y')
  }
  if (lower.endsWith('ed') && lower.length > 4) {
    const stem = lower.slice(0, -2)
    pushUnique(stem)
    pushUnique(lower.slice(0, -1)) // e.g., reshaped -> reshape
    if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
      pushUnique(stem.slice(0, -1)) // e.g., stopped -> stop, suppressed -> suppress
    }
  }

  // 现在分词与动名词 -ing
  if (lower.endsWith('ying') && lower.length > 5) {
    pushUnique(lower.slice(0, -4) + 'ie')
  }
  if (lower.endsWith('ing') && lower.length > 5) {
    const stem = lower.slice(0, -3)
    pushUnique(stem)
    pushUnique(stem + 'e') // e.g., reshaping -> reshape
    if (stem.length >= 3 && stem[stem.length - 1] === stem[stem.length - 2]) {
      pushUnique(stem.slice(0, -1)) // e.g., running -> run
    }
  }

  // 副词与形容词比较级/最高级
  if (lower.endsWith('ily') && lower.length > 5) {
    pushUnique(lower.slice(0, -3) + 'y')
  }
  if (lower.endsWith('ly') && lower.length > 4) {
    pushUnique(lower.slice(0, -2))
    pushUnique(lower.slice(0, -2) + 'e')
  }
  if (lower.endsWith('er') && lower.length > 4) {
    pushUnique(lower.slice(0, -2))
    pushUnique(lower.slice(0, -1))
  }
  if (lower.endsWith('est') && lower.length > 5) {
    pushUnique(lower.slice(0, -3))
    pushUnique(lower.slice(0, -2))
  }

  return candidates
}

/**
 * Web Speech API 英音 / 美音朗读
 */
export function speakEnglishText(text: string, accent: 'en-US' | 'en-GB' = 'en-US', rate = 0.92): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return
  try {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text.trim())
    utter.lang = accent
    utter.rate = rate
    const voices = window.speechSynthesis.getVoices()
    const matchedVoice = voices.find((v) => v.lang.replace('_', '-').startsWith(accent))
    if (matchedVoice) {
      utter.voice = matchedVoice
    }
    window.speechSynthesis.speak(utter)
  } catch {
    // 忽略浏览器自动播放限制
  }
}

/**
 * 检查某个单词是否已在本地生词收藏缓存中
 */
export function isWordSavedLocally(word: string): boolean {
  try {
    const raw = localStorage.getItem(SAVED_WORDS_STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as Record<string, boolean>
    const clean = word.trim()
    return Boolean(parsed[clean] || parsed[clean.toLowerCase()])
  } catch {
    return false
  }
}

/**
 * 真实写入艾宾浩斯背单词词库（双通道落库：扩展词池 + SM-2/复习队列进度文件）
 */
export async function saveWordToEbbinghaus(payload: SaveVocabPayload): Promise<void> {
  const cleanWord = payload.word.trim()
  if (!cleanWord) return

  const definition = payload.definition.trim() || '考研英语阅读核心生词'
  const phonetic = payload.phonetic?.trim() || ''
  const example = payload.example?.trim() || ''
  const exampleCn = payload.exampleCn?.trim() || ''

  // 1. 写入本地同步标记，保障各阅读器星标即时一致
  try {
    const raw = localStorage.getItem(SAVED_WORDS_STORAGE_KEY)
    const map: Record<string, boolean> = raw ? JSON.parse(raw) : {}
    map[cleanWord] = true
    map[cleanWord.toLowerCase()] = true
    localStorage.setItem(SAVED_WORDS_STORAGE_KEY, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent('english-vocab-saved', { detail: { word: cleanWord } }))
  } catch {
    // ignore storage errors
  }

  // 2. 真实写入后端大纲扩展词池 + 艾宾浩斯今日待复习进度表
  const [importRes, addRes] = await Promise.allSettled([
    api.importVocab(
      'json',
      JSON.stringify([
        {
          word: cleanWord,
          phonetic,
          definition,
          example,
          exampleCn,
          frequency: '高频',
        },
      ])
    ),
    api.addVocabulary([
      {
        word: cleanWord,
        definition,
        phonetic,
        example,
        subject: '考研英语',
      },
    ]),
  ])

  if (importRes.status === 'rejected' && addRes.status === 'rejected') {
    throw new Error(addRes.reason?.message || '写入艾宾浩斯生词库失败')
  }
}

/**
 * 从文本块中提取包含目标词的完整原句上下文
 */
function extractContextSentence(fullText: string, word: string): string {
  const normalized = fullText.replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  const sentences = normalized.split(/(?<=[.!?])\s+/)
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const wordRegex = new RegExp(`\\b${escaped}\\b`, 'i')
  const hit = sentences.find((s) => wordRegex.test(s))
  const chosen = (hit || normalized).trim()
  return chosen.length > 280 ? chosen.slice(0, 277) + '...' : chosen
}

/**
 * 从鼠标点击或双击事件提取目标英文单词及屏幕定位矩形
 */
function resolveWordFromMouseEvent(
  e: React.MouseEvent<HTMLElement>,
  isDoubleClick: boolean
): WordLookupState | null {
  const target = e.target as HTMLElement | null
  if (!target) return null

  // 豁免交互按钮、表单元素与显式标记忽略区
  if (
    target.closest(
      'button, a, input, textarea, select, label, [data-no-word-lookup="true"]'
    )
  ) {
    return null
  }

  // 1. 优先检查是否有刚选中的单个英文单词
  const selection = window.getSelection()
  if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
    const selectedStr = selection.toString().trim()
    // 若用户正在划选整句或整段文本，绝不弹出单词气泡干扰复制
    if (!/^[a-zA-Z][a-zA-Z'’-]{1,28}$/.test(selectedStr)) {
      return null
    }
    const cleanSelected = selectedStr.replace(/[’]/g, "'").replace(/^['-]+|['-]+$/g, '')
    if (cleanSelected.length < 2) return null
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return null
    const blockEl =
      (range.startContainer.nodeType === Node.ELEMENT_NODE
        ? (range.startContainer as HTMLElement)
        : range.startContainer.parentElement
      )?.closest('p, li, blockquote, div') || target
    return {
      surfaceWord: cleanSelected,
      contextSentence: extractContextSentence(blockEl.textContent || '', cleanSelected),
      anchorRect: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      },
    }
  }

  // 2. 单击落点探测：通过 caretRangeFromPoint / caretPositionFromPoint 获取精确字符位置
  let textNode: Node | null = null
  let offset = 0
  const docAny = document as any
  if (typeof docAny.caretRangeFromPoint === 'function') {
    const caretRange: Range | null = docAny.caretRangeFromPoint(e.clientX, e.clientY)
    if (caretRange) {
      textNode = caretRange.startContainer
      offset = caretRange.startOffset
    }
  } else if (typeof docAny.caretPositionFromPoint === 'function') {
    const pos = docAny.caretPositionFromPoint(e.clientX, e.clientY)
    if (pos) {
      textNode = pos.offsetNode
      offset = pos.offset
    }
  }

  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return null
  const content = textNode.textContent || ''
  if (!content) return null

  const isWordChar = (ch: string) => /[a-zA-Z'’-]/.test(ch)
  let idx = offset
  if (idx >= content.length || !isWordChar(content[idx])) {
    if (idx > 0 && isWordChar(content[idx - 1])) {
      idx = idx - 1
    } else {
      return null
    }
  }

  let start = idx
  while (start > 0 && isWordChar(content[start - 1])) {
    start--
  }
  let end = idx + 1
  while (end < content.length && isWordChar(content[end])) {
    end++
  }

  const rawWord = content
    .slice(start, end)
    .replace(/[’]/g, "'")
    .replace(/^['-]+|['-]+$/g, '')

  if (!/^[a-zA-Z][a-zA-Z'-]{1,28}$/.test(rawWord)) return null
  if (!isDoubleClick && (rawWord.length < 3 || CLICK_IGNORE_STOPWORDS.has(rawWord.toLowerCase()))) {
    return null
  }

  // 校验鼠标真实点击点确实落在该单词的矩形边界内（防止点击段落末尾右侧空白处误触发）
  const wordRange = document.createRange()
  wordRange.setStart(textNode, start)
  wordRange.setEnd(textNode, end)
  const rect = wordRange.getBoundingClientRect()
  const margin = 8
  if (
    rect.width === 0 ||
    e.clientX < rect.left - margin ||
    e.clientX > rect.right + margin ||
    e.clientY < rect.top - margin ||
    e.clientY > rect.bottom + margin
  ) {
    return null
  }

  const blockEl = textNode.parentElement?.closest('p, li, blockquote, div') || target

  return {
    surfaceWord: rawWord,
    contextSentence: extractContextSentence(blockEl.textContent || '', rawWord),
    anchorRect: {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    },
  }
}

/**
 * 通用即点即查状态管理 Hook，供所有英语阅读器复用
 */
export function useEnglishWordLookup() {
  const [lookupState, setLookupState] = useState<WordLookupState | null>(null)

  const closeLookup = useCallback(() => {
    setLookupState(null)
  }, [])

  const handleWordLookupClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const hit = resolveWordFromMouseEvent(e, false)
    if (hit) {
      setLookupState(hit)
    }
  }, [])

  const handleWordLookupDoubleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const hit = resolveWordFromMouseEvent(e, true)
    if (hit) {
      setLookupState(hit)
    }
  }, [])

  return {
    lookupState,
    setLookupState,
    closeLookup,
    handleWordLookupClick,
    handleWordLookupDoubleClick,
  }
}

interface WordLookupPopoverProps {
  state: WordLookupState | null
  onClose: () => void
  onWordSaved?: (word: string) => void
}

export default function WordLookupPopover({
  state,
  onClose,
  onWordSaved,
}: WordLookupPopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const [matchedEntry, setMatchedEntry] = useState<LocalVocabEntry | null>(null)
  const [isSearchingDict, setIsSearchingDict] = useState(false)

  // AI 语境释义与熟词生义状态
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiContextResult, setAiContextResult] = useState('')
  const [aiError, setAiError] = useState<string | null>(null)

  // 加入艾宾浩斯生词库状态
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // 触发 AI 语境秒查
  const fetchAiContextualMeaning = useCallback(
    async (word: string, sentence: string) => {
      setIsAiLoading(true)
      setAiError(null)
      setAiContextResult('')

      const prompt = `请针对考研英语阅读语境，极简精准地解析单词 "${word}"：
所在原句：${sentence || word}

请严格按以下 4 行纯文本简洁输出（总字数不超过 120 字，不要多余寒暄）：
【原型与音标】：原型词 /国际音标/
【本句语境义】：词性. 在本句中的精准中文含义
【考研核心义/熟词生义】：常考义及易错熟词僻义提示
【词根助记】：简要词根词缀或联想拆解`

      try {
        const res = await fetch('/api/local-agents/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeaders(),
          },
          body: JSON.stringify({
            message: prompt,
            agentId: 'mojuan',
            history: [],
            projectName: '考研英语即点即查词典',
            pageContext: '英语正文即点即查与熟词生义解析',
          }),
        })

        if (!res.ok) {
          if (res.status === 402) {
            throw new Error('伴学积分不足，无法调用 AI 语境解析')
          }
          throw new Error(`AI 查词连接失败 (${res.status})`)
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error('流式响应不可用')
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
                setAiContextResult(accumulated)
              } else if (payload.type === 'error') {
                setAiError(payload.message || 'AI 解析异常')
              }
            } catch {
              // ignore malformed chunk
            }
          }
        }
      } catch (err: any) {
        setAiError(err?.message || 'AI 语境解析暂不可用')
      } finally {
        setIsAiLoading(false)
      }
    },
    []
  )

  // 当选中单词变化时，执行词形还原与大纲词库检索
  useEffect(() => {
    if (!state) return
    let cancelled = false
    setMatchedEntry(null)
    setAiContextResult('')
    setAiError(null)
    setSaveMessage(null)
    setIsSearchingDict(true)

    const candidates = generateLemmaCandidates(state.surfaceWord)
    setIsSaved(
      candidates.some((c) => isWordSavedLocally(c)) || isWordSavedLocally(state.surfaceWord)
    )

    ;(async () => {
      try {
        const localMap = await loadLocalVocabMap()
        if (cancelled) return

        let hit: LocalVocabEntry | null = null
        for (const cand of candidates) {
          const entry = localMap.get(cand)
          if (entry) {
            hit = entry
            break
          }
        }

        // 若前端静态池未命中，再查一次后端扩展词库（含用户自定义导入词）
        if (!hit) {
          try {
            const res = await api.getAllVocab({
              page: 1,
              size: 8,
              search: candidates[0],
            })
            if (!cancelled && res.words && res.words.length > 0) {
              const exact = res.words.find((w) =>
                candidates.includes(w.word.toLowerCase())
              )
              if (exact) {
                hit = {
                  word: exact.word,
                  phonetic: exact.phonetic,
                  definition: exact.definition,
                  example: exact.example,
                  exampleCn: exact.exampleCn,
                  frequency: exact.frequency,
                  roots: exact.roots,
                  synonyms: exact.synonyms,
                }
              }
            }
          } catch {
            // 离线或未登录时静默忽略
          }
        }

        if (!cancelled) {
          setMatchedEntry(hit)
          setIsSearchingDict(false)
          if (hit && isWordSavedLocally(hit.word)) {
            setIsSaved(true)
          }
        }
      } catch {
        if (!cancelled) {
          setIsSearchingDict(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [state])

  // 点击外部或按 ESC 关闭气泡
  useEffect(() => {
    if (!state) return
    const handlePointerDown = (ev: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(ev.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose()
    }
    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown)
    }, 30)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [state, onClose])

  if (!state || typeof document === 'undefined') return null

  // 从 AI 输出中智能提取释义与音标（当本地词库未命中时用于写入艾宾浩斯）
  const targetWord = matchedEntry?.word || state.surfaceWord.toLowerCase()
  const aiPhoneticMatch = aiContextResult.match(/\/[^/\n]{2,30}\//)
  const aiMeaningLine =
    aiContextResult
      .split('\n')
      .find((line) => line.includes('语境义') || line.includes('核心义'))
      ?.replace(/^【[^】]+】：?\s*/, '')
      .trim() || ''

  const effectivePhonetic = matchedEntry?.phonetic || aiPhoneticMatch?.[0] || ''
  const effectiveDefinition =
    matchedEntry?.definition ||
    aiMeaningLine ||
    (aiContextResult ? aiContextResult.replace(/\s+/g, ' ').slice(0, 90) : '考研阅读精读生词')

  const handleSaveToEbbinghaus = async () => {
    if (isSaving) return
    setIsSaving(true)
    setSaveMessage(null)
    try {
      await saveWordToEbbinghaus({
        word: targetWord,
        phonetic: effectivePhonetic,
        definition: effectiveDefinition,
        example: state.contextSentence || matchedEntry?.example || '',
        exampleCn: matchedEntry?.exampleCn || '',
      })
      setIsSaved(true)
      setSaveMessage('已入库艾宾浩斯复习队列！')
      onWordSaved?.(targetWord)
    } catch (err: any) {
      setSaveMessage(err?.message || '保存失败，请检查登录状态')
    } finally {
      setIsSaving(false)
    }
  }

  // 计算悬浮窗定位：优先置于单词正上方，若上方空间不足则置于单词正下方
  const popWidth = 340
  const viewportW = window.innerWidth
  const viewportH = window.innerHeight
  const centerX = state.anchorRect.left + state.anchorRect.width / 2
  const clampedLeft = Math.max(12, Math.min(centerX - popWidth / 2, viewportW - popWidth - 12))
  const placeAbove = state.anchorRect.top > 250 || viewportH - state.anchorRect.bottom < 220

  const positionStyle: React.CSSProperties = placeAbove
    ? {
        position: 'fixed',
        left: `${clampedLeft}px`,
        bottom: `${Math.max(12, viewportH - state.anchorRect.top + 10)}px`,
        width: `${Math.min(popWidth, viewportW - 24)}px`,
        zIndex: 9999,
      }
    : {
        position: 'fixed',
        left: `${clampedLeft}px`,
        top: `${Math.min(viewportH - 260, state.anchorRect.bottom + 10)}px`,
        width: `${Math.min(popWidth, viewportW - 24)}px`,
        zIndex: 9999,
      }

  return createPortal(
    <div
      ref={popoverRef}
      style={positionStyle}
      data-no-word-lookup="true"
      className="rounded-2xl border border-slate-200/95 dark:border-slate-700/90 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-[0_16px_48px_-8px_rgba(15,23,42,0.28)] dark:shadow-[0_18px_50px_-8px_rgba(0,0,0,0.75)] p-3.5 space-y-2.5 animate-fade-in font-sans"
    >
      {/* 顶栏：单词原型 + 当前词形 + 英美双音朗读 + 关闭 */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-black font-serif tracking-tight text-indigo-700 dark:text-indigo-300">
              {targetWord}
            </span>
            {matchedEntry && matchedEntry.word.toLowerCase() !== state.surfaceWord.toLowerCase() && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-serif">
                (文中: {state.surfaceWord})
              </span>
            )}
            {effectivePhonetic && (
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {effectivePhonetic}
              </span>
            )}
          </div>
          {matchedEntry?.frequency && (
            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800/60 text-[10px] font-bold text-amber-700 dark:text-amber-300">
              考研大纲 · {matchedEntry.frequency}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="关闭查词卡"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 英音 / 美音 朗读按钮条 */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => speakEnglishText(state.surfaceWord, 'en-GB')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
        >
          <Volume2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <span>英音 UK</span>
        </button>
        <button
          type="button"
          onClick={() => speakEnglishText(state.surfaceWord, 'en-US')}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
        >
          <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>美音 US</span>
        </button>
        {state.contextSentence && (
          <button
            type="button"
            onClick={() => speakEnglishText(state.contextSentence, 'en-US', 0.9)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer ml-auto"
            title="朗读所在原句"
          >
            <Quote className="w-2.5 h-2.5" />
            <span>读原句</span>
          </button>
        )}
      </div>

      {/* 释义主体区 */}
      {isSearchingDict ? (
        <div className="flex items-center gap-2 py-2 text-xs text-slate-500 dark:text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
          <span>正在检索考研大纲词库...</span>
        </div>
      ) : matchedEntry ? (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5 text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
            {matchedEntry.definition}
          </div>
          {matchedEntry.roots && (
            <div className="text-[11px] text-indigo-700 dark:text-indigo-300">
              <span className="font-semibold">词根拆解：</span>
              {matchedEntry.roots}
            </div>
          )}
          {matchedEntry.synonyms && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold">同义替换：</span>
              {matchedEntry.synonyms}
            </div>
          )}
        </div>
      ) : !aiContextResult && !isAiLoading ? (
        <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/35 border border-amber-200/70 dark:border-amber-800/60 text-xs space-y-2">
          <div className="text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>大纲基础词表未直接收录该变形或超纲学术词</span>
          </div>
          <button
            type="button"
            onClick={() => fetchAiContextualMeaning(state.surfaceWord, state.contextSentence)}
            className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>一键 AI 秒查本句语境义与熟词生义</span>
          </button>
        </div>
      ) : null}

      {/* 已命中大纲词但想进一步查本句熟词生义时，提供轻量按钮 */}
      {matchedEntry && !aiContextResult && !isAiLoading && (
        <button
          type="button"
          onClick={() => fetchAiContextualMeaning(state.surfaceWord, state.contextSentence)}
          className="w-full py-1 px-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 border border-indigo-200/70 dark:border-indigo-800/60 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>AI 探查本句语境义 & 熟词生义</span>
        </button>
      )}

      {/* AI 流式语境词义展示 */}
      {(isAiLoading || aiContextResult || aiError) && (
        <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 text-[11.5px] leading-relaxed space-y-1 max-h-40 overflow-y-auto">
          {isAiLoading && !aiContextResult && (
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-300 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>正在结合原句推演考研熟词生义...</span>
            </div>
          )}
          {aiContextResult && (
            <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">
              {aiContextResult}
            </div>
          )}
          {aiError && <div className="text-rose-600 dark:text-rose-400">⚠️ {aiError}</div>}
        </div>
      )}

      {/* 原句上下文摘录 */}
      {state.contextSentence && (
        <div className="px-2.5 py-1.5 rounded-lg bg-slate-50/90 dark:bg-slate-800/50 border-l-2 border-indigo-400 text-[11px] font-serif italic text-slate-600 dark:text-slate-300 line-clamp-2 leading-snug">
          “{state.contextSentence}”
        </div>
      )}

      {/* 核心闭环：真实写入艾宾浩斯背单词词库 */}
      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSaveToEbbinghaus}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 ${
            isSaved
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white shadow-xs'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>正在写入艾宾浩斯词库...</span>
            </>
          ) : isSaved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>已加入艾宾浩斯生词本（再次点击可更新例句）</span>
            </>
          ) : (
            <>
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>⭐ 加入艾宾浩斯生词本</span>
            </>
          )}
        </button>
        {saveMessage && (
          <div className="text-[10.5px] text-center text-emerald-600 dark:text-emerald-400 font-medium">
            {saveMessage}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
