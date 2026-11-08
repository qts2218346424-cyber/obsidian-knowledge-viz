import { useState, useEffect } from 'react'

/**
 * 考研初试时间与倒计时自动化计算引擎
 * 
 * 官方规律：全国硕士研究生招生考试（初试）定于每年 12 月倒数第二个周六上午 08:30 开考。
 * 系统具备：
 * 1. 自动智能推算：若当年考研未过，以当年 12 月倒数第二个周六为基准；若已过，自动顺延至下一年度！
 * 2. 自然日精准跨天：基于用户本地自然日计算剩余天数，每日 00:00 自动递减 1 天，杜绝白天因小时变化跳天。
 * 3. 动态响应式 Hook：提供 useExamCountdown()，内置分钟级跨天检测与页面唤醒（visibilitychange / focus）即时计算，即使长期挂在手机后台，唤醒时自动呈现最新天数！
 */

export interface ExamCountdownInfo {
  targetDate: Date
  targetDateStr: string
  targetLabel: string
  displayDate: string
  days: number
  hours: number
  minutes: number
  isToday: boolean
  isPassed: boolean
}

/**
 * 计算指定年份 12 月倒数第二个周六的考研初试时间（上午 08:30）
 */
export function getStandardExamDate(year: number): Date {
  const saturdays: number[] = []
  
  for (let day = 31; day >= 1; day--) {
    const current = new Date(year, 11, day)
    if (current.getDay() === 6) { // 周六
      saturdays.push(day)
    }
  }

  // saturdays[0] 是倒数第一个周六，saturdays[1] 是倒数第二个周六
  const examDay = saturdays.length >= 2 ? saturdays[1] : (saturdays[0] || 20)
  return new Date(year, 11, examDay, 8, 30, 0, 0)
}

/**
 * 获取当前适用的目标考研初试时间
 * 支持 localStorage 自定义 target_exam_date
 */
export function resolveTargetExam(now: Date = new Date()): { targetDate: Date; targetLabel: string; displayDate: string } {
  // 1. 尝试从用户自定义读取
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const customDateStr = localStorage.getItem('coreforge_target_exam_date')
      if (customDateStr) {
        const customDate = new Date(customDateStr)
        if (!isNaN(customDate.getTime())) {
          const year = customDate.getFullYear()
          const month = customDate.getMonth() + 1
          const day = customDate.getDate()
          return {
            targetDate: customDate,
            targetLabel: `${year} 考研目标 (${month}月${day}日)`,
            displayDate: `${month}月${day}日`
          }
        }
      }
    }
  } catch {
    // 忽略 localStorage 访问限制异常
  }

  // 2. 智能推算考研初试：
  const currentYear = now.getFullYear()
  let examDate = getStandardExamDate(currentYear)

  // 如果今年考研已经完全结束（超过当天的 24:00），自动推算到下一年
  const endOfExam = new Date(examDate.getTime() + 2 * 24 * 60 * 60 * 1000) // 考研周末结束
  if (now.getTime() > endOfExam.getTime()) {
    examDate = getStandardExamDate(currentYear + 1)
  }

  const targetYear = examDate.getFullYear()
  const month = examDate.getMonth() + 1
  const day = examDate.getDate()

  return {
    targetDate: examDate,
    targetLabel: `${targetYear} 考研初试 (${month}月${day}日)`,
    displayDate: `${month}月${day}日`
  }
}

/**
 * 获取考研倒计时全量状态与天数（自然日精准）
 */
export function getExamCountdownInfo(nowDate: Date = new Date()): ExamCountdownInfo {
  const { targetDate, targetLabel, displayDate } = resolveTargetExam(nowDate)
  
  // 自然日计算：将当前时间和目标时间均归一化为当地 00:00:00
  const todayMidnight = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime()
  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime()
  
  const diffDays = Math.round((targetMidnight - todayMidnight) / (1000 * 60 * 60 * 24))
  
  // 精确毫秒差（计算剩余小时和分钟）
  const exactDiff = targetDate.getTime() - nowDate.getTime()
  const isPassed = exactDiff < 0 && diffDays < 0
  const isToday = diffDays === 0

  const safeDiff = Math.max(0, exactDiff)
  const hours = Math.floor((safeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((safeDiff % (1000 * 60 * 60)) / (1000 * 60))

  return {
    targetDate,
    targetDateStr: targetDate.toISOString(),
    targetLabel,
    displayDate,
    days: Math.max(0, diffDays),
    hours,
    minutes,
    isToday,
    isPassed
  }
}

/**
 * 传统单函数导出（与现有代码完全兼容，返回自然日剩余天数）
 */
export function getExamCountdownDays(now: number = Date.now()): number {
  return getExamCountdownInfo(new Date(now)).days
}

// 兼容现有静态常量
export const EXAM_TARGET_DATE_STR = '2026-12-19T08:30:00'
export const EXAM_TARGET_LABEL = '2026 考研初试 (12月19日)'
export const EXAM_DATE_DISPLAY = '12月19日'

/**
 * 全局响应式考研倒计时 Hook
 * 每天零点、页面唤醒、手机锁屏解锁、切回应用时自动刷新最新天数！
 */
export function useExamCountdown(): ExamCountdownInfo {
  const [info, setInfo] = useState<ExamCountdownInfo>(() => getExamCountdownInfo())

  useEffect(() => {
    const update = () => {
      setInfo(getExamCountdownInfo())
    }

    // 1. 每 30 秒轮询检测（超轻量，保证跨过零点时瞬间自动递减）
    const timer = window.setInterval(update, 30 * 1000)

    // 2. 页面可见性恢复（手机从后台切回、锁屏解锁时）即刻计算
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        update()
      }
    }

    // 3. 窗口聚焦与本地存储变动即时响应
    window.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', update)
    window.addEventListener('storage', update)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', update)
      window.removeEventListener('storage', update)
    }
  }, [])

  return info
}
