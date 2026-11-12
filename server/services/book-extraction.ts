/**
 * 教材 / 资料抽取相关的纯函数与文件存取工具（自 routes/books.ts 拆出，路由层只负责 HTTP 编排）。
 */
import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { config, __dirname } from '../context.js'
import { getRequestVaultPath } from './user-sandbox.js'

const execFileAsync = promisify(execFile)

/**
 * 修复：此前固定写入全局 config.vaultPath，而做题中心按用户沙箱读取，
 * 导致用户从教材抽取的题目永远不会出现在自己的题库里（并且写入了公共目录）。
 */
export function getCustomQuestionsPath(req?: any): string {
  const vaultPath = req ? getRequestVaultPath(req) : config.vaultPath
  const quizDir = path.resolve(vaultPath, '做题记录')
  if (!fs.existsSync(quizDir)) {
    fs.mkdirSync(quizDir, { recursive: true })
  }
  return path.join(quizDir, 'custom-questions.json')
}

export function appendCustomQuestions(newQuestions: any[], req?: any): void {
  try {
    const p = getCustomQuestionsPath(req)
    let list: any[] = []
    if (fs.existsSync(p)) {
      list = JSON.parse(fs.readFileSync(p, 'utf8'))
    }
    const existingIds = new Set(list.map((q: any) => q.id))
    for (const q of newQuestions) {
      if (!existingIds.has(q.id)) {
        list.push(q)
      }
    }
    fs.writeFileSync(p, JSON.stringify(list, null, 2), 'utf8')
  } catch (err: any) {
    console.error('Failed to append custom questions:', err.message)
  }
}

export function getExtractionsRecordPath(): string {
  const dir = path.join(config.vaultPath, 'raw-sources')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return path.join(dir, '.extractions.json')
}

export function loadExtractionsRecord(): Record<string, any> {
  try {
    const p = getExtractionsRecordPath()
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'))
    }
  } catch {}
  return {}
}

export function saveExtractionRecord(relPath: string, info: any): void {
  try {
    const record = loadExtractionsRecord()
    record[relPath] = {
      ...info,
      updatedAt: new Date().toISOString()
    }
    fs.writeFileSync(getExtractionsRecordPath(), JSON.stringify(record, null, 2), 'utf8')
  } catch (err: any) {
    console.warn('Failed to save extraction record:', err.message)
  }
}


/**
 * 基于文本内容与文件名智能推断学科归属 (操作系统 / 计网 / 组原 / 数据结构 / 高数 / 线代 / 概率论)
 */

/**
 * 启发式从用户上传的文本/Markdown中高保真提取真题与选择题，杜绝假题与模板自编
 */
export function extractQuizQuestionsFromRawText(text: string, filename: string, domain: 'cs_408' | 'math', subject: string): any[] {
  const questions: any[] = []
  if (!text || text.length < 15) return questions

  // 1. 尝试匹配包含 A, B, C, D 选项的选择题
  // 匹配形式如：(1|一|Q1|1.)? 题干 ... A. ... B. ... C. ... D. ... [答案] ... [解析] ...
  const lines = text.split(/\r?\n/)
  let currentQ: any = null
  let state: 'question' | 'options' | 'answer' | 'explanation' = 'question'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // 匹配选项
    const optMatch = line.match(/^([A-D])[.、\s\):：](.+)$/i)
    if (optMatch) {
      if (currentQ) {
        const optKey = optMatch[1].toUpperCase()
        currentQ.options[optKey] = optMatch[2].trim()
        state = 'options'
        continue
      }
    }

    // 匹配答案
    const ansMatch = line.match(/(?:【?答案】?|参考答案|正确答案|Answer)[:：\s]*([A-D])/i)
    if (ansMatch && currentQ) {
      currentQ.answer = ansMatch[1].toUpperCase()
      state = 'answer'
      continue
    }

    // 匹配解析
    const expMatch = line.match(/(?:【?解析】?|分步解析|Explanation)[:：\s]*(.*)$/i)
    if (expMatch && currentQ) {
      currentQ.explanation = expMatch[1].trim()
      state = 'explanation'
      continue
    }

    // 若处于解析状态，追加解析正文
    if (state === 'explanation' && currentQ && !line.match(/^(?:第?\s*\d+[\.、题\s]|【[0-9]+】)/)) {
      currentQ.explanation += '\n' + line
      continue
    }

    // 探测新题目起始 (如 "1.", "【真题】", "下列关于...")
    const isNewQ = line.match(/^(?:第?\s*\d+[\.、题\s]|【(?:真题|单选|选择题|\d+)】|下列关于|在.*系统中|关于.*说法)/)
    if (isNewQ || (!currentQ && (line.includes('下列') || line.includes('？') || line.includes('?')))) {
      if (currentQ && Object.keys(currentQ.options).length >= 2) {
        questions.push(currentQ)
      }
      currentQ = {
        id: `imported-${Date.now()}-${questions.length + 1}`,
        domain,
        subject,
        chapter: `${subject}真题精粹`,
        type: 'choice',
        difficulty: '中等',
        question: line.replace(/^(?:第?\s*\d+[\.、题\s]|【[^】]+】)/, '').trim(),
        options: {},
        answer: 'A',
        explanation: '详见原题解析与考点归因。',
        tags: ['导入真题', subject, filename.replace(/\.[^.]+$/, '')]
      }
      state = 'question'
      continue
    }

    if (state === 'question' && currentQ) {
      currentQ.question += ' ' + line
    }
  }

  if (currentQ && Object.keys(currentQ.options).length >= 2) {
    questions.push(currentQ)
  }

  return questions
}

