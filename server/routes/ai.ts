import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {
  config,
  anthropic,
  getNotes,
  invalidateCache,
  summarizeAiError,
  proxyFetch,
  getAiClientForModel,
} from '../context.js'
import { createAiClient, type AiConfig, type CloudEndpoint } from '../ai-client.js'
import { createFile, type VaultNote } from '../vault-parser.js'
import { checkHealth } from '../health-checker.js'
import { runAgentLoop, type AgentEvent } from '../agent.js'
import { runStepTutor, type TutorMode } from '../services/step-tutor.js'


export const aiRouter = Router()

// 辅助函数：根据用户填写的 Base URL 智能推导候选端点，真实扫描可用模型列表
async function fetchRemoteModels(baseURL: string, apiKey: string) {
  const trimmed = baseURL.replace(/\/+$/, '')
  const candidateUrls = new Set<string>()

  // 1. 直连探测
  candidateUrls.add(`${trimmed}/v1/models`)
  candidateUrls.add(`${trimmed}/models`)

  // 2. 若带有子路径（如 /anthropic 或 /v1），派生其根域名与父路径探测
  try {
    const parsed = new URL(trimmed)
    candidateUrls.add(`${parsed.origin}/v1/models`)
    candidateUrls.add(`${parsed.origin}/models`)
    const parts = parsed.pathname.split('/').filter(Boolean)
    if (parts.length > 0) {
      parts.pop()
      const parent = `${parsed.origin}${parts.length > 0 ? '/' + parts.join('/') : ''}`
      candidateUrls.add(`${parent}/v1/models`)
      candidateUrls.add(`${parent}/models`)
    }
  } catch {}

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  }

  for (const url of candidateUrls) {
    try {
      const resp = await proxyFetch(url, { headers, signal: AbortSignal.timeout(6000) })
      if (resp.ok) {
        const data = await resp.json()
        const rawList = data?.data || data?.models || (Array.isArray(data) ? data : [])
        if (Array.isArray(rawList)) {
          const models = rawList.map((m: any) => {
            const id = typeof m === 'string' ? m : (m.id || m.model_id || m.name)
            const name = typeof m === 'string' ? m : (m.name || m.display_name || m.id)
            return { id, name }
          }).filter((m: any) => m.id && typeof m.id === 'string' && m.id.length > 0)

          if (models.length > 0) {
            return models
          }
        }
      }
    } catch {
      // 继续尝试下一候选 URL
    }
  }
  return null
}

// ===== AI Test =====

