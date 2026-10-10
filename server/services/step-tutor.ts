import { config, anthropic, getAiClientForModel } from '../context.js'
import { matchSyllabusNode } from '../data/syllabus.js'
import { runLocalAgent, type LocalAgentProvider } from '../local-agent-bridge.js'

export type TutorMode = 'hint' | 'audit' | 'formula'

export interface StepTutorParams {
  mode: TutorMode
  questionText: string
  subject?: string
  studentSteps?: string // 用于 audit 模式：学生输入的步骤草稿
  optionsText?: string
  provider?: LocalAgentProvider | 'web'
  model?: string
}

export interface StepTutorResult {
  mode: TutorMode
  syllabusMatch?: {
    id: string
    subject: string
    level1: string
    level2: string
    level3: string
  }
  content: string
  engineUsed: string
}

/**
 * 考研 408 & 考研数学启发式分步思维链 AI 辅导服务
 */
export async function runStepTutor(params: StepTutorParams): Promise<StepTutorResult> {
  const { mode, questionText, subject, studentSteps, optionsText, provider, model } = params
  const matchedNode = matchSyllabusNode(questionText, subject)

  let systemPrompt = ''
  let userPrompt = ''

  if (mode === 'hint') {
    systemPrompt = `你是一位经验极其丰富且严格的全国硕士研究生考试（408计算机综合与考研数学）金牌导师。
你的核心教学原则是【启发式教学，绝不剧透答案】！
学生在做题时卡壳，向你求助第一步思路。

【严格执行准则】：
1. 明确点破这道题考查的核心考点与定理适用背景。
2. 给出“破题第一步”的思考突破口（例如：辅助函数如何构造、图的遍历从哪个顶点切入、Cache映射先算哪个位数等）。
3. 【最高禁令】：绝对严禁直接给出中间计算结果、绝对严禁给出最终选项或答案！
4. 公式必须全部严格使用规范 KaTeX LaTeX（行内 $...$，行间 $$...$$）。
5. 语气循循善诱、富有启发性，在末尾留出一个自测思考问题促使学生自己动笔推导。`

    userPrompt = `【待解题目】：
科目：${subject || matchedNode?.subject || '考研综合'}
考点参考：${matchedNode ? `${matchedNode.level1} -> ${matchedNode.level2} -> ${matchedNode.level3}` : '考点定位'}
题面：
${questionText}
${optionsText ? `选项：\n${optionsText}` : ''}

请给出【破题第一步思路提示】（切记不要剧透后续计算和最终答案！）：`
  } else if (mode === 'audit') {
    systemPrompt = `你是一位极其严谨的考研 408 与 考研数学阅卷人及专家导师。
学生提供了自己做这道题时的解题演算草稿步骤，请你进行【深度逻辑挑刺与断点诊断】。

【诊断要求】：
1. 逐步审查学生的推导过程，找出逻辑漏洞、定理适用前提缺失、计算失误或概念混淆（例如：偷换概念、等价无穷小代换用于加减法错误、未考虑分母为零、二叉树空指针特例遗漏等）。
2. 指出“从第几步开始偏离了正确方向”，并解释为什么这样推导不成立。
3. 给出针对该漏洞的纠偏指引，引导学生修正。
4. 公式必须严格使用 KaTeX LaTeX 格式。`

    userPrompt = `【题目】：
${questionText}

【学生的演算草稿与作答步骤】：
${studentSteps || '（学生未提供详细草稿，请提示常规做题容易踩坑的常见误区）'}

请对以上步骤进行逐项挑刺与逻辑排查：`
  } else if (mode === 'formula') {
    systemPrompt = `你是一位考研 408 与 考研数学专家导师。
请为学生提炼本题所依赖的【核心定理、公理与推论公式清单】，便于学生回溯笔记与背诵。

【要求】：
1. 列出 2~4 个本题最核心的公式或定理。
2. 每个定理给出：定理名称、标准 LaTeX 数学表达、适用前提条件（极重要！）、避坑口诀。
3. 提示应去笔记库中复习哪一章节的知识点。`

    userPrompt = `【题目】：
科目：${subject || matchedNode?.subject || '考研综合'}
题面：
${questionText}

请提炼【核心定理公式与笔记反查指南】：`
  }

  let textContent = ''
  let engineUsed = 'default'

  // 1. 如果用户指定了本地智能体 (Codex 或 Claude Code)
  if (provider === 'codex' || provider === 'claude-code') {
    try {
      engineUsed = provider === 'codex' ? 'Codex 本地智能体' : 'Claude Code 本地智能体'
      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`
      for await (const event of runLocalAgent({
        provider,
        prompt: combinedPrompt,
        cwd: config.vaultPath,
        model,
        config: config.localAgents,
      })) {
        if (event.type === 'text') {
          textContent += event.content || ''
        } else if (event.type === 'error') {
          console.warn(`[StepTutor] 本地智能体 ${provider} 产生非致命异常:`, event.content)
        }
      }
    } catch (localErr: any) {
      console.warn(`[StepTutor] 调起本地智能体 ${provider} 失败，尝试降级:`, localErr.message)
    }
  }

  // 2. 如果未产生内容，且有云端 AI 客户端可用
  if (!textContent.trim()) {
    const aiTarget = getAiClientForModel(model) || (anthropic ? { client: anthropic, model: config.ai?.model || 'deepseek-v4-pro' } : null)
    if (aiTarget) {
      try {
        engineUsed = `云端大模型 (${aiTarget.model})`
        const response = await aiTarget.client.messages.create({
          model: aiTarget.model,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
        textContent = response.content[0].type === 'text' ? response.content[0].text : ''
      } catch (cloudErr: any) {
        console.warn('[StepTutor] 云端大模型调用失败:', cloudErr.message)
      }
    }
  }

  // 3. 终极兜底：基于考纲元数据生成结构化启发提示
  if (!textContent.trim()) {
    engineUsed = '考纲知识元模板（离线）'
    if (mode === 'hint') {
      textContent = `### 💡 核心考点与破题切入点提示
- **知识点归属**：${matchedNode ? `${matchedNode.subject} · ${matchedNode.level1} -> ${matchedNode.level2}` : '考研基础综合'}
- **核心命题逻辑**：该类题型重点考查对概念本质与适用边界的掌握。
- **第一步切入建议**：
  1. 仔细圈画题干中的关键词（如：${matchedNode?.keywords.slice(0, 3).join('、') || '限制条件'}）；
  2. 明确考题所处的状态机或数学公式的前提条件，排除无关干扰项；
  3. **动手自测**：请先在草稿纸上写出最基础的初始状态或定义式，不要急于计算最终数值！`
    } else if (mode === 'audit') {
      textContent = `### 🔍 解题步骤易错断点排查指南
1. **常见陷阱一**：忽略边界条件与特殊情况（如二叉树单节点/空树、矩阵秩小于阶数、分母趋向于零的阶数）。
2. **常见陷阱二**：中间定理适用前提不满足（如洛必达法则要求“$\frac{0}{0}$ 或 $\frac{\infty}{\infty}$”且导数之比极限存在）。
3. **自我挑刺建议**：请核对你的推导中是否有“未经验证直接套用公式”的步骤？`
    } else {
      textContent = `### 📐 核心定理公式与笔记反查
- **考点名称**：${matchedNode ? matchedNode.level3 : '考研核心知识点'}
- **核心关键词**：${matchedNode?.keywords.join('、') || '考研定理'}
- **建议反查笔记**：请打开知识库检索包含【${matchedNode?.keywords[0] || '核心概念'}】的讲义，重点复习定理推导过程与反例。`
    }
  }

  return {
    mode,
    syllabusMatch: matchedNode ? {
      id: matchedNode.id,
      subject: matchedNode.subject,
      level1: matchedNode.level1,
      level2: matchedNode.level2,
      level3: matchedNode.level3,
    } : undefined,
    content: textContent,
    engineUsed,
  }
}
