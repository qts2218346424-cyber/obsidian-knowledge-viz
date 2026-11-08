/**
 * 考研英语智能作文批改引擎
 * 融合考研官方大纲阅卷评分标准、离线多维度规则诊断与 AI 深度润色
 */

export interface EssayGradingResult {
  overallScore: number // 折算为满分制 (小作文10分，大作文20分)
  maxScore: number
  tierLevel: '第一档(优秀)' | '第二档(良好)' | '第三档(及格)' | '第四档(较差)' | '第五档(极差)'
  tierFeedback: string
  statistics: {
    wordCount: number
    paragraphCount: number
    sentenceCount: number
    avgWordsPerSentence: number
    typeTokenRatio: number // 词汇多样性 (不同词数/总词数)
    advancedWordCount: number
    complexSentenceRatio: number // 复合句比例
  }
  dimensionScores: {
    dimension: string
    score: number // 0-100
    weight: string
    comment: string
  }[]
  vocabularyUpgrades: {
    original: string
    suggested: string[]
    reason: string
    exampleSentence: string
  }[]
  syntaxAndGrammarIssues: {
    sentence: string
    issueType: '语法错误' | '标点规范' | '平庸句式' | '连词缺失'
    description: string
    improvement: string
  }[]
  polishedVersion: string
  masterpieceHighlight: string
}

// 常见平庸词升级映射字典
const VOCABULARY_UPGRADE_RULES: Array<{
  pattern: RegExp
  original: string
  suggested: string[]
  reason: string
  exampleSentence: string
}> = [
  {
    pattern: /\bimportant\b/gi,
    original: 'important',
    suggested: ['crucial', 'pivotal', 'indispensable', 'paramount', 'of momentous significance'],
    reason: '考研阅卷人最易审阅疲劳的初级词，替换为高端形容词或 of + 抽象名词结构可迅速拉升语言档次。',
    exampleSentence: 'Self-discipline is of paramount importance for graduate aspirants.',
  },
  {
    pattern: /\bvery\s+good\b|\bgood\b/gi,
    original: 'good / very good',
    suggested: ['remarkable', 'exemplary', 'meritorious', 'splendid', 'unrivaled'],
    reason: 'good 过于口语平淡，建议换用具备学术与思辨色彩的褒义书面词汇。',
    exampleSentence: 'The project yielded remarkable and far-reaching achievements.',
  },
  {
    pattern: /\bmany\b|\ba\s+lot\s+of\b/gi,
    original: 'many / a lot of',
    suggested: ['a myriad of', 'an abundance of', 'a multitude of', 'countless', 'numerous'],
    reason: '数词量词多样化能体现词汇广度，myriad 与 multitude 属于考研英语高分闪光量词。',
    exampleSentence: 'A myriad of intertwining elements account for this trend.',
  },
  {
    pattern: /\bi\s+think\b/gi,
    original: 'I think',
    suggested: ['I harbor the conviction that', 'It is my staunch belief that', 'From my perspective,', 'I reckon that'],
    reason: '议论文大作文中避免滥用单调口语化的 I think，改用高阶名词同位语或倒装结构。',
    exampleSentence: 'I harbor the firm conviction that perseverance will ultimately triumph.',
  },
  {
    pattern: /\bbecause\b/gi,
    original: 'because',
    suggested: ['in that', 'seeing that', 'on account of the fact that', 'for the reason that'],
    reason: '以 in that 或 seeing that 替代普通 because，逻辑关系更紧密且文风古雅庄重。',
    exampleSentence: 'The policy succeeds in that it fully respects the public interest.',
  },
  {
    pattern: /\bhelp\b/gi,
    original: 'help',
    suggested: ['facilitate', 'bolster', 'reinforce', 'lend potent support to'],
    reason: 'help 词义单一，学术写作中根据语境选用促进 (facilitate) 或支撑 (bolster)。',
    exampleSentence: 'Advanced digital technologies drastically facilitate remote education.',
  },
]

// 考研大纲高级词汇探测集合
const ADVANCED_ACADEMIC_WORDS = new Set([
  'indispensable', 'paramount', 'burgeoning', 'deterioration', 'precipitate',
  'endeavor', 'perseverance', 'epitomize', 'transcend', 'subsidies', 'momentum',
  'paradigm', 'unprecedented', 'staggering', 'quandary', 'alleviate', 'constructive',
  'trajectory', 'intertwine', 'disparity', 'harmonious', 'counter-current', 'resurgence',
  'artisanal', 'nostalgia', 'underscore', 'disembodied', 'stifle', 'orchestrate',
])

