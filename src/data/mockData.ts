// ─── Knowledge Graph Data ─────────────────────────────────────────────────────

export type NodeGroup = 'core' | 'pipeline' | 'retrieval' | 'feature' | 'maintenance' | 'methodology'

export interface GraphNode {
  id: string
  label: string
  group: NodeGroup
  r: number
}

export interface GraphLink {
  source: string
  target: string
}

export const graphNodes: GraphNode[] = [
  { id: 'vault', label: 'Obsidian Vault', group: 'core', r: 24 },
  { id: 'ingestion', label: '文档摄取', group: 'pipeline', r: 16 },
  { id: 'parser', label: '解析引擎', group: 'pipeline', r: 13 },
  { id: 'chunker', label: '文本分块', group: 'pipeline', r: 12 },
  { id: 'entity', label: '实体抽取', group: 'pipeline', r: 14 },
  { id: 'crossref', label: '交叉引用', group: 'pipeline', r: 14 },
  { id: 'embedding', label: 'Embedding', group: 'pipeline', r: 13 },
  { id: 'bm25', label: 'BM25 检索', group: 'retrieval', r: 13 },
  { id: 'contextual', label: 'Contextual', group: 'retrieval', r: 13 },
  { id: 'ollama', label: 'Ollama 嵌入', group: 'retrieval', r: 13 },
  { id: 'hotcache', label: '热缓存', group: 'retrieval', r: 12 },
  { id: 'reranker', label: '余弦重排', group: 'retrieval', r: 11 },
  { id: 'autoresearch', label: '自动研究', group: 'feature', r: 16 },
  { id: 'think', label: '思维框架', group: 'feature', r: 14 },
  { id: 'canvas', label: '视觉画布', group: 'feature', r: 13 },
  { id: 'lint', label: 'Vault Lint', group: 'maintenance', r: 15 },
  { id: 'orphan', label: '孤立笔记', group: 'maintenance', r: 11 },
  { id: 'broken', label: '断链检测', group: 'maintenance', r: 11 },
  { id: 'gap', label: '知识缺口', group: 'maintenance', r: 11 },
  { id: 'duplicate', label: '重复内容', group: 'maintenance', r: 10 },
  { id: 'para', label: 'PARA', group: 'methodology', r: 12 },
  { id: 'zettel', label: 'Zettelkasten', group: 'methodology', r: 12 },
  { id: 'lyt', label: 'LYT', group: 'methodology', r: 12 },
  { id: 'mcp', label: 'MCP 协议', group: 'core', r: 14 },
  { id: 'claude', label: 'Claude API', group: 'core', r: 13 },
]

export const graphLinks: GraphLink[] = [
  { source: 'vault', target: 'ingestion' },
  { source: 'vault', target: 'lint' },
  { source: 'vault', target: 'mcp' },
  { source: 'vault', target: 'canvas' },
  { source: 'vault', target: 'bm25' },
  { source: 'vault', target: 'contextual' },
  { source: 'vault', target: 'ollama' },
  { source: 'vault', target: 'para' },
  { source: 'vault', target: 'zettel' },
  { source: 'vault', target: 'lyt' },
  { source: 'vault', target: 'autoresearch' },
  { source: 'vault', target: 'think' },
  { source: 'ingestion', target: 'parser' },
  { source: 'parser', target: 'chunker' },
  { source: 'chunker', target: 'entity' },
  { source: 'entity', target: 'crossref' },
  { source: 'crossref', target: 'embedding' },
  { source: 'bm25', target: 'hotcache' },
  { source: 'contextual', target: 'hotcache' },
  { source: 'ollama', target: 'reranker' },
  { source: 'reranker', target: 'hotcache' },
  { source: 'embedding', target: 'ollama' },
  { source: 'autoresearch', target: 'ingestion' },
  { source: 'think', target: 'crossref' },
  { source: 'mcp', target: 'claude' },
  { source: 'mcp', target: 'ingestion' },
  { source: 'lint', target: 'orphan' },
  { source: 'lint', target: 'broken' },
  { source: 'lint', target: 'gap' },
  { source: 'lint', target: 'duplicate' },
]

