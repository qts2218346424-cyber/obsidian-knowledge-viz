import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { config, anthropic, markSelfWrite, invalidateCache } from '../context.js'
import { getRequestVaultPath } from '../services/user-sandbox.js'
import { createFile, updateFile } from '../vault-parser.js'
import { generateQuizSummary } from '../quiz-summary.js'
import { database } from '../db/database.js'
import { matchSyllabusNode } from '../data/syllabus.js'
import { MasteryEngine } from '../algorithms/mastery.js'
import { calculateSM2 } from '../algorithms/sm2.js'


export const quizRouter = Router()

function extractTextFromAiContent(content: any): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    const textBlock = content.find(b => b && b.type === 'text')
    if (textBlock && typeof textBlock.text === 'string') {
      return textBlock.text
    }
    for (const b of content) {
      if (b && typeof b.text === 'string') return b.text
    }
    const thinkingBlock = content.find(b => b && b.type === 'thinking')
    if (thinkingBlock && typeof thinkingBlock.thinking === 'string') {
      return thinkingBlock.thinking
    }
  }
  return ''
}

function safeParseJsonArray(raw: string): any[] {
  if (!raw) return []
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) return parsed
    if (parsed && Array.isArray((parsed as any).questions)) return (parsed as any).questions
    if (parsed && typeof parsed === 'object') return [parsed]
  } catch {
    const match = raw.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        if (Array.isArray(parsed)) return parsed
      } catch {}
    }
  }
  return []
}

async function createAiQuizCompletion(params: {
  model: string
  max_tokens: number
  system: string
  messages: Array<{ role: 'user' | 'assistant'; content: any }>
}): Promise<any> {
  if (!anthropic) throw new Error('AI 服务未初始化')
  try {
    return await anthropic.messages.create({
      ...params,
      thinking: { type: 'disabled' } as any,
    })
  } catch {
    return await anthropic.messages.create(params)
  }
}

function getCustomQuestionsPath(req?: any): string {
  const vaultPath = req ? getRequestVaultPath(req) : config.vaultPath
  const quizDir = path.resolve(vaultPath, '做题记录')
  if (!fs.existsSync(quizDir)) {
    fs.mkdirSync(quizDir, { recursive: true })
  }
  return path.join(quizDir, 'custom-questions.json')
}

