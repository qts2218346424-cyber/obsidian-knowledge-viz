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

  // Create a lookup map: title (lowercase) → note path
  const titleToPath = new Map<string, string>()
  for (const note of notes) {
    titleToPath.set(note.title.toLowerCase(), note.path)
    // Also map filename without extension
    const fileName = note.path.split('/').pop()?.replace('.md', '').toLowerCase() || ''
    if (fileName) {
      titleToPath.set(fileName, note.path)
    }
  }

  // Build nodes
  for (const note of notes) {
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

  // Build links from wikilinks
  for (const note of notes) {
    for (const link of note.links) {
      const targetPath = titleToPath.get(link.toLowerCase())
      if (targetPath && targetPath !== note.path) {
        const linkKey = `${note.path}→${targetPath}`
        if (!linkSet.has(linkKey)) {
          linkSet.add(linkKey)
          links.push({
            source: note.path,
            target: targetPath,
            value: 1,
          })
        }

        // If target doesn't have a note (dangling link), create a ghost node
        if (!nodeMap.has(targetPath)) {
          nodeMap.set(targetPath, {
            id: targetPath,
            label: link,
            group: 'orphan',
            size: 2,
            path: targetPath,
            tags: [],
            linkCount: 0,
          })
        }
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
