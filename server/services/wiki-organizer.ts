import fs from 'fs'
import path from 'path'
import { config, getNotes, invalidateCache } from '../context.js'
import { createFile } from '../vault-parser.js'
import { digestDocument, renderDigest, type DocDigest } from './doc-digest.js'
import { extractQuestions, looksLikeQuestionSet } from './question-extractor.js'

export interface OrganizedWikiResult {
  title: string
  originalName: string
  savedPath: string
  wordCount: number
  domain: 'cs_408' | 'math' | 'general'
  subject: string
  tags: string[]
  entities: string[]
  wikilinksCount: number
  wikilinks: string[]
  mocPath?: string
  questionsCount: number
  questionReport?: {
    expected: number
    extracted: number
    saved: number
    repairedByRule: number
    missing: string[]
    coverage: number
    needsReview: number
  }
  analyzedRatio?: number
  preview: string
  method: string
}

export interface QuizQuestionItem {
  id: string
  domain: 'cs_408' | 'math'
  subject: string
  chapter?: string
  type: 'choice' | 'blank'
  difficulty: '简单' | '中等' | '困难'
  question: string
  options?: { A: string; B: string; C: string; D: string }
  answer: string
  explanation: string
  tags: string[]
}

/**
 * 核心整理器：结合 Karpathy LLM-Wiki 与 AgriciDaniel/claude-obsidian 范式
 * 自动完成：知识提炼、双链图谱织网、MOC 自动挂载与做题库联动
 */
export interface OrganizeOptions {
  preferredDomain?: 'cs_408' | 'math' | 'general'
  /** 写入哪个用户的知识库；不传则为全局库（仅管理员场景） */
  vaultPath?: string
  onProgress?: (p: { stage: string; done: number; total: number; message: string }) => void
  signal?: { aborted: boolean }
}

