import { useAuth } from '../../contexts/AuthContext'
import { memo, useState } from 'react'
import {
  MessageSquare,
  PanelLeft,
  ChevronDown,
  ChevronUp,
  FolderTree,
  Settings,
  Plus,
  Users,
  RefreshCw,
  Trash2,
  Layers,
  Brain,
  Sparkles,
  Maximize2,
  Minimize2,
  BookOpen,
  SlidersHorizontal,
  Check,
  Cpu,
  Coins,
} from 'lucide-react'
import { STUDY_AGENTS, type StudyAgent } from '../../data/studyAgents'
import { STUDY_SKILLS, type StudySkill } from '../../data/studySkills'
import type { LocalAgentStatus, LocalSkill, CloudEndpoint, FileDetail } from '../../services/api'

export type ProviderType = 'antigravity' | 'codex' | 'claude-code' | 'web'
export type ChatWidthMode = 'normal' | 'wide' | 'full'
export type ChatFontSize = 'sm' | 'base' | 'lg'

export const PROVIDER_PRESET_MODELS: Record<ProviderType, string[]> = {
  antigravity: ['gemini-3.8-flash'],
  codex: ['gpt-6-luna', 'gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.5', 'o3-mini'],
  'claude-code': ['deepseek-flash', 'deepseek-reasoner', 'claude-3-7-sonnet', 'claude-3-5-sonnet'],
  web: ['deepseek-flash', 'deepseek-reasoner', 'deepseek-chat'],
}

const PROVIDER_META: Record<
  ProviderType,
  { short: string; label: string; badgeBg: string }
> = {
  antigravity: {
    short: '✨ 研核官方',
    label: '✨ 研核官方 (Gemini 3.8 Flash)',
    badgeBg: 'text-neutral-900 bg-neutral-100 border-neutral-200',
  },
  codex: {
    short: '🤖 Codex',
    label: '🤖 Codex',
    badgeBg: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  },
  'claude-code': {
    short: '⚡ Claude',
    label: '⚡ Claude',
    badgeBg: 'text-amber-800 bg-amber-50 border-amber-200',
  },
  web: {
    short: '☁️ 云端',
    label: '☁️ 云端接口',
    badgeBg: 'text-sky-800 bg-sky-50 border-sky-200',
  },
}

interface ChatStudioHeaderProps {
  activeAgent: StudyAgent
  onSelectAgent: (agent: StudyAgent) => void
  onCreateNewConversation: () => void
  showSessions: boolean
  onToggleSessions: () => void
  conversationsCount: number
  showFiles: boolean
  onToggleFiles: () => void
  selectedNote: FileDetail | null
  provider: ProviderType
  onProviderChange: (p: ProviderType) => void
  agents: LocalAgentStatus[]
  selectedModel: string
  isCustomModel: boolean
  customModelInput: string
  onCustomModelInputChange: (val: string) => void
  onCustomModelConfirm: () => void
  onModelSelect: (m: string) => void
  onDeleteCurrentModel: () => void
  currentAvailableModels: string[]
  cloudEndpoints: CloudEndpoint[]
  webModels: string[]
  syncingModels: boolean
  modelSyncFeedback: string | null
  onScanModels?: () => void
  onOpenModelManager: () => void
  studyTone: 'rigorous' | 'vivid' | 'exam' | 'followup'
  onStudyToneChange: (tone: 'rigorous' | 'vivid' | 'exam' | 'followup') => void
  isDualMode: boolean
  onToggleDualMode: () => void
  peerAgent: StudyAgent
  onPeerAgentChange: (agent: StudyAgent) => void
  peerProvider: ProviderType
  onPeerProviderChange: (p: ProviderType) => void
  peerModel: string
  onPeerModelChange: (m: string) => void
  activeSkill: StudySkill | null
  onSelectStudySkill: (skill: StudySkill) => void
  selectedLocalSkill: LocalSkill | null
  onOpenSkillPicker: () => void
  onOpenMemoryModal: () => void
  onOpenMemoryTierModal?: () => void
  chatWidthMode: ChatWidthMode
  onWidthModeChange: (mode: ChatWidthMode) => void
  chatFontSize: ChatFontSize
  onFontSizeChange: (size: ChatFontSize) => void
  isFocusMode: boolean
  onToggleFocusMode: () => void
  onOpenMobileConfig: () => void
  onOpenAgentPicker: () => void
}

