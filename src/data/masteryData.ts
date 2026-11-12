// ─── 考研考点掌握度热力图（Mastery Graph）数据核心模型 ─────────────────────────

export interface MasteryPoint {
  id: string
  label: string
  subject: string
  rate: number // 0 ~ 100
  totalAttempts: number
  wrongAttempts: number
  recentStatus: string
  weakReason: string
  coursewareId?: string
  practiceSubject: string
  practiceKeyword: string
}

export const DEFAULT_MASTERY_DATABASE: Record<string, Omit<MasteryPoint, 'rate' | 'totalAttempts' | 'wrongAttempts' | 'recentStatus'> & { defaultRate: number; defaultRecent: string }> = {
  // ── 408 数据结构 ──
  'ds-avl-rbtree': {
    id: 'ds-avl-rbtree',
    label: '平衡二叉树与红黑树',
    subject: '408 数据结构',
    defaultRate: 36,
    defaultRecent: '近 3 次做错 2 次 (正确率 33%)',
    weakReason: '常在节点插入后对【最小不平衡子树的根】定位失误，对 LR 与 RL 双旋的旋转次序、平衡因子 (BF) 更新及红黑树“左根频黑”性质记忆混淆。',
    coursewareId: 'cw-avl-tree',
    practiceSubject: '数据结构',
    practiceKeyword: '平衡二叉树',
  },
  'ds-shortest-path': {
    id: 'ds-shortest-path',
    label: 'Dijkstra与拓扑排序',
    subject: '408 数据结构',
    defaultRate: 64,
    defaultRecent: '近 3 次做错 1 次 (正确率 67%)',
    weakReason: '混淆 Dijkstra 贪心算法不可处理负权边的考场陷阱；有向无环图 (DAG) 拓扑排序唯一性前提以及 Dist[] 松弛逻辑容易推导粗心。',
    coursewareId: 'cw-dijkstra-graph',
    practiceSubject: '数据结构',
    practiceKeyword: '最短路径',
  },
  'ds-tree-traverse': {
    id: 'ds-tree-traverse',
    label: '二叉树遍历与线索化',
    subject: '408 数据结构',
    defaultRate: 88,
    defaultRecent: '近 3 次全部答对 (正确率 100%)',
    weakReason: '先序/中序/后序遍历递归转非递归算法熟练，中序线索二叉树前驱后继寻找边界偶有轻微遗漏。',
    coursewareId: 'cw-avl-tree',
    practiceSubject: '数据结构',
    practiceKeyword: '二叉树',
  },
  'ds-list': {
    id: 'ds-list',
    label: '线性表与双向链表',
    subject: '408 数据结构',
    defaultRate: 92,
    defaultRecent: '近 3 次全部答对 (正确率 100%)',
    weakReason: '基础单链表头插法与尾插法掌握扎实，注意双向循环链表空表判断及边界指针悬空防范。',
    coursewareId: 'cw-avl-tree',
    practiceSubject: '数据结构',
    practiceKeyword: '线性表',
  },
  'ds-internal-sort': {
    id: 'ds-internal-sort',
    label: '快速排序与堆排序',
    subject: '408 数据结构',
    defaultRate: 58,
    defaultRecent: '近 3 次做错 1 次 (正确率 67%)',
    weakReason: '大根堆建堆过程中自顶向下调整次数计算易错；快速排序最坏时间复杂度发生的初始序列状态（已排序）与枢轴划分细节容易失分。',
    coursewareId: 'cw-avl-tree',
    practiceSubject: '数据结构',
    practiceKeyword: '排序',
  },

  // ── 408 计算机组成原理 ──
  'co-cache-map': {
    id: 'co-cache-map',
    label: 'Cache组相联与替换策略',
    subject: '408 计算机组成原理',
    defaultRate: 42,
    defaultRecent: '近 3 次做错 2 次 (正确率 33%)',
    weakReason: '主存物理地址划分中【Tag 标记位、组索引号 Index、块内地址 Offset】位数计算频出偏差；冷不防结合命中率与两级 Cache 缺失惩罚的大题失分率高。',
    coursewareId: 'cw-cache-mapping',
    practiceSubject: '计算机组成原理',
    practiceKeyword: 'Cache',
  },
  'co-pipeline': {
    id: 'co-pipeline',
    label: '指令流水线与数据冒险',
    subject: '408 计算机组成原理',
    defaultRate: 46,
    defaultRecent: '近 3 次做错 2 次 (正确率 33%)',
    weakReason: '数据相关（RAW/WAR/WAW）识别不清，对通过“数据旁路转发”还是“硬件阻塞/气泡插入”解决冒险的时钟周期计算出现误差。',
    coursewareId: 'cw-cpu-pipeline',
    practiceSubject: '计算机组成原理',
    practiceKeyword: '流水线',
  },
  'co-ieee754': {
    id: 'co-ieee754',
    label: 'IEEE 754浮点数与溢出',
    subject: '408 计算机组成原理',
    defaultRate: 52,
    defaultRecent: '近 3 次做错 1 次 (正确率 67%)',
    weakReason: '单精度 32 位浮点数阶码偏置值 127 转换反直觉；规格化数隐藏位 1 以及机器数表示范围正负溢出判定容易混淆。',
    coursewareId: 'cw-ieee754-float',
    practiceSubject: '计算机组成原理',
    practiceKeyword: '浮点数',
  },

  // ── 408 操作系统 ──
  'os-page-tlb': {
    id: 'os-page-tlb',
    label: '分页虚拟内存与TLB快表',
    subject: '408 操作系统',
    defaultRate: 38,
    defaultRecent: '近 3 次做错 2 次 (正确率 33%)',
    weakReason: 'TLB 命中与未命中时访存次数（1次或2次）算错；两级页表中页目录表和页表占用内存空间与虚实地址转换截断机制经常失分。',
    coursewareId: 'cw-two-level-paging',
    practiceSubject: '操作系统',
    practiceKeyword: '页表',
  },
  'os-pv': {
    id: 'os-pv',
    label: '信号量PV操作与死锁',
    subject: '408 操作系统',
    defaultRate: 65,
    defaultRecent: '近 3 次做错 1 次 (正确率 67%)',
    weakReason: '生产者消费者与读者写者问题中互斥锁 mutex 与资源信号量 empty/full 的 P 操作顺序搞反导致死锁，银行家算法安全性检测矩阵漏算。',
    coursewareId: 'cw-pv-sync-mutex',
    practiceSubject: '操作系统',
    practiceKeyword: '死锁',
  },

  // ── 408 计算机网络 ──
  'net-tcp-flow': {
    id: 'net-tcp-flow',
    label: 'TCP拥塞控制与滑动窗口',
    subject: '408 计算机网络',
    defaultRate: 70,
    defaultRecent: '近 3 次做错 1 次 (正确率 67%)',
    weakReason: '慢开始、拥塞避免、快重传与快恢复各阶段 cwnd 与 ssthresh 的数值跳变规律（收到3个冗余ACK时 cwnd 减半还是置为1）记混。',
    coursewareId: 'cw-tcp-congestion',
    practiceSubject: '计算机网络',
    practiceKeyword: 'TCP',
  },
  'net-routing': {
    id: 'net-routing',
    label: 'IP路由选择与子网划分',
    subject: '408 计算机网络',
    defaultRate: 82,
    defaultRecent: '近 3 次全部答对 (正确率 100%)',
    weakReason: 'CIDR 变长子网掩码与最长前缀匹配原则熟练，偶在广播地址与网络前缀全0全1的有效主机数计算中掉入出题陷阱。',
    coursewareId: 'cw-tcp-protocol',
    practiceSubject: '计算机网络',
    practiceKeyword: 'IP路由',
  },

  // ── 考研高等数学 ──
  'math-taylor': {
    id: 'math-taylor',
    label: '泰勒展开与极值判定',
    subject: '考研数学 · 高等数学',
    defaultRate: 44,
    defaultRecent: '近 3 次做错 2 次 (正确率 33%)',
    weakReason: '皮亚诺余项麦克劳林展开阶数不足导致极限计算提前抵消；多元函数极值判定充分条件中 Hessian 矩阵判别式 AC - B² 符号反转。',
    coursewareId: 'cw-taylor-approx',
    practiceSubject: '考研数学',
    practiceKeyword: '泰勒',
  },
  'math-integral-geom': {
    id: 'math-integral-geom',
    label: '定积分几何应用与旋转体',
    subject: '考研数学 · 高等数学',
    defaultRate: 54,
    defaultRecent: '近 3 次做错 1 次 (正确率 67%)',
    weakReason: '圆盘法与柱壳法微元确定失误；绕任意非坐标轴平行直线旋转时的距离半径表达式写错导致整个积分推导归零。',
    coursewareId: 'cw-solid-revolution',
    practiceSubject: '考研数学',
    practiceKeyword: '定积分',
  },

  // ── 考研线性代数 ──
  'math-eigen': {
    id: 'math-eigen',
    label: '特征值特征向量与相似对角化',
    subject: '考研数学 · 线性代数',
    defaultRate: 60,
    defaultRecent: '近 3 次做错 1 次 (正确率 67%)',
    weakReason: '实对称矩阵正交相似对角化时重特征值对应的特征向量忘记施密特正交化；矩阵相似与合同判定充要条件混淆。',
    coursewareId: 'cw-matrix-eigen',
    practiceSubject: '考研数学',
    practiceKeyword: '特征值',
  },
}

