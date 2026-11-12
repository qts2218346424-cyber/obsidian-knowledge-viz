import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  position?: 'left' | 'right' | 'bottom'
  width?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  position = 'right',
  width = 'max-w-md',
  children,
  footer,
  className = '',
  contentClassName = '',
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const positionClasses = {
    right: 'top-0 right-0 h-full w-full sm:' + width + ' border-l animate-fade-in-up',
    left: 'top-0 left-0 h-full w-full sm:' + width + ' border-r animate-fade-in-up',
    bottom: 'bottom-0 left-0 w-full rounded-t-3xl border-t max-h-[85vh] animate-sheet-up',
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={drawerRef}
        className={`fixed flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden ${positionClasses[position]} ${className}`}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div>
              {title && <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭抽屉"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className={`flex-1 overflow-y-auto p-5 ${contentClassName}`}>{children}</div>
        {footer && (
          <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Drawer
