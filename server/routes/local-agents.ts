import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { config, anthropic } from '../context.js'
import { detectAllLocalAgents, runLocalAgent, type LocalAgentProvider } from '../local-agent-bridge.js'
import { OpenAICompatibleClient } from '../ai-client.js'
import { runAgentLoop } from '../agent.js'

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

localAgentsRouter.post('/local-agents/chat', async (req, res) => {
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
  if (body.provider !== 'claude-code' && body.provider !== 'codex' && body.provider !== 'web' && body.provider !== 'ollama' && body.provider !== 'lm-studio') {
    res.status(400).json({ error: 'Unsupported local agent provider' })
    return
  }


  const requestedCwd = body.cwd || config.localAgents?.defaultCwd || config.vaultPath
  const cwd = fs.existsSync(requestedCwd) && fs.statSync(requestedCwd).isDirectory()
    ? path.resolve(requestedCwd)
    : path.resolve(config.vaultPath)
  const context = [
    `项目：${body.projectName || 'Knowledge Viz'}`,
    `项目说明：${body.projectDescription || '当前 Obsidian 知识库项目'}`,
    `工作目录：${cwd}`,
    body.agentPrompt ? `【当前研学智能体定位与人设要求】：\n${body.agentPrompt}` : '',
    body.pageContext ? `当前页面：${body.pageContext}` : '',
    body.skillPrompt ? `已启用 Skill：\n${body.skillPrompt}` : '',
    '',
    `用户请求：${body.prompt.trim()}`,
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
        [{ role: 'user', content: context }],
        config.vaultPath
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

  if (body.provider === 'web') {
    if (!anthropic) {
      sendEvent({ type: 'error', content: '云端 AI 尚未配置，请在系统设置中配置 API 密钥' })
      res.end()
      return
    }
    const model = body.model || config.ai?.model || 'deepseek-v4-pro'
    try {
      for await (const event of runAgentLoop(
        anthropic,
        model,
        [{ role: 'user', content: context }],
        config.vaultPath
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
})
