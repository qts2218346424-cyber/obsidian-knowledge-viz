/**
 * 考研英语核心资源库 (包含英语一/英语二 作文模板、万能金句、历年真题精读与长难句)
 */

export type EssayCategory = 'small_letter' | 'small_notice' | 'big_picture' | 'big_chart'
export type EnglishExamType = 'english_1' | 'english_2' | 'both'

export interface EssayTemplate {
  id: string
  title: string
  examType: EnglishExamType
  category: EssayCategory
  typeLabel: string
  topic: string
  description: string
  structure: {
    sectionName: string
    purpose: string
    templateText: string
    translation: string
    placeholderHints: string[]
  }[]
  highlightPhrases: string[]
  sampleTitle?: string
  fullSample?: string
}

export interface GoldenSentence {
  id: string
  category: 'opening' | 'data_analysis' | 'cause_effect' | 'argumentation' | 'solution' | 'conclusion'
  categoryLabel: string
  sentence: string
  translation: string
  difficulty: '高分闪光' | '黄金万能' | '保底通用'
  grammarHighlight: string
}

export interface PastPaperReading {
  id: string
  year: number
  examType: '英语一' | '英语二'
  source: string
  title: string
  summary: string
  paragraphs: {
    paraIndex: number
    sentences: {
      en: string
      zh: string
      isHardSentence?: boolean
      hardAnalysis?: string
      keyWords?: { word: string; meaning: string }[]
    }[]
  }[]
  questions: {
    id: string
    stem: string
    options: { A: string; B: string; C: string; D: string }
    answer: 'A' | 'B' | 'C' | 'D'
    analysis: string
    questionType: '细节理解' | '词义推断' | '主旨大意' | '态度观点'
  }[]
}

