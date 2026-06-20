interface WarmButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

const variants = {
  primary: 'bg-accent-orange text-white hover:bg-accent-peach shadow-sm',
  secondary: 'bg-cream-200 text-warm-700 hover:bg-cream-300',
  ghost: 'bg-transparent text-warm-500 hover:bg-cream-100',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function WarmButton({
  children, onClick, variant = 'primary', size = 'md', disabled = false, className = '',
}: WarmButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-medium transition-all duration-200 ${variants[variant]} ${sizes[size]} ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}
