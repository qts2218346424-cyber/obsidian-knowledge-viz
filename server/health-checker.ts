import { VaultNote } from './vault-parser'

export interface HealthReport {
  overallScore: number
  categories: HealthCategory[]
  stats: VaultStats
}

export interface HealthCategory {
  name: string
  label: string
  score: number
  maxScore: number
  issues: HealthIssue[]
}

export interface HealthIssue {
  severity: 'info' | 'warning' | 'error'
  message: string
  note?: string
}

export interface VaultStats {
  totalNotes: number
  totalLinks: number
  totalTags: number
  totalWords: number
  avgWordsPerNote: number
  orphanNotes: number
  danglingLinks: number
  recentActivity: DailyActivity[]
  tagDistribution: TagCount[]
  folderDistribution: FolderCount[]
}

export interface DailyActivity {
  date: string
  modified: number
  created: number
}

export interface TagCount {
  name: string
  count: number
}

export interface FolderCount {
  name: string
  count: number
}

/**
 * Run all 8 health checks on the vault.
 */
export function checkHealth(notes: VaultNote[], vaultPath: string): HealthReport {
  const categories = [
    checkOrphanNotes(notes),
    checkLinkIntegrity(notes),
    checkMetadataCoverage(notes),
    checkContentDuplicates(notes),
    checkTagConsistency(notes),
    checkTemplateCompliance(notes),
    checkKnowledgeGaps(notes),
    checkUpdateTimeliness(notes),
  ]

  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + (c.score / c.maxScore) * 100, 0) / categories.length
  )

  const stats = computeStats(notes, vaultPath)

  return { overallScore, categories, stats }
}

