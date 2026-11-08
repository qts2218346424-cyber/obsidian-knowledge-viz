import { useState, useEffect, useCallback } from 'react'

export type ThemeStyle = 'vibrant' | 'minimal'

const STORAGE_KEY = 'coreforge_ui_style'
const EVENT_KEY = 'coreforge_ui_style_change'

function getInitialStyle(): ThemeStyle {
  if (typeof window === 'undefined') return 'vibrant'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'minimal' || saved === 'vibrant') {
      return saved
    }
  } catch {}
  // 默认启用鲜艳活力风，赋予界面丰富多彩的研学色彩
  return 'vibrant'
}

function applyStyleToDOM(style: ThemeStyle) {
  if (typeof document === 'undefined') return
  try {
    const root = document.documentElement
    if (style === 'vibrant') {
      root.classList.add('theme-vibrant')
      root.classList.remove('theme-minimal')
    } else {
      root.classList.remove('theme-vibrant')
      root.classList.add('theme-minimal')
    }
  } catch {}
}

// 立即在模块加载时安全应用一次，防止页面初次渲染时闪烁
if (typeof window !== 'undefined') {
  try {
    applyStyleToDOM(getInitialStyle())
  } catch {}
}

export function useThemeStyle() {
  const [themeStyle, setThemeStyleState] = useState<ThemeStyle>(getInitialStyle)

  useEffect(() => {
    applyStyleToDOM(themeStyle)

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeStyle>
      if (customEvent.detail && customEvent.detail !== themeStyle) {
        setThemeStyleState(customEvent.detail)
        applyStyleToDOM(customEvent.detail)
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'vibrant' || e.newValue === 'minimal')) {
        setThemeStyleState(e.newValue as ThemeStyle)
        applyStyleToDOM(e.newValue as ThemeStyle)
      }
    }

    window.addEventListener(EVENT_KEY, handleCustomChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener(EVENT_KEY, handleCustomChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [themeStyle])

  const setThemeStyle = useCallback((newStyle: ThemeStyle) => {
    setThemeStyleState(newStyle)
    try {
      localStorage.setItem(STORAGE_KEY, newStyle)
    } catch {}
    applyStyleToDOM(newStyle)
    try {
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: newStyle }))
    } catch {}
  }, [])

  const toggleThemeStyle = useCallback(() => {
    setThemeStyle(themeStyle === 'vibrant' ? 'minimal' : 'vibrant')
  }, [themeStyle, setThemeStyle])

  return {
    themeStyle,
    isVibrant: themeStyle === 'vibrant',
    setThemeStyle,
    toggleThemeStyle,
  }
}
