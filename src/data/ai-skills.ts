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
]

export function getSkills(ids: string[]) {
  return AI_SKILLS.filter(skill => ids.includes(skill.id))
}
