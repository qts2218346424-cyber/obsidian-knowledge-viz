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

export interface AppSettings {
  vaultPath: string
  port: number
  ai?: { apiKey: string; baseURL: string; model?: string }
  configPath?: string
}

export interface ErrorQuestion {
  source: string
  question: string
  userAnswer: string
  correctAnswer: string
  explanation: string
  reviewCount: string
  nextReview: string
  _sourceFile?: string
}

export interface DailyReviewData {
  date: string
  dueQuestions: ErrorQuestion[]
  generatedQuestions: any[]
  stats: {
    totalQuestions: number
    masteredCount: number
    dueCount: number
    subjectCounts: Record<string, number>
    streakDays: number
  }
}

export interface VocabWord {
  word: string
  phonetic?: string
  definition: string
  example?: string
  subject: string
  reviewCount: number
  nextReview: string
  addedDate: string
}

export interface VocabData {
  totalWords: number
  dueWords: number
  dueRecords: VocabWord[]
  suggested: Array<{ word: string; definition: string; phonetic?: string; example?: string; subject: string }>
  subjectDistribution: Record<string, number>
  stats: { mastered: number; learning: number; newWords: number }
}

// Extended Vocabulary Management Types
export interface VocabBrowseItem {
  word: string
  phonetic: string
  definition: string
  example: string
  exampleCn: string
  frequency: string
  unit: number
  roots?: string
  synonyms?: string
  progress: { status: string; reviews: number; nextReview: string } | null
}

export interface VocabBrowseData {
  words: VocabBrowseItem[]
  total: number
  page: number
  size: number
  units: number[]
  stats: { total: number; mastered: number; learning: number; newWords: number; notAdded: number }
}

export interface VocabUnitProgress {
  unit: number
  total: number
  mastered: number
  learning: number
  newWords: number
  notAdded: number
}

export interface VocabStatsData {
  unitProgress: VocabUnitProgress[]
  frequencyDistribution: Record<string, { total: number; mastered: number; learning: number; newWords: number; notAdded: number }>
  overall: { total: number; mastered: number; learning: number; newWords: number; notAdded: number; masteredPct: number }
}

export interface VocabRootEntry {
  root: string
  meaning: string
  words: Array<{ word: string; definition: string; unit: number; frequency: string }>
}

export interface VocabRelationsData {
  roots: VocabRootEntry[]
  connections: Array<{ from: string; to: string; type: string }>
}

export interface VocabImportResult {
  imported: number
  skipped: number
  errors: string[]
  total: number
}

export interface DefuddleResult {
  url: string
  filePath: string
  title: string
  wordCount: number
  tags: string[]
  preview: string
}

export interface QueryResultItem {
  path: string
  title: string
  tags: string[]
  snippet: string
  score: number
}

export interface QueryResult {
  query: string
  results: QueryResultItem[]
  insights: string
  relatedTopics: string[]
}

export interface FoldSuggestion {
  type: 'move' | 'merge' | 'tag' | 'link' | 'create'
  description: string
  from: string
  to?: string
  reason: string
}

export interface FoldResult {
  totalNotes: number
  totalFolders: number
  folders: string[]
  analysis: string
  suggestions: FoldSuggestion[]
  proposedStructure: string[]
}

export interface ThinkBranch {
  id: string
  label: string
  color?: string
  children?: { id: string; label: string; note?: string }[]
}

export interface ThinkResult {
  center: { id: string; label: string; color?: string }
  branches: ThinkBranch[]
  connections: { from: string; to: string; label?: string }[]
  summary?: string
  canvas?: {
    nodes: { id: string; x: number; y: number; width: number; height: number; text: string; color?: string }[]
    edges: { id: string; fromNode: string; toNode: string }[]
  }
}

export interface VaultEvent {
  type: 'file-added' | 'file-changed' | 'file-deleted'
  path: string
  timestamp: string
}

export interface MusicFile {
  name: string
  path: string
  size: number
  ext: string
}

export interface MusicScanResult {
  path: string
  files: MusicFile[]
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

  // Settings
  getSettings: () => fetchJSON<AppSettings>('/settings'),

  updateSettings: (settings: Partial<AppSettings> & { ai?: { apiKey: string; baseURL: string; model?: string } }) =>
    putJSON<{ ok: boolean; vaultPath: string; aiConfigured: boolean }>('/settings', settings),

  // Filesystem browse (for folder picker)
  fsBrowse: (dirPath?: string) => {
    const url = dirPath ? `/fs/browse?path=${encodeURIComponent(dirPath)}` : '/fs/browse'
    return fetchJSON<{ current?: string; parent?: string | null; entries: { name: string; path: string }[] }>(url)
  },

  fsExists: (dirPath: string) =>
    fetchJSON<{ exists: boolean; isDirectory?: boolean }>(`/fs/exists?path=${encodeURIComponent(dirPath)}`),

  // AI Models
  fetchAIModels: () =>
    fetchJSON<{ models: { id: string; name: string }[]; current: string; source: string }>('/ai/models'),

  // Daily Error Log
  addErrorLog: (data: { notePath?: string; question: string; userAnswer?: string; correctAnswer: string; explanation?: string }) =>
    postJSON<{ ok: boolean; path: string; totalQuestions: number }>('/study/error-log', data),

  getErrorLog: (date?: string) =>
    fetchJSON<{ date: string; questions: ErrorQuestion[]; path: string }>(`/study/error-log${date ? `?date=${date}` : ''}`),

  getDailyReview: () => fetchJSON<DailyReviewData>('/study/daily-review'),

  markReviewComplete: (date: string, questionIndex: number, result: 'mastered' | 'hard' | 'easy') =>
    postJSON<{ ok: boolean }>('/study/review-complete', { date, questionIndex, result }),

