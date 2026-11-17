import { useState, useEffect, useCallback } from 'react'

export type ChatBackdropId = 'aurora' | 'parchment' | 'sage' | 'blueprint' | 'cosmos' | 'minimal'

export interface ChatBackdropOption {
  id: ChatBackdropId
  label: string
  shortDesc: string
  swatchStyle: string
  isDarkSurface?: boolean
}

export const CHAT_BACKDROP_OPTIONS: ChatBackdropOption[] = [
  {
    id: 'aurora',
    label: '学科极光',
    shortDesc: '随导师学科变换柔光微点阵',
    swatchStyle: 'linear-gradient(135deg, #e0e7ff 0%, #fae8ff 50%, #d1fae5 100%)',
  },
  {
    id: 'parchment',
    label: '牛津书卷',
    shortDesc: '温润暖米羊皮纸护眼质感',
    swatchStyle: 'linear-gradient(135deg, #faf5e8 0%, #f3ead6 100%)',
  },
  {
    id: 'sage',
    label: '清茗青瓷',
    shortDesc: '森系豆沙绿舒缓备考焦虑',
    swatchStyle: 'linear-gradient(135deg, #eef7f2 0%, #dceee3 100%)',
  },
  {
    id: 'blueprint',
    label: '精密方格',
    shortDesc: '理工草稿本微方格坐标纸',
    swatchStyle: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
  },
  {
    id: 'cosmos',
    label: '深空星云',
    shortDesc: '静谧午夜星空沉浸推演',
    swatchStyle: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #090d16 100%)',
    isDarkSurface: true,
  },
  {
    id: 'minimal',
    label: '无界纯白',
    shortDesc: '零纹理克制纯净留白',
    swatchStyle: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
  },
]

const STORAGE_KEY = 'coreforge_chat_backdrop_v1'
const SYNC_EVENT = 'coreforge-chat-backdrop-change'

export function getStoredChatBackdrop(): ChatBackdropId {
  if (typeof window === 'undefined') return 'aurora'
  try {
    const raw = localStorage.getItem(STORAGE_KEY) as ChatBackdropId | null
    if (raw && CHAT_BACKDROP_OPTIONS.some((o) => o.id === raw)) {
      return raw
    }
  } catch {}
  return 'aurora'
}

export function setStoredChatBackdrop(next: ChatBackdropId) {
  try {
    localStorage.setItem(STORAGE_KEY, next)
    window.dispatchEvent(new CustomEvent<ChatBackdropId>(SYNC_EVENT, { detail: next }))
  } catch {}
}

export function useChatBackdrop() {
  const [backdropId, setBackdropState] = useState<ChatBackdropId>(() => getStoredChatBackdrop())

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<ChatBackdropId>
      if (custom.detail) {
        setBackdropState(custom.detail)
      }
    }
    window.addEventListener(SYNC_EVENT, handler)
    return () => window.removeEventListener(SYNC_EVENT, handler)
  }, [])

  const setBackdrop = useCallback((id: ChatBackdropId) => {
    setBackdropState(id)
    setStoredChatBackdrop(id)
  }, [])

  const currentMeta =
    CHAT_BACKDROP_OPTIONS.find((o) => o.id === backdropId) || CHAT_BACKDROP_OPTIONS[0]

  return {
    backdropId,
    setBackdrop,
    currentMeta,
    options: CHAT_BACKDROP_OPTIONS,
  }
}

/**
 * 根据当前选中的背景主题与导师所属学科，返回主伴学面板的类名
 */
export function resolveChatBackdropClass(
  backdropId: ChatBackdropId,
  agentDomain?: string
): string {
  switch (backdropId) {
    case 'parchment':
      return 'chat-canvas-parchment'
    case 'sage':
      return 'chat-canvas-sage'
    case 'blueprint':
      return 'chat-canvas-blueprint'
    case 'cosmos':
      return 'chat-canvas-cosmos dark'
    case 'minimal':
      return 'chat-canvas-minimal'
    case 'aurora':
    default:
      if (agentDomain === 'math') return 'chat-canvas-aurora chat-aurora-math'
      if (agentDomain === 'english') return 'chat-canvas-aurora chat-aurora-english'
      if (agentDomain === 'politics') return 'chat-canvas-aurora chat-aurora-politics'
      return 'chat-canvas-aurora chat-aurora-408'
  }
}
