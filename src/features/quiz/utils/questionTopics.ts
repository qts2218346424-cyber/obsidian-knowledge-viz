import { QUESTION_BANK, type QuizQuestion } from '../../../data/questions'
import { MATH_QUESTION_BANK } from '../../../data/questions/math'
import { ALL_EXAM_PAPERS, type ExamPaperQuestion } from '../../../data/examPapers'
import type { ResourceDomain } from '../../../services/api'
import type { CsSubject, MathCategory, MathSubject, UnifiedQuestion } from '../../../types/subject'

export type AllSubject = CsSubject | MathSubject | string
export type QuizQuestionType = 'choice' | 'blank' | 'analysis'

export interface ActiveQuizQuestion {
  id: string
  domain: ResourceDomain
  subject: AllSubject
  scope?: MathCategory[]
  chapter?: string
  type: QuizQuestionType
  difficulty: '简单' | '中等' | '困难' | '基础' | '提高'
  question: string
  options?: { A: string; B: string; C: string; D: string }
  answer: string
  explanation: string
  steps?: string[]
  keyPoints?: string[]
  tags: string[]
  paperTitle?: string
  paperQuestionNumber?: number
  score?: number
  sectionName?: string
  sourceKind?: 'builtin' | 'real' | 'mock' | 'custom'
  isCustom?: boolean
}

export interface TopicCategoryDef {
  id: string
  title: string
  shortDesc: string
  domain: ResourceDomain
  subjectGroup: string
  emoji: string
  keywords: string[]
  isHot?: boolean
  order: number
}

export interface PopulatedTopicCategory extends TopicCategoryDef {
  questions: ActiveQuizQuestion[]
  totalCount: number
  realCount: number
  mockCount: number
  customCount: number
  builtinCount: number
  hasImported: boolean
}

export function convertCsQuestion(q: QuizQuestion): ActiveQuizQuestion {
  return {
    id: q.id,
    domain: 'cs_408',
    subject: q.subject,
    chapter: q.chapter,
    type: 'choice',
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    tags: q.tags || [],
    sourceKind: 'real',
  }
}

export function convertMathQuestion(q: UnifiedQuestion): ActiveQuizQuestion {
  const optArr = q.options || []
  const cleanOption = (text?: string) => (text ? text.replace(/^[A-D][.、\s]+/, '').trim() : '')

  let optionsObj: { A: string; B: string; C: string; D: string } | undefined
  if (optArr.length >= 2) {
    optionsObj = {
      A: cleanOption(optArr[0]),
      B: cleanOption(optArr[1]),
      C: cleanOption(optArr[2] || ''),
      D: cleanOption(optArr[3] || ''),
    }
  }

  const isMock = q.id.includes('lilin') || (q.tags || []).some(t => t.includes('模拟') || t.includes('六套卷'))
  const isReal = q.id.includes('93') || (q.tags || []).some(t => t.includes('真题'))

  return {
    id: q.id,
    domain: 'math',
    subject: q.subject as MathSubject,
    scope: q.scope,
    chapter: q.chapter,
    type: q.type || (optionsObj ? 'choice' : 'blank'),
    difficulty: q.difficulty,
    question: q.question,
    options: optionsObj,
    answer: q.correctAnswer || 'A',
    explanation: q.explanation,
    steps: q.steps,
    keyPoints: q.keyPoints,
    tags: q.tags || [],
    sourceKind: isMock ? 'mock' : isReal ? 'real' : 'builtin',
  }
}

export function convertExamPaperQuestion(
  q: ExamPaperQuestion,
  paperTitle: string,
  paperType?: 'real' | 'mock'
): ActiveQuizQuestion {
  const optArr = q.options || []
  const cleanOption = (text?: string) => (text ? text.replace(/^[A-D][.、\s]+/, '').trim() : '')

  let optionsObj: { A: string; B: string; C: string; D: string } | undefined
  if (optArr.length >= 2) {
    optionsObj = {
      A: cleanOption(optArr[0]),
      B: cleanOption(optArr[1]),
      C: cleanOption(optArr[2] || ''),
      D: cleanOption(optArr[3] || ''),
    }
  }

  return {
    id: q.id,
    domain: q.domain,
    subject: q.subject,
    scope: q.scope,
    chapter: q.chapter,
    type: q.type || (optionsObj ? 'choice' : 'analysis'),
    difficulty: q.difficulty,
    question: q.question,
    options: optionsObj,
    answer: q.correctAnswer || '见标准分步推导',
    explanation: q.explanation,
    steps: q.steps,
    keyPoints: q.keyPoints,
    tags: q.tags || [],
    paperTitle,
    paperQuestionNumber: q.paperQuestionNumber,
    score: q.score,
    sectionName: q.sectionName,
    sourceKind: paperType === 'mock' ? 'mock' : 'real',
  }
}

/** 生成题干去重指纹，避免真题库与试卷库同一道题重复计入 */
function questionFingerprint(raw: string): string {
  return String(raw || '')
    .replace(/^【[^】]{2,40}】/, '')
    .replace(/（\s*）|\(\s*\)|_{2,}|\\underline\{\\hspace\{[^}]*\}\}/g, '')
    .replace(/[\s,，。；;：:、！？!?.]/g, '')
    .toLowerCase()
    .slice(0, 72)
}

/**
 * 汇总内置 408 / 数学题库 + 历年真题/模拟整卷题 + 用户自定义导入题（按 ID 与题干指纹双重去重）
 */
export function buildUnifiedQuestionPool(customQuestions: ActiveQuizQuestion[]): ActiveQuizQuestion[] {
  const byId = new Map<string, ActiveQuizQuestion>()
  const byStem = new Map<string, string>()

  const upsert = (q: ActiveQuizQuestion, preferOverride = false) => {
    const existingById = byId.get(q.id)
    if (existingById) {
      if (preferOverride) {
        byId.set(q.id, { ...existingById, ...q })
      } else if (!existingById.paperTitle && q.paperTitle) {
        byId.set(q.id, {
          ...existingById,
          paperTitle: q.paperTitle,
          paperQuestionNumber: q.paperQuestionNumber,
          score: q.score,
          sectionName: q.sectionName,
        })
      }
      return
    }

    const fp = questionFingerprint(q.question)
    if (fp.length >= 14 && byStem.has(fp) && !q.isCustom) {
      // 同题已从另一来源进入，补充卷面元信息即可
      const targetId = byStem.get(fp)!
      const target = byId.get(targetId)
      if (target && !target.paperTitle && q.paperTitle) {
        byId.set(targetId, {
          ...target,
          paperTitle: q.paperTitle,
          paperQuestionNumber: q.paperQuestionNumber,
          score: q.score,
          sectionName: q.sectionName,
        })
      }
      return
    }

    byId.set(q.id, q)
    if (fp.length >= 14 && !byStem.has(fp)) {
      byStem.set(fp, q.id)
    }
  }

  for (const q of QUESTION_BANK) {
    upsert(convertCsQuestion(q))
  }
  for (const q of MATH_QUESTION_BANK) {
    upsert(convertMathQuestion(q))
  }
  for (const paper of ALL_EXAM_PAPERS) {
    for (const pq of paper.questions) {
      upsert(convertExamPaperQuestion(pq, paper.title, paper.paperType))
    }
  }
  for (const cq of customQuestions) {
    upsert({ ...cq, sourceKind: 'custom', isCustom: true }, true)
  }

  return Array.from(byId.values())
}

