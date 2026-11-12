import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  mobileSheet?: boolean // 移动端是否自动转为底部上滑 Sheet
  children: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
  closeOnBackdropClick?: boolean
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-5xl',
  full: 'max-w-[96vw] h-[92dvh]',
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  mobileSheet = true,
  children,
  footer,
  className = '',
  contentClassName = '',
  closeOnBackdropClick = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex bg-slate-950/60 backdrop-blur-xs animate-fade-in ${
        mobileSheet
          ? 'items-end sm:items-center justify-center p-0 sm:p-4'
          : 'items-center justify-center p-3 sm:p-4'
      }`}
      onMouseDown={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        ref={dialogRef}
        className={`relative flex flex-col w-full ${SIZE_CLASSES[size]} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden ${
          mobileSheet
            ? 'rounded-t-3xl sm:rounded-2xl max-h-[90dvh] animate-sheet-up sm:animate-fade-in-up'
            : 'rounded-2xl max-h-[90dvh] animate-fade-in-up'
        } ${className}`}
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
              aria-label="关闭弹窗"
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

export default Modal
