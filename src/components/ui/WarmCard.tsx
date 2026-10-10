interface WarmCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  role?: string
  ariaLabel?: string
}

export default function WarmCard({
  children,
  className = '',
  hover = false,
  onClick,
  role,
  ariaLabel,
}: WarmCardProps) {
  const isClickable = Boolean(onClick)

  return (
    <div
      role={role || (isClickable ? 'button' : undefined)}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={`rounded-2xl bg-surface border border-cream-200/90 p-4 transition-all duration-200 ${
        hover || isClickable
          ? 'hover:shadow-md hover:border-cream-300 hover:-translate-y-0.5 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange/70 focus-visible:ring-offset-2'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

