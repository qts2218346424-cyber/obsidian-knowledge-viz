import type { ExamPaper, ExamPaperQuestion, PaperCategory, PaperFilterSection } from './types'
import { MATH_EXAM_PAPERS } from './mathPapers'
import { CS408_EXAM_PAPERS } from './cs408Papers'

export * from './types'
export { MATH_EXAM_PAPERS } from './mathPapers'
export { CS408_EXAM_PAPERS } from './cs408Papers'

/**
 * 历年考研全部完整真实试卷汇聚库
 * 默认按年份从新到旧倒序排列
 */
export const ALL_EXAM_PAPERS: ExamPaper[] = [
  ...MATH_EXAM_PAPERS,
  ...CS408_EXAM_PAPERS,
].sort((a, b) => b.year - a.year)

/**
 * 根据试卷 ID 获取指定试卷
 */
export function getExamPaperById(paperId: string): ExamPaper | undefined {
  return ALL_EXAM_PAPERS.find(p => p.id === paperId)
}

/**
 * 获取试卷库中所有覆盖的年份列表（去重且降序）
 */
export function getAvailablePaperYears(): number[] {
  const years = Array.from(new Set(ALL_EXAM_PAPERS.map(p => p.year)))
  return years.sort((a, b) => b - a)
}

/**
 * 按试卷部分/题型细分抽取题目
 * - 'all': 整卷全部题目（全卷模考模式）
 * - 'choice': 仅单选题（客观选择题专练）
 * - 'blank': 仅填空题
 * - 'analysis': 仅解答题 / 综合大题（大题攻坚模式）
 */
export function filterPaperQuestions(
  paper: ExamPaper,
  section: PaperFilterSection = 'all'
): ExamPaperQuestion[] {
  if (section === 'all') {
    return paper.questions
  }
  if (section === 'choice') {
    return paper.questions.filter(q => q.type === 'choice')
  }
  if (section === 'blank') {
    return paper.questions.filter(q => q.type === 'blank')
  }
  if (section === 'analysis') {
    return paper.questions.filter(q => q.type === 'analysis')
  }
  return paper.questions
}

/**
 * 获取试卷题型与分值统计
 */
export function getPaperStats(paper: ExamPaper) {
  const choiceQuestions = paper.questions.filter(q => q.type === 'choice')
  const blankQuestions = paper.questions.filter(q => q.type === 'blank')
  const analysisQuestions = paper.questions.filter(q => q.type === 'analysis')

  const choiceScore = choiceQuestions.reduce((sum, q) => sum + (q.score || 0), 0)
  const blankScore = blankQuestions.reduce((sum, q) => sum + (q.score || 0), 0)
  const analysisScore = analysisQuestions.reduce((sum, q) => sum + (q.score || 0), 0)

  return {
    totalQuestions: paper.questions.length,
    choiceCount: choiceQuestions.length,
    choiceScore,
    blankCount: blankQuestions.length,
    blankScore,
    analysisCount: analysisQuestions.length,
    analysisScore,
  }
}