// -------------------------------------------------------------
// 1. 考研英语高分作文模板库 (英语一/英语二 小作文与大作文)
// -------------------------------------------------------------
export const ESSAY_TEMPLATES: EssayTemplate[] = [
  // --- 小作文：建议信 ---
  {
    id: 'letter_suggestion',
    title: '建议信万能高分模板 (Letter of Suggestion)',
    examType: 'both',
    category: 'small_letter',
    typeLabel: '书信 · 建议信',
    topic: '对图书馆服务/校园管理/市政改善/机构课程提出建设性建议',
    description: '适用于英语一与英语二各类应用文建议信。语域严谨客气，先肯定成绩，再条理清晰地提出三点改进举措。',
    structure: [
      {
        sectionName: '首段：表明写信身份与目的',
        purpose: '礼貌问候 + 亮明身份 + 说明写信由头与建议主旨',
        templateText: 'Dear Sir or Madam,\n\nI am [Your Identity, e.g. a senior student of our university], writing this letter to present some constructive recommendations regarding [The Subject, e.g. the management of our campus library]. First and foremost, I would like to express my sincere appreciation for the wonderful services you have consistently provided.',
        translation: '尊敬的先生/女士：我是[您的身份，例如我校的一名大四学生]，写信就[建议主题，例如校园图书馆的管理]提出几点建设性建议。首先，请允许我对您一直以来所提供的优质服务表示衷心的感谢。',
        placeholderHints: ['身份：a loyal customer / a frequent visitor / a graduate student', '主题：the current arrangement of... / the course syllabus'],
      },
      {
        sectionName: '次段：分条列举具体建议及理由',
        purpose: '使用条理性衔接词提出 2-3 点切实可行的改进举措',
        templateText: 'To begin with, it would be highly beneficial if [Suggestion 1, e.g. the opening hours could be appropriately extended during the examination season], which would undoubtedly alleviate the overwhelming study pressure of students. Furthermore, I would suggest that [Suggestion 2, e.g. more state-of-the-art facilities be introduced] to enhance the overall learning efficiency. Last but not least, greater attention should be paid to [Suggestion 3, e.g. the quietness of reading areas].',
        translation: '首先，如果[建议1：能在考试季适当延长开放时间]，那将大有裨益，这无疑能缓解学生巨大的备考压力。此外，我建议[建议2：引入更多现代化设备]以提升整体学习效率。最后但同样重要的是，应当对[建议3：阅读区域的静音保持]给予更多关注。',
        placeholderHints: ['虚拟语气建议：it would be of great help if...', '虚拟主谓建议：I suggest that ... (should) be improved'],
      },
      {
        sectionName: '末段：表达期待与礼貌致意',
        purpose: '希望采纳建议 + 期待回复 + 签名致谢',
        templateText: 'I hope that you will find these proposals constructive and feasible. Thank you very much for your time and kind consideration. I am eagerly looking forward to your favorable reply.\n\nYours sincerely,\nLi Ming',
        translation: '希望您能觉得这些提议富有建设性且切实可行。非常感谢您宝贵的时间与悉心考虑。期待您的积极答复。\n\n您诚挚的，\n李明',
        placeholderHints: ['结语签名标准规范：Yours sincerely / Yours faithfully'],
      },
    ],
    highlightPhrases: [
      'present some constructive recommendations regarding...',
      'express my sincere appreciation for...',
      'it would be highly beneficial if...',
      'alleviate the overwhelming pressure',
      'find these proposals constructive and feasible',
    ],
  },

  // --- 小作文：道歉信 ---
  {
    id: 'letter_apology',
    title: '道歉信黄金模板 (Letter of Apology)',
    examType: 'both',
    category: 'small_letter',
    typeLabel: '书信 · 道歉信',
    topic: '因突发紧急情况无法赴约/丢失借阅物品/延误递交文件等致歉',
    description: '表达诚恳的歉意，说明令人信服的客观缘由，并提出切实补救方案。',
    structure: [
      {
        sectionName: '首段：诚挚致歉并说明事由',
        purpose: '开门见山道歉 + 指明致歉的具体事件',
        templateText: 'Dear [Name/Sir or Madam],\n\nI am writing to convey my deepest and most sincere apologies to you for [The Incident, e.g. my unexpected absence from yesterday\'s academic conference]. I am thoroughly aware of the inconvenience and disappointment this unfortunate matter might have brought to you.',
        translation: '亲爱的[收信人]：我写此信是为了就[道歉事件，例如昨日未能如约出席学术会议]向您表达我最深切、最诚挚的歉意。我深知这起不幸的事件可能给您带来的不便与失望。',
        placeholderHints: ['The Incident: my failing to attend the scheduled interview / losing the precious book I borrowed from you'],
      },
      {
        sectionName: '次段：合理解释缘由并提供补救举措',
        purpose: '说明不可抗力因素 + 提出双赢的补救计划',
        templateText: 'The primary reason for my failure was that [Unforeseen Reason, e.g. I was suddenly taken ill and hospitalized for acute appendicitis], which completely prevented me from notifying you in advance. To make up for this regretful blunder, I would like to [Remedy Plan, e.g. reschedule an appointment at your earliest convenience or mail the relevant materials right away].',
        translation: '未能赴约的主要原因在于[不可抗力原因，例如突发急性阑尾炎住院]，这致使我未能提前向您知会。为了弥补这一令人遗憾的失误，我希望能[弥补措施：在您方便的最近时间重新预约见面，或立刻将相关材料邮寄给您]。',
        placeholderHints: ['客观原因：unexpected family emergency / sudden transit disruption', '补救举措：compensate for the loss / deliver the modified draft'],
      },
      {
        sectionName: '末段：重申歉意并恳求谅解',
        purpose: '再次表达愧疚 + 期待对方海涵',
        templateText: 'Once again, please accept my heartfelt apologies for any distress caused. I earnestly solicit your generous forgiveness and comprehension.\n\nYours sincerely,\nLi Ming',
        translation: '再次请您接受我因带来困扰而致以的由衷歉意。我真诚地恳请您的宽宥与谅解。\n\n您诚挚的，\n李明',
        placeholderHints: ['solicit your generous forgiveness 属于地道书面高分表达'],
      },
    ],
    highlightPhrases: [
      'convey my deepest and most sincere apologies',
      'unforeseen and unavoidable emergency',
      'make up for this regretful blunder',
      'earnestly solicit your generous forgiveness',
    ],
  },

  // --- 小作文：告示/通知 (Notice) ---
  {
    id: 'notice_volunteers',
    title: '官方公告/招募通知高分模板 (Official Notice)',
    examType: 'both',
    category: 'small_notice',
    typeLabel: '告示 · 招募通知',
    topic: '校园志愿者招募/学术讲座通知/国际文化节活动公告',
    description: '标准通知格式（无称谓与客套签名），语言简练有号召力，涵盖活动主旨、任职要求与报名方式。',
    structure: [
      {
        sectionName: '标题与首段：明确公告活动主题',
        purpose: '醒目标题 + 阐明活动宗旨与时间地点',
        templateText: 'Notice\n\nMay 10, 2026\n\nTo promote [Theme, e.g. international cultural exchange] and enrich students\' campus life, our university is scheduled to host [Event Name, e.g. the 2026 International Youth Forum] from [Date 1] to [Date 2] in the University Grand Auditorium. To ensure its grand success, we are now enthusiastically recruiting [Number, e.g. 30 student volunteers].',
        translation: '通知\n\n2026年5月10日\n\n为弘扬[活动主题，例如国际文化交流]并丰富同学们的校园生活，我校定于[日期]在大学大礼堂举办[活动名称，例如2026年国际青年论坛]。为确保活动圆满成功，现面向全校热情招募[30名学生志愿者]。',
        placeholderHints: ['Event: the Annual Campus Marathon / English Speech Contest'],
      },
      {
        sectionName: '次段：报名资格与岗位职责要点',
        purpose: '列出申请者的必备能力与要求',
        templateText: 'The qualifications for the candidates are outlined as follows. In the first place, applicants are expected to possess fluent oral English communication skills. In the second place, strong interpersonal capabilities and a high sense of collective responsibility are indispensable. Candidates with relevant volunteer experience will be given priority.',
        translation: '候选人的资格要求如下：首先，申请人需具备流利的英语口语沟通能力。其次，出色的人际沟通协调能力与高度的集体责任感必不可少。有相关志愿服务经验者将予以优先考虑。',
        placeholderHints: ['必备素质：fluent oral communication / teamwork spirit / adaptability'],
      },
      {
        sectionName: '末段：报名途径与截止日期',
        purpose: '明确联系人、报名邮箱、截止时间与鼓励参与',
        templateText: 'Those who are interested are kindly requested to submit your resume to [Email, e.g. volunteers@university.edu.cn] prior to [Deadline Date, e.g. May 25]. Welcome to join us and showcase your extraordinary talents!\n\nThe Student Union',
        translation: '有意者请于[截止日期]之前将个人简历发送至[邮箱]。欢迎大家积极参与，施展才华！\n\n学生会',
        placeholderHints: ['发布机构：The Organizing Committee / The Student Union'],
      },
    ],
    highlightPhrases: [
      'To ensure its grand success',
      'The qualifications for the candidates are outlined as follows',
      'a high sense of collective responsibility is indispensable',
      'Those who are interested are kindly requested to...',
    ],
  },

  // --- 英语一大作文：经典图画论述文 (三大主题万能模型) ---
  {
    id: 'big_essay_picture_phenomenon',
    title: '英语一 · 图画象征议论文三段式巅峰模板',
    examType: 'english_1',
    category: 'big_picture',
    typeLabel: '英语一 · 图画议论文',
    topic: '社会现象/文化自信/个人品质（毅力、合作、诚信）/人与自然/科技双刃剑',
    description: '考研英语一阅卷组高度青睐的三段论：生动描图引出隐喻 -> 深度理论多维度剖析 -> 宏观社会与个人双轨展望。',
    structure: [
      {
        sectionName: '第一段：生动描图 + 揭示象征寓意 (约 40-50 词)',
        purpose: '描述图画核心细节 + 揭示作者所要传达的深层隐喻',
        templateText: 'As is vividly depicted in the cartoon, [Detailed Picture Description: e.g. two individuals are standing at a crossroads, with one staring blankly into a smartphone while the other gazing steadfastly into the distant horizon]. What the drawer intends to convey transcends the mere visual illustration: it profoundly epitomizes [The Underlying Theme, e.g. the prevailing phenomenon of technological addiction versus mindful contemplation in contemporary society].',
        translation: '正如这幅生动的漫画所描摹的那样，[具体图画细节：例如两个人正站在人生的十字路口，一个人茫然凝视着手中的智能手机，而另一个人则坚定地眺望远方的地平线]。创作者所意图传达的旨趣远超画面的表层呈现：它深刻地折射出了[核心主题：当代社会中技术沉迷与沉静思辨并存的普遍现象]。',
        placeholderHints: [
          '描图句型：As is vividly illustrated / portrayed in the caricature...',
          '象征隐喻：profoundly epitomizes the paramount significance of perseverance / integrity / environmental protection',
        ],
      },
      {
        sectionName: '第二段：多角度归因与深远影响剖析 (约 80-100 词)',
        purpose: '从心理机制、社会环境、时代变迁等 2-3 个层面展开严谨论述',
        templateText: 'Diverse factors combine to account for this thought-provoking phenomenon. On the individual level, [Factor 1: e.g. people\'s pursuit of instant gratification in the era of information explosion has imperceptibly eroded their capacity for deep reading and independent judgment]. On the societal level, [Factor 2: e.g. the relentless tide of commercialization often prioritizes short-term sensationalism over spiritual enlightenment]. Consequently, this situation, if left unchecked, will not only [Negative Impact 1: e.g. stifle genuine creativity among the youth], but also [Negative Impact 2: e.g. undermine the cultural foundation of our society].',
        translation: '多种因素共同促成了这一发人深省的现象。在个人层面，[因素1：信息爆炸时代人们对即时满足的追逐，在潜移默化中侵蚀了深度阅读与独立判断的能力]。在社会层面，[因素2：商业化的滚滚浪潮往往将短期轰动效应置于精神熏陶之上]。因此，这种局面若任由其发展，不仅将[负面影响1：扼杀青年一代真正的创造力]，还将[负面影响2：动摇我们社会的文化根基]。',
        placeholderHints: [
          '因果过渡：Diverse factors combine to account for this...',
          '双层递进：On the personal / societal dimension...',
          '虚拟预警：if left unaddressed / unchecked, this will inevitably...',
        ],
      },
      {
        sectionName: '第三段：双向对策与前瞻性总结 (约 40-50 词)',
        purpose: '提出切实可行的倡议 + 升华主旨展望未来',
        templateText: 'In light of the compelling analysis above, it is imperative that concerted endeavors be orchestrated to address this issue. On the one hand, regulatory authorities ought to formulate comprehensive policies to foster a wholesome cultural ambiance. On the other hand, each individual should cultivate self-discipline and harbor a balanced mindset. Only through these concerted endeavors can we embrace a more harmonious, enlightened and prosperous future.',
        translation: '鉴于上述令人信服的分析，当务之急是协同多方力量共同应对此问题。一方面，监管部门应当制定周全政策以培育健康的文化氛围；另一方面，我们每个人都应当淬炼自律品格，秉持平和理性之从容心态。唯有通过这些齐心协力的举措，我们方能迎来一个更加和谐、明慧与繁荣的未来。',
        placeholderHints: [
          '倒装句升华结语：Only through these concerted endeavors can we...',
          '虚拟语气倡议：it is imperative that concerted endeavors be orchestrated...',
        ],
      },
    ],
    highlightPhrases: [
      'As is vividly depicted in the cartoon...',
      'What the drawer intends to convey transcends the mere visual illustration',
      'profoundly epitomizes the paramount significance of...',
      'Diverse factors combine to account for this thought-provoking phenomenon',
      'imperceptibly eroded their capacity for...',
      'it is imperative that concerted endeavors be orchestrated',
      'Only through these concerted endeavors can we embrace a prosperous future',
    ],
  },

  // --- 英语二大作文：经典图表分析议论文 ---
  {
    id: 'big_essay_chart_analysis',
    title: '英语二 · 图表数据对比与趋势剖析三段式典范模板',
    examType: 'english_2',
    category: 'big_chart',
    typeLabel: '英语二 · 图表作文',
    topic: '居民消费结构变化/新能源汽车销量暴增/考研就业意向/在线教育与阅读趋势',
    description: '英语二柱状图、折线图、饼状图的杀手级模板：精准数据引述与极值描摹 -> 深度社会经济动因探究 -> 未来演进趋势预判。',
    structure: [
      {
        sectionName: '第一段：精确描述图表数据与动态走势 (约 45 词)',
        purpose: '交代图表标题 + 引述峰值与上升/下降趋势',
        templateText: 'The bar chart above clearly illustrates the striking changes in [Topic: e.g. the market share of new energy vehicles in China from 2018 to 2024]. Specifically, during this period, the figure witnessed a dramatic ascension, surging impressively from [Starting Data: e.g. 5.2%] in 2018 to [Peak Data: e.g. 38.6%] in 2024. In stark contrast, [Contrast Data: e.g. traditional fossil-fuel vehicles underwent a steady downward trajectory].',
        translation: '上述柱状图清晰揭示了[主题：2018至2024年间中国新能源汽车市场份额]的显著演变。具体而言，在此期间该数据经历了大幅跃升，令人瞩目地从2018年的[初始数据：5.2%]激增至2024年的[峰值数据：38.6%]。与之形成鲜明对照的是，[对比数据：传统燃油车则呈现持续平稳的下行轨迹]。',
        placeholderHints: [
          '趋势动词：witnessed a dramatic ascension / underwent a sharp plummet',
          '极值表达：peaked at an unprecedented high of...',
        ],
      },
      {
        sectionName: '第二段：深度剖析数据背后的核心驱动机制 (约 85 词)',
        purpose: '从政策支持、技术成熟、消费认知等维度层层拆解原因',
        templateText: 'A myriad of intertwining forces have contributed to the remarkable transformation mirrored in the graph. First of all, the favorable governmental policies and subsidies have injected potent momentum into this sector. Moreover, continuous technological breakthroughs have drastically enhanced product reliability and cost-effectiveness. In addition, the paradigm shift in consumer consciousness—characterized by a growing preference for green, sustainable lifestyles—has likewise spurred this exponential expansion.',
        translation: '千丝万缕的合力共同促成了图表中所映照的惊人变革。首先，优惠的政府产业政策与财政补贴为该领域注入了强劲动力；再者，持续的技术突破极大地增强了产品的可靠性与性价比；此外，消费者观念的范式跃迁——以日益青睐绿色、可持续的生活方式为标志——同样驱动了这一指数级的扩张。',
        placeholderHints: [
          '原因连接词：First of all / Moreover / In addition / Last but not least',
          '驱动力：injected potent momentum into... / paradigm shift in consumer consciousness',
        ],
      },
      {
        sectionName: '第三段：科学总结与未来走向预判 (约 40 词)',
        purpose: '概括核心结论 + 对未来走向进行前瞻预估',
        templateText: 'Taking all these elements into consideration, we can arrive at the sensible conclusion that this upward momentum is bound to persist in the foreseeable future. With the further maturation of relevant industries, this healthy trend will undoubtedly foster more profound socioeconomic vitality.',
        translation: '综合考量所有这些要素，我们可得出合乎理性的结论：这一上扬势头在可预见的未来必将延续。伴随着相关产业的进一步成熟，这一良性态势无疑将孕育出更深远的社会经济生机。',
        placeholderHints: [
          '预判结语：this momentum is bound to persist in the foreseeable future',
          '升华点睛：foster more profound socioeconomic vitality',
        ],
      },
    ],
    highlightPhrases: [
      'The bar chart above clearly illustrates the striking changes in...',
      'witnessed a dramatic ascension, surging impressively from... to...',
      'In stark contrast, ... underwent a steady downward trajectory',
      'A myriad of intertwining forces have contributed to...',
      'injected potent momentum into this sector',
      'paradigm shift in consumer consciousness',
      'this upward momentum is bound to persist in the foreseeable future',
    ],
  },
]

