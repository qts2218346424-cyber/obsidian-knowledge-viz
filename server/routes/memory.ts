import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { config, invalidateCache } from '../context.js'
import {
  loadAllMemories,
  addMemory,
  updateMemory,
  deleteMemory,
  getMemoryStats,
  type MemoryItem,
} from '../memory-store.js'
import { createFile } from '../vault-parser.js'

export const memoryRouter = Router()

/**
 * Get all memories and dashboard statistics
 */
memoryRouter.get('/memory/all', (_req, res) => {
  try {
    const memories = loadAllMemories()
    const stats = getMemoryStats()
    res.json({
      success: true,
      memories,
      stats,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Add a new memory item
 */
memoryRouter.post('/memory/item', (req, res) => {
  try {
    const item = req.body as Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount'>
    if (!item.title || !item.content) {
      res.status(400).json({ error: 'Title and content are required' })
      return
    }
    const created = addMemory(item)
    res.json({ success: true, item: created })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Update memory item
 */
memoryRouter.put('/memory/item/:id', (req, res) => {
  try {
    const { id } = req.params
    const patch = req.body
    const updated = updateMemory(id, patch)
    if (!updated) {
      res.status(404).json({ error: 'Memory item not found' })
      return
    }
    res.json({ success: true, item: updated })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Delete memory item
 */
memoryRouter.delete('/memory/item/:id', (req, res) => {
  try {
    const { id } = req.params
    const ok = deleteMemory(id)
    if (!ok) {
      res.status(404).json({ error: 'Memory item not found' })
      return
    }
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Export memory item directly as an Obsidian Markdown Note
 */
memoryRouter.post('/memory/export-to-obsidian', (req, res) => {
  try {
    const { memoryId, title, content, tags, subject } = req.body as {
      memoryId?: string
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
    const relPath = `wiki/AI伴学笔记/${safeTitle}.md`
    const today = new Date().toISOString().split('T')[0]

    const fm = {
      title,
      subject: subject || '408与数学',
      tags: ['ai-memory', ...(tags || []), '考研研学'],
      created: today,
      type: 'ai-memory-card',
    }

    const fullPath = path.resolve(config.vaultPath, relPath)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })

    const note = createFile(config.vaultPath, relPath, content, fm)
    invalidateCache()

    // If memoryId is provided, increment reviewCount
    if (memoryId) {
      const memories = loadAllMemories()
      const m = memories.find(item => item.id === memoryId)
      if (m) {
        updateMemory(memoryId, { reviewCount: (m.reviewCount || 0) + 1 })
      }
    }

    res.json({
      success: true,
      notePath: note.path,
      message: `已成功保存为 Obsidian 笔记：${relPath}`,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
