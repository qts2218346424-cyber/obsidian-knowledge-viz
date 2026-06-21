// 考研英语核心词库 - 合并入口
// 总计 2000 词，40 个 Unit，含词根词缀和近义词标注

export type { VocabEntry } from './vocab-part1'

import { VOCAB_PART1 } from './vocab-part1'
import { VOCAB_PART2 } from './vocab-part2'
import { VOCAB_PART3 } from './vocab-part3'
import { VOCAB_PART4 } from './vocab-part4'

export const VOCAB_POOL = [
  ...VOCAB_PART1,
  ...VOCAB_PART2,
  ...VOCAB_PART3,
  ...VOCAB_PART4,
]

// Pre-computed lookup maps for performance
export const VOCAB_MAP = new Map(VOCAB_POOL.map(w => [w.word.toLowerCase(), w]))

export const VOCAB_UNITS = [...new Set(VOCAB_POOL.map(w => w.unit))].sort((a, b) => a - b)

export const VOCAB_BY_UNIT = VOCAB_UNITS.reduce((acc, unit) => {
  acc[unit] = VOCAB_POOL.filter(w => w.unit === unit)
  return acc
}, {} as Record<number, typeof VOCAB_POOL>)

// Word roots index for relationship graph
export const VOCAB_ROOTS = (() => {
  const rootMap = new Map<string, { meaning: string; words: typeof VOCAB_POOL }>()
  for (const entry of VOCAB_POOL) {
    if (!entry.roots) continue
    // Extract root segments like "dict(说)" or "pre-(前)"
    const matches = entry.roots.match(/([a-zA-Z-]+)\(([^)]+)\)/g)
    if (!matches) continue
    for (const m of matches) {
      const rm = m.match(/([a-zA-Z-]+)\(([^)]+)\)/)
      if (!rm) continue
      const rootKey = rm[1].replace(/-$/, '')
      const meaning = rm[2]
      if (!rootMap.has(rootKey)) {
        rootMap.set(rootKey, { meaning, words: [] })
      }
      rootMap.get(rootKey)!.words.push(entry)
    }
  }
  return rootMap
})()