export function inferDomainAndSubjectFromText(text: string, filename: string): { domain: 'cs_408' | 'math'; subject: string } {
  const combined = (filename + ' ' + text).toLowerCase()
  
  // 操作系统关键词特征
  const osKeywords = ['操作系统', '进程', '线程', '死锁', '互斥', '信号量', 'pv操作', '虚拟内存', '分页', '分段', '页面置换', 'lru', 'fifo', 'tlb', '快表', '中断', '系统调用', '文件系统', 'fcb', 'inode', 'i/o方式', '程序查询', '中断驱动', 'dma', '通道', 'spooling', '时钟中断']
  // 计算机组成原理特征
  const coKeywords = ['计算机组成', '计组', '组原', '指令系统', '总线', '指令周期', '微程序', '流水线', 'raw冒险', '数据旁路', '补码', '原码', '浮点数', 'ieee754', 'cache', '全相联', '直接映射', '组相联', '主存', 'dram', 'sram', '中断隐指令', '微指令']
  // 计算机网络特征
  const netKeywords = ['计算机网络', '计网', 'tcp', 'udp', 'ip地址', '子网掩码', 'cidr', '三次握手', '四次挥手', '滑动窗口', '拥塞控制', '慢开始', '拥塞避免', '快重传', 'csma/cd', '路由器', '交换机', 'rip', 'ospf', 'bgp', '香农公式', '奈氏准则', 'dns', 'http']
  // 数据结构特征
  const dsKeywords = ['数据结构', '二叉树', '平衡二叉树', 'avl', '红黑树', 'b树', 'b+树', '哈夫曼', '线索二叉树', '图', '邻接表', '邻接矩阵', '拓扑排序', '关键路径', 'dijkstra', 'floyd', 'prim', 'kruskal', '快速排序', '堆排序', '归并排序', '双指针', '链表', '顺序表']
  
  // 数学学科特征
  const calcKeywords = ['微积分', '高等数学', '极限', '泰勒公式', '洛必达', '中值定理', '拉格朗日', '柯西', '罗尔', '导数', '微分', '不定积分', '定积分', '二重积分', '极坐标', '反常积分', '微分方程', '级数', '收敛性']
  const laKeywords = ['线性代数', '行列式', '矩阵', '逆矩阵', '初等变换', '矩阵的秩', '线性相关', '线性无关', '基础解系', '特征值', '特征向量', '相似对角化', '施密特正交化', '二次型', '正定矩阵', '合同']
  const probKeywords = ['概率论', '数理统计', '随机变量', '概率密度', '分布函数', '泊松分布', '正态分布', '数学期望', '方差', '协方差', '相关系数', '切比雪夫', '大数定律', '中心极限定理', '卡方分布', 't分布', 'f分布']

  let osScore = 0; let coScore = 0; let netScore = 0; let dsScore = 0
  let calcScore = 0; let laScore = 0; let probScore = 0

  for (const k of osKeywords) { if (combined.includes(k.toLowerCase())) osScore += 2 }
  for (const k of coKeywords) { if (combined.includes(k.toLowerCase())) coScore += 2 }
  for (const k of netKeywords) { if (combined.includes(k.toLowerCase())) netScore += 2 }
  for (const k of dsKeywords) { if (combined.includes(k.toLowerCase())) dsScore += 2 }
  for (const k of calcKeywords) { if (combined.includes(k.toLowerCase())) calcScore += 2 }
  for (const k of laKeywords) { if (combined.includes(k.toLowerCase())) laScore += 2 }
  for (const k of probKeywords) { if (combined.includes(k.toLowerCase())) probScore += 2 }

  const csMax = Math.max(osScore, coScore, netScore, dsScore)
  const mathMax = Math.max(calcScore, laScore, probScore)

  if (csMax > 0 || mathMax > 0) {
    if (csMax >= mathMax) {
      if (osScore === csMax) return { domain: 'cs_408', subject: '操作系统' }
      if (coScore === csMax) return { domain: 'cs_408', subject: '计算机组成原理' }
      if (netScore === csMax) return { domain: 'cs_408', subject: '计算机网络' }
      return { domain: 'cs_408', subject: '数据结构' }
    } else {
      if (laScore === mathMax) return { domain: 'math', subject: '线性代数' }
      if (probScore === mathMax) return { domain: 'math', subject: '概率论与数理统计' }
      return { domain: 'math', subject: '高等数学' }
    }
  }

  // 默认根据名称或408包含判断
  if (combined.includes('408') || combined.includes('计算机')) {
    return { domain: 'cs_408', subject: '操作系统' }
  }
  return { domain: 'math', subject: '高等数学' }
}

