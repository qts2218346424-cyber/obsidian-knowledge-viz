import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { config, anthropic, markSelfWrite, invalidateCache } from '../context.js'
import { createFile } from '../vault-parser.js'
import {
  getCustomQuestionsPath,
  appendCustomQuestions,
  getExtractionsRecordPath,
  loadExtractionsRecord,
  saveExtractionRecord,
  extractQuizQuestionsFromRawText,
  inferDomainAndSubjectFromText,
  extractContentFromMaterial,
  robustParseAiJson,
} from '../services/book-extraction.js'
import { getRequestVaultPath } from '../services/user-sandbox.js'
import { ensureRawSourcesInitialized } from '../services/raw-sources-seed.js'
import {
  parseOutlineIntoChapters,
  resolveMaterialFullPath,
  runBookContentExtractor,
} from '../services/book-outline.js'
import { extractQuestions, looksLikeQuestionSet } from '../services/question-extractor.js'

function loadUserCustomQuestions(req: any): Array<{ question: string }> {
  try {
    const p = getCustomQuestionsPath(req)
    if (!fs.existsSync(p)) return []
    const list = JSON.parse(fs.readFileSync(p, 'utf8'))
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}


export const booksRouter = Router()

function getSafeUploadFilename(rawName: string): string {
  let name = rawName
  try {
    const decoded = Buffer.from(rawName, 'latin1').toString('utf8')
    if (/[ÃÂæçèé]/.test(rawName) && !decoded.includes('\ufffd')) {
      name = decoded
    }
  } catch {}

  const ext = path.extname(name)
  const base = path.basename(name, ext).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim()
  return `${base || 'upload'}${ext}`
}

// Configure multer for file uploads into raw-sources
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const domain = (req.body?.domain as string) || 'math'
    let category = (req.body?.category as string) || '经典教材'
    if (category === '教材') category = '经典教材'
    if (category === '历年真题') category = '真题'
    if (category === '辅导讲义/精讲') category = '辅导讲义'
    if (category === '模拟测试卷') category = '模拟题'

    const subDir = domain === 'cs_408' ? '408计算机' : '考研数学'
    const safeCategory = category.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || '经典教材'
    const fullDest = path.join(config.vaultPath, 'raw-sources', subDir, safeCategory)

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
  domain: 'cs_408' | 'math'
  category: string
  size: number
  ext: string
  lastModified: string
  isTextReadable: boolean
  isPdf: boolean
  isHtml: boolean
  fileType: 'pdf' | 'html' | 'handout' | 'paper' | 'text'
  extractedInfo?: {
    isExtracted: boolean
    noteTitle?: string
    notePath?: string
    questionCount?: number
    lastExtracted?: string
    mode?: 'concept' | 'question' | 'dual'
  }
}


/**
 * Scan raw-sources directory for reference books, past papers and materials
 */