// ── 精细题型专题字典 ─────────────────────────────────────────────────────────────

export const PRESET_TOPIC_DEFS: TopicCategoryDef[] = [
  // 高等数学 8 大核心专项
  {
    id: 'math-calc-limit',
    title: '极限、无穷小与连续间断专项',
    shortDesc: '函数与数列极限、泰勒/洛必达、无穷小阶的比较、间断点与渐近线判定',
    domain: 'math',
    subjectGroup: '高等数学',
    emoji: '∞',
    keywords: ['极限计算', '泰勒展开', '间断点', '渐近线'],
    isHot: true,
    order: 10,
  },
  {
    id: 'math-calc-line-surface',
    title: '线面积分（曲线与曲面积分）专项',
    shortDesc: '两类曲线/曲面积分、格林公式、高斯公式、斯托克斯公式、路径无关与通量旋度',
    domain: 'math',
    subjectGroup: '高等数学',
    emoji: '🌀',
    keywords: ['曲线积分', '曲面积分', '格林/高斯公式', '斯托克斯'],
    isHot: true,
    order: 11,
  },
  {
    id: 'math-calc-single-diff',
    title: '一元导数、中值定理与几何应用专项',
    shortDesc: '导数定义与可导性、高阶导数、罗尔/拉格朗日/柯西中值定理、单调极值与曲率',
    domain: 'math',
    subjectGroup: '高等数学',
    emoji: '📈',
    keywords: ['导数定义', '中值定理', '极值拐点', '不等式证明'],
    order: 12,
  },
  {
    id: 'math-calc-single-int',
    title: '一元积分学与反常积分专项',
    shortDesc: '不定积分/定积分计算技巧、变上限积分、反常积分敛散性、面积与旋转体体积',
    domain: 'math',
    subjectGroup: '高等数学',
    emoji: '∫',
    keywords: ['定积分', '变上限积分', '反常积分', '旋转体体积'],
    order: 13,
  },
  {
    id: 'math-calc-ode',
    title: '常微分方程与欧拉方程专项',
    shortDesc: '可分离变量、一阶线性/伯努利方程、二阶常系数齐次与非齐次特解、欧拉方程',
    domain: 'math',
    subjectGroup: '高等数学',
    emoji: '⚡',
    keywords: ['通解与特解', '特征方程', '欧拉方程', '可降阶'],
    order: 14,
  },
  {
    id: 'math-calc-multi-diff',
    title: '多元函数微分与空间解析几何专项',
    shortDesc: '偏导与全微分、复合/隐函数求导、无条件极值与拉格朗日乘数、切平面法线',
    domain: 'math',
    subjectGroup: '高等数学',
    emoji: '🧊',
    keywords: ['偏导全微分', '条件极值', '空间曲面', '梯度方向导数'],
    order: 15,
  },
  {
    id: 'math-calc-multi-int',
    title: '重积分（二重积分与三重积分）专项',
    shortDesc: '直角/极坐标交换与计算、交换积分次序、区域对称性、柱面球面坐标及物理应用',
    domain: 'math',
    subjectGroup: '高等数学',
    emoji: '∬',
    keywords: ['二重积分', '三重积分', '极坐标换序', '对称性化简'],
    isHot: true,
    order: 16,
  },
  {
    id: 'math-calc-series',
    title: '无穷级数与傅里叶级数专项',
    shortDesc: '正项/交错级数敛散判别、幂级数收敛域与逐项求导积分求和、函数展开与傅里叶级数',
    domain: 'math',
    subjectGroup: '高等数学',
    emoji: '∑',
    keywords: ['级数敛散', '幂级数求和', '收敛半径', '傅里叶展开'],
    order: 17,
  },

  // 线性代数 4 大核心专项
  {
    id: 'math-la-det-matrix',
    title: '行列式与矩阵运算专项',
    shortDesc: '抽象/数值行列式化简、逆矩阵与伴随矩阵、初等矩阵与矩阵的秩核心结论',
    domain: 'math',
    subjectGroup: '线性代数',
    emoji: '▦',
    keywords: ['行列式计算', '伴随与逆', '矩阵的秩', '分块矩阵'],
    order: 20,
  },
  {
    id: 'math-la-vec-eq',
    title: '向量组相关性与线性方程组专项',
    shortDesc: '线性表出与线性无关、极大无关组与向量组等价、通解与基础解系、同解公共解',
    domain: 'math',
    subjectGroup: '线性代数',
    emoji: '🧭',
    keywords: ['线性相关性', '基础解系', '非齐次通解', '同解公共解'],
    isHot: true,
    order: 21,
  },
  {
    id: 'math-la-eigen',
    title: '特征值、特征向量与相似对角化专项',
    shortDesc: '特征值性质与求法、矩阵相似判定、可对角化充要条件、实对称矩阵正交对角化',
    domain: 'math',
    subjectGroup: '线性代数',
    emoji: '🔷',
    keywords: ['特征值', '相似对角化', '实对称矩阵', '施密特正交'],
    isHot: true,
    order: 22,
  },
  {
    id: 'math-la-quadratic',
    title: '二次型与正定矩阵专项',
    shortDesc: '正交变换/配方法化标准形、惯性指数与合同判定、二次型正定性与最值问题',
    domain: 'math',
    subjectGroup: '线性代数',
    emoji: '📐',
    keywords: ['标准形/规范形', '惯性指数', '合同矩阵', '正定判定'],
    order: 23,
  },

  // 概率论与数理统计 3 大核心专项
  {
    id: 'math-prob-dist',
    title: '随机事件与多维随机变量分布专项',
    shortDesc: '条件概率与贝叶斯、常见分布性质、二维联合/边缘/条件分布、随机变量函数分布',
    domain: 'math',
    subjectGroup: '概率论与数理统计',
    emoji: '🎲',
    keywords: ['全概率/贝叶斯', '二维分布', '边缘与条件', '卷积/分布函数'],
    order: 30,
  },
  {
    id: 'math-prob-num',
    title: '数字特征、独立性与大数定律专项',
    shortDesc: '期望、方差、协方差与相关系数计算、独立 vs 不相关、切比雪夫与中心极限定理',
    domain: 'math',
    subjectGroup: '概率论与数理统计',
    emoji: '📊',
    keywords: ['期望与方差', '相关系数', '切比雪夫', '中心极限定理'],
    order: 31,
  },
  {
    id: 'math-prob-stat',
    title: '数理统计与参数估计专项',
    shortDesc: '三大抽样分布 (卡方/t/F)、正态总体统计量性质、矩估计、最大似然估计与置信区间',
    domain: 'math',
    subjectGroup: '概率论与数理统计',
    emoji: '🔬',
    keywords: ['三大抽样分布', '最大似然估计', '矩估计', '无偏性'],
    order: 32,
  },

  // 408 计算机核心 25 大章节知识点专项（严格按考研大纲分模块）
  // ── 1. 数据结构（7大章节） ───────────────────────────────────
  {
    id: 'cs-ds-linear',
    title: '数据结构 · 线性表（顺序表与链表）',
    shortDesc: '顺序表插入删除与地址计算、单链表/双向链表指针变动、循环链表与双向循环链表操作',
    domain: 'cs_408',
    subjectGroup: '数据结构',
    emoji: '🔗',
    keywords: ['顺序表', '单链表', '双向链表', '循环链表', '静态链表', '头结点'],
    isHot: true,
    order: 40,
  },
  {
    id: 'cs-ds-stack-queue',
    title: '数据结构 · 栈、队列与数组矩阵',
    shortDesc: '后进先出出栈序列判定、循环队列判空判满、双端队列、表达式求值与特殊矩阵压缩',
    domain: 'cs_408',
    subjectGroup: '数据结构',
    emoji: '📦',
    keywords: ['出栈序列', '卡特兰数', '循环队列', '栈模拟队列', '矩阵压缩'],
    isHot: true,
    order: 41,
  },
  {
    id: 'cs-ds-string',
    title: '数据结构 · 串与 KMP 模式匹配',
    shortDesc: '字符串基础、KMP 算法模式匹配、next 数组与改进 nextval 数组分步推导',
    domain: 'cs_408',
    subjectGroup: '数据结构',
    emoji: '🔤',
    keywords: ['KMP算法', 'next数组', 'nextval数组', '模式串匹配'],
    order: 42,
  },
  {
    id: 'cs-ds-tree',
    title: '数据结构 · 树与二叉树专项',
    shortDesc: '二叉树五大性质、先中后序及层次遍历还原、线索二叉树、哈夫曼编码与并查集',
    domain: 'cs_408',
    subjectGroup: '数据结构',
    emoji: '🌲',
    keywords: ['二叉树性质', '遍历还原', '线索二叉树', '哈夫曼树', '并查集'],
    isHot: true,
    order: 43,
  },
  {
    id: 'cs-ds-graph',
    title: '数据结构 · 图论与经典算法专项',
    shortDesc: '图的存储结构、BFS/DFS、Prim与Kruskal最小生成树、Dijkstra与Floyd最短路径、AOV拓扑与AOE关键路径',
    domain: 'cs_408',
    subjectGroup: '数据结构',
    emoji: '🕸️',
    keywords: ['邻接矩阵/表', 'BFS/DFS', '最小生成树', 'Dijkstra', '拓扑排序', '关键路径'],
    isHot: true,
    order: 44,
  },
  {
    id: 'cs-ds-search',
    title: '数据结构 · 查找与平衡二叉树',
    shortDesc: '折半查找、二叉排序树(BST)、AVL平衡二叉树旋转、B树/B+树分裂合并、散列冲突处理与ASL',
    domain: 'cs_408',
    subjectGroup: '数据结构',
    emoji: '🔍',
    keywords: ['折半查找', '二叉排序树', 'AVL树', '红黑树', 'B树/B+树', '散列表ASL'],
    isHot: true,
    order: 45,
  },
  {
    id: 'cs-ds-sort',
    title: '数据结构 · 内部与外部排序专项',
    shortDesc: '直接插入/希尔、快排划分与最坏复杂度、堆排调整、二路归并、基数排序及算法稳定性对比',
    domain: 'cs_408',
    subjectGroup: '数据结构',
    emoji: '📶',
    keywords: ['快速排序', '堆排序', '归并排序', '希尔排序', '基数排序', '稳定性'],
    isHot: true,
    order: 46,
  },

  // ── 2. 计算机组成原理（6大章节） ──────────────────────────────
  {
    id: 'cs-co-data',
    title: '组成原理 · 数据的表示与运算专项',
    shortDesc: '数制转换、补码定点数加减与溢出、IEEE 754 浮点数规格化、大小端存储与校验码',
    domain: 'cs_408',
    subjectGroup: '计算机组成原理',
    emoji: '🔢',
    keywords: ['原反补移码', 'IEEE754浮点', '溢出判定', '大小端', '海明码/CRC', 'ALU'],
    order: 50,
  },
  {
    id: 'cs-co-memory',
    title: '组成原理 · 存储系统与主存扩展',
    shortDesc: '主存芯片字/位扩展、DRAM刷新机制、多体交叉编址流水存取与主存带宽计算',
    domain: 'cs_408',
    subjectGroup: '计算机组成原理',
    emoji: '💾',
    keywords: ['SRAM/DRAM', '主存扩展', '多体交叉', '双端口RAM', '存取周期'],
    order: 51,
  },
  {
    id: 'cs-co-cache',
    title: '组成原理 · Cache 映射与虚拟存储',
    shortDesc: 'Cache 地址划分与容量开销、命中率与缺失损失、写回/写直达法、页式虚存与TLB',
    domain: 'cs_408',
    subjectGroup: '计算机组成原理',
    emoji: '⚡',
    keywords: ['直接/全/组相联', 'Cache命中率', '替换算法LRU', '写策略', 'TLB快表'],
    isHot: true,
    order: 52,
  },
  {
    id: 'cs-co-instruction',
    title: '组成原理 · 指令系统与寻址方式',
    shortDesc: '定长与扩展操作码设计、各类寻址方式有效地址计算、指令格式与CISC/RISC',
    domain: 'cs_408',
    subjectGroup: '计算机组成原理',
    emoji: '📜',
    keywords: ['扩展操作码', '寻址方式', '有效地址EA', 'CISC/RISC'],
    order: 53,
  },
  {
    id: 'cs-co-cpu',
    title: '组成原理 · CPU 控制器与指令流水线',
    shortDesc: 'CPU数据通路、微指令格式与编码、指令流水线阶段划分、结构/数据/控制冒险与转发',
    domain: 'cs_408',
    subjectGroup: '计算机组成原理',
    emoji: '⚙️',
    keywords: ['数据通路', '微程序/硬布线', '流水线冒险', '结构/数据/控制冲突'],
    isHot: true,
    order: 54,
  },
  {
    id: 'cs-co-bus-io',
    title: '组成原理 · 总线与输入输出 I/O 系统',
    shortDesc: '总线标准与事务定时、I/O端口编址、中断全流程与屏蔽字设置、DMA周期挪用',
    domain: 'cs_408',
    subjectGroup: '计算机组成原理',
    emoji: '🔌',
    keywords: ['总线仲裁', '统一/独立编址', '中断处理', '中断屏蔽字', 'DMA传输'],
    order: 55,
  },

  // ── 3. 操作系统（7大章节） ───────────────────────────────────
  {
    id: 'cs-os-arch',
    title: '操作系统 · 体系结构与运行机制',
    shortDesc: '用户态/核心态转换、特权指令、系统调用传参机制、内外部中断与异常分类处理',
    domain: 'cs_408',
    subjectGroup: '操作系统',
    emoji: '🏛️',
    keywords: ['内核态与用户态', '特权指令', '系统调用', '中断与异常'],
    order: 60,
  },
  {
    id: 'cs-os-proc-schedule',
    title: '操作系统 · 进程线程与调度算法',
    shortDesc: '进程控制块PCB、进程状态变迁、线程机制、典型调度算法指标与平均周转时间计算',
    domain: 'cs_408',
    subjectGroup: '操作系统',
    emoji: '🏃',
    keywords: ['PCB', '进程状态转换', '内核级/用户级线程', 'FCFS/SJF/RR', '周转时间'],
    order: 61,
  },
  {
    id: 'cs-os-sync-deadlock',
    title: '操作系统 · 进程同步互斥与死锁 (PV)',
    shortDesc: '临界区互斥准则、信号量机制、生产者消费者/读者写者经典模型、银行家算法安全性分析',
    domain: 'cs_408',
    subjectGroup: '操作系统',
    emoji: '🚦',
    keywords: ['信号量PV', '经典同步模型', '死锁必要条件', '银行家算法'],
    isHot: true,
    order: 62,
  },
  {
    id: 'cs-os-mem',
    title: '操作系统 · 内存管理与地址变换',
    shortDesc: '动态分区分配策略、基本分页与分段、多级页表访存次数与物理地址计算、TLB快表',
    domain: 'cs_408',
    subjectGroup: '操作系统',
    emoji: '🧠',
    keywords: ['连续分配', '基本分页/分段', '多级页表', '物理地址换算', '快表TLB'],
    order: 63,
  },
  {
    id: 'cs-os-page-replace',
    title: '操作系统 · 虚拟内存与页面置换',
    shortDesc: '请求分页系统、缺页中断处理流程、OPT/FIFO/LRU/Clock页面置换算法与系统抖动',
    domain: 'cs_408',
    subjectGroup: '操作系统',
    emoji: '🔄',
    keywords: ['请求分页', '缺页异常', '页面置换OPT/LRU/Clock', '抖动与工作集'],
    isHot: true,
    order: 64,
  },
  {
    id: 'cs-os-fs',
    title: '操作系统 · 文件系统与目录组织',
    shortDesc: '文件逻辑与物理结构、目录项与FCB、UNIX inode混合多级索引计算、硬链接与软链接',
    domain: 'cs_408',
    subjectGroup: '操作系统',
    emoji: '📁',
    keywords: ['inode混合索引', 'FCB', '硬链接与软链接', '空闲块管理', '目录项'],
    order: 65,
  },
  {
    id: 'cs-os-io-disk',
    title: '操作系统 · I/O 设备管理与磁盘调度',
    shortDesc: '设备独立性软件、SPOOLing技术、磁盘扇区物理结构、FCFS/SSTF/SCAN/C-SCAN寻道调度',
    domain: 'cs_408',
    subjectGroup: '操作系统',
    emoji: '💽',
    keywords: ['I/O软件层次', 'SPOOLing假脱机', '磁盘寻道', 'SCAN/C-SCAN/SSTF'],
    order: 66,
  },

  // ── 4. 计算机网络（5大章节） ───────────────────────────────────
  {
    id: 'cs-cn-arch-phy',
    title: '计算机网络 · 体系结构与物理层',
    shortDesc: '分层参考模型与PDU、网络性能指标计算、香农公式与奈奎斯特定理、传输介质与编码',
    domain: 'cs_408',
    subjectGroup: '计算机网络',
    emoji: '📡',
    keywords: ['OSI与TCP/IP模型', '时延与带宽时延积', '奈奎斯特/香农公式', '编码与调制'],
    order: 70,
  },
  {
    id: 'cs-cn-link',
    title: '计算机网络 · 数据链路层与局域网',
    shortDesc: '停止等待/GBN/SR滑动窗口协议信道利用率、CSMA/CD最小帧长、MAC帧、交换机自学习',
    domain: 'cs_408',
    subjectGroup: '计算机网络',
    emoji: '🔗',
    keywords: ['滑动窗口GBN/SR', 'CSMA/CD', '争用期与最小帧长', '以太网MAC', '交换机与VLAN'],
    order: 71,
  },
  {
    id: 'cs-cn-net',
    title: '计算机网络 · 网络层与 IP 寻址路由',
    shortDesc: 'IPv4报头与分片、CIDR子网划分与聚合、NAT技术、ARP与ICMP、距离向量与链路状态路由',
    domain: 'cs_408',
    subjectGroup: '计算机网络',
    emoji: '🗺️',
    keywords: ['IPv4头部与分片', 'CIDR子网划分', '超网路由聚合', 'ARP/ICMP', 'RIP/OSPF/BGP'],
    isHot: true,
    order: 72,
  },
  {
    id: 'cs-cn-trans',
    title: '计算机网络 · 传输层与 TCP 可靠传输',
    shortDesc: 'UDP数据报、TCP报文格式与序号计算、连接建立与释放状态机、滑动窗口与四大拥塞控制算法',
    domain: 'cs_408',
    subjectGroup: '计算机网络',
    emoji: '🤝',
    keywords: ['UDP特点', 'TCP三次握手/四次挥手', '序号与确认号', '流量控制', '拥塞控制'],
    isHot: true,
    order: 73,
  },
  {
    id: 'cs-cn-app',
    title: '计算机网络 · 应用层协议与网络安全',
    shortDesc: 'DNS递归与迭代查询、HTTP报文格式/状态码与持久连接、Cookie机制、常见网络协议端口',
    domain: 'cs_408',
    subjectGroup: '计算机网络',
    emoji: '🛰️',
    keywords: ['DNS解析', 'HTTP/HTTPS与状态码', 'FTP/SMTP/DHCP', '对称/非对称加密'],
    order: 74,
  },
]

