// ─── Knowledge Graph Data ─────────────────────────────────────────────────────

export type NodeGroup =
  | 'cs_ds'       // 408 数据结构
  | 'cs_co'       // 408 计算机组成原理
  | 'cs_os'       // 408 操作系统
  | 'cs_net'      // 408 计算机网络
  | 'math_gaoshu' // 考研数学 · 高等数学
  | 'math_xiandai'// 考研数学 · 线性代数
  | 'math_gailv'  // 考研数学 · 概率统计

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
  // ── 408 数据结构 ──
  { id: 'ds-complexity', label: '时间复杂度与渐近分析', group: 'cs_ds', r: 15 },
  { id: 'ds-list', label: '线性表与双向链表', group: 'cs_ds', r: 13 },
  { id: 'ds-stack-queue', label: '栈与循环队列', group: 'cs_ds', r: 14 },
  { id: 'ds-tree-traverse', label: '二叉树遍历与线索化', group: 'cs_ds', r: 16 },
  { id: 'ds-avl-rbtree', label: '平衡二叉树与红黑树', group: 'cs_ds', r: 16 },
  { id: 'ds-huffman', label: '哈夫曼树与最优前缀码', group: 'cs_ds', r: 14 },
  { id: 'ds-graph-traverse', label: '图的深度与广度搜索', group: 'cs_ds', r: 15 },
  { id: 'ds-shortest-path', label: 'Dijkstra与拓扑排序', group: 'cs_ds', r: 17 },
  { id: 'ds-internal-sort', label: '快速排序与堆排序', group: 'cs_ds', r: 16 },
  { id: 'ds-hash', label: '散列表与哈希冲突解决', group: 'cs_ds', r: 14 },

  // ── 408 计算机组成原理 ──
  { id: 'co-ieee754', label: 'IEEE 754浮点数与溢出', group: 'cs_co', r: 15 },
  { id: 'co-cache-map', label: 'Cache组相联与替换策略', group: 'cs_co', r: 17 },
  { id: 'co-pipeline', label: '指令流水线与数据冒险', group: 'cs_co', r: 18 },
  { id: 'co-addressing', label: '指令寻址与操作码扩展', group: 'cs_co', r: 14 },
  { id: 'co-interrupt', label: '中断响应系统与DMA方式', group: 'cs_co', r: 15 },
  { id: 'co-datapath', label: '单周期与多周期数据通路', group: 'cs_co', r: 16 },

  // ── 408 操作系统 ──
  { id: 'os-pv-sync', label: 'PV操作与经典进程同步', group: 'cs_os', r: 18 },
  { id: 'os-deadlock', label: '死锁避免与银行家算法', group: 'cs_os', r: 16 },
  { id: 'os-paging', label: '页式虚拟存储与TLB快表', group: 'cs_os', r: 17 },
  { id: 'os-replacement', label: '页面置换算法(LRU/CLOCK)', group: 'cs_os', r: 15 },
  { id: 'os-filesystem', label: 'Inode索引节点与FAT目录', group: 'cs_os', r: 15 },
  { id: 'os-disk-schedule', label: '磁盘调度(SCAN/SSTF)', group: 'cs_os', r: 13 },

  // ── 408 计算机网络 ──
  { id: 'net-tcp-handshake', label: 'TCP三次握手与四次挥手', group: 'cs_net', r: 18 },
  { id: 'net-congestion', label: 'TCP拥塞控制与慢开始', group: 'cs_net', r: 16 },
  { id: 'net-subnet-cidr', label: 'IP子网划分与CIDR汇聚', group: 'cs_net', r: 16 },
  { id: 'net-route-ospf', label: '路由算法与RIP/OSPF', group: 'cs_net', r: 14 },
  { id: 'net-csma-cd', label: 'CSMA/CD冲突检测与以太网', group: 'cs_net', r: 14 },
  { id: 'net-dns-http', label: 'DNS解析流程与HTTPS加密', group: 'cs_net', r: 15 },

  // ── 考研数学 · 高等数学 ──
  { id: 'math-limits', label: '极限运算与未定式洛必达', group: 'math_gaoshu', r: 17 },
  { id: 'math-taylor', label: '泰勒公式与麦克劳林展开', group: 'math_gaoshu', r: 18 },
  { id: 'math-mvt', label: '微分中值定理与零点定理', group: 'math_gaoshu', r: 16 },
  { id: 'math-integral', label: '定积分性质与反常积分', group: 'math_gaoshu', r: 16 },
  { id: 'math-multi-diff', label: '多元微分与偏导连续极值', group: 'math_gaoshu', r: 15 },
  { id: 'math-double-integral', label: '二重积分与高斯公式', group: 'math_gaoshu', r: 16 },
  { id: 'math-differential-eq', label: '一阶与二阶微分方程', group: 'math_gaoshu', r: 15 },

  // ── 考研数学 · 线性代数 ──
  { id: 'math-matrix-rank', label: '矩阵的秩与初等行变换', group: 'math_xiandai', r: 17 },
  { id: 'math-linear-eq', label: '线性方程组解的结构', group: 'math_xiandai', r: 16 },
  { id: 'math-vector-basis', label: '向量组极大无关组与基', group: 'math_xiandai', r: 15 },
  { id: 'math-eigen', label: '特征值特征向量与相似化', group: 'math_xiandai', r: 17 },
  { id: 'math-quadratic', label: '二次型化标准型与正定性', group: 'math_xiandai', r: 15 },

  // ── 考研数学 · 概率统计 ──
  { id: 'math-bayes', label: '全概率公式与贝叶斯公式', group: 'math_gailv', r: 16 },
  { id: 'math-2d-random', label: '二维随机变量与边缘分布', group: 'math_gailv', r: 15 },
  { id: 'math-expectation', label: '数学期望方差与协方差', group: 'math_gailv', r: 16 },
  { id: 'math-clt', label: '中心极限定理与大数定律', group: 'math_gailv', r: 14 },
  { id: 'math-mle', label: '参数矩估计与极大似然', group: 'math_gailv', r: 15 },
]

