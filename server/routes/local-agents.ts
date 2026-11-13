import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { config, anthropic, getAiClientForModel } from '../context.js'
import { detectAllLocalAgents, detectLocalAgents, runLocalAgent, type LocalAgentProvider } from '../local-agent-bridge.js'
import { OpenAICompatibleClient } from '../ai-client.js'
import { runAgentLoop } from '../agent.js'
import { scanLocalSkills } from '../local-skill-scanner.js'
import {
  addDeletedModel,
  removeDeletedModel,
  clearDeletedModels,
  getDeletedModels,
} from '../local-model-scanner.js'

import { database } from '../db/database.js'
export const localAgentsRouter = Router()

localAgentsRouter.get('/local-agents/status', async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'
    const rawAgents = await detectAllLocalAgents(config.localAgents)
    const agents = isAdmin
      ? rawAgents
      : rawAgents.map(({ resolvedPath, ...rest }) => rest)
    res.json({
      agents,
      defaultCwd: isAdmin ? (config.localAgents?.defaultCwd || config.vaultPath) : '专属研学工作区',
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

localAgentsRouter.post('/local-agents/sync-models', async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'
    const rawAgents = await detectAllLocalAgents(config.localAgents)
    const agents = isAdmin
      ? rawAgents
      : rawAgents.map(({ resolvedPath, ...rest }) => rest)
    res.json({
      success: true,
      agents,
      defaultCwd: isAdmin ? (config.localAgents?.defaultCwd || config.vaultPath) : '专属研学工作区',
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

localAgentsRouter.get('/local-agents/skills', async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'
    const includeHostSkills = isAdmin && req.query?.includeHost === '1'
    const skills = scanLocalSkills({ includeHostSkills })
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

localAgentsRouter.post('/local-agents/sync-skills', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: '仅管理员可执行系统技能扫描同步' })
      return
    }
    const skills = scanLocalSkills({ includeHostSkills: true })
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
  // 修复：deductInfo / hasProducedContent 此前未声明或声明在 try 块内部，
  // 一旦进入异常 / finally 分支就会抛出 ReferenceError，导致 SSE 流无法正常结束、前端一直转圈。
  // 现行计费为「生成 ≥20 字后才扣费」，因此预扣信息默认为空，仅在产出内容后标记 hasProducedContent。
  let deductInfo: { deducted: number } | null = null
  let hasProducedContent = false
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
      history?: Array<{ role: 'user' | 'assistant'; content: string }>
      images?: string[]
      mode?: string
      isFollowUp?: boolean
    }
    const hasText = Boolean(body.prompt?.trim())
    const hasImages = Boolean(Array.isArray(body.images) && body.images.length > 0)
    if (!hasText && !hasImages) {
      res.status(400).json({ error: 'Missing prompt or image' })
      return
    }
    const userPromptText = body.prompt?.trim() || (hasImages ? '请深度解析此图片中的内容并解答' : '')
    if (body.provider !== 'antigravity' && body.provider !== 'claude-code' && body.provider !== 'codex' && body.provider !== 'web' && body.provider !== 'ollama' && body.provider !== 'lm-studio') {
      res.status(400).json({ error: 'Unsupported local agent provider' })
      return
    }

    // 伴学积分资格预检：校验当前用户是否拥有至少 0.1 积分（管理员免受阻断）
    if (req.user && req.user.role !== 'admin') {
      const currentPoints = database.getUserPoints(req.user.id)?.points ?? req.user.points ?? 0
      if (currentPoints < 0.1) {
        res.status(402).json({
          error: 'INSUFFICIENT_POINTS',
          message: '伴学积分不足（当前单次对话需 0.1 积分），请每日签到领取或联系管理员分配。',
          currentPoints,
        })
        return
      }
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
        .map(h => `${h.role === 'user' ? '用户' : '研学导师'}：${typeof h.content === 'string' ? h.content.slice(0, 800) : ''}`)
        .join('\n\n')
    }

    const context = [
      `项目：${body.projectName || 'Knowledge Viz'}`,
      `项目说明：${body.projectDescription || '当前 Obsidian 知识库项目'}`,
      `工作目录：${cwd}`,
      body.agentPrompt ? `【当前研学智能体定位与人设要求】：\n${body.agentPrompt}` : '',
      (body.mode === 'followup' || body.isFollowUp || body.agentPrompt?.includes('追问模式'))
        ? '【🎯 针对性追问模式核心铁律（强制执行）】：\n' +
          '1. 靶向解惑：用户当前处于追问模式，提出的问题是针对前文推导或特定考点的具体疑问、认知卡壳点或困惑细节！\n' +
          '2. 拒绝笼统：严禁从头背诵或大段复述课本宏观概念，严禁给出泛泛而谈、大而化之的敷衍套话，必须直击用户的疑问核心靶心！\n' +
          '3. 偏差剖析：一针见血指出用户为什么会卡壳、混淆了什么概念或遗漏了什么边界前提，对比正误认知差异；\n' +
          '4. 微观拆解：针对该疑问所涉步骤进行显微镜式的深入推演，步步有据，严谨闭环；\n' +
          '5. 针对性自测：解答完该疑问后，给出一个极小粒度的针对性微自测问题，检验用户是否真正弄懂。'
        : '',
      (body.agentPrompt?.includes('心灵疗愈') || body.agentPrompt?.includes('心理聊天师'))
        ? '【心理聊天师对话与语言铁律】：\n' +
          '★ 全程纯中文温和共情对话：请以温柔、接纳、有安全感的纯简体中文倾听并陪伴用户，严禁英文夹生与冷漠说教；\n' +
          '★ 自然交谈排版：使用标准中文全角标点，段落自然紧凑，先接住情绪、再轻量认知重构、最后给出 1~2 个微步建议，无需套用生硬的做题表格或应试口诀。'
        : '【母语习惯与语言交付绝对铁律（最高优先级）】：\n' +
          '★ 全程纯中文作答：必须全程使用规范、严谨、通顺、地道的简体中文进行深度解析推导，严格符合中文母语考生的思维与阅读习惯！除专业技术原语、C/C++代码段与专有英文缩写（如 TCP/IP, TLB, Cache, O(n)）保留外，所有问题剖析、原理解释、步骤推演、设坑分析与总结一律采用纯中文表达，严禁出现整句英文或中英夹生翻译腔！\n' +
          '【排版交付强制准则】：\n' +
          '1. 结论先行：首句直击答案，严禁“同学你好/我是XX导师/根据历年命题规律”等客套废话；\n' +
          '2. 严控垂直篇幅：正文紧凑精炼，杜绝过度拉长页面；段落之间最多 1 个空行，严禁连续多空行；严禁一句话一换行的诗歌体，同一要点需在同一段内自然连续书写；列表项之间严禁空行；\n' +
          '3. 中文标点规范：必须使用标准全角中文标点（，。、！？：；“”），严禁中英文标点混杂；标点紧随文字，严禁在标点后强行断行；序号与内容必须同行；\n' +
          '4. 结构清晰：使用 ### 小标题、加粗清单（- **要点**：...）、对比表格与 > ⚠️ 避坑引用块，末尾附 1~2 句速记口诀。',
      body.pageContext ? `当前页面：${body.pageContext}` : '',
      body.skillPrompt ? `已启用 Skill：\n${body.skillPrompt}` : '',
      historySummary ? `【此前会话历史脉络（请基于此上下文连续作答）】：\n${historySummary}` : '',
      '',
      `用户最新请求：${userPromptText}`,
    ].filter(Boolean).join('\n')

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()
    res.write(': connected\n\n')

    const heartbeatTimer = setInterval(() => {
      if (!res.writableEnded && !res.destroyed) {
        try {
          res.write(': ping\n\n')
        } catch {
          // ignore write error on closed stream
        }
      }
    }, 15000)
    const cleanupHeartbeat = () => clearInterval(heartbeatTimer)
    res.on('close', cleanupHeartbeat)
    res.on('finish', cleanupHeartbeat)

  let hasProducedContent = false
  let hasStreamError = false
  let hasSettledDeduction = false

  const formatBillingModelLabel = (prov?: string, mdl?: string) => {
    const cleanModel = (mdl || '').trim()
    const cleanProv = (prov || '').trim()
    if (
      cleanProv === 'antigravity' ||
      cleanModel === 'gemini-3.8-flash' ||
      cleanModel === 'gemini-3.8-pro'
    ) {
      const mLabel = cleanModel === 'gemini-3.8-pro' ? 'Gemini 3.8 Pro' : 'Gemini 3.8 Flash'
      return `Antigravity · ${mLabel}`
    }
    const provMap: Record<string, string> = {
      codex: 'Codex',
      'claude-code': 'Claude Code',
      web: '云端接口',
    }
    const pLabel = provMap[cleanProv] || cleanProv || 'Antigravity'
    return cleanModel ? `${pLabel} · ${cleanModel}` : pLabel
  }

  const emitRawEvent = (event: any) => {
    if (!res.writableEnded && !res.destroyed) {
      try {
        res.write(`data: ${JSON.stringify(event)}\n\n`)
      } catch {
        // ignore write error on closed stream
      }
    }
  }

  const settlePointsOnDone = () => {
    if (hasSettledDeduction || hasStreamError || abortController.signal.aborted) return
    if (req.user && hasProducedContent) {
      hasSettledDeduction = true
      const deductRes = database.deductUserPoints(
        req.user.id,
        0.1,
        `AI 伴学提问 (${formatBillingModelLabel(body.provider, body.model)})`
      )
      if (deductRes.success) {
        emitRawEvent({
          type: 'points_updated',
          points: deductRes.points,
          deducted: deductRes.deducted,
        })
      }
    }
  }

  const safeRefundPointsIfNeeded = (reason: string) => {
    if (hasSettledDeduction && req.user) {
      try {
        const refundRes = database.refundUserPoints(req.user.id, 0.1, `提问异常自动原路返还 (${reason})`)
        emitRawEvent({
          type: 'points_updated',
          points: refundRes.points,
          refunded: 0.1,
          refundMessage: `💡 本次提问因服务响应异常未完成，已自动为您原路返还 0.1 伴学积分。`,
        })
        hasSettledDeduction = false
      } catch (refundErr: any) {
        console.warn('[AutoRefund Error]:', refundErr.message)
      }
    }
  }

  const handleRunFailure = (errorMsg: string) => {
    hasStreamError = true
    safeRefundPointsIfNeeded(errorMsg)
    if (!hasSettledDeduction && req.user) {
      const userPts = database.getUserPoints(req.user.id)?.points ?? req.user.points ?? 0
      emitRawEvent({
        type: 'points_updated',
        points: userPts,
        deducted: 0,
      })
      emitRawEvent({
        type: 'text',
        content: `\n\n> 💡 **系统温馨提示**：本次大模型推演出现网络波动或响应异常，**系统未扣除您的伴学积分**（0.1 积分已安全保留）。您可以直接点击重试或切换备用模型。`,
      })
    }
    emitRawEvent({ type: 'error', content: errorMsg })
  }

  const sendEvent = (event: any) => {
    if (event?.type === 'text' && typeof event.content === 'string' && event.content.trim().length > 0) {
      hasProducedContent = true
    } else if (event?.type === 'error') {
      hasStreamError = true
    } else if (event?.type === 'done') {
      settlePointsOnDone()
    }
    emitRawEvent(event)
  }

  // 初始向前端下发当前积分状态（不扣费）
  if (req.user) {
    const curPts = database.getUserPoints(req.user.id)?.points ?? req.user.points ?? 0
    emitRawEvent({
      type: 'points_updated',
      points: curPts,
      deducted: 0,
    })
  }

  const abortController = new AbortController()
  const abortRun = () => {
    if (abortController.signal.aborted) return
    abortController.abort()
    safeRefundPointsIfNeeded('连接被中止')
  }
  req.on('aborted', abortRun)
  res.on('close', () => {
    if (!res.writableEnded) {
      abortRun()
    }
  })

  // 构造标准多轮对话消息列表（用于云端模型与本地推理服务）
  const conversationMessages: Array<{ role: 'user' | 'assistant'; content: any }> = []
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

  // 构造包含多模态图片块的内容
  let latestUserContent: any = context
  if (hasImages && Array.isArray(body.images)) {
    const blocks: any[] = []
    for (const img of body.images) {
      if (typeof img === 'string') {
        const match = img.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/)
        if (match) {
          blocks.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: match[1],
              data: match[2],
            },
          })
        } else if (img.startsWith('http://') || img.startsWith('https://')) {
          blocks.push({
            type: 'image',
            source: {
              type: 'url',
              url: img,
            },
          })
        }
      }
    }
    if (blocks.length > 0) {
      blocks.push({ type: 'text', text: context })
      latestUserContent = blocks
    }
  }

  // 当前最新消息加入末尾
  conversationMessages.push({
    role: 'user',
    content: latestUserContent,
  })

  if (body.provider === 'ollama' || body.provider === 'lm-studio') {
    const defaultURL = body.provider === 'ollama' ? 'http://127.0.0.1:11434' : 'http://127.0.0.1:1234'
    const configuredURL = body.provider === 'ollama' ? config.localAgents?.ollamaBaseURL : config.localAgents?.lmStudioBaseURL
    const baseURL = (configuredURL || defaultURL).replace(/\/+$/, '') + '/v1'
    const apiKey = body.provider
    const client = new OpenAICompatibleClient(apiKey, baseURL)
    const model = body.model || (body.provider === 'ollama' ? 'deepseek-r1:latest' : 'local-model')

    const localAgentPrompt = [
      '【语言与回答习惯铁律】：必须全程使用规范、严谨、通顺的简体中文展开深度解答与解析推导，严格符合中文母语考生的思维与阅读习惯，除专业代码/英文缩写外严禁输出整句英文。',
      body.agentPrompt || '',
    ].filter(Boolean).join('\n')

    try {
      for await (const event of runAgentLoop(
        client,
        model,
        conversationMessages,
        config.vaultPath,
        localAgentPrompt
      )) {
        sendEvent(event)
        if (event.type === 'error') break
      }
    } catch (error: any) {
      handleRunFailure(`本地 AI 执行失败: ${error?.message || '未知错误'}`)
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
      '1. 全程母语习惯：直接使用规范严谨、通顺地道的纯中文作答，思维清晰、逻辑严密，严格符合中文母语考生的思维与阅读习惯，除专业代码/英文缩写外严禁整句英文；',
      '2. 工具调用规范：对于通识问答、考研理论概念讲解、普通打招呼交流，请直接运用你的专业知识深入作答，【严禁】在无明确需求时无故调用文件工具；仅在用户明确提出“查找笔记”、“读取某笔记”、“创建笔记”或“整理知识库”时，才调用对应的知识库工具。',
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
    } catch (primaryErr: any) {
      console.warn('[Antigravity Primary Failed, trying fallback]:', primaryErr?.message)
      const fallbackTarget = getAiClientForModel()
      if (fallbackTarget && (fallbackTarget.client !== client || fallbackTarget.model !== model)) {
        try {
          sendEvent({ type: 'status', content: '正在为您自动切换高可用轻量通道重推...' })
          for await (const fbEvent of runAgentLoop(
            fallbackTarget.client,
            fallbackTarget.model,
            conversationMessages,
            config.vaultPath,
            antigravityPrompt
          )) {
            sendEvent(fbEvent)
            if (fbEvent.type === 'error') break
          }
        } catch (fbErr: any) {
          handleRunFailure(`Antigravity 智能体运行异常: ${fbErr?.message || primaryErr?.message || '网络连接超时'}`)
        }
      } else {
        handleRunFailure(`Antigravity 智能体运行异常: ${primaryErr?.message || '网络连接超时'}`)
      }
    } finally {
      if (!hasSettledDeduction && req.user) {
        const userPts = database.getUserPoints(req.user.id)?.points ?? req.user.points ?? 0
        sendEvent({
          type: 'points_updated',
          points: userPts,
          deducted: 0,
        })
      }
      res.end()
    }
    return
  }

  if (body.provider === 'codex') {
    let hasLocalCli = false
    try {
      const st = detectLocalAgents(config.localAgents)
      const codexObj = st.find(s => s.provider === 'codex')
      hasLocalCli = Boolean(codexObj?.version)
    } catch {}

    let cliSucceeded = false
    if (hasLocalCli) {
      try {
        for await (const event of runLocalAgent({
          provider: 'codex',
          prompt: context,
          cwd,
          sessionId: body.sessionId,
          model: body.model,
          config: config.localAgents,
          signal: abortController.signal,
        })) {
          if (event.type === 'error') {
            if (event.content?.includes('超时')) {
              handleRunFailure(event.content)
              res.end()
              return
            }
            cliSucceeded = false
            break
          }
          cliSucceeded = true
          sendEvent(event)
        }
        if (abortController.signal.aborted || cliSucceeded) {
          res.end()
          return
        }
      } catch (err: any) {
        console.warn('[Codex CLI fallback to AgentLoop]:', err?.message)
      }
    }

    // 若本地 CLI 不可用或异常，优雅启动 Codex 架构师云端双核 Loop
    const aiTarget = getAiClientForModel(body.model) || getAiClientForModel()
    if (!aiTarget) {
      sendEvent({ type: 'error', content: 'Codex 智能体所需 AI 接口尚未配置，请在设置中配置 API Key' })
      res.end()
      return
    }
    let { client, model } = aiTarget
    if (aiTarget.endpoint && !aiTarget.endpoint.models?.includes(model) && !aiTarget.endpoint.baseURL?.includes('openai')) {
      model = aiTarget.endpoint.defaultModel || aiTarget.endpoint.models?.[0] || model
    }
    const codexPrompt = [
      '【智能体核心身份】：你是 OpenAI Codex 软件系统架构师与工程代码专家，现已深度结合至 CoreForge 研核系统中。',
      `【知识库工作区】：当前绑定的本地 Obsidian Vault 路径为：${config.vaultPath}。`,
      '【核心交互准则】：全程必须使用规范严谨、通顺地道的纯中文作答，严格符合中文母语考生的思维与阅读习惯，除专业代码/英文缩写外严禁整句英文。专注于计算机底层原理、408 计算机学科核心、算法与数据结构、系统设计与工程代码实战。',
      body.agentPrompt || '',
    ].filter(Boolean).join('\n')

    try {
      for await (const event of runAgentLoop(
        client,
        model,
        conversationMessages,
        config.vaultPath,
        codexPrompt
      )) {
        sendEvent(event)
        if (event.type === 'error') break
      }
    } catch (error: any) {
      handleRunFailure(`Codex 智能体运行异常: ${error?.message || '未知错误'}`)
    } finally {
      if (!hasSettledDeduction && req.user) {
        const userPts = database.getUserPoints(req.user.id)?.points ?? req.user.points ?? 0
        sendEvent({
          type: 'points_updated',
          points: userPts,
          deducted: 0,
        })
      }
      res.end()
    }
    return
  }

  if (body.provider === 'web') {
    const aiTarget = getAiClientForModel(body.model)
    if (!aiTarget) {
      handleRunFailure('云端 AI 尚未配置或对应接口不可用，请在系统设置中检查 API 配置')
      res.end()
      return
    }
    const { client, model } = aiTarget
    const webPrompt = [
      '【语言与回答习惯铁律】：必须全程使用规范、严谨、通顺的简体中文展开深度解答与解析推导，严格符合中文母语考生的思维与阅读习惯，除专业代码/英文缩写外严禁输出整句英文。',
      body.agentPrompt || '',
    ].filter(Boolean).join('\n')
    try {
      for await (const event of runAgentLoop(
        client,
        model,
        conversationMessages,
        config.vaultPath,
        webPrompt
      )) {
        sendEvent(event)
        if (event.type === 'error') break
      }
    } catch (error: any) {
      handleRunFailure(`云端 AI 执行失败: ${error?.message || '未知错误'}`)
    } finally {
      if (!hasSettledDeduction && req.user) {
        const userPts = database.getUserPoints(req.user.id)?.points ?? req.user.points ?? 0
        sendEvent({
          type: 'points_updated',
          points: userPts,
          deducted: 0,
        })
      }
      res.end()
    }
    return
  }

  if (body.provider === 'claude-code') {
    let hasLocalCli = false
    try {
      const st = detectLocalAgents(config.localAgents)
      const claudeObj = st.find(s => s.provider === 'claude-code')
      hasLocalCli = Boolean(claudeObj?.available && claudeObj?.version)
    } catch {}

    let cliSucceeded = false
    if (hasLocalCli) {
      try {
        for await (const event of runLocalAgent({
          provider: 'claude-code',
          prompt: context,
          cwd,
          sessionId: body.sessionId,
          model: body.model,
          config: config.localAgents,
          signal: abortController.signal,
        })) {
          if (event.type === 'error') {
            if (event.content?.includes('超时')) {
              handleRunFailure(event.content)
              res.end()
              return
            }
            cliSucceeded = false
            break
          }
          cliSucceeded = true
          sendEvent(event)
        }
        if (abortController.signal.aborted || cliSucceeded) {
          res.end()
          return
        }
      } catch (err: any) {
        console.warn('[Claude Code CLI fallback to AgentLoop]:', err?.message)
      }
    }

    // 若本地 CLI 不可用、未登录或异常退出，优雅启动 Claude 架构师云端双核 Loop
    const aiTarget = getAiClientForModel(body.model) || getAiClientForModel()
    if (!aiTarget) {
      handleRunFailure('Claude 智能体所需 AI 接口尚未配置，请在系统设置中配置 API Key')
      res.end()
      return
    }
    let { client, model } = aiTarget
    if (aiTarget.endpoint && !aiTarget.endpoint.models?.includes(model) && !aiTarget.endpoint.baseURL?.includes('anthropic')) {
      model = aiTarget.endpoint.defaultModel || aiTarget.endpoint.models?.[0] || model
    }
    const claudePrompt = [
      '【智能体核心身份】：你是 Anthropic Claude 全栈系统专家与高级伴学导师，现已深度结合至 CoreForge 研核系统中。',
      `【知识库工作区】：当前绑定的本地 Obsidian Vault 路径为：${config.vaultPath}。\n` +
      '【核心交互准则】：使用规范严谨的纯中文，专注于考研数学、408 核心考点深度解析与逻辑推演。',
      body.agentPrompt || '',
    ].filter(Boolean).join('\n')

    try {
      for await (const event of runAgentLoop(
        client,
        model,
        conversationMessages,
        config.vaultPath,
        claudePrompt
      )) {
        if (event.type === 'text' && event.content) hasProducedContent = true
        sendEvent(event)
        if (event.type === 'error') break
      }
    } catch (error: any) {
      handleRunFailure(`Claude 智能体运行异常: ${error?.message || '未知错误'}`)
    } finally {
      if (!hasSettledDeduction && req.user) {
        const userPts = database.getUserPoints(req.user.id)?.points ?? req.user.points ?? 0
        sendEvent({
          type: 'points_updated',
          points: userPts,
          deducted: 0,
        })
      }
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
      if (event.type === 'error') {
        handleRunFailure(event.content || 'Local agent failed')
        break
      }
      sendEvent(event)
    }
  } catch (error: any) {
    handleRunFailure(error?.message || 'Local agent failed')
  } finally {
    if (hasStreamError || abortController.signal.aborted) {
      safeRefundPointsIfNeeded('流异常结束或被中止')
    }
    res.end()
  }
} catch (topLevelError: any) {
  console.error('[CHAT TOP LEVEL ERROR]', topLevelError)
  if (!res.headersSent) {
    res.status(500).json({ error: topLevelError?.message || 'Chat 内部异常' })
  } else if (!res.writableEnded && !res.destroyed) {
    try {
      res.write(`data: ${JSON.stringify({ type: 'error', content: topLevelError?.message || 'Chat 内部异常' })}\n\n`)
    } catch {}
    res.end()
  }
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
    const systemInstruction = '你是一个顶级考研辅导名师。你的任务是根据考生与导师刚完成的问答内容或关联笔记，针对性提炼出 4 个深度关联、极具启发性的后续发散提问。每条提问 15~35 个汉字，直接给出 4 行文本，每行一个问题，严禁带序号（如1. 2.）或符号前缀，严禁多余客套，严禁输出任何思考过程。'
    const contextContent = [
      noteTitle ? `【关联知识库笔记】：《${noteTitle}》` : '',
      prompt ? `【学生探讨主题/提问】：${prompt.slice(0, 300)}` : '',
      lastResponse ? `【导师解答要点】：${lastResponse.slice(0, 600)}` : '',
    ].filter(Boolean).join('\n')

    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      system: systemInstruction,
      messages: [{ role: 'user', content: `请直接列出 4 行考点发散追问（每行一个，无序号）：\n\n${contextContent}` }],
    })

    const textBlock = response.content.find((b: any) => b.type === 'text')
    const thinkingBlock = response.content.find((b: any) => b.type === 'thinking')
    const rawText = (textBlock ? (textBlock as any).text : '') || (thinkingBlock ? (thinkingBlock as any).thinking : '')
    const followups = rawText
      .split('\n')
      .map((line: string) => line.replace(/^[\d\.\-\*•、\s]+/, '').trim())
      .filter((line: string) => line.length >= 6 && line.length <= 50 && !line.includes('思考') && !line.includes('用户'))
      .slice(0, 4)

    res.json({ success: true, followups })
  } catch (err: any) {
    res.json({ success: false, followups: [], error: err.message })
  }
})


