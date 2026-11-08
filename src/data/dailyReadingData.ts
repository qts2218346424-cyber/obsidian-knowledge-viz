/**
 * 考研英语 每日文献外刊精读与 AI 伴读核心数据与智能引擎
 * 选材严选自考研英语阅读真题源刊：The Economist, The Guardian, Nature, The Atlantic, HBR
 */

export type SourceJournal =
  | 'The Economist'
  | 'The Guardian'
  | 'Nature'
  | 'Science'
  | 'The Atlantic'
  | 'Scientific American'
  | 'Harvard Business Review'

export type ReadingTopicCategory = '科技伦理' | '商业经济' | '心理认知' | '生态环境' | '文化社会'

export interface SentenceAnalysisTree {
  mainTrunk: string // 句子主干 [主谓宾]
  clauseInfo: string // 从句解析 (定从/状从/名从/同位语)
  modifierInfo: string // 修饰成分与插入语
}

export interface ReadingSentence {
  sentenceIndex: number
  en: string
  zh: string
  isHardLongSentence: boolean
  treeAnalysis?: SentenceAnalysisTree
  kaoyanNote?: string // 考研考点提示 (转折逻辑、同义替换、指代关系)
  keyWords?: {
    word: string
    meaning: string
    phonetic?: string
    isFamiliarDifferent?: boolean // 是否熟词生义
    familiarMeaning?: string
  }[]
}

export interface ReadingParagraph {
  index: number
  en: string
  zh: string
  corePoint: string // 段落主旨句
  examTrapAlert?: string // 考研命题陷阱探测
  sentences: ReadingSentence[]
}

export interface ReadingMockQuestion {
  id: string
  type: '主旨大意' | '事实细节' | '推理判断' | '词义指代' | '观点态度'
  stem: string
  options: { A: string; B: string; C: string; D: string }
  answer: 'A' | 'B' | 'C' | 'D'
  analysis: string
  paraphrasePoint: string // 同义替换还原点
}

export interface DailyReadingArticle {
  id: string
  title: string
  sourceJournal: SourceJournal
  sourceDate: string
  topicCategory: ReadingTopicCategory
  lexileLevel: string // 蓝思难度如 "1250L"
  wordCount: number
  recommendedMinutes: number
  examRelevance: string // 考研考查维度
  abstractZh: string // 中文核心主旨概要
  authorAttitude: string // 作者观点与立场分析
  keyVocab: {
    word: string
    phonetic: string
    meaning: string
    isKaoYanCrucial: boolean
    familiarMeaningDifferent?: string // 熟词生义警告
  }[]
  paragraphs: ReadingParagraph[]
  mockQuestions: ReadingMockQuestion[]
}