aiRouter.post('/ai/test', async (req, res) => {
  const reqApiKey = req.body?.apiKey
  const reqBaseURL = req.body?.baseURL
  const reqApiFormat = req.body?.apiFormat
  const reqEndpointId = req.body?.endpointId
  const reqModel = req.body?.model

  let clientToUse = anthropic
  let modelToUse = reqModel || 'deepseek-v4-pro'
  let providerToUse = config.ai?.provider || (config.ai?.apiFormat === 'openai' ? 'openai-compatible' : 'anthropic')

  // 1. 如果请求体自带了特定的 apiKey 和 baseURL（例如正在设置页编辑某个独立接口时即时测试）
  if (reqApiKey && reqBaseURL) {
    let resolvedKey = reqApiKey
    if (resolvedKey.includes('...')) {
      if (reqEndpointId && config.ai?.endpoints) {
        const ep = config.ai.endpoints.find(e => e.id === reqEndpointId)
        if (ep?.apiKey) resolvedKey = ep.apiKey
      } else if (config.ai?.apiKey) {
        resolvedKey = config.ai.apiKey
      }
    }
    const tempConfig: AiConfig = {
      apiKey: resolvedKey,
      baseURL: reqBaseURL,
      apiFormat: reqApiFormat || 'anthropic',
      provider: reqApiFormat === 'openai' ? 'openai-compatible' : 'anthropic',
    }
    clientToUse = createAiClient(tempConfig)
    providerToUse = tempConfig.provider!
    modelToUse = reqModel || (reqApiFormat === 'openai' ? 'deepseek-v4-pro' : 'claude-3-5-sonnet-20241022')
  } else {
    // 2. 根据 model 或 endpointId 定位已配置客户端
    const target = getAiClientForModel(reqModel, reqEndpointId)
    if (target) {
      clientToUse = target.client
      modelToUse = target.model
      if (target.endpoint) {
        providerToUse = target.endpoint.apiFormat === 'openai' ? 'openai-compatible' : 'anthropic'
      }
    }
  }

  if (!clientToUse) {
    res.status(503).json({ ok: false, error: 'AI 尚未配置或对应接口不存在，请检查设置' })
    return
  }

  try {
    const response = await clientToUse.messages.create({
      model: modelToUse,
      max_tokens: 128,
      system: '只回复 OK，不要添加其他内容。',
      messages: [{ role: 'user', content: '连接测试' }],
    })
    const reply = response.content.find(block => block.type === 'text')?.text || '已收到模型响应'
    res.json({
      ok: true,
      provider: providerToUse,
      model: modelToUse,
      reply,
    })
  } catch (err: any) {
    const detail = summarizeAiError(err)
    res.status(detail.status && detail.status >= 400 ? detail.status : 502).json({
      ok: false,
      provider: providerToUse,
      model: modelToUse,
      error: detail.message,
      status: detail.status,
    })
  }
})

// ===== AI Models =====

aiRouter.get('/ai/models', async (req, res) => {
  const queryEndpointId = req.query.endpointId as string | undefined
  const queryBaseURL = req.query.baseURL as string | undefined
  const queryApiKey = req.query.apiKey as string | undefined

  // 1. 如果指定了特定接口参数（从设置页单独拉取某个接口的模型）
  if (queryBaseURL || queryEndpointId) {
    let targetBaseURL = queryBaseURL || ''
    let targetApiKey = queryApiKey || ''

    if (queryEndpointId && config.ai?.endpoints) {
      const ep = config.ai.endpoints.find(e => e.id === queryEndpointId)
      if (ep) {
        if (!targetBaseURL) targetBaseURL = ep.baseURL
        if (!targetApiKey || targetApiKey.includes('...')) targetApiKey = ep.apiKey
      }
    }

    if (targetApiKey && targetApiKey.includes('...') && config.ai?.apiKey) {
      targetApiKey = config.ai.apiKey
    }

    if (!targetBaseURL || !targetApiKey) {
      res.status(400).json({ error: '请先填写该接口的 Base URL 与 API Key' })
      return
    }

    const fetched = await fetchRemoteModels(targetBaseURL, targetApiKey)
    if (fetched && fetched.length > 0) {
      res.json({ models: fetched, current: '', source: 'api' })
      return
    }

    res.json({
      models: [],
      current: '',
      source: 'none',
      message: '未能从该接口扫描到可用模型，请检查 Base URL、API Key 或网络，亦可在下方手动输入添加'
    })
    return
  }

  // 2. 如果存在多接口配置，聚合返回所有接口的模型信息
  if (config.ai?.endpoints && config.ai.endpoints.length > 0) {
    const aggregatedModels: { id: string; name: string; model: string; endpointId: string; endpointName: string }[] = []
    for (const ep of config.ai.endpoints) {
      const epModels = ep.models || (ep.defaultModel ? [ep.defaultModel] : [])
      for (const m of epModels) {
        aggregatedModels.push({
          id: `${ep.id}::${m}`,
          name: `${m} (${ep.name})`,
          model: m,
          endpointId: ep.id,
          endpointName: ep.name,
        })
      }
    }

    res.json({
      endpoints: config.ai.endpoints,
      models: aggregatedModels,
      current: config.ai.model || '',
      source: 'endpoints',
    })
    return
  }

  // 3. 兜底旧单配置
  if (!config.ai?.apiKey || !config.ai?.baseURL) {
    res.status(400).json({ error: 'AI 未配置，请先设置 API Key 和 Base URL' })
    return
  }

  const fetched = await fetchRemoteModels(config.ai.baseURL, config.ai.apiKey)
  if (fetched && fetched.length > 0) {
    res.json({ models: fetched, current: config.ai.model || '', source: 'api' })
    return
  }

  // 若远程接口未开放 /models 端点，但用户配置了主模型，则仅展示用户配置的真实模型
  const realModels: { id: string; name: string }[] = []
  if (Array.isArray(config.ai.models) && config.ai.models.length > 0) {
    for (const m of config.ai.models) {
      realModels.push({ id: m, name: m })
    }
  } else if (config.ai.model) {
    realModels.push({ id: config.ai.model, name: config.ai.model })
  }

  res.json({
    models: realModels,
    current: config.ai.model || '',
    source: realModels.length > 0 ? 'config' : 'none'
  })
})

