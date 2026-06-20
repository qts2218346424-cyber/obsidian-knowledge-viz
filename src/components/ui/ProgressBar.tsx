interface ProgressBarProps {
  value: number
  max: number
  color?: string
  height?: number
  showLabel?: boolean
  label?: string
}

export default function ProgressBar({
  value, max, color = 'bg-accent-sage', height = 8, showLabel = false, label,
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-warm-500">{label || `${value} / ${max}`}</span>
          <span className="text-xs text-warm-400">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className="w-full rounded-full bg-cream-200 overflow-hidden"
        style={{ height }}
      >
        <div
          className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
