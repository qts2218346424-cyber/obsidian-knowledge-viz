/**
 * 题目提取召回率评测
 *
 * 用法：
 *   npx tsx scripts/eval-question-extraction.ts            # 用模拟的「不稳定 AI」跑对账逻辑
 *   npx tsx scripts/eval-question-extraction.ts --real     # 用 server/config.json 里配置的模型
 *
 * fixtures 目录下每个 .md 需要在 expected.json 里登记应有题数。
 * 往里加真实试卷（扫描版、双栏版、每大题重新编号的）即可回归测试。
 */
import fs from 'fs'
import path from 'path'
import { extractQuestions, type AiReply } from '../server/services/question-extractor.ts'

const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), 'fixtures')
const expected: Record<string, number> = JSON.parse(fs.readFileSync(path.join(dir, 'expected.json'), 'utf-8'))
const real = process.argv.includes('--real')

/** 模拟真实模型的毛病：随机漏题，块大时输出被截断 */
function flakyAi(seed = 7) {
  let s = seed
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  return async (_system: string, prompt: string, _max: number): Promise<AiReply> => {
    const refs = [...prompt.matchAll(/<<<Q ref=([^>]+)>>>\n([\s\S]*?)(?=\n\n<<<Q ref=|\n*$)/g)]
    const rows: string[] = []
    for (const [, ref, text] of refs) {
      if (rand() < 0.3) continue // 漏题
      rows.push(JSON.stringify({ ref, type: 'analysis', difficulty: '中等', question: text.split('\n')[0].replace(/^\S+\s*/, ''), answer: '', explanation: '' }))
    }
    const truncated = refs.length > 4
    const out = truncated ? rows.slice(0, 3).join('\n') + '\n{"ref":"' : rows.join('\n')
    return { text: out, stopReason: truncated ? 'max_tokens' : 'end_turn' }
  }
}

let failed = 0
for (const [file, want] of Object.entries(expected)) {
  const md = fs.readFileSync(path.join(dir, file), 'utf-8')
  const t0 = Date.now()
  const report = await extractQuestions(md, { domain: 'cs_408', complete: real ? undefined : flakyAi() })
  const withAnswer = report.questions.filter(q => q.answer).length
  const ok = report.expected === want && report.questions.length === want
  if (!ok) failed++
  console.log(
    `${ok ? 'PASS' : 'FAIL'} ${file}: 应有 ${want}，切出 ${report.expected}，保存 ${report.questions.length}，` +
      `有答案 ${withAnswer}，规则兜底 ${report.repairedByRule}，覆盖率 ${report.coverage}%，${Date.now() - t0}ms`
  )
}
process.exit(failed ? 1 : 0)