  // Vocabulary
  getVocabulary: () => fetchJSON<VocabData>('/study/vocabulary'),

  addVocabulary: (words: Array<{ word: string; definition: string; phonetic?: string; example?: string; subject?: string }>) =>
    postJSON<{ ok: boolean; added: number; total: number }>('/study/vocabulary/add', { words }),

  reviewVocabulary: (word: string, result: 'known' | 'fuzzy' | 'unknown') =>
    postJSON<{ ok: boolean; word: string; reviewCount: number; nextReview: string }>('/study/vocabulary/review', { word, result }),

  generateVocabulary: (subject?: string, notePath?: string) =>
    postJSON<{ words: Array<{ word: string; definition: string; phonetic?: string; example?: string; subject: string }> }>('/study/vocabulary/generate', { subject, notePath }),

  // Vocabulary Management (Extended)
  getAllVocab: (params?: { page?: number; size?: number; unit?: number; frequency?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.size) q.set('size', String(params.size))
    if (params?.unit) q.set('unit', String(params.unit))
    if (params?.frequency) q.set('frequency', params.frequency)
    if (params?.status) q.set('status', params.status)
    if (params?.search) q.set('search', params.search)
    return fetchJSON<VocabBrowseData>(`/vocab/all?${q.toString()}`)
  },

  getVocabStats: () => fetchJSON<VocabStatsData>('/vocab/stats'),

  getVocabRelations: (root?: string) =>
    fetchJSON<VocabRelationsData>(`/vocab/relations${root ? `?root=${encodeURIComponent(root)}` : ''}`),

  importVocab: (format: 'csv' | 'json', data: string) =>
    postJSON<VocabImportResult>('/vocab/import', { format, data }),

  // Music
  scanMusicFolder: (folderPath: string) =>
    fetchJSON<MusicScanResult>(`/music/scan?path=${encodeURIComponent(folderPath)}`),

  getMusicStreamUrl: (filePath: string) =>
    `${BASE}/music/stream?path=${encodeURIComponent(filePath)}`,

  getMusicPath: () =>
    fetchJSON<{ musicPath: string }>('/music/path'),

  setMusicPath: (musicPath: string) =>
    putJSON<{ ok: boolean; musicPath: string }>('/music/path', { musicPath }),

  // Wiki Skills
  defuddle: (url: string, targetFolder?: string) =>
    postJSON<DefuddleResult>('/defuddle', { url, targetFolder }),

  query: (query: string, limit?: number) =>
    postJSON<QueryResult>('/query', { query, limit }),

  fold: (targetFolder?: string) =>
    postJSON<FoldResult>('/fold', { targetFolder }),

  think: (topic: string, depth?: number) =>
    postJSON<ThinkResult>('/think', { topic, depth }),

  // Duplicates
  getDuplicates: () =>
    fetchJSON<{ pairs: Array<{ fileA: string; fileB: string; similarity: number; matchType: 'prefix' | 'jaccard' | 'title'; longerFile: string; shorterFile: string }> }>('/vault/duplicates'),

  mergeDuplicates: (pairs: { keepFile: string; mergeFile: string; mode: string }[]) =>
    postJSON<{ results: Array<{ keepFile: string; mergedFile: string; success: boolean; appendedChars: number; error?: string }> }>('/vault/duplicates/merge', { pairs }),

  // Tag management
  getVaultTags: () =>
    fetchJSON<{ tags: Array<{ name: string; count: number; files: string[] }> }>('/vault/tags'),

  renameTag: (oldTag: string, newTag: string) =>
    postJSON<{ oldTag: string; newTag: string; filesUpdated: number }>('/vault/tags/rename', { oldTag, newTag }),

  mergeTags: (keepTag: string, mergeTag: string) =>
    postJSON<{ keepTag: string; mergeTag: string; filesUpdated: number }>('/vault/tags/merge', { keepTag, mergeTag }),

  deleteTag: (tag: string) =>
    postJSON<{ tag: string; filesUpdated: number }>('/vault/tags/delete', { tag }),

  // Fold apply
  foldApply: (suggestions: FoldSuggestion[]) =>
    postJSON<{
      results: Array<{ index: number; success: boolean; action: string; error?: string }>,
      summary: { total: number; succeeded: number; failed: number },
      backupPath: string
    }>('/fold/apply', { suggestions }),

  // Reorganize
  reorganize: (mode: 'preview' | 'execute', targetFolder?: string) =>
    postJSON<{
      proposedMoves: Array<{ file: string; currentFolder: string; proposedFolder: string; reason: string }>,
      executionResults?: {
        results: Array<{ index: number; success: boolean; action: string; error?: string }>,
        summary: { total: number; succeeded: number; failed: number },
        backupPath: string
      }
    }>('/vault/reorganize', { mode, targetFolder }),

  // Rollback
  rollback: (backupPath: string) =>
    postJSON<{ ok: boolean; restored: number }>('/vault/rollback', { backupPath }),

  // Schedule
  getScheduleStatus: () =>
    fetchJSON<{
      enabled: boolean; intervalMinutes: number; autoApplySafe: boolean;
      safeCategories: string[]; lastRun: string | null; schedulerStatus: string
    }>('/schedule/status'),

  updateScheduleConfig: (patch: { enabled?: boolean; intervalMinutes?: number; autoApplySafe?: boolean; safeCategories?: string[] }) =>
    postJSON<{ ok: boolean }>('/schedule/config', patch),

  runScheduleNow: () =>
    postJSON<{ ok: boolean; fixed: number; message: string }>('/schedule/run-now', {}),
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
