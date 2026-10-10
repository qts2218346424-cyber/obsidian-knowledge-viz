// 按照前端 api.ts 的真实路径进行全量回归探测
const BASE_URL = 'http://127.0.0.1:3001'

async function testEndpoint(name, path, options = {}) {
  const url = `${BASE_URL}${path}`
  try {
    const res = await fetch(url, options)
    const status = res.status
    const text = await res.text()
    let data = null
    try {
      data = JSON.parse(text)
    } catch {}

    const isOk = status >= 200 && status < 300
    console.log(`[${isOk ? 'PASS' : 'FAIL'}] ${name}: ${options.method || 'GET'} ${path} -> 状态码: ${status}`)
    if (!isOk) {
      console.log(`       错误详情: ${text.slice(0, 300)}`)
    }
    return { name, path, status, ok: isOk, data }
  } catch (err) {
    console.log(`[ERROR] ${name}: ${options.method || 'GET'} ${path} -> 请求失败: ${err.message}`)
    return { name, path, status: 0, ok: false, error: err.message }
  }
}

async function runAllTests() {
  console.log('=== 开始全面自动化 API 功能探测 ===\n')

  const results = []

  // 1. 系统与配置
  results.push(await testEndpoint('系统配置', '/api/settings'))
  results.push(await testEndpoint('知识库统计', '/api/vault/stats'))
  results.push(await testEndpoint('知识库文件树', '/api/vault/tree'))
  results.push(await testEndpoint('知识库文件列表', '/api/vault/files'))
  results.push(await testEndpoint('知识库图谱', '/api/vault/graph'))
  results.push(await testEndpoint('知识库健康检查', '/api/vault/health'))
  results.push(await testEndpoint('文档导入状态', '/api/ingest/status'))
  results.push(await testEndpoint('文件浏览 (根路径)', '/api/fs/browse'))

  // 2. 本地智能体与模型扫描
  results.push(await testEndpoint('本地 Agent 状态探测', '/api/local-agents/status'))
  results.push(await testEndpoint('本地技能列表', '/api/local-agents/skills'))
  results.push(await testEndpoint('已删除模型记录', '/api/local-agents/deleted-models'))
  results.push(await testEndpoint('AI 模型列表查询', '/api/ai/models'))

  // 3. 记忆系统与认知层级
  results.push(await testEndpoint('AI 记忆配置 (agent.md)', '/api/memory/agent-config'))
  results.push(await testEndpoint('全量记忆列表', '/api/memory/all'))
  results.push(await testEndpoint('三层记忆架构 (tier)', '/api/memory/tier'))

  // 4. 学习与研学模块
  results.push(await testEndpoint('到期复习笔记列表', '/api/study/review-due'))
  results.push(await testEndpoint('每日错题复习', '/api/study/daily-review'))
  results.push(await testEndpoint('词汇本数据', '/api/study/vocabulary'))

  console.log('\n=== 测试统计 ===')
  const passed = results.filter(r => r.ok).length
  const failed = results.filter(r => !r.ok).length
  console.log(`总共测试: ${results.length}，通过: ${passed}，失败: ${failed}`)
}

runAllTests()
