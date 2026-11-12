import { Router, type Request } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { config, anthropic, markSelfWrite, invalidateCache } from '../context.js'
import { createFile } from '../vault-parser.js'
import { getRequestVaultPath, getUserVaultDir, ensureUserSandboxSync } from '../services/user-sandbox.js'
import { database, type DbUser } from '../db/database.js'
import {
  inspectPdfFile,
  extractFullMaterialContent,
  getDirectorySizeBytes
} from '../services/pdf-extractor.js'
import {
  enqueueBookScanTask,
  getBookScanTask,
  listBookScanTasksForUser,
  executeBookScanJob,
  type ScanExtractMode
} from '../services/book-scan-queue.js'
import { normalizeQuestionMathFields } from '../utils/math-normalize.js'
import { ensureRawSourcesInitialized } from '../services/raw-sources-seed.js'
import { parseOutlineIntoChapters, runBookContentExtractor, type BookChapter } from '../services/book-outline.js'


export type BookScope = 'shared' | 'personal'
export type ResourceDomain = 'cs_408' | 'math' | 'english' | 'politics' | 'general'

function normalizeResourceDomain(raw?: string): ResourceDomain {
  if (raw === 'cs_408' || raw === 'math' || raw === 'english' || raw === 'politics' || raw === 'general') {
    return raw
  }
  return 'math'
}

function getSubDirForDomain(domain: ResourceDomain): string {
  switch (domain) {
    case 'cs_408': return '408计算机'
    case 'english': return '考研英语'
    case 'politics': return '考研政治'
    case 'general': return '其他考研资料'
    default: return '考研数学'
  }
}

function getWikiDomainDir(domain: ResourceDomain): string {
  switch (domain) {
    case 'cs_408': return '02-408计算机'
    case 'english': return '03-考研英语'
    case 'politics': return '04-考研政治'
    case 'general': return '05-其他考研资料'
    default: return '01-考研数学'
  }
}

function getDomainDisplayName(domain: ResourceDomain): string {
  switch (domain) {
    case 'cs_408': return '408 计算机综合'
    case 'english': return '考研英语 (英一/英二)'
    case 'politics': return '考研政治 (马原/史纲/思修/新思想)'
    case 'general': return '其他专业课 / 复试综合'
    default: return '考研数学'
  }
}

function getDefaultSubjectForDomain(domain: ResourceDomain): string {
  switch (domain) {
    case 'cs_408': return '数据结构'
    case 'english': return '阅读理解'
    case 'politics': return '马克思主义基本原理'
    case 'general': return '专业课综合'
    default: return '高等数学'
  }
}

function inferDomainFromPathOrName(raw: string): ResourceDomain {
  const s = raw.toLowerCase()
  if (
    s.includes('考研英语') || s.includes('english') || s.includes('英语') ||
    s.includes('阅读理解') || s.includes('长难句') || s.includes('完形') ||
    s.includes('红宝书') || s.includes('恋练有词') || s.includes('黄皮书') || s.includes('单词') || s.includes('词汇')
  ) {
    return 'english'
  }
  if (
    s.includes('考研政治') || s.includes('politics') || s.includes('政治') ||
    s.includes('马原') || s.includes('毛中特') || s.includes('史纲') || s.includes('思修') ||
    s.includes('肖秀荣') || s.includes('肖四') || s.includes('肖八') || s.includes('肖1000') ||
    s.includes('腿姐') || s.includes('徐涛') || s.includes('时政') || s.includes('新思想')
  ) {
    return 'politics'
  }
  if (s.includes('408') || s.includes('数据结构') || s.includes('计算机') || s.includes('操作系统') || s.includes('组成原理') || s.includes('cs_408')) {
    return 'cs_408'
  }
  if (s.includes('其他考研资料') || s.includes('专业课') || s.includes('复试') || s.includes('general')) {
    return 'general'
  }
  return 'math'
}

function resolveUserFromReq(req: Request): DbUser | undefined {
  if (req.user) return req.user
  const qToken = typeof req.query?.token === 'string' ? req.query.token.trim() : ''
  if (qToken) {
    const record = database.findSessionByToken(qToken)
    if (record?.user) {
      req.user = record.user
      req.token = qToken
      return record.user
    }
  }
  return undefined
}

function isStrictInside(parentDir: string, targetPath: string): boolean {
  const parent = path.resolve(parentDir)
  const target = path.resolve(targetPath)
  if (process.platform === 'win32') {
    const pLow = parent.toLowerCase()
    const tLow = target.toLowerCase()
    const rel = path.relative(pLow, tLow)
    return Boolean(rel) && !rel.startsWith('..') && !path.isAbsolute(rel)
  }
  const rel = path.relative(parent, target)
  return Boolean(rel) && !rel.startsWith('..') && !path.isAbsolute(rel)
}

function getCustomQuestionsPath(vaultRoot: string): string {
  const quizDir = path.resolve(vaultRoot, '做题记录')
  if (!fs.existsSync(quizDir)) {
    fs.mkdirSync(quizDir, { recursive: true })
  }
  return path.join(quizDir, 'custom-questions.json')
}

function appendCustomQuestions(newQuestions: any[], req?: Request): void {
  try {
    const vaultRoot = req ? getRequestVaultPath(req) : config.vaultPath
    const p = getCustomQuestionsPath(vaultRoot)
    let list: any[] = []
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf8'))
      if (Array.isArray(parsed)) list = parsed
    }
    const existingIds = new Set(list.map((q: any) => q.id))
    for (const rawQ of newQuestions) {
      const q = normalizeQuestionMathFields(rawQ)
      if (!existingIds.has(q.id)) {
        list.push(q)
        existingIds.add(q.id)
      }
    }
    fs.writeFileSync(p, JSON.stringify(list, null, 2), 'utf8')
  } catch (err: any) {
    console.error('Failed to append custom questions:', err.message)
  }
}

function getExtractionsRecordPath(vaultRoot: string = config.vaultPath): string {
  const dir = path.join(vaultRoot, 'raw-sources')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return path.join(dir, '.extractions.json')
}

function loadExtractionsRecord(vaultRoot: string = config.vaultPath): Record<string, any> {
  try {
    const p = path.join(vaultRoot, 'raw-sources', '.extractions.json')
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'))
    }
  } catch {}
  return {}
}

function getExtractionRecordForBook(record: Record<string, any>, scope: BookScope, relPath: string): any {
  const altRel1 = relPath.replace('06-原始资料库', 'raw-sources')
  const altRel2 = relPath.replace('raw-sources', '06-原始资料库')
  return (
    record[`${scope}:${relPath}`] ||
    record[`${scope}:${altRel1}`] ||
    record[`${scope}:${altRel2}`] ||
    record[relPath] ||
    record[altRel1] ||
    record[altRel2]
  )
}

function saveExtractionRecord(vaultRoot: string, scope: BookScope, relPath: string, info: any): void {
  try {
    const record = loadExtractionsRecord(vaultRoot)
    record[`${scope}:${relPath}`] = {
      ...info,
      scope,
      updatedAt: new Date().toISOString()
    }
    fs.writeFileSync(getExtractionsRecordPath(vaultRoot), JSON.stringify(record, null, 2), 'utf8')
  } catch (err: any) {
    console.warn('Failed to save extraction record:', err.message)
  }
}

function removeOrRenameExtractionRecord(vaultRoot: string, scope: BookScope, oldRelPath: string, newRelPath?: string): void {
  try {
    const p = path.join(vaultRoot, 'raw-sources', '.extractions.json')
    if (!fs.existsSync(p)) return
    const record = loadExtractionsRecord(vaultRoot)
    const keys = [`${scope}:${oldRelPath}`, oldRelPath]
    let existing: any = null
    for (const k of keys) {
      if (record[k]) {
        existing = record[k]
        delete record[k]
      }
    }
    if (newRelPath && existing) {
      record[`${scope}:${newRelPath}`] = {
        ...existing,
        updatedAt: new Date().toISOString()
      }
    }
    fs.writeFileSync(p, JSON.stringify(record, null, 2), 'utf8')
  } catch {}
}


/**
 * 基于文本内容与文件名智能推断学科归属 (操作系统 / 计网 / 组原 / 数据结构 / 高数 / 线代 / 概率论)
 */

/**
 * 启发式从用户上传的文本/Markdown中高保真提取真题与选择题，杜绝假题与模板自编
 */
