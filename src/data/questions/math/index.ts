import { calculusQuestions } from './calculus'
import { linearAlgebraQuestions } from './linear-algebra'
import { probabilityQuestions } from './probability'
import type { MathCategory, MathSubject, UnifiedQuestion } from '../../../types/subject'

export { calculusQuestions } from './calculus'
export { linearAlgebraQuestions } from './linear-algebra'
export { probabilityQuestions } from './probability'

/**
 * 考研数学全题库（高等数学 + 线性代数 + 概率论与数理统计）
 */
export const MATH_QUESTION_BANK: UnifiedQuestion[] = [
  ...calculusQuestions,
  ...linearAlgebraQuestions,
  ...probabilityQuestions,
]

/**
 * 按数学子科目筛选题目
 */
export function getMathQuestionsBySubject(subject: MathSubject): UnifiedQuestion[] {
  return MATH_QUESTION_BANK.filter(q => q.subject === subject)
}

/**
 * 按考研数学卷种筛选（数一/数二/数三）
 */
export function getMathQuestionsByCategory(category: MathCategory): UnifiedQuestion[] {
  return MATH_QUESTION_BANK.filter(q => !q.scope || q.scope.includes(category))
}

/**
 * 随机抽取数学试题
 */
export function getRandomMathQuestions(
  count: number,
  category?: MathCategory,
  subject?: MathSubject
): UnifiedQuestion[] {
  let pool = [...MATH_QUESTION_BANK]
  if (category) {
    pool = pool.filter(q => !q.scope || q.scope.includes(category))
  }
  if (subject) {
    pool = pool.filter(q => q.subject === subject)
  }
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
