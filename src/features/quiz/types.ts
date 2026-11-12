import type { ResourceDomain } from '../../services/api'
import type { MathCategory, MathSubject, CsSubject } from '../../types/subject'

export type AllSubject = CsSubject | MathSubject | string
export type ViewMode = 'start' | 'quiz' | 'results'
export type QuizMode = 'practice' | 'exam'
export type QuestionType = 'choice' | 'blank' | 'analysis'

export interface ActiveQuizQuestion {
  id: string
  domain: ResourceDomain
  subject: AllSubject
  scope?: MathCategory[]
  chapter?: string
  type: QuestionType
  difficulty: '简单' | '中等' | '困难' | '基础' | '提高'
  question: string
  options?: { A: string; B: string; C: string; D: string }
  answer: string
  explanation: string
  steps?: string[]
  keyPoints?: string[]
  tags: string[]
  paperTitle?: string
  paperQuestionNumber?: number
  score?: number
  sectionName?: string
  sourceKind?: 'builtin' | 'real' | 'mock' | 'custom'
  isCustom?: boolean
}

export interface SubjectInfo {
  key: AllSubject
  domain: ResourceDomain
  emoji: string
  color: string
  bgColor: string
  categories?: MathCategory[]
}

export interface QuizResult {
  total: number
  answered?: number
  unanswered?: number
  correct: number
  wrong: number
  timeTaken: number
  mode?: QuizMode
  createdAt?: string
  subjectBreakdown: Record<
    string,
    { total: number; correct: number; answered?: number; wrong?: number; unanswered?: number }
  >
  wrongQuestions: Array<{
    question: ActiveQuizQuestion
    userAnswer: string
    errorReason?: string
  }>
  summaryPath: string
}
