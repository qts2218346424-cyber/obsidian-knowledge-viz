export type { QuizQuestion } from './data-structures'

export { dataStructureQuestions } from './data-structures'
export { computerOrganizationQuestions } from './computer-organization'
export { operatingSystemQuestions } from './operating-systems'
export { computerNetworkQuestions } from './computer-networks'

import { dataStructureQuestions } from './data-structures'
import { computerOrganizationQuestions } from './computer-organization'
import { operatingSystemQuestions } from './operating-systems'
import { computerNetworkQuestions } from './computer-networks'

/** 408 考研全部题库，包含四门科目的所有题目 */
export const QUESTION_BANK = [
  ...dataStructureQuestions,
  ...computerOrganizationQuestions,
  ...operatingSystemQuestions,
  ...computerNetworkQuestions,
] as const

/** 按科目获取题目 */
export function getQuestionsBySubject(subject: '数据结构' | '计算机组成原理' | '操作系统' | '计算机网络') {
  return QUESTION_BANK.filter((q) => q.subject === subject)
}

/** 按难度获取题目 */
export function getQuestionsByDifficulty(difficulty: '简单' | '中等' | '困难') {
  return QUESTION_BANK.filter((q) => q.difficulty === difficulty)
}

/** 按标签获取题目 */
export function getQuestionsByTag(tag: string) {
  return QUESTION_BANK.filter((q) => q.tags.includes(tag))
}

/** 获取随机 N 道题目 */
export function getRandomQuestions(count: number, subject?: '数据结构' | '计算机组成原理' | '操作系统' | '计算机网络') {
  const pool = subject ? getQuestionsBySubject(subject) : [...QUESTION_BANK]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