export const groupColors: Record<NodeGroup, string> = {
  core: '#8b5cf6',
  pipeline: '#06b6d4',
  retrieval: '#f59e0b',
  feature: '#10b981',
  maintenance: '#ef4444',
  methodology: '#ec4899',
}

export const groupLabels: Record<NodeGroup, string> = {
  core: '核心系统',
  pipeline: '摄取管道',
  retrieval: '检索层',
  feature: '功能模块',
  maintenance: '维护工具',
  methodology: '方法论',
}

// ─── Dashboard Data ───────────────────────────────────────────────────────────

export const healthData = [
  { metric: '链接完整性', score: 72, fullMark: 100 },
  { metric: '元数据覆盖', score: 90, fullMark: 100 },
  { metric: '孤立笔记', score: 85, fullMark: 100 },
  { metric: '内容去重', score: 65, fullMark: 100 },
  { metric: '标签一致性', score: 78, fullMark: 100 },
  { metric: '模板遵从', score: 92, fullMark: 100 },
  { metric: '知识缺口', score: 55, fullMark: 100 },
  { metric: '更新时效', score: 80, fullMark: 100 },
]

export const noteDistribution = [
  { name: '健康笔记', value: 142, color: '#10b981' },
  { name: '需要修复', value: 23, color: '#f59e0b' },
  { name: '孤立笔记', value: 8, color: '#ef4444' },
  { name: '缺失元数据', value: 15, color: '#8b5cf6' },
]

export const activityData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  摄取: Math.floor(Math.random() * 12 + 2),
  查询: Math.floor(Math.random() * 20 + 5),
  研究: Math.floor(Math.random() * 4),
}))

export const topEntities = [
  { name: 'Claude', mentions: 47 },
  { name: 'Obsidian', mentions: 42 },
  { name: 'RAG', mentions: 38 },
  { name: 'BM25', mentions: 31 },
  { name: 'Embedding', mentions: 29 },
  { name: 'MCP', mentions: 25 },
  { name: 'Zettelkasten', mentions: 22 },
  { name: 'PARA', mentions: 18 },
]

// ─── Workflow Data ────────────────────────────────────────────────────────────

export interface WorkflowStep {
  id: string
  label: string
  desc: string
  icon: string
  status: 'done' | 'active' | 'pending'
}

export const ingestionSteps: WorkflowStep[] = [
  { id: '1', label: '文档输入', desc: 'PDF / Markdown / Web URL', icon: 'FileInput', status: 'done' },
  { id: '2', label: '解析 & 分块', desc: '段落分割、Frontmatter 提取、结构化', icon: 'Cog', status: 'done' },
  { id: '3', label: '实体抽取', desc: 'LLM 识别人物、概念、事件实体', icon: 'Search', status: 'done' },
  { id: '4', label: '交叉引用', desc: '生成 Wikilinks 和反向链接', icon: 'Link', status: 'active' },
  { id: '5', label: '向量嵌入', desc: 'Ollama nomic-embed-text 生成', icon: 'Binary', status: 'pending' },
  { id: '6', label: '写入 Wiki', desc: '生成/更新 Markdown 页面', icon: 'CheckCircle', status: 'pending' },
]

export const researchSteps: WorkflowStep[] = [
  { id: '1', label: '发现缺口', desc: '从 Vault Lint 识别知识空白', icon: 'Lightbulb', status: 'done' },
  { id: '2', label: '网络搜索', desc: '多轮 WebFetch 收集资料', icon: 'Globe', status: 'done' },
  { id: '3', label: '综合分析', desc: '去重、交叉验证、结构化整理', icon: 'Puzzle', status: 'active' },
  { id: '4', label: '知识归档', desc: '生成 Wiki 页面并建立引用网络', icon: 'Archive', status: 'pending' },
]

export const lintSteps: WorkflowStep[] = [
  { id: '1', label: '扫描 Vault', desc: '遍历所有 Markdown 文件', icon: 'FolderSearch', status: 'done' },
  { id: '2', label: '8 类检查', desc: '孤立笔记/断链/重复/元数据等', icon: 'ShieldCheck', status: 'done' },
  { id: '3', label: '生成报告', desc: '按严重程度排列问题清单', icon: 'FileText', status: 'done' },
  { id: '4', label: '自动修复', desc: '修复断链、补充元数据', icon: 'Wrench', status: 'pending' },
]
