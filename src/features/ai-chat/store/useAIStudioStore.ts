import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProviderType = 'antigravity' | 'codex' | 'claude-code' | 'web'
export type ChatWidthMode = 'narrow' | 'medium' | 'wide' | 'full'
export type ChatFontSize = 'sm' | 'base' | 'lg'

export const PROVIDER_PRESET_MODELS: Record<ProviderType, string[]> = {
  antigravity: ['gemini-3.8-flash', 'gemini-3.8-pro'],
  codex: ['gpt-5.6-luna', 'gpt-4o', 'o3-mini', 'o1', 'gpt-4o-mini'],
  'claude-code': ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-flash', 'deepseek-reasoner'],
  web: ['gpt-4.5', 'claude-3-7-sonnet', 'grok-3', 'gemini-2.5-pro'],
}

interface AIStudioState {
  provider: ProviderType
  selectedModel: string
  dualAgentMode: boolean
  peerAgentId: string
  peerModel: string
  sidebarWidth: number
  notePanelWidth: number
  fontSize: ChatFontSize
  widthMode: ChatWidthMode
  isFocusMode: boolean

  // Actions
  setProvider: (provider: ProviderType) => void
  setSelectedModel: (model: string) => void
  setDualAgentMode: (mode: boolean) => void
  setPeerAgentId: (agentId: string) => void
  setPeerModel: (model: string) => void
  setSidebarWidth: (width: number) => void
  setNotePanelWidth: (width: number) => void
  setFontSize: (size: ChatFontSize) => void
  setWidthMode: (mode: ChatWidthMode) => void
  setIsFocusMode: (focus: boolean) => void
}

export const useAIStudioStore = create<AIStudioState>()(
  persist(
    (set) => ({
      provider: 'antigravity',
      selectedModel: 'gemini-3.8-flash',
      dualAgentMode: false,
      peerAgentId: 'tang-shuo-math',
      peerModel: 'deepseek-v4-flash',
      sidebarWidth: 248,
      notePanelWidth: 380,
      fontSize: 'base',
      widthMode: 'wide',
      isFocusMode: false,

      setProvider: (provider) =>
        set((state) => {
          const defaultModel = PROVIDER_PRESET_MODELS[provider]?.[0] || state.selectedModel
          return { provider, selectedModel: defaultModel }
        }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setDualAgentMode: (dualAgentMode) => set({ dualAgentMode }),
      setPeerAgentId: (peerAgentId) => set({ peerAgentId }),
      setPeerModel: (peerModel) => set({ peerModel }),
      setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
      setNotePanelWidth: (notePanelWidth) => set({ notePanelWidth }),
      setFontSize: (fontSize) => set({ fontSize }),
      setWidthMode: (widthMode) => set({ widthMode }),
      setIsFocusMode: (isFocusMode) => set({ isFocusMode }),
    }),
    {
      name: 'coreforge_ai_studio_settings',
    }
  )
)
