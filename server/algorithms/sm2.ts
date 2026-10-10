/**
 * 标准 SuperMemo-2 (SM-2) 间隔复习调度算法引擎
 * 结合艾宾浩斯遗忘曲线对考研 408 与 考研数学公式/概念进行科学周期调度
 */

export interface SM2ItemState {
  cardId: string
  repetition: number       // 连续成功回忆次数 (n)
  intervalDays: number     // 当前间隔天数 (I)
  easinessFactor: number   // 难度系数 (EF), 默认 2.5, 最小 1.3
  reviewCount: number      // 累计总复习次数
  lastReviewAt: string     // ISO 日期格式 YYYY-MM-DD
  nextReviewAt: string     // 下次复习截止日 YYYY-MM-DD
  lastGrade?: number       // 上次用户自评 (0-5)
}

/**
 * 质态评分标准：
 * 5: 完美回忆 (秒出答案，思路公式极其熟练)
 * 4: 稍有迟疑但答案与推导完全正确
 * 3: 正确回忆，但推导费力或做题时间偏长
 * 2: 作答错误，但看到正确答案时感到熟悉有印象
 * 1: 作答错误，看到答案仍觉得生疏模糊
 * 0: 完全遗忘或毫无思路
 */
export function calculateSM2(
  current: Partial<SM2ItemState>,
  grade: number,
  baseDate = new Date()
): SM2ItemState {
  const q = Math.max(0, Math.min(5, Math.round(grade)))
  const prevRepetition = current.repetition ?? 0
  const prevInterval = current.intervalDays ?? 1
  const prevEF = current.easinessFactor ?? 2.5
  const prevCount = current.reviewCount ?? 0

  // 1. 计算新的难度因子 EF (最小 1.3)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const delta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  let newEF = Number((prevEF + delta).toFixed(2))
  if (newEF < 1.3) newEF = 1.3

  // 2. 判定回忆效果并更新重复次数与间隔
  let newRepetition: number
  let newInterval: number

  if (q < 3) {
    // 回忆失败，重置周期
    newRepetition = 0
    newInterval = 1
  } else {
    // 回忆成功，按指数级拉长间隔
    if (prevRepetition === 0) {
      newInterval = 1
    } else if (prevRepetition === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(prevInterval * newEF)
    }
    newRepetition = prevRepetition + 1
  }

  // 3. 计算下次复习日期
  const todayStr = baseDate.toISOString().split('T')[0]
  const nextDate = new Date(baseDate.getTime() + newInterval * 24 * 60 * 60 * 1000)
  const nextDateStr = nextDate.toISOString().split('T')[0]

  return {
    cardId: current.cardId || `card-${Date.now()}`,
    repetition: newRepetition,
    intervalDays: newInterval,
    easinessFactor: newEF,
    reviewCount: prevCount + 1,
    lastReviewAt: todayStr,
    nextReviewAt: nextDateStr,
    lastGrade: q,
  }
}

/**
 * 预测当前知识点的记忆保留概率 (Memory Retention Rate, 0.0 ~ 1.0)
 * 基于负指数衰减模型: R = exp(- t / I)
 */
export function estimateRetentionRate(
  lastReviewAt: string,
  intervalDays: number,
  currentDate = new Date()
): number {
  if (!lastReviewAt || intervalDays <= 0) return 1.0
  const last = new Date(lastReviewAt).getTime()
  const now = currentDate.getTime()
  const elapsedDays = Math.max(0, (now - last) / (1000 * 60 * 60 * 24))
  // 达到 intervalDays 时记忆衰减至约 e^(-1) ≈ 36.8% ~ 50% 保护区
  const retention = Math.exp(-0.693 * (elapsedDays / intervalDays))
  return Number(Math.max(0, Math.min(1, retention)).toFixed(2))
}
