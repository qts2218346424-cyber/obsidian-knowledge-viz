import type { QuizQuestion } from '../../data/questions'
import type { MathSubject, UnifiedQuestion } from '../../types/subject'
import type { ActiveQuizQuestion } from './types'

export function convertCsQuestion(q: QuizQuestion): ActiveQuizQuestion {
  return {
    id: q.id,
    domain: 'cs_408',
    subject: q.subject,
    type: 'choice',
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    tags: q.tags,
  }
}

export function convertMathQuestion(q: UnifiedQuestion): ActiveQuizQuestion {
  const optArr = q.options || []
  const cleanOption = (text?: string) => text ? text.replace(/^[A-D][.、\s]+/, '').trim() : ''

  let optionsObj: { A: string; B: string; C: string; D: string } | undefined = undefined
  if (optArr.length >= 2) {
    optionsObj = {
      A: cleanOption(optArr[0]),
      B: cleanOption(optArr[1]),
      C: cleanOption(optArr[2] || ''),
      D: cleanOption(optArr[3] || ''),
    }
  }

  return {
    id: q.id,
    domain: 'math',
    subject: q.subject as MathSubject,
    scope: q.scope,
    chapter: q.chapter,
    type: q.type || (optionsObj ? 'choice' : 'blank'),
    difficulty: q.difficulty,
    question: q.question,
    options: optionsObj,
    answer: q.correctAnswer || 'A',
    explanation: q.explanation,
    steps: q.steps,
    keyPoints: q.keyPoints,
    tags: q.tags,
  }
}

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
