import { X, Sparkles, Settings, Users, Brain, Settings as IcSettings } from 'lucide-react'
import type { ProviderType, ChatFontSize } from './ChatStudioHeader'

export type StudyTone = 'rigorous' | 'vivid' | 'exam'

export interface ChatMobileConfigSheetProps {
  mobileConfigOpen: boolean
  setMobileConfigOpen: (open: boolean) => void
  studyTone: StudyTone
  setStudyTone: (tone: StudyTone) => void
  provider: ProviderType
  handleProviderChange: (provider: ProviderType) => void
  currentAvailableModels: string[]
  selectedModel: string
  isCustomModel: boolean
  handleModelSelect: (model: string) => void
  isAdmin: boolean
  setShowModelManagerModal: (open: boolean) => void
  setShowMemoryModal: (open: boolean) => void
  setShowSkillPicker: (open: boolean) => void
  chatFontSize: ChatFontSize
  handleSetFontSize: (size: ChatFontSize) => void
  isDualMode: boolean
  setIsDualMode: (on: boolean) => void
}

export default function ChatMobileConfigSheet({ mobileConfigOpen, setMobileConfigOpen, studyTone, setStudyTone, provider, handleProviderChange, currentAvailableModels, selectedModel, isCustomModel, handleModelSelect, isAdmin, setShowModelManagerModal, setShowMemoryModal, setShowSkillPicker, chatFontSize, handleSetFontSize, isDualMode, setIsDualMode }: ChatMobileConfigSheetProps) {
  return (
    <>
      {mobileConfigOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end modal-backdrop-contain">
            <div
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs"
              onClick={() => setMobileConfigOpen(false)}
            />
            <div className="relative bg-white rounded-t-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl border-t border-slate-200 max-h-[86dvh] overflow-y-auto modal-scroll-contain space-y-4 animate-sheet-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">伴学引擎与技能控制台</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileConfigOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. 伴学风格 */}
              <div className="space-y-1.5">
                <div className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                  伴学风格与语调
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'rigorous', label: '📐 学术严谨' },
                    { key: 'vivid', label: '💡 通俗直观' },
                    { key: 'exam', label: '⚡ 考场冲刺' },
                  ].map(tone => (
                    <button
                      key={tone.key}
                      type="button"
                      onClick={() => setStudyTone(tone.key as any)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all ${
                        studyTone === tone.key
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. 双核引擎选择 */}
              <div className="space-y-1.5">
                <div className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                  AI 驱动底座
                </div>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  {[
                    { key: 'antigravity' as const, label: '✨ Antigravity' },
                    { key: 'codex' as const, label: '🤖 Codex' },
                    { key: 'claude-code' as const, label: '⚡ Claude' },
                    { key: 'web' as const, label: '☁️ 云端双核' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleProviderChange(tab.key)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all ${
                        provider === tab.key
                          ? 'bg-white text-slate-900 shadow-xs font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 模型管理 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                    选择模型
                  </span>

                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={isCustomModel ? '__custom__' : selectedModel}
                    onChange={e => handleModelSelect(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium outline-none"
                  >
                    {currentAvailableModels.map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                    {isAdmin && <option value="__custom__"><IcSettings className="emoji-icon" aria-hidden="true" />自定义模型名称...</option>}
                  </select>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileConfigOpen(false)
                        setShowModelManagerModal(true)
                      }}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 4. 记忆与技能 */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileConfigOpen(false)
                    setShowMemoryModal(true)
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800"
                >
                  <Brain className="w-3.5 h-3.5 text-amber-600" />
                  <span>AI 记忆仓库</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileConfigOpen(false)
                    setShowSkillPicker(true)
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold bg-purple-50 border border-purple-200 text-purple-800"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>自带技能库</span>
                </button>
              </div>

              {/* 5. 字号与双师同台 */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">回答正文字号</span>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-0.5">
                    {[
                      { key: 'sm' as const, label: '紧凑 A-' },
                      { key: 'base' as const, label: '标准 A' },
                      { key: 'lg' as const, label: '清晰 A+' },
                    ].map(item => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleSetFontSize(item.key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          chatFontSize === item.key
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDualMode(!isDualMode)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    isDualMode
                      ? 'bg-orange-50 border-orange-300 text-orange-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-orange-500" />
                    <span>双智能体同台对比研讨</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-2xs ${
                      isDualMode ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDualMode ? '已开启' : '未开启'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMobileConfigOpen(false)}
                className="w-full py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-sm"
              >
                完成配置并返回对话
              </button>
            </div>
          </div>
        )}
    </>
  )
}
