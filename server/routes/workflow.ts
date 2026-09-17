import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {
  config,
  anthropic,
  getNotes,
  invalidateCache,
  scheduler,
} from '../context.js'
import { createFile, updateFile } from '../vault-parser.js'
import { checkHealth } from '../health-checker.js'
import { scanVaultTags, renameTagInContent, removeTagFromContent } from '../tag-utils.js'
import { VaultBackup, executeSuggestionsBatch, rollback as rollbackBackup } from '../vault-ops.js'
import { detectDuplicates, mergeNotes } from '../duplicate-detector.js'
import { loadScheduleConfig } from '../schedule-store.js'

export const workflowRouter = Router()

// ===== Vault Lint Fix =====

workflowRouter.post('/vault/lint/fix', async (req, res) => {
  try {
    const { category, issueIndex } = req.body as { category: string; issueIndex?: number }
    const notes = getNotes()
    const health = checkHealth(notes, config.vaultPath)
    const cat = health.categories.find(c => c.name === category)
    if (!cat) {
      res.status(400).json({ error: `Unknown category: ${category}` })
      return
    }

    const results: { fixed: string[]; skipped: string[] } = { fixed: [], skipped: [] }

    if (category === 'link_integrity') {
      const titleSet = new Set(notes.map(n => n.title.toLowerCase()))
      const fileNameSet = new Set(notes.map(n => n.path.split('/').pop()?.replace('.md', '').toLowerCase() || ''))
      const missing = new Set<string>()
      for (const note of notes) {
        for (const link of note.links) {
          const lower = link.toLowerCase()
          if (!titleSet.has(lower) && !fileNameSet.has(lower)) {
            missing.add(link)
          }
        }
      }
      for (const name of missing) {
        try {
          const safeName = name.replace(/[<>:"/\\|?*]/g, '_')
          const fm = { title: name, tags: ['stub'], created: new Date().toISOString().split('T')[0] }
          const stubContent = `# ${name}\n\n> 此笔记由自动修复创建，内容待补充。\n\n## 待补充\n\n请在此添加关于 ${name} 的内容。\n`
          createFile(config.vaultPath, `${safeName}.md`, stubContent, fm)
          results.fixed.push(name)
        } catch {
          results.skipped.push(name)
        }
      }
    } else if (category === 'metadata_coverage') {
      const lowMeta = notes.filter(n =>
        ['title', 'tags', 'created', 'updated'].filter(f => n.frontmatter[f] !== undefined).length < 2
      )
      const target = issueIndex !== undefined ? [lowMeta[issueIndex]] : lowMeta
      for (const note of target.filter(Boolean)) {
        try {
          const newFm = { ...note.frontmatter }
          if (!newFm.title) newFm.title = note.title
          if (!newFm.tags) newFm.tags = note.tags.length > 0 ? note.tags : ['untagged']
          if (!newFm.created) newFm.created = new Date().toISOString().split('T')[0]
          updateFile(config.vaultPath, note.path, note.content, newFm)
          results.fixed.push(note.path)
        } catch {
          results.skipped.push(note.path)
        }
      }
    } else if (category === 'tag_consistency') {
      const allTags = notes.flatMap(n => n.tags)
      const tagCounts = new Map<string, number>()
      for (const tag of allTags) {
        tagCounts.set(tag.toLowerCase(), (tagCounts.get(tag.toLowerCase()) || 0) + 1)
      }
      const tagList = [...tagCounts.keys()]
      const merges: [string, string][] = []
      for (let i = 0; i < tagList.length; i++) {
        for (let j = i + 1; j < tagList.length; j++) {
          if (tagList[i] + 's' === tagList[j] || tagList[j] + 's' === tagList[i]) {
            merges.push([tagList[i], tagList[j]])
          }
        }
      }
      for (const [a, b] of merges) {
        const [keep, remove] = a.length <= b.length ? [a, b] : [b, a]
        for (const note of notes) {
          const hasRemove = note.tags.some(t => t.toLowerCase() === remove)
          if (hasRemove) {
            try {
              const raw = fs.readFileSync(path.resolve(config.vaultPath, note.path), 'utf-8')
              const { data: fm, content } = matter(raw)
              if (fm.tags && Array.isArray(fm.tags)) {
                fm.tags = fm.tags.map((t: string) => t.toLowerCase() === remove ? keep : t)
              }
              updateFile(config.vaultPath, note.path, content, fm)
              results.fixed.push(`${note.path}: ${remove} → ${keep}`)
            } catch {
              results.skipped.push(note.path)
            }
          }
        }
      }
    } else if (category === 'orphan_notes') {
      const linkedTitles = new Set(notes.flatMap(n => n.links.map(l => l.toLowerCase())))
      const orphans = notes.filter(n => {
        const title = n.title.toLowerCase()
        const fileName = n.path.split('/').pop()?.replace('.md', '').toLowerCase() || ''
        return !linkedTitles.has(title) && !linkedTitles.has(fileName)
      })
      const target = issueIndex !== undefined ? [orphans[issueIndex]] : orphans.slice(0, 5)
      for (const note of target.filter(Boolean)) {
        if (Object.keys(note.frontmatter).length < 2) {
          try {
            const newFm = { ...note.frontmatter, title: note.title, tags: note.tags.length > 0 ? note.tags : ['orphan'] }
            updateFile(config.vaultPath, note.path, note.content, newFm)
            results.fixed.push(note.path)
          } catch {
            results.skipped.push(note.path)
          }
        } else {
          results.skipped.push(note.path)
        }
      }
    } else {
      res.status(400).json({ error: `Auto-fix not supported for category: ${category}` })
      return
    }

    invalidateCache()
    res.json({ category, fixed: results.fixed.length, skipped: results.skipped.length, details: results })
  } catch (err: any) {
    console.error('Lint fix error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ===== Tag Management =====

workflowRouter.get('/vault/tags', (_req, res) => {
  try {
    const tagMap = scanVaultTags(config.vaultPath)
    const tags = Array.from(tagMap.entries())
      .map(([name, files]) => ({ name, count: files.length, files }))
      .sort((a, b) => b.count - a.count)
    res.json({ tags })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

workflowRouter.post('/vault/tags/rename', async (req, res) => {
  try {
    const { oldTag, newTag } = req.body as { oldTag: string; newTag: string }
    if (!oldTag || !newTag) {
      res.status(400).json({ error: 'Missing oldTag or newTag' })
      return
    }
    if (oldTag === newTag) {
      res.status(400).json({ error: 'Tags are the same' })
      return
    }

    const backup = new VaultBackup(config.vaultPath)
    const tagMap = scanVaultTags(config.vaultPath)
    const files = tagMap.get(oldTag.toLowerCase()) || []

    if (files.length === 0) {
      res.status(404).json({ error: `Tag '${oldTag}' not found` })
      return
    }

    backup.snapshot(files)
    let updated = 0
    for (const filePath of files) {
      try {
        const absPath = path.resolve(config.vaultPath, filePath)
        const raw = fs.readFileSync(absPath, 'utf-8')
        const newContent = renameTagInContent(raw, oldTag, newTag)
        if (newContent !== raw) {
          fs.writeFileSync(absPath, newContent, 'utf-8')
          updated++
        }
      } catch {
        // skip unreadable files
      }
    }
    invalidateCache()
    res.json({ oldTag, newTag, filesUpdated: updated })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

workflowRouter.post('/vault/tags/merge', async (req, res) => {
  try {
    const { keepTag, mergeTag } = req.body as { keepTag: string; mergeTag: string }
    if (!keepTag || !mergeTag) {
      res.status(400).json({ error: 'Missing keepTag or mergeTag' })
      return
    }

    const tagMap = scanVaultTags(config.vaultPath)
    const files = tagMap.get(mergeTag.toLowerCase()) || []
    const keepFiles = new Set(tagMap.get(keepTag.toLowerCase()) || [])

    const backup = new VaultBackup(config.vaultPath)
    backup.snapshot(files)

    let updated = 0
    for (const filePath of files) {
      if (keepFiles.has(filePath)) continue
      try {
        const absPath = path.resolve(config.vaultPath, filePath)
        const raw = fs.readFileSync(absPath, 'utf-8')
        const newContent = renameTagInContent(raw, mergeTag, keepTag)
        if (newContent !== raw) {
          fs.writeFileSync(absPath, newContent, 'utf-8')
          updated++
        }
      } catch {
        // skip
      }
    }
    invalidateCache()
    res.json({ keepTag, mergeTag, filesUpdated: updated })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

workflowRouter.post('/vault/tags/delete', async (req, res) => {
  try {
    const { tag } = req.body as { tag: string }
    if (!tag) {
      res.status(400).json({ error: 'Missing tag' })
      return
    }

    const tagMap = scanVaultTags(config.vaultPath)
    const files = tagMap.get(tag.toLowerCase()) || []

    const backup = new VaultBackup(config.vaultPath)
    backup.snapshot(files)

    let updated = 0
    for (const filePath of files) {
      try {
        const absPath = path.resolve(config.vaultPath, filePath)
        const raw = fs.readFileSync(absPath, 'utf-8')
        const newContent = removeTagFromContent(raw, tag)
        if (newContent !== raw) {
          fs.writeFileSync(absPath, newContent, 'utf-8')
          updated++
        }
      } catch {
        // skip
      }
    }
    invalidateCache()
    res.json({ tag, filesUpdated: updated })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Duplicate Detection & Merge =====

workflowRouter.get('/vault/duplicates', (_req, res) => {
  try {
    const pairs = detectDuplicates(config.vaultPath)
    res.json({ pairs })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

workflowRouter.post('/vault/duplicates/merge', async (req, res) => {
  try {
    const { pairs: mergePairs } = req.body as {
      pairs: Array<{ keepFile: string; mergeFile: string; mode: string }>
    }
    if (!mergePairs || mergePairs.length === 0) {
      res.status(400).json({ error: 'No pairs provided' })
      return
    }

    const allFiles = mergePairs.flatMap(p => [p.keepFile, p.mergeFile])
    const backup = new VaultBackup(config.vaultPath)
    backup.snapshot([...new Set(allFiles)])

    const results: any[] = []
    for (const pair of mergePairs) {
      try {
        const result = mergeNotes(pair.keepFile, pair.mergeFile, config.vaultPath, (pair.mode || 'auto') as 'auto' | 'ai')
        results.push(result)
      } catch (err: any) {
        results.push({
          keepFile: pair.keepFile,
          mergedFile: pair.mergeFile,
          success: false,
          appendedChars: 0,
          error: err.message,
        })
      }
    }
    invalidateCache()
    res.json({ results })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Fold (整理建议与应用) =====

workflowRouter.post('/fold', async (req, res) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }
    const { targetFolder } = req.body as { targetFolder?: string }

    const notes = getNotes()
    const folder = targetFolder || ''

    const filteredNotes = folder
      ? notes.filter(n => n.path.toLowerCase().startsWith(folder.toLowerCase()))
      : notes

    if (filteredNotes.length === 0) {
      res.status(404).json({ error: '未找到笔记' })
      return
    }

    const noteStructure = filteredNotes.slice(0, 60).map(n => ({
      path: n.path,
      title: n.title,
      tags: n.tags,
      words: n.wordCount,
      links: n.links?.slice(0, 5) || [],
    }))

    const folders = new Set<string>()
    filteredNotes.forEach(n => {
      const parts = n.path.split('/')
      for (let i = 1; i < parts.length; i++) {
        folders.add(parts.slice(0, i).join('/'))
      }
    })

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: `你是一个 Obsidian 知识库整理专家。请分析用户的笔记结构并提出整理建议。
要求：
1. 分析当前目录结构的问题
2. 建议更合理的分类方式
3. 找出可能需要合并的重复笔记
4. 找出缺少标签或元数据的笔记
5. 建议笔记之间的交叉引用

请以 JSON 格式输出：
{
  "currentAnalysis": "当前结构分析（100字以内）",
  "suggestions": [
    {
      "type": "move" | "merge" | "tag" | "link" | "create",
      "description": "操作描述",
      "from": "来源路径",
      "to": "目标路径（如适用）",
      "reason": "原因"
    }
  ],
  "proposedStructure": ["建议的目录结构"]
}`,
      messages: [
        {
          role: 'user',
          content: `当前目录: ${Array.from(folders).join(', ')}\n\n笔记列表:\n${JSON.stringify(noteStructure, null, 2)}`,
        },
      ],
    })

    const text = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '{}'
    let aiData: any = {}
    try {
      aiData = JSON.parse(text)
    } catch {
      aiData = { currentAnalysis: text.slice(0, 300), suggestions: [], proposedStructure: [] }
    }

    res.json({
      totalNotes: filteredNotes.length,
      totalFolders: folders.size,
      folders: Array.from(folders),
      analysis: aiData.currentAnalysis || '',
      suggestions: aiData.suggestions || [],
      proposedStructure: aiData.proposedStructure || [],
    })
  } catch (err: any) {
    console.error('Fold error:', err.message)
    res.status(500).json({ error: '笔记整理分析失败: ' + err.message })
  }
})

workflowRouter.post('/fold/apply', async (req, res) => {
  try {
    const { suggestions } = req.body as { suggestions: any[] }
    if (!suggestions || suggestions.length === 0) {
      res.status(400).json({ error: 'No suggestions provided' })
      return
    }

    const filesToBackup = new Set<string>()
    for (const s of suggestions) {
      if (s.from) filesToBackup.add(s.from)
      if (s.to) filesToBackup.add(s.to)
    }

    const backup = new VaultBackup(config.vaultPath)
    backup.snapshot([...filesToBackup])

    const result = await executeSuggestionsBatch(suggestions, config.vaultPath)
    invalidateCache()
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Reorganize & Rollback =====

workflowRouter.post('/vault/reorganize', async (req, res) => {
  try {
    const { mode, targetFolder } = req.body as { mode: 'preview' | 'execute'; targetFolder?: string }

    if (!anthropic) {
      res.status(503).json({ error: 'AI 服务未配置' })
      return
    }

    const notes = getNotes()
    const filtered = targetFolder
      ? notes.filter(n => n.path.toLowerCase().startsWith(targetFolder.toLowerCase()))
      : notes

    if (filtered.length === 0) {
      res.status(404).json({ error: '未找到笔记' })
      return
    }

    const folders = new Set<string>()
    filtered.forEach(n => {
      const parts = n.path.split('/')
      for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join('/'))
    })

    const noteInfo = filtered.slice(0, 60).map(n => ({
      path: n.path,
      title: n.title,
      tags: n.tags,
      folder: n.path.split('/').slice(0, -1).join('/') || '(root)',
    }))

    const aiRes = await anthropic.messages.create({
      model: config.ai?.model || 'deepseek-v4-pro',
      max_tokens: 4096,
      system: `你是一个知识库整理专家。请分析笔记并建议更合理的文件夹分类。
只返回 move 类型的建议。请严格以 JSON 格式输出（不要 markdown 代码块）：
{"moves": [{"file": "文件路径", "proposedFolder": "建议目录", "reason": "原因"}]}`,
      messages: [{
        role: 'user',
        content: `当前目录: ${Array.from(folders).join(', ')}\n\n笔记:\n${JSON.stringify(noteInfo, null, 2)}`,
      }],
    })

    const text = aiRes.content[0].type === 'text' ? aiRes.content[0].text : '{}'
    let aiData: any = {}
    try {
      aiData = JSON.parse(text)
    } catch {
      aiData = { moves: [] }
    }

    const moves = (aiData.moves || []).map((m: any) => ({
      file: m.file,
      currentFolder: m.file.split('/').slice(0, -1).join('/') || '(root)',
      proposedFolder: m.proposedFolder,
      reason: m.reason,
    }))

    if (mode === 'execute' && moves.length > 0) {
      const suggestions = moves.map((m: any) => ({
        type: 'move' as const,
        description: `移动 ${m.file} 到 ${m.proposedFolder}`,
        from: m.file,
        to: `${m.proposedFolder}/${m.file.split('/').pop()}`,
        reason: m.reason,
      }))
      const backup = new VaultBackup(config.vaultPath)
      backup.snapshot(moves.map((m: any) => m.file))
      const execResults = await executeSuggestionsBatch(suggestions, config.vaultPath)
      invalidateCache()
      res.json({ proposedMoves: moves, executionResults: execResults })
    } else {
      res.json({ proposedMoves: moves })
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

workflowRouter.post('/vault/rollback', async (req, res) => {
  try {
    const { backupPath } = req.body as { backupPath: string }
    if (!backupPath) {
      res.status(400).json({ error: 'Missing backupPath' })
      return
    }

    await rollbackBackup(backupPath)
    invalidateCache()
    res.json({ ok: true, restored: 1 })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ===== Schedule =====

workflowRouter.get('/schedule/status', (_req, res) => {
  try {
    const scheduleCfg = loadScheduleConfig()
    const status = scheduler.getStatus()
    res.json({ ...scheduleCfg, schedulerStatus: status.running ? 'running' : 'idle', ...status })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

workflowRouter.post('/schedule/config', (req, res) => {
  try {
    const patch = req.body as Partial<{
      enabled: boolean
      intervalMinutes: number
      autoApplySafe: boolean
      safeCategories: string[]
    }>
    scheduler.updateConfig(patch)
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

workflowRouter.post('/schedule/run-now', async (_req, res) => {
  try {
    const result = await scheduler.executeRun()
    invalidateCache()
    res.json({ ok: true, ...result })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
