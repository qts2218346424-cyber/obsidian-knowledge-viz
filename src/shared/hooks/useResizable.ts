import { useState, useCallback, useEffect } from 'react'

interface UseResizableOptions {
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
  storageKey?: string
  direction?: 'left' | 'right'
}

export function useResizable({
  initialWidth = 320,
  minWidth = 220,
  maxWidth = 600,
  storageKey,
  direction = 'left',
}: UseResizableOptions = {}) {
  const [width, setWidth] = useState<number>(() => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed
        }
      }
    }
    return initialWidth
  })

  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = direction === 'left' ? e.clientX : window.innerWidth - e.clientX
      if (newWidth < minWidth) newWidth = minWidth
      if (newWidth > maxWidth) newWidth = maxWidth
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      if (storageKey) {
        localStorage.setItem(storageKey, String(width))
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, minWidth, maxWidth, storageKey, direction, width])

  return { width, isResizing, startResizing, setWidth }
}

export default useResizable
