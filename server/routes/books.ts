import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { config, anthropic, markSelfWrite, invalidateCache } from '../context.js'
import { createFile } from '../vault-parser.js'

export const booksRouter = Router()

// Configure multer for file uploads into raw-sources
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const domain = (req.body.domain as string) || 'math' // 'math' | 'cs_408'
    const category = (req.body.category as string) || '教材' // '教材' | '真题' | '辅导讲义' | '模拟题'
    
    let subDir = domain === 'cs_408' ? '408计算机' : '考研数学'
    let fullDest = path.join(config.vaultPath, 'raw-sources', subDir, category)
    
    if (!fs.existsSync(fullDest)) {
      fs.mkdirSync(fullDest, { recursive: true })
    }
    cb(null, fullDest)
  },
  filename: (_req, file, cb) => {
    // Handle UTF-8 encoding for Chinese filenames
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, originalName)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
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
}

/**
 * Scan raw-sources directory for reference books, past papers and materials
 */
booksRouter.get('/books/list', (_req, res) => {
  try {
    const rawSourcesDir = path.join(config.vaultPath, 'raw-sources')
    if (!fs.existsSync(rawSourcesDir)) {
      res.json({ books: [] })
      return
    }

    const books: BookItem[] = []
    const readableExts = new Set(['.md', '.txt', '.markdown'])

    function scan(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scan(fullPath)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          const stat = fs.statSync(fullPath)
          const relPath = path.relative(config.vaultPath, fullPath).replace(/\\/g, '/')
          
          let domain: 'cs_408' | 'math' = 'math'
          if (relPath.includes('408') || relPath.includes('数据结构') || relPath.includes('计算机')) {
            domain = 'cs_408'
          }

          let category = '资料'
          if (relPath.includes('真题')) category = '历年真题'
          else if (relPath.includes('教材')) category = '经典教材'
          else if (relPath.includes('辅导讲义') || relPath.includes('参考书')) category = '辅导讲义'
          else if (relPath.includes('模拟题')) category = '模拟题卷'

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
            isTextReadable: readableExts.has(ext),
          })
        }
      }
    }

    scan(rawSourcesDir)
    res.json({ books })
  } catch (err: any) {
    console.error('Failed to list books:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * Upload reference book / notes into raw-sources
 */
booksRouter.post('/books/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '未选择任何上传文件' })
      return
    }

    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    const relPath = path.relative(config.vaultPath, req.file.path).replace(/\\/g, '/')

    invalidateCache()
    res.json({
      success: true,
      file: {
        name: originalName,
        relativePath: relPath,
        size: req.file.size
      }
    })
  } catch (err: any) {
    console.error('Upload book error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * Read text content from a readable material
 */
booksRouter.post('/books/read', (req, res) => {
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

    const stat = fs.statSync(fullPath)
    // Only read if < 5MB text
    if (stat.size > 5 * 1024 * 1024) {
      res.status(400).json({ error: '文件过大，不支持直接全文文本加载' })
      return
    }

    const content = fs.readFileSync(fullPath, 'utf8')
    res.json({ content, name: path.basename(fullPath) })
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
   - 每题必须包含：question, type (choice / blank), options (A, B, C, D 选项，如果是选择题), correctAnswer, explanation (分步深度推导), difficulty (简单/中等/困难)

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
      max_tokens: 4096,
      system: '你是一个严格输出结构化 JSON 的考研知识提炼引擎。必须只输出纯 JSON 对象，格式必须符合要求，严禁包含任何前缀闲聊。',
      messages: [{ role: 'user', content: prompt }]
    })

    const rawText = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '{}'
    
    // Parse JSON
    let parsed: any = {}
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        parsed = JSON.parse(rawText)
      }
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

    res.json({
      success: true,
      note: parsed.note,
      questions: parsed.questions || [],
      savedNotePath
    })
  } catch (err: any) {
    console.error('AI book extract error:', err.message)
    res.status(500).json({ error: err.message })
  }
})
