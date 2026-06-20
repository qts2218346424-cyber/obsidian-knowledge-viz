// API service layer for communicating with Express backend

const BASE = '/api'

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE}${url}`)
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function putJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function delJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

async function patchJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

// ===== Types =====

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

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface VaultStats {
  vaultPath: string
  connected: boolean
  totalNotes: number
  totalLinks: number
  totalTags: number
  totalWords: number
  avgWordsPerNote: number
  orphanNotes: number
  danglingLinks: number
  recentActivity: { date: string; modified: number; created: number }[]
  tagDistribution: { name: string; count: number }[]
  folderDistribution: { name: string; count: number }[]
}

export interface HealthCategory {
  name: string
  label: string
  score: number
  maxScore: number
  issues: { severity: string; message: string; note?: string }[]
}

export interface HealthReport {
  overallScore: number
  categories: HealthCategory[]
  stats: VaultStats
}

export interface FileListItem {
  path: string
  title: string
  tags: string[]
  modified: string
  wordCount: number
  score?: number
  snippet?: string
}

export interface FileDetail {
  path: string
  title: string
  frontmatter: Record<string, unknown>
  content: string
  links: string[]
  tags: string[]
  modified: string
  wordCount: number
}

export interface TreeNode {
  name: string
  path: string
  type: 'folder' | 'file'
  children?: TreeNode[]
}

export interface ChatResponse {
  reply: string
  citedNotes: {
    title: string
    path: string
    excerpt: string
    tags: string[]
  }[]
  timestamp: string
}

export interface IngestResult {
  originalName: string
  markdownPath: string
  wordCount: number
  tags: string[]
  entities: string[]
  wikilinks: number
  preview: string
}

export interface IngestStatus {
  installed: boolean
  pythonVersion?: string
  error?: string
  supportedFormats: string[]
}

export interface ResearchGap {
  topic: string
  references: number
}

export interface ResearchResult {
  topic: string
  path: string
  wordCount: number
  preview: string
}

export interface LintFixResult {
  category: string
  fixed: number
  skipped: number
  details: { fixed: string[]; skipped: string[] }
}

export interface Flashcard {
  q: string
  a: string
}

export interface FlashcardResult {
  flashcards: Flashcard[]
  notePath: string
  noteTitle: string
}

export interface SubjectStats {
  subject: string
  totalNotes: number
  totalWords: number
  lastModified: string
}

export interface ReviewDueData {
  reviewQueue: {
    subject: string
    totalNotes: number
    totalWords: number
    lastModified: string
    dueCount: number
    dueNotes: {
      path: string
      title: string
      tags: string[]
      daysSinceModified: number
      priority: 'high' | 'medium' | 'low'
      interval: string
      wordCount: number
    }[]
  }[]
  stats: SubjectStats[]
}

// ===== API Functions =====

export const api = {
  getGraph: () => fetchJSON<GraphData>('/vault/graph'),

  getHealth: () => fetchJSON<HealthReport>('/vault/health'),

  getStats: () => fetchJSON<VaultStats>('/vault/stats'),

  getFiles: (query?: string) =>
    fetchJSON<FileListItem[]>(query ? `/vault/files?q=${encodeURIComponent(query)}` : '/vault/files'),

  getFile: (filePath: string) =>
    fetchJSON<FileDetail>(`/vault/file?path=${encodeURIComponent(filePath)}`),

  getTree: () => fetchJSON<TreeNode[]>('/vault/tree'),

  sendMessage: (message: string, history?: { role: 'user' | 'assistant'; content: string }[]) =>
    postJSON<ChatResponse>('/chat', { message, history }),

  refreshVault: () => postJSON<{ ok: boolean; noteCount: number }>('/vault/refresh', {}),

  // File CRUD
  createFile: (filePath: string, content: string, frontmatter?: Record<string, unknown>) =>
    postJSON<FileDetail>('/vault/file', { path: filePath, content, frontmatter }),

  updateFile: (filePath: string, content: string, frontmatter?: Record<string, unknown>) =>
    putJSON<FileDetail>('/vault/file', { path: filePath, content, frontmatter }),

  deleteFile: (filePath: string) =>
    delJSON<{ ok: boolean; deletedPath: string }>('/vault/file', { path: filePath }),

  renameFile: (oldPath: string, newPath: string) =>
    patchJSON<{ ok: boolean; newPath: string; linksUpdated: number }>('/vault/file/rename', { oldPath, newPath }),

  // Document Ingest
  getIngestStatus: () => fetchJSON<IngestStatus>('/ingest/status'),

  uploadFile: async (file: File): Promise<IngestResult> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${BASE}/ingest/upload`, { method: 'POST', body: formData })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || `Upload failed: ${res.status}`)
    }
    return res.json()
  },

  // Auto-Research
  getResearchGaps: () => fetchJSON<{ gaps: ResearchGap[] }>('/research/gaps'),

  research: (topic?: string) =>
    postJSON<ResearchResult>('/research', topic ? { topic } : { auto: true }),

  // Lint Fix
  lintFix: (category: string, issueIndex?: number) =>
    postJSON<LintFixResult>('/vault/lint/fix', { category, issueIndex }),

  // Study
  generateFlashcards: (notePath: string) =>
    postJSON<FlashcardResult>('/study/flashcards', { notePath }),

  getReviewDue: () => fetchJSON<ReviewDueData>('/study/review-due'),
}

// Check if the API is available
export async function checkApiHealth(): Promise<boolean> {
  try {
    await fetchJSON('/vault/stats')
    return true
  } catch {
    return false
  }
}