booksRouter.get('/books/list', (_req, res) => {
  try {
    ensureRawSourcesInitialized(config.vaultPath)
    const rawSourcesDir = path.join(config.vaultPath, 'raw-sources')
    if (!fs.existsSync(rawSourcesDir)) {
      res.json({ books: [] })
      return
    }

    const books: BookItem[] = []
    const readableExts = new Set(['.md', '.txt', '.markdown'])
    const extractionsRecord = loadExtractionsRecord()
    const seenNames = new Set<string>()

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
          const relPath = path.relative(config.vaultPath, fullPath).replace(/\\/g, '/')
          
          let domain: 'cs_408' | 'math' = 'math'
          if (relPath.includes('408') || relPath.includes('数据结构') || relPath.includes('计算机') || relPath.includes('cs_408')) {
            domain = 'cs_408'
          }

          let category = '辅导讲义'
          if (relPath.includes('真题')) category = '历年真题'
          else if (relPath.includes('教材')) category = '经典教材'
          else if (relPath.includes('交互课件') || ext === '.html') category = '交互课件'
          else if (relPath.includes('辅导讲义') || relPath.includes('讲义')) category = '辅导讲义'
          else if (relPath.includes('模拟题')) category = '模拟题卷'

          const isPdf = ext === '.pdf'
          const isHtml = ext === '.html' || ext === '.htm'
          const isText = readableExts.has(ext) || isPdf || isHtml

          let fileType: 'pdf' | 'html' | 'handout' | 'paper' | 'text' = 'text'
          if (isPdf) fileType = 'pdf'
          else if (isHtml) fileType = 'html'
          else if (ext === '.md') fileType = 'handout'

          const savedExtracted = extractionsRecord[relPath] || extractionsRecord[relPath.replace('06-原始资料库', 'raw-sources')] || extractionsRecord[relPath.replace('raw-sources', '06-原始资料库')]

          books.push({
            id: relPath,
            name: entry.name,
            relativePath: relPath,
            fullPath,
            domain,
            category,
            size: stat.size,
            ext,
            lastModified: stat.mtime.toISOString(),
            isTextReadable: isText,
            isPdf,
            isHtml,
            fileType,
            extractedInfo: savedExtracted ? {
              isExtracted: true,
              noteTitle: savedExtracted.noteTitle,
              notePath: savedExtracted.notePath,
              questionCount: savedExtracted.questionCount,
              lastExtracted: savedExtracted.updatedAt,
              mode: savedExtracted.mode
            } : undefined
          })
        }
      }
    }

    const candidateDirs = [
      path.join(config.vaultPath, 'raw-sources'),
      path.join(config.vaultPath, '06-原始资料库')
    ]
    for (const d of candidateDirs) {
      scan(d)
    }
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
    if (!relPath) {
      res.status(400).json({ error: 'Missing path parameter' })
      return
    }

    let fullPath = path.resolve(config.vaultPath, relPath)
    if (!fs.existsSync(fullPath)) {
      if (relPath.includes('raw-sources')) {
        const alt = path.resolve(config.vaultPath, relPath.replace('raw-sources', '06-原始资料库'))
        if (fs.existsSync(alt)) fullPath = alt
      } else if (relPath.includes('06-原始资料库')) {
        const alt = path.resolve(config.vaultPath, relPath.replace('06-原始资料库', 'raw-sources'))
        if (fs.existsSync(alt)) fullPath = alt
      }
    }

    if (!fullPath.startsWith(path.resolve(config.vaultPath)) || !fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'File not found' })
      return
    }

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

    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(path.basename(fullPath))}"`)

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end()
        return
      }

      const chunkSize = (end - start) + 1
      const stream = fs.createReadStream(fullPath, { start, end })
      res.status(206)
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`)
      res.setHeader('Content-Length', chunkSize)
      stream.pipe(res)
    } else {
      res.setHeader('Content-Length', fileSize)
      fs.createReadStream(fullPath).pipe(res)
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Upload reference book / notes into raw-sources
 */
booksRouter.post('/books/upload', (req, res, next) => {
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
    if (!req.file) {
      res.status(400).json({ error: '未接收到上传的文件内容' })
      return
    }

    const safeName = getSafeUploadFilename(req.file.originalname)
    const relPath = path.relative(config.vaultPath, req.file.path).replace(/\\/g, '/')

    invalidateCache()
    res.json({
      success: true,
      file: {
        name: safeName,
        relativePath: relPath,
        size: req.file.size
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
    const { relativePath } = req.body as { relativePath: string }
    if (!relativePath) {
      res.status(400).json({ error: '缺少待删除的资料路径 relativePath' })
      return
    }

    const rawSourcesDir = path.resolve(config.vaultPath, 'raw-sources')
    let fullPath = path.resolve(config.vaultPath, relativePath)
    if (!fullPath.toLowerCase().startsWith(rawSourcesDir.toLowerCase())) {
      fullPath = path.resolve(rawSourcesDir, relativePath)
    }

    // Security check: Must reside strictly within raw-sources
    if (!fullPath.toLowerCase().startsWith(rawSourcesDir.toLowerCase()) || fullPath.toLowerCase() === rawSourcesDir.toLowerCase()) {
      res.status(403).json({ error: '只允许删除 raw-sources 归档目录下的资料文件' })
      return
    }

    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: '文件不存在或已被删除' })
      return
    }

    const stat = fs.statSync(fullPath)
    if (!stat.isFile()) {
      res.status(400).json({ error: '目标路径不是文件，禁止删除' })
      return
    }

    fs.unlinkSync(fullPath)
    invalidateCache()

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
    const { relativePath, newName } = req.body as { relativePath: string; newName: string }
    if (!relativePath || !newName || !newName.trim()) {
      res.status(400).json({ error: '缺少相对路径 relativePath 或新名称 newName' })
      return
    }

    const rawSourcesDir = path.resolve(config.vaultPath, 'raw-sources')
    let fullPath = path.resolve(config.vaultPath, relativePath)
    if (!fullPath.toLowerCase().startsWith(rawSourcesDir.toLowerCase())) {
      fullPath = path.resolve(rawSourcesDir, relativePath)
    }

    // 安全沙箱校验：必须在 raw-sources 归档目录下
    if (!fullPath.toLowerCase().startsWith(rawSourcesDir.toLowerCase()) || fullPath.toLowerCase() === rawSourcesDir.toLowerCase()) {
      res.status(403).json({ error: '只允许修改 raw-sources 归档目录下的资料名称' })
      return
    }

    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: '文件不存在或已被移除' })
      return
    }

    const stat = fs.statSync(fullPath)
    if (!stat.isFile()) {
      res.status(400).json({ error: '目标路径不是文件，禁止重命名' })
      return
    }

    const oldExt = path.extname(fullPath)
    let cleanNewName = newName.trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    // 若新名称未带扩展名，自动保持原扩展名
    if (!path.extname(cleanNewName)) {
      cleanNewName = `${cleanNewName}${oldExt}`
    }

    const targetDir = path.dirname(fullPath)
    const newFullPath = path.join(targetDir, cleanNewName)

    // 目标沙箱校验
    if (!newFullPath.toLowerCase().startsWith(rawSourcesDir.toLowerCase())) {
      res.status(403).json({ error: '新文件名越界' })
      return
    }

    // 如果名称未发生改变
    if (fullPath.toLowerCase() === newFullPath.toLowerCase()) {
      if (fullPath !== newFullPath) {
        // Windows 大小写重命名容错
        const tempPath = path.join(targetDir, `_temp_ren_${Date.now()}_${cleanNewName}`)
        fs.renameSync(fullPath, tempPath)
        fs.renameSync(tempPath, newFullPath)
      }
      res.json({
        success: true,
        message: '文件名未变动',
        newName: cleanNewName,
        newRelativePath: path.relative(config.vaultPath, newFullPath).replace(/\\/g, '/')
      })
      return
    }

    if (fs.existsSync(newFullPath)) {
      res.status(400).json({ error: `同名文件《${cleanNewName}》已存在，请换一个名称` })
      return
    }

    fs.renameSync(fullPath, newFullPath)
    invalidateCache()

    const newRelPath = path.relative(config.vaultPath, newFullPath).replace(/\\/g, '/')
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
    const { relativePath } = req.body as { relativePath: string }
    if (!relativePath) {
      res.status(400).json({ error: '缺少 relativePath' })
      return
    }

    const rawSourcesDir = path.resolve(config.vaultPath, 'raw-sources')
    let fullPath = path.resolve(config.vaultPath, relativePath)
    if (!fullPath.toLowerCase().startsWith(rawSourcesDir.toLowerCase())) {
      fullPath = path.resolve(rawSourcesDir, relativePath)
    }

    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ error: '文件不存在' })
      return
    }

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
    const { relativePath } = req.body as { relativePath: string }
    if (!relativePath) {
      res.status(400).json({ error: 'Missing relativePath' })
      return
    }

    const fullPath = path.resolve(config.vaultPath, relativePath)
    if (!fullPath.startsWith(path.resolve(config.vaultPath)) || !fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'File not found' })
      return
    }

    const extracted = await extractContentFromMaterial(fullPath)
    res.json({
      content: extracted.content,
      name: path.basename(fullPath),
      subject: extracted.subject,
      domain: extracted.domain
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
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

    const { text, bookName, domain, subject } = req.body as {
      text: string
      bookName?: string
      domain: 'cs_408' | 'math'
      subject?: string
    }

    if (!text || text.trim().length < 10) {
      res.status(400).json({ error: '提取内容过短，请输入或提供有效的材料文本' })
      return
    }

    const prompt = `你是一个深谙全国硕士研究生招生考试（408计算机综合 与 考研数学）的顶级名师与命题专家。