export async function organizeDocumentIntoWiki(
  markdownContent: string,
  originalFilename: string,
  options: OrganizeOptions = {}
): Promise<OrganizedWikiResult> {
  const { preferredDomain, onProgress, signal } = options
  const vaultPath = options.vaultPath || config.vaultPath
  const notes = getNotes(vaultPath)
  const baseName = path.basename(originalFilename, path.extname(originalFilename))

  // 1. 整理现有笔记标题用于双向链接匹配
  const existingTitles = notes.map(n => n.title.trim()).filter(Boolean)
  const titleSet = new Set(existingTitles.map(t => t.toLowerCase()))

  // 2. 全文分块分析（map-reduce），不再只看前 1 万字
  onProgress?.({ stage: 'analyze', done: 0, total: 1, message: '正在分析全文' })
  let digest: DocDigest | null = null
  try {
    digest = await digestDocument(markdownContent, baseName, {
      onProgress: (done, total) =>
        onProgress?.({ stage: 'analyze', done, total, message: `分析全文 ${done}/${total} 段` }),
    })
  } catch (err: any) {
    console.warn('[Wiki Organizer digest error]:', err.message)
  }
  const aiData: any = digest
    ? {
        domain: digest.domain,
        subject: digest.subject,
        title: digest.title,
        summary: digest.summary,
        tags: digest.tags,
        entities: digest.entities,
      }
    : null

  // 3. 智能领域/学科识别与保底数据填充
  let detectedDomain: 'cs_408' | 'math' | 'general' = aiData?.domain || preferredDomain
  let detectedSubject: string = aiData?.subject || ''

  const textToAnalyze = (baseName + ' ' + markdownContent.slice(0, 1500)).toLowerCase()

  if (!detectedDomain || detectedDomain === 'general') {
    if (
      textToAnalyze.includes('408') ||
      textToAnalyze.includes('计算机') ||
      textToAnalyze.includes('数据结构') ||
      textToAnalyze.includes('操作系统') ||
      textToAnalyze.includes('组成原理') ||
      textToAnalyze.includes('计网') ||
      textToAnalyze.includes('计组')
    ) {
      detectedDomain = 'cs_408'
    } else if (
      textToAnalyze.includes('数学') ||
      textToAnalyze.includes('高数') ||
      textToAnalyze.includes('线代') ||
      textToAnalyze.includes('概率') ||
      textToAnalyze.includes('微积分') ||
      textToAnalyze.includes('方浩')
    ) {
      detectedDomain = 'math'
    } else {
      detectedDomain = 'general'
    }
  }

  if (!detectedSubject || detectedSubject === '通用知识') {
    if (detectedDomain === 'math') {
      if (textToAnalyze.includes('概率') || textToAnalyze.includes('数理统计') || textToAnalyze.includes('随机变量')) {
        detectedSubject = '概率论与数理统计'
      } else if (textToAnalyze.includes('线代') || textToAnalyze.includes('线性代数') || textToAnalyze.includes('矩阵') || textToAnalyze.includes('特征值')) {
        detectedSubject = '线性代数'
      } else {
        detectedSubject = '高等数学'
      }
    } else if (detectedDomain === 'cs_408') {
      if (textToAnalyze.includes('数据结构') || textToAnalyze.includes('二叉树') || textToAnalyze.includes('排序') || textToAnalyze.includes('散列')) {
        detectedSubject = '数据结构'
      } else if (textToAnalyze.includes('计网') || textToAnalyze.includes('网络') || textToAnalyze.includes('tcp') || textToAnalyze.includes('ip')) {
        detectedSubject = '计算机网络'
      } else if (textToAnalyze.includes('计组') || textToAnalyze.includes('组成原理') || textToAnalyze.includes('cpu') || textToAnalyze.includes('指令流水线') || textToAnalyze.includes('cache')) {
        detectedSubject = '计算机组成原理'
      } else {
        detectedSubject = '操作系统'
      }
    } else {
      detectedSubject = '通用知识'
    }
  }

  let finalTitle = (aiData?.title || baseName).replace(/_\d+_\d+$/, '').replace(/[\\/:*?"<>|]/g, '_').trim()
  if (!finalTitle) finalTitle = baseName
  const tags: string[] = Array.isArray(aiData?.tags) && aiData.tags.length > 0
    ? aiData.tags
    : [detectedDomain === 'cs_408' ? '408' : detectedDomain === 'math' ? '考研数学' : '知识库', detectedSubject, '自动整理']
  const entities: string[] = Array.isArray(aiData?.entities) ? aiData.entities : []

  // 4. Wikilinks 双向链接自动匹配与织网
  const matchedWikilinks: string[] = []
  for (const ent of entities) {
    if (titleSet.has(ent.toLowerCase())) {
      matchedWikilinks.push(`[[${ent}]]`)
    }
  }
  // 也支持将文档中自然提及的前 5 个核心实体作为延伸链接
  const extraConceptLinks = entities
    .slice(0, 5)
    .filter(e => !matchedWikilinks.includes(`[[${e}]]`))
    .map(e => `[[${e}]]`)

  const allWikilinks = [...new Set([...matchedWikilinks, ...extraConceptLinks])]

  // 5. 确定存放目录（优先根据学科放入专业知识库，避免孤立）
  let targetDir = 'Ingested'
  if (detectedDomain === 'cs_408') {
    const candidates = [
      path.join('wiki', '02-408计算机', detectedSubject),
      path.join('wiki', detectedSubject),
      path.join('wiki', '02-408计算机'),
    ]
    for (const c of candidates) {
      if (fs.existsSync(path.resolve(vaultPath, c))) {
        targetDir = c
        break
      }
    }
  } else if (detectedDomain === 'math') {
    const candidates = [
      path.join('wiki', '01-考研数学', detectedSubject),
      path.join('wiki', detectedSubject),
      path.join('wiki', '01-考研数学'),
    ]
    for (const c of candidates) {
      if (fs.existsSync(path.resolve(vaultPath, c))) {
        targetDir = c
        break
      }
    }
  }

  const fullTargetDir = path.resolve(vaultPath, targetDir)
  if (!fs.existsSync(fullTargetDir)) {
    fs.mkdirSync(fullTargetDir, { recursive: true })
  }

  // 6. 组装规范 Frontmatter 与笔记内容
  const frontmatter: Record<string, any> = {
    title: finalTitle,
    aliases: [baseName],
    domain: detectedDomain,
    subject: detectedSubject,
    tags,
    created: new Date().toISOString().split('T')[0],
    source_file: originalFilename,
    status: 'auto_organized',
    organizer: 'claude_obsidian_engine',
  }

  // 原文完整保留，导读放在开头
  let noteBody = digest ? `${renderDigest(digest)}\n\n${markdownContent}` : markdownContent
  if (allWikilinks.length > 0) {
    noteBody += `\n\n---\n## 🔗 知识图谱关联网络 (Self-Organizing Links)\n`
    noteBody += `*本笔记已由自动化整理引擎自动建立双向链接*\n\n`
    noteBody += allWikilinks.map(link => `- ${link}`).join('\n') + '\n'
  }

  // 7. 保存笔记到 Vault
  let finalRelPath = path.join(targetDir, `${finalTitle}.md`).replace(/\\/g, '/')
  let counter = 1
  while (fs.existsSync(path.resolve(vaultPath, finalRelPath))) {
    finalRelPath = path.join(targetDir, `${finalTitle}_${counter}.md`).replace(/\\/g, '/')
    counter++
  }

  const note = createFile(vaultPath, finalRelPath, noteBody, frontmatter)

  // 8. MOC (Map of Content 内容地图) 自动挂载更新
  let matchedMocPath = ''
  try {
    const possibleMocs = [
      path.join(fullTargetDir, '_index.md'),
      path.join(fullTargetDir, '00-目录_MOC.md'),
      path.join(path.dirname(fullTargetDir), '_index.md'),
    ]
    for (const moc of possibleMocs) {
      if (fs.existsSync(moc)) {
        const mocContent = fs.readFileSync(moc, 'utf-8')
        const noteWikilink = `[[${path.basename(finalRelPath, '.md')}]]`
        if (!mocContent.includes(noteWikilink)) {
          const appendLine = `\n- ${noteWikilink} · *${(aiData?.summary || '自动摄取精讲').slice(0, 40)}* (${new Date().toISOString().split('T')[0]})\n`
          fs.appendFileSync(moc, appendLine, 'utf-8')
          matchedMocPath = path.relative(vaultPath, moc).replace(/\\/g, '/')
        }
        break
      }
    }
  } catch (mocErr: any) {
    console.warn('[MOC hook error]:', mocErr.message)
  }

  // 9. 做题题库联动沉淀：资料本身是试卷/题集时，全量提取原题（不再只命制 2-3 道新题）
  let questionsCount = 0
  let questionReport: OrganizedWikiResult['questionReport']
  if (!signal?.aborted && looksLikeQuestionSet(markdownContent)) {
    try {
      const questionsFile = path.resolve(vaultPath, '做题记录', 'custom-questions.json')
      let customQuestions: any[] = []
      if (fs.existsSync(questionsFile)) {
        try {
          customQuestions = JSON.parse(fs.readFileSync(questionsFile, 'utf-8'))
          if (!Array.isArray(customQuestions)) customQuestions = []
        } catch {
          customQuestions = []
        }
      }

      const report = await extractQuestions(markdownContent, {
        domain: detectedDomain === 'general' ? undefined : detectedDomain,
        subject: detectedSubject,
        chapter: finalTitle,
        sourceName: finalTitle,
        existing: customQuestions,
        signal,
        onProgress: p => onProgress?.({ stage: `questions:${p.stage}`, done: p.done, total: p.total, message: p.message }),
      })

      for (const q of report.questions) {
        customQuestions.push({
          ...q,
          domain: detectedDomain === 'math' ? 'math' : 'cs_408',
          subject: q.subject || detectedSubject,
          tags: [...new Set([...(q.tags || []), '资料导入'])],
          sourceFile: finalRelPath,
        })
      }
      questionsCount = report.questions.length

      const qDir = path.dirname(questionsFile)
      if (!fs.existsSync(qDir)) fs.mkdirSync(qDir, { recursive: true })
      fs.writeFileSync(questionsFile, JSON.stringify(customQuestions, null, 2), 'utf-8')

      questionReport = {
        expected: report.expected,
        extracted: report.extracted,
        saved: report.questions.length,
        repairedByRule: report.repairedByRule,
        missing: report.missing,
        coverage: report.coverage,
        needsReview: report.questions.filter(q => q.needsReview).length,
      }
    } catch (qErr: any) {
      console.warn('[Save custom questions error]:', qErr.message)
    }
  }

  // 10. 缓存失效，实时通知整个系统
  invalidateCache()

  return {
    title: finalTitle,
    originalName: originalFilename,
    savedPath: note.path,
    wordCount: note.wordCount,
    domain: detectedDomain,
    subject: detectedSubject,
    tags,
    entities,
    wikilinksCount: allWikilinks.length,
    wikilinks: allWikilinks,
    mocPath: matchedMocPath || undefined,
    questionsCount,
    questionReport,
    analyzedRatio: digest ? Math.round((digest.analyzedChars / Math.max(1, digest.totalChars)) * 100) : undefined,
    preview: noteBody.slice(0, 500),
    method: 'microsoft_markitdown + claude_obsidian_engine'
  }
}
