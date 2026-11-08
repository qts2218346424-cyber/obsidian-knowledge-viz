import { useState, useEffect } from 'react'

/**
 * 考研研学全站统一移动端/电脑端设备与视口自适应 Hook
 * 专为手机端差异化视图重构设计：
 * - isMobile: 屏幕宽度 < 768px 或移动设备 UserAgent，呈现专为手机竖屏与单手操作打造的原生感页面
 * - isDesktop: 屏幕宽度 >= 1024px，呈现双栏/三栏专业多任务工作台
 */
export function useIsMobile(breakpoint = 768): {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
} {
  const getWindowWidth = (): number => {
    if (typeof window === 'undefined') return 1200
    return window.innerWidth
  }

  const checkIsMobileUserAgent = (): boolean => {
    if (typeof navigator === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  const [width, setWidth] = useState<number>(getWindowWidth)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < breakpoint || (window.innerWidth < 1024 && checkIsMobileUserAgent())
  })

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setWidth(w)
      const mobileUa = checkIsMobileUserAgent()
      setIsMobile(w < breakpoint || (w < 1024 && mobileUa))
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [breakpoint])

  return {
    isMobile,
    isTablet: width >= breakpoint && width < 1024,
    isDesktop: width >= 1024,
    width,
  }
}

export default useIsMobile