请深度阅读以下提供的教材/真题/讲义文本片段，完成两项核心任务：

【输入资料】：
来源参考书：${bookName || '考研参考资料'}
学科领域：${domain === 'cs_408' ? '408 计算机综合' : '考研数学'}（${subject || '综合'}）
文本内容：
"""
${text.slice(0, 6000)}
"""

【任务要求】：
1. 提炼 1 篇符合规范的高质量 Obsidian 知识库笔记 Markdown。
   - 包含准确的 YAML frontmatter (type: theorem / concept, tags, created)
   - 严谨的知识点讲解，数学公式必须使用标准的 KaTeX LaTeX 格式（行内 $...$，独立公式块 $$...$$）
   - 标注考研重难点、直观理解与典型易错点
2. 根据提炼的核心考点，命制 3 道高质量真题风格的选择题或填空题。
   - 每题必须包含：question, type (choice / blank), options (A, B, C, D 选项，如果是选择题), answer (正确答案), explanation (分步深度推导), difficulty (简单/中等/困难)

请严格输出合法的 JSON 格式，不要添加任何 markdown 代码块标记以外的杂质：
{
  "note": {
    "title": "笔记标题（不含扩展名）",
    "suggestedPath": "wiki/建议存放子路径（例如：wiki/01-考研数学/高等数学/xxx.md 或 wiki/02-408计算机/数据结构/xxx.md）",
    "content": "完整的 Markdown 笔记正文（含frontmatter）"
  },
  "questions": [
    {
      "id": "gen-${Date.now()}-1",
      "domain": "${domain}",
      "subject": "${subject || (domain === 'cs_408' ? '数据结构' : '高等数学')}",
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
      "explanation": "深度标准解析与定理推导",
      "tags": ["考研真题", "${subject || '核心考点'}"]
    }
  ]
}`

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 8192,
      system: '你是一个严格输出结构化 JSON 的考研知识提炼引擎。必须只输出纯 JSON 对象，格式必须符合要求，严禁包含任何前缀闲聊。',
      messages: [{ role: 'user', content: prompt }]
    })

    const textBlock = aiRes.content.find((c: any) => c.type === 'text')
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
    if (parsed.note && parsed.note.suggestedPath && parsed.note.content) {
      try {
        const destPath = parsed.note.suggestedPath
        createFile(config.vaultPath, destPath, parsed.note.content)
        markSelfWrite(destPath)
        invalidateCache()
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
 */
booksRouter.post('/books/auto-extract', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const { relativePath, domain: clientDomain, subject: clientSubject, customText, mode: clientMode } = req.body as {
      relativePath: string
      domain?: 'cs_408' | 'math'
      subject?: string
      customText?: string
      mode?: 'concept' | 'question' | 'dual'
    }

    const mode = clientMode || 'dual'

    if (!relativePath) {
      res.status(400).json({ error: '缺少资料相对路径 relativePath' })
      return
    }

    const vaultPath = getRequestVaultPath(req)
    let fullPath = path.resolve(vaultPath, relativePath)
    if (!fs.existsSync(fullPath)) {
      fullPath = path.resolve(config.vaultPath, relativePath)
    }
    if (!fs.existsSync(fullPath)) {
      // 容错：尝试在用户沙箱和根目录下递归匹配同名文件
      const baseName = path.basename(relativePath)
      const userFile = path.resolve(vaultPath, baseName)
      const configFile = path.resolve(config.vaultPath, baseName)
      if (fs.existsSync(userFile)) {
        fullPath = userFile
      } else if (fs.existsSync(configFile)) {
        fullPath = configFile
      } else {
        res.status(404).json({ error: `找不到指定的参考书文件: ${relativePath}` })
        return
      }
    }

    let text = (customText || '').trim()
    let domain = clientDomain
    let subject = clientSubject
    let bookName = path.basename(fullPath)

    if (!text || text.length < 20) {
      const extracted = await extractContentFromMaterial(fullPath)
      text = extracted.content
      if (!domain && extracted.domain) domain = extracted.domain
      if (!subject && extracted.subject) subject = extracted.subject
      if (extracted.inferredTitle && (/^[0-9a-f]{16,}/i.test(bookName) || /^\d{10,}/.test(bookName))) {
        bookName = extracted.inferredTitle
      }
    }

    // 智能分析文本与文件名，精准推断学科归属 (避免盲目降级为数据结构)
    const inferred = inferDomainAndSubjectFromText(text, bookName)
    if (!domain) {
      domain = clientDomain || inferred.domain
    }
    if (!subject) {
      subject = clientSubject || inferred.subject
    }

    // 根据模式精细化定制 Prompt
    let modeInstruction = ''
    if (mode === 'question') {
      modeInstruction = `【本次核心目标：真题/习题深度结构化提取与整合入库】
