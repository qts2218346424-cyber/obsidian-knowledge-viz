interface WarmCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function WarmCard({ children, className = '', hover = false, onClick }: WarmCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-surface border border-cream-200 p-4 ${
        hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