/**
 * 本地多维度智能作文批改算法 (即便在离线或未挂载大型模型时亦能 0 毫秒极速产出专业诊断)
 */
export function gradeEssayLocally(
  essayText: string,
  essayType: 'small_essay' | 'big_essay' = 'big_essay'
): EssayGradingResult {
  const cleanText = essayText.trim()
  const words = cleanText.match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) || []
  const wordCount = words.length
  const paragraphs = cleanText.split(/\n+/).filter((p) => p.trim().length > 0)
  const paragraphCount = paragraphs.length
  const rawSentences = cleanText.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean)
  const sentenceCount = rawSentences.length || 1

  const avgWordsPerSentence = Math.round((wordCount / sentenceCount) * 10) / 10

  // 词汇多样性 TTR
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()))
  const typeTokenRatio = wordCount > 0 ? Math.round((uniqueWords.size / wordCount) * 100) / 100 : 0

  // 高阶大纲词命中统计
  let advancedWordCount = 0
  words.forEach((w) => {
    if (ADVANCED_ACADEMIC_WORDS.has(w.toLowerCase())) {
      advancedWordCount++
    }
  })

  // 复合句统计 (包含 which, that, where, although, whereas, because, if, unless 等连接词)
  const complexConnectors = /\b(which|that|who|whom|whose|where|when|why|although|though|even though|whereas|while|because|since|unless|if|as long as)\b/i
  let complexSentenceCount = 0
  rawSentences.forEach((s) => {
    if (complexConnectors.test(s)) complexSentenceCount++
  })
  const complexSentenceRatio = Math.round((complexSentenceCount / sentenceCount) * 100)

  // 词汇升级分析
  const vocabularyUpgrades: EssayGradingResult['vocabularyUpgrades'] = []
  VOCABULARY_UPGRADE_RULES.forEach((rule) => {
    if (rule.pattern.test(cleanText)) {
      vocabularyUpgrades.push({
        original: rule.original,
        suggested: rule.suggested,
        reason: rule.reason,
        exampleSentence: rule.exampleSentence,
      })
    }
  })

  // 句式与标点语法诊断
  const syntaxAndGrammarIssues: EssayGradingResult['syntaxAndGrammarIssues'] = []
  rawSentences.forEach((sentence) => {
    // 检查逗号连接两句无连词 (Comma Splice 初步扫描)
    if (sentence.includes(',') && sentence.split(',').length >= 3 && !complexConnectors.test(sentence)) {
      syntaxAndGrammarIssues.push({
        sentence,
        issueType: '连词缺失',
        description: '单句中并列从句较长但缺少适当从属连词，易造成逗号拼接句 (Comma Splice) 语法扣分。',
        improvement: '可适度拆分为两句，或在分句前添加 Although, While 或分号连接。',
      })
    }
    // 检查过短的碎片句 (少于 5 词)
    const sWords = sentence.split(/\s+/).length
    if (sWords > 0 && sWords < 5 && essayType === 'big_essay') {
      syntaxAndGrammarIssues.push({
        sentence,
        issueType: '平庸句式',
        description: '句子过短，缺乏考研英语议论文所要求的学术延展度与从属层次。',
        improvement: '建议利用分词短语 (doing/done) 或同位语从句与后句进行自然合并。',
      })
    }
  })

  // 满分基准与标准分判定
  const maxScore = essayType === 'small_essay' ? 10 : 20
  const idealWordMin = essayType === 'small_essay' ? 80 : 160
  const idealWordMax = essayType === 'small_essay' ? 130 : 220

  // 维度计算
  // 1. 内容与篇幅 (Length & Completeness)
  let lenScore = 85
  if (wordCount < idealWordMin * 0.7) lenScore = 55
  else if (wordCount < idealWordMin) lenScore = 72
  else if (wordCount > idealWordMax * 1.3) lenScore = 80
  else lenScore = 95

  // 2. 词汇丰富度与考纲高级词 (Lexical Richness)
  let vocabScore = Math.min(100, Math.round(typeTokenRatio * 100 + advancedWordCount * 6))
  vocabScore = Math.max(50, Math.min(98, vocabScore))

  // 3. 句式多样性与语法规范 (Syntactic Variety)
  let syntaxScore = Math.min(100, Math.round(complexSentenceRatio * 0.8 + (avgWordsPerSentence >= 14 ? 30 : 18)))
  if (syntaxAndGrammarIssues.length > 2) syntaxScore -= 12
  syntaxScore = Math.max(50, Math.min(95, syntaxScore))

  // 4. 结构连贯与分段 (Structure & Cohesion)
  let structScore = 85
  if (essayType === 'big_essay') {
    if (paragraphCount === 3) structScore = 96 // 黄金三段论
    else if (paragraphCount === 1) structScore = 50
    else structScore = 78
  } else {
    if (paragraphCount >= 2 && paragraphCount <= 3) structScore = 94
    else structScore = 75
  }

  // 综合总分计算 (满分折算)
  const weightedTotal = lenScore * 0.25 + vocabScore * 0.3 + syntaxScore * 0.3 + structScore * 0.15
  const overallScore = Math.round((weightedTotal / 100) * maxScore * 10) / 10

  let tierLevel: EssayGradingResult['tierLevel'] = '第三档(及格)'
  let tierFeedback = ''

  const ratio = overallScore / maxScore
  if (ratio >= 0.85) {
    tierLevel = '第一档(优秀)'
    tierFeedback = '结构严谨典雅，词汇极具思辨深度，长短句相得益彰，充分契合考研阅卷组对一档高分作文的所有期待！'
  } else if (ratio >= 0.7) {
    tierLevel = '第二档(良好)'
    tierFeedback = '表达流畅，主旨明确，具备较好的语法句式驾驭力；若能在关键词汇替换与倒装/强调句等亮点句型上更进一步，极易突破进入第一档！'
  } else if (ratio >= 0.5) {
    tierLevel = '第三档(及格)'
    tierFeedback = '基本完成了题目要求，但词汇稍显平庸单调，复合句层次较浅，偶有碎片句或用词不当，建议背诵并熟练套用核心万能金句。'
  } else if (ratio >= 0.35) {
    tierLevel = '第四档(较差)'
    tierFeedback = '篇幅或分段不合规范，存在较多语言拼写与基础语法漏洞，未能有效展开逻辑论述，需加强模版段落训练。'
  } else {
    tierLevel = '第五档(极差)'
    tierFeedback = '词不达意，字数明显不足或严重跑题，建议从精读真题范文和基础大纲核心词复盘开始扎实筑基。'
  }

  // 模拟生成 AI 精准润色范文
  const polishedVersion = cleanText
    .replace(/\bimportant\b/gi, 'paramount')
    .replace(/\bi think\b/gi, 'I harbor the conviction that')
    .replace(/\bmany\b/gi, 'a myriad of')
    .replace(/\bbecause\b/gi, 'in that')
    .replace(/\bvery good\b/gi, 'exceptional')

  return {
    overallScore,
    maxScore,
    tierLevel,
    tierFeedback,
    statistics: {
      wordCount,
      paragraphCount,
      sentenceCount,
      avgWordsPerSentence,
      typeTokenRatio,
      advancedWordCount,
      complexSentenceRatio,
    },
    dimensionScores: [
      {
        dimension: '任务完成与字数规格',
        score: lenScore,
        weight: '25%',
        comment: `字数共 ${wordCount} 词，分段 ${paragraphCount} 段。${
          wordCount >= idealWordMin && wordCount <= idealWordMax
            ? '篇幅饱满，完全符合考研大纲黄金字数区间。'
            : '建议适度调控字数至最佳答题区间，避免阅卷扣分。'
        }`,
      },
      {
        dimension: '词汇多样度与大纲高级词',
        score: vocabScore,
        weight: '30%',
        comment: `词汇丰富度为 ${typeTokenRatio}，识别出 ${advancedWordCount} 个考研高阶大纲词汇。建议替换文中的通用平庸词。`,
      },
      {
        dimension: '句式丰富度与语法严谨性',
        score: syntaxScore,
        weight: '30%',
        comment: `复合句占比 ${complexSentenceRatio}%，平均句长 ${avgWordsPerSentence} 词。长短句错落有致，有助于博得阅卷好感。`,
      },
      {
        dimension: '篇章结构与逻辑衔接',
        score: structScore,
        weight: '15%',
        comment: `${
          paragraphCount === 3
            ? '采用经典三段式黄金论述架构，段落间起承转合自然紧凑。'
            : '建议采用标准的黄金三段论（引出 -> 论述 -> 总结）以增强视觉结构感。'
        }`,
      },
    ],
    vocabularyUpgrades,
    syntaxAndGrammarIssues,
    polishedVersion,
    masterpieceHighlight: '“Only through concerted endeavors and unwavering perseverance can we embrace a more enlightened future.”',
  }
}