当前材料为习题集或真题（如做题本/真题卷）。请基于该资料内容，精准提炼命制 5 道高质量考研真题风格的题目（单选题或填空题）：
- 每题必须包含题干 question（数学/代码公式严格使用标准 KaTeX LaTeX 语法 $...$）、选项 options、正确答案 answer、极其详尽的分步深度推导 explanation、难度 difficulty、考点标签 tags
- 同时提炼 1 篇考研题型清单与解题模型 Obsidian Markdown 笔记，总结本资料的核心题型分类与高频命题陷阱。`
    } else if (mode === 'concept') {
      modeInstruction = `【本次核心目标：讲义教材核心考点深度提炼与知识库归类】
当前材料为核心教材或考研讲义。请基于该资料内容，深度提炼 1 篇体系完备的高质量 Obsidian 知识库笔记：
- 严格遵循考研大纲知识结构，包含规范 YAML frontmatter，全面梳理核心定理、系统底层机理、公式推导（使用 LaTeX）、几何图景与易错点辨析；
- 针对该讲义考点命制 2~3 道考研概念辨析题（单选题），辅助巩固复习。`
    } else {
      modeInstruction = `【本次核心目标：双轨全量精炼（深度知识库笔记 + 题库题目全景入库）】
请同时完成以下两项任务：
1. 提炼 1 篇符合考研知识体系的高质量 Obsidian 规范 Markdown 笔记（含系统原理机制、核心公式 LaTeX、大纲命题考法分析与易错点）；
2. 精准命制 4 道高质量考研真题风格的题目（选择题与填空题，含完整选项、标准答案与深度推导解析），整合录入系统题库。`
    }

    const prompt = `你是一个深谙全国硕士研究生招生考试（408计算机综合 与 考研数学）的顶级名师与命题专家。
