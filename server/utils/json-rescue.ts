/**
 * 面向大模型输出的高可靠 JSON + LaTeX 公式无损修复与截断救援解析器
 * 专门解决：
 * 1. LaTeX 命令如 \frac, \beta, \begin, \binom, \tan, \theta, \times, \text, \to, \nabla, \neq, \rho, \right
 *    首字母碰撞 JSON 转义符 (\f, \b, \t, \n, \r) 被损坏为控制字符的问题；
 * 2. JSON 字符串内混入物理换行/制表符导致 JSON.parse 抛错；
 * 3. max_tokens 截断导致尾随不完整 JSON 整批丢失（通过括号深度平衡栈逐题救援）。
 */

const LATEX_COLLISION_RE =
  /^(?:f(?:rac|orall|lat|box)|b(?:eta|egin|inom|ar\b|f\b|ig|mod|ot\b|ullet)|t(?:an\b|anh\b|heta|imes|ext|o\b|au\b|ilde|riangle|op\b|frac|iny)|n(?:abla|eq\b|e\b|u\b|otin|eg\b|i\b|mid|exists|atural|orm)|r(?:ho\b|ight|angle|ceil|floor|m\b|Vert))/

export function repairJsonLatexAndControlChars(rawJson: string): string {
  let out = ''
  let inString = false
  const len = rawJson.length

  for (let i = 0; i < len; i++) {
    const ch = rawJson[i]

    if (!inString) {
      if (ch === '"') {
        inString = true
      }
      out += ch
      continue
    }

    // 处于 JSON 字符串字面量内部
    if (ch === '"') {
      inString = false
      out += ch
      continue
    }

    if (ch === '\r') {
      if (rawJson[i + 1] === '\n') i++
      out += '\\n'
      continue
    }
    if (ch === '\n') {
      out += '\\n'
      continue
    }
    if (ch === '\t') {
      out += '\\t'
      continue
    }

    if (ch === '\\') {
      const next = rawJson[i + 1]
      if (next === undefined) {
        out += '\\\\'
        continue
      }

      // 已经正确双写的反斜杠 \\ 或转义引号 \" 或 \/
      if (next === '\\' || next === '"' || next === '/') {
        out += ch + next
        i++
        continue
      }

      // 合法的 \uXXXX Unicode 转义
      if (next === 'u' && /^[0-9a-fA-F]{4}/.test(rawJson.slice(i + 2, i + 6))) {
        out += rawJson.slice(i, i + 6)
        i += 5
        continue
      }

      // 碰撞区：next 为 b / f / n / r / t
      if (next === 'b' || next === 'f' || next === 'n' || next === 'r' || next === 't') {
        const lookahead = rawJson.slice(i + 1, i + 14)
        if (LATEX_COLLISION_RE.test(lookahead)) {
          // 命中 LaTeX 数学/排版命令（如 \frac, \tan, \beta, \nabla, \right），补双写反斜杠！
          out += '\\\\'
          continue
        }
        // 合法的 JSON 控制转义（如 \n 换行）
        out += ch + next
        i++
        continue
      }

      // 其他单反斜杠（如 \alpha, \sum, \int, \lim, \left, \{, \}, \, 等）：统一补齐双反斜杠
      out += '\\\\'
      continue
    }

    out += ch
  }

  return out
}

export function stripAiJsonWrapper(rawText: string): string {
  if (!rawText) return ''
  return rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^[\s\S]*?```(?:json)?\s*/i, match => (match.includes('```') ? '' : match))
    .replace(/\s*```[\s\S]*$/i, '')
    .trim()
}

export function safeJsonParseWithLatex<T = any>(rawText: string): T | null {
  const cleaned = stripAiJsonWrapper(rawText)
  if (!cleaned) return null

  // 优先走先修复 LaTeX 碰撞再 parse（注意：即便原生 JSON.parse 能成功，也会把 "\frac" 悄无声息损坏成换页符 \x0Crac！所以必须先检测是否存在碰撞命令！）
  const hasCollisionRisk = /\\(?:frac|forall|beta|begin|binom|tan|theta|times|text|to\b|nabla|neq|notin|rho|right)/.test(cleaned)

  if (!hasCollisionRisk) {
    try {
      return JSON.parse(cleaned) as T
    } catch {}
  }

  try {
    const repaired = repairJsonLatexAndControlChars(cleaned)
    return JSON.parse(repaired) as T
  } catch {}

  // 提取外层 { ... } 或 [ ... ] 再试
  const firstObj = cleaned.indexOf('{')
  const lastObj = cleaned.lastIndexOf('}')
  const firstArr = cleaned.indexOf('[')
  const lastArr = cleaned.lastIndexOf(']')

  if (firstArr !== -1 && (firstObj === -1 || firstArr < firstObj) && lastArr > firstArr) {
    const slice = cleaned.slice(firstArr, lastArr + 1)
    try {
      return JSON.parse(repairJsonLatexAndControlChars(slice)) as T
    } catch {}
  }

  if (firstObj !== -1 && lastObj > firstObj) {
    const slice = cleaned.slice(firstObj, lastObj + 1)
    try {
      return JSON.parse(repairJsonLatexAndControlChars(slice)) as T
    } catch {}
  }

  return null
}

/**
 * 括号深度平衡对象提取器：
 * 当大模型输出因达到 max_tokens 在半截中断时，逐个完整剥离已经闭合的 JSON 对象（完美支持嵌套 options 与 LaTeX 花括号）
 */
export function rescueBalancedQuestionObjects(rawText: string): any[] {
  const cleaned = stripAiJsonWrapper(rawText)
  if (!cleaned) return []

  // 若包含 "questions" 数组，从 "questions" 后的第一个 '[' 开始扫描，避免把外层根对象当成单个未闭合块
  let startPos = 0
  const qKeyIdx = cleaned.indexOf('"questions"')
  if (qKeyIdx !== -1) {
    const bracketIdx = cleaned.indexOf('[', qKeyIdx)
    if (bracketIdx !== -1) startPos = bracketIdx + 1
  } else {
    const firstBracket = cleaned.indexOf('[')
    if (firstBracket !== -1) startPos = firstBracket + 1
  }

  const rescued: any[] = []
  let depth = 0
  let objStart = -1
  let inStr = false

  for (let i = startPos; i < cleaned.length; i++) {
    const ch = cleaned[i]
    if (inStr) {
      if (ch === '\\') {
        i++
        continue
      }
      if (ch === '"') {
        inStr = false
      }
      continue
    }

    if (ch === '"') {
      inStr = true
      continue
    }

    if (ch === '{') {
      if (depth === 0) objStart = i
      depth++
    } else if (ch === '}') {
      if (depth > 0) {
        depth--
        if (depth === 0 && objStart !== -1) {
          const candidate = cleaned.slice(objStart, i + 1)
          objStart = -1
          if (candidate.includes('"question"')) {
            const parsed = safeJsonParseWithLatex(candidate)
            if (parsed && typeof parsed === 'object' && parsed.question) {
              rescued.push(parsed)
            }
          }
        }
      }
    }
  }

  return rescued
}