export const graphLinks: GraphLink[] = [
  // 408 内部与交叉
  { source: 'ds-list', target: 'ds-stack-queue' },
  { source: 'ds-stack-queue', target: 'ds-tree-traverse' },
  { source: 'ds-tree-traverse', target: 'ds-avl-rbtree' },
  { source: 'ds-tree-traverse', target: 'ds-huffman' },
  { source: 'ds-tree-traverse', target: 'ds-graph-traverse' },
  { source: 'ds-graph-traverse', target: 'ds-shortest-path' },
  { source: 'ds-internal-sort', target: 'ds-complexity' },
  { source: 'ds-hash', target: 'ds-complexity' },

  { source: 'co-ieee754', target: 'co-datapath' },
  { source: 'co-datapath', target: 'co-pipeline' },
  { source: 'co-addressing', target: 'co-datapath' },
  { source: 'co-cache-map', target: 'os-paging' },          // 跨科：计组Cache 与 OS分页
  { source: 'co-pipeline', target: 'os-pv-sync' },           // 跨科：流水线与进程调度
  { source: 'co-interrupt', target: 'os-pv-sync' },

  { source: 'os-pv-sync', target: 'os-deadlock' },
  { source: 'os-paging', target: 'os-replacement' },
  { source: 'os-filesystem', target: 'os-disk-schedule' },
  { source: 'os-filesystem', target: 'net-dns-http' },

  { source: 'net-tcp-handshake', target: 'net-congestion' },
  { source: 'net-tcp-handshake', target: 'net-dns-http' },
  { source: 'net-subnet-cidr', target: 'net-route-ospf' },
  { source: 'net-csma-cd', target: 'net-subnet-cidr' },
  { source: 'net-tcp-handshake', target: 'os-pv-sync' },       // 跨科：网络TCP与操作系统套接字

  // 数学内部与交叉
  { source: 'math-limits', target: 'math-taylor' },
  { source: 'math-taylor', target: 'math-mvt' },
  { source: 'math-mvt', target: 'math-integral' },
  { source: 'math-integral', target: 'math-double-integral' },
  { source: 'math-multi-diff', target: 'math-double-integral' },
  { source: 'math-integral', target: 'math-differential-eq' },

  { source: 'math-matrix-rank', target: 'math-linear-eq' },
  { source: 'math-linear-eq', target: 'math-vector-basis' },
  { source: 'math-vector-basis', target: 'math-eigen' },
  { source: 'math-eigen', target: 'math-quadratic' },

  { source: 'math-bayes', target: 'math-2d-random' },
  { source: 'math-2d-random', target: 'math-expectation' },
  { source: 'math-expectation', target: 'math-clt' },
  { source: 'math-expectation', target: 'math-mle' },
  { source: 'math-double-integral', target: 'math-2d-random' }, // 跨科：二重积分与二维概率密度

  // 数学与 408 核心联动
  { source: 'math-limits', target: 'ds-complexity' },
  { source: 'math-matrix-rank', target: 'ds-graph-traverse' },
]

export const groupColors: Record<NodeGroup, string> = {
  cs_ds: '#10b981',       // 翡翠绿 · 数据结构
  cs_co: '#3b82f6',       // 科技蓝 · 计组原理
  cs_os: '#f43f5e',       // 玫瑰红 · 操作系统
  cs_net: '#f59e0b',      // 琥珀黄 · 计算机网络
  math_gaoshu: '#ef4444', // 热情红 · 高等数学
  math_xiandai: '#8b5cf6',// 典雅紫 · 线性代数
  math_gailv: '#06b6d4',  // 晴空青 · 概率统计
}

export const groupLabels: Record<NodeGroup, string> = {
  cs_ds: '408 数据结构',
  cs_co: '408 计算机组成',
  cs_os: '408 操作系统',
  cs_net: '408 计算机网络',
  math_gaoshu: '数学 · 高等数学',
  math_xiandai: '数学 · 线性代数',
  math_gailv: '数学 · 概率统计',
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
