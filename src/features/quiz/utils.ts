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

export function formatTime(seconds: number, forceHours = false): string {
  const safeSec = Math.max(0, Math.floor(seconds || 0))
  const h = Math.floor(safeSec / 3600)
  const m = Math.floor((safeSec % 3600) / 60)
  const s = safeSec % 60
  if (h > 0 || forceHours) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function playExamAlertSound(type: 'warning' | 'timeup' = 'warning') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    if (type === 'timeup') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 1.2)

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.25)
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.25)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.6)
      osc2.start(ctx.currentTime + 0.25)
      osc2.stop(ctx.currentTime + 1.6)
    } else {
      osc.frequency.setValueAtTime(659.25, ctx.currentTime)
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.45)
    }
  } catch {}
}