export const ChatStudioHeader = memo(function ChatStudioHeader({
  activeAgent,
  onSelectAgent,
  onCreateNewConversation,
  showSessions,
  onToggleSessions,
  conversationsCount,
  showFiles,
  onToggleFiles,
  selectedNote,
  provider,
  onProviderChange,
  agents,
  selectedModel,
  isCustomModel,
  customModelInput,
  onCustomModelInputChange,
  onCustomModelConfirm,
  onModelSelect,
  onDeleteCurrentModel,
  currentAvailableModels,
  cloudEndpoints,
  webModels,
  syncingModels,
  modelSyncFeedback,
  onScanModels,
  onOpenModelManager,
  studyTone,
  onStudyToneChange,
  isDualMode,
  onToggleDualMode,
  peerAgent,
  onPeerAgentChange,
  peerProvider,
  onPeerProviderChange,
  peerModel,
  onPeerModelChange,
  activeSkill,
  onSelectStudySkill,
  selectedLocalSkill,
  onOpenSkillPicker,
  onOpenMemoryModal,
  onOpenMemoryTierModal,
  chatWidthMode,
  onWidthModeChange,
  chatFontSize,
  onFontSizeChange,
  isFocusMode,
  onToggleFocusMode,
  onOpenMobileConfig,
  onOpenAgentPicker,
}: ChatStudioHeaderProps) {
  const { points, canCheckinToday, isAdmin } = useAuth()
  const [hubPopoverOpen, setHubPopoverOpen] = useState(false)
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false)
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false)
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false)
  // 支持顶部设置栏收缩与折叠，最大化聊天视野
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => {
    return typeof window !== 'undefined' && localStorage.getItem('coreforge_chat_header_collapsed') === 'true'
  })

  const toggleHeaderCollapse = () => {
    setIsHeaderCollapsed(prev => {
      const next = !prev
      localStorage.setItem('coreforge_chat_header_collapsed', String(next))
      return next
    })
  }

  const closeAllPopovers = () => {
    setHubPopoverOpen(false)
    setSkillsDropdownOpen(false)
    setModelPopoverOpen(false)
    setAgentDropdownOpen(false)
  }

  const displayModelName = selectedModel
    ? selectedModel.includes('::')
      ? selectedModel.split('::')[1]
      : selectedModel
    : '默认模型'

  const activeProviderMeta = PROVIDER_META[provider]

  const isAnyPopoverOpen = modelPopoverOpen || skillsDropdownOpen || hubPopoverOpen || agentDropdownOpen

  return (
    <div className={`shrink-0 space-y-2 relative ${isAnyPopoverOpen ? 'z-40' : 'z-20'}`}>
      {/* 📱 移动端折叠收缩后的极简超细微型胶囊 (高度仅 26px，完全释放上方聊天视野) */}
      {isHeaderCollapsed && (
        <div className="flex md:hidden items-center justify-between gap-1 px-2 py-0.5 bg-white/95 border-b border-slate-200/80 shadow-2xs backdrop-blur-md relative z-20">
          <div className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              onClick={onToggleSessions}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 active:scale-95"
              title="历史会话列表"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <div
              onClick={toggleHeaderCollapse}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold cursor-pointer active:scale-95 truncate"
              title="点击展开完整引擎与导师设置"
            >
              <span>{activeAgent.icon}</span>
              <span className="truncate max-w-[76px]">{activeAgent.name}</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-mono text-[9.5px] text-slate-500 truncate max-w-[65px]">{displayModelName}</span>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={onCreateNewConversation}
              className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95"
              title="新建对话"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleHeaderCollapse}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200/70 active:scale-95 cursor-pointer"
              title="展开顶部设置"
            >
              <span>设置</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}

      {/* 📱 移动端展开态完整顶栏 (精致微缩自适应，防横向撑破) */}
      <div className={`${isHeaderCollapsed ? 'hidden' : 'flex'} md:hidden items-center justify-between gap-1 px-2 py-1 bg-white border-b border-slate-200/90 relative z-20 max-w-full overflow-x-auto no-scrollbar`}>
        <div className="flex items-center gap-1 min-w-0 shrink-0">
          <button
            type="button"
            onClick={onToggleSessions}
            className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-all active:scale-95 shrink-0 ${
              showSessions
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-slate-50 border-slate-200/80 text-slate-600'
            }`}
            title="历史对话列表"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenAgentPicker}
            className="flex items-center gap-1 h-8 px-2 rounded-lg bg-slate-100/90 border border-slate-200/80 text-slate-800 text-[11px] font-bold active:scale-95 transition-all min-w-0"
          >
            <span className="shrink-0">{activeAgent.icon}</span>
            <span className="truncate max-w-[60px]">{activeAgent.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* 中间：快速模型切换胶囊 */}
        <div className="relative flex items-center min-w-0 flex-1 max-w-[115px] sm:max-w-[140px] mx-0.5">
          <div className="w-full flex items-center justify-between gap-1 h-8 px-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[10.5px] text-slate-700 font-medium truncate pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-mono truncate flex-1">{displayModelName}</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
          </div>
          <select
            value={isCustomModel ? '__custom__' : selectedModel}
            onChange={e => {
              const val = e.target.value
              if (val === '__custom__') {
                onOpenMobileConfig()
                return
              }
              if (val.includes('::')) {
                onProviderChange('web')
                onModelSelect(val)
              } else if (
                PROVIDER_PRESET_MODELS.antigravity.includes(val) ||
                val.startsWith('gemini')
              ) {
                onProviderChange('antigravity')
                onModelSelect(val)
              } else if (
                PROVIDER_PRESET_MODELS.codex.includes(val) ||
                val.startsWith('gpt') ||
                val.startsWith('o3') ||
                val.startsWith('o1')
              ) {
                onProviderChange('codex')
                onModelSelect(val)
              } else if (
                PROVIDER_PRESET_MODELS['claude-code'].includes(val) ||
                val.startsWith('claude')
              ) {
                onProviderChange('claude-code')
                onModelSelect(val)
              } else {
                onModelSelect(val)
              }
            }}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            title="快速切换伴学模型"
          >
            <optgroup label="✨ Antigravity 2.0 (双核主力)">
              {(
                agents.find(a => a.provider === 'antigravity')?.models ||
                PROVIDER_PRESET_MODELS.antigravity
              ).map(m => (
                <option key={`ag_${m}`} value={m}>
                  ✨ {m}
                </option>
              ))}
            </optgroup>
            <optgroup label="🤖 Codex (代码与算法)">
              {(
                agents.find(a => a.provider === 'codex')?.models || PROVIDER_PRESET_MODELS.codex
              ).map(m => (
                <option key={`cd_${m}`} value={m}>
                  🤖 {m}
                </option>
              ))}
            </optgroup>
            <optgroup label="⚡ Claude Code (深度推理)">
              {(
                agents.find(a => a.provider === 'claude-code')?.models ||
                PROVIDER_PRESET_MODELS['claude-code']
              ).map(m => (
                <option key={`cl_${m}`} value={m}>
                  ⚡ {m}
                </option>
              ))}
            </optgroup>
            <optgroup label="☁️ 云端服务接口">
              {cloudEndpoints.length > 0
                ? cloudEndpoints.flatMap(ep =>
                    (ep.models || [ep.defaultModel || '']).map(m => (
                      <option key={`${ep.id}::${m}`} value={`${ep.id}::${m}`}>
                        ☁️ {ep.name}: {m}
                      </option>
                    ))
                  )
                : webModels.map(m => (
                    <option key={`web_${m}`} value={m}>
                      ☁️ {m}
                    </option>
                  ))}
            </optgroup>
            {isAdmin && <option value="__custom__">⚙️ 更多引擎与技能设置...</option>}
          </select>
        </div>

        {/* 右侧：关联笔记 + 设置 + 新建对话 */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleFiles}
            className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-all active:scale-95 ${
              selectedNote || showFiles
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-slate-50 border-slate-200/80 text-slate-600'
            }`}
            title="知识库笔记伴读"
          >
            <FolderTree className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onOpenMobileConfig}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 active:scale-95 transition-all"
            title="引擎与技能控制台"
          >
            <Settings className="w-3.5 h-3.5 text-indigo-600" />
          </button>
          <button
            type="button"
            onClick={onCreateNewConversation}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-slate-900 text-white active:scale-95 transition-all shadow-2xs"
            title="新建对话"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={toggleHeaderCollapse}
            className="h-8 px-1 inline-flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 active:scale-95 transition-all border border-slate-200/80"
            title="收起顶部设置栏，扩大聊天视窗"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 🖥️ 桌面端收起态微型悬浮条 */}
      {isHeaderCollapsed && (
        <div className="hidden md:flex items-center justify-between gap-3 bg-white/95 border border-neutral-200/80 rounded-xl px-3 py-1 shadow-2xs backdrop-blur-md relative z-20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSessions}
              className="h-6 px-2 rounded-lg text-slate-500 hover:text-slate-900 border border-slate-200/70 text-xs flex items-center gap-1 cursor-pointer"
              title="切换会话栏"
            >
              <PanelLeft className="w-3 h-3" />
              <span className="text-[10px] font-mono">{conversationsCount}</span>
            </button>
            <div
              onClick={toggleHeaderCollapse}
              className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-indigo-600 transition-colors"
              title="点击展开完整设置"
            >
              <span>{activeAgent.icon}</span>
              <span className="font-bold">{activeAgent.name}</span>
              <span className="text-slate-300">·</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-slate-500 text-[11px]">{displayModelName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onCreateNewConversation}
              className="h-6 px-2 rounded-lg bg-neutral-900 hover:bg-black text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer shadow-2xs"
              title="开启全新伴学对话"
            >
              <Plus className="w-3 h-3" />
              <span>新对话</span>
            </button>
            <button
              type="button"
              onClick={toggleHeaderCollapse}
              className="h-6 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="展开完整引擎、模型、技能与双师设置"
            >
              <span>展开设置</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 🖥️ 桌面端：清爽呼吸感双组工作台顶栏 (支持一键收缩) */}
      <div className={`${isHeaderCollapsed ? 'hidden' : 'hidden md:flex'} items-center justify-between gap-4 bg-white border border-neutral-200/80 rounded-xl px-3.5 py-2 shadow-xs backdrop-blur-md relative ${isAnyPopoverOpen ? 'z-40' : 'z-20'}`}>
        {/* 左组：侧栏开关 + 当值导师切换 + 新对话 */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onToggleSessions}
            className={`h-9 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              showSessions
                ? 'bg-slate-100 text-slate-900 border-slate-300/90'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={showSessions ? '收起左侧会话栏' : '展开左侧会话栏'}
          >
            <PanelLeft className="w-4 h-4 text-slate-500" />
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-md bg-slate-200/70 text-slate-600">
              {conversationsCount}
            </span>
          </button>

          {/* 宽屏 (xl+)：舒展无挤压的 5 导师分段胶囊 */}
          <div className="hidden xl:flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200/70 shrink-0">
            {STUDY_AGENTS.map(agent => {
              const isSelected = activeAgent.id === agent.id
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => onSelectAgent(agent)}
                  title={`${agent.name} (${agent.title})：${agent.description}`}
                  className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 font-medium'
                  }`}
                >
                  <span>{agent.icon}</span>
                  <span>{agent.name}</span>
                </button>
              )
            })}
          </div>

          {/* 中等桌面屏 (md ~ xl)：精致导师选择下拉，杜绝分屏挤压截断 */}
          <div className={`relative xl:hidden ${agentDropdownOpen ? 'z-50' : ''}`}>
            <button
              type="button"
              onClick={() => {
                const next = !agentDropdownOpen
                closeAllPopovers()
                setAgentDropdownOpen(next)
              }}
              className="h-9 px-3 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>{activeAgent.icon}</span>
              <span>{activeAgent.name}</span>
              <span className="text-[11px] font-normal text-slate-500 hidden lg:inline">
                · {activeAgent.title}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {agentDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAgentDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-1.5 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 z-50 space-y-1 animate-fade-in-up max-h-[calc(100vh-6rem)] overflow-y-auto">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    切换当值伴学导师
                  </div>
                  {STUDY_AGENTS.map(agent => {
                    const isSelected = activeAgent.id === agent.id
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => {
                          onSelectAgent(agent)
                          setAgentDropdownOpen(false)
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-start gap-2.5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-50/80' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base mt-0.5 shrink-0">{agent.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">{agent.name}</span>
                            <span className="text-[10px] text-slate-500">{agent.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {agent.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onCreateNewConversation}
            className="h-9 px-3 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
            title="开启全新伴学对话"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新对话</span>
          </button>
        </div>

        {/* 右组：一体化引擎/模型选择舱 + 核心伴学工具 */}
        <div className="flex items-center gap-2 shrink-0">
          {!isFocusMode && (
            <>
              {/* 一体化「AI 引擎 · 模型」选择舱 */}
              <div className={`relative ${modelPopoverOpen ? 'z-50' : ''}`}>
                <button
                  type="button"
                  onClick={() => {
                    const next = !modelPopoverOpen
                    closeAllPopovers()
                    setModelPopoverOpen(next)
                  }}
                  className={`h-9 px-3 rounded-lg border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    modelPopoverOpen
                      ? 'bg-neutral-100 border-neutral-900 text-neutral-900 shadow-xs'
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200/80 text-neutral-800'
                  }`}
                  title={`当前引擎：${activeProviderMeta.label} · 模型：${displayModelName}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${activeProviderMeta.badgeBg}`}
                  >
                    {activeProviderMeta.short}
                  </span>
                  <span className="font-mono font-medium text-slate-800 max-w-[140px] 2xl:max-w-[180px] truncate">
                    {displayModelName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {modelPopoverOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setModelPopoverOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-84 sm:w-96 bg-white border border-neutral-200 rounded-xl shadow-xl p-3.5 z-50 space-y-3 animate-fade-in-up max-h-[calc(100vh-6rem)] overflow-y-auto">
                      {/* 1. 引擎切换 */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            <span>选择推理引擎</span>
                          </span>
                          <button
                            type="button"
                            onClick={onScanModels}
                            disabled={syncingModels}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw
                              className={`w-3 h-3 ${syncingModels ? 'animate-spin' : ''}`}
                            />
                            <span>{syncingModels ? '探测中...' : '刷新模型'}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {(
                            [
                              { key: 'antigravity', label: '✨ Antigravity' },
                              { key: 'codex', label: '🤖 Codex' },
                              { key: 'claude-code', label: '⚡ Claude Code' },
                              { key: 'web', label: '☁️ 云端接口' },
                            ] as const
                          ).map(tab => {
                            const tabAgent = agents.find(a => a.provider === tab.key)
                            const isAvail = tab.key === 'web' || tabAgent?.available
                            const active = provider === tab.key
                            return (
                              <button
                                key={tab.key}
                                type="button"
                                onClick={() => onProviderChange(tab.key)}
                                className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                                  active
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                    : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
                                }`}
                              >
                                <span className="truncate">{tab.label}</span>
                                {isAvail && (
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      active ? 'bg-emerald-300' : 'bg-emerald-500'
                                    }`}
                                  />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* 2. 当前引擎下的模型列表 */}
                      <div className="pt-2.5 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            切换模型
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setModelPopoverOpen(false)
                                onOpenModelManager()
                              }}
                              className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              管理模型列表
                            </button>
                          )}
                        </div>

                        <div className="max-h-52 overflow-y-auto space-y-1 pr-0.5">
                          {provider === 'web' && cloudEndpoints.length > 0 ? (
                            cloudEndpoints.map(ep => (
                              <div key={ep.id} className="space-y-0.5">
                                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400">
                                  🌐 {ep.name}
                                </div>
                                {(ep.models && ep.models.length > 0
                                  ? ep.models
                                  : ep.defaultModel
                                  ? [ep.defaultModel]
                                  : []
                                ).map(m => {
                                  const optionValue = `${ep.id}::${m}`
                                  const isSel = !isCustomModel && selectedModel === optionValue
                                  return (
                                    <button
                                      key={optionValue}
                                      type="button"
                                      onClick={() => {
                                        onModelSelect(optionValue)
                                        setModelPopoverOpen(false)
                                      }}
                                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                                        isSel
                                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                                          : 'text-slate-700 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span className="truncate">{m}</span>
                                      {isSel && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                    </button>
                                  )
                                })}
                              </div>
                            ))
                          ) : currentAvailableModels.length > 0 ? (
                            currentAvailableModels.map(m => {
                              const isSel = !isCustomModel && selectedModel === m
                              return (
                                <button
                                  key={m}
                                  type="button"
                                  onClick={() => {
                                    onModelSelect(m)
                                    setModelPopoverOpen(false)
                                  }}
                                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                                    isSel
                                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span className="truncate">{m}</span>
                                  {isSel && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                </button>
                              )
                            })
                          ) : (
                            <div className="py-3 text-center text-xs text-slate-400">
                              未检测到可用模型，请点击右上角「刷新模型」
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. 自定义模型名快捷输入 - 仅超级管理员可见 */}
                      {isAdmin && (
                        <div className="pt-2.5 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="手动输入自定义模型名称..."
                              value={customModelInput}
                              onChange={e => {
                                if (!isCustomModel) onModelSelect('__custom__')
                                onCustomModelInputChange(e.target.value)
                              }}
                              className="flex-1 h-8 text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-slate-800 font-mono focus:outline-hidden focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onCustomModelConfirm()
                                setModelPopoverOpen(false)
                              }}
                              disabled={!customModelInput.trim()}
                              className="h-8 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                            >
                              应用
                            </button>
                          </div>
                          {modelSyncFeedback && (
                            <p className="mt-1.5 text-[11px] text-emerald-600 font-medium">
                              {modelSyncFeedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* 双智能体同台开关 */}
              <button
                type="button"
                onClick={onToggleDualMode}
                className={`h-9 px-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border shrink-0 ${
                  isDualMode
                    ? 'bg-orange-50 text-orange-700 border-orange-300 font-bold shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200/85'
                }`}
                title="开启后，一次提问同时由两位导师并排对比解答"
              >
                <Users className="w-3.5 h-3.5 text-orange-500" />
                <span className="hidden lg:inline">{isDualMode ? '双师同台中' : '双师对比'}</span>
              </button>
            </>
          )}

          <div className="h-4 w-px bg-slate-200/80 hidden lg:block" />

          {/* 知识库笔记伴读分栏开关 */}
          <button
            type="button"
            onClick={onToggleFiles}
            className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showFiles || selectedNote
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200/85 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="打开知识库目录与笔记原文伴读面板"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden lg:inline">{selectedNote ? '伴读中' : '伴读'}</span>
            {selectedNote && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            )}
          </button>

          {/* 考研专项 Skills 快选下拉 */}
          <div className={`relative ${skillsDropdownOpen ? 'z-50' : ''}`}>
            <button
              type="button"
              onClick={() => {
                const next = !skillsDropdownOpen
                closeAllPopovers()
                setSkillsDropdownOpen(next)
              }}
              className={`h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSkill || selectedLocalSkill
                  ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200/85 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="调用考研自动化技能或系统自带技能库"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden xl:inline truncate max-w-[92px]">
                {activeSkill
                  ? activeSkill.shortName
                  : selectedLocalSkill
                  ? selectedLocalSkill.displayName
                  : '技能'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {skillsDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSkillsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 z-50 space-y-1 animate-fade-in-up max-h-[calc(100vh-6rem)] overflow-y-auto">
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      考研自动化专项技能
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSkillsDropdownOpen(false)
                        onOpenSkillPicker()
                      }}
                      className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>系统自带技能库</span>
                    </button>
                  </div>
                  {STUDY_SKILLS.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => {
                        onSelectStudySkill(skill)
                        setSkillsDropdownOpen(false)
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{skill.emoji}</span>
                          <span>{skill.shortName}</span>
                        </div>
                        <span className="text-[10px] text-purple-600 font-mono">
                          {skill.command}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {skill.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 偏好、记忆与视图控制聚合按钮 */}
          <div className={`relative ${hubPopoverOpen ? 'z-50' : ''}`}>
            <button
              type="button"
              onClick={() => {
                const next = !hubPopoverOpen
                closeAllPopovers()
                setHubPopoverOpen(next)
              }}
              className={`h-9 w-9 inline-flex items-center justify-center rounded-xl border text-xs transition-all cursor-pointer ${
                hubPopoverOpen
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-slate-600 border-slate-200/85 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="记忆仓库、阅读版面宽度与显示偏好"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {hubPopoverOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setHubPopoverOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-neutral-200 rounded-xl shadow-xl p-3.5 z-50 space-y-3.5 animate-fade-in-up max-h-[calc(100vh-6rem)] overflow-y-auto">
                  {/* 1. 认知记忆与本机技能中心 */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      认知记忆与扩展技能
                    </div>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setHubPopoverOpen(false)
                          onOpenMemoryModal()
                        }}
                        className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold bg-amber-50/90 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 cursor-pointer transition-colors"
                      >
                        <Brain className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>AI 记忆仓库</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHubPopoverOpen(false)
                        onOpenSkillPicker()
                      }}
                      className="mt-1.5 w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold bg-purple-50/90 hover:bg-purple-100/80 border border-purple-200/80 text-purple-900 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>打开系统自带技能库</span>
                    </button>
                  </div>

                  {/* 2. 模型治理 - 仅超级管理员可见 */}
                  {isAdmin && (
                    <div className="pt-2.5 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        模型探测与列表治理
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setHubPopoverOpen(false)
                            onOpenModelManager()
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-600" />
                          <span>管理已配置模型列表</span>
                        </button>
                        {selectedModel && !isCustomModel && (
                          <button
                            type="button"
                            onClick={onDeleteCurrentModel}
                            title={`删除当前模型「${selectedModel}」`}
                            className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-red-300 hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. 作答语调风格 */}
                  <div className="pt-2.5 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      导师作答风格
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                      {[
                        { key: 'rigorous' as const, label: '📐 学术严谨' },
                        { key: 'vivid' as const, label: '💡 通俗直观' },
                        { key: 'exam' as const, label: '⚡ 考场冲刺' },
                        { key: 'followup' as const, label: '🎯 针对追问' },
                      ].map(t => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => onStudyToneChange(t.key)}
                          className={`py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            studyTone === t.key
                              ? 'bg-white text-slate-900 shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. 阅读版面宽度与字号 */}
                  <div className="pt-2.5 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">版面宽度</span>
                      <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                        {[
                          { key: 'normal' as const, label: '标准' },
                          { key: 'wide' as const, label: '宽屏' },
                          { key: 'full' as const, label: '满屏' },
                        ].map(w => (
                          <button
                            key={w.key}
                            type="button"
                            onClick={() => onWidthModeChange(w.key)}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium cursor-pointer ${
                              chatWidthMode === w.key
                                ? 'bg-slate-900 text-white font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">正文字号</span>
                      <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg">
                        {[
                          { key: 'sm' as const, label: 'A-' },
                          { key: 'base' as const, label: 'A' },
                          { key: 'lg' as const, label: 'A+' },
                        ].map(s => (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => onFontSizeChange(s.key)}
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium cursor-pointer ${
                              chatFontSize === s.key
                                ? 'bg-slate-900 text-white font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 伴学积分胶囊与签到入口 */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-checkin-modal'))}
            className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-200/90 bg-amber-50/80 px-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-all cursor-pointer active:scale-95"
            title="伴学积分中心 (单次提问消耗 0.1 积分，每日签到领 1 积分)"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span className="font-mono text-amber-950">{points.toFixed(1)}</span>
            <span className="text-[10px] text-amber-700 font-medium">分</span>
            {canCheckinToday && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold animate-pulse">
                签到+1
              </span>
            )}
          </button>

          {/* 专注大视野开关 */}
          <button
            type="button"
            onClick={onToggleFocusMode}
            className={`h-9 w-9 inline-flex items-center justify-center rounded-xl border text-xs transition-all cursor-pointer active:scale-95 ${
              isFocusMode
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200/85 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title={isFocusMode ? '退出专注视野' : '开启专注大视野'}
          >
            {isFocusMode ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* 收起顶部设置按钮 */}
          <button
            type="button"
            onClick={toggleHeaderCollapse}
            className="h-9 px-2.5 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200/85 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium transition-all cursor-pointer active:scale-95"
            title="收起顶部设置栏，获得更大聊天屏幕视野"
          >
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline text-[11px]">收起</span>
          </button>
        </div>
      </div>

      {/* 👥 双智能体协同紧凑配置条（仅当开启双师同台时显示） */}
      {isDualMode && (
        <div className="hidden md:flex bg-gradient-to-r from-orange-500/8 via-amber-500/8 to-purple-500/8 border border-orange-200/80 rounded-2xl px-4 py-2 items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            <span className="font-bold text-orange-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-orange-600" />
              <span>双师同台对比：</span>
            </span>

            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-orange-200/80 text-slate-800 font-medium shadow-2xs">
              <span className="font-bold text-orange-600">主导师 A:</span>
              <span>
                {activeAgent.icon} {activeAgent.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                [{provider} · {displayModelName}]
              </span>
            </div>

            <span className="text-[11px] font-bold text-slate-400">VS</span>

            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-purple-200/80 text-slate-800 font-medium shadow-2xs">
              <span className="font-bold text-purple-600">协同导师 B:</span>
              <select
                value={peerAgent.id}
                onChange={e => {
                  const found = STUDY_AGENTS.find(a => a.id === e.target.value)
                  if (found) onPeerAgentChange(found)
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {STUDY_AGENTS.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name}
                  </option>
                ))}
              </select>

              <select
                value={peerProvider}
                onChange={e => onPeerProviderChange(e.target.value as ProviderType)}
                className="bg-transparent text-xs font-semibold text-purple-700 focus:outline-hidden cursor-pointer"
              >
                <option value="claude-code">⚡ Claude Code</option>
                <option value="codex">🤖 Codex</option>
                <option value="web">☁️ 云端</option>
                <option value="antigravity">✨ Antigravity</option>
              </select>

              <select
                value={peerModel}
                onChange={e => onPeerModelChange(e.target.value)}
                className="bg-transparent text-xs font-mono text-slate-700 focus:outline-hidden max-w-[130px] truncate cursor-pointer"
              >
                {(PROVIDER_PRESET_MODELS[peerProvider] || [peerModel]).map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleDualMode}
            className="text-xs text-orange-700 hover:underline font-semibold cursor-pointer shrink-0"
          >
            退出双师对比
          </button>
        </div>
      )}
    </div>
  )
})

export default ChatStudioHeader
