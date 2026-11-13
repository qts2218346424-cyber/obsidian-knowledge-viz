export type UnifiedProvider = 'antigravity' | 'codex' | 'claude-code' | 'web' | string

export function formatProviderDisplayName(provider?: UnifiedProvider): string {
  switch (provider) {
    case 'antigravity':
      return 'Antigravity'
    case 'codex':
      return 'Codex'
    case 'claude-code':
      return 'Claude Code'
    case 'web':
      return '云端接口'
    default:
      return provider || 'Antigravity'
  }
}

/**
 * 统一规范模型与引擎的显示名称，保证选择器、对话头部与扣费账单前后端完全一致
 */
export function formatUnifiedModelName(provider?: UnifiedProvider, model?: string): string {
  const cleanModel = (model || '').trim()
  const cleanProvider = (provider || '').trim()

  if (
    cleanProvider === 'antigravity' ||
    cleanModel === 'gemini-3.8-flash' ||
    cleanModel === 'gemini-3.8-pro'
  ) {
    const modelLabel = cleanModel === 'gemini-3.8-pro' ? 'Gemini 3.8 Pro' : 'Gemini 3.8 Flash'
    return `Antigravity · ${modelLabel}`
  }

  const provLabel = formatProviderDisplayName(cleanProvider)
  if (!cleanModel) {
    return provLabel
  }
  if (cleanModel.includes('::')) {
    const [, actualModel] = cleanModel.split('::')
    return `${provLabel} · ${actualModel || cleanModel}`
  }
  return `${provLabel} · ${cleanModel}`
}

/**
 * 判断问题内容是否跨学科并需要标注“研小核（代答）”
 */
export function detectCrossSubjectProxy(promptText: string, currentAgentId: string): string | null {
  if (currentAgentId !== 'agent-408') return null
  const text = (promptText || '').trim()
  if (!text) return null
  if (/政治|马原|毛中特|史纲|思修|肖秀荣|时政|马克思主义|辩证法|唯物/.test(text)) {
    return '考研政治（原需政小原）'
  }
  if (/英语|长难句|作文|阅读理解|完形|新题型|翻译|单词|词汇/.test(text)) {
    return '考研英语（原需英小研）'
  }
  if (/规划|计划|时间表|作息|复习安排|时间切片|每日任务|冲刺计划/.test(text)) {
    return '备考规划（原需规小航）'
  }
  if (/高数|线性代数|概率论|微积分|极限|泰勒|中值定理|特征值|矩阵|二重积分/.test(text)) {
    return '考研数学（原需数小通）'
  }
  if (/焦虑|崩溃|内耗|失眠|学不动|学不进去|难过|想放弃|压力大|好累|心情|自卑|恐惧/.test(text)) {
    return '心理解压（原需奶龙·心灵疗愈师）'
  }
  return null
}