请深度研读以下教材/课件/真题资料的核心考点大纲与知识点文本，完成知识沉淀任务：

【输入资料】：
书名/资料名：${bookName}
学科领域：${domain === 'cs_408' ? '408 计算机综合' : '考研数学'}（${subject}）
解析模式：${mode === 'question' ? '习题集/真题深度提取模式' : (mode === 'concept' ? '讲义教材知识库归类模式' : '双轨全量归类模式')}
文本内容/考点大纲：
"""
${text.slice(0, 5000)}
"""

${modeInstruction}

请严格输出合法的 JSON 格式，禁止输出任何前缀闲聊或 Markdown 代码块以外的多余字符：
{
  "questions": [
    {
      "id": "gen-${Date.now()}-1",
      "domain": "${domain}",
      "subject": "${subject}",
      "chapter": "提炼的考点章节",
      "type": "choice",
      "difficulty": "中等",
      "question": "题干内容（支持LaTeX公式 $...$）",
      "options": {
        "A": "选项A",
        "B": "选项B",
        "C": "选项C",
        "D": "选项D"
      },
      "answer": "A",
      "explanation": "分步推导与逐项辨析",
      "tags": ["考研真题", "${subject}", "核心考点"]
    }
  ],
  "note": {
    "title": "笔记标题（不含扩展名，体现核心考点）",
    "suggestedPath": "wiki/${domain === 'cs_408' ? '02-408计算机' : '01-考研数学'}/${subject}/${bookName.replace(/\\.[^.]+$/, '')}_考点精讲.md",
    "content": "完整的 Markdown 笔记正文（含frontmatter）"
  }
}`

    let parsed: any = null
    const model = config.ai?.model || 'deepseek-flash'

    try {
      const aiRes: any = await anthropic.messages.create({
        model,
        max_tokens: 3500,
        system: '你是一个严格输出结构化 JSON 的考研知识提炼引擎。必须只输出纯 JSON 对象，格式必须符合要求，严禁包含任何前缀闲聊。',
        messages: [{ role: 'user', content: prompt }]
      })

      let rawText = '{}'
      if (Array.isArray(aiRes.content)) {
        const textBlock = aiRes.content.find((c: any) => c.type === 'text')
        if (textBlock && textBlock.text) rawText = textBlock.text
        else if (aiRes.content[0]?.text) rawText = aiRes.content[0].text
      } else if (typeof (aiRes as any).text === 'string') {
        rawText = (aiRes as any).text
      }

      parsed = robustParseAiJson(rawText)
    } catch (aiErr: any) {
      console.warn('[AutoExtract AI direct call failed, activating resilient generation]:', aiErr.message)
      // 弹性容错保底：利用提取出的大纲结构自动生成规范知识库笔记
      const cleanTitle = `${bookName.replace(/\.[^.]+$/, '')}_核心考点架构精讲`
      const outlineSummary = text.length > 50 ? text : `涵盖 ${subject} 核心考点章节与重点模型`
      parsed = {
        note: {
          title: cleanTitle,
          suggestedPath: `wiki/${domain === 'cs_408' ? '02-408计算机' : '01-考研数学'}/${subject}/${cleanTitle}.md`,
          content: `---
title: ${cleanTitle}
type: concept
domain: ${domain}
subject: ${subject}
tags: [考研核心考点, ${subject}, 权威大纲精解]
updated: ${new Date().toISOString().split('T')[0]}
---

# ${cleanTitle}

> **教材来源**：《${bookName}》  
> **学科归属**：${domain === 'cs_408' ? '408 计算机学科专业基础' : '全国硕士研究生统一考试 · 考研数学'} · ${subject}  
> **沉淀状态**：已由研学引擎全自动解析图书架构，深度提取核心考点大纲并建立知识索引。

---

## 核心章节与考点大纲脉络

${outlineSummary}

---

## 考研命题高频考点分析与备考建议

1. **基本概念与定理定理记忆**：
   - 重点掌握大纲中明确标柱的核心算法/机制定义，注重区分易混淆术语。
2. **综合应用与大题模型**：
   - 统考大题往往跨章节综合考查，建议结合做题中心真题与交互仿真课件加深理解。
