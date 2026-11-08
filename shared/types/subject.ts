/**
 * 考研科目与大纲体系枚举
 */
export type CoreSubject =
  | 'data-structure'
  | 'operating-system'
  | 'computer-organization'
  | 'computer-network'
  | 'math-1'
  | 'math-2'
  | 'math-3'
  | 'politics'
  | 'english'

export interface SubjectConfig {
  id: CoreSubject
  name: string
  shortName: string
  category: '408' | 'math' | 'general'
  color: string
}

export const SUBJECT_CONFIGS: Record<CoreSubject, SubjectConfig> = {
  'data-structure': { id: 'data-structure', name: '数据结构', shortName: 'DS', category: '408', color: '#38BDF8' },
  'computer-organization': { id: 'computer-organization', name: '计算机组成原理', shortName: 'CO', category: '408', color: '#818CF8' },
  'operating-system': { id: 'operating-system', name: '操作系统', shortName: 'OS', category: '408', color: '#34D399' },
  'computer-network': { id: 'computer-network', name: '计算机网络', shortName: 'CN', category: '408', color: '#F472B6' },
  'math-1': { id: 'math-1', name: '考研数学一', shortName: '数一', category: 'math', color: '#F59E0B' },
  'math-2': { id: 'math-2', name: '考研数学二', shortName: '数二', category: 'math', color: '#FB923C' },
  'math-3': { id: 'math-3', name: '考研数学三', shortName: '数三', category: 'math', color: '#FBBF24' },
  'politics': { id: 'politics', name: '思想政治理论', shortName: '政治', category: 'general', color: '#EF4444' },
  'english': { id: 'english', name: '考研英语', shortName: '英语', category: 'general', color: '#A855F7' },
}