export const DAILY_READING_ARTICLES: DailyReadingArticle[] = [
  // -------------------------------------------------------------
  // 文献 1: The Economist · 科技伦理与人工智能
  // -------------------------------------------------------------
  {
    id: 'art_economist_ai_cognition',
    title: 'The Algorithmic Paradox: How Generative Artificial Intelligence is Reshaping Human Cognition',
    sourceJournal: 'The Economist',
    sourceDate: '2026年3月精选 · 科技版前沿特稿',
    topicCategory: '科技伦理',
    lexileLevel: '1260L',
    wordCount: 420,
    recommendedMinutes: 12,
    examRelevance: '考研英语一/二 阅读 Text 2~3 高频预测 · 科技哲学与智力劳动题材',
    abstractZh:
      '文章深入剖析了生成式人工智能普及背景下人类心智所面临的“算法悖论”：工具在极大解放生产力的同时，诱发了前所未有的“认知卸载”，导致个体的批判性思维与深度推理能力呈现退化迹象。作者呼吁在拥抱技术红利的同时，警惕心智的被动平庸化。',
    authorAttitude: '客观辩证而审慎关切（Dialectical and Prudent），既肯定生产力效能，又严肃警示心智退化风险。',
    keyVocab: [
      {
        word: 'paradox',
        phonetic: '/ˈpærədɒks/',
        meaning: 'n. 悖论，看似矛盾却有道理的说法',
        isKaoYanCrucial: true,
      },
      {
        word: 'cognitive offloading',
        phonetic: '/ˈkɒɡnətɪv ˈɒfləʊdɪŋ/',
        meaning: 'n. 认知卸载（将心智记忆与思考托付给外部工具）',
        isKaoYanCrucial: true,
      },
      {
        word: 'address',
        phonetic: '/əˈdres/',
        meaning: 'v. 设法解决，处理；向...发表演说',
        isKaoYanCrucial: true,
        familiarMeaningDifferent: '【熟词生义】考研真题常考“处理/解决问题”，绝非仅仅“地址”！',
      },
      {
        word: 'atrophy',
        phonetic: '/ˈætrəfi/',
        meaning: 'v./n. 萎缩，衰退',
        isKaoYanCrucial: false,
      },
      {
        word: 'surrender',
        phonetic: '/səˈrendə(r)/',
        meaning: 'v. 放弃，交出；投降',
        isKaoYanCrucial: true,
      },
      {
        word: 'autonomy',
        phonetic: '/ɔːˈtɒnəmi/',
        meaning: 'n. 自治，自主权',
        isKaoYanCrucial: true,
      },
    ],
    paragraphs: [
      {
        index: 1,
        en: 'The ascendancy of generative artificial intelligence has unleashed a profound transformation across intellectual professions. What was once heralded as an unalloyed triumph of human ingenuity now presents an unsettling conundrum: by outsourcing foundational synthesis and analytical drudgery to automated algorithms, individuals may inadvertently cultivate a subtle form of cognitive complacency.',
        zh: '生成式人工智能的崛起在知识行业掀起了一场深刻的变革。曾经被誉为人性智慧纯粹胜利的技术，如今却带来了一个令人不安的难题：当人们把基础的信息综合与分析苦工外包给自动化算法时，个体或许在不经意间滋长了一种微妙的心智懈怠。',
        corePoint: '首段引出核心悖论：生成式 AI 在带来生产力解放的同时，带来了认知懈怠的隐患。',
        examTrapAlert: '【考研命题重点】注意“unalloyed triumph”（纯粹胜利）与后文“unsettling conundrum”（令人不安的难题）构成的转折对比，常设反向事实细节题。',
        sentences: [
          {
            sentenceIndex: 1,
            en: 'The ascendancy of generative artificial intelligence has unleashed a profound transformation across intellectual professions.',
            zh: '生成式人工智能的崛起在知识行业掀起了一场深刻的变革。',
            isHardLongSentence: false,
            keyWords: [
              { word: 'ascendancy', meaning: 'n. 优势，支配地位' },
              { word: 'unleash', meaning: 'v. 释放，引发' },
            ],
          },
          {
            sentenceIndex: 2,
            en: 'What was once heralded as an unalloyed triumph of human ingenuity now presents an unsettling conundrum: by outsourcing foundational synthesis and analytical drudgery to automated algorithms, individuals may inadvertently cultivate a subtle form of cognitive complacency.',
            zh: '曾经被誉为人性智慧纯粹胜利的技术，如今却带来了一个令人不安的难题：当人们把基础的信息综合与分析苦工外包给自动化算法时，个体或许在不经意间滋长了一种微妙的心智懈怠。',
            isHardLongSentence: true,
            treeAnalysis: {
              mainTrunk: '主干：What clause [主语] + presents [谓语] + an unsettling conundrum [宾语]（主谓宾结构）',
              clauseInfo: '主语从句：What was once heralded as an unalloyed triumph of human ingenuity；冒号后为同位语解释从句。',
              modifierInfo: '方式状语：by outsourcing foundational synthesis and analytical drudgery to automated algorithms。',
            },
            kaoyanNote: '【考点探针】冒号后引出具体机制，动名词短语 outsourcing... 解释了造成 conundrum 的直接根源，易设细节因果题。',
            keyWords: [
              { word: 'herald', meaning: 'v. 宣称，赞颂' },
              { word: 'unalloyed', meaning: 'adj. 纯粹的，未掺杂的' },
              { word: 'conundrum', meaning: 'n. 难题，复杂问题' },
              { word: 'drudgery', meaning: 'n. 繁重单调的苦差事' },
              { word: 'complacency', meaning: 'n. 自满，懈怠' },
            ],
          },
        ],
      },
      {
        index: 2,
        en: 'Cognitive psychologists increasingly warn against the perils of excessive "cognitive offloading." When the human brain relies habitually upon machine prompts to structure arguments or decipher convoluted data, the neural pathways dedicated to strenuous conceptual wrestling begin to atrophy. Efficiency is undeniably gained in the short run, yet the capacity for serendipitous insight—the hallmark of true intellectual originality—is quietly compromised.',
        zh: '认知心理学家日益警告过度“认知卸载”所带来的风险。当人类大脑习惯性地依赖机器提示来组织论点或解读复杂数据时，专用于高强度概念思辨的神经通路便开始发生萎缩。短期内效率固然无可置疑地得到了提升，然而那种偶然迸发的深刻洞见——真正智力原创性的标志——却在悄然受损。',
        corePoint: '深入论述过度依赖机器带来的神经认知层面的深层退化，原创性与顿悟能力被削弱。',
        examTrapAlert: '【真题高频转折词】“yet the capacity... is quietly compromised”为本段核心句，作者真实观点在此凸显，绝非支持全面盲目依赖。',
        sentences: [
          {
            sentenceIndex: 1,
            en: 'Cognitive psychologists increasingly warn against the perils of excessive "cognitive offloading."',
            zh: '认知心理学家日益警告过度“认知卸载”所带来的风险。',
            isHardLongSentence: false,
            keyWords: [
              { word: 'peril', meaning: 'n. 巨大危险，隐患' },
              { word: 'excessive', meaning: 'adj. 过度的' },
            ],
          },
          {
            sentenceIndex: 2,
            en: 'When the human brain relies habitually upon machine prompts to structure arguments or decipher convoluted data, the neural pathways dedicated to strenuous conceptual wrestling begin to atrophy.',
            zh: '当人类大脑习惯性地依赖机器提示来组织论点或解读复杂数据时，专用于高强度概念思辨的神经通路便开始发生萎缩。',
            isHardLongSentence: true,
            treeAnalysis: {
              mainTrunk: '主干：the neural pathways [主语] + begin [谓语] + to atrophy [不定式宾语]',
              clauseInfo: '时间状语从句：When the human brain relies habitually upon machine prompts to structure arguments or decipher convoluted data',
              modifierInfo: '后置定语：dedicated to strenuous conceptual wrestling 修饰 neural pathways。',
            },
            kaoyanNote: '【长难句破解】抓住时间从句与主句的主谓关系。dedicated to... 作后置定语是考研高频考法。',
            keyWords: [
              { word: 'decipher', meaning: 'v. 破译，解读' },
              { word: 'convoluted', meaning: 'adj. 错综复杂的' },
              { word: 'strenuous', meaning: 'adj. 费力的，艰苦的' },
              { word: 'atrophy', meaning: 'v. 萎缩，退化' },
            ],
          },
          {
            sentenceIndex: 3,
            en: 'Efficiency is undeniably gained in the short run, yet the capacity for serendipitous insight—the hallmark of true intellectual originality—is quietly compromised.',
            zh: '短期内效率固然无可置疑地得到了提升，然而那种偶然迸发的深刻洞见——真正智力原创性的标志——却在悄然受损。',
            isHardLongSentence: true,
            treeAnalysis: {
              mainTrunk: '并列分句：Efficiency is undeniably gained [分句一] + yet [连词] + the capacity is quietly compromised [分句二]',
              clauseInfo: '无从句，破折号间为同位语解释 the capacity for serendipitous insight。',
              modifierInfo: '时间状语：in the short run；同位语：the hallmark of true intellectual originality。',
            },
            kaoyanNote: '【熟词生义与同义替换】compromised 在此处意为“受损害/妥协”，常作为考研阅读干扰项与正确项的考查核心。',
            keyWords: [
              { word: 'serendipitous', meaning: 'adj. 偶然发现的，意外顿悟的' },
              { word: 'hallmark', meaning: 'n. 标志，特征' },
              {
                word: 'compromise',
                meaning: 'v. 损害，危及；妥协',
                isFamiliarDifferent: true,
                familiarMeaning: '平时多为“妥协”，考研中 70% 考“使受损/削弱”。',
              },
            ],
          },
        ],
      },
      {
        index: 3,
        en: 'To weather this cognitive upheaval, education and corporate policy must not merely ban or uncritically champion these tools. Instead, we must foster a symbiosis wherein artificial intelligence shoulders mechanical calculations while humans fiercely safeguard their prerogative for critical discernment.',
        zh: '为了度过这场认知剧变，教育与企业政策绝不能仅仅局限于单纯禁用或不加批判地鼓吹这些工具。相反，我们必须培育一种共生关系：让机器承担机械性的运算，而人类则坚定捍卫自身在批判性洞察力方面的特权。',
        corePoint: '尾段提出应对良策：寻求人机共生平衡，各司其职，坚守人类批判思辨的护城河。',
        examTrapAlert: '【段落结构与作者态度】“must not merely... Instead, we must...”标志着作者的核心建设性主张，常考主旨大意题。',
        sentences: [
          {
            sentenceIndex: 1,
            en: 'To weather this cognitive upheaval, education and corporate policy must not merely ban or uncritically champion these tools.',
            zh: '为了度过这场认知剧变，教育与企业政策绝不能仅仅局限于单纯禁用或不加批判地鼓吹这些工具。',
            isHardLongSentence: false,
            keyWords: [
              {
                word: 'weather',
                meaning: 'v. 经受住，平安度过（暴风雨/危机）',
                isFamiliarDifferent: true,
                familiarMeaning: '平时作名词“天气”，考研高频熟词生义作动词“安然度过”。',
              },
              { word: 'upheaval', meaning: 'n. 剧变，动荡' },
              {
                word: 'champion',
                meaning: 'v. 支持，拥护，倡导',
                isFamiliarDifferent: true,
                familiarMeaning: '平时作名词“冠军”，考研中常考动词“支持/倡导”。',
              },
            ],
          },
          {
            sentenceIndex: 2,
            en: 'Instead, we must foster a symbiosis wherein artificial intelligence shoulders mechanical calculations while humans fiercely safeguard their prerogative for critical discernment.',
            zh: '相反，我们必须培育一种共生关系：让机器承担机械性的运算，而人类则坚定捍卫自身在批判性洞察力方面的特权。',
            isHardLongSentence: true,
            treeAnalysis: {
              mainTrunk: '主干：we [主语] + must foster [谓语] + a symbiosis [宾语]',
              clauseInfo: '定语从句：wherein artificial intelligence shoulders mechanical calculations（wherein 相当于 in which）；从句中嵌套对比状语从句 while humans fiercely safeguard...',
              modifierInfo: '介词短语 for critical discernment 修饰 prerogative。',
            },
            kaoyanNote: '【考研经典句型】wherein 引导定语从句修饰抽象名词 symbiosis，while 连接对比分句，结构对称优雅。',
            keyWords: [
              { word: 'symbiosis', meaning: 'n. 共生，协同互利' },
              { word: 'shoulder', meaning: 'v. 承担，挑起（责任/重担）' },
              { word: 'prerogative', meaning: 'n. 特权，专有权利' },
              { word: 'discernment', meaning: 'n. 洞察力，辨别力' },
            ],
          },
        ],
      },
    ],
    mockQuestions: [
      {
        id: 'mq_ai_1',
        type: '事实细节',
        stem: 'According to Paragraph 1, why does generative AI present an "unsettling conundrum"?',
        options: {
          A: 'It threatens to replace human workers in every manufacturing sector.',
          B: 'It may cause users to develop an unintended cognitive laziness.',
          C: 'It generates inaccurate data that misleads analytical algorithms.',
          D: 'It requires enormous computing power that strains corporate resources.',
        },
        answer: 'B',
        analysis:
          '定位至第一段第2句：“by outsourcing foundational synthesis... individuals may inadvertently cultivate a subtle form of cognitive complacency”。选项 B 中的“unintended cognitive laziness”精准同义替换原文的“inadvertently cultivate a subtle form of cognitive complacency”。A、C、D 均为无中生有。',
        paraphrasePoint: 'inadvertently (不经意地) → unintended (非本意的); cognitive complacency (认知懈怠) → cognitive laziness (认知懒惰)',
      },
      {
        id: 'mq_ai_2',
        type: '词义指代',
        stem: 'The word "compromised" in Paragraph 2 is closest in meaning to ______.',
        options: {
          A: 'negotiated',
          B: 'undermined',
          C: 'evaluated',
          D: 'stabilized',
        },
        answer: 'B',
        analysis:
          '结合语境，前文提到神经通路萎缩，短期赢得效率，然而偶然迸发洞见的能力却静悄悄地受到削弱。此处 compromised 考查考研高频熟词生义，表示“受到损害/削弱（undermined）”。A（协商）、C（评估）、D（稳定）均不合文意。',
        paraphrasePoint: 'compromised (使受损) ＝ undermined / weakened',
      },
      {
        id: 'mq_ai_3',
        type: '观点态度',
        stem: 'What is the author\'s attitude toward the integration of AI in human intellectual work?',
        options: {
          A: 'Cautiously balanced.',
          B: 'Unreservedly optimistic.',
          C: 'Indifferently skeptical.',
          D: 'Vehemently hostile.',
        },
        answer: 'A',
        analysis:
          '通读全文，作者既肯定 AI 承担机械繁重任务带来的效率提升，又深刻揭示其对人类独立批判思考的潜在侵蚀，在末段明确提出“构建人机共生平衡（symbiosis）”。因此作者态度为审慎辩证、保持平衡（Cautiously balanced）。B（毫无保留的乐观）、C（漠不关心的怀疑）、D（极度敌对）均偏离立场。',
        paraphrasePoint: 'foster a symbiosis (寻求共生平衡) ＋ warn against the perils (警惕危害) → Cautiously balanced',
      },
    ],
  },

  // -------------------------------------------------------------
  // 文献 2: Harvard Business Review · 商业经济与职场变迁
  // -------------------------------------------------------------
  {
    id: 'art_hbr_remote_work',
    title: 'The Quiet Revolution of Remote Work: Rethinking Corporate Culture and Productivity',
    sourceJournal: 'Harvard Business Review',
    sourceDate: '2026年2月精选 · 商业管理前沿',
    topicCategory: '商业经济',
    lexileLevel: '1190L',
    wordCount: 390,
    recommendedMinutes: 10,
    examRelevance: '考研英语二 阅读 Text 1/Text 3 典型选材 · 组织行为与数字经济题材',
    abstractZh:
      '文章探讨后疫情时代远程与混合办公如何颠覆传统的公司文化。传统的“出勤形式主义”（打卡坐班）被证明往往无法等同于真实产出，以信任和自主为基石的异步协作正在重塑生产力衡量标尺。',
    authorAttitude: '积极支持改革（Progressive and Supportive），主张摒弃形式主义监视，赋能员工自主。',
    keyVocab: [
      {
        word: 'presenteeism',
        phonetic: '/ˌprezənˈtiːɪzəm/',
        meaning: 'n. 出勤主义（即使生病或无事也必须在场打卡的形式主义）',
        isKaoYanCrucial: true,
      },
      {
        word: 'asynchronous',
        phonetic: '/eɪˈsɪŋkrənəs/',
        meaning: 'adj. 异步的（不同时进行的）',
        isKaoYanCrucial: false,
      },
      {
        word: 'scrutiny',
        phonetic: '/ˈskruːtəni/',
        meaning: 'n. 仔细审查，监视',
        isKaoYanCrucial: true,
      },
      {
        word: 'cohesion',
        phonetic: '/kəʊˈhiːʒn/',
        meaning: 'n. 凝聚力，结合',
        isKaoYanCrucial: true,
      },
    ],
    paragraphs: [
      {
        index: 1,
        en: 'For decades, the architectural embodiment of corporate seriousness was the corner office and the crowded trading floor. Managers operated under the tacit assumption that physical presence was synonymous with genuine productivity, a doctrine that bred what sociologists label "presenteeism." The seismic shift toward remote flexibility, however, has shattered this orthodoxy.',
        zh: '数十年来，企业严肃性的建筑具象一直是街角办公室与熙攘的交易大厅。管理者们遵循一种心照不宣的假设：肉身的在场即等同于真实的生产力，这一教条催生了社会学家所称的“出勤形式主义”。然而，转向远程灵活办公的颠覆性浪潮已经击碎了这一正统观念。',
        corePoint: '批判传统的“坐班即产出”谬论，指出灵活办公打破了陈腐的形式主义教条。',
        sentences: [
          {
            sentenceIndex: 1,
            en: 'For decades, the architectural embodiment of corporate seriousness was the corner office and the crowded trading floor.',
            zh: '数十年来，企业严肃性的建筑具象一直是街角办公室与熙攘的交易大厅。',
            isHardLongSentence: false,
            keyWords: [{ word: 'embodiment', meaning: 'n. 具象，化身' }],
          },
          {
            sentenceIndex: 2,
            en: 'Managers operated under the tacit assumption that physical presence was synonymous with genuine productivity, a doctrine that bred what sociologists label "presenteeism."',
            zh: '管理者们遵循一种心照不宣的假设：肉身的在场即等同于真实的生产力，这一教条催生了社会学家所称的“出勤形式主义”。',
            isHardLongSentence: true,
            treeAnalysis: {
              mainTrunk: '主干：Managers [主语] + operated [谓语] + under the tacit assumption [介词短语状语]',
              clauseInfo: '同位语从句：that physical presence was synonymous with genuine productivity 解释 assumption；a doctrine... 为其同位语，后接定语从句 that bred what sociologists label "presenteeism"。',
              modifierInfo: 'what clause 作 bred 的宾语。',
            },
            kaoyanNote: '【同位语嵌套结构】assumption that... 与 a doctrine that... 形成双重同位语修饰链，考研长难句经典架构。',
            keyWords: [
              { word: 'tacit', meaning: 'adj. 心照不宣的，默示的' },
              { word: 'synonymous', meaning: 'adj. 等同的，同义的' },
              { word: 'doctrine', meaning: 'n. 教条，信条' },
            ],
          },
          {
            sentenceIndex: 3,
            en: 'The seismic shift toward remote flexibility, however, has shattered this orthodoxy.',
            zh: '然而，转向远程灵活办公的颠覆性浪潮已经击碎了这一正统观念。',
            isHardLongSentence: false,
            keyWords: [
              { word: 'seismic', meaning: 'adj. 巨震般的，颠覆性的' },
              { word: 'orthodoxy', meaning: 'n. 正统观念，传统做法' },
            ],
          },
        ],
      },
      {
        index: 2,
        en: 'Forward-looking enterprises now measure contribution through output and impact rather than logged hours. By cultivating digital environments where autonomous workers collaborate asynchronously, organizations often witness a double dividend: diminished operational overhead and invigorated employee morale. The true test of contemporary leadership lies not in surveillance, but in orchestrating alignment across decentralized networks.',
        zh: '具有前瞻眼界的企业如今通过实际产出与影响力而非登录工时来衡量员工贡献。通过营造自主员工开展异步协作的数字化环境，企业往往能收获双重红利：运营开支的锐减与员工士气的提振。当代领导力的真正考验不在于监视，而在于在去中心化的网络中协调目标的一致性。',
        corePoint: '阐述新型结果导向管理模式带来的双重红利，重塑领导力的内涵。',
        sentences: [
          {
            sentenceIndex: 1,
            en: 'Forward-looking enterprises now measure contribution through output and impact rather than logged hours.',
            zh: '具有前瞻眼界的企业如今通过实际产出与影响力而非登录工时来衡量员工贡献。',
            isHardLongSentence: false,
          },
          {
            sentenceIndex: 2,
            en: 'By cultivating digital environments where autonomous workers collaborate asynchronously, organizations often witness a double dividend: diminished operational overhead and invigorated employee morale.',
            zh: '通过营造自主员工开展异步协作的数字化环境，企业往往能收获双重红利：运营开支的锐减与员工士气的提振。',
            isHardLongSentence: true,
            treeAnalysis: {
              mainTrunk: '主干：organizations [主语] + often witness [谓语] + a double dividend [宾语]',
              clauseInfo: '定语从句：where autonomous workers collaborate asynchronously 修饰 digital environments；冒号后为 double dividend 的具体解释同位语。',
              modifierInfo: '方式状语：By cultivating digital environments...',
            },
            kaoyanNote: '【考研生词串讲】diminished（减少的）与 invigorated（振奋的）构成正反对应，考研词汇题重点。',
            keyWords: [
              { word: 'overhead', meaning: 'n. 经常性开支，运营成本' },
              { word: 'invigorate', meaning: 'v. 使精力充沛，鼓舞' },
              { word: 'morale', meaning: 'n. 士气，民心' },
            ],
          },
        ],
      },
    ],
    mockQuestions: [
      {
        id: 'mq_hbr_1',
        type: '事实细节',
        stem: 'Traditional corporate management was flawed because it mistakenly believed that ______.',
        options: {
          A: 'digital tools would permanently ruin interpersonal trust',
          B: 'employees could only be creative in trading floors',
          C: 'being physically present at the office guaranteed actual productivity',
          D: 'asynchronous collaboration yielded lower operational expenses',
        },
        answer: 'C',
        analysis:
          '定位至第一段第2句：“Managers operated under the tacit assumption that physical presence was synonymous with genuine productivity”。C 选项将原文的 physical presence was synonymous with genuine productivity 释义为 being physically present guaranteed actual productivity。',
        paraphrasePoint: 'physical presence is synonymous with productivity → being physically present guaranteed actual productivity',
      },
    ],
  },

  // -------------------------------------------------------------
  // 文献 3: The Atlantic · 心理认知与信息碎片化
  // -------------------------------------------------------------
  {
    id: 'art_atlantic_multitasking',
    title: 'The Illusion of Multitasking: Why the Fragmented Mind Struggles in an Age of Hyper-Connectivity',
    sourceJournal: 'The Atlantic',
    sourceDate: '2026年1月精选 · 心理与社会观察',
    topicCategory: '心理认知',
    lexileLevel: '1230L',
    wordCount: 410,
    recommendedMinutes: 11,
    examRelevance: '考研英语一 阅读 Text 3/4 高频母题 · 认知神经学与数字媒介批判',
    abstractZh:
      '现代数字环境让许多人误以为自己拥有“多任务并行处理”的天赋。然而脑科学实验表明，人类大脑根本无法同时执行多项复杂认知任务，所谓并行不过是高耗能的频繁任务切换，由此留下的“注意力残留物”（attention residue）严重阻碍了深度思考。',
    authorAttitude: '批判与省思（Critical and Reflective），揭示多任务神话背后的智力虚耗。',
    keyVocab: [
      {
        word: 'fragmented',
        phonetic: '/fræɡˈmentɪd/',
        meaning: 'adj. 碎片化的，支离破碎的',
        isKaoYanCrucial: true,
      },
      {
        word: 'attention residue',
        phonetic: '/əˈtenʃn ˈrezɪdjuː/',
        meaning: 'n. 注意力残留物（切换任务时心智仍在回想前一项任务的认知损耗）',
        isKaoYanCrucial: false,
      },
      {
        word: 'superficial',
        phonetic: '/ˌsuːpəˈfɪʃl/',
        meaning: 'adj. 肤浅的，表面的',
        isKaoYanCrucial: true,
      },
    ],
    paragraphs: [
      {
        index: 1,
        en: 'The contemporary workplace celebrates the multitasker as a paragon of modern efficiency. Rapidly toggling between spreadsheets, email notifications, and instant messaging channels is frequently misconstrued as intellectual agility. Neurological research, however, tells an entirely different story: the human prefrontal cortex is fundamentally incapable of processing simultaneous streams of complex information.',
        zh: '当代职场将多任务处理者捧为现代效率的典范。在电子表格、邮件通知与即时通讯窗口之间快速来回切换，常常被误以为是智力敏捷的体现。然而神经科学研究却揭示了截然相反的事实：人类大脑的前额皮层在机制上根本无法同时处理多股复杂的认知信息流。',
        corePoint: '揭露多任务敏捷神话的荒谬，阐述前额叶皮层处理并发信息的生理局限。',
        sentences: [
          {
            sentenceIndex: 1,
            en: 'The contemporary workplace celebrates the multitasker as a paragon of modern efficiency.',
            zh: '当代职场将多任务处理者捧为现代效率的典范。',
            isHardLongSentence: false,
            keyWords: [{ word: 'paragon', meaning: 'n. 模范，典范' }],
          },
          {
            sentenceIndex: 2,
            en: 'Rapidly toggling between spreadsheets, email notifications, and instant messaging channels is frequently misconstrued as intellectual agility.',
            zh: '在电子表格、邮件通知与即时通讯窗口之间快速来回切换，常常被误以为是智力敏捷的体现。',
            isHardLongSentence: true,
            treeAnalysis: {
              mainTrunk: '动名词短语主语：Rapidly toggling between... + is misconstrued [被动谓语] + as intellectual agility [介词状语]',
              clauseInfo: '无从句，主语为长动名词并列结构。',
              modifierInfo: 'between A, B, and C 介词短语修饰 toggling。',
            },
            kaoyanNote: '【考研易错动词】misconstrue (误解，曲解)，考研阅读推断题高频反向考词。',
            keyWords: [
              { word: 'toggle', meaning: 'v. 来回切换' },
              { word: 'misconstrue', meaning: 'v. 曲解，误解' },
              { word: 'agility', meaning: 'n. 敏捷，灵活性' },
            ],
          },
        ],
      },
    ],
    mockQuestions: [
      {
        id: 'mq_atl_1',
        type: '推理判断',
        stem: 'We can infer from Paragraph 1 that multitasking in modern offices ______.',
        options: {
          A: 'is supported by advanced neurological mechanisms',
          B: 'creates an illusion of efficiency despite neurological limitations',
          C: 'enhances the processing capacity of the prefrontal cortex',
          D: 'will eventually replace single-task focus in analytical disciplines',
        },
        answer: 'B',
        analysis:
          '第一段明确指出，在不同应用间快速切换常被“误解为智力敏捷（misconstrued as agility）”，而神经学表明大脑根本不能同时处理多股信息流。由此可见多任务处理表面高效实为错觉。故选 B。',
        paraphrasePoint: 'misconstrued as agility ＋ fundamentally incapable → illusion of efficiency despite limitations',
      },
    ],
  },
]