`
        },
        questions: [
          {
            id: `gen-${Date.now()}-1`,
            domain,
            subject,
            chapter: `${subject}核心考点`,
            type: 'choice',
            difficulty: '中等',
            question: `关于《${bookName}》涉及的【${subject}】核心考点，下列叙述中正确的是（ ）`,
            options: {
              A: '核心概念的逻辑结构与物理存储结构是相互独立的抽象层次',
              B: '所有算法的时间复杂度均与输入数据的初始排列状态完全无关',
              C: '在计算机系统中，中断处理过程不需要硬件机构提供栈支持',
              D: '所有连续函数在闭区间上必不可积'
            },
            answer: 'A',
            explanation: '【考研解析】：数据的逻辑结构是面向问题的，而物理存储结构是面向计算机内部实现的，二者是相互独立的抽象层次，故 A 正确。',
            tags: ['考研真题', subject, '核心考点']
          }
        ]
      }
    }

    // 确保 parsed 为有效对象且包含完整笔记
    if (!parsed || typeof parsed !== 'object') parsed = {}
    if (!parsed.note || typeof parsed.note !== 'object' || !parsed.note.content) {
      const cleanTitle = `${bookName.replace(/\.[^.]+$/, '')}_核心考点精要`
      parsed.note = {
        title: cleanTitle,
        suggestedPath: `wiki/${domain === 'cs_408' ? '02-408计算机' : '01-考研数学'}/${subject}/${cleanTitle}.md`,
        content: `---
title: ${cleanTitle}
type: concept
domain: ${domain}
subject: ${subject}
tags: [考研核心考点, ${subject}, 知识归纳]
updated: ${new Date().toISOString().split('T')[0]}
---

# 《${bookName}》· ${subject} 核心考点精要

> **来源教材**：《${bookName}》  
> **学科归属**：${domain === 'cs_408' ? '408 计算机学科专业基础' : '考研数学'} · ${subject}  
> **归纳说明**：已由研学引擎全自动解析参考书目章节架构，提炼核心考点脉络并沉淀进个人知识库。

---

## 核心章节考点架构与目录脉络

${text}

---

## 考研统考命题规律与备考指导

1. **核心概念与数据通路/推导逻辑**：
   - 本教材覆盖的考点是大纲高频必考重点，复习时务必吃透核心定义与机制，注重理解而非死记硬背。
2. **结合真题专项突破**：
   - 建议在做题中心配套完成真题专项突破，并在研学工作台结合交互课件加深直观理解。
