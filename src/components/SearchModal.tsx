import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  FileText,
  Loader2,
  Compass,
  Sparkles,
  BookOpen,
  Cpu,
  Calculator,
  Landmark,
  GraduationCap,
  Network,
  FileEdit,
  Timer,
  Music,
  Settings,
  PenLine,
  Palette,
  Moon,
  Leaf,
  Play,
  ArrowRight,
  Clock,
  Command,
  Layers,
} from 'lucide-react'
import { api, type FileListItem } from '../services/api'
import { useThemeStyle } from '../hooks/useThemeStyle'
import type { HandoutItem } from '../data/handoutsData'
import type { InteractiveCoursewareItem } from '../data/interactiveCourseware'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

type SearchCategory = 'all' | 'commands' | 'notes' | 'study'

interface CommandActionItem {
  id: string
  title: string
  subtitle: string
  badge: string
  keywords: string[]
  icon: any
  iconColor: string
  run: () => void
}

interface UnifiedResultItem {
  key: string
  kind: 'command' | 'note' | 'handout' | 'courseware'
  title: string
  subtitle: string
  badge?: string
  snippet?: string
  tags?: string[]
  icon: any
  iconColor: string
  onSelect: () => void
}

interface RecentSearchVisit {
  key: string
  title: string
  subtitle: string
  pathOrAction: string
  kind: 'command' | 'note' | 'handout' | 'courseware'
}

const RECENT_STORAGE_KEY = 'coreforge_cmd_palette_recent_v1'

let cachedHandoutsMeta: HandoutItem[] | null = null
let cachedCoursewaresMeta: InteractiveCoursewareItem[] | null = null

function loadRecentVisits(): RecentSearchVisit[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, 5) : []
  } catch {
    return []
  }
}

