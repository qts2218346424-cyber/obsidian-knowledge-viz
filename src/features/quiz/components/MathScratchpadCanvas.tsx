import { useRef } from 'react'

export const SCRATCHPAD_MATH_SYMBOLS = [
  { label: '∫ dx', code: '\\int_{a}^{b} f(x)\\,dx' },
  { label: 'lim', code: '\\lim_{x \\to 0}' },
  { label: '∑', code: '\\sum_{n=1}^{\\infty}' },
  { label: 'd/dx', code: '\\frac{d}{dx}' },
  { label: '∂/∂x', code: '\\frac{\\partial f}{\\partial x}' },
  { label: '√x', code: '\\sqrt{x}' },
  { label: 'λ', code: '\\lambda' },
  { label: 'A⁻¹', code: 'A^{-1}' },
  { label: '|A|', code: '|A|' },
  { label: 'α', code: '\\alpha' },
  { label: 'β', code: '\\beta' },
  { label: 'θ', code: '\\theta' },
  { label: '≈', code: '\\approx' },
  { label: '≠', code: '\\neq' },
  { label: '≤', code: '\\le' },
  { label: '≥', code: '\\ge' },
  { label: '∞', code: '\\infty' },
  { label: 'eˣ', code: 'e^{x}' },
]

interface MathScratchpadCanvasProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  className?: string
  rows?: number
  placeholder?: string
}

export function MathScratchpadCanvas({
  value,
  onChange,
  onClear,
  className = '',
  rows = 9,
  placeholder = '在此随手推演公式、草拟计算步骤，无需切换草稿本...',
}: MathScratchpadCanvasProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertSymbol = (code: string) => {
    const el = textareaRef.current
    if (!el) {
      onChange(value + ` ${code} `)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const nextText = value.substring(0, start) + ` ${code} ` + value.substring(end)
    onChange(nextText)
    setTimeout(() => {
      el.focus()
      const newCursor = start + code.length + 2
      el.setSelectionRange(newCursor, newCursor)
    }, 10)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          LaTeX 数学符号快捷输入（点击直接插入）
        </span>
      </div>

      {/* Math Symbol Quick Insert Bar */}
      <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
        {SCRATCHPAD_MATH_SYMBOLS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => insertSymbol(s.code)}
            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium transition-colors shadow-xs cursor-pointer"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Scratchpad Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed placeholder:text-slate-400"
      />

      <div className="flex items-center justify-between text-2xs text-slate-400">
        <span>草稿在本次练习中自动保存</span>
        <button
          type="button"
          onClick={onClear}
          className="text-rose-500 hover:underline cursor-pointer"
        >
          清空本题草稿
        </button>
      </div>
    </div>
  )
}

export default MathScratchpadCanvas
