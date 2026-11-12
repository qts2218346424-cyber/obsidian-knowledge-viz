import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { database } from '../server/db/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const testDataDir = path.join(__dirname, '../data-test-error-notebook')

async function runErrorNotebookTests() {
  console.log('🧪 开始测试新一代错题系统底层核心能力...')

  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true })
  }
  database.init(testDataDir)

  const testId1 = `test-err-1-${Date.now()}`
  const testId2 = `test-err-2-${Date.now()}`
  const today = new Date().toISOString().split('T')[0]

  // 1. 测试插入错题 & SM-2 关联
  database.upsertErrorQuestion({
    id: testId1,
    userId: 'test_user',
    domain: 'math',
    subject: '高等数学',
    chapter: '一元函数微分学',
    syllabusId: 'syl_deriv_01',
    question: '求极限 $\\lim_{x \\to 0} \\frac{\\sin x - x}{x^3}$ 的值。',
    optionsJson: JSON.stringify({ A: '1/6', B: '-1/6', C: '0', D: '不存在' }),
    userAnswer: 'A',
    correctAnswer: 'B',
    explanation: '利用泰勒展开式 $\\sin x = x - \\frac{x^3}{6} + o(x^3)$，代入分子得 $-\\frac{x^3}{6}$，与分母相除得 $-1/6$。',
    errorType: '公式记错',
    difficulty: '中等',
    sourceNote: '03-真题错题归因/数学/一元函数微分学.md',
    status: 'active',
    notes: '泰勒展开偶数项正负号记反了，导致符号判断错误。',
    createdAt: today,
    updatedAt: today,
  })
  database.upsertSM2Flashcard({
    cardId: testId1,
    userId: 'test_user',
    title: '错题复盘 · 高等数学',
    subject: '高等数学',
    syllabusId: 'syl_deriv_01',
    repetition: 0,
    intervalDays: 1,
    easinessFactor: 2.5,
    reviewCount: 1,
    lastReviewAt: today,
    nextReviewAt: today,
    lastGrade: 2,
    historyJson: JSON.stringify([{ date: today, grade: 2 }]),
  })

  database.upsertErrorQuestion({
    id: testId2,
    userId: 'test_user',
    domain: 'cs_408',
    subject: '数据结构',
    chapter: '树与二叉树',
    syllabusId: 'syl_ds_tree',
    question: '具有 100 个结点的完全二叉树的深度为多少？',
    optionsJson: JSON.stringify({ A: '6', B: '7', C: '8', D: '9' }),
    userAnswer: 'A',
    correctAnswer: 'B',
    explanation: '$\\lfloor \\log_2 100 \\rfloor + 1 = 6 + 1 = 7$。',
    errorType: '计算失误',
    difficulty: '简单',
    sourceNote: '',
    status: 'active',
    notes: '',
    createdAt: today,
    updatedAt: today,
  })
  console.log('✅ 1. 错题插入与 SM-2 关联测试通过')

  // 2. 测试多维查询（科目 + 错因 + 搜索 + SM-2 联表字段）
  const list = database.getErrorQuestions({
    userId: 'test_user',
    subject: '高等数学',
    errorType: '公式记错',
    search: '泰勒',
  })
  const found = list.find(q => q.id === testId1)
  if (!found) {
    throw new Error('未在数据库中通过多维筛选查询到插入的测试错题！')
  }
  if (found.userAnswer !== 'A' || found.correctAnswer !== 'B' || found.sm2?.reviewCount !== 1) {
    throw new Error('错题字段或 SM-2 联表数据不匹配！')
  }
  console.log('✅ 2. 错题多维检索、关键词搜索与 SM-2 联表查询测试通过')

  // 3. 测试反思随笔更新与状态更新
  const updateSuccess = database.updateErrorQuestion(testId1, {
    notes: '反思补充：牢记常用八大泰勒展开式前三项系数！',
    status: 'mastered',
  }, 'test_user')
  if (!updateSuccess) {
    throw new Error('更新错题失败！')
  }

  const updatedList = database.getErrorQuestions({ userId: 'test_user', status: 'mastered' })
  const updatedFound = updatedList.find(q => q.id === testId1)
  if (!updatedFound || updatedFound.status !== 'mastered' || !updatedFound.notes?.includes('八大泰勒')) {
    throw new Error('错题状态与心得更新验证失败！')
  }
  console.log('✅ 3. 错题状态斩杀与反思随笔热更新测试通过')

  // 4. 测试全局统计数据看板
  const stats = database.getErrorQuestionStats('test_user')
  console.log('📊 错题全景看板数据统计结果:', stats)
  if (stats.total !== 2 || stats.mastered !== 1 || stats.active !== 1 || stats.dueToday !== 1) {
    throw new Error(`错题全局统计指标聚合异常: ${JSON.stringify(stats)}`)
  }
  console.log('✅ 4. 错题多维画像与统计看板聚合测试通过')

  // 5. 测试批量操作
  const batchCount = database.batchUpdateErrorQuestions([testId1, testId2], { status: 'mastered' }, 'test_user')
  if (batchCount !== 2) {
    throw new Error(`批量标记掌握数量异常: ${batchCount}`)
  }
  const statsAfterBatch = database.getErrorQuestionStats('test_user')
  if (statsAfterBatch.mastered !== 2 || statsAfterBatch.active !== 0) {
    throw new Error('批量更新后统计口径异常！')
  }
  console.log('✅ 5. 错题批量更新状态测试通过')

  // 6. 测试删除清理
  const delSuccess = database.deleteErrorQuestion(testId1, 'test_user')
  if (!delSuccess) {
    throw new Error('删除错题失败！')
  }
  const afterDel = database.getErrorQuestions({ userId: 'test_user' }).find(q => q.id === testId1)
  if (afterDel) {
    throw new Error('错题删除后依然存在！')
  }
  console.log('✅ 6. 错题删除与 SM-2 联动清理测试通过')

  // 清理临时目录
  database.close()
  try {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
    }
  } catch {}
  console.log('🎉🎉 全部错题系统底层测试 100% 通过！')
}

runErrorNotebookTests().catch(err => {
  console.error('❌ 测试失败:', err)
  database.close()
  try {
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
    }
  } catch {}
  process.exit(1)
})