export async function extractContentFromMaterial(fullPath: string): Promise<{ content: string; subject?: string; domain?: 'cs_408' | 'math'; inferredTitle?: string }> {
  const ext = path.extname(fullPath).toLowerCase()
  if (ext === '.pdf') {
    const possibleScriptPaths = [
      path.join(__dirname, 'scripts', 'extract_pdf_summary.py'),
      path.join(__dirname, '..', 'server', 'scripts', 'extract_pdf_summary.py'),
      path.join(process.cwd(), 'server', 'scripts', 'extract_pdf_summary.py'),
    ]
    const scriptPath = possibleScriptPaths.find(p => fs.existsSync(p)) || possibleScriptPaths[0]
    try {
      const { stdout } = await execFileAsync('python', [scriptPath, fullPath], { timeout: 45000, maxBuffer: 10 * 1024 * 1024 })
      const res = JSON.parse(stdout)
      if (res.success && res.content) {
        return {
          content: res.content,
          subject: res.subject,
          domain: res.domain,
          inferredTitle: res.inferredTitle
        }
      }
    } catch (err: any) {
      console.warn('Python PDF extract error:', err.message)
    }
  }

  // Text-based files: .md, .txt, .html
  if (fs.existsSync(fullPath)) {
    try {
      const stat = fs.statSync(fullPath)
      if (stat.size <= 10 * 1024 * 1024) {
        let text = fs.readFileSync(fullPath, 'utf8')
        if (ext === '.html' || ext === '.htm') {
          text = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        }
        return { content: text.slice(0, 8000) }
      }
    } catch (readErr: any) {
      console.warn('File read error:', readErr.message)
    }
  }

  return {
    content: `资料参考书：《${path.basename(fullPath)}》\n请结合考研该科目权威大纲核心定理、高频考法模型与重难点，进行体系化结构笔记提炼与真题归纳。`
  }
}

export function robustParseAiJson(rawText: string): any {
  let text = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim()
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch {}

  const result: any = { note: {}, questions: [] }

  // 1. Extract questions block
  try {
    const qBlockMatch = text.match(/"questions"\s*:\s*\[([\s\S]*?)(?:\]|\n\s*"note")/i)
    const block = qBlockMatch ? qBlockMatch[1] : text
    const qMatches = block.match(/\{[^{}]*"question"[\s\S]*?\}/gi)
    if (qMatches) {
      for (const qm of qMatches) {
        try {
          result.questions.push(JSON.parse(qm))
        } catch {
          try {
            const cleanQm = qm.replace(/\n/g, '\\n').replace(/\r/g, '')
            result.questions.push(JSON.parse(cleanQm))
          } catch {}
        }
      }
    }
  } catch {}

  // 2. Extract note block
  try {
    const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/)
    if (titleMatch) result.note.title = titleMatch[1]

    const pathMatch = text.match(/"suggestedPath"\s*:\s*"([^"]+)"/)
    if (pathMatch) result.note.suggestedPath = pathMatch[1]

    const contentStart = text.indexOf('"content":')
    if (contentStart !== -1) {
      let rawContent = text.slice(contentStart + 10).trim()
      if (rawContent.startsWith('"')) rawContent = rawContent.slice(1)
      rawContent = rawContent.replace(/"\s*\}\s*\}\s*$/, '').replace(/"\s*\}\s*$/, '').trim()
      result.note.content = rawContent.replace(/\\n/g, '\n').replace(/\\"/g, '"')
    }
  } catch {}

  if (result.note.title || result.questions.length > 0) return result
  throw new Error('AI 返回数据解析异常')
}
