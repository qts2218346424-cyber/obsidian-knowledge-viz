/**
 * 题库入库与返回前 LaTeX 数学公式定界符规整工具
 * 统一将 \[...\] -> $$...$$，\(...\) -> $...$，并清理行内公式内侧空格
 */
export function normalizeImportedMathText(raw?: unknown): string {
  if (typeof raw !== 'string') return raw == null ? '' : String(raw)
  return raw
    .replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `\n$$\n${String(inner).trim()}\n$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${String(inner).trim().replace(/\n+/g, ' ')}$`)
    .replace(/(?<!\\)(?<!\$)\$(?!\$)([^\$\n]+?)(?<!\\)(?<!\$)\$(?!\$)/g, (full, inner) => {
      const s = String(inner)
      const t = s.trim()
      if (!t || s === t) return full
      if (/[\\^_{}=<>±×÷∑∫∏√∞∂∇]/.test(t) || /^[a-zA-Z0-9\s,()'+\-*/]+$/.test(t)) return `$${t}$`
      return full
    })
    .trim()
}

export function normalizeQuestionMathFields<T extends Record<string, any>>(q: T): T {
  if (!q || typeof q !== 'object') return q
  const next: any = { ...q }
  if (typeof next.question === 'string') next.question = normalizeImportedMathText(next.question)
  if (typeof next.explanation === 'string') next.explanation = normalizeImportedMathText(next.explanation)
  if (typeof next.answer === 'string') next.answer = normalizeImportedMathText(next.answer)
  if (next.options && typeof next.options === 'object' && !Array.isArray(next.options)) {
    const opts: Record<string, string> = {}
    for (const [k, v] of Object.entries(next.options)) {
      opts[k] = normalizeImportedMathText(v)
    }
    next.options = opts
  }
  if (Array.isArray(next.steps)) {
    next.steps = next.steps.map((st: any) => normalizeImportedMathText(st))
  }
  return next
}
