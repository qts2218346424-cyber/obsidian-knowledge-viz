import fs from 'fs'
import path from 'path'
import { config } from './context.js'

export type MemoryType = 'concept' | 'chunk' | 'mistake' | 'profile'
export type MemoryMastery = 'mastered' | 'learning' | 'weak'

export interface MemoryItem {
  id: string
  type: MemoryType
  title: string
  content: string
  subject: '数据结构' | '计算机组成' | '操作系统' | '计算机网络' | '高等数学' | '线性代数' | '概率论' | '考研全科'
  domain: 'cs_408' | 'math' | 'general'
  mastery?: MemoryMastery
  tags: string[]
  reviewCount: number
  lastReviewed: string
  examFrequency?: '高频核心' | '历年必考' | '常见陷阱' | '考点拔高'
  formulaKatex?: string
  createdAt: string
  updatedAt: string
}

export interface UserStudyProfile {
  targetExam: string
  targetYear: string
  examSubjects: string[]
  preferredTone: 'rigorous' | 'vivid' | 'exam'
  activePersona: string
  notesCreated: number
  questionsPracticed: number
}

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-cs-01',
    type: 'concept',
    title: '虚拟内存分页机制与 TLB / Cache 联合查找',
    content: '虚拟地址分为虚拟页号(VPN)与页内偏移量(VPO)。TLB为硬件页表缓存，TLB命中直接得物理页号(PPN)，缺失需查主存多级页表。结合 Cache 的查找时序：TLB -> 多级页表 -> Cache L1/L2 -> 主存。',
    subject: '操作系统',
    domain: 'cs_408',
    mastery: 'learning',
    tags: ['虚拟内存', 'TLB', 'Cache', '地址翻译'],
    reviewCount: 3,
    lastReviewed: new Date().toISOString().split('T')[0],
    examFrequency: '历年必考',
    createdAt: '2026-09-10',
    updatedAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'mem-cs-02',
    type: 'concept',
    title: 'AVL 平衡二叉树四种旋转平衡化',
    content: 'LL型右单旋、RR型左单旋、LR型先左后右双旋、RL型先右后左双旋。旋转后子树根节点深度恢复，中序遍历单调递增性始终保持不变。',
    subject: '数据结构',
    domain: 'cs_408',
    mastery: 'mastered',
    tags: ['二叉树', 'AVL树', '平衡化', '旋转'],
    reviewCount: 5,
    lastReviewed: new Date().toISOString().split('T')[0],
    examFrequency: '高频核心',
    createdAt: '2026-09-11',
    updatedAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'mem-cs-03',
    type: 'concept',
    title: 'CPU 五级流水线数据冒险 (RAW) 与 Forwarding 旁路技术',
    content: '前一条指令写寄存器发生在 WB 段，后一条指令读寄存器发生在 ID 段。若未解决则产生 RAW 冒险。硬件旁路（Forwarding）将 EX 或 MEM 段计算结果直接转发到下一指令的 ALU 输入端，避免 2 个周期 Stall 气泡。',
    subject: '计算机组成',
    domain: 'cs_408',
    mastery: 'learning',
    tags: ['流水线', 'RAW冲突', '旁路技术', 'Stall气泡'],
    reviewCount: 2,
    lastReviewed: new Date().toISOString().split('T')[0],
    examFrequency: '高频核心',
    createdAt: '2026-09-12',
    updatedAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'mem-cs-04',
    type: 'mistake',
    title: '【易错陷阱】TCP 拥塞控制超时重传 vs 收到 3 个冗余 ACK (快重传)',
    content: '超时重传 (Timeout)：ssthresh = cwnd / 2，cwnd 重置为 1 MSS，重新进入慢开始；收到 3 个冗余 ACK：ssthresh = cwnd / 2，cwnd = ssthresh (或 + 3 MSS)，进入快速恢复，绝不能重置为 1！',
    subject: '计算机网络',
    domain: 'cs_408',
    mastery: 'weak',
    tags: ['TCP', '拥塞控制', '慢开始', '快重传', '易错点'],
    reviewCount: 1,
    lastReviewed: new Date().toISOString().split('T')[0],
    examFrequency: '常见陷阱',
    createdAt: '2026-09-15',
    updatedAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'mem-math-01',
    type: 'concept',
    title: '泰勒公式麦克劳林展开与皮亚诺余项精确截断',
    content: '求未定式极限时，分母为 $x^n$ 时，分子各项必须统统展开到 $x^n$ 同阶项。若只展开到低阶会导致高阶系数信息丢失直接算错；若展开过深则计算量爆炸。常见 8 大基本初等函数麦克劳林级数必须倒背如流。',
    subject: '高等数学',
    domain: 'math',
    mastery: 'mastered',
    tags: ['极限', '泰勒公式', '麦克劳林展开', '未定式'],
    reviewCount: 6,
    lastReviewed: new Date().toISOString().split('T')[0],
    examFrequency: '历年必考',
    formulaKatex: 'f(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(0)}{k!} x^k + o(x^n)',
    createdAt: '2026-09-12',
    updatedAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'mem-math-02',
    type: 'concept',
    title: '实对称矩阵的正交相似对角化',
    content: '实对称矩阵性质：不同特征值对应的特征向量天然两两正交；重根特征值对应线性无关特征向量个数恰等于重数；必存在正交矩阵 $Q$ 使得 $Q^T A Q = \\Lambda$。施密特正交化用于同一特征值的不同特征向量。',
    subject: '线性代数',
    domain: 'math',
    mastery: 'learning',
    tags: ['矩阵', '实对称矩阵', '正交化', '对角化'],
    reviewCount: 4,
    lastReviewed: new Date().toISOString().split('T')[0],
    examFrequency: '历年必考',
    formulaKatex: 'Q^T A Q = \\text{diag}(\\lambda_1, \\lambda_2, \\dots, \\lambda_n)',
    createdAt: '2026-09-13',
    updatedAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'mem-math-03',
    type: 'mistake',
    title: '【易错陷阱】连续型随机变量函数的分布：雅可比单调变换区间切分',
    content: '当 $Y = g(X)$ 不是严格单调函数时，绝不能直接使用单调反函数公式 $f_Y(y) = f_X(h(y)) |h\'(y)|$！必须先切分单调区间分别求反函数求导累加，或者严格回归分布函数法 $F_Y(y) = P(g(X) \\le y)$ 积分！',
    subject: '概率论',
    domain: 'math',
    mastery: 'weak',
    tags: ['随机变量函数', '分布函数法', '易错点'],
    reviewCount: 2,
    lastReviewed: new Date().toISOString().split('T')[0],
    examFrequency: '常见陷阱',
    createdAt: '2026-09-14',
    updatedAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'mem-chunk-01',
    type: 'chunk',
    title: '408 操作系统页面置换四大经典算法速查卡',
    content: '1. OPT(最佳)：淘汰未来最长时间内不再访问的页面，理想不可实现；\n2. FIFO(先进先出)：淘汰最早进入的页面，会产生 Belady 异常现象；\n3. LRU(最近最久未使用)：淘汰过去最长时间未被访问的页面，硬件成本高；\n4. CLOCK(时钟/NRU)：结合访问位与修改位(A, M)，4 轮扫描淘汰 (0,0) -> (0,1) -> (0,0) -> (0,1)。',
    subject: '操作系统',
    domain: 'cs_408',
    tags: ['页面置换', 'LRU', 'FIFO', 'CLOCK', 'Belady'],
    reviewCount: 3,
    lastReviewed: new Date().toISOString().split('T')[0],
    examFrequency: '高频核心',
    createdAt: '2026-09-15',
    updatedAt: new Date().toISOString().split('T')[0],
  },
]

