/**
 * TanStack React Query 缓存键契约字典
 */
export const queryKeys = {
  vault: {
    stats: ['vault', 'stats'] as const,
    tree: ['vault', 'tree'] as const,
    graph: ['vault', 'graph'] as const,
    health: ['vault', 'health'] as const,
    files: (q?: string) => ['vault', 'files', q ?? ''] as const,
    note: (path: string) => ['vault', 'note', path] as const,
  },
  study: {
    books: ['study', 'books'] as const,
    flashcards: ['study', 'flashcards'] as const,
    vocabulary: (params?: Record<string, unknown>) => ['study', 'vocab', params] as const,
    historyTimeline: ['study', 'historyTimeline'] as const,
  },
  quiz: {
    customQuestions: ['quiz', 'custom'] as const,
    bank: (subject?: string) => ['quiz', 'bank', subject ?? 'all'] as const,
  },
  ai: {
    models: ['ai', 'models'] as const,
    agents: ['ai', 'agents'] as const,
    skills: ['ai', 'skills'] as const,
  },
} as const
