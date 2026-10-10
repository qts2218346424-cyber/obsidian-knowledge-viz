import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { config, anthropic, getAiClientForModel } from '../context.js'
import { detectAllLocalAgents, runLocalAgent, type LocalAgentProvider } from '../local-agent-bridge.js'
import { OpenAICompatibleClient } from '../ai-client.js'
import { runAgentLoop } from '../agent.js'
import { scanLocalSkills } from '../local-skill-scanner.js'
import {
  addDeletedModel,
  removeDeletedModel,
  clearDeletedModels,
  getDeletedModels,
} from '../local-model-scanner.js'

export const localAgentsRouter = Router()

localAgentsRouter.get('/local-agents/status', async (_req, res) => {
  try {
    const agents = await detectAllLocalAgents(config.localAgents)
    res.json({
      agents,
      defaultCwd: config.localAgents?.defaultCwd || config.vaultPath,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

localAgentsRouter.post('/local-agents/sync-models', async (_req, res) => {
  try {
    const agents = await detectAllLocalAgents(config.localAgents)
    res.json({
      success: true,
      agents,
      defaultCwd: config.localAgents?.defaultCwd || config.vaultPath,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

localAgentsRouter.post('/local-agents/delete-model', async (req, res) => {
  try {
    const { model } = req.body || {}
    if (!model || typeof model !== 'string') {
      res.status(400).json({ error: 'Missing model name' })
      return
    }
    const deletedModels = addDeletedModel(model)
    const agents = await detectAllLocalAgents(config.localAgents)
    res.json({
      success: true,
      agents,
      deletedModels,
      message: `已成功删除模型 ${model}`,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

localAgentsRouter.post('/local-agents/restore-models', async (_req, res) => {
  try {
    clearDeletedModels()
    const agents = await detectAllLocalAgents(config.localAgents)
    res.json({
      success: true,
      agents,
      deletedModels: [],
      message: '已恢复所有已删除模型',
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

localAgentsRouter.post('/local-agents/undelete-model', async (req, res) => {
  try {
    const { model } = req.body || {}
    if (!model || typeof model !== 'string') {
      res.status(400).json({ error: 'Missing model name' })
      return
    }
    const deletedModels = removeDeletedModel(model)
    const agents = await detectAllLocalAgents(config.localAgents)
    res.json({
      success: true,
      agents,
      deletedModels,
      message: `已恢复模型 ${model}`,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

localAgentsRouter.get('/local-agents/deleted-models', async (_req, res) => {
  try {
    const deletedModels = getDeletedModels()
    res.json({ success: true, deletedModels })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

localAgentsRouter.get('/local-agents/skills', async (_req, res) => {
  try {
    const skills = scanLocalSkills()
    const categories = ['全部', ...Array.from(new Set(skills.map(s => s.category)))]
    const sources = ['全部', ...Array.from(new Set(skills.map(s => s.source)))]
    res.json({
      success: true,
      skills,
      totalCount: skills.length,
      categories,
      sources,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

localAgentsRouter.post('/local-agents/sync-skills', async (_req, res) => {
  try {
    const skills = scanLocalSkills()
    const categories = ['全部', ...Array.from(new Set(skills.map(s => s.category)))]
    const sources = ['全部', ...Array.from(new Set(skills.map(s => s.source)))]
    res.json({
      success: true,
      skills,
      totalCount: skills.length,
      categories,
      sources,
      scannedCount: skills.length,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

localAgentsRouter.post('/local-agents/chat', async (req, res) => {
  try {
    const body = req.body as {
      provider?: LocalAgentProvider
      prompt?: string
      cwd?: string
      sessionId?: string
      model?: string
      projectName?: string
      projectDescription?: string
      pageContext?: string
      skillPrompt?: string
      agentPrompt?: string
    }
    if (!body.prompt?.trim()) {
      res.status(400).json({ error: 'Missing prompt' })
      return
    }
    if (body.provider !== 'antigravity' && body.provider !== 'claude-code' && body.provider !== 'codex' && body.provider !== 'web' && body.provider !== 'ollama' && body.provider !== 'lm-studio') {
      res.status(400).json({ error: 'Unsupported local agent provider' })
      return
    }

    const requestedCwd = body.cwd || config.localAgents?.defaultCwd || config.vaultPath
    const cwd = fs.existsSync(requestedCwd) && fs.statSync(requestedCwd).isDirectory()
      ? path.resolve(requestedCwd)
      : path.resolve(config.vaultPath)

    // 格式化多轮历史摘要（用于本地 CLI 引擎或跨模型无缝继承）
    let historySummary = ''
    if (Array.isArray(body.history) && body.history.length > 0) {
      const recentTurns = body.history.slice(-8)
      historySummary = recentTurns
        .map(h => `${h.role === 'user' ? '用户' : '研学导师'}：${h.content.slice(0, 800)}`)
        .join('\n\n')
    }

    const context = [
      `项目：${body.projectName || 'Knowledge Viz'}`,
      `项目说明：${body.projectDescription || '当前 Obsidian 知识库项目'}`,
      `工作目录：${cwd}`,
      body.agentPrompt ? `【当前研学智能体定位与人设要求】：\n${body.agentPrompt}` : '',
      body.pageContext ? `当前页面：${body.pageContext}` : '',
      body.skillPrompt ? `已启用 Skill：\n${body.skillPrompt}` : '',
      historySummary ? `【此前会话历史脉络（请基于此上下文连续作答）】：\n${historySummary}` : '',
      '',
      `用户最新请求：${body.prompt.trim()}`,
    ].filter(Boolean).join('\n')

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

  const sendEvent = (event: unknown) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }
  const abortController = new AbortController()
  const abortRun = () => abortController.abort()
  req.on('aborted', abortRun)
  req.on('close', abortRun)
  res.on('close', abortRun)

  // 构造标准多轮对话消息列表（用于云端模型与本地推理服务）
  const conversationMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
  if (Array.isArray(body.history) && body.history.length > 0) {
    for (const h of body.history.slice(-12)) {
      if (h.content && (h.role === 'user' || h.role === 'assistant')) {
        conversationMessages.push({
          role: h.role,
          content: h.content,
        })
      }
    }
  }
  // 当前最新消息加入末尾
  conversationMessages.push({
    role: 'user',
    content: context,
  })

  if (body.provider === 'ollama' || body.provider === 'lm-studio') {
    const defaultURL = body.provider === 'ollama' ? 'http://127.0.0.1:11434' : 'http://127.0.0.1:1234'
    const configuredURL = body.provider === 'ollama' ? config.localAgents?.ollamaBaseURL : config.localAgents?.lmStudioBaseURL
    const baseURL = (configuredURL || defaultURL).replace(/\/+$/, '') + '/v1'
    const apiKey = body.provider
    const client = new OpenAICompatibleClient(apiKey, baseURL)
    const model = body.model || (body.provider === 'ollama' ? 'deepseek-r1:latest' : 'local-model')

    try {
      for await (const event of runAgentLoop(
        client,
        model,
        conversationMessages,
        config.vaultPath,
        body.agentPrompt
      )) {
        sendEvent(event)
        if (event.type === 'error') break
      }
    } catch (error: any) {
      sendEvent({ type: 'error', content: `本地 AI 执行失败: ${error?.message || '未知错误'}` })
    } finally {
      res.end()
    }
    return
  }

  if (body.provider === 'antigravity') {
    // 优先寻找 Gemini 或 Google 端点，若无则使用当前默认激活端点
    const endpoints = config.ai?.endpoints || []
    const geminiEp = endpoints.find(e => e.id?.toLowerCase().includes('gemini') || e.baseURL?.toLowerCase().includes('google') || e.baseURL?.toLowerCase().includes('gemini'))
    let aiTarget = geminiEp ? getAiClientForModel(body.model, geminiEp.id) : getAiClientForModel(body.model)

    if (!aiTarget) {
      aiTarget = getAiClientForModel() // 尝试使用默认端点
    }

    if (!aiTarget) {
      sendEvent({
        type: 'text',
        content: `✨ **Antigravity 2.0 智能体就绪**\n\n已检测到本机安装了 Google Antigravity 2.0，但当前知识库系统尚未检测到可用的 API 密钥配置。\n\n请在软件右上角 **「管理模型」** 或 **「系统设置」** 中配置您的模型 API Key（支持 Google Gemini 或 OpenAI-compatible 端点），即可直接在此窗口体验 Antigravity 智能体与知识库双向联动！`,
      })
      sendEvent({ type: 'done' })
      res.end()
      return
    }

    // 针对 Antigravity 注入专属研学双核与知识库全权智能体人设
    let { client, model } = aiTarget
    // 如果当前端点不支持前端传来的 gemini 模型名，自动使用该端点的默认模型
    if (aiTarget.endpoint && !aiTarget.endpoint.models?.includes(model) && !aiTarget.endpoint.baseURL?.includes('google')) {
      model = aiTarget.endpoint.defaultModel || aiTarget.endpoint.models?.[0] || model
    }

    const antigravityPrompt = [
      '【智能体核心身份】：你是 Google Antigravity 2.0 研学双核智能体，现已深度结合至 CoreForge 研核知识库系统中。',
      `【知识库工作区】：当前绑定的本地 Obsidian Vault 路径为：${config.vaultPath}。`,
      '【核心交互准则】：',
      '1. 直接使用规范严谨的纯中文作答，思维清晰、逻辑严密；',
      '2. 具备完整的知识库工具箱（search_notes, read_file, write_file, create_error_note, organize_vault），在用户提问考研408、数学知识点或要求整理笔记时，积极调用工具探索或操作知识库。',
      body.agentPrompt || '',
    ].filter(Boolean).join('\n')

    try {
      for await (const event of runAgentLoop(
        client,
        model,
        conversationMessages,
        config.vaultPath,
        antigravityPrompt
      )) {
        sendEvent(event)
        if (event.type === 'error') break
      }
    } catch (error: any) {
      sendEvent({ type: 'error', content: `Antigravity 智能体运行异常: ${error?.message || '未知错误'}` })
    } finally {
      res.end()
    }
    return
  }

  if (body.provider === 'web') {
    const aiTarget = getAiClientForModel(body.model)
    if (!aiTarget) {
      sendEvent({ type: 'error', content: '云端 AI 尚未配置或对应接口不可用，请在系统设置中检查 API 配置' })
      res.end()
      return
    }
    const { client, model } = aiTarget
    try {
      for await (const event of runAgentLoop(
        client,
        model,
        conversationMessages,
        config.vaultPath,
        body.agentPrompt
      )) {
        sendEvent(event)
        if (event.type === 'error') break
      }
    } catch (error: any) {
      sendEvent({ type: 'error', content: `云端 AI 执行失败: ${error?.message || '未知错误'}` })
    } finally {
      res.end()
    }
    return
  }

  try {

    for await (const event of runLocalAgent({
      provider: body.provider,
      prompt: context,
      cwd,
      sessionId: body.sessionId,
      model: body.model,
      config: config.localAgents,
      signal: abortController.signal,
    })) {
      sendEvent(event)
      if (event.type === 'error') break
    }
  } catch (error: any) {
    sendEvent({ type: 'error', content: error?.message || 'Local agent failed' })
  } finally {
    res.end()
  }
} catch (topLevelError: any) {
  console.error('[CHAT TOP LEVEL ERROR]', topLevelError)
  res.status(500).json({ error: topLevelError?.message || 'Chat 内部异常', stack: topLevelError?.stack })
}
})

// 考研研学动态发散提问与考点延伸生成
localAgentsRouter.post('/local-agents/generate-followups', async (req, res) => {
  try {
    const { prompt, lastResponse, noteTitle } = req.body || {}
    const aiTarget = getAiClientForModel()
    if (!aiTarget) {
      res.json({ success: false, followups: [] })
      return
    }

    const { client, model } = aiTarget
    const systemInstruction = '你是一个顶级考研辅导名师。你的任务是根据考生与导师刚完成的问答内容或关联笔记，针对性提炼出 4 个深度关联、极具启发性的后续发散提问。每条提问 15~35 个汉字，直接给出 4 行文本，每行一个问题，严禁带序号（如1. 2.）或符号前缀，严禁多余客套。'
    const contextContent = [
      noteTitle ? `【关联知识库笔记】：《${noteTitle}》` : '',
      prompt ? `【学生探讨主题/提问】：${prompt.slice(0, 300)}` : '',
      lastResponse ? `【导师解答要点】：${lastResponse.slice(0, 600)}` : '',
    ].filter(Boolean).join('\n')

    const response = await client.messages.create({
      model,
      max_tokens: 240,
      system: systemInstruction,
      messages: [{ role: 'user', content: `请基于以下探讨内容提炼出 4 个考点发散追问：\n\n${contextContent}` }],
    })

    const textBlock = response.content.find((b: any) => b.type === 'text')
    const rawText = textBlock ? (textBlock as any).text : ''
    const followups = rawText
      .split('\n')
      .map((line: string) => line.replace(/^[\d\.\-\*•、\s]+/, '').trim())
      .filter((line: string) => line.length >= 6 && line.length <= 50)
      .slice(0, 4)

    res.json({ success: true, followups })
  } catch (err: any) {
    res.json({ success: false, followups: [], error: err.message })
  }
})