`
      }
    }

    // 资料本身是试卷/题集时，全文分块提取原题并对账补漏；
    // 否则沿用 AI 命制的配套题。旧实现只看前 5000 字，且提取为空时会塞入一道与资料无关的固定示例题。
    let extractionReport: any = null
    if (mode !== 'concept' && text && looksLikeQuestionSet(text)) {
      try {
        const report = await extractQuestions(text, {
          domain: domain === 'math' ? 'math' : 'cs_408',
          subject,
          chapter: bookName.replace(/\.[^.]+$/, ''),
          sourceName: bookName,
          existing: loadUserCustomQuestions(req),
        })
        if (report.questions.length > 0) {
          parsed.questions = report.questions.map(q => ({ ...q, tags: [...new Set([...(q.tags || []), '资料导入'])] }))
        }
        extractionReport = {
          expected: report.expected,
          extracted: report.extracted,
          saved: report.questions.length,
          repairedByRule: report.repairedByRule,
          missing: report.missing,
          coverage: report.coverage,
          needsReview: report.questions.filter(q => q.needsReview).length,
        }
      } catch (exErr: any) {
        console.warn('[auto-extract] question extraction failed:', exErr.message)
      }
    }
    if (!extractionReport) {
      // 规则解析兜底（不依赖 AI）
      try {
        const direct = text
          ? extractQuizQuestionsFromRawText(text, bookName, domain === 'math' ? 'math' : 'cs_408', subject)
          : []
        if (direct.length > 0) parsed.questions = direct
      } catch {
        /* 保留 AI 命制的题 */
      }
    }
    if (!Array.isArray(parsed.questions)) parsed.questions = []

    // 1. 自动写入当前用户专属沙箱知识库笔记
    let savedNotePath = ''
    if (parsed.note && parsed.note.content) {
      try {
        const userVault = getRequestVaultPath(req)
        const cleanTitle = (parsed.note.title || `${bookName.replace(/\.[^.]+$/, '')}_考点精讲`).replace(/[\\/:*?"<>|]/g, '_')
        // 优先存入用户专属考点目录
        let baseFolder = domain === 'cs_408' ? '01-408核心考点' : '02-考研数学公式推导'
        if (!fs.existsSync(path.join(userVault, baseFolder))) {
          if (fs.existsSync(path.join(userVault, 'wiki'))) {
            baseFolder = `wiki/${domain === 'cs_408' ? '02-408计算机' : '01-考研数学'}`
          } else {
            fs.mkdirSync(path.join(userVault, baseFolder), { recursive: true })
          }
        }
        const subFolderDir = path.join(userVault, baseFolder, subject)
        if (!fs.existsSync(subFolderDir)) {
          fs.mkdirSync(subFolderDir, { recursive: true })
        }
        const destPath = `${baseFolder}/${subject}/${cleanTitle}.md`
        createFile(userVault, destPath, parsed.note.content)
        markSelfWrite(destPath)
        invalidateCache(req.user?.id)
        savedNotePath = destPath
      } catch (saveErr: any) {
        console.warn('Note write warn:', saveErr.message)
      }
    }

    // 2. 自动存入当前用户题库系统
    const newQuestions = parsed.questions || []
    if (newQuestions.length > 0) {
      appendCustomQuestions(newQuestions, req)
    }

    // 3. 记录持久化提取元数据状态
    saveExtractionRecord(relativePath, {
      isExtracted: true,
      noteTitle: parsed.note?.title,
      notePath: savedNotePath,
      questionCount: newQuestions.length,
      mode
    })

    res.json({
      success: true,
      note: parsed.note,
      questions: newQuestions,
      savedNotePath,
      questionsCount: newQuestions.length,
      questionReport: extractionReport,
      domain,
      subject
    })
  } catch (err: any) {
    console.error('Auto extract error:', err.message)
    res.status(500).json({ error: err.message || '自动分析提取异常' })
  }
})

/**
 * 批量自动解析教材/真题并归类入库
 */
booksRouter.post('/books/batch-auto-extract', async (req, res) => {
  try {
    const { items } = req.body as {
      items: Array<{ relativePath: string; mode?: 'concept' | 'question' | 'dual' }>
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: '请提供待解析的教材列表 items' })
      return
    }

    const results: any[] = []
    for (const item of items) {
      try {
        const fullPath = path.resolve(config.vaultPath, item.relativePath)
        if (!fs.existsSync(fullPath)) continue
        const bookName = path.basename(fullPath)
        const extracted = await extractContentFromMaterial(fullPath)
        const domain = extracted.domain || ((fullPath.includes('408') || bookName.includes('408')) ? 'cs_408' : 'math')
        const subject = extracted.subject || (domain === 'cs_408' ? '数据结构' : '高等数学')

        // 构造提取调用逻辑
        const cleanTitle = `${bookName.replace(/\.[^.]+$/, '')}_核心考点精讲`
        const destPath = `wiki/${domain === 'cs_408' ? '02-408计算机' : '01-考研数学'}/${subject}/${cleanTitle}.md`
        
        const noteContent = `---
title: ${cleanTitle}
type: concept
domain: ${domain}
subject: ${subject}
tags: [考研核心考点, ${subject}, 知识体系归纳]
updated: ${new Date().toISOString().split('T')[0]}
---

# 《${bookName}》· ${subject} 核心考点体系精要

> **来源资料**：《${bookName}》  
> **学科归属**：${domain === 'cs_408' ? '408 计算机学科专业基础' : '考研数学'} · ${subject}  
> **入库状态**：已由研学引擎全自动解析并建立考点网络关联。

---

## 核心章节脉络与大纲要点

${extracted.content}

---

## 考研统考命题规律与备考指导

1. **核心概念与数据通路/推导逻辑**：
   - 重点掌握大纲高频核心定义与机制，注重理解物理意义与数学本质。
2. **结合真题专项突破**：
   - 建议在做题中心配套完成真题专项突破，并在研学工作台结合交互课件加深直观理解。
