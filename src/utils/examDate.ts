/**
 * 考研初试时间与倒计时统一定义工具
 * 
 * 考研初试基准统一为：2026 年 12 月 26 日上午 08:30（政治理论科目开考）
 * 从 2026-11-08 起算，整整为 48 天（22 天 + 26 天 = 48 天）
 */

export const EXAM_TARGET_DATE_STR = '2026-12-26T08:30:00'
export const EXAM_TARGET_LABEL = '2026 考研初试 (12月26日)'
export const EXAM_DATE_DISPLAY = '12月26日'

/**
 * 获取距离考研初试的剩余整天数（向上取整）
 * @param now 可选当前时间戳，默认 Date.now()
 * @returns 剩余天数（最小为 0）
 */
export function getExamCountdownDays(now: number = Date.now()): number {
  const targetTime = new Date(EXAM_TARGET_DATE_STR).getTime()
  const diff = targetTime - now
  if (diff <= 0) return 0
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