function extractQuizQuestionsFromRawText(text: string, filename: string, domain: ResourceDomain, subject: string): any[] {
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

export function inferDomainAndSubjectFromText(text: string, filename: string): { domain: ResourceDomain; subject: string } {
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

  // 英语学科特征
  const engReadingKeywords = ['考研英语', '英语一', '英语二', '阅读理解', 'reading comprehension', 'passage', 'paragraph', 'author', 'attitude']
  const engWritingKeywords = ['英语作文', '大作文', '小作文', '图画作文', '图表作文', '写作模板', 'dear sir', 'yours sincerely']
  const engVocabKeywords = ['核心词汇', '单词', '词根', '词缀', '恋练有词', '红宝书', '长难句', '完形填空', '新题型', '翻译']

  // 政治学科特征
  const polMarxKeywords = ['马原', '马克思主义', '辩证法', '唯物论', '认识论', '唯物史观', '剩余价值', '商品二因素', '资本论', '矛盾的普遍性']
  const polHistoryKeywords = ['史纲', '近现代史', '鸦片战争', '辛亥革命', '五四运动', '抗日战争', '新民主主义', '社会主义改造']
  const polTheoryKeywords = ['考研政治', '毛中特', '习近平新时代', '新思想', '思想道德与法治', '思修', '肖秀荣', '肖四', '肖八', '肖1000', '腿姐', '徐涛', '形势与政策', '时政']

  let osScore = 0; let coScore = 0; let netScore = 0; let dsScore = 0
  let calcScore = 0; let laScore = 0; let probScore = 0
  let engReadScore = 0; let engWriteScore = 0; let engVocabScore = 0
  let polMarxScore = 0; let polHistScore = 0; let polTheoryScore = 0

  for (const k of osKeywords) { if (combined.includes(k.toLowerCase())) osScore += 2 }
  for (const k of coKeywords) { if (combined.includes(k.toLowerCase())) coScore += 2 }
  for (const k of netKeywords) { if (combined.includes(k.toLowerCase())) netScore += 2 }
  for (const k of dsKeywords) { if (combined.includes(k.toLowerCase())) dsScore += 2 }
  for (const k of calcKeywords) { if (combined.includes(k.toLowerCase())) calcScore += 2 }
  for (const k of laKeywords) { if (combined.includes(k.toLowerCase())) laScore += 2 }
  for (const k of probKeywords) { if (combined.includes(k.toLowerCase())) probScore += 2 }
  for (const k of engReadingKeywords) { if (combined.includes(k.toLowerCase())) engReadScore += 2 }
  for (const k of engWritingKeywords) { if (combined.includes(k.toLowerCase())) engWriteScore += 2 }
  for (const k of engVocabKeywords) { if (combined.includes(k.toLowerCase())) engVocabScore += 2 }
  for (const k of polMarxKeywords) { if (combined.includes(k.toLowerCase())) polMarxScore += 2 }
  for (const k of polHistoryKeywords) { if (combined.includes(k.toLowerCase())) polHistScore += 2 }
  for (const k of polTheoryKeywords) { if (combined.includes(k.toLowerCase())) polTheoryScore += 2 }

  const csMax = Math.max(osScore, coScore, netScore, dsScore)
  const mathMax = Math.max(calcScore, laScore, probScore)
  const engMax = Math.max(engReadScore, engWriteScore, engVocabScore)
  const polMax = Math.max(polMarxScore, polHistScore, polTheoryScore)

  const topMax = Math.max(csMax, mathMax, engMax, polMax)
  if (topMax > 0) {
    if (polMax === topMax) {
      if (polHistScore === polMax) return { domain: 'politics', subject: '中国近现代史纲要' }
      if (polMarxScore === polMax) return { domain: 'politics', subject: '马克思主义基本原理' }
      return { domain: 'politics', subject: '习近平新时代中国特色社会主义思想' }
    }
    if (engMax === topMax) {
      if (engWriteScore === engMax) return { domain: 'english', subject: '英语作文' }
      if (engVocabScore === engMax) return { domain: 'english', subject: '核心词汇' }
      return { domain: 'english', subject: '阅读理解' }
    }
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

  const fallbackDomain = inferDomainFromPathOrName(combined)
  return { domain: fallbackDomain, subject: getDefaultSubjectForDomain(fallbackDomain) }
}

async function extractContentFromMaterial(fullPath: string): Promise<{
  content: string
  subject?: string
  domain?: ResourceDomain
  inferredTitle?: string
  totalPages?: number
  isScannedImageOnly?: boolean
}> {
  const res = await extractFullMaterialContent(fullPath, { maxPagesDefault: 60 })
  if (res.success) {
    if (res.isScannedImageOnly) {
      const outlinePart = res.outlineText ? `\n\n## 原书目录书签\n${res.outlineText}` : ''
      return {
        content: `【检测到纯图片扫描版 PDF（共 ${res.totalPages} 页，未包含内嵌文字层）】\n文件《${path.basename(fullPath)}》已完整保留于书架，可直接点击「原 PDF 预览 / 下载」。\n如需整卷批量提取题目入库，建议使用带 OCR 文字层的 PDF 版本，或使用「智能导入题库 -> 拍照/截图识题」逐页识别。${outlinePart}`,
        subject: res.subject,
        domain: res.domain,
        inferredTitle: res.inferredTitle,
        totalPages: res.totalPages,
        isScannedImageOnly: true
      }
    }

    const combined = res.fullText || res.outlineText || ''
    if (combined.trim().length > 0) {
      return {
        content: combined,
        subject: res.subject,
        domain: res.domain,
        inferredTitle: res.inferredTitle,
        totalPages: res.totalPages,
        isScannedImageOnly: false
      }
    }
  }

  return {
    content: `资料参考书：《${path.basename(fullPath)}》\n暂未能从文件中读取到可识别文字内容，您仍可点击「原 PDF 预览 / 下载」直接查看原件。`,
    totalPages: res.totalPages || 0,
    isScannedImageOnly: Boolean(res.isScannedImageOnly)
  }
}

function robustParseAiJson(rawText: string): any {
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

export const booksRouter = Router()

function getSafeUploadFilename(rawName: string): string {
  let name = rawName
  try {
    const decoded = Buffer.from(rawName, 'latin1').toString('utf8')
    if (decoded !== rawName && !decoded.includes('\ufffd') && (/[\u4e00-\u9fa5]/.test(decoded) || /[ÃÂæçèé]/.test(rawName))) {
      name = decoded
    }
  } catch {}

  const ext = path.extname(name)
  const base = path.basename(name, ext).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim()
  return `${base || 'upload'}${ext}`
}

function findFileInVaultRawDirs(vaultRoot: string, relPath: string): string | null {
  if (!relPath || typeof relPath !== 'string') return null
  const cleanRel = relPath.replace(/\\/g, '/').replace(/^\/+/, '').trim()
  if (!cleanRel || cleanRel.includes('..') || path.isAbsolute(cleanRel)) return null

  const rawDirs = [
    path.resolve(vaultRoot, 'raw-sources'),
    path.resolve(vaultRoot, '06-原始资料库')
  ]

  const candidates: string[] = [
    path.resolve(vaultRoot, cleanRel),
    path.resolve(vaultRoot, 'raw-sources', cleanRel),
    path.resolve(vaultRoot, '06-原始资料库', cleanRel)
  ]

  if (cleanRel.includes('raw-sources')) {
    candidates.push(path.resolve(vaultRoot, cleanRel.replace('raw-sources', '06-原始资料库')))
  }
  if (cleanRel.includes('06-原始资料库')) {
    candidates.push(path.resolve(vaultRoot, cleanRel.replace('06-原始资料库', 'raw-sources')))
  }

  const baseName = path.basename(cleanRel)
  if (baseName && baseName !== '.' && baseName !== '..') {
    candidates.push(
      path.resolve(vaultRoot, 'raw-sources', '408计算机', '经典教材', baseName),
      path.resolve(vaultRoot, '06-原始资料库', '408计算机', '经典教材', baseName),
      path.resolve(vaultRoot, 'raw-sources', '数学', '考研题集', baseName),
      path.resolve(vaultRoot, '06-原始资料库', '数学', '考研题集', baseName)
    )
  }

  for (const candidate of candidates) {
    if (!rawDirs.some(rd => isStrictInside(rd, candidate))) continue
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate
      }
    } catch {}
  }

  return null
}

type ResolvedBookResult =
  | {
      ok: true
      fullPath: string
      actualScope: BookScope
      vaultRoot: string
      relativePathNormalized: string
    }
  | {
      ok: false
      errorStatus: number
      error: string
    }

function resolveBookFile(req: Request, relPath: string, requestedScope?: string): ResolvedBookResult {
  if (!relPath || typeof relPath !== 'string') {
    return { ok: false, errorStatus: 400, error: '缺少资料路径 relativePath' }
  }
  const cleanRel = relPath.replace(/\\/g, '/').replace(/^\/+/, '').trim()
  if (!cleanRel || cleanRel.includes('..') || path.isAbsolute(cleanRel)) {
    return { ok: false, errorStatus: 403, error: '非法资料路径' }
  }

  const user = resolveUserFromReq(req)
  const scope: BookScope | undefined =
    requestedScope === 'personal' || requestedScope === 'shared' ? requestedScope : undefined

  if (scope === 'personal') {
    if (!user) {
      return { ok: false, errorStatus: 401, error: '请先登录账号后再访问个人独享资料' }
    }
    if (user.role === 'admin') {
      const hit = findFileInVaultRawDirs(config.vaultPath, cleanRel)
      if (!hit) return { ok: false, errorStatus: 404, error: '未找到指定参考资料文件' }
      return {
        ok: true,
        fullPath: hit,
        actualScope: 'shared',
        vaultRoot: config.vaultPath,
        relativePathNormalized: path.relative(config.vaultPath, hit).replace(/\\/g, '/')
      }
    }
    const userVault = getUserVaultDir(user.id)
    const hit = findFileInVaultRawDirs(userVault, cleanRel)
    if (!hit) {
      return { ok: false, errorStatus: 404, error: '未在您的个人资料库中找到该文件' }
    }
    return {
      ok: true,
      fullPath: hit,
      actualScope: 'personal',
      vaultRoot: userVault,
      relativePathNormalized: path.relative(userVault, hit).replace(/\\/g, '/')
    }
  }

  if (scope === 'shared') {
    const hit = findFileInVaultRawDirs(config.vaultPath, cleanRel)
    if (!hit) {
      return { ok: false, errorStatus: 404, error: '未在系统公共资料库中找到该文件' }
    }
    return {
      ok: true,
      fullPath: hit,
      actualScope: 'shared',
      vaultRoot: config.vaultPath,
      relativePathNormalized: path.relative(config.vaultPath, hit).replace(/\\/g, '/')
    }
  }

  // 未显式指定 scope 时：登录普通用户优先查个人沙箱，其次查公共共享库
  if (user && user.role !== 'admin') {
    const userVault = getUserVaultDir(user.id)
    const personalHit = findFileInVaultRawDirs(userVault, cleanRel)
    if (personalHit) {
      return {
        ok: true,
        fullPath: personalHit,
        actualScope: 'personal',
        vaultRoot: userVault,
        relativePathNormalized: path.relative(userVault, personalHit).replace(/\\/g, '/')
      }
    }
  }

  const sharedHit = findFileInVaultRawDirs(config.vaultPath, cleanRel)
  if (sharedHit) {
    return {
      ok: true,
      fullPath: sharedHit,
      actualScope: 'shared',
      vaultRoot: config.vaultPath,
      relativePathNormalized: path.relative(config.vaultPath, sharedHit).replace(/\\/g, '/')
    }
  }

  return { ok: false, errorStatus: 404, error: '未找到指定参考资料文件' }
}

// Configure multer for file uploads into raw-sources (管理员入公共库，普通用户入个人独享沙箱)
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const user = resolveUserFromReq(req)
    if (!user) {
      cb(new Error('请先登录账号后再导入资料'), '')
      return
    }

    const domain = normalizeResourceDomain(req.body?.domain as string)
    let category = (req.body?.category as string) || '经典教材'
    if (category === '教材') category = '经典教材'
    if (category === '历年真题') category = '真题'
    if (category === '辅导讲义/精讲') category = '辅导讲义'
    if (category === '模拟测试卷') category = '模拟题'
    if (category === '背诵手册/核心词汇') category = '背诵手册'
    if (category === '作文模板/专题汇编') category = '作文模板'
    if (category === '错题集/复盘笔记') category = '错题笔记'

    const subDir = getSubDirForDomain(domain)
    const safeCategory = category.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || '经典教材'

    const isAdmin = user.role === 'admin'
    if (!isAdmin) {
      ensureUserSandboxSync(user.id, user.username)
    }
    const targetVaultRoot = isAdmin ? config.vaultPath : getUserVaultDir(user.id)
    const fullDest = path.join(targetVaultRoot, 'raw-sources', subDir, safeCategory)

    try {
      if (!fs.existsSync(fullDest)) {
        fs.mkdirSync(fullDest, { recursive: true })
      }
      cb(null, fullDest)
    } catch (err: any) {
      cb(err, fullDest)
    }
  },
  filename: (_req, file, cb) => {
    cb(null, getSafeUploadFilename(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 } // 1GB (1024MB) limit
})