// -------------------------------------------------------------
// 2. 考研英语高分万能金句集 (按功能分类，即拷即用)
// -------------------------------------------------------------
export const ESSAY_GOLDEN_SENTENCES: GoldenSentence[] = [
  {
    id: 'gold_open_1',
    category: 'opening',
    categoryLabel: '首段引出',
    sentence: 'As the renowned philosopher Bacon once insightfully observed, nothing can replace genuine perseverance and continuous pursuit of excellence.',
    translation: '正如著名哲学家培根曾富有洞见地指出的那样，没有任何事物能替代真正的毅力与对卓越的执着追求。',
    difficulty: '高分闪光',
    grammarHighlight: '名言引用结构 + 并列名词短语作宾语',
  },
  {
    id: 'gold_open_2',
    category: 'opening',
    categoryLabel: '首段引出',
    sentence: 'There is a burgeoning consensus in contemporary society that [Topic/Idea] plays an indispensable role in shaping one\'s character.',
    translation: '在当代社会中，人们正日益达成一项广泛共识：[主题/观点]在塑造一个人的品格方面发挥着不可或缺的作用。',
    difficulty: '黄金万能',
    grammarHighlight: 'There is a burgeoning consensus that 同位语从句',
  },
  {
    id: 'gold_data_1',
    category: 'data_analysis',
    categoryLabel: '图表数据描摹',
    sentence: 'The statistical data displays an eye-catching disparity between Group A and Group B, with the former dramatically outnumbering the latter by a staggering margin of 45%.',
    translation: '统计数据展现出了A组与B组之间格外引人注目的悬殊差异，前者以高达45%的惊人幅度大幅领先于后者。',
    difficulty: '高分闪光',
    grammarHighlight: 'with 复合结构作伴随状语 + 极值修饰语',
  },
  {
    id: 'gold_data_2',
    category: 'data_analysis',
    categoryLabel: '图表数据描摹',
    sentence: 'Following a period of moderate fluctuation, the figures skyrocketed to an unprecedented pinnacle in the subsequent decades.',
    translation: '在经历了一段温和波动之后，该数据在接下来的几十年间一路飙升至前所未有的峰值。',
    difficulty: '黄金万能',
    grammarHighlight: '介词短语前置状语 + 动词生动拟态 (skyrocketed)',
  },
  {
    id: 'gold_cause_1',
    category: 'cause_effect',
    categoryLabel: '多维深度归因',
    sentence: 'Behind this seemingly perplexing phenomenon lies a profound shift in people\'s psychological expectations and socioeconomic priorities.',
    translation: '在这一看似令人费解的现象背后，潜藏着人们心理预期与社会经济考量重点的深刻转变。',
    difficulty: '高分闪光',
    grammarHighlight: '介词短语提前之完全倒装结构 (强化句式多样性)',
  },
  {
    id: 'gold_cause_2',
    category: 'cause_effect',
    categoryLabel: '多维深度归因',
    sentence: 'It is the unbridled expansion of modern technology coupled with the absence of adequate supervision that has precipitated this quandary.',
    translation: '正是现代技术的无节制扩张，加之充分监管的缺失，共同促成了眼下的这一窘境。',
    difficulty: '高分闪光',
    grammarHighlight: 'It is ... that 强调句型 + 伴随介词短语',
  },
  {
    id: 'gold_sol_1',
    category: 'solution',
    categoryLabel: '对策建议倡议',
    sentence: 'It is high time that both the administration and the public joined hands to cultivate a more propitious atmosphere for wholesome development.',
    translation: '现在正是管理层与公众携手同行、为健康发展培育更加有利氛围的关键时刻。',
    difficulty: '黄金万能',
    grammarHighlight: 'It is high time that + 虚拟过去式 (joined hands)',
  },
  {
    id: 'gold_conc_1',
    category: 'conclusion',
    categoryLabel: '尾段升华展望',
    sentence: 'Only when we strike an optimal balance between material affluence and spiritual elevation can we truly construct a harmonious civilization.',
    translation: '唯有当我们在物质富足与精神升华之间谋求得一种最佳平衡之时，我们方能真正构建起一座和谐的文明大厦。',
    difficulty: '高分闪光',
    grammarHighlight: 'Only when ... 部分倒装句 (can we truly construct)',
  },
]

