import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { database } from '../server/db/database.js'
import { calculateSM2, estimateRetentionRate } from '../server/algorithms/sm2.js'
import { MasteryEngine } from '../server/algorithms/mastery.js'
import { matchSyllabusNode, CORE_SYLLABUS } from '../server/data/syllabus.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const testDataDir = path.join(__dirname, '../data-test')

console.log('🚀 开始【分层混合持久化】与【核心考研算法】全链路验证...\n')

// 1. 测试数据库初始化
database.init(testDataDir)

// 2. 测试考点大纲知识库
console.log(`[1] 考点大纲库规模: 共有 ${CORE_SYLLABUS.length} 个核心三级考点节点`)
const matched1 = matchSyllabusNode('求极限使用泰勒公式展开式展开到x的三次方', '高等数学')
console.log(`- 文本匹配测试 1 (高数泰勒公式): 匹配到考点 [${matched1?.id}] -> ${matched1?.level3}`)
if (!matched1 || matched1.id !== 'MATH_CALC_LIMIT_01') {
  throw new Error('高数考点匹配不符合预期')
}

const matched2 = matchSyllabusNode('在五段流水线CPU中，当发生数据冒险时可以通过转发技术解决', '计算机组成原理')
console.log(`- 文本匹配测试 2 (计组流水线冒险): 匹配到考点 [${matched2?.id}] -> ${matched2?.level3}`)
if (!matched2 || matched2.id !== '408_CO_CPU_01') {
  throw new Error('408考点匹配不符合预期')
}

// 3. 测试 SM-2 艾宾浩斯间隔记忆算法
console.log('\n[2] SM-2 算法遗忘曲线推演测试:')
const initial = calculateSM2({ cardId: 'test-card-1' }, 2) // 评分 2 (错误)
console.log(`- 第 1 次复习 (评分 2 - 遗忘): 间隔 = ${initial.intervalDays} 天, EF = ${initial.easinessFactor}, 重复次数 = ${initial.repetition}`)
if (initial.intervalDays !== 1 || initial.repetition !== 0) {
  throw new Error('SM-2 遗忘重置逻辑异常')
}

const second = calculateSM2(initial, 4) // 评分 4 (正确)
console.log(`- 第 2 次复习 (评分 4 - 掌握): 间隔 = ${second.intervalDays} 天, EF = ${second.easinessFactor}, 重复次数 = ${second.repetition}`)
if (second.intervalDays !== 1 || second.repetition !== 1) {
  throw new Error('SM-2 首次成功间隔逻辑异常')
}

const third = calculateSM2(second, 5) // 评分 5 (完美熟练)
console.log(`- 第 3 次复习 (评分 5 - 熟练): 间隔 = ${third.intervalDays} 天, EF = ${third.easinessFactor}, 重复次数 = ${third.repetition}`)
if (third.intervalDays !== 6 || third.repetition !== 2) {
  throw new Error('SM-2 第二次成功间隔应拉长为 6 天')
}

const fourth = calculateSM2(third, 5)
console.log(`- 第 4 次复习 (评分 5 - 再次强化): 间隔 = ${fourth.intervalDays} 天, EF = ${fourth.easinessFactor}, 重复次数 = ${fourth.repetition}`)
if (fourth.intervalDays <= 6) {
  throw new Error('SM-2 指数级拉长间隔异常')
}

// 4. 测试保留率负指数衰减模型
const retentionNow = estimateRetentionRate(fourth.lastReviewAt, fourth.intervalDays)
console.log(`- 当天保留率: ${(retentionNow * 100).toFixed(1)}%`)
if (retentionNow < 0.9) throw new Error('当天保留率应接近 100%')

// 5. 测试持久层 SQLite 读写
console.log('\n[3] 数据库写入与事务测试:')
database.insertQuizRecord({
  id: 'test-quiz-1',
  mode: 'practice',
  totalQuestions: 2,
  correctCount: 1,
  wrongCount: 1,
  timeTaken: 120,
  score: 50,
  domain: 'cs_408',
  createdAt: new Date().toISOString(),
  detailsJson: JSON.stringify({ note: 'smoke test' })
})
const records = database.getQuizRecords(5)
console.log(`- 成功读取做题记录: ${records.length} 条，最新记录模式为: ${records[0]?.mode}`)
if (records.length === 0) throw new Error('做题记录写入读取失败')

// 6. 测试考点掌握度热力更新与树状聚合
console.log('\n[4] 考点掌握度热力聚合引擎测试:')
MasteryEngine.recordAttempt('408_DS_TREE_01', true)
MasteryEngine.recordAttempt('408_DS_TREE_01', true)
MasteryEngine.recordAttempt('408_DS_TREE_01', false)
MasteryEngine.recordAttempt('MATH_CALC_LIMIT_01', true)
MasteryEngine.recordAttempt('MATH_CALC_LIMIT_01', true)

const heatmaps = MasteryEngine.getHierarchyHeatmap()
console.log(`- 成功生成热力树: 包含 ${heatmaps.length} 个领域 (408 与 数学)`)
for (const h of heatmaps) {
  console.log(`  * ${h.domain}: 共有 ${h.totalPoints} 个考点, 绿色掌握: ${h.masteredCount}, 黄色进行中: ${h.inProgressCount}, 红色薄弱: ${h.weakCount}`)
}

// 清理测试目录
try {
  fs.rmSync(testDataDir, { recursive: true, force: true })
} catch {}

console.log('\n🎉 所有持久化、SM-2 算法与考点热力拓扑测试全部通过！')
