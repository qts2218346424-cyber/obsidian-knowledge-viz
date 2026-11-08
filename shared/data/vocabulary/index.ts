export type { VocabEntry } from './vocab-part1'
import { VOCAB_PART1 } from './vocab-part1'
import { VOCAB_PART2 } from './vocab-part2'
import { VOCAB_PART3 } from './vocab-part3'
import { VOCAB_PART4 } from './vocab-part4'

export { VOCAB_PART1, VOCAB_PART2, VOCAB_PART3, VOCAB_PART4 }

export const VOCAB_POOL = [
  ...VOCAB_PART1,
  ...VOCAB_PART2,
  ...VOCAB_PART3,
  ...VOCAB_PART4,
]