export interface BookItem {
  id: string
  name: string
  relativePath: string
  fullPath: string
  domain: ResourceDomain
  category: string
  size: number
  ext: string
  lastModified: string
  isTextReadable: boolean
  isPdf: boolean
  isHtml: boolean
  fileType: 'pdf' | 'html' | 'handout' | 'paper' | 'text'
  scope: BookScope
  canManage: boolean
  ownerName: string
  extractedInfo?: {
    isExtracted: boolean
    isScannedImageOnly?: boolean
    noteTitle?: string
    notePath?: string
    questionCount?: number
    lastExtracted?: string
    mode?: 'concept' | 'question' | 'dual'
  }
}


/**
 * Scan raw-sources directory for reference books, past papers and materials
 * - 系统管理员 (admin): 仅读取与管理公共共享资料库 (config.vaultPath)
 * - 普通用户 (student / editor): 读取个人独享资料库 (个人沙箱 raw-sources) + 系统公共共享资料库
 * - 未登录访客: 仅可只读查看系统公共共享资料库
 */
booksRouter.get('/books/list', (req, res) => {
  try {
    const user = resolveUserFromReq(req)
    const isAdmin = user?.role === 'admin'
    const isLoggedInRegular = Boolean(user && !isAdmin)

    ensureRawSourcesInitialized(config.vaultPath)

    const recordVaultRoot = isLoggedInRegular ? getUserVaultDir(user!.id) : config.vaultPath
    const extractionsRecord = loadExtractionsRecord(recordVaultRoot)
    const readableExts = new Set(['.md', '.txt', '.markdown'])
    const books: BookItem[] = []

    function scanScope(
      vaultRoot: string,
      candidateDirs: string[],
      scope: BookScope,
      canManage: boolean,
      ownerName: string
    ) {
      const seenNames = new Set<string>()
      const scopeBooks: BookItem[] = []

      function scan(dir: string) {
        if (!fs.existsSync(dir)) return
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          if (entry.isDirectory()) {
            scan(fullPath)
          } else if (entry.isFile()) {
            if (entry.name.startsWith('.')) continue
            if (seenNames.has(entry.name)) continue
            seenNames.add(entry.name)

            const ext = path.extname(entry.name).toLowerCase()
            const stat = fs.statSync(fullPath)
            const relPath = path.relative(vaultRoot, fullPath).replace(/\\/g, '/')

            const domain: ResourceDomain = inferDomainFromPathOrName(relPath)

            let category = '辅导讲义'
            if (relPath.includes('真题')) category = '历年真题'
            else if (relPath.includes('教材')) category = '经典教材'
            else if (relPath.includes('交互课件') || ext === '.html') category = '交互课件'
            else if (relPath.includes('辅导讲义') || relPath.includes('讲义')) category = '辅导讲义'
            else if (relPath.includes('模拟题')) category = '模拟题卷'
            else if (relPath.includes('背诵手册')) category = '背诵手册'
            else if (relPath.includes('作文模板')) category = '作文模板'
            else if (relPath.includes('错题笔记')) category = '错题笔记'

            const isPdf = ext === '.pdf'
            const isHtml = ext === '.html' || ext === '.htm'
            const isText = readableExts.has(ext) || isPdf || isHtml

            let fileType: 'pdf' | 'html' | 'handout' | 'paper' | 'text' = 'text'
            if (isPdf) fileType = 'pdf'
            else if (isHtml) fileType = 'html'
            else if (ext === '.md') fileType = 'handout'

            const savedExtracted = getExtractionRecordForBook(extractionsRecord, scope, relPath)

            scopeBooks.push({
              id: `${scope}:${relPath}`,
              name: entry.name,
              relativePath: relPath,
              fullPath: isAdmin ? fullPath : '',
              domain,
              category,
              size: stat.size,
              ext,
              lastModified: stat.mtime.toISOString(),
              isTextReadable: isText,
              isPdf,
              isHtml,
              fileType,
              scope,
              canManage,
              ownerName,
              extractedInfo: savedExtracted ? {
                isExtracted: savedExtracted.isExtracted !== false,
                isScannedImageOnly: Boolean(savedExtracted.isScannedImageOnly),
                noteTitle: savedExtracted.noteTitle,
                notePath: savedExtracted.notePath || savedExtracted.savedNotePath,
                questionCount: Number(savedExtracted.questionCount ?? savedExtracted.questionsCount ?? 0),
                lastExtracted: savedExtracted.updatedAt,
                mode: savedExtracted.mode
              } : undefined
            })
          }
        }
      }

      for (const d of candidateDirs) {
        scan(d)
      }

      // 按最后修改时间倒序，最新上传的资料排在前面
      scopeBooks.sort((a, b) => b.lastModified.localeCompare(a.lastModified))
      books.push(...scopeBooks)
    }

    if (isLoggedInRegular && user) {
      const userVault = getUserVaultDir(user.id)
      const userRawDir = path.join(userVault, 'raw-sources')
      if (fs.existsSync(userRawDir)) {
        scanScope(
          userVault,
          [userRawDir],
          'personal',
          true,
          user.displayName || user.username
        )
      }
    }

    scanScope(
      config.vaultPath,
      [
        path.join(config.vaultPath, 'raw-sources'),
        path.join(config.vaultPath, '06-原始资料库')
      ],
      'shared',
      isAdmin,
      '系统管理员'
    )

    res.json({ books })
  } catch (err: any) {
    console.error('Failed to list books:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * Raw file stream endpoint for PDF and HTML preview
 */
booksRouter.get('/books/raw', (req, res) => {
  try {
    const relPath = (req.query.path as string) || ''
    const requestedScope = (req.query.scope as string) || undefined
    if (!relPath) {
      res.status(400).json({ error: 'Missing path parameter' })
      return
    }

    const resolved = resolveBookFile(req, relPath, requestedScope)
    if (!resolved.ok) {
      res.status(resolved.errorStatus).json({ error: resolved.error })
      return
    }
    const { fullPath } = resolved

    const ext = path.extname(fullPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.html': 'text/html; charset=utf-8',
      '.htm': 'text/html; charset=utf-8',
      '.md': 'text/markdown; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    }

    const contentType = mimeTypes[ext] || 'application/octet-stream'
    const stat = fs.statSync(fullPath)
    const fileSize = stat.size
    const range = req.headers.range
    const baseFilename = path.basename(fullPath)
    const asciiFallback = baseFilename.replace(/[^\x20-\x7E]/g, '_') || `document${ext}`

    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    res.setHeader('X-Accel-Buffering', 'no')
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(baseFilename)}`
    )

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

      if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || start >= fileSize || end >= fileSize || start > end) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end()
        return
      }

      const chunkSize = (end - start) + 1
      const stream = fs.createReadStream(fullPath, { start, end })
      stream.on('error', (streamErr) => {
        if (!res.headersSent) res.status(500).json({ error: streamErr.message })
        else res.end()
      })
      res.status(206)
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`)
      res.setHeader('Content-Length', chunkSize)
      stream.pipe(res)
    } else {
      res.setHeader('Content-Length', fileSize)
      const stream = fs.createReadStream(fullPath)
      stream.on('error', (streamErr) => {
        if (!res.headersSent) res.status(500).json({ error: streamErr.message })
        else res.end()
      })
      stream.pipe(res)
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

const PERSONAL_QUOTA_BYTES = 1.5 * 1024 * 1024 * 1024 // 普通用户个人独享空间上限 1.5GB

/**
 * Upload reference book / notes into raw-sources
 * - 管理员上传：存入系统公共资料库 (shared)
 * - 普通用户上传：存入其个人独享沙箱 (personal)，受 1.5GB 配额保护
 */
booksRouter.post('/books/upload', (req, res, next) => {
  const user = resolveUserFromReq(req)
  if (!user) {
    res.status(401).json({ error: '请先登录账号后再导入 PDF 或参考资料' })
    return
  }

  if (user.role !== 'admin') {
    const userRawDir = path.join(getUserVaultDir(user.id), 'raw-sources')
    const usedBytes = getDirectorySizeBytes(userRawDir)
    if (usedBytes >= PERSONAL_QUOTA_BYTES) {
      res.status(413).json({
        error: `您的个人独享资料库已达 1.5GB 容量上限（当前已用 ${(usedBytes / (1024 * 1024)).toFixed(0)} MB），请先清理旧文件后再上传`
      })
      return
    }
  }

  upload.single('file')(req, res, (err: any) => {
    if (err) {
      console.error('[Books Upload Multer Error]:', err)
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: '上传文件过大（超过系统限制 1GB）' })
        }
        return res.status(400).json({ error: `上传文件解析失败: ${err.message}` })
      }
      return res.status(500).json({ error: `文件持久化保存失败: ${err.message || '系统写入错误'}` })
    }
    next()
  })
}, (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: '请先登录账号后再导入资料' })
      return
    }
    if (!req.file) {
      res.status(400).json({ error: '未接收到上传的文件内容（请确认未手动覆盖 Content-Type 请求头）' })
      return
    }
    if (req.file.size === 0) {
      try { fs.unlinkSync(req.file.path) } catch {}
      res.status(400).json({ error: '上传的文件内容为空（0 字节），请重新选择有效的资料文件' })
      return
    }

    const isAdmin = req.user.role === 'admin'
    const scope: BookScope = isAdmin ? 'shared' : 'personal'
    const vaultRoot = isAdmin ? config.vaultPath : getUserVaultDir(req.user.id)
    const safeName = getSafeUploadFilename(req.file.originalname)
    const relPath = path.relative(vaultRoot, req.file.path).replace(/\\/g, '/')

    // 智能后台线性化优化：若是 PDF 且服务端有 qpdf，转换为 Fast Web View 线性化结构实现首屏秒开
    if (req.file.path.toLowerCase().endsWith('.pdf')) {
      const savedPdfPath = req.file.path
      const tmpLinearized = savedPdfPath + '.linearized.tmp'
      execFile('qpdf', ['--linearize', savedPdfPath, tmpLinearized], (qpdfErr) => {
        if (!qpdfErr && fs.existsSync(tmpLinearized)) {
          try {
            fs.renameSync(tmpLinearized, savedPdfPath)
            console.log(`[QPDF Linearized OK]: ${path.basename(savedPdfPath)}`)
          } catch {}
        } else if (fs.existsSync(tmpLinearized)) {
          try { fs.unlinkSync(tmpLinearized) } catch {}
        }
      })
    }

    invalidateCache(req.user.id)
    res.json({
      success: true,
      file: {
        id: `${scope}:${relPath}`,
        name: safeName,
        relativePath: relPath,
        size: req.file.size,
        scope,
        canManage: true,
        ownerName: isAdmin ? '系统管理员' : (req.user.displayName || req.user.username)
      }
    })
  } catch (err: any) {
    console.error('Upload book error:', err.message)
    res.status(500).json({ error: err.message || '上传处理异常' })
  }
})

