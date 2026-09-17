import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { config } from '../context.js'
import { detectLocalAgents, runLocalAgent, type LocalAgentProvider } from '../local-agent-bridge.js'

export const localAgentsRouter = Router()

localAgentsRouter.get('/local-agents/status', (_req, res) => {
  res.json({
    agents: detectLocalAgents(config.localAgents),
    defaultCwd: config.localAgents?.defaultCwd || config.vaultPath,
  })
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
  }
  if (!body.prompt?.trim()) {
    res.status(400).json({ error: 'Missing prompt' })
    return
  }
  if (body.provider !== 'claude-code' && body.provider !== 'codex') {
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
