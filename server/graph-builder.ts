import { VaultNote } from './vault-parser'

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface GraphNode {
  id: string
  label: string
  group: string
  size: number
  path: string
  tags: string[]
  linkCount: number
}

export interface GraphLink {
  source: string
  target: string
  value: number
}

/**
 * Build a knowledge graph from parsed vault notes.
 * Each note becomes a node, each [[wikilink]] becomes an edge.
 */
export function buildGraph(notes: VaultNote[]): GraphData {
  const nodeMap = new Map<string, GraphNode>()
  const linkSet = new Set<string>()
  const links: GraphLink[] = []

  // Obsidian resolves a wikilink by title, filename, or relative path.
  // Keep all three indexes so links such as [[数据结构/_index]] resolve
  // to wiki/数据结构/_index.md instead of being counted as dangling.
  const titleToPath = new Map<string, string>()
  const pathToPath = new Map<string, string>()
  const fileNameToPaths = new Map<string, string[]>()
  for (const note of notes) {
    const normalizedPath = normalizeLinkTarget(note.path)
    const fileName = normalizedPath.split('/').pop() || ''
    titleToPath.set(normalizeLinkTarget(note.title), note.path)
    pathToPath.set(normalizedPath, note.path)
    const matches = fileNameToPaths.get(fileName) || []
    matches.push(note.path)
    fileNameToPaths.set(fileName, matches)
  }

  const resolveTarget = (link: string): string | undefined => {
    const normalizedLink = normalizeLinkTarget(link)
    if (pathToPath.has(normalizedLink)) return pathToPath.get(normalizedLink)
    if (titleToPath.has(normalizedLink)) return titleToPath.get(normalizedLink)

    const suffixMatches = [...pathToPath.entries()]
      .filter(([candidate]) => candidate.endsWith(`/${normalizedLink}`))
      .map(([, targetPath]) => targetPath)
    if (suffixMatches.length === 1) return suffixMatches[0]

    const fileNameMatches = fileNameToPaths.get(normalizedLink.split('/').pop() || '')
    if (fileNameMatches?.length === 1) return fileNameMatches[0]
    return undefined
  }

  const ensureNode = (note: VaultNote) => {
    if (nodeMap.has(note.path)) return
    const group = inferGroup(note)
    nodeMap.set(note.path, {
      id: note.path,
      label: note.title,
      group,
      size: Math.min(3 + note.links.length * 2, 20),
      path: note.path,
      tags: note.tags.slice(0, 5),
      linkCount: note.links.length,
    })
  }

  for (const note of notes) {
    ensureNode(note)
  }

  // Build links from resolved wikilinks. Dangling links stay in health checks,
  // while the visual graph only renders relationships between real notes.
  for (const note of notes) {
    for (const link of note.links) {
      const targetPath = resolveTarget(link)
      if (!targetPath || targetPath === note.path) continue

      const linkKey = `${note.path}→${targetPath}`
      if (!linkSet.has(linkKey)) {
        linkSet.add(linkKey)
        links.push({
          source: note.path,
          target: targetPath,
          value: 1,
        })
      }
    }
  }

  // Update link counts for target nodes
  for (const link of links) {
    const target = nodeMap.get(link.target)
    if (target) {
      target.linkCount++
      target.size = Math.min(3 + target.linkCount * 2, 20)
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  }
}

function normalizeLinkTarget(value: string): string {
  return value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\/+/, '')
    .replace(/^\/+/, '')
    .replace(/\.md$/i, '')
    .toLowerCase()
}

/**
 * Infer which group a note belongs to based on its path and tags.
 */
function inferGroup(note: VaultNote): string {
  const pathLower = note.path.toLowerCase()
  const tagsLower = note.tags.map(t => t.toLowerCase())

  // Path-based grouping
  if (pathLower.includes('moc') || pathLower.includes('index') || pathLower.includes('home')) {
    return 'core'
  }
  if (pathLower.includes('project')) return 'project'
  if (pathLower.includes('daily') || pathLower.includes('journal')) return 'daily'
  if (pathLower.includes('reference') || pathLower.includes('source')) return 'reference'
  if (pathLower.includes('template')) return 'template'
  if (pathLower.includes('area')) return 'area'
  if (pathLower.includes('resource')) return 'resource'

  // Tag-based grouping
  if (tagsLower.some(t => t.includes('moc') || t.includes('index'))) return 'core'
  if (tagsLower.some(t => t.includes('project'))) return 'project'
  if (tagsLower.some(t => t.includes('daily'))) return 'daily'

  return 'note'
}
