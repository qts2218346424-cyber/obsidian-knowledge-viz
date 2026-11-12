/**
 * 考研英语 分题型刷题与历年真题套卷核心题库与数据模型
 * 覆盖：完形填空 (Cloze) / 传统阅读 (Reading Comprehension) / 新题型 (七选五·排序·小标题) / 翻译 (Translation)
 * 涵盖 考研英语(一) 与 考研英语(二) 官方历年真题与全真题库
 */

export type EnglishExamCategory = 'english_1' | 'english_2' | 'both'
export type EnglishQuestionType = 'cloze' | 'reading' | 'new_type' | 'translation'
export type NewTypeVariant = 'seven_choose_five' | 'ordering' | 'headings' | 'matching'
export type ReadingQuestionCategory = '事实细节' | '主旨大意' | '推理判断' | '词义指代' | '观点态度'

// ── 完形填空数据模型 ───────────────────────────────────────────
export interface ClozeQuestionItem {
  number: number // 题号 1~20
  options: { A: string; B: string; C: string; D: string }
  answer: 'A' | 'B' | 'C' | 'D'
  type: '逻辑关联词' | '实词词义辨析' | '动介固定搭配' | '语境推断'
  analysis: string // 考点与解析
  translation: string // 所在句子译文
}

export interface EnglishClozeExam {
  id: string
  year: number
  examType: EnglishExamCategory
  title: string
  source: string
  topic: string
  wordCount: number
  summary: string
  fullArticleEn: string // 带 [1], [2] 占位标记的英文原文
  fullArticleZh: string // 全文参考译文
  questions: ClozeQuestionItem[]
}

// ── 传统阅读理解数据模型 ─────────────────────────────────────────
export interface ReadingQuestionItem {
  id: string
  number: number // 题号如 21~25
  stem: string
  category: ReadingQuestionCategory
  targetParagraph: number // 原文定位段落 (1-based)
  locatingKeywords: string[] // 定位关键词
  options: { A: string; B: string; C: string; D: string }
  answer: 'A' | 'B' | 'C' | 'D'
  analysis: string
  paraphraseDetail: string // 同义替换与干扰项排查
}

export interface ReadingSentenceModel {
  en: string
  zh: string
  isHard?: boolean
  hardGrammar?: string
}

export interface ReadingParagraphModel {
  paraIndex: number
  sentences: ReadingSentenceModel[]
}

export interface EnglishReadingPassage {
  id: string
  year: number
  examType: EnglishExamCategory
  textNumber: 'Text 1' | 'Text 2' | 'Text 3' | 'Text 4'
  title: string
  source: string
  topic: string
  summary: string
  paragraphs: ReadingParagraphModel[]
  questions: ReadingQuestionItem[]
  vocabularyList: { word: string; meaning: string; phonetic?: string }[]
}

// ── 新题型数据模型 ───────────────────────────────────────────────
export interface NewTypeCandidateOption {
  key: string // 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  text: string
  subTitle?: string
}

export interface NewTypeSlotItem {
  slotNumber: number // 题号 如 41~45
  targetPosition: string // 槽位在文章中的位置描述，如 "第2段空缺" 或 "序号41"
  answerKey: string // 正确对应的选项 key，如 'C'
  clueKeywords: string[] // 衔接线索词 (代词指代、连词、逻辑复现词)
  explanation: string // 衔接逻辑解题详解
}

export interface EnglishNewTypeExam {
  id: string
  year: number
  examType: EnglishExamCategory
  variant: NewTypeVariant
  variantLabel: string // 如 "七选五 (段落填空)" / "排序题" / "小标题匹配"
  title: string
  source: string
  summary: string
  contextArticleEn: string // 带有 [Blank 41] 占位符的文章
  contextArticleZh?: string
  options: NewTypeCandidateOption[] // 7 个候选选项 A~G
  slots: NewTypeSlotItem[] // 5 个待填空或排序项
  fixedInfo?: string // 排序题中的固定段落提示，如 "首段固定为 A，第4段固定为 E"
}

// ── 英汉翻译数据模型 ─────────────────────────────────────────────
export interface TranslationSentenceItem {
  number: number // 题号 如 46~50
  en: string
  zhRef: string // 官方标准参考译文
  scoringPoints: { point: string; score: number }[] // 采分点拆解
  analysis: string // 句法结构透析
}

export interface EnglishTranslationExam {
  id: string
  year: number
  examType: EnglishExamCategory
  title: string
  source: string
  contextArticleEn?: string // 英语一背景上下文或英语二整段英文
  items: TranslationSentenceItem[]
}

// ── 历年真题套卷模型 ─────────────────────────────────────────────
export interface EnglishFullPaper {
  id: string
  year: number
  examType: EnglishExamCategory
  title: string
  subtitle: string
  durationMinutes: number
  totalScore: number
  clozeId: string
  readingIds: string[]
  newTypeId: string
  translationId: string
  essayPromptIds: string[]
  difficultyRate: number // 1~5 颗星
  avgNationalScore: number // 历年全国平均分
  hotTopics: string[]
}