/**
 * Delete a reference material from raw-sources
 */
booksRouter.delete('/books/delete', (req, res) => {
  try {
    const user = resolveUserFromReq(req)
    if (!user) {
      res.status(401).json({ error: '请先登录账号后再管理资料' })
      return
    }

    const { relativePath, scope } = req.body as { relativePath: string; scope?: BookScope }
    if (!relativePath) {
      res.status(400).json({ error: '缺少待删除的资料路径 relativePath' })
      return
    }

    const resolved = resolveBookFile(req, relativePath, scope)
    if (!resolved.ok) {
      res.status(resolved.errorStatus).json({ error: resolved.error })
      return
    }

    if (resolved.actualScope === 'shared' && user.role !== 'admin') {
      res.status(403).json({ error: '权限受限：系统公共资料仅管理员可删除，您只可管理自己导入的个人资料' })
      return
    }

    const { fullPath, actualScope, vaultRoot, relativePathNormalized } = resolved
    fs.unlinkSync(fullPath)
    removeOrRenameExtractionRecord(vaultRoot, actualScope, relativePathNormalized)
    invalidateCache(user.id)

    res.json({
      success: true,
      message: `资料《${path.basename(fullPath)}》已安全删除`
    })
  } catch (err: any) {
    console.error('Delete book error:', err.message)
    res.status(500).json({ error: err.message || '删除资料失败' })
  }
})

/**
 * Rename a reference material within raw-sources
 */
booksRouter.post('/books/rename', (req, res) => {
  try {
    const user = resolveUserFromReq(req)
    if (!user) {
      res.status(401).json({ error: '请先登录账号后再重命名资料' })
      return
    }

    const { relativePath, newName, scope } = req.body as { relativePath: string; newName: string; scope?: BookScope }
    if (!relativePath || !newName || !newName.trim()) {
      res.status(400).json({ error: '缺少相对路径 relativePath 或新名称 newName' })
      return
    }

    const resolved = resolveBookFile(req, relativePath, scope)
    if (!resolved.ok) {
      res.status(resolved.errorStatus).json({ error: resolved.error })
      return
    }

    if (resolved.actualScope === 'shared' && user.role !== 'admin') {
      res.status(403).json({ error: '权限受限：系统公共资料仅管理员可重命名，您只可修改自己导入的个人资料' })
      return
    }

    const { fullPath, actualScope, vaultRoot, relativePathNormalized } = resolved
    const rawDirs = [
      path.resolve(vaultRoot, 'raw-sources'),
      path.resolve(vaultRoot, '06-原始资料库')
    ]

    const oldExt = path.extname(fullPath)
    let cleanNewName = newName.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    if (!path.extname(cleanNewName)) {
      cleanNewName = `${cleanNewName}${oldExt}`
    }

    const targetDir = path.dirname(fullPath)
    const newFullPath = path.join(targetDir, cleanNewName)

    if (!rawDirs.some(rd => isStrictInside(rd, newFullPath))) {
      res.status(403).json({ error: '新文件名越界' })
      return
    }

    if (fullPath.toLowerCase() === newFullPath.toLowerCase()) {
      if (fullPath !== newFullPath) {
        const tempPath = path.join(targetDir, `_temp_ren_${Date.now()}_${cleanNewName}`)
        fs.renameSync(fullPath, tempPath)
        fs.renameSync(tempPath, newFullPath)
      }
      const sameRelPath = path.relative(vaultRoot, newFullPath).replace(/\\/g, '/')
      removeOrRenameExtractionRecord(vaultRoot, actualScope, relativePathNormalized, sameRelPath)
      res.json({
        success: true,
        message: '文件名未变动',
        newName: cleanNewName,
        newRelativePath: sameRelPath
      })
      return
    }

    if (fs.existsSync(newFullPath)) {
      res.status(400).json({ error: `同名文件《${cleanNewName}》已存在，请换一个名称` })
      return
    }

    fs.renameSync(fullPath, newFullPath)
    invalidateCache(user.id)

    const newRelPath = path.relative(vaultRoot, newFullPath).replace(/\\/g, '/')
    removeOrRenameExtractionRecord(vaultRoot, actualScope, relativePathNormalized, newRelPath)
    res.json({
      success: true,
      message: `资料已成功重命名为《${cleanNewName}》`,
      newName: cleanNewName,
      newRelativePath: newRelPath
    })
  } catch (err: any) {
    console.error('Rename book error:', err.message)
    res.status(500).json({ error: err.message || '重命名资料失败' })
  }
})

