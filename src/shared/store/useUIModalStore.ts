import { create } from 'zustand'

export type GlobalModalId =
  | 'search'
  | 'quick-note'
  | 'ai-assistant'
  | 'import-resource'
  | 'mobile-device'
  | 'user-guide'
  | 'checkin'
  | 'user-management'

export interface ModalPayloads {
  'search': { initialQuery?: string } | undefined
  'quick-note': { defaultTags?: string[]; initialContent?: string } | undefined
  'ai-assistant': { initialPrompt?: string } | undefined
  'import-resource': { defaultCategory?: string } | undefined
  'mobile-device': undefined
  'user-guide': undefined
  'checkin': undefined
  'user-management': undefined
}

interface UIModalState {
  activeModals: Partial<Record<GlobalModalId, boolean>>
  payloads: Partial<ModalPayloads>
  openModal: <K extends GlobalModalId>(id: K, payload?: ModalPayloads[K]) => void
  closeModal: (id: GlobalModalId) => void
  toggleModal: (id: GlobalModalId) => void
  isModalOpen: (id: GlobalModalId) => boolean
  getPayload: <K extends GlobalModalId>(id: K) => ModalPayloads[K]
}

export const useUIModalStore = create<UIModalState>((set, get) => ({
  activeModals: {},
  payloads: {},
  openModal: (id, payload) =>
    set((state) => ({
      activeModals: { ...state.activeModals, [id]: true },
      payloads: payload !== undefined ? { ...state.payloads, [id]: payload } : state.payloads,
    })),
  closeModal: (id) =>
    set((state) => ({
      activeModals: { ...state.activeModals, [id]: false },
    })),
  toggleModal: (id) =>
    set((state) => ({
      activeModals: { ...state.activeModals, [id]: !state.activeModals[id] },
    })),
  isModalOpen: (id) => Boolean(get().activeModals[id]),
  getPayload: (id) => get().payloads[id] as any,
}))
