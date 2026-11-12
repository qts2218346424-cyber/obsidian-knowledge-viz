import type { UnifiedQuestion, SubjectDomain, MathCategory } from '../../types/subject'

export type PaperCategory = '数一' | '数二' | '408' | '英语一'
export type PaperType = 'real' | 'mock'
export type PaperFilterSection = 'all' | 'choice' | 'analysis' | 'blank'

export interface ExamPaperQuestion extends UnifiedQuestion {
  /** 试卷真实题号：如 1, 2, ..., 10, 11, ..., 22 */
  paperQuestionNumber: number
  /** 该题卷面分值（如选择题 5分，408选择题 2分，大题 10~15分） */
  score: number
  /** 所属试卷部分名称，如 "一、单项选择题" | "二、填空题" | "三、解答题" */
  sectionName: string
}

export interface ExamPaper {
  id: string
  year: number
  domain: SubjectDomain
  category: PaperCategory
  title: string
  subtitle?: string
  /** 试卷性质：历年真题或模拟冲刺卷 */
  paperType?: PaperType
  /** 卡片左上角徽标自定义文案（如 "2026 冲刺模拟"） */
  badgeLabel?: string
  totalScore: number
  durationMinutes: number
  description: string
  /** 试卷内包含的真题序列 */
  questions: ExamPaperQuestion[]
}
