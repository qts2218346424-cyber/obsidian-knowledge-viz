import type { DetailedErrorQuestion } from '../../../services/api'
import type { ActiveQuizQuestion } from './questionTopics'

export function convertErrorToActiveQuestion(err: DetailedErrorQuestion): ActiveQuizQuestion {
  const hasOptions = err.options && Object.keys(err.options).length > 0
  return {
    id: err.id,
    domain: (err.domain || (err.subject?.includes('数学') ? 'math' : 'cs_408')) as any,
    subject: (err.subject || '错题') as any,
    chapter: err.chapter || '错题攻克专题',
    type: (hasOptions ? 'choice' : 'blank') as 'choice' | 'blank',
    difficulty: (err.difficulty as any) || '中等',
    question: err.question,
    options: hasOptions ? (err.options as any) : undefined,
    answer: err.correctAnswer,
    explanation: err.explanation,
    tags: ['错题重练', err.errorType || '概念不清', err.subject],
    paperTitle: '📕 错题攻克专属重练卷',
    sourceKind: 'custom',
    score: 5,
  }
}