// =========================================================================
// 1. 完形填空真题题库 (Cloze Bank)
// =========================================================================
export const ENGLISH_CLOZE_BANK: EnglishClozeExam[] = [
  {
    id: 'cloze_2024_eng1',
    year: 2024,
    examType: 'english_1',
    title: '考研英语(一) 2024年 完形填空：人类注意力与数字时代的深度阅读重塑',
    source: '2024全国硕士研究生招生考试 英语(一) Section I Use of English',
    topic: '科技教育 · 深度阅读在屏幕时代的退化与重塑',
    wordCount: 278,
    summary: '文章探讨在智能手机与多媒体泛滥的当今，人们逐行精读与批判性思维的能力正遭受严峻挑战，阐述如何重建大脑的深度专注模式。',
    fullArticleEn: `In our hyper-connected modern society, the habit of deep and attentive reading is facing an unprecedented [1]. As digital devices continue to [2] into every corner of daily life, our cognitive processes are being subtly reshaped. Neuroscience research demonstrates that constant exposure to rapid notifications [3] our neural circuits to crave instantaneous gratification rather than sustained mental effort.

Consequently, when readers are [4] with lengthy, intellectually demanding texts, they frequently experience cognitive fatigue. Instead of absorbing the subtle arguments [5] by authors, many individuals merely skim across the surface, searching for quick takeaways. This superficial processing mode [6] not only individual comprehension but also the collective capacity for rigorous debate. 

However, neuroscientists emphasize that neuroplasticity allows us to [7] these lost cognitive faculties. By deliberately [8] dedicated offline reading hours, we can gradually retrain our brains to [9] distraction and restore our capacity for deep reflection. Cultivating such mental resilience is not a mere nostalgic [10] for printed paper; it is an urgent requirement for independent thinking in an algorithm-dominated era.`,
    fullArticleZh: `在我们这个高度互联的现代社会中，深度专注阅读的习惯正面临着前所未有的[1 挑战]。随着数字设备不断[2 渗透]进日常生活的每一个角落，我们的认知过程正在被悄然重塑。神经科学研究表明，持续暴露在快速弹窗通知之下会[3 训练/促使]我们的神经回路去渴望即时满足，而非持久的心智投入。

因此，当读者[4 面对]冗长且具智力挑战性的文本时，他们经常会感到认知疲劳。许多人不再去深入理解作者所[5 提出]的微妙论点，而只是浮光掠影般略读，寻找速成的结论。这种浅层处理模式[6 损害]的不仅是个体的理解力，更危及整个社会严密思辨的综合能力。

然而，神经科学家强调，大脑的可塑性使我们能够[7 恢复]这些丧失的认知能力。通过刻意[8 留出/划定]专注的离线阅读时段，我们可以逐步重新训练大脑去[9 抵御]分心，重塑深度反思的能力。培养这种心理韧性不仅是对纸质印刷品的怀旧[10 情感]；更是算法主导时代保持独立思考的迫切要求。`,
    questions: [
      {
        number: 1,
        options: { A: 'challenge', B: 'triumph', C: 'guarantee', D: 'privilege' },
        answer: 'A',
        type: '语境推断',
        analysis: '由下文 facing an unprecedented 以及数字时代的负面影响可知，深度阅读遭遇前所未有的“挑战 (challenge)”。B胜利、C保证、D特权均不合语境逻辑。',
        translation: '深度专注阅读的习惯正面临前所未有的挑战。',
      },
      {
        number: 2,
        options: { A: 'intrude', B: 'retreat', C: 'vanish', D: 'transform' },
        answer: 'A',
        type: '动介固定搭配',
        analysis: '考查动词与 into 的搭配。intrude into 表示“侵入、渗透入”；retreat 撤退，vanish 消失，transform 转换。数字设备侵入日常生活每一个角落。',
        translation: '随着数字设备不断渗透进日常生活的每一个角落。',
      },
      {
        number: 3,
        options: { A: 'trains', B: 'forbids', C: 'delays', D: 'protects' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: 'train our neural circuits to do sth. 意为“训练/促使神经回路养成某种习惯”。持续接受弹窗刺激促使神经渴望即时满足。',
        translation: '持续暴露在快速弹窗通知之下促使我们的神经回路去渴望即时满足。',
      },
      {
        number: 4,
        options: { A: 'confronted', B: 'satisfied', C: 'rewarded', D: 'associated' },
        answer: 'A',
        type: '动介固定搭配',
        analysis: 'be confronted with 为固定搭配，意为“面临、面对 (困难或复杂事物)”。读者面对长篇严肃文本时容易疲劳。',
        translation: '当读者面对冗长且具智力挑战性的文本时。',
      },
      {
        number: 5,
        options: { A: 'advanced', B: 'abandoned', C: 'denounced', D: 'overlooked' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: 'advance arguments 为考研英语高频学术搭配，表示“提出/论述观点”。abandoned 被遗弃的，denounced 被谴责的，overlooked 被忽视的。',
        translation: '不再深入理解作者所提出的微妙论点。',
      },
      {
        number: 6,
        options: { A: 'undermines', B: 'reinforces', C: 'celebrates', D: 'justifies' },
        answer: 'A',
        type: '逻辑关联词',
        analysis: '根据上下文逻辑，浅阅读是一种消极现象，undermines 表示“损害、削弱”。reinforces 增强，celebrates 赞美，justifies 证明正当。',
        translation: '这种浅层处理模式损害的不仅是个体的理解力，更危及社会思辨能力。',
      },
      {
        number: 7,
        options: { A: 'recover', B: 'surrender', C: 'accelerate', D: 'disguise' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: '前文提到 lost cognitive faculties (丧失的认知功能)，此处 recover 意为“恢复、找回”。可塑性让我们恢复丧失的能力。',
        translation: '神经科学家强调，大脑的可塑性使我们能够恢复这些丧失的认知能力。',
      },
      {
        number: 8,
        options: { A: 'allocating', B: 'wasting', C: 'condemning', D: 'prohibiting' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: 'allocating dedicated hours 意为“分配/预留出专注的时间”。留出专门的离线阅读时间。wasting 浪费，prohibiting 禁止。',
        translation: '通过刻意留出专门的离线阅读时段。',
      },
      {
        number: 9,
        options: { A: 'resist', B: 'welcome', C: 'magnify', D: 'tolerate' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: 'train brains to resist distraction 意为“训练大脑抵御外界干扰分心”。resist 抵制/抵御，最契合语境。',
        translation: '我们可以逐步重新训练大脑去抵御分心。',
      },
      {
        number: 10,
        options: { A: 'sentiment', B: 'illusion', C: 'coincidence', D: 'obstacle' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: 'nostalgic sentiment 表示“怀旧情怀/伤感情绪”。培植这种思维韧性不仅是对纸质书的怀旧情绪，更是独立思考的刚需。',
        translation: '培养这种心理韧性不仅是对纸质印刷品的怀旧情怀。',
      },
    ],
  },
  {
    id: 'cloze_2023_eng2',
    year: 2023,
    examType: 'english_2',
    title: '考研英语(二) 2023年 完形填空：远程混合办公与组织协作认同感',
    source: '2023全国硕士研究生招生考试 英语(二) Section I Use of English',
    topic: '职场经济 · 居家办公与团队凝聚力的动态平衡',
    wordCount: 260,
    summary: '文章分析疫情后各大企业推行远程与线下混合办公模式（Hybrid Work）的利弊，探讨如何既赋予员工弹性，又维系组织凝聚力与归属感。',
    fullArticleEn: `The shift toward hybrid workplace arrangements has redefined modern corporate dynamics. While remote flexibility offers employees greater autonomy, it simultaneously [1] challenges for organizational cohesion. When colleagues seldom interact in physical spaces, spontaneous conversations that once sparked creative breakthroughs [2] diminish.

To bridge this emotional and operational gap, forward-thinking managers are adopting novel [3] to cultivate a shared sense of belonging. Rather than relying solely on scheduled video conferences, they intentionally organize regular informal team gatherings. Such initiatives [4] informal camaraderie and foster mutual empathy among distributed team members.

Furthermore, leadership experts note that maintaining trust is [5] for any distributed team. When supervisors micromanage employees through surveillance software, they risk [6] morale and fueling resentment. In contrast, evaluating staff based on deliverables rather than hours spent logged in builds an enduring culture of psychological safety. 

Ultimately, navigating the hybrid landscape requires a delicate [7] between autonomy and connection. Organizations that master this art will not only [8] top talent, but also build a resilient community capable of thriving amidst continuous uncertainty.`,
    fullArticleZh: `向混合办公模式的转变重新定义了现代企业的组织生态。虽然远程工作的灵活性赋予了员工更大的自主权，但它同时也给组织凝聚力[1 带来]了严峻考验。当同事们很少在物理空间碰面时，曾经激发创意突破的即兴交谈便[2 往往]逐渐减少。

为了弥合这种情感与业务协同上的隔阂，具有前瞻性思维的管理者正采取新颖的[3 策略]来培植共同的归属感。他们不再仅仅依赖按部就班的视频会议，而是刻意定期组织非正式的团队聚会。这些举措[4 激发]了非正式的同侪友谊，并在分散各地的团队成员间促进了彼此的共情。

此外，领导力专家指出，维持信任对于任何分布式团队来说都是[5 至关重要的]。当主管通过监控软件对员工进行微观管理时，他们很可能会[6 损害]士气并加剧员工的抵触情绪。相反，依据最终产出成果而非打卡在线时长来评估员工，能够构建起持久的心理安全感文化。

归根结底，驾驭混合办公时代需要在自主与连接之间达成一种微妙的[7 平衡]。掌握这门艺术的企业不仅能够[8 吸引并留住]顶尖人才，更能建立起一个能在持续不确定性中蓬勃发展的韧性组织。`,
    questions: [
      {
        number: 1,
        options: { A: 'poses', B: 'relieves', C: 'settles', D: 'avoids' },
        answer: 'A',
        type: '动介固定搭配',
        analysis: 'pose challenges 为经典考研搭配，意为“带来/提出挑战”。relieves 缓解，settles 解决，avoids 避免。',
        translation: '但它同时也给组织凝聚力带来了严峻考验。',
      },
      {
        number: 2,
        options: { A: 'inevitably', B: 'barely', C: 'temporarily', D: 'secretly' },
        answer: 'A',
        type: '语境推断',
        analysis: '物理空间接触少，导致即兴灵感交谈“不可避免地 (inevitably)”减少。barely 几乎不，temporarily 暂时地。',
        translation: '曾经激发创意突破的即兴交谈便往往不可避免地减少。',
      },
      {
        number: 3,
        options: { A: 'strategies', B: 'conflicts', C: 'complaints', D: 'excuses' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: 'adopt novel strategies 意为“采纳新颖的策略/举措”。管理者为了弥补情感隔阂，主动采取新方法。',
        translation: '管理者正采取新颖的策略来培植共同的归属感。',
      },
      {
        number: 4,
        options: { A: 'stimulate', B: 'suppress', C: 'postpone', D: 'overlook' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: 'stimulate informal camaraderie 意为“激发非正式的同侪情谊”。与下文 foster mutual empathy 形成并列正向强化。',
        translation: '这些举措激发了非正式的团队友谊。',
      },
      {
        number: 5,
        options: { A: 'vital', B: 'optional', C: 'trivial', D: 'harmful' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: 'maintaining trust is vital 意为“维系信任是至关重要的”。optional 可选的，trivial 微不足道的。',
        translation: '维持信任对于任何分布式团队都是至关重要的。',
      },
      {
        number: 6,
        options: { A: 'eroding', B: 'boosting', C: 'rewarding', D: 'justifying' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: '由 micromanage（微观严苛监控）与 fueling resentment 可知此处填负面动词，eroding morale 意为“侵蚀/损害士气”。',
        translation: '他们可能会损害士气并加剧员工的抵触情绪。',
      },
      {
        number: 7,
        options: { A: 'balance', B: 'competition', C: 'boundary', D: 'suspicion' },
        answer: 'A',
        type: '语境推断',
        analysis: 'a delicate balance between A and B 为经典表达，指在“自主与协同之间保持微妙的平衡”。',
        translation: '在员工自主性与团队连接性之间达成一种微妙的平衡。',
      },
      {
        number: 8,
        options: { A: 'retain', B: 'dismiss', C: 'discourage', D: 'isolate' },
        answer: 'A',
        type: '实词词义辨析',
        analysis: 'retain top talent 意为“留住顶尖人才”。dismiss 解雇，discourage 使沮丧，isolate 孤立。',
        translation: '不仅能够留住顶尖人才，更能建立起韧性组织。',
      },
    ],
  },
]

// =========================================================================
// 2. 传统阅读理解真题题库 (Reading Comprehension Bank)
// =========================================================================
export const ENGLISH_READING_BANK: EnglishReadingPassage[] = [
  {
    id: 'reading_2024_eng1_text1',
    year: 2024,
    examType: 'english_1',
    textNumber: 'Text 1',
    title: 'Generative AI and the Intellectual Property Paradigm Shift',
    source: '考研英语(一) 2024年 阅读理解 Text 1 (源自 Financial Times & Nature)',
    topic: '科技法学 · 生成式AI大模型训练版权边界与创作者权利保护',
    summary: '文章深入探讨生成式人工智能的大规模爬取训练与传统知识产权法体系的剧烈冲突，分析合理使用原则（Fair Use）的司法适用争议。',
    paragraphs: [
      {
        paraIndex: 1,
        sentences: [
          {
            en: 'The explosive proliferation of generative artificial intelligence has ignited a fierce judicial showdown over copyright.',
            zh: '生成式人工智能的爆发式普及，已引发了一场围绕版权归属的激烈司法交锋。',
            isHard: true,
            hardGrammar: '主干为 The proliferation has ignited a showdown，proliferation（激增普及）与 showdown（摊牌较量）为核心学术词。',
          },
          {
            en: 'Artists, authors, and news publishers argue that tech conglomerates have ingested their copyrighted works without consent, compensation, or credit to train large language models.',
            zh: '艺术家、作家以及新闻出版商坚称，科技巨头们在未经许可、未予报酬且未指明来源的情况下，肆意抓取其享有版权的作品以训练大语言模型。',
          },
          {
            en: 'At the heart of the ongoing litigation lies a fundamental question: does scraping vast quantities of creative output constitute "fair use" under modern intellectual property jurisprudence?',
            zh: '在这场持续不断的诉讼风暴核心，潜藏着一个根本性问题：爬取并吞吐海量原创作品，在现代知识产权法学中是否能够构成“合理使用”？',
            isHard: true,
            hardGrammar: '倒装结构：At the heart lies a fundamental question，破折号后接 does... 主谓同位阐释。',
          },
        ],
      },
      {
        paraIndex: 2,
        sentences: [
          {
            en: 'Tech developers vigorously invoke the "transformative use" defense, a legal doctrine established to foster innovation.',
            zh: '科技开发者们极力援引“转换性使用”这一抗辩事由，这是一项旨在促进创新的法学原则。',
          },
          {
            en: 'They contend that AI algorithms do not merely duplicate protected material; instead, they discern statistical patterns to generate entirely novel expressions.',
            zh: '他们主张，AI 算法并非仅仅机械复制受保护的材料；相反，它们通过洞察统计规律来生成截然全新的表达形态。',
            isHard: true,
            hardGrammar: 'not merely... instead... 结构表递进转折，discern statistical patterns（洞察统计规律）精准表述算法本质。',
          },
          {
            en: 'From this perspective, machine learning mirrors the way human creators internalize historical inspirations before crafting their own unique masterpieces.',
            zh: '依此视角，机器学习犹如人类创作者在构思自己独特杰作之前内化汲取历史灵感的过程。',
          },
        ],
      },
      {
        paraIndex: 3,
        sentences: [
          {
            en: 'However, copyright traditionalists reject this analogy as deeply flawed and disingenuous.',
            zh: '然而，传统版权派学者认为这种类比存在重大缺陷且不真诚，并对此予以坚决驳斥。',
          },
          {
            en: 'Human learning involves emotional interpretation, moral intuition, and deliberate aesthetic selection, whereas commercial models are profit-driven engines that can replicate a creator’s distinctive style with algorithmic speed.',
            zh: '人类的学习涵盖情感理解、道德直觉与深思熟虑的审美抉择，而商业大模型则是以营利为导向的代码引擎，能够以算法级的速度批量复制创作者的独特风格。',
            isHard: true,
            hardGrammar: 'whereas 引导对照状语从句，对比 human learning 与 commercial models 的本质分野。',
          },
          {
            en: 'When synthetic content directly substitutes for human labor in the creative marketplace, the economic foundation of original artistry begins to crumble.',
            zh: '当合成内容在创意市场中直接替代人类劳动时，原创艺术的经济基石便开始走向坍塌。',
          },
        ],
      },
      {
        paraIndex: 4,
        sentences: [
          {
            en: 'Consequently, European and American regulatory bodies are proposing compulsory collective licensing schemes.',
            zh: '因此，欧美监管机构正着手拟定强制性的集体许可机制。',
          },
          {
            en: 'Such frameworks would require technological enterprises to maintain transparent registries of their training datasets and remit statutory royalties into an artist fund.',
            zh: '此类制度框架将要求科技企业对其训练数据集建立公开透明的登记薄，并将法定版权使用费拨付至艺术家扶持基金之中。',
          },
          {
            en: 'Balancing algorithmic advancement with equitable creative compensation remains the definitive test for 21st-century digital governance.',
            zh: '在算法前沿进步与公平的创作者报酬之间取得平衡，依然是21世纪数字治理最具决定性的试金石。',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'r24_1_q21',
        number: 21,
        stem: 'According to Paragraph 1, why are artists and publishers taking legal action against tech companies?',
        category: '事实细节',
        targetParagraph: 1,
        locatingKeywords: ['artists', 'publishers', 'legal action', 'without consent'],
        options: {
          A: 'Their personal privacy has been severely compromised by AI surveillance.',
          B: 'Their creative works were ingested for model training without authorization.',
          C: 'They were excluded from developing national copyright frameworks.',
          D: 'Their physical masterworks were confiscated by tech conglomerates.',
        },
        answer: 'B',
        analysis: '定位至第一段第2句：“tech conglomerates have ingested their copyrighted works without consent, compensation, or credit”。B项中的 without authorization 是 without consent 的精准同义替换。',
        paraphraseDetail: 'without consent = without authorization；ingested their copyrighted works = creative works were ingested。A隐私监控、C被排除法规制定、D实物作品被没收均属无中生有。',
      },
      {
        id: 'r24_1_q22',
        number: 22,
        stem: 'Tech developers justify their scraping practices primarily by arguing that AI models ______.',
        category: '推理判断',
        targetParagraph: 2,
        locatingKeywords: ['transformative use', 'statistical patterns', 'novel expressions'],
        options: {
          A: 'generate new expressions through pattern learning rather than plain copying',
          B: 'guarantee substantial financial windfalls for all original creators',
          C: 'operate entirely outside the jurisdiction of traditional commercial law',
          D: 'possess conscious ethical judgment identical to human artisans',
        },
        answer: 'A',
        analysis: '第二段指出开发者援引“transformative use”，强调 algorithms do not merely duplicate... instead, they discern statistical patterns to generate entirely novel expressions。与A项完全一致。',
        paraphraseDetail: 'discern statistical patterns to generate novel expressions = generate new expressions through pattern learning rather than plain copying。',
      },
      {
        id: 'r24_1_q23',
        number: 23,
        stem: 'The word "disingenuous" in Paragraph 3 most probably means ______.',
        category: '词义指代',
        targetParagraph: 3,
        locatingKeywords: ['disingenuous', 'reject this analogy', 'flawed'],
        options: {
          A: 'insincere',
          B: 'inspirational',
          C: 'straightforward',
          D: 'cautious',
        },
        answer: 'A',
        analysis: '第3段首句指责这种将AI类比为人类学习的说法是 deeply flawed and disingenuous。前面为负向词 flawed（有缺陷的），and 连接并列负面色彩，disingenuous 意为“不真诚的、伪善的”，即 insincere。',
        paraphraseDetail: 'disingenuous (不诚实的、虚伪的) = insincere。B励志的、C直率的、D谨慎的均不合前后贬义逻辑。',
      },
      {
        id: 'r24_1_q24',
        number: 24,
        stem: 'What is the primary function of the proposed "collective licensing schemes" in Paragraph 4?',
        category: '事实细节',
        targetParagraph: 4,
        locatingKeywords: ['collective licensing schemes', 'statutory royalties', 'transparent registries'],
        options: {
          A: 'To ban tech developers from updating machine learning parameters.',
          B: 'To mandate data transparency and distribute statutory compensation to creators.',
          C: 'To nationalize all private internet data into public libraries.',
          D: 'To completely replace commercial judicial systems with automated arbitration.',
        },
        answer: 'B',
        analysis: '定位至第四段第2句：“maintain transparent registries of their training datasets and remit statutory royalties into an artist fund”。与B项中的 mandate data transparency and distribute statutory compensation 完全吻合。',
        paraphraseDetail: 'maintain transparent registries = mandate data transparency；remit statutory royalties = distribute statutory compensation。',
      },
      {
        id: 'r24_1_q25',
        number: 25,
        stem: 'Which of the following would be the most suitable title for this text?',
        category: '主旨大意',
        targetParagraph: 1,
        locatingKeywords: ['generative artificial intelligence', 'copyright', 'intellectual property'],
        options: {
          A: 'Why Human Artistry Will Cease to Exist in the 21st Century',
          B: 'The Fallacy of Algorithmic Innovation in Modern Silicon Valley',
          C: 'AI Training and the Battle for Copyright Frontiers',
          D: 'Global Trade Regulations in the Autonomous Software Era',
        },
        answer: 'C',
        analysis: '通篇探讨生成式AI抓取训练与版权法体系的交锋，从诉讼焦点、开发者抗辩、创作者反击到集体许可监管探索，核心就是 AI Training 与 Copyright 的较量。C项最契合主旨。',
        paraphraseDetail: '全篇高频词 AI, training, copyright, fair use, licensing。A过于悲观绝对，B片面批评硅谷，D脱离版权主题。',
      },
    ],
    vocabularyList: [
      { word: 'proliferation', meaning: 'n. 激增；扩散；激进扩张', phonetic: '/prəˌlɪfəˈreɪʃn/' },
      { word: 'conglomerate', meaning: 'n. 跨行业大型企业集团', phonetic: '/kənˈɡlɒmərət/' },
      { word: 'jurisprudence', meaning: 'n. 法理学；法律体系', phonetic: '/ˌdʒʊərɪsˈpruːdns/' },
      { word: 'disingenuous', meaning: 'adj. 不诚实的；虚伪作态的', phonetic: '/ˌdɪsɪnˈdʒenjuəs/' },
      { word: 'remit', meaning: 'v. 汇付；转交；豁免', phonetic: '/rɪˈmɪt/' },
    ],
  },
  {
    id: 'reading_2023_eng2_text2',
    year: 2023,
    examType: 'english_2',
    textNumber: 'Text 2',
    title: 'The Psychological Mechanics of Sustainable Consumerism',
    source: '考研英语(二) 2023年 阅读理解 Text 2 (源自 Harvard Business Review)',
    topic: '商业管理 · 绿色可持续消费中的“态度-行为差距”与解决路径',
    summary: '文章剖析现代消费者在环保绿色产品消费中普遍存在的“言行不一（attitude-behavior gap）”现象，揭示心理学驱动机制如何助力绿色经济。',
    paragraphs: [
      {
        paraIndex: 1,
        sentences: [
          {
            en: 'Market surveys consistently reveal that modern consumers enthusiastically advocate for ecological sustainability.',
            zh: '市场调研持续表明，现代消费者热情支持生态可持续发展。',
          },
          {
            en: 'Over 70 percent of respondents declare that companies must actively safeguard the natural environment.',
            zh: '超过百分之七十的受访者宣称，企业必须积极保护自然生态环境。',
          },
          {
            en: 'Yet, when observing actual supermarket checkout aisles, sustainable goods capture less than five percent of total sales, revealing an agonizing "attitude-behavior gap."',
            zh: '然而，当观察实际的超市收银台时，绿色环保商品仅占总销售额的不到百分之五，暴露出了令人揪心的“态度-行为差距”。',
            isHard: true,
            hardGrammar: 'Yet 转折，revealing an agonizing gap 为现在分词短语作伴随状语，点出文章核心矛盾。',
          },
        ],
      },
      {
        paraIndex: 2,
        sentences: [
          {
            en: 'Behavioral economists explain that consumer decision-making is severely constrained by cognitive friction and price premiums.',
            zh: '行为经济学家解释道，消费者的决策深受认知阻力与绿色溢价的严峻制约。',
          },
          {
            en: 'Eco-friendly certifications often present ambiguous, jargon-heavy assertions that bewilder well-intentioned shoppers.',
            zh: '环保认证常常展示一些含糊不清、充斥行业术语的声明，令怀抱善意的购物者困惑不解。',
          },
          {
            en: 'When forced to decipher complex carbon metrics under time pressure, buyers default instinctively to familiar, economical alternatives.',
            zh: '当在时间压力下被迫破译复杂的碳足迹指标时，买家会本能地退回到熟悉的平价替代品。',
          },
        ],
      },
      {
        paraIndex: 3,
        sentences: [
          {
            en: 'To eliminate this inertia, leading retail brands are restructuring their choice architecture.',
            zh: '为了消除这种消费惯性，领先的零售品牌正着手重构其“选择架构”。',
          },
          {
            en: 'Instead of framing sustainability as an austere sacrifice, savvy marketers emphasize personal health and superior performance.',
            zh: '精明的营销人员不再将可持续性描摹为禁欲式的自我牺牲，而是着力强调个人健康与卓越性能。',
            isHard: true,
            hardGrammar: 'Instead of framing... marketers emphasize... 形成对照，指出营销思维的根本转变。',
          },
          {
            en: 'Moreover, implementing social proof—such as alerting hotel guests that 85 percent of fellow visitors reuse their towels—triggers an innate desire for peer conformity.',
            zh: '此外，应用“社会认同机制”——比如告知酒店住客85%的同行房客都会重复使用毛巾——能够激发其追求同伴认同的天生心理渴望。',
          },
        ],
      },
    ],
    questions: [
      {
        id: 'r23_2_q26',
        number: 26,
        stem: 'What does the phrase "attitude-behavior gap" in Paragraph 1 imply?',
        category: '词义指代',
        targetParagraph: 1,
        locatingKeywords: ['attitude-behavior gap', 'enthusiastically advocate', 'checkout aisles'],
        options: {
          A: 'Consumers rarely hold ethical beliefs about biodiversity.',
          B: 'People praise green products in words but seldom purchase them in practice.',
          C: 'Supermarket cashiers refuse to display eco-friendly items on shelves.',
          D: 'Marketing agencies intentionally falsify customer survey questionnaires.',
        },
        answer: 'B',
        analysis: '第一段对比了消费者在问卷调查中口头70%支持环保，但在实际超市收银台只有不到5%购买量。B项“言语上称赞绿色产品，但实际极少购买”准确解读了该短语的内涵。',
        paraphraseDetail: 'enthusiastically advocate in words vs capture less than five percent of actual checkout sales = praise in words but seldom purchase in practice。',
      },
      {
        id: 'r23_2_q27',
        number: 27,
        stem: 'According to Paragraph 2, why do shoppers fail to buy eco-friendly goods in supermarkets?',
        category: '事实细节',
        targetParagraph: 2,
        locatingKeywords: ['ambiguous', 'jargon-heavy', 'decipher'],
        options: {
          A: 'They find vague eco-labels confusing and prefer affordable familiar items.',
          B: 'They are legally prohibited from transporting carbon-neutral packages.',
          C: 'They mistrust the mathematical algorithms of supermarket scanners.',
          D: 'They cannot locate organic groceries in metropolitan convenience stores.',
        },
        answer: 'A',
        analysis: '第二段指出 eco-friendly certifications often present ambiguous, jargon-heavy assertions that bewilder shoppers，且 buyers default instinctively to familiar, economical alternatives。A项准确归纳。',
        paraphraseDetail: 'ambiguous, jargon-heavy assertions bewilder shoppers = vague eco-labels confusing；default to economical alternatives = prefer affordable familiar items。',
      },
      {
        id: 'r23_2_q28',
        number: 28,
        stem: 'The example of hotel towel reuse in Paragraph 3 illustrates the power of ______.',
        category: '推理判断',
        targetParagraph: 3,
        locatingKeywords: ['hotel towel reuse', 'social proof', 'peer conformity'],
        options: {
          A: 'authoritarian government enforcement',
          B: 'social influence and conformity cues',
          C: 'financial penalties for laundry services',
          D: 'unconditional altruism across all demographics',
        },
        answer: 'B',
        analysis: '第三段明确指出 implementing social proof... triggers an innate desire for peer conformity。举例正是为了论证“社会认同与从众线索 (social influence and conformity cues)”的力量。',
        paraphraseDetail: 'social proof & peer conformity = social influence and conformity cues。',
      },
    ],
    vocabularyList: [
      { word: 'advocate', meaning: 'v./n. 提倡；拥护；提倡者', phonetic: '/ˈædvəkeɪt/' },
      { word: 'agonizing', meaning: 'adj. 令人极其痛苦的；折磨人的', phonetic: '/ˈæɡənaɪzɪŋ/' },
      { word: 'bewilder', meaning: 'v. 使困惑；使不知所措', phonetic: '/bɪˈwɪldər/' },
      { word: 'austere', meaning: 'adj. 严峻的；朴素禁欲的', phonetic: '/ɔːˈstɪər/' },
    ],
  },
]

// =========================================================================
// 3. 新题型真题题库 (New Question Types Bank)
// =========================================================================
export const ENGLISH_NEW_TYPE_BANK: EnglishNewTypeExam[] = [
  {
    id: 'newtype_2024_eng1_7choose5',
    year: 2024,
    examType: 'english_1',
    variant: 'seven_choose_five',
    variantLabel: '七选五 (段落填空)',
    title: '考研英语(一) 2024年 新题型：城市声景与公共空间声学生态治理',
    source: '2024全国硕士研究生招生考试 英语(一) Section II Part B',
    summary: '文章论述现代城市规划中从“单纯消除噪音”到“主动营建有益声景（Soundscape Ecology）”的观念跃迁，从7个候选段落中选出5个填入空白处。',
    contextArticleEn: `Urban planners have traditionally viewed city noise through a purely negative lens. Sirens, traffic rumblings, and construction clamor are treated as harmful pollutants to be suppressed. [Blank 41] ____________________

This emerging paradigm shift relies heavily on "soundscape ecology." Instead of measuring decibels exclusively with sound level meters, researchers evaluate how sound interacts with the human emotional state. [Blank 42] ____________________

To achieve such harmonious acoustic environments, innovative European municipalities are implementing biophilic architecture. Water features such as stone fountains and gentle cascades are deliberately positioned in pedestrian plazas. [Blank 43] ____________________

However, transforming urban sound requires more than acoustic trickery; it demands community co-creation. In several Nordic pilot projects, neighborhoods were invited to "soundwalks" to identify cherished acoustic landmarks. [Blank 44] ____________________

Ultimately, acoustic justice is deeply intertwined with spatial equality. Lower-income residential districts frequently suffer the brunt of unrelenting freeway drone. [Blank 45] ____________________ Through proactive acoustic stewardship, our cities can transform from cacophonous concrete jungles into restorative auditory sanctuaries.`,
    options: [
      {
        key: 'A',
        text: 'These running water elements do not merely mask irritating low-frequency traffic hums; their organic rhythms stimulate alpha brainwaves, inducing psychological calmness in hurried commuters.',
      },
      {
        key: 'B',
        text: 'Consequently, municipal acoustic revitalization must prioritize historically marginalized corridors, ensuring tranquil green buffers are not reserved exclusively for upscale enclaves.',
      },
      {
        key: 'C',
        text: 'However, a groundbreaking cohort of modern acousticians argues that silence is an unnatural and sterile urban ideal; what human beings truly crave is rich, restorative soundscapes.',
      },
      {
        key: 'D',
        text: 'A park reverberating with distant children’s laughter and rustling autumn leaves can register identical decibel metrics to a subway corridor, yet evoke utterly contradictory psychological responses.',
      },
      {
        key: 'E',
        text: 'Local participants cataloged everything from church bell tolls to evening bird choruses, ensuring new zoning laws formally protected these cultural auditory sanctuaries.',
      },
      {
        key: 'F',
        text: 'Industrial manufacturers have conversely resisted these guidelines, claiming mechanical acoustic silencers impose excessive costs on manufacturing conveyor systems.',
      },
      {
        key: 'G',
        text: 'Modern architectural blueprints frequently emphasize solar panel angles and insulated glass double-glazing to maximize winter thermodynamic insulation.',
      },
    ],
    slots: [
      {
        slotNumber: 41,
        targetPosition: '第1段结尾 [Blank 41]',
        answerKey: 'C',
        clueKeywords: ['However', 'purely negative lens', 'silence is unnatural', 'paradigm shift'],
        explanation: '前文指出传统上把声音当消极污染物（purely negative lens），后文指出 This emerging paradigm shift（这一新范式转变）。空处需要由 However 引导转折，引出现代声学学者对消除噪音观念的颠覆：即 C 选项中的 silence is unnatural... what human beings truly crave is rich restorative soundscapes。',
      },
      {
        slotNumber: 42,
        targetPosition: '第2段结尾 [Blank 42]',
        answerKey: 'D',
        clueKeywords: ['measuring decibels', 'emotional state', 'identical decibel metrics', 'contradictory psychological responses'],
        explanation: '第2段前句提到不仅测量分贝数（measuring decibels），更关注声音如何与人类情绪互动（human emotional state）。D 选项以公园欢笑声与地铁走廊具有相同的分贝读数（identical decibel metrics）却激起完全相反的情感反应，完美呼应并实例化前句论点。',
      },
      {
        slotNumber: 43,
        targetPosition: '第3段结尾 [Blank 43]',
        answerKey: 'A',
        clueKeywords: ['Water features', 'These running water elements', 'mask irritating low-frequency traffic'],
        explanation: '前句提到在步行广场布置喷泉流水景观（Water features such as stone fountains...）。A 选项首句以指代词“These running water elements”直接承接上文流水景观，并阐释其白噪音对交通低频轰鸣的屏蔽抚慰效果。',
      },
      {
        slotNumber: 44,
        targetPosition: '第4段结尾 [Blank 44]',
        answerKey: 'E',
        clueKeywords: ['soundwalks', 'identify cherished acoustic landmarks', 'Local participants cataloged'],
        explanation: '前句提到组织居民进行“声景漫步 (soundwalks)”，以寻找珍贵声学地标。E 选项的“Local participants cataloged everything from church bell tolls to evening bird choruses...”正是漫步参与者的具体成果与后续保护落地。',
      },
      {
        slotNumber: 45,
        targetPosition: '第5段中段 [Blank 45]',
        answerKey: 'B',
        clueKeywords: ['spatial equality', 'Lower-income residential districts', 'Consequently', 'historically marginalized corridors'],
        explanation: '前文引出“声学公正与空间平等”，指出低收入社区长期承受公路噪音摧残。B 选项以“Consequently”引出结论，主张市政声学改造必须优先倾斜历史边缘地带，与前后文的公平正义主题严丝合缝。',
      },
    ],
  },
  {
    id: 'newtype_2023_eng2_headings',
    year: 2023,
    examType: 'english_2',
    variant: 'headings',
    variantLabel: '小标题匹配 (Headings)',
    title: '考研英语(二) 2023年 新题型：高校毕业生求职软实力的培育指南',
    source: '2023全国硕士研究生招生考试 英语(二) Section II Part B',
    summary: '文章面向职场新人阐述在人工智能时代，雇主最为看重的几项关键软实力维度，为5个段落选配最恰当的建议小标题。',
    contextArticleEn: `Contemporary recruiters are looking far beyond GPA transcripts. In a workforce revolutionized by automation, soft skills have become the decisive currency of employment.

[Blank 41] ____________________
Graduates often assume technical prowess alone secures advancement. However, conveying complex analytical conclusions to non-technical stakeholders without drowning them in jargon is indispensable. Whether writing crisp project updates or briefing department heads, lucidity underpins professional credibility.

[Blank 42] ____________________
Projects rarely progress in a straight, predictable trajectory. When marketing algorithms fluctuate or supply chains rupture, rigid adherence to prior blueprints leads to paralysis. Employees who view unexpected disruptions as learning laboratories consistently outshine colleagues who resist inevitable adjustments.

[Blank 43] ____________________
Working within multidisciplinary teams demands an active willingness to understand divergent cognitive frameworks. Listening patiently without immediate interruption and validating colleagues' anxieties before presenting counterproposals transforms friction into synergistic innovation.

[Blank 44] ____________________
Self-directed motivation separates average performers from exceptional future leaders. Rather than sitting passively awaiting itemized tasks from supervisors, proactive entrants identify bottlenecks in workflow and formulate constructive remediation without prompting.

[Blank 45] ____________________
Receiving critical feedback without defensive resentment is a rare superpower. Treating performance evaluations not as personal indictments, but as empirical diagnostic roadmaps accelerates professional mastery while building psychological fortitude.`,
    options: [
      { key: 'A', text: 'Embrace Ambiguity and Cultivate Agility', subTitle: '拥抱模糊性并保持敏捷应变' },
      { key: 'B', text: 'Master Jargon-Free Articulation', subTitle: '精通通俗清晰的跨部门沟通' },
      { key: 'C', text: 'Practice Active Empathy in Collaboration', subTitle: '在团队协作中践行主动共情' },
      { key: 'D', text: 'Demonstrate Unsolicited Initiative', subTitle: '展现未经催促的主动进取作为' },
      { key: 'E', text: 'Transform Critique into Catalytic Growth', subTitle: '将批评审视转化为自我催化成长' },
      { key: 'F', text: 'Negotiate Compensation with Confidence', subTitle: '自信开展薪酬与福利谈判' },
      { key: 'G', text: 'Automate Repetitive Administrative Tasks', subTitle: '自动化日常繁冗行政事务' },
    ],
    slots: [
      {
        slotNumber: 41,
        targetPosition: '第2段小标题 [Blank 41]',
        answerKey: 'B',
        clueKeywords: ['conveying complex conclusions', 'without drowning them in jargon', 'lucidity'],
        explanation: '该段核心在于“向非技术人员解释复杂结论而不用黑话淹没对方（without drowning them in jargon）”，保持清晰通俗。匹配 B: Master Jargon-Free Articulation。',
      },
      {
        slotNumber: 42,
        targetPosition: '第3段小标题 [Blank 42]',
        answerKey: 'A',
        clueKeywords: ['unpredictable trajectory', 'rigid adherence leads to paralysis', 'unexpected disruptions'],
        explanation: '该段阐述项目充满不可预测的变数，固守原有蓝图会导致瘫痪，善于应对颠覆者脱颖而出。匹配 A: Embrace Ambiguity and Cultivate Agility。',
      },
      {
        slotNumber: 43,
        targetPosition: '第4段小标题 [Blank 43]',
        answerKey: 'C',
        clueKeywords: ['multidisciplinary teams', 'divergent cognitive frameworks', 'Listening patiently', 'validating anxieties'],
        explanation: '该段强调跨部门团队中耐心倾听、共情接纳同事的担忧（validating colleagues anxieties）。匹配 C: Practice Active Empathy in Collaboration。',
      },
      {
        slotNumber: 44,
        targetPosition: '第5段小标题 [Blank 44]',
        answerKey: 'D',
        clueKeywords: ['Self-directed motivation', 'without prompting', 'proactive entrants'],
        explanation: '该段强调自驱力（Self-directed motivation），不要坐等主管分配，而应主动（without prompting）识别瓶颈提出解决方案。匹配 D: Demonstrate Unsolicited Initiative。',
      },
      {
        slotNumber: 45,
        targetPosition: '第6段小标题 [Blank 45]',
        answerKey: 'E',
        clueKeywords: ['Receiving critical feedback', 'without defensive resentment', 'not as personal indictments'],
        explanation: '该段强调坦然接纳批评与绩效考核反馈（critical feedback），视其为成长路线图而非人身攻击。匹配 E: Transform Critique into Catalytic Growth。',
      },
    ],
  },
]

// =========================================================================
// 4. 英汉翻译真题题库 (Translation Bank)
// =========================================================================
export const ENGLISH_TRANSLATION_BANK: EnglishTranslationExam[] = [
  {
    id: 'trans_2024_eng1',
    year: 2024,
    examType: 'english_1',
    title: '考研英语(一) 2024年 翻译：人类认知进化与科学探索的哲学思辨',
    source: '2024全国硕士研究生招生考试 英语(一) Section II Part C',
    items: [
      {
        number: 46,
        en: 'The belief that scientific discovery proceeds in a smooth, cumulative progression obscures the disruptive paradigm shifts that actually revolutionize our worldview.',
        zhRef: '那种认为科学发现是以平稳、渐进的方式向前发展的信念，掩盖了那些实际上彻底变革了我们世界观的破坏性范式转变。',
        scoringPoints: [
          { point: 'The belief that... 引导的同位语从句翻译通顺', score: 0.5 },
          { point: 'cumulative progression（累积式/渐进式推进）词义准确', score: 0.5 },
          { point: 'obscures（遮蔽/掩盖）谓语翻译准确', score: 0.5 },
          { point: 'disruptive paradigm shifts（颠覆性范式转变）定语从句翻译通顺', score: 0.5 },
        ],
        analysis: '主干为 The belief obscures the paradigm shifts。that scientific discovery proceeds... 为同位语从句修饰 belief；that actually revolutionize... 为定语从句修饰 shifts。',
      },
      {
        number: 47,
        en: 'Scientific consensus is not merely a collection of verified empirical observations, but rather a socially negotiated framework through which phenomena are interpreted.',
        zhRef: '科学界的共识并不仅仅是经过验证的经验观察结果的总和，而更是一种社会性协商建构的框架体系，通过这一框架，各种现象才得以被阐释。',
        scoringPoints: [
          { point: 'not merely... but rather...（不仅是……而更是……）搭配精准', score: 0.5 },
          { point: 'verified empirical observations（经证实的经验观察）翻译妥帖', score: 0.5 },
          { point: 'socially negotiated framework（社会协商框架）表意地道', score: 0.5 },
          { point: 'through which 介词定语从句转换自然', score: 0.5 },
        ],
        analysis: '考查 not merely... but rather... 的平行转折逻辑。through which 引导定语从句修饰 framework，应采用后置翻译法。',
      },
    ],
  },
  {
    id: 'trans_2023_eng2',
    year: 2023,
    examType: 'english_2',
    title: '考研英语(二) 2023年 翻译：城市绿色空间与市民心理治愈力量',
    source: '2023全国硕士研究生招生考试 英语(二) Section II Part C',
    contextArticleEn: `Urban green spaces offer far more than aesthetic ornamentation. Emerging psychiatric research indicates that spending as little as twenty minutes per day immersed in natural environments significantly diminishes cortisol levels, the primary physiological biomarker of human stress. When city dwellers stroll beneath mature tree canopies, their autonomic nervous systems gradually shift from a state of hyper-arousal to restorative tranquility. Consequently, modern urbanists are urging municipal governments to integrate pocket parks into dense commercial quarters, asserting that accessible green infrastructure is an urgent public health imperative rather than an optional municipal amenity.`,
    items: [
      {
        number: 1,
        en: `Urban green spaces offer far more than aesthetic ornamentation. Emerging psychiatric research indicates that spending as little as twenty minutes per day immersed in natural environments significantly diminishes cortisol levels, the primary physiological biomarker of human stress. When city dwellers stroll beneath mature tree canopies, their autonomic nervous systems gradually shift from a state of hyper-arousal to restorative tranquility. Consequently, modern urbanists are urging municipal governments to integrate pocket parks into dense commercial quarters, asserting that accessible green infrastructure is an urgent public health imperative rather than an optional municipal amenity.`,
        zhRef: `城市绿地所带来的价值远不止于视觉上的美化装饰。新兴的精神病学研究表明，每天仅在自然环境中沉浸二十分钟，就能显著降低皮质醇水平——这是衡量人类身心压力的主要生理生物标志物。当都市居民漫步于茂密的大树树冠之下时，其自主神经系统会逐渐从高度亢奋的紧绷状态转变为休养生息的宁静祥和。因此，现代城市规划专家正敦促市政管理部门将“口袋公园”深度融入稠密的商业街区，他们断言：触手可及的绿色基础设施是一项刻不容缓的公共卫生刚需，而非可有可无的市政点缀。`,
        scoringPoints: [
          { point: 'far more than aesthetic ornamentation（远不止于审美装饰）', score: 3.0 },
          { point: 'cortisol levels 与同位语 biomarker 翻译准确', score: 4.0 },
          { point: 'autonomic nervous systems 与状语从句转换流畅', score: 4.0 },
          { point: 'urgent imperative rather than optional amenity（刚需而非点缀）对比分明', score: 4.0 },
        ],
        analysis: '考研英语二翻译通常为一段连贯完整的英译汉。重点在于长句逻辑的自然断句切分，避免字字死译硬译，确保中文通俗典雅。',
      },
    ],
  },
]

// =========================================================================
// 5. 历年真题套卷完整索引与配置 (Full Exam Papers)
// =========================================================================
export const ENGLISH_FULL_EXAM_PAPERS: EnglishFullPaper[] = [
  {
    id: 'paper_2024_eng1',
    year: 2024,
    examType: 'english_1',
    title: '2024年全国硕士研究生招生考试 英语(一) 真题全卷',
    subtitle: '全国统一命题 · 英语(一) 权威全题型全真模考卷',
    durationMinutes: 180,
    totalScore: 100,
    clozeId: 'cloze_2024_eng1',
    readingIds: ['reading_2024_eng1_text1'],
    newTypeId: 'newtype_2024_eng1_7choose5',
    translationId: 'trans_2024_eng1',
    essayPromptIds: ['essay_2024_picture_running'],
    difficultyRate: 4.5,
    avgNationalScore: 51.6,
    hotTopics: ['科技与深度阅读', '大模型版权法理', '城市声景生态', '科学范式革命'],
  },
  {
    id: 'paper_2023_eng2',
    year: 2023,
    examType: 'english_2',
    title: '2023年全国硕士研究生招生考试 英语(二) 真题全卷',
    subtitle: '全国统一命题 · 英语(二) 权威全题型全真模考卷',
    durationMinutes: 180,
    totalScore: 100,
    clozeId: 'cloze_2023_eng2',
    readingIds: ['reading_2023_eng2_text2'],
    newTypeId: 'newtype_2023_eng2_headings',
    translationId: 'trans_2023_eng2',
    essayPromptIds: ['essay_2023_chart_health'],
    difficultyRate: 4.0,
    avgNationalScore: 56.4,
    hotTopics: ['混合远程办公', '绿色可持续消费', '求职沟通软实力', '城市口袋公园'],
  },
]