// ===== Basic Chat =====

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function findRelevantNotes(message: string, notes: VaultNote[]): VaultNote[] {
  const msgLower = message.toLowerCase()
  return notes
    .map(note => {
      let score = 0
      const titleLower = note.title.toLowerCase()
      const tagsLower = note.tags.map(t => t.toLowerCase())
      if (msgLower.includes(titleLower) || titleLower.includes(msgLower)) score += 5
      for (const tag of tagsLower) {
        if (msgLower.includes(tag)) score += 2
      }
      const segments = msgLower.split(/[\s?？!！。，,.]+/).filter((s: string) => s.length > 1)
      const text = `${note.title} ${note.tags.join(' ')} ${note.content.substring(0, 500)}`.toLowerCase()
      for (const seg of segments) {
        if (text.includes(seg)) score += 1
      }
      const titleWords = titleLower.split(/[\s-]+/).filter((w: string) => w.length > 1)
      for (const tw of titleWords) {
        if (msgLower.includes(tw)) score += 2
      }
      return { note, score }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => r.note)
}

function buildSystemPrompt(relevantNotes: VaultNote[], totalNotes: number): string {
  let prompt = `你是一个面向 408 计算机与考研数学的专业知识库 AI 助手，帮助用户查询、推导和理解知识库中的内容。
知识库共有 ${totalNotes} 篇笔记。

请遵守以下规则：
1. 回答时引用相关笔记，使用格式 **[笔记标题](笔记路径)**
2. 如果知识库中有相关内容，优先基于知识库回答
3. 若涉及数学公式推导，必须使用标准 LaTeX 格式（行内使用 $...$，独立块使用 $$...$$），严禁跳步
4. 回答要简洁、严谨、准确，使用中文
5. 适当总结多篇笔记的关联信息`

  if (relevantNotes.length > 0) {
    prompt += '\n\n以下是与用户问题最相关的笔记内容，请基于这些内容回答：\n'
    for (const note of relevantNotes) {
      prompt += `\n--- 笔记: ${note.title} (路径: ${note.path}) ---\n`
      prompt += `标签: ${note.tags.join(', ')}\n`
      prompt += note.content.substring(0, 1500) + '\n'
    }
  }

  return prompt
}

aiRouter.post('/chat', async (req, res) => {
  const { message, history, model: reqModel } = req.body as { message: string; history?: ChatMessage[]; model?: string }
  if (!message) {
    res.status(400).json({ error: 'Missing message' })
    return
  }

  const notes = getNotes()
  const relevantNotes = findRelevantNotes(message, notes)

  const citedNotes = relevantNotes.slice(0, 3).map(note => ({
    title: note.title,
    path: note.path,
    excerpt: note.content.substring(0, 200),
    tags: note.tags.slice(0, 3),
  }))

  const aiTarget = getAiClientForModel(reqModel)
  if (!aiTarget) {
    let reply: string
    if (citedNotes.length > 0) {
      reply = `根据你的问题，我在知识库中找到了 ${citedNotes.length} 篇相关笔记：\n\n`
      for (const cn of citedNotes) {
        reply += `**${cn.title}** — ${cn.excerpt.substring(0, 100)}...\n\n`
      }
      reply += '这些笔记可能包含你需要的信息。你可以点击上方的笔记卡片查看详情。'
    } else {
      reply = '我在知识库中没有找到与你的问题直接相关的笔记。试试换一些关键词。'
    }
    res.json({ reply, citedNotes, timestamp: new Date().toISOString() })
    return
  }

  try {
    const systemPrompt = buildSystemPrompt(relevantNotes, notes.length)

    const messages: { role: 'user' | 'assistant'; content: string }[] = []
    if (history) {
      for (const h of history.slice(-10)) {
        if (h.role === 'user' || h.role === 'assistant') {
          messages.push({ role: h.role, content: h.content })
        }
      }
    }
    messages.push({ role: 'user', content: message })

    const response = await aiTarget.client.messages.create({
      model: aiTarget.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const reply =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '抱歉，无法生成回复。'

    res.json({ reply, citedNotes, timestamp: new Date().toISOString() })
  } catch (err: any) {
    console.error('AI API error:', err.message)
    let reply = '抱歉，AI 服务暂时不可用。'
    if (citedNotes.length > 0) {
      reply += `\n\n不过我在知识库中找到了 ${citedNotes.length} 篇可能相关的笔记：\n\n`
      for (const cn of citedNotes) {
        reply += `**${cn.title}** — ${cn.excerpt.substring(0, 100)}...\n\n`
      }
    }
    res.json({ reply, citedNotes, timestamp: new Date().toISOString() })
  }
})

// ===== Agent Chat (SSE Streaming) =====

aiRouter.post('/agent/chat', async (req, res) => {
  const { message, history, model: reqModel } = req.body as {
    message: string
    history?: { role: 'user' | 'assistant'; content: string }[]
    model?: string
  }
  if (!message) {
    res.status(400).json({ error: 'Missing message' })
    return
  }

  const aiTarget = getAiClientForModel(reqModel)
  if (!aiTarget) {
    const notes = getNotes()
    const relevant = findRelevantNotes(message, notes)
    let reply: string
    if (relevant.length > 0) {
      reply = `根据你的问题，找到 ${relevant.length} 篇相关笔记：\n\n`
      for (const n of relevant.slice(0, 3)) {
        reply += `**${n.title}** (${n.path}) — ${n.content.substring(0, 100)}...\n\n`
      }
    } else {
      reply = '未找到相关笔记。请尝试更具体的关键词。'
    }
    res.json({ reply, citedNotes: relevant.slice(0, 3).map(n => ({ title: n.title, path: n.path })), timestamp: new Date().toISOString() })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const sendEvent = (event: AgentEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  try {
    const messages: { role: 'user' | 'assistant'; content: string }[] = []
    if (history) {
      for (const h of history.slice(-10)) {
        if (h.role === 'user' || h.role === 'assistant') {
          messages.push({ role: h.role, content: h.content })
        }
      }
    }
    messages.push({ role: 'user', content: message })

    for await (const event of runAgentLoop(
      aiTarget.client,
      aiTarget.model,
      messages,
      config.vaultPath,
    )) {
      sendEvent(event)
      if (event.type === 'error') break
    }
  } catch (err: any) {
    sendEvent({ type: 'error', content: err.message })
  }

  res.end()
})

// ===== Research (自动知识探索) =====

aiRouter.post('/research', async (req, res) => {
  try {
    const { topic, auto } = req.body as { topic?: string; auto?: boolean }

    let researchTopic = topic
    if (!researchTopic && auto) {
      const notes = getNotes()
      const health = checkHealth(notes, config.vaultPath)
      const gapCategory = health.categories.find(c => c.name === 'knowledge_gaps')
      if (gapCategory && gapCategory.issues.length > 0) {
        const gapMsg = gapCategory.issues[0].message
        const match = gapMsg.match(/"([^"]+)"/)
        if (match) researchTopic = match[1]
      }
    }

    if (!researchTopic) {
      res.status(400).json({ error: 'No topic provided and no knowledge gaps found' })
      return
    }

    const aiTarget = getAiClientForModel()
    if (!aiTarget) {
      res.status(500).json({ error: 'AI not configured, cannot generate research note' })
      return
    }

    const notes = getNotes()
    const existingTags = [...new Set(notes.flatMap(n => n.tags))].slice(0, 20)
    const existingTitles = notes.map(n => n.title).slice(0, 30)

    const prompt = `请为知识库生成一篇关于"${researchTopic}"的结构化笔记。

知识库现有标签参考：${existingTags.join(', ')}
知识库现有笔记参考：${existingTitles.join(', ')}

要求：
1. 内容全面、结构清晰，使用 Markdown 格式
2. 包含概念定义、核心要点、应用场景及关键公式（如有公式必须使用 LaTeX 格式）
3. 适当使用 [[wikilinks]] 引用知识库中已有的相关笔记
4. 使用中文撰写

请直接返回 Markdown 内容，不需要 frontmatter（会自动生成）。`

    const aiRes = await aiTarget.client.messages.create({
      model: aiTarget.model,
      max_tokens: 2048,
      system: '你是一个知识管理助手，负责为 Obsidian 知识库生成高质量的结构化笔记。只返回 Markdown 内容。',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = aiRes.content[0].type === 'text' ? aiRes.content[0].text : ''
    if (!content.trim()) {
      res.status(500).json({ error: 'AI generated empty content' })
      return
    }

    const frontmatter: Record<string, any> = {
      title: researchTopic,
      tags: ['research', 'auto-generated'],
      created: new Date().toISOString().split('T')[0],
      source: 'auto-research',
    }

    const safeName = researchTopic.replace(/[<>:"/\\|?*]/g, '_')
    const targetPath = `Research/${safeName}.md`
    let finalPath = targetPath
    let counter = 1
    while (fs.existsSync(path.resolve(config.vaultPath, finalPath))) {
      finalPath = `Research/${safeName}-${counter}.md`
      counter++
    }

    const note = createFile(config.vaultPath, finalPath, content, frontmatter)
    invalidateCache()

    res.json({
      topic: researchTopic,
      path: note.path,
      wordCount: note.wordCount,
      preview: content.substring(0, 500),
    })
  } catch (err: any) {
    console.error('Research error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

aiRouter.get('/research/gaps', (_req, res) => {
  try {
    const notes = getNotes()
    const health = checkHealth(notes, config.vaultPath)
    const gapCategory = health.categories.find(c => c.name === 'knowledge_gaps')
    const gaps = gapCategory?.issues.map(i => {
      const match = i.message.match(/"([^"]+)" 被 (\d+) 篇/)
      return match ? { topic: match[1], references: parseInt(match[2]) } : null
    }).filter(Boolean) || []
    res.json({ gaps })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Defuddle (网页抓取并提取) =====

function isYouTubeURL(url: string): boolean {
  return /youtube\.com\/watch|youtu\.be\//i.test(url)
}

async function fetchYouTubeInfo(url: string): Promise<{ title: string; description: string; author: string } | null> {
  try {
    const oembedURL = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    const resp = await proxyFetch(oembedURL, { signal: AbortSignal.timeout(8000) })
    if (resp.ok) {
      const data = await resp.json()
      return { title: data.title || '', description: data.author_name || '', author: data.author_name || '' }
    }
  } catch {
    // ignore
  }
  return null
}

aiRouter.post('/defuddle', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置，请先在设置中配置 API Key' })
      return
    }
    const { url, targetFolder } = req.body as { url: string; targetFolder?: string }
    if (!url) {
      res.status(400).json({ error: '缺少 url 参数' })
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)
    let html = ''
    try {
      const resp = await proxyFetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ObsidianViz/1.2' },
      })
      if (!resp.ok) {
        res.status(400).json({ error: `网页请求失败 (HTTP ${resp.status})，请检查 URL 是否正确且可访问` })
        return
      }
      html = await resp.text()
    } finally {
      clearTimeout(timeout)
    }

    let textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000)

    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]
      || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1]
      || ''
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)?.[1] || ''

    let extraContext = ''
    if (isYouTubeURL(url)) {
      const ytInfo = await fetchYouTubeInfo(url)
      if (ytInfo) {
        extraContext = `\n[视频信息]\n标题: ${ytInfo.title}\n作者: ${ytInfo.author}\n`
      }
      if (textContent.length < 500) {
        textContent = `[这是一个 YouTube 视频页面，网页内容无法直接提取]\n${extraContext}\n${metaDesc ? `描述: ${metaDesc}` : ''}`
      }
    }

    if (textContent.length < 100 && !extraContext) {
      const hint = ogTitle || metaDesc
        ? `页面标题: ${ogTitle}\n描述: ${metaDesc}`
        : '页面内容为空或极少，可能是 JS 渲染的动态页面，服务端无法直接获取'
      res.status(400).json({
        error: `抓取到的内容太少（${textContent.length} 字）。${hint}。建议抓取文章类网页（如博客、文档），而非视频或动态应用页面。`,
      })
      return
    }

    const fullContent = extraContext
      ? `${extraContext}\n\n[网页正文]\n${textContent}`
      : textContent

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: `你是一个专业的知识整理助手。请将以下网页内容整理为结构化的 Obsidian Markdown 笔记。
要求：
1. 提取核心知识点，去除广告和无关内容
2. 生成清晰的层级结构（标题/要点/细节）
3. 在 frontmatter 中生成 tags 和 summary
4. 保持中文输出
5. 如果内容涉及考研 408 或考研数学，标注相关学科

输出格式：直接输出 Markdown 内容（包含 --- frontmatter），不要添加任何解释。`,
      messages: [
        { role: 'user', content: `来源 URL: ${url}\n\n网页内容:\n${fullContent}` },
      ],
    })

    const markdown = aiRes.content[0].type === 'text' ? aiRes.content[0].text : ''
    if (!markdown.trim()) {
      res.status(500).json({ error: 'AI 未返回有效内容，可能是 AI 服务暂时不可用或模型不支持该请求' })
      return
    }

    const urlObj = new URL(url)
    const slug = (ogTitle || urlObj.pathname.split('/').filter(Boolean).pop() || urlObj.hostname.replace(/\./g, '-'))
      .replace(/[^\w\u4e00-\u9fff-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
    const fileName = `${slug}.md`
    const folder = targetFolder || 'Web-Clippings'
    const filePath = path.join(folder, fileName)
    const fullPath = path.join(config.vaultPath, filePath)

    const dir = path.dirname(fullPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

    const finalContent = markdown + `\n\n---\n> 来源: [${ogTitle || urlObj.hostname}](${url})\n> 抓取时间: ${new Date().toISOString().split('T')[0]}\n`
    fs.writeFileSync(fullPath, finalContent, 'utf-8')
    invalidateCache()

    let tags: string[] = []
    try {
      const fm = matter(finalContent)
      tags = Array.isArray(fm.data.tags) ? fm.data.tags : []
    } catch {
      // ignore
    }

    res.json({
      url,
      filePath,
      title: slug.replace(/-/g, ' '),
      wordCount: finalContent.split(/\s+/).length,
      tags,
      preview: finalContent.slice(0, 500),
    })
  } catch (err: any) {
    console.error('Defuddle error:', err.message)
    const msg = err.message || ''
    const code = err.code || ''
    if (msg.includes('abort') || msg.includes('timeout') || code === 'ETIMEDOUT') {
      res.status(504).json({ error: '请求超时，网页响应时间过长（可能需要代理）' })
    } else if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || code === 'ECONNRESET' || code === 'ENETUNREACH' || code === 'EHOSTUNREACH') {
      res.status(502).json({ error: `网络连接失败 (${code || 'unknown'})，请确保服务端可以访问（可能需要代理）` })
    } else if (err.status === 429 || msg.includes('rate') || msg.includes('Rate')) {
      res.status(429).json({ error: 'AI 请求频率过高，请稍后重试' })
    } else {
      res.status(500).json({ error: `网页抓取失败: ${msg}` })
    }
  }
})

// ===== Query (智能合成与知识探索) =====

aiRouter.post('/query', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }
    const { query, limit: maxResults } = req.body as { query: string; limit?: number }
    if (!query) {
      res.status(400).json({ error: '缺少 query 参数' })
      return
    }

    const notes = getNotes()
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 0)
    const max = maxResults || 8

    const scored = notes.map(note => {
      let score = 0
      const titleLower = note.title.toLowerCase()
      const contentLower = note.content.toLowerCase()

      for (const token of tokens) {
        if (titleLower.includes(token)) score += 5
        for (const tag of note.tags) {
          if (tag.toLowerCase().includes(token)) {
            score += 3
            break
          }
        }
        if (contentLower.includes(token)) score += 1
      }
      return { note, score }
    }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, max)

    if (scored.length === 0) {
      res.json({ query, results: [], insights: '未找到相关笔记。', relatedTopics: [] })
      return
    }

    const context = scored.map(({ note }) =>
      `## ${note.title}\n标签: ${note.tags.join(', ')}\n${note.content.slice(0, 800)}`
    ).join('\n\n---\n\n')

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 2048,
      system: `你是一个知识库查询助手。请基于提供的笔记内容回答用户的查询。
要求：
1. 综合分析相关笔记，给出有价值的洞察
2. 指出知识点之间的联系（特别关注 408 与数学概念的联系）
3. 建议可以进一步学习的方向
4. 保持简洁、有条理

请以 JSON 格式输出：
{
  "insights": "综合分析（200字以内）",
  "relatedTopics": ["相关话题1", "相关话题2", "相关话题3"]
}`,
      messages: [
        { role: 'user', content: `查询: ${query}\n\n相关笔记:\n\n${context}` },
      ],
    })

    const text = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '{}'
    let aiData: any = {}
    try {
      aiData = JSON.parse(text)
    } catch {
      aiData = { insights: text.slice(0, 500), relatedTopics: [] }
    }

    res.json({
      query,
      results: scored.map(({ note, score }) => ({
        path: note.path,
        title: note.title,
        tags: note.tags,
        snippet: note.content.slice(0, 200),
        score,
      })),
      insights: aiData.insights || '',
      relatedTopics: aiData.relatedTopics || [],
    })
  } catch (err: any) {
    console.error('Query error:', err.message)
    res.status(500).json({ error: '查询失败: ' + err.message })
  }
})

