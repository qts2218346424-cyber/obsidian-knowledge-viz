import type { MathCategory, MathSubject, CsSubject } from '../../types/subject'

export type AllSubject = CsSubject | MathSubject
export type ViewMode = 'start' | 'quiz' | 'results'
export type QuizMode = 'practice' | 'exam'
export type QuestionType = 'choice' | 'blank' | 'analysis'

export interface ActiveQuizQuestion {
  id: string
  domain: 'cs_408' | 'math'
  subject: AllSubject
  scope?: MathCategory[]
  chapter?: string
  type: QuestionType
  difficulty: '简单' | '中等' | '困难'
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
}

export interface SubjectInfo {
  key: AllSubject
  domain: 'cs_408' | 'math'
  emoji: string
  color: string
  bgColor: string
  categories?: MathCategory[]
}

export interface QuizResult {
  total: number
  correct: number
  wrong: number
  timeTaken: number
  subjectBreakdown: Record<string, { total: number; correct: number }>
  wrongQuestions: Array<{
    question: ActiveQuizQuestion
    userAnswer: string
    errorReason?: string
  }>
  summaryPath: string
}