const STORAGE_KEY = 'coreforge_quiz_mastery_stats'

export interface StoredMasteryRecord {
  total: number
  correct: number
  wrong: number
  recentHistory: boolean[] // true 为对，false 为错
}

export function getStoredMasteryStats(): Record<string, StoredMasteryRecord> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveStoredMasteryStats(stats: Record<string, StoredMasteryRecord>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {}
}

export function updateMasteryFromQuizResult(pointKey: string, isCorrect: boolean) {
  const stats = getStoredMasteryStats()
  const current = stats[pointKey] || { total: 0, correct: 0, wrong: 0, recentHistory: [] }
  current.total += 1
  if (isCorrect) {
    current.correct += 1
  } else {
    current.wrong += 1
  }
  current.recentHistory = [isCorrect, ...current.recentHistory].slice(0, 5)
  stats[pointKey] = current
  saveStoredMasteryStats(stats)
}

/**
 * 智能获取节点考点掌握度数据，将用户真实做题战况与大纲知识体系无缝交融
 */
export function getNodeMastery(nodeId: string, nodeLabel: string): MasteryPoint {
  const stats = getStoredMasteryStats()
  const baseDef = DEFAULT_MASTERY_DATABASE[nodeId]

  // 若存在用户本地做题记录
  const userRecord = stats[nodeId] || stats[nodeLabel]
  if (userRecord && userRecord.total > 0) {
    const rate = Math.round((userRecord.correct / userRecord.total) * 100)
    const recent = userRecord.recentHistory.slice(0, 3)
    const recentWrong = recent.filter(r => !r).length
    const recentStatus = `近 3 次做错 ${recentWrong} 次 (正确率 ${rate}%)`

    return {
      id: nodeId,
      label: nodeLabel,
      subject: baseDef?.subject || '考研综合',
      rate,
      totalAttempts: userRecord.total,
      wrongAttempts: userRecord.wrong,
      recentStatus,
      weakReason: baseDef?.weakReason || '该考点在真题选择与综合大题中出题角度灵活，需防范概念偷换与边界条件疏漏。',
      coursewareId: baseDef?.coursewareId,
      practiceSubject: baseDef?.practiceSubject || '408',
      practiceKeyword: baseDef?.practiceKeyword || nodeLabel,
    }
  }

  // 无做题记录时不显示演示掌握度，统一返回「未练习」状态
  return {
    id: nodeId,
    label: nodeLabel,
    subject: baseDef?.subject || '知识库考点',
    rate: 0,
    totalAttempts: 0,
    wrongAttempts: 0,
    recentStatus: '未练习',
    weakReason: baseDef?.weakReason || '暂无做题记录，完成对应考点练习后将自动生成掌握度诊断。',
    coursewareId: baseDef?.coursewareId,
    practiceSubject: baseDef?.practiceSubject || '408',
    practiceKeyword: baseDef?.practiceKeyword || nodeLabel,
  }
}
