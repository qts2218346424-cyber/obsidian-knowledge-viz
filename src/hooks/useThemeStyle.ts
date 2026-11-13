import { useState, useEffect, useCallback } from 'react'

export type ThemeStyle = 'vibrant' | 'minimal' | 'eyecare' | 'dark'

export interface ThemeMeta {
  id: ThemeStyle
  name: string
  shortName: string
  icon: string
  description: string
  accentColor: string
}

export const THEME_CONFIGS: Record<ThemeStyle, ThemeMeta> = {
  vibrant: {
    id: 'vibrant',
    name: '鲜艳活力风',
    shortName: '鲜艳风',
    icon: '🎨',
    description: '408科技蓝、政治正气红、数学极光紫，告别黑白沉闷，记忆更高效',
    accentColor: '#4f46e5',
  },
  minimal: {
    id: 'minimal',
    name: '经典极简黑白',
    shortName: '极简风',
    icon: '♟️',
    description: '源自讲义级微哑光纸感灰白基调，低眩光极简沉浸，专注长文精读与清晰推导',
    accentColor: '#18181b',
  },
  eyecare: {
    id: 'eyecare',
    name: '温润纸质护眼',
    shortName: '护眼风',
    icon: '🍃',
    description: '温润豆沙宣纸天然微色温，漫射柔和护目，过滤高能蓝光，长时备考不酸胀',
    accentColor: '#2d6a4f',
  },
  dark: {
    id: 'dark',
    name: '深邃夜间暗黑',
    shortName: '黑夜风',
    icon: '🌙',
    description: '纯净深空夜色与微光对比，夜间研学不刺眼，沉浸专注夜战首选',
    accentColor: '#38bdf8',
  },
}

export const THEME_CYCLE_ORDER: ThemeStyle[] = ['vibrant', 'minimal', 'eyecare', 'dark']

const STORAGE_KEY = 'coreforge_ui_style'
const EVENT_KEY = 'coreforge_ui_style_change'

function getInitialStyle(): ThemeStyle {
  if (typeof window === 'undefined') return 'vibrant'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'minimal' || saved === 'vibrant' || saved === 'eyecare' || saved === 'dark') {
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
    root.classList.remove('theme-vibrant', 'theme-minimal', 'theme-eyecare', 'theme-dark', 'dark')
    root.setAttribute('data-theme', style)

    if (style === 'vibrant') {
      root.classList.add('theme-vibrant')
    } else if (style === 'minimal') {
      root.classList.add('theme-minimal')
    } else if (style === 'eyecare') {
      root.classList.add('theme-eyecare')
    } else if (style === 'dark') {
      root.classList.add('dark', 'theme-dark')
    }

    // 更新原生滚动条与表单控件色彩体系
    if (style === 'dark') {
      root.style.colorScheme = 'dark'
    } else {
      root.style.colorScheme = 'light'
    }

    // 设置浏览器原生主题颜色元标签，增强移动端和浏览器顶栏沉浸度
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }
    const colorMap: Record<ThemeStyle, string> = {
      vibrant: '#ffffff',
      minimal: '#f8fafc',
      eyecare: '#f5f6f2',
      dark: '#0b0f19',
    }
    metaThemeColor.setAttribute('content', colorMap[style] || '#ffffff')
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
      if (
        e.key === STORAGE_KEY &&
        (e.newValue === 'vibrant' ||
          e.newValue === 'minimal' ||
          e.newValue === 'eyecare' ||
          e.newValue === 'dark')
      ) {
        const nextStyle = e.newValue as ThemeStyle
        setThemeStyleState(nextStyle)
        applyStyleToDOM(nextStyle)
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
    const currentIndex = THEME_CYCLE_ORDER.indexOf(themeStyle)
    const nextIndex = (currentIndex + 1) % THEME_CYCLE_ORDER.length
    setThemeStyle(THEME_CYCLE_ORDER[nextIndex])
  }, [themeStyle, setThemeStyle])

  return {
    themeStyle,
    isVibrant: themeStyle === 'vibrant',
    isMinimal: themeStyle === 'minimal',
    isEyecare: themeStyle === 'eyecare',
    isDark: themeStyle === 'dark',
    currentThemeMeta: THEME_CONFIGS[themeStyle] || THEME_CONFIGS.vibrant,
    themeConfigs: THEME_CONFIGS,
    setThemeStyle,
    toggleThemeStyle,
  }
}