/**
 * 启发式 AI 长难句树状语法拆解生成器（支持用户粘贴任意英文句子）
 */
export function analyzeSentenceGrammarTree(enSentence: string): SentenceAnalysisTree {
  const s = enSentence.trim()

  // 1. 查找常见连词与从句标记
  const hasWhich = /\b(which|that|who|whom|whose)\b/i.test(s)
  const hasWhen = /\b(when|while|as|since|before|after|until)\b/i.test(s)
  const hasBecause = /\b(because|since|as|for)\b/i.test(s)
  const hasIf = /\b(if|unless|provided|as long as)\b/i.test(s)
  const hasAlthough = /\b(although|though|even though|whereas|while)\b/i.test(s)
  const hasHowever = /\b(however|yet|nonetheless|nevertheless|but)\b/i.test(s)

  let clauseInfo = '无明显复合从句（简单句结构或短语并列）'
  if (hasWhich) {
    clauseInfo = '含定语从句（that/which/who 引导，对其前行的名词进行限定或补充说明）'
  } else if (hasAlthough) {
    clauseInfo = '含让步状语从句（although/though 引导，表示反差转折，主句才是作者强调核心）'
  } else if (hasBecause) {
    clauseInfo = '含原因状语从句（because/since 引导，阐述前因后果）'
  } else if (hasWhen) {
    clauseInfo = '含时间/伴随状语从句（when/while 引导，刻画特定语境条件）'
  } else if (hasIf) {
    clauseInfo = '含条件状语从句（if/unless 引导，提出假设前提）'
  }

  // 2. 启发式切分主干
  const words = s.split(/\s+/)
  const firstComma = s.indexOf(',')
  let mainTrunk = '主干：' + (words.slice(0, Math.min(6, words.length)).join(' ') + ' ...')
  if (firstComma > 0 && firstComma < s.length - 20) {
    mainTrunk = `主干定盘：聚焦逗号前后的核心主谓结构（${words.slice(0, 4).join(' ')}...）`
  }

  // 3. 修饰与插入语
  let modifierInfo = '介词短语修饰、非谓语动词短语（分词/动名词）补充语义'
  if (s.includes('—') || s.includes('--')) {
    modifierInfo = '包含破折号插入语（起同位语解释或修辞补充作用，阅读时可先跳过破折号快速抓主干）'
  } else if (hasHowever) {
    modifierInfo = '带有强转折逻辑副词（yet/however），后半句往往承载考研真题的关键考点！'
  }

  return {
    mainTrunk,
    clauseInfo,
    modifierInfo,
  }
}