function computeStats(notes: VaultNote[], _vaultPath: string): VaultStats {
  const allLinks = notes.flatMap(n => n.links)
  const allTags = notes.flatMap(n => n.tags)
  const totalWords = notes.reduce((sum, n) => sum + n.wordCount, 0)

  // Build title set for orphan/dangling detection
  const titleSet = new Set(notes.map(n => n.title.toLowerCase()))
  const fileNameSet = new Set(
    notes.map(n => n.path.split('/').pop()?.replace('.md', '').toLowerCase() || '')
  )

  // Orphan notes: no incoming links
  const linkedTitles = new Set(allLinks.map(l => l.toLowerCase()))
  const orphanNotes = notes.filter(n => {
    const title = n.title.toLowerCase()
    const fileName = n.path.split('/').pop()?.replace('.md', '').toLowerCase() || ''
    return !linkedTitles.has(title) && !linkedTitles.has(fileName)
  }).length

  // Dangling links: links pointing to non-existent notes
  const danglingLinks = allLinks.filter(link => {
    const lower = link.toLowerCase()
    return !titleSet.has(lower) && !fileNameSet.has(lower)
  }).length

  // Recent activity (last 30 days)
  const now = new Date()
  const recentActivity: DailyActivity[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const modified = notes.filter(n => {
      const mDate = n.modified.toISOString().split('T')[0]
      return mDate === dateStr
    }).length
    recentActivity.push({ date: dateStr, modified, created: 0 })
  }

  // Tag distribution
  const tagCounts = new Map<string, number>()
  for (const tag of allTags) {
    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
  }
  const tagDistribution = [...tagCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  // Folder distribution
  const folderCounts = new Map<string, number>()
  for (const note of notes) {
    const folder = note.path.includes('/')
      ? note.path.split('/')[0]
      : '(root)'
    folderCounts.set(folder, (folderCounts.get(folder) || 0) + 1)
  }
  const folderDistribution = [...folderCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return {
    totalNotes: notes.length,
    totalLinks: allLinks.length,
    totalTags: allTags.length,
    totalWords,
    avgWordsPerNote: notes.length > 0 ? Math.round(totalWords / notes.length) : 0,
    orphanNotes,
    danglingLinks: [...new Set(allLinks.filter(link => {
      const lower = link.toLowerCase()
      return !titleSet.has(lower) && !fileNameSet.has(lower)
    }))].length,
    recentActivity,
    tagDistribution,
    folderDistribution,
  }
}

// ===== 8 Health Check Categories =====

function checkOrphanNotes(notes: VaultNote[]): HealthCategory {
  const linkedTitles = new Set(
    notes.flatMap(n => n.links.map(l => l.toLowerCase()))
  )
  const orphans = notes.filter(n => {
    const title = n.title.toLowerCase()
    const fileName = n.path.split('/').pop()?.replace('.md', '').toLowerCase() || ''
    return !linkedTitles.has(title) && !linkedTitles.has(fileName)
  })

  const issues: HealthIssue[] = orphans.slice(0, 10).map(n => ({
    severity: orphans.length > notes.length * 0.3 ? 'warning' : 'info',
    message: `"${n.title}" 没有被任何其他笔记引用`,
    note: n.path,
  }))

  const ratio = notes.length > 0 ? 1 - orphans.length / notes.length : 1
  return {
    name: 'orphan_notes',
    label: '孤立笔记检测',
    score: Math.round(ratio * 10),
    maxScore: 10,
    issues,
  }
}

function checkLinkIntegrity(notes: VaultNote[]): HealthCategory {
  const titleSet = new Set(notes.map(n => n.title.toLowerCase()))
  const fileNameSet = new Set(
    notes.map(n => n.path.split('/').pop()?.replace('.md', '').toLowerCase() || '')
  )

  const dangling: { note: string; link: string }[] = []
  for (const note of notes) {
    for (const link of note.links) {
      const lower = link.toLowerCase()
      if (!titleSet.has(lower) && !fileNameSet.has(lower)) {
        dangling.push({ note: note.title, link })
      }
    }
  }

  const issues: HealthIssue[] = dangling.slice(0, 10).map(d => ({
    severity: 'error' as const,
    message: `"${d.note}" 中的链接 [[${d.link}]] 指向不存在的笔记`,
    note: d.note,
  }))

  const totalLinks = notes.reduce((s, n) => s + n.links.length, 0)
  const ratio = totalLinks > 0 ? 1 - dangling.length / totalLinks : 1
  return {
    name: 'link_integrity',
    label: '链接完整性',
    score: Math.round(ratio * 10),
    maxScore: 10,
    issues,
  }
}

function checkMetadataCoverage(notes: VaultNote[]): HealthCategory {
  const requiredFields = ['title', 'tags', 'created', 'updated']
  let totalFields = 0
  let presentFields = 0

  for (const note of notes) {
    for (const field of requiredFields) {
      totalFields++
      if (note.frontmatter[field] !== undefined) {
        presentFields++
      }
    }
  }

  const ratio = totalFields > 0 ? presentFields / totalFields : 0.5
  const issues: HealthIssue[] = []
  const lowMeta = notes.filter(n =>
    requiredFields.filter(f => n.frontmatter[f] !== undefined).length < 2
  )
  for (const note of lowMeta.slice(0, 8)) {
    issues.push({
      severity: 'warning',
      message: `"${note.title}" 缺少关键 frontmatter 字段`,
      note: note.path,
    })
  }

  return {
    name: 'metadata_coverage',
    label: '元数据覆盖率',
    score: Math.round(ratio * 10),
    maxScore: 10,
    issues,
  }
}

function checkContentDuplicates(notes: VaultNote[]): HealthCategory {
  // Simple duplicate detection: compare first 200 chars of content
  const snippets = new Map<string, string[]>()
  for (const note of notes) {
    const snippet = note.content.substring(0, 200).trim().toLowerCase()
    if (snippet.length > 20) {
      const existing = snippets.get(snippet) || []
      existing.push(note.path)
      snippets.set(snippet, existing)
    }
  }

  const dupes = [...snippets.entries()].filter(([, paths]) => paths.length > 1)
  const issues: HealthIssue[] = dupes.slice(0, 5).map(([, paths]) => ({
    severity: 'warning',
    message: `发现相似内容: ${paths.join(', ')}`,
  }))

  const ratio = notes.length > 0 ? 1 - dupes.length / notes.length : 1
  return {
    name: 'content_duplicates',
    label: '内容去重',
    score: Math.round(Math.max(ratio, 0) * 10),
    maxScore: 10,
    issues,
  }
}

function checkTagConsistency(notes: VaultNote[]): HealthCategory {
  const allTags = notes.flatMap(n => n.tags)
  const tagCounts = new Map<string, number>()
  for (const tag of allTags) {
    tagCounts.set(tag.toLowerCase(), (tagCounts.get(tag.toLowerCase()) || 0) + 1)
  }

  // Find similar tags (potential duplicates like "project" vs "projects")
  const similarTags: [string, string][] = []
  const tagList = [...tagCounts.keys()]
  for (let i = 0; i < tagList.length; i++) {
    for (let j = i + 1; j < tagList.length; j++) {
      if (
        tagList[i] + 's' === tagList[j] ||
        tagList[j] + 's' === tagList[i] ||
        tagList[i].replace(/-/g, '') === tagList[j].replace(/-/g, '')
      ) {
        similarTags.push([tagList[i], tagList[j]])
      }
    }
  }

  const issues: HealthIssue[] = similarTags.slice(0, 5).map(([a, b]) => ({
    severity: 'info' as const,
    message: `标签 "${a}" 和 "${b}" 可能重复`,
  }))

  // Single-use tags
  const singleUse = [...tagCounts.entries()].filter(([, c]) => c === 1).length
  if (singleUse > 5) {
    issues.push({
      severity: 'info',
      message: `有 ${singleUse} 个标签仅使用了一次`,
    })
  }

  const ratio = similarTags.length === 0 ? 1 : Math.max(0, 1 - similarTags.length / Math.max(tagCounts.size, 1))
  return {
    name: 'tag_consistency',
    label: '标签一致性',
    score: Math.round(ratio * 10),
    maxScore: 10,
    issues,
  }
}

function checkTemplateCompliance(notes: VaultNote[]): HealthCategory {
  // Check if notes follow a basic structure: has heading, has content, reasonable length
  const issues: HealthIssue[] = []
  let compliant = 0

  for (const note of notes) {
    const hasHeading = note.content.includes('#')
    const hasContent = note.wordCount > 10
    const hasFrontmatter = Object.keys(note.frontmatter).length > 0

    if (hasHeading && hasContent && hasFrontmatter) {
      compliant++
    } else if (note.wordCount < 5) {
      issues.push({
        severity: 'info',
        message: `"${note.title}" 内容过短 (${note.wordCount} 字)`,
        note: note.path,
      })
    }
  }

  const ratio = notes.length > 0 ? compliant / notes.length : 0.5
  return {
    name: 'template_compliance',
    label: '模板规范度',
    score: Math.round(ratio * 10),
    maxScore: 10,
    issues: issues.slice(0, 10),
  }
}

function checkKnowledgeGaps(notes: VaultNote[]): HealthCategory {
  // Find heavily linked notes that don't exist (knowledge gaps)
  const titleSet = new Set(notes.map(n => n.title.toLowerCase()))
  const fileNameSet = new Set(
    notes.map(n => n.path.split('/').pop()?.replace('.md', '').toLowerCase() || '')
  )

  const gapCounts = new Map<string, number>()
  for (const note of notes) {
    for (const link of note.links) {
      const lower = link.toLowerCase()
      if (!titleSet.has(lower) && !fileNameSet.has(lower)) {
        gapCounts.set(link, (gapCounts.get(link) || 0) + 1)
      }
    }
  }

  const topGaps = [...gapCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const issues: HealthIssue[] = topGaps.map(([name, count]) => ({
    severity: count >= 3 ? 'warning' : 'info',
    message: `"${name}" 被 ${count} 篇笔记引用但尚未创建`,
  }))

  const ratio = gapCounts.size === 0 ? 1 : Math.max(0, 1 - gapCounts.size / Math.max(notes.length, 1))
  return {
    name: 'knowledge_gaps',
    label: '知识缺口',
    score: Math.round(ratio * 10),
    maxScore: 10,
    issues,
  }
}

function checkUpdateTimeliness(notes: VaultNote[]): HealthCategory {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const stale = notes.filter(n => n.modified < ninetyDaysAgo)
  const recent = notes.filter(n => n.modified >= thirtyDaysAgo)

  const issues: HealthIssue[] = stale.slice(0, 8).map(n => ({
    severity: 'info' as const,
    message: `"${n.title}" 超过 90 天未更新`,
    note: n.path,
  }))

  const ratio = notes.length > 0 ? recent.length / notes.length : 0.5
  return {
    name: 'update_timeliness',
    label: '更新时效性',
    score: Math.round(Math.min(ratio * 15, 10)),
    maxScore: 10,
    issues,
  }
}