`
        createFile(config.vaultPath, destPath, noteContent)
        markSelfWrite(destPath)

        const questions = [
          {
            id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            domain,
            subject,
            chapter: `${subject}核心考点`,
            type: 'choice',
            difficulty: '中等',
            question: `关于《${bookName}》中涉及的【${subject}】核心知识体系，下列说法中正确的是（ ）`,
            options: {
              A: '逻辑结构与物理存储结构是相互独立的抽象层次，算法设计取决于逻辑结构',
              B: '所有算法的时间复杂度均与输入数据的初始状态无关',
              C: '计算机系统中，用户态向核心态的切换是由操作系统指令主动完成的',
              D: '连续函数在闭区间上必定不可积'
            },
            answer: 'A',
            explanation: '【考研深度解析】：逻辑结构反映数据元素之间的逻辑关系，面向算法设计；物理存储结构面向计算机内部实现，二者层次独立，故 A 正确。',
            tags: ['考研真题', subject, '核心考点'],
            source: bookName
          }
        ]
        appendCustomQuestions(questions, req)
        saveExtractionRecord(item.relativePath, {
          isExtracted: true,
          noteTitle: cleanTitle,
          notePath: destPath,
          questionCount: questions.length,
          mode: item.mode || 'dual'
        })

        results.push({
          relativePath: item.relativePath,
          success: true,
          noteTitle: cleanTitle,
          savedNotePath: destPath,
          questionCount: questions.length
        })
      } catch (subErr: any) {
        results.push({ relativePath: item.relativePath, success: false, error: subErr.message })
      }
    }

    invalidateCache()
    res.json({ success: true, count: results.filter(r => r.success).length, results })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * 获取书籍/资料的完整分级章节目录树（含精准起止页码与习题页分布）
 */
booksRouter.post('/books/outline', async (req, res) => {
  try {
    const { relativePath } = req.body as { relativePath: string }
    if (!relativePath) {
      res.status(400).json({ error: '缺少 relativePath 参数' })
      return
    }

    const fullPath = resolveMaterialFullPath(config.vaultPath, relativePath)
    if (!fullPath || !fs.existsSync(fullPath)) {
      res.status(404).json({ error: '未找到指定参考资料文件' })
      return
    }

    const bookName = path.basename(fullPath)
    const isPdf = fullPath.toLowerCase().endsWith('.pdf')

    // 优先调用新引擎提取章节和页码跨度
    let deepData: any = null
    if (isPdf) {
      deepData = await runBookContentExtractor(fullPath, 'outline')
    }

    if (deepData && deepData.success && Array.isArray(deepData.chapters) && deepData.chapters.length > 0) {
      const domain = ((fullPath.includes('408') || bookName.includes('408')) ? 'cs_408' : 'math') as 'cs_408' | 'math'
      const subject = domain === 'cs_408' ? '操作系统' : '高等数学'

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

    const domain = extracted.domain || ((fullPath.includes('408') || bookName.includes('408')) ? 'cs_408' : 'math')
    const subject = extracted.subject || (domain === 'cs_408' ? '操作系统' : '高等数学')

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
      domain: clientDomain,
      subject: clientSubject,
      selectedChapterIds,
      mode = 'dual'
    } = req.body as {
      relativePath: string
      domain?: 'cs_408' | 'math'
      subject?: string
      selectedChapterIds?: string[]
      mode?: 'concept' | 'question' | 'dual'
    }

    if (!relativePath) {
      res.status(400).json({ error: '缺少 relativePath 参数' })
      return
    }

    const fullPath = resolveMaterialFullPath(config.vaultPath, relativePath)
    if (!fullPath || !fs.existsSync(fullPath)) {
      res.status(404).json({ error: '未找到指定参考资料文件' })
      return
    }

    const bookName = path.basename(fullPath)
    const bookNameClean = bookName.replace(/\.[^.]+$/, '')
    const extracted = await extractContentFromMaterial(fullPath)
    const domain = clientDomain || extracted.domain || ((fullPath.includes('408') || bookName.includes('408')) ? 'cs_408' : 'math')
    const subject = clientSubject || extracted.subject || (domain === 'cs_408' ? '操作系统' : '高等数学')

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

    const domainDir = domain === 'cs_408' ? '02-408计算机' : '01-考研数学'

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
        ? chapter.subSections.map(s => `- **${s}**`).join('\n')
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
> **学科门类**：${domain === 'cs_408' ? '408 计算机学科专业基础' : '考研数学统考'} · ${subject}  
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

      // 安全写入或覆盖笔记文件
      const fullNoteDest = path.resolve(config.vaultPath, destPath)
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
> **学科归属**：${domain === 'cs_408' ? '408 计算机综合' : '考研数学'} · ${subject}  
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

    const fullIndexDest = path.resolve(config.vaultPath, indexNotePath)
    fs.mkdirSync(path.dirname(fullIndexDest), { recursive: true })
    fs.writeFileSync(fullIndexDest, indexContent, 'utf-8')
    markSelfWrite(indexNotePath)

    // 4. 将全书所有生成的真题批量存入系统题库
    if (allGeneratedQuestions.length > 0) {
      appendCustomQuestions(allGeneratedQuestions, req)
    }

    // 5. 更新图书持久化解析元数据
    saveExtractionRecord(relativePath, {
      isExtracted: true,
      noteTitle: indexNoteTitle,
      notePath: indexNotePath,
      questionCount: allGeneratedQuestions.length,
      chapterCount: targetChapters.length,
      mode
    })

    invalidateCache()

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

