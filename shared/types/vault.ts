/**
 * 知识库、双链图谱与健康度类型定义
 */
export interface VaultStats {
  totalNotes: number
  totalLinks: number
  totalTags: number
  totalWords: number
  orphansCount: number
  brokenLinksCount: number
  unresolvedCount?: number
  lastUpdated?: string
}

export interface GraphNode {
  id: string
  name: string
  val?: number
  group?: string
  tags?: string[]
  folder?: string
  backlinkCount?: number
  outlinkCount?: number
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type?: 'link' | 'tag' | 'folder'
}

export interface VaultGraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface VaultHealthReport {
  score: number
  orphans: string[]
  brokenLinks: Array<{ source: string; target: string }>
  emptyNotes: string[]
  duplicates: Array<{ files: string[]; similarity: number }>
}
