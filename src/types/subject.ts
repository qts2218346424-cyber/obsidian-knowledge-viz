/**
 * 考研统一学科与题库数据模型
 * 支持：
 * 1. 408 计算机综合（数据结构、计组、操作系统、计网）
 * 2. 考研数学（高等数学、线性代数、概率论与数理统计） - 适配数一、数二、数三
 */

// 主学科领域
export type SubjectDomain = 'cs_408' | 'math'

// 408 专业课科目
export type CsSubject = '数据结构' | '计算机组成原理' | '操作系统' | '计算机网络'

// 考研数学科目
export type MathSubject = '高等数学' | '线性代数' | '概率论与数理统计'

// 考研数学卷种分类
export type MathCategory = '数一' | '数二' | '数三'

// 题型分类：单选、填空、解答证明
export type QuestionType = 'choice' | 'blank' | 'analysis'

// 难度等级
export type QuestionDifficulty = '简单' | '中等' | '困难'

// 错因分类标签（尤其针对数学与专业课的复盘）
export type ErrorReason = 
  | '概念不清'     // 概念/定义模糊
  | '公式记错'     // 定理、展开式记忆偏差
  | '计算失误'     // 符号、化简、算术算错
  | '定理条件不符' // 忽视了定理适用的前提条件（如可导、非负等）
  | '思路阻塞'     // 缺少技巧（如构造辅助函数、特征方程代换）
  | '审题遗漏'     // 遗漏关键约束

// 统一题目结构
export interface UnifiedQuestion {
  id: string
  domain: SubjectDomain
  subject: MathSubject | CsSubject
  /** 考研数学卷种适用范围（仅数学科目有效） */
  scope?: MathCategory[]
  /** 所属章节/知识点（例如 "极限计算", "矩阵对角化", "虚拟内存"） */
  chapter?: string
  type: QuestionType
  /** 题目内容（支持 Markdown 与 LaTeX 公式） */
  question: string
  /** 选择题选项（A/B/C/D） */
  options?: string[]
  /** 正确答案或解答关键结论 */
  correctAnswer: string
  /** 详细解析（支持 LaTeX） */
  explanation: string
  /** 分步推导步骤（数学解答题核心） */
  steps?: string[]
  /** 核心考点与关联定理（如 "洛必达法则", "施密特正交化"） */
  keyPoints?: string[]
  difficulty: QuestionDifficulty
  tags: string[]
  /** 关联的 Vault 本地笔记路径 */
  sourceNote?: string
}

// 统一学科元数据配置
export interface SubjectMeta {
  domain: SubjectDomain
  name: string
  shortName: string
  color: string
  icon: string
  description: string
  categories?: MathCategory[]
}

export const SUBJECT_METAS: Record<CsSubject | MathSubject, SubjectMeta> = {
  // 408 科目
  '数据结构': {
    domain: 'cs_408',
    name: '数据结构',
    shortName: 'DS',
    color: '#3b82f6',
    icon: 'Binary',
    description: '线性表、树、图、查找与排序算法',
  },
  '计算机组成原理': {
    domain: 'cs_408',
    name: '计算机组成原理',
    shortName: 'CO',
    color: '#10b981',
    icon: 'Cpu',
    description: '数据的表示、指令系统、CPU、存储体系、总线与IO',
  },
  '操作系统': {
    domain: 'cs_408',
    name: '操作系统',
    shortName: 'OS',
    color: '#8b5cf6',
    icon: 'Terminal',
    description: '进程管理、内存管理、文件系统、设备管理',
  },
  '计算机网络': {
    domain: 'cs_408',
    name: '计算机网络',
    shortName: 'CN',
    color: '#f59e0b',
    icon: 'Network',
    description: '物理层、数据链路层、网络层、传输层、应用层',
  },
  // 考研数学科目
  '高等数学': {
    domain: 'math',
    name: '高等数学 (微积分)',
    shortName: '高数',
    color: '#ec4899',
    icon: 'Sigma',
    description: '极限与连续、一元微分学、一元积分学、多元微积分、常微分方程、级数',
    categories: ['数一', '数二', '数三'],
  },
  '线性代数': {
    domain: 'math',
    name: '线性代数',
    shortName: '线代',
    color: '#6366f1',
    icon: 'Grid',
    description: '行列式、矩阵运算、向量组线性相关性、线性方程组、特征值与特征向量、二次型',
    categories: ['数一', '数二', '数三'],
  },
  '概率论与数理统计': {
    domain: 'math',
    name: '概率论与数理统计',
    shortName: '概率',
    color: '#14b8a6',
    icon: 'Dice5',
    description: '随机事件与概率、一维及二维随机变量、数字特征、大数定律与中心极限定理、参数估计',
    categories: ['数一', '数三'],
  },
}
