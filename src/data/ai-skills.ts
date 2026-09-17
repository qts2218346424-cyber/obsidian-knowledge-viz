export interface AISkill {
  id: string
  name: string
  description: string
  icon: string
  color: string
  instruction: string
}

export const AI_SKILLS: AISkill[] = [
  {
    id: 'knowledge',
    name: '知识库问答',
    description: '基于 Vault 内容回答，并优先引用已有笔记。',
    icon: '⌘',
    color: 'bg-accent-orange/15 text-accent-orange',
    instruction: '优先搜索和引用当前知识库中的笔记；信息不足时明确说明，不要编造来源。',
  },
  {
    id: 'organize',
    name: '笔记整理',
    description: '分析结构、标签、链接和重复内容。',
    icon: '✦',
    color: 'bg-accent-sage/15 text-accent-sage',
    instruction: '关注笔记结构、标题、标签、双向链接和重复内容，给出可以直接执行的整理步骤。',
  },
  {
    id: 'study',
    name: '学习教练',
    description: '把知识库内容变成复习计划和练习。',
    icon: '◎',
    color: 'bg-blue-500/10 text-blue-600',
    instruction: '把回答转化为明确的学习目标、复习顺序、主动回忆问题和下一步行动。',
  },
  {
    id: 'research',
    name: '研究助手',
    description: '拆解主题、寻找知识缺口和研究路径。',
    icon: '◌',
    color: 'bg-purple-500/10 text-purple-600',
    instruction: '先拆解主题，再识别已有知识、缺口、关键概念和建议的研究顺序。',
  },
  {
    id: 'writing',
    name: '写作助手',
    description: '帮助提纲、改写、总结和生成 Markdown。',
    icon: '↗',
    color: 'bg-rose-500/10 text-rose-600',
    instruction: '输出清晰、可复制到 Markdown 笔记中的内容；需要改写时保留原意并改善结构。',
  },
  {
    id: 'math-step-solver',
    name: '数学严谨推导',
    description: '高数/线代/概率分步规范书写，严格标注定理前提与化简依据。',
    icon: '∑',
    color: 'bg-emerald-500/10 text-emerald-600',
    instruction: '针对考研数学问题进行严谨的分步推导：所有数学公式必须使用标准 LaTeX 格式（行内 $...$，独立行 $$...$$）；严格标明所用定理与成立前提（如中值定理的连续与可导区间要求、极值充分必要条件、矩阵初等变换类型）；严禁跳跃关键计算步骤。',
  },
  {
    id: 'math-counterexample',
    name: '反例构造与辨析',
    description: '针对概念真伪、定理逆命题、可微可导连续性、矩阵性质构造反例。',
    icon: '∄',
    color: 'bg-indigo-500/10 text-indigo-600',
    instruction: '侧重考研数学概念辨析与反例构造。遇到错误命题或容易混淆的猜想时：1. 明确给出真伪判定；2. 构造简洁经典的初等反例（标明定义域、对应函数式或具体矩阵数值）；3. 剖析产生错误直觉的认知根源，说明充分条件与必要条件的差异。',
  },
  {
    id: 'math-error-diagnostic',
    name: '数学错因诊断',
    description: '复盘做题过程，精准定位算术失误、公式套错、隐式约束遗漏等根源。',
    icon: '⚑',
    color: 'bg-amber-500/10 text-amber-600',
    instruction: '针对考生的解题步骤进行细致复盘：1. 准确定位出现逻辑偏差或计算错误的第一步；2. 错因归类（概念不清 / 公式记错 / 算术失误 / 定理条件不符 / 思路阻塞 / 审题遗漏）；3. 给出正确推导并总结下次解同类题目的审题检查清单。',
  },
]

export function getSkills(ids: string[]) {
  return AI_SKILLS.filter(skill => ids.includes(skill.id))
}
