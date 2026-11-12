import { useState, useEffect, useRef, useCallback } from 'react'
import type { ActiveQuizQuestion } from '@/features/quiz/types'

interface UseQuizSessionOptions {
  questions: ActiveQuizQuestion[]
  onFinish?: () => void
}

export function useQuizSession({ questions, onFinish }: UseQuizSessionOptions) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [errorReasons, setErrorReasons] = useState<Record<string, string>>({})
  const [scratchpads, setScratchpads] = useState<Record<string, string>>({})
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 计时器控制
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerRunning])

  const startSession = useCallback(() => {
    setCurrentIndex(0)
    setAnswers({})
    setBookmarkedIds(new Set())
    setErrorReasons({})
    setScratchpads({})
    setElapsedTime(0)
    setIsTimerRunning(true)
  }, [])

  const selectAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }, [])

  const toggleBookmark = useCallback((questionId: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }, [])

  const setScratchpad = useCallback((questionId: string, text: string) => {
    setScratchpads((prev) => ({ ...prev, [questionId]: text }))
  }, [])

  const clearScratchpad = useCallback((questionId: string) => {
    setScratchpads((prev) => ({ ...prev, [questionId]: '' }))
  }, [])

  const setErrorReason = useCallback((questionId: string, reason: string) => {
    setErrorReasons((prev) => ({ ...prev, [questionId]: reason }))
  }, [])

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      onFinish?.()
    }
  }, [currentIndex, questions.length, onFinish])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex])

  const jumpTo = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index)
    }
  }, [questions.length])

  // 统计指标计算
  const answeredCount = Object.keys(answers).length
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  return {
    currentIndex,
    currentQuestion: questions[currentIndex],
    answers,
    bookmarkedIds,
    errorReasons,
    scratchpads,
    elapsedTime,
    isTimerRunning,
    answeredCount,
    progressPct,
    startSession,
    selectAnswer,
    toggleBookmark,
    setScratchpad,
    clearScratchpad,
    setErrorReason,
    goToNext,
    goToPrev,
    jumpTo,
    pauseTimer: () => setIsTimerRunning(false),
    resumeTimer: () => setIsTimerRunning(true),
  }
}

export default useQuizSession
