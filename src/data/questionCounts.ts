/**
 * 题库轻量级元数据与数量统计
 * 作用：供首页 Dashboard、导航栏或总览面板快速获取题目量，
 * 彻底解耦对几百 KB 静态题库（calculus, lilin6, meizale, jiuming 等）的同步打包依赖，
 * 避免首屏主包过度臃肿。
 */

export const STATIC_QUESTION_COUNTS = {
  cs: 156,
  math: 465,
  politics: 15,
} as const

// 内存中缓存的动态计数（若后续异步校准完成）
let dynamicCounts: { cs?: number; math?: number; politics?: number } | null = null

export function getQuestionCounts() {
  return {
    cs: dynamicCounts?.cs ?? STATIC_QUESTION_COUNTS.cs,
    math: dynamicCounts?.math ?? STATIC_QUESTION_COUNTS.math,
    politics: dynamicCounts?.politics ?? STATIC_QUESTION_COUNTS.politics,
  }
}

/**
 * 在浏览器空闲（idle）或后台静默拉取精确计数并校准
 */
export async function calibrateQuestionCounts(): Promise<{ cs: number; math: number; politics: number }> {
  if (dynamicCounts && dynamicCounts.cs && dynamicCounts.math && dynamicCounts.politics) {
    return getQuestionCounts()
  }

  try {
    const [qModule, mathModule, politicsModule] = await Promise.all([
      import('./questions'),
      import('./questions/math'),
      import('./politicsQuestions'),
    ])

    dynamicCounts = {
      cs: qModule.QUESTION_BANK?.length ?? STATIC_QUESTION_COUNTS.cs,
      math: mathModule.MATH_QUESTION_BANK?.length ?? STATIC_QUESTION_COUNTS.math,
      politics: politicsModule.XIAO_1000_POLITICS_QUESTIONS?.length ?? STATIC_QUESTION_COUNTS.politics,
    }
  } catch (err) {
    console.debug('[QuestionCounts] 静默校准跳过，使用内置静态基线')
  }

  return getQuestionCounts()
}
