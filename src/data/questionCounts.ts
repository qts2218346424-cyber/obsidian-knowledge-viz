/**
 * 题库轻量级元数据与精确数量基线
 * 作用：供首页 Dashboard、导航栏或总览面板 0 网络开销即时获取真实题目量，
 * 彻底解耦对数 MB 静态题库（calculus, lilin6, meizale, jiuming, examPapers 等）的后台动态拉取，
 * 消除首页空闲时静默下载 ~1.7MB JS 导致的带宽抢占与主线程解析卡顿。
 */

export const STATIC_QUESTION_COUNTS = {
  cs: 156,
  math: 944,
  politics: 15,
  papers: 43,
  paperQuestions: 864,
} as const

// 内存中缓存的动态计数（当用户进入刷题页自然加载题库后可无感同步最新计数）
let dynamicCounts: { cs?: number; math?: number; politics?: number } | null = null

export function getQuestionCounts() {
  return {
    cs: dynamicCounts?.cs ?? STATIC_QUESTION_COUNTS.cs,
    math: dynamicCounts?.math ?? STATIC_QUESTION_COUNTS.math,
    politics: dynamicCounts?.politics ?? STATIC_QUESTION_COUNTS.politics,
    papers: STATIC_QUESTION_COUNTS.papers,
    paperQuestions: STATIC_QUESTION_COUNTS.paperQuestions,
  }
}

export function syncDynamicQuestionCounts(counts: { cs?: number; math?: number; politics?: number }) {
  dynamicCounts = { ...dynamicCounts, ...counts }
}

/**
 * 返回精确题库统计（不再主动触发跨路由巨型题库 chunk 的网络下载）
 */
export async function calibrateQuestionCounts(): Promise<{ cs: number; math: number; politics: number }> {
  return getQuestionCounts()
}