function getMemoryFilePath(): string {
  const primaryDir = path.join(config.vaultPath || process.cwd(), 'wiki', '.memory')
  if (!fs.existsSync(primaryDir)) {
    try { fs.mkdirSync(primaryDir, { recursive: true }) } catch { /* ignore */ }
  }
  return path.join(primaryDir, 'ai_memory.json')
}

export function loadAllMemories(): MemoryItem[] {
  const filePath = getMemoryFilePath()
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const data = JSON.parse(raw)
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch {
    // fallback
  }

  // Save default memories
  saveAllMemories(DEFAULT_MEMORIES)
  return DEFAULT_MEMORIES
}

export function saveAllMemories(memories: MemoryItem[]): void {
  const filePath = getMemoryFilePath()
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(memories, null, 2), 'utf-8')
  } catch (err: any) {
    console.error('Failed to save memories:', err.message)
  }
}

export function addMemory(item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt' | 'reviewCount'>): MemoryItem {
  const memories = loadAllMemories()
  const today = new Date().toISOString().split('T')[0]
  const newItem: MemoryItem = {
    ...item,
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    reviewCount: 1,
    createdAt: today,
    updatedAt: today,
  }
  memories.unshift(newItem)
  saveAllMemories(memories)
  return newItem
}

export function updateMemory(id: string, patch: Partial<MemoryItem>): MemoryItem | null {
  const memories = loadAllMemories()
  const idx = memories.findIndex(m => m.id === id)
  if (idx === -1) return null

  memories[idx] = {
    ...memories[idx],
    ...patch,
    updatedAt: new Date().toISOString().split('T')[0],
  }
  saveAllMemories(memories)
  return memories[idx]
}

export function deleteMemory(id: string): boolean {
  const memories = loadAllMemories()
  const filtered = memories.filter(m => m.id !== id)
  if (filtered.length === memories.length) return false
  saveAllMemories(filtered)
  return true
}

export function getMemoryStats() {
  const memories = loadAllMemories()
  const concepts = memories.filter(m => m.type === 'concept')
  const mastered = concepts.filter(m => m.mastery === 'mastered').length
  const learning = concepts.filter(m => m.mastery === 'learning').length
  const weak = concepts.filter(m => m.mastery === 'weak').length
  const mistakes = memories.filter(m => m.type === 'mistake').length
  const chunks = memories.filter(m => m.type === 'chunk').length

  return {
    total: memories.length,
    conceptsCount: concepts.length,
    masteredCount: mastered,
    learningCount: learning,
    weakCount: weak,
    mistakesCount: mistakes,
    chunksCount: chunks,
    masteryRate: concepts.length > 0 ? Math.round((mastered / concepts.length) * 100) : 0,
  }
}