/**
 * 精准识别一道题属于哪个细粒度专项
 */
export function classifyQuestionTopicId(q: ActiveQuizQuestion): string | null {
  const ch = (q.chapter || '').trim()
  const tagsAndPoints = [...(q.tags || []), ...(q.keyPoints || [])].join(' ')
  const stem = q.question || ''
  const primaryText = `${ch} ${tagsAndPoints} ${stem}`
  const fallbackText = `${primaryText} ${(q.explanation || '').slice(0, 120)}`

  // ── 1. 考研数学 ───────────────────────────────────────────────
  if (q.domain === 'math' || ['高等数学', '线性代数', '概率论与数理统计'].includes(q.subject)) {
    const sub = q.subject || ''

    // 1A. 线性代数
    if (
      sub === '线性代数' ||
      /行列式|伴随矩阵|线性相关|线性无关|基础解系|特征值|特征向量|相似对角|实对称|二次型|正定|惯性指数|施密特/.test(
        `${ch} ${tagsAndPoints}`
      )
    ) {
      if (/二次型|惯性指数|正定|标准形|规范形|合同/.test(primaryText)) {
        return 'math-la-quadratic'
      }
      if (/特征值|特征向量|相似|对角化|实对称|正交矩阵|正交变换(?!化标准形)/.test(primaryText)) {
        return 'math-la-eigen'
      }
      if (/方程组|线性相关|线性无关|线性表示|线性表出|极大无关|基础解系|齐次|非齐次|同解|公共解|Ax\s*=\s*0|Ax\s*=\s*b/i.test(primaryText)) {
        return 'math-la-vec-eq'
      }
      return 'math-la-det-matrix'
    }

    // 1B. 概率论与数理统计
    if (
      sub === '概率论与数理统计' ||
      /随机变量|期望|方差|协方差|卡方|最大似然|矩估计|中心极限定理|大数定律|抽样分布/.test(`${ch} ${tagsAndPoints}`)
    ) {
      if (/统计|抽样分布|卡方|\\chi\^2|t分布|F分布|矩估计|最大似然|似然估计|无偏|置信区间|假设检验/.test(primaryText)) {
        return 'math-prob-stat'
      }
      if (/数字特征|期望|方差|协方差|相关系数|不相关|切比雪夫|大数定律|中心极限定理|E\(|D\(|Cov/.test(primaryText)) {
        return 'math-prob-num'
      }
      return 'math-prob-dist'
    }

    // 1C. 高等数学（先看强特征知识点，再回退章节）
    // ① 优先识别【线面积分】（防止被笼统的“多元函数积分学”吞掉）
    if (
      /曲线积分|曲面积分|线面积分|第一类曲线|第二类曲线|第一类曲面|第二类曲面|对弧长|对坐标|格林公式|高斯公式|斯托克斯|stokes|路径无关|通量|散度|旋度|环量|\\oint|\\iint_\\Sigma|\\iint_S|dydz|dzdx|dx\s*dy.*dy\s*dz/i.test(
        primaryText
      ) ||
      /曲线积分|曲面积分|线面积分|格林|高斯|斯托克斯/.test(fallbackText)
    ) {
      return 'math-calc-line-surface'
    }

    // ② 常微分方程（含误归在多元函数积分下的微分方程题）
    if (
      /微分方程/.test(ch) ||
      /微分方程|通解|特解|特征方程|欧拉方程|伯努利|可分离变量|齐次线性|非齐次线性|差分方程/.test(primaryText) ||
      (/y''|y'''|\\frac\{d\^2y\}|y\s*y''/.test(stem) && !/切平面|法线|曲率|极值|拐点/.test(stem))
    ) {
      return 'math-calc-ode'
    }

    // ③ 无穷级数
    if (
      /级数/.test(ch) ||
      /级数|收敛域|收敛半径|阿贝尔|莱布尼茨|比值判别|根值判别|傅里叶|幂级数|交错级数|\\sum_\{?[nk]=/.test(primaryText)
    ) {
      return 'math-calc-series'
    }

    // ④ 重积分（二重积分 / 三重积分）
    if (
      /重积分|二重积分|三重积分|多元函数积分/.test(ch) ||
      /二重积分|三重积分|重积分|极坐标积分|换序|交换积分次序|柱面坐标|球面坐标|形心|质心|转动惯量|\\iiint|\\iint(?![_\\]?[\\SigmaS])/.test(
        primaryText
      )
    ) {
      return 'math-calc-multi-int'
    }

    // ⑤ 多元函数微分学与空间解析几何
    if (
      /多元函数微分|空间解析几何|向量代数/.test(ch) ||
      /偏导|全微分|方向导数|梯度|隐函数求导|条件极值|拉格朗日乘数|切平面|法线|旋转曲面|投影柱面|二元函数|\\frac\{\\partial/.test(
        primaryText
      )
    ) {
      return 'math-calc-multi-diff'
    }

    // ⑥ 极限、无穷小与连续间断（chapter 明确是极限/连续或核心关键词匹配，但尊重明确标为“导数与微分”/“一元积分”的 chapter）
    const isExplicitLimitChapter = /极限|函数与连续|连续与间断/.test(ch)
    const tagStr = (q.tags || []).join(' ')
    const hasExplicitLimitTag = /极限|间断点|无穷小|无穷大|渐近线|连续性/.test(`${ch} ${tagStr}`)
    const isExplicitDerivOrIntChapter = /导数|微分中值|一元函数微分|一元函数积分|定积分|不定积分/.test(ch)

    if (
      isExplicitLimitChapter ||
      hasExplicitLimitTag ||
      (!isExplicitDerivOrIntChapter && /极限|无穷小|无穷大|间断点|渐近线|洛必达|泰勒|夹逼|单调有界|\\lim_/.test(primaryText))
    ) {
      return 'math-calc-limit'
    }

    // ⑦ 一元函数积分学与反常积分（若 chapter 已明确标为导数/中值定理且无强积分专题特征，则尊重 chapter）
    const isExplicitSingleDiffChapter = /导数|微分中值|一元函数微分/.test(ch)
    if (
      /一元函数积分|定积分|不定积分|反常积分/.test(ch) ||
      /定积分|不定积分|反常积分|广义积分|旋转体体积|平面图形面积|弧长/.test(
        primaryText
      ) ||
      (!isExplicitSingleDiffChapter && (/变上限积分|分部积分|换元积分/.test(primaryText) || /\\int[_^]/.test(stem)))
    ) {
      return 'math-calc-single-int'
    }

    // ⑧ 一元导数、微分中值定理与几何应用
    if (
      isExplicitSingleDiffChapter ||
      /导数|可导|高阶导数|罗尔|拉格朗日|柯西|中值定理|极大值|极小值|拐点|凹凸|曲率|渐近|单调/.test(primaryText)
    ) {
      return 'math-calc-single-diff'
    }

    // 高等数学未细分兜底：若能识别 `\lim` 归极限，否则归导数或动态生成
    if (/\\lim/.test(fallbackText)) return 'math-calc-limit'
    if (sub === '高等数学') return 'math-calc-single-diff'
  }

  // ── 2. 408 计算机综合（细分 25 大考纲章节知识点专项） ─────────────────
  if (q.domain === 'cs_408' || ['数据结构', '计算机组成原理', '操作系统', '计算机网络'].includes(q.subject)) {
    const sub = q.subject
    const text = (primaryText + ' ' + (q.explanation || '').slice(0, 80)).toLowerCase()

    // 2A. 数据结构
    if (sub === '数据结构' || /数据结构|二叉树|kmp|排序|散列表|栈|队列|链表|dijkstra|prim|kruskal|avl/i.test(`${ch} ${tagsAndPoints}`)) {
      // ① 图论与经典算法
      if (/图|邻接|拓扑|关键路径|aoe|aov|dijkstra|floyd|prim|kruskal|生成树|连通|无向图|有向图|完全图|度数|路径长度/.test(text)) {
        return 'cs-ds-graph'
      }
      // ② 内部与外部排序算法
      if (/排序|快排|快速排序|堆排|堆排序|大顶堆|小顶堆|希尔|归并|二路归并|冒泡|基数排序|外部排序|稳定性|最坏情况.*时间复杂度/.test(text)) {
        return 'cs-ds-sort'
      }
      // ③ 查找与散列表
      if (/查找|折半|二分|asl|平均查找长度|二叉排序树|bst|avl|平衡二叉树|红黑树|b树|b\+树|散列|哈希|装填因子|冲突/.test(text)) {
        return 'cs-ds-search'
      }
      // ④ 树与二叉树
      if (/树|二叉树|满二叉树|完全二叉树|线索|后序|先序|前序|中序|层次遍历|哈夫曼|wpl|带权路径|并查集|森林/.test(text)) {
        return 'cs-ds-tree'
      }
      // ⑤ 串与 KMP 模式匹配
      if (/kmp|next数组|nextval|模式串|字符串匹配|模式匹配|子串/.test(text)) {
        return 'cs-ds-string'
      }
      // ⑥ 栈、队列与数组矩阵
      if (/栈|队列|循环队列|出栈|入栈|卡特兰|后缀表达式|前缀表达式|中缀|表达式求值|递归|斐波那契|对称矩阵|稀疏矩阵|双端队列/.test(text)) {
        return 'cs-ds-stack-queue'
      }
      // ⑦ 线性表（顺序表与链表）
      return 'cs-ds-linear'
    }

    // 2B. 计算机组成原理
    if (sub === '计算机组成原理' || /组成原理|计组|cache|ieee|补码|流水线|risc|dma|总线|寻址/i.test(`${ch} ${tagsAndPoints}`)) {
      // ① Cache 映射与虚拟存储
      if (/cache|高速缓存|命中率|组相联|直接映射|全相联|写回|写直达|脏位|有效位|替换算法|lru|缺失损失/.test(text)) {
        return 'cs-co-cache'
      }
      // ② 存储系统与主存扩展
      if (/主存|存储器|sram|dram|多体交叉|芯片扩展|位扩展|字扩展|刷新|带宽|存取周期|双端口/.test(text)) {
        return 'cs-co-memory'
      }
      // ③ 数据的表示与运算
      if (/ieee|浮点|补码|原码|反码|移码|溢出|大端|小端|海明|crc|校验|alu|加法器|乘法|除法|数制|定点|规格化/.test(text)) {
        return 'cs-co-data'
      }
      // ④ 指令系统与寻址方式
      if (/指令|寻址|操作码|risc|cisc|操作数|有效地址|ea\b|扩展操作码/.test(text)) {
        return 'cs-co-instruction'
      }
      // ⑤ 总线与输入输出 I/O 系统
      if (/总线|仲裁|中断|dma|i\/o|接口|通道|统一编址|独立编址|周期挪用|屏蔽字/.test(text)) {
        return 'cs-co-bus-io'
      }
      // ⑥ CPU 控制器与指令流水线
      return 'cs-co-cpu'
    }

    // 2C. 操作系统
    if (sub === '操作系统' || /操作系统|进程|信号量|pv操作|死锁|页面置换|inode|磁盘|分页/i.test(`${ch} ${tagsAndPoints}`)) {
      // ① 虚拟内存与页面置换
      if (/虚拟内存|置换|缺页|page|lru|clock|opt|fifo|抖动|工作集|请求分页/.test(text)) {
        return 'cs-os-page-replace'
      }
      // ② 内存管理与地址变换
      if (/分页|分段|段页式|页表|多级页表|tlb|物理地址|逻辑地址|内存分配|动态分区/.test(text)) {
        return 'cs-os-mem'
      }
      // ③ 进程同步互斥与死锁 (PV)
      if (/pv|信号量|互斥|同步|临界区|死锁|银行家|管程|哲学家|生产者|读者/.test(text)) {
        return 'cs-os-sync-deadlock'
      }
      // ④ 文件系统与目录组织
      if (/文件|inode|fcb|目录|硬链接|软链接|索引|成组链接|空闲块/.test(text)) {
        return 'cs-os-fs'
      }
      // ⑤ I/O 设备管理与磁盘调度
      if (/磁盘|磁道|寻道|scan|c-scan|sstf|spooling|设备|缓冲区|i\/o调度/.test(text)) {
        return 'cs-os-io-disk'
      }
      // ⑥ 进程线程与调度算法
      if (/调度|周转时间|fcfs|sjf|rr|优先级|进程状态|pcb|线程|用户级线程/.test(text)) {
        return 'cs-os-proc-schedule'
      }
      // ⑦ 体系结构与运行机制
      return 'cs-os-arch'
    }

    // 2D. 计算机网络
    if (sub === '计算机网络' || /计算机网络|tcp|udp|ipv4|cidr|csma|路由|dns|http|滑动窗口/i.test(`${ch} ${tagsAndPoints}`)) {
      // ① 应用层协议与网络安全
      if (/dns|http|https|smtp|pop3|ftp|dhcp|应用层|url|cookie|加密|非对称|对称加密/.test(text)) {
        return 'cs-cn-app'
      }
      // ② 传输层与 TCP 可靠传输
      if (/tcp|udp|三次握手|四次挥手|拥塞控制|慢开始|拥塞避免|快重传|快恢复|滑动窗口|流量控制|序号|确认号/.test(text)) {
        return 'cs-cn-trans'
      }
      // ③ 网络层与 IP 寻址路由
      if (/ip|ipv4|ipv6|cidr|子网|超网|路由|rip|ospf|bgp|arp|icmp|nat|路由器|转发表/.test(text)) {
        return 'cs-cn-net'
      }
      // ④ 数据链路层与局域网
      if (/链路|以太网|csma|mac|交换机|vlan|帧|gbn|sr|差错|crc|停止等待/.test(text)) {
        return 'cs-cn-link'
      }
      // ⑤ 体系结构与物理层
      return 'cs-cn-arch-phy'
    }
  }

  return null
}

/**
 * 构建所有「题型归纳专项」，兼容内置真题/模拟题与用户导入题（保证一道不漏）
 */
export function buildPopulatedTopicCategories(
  pool: ActiveQuizQuestion[],
  mathCategory: MathCategory | 'all' = 'all'
): PopulatedTopicCategory[] {
  const buckets = new Map<string, ActiveQuizQuestion[]>()
  const dynamicDefs = new Map<string, TopicCategoryDef>()

  const filteredPool = pool.filter(q => {
    if (q.domain === 'math' && mathCategory !== 'all') {
      if (q.scope && !q.scope.includes(mathCategory)) return false
    }
    return true
  })

  for (const q of filteredPool) {
    let topicId = classifyQuestionTopicId(q)
    if (!topicId) {
      const subName = (q.subject || '综合专业课').trim()
      const chName = (q.chapter || '综合练习').trim()
      topicId = `custom-${q.domain || 'general'}-${subName}-${chName}`
      if (!dynamicDefs.has(topicId)) {
        const emoji =
          q.domain === 'english' ? '📖' :
          q.domain === 'politics' ? '🏛️' :
          q.domain === 'math' ? '📐' :
          q.domain === 'cs_408' ? '🖥️' : '📚'
        dynamicDefs.set(topicId, {
          id: topicId,
          title: chName && chName !== subName ? `${subName} · ${chName}专项` : `${subName}专项`,
          shortDesc: `汇总「${subName} / ${chName}」方向全部导入与归档习题`,
          domain: q.domain || 'general',
          subjectGroup: subName,
          emoji,
          keywords: Array.from(new Set([subName, chName, ...(q.tags || []).slice(0, 2)])).slice(0, 4),
          order: 200,
        })
      }
    }

    const list = buckets.get(topicId) || []
    list.push(q)
    buckets.set(topicId, list)
  }

  const allDefs: TopicCategoryDef[] = [...PRESET_TOPIC_DEFS, ...Array.from(dynamicDefs.values())]
  const result: PopulatedTopicCategory[] = []

  for (const def of allDefs) {
    const qs = buckets.get(def.id) || []
    if (qs.length === 0) continue

    let realCount = 0
    let mockCount = 0
    let customCount = 0
    let builtinCount = 0

    for (const q of qs) {
      if (q.isCustom || q.sourceKind === 'custom') customCount++
      else if (q.sourceKind === 'real') realCount++
      else if (q.sourceKind === 'mock') mockCount++
      else builtinCount++
    }

    result.push({
      ...def,
      questions: qs,
      totalCount: qs.length,
      realCount,
      mockCount,
      customCount,
      builtinCount,
      hasImported: customCount > 0,
    })
  }

  return result.sort((a, b) => a.order - b.order || b.totalCount - a.totalCount)
}

// ── 408 章节知识点模块定义与辅助选择器 ──────────────────────────────

export interface CsChapterModuleItem {
  id: string
  subject: CsSubject
  title: string
  shortTitle: string
  emoji: string
  keywords: string[]
  isHot?: boolean
  order: number
}

export const CS_CHAPTER_MODULES: CsChapterModuleItem[] = [
  // 数据结构
  { id: 'cs-ds-linear', subject: '数据结构', title: '数据结构 · 线性表（顺序表与链表）', shortTitle: '线性表', emoji: '🔗', keywords: ['顺序表', '单链表', '双向链表', '循环链表'], isHot: true, order: 40 },
  { id: 'cs-ds-stack-queue', subject: '数据结构', title: '数据结构 · 栈、队列与数组矩阵', shortTitle: '栈与队列', emoji: '📦', keywords: ['出栈序列', '循环队列', '栈模拟队列', '矩阵压缩'], isHot: true, order: 41 },
  { id: 'cs-ds-string', subject: '数据结构', title: '数据结构 · 串与 KMP 模式匹配', shortTitle: '串与KMP', emoji: '🔤', keywords: ['KMP算法', 'next数组', '模式串匹配'], order: 42 },
  { id: 'cs-ds-tree', subject: '数据结构', title: '数据结构 · 树与二叉树专项', shortTitle: '树与二叉树', emoji: '🌲', keywords: ['二叉树遍历', '线索树', '哈夫曼树', '并查集'], isHot: true, order: 43 },
  { id: 'cs-ds-graph', subject: '数据结构', title: '数据结构 · 图论与经典算法专项', shortTitle: '图论算法', emoji: '🕸️', keywords: ['邻接表/矩阵', '最小生成树', 'Dijkstra', '拓扑排序'], isHot: true, order: 44 },
  { id: 'cs-ds-search', subject: '数据结构', title: '数据结构 · 查找与平衡二叉树', shortTitle: '查找算法', emoji: '🔍', keywords: ['折半查找', '二叉排序树', 'AVL树', '散列ASL'], isHot: true, order: 45 },
  { id: 'cs-ds-sort', subject: '数据结构', title: '数据结构 · 内部与外部排序专项', shortTitle: '排序算法', emoji: '📶', keywords: ['快速排序', '堆排序', '归并排序', '稳定性'], isHot: true, order: 46 },

  // 计算机组成原理
  { id: 'cs-co-data', subject: '计算机组成原理', title: '组成原理 · 数据的表示与运算专项', shortTitle: '数据表示与运算', emoji: '🔢', keywords: ['原反补移码', 'IEEE754浮点', '溢出判定', '校验码'], order: 50 },
  { id: 'cs-co-memory', subject: '计算机组成原理', title: '组成原理 · 存储系统与主存扩展', shortTitle: '存储系统与主存', emoji: '💾', keywords: ['主存芯片扩展', 'DRAM刷新', '多体交叉'], order: 51 },
  { id: 'cs-co-cache', subject: '计算机组成原理', title: '组成原理 · Cache 映射与虚拟存储', shortTitle: 'Cache与虚存', emoji: '⚡', keywords: ['组相联/全相联', 'Cache命中率', '替换LRU', 'TLB快表'], isHot: true, order: 52 },
  { id: 'cs-co-instruction', subject: '计算机组成原理', title: '组成原理 · 指令系统与寻址方式', shortTitle: '指令系统', emoji: '📜', keywords: ['寻址方式', '扩展操作码', 'CISC/RISC'], order: 53 },
  { id: 'cs-co-cpu', subject: '计算机组成原理', title: '组成原理 · CPU 控制器与指令流水线', shortTitle: 'CPU与流水线', emoji: '⚙️', keywords: ['数据通路', '微程序/硬布线', '流水线冲突冒险'], isHot: true, order: 54 },
  { id: 'cs-co-bus-io', subject: '计算机组成原理', title: '组成原理 · 总线与输入输出 I/O 系统', shortTitle: '总线与I/O', emoji: '🔌', keywords: ['总线仲裁', '统一/独立编址', '中断', 'DMA'], order: 55 },

  // 操作系统
  { id: 'cs-os-arch', subject: '操作系统', title: '操作系统 · 体系结构与运行机制', shortTitle: '体系结构', emoji: '🏛️', keywords: ['内核态与用户态', '特权指令', '系统调用', '中断异常'], order: 60 },
  { id: 'cs-os-proc-schedule', subject: '操作系统', title: '操作系统 · 进程线程与调度算法', shortTitle: '进程与调度', emoji: '🏃', keywords: ['PCB', '进程状态', 'FCFS/SJF/RR', '平均周转时间'], order: 61 },
  { id: 'cs-os-sync-deadlock', subject: '操作系统', title: '操作系统 · 进程同步互斥与死锁 (PV)', shortTitle: '同步互斥与死锁', emoji: '🚦', keywords: ['信号量PV', '经典同步模型', '银行家算法'], isHot: true, order: 62 },
  { id: 'cs-os-mem', subject: '操作系统', title: '操作系统 · 内存管理与地址变换', shortTitle: '内存管理', emoji: '🧠', keywords: ['基本分页/分段', '多级页表', '物理地址换算', '快表TLB'], order: 63 },
  { id: 'cs-os-page-replace', subject: '操作系统', title: '操作系统 · 虚拟内存与页面置换', shortTitle: '虚拟内存置换', emoji: '🔄', keywords: ['请求分页', '缺页异常', 'OPT/LRU/Clock置换'], isHot: true, order: 64 },
  { id: 'cs-os-fs', subject: '操作系统', title: '操作系统 · 文件系统与目录组织', shortTitle: '文件系统', emoji: '📁', keywords: ['inode混合索引', 'FCB', '硬链接与软链接', '空闲块'], order: 65 },
  { id: 'cs-os-io-disk', subject: '操作系统', title: '操作系统 · I/O 设备管理与磁盘调度', shortTitle: 'I/O与磁盘管理', emoji: '💽', keywords: ['SPOOLing', '磁盘扇区', 'SCAN/C-SCAN寻道调度'], order: 66 },

  // 计算机网络
  { id: 'cs-cn-arch-phy', subject: '计算机网络', title: '计算机网络 · 体系结构与物理层', shortTitle: '体系结构与物理层', emoji: '📡', keywords: ['OSI/TCP-IP模型', '奈奎斯特/香农公式', '时延计算'], order: 70 },
  { id: 'cs-cn-link', subject: '计算机网络', title: '计算机网络 · 数据链路层与局域网', shortTitle: '数据链路层', emoji: '🔗', keywords: ['滑动窗口GBN/SR', 'CSMA/CD最小帧长', '交换机与VLAN'], order: 71 },
  { id: 'cs-cn-net', subject: '计算机网络', title: '计算机网络 · 网络层与 IP 寻址路由', shortTitle: '网络层与IP', emoji: '🗺️', keywords: ['IPv4与分片', 'CIDR子网划分', '超网聚合', 'RIP/OSPF/BGP'], isHot: true, order: 72 },
  { id: 'cs-cn-trans', subject: '计算机网络', title: '计算机网络 · 传输层与 TCP 可靠传输', shortTitle: '传输层与TCP', emoji: '🤝', keywords: ['UDP特点', 'TCP三次握手', '拥塞控制四大算法'], isHot: true, order: 73 },
  { id: 'cs-cn-app', subject: '计算机网络', title: '计算机网络 · 应用层协议与网络安全', shortTitle: '应用层与安全', emoji: '🛰️', keywords: ['DNS解析', 'HTTP/HTTPS与状态码', 'FTP/DHCP', '对称加密'], order: 74 },
]

export function getCsChapterModules(subject?: CsSubject | string): CsChapterModuleItem[] {
  if (!subject || subject === 'all') return CS_CHAPTER_MODULES
  return CS_CHAPTER_MODULES.filter(m => m.subject === subject)
}