// ===== Think (思维画布导图生成) =====

aiRouter.post('/think', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }
    const { topic, depth } = req.body as { topic: string; depth?: number }
    if (!topic) {
      res.status(400).json({ error: '缺少 topic 参数' })
      return
    }

    const notes = getNotes()
    const maxDepth = depth || 2

    const topicLower = topic.toLowerCase()
    const related = notes
      .filter(n => n.title.toLowerCase().includes(topicLower) || n.content.toLowerCase().includes(topicLower) || n.tags.some(t => t.toLowerCase().includes(topicLower)))
      .slice(0, 5)

    const vaultContext = related.map(n => `${n.title}: ${n.tags.join(', ')}`).join('; ')

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: `你是一个思维导图生成专家。请为给定主题生成结构化的思维导图数据。
要求：
1. 中心是主题本身
2. 第一层是主要分支（3-6个）
3. 第二层是每个分支的子节点（每个分支2-4个）
4. 如果主题与知识库内容相关，融入已有知识点
5. 节点之间可以有关联关系

请严格以 JSON 格式输出（不要 markdown 代码块）：
{
  "center": { "id": "root", "label": "主题", "color": "#E8784E" },
  "branches": [
    {
      "id": "b1",
      "label": "分支名",
      "color": "#7A9B6D",
      "children": [
        { "id": "b1c1", "label": "子节点", "note": "关联笔记路径（如有）" }
      ]
    }
  ],
  "connections": [
    { "from": "b1c1", "to": "b2c1", "label": "关联描述" }
  ],
  "summary": "简要概述（50字以内）"
}`,
      messages: [
        { role: 'user', content: `主题: ${topic}\n展开深度: ${maxDepth}\n知识库相关笔记: ${vaultContext || '无直接相关'}` },
      ],
    })

    const text = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '{}'
    let mindmap: any = {}
    try {
      mindmap = JSON.parse(text)
    } catch {
      mindmap = { center: { id: 'root', label: topic }, branches: [], connections: [], summary: '生成失败' }
    }

    if (mindmap.branches?.length > 0) {
      const canvasNodes: any[] = []
      const canvasEdges: any[] = []
      let x = 400, y = 300

      canvasNodes.push({
        id: mindmap.center?.id || 'root',
        x: x - 100,
        y: y - 30,
        width: 200,
        height: 60,
        text: mindmap.center?.label || topic,
        color: mindmap.center?.color || '#E8784E',
      })

      mindmap.branches.forEach((branch: any, bi: number) => {
        const bx = 100 + bi * 250
        const by = 50
        canvasNodes.push({
          id: branch.id,
          x: bx,
          y: by,
          width: 180,
          height: 50,
          text: branch.label,
          color: branch.color || '#7A9B6D',
        })
        canvasEdges.push({ id: `e-root-${branch.id}`, fromNode: 'root', toNode: branch.id })

        ;(branch.children || []).forEach((child: any, ci: number) => {
          const cx = bx - 40 + ci * 100
          const cy = by + 120
          canvasNodes.push({ id: child.id, x: cx, y: cy, width: 160, height: 40, text: child.label })
          canvasEdges.push({ id: `e-${branch.id}-${child.id}`, fromNode: branch.id, toNode: child.id })
        })
      })

      mindmap.canvas = { nodes: canvasNodes, edges: canvasEdges }
    }

    res.json(mindmap)
  } catch (err: any) {
    console.error('Think error:', err.message)
    res.status(500).json({ error: '思维导图生成失败: ' + err.message })
  }
})

// ===== 启发式分步思维链 AI 辅导 (破题思路引导 / 步骤逻辑挑刺 / 公式定理反查) =====

aiRouter.post('/ai/tutor/step', async (req, res) => {
  try {
    const { mode, questionText, subject, studentSteps, optionsText, provider, model } = req.body as {
      mode: TutorMode
      questionText: string
      subject?: string
      studentSteps?: string
      optionsText?: string
      provider?: any
      model?: string
    }

    if (!questionText) {
      res.status(400).json({ error: '缺少题面内容 (questionText)' })
      return
    }

    if (!mode || !['hint', 'audit', 'formula'].includes(mode)) {
      res.status(400).json({ error: '无效辅导模式，支持: hint | audit | formula' })
      return
    }

    const tutorResult = await runStepTutor({
      mode,
      questionText,
      subject,
      studentSteps,
      optionsText,
      provider,
      model,
    })

    res.json(tutorResult)
  } catch (err: any) {
    console.error('AI Tutor Step error:', err.message)
    const summary = summarizeAiError(err)
    res.status(summary.status || 500).json({ error: summary.message })
  }
})

