import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { config, invalidateCache } from '../context.js'
import {
  loadAgentMemoryConfig,
  saveAgentMemoryConfig,
  saveRawAgentMarkdown,
  addAgentDirective,
  updateAgentDirective,
  deleteAgentDirective,
  loadAllMemories,
  getMemoryStats,
  addMemory,
  updateMemory,
  deleteMemory,
  type AgentMemoryConfig,
  type AgentDirective,
} from '../memory-store.js'
import { createFile } from '../vault-parser.js'

export const memoryRouter = Router()

/**
 * Get AI Agent Memory Config & agent.md
 */
memoryRouter.get('/memory/agent-config', (_req, res) => {
  try {
    const data = loadAgentMemoryConfig(config.vaultPath)
    res.json({
      success: true,
      config: data.config,
      rawMarkdown: data.rawMarkdown,
      filePath: data.filePath,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Save AI Agent Memory Config or raw markdown to agent.md
 */
memoryRouter.post('/memory/agent-config', (req, res) => {
  try {
    const { config: newConfig, rawMarkdown } = req.body as {
      config?: AgentMemoryConfig
      rawMarkdown?: string
    }

    if (rawMarkdown !== undefined) {
      const result = saveRawAgentMarkdown(rawMarkdown, config.vaultPath)
      invalidateCache()
      res.json({
        success: true,
        config: result.config,
        rawMarkdown,
        filePath: result.filePath,
        message: 'agent.md 已实时保存并同步生效！',
      })
      return
    }

    if (newConfig) {
      const result = saveAgentMemoryConfig(newConfig, config.vaultPath)
      invalidateCache()
      res.json({
        success: true,
        config: newConfig,
        rawMarkdown: result.rawMarkdown,
        filePath: result.filePath,
        message: '智能体设定已更新并保存至 agent.md！',
      })
      return
    }

    res.status(400).json({ error: 'Missing config or rawMarkdown in request body' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Add a new directive item into agent.md
 */
memoryRouter.post('/memory/directive', (req, res) => {
  try {
    const { title, content, category, enabled } = req.body as {
      title: string
      content: string
      category?: 'behavior' | 'knowledge' | 'preference' | 'habit'
      enabled?: boolean
    }

    if (!title || !content) {
      res.status(400).json({ error: '标题和记忆内容均为必填项' })
      return
    }

    const result = addAgentDirective({
      title,
      content,
      category: category || 'behavior',
      enabled: enabled ?? true,
    }, config.vaultPath)

    invalidateCache()
    res.json({ success: true, directive: result.directive })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Update a directive item (e.g. toggle enabled state)
 */
memoryRouter.put('/memory/directive/:id', (req, res) => {
  try {
    const { id } = req.params
    const patch = req.body as Partial<AgentDirective>
    const result = updateAgentDirective(id, patch, config.vaultPath)
    if (!result.success || !result.directive) {
      res.status(404).json({ error: '未找到该记忆条目' })
      return
    }
    invalidateCache()
    res.json({ success: true, directive: result.directive })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Delete a directive item from agent.md
 */
memoryRouter.delete('/memory/directive/:id', (req, res) => {
  try {
    const { id } = req.params
    const ok = deleteAgentDirective(id, config.vaultPath)
    if (!ok) {
      res.status(404).json({ error: '未找到该记忆条目' })
      return
    }
    invalidateCache()
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Reset agent.md to standard preset
 */
memoryRouter.post('/memory/reset-default', (_req, res) => {
  try {
    const filePath = path.join(config.vaultPath || '.', 'agent.md')
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath) } catch {}
    }
    const data = loadAgentMemoryConfig(config.vaultPath)
    invalidateCache()
    res.json({
      success: true,
      config: data.config,
      rawMarkdown: data.rawMarkdown,
      filePath: data.filePath,
      message: '已恢复默认 agent.md 设定',
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Legacy Compatibility Endpoints =====

memoryRouter.get('/memory/all', (_req, res) => {
  try {
    const memories = loadAllMemories(config.vaultPath)
    const stats = getMemoryStats(config.vaultPath)
    res.json({
      success: true,
      memories,
      stats,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

memoryRouter.post('/memory/item', (req, res) => {
  try {
    const item = req.body
    if (!item.title || !item.content) {
      res.status(400).json({ error: 'Title and content are required' })
      return
    }
    const created = addMemory(item, config.vaultPath)
    res.json({ success: true, item: created })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

memoryRouter.put('/memory/item/:id', (req, res) => {
  try {
    const { id } = req.params
    const patch = req.body
    const updated = updateMemory(id, patch, config.vaultPath)
    if (!updated) {
      res.status(404).json({ error: 'Memory item not found' })
      return
    }
    res.json({ success: true, item: updated })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

memoryRouter.delete('/memory/item/:id', (req, res) => {
  try {
    const { id } = req.params
    const ok = deleteMemory(id, config.vaultPath)
    if (!ok) {
      res.status(404).json({ error: 'Memory item not found' })
      return
    }
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

memoryRouter.post('/memory/export-to-obsidian', (req, res) => {
  try {
    const { title, content, tags, subject } = req.body as {
      title: string
      content: string
      tags?: string[]
      subject?: string
    }

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content required' })
      return
    }

    const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_').slice(0, 50)
    const relPath = `wiki/AI伴学设定/${safeTitle}.md`
    const today = new Date().toISOString().split('T')[0]

    const fm = {
      title,
      subject: subject || 'AI设定与记忆',
      tags: ['agent-md', ...(tags || []), '考研智能体'],
      created: today,
      type: 'agent-directive',
    }

    const fullPath = path.resolve(config.vaultPath, relPath)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })

    const note = createFile(config.vaultPath, relPath, content, fm)
    invalidateCache()

    res.json({
      success: true,
      notePath: note.path,
      message: `已成功导出至知识库笔记：${relPath}`,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
