interface WarmButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  type?: 'button' | 'submit' | 'reset'
  title?: string
}

const variants = {
  primary:
    'bg-accent-orange text-white hover:bg-blue-600 active:bg-blue-700 shadow-sm shadow-accent-orange/20 hover:shadow-md hover:shadow-accent-orange/30',
  secondary:
    'bg-cream-200 text-warm-700 hover:bg-cream-300 active:bg-warm-200 border border-warm-200/60',
  ghost:
    'bg-transparent text-warm-600 hover:bg-cream-100 active:bg-cream-200',
  outline:
    'bg-white/80 text-warm-700 border border-warm-200 hover:bg-white hover:border-accent-orange/60 hover:text-accent-orange shadow-2xs',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-sm shadow-rose-500/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

export default function WarmButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style,
  type = 'button',
  title,
}: WarmButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={style}
      title={title}
      className={`inline-flex items-center justify-center rounded-xl font-medium cursor-pointer transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2 ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none active:scale-100' : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}