// -------------------------------------------------------------
// 3. 考研英语历年真题精读与长难句剖析库
// -------------------------------------------------------------
export const ENGLISH_PAST_PAPERS: PastPaperReading[] = [
  {
    id: 'reading_2023_text1',
    year: 2023,
    examType: '英语一',
    source: '考研英语(一) 2023年 阅读理解 Text 1',
    title: 'The Evolution of Modern Automation and the Rebirth of Artisanal Craftsmanship',
    summary: '文章探讨在人工智能与工业高度自动化的时代浪潮下，人们对带有手工温情与独特匠心制品的反向渴求，剖析手工艺复兴背后的深层消费心理学。',
    paragraphs: [
      {
        paraIndex: 1,
        sentences: [
          {
            en: 'In an era where algorithmic efficiency reigns supreme, an unexpected counter-current is quietly gaining traction: the resurgence of artisanal craftsmanship.',
            zh: '在算法效率至高无上的时代，一股意料之外的逆流正悄然汇聚成势：传统手工艺的再度复兴。',
            isHardSentence: true,
            hardAnalysis: '句式拆解：复合句结构。主干为 an unexpected counter-current is quietly gaining traction。开头 where 引导定语从句修饰 an era；冒号后为名词短语作同位语解释 counter-current。',
            keyWords: [
              { word: 'algorithmic', meaning: 'adj. 算法的' },
              { word: 'reigns supreme', meaning: '称霸，占据主导地位' },
              { word: 'gain traction', meaning: '获得动力，流行开来' },
              { word: 'artisanal', meaning: 'adj. 手工艺的' },
            ],
          },
          {
            en: 'Consumers, weary of cookie-cutter mass production, increasingly yearn for objects imbued with individual narrative and human touch.',
            zh: '厌倦了千篇一律的大规模流水线生产的消费者，愈发渴望拥有浸润着个人叙事与人类温度的造物。',
            isHardSentence: true,
            hardAnalysis: '句式拆解：主语 Consumers 后面紧跟形容词短语 weary of... 作后置定语；谓语为 yearn for；宾语 objects 带有过去分词短语 imbued with... 作后置定语。',
            keyWords: [
              { word: 'weary of', meaning: '厌倦...的' },
              { word: 'cookie-cutter', meaning: '千篇一律的' },
              { word: 'imbued with', meaning: '充满，灌注有' },
            ],
          },
        ],
      },
      {
        paraIndex: 2,
        sentences: [
          {
            en: 'This shift reflects more than mere nostalgia; it underscores an acute psychological need to re-anchor ourselves in a digitized world that often feels detached and disembodied.',
            zh: '这一转变所反映的绝非仅仅是怀旧情绪；它凸显了一种迫切的心理需求，即在一个往往令人感到抽离与虚无的数字化世界中，重新锚定我们自身。',
            isHardSentence: true,
            hardAnalysis: '句式拆解：分号连接两个并列分句。后半句主干为 it underscores an acute psychological need；不定式 to re-anchor... 作 need 的同位语；that often feels... 为限制性定语从句修饰 a digitized world。',
            keyWords: [
              { word: 'nostalgia', meaning: 'n. 怀旧，乡愁' },
              { word: 'underscore', meaning: 'v. 强调，凸显' },
              { word: 'acute', meaning: 'adj. 敏锐的，迫切的' },
              { word: 'detached', meaning: 'adj. 抽离的，超然的' },
            ],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'q_2023_1_1',
        stem: 'According to Paragraph 1, the revival of artisanal craftsmanship is primarily driven by ______.',
        options: {
          A: 'the decline of algorithmic innovation',
          B: 'consumers\' weariness with standardized products',
          C: 'governmental incentives for manual workers',
          D: 'the rising production costs of industrial assembly',
        },
        answer: 'B',
        analysis: '定位至第一段第2句：“Consumers, weary of cookie-cutter mass production, increasingly yearn for objects...”。cookie-cutter 即等同于 standardized（标准化的），weary of 对应 weariness。故选 B。',
        questionType: '细节理解',
      },
    ],
  },
]