function recordRecentVisit(entry: RecentSearchVisit) {
  try {
    const list = loadRecentVisits().filter(item => item.key !== entry.key)
    list.unshift(entry)
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list.slice(0, 6)))
  } catch {}
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<SearchCategory>('all')
  const [noteResults, setNoteResults] = useState<FileListItem[]>([])
  const [handouts, setHandouts] = useState<HandoutItem[]>(() => cachedHandoutsMeta || [])
  const [coursewares, setCoursewares] = useState<InteractiveCoursewareItem[]>(() => cachedCoursewaresMeta || [])
  const [recentVisits, setRecentVisits] = useState<RecentSearchVisit[]>(() => loadRecentVisits())
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const navigate = useNavigate()
  const { setThemeStyle, isDark, isEyecare } = useThemeStyle()

  // 打开面板时重置焦点，并按需静默预热讲义与仿真课件元数据（首屏零体积负担）
  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setCategory('all')
    setNoteResults([])
    setSelected(0)
    setRecentVisits(loadRecentVisits())
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 40)

    if (!cachedCoursewaresMeta) {
      import('../data/interactiveCourseware')
        .then(m => {
          cachedCoursewaresMeta = m.INTERACTIVE_COURSEWARES || []
          setCoursewares(cachedCoursewaresMeta)
        })
        .catch(() => {})
    }
    if (!cachedHandoutsMeta) {
      import('../data/handoutsData')
        .then(m => {
          cachedHandoutsMeta = m.CURATED_HANDOUTS || []
          setHandouts(cachedHandoutsMeta)
        })
        .catch(() => {})
    }

    return () => clearTimeout(focusTimer)
  }, [isOpen])

  const doSearchNotes = useCallback(async (q: string) => {
    if (!q.trim()) {
      setNoteResults([])
      return
    }
    setLoading(true)
    try {
      const files = await api.getFiles(q.trim())
      setNoteResults(files.slice(0, 16))
    } catch {
      setNoteResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    setSelected(0)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearchNotes(value), 180)
  }

  // 全站核心命令与快捷导航矩阵
  const commandActions: CommandActionItem[] = useMemo(() => [
    {
      id: 'cmd-quick-note',
      title: '新建极速随手记',
      subtitle: '随时记录灵感、错题摘录与 LaTeX 公式并沉淀入 Vault',
      badge: '快捷动作',
      keywords: ['随手记', '新建笔记', '速记', 'quick', 'note', '灵感'],
      icon: PenLine,
      iconColor: 'text-amber-500',
      run: () => {
        onClose()
        window.dispatchEvent(new CustomEvent('open-quick-note'))
      },
    },
    {
      id: 'cmd-ai-assistant',
      title: '唤起全局 AI 导师伴学浮窗',
      subtitle: '多模型即时答疑、公式推导与本地 Claude/Codex 协同 (Ctrl+J)',
      badge: '快捷键 ⌘J',
      keywords: ['ai', '助手', '导师', '提问', '答疑', 'claude', 'codex', 'deepseek'],
      icon: Sparkles,
      iconColor: 'text-indigo-500',
      run: () => {
        onClose()
        window.dispatchEvent(new CustomEvent('open-ai-assistant'))
      },
    },
    {
      id: 'nav-quiz-408',
      title: '进入 408 计算机统考刷题舱',
      subtitle: '数据结构 · 计算机组成原理 · 操作系统 · 计算机网络历年真题与专项',
      badge: '核心学科',
      keywords: ['408', '计算机', '刷题', '数据结构', '计组', '操作系统', '计网', '真题', 'quiz'],
      icon: Cpu,
      iconColor: 'text-blue-600',
      run: () => {
        navigate('/quiz?domain=cs_408')
        onClose()
      },
    },
    {
      id: 'nav-quiz-math',
      title: '进入考研数学真题与模拟卷中心',
      subtitle: '数一/数二/数三 1987-2024 历年全真试卷、李林六套卷与大题分步导师',
      badge: '核心学科',
      keywords: ['数学', '高数', '线代', '概率', '李林', '真题', '刷题', 'math', '微积分'],
      icon: Calculator,
      iconColor: 'text-violet-600',
      run: () => {
        navigate('/quiz?domain=math')
        onClose()
      },
    },
    {
      id: 'nav-english',
      title: '进入考研英语全题型实战中心',
      subtitle: '完型 · 阅读精析 · 新题型 · 翻译 · AI 作文四维批改 · 大纲核心词库',
      badge: '公共课',
      keywords: ['英语', '阅读', '作文', '批改', '背单词', '词汇', '完型', 'english', 'vocab'],
      icon: BookOpen,
      iconColor: 'text-emerald-600',
      run: () => {
        navigate('/english')
        onClose()
      },
    },
    {
      id: 'nav-politics',
      title: '进入考研政治百炼与史纲时空轴',
      subtitle: '近代史高精地图时空编年、马原/毛中特讲义与肖秀荣 1000 题特训',
      badge: '公共课',
      keywords: ['政治', '史纲', '马原', '毛中特', '肖秀荣', '1000题', '历史地图', 'politics'],
      icon: Landmark,
      iconColor: 'text-rose-600',
      run: () => {
        navigate('/politics')
        onClose()
      },
    },
    {
      id: 'nav-study-flashcards',
      title: '开启今日艾宾浩斯 SM-2 闪卡复习',
      subtitle: '基于遗忘曲线智能调度今日待复盘核心定理与错题卡',
      badge: '记忆引擎',
      keywords: ['闪卡', '复习', '艾宾浩斯', 'sm2', '背诵', '记忆', 'flashcard'],
      icon: GraduationCap,
      iconColor: 'text-amber-600',
      run: () => {
        navigate('/study?tab=flashcards')
        onClose()
      },
    },
    {
      id: 'nav-study-coursewares',
      title: '打开交互式算法与数学动态仿真实验室',
      subtitle: 'AVL旋转 · KMP · 银行家算法 · Cache映射 · TCP握手 · 二重积分可视化',
      badge: '仿真课件',
      keywords: ['课件', '仿真', '动画', '实验室', '可视化', 'courseware'],
      icon: Play,
      iconColor: 'text-teal-600',
      run: () => {
        navigate('/study?tab=coursewares')
        onClose()
      },
    },
    {
      id: 'nav-graph',
      title: '查看全景双链知识图谱与掌握度拓扑',
      subtitle: '可视化笔记双向链接网络、孤立节点诊断与薄弱考点分布',
      badge: '可视化',
      keywords: ['知识图谱', '拓扑', '双链', '网络', 'graph', '孤立笔记'],
      icon: Network,
      iconColor: 'text-purple-600',
      run: () => {
        navigate('/study?tab=graph')
        onClose()
      },
    },
    {
      id: 'nav-editor',
      title: '打开沉浸式 Markdown / LaTeX 笔记编辑器',
      subtitle: '源码/分栏/学术预览、目录大纲导航与双链补全',
      badge: '工作台',
      keywords: ['编辑器', '写笔记', 'markdown', 'latex', 'editor'],
      icon: FileEdit,
      iconColor: 'text-cyan-600',
      run: () => {
        navigate('/editor')
        onClose()
      },
    },
    {
      id: 'nav-pomodoro',
      title: '开启考研专注番茄钟与沉浸白噪音',
      subtitle: '自定义心流备考周期、阶段休息提醒与每日专注统计',
      badge: '自习室',
      keywords: ['番茄钟', '专注', '计时', '自习', 'pomodoro'],
      icon: Timer,
      iconColor: 'text-orange-500',
      run: () => {
        navigate('/pomodoro')
        onClose()
      },
    },
    {
      id: 'nav-music',
      title: '打开声学专注氛围与 Lofi 自习电台',
      subtitle: '雨声/壁炉环境音混音器、双耳节拍与本地无损音乐流',
      badge: '声学电台',
      keywords: ['音乐', '白噪音', '电台', '雨声', 'lofi', 'music'],
      icon: Music,
      iconColor: 'text-pink-500',
      run: () => {
        navigate('/music')
        onClose()
      },
    },
    {
      id: 'cmd-theme-vibrant',
      title: '切换主题：🎨 鲜艳活力风',
      subtitle: '408 科技蓝、政治正气红、数学极光紫，高饱和清晰视觉层次',
      badge: '外观主题',
      keywords: ['主题', '鲜艳', '彩色', '活力', 'vibrant', '风格', '外观'],
      icon: Palette,
      iconColor: 'text-indigo-500',
      run: () => {
        setThemeStyle('vibrant')
        onClose()
      },
    },
    {
      id: 'cmd-theme-eyecare',
      title: '切换主题：🍃 温润纸质护眼风',
      subtitle: '天然豆沙宣纸微色温，过滤高能蓝光，长时精读刷题不酸胀',
      badge: '外观主题',
      keywords: ['主题', '护眼', '豆沙绿', '纸质', 'eyecare', '风格', '绿色'],
      icon: Leaf,
      iconColor: 'text-emerald-600',
      run: () => {
        setThemeStyle('eyecare')
        onClose()
      },
    },
    {
      id: 'cmd-theme-dark',
      title: '切换主题：🌙 深邃夜间暗黑风',
      subtitle: '纯净深空黑曜石底色与微光对比，夜间沉浸夜战不刺眼',
      badge: '外观主题',
      keywords: ['主题', '暗黑', '黑夜', '夜间', '深色', 'dark', 'night', '风格'],
      icon: Moon,
      iconColor: 'text-sky-400',
      run: () => {
        setThemeStyle('dark')
        onClose()
      },
    },
    {
      id: 'cmd-theme-minimal',
      title: '切换主题：♟️ 经典极简黑白风',
      subtitle: '讲义级微哑光纸感灰白基调，克制纯净无干扰',
      badge: '外观主题',
      keywords: ['主题', '极简', '黑白', '简约', 'minimal', '风格'],
      icon: Compass,
      iconColor: 'text-slate-600',
      run: () => {
        setThemeStyle('minimal')
        onClose()
      },
    },
    {
      id: 'nav-settings',
      title: '打开全局系统与 AI 模型设置',
      subtitle: '配置 Obsidian 知识库路径、云端 API 密钥与本地 Agent 桥接',
      badge: '系统配置',
      keywords: ['设置', '配置', 'api', 'key', '路径', 'vault', 'settings'],
      icon: Settings,
      iconColor: 'text-slate-500',
      run: () => {
        navigate('/settings')
        onClose()
      },
    },
  ], [navigate, onClose, setThemeStyle])

  // 汇总统一检索结果列表
  const unifiedResults: UnifiedResultItem[] = useMemo(() => {
    const trimmed = query.trim()
    const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean)

    // 空输入默认态：优先展示高频快捷指令列表（配合上方最近访问）
    if (terms.length === 0) {
      if (category === 'notes') return []
      if (category === 'study') {
        const defaultStudy: UnifiedResultItem[] = [
          ...coursewares.slice(0, 5).map(cw => ({
            key: `cw-${cw.id}`,
            kind: 'courseware' as const,
            title: cw.title,
            subtitle: `${cw.subject} · ${cw.difficulty}`,
            badge: '仿真课件',
            snippet: cw.summary,
            tags: cw.tags?.slice(0, 3),
            icon: Play,
            iconColor: 'text-teal-600',
            onSelect: () => {
              const targetUrl = `/study?tab=coursewares&cw=${encodeURIComponent(cw.id)}`
              recordRecentVisit({ key: `cw-${cw.id}`, title: cw.title, subtitle: cw.subject, pathOrAction: targetUrl, kind: 'courseware' })
              navigate(targetUrl)
              onClose()
            },
          })),
          ...handouts.slice(0, 5).map(hd => ({
            key: `hd-${hd.id}`,
            kind: 'handout' as const,
            title: hd.title,
            subtitle: `${hd.subject} · 精读约 ${hd.readTime}`,
            badge: '核心讲义',
            snippet: hd.summary,
            tags: hd.tags?.slice(0, 3),
            icon: Layers,
            iconColor: 'text-indigo-600',
            onSelect: () => {
              const targetUrl = `/study?tab=handouts&handout=${encodeURIComponent(hd.id)}`
              recordRecentVisit({ key: `hd-${hd.id}`, title: hd.title, subtitle: hd.subject, pathOrAction: targetUrl, kind: 'handout' })
              navigate(targetUrl)
              onClose()
            },
          })),
        ]
        return defaultStudy
      }
      return commandActions.slice(0, 8).map(cmd => ({
        key: cmd.id,
        kind: 'command' as const,
        title: cmd.title,
        subtitle: cmd.subtitle,
        badge: cmd.badge,
        icon: cmd.icon,
        iconColor: cmd.iconColor,
        onSelect: cmd.run,
      }))
    }

    const matchesAllTerms = (haystack: string) => {
      const lower = haystack.toLowerCase()
      return terms.every(t => lower.includes(t))
    }

    const items: UnifiedResultItem[] = []

    // 1. 匹配快捷命令
    if (category === 'all' || category === 'commands') {
      for (const cmd of commandActions) {
        const hay = `${cmd.title} ${cmd.subtitle} ${cmd.keywords.join(' ')}`
        if (matchesAllTerms(hay)) {
          items.push({
            key: cmd.id,
            kind: 'command',
            title: cmd.title,
            subtitle: cmd.subtitle,
            badge: cmd.badge,
            icon: cmd.icon,
            iconColor: cmd.iconColor,
            onSelect: cmd.run,
          })
        }
      }
    }

    // 2. 匹配个人 Vault 笔记
    if (category === 'all' || category === 'notes') {
      for (const file of noteResults) {
        items.push({
          key: `note-${file.path}`,
          kind: 'note',
          title: file.title,
          subtitle: file.path,
          badge: `${file.wordCount} 字`,
          snippet: file.snippet,
          tags: file.tags,
          icon: FileText,
          iconColor: 'text-indigo-600',
          onSelect: () => {
            const targetUrl = `/editor?path=${encodeURIComponent(file.path)}&mode=preview&from=search`
            recordRecentVisit({
              key: `note-${file.path}`,
              title: file.title,
              subtitle: file.path,
              pathOrAction: targetUrl,
              kind: 'note',
            })
            navigate(targetUrl)
            onClose()
          },
        })
      }
    }

    // 3. 匹配仿真课件与精编讲义
    if (category === 'all' || category === 'study') {
      for (const cw of coursewares) {
        const hay = `${cw.title} ${cw.subject} ${cw.summary} ${(cw.tags || []).join(' ')}`
        if (matchesAllTerms(hay)) {
          items.push({
            key: `cw-${cw.id}`,
            kind: 'courseware',
            title: cw.title,
            subtitle: `${cw.subject} · ${cw.difficulty}`,
            badge: '仿真课件',
            snippet: cw.summary,
            tags: cw.tags?.slice(0, 4),
            icon: Play,
            iconColor: 'text-teal-600',
            onSelect: () => {
              const targetUrl = `/study?tab=coursewares&cw=${encodeURIComponent(cw.id)}`
              recordRecentVisit({ key: `cw-${cw.id}`, title: cw.title, subtitle: cw.subject, pathOrAction: targetUrl, kind: 'courseware' })
              navigate(targetUrl)
              onClose()
            },
          })
        }
      }

      for (const hd of handouts) {
        const hay = `${hd.title} ${hd.subject} ${hd.summary} ${(hd.tags || []).join(' ')} ${(hd.keyTheorems || []).join(' ')}`
        if (matchesAllTerms(hay)) {
          items.push({
            key: `hd-${hd.id}`,
            kind: 'handout',
            title: hd.title,
            subtitle: `${hd.subject} · ${hd.readTime}`,
            badge: '核心讲义',
            snippet: hd.summary,
            tags: hd.tags?.slice(0, 4),
            icon: Layers,
            iconColor: 'text-indigo-600',
            onSelect: () => {
              const targetUrl = `/study?tab=handouts&handout=${encodeURIComponent(hd.id)}`
              recordRecentVisit({ key: `hd-${hd.id}`, title: hd.title, subtitle: hd.subject, pathOrAction: targetUrl, kind: 'handout' })
              navigate(targetUrl)
              onClose()
            },
          })
        }
      }
    }

    return items.slice(0, 30)
  }, [query, category, commandActions, noteResults, coursewares, handouts, navigate, onClose])

  useEffect(() => {
    if (selected >= unifiedResults.length) {
      setSelected(0)
    }
  }, [unifiedResults.length, selected])

  const cycleCategory = () => {
    const order: SearchCategory[] = ['all', 'commands', 'notes', 'study']
    const next = order[(order.indexOf(category) + 1) % order.length]
    setCategory(next)
    setSelected(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 严格遵守 CJK 中文输入法组合态保护 (IME-safe enter-to-submit)
    if (e.nativeEvent.isComposing || (e as any).keyCode === 229) {
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      cycleCategory()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected(prev => (unifiedResults.length > 0 ? (prev + 1) % unifiedResults.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected(prev => (unifiedResults.length > 0 ? (prev - 1 + unifiedResults.length) % unifiedResults.length : 0))
    } else if (e.key === 'Enter' && unifiedResults[selected]) {
      e.preventDefault()
      unifiedResults[selected].onSelect()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  useEffect(() => {
    const el = document.getElementById(`cmd-palette-item-${selected}`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!isOpen) return null

  const categoryTabs: { id: SearchCategory; label: string }[] = [
    { id: 'all', label: '全部检索' },
    { id: 'commands', label: '快捷指令' },
    { id: 'notes', label: '个人笔记' },
    { id: 'study', label: '讲义与课件' },
  ]

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="全局命令与全栈检索面板"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-[10dvh] px-3 sm:px-4 modal-backdrop-contain"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity" />

      {/* Palette Container */}
      <div
        className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden animate-fade-in-up transition-colors ${
          isDark
            ? 'bg-[#131926] border-slate-700/80 text-slate-100 shadow-black/60'
            : isEyecare
              ? 'bg-[#fafbf8] border-[#d5e2d1] text-[#243329]'
              : 'bg-white border-slate-200/90 text-slate-800'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div
          className={`flex items-center gap-2.5 px-4 py-3.5 border-b ${
            isDark ? 'border-slate-800' : isEyecare ? 'border-[#e2e9df]' : 'border-slate-100'
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isDark
                ? 'bg-sky-500/15 text-sky-400'
                : isEyecare
                  ? 'bg-emerald-100/80 text-emerald-700'
                  : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="搜索笔记、精编讲义、仿真课件，或输入指令（如：408、护眼、随手记）..."
            className="flex-1 bg-transparent! border-none! text-base sm:text-sm outline-none placeholder:text-slate-400"
          />
          {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setNoteResults([])
                setSelected(0)
                inputRef.current?.focus()
              }}
              className="text-2xs px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer shrink-0"
            >
              清空
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 inline-flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 shrink-0 cursor-pointer transition-colors"
            aria-label="关闭检索面板"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div
          className={`flex items-center justify-between gap-2 px-4 py-2 border-b overflow-x-auto no-scrollbar ${
            isDark
              ? 'bg-[#0f1522] border-slate-800/90'
              : isEyecare
                ? 'bg-[#f2f6ef] border-[#e2e9df]'
                : 'bg-slate-50/80 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            {categoryTabs.map(tab => {
              const active = category === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setCategory(tab.id)
                    setSelected(0)
                    inputRef.current?.focus()
                  }}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-semibold transition-all cursor-pointer ${
                    active
                      ? isDark
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-xs'
                        : isEyecare
                          ? 'bg-[#2d6a4f] text-white shadow-xs'
                          : 'bg-slate-900 text-white shadow-xs'
                      : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-2xs text-slate-400 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200/80 bg-white/80 font-mono text-[10px] text-slate-500">
              Tab
            </kbd>
            <span>切换分类</span>
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-[62dvh] sm:max-h-96 overflow-y-auto modal-scroll-contain p-1.5">
          {/* 最近访问快捷条（仅无输入词且有历史记录时显示） */}
          {!query.trim() && category === 'all' && recentVisits.length > 0 && (
            <div className="px-2.5 pt-1.5 pb-2 mb-1 border-b border-slate-100">
              <div className="flex items-center justify-between text-2xs font-semibold text-slate-400 mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>最近访问</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    try { localStorage.removeItem(RECENT_STORAGE_KEY) } catch {}
                    setRecentVisits([])
                  }}
                  className="text-2xs text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  清除
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentVisits.map(rv => (
                  <button
                    key={rv.key}
                    type="button"
                    onClick={() => {
                      navigate(rv.pathOrAction)
                      onClose()
                    }}
                    className={`inline-flex items-center gap-1.5 max-w-[220px] px-2.5 py-1 rounded-lg text-2xs font-medium border transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-sky-500/50'
                        : isEyecare
                          ? 'bg-[#ebf1e8] border-[#d5e2d1] text-[#243329] hover:bg-[#dfeadb]'
                          : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700'
                    }`}
                  >
                    <span className="truncate">{rv.title}</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-60 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 热门考点热搜胶囊（无输入词且处于个人笔记 Tab 时引导） */}
          {!query.trim() && category === 'notes' && (
            <div className="px-4 py-8 text-center space-y-3">
              <div className="text-xs font-medium text-slate-500">输入关键词秒级检索本地 Obsidian 知识库笔记</div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {['数据结构', '操作系统', '计算机网络', '泰勒公式', '特征值', '中值定理', '错题'].map(kw => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleInput(kw)}
                    className="text-2xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    #{kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 无匹配结果提示 */}
          {unifiedResults.length === 0 && query.trim() && !loading && (
            <div className="px-4 py-8 text-center text-xs text-slate-500 space-y-3">
              <p className="font-semibold text-slate-700">未找到与「{query}」匹配的笔记、讲义或快捷指令</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    window.dispatchEvent(
                      new CustomEvent('open-ai-assistant', {
                        detail: { defaultInput: `请为我详细讲解考研核心考点：${query.trim()}` },
                      })
                    )
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>直接让 AI 导师讲解「{query.trim().slice(0, 12)}」</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/quiz')
                    onClose()
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
                >
                  前往刷题中心检索真题 →
                </button>
              </div>
            </div>
          )}

          {/* 统一结果列表渲染 */}
          {unifiedResults.length > 0 && (
            <div className="space-y-0.5">
              {!query.trim() && category === 'all' && (
                <div className="px-2.5 py-1 text-2xs font-semibold text-slate-400 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1">
                    <Command className="w-3 h-3" />
                    <span>快捷指令与研学舱直达</span>
                  </span>
                  <span className="font-normal">支持直接搜考点如「AVL」「KMP」「泰勒」</span>
                </div>
              )}

              {unifiedResults.map((item, i) => {
                const Icon = item.icon
                const isSelected = selected === i
                return (
                  <button
                    key={item.key}
                    id={`cmd-palette-item-${i}`}
                    type="button"
                    onClick={item.onSelect}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-sky-500/15 ring-1 ring-sky-500/40'
                          : isEyecare
                            ? 'bg-[#e3efe6] ring-1 ring-[#9bc4ab]'
                            : 'bg-indigo-50/85 ring-1 ring-indigo-200/80'
                        : isDark
                          ? 'hover:bg-slate-800/60'
                          : 'hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                        isDark
                          ? 'bg-slate-800/90 border-slate-700/80'
                          : isEyecare
                            ? 'bg-[#f4f8f2] border-[#d5e2d1]'
                            : 'bg-white border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs sm:text-[13px] font-semibold truncate ${
                            isSelected
                              ? isDark
                                ? 'text-sky-200'
                                : isEyecare
                                  ? 'text-[#1b4332]'
                                  : 'text-indigo-950'
                              : 'text-slate-800'
                          }`}
                        >
                          {highlightMatch(item.title, query, isDark, isEyecare)}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0 border ${
                              item.kind === 'courseware'
                                ? isDark
                                  ? 'bg-teal-950/60 border-teal-800 text-teal-300'
                                  : 'bg-teal-50 border-teal-200/80 text-teal-700'
                                : item.kind === 'handout'
                                  ? isDark
                                    ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
                                    : 'bg-indigo-50 border-indigo-200/80 text-indigo-700'
                                  : isDark
                                    ? 'bg-slate-800 border-slate-700 text-slate-300'
                                    : 'bg-slate-100 border-slate-200/70 text-slate-500'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="text-2xs text-slate-400 truncate mt-0.5">
                        {highlightMatch(item.subtitle, query, isDark, isEyecare)}
                      </div>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.slice(0, 4).map(tag => (
                            <span
                              key={tag}
                              className={`text-[10px] px-1.5 py-0.2 rounded ${
                                isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.snippet && query.trim() && (
                        <div className="text-2xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                          {highlightMatch(item.snippet, query, isDark, isEyecare)}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Hints */}
        <div
          className={`px-4 py-2 border-t flex items-center gap-3 text-2xs text-slate-400 ${
            isDark
              ? 'border-slate-800 bg-[#0f1522]'
              : isEyecare
                ? 'border-[#e2e9df] bg-[#f2f6ef]'
                : 'border-slate-100 bg-slate-50/70'
          }`}
        >
          <span className="hidden sm:inline">↑↓ 导航</span>
          <span className="hidden sm:inline">↵ 执行/打开</span>
          <span className="hidden sm:inline">Esc 关闭</span>
          <span className="sm:hidden">点选条目即刻直达</span>
          <span className="ml-auto font-medium text-slate-500">
            {query.trim() ? `匹配 ${unifiedResults.length} 项` : '全栈命令中心 · Ctrl+K'}
          </span>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent
}

function highlightMatch(
  text: string,
  query: string,
  isDark: boolean,
  isEyecare: boolean
): React.ReactNode {
  if (!query.trim() || !text) return text
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)

  for (const term of terms) {
    const lower = text.toLowerCase()
    const idx = lower.indexOf(term)
    if (idx >= 0) {
      const highlightCls = isDark
        ? 'text-sky-300 font-bold bg-sky-500/20 px-0.5 rounded'
        : isEyecare
          ? 'text-[#1b4332] font-bold bg-emerald-200/60 px-0.5 rounded'
          : 'text-indigo-700 font-bold bg-indigo-100/80 px-0.5 rounded'
      return (
        <>
          {text.substring(0, idx)}
          <span className={highlightCls}>{text.substring(idx, idx + term.length)}</span>
          {text.substring(idx + term.length)}
        </>
      )
    }
  }
  return text
}