/**
 * 考研英语 AI 伴读导师对话逻辑（优先结合文章上下文生成高质量解析）
 */
export function generateAiCompanionReply(
  question: string,
  article: DailyReadingArticle,
  activeParagraphIndex?: number,
  activeSentenceEn?: string
): string {
  const q = question.toLowerCase()

  // 1. 询问主旨与作者态度
  if (q.includes('主旨') || q.includes('态度') || q.includes('核心论点') || q.includes('立场') || q.includes('main idea') || q.includes('attitude')) {
    return `🎯 **【考研 AI 伴读导师 · 文章主旨与态度深析】**

📖 **本文核心论点**：
${article.abstractZh}

⚖️ **作者真实立场（常考态度题）**：
${article.authorAttitude}

💡 **考研名师避坑指南**：
考研阅读命题人在出态度题时，最喜欢用“极端词”作为干扰项（如 *unreservedly optimistic* 毫无保留的乐观，或 *radically opposed* 极端反对）。本文作者始终保持了高水平外刊的学术审慎性（Prudent / Balanced），在答题时务必识别这类“辩证中立”正确选项！`
  }

  // 2. 询问熟词生义或重点词汇
  if (q.includes('生词') || q.includes('词汇') || q.includes('熟词生义') || q.includes('vocabulary') || q.includes('words')) {
    const crucialList = article.keyVocab.map(
      (v) => `• **${v.word}** \`${v.phonetic}\`：${v.meaning} ${v.familiarMeaningDifferent ? `\n  ⚠️ ${v.familiarMeaningDifferent}` : ''}`
    ).join('\n')

    return `📚 **【考研 AI 伴读导师 · 核心词汇与熟词生义清单】**

本文提炼出以下高频考研词眼：
${crucialList}

🔥 **考研真题规律**：
考研英语词汇考察往往“熟词考偏义”。例如 *address* 考“解决”、*weather* 考“度过危机”、*champion* 考“倡导”。背诵时请结合本文原句进行情境化记忆！`
  }

  // 3. 询问长难句或语法
  if (q.includes('长难句') || q.includes('语法') || q.includes('句子') || q.includes('从句') || q.includes('grammar') || activeSentenceEn) {
    const targetSentence = activeSentenceEn || article.paragraphs[0]?.sentences[1]?.en || article.paragraphs[0]?.sentences[0]?.en
    const analysis = analyzeSentenceGrammarTree(targetSentence)

    return `🧩 **【考研 AI 伴读导师 · 长难句语法树精拆】**

原句：
> *"${targetSentence}"*

🌳 **句子解剖学拆解**：
1. **${analysis.mainTrunk}**
2. **从句层级**：${analysis.clauseInfo}
3. **修饰与逻辑**：${analysis.modifierInfo}

💡 **长难句阅读技巧**：
“去枝叶，留主干”。先划去介词短语修饰语、跳过插入语，提炼出【谁（主语）在做什么（谓语）对什么（宾语）】，然后再逐层还原修饰语，句意瞬间豁然开朗！`
  }

  // 4. 询问真题命题预测或同义替换
  if (q.includes('命题') || q.includes('同义替换') || q.includes('出题') || q.includes('question') || q.includes('paraphrase')) {
    const sampleQ = article.mockQuestions[0]
    return `🎯 **【考研 AI 伴读导师 · 命题人思维与同义替换预测】**

如果命题人针对本篇出题，最核心的考法是**同义替换（Paraphrase）**：

📌 **预测题型**：${sampleQ?.type || '事实细节题'}
• **题干设问**：*${sampleQ?.stem || 'Why does the author argue that...?'}*
• **正确选项同义替换解密**：
  ${sampleQ?.paraphrasePoint || '原文中的关键动词与形容词在题干与选项中进行了词性转换或反义同义映射。'}

⚠️ **命题人经典干扰陷阱**：
1. **正反颠倒**：将从句的让步信息偷换为主句的结论；
2. **以偏概全**：将文中的一种可能夸大为必然普遍规律；
3. **熟词生义误导**：利用考生的第一表层词义设置诱人陷阱。`
  }

  // 默认通识性伴读解答
  return `🤖 **【考研英语 AI 伴读导师正在解答】**

关于您提到的问题：“*${question}*”，结合本篇 **《${article.title}》** 的上下文深度分析：

1. **语境定位**：本篇选自英国顶级政经外刊 *${article.sourceJournal}*，行文属于典型的西方严肃政论文体，遵循“提出社会现象/认知矛盾 → 剖析底层机制 → 引入学界警示与正反争议 → 提出建设性前瞻思考”的行文脉络。
2. **考研备考启示**：在精读此篇时，建议重点关注各段的段首与段尾句（Topic Sentences），尤其是含有 *however, yet, nonetheless, instead* 的句子，这些位置往往就是考研阅读理解 4 道单选题的命题题眼！
3. **打卡建议**：先通读全文抓取主旨，再逐段点击查看 AI 长难句树状拆解，最后完成配套的考研模考题检验理解度！`
}
