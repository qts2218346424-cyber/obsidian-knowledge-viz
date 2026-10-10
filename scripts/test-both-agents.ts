import { detectAllLocalAgents, runLocalAgent } from '../server/local-agent-bridge.js'
import { config } from '../server/context.js'

async function testAgent(provider: 'claude-code' | 'codex', prompt: string) {
  console.log(`\n================== 测试 [${provider}] ==================`)
  const events = runLocalAgent({
    provider,
    prompt,
    cwd: 'E:\\考研\\408考研学习',
    config: config.localAgents,
  })

  let gotText = false
  for await (const e of events) {
    if (e.type === 'status') {
      console.log(`[${provider} 状态]:`, e.content)
    } else if (e.type === 'text') {
      gotText = true
      process.stdout.write(e.content || '')
    } else if (e.type === 'error') {
      console.error(`\n[${provider} 报错]:`, e.content)
      return false
    } else if (e.type === 'done') {
      console.log(`\n[${provider} 执行完成]`)
    }
  }
  return gotText
}

async function main() {
  const agents = await detectAllLocalAgents(config.localAgents)
  console.log('探测到的本地 Agent 列表:')
  for (const a of agents) {
    if (a.provider === 'claude-code' || a.provider === 'codex') {
      console.log(`- ${a.provider}: available=${a.available}, version=${a.version}, command=${a.command}`)
    }
  }

  const codexOk = await testAgent('codex', '请简短回复：Codex已连接。')
  const claudeOk = await testAgent('claude-code', '请简短回复：Claude已连接。')

  console.log('\n================== 测试总结 ==================')
  console.log(`Codex 测试结果: ${codexOk ? '✅ 成功' : '❌ 失败'}`)
  console.log(`Claude Code 测试结果: ${claudeOk ? '✅ 成功' : '❌ 失败'}`)
}

main().catch(console.error)
