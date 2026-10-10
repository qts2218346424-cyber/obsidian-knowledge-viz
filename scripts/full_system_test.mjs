// 全面系统端到端功能与业务流测试
const BASE = 'http://127.0.0.1:3001'

async function request(path, options = {}) {
  const url = `${BASE}${path}`
  const res = await fetch(url, options)
  const status = res.status
  let data = null
  const text = await res.text()
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  return { status, ok: res.ok, data }
}

async function runFullTest() {
  console.log('========================================================')
  console.log('       CoreForge 研核 · 全系统深度功能回归测试')
  console.log('========================================================\n')

  let passCount = 0
  let failCount = 0

  async function assert(name, fn) {
    try {
      const res = await fn()
      if (res.ok) {
        console.log(`[PASS] ${name}`)
        passCount++
      } else {
        console.log(`[FAIL] ${name} -> 状态码: ${res.status}, 详情: ${JSON.stringify(res.data).slice(0, 160)}`)
        failCount++
      }
    } catch (err) {
      console.log(`[ERROR] ${name} -> 抛出异常: ${err.message}`)
      failCount++
    }
  }

  // 1. 系统与配置
  await assert('1.1 读取系统基本配置', () => request('/api/settings'))
  await assert('1.2 本地知识库统计与健康度', () => request('/api/vault/stats'))
  await assert('1.3 知识库全局目录树索引', () => request('/api/vault/tree'))
  await assert('1.4 知识库全局双链关联图谱', () => request('/api/vault/graph'))

  // 2. 真实文件 CRUD 周期验证
  const testFileName = `test-temp-${Date.now()}.md`
  let createdPath = ''
  await assert('2.1 新建 Markdown 笔记', async () => {
    const res = await request('/api/vault/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: testFileName,
        content: '# 测试文档\n这是自动化测试写入的一篇笔记。',
        frontmatter: { tags: ['test-runner', 'ci-check'] },
      }),
    })
    if (res.ok && res.data?.path) {
      createdPath = res.data.path
    }
    return res
  })

  if (createdPath) {
    await assert('2.2 读取刚创建的 Markdown 笔记', () => request(`/api/vault/file?path=${encodeURIComponent(createdPath)}`))
    await assert('2.3 更新 Markdown 笔记内容', () => request('/api/vault/file', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: createdPath,
        content: '# 测试文档（已更新）\n这是更新后的笔记内容。',
        frontmatter: { tags: ['test-runner', 'updated'] },
      }),
    }))
    await assert('2.4 安全删除测试 Markdown 笔记', () => request('/api/vault/file', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: createdPath }),
    }))
  }

  // 3. 本地智能体生态与模型扫描
  await assert('3.1 本地 CLI 智能体探测 (Antigravity/Codex/Claude)', () => request('/api/local-agents/status'))
  await assert('3.2 本地与插件技能库探测', () => request('/api/local-agents/skills'))
  await assert('3.3 AI 聚合模型列表查询', () => request('/api/ai/models'))
  await assert('3.4 已删除模型回收站查询', () => request('/api/local-agents/deleted-models'))

  // 4. 记忆系统与认知仓库
  await assert('4.1 读取 agent.md 智能体设定与记忆', () => request('/api/memory/agent-config'))
  await assert('4.2 获取全量原子记忆条目与统计', () => request('/api/memory/all'))

  // 5. 研学与测验题库
  await assert('5.1 自定义题库查询', () => request('/api/quiz/custom'))
  await assert('5.2 刷题历史记录查询', () => request('/api/quiz/history'))
  await assert('5.3 考研真题到期复习笔记队列', () => request('/api/study/review-due'))
  await assert('5.4 每日错题自测复盘数据', () => request('/api/study/daily-review'))
  await assert('5.5 考研英语与专业课词汇本数据', () => request('/api/study/vocabulary'))

  // 6. 治理与自动化调度
  await assert('6.1 知识库标签治理列表', () => request('/api/vault/tags'))
  await assert('6.2 相似与重复笔记探测', () => request('/api/vault/duplicates'))
  await assert('6.3 定时调度自动化状态', () => request('/api/schedule/status'))

  console.log('\n========================================================')
  console.log(`测试完成！通过: ${passCount}，失败: ${failCount}`)
  console.log('========================================================\n')
}

runFullTest()
