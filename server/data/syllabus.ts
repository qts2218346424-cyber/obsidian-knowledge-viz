export interface SyllabusNode {
  id: string
  domain: 'cs_408' | 'math'
  subject: string
  level1: string
  level2: string
  level3: string
  keywords: string[]
}

/**
 * 408 计算机综合与考研数学官方三级核心考点大纲拓扑树
 */
export const CORE_SYLLABUS: SyllabusNode[] = [
  // ================= 408 计算机学科专业基础综合 =================
  // --- 数据结构 (DS) ---
  {
    id: '408_DS_LIST_01',
    domain: 'cs_408',
    subject: '数据结构',
    level1: '线性表',
    level2: '顺序存储与链式存储',
    level3: '顺序表与单双向循环链表基本操作及复杂度',
    keywords: ['顺序表', '链表', '双向链表', '循环链表', '头指针', '插入删除复杂度']
  },
  {
    id: '408_DS_STACK_01',
    domain: 'cs_408',
    subject: '数据结构',
    level1: '栈、队列与数组',
    level2: '栈与队列的应用',
    level3: '表达式求值、递归与循环队列队满判断条件',
    keywords: ['栈', '队列', '循环队列', '入栈序列', '表达式求值', '括号匹配']
  },
  {
    id: '408_DS_TREE_01',
    domain: 'cs_408',
    subject: '数据结构',
    level1: '树与二叉树',
    level2: '二叉树遍历与线索化',
    level3: '先序中序后序遍历递归/非递归、中序线索二叉树构造',
    keywords: ['二叉树', '先序遍历', '中序遍历', '后序遍历', '线索二叉树', '节点数公式']
  },
  {
    id: '408_DS_TREE_02',
    domain: 'cs_408',
    subject: '数据结构',
    level1: '树与二叉树',
    level2: '树的应用与特殊二叉树',
    level3: '哈夫曼树带权路径长度(WPL)、并查集、平衡二叉树(AVL)与红黑树特性',
    keywords: ['哈夫曼树', 'WPL', '并查集', '平衡二叉树', 'AVL', '红黑树']
  },
  {
    id: '408_DS_GRAPH_01',
    domain: 'cs_408',
    subject: '数据结构',
    level1: '图',
    level2: '图的遍历与生成树',
    level3: '邻接矩阵/邻接表、BFS/DFS、Prim与Kruskal最小生成树',
    keywords: ['图', '邻接矩阵', '邻接表', 'BFS', 'DFS', '最小生成树', 'Prim', 'Kruskal']
  },
  {
    id: '408_DS_GRAPH_02',
    domain: 'cs_408',
    subject: '数据结构',
    level1: '图',
    level2: '最短路径与拓扑排序',
    level3: 'Dijkstra与Floyd最短路径、AOV网拓扑排序、AOE网关键路径',
    keywords: ['最短路径', 'Dijkstra', 'Floyd', '拓扑排序', 'AOV', '关键路径', 'AOE']
  },
  {
    id: '408_DS_SEARCH_01',
    domain: 'cs_408',
    subject: '数据结构',
    level1: '查找',
    level2: '树形查找与散列表',
    level3: '二叉排序树(BST)、折半查找判定树、散列表哈希冲突解决与ASL计算',
    keywords: ['二叉排序树', 'BST', '折半查找', '散列表', '哈希冲突', 'ASL']
  },
  {
    id: '408_DS_SORT_01',
    domain: 'cs_408',
    subject: '数据结构',
    level1: '内部排序与外部排序',
    level2: '高效排序算法',
    level3: '快速排序枢轴划分、堆排序建堆调整、归并排序、排序稳定性对比',
    keywords: ['快速排序', '堆排序', '归并排序', '冒泡排序', '排序稳定性', '时间复杂度']
  },

  // --- 计算机组成原理 (CO) ---
  {
    id: '408_CO_DATA_01',
    domain: 'cs_408',
    subject: '计算机组成原理',
    level1: '数据的表示和运算',
    level2: '定点数与浮点数表示',
    level3: '补码加减法溢出判断、IEEE 754 单精度浮点数规格化与范围',
    keywords: ['补码', '溢出判断', 'IEEE 754', '定点数', '浮点数', '移码']
  },
  {
    id: '408_CO_MEM_01',
    domain: 'cs_408',
    subject: '计算机组成原理',
    level1: '存储系统',
    level2: '主存与Cache高速缓存',
    level3: 'Cache直接映射/组相联映射计算、替换算法与写策略、平均访存时间',
    keywords: ['Cache', '直接映射', '组相联', '命中率', 'SRAM', 'DRAM', '主存']
  },
  {
    id: '408_CO_MEM_02',
    domain: 'cs_408',
    subject: '计算机组成原理',
    level1: '存储系统',
    level2: '虚拟存储器',
    level3: '页式虚拟存储器、快表TLB与慢表Page Table结合访存过程',
    keywords: ['虚拟存储器', 'TLB', '页表', '缺页异常', '页面大小']
  },
  {
    id: '408_CO_CPU_01',
    domain: 'cs_408',
    subject: '计算机组成原理',
    level1: '中央处理器',
    level2: '指令流水线',
    level3: '五段流水线数据通路、结构冒险/数据冒险/控制冒险与转发技术',
    keywords: ['流水线', '数据冒险', '结构冒险', '控制冒险', '转发', '旁路', '数据通路']
  },
  {
    id: '408_CO_IO_01',
    domain: 'cs_408',
    subject: '计算机组成原理',
    level1: '输入输出系统',
    level2: 'I/O控制方式',
    level3: '中断处理全过程(关中断/保护断点/向量中断)、DMA控制器与传送周期',
    keywords: ['中断', '中断隐指令', '中断向量', 'DMA', '通道', '程序查询']
  },

  // --- 操作系统 (OS) ---
  {
    id: '408_OS_PROC_01',
    domain: 'cs_408',
    subject: '操作系统',
    level1: '进程管理',
    level2: '同步互斥与信号量',
    level3: 'PV操作经典同步互斥模型(生产者消费者/读者写者/哲学家进餐)',
    keywords: ['PV操作', '信号量', '互斥', '同步', '临界区', '生产者消费者']
  },
  {
    id: '408_OS_PROC_02',
    domain: 'cs_408',
    subject: '操作系统',
    level1: '进程管理',
    level2: '死锁与调度',
    level3: '死锁产生四条件、银行家算法资源分配状态安全性检测',
    keywords: ['死锁', '银行家算法', '安全状态', '死锁预防', '时间片轮转']
  },
  {
    id: '408_OS_MEM_01',
    domain: 'cs_408',
    subject: '操作系统',
    level1: '内存管理',
    level2: '虚拟内存页面置换',
    level3: '请求分页存储管理、FIFO/LRU/CLOCK置换算法与Belady异常',
    keywords: ['分页', '虚拟内存', 'LRU', 'FIFO', 'CLOCK', 'Belady', '缺页率']
  },
  {
    id: '408_OS_FILE_01',
    domain: 'cs_408',
    subject: '操作系统',
    level1: '文件管理',
    level2: '文件结构与磁盘管理',
    level3: '混合索引分配inode文件最大大小计算、磁盘调度算法(SSTF/SCAN/LOOK)',
    keywords: ['inode', '混合索引', '文件系统', '磁盘调度', 'SCAN', 'SSTF', '寻道时间']
  },

  // --- 计算机网络 (CN) ---
  {
    id: '408_CN_LINK_01',
    domain: 'cs_408',
    subject: '计算机网络',
    level1: '数据链路层',
    level2: '介质访问控制与局域网',
    level3: 'CSMA/CD协议冲突检测、退避算法、最小帧长计算公式与交换机转发表',
    keywords: ['CSMA/CD', '争用期', '最小帧长', '退避算法', '交换机', '以太网']
  },
  {
    id: '408_CN_NET_01',
    domain: 'cs_408',
    subject: '计算机网络',
    level1: '网络层',
    level2: 'IP寻址与路由',
    level3: 'IPv4地址与CIDR子网划分、聚合超网、ARP协议寻址过程、路由表最长匹配',
    keywords: ['IP地址', 'CIDR', '子网掩码', 'ARP', '最长匹配', '路由选择', 'ICMP']
  },
  {
    id: '408_CN_TRANS_01',
    domain: 'cs_408',
    subject: '计算机网络',
    level1: '传输层',
    level2: 'TCP连接与流量拥塞控制',
    level3: 'TCP三次握手/四次挥手状态机转换、慢开始/拥塞避免/快重传/快恢复',
    keywords: ['TCP', '三次握手', '四次挥手', '滑动窗口', '拥塞控制', '慢开始', '拥塞窗口']
  },
  {
    id: '408_CN_APP_01',
    domain: 'cs_408',
    subject: '计算机网络',
    level1: '应用层',
    level2: '网络应用协议',
    level3: 'DNS递归/迭代解析过程、HTTP 1.1持久连接与HTTP 2.0多路复用',
    keywords: ['DNS', 'HTTP', 'HTTPS', '迭代查询', '递归查询', '状态码', 'Cookie']
  },

  // ================= 全国硕士研究生统一入学考试 考研数学 =================
  // --- 高等数学 / 微积分 (MATH_CALC) ---
  {
    id: 'MATH_CALC_LIMIT_01',
    domain: 'math',
    subject: '高等数学',
    level1: '函数、极限与连续',
    level2: '求极限核心方法',
    level3: '泰勒展开式求极限、等价无穷小代换原则、洛必达法则适用条件',
    keywords: ['极限', '泰勒公式', '等价无穷小', '洛必达法则', '无穷小比较', '麦克劳林展开']
  },
  {
    id: 'MATH_CALC_DIFF_01',
    domain: 'math',
    subject: '高等数学',
    level1: '一元函数微分学',
    level2: '微分中值定理',
    level3: '罗尔定理/拉格朗日中值定理辅助函数构造、柯西中值定理与导数零点证明',
    keywords: ['微分中值定理', '罗尔定理', '拉格朗日', '辅助函数', '零点定理', '单调性']
  },
  {
    id: 'MATH_CALC_INT_01',
    domain: 'math',
    subject: '高等数学',
    level1: '一元函数积分学',
    level2: '定积分与反常积分',
    level3: '变上限积分求导公式、换元法与分部积分法、反常积分审敛比较法',
    keywords: ['定积分', '变上限积分', '分部积分', '换元积分', '反常积分', '对称区间积分']
  },
  {
    id: 'MATH_CALC_MULTI_01',
    domain: 'math',
    subject: '高等数学',
    level1: '多元函数微积分学',
    level2: '二重积分与极坐标',
    level3: '普通对称性与轮换对称性计算二重积分、极坐标与直角坐标系转换',
    keywords: ['二重积分', '极坐标', '普通对称性', '轮换对称性', '偏导数', '全微分']
  },
  {
    id: 'MATH_CALC_SERIES_01',
    domain: 'math',
    subject: '高等数学',
    level1: '无穷级数',
    level2: '常数项与幂级数',
    level3: '正项级数比值/根值审敛法、交错级数莱布尼茨定理、幂级数收敛域与和函数求法',
    keywords: ['级数', '比值审敛法', '莱布尼茨', '收敛半径', '幂级数求和', '展开式']
  },
  {
    id: 'MATH_CALC_ODE_01',
    domain: 'math',
    subject: '高等数学',
    level1: '常微分方程',
    level2: '微分方程求解',
    level3: '一阶线性方程常数变易法、二阶常系数齐次/非齐次线性微分方程特解形式',
    keywords: ['微分方程', '特征方程', '特解', '常数变易法', '齐次线性', '通解']
  },

  // --- 线性代数 (MATH_LA) ---
  {
    id: 'MATH_LA_MAT_01',
    domain: 'math',
    subject: '线性代数',
    level1: '矩阵与行列式',
    level2: '矩阵运算与逆矩阵',
    level3: '伴随矩阵公式性质、矩阵的秩性质定理、初等变换法求逆矩阵',
    keywords: ['行列式', '伴随矩阵', '逆矩阵', '矩阵的秩', '分块矩阵', '初等变换']
  },
  {
    id: 'MATH_LA_VEC_01',
    domain: 'math',
    subject: '线性代数',
    level1: '向量与线性方程组',
    level2: '线性相关性与通解',
    level3: '向量组线性相关/无关判别定理、齐次方程基础解系、非齐次方程通解构造',
    keywords: ['线性相关', '线性无关', '极大线性无关组', '基础解系', '线性方程组', '自由未知量']
  },
  {
    id: 'MATH_LA_EIGEN_01',
    domain: 'math',
    subject: '线性代数',
    level1: '特征值与特征向量',
    level2: '相似对角化与二次型',
    level3: '矩阵相似对角化充要条件、实对称矩阵正交相似对角化、正定二次型判别法',
    keywords: ['特征值', '特征向量', '相似对角化', '实对称矩阵', '二次型', '正定矩阵', '惯性指数']
  },

  // --- 概率论与数理统计 (MATH_PROB) ---
  {
    id: 'MATH_PROB_EVENT_01',
    domain: 'math',
    subject: '概率论与数理统计',
    level1: '随机事件与概率',
    level2: '全概率与贝叶斯',
    level3: '条件概率乘法定理、全概率公式、贝叶斯逆概公式与事件独立性判定',
    keywords: ['条件概率', '全概率公式', '贝叶斯公式', '事件独立性', '乘法公式']
  },
  {
    id: 'MATH_PROB_VAR_01',
    domain: 'math',
    subject: '概率论与数理统计',
    level1: '随机变量及其分布',
    level2: '常见分布与数字特征',
    level3: '二维连续型联合概率密度与边缘分布、数学期望/方差/协方差计算性质',
    keywords: ['概率密度', '联合分布', '边缘分布', '数学期望', '方差', '协方差', '相关系数']
  }
]

/**
 * 根据题目文本或关键词自动关联考研大纲节点
 */
export function matchSyllabusNode(text: string, subject?: string): SyllabusNode | undefined {
  if (!text) return undefined
  const lower = text.toLowerCase()

  // 若提供了科目，优先在该科目内检索
  const candidates = subject
    ? CORE_SYLLABUS.filter(s => s.subject === subject || s.domain === subject)
    : CORE_SYLLABUS

  let bestNode: SyllabusNode | undefined
  let maxScore = 0

  for (const node of candidates) {
    let score = 0
    for (const kw of node.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += 2
      }
    }
    if (lower.includes(node.level1.toLowerCase())) score += 3
    if (lower.includes(node.level2.toLowerCase())) score += 2
    if (lower.includes(node.level3.toLowerCase())) score += 2

    if (score > maxScore) {
      maxScore = score
      bestNode = node
    }
  }

  // 兜底返回该科目的首个节点
  return bestNode || (candidates.length > 0 ? candidates[0] : undefined)
}