/**
 * AI 智能提炼/规范化书名
 */
booksRouter.post('/books/suggest-name', async (req, res) => {
  try {
    const user = resolveUserFromReq(req)
    if (!user) {
      res.status(401).json({ error: '请先登录账号' })
      return
    }

    const { relativePath, scope } = req.body as { relativePath: string; scope?: BookScope }
    const resolved = resolveBookFile(req, relativePath, scope)
    if (!resolved.ok) {
      res.status(resolved.errorStatus).json({ error: resolved.error })
      return
    }
    if (resolved.actualScope === 'shared' && user.role !== 'admin') {
      res.status(403).json({ error: '仅管理员可修改系统公共资料名称' })
      return
    }
    const { fullPath } = resolved

    const ext = path.extname(fullPath).toLowerCase()
    const baseName = path.basename(fullPath, ext)

    // 启发式快速清理规则：先快速清除哈希串和时间戳后缀
    let heuristicClean = baseName
      .replace(/_\d+_\d+$/, '') // 清理形如 _0_1789638287768
      .replace(/^[0-9a-f]{16,}_?/i, '') // 清理开头的长 hash
      .replace(/^(\d{10,}_\w+)/, '') // 清理开头的纯长数字加小写串
      .replace(/^[0-9]+[_\s-]+/, '') // 清理开头的序号如 3_、12-
      .trim()

    // 若原名是纯散列长数字或过短无意义，先利用大纲推断出的书名
    const isMessyName = /^[0-9a-f]{16,}/i.test(baseName) || /^\d{10,}/.test(baseName) || !heuristicClean || heuristicClean.length < 3
    let suggestedName = (!isMessyName && heuristicClean) ? heuristicClean : baseName

    const extracted = await extractContentFromMaterial(fullPath).catch(() => null)
    if (extracted?.inferredTitle) {
      if (isMessyName || suggestedName === baseName) {
        suggestedName = extracted.inferredTitle
        heuristicClean = extracted.inferredTitle
      }
    }

    const client = anthropic
    const model = config.ai?.model || 'deepseek-flash'

    if (client) {
      try {
        const sample = (extracted?.content || '').slice(0, 3000)
        const prompt = `请分析以下学习资料的内容和原始文件名，为该资料提炼一个规范、易读、简短的中文教材/课件书名（不要加扩展名，不要加多余修饰或引号，字数在6~25字之间）。
原始文件名: ${baseName}
资料前文节选:
${sample}

请只直接输出书名本身，不要输出任何其他说明或标点符号。例如：“2026王道计算机操作系统考研复习指导” 或 “408计算机统考高频考点必背手册”。`

        const aiRes: any = await client.messages.create({
          model,
          max_tokens: 64,
          system: '你是一个专业的考研与学科图书归档助手，只输出规范的书名字符串。',
          messages: [{ role: 'user', content: prompt }],
        })

        let raw = ''
        if (Array.isArray(aiRes.content)) {
          const t = aiRes.content.find((c: any) => c.type === 'text')
          raw = t?.text || aiRes.content[0]?.text || ''
        } else if (typeof aiRes.content === 'string') {
          raw = aiRes.content
        }
        const cleanAi = raw.replace(/[《》"'\n\r]/g, '').trim()
        if (cleanAi && cleanAi.length >= 3 && cleanAi.length <= 40) {
          suggestedName = cleanAi
        }
      } catch (aiErr: any) {
        console.warn('[AI suggest name error]:', aiErr.message)
      }
    }

    res.json({
      success: true,
      suggestedName: `${suggestedName}${ext}`,
      heuristicName: `${heuristicClean}${ext}`,
      ext
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '智能提炼书名失败' })
  }
})

/**
 * Read text content / TOC summary from any reference material (PDF, Markdown, HTML, TXT)
 */
booksRouter.post('/books/read', async (req, res) => {
  try {
    const { relativePath, scope } = req.body as { relativePath: string; scope?: BookScope }
    const resolved = resolveBookFile(req, relativePath, scope)
    if (!resolved.ok) {
      res.status(resolved.errorStatus).json({ error: resolved.error })
      return
    }
    const { fullPath } = resolved

    const extracted = await extractContentFromMaterial(fullPath)
    res.json({
      content: extracted.content,
      name: path.basename(fullPath),
      subject: extracted.subject,
      domain: extracted.domain,
      totalPages: extracted.totalPages || 0,
      isScannedImageOnly: Boolean(extracted.isScannedImageOnly)
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * 快速探测参考资料元信息（总页数、书签大纲、是否为纯图片扫描件）
 */
booksRouter.post('/books/inspect', async (req, res) => {
  try {
    const { relativePath, scope } = req.body as { relativePath: string; scope?: BookScope }
    const resolved = resolveBookFile(req, relativePath, scope)
    if (!resolved.ok) {
      res.status(resolved.errorStatus).json({ error: resolved.error })
      return
    }
    const { fullPath, actualScope, relativePathNormalized } = resolved
    const isPdf = fullPath.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      const stat = fs.statSync(fullPath)
      res.json({
        success: true,
        isPdf: false,
        scope: actualScope,
        relativePath: relativePathNormalized,
        totalPages: 1,
        fileSizeBytes: stat.size,
        outlineTitles: [],
        isScannedImageOnly: false
      })
      return
    }

    const info = await inspectPdfFile(fullPath)
    res.json({
      ...info,
      isPdf: true,
      scope: actualScope,
      relativePath: relativePathNormalized
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '资料探测失败' })
  }
})

/**
 * 提交全卷分片异步扫描入库任务（后台排队串行执行，不阻塞手机/浏览器连接）
 */
booksRouter.post('/books/scan-start', (req, res) => {
  try {
    const user = resolveUserFromReq(req)
    if (!user) {
      res.status(401).json({ error: '请先登录账号后再发起扫描解析' })
      return
    }
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const {
      relativePath,
      scope,
      domain: clientDomain,
      subject: clientSubject,
      mode = 'question',
      startPage,
      endPage,
      maxChunks
    } = req.body as {
      relativePath: string
      scope?: BookScope
      domain?: ResourceDomain
      subject?: string
      mode?: ScanExtractMode
      startPage?: number
      endPage?: number
      maxChunks?: number
    }

    const resolved = resolveBookFile(req, relativePath, scope)
    if (!resolved.ok) {
      res.status(resolved.errorStatus).json({ error: resolved.error })
      return
    }

    const { fullPath, actualScope, relativePathNormalized } = resolved
    const bookName = path.basename(fullPath)
    const inferredMeta = inferDomainAndSubjectFromText(relativePathNormalized, bookName)
    const domain: ResourceDomain = clientDomain || inferredMeta.domain || inferDomainFromPathOrName(fullPath)
    const subject = clientSubject || (inferredMeta.domain === domain ? inferredMeta.subject : getDefaultSubjectForDomain(domain))
    const vaultRoot = getRequestVaultPath(req)

    const task = enqueueBookScanTask({
      userId: user.id,
      vaultRoot,
      scope: actualScope,
      relativePath: relativePathNormalized,
      fullPath,
      bookName,
      domain,
      subject,
      mode,
      startPage: startPage && Number(startPage) > 0 ? Number(startPage) : undefined,
      endPage: endPage && Number(endPage) > 0 ? Number(endPage) : undefined,
      maxChunks: maxChunks && Number(maxChunks) > 0 ? Math.min(Number(maxChunks), 80) : 24
    })

    res.json({ success: true, task })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '发起后台扫描任务失败' })
  }
})

/**
 * 查询指定扫描任务实时进度
 */
booksRouter.get('/books/scan-status/:taskId', (req, res) => {
  const user = resolveUserFromReq(req)
  if (!user) {
    res.status(401).json({ error: '请先登录账号' })
    return
  }
  const task = getBookScanTask(req.params.taskId, user.id)
  if (!task) {
    res.status(404).json({ error: '未找到对应扫描任务或无权查看' })
    return
  }
  res.json({ success: true, task })
})

/**
 * 查询当前用户最近的后台扫描任务列表
 */
booksRouter.get('/books/scan-tasks', (req, res) => {
  const user = resolveUserFromReq(req)
  if (!user) {
    res.status(401).json({ error: '请先登录账号' })
    return
  }
  res.json({ success: true, tasks: listBookScanTasksForUser(user.id) })
})

/**
 * AI Extract: Read content, extract core concepts to wiki note, and generate practice questions
 */
booksRouter.post('/books/extract-ai', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const { text, bookName, domain: rawDomain, subject } = req.body as {
      text: string
      bookName?: string
      domain: ResourceDomain
      subject?: string
    }
    const inferredFromText = inferDomainAndSubjectFromText(text, bookName || '')
    const domain = rawDomain ? normalizeResourceDomain(rawDomain) : inferredFromText.domain
    const domainDisplay = getDomainDisplayName(domain)
    const wikiDomainDir = getWikiDomainDir(domain)
    const defaultSubject = subject || (inferredFromText.domain === domain ? inferredFromText.subject : getDefaultSubjectForDomain(domain))

    if (!text || text.trim().length < 10) {
      res.status(400).json({ error: '提取内容过短，请输入或提供有效的材料文本' })
      return
    }

    const prompt = `你是一个深谙全国硕士研究生招生考试（408计算机综合、考研数学、考研英语、考研政治及专业课）的顶级名师与命题专家。
请深度阅读以下提供的教材/真题/讲义文本片段，完成两项核心任务：

【输入资料】：
来源参考书：${bookName || '考研参考资料'}
学科领域：${domainDisplay}（${defaultSubject}）
文本内容：
"""
${text.slice(0, 6000)}
"""

【任务要求】：
1. 提炼 1 篇符合规范的高质量 Obsidian 知识库笔记 Markdown。
   - 包含准确的 YAML frontmatter (type: theorem / concept, tags, created)
   - 严谨的知识点讲解，数学公式必须使用标准的 KaTeX LaTeX 格式（行内 $...$，独立公式块 $$...$$）；英语资料提炼核心长难句语法结构、高频词汇搭配与解题逻辑；政治资料提炼核心原理、历史脉络、辨析易混点与时政得分点
   - 标注考研重难点、直观理解与典型易错点
2. 根据提炼的核心考点，命制 3 道高质量真题风格的选择题或填空题。
   - 每题必须包含：question, type (choice / blank), options (A, B, C, D 选项，如果是选择题), answer (正确答案), explanation (分步深度推导), difficulty (简单/中等/困难)

请严格输出合法的 JSON 格式，不要添加任何 markdown 代码块标记以外的杂质：
{
  "note": {
    "title": "笔记标题（不含扩展名）",
    "suggestedPath": "wiki/${wikiDomainDir}/${defaultSubject}/xxx.md",
    "content": "完整的 Markdown 笔记正文（含frontmatter）"
  },
  "questions": [
    {
      "id": "gen-${Date.now()}-1",
      "domain": "${domain}",
      "subject": "${defaultSubject}",
      "chapter": "提炼的章节名",
      "type": "choice",
      "difficulty": "中等",
      "question": "题干（支持LaTeX公式 $...$）",
      "options": {
        "A": "选项A内容",
        "B": "选项B内容",
        "C": "选项C内容",
        "D": "选项D内容"
      },
      "answer": "A",
      "explanation": "深度标准解析与考点推导",
      "tags": ["考研真题", "${defaultSubject}"]
    }
  ]
}`

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 8192,
      system: '你是一个严格输出结构化 JSON 的考研知识提炼引擎。必须只输出纯 JSON 对象，格式必须符合要求，严禁包含任何前缀闲聊。',
      messages: [{ role: 'user', content: prompt }]
    })

    const textBlock = aiRes.content.find((c: any) => c.type === 'text' && 'text' in c) as { type: 'text'; text: string } | undefined
    const rawText = textBlock ? textBlock.text : '{}'
    
    // Parse JSON
    let parsed: any = {}
    try {
      parsed = robustParseAiJson(rawText)
    } catch (parseErr: any) {
      console.error('Failed to parse AI extraction JSON:', parseErr.message, rawText)
      res.status(500).json({ error: 'AI 响应解析失败，请重试', raw: rawText })
      return
    }

    // Automatically save note to user's Vault if requested
    let savedNotePath = ''
    const userVault = getRequestVaultPath(req)
    if (parsed.note && parsed.note.suggestedPath && parsed.note.content) {
      try {
        const destPath = parsed.note.suggestedPath
        createFile(userVault, destPath, parsed.note.content)
        markSelfWrite(destPath)
        invalidateCache(req.user?.id)
        savedNotePath = destPath
      } catch (saveErr: any) {
        console.warn('Note write warn:', saveErr.message)
      }
    }

    const questions = parsed.questions || []
    if (questions.length > 0) {
      appendCustomQuestions(questions, req)
    }

    res.json({
      success: true,
      note: parsed.note,
      questions,
      savedNotePath
    })
  } catch (err: any) {
    console.error('AI book extract error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * Fully automated book parsing, concept extraction, note persistence & quiz question ingestion
 * 已升级为全卷多页分片真题全量抽取引擎，取消 4~5 题数量上限
 */
booksRouter.post('/books/auto-extract', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const {
      relativePath,
      scope,
      domain: clientDomain,
      subject: clientSubject,
      customText,
      mode: clientMode,
      startPage,
      endPage
    } = req.body as {
      relativePath: string
      scope?: BookScope
      domain?: ResourceDomain
      subject?: string
      customText?: string
      mode?: 'concept' | 'question' | 'dual'
      startPage?: number
      endPage?: number
    }

    const mode: ScanExtractMode = clientMode || 'dual'

    const resolved = resolveBookFile(req, relativePath, scope)
    if (!resolved.ok) {
      res.status(resolved.errorStatus).json({ error: resolved.error })
      return
    }
    const { fullPath, actualScope, relativePathNormalized } = resolved
    const bookName = path.basename(fullPath)
    const userVaultRoot = getRequestVaultPath(req)

    const cleanCustomText = (customText || '').trim()
    if (cleanCustomText.length >= 20) {
      // 用户手工选段或传入自定义长文本时，直接全量抽取真实题目（不限制 4~5 道）
      const inferred = inferDomainAndSubjectFromText(cleanCustomText, bookName)
      const domain = clientDomain || inferred.domain
      const subject = clientSubject || inferred.subject

      const prompt = `你是一个精通全国硕士研究生考试（${getDomainDisplayName(domain)} - ${subject}）的真题与教材解析专家。
请完整提取以下参考文本中出现的所有真题/例题/模拟题，并生成一篇简明知识笔记：
1. **文本中出现多少道真实题目就全部提取多少道**（支持单选、多选、填空、计算解答题，绝对不要人为截断为 4~5 题）；
2. 若原文没有完整答案与解析，请补充严谨步骤并在解析前注明“【参考解析】”；
3. 所有公式必须使用标准 KaTeX LaTeX（$...$ 或 $$...$$）；若原文无具体题目且为纯概念讲义，questions 返回空数组或至多 2 道核心概念辨析题。

【资料名称】：${bookName}
【待分析正文】：
"""
${cleanCustomText.slice(0, 12000)}
"""

请严格只输出合法 JSON 对象：
{
  "questions": [
    {
      "domain": "${domain}",
      "subject": "${subject}",
      "chapter": "对应章节或专题",
      "type": "choice",
      "difficulty": "中等",
      "question": "题干内容",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "answer": "A",
      "explanation": "分步推导",
      "tags": ["${subject}", "资料导入"]
    }
  ],
  "note": {
    "title": "${bookName.replace(/\.[^.]+$/, '')}_核心考点精讲",
    "suggestedPath": "wiki/${getWikiDomainDir(domain)}/${subject}/${bookName.replace(/\.[^.]+$/, '')}_核心考点精讲.md",
    "content": "完整的 Obsidian Markdown 笔记（含 YAML frontmatter）"
  }
}`

      const model = config.ai?.model || 'deepseek-flash'
      const aiRes: any = await anthropic.messages.create({
        model,
        max_tokens: 8192,
        system: '你是高精度考研题库与知识抽取引擎。必须只输出严格合法的 JSON。',
        messages: [{ role: 'user', content: prompt }]
      })
      const rawText = Array.isArray(aiRes.content)
        ? (aiRes.content.find((c: any) => c.type === 'text')?.text || aiRes.content[0]?.text || '{}')
        : (typeof aiRes.text === 'string' ? aiRes.text : '{}')
      const parsed = robustParseAiJson(rawText) || {}
      const directQs = extractQuizQuestionsFromRawText(cleanCustomText, bookName, domain, subject)
      const mergedQs = Array.isArray(parsed.questions) && parsed.questions.length >= directQs.length
        ? parsed.questions
        : directQs

      let savedNotePath = ''
      if (parsed.note?.content) {
        try {
          const cleanTitle = (parsed.note.title || `${bookName.replace(/\.[^.]+$/, '')}_考点精讲`).replace(/[\\/:*?"<>|]/g, '_')
          const destPath = `wiki/${getWikiDomainDir(domain)}/${subject}/${cleanTitle}.md`
          createFile(userVaultRoot, destPath, parsed.note.content)
          markSelfWrite(destPath)
          invalidateCache(req.user?.id)
          savedNotePath = destPath
        } catch {}
      }

      if (mergedQs.length > 0) {
        appendCustomQuestions(mergedQs, req)
      }
      saveExtractionRecord(userVaultRoot, actualScope, relativePathNormalized, {
        isExtracted: true,
        noteTitle: parsed.note?.title,
        notePath: savedNotePath,
        questionCount: mergedQs.length,
        mode
      })

      res.json({
        success: true,
        note: parsed.note,
        questions: mergedQs,
        savedNotePath,
        questionsCount: mergedQs.length,
        domain,
        subject
      })
      return
    }

    // 针对整本 PDF/资料文件：运行全卷分片真实提题引擎
    const inferredMeta = inferDomainAndSubjectFromText(relativePathNormalized, bookName)
    const domain: ResourceDomain = clientDomain || inferredMeta.domain || inferDomainFromPathOrName(fullPath)
    const subject = clientSubject || (inferredMeta.domain === domain ? inferredMeta.subject : getDefaultSubjectForDomain(domain))

    const result = await executeBookScanJob({
      userId: req.user?.id || 'anonymous',
      vaultRoot: userVaultRoot,
      scope: actualScope,
      relativePath: relativePathNormalized,
      fullPath,
      bookName,
      domain,
      subject,
      mode,
      startPage: startPage && Number(startPage) > 0 ? Number(startPage) : undefined,
      endPage: endPage && Number(endPage) > 0 ? Number(endPage) : undefined,
      maxChunks: 16
    })

    res.json({
      success: result.success,
      isScannedImageOnly: result.isScannedImageOnly,
      totalPages: result.totalPages,
      scannedPageRange: result.scannedPageRange,
      note: result.note,
      questions: result.questions,
      savedNotePath: result.savedNotePath,
      questionsCount: result.questionsCount,
      newlyAddedCount: result.newlyAddedCount,
      warningMessage: result.warningMessage,
      domain,
      subject
    })
  } catch (err: any) {
    console.error('Auto extract error:', err.message)
    res.status(500).json({ error: err.message || '自动分析提取异常' })
  }
})

/**
 * 批量自动解析教材/真题并归类入库（全部纳入后台串行队列执行，保护服务器内存）
 */
booksRouter.post('/books/batch-auto-extract', async (req, res) => {
  try {
    const user = resolveUserFromReq(req)
    if (!user) {
      res.status(401).json({ error: '请先登录账号后再执行批量解析' })
      return
    }
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const { items } = req.body as {
      items: Array<{ relativePath: string; scope?: BookScope; mode?: 'concept' | 'question' | 'dual' }>
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: '请提供待解析的教材列表 items' })
      return
    }

    const userVault = getRequestVaultPath(req)
    const results: any[] = []
    for (const item of items) {
      const resolved = resolveBookFile(req, item.relativePath, item.scope)
      if (!resolved.ok) {
        results.push({ relativePath: item.relativePath, success: false, error: resolved.error })
        continue
      }
      const { fullPath, actualScope, relativePathNormalized } = resolved
      const bookName = path.basename(fullPath)
      const domain: ResourceDomain = inferDomainFromPathOrName(fullPath)
      const subject = getDefaultSubjectForDomain(domain)

      const task = enqueueBookScanTask({
        userId: user.id,
        vaultRoot: userVault,
        scope: actualScope,
        relativePath: relativePathNormalized,
        fullPath,
        bookName,
        domain,
        subject,
        mode: item.mode || 'dual',
        maxChunks: 16
      })

      results.push({
        relativePath: item.relativePath,
        success: true,
        queued: true,
        taskId: task.taskId,
        noteTitle: `${bookName.replace(/\.[^.]+$/, '')}_全卷解析与题库精粹`,
        questionCount: 0
      })
    }

    invalidateCache(req.user?.id)
    res.json({
      success: true,
      queued: true,
      count: results.filter(r => r.success).length,
      results
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * 获取书籍/资料的完整分级章节目录树（含精准起止页码与习题页分布）
 */
booksRouter.post('/books/outline', async (req, res) => {
  try {
    const { relativePath, scope } = req.body as { relativePath: string; scope?: BookScope }
    const resolved = resolveBookFile(req, relativePath, scope)
    if (!resolved.ok) {
      res.status(resolved.errorStatus).json({ error: resolved.error })
      return
    }
    const { fullPath } = resolved

    const bookName = path.basename(fullPath)
    const isPdf = fullPath.toLowerCase().endsWith('.pdf')

    // 优先调用新引擎提取章节和页码跨度
    let deepData: any = null
    if (isPdf) {
      deepData = await runBookContentExtractor(fullPath, 'outline')
    }

    if (deepData && deepData.success && Array.isArray(deepData.chapters) && deepData.chapters.length > 0) {
      const domain: ResourceDomain = inferDomainFromPathOrName(fullPath)
      const subject = getDefaultSubjectForDomain(domain)

      res.json({
        success: true,
        bookName,
        inferredTitle: deepData.bookName || bookName,
        domain,
        subject,
        totalPages: deepData.totalPages,
        totalChapters: deepData.chapters.length,
        chapters: deepData.chapters.map((c: any) => ({
          id: c.id,
          title: c.title,
          startPage: c.startPage,
          endPage: c.endPage,
          pageCount: c.pageCount,
          subSections: c.subSections || [],
          exercisePagesCount: c.exercisePages?.length || 0,
          rawContent: `页码范围: 第 ${c.startPage + 1} 页 ~ 第 ${c.endPage + 1} 页 (共 ${c.pageCount} 页)\n习题精选页码: ${c.exercisePages?.map((p: number) => `第${p+1}页`).join(', ') || '包含于章节内'}`
        })),
        fullOutline: `全书共 ${deepData.totalPages} 页，成功定位 ${deepData.chapters.length} 大核心考研大章与习题分布。`
      })
      return
    }

    // 回退到常规大纲提取
    const extracted = await extractContentFromMaterial(fullPath)
    const chapters = parseOutlineIntoChapters(extracted.content)

    const domain: ResourceDomain = extracted.domain || inferDomainFromPathOrName(fullPath)
    const subject = extracted.subject || getDefaultSubjectForDomain(domain)

    res.json({
      success: true,
      bookName,
      inferredTitle: extracted.inferredTitle || bookName,
      domain,
      subject,
      totalChapters: chapters.length,
      chapters,
      fullOutline: extracted.content
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || '大纲提取失败' })
  }
})

/**
 * 全卷多章节深度拆解与规模化题库整合入库
 */
booksRouter.post('/books/deep-extract', async (req, res) => {
  try {
    const {
      relativePath,
      scope,
      domain: clientDomain,
      subject: clientSubject,
      selectedChapterIds,
      mode = 'dual'
    } = req.body as {
      relativePath: string
      scope?: BookScope
      domain?: ResourceDomain
      subject?: string
      selectedChapterIds?: string[]
      mode?: 'concept' | 'question' | 'dual'
    }

    const resolved = resolveBookFile(req, relativePath, scope)
    if (!resolved.ok) {
      res.status(resolved.errorStatus).json({ error: resolved.error })
      return
    }
    const { fullPath, actualScope, relativePathNormalized } = resolved
    const userVault = getRequestVaultPath(req)

    const bookName = path.basename(fullPath)
    const bookNameClean = bookName.replace(/\.[^.]+$/, '')
    const extracted = await extractContentFromMaterial(fullPath)
    const domain: ResourceDomain = clientDomain || extracted.domain || inferDomainFromPathOrName(fullPath)
    const subject = clientSubject || extracted.subject || getDefaultSubjectForDomain(domain)

    const isPdf = fullPath.toLowerCase().endsWith('.pdf')

    // 优先从深度引擎获取精准章节列表与页码
    let allChapters: any[] = []
    if (isPdf) {
      const deepOutline = await runBookContentExtractor(fullPath, 'outline')
      if (deepOutline?.success && Array.isArray(deepOutline.chapters) && deepOutline.chapters.length > 0) {
        allChapters = deepOutline.chapters
      }
    }
    if (allChapters.length === 0) {
      allChapters = parseOutlineIntoChapters(extracted.content)
    }

    // 确定待处理章节
    let targetChapters = allChapters
    if (Array.isArray(selectedChapterIds) && selectedChapterIds.length > 0) {
      targetChapters = allChapters.filter(c => selectedChapterIds.includes(c.id))
    }
    // 若章节过多，默认处理前 8 个核心大章
    if (targetChapters.length > 8) {
      targetChapters = targetChapters.slice(0, 8)
    }

    if (targetChapters.length === 0) {
      targetChapters = [
        {
          id: 'ch-all',
          title: `${bookNameClean} 全书核心考点总览`,
          rawContent: extracted.content,
          subSections: []
        }
      ]
    }

    const createdNotes: Array<{ title: string; path: string; chapterTitle: string }> = []
    const allGeneratedQuestions: any[] = []

    const domainDir = getWikiDomainDir(domain)

    // 针对每个选中的章节，提取原书真实正文与真实原题，生成专属深度笔记并注入题库
    for (let idx = 0; idx < targetChapters.length; idx++) {
      const chapter = targetChapters[idx]
      const cleanChTitle = chapter.title.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_')
      const noteTitle = `${cleanChTitle}_核心考点精解`
      const destPath = `wiki/${domainDir}/${subject}/${noteTitle}.md`

      // 1. 调用深度内容与习题提取引擎（获取原书真实正文与习题）
      let realChapterData: any = null
      if (isPdf) {
        realChapterData = await runBookContentExtractor(fullPath, 'extract_chapter', chapter.id)
      }

      // 获取书本真实正文段落
      const realConceptText = realChapterData?.conceptSummary?.trim()
      const realConceptSection = realConceptText
        ? `\n\n---\n\n## 📖 原书经典教材/讲义核心考点精粹（原书精选正文）\n\n${realConceptText}`
        : ''

      // 获取书本真实习题
      const extractedQuestions: any[] = (realChapterData?.questions && Array.isArray(realChapterData.questions))
        ? realChapterData.questions
        : []

      // 将真实题目格式化为嵌入笔记中的课后原题自测
      let exercisesEmbedSection = ''
      if (extractedQuestions.length > 0) {
        const qItems = extractedQuestions.slice(0, 5).map((q, qI) => {
          const optsText = q.options
            ? Object.entries(q.options).map(([k, v]) => `  - **${k}**. ${v}`).join('\n')
            : ''
          return `### 原题 ${qI + 1}（${q.type === 'choice' ? '单选题' : '综合题'} · ${q.difficulty}）\n> **题干**：${q.question}\n\n${optsText}\n\n> 💡 **标准答案与名师解析**：\n> **答案**：${q.answer}\n> **解析**：${q.explanation}\n`
        }).join('\n\n')
        exercisesEmbedSection = `\n\n---\n\n## 🎯 本章书本原题精选速练（课后原题）\n\n${qItems}`
      }

      const subSectionText = chapter.subSections.length > 0
        ? chapter.subSections.map((s: string) => `- **${s}**`).join('\n')
        : `- 重点掌握该模块大纲核心概念、数据通路与解题模型`

      const chapterNoteContent = `---
title: ${noteTitle}
type: concept
domain: ${domain}
subject: ${subject}
tags: [考研核心考点, ${subject}, ${chapter.title.split(/\s+/)[0] || '核心章节'}, 知识体系精讲]
updated: ${new Date().toISOString().split('T')[0]}
---

# ${chapter.title} · 核心考点深度精解

> **所属教材**：《${bookName}》  
> **学科门类**：${getDomainDisplayName(domain)} · ${subject}  
> **所属章节**：${chapter.title}  
> **知识网络索引**：[[${bookNameClean}_全书考点知识图谱总览]]

---

## 📌 本章知识架构与核心考点大纲

${subSectionText}

### 章节知识流与层级脉络
\`\`\`
${chapter.rawContent}
\`\`\`${realConceptSection}${exercisesEmbedSection}

---

## 💡 考研命题考法分析与核心机理

1. **核心概念与底层机理**：
   - 深入理解本章核心概念的物理含义与数学本质，避免孤立死记定义。
   - 梳理各子概念之间的内在逻辑关联，形成体系化的知识脑图。
2. **高频大题模型与命题规律**：
   - 本章内容在统考命题中经常以选择题（概念辨析）和综合应用大题（计算与算法分析）形式出现。
   - 复习时务必结合做题中心真题，吃透经典题型套路与解题模板。

---

## ⚠️ 考场秒杀避坑指南

- **典型易错陷阱**：考场中常见的命题陷阱往往集中在边界条件与反直觉特例上。
- **关联章节复盘**：结合 [[${bookNameClean}_全书考点知识图谱总览]] 查看跨章节综合考法。
`

      // 安全写入或覆盖笔记文件（写入当前用户专属空间或管理员主库）
      const fullNoteDest = path.resolve(userVault, destPath)
      fs.mkdirSync(path.dirname(fullNoteDest), { recursive: true })
      fs.writeFileSync(fullNoteDest, chapterNoteContent, 'utf-8')
      markSelfWrite(destPath)
      createdNotes.push({ title: noteTitle, path: destPath, chapterTitle: chapter.title })

      // 2. 将真实提取出的书本习题加入成套真题池
      const chapterShortName = chapter.title.split(/\s+/)[0] || `${subject}重点`
      if (extractedQuestions.length > 0) {
        for (const eq of extractedQuestions) {
          allGeneratedQuestions.push({
            id: eq.id || `real-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
            domain,
            subject,
            chapter: chapter.title,
            type: eq.type || 'choice',
            difficulty: eq.difficulty || '中等',
            question: eq.question,
            options: eq.options,
            answer: eq.answer || 'A',
            explanation: eq.explanation || `【考研深度解析】：考查《${chapter.title}》核心考点。`,
            tags: eq.tags || ['教材原题', subject, chapterShortName],
            source: eq.source || `${bookName} (${chapter.title})`
          })
        }
      } else {
        // 保底命制 2~3 道考研经典模型题
        const q1 = {
          id: `gen-${Date.now()}-${idx}-1`,
          domain,
          subject,
          chapter: chapter.title,
          type: 'choice',
          difficulty: '中等',
          question: `关于《${bookName}》【${chapter.title}】涉及的核心考点与原理机制，下列说法中正确的是（ ）`,
          options: {
            A: `该考点的逻辑结构与具体实现相互独立，核心机理符合统考大纲规范定义`,
            B: `所有相关算法的时间与空间复杂度在最坏情况下均保持恒定`,
            C: `相关系统状态转移过程中无需借助底层硬件机构提供状态寄存器支持`,
            D: `本章涉及的连续空间分配机制必定无法通过动态重定位方式实现`
          },
          answer: 'A',
          explanation: `【考研深度名师解析】：考查《${chapter.title}》核心机制。根据统考大纲规范，算法与逻辑架构面向问题本身，与底层实现相互解耦抽象，故选项 A 正确。`,
          tags: ['考研真题', subject, chapterShortName, '核心考点'],
          source: `${bookName} (${chapter.title})`
        }
        allGeneratedQuestions.push(q1)
      }
    }

    // 3. 生成全书总览双向链接星图导航笔记
    const indexNoteTitle = `${bookNameClean}_全书考点知识图谱总览`
    const indexNotePath = `wiki/${domainDir}/${subject}/${indexNoteTitle}.md`
    const chapterLinksText = createdNotes.map(n => `- 📑 **[[${n.title}]]**（${n.chapterTitle}）`).join('\n')

    const indexContent = `---
title: ${indexNoteTitle}
type: overview
domain: ${domain}
subject: ${subject}
tags: [考研全景总览, ${subject}, 知识图谱导航, ${bookNameClean}]
updated: ${new Date().toISOString().split('T')[0]}
---

# 📚 《${bookName}》· 全书考点知识图谱总览导航

> **参考书目**：《${bookName}》  
> **学科归属**：${getDomainDisplayName(domain)} · ${subject}  
> **拆解规模**：共完成 **${targetChapters.length}** 大核心章节深度拆解入库，注入 **${allGeneratedQuestions.length}** 道真题至做题中心  
> **更新时间**：${new Date().toISOString().split('T')[0]}

---

## 🌌 全书核心章节知识星图与双向链接

${chapterLinksText}

---

## 🎯 配套题库刷题与自测指引

- 本书沉淀的 **${allGeneratedQuestions.length} 道精选考研真题** 已全量同步至系统题库（\`custom-questions.json\`）。
- 前往 **做题中心**，可按【${subject}】学科与各章节标签进行专项针对性突破训练！
`

    const fullIndexDest = path.resolve(userVault, indexNotePath)
    fs.mkdirSync(path.dirname(fullIndexDest), { recursive: true })
    fs.writeFileSync(fullIndexDest, indexContent, 'utf-8')
    markSelfWrite(indexNotePath)

    // 4. 将全书所有生成的真题批量存入系统题库
    if (allGeneratedQuestions.length > 0) {
      appendCustomQuestions(allGeneratedQuestions, req)
    }

    // 5. 更新图书持久化解析元数据
    saveExtractionRecord(userVault, actualScope, relativePathNormalized, {
      isExtracted: true,
      noteTitle: indexNoteTitle,
      notePath: indexNotePath,
      questionCount: allGeneratedQuestions.length,
      chapterCount: targetChapters.length,
      mode
    })

    invalidateCache(req.user?.id)

    res.json({
      success: true,
      bookName,
      chaptersCount: targetChapters.length,
      totalQuestionsCount: allGeneratedQuestions.length,
      indexNoteTitle,
      indexNotePath,
      notes: createdNotes,
      questions: allGeneratedQuestions,
      domain,
      subject
    })
  } catch (err: any) {
    console.error('Deep extract error:', err.message)
    res.status(500).json({ error: err.message || '深度拆解解析异常' })
  }
})

