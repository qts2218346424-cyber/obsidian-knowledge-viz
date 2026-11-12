import type { SubjectInfo } from './types'

export const ALL_SUBJECTS: SubjectInfo[] = [
  // 408 科目
  { key: '数据结构', domain: 'cs_408', emoji: '🧮', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  { key: '计算机组成原理', domain: 'cs_408', emoji: '🖥️', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  { key: '操作系统', domain: 'cs_408', emoji: '⚙️', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  { key: '计算机网络', domain: 'cs_408', emoji: '🌐', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
  // 考研数学科目
  { key: '高等数学', domain: 'math', emoji: '📐', color: 'text-pink-600', bgColor: 'bg-pink-50 border-pink-200', categories: ['数一', '数二', '数三'] },
  { key: '线性代数', domain: 'math', emoji: '🔢', color: 'text-indigo-600', bgColor: 'bg-indigo-50 border-indigo-200', categories: ['数一', '数二', '数三'] },
  { key: '概率论与数理统计', domain: 'math', emoji: '🎲', color: 'text-teal-600', bgColor: 'bg-teal-50 border-teal-200', categories: ['数一', '数三'] },
  // 其他专业课 / 综合
  { key: '专业课综合', domain: 'general', emoji: '📚', color: 'text-slate-700', bgColor: 'bg-slate-50 border-slate-200' },
  { key: '复试面试', domain: 'general', emoji: '🎤', color: 'text-slate-700', bgColor: 'bg-slate-50 border-slate-200' },
  { key: '其他通用', domain: 'general', emoji: '🗂️', color: 'text-slate-700', bgColor: 'bg-slate-50 border-slate-200' },
]

export const ERROR_REASONS = ['概念不清', '公式记错', '计算失误', '忽略定理前提', '思路阻塞', '审题遗漏']

export const SCRATCHPAD_MATH_SYMBOLS = [
  { label: '∫ dx', code: '\\int_{a}^{b} f(x)\\,dx' },
  { label: 'lim', code: '\\lim_{x \\to 0}' },
  { label: '∑', code: '\\sum_{i=1}^{n}' },
  { label: '√x', code: '\\sqrt{x}' },
  { label: 'a/b', code: '\\frac{a}{b}' },
  { label: '∂f/∂x', code: '\\frac{\\partial f}{\\partial x}' },
  { label: 'A⁻¹', code: 'A^{-1}' },
  { label: 'λ', code: '\\lambda' },
  { label: '±', code: '\\pm' },
  { label: '∞', code: '\\infty' },
]