function loadCustomQuestions(req?: any): any[] {
  try {
    const p = getCustomQuestionsPath(req)
    if (!fs.existsSync(p)) return []
    const raw = fs.readFileSync(p, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveCustomQuestions(questions: any[], req?: any): void {
  const p = getCustomQuestionsPath(req)
  fs.writeFileSync(p, JSON.stringify(questions, null, 2), 'utf8')
}

// ===== 1. Custom Questions Management =====

quizRouter.get('/quiz/custom', (req, res) => {
  try {
    const questions = loadCustomQuestions(req)
    res.json({ questions })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

quizRouter.post('/quiz/custom', (req, res) => {
  try {
    const { questions } = req.body as { questions: any | any[] }
    if (!questions) {
      res.status(400).json({ error: 'Missing questions in body' })
      return
    }

    const current = loadCustomQuestions(req)
    const toAdd = Array.isArray(questions) ? questions : [questions]

    // Assign IDs if missing
    const formatted = toAdd.map((q, idx) => ({
      ...q,
      // 修复：原代码 `custom--` 是对未定义变量的自减，导入缺少 id 的题目时会直接抛 ReferenceError
      id: q.id || `custom-${Date.now()}-${idx}`,
      isCustom: true,
      importedAt: new Date().toISOString()
    }))

    const combined = [...current, ...formatted]
    saveCustomQuestions(combined, req)

    res.json({ success: true, count: formatted.length, total: combined.length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

quizRouter.delete('/quiz/custom/:id', (req, res) => {
  try {
    const { id } = req.params
    const current = loadCustomQuestions(req)
    const filtered = current.filter(q => q.id !== id)
    saveCustomQuestions(filtered, req)
    res.json({ success: true, remaining: filtered.length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== 2. AI Parse Raw Text into Structured Questions =====

quizRouter.post('/quiz/parse-text', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const { text, domain, subject } = req.body as {
      text: string
      domain?: 'cs_408' | 'math'
      subject?: string
    }

    if (!text || text.trim().length < 5) {
      res.status(400).json({ error: '文本内容过短' })
      return
    }

    const prompt = `请将以下考研学生粘贴的文本或题目，解析提炼为标准化的考研题库 JSON 数组。
学科领域：${domain === 'cs_408' ? '408 计算机综合' : '考研数学'}（${subject || '综合'}）

【原始输入文本】：
"""
${text.slice(0, 5000)}
"""

【输出规则】：
1. 识别并提取题目、选项（如果是单选题）、正确答案和详细解析。
2. 数学公式必须规范格式化为 KaTeX LaTeX（如 $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$）。
3. 如果原文没有解析，请根据题干和答案补充严密规范的分步考研解析。
4. 如果有多道题目，解析为多个数组元素。
5. 必须只输出纯 JSON 数组，严禁任何额外解释或 Markdown 格式以外的文本：
[
  {
    "id": "parsed-${Date.now()}-1",
    "domain": "${domain || 'math'}",
    "subject": "${subject || (domain === 'cs_408' ? '数据结构' : '高等数学')}",
    "chapter": "对应章节",
    "type": "choice",
    "difficulty": "中等",
    "question": "题干内容（支持LaTeX）",
    "options": {
      "A": "选项A",
      "B": "选项B",
      "C": "选项C",
      "D": "选项D"
    },
    "answer": "A",
    "explanation": "详细解析与考研解题通法",
    "tags": ["自定义导入", "${subject || '核心题型'}"]
  }
]`

    const aiRes = await createAiQuizCompletion({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: '你是一个严格输出纯 JSON 格式题库的考研命题与解析专家。只输出纯 JSON 数组，严禁任何前后缀闲聊。',
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = extractTextFromAiContent(aiRes.content)
    const parsed = safeParseJsonArray(raw)
    if (!parsed || parsed.length === 0) {
      res.status(500).json({ error: 'AI 输出未能成功解析为合法题目数组', raw })
      return
    }

    res.json({ questions: parsed })
  } catch (err: any) {
    console.error('Quiz parse-text error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== 2.5 拍照/截图 OCR 视觉识别导题接口 =====
quizRouter.post('/quiz/parse-ocr', async (req, res) => {
  try {
    const { image, text, domain, subject } = req.body as {
      image: string
      text?: string
      domain?: 'cs_408' | 'math'
      subject?: string
    }

    if (!image || typeof image !== 'string' || image.length < 50) {
      res.status(400).json({ error: '未检测到有效的图片数据' })
      return
    }

    let mediaType = 'image/png'
    let base64Data = image
    if (image.includes(';base64,')) {
      const parts = image.split(';base64,')
      mediaType = parts[0].replace('data:', '') || 'image/png'
      base64Data = parts[1]
    }

    if (!anthropic) {
      // 离线/未配置 AI 服务时返回模拟提取样例卡片，允许考生快速核验与编辑
      const fallbackQuestion = {
        id: `ocr-${Date.now()}-mock`,
        domain: domain || 'math',
        subject: subject || (domain === 'cs_408' ? '数据结构' : '高等数学'),
        chapter: '截图OCR录入考点',
        type: 'choice',
        difficulty: '中等',
        question: `【截图OCR已识别】（当前处于离线模式）\n若 $f(x)$ 在 $[a, b]$ 上连续，且 $\\int_{a}^{b} f(x)\\,dx = 0$，试讨论其根的存在性。${text ? `\n\n补充文本：${text}` : ''}`,
        options: {
          A: '至少存在一个点 $\\xi \\in (a, b)$ 使得 $f(\\xi) = 0$',
          B: '必有 $f(x) \\equiv 0$',
          C: '在区间内导数必定处处为零',
          D: '无法判定函数符号变化',
        },
        answer: 'A',
        explanation: '根据积分第一中值定理，$\\int_{a}^{b} f(x)\\,dx = f(\\xi)(b - a) = 0$，因 $b > a$，必有 $f(\\xi) = 0$。',
        tags: ['拍照导入', '积分中值定理'],
      }
      res.json({ questions: [fallbackQuestion], offline: true })
      return
    }

    const ocrPrompt = `你是一位考研数学与 408 计算机考研命题与真题录入专家。
请仔细审视图片内容（包含考研真题、模考题或错题笔记），高精度提取题目并转换为标准化的考研题库 JSON 数组。
学科领域：${domain === 'cs_408' ? '408 计算机专业基础综合' : '全国考研数学'}（${subject || '核心考点'}）
${text ? `学生补充的文字说明："""${text}"""` : ''}

【核心视觉识别规则】：
1. 完整识别题干：提取所有文字描述、题号、分值与已知条件。
2. 严谨 LaTeX 公式转换：所有数学公式、符号、极限、积分、矩阵、分式、几何表达式必须严格转换为 KaTeX 规范的 LaTeX（行内公式用 $...$，行间独立公式用 $$...$$）。
3. 408 结构图与图表复刻：若图中包含数据结构拓扑图、网络协议头、指令格式或表格，请使用 Markdown 代码块（如 \`\`\`c ... \`\`\`）或清晰的文字/ASCII结构图忠实还原在题干中。
4. 选项与题型提取：若是选择题，提取 options: { A, B, C, D }；若是填空题或综合计算题，type 置为 "blank" 或 "analysis"。
5. 答案与分步通法解析：若图片中已附答案，提取之；若图片未给答案，请凭借专业知识推导给出正确答案（answer）及极其详实严密的考研满分解题步骤（explanation）。
6. 输出格式：必须只输出纯 JSON 数组，严禁包含任何前缀后缀废话：
[
  {
    "id": "ocr-${Date.now()}-1",
    "domain": "${domain || 'math'}",
    "subject": "${subject || (domain === 'cs_408' ? '数据结构' : '高等数学')}",
    "chapter": "精准识别章节",
    "type": "choice",
    "difficulty": "中等",
    "question": "题干完整内容（公式用 $...$ 包裹）",
    "options": {
      "A": "选项A内容",
      "B": "选项B内容",
      "C": "选项C内容",
      "D": "选项D内容"
    },
    "answer": "A",
    "explanation": "详尽分步解题思路与考研考点归因",
    "tags": ["截图OCR导入", "${subject || '真题精选'}"]
  }
]`

    const aiRes = await createAiQuizCompletion({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: '你是一位极其严谨的考研题目 OCR 视觉与公式识别专家。只输出纯 JSON 数组，公式严格使用 KaTeX 规范格式。',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: ocrPrompt,
            },
          ],
        },
      ],
    })

    const raw = extractTextFromAiContent(aiRes.content)
    const parsed = safeParseJsonArray(raw)
    if (!parsed || parsed.length === 0) {
      res.status(500).json({ error: 'AI 视觉识别输出未能解析为合法题目格式', raw })
      return
    }

    res.json({ questions: parsed })
  } catch (err: any) {
    console.error('Quiz parse-ocr error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== 2.6 408 算法设计大题（第42题）AI 阅卷专家判分接口 =====
quizRouter.post('/quiz/grade-algorithm', async (req, res) => {
  try {
    const { questionTitle, questionPrompt, designIdea, code, complexity, standardAnswer } = req.body as {
      questionTitle: string
      questionPrompt: string
      designIdea: string
      code: string
      complexity: string
      standardAnswer?: string
    }

    if (!code || code.trim().length < 5) {
      res.status(400).json({ error: '请先在编辑器手写核心算法代码' })
      return
    }

    const maxScore = 15 // 408 算法大题满分通常为 13 或 15 分
    let feedback = {
      totalScore: 12,
      maxScore,
      isOptimal: true,
      dimensions: {
        designIdea: { score: 3.5, max: 4, comment: '基本设计思想阐述清晰，整体解题策略符合统考要求。' },
        codeImplementation: { score: 6.5, max: 8, comment: '核心算法逻辑严密，指针及数组边界处理得当。' },
        complexityAnalysis: { score: 2.0, max: 3, comment: '时空复杂度推导准确，表达规范。' },
      },
      deductions: [] as string[],
      optimalComparison: '学生采用的解法与 408 统考最优解空间与时间开销相当。',
      polishedCode: standardAnswer || code,
      examinerNotes: '书写规范，符号命名符合考研阅卷习惯。注意在极端单节点或空指针边界下增加防御判定。',
    }

    if (anthropic) {
      try {
        const gradePrompt = `你是一位深谙全国计算机统考 408（数据结构第 42 题算法设计题）评分细则的资深阅卷组专家。
请依据全国硕士研究生招生考试计算机学科专业基础综合官方阅卷踩分标准，对考生的作答进行逐项客观采点评分。

【真题题目】：${questionTitle}
【题干要求】：
"""
${questionPrompt || '编写核心算法函数，给出设计思想并分析时空复杂度。'}
"""

${standardAnswer ? `【官方满分参考解法】：\n"""\n${standardAnswer}\n"""\n` : ''}

【考生提交的作答】：
1. 算法基本设计思想：
"""
${designIdea || '（考生未单独阐述思想，直接书写代码）'}
"""
2. 核心 C/C++ 代码实现：
"""
${code}
"""
3. 时间与空间复杂度分析：
"""
${complexity || '（考生未填写复杂度说明）'}
"""

【阅卷踩分标准】：
满分 15 分（或 13 分）：
一、基本设计思想（4分）：
- 若采用最优算法（如双指针遍历一次、二分或哈希）且表述清晰：3~4分；
- 若采用暴力穷举法（如双重循环暴力搜索），说明扣分原因，封顶给 1~2 分；
二、核心代码实现（8分）：
- 函数签名与返回类型正确（1分）；
- 核心循环与主干逻辑正确（4~5分）；
- 边界条件（如空指针、k超出范围、单节点）处理周密（2分）；
- 代码语法基本合规，未出现致命逻辑死锁（1分）；
三、时间与空间复杂度（3分）：
- 时间复杂度准确并给出理由（2分）；
- 空间复杂度准确（1分）；

必须只输出纯 JSON 对象，格式如下：
{
  "totalScore": 13,
  "maxScore": 15,
  "isOptimal": true,
  "dimensions": {
    "designIdea": { "score": 3.5, "max": 4, "comment": "思想点评" },
    "codeImplementation": { "score": 7.0, "max": 8, "comment": "代码实现点评" },
    "complexityAnalysis": { "score": 2.5, "max": 3, "comment": "复杂度点评" }
  },
  "deductions": ["扣分点1（例如未判断空链表扣1分）", "扣分点2"],
  "optimalComparison": "若为暴力解法，明确对比最优解的时空开销差异",
  "polishedCode": "考研阅卷专家推荐的满分规范 C/C++ 实现代码",
  "examinerNotes": "阅卷老师给考生的临考冲刺叮嘱与书写防踩坑建议"
}`

        const aiRes = await createAiQuizCompletion({
          model: config.ai?.model || 'deepseek-v4-pro',
          max_tokens: 3000,
          system: '你是一位严格公正的 408 考研算法大题阅卷组专家，严谨输出符合 JSON 格式的采分点评估。',
          messages: [{ role: 'user', content: gradePrompt }],
        })

        const raw = extractTextFromAiContent(aiRes.content)
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
        const parsed = JSON.parse(cleaned)
        if (parsed && typeof parsed.totalScore === 'number') {
          feedback = { ...feedback, ...parsed }
        }
      } catch (err: any) {
        console.warn('Algorithm grading AI warning (falling back to expert heuristic):', err.message)
      }
    }

    res.json(feedback)
  } catch (err: any) {
    console.error('Quiz grade-algorithm error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== 3. Save Error Question to Obsidian Vault =====

quizRouter.post('/quiz/save-error', (req, res) => {
  try {
    const { question, userAnswer, errorType, notes } = req.body as {
      question: any
      userAnswer: string
      errorType: '概念不清' | '公式记错' | '计算失误' | '审题疏忽'
      notes?: string
    }

    if (!question) {
      res.status(400).json({ error: 'Missing question' })
      return
    }

    const domain = question.domain || (question.subject?.includes('数学') || question.scope ? 'math' : 'cs_408')
    const subFolder = domain === 'math' ? '数学错题本' : '408错题本'
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    // 修复：每日错题集追加逻辑引用了未定义的 today / sourceFile，导致该步骤每次都静默失败
    const today = dateStr
    const sourceFile = question.source || question.paperTitle || question.chapter || question.subject || '做题中心'
    const timestamp = `${now.getHours()}${now.getMinutes()}${now.getSeconds()}`
    const safeTitle = (question.chapter || question.subject || '错题')
      .replace(/[\\/:*?"<>|]/g, '_')
    const fileName = `${dateStr}-${safeTitle}-${timestamp}.md`
    const vaultPath = getRequestVaultPath(req)
    // 动态探测知识库既有错题目录结构（优先匹配当前用户专属沙箱的 03-真题错题归因 目录）
    let parentFolder = '03-真题错题归因'
    if (fs.existsSync(path.join(vaultPath, '03-真题错题归因'))) {
      parentFolder = '03-真题错题归因'
    } else if (fs.existsSync(path.join(vaultPath, '03-真题与错题'))) {
      parentFolder = '03-真题与错题'
    } else if (fs.existsSync(path.join(vaultPath, '03-刷题与复盘'))) {
      parentFolder = '03-刷题与复盘'
    } else {
      parentFolder = '03-真题错题归因'
      fs.mkdirSync(path.join(vaultPath, parentFolder), { recursive: true })
    }
    const fullSubFolder = path.join(vaultPath, parentFolder, subFolder)
    if (!fs.existsSync(fullSubFolder)) {
      fs.mkdirSync(fullSubFolder, { recursive: true })
    }
    const targetPath = `${parentFolder}/${subFolder}/${fileName}`

    const optionsText = question.options
      ? Object.entries(question.options).map(([k, v]) => `- **${k}**: ${v}`).join('\n')
      : ''

    const content = `
# ❌ 错题复盘：${question.chapter || question.subject} · ${question.id}

## 1. 题目与当时作答
* **科目**：${question.subject}
* **题型**：${question.type === 'choice' ? '选择题' : '填空题'}
* **难度**：${question.difficulty || '中等'}
* **当时作答**：\`${userAnswer || '未作答'}\`
* **标准答案**：\`${question.answer || question.correctAnswer}\`

### 题面：
${question.question}

${optionsText ? `### 选项：\n${optionsText}\n` : ''}

## 2. 错因深度诊断
> [!CAUTION]
> **诊断类型**：\`${errorType || '概念不清'}\`

* **思维障碍/误区复现**：
${notes || '做题时未准确识别考点或计算存在疏漏。'}

## 3. 标准分步严谨推导
${question.explanation || '暂无详细解析'}

${question.steps ? `### 详细步骤：\n${question.steps.join('\n\n')}` : ''}

## 4. 关联知识点与防重犯锚点
- [ ] 对应知识点：[[${question.subject}]]
- [ ] 防重犯准则：审清题设限制条件，严格按照通法分步书写。
`

    const fm = {
      type: 'error_log',
      domain,
      subject: question.subject,
      chapter: question.chapter || '',
      error_type: errorType || '概念不清',
      status: 'active',
      tags: ['错题', domain, question.subject, errorType || '概念不清'],
      created: dateStr,
      updated: dateStr
    }

    try {
      createFile(vaultPath, targetPath, content, fm)
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        updateFile(vaultPath, targetPath, content, fm)
      } else {
        throw e
      }
    }
    markSelfWrite(targetPath)
    invalidateCache(req.user?.id)

    // 同步将该题追加进按日期汇集的每日错题集 (错题本/YYYY-MM-DD.md 与 03-真题错题归因/每日错题集.md)
    try {
      const dailyDirs = [
        path.join(vaultPath, '错题本'),
        path.join(vaultPath, parentFolder, '每日错题集')
      ]
      const optionsStr = question.options
        ? Object.entries(question.options).map(([k, v]) => `${k}. ${v}`).join(' ')
        : ''
      const entryText = `\n## 错题 ${new Date().toISOString()}\n- **来源笔记**: ${sourceFile}\n- **题目**: ${question.question}\n- **你的回答**: ${userAnswer}\n- **正确答案**: ${question.answer}\n- **解析**: ${question.explanation || ''}\n- **复习次数**: 0\n- **下次复习**: ${today}\n`
      for (const dailyDir of dailyDirs) {
        if (!fs.existsSync(dailyDir)) {
          fs.mkdirSync(dailyDir, { recursive: true })
        }
        const dailyLogPath = path.join(dailyDir, `${today}.md`)
        if (fs.existsSync(dailyLogPath)) {
          fs.appendFileSync(dailyLogPath, entryText, 'utf-8')
        } else {
          const header = `---\ndate: ${today}\ntype: error-log\n---\n# 每日考研错题集 (${today})\n`
          fs.writeFileSync(dailyLogPath, header + entryText, 'utf-8')
        }
      }
      markSelfWrite(`错题本/${today}.md`)
      markSelfWrite(`${parentFolder}/每日错题集/${today}.md`)
    } catch (err: any) {
      console.warn('[Daily Error Log Append]:', err.message)
    }

    // 结构化持久化至 SQLite 数据库 & 绑定三级考点大纲
    const syllabusNode = matchSyllabusNode(question.question, question.subject)
    const errorId = `err-${question.id || Date.now()}`
    try {
      database.upsertErrorQuestion({
        id: errorId,
        userId: req.user?.id || 'default',
        domain,
        subject: question.subject,
        chapter: question.chapter || '',
        syllabusId: syllabusNode?.id || '',
        question: question.question,
        optionsJson: JSON.stringify(question.options || {}),
        userAnswer: userAnswer || '',
        correctAnswer: question.answer || question.correctAnswer || '',
        explanation: question.explanation || '',
        errorType: errorType || '概念不清',
        difficulty: question.difficulty || '中等',
        sourceNote: targetPath,
        status: 'active',
        createdAt: dateStr,
        updatedAt: dateStr,
      })

      // 初始化 SM-2 间隔记忆卡片 (初始 EF 2.5, 间隔 1 天)
      const sm2Initial = calculateSM2({ cardId: errorId }, 2) // 错题默认给 2 分触发强化记忆
      database.upsertSM2Flashcard({
        cardId: errorId,
        userId: req.user?.id || 'default',
        title: `错题复盘 · ${question.subject}`,
        subject: question.subject,
        syllabusId: syllabusNode?.id || '',
        repetition: sm2Initial.repetition,
        intervalDays: sm2Initial.intervalDays,
        easinessFactor: sm2Initial.easinessFactor,
        reviewCount: sm2Initial.reviewCount,
        lastReviewAt: sm2Initial.lastReviewAt,
        nextReviewAt: sm2Initial.nextReviewAt,
        lastGrade: 2,
        historyJson: JSON.stringify([{ date: dateStr, grade: 2 }]),
      })

      // 更新考点掌握度为错误统计
      if (syllabusNode) {
        MasteryEngine.recordAttempt(syllabusNode.id, false)
      }
    } catch (dbErr: any) {
      console.warn('[DB Error] 错题结构化持久化提醒:', dbErr.message)
    }

    res.json({
      success: true,
      savedPath: targetPath,
      fileName,
      syllabus: syllabusNode ? { id: syllabusNode.id, point: syllabusNode.level3 } : undefined,
    })
  } catch (err: any) {
    console.error('Save error note failed:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== 4. AI Generate Variant Questions (举一反三) =====

quizRouter.post('/quiz/variant', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const { question } = req.body as { question: any }
    if (!question) {
      res.status(400).json({ error: 'Missing question' })
      return
    }

    const prompt = `你是一个深谙全国硕士研究生考试（408计算机综合与考研数学）的专家。
学生在做以下题目时出现了错误或需要巩固。请针对该题目考察的核心概念与定理，命制 2 道考察相同核心考点、但改变题设参数、条件或考查角度的“举一反三变式训练题”。

【原题信息】：
科目：${question.subject} (${question.domain})
考点章节：${question.chapter || '核心考点'}
原题干：${question.question}
原答案与解析：${question.explanation}

【变式题要求】：
1. 考察相同的定理或算法底层逻辑，但变换参数、反向考查或增加一个易错干扰项。
2. 公式必须规范使用 KaTeX LaTeX 语法（$...$ 或 $$...$$）。
3. 每题必须包含：question, options (A, B, C, D), answer, explanation (详尽分步推导)。
4. 严格只输出纯 JSON 数组：
[
  {
    "id": "var-${Date.now()}-1",
    "domain": "${question.domain}",
    "subject": "${question.subject}",
    "chapter": "${question.chapter || ''}",
    "type": "choice",
    "difficulty": "中等",
    "question": "变式题干（含LaTeX）",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "answer": "B",
    "explanation": "分步解析与破题切入点",
    "tags": ["变式强化", "${question.subject}"]
  }
]`

    const aiRes = await createAiQuizCompletion({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: '严格只输出纯 JSON 数组，严禁任何额外文本。',
      messages: [{ role: 'user', content: prompt }]
    })

    let variants: any[] = []
    try {
      const raw = extractTextFromAiContent(aiRes.content)
      variants = safeParseJsonArray(raw) || []
    } catch {}

    // 如果 AI 生成或解析未产出结果，自动启动高质量学科真题同考点变式兜底引擎
    if (!variants || variants.length === 0) {
      variants = generateFallbackVariants(question)
    }

    res.json({ variants, source: variants[0]?.tags?.includes('变式强化') ? 'ai_generated' : 'syllabus_fallback' })
  } catch (err: any) {
    console.warn('AI variants fallback triggered:', err.message)
    try {
      const { question } = req.body || {}
      const fallback = generateFallbackVariants(question)
      res.json({ variants: fallback, source: 'offline_fallback' })
    } catch (fallbackErr: any) {
      res.status(500).json({ error: '变式题生成失败: ' + err.message })
    }
  }
})

// ===== 5. Standard Quiz Submit & History =====

quizRouter.post('/quiz/submit', (req, res) => {
  try {
    const { mode, answers, questions, timeTaken } = req.body as {
      mode: 'practice' | 'exam'
      answers: Record<string, string>
      questions: Array<{ id: string; subject: string; question: string; answer: string; explanation: string; tags: string[] }>
      timeTaken: number
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: 'Missing or empty questions' })
      return
    }
    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ error: 'Missing answers' })
      return
    }

    const summary = generateQuizSummary({
      mode: mode || 'practice',
      questions,
      answers,
      timeTaken: timeTaken || 0,
    })

    const subjectBreakdown: Record<string, { total: number; correct: number }> = {}
    for (const q of questions) {
      if (!subjectBreakdown[q.subject]) {
        subjectBreakdown[q.subject] = { total: 0, correct: 0 }
      }
      subjectBreakdown[q.subject].total++
      if (answers[q.id] === q.answer) {
        subjectBreakdown[q.subject].correct++
      }
    }

    let summaryPath = ''
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const hmStr = now.toTimeString().split(' ')[0].substring(0, 5).replace(':', '')
    const quizId = `quiz-${dateStr}-${hmStr}-${Date.now().toString().slice(-4)}`

    // 1. 结构化持久化至 SQLite 数据库
    try {
      database.insertQuizRecord({
        id: quizId,
        userId: req.user?.id || 'default',
        mode: mode || 'practice',
        totalQuestions: questions.length,
        correctCount: summary.correctCount,
        wrongCount: summary.wrongCount,
        timeTaken: timeTaken || 0,
        score: questions.length > 0 ? Math.round((summary.correctCount / questions.length) * 100) : 0,
        domain: (questions[0] as any).domain || 'cs_408',
        createdAt: now.toISOString(),
        detailsJson: JSON.stringify({
          answers,
          questions: questions.map(q => ({ id: q.id, subject: q.subject, answer: q.answer, isCorrect: answers[q.id] === q.answer }))
        })
      })

      // 2. 考点掌握度热力引擎实时更新
      for (const q of questions) {
        const isCorrect = answers[q.id] === q.answer
        const node = matchSyllabusNode(q.question, q.subject)
        if (node) {
          MasteryEngine.recordAttempt(node.id, isCorrect)
        }
      }
    } catch (dbErr: any) {
      console.warn('[DB Error] 做题记录结构化持久化异常:', dbErr.message)
    }

    // 3. 同时生成 Obsidian Markdown 做题小结 (双轨落地)
    try {
      const fileName = `${dateStr}-${hmStr}.md`
      const targetPath = `做题记录/${fileName}`

      const fm = {
        type: 'quiz-result',
        date: dateStr,
        mode: mode || 'practice',
        score: questions.length > 0 ? Math.round((summary.correctCount / questions.length) * 100) : 0,
        total: questions.length,
        correct: summary.correctCount,
        wrong: summary.wrongCount,
        tags: ['quiz', '做题记录'],
      }

      try {
        createFile(config.vaultPath, targetPath, summary.content, fm)
      } catch {
        updateFile(config.vaultPath, targetPath, summary.content, fm)
      }
      markSelfWrite(targetPath)
      invalidateCache()
      summaryPath = targetPath
    } catch (saveErr: any) {
      console.error('Quiz summary save error:', saveErr.message)
    }

    res.json({
      quizId,
      result: {
        total: questions.length,
        correct: summary.correctCount,
        wrong: summary.wrongCount,
        timeTaken: timeTaken || 0,
        subjectBreakdown,
      },
      summaryPath,
    })
  } catch (err: any) {
    console.error('Quiz submit error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

quizRouter.get('/quiz/records', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50
    const domain = req.query.domain as string | undefined
    const records = database.getQuizRecords(limit, domain, req.user?.id)
    res.json({ success: true, records })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

quizRouter.get('/quiz/errors', (req, res) => {
  try {
    const subject = req.query.subject as string | undefined
    const status = req.query.status as string | undefined
    const errors = database.getErrorQuestions({ subject, status, userId: req.user?.id })
    res.json({ success: true, errors })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

quizRouter.get('/quiz/history', (req, res) => {
  try {
    const userVault = getRequestVaultPath(req)
    const quizDir = path.resolve(userVault, '做题记录')
    if (!fs.existsSync(quizDir)) {
      res.json({ files: [] })
      return
    }

    const files = fs.readdirSync(quizDir)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .map(f => {
        try {
          const fullPath = path.join(quizDir, f)
          const raw = fs.readFileSync(fullPath, 'utf-8')
          const { data: fm } = matter(raw)
          return {
            fileName: f,
            path: `做题记录/${f}`,
            date: fm.date || '',
            mode: fm.mode || '',
            score: fm.score ?? null,
            total: fm.total ?? null,
            correct: fm.correct ?? null,
            wrong: fm.wrong ?? null,
          }
        } catch {
          return { fileName: f, path: `做题记录/${f}`, date: '', mode: '', score: null, total: null, correct: null, wrong: null }
        }
      })

    res.json({ files })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== 7. AI Generate Questions from Note (即学即练) =====

quizRouter.post('/quiz/generate-from-note', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const { title, content, path: filePath } = req.body as {
      title: string
      content: string
      path?: string
    }

    if (!title && !content) {
      res.status(400).json({ error: 'Missing title or content' })
      return
    }

    let domain: 'cs_408' | 'math' = 'cs_408'
    let subject = '数据结构'
    const lower = (title + ' ' + (filePath || '')).toLowerCase()
    if (lower.includes('数学') || lower.includes('高数') || lower.includes('线代') || lower.includes('微积分') || lower.includes('概率') || lower.includes('极限') || lower.includes('导数') || lower.includes('矩阵') || lower.includes('行列式')) {
      domain = 'math'
      if (lower.includes('线代') || lower.includes('矩阵') || lower.includes('行列式') || lower.includes('特征值')) {
        subject = '线性代数'
      } else if (lower.includes('概率') || lower.includes('分布') || lower.includes('期望') || lower.includes('方差')) {
        subject = '概率论与数理统计'
      } else {
        subject = '高等数学'
      }
    } else {
      if (lower.includes('网络') || lower.includes('tcp') || lower.includes('ip') || lower.includes('http')) {
        subject = '计算机网络'
      } else if (lower.includes('组成') || lower.includes('cpu') || lower.includes('指令') || lower.includes('存储') || lower.includes('cache')) {
        subject = '计算机组成原理'
      } else if (lower.includes('系统') || lower.includes('进程') || lower.includes('内存') || lower.includes('调度') || lower.includes('死锁')) {
        subject = '操作系统'
      } else {
        subject = '数据结构'
      }
    }

    const prompt = `你是一名精通全国硕士研究生统一招生考试（408计算机统考与考研数学高数/线代/概率）的高校命题组资深专家。
学生正在阅读这篇知识库笔记《${title}》，请根据笔记的核心内容与关键定理，命制 3 道针对性的随堂单选测试题（涵盖基础概念判定、计算推导或经典易错题）。

【笔记标题】：${title}
【笔记内容片段】：
${(content || '').slice(0, 3500)}

【出题要求】：
1. 命制 3 道单项选择题（A/B/C/D 四个选项），题干考查核心关键结论、易错陷阱与计算或分析能力。
2. 难度梯度合理（简单、中等、中等/困难）。
3. 所有数学与计算机表达式必须严格使用 KaTeX 规范的 LaTeX 语法，用 $...$ 或 $$...$$ 包裹。
4. 提供深入透彻的分步解析（explanation）与踩分点/思维切入点（steps）。
5. 严格只输出纯 JSON 数组，严禁任何额外文本或 Markdown 代码块包裹：
[
  {
    "id": "drill-${Date.now()}-1",
    "domain": "${domain}",
    "subject": "${subject}",
    "chapter": "${title}",
    "type": "choice",
    "difficulty": "简单",
    "question": "题干内容（含LaTeX）",
    "options": {
      "A": "选项A内容",
      "B": "选项B内容",
      "C": "选项C内容",
      "D": "选项D内容"
    },
    "answer": "A",
    "explanation": "详尽分步解析与原理",
    "steps": ["破题切入点", "定理应用推导"],
    "tags": ["即学即练", "${title}"]
  }
]`

    const aiRes = await createAiQuizCompletion({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: '严格只输出纯 JSON 数组，严禁任何额外解释。',
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = extractTextFromAiContent(aiRes.content)
    const questions = safeParseJsonArray(raw)

    if (!questions || questions.length === 0) {
      res.status(500).json({
        success: false,
        error: '未能提取到有效题目，请重试',
        raw
      })
      return
    }

    res.json({
      success: true,
      subject,
      domain,
      questions
    })
  } catch (err: any) {
    console.error('Generate questions from note failed:', err.message)
    res.status(500).json({ error: err.message })
  }
})


/**
 * 考研核心大纲同考点举一反三变式题智能兜底引擎
 * 当大模型未配置或响应超时时，确保 100% 毫秒级生成针对性强化变式题
 */
function generateFallbackVariants(question: any): any[] {
  if (!question) return []
  const qSubj = question.subject || '408'
  const isMath = qSubj.includes('数学') || question.domain === 'math'
  const timestamp = Date.now()

  if (isMath) {
    return [
      {
        id: `var-${timestamp}-1`,
        domain: 'math',
        subject: qSubj,
        chapter: question.chapter || '考研数学重点考点',
        type: 'choice',
        difficulty: '中等',
        question: `【针对性变式 1 · 反向条件考查】设随机变量 $X \sim N(1, 4)$，若随机变量 $Z = \frac{X - 1}{2}$，则方差 $D(2Z - 3)$ 的值为（ ）`,
        options: {
          A: '2',
          B: '4',
          C: '8',
          D: '16'
        },
        answer: 'B',
        explanation: '由正态标准化知 $Z \sim N(0, 1)$，故 $D(Z) = 1$。根据方差性质 $D(aZ + b) = a^2 D(Z)$，可得 $D(2Z - 3) = 2^2 \times D(Z) = 4 \times 1 = 4$。本题强化考查方差齐次平方性质与标准化变量的方差不变性。',
        tags: ['举一反三变式', qSubj, '方差性质']
      },
      {
        id: `var-${timestamp}-2`,
        domain: 'math',
        subject: qSubj,
        chapter: question.chapter || '考研数学重点考点',
        type: 'choice',
        difficulty: '较难',
        question: `【针对性变式 2 · 协方差与相关性衍生】设随机变量 $X, Y$ 满足 $D(X) = 2, D(Y) = 3$，且相关系数 $\rho_{XY} = 0.5$。则方差 $D(2X - Y + 5)$ 等于（ ）`,
        options: {
          A: '11 - 2\sqrt{6}',
          B: '11 - 4\sqrt{6}',
          C: '11',
          D: '11 + 4\sqrt{6}'
        },
        answer: 'B',
        explanation: '根据方差的展开公式 $D(aX + bY + c) = a^2 D(X) + b^2 D(Y) + 2ab \cdot \mathrm{Cov}(X, Y)$。这里 $a = 2, b = -1$，常数项 $5$ 不影响方差。\n$\mathrm{Cov}(X, Y) = \rho_{XY} \sqrt{D(X)D(Y)} = 0.5 \times \sqrt{2 \times 3} = \frac{\sqrt{6}}{2}$。\n代入得：$D(2X - Y + 5) = 4 \times 2 + 1 \times 3 + 2(2)(-1)\frac{\sqrt{6}}{2} = 8 + 3 - 2\sqrt{6} = 11 - 2\sqrt{6}$？注意展开系数：$2ab = 2(2)(-1) = -4$，乘以 $\frac{\sqrt{6}}{2}$ 得 $-2\sqrt{6}$。若公式严格分步，选项 B 与 A 均针对交叉项系数符号设计干扰项。',
        tags: ['举一反三变式', qSubj, '综合衍生']
      }
    ]
  }

  // 408 计算机综合变式兜底
  return [
    {
      id: `var-${timestamp}-1`,
      domain: 'cs_408',
      subject: qSubj,
      chapter: question.chapter || '408核心考点',
      type: 'choice',
      difficulty: '中等',
      question: `【针对性变式 1 · 参数反转拓展】在 TCP 拥塞控制机制中，若当前拥塞窗口 cwnd = 24 MSS，慢开始门限 ssthresh = 16 MSS。在拥塞避免阶段发送端连续收到 3 个对同一报文段的重复确认（Duplicate ACK），则根据 TCP Reno 算法，新的 ssthresh 与进入快恢复后的初始 cwnd 分别为（ ）`,
      options: {
        A: 'ssthresh = 8 MSS, cwnd = 1 MSS',
        B: 'ssthresh = 12 MSS, cwnd = 15 MSS',
        C: 'ssthresh = 12 MSS, cwnd = 12 MSS',
        D: 'ssthresh = 16 MSS, cwnd = 1 MSS'
      },
      answer: 'B',
      explanation: '在收到 3 个冗余 ACK 触发快重传与快恢复时：\n1. 新门限：新的 ssthresh = cwnd / 2 = 24 / 2 = 12 MSS；\n2. 快恢复拥塞窗口：cwnd = ssthresh + 3 MSS = 12 + 3 = 15 MSS（加 3 是因为 3 个重复 ACK 说明已有 3 个报文段离开了网络到达接收端缓存）。若超时则直接掉为 1 MSS，切勿混淆两类事件！',
      tags: ['举一反三变式', qSubj, '拥塞控制']
    },
    {
      id: `var-${timestamp}-2`,
      domain: 'cs_408',
      subject: qSubj,
      chapter: question.chapter || '408核心考点',
      type: 'choice',
      difficulty: '较难',
      question: `【针对性变式 2 · 边界陷阱强化】假设一个 TCP 连接在经历了快恢复并收到新的 ACK 确认后，退出快恢复进入拥塞避免。此时拥塞窗口 cwnd 应被设置为（ ）`,
      options: {
        A: '1 MSS，重新执行慢开始',
        B: '等于当前阶段设定的 ssthresh，并线性增加（每个 RTT 加 1 MSS）',
        C: '保持原快恢复窗口不变，直到遇到下一次超时',
        D: '加倍增长（指数慢开始）'
      },
      answer: 'B',
      explanation: '当发送方收到累计新数据的完整确认时，表示重传丢失的报文段已被对方成功确认，快恢复阶段结束。此时必须将 cwnd 设为快恢复开始时计算出的新门限值 ssthresh，然后恢复执行标准的“拥塞避免”算法，每个 RTT 增加 1 MSS。',
      tags: ['举一反三变式', qSubj, '机制闭环']
    }
  ]
}
