/** 学习中心共享工具：图表配色与题干排版 */

export const colorPalette = [
  '#f97316', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6',
  '#06b6d4', '#f59e0b', '#6366f1', '#14b8a6', '#84cc16',
]

/** 将混排在一行内的 A/B/C/D 选项拆分为独立行，便于 Markdown 渲染 */
export function formatQuestionContent(raw?: string): string {
  if (!raw) return ''
  let text = raw.trim()
  // 1. 若题干冒号后面紧随 A. 或 (A) 选项，插入双换行
  text = text.replace(/([：:])\s*([A-D][.、\s]|\([A-D]\))/g, '$1\n\n$2')
  // 2. 将混排在一行内的 A. B. C. D. 选项拆分为独立换行行
  text = text.replace(/([^\n])\s+([A-D][.、]|\([A-D]\))\s*/g, '$1\n\n$2 ')
  return text
}
